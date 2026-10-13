# Asset- und Fassungsreview

Stand: 13. Oktober 2026. Zielausgabe: **Twilight Imperium: Vierte Edition + Prophezeiung der Könige**, deutsch. Die Codices sind zusätzliches, ausdrücklich gekennzeichnetes Material. Thunder’s Edge ist nicht Teil dieses Abgleichs.

## Was „Original“ und „1:1“ hier bedeuten

Ein Bildausschnitt aus einem verlinkten Asmodee-PDF ist eine Originalabbildung genau dieses Dokuments und dieser Fassung. Ein deutscher Codex-II-Fraktionsreferenzbogen ist eine offizielle Kurzreferenz; er ist kein Scan des großen Fraktionsbogens aus der Box. Ein Codex-Ω-Kartenbild zeigt die Ersatzfassung und muss als solche kenntlich bleiben.

Die Daten in `src/data/` sind eigene Zusammenfassungen. Selbst wenn Wirkung, Zahlen und Zeitpunkt geprüft wurden, sind diese Texte keine wörtlichen Abschriften. Selbst erzeugte Referenzbilder aus diesen Daten sind entsprechend **eigene deutsche Referenzen**, keine Originalkarten und kein Nachweis einer identischen gedruckten Karte.

Dieser Review bestätigt keine vollständige Übereinstimmung aller Texte, Kartenvorderseiten, Rückseiten, Symbole, Auflagen und Boxkomponenten. Dafür fehlt ein vollständiger Satz belegbarer deutscher Boxscans. Insbesondere bleiben nicht belegte Originalgrafiken von Aktionskarten, Agenden, Aufträgen, Erkundungen und Fraktionsbögen offen. Eine Referenzgrafik schließt diese Lücke funktional, aber nicht als Originalnachweis.

## Quellen

