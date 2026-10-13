/* Spielvorbereitung: Aufbau-Schema je Spielerzahl und Kartengenerator. Nutzt TI4.Map und TI4.UI (kommt aus app.js). */
(function () {
  "use strict";
  var D = window.TI4;
  var M = D.Map;
  D.ext = D.ext || [];
  function U() { return D.UI; }

  var LAYOUTS = D.layouts;
  var byId = {}; LAYOUTS.forEach(function (l) { byId[l.id] = l; });
  var COUNTS = [3, 4, 5, 6, 7, 8];
  function variants(n) { return LAYOUTS.filter(function (l) { return l.players === n; }); }
  var VARIANT_LABEL = { "3": "Standard", "4": "Standard", "5": "Standard", "5h": "Mit Hyperrouten", "6": "Standard", "6g": "Große Galaxie", "7": "Standard", "7a": "Alternative", "8": "Standard", "8a": "Alternative" };
  var TRAIT = { c: "kulturell", h: "gefährlich", i: "industriell" };

  /* ---------- Gemeinsame Bausteine ---------- */
  function countRow(act, cur) {
    return '<div class="seg-row" role="group" aria-label="Spielerzahl">' + COUNTS.map(function (n) {
      return '<button type="button" data-act="' + act + '" data-n="' + n + '" aria-pressed="' + (n === cur ? "true" : "false") + '">' + n + "</button>";
    }).join("") + "</div>";
  }
  function variantRow(act, layout) {
    var vs = variants(layout.players);
    if (vs.length < 2) return "";
    return '<div class="seg-row wide" role="group" aria-label="Variante">' + vs.map(function (l) {
      return '<button type="button" data-act="' + act + '" data-l="' + l.id + '" aria-pressed="' + (l.id === layout.id ? "true" : "false") + '">' + U().esc(VARIANT_LABEL[l.id]) + "</button>";
    }).join("") + "</div>";
  }
  function dec(v) { return v.toFixed(1).replace(".", ","); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function dealText(l) { return plural(l.deal.blue, "blaue", "blaue") + " und " + plural(l.deal.red, "rote", "rote"); }
  function extraText(l) {
    if (!l.extra) return "";
    var p = [];
    if (l.extra.red) p.push(l.extra.red + " rote");
    if (l.extra.blue) p.push(l.extra.blue + " blaue");
    return p.join(" und ");
  }
  function tgText(l) {
    if (!l.tg) return "";
    var seats = M.seatOrder(l.homes);
    return Object.keys(l.tg).map(function (pos) { return "P" + (seats.indexOf(+pos) + 1) + ": " + l.tg[pos]; }).join(", ");
  }
  function rings(l) {
    var max = 0; [].concat(l.homes, l.slots).forEach(function (i) { if (M.POS[i].ring > max) max = M.POS[i].ring; });
    return max;
  }

  /* ---------- Aufbau-Ansicht ---------- */
  var setupId = U0("ti4.v2.setup", "6");
  function U0(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }

  function viewAufbau(route) {
    var ui = U(), esc = ui.esc, md = ui.md;
    var l = byId[route.layout] || byId[setupId] || byId["6"];
    var seats = M.seatOrder(l.homes), hasRing4 = rings(l) === 4;
    var h = '<p class="eyebrow">Spielvorbereitung</p><h1>Aufbau</h1>' +
      '<p class="lead">So sieht die Galaxie für eure Spielerzahl aus, so viele Systemtafeln bekommt jeder, und darunter steht der komplette Aufbau als Checkliste.</p>' +
      '<p class="section-k">Spielerzahl</p>' + countRow("setup-n", l.players) + variantRow("setup-l", l);

    // Schema
    var legend = [["#e07a2e", "Mecatol Rex"], [M.RING_COL[1], "1. Ring"], [M.RING_COL[2], "2. Ring"], [M.RING_COL[3], "3. Ring"]];
    if (hasRing4) legend.push([M.RING_COL[4], "4. Ring"]);
    legend.push(["#3f9a54", "Heimat-System"]);
    if (l.hyper.length) legend.push(["#e9b72a", "Hyperroute"]);
    h += '<figure class="board schema">' + M.boardSVG(l, null, "schema", { uid: "s" + l.id, label: "Aufbau-Schema " + l.name }) +
      '<figcaption><span class="legend">' + legend.map(function (x) { return '<span><i style="background:' + x[0] + '"></i>' + esc(x[1]) + "</span>"; }).join("") + "</span>" +
      '<span class="cap">P1 bis P' + l.players + " im Uhrzeigersinn, Spieler sitzen am Tisch in derselben Reihenfolge wie ihre Heimat-Systeme." + (l.tg ? " „+2 HW“ heißt: so viele Handelswaren als Ausgleich." : "") + "</span></figcaption></figure>";

    // Kennzahlen
    var kv = [[dealText(l), "Systemtafeln für jeden Spieler"]];
    if (l.extra) kv.push([extraText(l), "legt der Sprecher vorab offen an Mecatol Rex an"]);
    if (l.hyper.length) kv.push([l.hyper.length + " Hyperrouten", l.hyper.map(function (x) { return x[1]; }).join(", ")]);
    if (l.tg) kv.push(["Ausgleich", "Handelswaren beim Start: " + tgText(l)]);
    kv.push([(l.slots.length + 1) + " Systeme", rings(l) + " Ringe um Mecatol Rex, ohne Heimat-Systeme"]);
    kv.push([l.pok ? "Nur mit PoK" : "Auch ohne PoK", l.pok ? "braucht Tafeln aus Prophezeiung der Könige" : "geht schon mit den Tafeln des Grundspiels"]);
    h += '<div class="kv">' + kv.map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("") + "</div>";

    // Ablauf des Zusammensetzens
    var steps = [
      "**Mecatol Rex** (Tafel 18) in die Mitte legen. Den **Wurmloch-Nexus** (Tafel 82) mit der Seite, die nur das Gamma-Wurmloch zeigt, neben den Spielplan legen, die 3 Gamma-Wurmlochmarker dazu."
    ];
    if (l.hyper.length) steps.push("**Hyperrouten** heraussuchen und genau wie im Schema legen, auch die Drehung muss stimmen: " + l.hyper.map(function (x) { return x[1]; }).join(", ") + ".");
    steps.push("Jeder legt sein **Heimat-System** ungefähr an seinen grünen Platz, damit klar ist, wo die Galaxie endet.");
    steps.push("Systemtafeln nach Rückseite in einen **blauen** und einen **roten** Stapel sortieren (grüne sind Heimat-Systeme), beide verdeckt mischen und jedem Spieler **" + dealText(l) + "** austeilen.");
    if (l.extra) steps.push("Der Sprecher zieht zusätzlich **" + extraText(l) + "** Tafeln und legt sie offen auf freie Felder neben Mecatol Rex.");
    steps.push("**Reihum legen:** Der Sprecher beginnt, im Uhrzeigersinn legt jeder 1 Tafel offen in den 1. Ring. Der Letzte legt gleich 2, dann geht es gegen den Uhrzeigersinn zurück, bis der Sprecher 2 legt, und so weiter hin und her.");
    steps.push("Ein Ring muss **ganz geschlossen** sein, bevor im nächsten gelegt wird. **Anomalien** nicht nebeneinander und **gleiche Wurmlöcher** nicht nebeneinander, solange es irgendwie anders geht.");
    steps.push("Zum Schluss die **Heimat-Systeme** an ihre Plätze anlegen." + (l.tg ? " Ausgleich in Handelswaren: " + tgText(l) + "." : ""));
    steps.push("**Wilder-Raum-Marker** auf jedes Nicht-Heimat-System ohne Planeten, den **Hütermarker** auf Mecatol Rex.");
    h += "<h2>Galaxie zusammensetzen</h2>" + '<ol class="steps">' + steps.map(function (x) { return "<li><span>" + md(x) + "</span></li>"; }).join("") + "</ol>";
    h += '<a class="btn primary go" href="#gen-' + l.id + "-" + newSeed() + "-" + defaultFlags(l) + '">' + ui.svg("dice", 22) + '<span class="txt">Zufällige Galaxie für ' + esc(l.name) + ' erzeugen</span><span class="arr">›</span></a>';
    h += '<div class="note tip"><p><b>Sonderfälle:</b> Die Geister von Creuss legen das Tor von Creuss (Tafel 17) auf ihren Heimatplatz, ihr eigentliches Heimat-System (Tafel 51) liegt neben dem Spielplan. Der Council Keleres nimmt das Heimat-System der gewählten Herkunft (Mentak, Xxcha oder Argent), die dann nicht mitspielen kann.</p></div>';

    // Komplette Checkliste aus dem Thema „Aufbau“
    var t = ui.topicById.aufbau;
    h += "<h2>Kompletter Aufbau</h2>" + '<p class="lead">Alle zwölf Schritte der Living Rules Reference zum Abhaken.</p>' + ui.blocks(t.blocks.filter(function (b) { return b.check || b.rules; }));
    h += '<details class="q"><summary>Tafeln pro Spieler für alle Zusammensetzungen</summary><div class="a">' + ui.blocks(t.blocks.filter(function (b) { return b.table; })) + "</div></details>";
    return h;
  }

  /* ---------- Kartengenerator ---------- */
  var DEF = { layout: "6", pok: true, balance: true, wormholes: true, legendary: 0 };
  var genPrefs = Object.assign({}, DEF, U0("ti4.v2.gen", {}));
  var lastGen = U0("ti4.v2.genlast", null);
  var cache = {};
  var running = null;
  var zoom = 1;
  var selPos = null;

  function newSeed() { return 10000 + Math.floor(Math.random() * 89999990); }
  function defaultFlags(l) { return flagsOf({ pok: true, balance: true, wormholes: true, legendary: 0 }, l); }
  function flagsOf(o, l) { return ((o.pok || (l && l.pok)) ? "p" : "") + (o.balance ? "b" : "") + (o.wormholes ? "w" : "") + (o.legendary ? "l" + o.legendary : "") || "x"; }
  function parseFlags(f) {
    f = f || "";
    var m = /l(\d)/.exec(f);
    return { pok: f.indexOf("p") > -1, balance: f.indexOf("b") > -1, wormholes: f.indexOf("w") > -1, legendary: m ? +m[1] : 0 };
  }
  function genHash(o) { return "gen-" + o.layout + "-" + o.seed + "-" + flagsOf(o, byId[o.layout]); }
  function keyOf(o) { return genHash(o); }

  function viewGenerator(route) {
    var ui = U(), esc = ui.esc;
    var o = route.opts, l = byId[o.layout];
    var pokForced = !!l.pok;
    var h = '<a class="back" href="#aufbau-' + l.id + '">' + ui.svg("back", 18) + "Aufbau</a>" +
      "<h1>Kartengenerator</h1>" +
      '<p class="lead">Würfelt eine Galaxie nach den offiziellen Aufbau-Regeln: keine Anomalien und keine gleichen Wurmlöcher nebeneinander, jeder Platz mit ähnlich viel in Reichweite.</p>' +
      '<div class="card gen-set">' +
      '<p class="section-k">Spielerzahl</p>' + countRow("gen-n", l.players) + variantRow("gen-l", l) +
      '<details class="opts"' + (U0("ti4.v2.genopen", false) ? " open" : "") + '><summary><span>Optionen</span><span class="sum">' + esc(optSummary(o, pokForced)) + "</span></summary>" +
      '<div class="toggles">' +
      toggle("pok", "Tafeln aus Prophezeiung der Könige", pokForced ? "Für diesen Aufbau nötig" : "Aus: nur Tafeln des Grundspiels", o.pok || pokForced, pokForced) +
      toggle("balance", "Ausgewogen", "Ressourcen, Einfluss und Spezialisierungen fair verteilen", o.balance, false) +
      toggle("wormholes", "Wurmlöcher sicher dabei", "Mindestens 2 Alpha- und 2 Beta-Wurmlöcher", o.wormholes, false) +
      "</div>" +
      '<p class="section-k">Legendäre Planeten mindestens</p><div class="seg-row" role="group" aria-label="Legendäre Planeten">' + [0, 1, 2].map(function (n) {
        var dis = !(o.pok || pokForced) && n > 0;
        return '<button type="button" data-act="gen-leg" data-n="' + n + '" aria-pressed="' + (o.legendary === n ? "true" : "false") + '"' + (dis ? " disabled" : "") + ">" + n + "</button>";
      }).join("") + "</div></details>" +
      '<button type="button" class="btn primary" data-act="gen-roll">' + ui.svg("dice", 22) + '<span class="txt">Neue Galaxie würfeln</span><span class="arr">›</span></button>' +
      "</div>" +
      '<div id="gen-out" class="gen-out">' + progressHTML(0) + "</div>";
    return h;
  }
  function optSummary(o, pokForced) {
    var p = [(o.pok || pokForced) ? "mit PoK-Tafeln" : "nur Grundspiel"];
    if (o.balance) p.push("ausgewogen");
    if (o.wormholes) p.push("Wurmlöcher");
    if (o.legendary) p.push(o.legendary + " legendär");
    return p.join(" · ");
  }
  function toggle(key, label, sub, on, disabled) {
    var id = "gt-" + key;
    return '<label class="tgl" for="' + id + '"><input type="checkbox" id="' + id + '" data-gen="' + key + '"' + (on ? " checked" : "") + (disabled ? " disabled" : "") + '><span class="sw" aria-hidden="true"></span><span><span class="t">' + U().esc(label) + '</span><span class="s">' + U().esc(sub) + "</span></span></label>";
  }
  function progressHTML(p) {
    return '<div class="gen-wait"><div class="bar"><i style="width:' + Math.round(p * 100) + '%"></i></div><p>Galaxie wird gewürfelt und ausgeglichen …</p></div>';
  }

  function startGen(route) {
    var o = route.opts, key = keyOf(o);
    var out = document.getElementById("gen-out");
    if (!out) return;
    if (cache[key]) { showResult(cache[key]); return; }
    var g = M.generator({ layout: o.layout, seed: o.seed, pok: o.pok || !!byId[o.layout].pok, balance: o.balance, wormholes: o.wormholes, legendary: o.legendary });
    if (g.error) { out.innerHTML = '<div class="note warn"><p>' + U().esc(g.error) + "</p></div>"; return; }
    var token = {}; running = token;
    var t0 = Date.now();
    (function tick() {
      if (running !== token) return;
      var end = Date.now() + 40, done = false;
      while (!done && Date.now() < end) done = g.step(25);
      if (done) {
        var res = g.result(); cache[key] = res; running = null;
        lastGen = { layout: o.layout, seed: o.seed, flags: flagsOf(o, byId[o.layout]) };
        try { localStorage.setItem("ti4.v2.genlast", JSON.stringify(lastGen)); } catch (e) {}
        showResult(res);
        return;
      }
      var bar = out.querySelector(".gen-wait i");
      if (bar) bar.style.width = Math.round(g.progress() * 100) + "%";
      else if (Date.now() - t0 > 120) out.innerHTML = progressHTML(g.progress());
      setTimeout(tick, 0);
    })();
  }

  function showResult(res) {
    var out = document.getElementById("gen-out"); if (!out) return;
    var ui = U(), esc = ui.esc;
    var l = res.layout, list = M.tileList(res);
    selPos = null;
    var h = '<div class="board-tools"><span class="seed">Karte Nr. ' + res.seed + "</span><span class=\"spacer\"></span>" +
      '<button type="button" class="tool" data-act="zoom" data-z="-1" aria-label="Verkleinern">−</button>' +
      '<button type="button" class="tool" data-act="zoom" data-z="0" aria-label="Ganze Karte">' + Math.round(zoom * 100) + " %</button>" +
      '<button type="button" class="tool" data-act="zoom" data-z="1" aria-label="Vergrößern">+</button></div>' +
      '<div class="board tiles"><div class="board-scroll' + (zoom > 1 ? " zoomed" : "") + '" id="board-scroll"><div class="board-inner" style="width:' + (zoom * 100) + '%">' +
      M.boardSVG(l, res.board, "tiles", { uid: "g", label: "Erzeugte Galaxie " + l.name }) + "</div></div></div>" +
      '<div class="hexinfo" id="hexinfo"><p class="hint">Tippe auf ein System für Details. Mit + vergrößern, die Karte lässt sich dann verschieben.</p></div>';

    // Ausgleich
    var ev = res.eval, seats = ev.seats;
    h += "<h2>Ausgleich je Platz</h2>" +
      '<div class="tbl"><table class="balance"><thead><tr><th>Platz</th><th>Res.</th><th>Einfl.</th><th>Spez.</th><th class="opt">Leg.</th><th class="opt">Wurml.</th><th>Wert</th></tr></thead><tbody>' +
      seats.map(function (S, k) {
        var tg = l.tg && l.tg[String(S.home)];
        return '<tr><td><span class="seat" style="background:' + M.SEAT[k % 8] + '"></span>P' + (k + 1) + (k === 0 ? " <small>Sprecher</small>" : "") + (tg ? " <small>+" + tg + " HW</small>" : "") + "</td>" +
          [S.R, S.I, S.skip, S.leg, S.wh].map(function (v, j) { return '<td class="num' + (j > 2 ? " opt" : "") + '">' + dec(v) + "</td>"; }).join("") +
          '<td class="num"><b>' + dec(S.score) + "</b></td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="fine">Gezählt wird, was jeder Platz in Reichweite hat: Systeme direkt nebenan voll, 2 Felder entfernt zu 60 %, 3 Felder entfernt zu 30 %. Liegt ein System gleich weit von mehreren Plätzen, teilen sie es sich. Wurmlöcher und Hyperrouten zählen als Verbindung. Je Planet zählt der höhere Wert von Ressourcen und Einfluss. Unterschied zwischen bestem und schwächstem Platz: <b>' + dec(ev.spread) + "</b>" +
      (res.violations ? ". Achtung: " + res.violations + " Nachbarschaft(en) von Anomalien oder gleichen Wurmlöchern ließen sich nicht vermeiden." : ".") + "</p>";

    // Tafeln aus der Schachtel
    var frontier = l.slots.filter(function (p) { var t = D.tiles[res.board[p]]; return t && !(t.p && t.p.length); }).length;
    h += "<h2>Aus der Schachtel holen</h2>" +
      '<div class="pull">' +
      pullRow("Mitte", ["18"], "") +
      pullRow("Blau", list.blue, "blue") +
      pullRow("Rot", list.red, "red") +
      (list.hyper.length ? pullRow("Hyperrouten", list.hyper, "hyper") : "") +
      "</div>" +
      '<ul class="plain"><li>Dazu je Spieler das Heimat-System seiner Fraktion auf den grünen Platz.</li>' +
      "<li><b>" + frontier + " Wilder-Raum-Marker</b> für die Systeme ohne Planeten.</li>" +
      "<li>Den <b>Wurmloch-Nexus</b> (Tafel 82) mit der Gamma-Seite neben den Spielplan.</li></ul>";

    // Teilen
    var code = M.mapString(res);
    h += "<h2>Teilen</h2>" +
      '<div class="share"><button type="button" class="btn" data-act="gen-link">' + ui.svg("copy", 20) + "Link zu dieser Karte kopieren</button>" +
      '<p class="fine">Der Link öffnet genau diese Karte wieder. Darunter steht der Kartencode: die Tafelnummern ab Position 1, Ring für Ring im Uhrzeigersinn ab oben, 0 für Heimat-Systeme, Hyperrouten mit Drehung.</p>' +
      '<div class="codebox"><code id="mapcode">' + esc(code) + '</code><button type="button" class="tool" data-act="gen-code" aria-label="Kartencode kopieren">' + ui.svg("copy", 18) + "</button></div></div>";
    out.innerHTML = h;
  }
  function pullRow(label, ids, cls) {
    return '<div class="pull-row"><span class="k">' + U().esc(label) + (ids.length > 1 ? " · " + ids.length : "") + '</span><span class="ids">' +
      ids.map(function (id) { return '<button type="button" class="tileno ' + cls + '" data-act="tile" data-id="' + id + '">' + id + "</button>"; }).join("") + "</span></div>";
  }

  function showHex(pos) {
    var box = document.getElementById("hexinfo"); if (!box) return;
    var route = U().route(), res = cache[keyOf(route.opts)]; if (!res) return;
    var l = res.layout, esc = U().esc;
    selPos = pos;
    var ring = document.querySelector("#board-scroll .selring");
    if (ring) ring.setAttribute("points", M.hexPointsAt(pos));
    var seats = M.seatOrder(l.homes), k = seats.indexOf(pos);
    var hy = l.hyper.filter(function (x) { return x[0] === pos; })[0];
    var where = pos === 0 ? "Mitte" : M.POS[pos].ring + ". Ring";
    if (k > -1) {
      var tg = l.tg && l.tg[String(pos)];
      box.innerHTML = '<div class="hx-text"><p class="eyebrow">' + where + "</p><h3>Heimat-System P" + (k + 1) + (k === 0 ? " (Sprecher)" : "") + "</h3><p>Hier kommt das Heimat-System der Fraktion hin, die auf diesem Platz sitzt." + (tg ? " Ausgleich: " + tg + " Handelswaren zum Start." : "") + "</p></div>";
      return;
    }
    var id = pos === 0 ? "18" : hy ? hy[1] : res.board[pos];
    if (!id) { box.innerHTML = ""; return; }
    box.innerHTML = tileInfo(id, where + (hy ? " · Hyperroute" : ""));
  }
  function tileInfo(id, where) {
    var esc = U().esc, t = D.tiles[id];
    var back = t.x ? "Sondertafel" : ({ blue: "blaue Rückseite", red: "rote Rückseite", green: "Heimat-System", hyperlane: "Hyperroute" }[t.k] || "");
    var rows = (t.p || []).map(function (p) {
      var sk = p[4].replace("L", "").split("").map(function (c) { return '<i class="skip ' + c + '"></i>'; }).join("");
      return '<li><b>' + esc(p[0]) + '</b> <span class="ri"><span class="r">' + p[1] + '</span><span class="i">' + p[2] + "</span></span>" +
        (p[3] ? ' <span class="tr ' + p[3] + '">' + TRAIT[p[3]] + "</span>" : "") + sk + (p[4].indexOf("L") > -1 ? ' <span class="tag">legendär</span>' : "") + "</li>";
    }).join("");
    return '<div class="hx-tile">' + M.singleTile(id, 132) + '</div><div class="hx-text"><p class="eyebrow">' + esc(where || "") + "</p>" +
      "<h3>Tafel " + esc(id) + ' <small>' + back + (t.src === "pok" ? " · PoK" : "") + "</small></h3>" +
      (rows ? '<ul class="planets">' + rows + "</ul>" : "") +
      (t.k === "hyperlane" ? "<p>Keine Systemtafel: Schiffe können hier nicht anhalten. Die Systeme an beiden Enden einer Linie gelten als benachbart.</p>" : "<p>" + esc(M.tileText(id)) + "</p>") + "</div>";
  }

  function copyText(text, btn) {
    function ok() { if (!btn) return; var o = btn.innerHTML; btn.classList.add("done"); btn.setAttribute("data-old", o); btn.innerHTML = btn.classList.contains("tool") ? "✓" : "✓ Kopiert"; setTimeout(function () { btn.innerHTML = btn.getAttribute("data-old"); btn.classList.remove("done"); }, 1600); }
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  function setPrefs(o) {
    genPrefs = { layout: o.layout, pok: o.pok, balance: o.balance, wormholes: o.wormholes, legendary: o.legendary };
    try { localStorage.setItem("ti4.v2.gen", JSON.stringify(genPrefs)); } catch (e) {}
  }
  function goGen(o) { setPrefs(o); U().go(genHash(o)); }

  /* ---------- Registrierung ---------- */
  D.ext.push({
    parse: function (h) {
      if (h === "aufbau" || h === "t-aufbau") return { tab: "aufbau", rail: "aufbau", title: "Aufbau", page: "aufbau", layout: setupId };
      if (h.indexOf("aufbau-") === 0 && byId[h.slice(7)]) return { tab: "aufbau", rail: "aufbau", title: "Aufbau", page: "aufbau", layout: h.slice(7) };
      if (h === "generator") {
        var o;
        if (lastGen && byId[lastGen.layout]) { o = parseFlags(lastGen.flags); o.layout = lastGen.layout; o.seed = lastGen.seed >>> 0; }
        else { o = Object.assign({}, genPrefs); o.seed = newSeed(); }
        return { tab: "aufbau", rail: "generator", title: "Kartengenerator", page: "gen", opts: o };
      }
      var m = /^gen-([0-9a-z]+)-(\d+)(?:-([a-z0-9]*))?$/.exec(h);
      if (m && byId[m[1]]) {
        var f = parseFlags(m[3] || "pbw");
        f.layout = m[1]; f.seed = (+m[2]) >>> 0;
        if (byId[f.layout].pok) f.pok = true;
        return { tab: "aufbau", rail: "generator", title: "Kartengenerator", page: "gen", opts: f };
      }
      return null;
    },
    render: function (route) {
      if (route.page === "aufbau") return viewAufbau(route);
      return viewGenerator(route);
    },
    after: function (route) {
      if (route.page === "gen") startGen(route); else running = null;
    },
    click: function (a, t, ev) {
      var route = U().route();
      if (a === "setup-n" || a === "setup-l") {
        var id = a === "setup-l" ? t.getAttribute("data-l") : String(variants(+t.getAttribute("data-n"))[0].id);
        setupId = id; try { localStorage.setItem("ti4.v2.setup", JSON.stringify(id)); } catch (e) {}
        U().go("aufbau-" + id); return true;
      }
      if (route.page !== "gen") return false;
      var o = Object.assign({}, route.opts);
      if (a === "gen-n") { var vs = variants(+t.getAttribute("data-n")); o.layout = vs[0].id; goGen(o); return true; }
      if (a === "gen-l") { o.layout = t.getAttribute("data-l"); goGen(o); return true; }
      if (a === "gen-leg") { o.legendary = +t.getAttribute("data-n"); goGen(o); return true; }
      if (a === "gen-roll") { o.seed = newSeed(); goGen(o); return true; }
      if (a === "zoom") {
        var z = +t.getAttribute("data-z"), steps = [1, 1.5, 2, 3];
        var i = steps.indexOf(zoom); if (i < 0) i = 0;
        zoom = z === 0 ? 1 : steps[Math.max(0, Math.min(steps.length - 1, i + z))];
        var inner = document.querySelector(".board-inner"), sc = document.getElementById("board-scroll");
        if (inner && sc) {
          var cx = (sc.scrollLeft + sc.clientWidth / 2) / sc.scrollWidth, cy = (sc.scrollTop + sc.clientHeight / 2) / sc.scrollHeight;
          inner.style.width = zoom * 100 + "%";
          sc.classList.toggle("zoomed", zoom > 1);
          sc.scrollLeft = cx * sc.scrollWidth - sc.clientWidth / 2; sc.scrollTop = cy * sc.scrollHeight - sc.clientHeight / 2;
        }
        var lab = document.querySelector('.board-tools [data-z="0"]'); if (lab) lab.textContent = Math.round(zoom * 100) + " %";
        return true;
      }
      if (a === "hex") { showHex(+t.getAttribute("data-pos")); return true; }
      if (a === "tile") {
        var res = cache[keyOf(route.opts)], id = t.getAttribute("data-id");
        if (!res) return true;
        var pos = id === "18" ? 0 : -1;
        Object.keys(res.board).forEach(function (p) { if (res.board[p] === id) pos = +p; });
        res.layout.hyper.forEach(function (x) { if (x[1] === id) pos = x[0]; });
        if (pos > -1) {
          showHex(pos);
          var b = document.querySelector(".board-tools");
          if (b) window.scrollTo(0, Math.max(0, b.getBoundingClientRect().top + window.scrollY - document.getElementById("top").offsetHeight - 8));
        }
        return true;
      }
      if (a === "gen-link") {
        var base = String(location.href).split("#")[0];
        copyText(base + "#" + genHash(route.opts), t); return true;
      }
      if (a === "gen-code") { var c = document.getElementById("mapcode"); if (c) copyText(c.textContent, t); return true; }
      return false;
    },
    change: function (ev) {
      var k = ev.target.getAttribute && ev.target.getAttribute("data-gen");
      try { localStorage.setItem("ti4.v2.genopen", "true"); } catch (e) {}
      if (!k) return false;
      var route = U().route(); if (route.page !== "gen") return true;
      var o = Object.assign({}, route.opts);
      o[k] = ev.target.checked;
      if (k === "pok" && !o.pok) o.legendary = 0;
      goGen(o);
      return true;
    },
    index: function (push) {
      push({ ty: "Spielvorbereitung", t: "Aufbau der Galaxie", txt: "Spielplan zusammensetzen, Systemtafeln austeilen, Hyperrouten, Spielerzahl 3 4 5 6 7 8, Schema, Heimat-Systeme, Handelswaren Ausgleich, Aufbau Checkliste", href: "#aufbau", w: 4 });
      push({ ty: "Spielvorbereitung", t: "Kartengenerator", txt: "Zufällige ausgewogene Galaxie würfeln, Map Generator, Karte erzeugen, Systemtafeln, Tafelnummern", href: "#generator", w: 4 });
      LAYOUTS.forEach(function (l) {
        push({ ty: "Aufbau", t: l.name, txt: "Spielplan für " + l.players + " Spieler. Jeder bekommt " + dealText(l) + " Systemtafeln." + (l.extra ? " Der Sprecher legt zusätzlich " + extraText(l) + " an Mecatol Rex." : "") + (l.hyper.length ? " Hyperrouten " + l.hyper.map(function (x) { return x[1]; }).join(" ") : ""), href: "#aufbau-" + l.id, w: 2 });
      });
    }
  });

  D.Setup = { tileInfo: tileInfo };
})();
