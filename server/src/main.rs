//! Startet die Hub-API. Konfiguration über Umgebungsvariablen:
//!   TI4_DATA_DIR              Ordner für ti4hub.db (Standard ./data, im Container /data)
//!   TI4_CORS_ALLOWED_ORIGINS  Komma-getrennt, nur wenn Seite und API unter verschiedenen Adressen laufen
//!   TI4_COOKIE_SECURE         true/false erzwingt bzw. verbietet Secure-Cookies; Standard: nach X-Forwarded-Proto
//!   TI4_BACKUP_KEEP           Wie viele tägliche Sicherungen in TI4_DATA_DIR/backup bleiben (Standard 14, 0 = aus)
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
    let secure = match std::env::var("TI4_COOKIE_SECURE").as_deref() {
        Ok("true") | Ok("1") => Some(true),
        Ok("false") | Ok("0") => Some(false),
        _ => None,
    };
    let keep: usize = std::env::var("TI4_BACKUP_KEEP")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(14);

    let db = ti4_hub::open(&path)
        .unwrap_or_else(|e| panic!("Datenbank {path} lässt sich nicht öffnen: {e}"));
    if let Some(code) = ti4_hub::auth::setup_code(&db).expect("Einrichtungscode") {
        println!(
            "Noch kein Admin. Im Hub auf „Anmelden“, dann „Registrieren“ mit diesem Code: {code}"
        );
    }
    let backup_db = db.clone();
    let backup_dir = std::path::PathBuf::from(format!("{}/backup", dir.trim_end_matches('/')));
    let app = ti4_hub::app(db, &origins, secure);

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Tokio-Runtime")
        .block_on(async move {
            let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
                .await
                .expect("Port belegt?");
            println!("TI4-Hub-API auf Port {port}, Daten in {path}");
            if keep > 0 {
                // Einmal pro Stunde nachsehen, ob es die Sicherung für heute schon gibt.
                tokio::spawn(async move {
                    let mut tick = tokio::time::interval(std::time::Duration::from_secs(3600));
                    loop {
                        tick.tick().await;
                        let (db, dir) = (backup_db.clone(), backup_dir.clone());
                        let res = tokio::task::spawn_blocking(move || {
                            ti4_hub::history::backup(&db, &dir, keep)
                        })
                        .await;
                        match res {
                            Ok(Ok(Some(f))) => println!("Sicherung angelegt: {}", f.display()),
                            Ok(Err(e)) => eprintln!("Sicherung fehlgeschlagen: {e}"),
                            _ => {}
                        }
                    }
                });
            }
            axum::serve(listener, app)
                .with_graceful_shutdown(async {
                    let _ = tokio::signal::ctrl_c().await;
                })
                .await
                .expect("Server");
        });
}
