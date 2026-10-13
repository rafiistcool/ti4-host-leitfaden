//! Accounts, Login und Admin-Bereich.
//! Jeder Account gehört zu genau einem Spieler; angemeldet wird mit Spielername und Passwort.
//! Lesen bleibt für alle offen, Ändern braucht einen Login. Registrieren geht nur mit dem Gruppencode,
//! den der Admin setzt und jederzeit abschalten kann. Den ersten Admin legt der Einrichtungscode an,
//! den die API beim Start ins Log schreibt, solange es keinen Admin gibt.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use axum::Json;
use axum::body::Bytes;
use axum::extract::{FromRef, FromRequestParts, Path as UrlPath, Request, State};
use axum::http::request::Parts;
use axum::http::{HeaderMap, HeaderValue, Method, StatusCode, header};
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use rand::RngCore;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};

use crate::{ApiError, ApiResult, Db, bad, conflict, history, not_found, parse, player_name};

const COOKIE: &str = "ti4_session";
/// Ohne Benutzung läuft eine Anmeldung nach 30 Tagen ab, jede Nutzung verlängert sie.
const SESSION_DAYS: i64 = 30;
const INVITE_DAYS: i64 = 7;
const NOW: &str = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

/* ---------- Zustand ---------- */

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    limiter: Arc<Mutex<HashMap<String, (Instant, u32)>>>,
    cors: Arc<Vec<String>>,
    /// `Some(true)`: Cookie immer mit `Secure`, `Some(false)`: nie, `None`: wenn die Anfrage über HTTPS kam.
    secure: Option<bool>,
}

impl AppState {
    pub fn new(db: Db, cors: &[String], secure: Option<bool>) -> Self {
        AppState {
            db,
            limiter: Arc::default(),
            cors: Arc::new(cors.to_vec()),
            secure,
        }
    }
}

impl FromRef<AppState> for Db {
    fn from_ref(s: &AppState) -> Db {
        s.db.clone()
    }
}

/* ---------- Bremse gegen Passwort-Raten ---------- */

const WINDOW: Duration = Duration::from_secs(15 * 60);

impl AppState {
    /// Zu viele Fehlversuche in den letzten 15 Minuten?
    fn blocked(&self, key: &str, max: u32) -> bool {
        let mut map = self.limiter.lock().unwrap_or_else(|e| e.into_inner());
        map.retain(|_, (since, _)| since.elapsed() < WINDOW);
        map.get(key).is_some_and(|(_, n)| *n >= max)
    }
    fn failed(&self, key: &str) {
        let mut map = self.limiter.lock().unwrap_or_else(|e| e.into_inner());
        let e = map.entry(key.to_string()).or_insert((Instant::now(), 0));
        e.1 += 1;
    }
    fn reset(&self, key: &str) {
        self.limiter
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .remove(key);
    }
}

const IP_MAX: u32 = 30;
const NAME_MAX: u32 = 10;

/// Adresse des Aufrufers. nginx hängt sie an X-Forwarded-For an, der letzte Eintrag ist der, den nginx gesehen hat.
fn client_ip(h: &HeaderMap) -> String {
    let ip = h
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.rsplit(',').next())
        .map(|s| s.trim().to_string())
        .unwrap_or_default();
    format!("ip:{ip}")
}

fn too_many() -> ApiError {
    ApiError(
        StatusCode::TOO_MANY_REQUESTS,
        "Zu viele Fehlversuche. Bitte in 15 Minuten nochmal probieren.".into(),
    )
}

/* ---------- Hilfen ---------- */

fn unauthorized() -> ApiError {
    ApiError(
        StatusCode::UNAUTHORIZED,
        "Bitte zuerst anmelden. Ohne Login ist der Hub nur zum Anschauen.".into(),
    )
}
pub(crate) fn forbidden(msg: impl Into<String>) -> ApiError {
    ApiError(StatusCode::FORBIDDEN, msg.into())
}

fn random_hex(bytes: usize) -> String {
    let mut buf = vec![0u8; bytes];
    rand::rng().fill_bytes(&mut buf);
    buf.iter().map(|b| format!("{b:02x}")).collect()
}

/// Gut lesbarer Code ohne verwechselbare Zeichen (0/O, 1/l/I).
fn random_code(len: usize) -> String {
    const ALPHA: &[u8] = b"abcdefghjkmnpqrstuvwxyz23456789";
    let mut buf = vec![0u8; len];
    rand::rng().fill_bytes(&mut buf);
    buf.iter()
        .map(|b| ALPHA[*b as usize % ALPHA.len()] as char)
        .collect()
}

