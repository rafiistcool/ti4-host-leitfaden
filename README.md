# TI4 Host-Leitfaden

Host-Begleiter für **Twilight Imperium: Vierte Edition** mit **Prophezeiung der Könige**, gebaut fürs Handy am Spieltisch und als Web-App installierbar.

- **Ablauf**: führt Schritt für Schritt durch Strategie-, Aktions-, Status- und Agendaphase, mit Ansagen für den Tisch, Warnhinweisen und passenden Regelverweisen. Runde und Hütermarker werden mitgezählt, die Agendaphase schaltet sich erst nach dem Hütermarker frei.
- **Kampf**: Checklisten für Raumkampf, Einmarsch und Bodenkampf zum Abhaken.
- **Aufbau**: Spielplan-Schema für 3 bis 8 Spieler mit allen offiziellen Varianten (Hyperrouten, große Galaxie, Alternativen), Tafeln pro Spieler, Legereihenfolge und der komplette Aufbau als Checkliste.
- **Kartengenerator**: würfelt eine Galaxie mit gezeichneten Systemtafeln, hält Anomalien und gleiche Wurmlöcher auseinander und gleicht die Plätze aus. Dazu Ausgleichstabelle, Liste der Tafeln zum Heraussuchen, Kartencode und teilbarer Link (gleiche Kartennummer ergibt dieselbe Karte).
- **Kompendium**: alle 25 Fraktionen (Grundspiel, PoK, Council Keleres) mit Fähigkeiten, Einheiten, Technologien, Anführern und Vertragskarte, alle Technologien sowie Aktionskarten, Agenden, Aufträge, Relikte und Erkundungskarten, filterbar.
- **Materialbilder**: 110 deutsche Originalabbildungen aus den Asmodee-PDFs und 48 englische Originalbögen für die 24 Grundspiel-/PoK-Fraktionen über TI4 Ultimate. Deutsche Originale werden bevorzugt; deutsche Textfassungen und Kurzreferenzen bleiben verfügbar. Jede Abbildung nennt Sprache, Edition und Quelle und lässt sich vergrößern. Weitere fehlende Bilder werden durch beschriftete deutsche SVG-Referenzhilfen ergänzt.
- **Nachschlagen**: Themen (Taktikaktion, „Wann darf ich…?“, Handel, Strategiekarten, Limits und Einheitenwerte, PoK-Neuerungen, Aufbau) und eine **Regelreferenz A–Z** mit allen 101 Einträgen der Living Rules Reference 2.0, in eigenen Worten und mit den Absatznummern des offiziellen deutschen Regelhefts.
- **Suche** über Ablauf, Themen, Regeln, Fraktionen und Karten. Umlaute gehen auch als ae/oe/ue, englische Begriffe werden mitgefunden.
- **Hub für eure Spielrunde**: Countdown zur nächsten Session, wer dabei ist und welche Fraktion gewählt hat (Fraktionsraster zum Antippen), Historie aller Partien mit Siegpunkten, Platzierungen und Sieger, Spieler- und Fraktionsstatistiken. Ohne Accounts: Jeder kann Spieler anlegen, Sessions planen und Ergebnisse eintragen.
- **Offline**: Nach dem ersten Öffnen funktioniert alles ohne Netz, Schriften und Icons werden mitgeliefert.

Fortschritt und Häkchen werden nur lokal im Browser gespeichert (`localStorage`). Die Hub-Daten liegen dagegen auf einem kleinen Server (Spring Boot, Ordner `server/`), damit alle denselben Stand sehen. Läuft keiner (z. B. bei GitHub Pages), speichert der Hub nur im eigenen Browser und sagt das auch.

## Hub-Server (Spring Boot)

`server/` ist eine Spring-Boot-4-Anwendung (Java 21) mit REST-API unter `/api`, Spring Data JPA, Flyway und einer H2-Datei-Datenbank. Kein Login: Wer die Seite öffnen kann, kann auch bearbeiten.

