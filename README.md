# TI4 Host-Leitfaden

Host-Begleiter für **Twilight Imperium: Vierte Edition** mit **Prophezeiung der Könige**, gebaut fürs Handy am Spieltisch.

- **Ablauf**: führt Schritt für Schritt durch Strategie-, Aktions-, Status- und Agendaphase, mit Ansagen für den Tisch, Warnhinweisen und passenden Regelverweisen. Runde und Hütermarker werden mitgezählt, die Agendaphase schaltet sich erst nach dem Hütermarker frei.
- **Kampf**: Checklisten für Raumkampf, Einmarsch und Bodenkampf zum Abhaken.
- **Nachschlagen**: Themen (Taktikaktion, „Wann darf ich…?“, Handel, Strategiekarten, Limits und Einheitenwerte, PoK-Neuerungen, Aufbau) und eine **Regelreferenz A–Z** mit allen 101 Einträgen der Living Rules Reference 2.0, in eigenen Worten und mit den Absatznummern des offiziellen deutschen Regelhefts.
- **Suche** über Ablauf, Themen und Regeln. Umlaute gehen auch als ae/oe/ue, englische Begriffe werden mitgefunden.

Fortschritt und Häkchen werden nur lokal im Browser gespeichert (`localStorage`).

## Nutzung

`index.html` im Browser öffnen. Die Datei ist eigenständig, außer den Schriften (Google Fonts) wird nichts nachgeladen. Ohne Internet greifen die Systemschriften.

## Aufbau des Repos

```
src/
  index.template.html   Gerüst
  style.css             Gestaltung (hell/dunkel)
  app.js                Navigation, Ablauf-Logik, Suche
  data/ablauf.js        Schritte der vier Phasen
  data/themen.js        Themen-Seiten fürs Nachschlagen
  data/regeln-1.js      Regelreferenz Nr. 1–50
  data/regeln-2.js      Regelreferenz Nr. 51–101
build.py                baut src/ zu index.html zusammen
```

Nach Änderungen in `src/`:

```
python3 build.py              # index.html
python3 build.py --fragment   # dist/artifact.html (ohne HTML-Gerüst)
```

## Credits

Inoffizielles Fan-Hilfsmittel. Twilight Imperium und Prophezeiung der Könige sind Marken von Fantasy Flight Games, die deutsche Ausgabe erscheint bei Asmodee. Kein Zusammenhang mit oder Unterstützung durch Fantasy Flight Games oder Asmodee.

Alle Regeltexte sind eigene Zusammenfassungen auf Grundlage der Living Rules Reference 2.0 (deutsch, 25.01.2021) inklusive Errata und FAQ. Bei Abweichungen gelten Kartentext und offizielle Regeln.

Zusammengestellt von Rafael Till ([@rafiistcool](https://github.com/rafiistcool)) mit Unterstützung von Claude (Anthropic). Schriften: Saira Condensed, Source Sans 3, IBM Plex Mono (SIL Open Font License).