fn sha256(s: &str) -> String {
    Sha256::digest(s.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

fn hash_password(pw: &str) -> ApiResult<String> {
    let mut salt = [0u8; 16];
    rand::rng().fill_bytes(&mut salt);
    let salt = SaltString::encode_b64(&salt).map_err(|_| internal())?;
    Argon2::default()
        .hash_password(pw.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|_| internal())
}

fn verify_password(pw: &str, hash: &str) -> bool {
    PasswordHash::new(hash)
        .is_ok_and(|h| Argon2::default().verify_password(pw.as_bytes(), &h).is_ok())
}

fn internal() -> ApiError {
    ApiError(StatusCode::INTERNAL_SERVER_ERROR, "Interner Fehler.".into())
}

fn check_password(pw: &str) -> ApiResult<()> {
    let n = pw.chars().count();
    if n < 8 {
        return Err(bad("Das Passwort braucht mindestens 8 Zeichen."));
    }
    if n > 200 {
        return Err(bad("Das Passwort darf höchstens 200 Zeichen haben."));
    }
    Ok(())
}

fn setting(conn: &Connection, key: &str) -> rusqlite::Result<Option<String>> {
    conn.query_row("SELECT value FROM setting WHERE key = ?1", [key], |r| {
        r.get(0)
    })
    .optional()
}
fn set_setting(conn: &Connection, key: &str, value: Option<&str>) -> rusqlite::Result<()> {
    match value {
        Some(v) => conn.execute(
            "INSERT INTO setting (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
            params![key, v],
        )?,
        None => conn.execute("DELETE FROM setting WHERE key = ?1", [key])?,
    };
    Ok(())
}

fn admin_count(conn: &Connection) -> rusqlite::Result<i64> {
    conn.query_row(
        "SELECT count(*) FROM account WHERE role = 'admin'",
        [],
        |r| r.get(0),
    )
}

/// Einrichtungscode für den ersten Admin. `None`, sobald es einen Admin gibt.
pub fn setup_code(db: &Db) -> rusqlite::Result<Option<String>> {
    let conn = db.lock().unwrap_or_else(|e| e.into_inner());
    if admin_count(&conn)? > 0 {
        set_setting(&conn, "setup_code", None)?;
        return Ok(None);
    }
    if let Some(code) = setting(&conn, "setup_code")? {
        return Ok(Some(code));
    }
    let code = random_code(12);
    set_setting(&conn, "setup_code", Some(&code))?;
    Ok(Some(code))
}

/// Codes ohne Rücksicht auf Groß-/Kleinschreibung und Leerzeichen vergleichen, in konstanter Zeit.
fn same_code(given: &str, expected: &str) -> bool {
    let norm = |s: &str| -> String {
        s.chars()
            .filter(|c| !c.is_whitespace())
            .flat_map(char::to_lowercase)
            .collect()
    };
    let (a, b) = (norm(given), norm(expected));
    if a.is_empty() || a.len() != b.len() {
        return false;
    }
    a.bytes()
        .zip(b.bytes())
        .fold(0u8, |acc, (x, y)| acc | (x ^ y))
        == 0
}

/* ---------- Angemeldeter Benutzer ---------- */

#[derive(Clone, Debug)]
pub struct User {
    pub id: i64,
    pub player_id: i64,
    pub name: String,
    pub admin: bool,
    session: String,
}

impl User {
    fn dto(&self) -> Value {
        json!({ "id": self.id, "playerId": self.player_id, "name": self.name, "role": if self.admin { "admin" } else { "member" } })
    }
}

fn session_token(h: &HeaderMap) -> Option<String> {
    h.get_all(header::COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .flat_map(|v| v.split(';'))
        .filter_map(|kv| kv.trim().split_once('='))
        .find(|(k, _)| *k == COOKIE)
        .map(|(_, v)| v.to_string())
        .filter(|v| v.len() == 64 && v.bytes().all(|b| b.is_ascii_hexdigit()))
}

fn session_user(conn: &Connection, token: &str) -> rusqlite::Result<Option<User>> {
    let hash = sha256(token);
    let user = conn
        .query_row(
            &format!(
                "SELECT a.id, a.player_id, p.name, a.role FROM session s
                 JOIN account a ON a.id = s.account_id JOIN player p ON p.id = a.player_id
                 WHERE s.token_hash = ?1 AND s.expires_at > {NOW}"
            ),
            [&hash],
            |r| {
                Ok(User {
                    id: r.get(0)?,
                    player_id: r.get(1)?,
                    name: r.get(2)?,
                    admin: r.get::<_, String>(3)? == "admin",
                    session: hash.clone(),
                })
            },
        )
        .optional()?;
    if let Some(u) = &user {
        // Verlängern, aber höchstens einmal pro Stunde in die Datei schreiben.
        conn.execute(
            &format!(
                "UPDATE session SET expires_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '+{SESSION_DAYS} days')
                 WHERE token_hash = ?1 AND expires_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '+{SESSION_DAYS} days', '-1 hour')"
            ),
            [&hash],
        )?;
        conn.execute(
            &format!(
                "UPDATE account SET last_seen = {NOW}
                 WHERE id = ?1 AND (last_seen IS NULL OR last_seen < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-1 hour'))"
            ),
            [u.id],
        )?;
    }
    Ok(user)
}

impl FromRequestParts<AppState> for User {
    type Rejection = ApiError;
    async fn from_request_parts(parts: &mut Parts, st: &AppState) -> Result<Self, ApiError> {
        let token = session_token(&parts.headers).ok_or_else(unauthorized)?;
        let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
        session_user(&conn, &token)?.ok_or_else(unauthorized)
    }
}

/// Wie `User`, aber nur für Admins.
pub struct Admin(pub User);

impl FromRequestParts<AppState> for Admin {
    type Rejection = ApiError;
    async fn from_request_parts(parts: &mut Parts, st: &AppState) -> Result<Self, ApiError> {
        let u = User::from_request_parts(parts, st).await?;
        if !u.admin {
            return Err(forbidden("Das darf nur der Admin."));
        }
        Ok(Admin(u))
    }
}

/// Angemeldet oder nicht, beides ist okay.
pub struct MaybeUser(pub Option<User>);

impl FromRequestParts<AppState> for MaybeUser {
    type Rejection = ApiError;
    async fn from_request_parts(parts: &mut Parts, st: &AppState) -> Result<Self, ApiError> {
        let Some(token) = session_token(&parts.headers) else {
            return Ok(MaybeUser(None));
        };
        let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
        Ok(MaybeUser(session_user(&conn, &token)?))
    }
}

/* ---------- Cookies ---------- */

fn is_https(st: &AppState, h: &HeaderMap) -> bool {
    st.secure.unwrap_or_else(|| {
        h.get("x-forwarded-proto")
            .and_then(|v| v.to_str().ok())
            .is_some_and(|v| v.split(',').next().unwrap_or("").trim() == "https")
    })
}

fn cookie(st: &AppState, h: &HeaderMap, token: Option<&str>) -> HeaderValue {
    // Das Cookie selbst darf lange leben; ob die Anmeldung noch gilt, entscheidet der Server.
    let (value, age) = match token {
        Some(t) => (t, 400 * 24 * 3600),
        None => ("", 0),
    };
    let secure = if is_https(st, h) { "; Secure" } else { "" };
    HeaderValue::from_str(&format!(
        "{COOKIE}={value}; Path=/; HttpOnly; SameSite=Strict; Max-Age={age}{secure}"
    ))
    .expect("gültiges Cookie")
}

fn new_session(conn: &Connection, account_id: i64) -> rusqlite::Result<String> {
    let token = random_hex(32);
    conn.execute(
        &format!(
            "INSERT INTO session (token_hash, account_id, expires_at) VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '+{SESSION_DAYS} days'))"
        ),
        params![sha256(&token), account_id],
    )?;
    // Abgelaufene bei der Gelegenheit wegräumen.
    conn.execute(
        &format!("DELETE FROM session WHERE expires_at <= {NOW}"),
        [],
    )?;
    Ok(token)
}

fn load_user(conn: &Connection, account_id: i64, session: String) -> rusqlite::Result<User> {
    conn.query_row(
        "SELECT a.id, a.player_id, p.name, a.role FROM account a JOIN player p ON p.id = a.player_id WHERE a.id = ?1",
        [account_id],
        |r| {
            Ok(User {
                id: r.get(0)?,
                player_id: r.get(1)?,
                name: r.get(2)?,
                admin: r.get::<_, String>(3)? == "admin",
                session,
            })
        },
    )
}

/// Antwort nach erfolgreichem Login, Registrieren oder Einladung: Benutzer plus Cookie.
fn logged_in(
    st: &AppState,
    h: &HeaderMap,
    conn: &Connection,
    account_id: i64,
) -> ApiResult<Response> {
    let token = new_session(conn, account_id)?;
    let user = load_user(conn, account_id, sha256(&token))?;
    let mut res = Json(json!({ "user": user.dto() })).into_response();
    res.headers_mut()
        .insert(header::SET_COOKIE, cookie(st, h, Some(&token)));
    Ok(res)
}

/* ---------- Schutz gegen fremde Seiten ---------- */

/// Schreibende Anfragen von fremden Seiten ablehnen (zusätzlich zu SameSite=Strict).
pub async fn same_site_only(State(st): State<AppState>, req: Request, next: Next) -> Response {
    let safe = matches!(*req.method(), Method::GET | Method::HEAD | Method::OPTIONS);
    if !safe {
        let h = req.headers();
        let cross = h
            .get("sec-fetch-site")
            .is_some_and(|v| v.as_bytes() == b"cross-site");
        let allowed = h
            .get(header::ORIGIN)
            .and_then(|o| o.to_str().ok())
            .is_some_and(|o| st.cors.iter().any(|c| c == o));
        if cross && !allowed {
            return forbidden("Anfrage von einer fremden Seite abgelehnt.").into_response();
        }
    }
    next.run(req).await
}

/* ---------- Anmelden, Registrieren, Einladung ---------- */

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginRequest {
    name: Option<String>,
    password: Option<String>,
}

pub async fn me(State(st): State<AppState>, MaybeUser(user): MaybeUser) -> ApiResult<Json<Value>> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let open = setting(&conn, "signup_open")?.as_deref() == Some("1")
        && setting(&conn, "signup_code")?.is_some();
    let setup = admin_count(&conn)? == 0;
    Ok(Json(json!({
        "user": user.map(|u| u.dto()),
        "signupOpen": open || setup,
        "setupNeeded": setup,
    })))
}

pub async fn login(
    State(st): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> ApiResult<Response> {
    let req: LoginRequest = parse(&body)?;
    let name = req.name.unwrap_or_default().trim().to_string();
    let pw = req.password.unwrap_or_default();
    let ip = client_ip(&headers);
    let nkey = format!("name:{}", name.to_lowercase());
    if st.blocked(&ip, IP_MAX) || st.blocked(&nkey, NAME_MAX) {
        return Err(too_many());
    }
    let row: Option<(i64, String)> = {
        let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
        conn.query_row(
            "SELECT a.id, a.password_hash FROM account a JOIN player p ON p.id = a.player_id WHERE lower(p.name) = lower(?1)",
            [&name],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()?
    };
    // Hashen ohne die Datenbank zu sperren, das dauert ein paar Millisekunden.
    let ok = row.as_ref().is_some_and(|(_, h)| verify_password(&pw, h));
    if !ok {
        st.failed(&ip);
        st.failed(&nkey);
        return Err(ApiError(
            StatusCode::UNAUTHORIZED,
            "Name oder Passwort stimmt nicht.".into(),
        ));
    }
    st.reset(&nkey);
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    logged_in(&st, &headers, &conn, row.unwrap().0)
}

pub async fn logout(State(st): State<AppState>, headers: HeaderMap) -> ApiResult<Response> {
    if let Some(t) = session_token(&headers) {
        let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
        conn.execute("DELETE FROM session WHERE token_hash = ?1", [sha256(&t)])?;
    }
    let mut res = StatusCode::NO_CONTENT.into_response();
    res.headers_mut()
        .insert(header::SET_COOKIE, cookie(&st, &headers, None));
    Ok(res)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegisterRequest {
    code: Option<String>,
    player_id: Option<i64>,
    name: Option<String>,
    password: Option<String>,
}

pub async fn register(
    State(st): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> ApiResult<Response> {
    let req: RegisterRequest = parse(&body)?;
    let ip = client_ip(&headers);
    if st.blocked(&ip, IP_MAX) {
        return Err(too_many());
    }
    let pw = req.password.unwrap_or_default();
    check_password(&pw)?;
    let new_name = match req.player_id {
        Some(_) => None,
        None => Some(player_name(crate::PlayerRequest { name: req.name })?),
    };
    let hash = hash_password(&pw)?;
    let code = req.code.unwrap_or_default();

    let mut conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let tx = conn.transaction()?;
    let role = if admin_count(&tx)? == 0 {
        setting(&tx, "setup_code")?
            .filter(|c| same_code(&code, c))
            .map(|_| "admin")
    } else {
        let open = setting(&tx, "signup_open")?.as_deref() == Some("1");
        setting(&tx, "signup_code")?
            .filter(|c| open && same_code(&code, c))
            .map(|_| "member")
    };
    let Some(role) = role else {
        st.failed(&ip);
        return Err(forbidden(
            "Der Code stimmt nicht oder die Registrierung ist gerade geschlossen.",
        ));
    };
    let player_id = match (req.player_id, new_name) {
        (Some(id), _) => {
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM player WHERE id = ?1)",
                [id],
                |r| r.get(0),
            )?;
            if !exists {
                return Err(not_found(format!("Spieler {id} gibt es nicht.")));
            }
            id
        }
        (None, Some(name)) => {
            if crate::name_taken(&tx, &name, 0)? {
                return Err(conflict(format!(
                    "Es gibt schon einen Spieler namens „{name}“. Wähl ihn oben aus der Liste."
                )));
            }
            tx.execute("INSERT INTO player (name) VALUES (?1)", [&name])?;
            tx.last_insert_rowid()
        }
        (None, None) => unreachable!(),
    };
    let taken: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM account WHERE player_id = ?1)",
        [player_id],
        |r| r.get(0),
    )?;
    if taken {
        return Err(conflict(
            "Für diesen Spieler gibt es schon einen Account. Passwort vergessen? Der Admin kann dir einen Link schicken.",
        ));
    }
    tx.execute(
        "INSERT INTO account (player_id, role, password_hash) VALUES (?1, ?2, ?3)",
        params![player_id, role, hash],
    )?;
    let account_id = tx.last_insert_rowid();
    if role == "admin" {
        set_setting(&tx, "setup_code", None)?;
    }
    if req.player_id.is_none() {
        let actor = load_user(&tx, account_id, String::new())?;
        history::record(
            &tx,
            &actor,
            "create",
            "player",
            player_id,
            None,
            Some(crate::player_snapshot(&tx, player_id)?),
        )?;
    }
    let res = logged_in(&st, &headers, &tx, account_id)?;
    tx.commit()?;
    st.reset(&ip);
    Ok(res)
}

fn find_invite(conn: &Connection, token: &str) -> rusqlite::Result<Option<(i64, String, bool)>> {
    conn.query_row(
        &format!(
            "SELECT i.player_id, p.name, EXISTS(SELECT 1 FROM account a WHERE a.player_id = i.player_id)
             FROM invite i JOIN player p ON p.id = i.player_id
             WHERE i.token_hash = ?1 AND i.used_at IS NULL AND i.expires_at > {NOW}"
        ),
        [sha256(token)],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    )
    .optional()
}

fn bad_invite() -> ApiError {
    not_found(
        "Der Link ist ungültig, abgelaufen oder wurde schon benutzt. Frag den Admin nach einem neuen.",
    )
}

pub async fn invite_info(
    State(st): State<AppState>,
    UrlPath(token): UrlPath<String>,
) -> ApiResult<Json<Value>> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let (player_id, name, has) = find_invite(&conn, &token)?.ok_or_else(bad_invite)?;
    Ok(Json(
        json!({ "playerId": player_id, "name": name, "hasAccount": has }),
    ))
}

#[derive(Deserialize)]
struct PasswordOnly {
    password: Option<String>,
}

pub async fn invite_accept(
    State(st): State<AppState>,
    headers: HeaderMap,
    UrlPath(token): UrlPath<String>,
    body: Bytes,
) -> ApiResult<Response> {
    let req: PasswordOnly = parse(&body)?;
    let ip = client_ip(&headers);
    if st.blocked(&ip, IP_MAX) {
        return Err(too_many());
    }
    let pw = req.password.unwrap_or_default();
    check_password(&pw)?;
    let hash = hash_password(&pw)?;
    let mut conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let tx = conn.transaction()?;
    let Some((player_id, _, has)) = find_invite(&tx, &token)? else {
        st.failed(&ip);
        return Err(bad_invite());
    };
    let account_id = if has {
        let id: i64 = tx.query_row(
            "SELECT id FROM account WHERE player_id = ?1",
            [player_id],
            |r| r.get(0),
        )?;
        tx.execute(
            "UPDATE account SET password_hash = ?1 WHERE id = ?2",
            params![hash, id],
        )?;
        // Neues Passwort: alte Anmeldungen gelten nicht mehr.
        tx.execute("DELETE FROM session WHERE account_id = ?1", [id])?;
        id
    } else {
        tx.execute(
            "INSERT INTO account (player_id, role, password_hash) VALUES (?1, 'member', ?2)",
            params![player_id, hash],
        )?;
        tx.last_insert_rowid()
    };
    tx.execute(
        &format!("UPDATE invite SET used_at = {NOW} WHERE token_hash = ?1"),
        [sha256(&token)],
    )?;
    let res = logged_in(&st, &headers, &tx, account_id)?;
    tx.commit()?;
    Ok(res)
}

/* ---------- Profil ---------- */

#[derive(Deserialize)]
struct ChangePassword {
    current: Option<String>,
    password: Option<String>,
}

fn require_password(conn: &Connection, user: &User, pw: &str) -> ApiResult<()> {
    let hash: String = conn.query_row(
        "SELECT password_hash FROM account WHERE id = ?1",
        [user.id],
        |r| r.get(0),
    )?;
    if verify_password(pw, &hash) {
        Ok(())
    } else {
        Err(forbidden("Das aktuelle Passwort stimmt nicht."))
    }
}

pub async fn change_password(
    State(st): State<AppState>,
    user: User,
    body: Bytes,
) -> ApiResult<StatusCode> {
    let req: ChangePassword = parse(&body)?;
    let pw = req.password.unwrap_or_default();
    check_password(&pw)?;
    let hash = hash_password(&pw)?;
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    require_password(&conn, &user, &req.current.unwrap_or_default())?;
    conn.execute(
        "UPDATE account SET password_hash = ?1 WHERE id = ?2",
        params![hash, user.id],
    )?;
    // Andere Geräte abmelden, dieses bleibt angemeldet.
    conn.execute(
        "DELETE FROM session WHERE account_id = ?1 AND token_hash <> ?2",
        params![user.id, user.session],
    )?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn logout_everywhere(
    State(st): State<AppState>,
    headers: HeaderMap,
    user: User,
) -> ApiResult<Response> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    conn.execute("DELETE FROM session WHERE account_id = ?1", [user.id])?;
    let mut res = StatusCode::NO_CONTENT.into_response();
    res.headers_mut()
        .insert(header::SET_COOKIE, cookie(&st, &headers, None));
    Ok(res)
}

fn guard_last_admin(conn: &Connection, account_id: i64) -> ApiResult<()> {
    let role: String = conn
        .query_row(
            "SELECT role FROM account WHERE id = ?1",
            [account_id],
            |r| r.get(0),
        )
        .optional()?
        .ok_or_else(|| not_found("Diesen Account gibt es nicht."))?;
    if role == "admin" && admin_count(conn)? <= 1 {
        return Err(conflict(
            "Das ist der einzige Admin. Erst einen anderen Account zum Admin machen.",
        ));
    }
    Ok(())
}

pub async fn delete_me(
    State(st): State<AppState>,
    headers: HeaderMap,
    user: User,
    body: Bytes,
) -> ApiResult<Response> {
    let req: PasswordOnly = parse(&body)?;
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    require_password(&conn, &user, &req.password.unwrap_or_default())?;
    guard_last_admin(&conn, user.id)?;
    conn.execute("DELETE FROM account WHERE id = ?1", [user.id])?;
    let mut res = StatusCode::NO_CONTENT.into_response();
    res.headers_mut()
        .insert(header::SET_COOKIE, cookie(&st, &headers, None));
    Ok(res)
}

/* ---------- Admin ---------- */

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Settings {
    signup_open: Option<bool>,
    signup_code: Option<String>,
}

fn settings_dto(conn: &Connection) -> rusqlite::Result<Value> {
    Ok(json!({
        "signupOpen": setting(conn, "signup_open")?.as_deref() == Some("1"),
        "signupCode": setting(conn, "signup_code")?,
    }))
}

pub async fn get_settings(State(st): State<AppState>, _: Admin) -> ApiResult<Json<Value>> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    Ok(Json(settings_dto(&conn)?))
}

