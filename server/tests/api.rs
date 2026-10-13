use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use tower::ServiceExt;

struct Api {
    router: axum::Router,
    db: ti4_hub::Db,
    cookie: std::sync::Mutex<Option<String>>,
}

impl Api {
    fn new() -> Self {
        let db = ti4_hub::open(":memory:").unwrap();
        Api {
            router: ti4_hub::app(db.clone(), &[], None),
            db,
            cookie: Default::default(),
        }
    }

    /// Neue Datenbank, der erste Account (Admin) ist angemeldet.
    async fn with_admin(name: &str) -> Self {
        let api = Api::new();
        let code = ti4_hub::auth::setup_code(&api.db).unwrap().unwrap();
        let (s, _) = api
            .call(
                "POST",
                "/api/auth/register",
                Some(json!({ "code": code, "name": name, "password": "geheim123" })),
            )
            .await;
        assert_eq!(s, StatusCode::OK);
        api
    }

    fn logout_local(&self) {
        *self.cookie.lock().unwrap() = None;
    }

    async fn call(&self, method: &str, uri: &str, body: Option<Value>) -> (StatusCode, Value) {
        let mut req = Request::builder()
            .method(method)
            .uri(uri)
            .header("Content-Type", "application/json");
        if let Some(c) = self.cookie.lock().unwrap().as_ref() {
            req = req.header("Cookie", c);
        }
        let req = req
            .body(
                body.map(|b| Body::from(b.to_string()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let res = self.router.clone().oneshot(req).await.unwrap();
        let status = res.status();
        if let Some(c) = res.headers().get("set-cookie") {
            let c = c.to_str().unwrap().split(';').next().unwrap().to_string();
            *self.cookie.lock().unwrap() = if c.ends_with('=') { None } else { Some(c) };
        }
        let bytes = res.into_body().collect().await.unwrap().to_bytes();
        (
            status,
            serde_json::from_slice(&bytes).unwrap_or(Value::Null),
        )
    }

    async fn player(&self, name: &str) -> i64 {
        let (s, v) = self
            .call("POST", "/api/players", Some(json!({ "name": name })))
            .await;
        assert_eq!(s, StatusCode::CREATED);
        v["id"].as_i64().unwrap()
    }
}

#[tokio::test]
async fn players_games_and_placements() {
    let api = Api::with_admin("Rafi").await;
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    let rafi = me["user"]["playerId"].as_i64().unwrap();
    let basti = api.player("Basti").await;
    let robin = api.player("Robin").await;

    let (s, v) = api
        .call("POST", "/api/players", Some(json!({ "name": " rafi " })))
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    assert_eq!(v["detail"], "Es gibt schon einen Spieler namens „rafi“.");

    // geplantes Spiel mit Fraktionswahl
    let (s, g) = api
        .call("POST", "/api/games", Some(json!({
            "scheduledAt": "2026-10-17T18:00", "location": "Bei Basti", "status": "PLANNED", "pointsToWin": 10,
            "participants": [{ "playerId": rafi, "faction": "sardakk" }, { "playerId": basti }, { "playerId": robin, "faction": "muaat" }]
        })))
        .await;
    assert_eq!(s, StatusCode::CREATED);
    assert_eq!(g["scheduledAt"], "2026-10-17T18:00:00");
    assert_eq!(g["participants"].as_array().unwrap().len(), 3);
    assert_eq!(g["participants"][1]["faction"], Value::Null);
    let id = g["id"].as_i64().unwrap();
    let version = g["version"].as_i64().unwrap();

    // doppelte Fraktion wird abgelehnt
    let (s, _) = api
        .call("PUT", &format!("/api/games/{id}"), Some(json!({
            "scheduledAt": "2026-10-17T18:00", "status": "PLANNED", "version": version,
            "participants": [{ "playerId": rafi, "faction": "sardakk" }, { "playerId": basti, "faction": "sardakk" }]
        })))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);

    // als gespielt eintragen: Platzierung aus Siegpunkten, Robin fliegt raus
    let (s, g) = api
        .call("PUT", &format!("/api/games/{id}"), Some(json!({
            "scheduledAt": "2026-10-17T18:00", "location": "Bei Basti", "status": "FINISHED", "pointsToWin": 10, "version": version,
            "participants": [{ "playerId": rafi, "faction": "sardakk", "victoryPoints": 7 }, { "playerId": basti, "faction": "jolnar", "victoryPoints": 10 }]
        })))
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(g["status"], "FINISHED");
    assert_eq!(g["participants"][0]["placement"], 2);
    assert_eq!(g["participants"][1]["placement"], 1);
    assert!(g["version"].as_i64().unwrap() > version);

    // veralteter Stand -> 409
    let (s, v) = api
        .call("PUT", &format!("/api/games/{id}"), Some(json!({
            "scheduledAt": "2026-10-17T18:00", "status": "FINISHED", "version": version, "participants": []
        })))
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    assert!(v["detail"].as_str().unwrap().starts_with("Jemand anderes"));

    // Spieler in einem Spiel kann nicht gelöscht werden, Robin schon
    let (s, _) = api
        .call("DELETE", &format!("/api/players/{rafi}"), None)
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    let (s, _) = api
        .call("DELETE", &format!("/api/players/{robin}"), None)
        .await;
    assert_eq!(s, StatusCode::NO_CONTENT);

    let (s, list) = api.call("GET", "/api/games", None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(list.as_array().unwrap().len(), 1);
    assert_eq!(list[0]["participants"][1]["faction"], "jolnar");

    let (s, v) = api
        .call("POST", "/api/players", Some(json!({ "name": "" })))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(v["detail"], "Bitte einen Namen eingeben.");

    let (s, v) = api
        .call(
            "POST",
            "/api/games",
            Some(json!({ "scheduledAt": "kaputt", "status": "PLANNED" })),
        )
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(v["detail"], "Bitte Datum und Uhrzeit angeben.");

    let (s, _) = api.call("DELETE", &format!("/api/games/{id}"), None).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = api.call("GET", &format!("/api/games/{id}"), None).await;
    assert_eq!(s, StatusCode::NOT_FOUND);

    let (s, _) = api.call("GET", "/api/health", None).await;
    assert_eq!(s, StatusCode::OK);
}

#[tokio::test]
async fn validation_and_edge_cases() {
    let api = Api::with_admin("Rafi").await;
    let a = api.player("Ärger").await;
    let b = api.player("Bea").await;
    let c = api.player("Cem").await;

    // Groß-/Kleinschreibung auch bei Umlauten
    let (s, _) = api
        .call("POST", "/api/players", Some(json!({ "name": "ärger" })))
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    let (s, _) = api
        .call(
            "PUT",
            &format!("/api/players/{b}"),
            Some(json!({ "name": "ÄRGER" })),
        )
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    let (s, v) = api
        .call("PUT", "/api/players/999", Some(json!({ "name": "Neu" })))
        .await;
    assert_eq!(s, StatusCode::NOT_FOUND, "{v}");

    // Sekundenbruchteile sind gültiges ISO-8601
    let (s, g) = api
        .call(
            "POST",
            "/api/games",
            Some(json!({
                "scheduledAt": "2026-10-17T18:00:00.000", "status": "FINISHED",
                "participants": [
                    { "playerId": a, "victoryPoints": 10, "placement": 2 },
                    { "playerId": b, "victoryPoints": 7 },
                    { "playerId": c }
                ]
            })),
        )
        .await;
    assert_eq!(s, StatusCode::CREATED, "{g}");
    assert_eq!(g["scheduledAt"], "2026-10-17T18:00:00");
    // eingetragener Platz bleibt, fehlender wird aus Siegpunkten ergänzt, ohne Punkte kein Platz
    assert_eq!(g["participants"][0]["placement"], 2);
    assert_eq!(g["participants"][1]["placement"], 1);
    assert_eq!(g["participants"][2]["placement"], Value::Null);
    let id = g["id"].as_i64().unwrap();
    let version = g["version"].as_i64().unwrap();

    // doppelte und unmögliche Plätze
    let dup = json!({ "scheduledAt": "2026-10-17T18:00", "status": "FINISHED", "version": version,
        "participants": [{ "playerId": a, "placement": 1 }, { "playerId": b, "placement": 1 }] });
    let (s, v) = api
        .call("PUT", &format!("/api/games/{id}"), Some(dup))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(v["detail"], "Platz 1 ist doppelt vergeben.");
    let far = json!({ "scheduledAt": "2026-10-17T18:00", "status": "FINISHED", "version": version,
        "participants": [{ "playerId": a, "placement": 5 }] });
    let (s, _) = api
        .call("PUT", &format!("/api/games/{id}"), Some(far))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);

    // Ändern ohne Version oder ohne Teilnehmerliste wird abgelehnt
    let (s, _) = api
        .call("PUT", &format!("/api/games/{id}"), Some(json!({ "scheduledAt": "2026-10-17T18:00", "status": "PLANNED", "participants": [] })))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    let (s, _) = api
        .call("PUT", &format!("/api/games/{id}"), Some(json!({ "scheduledAt": "2026-10-17T18:00", "status": "PLANNED", "version": version })))
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    let (_, g) = api.call("GET", &format!("/api/games/{id}"), None).await;
    assert_eq!(g["participants"].as_array().unwrap().len(), 3);

    // Zurück auf „Geplant“ behält die Ergebnisse
    let (s, g) = api
        .call(
            "PUT",
            &format!("/api/games/{id}"),
            Some(json!({
                "scheduledAt": "2026-10-17T18:00", "status": "PLANNED", "version": version,
                "participants": [{ "playerId": a, "victoryPoints": 10, "placement": 1 }]
            })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(g["participants"][0]["victoryPoints"], 10);

    // Fehler immer als Problem Details
    let (s, v) = api.call("GET", "/api/games/abc", None).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(v["detail"], "„abc“ ist keine gültige ID.");
    let (s, v) = api.call("GET", "/api/gibtsnicht", None).await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert!(v["detail"].is_string());
    let (s, v) = api.call("PATCH", "/api/games", None).await;
    assert_eq!(s, StatusCode::METHOD_NOT_ALLOWED);
    assert!(v["detail"].is_string());
}

#[test]
fn ties_keep_list_order() {
    let p = |id: i64, vp: i64| {
        serde_json::from_value(json!({ "playerId": id, "victoryPoints": vp })).unwrap()
    };
    let out = ti4_hub::with_placements(vec![p(1, 7), p(2, 10), p(3, 7)]);
    let places: Vec<i64> = out
        .iter()
        .map(|x| {
            serde_json::to_value(x).unwrap()["placement"]
                .as_i64()
                .unwrap()
        })
        .collect();
    assert_eq!(places, vec![2, 1, 3]);
}

#[tokio::test]
async fn read_only_without_login_and_group_code_signup() {
    let api = Api::with_admin("Rafi").await;
    let basti = api.player("Basti").await;

    // Ohne Login: lesen ja, schreiben nein
    api.logout_local();
    let (s, v) = api.call("GET", "/api/players", None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v[1]["name"], "Rafi");
    assert_eq!(v[1]["hasAccount"], true);
    assert_eq!(v[0]["hasAccount"], false);
    let (s, _) = api
        .call("POST", "/api/players", Some(json!({ "name": "Fremder" })))
        .await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
    let (s, _) = api.call("GET", "/api/audit", None).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);

    // Der Einrichtungscode ist verbraucht, Registrierung ist zu
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    assert_eq!(me["user"], Value::Null);
    assert_eq!(me["signupOpen"], false);
    assert_eq!(me["setupNeeded"], false);
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/register",
            Some(json!({ "code": "irgendwas", "playerId": basti, "password": "basti1234" })),
        )
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);

    // Admin öffnet die Registrierung mit Gruppencode
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/login",
            Some(json!({ "name": "rafi", "password": "falsch!!" })),
        )
        .await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
    let (s, v) = api
        .call(
            "POST",
            "/api/auth/login",
            Some(json!({ "name": "rafi", "password": "geheim123" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v["user"]["role"], "admin");
    let (s, _) = api
        .call(
            "PUT",
            "/api/admin/settings",
            Some(json!({ "signupOpen": true })),
        )
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST, "ohne Code nicht öffnen");
    let (s, v) = api
        .call(
            "PUT",
            "/api/admin/settings",
            Some(json!({ "signupCode": "mecatol-rex", "signupOpen": true })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v["signupCode"], "mecatol-rex");

    // Basti registriert sich mit dem Code für seinen Spieler
    api.logout_local();
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/register",
            Some(json!({ "code": "falsch", "playerId": basti, "password": "basti1234" })),
        )
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/register",
            Some(json!({ "code": "Mecatol-Rex ", "playerId": basti, "password": "kurz" })),
        )
        .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    let (s, v) = api
        .call(
            "POST",
            "/api/auth/register",
            Some(json!({ "code": "Mecatol-Rex ", "playerId": basti, "password": "basti1234" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v["user"]["name"], "Basti");
    assert_eq!(v["user"]["role"], "member");
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/register",
            Some(json!({ "code": "mecatol-rex", "playerId": basti, "password": "nochmal123" })),
        )
        .await;
    assert_eq!(s, StatusCode::CONFLICT, "Spieler hat schon einen Account");

    // Mitglied: kein Admin-Bereich, darf Rafi nicht umbenennen, sich selbst schon
    let (s, _) = api.call("GET", "/api/admin/accounts", None).await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    let (_, players) = api.call("GET", "/api/players", None).await;
    let rafi = players
        .as_array()
        .unwrap()
        .iter()
        .find(|p| p["name"] == "Rafi")
        .unwrap()["id"]
        .as_i64()
        .unwrap();
    let (s, _) = api
        .call(
            "PUT",
            &format!("/api/players/{rafi}"),
            Some(json!({ "name": "Rafael" })),
        )
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    let (s, _) = api
        .call(
            "PUT",
            &format!("/api/players/{basti}"),
            Some(json!({ "name": "Bastian" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);

    // Admin schließt die Registrierung
    api.call(
        "POST",
        "/api/auth/login",
        Some(json!({ "name": "Rafi", "password": "geheim123" })),
    )
    .await;
    api.call(
        "PUT",
        "/api/admin/settings",
        Some(json!({ "signupOpen": false })),
    )
    .await;
    api.logout_local();
    let robin_new = json!({ "code": "mecatol-rex", "name": "Robin", "password": "robin1234" });
    let (s, _) = api
        .call("POST", "/api/auth/register", Some(robin_new))
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn invites_profile_and_last_admin() {
    let api = Api::with_admin("Rafi").await;
    let robin = api.player("Robin").await;
    let (s, inv) = api
        .call(
            "POST",
            "/api/admin/invites",
            Some(json!({ "playerId": robin })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    let token = inv["token"].as_str().unwrap().to_string();

    // Einladung annehmen (Registrierung ist zu, geht trotzdem)
    api.logout_local();
    let (s, v) = api
        .call("GET", &format!("/api/auth/invite/{token}"), None)
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v["name"], "Robin");
    assert_eq!(v["hasAccount"], false);
    let (s, v) = api
        .call(
            "POST",
            &format!("/api/auth/invite/{token}"),
            Some(json!({ "password": "robin1234" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(v["user"]["name"], "Robin");
    let (s, _) = api
        .call(
            "POST",
            &format!("/api/auth/invite/{token}"),
            Some(json!({ "password": "robin5678" })),
        )
        .await;
    assert_eq!(s, StatusCode::NOT_FOUND, "nur einmal benutzbar");

    // Profil: Passwort ändern
    let (s, _) = api
        .call(
            "PUT",
            "/api/me/password",
            Some(json!({ "current": "falsch123", "password": "robin5678" })),
        )
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    let (s, _) = api
        .call(
            "PUT",
            "/api/me/password",
            Some(json!({ "current": "robin1234", "password": "robin5678" })),
        )
        .await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    assert_eq!(
        me["user"]["name"], "Robin",
        "dieses Gerät bleibt angemeldet"
    );
    api.logout_local();
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/login",
            Some(json!({ "name": "Robin", "password": "robin5678" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);

    // Überall abmelden
    let (s, _) = api.call("POST", "/api/me/logout-all", None).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    assert_eq!(me["user"], Value::Null);

    // Account löschen: Spieler und Historie bleiben
    api.call(
        "POST",
        "/api/auth/login",
        Some(json!({ "name": "Robin", "password": "robin5678" })),
    )
    .await;
    let (s, _) = api
        .call(
            "DELETE",
            "/api/me",
            Some(json!({ "password": "falsch123" })),
        )
        .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    let (s, _) = api
        .call(
            "DELETE",
            "/api/me",
            Some(json!({ "password": "robin5678" })),
        )
        .await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (_, players) = api.call("GET", "/api/players", None).await;
    assert!(
        players
            .as_array()
            .unwrap()
            .iter()
            .any(|p| p["name"] == "Robin" && p["hasAccount"] == false)
    );

    // Der einzige Admin kann sich nicht löschen oder herabstufen
    api.call(
        "POST",
        "/api/auth/login",
        Some(json!({ "name": "Rafi", "password": "geheim123" })),
    )
    .await;
    let (s, _) = api
        .call(
            "DELETE",
            "/api/me",
            Some(json!({ "password": "geheim123" })),
        )
        .await;
    assert_eq!(s, StatusCode::CONFLICT);
    let (_, accounts) = api.call("GET", "/api/admin/accounts", None).await;
    let id = accounts[0]["id"].as_i64().unwrap();
    let (s, _) = api
        .call(
            "PUT",
            &format!("/api/admin/accounts/{id}"),
            Some(json!({ "role": "member" })),
        )
        .await;
    assert_eq!(s, StatusCode::CONFLICT);

    // Passwort vergessen: neuer Link für einen bestehenden Account
    let (_, inv) = api
        .call(
            "POST",
            "/api/admin/invites",
            Some(json!({ "playerId": accounts[0]["playerId"] })),
        )
        .await;
    let token = inv["token"].as_str().unwrap().to_string();
    let (_, v) = api
        .call("GET", &format!("/api/auth/invite/{token}"), None)
        .await;
    assert_eq!(v["hasAccount"], true);
    let (s, _) = api
        .call(
            "POST",
            &format!("/api/auth/invite/{token}"),
            Some(json!({ "password": "neu-geheim" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
    api.logout_local();
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/login",
            Some(json!({ "name": "Rafi", "password": "neu-geheim" })),
        )
        .await;
    assert_eq!(s, StatusCode::OK);
}

#[tokio::test]
async fn audit_and_undo() {
    let api = Api::with_admin("Rafi").await;
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    let rafi = me["user"]["playerId"].as_i64().unwrap();
    let (_, g) = api
        .call(
            "POST",
            "/api/games",
            Some(json!({
                "scheduledAt": "2026-10-17T18:00", "status": "FINISHED",
                "participants": [{ "playerId": rafi, "faction": "sol", "victoryPoints": 10 }]
            })),
        )
        .await;
    let id = g["id"].as_i64().unwrap();
    let (s, _) = api.call("DELETE", &format!("/api/games/{id}"), None).await;
    assert_eq!(s, StatusCode::NO_CONTENT);

    let (s, log) = api.call("GET", "/api/audit", None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(log[0]["action"], "delete");
    assert_eq!(log[0]["actor"], "Rafi");
    assert_eq!(log[0]["before"]["participants"][0]["faction"], "sol");

    // Löschen rückgängig: Spiel ist wieder da
    let entry = log[0]["id"].as_i64().unwrap();
    let (s, _) = api
        .call("POST", &format!("/api/audit/{entry}/undo"), None)
        .await;
    assert_eq!(s, StatusCode::OK);
    let (s, g) = api.call("GET", &format!("/api/games/{id}"), None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(g["participants"][0]["victoryPoints"], 10);
    let (s, _) = api
        .call("POST", &format!("/api/audit/{entry}/undo"), None)
        .await;
    assert_eq!(s, StatusCode::CONFLICT, "nur einmal");

    // Anlegen rückgängig geht nicht mehr, weil danach noch etwas passiert ist
    let (_, log) = api.call("GET", "/api/audit", None).await;
    let created = log
        .as_array()
        .unwrap()
        .iter()
        .find(|e| e["action"] == "create" && e["entity"] == "game")
        .unwrap()["id"]
        .as_i64()
        .unwrap();
    let (s, _) = api
        .call("POST", &format!("/api/audit/{created}/undo"), None)
        .await;
    assert_eq!(s, StatusCode::CONFLICT);

    // Spieler-Umbenennung rückgängig
    api.call(
        "PUT",
        &format!("/api/players/{rafi}"),
        Some(json!({ "name": "Rafael" })),
    )
    .await;
    let (_, log) = api.call("GET", "/api/audit", None).await;
    let (s, _) = api
        .call("POST", &format!("/api/audit/{}/undo", log[0]["id"]), None)
        .await;
    assert_eq!(s, StatusCode::OK);
    let (_, me) = api.call("GET", "/api/auth/me", None).await;
    assert_eq!(me["user"]["name"], "Rafi");

    // Backup
    let dir = std::env::temp_dir().join(format!("ti4-backup-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let f = ti4_hub::history::backup(&api.db, &dir, 2).unwrap();
    assert!(f.is_some_and(|f| f.exists()));
    assert!(
        ti4_hub::history::backup(&api.db, &dir, 2)
            .unwrap()
            .is_none(),
        "einmal pro Tag"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn cross_site_writes_and_password_guessing_are_blocked() {
    let api = Api::with_admin("Rafi").await;
    let req = Request::builder()
        .method("POST")
        .uri("/api/players")
        .header("Content-Type", "application/json")
        .header("Sec-Fetch-Site", "cross-site")
        .header("Origin", "https://boese.example")
        .header("Cookie", api.cookie.lock().unwrap().clone().unwrap())
        .body(Body::from(r#"{"name":"X"}"#))
        .unwrap();
    let res = api.router.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::FORBIDDEN);

    api.logout_local();
    for _ in 0..10 {
        let (s, _) = api
            .call(
                "POST",
                "/api/auth/login",
                Some(json!({ "name": "Rafi", "password": "falsch123" })),
            )
            .await;
        assert_eq!(s, StatusCode::UNAUTHORIZED);
    }
    let (s, _) = api
        .call(
            "POST",
            "/api/auth/login",
            Some(json!({ "name": "Rafi", "password": "geheim123" })),
        )
        .await;
    assert_eq!(s, StatusCode::TOO_MANY_REQUESTS);
}