| Methode | Pfad | Zweck |
|---|---|---|
| `GET/POST` | `/api/players` | Spieler auflisten, anlegen (`{"name": "Basti"}`) |
| `PUT/DELETE` | `/api/players/{id}` | umbenennen, löschen (nur ohne eingetragene Spiele) |
| `GET/POST` | `/api/games` | alle Sessions (neueste zuerst), anlegen |
| `GET/PUT/DELETE` | `/api/games/{id}` | eine Session lesen, ändern, löschen |
| `GET` | `/api/actuator/health` | Healthcheck |

Eine Session hat Termin, Ort, Status (`PLANNED`/`FINISHED`), Siegpunkte zum Sieg und Teilnehmer mit Fraktion, Siegpunkten und Platz. Fehlt bei einem gespielten Spiel ein Platz, ergibt sich die Reihenfolge aus den Siegpunkten. Gleichzeitige Änderungen fängt optimistisches Sperren ab (`version`, Antwort 409). Fehler kommen als Problem Details mit deutschem `detail`.

```bash
cd server
mvn spring-boot:run          # http://localhost:8080/api/players, Daten in server/data/
mvn verify                   # Tests
```

Konfiguration über Umgebungsvariablen: `TI4_DATA_DIR` (Datenordner, im Container `/data`), `TI4_CORS_ALLOWED_ORIGINS` (nur wenn Seite und API unter verschiedenen Adressen laufen). Beim Bauen der Seite legt `HUB_API_URL` fest, wo die Seite die API sucht (Standard `api/`, also dieselbe Adresse; leer = nur lokal).

## Hosten

Die App ist rein statisch. `python3 build.py` erzeugt den Ordner `site/`, den jeder Webserver ausliefern kann. Für die Installation als App auf dem Handy braucht es **HTTPS** (Ausnahme: `localhost`).

### Variante A: GitHub Pages

1. Pages muss für das Repo verfügbar sein. Bei privaten Repos geht das nur mit einem bezahlten GitHub-Plan (Pro, Team), sonst das Repo öffentlich machen. Die Pages-Seite selbst ist in beiden Fällen öffentlich erreichbar.
2. **Settings › Pages › Build and deployment › Source: „GitHub Actions“** wählen.
3. Unter **Actions › GitHub Pages › Run workflow** einmal starten. Danach wird bei jedem Push auf `main` automatisch neu veröffentlicht.

Adresse: `https://rafiistcool.github.io/ti4-host-leitfaden/`

Solange Pages nicht aktiviert ist, überspringt der Workflow das Deployment nur mit einem Hinweis.

### Variante B: Docker

Bei jedem Push auf `main` baut die Action **Docker-Image** ein Image für `amd64` und `arm64` und legt es in der GitHub Container Registry ab: `ghcr.io/rafiistcool/ti4-host-leitfaden:latest`.

```bash
# Bei privatem Repo ist auch das Image privat: einmal anmelden
# (Personal Access Token mit dem Recht read:packages)
echo <TOKEN> | docker login ghcr.io -u rafiistcool --password-stdin

docker compose up -d          # nutzt docker-compose.yml, Port 8080
```

Oder direkt aus dem Repo bauen, ohne Registry:

```bash
docker compose up -d --build
```

`docker-compose.yml` startet zwei Container: `ti4-host` (nginx mit der Seite) und `ti4-hub-api` (Spring Boot, Image `ghcr.io/rafiistcool/ti4-host-leitfaden-api`). Die Hub-Daten liegen im Volume `ti4-hub-data`; zum Sichern reicht eine Kopie davon.

Im Container liefert nginx die Seite aus und leitet `/api/` an den Hub-Server weiter (`docker/nginx.conf`). Für HTTPS den Container hinter einen Reverse Proxy hängen, zum Beispiel Caddy:

```
ti4.example.de {
    reverse_proxy ti4-host:80
}
```