pub async fn put_settings(
    State(st): State<AppState>,
    _: Admin,
    body: Bytes,
) -> ApiResult<Json<Value>> {
    let req: Settings = parse(&body)?;
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    if let Some(code) = req.signup_code {
        let code = code.trim().to_string();
        let n = code.chars().count();
        if !(6..=40).contains(&n) {
            return Err(bad("Der Gruppencode braucht 6 bis 40 Zeichen."));
        }
        set_setting(&conn, "signup_code", Some(&code))?;
    }
    if let Some(open) = req.signup_open {
        if open && setting(&conn, "signup_code")?.is_none() {
            return Err(bad("Erst einen Gruppencode festlegen."));
        }
        set_setting(&conn, "signup_open", Some(if open { "1" } else { "0" }))?;
    }
    Ok(Json(settings_dto(&conn)?))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountDto {
    id: i64,
    player_id: i64,
    name: String,
    role: String,
    created_at: String,
    last_seen: Option<String>,
}

pub async fn list_accounts(
    State(st): State<AppState>,
    _: Admin,
) -> ApiResult<Json<Vec<AccountDto>>> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let mut stmt = conn.prepare(
        "SELECT a.id, a.player_id, p.name, a.role, a.created_at, a.last_seen FROM account a
         JOIN player p ON p.id = a.player_id ORDER BY p.name COLLATE NOCASE",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(AccountDto {
            id: r.get(0)?,
            player_id: r.get(1)?,
            name: r.get(2)?,
            role: r.get(3)?,
            created_at: r.get(4)?,
            last_seen: r.get(5)?,
        })
    })?;
    Ok(Json(rows.collect::<Result<_, _>>()?))
}

