/* Kompendium: Fraktionen, Technologien und Karten. Nutzt TI4.UI (aus app.js) und TI4.Map für die Heimat-Systeme. */
(function () {
  "use strict";
  var D = window.TI4;
  D.ext = D.ext || [];
  function U() { return D.UI; }
  function esc(s) { return U().esc(s); }
  function md(s) { return U().md(s); }

  var FAC = D.factions || [];
  var facById = {}; FAC.forEach(function (f) { facById[f.id] = f; });
  var TECHS = D.techs || [];
  var techById = {}; TECHS.forEach(function (t) { techById[t.id] = t; });

  var SRC = { base: "Grundspiel", pok: "PoK", codex: "Codex", codex1: "Codex I" };
  var SRC_LONG = { base: "Grundspiel", pok: "Prophezeiung der Könige", codex: "Codex III" };
  var COLOR = { gruen: "Biotechnik", blau: "Antriebstechnik", gelb: "Kybernetik", rot: "Kriegsführung", einheit: "Einheiten-Aufwertung", keine: "ohne Farbe" };
  var COLOR_SUB = { gruen: "grün", blau: "blau", gelb: "gelb", rot: "rot" };
  var PQ = { G: "Biotechnik", Y: "Kybernetik", B: "Antriebstechnik", R: "Kriegsführung" };
  var PHASE = { Status: "Statusphase", Aktion: "Aktionsphase", Agenda: "Agendaphase" };
  var COMPLEX = { 1: "einfach", 2: "mittel", 3: "anspruchsvoll" };
  var ULTIMATE = {
    arborec: "TheArborec", creuss: "TheGhostsOfCreuss", hacan: "TheEmiratesOfHacan", jolnar: "TheUniversitiesOfJolNar", l1z1x: "TheL1z1xMindnet",
    letnev: "TheBaronyOfLetnev", mentak: "TheMentakCoalition", muaat: "TheEmbersOfMuaat", naalu: "TheNaaluCollective", nekro: "TheNekroVirus",
    saar: "TheClanOfSaar", sardakk: "SardakkNorr", sol: "TheFederationOfSol", winnu: "TheWinnu", xxcha: "TheXxchaKingdom", yin: "TheYinBrotherhood",
    yssaril: "TheYssarilTribes", argent: "TheArgentFlight", vuilraith: "TheVuilRaithCabal", empyrean: "TheEmpyrean", mahact: "TheMahactGeneSorcerers",
    nomad: "TheNomad", naazrokha: "TheNaazRokhaAlliance", titans: "TheTitansOfUl", keleres: "TheCouncilKeleres"
  };

  function nm(o) { return o.de || o.en; }
  function sub(o) { return o.de && o.en && o.de !== o.en ? '<span class="en">' + esc(o.en) + "</span>" : ""; }
  function tag(t, cls) { return '<span class="tag' + (cls ? " " + cls : "") + '">' + esc(t) + "</span>"; }
  function srcTag(src) { return src && src !== "base" ? tag(SRC[src] || src, src) : ""; }
  function codexNote(c) { return c ? '<p class="codex"><b>Spätere Fassung</b> ' + md(c) + "</p>" : ""; }
  function prereq(p) {
    if (p === undefined || p === null) return "";
    if (!p) return '<span class="pq-none">keine Voraussetzung</span>';
    if (!/^[GYBR]+$/.test(p)) return '<span class="pq-none">' + esc(p === "–" ? "keine Voraussetzung" : p) + "</span>";
    return '<span class="pqs" title="Voraussetzung: ' + p.split("").map(function (c) { return PQ[c]; }).join(", ") + '">' +
      p.split("").map(function (c) { return '<i class="pq ' + c + '"></i>'; }).join("") + "</span>";
  }
  function stats(o, extra) {
    var cells = [];
    if (o.cost !== undefined) cells.push(["Kosten", o.cost]);
    if (o.combat !== undefined) cells.push(["Kampf", o.combat]);
    if (o.move !== undefined) cells.push(["Bewegung", o.move]);
    if (o.capacity !== undefined) cells.push(["Kapazität", o.capacity]);
    (extra || []).forEach(function (x) { cells.push(x); });
    if (!cells.length) return "";
    return '<div class="stats">' + cells.map(function (c) { return "<span><b>" + esc(c[1]) + "</b>" + esc(c[0]) + "</span>"; }).join("") + "</div>";
  }
  function kc(o) {
    // o: {id, cls, kind, title, en, tags, body}
    return '<article class="kc' + (o.cls ? " " + o.cls : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ">" +
      (o.kind ? '<p class="kind">' + o.kind + "</p>" : "") +
      '<div class="kc-h"><h3>' + esc(o.title) + "</h3>" + (o.en ? '<span class="en">' + esc(o.en) + "</span>" : "") + (o.tags || "") + "</div>" +
      (o.body || "") + "</article>";
  }
  function para(t) { return t ? "<p>" + md(t) + "</p>" : ""; }
  function enIf(o) { return o.de && o.de !== o.en ? o.en : ""; }
  function back(href, label) { return '<a class="back" href="' + href + '">' + U().svg("back", 18) + esc(label) + "</a>"; }
  function filterField(id, ph, val) {
    return '<label class="field" for="' + id + '">' + U().svg("search", 20) + '<span class="sr">Filtern</span><input id="' + id + '" data-kfilter="1" type="search" placeholder="' + esc(ph) + '" autocomplete="off" value="' + esc(val || "") + '"></label>';
  }
  function emptyNote() { return '<p class="empty" id="kf-empty" hidden>Nichts passt zum Filter.</p>'; }
  function hexThumb(f, size, full) {
    if (D.tiles[f.homeTile]) return D.Map.singleTile(f.homeTile, size, { uid: "f", names: !!full, number: !!full });
    return '<svg class="tile-svg" viewBox="-100 -88 200 176" width="' + size + '" role="img" aria-label="Heimat-System nach Herkunft"><polygon points="100,0 50,86.6 -50,86.6 -100,0 -50,-86.6 50,-86.6" fill="#1b2433" stroke="#3f9a54" stroke-width="5"/><text x="0" y="16" text-anchor="middle" font-size="48" font-family="Saira Condensed, sans-serif" font-weight="700" fill="#e3b24e">K</text></svg>';
  }

  /* ---------- Filter (ohne Neuaufbau der Seite) ---------- */
  var filterText = {}; // DOM-id -> normalisierter Suchtext
  var filterQ = { fac: "", tech: "", karten: "" };
  function reg(id, parts) { filterText[id] = U().norm(parts.filter(Boolean).join(" ")); }
  function applyFilter(q) {
    var words = U().norm((q || "").trim()).split(/\s+/).filter(Boolean), any = false;
    Object.keys(filterText).forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      var ok = words.every(function (w) { return filterText[id].indexOf(w) > -1; });
      el.hidden = !ok; if (ok) any = true;
    });
    document.querySelectorAll(".kf-group").forEach(function (g) { g.hidden = !g.querySelector(".kf-item:not([hidden])"); });
    var e = document.getElementById("kf-empty"); if (e) e.hidden = any;
  }

  /* ---------- Fraktionen ---------- */
  function viewFactions() {
    filterText = {};
    var h = back("#nachschlagen", "Nachschlagen") + "<h1>Fraktionen</h1>" +
      '<p class="lead">Alle ' + FAC.length + " Fraktionen aus Grundspiel und Prophezeiung der Könige, dazu der Council Keleres aus Codex III. Fähigkeiten, Einheiten, Technologien und Anführer in eigenen Worten.</p>" +
      filterField("kf", "Filtern, z. B. Wurmloch, Mech", filterQ.fac);
    ["base", "pok", "codex"].forEach(function (src) {
      var list = FAC.filter(function (f) { return f.src === src; }).sort(function (a, b) { return a.short.localeCompare(b.short, "de"); });
      if (!list.length) return;
      h += '<section class="kf-group"><h2 class="grp">' + esc(SRC_LONG[src]) + ' <small>' + list.length + "</small></h2>" + '<div class="fgrid">' + list.map(function (f) {
        var id = "fc-" + f.id;
        reg(id, [f.de, f.en, f.short, f.play, f.home.map(function (p) { return p.name; }).join(" "), f.abilities.map(function (a) { return [a.de, a.en, a.text].join(" "); }).join(" "),
          f.flagship.en, f.flagship.text, f.mech.en, f.mech.text, (f.units || []).map(function (x) { return [x.de, x.en, x.text].join(" "); }).join(" "),
          f.techs.map(function (t) { return [t.de, t.en, t.text].join(" "); }).join(" "), f.leaders.agents.map(function (a) { return [a.en, a.text].join(" "); }).join(" "),
          f.leaders.commander.en, f.leaders.commander.text, f.leaders.hero.en, f.leaders.hero.text, f.promissory.en, f.promissory.text]);
        return '<a class="fcard kf-item" id="' + id + '" href="#f-' + f.id + '"><span class="thumb">' + hexThumb(f, 64) + "</span>" +
          '<span class="body"><span class="nm">' + esc(nm(f)) + "</span>" + (f.de ? '<span class="en">' + esc(f.en) + "</span>" : "") +
          '<span class="meta">' + dots(f.complexity) + " " + esc(COMPLEX[f.complexity]) + "</span>" +
          '<span class="ds">' + esc(f.play) + "</span></span>" +
          '<span class="comm" title="Massenprodukte"><b>' + f.commodities + "</b></span></a>";
      }).join("") + "</div></section>";
    });
    return h + emptyNote() + '<p class="fine">Deutsche Namen stehen da, wo die deutsche Ausgabe sie im Regelheft verwendet, sonst der englische Originalname. Bei Abweichungen gilt der Kartentext.</p>';
  }
  function dots(n) { var s = ""; for (var i = 1; i <= 3; i++) s += '<i class="dot' + (i <= n ? " on" : "") + '"></i>'; return '<span class="cx" title="Komplexität ' + n + ' von 3">' + s + "</span>"; }

  /* ---------- Fraktionsbogen ---------- */
  var techByName = {}; TECHS.forEach(function (t) { techByName[U0n(t.en)] = t; if (t.de) techByName[U0n(t.de)] = t; });
  function U0n(s) { return String(s).toLowerCase().replace(/[^a-z0-9äöüß]/g, ""); }
  var sheetSide = "front";
  function statline(o) {
    var cells = [["Kosten", o.cost], ["Kampf", o.combat], ["Bewegung", o.move], ["Kapazität", o.capacity]].filter(function (c) { return c[1] !== undefined; });
    return '<div class="fs-stats">' + cells.map(function (c) { return "<span><b>" + esc(c[1]) + "</b>" + esc(c[0]) + "</span>"; }).join("") + "</div>";
  }
  function startUnits(txt) {
    return '<div class="fs-units">' + String(txt).split(/,\s*/).map(function (part) {
      var m = /^(\d+)\s+(.+)$/.exec(part.trim());
      return m ? '<span class="u"><b>' + m[1] + "</b>" + esc(m[2]) + "</span>" : '<span class="u wide">' + esc(part) + "</span>";
    }).join("") + "</div>";
  }
  function startTechs(list) {
    if (!list.length) return '<p class="fs-none">keine</p>';
    return '<div class="fs-techs">' + list.map(function (n) {
      var t = techByName[U0n(n)];
      return '<span class="t' + (t ? " c-" + t.color : "") + '">' + (t ? '<i class="sw"></i>' : "") + esc(n) + "</span>";
    }).join("") + "</div>";
  }
  function gcard(o) {
    // Karte aus dem Spielbereich: farbiges Band mit Art und Zustand, darunter Name und Text
    return '<article class="gcard' + (o.cls ? " " + o.cls : "") + '"><div class="band"><span>' + o.kind + "</span>" + (o.state ? '<span class="st">' + o.state + "</span>" : "") + "</div>" +
      '<div class="gc-b"><div class="kc-h"><h3>' + esc(o.title) + "</h3>" + (o.en ? '<span class="en">' + esc(o.en) + "</span>" : "") + (o.tags || "") + "</div>" + (o.body || "") + "</div></article>";
  }

  function viewFaction(id) {
    var f = facById[id];
    var back_ = sheetSide === "back";
    var h = back("#fraktionen", "Fraktionen");

    // Vorderseite
    var front = '<header class="fs-head"><div class="fs-emblem">' + hexThumb(f, 96) + "</div>" +
      '<div class="fs-title"><p class="fs-src">' + esc(SRC_LONG[f.src]) + "</p><h1>" + esc(nm(f)) + "</h1>" + (f.de ? '<p class="fs-en">' + esc(f.en) + "</p>" : "") + "</div>" +
      '<div class="fs-comm" title="Massenprodukte"><b>' + f.commodities + "</b><span>Massen&shy;produkte</span></div></header>" +
      '<div class="fs-abil">' + f.abilities.map(function (a) {
        return '<div class="fs-ab"><h3>' + esc(nm(a)) + (enIf(a) ? ' <span class="en">' + esc(enIf(a)) + "</span>" : "") + "</h3>" + para(a.text) + codexNote(a.codex) + "</div>";
      }).join("") + "</div>" +
      '<div class="fs-flag"><div class="fs-flag-h"><div><p class="fs-lbl">Flaggschiff</p><h3>' + esc(nm(f.flagship)) + "</h3></div>" + statline(f.flagship) + "</div>" +
      para(f.flagship.text) + codexNote(f.flagship.codex) +
      (f.flagship.upgrade ? '<div class="fs-upg"><div class="fs-flag-h"><div><p class="fs-lbl">Aufgewertet ' + prereq(f.flagship.upgrade.prereq) + "</p><h3>" + esc(nm(f.flagship.upgrade)) + "</h3></div>" + statline(f.flagship.upgrade) + "</div>" + para(f.flagship.upgrade.text) + "</div>" : "") +
      "</div>" +
      '<p class="fs-cx">Komplexität ' + dots(f.complexity) + " " + esc(COMPLEX[f.complexity]) + "</p>";

    // Rückseite
    var homeRows = f.home.map(function (p) {
      return '<li><b>' + esc(p.name) + '</b> <span class="ri"><span class="r">' + p.res + '</span><span class="i">' + p.inf + "</span></span>" + (p.via ? ' <span class="via">' + esc(p.via) + "</span>" : "") + "</li>";
    }).join("");
    var backSide = '<header class="fs-head small"><div class="fs-title"><p class="fs-src">Rückseite, für den Aufbau</p><h2>' + esc(nm(f)) + "</h2></div></header>" +
      '<div class="fs-home"><div class="fs-hometile">' + hexThumb(f, 170, true) + "</div><div>" +
      '<p class="fs-lbl">Heimat-System' + (D.tiles[f.homeTile] ? ", Tafel " + esc(f.homeTile) : "") + "</p>" +
      '<ul class="planets">' + homeRows + "</ul>" +
      (f.gateTile ? '<p class="fs-note">In die Galaxie kommt das Tor von Creuss (Tafel ' + esc(f.gateTile) + "). Das Heimat-System liegt neben dem Spielplan.</p>" : "") +
      (f.id === "keleres" ? '<p class="fs-note">Heimat-System der gewählten Herkunft: Mentak (Tafel 2), Xxcha (Tafel 14) oder Argent (Tafel 58).</p>' : "") +
      "</div></div>" +
      '<div class="fs-block"><p class="fs-lbl">Starteinheiten</p>' + startUnits(f.start.units) + "</div>" +
      '<div class="fs-block"><p class="fs-lbl">Starttechnologien</p>' + startTechs(f.start.tech) + "</div>" +
      '<p class="fs-note">Dazu wie bei allen: 3 Kommandomarker in den Taktikpool, 3 in den Flottenpool, 2 in den Strategiepool.</p>';

    h += '<div class="fs-bar" role="group" aria-label="Seite des Fraktionsbogens">' +
      '<button type="button" data-act="fs-side" data-side="front" aria-pressed="' + !back_ + '">Vorderseite</button>' +
      '<button type="button" data-act="fs-side" data-side="back" aria-pressed="' + back_ + '">Rückseite und Start</button></div>' +
      '<div class="fsheet" id="fsheet" data-side="' + sheetSide + '"><div class="fs-inner">' +
      '<section class="fs-face fs-front" aria-label="Vorderseite"' + (back_ ? " inert" : "") + ">" + front + "</section>" +
      '<section class="fs-face fs-back" aria-label="Rückseite"' + (back_ ? "" : " inert") + ">" + backSide + "</section>" +
      "</div></div>";
    h += '<p class="fs-play">' + esc(f.play) + "</p>";

    // Spielbereich
    var L = f.leaders, lead = [];
    var lockSt = '<i class="lock" aria-hidden="true"></i>gesperrt';
    L.agents.forEach(function (a) {
      lead.push(gcard({ cls: "leader agent", kind: "Agent" + (a.title ? ", " + esc(a.title) : ""), state: '<i class="ready" aria-hidden="true"></i>spielbereit', title: nm(a), en: enIf(a), body: para(a.text) + codexNote(a.codex) }));
    });
    lead.push(gcard({ cls: "leader", kind: "Commander", state: lockSt, title: nm(L.commander), en: enIf(L.commander),
      body: '<p class="unlock"><b>Freischalten:</b> ' + md(L.commander.unlock || "") + "</p>" + para(L.commander.text) + codexNote(L.commander.codex) }));
    lead.push(gcard({ cls: "leader hero", kind: "Held", state: lockSt, title: nm(L.hero), en: enIf(L.hero),
      body: '<p class="unlock"><b>Freischalten:</b> 3 gewertete Aufträge. Nach Gebrauch vernichtet.</p>' + para(L.hero.text) + codexNote(L.hero.codex) }));

    var units = [gcard({ cls: "unit", kind: "Mech", state: "Kosten " + esc(f.mech.cost), title: nm(f.mech), en: enIf(f.mech), body: statline(f.mech) + para(f.mech.text) + codexNote(f.mech.codex) })];
    (f.units || []).forEach(function (x) {
      units.push(gcard({ cls: "unit", kind: "Statt " + esc(x.replaces), title: nm(x), en: enIf(x), body: statline(x) + para(x.text) + codexNote(x.codex) + upgrade(x.upgrade) }));
    });

    h += '<section class="playarea" aria-label="Spielbereich"><h2>Spielbereich</h2>' +
      '<p class="fine">Was neben dem Bogen liegt: Anführerbogen, Mech und Sondereinheiten, die zwei Fraktionstechnologien und die eigene Vertragskarte.</p>' +
      '<h3 class="pa-h">Anführer</h3><div class="pa-row leaders">' + lead.join("") + "</div>" +
      '<h3 class="pa-h">Einheiten</h3><div class="pa-row">' + units.join("") + "</div>" +
      '<h3 class="pa-h">Fraktionstechnologien</h3><div class="pa-row">' + f.techs.map(function (t) {
        return gcard({ cls: "techc c-" + t.color, kind: esc(COLOR[t.color] || t.color), state: prereq(t.prereq), title: nm(t), en: enIf(t), body: para(t.text) + codexNote(t.codex) });
      }).join("") + "</div>" +
      '<h3 class="pa-h">Vertragskarte</h3><div class="pa-row">' +
      gcard({ cls: "prom", kind: "Vertrag", state: "nur für andere Spieler", title: nm(f.promissory), en: enIf(f.promissory), body: para(f.promissory.text) + codexNote(f.promissory.codex) }) +
      "</div></section>";

    // Originale
    var ult = ULTIMATE[f.id];
    h += '<div class="card origs"><h3>Originalkarten ansehen</h3><p>Die echten Bögen und Karten sind urheberrechtlich geschützt und deshalb hier nachgebaut statt abgebildet.</p><div class="links">' +
      (ult ? '<a class="btn" href="https://ti4ultimate.com/game/factions?faction=' + ult + '" target="_blank" rel="noopener">' + U().svg("ext", 18) + "TI4 Ultimate</a>" : "") +
      '<a class="btn" href="https://twilight-imperium.fandom.com/wiki/Special:Search?query=' + encodeURIComponent(f.en) + '" target="_blank" rel="noopener">' + U().svg("ext", 18) + "Twilight Imperium Wiki</a></div>" +
      '<p class="fine">Beide Seiten sind englisch.</p></div>';

    // Blättern
    var order = FAC.slice().sort(function (a, b) { return a.short.localeCompare(b.short, "de"); });
    var i = order.indexOf(f), prev = order[(i - 1 + order.length) % order.length], next = order[(i + 1) % order.length];
    h += '<nav class="prevnext"><a href="#f-' + prev.id + '">' + U().svg("back", 18) + "<span><small>Vorherige</small>" + esc(prev.short) + "</span></a>" +
      '<a href="#f-' + next.id + '" class="nx"><span><small>Nächste</small>' + esc(next.short) + "</span>" + U().svg("fwd", 18) + "</a></nav>";
    return h;
  }
  function upgrade(x) {
    if (!x) return "";
    return '<div class="upg"><p class="sub-k">Aufwertung: ' + esc(nm(x)) + (x.prereq ? " " + prereq(x.prereq) : "") + "</p>" + stats(x) + para(x.text) + "</div>";
  }

  /* ---------- Technologien ---------- */
  function techCard(t, opt) {
    var tags = prereq(t.prereq) + srcTag(t.src);
    var body = "";
    if (t.unit) {
      body += '<p class="sub-k">Ersetzt: ' + esc(t.unit.replaces) + "</p>" + stats(t.unit) + (t.unit.abilities ? "<p><b>" + esc(t.unit.abilities) + "</b></p>" : "");
    }
    body += para(t.text) + codexNote(t.codex);
    return kc({ id: opt && opt.id, cls: "tech c-" + t.color + " kf-item", title: nm(t), en: enIf(t), tags: tags + (opt && opt.extraTags || ""), body: body });
  }
  function viewTechs() {
    filterText = {};
    var h = back("#nachschlagen", "Nachschlagen") + "<h1>Technologien</h1>" +
      '<p class="lead">Alle ' + TECHS.length + ' allgemeinen Technologien aus Grundspiel und PoK, weiter unten die Fraktionstechnologien. Die farbigen Punkte sind die Voraussetzungen: so viele Technologien dieser Farbe brauchst du vorher.</p>' +
      filterField("kf", "Filtern, z. B. Jäger, Asteroiden", filterQ.tech) +
      '<div class="pq-legend">' + ["G", "B", "Y", "R"].map(function (c) { return '<span><i class="pq ' + c + '"></i>' + PQ[c] + "</span>"; }).join("") + "</div>";
    [["gruen"], ["blau"], ["gelb"], ["rot"], ["einheit"]].forEach(function (g) {
      var c = g[0];
      var list = TECHS.filter(function (t) { return t.color === c; }).sort(function (a, b) { return a.prereq.length - b.prereq.length || nm(a).localeCompare(nm(b), "de"); });
      h += '<section class="kf-group"><h2 class="grp c-' + c + '"><i class="sw"></i>' + esc(COLOR[c]) + (COLOR_SUB[c] ? ' <span class="cs">' + COLOR_SUB[c] + "</span>" : "") + " <small>" + list.length + "</small></h2>" + '<div class="kgrid">' + list.map(function (t) {
        var id = "tech-" + t.id;
        reg(id, [t.de, t.en, t.text, t.codex, COLOR[c], t.unit && t.unit.replaces, t.unit && t.unit.abilities]);
        return techCard(t, { id: id });
      }).join("") + "</div></section>";
    });
    h += '<h2 class="grp">Fraktionstechnologien</h2><p class="fine">Nur für die jeweilige Fraktion erforschbar. Einheiten-Aufwertungen ersetzen die normale Aufwertung.</p>';
    FAC.slice().sort(function (a, b) { return a.short.localeCompare(b.short, "de"); }).forEach(function (f) {
      h += '<section class="kf-group"><h3 class="fgrp"><a href="#f-' + f.id + '">' + esc(nm(f)) + " ›</a></h3>" + '<div class="kgrid">' + f.techs.map(function (t, k) {
        var id = "ftech-" + f.id + "-" + k;
        reg(id, [t.de, t.en, t.text, t.codex, f.short, f.en, COLOR[t.color]]);
        return kc({ id: id, cls: "tech c-" + t.color + " kf-item", title: nm(t), en: enIf(t), tags: '<span class="tc">' + esc(COLOR[t.color] || t.color) + "</span>" + prereq(t.prereq), body: para(t.text) + codexNote(t.codex) });
      }).join("") + "</div></section>";
    });
    return h + emptyNote();
  }

  /* ---------- Karten ---------- */
  var SECS = [["aktion", "Aktionskarten"], ["agenda", "Agenden"], ["auftrag", "Aufträge"], ["relikt", "Relikte"], ["erkundung", "Erkundung"]];
  var agendaAll = false;
  function sortByName(a, b) { return nm(a).localeCompare(nm(b), "de"); }
  function viewCards(sec, focus) {
    filterText = {};
    var h = back("#nachschlagen", "Nachschlagen") + "<h1>Karten</h1>" +
      '<nav class="seg-row scroll" aria-label="Kartenarten">' + SECS.map(function (s) {
        return '<a href="#karten-' + s[0] + '"' + (s[0] === sec ? ' aria-current="page"' : "") + ">" + s[1] + "</a>";
      }).join("") + "</nav>" +
      filterField("kf", "Filtern, z. B. Sabotage, Einmarsch", filterQ.karten);
    var p = "c-" + sec + "-";
    if (sec === "aktion") {
      var ac = (D.actionCards || []).slice().sort(sortByName);
      var total = ac.reduce(function (a, c) { return a + c.count; }, 0);
      h += '<p class="lead">' + total + " Aktionskarten im Stapel (" + ac.length + " verschiedene). Die Zeile „Wann“ sagt, in welchem Moment die Karte gespielt wird. Steht dort Aktion, kostet sie deine Aktion im Zug.</p>";
      h += '<section class="kf-group"><div class="kgrid">' + ac.map(function (c) { return actionCard(c, p); }).join("") + "</div></section>";
      var cx = (D.actionCardsCodex || []).slice().sort(sortByName);
      if (cx.length) {
        h += '<section class="kf-group"><h2 class="grp">Codex I: Zusatzkarten <small>optional</small></h2><p class="fine">Diese ' + cx.length + " Karten mischt man nur ein, wenn der Tisch das so abspricht.</p>" +
          '<div class="kgrid">' + cx.map(function (c) { return actionCard(c, p); }).join("") + "</div></section>";
      }
    } else if (sec === "agenda") {
      var ag = (D.agendas || []).slice().sort(sortByName);
      var inPok = ag.filter(function (a) { return !a.pokRemoved; });
      h += '<p class="lead">Mit PoK besteht der Agendastapel aus ' + inPok.length + " Karten. " + (ag.length - inPok.length) + " Agenden des Grundspiels werden dafür aussortiert.</p>" +
        '<div class="seg-row wide" role="group" aria-label="Agenden"><button type="button" data-act="agenda-all" data-v="0" aria-pressed="' + (!agendaAll) + '">Stapel mit PoK (' + inPok.length + ')</button><button type="button" data-act="agenda-all" data-v="1" aria-pressed="' + agendaAll + '">Alle (' + ag.length + ")</button></div>";
      var show = agendaAll ? ag : inPok;
      h += '<section class="kf-group"><div class="kgrid">' + show.map(function (a) {
        var id = p + a.id;
        reg(id, [a.de, a.en, a.type, a.elect, a.text, a.for, a.against]);
        var body = (a.elect ? '<p class="when"><b>Wahl:</b> ' + md(a.elect) + "</p>" : "") + para(a.text) +
          (a.for ? "<p><b>" + (a.elect ? "Ergebnis:" : "Dafür:") + "</b> " + md(a.for) + "</p>" : "") + (a.against ? "<p><b>Dagegen:</b> " + md(a.against) + "</p>" : "");
        return kc({ id: id, cls: "kf-item" + (a.type === "Gesetz" ? " law" : " directive"), title: nm(a), en: enIf(a),
          tags: tag(a.type, a.type === "Gesetz" ? "law" : "dir") + srcTag(a.src) + (a.pokRemoved ? tag("ohne PoK", "gone") : ""), body: body });
      }).join("") + "</div></section>";
    } else if (sec === "auftrag") {
      var ob = D.objectives || [];
      h += '<p class="lead">Öffentliche Aufträge Stufe I bringen 1 Siegpunkt, Stufe II 2 Siegpunkte. Geheime Aufträge bringen 1 Siegpunkt, die Phase sagt, wann gewertet wird.</p>';
      [["I", "Stufe I"], ["II", "Stufe II"], ["geheim", "Geheime Aufträge"]].forEach(function (g) {
        var list = ob.filter(function (o) { return o.type === g[0]; }).sort(function (a, b) { return (a.src === b.src ? 0 : a.src === "base" ? -1 : 1) || sortByName(a, b); });
        h += '<section class="kf-group"><h2 class="grp">' + g[1] + " <small>" + list.length + "</small></h2>" + '<div class="kgrid">' + list.map(function (o) {
          var id = p + o.id;
          reg(id, [o.de, o.en, o.text, g[1], o.phase]);
          return kc({ id: id, cls: "kf-item obj t" + o.type, title: nm(o), en: enIf(o), tags: tag(o.points + " SP", "pts") + tag(PHASE[o.phase] || o.phase, "ph") + srcTag(o.src), body: para(o.text) });
        }).join("") + "</div></section>";
      });
    } else if (sec === "relikt") {
      var rl = (D.relics || []).slice().sort(sortByName);
      h += '<p class="lead">Relikte gibt es nur mit PoK. Man bekommt sie vor allem für 3 Reliktfragmente desselben Typs (unbekannte zählen als jeder Typ).</p>';
      h += '<section class="kf-group"><div class="kgrid">' + rl.map(function (r) {
        var id = p + r.id;
        reg(id, [r.de, r.en, r.text]);
        return kc({ id: id, cls: "kf-item relic", title: nm(r), en: enIf(r), body: para(r.text) });
      }).join("") + "</div></section>";
    } else if (sec === "erkundung") {
      var ex = D.explore || [];
      h += '<p class="lead">Erkundet wird beim Übernehmen eines Planeten mit dem Stapel seines Merkmals, und mit Wilder-Raum-Markern über den Wilder-Raum-Stapel.</p>';
      [["kulturell", "Kulturell"], ["gefährlich", "Gefährlich"], ["industriell", "Industriell"], ["wilder-raum", "Wilder Raum"]].forEach(function (g) {
        var list = ex.filter(function (e) { return e.deck === g[0]; }).sort(sortByName);
        var n = list.reduce(function (a, e) { return a + e.count; }, 0);
        h += '<section class="kf-group"><h2 class="grp d-' + g[0] + '"><i class="sw"></i>' + g[1] + " <small>" + n + " Karten</small></h2>" + '<div class="kgrid">' + list.map(function (e) {
          var id = p + e.id;
          reg(id, [e.de, e.en, e.text, g[1]]);
          return kc({ id: id, cls: "kf-item", title: nm(e), en: enIf(e), tags: tag("×" + e.count, "cnt"), body: para(e.text) });
        }).join("") + "</div></section>";
      });
    }
    return h + emptyNote() + '<p class="fine">Kartenwirkungen sinngemäß und gekürzt. Gespielt wird immer nach dem Text der echten Karte.</p>';
  }
  function actionCard(c, p) {
    var id = p + c.id;
    reg(id, [c.de, c.en, c.timing, c.text, c.rider ? "Nachtrag" : ""]);
    return kc({ id: id, cls: "kf-item ac", title: nm(c), en: enIf(c),
      tags: (c.count > 1 ? tag("×" + c.count, "cnt") : "") + (c.rider ? tag("Nachtrag", "rider") : "") + srcTag(c.src),
      body: '<p class="when"><b>Wann:</b> ' + md(c.timing) + "</p>" + para(c.text) + codexNote(c.codex) });
  }

  /* ---------- Registrierung ---------- */
  var lastSec = "aktion";
  D.ext.push({
    parse: function (h) {
      var base = { tab: "nachschlagen" };
      if (h === "fraktionen") return Object.assign(base, { rail: "fraktionen", title: "Fraktionen", page: "fac" });
      if (h.indexOf("f-") === 0 && facById[h.slice(2)]) return Object.assign(base, { rail: "fraktionen", title: facById[h.slice(2)].short, page: "facd", id: h.slice(2) });
      if (h === "technologien") return Object.assign(base, { rail: "technologien", title: "Technologien", page: "tech" });
      if (h.indexOf("tech-") === 0 && techById[h.slice(5)]) return Object.assign(base, { rail: "technologien", title: "Technologien", page: "tech", focusEl: h });
      if (h === "karten") return Object.assign(base, { rail: "karten", title: "Karten", page: "cards", sec: lastSec });
      var m = /^karten-([a-z]+)$/.exec(h);
      if (m && SECS.some(function (s) { return s[0] === m[1]; })) return Object.assign(base, { rail: "karten", title: "Karten", page: "cards", sec: m[1] });
      m = /^c-([a-z]+)-(.+)$/.exec(h);
      if (m && SECS.some(function (s) { return s[0] === m[1]; })) return Object.assign(base, { rail: "karten", title: "Karten", page: "cards", sec: m[1], focusEl: h });
      return null;
    },
    render: function (r) {
      if (r.page === "fac") return viewFactions();
      if (r.page === "facd") return viewFaction(r.id);
      if (r.page === "tech") return viewTechs();
      if (r.page === "cards") {
        lastSec = r.sec;
        if (r.sec === "agenda" && r.focusEl) { var a = (D.agendas || []).filter(function (x) { return "c-agenda-" + x.id === r.focusEl; })[0]; if (a && a.pokRemoved) agendaAll = true; }
        return viewCards(r.sec);
      }
      return "";
    },
    after: function (r) {
      var key = r.page === "fac" ? "fac" : r.page === "tech" ? "tech" : r.page === "cards" ? "karten" : null;
      if (key && filterQ[key]) applyFilter(filterQ[key]);
      if (r.focusEl) { var el = document.getElementById(r.focusEl); if (el) { el.classList.add("flash"); if (el.hidden) { filterQ[key] = ""; var inp = document.getElementById("kf"); if (inp) inp.value = ""; applyFilter(""); } } }
    },
    click: function (a, t) {
      if (a === "fs-side") {
        sheetSide = t.getAttribute("data-side");
        var sh = document.getElementById("fsheet"); if (!sh) return true;
        sh.setAttribute("data-side", sheetSide);
        sh.querySelector(".fs-front").inert = sheetSide === "back";
        sh.querySelector(".fs-back").inert = sheetSide !== "back";
        document.querySelectorAll('[data-act="fs-side"]').forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-side") === sheetSide)); });
        return true;
      }
      if (a === "agenda-all") { agendaAll = t.getAttribute("data-v") === "1"; U().rerender(); return true; }
      return false;
    },
    input: function (ev) {
      if (!ev.target.getAttribute || !ev.target.getAttribute("data-kfilter")) return false;
      var r = U().route(), key = r.page === "fac" ? "fac" : r.page === "tech" ? "tech" : "karten";
      filterQ[key] = ev.target.value;
      applyFilter(ev.target.value);
      return true;
    },
    index: function (push) {
      FAC.forEach(function (f) {
        var href = "#f-" + f.id, who = f.short;
        push({ ty: "Fraktion", t: nm(f), txt: [f.en, f.short, f.play, f.home.map(function (p) { return p.name; }).join(" "), f.abilities.map(function (a) { return [a.de, a.en, a.text].join(" "); }).join(" ")].join(" "), href: href, w: 3 });
        f.abilities.forEach(function (a) { push({ ty: "Fähigkeit · " + who, t: nm(a), txt: [a.en, a.text].join(" "), href: href, w: 2 }); });
        push({ ty: "Flaggschiff · " + who, t: nm(f.flagship), txt: f.flagship.text, href: href, w: 2 });
        push({ ty: "Mech · " + who, t: nm(f.mech), txt: f.mech.text, href: href, w: 2 });
        (f.units || []).forEach(function (u) { push({ ty: "Einheit · " + who, t: nm(u), txt: [u.en, u.replaces, u.text].join(" "), href: href, w: 2 }); });
        f.techs.forEach(function (t) { push({ ty: "Fraktionstechnologie · " + who, t: nm(t), txt: [t.en, t.text].join(" "), href: href, w: 2 }); });
        f.leaders.agents.forEach(function (a) { push({ ty: "Agent · " + who, t: nm(a), txt: a.text, href: href, w: 2 }); });
        push({ ty: "Commander · " + who, t: nm(f.leaders.commander), txt: [f.leaders.commander.unlock, f.leaders.commander.text].join(" "), href: href, w: 2 });
        push({ ty: "Held · " + who, t: nm(f.leaders.hero), txt: f.leaders.hero.text, href: href, w: 2 });
        push({ ty: "Vertragskarte · " + who, t: nm(f.promissory), txt: f.promissory.text, href: href, w: 2 });
        f.home.forEach(function (p) { push({ ty: "Heimatplanet · " + who, t: p.name, txt: p.res + " Ressourcen, " + p.inf + " Einfluss", href: href, w: 1 }); });
      });
      TECHS.forEach(function (t) { push({ ty: "Technologie · " + COLOR[t.color], t: nm(t), txt: [t.en, t.text, t.unit ? t.unit.replaces : ""].join(" "), href: "#tech-" + t.id, w: 2 }); });
      (D.actionCards || []).concat(D.actionCardsCodex || []).forEach(function (c) { push({ ty: "Aktionskarte" + (c.src === "codex1" ? " · Codex" : ""), t: nm(c), txt: [c.en, c.timing, c.text].join(" "), href: "#c-aktion-" + c.id, w: 2 }); });
      (D.agendas || []).forEach(function (a) { push({ ty: "Agenda · " + a.type, t: nm(a), txt: [a.en, a.elect, a.text, a.for, a.against].join(" "), href: "#c-agenda-" + a.id, w: 2 }); });
      (D.objectives || []).forEach(function (o) { push({ ty: o.type === "geheim" ? "Geheimer Auftrag" : "Auftrag Stufe " + o.type, t: nm(o), txt: [o.en, o.text].join(" "), href: "#c-auftrag-" + o.id, w: 2 }); });
      (D.relics || []).forEach(function (r) { push({ ty: "Relikt", t: nm(r), txt: [r.en, r.text].join(" "), href: "#c-relikt-" + r.id, w: 2 }); });
      (D.explore || []).forEach(function (e) { push({ ty: "Erkundung · " + e.deck.replace("-", " "), t: nm(e), txt: [e.en, e.text].join(" "), href: "#c-erkundung-" + e.id, w: 1 }); });
    }
  });
})();
