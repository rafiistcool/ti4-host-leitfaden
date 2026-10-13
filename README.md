# TI4 Host-Leitfaden

Host-Begleiter für **Twilight Imperium: Vierte Edition** mit **Prophezeiung der Könige**, gebaut fürs Handy am Spieltisch und als Web-App installierbar.

- **Ablauf**: führt Schritt für Schritt durch Strategie-, Aktions-, Status- und Agendaphase, mit Ansagen für den Tisch, Warnhinweisen und passenden Regelverweisen. Runde und Hütermarker werden mitgezählt, die Agendaphase schaltet sich erst nach dem Hütermarker frei.
- **Kampf**: Checklisten für Raumkampf, Einmarsch und Bodenkampf zum Abhaken.
- **Aufbau**: Spielplan-Schema für 3 bis 8 Spieler mit allen offiziellen Varianten (Hyperrouten, große Galaxie, Alternativen), Tafeln pro Spieler, Legereihenfolge und der komplette Aufbau als Checkliste.
- **Kartengenerator**: würfelt eine Galaxie mit gezeichneten Systemtafeln, hält Anomalien und gleiche Wurmlöcher auseinander und gleicht die Plätze aus. Dazu Ausgleichstabelle, Liste der Tafeln zum Heraussuchen, Kartencode und teilbarer Link (gleiche Kartennummer ergibt dieselbe Karte).
- **Kompendium**: alle 25 Fraktionen (Grundspiel, PoK, Council Keleres) mit Fähigkeiten, Einheiten, Technologien, Anführern und Vertragskarte, alle Technologien sowie Aktionskarten, Agenden, Aufträge, Relikte und Erkundungskarten, filterbar.
- **Nachschlagen**: Themen (Taktikaktion, „Wann darf ich…?“, Handel, Strategiekarten, Limits und Einheitenwerte, PoK-Neuerungen, Aufbau) und eine **Regelreferenz A–Z** mit allen 101 Einträgen der Living Rules Reference 2.0, in eigenen Worten und mit den Absatznummern des offiziellen deutschen Regelhefts.
- **Suche** über Ablauf, Themen, Regeln, Fraktionen und Karten. Umlaute gehen auch als ae/oe/ue, englische Begriffe werden mitgefunden.
- **Offline**: Nach dem ersten Öffnen funktioniert alles ohne Netz, Schriften und Icons werden mitgeliefert.

Fortschritt und Häkchen werden nur lokal im Browser gespeichert (`localStorage`).

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

Im Container liefert nginx die Seite aus (`docker/nginx.conf`). Für HTTPS den Container hinter einen Reverse Proxy hängen, zum Beispiel Caddy:

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

Werte von Systemtafeln, Fraktionen und Karten stammen aus den Daten von [AsyncTI4](https://github.com/AsyncTI4/TI4_map_generator_bot) (Unlicense) und [KeeganW/ti4](https://github.com/KeeganW/ti4), gegeneinander abgeglichen. Kartentexte sind sinngemäß zusammengefasst, deutsche Namen nur dort, wo die deutsche LRR sie belegt. Die Systemtafeln sind selbst gezeichnet, Originalgrafiken von Fantasy Flight Games sind nicht enthalten.

Zusammengestellt von Rafael Till ([@rafiistcool](https://github.com/rafiistcool)) mit Unterstützung von Claude (Anthropic). Schriften: Saira Condensed, Source Sans 3, IBM Plex Mono, SIL Open Font License 1.1 (siehe `src/fonts/LICENSE-FONTS.txt`).