Nur im Heimnetz ohne Domain: Über eine reine `http://`-IP-Adresse lässt sich die Seite zwar öffnen und auf iOS zum Home-Bildschirm hinzufügen, Offline-Modus und „App installieren“ unter Android brauchen aber HTTPS. Tailscale (`tailscale serve`) oder ein Proxy mit eigenem Zertifikat lösen das.

## Auf dem Handy als App

- **iPhone, iPad**: Seite in **Safari** öffnen › Teilen-Symbol › **Zum Home-Bildschirm**.
- **Android**: Seite in **Chrome** öffnen › Menü (drei Punkte) › **App installieren** bzw. **Zum Startbildschirm hinzufügen**.

Danach startet der Leitfaden im Vollbild mit eigenem Icon. Lange auf das Icon drücken (Android) bietet direkte Sprünge zu Kampf, Regeln und Suche.

## Entwicklung

```
src/
  index.template.html   Gerüst
  style.css             Gestaltung (hell/dunkel)
  app.js                Navigation, Ablauf-Logik, Suche
  map.js                Spielplan-Geometrie, gezeichnete Systemtafeln, Generator
  aufbau.js             Ansichten Aufbau und Kartengenerator
  kompendium.js         Ansichten Fraktionen, Technologien, Karten
  hub.js                Hub: Sessions, Fraktionswahl, Historie, Statistiken (Server oder lokal)
  assets.js             Originalmaterial, Quellen, Bildvergrößerung
  assets/               lokale Originalausschnitte und SVG-Referenzhilfen
  data/de-namen.js      deutsche Anzeigenamen mit Herkunftskennzeichnung
  data/original-assets.js Originalmanifest mit Quelle, Edition, PDF-Seite, Prüfsumme
  data/english-sheets.js englische Originalbögen, Sprache und Community-Herkunft
  data/reference-assets.js Referenzbilder für das Kompendium
  data/ablauf.js        Schritte der vier Phasen
  data/themen.js        Themen-Seiten fürs Nachschlagen
  data/regeln-1.js      Regelreferenz Nr. 1–50
  data/regeln-2.js      Regelreferenz Nr. 51–101
  data/tiles.js         Systemtafeln 1–91 mit Planeten, Anomalien, Wurmlöchern, Hyperrouten
  data/layouts.js       offizielle Spielplan-Zusammensetzungen
  data/fraktionen.js    Fraktionen
  data/karten-1.js      Technologien, Aufträge, Relikte, Erkundung
  data/karten-2.js      Aktionskarten, Agenden
  pwa/                  Manifest und Service Worker
  icons/                App-Icons (SVG-Quelle und PNG)
  fonts/                Schriften als woff2 mit Lizenz
build.py                baut src/ zu site/ zusammen
server/                 Hub-API (Spring Boot, Maven, eigenes Dockerfile)
Dockerfile, docker/     Image mit nginx
.github/workflows/      GitHub Pages und Docker-Image
```

```bash
python3 build.py                     # site/ bauen
python3 -m http.server -d site 8000  # lokal testen: http://localhost:8000
python3 build.py --artifact          # dist/artifact.html, einzelne Datei ohne HTML-Gerüst
```

Nach einer Änderung in `src/` bekommt der Service Worker automatisch eine neue Version. Installierte Apps holen sich die neue Seite beim nächsten Öffnen mit Netz.

## Credits

Inoffizielles Fan-Hilfsmittel. Twilight Imperium und Prophezeiung der Könige sind Marken von Fantasy Flight Games, die deutsche Ausgabe erscheint bei Asmodee. Kein Zusammenhang mit oder Unterstützung durch Fantasy Flight Games oder Asmodee.

Alle Regeltexte sind eigene Zusammenfassungen auf Grundlage der Living Rules Reference 2.0 (deutsch, 25.01.2021) inklusive Errata und FAQ. Bei Abweichungen gelten Kartentext und offizielle Regeln.

