//! Änderungsverlauf mit Rückgängig und tägliche Sicherungskopien der Datenbank.
//! Jede Änderung an Spielern und Spielen speichert den Stand davor und danach als JSON.

use std::path::{Path, PathBuf};

use axum::Json;
use axum::extract::{Path as UrlPath, State};
use rusqlite::{Connection, OptionalExtension, params};
use serde::Serialize;
use serde_json::Value;

use crate::auth::{Admin, User};
use crate::{ApiResult, Db, conflict, not_found};

/// Wie viele Einträge der Verlauf zeigt.
const LIST_LIMIT: i64 = 200;

pub fn record(
    conn: &Connection,
    user: &User,
    action: &str,
    entity: &str,
    entity_id: i64,
    before: Option<Value>,
    after: Option<Value>,
) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO audit (account_id, actor, action, entity, entity_id, before_json, after_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            user.id,
            user.name,
            action,
            entity,
            entity_id,
            before.map(|v| v.to_string()),
            after.map(|v| v.to_string())
        ],
    )?;
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditDto {
    id: i64,
    at: String,
    actor: String,
    action: String,
    entity: String,
    entity_id: i64,
    before: Option<Value>,
    after: Option<Value>,
    undone: bool,
}

pub async fn list(State(db): State<Db>, _: User) -> ApiResult<Json<Vec<AuditDto>>> {
    let conn = db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, at, actor, action, entity, entity_id, before_json, after_json, undone_at IS NOT NULL
         FROM audit ORDER BY id DESC LIMIT ?1",
    )?;
    let json = |s: Option<String>| s.and_then(|s| serde_json::from_str(&s).ok());
    let rows = stmt.query_map([LIST_LIMIT], |r| {
        Ok(AuditDto {
            id: r.get(0)?,
            at: r.get(1)?,
            actor: r.get(2)?,
            action: r.get(3)?,
            entity: r.get(4)?,
            entity_id: r.get(5)?,
            before: json(r.get(6)?),
            after: json(r.get(7)?),
            undone: r.get(8)?,
        })
    })?;
    Ok(Json(rows.collect::<Result<_, _>>()?))
}

/// Aktueller Stand eines Eintrags, so wie er im Verlauf gespeichert wird.
fn snapshot(conn: &Connection, entity: &str, id: i64) -> ApiResult<Option<Value>> {
    Ok(match entity {
        "game" => match crate::load_game(conn, id) {
            Ok(g) => Some(serde_json::to_value(g).expect("serialisierbar")),
            Err(e) if e.0 == axum::http::StatusCode::NOT_FOUND => None,
            Err(e) => return Err(e),
        },
        _ => {
            let exists: bool = conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM player WHERE id = ?1)",
                [id],
                |r| r.get(0),
            )?;
            if exists {
                Some(crate::player_snapshot(conn, id)?)
            } else {
                None
            }
        }
    })
}

/// Stellt den Stand vor einer Änderung wieder her. Nur, wenn danach niemand mehr daran gearbeitet hat.
pub async fn undo(
    State(db): State<Db>,
    Admin(admin): Admin,
    UrlPath(id): UrlPath<i64>,
) -> ApiResult<Json<Value>> {
    let mut conn = db.lock().unwrap();
    let tx = conn.transaction()?;
    type Row = (String, i64, Option<String>, Option<String>, bool);
    let row: Option<Row> = tx
        .query_row(
            "SELECT entity, entity_id, before_json, after_json, undone_at IS NOT NULL FROM audit WHERE id = ?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)),
        )
        .optional()?;
    let (entity, eid, before, after, undone) =
        row.ok_or_else(|| not_found("Diesen Eintrag gibt es nicht."))?;
    if undone {
        return Err(conflict("Das wurde schon rückgängig gemacht."));
    }
    let parse = |s: Option<String>| s.and_then(|s| serde_json::from_str::<Value>(&s).ok());
    let (before, after) = (parse(before), parse(after));
    let current = snapshot(&tx, &entity, eid)?;
    if current != after {
        return Err(conflict(
            "Das wurde danach nochmal geändert. Erst die neueren Änderungen rückgängig machen.",
        ));
    }
    match entity.as_str() {
        "game" => crate::restore_game(&tx, eid, before.as_ref())?,
        _ => crate::restore_player(&tx, eid, before.as_ref())?,
    }
    let now = snapshot(&tx, &entity, eid)?;
    record(&tx, &admin, "undo", &entity, eid, current, now.clone())?;
    tx.execute(
        "UPDATE audit SET undone_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1",
        [id],
    )?;
    tx.commit()?;
    Ok(Json(
        serde_json::json!({ "entity": entity, "entityId": eid, "state": now }),
    ))
}

/* ---------- Sicherungskopien ---------- */

/// Legt die Kopie für heute an (`ti4hub-JJJJ-MM-TT.db` in `dir`), falls es sie noch nicht gibt,
/// und behält nur die letzten `keep` Kopien.
pub fn backup(db: &Db, dir: &Path, keep: usize) -> std::io::Result<Option<PathBuf>> {
    std::fs::create_dir_all(dir)?;
    let today = chrono::Local::now().format("%Y-%m-%d");
    let file = dir.join(format!("ti4hub-{today}.db"));
    let created = if file.exists() {
        None
    } else {
        let conn = db.lock().unwrap();
        conn.execute("VACUUM INTO ?1", [file.to_string_lossy()])
            .map_err(std::io::Error::other)?;
        Some(file)
    };
    let mut old: Vec<PathBuf> = std::fs::read_dir(dir)?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .is_some_and(|n| n.starts_with("ti4hub-") && n.ends_with(".db"))
        })
        .collect();
    old.sort();
    let extra = old.len().saturating_sub(keep);
    for p in old.into_iter().take(extra) {
        let _ = std::fs::remove_file(p);
    }
    Ok(created)
}
