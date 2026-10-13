/* Fraktionen: 17 Grundspiel, 7 PoK, Council Keleres (Codex III).
   Werte nach AsyncTI4-Daten, gegengeprüft. Kartentexte sinngemäß zusammengefasst.
   de nur, wenn der deutsche Name im LRR belegt ist. Haupttext = Fassung der PoK-Box,
   spätere Codex-Ω-Fassungen stehen kurz im Feld codex. */
window.TI4 = window.TI4 || {};
TI4.factions = [
{ id: "arborec", de: "Das Arborec", en: "The Arborec", src: "base", short: "Arborec",
  complexity: 3, commodities: 3, homeTile: "5",
  home: [{ name: "Nestphar", res: 3, inf: 2 }],
  start: { units: "1 Träger, 1 Kreuzer, 2 Jäger, 4 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Magen-Abwehrschirm"] },
  abilities: [
    { en: "Mitosis", text: "Deine Raumwerften können keine Infanterie produzieren. Dafür setzt du zu Beginn jeder Statusphase 1 Infanterie aus deinem Nachschub auf einen beliebigen Planeten, den du kontrollierst." }
  ],
  flagship: { de: "Duha Menaimon", en: "Duha Menaimon", cost: 8, combat: "7 (×2)", move: 1, capacity: 5,
    text: "Schadensresistenz. Aktivierst du das System, in dem es steht, darfst du dort anschließend bis zu 5 Einheiten produzieren." },
  mech: { en: "Letani Behemoth", cost: 2, combat: "6",
    text: "Schadensresistenz, Produktion 2, Planetarer Schild. Einsatz: Wenn du Mitosis nutzen würdest, darfst du stattdessen 1 deiner Infanterie durch 1 Mech aus deinem Nachschub ersetzen." },
  units: [
    { de: "Letani-Krieger I", en: "Letani Warrior I", replaces: "Infanterie", cost: "1 (×2)", combat: "8", move: "–", capacity: "–",
      text: "Infanterie mit Produktion 1.",
      upgrade: { de: "Letani-Krieger II", en: "Letani Warrior II", prereq: "GG", cost: "1 (×2)", combat: "7", move: "–", capacity: "–",
        text: "Produktion 2. Wird die Einheit zerstört, wirfst du 1 Würfel. Bei 6 oder mehr kommt sie auf diese Karte und zu Beginn deines nächsten Zuges auf einen eigenen Planeten in deinem Heimat-System." } }
  ],
  techs: [
    { en: "Bioplasmosis", color: "gruen", prereq: "GG",
      text: "Am Ende der Statusphase darfst du beliebig viel Infanterie von deinen Planeten nehmen und auf eigene Planeten im selben oder in angrenzenden Systemen verteilen." },
    { de: "Letani-Krieger II", en: "Letani Warrior II", color: "einheit", prereq: "GG",
      text: "Aufwertung deiner Infanterie auf Kampfwert 7 und Produktion 2. Zerstörte Einheiten kehren bei einer 6 oder mehr ins Heimat-System zurück." }
  ],
  leaders: {
    agents: [{ en: "Letani Ospha", text: "Materialaktion: Erschöpfe die Karte und wähle ein Nicht-Jäger-Schiff eines Spielers. Dieser darf es durch ein Schiff aus seinem Nachschub ersetzen, das höchstens 2 mehr kostet." }],
    commander: { en: "Dirzuga Rophal", unlock: "12 Bodentruppen auf Planeten, die du kontrollierst.",
      text: "Aktiviert ein anderer Spieler ein System mit mindestens 1 deiner Einheiten mit Produktion, darfst du dort anschließend 1 Einheit produzieren." },
    hero: { en: "Letani Miasmiala", text: "Materialaktion: Produziere beliebig viele Einheiten in beliebig vielen Systemen, in denen mindestens 1 deiner Bodentruppen steht. Danach wird die Karte vernichtet." }
  },
  promissory: { de: "Wachstumshemmer", en: "Stymie", text: "Materialaktion: Lege die Karte offen in deinen Spielbereich. Der Arborec-Spieler darf keine Einheiten in oder angrenzend an Nicht-Heimat-Systeme produzieren, die mindestens 1 deiner Einheiten enthalten. Aktivierst du ein System mit Arborec-Einheiten, geht die Karte an ihn zurück.",
    codex: "Codex I (Ω): Nachdem ein anderer Spieler Schiffe in ein System mit deinen Einheiten bewegt hat, darfst du einen Kommandomarker aus seinem Nachschub in ein beliebiges Nicht-Heimat-System legen. Danach geht die Karte an den Arborec-Spieler zurück." },
  play: "Wächst langsam, aber stetig, weil Infanterie und Flaggschiff fast überall dort produzieren, wo Bodentruppen stehen."
},

{ id: "creuss", de: "Die Geister von Creuss", en: "The Ghosts of Creuss", src: "base", short: "Creuss",
  complexity: 2, commodities: 4, homeTile: "51", gateTile: "17",
  home: [{ name: "Creuss", res: 4, inf: 2 }],
  start: { units: "1 Träger, 2 Zerstörer, 2 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Gravity Drive"] },
  abilities: [
    { de: "Quantenverschränkung", en: "Quantum Entanglement", text: "Für dich grenzen alle Systeme mit einem Alpha- oder Beta-Wurmloch aneinander an. Kein Spieleffekt kann dir diese Fähigkeit nehmen." },
    { en: "Slipstream", text: "Während deiner Taktikaktionen erhält jedes deiner Schiffe +1 Bewegung, wenn es in deinem Heimat-System oder in einem System mit Alpha- oder Beta-Wurmloch losfliegt." },
    { de: "Tor von Creuss", en: "Creuss Gate", text: "Beim Aufbau liegt das Tor von Creuss (Systemtafel 17) an der Stelle deines Heimat-Systems, zählt aber nicht als Heimat-System. Dein eigentliches Heimat-System (Systemtafel 51) liegt in deinem Spielbereich." }
  ],
  flagship: { de: "Hil Colish", en: "Hil Colish", cost: 8, combat: "5", move: 1, capacity: 3,
    text: "Schadensresistenz. Sein System enthält ein Delta-Wurmloch. Bei der Bewegung darf es vor oder nach deinen übrigen Schiffen ziehen." },
  mech: { en: "Icarus Drive", cost: 2, combat: "6",
    text: "Schadensresistenz. Nachdem ein beliebiger Spieler ein System aktiviert hat, darfst du diesen Mech vom Spielplan nehmen, um einen Creuss-Wurmlochmarker in dieses System zu legen oder dorthin zu versetzen." },
  techs: [
    { de: "Dimensionsspalter", en: "Dimensional Splicer", color: "rot", prereq: "R",
      text: "Zu Beginn eines Raumkampfs in einem System mit Wurmloch und mindestens 1 deiner Schiffe darfst du 1 Treffer erzeugen und einem gegnerischen Schiff zuweisen." },
    { de: "Wurmloch-Generator", en: "Wormhole Generator", color: "blau", prereq: "BB",
      text: "Zu Beginn der Statusphase legst du einen Creuss-Wurmlochmarker in ein System mit einem deiner Planeten oder in ein Nicht-Heimat-System ohne fremde Schiffe oder versetzt ihn dorthin.",
      codex: "Codex I (Ω): Das Versetzen geschieht stattdessen per Materialaktion, für die du die Karte erschöpfst, also jederzeit in der Aktionsphase." }
  ],
  leaders: {
    agents: [{ de: "Abgesandte Taivra", en: "Emissary Taivra", title: "Die Azurflüsterin", text: "Nachdem ein Spieler ein System mit einem Wurmloch außer Delta aktiviert hat, darfst du die Karte erschöpfen. Für diese Taktikaktion grenzt das System dann an alle anderen Systeme mit Wurmloch an." }],
    commander: { de: "Sai Seravus", en: "Sai Seravus", unlock: "Eigene Einheiten in 3 Systemen mit Alpha- oder Beta-Wurmloch.",
      text: "Nachdem sich deine Schiffe bewegt haben, darfst du zu jedem Schiff mit Kapazität, das durch mindestens 1 Wurmloch gezogen ist, 1 Jäger aus deinem Nachschub setzen, solange im aktiven System Kapazität frei ist." },
    hero: { de: "Risswandlerin Meian", en: "Riftwalker Meian", title: "Wächterin von Shaleri",
      text: "Materialaktion: Vertausche die Positionen zweier Systeme, die Wurmlöcher oder deine Einheiten enthalten. Das Creuss-System und der Wurmloch-Nexus sind ausgenommen. Danach wird die Karte vernichtet." }
  },
  promissory: { en: "Creuss IFF", text: "Zu Beginn deines Zuges in der Aktionsphase legst du einen Creuss-Wurmlochmarker in ein System mit einem deiner Planeten oder in ein Nicht-Heimat-System ohne fremde Schiffe oder versetzt ihn dorthin. Danach geht die Karte an den Creuss-Spieler zurück." },
  play: "Springen über Wurmlöcher quer durch die Galaxie und tauchen dort auf, wo niemand mit ihnen rechnet."
},

{ id: "hacan", de: "Die Emirate von Hacan", en: "The Emirates of Hacan", src: "base", short: "Hacan",
  complexity: 1, commodities: 6, homeTile: "16",
  home: [{ name: "Arretze", res: 2, inf: 0 }, { name: "Hercant", res: 1, inf: 1 }, { name: "Kamdorn", res: 0, inf: 1 }],
  start: { units: "2 Träger, 1 Kreuzer, 2 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Sarween-Werkzeuge", "Antimass Deflectors"] },
  abilities: [
    { en: "Masters of Trade", text: "Für die Sekundärfähigkeit der Strategiekarte Handel gibst du keinen Kommandomarker aus." },
    { en: "Guild Ships", text: "Du darfst Transaktionen auch mit Spielern abhandeln, die nicht deine Nachbarn sind." },
    { en: "Arbiters", text: "Bei deinen Transaktionen dürfen auch Aktionskarten getauscht werden." }
  ],
  flagship: { en: "Wrath of Kenara", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Nachdem du in einem Raumkampf in diesem System einen Würfel geworfen hast, darfst du 1 Handelsware ausgeben, um sein Ergebnis um 1 zu erhöhen." },
  mech: { en: "Pride of Kenara", cost: 2, combat: "6",
    text: "Schadensresistenz. Die Planetenkarte dieses Planeten darf Teil einer Transaktion sein. Dann ziehst du alle deine Einheiten von dort auf einen anderen Planeten, den du kontrollierst." },
  techs: [
    { en: "Quantum Datahub Node", color: "gelb", prereq: "YYY",
      text: "Am Ende der Strategiephase darfst du 1 Marker aus deinem Strategiepool ausgeben und einem anderen Spieler 3 deiner Handelswaren geben. Dann tauschst du 1 deiner Strategiekarten gegen 1 von seinen." },
    { en: "Production Biomes", color: "gruen", prereq: "GG",
      text: "Materialaktion: Erschöpfe die Karte und gib 1 Marker aus deinem Strategiepool aus. Du erhältst 4 Handelswaren und ein anderer Spieler deiner Wahl 2." }
  ],
  leaders: {
    agents: [{ en: "Carth of Golden Sands", text: "Während der Aktionsphase darfst du die Karte erschöpfen, um 2 Massenprodukte zu erhalten oder die Massenprodukte eines anderen Spielers aufzufüllen." }],
    commander: { en: "Gila the Silvertongue", unlock: "10 Handelswaren besitzen.",
      text: "Wenn du Stimmen abgibst, darfst du beliebig viele Handelswaren ausgeben. Jede davon bringt dir 2 zusätzliche Stimmen." },
    hero: { en: "Harrugh Gefhara", text: "Wenn 1 oder mehrere deiner Einheiten Produktion nutzen, darfst du die Kosten aller dabei produzierten Einheiten auf 0 senken. Tust du das, wird die Karte vernichtet." }
  },
  promissory: { en: "Trade Convoys", text: "Materialaktion: Lege die Karte offen in deinen Spielbereich. Solange sie dort liegt, darfst du auch mit Nicht-Nachbarn Transaktionen abhandeln. Aktivierst du ein System mit Hacan-Einheiten, geht sie an den Hacan-Spieler zurück." },
  play: "Handelsmacht, die über Massenprodukte, Transaktionen und die Strategiekarte Handel Ressourcen und Einfluss in Bewegung hält."
},

