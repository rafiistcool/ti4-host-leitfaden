# Verbesserungsplan: Optik und Bedienung

Die App hat ein starkes Fundament: ein sauberes Token-System mit Dunkelmodus, einen klar geführten Ablauf mit sprechendem Weiter-Knopf, eine vorbildliche „Darf ich das?“-Logik und gezeichnete Systemtafeln mit viel TI4-Atmosphäre. Die größten Reibungen am Tisch sind die Navigation (Zurück springt nach oben, Fokus geht verloren, Kopf zeigt nicht, wo man ist), am Handy zu viel fester Rahmen im Ablauf und einige echte Bugs: das aufgeblähte Suchfeld, die Hub-Fraktionsstatistik mit 1,32:1 Kontrast, das iOS-Zoomen in Hub-Formularen, eingefrorene Plätze nach Siegpunkt-Korrekturen und die Scrollsperre nach dem Vollbild. Inhaltlich führen zwei Nummernsysteme (LRR-EN in „Darf ich das?“ gegen Nr. im deutschen Regelheft) zu falschen Nachschlagezielen. Das Kompendium wird durch Referenzbilder, die den Text doppeln, fast doppelt so lang. PWA und Offline sind solide angelegt, laden aber 34 MB atomar und starten bei schlechtem Netz bis zu 3 s verzögert. Die meisten Verbesserungen sind kleine CSS- oder JS-Eingriffe ohne Frameworks und passen zum ES5-Stil.

**196 Punkte**, davon 25 mit Priorität P1 und 60 schnelle Gewinne. Entstanden aus 342 gegengeprüften Einzelbefunden, 24 wurden verworfen. Interaktive Fassung mit Filtern: `plan.html` (lokal im Browser öffnen), Rohdaten: `plan.json`.

Legende: P1 hoch, P2 mittel, P3 Feinschliff · Wirkung 1–3 · Aufwand S/M/L · ⚡ schneller Gewinn · 🏗 großer Umbau

## Was so bleiben soll

- Der Ablauf behält seine Position überall (Pille „‹ Ablauf …“, Rail-Unterzeile, localStorage) und der große Dock-Knopf nennt den nächsten Schritt beim Namen.
- „Darf ich das?“: eine Frage pro Schritt, gleich große Ja/Nein-Knöpfe, änderbare Antwortspur, fünf farb- und textcodierte Ergebnisarten mit Regelbeleg, vorbildliche Fokusführung.
- Sauberes Token-System auf :root mit vollständigem Dunkelmodus; Gold als Primärfarbe im Dunkeln; Spielobjekte (Fraktionsbogen, Tafeln) bleiben in beiden Modi dunkel.
- Gezeichnete Systemtafeln komplett aus den Spieldaten, deterministische Generator-Links (Seed/Hash) und einheitliche Sitzfarben P1–P8.
- Tolerante Suche (Umlaute als ae/oe/ue, englische Begriffe, Typzeile je Treffer) und stabile Deeplinks #r-/#t-/#tech-.
- Generator-Sheet und Bildbetrachter sind zugänglich gebaut (role=dialog nur offen, Fokusfalle, Escape, Fokus-Rückgabe); dieses Muster sollte appweit gelten.
- Schnell und robust ohne Framework: FCP 132 ms, Filter schalten nur hidden, CLS 0, keine Konsolenfehler und kein horizontaler Überlauf in 92 Aufnahmen.
- Hub-Logik durchdacht: lokaler Modus spiegelt Server-Validierung, optimistisches Sperren mit klarem Konfliktdialog, zweistufiges Löschen, Polling pausiert beim Tippen.
- Herkunft des Bildmaterials sauber gekennzeichnet (Original/Referenzhilfe, Edition, Quelle, ©) und deutsche Typografie in den Daten weitgehend korrekt.
- Safe-Areas oben/unten, erlaubter Zoom, Felder ≥16 px außerhalb des Hubs und prefers-reduced-motion werden beachtet.

## Inhalt

