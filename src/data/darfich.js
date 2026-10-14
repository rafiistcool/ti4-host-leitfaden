/* „Darf ich das?“: Ja/Nein-Fragen, die zeigen, ob eine Handlung regelkonform ist. Quelle: Living Rules Reference 2.0, Nummern in ref.
   Set:     { id, name, where, stepsTitle?, steps?: [Kurzname je Schritt], groups: [{ name, checks: [Check] }] }
   Check:   { id, label (Kachel, ­ = weiche Trennung), name, step, ref, icon (SVG-Pfad 24×24), at?: [Schrittnummern], hint?,
              qs: [{ q, s (Kurzform), help?, yes?: Ergebnis, no?: Ergebnis }], ok?: Ergebnis }
   Ergebnis: { kind: "ok"|"no"|"cond"|"must"|"skip", text, ref?, notes?: [..] }
   Fehlt bei einer Antwort das Ergebnis, geht es mit der nächsten Frage weiter. Sind alle Fragen durch, gilt ok. */
window.TI4 = window.TI4 || {};
(function () {
  var LANDEN = { id: "landen", label: "Landen", name: "Bodentruppen landen", step: "Taktikaktion · Schritt 4, Einmarsch", ref: "LRR 49.2",
    icon: "M12 3 V13 M8 9 L12 13 L16 9 M4 20 Q12 15 20 20",
    at: [2], hint: "Entsendet wird in Schritt 2, nach dem Bombardement.",
    qs: [
      { q: "Liegt der Planet im aktiven System?", s: "Planet im aktiven System?",
        help: "Gelandet wird nur im Schritt Einmarsch deiner eigenen Taktikaktion.",
        no: { kind: "no", text: "Bodentruppen entsendest du nur auf Planeten im aktiven System.", ref: "LRR 49.2" } },
      { q: "Stehen eigene Bodentruppen im Weltraum dieses Systems?", s: "Bodentruppen im Weltraum?",
        help: "Sie kommen per Schiff mit Kapazität dorthin. Von einem Planeten direkt auf einen anderen geht es nicht.",
        no: { kind: "no", text: "Entsendet werden nur Bodentruppen aus dem Weltraum des aktiven Systems. Bring sie vorher per Schiff hin.", ref: "LRR 49.2" } },
      { q: "Ist es Mecatol Rex, und liegt der Hütermarker noch darauf?", s: "Mecatol Rex mit Hütermarker?",
        help: "Gilt nur, bis jemand den Hütermarker genommen hat.",
        yes: { kind: "cond", text: "Zahle vor dem Entsenden 6 Einfluss und nimm den Hütermarker: +1 Siegpunkt. Dann musst du mindestens 1 Bodentrupp auf Mecatol Rex landen. Kannst du das nicht, darfst du den Marker nicht nehmen.", ref: "LRR 27.1–27.3" } }
    ],
    ok: { text: "Du darfst Bodentruppen auf den Planeten entsenden.", ref: "LRR 49.2–49.4",
      notes: ["Fremde Bodentruppen auf dem Planeten? Erlaubt, dann folgt Bodenkampf.", "Einheiten mit Weltraumkanone auf dem Planeten (z. B. PVS) schießen auf deine gelandeten Truppen.", "Planetarer Schild verhindert nur Bombardement, keine Landung."] } };

  TI4.darf = {
    kinds: { ok: "Erlaubt", no: "Nicht erlaubt", cond: "Nur unter Bedingung", must: "Pflicht", skip: "Entfällt" },
    sets: [
      { id: "aktion", name: "Aktion", where: "Aktionsphase · dein Zug",
        groups: [
          { name: "Taktikaktion", checks: [
            { id: "aktivieren", label: "Aktivieren", name: "System aktivieren", step: "Taktikaktion · Schritt 1", ref: "LRR 89.1",
              icon: "M12 3 L19.8 7.5 L19.8 16.5 L12 21 L4.2 16.5 L4.2 7.5 Z M14.5 12 A2.5 2.5 0 1 1 9.5 12 A2.5 2.5 0 1 1 14.5 12 Z",
              qs: [
                { q: "Liegt noch ein Kommandomarker in deinem Taktikpool?", s: "Marker im Taktikpool?",
                  help: "Aktiviert wird immer mit einem Marker aus dem Taktikpool, nie aus Strategie- oder Flottenpool.",
                  no: { kind: "no", text: "Ohne Marker im Taktikpool gibt es keine Taktikaktion. Wähle eine andere Aktion.", ref: "LRR 89.1a" } },
                { q: "Liegt in diesem System schon ein eigener Kommandomarker?", s: "Eigener Marker im System?",
                  help: "Kommandomarker anderer Spieler zählen nicht.",
                  yes: { kind: "no", text: "Solange dein eigener Marker dort liegt, kannst du das System nicht aktivieren.", ref: "LRR 89.1" } }
              ],
              ok: { text: "Lege einen Marker aus dem Taktikpool in das System. Es ist jetzt das aktive System.", ref: "LRR 89.1",
                notes: ["Fremde Kommandomarker im System stören nicht.", "Eigene Einheiten in der Nähe brauchst du nicht.", "Danach greifen Effekte „nachdem ein System aktiviert wurde“."] } },

            { id: "bewegen", label: "Bewegen", name: "Schiff bewegen", step: "Taktikaktion · Schritt 2", ref: "LRR 58.4",
              icon: "M3 12 H19 M14 7 L19 12 L14 17 M3 7 H8 M3 17 H8",
              qs: [
                { q: "Startet das Schiff in einem anderen System mit eigenem Kommandomarker?", s: "Eigener Marker im Startsystem?",
                  help: "Das aktive System zählt nicht: Schiffe dort dürfen hinaus und wieder hinein, wenn der Bewegungswert reicht.",
                  yes: { kind: "no", text: "Das Schiff bleibt stehen. Aus einem System mit deinem eigenen Marker fliegt nichts los. Durchfliegen solcher Systeme ist dagegen erlaubt.", ref: "LRR 58.4c" } },
                { q: "Reicht sein Bewegungswert bis ins aktive System?", s: "Bewegungswert reicht?",
                  help: "Jedes betretene System zählt 1. Systeme mit gleichem Wurmloch sind benachbart, Hyperrouten zählen nicht als System. Start im Nebel: Bewegung 1. Gravitationsstrudel: +1.",
                  no: { kind: "no", text: "Das Schiff muss seine Bewegung im aktiven System beenden. Reicht der Bewegungswert nicht, bleibt es stehen.", ref: "LRR 58.4a, f" } },
                { q: "Fliegt es unterwegs durch ein System mit fremden Schiffen?", s: "Fremde Schiffe auf dem Weg?",
                  help: "Gemeint sind Systeme zwischen Start und Ziel, auch einzelne Jäger blockieren. Ins aktive System selbst darfst du immer.",
                  yes: { kind: "no", text: "Durch Systeme mit Schiffen anderer Spieler darf nichts hindurch, außer mit der Technologie Licht/Wellen-Deflektor. Gibt es einen anderen Weg, der reicht, nimm den.", ref: "LRR 58.4b, Karte Licht/Wellen-Deflektor" } },
                { q: "Liegt auf dem Weg oder als Ziel eine Supernova, ein Asteroidenfeld oder ein Nebel?", s: "Anomalie auf dem Weg?",
                  help: "Gravitationsstrudel sind erlaubt: Vor dem Verlassen würfeln, bei 1 bis 3 wird das Schiff entfernt.",
                  yes: { kind: "cond", text: "Supernova: nie (Ausnahme: Muaat-Technologie). Asteroidenfeld: nur mit Antimassen-Deflektoren. Nebel: nur, wenn er das aktive System ist, nie hindurch.", ref: "LRR 11.1, 59.1, 86.1" } }
              ],
              ok: { text: "Das Schiff darf ins aktive System fliegen.", ref: "LRR 58.4–58.6, 95, 37, 16",
                notes: ["Erst alle Schiffe ansagen, dann kommen sie gleichzeitig an.", "Mitnehmen darf es Jäger und Bodentruppen aus Start-, Durchflug- und aktivem System, nicht aus anderen Systemen mit eigenem Marker.", "Danach Flottenpool prüfen: Nicht-Jäger-Schiffe im System höchstens so viele wie Marker im Flottenpool.", "Und Kapazität prüfen, auch im Startsystem: Jäger und Bodentruppen im Weltraum ohne genug Kapazität werden entfernt. Ausnahmen: Raumwerft (3 Jäger frei), Jäger II (überzählige Jäger zählen je halb zum Flottenpool)."] } },

            LANDEN,

            { id: "produzieren", label: "Produ­zieren", name: "Produzieren", step: "Taktikaktion · Schritt 5", ref: "LRR 68",
              icon: "M5 5 H19 V19 H5 Z M12 8.5 V15.5 M8.5 12 H15.5",
              qs: [
                { q: "Ist das System das aktive System deiner Taktikaktion?", s: "Aktives System?",
                  help: "Produziert wird im letzten Schritt, auch ohne vorherige Bewegung oder Landung.",
                  no: { kind: "no", text: "Mit der Fähigkeit Produktion baust du nur im aktiven System. Andere Wege nennen ihre Regeln selbst, z. B. die Sekundärfähigkeit von Kriegsführung (Raumwerft im Heimat-System).", ref: "LRR 68, 67.4" } },
                { q: "Hast du dort eine Einheit mit Produktion, z. B. eine Raumwerft?", s: "Einheit mit Produktion?",
                  help: "Bei manchen Fraktionen haben auch Schiffe oder Mechs Produktion.",
                  no: { kind: "no", text: "Ohne eigene Einheit mit Produktion im aktiven System kannst du dort nichts bauen.", ref: "LRR 68" } },
                { q: "Stehen Schiffe anderer Spieler in diesem System?", s: "Fremde Schiffe im System?",
                  help: "Kann passieren, wenn du keine eigenen Schiffe hineinbewegt hast.",
                  yes: { kind: "cond", text: "Nur Bodentruppen. Schiffe darfst du in einem System mit fremden Schiffen nicht produzieren.", ref: "LRR 67.6, 14.1" } }
              ],
              ok: { text: "Du darfst produzieren.", ref: "LRR 68.1–68.3, 67.5",
                notes: ["Limit: Summe der Produktion im System. Raumwerft = Ressourcen des Planeten + 2, mit Raumwerft II + 4. Jeder Jäger und jede Infanterie zählt einzeln.", "Gebaut wird aus deinem Nachschub. Fehlt eine Einheit, darfst du eine gleiche aus einem System ohne deinen Kommandomarker zurücknehmen und musst sie sofort bauen. Jäger und Infanterie gehen nie aus.", "Bezahlen mit Ressourcen und Handelswaren. Schiffe kommen in den Weltraum, Bodentruppen auf den Planeten mit der Einheit, die produziert hat.", "Danach Flottenpool und Kapazität prüfen."] } }
          ]},
          { name: "Sonst im Zug", checks: [
            { id: "sekundaer", label: "Sekundär­fähigkeit", name: "Sekundärfähigkeit nutzen", step: "Nach der Strategieaktion eines anderen", ref: "LRR 82.1",
              icon: "M8 4 H18 V17 H8 Z M5 7 V20 H15",
              qs: [
                { q: "Hat gerade ein anderer Spieler die Primärfähigkeit seiner Strategiekarte genutzt?", s: "Strategieaktion eines anderen?",
                  help: "Gefragt wird reihum, ab links vom aktiven Spieler.",
                  no: { kind: "no", text: "Sekundärfähigkeiten gibt es nur direkt nach der Strategieaktion eines anderen Spielers. Von deiner eigenen Karte nutzt du nur die Primärfähigkeit.", ref: "LRR 82.1, 83.4" } },
                { q: "Ist es die Karte Führungsstärke?", s: "Führungsstärke?",
                  help: "Führungsstärke kostet nie einen Marker. Bei Handel kann dich der aktive Spieler vom Marker befreien.",
                  yes: { kind: "ok", text: "Kein Marker nötig: Gib Einfluss aus und erhalte für je 3 Einfluss 1 Kommandomarker.", ref: "Karte Führungsstärke",
                    notes: ["Auch erlaubt, wenn du schon gepasst hast.", "Keine Pflicht."] } },
                { q: "Ist es die Karte Handel, und hat der aktive Spieler dich ausgewählt?", s: "Von Handel ausgewählt?",
                  help: "Bei Handel wählt der aktive Spieler beliebig viele andere Spieler aus. Sie nutzen die Sekundärfähigkeit ohne Marker.",
                  yes: { kind: "must", text: "Kein Marker nötig: Du füllst deine Massenprodukte gratis auf, und zwar genau einmal. Ein zweites Mal mit Marker geht nicht.", ref: "LRR 92.4",
                    notes: ["Gilt auch, wenn du schon gepasst hast.", "Wer nicht ausgewählt wurde, darf die Sekundärfähigkeit normal mit 1 Marker nutzen."] } },
                { q: "Liegt ein Marker in deinem Strategiepool?", s: "Marker im Strategiepool?",
                  help: "Marker aus Taktik- oder Flottenpool gehen nicht.",
                  no: { kind: "no", text: "Ohne Marker im Strategiepool kannst du diese Sekundärfähigkeit nicht nutzen.", ref: "Kartentext" } }
              ],
              ok: { text: "Gib 1 Marker aus deinem Strategiepool aus und handle die Sekundärfähigkeit ab.", ref: "LRR 82.1, 3.3b",
                notes: ["Auch erlaubt, wenn du schon gepasst hast.", "Keine Pflicht.", "Weitere Kosten stehen auf der Karte, z. B. 4 Ressourcen bei Technologie."] } },

            { id: "passen", label: "Passen", name: "Passen", step: "Statt einer Aktion", ref: "LRR 3.4",
              icon: "M6 6 L14 12 L6 18 Z M18 6 V18",
              qs: [
                { q: "Hast du die Strategieaktion deiner Strategiekarte schon gemacht?", s: "Strategieaktion gemacht?",
                  help: "Erkennbar an der erschöpften Karte. Bei 3 oder 4 Spielern gilt das für beide Karten.",
                  no: { kind: "no", text: "Passen darfst du erst, wenn du die Strategieaktion deiner Karte gemacht hast, bei 3 oder 4 Spielern mit beiden Karten.", ref: "LRR 3.4" } }
              ],
              ok: { text: "Du darfst passen. Danach hast du in dieser Aktionsphase keine Züge und keine Aktionen mehr.", ref: "LRR 3.3, 94.1",
                notes: ["In dem Zug, in dem du passt, darfst du noch handeln.", "Im Zug anderer darfst du weiter mit dem aktiven Spieler handeln, wenn ihr Nachbarn seid.", "Sekundärfähigkeiten anderer und Aktionskarten ohne „Aktion“ darfst du weiter nutzen.", "Passen schützt nicht vor Angriffen."] } },

            { id: "handeln", label: "Handeln", name: "Handeln", step: "Transaktion", ref: "LRR 94",
              icon: "M4 8 H18 M15 5 L18 8 L15 11 M20 16 H6 M9 13 L6 16 L9 19",
              qs: [
                { q: "Läuft gerade die Agendaphase?", s: "Agendaphase?",
                  help: "In der Strategie- und der Statusphase gibt es keine Transaktionen.",
                  yes: { kind: "ok", text: "Während jeder Agenda darf jedes Spielerpaar 1 Transaktion machen, auch ohne Nachbarn zu sein.", ref: "LRR 94.6" } },
                { q: "Ist gerade Aktionsphase, und ist einer von euch beiden der aktive Spieler?", s: "Einer von euch aktiv?",
                  help: "Aktiver Spieler ist, wer in der Aktionsphase am Zug ist. Wer in der Strategiephase eine Karte wählt, zählt nicht.",
                  no: { kind: "no", text: "Außerhalb der Agendaphase gibt es Transaktionen nur im Zug des aktiven Spielers, und zwar mit seinen Nachbarn.", ref: "LRR 4, 94.1" } },
                { q: "Seid ihr Nachbarn?", s: "Nachbarn?",
                  help: "Einheiten oder Planeten im selben oder in angrenzenden Systemen, auch über Wurmlöcher.",
                  no: { kind: "no", text: "In der Aktionsphase dürfen nur Nachbarn handeln. Werdet ihr im Lauf des Zuges Nachbarn, geht es ab dann.", ref: "LRR 60, 94.1" } },
                { q: "Habt ihr in diesem Zug schon eine Transaktion gemacht?", s: "Schon gehandelt?",
                  help: "Gezählt wird pro Nachbar und Zug.",
                  yes: { kind: "no", text: "Pro Zug ist mit jedem Nachbarn nur 1 Transaktion erlaubt.", ref: "LRR 94.1" } }
              ],
              ok: { text: "Ihr dürft eine Transaktion machen.", ref: "LRR 94.1–94.4",
                notes: ["Tauschbar: Handelswaren, Massenprodukte, Reliktfragmente und je 1 Vertragskarte.", "Jederzeit im Zug, auch während eines Kampfes.", "Ungleiche Tausche und Geschenke sind erlaubt."] } },

            { id: "aktionskarte", label: "Aktions­karte", name: "Aktionskarte spielen", step: "Je nach Karte", ref: "LRR 2.6",
              icon: "M6 3 H18 V21 H6 Z M13 7 L10 12 H14 L11 17",
              qs: [
                { q: "Steht auf der Karte „Aktion“ als Zeitpunkt?", s: "„Aktion“-Karte?",
                  help: "Der fett gedruckte erste Absatz nennt den Zeitpunkt.",
                  no: { kind: "ok", text: "Spiel sie genau dann, wenn der genannte Zeitpunkt eintritt. Das geht auch im Zug anderer, nach dem Passen und in jeder Phase und kostet keine Aktion.", ref: "LRR 2.6, 2.6b",
                    notes: ["Gleichnamige Karten nicht im selben Zeitpunkt auf dieselben Einheiten oder denselben Effekt, z. B. nicht 2× „Schilde halten“ gegen dieselben Treffer. Gegen verschiedene Ziele geht es.", "Eine annullierte Karte zählt nicht als gespielt."] } },
                { q: "Bist du in der Aktionsphase am Zug und hast in diesem Zug noch keine Aktion gemacht?", s: "Dein Zug, Aktion noch frei?",
                  help: "Wer gepasst hat, hat keine Züge mehr.",
                  no: { kind: "no", text: "Eine „Aktion“-Karte ist deine Aktion für den Zug. Nicht im Zug anderer, nicht nach dem Passen, nicht zusätzlich zu einer anderen Aktion.", ref: "LRR 2.6a, 3.3" } },
                { q: "Kannst du ihren Effekt vollständig abhandeln?", s: "Vollständig abhandelbar?",
                  help: "Zum Beispiel: Es gibt ein gültiges Ziel.",
                  no: { kind: "no", text: "Eine Materialaktion darfst du nur nutzen, wenn du ihre Fähigkeit vollständig abhandeln kannst.", ref: "LRR 22.3" } }
              ],
              ok: { text: "Du darfst sie spielen. Sie ist deine Aktion für diesen Zug.", ref: "LRR 2.6a, 22.4",
                notes: ["Wird sie mit Sabotage verhindert, ist deine Aktion nicht verbraucht.", "Danach kommt die Karte auf den Ablagestapel."] } }
          ]}
        ]},

      { id: "raumkampf", name: "Raumkampf", where: "Taktikaktion · Schritt 3",
        stepsTitle: "Ablauf einer Kampfrunde", steps: ["Jäger­abwehr", "Rückzug ansagen", "Würfeln", "Treffer zu­weisen", "Rückzug"],
        groups: [
          { name: "Raumkampf", checks: [
            { id: "kampf", label: "Kampf?", name: "Kommt es zum Raumkampf?", step: "Nach dem Offensivfeuer der Weltraumkanone", ref: "LRR 78",
              icon: "M14.5 17.5 L3 6 V3 H6 L17.5 14.5 M13 19 L19 13 M16 16 L20 20 M19 21 L21 19 M14.5 6.5 L18 3 H21 V6 L17.5 9.5 M5 14 L9 18 M7 17 L4 20 M3 19 L5 21",
              at: [], hint: "Vor Runde 1: Erst klären, ob es überhaupt einen Raumkampf gibt.",
              qs: [
                { q: "Hat der aktive Spieler Schiffe im aktiven System, und hat dort auch ein anderer Spieler Schiffe?", s: "Beide Seiten mit Schiffen?",
                  help: "Gezählt wird nach dem Offensivfeuer der Weltraumkanone. Jäger sind Schiffe, PVS und Bodentruppen nicht.",
                  no: { kind: "skip", text: "Kein Raumkampf. Weiter mit Schritt 4, Einmarsch.", ref: "LRR 78.1" },
                  yes: { kind: "must", text: "Der Raumkampf ist Pflicht. Der aktive Spieler ist Angreifer, der andere Verteidiger. Gekämpft wird, bis nur noch eine Seite oder keine mehr Schiffe im System hat.", ref: "LRR 78, 89.3, 16.3c, 59.3",
                    notes: ["Zuerst Effekte „vor dem Kampf“, dann startet Runde 1. Wer gepasst hat, verteidigt sich ganz normal.", "Kapazität zählt im Kampf nicht: Wird ein Träger zerstört, kämpfen seine Jäger weiter. Erst am Kampfende werden Jäger und Bodentruppen über der Kapazität entfernt.", "Kampf in einem Nebel: Der Verteidiger erhält im ganzen Kampf +1 auf jeden Kampfwurf seiner Schiffe, nicht auf die Jägerabwehr."] } }
              ] },

            { id: "jaegerabwehr", label: "Jäger­abwehr", name: "Jägerabwehr", step: "Kampfrunde · Schritt 1", ref: "LRR 78.3",
              icon: "M21 12 A9 9 0 1 1 3 12 A9 9 0 1 1 21 12 Z M12 2 V7 M12 17 V22 M2 12 H7 M17 12 H22",
              at: [1], hint: "Schritt 1 gibt es nur in Runde 1. Ab Runde 2 geht es bei Schritt 2 los.",
              qs: [
                { q: "Ist es die erste Runde dieses Raumkampfs?", s: "Erste Kampfrunde?",
                  help: "Ab Runde 2 beginnt jede Runde direkt mit „Rückzug ansagen“.",
                  no: { kind: "no", text: "Jägerabwehr gibt es nur in der ersten Runde eines Raumkampfs.", ref: "LRR 78.3b" } },
                { q: "Hast du eine Einheit mit Jägerabwehr im aktiven System, z. B. einen Zerstörer?", s: "Einheit mit Jägerabwehr?",
                  help: "Steht als „Jägerabwehr X (×Y)“ auf dem Fraktionsbogen oder der Aufwertung.",
                  no: { kind: "no", text: "Ohne Einheit mit Jägerabwehr im aktiven System würfelst du in diesem Schritt nicht.", ref: "LRR 10.1" } }
              ],
              ok: { text: "Würfle für jede Einheit mit Jägerabwehr. Beide Seiten würfeln gleichzeitig.", ref: "LRR 10, 78.3",
                notes: ["Treffer zerstören nur Jäger, der Besitzer wählt welche. Überzählige Treffer verfallen.", "Effekte, die Kampfwürfe verändern oder neu würfeln lassen, wirken hier nicht.", "Hat danach eine Seite keine Schiffe mehr, endet der Kampf sofort."] } },

            { id: "rueckzug", label: "Rückzug", name: "Rückzug ansagen", step: "Kampfrunde · Schritt 2, ausgeführt in Schritt 5", ref: "LRR 78.4, 78.7",
              icon: "M9 14 L4 9 L9 4 M4 9 H15 A5 5 0 0 1 15 19 H11",
              at: [2, 5], hint: "Angesagt wird in Schritt 2, gezogen erst in Schritt 5.",
              qs: [
                { q: "Bist du Angreifer, und hat der Verteidiger in dieser Runde schon einen Rückzug angesagt?", s: "Verteidiger zieht schon zurück?",
                  help: "Der Verteidiger sagt zuerst an, dann der Angreifer.",
                  yes: { kind: "no", text: "Sagt der Verteidiger einen Rückzug an, darf der Angreifer in dieser Runde keinen ansagen.", ref: "LRR 78.4b" } },
                { q: "Grenzt ein System an, in dem du Einheiten oder einen eigenen Planeten hast?", s: "Eigenes Nachbarsystem?",
                  help: "Angrenzend zählt auch über Wurmlöcher.",
                  no: { kind: "no", text: "Ohne passendes Ziel kannst du keinen Rückzug ansagen.", ref: "LRR 78.4c, 78.7c" } },
                { q: "Stehen in diesem System Schiffe anderer Spieler?", s: "Fremde Schiffe im Ziel?",
                  help: "Hast du mehrere mögliche Systeme, prüfe das nächste.",
                  yes: { kind: "no", text: "Das Ziel darf keine fremden Schiffe enthalten. Gibt es kein anderes passendes System, ist kein Rückzug möglich.", ref: "LRR 78.7c" } },
                { q: "Ist das Ziel eine Supernova, ein Asteroidenfeld oder ein Nebel?", s: "Anomalie als Ziel?",
                  help: "Beim Rückzug gelten die normalen Regeln der Anomalien.",
                  yes: { kind: "cond", text: "Nebel: nie, denn er ist nicht das aktive System. Supernova: nie (Ausnahme: Muaat-Technologie). Asteroidenfeld: nur mit Antimassen-Deflektoren. Passt dieses Ziel nicht, prüfe ein anderes angrenzendes System. Gibt es keines, ist kein Rückzug möglich.", ref: "LRR 11.1, 59.1, 86.1" } }
              ],
              ok: { text: "Du darfst den Rückzug ansagen. Er findet am Ende der Runde statt und ist dann Pflicht.", ref: "LRR 78.4, 78.7, 41.2",
                notes: ["Vorher wird noch gewürfelt, und Treffer werden zugewiesen. Hat der Gegner danach keine Schiffe mehr, endet der Kampf ohne Rückzug.", "Alle Schiffe mit Bewegungswert ziehen gemeinsam in ein System. Jäger und Bodentruppen ohne Platz werden entfernt.", "Im Zielsystem einen Kommandomarker ablegen, falls dort noch keiner liegt: aus dem Nachschub, ist der leer, vom Kommandobogen.", "Ist das aktive System ein Gravitationsstrudel, würfelst du für jedes zurückziehende Schiff: Bei 1 bis 3 wird es samt Ladung entfernt."] } },

            { id: "schaden", label: "Schadens­resistenz", name: "Schadensresistenz", step: "Kampfrunde · Schritt 4, vor dem Zuweisen", ref: "LRR 87",
              icon: "M12 3 L19 6 V11 C19 15.5 16 19 12 21 C8 19 5 15.5 5 11 V6 Z",
              at: [4], hint: "Schadensresistenz nutzt du in Schritt 4, bevor Treffer zugewiesen werden.",
              qs: [
                { q: "Hat die Einheit Schadensresistenz, z. B. ein Schlachtschiff?", s: "Hat Schadensresistenz?",
                  help: "Bei Schiffen: Schlachtschiff, Kriegssonne und Flaggschiffe. Steht auf dem Fraktionsbogen oder der Aufwertung.",
                  no: { kind: "no", text: "Ohne Schadensresistenz kann die Einheit keinen Treffer aufheben.", ref: "LRR 87" } },
                { q: "Ist die Einheit schon beschädigt, liegt sie also auf der Seite?", s: "Schon beschädigt?",
                  help: "Repariert wird in der Statusphase oder durch Effekte.",
                  yes: { kind: "no", text: "Eine beschädigte Einheit nutzt Schadensresistenz erst nach der Reparatur wieder.", ref: "LRR 87.3" } },
                { q: "Kommt der Treffer aus einer Jägerabwehr, oder zerstört ein Effekt die Einheit direkt?", s: "Jägerabwehr oder direkt zerstört?",
                  help: "Jägerabwehr trifft nur Jäger. „Zerstören“ ohne Treffer ist kein Treffer.",
                  yes: { kind: "no", text: "Aufheben lassen sich nur Treffer, die diese Einheit treffen dürfen. Gegen direktes Zerstören hilft Schadensresistenz nicht.", ref: "LRR 87.4a, 87.5" } }
              ],
              ok: { text: "Hebe 1 Treffer auf und lege die Einheit auf die Seite. Sie ist jetzt beschädigt.", ref: "LRR 87.1–87.4",
                notes: ["Vor dem Zuweisen der Treffer nutzen.", "Beschädigte Einheiten kämpfen ganz normal weiter.", "Geht auch gegen Treffer der Weltraumkanone."] } }
          ]}
        ]},

      { id: "einmarsch", name: "Einmarsch", where: "Taktikaktion · Schritt 4",
        stepsTitle: "Ablauf des Einmarschs", steps: ["Bom­bar­dement", "Ent­senden", "Defen­siv­feuer", "Boden­kampf", "Kon­trolle"],
        groups: [
          { name: "Einmarsch", checks: [
            { id: "bombardement", label: "Bom­bar­dement", name: "Bombardement", step: "Einmarsch · Schritt 1", ref: "LRR 15, 49.1",
              icon: "M8 3 V9 M12 3 V11 M16 3 V9 M4 20 Q12 14 20 20",
              at: [1], hint: "Bombardiert wird in Schritt 1, bevor jemand landet.",
              qs: [
                { q: "Bist du der aktive Spieler?", s: "Aktiver Spieler?",
                  help: "Schiffe anderer Spieler im aktiven System bombardieren nicht, auch wenn sie den Raumkampf überstanden haben.",
                  no: { kind: "no", text: "Nur der aktive Spieler darf im Einmarsch bombardieren.", ref: "LRR 49.1, 89.4" } },
                { q: "Hast du im aktiven System eine Einheit mit Bombardement, z. B. ein Schlachtschiff?", s: "Einheit mit Bombardement?",
                  help: "Steht als „Bombardement X (×Y)“ auf dem Fraktionsbogen oder der Aufwertung.",
                  no: { kind: "no", text: "Ohne Einheit mit Bombardement im aktiven System kannst du nicht bombardieren.", ref: "LRR 15.1" } },
                { q: "Steht auf dem Zielplaneten eine Einheit mit Planetarem Schild, z. B. ein PVS?", s: "Planetarer Schild auf dem Ziel?",
                  help: "Der Schild schützt nur vor Bombardement, nicht vor einer Landung.",
                  yes: { kind: "cond", text: "Nur wenn du eine Kriegssonne im System hast. Dann wirkt der Schild nicht, und jede deiner Einheiten mit Bombardement darf den Planeten beschießen.", ref: "LRR 15.1f, 65.3" } }
              ],
              ok: { text: "Sag für jede Einheit mit Bombardement einen Planeten an, dann würfeln.", ref: "LRR 15",
                notes: ["Mehrere Planeten im System sind erlaubt, aber vor dem Würfeln ansagen.", "Der Besitzer des Planeten zerstört pro Treffer einen eigenen Bodentrupp dort. Mechs mit Schadensresistenz dürfen Treffer aufheben.", "Effekte, die Kampfwürfe verändern oder neu würfeln lassen, wirken nicht.", "Bombardement ist freiwillig und geht auch, wenn du danach nicht landest."] } },

            LANDEN,

            { id: "defensivfeuer", label: "Defen­siv­feuer", name: "Defensivfeuer der Weltraumkanone", step: "Einmarsch · Schritt 3", ref: "LRR 77.6",
              icon: "M4 20 Q12 14 20 20 M12 15 V4 M8 8 L12 4 L16 8",
              at: [3], hint: "Nach dem Entsenden schießen Weltraumkanonen auf dem Zielplaneten.",
              qs: [
                { q: "Bist du der aktive Spieler?", s: "Aktiver Spieler?",
                  help: "Beim Defensivfeuer schießen nur die anderen Spieler.",
                  yes: { kind: "no", text: "Der aktive Spieler schießt beim Defensivfeuer nicht, er wird beschossen.", ref: "LRR 77.6" } },
                { q: "Sind Bodentruppen auf einem Planeten gelandet, auf dem deine Einheit mit Weltraumkanone steht?", s: "Landung auf deinem Planeten?",
                  help: "Zum Beispiel ein PVS. Planeten ohne Landung zählen nicht.",
                  no: { kind: "no", text: "Geschossen wird nur auf dem Planeten, auf dem gelandet wurde, und nur von Einheiten dort. Tiefraumkanone aus Nachbarsystemen wirkt hier nicht.", ref: "LRR 77.6, 77.7d" } }
              ],
              ok: { text: "Du darfst für jede deiner Einheiten mit Weltraumkanone auf diesem Planeten würfeln.", ref: "LRR 77.6–77.8",
                notes: ["Der aktive Spieler zerstört pro Treffer einen seiner Bodentruppen auf diesem Planeten.", "Effekte, die Kampfwürfe verändern oder neu würfeln lassen, wirken nicht.", "Mechs mit Schadensresistenz dürfen Treffer aufheben.", "Bei mehreren Planeten bestimmt der aktive Spieler die Reihenfolge."] } },

            { id: "bodenkampf", label: "Boden­kampf", name: "Kommt es zum Bodenkampf?", step: "Einmarsch · Schritt 4", ref: "LRR 42, 49.4",
              icon: "M4 20 Q12 14 20 20 M8 13 L16 5 M16 13 L8 5",
              at: [4], hint: "Bodenkampf läuft in Runden, bis eine Seite keine Bodentruppen mehr hat.",
              qs: [
                { q: "Hat der aktive Spieler Bodentruppen auf einem Planeten, auf dem auch Bodentruppen eines anderen Spielers stehen?", s: "Beide Seiten mit Bodentruppen?",
                  help: "Gezählt wird nach Bombardement und Defensivfeuer. PVS und Raumwerften sind keine Bodentruppen.",
                  no: { kind: "skip", text: "Kein Bodenkampf auf diesem Planeten. Weiter mit Kontrolle übernehmen.", ref: "LRR 49.4" },
                  yes: { kind: "must", text: "Der Bodenkampf auf diesem Planeten ist Pflicht. Gekämpft wird, bis nur noch eine Seite oder keine mehr Bodentruppen hat.", ref: "LRR 42, 49.4",
                    notes: ["Jede Runde: 1 Würfel pro Bodentrupp, dann zerstört jeder pro gegnerischem Treffer einen eigenen Bodentrupp seiner Wahl.", "Mechs mit Schadensresistenz dürfen Treffer aufheben.", "Einen Rückzug gibt es im Bodenkampf nicht.", "Bei mehreren Planeten bestimmt der aktive Spieler die Reihenfolge."] } }
              ] },

            { id: "erobern", label: "Erobern", name: "Planet erobern", step: "Einmarsch · Schritt 5", ref: "LRR 49.5",
              icon: "M6 21 V4 M6 4 H17 L14 8 L17 12 H6",
              at: [5], hint: "Am Ende des Einmarschs wird geklärt, wem der Planet gehört.",
              qs: [
                { q: "Hast du in diesem Einmarsch Bodentruppen auf den Planeten entsendet?", s: "Dort entsendet?",
                  help: "Nur Planeten, auf die du in Schritt 2 entsendet hast, kannst du jetzt übernehmen.",
                  no: { kind: "no", text: "Kontrolle übernimmst du nur über Planeten, auf die du in diesem Einmarsch Bodentruppen entsendet hast.", ref: "LRR 49.5" } },
                { q: "Kontrollierst du den Planeten schon?", s: "Schon deiner?",
                  help: "Zum Beispiel, wenn du Bodentruppen zur Verstärkung auf einen eigenen Planeten gebracht hast.",
                  yes: { kind: "skip", text: "Du kontrollierst ihn schon, also ändert sich nichts: Die Planetenkarte bleibt, wie sie ist, und erkundet wird nicht.", ref: "LRR 49.5c, 25.2" } },
                { q: "Steht dort noch mindestens ein eigener Bodentrupp?", s: "Noch eigene Bodentruppen?",
                  help: "Gezählt wird nach Defensivfeuer und Bodenkampf.",
                  no: { kind: "no", text: "Der Planet bleibt beim bisherigen Besitzer. Sind nach einem Bodenkampf beide Seiten ausgelöscht, behält der Verteidiger ihn und legt einen eigenen Kontrollmarker darauf.", ref: "LRR 49.5, 49.5d" } }
              ],
              ok: { text: "Du übernimmst die Kontrolle. Nimm die Planetenkarte erschöpft.", ref: "LRR 49.5, 35.1",
                notes: ["Gebäude anderer Spieler auf dem Planeten werden sofort zerstört.", "Hat vorher niemand den Planeten kontrolliert, wird er erkundet."] } }
          ]}
        ]}
    ]
  };
})();
