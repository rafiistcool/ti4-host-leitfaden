/* Spielplan: Geometrie, gezeichnete Systemtafeln, Aufbau-Schema und Kartengenerator. */
(function () {
  "use strict";
  var D = window.TI4;
  var TILES = D.tiles;

  /* ---------- Geometrie (Sechsecke mit flacher Oberseite, axiale Koordinaten) ---------- */
  var DIRS = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]]; // N, NO, SO, S, SW, NW
  var POS = [{ q: 0, r: 0, ring: 0 }];
  var POS_INDEX = { "0,0": 0 };
  (function () {
    var order = [2, 3, 4, 5, 0, 1];
    for (var k = 1; k <= 4; k++) {
      var q = 0, r = -k;
      for (var side = 0; side < 6; side++) {
        for (var s = 0; s < k; s++) {
          POS_INDEX[q + "," + r] = POS.length;
          POS.push({ q: q, r: r, ring: k });
          var d = DIRS[order[side]]; q += d[0]; r += d[1];
        }
      }
    }
  })();
  function neighbor(i, dir) {
    var p = POS[i], d = DIRS[dir];
    var j = POS_INDEX[(p.q + d[0]) + "," + (p.r + d[1])];
    return j === undefined ? -1 : j;
  }
  function px(i, s) { var p = POS[i]; return { x: s * 1.5 * p.q, y: s * Math.sqrt(3) * (p.r + p.q / 2) }; }
  function hexPoints(cx, cy, s) {
    var pts = [];
    for (var k = 0; k < 6; k++) { var a = Math.PI / 180 * (60 * k); pts.push((cx + s * Math.cos(a)).toFixed(2) + "," + (cy + s * Math.sin(a)).toFixed(2)); }
    return pts.join(" ");
  }
  // Mittelpunkt der Kante in Richtung dir (für Hyperrouten-Linien)
  function edgeMid(cx, cy, s, dir) {
    var ang = [-90, -30, 30, 90, 150, 210][dir] * Math.PI / 180, h = s * Math.sqrt(3) / 2;
    return { x: cx + h * Math.cos(ang), y: cy + h * Math.sin(ang) };
  }

  /* ---------- Zufall mit Startwert ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(arr, rnd) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* ---------- Tafel-Helfer ---------- */
  var TRAIT = { c: "kulturell", h: "gefährlich", i: "industriell" };
  var SKIP = { G: "Biotechnik (grün)", Y: "Kybernetik (gelb)", B: "Antriebstechnik (blau)", R: "Kriegsführung (rot)" };
  var ANOM = { nebel: "Nebel", strudel: "Gravitationsstrudel", asteroiden: "Asteroidenfeld", supernova: "Supernova" };
  var WH = { a: "Alpha", b: "Beta", g: "Gamma", d: "Delta" };
  var SEAT = ["#d64541", "#3b7dd8", "#3f9a54", "#e3b24e", "#8e5cc4", "#e07a2e", "#d4549a", "#4fb3bf"];
  function isAnomaly(id) { var t = TILES[id]; return !!(t && t.a && t.a.length); }
  function wormholes(id) { var t = TILES[id]; return t && t.w ? t.w.split("") : []; }
  function planets(id) { var t = TILES[id]; return t && t.p ? t.p : []; }
  function factionName(fid) {
    var f = (D.factions || []).filter(function (x) { return x.id === fid; })[0];
    return f ? (f.de || f.en) : fid;
  }
  function tileText(id) {
    var t = TILES[id]; if (!t) return "Tafel " + id;
    var parts = [];
    if (t.k === "green") parts.push("Heimat-System" + (t.f ? " " + factionName(t.f) : ""));
    planets(id).forEach(function (p) {
      var extra = [TRAIT[p[3]], p[4].replace("L", "").split("").map(function (c) { return SKIP[c]; }).filter(Boolean).join(", "), p[4].indexOf("L") > -1 ? "legendär" : ""].filter(Boolean).join(", ");
      parts.push(p[0] + " " + p[1] + "/" + p[2] + (extra ? " (" + extra + ")" : ""));
    });
    (t.a || []).forEach(function (a) { parts.push(ANOM[a] || a); });
    wormholes(id).forEach(function (w) { parts.push(WH[w] + "-Wurmloch"); });
    if (!parts.length && t.k === "red") parts.push("Leerer Raum");
    return parts.join(" · ");
  }

  /* ---------- Gezeichnete Systemtafel (eigener Stil, aus Spieldaten) ---------- */
  var defsDone = {};
  function defs(uid) {
    return '<defs>' +
      '<radialGradient id="' + uid + 'sp" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#1d2a44"/><stop offset="1" stop-color="#0b111e"/></radialGradient>' +
      '<radialGradient id="' + uid + 'neb" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9b6ad6" stop-opacity=".85"/><stop offset=".6" stop-color="#5b3fa0" stop-opacity=".45"/><stop offset="1" stop-color="#2a1e55" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + uid + 'nov" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#f4a336"/><stop offset=".75" stop-color="#c2361f" stop-opacity=".8"/><stop offset="1" stop-color="#4a0d0d" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + uid + 'rift" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="#05060a"/><stop offset=".55" stop-color="#d9772b" stop-opacity=".8"/><stop offset=".8" stop-color="#3d6fd1" stop-opacity=".35"/><stop offset="1" stop-color="#0b111e" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function tileSVG(id, cx, cy, s, opt) {
    opt = opt || {};
    var t = TILES[id], uid = opt.uid || "t";
    var out = [];
    var clipId = uid + "c" + String(id).replace(/\W/g, "") + Math.round(cx) + "_" + Math.round(cy);
    out.push('<clipPath id="' + clipId + '"><polygon points="' + hexPoints(cx, cy, s * 0.985) + '"/></clipPath>');
    out.push('<g clip-path="url(#' + clipId + ')">');
    out.push('<polygon points="' + hexPoints(cx, cy, s) + '" fill="url(#' + uid + 'sp)"/>');
    // Sterne
    var rnd = rng(hash(String(id)));
    for (var k = 0; k < 14; k++) {
      var sx = cx + (rnd() - 0.5) * 1.8 * s, sy = cy + (rnd() - 0.5) * 1.6 * s;
      out.push('<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + (0.006 * s + rnd() * 0.012 * s).toFixed(2) + '" fill="#fff" opacity="' + (0.35 + rnd() * 0.5).toFixed(2) + '"/>');
    }
    if (!t) { out.push("</g>"); return out.join(""); }
    if (t.k === "hyperlane") {
      out.push('<polygon points="' + hexPoints(cx, cy, s) + '" fill="#2a2108" opacity=".55"/>');
      (t.h || []).forEach(function (l) {
        var rot = opt.rot || 0, a = edgeMid(cx, cy, s, (l[0] + rot) % 6), b = edgeMid(cx, cy, s, (l[1] + rot) % 6);
        out.push('<path d="M' + a.x.toFixed(1) + " " + a.y.toFixed(1) + " Q " + cx + " " + cy + " " + b.x.toFixed(1) + " " + b.y.toFixed(1) + '" fill="none" stroke="#f0c040" stroke-width="' + (s * 0.07).toFixed(2) + '" stroke-linecap="round"/>');
      });
    }
    (t.a || []).forEach(function (a) {
      if (a === "nebel") { out.push('<circle cx="' + (cx - s * 0.25) + '" cy="' + (cy - s * 0.1) + '" r="' + s * 0.7 + '" fill="url(#' + uid + 'neb)"/><circle cx="' + (cx + s * 0.3) + '" cy="' + (cy + s * 0.25) + '" r="' + s * 0.6 + '" fill="url(#' + uid + 'neb)"/>'); }
      if (a === "supernova") { out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + s * 0.95 + '" fill="url(#' + uid + 'nov)"/>'); }
      if (a === "strudel") {
        out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + s * 0.85 + '" fill="url(#' + uid + 'rift)"/>');
        out.push('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + s * 0.62 + '" ry="' + s * 0.2 + '" fill="none" stroke="#f0a050" stroke-width="' + s * 0.025 + '" opacity=".8" transform="rotate(-20 ' + cx + " " + cy + ')"/>');
      }
      if (a === "asteroiden") {
        var r2 = rng(hash("ast" + id));
        for (var n = 0; n < 22; n++) {
          var ax = cx + (r2() - 0.5) * 1.5 * s, ay = cy + (r2() - 0.5) * 1.3 * s, ar = s * (0.03 + r2() * 0.07);
          out.push('<ellipse cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" rx="' + ar.toFixed(1) + '" ry="' + (ar * 0.75).toFixed(1) + '" fill="' + (r2() > 0.5 ? "#8c7b66" : "#6b5e4f") + '" stroke="#3a3128" stroke-width="' + (s * 0.008).toFixed(2) + '"/>');
        }
      }
    });
    // Wurmlöcher
    var whs = wormholes(id), ps = planets(id);
    var whPos = ps.length ? [{ x: cx - s * 0.48, y: cy + s * 0.42 }, { x: cx + s * 0.48, y: cy + s * 0.42 }, { x: cx, y: cy + s * 0.62 }] : [{ x: cx, y: cy }, { x: cx - s * 0.4, y: cy + s * 0.35 }, { x: cx + s * 0.4, y: cy + s * 0.35 }];
    var WHC = { a: "#4aa3df", b: "#e58a3a", g: "#b26ad9", d: "#3fc1a5" };
    var WHL = { a: "α", b: "β", g: "γ", d: "δ" };
    whs.forEach(function (w, n) {
      var p = whPos[n % 3], rr = ps.length ? s * 0.17 : s * 0.3;
      out.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="' + rr + '" fill="#05070c" stroke="' + WHC[w] + '" stroke-width="' + (rr * 0.28).toFixed(2) + '"/>');
      out.push('<text x="' + p.x + '" y="' + (p.y + rr * 0.36) + '" text-anchor="middle" font-size="' + (rr * 1.05).toFixed(1) + '" font-family="serif" fill="' + WHC[w] + '" font-weight="700">' + WHL[w] + "</text>");
    });
    // Planeten
    var lay = ps.length === 1 ? [[0, -0.05, 0.3]] : ps.length === 2 ? [[-0.33, -0.22, 0.24], [0.3, 0.2, 0.24]] : [[-0.36, -0.3, 0.21], [0.36, -0.22, 0.21], [-0.02, 0.33, 0.21]];
    var TC = { c: "#3f7fd6", h: "#c9473b", i: "#3f9a54", "": "#8b93a3" };
    if (id === "18") TC[""] = "#d9a83a";
    ps.forEach(function (p, n) {
      var L = lay[n], x = cx + L[0] * s, y = cy + L[1] * s, r = L[2] * s;
      var col = TC[p[3]] || TC[""];
      out.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '" stroke="#e8edf5" stroke-opacity=".55" stroke-width="' + (r * 0.06).toFixed(2) + '"/>');
      out.push('<circle cx="' + (x - r * 0.3).toFixed(1) + '" cy="' + (y - r * 0.3).toFixed(1) + '" r="' + (r * 0.55).toFixed(1) + '" fill="#fff" opacity=".12"/>');
      // Ressourcen / Einfluss
      var br = r * 0.42;
      out.push('<circle cx="' + (x - br * 1.05).toFixed(1) + '" cy="' + (y + r * 0.28).toFixed(1) + '" r="' + br.toFixed(1) + '" fill="#f1c24b" stroke="#172033" stroke-width="' + (br * 0.12).toFixed(2) + '"/>');
      out.push('<text x="' + (x - br * 1.05).toFixed(1) + '" y="' + (y + r * 0.28 + br * 0.42).toFixed(1) + '" text-anchor="middle" font-size="' + (br * 1.25).toFixed(1) + '" font-family="IBM Plex Mono, monospace" font-weight="500" fill="#172033">' + p[1] + "</text>");
      out.push('<circle cx="' + (x + br * 1.05).toFixed(1) + '" cy="' + (y + r * 0.28).toFixed(1) + '" r="' + br.toFixed(1) + '" fill="#2f6fd1" stroke="#172033" stroke-width="' + (br * 0.12).toFixed(2) + '"/>');
      out.push('<text x="' + (x + br * 1.05).toFixed(1) + '" y="' + (y + r * 0.28 + br * 0.42).toFixed(1) + '" text-anchor="middle" font-size="' + (br * 1.25).toFixed(1) + '" font-family="IBM Plex Mono, monospace" font-weight="500" fill="#fff">' + p[2] + "</text>");
      var sk = p[4].replace("L", "");
      var SKC = { G: "#3f9a54", Y: "#e3b24e", B: "#3b7dd8", R: "#d64541" };
      sk.split("").forEach(function (c, m) {
        var kx = x + r * 0.78 + m * r * 0.5, ky = y - r * 0.8, kr = r * 0.26;
        out.push('<rect x="' + (kx - kr).toFixed(1) + '" y="' + (ky - kr).toFixed(1) + '" width="' + (2 * kr).toFixed(1) + '" height="' + (2 * kr).toFixed(1) + '" rx="' + (kr * 0.35).toFixed(1) + '" fill="' + SKC[c] + '" stroke="#05070c" stroke-width="' + (kr * 0.12).toFixed(2) + '" transform="rotate(45 ' + kx.toFixed(1) + " " + ky.toFixed(1) + ')"/>');
      });
      if (p[4].indexOf("L") > -1) {
        var lx = x - r * 0.85, ly = y - r * 0.85, lr = r * 0.32;
        out.push('<path d="' + star(lx, ly, lr) + '" fill="#f6d36b" stroke="#05070c" stroke-width="' + (lr * 0.1).toFixed(2) + '"/>');
      }
      if (opt.names !== false) {
        out.push('<text x="' + x.toFixed(1) + '" y="' + (y + r + s * 0.12).toFixed(1) + '" text-anchor="middle" font-size="' + (s * 0.105).toFixed(1) + '" font-family="Source Sans 3, sans-serif" font-weight="600" fill="#e8edf5">' + esc(p[0]) + "</text>");
      }
    });
    out.push("</g>");
    // Rand nach Rückseite
    var BC = { green: "#3f9a54", blue: "#3a6ea5", red: "#a8463c", hyperlane: "#c9a227" };
    out.push('<polygon points="' + hexPoints(cx, cy, s * 0.96) + '" fill="none" stroke="' + (BC[t.k] || "#3a6ea5") + '" stroke-width="' + (s * 0.05).toFixed(2) + '" opacity=".9"/>');
    if (opt.number !== false && t.k !== "hyperlane") {
      out.push('<text x="' + cx + '" y="' + (cy - s * 0.66) + '" text-anchor="middle" font-size="' + (s * 0.16).toFixed(1) + '" font-family="IBM Plex Mono, monospace" font-weight="500" fill="#cfd6e3" opacity=".9">' + id + "</text>");
    }
    if (t.k === "hyperlane" && opt.number !== false) {
      out.push('<text x="' + cx + '" y="' + (cy + s * 0.04) + '" text-anchor="middle" font-size="' + (s * 0.18).toFixed(1) + '" font-family="IBM Plex Mono, monospace" font-weight="500" fill="#f0c040">' + id + "</text>");
    }
    return out.join("");
  }
  function star(x, y, r) {
    var d = "";
    for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; d += (k ? "L" : "M") + (x + rr * Math.cos(a)).toFixed(1) + " " + (y + rr * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // Einzelne Tafel als eigenständiges SVG (z. B. Heimat-System in der Fraktionsübersicht)
  function singleTile(id, size, opt) {
    opt = opt || {};
    var s = 100, uid = (opt.uid || "s") + String(id).replace(/\W/g, "");
    return '<svg class="tile-svg" viewBox="' + (-s) + " " + (-s * 0.88) + " " + (2 * s) + " " + (1.76 * s) + '" width="' + (size || 160) + '" role="img" aria-label="Tafel ' + esc(id) + ": " + esc(tileText(id)) + '">' + defs(uid) +
      tileSVG(String(id), 0, 0, s, { uid: uid, names: opt.names, number: opt.number }) + "</svg>";
  }

  /* ---------- Layout und Graph ---------- */
  function layoutById(id) { return D.layouts.filter(function (l) { return l.id === id; })[0] || D.layouts[4]; }
  function seatOrder(homes) {
    return homes.slice().sort(function (a, b) {
      function ang(i) { var p = px(i, 1); var t = Math.atan2(p.x, -p.y); return t < 0 ? t + 2 * Math.PI : t; }
      return ang(a) - ang(b);
    });
  }
  // board: { pos: tileId | "home" | {hyper:id, rot} }
  function buildGraph(layout, board) {
    var nodes = {}, adj = {};
    var hyperAt = {};
    layout.hyper.forEach(function (h) { hyperAt[h[0]] = { id: h[1], rot: h[2] }; });
    var all = [0].concat(layout.homes, layout.slots);
    all.forEach(function (i) { nodes[i] = true; adj[i] = {}; });
    all.forEach(function (i) {
      for (var d = 0; d < 6; d++) {
        var j = neighbor(i, d);
        if (j < 0) continue;
        if (nodes[j]) { adj[i][j] = 1; continue; }
        if (hyperAt[j]) follow(i, j, {}).forEach(function (q) { if (q !== i) { adj[i][q] = 1; adj[q] = adj[q] || {}; adj[q][i] = 1; } });
      }
    });
    function follow(from, hpos, seen) {
      if (seen[hpos]) return []; seen[hpos] = 1;
      var h = hyperAt[hpos], t = TILES[h.id], res = [];
      var dIn = -1; for (var d = 0; d < 6; d++) if (neighbor(hpos, d) === from) dIn = d;
      (t.h || []).forEach(function (l) {
        var a = (l[0] + h.rot) % 6, b = (l[1] + h.rot) % 6, out = a === dIn ? b : (b === dIn ? a : -1);
        if (out < 0) return;
        var q = neighbor(hpos, out);
        if (q < 0) return;
        if (nodes[q]) res.push(q); else if (hyperAt[q]) res = res.concat(follow(hpos, q, seen));
      });
      return res;
    }
    return adj;
  }
  function distances(adj, start, wormholeLinks) {
    var dist = {}; dist[start] = 0; var queue = [start];
    while (queue.length) {
      var i = queue.shift();
      var nb = Object.keys(adj[i] || {}).map(Number).concat(wormholeLinks[i] || []);
      nb.forEach(function (j) { if (dist[j] === undefined) { dist[j] = dist[i] + 1; queue.push(j); } });
    }
    return dist;
  }

  /* ---------- Generator ---------- */
  var POOL_BLUE_BASE = [], POOL_RED_BASE = [], POOL_BLUE_POK = [], POOL_RED_POK = [];
  Object.keys(TILES).forEach(function (id) {
    var t = TILES[id]; if (t.x) return;
    if (t.k === "blue") (t.src === "base" ? POOL_BLUE_BASE : POOL_BLUE_POK).push(id);
    if (t.k === "red") (t.src === "base" ? POOL_RED_BASE : POOL_RED_POK).push(id);
  });

  function planetValue(p) {
    var r = p[1], i = p[2], R = 0, I = 0;
    if (r > i) R = r; else if (i > r) I = i; else { R = r / 2; I = i / 2; }
    return { R: R, I: I, skip: p[4].replace("L", "").length, leg: p[4].indexOf("L") > -1 ? 1 : 0 };
  }

  function evaluate(layout, board, adj) {
    var whLinks = {};
    var byType = {};
    Object.keys(board).forEach(function (pos) {
      var id = board[pos]; if (typeof id !== "string") return;
      wormholes(id).forEach(function (w) { (byType[w] = byType[w] || []).push(+pos); });
    });
    Object.keys(byType).forEach(function (w) { var l = byType[w]; l.forEach(function (a) { whLinks[a] = (whLinks[a] || []).concat(l.filter(function (b) { return b !== a; })); }); });
    var homes = seatOrder(layout.homes);
    var dists = homes.map(function (h) { return distances(adj, h, whLinks); });
    var W = { 1: 1, 2: 0.6, 3: 0.3 };
    var seats = homes.map(function (h) { return { home: h, R: 0, I: 0, skip: 0, leg: 0, wh: 0, anom: 0, planets: 0, score: 0 }; });
    layout.slots.forEach(function (pos) {
      var id = board[pos]; if (!id) return;
      var best = 99; dists.forEach(function (d) { if (d[pos] !== undefined && d[pos] < best) best = d[pos]; });
      if (best > 3) return;
      var owners = []; dists.forEach(function (d, k) { if (d[pos] === best) owners.push(k); });
      var w = W[best] / owners.length;
      owners.forEach(function (k) {
        var S = seats[k];
        planets(id).forEach(function (p) { var v = planetValue(p); S.R += v.R * w; S.I += v.I * w; S.skip += v.skip * w; S.leg += v.leg * w; S.planets += w; });
        S.wh += wormholes(id).length * w;
        if (isAnomaly(id)) S.anom += w;
      });
    });
    seats.forEach(function (S) { S.score = S.R + S.I + 0.6 * S.skip + 1.2 * S.leg + 0.4 * S.wh - 0.3 * S.anom; });
    var scores = seats.map(function (S) { return S.score; });
    var spread = Math.max.apply(null, scores) - Math.min.apply(null, scores);
    return { seats: seats, spread: spread };
  }

  // Konflikt zweier Tafeln: zwei Anomalien oder gleiche Wurmlöcher nebeneinander
  function conflict(x, y) {
    if (!x || !y || typeof x !== "string" || typeof y !== "string") return 0;
    var n = 0;
    if (isAnomaly(x) && isAnomaly(y)) n++;
    var wa = wormholes(x), wb = wormholes(y);
    if (wa.some(function (w) { return wb.indexOf(w) > -1; })) n++;
    return n;
  }
  // Nachbarn unter den frei belegbaren Feldern (Mecatol und Heimat-Systeme können keinen Konflikt auslösen)
  function slotNeighbors(layout, adj) {
    var isSlot = {}; layout.slots.forEach(function (p) { isSlot[p] = 1; });
    var nb = {};
    layout.slots.forEach(function (a) { nb[a] = Object.keys(adj[a]).map(Number).filter(function (b) { return isSlot[b]; }); });
    return nb;
  }
  function localConf(board, nb, a) { var n = 0, l = nb[a]; for (var k = 0; k < l.length; k++) n += conflict(board[a], board[l[k]]); return n; }
  function violations(layout, board, adj, nb) {
    nb = nb || slotNeighbors(layout, adj);
    var v = 0;
    layout.slots.forEach(function (a) { v += localConf(board, nb, a); });
    return v / 2;
  }

  // Schrittweise erzeugen, damit die Oberfläche währenddessen reagiert. Gleicher Startwert ergibt immer dieselbe Karte.
  function generator(opts) {
    var layout = layoutById(opts.layout);
    var pok = opts.pok !== false || !!layout.pok;
    var seed = opts.seed >>> 0;
    var rnd = rng(seed);
    var nBlue = layout.players * layout.deal.blue + ((layout.extra || {}).blue || 0);
    var nRed = layout.players * layout.deal.red + ((layout.extra || {}).red || 0);
    var blues = POOL_BLUE_BASE.concat(pok ? POOL_BLUE_POK : []);
    var reds = POOL_RED_BASE.concat(pok ? POOL_RED_POK : []);
    if (blues.length < nBlue || reds.length < nRed) return { error: "Für diesen Aufbau reichen die Systemtafeln nur mit Prophezeiung der Könige." };
    // Erst viele Zufallsverteilungen, dann die beste durch Tauschen von Tafeln weiter ausgleichen
    var tries = opts.balance === false ? 30 : 140, polish = opts.balance === false ? 0 : 900;
    var adj = buildGraph(layout, {}), nb = slotNeighbors(layout, adj);
    var best = null, t = 0, u = 0, done = false;
    function sample() {
      var b = pick(blues, nBlue, rnd, opts, "blue"), r = pick(reds, nRed, rnd, opts, "red");
      var tiles = shuffle(b.concat(r), rnd);
      var board = {}; board[0] = "18";
      layout.slots.forEach(function (pos, k) { board[pos] = tiles[k]; });
      repair(layout, board, nb, rnd);
      var vio = violations(layout, board, adj, nb);
      var ev = evaluate(layout, board, adj);
      if (!best || vio < best.vio || (vio === best.vio && opts.balance !== false && ev.spread < best.ev.spread)) best = { board: board, vio: vio, ev: ev };
      t++;
      if (opts.balance === false && best.vio === 0) t = tries;
    }
    function improve() {
      var slots = layout.slots, board = best.board;
      var a = slots[Math.floor(rnd() * slots.length)], c = slots[Math.floor(rnd() * slots.length)];
      u++;
      if (a === c || board[a] === board[c]) return;
      var before = localConf(board, nb, a) + localConf(board, nb, c);
      var tmp = board[a]; board[a] = board[c]; board[c] = tmp;
      var after = localConf(board, nb, a) + localConf(board, nb, c);
      if (after <= before) {
        var ev = evaluate(layout, board, adj);
        if (after < before || ev.spread < best.ev.spread - 1e-9) { best.ev = ev; best.vio += (after - before) / 2; return; }
      }
      tmp = board[a]; board[a] = board[c]; board[c] = tmp;
    }
    function one() {
      if (t < tries) sample(); else if (u < polish) improve();
      if (t >= tries && u >= polish) done = true;
    }
    var total = tries + polish;
    return {
      total: total,
      step: function (n) { for (var k = 0; k < n && !done; k++) one(); return done; },
      progress: function () { return done ? 1 : (t + u) / total; },
      result: function () { return { layout: layout, board: best.board, eval: best.ev, violations: best.vio, seed: seed, pok: pok, opts: opts, seats: seatOrder(layout.homes) }; }
    };
  }
  function generate(opts) {
    var g = generator(opts);
    if (g.error) return g;
    g.step(1e9);
    return g.result();
  }
  function pick(pool, n, rnd, opts, kind) {
    var p = shuffle(pool.slice(), rnd), chosen = [];
    function force(pred, count) {
      p.filter(pred).slice(0, count).forEach(function (id) { if (chosen.indexOf(id) < 0 && chosen.length < n) chosen.push(id); });
    }
    if (kind === "blue" && opts.legendary) force(function (id) { return planets(id).some(function (q) { return q[4].indexOf("L") > -1; }); }, opts.legendary);
    if (opts.wormholes) {
      var need = { a: 2, b: 2 };
      // Wurmlöcher verteilen sich auf blaue und rote Tafeln, je Art höchstens 2 erzwingen
      ["a", "b"].forEach(function (w) { force(function (id) { return wormholes(id).indexOf(w) > -1; }, kind === "red" ? 1 : need[w] - 1); });
    }
    p.forEach(function (id) { if (chosen.length < n && chosen.indexOf(id) < 0) chosen.push(id); });
    return chosen;
  }
  function repair(layout, board, nb, rnd) {
    var slots = layout.slots;
    for (var it = 0; it < 150; it++) {
      var bad = slots.filter(function (a) { return localConf(board, nb, a) > 0; });
      if (!bad.length) return;
      var a = bad[Math.floor(rnd() * bad.length)], c = slots[Math.floor(rnd() * slots.length)];
      if (a === c) continue;
      var before = localConf(board, nb, a) + localConf(board, nb, c);
      var tmp = board[a]; board[a] = board[c]; board[c] = tmp;
      if (localConf(board, nb, a) + localConf(board, nb, c) > before) { tmp = board[a]; board[a] = board[c]; board[c] = tmp; }
    }
  }

  /* ---------- Darstellung des ganzen Spielplans ---------- */
  var RING_COL = ["#e07a2e", "#3fb3e0", "#3a68c4", "#2b3f86", "#7a5bb0"];
  function boardSVG(layout, board, mode, opts) {
    opts = opts || {};
    var s = 100, uid = "b" + (opts.uid || "");
    var hyperAt = {}; layout.hyper.forEach(function (h) { hyperAt[h[0]] = h; });
    var seats = seatOrder(layout.homes);
    var positions = [0].concat(layout.homes, layout.slots, layout.hyper.map(function (h) { return h[0]; }));
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    positions.forEach(function (i) { var p = px(i, s); minX = Math.min(minX, p.x - s); maxX = Math.max(maxX, p.x + s); minY = Math.min(minY, p.y - s * 0.9); maxY = Math.max(maxY, p.y + s * 0.9); });
    var pad = s * 0.1;
    var vb = [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad].map(function (v) { return v.toFixed(0); }).join(" ");
    var out = ['<svg class="board-svg" viewBox="' + vb + '" role="img" aria-label="' + esc(opts.label || layout.name) + '">', defs(uid)];
    positions.forEach(function (i) {
      var p = px(i, s);
      var attrs = ' data-pos="' + i + '" class="hex"';
      if (mode === "schema") {
        var fill = RING_COL[POS[i].ring], stroke = "#0b0f1a";
        var isHome = layout.homes.indexOf(i) > -1, h = hyperAt[i];
        if (isHome) fill = "#3f9a54";
        if (h) fill = "#e9b72a";
        out.push("<g" + attrs + '><polygon points="' + hexPoints(p.x, p.y, s * 0.95) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="6"/>');
        if (h) {
          (TILES[h[1]].h || []).forEach(function (l) {
            var a = edgeMid(p.x, p.y, s * 0.95, (l[0] + h[2]) % 6), b = edgeMid(p.x, p.y, s * 0.95, (l[1] + h[2]) % 6);
            out.push('<path d="M' + a.x.toFixed(1) + " " + a.y.toFixed(1) + " Q " + p.x + " " + p.y + " " + b.x.toFixed(1) + " " + b.y.toFixed(1) + '" fill="none" stroke="#c0281e" stroke-width="7" stroke-linecap="round"/>');
          });
          out.push('<text x="' + p.x + '" y="' + (p.y + s * 0.62) + '" text-anchor="middle" font-size="24" font-family="IBM Plex Mono, monospace" fill="#3a2a00">' + h[1] + "</text>");
        }
        if (isHome) {
          var k = seats.indexOf(i);
          out.push('<text x="' + p.x + '" y="' + (p.y + 14) + '" text-anchor="middle" font-size="40" font-weight="700" font-family="Saira Condensed, sans-serif" fill="#fff">P' + (k + 1) + "</text>");
          var tg = layout.tg && layout.tg[String(i)];
          if (tg) out.push('<text x="' + p.x + '" y="' + (p.y + 50) + '" text-anchor="middle" font-size="24" font-weight="600" font-family="Source Sans 3, sans-serif" fill="#fff">+' + tg + " HW</text>");
        }
        if (i === 0) out.push('<text x="0" y="12" text-anchor="middle" font-size="26" font-weight="700" font-family="Saira Condensed, sans-serif" fill="#fff">Mecatol</text>');
        out.push("</g>");
      } else {
        var id = i === 0 ? "18" : board && board[i];
        var hy = hyperAt[i];
        out.push("<g" + attrs + ' data-act="hex" role="button" tabindex="0" aria-label="' + esc(hexLabel(layout, board, i)) + '">');
        if (hy) out.push(tileSVG(hy[1], p.x, p.y, s, { uid: uid, rot: hy[2] }));
        else if (layout.homes.indexOf(i) > -1) {
          var kk = seats.indexOf(i);
          out.push('<polygon points="' + hexPoints(p.x, p.y, s * 0.985) + '" fill="url(#' + uid + 'sp)"/>');
          out.push('<polygon points="' + hexPoints(p.x, p.y, s * 0.96) + '" fill="none" stroke="#3f9a54" stroke-width="5"/>');
          out.push('<circle cx="' + p.x + '" cy="' + (p.y - 6) + '" r="' + s * 0.36 + '" fill="' + SEAT[kk % 8] + '" stroke="#e8edf5" stroke-opacity=".7" stroke-width="3"/>');
          out.push('<text x="' + p.x + '" y="' + (p.y + 9) + '" text-anchor="middle" font-size="40" font-weight="700" font-family="Saira Condensed, sans-serif" fill="#fff">P' + (kk + 1) + "</text>");
          out.push('<text x="' + p.x + '" y="' + (p.y + s * 0.66) + '" text-anchor="middle" font-size="17" font-family="Source Sans 3, sans-serif" fill="#cfd6e3">' + (kk === 0 ? "Sprecher" : "Heimat") + "</text>");
          var tg2 = layout.tg && layout.tg[String(i)];
          if (tg2) out.push('<text x="' + p.x + '" y="' + (p.y - s * 0.55) + '" text-anchor="middle" font-size="20" font-weight="600" font-family="Source Sans 3, sans-serif" fill="#f1c24b">+' + tg2 + " HW</text>");
        } else if (id) out.push(tileSVG(id, p.x, p.y, s, { uid: uid, names: opts.names }));
        out.push("</g>");
      }
    });
    if (mode !== "schema") out.push('<polygon class="selring" points="" fill="none" stroke="#ffffff" stroke-width="7" pointer-events="none"/>');
    out.push("</svg>");
    return out.join("");
  }
  function hexLabel(layout, board, i) {
    if (i === 0) return "Mecatol Rex";
    var h = layout.hyper.filter(function (x) { return x[0] === i; })[0];
    if (h) return "Hyperroute " + h[1];
    var k = seatOrder(layout.homes).indexOf(i);
    if (k > -1) return "Heimat-System P" + (k + 1);
    return board && board[i] ? "Tafel " + board[i] + ": " + tileText(board[i]) : "leer";
  }
  function hexPointsAt(i) { var p = px(i, 100); return hexPoints(p.x, p.y, 94); }

  /* ---------- Export ---------- */
  function mapString(res) {
    // Format wie bei gängigen Online-Kartentools: Positionen 1 bis Ende, Heimat = 0, leer = -1, Hyperrouten mit Drehung
    var layout = res.layout, max = 0;
    [].concat(layout.homes, layout.slots, layout.hyper.map(function (h) { return h[0]; })).forEach(function (i) { if (i > max) max = i; });
    var hyperAt = {}; layout.hyper.forEach(function (h) { hyperAt[h[0]] = h; });
    var out = [];
    for (var i = 1; i <= max; i++) {
      if (layout.homes.indexOf(i) > -1) out.push("0");
      else if (hyperAt[i]) out.push(hyperAt[i][1] + (hyperAt[i][2] ? hyperAt[i][2] : ""));
      else if (res.board[i]) out.push(res.board[i]);
      else out.push("-1");
    }
    return out.join(" ");
  }
  function tileList(res) {
    var blue = [], red = [];
    res.layout.slots.forEach(function (p) { var id = res.board[p]; if (!id) return; (TILES[id].k === "blue" ? blue : red).push(+id); });
    blue.sort(function (a, b) { return a - b; }); red.sort(function (a, b) { return a - b; });
    return { blue: blue, red: red, hyper: res.layout.hyper.map(function (h) { return h[1]; }) };
  }

  D.Map = {
    POS: POS, neighbor: neighbor, px: px, tileText: tileText, singleTile: singleTile, boardSVG: boardSVG,
    generate: generate, generator: generator, mapString: mapString, tileList: tileList, layoutById: layoutById, seatOrder: seatOrder,
    SEAT: SEAT, buildGraph: buildGraph, hexPointsAt: hexPointsAt, hexLabel: hexLabel, RING_COL: RING_COL, violations: violations, evaluate: evaluate
  };
})();