- [Navigation & Orientierung](#1-navigation--orientierung)
- [Am Spieltisch: Ablauf](#2-am-spieltisch-ablauf)
- [Kampf & Darf ich das?](#3-kampf--darf-ich-das)
- [Suche & Nachschlagen](#4-suche--nachschlagen)
- [Aufbau & Generator](#5-aufbau--generator)
- [Kompendium](#6-kompendium)
- [Hub](#7-hub)
- [Barrierefreiheit & Designsystem](#8-barrierefreiheit--designsystem)
- [PWA, Offline, Plattform & Teilen](#9-pwa-offline-plattform--teilen)

## 1. Navigation & Orientierung

Am Tisch springt man ständig zwischen Ablauf und Nachschlagen; Zurück, Kopfzeile, Titel und Fokus entscheiden, ob man den Faden behält.

### N1 · Zurück stellt Scrollposition und offene Regeln wieder her

**P1** · Wirkung 3/3 · Aufwand M · Navigation · aus 5 Befunden

**Problem:** Jede Zurück-Navigation landet ganz oben; offene Regeln sind zu. Bei 7.800–44.000 px langen Seiten geht die Stelle verloren.

**Vorschlag:** history.scrollRestoration='manual'; pro Verlaufseintrag per replaceState eine ID; beim Verlassen (Capture-Klick auf a[href^='#'], go()) {y, offene details} merken; bei Zurück/Vor nach render per rAF wiederherstellen, sonst wie bisher nach oben.

**Beleg:** `app.js:99 → render(true) → app.js:676 scrollTo(0,0); Messungen: Fraktionen 2500→0, Regeln 3810→0, Kampf 3254→0`

Dateien: `src/app.js`

### N3 · Eigener Dokumenttitel pro Seite ⚡

**P2** · Wirkung 2/3 · Aufwand S · Navigation · aus 2 Befunden

**Problem:** document.title ist überall „TI4 Host-Leitfaden“: Verlauf, Tabs, App-Umschalter und Screenreader unterscheiden Seiten nicht.

**Vorschlag:** Am Ende von render() document.title = Seitentitel + ' · TI4 Host' (Ablauf: Schritt · Runde; Suche: „Suche: q“; Hub: Bereich/Session).

**Beleg:** `report.json: 92× gleicher title; kein document.title in src`

Dateien: `src/app.js`, `src/hub.js`

### N5 · Aktiven Tab erneut tippen scrollt nach oben ⚡

**P2** · Wirkung 2/3 · Aufwand S · Navigation

**Problem:** Gewohnte Geste fehlt; gleicher Hash löst nichts aus.

**Vorschlag:** Im Klick-Handler bei Tab/Rail-Link mit aria-current und gleichem Hash preventDefault und scrollTo(0); auf #suche danach #q fokussieren.

**Beleg:** `x-retap-tab: 1268 → 1268; app.js:635-640`

Dateien: `src/app.js`

### N8 · #t-kampf wie #kampf behandeln ⚡

**P2** · Wirkung 2/3 · Aufwand S · Navigation · aus 2 Befunden

**Problem:** Kampf existiert unter zwei Adressen mit unterschiedlichem aktivem Tab, Titel und Zurück-Link.

**Vorschlag:** parseHash: h==='kampf'||h==='t-kampf' → Kampf-Tab (Muster wie t-aufbau in aufbau.js:393); refChip/Suchindex optional direkt #kampf.

**Beleg:** `app.js:84, 146, 184, 353; ia-t-kampf.png`

Dateien: `src/app.js`

### N9 · Nachschlagen-Startseite: A–Z nach oben, Gruppen wie Rail ⚡

**P2** · Wirkung 2/3 · Aufwand S · Navigation · aus 2 Befunden

**Problem:** 2112 px am Handy; Regelreferenz erst bei y≈1160; Generator unter Kompendium statt Vorbereitung; Originalmaterial mit Karten-Icon.

**Vorschlag:** Unter 600 px: Suchfeld, Regelreferenz groß, Kompendium, Themen als 2-Spalten-Kacheln ohne Beschreibung, „Mehr“ (Originalmaterial, Credits, Neue Partie). Aufbau/Generator in „Vorbereitung“. Ziel A–Z im ersten Bildschirm.

**Beleg:** `app.js:346-366; m-nachschlagen.png; Prototyp doc 1257, azTop 285`

Dateien: `src/app.js`, `src/style.css`, `src/data/themen.js`

### N2 · Kopf zeigt echten Seitentitel plus Zurück-Knopf nach Herkunft

**P2** · Wirkung 2/3 · Aufwand M · Navigation · aus 6 Befunden

**Problem:** Kopf sagt auf Themen/Regeln/Credits nur „Nachschlagen“; darunter ein fester „‹ Nachschlagen“-Link, der nicht zur Herkunft (Suche, Kampf, Regel) führt und ~60 px kostet.

**Vorschlag:** Kopftitel aus Thema/Regel/route.title; links ein 44-px-Zurück-Knopf: mit In-App-Vorgänger (history.state.from) Beschriftung „‹ Suche/Kampf…“ und history.back(), sonst Elternseite. Inline-.back-Links entfallen. Geöffnete Regel per replaceState als #r-id. Entschieden: history.back mit Eintrags-State, weil es mit N1 die Position wiederherstellt.

**Beleg:** `app.js:570 Titelmap, app.js:375/390/518, kompendium.js:54, assets.js:43; x-metrics-sub h1 erst bei y=140`

Dateien: `src/app.js`, `src/kompendium.js`, `src/assets.js`, `src/aufbau.js`, `src/style.css`

### S6 · Ablauf-Treffer als Lese-Ansicht #schritt-p-s

**P2** · Wirkung 2/3 · Aufwand M · Suche & Nachschlagen · aus 2 Befunden

**Problem:** Ein Suchtreffer „Ablauf · …“ verschiebt die laufende Partie; Schritte sind nicht teilbar.

**Vorschlag:** Route #schritt-<p>-<s> zeigt den Schritt nur zum Lesen mit „Deine Partie steht bei …“ und Knöpfen „Hierher springen“/„Zurück zur Partie“; Suchtreffer verlinken darauf.

**Beleg:** `app.js:440, 506, 701; m-jump pos geändert`

Dateien: `src/app.js`

### P7 · Zurück-Geste schließt Overlays

**P2** · Wirkung 2/3 · Aufwand M · PWA & Plattform · aus 2 Befunden

**Problem:** Zurück bei offenem Sheet wechselt die Karte; Bilddialog bleibt über der neuen Seite.

**Vorschlag:** Bei Routenwechsel Dialog schließen; Sheet/Vollbild mit CloseWatcher, Fallback pushState+popstate; Optionen per replaceState.

**Beleg:** `gen-back-sheet.png; back-dialog.png; aufbau.js:302-318`

Dateien: `src/aufbau.js`, `src/assets.js`, `src/app.js`

### N4 · Unbekannte Links zeigen „Link nicht gefunden“ statt Ablauf

**P3** · Wirkung 1/3 · Aufwand S · Navigation · aus 2 Befunden

**Problem:** Vertippte oder veraltete Hashes (#f-xyz, kaputte Einladung) landen kommentarlos im Ablauf.

**Vorschlag:** parseHash: nur '' und #ablauf → Ablauf, sonst {v:'notfound'}; Karte mit präfixabhängigem Hinweis, bis zu 5 Suchtreffern und Links zu Ablauf/Suche.

**Beleg:** `app.js:91 Fallback; r0-gen-bad.png, #f-xyz`

Dateien: `src/app.js`

### N6 · Tab-Leiste: Platz für „Nachschlagen“, 12 px, aktiver Tab nicht nur Farbe

**P3** · Wirkung 1/3 · Aufwand S · Navigation

**Problem:** „Nachschlagen“ (67 px) ist breiter als seine 64-px-Zelle; Labels 11,5 px; aktiv nur per Farbe.

**Vorschlag:** grid-template-columns repeat(3,1fr) 1.3fr repeat(2,1fr), Labels 12 px; aktiver Tab mit Goldbalken oben oder Icon-Feld plus 700.

**Beleg:** `style.css:102-105; r-tab-390/360/320`

Dateien: `src/style.css`

### N7 · Fortsetzen-Pille: 40 px, mit Runde, am Desktop aus

**P3** · Wirkung 1/3 · Aufwand S · Navigation · aus 2 Befunden

**Problem:** Pille 155×36, ohne Runde, am Desktop doppelt zur Rail und im dunklen Hub-Kopf hellbeige.

**Vorschlag:** height:40px; Text „‹ Runde 2 · Aktion 3/6“; ab 960 px ausblenden (Rail zeigt dasselbe), damit entfällt auch der Hub-Stilbruch. Optional Hub-Farbliterale auf Tokens.

**Beleg:** `style.css:69, 743-744, 789; app.js:549; x-hub-desk-pill.png`

Dateien: `src/app.js`, `src/style.css`

### N10 · Dezente Richtungsanimation beim Schrittwechsel

**P3** · Wirkung 1/3 · Aufwand S · Navigation

**Problem:** Weiter ersetzt den Inhalt hart; ähnliche Schritte wirken unverändert.

**Vorschlag:** rerenderAblauf(dir) setzt enter-fwd/enter-back an #view (140 ms opacity+translateX); reduced-motion: animation:none ergänzen. Tabs bleiben sofort.

**Beleg:** `app.js:656-679; style.css:785 nur transition`

Dateien: `src/app.js`, `src/style.css`

## 2. Am Spieltisch: Ablauf

Der Ablauf ist die Kernansicht; weniger Rahmen, klare Hauptknöpfe, Schutz vor Fehltipps und Hilfen für Spielerzahl, Zug und Spielende sparen jede Runde Zeit.

### A9 · Bildschirm anlassen (Wake Lock) ⚡

**P1** · Wirkung 3/3 · Aufwand S · Ablauf · aus 2 Befunden

**Problem:** Während langer Züge sperrt das Handy; vor jedem Tipp entsperren.

**Vorschlag:** 40-px-Icon-Schalter im Kopf von Ablauf/Kampf (aria-pressed „Bildschirm anlassen“), Standard aus wegen Akku, gemerkt in ti4.v2.wake; navigator.wakeLock in try/catch, bei visibilitychange neu anfordern, Anzeige folgt dem release-Ereignis; nur rendern, wenn unterstützt. Entschieden: Kopf statt Nachschlagen, Standard aus.

**Beleg:** `grep wakeLock: 0 Treffer; wakeLock in navigator = true`

Dateien: `src/app.js`, `src/style.css`

### A1 · Ablauf-Kopf am Handy verschlanken, Schrittliste überall

**P1** · Wirkung 3/3 · Aufwand M · Ablauf · aus 9 Befunden

**Problem:** Kopf+Dock belegen 311 von 844 px (37 %, bei 360×640 49 %); Phase steht dreimal; Direktsprung nur über 24×30-Punkte; Tablet hat 420 px Leerraum.

**Vorschlag:** .dots-Zeile unter 960 px entfernen; Fortschritt als anteilige Füllung im aktuellen Phasenbalken (sticky, aria-hidden); Eyebrow „Schritt x von y“; .allsteps auf allen Breiten statt .upcoming, Zeilen ≥44 px. Entschieden: Punkte nicht in die Eyebrow, damit Fortschritt beim Scrollen sichtbar bleibt.

**Beleg:** `app.js:325, 565-568, 333-342; style.css:80-86, 134, 748; m-ablauf.png, t-ablauf.png`

Dateien: `src/app.js`, `src/style.css`

### A2 · „Nächster Zug“ als Hauptknopf, Verzweigung nach Schritt 2 ⚡

**P1** · Wirkung 2/3 · Aufwand S · Ablauf · aus 2 Befunden

**Problem:** Der häufigste Knopf (20–40× pro Runde) ist sekundär, „Alle gepasst“ primär unter dem Daumen; bei 320 px nur „A..“; Schritt 3 gilt nur nach Strategieaktion.

**Vorschlag:** Im Loop-Schritt Rollen tauschen (next-turn = .btn.primary mit svg reset); „Alle gepasst“ sekundär, white-space normal. In Schritt 2 zwei Inline-Knöpfe „Strategieaktion → Sekundär abfragen“ / „Andere Aktion → Zug beenden“; Dock bleibt linear.

**Beleg:** `app.js:625-631, 127; step5-320/360; ablauf.js Schritt 3`

Dateien: `src/app.js`, `src/style.css`

### A4 · Hütermarker: echter Schalter, gesperrte Agenda erklärt sich ⚡

**P1** · Wirkung 2/3 · Aufwand S · Ablauf · aus 7 Befunden

**Problem:** Tipp auf gesperrte Agenda tut nichts (Grund nur im title, 2,4:1); „Hüter liegt/entfernt“ wirkt wie Badge und klingt widersprüchlich; Statusende sagt nur „oben umschalten“; bei 320 px läuft der Kopf über.

**Vorschlag:** role=switch, aria-checked, sichtbar „Hütermarker“ mit Track; Tipp auf gesperrte Phase zeigt Inline-Notiz (role=status) mit Knopf „Hütermarker wurde entfernt“ (data-act=cust); derselbe Knopf ersetzt den Satz in der locked-note; Schloss-Icon am Label; Ausschalten in der Agendaphase mit Rückfrage; 320-px-CSS (gap/padding).

**Beleg:** `app.js:553, 562, 699, 332, 704-707; style.css:62, 79; m-320-cust.png sw=327`

Dateien: `src/app.js`, `src/style.css`

### A5 · Rundenzähler nur korrigieren, Rückgängig für Rundenwechsel ⚡

**P1** · Wirkung 2/3 · Aufwand S · Ablauf · aus 4 Befunden

**Problem:** „+“ springt ohne Rückfrage auf Strategie 1/4 und löscht Häkchen und Darf-Antworten; „−“ ändert nur die Zahl; Doppeltipp auf Weiter kann eine Runde starten.

**Vorschlag:** +/− korrigieren nur die Zahl (aria-label „Rundenzahl erhöhen“), „−“ bei Runde 1 disabled. Gemeinsamer Shell-Toast D.UI.toast(text,{action}) mit 44-px-Knopf über Dock-Höhe (--dock-h); vor Rundenwechsel Schnappschuss {st,checks,darfSt} und „Runde 3 gestartet · Rückgängig“ (6 s); „Runde X starten“ erst nach 500 ms Sichtbarkeit klickbar.

**Beleg:** `app.js:702-703, 114; m-round-plus: {p:1,s:3}→{p:0,s:0}; style.css:1012 Toast ohne pointer-events`

Dateien: `src/app.js`, `src/style.css`, `src/hub.js`

### A7 · Gespeicherten Ablauf-Stand prüfen, render absichern ⚡

**P1** · Wirkung 2/3 · Aufwand S · Ablauf · aus 2 Befunden

**Problem:** Ungültige ti4.v2.pos (z. B. nach Daten-Update) wirft TypeError: leere Seite ohne Tab-Leiste und ohne Ausweg.

**Vorschlag:** Beim Laden p/s/round klemmen, cust boolean, Agenda ohne cust → Status-Ende; renderTabbar zuerst, renderView in try/catch mit Karte „Zum Ablauf / Fortschritt zurücksetzen“.

**Beleg:** `app.js:15, 324, 653-657; corrupt-stepOutOfRange.png`

Dateien: `src/app.js`

### A3 · Weiter-Beschriftung zweizeilig statt abgeschnitten ⚡

**P2** · Wirkung 2/3 · Aufwand S · Ablauf

**Problem:** Ziel des Weiter-Knopfs wird in 7/24 (390 px) bis 18/24 (320 px) Schritten abgeschnitten.

**Vorschlag:** <small>Weiter</small><b>Titel</b> mit line-clamp 2, min-height 56 px; nextLabel liefert [Kicker, Titel].

**Beleg:** `style.css:100; app.js:123-129; m-ablauf.png`

Dateien: `src/app.js`, `src/style.css`

### A12 · Spielende im Ablauf abbilden

**P2** · Wirkung 2/3 · Aufwand S · Ablauf

**Problem:** Der Ablauf läuft endlos; die Warnung „Spiel endet sofort“ bietet keine Aktion.

**Vorschlag:** „Aufträge werten“ ergänzt (LRR 82.1, 77.7); regeln-2.js:211 „10 (bzw. 14)“ (77.2a); Nebenknopf „Partie beenden“ → Ende-Ansicht mit Siegerregel (77.7/77.8, 82.2b), „Ergebnis im Hub eintragen“ und „Ablauf zurücksetzen“.

**Beleg:** `app.js:110-129; ablauf.js:46-49; j07-m-ablauf-agenda-ende.png`

Dateien: `src/app.js`, `src/data/ablauf.js`, `src/data/regeln-2.js`

### P13 · Querformat und 200 %-Zoom: Kopf nicht sticky, Dock kompakt ⚡

**P2** · Wirkung 2/3 · Aufwand S · PWA & Plattform · aus 3 Befunden

**Problem:** Bei 390 px Höhe bleiben 79 px Inhalt; Ja/Nein hinter dem Dock.

**Vorschlag:** @media (max-height:520px): .top static, kompakte Aktions- und Tab-Leiste (44/40 px, Labels ≥11 px); --top-h nur bei sticky; scroll-padding für Fokus (2.4.11).

**Beleg:** `L-ablauf free 79; ov-ablauf-640`

Dateien: `src/style.css`, `src/app.js`

### A6 · Neue Partie dort, wo man sie sucht, mit Rückgängig und Fortsetzen-Karte

**P2** · Wirkung 2/3 · Aufwand M · Ablauf · aus 5 Befunden

**Problem:** „Neue Partie“ liegt ganz unten in Nachschlagen, ohne Undo; nach Tagen steht die alte Partie kommentarlos da; Erststart ohne Hinweis auf Aufbau.

**Vorschlag:** Ende des Aufbaus: „Aufbau fertig – Runde 1 starten“ (Zwei-Tipp, wenn Partie läuft); dezenter Knopf unter „Alle Schritte“ und in der Rail; st.t speichern, nach >12 h Karte „Partie vom Sa., 11. Okt.: Runde 4 · Weiterspielen / Neue Partie“; einmalige Erststart-Karte „Zuerst den Aufbau“. Mit Toast aus A5 sofortiger Reset plus 10-s-Rückgängig.

**Beleg:** `app.js:364, 716-725, 14-15, 103; aufbau.js:96-99; m-nachschlagen.png y≈1900`

Dateien: `src/app.js`, `src/aufbau.js`, `src/style.css`

### A8 · Bestätigte Spielerzahl überspringt nicht geltende Schritte

**P2** · Wirkung 2/3 · Aufwand M · Ablauf · aus 3 Befunden

**Problem:** Jede Runde müssen 5–8 Spieler „Zweite Karte bei 3 oder 4“ und 4/8 Spieler „Handelswaren“ wegtippen; Warnungen gelten nicht für alle.

**Vorschlag:** st.n (Default null) per Zeile „Wie viele Spieler? 3–8“ im ersten Strategieschritt, aus ti4.v2.setup nur vorausgewählt; Metadaten onlyPlayers/skipPlayers; goNext/goPrev/nextLabel überspringen, Schrittliste zeigt „entfällt bei n Spielern“; Regeltexte unverändert; Neue Partie leert st.n.

**Beleg:** `ablauf.js:10-15, 26; aufbau.js:50, 431`

Dateien: `src/app.js`, `src/data/ablauf.js`

### A10 · Zughelfer: wer ist dran, wer hat gepasst 🏗

**P2** · Wirkung 2/3 · Aufwand L · Ablauf · aus 2 Befunden

**Problem:** Initiativreihenfolge und gepasste Spieler muss der Host im Kopf behalten.

**Vorschlag:** Optional: Spielerliste (frei oder aus Hub-Session), im Initiative-Schritt Namen in Reihenfolge antippen; Aktionsphase zeigt „Am Zug: Name“ und Gepasst-Chips mit Text; „Nächster Zug: Name ›“ überspringt Gepasste; alle gepasst → „Alle gepasst“ primär; Leeren bei Rundenwechsel/Neue Partie. Regel bleibt beim Menschen, Texte unverändert.

**Beleg:** `ablauf.js:16-23, 36-38; app.js:698; regeln-1.js:384 (Nr. 45)`

Dateien: `src/app.js`, `src/data/ablauf.js`, `src/style.css`, `src/hub.js`

### A11 · Optionaler Punktestand im Ablauf

**P3** · Wirkung 2/3 · Aufwand M · Ablauf

**Problem:** Die App kennt den Spielstand nie und kann weder warnen noch ein Ergebnis an den Hub übergeben.

**Vorschlag:** Einklappbare Liste „Punktestand (optional)“ in „Aufträge werten“ mit −/+ je Spieler, Deckel bei 10/14 (LRR 77.4a); Pokal-Zugang im Kopf; Hinweis „Hütermarker: 1 SP (LRR 40.3)“; Werte später im Hub-Editor vorbelegt; Tischleiste bleibt maßgeblich.

**Beleg:** `ablauf.js:41-45; app.js:704-708; LRR 40.3, 77.4a`

Dateien: `src/app.js`, `src/data/ablauf.js`, `src/style.css`

### A13 · „Danach“ am Phasenende zeigt die Folgephase

**P3** · Wirkung 1/3 · Aufwand S · Ablauf

**Problem:** Im letzten Schritt ist die Vorschau leer, gerade wenn eine neue Phase/Runde kommt.

**Vorschlag:** Bei leerem up Kopf der nächsten Phase mit 2 Schritten, bei Rundenende „Runde N+1 · Strategiephase“, im Loop beide Zweige.

**Beleg:** `app.js:337-342; m-a5.png, m-s8.png`

Dateien: `src/app.js`

### A14 · Bessere Silbentrennung in Schritt-Überschriften

**P3** · Wirkung 1/3 · Aufwand S · Ablauf

**Problem:** „Strategiekar-ten“, „Sekundärfähig-keiten“ bei 34-px-Display.

**Vorschlag:** h1{hyphenate-limit-chars:8 4 4; -webkit-hyphens:auto} plus Safari-Limits.

**Beleg:** `style.css:110; s0-320.png`

Dateien: `src/style.css`

### A15 · Zweites Fenster übernimmt Ablauf-Stand (storage-Event)

**P3** · Wirkung 1/3 · Aufwand S · Ablauf

**Problem:** Zwei Tabs überschreiben sich gegenseitig mit veraltetem Stand.

**Vorschlag:** window storage-Listener für ti4.v2.pos/checks: st übernehmen, render(false).

**Beleg:** `app.js:15, 103; kein storage-Listener`

Dateien: `src/app.js`

## 3. Kampf & Darf ich das?

Regelbelege müssen ins deutsche Regelheft führen, Kampfabläufe brauchen Runden und Sprünge, Prüfungen sollen weiterführen.

### K1 · Regelbelege in „Darf ich das?“ auf deutsche Nummern umstellen und verlinken 🏗

**P1** · Wirkung 3/3 · Aufwand L · Kampf & Darf ich das? · aus 4 Befunden

**Problem:** Belege nennen englische LRR-Nummern („LRR 94“), Chips/Regelreferenz die deutschen („Nr. 91“); wer nachschlägt, landet falsch (94 = Verteidiger, 27 = Einmarsch). Belege sind tote Spans.

**Vorschlag:** Alle 73 Belege einmalig strukturiert ablegen (refs:['r:transaktionen@1']), Hauptnummer über r.en zuordnen, jeden Absatz gegen die deutsche LRR 2.0 prüfen (keine neue Regelaussage). Rendern als refChip-Links „Nr. 91.1 Transaktionen“ (≥44 px, aria-label); Kartenbelege → #tech-/#karten-. Ein Satz im Lead der Regelreferenz; Chip-Überschrift einheitlich „Regeln dazu“.

**Beleg:** `darfich.js:21, 32, 104, 114, 156; regeln-1/2.js nr; app.js:226, 247; lrr-de.txt Z. 1243, 2221`

Dateien: `src/data/darfich.js`, `src/app.js`, `src/data/regeln-1.js`, `src/data/regeln-2.js`

### K5 · „Nächster Zug“ leert Kampf-, Taktik- und Handelslisten ⚡

**P1** · Wirkung 2/3 · Aufwand S · Kampf & Darf ich das? · aus 2 Befunden

**Problem:** Der nächste Spieler sieht Häkchen aus dem vorigen Zug.

**Vorschlag:** resetTurn() mit clearChecks([raumkampf,einmarsch,taktik,handel]) und darfSt={} für next-turn, round+ und goNext.

**Beleg:** `app.js:698 vs. 114/702`

Dateien: `src/app.js`

### K4 · Raumkampf-Checkliste mit Kampfrunden ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kampf & Darf ich das? · aus 2 Befunden

**Problem:** Ab Runde 2 müssen Schritte 2–6 einzeln abgewählt werden; Rundennummer unbekannt.

**Vorschlag:** Option loop {from:2,to:6}; Knopf „Nächste Kampfrunde (ab Schritt 2)“ (48 px, LRR-DE 71.8) leert 2–6 und zählt chk-raumkampf-round; Kopf „Kampfrunde N“; ab Runde 2 Punkte 0/1 gedimmt mit „nur Runde 1“.

**Beleg:** `themen.js:12-20; app.js:287, 709`

Dateien: `src/data/themen.js`, `src/app.js`, `src/style.css`

### K7 · Ergebnis verlinkt den nächsten Schritt ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** „Weiter mit Schritt 4, Einmarsch“ ohne Link; Anschluss 1300 px tiefer.

**Vorschlag:** Optionales next:{set,id,label} nur für weit entfernte Ziele (kampf skip → Einmarsch, must → Jägerabwehr), gerendert als vorhandener .darf-link.

**Beleg:** `darfich.js:162, 263; app.js:247`

Dateien: `src/data/darfich.js`, `src/app.js`

### K11 · Suchtreffer öffnen die gefundene Frage ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kampf & Darf ich das? · aus 2 Befunden

**Problem:** Treffer „…Sabotage spielen?“ landet oben auf #t-timing, Frage zu.

**Vorschlag:** Eindeutige IDs q-<topic>-<i>, Index mit el; pendingReveal setzen, details öffnen und kurz markieren.

**Beleg:** `app.js:446, 310, 660-668; m-sabotage-click y=0`

Dateien: `src/app.js`

### K2 · Sprungmarken auf langen Themenseiten (Kampf, Taktik, PoK, SC)

**P2** · Wirkung 2/3 · Aufwand M · Kampf & Darf ich das? · aus 3 Befunden

**Problem:** Kampf ist 4100 px lang, Einmarsch erst nach zwei Bildschirmen; Themen haben keine IDs und keine Gliederung.

**Vorschlag:** Überschriften mit IDs und scroll-margin; unter der h1 eine mitscrollende Chip-Zeile („Raumkampf · Einmarsch · Bodenkampf“) per data-act scrollIntoView; Kopftitel zeigt per IntersectionObserver den Abschnitt („Kampf · Einmarsch“). Entschieden: nicht sticky (Querformat-Platz).

**Beleg:** `themen.js:10/22; app.js:280; m-kampf.png Einmarsch y≈1728`

Dateien: `src/app.js`, `src/data/themen.js`, `src/style.css`

### K3 · Ablauf-Leiste nicht wie Kacheln gestalten

**P2** · Wirkung 2/3 · Aufwand M · Kampf & Darf ich das?

**Problem:** Nicht tippbare Schrittleiste sieht aus wie die Prüf-Kacheln; beim Einmarsch dreifach dieselben Schritte.

**Vorschlag:** Einmarsch: Leiste weg, Schrittnummer als Badge in der Kachel; Raumkampf: schlanker Stepper (Nummernkreise, Akzentring statt --btn-Fläche). Spart ~85 px.

**Beleg:** `style.css:160-176; m-einmarsch-landen-cond.png`

Dateien: `src/app.js`, `src/style.css`, `src/data/darfich.js`

### K10 · „Wann darf ich…?“ gliedern

**P2** · Wirkung 2/3 · Aufwand M · Kampf & Darf ich das?

**Problem:** 21 gleiche Akkordeons ohne Zwischenüberschrift, doppelte IDs q-0…

**Vorschlag:** h-Block-Level erlauben, „Häufige Fragen“ (h2) und 4 Gruppen (h3) ohne Textänderung; eindeutige IDs; optional „Prüfen ›“-Link je Frage (darfRefresh auf derselben Seite).

**Beleg:** `themen.js:100-127; app.js:280, 310`

Dateien: `src/data/themen.js`, `src/app.js`

### K16 · Checklisten: Gruppenname, Fortschritt, Zurücksetzen mit Rückgängig

**P2** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das? · aus 3 Befunden

**Problem:** Lose Labels ohne Gruppe/Zähler; „Abhaken zurücksetzen“ 34 px hoch, ohne Rückgängig, Fokus danach auf body; gleichlautende Knöpfe.

**Vorschlag:** role=group mit aria-label je Liste (name in themen.js), Kopf „5 von 13 erledigt“ (aria-live); Reset im DOM statt render, Knopf ≥44 px mit eindeutigem aria-label, 5 s „Rückgängig“; Aufbau-Tabelle so kürzen, dass sie bei 390 px passt.

**Beleg:** `app.js:285-293, 709; report m-kampf 154×34; m-aufbau-end.png`

Dateien: `src/app.js`, `src/data/themen.js`, `src/style.css`

### K17 · Kachel „Materialaktion“ in „Darf ich das?“

**P3** · Wirkung 2/3 · Aufwand M · Kampf & Darf ich das?

**Problem:** Der Schritt nennt Strategie-/Materialaktion, das Panel prüft sie nicht.

**Vorschlag:** In „Sonst im Zug“ Kachel Materialaktion mit den drei Aktionskarten-Fragen und Belegen aus LRR (Nr. 58); Ablauf-Refs um r:strategieaktion/r:materialaktion ergänzen; --n auf max. 3 begrenzen.

**Beleg:** `ablauf.js:24-28; darfich.js:82; LRR-DE 58.1-58.4`

Dateien: `src/data/darfich.js`, `src/data/ablauf.js`, `src/app.js`

### K6 · Sichtbares „‹ Vorige Frage“ im Prüffluss

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** Antworten ändern geht nur über die Spur, die nicht antippbar aussieht.

**Vorschlag:** Ghost-Knopf „‹ Vorige Frage“ (44 px) ab Frage 2; Spurzeilen mit Stift-Icon und Fußzeile „Antwort antippen zum Ändern“.

**Beleg:** `app.js:226-240; m-timing-sekundaer-q3.png`

Dateien: `src/app.js`, `src/style.css`

### K8 · Einheitliche Begriffe in Kacheln, Leiste und Checkliste

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** „Rückzug ansagen/ankündigen“, „Landen/Entsenden“, „Erobern/Kontrolle“, „Kampf?“ gemischt.

**Vorschlag:** Bezeichnungen an Checkliste und Regelreferenz angleichen (ankündigen, Entsenden, Kontrolle, Raumkampf), alias-Feld für die Suche; vorher gegen deutsche LRR 78.4–78.7/49.2/49.5 abgleichen; Regelaussagen unverändert.

**Beleg:** `darfich.js:153-198; themen.js:15-30`

Dateien: `src/data/darfich.js`, `src/app.js`

### K9 · Fünf Kacheln bei 320 px als 3+2

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** 45 px breite Kacheln, Wörter auf bis zu 4 Zeilen getrennt.

**Vorschlag:** Klasse n5 bei >4 Kacheln; unter 360 px 6er-Grid mit span 2, zentriert 3+2 (~81 px).

**Beleg:** `m320-tiles.png; style.css:159-160, 215`

Dateien: `src/app.js`, `src/style.css`

### K12 · „Schritt 3: Raumkampf prüfen“ mit Vorauswahl

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** Link landet ohne gewählte Prüfung.

**Vorschlag:** darf-open data-id=kampf; Vorauswahl nur, wenn im Ziel-Set nichts aktiv ist.

**Beleg:** `app.js:212-217, 267-274`

Dateien: `src/app.js`

### K13 · Taktikaktion-Thema verlinkt die passenden Prüfungen

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** Die Prüfungen für Aktivieren/Bewegen/Landen/Produzieren fehlen auf #t-takt.

**Vorschlag:** Neuer Block {darfLinks:'aktion',group:0}: vier darf-open-Links im .darf-link-Stil nach der Checkliste.

**Beleg:** `themen.js:52-98; darfich.js:31`

Dateien: `src/app.js`, `src/data/themen.js`

### K14 · Einheitliche Zeilenlänge in Karten, Hinweisen und Ergebnis

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das? · aus 2 Befunden

**Problem:** p mit 66ch endet vor Listen im selben Kasten; wirkt unfertig.

**Vorschlag:** .card p,.note p,details .a p,.darf-v>p,.darf-q .help{max-width:none}; optional .darf-q .yn{max-width:440px}.

**Beleg:** `style.css:113; d-credits-measure; d-kampf-rueckzug-ok.png`

Dateien: `src/style.css`

### K15 · Erneuter Kachel-Tipp verwirft keine Antworten

**P3** · Wirkung 1/3 · Aufwand S · Kampf & Darf ich das?

**Problem:** Versehentlicher zweiter Tipp schließt die Prüfung und löscht alles.

**Vorschlag:** Antworten je Prüfung in mem merken; Wiederöffnen stellt sie her; nur „Neu prüfen“ und Zug/Runde verwerfen.

**Beleg:** `app.js:689-690`

Dateien: `src/app.js`

## 4. Suche & Nachschlagen

Schnelles Finden ist der zweithäufigste Weg am Tisch; der Feld-Bug, Hervorhebung und Ausschnitte sind die größten Bremsen.

### S1 · Such- und Filterfeld nicht mehr aufblähen ⚡

**P1** · Wirkung 3/3 · Aufwand S · Suche & Nachschlagen · aus 4 Befunden

**Problem:** .field mit flex:1 wächst in der Spalten-Flexbox #view auf 290–547 px: Suche, leere Filter in Regeln und Kompendium wirken kaputt.

**Vorschlag:** #view>.field{flex:none} (flex:1 nur in Zeilen-Containern); leerer Zustand mit „Filter löschen“.

**Beleg:** `style.css:52, 256; m-suche.png, d-suche.png, ia-fac-none.png`

Dateien: `src/style.css`

### S2 · Suche-Tab öffnet mit Tastatur, Feld bleibt erreichbar

**P2** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen · aus 3 Befunden

**Problem:** Nach dem Tab-Tipp kein Fokus (iOS: setTimeout außerhalb der Geste); Enter tut nichts; doppelte H1; „/“ greift in Selects.

**Vorschlag:** Tab-Klick: pushState, render, synchron #q.focus() bei leerem Begriff; <form role=search> mit submit → blur; enterkeyhint=search; Feld sticky unter dem Kopf; H1 am Handy .sr; „/“-Filter um select/contenteditable erweitern.

**Beleg:** `app.js:511-515, 745-755; m-suche-focus after BODY`

Dateien: `src/app.js`, `src/style.css`

### S7 · Regelfilter klappt nur wenige Treffer auf ⚡

**P2** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen

**Problem:** „kampf“ öffnet 19 Regeln (14.853 px), sie bleiben nach dem Leeren offen; keine Markierung, keine Zahl.

**Vorschlag:** Nur bei ≤3 Treffern öffnen, sonst Snippet mit <mark>; data-auto beim Leeren schließen; „19 Einträge“ (aria-live).

**Beleg:** `app.js:419; m-regeln-filter-kampf`

Dateien: `src/app.js`, `src/style.css`

### S9 · Einheitlicher Aufklapp-Marker für alle details ⚡

**P2** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen · aus 3 Befunden

**Problem:** Regeln ohne Marker, Bildaufklapper mit nativem ▶ (21–26 px), Q&A mit eigenem ›.

**Vorschlag:** details.q-Muster für alle summary (› gedreht bei open, min-height 44 px); bei details.rule Marker absolut rechts; offene Regel mit surface-2 und Akzentkante.

**Beleg:** `style.css:247-251, 282-284, 569, 585`

Dateien: `src/style.css`

### S10 · Breite Tabellen am Handy ohne versteckte Spalte ⚡

**P2** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen

**Problem:** Einheitenwerte: 151 px abgeschnitten, genau die Spalte „Fähigkeiten“.

**Vorschlag:** Option table.wide: unter 600 px Grid je Zeile, lange Textspalte als zweite Zeile; übrige .tbl mit Scroll-Schatten.

**Beleg:** `themen.js:195-206; m-t-limits-tbl sw 507/cw 356`

Dateien: `src/app.js`, `src/style.css`

### S11 · Kommandeur/Commander und Keleres einheitlich und findbar ⚡

**P2** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen

**Problem:** „commander“ findet keinen Fraktions-Kommandeur, „kommandeur“ nicht Regel Nr. 7; „Council Keleres“ neben „Keleres des Rates“.

**Vorschlag:** ty-Label in den durchsuchten Text; „Kommandeur“ ins k-Feld von Nr. 7; nach Prüfung des offiziellen deutschen Begriffs vereinheitlichen; Leads „die Keleres des Rates (Council Keleres)“.

**Beleg:** `regeln-1.js:66-84; kompendium.js:394; ia-suche-kommandeur.png`

Dateien: `src/app.js`, `src/data/regeln-1.js`, `src/kompendium.js`, `src/aufbau.js`

### S3 · Suchtreffer: Hervorhebung, saubere Ausschnitte, keine Dubletten

**P2** · Wirkung 2/3 · Aufwand M · Suche & Nachschlagen · aus 4 Befunden

**Problem:** Umlaut-Suchen markieren nichts; Ausschnitte beginnen mitten im Wort oder zeigen EN-Titel/Stichwörter; Prüfungen zusammengewürfelt; „Bodentruppen landen“ doppelt; Originalmaterial vor Regeln.

**Vorschlag:** wordRe(w) für ae/ä usw. in highlight und snippet; Aliase (en, k, short) nur fürs Matching; Ausschnitt an Wortgrenzen, 3 Zeilen; Darf-Index nach c.id deduplizieren; Titelbonus mit w gewichten, Originaltreffer gesammelt am Ende.

**Beleg:** `app.js:450, 454, 461-478; kompendium.js:387; m-suche-umlaut.png`

Dateien: `src/app.js`, `src/kompendium.js`, `src/assets.js`, `src/style.css`

### S8 · Buchstabenleiste passt, folgt dem Scrollen, setzt Fokus

**P2** · Wirkung 2/3 · Aufwand M · Suche & Nachschlagen

**Problem:** Am Handy 9 von 20 sichtbar (34×36), am Desktop „Z“ abgeschnitten, kein Scrollspy, Filter scrollt weg, Fokus bleibt in der Leiste.

**Vorschlag:** Buttons statt href='#'; breit als 20er-Grid (40 px), am Handy sticky Filterfeld + „K ▾“-Raster; Scrollspy per IO; nach Sprung h2.letter-h fokussieren.

**Beleg:** `style.css:278-279; app.js:393, 710-714; d-regeln-vp.png`

Dateien: `src/app.js`, `src/style.css`

### S5 · Leerzustände mit Ausweg, „Zuletzt geöffnet“

**P3** · Wirkung 2/3 · Aufwand S · Suche & Nachschlagen · aus 2 Befunden

**Problem:** „Nichts passt“ ohne Filter-löschen/Überall-suchen; feste Chips; Nachschlagen-Feld reagiert erst auf Enter.

**Vorschlag:** emptyState(q) mit „Filter löschen“ und „überall suchen“; Buchstaben ohne Treffer ausblenden; „Beispiele“ plus bis zu 6 zuletzt geöffnete Ziele (ohne Ablauf-Sprünge) in ti4.v2.recent; Nachschlagen-Feld zeigt Live-Treffer.

**Beleg:** `app.js:409, 497-503, 347-349; kompendium.js:58`

Dateien: `src/app.js`, `src/kompendium.js`

### S4 · Trefferliste gruppieren und eingrenzen

**P3** · Wirkung 2/3 · Aufwand M · Suche & Nachschlagen

**Problem:** Bis zu 40 Treffer flach, „40+“ ohne Erweiterung.

**Vorschlag:** Chips mit aria-pressed „Alle · Regeln · Darf ich · Themen · Kompendium“ samt Zahlen; „Weitere 20 anzeigen“ statt hartem Limit.

**Beleg:** `app.js:491, 504; m-suche-query.png 4975 px`

Dateien: `src/app.js`

## 5. Aufbau & Generator

Lesbare Tafelnummern, sichtbare Systeminfos und ein geführtes Legen machen den Generator am Tisch wirklich nutzbar.

### G1 · Tafelnummern am Handy lesbar ⚡

**P1** · Wirkung 3/3 · Aufwand S · Aufbau & Generator

**Problem:** Nummern ~4,9 px, Namen ~3,2 px: Galaxie lässt sich ohne Zoom nicht legen.

**Vorschlag:** Klassen pn/tn in tileSVG; unter 700 px ungezoomt Namen ausblenden und Nummern groß mit Kontur (30 SVG-px, paint-order stroke). Ergebnis 12 px (6 Sp.) / 9 px (8 Sp.).

**Beleg:** `map.js:160, 168; m-gen-hex nameH 4`

Dateien: `src/map.js`, `src/style.css`

### G2 · System antippen zeigt sichtbare Peek-Karte

**P1** · Wirkung 3/3 · Aufwand M · Aufbau & Generator

**Problem:** Info landet hinter der Leiste oder im unsichtbaren Reiter; Tippen scheint nichts zu tun.

**Vorschlag:** Unter 1100 px fixe Peek-Karte über dem Dock (Mini-Tafel, Planeten, ×, „Details“); Antippen setzt setTab('sys'); #hexinfo aria-live.

**Beleg:** `m-gen-hex hexinfoTop 708 vs dock 699; aufbau.js:324-342, 463`

Dateien: `src/aufbau.js`, `src/style.css`, `src/app.js`

### G17 · Scrollsperre nach Zurück aus dem Vollbild beheben ⚡

**P1** · Wirkung 2/3 · Aufwand S · Aufbau & Generator

**Problem:** html.gen-fullscreen bleibt nach Zurück stehen: Seite nicht scrollbar.

**Vorschlag:** In after() die Klasse bei jedem Render entfernen bzw. html:has(#gen-board.full){overflow:hidden}; beim Verlassen des Generators aufräumen.

**Beleg:** `aufbau.js:315, 415; full-back.png`

Dateien: `src/aufbau.js`, `src/style.css`

### G6 · Zweispalter erst ab 1360 px ⚡

**P2** · Wirkung 2/3 · Aufwand S · Aufbau & Generator

**Problem:** Bei 1100–1300 px schrumpft die Karte auf 346 px.

**Vorschlag:** Breakpoints 1100→1360, mobile() auf 1359, 360er-Spalte ab 1500.

**Beleg:** `d1100-gen.png svg 346 vs d1099 709`

Dateien: `src/style.css`, `src/aufbau.js`

### G8 · Würfe und Optionen ersetzen den Verlaufseintrag ⚡

**P2** · Wirkung 2/3 · Aufwand S · Aufbau & Generator

**Problem:** 15 Würfe = 15× Zurück; jede Option springt nach oben.

**Vorschlag:** D.UI.replace(hash) mit replaceState + render(false) für gen→gen; genHistory in localStorage.

**Beleg:** `m-hist 2→5; app.js:95-99, 676`

Dateien: `src/app.js`, `src/aufbau.js`

### G11 · Desktop: Link kopieren/Teilen immer sichtbar ⚡

**P2** · Wirkung 2/3 · Aufwand S · Aufbau & Generator

**Problem:** Teilen-Knöpfe nur durch Scrollen im Panel erreichbar.

**Vorschlag:** Knöpfe in .gen-meta neben „Karte Nr.“; Nummer laden als details; Scroll-Schatten im Panel.

**Beleg:** `style.css:424; d1366 ch 460/sh 715`

Dateien: `src/aufbau.js`, `src/style.css`

### G14 · Generator am Handy auffindbar ⚡

**P2** · Wirkung 2/3 · Aufwand S · Aufbau & Generator

**Problem:** Knopf drei Bildschirme tief im Aufbau.

**Vorschlag:** Unternavigation „Aufbau-Schema · Kartengenerator“ unter 960 px; Knopf vor „Galaxie zusammensetzen“ mit „Statt reihum legen:“.

**Beleg:** `aufbau.js:92; btnTop 2102`

Dateien: `src/aufbau.js`, `src/style.css`

### G18 · Spielerzahl zwischen Hub, Aufbau und Generator durchreichen ⚡

**P2** · Wirkung 2/3 · Aufwand S · Aufbau & Generator · aus 2 Befunden

**Problem:** Aufbau 5 Spieler, Generator zeigt 6; Hub-Teilnehmer kommen nirgends an.

**Vorschlag:** startGen schreibt setupId; #generator würfelt neu, wenn lastGen abweicht (alte Karte via „Vorige“); Hub verlinkt am Spieltag #aufbau-N.

**Beleg:** `aufbau.js:50, 395-399; j20-m-generator-nach-aufbau5.png`

Dateien: `src/aufbau.js`, `src/hub.js`

### G4 · Werkzeugleiste über der Karte, Zoom ohne Scroll-Falle

**P2** · Wirkung 2/3 · Aufwand M · Aufbau & Generator · aus 2 Befunden

**Problem:** Overlays verdecken Heimat-Systeme; Zoom-Knöpfe hinter der Leiste; 78vh-Karte fängt jedes Wischen; Pinch zoomt die Seite.

**Vorschlag:** 44-px-Leiste in .board.tiles über der Scrollfläche (Nr., − 100 % +, ⛶); beim Zoomen Karte unter den Kopf scrollen und Höhe an --top-h/--dock-h binden; overscroll-behavior-x:contain; Pinch später.

**Beleg:** `style.css:353-357, 442-443; m-gen-6-cover covered P3`

Dateien: `src/aufbau.js`, `src/style.css`

### G5 · Desktop: Systeminfo angeheftet, Karte passt ins Fenster

**P2** · Wirkung 2/3 · Aufwand M · Aufbau & Generator

**Problem:** Info 257 px unter dem Rand, Karte 737 px hoch.

**Vorschlag:** Ab 1100 px kompakte „Gewähltes System“-Karte sticky in der rechten Spalte; ungezoomte Karte max-height an Fenster; .gen-res align-items:start.

**Beleg:** `d-gen-hex hexinfoTop 1157`

Dateien: `src/aufbau.js`, `src/style.css`

### G3 · Tafeln abhaken und geführter Legemodus 🏗

**P2** · Wirkung 2/3 · Aufwand L · Aufbau & Generator

**Problem:** 30–54 Tafeln heraussuchen und legen ohne Zustand.

**Vorschlag:** Reiter „Tafeln“: Umschalter „Heraussuchen | Legen“; Abhaken mit Zähler „Blau 12/18“; Legemodus läuft layout.slots ab (große Nummer, gedrehte Hyperroute, „‹ 7/30 ›“); ein Speicher ti4.v2.genfound je Karte.

**Beleg:** `aufbau.js:319-322, 464-477; m-gen-pull.png`

Dateien: `src/aufbau.js`, `src/map.js`, `src/style.css`

### G7 · Vollbild nutzt den Platz

**P3** · Wirkung 2/3 · Aufwand M · Aufbau & Generator

**Problem:** Hochformat: Karte gleich breit, Rest leer; Schließen mit gleichem Symbol.

**Vorschlag:** Freien Raum für Systemdetails nutzen; Querformat bei Zoom 1 an Höhe einpassen; ×-Symbol mit Text „Schließen“.

**Beleg:** `m-gen-full.png; aufbau.js:312-318`

Dateien: `src/aufbau.js`, `src/style.css`

### G13 · Hyperrouten mit Drehung zeigen

**P3** · Wirkung 2/3 · Aufwand M · Aufbau & Generator

**Problem:** Drehung muss stimmen, Schema-Nummern sind winzig, Detail ungedreht.

**Vorschlag:** singleTile reicht rot durch; showHex nutzt hy[2]; unter dem Schema Reihe gedrehter Hyperrouten-Tafeln mit Lageangabe.

**Beleg:** `map.js:187, 420-428; layouts.js:16`

Dateien: `src/map.js`, `src/aufbau.js`

### G21 · Aufbau zeigt eure Fraktionen und deren Sondermaterial

**P3** · Wirkung 2/3 · Aufwand M · Aufbau & Generator

**Problem:** Immer derselbe allgemeine Sonderfall-Hinweis.

**Vorschlag:** D.Hub.nextGame/ensureLoaded; Block „Eure Fraktionen“ mit Heimat-Tafel, Starteinheiten/-techs, Link; Sondermaterial-Badge nur für die 8 Fraktionen aus LRR Aufbau Schritt 3.

**Beleg:** `aufbau.js:93; themen.js:262; LRR Aufbau Schritt 3`

Dateien: `src/aufbau.js`, `src/hub.js`

### G9 · Ausgleich verständlich und nachrechenbar

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator · aus 2 Befunden

**Problem:** Spanne ohne Bewertung; Tabelle geht nicht auf, Gewichte fehlen, Spalten am Handy versteckt.

**Vorschlag:** Einordnung relativ zum Ø (sehr ausgeglichen/ausgeglichen/spürbar ungleich), schwächsten Platz nur bei „ungleich“ markieren; Tabelle mit gewichteten Beiträgen und Spalte „Rest“, Formel als Satz.

**Beleg:** `aufbau.js:255-271; map.js:277; m-gen-bal-open.png`

Dateien: `src/aufbau.js`, `src/style.css`

### G10 · PoK-Schalter zustandsabhängig beschriften

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** Untertitel „Aus: …“ bei An; PoK-pflichtige Aufbauten schalten PoK still ein.

**Vorschlag:** Untertitel nach Zustand; „PoK“-Badge an pflichtigen Knöpfen; Hinweis bei Legendär; PoK-Vorliebe getrennt merken.

**Beleg:** `aufbau.js:152-163, 405; layouts.js`

Dateien: `src/aufbau.js`, `src/style.css`

### G12 · Zeichenerklärung für die Tafeln

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** Symbole (R/E-Kreise, Rauten, Stern, Ränder) unerklärt.

**Vorschlag:** <details class=q> „Zeichenerklärung“ nach #hexinfo mit Mini-SVGs, Farben als Konstanten aus M.

**Beleg:** `map.js:136-165; aufbau.js:62-68 Schema-Legende`

Dateien: `src/aufbau.js`, `src/map.js`, `src/style.css`

### G15 · Systemdetails ohne Doppelung, mit Regel-Chips

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** Planet zweimal; Anomalien ohne Regelweg; Spezialisierung nur Farbe.

**Vorschlag:** Text-Tag zur Raute, aria-label an R/E; Fließtext nur für Anomalie/Wurmloch; refChips (Nebel, Supernova …).

**Beleg:** `aufbau.js:346-354; m-hex-anom.png`

Dateien: `src/aufbau.js`

### G16 · Kennzahl-Kacheln in Saira statt Monospace

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator · aus 2 Befunden

**Problem:** „3 blaue und / 2 rote“ bricht in 20-px-Mono um; Waisenkarte; Reihenfolge wechselt.

**Vorschlag:** .kv.setup b in --f-display 700/22–26 px, Flex-Wrap statt Grid; „blaue“ immer zuerst.

**Beleg:** `style.css:235; aufbau.js:31-38, 77; auf1.png`

Dateien: `src/style.css`, `src/aufbau.js`

### G19 · Letzte Karte an Session-Notiz hängen

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** Karte muss von Hand in die Notizen kopiert werden.

**Vorschlag:** Knopf „Letzte Karte einfügen“ im Editor (aus ti4.v2.genlast); #gen-Verweise als Link „Karte ansehen ›“.

**Beleg:** `hub.js:505; aufbau.js:226-228`

Dateien: `src/hub.js`, `src/aufbau.js`

### G22 · „Galaxie“ statt „Karte“ im Generator

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** „Karte“ meint in TI4 Spielkarten; Generator nutzt beides 13×.

**Vorschlag:** Durchgehend „Galaxie-Generator“, „Galaxie Nr.“, „Vorige Galaxie“, „Galaxie-Code“; Hash und Suchalias bleiben.

**Beleg:** `aufbau.js:142-497; app.js:361-362`

Dateien: `src/aufbau.js`, `src/app.js`

### G24 · Drehen schließt das modale Sheet

**P3** · Wirkung 1/3 · Aufwand S · Aufbau & Generator

**Problem:** iPad gedreht: Seitenspalte bleibt aria-modal mit Fokusfalle; --top-h veraltet.

**Vorschlag:** matchMedia('(max-width:1099px)') change → setSheet(false,false); sheetOpen && mobile() beim Rendern; optional resize-Messung von --top-h.

**Beleg:** `rotate-gen-sheet.png; app.js:657`

Dateien: `src/aufbau.js`, `src/app.js`

### G20 · Plätze auslosen und benennen

**P3** · Wirkung 1/3 · Aufwand M · Aufbau & Generator

**Problem:** Nur P1–Pn ohne Spieler und Fraktion.

**Vorschlag:** Optional „Plätze auslosen“ aus Hub-Teilnehmern (P1 = Sprecher), Korrektur per Select, lokal je Kartennummer; Heimatfeld zeigt Spieler, Fraktion, Tafel.

**Beleg:** `aufbau.js:263-268, 335; j03b-m-generator-bal.png`

Dateien: `src/aufbau.js`, `src/map.js`

### G23 · Sheet per Wischen schließen, Hintergrund fest

**P3** · Wirkung 1/3 · Aufwand M · Aufbau & Generator

**Problem:** Griff ohne Geste; Scrim lässt die Seite scrollen.

**Vorschlag:** Pointer-Wischen nur am Sheet-Kopf (touch-action:none), Schwelle 90 px; Scrim touch-action:none.

**Beleg:** `aufbau.js:157; style.css:408-415`

Dateien: `src/aufbau.js`, `src/style.css`

## 6. Kompendium

Doppelte Referenzbilder und fehlende Sprungmarken machen die Listen doppelt so lang; Kontrast und Farbabhängigkeit betreffen Lesbarkeit.

### C1 · Referenzhilfe-Bilder als Mini-Vorschau statt 200-px-Figur ⚡

**P1** · Wirkung 3/3 · Aufwand S · Kompendium · aus 4 Befunden

**Problem:** Fast jede Karte zeigt eine unlesbare Grafik mit demselben Text darunter; Listen ~doppelt so lang (Karten 44.454 px, 59 % Bilder).

**Vorschlag:** In figure() bei status≠original kompakte 56–64-px-Vorschau neben dem Titel, öffnet den Dialog; Originale bleiben inline; „Name selbst übersetzt“-Tag sichtbar.

**Beleg:** `assets.js:20-25; kompendium.js:48, 129; m-tech-noref 40.922→18.672`

Dateien: `src/assets.js`, `src/kompendium.js`, `src/style.css`

### C11 · Fraktions-Steckbrief und Sprungleiste

**P2** · Wirkung 3/3 · Aufwand M · Kompendium

**Problem:** Wichtigste Werte stecken im Bogen; Spielbereich ab 1552 px, Vorherige/Nächste bei 6679 px.

**Vorschlag:** Chip-Steckbrief unter h1 (MP, Komplexität, Heimat, Starttechs), Spielweise als Lead, sticky Sprungleiste per data-act, Vorherige/Nächste oben.

**Beleg:** `m-arb-counts; kompendium.js:135-213`

Dateien: `src/kompendium.js`, `src/style.css`

### C5 · Horizontale Reiterleisten: aktiver Eintrag sichtbar, Randverlauf ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium · aus 3 Befunden

**Problem:** Karten-Reiter und Hub-Unternavigation verstecken den aktiven Eintrag (Verlauf/Admin, Erkundung) ohne Scroll-Hinweis.

**Vorschlag:** In after() nur scrollLeft der Leiste auf den aktiven Eintrag (kein scrollIntoView); Klassen more-l/more-r mit mask-image.

**Beleg:** `m-karten-erkundung.png; hb-nav sw 521/cw 358`

Dateien: `src/kompendium.js`, `src/hub.js`, `src/style.css`

### C12 · Suchtreffer zu Anführern/Mechs springen an die Stelle ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium

**Problem:** Alle landen oben auf #f-id.

**Vorschlag:** IDs an gcard/Fähigkeiten, Href #f-id~<id>, parse setzt focusEl, details/Bogenseite passend öffnen.

**Beleg:** `kompendium.js:384-397, 126-130`

Dateien: `src/kompendium.js`, `src/style.css`

### C13 · Englische Namen suchbar, bei Eigenübersetzung sichtbar ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium

**Problem:** „Behemoth“, „Stymie“ finden nichts.

**Vorschlag:** en in txt der Anführer/Mechs/Verträge; EN-Zeile nur bei nameStatus own-translation; tote CSS-Reste entfernen.

**Beleg:** `kompendium.js:389-396; s2 report`

Dateien: `src/kompendium.js`, `src/style.css`

### C14 · Kontrast der Spielfarben in Text und Bändern ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium · aus 3 Befunden

**Problem:** Kybernetik-Label 2,17:1, Bänder bis 3,06:1, Strategiekarte 3 2,88:1, tag.dir 3,93:1, chip .nr 4,26:1.

**Vorschlag:** --tc-ink je Farbe (hell ≥4,8:1, dunkel eigene Werte), --tc-band dunklere Töne, SC2/3 dunkle Ziffer, chip .nr opacity 1, .st opacity 1.

**Beleg:** `style.css:241, 532-545, 686; m-f-arborec.png`

Dateien: `src/style.css`, `src/app.js`

### C15 · Voraussetzungen nicht nur als Farbpunkte ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium · aus 2 Befunden

**Problem:** 12-px-Kreise mit title; rot/grün ununterscheidbar; Screenreader stumm; im Band unsichtbar.

**Vorschlag:** role=img aria-label „2× Antriebstechnik“; Formen je Farbe per CSS, 14 px; Kürzel bei gemischten; Kontrastfüllung im Band (heller Chip).

**Beleg:** `kompendium.js:27-32; style.css:537-538`

Dateien: `src/kompendium.js`, `src/style.css`

### C25 · Fraktionen überall mit Kurznamen, deutsch sortiert ⚡

**P2** · Wirkung 2/3 · Aufwand S · Kompendium · aus 2 Befunden

**Problem:** Hub schneidet Artikel ab („Mahactanischen Gen-Hexer“), Sortierung nach Langnamen bzw. englischem Kurznamen.

**Vorschlag:** D.facLabel(f)=f.short für Kacheln/Tags; Langname als title/Meta; localeCompare('de').

**Beleg:** `hub.js:12, 24; kompendium.js:86; a-m-sessions.png`

Dateien: `src/kompendium.js`, `src/hub.js`

### C2 · Originalmaterial als gruppierte Galerie

**P2** · Wirkung 2/3 · Aufwand M · Kompendium · aus 3 Befunden

**Problem:** 158 Einträge à 489 px (81.438 px), Hinweise 48× wiederholt, Reihenfolge nach PDF-Seite.

**Vorschlag:** Kachel als Button (Bild 140 px, Titel, Chip, Editionszeile), Hinweis/Quelle nur im Dialog; nach Art gruppiert mit h2 und Zähler, deutsch sortiert; Sprache als Segment; Fraktionskurzname in data-search; Desktop max-width 1240.

**Beleg:** `assets.js:48-50, 77; style.css:577, 582; m-orig-gallery docH 23.088`

Dateien: `src/assets.js`, `src/style.css`

### C4 · Klebende Sprungleiste für lange Listen

**P2** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** Filter und Reiter scrollen weg; 25 Fraktionsabschnitte ohne Sprung, Links 30 px.

**Vorschlag:** Eine ~52-px-Sticky-Leiste nach .letters-Muster: Chips Farben/Einheiten/Fraktionen plus Lupen-Knopf; Fraktion per select; Karten-Reiter sticky; h3.fgrp a ≥44 px.

**Beleg:** `m-karten-scrolled.png; style.css:489-490`

Dateien: `src/kompendium.js`, `src/assets.js`, `src/style.css`

### C6 · Aktionskarten nach Zeitpunkt filtern

**P3** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** „Was darf ich jetzt spielen?“ geht nur per Wortlaut.

**Vorschlag:** Chips (Als Aktion · Im Kampf · Taktik · Agenda · Strategie/Status · Sonstige) aus geprüfter Zuordnungstabelle, Build-Check; UND mit Textfilter.

**Beleg:** `kompendium.js:270-273`

Dateien: `src/kompendium.js`, `build.py`

### C10 · Fraktionen: Komplexitätsfilter und Tabellenansicht

**P3** · Wirkung 2/3 · Aufwand M · Kompendium · aus 2 Befunden

**Problem:** Fraktionswahl ohne Filter/Vergleich, 6.800-px-Seiten.

**Vorschlag:** Chips Einfach/Mittel/Anspruchsvoll; Umschalter „Karten · Tabelle“ mit sortierbaren Spalten (Komplexität, MP, Heimat R/E, Starttechs).

**Beleg:** `kompendium.js:85-92, 338-350`

Dateien: `src/kompendium.js`, `src/style.css`

### C16 · Technologie-Übersicht Farbe × Stufe

**P3** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** Forschung planen erfordert 41.000 px Scrollen.

**Vorschlag:** details „Übersicht“ oben: ab 700 px Matrix 4×4, darunter 2×2-Farbblöcke mit 44-px-Links; bei Filter ausblenden.

**Beleg:** `kompendium.js:237-245`

Dateien: `src/kompendium.js`, `src/style.css`

### C17 · Bildbetrachter am Handy vollflächig, Zoom an Tippstelle

**P3** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** Bögen ~350 px breit, Zoom fest 800 px, Kopf zweizeilig.

**Vorschlag:** Unter 600 px 100vw/100dvh, einzeiliger Kopf mit Icon-Knöpfen, contain; Zoom 250 % an Tippstelle; optional Blättern.

**Beleg:** `style.css:587-598; m-lightbox-sheet.png`

Dateien: `src/assets.js`, `src/style.css`

### C22 · Vorschaubilder für englische Bögen

**P3** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** 2048-px-Bilder für 230-px-Vorschauen.

**Vorschlag:** 720/1080-px-WebP-Thumbnails, srcset mit sizes; Dialog lädt Original mit width/height.

**Beleg:** `assets.js:21, 76; 30.582 KB in Liste`

Dateien: `src/assets.js`, `build.py`, `scripts/import_original_assets.py`

### C24 · Kompendium und Regeln gegenseitig verlinken

**P3** · Wirkung 2/3 · Aufwand M · Kompendium

**Problem:** Keine Links von Karten/Einheiten zu Regeln und zurück.

**Vorschlag:** Feld kmp in Regeln (Nr. 3 → Aktionskarten), Regel-Chip im Lead der Kartenseiten, „Regeln dazu“-Zeile mit Einheitenfähigkeiten.

**Beleg:** `kompendium.js ohne #r-; app.js:406`

Dateien: `src/kompendium.js`, `src/app.js`, `src/data/regeln-1.js`, `src/data/regeln-2.js`

### C3 · Originalmaterial-Kopf angleichen

**P3** · Wirkung 1/3 · Aufwand S · Kompendium · aus 2 Befunden

**Problem:** 276-px-Hinweis vor dem ersten Bild; Feld ohne Lupe, Text-‹, andere Radien.

**Vorschlag:** Hinweis als details „Woher stammen die Bilder?“; svg back/search wie andere Seiten; select radius 12.

**Beleg:** `assets.js:43-47; m-orig-0.png firstEntryTop 961`

Dateien: `src/assets.js`, `src/style.css`

### C7 · Filterzähler aktuell halten

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** „Grundspiel 17“ bei 2 Treffern; keine Trefferzahl.

**Vorschlag:** applyFilter schreibt „2 von 17“ (data-n), Status „2 von 25 Fraktionen“.

**Beleg:** `kompendium.js:68-77, 88; m-frak-wurmloch.png`

Dateien: `src/kompendium.js`

### C8 · Massenprodukte beschriften

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Goldene Zahl ohne Label, nur title.

**Vorschlag:** In die Meta-Zeile „· 3 Massenprodukte“; Kästchen aria-hidden oder sr-Präfix.

**Beleg:** `kompendium.js:98; m-frak-top.png`

Dateien: `src/kompendium.js`

### C9 · Porträts ohne Rohstoffleiste

**P3** · Wirkung 1/3 · Aufwand S · Kompendium · aus 2 Befunden

**Problem:** Unten angeschnittene Ziffern im Porträt.

**Vorschlag:** Neu ausschneiden (Höhe 65→54) oder sofort .f-portrait{height:60px;object-position:50% 0}.

**Beleg:** `import_original_assets.py:150; style.css:554; fthumb.png`

Dateien: `src/style.css`, `src/assets.js`, `scripts/import_original_assets.py`

### C18 · Bogen umdrehen ohne Neurendern

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Flip-Animation läuft nie, details-Zustand geht verloren.

**Vorschlag:** data-side, inert, aria-pressed und Figur vor Ort tauschen.

**Beleg:** `kompendium.js:368-372; style.css:610-612`

Dateien: `src/kompendium.js`

### C19 · Kartenart-Streifen einheitlich, ohne Sichelecken

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Streifen oben/links/Band; border erzeugt Sicheln.

**Vorschlag:** Alle .kc oben per inset box-shadow; .kc.tech border-left entfernen.

**Beleg:** `style.css:531, 695; kc-top.png`

Dateien: `src/style.css`

### C20 · Einheitenwerte in einem Stil

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Grund- und Aufwertungswerte untereinander in zwei Stilen.

**Vorschlag:** In gcards stats() statt statline(); Overrides löschen.

**Beleg:** `kompendium.js:111, 187-189; arb3.png`

Dateien: `src/kompendium.js`, `src/style.css`

### C21 · Kompendium am Desktop breiter

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Listen auf 820 px, je ~220 px leer.

**Vorschlag:** Ab 1200 px body[data-page=cards|tech|fac|assets] #view{max-width:1240px} → 3 Spalten.

**Beleg:** `d-karten.png; d-karten-wide doc 23.501→16.614`

Dateien: `src/style.css`

### C23 · content-visibility für lange Listen

**P3** · Wirkung 1/3 · Aufwand S · Kompendium

**Problem:** Bis 2000 Knoten und 81.000 px Layout pro Seitenwechsel.

**Vorschlag:** content-visibility:auto + contain-intrinsic-size für .asset-entry, .kf-item, details.rule; mit N1 testen.

**Beleg:** `t8-figs: 82→35 ms`

Dateien: `src/style.css`

### C26 · Bild sichern als Knopf mit Namen und Teilen

**P3** · Wirkung 1/3 · Aufwand S · Kompendium · aus 2 Befunden

**Problem:** Versteckter 116×21-Link, Dateien „codex2-p1-3.webp“, in iOS-App Sackgasse.

**Vorschlag:** .btn im Dialogfuß, download='TI4 – Titel.webp'; bei pointer:coarse vorab fetch und navigator.share({files}).

**Beleg:** `assets.js:78; dlg-m linkH 21`

Dateien: `src/assets.js`, `src/style.css`

## 7. Hub

Der Hub begleitet den Abend von Planung bis Ergebnis; es fehlen Zustände nach dem Spiel, Robustheit bei Netzproblemen und ehrliche Statistik.

### H1 · Fraktionsstatistik: Klassenkollision .stats beheben ⚡

**P1** · Wirkung 3/3 · Aufwand S · Hub · aus 2 Befunden

**Problem:** Kompendium-Regel .stats span macht Hub-Kacheln hell, Status 1,32:1.

**Vorschlag:** hub.js:559 hb-facs-stats statt stats; Kompendium-Regel auf .stats>span einengen.

**Beleg:** `hub.js:559; style.css:529, 905; m-hub-fraktionen.png`

Dateien: `src/hub.js`, `src/style.css`

### H23 · Automatisch berechnete Plätze nicht einfrieren ⚡

**P1** · Wirkung 3/3 · Aufwand S · Hub

**Problem:** Nach SP-Korrektur bleibt der alte Sieger; Statistik falsch.

**Vorschlag:** draftFor: entsprechen gespeicherte Plätze der Automatik, im Entwurf auf null setzen; Vorschau mit manuellen Plätzen; Widerspruchshinweis mit „neu berechnen“.

**Beleg:** `lib.rs:626-641; hub.js:459, 498; c/after.png`

Dateien: `src/hub.js`

### H40 · Hub-Felder auf 16 px gegen iOS-Zoom ⚡

**P1** · Wirkung 3/3 · Aufwand S · Hub

**Problem:** Alle Hub-Felder 15 px: iPhone zoomt bei jedem Feld.

**Vorschlag:** .hb input/select/textarea font-size:16px, min-height:44px; .hb-inline.sm ebenso.

**Beleg:** `style.css:952, 1004; fs-hub-spiel-new 15px`

Dateien: `src/style.css`

### H11 · Hero nach Zustand: läuft, Ergebnis offen, Aufbau

**P1** · Wirkung 3/3 · Aufwand M · Hub · aus 2 Befunden

**Problem:** Vergangene Session zeigt wochenlang „Es geht los!“; Ergebnis eintragen versteckt.

**Vorschlag:** Bis 12 h: „Läuft seit 18:00“ + „Ergebnis eintragen“; danach „Ergebnis offen“ + „Fortsetzung planen“; vorher ab 12 h „Aufbau für N Spieler ›“; Route #hub-spiel-<id>-ergebnis setzt FINISHED.

**Beleg:** `hub.js:238-241, 345-348; m-past.png`

Dateien: `src/hub.js`

### H3 · Siegpunkte und Platz am Handy beschriften ⚡

**P1** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Zwei Zahlenfelder ohne sichtbares Label.

**Vorschlag:** Labels sichtbar (.hb-pl) unter 700 px, darüber .sr; zwei gleiche Spalten.

**Beleg:** `hub.js:497-498; a-m-edit-fin.png`

Dateien: `src/hub.js`, `src/style.css`

### H13 · Registrierung ohne vorausgewählten fremden Spieler ⚡

**P1** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Erster freier Spieler ist vorausgewählt.

**Vorschlag:** Leer-Option required; Knopf „Als Lea registrieren“.

**Beleg:** `hub.js:605; n-m-reg-mismatch.png`

Dateien: `src/hub.js`

### H41 · Enter im Editor speichert nicht die Session ⚡

**P1** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Enter im Feld „neuer Spieler“ schickt das Formular ab.

**Vorschlag:** keydown Enter in #hb-add-new → hinzufügen, Fokus zurück, enterkeyhint=done; Ort → nächstes Feld.

**Beleg:** `hub.js:502-506, 932; hub-enter.png`

Dateien: `src/hub.js`

### H5 · Vergebene Fraktion nur nach Rückfrage übernehmen ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Fraktion wird einem anderen still weggenommen.

**Vorschlag:** Zwei Tipps „Von Basti übernehmen?“; Besitzer beim Tipp merken, im 409-Retry abbrechen.

**Beleg:** `hub.js:818, 779`

Dateien: `src/hub.js`, `src/style.css`

### H6 · Spieler austragen zweistufig ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** 30-px-× neben „Wählen“ trägt sofort aus.

**Vorschlag:** unseatArmed wie resetArmed: „Austragen?“ + Abbrechen, 4 s.

**Beleg:** `hub.js:366, 823`

Dateien: `src/hub.js`, `src/style.css`

### H10 · Hub-Texte: ein Aufruf, kein Jargon, klare Titel ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub · aus 4 Befunden

**Problem:** Doppel-CTA, „Docker-Setup“, erfundene Zitate mit Quellenangabe, Name dreifach.

**Vorschlag:** Nur Hero-CTA plus Einstiegssatz; Lokal-Hinweis ohne Technik; Zitate ohne Quelle; Kopf „Hub“; leere Panels zusammenfassen; Blaulink auf --hb-gold-2, Hub-Tokens als Aliase.

**Beleg:** `hub.js:21, 293, 325, 342, 972; m-hub.png`

Dateien: `src/hub.js`, `src/style.css`

### H21 · Siegpunktziel überall sichtbar ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub · aus 2 Befunden

**Problem:** 10 oder 14 steht nur im Editor.

**Vorschlag:** Chip „bis 14 SP“ in Hero, Panel, Zeile, Match; Sieger „14/14 SP“.

**Beleg:** `hub.js:330-439, 485`

Dateien: `src/hub.js`, `src/style.css`

### H22 · Ergebnisprüfung: SP ≤ Ziel, Gleichstand an der Spitze klären ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub · aus 2 Befunden

**Problem:** Bis 30 SP erlaubt; Gleichstand entscheidet die Sitzreihenfolge still.

**Vorschlag:** max = pointsToWin mit Warnung (LRR 77.4a); bei geteiltem Höchstwert Hinweis „Wer hat gewonnen?“ mit Knopf je Spieler und Link #r-siegpunkte (77.8); Server-Validierung angleichen.

**Beleg:** `hub.js:142, 150-158, 497; lib.rs:595, 626-641`

Dateien: `src/hub.js`, `server/src/lib.rs`

### H32 · Partie ohne Ergebnis kennzeichnen ⚡

**P2** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Erscheint als Rangliste 1.–6. mit „–“.

**Vorschlag:** Nur echte Plätze nummerieren; hasResult(g); Hinweis „Ergebnis fehlt“ und gelber Chip.

**Beleg:** `hub.js:403; g-hub-3.png`

Dateien: `src/hub.js`, `src/style.css`

### H2 · Hub-Kopf am Handy kompakter

**P2** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** Topbar, Logo, Nav, Konto-Zeile und Lokal-Hinweis: Inhalt ab 26–35 %.

**Vorschlag:** Grid Logo+Chip in einer Zeile (Logo 18–20 px), Nav darunter; Lokal-Hinweis auf Unterseiten einzeilig als details.

**Beleg:** `s-m-head; hub.js:293-301`

Dateien: `src/hub.js`, `src/style.css`

### H4 · Fraktionswahl: Raster anspringen, sofortiges Feedback

**P2** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** Raster außer Sicht, Tipp ohne Reaktion bis zur Serverantwort.

**Vorschlag:** Bei Wahlbeginn Panel ins Bild scrollen; pending-Overlay für Sitz/Kachel; optional Dock „Jonas wählt · Abbrechen“.

**Beleg:** `b-m-pick-vp grid 895; hub.js:811-821`

Dateien: `src/hub.js`, `src/style.css`

### H7 · Spieler- und Account-Tabellen als Karten, nur machbare Aktionen

**P2** · Wirkung 2/3 · Aufwand M · Hub · aus 2 Befunden

**Problem:** Aktionen nur per seitlichem Wischen; Löschen/Umbenennen scheitern vorhersehbar mit 403/409.

**Vorschlag:** Unter 700 px Grid-Karten mit Labels; Löschen nur ohne Spiele und Account; Umbenennen nur erlaubt; sonst Badge „hat Account“ und Hinweis.

**Beleg:** `hb-tbl sw 695/cw 324; lib.rs:376-430; m-spieler-409`

Dateien: `src/hub.js`, `src/style.css`

### H12 · Session-Editor: Konflikt sichtbar, Entwurf geschützt

**P2** · Wirkung 2/3 · Aufwand M · Hub · aus 2 Befunden

**Problem:** Konfliktbox außer Sicht, Entwurf geht beim Wegnavigieren oder Abmelden still verloren.

**Vorschlag:** Nach 409 zur Box scrollen und fokussieren; dirty-Entwurf beim Hashwechsel behalten mit Hinweis; Abbrechen mit Zwei-Tipp; bei Abmeldung Formular behalten, returnTo nach Login; optional Dock mit Speichern.

**Beleg:** `hub.js:514-529, 967, 758-761; s-m-conflict-bottom; m-401.png`

Dateien: `src/hub.js`, `src/app.js`

### H16 · Lokaler Modus: Sicherung speichern und laden

**P2** · Wirkung 2/3 · Aufwand M · Hub · aus 2 Befunden

**Problem:** Historie nur im localStorage; Safari löscht nach Wochen ohne Besuch.

**Vorschlag:** „Als Datei speichern“ (JSON) und „Aus Datei laden“ mit Prüfung per checkGame und Zwei-Tipp; Hinweis mit Safari-Warnung; persist() einmal versuchen.

**Beleg:** `hub.js:54, 89-90, 293`

Dateien: `src/hub.js`, `src/style.css`

### H18 · Hub bei Serverproblemen: Zeitlimit, Speichert…, Fehlerpanel

**P2** · Wirkung 2/3 · Aufwand M · Hub · aus 3 Befunden

**Problem:** Endlos „Lädt…“, keine Speichern-Rückmeldung, hängende Queue blockiert Fraktionswahl; Fehler doppelt verschachtelt; Leerzustände täuschen „keine Daten“ vor.

**Vorschlag:** 15-s-Zeitlimit (AbortController); danach refresh und Abgleich; Knopf disabled/aria-busy „Speichert…“; loadErr-Text bereinigen; ohne geladene Daten ein Fehlerpanel mit „Erneut versuchen“.

**Beleg:** `hub.js:71-85, 207, 772-785; hang-hub.png; down503-hub.png`

Dateien: `src/hub.js`, `src/style.css`

### H29 · Sessions-Historie kompakt und gruppiert

**P2** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** 14.800 px bei 31 Partien; vergangene ohne Ergebnis unter „Geplant“.

**Vorschlag:** Karte 64–80 px (Datum, Sieger, Fraktions-Porträts); Jahresgruppen; Gruppe „Ergebnis fehlt“; relative Datumsangaben.

**Beleg:** `meas-sess-390 14.768; hub.js:423-439`

Dateien: `src/hub.js`, `src/style.css`

### H8 · Statistik- und Match-Karten robust für lange Namen

**P2** · Wirkung 1/3 · Aufwand S · Hub · aus 3 Befunden

**Problem:** Krone als Tofu, Namen laufen in Siegpunkte, Sieger 4-zeilig, Editor kürzt auf „Ma…“.

**Vorschlag:** svg-Krone inline; .hb-place li als Grid mit Ellipsis und tabular-nums; Sieger line-clamp 2; Editor unter 700 px Name eigene Zeile.

**Beleg:** `style.css:915, 931; hub.js:417; s-edit-320`

Dateien: `src/hub.js`, `src/style.css`, `src/app.js`

### H9 · Übersicht: keine Doppelung, Countdown ohne Sekunden

**P3** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Datum/Ort doppelt; Sekunden-Countdown bricht um.

**Vorschlag:** Meta im Panel weg; Sekunden erst unter 1 h, kurze Einheiten, Intervall 30 s; Zitat unter 700 px aus; .hb-hero-side margin-left:auto.

**Beleg:** `hub.js:338-355, 950-953; hub-0.png`

Dateien: `src/hub.js`, `src/style.css`

### H27 · „In dieser Partie“: Fraktionen als Schnellzugriff

**P3** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Gewählte Fraktionen nicht verlinkt.

**Vorschlag:** Porträt/Name in Sitzkarten → #f-id; ti4.hub.table cachen; Nachschlagen zeigt am Spieltag Porträt-Chips.

**Beleg:** `hub.js:360-366`

Dateien: `src/hub.js`, `src/app.js`

### H43 · Hinweis auf getrennten iOS-Speicher

**P3** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Einladung in Safari angenommen, App nicht angemeldet.

**Vorschlag:** Nach Login in iOS-Safari Karte „In der installierten App einmal anmelden“; Satz in der Installationshilfe.

**Beleg:** `hub.js:806, 915; app.js:519-522`

Dateien: `src/hub.js`, `src/app.js`

### H44 · „Partie“ statt Session/Spiel/Match

**P3** · Wirkung 2/3 · Aufwand S · Hub

**Problem:** Vier Begriffe für dasselbe.

**Vorschlag:** Sichtbare Texte und Server-detail auf „Partie“/„Termin“; Routen/API bleiben.

**Beleg:** `hub.js:61, 112, 398-399, 474-475`

Dateien: `src/hub.js`, `server/src/lib.rs`, `src/app.js`

### H30 · Übersicht kürzer: Fraktionsraster zugeklappt

**P3** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** 5.300–8.200 px, Raster und Archiv immer voll.

**Vorschlag:** Unter 1180 px Kopf „6/8 gewählt · Raster zeigen“, bei Wählen öffnen; Gäste nur Kopf; Statistik am Handy Top 4.

**Beleg:** `meas-hub-390; hub.js:321-420`

Dateien: `src/hub.js`, `src/style.css`

### H35 · Einladungslink: benutzt ≠ abgelaufen

**P3** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** Gleiche Sackgasse; angemeldete Nutzer werden still umgemeldet.

**Vorschlag:** Status vom Server; benutzt → Anmelde-Formular vorbelegt; bei me Hinweis; nach Annahme location.replace.

**Beleg:** `auth.rs:601-618; hub.js:616-631`

Dateien: `server/src/auth.rs`, `src/hub.js`

### H38 · Session in den Kalender

**P3** · Wirkung 2/3 · Aufwand M · Hub

**Problem:** Termine von Hand übertragen.

**Vorschlag:** Client-.ics (UID, SEQUENCE, UTC); später Server-Feed mit Abo.

**Beleg:** `hub.js:330-345`

Dateien: `src/hub.js`, `server/src/lib.rs`

### C27 · Keleres-Porträt ergänzen

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Platzhalter-„K“ unter dem Namen.

**Vorschlag:** keleres-portrait.webp aus Verlagsmaterial erzeugen; hasPortrait aus vorhandenen Dateien; Platzhalter unten ausrichten.

**Beleg:** `hub.js:14, 26-33; kel.png`

Dateien: `src/hub.js`, `src/style.css`, `scripts/import_original_assets.py`

### H14 · Login mit Umlauten, Passwort anzeigen

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** SQLite-lower ist ASCII-only; Fehlversuche zählen.

**Vorschlag:** Server-Vergleich in Rust to_lowercase; Knopf „Anzeigen“, Wiederholungsfeld entfällt.

**Beleg:** `auth.rs:464; lib.rs:274`

Dateien: `server/src/auth.rs`, `src/hub.js`

### H15 · Fraktionsstatistik mit Ø SP, Ungespielte eingeklappt

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** avgVp berechnet, nie gezeigt; 15 ungespielte Kacheln dazwischen.

**Vorschlag:** „3× · 1 Sieg · Ø 8,7 SP“; Gespielte oben, Rest in details.

**Beleg:** `hub.js:272, 559-563`

Dateien: `src/hub.js`

### H20 · Speicherfehler im lokalen Hub melden

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Grüner Toast trotz verlorener Eingabe.

**Vorschlag:** save() gibt bool; Local.write wirft Fehler; roter Hinweis bei blockiertem Speicher.

**Beleg:** `app.js:13; hub.js:90; quota-hub.png`

Dateien: `src/app.js`, `src/hub.js`

### H24 · Statistik vergleichbar: auf 10 normiert, Siegquote

**P3** · Wirkung 1/3 · Aufwand S · Hub · aus 2 Befunden

**Problem:** Ø SP mischt 10er/14er; Siege absolut.

**Vorschlag:** Ø SP als vp/pointsToWin×10 („Ø SP (auf 10)“); Siegquote aus Partien mit Ergebnis.

**Beleg:** `hub.js:246-274`

Dateien: `src/hub.js`

### H25 · Abschlusskarte nach dem Eintragen

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Sieg endet mit 2,4-s-Toast.

**Vorschlag:** Ergebniskarte mit Siegerporträt, Statistik-Zeile, „Statistik“ und „Nächste Session planen“.

**Beleg:** `hub.js:526`

Dateien: `src/hub.js`, `src/style.css`

### H31 · Sitzplätze bei 320 px zweispaltig

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Eine Spalte, „Nächste Session“ 2.500 px.

**Vorschlag:** minmax(min(128px,calc(50% - 5px)),1fr).

**Beleg:** `style.css:873; x-hub-320-fix`

Dateien: `src/style.css`

### H33 · Gespielte Partie als Lesebericht

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Mitglieder landen im Formular; Gäste sehen Doppelungen.

**Vorschlag:** viewGameReadOnly für FINISHED als Standard; „Bearbeiten“ → #hub-spiel-<id>-bearbeiten.

**Beleg:** `hub.js:466, 574; m-spiel-30.png`

Dateien: `src/hub.js`

### H34 · Login-Sperre mit Restzeit

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Immer „15 Minuten“, Passwort wird geleert.

**Vorschlag:** Retry-After und Restzeit im Text; Knopf bis Uhrzeit gesperrt; Passwort behalten.

**Beleg:** `auth.rs:64-105; hub.js:902-903`

Dateien: `server/src/auth.rs`, `src/hub.js`

### H37 · „Andere Geräte abmelden“ statt alle

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Knopf meldet auch dieses Gerät ab.

**Vorschlag:** DELETE … AND token_hash <> current; Text „Andere Geräte abmelden“.

**Beleg:** `auth.rs:735; hub.js:650-651`

Dateien: `server/src/auth.rs`, `src/hub.js`

### H39 · Historie als CSV

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Keine Exportmöglichkeit.

**Vorschlag:** Link „Als Tabelle (CSV)“, Semikolon, BOM, deutsches Datum.

**Beleg:** `hub.js:423-440`

Dateien: `src/hub.js`

### H42 · Datum als deutsche Klartextzeile

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** Native Felder in Gerätesprache, Wochentag fehlt.

**Vorschlag:** Live-Zeile „Samstag, 17. Oktober 2026 · 18:00 Uhr“ unter den Feldern.

**Beleg:** `hub.js:479-480; m-hub-spiel-new.png`

Dateien: `src/hub.js`

### H45 · „Eure Gruppe“ statt „Spielrunde“

**P3** · Wirkung 1/3 · Aufwand S · Hub

**Problem:** „Spielrunde“ meint Regel Nr. 80, die Rail meint die Freundesgruppe.

**Vorschlag:** Rail-Gruppe „Eure Gruppe“, Panel „Fraktionen in eurer Gruppe“.

**Beleg:** `app.js:588; hub.js:557`

Dateien: `src/app.js`, `src/hub.js`

### H17 · Verlauf: was geändert wurde, Rückgängig nur wo möglich

**P3** · Wirkung 1/3 · Aufwand M · Hub · aus 2 Befunden

**Problem:** Allgemeine Texte, Rückgängig überall, 200 Einträge ungruppiert.

**Vorschlag:** details mit Feld-Diff; Rückgängig nur am neuesten Eintrag je Objekt; Tagesgruppen; Folgeeinträge zusammenfassen.

**Beleg:** `hub.js:717-746; history.rs:16, 122-129`

Dateien: `src/hub.js`

### H19 · Hub offline mit letztem Stand

**P3** · Wirkung 1/3 · Aufwand M · Hub

**Problem:** Offline im Servermodus komplett leer.

**Vorschlag:** Schnappschuss ti4.hub.cache nach jedem Laden; offline lesend mit Banner „Stand vom …“.

**Beleg:** `hub.js:162-208; offline-hub.png`

Dateien: `src/hub.js`

### H26 · Status „Abgebrochen“

**P3** · Wirkung 1/3 · Aufwand M · Hub

**Problem:** Abbruch nur als Gespielt oder Geplant.

**Vorschlag:** Dritte Segment-Option ABORTED, zählt nicht in stats, grauer Chip.

**Beleg:** `hub.js:130, 483; lib.rs:549-551`

Dateien: `src/hub.js`, `server/src/lib.rs`

### H28 · Runden und Dauer optional erfassen

**P3** · Wirkung 1/3 · Aufwand M · Hub

**Problem:** Partiedauer und Runden gehen verloren.

**Vorschlag:** Felder Runden/Dauer im Ergebnis, Runden aus ti4.v2.pos vorbelegt; zwei nullable Spalten.

**Beleg:** `lib.rs:34-43; hub.js:246-273`

Dateien: `src/hub.js`, `server/src/lib.rs`

### H36 · Admin: offene Einladungen sichtbar

**P3** · Wirkung 1/3 · Aufwand M · Hub

**Problem:** Erneutes Einladen entwertet still; fest „7 Tage“.

**Vorschlag:** Ablaufdatum aus expiresAt; offene Einladungen in Accounts; Knopf „neuer Link (alter ungültig)“.

**Beleg:** `auth.rs:916-919; hub.js:688`

Dateien: `server/src/auth.rs`, `src/hub.js`

## 8. Barrierefreiheit & Designsystem

Fokus, Ansagen, Überschriften, Kontraste und eine konsistente visuelle Sprache machen die App für alle bedienbar und ruhiger.

### B5 · Sichtbarer Fokusring im hellen Modus ⚡

**P1** · Wirkung 2/3 · Aufwand S · Barrierefreiheit · aus 2 Befunden

**Problem:** Gold-Ring 1,70–1,95:1 auf hellen Flächen.

**Vorschlag:** Token --focus: hell --accent (#8f6210), dunkle Inseln --chrome-accent; :focus-visible 3px offset 2px; Sonderregeln umstellen.

**Beleg:** `style.css:44, 214, 330; focus-light-chip.png`

Dateien: `src/style.css`

### B1 · Fokus bleibt nach Neuzeichnen und Seitenwechsel erhalten

**P1** · Wirkung 2/3 · Aufwand M · Barrierefreiheit · aus 6 Befunden

**Problem:** Nach Weiter, Runde, Hüter, Reset, Würfeln, Hub-Aktionen und Polling fällt der Fokus auf body; Seitenwechsel ohne Fokusziel.

**Vorschlag:** In render(false)/rerender Schlüssel des aktiven Elements (id/data-*) merken und nach after() mit preventScroll wiederherstellen, Fallback next/h1/#view; bei echtem Routenwechsel h1 (tabindex=-1) bzw. #view fokussieren, außer pendingReveal/Suche.

**Beleg:** `app.js:653-679; hub.js:219, 957-965; x-focus-next BODY`

Dateien: `src/app.js`, `src/hub.js`, `src/kompendium.js`, `src/aufbau.js`

### B2 · Gemeinsame Live-Region D.UI.announce ⚡

**P2** · Wirkung 2/3 · Aufwand S · Barrierefreiheit

**Problem:** Treffer, Filterergebnisse, Kopieren, neue Galaxie, Schrittwechsel werden nicht angesagt.

**Vorschlag:** #sr-live im Template; announce(msg) mit Entprellung; Aufrufe in Suche, Filtern, copy, Generator, goNext/goPrev, Runde.

**Beleg:** `search-live live:null; app.js:493-510`

Dateien: `src/index.template.html`, `src/app.js`, `src/kompendium.js`, `src/aufbau.js`

### B8 · Schalter, Felder und Kacheln mit ≥3:1-Rändern ⚡

**P2** · Wirkung 2/3 · Aufwand S · Barrierefreiheit

**Problem:** Schalter aus 1,58:1, Felder 1,65:1, Darf-Kacheln dunkel 1,21:1.

**Vorschlag:** --line-strong; Aus-Schalter als Kontur; Feldrahmen anheben; Darf-Strip ohne Fläche, Kacheln dunkel heller.

**Beleg:** `style.css:160, 256, 326-327; tgl-off-light.png`

Dateien: `src/style.css`

### B11 · Reflow bei 320 px ohne Abschneiden ⚡

**P2** · Wirkung 2/3 · Aufwand S · Barrierefreiheit

**Problem:** Fraktionsbogen und Hub-Formular laufen über.

**Vorschlag:** .fs-stats flex-wrap; .hb-fields minmax(0,1fr) mit width 100%; Tab-Spalten unter 360 px gewichten.

**Beleg:** `ov-farborec sw 353; ov-hubnew sw 332`

Dateien: `src/style.css`

### B15 · Tippziele mindestens 40–44 px ⚡

**P2** · Wirkung 2/3 · Aufwand S · Barrierefreiheit · aus 4 Befunden

**Problem:** Reset 34 px, Hub-Knöpfe 30 px, „Alle anzeigen“ 21 px, Aufklapper 21 px, A–Z 34×36, Tablet-Segmente 22 px.

**Vorschlag:** Gezielte min-heights (.reset, .hb-mini, .hb-x, .hb-icon, .hb-more, summaries, .letters); pointer:coarse ≥960: .segs mit negativem Rand 44 px, Rail-Phasen/allsteps 44 px.

**Beleg:** `report.json smallSample; style.css:83, 92, 219, 825, 836, 839`

Dateien: `src/style.css`

### D1 · Dunkelmodus: Kanten, Hervorhebung, Markierung ⚡

**P2** · Wirkung 2/3 · Aufwand S · Designsystem · aus 4 Befunden

**Problem:** Kopf/Tab-Leiste 1,03:1 zum Inhalt, Regelreferenz-Kachel wirkt eingesenkt, <mark> 3,69:1, Original-Badge ohne Fläche.

**Vorschlag:** Token --chrome-edge (hell transparent, dunkel --chrome-line) als Rand an .top/.tabbar/.rail; .topic.big dunkel accent-soft; mark{color:var(--ink)}; Badge mit Rand.

**Beleg:** `style.css:18-23, 55, 102, 266, 297, 563; m-dark-nachschlagen.png`

Dateien: `src/style.css`

### D2 · Ausgewählte Option ≠ Hauptaktion ⚡

**P2** · Wirkung 2/3 · Aufwand S · Designsystem

**Problem:** Segmente/Darf-Kacheln haben dieselbe Fläche wie der Primärknopf.

**Vorschlag:** Auswahl: accent-soft + 2px accent-Rand; --btn nur für die eine Hauptaktion.

**Beleg:** `style.css:99, 163, 309, 608; m-dark-gensheet.png`

Dateien: `src/style.css`

### D9 · Manueller Dunkelmodus ⚡

**P2** · Wirkung 2/3 · Aufwand S · Designsystem

**Problem:** data-theme existiert im CSS, aber kein Schalter.

**Vorschlag:** Auto/Hell/Dunkel in Partie/Credits, ti4.v2.theme, Inline-Skript vor Paint; im Artifact ausblenden.

**Beleg:** `style.css:16-37; grep data-theme 0`

Dateien: `src/app.js`, `build.py`

### D11 · Tipp-Feedback wie eine App ⚡

**P2** · Wirkung 2/3 · Aufwand S · Designsystem · aus 2 Befunden

**Problem:** Kein :active, blaues Tap-Highlight, Link-Menüs, Textauswahl auf Knöpfen.

**Vorschlag:** :active (brightness/scale ohne reduced-motion) für Dock, Kacheln, Ja/Nein, Chips, Tabs; tap-highlight transparent; user-select/touch-callout none und touch-action manipulation nur auf Bedienelementen; hover in @media (hover:hover).

**Beleg:** `grep :active 0; cs-ablauf tapHighlight`

Dateien: `src/style.css`, `src/app.js`

### B6 · Generator per Tastatur und Screenreader bedienbar

**P2** · Wirkung 2/3 · Aufwand M · Barrierefreiheit

**Problem:** 37 Hex-Buttons in role=img; 107 Tab-Stopps; Reiter ohne Pfeiltasten.

**Vorschlag:** role=group; roving tabindex (Ring ←/→, Nachbarring ↑/↓); Reiter nach APG; ab 1100 px tabpanel-Rollen entfernen.

**Beleg:** `map.js:405, 433; aufbau.js:245-299`

Dateien: `src/map.js`, `src/aufbau.js`

### B9 · Formularfehler direkt am Feld statt im Toast

**P2** · Wirkung 2/3 · Aufwand M · Barrierefreiheit · aus 4 Befunden

**Problem:** Kartennummer nur roter Rand; Hub-Fehler als halbbreiter 6-s-Toast unter der Tastatur; erster Fehler oft nicht angesagt.

**Vorschlag:** Fehlertext mit role=alert über dem Absende-Knopf, aria-invalid + describedby am Feld, bis zur nächsten Eingabe; Seed-Parser /^\d+$/; Toast left/right 16 px, über visualViewport; Live-Region vorab im DOM.

**Beleg:** `aufbau.js:528-529; hub.js:222-226; c-m-toast 195×90`

Dateien: `src/aufbau.js`, `src/hub.js`, `src/style.css`

### B3 · Sprunglink „Zum Inhalt“, Landmarken richtig benennen

**P2** · Wirkung 1/3 · Aufwand S · Barrierefreiheit · aus 2 Befunden

**Problem:** 21 Tab-Stopps vor dem Inhalt; aside heißt „Rundenablauf“.

**Vorschlag:** Skip-Link (data-act, kein #view-Hash) fokussiert h1/#view; aside-Label „Seitenleiste“.

**Beleg:** `o-desk-taborder before=21; index.template.html`

Dateien: `src/index.template.html`, `src/app.js`, `src/style.css`

### B4 · Überschriftenhierarchie korrigieren

**P2** · Wirkung 1/3 · Aufwand S · Barrierefreiheit · aus 4 Befunden

**Problem:** Hub ohne h1, Fraktion mit zwei h1, Themen springen h1→h3, Nachschlagen-Abschnitte sind <p>.

**Vorschlag:** Hub-Logo als h1 mit sr-Seitenname; Themen-Abschnitte und Kartentitel h2 (Optik per Klasse), Darf-Panel h3; .fs-title h1 → h2; section-k als h2.

**Beleg:** `report.json h1:[] Hub; kompendium.js:136/140; app.js:279-280`

Dateien: `src/hub.js`, `src/kompendium.js`, `src/app.js`, `src/style.css`

### B7 · Fortschritt nicht nur über Farbe, aria-current

**P2** · Wirkung 1/3 · Aufwand S · Barrierefreiheit

**Problem:** Erledigt/offen nur Farbe (1,79:1), kein aria-current.

**Vorschlag:** aria-current=step, Label mit Zustand; offene Schritte als Umriss, erledigte gefüllt.

**Beleg:** `app.js:559-568, 626-627; style.css:74-96`

Dateien: `src/app.js`, `src/style.css`

### B10 · Labels für Felder, eindeutige Knopfnamen

**P3** · Wirkung 1/3 · Aufwand S · Barrierefreiheit

**Problem:** Felder nur mit Placeholder; „Entfernen, Entfernen …“.

**Vorschlag:** sr-Labels; aria-label mit Spielernamen; sr-Zusätze bei „Alle anzeigen“ und Reset.

**Beleg:** `hub.js:376, 499-503, 548-549`

Dateien: `src/hub.js`, `src/app.js`

### B13 · lang="en" für englische Begriffe

**P3** · Wirkung 1/3 · Aufwand S · Barrierefreiheit

**Problem:** Englische Titel mit deutscher Aussprache.

**Vorschlag:** lang=en an span.en und small der Strategiekarten.

**Beleg:** `app.js:304, 402`

Dateien: `src/app.js`

### B14 · Windows-Kontrastmodus unterstützen

**P3** · Wirkung 1/3 · Aufwand S · Barrierefreiheit

**Problem:** Schalter und Fortschritt verschwinden bei forced-colors.

**Vorschlag:** @media (forced-colors:active) mit Rändern, Highlight für Zustände, Navigation-Outline.

**Beleg:** `style.css:74-96, 325-329; fc-gen-toggles.png`

Dateien: `src/style.css`

### D4 · Kein synthetisches Fett, nur gebündelte Schriften

**P3** · Wirkung 1/3 · Aufwand S · Designsystem

**Problem:** Mono 700 und Georgia nicht gebündelt.

**Vorschlag:** Segment-Ziffern Saira 700 tabular-nums; .hb-quote Source Sans italic; .hb-ok 700.

**Beleg:** `build.py:37-43; style.css:306, 865, 878`

Dateien: `src/style.css`

### D6 · Hinweis und Link unterscheidbar

**P3** · Wirkung 1/3 · Aufwand S · Designsystem

**Problem:** Tipp-Boxen und Chips gleiches Beige.

**Vorschlag:** .note.tip mit linkem Balken (asset-notice übernimmt); Chips mit Rand und ›.

**Beleg:** `style.css:123, 127; kampf-chips.png`

Dateien: `src/style.css`, `src/app.js`

### D7 · Eindeutige Icons, lesbare Rail-Phasen

**P3** · Wirkung 1/3 · Aufwand S · Designsystem · aus 4 Befunden

**Problem:** Uhr doppelt (Ablauf/Timing), Stern doppelt (Hub/PoK), Karten = Originalmaterial; „StrategieAktion“ klebt.

**Vorschlag:** Sanduhr (geprüfter Pfad) für Timing, Gruppen-Icon für Hub, Bild-Icon für Originalmaterial, Karte mit Initiative für SC; Rail-Phasen mehr Breite.

**Beleg:** `app.js:31, 36, 40, 54, 360-361, 598-599; d-ablauf.png`

Dateien: `src/app.js`, `src/style.css`

### D8 · Desktop-Aktionsleiste an der Lesespalte ausrichten

**P3** · Wirkung 1/3 · Aufwand S · Designsystem · aus 3 Befunden

**Problem:** Weiter-Knopf 1030 px, Pfeil weit vom Text.

**Vorschlag:** Ab 960 px .actionbar:not(.ext-dock)>* max-width 820, padding 48, zentriert; title „Pfeiltaste →“.

**Beleg:** `style.css:52, 750; d-ablauf.png`

Dateien: `src/style.css`

### D10 · theme-color passend zu Hell und Dunkel

**P3** · Wirkung 1/3 · Aufwand S · Designsystem · aus 2 Befunden

**Problem:** Statusleiste immer #172033.

**Vorschlag:** Zwei Metas mit media light/dark; bei manueller Wahl per JS setzen.

**Beleg:** `build.py:48`

Dateien: `build.py`

### D12 · Typografie: Eigennamen, Apostrophe, z. B.

**P3** · Wirkung 1/3 · Aufwand S · Designsystem

**Problem:** „Jol-/Nar“, gerade Apostrophe, „ich…?“, „z. B.“ zerfällt.

**Vorschlag:** nobr-Whitelist; ’ in Daten; „ich …?“ mit NBSP; z. B./d. h. mit U+00A0; hyphens in schmalen Karten.

**Beleg:** `de-namen.js:33; themen.js:100-125`

Dateien: `src/kompendium.js`, `src/data/themen.js`, `src/style.css`

### D13 · Geräteneutrale Formulierungen

**P3** · Wirkung 1/3 · Aufwand S · Designsystem

**Problem:** „Tippe …“ auch am PC.

**Vorschlag:** „Was hast du vor?“, „Bild öffnen …“, „System wählen …“.

**Beleg:** `app.js:197; kompendium.js:136; aufbau.js:252`

Dateien: `src/app.js`, `src/kompendium.js`, `src/assets.js`, `src/aufbau.js`, `src/hub.js`

### D14 · SVG statt Textzeichen für ↺ ✓ ‹ › ↗ ♛

**P3** · Wirkung 1/3 · Aufwand S · Designsystem · aus 2 Befunden

**Problem:** Zeichen fehlen im Latin-Subset oder sind winzig.

**Vorschlag:** svg back/fwd/reset/ext/trophy; ✓ als pathSvg mit sr „erledigt“.

**Beleg:** `app.js:335, 629-631; assets.js:43, 49; hub.js:417`

Dateien: `src/app.js`, `src/assets.js`, `src/hub.js`

### B12 · Kleinste Beschriftungen auf 12 px

**P3** · Wirkung 1/3 · Aufwand M · Barrierefreiheit

**Problem:** Versal-Labels 10,5–11 px, alles in px.

**Vorschlag:** 11-px-Labels auf 12 px, .fs-stats span 11 px; rem nur mit min-height-Umbau.

**Beleg:** `style.css:41, 103, 158, 171, 646`

Dateien: `src/style.css`

### D3 · Typo-Skala als Tokens

**P3** · Wirkung 1/3 · Aufwand M · Designsystem

**Problem:** 29 Größen, 13 Halbpixel, fünf h2-Stile, acht Label-Varianten.

**Vorschlag:** --t-label…--t-h1 aus vorhandener Skala; Kartentext einheitlich; gemeinsame .label-Klasse.

**Beleg:** `style.css: 259 font-size-Deklarationen`

Dateien: `src/style.css`

### D5 · Spielfarben als Tokens

**P3** · Wirkung 1/3 · Aufwand M · Designsystem

**Problem:** 201 Hex-Literale, fünf Blautöne.

**Vorschlag:** --g-green/blue/yellow/red/gray/purple; Duplikate über :where(); map.js gemeinsame Konstanten.

**Beleg:** `style.css:461-704; map.js`

Dateien: `src/style.css`, `src/map.js`

## 9. PWA, Offline, Plattform & Teilen

Offline-Fähigkeit ist ein Kernversprechen; Start, Cache und Safe-Areas müssen am Handy sitzen, Teilen und Drucken verbinden die Gruppe.

### P1 · Start aus dem Cache, Update-Hinweis statt stiller Aktivierung ⚡

**P1** · Wirkung 3/3 · Aufwand S · PWA & Plattform · aus 2 Befunden

**Problem:** Navigation wartet bis 3 s aufs Netz; Updates aktivieren still mitten in der Sitzung.

**Vorschlag:** Navigation cache-first aus dem versionierten Precache; kein put auf './'; skipWaiting erst per postMessage; Toast „Neue Version · Neu laden“; registration.update() bei visibilitychange.

**Beleg:** `sw.js:9, 34-42; FCP 3076 ms`

Dateien: `src/pwa/sw.js`, `build.py`, `src/app.js`

### P2 · Kern-Cache zuerst, Bilder fortsetzbar und getrennt versioniert

**P1** · Wirkung 3/3 · Aufwand M · PWA & Plattform · aus 3 Befunden

**Problem:** 34 MB atomar per addAll; ein Fehler = kein Offline; jedes Text-Update lädt alles neu.

**Vorschlag:** ti4-core-<hash> (~1–3 MB) atomar; ti4-img mit Pfad+sha-Liste, im Hintergrund paketweise, Fehler übersprungen; englische Bögen beim Ansehen bzw. per Knopf „Alle Bilder offline speichern“.

**Beleg:** `sw.js:5-16; build.py:112-118; 751 Dateien`

Dateien: `src/pwa/sw.js`, `build.py`, `src/app.js`, `src/assets.js`

### P4 · „Als App installieren“ anbieten ⚡

**P2** · Wirkung 2/3 · Aufwand S · PWA & Plattform

**Problem:** Nur Anleitung tief in den Credits.

**Vorschlag:** beforeinstallprompt merken; einmalige wegklickbare Karte und Eintrag in Partie/Rail; iOS-Dialog; nie standalone/Artifact.

**Beleg:** `grep beforeinstallprompt 0; app.js:519-522`

Dateien: `src/app.js`, `src/style.css`

### P6 · Safe-Areas vollständig berücksichtigen ⚡

**P2** · Wirkung 2/3 · Aufwand S · PWA & Plattform · aus 5 Befunden

**Problem:** Links/rechts ignoriert (Notch im Querformat), Bilddialog und Vollbild-Knöpfe unter Statusleiste/Home-Indikator, Rail/Dock ab 960 px, weiße Statusschrift auf hellem Grund.

**Vorschlag:** padding mit max(16px,env(left/right)) je Breakpoint; Dialog-inset auf Safe-Area; Vollbild-Knöpfe +env(); .rail/.actionbar/#hb-toast ab 960 +env(bottom); html{background:var(--chrome)}, oben dunkler Streifen.

**Beleg:** `build.py:52, 91; style.css:353-358, 587, 732, 750; ipad-land.png`

Dateien: `src/style.css`

### P8 · Flüchtigen Zustand über Neuladen retten ⚡

**P2** · Wirkung 2/3 · Aufwand S · PWA & Plattform · aus 3 Befunden

**Problem:** Darf-Antworten, Suche, Regelfilter und Hub-Entwurf weg nach Tab-Verwurf oder Pull-to-Refresh.

**Vorschlag:** D.UI.sess() über sessionStorage (try/catch) für darfSt, searchQ, ruleFilter, Hub-Entwurf; an allen Leer-Stellen mitlöschen.

**Beleg:** `app.js:17-18, 152; reload-state q '' n 0`

Dateien: `src/app.js`, `src/hub.js`

### T3 · „✓ Kopiert“ nur bei Erfolg ⚡

**P2** · Wirkung 2/3 · Aufwand S · Teilen & Druck

**Problem:** execCommand false wird ignoriert.

**Vorschlag:** Rückgabe prüfen, sonst Feld mit vorausgewähltem Text; gemeinsamer D.UI.copy mit Ansage.

**Beleg:** `aufbau.js:362; copy/report.json`

Dateien: `src/aufbau.js`, `src/hub.js`, `src/app.js`

### P3 · Offline-Status auf der Über-Seite

**P2** · Wirkung 2/3 · Aufwand M · PWA & Plattform · aus 2 Befunden

**Problem:** Niemand sieht, ob die App offline bereit ist.

**Vorschlag:** Statuszeile „Offline bereit · Stand …“ / „x von y“ / „Erneut versuchen“; persist() auf Knopfdruck; iOS-Hinweis.

**Beleg:** `app.js:516-522; build.py:59-63`

Dateien: `src/app.js`, `src/pwa/sw.js`, `build.py`

### T2 · Teilen per navigator.share

**P2** · Wirkung 2/3 · Aufwand M · Teilen & Druck · aus 3 Befunden

**Problem:** Galaxie, Seiten und Einladungen nur kopierbar; installierte App ohne Adressleiste; iPhone landet im prompt().

**Vorschlag:** D.UI.share({title,text,url}) mit Kopier-Fallback; Teilen-Icon im Kopf von Thema/Fraktion/Aufbau/Session, „Link teilen“ in offenen Regeln; Generator „Galaxie teilen…“; Einladung erst nach Tipp teilen/kopieren mit fertigem Text.

**Beleg:** `aufbau.js:357-369; hub.js:747-751, 804-808`

Dateien: `src/app.js`, `src/aufbau.js`, `src/hub.js`

### T1 · Druck-Stylesheet für Spickzettel und Aushang

**P3** · Wirkung 2/3 · Aufwand M · Teilen & Druck · aus 5 Befunden

**Problem:** Kein @media print: Leisten verdecken Text, details zu, Generator nur ein Reiter, Hub druckt Countdown und 25 Porträts.

**Vorschlag:** Block @media print: Leisten/Bedienelemente aus, break-inside:avoid; beforeprint öffnet details (Regeln: Treffer/geöffnete bzw. Verzeichnis); Generator alle Abschnitte plus Link; Aufbau Kopfzeile mit Spielerzahl; Hub nur Termin, Ort, Plätze.

**Beleg:** `grep @media print 0; m-overlap.png; p-generator-m.pdf`

Dateien: `src/style.css`, `src/app.js`, `src/aufbau.js`, `src/hub.js`

### T5 · QR-Code zum Weitergeben

**P3** · Wirkung 2/3 · Aufwand M · Teilen & Druck

**Problem:** Kein Abscannen von App, Galaxie oder Einladung am Tisch.

**Vorschlag:** qrcode-generator (MIT, ES5) gebündelt; D.UI.qr im Dialog (schwarz auf weiß) auf Über-Seite, Generator-Teilen, Hub-Einladung.

**Beleg:** `grep qr 0; aufbau.js:288-292`

Dateien: `build.py`, `src/app.js`, `src/aufbau.js`, `src/hub.js`

### P5 · Manifest: Screenshots und eigene Shortcut-Icons

**P3** · Wirkung 1/3 · Aufwand S · PWA & Plattform

**Problem:** Knapper Installationsdialog, Shortcuts gleich.

**Vorschlag:** Zwei Screenshots außerhalb des Precache; 96-px-Icons; Shortcut Kartengenerator.

**Beleg:** `manifest.webmanifest`

Dateien: `src/pwa/manifest.webmanifest`, `src/icons/`

### P9 · Boot-Markup statt leerer Hülle

**P3** · Wirkung 1/3 · Aufwand S · PWA & Plattform

**Problem:** Bis zum Skript nur dunkler Streifen; Tab-Leiste springt hinein.

**Vorschlag:** Platzhalter im Kopf, „Lädt …“ mit Fehlerhinweis, #tabbar:empty min-height; system-ui.

**Beleg:** `firstpaint-light.png; FCP 2596 ms 3G`

Dateien: `src/index.template.html`, `src/style.css`

### P10 · Externe Links kennzeichnen, offline abfangen

**P3** · Wirkung 1/3 · Aufwand S · PWA & Plattform

**Problem:** Credits-Links ohne ↗; offline Fehlerseite.

**Vorschlag:** ↗ plus sr „(öffnet außerhalb der App)“; bei navigator.onLine false Hinweis statt Navigation.

**Beleg:** `app.js:530-537`

Dateien: `src/app.js`

### P11 · format-detection gegen Telefonlinks

**P3** · Wirkung 1/3 · Aufwand S · PWA & Plattform

**Problem:** iOS kann Kartennummern als Telefonnummer markieren.

**Vorschlag:** <meta name=format-detection content='telephone=no, date=no, address=no, email=no'>.

**Beleg:** `build.py:48-57`

Dateien: `build.py`

### T4 · Link-Vorschau im Messenger

**P3** · Wirkung 1/3 · Aufwand S · Teilen & Druck

**Problem:** Nackte URL ohne Vorschau.

**Vorschlag:** og:/twitter:-Tags mit og.png (nicht im Precache); __ORIGIN__ per Pages bzw. nginx sub_filter.

**Beleg:** `build.py:46-56`

Dateien: `build.py`, `src/index.template.html`

### P12 · Ein-Datei-Export unter 16 MB und ohne Google Fonts

**P3** · Wirkung 1/3 · Aufwand M · PWA & Plattform · aus 2 Befunden

**Problem:** 44,7 MB Base64, 19 s leer; Schriften von Google (offline weg, DSGVO).

**Vorschlag:** --artifact als Ordner: Fragment + WebP als Begleitdateien, SVG inline; Größenprüfung ab 16 MB; lokale woff2 statt Google Fonts.

**Beleg:** `build.py:28-33, 113-144; dist/artifact.html`

Dateien: `build.py`, `src/assets.js`, `README.md`

## Verworfen bei der Gegenprüfung

- **Darf-Panel im Ablauf: „Passen“ und „Handeln“ liegen unter dem Dock, weil die Kampf-Links dazwischen stehen** – Nachgemessen bei 390×844: Reihe 1 liegt bei 571-635, die Link-Zeilen bei 647-743, Reihe 2 bei 782-856, die Dock-Oberkante bei 695. Das stimmt mit dem Finding überein. Dann habe ich die .darf-more-Links per JS hinter die letzte Gruppe gesetzt und als zweispaltige Zeile gezeigt. Danach liegt Reihe 2 bei 674-748, also weiterhin zu drei Vierteln unter dem Dock (695). Die versprochene Wirkung „alle 8 Kacheln über dem Dock“ tritt nicht ein. Das genannte Finding 1 kürzt den Kopf nicht, es behandelt den Hüter-Schalter. Bei 375×667 (iPhone SE 2/3) liegt die Dock-Oberkante bei 518, und schon Reihe 1 (571-646) ist verdeckt. Scrollen ist dort also ohnehin nötig. Die Links stehen außerdem bewusst hinter der Gruppe „Taktikaktion“, denn Raumkampf und Einmarsch sind Schritt 3 und 4 der Taktikaktion. Hinter „Sonst im Zug“ zerreißen sie diese Gruppierung. Übrig bleibt normaler Inhalt unterhalb des sichtbaren Bereichs: Ein kurzer Scroll bringt „Passen/Handeln“ ins Bild (m-scrolled.png). Merklich wirken würde höchstens die Alternative, die Achtung-Notiz (ca. 114px) unter das Panel zu setzen, und die nur bei ≥844px Höhe. Das ist ein Detail ohne nennenswerten Nutzen am Tisch.
- **Checkliste und „Darf ich das?“ sind nicht verbunden** – Die Lücke gibt es zwar, Checklistenpunkte und Prüfungen sind tatsächlich nicht verknüpft. Der Vorschlag bringt aber fast nichts und kostet Platz. Das Darf-Panel steht direkt über der Checkliste (laut Finding 18 px Abstand). Ein „Prüfen“-Button öffnet die Prüfung und scrollt per pendingReveal zum Panel. Der Weg hoch zum Panel und zurück zur Checkliste bleibt also, gespart wird nur das Finden der passenden Kachel. Dafür bekäme jede Checklistenzeile neben dem vollflächigen Checkbox-Label (app.js:288–291) eine zweite Tippfläche von 44×44 px. Das bedeutet konkurrierende Ziele in einer Zeile, Fehltipps am Tisch werden wahrscheinlicher. Bei 390 px und erst recht bei 320 px bleibt weniger Textbreite, die ohnehin schon 956 px lange Liste wird noch länger und verschärft damit Finding 1. Auch die Rückmarkierung in der Checkliste ist überflüssig: Die Schrittleiste im Panel markiert den aktiven Schritt bereits (app.js:201, aria-current=step). Mit Finding 1 (Sprungleiste) und Finding 2 (Badges/Stepper) ist der Zusammenhang besser gelöst.
- **Ergebnisboxen im Dunkelmodus kaum vom Panel zu unterscheiden, Gold für vier Bedeutungen** – Die Kernaussage „Box nur am Fokusring erkennbar“ hält nicht. Der goldene Ring in m-dark-kampf-must und m-dark-kampf-skip kommt daher, dass der Capture per Skript .click() und danach focus() ausführt. Bei einem echten Tipp zeigt Chrome bei programmatischem Fokus keinen :focus-visible-Ring. Ich habe dieselben Zustände im Dunkelmodus mit blur() aufgenommen (Nicht erlaubt, Pflicht, Erlaubt, Bedingung). Alle Boxen heben sich deutlich vom Panel ab: rötlich, grün, blaugrau, goldbraun, dazu ein 40-px-Icon und eine farbige Überschrift. Die Leuchtdichte-Kontraste (1,04 bis 1,19) stimmen zwar, sagen bei Flächen mit anderem Farbton aber wenig. Auch im hellen Modus liegen sie nur bei 1,13 bis 1,18. Dass Gold mehrfach vorkommt, ist im Dunkelmodus Absicht: --btn = Gold ist die Farbe für Auswahl und Primäraktion. Das Ergebnis „Bedingung“ ist durch „!“-Icon und den Titel „Nur unter Bedingung“ eindeutig, also Geschmackssache. Der Vorschlag, für „Bedingung“ Orange #f0a04b zu nehmen, wäre sogar schädlich: Es liegt nah am Warn-Lachs #ef7d72 (nur 1,25:1, gleiche Farbfamilie) und würde „Bedingung“ und „Nicht erlaubt“ am Tisch verwechselbar machen.
- **Spur zeigt grüne Haken für Antworten, die noch nichts entscheiden** – Reine Geschmackssache. Eine Antwort ohne Treffer heißt in darfEval: Diese Hürde ist genommen, es geht weiter Richtung c.ok (kind ok). Genau das sagt der grüne Haken, so wie man es von Checklisten kennt. Endet die Prüfung mit „Nicht erlaubt“, steht der rote Haken an der entscheidenden Zeile, und die grünen davor zeigen, welche Bedingungen erfüllt waren. Das hilft sogar beim Nachvollziehen. In m-timing-sekundaer-q3 bedeuten zwei grüne Haken bei offener Frage 3 genau „bisher kein Hindernis“. Nummerierte neutrale Punkte würden nur die Frage-Nummer doppeln, die schon in der Karte steht („Frage 3 von 4“), und kein echtes Problem lösen.
- **Ergebnis-Überschrift nennt nur die Kategorie, Panelkopf wiederholt den Prüfungsnamen** – Geprüft habe ich app.js:197 (Untertitel im Panelkopf), app.js:226 (.nm) und app.js:244 (Ergebniskopf nur mit DARF.kinds) sowie die Screenshots m-kampf-pick-jaeger.png und m-kampf-rueckzug-ok.png. Die Doppelung im Panelkopf gibt es zwar, sie ist aber Geschmackssache: Der graue Untertitel nennt zusätzlich das Set („Raumkampf:“ bzw. „Einmarsch:“). Das hilft auf der Kampf-Seite, weil dort zwei Panels übereinander stehen, und es kostet keinen Platz. Die Behauptung, das Ergebnis zeige „ohne Hinweis“ nur „Entfällt“ oder „Pflicht“, stimmt nicht. Ich habe alle Ergebnistexte in darfich.js durchgesehen, und sie benennen die Handlung direkt unter dem Kategoriewort: „Kein Raumkampf. Weiter mit Schritt 4“, „Der Raumkampf ist Pflicht“, „Kein Bodenkampf auf diesem Planeten“, „Du darfst den Rückzug ansagen“, „Ihr dürft eine Transaktion machen“ und so weiter. reveal() (app.js:259ff.) scrollt außerdem nur so weit, dass das Ergebnis sichtbar wird. Die letzten Antwortzeilen der Spur bleiben direkt darüber stehen, im Screenshot etwa „Fremde Schiffe im Ziel? Nein“ und „Anomalie als Ziel? Nein“. Dazu hat der Nutzer die Prüfung Sekunden vorher selbst angetippt. Die vorgeschlagene Overline („RÜCKZUG ANSAGEN“ über „Erlaubt“) wiederholt nur, was der erste Satz des Ergebnisses ohnehin sagt.
- **„Frage X von Y“ führt in die Irre, wenn eine Prüfung früher endet** – „Frage X von Y“ (app.js:237) ist korrekt, wenn man Y als Höchstzahl liest. Die Prüfungen sind kurz, höchstens 4 Fragen (darfich.js). Wenn eine Prüfung früher endet, kommt die Antwort schneller als erwartet. Das ist ein angenehmer Effekt und kein Schaden am Tisch. Belege dafür, dass Nutzer davon irritiert sind, gibt es nicht. Der Hauptvorschlag mit den Fortschrittspunkten ● ● ○ ○ löst das beschriebene Problem nicht, denn vier Punkte suggerieren genauso eine feste Länge. Die Textvariante „Frage 3 · höchstens 4“ wäre reine Geschmackssache und sprachlich holpriger.
- **Regelverweise als Chip-Wolke: 12 Chips belegen 402px** – Die Höhe stimmt: 402 px für 12 Chips auf #t-pok. Der versprochene Gewinn tritt aber nicht ein. Mit dem vorgeschlagenen Grid (minmax(160px,1fr), 44 px, gap 6) in die Seite injiziert sinkt die Höhe nur von 402 auf 330 px, also um 18 % statt 40 %. Mehrere Titel brechen dann zweizeilig um, bei „Nr. 7“, „Nr. 73“, „Nr. 56“ und „Nr. 99“ sogar die Nummer. Eine echte Liste mit einer Spalte wäre mit 618 px höher als die Wolke. Das Sortieren nach Nr. ist schädlich, denn die Reihenfolge ist absichtlich nach Inhalt gewählt, etwa im Kampf-Thema raumkampf, einmarsch, bodenkampf in Spielreihenfolge (themen.js:49). Der Block steht als „weiterlesen“ am Seitenende und stört den Gebrauch am Tisch nicht. Es bleibt eine Geschmacksfrage.
- **Ringfarben im Schema zu kontrastarm, Farbe ist das einzige Merkmal** – Die gerechneten Kontraste stimmen: 3. Ring gegen Brett 1,92:1, 2. gegen 3. Ring 1,83:1, 3. gegen 4. Ring 1,83:1. Farbe ist aber nicht das einzige Merkmal. Die Ringe sind konzentrisch, ihre Zugehörigkeit ergibt sich aus der Geometrie, dazu kommen Legende und schwarze Trennkonturen. In m-dark-aufbau-schema.png und r3/m-schema-*.png lassen sich alle Ringe gut unterscheiden. Der Vorschlag schadet sogar: Mit #3553a8 für den 3. Ring sinkt der Kontrast zum 2. Ring auf 1,34:1 und zum 4. Ring ebenfalls auf 1,34:1, beide Nachbarn rücken also näher heran. Ringnummern mit 30 Einheiten wären in 45 bis 57 px breiten Sechsecken nur etwa 7 px groß, nicht lesbar und zusätzliches Rauschen. Dass der Rahmen des Bretts im Dunkelmodus fast verschwindet, ist Geschmack: Das Brett hat seinen 1-px-Rahmen var(--space-line), und der Inhalt ist klar zu sehen. Ein schwacher Kartenrand auf dunklem Grund ist ein übliches Muster ohne Informationsverlust.
- **Desktop: Seitentitel steht doppelt** – Die Doppelung ist nur oben auf der Seite zu sehen und ist ein übliches Muster: großer Titel im Inhalt, kleiner Titel in der festen Leiste. Beim Scrollen ist der Titel in der Kopfleiste die einzige Seitenangabe im Inhaltsbereich (extra/vs-skep2/z/d-karten-scrolled.png). Die Behauptung „ohne Orientierung“ stimmt also nicht. Platz spart der Vorschlag nicht: Die Höhe der Desktop-Kopfleiste kommt von der Ablauf-Pille und den Knöpfen, mit Brotkrume bleibt sie gleich. Die Hierarchie zeigt am Desktop schon die Seitenleiste mit der Gruppe „Nachschlagen“ und der hervorgehobenen „Karten“. Der Aufwand ist unterschätzt: route.crumb müsste in jedem parse() aller Erweiterungen gesetzt werden (kompendium.js:340-348, assets.js:83, aufbau.js:393-406, hub.js:972-986). Einziger echter Kleinpunkt: „Im Kampf“ in der Kopfleiste gegenüber „Kampf“ als h1 (app.js:570). Das ist kosmetisch.
- **TI4-Wiedererkennung: Sechseck als durchgehendes Motiv** – Geprüft: Eine konkrete Nutzerhürde wird nicht belegt, es geht um Geschmack und Markenwirkung. Die Belege sind zudem teils falsch: Das Sechseck kommt nicht nur als ICON.aufbau vor. Es ist das App-Icon (site/icons/icon.svg: goldenes Sechseck auf Navy), es steht im dunklen Fraktionsbogen (Heimat-System-Sechseck in der Textfassung), in der Fraktionsliste als hexThumb-Fallback (kompendium.js:94) sowie in Aufbau-Schema und Kartengenerator. Der helle Modus ist auch nicht generisch: dunkle Kopf- und Tab-Leiste (--chrome), Gold-Akzent, Saira Condensed für Überschriften, dunkle Fraktionskarten mit Goldrahmen. Der Vorschlag hätte außerdem Nachteile: clip-path schneidet Rahmen ab, deshalb müsste das Umriss-Design der Zähler (ol.steps, style.css:151) in Flächen umgebaut werden. Das 44px-Icon-Feld der .topic-Kacheln würde als Sechseck kleiner. Und ein Sternenfeld hinter dem Seitentitel in der Sticky-Kopfzeile ist am Handy reine Dekoration hinter dem wichtigsten Orientierungstext. Die angegebene Wirkung 2 ('Wiedererkennung steigt deutlich') ist nicht belegbar.
- **Wischen zwischen Schritten fehlt, Schrittwechsel ohne Übergang** – Das Problem ist nicht belegt, und der Vorschlag birgt ein Risiko. Feedback beim Schrittwechsel gibt es bereits mehrfach: Die h1 wechselt, ebenso die Zeile „Schritt X von Y“, die Fortschrittspunkte oben und die .segs im Dock. Auch die Beschriftung des Weiter-Knopfs ändert sich, sie nennt immer den nächsten Schritt („Weiter: …“). Der Knopf ist 56 px hoch und liegt im Daumenbereich. Zum Risiko: goNext() am letzten Schritt der Runde erhöht die Runde, leert die Listen raumkampf, einmarsch, taktik und handel und setzt darfSt zurück. Ein versehentliches Wischen beim schrägen Scrollen würde also Häkchen löschen. Das lässt sich nicht rückgängig machen, denn goPrev() bei p=0/s=0 tut nichts. Auf einer senkrecht scrollenden Seite stört eine waagrechte Wischgeste außerdem das Lesen, und ohne den zusätzlichen Hinweis findet sie niemand. Bei viel Aufwand bringt das wenig Nutzen.
- **Tisch- und Großansicht für das Tablet in der Mitte** – Das Szenario „Tablet in der Tischmitte, alle lesen mit“ ist nicht belegt. README.md:3 nennt die App ausdrücklich „gebaut fürs Handy am Spieltisch“, und die Ansage ist für den Host zum Vorlesen gedacht (app.js:328, „Ansage an den Tisch“). Für ihn sind 18 px in Armlänge ausreichend; der Abstand zu 19/20 px Fließtext ist Geschmackssache. Die Drehung nur von #view lässt Kopfleiste, Dock und Tabbar ungedreht und hilft nur der gegenüberliegenden Seite, nicht den seitlich Sitzenden. Die Textgrößen-Stufe über eine Variable --fs ist kein M: style.css enthält 261 font-size-Angaben in px (grep), alle müssten auf calc() umgestellt werden, also L. Zoom ist auch nicht blockiert: Der Viewport erlaubt Pinch-Zoom (kein user-scalable=no, site/index.html:5). Die Leerfläche auf dem Tablet ist das Thema von Befund 4 und wird dort günstiger gelöst.
- **Lautsprecher-Symbol bei „Ansage an den Tisch“ tut nichts** – Die Belege stimmen: .say ist ein div ohne data-act, speechSynthesis kommt nirgends vor. Der Vorschlag passt aber nicht zum Zweck der Box. Es gibt nur 8 Ansagen, alle kurz und in der Ich- oder Du-Form des Hosts geschrieben („Ich lese die Agenda mit allen Alternativen vor.“, „Du bist dran. Was machst du?“). Aus dem Handylautsprecher mit Computerstimme ergeben die keinen Sinn. Gemeint ist ein Sprechzettel für den Host und keine Audiodatei. Dass es offline funktioniert, ist auch nicht sicher: Desktop-Chrome nutzt für Deutsch meist Netzstimmen, unter Linux und auf manchen Android-Geräten gibt es oft keine lokale deutsche Stimme, und dann liest eine englische Stimme den deutschen Text. Dass das Lautsprecher-Symbol nach Abspielen aussieht, ist höchstens ein kleiner Schönheitsfehler. Man könnte es durch eine Sprechblase ersetzen, das ist reine Geschmackssache.
- **Schriften werden erst nach dem kompletten HTML angefragt** – Ich habe den Vorschlag nachgebaut: eine Kopie von site/ mit drei Preload-Links, verglichen bei 3G und 6-facher CPU mit gzip-Server, je zwei Läufe. Der Preload entfernt zwar den Font-Shift von 0,026 (CLS 0,036 auf 0,009). Dafür kommt der erste Inhalt rund 530 ms später (FCP 2630 auf 3160 ms), weil die Schriften dem HTML Bandbreite wegnehmen. Das stabile Endlayout kommt in beiden Varianten bei etwa 3,74 s. Schon ohne Preload ist der CLS mit 0,036 klar im grünen Bereich unter 0,1. Das Ganze betrifft nur den allerersten Besuch: Danach liefert der Service Worker die Schriften aus dem Cache, gemessen CLS 0 auch bei 6-facher CPU und 3G. Die vorgeschlagenen Fallback-Faces mit src:local("Arial") greifen auf Android, dem Hauptziel, nicht, weil es Arial dort nicht als lokale Schrift gibt. Gegen eine schmale Saira-Condensed-Ersatzschrift hilft size-adjust ohnehin nicht. Unterm Strich verschlechtert der Vorschlag die gefühlte Ladezeit für einen kaum sichtbaren Gewinn.
- **„Wann darf ich…?“ und „Darf ich das?“ sind kaum zu unterscheiden** – Geprüft: Das Thema „Wann darf ich…?“ (themen.js:100) bindet den Prüfer bewusst als Block ein (themen.js:103 {darf:"aktion"}), und die README:6 beschreibt genau diese Verbindung. Beide Namen sind inhaltlich stimmig, beide drehen sich um „darf ich“. Wer eines findet, landet auch beim anderen. Die Q&A-Einträge sind als Fortsetzung des Titels geschrieben: „…eine Aktionskarte mit „Aktion“ spielen?“ (themen.js:104–105). In der Suche ergeben Typ-Label „Wann darf ich…?“ und Titel zusammen einen Satz (app.js:446). Mit „Timing und Streitfragen“ bzw. „Streitfrage“ fehlte diesen Fragen der Satzanfang, man müsste alle Fragen umformulieren oder eine Zwischenüberschrift „Wann darf ich …“ einfügen. Damit wäre der angeblich verwechselbare Name wieder da. Dass Nutzer etwas nicht finden, ist nicht belegt. In der Suche haben beide Typen eigene, unterscheidbare Labels (mit Set-Namen). Das ist Geschmackssache, und der Vorschlag würde die Lesbarkeit der Q&A verschlechtern.
- **„Spieleabend starten“: geführter Start von der Session bis Runde 1** – Der Assistent würde vor allem wiederholen, was der Aufbau schon führt: Schema für n Spieler, „Galaxie zusammensetzen“ in Schritten, Generator-Link und die LRR-Checkliste mit 12 Schritten, darunter „1 · Sprecher zufällig bestimmen“ und Schritt 12 mit 10 oder 14 Punkten (themen.js:260, 271; aufbau.js:84-99). Die Fraktionswahl gehört in den Hub und findet dort vor dem Abend statt. Dass die App nicht weiß, wer Sprecher ist, stört nicht: Am Tisch zeigt der echte Sprechermarker, wer gemeint ist. „Sprecher, du wählst zuerst“ funktioniert deshalb ohne Namen. Die Sitzordnung per ↑/↓ für 6 bis 8 Spieler am Tisch einzugeben, macht Arbeit für den Host und bringt erst mit Befund 3 etwas. Aufwand L für eine zusätzliche Route neben dem Aufbau, mit dem Risiko, dass der Inhalt zweimal gepflegt werden muss. Was davon wirklich fehlt, steht schon in der Überarbeitung von Befund 0: der Übergang vom Aufbau zu Runde 1 mit Zurücksetzen und der Einstieg aus dem Hub auf #aufbau-N.
- **Ergebnis muss im Hub komplett neu eingetippt werden** – Die Grundannahme stimmt nicht. Der Ablauf speichert nur Phase, Schritt, Runde und Hütermarker ({p, s, round, cust}). Er kennt keine Teilnehmer, keine Siegpunkte, keine Start- oder Endzeit, keine Karte und auch keine Ende-Ansicht. Der letzte Agenda-Schritt bietet nur „Runde 6 starten“. Die Siegpunkte werden also nicht „noch einmal“ eingetippt, sondern zum ersten Mal, und zwar von der Siegpunktleiste auf dem Tisch. Der Vorschlag würde D.Hub.prefill mit Daten füttern, die es nicht gibt. Dafür bräuchte es erst einen eigenen Punktezähler pro Spieler im Ablauf, dazu eine Pending-Warteschlange neben dem optimistischen Sperren (409). Das ist Aufwand L, nicht M. Außerdem übertreibt die Evidenz: Die 5 Platz-Felder sind optional, der Editor sagt selbst „Platz leer lassen, dann zählen die Siegpunkte“. Es bleiben 5 Zahlenfelder. Zum Editor kommt man schon in zwei Tipps: Hub, „Zur Session“, dann „Gespielt“. Die Karte ist Thema von Befund 1. Die Rundenzahl allein rechtfertigt keinen Umbau.
- **Ansagen nennen „Sprecher“ statt Namen, ein Sprecherwechsel ist unbekannt** – Der Text in ablauf.js:8 und :80 ist so, wie beschrieben, und die LRR-Stellen stimmen (DE 81.1, 81.2, 68.2 i, 81.6). Der Vorschlag setzt aber ein Spielermodell voraus, das es im Ablauf nicht gibt. Der Ablauf-Zustand besteht nur aus Phase, Schritt, Runde und Hütermarker (app.js:14 DEFAULT = { p, s, round, cust }). Namen, Sitzordnung und Sprecher werden nirgends geführt, auch ein Partie-Sheet gibt es nicht. Der Ablauf ist außerdem nicht mit dem Hub verbunden. Die Reihenfolge der Hub-Teilnehmer (hb-up) ist nicht als Sitzordnung gedacht. Gebaut werden müssten also Namenseingabe, Sitzordnung, Speicherung, eine Bedienung für den Sprecherwechsel und die Platzhalter-Ersetzung. Das ist L, nicht M. Am Tisch ist der echte Sprechermarker die verlässliche Quelle, und jeder sieht, wer ihn hat. Die Ansage „Sprecher, du wählst zuerst“ ist deshalb ohne Übersetzung verständlich. Wird Politik mitten in der Aktionsphase gespielt (LRR 81.6), muss der Host die App von Hand nachziehen. Vergisst er das, nennt die App den falschen Namen, und das ist schlechter als der heutige allgemeine Text. Nutzen und Risiko stehen in keinem guten Verhältnis zum Aufwand.
- **Tischanzeige für Tablet oder TV in der Tischmitte** – Das behauptete Problem ist am Tisch größtenteils schon gelöst, und der Vorschlag hängt an Funktionen, die es nicht gibt. (1) „Wie viele Punkte hat Basti?“ beantwortet das Brett: Laut LRR 77.2 zeigt jeder Spieler seine Siegpunkte auf der Siegpunktleiste an, die für alle sichtbar neben dem Spielplan liegt. Die Phase ist am Spielgeschehen erkennbar. (2) Der Ablauf kennt keine Spieler, keine SP, keinen Sprecher und keine Initiative-Leiste (grep in app.js ohne Treffer). Die Anzeige bräuchte also zuerst ein komplettes SP- und Spieler-Tracking mit Eingabe-UI auf dem Host-Handy, das die physische Leiste nur doppelt führt, dazu den Live-Sync-Server aus Finding 0. Das wäre deutlich mehr als L. (3) Die Messwerte sind selektiv: report.json misst bei 1920 px den eigentlichen Schritt-Titel (h1) mit 54 px und den Text mit 20 px. Klein sind nur Rundenzähler, Krümelpfad und Eyebrow, j09 zeigt einen gut lesbaren Schritt. (4) Für ein Werkzeug, das zuerst fürs Handy am Tisch gebaut ist, ist ein TV-Modus ein Nischenfall ohne Beleg für Bedarf.
- **Abfrage alle 20 s lädt jedes Mal alle Partien komplett, ohne ETag** – Die Rechnung stimmt nicht, weil der Server ohne Proxy gemessen wurde. Im dokumentierten Betrieb (docker-compose) steht nginx davor, mit `gzip on` und application/json in gzip_types (docker/nginx.conf). Die gemessene games.json schrumpft mit gzip -6 von 21.554 auf 2.077 Byte, also auf etwa ein Zehntel.

Außerdem fragt poll() nur ab, wenn die Hub-Route offen und der Tab sichtbar ist (hub.js:955: `!cur() || document.hidden`). Während des Spiels ist man im Ablauf oder Kampf, und bei gesperrtem Handy ist document.hidden gesetzt. Die „18 MB/h“ sind also um eine Größenordnung zu hoch und setzen einen Hub-Tab voraus, der eine Stunde lang im Vordergrund bleibt.

Der Vorschlag funktioniert so auch nicht. nginx setzt für /api/ fest `Cache-Control: no-store` (add_header … always). Der Browser speichert die Antwort dann nicht und schickt kein If-None-Match, selbst wenn der Client cache:"no-cache" verwendet. Der Kommentar zu limit_req in nginx.conf plant den 20-s-Abgleich ausdrücklich ein. Das ist Aufwand M für einen Nutzen nahe null.
- **Drucken im Dunkelmodus: graue Überschriften, alle Checkboxen sehen abgehakt aus** – Der Befund ist ein Artefakt der Nachstellung. Der Auditor hat beim Drucken Emulation.setEmulatedMedia mit media:'print' UND prefers-color-scheme:'dark' erzwungen. Ein echter Browser tut das nicht. Ich habe Chromium stattdessen über die Einstellung preferredColorScheme=0 in den Dunkelmodus gesetzt, so wie es ein dunkles Betriebssystem tut, ohne Media-Override. Auf dem Bildschirm ist die Seite dann dunkel: matchMedia dark = true, body rgb(230,234,241) auf rgb(14,19,28). Das PDF über den normalen Druckweg (printToPDF) kommt trotzdem hell heraus: schwarze Überschriften, leere Checkboxen, dunkler Fließtext. Blink rechnet die Seite beim Drucken mit hellem Farbschema. Grau gefüllte Kästchen und blasse Überschriften entstehen nur durch den künstlichen Override. Firefox druckt nach meinem Wissen ebenfalls hell; geprüft habe ich nur Chromium. Ein beforeprint-Umschalter auf data-theme=light oder ein 'screen and' an style.css:16 wäre damit wirkungslos.
- **Ein-Datei-Export direkt geöffnet: Zeichensalat, Desktop-Layout am Handy, Quirks-Modus** – Das Fragment ohne Gerüst ist gewollt und dokumentiert: build.py:5 und README:207 nennen es „einzelne Datei ohne HTML-Gerüst“. Das Template beginnt mit <title>, und der Artifact-Host ergänzt beim Veröffentlichen doctype, charset und viewport. Die Belege (m-art.png, art/report.json mit BackCompat, 980 px und Zeichensalat) stammen alle aus einem Aufruf über python http.server, also außerhalb des vorgesehenen Hosts. Nirgends wird versprochen, dass man die Datei per Messenger oder USB weitergibt und direkt öffnet. Für den Offline-Fall gibt es die installierbare PWA mit Service Worker. Eine 44-MB-HTML-Datei mit 87 MB JS-Heap als Offline-Weitergabe ist am Handy ohnehin kein brauchbarer Weg. Eine zweite Datei als Dokument würde außerdem mit der sinnvollen Lösung von Befund 1 (Bilder als Begleitdateien) kollidieren. Für Spieler am Tisch hat das keine UX-Wirkung.
- **Bewegung ohne System: fünf Dauern, drei Easings, harter Reduced-Motion-Schalter** – Die Zahlen stimmen (style.css 250/326/327/337/408/494/610/1013, Reduced-Motion-Blöcke 434/717/785, Timer 1600/2400/6000/5000/4000 ms). Ein für Nutzer sichtbares Problem ist es aber nicht. Fünf Dauern in einer kleinen App sind nach Zweck abgestuft: Fortschrittsbalken 0,1 s, Schalter 0,15 s, Toast 0,2 s, Sheet 0,22 s, Bogen umdrehen 0,6 s. Dass Toast und Schalterfarbe bei Reduced Motion sofort erscheinen statt einzublenden, schadet niemandem und erfüllt die Einstellung eher übervorsichtig. Der Toast bewegt sich außerdem tatsächlich (transform translate, Zeile 1012/1013). Der Unterschied zwischen 4 s (Hub: Fraktionen zurücksetzen, hub.js:825) und 5 s (Neues Spiel, app.js:719) bei zwei verschiedenen Scharf-Bestätigungen fällt niemandem auf. Der Vorschlag ist reine Code-Ordnung und rechtfertigt sich nur über andere, noch nicht umgesetzte Übergangs-Ideen. Tokens lassen sich anlegen, wenn solche Übergänge wirklich gebaut werden.
- **Haptik und optionale Töne als einheitliche Rückmeldung** – Die Ausgangsbeobachtung stimmt: grep nach vibrate und AudioContext in src ergibt 0 Treffer. Der Befund sagt aber selbst, dass fehlende Haptik schon gemeldet ist. Was er ergänzt, trägt nicht. (1) Die Annahme „der Host schaut nicht aufs Handy“ passt nicht zu den genannten Auslösern. Weiter, Zurück, Abhaken, Darf-Antworten und Neu würfeln sind Tipps, bei denen man auf den Bildschirm schaut, und die Antwort ist ohnehin ein Text, den man lesen muss. (2) Sieben Vibrationsmuster nach Bedeutung sind nicht unterscheidbar und damit überentwickelt. (3) Töne stören am Spieltisch eine soziale Runde. Als Option sind sie ohne Zusatznutzen gegenüber der Haptik. (4) iOS unterstützt navigator.vibrate nicht, ein großer Teil der Handys bekommt also nichts. Eine Einstellungsseite für Rückmeldungen gibt es nicht, „Über und Credits“ ist reine Info. Der sinnvolle Kern (ein kurzes vibrate(10) bei Phasen- oder Rundenwechsel unter Android, abschaltbar) gehört in den bereits gemeldeten Haptik-Befund.
