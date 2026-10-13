//! Startet die Hub-API. Konfiguration über Umgebungsvariablen:
//!   TI4_DATA_DIR              Ordner für ti4hub.db (Standard ./data, im Container /data)
//!   TI4_CORS_ALLOWED_ORIGINS  Komma-getrennt, nur wenn Seite und API unter verschiedenen Adressen laufen
//!   PORT                      Standard 8080

fn main() {
    let dir = std::env::var("TI4_DATA_DIR").unwrap_or_else(|_| "./data".into());
    let path = format!("{}/ti4hub.db", dir.trim_end_matches('/'));
    let origins: Vec<String> = std::env::var("TI4_CORS_ALLOWED_ORIGINS")
        .unwrap_or_default()
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".into());

    let db = ti4_hub::open(&path)
        .unwrap_or_else(|e| panic!("Datenbank {path} lässt sich nicht öffnen: {e}"));
    let app = ti4_hub::app(db, &origins);

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Tokio-Runtime")
        .block_on(async move {
            let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
                .await
                .expect("Port belegt?");
            println!("TI4-Hub-API auf Port {port}, Daten in {path}");
            axum::serve(listener, app)
                .with_graceful_shutdown(async {
                    let _ = tokio::signal::ctrl_c().await;
                })
                .await
                .expect("Server");
        });
}
