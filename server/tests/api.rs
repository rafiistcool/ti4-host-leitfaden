use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use tower::ServiceExt;

struct Api(axum::Router);

impl Api {
    fn new() -> Self {
        Api(ti4_hub::app(ti4_hub::open(":memory:").unwrap(), &[]))
    }

    async fn call(&self, method: &str, uri: &str, body: Option<Value>) -> (StatusCode, Value) {
        let req = Request::builder()
            .method(method)
            .uri(uri)
            .header("Content-Type", "application/json");
        let req = req
            .body(
                body.map(|b| Body::from(b.to_string()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let res = self.0.clone().oneshot(req).await.unwrap();
        let status = res.status();
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
    let api = Api::new();
    let rafi = api.player("Rafi").await;
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
            "scheduledAt": "2026-10-17T18:00", "status": "PLANNED",
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
