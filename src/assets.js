/* Component images, provenance, library and accessible enlargement. */
(function () {
  "use strict";
  var D = window.TI4, O = D.originalAssets, R = D.referenceAssets || {};
  /*ARTIFACT_PORTRAITS*/
  var byId = {}, byKey = {};
  O.items.forEach(function (a) {
    byId[a.id] = a;
    if (a.key && (!byKey[a.key] || (a.language === "de" && byKey[a.key].language !== "de"))) byKey[a.key] = a;
  });
  Object.keys(R).forEach(function (key) { if (!byId["help-" + key]) byId["help-" + key] = Object.assign({ id: "help-" + key }, R[key]); });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function get(key) { return byKey[key] || byId["help-" + key] || byId[key]; }
  function label(a) { return a.status === "original" ? (a.language === "en" ? "Englisches Original" : "Deutsches Original") : "Deutsche Referenzhilfe"; }
  function sourceUrl(a) { return a.sourceUrl || O.sources[a.source].url + (a.page ? "#page=" + a.page : ""); }
  function sourceLabel(a) { return a.page ? "Original-PDF · Seite " + a.page : "Originalbild · Community-Spiegel"; }
  function caption(a) {
    return a.status === "original" ? a.edition + (a.page ? " · PDF-Seite " + a.page : " · TI4 Ultimate") : "Eigene Darstellung · Text sinngemäß" + (a.nameStatus === "own-translation" ? " · Name selbst übersetzt" : "");
  }
  function figure(key, cls) {
    var a = get(key); if (!a) return "";
    return '<figure class="asset-figure ' + (cls || "") + '"><button type="button" class="asset-open" data-act="asset-open" data-asset="' + esc(a.id) + '" aria-label="' + esc(a.title + " vergrößern") + '">' +
      '<img src="' + esc(a.src) + '" alt="' + esc(a.title + ". " + label(a)) + '" loading="lazy" decoding="async"' + (a.width ? ' width="' + a.width + '" height="' + a.height + '"' : "") + '><span class="asset-zoom">Vergrößern</span></button>' +
      '<figcaption><span class="asset-status ' + (a.status === "original" ? "is-original" : "is-reference") + '">' + label(a) + '</span><span>' + esc(caption(a)) + "</span></figcaption></figure>";
  }
  D.AssetUI = { figure: figure, get: get, alternatives: function (key) {
    var selected = get(key), extra = O.items.filter(function (a) { return a.key === key && a !== selected; });
    var h = extra.length ? '<details class="asset-related"><summary>Weitere Originalfassung: Englisch in hoher Auflösung</summary>' + extra.map(function (a) { return figure(a.id, "sheet-image"); }).join("") + '</details>' : "";
    if (selected && selected.language === "en" && R[key]) h += '<details class="asset-related"><summary>Deutsche Referenzgrafik ansehen</summary>' + figure("help-" + key, "sheet-image") + '</details>';
    return h;
  }, related: function (key) {
    var list = O.items.filter(function (a) { return a.relatedKey === key; });
    return list.length ? '<details class="asset-related"><summary>Deutsches Original der optionalen Ω-Fassung</summary>' + list.map(function (a) { return figure(a.id, "card-image"); }).join("") + '</details>' : "";
  }, factionExtras: function (fid) {
    return O.items.filter(function (a) { return a.faction === fid && !a.key; }).map(function (a) { return '<div><h3>' + esc(a.title) + '</h3>' + figure(a.id, "card-image") + (a.note ? '<p class="fine">' + esc(a.note) + '</p>' : "") + '</div>'; }).join("");
  }, portrait: function (fid, name) {
    return byId["ref-" + fid] ? '<img class="f-portrait" src="' + esc(D.artifactPortraits ? D.artifactPortraits[fid] : "assets/original/" + fid + "-portrait.webp") + '" alt="' + esc(name) + ' · Originalillustration" width="64" height="72" loading="lazy">' : "";
  }};

  var query = "", kind = "alle", language = "alle", dialog = null, trigger = null;
  function render() {
    var de = O.items.filter(function (a) { return a.language === "de"; }).length, en = O.items.filter(function (a) { return a.language === "en"; }).length;
    var h = '<a class="back" href="#nachschlagen">‹ Nachschlagen</a><h1>Originalmaterial</h1><p class="lead">' + de + ' deutsche Originalabbildungen aus den Asmodee-Downloads und ' + en + ' englische Fraktionsbögen über TI4 Ultimate. Antippen zum Lesen und Vergrößern.</p>' +
      '<div class="asset-notice"><b>Grundspiel + Prophezeiung der Könige</b><p>Deutsche Originale werden bevorzugt. Wo deutsche Bögen fehlen, stehen englische Originale mit deutscher Textfassung bereit. Die 24 deutschen Codex-II-Kurzreferenzen bleiben zusätzlich verfügbar.</p><p>Errata gehören zur korrigierten Spielfassung. Codex-Zusätze und Ω-Fassungen sind als optional beschriftet. Eigene Referenzhilfen enthalten sinngemäße Texte.</p></div>' +
      '<div class="asset-controls"><label class="field" for="asset-q"><span class="sr">Originalmaterial durchsuchen</span><input id="asset-q" type="search" placeholder="Filtern, z. B. Sol, Diplomatie, Codex" value="' + esc(query) + '"></label>' +
      '<label class="asset-select">Materialart <select id="asset-kind" aria-label="Materialart"><option value="alle">Alle Arten</option>' + Array.from(new Set(O.items.map(function (a) { return a.kind; }))).sort().map(function (k) { return '<option' + (k === kind ? " selected" : "") + '>' + esc(k) + "</option>"; }).join("") + '</select></label>' +
      '<label class="asset-select">Sprache <select id="asset-language" aria-label="Sprache"><option value="alle">Alle Sprachen</option><option value="de"' + (language === "de" ? " selected" : "") + '>Deutsch</option><option value="en"' + (language === "en" ? " selected" : "") + '>Englisch</option></select></label></div><p class="fine" id="asset-count" role="status"></p><div class="asset-library">' +
      O.items.map(function (a) {
        return '<article class="asset-entry" data-asset-kind="' + esc(a.kind) + '" data-asset-language="' + esc(a.language) + '" data-asset-search="' + esc(D.UI.norm([a.title,a.kind,a.edition,a.note,a.language === "en" ? "Englisch" : "Deutsch"].join(" "))) + '"><h2>' + esc(a.title) + '</h2><p class="kind">' + esc(a.kind) + "</p>" + figure(a.id) + (a.note ? '<p class="fine">' + esc(a.note) + "</p>" : "") + '<a class="asset-source" href="' + esc(sourceUrl(a)) + '" target="_blank" rel="noopener">' + esc(sourceLabel(a)) + ' ↗</a></article>';
      }).join("") + '</div><p class="empty" id="asset-empty" hidden>Kein Original passt zu diesem Filter.</p><section class="card"><h2>Quellen und Prüfung</h2><p>Deutsch bevorzugt · TI4, PoK, Codex I–III · Quellenprüfung vom 13.10.2026. Deutsche Originalbilder wurden aus den Verlagspdfs ausgeschnitten. Englische Bögen stammen aus dem Community-Spiegel TI4 Ultimate und wurden unverändert übernommen.</p><p>Die deutschen Referenzhilfen sind gekürzte Zusammenfassungen. Eine vollständige Wort-für-Wort-Prüfung aller deutschen Boxkarten ist ohne deren Originale nicht möglich.</p><ul>' +
      Object.keys(O.sources).map(function (s) { return '<li><a href="' + esc(O.sources[s].url) + '" target="_blank" rel="noopener">' + esc(O.sources[s].title) + '</a></li>'; }).join("") + '</ul><p class="fine">' + esc(O.rights) + '</p></section>';
    return h;
  }
  function filter() {
    var words = D.UI.norm(query).split(/\s+/).filter(Boolean), count = 0;
    document.querySelectorAll(".asset-entry").forEach(function (el) {
      var visible = (kind === "alle" || el.getAttribute("data-asset-kind") === kind) && (language === "alle" || el.getAttribute("data-asset-language") === language) && words.every(function (w) { return el.getAttribute("data-asset-search").indexOf(w) !== -1; });
      el.hidden = !visible; if (visible) count++;
    });
    var c = document.getElementById("asset-count"), e = document.getElementById("asset-empty");
    if (c) c.textContent = count + " von " + O.items.length + " Originalabbildungen";
    if (e) e.hidden = count > 0;
  }
  function open(id, button) {
    var a = byId[id]; if (!a) return;
    if (!dialog) {
      dialog = document.createElement("dialog"); dialog.className = "asset-dialog"; dialog.setAttribute("aria-labelledby", "asset-dialog-title");
      document.body.appendChild(dialog);
      dialog.addEventListener("click", function (ev) { if (ev.target === dialog) dialog.close(); });
      dialog.addEventListener("close", function () { if (trigger && trigger.isConnected) trigger.focus(); });
    }
    trigger = button;
    var source = a.status === "original" ? O.sources[a.source] : null;
    dialog.classList.remove("is-zoomed");
    dialog.innerHTML = '<div class="asset-dialog-head"><div><h2 id="asset-dialog-title">' + esc(a.title) + '</h2><p>' + esc(label(a) + " · " + caption(a)) + '</p></div><button type="button" class="btn" data-act="asset-zoom" aria-pressed="false">Details vergrößern</button><button type="button" class="btn" data-act="asset-close" autofocus>Schließen</button></div>' +
      '<div class="asset-dialog-image"><img src="' + esc(a.src) + '" alt="' + esc(a.title) + '"></div><div class="asset-dialog-foot">' +
      (a.note ? '<p>' + esc(a.note) + '</p>' : "") + (source ? '<p><a href="' + esc(sourceUrl(a)) + '" target="_blank" rel="noopener">' + esc(sourceLabel(a)) + ' ↗</a></p><p class="fine">© Fantasy Flight Games / Asmodee</p>' : '<p>Eigene Referenzgrafik mit gekürztem Text. Bei Abweichungen gelten die echte Karte und die offiziellen Regeln.</p>') +
      '<a href="' + esc(a.src) + '" download>Bild herunterladen</a></div>';
    dialog.showModal();
  }
  D.ext = D.ext || [];
  D.ext.push({
    parse: function (h) { return h === "originalmaterial" ? { tab: "nachschlagen", rail: "originalmaterial", title: "Originalmaterial", page: "assets" } : null; },
    render: render,
    after: filter,
    click: function (a,t) {
      if (a === "asset-open") { open(t.getAttribute("data-asset"),t); return true; }
      if (a === "asset-close") { if (dialog) dialog.close(); return true; }
      if (a === "asset-zoom") { var zoomed = dialog.classList.toggle("is-zoomed"); t.setAttribute("aria-pressed", String(zoomed)); t.textContent = zoomed ? "Ganzes Bild" : "Details vergrößern"; return true; }
      return false;
    },
    input: function (ev) { if (ev.target.id !== "asset-q") return false; query = ev.target.value; filter(); return true; },
    change: function (ev) {
      if (ev.target.id === "asset-kind") kind = ev.target.value;
      else if (ev.target.id === "asset-language") language = ev.target.value;
      else return false;
      filter(); return true;
    },
    index: function (push) { O.items.forEach(function (a) { push({ ty: "Original · " + a.kind, t: a.title, txt: a.edition + " " + (a.note || ""), href: "#originalmaterial", w: 1 }); }); }
  });
})();
