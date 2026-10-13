/* Deutsche Anzeigenamen. Belegte Namen und eigene Übersetzungen bleiben getrennt.
   Eigene Übersetzungen sind keine Behauptung über den Namen auf der deutschen Karte.
   Englische Eigennamen bleiben unverändert. Spieltexte werden hier nicht verändert. */
(function () {
  "use strict";
  var D = window.TI4 = window.TI4 || {};
  var info = D.nameInfo = {};
  function add(rows, status, source) {
    rows.trim().split("\n").forEach(function (row) {
      var pair = row.split("|");
      info[pair[0]] = { de: pair[1] || pair[0], status: status, source: source };
    });
  }
  add(`
The Arborec|Das Arborec
The Ghosts of Creuss|Die Geister von Creuss
The Emirates of Hacan|Die Emirate von Hacan
The Universities of Jol-Nar|Die Universitäten von Jol-Nar
The L1Z1X Mindnet|Das L1Z1X-Gedankennetz
The Barony of Letnev|Das Baronat von Letnev
The Mentak Coalition|Die Mentak-Koalition
The Embers of Muaat|Die Glut von Muaat
The Naalu Collective|Das Naalu-Kollektiv
The Nekro Virus|Das Nekro-Virus
The Clan of Saar|Der Clan der Zaar
Sardakk N'orr|Sardakk N'orr
The Federation of Sol|Die Sol-Föderation
The Winnu|Die Winnu
The Xxcha Kingdom|Das Xxcha-Königreich
The Yin Brotherhood|Die Yin-Bruderschaft
The Yssaril Tribes|Die Yssaril-Stämme
The Argent Flight|Die Silberschwingen
The Vuil'raith Cabal|Die Vuil'raith-Verschwörung
The Empyrean|Die Empyrier
The Mahact Gene-Sorcerers|Die mahactanischen Gen-Hexer
The Nomad|Der Nomade
The Naaz-Rokha Alliance|Die Naaz-Rokha-Allianz
The Titans of Ul|Die Titanen des Ul
Antimass Deflectors|Antimassen-Deflektoren
Gravity Drive|Gravitationsantrieb
Sling Relay|Slingshot-Relais
Self-Assembly Routines|Selbstmontageroutinen
Scanlink Drone Network|Scanlink-Drohnennetz
`, "official-de", "Asmodee, Codex II, deutsche Fassung (Fraktionsübersichten)");
  add(`
The Council Keleres|Die Keleres des Rates
The Tribunii|Die Tribune
Council Patronage|Vom Rat finanziert
Law's Order|Über dem Gesetz
I.I.H.Q. Modernization|Basis-Modernisierung
Agency Supply Network|Agenten-Versorgungsnetz
Keleres Rider|Die Keleres-Klausel
`, "official-de", "Asmodee, Codex III, deutsche Fassung (Keleres)");
  add(`
Insider Information|Insider-Information
Plagiarize|Plagiat
Master Plan|Masterplan
Rally|Sammeln
Scramble Frequency|Störfrequenz
Forward Supply Base|Logistik-Vorposten
Fighter Conscription|Jäger-Einberufung
Blitz|Blitzangriff
Harness Energy|Energienutzung
Hack Election|Gehackte Wahl
Reflective Shielding|Reflektierende Schilde
Impersonation|Verkleidung
Solar Flare|Sonneneruption
Sanction|Sanktion
Counterstroke|Gegenschlag
Ghost Squad|Phantom-Einheit
War Machine|Kriegsmaschinerie
`, "official-de", "Asmodee, Codex I, deutsche Fassung (Aktionskarten)");
  add(`
Fleet Logistics|Flottenlogistik
Hyper Metabolism|Hypermetabolismus
Psychoarchaeology|Psychoarchäologie
Bio-Stims|Biostimulanzien
AI Development Algorithm|KI-Entwicklungsalgorithmus
Transit Diodes|Transitdioden
Integrated Economy|Integrierte Wirtschaft
Predictive Intelligence|Vorausschauende Intelligenz
Corner the Market|Den Markt beherrschen
Diversify Research|Forschung diversifizieren
Erect a Monument|Ein Monument errichten
Expand Borders|Grenzen erweitern
Found Research Outposts|Forschungsaußenposten gründen
Intimidate Council|Den Rat einschüchtern
Lead From the Front|An vorderster Front führen
Negotiate Trade Routes|Handelsrouten aushandeln
Sway the Council|Den Rat beeinflussen
Amass Wealth|Reichtum anhäufen
Build Defenses|Verteidigung aufbauen
Discover Lost Outposts|Verschollene Außenposten entdecken
Engineer a Marvel|Ein Wunderwerk erschaffen
Explore Deep Space|Den tiefen Raum erkunden
Improve Infrastructure|Infrastruktur verbessern
Make History|Geschichte schreiben
Populate the Outer Rim|Den äußeren Rand besiedeln
Push Boundaries|Grenzen verschieben
Raise a Fleet|Eine Flotte aufbauen
Centralize Galactic Trade|Den galaktischen Handel zentralisieren
Conquer the Weak|Die Schwachen erobern
Form Galactic Brain Trust|Einen galaktischen Expertenrat bilden
Found a Golden Age|Ein goldenes Zeitalter begründen
Galvanize the People|Das Volk mobilisieren
Manipulate Galactic Law|Galaktisches Recht manipulieren
Master the Sciences|Die Wissenschaften meistern
Subdue the Galaxy|Die Galaxie unterwerfen
Unify the Colonies|Die Kolonien vereinen
Achieve Supremacy|Die Vorherrschaft erringen
Become a Legend|Zur Legende werden
Command an Armada|Eine Armada befehligen
Construct Massive Cities|Riesige Städte errichten
Control the Borderlands|Die Grenzgebiete kontrollieren
Hold Vast Reserves|Große Reserven vorhalten
Patrol Vast Territories|Weite Gebiete patrouillieren
Protect the Border|Die Grenze schützen
Reclaim Ancient Monuments|Uralte Monumente zurückerobern
Rule Distant Lands|Ferne Gebiete beherrschen
Adapt New Strategies|Neue Strategien anpassen
Become the Gatekeeper|Zum Torwächter werden
Control the Region|Die Region kontrollieren
Cut Supply Lines|Versorgungswege kappen
Destroy Their Greatest Ship|Ihr größtes Schiff zerstören
Establish a Perimeter|Eine Sicherheitszone errichten
Forge an Alliance|Eine Allianz schmieden
Form a Spy Network|Ein Spionagenetz aufbauen
Fuel the War Machine|Die Kriegsmaschinerie versorgen
Gather a Mighty Fleet|Eine mächtige Flotte sammeln
Learn the Secrets of the Cosmos|Die Geheimnisse des Kosmos ergründen
Make an Example of Their World|An ihrer Welt ein Exempel statuieren
Master the Laws of Physics|Die Gesetze der Physik meistern
Mine Rare Metals|Seltene Metalle abbauen
Monopolize Production|Die Produktion monopolisieren
Occupy the Seat of the Empire|Den Sitz des Imperiums besetzen
Spark a Rebellion|Eine Rebellion entfachen
Threaten Enemies|Feinde bedrohen
Unveil Flagship|Das Flaggschiff enthüllen
Become a Martyr|Zum Märtyrer werden
Betray a Friend|Einen Freund verraten
Brave the Void|Der Leere trotzen
Darken the Skies|Den Himmel verdunkeln
Defy Space and Time|Raum und Zeit trotzen
Demonstrate Your Power|Deine Macht demonstrieren
Destroy Heretical Works|Ketzerische Werke zerstören
Dictate Policy|Die Politik bestimmen
Drive the Debate|Die Debatte lenken
Establish Hegemony|Hegemonie begründen
Fight with Precision|Präzise kämpfen
Foster Cohesion|Den Zusammenhalt stärken
Hoard Raw Materials|Rohstoffe horten
Mechanize the Military|Das Militär mechanisieren
Occupy the Fringe|Die Randgebiete besetzen
Produce en Masse|In Massen produzieren
Prove Endurance|Ausdauer beweisen
Seize an Icon|Ein Wahrzeichen erobern
Stake Your Claim|Deinen Anspruch abstecken
Strengthen Bonds|Verbindungen stärken
Dominus Orb|Dominus-Sphäre
Maw of Worlds|Schlund der Welten
Scepter of Emelpar|Zepter von Emelpar
Stellar Converter|Sternenwandler
The Codex|Der Codex
The Crown of Thalnos|Die Krone von Thalnos
The Obsidian|Der Obsidian
The Prophet's Tears|Die Tränen des Propheten
Freelancers|Freischaffende
Mercenary Outfit|Söldnertruppe
Gamma Wormhole|Gamma-Wurmloch
Dyson Sphere|Dyson-Sphäre
Paradise World|Paradieswelt
Tomb of Emphidia|Grab von Emphidia
Cultural Relic Fragment|Kulturelles Reliktfragment
Volatile Fuel Source|Instabile Treibstoffquelle
Expedition|Expedition
Core Mine|Kernmine
Lazax Survivors|Lazax-Überlebende
Mining World|Bergbauwelt
Rich World|Reiche Welt
Warfare Research Facility|Forschungsanlage für Kriegsführung
Hazardous Relic Fragment|Gefährliches Reliktfragment
Abandoned Warehouses|Verlassene Lagerhäuser
Functioning Base|Intakter Stützpunkt
Local Fabricators|Lokale Fertigungsanlagen
Biotic Research Facility|Forschungsanlage für Biotechnik
Cybernetic Research Facility|Forschungsanlage für Kybernetik
Propulsion Research Facility|Forschungsanlage für Antriebstechnik
Industrial Relic Fragment|Industrielles Reliktfragment
Derelict Vessel|Verlassenes Raumschiff
Enigmatic Device|Rätselhaftes Gerät
Gamma Relay|Gamma-Relais
Lost Crew|Verschollene Besatzung
Merchant Station|Handelsstation
Mirage|Mirage
Unknown Relic Fragment|Unbekanntes Reliktfragment
Ancient Burial Sites|Uralte Grabstätten
Assassinate Representative|Abgeordneten ermorden
Bunker|Bunker
Confusing Legal Text|Verwirrender Gesetzestext
Construction Rider|Bauwesen-Klausel
Cripple Defenses|Verteidigung lahmlegen
Diplomacy Rider|Diplomatie-Klausel
Disable|Außer Gefecht setzen
Economic Initiative|Wirtschaftsinitiative
Emergency Repairs|Notreparaturen
Fighter Prototype|Jägerprototyp
Fire Team|Feuerteam
Flank Speed|Höchstgeschwindigkeit
Focused Research|Gezielte Forschung
Frontline Deployment|Frontverlegung
Ghost Ship|Geisterschiff
Imperial Rider|Imperiale Klausel
In the Silence of Space|In der Stille des Alls
Industrial Initiative|Industrieinitiative
Insubordination|Befehlsverweigerung
Leadership Rider|Führungsstärke-Klausel
Lost Star Chart|Verschollene Sternenkarte
Maneuvering Jets|Manövriertriebwerke
Mining Initiative|Bergbauinitiative
Morale Boost|Moralschub
Parley|Verhandlungen
Plague|Seuche
Political Stability|Politische Stabilität
Politics Rider|Politik-Klausel
Public Disgrace|Öffentliche Schande
Reactor Meltdown|Reaktorkernschmelze
Reparations|Reparationen
Rise of a Messiah|Aufstieg eines Messias
Salvage|Bergung
Signal Jamming|Signalstörung
Spy|Spion
Summit|Gipfeltreffen
Tactical Bombardment|Taktisches Bombardement
Technology Rider|Technologie-Klausel
Trade Rider|Handel-Klausel
Unexpected Action|Unerwartete Aktion
Unstable Planet|Instabiler Planet
Uprising|Aufstand
War Effort|Kriegsanstrengung
Warfare Rider|Kriegsführung-Klausel
Archaeological Expedition|Archäologische Expedition
Confounding Legal Text|Irreführender Gesetzestext
Coup d'Etat|Staatsstreich
Deadly Plot|Tödliche Intrige
Decoy Operation|Ablenkungsoperation
Diplomatic Pressure|Diplomatischer Druck
Divert Funding|Mittel umleiten
Exploration Probe|Erkundungssonde
Manipulate Investments|Investitionen manipulieren
Nav Suite|Navigationssystem
Refit Troops|Truppen umrüsten
Reveal Prototype|Prototyp enthüllen
Reverse Engineer|Nachkonstruieren
Rout|In die Flucht schlagen
Scuttle|Versenken
Seize Artifact|Artefakt an sich nehmen
Waylay|Überfall
Anti-Intellectual Revolution|Antiintellektuelle Revolution
Archived Secret|Archiviertes Geheimnis
Arms Reduction|Abrüstung
Committee Formation|Ausschussbildung
Compensated Disarmament|Entschädigte Abrüstung
Conventions of War|Kriegskonventionen
Economic Equality|Wirtschaftliche Gleichheit
Executive Sanctions|Exekutivsanktionen
Fleet Regulations|Flottenvorschriften
Homeland Defense Act|Heimatverteidigungsgesetz
Imperial Arbiter|Imperialer Schiedsrichter
Incentive Program|Anreizprogramm
Judicial Abolishment|Abschaffung der Justiz
Minister of Commerce|Handelsminister
Minister of Exploration|Erkundungsminister
Minister of Industry|Industrieminister
Minister of Peace|Friedensminister
Minister of Sciences|Wissenschaftsminister
Mutiny|Meuterei
New Constitution|Neue Verfassung
Prophecy of Ixth|Prophezeiung von Ixth
Public Execution|Öffentliche Hinrichtung
Publicize Weapon Schematics|Waffenbaupläne veröffentlichen
Regulated Conscription|Geregelte Wehrpflicht
Seed of an Empire|Keim eines Imperiums
Shared Research|Gemeinsame Forschung
Swords to Plowshares|Schwerter zu Pflugscharen
Unconventional Measures|Unkonventionelle Maßnahmen
Wormhole Reconstruction|Wurmloch-Rekonstruktion
Wormhole Research|Wurmlochforschung
Core Mining|Kernbergbau
Representative Government|Repräsentative Regierung
Research Team: Biotic|Forschungsteam: Biotechnik
Research Team: Cybernetic|Forschungsteam: Kybernetik
Research Team: Propulsion|Forschungsteam: Antriebstechnik
Research Team: Warfare|Forschungsteam: Kriegsführung
Senate Sanctuary|Senatszuflucht
Terraforming Initiative|Terraforming-Initiative
Armed Forces Standardization|Standardisierung der Streitkräfte
Articles of War|Kriegsordnung
Checks and Balances|Gewaltenteilung
Clandestine Operations|Geheimoperationen
Covert Legislation|Verdeckte Gesetzgebung
Galactic Crisis Pact|Galaktischer Krisenpakt
Minister of Antiquities|Antikenminister
Nexus Sovereignty|Nexus-Souveränität
Political Censure|Politische Rüge
Rearmament Agreement|Wiederbewaffnungsabkommen
Research Grant Reallocation|Forschungsmittel neu verteilen
Search Warrant|Durchsuchungsbefehl
Mitosis|Mitose
Letani Behemoth|Letani-Koloss
Bioplasmosis|Bioplasmosis
Stymie|Blockade
Slipstream|Gleitstrom
Icarus Drive|Ikarus-Antrieb
Creuss IFF|Creuss-Freund-Feind-Kennung
Masters of Trade|Meister des Handels
Guild Ships|Gildenschiffe
Arbiters|Vermittler
Wrath of Kenara|Zorn von Kenara
Pride of Kenara|Stolz von Kenara
Quantum Datahub Node|Quanten-Datenknoten
Production Biomes|Produktionsbiome
Carth of Golden Sands|Carth vom Goldenen Sand
Gila the Silvertongue|Gila die Silberzunge
Trade Convoys|Handelskonvois
Fragile|Zerbrechlich
Brilliant|Brillant
Analytical|Analytisch
Shield Paling|Schildgitter
Spatial Conduit Cylinder|Raumkanalzylinder
Doctor Sucaban|Doktor Sucaban
Rin, the Master's Legacy|Rin, das Erbe des Meisters
Research Agreement|Forschungsabkommen
Assimilate|Assimilieren
Annihilator|Vernichter
Super-Dreadnought I|Super-Schlachtschiff I
Super-Dreadnought II|Super-Schlachtschiff II
Inheritance Systems|Vererbungssysteme
The Helmsman|Der Steuermann
Cybernetic Enhancements|Kybernetische Verbesserungen
Munitions Reserves|Munitionsreserven
Dunlain Reaper|Dunlain-Schnitter
L4 Disruptors|L4-Disruptoren
Viscount Unlenn|Burggraf Unlenn
Rear Admiral Farran|Konteradmiral Farran
Darktalon Treilla|Dunkelklaue Treilla
War Funding|Kriegsfinanzierung
Fourth Moon|Vierter Mond
Mirror Computing|Spiegelberechnung
Ipswitch, Loose Cannon|Ipswitch, unberechenbarer Draufgänger
Promise of Protection|Schutzversprechen
Star Forge|Sternenschmiede
Gashlai Physiology|Gashlai-Physiologie
The Inferno|Das Inferno
Ember Colossus|Glutkoloss
Magmus Reactor|Magmus-Reaktor
Adjudicator Ba'al|Richter Ba'al
Fires of the Gashlai|Feuer der Gashlai
Telepathic|Telepathisch
Iconoclast|Bilderstürmer
Hybrid Crystal Fighter I|Hybrid-Kristalljäger I
Hybrid Crystal Fighter II|Hybrid-Kristalljäger II
Neuroglaive|Neurogleve
The Oracle|Das Orakel
Galactic Threat|Galaktische Bedrohung
Technological Singularity|Technologische Singularität
Propagation|Ausbreitung
Antivirus|Antivirus
Nomadic|Nomadisch
Son of Ragh|Sohn von Ragh
Scavenger Zeta|Plünderer Zeta
Captain Mendosa|Kapitän Mendosa
Ragh's Call|Raghs Ruf
Unrelenting|Unerbittlich
Valkyrie Exoskeleton|Walküren-Exoskelett
Valkyrie Particle Weave|Walküren-Partikelgewebe
Sh'val, Harbinger|Sh'val, Vorbote
Tekklar Legion|Tekklar-Legion
Orbital Drop|Orbitalabwurf
Versatile|Vielseitig
ZS Thunderbolt M2|ZS-Donnerkeil M2
Spec Ops I|Spezialtruppen I
Spec Ops II|Spezialtruppen II
Advanced Carrier I|Fortgeschrittener Träger I
Advanced Carrier II|Fortgeschrittener Träger II
Jace X, 4th Air Legion|Jace X, 4. Luftlegion
Military Support|Militärische Unterstützung
Blood Ties|Blutsbande
Reclamation|Rückgewinnung
Reclaimer|Rückeroberer
Acquiescence|Einverständnis
Quash|Verwerfen
Instinct Training|Instinkttraining
Nullification Field|Annullierungsfeld
Elder Qanoj|Ältester Qanoj
Political Favor|Politischer Gefallen
Indoctrination|Indoktrination
Moyin's Ashes|Moyins Asche
Yin Spinner|Yin-Spinner
Impulse Core|Impulskern
Brother Milor|Bruder Milor
Brother Omar|Bruder Omar
Dannel of the Tenth|Dannel vom Zehnten
Greyfire Mutagen|Graufeuer-Mutagen
Stall Tactics|Verzögerungstaktik
Crafty|Gerissen
Blackshade Infiltrator|Schwarzschatten-Infiltrator
Transparasteel Plating|Transparastahlpanzerung
Mageon Implants|Mageon-Implantate
Kyver, Blade and Key|Kyver, Klinge und Schlüssel
Spy Net|Spionagenetz
Zeal|Eifer
Raid Formation|Überfallformation
Aerie Sentinel|Horstwächter
Strike Wing Alpha I|Angriffsgeschwader Alpha I
Strike Wing Alpha II|Angriffsgeschwader Alpha II
Aerie Hololattice|Horst-Hologitter
Strike Wing Ambuscade|Hinterhalt des Angriffsgeschwaders
Devour|Verschlingen
Amalgamation|Verschmelzung
Riftmeld|Rissverschmelzung
The Terror Between|Der Schrecken dazwischen
Reanimator|Wiederbeleber
Dimensional Tear I|Dimensionsriss I
Dimensional Tear II|Dimensionsriss II
Vortex|Vortex
The Stillness of Stars|Die Stille der Sterne
That Which Molds Flesh|Was Fleisch formt
It Feeds on Carrion|Es nährt sich von Aas
Crucible|Schmelztiegel
Voidborn|In der Leere geboren
Aetherpassage|Ätherpassage
Dark Whispers|Dunkles Flüstern
Dynamo|Dynamo
Watcher|Wächter
Voidwatch|Leerenwacht
Aetherstream|Ätherstrom
Conservator Procyon|Bewahrer Procyon
Dark Pact / Blood Pact|Dunkler Pakt / Blutpakt
Dark Pact|Dunkler Pakt
Blood Pact|Blutpakt
Edict|Edikt
Imperia|Imperia
Hubris|Hybris
Starlancer|Sternenlanzer
Crimson Legionnaire I|Purpurlegionär I
Crimson Legionnaire II|Purpurlegionär II
Genetic Recombination|Genetische Rekombination
Scepter of Dominion|Zepter der Herrschaft
Future Sight|Zukunftsblick
Quantum Manipulator|Quantenmanipulator
Temporal Command Suite|Temporales Kommandosystem
Artuno the Betrayer|Artuno der Verräter
Field Marshal Mercer|Feldmarschall Mercer
The Thundarian|Der Thundarian
Navarch Feng|Navarch Feng
The Cavalry|Die Kavallerie
Distant Suns|Ferne Sonnen
Fabrication|Fertigung
Eidolon / Z-Grav Eidolon|Eidolon / Z-Gravitations-Eidolon
Pre-Fab Arcologies|Vorfabrizierte Arkologien
Supercharge|Überladung
Garv and Gunn|Garv und Gunn
Dart and Tai|Dart und Tai
Hesh and Prit|Hesh und Prit
Black Market Forgery|Schwarzmarktfälschung
Terragenesis|Terragenese
Awaken|Erwecken
Coalescence|Vereinigung
Saturn Engine I|Saturn-Maschine I
Saturn Engine II|Saturn-Maschine II
Hel-Titan I|Hel-Titan I
Hel-Titan II|Hel-Titan II
Ul the Progenitor|Ul der Stammvater
Terraform|Terraforming
`, "own-translation", "Eigene deutsche Übersetzung; offizieller Kartenname nicht geprüft");
  add(`
Letani Ospha
Dirzuga Rophal
Letani Miasmiala
Harrugh Gefhara
J.N.S. Hylarim
Ta Zern
[0.0.1]
I48S
2RAM
Arc Secundus
Moll Terminus
Suffi An
S'ula Mentarion
Umbat
Magmus
Z'eu
M'aban
Mordred
Nekro Malleon
Nekro Acidos
UNIT.DSGN.FLAYESH
Rowl Sarrig
Gurno Aggero
C'morran N'orr
T'ro
G'hom Sek'kus
Genesis
Evelyn DeLouis
Claire Gibson
Berekar Berekon
Rickar Rickani
Mathis Mathinus
Loncara Ssodu
Indomitus
Ggrocuto Rinn
Xxekir Grom
Van Hauge
Y'sia Y'ssrila
Ssruu
So Ata
Quetzecoatl
Trilossa Aun Mirik
Trrakan Aun Zulok
Mirik Aun Sissiri
Acamar
Xuange
Arvicon Rex
Jae Mir Kan
Airo Shir Aur
Memoria I
Memoria II
Ahk-Syl Siven
Visz El Vir
Ouranos
Hecatoncheires
Tellurian
Tungstantus
Artemiris
Omniopiares
Xander Alexin Victori III
Harka Leeds / Odlynn Myrr / Kuuasi Aun Jalatai
`, "proper-name", "Englischer Eigenname unverändert");

  add(`Fight with Precision|Kämpfe mit Präzision
Turn Their Fleets to Dust|Vernichte ihre Flotten
Make an Example of Their World|Statuiere ein Exempel`, "official-de", "Asmodee, Codex III Kartenset A, PDF-Seite 3");
  D.germanName = function (name) { return info[name] ? info[name].de : name; };
  // Nur namentliche Querverweise werden ersetzt; Regeln und Werte bleiben erhalten.
  var proseNames = ["Mitosis", "Fragile", "Telepathic", "Technological Singularity", "Orbital Drop", "Indoctrination", "Stall Tactics", "Awaken", "Dark Pact", "Blood Pact"];
  function localizeProse(text) {
    proseNames.forEach(function (en) { text = text.split(en).join(D.germanName(en)); });
    return text.replace(/Commander/g, "Kommandeur");
  }
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (value.en) {
      var hit = info[value.en];
      if (hit && (hit.status === "official-de" || !value.de)) {
        value.de = hit.de; value.nameStatus = hit.status; value.nameSource = hit.source;
      } else if (value.de) {
        value.nameStatus = "existing-de";
        value.nameSource = "Deutscher Name aus den vorhandenen Spieldaten";
        info[value.en] = { de: value.de, status: value.nameStatus, source: value.nameSource };
      } else {
        value.nameStatus = "untranslated";
        value.nameSource = "Noch nicht übersetzt";
      }
    }
    ["text", "codex", "unlock", "play"].forEach(function (key) { if (typeof value[key] === "string") value[key] = localizeProse(value[key]); });
    Object.keys(value).forEach(function (key) { if (typeof value[key] === "object") visit(value[key]); });
  }
  [D.factions, D.techs, D.objectives, D.relics, D.explore, D.actionCards, D.actionCardsCodex, D.agendas].forEach(visit);
  (D.factions || []).forEach(function (f) {
    f.start.tech = f.start.tech.map(D.germanName);
  });
})();