Werte von Systemtafeln, Fraktionen und Karten stammen aus den Daten von [AsyncTI4](https://github.com/AsyncTI4/TI4_map_generator_bot) (Unlicense) und [KeeganW/ti4](https://github.com/KeeganW/ti4). Kartentexte sind sinngemäß zusammengefasst. Die Systemtafeln des Kartengenerators sind selbst gezeichnet.

Deutsche Originalabbildungen stammen aus den öffentlich angebotenen Downloads auf den [Asmodee-Grundspiel](https://www.asmodee.de/produkte/twilight-imperium-4-edition)- und [PoK-Produktseiten](https://www.asmodee.de/produkte/twilight-imperium-4-edition-prophezeiung-der-koenige). Die Rechte verbleiben bei Fantasy Flight Games und Asmodee; es wird keine freie Bildlizenz behauptet. Das Manifest in `src/assets/original/manifest.json` enthält direkte PDF-Links, Seiten, Zuschnitte, Drehung, Edition und Prüfsummen.

Ein vollständiger deutscher Scan aller Boxkarten und Fraktionsbögen war nicht auffindbar. Für die fehlenden deutschen Bögen sind englische Vorder- und Rückseiten der 24 Grundspiel-/PoK-Fraktionen eingebunden, über den Community-Spiegel [TI4 Ultimate](https://ti4ultimate.com/game/factions), anhand [AsyncTI4](https://github.com/AsyncTI4/TI4_map_generator_bot/tree/e06e41074e1bcc1e636331f40a55fa1643802852/src/main/resources/data/factions) zugeordnet und byteidentisch übernommen. Keleres bleibt vollständig deutsch; beim Xxcha-Bogen steht die deutsche Regelheftabbildung zuerst, die englische hohe Auflösung als Alternative. Deutsche Textfassungen öffnen sich bei englischen Bögen automatisch. Fehlende weitere Bilder bleiben eigene SVG-Referenzhilfen, dauerhaft mit **„REFERENZHILFE · SINNGEMÄSS“** markiert. Deutsche Namen stammen aus belegten Originalen, bisherigen Daten oder einer gekennzeichneten eigenen Übersetzung. Codex-Ω-Fassungen sind optional. Der [Assetreview](docs/asset-review.md) dokumentiert Prüfungen und Grenzen.

Die Bilder liegen lokal und werden vom Service Worker zusammen mit der App zwischengespeichert (gesamte Website rund 34 MB). Vollständige Original-PDFs und externe Originalbildquellen benötigen Netz. `python3 build.py --artifact` bettet die Bilddateien in den Ein-Datei-Export ein.

Zum Aktualisieren der Assets: `node scripts/generate_reference_assets.mjs` erzeugt Referenzhilfen aus den Spieldaten. `scripts/import_original_assets.py <PDF-Ordner>` extrahiert die festgelegten Originalausschnitte; benötigt Poppler, Pillow und pdfplumber. Die erwarteten Dateinamen und offiziellen Quellen stehen im Skript. Nach Datenänderungen zuerst Referenzbilder neu erzeugen, dann `python3 build.py` ausführen.

`node scripts/import_english_sheets.mjs <Download-Ordner>` importiert die englischen Bögen anhand des geprüften Download-Manifests. Die getrennten Manifeste in `src/assets/original/` und `src/assets/english-sheets/` bewahren Sprache, Zuordnung und Prüfsummen. Im Runtime-Katalog werden beide zusammengeführt.

`node scripts/check_assets.mjs` prüft nach dem Build Referenzabdeckung, deutsche Namen, Quellen, Original-Prüfsummen, Zielschlüssel, Ω-Trennung und Offline-Pfade.

Zusammengestellt von Rafael Till ([@rafiistcool](https://github.com/rafiistcool)) mit Unterstützung von Claude (Anthropic). Schriften: Saira Condensed, Source Sans 3, IBM Plex Mono, SIL Open Font License 1.1 (siehe `src/fonts/LICENSE-FONTS.txt`).