{ id: "jolnar", de: "Die Universitäten von Jol-Nar", en: "The Universities of Jol-Nar", src: "base", short: "Jol-Nar",
  complexity: 1, commodities: 4, homeTile: "12",
  home: [{ name: "Jol", res: 1, inf: 2 }, { name: "Nar", res: 2, inf: 3 }],
  start: { units: "1 Schlachtschiff, 2 Träger, 1 Jäger, 2 Infanterie, 2 PVS, 1 Raumwerft", tech: ["Antimass Deflectors", "Sarween-Werkzeuge", "Neurostimulator", "Plasmabrenner"] },
  abilities: [
    { en: "Fragile", text: "Von jedem Kampfwurf deiner Einheiten wird 1 abgezogen." },
    { en: "Brilliant", text: "Gibst du einen Kommandomarker für die Sekundärfähigkeit der Strategiekarte Technologie aus, darfst du stattdessen ihre Primärfähigkeit abhandeln." },
    { en: "Analytical", text: "Erforschst du eine Technologie, die keine Aufwertung ist, darfst du 1 ihrer Voraussetzungen ignorieren." }
  ],
  flagship: { en: "J.N.S. Hylarim", cost: 8, combat: "6 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Jede 9 oder 10 bei seinen Kampfwürfen erzeugt vor Modifikatoren 2 zusätzliche Treffer." },
  mech: { en: "Shield Paling", cost: 2, combat: "6",
    text: "Schadensresistenz. Deine Infanterie auf diesem Planeten ist von Fragile nicht betroffen." },
  techs: [
    { de: "E-Res-Extraktor", en: "E-Res Siphons", color: "gelb", prereq: "YY",
      text: "Nachdem ein anderer Spieler ein System mit mindestens 1 deiner Schiffe aktiviert hat, erhältst du 4 Handelswaren." },
    { en: "Spatial Conduit Cylinder", color: "blau", prereq: "BB",
      text: "Nachdem du ein System mit eigenen Einheiten aktiviert hast, darfst du die Karte erschöpfen. Während dieser Aktivierung grenzt das System dann an alle anderen Systeme mit deinen Einheiten." }
  ],
  leaders: {
    agents: [{ en: "Doctor Sucaban", text: "Gibt ein Spieler Ressourcen zum Forschen aus, darfst du die Karte erschöpfen. Er darf dann beliebig viel eigene Infanterie vom Spielplan nehmen und die Kosten pro entfernter Einheit um 1 senken." }],
    commander: { en: "Ta Zern", unlock: "8 Technologien besitzen.",
      text: "Nachdem du für eine Einheitenfähigkeit gewürfelt hast, darfst du beliebige dieser Würfel erneut werfen." },
    hero: { en: "Rin, the Master's Legacy", text: "Materialaktion: Tausche jede deiner Technologien, die keine Aufwertung ist, nach Wunsch gegen eine Technologie derselben Farbe aus deinem Technologiestapel. Danach wird die Karte vernichtet." }
  },
  promissory: { en: "Research Agreement", text: "Nachdem der Jol-Nar-Spieler eine Technologie erforscht hat, die keine Fraktionstechnologie ist, erhältst du diese Technologie ebenfalls. Danach geht die Karte an ihn zurück." },
  play: "Technologieführer, der früh viele Karten sammelt, im direkten Kampf aber mit schlechteren Würfeln antritt."
},

{ id: "l1z1x", de: "Das L1Z1X-Gedankennetz", en: "The L1Z1X Mindnet", src: "base", short: "L1Z1X",
  complexity: 1, commodities: 2, homeTile: "6",
  home: [{ name: "[0.0.0]", res: 5, inf: 0 }],
  start: { units: "1 Schlachtschiff, 1 Träger, 3 Jäger, 5 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Plasmabrenner", "Neurostimulator"] },
  abilities: [
    { en: "Assimilate", text: "Übernimmst du die Kontrolle über einen Planeten, ersetzt du alle PVS und Raumwerften dort durch gleichartige Einheiten aus deinem Nachschub." },
    { de: "Geißel", en: "Harrow", text: "Am Ende jeder Bodenkampfrunde dürfen deine Schiffe im aktiven System ihr Bombardement gegen die gegnerischen Bodentruppen auf dem Planeten einsetzen." }
  ],
  flagship: { en: "[0.0.1]", cost: 8, combat: "5 (×2)", move: 1, capacity: 5,
    text: "Schadensresistenz. Im Raumkampf müssen Treffer dieses Schiffs und deiner Schlachtschiffe in diesem System nach Möglichkeit Nicht-Jäger-Schiffen zugewiesen werden." },
  mech: { en: "Annihilator", cost: 2, combat: "6",
    text: "Schadensresistenz, Bombardement 8. Solange er nicht an einem Bodenkampf teilnimmt, darf er wie ein Schiff Planeten in seinem System bombardieren." },
  units: [
    { en: "Super-Dreadnought I", replaces: "Schlachtschiff", cost: 4, combat: "5", move: 1, capacity: 2,
      text: "Schadensresistenz, Bombardement 5.",
      upgrade: { en: "Super-Dreadnought II", prereq: "BBY", cost: 4, combat: "4", move: 2, capacity: 2,
        text: "Schadensresistenz, Bombardement 4. Kann nicht durch die Aktionskarte „Direkter Treffer“ zerstört werden." } }
  ],
  techs: [
    { en: "Inheritance Systems", color: "gelb", prereq: "YY",
      text: "Erforschst du eine Technologie, darfst du die Karte erschöpfen und 2 Ressourcen ausgeben, um alle ihre Voraussetzungen zu ignorieren." },
    { en: "Super-Dreadnought II", color: "einheit", prereq: "BBY",
      text: "Aufwertung deiner Schlachtschiffe auf Kampfwert 4, Bewegung 2 und Bombardement 4. Sie sind immun gegen „Direkter Treffer“." }
  ],
  leaders: {
    agents: [{ en: "I48S", text: "Nachdem ein Spieler ein System aktiviert hat, darfst du die Karte erschöpfen. Er darf dann 1 seiner Infanterie im aktiven System durch 1 Mech aus seinem Nachschub ersetzen." }],
    commander: { en: "2RAM", unlock: "4 Schlachtschiffe auf dem Spielplan.",
      text: "Einheiten mit Planetarer Schild hindern dich nicht daran, Bombardement einzusetzen." },
    hero: { en: "The Helmsman", text: "Materialaktion: Wähle 1 System ohne fremde Schiffe und bewege dein Flaggschiff sowie beliebig viele Schlachtschiffe aus anderen Systemen dorthin. Danach wird die Karte vernichtet." }
  },
  promissory: { de: "Kybernetische Implantate", en: "Cybernetic Enhancements", text: "Zu Beginn deines Zuges legst du 1 Marker aus dem Strategiepool des L1Z1X-Spielers in dessen Nachschub zurück und legst anschließend 1 Kommandomarker aus deinem Nachschub in deinen Strategiepool. Danach geht die Karte an den L1Z1X-Spieler zurück.",
    codex: "Codex I (Ω): Wenn du in der Statusphase Kommandomarker erhältst, bekommst du 1 zusätzlichen. Danach geht die Karte an den L1Z1X-Spieler zurück." },
  play: "Militärische Walze mit starken Schlachtschiffen, die eroberte Planeten samt Gebäuden übernimmt."
},

