//! Hub-API für den TI4 Host-Leitfaden: Spieler und Sessions mit Fraktionen, Siegpunkten und Platzierungen.
//! Eine SQLite-Datei. Lesen darf jeder, Ändern nur mit Login (siehe `auth`), jede Änderung landet im Verlauf (`history`).
//! Fehler kommen als Problem Details (RFC 9457) mit deutschem `detail`.

pub mod auth;
pub mod history;

use std::path::Path;
use std::sync::{Arc, Mutex};

use axum::body::Bytes;
use axum::extract::{Path as UrlPath, State};
use axum::http::{HeaderValue, Method, StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::routing::{delete, post, put};
use axum::{Json, Router};
use chrono::NaiveDateTime;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tower_http::cors::CorsLayer;

use auth::{AppState, User};

const SCHEMA: &str = "
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS player (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE TABLE IF NOT EXISTS game (
    id            INTEGER PRIMARY KEY,
    scheduled_at  TEXT NOT NULL,
    location      TEXT,
    status        TEXT NOT NULL,
    points_to_win INTEGER NOT NULL,
    notes         TEXT,
    version       INTEGER NOT NULL DEFAULT 0,
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE TABLE IF NOT EXISTS participant (
    game_id        INTEGER NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    player_id      INTEGER NOT NULL REFERENCES player (id),
    seat           INTEGER NOT NULL,
    faction        TEXT,
    victory_points INTEGER,
    placement      INTEGER,
    PRIMARY KEY (game_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_participant_player ON participant (player_id);
CREATE TABLE IF NOT EXISTS account (
    id            INTEGER PRIMARY KEY,
    player_id     INTEGER NOT NULL UNIQUE REFERENCES player (id),
    role          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    last_seen     TEXT
);
CREATE TABLE IF NOT EXISTS session (
    token_hash TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE TABLE IF NOT EXISTS invite (
    token_hash TEXT PRIMARY KEY,
    player_id  INTEGER NOT NULL REFERENCES player (id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES account (id) ON DELETE SET NULL,
    expires_at TEXT NOT NULL,
    used_at    TEXT
);
CREATE TABLE IF NOT EXISTS setting (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit (
    id          INTEGER PRIMARY KEY,
    at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    account_id  INTEGER REFERENCES account (id) ON DELETE SET NULL,
    actor       TEXT NOT NULL,
    action      TEXT NOT NULL,
    entity      TEXT NOT NULL,
    entity_id   INTEGER NOT NULL,
    before_json TEXT,
    after_json  TEXT,
    undone_at   TEXT
);
";

const STALE: &str = "Jemand anderes hat dieses Spiel gerade geändert. Die Seite lädt den neuen Stand, bitte nochmal speichern.";

pub type Db = Arc<Mutex<Connection>>;

/// Öffnet (oder legt an) die Datenbank. `":memory:"` für Tests.
pub fn open(path: &str) -> rusqlite::Result<Db> {
    if path != ":memory:"
        && let Some(dir) = Path::new(path).parent()
    {
        let _ = std::fs::create_dir_all(dir);
    }
    let conn = Connection::open(path)?;
    conn.execute_batch(SCHEMA)?;
    Ok(Arc::new(Mutex::new(conn)))
}

/// `secure`: Cookie mit `Secure` erzwingen (`Some(true)`), verbieten (`Some(false)`) oder nach `X-Forwarded-Proto` (`None`).
pub fn app(db: Db, cors_origins: &[String], secure: Option<bool>) -> Router {
    let state = AppState::new(db, cors_origins, secure);
    let mut router = Router::new()
        .route(
            "/api/health",
            get(|| async { Json(json!({ "status": "UP" })) }),
        )
        .route("/api/players", get(list_players).post(create_player))
        .route(
            "/api/players/{id}",
            axum::routing::put(rename_player).delete(delete_player),
        )
        .route("/api/games", get(list_games).post(create_game))
        .route(
            "/api/games/{id}",
            get(get_game).put(update_game).delete(delete_game),
        )
        .route("/api/auth/me", get(auth::me))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/logout", post(auth::logout))
        .route("/api/auth/register", post(auth::register))
        .route(
            "/api/auth/invite/{token}",
            get(auth::invite_info).post(auth::invite_accept),
        )
        .route("/api/me", delete(auth::delete_me))
        .route("/api/me/password", put(auth::change_password))
        .route("/api/me/logout-all", post(auth::logout_everywhere))
        .route(
            "/api/admin/settings",
            get(auth::get_settings).put(auth::put_settings),
        )
        .route("/api/admin/accounts", get(auth::list_accounts))
        .route(
            "/api/admin/accounts/{id}",
            put(auth::set_role).delete(auth::delete_account),
        )
        .route("/api/admin/invites", post(auth::create_invite))
        .route("/api/audit", get(history::list))
        .route("/api/audit/{id}/undo", post(history::undo))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::same_site_only,
        ))
        .with_state(state);
    // Nur nötig, wenn Seite und API unter verschiedenen Adressen laufen (z. B. GitHub Pages + eigener Server).
    let origins: Vec<HeaderValue> = cors_origins.iter().filter_map(|o| o.parse().ok()).collect();
    if !origins.is_empty() {
        router = router.layer(
            CorsLayer::new()
                .allow_origin(origins)
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                .allow_headers([header::CONTENT_TYPE])
                .allow_credentials(true),
        );
    }
    router
}

/* ---------- Fehler ---------- */

#[derive(Debug)]
pub struct ApiError(pub(crate) StatusCode, pub(crate) String);

pub(crate) fn bad(msg: impl Into<String>) -> ApiError {
    ApiError(StatusCode::BAD_REQUEST, msg.into())
}
pub(crate) fn conflict(msg: impl Into<String>) -> ApiError {
    ApiError(StatusCode::CONFLICT, msg.into())
}
pub(crate) fn not_found(msg: impl Into<String>) -> ApiError {
    ApiError(StatusCode::NOT_FOUND, msg.into())
}

impl From<rusqlite::Error> for ApiError {
    fn from(e: rusqlite::Error) -> Self {
        eprintln!("Datenbankfehler: {e}");
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Interner Fehler in der Datenbank.".into(),
        )
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = json!({ "status": self.0.as_u16(), "title": self.0.canonical_reason(), "detail": self.1 });
        (
            self.0,
            [(header::CONTENT_TYPE, "application/problem+json")],
            body.to_string(),
        )
            .into_response()
    }
}

pub(crate) type ApiResult<T> = Result<T, ApiError>;

/// JSON lesen, Fehler aber als Problem Details statt axums Klartext.
pub(crate) fn parse<T: for<'de> Deserialize<'de>>(body: &Bytes) -> ApiResult<T> {
    serde_json::from_slice(body).map_err(|_| bad("Ungültige Eingabe."))
}

/* ---------- Spieler ---------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerDto {
    id: i64,
    name: String,
    /// Hat sich der Spieler schon registriert? Die Seite bietet beim Registrieren nur freie Spieler an.
    has_account: bool,
}

#[derive(Deserialize)]
pub(crate) struct PlayerRequest {
    pub(crate) name: Option<String>,
}

pub(crate) fn player_name(req: PlayerRequest) -> ApiResult<String> {
    let name = req.name.unwrap_or_default().trim().to_string();
    if name.is_empty() {
        return Err(bad("Bitte einen Namen eingeben."));
    }
    if name.chars().count() > 40 {
        return Err(bad("Der Name darf höchstens 40 Zeichen haben."));
    }
    Ok(name)
}

pub(crate) fn name_taken(conn: &Connection, name: &str, except: i64) -> rusqlite::Result<bool> {
    // lower() reicht für ASCII; Umlaute vergleicht SQLite ohnehin exakt.
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM player WHERE lower(name) = lower(?1) AND id <> ?2)",
        params![name, except],
        |r| r.get(0),
    )
}

async fn list_players(State(db): State<Db>) -> ApiResult<Json<Vec<PlayerDto>>> {
    let conn = db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, EXISTS(SELECT 1 FROM account a WHERE a.player_id = p.id)
         FROM player p ORDER BY p.name COLLATE NOCASE",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(PlayerDto {
            id: r.get(0)?,
            name: r.get(1)?,
            has_account: r.get(2)?,
        })
    })?;
    Ok(Json(rows.collect::<Result<_, _>>()?))
}

/// So steht ein Spieler im Verlauf.
pub(crate) fn player_snapshot(conn: &Connection, id: i64) -> rusqlite::Result<Value> {
    let name: String =
        conn.query_row("SELECT name FROM player WHERE id = ?1", [id], |r| r.get(0))?;
    Ok(json!({ "id": id, "name": name }))
}

fn has_account(conn: &Connection, player_id: i64) -> rusqlite::Result<bool> {
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM account WHERE player_id = ?1)",
        [player_id],
        |r| r.get(0),
    )
}

async fn create_player(
    State(db): State<Db>,
    user: User,
    body: Bytes,
) -> ApiResult<(StatusCode, Json<PlayerDto>)> {
    let name = player_name(parse(&body)?)?;
    let conn = db.lock().unwrap();
    if name_taken(&conn, &name, 0)? {
        return Err(conflict(format!(
            "Es gibt schon einen Spieler namens „{name}“."
        )));
    }
    conn.execute("INSERT INTO player (name) VALUES (?1)", [&name])?;
    let id = conn.last_insert_rowid();
    history::record(
        &conn,
        &user,
        "create",
        "player",
        id,
        None,
        Some(player_snapshot(&conn, id)?),
    )?;
    Ok((
        StatusCode::CREATED,
        Json(PlayerDto {
            id,
            name,
            has_account: false,
        }),
    ))
}

/// Umbenennen darf jeder sich selbst und Spieler ohne Account; Spieler mit Account nur der Admin.
async fn rename_player(
    State(db): State<Db>,
    user: User,
    UrlPath(id): UrlPath<i64>,
    body: Bytes,
) -> ApiResult<Json<PlayerDto>> {
    let name = player_name(parse(&body)?)?;
    let conn = db.lock().unwrap();
    let before = match conn
        .query_row("SELECT name FROM player WHERE id = ?1", [id], |r| {
            r.get::<_, String>(0)
        })
        .optional()?
    {
        Some(_) => player_snapshot(&conn, id)?,
        None => return Err(not_found(format!("Spieler {id} gibt es nicht."))),
    };
    let account = has_account(&conn, id)?;
    if account && id != user.player_id && !user.admin {
        return Err(auth::forbidden(
            "Spieler mit Account können sich nur selbst umbenennen.",
        ));
    }
    if name_taken(&conn, &name, id)? {
        return Err(conflict(format!(
            "Es gibt schon einen Spieler namens „{name}“."
        )));
    }
    conn.execute(
        "UPDATE player SET name = ?1 WHERE id = ?2",
        params![name, id],
    )?;
    history::record(
        &conn,
        &user,
        "update",
        "player",
        id,
        Some(before),
        Some(player_snapshot(&conn, id)?),
    )?;
    Ok(Json(PlayerDto {
        id,
        name,
        has_account: account,
    }))
}

/// Gründe, warum ein Spieler nicht gelöscht werden kann (in Spielen eingetragen oder mit Account).
fn player_in_use(conn: &Connection, id: i64, name: &str) -> ApiResult<()> {
    let games: i64 = conn.query_row(
        "SELECT count(*) FROM participant WHERE player_id = ?1",
        [id],
        |r| r.get(0),
    )?;
    if games > 0 {
        let word = if games == 1 { "Spiel" } else { "Spielen" };
        return Err(conflict(format!(
            "{name} ist in {games} {word} eingetragen und kann darum nicht gelöscht werden. Umbenennen geht."
        )));
    }
    if has_account(conn, id)? {
        return Err(conflict(format!(
            "{name} hat einen Account. Erst den Account löschen, dann den Spieler."
        )));
    }
    Ok(())
}

async fn delete_player(
    State(db): State<Db>,
    user: User,
    UrlPath(id): UrlPath<i64>,
) -> ApiResult<StatusCode> {
    let conn = db.lock().unwrap();
    let name: Option<String> = conn
        .query_row("SELECT name FROM player WHERE id = ?1", [id], |r| r.get(0))
        .optional()?;
    let Some(name) = name else {
        return Err(not_found(format!("Spieler {id} gibt es nicht.")));
    };
    player_in_use(&conn, id, &name)?;
    let before = player_snapshot(&conn, id)?;
    conn.execute("DELETE FROM invite WHERE player_id = ?1", [id])?;
    conn.execute("DELETE FROM player WHERE id = ?1", [id])?;
    history::record(&conn, &user, "delete", "player", id, Some(before), None)?;
    Ok(StatusCode::NO_CONTENT)
}

/// Rückgängig: Spieler auf einen früheren Stand setzen (`None` = gab es noch nicht).
pub(crate) fn restore_player(conn: &Connection, id: i64, state: Option<&Value>) -> ApiResult<()> {
    match state {
        None => {
            let name: String =
                conn.query_row("SELECT name FROM player WHERE id = ?1", [id], |r| r.get(0))?;
            player_in_use(conn, id, &name)?;
            conn.execute("DELETE FROM invite WHERE player_id = ?1", [id])?;
            conn.execute("DELETE FROM player WHERE id = ?1", [id])?;
        }
        Some(v) => {
            let name = v["name"].as_str().unwrap_or_default();
            if name_taken(conn, name, id)? {
                return Err(conflict(format!(
                    "Es gibt inzwischen einen anderen Spieler namens „{name}“."
                )));
            }
            conn.execute(
                "INSERT INTO player (id, name) VALUES (?1, ?2) ON CONFLICT(id) DO UPDATE SET name = ?2",
                params![id, name],
            )?;
        }
    }
    Ok(())
}

/* ---------- Spiele ---------- */

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantDto {
    player_id: Option<i64>,
    faction: Option<String>,
    victory_points: Option<i64>,
    placement: Option<i64>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameDto {
    id: i64,
    scheduled_at: String,
    location: Option<String>,
    status: String,
    points_to_win: i64,
    notes: Option<String>,
    version: i64,
    participants: Vec<ParticipantDto>,
}

/// Anlegen und Bearbeiten. Die Teilnehmerliste ersetzt die bisherige komplett.
/// `version` kommt aus dem zuletzt geladenen Stand; beim Anlegen weglassen.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct GameRequest {
    scheduled_at: Option<String>,
    location: Option<String>,
    status: Option<String>,
    points_to_win: Option<i64>,
    notes: Option<String>,
    version: Option<i64>,
    participants: Option<Vec<ParticipantDto>>,
}

/// Geprüfte Eingabe, bereit zum Speichern.
struct GameInput {
    scheduled_at: String,
    location: Option<String>,
    status: &'static str,
    points_to_win: i64,
    notes: Option<String>,
    participants: Vec<ParticipantDto>,
}

fn blank_to_none(s: Option<String>) -> Option<String> {
    s.map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

fn validate(req: GameRequest) -> ApiResult<GameInput> {
    let raw = req
        .scheduled_at
        .ok_or_else(|| bad("Bitte Datum und Uhrzeit angeben."))?;
    let at = NaiveDateTime::parse_from_str(&raw, "%Y-%m-%dT%H:%M:%S")
        .or_else(|_| NaiveDateTime::parse_from_str(&raw, "%Y-%m-%dT%H:%M"))
        .map_err(|_| bad("Bitte Datum und Uhrzeit angeben."))?;
    let status = match req.status.as_deref() {
        Some("PLANNED") => "PLANNED",
        Some("FINISHED") => "FINISHED",
        _ => return Err(bad("Bitte einen Status angeben.")),
    };
    let points_to_win = req.points_to_win.unwrap_or(10);
    if !(4..=20).contains(&points_to_win) {
        return Err(bad("Zwischen 4 und 20 Siegpunkten zum Sieg."));
    }
    let location = blank_to_none(req.location);
    if location.as_ref().is_some_and(|l| l.chars().count() > 80) {
        return Err(bad("Der Ort darf höchstens 80 Zeichen haben."));
    }
    let notes = blank_to_none(req.notes);
    if notes.as_ref().is_some_and(|n| n.chars().count() > 2000) {
        return Err(bad("Die Notiz darf höchstens 2000 Zeichen haben."));
    }
    let mut participants = req.participants.unwrap_or_default();
    if participants.len() > 8 {
        return Err(bad("Höchstens 8 Spieler pro Spiel."));
    }
    let mut players = std::collections::HashSet::new();
    let mut factions = std::collections::HashSet::new();
    for p in &mut participants {
        let id = p
            .player_id
            .ok_or_else(|| bad("Jeder Platz braucht einen Spieler."))?;
        if !players.insert(id) {
            return Err(bad("Ein Spieler ist doppelt eingetragen."));
        }
        p.faction = blank_to_none(p.faction.take());
        if let Some(f) = &p.faction {
            let ok = (2..=24).contains(&f.len())
                && f.bytes()
                    .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit());
            if !ok {
                return Err(bad("Unbekannte Fraktion."));
            }
            if !factions.insert(f.clone()) {
                return Err(bad(
                    "Eine Fraktion kann pro Spiel nur einmal gewählt werden.",
                ));
            }
        }
        if p.victory_points.is_some_and(|v| !(0..=30).contains(&v)) {
            return Err(bad("Siegpunkte zwischen 0 und 30, bitte prüfen."));
        }
        if p.placement.is_some_and(|v| !(1..=8).contains(&v)) {
            return Err(bad("Platzierungen von 1 bis 8."));
        }
    }
    if status == "FINISHED" {
        participants = with_placements(participants);
    } else {
        // Geplant: Ergebnisse gibt es noch nicht.
        for p in &mut participants {
            p.victory_points = None;
            p.placement = None;
        }
    }
    Ok(GameInput {
        scheduled_at: at.format("%Y-%m-%dT%H:%M:%S").to_string(),
        location,
        status,
        points_to_win,
        notes,
        participants,
    })
}

/// Fehlt bei einem gespielten Spiel irgendeine Platzierung, ergibt sich die ganze Reihenfolge aus den
/// Siegpunkten (mehr Punkte = besserer Platz, bei Gleichstand zählt die Reihenfolge der Liste).
/// Die Seite (hub.js) rechnet für den lokalen Modus genauso.
pub fn with_placements(list: Vec<ParticipantDto>) -> Vec<ParticipantDto> {
    if !list.is_empty() && list.iter().all(|p| p.placement.is_some()) {
        return list;
    }
    let mut order: Vec<usize> = (0..list.len()).collect();
    order.sort_by_key(|&i| std::cmp::Reverse(list[i].victory_points.unwrap_or(0))); // stabil
    let mut out = list;
    for (rank, i) in order.into_iter().enumerate() {
        out[i].placement = Some(rank as i64 + 1);
    }
    out
}

pub(crate) fn load_game(conn: &Connection, id: i64) -> ApiResult<GameDto> {
    let game = conn
        .query_row(
            "SELECT id, scheduled_at, location, status, points_to_win, notes, version FROM game WHERE id = ?1",
            [id],
            |r| {
                Ok(GameDto {
                    id: r.get(0)?,
                    scheduled_at: r.get(1)?,
                    location: r.get(2)?,
                    status: r.get(3)?,
                    points_to_win: r.get(4)?,
                    notes: r.get(5)?,
                    version: r.get(6)?,
                    participants: vec![],
                })
            },
        )
        .optional()?;
    let mut game = game.ok_or_else(|| not_found(format!("Spiel {id} gibt es nicht.")))?;
    let mut stmt = conn.prepare(
        "SELECT player_id, faction, victory_points, placement FROM participant WHERE game_id = ?1 ORDER BY seat",
    )?;
    game.participants = stmt
        .query_map([id], |r| {
            Ok(ParticipantDto {
                player_id: r.get(0)?,
                faction: r.get(1)?,
                victory_points: r.get(2)?,
                placement: r.get(3)?,
            })
        })?
        .collect::<Result<_, _>>()?;
    Ok(game)
}

fn save_participants(conn: &Connection, game_id: i64, list: &[ParticipantDto]) -> ApiResult<()> {
    conn.execute("DELETE FROM participant WHERE game_id = ?1", [game_id])?;
    let mut stmt = conn.prepare(
        "INSERT INTO participant (game_id, player_id, seat, faction, victory_points, placement) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )?;
    for (seat, p) in list.iter().enumerate() {
        let pid = p.player_id.unwrap_or_default();
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM player WHERE id = ?1)",
            [pid],
            |r| r.get(0),
        )?;
        if !exists {
            return Err(not_found(format!("Spieler {pid} gibt es nicht.")));
        }
        stmt.execute(params![
            game_id,
            pid,
            seat as i64,
            p.faction,
            p.victory_points,
            p.placement
        ])?;
    }
    Ok(())
}

/// Alle Spiele, neueste zuerst. Für eine Spielrunde unter Freunden reicht das ohne Paging.
async fn list_games(State(db): State<Db>) -> ApiResult<Json<Vec<GameDto>>> {
    let conn = db.lock().unwrap();
    let ids: Vec<i64> = conn
        .prepare("SELECT id FROM game ORDER BY scheduled_at DESC, id DESC")?
        .query_map([], |r| r.get(0))?
        .collect::<Result<_, _>>()?;
    Ok(Json(
        ids.into_iter()
            .map(|id| load_game(&conn, id))
            .collect::<Result<_, _>>()?,
    ))
}

async fn get_game(State(db): State<Db>, UrlPath(id): UrlPath<i64>) -> ApiResult<Json<GameDto>> {
    let conn = db.lock().unwrap();
    Ok(Json(load_game(&conn, id)?))
}

fn game_json(g: &GameDto) -> Value {
    serde_json::to_value(g).expect("serialisierbar")
}

async fn create_game(
    State(db): State<Db>,
    user: User,
    body: Bytes,
) -> ApiResult<(StatusCode, Json<GameDto>)> {
    let input = validate(parse(&body)?)?;
    let mut conn = db.lock().unwrap();
    let tx = conn.transaction()?;
    tx.execute(
        "INSERT INTO game (scheduled_at, location, status, points_to_win, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![input.scheduled_at, input.location, input.status, input.points_to_win, input.notes],
    )?;
    let id = tx.last_insert_rowid();
    save_participants(&tx, id, &input.participants)?;
    let game = load_game(&tx, id)?;
    history::record(
        &tx,
        &user,
        "create",
        "game",
        id,
        None,
        Some(game_json(&game)),
    )?;
    tx.commit()?;
    Ok((StatusCode::CREATED, Json(game)))
}

async fn update_game(
    State(db): State<Db>,
    user: User,
    UrlPath(id): UrlPath<i64>,
    body: Bytes,
) -> ApiResult<Json<GameDto>> {
    let req: GameRequest = parse(&body)?;
    let client_version = req.version;
    let input = validate(req)?;
    let mut conn = db.lock().unwrap();
    let tx = conn.transaction()?;
    let before = load_game(&tx, id)?;
    // Optimistisches Sperren: zwei gleichzeitige Bearbeitungen überschreiben sich nicht stillschweigend.
    if client_version.is_some_and(|v| v != before.version) {
        return Err(conflict(STALE));
    }
    tx.execute(
        "UPDATE game SET scheduled_at = ?1, location = ?2, status = ?3, points_to_win = ?4, notes = ?5,
             version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?6",
        params![input.scheduled_at, input.location, input.status, input.points_to_win, input.notes, id],
    )?;
    save_participants(&tx, id, &input.participants)?;
    let game = load_game(&tx, id)?;
    history::record(
        &tx,
        &user,
        "update",
        "game",
        id,
        Some(game_json(&before)),
        Some(game_json(&game)),
    )?;
    tx.commit()?;
    Ok(Json(game))
}

async fn delete_game(
    State(db): State<Db>,
    user: User,
    UrlPath(id): UrlPath<i64>,
) -> ApiResult<StatusCode> {
    let conn = db.lock().unwrap();
    let before = load_game(&conn, id)?;
    conn.execute("DELETE FROM game WHERE id = ?1", [id])?;
    history::record(
        &conn,
        &user,
        "delete",
        "game",
        id,
        Some(game_json(&before)),
        None,
    )?;
    Ok(StatusCode::NO_CONTENT)
}

/// Rückgängig: Spiel auf einen früheren Stand setzen (`None` = gab es noch nicht).
pub(crate) fn restore_game(conn: &Connection, id: i64, state: Option<&Value>) -> ApiResult<()> {
    let Some(v) = state else {
        conn.execute("DELETE FROM game WHERE id = ?1", [id])?;
        return Ok(());
    };
    let g: GameDto =
        serde_json::from_value(v.clone()).map_err(|_| bad("Alter Stand ist unlesbar."))?;
    conn.execute(
        "INSERT INTO game (id, scheduled_at, location, status, points_to_win, notes, version) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7 + 1)
         ON CONFLICT(id) DO UPDATE SET scheduled_at = ?2, location = ?3, status = ?4, points_to_win = ?5, notes = ?6,
             version = game.version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')",
        params![id, g.scheduled_at, g.location, g.status, g.points_to_win, g.notes, g.version],
    )?;
    save_participants(conn, id, &g.participants)
}
