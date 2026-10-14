/* Themen fürs Nachschlagen. Blocktypen:
   {h}, {p}, {ul}, {steps}, {check, items:[{t,s}]}, {note, kind:"warn"|"tip"},
   {table:{head,rows,num}}, {kv:[[wert,text]]}, {sc:[...]}, {qa:[{q,a}]}, {cards:[{title, blocks}]}, {rules:[ids]},
   {darf: Set-ID aus data/darfich.js} */
window.TI4 = window.TI4 || {};
TI4.topics = [
{ id: "kampf", name: "Kampf", icon: "kampf",
  desc: "Raumkampf, Rückzug, Einmarsch und Bodenkampf in der richtigen Reihenfolge.",
  blocks: [
    { h: "Raumkampf" },
    { darf: "raumkampf" },
    { check: "raumkampf", items: [
      { t: "„Vor dem Kampf“ und „zu Beginn des Kampfes“", s: "Passende Aktionskarten, Agenten und Fähigkeiten. In Runde 1 ist „Beginn des Kampfes“ dasselbe Fenster wie „Beginn der Kampfrunde“." },
      { t: "1 · Jägerabwehr (nur Runde 1)", s: "Beide gleichzeitig, Treffer nur gegen Jäger. Hat danach eine Seite keine Schiffe mehr, endet der Kampf." },
      { t: "2 · Rückzug ankündigen", s: "Zuerst der Verteidiger. Kündigt er an, darf der Angreifer in dieser Runde nicht. Nur mit zulässigem Rückzugssystem." },
      { t: "3 · Kampfwürfe ausführen", s: "1 Würfel pro Schiff, Explosionssymbole geben mehr. Der Angreifer würfelt komplett zuerst. Wiederholungswürfe sofort nach dem jeweiligen Wurf." },
      { t: "4 · Treffer zuweisen", s: "Vorher Schadensresistenz nutzen (Einheit kippen). Dann zerstört jeder pro gegnerischem Treffer ein eigenes Schiff." },
      { t: "5 · Zurückziehen", s: "Wer angekündigt hat, muss jetzt. Hat der Gegner keine Schiffe mehr, endet der Kampf ohne Rückzug." },
      { t: "Weiter oder Ende?", s: "Haben beide noch Schiffe: neue Runde ab Schritt 2. Sonst Kampfende, dann Kapazität prüfen und überzählige Jäger und Bodentruppen entfernen." }
    ]},
    { note: "**Rückzug:** Alle Schiffe mit Bewegungswert ziehen in ein einziges angrenzendes System mit eigenen Einheiten oder eigenem Planeten und ohne fremde Schiffe. Dort einen Kommandomarker aus dem Nachschub ablegen, falls noch keiner liegt. Nicht in Nebel, Supernova oder Asteroidenfeld (ohne passende Technologie).", kind: "tip" },
    { h: "Einmarsch" },
    { darf: "einmarsch" },
    { check: "einmarsch", items: [
      { t: "1 · Bombardement", s: "Für jede Einheit einen Planeten ansagen, dann würfeln. Der Besitzer zerstört eigene Bodentruppen. Planetarer Schild verhindert das, außer bei Kriegssonnen." },
      { t: "2 · Bodentruppen entsenden", s: "Beliebig viele aus dem Weltraum auf Planeten im System. Mecatol Rex mit Hütermarker: vorher 6 Einfluss zahlen, +1 Siegpunkt." },
      { t: "3 · Defensivfeuer der Weltraumkanone", s: "Weltraumkanonen auf dem Zielplanet schießen auf die gelandeten Truppen. Keine Reichweite aus Nachbarsystemen." },
      { t: "4 · Bodenkampf", s: "Auf jedem umkämpften Planeten, Reihenfolge wählt der aktive Spieler." },
      { t: "5 · Kontrolle übernehmen", s: "Planeten mit eigenen Bodentruppen gehören dir. Karte erschöpft nehmen, fremde Gebäude dort zerstören. Gehörte der Planet vorher keinem anderen Spieler: erkunden." }
    ]},
    { cards: [
      { title: "Bodenkampf", blocks: [
        { steps: ["„Zu Beginn“-Effekte", "Beide würfeln: 1 Würfel pro Bodentrupp", "Treffer zuweisen, Mechs dürfen Schadensresistenz nutzen", "Wiederholen, bis eine oder keine Seite übrig ist"] },
        { note: "**Kein Rückzug** im Bodenkampf. Bleibt niemand übrig, behält der Verteidiger den Planeten.", kind: "warn" }
      ]},
      { title: "Was verhindert was?", blocks: [
        { ul: [
          "**Planetarer Schild** verhindert Bombardement, nicht gegen Kriegssonnen.",
          "**Fremde Schiffe** (auch nur Jäger) verhindern Durchflug.",
          "**Eigener Kommandomarker** in einem anderen System: Schiffe dort dürfen nicht losfliegen.",
          "**Blockade** verhindert Schiffsproduktion, Bodentruppen gehen.",
          "**Flottenpool** begrenzt Nicht-Jäger-Schiffe pro System.",
          "**Schadensresistenz** hilft nicht gegen Effekte, die direkt zerstören, und Nicht-Jägern nicht gegen Jägerabwehr.",
          "**Kampfwurf-Effekte** wirken nicht auf Jägerabwehr, Bombardement und Weltraumkanone."
        ]}
      ]}
    ]},
    { note: "Pro Kampf darf jeder höchstens 1 Auftrag werten, in einer Taktikaktion also einen im Raumkampf und einen im Bodenkampf.", kind: "tip" },
    { rules: ["raumkampf", "einmarsch", "bodenkampf", "weltraumkanone", "jaegerabwehr", "schadensresistenz", "bombardement"] }
  ]},

{ id: "takt", name: "Taktikaktion", icon: "takt",
  desc: "Aktivieren, bewegen, transportieren, Anomalien und Produktion.",
  blocks: [
    { check: "taktik", items: [
      { t: "1 · Aktivierung", s: "Marker aus dem Taktikpool in ein System ohne eigenen Marker. Fremde Marker stören nicht. Danach „nachdem ein System aktiviert wurde“-Effekte." },
      { t: "2a · Schiffe bewegen", s: "Erst ansagen, welche Schiffe fliegen. Alle kommen gleichzeitig an." },
      { t: "2b · Offensivfeuer der Weltraumkanone", s: "Ab aktivem Spieler im Uhrzeigersinn. Andere zielen auf den aktiven Spieler. Tiefraumkanone auch aus Nachbarsystemen." },
      { t: "3 · Raumkampf", s: "Nur wenn zwei Spieler Schiffe im System haben." },
      { t: "4 · Einmarsch", s: "Bombardement, Bodentruppen entsenden, Defensivfeuer, Bodenkampf, Kontrolle übernehmen." },
      { t: "5 · Produktion", s: "Auch ohne vorherige Bewegung oder Landung." },
      { t: "Ende der Taktikaktion", s: "Effekte „am Ende der Taktikaktion“. Mit Nullpunktenergie-Reaktor: Wilder-Raum-Marker im System erkunden, wenn du dort Schiffe hast." }
    ]},
    { cards: [
      { title: "Bewegung", blocks: [{ ul: [
        "Start nur aus Systemen **ohne** eigenen Kommandomarker. Ausnahme ist das aktive System: Schiffe dort bleiben oder fliegen hinaus und wieder hinein.",
        "**Durch** eigene markierte Systeme fliegen ist erlaubt.",
        "Nicht durch Systeme mit fremden Schiffen, auch nur Jäger blockieren.",
        "Bewegungswert = Anzahl betretener Systeme. Ziel ist immer das aktive System.",
        "Gleichartige Wurmlöcher und Hyperrouten-Linien gelten als angrenzend."
      ]}]},
      { title: "Transport", blocks: [{ ul: [
        "Schiffe mit Kapazität nehmen Jäger und Bodentruppen mit.",
        "Einsammeln im Start-, Durchflug- und aktiven System, nicht aus anderen Systemen mit eigenem Marker.",
        "Von Planet zu Planet geht nur per Schiff, auch im selben System.",
        "Überschuss über Kapazität sofort entfernen. Im Kampf erst am Kampfende prüfen."
      ]}]}
    ]},
    { h: "Anomalien" },
    { table: { head: ["Anomalie", "Was gilt"], rows: [
      ["**Asteroidenfeld**", "Nicht hinein und nicht hindurch. Ausnahme: Antimassen-Deflektoren."],
      ["**Supernova**", "Nicht hinein und nicht hindurch (Ausnahme über Muaat-Technologie)."],
      ["**Nebel**", "Nur hinein, wenn es das aktive System ist, nie hindurch. Wer im Nebel startet, hat Bewegung 1. Verteidiger +1 auf Kampfwürfe. Kein Rückzug hinein."],
      ["**Gravitationsstrudel**", "+1 Bewegung beim Verlassen oder Durchfliegen. Vor dem Verlassen würfeln: bei 1 bis 3 wird das Schiff samt Ladung entfernt."],
    ]}},
    { note: "Der **Ionensturm** (PoK) ist keine Anomalie, sondern ein Wurmloch-Marker aus dem Wilder-Raum-Stapel: Alpha oder Beta, wird umgedreht, nachdem Schiffe ihn genutzt haben.", kind: "tip" },
    { h: "Produktion" },
    { ul: [
      "Produktionslimit: Summe der Produktion im System. Standard-Raumwerft: Ressourcen des Planeten + 2.",
      "Jäger und Infanterie: 2 Stück für die angegebenen Kosten, aber jedes Stück zählt gegen das Limit.",
      "Bezahlen mit Ressourcen (Planeten erschöpfen) und Handelswaren. Überbezahltes verfällt.",
      "Schiffe in den Weltraum, Bodentruppen auf den Planeten mit der Raumwerft.",
      "Fremde Schiffe im System: keine Schiffe produzieren, Bodentruppen schon.",
      "PVS und Raumwerften werden nie produziert, sondern über Infrastruktur oder Effekte platziert.",
      "Danach Flottenpool und Kapazität beachten."
    ]},
    { rules: ["taktikaktion", "bewegung", "transportieren", "anomalien", "produktion", "einheiten-produzieren"] }
  ]},

{ id: "timing", name: "Wann darf ich…?", icon: "timing",
  desc: "Aktionskarten, Sabotage, gleichzeitige Effekte, Passen und typische Streitfragen.",
  blocks: [
    { darf: "aktion", level: 2 },
    { qa: [
      { q: "…eine Aktionskarte mit „Aktion“ spielen?", a: "Nur im eigenen Zug der Aktionsphase, als deine Aktion für diesen Zug (Materialaktion). Nicht nach dem Passen, nicht im Zug anderer, nicht in anderen Phasen. Nur wenn sie vollständig abgehandelt werden kann." },
      { q: "…eine Aktionskarte ohne „Aktion“ spielen?", a: "Genau dann, wenn der fett gedruckte Zeitpunkt eintritt, z. B. „zu Beginn einer Kampfrunde“. Das geht auch im Zug anderer, nach dem Passen und in jeder Phase. Es kostet keine Aktion." },
      { q: "…zwei gleiche Aktionskarten spielen?", a: "Nicht im selben Zeitfenster auf dieselben Einheiten oder denselben Effekt. Auf verschiedene Ziele ist es erlaubt. Wurde die erste negiert, gilt sie als nicht gespielt, dann geht die zweite." },
      { q: "…Sabotage spielen?", a: "Nachdem ein anderer Spieler eine Aktionskarte gespielt und ihre Ziele bestimmt hat, aber bevor Effekte abgehandelt, Stimmen abgegeben oder Würfel geworfen werden. Die Zielkarte hat keine Wirkung." },
      { q: "…etwas tun, wenn mehrere gleichzeitig wollen?", a: "Aktionsphase: der aktive Spieler zuerst, dann die anderen in Initiativreihenfolge, jeweils eine Fähigkeit, reihum bis niemand mehr will. Strategie- und Agendaphase: ab Sprecher im Uhrzeigersinn." },
      { q: "…„sobald“ und „nachdem“ unterscheiden?", a: "„Sobald“ greift gleichzeitig mit dem Ereignis und hat Vorrang, oft verändert es das Ereignis. „Bevor“ und „nachdem“ greifen unmittelbar davor bzw. danach, nicht irgendwann später im Zug." },
      { q: "…passen?", a: "Sobald du deine Strategieaktion gemacht hast. Bei 3 oder 4 Spielern müssen beide Strategiekarten erschöpft sein. Im Zug, in dem du passt, darfst du noch handeln." },
      { q: "…eine Sekundärfähigkeit nutzen?", a: "Wenn ein anderer Spieler die Strategieaktion seiner Karte macht, reihum ab links von ihm. Kostet 1 Marker aus dem Strategiepool. Ausnahmen: Führungsstärke kostet nie einen Marker, und bei Handel nutzen die vom aktiven Spieler gewählten Spieler sie gratis. Geht auch, wenn du schon gepasst hast." },
      { q: "…ein System mit fremdem Kommandomarker aktivieren?", a: "Ja. Nur Systeme mit deinem eigenen Marker kannst du nicht aktivieren." },
      { q: "…mich zurückziehen?", a: "Nur im Raumkampf: ankündigen in Schritt 2 (Verteidiger zuerst), ausführen in Schritt 5. Aus dem Bodenkampf nie." },
      { q: "…Aufträge werten?", a: "Statusphase Schritt 1: je 1 öffentlicher und 1 geheimer. Aktions- oder Agendaphase-Aufträge sofort, wenn erfüllt, aber pro Kampf höchstens 1. Imperium-Primär wertet einen öffentlichen Auftrag sofort. Öffentliche nur, wenn du alle Planeten deines Heimat-Systems kontrollierst." },
      { q: "…einen Agenten nutzen?", a: "Wann seine Karte es sagt, oft auch zugunsten anderer Spieler. Danach erschöpft, in der Statusphase wieder spielbereit." },
      { q: "…einen Planeten für Ressourcen und Einfluss gleichzeitig nutzen?", a: "Nein. Ein Planet liefert entweder Ressourcen oder Einfluss. Neu übernommene Planeten kommen erschöpft." },
      { q: "…eine gerade erhaltene Karte sofort spielen?", a: "Ja, wenn ihr Zeitpunkt noch offen ist. Eine Vertragskarte „zu Beginn deines Zuges“, die du zu Beginn deines Zuges bekommst, darfst du direkt spielen." },
      { q: "…mit Handelswaren abstimmen?", a: "Nein. Stimmen kommen nur aus dem Einfluss erschöpfter Planeten und aus Effekten, die ausdrücklich Stimmen geben." },
      { q: "…mehrere Nachtrag-Karten auf dieselbe Agenda spielen?", a: "Ja, auch auf verschiedene Alternativen. Das geht sogar, wenn du selbst nicht abstimmen darfst." },
      { q: "…Reliktfragmente eintauschen?", a: "Als Materialaktion: 3 Fragmente desselben Typs vernichten, 1 Relikt ziehen. Unbekannte Fragmente zählen als jeder Typ." },
      { q: "…Spieler angreifen, die gepasst haben?", a: "Ja. Passen schützt nicht. Der Verteidiger kämpft normal und darf passende Aktionskarten spielen." },
      { q: "…eigene Vertragskarten spielen?", a: "Nie. Eigene Vertragskarten gibst du per Transaktion weiter." },
      { q: "…Handkarten oder geheime Aufträge zeigen?", a: "Ja, freiwillig darf man geheime Informationen anderen zeigen." },
      { q: "…Glückstreffer und Co. gegen eigene Einheiten spielen?", a: "Nein. Zerstörende Effekte dieser Art gehen nur gegen Einheiten und Planeten anderer Spieler." }
    ]},
    { rules: ["faehigkeiten", "aktionskarten", "materialaktion", "strategieaktion"] }
  ]},

{ id: "handel", name: "Handel und Geschäfte", icon: "handel",
  desc: "Transaktionen, Nachbarn, was tauschbar ist und was bindend ist.",
  blocks: [
    { check: "handel", items: [
      { t: "Ist es der Zug eines der beiden?", s: "In der Aktionsphase handelt nur der aktive Spieler mit seinen Nachbarn. In der Agendaphase jederzeit während einer Agenda, mit jedem." },
      { t: "Sind die beiden Nachbarn?", s: "Einheiten oder Planeten im selben oder in angrenzenden Systemen, auch über Wurmlöcher. Gilt nur in der Aktionsphase." },
      { t: "Erste Transaktion mit diesem Partner in diesem Zug?", s: "Pro Zug eine pro Nachbar. In der Agendaphase eine pro Spielerpaar und Agenda." },
      { t: "Nur erlaubte Dinge?", s: "Handelswaren, Massenprodukte, Reliktfragmente, höchstens 1 Vertragskarte pro Seite." },
      { t: "Bedingungen vorher geklärt?", s: "Nach dem Austausch ist nichts rückgängig zu machen." },
      { t: "Massenprodukte umgedreht?", s: "Erhaltene Massenprodukte werden beim Empfänger sofort zu Handelswaren." }
    ]},
    { cards: [
      { title: "Tauschbar", blocks: [{ ul: ["Handelswaren", "Massenprodukte", "1 Vertragskarte pro Seite (von der Hand)", "Reliktfragmente (PoK)", "Gekaperte Schiffe und Mechs zurück an den Besitzer"] }]},
      { title: "Nicht tauschbar", blocks: [{ ul: ["Aktionskarten (Ausnahme: Emirate der Hacan)", "Technologien, Aufträge, Planeten", "Relikte", "Kommandomarker, Einheiten", "Vertragskarten aus dem Spielbereich"] }]}
    ]},
    { note: "**Geschäfte** sind jederzeit erlaubt, auch zwischen Nicht-Nachbarn. Bindend ist nur, was sofort vollständig erfüllt wird. Versprechen für später sind nicht bindend. Aktionskarten-Effekte können nie Teil eines bindenden Geschäfts sein.", kind: "tip" },
    { rules: ["transaktionen", "geschaefte", "nachbarn", "massenprodukte", "vertragskarten"] }
  ]},

{ id: "sc", name: "Strategiekarten", icon: "sc",
  desc: "Primär- und Sekundärfähigkeiten der acht Karten, mit Errata.",
  blocks: [
    { p: "Sekundärfähigkeiten kosten 1 Marker aus dem Strategiepool, außer bei Führungsstärke. Die Kartentexte gehen vor." },
    { sc: [
      { n: 1, name: "Führungsstärke", en: "Leadership", pri: "3 Kommandomarker erhalten. Dann je 3 ausgegebene Einfluss 1 weiterer Marker.", sec: "Je 3 ausgegebene Einfluss 1 Marker. Kostet keinen Strategiemarker." },
      { n: 2, name: "Diplomatie", en: "Diplomacy", pri: "System mit eigenem Planeten wählen, nicht Mecatol Rex. Alle anderen legen einen Marker aus ihrem Nachschub hinein. Dann bis zu 2 eigene erschöpfte Planeten spielbereit machen.", sec: "Bis zu 2 eigene erschöpfte Planeten spielbereit machen." },
      { n: 3, name: "Politik", en: "Politics", pri: "Einen Spieler ohne Sprechermarker zum Sprecher machen, auch dich selbst. 2 Aktionskarten ziehen. Oberste 2 Agenden ansehen und jeweils oben oder unten zurücklegen.", sec: "2 Aktionskarten ziehen." },
      { n: 4, name: "Infrastruktur", en: "Construction", pri: "1 PVS oder 1 Raumwerft auf einem eigenen Planeten platzieren, dann 1 weiteres PVS.", sec: "Marker aus dem Strategiepool in ein beliebiges System legen und dort 1 PVS oder 1 Raumwerft auf einem eigenen Planeten platzieren. Das System ist damit für dich markiert." },
      { n: 5, name: "Handel", en: "Trade", pri: "3 Handelswaren erhalten, Massenprodukte auffüllen. Beliebige andere Spieler wählen, die die Sekundärfähigkeit gratis nutzen.", sec: "Massenprodukte auffüllen." },
      { n: 6, name: "Kriegsführung", en: "Warfare", pri: "1 eigenen Kommandomarker vom Spielplan nehmen, zurückerhalten und alle Marker umverteilen.", sec: "Produktion einer Raumwerft im eigenen Heimat-System nutzen, ohne das System zu aktivieren." },
      { n: 7, name: "Technologie", en: "Technology", pri: "1 Technologie erforschen. Dann für 6 Ressourcen eine weitere.", sec: "4 Ressourcen ausgeben und 1 Technologie erforschen." },
      { n: 8, name: "Imperium", en: "Imperial", pri: "Sofort 1 erfüllten öffentlichen Auftrag werten. Dann 1 Siegpunkt mit Mecatol Rex, sonst 1 geheimen Auftrag ziehen.", sec: "1 geheimen Auftrag ziehen." }
    ]},
    { rules: ["strategiekarte", "strategieaktion", "strategiephase", "initiativreihenfolge"] }
  ]},

{ id: "limits", name: "Limits und Einheiten", icon: "limits",
  desc: "Handkarten, Aufträge, Flottenpool, Gebäude und Standard-Einheitenwerte.",
  blocks: [
    { kv: [
      ["10", "Siegpunkte zum Sieg (lange Leiste: 14)"],
      ["7", "Aktionskarten auf der Hand, Überschuss sofort ablegen"],
      ["3", "geheime Aufträge, gewertet und ungewertet zusammen"],
      ["3 / 3 / 2", "Startmarker Taktik / Flotte / Strategie"],
      ["+2", "Kommandomarker pro Statusphase"],
      ["16", "Kommandomarker pro Spieler insgesamt"],
      ["1 + 2", "Raumwerft und PVS pro Planet und Spieler"],
      ["4", "Mechs pro Spieler"],
      ["2", "Agenden pro Agendaphase"],
      ["6", "Einfluss für den Hütermarker, +1 Siegpunkt"],
      ["3 gleiche", "Reliktfragmente für 1 Relikt"],
      ["1", "Auftrag pro Kampf höchstens"]
    ]},
    { h: "Pro Spieler" },
    { table: { head: ["Was", "Regel"], rows: [
      ["Strategiekarten", "3 oder 4 Spieler: je 2. Ab 5 Spielern: je 1."],
      ["Flottenpool", "Nicht-Jäger-Schiffe pro System höchstens so viele wie Marker im Flottenpool. Überschuss sofort entfernen."],
      ["Kapazität", "Jäger und Bodentruppen im Weltraum höchstens so viele wie die Kapazität der eigenen Schiffe dort. Standard-Raumwerft: bis zu 3 Jäger zählen nicht."],
      ["Massenprodukte", "Höchstens der Massenproduktwert der Fraktion. Handelswaren unbegrenzt."],
      ["Transaktionen", "1 pro Nachbar pro Zug. Agendaphase: 1 pro Spielerpaar pro Agenda."],
      ["Aufträge", "Statusphase: höchstens 1 öffentlicher und 1 geheimer. Jeder Auftrag einmal pro Partie."],
      ["Einheiten", "Begrenzt durch das Material. Jäger und Infanterie haben Marker als Ersatz."]
    ]}},
    { h: "Standard-Einheitenwerte" },
    { p: "Ohne Aufwertungen. Fraktionsbogen und Technologien gehen vor." },
    { table: { head: ["Einheit", "Kosten", "Kampf", "Bew.", "Kap.", "Fähigkeiten"], num: [1, 2, 3, 4], rows: [
      ["Jäger", "1 (×2)", "9", "–", "–", "muss transportiert werden"],
      ["Infanterie", "1 (×2)", "8", "–", "–", "Bodentrupp"],
      ["Zerstörer", "1", "9", "2", "–", "Jägerabwehr 9 (×2)"],
      ["Kreuzer", "2", "7", "2", "–", ""],
      ["Träger", "3", "9", "1", "4", ""],
      ["Schlachtschiff", "4", "5", "1", "1", "Schadensresistenz, Bombardement 5"],
      ["Kriegssonne", "12", "3 (×3)", "2", "6", "nur mit Technologie; Schadensresistenz, Bombardement 3 (×3), ignoriert Planetaren Schild"],
      ["Mech (PoK)", "2", "6", "–", "–", "Schadensresistenz, Fraktionsfähigkeit (Karte prüfen)"],
      ["PVS", "–", "–", "–", "–", "Weltraumkanone 6, Planetarer Schild"],
      ["Raumwerft", "–", "–", "–", "–", "Produktion: Ressourcen + 2"]
    ]}},
    { rules: ["flottenpool", "kapazitaet", "einheiten", "materialbeschraenkung", "gebaeude"] }
  ]},

{ id: "pok", name: "Neu mit PoK", icon: "pok",
  desc: "Anführer, Mechs, Erkundung, Wilder Raum, Relikte, legendäre Planeten.",
  blocks: [
    { h: "Anführer" },
    { table: { head: ["Typ", "Freischalten", "Nutzung"], rows: [
      ["**Agent**", "Von Beginn an spielbereit", "Wird zum Nutzen meist erschöpft, oft auch für andere Spieler. Statusphase: wieder spielbereit."],
      ["**Commander**", "Bedingung auf der Karte. Bleibt danach frei.", "Dauerhafte Fähigkeit, nie erschöpft. Über die Vertragskarte „Allianz“ teilbar."],
      ["**Held**", "3 gewertete Aufträge (öffentlich oder geheim)", "Einmalige starke Fähigkeit, danach vernichtet."]
    ]}},
    { cards: [
      { title: "Mechs", blocks: [{ ul: [
        "Fraktionseigene Bodentruppen, 4 pro Spieler.",
        "Gelten als Bodentruppen, aber nicht als Infanterie.",
        "Meist mit Schadensresistenz und Fraktionsfähigkeit. Manche haben Einsatz und kommen ohne Produktion aufs Brett.",
        "Transport wie Infanterie. Mech-Karten sind keine Technologien."
      ]}]},
      { title: "Erkundung", blocks: [{ ul: [
        "Übernimmst du einen Planeten, der vorher keinem anderen Spieler gehörte, erkundest du ihn.",
        "Karte vom Stapel seines Merkmals: kulturell, gefährlich, industriell.",
        "Ohne Merkmal (Heimatplaneten, Mecatol Rex) keine Erkundung.",
        "„Verstärkung“-Karten werden angelegt, Reliktfragmente bleiben offen liegen, der Rest wird abgelegt."
      ]}]},
      { title: "Wilder Raum", blocks: [{ ul: [
        "Beim Aufbau ein Marker in jedes Nicht-Heimat-System ohne Planeten. Hyperrouten zählen nicht.",
        "Erkunden nur mit Nullpunktenergie-Reaktor (nach einer Taktikaktion mit eigenen Schiffen im System) oder per Effekt.",
        "Danach kommt der Marker weg. Gezogen wird vom Wilder-Raum-Stapel."
      ]}]},
      { title: "Relikte", blocks: [{ ul: [
        "Reliktfragmente: kulturell, gefährlich, industriell, unbekannt (zählt als jeder Typ).",
        "Materialaktion: 3 gleiche vernichten, 1 Relikt ziehen.",
        "Fragmente sind tauschbar, Relikte nicht."
      ]}]},
      { title: "Legendäre Planeten", blocks: [{ ul: [
        "Mit der Kontrolle bekommt man die Fähigkeitskarte des Planeten.",
        "Sie wird unabhängig von der Planetenkarte erschöpft und spielbereit gemacht.",
        "Mallice liegt im Wurmloch-Nexus."
      ]}]},
      { title: "Wurmloch-Nexus und Hyperrouten", blocks: [{ ul: [
        "Der Nexus liegt zu Beginn inaktiv (nur Gamma) am Rand des Spielplans.",
        "Aktiv (Alpha, Beta, Gamma), sobald eine Einheit hineinkommt oder jemand Mallice kontrolliert. Bei Bewegung erst am Ende des Bewegungsschritts.",
        "Hyperrouten verbinden Systeme in manchen Aufbauten (5 oder 7 Spieler, 8 Spieler alternativ) und sind selbst keine Systeme."
      ]}]}
    ]},
    { rules: ["anfuehrer", "mechs", "erkundung", "wilder-raum", "relikte", "legendaere-planeten", "wurmloch-nexus", "hyperrouten", "kapern", "einsatz", "vernichten", "anlegen"] }
  ]},

{ id: "aufbau", name: "Aufbau", icon: "aufbau",
  desc: "Vollständiger Aufbau mit PoK als Checkliste für den Host.",
  blocks: [
    { check: "setup", items: [
      { t: "1 · Sprecher zufällig bestimmen", s: "Er bekommt den Sprechermarker." },
      { t: "2 · Fraktionen wählen", s: "Jeder nimmt einen Fraktionsbogen." },
      { t: "3 · Fraktionsmaterial nehmen", s: "Heimat-System, 17 Kontrollmarker, 16 Kommandomarker, 2 Fraktionstechnologien, 3 Anführerkarten, Fraktions-Vertragskarte, Mech-Einheitenkarte, eventuelles Sondermaterial." },
      { t: "4 · Spielerfarbe wählen", s: "Plastikeinheiten, Technologiekarten, Kommandobogen, 5 Vertragskarten (Technologie- und Vertragsstapel bilden), Anführerbogen. Anführer mit der Streifen-Seite passend auf den Bogen legen." },
      { t: "5 · Startplanetenkarten verteilen", s: "Planetenkarten des eigenen Heimat-Systems offen auslegen." },
      { t: "6 · Spielplan zusammensetzen", s: "Mecatol Rex in die Mitte. Wurmloch-Nexus inaktiv (Gamma-Seite) daneben, 3 Gamma-Marker dazu. Hyperrouten falls nötig. Systemtafeln austeilen und reihum platzieren. Anomalien und gleiche Wurmlöcher möglichst nicht nebeneinander." },
      { t: "7 · Spielplanmarker", s: "Hütermarker auf Mecatol Rex. Wilder-Raum-Marker auf jedes Nicht-Heimat-System ohne Planeten. Verstärkungsmarker neben den Spielplan." },
      { t: "8 · Gemeinsame Stapel mischen", s: "Aktionskarten, Agenden, Stufe-I- und Stufe-II-Aufträge, geheime Aufträge, Reliktstapel und jeder Erkundungsstapel getrennt." },
      { t: "9 · Vorrat bilden", s: "Handelswaren-, Jäger- und Infanteriemarker. Planetenkarten und Fähigkeitskarten der legendären Planeten neben den Spielplan." },
      { t: "10 · Strategiekarten auslegen", s: "Alle 8 offen in Reichweite des Sprechers." },
      { t: "11 · Startmaterial nehmen", s: "Starttechnologien und Starteinheiten laut Rückseite des Fraktionsbogens. Marker: 3 Taktik, 3 Flotte, 2 Strategie." },
      { t: "12 · Aufträge vorbereiten", s: "Jeder zieht 2 geheime Aufträge und behält 1. Siegpunktleiste (10 oder 14) mit Kontrollmarkern auf 0. 5 Stufe-I-Aufträge oberhalb und 5 Stufe-II-Aufträge unterhalb verdeckt auslegen, die ersten 2 Stufe-I-Aufträge aufdecken." },
      { t: "Startbestand prüfen", s: "Niemand hat zu Beginn Aktionskarten. Massenprodukte und Handelswaren starten bei 0, außer der Fraktionsbogen sagt etwas anderes." }
    ]},
    { h: "Systemtafeln pro Spieler" },
    { table: { head: ["Spieler", "Blau", "Rot", "Zusätzlich vom Sprecher neben Mecatol Rex"], num: [1, 2], rows: [
      ["3", "6", "2", ""],
      ["4", "5", "3", ""],
      ["5 ohne Hyperrouten", "4", "2", "1 rote (3 Spieler erhalten Handelswaren als Ausgleich)"],
      ["5 mit Hyperrouten", "3", "2", ""],
      ["6", "3", "2", ""],
      ["6 große Galaxie", "6", "3", ""],
      ["7", "4", "2", "2 rote und 3 blaue"],
      ["7 Alternative", "3", "2", ""],
      ["8", "4", "2", "2 rote und 2 blaue"],
      ["8 Alternative", "3", "2", ""]
    ]}},
    { note: "Platziert wird ab Sprecher im Uhrzeigersinn, dann in umgekehrter Richtung (Schlangenreihenfolge). Jeder Ring wird geschlossen, bevor der nächste beginnt. Danach die Heimat-Systeme anlegen.", kind: "tip" },
    { rules: ["spielplan", "systemtafeln", "wilder-raum", "wurmloch-nexus", "hyperrouten", "auftragskarten"] }
  ]}
];