{ id: "letnev", de: "Das Baronat von Letnev", en: "The Barony of Letnev", src: "base", short: "Letnev",
  complexity: 1, commodities: 2, homeTile: "10",
  home: [{ name: "Arc Prime", res: 4, inf: 0 }, { name: "Wren Terra", res: 2, inf: 1 }],
  start: { units: "1 Schlachtschiff, 1 Träger, 1 Zerstörer, 1 Jäger, 3 Infanterie, 1 Raumwerft", tech: ["Antimass Deflectors", "Plasmabrenner"] },
  abilities: [
    { en: "Munitions Reserves", text: "Zu Beginn jeder Raumkampfrunde darfst du 2 Handelswaren ausgeben. Dann darfst du in dieser Runde beliebig viele deiner Würfel erneut werfen." },
    { de: "Armada", en: "Armada", text: "In jedem System darfst du so viele Nicht-Jäger-Schiffe haben, wie Marker in deinem Flottenpool liegen, plus 2." }
  ],
  flagship: { en: "Arc Secundus", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz, Bombardement 5 (×3). Fremde Einheiten in diesem System verlieren Planetarer Schild. Zu Beginn jeder Raumkampfrunde wird das Schiff repariert." },
  mech: { en: "Dunlain Reaper", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Zu Beginn einer Bodenkampfrunde darfst du 2 Ressourcen ausgeben, um 1 deiner kämpfenden Infanterie durch 1 Mech zu ersetzen." },
  techs: [
    { en: "L4 Disruptors", color: "gelb", prereq: "Y",
      text: "Während deiner Einmärsche können Einheiten keine Weltraumkanone gegen deine Einheiten einsetzen." },
    { de: "Nichteuklidischer Schutzschild", en: "Non-Euclidean Shielding", color: "rot", prereq: "RR",
      text: "Nutzt eine deiner Einheiten Schadensresistenz, negiert sie 2 Treffer statt 1." }
  ],
  leaders: {
    agents: [{ en: "Viscount Unlenn", text: "Zu Beginn einer Raumkampfrunde darfst du die Karte erschöpfen und 1 Schiff im aktiven System wählen. Es wirft in dieser Runde 1 zusätzlichen Würfel." }],
    commander: { en: "Rear Admiral Farran", unlock: "5 Nicht-Jäger-Schiffe in einem System.",
      text: "Nachdem eine deiner Einheiten Schadensresistenz genutzt hat, darfst du 1 Handelsware erhalten." },
    hero: { en: "Darktalon Treilla", text: "Materialaktion: Lege die Karte neben den Spielplan. Bis zum Ende dieser Spielrunde begrenzen weder Gesetze noch dein Flottenpool die Zahl deiner Nicht-Jäger-Schiffe pro System. Am Ende der Runde wird die Karte vernichtet." }
  },
  promissory: { de: "Zuschuss für die Kriegskasse", en: "War Funding", text: "Zu Beginn einer Raumkampfrunde verliert der Letnev-Spieler 2 Handelswaren. Während dieser Kampfrunde darfst du beliebig viele deiner Würfel erneut werfen. Danach geht die Karte an den Letnev-Spieler zurück.",
    codex: "Codex I (Ω): Nachdem du und dein Gegner im Raumkampf gewürfelt habt, darfst du alle Würfel des Gegners und beliebige eigene Würfel erneut werfen. Danach geht die Karte an den Letnev-Spieler zurück." },
  play: "Robuste Flottenfraktion, die mit vielen Schiffen pro System und Handelswaren für Wiederholungswürfe Raumkämpfe dominiert."
},

{ id: "mentak", de: "Die Mentak-Koalition", en: "The Mentak Coalition", src: "base", short: "Mentak",
  complexity: 3, commodities: 2, homeTile: "2",
  home: [{ name: "Moll Primus", res: 4, inf: 1 }],
  start: { units: "1 Träger, 2 Kreuzer, 3 Jäger, 4 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Plasmabrenner", "Sarween-Werkzeuge"] },
  abilities: [
    { de: "Hinterhalt", en: "Ambush", text: "Zu Beginn eines Raumkampfs darfst du für bis zu 2 deiner Kreuzer oder Zerstörer im System je 1 Würfel werfen. Jedes Ergebnis mindestens in Höhe des Kampfwerts des Schiffs ist 1 Treffer, den der Gegner einem seiner Schiffe zuweisen muss." },
    { de: "Plündern", en: "Pillage", text: "Nachdem ein Nachbar Handelswaren erhalten oder eine Transaktion abgehandelt hat und mindestens 3 Handelswaren besitzt, darfst du ihm 1 Handelsware oder 1 Massenprodukt wegnehmen." }
  ],
  flagship: { en: "Fourth Moon", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Fremde Schiffe in diesem System können keine Schadensresistenz nutzen." },
  mech: { en: "Moll Terminus", cost: 2, combat: "6",
    text: "Schadensresistenz. Fremde Bodentruppen auf diesem Planeten können keine Schadensresistenz nutzen." },
  techs: [
    { en: "Mirror Computing", color: "gelb", prereq: "YYY",
      text: "Jede Handelsware, die du ausgibst, zählt als 2 Ressourcen oder 2 Einfluss." },
    { de: "Bergungstechnik", en: "Salvage Operations", color: "gelb", prereq: "YY",
      text: "Nach jedem Raumkampf, ob gewonnen oder verloren, erhältst du 1 Handelsware. Bei einem Sieg darfst du in diesem System zusätzlich 1 Schiff eines Typs produzieren, der im Kampf zerstört wurde." }
  ],
  leaders: {
    agents: [{ en: "Suffi An", text: "Nachdem Plündern gegen einen anderen Spieler eingesetzt wurde, darfst du die Karte erschöpfen. Dann ziehen du und dieser Spieler je 1 Aktionskarte." }],
    commander: { en: "S'ula Mentarion", unlock: "4 Kreuzer auf dem Spielplan.",
      text: "Nachdem du einen Raumkampf gewonnen hast, darfst du deinen Gegner zwingen, dir 1 Vertragskarte aus seiner Hand zu geben." },
    hero: { en: "Ipswitch, Loose Cannon", text: "Zu Beginn eines Raumkampfs mit deiner Beteiligung darfst du die Karte vernichten. Für jedes fremde Schiff, das in diesem Kampf zerstört wird, setzt du dann 1 Schiff desselben Typs aus deinem Nachschub ins aktive System." }
  },
  promissory: { en: "Promise of Protection", text: "Materialaktion: Lege die Karte offen in deinen Spielbereich. Solange sie dort liegt, darf der Mentak-Spieler Plündern nicht gegen dich einsetzen. Aktivierst du ein System mit Mentak-Einheiten, geht sie an ihn zurück." },
  play: "Piratenfraktion, die reiche Nachbarn mit Plündern schröpft und Raumkämpfe aus dem Hinterhalt eröffnet."
},

{ id: "muaat", de: "Die Glut von Muaat", en: "The Embers of Muaat", src: "base", short: "Muaat",
  complexity: 3, commodities: 4, homeTile: "4",
  home: [{ name: "Muaat", res: 4, inf: 1 }],
  start: { units: "1 Kriegssonne, 2 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Plasmabrenner"] },
  abilities: [
    { en: "Star Forge", text: "Materialaktion: Gib 1 Marker aus deinem Strategiepool aus, um 2 Jäger oder 1 Zerstörer aus deinem Nachschub in ein System mit mindestens 1 deiner Kriegssonnen zu setzen." },
    { en: "Gashlai Physiology", text: "Deine Schiffe dürfen sich durch Supernovae hindurchbewegen." }
  ],
  flagship: { en: "The Inferno", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Materialaktion: Gib 1 Marker aus deinem Strategiepool aus, um 1 Kreuzer in das System dieses Schiffs zu setzen." },
  mech: { en: "Ember Colossus", cost: 2, combat: "6",
    text: "Schadensresistenz. Nutzt du Star Forge in diesem oder einem angrenzenden System, darfst du zusätzlich 1 Infanterie aus deinem Nachschub zu diesem Mech setzen." },
  units: [
    { de: "Kriegssonne-Prototyp I", en: "Prototype War Sun I", replaces: "Kriegssonne", cost: 12, combat: "3 (×3)", move: 1, capacity: 6,
      text: "Schadensresistenz, Bombardement 3 (×3). Fremde Einheiten in diesem System verlieren Planetarer Schild. Muaat darf Kriegssonnen von Beginn an ohne Technologie produzieren.",
      upgrade: { de: "Kriegssonne-Prototyp II", en: "Prototype War Sun II", prereq: "RRRY", cost: 10, combat: "3 (×3)", move: 3, capacity: 6,
        text: "Schadensresistenz, Bombardement 3 (×3). Fremde Einheiten in diesem System verlieren Planetarer Schild." } }
  ],
  techs: [
    { de: "Kriegssonne-Prototyp II", en: "Prototype War Sun II", color: "einheit", prereq: "RRRY",
      text: "Aufwertung deiner Kriegssonnen auf Kosten 10 und Bewegung 3." },
    { de: "Magmus-Reaktor", en: "Magmus Reactor", color: "rot", prereq: "RR",
      text: "Deine Schiffe dürfen in Supernovae einfliegen. Nachdem deine Einheiten Produktion in einem System mit Kriegssonne oder angrenzend an eine Supernova genutzt haben, erhältst du 1 Handelsware.",
      codex: "Codex I (Ω): Statt der Handelsware hat jede Supernova mit mindestens 1 deiner Einheiten Produktion 5, als wäre sie eine deiner Einheiten." }
  ],
  leaders: {
    agents: [{ en: "Umbat", text: "Materialaktion: Erschöpfe die Karte und wähle einen Spieler. Er darf in einem System mit einer seiner Kriegssonnen oder seinem Flaggschiff bis zu 2 Einheiten mit Kosten von höchstens 4 produzieren." }],
    commander: { en: "Magmus", unlock: "Eine Kriegssonne produzieren.",
      text: "Nachdem du einen Marker aus deinem Strategiepool ausgegeben hast, darfst du 1 Handelsware erhalten." },
    hero: { en: "Adjudicator Ba'al", text: "Nachdem du eine Kriegssonne in ein Nicht-Heimat-System außer Mecatol Rex bewegt hast, darfst du dort alle fremden Einheiten zerstören und die Systemtafel durch die Muaat-Supernova ersetzen. Dann werden diese Karte und die Planetenkarten der ersetzten Tafel vernichtet." }
  },
  promissory: { en: "Fires of the Gashlai", text: "Materialaktion: Lege 1 Marker aus dem Flottenpool des Muaat-Spielers in dessen Nachschub zurück und erhalte deine Kriegssonnen-Aufwertung. Danach geht die Karte an den Muaat-Spieler zurück." },
  play: "Startet mit einer Kriegssonne und lässt um sie herum per Star Forge Jäger und Zerstörer entstehen."
},

{ id: "naalu", de: "Das Naalu-Kollektiv", en: "The Naalu Collective", src: "base", short: "Naalu",
  complexity: 2, commodities: 3, homeTile: "9",
  home: [{ name: "Maaluuk", res: 0, inf: 2 }, { name: "Druaa", res: 3, inf: 1 }],
  start: { units: "1 Träger, 1 Kreuzer, 1 Zerstörer, 3 Jäger, 4 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Sarween-Werkzeuge", "Neurostimulator"] },
  abilities: [
    { en: "Telepathic", text: "Am Ende der Strategiephase legst du den „0“-Marker der Naalu auf deine Strategiekarte und bist damit Erster in der Initiativreihenfolge." },
    { de: "Hellsicht", en: "Foresight", text: "Nachdem ein anderer Spieler Schiffe in ein System mit deinen Schiffen bewegt hat, darfst du 1 Marker aus deinem Strategiepool in ein angrenzendes System ohne fremde Schiffe legen und deine Schiffe aus dem aktiven System dorthin ziehen." }
  ],
  flagship: { de: "Matriarchin", en: "Matriarch", cost: 8, combat: "9 (×2)", move: 1, capacity: 6,
    text: "Schadensresistenz. Bei einem Einmarsch in diesem System darfst du Jäger wie Bodentruppen auf Planeten entsenden. Nach dem Kampf kehren sie in den Weltraumbereich zurück." },
  mech: { en: "Iconoclast", cost: 2, combat: "6",
    text: "Schadensresistenz. Im Kampf gegen einen Gegner mit mindestens 1 Reliktfragment erhält er +2 auf seine Kampfwürfe.",
    codex: "Codex III (Ω): Statt des Bonus dürfen andere Spieler in diesem System keine Jägerabwehr gegen deine Einheiten einsetzen." },
  units: [
    { en: "Hybrid Crystal Fighter I", replaces: "Jäger", cost: "1 (×2)", combat: "8", move: "–", capacity: "–",
      text: "Jäger mit Kampfwert 8 statt 9.",
      upgrade: { en: "Hybrid Crystal Fighter II", prereq: "GB", cost: "1 (×2)", combat: "7", move: 2, capacity: "–",
        text: "Bewegt sich ohne Transport. Jäger über der Kapazität deiner Schiffe zählen nur je als halbes Schiff gegen deinen Flottenpool." } }
  ],
  techs: [
    { en: "Neuroglaive", color: "gruen", prereq: "GGG",
      text: "Nachdem ein anderer Spieler ein System mit mindestens 1 deiner Schiffe aktiviert hat, muss er 1 Marker aus seinem Flottenpool in seinen Nachschub zurücklegen." },
    { en: "Hybrid Crystal Fighter II", color: "einheit", prereq: "GB",
      text: "Aufwertung deiner Jäger auf Kampfwert 7 und Bewegung 2 ohne Transport. Überzählige Jäger zählen nur halb gegen den Flottenpool." }
  ],
  leaders: {
    agents: [{ en: "Z'eu", text: "Nachdem eine Agenda aufgedeckt wurde, darfst du die Karte erschöpfen und dir die oberste Karte des Agendastapels ansehen. Diese Karte darfst du danach 1 anderen Spieler zeigen.",
      codex: "Codex III (Ω): Materialaktion, Karte erschöpfen und einen Spieler wählen. Er darf eine Taktikaktion in einem Nicht-Heimat-System durchführen, ohne dort einen Kommandomarker zu platzieren. Das System gilt trotzdem als aktiviert." }],
    commander: { en: "M'aban", unlock: "12 Jäger auf dem Spielplan.",
      text: "Wenn du produzierst, darfst du 1 zusätzlichen Jäger zu seinen normalen Kosten produzieren, der nicht gegen dein Produktionslimit zählt.",
      codex: "Codex III (Ω): Freischalten mit Bodentruppen im oder angrenzend an das Mecatol-Rex-System. Du darfst jederzeit die Vertragskarten deiner Nachbarn sowie die oberste und unterste Karte des Agendastapels ansehen." },
    hero: { en: "The Oracle", text: "Am Ende der Statusphase darfst du jeden anderen Spieler zwingen, dir 1 Vertragskarte aus seiner Hand zu geben. Tust du das, wird die Karte vernichtet." }
  },
  promissory: { de: "Die Gabe der Hellsicht", en: "Gift of Prescience", text: "Am Ende der Strategiephase legst du die Karte offen aus und den „0“-Marker der Naalu auf deine Strategiekarte, sodass du Erster in der Initiativreihenfolge bist. Die Naalu können Telepathic in dieser Runde nicht nutzen und erhalten die Karte am Ende der Statusphase zurück." },
  play: "Handelt fast immer zuerst und weicht Angriffen mit Hellsicht geschickt aus."
},

{ id: "nekro", de: "Das Nekro-Virus", en: "The Nekro Virus", src: "base", short: "Nekro",
  complexity: 3, commodities: 3, homeTile: "8",
  home: [{ name: "Mordai II", res: 4, inf: 0 }],
  start: { units: "1 Schlachtschiff, 1 Träger, 1 Kreuzer, 2 Jäger, 2 Infanterie, 1 Raumwerft", tech: ["Dacxive Animatoren", "Valefar-Assimilator X", "Valefar-Assimilator Y"] },
  abilities: [
    { en: "Galactic Threat", text: "Du darfst nicht über Agenden abstimmen. Einmal pro Agendaphase darfst du nach dem Aufdecken einer Agenda eine Prognose zum Ergebnis abgeben und erhältst bei einem Treffer 1 Technologie eines Spielers, der so abgestimmt hat." },
    { en: "Technological Singularity", text: "Einmal pro Kampf darfst du, nachdem eine gegnerische Einheit zerstört wurde, 1 Technologie dieses Gegners erhalten." },
    { en: "Propagation", text: "Du kannst keine Technologien erforschen. Wann immer du forschen würdest, erhältst du stattdessen 3 Kommandomarker." }
  ],
  flagship: { de: "Alastor", en: "The Alastor", cost: 8, combat: "9 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Zu Beginn eines Raumkampfs wählst du beliebig viele deiner Bodentruppen in diesem System, die wie Schiffe am Kampf teilnehmen." },
  mech: { en: "Mordred", cost: 2, combat: "6",
    text: "Schadensresistenz. Im Kampf gegen einen Gegner, auf dessen Technologien ein Assimilatormarker „X“ oder „Y“ liegt, erhält er +2 auf seine Kampfwürfe." },
  techs: [
    { de: "Valefar-Assimilator X", en: "Valefar Assimilator X", color: "keine", prereq: "–",
      text: "Würdest du per Fraktionsfähigkeit eine fremde Technologie erhalten, darfst du stattdessen den Marker „X“ auf eine Fraktionstechnologie dieses Spielers legen. Solange er dort liegt, hat diese Karte deren Text. Pro Technologie ist nur 1 Assimilatormarker erlaubt." },
    { de: "Valefar-Assimilator Y", en: "Valefar Assimilator Y", color: "keine", prereq: "–",
      text: "Wie Assimilator X, nur mit dem Marker „Y“. So kannst du gleichzeitig 2 fremde Fraktionstechnologien kopieren." }
  ],
  leaders: {
    agents: [{ en: "Nekro Malleon", text: "Während der Aktionsphase darfst du die Karte erschöpfen und einen Spieler wählen. Er darf 1 Aktionskarte ablegen oder 1 Kommandomarker von seinem Kommandobogen ausgeben, um 2 Handelswaren zu erhalten." }],
    commander: { en: "Nekro Acidos", unlock: "3 Technologien besitzen. Ein Valefar-Assimilator zählt nur, wenn sein Marker auf einer Technologie liegt.",
      text: "Nachdem du eine Technologie erhalten hast, darfst du 1 Aktionskarte ziehen." },
    hero: { en: "UNIT.DSGN.FLAYESH", text: "Materialaktion: Zerstöre alle fremden Einheiten auf einem Planeten mit Technologie-Spezialisierung in einem System mit deinen Einheiten. Du erhältst Handelswaren in Höhe seiner Ressourcen plus Einfluss und 1 Technologie in der Farbe der Spezialisierung, dann wird die Karte vernichtet." }
  },
  promissory: { en: "Antivirus", text: "Zu Beginn eines Kampfes legst du die Karte offen aus. Solange sie dort liegt, darf das Nekro-Virus Technological Singularity nicht gegen dich nutzen. Aktivierst du ein System mit Nekro-Einheiten, geht sie zurück." },
  play: "Forscht nicht selbst, sondern erbeutet Technologien im Kampf und durch richtige Prognosen in der Agendaphase."
},

{ id: "saar", de: "Der Clan der Zaar", en: "The Clan of Saar", src: "base", short: "Zaar",
  complexity: 2, commodities: 3, homeTile: "11",
  home: [{ name: "Ragh", res: 2, inf: 1 }, { name: "Lisis II", res: 1, inf: 0 }],
  start: { units: "2 Träger, 1 Kreuzer, 2 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Antimass Deflectors"] },
  abilities: [
    { de: "Resteverwertung", en: "Scavenge", text: "Nachdem du die Kontrolle über einen Planeten übernommen hast, erhältst du 1 Handelsware." },
    { en: "Nomadic", text: "Du darfst Aufträge auch dann werten, wenn du die Planeten deines Heimat-Systems nicht kontrollierst." }
  ],
  flagship: { en: "Son of Ragh", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz, Jägerabwehr 6 (×4)." },
  mech: { en: "Scavenger Zeta", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Nachdem du die Kontrolle über einen Planeten übernommen hast, darfst du 1 Handelsware ausgeben, um dort 1 Mech zu platzieren." },
  units: [
    { de: "Schwebefabrik I", en: "Floating Factory I", replaces: "Raumwerft", cost: "–", combat: "–", move: 1, capacity: 4,
      text: "Produktion 5. Steht im Weltraumbereich statt auf einem Planeten und bewegt sich und zieht sich zurück wie ein Schiff. Wird sie blockiert, wird sie zerstört.",
      upgrade: { de: "Schwebefabrik II", en: "Floating Factory II", prereq: "YY", cost: "–", combat: "–", move: 2, capacity: 5,
        text: "Produktion 7. Sonst wie Stufe I, also im Weltraumbereich, beweglich wie ein Schiff und bei Blockade zerstört." } }
  ],
  techs: [
    { de: "Schwebefabrik II", en: "Floating Factory II", color: "einheit", prereq: "YY",
      text: "Aufwertung deiner Schwebefabriken auf Produktion 7, Bewegung 2 und Kapazität 5." },
    { de: "Chaosforschung", en: "Chaos Mapping", color: "blau", prereq: "B",
      text: "Andere Spieler dürfen Asteroidenfelder mit deinen Schiffen nicht aktivieren. Zu Beginn jedes deiner Züge in der Aktionsphase darfst du in einem System mit einer deiner Einheiten mit Produktion 1 Einheit produzieren." }
  ],
  leaders: {
    agents: [{ en: "Captain Mendosa", text: "Wenn ein Spieler ein System aktiviert, darfst du die Karte erschöpfen. Ein Schiff dieses Spielers erhält dann den höchsten Bewegungswert, den ein Schiff auf dem Spielplan hat." }],
    commander: { en: "Rowl Sarrig", unlock: "3 Raumwerften auf dem Spielplan.",
      text: "Produzierst du Jäger oder Infanterie, darfst du sie bei beliebigen deiner nicht blockierten Raumwerften platzieren." },
    hero: { en: "Gurno Aggero", text: "Materialaktion: Wähle 1 System, das an eine deiner Raumwerften angrenzt, und zerstöre dort alle fremde Infanterie und alle fremden Jäger. Danach wird die Karte vernichtet." }
  },
  promissory: { en: "Ragh's Call", text: "Nachdem du Einheiten zur Landung auf einem Planeten entsandt hast, nimmst du alle Bodentruppen des Zaar-Spielers von dort und setzt sie auf einen Planeten, den er kontrolliert. Danach geht die Karte an ihn zurück." },
  play: "Heimatlose Plünderer, die mit beweglichen Schwebefabriken dorthin ziehen, wo gerade Beute lockt."
},

{ id: "sardakk", de: "Die Sardakk N’orr", en: "Sardakk N'orr", src: "base", short: "Sardakk",
  complexity: 2, commodities: 3, homeTile: "13",
  home: [{ name: "Quinarra", res: 3, inf: 1 }, { name: "Tren'lak", res: 1, inf: 0 }],
  start: { units: "2 Träger, 1 Kreuzer, 5 Infanterie, 1 PVS, 1 Raumwerft", tech: [] },
  abilities: [
    { en: "Unrelenting", text: "Alle Kampfwürfe deiner Einheiten erhalten +1." }
  ],
  flagship: { en: "C'morran N'orr", cost: 8, combat: "6 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Deine anderen Schiffe in diesem System erhalten +1 auf ihre Kampfwürfe." },
  mech: { en: "Valkyrie Exoskeleton", cost: 2, combat: "6",
    text: "Schadensresistenz. Nachdem er im Bodenkampf Schadensresistenz genutzt hat, erzeugt er 1 Treffer gegen die gegnerischen Bodentruppen auf diesem Planeten." },
  units: [
    { de: "Exo-Triere I", en: "Exotrireme I", replaces: "Schlachtschiff", cost: 4, combat: "5", move: 1, capacity: 1,
      text: "Schadensresistenz, Bombardement 4 (×2).",
      upgrade: { de: "Exo-Triere II", en: "Exotrireme II", prereq: "BBY", cost: 4, combat: "5", move: 2, capacity: 1,
        text: "Schadensresistenz, Bombardement 4 (×2). Immun gegen „Direkter Treffer“. Nach einer Raumkampfrunde darfst du sie zerstören, um bis zu 2 Schiffe in diesem System zu zerstören." } }
  ],
  techs: [
    { de: "Exo-Triere II", en: "Exotrireme II", color: "einheit", prereq: "BBY",
      text: "Aufwertung deiner Schlachtschiffe auf Bewegung 2, immun gegen „Direkter Treffer“ und nach einer Raumkampfrunde opferbar, um bis zu 2 Schiffe zu zerstören." },
    { en: "Valkyrie Particle Weave", color: "rot", prereq: "RR",
      text: "Erzielt dein Gegner in einer Bodenkampfrunde mindestens 1 Treffer, erzeugst du nach den Kampfwürfen 1 zusätzlichen Treffer." }
  ],
  leaders: {
    agents: [{ en: "T'ro", text: "Am Ende der Taktikaktion eines Spielers darfst du die Karte erschöpfen. Er darf dann 2 Infanterie aus seinem Nachschub auf einen seiner Planeten im aktiven System setzen." }],
    commander: { en: "G'hom Sek'kus", unlock: "5 Planeten außerhalb deines Heimat-Systems kontrollieren.",
      text: "Im Schritt Bodentruppen entsenden darfst du von jedem Planeten im aktiven System und in angrenzenden Systemen ohne eigenen Kommandomarker bis zu 1 Bodentruppe entsenden." },
    hero: { en: "Sh'val, Harbinger", text: "Nachdem du Schiffe ins aktive System bewegt hast, darfst du direkt zum Schritt Bodentruppen entsenden springen. Nach dem Entsenden wird die Karte vernichtet und alle deine Schiffe im aktiven System kommen in deinen Nachschub zurück." }
  },
  promissory: { en: "Tekklar Legion", text: "Zu Beginn eines Kampfes bei einem Einmarsch erhalten deine Einheiten in diesem Kampf +1 auf ihre Kampfwürfe. Ist der Gegner der N'orr-Spieler, erhalten seine Einheiten zusätzlich −1. Danach geht die Karte an den N'orr-Spieler zurück." },
  play: "Aggressive Kriegerfraktion ohne Starttechnologie, deren Bonus auf alle Kampfwürfe frühe Angriffe lohnend macht."
},

{ id: "sol", de: "Die Sol-Föderation", en: "The Federation of Sol", src: "base", short: "Sol",
  complexity: 1, commodities: 4, homeTile: "1",
  home: [{ name: "Jord", res: 4, inf: 2 }],
  start: { units: "2 Träger, 1 Zerstörer, 3 Jäger, 5 Infanterie, 1 Raumwerft", tech: ["Antimass Deflectors", "Neurostimulator"] },
  abilities: [
    { en: "Orbital Drop", text: "Materialaktion: Gib 1 Marker aus deinem Strategiepool aus, um 2 Infanterie aus deinem Nachschub auf 1 Planeten zu setzen, den du kontrollierst." },
    { en: "Versatile", text: "Wenn du in der Statusphase Kommandomarker erhältst, bekommst du 1 zusätzlichen." }
  ],
  flagship: { en: "Genesis", cost: 8, combat: "5 (×2)", move: 1, capacity: 12,
    text: "Schadensresistenz. Am Ende der Statusphase setzt du 1 Infanterie aus deinem Nachschub in den Weltraumbereich seines Systems." },
  mech: { en: "ZS Thunderbolt M2", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Nachdem du Orbital Drop genutzt hast, darfst du 3 Ressourcen ausgeben, um 1 Mech auf denselben Planeten zu setzen." },
  units: [
    { en: "Spec Ops I", replaces: "Infanterie", cost: "1 (×2)", combat: "7", move: "–", capacity: "–",
      text: "Infanterie mit Kampfwert 7 statt 8.",
      upgrade: { en: "Spec Ops II", prereq: "GG", cost: "1 (×2)", combat: "6", move: "–", capacity: "–",
        text: "Wird die Einheit zerstört, wirfst du 1 Würfel. Bei 5 oder mehr kommt sie auf diese Karte und zu Beginn deines nächsten Zuges auf einen eigenen Planeten in deinem Heimat-System." } },
    { en: "Advanced Carrier I", replaces: "Träger", cost: 3, combat: "9", move: 1, capacity: 6,
      text: "Träger mit Kapazität 6 statt 4.",
      upgrade: { en: "Advanced Carrier II", prereq: "BB", cost: 3, combat: "9", move: 2, capacity: 8,
        text: "Schadensresistenz." } }
  ],
  techs: [
    { en: "Spec Ops II", color: "einheit", prereq: "GG",
      text: "Aufwertung deiner Infanterie auf Kampfwert 6. Zerstörte Einheiten kehren bei einer 5 oder mehr ins Heimat-System zurück." },
    { en: "Advanced Carrier II", color: "einheit", prereq: "BB",
      text: "Aufwertung deiner Träger auf Bewegung 2, Kapazität 8 und Schadensresistenz." }
  ],
  leaders: {
    agents: [{ en: "Evelyn DeLouis", text: "Zu Beginn einer Bodenkampfrunde darfst du die Karte erschöpfen und 1 Bodentruppe im aktiven System wählen. Sie wirft in dieser Runde 1 zusätzlichen Würfel." }],
    commander: { en: "Claire Gibson", unlock: "Planeten mit zusammen mindestens 12 Ressourcen kontrollieren.",
      text: "Zu Beginn eines Bodenkampfs auf einem Planeten, den du kontrollierst, darfst du 1 Infanterie aus deinem Nachschub dorthin setzen." },
    hero: { en: "Jace X, 4th Air Legion", text: "Materialaktion: Nimm alle deine Kommandomarker vom Spielplan zurück in deinen Nachschub. Danach wird die Karte vernichtet." }
  },
  promissory: { en: "Military Support", text: "Zu Beginn des Zuges des Sol-Spielers legst du, falls möglich, 1 Marker aus seinem Strategiepool in seinen Nachschub zurück. Dann darfst du 2 Infanterie aus deinem Nachschub auf einen deiner Planeten setzen und gibst die Karte an den Sol-Spieler zurück." },
  play: "Einsteigerfreundlicher Allrounder mit vielen Kommandomarkern, großen Trägern und zäher Infanterie."
},

{ id: "winnu", de: "Die Winnu", en: "The Winnu", src: "base", short: "Winnu",
  complexity: 2, commodities: 3, homeTile: "7",
  home: [{ name: "Winnu", res: 3, inf: 4 }],
  start: { units: "1 Träger, 1 Kreuzer, 2 Jäger, 2 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Wahl: 1 Technologie ohne Voraussetzungen"] },
  abilities: [
    { en: "Blood Ties", text: "Um den Hütermarker von Mecatol Rex zu entfernen, musst du keinen Einfluss ausgeben." },
    { en: "Reclamation", text: "Nachdem du eine Taktikaktion abgehandelt hast, in der du die Kontrolle über Mecatol Rex übernommen hast, darfst du 1 PVS und 1 Raumwerft aus deinem Nachschub auf Mecatol Rex setzen." }
  ],
  flagship: { de: "Salai Sai Corian", en: "Salai Sai Corian", cost: 8, combat: "7 (×X)", move: 1, capacity: 3,
    text: "Schadensresistenz. Wirft pro Kampfwurf so viele Würfel (Treffer bei 7), wie der Gegner Nicht-Jäger-Schiffe in diesem System hat." },
  mech: { en: "Reclaimer", cost: 2, combat: "6",
    text: "Schadensresistenz. Nachdem du eine Taktikaktion abgehandelt hast, in der du die Kontrolle über diesen Planeten übernommen hast, darfst du 1 PVS oder 1 Raumwerft aus deinem Nachschub darauf setzen." },
  techs: [
    { de: "Lazaxianische Raumfaltung", en: "Lazax Gate Folding", color: "blau", prereq: "BB",
      text: "Kontrollierst du Mecatol Rex nicht, gilt sein System während deiner Taktikaktionen so, als hätte es ein Alpha- und ein Beta-Wurmloch. Kontrollierst du ihn, darfst du per Materialaktion die Karte erschöpfen und 1 Infanterie aus deinem Nachschub auf Mecatol Rex setzen." },
    { de: "Hegemoniale Handelsstrategie", en: "Hegemonic Trade Policy", color: "gelb", prereq: "YY",
      text: "Nutzen deine Einheiten Produktion, darfst du die Karte erschöpfen. Während dieser Produktion vertauschst du bis zum Ende deines Zuges den Ressourcen- und den Einflusswert eines Planeten, den du kontrollierst." }
  ],
  leaders: {
    agents: [{ en: "Berekar Berekon", text: "Wenn Einheiten eines Spielers Produktion nutzen, darfst du die Karte erschöpfen, um die Gesamtkosten der produzierten Einheiten um 2 zu senken." }],
    commander: { en: "Rickar Rickani", unlock: "Mecatol Rex kontrollieren oder im Mecatol-Rex-System einen Kampf beginnen.",
      text: "Im Kampf erhalten deine Einheiten +2 auf ihre Kampfwürfe im Mecatol-Rex-System, in deinem Heimat-System und in jedem System mit einem legendären Planeten." },
    hero: { en: "Mathis Mathinus", text: "Materialaktion: Handle die Primärfähigkeit einer beliebigen Strategiekarte ab. Danach dürfen beliebige andere Spieler deiner Wahl deren Sekundärfähigkeit abhandeln, und die Karte wird vernichtet." }
  },
  promissory: { de: "Duldung", en: "Acquiescence", text: "Am Ende der Strategiephase tauschst du 1 deiner Strategiekarten gegen 1 Strategiekarte, die der Winnu-Spieler gewählt hat. Danach geht die Karte an ihn zurück.",
    codex: "Codex I (Ω): Handelt der Winnu-Spieler eine Strategieaktion ab, musst du für deren Sekundärfähigkeit keinen Kommandomarker ausgeben oder platzieren. Danach geht die Karte an ihn zurück." },
  play: "Politische Fraktion mit Blick auf Mecatol Rex, die vom Zentrum aus Einfluss und Punkte sammelt."
},

{ id: "xxcha", de: "Das Xxcha-Königreich", en: "The Xxcha Kingdom", src: "base", short: "Xxcha",
  complexity: 1, commodities: 4, homeTile: "14",
  home: [{ name: "Archon Ren", res: 2, inf: 3 }, { name: "Archon Tau", res: 1, inf: 1 }],
  start: { units: "1 Träger, 2 Kreuzer, 3 Jäger, 4 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Graviton-Lasersystem"] },
  abilities: [
    { de: "Friedensabkommen", en: "Peace Accords", text: "Nachdem du die Primär- oder Sekundärfähigkeit der Strategiekarte Diplomatie abgehandelt hast, darfst du die Kontrolle über 1 Planeten ohne Einheiten übernehmen, der in einem System angrenzend an einen deiner Planeten liegt. Mecatol Rex ist ausgenommen." },
    { en: "Quash", text: "Wird eine Agenda aufgedeckt, darfst du 1 Marker aus deinem Strategiepool ausgeben, um sie abzulegen und die nächste aufzudecken. Abgestimmt wird dann über die neue Agenda." }
  ],
  flagship: { en: "Loncara Ssodu", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz, Weltraumkanone 5 (×3). Seine Weltraumkanone darf auch auf Schiffe in angrenzenden Systemen feuern." },
  mech: { en: "Indomitus", cost: 2, combat: "6",
    text: "Schadensresistenz, Weltraumkanone 8. Seine Weltraumkanone darf auch auf Schiffe in angrenzenden Systemen feuern." },
  techs: [
    { en: "Instinct Training", color: "gruen", prereq: "G",
      text: "Spielt ein anderer Spieler eine Aktionskarte, darfst du diese Karte erschöpfen und 1 Marker aus deinem Strategiepool ausgeben, um die Aktionskarte zu negieren." },
    { en: "Nullification Field", color: "gelb", prereq: "YY",
      text: "Nachdem ein anderer Spieler ein System mit mindestens 1 deiner Schiffe aktiviert hat, darfst du die Karte erschöpfen und 1 Marker aus deinem Strategiepool ausgeben. Sein Zug endet dann sofort." }
  ],
  leaders: {
    agents: [{ en: "Ggrocuto Rinn", text: "Materialaktion: Erschöpfe die Karte, um einen beliebigen Planeten spielbereit zu machen. Liegt er in einem System angrenzend an einen deiner Planeten, darfst du außerdem 1 Infanterie von ihm in den Nachschub ihres Besitzers zurücklegen." }],
    commander: { en: "Elder Qanoj", unlock: "Planeten mit zusammen mindestens 12 Einfluss kontrollieren.",
      text: "Jeder Planet, den du zum Abstimmen erschöpfst, bringt 1 zusätzliche Stimme. Spieleffekte können dich nicht vom Abstimmen abhalten." },
    hero: { en: "Xxekir Grom", text: "Materialaktion: Du darfst 1 Gesetz aus dem Spiel ablegen. Sieh dir dann die obersten 5 Agenden an, decke 2 davon auf und handle jede so ab, als hättest du 1 Stimme für ein Ergebnis deiner Wahl abgegeben, der Rest wird abgelegt. Andere Spieler dürfen während dieser Aktion keine Fähigkeiten abhandeln, danach wird die Karte vernichtet.",
      codex: "Codex III (Ω): Erschöpfst du Planeten, addierst du jeweils Ressourcen und Einfluss und darfst die Summe sowohl als Ressourcen als auch als Einfluss verwenden." }
  },
  promissory: { en: "Political Favor", text: "Wird eine Agenda aufgedeckt, legst du 1 Marker aus dem Strategiepool des Xxcha-Spielers in dessen Nachschub zurück. Dann wird die Agenda abgelegt und über die nächste abgestimmt, und die Karte geht an den Xxcha-Spieler zurück." },
  play: "Defensive Diplomaten, die sich mit Weltraumkanonen schützen und die Agendaphase lenken."
},

{ id: "yin", de: "Die Yin-Bruderschaft", en: "The Yin Brotherhood", src: "base", short: "Yin",
  complexity: 1, commodities: 2, homeTile: "3",
  home: [{ name: "Darien", res: 4, inf: 4 }],
  start: { units: "2 Träger, 1 Zerstörer, 4 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Sarween-Werkzeuge"] },
  abilities: [
    { en: "Indoctrination", text: "Zu Beginn eines Bodenkampfs darfst du 2 Einfluss ausgeben, um 1 teilnehmende gegnerische Infanterie durch 1 Infanterie aus deinem Nachschub zu ersetzen." },
    { de: "Fanatismus", en: "Devotion", text: "Nach jeder Raumkampfrunde darfst du 1 deiner Kreuzer oder Zerstörer im aktiven System zerstören, um 1 Treffer zu erzeugen und einem gegnerischen Schiff dort zuzuweisen." }
  ],
  flagship: { en: "Van Hauge", cost: 8, combat: "9 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Wird es zerstört, werden alle Schiffe in diesem System zerstört." },
  mech: { en: "Moyin's Ashes", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Nutzt du Indoctrination, darfst du 1 weiteren Einfluss ausgeben, um die gegnerische Einheit durch 1 Mech statt durch Infanterie zu ersetzen." },
  techs: [
    { de: "Yin-Zentrifuge", en: "Yin Spinner", color: "gruen", prereq: "GG",
      text: "Nachdem 1 oder mehrere deiner Einheiten Produktion genutzt haben, setzt du 1 Infanterie aus deinem Nachschub auf einen deiner Planeten in diesem System.",
      codex: "Codex I (Ω): Nach dem Produzieren setzt du bis zu 2 Infanterie auf 1 beliebigen eigenen Planeten oder in 1 beliebigen Weltraumbereich mit mindestens 1 deiner Schiffe." },
    { en: "Impulse Core", color: "gelb", prereq: "YY",
      text: "Zu Beginn eines Raumkampfs darfst du 1 deiner Kreuzer oder Zerstörer im aktiven System zerstören, um 1 Treffer zu erzeugen. Der Gegner muss ihn nach Möglichkeit einem Nicht-Jäger-Schiff zuweisen." }
  ],
  leaders: {
    agents: [{ de: "Bruder Milor", en: "Brother Milor", text: "Nachdem ein Zerstörer oder Kreuzer eines Spielers zerstört wurde, darfst du die Karte erschöpfen. Der Spieler darf dann bis zu 2 Jäger aus seinem Nachschub in das System dieser Einheit setzen.",
      codex: "Codex III (Ω): Nachdem eine Einheit eines Spielers zerstört wurde, darfst du die Karte erschöpfen. War es ein Schiff, darf der Spieler 2 Jäger in dieses System setzen, war es eine Bodentruppe, 2 Infanterie auf diesen Planeten." }],
    commander: { de: "Bruder Omar", en: "Brother Omar", unlock: "Die Fraktionsfähigkeit Indoctrination nutzen.",
      text: "Die Karte erfüllt eine grüne Technologie-Voraussetzung. Wenn du produzierst, darfst du 1 zusätzliche Infanterie zu ihren normalen Kosten produzieren, die nicht gegen dein Produktionslimit zählt.",
      codex: "Codex III (Ω): Freischalten durch eine beliebige Fraktionsfähigkeit. Erfüllt weiter eine grüne Voraussetzung, und erforschst du eine Technologie, die ein anderer Spieler besitzt, darfst du 1 Infanterie zurücklegen, um ihre Voraussetzungen zu ignorieren." },
    hero: { de: "Dannel von der 10.", en: "Dannel of the Tenth", text: "Materialaktion: Für jeden Planeten mit deiner Infanterie machst du ihn entweder spielbereit oder setzt dort so viel Infanterie aus deinem Nachschub hinzu, wie bereits darauf steht. Danach wird die Karte vernichtet.",
      codex: "Codex III (Ω): Materialaktion, entsende bis zu 3 Infanterie aus deinem Nachschub auf beliebige Nicht-Heimat-Planeten und handle dort Einmärsche ab. Weltraumkanonen dürfen nicht auf diese Einheiten feuern. Danach wird die Karte vernichtet." }
  },
  promissory: { de: "Graubrand-Mutagen", en: "Greyfire Mutagen", text: "Nachdem ein System aktiviert wurde, darf der Yin-Spieler während dieser Taktikaktion keine Fraktionsfähigkeiten oder Fraktionstechnologien verwenden. Danach geht die Karte an ihn zurück.",
    codex: "Codex I (Ω): Zu Beginn eines Bodenkampfs gegen 2 oder mehr Bodentruppen, die nicht dem Yin-Spieler gehören, ersetzt du 1 gegnerische Infanterie durch 1 Infanterie aus deinem Nachschub. Danach geht die Karte an den Yin-Spieler zurück." },
  play: "Opferbereite Fanatiker, die eigene Schiffe für Treffer hergeben und gegnerische Infanterie bekehren."
},

{ id: "yssaril", de: "Die Yssaril-Stämme", en: "The Yssaril Tribes", src: "base", short: "Yssaril",
  complexity: 1, commodities: 3, homeTile: "15",
  home: [{ name: "Retillion", res: 2, inf: 3 }, { name: "Shalloq", res: 1, inf: 2 }],
  start: { units: "2 Träger, 1 Kreuzer, 2 Jäger, 5 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Neurostimulator"] },
  abilities: [
    { en: "Stall Tactics", text: "Materialaktion: Lege 1 Aktionskarte aus deiner Hand ab. So verbrauchst du einen Zug, ohne zu passen." },
    { de: "Intrigant", en: "Scheming", text: "Wenn du Aktionskarten ziehst, ziehst du 1 zusätzliche und legst danach 1 Aktionskarte deiner Wahl aus deiner Hand ab." },
    { en: "Crafty", text: "Du darfst beliebig viele Aktionskarten auf der Hand haben. Spieleffekte können daran nichts ändern." }
  ],
  flagship: { en: "Y'sia Y'ssrila", cost: 8, combat: "5 (×2)", move: 2, capacity: 3,
    text: "Schadensresistenz. Darf sich durch Systeme mit fremden Schiffen hindurchbewegen." },
  mech: { en: "Blackshade Infiltrator", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Nachdem du Stall Tactics genutzt hast, darfst du 1 Mech auf einen deiner Planeten setzen." },
  techs: [
    { en: "Transparasteel Plating", color: "gruen", prereq: "G",
      text: "Während deines Zuges in der Aktionsphase dürfen Spieler, die bereits gepasst haben, keine Aktionskarten spielen." },
    { en: "Mageon Implants", color: "gruen", prereq: "GGG",
      text: "Materialaktion: Erschöpfe die Karte, sieh dir die Aktionskarten eines anderen Spielers an und nimm 1 davon auf deine Hand." }
  ],
  leaders: {
    agents: [{ en: "Ssruu", text: "Die Karte hat jederzeit die Fähigkeit jedes Agenten der anderen Spieler, auch wenn dieser Agent erschöpft ist." }],
    commander: { en: "So Ata", unlock: "7 Aktionskarten auf der Hand.",
      text: "Nachdem ein anderer Spieler ein System mit deinen Einheiten aktiviert hat, darfst du dir seine Aktionskarten, seine Vertragskarten oder seine geheimen Aufträge ansehen." },
    hero: { en: "Kyver, Blade and Key", text: "Materialaktion: Jeder andere Spieler zeigt dir 1 Aktionskarte aus seiner Hand. Pro Spieler nimmst du sie oder zwingst ihn, 3 zufällige Aktionskarten abzulegen, danach wird die Karte vernichtet." }
  },
  promissory: { en: "Spy Net", text: "Zu Beginn deines Zuges siehst du dir die Aktionskarten des Yssaril-Spielers an und nimmst 1 davon auf deine Hand. Danach geht die Karte an ihn zurück." },
  play: "Meister der Aktionskarten, die Züge hinauszögern und mit voller Hand im richtigen Moment zuschlagen."
},

{ id: "argent", de: "Die Silberschwingen", en: "The Argent Flight", src: "pok", short: "Silberschwingen",
  complexity: 1, commodities: 3, homeTile: "58",
  home: [{ name: "Valk", res: 2, inf: 0 }, { name: "Avar", res: 1, inf: 1 }, { name: "Ylir", res: 0, inf: 2 }],
  start: { units: "1 Träger, 2 Zerstörer, 2 Jäger, 5 Infanterie, 1 PVS, 1 Raumwerft", tech: ["Wahl: 2 aus Neurostimulator, Sarween-Werkzeuge, Plasmabrenner"] },
  abilities: [
    { en: "Zeal", text: "In der Agendaphase stimmst du immer zuerst ab. Gibst du mindestens 1 Stimme ab, kommt für jeden Spieler in der Partie, dich eingeschlossen, 1 Stimme hinzu." },
    { en: "Raid Formation", text: "Erzielen deine Einheiten mit Jägerabwehr mehr Treffer, als der Gegner Jäger hat, wird für jeden überzähligen Treffer 1 gegnerisches Schiff deiner Wahl mit Schadensresistenz beschädigt." }
  ],
  flagship: { en: "Quetzecoatl", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Andere Spieler können keine Weltraumkanone gegen deine Schiffe in diesem System einsetzen." },
  mech: { en: "Aerie Sentinel", cost: 2, combat: "6",
    text: "Schadensresistenz. Belegt keine Kapazität, wenn er transportiert wird oder in einem Weltraumbereich mit mindestens 1 deiner Schiffe mit Kapazität steht." },
  units: [
    { en: "Strike Wing Alpha I", replaces: "Zerstörer", cost: 1, combat: "8", move: 2, capacity: 1,
      text: "Jägerabwehr 9 (×2).",
      upgrade: { en: "Strike Wing Alpha II", prereq: "RR", cost: 1, combat: "7", move: 2, capacity: 1,
        text: "Jägerabwehr 6 (×3). Jede 9 oder 10 bei der Jägerabwehr zerstört zusätzlich 1 gegnerische Infanterie im Weltraumbereich des aktiven Systems." } }
  ],
  techs: [
    { en: "Aerie Hololattice", color: "gelb", prereq: "Y",
      text: "Andere Spieler dürfen keine Schiffe durch Systeme mit deinen Gebäuden bewegen. Jeder Planet mit mindestens 1 deiner Gebäude hat Produktion 1, als wäre er eine Einheit." },
    { en: "Strike Wing Alpha II", color: "einheit", prereq: "RR",
      text: "Aufwertung deiner Zerstörer auf Kampfwert 7 und Jägerabwehr 6 (×3). Jede 9 oder 10 dabei zerstört zusätzlich Infanterie im Weltraum." }
  ],
  leaders: {
    agents: [{ en: "Trilossa Aun Mirik", text: "Produziert ein Spieler Bodentruppen in einem System, darfst du die Karte erschöpfen. Er darf sie dann auf beliebige seiner Planeten in diesem und in angrenzenden Systemen setzen." }],
    commander: { en: "Trrakan Aun Zulok", unlock: "6 Einheiten mit Jägerabwehr, Weltraumkanone oder Bombardement auf dem Spielplan.",
      text: "Würfeln deine Einheiten für eine Einheitenfähigkeit, darf 1 davon 1 zusätzlichen Würfel werfen." },
    hero: { en: "Mirik Aun Sissiri", text: "Materialaktion: Bewege beliebig viele deiner Schiffe aus beliebigen Systemen in andere Systeme, die 1 deiner Kommandomarker und keine fremden Schiffe enthalten. Danach wird die Karte vernichtet." }
  },
  promissory: { en: "Strike Wing Ambuscade", text: "Würfeln deine Einheiten für eine Einheitenfähigkeit, wirft 1 davon 1 zusätzlichen Würfel. Danach geht die Karte an den Argent-Spieler zurück." },
  play: "Schnelle Zerstörerflotte mit starker Jägerabwehr und großem Gewicht bei Abstimmungen."
},

{ id: "vuilraith", de: "Die Vuil’raith-Verschwörung", en: "The Vuil'raith Cabal", src: "pok", short: "Vuil'raith",
  complexity: 3, commodities: 2, homeTile: "54",
  home: [{ name: "Acheron", res: 4, inf: 0 }],
  start: { units: "1 Schlachtschiff, 1 Träger, 1 Kreuzer, 3 Jäger, 3 Infanterie, 1 Raumwerft", tech: ["Self-Assembly Routines"] },
  abilities: [
    { en: "Devour", text: "Gegnerische Einheiten, die im Kampf zerstört werden und keine Gebäude sind, kaperst du." },
    { en: "Amalgamation", text: "Produzierst du eine Einheit, darfst du 1 gekaperte Einheit desselben Typs zurückgeben und deine Einheit dann ohne Ressourcen produzieren." },
    { en: "Riftmeld", text: "Erforschst du eine Aufwertung, darfst du 1 gekaperte Einheit dieses Typs zurückgeben, um alle Voraussetzungen zu ignorieren." }
  ],
  flagship: { en: "The Terror Between", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz, Bombardement 5. Alle anderen Einheiten außer Gebäuden, die in diesem System zerstört werden, kaperst du, auch deine eigenen." },
  mech: { en: "Reanimator", cost: 2, combat: "6",
    text: "Schadensresistenz. Wird deine Infanterie auf diesem Planeten zerstört, legst du sie auf deinen Fraktionsbogen, wo sie als gekapert gilt." },
  units: [
    { en: "Dimensional Tear I", replaces: "Raumwerft", cost: "–", combat: "–", move: "–", capacity: "–",
      text: "Produktion 5. Ihr System gilt als Gravitationsstrudel, für den deine Schiffe nicht würfeln (Dimensionsriss-Marker darunterlegen). Bis zu 6 Jäger in diesem System belegen keine Kapazität.",
      upgrade: { en: "Dimensional Tear II", prereq: "YY", cost: "–", combat: "–", move: "–", capacity: "–",
        text: "Produktion 7. Sonst wie Stufe I, aber bis zu 12 Jäger belegen keine Kapazität." } }
  ],
  techs: [
    { en: "Dimensional Tear II", color: "einheit", prereq: "YY",
      text: "Aufwertung deiner Raumwerften auf Produktion 7. Bis zu 12 Jäger im System belegen keine Kapazität." },
    { en: "Vortex", color: "rot", prereq: "R",
      text: "Materialaktion: Erschöpfe die Karte und wähle eine Einheit eines anderen Spielers, die kein Gebäude ist, in einem System angrenzend an eine deiner Raumwerften. Kapere 1 Einheit dieses Typs aus seinem Nachschub." }
  ],
  leaders: {
    agents: [{ en: "The Stillness of Stars", text: "Nachdem ein anderer Spieler seine Massenprodukte aufgefüllt hat, darfst du die Karte erschöpfen. Seine Massenprodukte werden zu Handelswaren und du kaperst 1 Einheit aus seinem Nachschub, die höchstens so viel kostet wie sein Massenprodukte-Wert." }],
    commander: { en: "That Which Molds Flesh", unlock: "Einheiten in 3 Gravitationsstrudeln.",
      text: "Produzierst du Jäger oder Infanterie, zählen bis zu 2 davon nicht gegen dein Produktionslimit." },
    hero: { en: "It Feeds on Carrion", text: "Materialaktion: Jeder andere Spieler würfelt für jedes seiner Nicht-Jäger-Schiffe in oder angrenzend an ein System mit Dimensionsriss, bei 1 bis 3 kaperst du das Schiff. Dadurch entfernte Bodentruppen und Jäger kaperst du ebenfalls, danach wird die Karte vernichtet." }
  },
  promissory: { en: "Crucible", text: "Nachdem du ein System aktiviert hast, würfeln deine Schiffe bei dieser Bewegung nicht für Gravitationsstrudel und erhalten beim Verlassen oder Durchqueren eines Strudels zusätzlich +1 Bewegung. Danach geht die Karte an den Vuil‘raith-Spieler zurück." },
  play: "Verschlingt im Kampf zerstörte Einheiten und baut sie über Dimensionsrisse kostenlos wieder auf."
},

{ id: "empyrean", de: "Die Empyrier", en: "The Empyrean", src: "pok", short: "Empyrier",
  complexity: 1, commodities: 4, homeTile: "56",
  home: [{ name: "The Dark", res: 3, inf: 4 }],
  start: { units: "2 Träger, 1 Zerstörer, 2 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Nullpunktenergie-Reaktor"] },
  abilities: [
    { en: "Voidborn", text: "Nebel beeinflussen die Bewegung deiner Schiffe nicht." },
    { en: "Aetherpassage", text: "Nachdem ein Spieler ein System aktiviert hat, darfst du ihm erlauben, seine Schiffe durch Systeme mit deinen Schiffen zu bewegen." },
    { en: "Dark Whispers", text: "Beim Aufbau nimmst du die zusätzliche Empyrier-Vertragskarte. Du hast also 2 fraktionsspezifische Vertragskarten." }
  ],
  flagship: { en: "Dynamo", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Nutzt eine Einheit irgendeines Spielers in diesem oder einem angrenzenden System Schadensresistenz, darfst du danach 2 Einfluss ausgeben, um sie zu reparieren." },
  mech: { en: "Watcher", cost: 2, combat: "6",
    text: "Schadensresistenz. Du darfst ihn aus einem System entfernen, das Einheiten eines anderen Spielers enthält oder an solche angrenzt, um eine Aktionskarte dieses Spielers zu negieren." },
  techs: [
    { en: "Voidwatch", color: "gruen", prereq: "G",
      text: "Nachdem ein Spieler Schiffe in ein System mit deinen Einheiten bewegt hat, muss er dir nach Möglichkeit 1 Vertragskarte aus seiner Hand geben." },
    { en: "Aetherstream", color: "blau", prereq: "BB",
      text: "Nachdem du oder ein Nachbar ein System angrenzend an eine Anomalie aktiviert hat, darfst du allen Schiffen dieses Spielers für diese Taktikaktion +1 Bewegung geben." }
  ],
  leaders: {
    agents: [{ en: "Acamar", text: "Nachdem ein Spieler Schiffe in ein System ohne Planeten bewegt hat, darfst du die Karte erschöpfen. Er erhält dann 1 Kommandomarker." }],
    commander: { en: "Xuange", unlock: "Mit allen anderen Spielern benachbart sein.",
      text: "Nachdem ein anderer Spieler Schiffe in ein System mit einem deiner Kommandomarker bewegt hat, darfst du diesen Marker in deinen Nachschub zurücknehmen." },
    hero: { en: "Conservator Procyon", text: "Materialaktion: Lege in jedes System ohne Planeten, das noch keinen Wilder-Raum-Marker hat, einen solchen Marker. Erkunde dann alle Wilder-Raum-Marker in Systemen mit deinen Schiffen, danach wird die Karte vernichtet." }
  },
  promissory: { en: "Dark Pact / Blood Pact", text: "Zwei Vertragskarten, beide per Materialaktion offen ausgelegt und zurück an die Empyrier, sobald du ein System mit Empyrier-Einheiten aktivierst. Dark Pact: Gibst du den Empyriern so viele Massenprodukte, wie dein Maximum beträgt, erhaltet ihr beide 1 Handelsware. Blood Pact: Stimmt ihr beide für dasselbe Ergebnis, kommen 4 Stimmen dafür hinzu." },
  play: "Bewegliche Entdecker, die Nebel und leeren Raum nutzen und mit zwei Verträgen Bündnisse schmieden."
},

{ id: "mahact", de: "Die Mahactanischen Gen-Hexer", en: "The Mahact Gene-Sorcerers", src: "pok", short: "Mahact",
  complexity: 3, commodities: 3, homeTile: "52",
  home: [{ name: "Ixth", res: 3, inf: 5 }],
  start: { units: "1 Schlachtschiff, 1 Träger, 1 Kreuzer, 2 Jäger, 3 Infanterie, 1 Raumwerft", tech: ["Predictive Intelligence", "Bio-Stims"] },
  abilities: [
    { en: "Edict", text: "Gewinnst du einen Kampf, legst du 1 Kommandomarker aus dem Nachschub des Gegners in deinen Flottenpool, falls dort noch keiner von ihm liegt. Fremde Marker in deinem Flottenpool erhöhen dein Flottenlimit, dürfen aber nicht umverteilt werden." },
    { en: "Imperia", text: "Liegt ein Kommandomarker eines anderen Spielers in deinem Flottenpool, darfst du dessen Commander nutzen, sofern er freigeschaltet ist." },
    { en: "Hubris", text: "Beim Aufbau vernichtest du deine Vertragskarte „Allianz“. Andere Spieler dürfen dir ihre „Allianz“ nicht geben." }
  ],
  flagship: { en: "Arvicon Rex", cost: 8, combat: "5 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Gegen einen Gegner, dessen Kommandomarker nicht in deinem Flottenpool liegt, erhält es +2 auf seine Kampfwürfe." },
  mech: { en: "Starlancer", cost: 2, combat: "6",
    text: "Schadensresistenz. Aktiviert ein Spieler, dessen Kommandomarker in deinem Flottenpool liegt, dieses System, darfst du danach diesen Marker ausgeben, um seinen Zug zu beenden. Er erhält den Marker zurück." },
  units: [
    { en: "Crimson Legionnaire I", replaces: "Infanterie", cost: "1 (×2)", combat: "8", move: "–", capacity: "–",
      text: "Wird die Einheit zerstört, erhältst du 1 Massenprodukt oder wandelst 1 deiner Massenprodukte in eine Handelsware um.",
      upgrade: { en: "Crimson Legionnaire II", prereq: "GG", cost: "1 (×2)", combat: "7", move: "–", capacity: "–",
        text: "Wie Stufe I. Zusätzlich kommt die zerstörte Einheit auf diese Karte und zu Beginn deines nächsten Zuges auf einen eigenen Planeten in deinem Heimat-System." } }
  ],
  techs: [
    { en: "Crimson Legionnaire II", color: "einheit", prereq: "GG",
      text: "Aufwertung deiner Infanterie auf Kampfwert 7. Zerstörte Einheiten bringen 1 Massenprodukt oder eine Umwandlung und kehren immer ins Heimat-System zurück." },
    { en: "Genetic Recombination", color: "gruen", prereq: "G",
      text: "Bevor ein Spieler Stimmen abgibt, darfst du die Karte erschöpfen. Er muss dann mindestens 1 Stimme für ein Ergebnis deiner Wahl abgeben oder 1 Marker aus seinem Flottenpool in seinen Nachschub zurücklegen." }
  ],
  leaders: {
    agents: [{ en: "Jae Mir Kan", text: "Würdest du für die Sekundärfähigkeit einer Strategieaktion einen Kommandomarker ausgeben, darfst du die Karte erschöpfen und stattdessen 1 Kommandomarker des aktiven Spielers vom Spielplan nehmen und verwenden." }],
    commander: { de: "Il Na Viroset", en: "Il Na Viroset", unlock: "2 Kommandomarker anderer Fraktionen in deinem Flottenpool.",
      text: "Bei deinen Taktikaktionen darfst du auch Systeme aktivieren, in denen schon ein eigener Kommandomarker liegt. Dann nimmst du beide Marker in deinen Nachschub zurück und dein Zug endet sofort." },
    hero: { en: "Airo Shir Aur", text: "Materialaktion: Bewege alle Einheiten aus dem Weltraumbereich eines Systems in ein angrenzendes System mit Schiffen eines anderen Spielers. Dort folgt ein Raumkampf ohne Rückzug und ohne Fähigkeiten, die Schiffe bewegen, danach wird die Karte vernichtet." }
  },
  promissory: { en: "Scepter of Dominion", text: "Zu Beginn der Strategiephase wählst du 1 Nicht-Heimat-System mit deinen Einheiten. Jeder andere Spieler mit einem Marker im Flottenpool des Mahact-Spielers legt einen Marker aus seinem Nachschub in dieses System, danach geht die Karte an den Mahact-Spieler zurück." },
  play: "Sammelt die Kommandomarker besiegter Gegner und nutzt damit deren Commander und eine größere Flotte."
},

{ id: "nomad", de: "Der Nomade", en: "The Nomad", src: "pok", short: "Nomade",
  complexity: 1, commodities: 4, homeTile: "53",
  home: [{ name: "Arcturus", res: 4, inf: 4 }],
  start: { units: "1 Flaggschiff, 1 Träger, 1 Zerstörer, 3 Jäger, 4 Infanterie, 1 Raumwerft", tech: ["Sling Relay"] },
  abilities: [
    { de: "Die Firma", en: "The Company", text: "Beim Aufbau legst du die 2 zusätzlichen Nomaden-Agenten neben deinen Fraktionsbogen. Du hast also 3 Agenten." },
    { en: "Future Sight", text: "Nachdem in der Agendaphase ein Ergebnis abgehandelt wurde, für das du gestimmt oder das du prognostiziert hast, erhältst du 1 Handelsware." }
  ],
  flagship: { en: "Memoria I", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz, Jägerabwehr 8 (×3). Gilt als angrenzend an alle Systeme mit mindestens 1 deiner Mechs.",
    upgrade: { en: "Memoria II", prereq: "GBY", cost: 8, combat: "5 (×2)", move: 2, capacity: 6,
      text: "Schadensresistenz, Jägerabwehr 5 (×3). Gilt als angrenzend an alle Systeme mit mindestens 1 deiner Mechs." } },
  mech: { en: "Quantum Manipulator", cost: 2, combat: "6",
    text: "Schadensresistenz. Steht er während eines Kampfes im Weltraumbereich, darfst du seine Schadensresistenz nutzen, um einen Treffer gegen deine Schiffe in diesem System zu negieren." },
  techs: [
    { en: "Memoria II", color: "einheit", prereq: "GBY",
      text: "Aufwertung deines Flaggschiffs auf Kampfwert 5 (×2), Bewegung 2, Kapazität 6 und Jägerabwehr 5 (×3)." },
    { en: "Temporal Command Suite", color: "gelb", prereq: "Y",
      text: "Nachdem der Agent irgendeines Spielers erschöpft wurde, darfst du diese Karte erschöpfen, um ihn wieder spielbereit zu machen. Ist es ein fremder Agent, darfst du mit diesem Spieler eine Transaktion abhandeln." }
  ],
  leaders: {
    agents: [
      { en: "Artuno the Betrayer", text: "Erhältst du Handelswaren aus dem Vorrat, darfst du die Karte erschöpfen und gleich viele Handelswaren auf sie legen. Wird sie wieder spielbereit, erhältst du die Handelswaren auf der Karte." },
      { en: "Field Marshal Mercer", text: "Am Ende des Zuges eines Spielers darfst du die Karte erschöpfen. Er darf dann bis zu 2 seiner Bodentruppen vom Spielplan nehmen und auf seine Planeten im aktiven System setzen." },
      { en: "The Thundarian", text: "Nach dem Schritt Kampfwürfe ausführen darfst du die Karte erschöpfen. Dann werden keine Treffer zugewiesen und der Kampf springt zurück an den Anfang dieses Schritts." }
    ],
    commander: { en: "Navarch Feng", unlock: "1 gewerteter geheimer Auftrag.",
      text: "Du darfst dein Flaggschiff produzieren, ohne Ressourcen auszugeben." },
    hero: { en: "Ahk-Syl Siven", text: "Materialaktion: Lege die Karte neben den Spielplan. In dieser Spielrunde dürfen dein Flaggschiff und die von ihm transportierten Einheiten Systeme mit deinen Kommandomarkern verlassen. Am Ende der Runde wird die Karte vernichtet." }
  },
  promissory: { en: "The Cavalry", text: "Zu Beginn eines Raumkampfs gegen jemand anderen als den Nomaden erhält 1 deiner Nicht-Jäger-Schiffe für diesen Kampf Schadensresistenz, Kampfwert und Jägerabwehr des Nomaden-Flaggschiffs. Nach dem Kampf geht die Karte an den Nomaden zurück." },
  play: "Flexibler Allrounder mit drei Agenten und einem Flaggschiff, das schon zu Beginn auf dem Spielplan steht."
},

{ id: "naazrokha", de: "Die Naaz-Rokha-Allianz", en: "The Naaz-Rokha Alliance", src: "pok", short: "Naaz-Rokha",
  complexity: 1, commodities: 3, homeTile: "57",
  home: [{ name: "Naazir", res: 2, inf: 1 }, { name: "Rokha", res: 1, inf: 2 }],
  start: { units: "2 Träger, 1 Zerstörer, 2 Jäger, 1 Mech, 3 Infanterie, 1 Raumwerft", tech: ["Psychoarchaeology", "AI Development Algorithm"] },
  abilities: [
    { en: "Distant Suns", text: "Erkundest du einen Planeten mit mindestens 1 deiner Mechs, darfst du 1 zusätzliche Karte ziehen. Du handelst 1 davon ab und legst den Rest ab." },
    { en: "Fabrication", text: "Materialaktion: Vernichte 2 deiner Reliktfragmente desselben Typs, um 1 Relikt zu erhalten, oder vernichte 1 Reliktfragment, um 1 Kommandomarker zu erhalten." }
  ],
  flagship: { en: "Visz El Vir", cost: 8, combat: "9 (×2)", move: 1, capacity: 4,
    text: "Schadensresistenz. Deine Mechs in diesem System werfen im Kampf 1 zusätzlichen Würfel." },
  mech: { en: "Eidolon / Z-Grav Eidolon", cost: 2, combat: "6 (×2)",
    text: "Eidolon: Schadensresistenz. Steht er zu Beginn eines Raumkampfs im Weltraumbereich des aktiven Systems, wird die Karte umgedreht. Z-Grav Eidolon: Kampf 8 (×2), gilt im Weltraumbereich des aktiven Systems auch als Schiff und wird am Ende des Raumkampfs zurückgedreht." },
  techs: [
    { en: "Pre-Fab Arcologies", color: "gruen", prereq: "GGG",
      text: "Nachdem du einen Planeten erkundet hast, machst du ihn spielbereit." },
    { en: "Supercharge", color: "rot", prereq: "R",
      text: "Zu Beginn einer Kampfrunde darfst du die Karte erschöpfen. Alle Kampfwürfe deiner Einheiten erhalten in dieser Runde +1." }
  ],
  leaders: {
    agents: [{ en: "Garv and Gunn", text: "Am Ende des Zuges eines Spielers darfst du die Karte erschöpfen. Er darf dann 1 seiner Planeten erkunden." }],
    commander: { en: "Dart and Tai", unlock: "Mechs in 3 Systemen.",
      text: "Nachdem du die Kontrolle über einen Planeten übernommen hast, der einem anderen Spieler gehörte, darfst du ihn erkunden." },
    hero: { en: "Hesh and Prit", text: "Materialaktion: Erhalte 1 Relikt und handle die Sekundärfähigkeit von bis zu 2 spielbereiten oder nicht gewählten Strategiekarten ab. Die Kommandomarker dafür nimmst du aus deinem Nachschub statt aus dem Strategiepool, danach wird die Karte vernichtet." }
  },
  promissory: { en: "Black Market Forgery", text: "Materialaktion: Vernichte 2 deiner Reliktfragmente desselben Typs, um 1 Relikt zu erhalten. Danach geht die Karte an den Naaz-Rokha-Spieler zurück." },
  play: "Erkundungsspezialisten, die mit Mechs Planeten durchsuchen und Reliktfragmente in Relikte verwandeln."
},

{ id: "titans", de: "Die Titanen des Ul", en: "The Titans of Ul", src: "pok", short: "Titanen",
  complexity: 2, commodities: 2, homeTile: "55",
  home: [{ name: "Elysium", res: 4, inf: 1 }],
  start: { units: "1 Schlachtschiff, 2 Kreuzer, 2 Jäger, 3 Infanterie, 1 Raumwerft", tech: ["Antimass Deflectors", "Scanlink Drone Network"] },
  abilities: [
    { en: "Terragenesis", text: "Nachdem du einen Planeten ohne Schläfermarker erkundet hast, darfst du 1 Schläfermarker auf ihn legen oder dorthin versetzen." },
    { en: "Awaken", text: "Nachdem du ein System mit mindestens 1 deiner Schläfermarker aktiviert hast, darfst du jeden davon durch 1 PVS aus deinem Nachschub ersetzen." },
    { en: "Coalescence", text: "Setzen dein Flaggschiff oder Awaken deine Einheiten in denselben Weltraumbereich oder auf denselben Planeten wie Einheiten eines anderen Spielers, kämpfen sie in den Schritten Raumkampf beziehungsweise Bodenkampf mit." }
  ],
  flagship: { en: "Ouranos", cost: 8, combat: "7 (×2)", move: 1, capacity: 3,
    text: "Schadensresistenz. Einsatz: Nachdem du ein System mit mindestens 1 deiner PVS aktiviert hast, darfst du 1 dieser PVS durch das Flaggschiff ersetzen." },
  mech: { en: "Hecatoncheires", cost: 2, combat: "6",
    text: "Schadensresistenz. Einsatz: Würdest du ein PVS auf einen Planeten setzen, darfst du stattdessen 1 Mech und 1 Infanterie dorthin setzen." },
  units: [
    { en: "Saturn Engine I", replaces: "Kreuzer", cost: 2, combat: "7", move: 2, capacity: 1,
      text: "Kreuzer mit Kapazität 1.",
      upgrade: { en: "Saturn Engine II", prereq: "GYR", cost: 2, combat: "6", move: 3, capacity: 2,
        text: "Schadensresistenz." } },
    { en: "Hel-Titan I", replaces: "PVS", cost: "–", combat: "7", move: "–", capacity: "–",
      text: "Planetarer Schild, Weltraumkanone 6, Schadensresistenz, Produktion 1. Gilt als Gebäude und als Bodentruppe und kann nicht transportiert werden.",
      upgrade: { en: "Hel-Titan II", prereq: "YR", cost: "–", combat: "6", move: "–", capacity: "–",
        text: "Planetarer Schild, Weltraumkanone 5, Schadensresistenz, Produktion 1. Gebäude und Bodentruppe zugleich, nicht transportierbar. Die Weltraumkanone darf auch auf Schiffe in angrenzenden Systemen feuern." } }
  ],
  techs: [
    { en: "Hel-Titan II", color: "einheit", prereq: "YR",
      text: "Aufwertung deiner PVS auf Kampfwert 6 und Weltraumkanone 5, die auch in angrenzende Systeme feuern darf." },
    { en: "Saturn Engine II", color: "einheit", prereq: "GYR",
      text: "Aufwertung deiner Kreuzer auf Kampfwert 6, Bewegung 3, Kapazität 2 und Schadensresistenz." }
  ],
  leaders: {
    agents: [{ en: "Tellurian", text: "Bevor ein Treffer zugewiesen wird, darfst du die Karte erschöpfen, um ihn zu negieren." }],
    commander: { en: "Tungstantus", unlock: "5 Gebäude auf dem Spielplan.",
      text: "Nutzen 1 oder mehrere deiner Einheiten Produktion, darfst du 1 Handelsware erhalten." },
    hero: { en: "Ul the Progenitor", text: "Materialaktion: Mache Elysium spielbereit und lege diese Karte an. Der Planet erhält je +3 Ressourcen und Einfluss sowie Weltraumkanone 5 (×3), als wäre er eine Einheit. Die Karte wird nicht vernichtet." }
  },
  promissory: { en: "Terraform", text: "Materialaktion: Lege die Karte an einen deiner Nicht-Heimat-Planeten außer Mecatol Rex an. Er erhält je +1 Ressource und Einfluss und hat alle drei Merkmale kulturell, gefährlich und industriell. Die Karte kehrt nicht zurück." },
  play: "Verteidigungsstarke Fraktion, die über Schläfermarker plötzlich überall PVS und Mechs auftauchen lässt."
},

{ id: "keleres", de: "Die Keleres des Rates", en: "The Council Keleres", src: "codex", short: "Keleres",
  complexity: 2, commodities: 2, homeTile: "2 / 14 / 58",
  home: [
    { name: "Moll Primus", res: 4, inf: 1, via: "Mentak" },
    { name: "Archon Ren", res: 2, inf: 3, via: "Xxcha" },
    { name: "Archon Tau", res: 1, inf: 1, via: "Xxcha" },
    { name: "Valk", res: 2, inf: 0, via: "Silberschwingen" },
    { name: "Avar", res: 1, inf: 1, via: "Silberschwingen" },
    { name: "Ylir", res: 0, inf: 2, via: "Silberschwingen" }
  ],
  start: { units: "2 Träger, 1 Kreuzer, 2 Jäger, 2 Infanterie, 1 Raumwerft", tech: ["Wahl: 2 Nicht-Fraktionstechnologien, die andere Spieler besitzen"] },
  abilities: [
    { de: "Die Tribune", en: "The Tribunii", text: "Beim Aufbau wählst du eine Fraktion, die nicht im Spiel ist, aus Mentak, Xxcha und Silberschwingen. Du nimmst ihr Heimat-System, ihre Kommando- und Kontrollmarker sowie den passenden Keleres-Helden." },
    { de: "Vom Rat finanziert", en: "Council Patronage", text: "Zu Beginn der Strategiephase füllst du deine Massenprodukte auf und erhältst danach 1 Handelsware." },
    { de: "Über dem Gesetz", en: "Law's Order", text: "Zu Beginn deines Zuges darfst du 1 Einfluss ausgeben. Bis zum Ende deines Zuges gelten alle Gesetze als textlos." }
  ],
  flagship: { en: "Artemiris", cost: 8, combat: "7 (×2)", move: 1, capacity: 6,
    text: "Schadensresistenz. Andere Spieler müssen 2 Einfluss ausgeben, um das System dieses Schiffs zu aktivieren." },
  mech: { en: "Omniopiares", cost: 2, combat: "6",
    text: "Schadensresistenz. Andere Spieler müssen 1 Einfluss ausgeben, um Bodentruppen auf diesen Planeten zu entsenden." },
  techs: [
    { de: "Basis-Modernisierung", en: "I.I.H.Q. Modernization", color: "gelb", prereq: "Y",
      text: "Du bist Nachbar aller Spieler mit Einheiten oder Planeten im oder angrenzend an das Mecatol-Rex-System. Du erhältst die Planetenkarte Custodia Vigilia samt Karte des legendären Planeten, kannst beide nicht verlieren und auf diese Technologie darf kein Assimilatormarker gelegt werden." },
    { de: "Agenten-Versorgungsnetz", en: "Agency Supply Network", color: "gelb", prereq: "YY",
      text: "Wenn du eine deiner Produktion-Fähigkeiten abhandelst, darfst du zusätzlich eine deiner Produktion-Fähigkeiten in einem beliebigen System abhandeln. Diese zusätzliche Verwendung löst die Technologie nicht erneut aus." }
  ],
  leaders: {
    agents: [{ en: "Xander Alexin Victori III", text: "Du darfst die Karte jederzeit erschöpfen, damit ein beliebiger Spieler Massenprodukte wie Handelswaren ausgeben kann." }],
    commander: { en: "Suffi An", unlock: "Nach dem Ausspielen einer Aktionskarte mit Materialaktion 1 Handelsware ausgeben.",
      text: "Nachdem du eine Materialaktion durchgeführt hast, darfst du eine weitere Aktion durchführen." },
    hero: { en: "Harka Leeds / Odlynn Myrr / Kuuasi Aun Jalatai",
      text: "Du nutzt nur den Helden deiner gewählten Herkunft, er wird nach Gebrauch vernichtet. Harka Leeds (Mentak), Materialaktion: Decke Aktionskarten auf, bis 3 mit Materialaktion dabei sind, nimm diese auf die Hand und mische den Rest zurück. Odlynn Myrr (Xxcha), nach dem Aufdecken einer Agenda: Gib bis zu 6 zusätzliche Stimmen ab und prognostiziere ein Ergebnis. Für jeden Spieler, der für ein anderes Ergebnis stimmt, erhältst du 1 Handelsware und 1 Kommandomarker. Kuuasi Aun Jalatai (Silberschwingen), zu Beginn einer Raumkampfrunde in einem System mit einem deiner Planeten: Setze dein Flaggschiff und insgesamt 2 Kreuzer und/oder Zerstörer aus deinem Nachschub ins aktive System." }
  },
  promissory: { de: "Die Keleres-Klausel", en: "Keleres Rider", text: "Nachdem eine Agenda aufgedeckt wurde, verzichtest du auf deine Stimmen und gibst eine Prognose ab. Liegst du richtig, ziehst du 1 Aktionskarte und erhältst 2 Handelswaren. Danach geht die Karte an den Keleres-Spieler zurück." },
  play: "Politisch wendige Fraktion, die Gesetze aushebelt und mit Massenprodukten und Handelswaren flexibel bleibt."
}
];