#[derive(Deserialize)]
struct RoleRequest {
    role: Option<String>,
}

pub async fn set_role(
    State(st): State<AppState>,
    _: Admin,
    UrlPath(id): UrlPath<i64>,
    body: Bytes,
) -> ApiResult<StatusCode> {
    let req: RoleRequest = parse(&body)?;
    let role = match req.role.as_deref() {
        Some("admin") => "admin",
        Some("member") => "member",
        _ => return Err(bad("Rolle ist admin oder member.")),
    };
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    if role == "member" {
        guard_last_admin(&conn, id)?;
    }
    if conn.execute(
        "UPDATE account SET role = ?1 WHERE id = ?2",
        params![role, id],
    )? == 0
    {
        return Err(not_found("Diesen Account gibt es nicht."));
    }
    Ok(StatusCode::NO_CONTENT)
}

pub async fn delete_account(
    State(st): State<AppState>,
    _: Admin,
    UrlPath(id): UrlPath<i64>,
) -> ApiResult<StatusCode> {
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    guard_last_admin(&conn, id)?;
    conn.execute("DELETE FROM account WHERE id = ?1", [id])?;
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InviteRequest {
    player_id: Option<i64>,
}

/// Einladungslink für einen Spieler: zum Registrieren, auch wenn die Registrierung zu ist,
/// oder zum Zurücksetzen eines vergessenen Passworts. 7 Tage gültig, einmal benutzbar.
pub async fn create_invite(
    State(st): State<AppState>,
    Admin(admin): Admin,
    body: Bytes,
) -> ApiResult<Json<Value>> {
    let req: InviteRequest = parse(&body)?;
    let pid = req.player_id.ok_or_else(|| bad("Für welchen Spieler?"))?;
    let conn = st.db.lock().unwrap_or_else(|e| e.into_inner());
    let name: String = conn
        .query_row("SELECT name FROM player WHERE id = ?1", [pid], |r| r.get(0))
        .optional()?
        .ok_or_else(|| not_found(format!("Spieler {pid} gibt es nicht.")))?;
    conn.execute(
        "DELETE FROM invite WHERE player_id = ?1 AND used_at IS NULL",
        [pid],
    )?;
    let token = random_hex(24);
    conn.execute(
        &format!(
            "INSERT INTO invite (token_hash, player_id, created_by, expires_at)
             VALUES (?1, ?2, ?3, strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '+{INVITE_DAYS} days'))"
        ),
        params![sha256(&token), pid, admin.id],
    )?;
    let expires: String = conn.query_row(
        "SELECT expires_at FROM invite WHERE token_hash = ?1",
        [sha256(&token)],
        |r| r.get(0),
    )?;
    Ok(Json(
        json!({ "token": token, "name": name, "expiresAt": expires }),
    ))
}
