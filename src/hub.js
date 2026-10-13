/* Hub für die Spielrunde: Spieler, geplante Sessions mit Fraktionswahl, Historie mit Siegpunkten, Statistiken.
   Daten liegen auf dem Server (Rust-API aus server/, Adresse in TI4.hubApi). Ist keiner erreichbar, speichert der Hub nur lokal im Browser.
   Mit Server: Anschauen darf jeder, Ändern nur mit Login. Dazu Profil, Admin-Bereich und Änderungsverlauf. */
(function () {
  "use strict";
  var D = window.TI4;
  D.ext = D.ext || [];
  function U() { return D.UI; }
  function esc(s) { return U().esc(s == null ? "" : s); }
  function svg(n, s) { return U().svg(n, s); }

  var FAC = (D.factions || []).slice().sort(function (a, b) { return facName(a).localeCompare(facName(b), "de"); });
  var facById = {}; FAC.forEach(function (f) { facById[f.id] = f; });
  var hasPortrait = {}; ((D.originalAssets || {}).items || []).forEach(function (a) { if (a.id.indexOf("ref-") === 0) hasPortrait[a.id.slice(4)] = true; });
  var HUE = {
    arborec: "#86a83c", creuss: "#4b7fe0", hacan: "#e0a83a", jolnar: "#4a86d8", l1z1x: "#8f5ad8", letnev: "#c04848", mentak: "#d8913c",
    muaat: "#e8602e", naalu: "#3cb8a8", nekro: "#d23a32", saar: "#c88a48", sardakk: "#5fae3c", sol: "#3c78cc", winnu: "#d0ac44",
    xxcha: "#4fae68", yin: "#c8ccd4", yssaril: "#72a444", argent: "#e8923a", vuilraith: "#b03a5c", empyrean: "#9460dc", mahact: "#cc5094",
    nomad: "#7072dc", naazrokha: "#62a862", titans: "#dc6082", keleres: "#a2a8b8"
  };
  var QUOTES = ["„Die Galaxis wartet auf neue Herrscher.“", "„Mecatol Rex gehört dem, der es nimmt.“", "„Der Thron ist leer. Noch.“"];

  /* ---------- Hilfen ---------- */
  function facName(f) { var n = String(f.de || f.en).replace(/^(Die|Das|Der) /i, ""); return n.charAt(0).toUpperCase() + n.slice(1); }
  function facLabel(id) { return facById[id] ? facName(facById[id]) : ""; }
  function portrait(fid, cls) {
    if (fid && hasPortrait[fid]) {
      var src = D.artifactPortraits ? D.artifactPortraits[fid] : "assets/original/" + fid + "-portrait.webp";
      return '<img class="' + (cls || "hb-pt") + '" src="' + esc(src) + '" alt="" loading="lazy" decoding="async">';
    }
    var f = facById[fid];
    return '<span class="' + (cls || "hb-pt") + ' hb-pt-none" aria-hidden="true">' + esc(f ? facName(f).charAt(0) : "?") + "</span>";
  }
  function hue(fid) { return HUE[fid] || "#56627a"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : new Date(NaN);
  }
  function isoLocal(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":00"; }
  var DF_LONG = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  var DF_SHORT = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" });
  function dLong(s) { return DF_LONG.format(parseDate(s)); }
  function dShort(s) { return DF_SHORT.format(parseDate(s)); }
  function tm(s) { var d = parseDate(s); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + " Uhr"; }
  function dec(v) { return v == null || isNaN(v) ? "–" : v.toFixed(1).replace(".", ","); }
  function nextSaturday() {
    var d = new Date(); d.setHours(18, 0, 0, 0);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d;
  }

  /* ---------- Datenhaltung: Server oder lokal ---------- */
  var API = D.hubApi || "";
  var LKEY = "ti4.hub.v1";
  var mode = "loading"; // loading | server | local
  var data = { players: [], games: [] };
  var lastJson = "";
  var loadErr = "";
  var me = null; // angemeldeter Benutzer { id, playerId, name, role } oder null
  var auth = { signupOpen: false, setupNeeded: false };
  function canEdit() { return mode === "local" || !!me; }
  function isAdmin() { return mode === "server" && !!me && me.role === "admin"; }

  function problem(res) {
    return res.json().then(function (p) { return p && p.detail ? p.detail : "Fehler " + res.status; }, function () { return "Fehler " + res.status; })
      .then(function (msg) { var e = new Error(msg); e.status = res.status; throw e; });
  }
  function http(method, path, body) {
    var opt = { method: method, headers: { Accept: "application/json" }, cache: "no-store" };
    if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    return fetch(API + path, opt).then(null, function () {
      var e = new Error("Hub-Server nicht erreichbar. Bist du offline?"); e.status = -1; throw e;
    }).then(function (res) {
      if (!res.ok && res.status !== 404) return problem(res);
      if (res.status === 404 && (res.headers.get("Content-Type") || "").indexOf("json") < 0) { var n = new Error("Keine API"); n.status = 0; throw n; }
      if (!res.ok) return problem(res);
      if (res.status === 204) return null;
      // Ohne API liefert der Webserver die Seite selbst (HTML) statt JSON.
      if ((res.headers.get("Content-Type") || "").indexOf("json") < 0) { var e = new Error("Keine API"); e.status = 0; throw e; }
      return res.json();
    });
  }

  // Lokaler Speicher mit derselben Logik wie der Server (Platzierungen, Prüfungen).
  var Local = {
    read: function () { return U().load(LKEY, { players: [], games: [], seq: 1 }); },
    write: function (db) { U().save(LKEY, db); },
    fail: function (msg, status) { var e = new Error(msg); e.status = status || 400; throw e; },
    players: function () { return this.read().players.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "de"); }); },
    games: function () { return this.read().games.slice().sort(function (a, b) { return a.scheduledAt < b.scheduledAt ? 1 : -1; }); },
    savePlayer: function (id, name) {
      var db = this.read(); name = String(name || "").trim();
      if (!name) this.fail("Bitte einen Namen eingeben.");
      if (name.length > 40) this.fail("Der Name darf höchstens 40 Zeichen haben.");
      if (db.players.some(function (p) { return p.id !== id && p.name.toLowerCase() === name.toLowerCase(); })) this.fail("Es gibt schon einen Spieler namens „" + name + "“.", 409);
      var p = id ? db.players.filter(function (x) { return x.id === id; })[0] : null;
      if (id && !p) this.fail("Spieler gibt es nicht.", 404);
      if (!p) { p = { id: db.seq++ }; db.players.push(p); }
      p.name = name; this.write(db); return p;
    },
    deletePlayer: function (id) {
      var db = this.read(), p = db.players.filter(function (x) { return x.id === id; })[0];
      var n = db.games.filter(function (g) { return g.participants.some(function (x) { return x.playerId === id; }); }).length;
      if (n) this.fail(p.name + " ist in " + n + (n === 1 ? " Spiel" : " Spielen") + " eingetragen und kann darum nicht gelöscht werden. Umbenennen geht.", 409);
      db.players = db.players.filter(function (x) { return x.id !== id; }); this.write(db);
    },
    saveGame: function (id, req) {
      var db = this.read(), g = id ? db.games.filter(function (x) { return x.id === id; })[0] : null;
      if (id && !g) this.fail("Spiel gibt es nicht.", 404);
      if (g && req.version != null && req.version !== g.version) this.fail("Jemand anderes hat dieses Spiel gerade geändert. Die Seite lädt den neuen Stand, bitte nochmal speichern.", 409);
      checkParticipants(req.participants);
      if (!g) { g = { id: db.seq++, version: -1 }; db.games.push(g); }
      Object.assign(g, {
        scheduledAt: req.scheduledAt, location: req.location || null, status: req.status, pointsToWin: req.pointsToWin || 10, notes: req.notes || null,
        version: g.version + 1, participants: req.status === "FINISHED" ? withPlacements(req.participants) : req.participants
      });
      this.write(db); return g;
    },
    deleteGame: function (id) { var db = this.read(); db.games = db.games.filter(function (x) { return x.id !== id; }); this.write(db); }
  };
  function checkParticipants(list) {
    var ps = {}, fs = {};
    list.forEach(function (p) {
      if (ps[p.playerId]) Local.fail("Ein Spieler ist doppelt eingetragen.");
      ps[p.playerId] = 1;
      if (p.faction) { if (fs[p.faction]) Local.fail("Eine Fraktion kann pro Spiel nur einmal gewählt werden."); fs[p.faction] = 1; }
    });
  }
  // Wie with_placements in server/src/lib.rs: fehlt eine Platzierung, entscheiden die Siegpunkte (Gleichstand: Listenreihenfolge).
  function withPlacements(list) {
    if (list.length && list.every(function (p) { return p.placement != null; })) return list;
    var ranked = list.map(function (p, i) { return { p: p, i: i }; })
      .sort(function (a, b) { return ((b.p.victoryPoints || 0) - (a.p.victoryPoints || 0)) || (a.i - b.i); });
    return list.map(function (p) {
      var c = Object.assign({}, p); c.placement = ranked.findIndex(function (r) { return r.p === p; }) + 1; return c;
    });
  }

  var Store = {
    load: function () {
      if (!API) mode = "local";
      if (mode === "local") return Promise.resolve({ players: Local.players(), games: Local.games() });
      return Promise.all([http("GET", "players"), http("GET", "games"), http("GET", "auth/me")]).then(function (r) {
        mode = "server"; return { players: r[0], games: r[1], me: r[2] };
      });
    },
    call: function (serverFn, localFn) {
      if (mode === "local") { try { return Promise.resolve(localFn()); } catch (e) { return Promise.reject(e); } }
      return serverFn();
    },
    createPlayer: function (name) { return this.call(function () { return http("POST", "players", { name: name }); }, function () { return Local.savePlayer(null, name); }); },
    renamePlayer: function (id, name) { return this.call(function () { return http("PUT", "players/" + id, { name: name }); }, function () { return Local.savePlayer(id, name); }); },
    deletePlayer: function (id) { return this.call(function () { return http("DELETE", "players/" + id); }, function () { return Local.deletePlayer(id); }); },
    saveGame: function (id, req) {
      return this.call(function () { return id ? http("PUT", "games/" + id, req) : http("POST", "games", req); }, function () { return Local.saveGame(id, req); });
    },
    deleteGame: function (id) { return this.call(function () { return http("DELETE", "games/" + id); }, function () { return Local.deleteGame(id); }); }
  };

  function refresh(force) {
    return Store.load().then(function (d) {
      loadErr = "";
      var j = JSON.stringify(d);
      if (j === lastJson && !force) return false;
      lastJson = j; data = { players: d.players, games: d.games };
      if (d.me) { me = d.me.user || null; auth = { signupOpen: !!d.me.signupOpen, setupNeeded: !!d.me.setupNeeded }; }
      return true;
    }, function (e) {
      // Keine API vorhanden (GitHub Pages, Webserver ohne Backend): lokal im Browser arbeiten.
      if (mode !== "server" && e.status === 0) { mode = "local"; return refresh(true); }
      // API vorhanden, aber gerade weg (Container startet neu, offline): nicht lokal weitermachen, sonst laufen die Daten auseinander.
      mode = "server";
      loadErr = e.status === -1 ? e.message : "Hub-Server gerade nicht erreichbar (" + (e.message || e.status) + "). Neuer Versuch in ein paar Sekunden.";
      return true;
    });
  }
  function act(promise, okMsg) {
    return promise.then(function (r) { if (okMsg) toast(okMsg); return refresh(true).then(function () { rerender(); return r; }); }, function (e) {
      toast(e.message || "Das hat nicht geklappt.", true);
      // 401: Anmeldung abgelaufen, die Seite schaltet auf Nur-Lesen.
      var again = e.status === 409 || e.status === 404 || e.status === 401 ? refresh(true) : Promise.resolve();
      return again.then(function () { rerender(); throw e; });
    });
  }
  function rerender() { if (U().route().x === EXT) U().rerender(); }

  var toastTimer = null;
  function toast(msg, bad) {
    var el = document.getElementById("hb-toast");
    if (!el) { el = document.createElement("div"); el.id = "hb-toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg; el.className = bad ? "bad show" : "show";
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.className = ""; }, bad ? 6000 : 2400);
  }

  /* ---------- Abgeleitete Daten ---------- */
  function playerById(id) { return data.players.filter(function (p) { return p.id === id; })[0]; }
  function pname(id) { var p = playerById(id); return p ? p.name : "?"; }
  function finished() { return data.games.filter(function (g) { return g.status === "FINISHED"; }); } // neueste zuerst
  function planned() {
    return data.games.filter(function (g) { return g.status === "PLANNED"; })
      .sort(function (a, b) { return a.scheduledAt < b.scheduledAt ? -1 : 1; });
  }
  // Nächste Session: die früheste geplante, die nicht länger als 12 Stunden zurückliegt; sonst die letzte geplante.
  function nextGame() {
    var list = planned(), cut = Date.now() - 12 * 3600e3;
    return list.filter(function (g) { return parseDate(g.scheduledAt).getTime() >= cut; })[0] || list[list.length - 1] || null;
  }
  function byPlacement(g) {
    return g.participants.slice().sort(function (a, b) { return (a.placement || 99) - (b.placement || 99); });
  }
  function winner(g) { return byPlacement(g)[0]; }
  function stats() {
    var ps = {};
    data.players.forEach(function (p) { ps[p.id] = { id: p.id, name: p.name, played: 0, wins: 0, place: 0, placeN: 0, vp: 0, vpN: 0, fac: {} }; });
    var fs = {};
    FAC.forEach(function (f) { fs[f.id] = { id: f.id, played: 0, wins: 0, vp: 0, vpN: 0 }; });
    finished().forEach(function (g) {
      g.participants.forEach(function (x) {
        var s = ps[x.playerId]; if (!s) return;
        s.played++;
        if (x.placement === 1) s.wins++;
        if (x.placement) { s.place += x.placement; s.placeN++; }
        if (x.victoryPoints != null) { s.vp += x.victoryPoints; s.vpN++; }
        if (x.faction) {
          s.fac[x.faction] = (s.fac[x.faction] || 0) + 1;
          var f = fs[x.faction];
          if (f) { f.played++; if (x.placement === 1) f.wins++; if (x.victoryPoints != null) { f.vp += x.victoryPoints; f.vpN++; } }
        }
      });
    });
    var players = Object.keys(ps).map(function (k) {
      var s = ps[k];
      s.avgPlace = s.placeN ? s.place / s.placeN : null;
      s.avgVp = s.vpN ? s.vp / s.vpN : null;
      s.fav = Object.keys(s.fac).sort(function (a, b) { return s.fac[b] - s.fac[a]; })[0] || null;
      return s;
    }).sort(function (a, b) { return (b.wins - a.wins) || ((a.avgPlace || 99) - (b.avgPlace || 99)) || a.name.localeCompare(b.name, "de"); });
    var factions = Object.keys(fs).map(function (k) { var f = fs[k]; f.avgVp = f.vpN ? f.vp / f.vpN : null; return f; });
    return { players: players, factions: factions };
  }
  function toReq(g, participants) {
    return {
      scheduledAt: g.scheduledAt, location: g.location, status: g.status, pointsToWin: g.pointsToWin, notes: g.notes, version: g.version,
      participants: (participants || g.participants).map(function (p) { return { playerId: p.playerId, faction: p.faction || null, victoryPoints: p.victoryPoints, placement: p.placement }; })
    };
  }

  /* ---------- Bausteine ---------- */
  var SUBNAV = [["hub", "Übersicht"], ["hub-sessions", "Sessions"], ["hub-spieler", "Spieler"], ["hub-fraktionen", "Fraktionen"]];
  function subnav(cur) {
    var items = SUBNAV.slice();
    if (mode === "server" && me) items.push(["hub-verlauf", "Verlauf"]);
    if (isAdmin()) items.push(["hub-admin", "Admin"]);
    return '<nav class="hb-nav" aria-label="Hub">' + items.map(function (s) {
      return '<a href="#' + s[0] + '"' + (s[0] === cur ? ' aria-current="page"' : "") + ">" + s[1] + "</a>";
    }).join("") + "</nav>";
  }
  function modeNote() {
    if (mode === "local") return '<p class="hb-mode">' + svg("info", 16) + "<span><b>Nur auf diesem Gerät.</b> Kein Hub-Server erreichbar, darum wird lokal im Browser gespeichert. Mit dem Docker-Setup (Seite + API) sehen alle dieselben Daten.</span></p>";
    if (loadErr) return '<p class="hb-mode bad">' + svg("info", 16) + "<span>" + esc(loadErr) + "</span></p>";
    return "";
  }
  function head(cur) {
    var acct = mode !== "server" ? "" : me ?
      '<a class="hb-acct' + (cur === "hub-profil" ? " on" : "") + '" href="#hub-profil">' + svg("user", 18) + "<span>" + esc(me.name) + "</span></a>" :
      '<a class="hb-acct login' + (cur === "hub-login" ? " on" : "") + '" href="#hub-login">' + svg("lock", 18) + "<span>Anmelden</span></a>";
    return '<header class="hb-head"><div class="hb-logo"><b>Twilight Imperium IV</b><span>Hub</span></div>' + subnav(cur) + acct + "</header>" + modeNote() + roNote(cur);
  }
  // Ohne Login: Hinweis, dass hier nur angeschaut wird.
  function roNote(cur) {
    if (canEdit() || mode !== "server" || cur === "hub-login" || cur === "") return "";
    return '<p class="hb-mode">' + svg("lock", 16) + '<span><b>Nur zum Anschauen.</b> Zum Planen, Wählen und Eintragen <a href="#hub-login">anmelden</a>.</span></p>';
  }
  // Wurzel jeder Ansicht. Ohne Login blendet .ro alle Bedienelemente mit data-w aus.
  function root() { return '<div class="hb' + (canEdit() ? "" : " ro") + '">'; }
  function panelHead(icon, title, right) {
    return '<div class="hb-ph"><h2>' + svg(icon, 20) + "<span>" + title + "</span></h2>" + (right || "") + "</div>";
  }
  function chip(status) {
    return status === "FINISHED" ? '<span class="hb-chip done">Gespielt</span>' : '<span class="hb-chip plan"><i></i>Planung</span>';
  }

  /* ---------- Übersicht ---------- */
  var pickFor = null; // playerId, dessen Fraktion gerade gewählt wird
  var resetArmed = false;

  function viewOverview() {
    var g = nextGame();
    var h = head("hub") + hero(g) + '<div class="hb-grid"><div class="hb-main">';
    if (g) h += nextPanel(g) + factionPanel(g);
    else h += '<section class="hb-panel hb-empty-panel"><p>Noch keine Session geplant.</p><button type="button" class="hb-btn gold" data-w data-act="hb-plan">Nächste Session planen</button></section>';
    h += statsPanel() + '</div><aside class="hb-side">' + matchesPanel() + "</aside></div>";
    return root() + h + "</div>";
  }

  function hero(g) {
    var q = QUOTES[new Date().getDate() % QUOTES.length];
    var h = '<section class="hb-hero"><div class="hb-hero-in">';
    if (!g) {
      h += '<p class="hb-k">' + svg("cal", 18) + "Nächste Session</p><p class=\"hb-hero-none\">Noch kein Termin</p>";
    } else {
      h += '<p class="hb-k">' + svg("cal", 18) + "Zeit bis zur nächsten Session</p>" +
        '<div class="hb-cd" id="hb-cd" data-at="' + esc(g.scheduledAt) + '">' + countdown(g.scheduledAt) + "</div>" +
        '<p class="hb-when"><span>' + svg("cal", 18) + esc(dLong(g.scheduledAt)) + "</span><span>" + svg("clock", 18) + esc(tm(g.scheduledAt)) + "</span>" +
        (g.location ? "<span>" + svg("pin", 18) + esc(g.location) + "</span>" : "") + "</p>";
    }
    h += '</div><div class="hb-hero-side"><p class="hb-quote">' + esc(q) + "<small>Twilight Imperium IV</small></p>" +
      (g ? '<a class="hb-btn gold" href="#hub-spiel-' + g.id + '">Zur Session ' + svg("takt", 16) + "</a>" : '<button type="button" class="hb-btn gold" data-w data-act="hb-plan">Session planen</button>') +
      "</div></section>";
    return h;
  }
  function countdown(at) {
    var ms = parseDate(at).getTime() - Date.now();
    if (ms <= 0) return '<span class="hb-now">Es geht los!</span>';
    var s = Math.floor(ms / 1000), parts = [[Math.floor(s / 86400), "Tag", "Tage"], [Math.floor(s / 3600) % 24, "Stunde", "Stunden"], [Math.floor(s / 60) % 60, "Minute", "Minuten"], [s % 60, "Sekunde", "Sekunden"]];
    return parts.map(function (p) { return "<span><b>" + p[0] + "</b><i>" + (p[0] === 1 ? p[1] : p[2]) + "</i></span>"; }).join("");
  }

  function nextPanel(g) {
    var right = '<div class="hb-meta"><span>' + svg("cal", 16) + esc(dLong(g.scheduledAt)) + "</span><span>" + svg("clock", 16) + esc(tm(g.scheduledAt)) + "</span>" +
      (g.location ? "<span>" + svg("pin", 16) + esc(g.location) + "</span>" : "") + "</div>" +
      chip(g.status) + '<a class="hb-icon" data-w href="#hub-spiel-' + g.id + '" aria-label="Session bearbeiten">' + svg("edit", 18) + "</a>";
    var picked = g.participants.filter(function (p) { return p.faction; }).length;
    var h = '<section class="hb-panel">' + panelHead("cal", "Nächste Session", right) +
      '<p class="hb-sub">Teilnehmer (' + picked + "/" + g.participants.length + " gewählt)</p>" +
      '<div class="hb-seats">' + g.participants.map(function (p) {
        var on = pickFor === p.playerId;
        return '<div class="hb-seat' + (p.faction ? " has" : "") + (on ? " on" : "") + '" style="--fc:' + hue(p.faction) + '">' +
          '<div class="hb-seat-h"><span>' + esc(pname(p.playerId)) + "</span>" + (p.faction ? '<i class="hb-ok" title="Fraktion gewählt">✓</i>' : "") + "</div>" +
          '<div class="hb-seat-img">' + (p.faction ? portrait(p.faction, "hb-pt-big") : '<span class="hb-q">?</span>') + '<span class="hb-seat-f">' + esc(p.faction ? facLabel(p.faction) : "Noch offen") + "</span></div>" +
          '<div class="hb-seat-a" data-w><button type="button" class="hb-mini" data-act="hb-pick" data-p="' + p.playerId + '" aria-pressed="' + on + '">' + (on ? "Wählt…" : (p.faction ? "Ändern" : "Wählen")) + "</button>" +
          '<button type="button" class="hb-x" data-act="hb-unseat" data-p="' + p.playerId + '" aria-label="' + esc(pname(p.playerId)) + ' austragen">×</button></div></div>';
      }).join("") + (g.participants.length < 8 ? addSeat(g) : "") + "</div></section>";
    return h;
  }
  function addSeat(g) {
    var free = data.players.filter(function (p) { return !g.participants.some(function (x) { return x.playerId === p.id; }); });
    return '<form class="hb-seat hb-add" data-w data-form="hb-seat">' + svg("plus", 30) + '<span class="hb-add-t">Spieler eintragen</span>' +
      '<label class="sr" for="hb-seat-sel">Spieler</label><select id="hb-seat-sel" name="player">' +
      free.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("") +
      '<option value="new">+ Neuer Spieler…</option></select>' +
      '<input name="newname" class="hb-add-new" placeholder="Name" maxlength="40" autocomplete="off"' + (free.length ? " hidden" : "") + ">" +
      '<button type="submit" class="hb-mini">Eintragen</button></form>';
  }

  function factionPanel(g) {
    var takenBy = {};
    g.participants.forEach(function (p) { if (p.faction) takenBy[p.faction] = p.playerId; });
    var hint = !canEdit() ? "Welche Fraktionen schon vergeben sind. Wählen geht nach dem Anmelden." : pickFor != null ? "<b>" + esc(pname(pickFor)) + "</b> wählt: Fraktion antippen. Nochmal antippen gibt sie wieder frei." :
      "Oben bei einem Spieler auf „Wählen“ tippen, dann hier die Fraktion.";
    var right = '<button type="button" class="hb-btn ghost" data-w data-act="hb-reset">' + (resetArmed ? "Wirklich alle zurücksetzen?" : "Alle zurücksetzen") + "</button>";
    return '<section class="hb-panel">' + panelHead("faction", "Fraktionen für die nächste Session", right) + '<p class="hb-hint">' + hint + "</p>" +
      '<div class="hb-facs">' + FAC.map(function (f) {
        var by = takenBy[f.id];
        var mine = by != null && by === pickFor;
        return '<button type="button" class="hb-fac' + (by != null ? " taken" : "") + (mine ? " mine" : "") + '" style="--fc:' + hue(f.id) + '" data-act="hb-fac" data-f="' + f.id + '"' +
          (pickFor == null ? ' aria-disabled="true"' : "") + ">" + portrait(f.id, "hb-pt-fac") + '<span class="hb-fac-n">' + esc(facName(f)) + "</span>" +
          '<span class="hb-fac-s">' + (by != null ? "✓ " + esc(pname(by)) : "Verfügbar") + "</span></button>";
      }).join("") + "</div></section>";
  }

  function matchesPanel() {
    var list = finished().slice(0, 5);
    var h = '<section class="hb-panel hb-matches">' + panelHead("trophy", "Letzte Matches", '<a class="hb-more" href="#hub-sessions">Alle anzeigen ›</a>');
    if (!list.length) return h + '<p class="hb-empty">Noch keine gespielten Partien. Nach dem Spiel die Session öffnen, Siegpunkte eintragen und auf „Gespielt“ stellen.</p><a class="hb-btn ghost" data-w href="#hub-spiel-new-past">Vergangenes Spiel nachtragen</a></section>';
    return h + list.map(function (g) {
      var w = winner(g);
      return '<a class="hb-match" href="#hub-spiel-' + g.id + '"><div><p class="hb-date">' + svg("cal", 15) + esc(dShort(g.scheduledAt)) + "</p>" +
        '<ol class="hb-place">' + byPlacement(g).map(function (p) {
          return "<li" + (p.placement === 1 ? ' class="w"' : "") + "><span>" + esc(pname(p.playerId)) + "</span><b>" + (p.victoryPoints != null ? p.victoryPoints : "–") + "</b></li>";
        }).join("") + "</ol></div>" +
        (w ? '<div class="hb-win" style="--fc:' + hue(w.faction) + '">' + portrait(w.faction, "hb-pt-win") + '<p><small>Sieger</small><b>' + esc(pname(w.playerId)) + "</b>" +
          '<span>' + esc(facLabel(w.faction)) + "</span><span>" + (w.victoryPoints != null ? w.victoryPoints + " SP" : "") + "</span></p></div>" : "") + "</a>";
    }).join("") + "</section>";
  }

  function statsPanel() {
    var s = stats().players.filter(function (p) { return p.played; });
    var h = '<section class="hb-panel">' + panelHead("chart", "Spieler-Statistiken", '<a class="hb-more" href="#hub-spieler">Alle anzeigen ›</a>');
    if (!s.length) return h + '<p class="hb-empty">Statistiken erscheinen nach dem ersten gespielten Spiel.</p></section>';
    var top = s[0].wins;
    return h + '<div class="hb-stats">' + s.map(function (p) {
      return '<div class="hb-stat" style="--fc:' + hue(p.fav) + '">' + portrait(p.fav, "hb-pt-sm") + "<div><b>" + esc(p.name) + (p.wins && p.wins === top ? ' <span class="hb-crown" title="Meiste Siege">♛</span>' : "") + "</b>" +
        "<span>" + svg("trophy", 14) + p.wins + (p.wins === 1 ? " Sieg" : " Siege") + "</span><small>Ø Platz " + dec(p.avgPlace) + " · Ø " + dec(p.avgVp) + " SP</small></div></div>";
    }).join("") + "</div></section>";
  }

  /* ---------- Sessions ---------- */
  function viewSessions() {
    var up = planned(), done = finished();
    var h = head("hub-sessions") + '<div class="hb-actions" data-w><button type="button" class="hb-btn gold" data-act="hb-plan">Neue Session planen</button>' +
      '<a class="hb-btn ghost" href="#hub-spiel-new-past">Vergangenes Spiel nachtragen</a></div>';
    h += '<section class="hb-panel">' + panelHead("cal", "Geplant") + (up.length ? up.map(row).join("") : '<p class="hb-empty">Nichts geplant.</p>') + "</section>";
    h += '<section class="hb-panel">' + panelHead("trophy", "Historie") + (done.length ? done.map(row).join("") : '<p class="hb-empty">Noch keine gespielten Partien.</p>') + "</section>";
    return root() + h + "</div>";
  }
  function row(g) {
    var list = g.status === "FINISHED" ? byPlacement(g) : g.participants;
    return '<a class="hb-row" href="#hub-spiel-' + g.id + '"><div class="hb-row-h"><b>' + esc(dLong(g.scheduledAt)) + "</b><span>" + esc(tm(g.scheduledAt)) + (g.location ? " · " + esc(g.location) : "") + "</span>" + chip(g.status) + "</div>" +
      '<div class="hb-row-p">' + (list.length ? list.map(function (p) {
        return '<span class="hb-tag' + (g.status === "FINISHED" && p.placement === 1 ? " w" : "") + '" style="--fc:' + hue(p.faction) + '">' + portrait(p.faction, "hb-pt-xs") +
          (g.status === "FINISHED" && p.placement ? "<i>" + p.placement + ".</i>" : "") + esc(pname(p.playerId)) +
          (p.faction ? "<small>" + esc(facLabel(p.faction)) + "</small>" : "") + (p.victoryPoints != null ? "<b>" + p.victoryPoints + "</b>" : "") + "</span>";
      }).join("") : '<span class="hb-empty">Noch niemand eingetragen</span>') + "</div></a>";
  }

  /* ---------- Spiel bearbeiten ---------- */
  var draft = null; // { key, id, version, date, time, location, status, pointsToWin, notes, participants: [{playerId, faction, victoryPoints, placement}] }
  var delArmed = false;
  function draftFor(r) {
    var key = r.gid || r.page;
    if (draft && draft.key === key) return draft;
    delArmed = false;
    var g = r.gid ? data.games.filter(function (x) { return x.id === r.gid; })[0] : null;
    if (r.gid && !g) return null;
    var at = g ? parseDate(g.scheduledAt) : (r.page === "new-past" ? (function () { var d = new Date(); d.setHours(18, 0, 0, 0); return d; })() : nextSaturday());
    draft = {
      key: key, id: g ? g.id : null, version: g ? g.version : null,
      date: at.getFullYear() + "-" + pad(at.getMonth() + 1) + "-" + pad(at.getDate()), time: pad(at.getHours()) + ":" + pad(at.getMinutes()),
      location: g ? g.location || "" : "", status: g ? g.status : (r.page === "new-past" ? "FINISHED" : "PLANNED"),
      pointsToWin: g ? g.pointsToWin : 10, notes: g ? g.notes || "" : "",
      participants: g ? g.participants.map(function (p) { return Object.assign({}, p); }) : []
    };
    return draft;
  }
  function viewEditor(r) {
    if (mode === "loading") return root() + head("hub-sessions") + '<p class="hb-empty">Lädt…</p></div>';
    if (!canEdit()) return viewGameReadOnly(r);
    var d = draftFor(r);
    if (!d) return root() + head("hub-sessions") + '<section class="hb-panel"><p class="hb-empty">Dieses Spiel gibt es nicht (mehr).</p><a class="hb-btn ghost" href="#hub-sessions">Zu den Sessions</a></section></div>';
    var fin = d.status === "FINISHED";
    var preview = fin ? withPlacements(d.participants.map(function (p) { return Object.assign({}, p, { placement: p.placement || null }); })) : d.participants;
    var used = {}; d.participants.forEach(function (p) { if (p.faction) used[p.faction] = 1; });
    var free = data.players.filter(function (p) { return !d.participants.some(function (x) { return x.playerId === p.id; }); });
    var h = head("hub-sessions") + '<form class="hb-panel hb-form" data-form="hb-game" novalidate>' +
      panelHead(d.id ? "edit" : "plus", d.id ? "Session bearbeiten" : (fin ? "Gespieltes Spiel nachtragen" : "Neue Session planen")) +
      '<div class="hb-fields">' +
      '<label><span>Datum</span><input type="date" required data-hf="date" value="' + esc(d.date) + '"></label>' +
      '<label><span>Uhrzeit</span><input type="time" required data-hf="time" value="' + esc(d.time) + '"></label>' +
      '<label class="wide"><span>Ort</span><input type="text" maxlength="80" placeholder="z. B. Bei Basti" data-hf="location" value="' + esc(d.location) + '"></label>' +
      '<div class="hb-fl"><span>Status</span><div class="hb-seg" role="group" aria-label="Status">' +
      '<button type="button" data-act="hb-status" data-v="PLANNED" aria-pressed="' + !fin + '">Geplant</button><button type="button" data-act="hb-status" data-v="FINISHED" aria-pressed="' + fin + '">Gespielt</button></div></div>' +
      '<div class="hb-fl"><span>Siegpunkte zum Sieg</span><div class="hb-seg" role="group" aria-label="Siegpunkte zum Sieg">' +
      [10, 14].map(function (v) { return '<button type="button" data-act="hb-ptw" data-v="' + v + '" aria-pressed="' + (d.pointsToWin === v) + '">' + v + "</button>"; }).join("") + "</div></div>" +
      "</div>" +
      '<p class="hb-sub">Teilnehmer (' + d.participants.length + "/8)" + (fin ? " · Platz leer lassen, dann zählen die Siegpunkte" : "") + "</p>" +
      '<div class="hb-ptable' + (fin ? " fin" : "") + '">' +
      '<div class="hb-pt-head"><span>Spieler</span><span>Fraktion</span>' + (fin ? "<span>SP</span><span>Platz</span>" : "") + "<span></span></div>" +
      d.participants.map(function (p, i) {
        var pv = preview[i] || {};
        return '<div class="hb-prow" style="--fc:' + hue(p.faction) + '">' +
          '<span class="hb-prow-p">' + portrait(p.faction, "hb-pt-xs") + "<b>" + esc(pname(p.playerId)) + "</b></span>" +
          '<label><span class="sr">Fraktion</span><select data-hp="faction" data-i="' + i + '"><option value="">– offen –</option>' + FAC.map(function (f) {
            return '<option value="' + f.id + '"' + (p.faction === f.id ? " selected" : "") + (used[f.id] && p.faction !== f.id ? " disabled" : "") + ">" + esc(facName(f)) + "</option>";
          }).join("") + "</select></label>" +
          (fin ? '<label><span class="sr">Siegpunkte</span><input type="number" inputmode="numeric" min="0" max="30" data-hp="victoryPoints" data-i="' + i + '" value="' + (p.victoryPoints != null ? p.victoryPoints : "") + '" placeholder="0"></label>' +
            '<label><span class="sr">Platz</span><input type="number" inputmode="numeric" min="1" max="8" data-hp="placement" data-i="' + i + '" value="' + (p.placement != null ? p.placement : "") + '" placeholder="' + (pv.placement || "") + '"></label>' : "") +
          '<span class="hb-prow-a"><button type="button" class="hb-x" data-act="hb-up" data-i="' + i + '" aria-label="Nach oben"' + (i ? "" : " disabled") + ">↑</button>" +
          '<button type="button" class="hb-x" data-act="hb-rm" data-i="' + i + '" aria-label="Entfernen">×</button></span></div>';
      }).join("") + "</div>" +
      (d.participants.length < 8 ? '<div class="hb-addrow"><select id="hb-add-sel" aria-label="Spieler hinzufügen">' + free.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("") +
        '<option value="new">+ Neuer Spieler…</option></select><input id="hb-add-new" placeholder="Name des neuen Spielers" maxlength="40" autocomplete="off"' + (free.length ? " hidden" : "") + '>' +
        '<button type="button" class="hb-btn ghost" data-act="hb-add">Hinzufügen</button></div>' : "") +
      '<label class="hb-notes"><span>Notizen</span><textarea rows="3" maxlength="2000" placeholder="z. B. Karte, Varianten, besondere Momente" data-hf="notes">' + esc(d.notes) + "</textarea></label>" +
      '<div class="hb-actions"><button type="submit" class="hb-btn gold">Speichern</button><a class="hb-btn ghost" href="#' + (d.id && fin ? "hub-sessions" : "hub") + '">Abbrechen</a>' +
      (d.id ? '<span class="spacer"></span><button type="button" class="hb-btn danger" data-act="hb-del">' + (delArmed ? "Wirklich löschen?" : "Spiel löschen") + "</button>" : "") +
      "</div></form>";
    return root() + h + "</div>";
  }
  function saveDraft() {
    var d = draft;
    if (!d.date || !/^\d{2}:\d{2}$/.test(d.time)) { toast("Bitte Datum und Uhrzeit angeben.", true); return; }
    var req = {
      scheduledAt: d.date + "T" + d.time + ":00", location: d.location.trim() || null, status: d.status, pointsToWin: d.pointsToWin,
      notes: d.notes.trim() || null, version: d.version,
      participants: d.participants.map(function (p) {
        var fin = d.status === "FINISHED";
        return { playerId: p.playerId, faction: p.faction || null, victoryPoints: fin ? p.victoryPoints : null, placement: fin ? p.placement : null };
      })
    };
    var wasFin = d.status === "FINISHED";
    act(Store.saveGame(d.id, req), "Gespeichert").then(function () { draft = null; U().go(wasFin ? "hub-sessions" : "hub"); }, function (e) {
      // Entwurf behalten. Bei einem Konflikt zählt der neue Stand als gesehen, ein zweites Speichern geht dann durch.
      var g = data.games.filter(function (x) { return x.id === d.id; })[0];
      if (e.status === 409 && g) d.version = g.version;
    });
  }

  /* ---------- Spieler ---------- */
  var editPlayer = null, delPlayer = null;
  function viewPlayers() {
    var s = stats().players;
    var h = head("hub-spieler") + '<section class="hb-panel">' + panelHead("user", "Spieler") +
      '<form class="hb-inline" data-w data-form="hb-player"><label class="sr" for="hb-pn">Name</label><input id="hb-pn" name="name" placeholder="Neuer Spieler, z. B. Basti" maxlength="40" autocomplete="off" required>' +
      '<button type="submit" class="hb-btn gold">Hinzufügen</button></form>';
    if (!s.length) return root() + h + '<p class="hb-empty">Noch keine Spieler.' + (canEdit() ? " Einfach oben Namen eintragen." : "") + "</p></section></div>";
    h += '<div class="hb-tbl"><table><thead><tr><th>Spieler</th><th class="num">Spiele</th><th class="num">Siege</th><th class="num">Ø Platz</th><th class="num">Ø SP</th><th>Liebste Fraktion</th><th></th></tr></thead><tbody>' +
      s.map(function (p) {
        var name = editPlayer === p.id ?
          '<form class="hb-inline sm" data-form="hb-rename" data-p="' + p.id + '"><input name="name" value="' + esc(p.name) + '" maxlength="40" required aria-label="Neuer Name"><button type="submit" class="hb-mini">OK</button></form>' :
          "<b>" + esc(p.name) + "</b>";
        return "<tr><td>" + name + '</td><td class="num">' + p.played + '</td><td class="num">' + p.wins + '</td><td class="num">' + dec(p.avgPlace) + '</td><td class="num">' + dec(p.avgVp) + "</td>" +
          "<td>" + (p.fav ? '<span class="hb-tag" style="--fc:' + hue(p.fav) + '">' + portrait(p.fav, "hb-pt-xs") + esc(facLabel(p.fav)) + "<b>" + p.fac[p.fav] + "×</b></span>" : "–") + "</td>" +
          '<td class="hb-td-a" data-w><button type="button" class="hb-mini" data-act="hb-ren" data-p="' + p.id + '">Umbenennen</button>' +
          '<button type="button" class="hb-mini danger" data-act="hb-pdel" data-p="' + p.id + '">' + (delPlayer === p.id ? "Wirklich?" : "Löschen") + "</button></td></tr>";
      }).join("") + "</tbody></table></div></section>";
    return root() + h + "</div>";
  }

  /* ---------- Fraktionen ---------- */
  function viewFactionStats() {
    var fs = stats().factions.slice().sort(function (a, b) { return (b.wins - a.wins) || (b.played - a.played) || facLabel(a.id).localeCompare(facLabel(b.id), "de"); });
    var h = head("hub-fraktionen") + '<section class="hb-panel">' + panelHead("faction", "Fraktionen in eurer Runde") +
      '<p class="hb-hint">Wie oft jede Fraktion gespielt wurde und wie oft sie gewonnen hat. Ein Tipp öffnet den Fraktionsbogen im Kompendium.</p>' +
      '<div class="hb-facs stats">' + fs.map(function (f) {
        var fac = facById[f.id];
        return '<a class="hb-fac" style="--fc:' + hue(f.id) + '" href="#f-' + f.id + '">' + portrait(f.id, "hb-pt-fac") + '<span class="hb-fac-n">' + esc(facName(fac)) + "</span>" +
          '<span class="hb-fac-s">' + (f.played ? f.played + "× gespielt · " + f.wins + (f.wins === 1 ? " Sieg" : " Siege") : "Noch nie gespielt") + "</span></a>";
      }).join("") + "</div></section>";
    return root() + h + "</div>";
  }


  /* ---------- Nur anschauen (ohne Login) ---------- */
  function viewGameReadOnly(r) {
    var g = r.gid ? data.games.filter(function (x) { return x.id === r.gid; })[0] : null;
    var h = head("hub-sessions") + '<section class="hb-panel">';
    if (!g) h += panelHead("lock", "Anmelden zum Bearbeiten") + '<p class="hb-empty">Neue Sessions planen und Ergebnisse eintragen geht nach dem Anmelden.</p>';
    else {
      h += panelHead(g.status === "FINISHED" ? "trophy" : "cal", "Session", chip(g.status)) + row(g).replace(/^<a /, "<div ").replace(/<\/a>$/, "</div>").replace(/ href="[^"]*"/, "") +
        (g.notes ? '<p class="hb-hint">' + esc(g.notes) + "</p>" : "");
    }
    return root() + h + '<div class="hb-actions"><a class="hb-btn gold" href="#hub-login">' + svg("lock", 16) + 'Anmelden</a><a class="hb-btn ghost" href="#hub-sessions">Zu den Sessions</a></div></section></div>';
  }

  /* ---------- Anmelden und Registrieren ---------- */
  var regNew = false; // Registrieren mit neuem Spielernamen statt Auswahl
  function pwFields(label) {
    return '<label><span>' + label + '</span><input type="password" name="password" autocomplete="new-password" minlength="8" maxlength="200" required></label>' +
      '<label><span>Passwort wiederholen</span><input type="password" name="password2" autocomplete="new-password" minlength="8" maxlength="200" required></label>';
  }
  function viewLogin() {
    if (mode === "local") return root() + head("") + '<section class="hb-panel"><p class="hb-empty">Ohne Hub-Server gibt es keine Accounts, hier wird nur auf diesem Gerät gespeichert.</p></section></div>';
    if (me) return root() + head("hub-login") + '<section class="hb-panel">' + panelHead("user", "Angemeldet") + '<p>Du bist als <b>' + esc(me.name) + "</b> angemeldet.</p>" +
      '<div class="hb-actions"><a class="hb-btn gold" href="#hub">Zum Hub</a><a class="hb-btn ghost" href="#hub-profil">Profil</a></div></section></div>';
    var h = head("hub-login") + '<div class="hb-two">';
    h += '<form class="hb-panel hb-form" data-form="hb-login">' + panelHead("lock", "Anmelden") +
      '<div class="hb-fields one"><label><span>Spielername</span><input name="name" autocomplete="username" maxlength="40" required></label>' +
      '<label><span>Passwort</span><input type="password" name="password" autocomplete="current-password" maxlength="200" required></label></div>' +
      '<div class="hb-actions"><button type="submit" class="hb-btn gold">Anmelden</button></div>' +
      '<p class="hb-hint">Passwort vergessen? Der Admin kann dir einen Link zum Zurücksetzen schicken.</p></form>';
    if (!auth.signupOpen) {
      h += '<section class="hb-panel">' + panelHead("user", "Registrieren") + '<p class="hb-empty">Die Registrierung ist gerade geschlossen. Frag den Admin nach einem Einladungslink.</p></section>';
    } else {
      var free = data.players.filter(function (p) { return !p.hasAccount; });
      var useNew = regNew || !free.length;
      h += '<form class="hb-panel hb-form" data-form="hb-register">' + panelHead("user", auth.setupNeeded ? "Admin einrichten" : "Registrieren") +
        '<p class="hb-hint">' + (auth.setupNeeded ? "Es gibt noch keinen Admin. Den <b>Einrichtungscode</b> schreibt der Server beim Start ins Log (<code>docker logs ti4-hub-api</code>). Wer ihn eingibt, wird Admin." :
          "Mit dem <b>Gruppencode</b> aus eurer Gruppe. Wähl deinen Spieler, damit deine bisherigen Spiele zu dir gehören.") + "</p>" +
        '<div class="hb-fields one"><label><span>' + (auth.setupNeeded ? "Einrichtungscode" : "Gruppencode") + '</span><input name="code" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40" required></label>' +
        '<label><span>Wer bist du?</span><select name="player" data-hsel="reg">' + free.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("") +
        '<option value="new"' + (useNew ? " selected" : "") + '>+ Ich bin neu…</option></select></label>' +
        '<label' + (useNew ? "" : " hidden") + ' data-reg-new><span>Dein Name</span><input name="newname" maxlength="40" autocomplete="nickname"></label>' +
        pwFields("Passwort (mind. 8 Zeichen)") + "</div>" +
        '<div class="hb-actions"><button type="submit" class="hb-btn gold">' + (auth.setupNeeded ? "Als Admin registrieren" : "Registrieren") + "</button></div></form>";
    }
    return root() + h + "</div></div>";
  }

  /* ---------- Einladungslink ---------- */
  var invite = null; // { token, info, err }
  function viewInvite(r) {
    var h = head("hub-login");
    if (mode === "local") return root() + h + '<section class="hb-panel"><p class="hb-empty">Einladungen gehen nur mit Hub-Server.</p></section></div>';
    if (!invite || invite.token !== r.token) {
      invite = { token: r.token };
      http("GET", "auth/invite/" + encodeURIComponent(r.token)).then(function (i) { invite.info = i; rerender(); }, function (e) { invite.err = e.message; rerender(); });
    }
    if (invite.err) return root() + h + '<section class="hb-panel"><p class="hb-empty">' + esc(invite.err) + '</p><a class="hb-btn ghost" href="#hub-login">Zum Anmelden</a></section></div>';
    if (!invite.info) return root() + h + '<p class="hb-empty">Lädt…</p></div>';
    var i = invite.info;
    return root() + h + '<form class="hb-panel hb-form hb-narrow" data-form="hb-invite">' + panelHead("user", "Hallo " + esc(i.name) + "!") +
      '<p class="hb-hint">' + (i.hasAccount ? "Hier legst du ein neues Passwort fest. Danach bist du auf allen anderen Geräten abgemeldet." : "Wähl ein Passwort, dann bist du drin. Angemeldet wird mit deinem Spielernamen <b>" + esc(i.name) + "</b>.") + "</p>" +
      '<input type="text" name="username" value="' + esc(i.name) + '" autocomplete="username" hidden>' +
      '<div class="hb-fields one">' + pwFields("Passwort (mind. 8 Zeichen)") + "</div>" +
      '<div class="hb-actions"><button type="submit" class="hb-btn gold">' + (i.hasAccount ? "Passwort speichern" : "Account anlegen") + "</button></div></form></div>";
  }

  /* ---------- Profil ---------- */
  var delMeArmed = false;
  function needLogin(cur) {
    return root() + head(cur) + '<section class="hb-panel"><p class="hb-empty">Dafür bitte zuerst anmelden.</p><div class="hb-actions"><a class="hb-btn gold" href="#hub-login">Anmelden</a></div></section></div>';
  }
  function viewProfile() {
    if (mode !== "server" || !me) return needLogin("hub-profil");
    var h = head("hub-profil") + '<div class="hb-two">';
    h += '<form class="hb-panel hb-form" data-form="hb-rename-me">' + panelHead("user", "Profil", '<span class="hb-chip ' + (me.role === "admin" ? "plan" : "done") + '">' + (me.role === "admin" ? "Admin" : "Mitglied") + "</span>") +
      '<div class="hb-fields one"><label><span>Spielername (damit meldest du dich an)</span><input name="name" value="' + esc(me.name) + '" maxlength="40" required></label></div>' +
      '<div class="hb-actions"><button type="submit" class="hb-btn ghost">Namen speichern</button></div></form>';
    h += '<form class="hb-panel hb-form" data-form="hb-pw">' + panelHead("lock", "Passwort ändern") +
      '<input type="text" name="username" value="' + esc(me.name) + '" autocomplete="username" hidden>' +
      '<div class="hb-fields one"><label><span>Aktuelles Passwort</span><input type="password" name="current" autocomplete="current-password" maxlength="200" required></label>' +
      pwFields("Neues Passwort (mind. 8 Zeichen)") + "</div>" +
      '<div class="hb-actions"><button type="submit" class="hb-btn gold">Passwort ändern</button></div>' +
      '<p class="hb-hint">Andere Geräte werden dabei abgemeldet, dieses bleibt angemeldet.</p></form>';
    h += '<section class="hb-panel">' + panelHead("reset", "Abmelden") +
      '<div class="hb-actions"><button type="button" class="hb-btn ghost" data-act="hb-logout">Abmelden</button><button type="button" class="hb-btn ghost" data-act="hb-logout-all">Auf allen Geräten abmelden</button></div></section>';
    h += '<form class="hb-panel hb-form" data-form="hb-delme">' + panelHead("info", "Account löschen") +
      '<p class="hb-hint">Dein Spieler und eure Historie bleiben erhalten, nur dein Login verschwindet. Mit einem Einladungslink vom Admin kannst du später wieder einsteigen.</p>' +
      '<div class="hb-fields one"><label><span>Zur Bestätigung dein Passwort</span><input type="password" name="password" autocomplete="current-password" maxlength="200" required></label></div>' +
      '<div class="hb-actions"><button type="submit" class="hb-btn danger">' + (delMeArmed ? "Wirklich endgültig löschen?" : "Account löschen") + "</button></div></form>";
    return root() + h + "</div></div>";
  }

  /* ---------- Admin ---------- */
  var adminData = null, adminLoading = false, inviteOut = null, accDel = null;
  function loadAdmin() {
    if (adminLoading) return;
    adminLoading = true;
    Promise.all([http("GET", "admin/settings"), http("GET", "admin/accounts")]).then(function (r) {
      adminLoading = false; adminData = { settings: r[0], accounts: r[1] }; rerender();
    }, function (e) { adminLoading = false; adminData = { err: e.message }; rerender(); });
  }
  function ago(iso) {
    if (!iso) return "noch nie";
    var d = new Date(iso);
    return isNaN(d) ? "–" : DF_SHORT.format(d) + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function viewAdmin() {
    if (!isAdmin()) return needLogin("hub-admin");
    var h = head("hub-admin");
    if (!adminData) { loadAdmin(); return root() + h + '<p class="hb-empty">Lädt…</p></div>'; }
    if (adminData.err) return root() + h + '<p class="hb-mode bad">' + esc(adminData.err) + "</p></div>";
    var st = adminData.settings, accs = adminData.accounts;
    h += '<div class="hb-two">';
    h += '<section class="hb-panel">' + panelHead("lock", "Registrierung", '<span class="hb-chip ' + (st.signupOpen ? "done" : "plan") + '">' + (st.signupOpen ? "Offen" : "Geschlossen") + "</span>") +
      '<p class="hb-hint">' + (st.signupOpen ? "Wer den Gruppencode kennt, kann sich gerade registrieren. Wenn alle drin sind: schließen." :
        "Niemand kann sich selbst registrieren. Nachzügler bekommen unten einen Einladungslink.") + "</p>" +
      (st.signupCode ? '<div class="hb-code"><span>Gruppencode</span><b>' + esc(st.signupCode) + '</b><button type="button" class="hb-mini" data-act="hb-copy" data-copy="' + esc(st.signupCode) + '">Kopieren</button></div>' : '<p class="hb-hint">Noch kein Gruppencode festgelegt.</p>') +
      '<form class="hb-inline" data-form="hb-code"><label class="sr" for="hb-code-in">Neuer Gruppencode</label><input id="hb-code-in" name="code" minlength="6" maxlength="40" placeholder="Neuer Gruppencode" autocomplete="off" required>' +
      '<button type="button" class="hb-btn ghost" data-act="hb-code-rand">Zufällig</button><button type="submit" class="hb-btn ghost">Code setzen</button></form>' +
      '<div class="hb-actions"><button type="button" class="hb-btn ' + (st.signupOpen ? "danger" : "gold") + '" data-act="hb-signup" data-v="' + (st.signupOpen ? "0" : "1") + '">' +
      (st.signupOpen ? "Registrierung schließen" : "Registrierung öffnen") + "</button></div></section>";
    var invitePanel = inviteOut ? '<div class="hb-code wide"><span>Link für ' + esc(inviteOut.name) + " (7 Tage gültig, einmal benutzbar)</span><b>" + esc(inviteOut.url) + '</b><button type="button" class="hb-mini" data-act="hb-copy" data-copy="' + esc(inviteOut.url) + '">Kopieren</button></div>' : "";
    var noAcc = data.players.filter(function (p) { return !p.hasAccount; });
    h += '<section class="hb-panel">' + panelHead("user", "Einladen") +
      '<p class="hb-hint">Ein Link für einen Spieler: zum Registrieren, auch wenn die Registrierung zu ist. Bei bestehendem Account setzt er das Passwort zurück.</p>' + invitePanel +
      (noAcc.length ? '<div class="hb-row-p">' + noAcc.map(function (p) { return '<button type="button" class="hb-mini" data-act="hb-invite" data-p="' + p.id + '">' + esc(p.name) + " einladen</button>"; }).join("") + "</div>" :
        '<p class="hb-empty">Alle Spieler haben einen Account.</p>') + "</section></div>";
    h += '<section class="hb-panel">' + panelHead("user", "Accounts (" + accs.length + ")") + '<div class="hb-tbl"><table><thead><tr><th>Spieler</th><th>Rolle</th><th>Zuletzt da</th><th></th></tr></thead><tbody>' +
      accs.map(function (a) {
        var self = a.id === me.id;
        return "<tr><td><b>" + esc(a.name) + "</b>" + (self ? " <small>(du)</small>" : "") + "</td><td>" + (a.role === "admin" ? "Admin" : "Mitglied") + "</td><td>" + esc(ago(a.lastSeen)) + "</td>" +
          '<td class="hb-td-a"><button type="button" class="hb-mini" data-act="hb-role" data-a="' + a.id + '" data-v="' + (a.role === "admin" ? "member" : "admin") + '">' + (a.role === "admin" ? "Admin entfernen" : "Zum Admin") + "</button>" +
          '<button type="button" class="hb-mini" data-act="hb-invite" data-p="' + a.playerId + '">Passwort-Link</button>' +
          '<button type="button" class="hb-mini danger" data-act="hb-acc-del" data-a="' + a.id + '">' + (accDel === a.id ? "Wirklich?" : "Löschen") + "</button></td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="hb-hint">Löschen entfernt nur den Login. Der Spieler und seine Spiele bleiben.</p></section>';
    return root() + h + "</div>";
  }
  function adminCall(method, path, body, okMsg) {
    return act(http(method, path, body), okMsg).then(function (r) { adminData = null; rerender(); return r; }, function () { adminData = null; rerender(); });
  }

  /* ---------- Verlauf ---------- */
  var audit = null, auditLoading = false;
  function loadAudit() {
    if (auditLoading) return;
    auditLoading = true;
    http("GET", "audit").then(function (l) { auditLoading = false; audit = l; rerender(); }, function (e) { auditLoading = false; audit = { err: e.message }; rerender(); });
  }
  function gameLabel(g) { return g ? "Session vom " + dShort(g.scheduledAt) : "Session"; }
  function describe(e) {
    var b = e.before, a = e.after;
    if (e.entity === "player") {
      if (e.action === "create") return "hat Spieler „" + esc(a.name) + "“ angelegt";
      if (e.action === "delete") return "hat Spieler „" + esc(b.name) + "“ gelöscht";
      if (e.action === "undo") return "hat eine Änderung an „" + esc((a || b).name) + "“ rückgängig gemacht";
      return "hat „" + esc(b.name) + "“ in „" + esc(a.name) + "“ umbenannt";
    }
    var lbl = esc(gameLabel(a || b));
    if (e.action === "create") return "hat die " + lbl + (a.status === "FINISHED" ? " nachgetragen" : " geplant");
    if (e.action === "delete") return "hat die " + lbl + " gelöscht";
    if (e.action === "undo") return "hat eine Änderung an der " + lbl + " rückgängig gemacht";
    if (b.status === "PLANNED" && a.status === "FINISHED") return "hat das Ergebnis der " + lbl + " eingetragen";
    var fb = b.participants.map(function (p) { return p.playerId + ":" + p.faction; }).join(), fa = a.participants.map(function (p) { return p.playerId + ":" + p.faction; }).join();
    if (fb !== fa && b.participants.length === a.participants.length && b.scheduledAt === a.scheduledAt) return "hat Fraktionen für die " + lbl + " geändert";
    return "hat die " + lbl + " geändert";
  }
  function viewHistory() {
    if (mode !== "server" || !me) return needLogin("hub-verlauf");
    var h = head("hub-verlauf");
    if (!audit) { loadAudit(); return root() + h + '<p class="hb-empty">Lädt…</p></div>'; }
    if (audit.err) return root() + h + '<p class="hb-mode bad">' + esc(audit.err) + "</p></div>";
    h += '<section class="hb-panel">' + panelHead("clock", "Verlauf") +
      '<p class="hb-hint">Wer wann was geändert hat, die letzten 200 Einträge.' + (isAdmin() ? " Als Admin kannst du Änderungen rückgängig machen, solange danach nichts mehr daran geändert wurde." : " Rückgängig machen kann der Admin.") + "</p>" +
      (audit.length ? '<ol class="hb-log">' + audit.map(function (e) {
        return '<li class="' + (e.undone ? "undone" : "") + '"><time>' + esc(ago(e.at)) + "</time><span><b>" + esc(e.actor) + "</b> " + describe(e) + (e.undone ? " <small>(rückgängig gemacht)</small>" : "") + "</span>" +
          (isAdmin() && !e.undone ? '<button type="button" class="hb-mini" data-act="hb-undo" data-a="' + e.id + '">Rückgängig</button>' : "") + "</li>";
      }).join("") + "</ol>" : '<p class="hb-empty">Noch keine Änderungen.</p>') + "</section>";
    return root() + h + "</div>";
  }
  function copy(text) {
    var done = function () { toast("Kopiert"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { prompt("Zum Kopieren:", text); });
    else prompt("Zum Kopieren:", text);
  }
  function randomCode() {
    var a = "abcdefghjkmnpqrstuvwxyz23456789", out = "", buf = new Uint32Array(10);
    crypto.getRandomValues(buf);
    for (var i = 0; i < buf.length; i++) { out += a[buf[i] % a.length]; if (i === 4) out += "-"; }
    return out;
  }
  function signedIn(r, msg) {
    me = r.user; adminData = null; audit = null;
    return refresh(true).then(function () { toast(msg); U().go("hub"); });
  }
  function pwPair(f) {
    if (f.elements.password.value !== f.elements.password2.value) { toast("Die beiden Passwörter sind nicht gleich.", true); f.elements.password2.focus(); return null; }
    return f.elements.password.value;
  }

  /* ---------- Ereignisse ---------- */
  function cur() { var r = U().route(); return r.x === EXT ? r : null; }
  function updateNext(mut) {
    var g = nextGame(); if (!g) return;
    var parts = g.participants.map(function (p) { return Object.assign({}, p); });
    mut(parts);
    act(Store.saveGame(g.id, toReq(g, parts))).catch(function () {});
  }
  function plan() {
    var at = nextSaturday(), last = finished()[0] || planned().slice(-1)[0];
    var req = { scheduledAt: isoLocal(at), location: last ? last.location : null, status: "PLANNED", pointsToWin: 10, notes: null,
      participants: last ? last.participants.map(function (p) { return { playerId: p.playerId, faction: null, victoryPoints: null, placement: null }; }) : [] };
    act(Store.saveGame(null, req), "Session angelegt").then(function (g) { U().go("hub-spiel-" + g.id); }, function () {});
  }

  // Aktionen, die etwas ändern und darum einen Login brauchen.
  var WRITE = { "hb-plan": 1, "hb-pick": 1, "hb-fac": 1, "hb-unseat": 1, "hb-reset": 1, "hb-del": 1, "hb-ren": 1, "hb-pdel": 1 };
  function click(a, t, ev) {
    if (a.indexOf("hb-") !== 0) return false;
    var pid = +t.getAttribute("data-p"), i = +t.getAttribute("data-i"), aid = +t.getAttribute("data-a");
    if (WRITE[a] && !canEdit()) { toast("Zum Ändern bitte anmelden."); return true; }
    if (a === "hb-plan") plan();
    else if (a === "hb-logout") act(http("POST", "auth/logout"), "Abgemeldet").then(function () { me = null; U().go("hub"); }, function () {});
    else if (a === "hb-logout-all") act(http("POST", "me/logout-all"), "Überall abgemeldet").then(function () { me = null; U().go("hub"); }, function () {});
    else if (a === "hb-copy") copy(t.getAttribute("data-copy"));
    else if (a === "hb-code-rand") { var ci = document.getElementById("hb-code-in"); ci.value = randomCode(); ci.focus(); }
    else if (a === "hb-signup") adminCall("PUT", "admin/settings", { signupOpen: t.getAttribute("data-v") === "1" }, t.getAttribute("data-v") === "1" ? "Registrierung offen" : "Registrierung geschlossen");
    else if (a === "hb-role") adminCall("PUT", "admin/accounts/" + aid, { role: t.getAttribute("data-v") }, "Rolle geändert");
    else if (a === "hb-acc-del") {
      if (accDel !== aid) { accDel = aid; rerender(); }
      else { accDel = null; adminCall("DELETE", "admin/accounts/" + aid, undefined, "Account gelöscht"); }
    }
    else if (a === "hb-invite") {
      act(http("POST", "admin/invites", { playerId: pid })).then(function (r) {
        inviteOut = { name: r.name, url: location.href.split("#")[0] + "#hub-einladung-" + r.token };
        adminData = null; rerender(); copy(inviteOut.url);
      }, function () {});
    }
    else if (a === "hb-undo") act(http("POST", "audit/" + aid + "/undo"), "Rückgängig gemacht").then(function () { audit = null; rerender(); }, function () { audit = null; rerender(); });
    else if (a === "hb-pick") { pickFor = pickFor === pid ? null : pid; rerender(); }
    else if (a === "hb-fac") {
      if (pickFor == null) { toast("Erst oben bei einem Spieler auf „Wählen“ tippen."); return true; }
      var fid = t.getAttribute("data-f"), who = pickFor;
      updateNext(function (ps) {
        ps.forEach(function (p) {
          if (p.playerId === who) p.faction = p.faction === fid ? null : fid;
          else if (p.faction === fid) p.faction = null; // Wechsel: der andere gibt sie frei
        });
      });
      pickFor = null;
    }
    else if (a === "hb-unseat") { if (pickFor === pid) pickFor = null; updateNext(function (ps) { var k = ps.findIndex(function (p) { return p.playerId === pid; }); if (k > -1) ps.splice(k, 1); }); }
    else if (a === "hb-reset") {
      if (!resetArmed) { resetArmed = true; rerender(); setTimeout(function () { if (resetArmed) { resetArmed = false; rerender(); } }, 4000); }
      else { resetArmed = false; pickFor = null; updateNext(function (ps) { ps.forEach(function (p) { p.faction = null; }); }); }
    }
    else if (a === "hb-status") { syncDraft(); draft.status = t.getAttribute("data-v"); rerender(); }
    else if (a === "hb-ptw") { syncDraft(); draft.pointsToWin = +t.getAttribute("data-v"); rerender(); }
    else if (a === "hb-up") { syncDraft(); var x = draft.participants.splice(i, 1)[0]; draft.participants.splice(i - 1, 0, x); rerender(); }
    else if (a === "hb-rm") { syncDraft(); draft.participants.splice(i, 1); rerender(); }
    else if (a === "hb-add") {
      syncDraft();
      var sel = document.getElementById("hb-add-sel"), nn = document.getElementById("hb-add-new");
      var addId = function (id) { draft.participants.push({ playerId: id, faction: null, victoryPoints: null, placement: null }); rerender(); };
      if (sel.value === "new") { var name = nn.value.trim(); if (!name) { nn.focus(); return true; } act(Store.createPlayer(name)).then(function (p) { addId(p.id); }, function () {}); }
      else if (sel.value) addId(+sel.value);
    }
    else if (a === "hb-del") {
      if (!delArmed) { delArmed = true; rerender(); }
      else { var id = draft.id; act(Store.deleteGame(id), "Spiel gelöscht").then(function () { draft = null; U().go("hub-sessions"); }, function () {}); }
    }
    else if (a === "hb-ren") { editPlayer = editPlayer === pid ? null : pid; rerender(); }
    else if (a === "hb-pdel") {
      if (delPlayer !== pid) { delPlayer = pid; rerender(); }
      else { delPlayer = null; act(Store.deletePlayer(pid), "Spieler gelöscht").catch(function () {}); }
    }
    else return false;
    return true;
  }
  // Eingaben im Formular in den Entwurf übernehmen (vor jedem Neuaufbau).
  function syncDraft() {
    if (!draft) return;
    document.querySelectorAll("[data-hf]").forEach(function (el) { draft[el.getAttribute("data-hf")] = el.value; });
    document.querySelectorAll("[data-hp]").forEach(function (el) {
      var p = draft.participants[+el.getAttribute("data-i")], k = el.getAttribute("data-hp"); if (!p) return;
      if (k === "faction") p.faction = el.value || null;
      else p[k] = el.value === "" ? null : Math.max(0, parseInt(el.value, 10) || 0);
    });
  }
  function change(ev) {
    var el = ev.target;
    if (el.getAttribute && el.getAttribute("data-hsel") === "reg") {
      regNew = el.value === "new";
      var box = el.form.querySelector("[data-reg-new]"); box.hidden = !regNew; if (regNew) box.querySelector("input").focus();
      return true;
    }
    if (el.getAttribute && el.getAttribute("data-hp") === "faction") { syncDraft(); rerender(); return true; }
    if (el.id === "hb-add-sel" || el.id === "hb-seat-sel") {
      var nn = el.parentNode.querySelector(el.id === "hb-add-sel" ? "#hb-add-new" : ".hb-add-new");
      nn.hidden = el.value !== "new"; if (!nn.hidden) nn.focus();
      return true;
    }
    return false;
  }
  function input(ev) {
    var el = ev.target;
    if (draft && el.getAttribute && (el.getAttribute("data-hf") || el.getAttribute("data-hp"))) {
      syncDraft();
      // Platz-Vorschau aktualisieren, ohne das Feld neu zu zeichnen
      if (el.getAttribute("data-hp") === "victoryPoints" && draft.status === "FINISHED") {
        var pv = withPlacements(draft.participants.map(function (p) { return Object.assign({}, p, { placement: null }); }));
        document.querySelectorAll('[data-hp="placement"]').forEach(function (f) { f.placeholder = pv[+f.getAttribute("data-i")].placement; });
      }
      return true;
    }
    return false;
  }
  document.addEventListener("submit", function (ev) {
    var f = ev.target.getAttribute && ev.target.getAttribute("data-form");
    if (!f || f.indexOf("hb-") !== 0) return;
    ev.preventDefault();
    var form = ev.target, el = form.elements;
    if (f === "hb-login") {
      http("POST", "auth/login", { name: el.name.value, password: el.password.value }).then(function (r) { return signedIn(r, "Hallo " + r.user.name + "!"); },
        function (e) { toast(e.message, true); el.password.value = ""; el.password.focus(); });
      return;
    }
    if (f === "hb-register") {
      var pw = pwPair(form); if (pw == null) return;
      var body = { code: el.code.value, password: pw };
      if (el.player.value === "new") body.name = el.newname.value; else body.playerId = +el.player.value;
      http("POST", "auth/register", body).then(function (r) { regNew = false; return signedIn(r, "Willkommen, " + r.user.name + "!"); }, function (e) { toast(e.message, true); });
      return;
    }
    if (f === "hb-invite") {
      var pw2 = pwPair(form); if (pw2 == null) return;
      http("POST", "auth/invite/" + encodeURIComponent(invite.token), { password: pw2 }).then(function (r) { invite = null; return signedIn(r, "Alles klar, " + r.user.name + ", du bist angemeldet."); },
        function (e) { toast(e.message, true); });
      return;
    }
    if (f === "hb-pw") {
      var pw3 = pwPair(form); if (pw3 == null) return;
      act(http("PUT", "me/password", { current: el.current.value, password: pw3 }), "Passwort geändert").then(function () { form.reset(); }, function () {});
      return;
    }
    if (f === "hb-rename-me") { act(Store.renamePlayer(me.playerId, el.name.value), "Name gespeichert").catch(function () {}); return; }
    if (f === "hb-delme") {
      if (!delMeArmed) { delMeArmed = true; var keep = el.password.value; rerender(); var np = document.querySelector('[data-form="hb-delme"] input[name="password"]'); if (np) np.value = keep; return; }
      delMeArmed = false;
      act(http("DELETE", "me", { password: el.password.value }), "Account gelöscht").then(function () { me = null; U().go("hub"); }, function () {});
      return;
    }
    if (f === "hb-code") { adminCall("PUT", "admin/settings", { signupCode: el.code.value }, "Gruppencode gesetzt"); return; }
    if (f === "hb-game") { syncDraft(); saveDraft(); }
    else if (f === "hb-player") {
      var inp = ev.target.elements.name;
      act(Store.createPlayer(inp.value), "„" + inp.value.trim() + "“ hinzugefügt").catch(function () {});
    }
    else if (f === "hb-rename") {
      var id = +ev.target.getAttribute("data-p");
      act(Store.renamePlayer(id, ev.target.elements.name.value), "Umbenannt").then(function () { editPlayer = null; rerender(); }, function () {});
    }
    else if (f === "hb-seat") {
      var sel = ev.target.elements.player, nn = ev.target.elements.newname;
      var seat = function (pid) { updateNext(function (ps) { ps.push({ playerId: pid, faction: null }); }); };
      if (sel.value === "new") { var name = nn.value.trim(); if (!name) { nn.focus(); return; } act(Store.createPlayer(name)).then(function (p) { seat(p.id); }, function () {}); }
      else if (sel.value) seat(+sel.value);
    }
  });

  /* Countdown jede Sekunde, Daten alle 20 Sekunden neu holen (andere bearbeiten ja mit). */
  setInterval(function () {
    var el = document.getElementById("hb-cd");
    if (el) el.innerHTML = countdown(el.getAttribute("data-at"));
  }, 1000);
  function poll() {
    if (!cur() || document.hidden) return;
    var a = document.activeElement;
    if (a && a.closest && a.closest(".hb") && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return; // nicht beim Tippen stören
    refresh(false).then(function (changed) {
      if (!changed) return;
      var r = cur(); if (!r) return;
      // Ein offener Entwurf bleibt, wie er ist; nur die Version wird erst beim Speichern geprüft.
      rerender();
    });
  }
  setInterval(poll, 20000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });

  var EXT = {
    parse: function (h) {
      var base = { tab: "hub", rail: "hub", title: "TI4 Hub", wide: true };
      if (h === "hub") return Object.assign(base, { page: "overview" });
      if (h === "hub-sessions") return Object.assign(base, { page: "sessions", title: "Sessions" });
      if (h === "hub-spieler") return Object.assign(base, { page: "players", title: "Spieler" });
      if (h === "hub-fraktionen") return Object.assign(base, { page: "factions", title: "Fraktionen" });
      if (h === "hub-login") return Object.assign(base, { page: "login", title: "Anmelden" });
      if (h === "hub-profil") return Object.assign(base, { page: "profile", title: "Profil" });
      if (h === "hub-admin") return Object.assign(base, { page: "admin", title: "Admin" });
      if (h === "hub-verlauf") return Object.assign(base, { page: "history", title: "Verlauf" });
      var inv = /^hub-einladung-([0-9a-f]{16,128})$/.exec(h);
      if (inv) return Object.assign(base, { page: "invite", token: inv[1], title: "Einladung" });
      if (h === "hub-spiel-new") return Object.assign(base, { page: "new", title: "Neue Session" });
      if (h === "hub-spiel-new-past") return Object.assign(base, { page: "new-past", title: "Spiel nachtragen" });
      var m = /^hub-spiel-(\d+)$/.exec(h);
      if (m) return Object.assign(base, { page: "edit", gid: +m[1], title: "Session" });
      return null;
    },
    render: function (r) {
      if (r.page !== "edit" && r.page !== "new" && r.page !== "new-past") draft = null;
      if (r.page !== "overview") pickFor = null;
      if (r.page !== "profile") delMeArmed = false;
      // Admin-Daten und Verlauf bei jedem Öffnen frisch holen.
      if (r.page !== "admin") { adminData = null; inviteOut = null; accDel = null; }
      if (r.page !== "history") audit = null;
      if (mode === "loading") {
        refresh(true).then(rerender);
        return root() + head(r.page === "overview" ? "hub" : "") + '<p class="hb-empty">Lädt…</p></div>';
      }
      if (r.page === "overview") return viewOverview();
      if (r.page === "sessions") return viewSessions();
      if (r.page === "players") return viewPlayers();
      if (r.page === "factions") return viewFactionStats();
      if (r.page === "login") return viewLogin();
      if (r.page === "invite") return viewInvite(r);
      if (r.page === "profile") return viewProfile();
      if (r.page === "admin") return viewAdmin();
      if (r.page === "history") return viewHistory();
      return viewEditor(r);
    },
    click: click, change: change, input: input
  };
  D.ext.push(EXT);
})();