Die offiziellen Produktseiten sind die Einstiegspunkte für die deutschen Downloads: [Grundspiel](https://www.asmodee.de/produkte/twilight-imperium-4-edition), [Prophezeiung der Könige](https://www.asmodee.de/produkte/twilight-imperium-4-edition-prophezeiung-der-koenige). Die folgende Seitennummer ist die sichtbare PDF-Seite, beginnend bei 1.

| Quelle | Geprüfter Inhalt | Einordnung |
| --- | --- | --- |
| [PoK-Regelheft DE](https://asmodee-resources.azureedge.net/media/germanyprod/Produkte/Twillight%20Imperium/Twilight%20Imperium%3A%20Prophezeiung%20der%20K%C3%B6nige/Twilight%20Imperium%20Prophezeiung%20der%20K%C3%B6nige%20Spielregeln.pdf), S. 6–8 | Integration der Erweiterung; neue Komponenten; Ersatz der Strategie Diplomatie/Infrastruktur | Box-Erweiterung |
| [Erratierte Komponenten DE, 05.01.2021](https://asmodee-resources.azureedge.net/media/germanyprod/Produkte/Twillight%20Imperium/Twilight%20Imperium%3A%20Prophezeiung%20der%20K%C3%B6nige/TI4%20%E2%80%93%20Erratierte%20Komponenten%20%E2%80%93%2020210105%20%E2%80%93%20v1.pdf), S. 1 | E-Res-Extraktor; Hegemoniale Handelsstrategie; Il Na Viroset | Errata; keine optionale Balancevariante |
| [Codex I Regeln DE](https://asmodee-resources.azureedge.net/media/germanyprod/Produkte/Twillight%20Imperium/Downloads/Twilight%20Codex%201%20Regeln.pdf), S. 8–9 | Ω-Technologien und fünf überarbeitete Vertragskarten | Optionales Ersatzmaterial |
| [Codex I Karten DE v2](https://asmodee-resources.azureedge.net/media/germanyprod/Regeln/twilight-imperium-4-edition-4015566026131-codex-cards-v2.pdf), S. 1 und 3 | Titel, Zeitpunkte und Wirkungen der neuen Aktionskarten | Zusatzkarten; 20 Exemplare, 17 verschiedene Titel |
| [Codex II Karten DE](https://asmodee-resources.azureedge.net/media/germanyprod/Anderer%20Bonuscontent/twilight-imperium-4-edition-4015566026131-twilight-codex-2-kartenset.pdf), S. 7, 9, 11, 13 | Namen aller 24 Fraktionen aus Grundspiel und PoK | Offizielle Kurzreferenzen |
| [Codex III Regeln DE](https://asmodee-resources.azureedge.net/media/germanyprod/Regeln/twilight-imperium-4-edition-4015566026131-twilight-codex-3-regeln.pdf), S. 11–12, 14–18 | Yin-/Naalu-Ω, Keleres-Karten und -Fraktionsbogen | Codex III; Keleres sind die zusätzliche 25. Fraktion |
| [FFG Codex 4.5 Technologie-Updates EN](https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/08/codex_45_technology_card_updates.pdf), S. 2 und 4 | Zweite Ω-Fassungen von Magen-Abwehrschirm und X-89 | Englischer Originaldownload; deutscher Text in der App ist eine Zusammenfassung |
| [KeeganW/factionData](https://github.com/KeeganW/ti4/blob/master/src/data/factionData.js) | Frühere und Ω-Vertragsfassungen stehen im selben Beschreibungsfeld nacheinander | Fan-Datensatz; Grundlage der restaurierten frühen Zusammenfassungen, kein vollständiger Boxscan |

## Korrigierte Befunde

| Bereich | Bisheriges Problem | Korrektur / Beleg |
| --- | --- | --- |
| Vertragskarten Arborec, L1Z1X, Letnev, Winnu, Yin | Die Ω-Wirkung stand im Haupttext, obwohl der Datenkommentar die Boxfassung versprach. | Frühere Wirkung wieder im Haupttext; Ω-Wirkung im Feld `codex`. Die Ω-Zuordnung ist in Codex I DE S. 9 bestätigt. Frühe Wirkungen wurden mit dem bereits im Projekt verwendeten KeeganW-Datensatz abgeglichen; ohne Boxscans bleibt dessen Belegstufe ausdrücklich begrenzt. |
| Keleres: Über dem Gesetz | Beliebiger Spielerzug; Zahlung mit Handelsware oder Massenprodukt. | Codex III DE S. 16 verlangt den Beginn des eigenen Zuges und 1 Einfluss. Der abweichende Ausgangstext wird keiner späteren Ausgabe ohne Quelle zugeschrieben. |
| Keleres: Agenten-Versorgungsnetz | Erfundenes Limit „einmal pro Aktion“. | Die Zusatzproduktion ist je Verwendung einer eigenen Produktion-Fähigkeit erlaubt; sie löst sich selbst nicht erneut aus. Codex III DE S. 14. |
| Keleres: Odlynn Myrr | Enthaltungen wurden als Belohnungsauslöser eingeschlossen. | Nur Spieler, die für eine andere Alternative stimmen, werden gezählt. Codex III DE S. 15. |
| Keleres: Kuuasi Aun Jalatai | „Bis zu 2“ Schiffe statt gedruckter Gesamtzahl. | Zusammenfassung nennt Flaggschiff und insgesamt 2 Kreuzer/Zerstörer. Codex III DE S. 15. |
| Yin: Bruder Milor Ω | Wirkung auf Zerstörungen im Kampf beschränkt. | Der gedruckte Auslöser ist die Zerstörung einer Einheit; die Beschränkung entfällt. Codex III DE S. 11. |
| Yin: Dannel Ω | Nur Bodenkämpfe statt vollständiger Einmärsche genannt. | Einmärsche, Schutz vor Weltraumkanone und anschließendes Vernichten vollständig genannt. Codex III DE S. 11. |
| Yin-Zentrifuge Ω | Formulierung erlaubte vermeintlich eine Verteilung auf mehrere Planeten oder Weltraumbereiche. | Bis zu 2 Infanterie gehen an 1 gewählten Ort. Codex I DE S. 8. |
| Gegenschlag / Phantom-Einheit | „Anderer Spieler“ statt „ein Spieler“ verengte den Auslöser. | Auslöser entspricht Codex-I-Karten DE S. 1. |
| Hegemoniale Handelsstrategie | Dauer der Wertvertauschung verkürzt dargestellt. | Dauer bis zum Ende des Zuges ergänzt, wie im offiziellen DE-Errata-PDF S. 1. |
| Magen / X-89 ΩΩ | Quelle pauschal „Codex IV“ genannt. | Separaten Download „Codex 4.5“, englische Sprache und Fassungsstufe ausdrücklich genannt. Bei Magen Ω ist der Treffer optional; ΩΩ nennt ihn ohne „darfst“. |
| Deutsche Namen | Offizielle Namen waren teils nicht eingetragen. | Alle 25 Fraktionsnamen, alle 17 Codex-I-Aktionskartentitel sowie belegte Yin-/Keleres- und Vertragsnamen ergänzt; Quellen oben. Englische Originalnamen bleiben Suchbegriffe. |

## Technische Prüfung und Grenzen

Geprüft wurden die JavaScript-Syntax aller drei geänderten Datendateien sowie die geladenen Mengen: 17 Grundspiel-Fraktionen, 7 PoK-Fraktionen und Keleres; 80 + 20 Aktionskartenexemplare; 20 Codex-I-Aktionskartenexemplare; 50 Grundspiel- und 13 PoK-Agenden, davon 13 beim PoK-Aufbau zu entfernen; 74 Erkundungskartenexemplare; 10 PoK-Relikte. Diese Mengenprüfung bestätigt keine einzelne Kartenwirkung.

Alle Fraktionen und alle neuen Codex-I-Aktionskarten besitzen nun einen anhand deutscher Originaldokumente belegten `de`-Titel. Weitere Übersetzungen in der Website müssen ihre Herkunft gesondert kenntlich machen; eine eigene deutsche Bezeichnung wird dadurch nicht zum gedruckten Originalnamen.

Bei Assets müssen vor Freigabe zusätzlich Identität, Sprache, Fassung, Vorder-/Rückseite, Zuschnitt und Lesbarkeit am Bild geprüft werden. Dateiname oder erfolgreiches Laden reichen dafür nicht aus. Das Assetmanifest muss Herkunft und Fassung halten; die Quellenlinks erlauben einen erneuten Abgleich. Pixelgenauigkeit eines Zuschnitts ist getrennt von der inhaltlichen Richtigkeit der App-Zusammenfassung zu beurteilen.

## Abschließender Integrationsreview

Eingebaut sind **110 deutsche Originalabbildungen** und **550 unterschiedliche SVG-Referenzhilfen**. Die 575 Referenz-Lookups enthalten zusätzlich 25 Aliase für die Fraktionsübersicht. 24 Originalporträts stammen aus den originalen Codex-II-Kurzreferenzen. Die Originale sind Ausschnitte offizieller PDFs, als WebP exportiert; eine pixelidentische Datei oder ein vollständiger Scan jeder Boxkomponente wird nicht behauptet.

Der unabhängige Sichtreview aller Originalgruppen hat anfänglich falsche Keleres-/Ω-Anführerzuordnungen, eine leere Karte, vertauschte Allianzreferenzen und fünf kopfstehende Technologien gefunden. Diese Befunde sind korrigiert. Der erneute Review bestätigt die Header aller sieben Ω-Anführer/Mechs, der Keleres-Vertragskarte und drei Helden, die fünf Technologie-Rotationen, 24 Allianzreferenzen, Keleres-Vorder-/Rückseite sowie die Errata- und Auftragskarten. JR-XS455-O ist korrekt als Agent eingeordnet. Die Basis-Modernisierung gehört zu Keleres-Technologieindex 0, das Agenten-Versorgungsnetz zu Index 1. Codex-III-Allianzen sind als Referenzkarten bezeichnet.

Originale mit optionaler Ω-Fassung werden neben der Box-Zusammenfassung gesondert geöffnet und ersetzen deren Bild nicht. Die drei deutschen Auftragsersatzkarten erscheinen bei ihrem bestehenden Auftrag und werden nicht zusätzlich in den Stapel gezählt. Die Keleres als zusätzliche Codex-III-Fraktion bleiben ausdrücklich optional.

Verifikation am 13.10.2026:

- `python3 build.py`, `python3 build.py --artifact`, JavaScript-Syntax und `git diff --check`: bestanden.
- `node scripts/check_assets.mjs`: vollständige Referenzabdeckung aller 550 Komponenten, deutsche Anzeigenamen, dauerhafte Referenzkennzeichnung, 110 Original-Prüfsummen, eindeutige gültige Zielschlüssel, Ω-Trennung und 702 existierende Offline-URLs bestätigt.
- Referenzgenerator ist reproduzierbar; SVG/XML und Textgrenzen geprüft. Agenda, Yin-Bogen und der längste Keleres-Heldenblock zusätzlich gerendert und visuell geprüft.
- Browserprüfung bei 390 × 844 und 1280 × 900: Filter, Auswahl der Materialart, Vorder-/Rückseite, Dialog, Detailzoom und deutsche Anzeigen geprüft; kein horizontaler Überlauf der Seite, keine JavaScript-Fehler während der Onlineprüfung.
- Tatsächlicher Offline-Test: eigener lokaler HTTP-Server beendet, Seite neu geladen und zu einer anderen Technologie navigiert. Keleres-Originalbogen und Gravitationsantrieb-Referenzbild anschließend im Dialog vollständig geladen (Bildbreiten 2250 bzw. 680). Original-PDF-Links bleiben externe Downloads.

Die statische Website liegt in `site/`; der Ein-Datei-Export in `dist/artifact.html`. Dieser Prüfschritt dokumentiert die lokale Verifikation vor der Veröffentlichung. Die deutsche Fassung dieses ersten Prüfschritts umfasste rund 11 MB; mit den anschließend ergänzten englischen Originalbögen umfasst die Website rund 34 MB.

## Ergänzung: Englisch für fehlende deutsche Bögen

Auf ausdrücklichen Nutzerwunsch vom 13.10.2026 werden fehlende deutsche Fraktionsbögen durch englische Originalabbildungen ersetzt. Die deutsche Oberfläche, Karten, Kurzreferenzen und Textfassungen bleiben erhalten. Ergänzt wurden **48 englische Bilder für alle 24 Grundspiel-/PoK-Fraktionen**, jeweils Vorder- und Rückseite. Keleres bleibt deutsch. Beim Xxcha-Vorderbogen wird die deutsche Regelheftabbildung bevorzugt; der englische Originalbogen steht zusätzlich in höherer Auflösung bereit. Bei englischen Bögen öffnet sich die deutsche Textfassung automatisch. Eigene deutsche Referenzgrafiken bleiben zusätzlich verfügbar.

Die Quelle ist [TI4 Ultimate](https://ti4ultimate.com/game/factions), ein Community-Spiegel der Spielabbildungen. Zuordnung anhand der getrennten Grundspiel-/PoK-Datensätze von [AsyncTI4, Commit e06e41074e1bcc1e636331f40a55fa1643802852](https://github.com/AsyncTI4/TI4_map_generator_bot/tree/e06e41074e1bcc1e636331f40a55fa1643802852/src/main/resources/data/factions). Die unter diesem Commit abgerufenen Metadaten waren byteidentisch zu den zur Auswahl verwendeten Daten. Aliaszuordnung: `ghost → creuss`, `cabal → vuilraith`, `naaz → naazrokha`; alle übrigen IDs stimmen mit dem Repository überein.

Zwei unabhängige Sichtprüfungen aller 48 Bilder bestätigten Header, Fraktion, Symbol, Vorder-/Rückseite und klassisches TI4-/PoK-Layout ohne Thunder’s-Edge-Durchbruchsbereich. Keine fehlenden, doppelten oder erkennbar fremden Fraktionsbögen. 46 Bilder haben 2048 × 1380 Pixel; Jol-Nar-Rückseite und Winnu-Vorderseite haben quellseitig 1291 × 878 Pixel. Alle Bilder wurden **byteidentisch** übernommen, weder übersetzt noch hochgerechnet. Die genaue Druckauflage und vollständige Scankette bleiben unbekannt; die Herkunft wird als Community-Spiegel bezeichnet, nicht als offizieller Verlagsdownload.

Beim Abgleich der Nekro-Rückseite wurden Valefar-Assimilator X/Y zusätzlich in die Starttechnologieliste der deutschen Textfassung übernommen; sie waren vorher nur bei den Fraktionstechnologien geführt. Die SVG-Referenzhilfe wurde neu erzeugt.

Das getrennte Manifest `src/assets/english-sheets/manifest.json` enthält Sprache, direkte Bildquelle, Zuordnung, Commit und Bildprüfsumme. Der Runtime-Katalog umfasst nun **110 deutsche und 48 englische Originalabbildungen**. Die Sprachpräferenz wird unabhängig von der Reihenfolge der Assets angewendet. `scripts/check_assets.mjs` prüft vollständige Originalbogenabdeckung aller 25 Fraktionen, die deutsche Priorität für Keleres/Xxcha, gültige Quellen und Prüfsummen sowie 751 Offline-URLs.

Abschließende lokale Browserprüfung: englische Arborec-Vorder-/Rückseite, automatisch offene deutsche Textfassung, deutsche Xxcha-/Keleres-Priorität und Sprachfilter geprüft. Materialart „Fraktionsbogen“ + Englisch zeigt 48, Deutsch zeigt 3 Originalabbildungen. Bei 390 × 844 kein horizontaler Überlauf und keine JavaScript-Fehler. Anschließend lokaler HTTP-Server beendet, App neu geladen und bislang nicht geöffneter Silberschwingen-Originalbogen offline vergrößert: vollständig geladen, 2048 Pixel Bildbreite. Vorschau unter `docs/asset-preview-english.png`. Website und Ein-Datei-Export gebaut, Integrationscheck und Diffcheck bestanden. Die Veröffentlichung wird gesondert über den bestehenden GitHub-Pages-Workflow geprüft.
