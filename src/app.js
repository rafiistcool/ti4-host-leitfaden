/* TI4 Host-Leitfaden: Navigation, Ablauf, Nachschlagen, Suche. Kein Framework, kein Build-Zwang. */
(function () {
  "use strict";
  var D = window.TI4;
  var PH = D.phases;
  var TOPICS = D.topics;
  var RULES = D.rules.slice().sort(function (a, b) { return a.t.localeCompare(b.t, "de"); });
  var ruleById = {}; D.rules.forEach(function (r) { ruleById[r.id] = r; });
  var topicById = {}; TOPICS.forEach(function (t) { topicById[t.id] = t; });

  /* ---------- Speicher (nur Komfort, darf fehlen) ---------- */
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var DEFAULT = { p: 0, s: 0, round: 1, cust: false };
  var st = Object.assign({}, DEFAULT, load("ti4.v2.pos", {}));
  var checks = load("ti4.v2.checks", {});
  var searchQ = "";
  var ruleFilter = "";
  var resetArmed = false, resetTimer = null;

  /* ---------- Helfer ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function plain(s) { return String(s).replace(/\*\*/g, ""); }
  function norm(s) {
    return plain(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[„“"]/g, "");
  }

  var ICON = {
    ablauf: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="M12 7v5l3 2"/>',
    kampf: '<path d="M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0"/><path d="M12 1v6M12 17v6M1 12h6M17 12h6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    takt: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    timing: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="M12 7v5l3 2"/>',
    handel: '<path d="M4 8h15l-4-4M20 16H5l4 4"/>',
    sc: '<path d="M5 7h10v14H5zM9 3h10v14"/>',
    limits: '<path d="M4 18a8 8 0 1 1 16 0M12 18l4-6"/>',
    pok: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5l-5.3 2.9 1.2-6-4.5-4.1 6-.7z"/>',
    aufbau: '<path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z"/>',
    az: '<path d="M4 19l4-14 4 14M5.5 14h5M14 5h6l-6 14h6"/>',
    info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="M12 11v6M12 7.5v.5"/>',
    say: '<path d="M3 10v4h4l6 5V5L7 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    map: '<path d="M12 2.5l3.5 2v4L12 10.5 8.5 8.5v-4z"/><path d="M7 11.5l3.5 2v4L7 19.5l-3.5-2v-4z"/><path d="M17 11.5l3.5 2v4l-3.5 2-3.5-2v-4z"/>',
    faction: '<path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z"/><path d="M12 8v8M8.5 12h7"/>',
    tech: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>',
    cards: '<rect x="3.5" y="6.5" width="12" height="15" rx="2"/><path d="M8 3.5h10.5a2 2 0 0 1 2 2V18"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r=".6"/><circle cx="15" cy="9" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="9" cy="15" r=".6"/><circle cx="15" cy="15" r=".6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    fwd: '<path d="M9 5l7 7-7 7"/>',
    hub: '<path d="M12 2l2.4 6.6L21 9l-5.2 4.3L17.5 20 12 16.3 6.5 20l1.7-6.7L3 9l6.6-.4z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3M8.5 20h7M10 17h4v3h-4z"/>',
    chart: '<path d="M5 20V12M10 20V6M15 20v-9M20 20V4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5 15a8 8 0 1 0 2-8.5L4 10"/>'
  };
  function svg(name, size, color) {
    return '<svg width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || "currentColor") +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + "</svg>";
  }

  /* ---------- Erweiterungen (Aufbau, Kartengenerator, Kompendium) ---------- */
  var EXT = D.ext || [];
  D.UI = {
    esc: esc, md: md, plain: plain, norm: norm, svg: svg, refChip: function (r) { return refChip(r); }, blocks: function (l) { return blocks(l); },
    go: function (h) { go(h); }, load: load, save: save, topicById: topicById,
    route: function () { return route; }, rerender: function () { render(false); }
  };

  /* ---------- Routing über #anker ---------- */
  function parseHash() {
    var h = "";
    try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) {}
    if (!h || h === "ablauf") return { v: "ablauf" };
    if (h === "kampf") return { v: "topic", id: "kampf", tab: "kampf" };
    for (var x = 0; x < EXT.length; x++) {
      var er = EXT[x].parse(h);
      if (er) { er.v = "ext"; er.x = EXT[x]; return er; }
    }
    if (h === "nachschlagen" || h === "regeln" || h === "suche" || h === "credits") return { v: h };
    if (h.indexOf("t-") === 0 && topicById[h.slice(2)]) return { v: "topic", id: h.slice(2) };
    if (h.indexOf("r-") === 0 && ruleById[h.slice(2)]) return { v: "regeln", focus: h.slice(2) };
    return { v: "ablauf" };
  }
  var route = parseHash();
  function go(hash) {
    if (("#" + hash) === location.hash || (!location.hash && hash === "ablauf")) { route = parseHash(); render(true); return; }
    try { location.hash = hash; } catch (e) { route = parseHash(); render(true); }
  }
  window.addEventListener("hashchange", function () { route = parseHash(); render(true); });

  /* ---------- Ablauf-Logik ---------- */
  function locked(i) { return !!PH[i].needsCustodians && !st.cust; }
  function persist() { save("ti4.v2.pos", st); }
  function setPos(p, s) { st.p = p; st.s = s; persist(); }
  function nextPhaseIndex() {
    if (st.p === 2) return st.cust ? 3 : -1;
    if (st.p === 3) return -1;
    return st.p + 1;
  }
  function goNext() {
    var steps = PH[st.p].steps;
    if (st.s < steps.length - 1) { setPos(st.p, st.s + 1); return; }
    var n = nextPhaseIndex();
    if (n === -1) { st.round += 1; setPos(0, 0); clearChecks(["raumkampf", "einmarsch", "taktik", "handel"]); darfSt = {}; return; }
    setPos(n, 0);
  }
  function goPrev() {
    if (st.s > 0) { setPos(st.p, st.s - 1); return; }
    if (st.p === 0) return;
    var p = st.p - 1;
    setPos(p, PH[p].steps.length - 1);
  }
  function nextLabel() {
    var steps = PH[st.p].steps;
    if (st.s < steps.length - 1) return "Weiter: " + steps[st.s + 1].t;
    if (st.p === 0) return "Weiter zur Aktionsphase";
    if (st.p === 1) return "Alle gepasst";
    if (st.p === 2 && st.cust) return "Weiter zur Agendaphase";
    return "Runde " + (st.round + 1) + " starten";
  }
  function clearChecks(lists) {
    Object.keys(checks).forEach(function (k) {
      lists.forEach(function (l) { if (k.indexOf("chk-" + l + "-") === 0) delete checks[k]; });
    });
    save("ti4.v2.checks", checks);
  }

  /* ---------- Verweise ---------- */
  function refChip(ref) {
    if (ref.indexOf("r:") === 0) {
      var r = ruleById[ref.slice(2)];
      if (!r) return "";
      return '<a class="chip" href="#r-' + r.id + '"><span class="nr">Nr. ' + r.nr + "</span>" + esc(r.t) + "</a>";
    }
    var t = topicById[ref];
    return t ? '<a class="chip" href="#t-' + t.id + '">' + esc(t.name) + " ›</a>" : "";
  }

  /* ---------- Darf ich das? (Daten: data/darfich.js) ---------- */
  var DARF = D.darf || { sets: [], kinds: {} };
  var darfSetById = {}; DARF.sets.forEach(function (s) { darfSetById[s.id] = s; });
  var darfSt = {};          // Set-ID -> { id: Prüfung oder null, a: ["ja"|"nein", …] }, nur im Speicher
  var pendingReveal = null; // Element-ID, die nach dem nächsten Rendern ins Bild gescrollt wird
  var KIND_ICON = {
    ok: "M5 12.5 L10 17 L19 7", no: "M7 7 L17 17 M17 7 L7 17", cond: "M12 5.5 V13.5 M12 18.2 V18.3",
    must: "M5 12 H19 M13 6 L19 12 L13 18", skip: "M6 12 H18"
  };
  function pathSvg(d, size, sw) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + esc(d) + '"/></svg>';
  }
  function darfChecks(set) { return set.groups.reduce(function (all, g) { return all.concat(g.checks); }, []); }
  function darfCheck(set, id) { return darfChecks(set).filter(function (c) { return c.id === id; })[0] || null; }
  function darfState(setId) { return darfSt[setId] || (darfSt[setId] = { id: null, a: [] }); }
  /* Wertet die Antworten aus: Spur der beantworteten Fragen, Ergebnis oder Index der offenen Frage. */
  function darfEval(c, answers) {
    var trail = [], verdict = null, qi = -1;
    for (var i = 0; i < c.qs.length; i++) {
      if (i >= answers.length) { qi = i; break; }
      var q = c.qs[i], yes = answers[i] === "ja", hit = (yes ? q.yes : q.no) || null;
      trail.push({ q: q, yes: yes, hit: hit });
      if (hit) { verdict = hit; break; }
    }
    if (!verdict && qi === -1 && c.ok) verdict = Object.assign({ kind: "ok" }, c.ok);
    return { trail: trail, verdict: verdict, qi: qi };
  }
  function darfStepPos(setId) {
    for (var p = 0; p < PH.length; p++) for (var s = 0; s < PH[p].steps.length; s++) if (PH[p].steps[s].darf === setId) return { p: p, s: s };
    return null;
  }
  /* Themen-Seite, auf der das Panel als Block steht. Ziel für Suche und Verweise, damit der Ablauf an seiner Stelle bleibt. */
  function darfTopicHash(setId) {
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].blocks.some(function (b) { return b.darf === setId; })) return TOPICS[i].id === "kampf" ? "kampf" : "t-" + TOPICS[i].id;
    }
    return "kampf";
  }
  function darfHref(setId) { return "#" + darfTopicHash(setId); }

  /* level: Überschriftenebene des Panels (2 im Ablauf unter h1, 4 in Themen unter h3). */
  function darfPanel(setId, level) {
    var set = darfSetById[setId];
    if (!set) return "";
    var stt = darfState(setId), c = stt.id ? darfCheck(set, stt.id) : null;
    var pre = "darf-" + setId, hl = "h" + (level || 2);
    var h = '<section class="darf" id="' + pre + '" data-level="' + (level || 2) + '" aria-labelledby="' + pre + '-h">' +
      '<div class="darf-head"><' + hl + ' id="' + pre + '-h">Darf ich das?<span class="sr"> ' + esc(set.name) + "</span></" + hl + "><span>" + (c ? esc(set.name) + ": " + esc(c.name) : "Tippe, was du vorhast") + "</span></div>";
    if (set.steps) {
      h += '<div class="darf-strip"><span class="k" id="' + pre + '-sk">' + esc(set.stepsTitle || "Ablauf") + '</span><ol aria-labelledby="' + pre + '-sk">' +
        set.steps.map(function (t, i) {
          var on = c && c.at && c.at.indexOf(i + 1) > -1;
          return "<li" + (on ? ' class="on" aria-current="step"' : "") + '><span class="n">' + (i + 1) + "</span><span>" + esc(t) + "</span></li>";
        }).join("") + "</ol>" + (c && c.hint ? '<p class="hint">' + esc(c.hint) + "</p>" : "") + "</div>";
    }
    set.groups.forEach(function (g, gi) {
      if (set.groups.length > 1) h += '<p class="darf-gk">' + esc(g.name) + "</p>";
      h += '<div class="darf-tiles" style="--n:' + g.checks.length + '">' + g.checks.map(function (x) {
        var on = c && c.id === x.id;
        return '<button type="button" class="darf-tile" data-act="darf-pick" data-set="' + setId + '" data-id="' + x.id + '" aria-pressed="' + (on ? "true" : "false") + '">' +
          pathSvg(x.icon, 22, 1.8) + "<span>" + esc(x.label) + "</span></button>";
      }).join("") + "</div>";
      if (setId === "aktion" && gi === 0) {
        h += '<div class="darf-more">' + [["raumkampf", "Schritt 3: Raumkampf prüfen", "kampf"], ["einmarsch", "Schritt 4: Einmarsch prüfen", "erobern"]].filter(function (m) { return darfSetById[m[0]]; }).map(function (m) {
          var ic = darfCheck(darfSetById[m[0]], m[2]);
          return '<a class="darf-link" href="' + darfHref(m[0]) + '" data-act="darf-goto" data-set="' + m[0] + '">' + (ic ? pathSvg(ic.icon, 20, 1.8) : "") +
            "<span>" + esc(m[1]) + '</span><span class="arr" aria-hidden="true">›</span></a>';
        }).join("") + "</div>";
      }
    });
    if (c) h += darfCheckHtml(setId, c, stt.a);
    return h + "</section>";
  }

  function darfCheckHtml(setId, c, answers) {
    var r = darfEval(c, answers), pre = "darf-" + setId;
    var h = '<div class="darf-check"><div class="darf-ch"><div><div class="nm">' + esc(c.name) + '</div><div class="st">' + esc(c.step) + '</div></div><span class="ref">' + esc(c.ref) + "</span></div>";
    if (r.trail.length) {
      h += '<div class="darf-trail">' + r.trail.map(function (t, i) {
        var kind = t.hit ? t.hit.kind : "ok", ans = t.yes ? "Ja" : "Nein";
        return '<button type="button" data-act="darf-back" data-set="' + setId + '" data-i="' + i + '" aria-label="Antwort ändern: ' + esc(t.q.s) + " " + ans + '">' +
          '<span class="darf-dot k-' + kind + '">' + pathSvg(KIND_ICON[kind], 14, 3) + '</span><span class="tx">' + esc(t.q.s) + '</span><span class="a">' + ans + "</span></button>";
      }).join("") + "</div>";
    }
    if (r.qi > -1) {
      var q = c.qs[r.qi];
      h += '<div class="darf-q" id="' + pre + '-focus" tabindex="-1" role="group" aria-labelledby="' + pre + '-qn ' + pre + '-qq">' +
        '<p class="n" id="' + pre + '-qn">Frage ' + (r.qi + 1) + " von " + c.qs.length + '</p><p class="q" id="' + pre + '-qq">' + esc(q.q) + "</p>" +
        (q.help ? '<p class="help">' + esc(q.help) + "</p>" : "") +
        '<div class="yn"><button type="button" data-act="darf-ans" data-set="' + setId + '" data-v="ja">Ja</button>' +
        '<button type="button" data-act="darf-ans" data-set="' + setId + '" data-v="nein">Nein</button></div></div>';
    } else if (r.verdict) {
      var v = r.verdict;
      h += '<div class="darf-v k-' + v.kind + '" id="' + pre + '-focus" tabindex="-1" role="status">' +
        '<div class="vh"><span class="darf-dot big">' + pathSvg(KIND_ICON[v.kind], 22, 2.6) + "</span><b>" + esc(DARF.kinds[v.kind] || "") + "</b></div>" +
        "<p>" + esc(v.text) + "</p>" +
        (v.notes && v.notes.length ? '<div class="notes"><span class="k">Denk daran</span><ul>' + v.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul></div>" : "") +
        '<div class="vf"><span class="ref">' + esc(v.ref || c.ref) + '</span><button type="button" data-act="darf-reset" data-set="' + setId + '">' + svg("reset", 18) + "Neu prüfen</button></div></div>";
    }
    return h + "</div>";
  }

  /* Nur das Panel neu zeichnen, damit die Seite nicht springt. Danach Fokus auf Frage oder Ergebnis. */
  function darfRefresh(setId, focusSel) {
    var el = document.getElementById("darf-" + setId);
    if (!el) { render(false); return; }
    el.outerHTML = darfPanel(setId, +el.getAttribute("data-level") || 2);
    var f = document.querySelector(focusSel || "#darf-" + setId + "-focus");
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } reveal(f); }
  }
  function reveal(el) {
    var r = el.getBoundingClientRect(), topH = document.getElementById("top").offsetHeight;
    var dock = document.querySelector(".dock"), bottom = window.innerHeight - (dock ? dock.offsetHeight : 0);
    if (r.top < topH + 8) window.scrollBy(0, r.top - topH - 8);
    else if (r.bottom > bottom - 8) window.scrollBy(0, Math.min(r.bottom - bottom + 8, r.top - topH - 8));
  }
  /* Zu einem Panel springen (aus der Suche oder vom Aktion-Panel), optional mit gewählter Prüfung. */
  function darfOpen(setId, checkId) {
    if (!darfSetById[setId]) return;
    if (checkId) darfSt[setId] = { id: checkId, a: [] };
    pendingReveal = "darf-" + setId;
    var pos = darfStepPos(setId);
    if (pos && st.p === pos.p && st.s === pos.s) go("ablauf");
    else go(darfTopicHash(setId));
  }

  /* ---------- Blöcke rendern ---------- */
  function blocks(list) { return list.map(block).join(""); }
  function block(b) {
    if (b.darf) return darfPanel(b.darf, b.level || 4);
    if (b.h) return '<h3 class="bh">' + md(b.h) + "</h3>";
    if (b.p) return "<p>" + md(b.p) + "</p>";
    if (b.ul) return '<ul class="plain">' + b.ul.map(function (x) { return "<li>" + md(x) + "</li>"; }).join("") + "</ul>";
    if (b.steps) return '<ol class="steps">' + b.steps.map(function (x) { return "<li><span>" + md(x) + "</span></li>"; }).join("") + "</ol>";
    if (b.note) return '<div class="note ' + (b.kind || "tip") + '"><p>' + md(b.note) + "</p></div>";
    if (b.check) {
      var key = b.check;
      return '<div class="checklist"><div class="head"><button type="button" class="reset" data-act="reset-list" data-list="' + key + '">Abhaken zurücksetzen</button></div>' +
        b.items.map(function (it, i) {
          var id = "chk-" + key + "-" + i;
          return '<label for="' + id + '"><input type="checkbox" id="' + id + '" data-chk="' + id + '"' + (checks[id] ? " checked" : "") + '><span><span class="t">' + md(it.t) + "</span>" +
            (it.s ? '<span class="s">' + md(it.s) + "</span>" : "") + "</span></label>";
        }).join("") + "</div>";
    }
    if (b.table) {
      var num = b.table.num || [];
      return '<div class="tbl"><table><thead><tr>' + b.table.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        b.table.rows.map(function (r) {
          return "<tr>" + r.map(function (c, i) { return "<td" + (num.indexOf(i) > -1 ? ' class="num"' : "") + ">" + md(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
    }
    if (b.kv) return '<div class="kv">' + b.kv.map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + md(x[1]) + "</span></div>"; }).join("") + "</div>";
    if (b.sc) {
      return '<div class="sclist">' + b.sc.map(function (c) {
        return '<div class="sc"><div class="n" style="background:var(--sc' + c.n + ')">' + c.n + "</div><div><h3>" + esc(c.name) + " <small>" + esc(c.en) + "</small></h3>" +
          '<p><span class="l">Primär</span>' + md(c.pri) + '</p><p><span class="l">Sekundär</span>' + md(c.sec) + "</p></div></div>";
      }).join("") + "</div>";
    }
    if (b.qa) {
      return '<div class="qa">' + b.qa.map(function (x, i) {
        return '<details class="q" id="q-' + i + '"><summary>' + md(x.q) + '</summary><div class="a"><p>' + md(x.a) + "</p></div></details>";
      }).join("") + "</div>";
    }
    if (b.cards) {
      return '<div class="cards">' + b.cards.map(function (c) { return '<div class="card"><h3>' + md(c.title) + "</h3>" + blocks(c.blocks) + "</div>"; }).join("") + "</div>";
    }
    if (b.rules) {
      return '<div class="chips"><span class="k">Im Regelheft</span>' + b.rules.map(function (id) { return refChip("r:" + id); }).join("") + "</div>";
    }
    return "";
  }

  /* ---------- Ansichten ---------- */
  function viewAblauf() {
    var ph = PH[st.p], step = ph.steps[st.s], total = ph.steps.length;
    var h = '<p class="eyebrow">' + esc(ph.name) + " · Schritt " + (st.s + 1) + " von " + total + "</p>" +
      "<h1>" + md(step.t) + "</h1>" +
      '<p class="step-body">' + md(step.b) + "</p>";
    if (step.say) h += '<div class="say">' + svg("say", 24) + '<div><div class="k">Ansage an den Tisch</div><div class="v">„' + md(step.say) + "“</div></div></div>";
    if (step.warn) h += '<div class="note warn"><p><b>Achtung:</b> ' + md(step.warn) + "</p></div>";
    if (step.darf) h += darfPanel(step.darf, 2);
    if (step.refs && step.refs.length) h += '<div class="chips"><span class="k">Dazu nachschlagen</span>' + step.refs.map(refChip).join("") + "</div>";
    if (st.p === 2 && st.s === total - 1 && !st.cust) h += '<p class="locked-note">Der Hütermarker liegt noch auf Mecatol Rex, darum folgt keine Agendaphase. Wird er entfernt, oben umschalten.</p>';
    h += '<div class="allsteps"><span class="k">' + esc(ph.name) + " · alle Schritte</span>" + ph.steps.map(function (x, j) {
      return '<button type="button" class="' + (j < st.s ? "done" : (j === st.s ? "cur" : "")) + '" data-act="step" data-p="' + st.p + '" data-s="' + j + '"' + (j === st.s ? ' aria-current="step"' : "") +
        '><span class="n">' + (j < st.s ? "✓" : j + 1) + "</span><span>" + md(x.t) + "</span></button>";
    }).join("") + "</div>";
    var up = ph.steps.slice(st.s + 1, st.s + 3);
    if (up.length) {
      h += '<div class="upcoming"><span class="k">Danach</span>' + up.map(function (u, k) {
        return '<div><span class="n">' + (st.s + 2 + k) + "</span><span>" + md(u.t) + "</span></div>";
      }).join("") + "</div>";
    }
    return h;
  }

  function viewHub() {
    var h = "<h1>Nachschlagen</h1>" +
      '<p class="lead">Regeln während der Runde nachsehen. Der Ablauf bleibt an seiner Stelle stehen.</p>' +
      '<form class="search-form" data-form="hub-search" role="search"><label class="field" for="hub-q">' + svg("search", 20) +
      '<span class="sr">Regel suchen</span><input id="hub-q" type="search" placeholder="Suchen, z. B. Rückzug, Sabotage, Hacan" autocomplete="off"></label></form>' +
      '<p class="section-k">Themen</p><div class="topics">' +
      TOPICS.map(function (t) {
        return '<a class="topic" href="' + (t.id === "aufbau" ? "#aufbau" : "#t-" + t.id) + '"><span class="ic">' + svg(t.icon, 22) + '</span><span><span class="nm">' + esc(t.name) + '</span><span class="ds">' + esc(t.desc) + "</span></span></a>";
      }).join("") + "</div>" +
      '<a class="topic big" href="#regeln"><span class="ic">' + svg("az", 22) + '</span><span><span class="nm">Regelreferenz A–Z</span><span class="ds">Alle ' + D.rules.length +
      " Einträge der Living Rules Reference in eigenen Worten, mit den Nummern des offiziellen Regelhefts.</span></span></a>" +
      '<p class="section-k">Kompendium</p><div class="topics">' +
      hubLink("#fraktionen", "faction", "Fraktionen", "Alle " + (D.factions || []).length + " Fraktionen mit Fähigkeiten, Einheiten, Anführern und Heimat-System.") +
      hubLink("#technologien", "tech", "Technologien", "Alle allgemeinen Technologien nach Farbe, dazu die Fraktionstechnologien.") +
      hubLink("#karten", "cards", "Karten", "Aktionskarten, Agenden, Aufträge, Relikte und Erkundungskarten.") +
      hubLink("#originalmaterial", "cards", "Originalmaterial", "Originalkarten und Bögen, deutsch bevorzugt, mit Vergrößerung und Quellen.") +
      hubLink("#generator", "map", "Kartengenerator", "Zufällige, ausgewogene Galaxie für 3 bis 8 Spieler.") + "</div>" +
      '<p class="section-k">Partie</p><div class="list-links">' +
      '<button type="button" data-act="new-game" class="' + (resetArmed ? "danger" : "") + '">' + svg("reset", 20) + "<span>" + (resetArmed ? "Wirklich? Noch einmal tippen zum Zurücksetzen" : "Neue Partie starten (Runde 1, alles zurücksetzen)") + "</span></button>" +
      '<a href="#credits">' + svg("info", 20) + '<span>Über diese Seite und Credits</span><span class="arr">›</span></a></div>';
    return h;
  }

  function hubLink(href, icon, name, desc) {
    return '<a class="topic" href="' + href + '"><span class="ic">' + svg(icon, 22) + '</span><span><span class="nm">' + esc(name) + '</span><span class="ds">' + esc(desc) + "</span></span></a>";
  }

  function viewTopic(id) {
    var t = topicById[id];
    var h = (route.tab === "kampf" ? "" : '<a class="back" href="#nachschlagen">' + svg("back", 18) + "Nachschlagen</a>") +
      "<h1>" + esc(t.name) + "</h1>" + '<p class="lead">' + esc(t.desc) + "</p>" + blocks(t.blocks);
    if (id === "sc") h += '<section class="card"><h2>Originalkarte: Diplomatie</h2><p>Korrigierte deutsche Karte aus den offiziellen Errata vom 18.05.2021.</p>' + D.AssetUI.figure("strategy-diplomacy", "sheet-image") + '</section>';
    return h;
  }

  function letterOf(r) { var c = r.t.charAt(0).toUpperCase(); return ({ "Ä": "A", "Ö": "O", "Ü": "U" })[c] || c; }
  function ruleMatches(r, q) {
    if (!q) return true;
    var hay = norm([r.t, r.en, r.k || "", "nr " + r.nr, JSON.stringify(r.x)].join(" "));
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }
  function viewRegeln() {
    var letters = [];
    RULES.forEach(function (r) { var l = letterOf(r); if (letters.indexOf(l) < 0) letters.push(l); });
    var h = '<a class="back" href="#nachschlagen">' + svg("back", 18) + "Nachschlagen</a><h1>Regelreferenz A–Z</h1>" +
      '<p class="lead">Zusammenfassung der Living Rules Reference 2.0 in eigenen Worten. „Nr.“ ist die Nummer im offiziellen deutschen Regelheft.</p>' +
      '<label class="field" for="rf">' + svg("search", 20) + '<span class="sr">Einträge filtern</span><input id="rf" type="search" placeholder="Einträge filtern, auch englische Begriffe" autocomplete="off" value="' + esc(ruleFilter) + '"></label>' +
      '<nav class="letters" aria-label="Buchstaben">' + letters.map(function (l) { return '<a href="#" data-act="letter" data-l="' + l + '">' + l + "</a>"; }).join("") + "</nav>" +
      '<div class="rules" id="rules">';
    var cur = "";
    RULES.forEach(function (r) {
      var l = letterOf(r);
      if (l !== cur) { cur = l; h += '<h2 class="letter-h" id="L-' + l + '" data-letter="' + l + '">' + l + "</h2>"; }
      var open = route.focus === r.id;
      h += '<details class="rule' + (open ? " flash" : "") + '" id="r-' + r.id + '" data-letter="' + l + '"' + (open ? " open" : "") + "><summary>" +
        '<span class="nr">Nr. ' + r.nr + '</span><span class="tt">' + esc(r.t) + "</span>" + (r.pok ? ' <span class="tag">PoK</span>' : "") +
        '<span class="en">' + esc(r.en) + "</span></summary>" +
        '<div class="rb">' + r.x.map(function (x) {
          return Array.isArray(x) ? '<ul class="plain">' + x.map(function (li) { return "<li>" + md(li) + "</li>"; }).join("") + "</ul>" : "<p>" + md(x) + "</p>";
        }).join("") +
        ((r.see && r.see.length) || r.topic ? '<div class="chips"><span class="k">Siehe auch</span>' + (r.topic ? refChip(r.topic) : "") + (r.see || []).map(function (id) { return refChip("r:" + id); }).join("") + "</div>" : "") +
        "</div></details>";
    });
    h += '</div><p class="empty" id="rules-empty" hidden>Kein Eintrag passt. Anderer Begriff?</p>';
    return h;
  }
  function applyRuleFilter() {
    var q = norm(ruleFilter.trim());
    var any = false;
    document.querySelectorAll("#rules details.rule").forEach(function (el) {
      var r = ruleById[el.id.slice(2)];
      var ok = ruleMatches(r, q);
      el.hidden = !ok; if (ok) any = true;
      if (q && ok && q.length > 2) el.open = true;
    });
    document.querySelectorAll("#rules .letter-h").forEach(function (hd) {
      var l = hd.getAttribute("data-letter");
      hd.hidden = !document.querySelector('#rules details.rule[data-letter="' + l + '"]:not([hidden])');
    });
    var e = document.getElementById("rules-empty"); if (e) e.hidden = any;
  }

  /* ---------- Suche ---------- */
  var INDEX = null;
  function collect(o, out) {
    if (typeof o === "string") out.push(o);
    else if (Array.isArray(o)) o.forEach(function (x) { collect(x, out); });
    else if (o && typeof o === "object") Object.keys(o).forEach(function (k) { if (k !== "icon" && k !== "check" && k !== "id" && k !== "kind" && k !== "darf" && k !== "at") collect(o[k], out); });
    return out;
  }
  function buildIndex() {
    INDEX = [];
    PH.forEach(function (ph, p) {
      ph.steps.forEach(function (s, i) {
        INDEX.push({ ty: "Ablauf · " + ph.name, t: s.t, txt: [s.b, s.say || "", s.warn || ""].join(" "), act: "jump", p: p, s: i, w: 3 });
      });
    });
    TOPICS.forEach(function (t) {
      INDEX.push({ ty: "Thema", t: t.name, txt: t.desc + " " + collect(t.blocks, []).join(" "), href: "#t-" + t.id, w: 2 });
      t.blocks.forEach(function (b) {
        if (b.qa) b.qa.forEach(function (x) { INDEX.push({ ty: "Wann darf ich…?", t: x.q, txt: x.a, href: "#t-" + t.id, w: 4 }); });
      });
    });
    D.rules.forEach(function (r) {
      INDEX.push({ ty: "Regel Nr. " + r.nr, t: r.t, txt: [r.en, r.k || "", collect(r.x, []).join(" ")].join(" "), href: "#r-" + r.id, w: 3 });
    });
    DARF.sets.forEach(function (set) {
      darfChecks(set).forEach(function (c) {
        INDEX.push({ ty: "Darf ich das? · " + set.name, t: c.name, txt: [c.label.replace(/­/g, ""), c.step, collect(c.qs, []).join(" "), collect(c.ok || {}, []).join(" ")].join(" "),
          darf: set.id, id: c.id, href: darfHref(set.id), w: 4 });
      });
    });
    EXT.forEach(function (x) { if (x.index) x.index(function (e) { INDEX.push(e); }, collect); });
    INDEX.forEach(function (e) { e.nt = norm(e.t); e.nx = norm(e.txt); });
  }
  function snippet(text, words) {
    var p = plain(text), n = norm(p), pos = -1;
    for (var i = 0; i < words.length && pos < 0; i++) pos = n.indexOf(words[i]);
    if (pos < 0) return esc(p.slice(0, 120)) + (p.length > 120 ? " …" : "");
    var a = Math.max(0, pos - 50), b = Math.min(p.length, pos + 90);
    var s = (a > 0 ? "… " : "") + esc(p.slice(a, b)) + (b < p.length ? " …" : "");
    return s;
  }
  function highlight(html, words) {
    words.filter(function (w) { return w.length > 1; }).forEach(function (w) {
      var re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      html = html.replace(re, "<mark>$1</mark>");
    });
    return html;
  }
  function searchResults(q) {
    if (!INDEX) buildIndex();
    var words = norm(q.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    var res = [];
    INDEX.forEach(function (e) {
      var score = 0, all = true;
      words.forEach(function (w) {
        var inT = e.nt.indexOf(w) > -1, inX = e.nx.indexOf(w) > -1;
        if (!inT && !inX) all = false;
        score += (inT ? 10 : 0) + (inX ? 2 : 0);
      });
      if (all) res.push({ e: e, sc: score * e.w + (e.nt.indexOf(words[0]) === 0 ? 15 : 0) });
    });
    res.sort(function (a, b) { return b.sc - a.sc; });
    return { words: words, list: res.slice(0, 40) };
  }
  function renderResults() {
    var box = document.getElementById("results"); if (!box) return;
    var r = searchResults(searchQ);
    if (!r) {
      box.innerHTML = '<p class="section-k">Häufig gesucht</p><div class="chips">' +
        ["Rückzug", "Sabotage", "passen", "Transaktion", "Flottenpool", "Erkundung", "Hütermarker", "Weltraumkanone", "Nachtrag", "Held", "Wurmloch", "Flaggschiff"].map(function (w) {
          return '<button type="button" class="chip" data-act="suggest" data-q="' + esc(w) + '">' + esc(w) + "</button>";
        }).join("") + "</div>";
      return;
    }
    if (!r.list.length) { box.innerHTML = '<p class="empty">Nichts gefunden für „' + esc(searchQ.trim()) + "“. Tipp: Umlaute gehen auch als ae, oe, ue, englische Begriffe funktionieren auch.</p>"; return; }
    box.innerHTML = '<p class="section-k">' + r.list.length + (r.list.length === 40 ? "+" : "") + " Treffer</p>" + r.list.map(function (x) {
      var e = x.e;
      var attrs = e.act ? 'href="#ablauf" data-act="jump" data-p="' + e.p + '" data-s="' + e.s + '"' :
        e.darf ? 'href="' + e.href + '" data-act="darf-open" data-set="' + e.darf + '" data-id="' + e.id + '"' : 'href="' + e.href + '"';
      return '<a class="res" ' + attrs + '><span class="ty">' + esc(e.ty) + '</span><span class="tt">' + highlight(esc(plain(e.t)), r.words) + '</span><span class="sn">' + highlight(snippet(e.txt, r.words), r.words) + "</span></a>";
    }).join("");
  }
  function viewSuche() {
    return "<h1>Suche</h1>" +
      '<label class="field" for="q">' + svg("search", 20) + '<span class="sr">Suchbegriff</span><input id="q" type="search" placeholder="Regeln, Fraktionen, Karten durchsuchen" autocomplete="off" value="' + esc(searchQ) + '"></label>' +
      '<div class="results" id="results"></div>';
  }

  function viewCredits() {
    return '<a class="back" href="#nachschlagen">' + svg("back", 18) + "Nachschlagen</a><h1>Über diese Seite</h1>" +
      '<div class="card credits"><h3>Als App aufs Handy</h3>' +
      "<ul><li><b>iPhone, iPad:</b> Seite in Safari öffnen, Teilen-Symbol, „Zum Home-Bildschirm“.</li>" +
      "<li><b>Android:</b> Seite in Chrome öffnen, Menü mit den drei Punkten, „App installieren“ oder „Zum Startbildschirm hinzufügen“.</li></ul>" +
      "<p>Danach startet der Leitfaden wie eine App im Vollbild und funktioniert nach dem ersten Öffnen auch offline.</p></div>" +
      '<div class="card credits"><h3>Inoffizielles Fan-Hilfsmittel</h3>' +
      "<p>Ein Host-Leitfaden für Partien von Twilight Imperium: Vierte Edition mit der Erweiterung Prophezeiung der Könige. Er führt durch die Spielrunde und fasst die Regeln zum Nachschlagen zusammen.</p>" +
      "<p>Alle Texte sind eigene Zusammenfassungen, kein Abdruck des offiziellen Regelhefts. Bei Abweichungen gelten immer der Kartentext und die offizielle Living Rules Reference.</p></div>" +
      '<div class="card credits"><h3>Rechte</h3>' +
      "<p>Twilight Imperium und Prophezeiung der Könige sind Marken von Fantasy Flight Games. Die deutsche Ausgabe erscheint bei Asmodee. Diese Seite steht in keiner Verbindung zu Fantasy Flight Games oder Asmodee und wird von ihnen weder unterstützt noch geprüft.</p></div>" +
      '<div class="card credits"><h3>Quellen</h3><ul>' +
      "<li>Living Rules Reference 2.0 (deutsch, Stand 25.01.2021) inklusive Errata und FAQ. Die „Nr.“ in der Regelreferenz verweist auf deren Absätze.</li>" +
      '<li>Offizielle Regeln und Errata als Download auf den Produktseiten von <a href="https://www.fantasyflightgames.com/en/products/twilight-imperium-fourth-edition/" target="_blank" rel="noopener">Fantasy Flight Games</a> und <a href="https://www.asmodee.de" target="_blank" rel="noopener">Asmodee</a>.</li>' +
      '<li>Zum Gegenlesen: <a href="https://www.tirules.com" target="_blank" rel="noopener">tirules.com</a> (englische Rules Reference mit Klarstellungen) und das <a href="https://twilight-imperium.fandom.com" target="_blank" rel="noopener">Twilight Imperium Wiki</a>.</li>' +
      '<li>Werte von Systemtafeln, Fraktionen und Karten: Daten des Discord-Bots <a href="https://github.com/AsyncTI4/TI4_map_generator_bot" target="_blank" rel="noopener">AsyncTI4</a> (gemeinfrei, Unlicense) und des Kartengenerators <a href="https://github.com/KeeganW/ti4" target="_blank" rel="noopener">KeeganW/ti4</a>, gegeneinander abgeglichen. Positionen der Spielplan-Zusammensetzungen nach Seite 6 der Living Rules Reference.</li></ul></div>' +
      '<div class="card credits"><h3>Bilder und Kartentexte</h3>' +
      '<p>Deutsche Originalabbildungen von Karten und Bögen stammen aus den öffentlich angebotenen Asmodee-Downloads. Fehlende deutsche Bögen werden mit englischen Originalabbildungen über den Community-Spiegel TI4 Ultimate ergänzt. Deutsche Originale werden bevorzugt; Erläuterungen bleiben deutsch. Jede Abbildung nennt Sprache, Edition und Quelle. Die Rechte bleiben bei Fantasy Flight Games und Asmodee. <a href="#originalmaterial">Material und Quellen ansehen</a>.</p>' +
      "<p>Fehlende Originalbilder sind als eigene Referenzhilfen mit sinngemäßen Texten dargestellt. Eigene Namensübersetzungen sind gekennzeichnet. Eine vollständige Wort-für-Wort-Prüfung aller deutschen Boxkarten ist ohne deren Originale nicht möglich. Systemtafeln im Kartengenerator sind weiterhin selbst gezeichnet.</p></div>" +
      '<div class="card credits"><h3>Gemacht von</h3>' +
      '<p>Zusammengestellt von Rafael Till (<a href="https://github.com/rafiistcool" target="_blank" rel="noopener">@rafiistcool</a>) mit Unterstützung von Claude (Anthropic).</p>' +
      "<p>Schriften: Saira Condensed, Source Sans 3 und IBM Plex Mono (SIL Open Font License). In der installierten App werden sie mitgeliefert, damit alles offline funktioniert.</p>" +
      "<p>Fortschritt, Runde und abgehakte Punkte werden nur lokal in diesem Browser gespeichert.</p></div>";
  }

  /* ---------- Rahmen: Kopf, Seitenleiste, Dock ---------- */
  function currentTab() {
    if (route.v === "ablauf") return "ablauf";
    if (route.tab) return route.tab;
    if (route.v === "suche") return "suche";
    return "nachschlagen";
  }
  function phaseShort() { return PH[st.p].short + " · " + (st.s + 1) + "/" + PH[st.p].steps.length; }

  function renderTop() {
    var el = document.getElementById("top");
    var custBtn = '<button type="button" class="cust" data-act="cust" aria-pressed="' + (st.cust ? "true" : "false") + '" title="Hütermarker auf Mecatol Rex"><i></i>' + (st.cust ? "Hüter entfernt" : "Hüter liegt") + "</button>";
    if (route.v === "ablauf") {
      el.innerHTML = '<div class="top-row"><div class="round-ctl"><button type="button" data-act="round-" aria-label="Runde zurück">−</button><span>Runde ' + st.round +
        '</span><button type="button" data-act="round+" aria-label="Nächste Runde">+</button></div><span class="crumb">› ' + esc(PH[st.p].name) + "</span>" +
        '<span class="spacer"></span>' + custBtn +
        '<a class="icon-btn desk-only" href="#suche" aria-label="Suche">' + svg("search", 20) + "</a></div>" +
        '<div class="phasebar" role="group" aria-label="Phasen">' + PH.map(function (ph, i) {
          var cls = i < st.p ? "done" : (i === st.p ? "cur" : "");
          if (locked(i)) cls += " locked";
          return '<button type="button" class="' + cls + '" data-act="phase" data-i="' + i + '"' + (locked(i) ? ' aria-disabled="true" title="Erst nach Entfernen des Hütermarkers"' : "") +
            '><span class="bar"></span><span class="lbl">' + esc(ph.short) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="dots"><span class="ph">' + esc(PH[st.p].name) + '</span><div class="row" role="group" aria-label="Schritte">' +
        PH[st.p].steps.map(function (s, j) {
          return '<button type="button" class="' + (j < st.s ? "done" : (j === st.s ? "cur" : "")) + '" data-act="step" data-p="' + st.p + '" data-s="' + j + '" aria-label="Schritt ' + (j + 1) + ": " + esc(s.t) + '"><span></span></button>';
        }).join("") + "</div></div>";
    } else {
      var title = route.title || (route.tab === "kampf" ? "Im Kampf" : null) || ({ topic: "Nachschlagen", nachschlagen: "Nachschlagen", regeln: "Nachschlagen", suche: "Suche", credits: "Nachschlagen" })[route.v];
      el.innerHTML = '<div class="top-row"><span class="top-title">' + esc(title) + '</span><span class="spacer"></span>' +
        '<a class="pill" href="#ablauf">‹ Ablauf <b>' + esc(phaseShort()) + "</b></a></div>";
    }
  }

  /* Seitenleiste: Suche oben, dann drei feste Gruppen. Phasen und Schritte klappen nur im Ablauf auf. */
  function renderRail() {
    var el = document.getElementById("rail");
    var tab = currentTab(), onAblauf = route.v === "ablauf";
    var themen = route.v === "nachschlagen" || (route.v === "topic" && route.tab !== "kampf");
    el.innerHTML = '<div class="brand"><b>TI4 Host</b><span>Prophezeiung der Könige</span></div>' +
      '<a class="rail-search' + (tab === "suche" ? " cur" : "") + '" href="#suche">' + svg("search", 18) + '<span>Suchen</span><kbd title="Taste /">/</kbd></a>' +
      '<nav class="rail-nav" aria-label="Bereiche">' +
      '<p class="rail-h">Am Tisch</p>' +
      railLink("#ablauf", "ablauf", "Ablauf", onAblauf, "Runde " + st.round + " · " + phaseShort()) +
      (onAblauf ? railPhases() : "") +
      railLink("#kampf", "kampf", "Kampf", tab === "kampf") +
      '<p class="rail-h">Spielrunde</p>' +
      railLink("#hub", "hub", "Hub", route.rail === "hub", "Sessions, Fraktionen, Historie") +
      '<p class="rail-h">Vorbereitung</p>' +
      railLink("#aufbau", "aufbau", "Aufbau", route.rail === "aufbau") +
      railLink("#generator", "map", "Kartengenerator", route.rail === "generator") +
      '<p class="rail-h">Nachschlagen</p>' +
      railLink("#nachschlagen", "book", "Themen", themen) +
      railLink("#regeln", "az", "Regeln A–Z", route.v === "regeln") +
      railLink("#fraktionen", "faction", "Fraktionen", route.rail === "fraktionen") +
      railLink("#technologien", "tech", "Technologien", route.rail === "technologien") +
      railLink("#karten", "cards", "Karten", route.rail === "karten") +
      railLink("#originalmaterial", "cards", "Originalmaterial", route.rail === "originalmaterial") +
      "</nav>" +
      '<a class="rail-foot' + (route.v === "credits" ? " cur" : "") + '" href="#credits">' + svg("info", 16) + "Über und Credits</a>";
  }
  function railPhases() {
    return '<div class="rail-sub">' +
      '<div class="rail-phases" role="group" aria-label="Phasen">' + PH.map(function (p, i) {
        var cls = i < st.p ? "done" : (i === st.p ? "cur" : "");
        if (locked(i)) cls += " locked";
        return '<button type="button" class="' + cls + '" data-act="phase" data-i="' + i + '"' + (locked(i) ? ' aria-disabled="true" title="Erst nach Entfernen des Hütermarkers"' : "") +
          '><span class="bar"></span><span class="lbl">' + esc(p.short) + "</span></button>";
      }).join("") + "</div></div>";
  }
  function railLink(href, icon, label, cur, sub) {
    return '<a href="' + href + '"' + (cur ? ' aria-current="page"' : "") + ">" + svg(icon, 20) +
      '<span class="tx"><span>' + label + "</span>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></a>";
  }

  function renderDock() {
    var bar = document.getElementById("actionbar");
    if (route.v !== "ablauf") { bar.hidden = true; bar.innerHTML = ""; return; }
    bar.hidden = false;
    var ph = PH[st.p];
    var isLoop = ph.loop && st.s === ph.steps.length - 1;
    bar.innerHTML = '<div class="segs" role="group" aria-label="Schritte dieser Phase">' + ph.steps.map(function (s, j) {
      return '<button type="button" class="' + (j < st.s ? "done" : (j === st.s ? "cur" : "")) + '" data-act="step" data-p="' + st.p + '" data-s="' + j + '" aria-label="Schritt ' + (j + 1) + ": " + esc(s.t) + '"><span></span></button>';
    }).join("") + "</div>" +
      '<div class="actions"><button type="button" class="btn sq" data-act="prev" aria-label="Zurück"' + (st.p === 0 && st.s === 0 ? " disabled" : "") + ">‹</button>" +
      (isLoop ? '<button type="button" class="btn" data-act="next-turn">↺ Nächster Zug</button>' : "") +
      '<button type="button" class="btn primary" data-act="next"><span class="txt">' + esc(nextLabel()) + '</span><span class="arr">›</span></button></div>';
  }

  function renderTabbar() {
    var tab = currentTab();
    var items = [["#ablauf", "ablauf", "Ablauf", "ablauf"], ["#kampf", "kampf", "Kampf", "kampf"], ["#aufbau", "aufbau", "Aufbau", "aufbau"], ["#nachschlagen", "book", "Nachschlagen", "nachschlagen"], ["#hub", "hub", "Hub", "hub"], ["#suche", "search", "Suche", "suche"]];
    document.getElementById("tabbar").innerHTML = items.map(function (it) {
      return '<a href="' + it[0] + '"' + (tab === it[3] ? ' aria-current="page"' : "") + ">" + svg(it[1], 22) + "<span>" + it[2] + "</span></a>";
    }).join("");
  }

  function renderView() {
    var v = document.getElementById("view");
    if (route.v === "ablauf") v.innerHTML = viewAblauf();
    else if (route.v === "nachschlagen") v.innerHTML = viewHub();
    else if (route.v === "topic") v.innerHTML = viewTopic(route.id);
    else if (route.v === "regeln") { v.innerHTML = viewRegeln(); applyRuleFilter(); }
    else if (route.v === "suche") { v.innerHTML = viewSuche(); renderResults(); }
    else if (route.v === "credits") v.innerHTML = viewCredits();
    else if (route.v === "ext") v.innerHTML = route.x.render(route);
  }

  function render(scroll) {
    document.body.classList.toggle("is-wide", route.v === "ext" && !!route.wide);
    renderRail(); renderTop(); renderView(); renderDock(); renderTabbar();
    var topH = document.getElementById("top").offsetHeight;
    document.documentElement.style.setProperty("--top-h", topH + "px");
    if (route.v === "ext" && route.x.after) route.x.after(route);
    if (pendingReveal) {
      var pe = document.getElementById(pendingReveal);
      pendingReveal = null;
      if (pe) {
        window.scrollTo(0, Math.max(0, pe.getBoundingClientRect().top + window.scrollY - topH - 12));
        var pf = document.getElementById(pe.id + "-focus");
        if (pf) { try { pf.focus({ preventScroll: true }); } catch (e) { pf.focus(); } reveal(pf); }
        return;
      }
    }
    if (scroll) {
      var fid = route.v === "regeln" && route.focus ? "r-" + route.focus : (route.v === "ext" && route.focusEl);
      if (fid) {
        var el = document.getElementById(fid);
        if (el) { var y = el.getBoundingClientRect().top + window.scrollY - topH - 60; window.scrollTo(0, Math.max(0, y)); return; }
      }
      window.scrollTo(0, 0);
    }
  }
  function rerenderAblauf() { render(false); window.scrollTo(0, 0); }

  /* ---------- Ereignisse ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t) return;
    var a = t.getAttribute("data-act");
    for (var x = 0; x < EXT.length; x++) if (EXT[x].click && EXT[x].click(a, t, ev)) return;
    if (a === "darf-pick") {
      var ds = t.getAttribute("data-set"), did = t.getAttribute("data-id"), dst = darfState(ds);
      if (dst.id === did) { darfSt[ds] = { id: null, a: [] }; darfRefresh(ds, '#darf-' + ds + ' [data-id="' + did + '"]'); }
      else { darfSt[ds] = { id: did, a: [] }; darfRefresh(ds); }
    }
    else if (a === "darf-ans") { var ds2 = t.getAttribute("data-set"); darfState(ds2).a.push(t.getAttribute("data-v") === "ja" ? "ja" : "nein"); darfRefresh(ds2); }
    else if (a === "darf-back") { var ds3 = t.getAttribute("data-set"), st3 = darfState(ds3); st3.a = st3.a.slice(0, +t.getAttribute("data-i")); darfRefresh(ds3); }
    else if (a === "darf-reset") { var ds4 = t.getAttribute("data-set"); darfState(ds4).a = []; darfRefresh(ds4); }
    else if (a === "darf-goto" || a === "darf-open") { ev.preventDefault(); darfOpen(t.getAttribute("data-set"), a === "darf-open" ? t.getAttribute("data-id") : null); }
    else if (a === "next") { goNext(); rerenderAblauf(); }
    else if (a === "prev") { goPrev(); rerenderAblauf(); }
    else if (a === "next-turn") { setPos(1, 0); darfSt = {}; rerenderAblauf(); }
    else if (a === "phase") { var i = +t.getAttribute("data-i"); if (locked(i)) return; setPos(i, 0); if (route.v !== "ablauf") go("ablauf"); else rerenderAblauf(); }
    else if (a === "step") { setPos(+t.getAttribute("data-p"), +t.getAttribute("data-s")); if (route.v !== "ablauf") go("ablauf"); else rerenderAblauf(); }
    else if (a === "jump") { ev.preventDefault(); setPos(+t.getAttribute("data-p"), +t.getAttribute("data-s")); go("ablauf"); }
    else if (a === "round+") { st.round += 1; setPos(0, 0); clearChecks(["raumkampf", "einmarsch", "taktik", "handel"]); darfSt = {}; rerenderAblauf(); }
    else if (a === "round-") { if (st.round > 1) { st.round -= 1; persist(); render(false); } }
    else if (a === "cust") {
      st.cust = !st.cust;
      if (!st.cust && st.p === 3) { st.p = 2; st.s = PH[2].steps.length - 1; }
      persist(); render(false);
    }
    else if (a === "reset-list") { clearChecks([t.getAttribute("data-list")]); render(false); }
    else if (a === "letter") {
      ev.preventDefault();
      var hd = document.getElementById("L-" + t.getAttribute("data-l"));
      if (hd) window.scrollTo(0, hd.getBoundingClientRect().top + window.scrollY - document.getElementById("top").offsetHeight - 56);
    }
    else if (a === "suggest") { searchQ = t.getAttribute("data-q"); var q = document.getElementById("q"); if (q) q.value = searchQ; renderResults(); }
    else if (a === "new-game") {
      if (!resetArmed) {
        resetArmed = true; render(false);
        clearTimeout(resetTimer); resetTimer = setTimeout(function () { resetArmed = false; if (route.v === "nachschlagen") render(false); }, 5000);
      } else {
        resetArmed = false; clearTimeout(resetTimer);
        st = Object.assign({}, DEFAULT); persist(); checks = {}; save("ti4.v2.checks", checks); darfSt = {};
        go("ablauf");
      }
    }
  });
  document.addEventListener("change", function (ev) {
    for (var x = 0; x < EXT.length; x++) if (EXT[x].change && EXT[x].change(ev)) return;
    var id = ev.target.getAttribute && ev.target.getAttribute("data-chk");
    if (!id) return;
    if (ev.target.checked) checks[id] = true; else delete checks[id];
    save("ti4.v2.checks", checks);
  });
  document.addEventListener("input", function (ev) {
    if (ev.target.id === "q") { searchQ = ev.target.value; renderResults(); }
    if (ev.target.id === "rf") { ruleFilter = ev.target.value; applyRuleFilter(); }
    for (var x = 0; x < EXT.length; x++) if (EXT[x].input && EXT[x].input(ev)) return;
  });
  document.addEventListener("submit", function (ev) {
    var f = ev.target.getAttribute("data-form");
    if (f === "hub-search") {
      ev.preventDefault();
      searchQ = document.getElementById("hub-q").value || "";
      go("suche");
      setTimeout(function () { var q = document.getElementById("q"); if (q) q.focus(); }, 30);
    }
  });
  document.addEventListener("keydown", function (ev) {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute && ev.target.getAttribute("data-act") === "hex") { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); return; }
    var tg = (ev.target.tagName || "").toLowerCase();
    if (ev.key === "/" && tg !== "input" && tg !== "textarea" && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault();
      if (route.v !== "suche") go("suche");
      setTimeout(function () { var q = document.getElementById("q"); if (q) q.focus(); }, 30);
      return;
    }
    if (route.v !== "ablauf" || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var tag = (ev.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (ev.key === "ArrowRight") { goNext(); rerenderAblauf(); }
    if (ev.key === "ArrowLeft") { goPrev(); rerenderAblauf(); }
  });

  render(true);
})();
