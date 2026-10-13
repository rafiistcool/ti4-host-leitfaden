#!/usr/bin/env node
/* Reproduzierbare deutsche Referenzgrafiken aus den Kompendium-Daten.
   Keine Originalscans, keine generierten Spielillustrationen, kein Originaltext. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { TI4: {} }; ctx.window = ctx;
vm.createContext(ctx);
for (const file of ['fraktionen', 'karten-1', 'karten-2', 'de-namen']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'src/data', file + '.js'), 'utf8'), ctx);
}
const D = ctx.TI4;
const out = path.join(root, 'src/assets/reference');
fs.mkdirSync(out, { recursive: true });
const manifest = {};
const generated = new Set();
const palette = {
  gruen: '#75b583', blau: '#68add7', gelb: '#e1c170', rot: '#db827b', einheit: '#abb3c1',
  action: '#dc8f78', agenda: '#7cacd0', objective: '#e3bd72', secret: '#d98276',
  relic: '#b39cda', kulturell: '#8cbbdb', gefährlich: '#d4967a', industriell: '#84ba9a',
  'wilder-raum': '#bab1d6', faction: '#d9b46e', leader: '#8ebbbc', unit: '#a7b4c6', promissory: '#c09cb2'
};
const source = { base: 'Grundspiel', pok: 'Prophezeiung der Könige', codex: 'Codex III · optional', codex1: 'Codex I · optional' };
const techKind = { gruen: 'Biotechnik', blau: 'Antriebstechnik', gelb: 'Kybernetik', rot: 'Kriegsführung', einheit: 'Einheiten-Aufwertung' };
const phase = { Status: 'Statusphase', Aktion: 'Aktionsphase', Agenda: 'Agendaphase' };
const clean = v => String(v ?? '').replace(/\*\*?|`/g, '').replace(/<[^>]*>/g, '').replace(/&shy;/g, '').replace(/\s+/g, ' ').trim();
const xml = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const name = o => o.de || o.en;
const nameLabel = o => o.nameStatus === 'own-translation' ? 'Name: eigene Übersetzung' : o.nameStatus === 'proper-name' ? 'Eigenname unverändert' : o.nameStatus === 'official-de' ? 'Deutscher Name belegt' : 'Deutscher Name aus Spieldaten';

// Conservative glyph estimates plus splitting of long tokens keep every line in bounds.
// All artwork uses generic sans-serif; no network font or external SVG resource is needed.
function measure(s, size) {
  let em = 0;
  for (const char of s) {
    if (/\s/.test(char)) em += .34;
    else if (/[ilI.,:;!|'’]/.test(char)) em += .36;
    else if (/[MWmw@]/.test(char)) em += .98;
    else if (/[A-ZÄÖÜ]/.test(char)) em += .8;
    else em += .7;
  }
  return em * size;
}
function wrap(value, width, size) {
  const words = clean(value).split(' ').filter(Boolean);
  const lines = []; let line = '';
  for (const word of words) {
    if (measure(word, size) > width) {
      if (line) { lines.push(line); line = ''; }
      let part = '';
      for (const char of word) {
        if (measure(part + char, size) > width) { lines.push(part); part = ''; }
        part += char;
      }
      line = part;
    } else if (line && measure(line + ' ' + word, size) > width) {
      lines.push(line); line = word;
    } else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}
function prerequisites(p) {
  if (p === undefined) return '';
  if (!p || p === '–') return 'Keine';
  if (!/^[GBYR]+$/.test(p)) return p;
  return [['G', 'Biotechnik'], ['B', 'Antriebstechnik'], ['Y', 'Kybernetik'], ['R', 'Kriegsführung']]
    .filter(([key]) => p.includes(key)).map(([key, label]) => p.split(key).length - 1 + '× ' + label).join(' · ');
}
function statText(o) {
  return [['Kosten', o.cost], ['Kampf', o.combat], ['Bewegung', o.move], ['Kapazität', o.capacity]]
    .filter(([, value]) => value !== undefined).map(([label, value]) => label + ' ' + value).join(' · ');
}
function sections(o) {
  const s = [];
  if (o.timing) s.push(['Wann', o.timing]);
  if (o.prereq !== undefined) s.push(['Voraussetzungen', prerequisites(o.prereq)]);
  if (o.points) s.push(['Wertung', o.points + (o.points === 1 ? ' Siegpunkt' : ' Siegpunkte') + (o.phase ? ' · ' + (phase[o.phase] || o.phase) : '')]);
  if (o.unit) {
    s.push(['Einheitenwerte', statText(o.unit)]);
    if (o.unit.abilities) s.push(['Einheitenfähigkeiten', o.unit.abilities]);
  } else if (statText(o)) s.push(['Einheitenwerte', statText(o)]);
  if (o.unlock) s.push(['Freischalten', o.unlock]);
  if (o.elect) s.push(['Wahl', o.elect]);
  if (o.text) s.push(['Kurzreferenz', o.text]);
  if (o.for) s.push([o.elect ? 'Ergebnis' : 'Dafür', o.for]);
  if (o.against) s.push(['Dagegen', o.against]);
  if (o.pokRemoved) s.push(['Mit PoK', 'Diese Agenda wird aus dem Stapel entfernt.']);
  if (o.codex) s.push(['Spätere Fassung · optional', o.codex]);
  return s.filter(([, value]) => value);
}

function svg(title, kind, accent, blocks, meta = {}, wide = false) {
  const width = wide ? 1120 : 680;
  const inset = wide ? 64 : 48;
  const bodyWidth = width - inset * 2;
  const runs = [];
  let y = 78;
  function text(value, size, color, weight = 400, gap = 0) {
    const lines = wrap(value, bodyWidth, size);
    for (const line of lines) {
      runs.push(`<text x="${inset}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${xml(line)}</text>`);
      y += Math.ceil(size * 1.35);
    }
    y += gap;
  }
  text(kind.toLocaleUpperCase('de'), 18, accent, 700, 26);
  text(title, wide ? 42 : 38, '#f6f3ea', 700, 10);
  text(meta.nameLabel || 'Eigene Referenzgestaltung', 17, '#b9c6d1', 400, 24);
  runs.push(`<path d="M${inset} ${y}H${width - inset}" stroke="${accent}" stroke-width="2"/>`);
  y += 36;
  for (const [label, value] of blocks) {
    text(label.toLocaleUpperCase('de'), 18, accent, 700, 9);
    text(value, wide ? 25 : 26, '#e5ebee', 400, 24);
  }
  y += 10;
  const footerStart = Math.max(y, wide ? 746 : 790);
  const foot = wrap(meta.edition || 'Grundspiel und Prophezeiung der Könige', bodyWidth, 17);
  const foot2 = wrap('Eigene Gestaltung · Kartentexte in eigenen Worten', bodyWidth, 17);
  const height = footerStart + 80 + (foot.length + foot2.length) * 23 + 28;
  runs.push(`<path d="M${inset} ${footerStart}H${width - inset}" stroke="#68798a" stroke-width="1"/>`);
  runs.push(`<text x="${inset}" y="${footerStart + 34}" font-size="18" font-weight="700" fill="${accent}">REFERENZHILFE · SINNGEMÄSS</text>`);
  let fy = footerStart + 65;
  for (const line of [...foot, ...foot2]) {
    runs.push(`<text x="${inset}" y="${fy}" font-size="17" fill="#b9c6d1">${xml(line)}</text>`); fy += 23;
  }
  return { width, height, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${xml(title)} — deutsche Referenzhilfe</title><desc id="desc">Eigene Vektorgestaltung. Sinngemäße Zusammenfassung aus den Kompendium-Daten, kein Originalscan.</desc><rect width="${width}" height="${height}" rx="24" fill="#111e2a"/><rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="18" fill="none" stroke="${accent}" stroke-width="2"/><path d="M${width - 90} 31h40m-24 9h24m-10 9h10" stroke="${accent}" stroke-width="3"/><g font-family="DejaVu Sans, Arial, sans-serif">${runs.join('')}</g></svg>\n` };
}
function emit(key, o, kind, color, extra = {}, blocks = sections(o), wide = false) {
  if (manifest[key]) throw new Error('Duplicate asset key: ' + key);
  const edition = source[o.src || extra.src || 'base'] || o.src;
  const rendered = svg(extra.title || name(o), kind, palette[color] || palette.faction, blocks, { edition, nameLabel: nameLabel(o) }, wide);
  const file = key + '.svg'; generated.add(file);
  fs.writeFileSync(path.join(out, file), rendered.svg);
  manifest[key] = {
    src: 'assets/reference/' + file,
    title: extra.title || name(o), kind, status: 'reference', textStatus: 'summary',
    nameStatus: o.nameStatus || 'existing-de', nameSource: o.nameSource || 'Spieldaten',
    edition, width: rendered.width, height: rendered.height,
    ...(extra.family ? { family: extra.family } : {})
  };
}

for (const t of D.techs) emit('tech-' + t.id, t, techKind[t.color] || 'Technologie', t.color);
for (const [array, prefix, kind, color] of [
  [D.actionCards, 'aktion', 'Aktionskarte', 'action'], [D.actionCardsCodex, 'aktion', 'Aktionskarte · Codex I', 'action'],
  [D.agendas, 'agenda', 'Agenda', 'agenda'], [D.objectives, 'auftrag', 'Auftrag', 'objective'],
  [D.relics, 'relikt', 'Relikt', 'relic'], [D.explore, 'erkundung', 'Erkundung', 'kulturell']
]) {
  for (const o of array) {
    const type = prefix === 'agenda' ? 'Agenda · ' + o.type : prefix === 'auftrag' ? (o.type === 'geheim' ? 'Geheimer Auftrag' : 'Öffentlicher Auftrag · Stufe ' + o.type) : prefix === 'erkundung' ? 'Erkundung · ' + (o.deck === 'wilder-raum' ? 'Wilder Raum' : o.deck) : kind;
    const tint = prefix === 'erkundung' ? o.deck : o.type === 'geheim' ? 'secret' : color;
    emit('c-' + prefix + '-' + o.id, o, type, tint, prefix === 'erkundung' ? { src: 'pok' } : {});
  }
}
for (const f of D.factions) {
  const family = f.id;
  const front = f.abilities.flatMap(a => [[name(a), a.text], ...(a.codex ? [['Spätere Fassung · ' + name(a), a.codex]] : [])]);
  front.push(['Flaggschiff · ' + name(f.flagship), statText(f.flagship)]);
  front.push(['Flaggschiff · Kurzreferenz', f.flagship.text]);
  if (f.flagship.codex) front.push(['Flaggschiff · spätere Fassung', f.flagship.codex]);
  front.push(['Massenprodukte', f.commodities]);
  emit('fs-' + f.id + '-front', f, 'Fraktionsbogen · Vorderseite', 'faction', { family }, front, true);
  manifest['fc-' + f.id] = { ...manifest['fs-' + f.id + '-front'] };
  const rear = [
    ['Heimat-System', f.home.map(p => p.name + ': ' + p.res + ' Ressourcen · ' + p.inf + ' Einfluss' + (p.via ? ' · ' + p.via : '')).join(' / ')],
    ['Starteinheiten', f.start.units],
    ['Starttechnologien', f.start.tech.length ? f.start.tech.join(' · ') : 'Keine'],
    ['Kommandomarker zum Spielbeginn', '3 im Taktikpool · 3 im Flottenpool · 2 im Strategiepool']
  ];
  if (f.gateTile) rear.push(['Tor von Creuss', 'Systemtafel ' + f.gateTile + ' liegt in der Galaxie. Das Heimat-System liegt neben dem Spielplan.']);
  if (f.id === 'keleres') rear.push(['Herkunft wählen', 'Heimat-System einer nicht gespielten Fraktion: Mentak, Xxcha oder Silberschwingen.']);
  emit('fs-' + f.id + '-back', f, 'Fraktionsbogen · Rückseite und Start', 'faction', { family }, rear, true);
  f.techs.forEach((t, index) => emit('ftech-' + f.id + '-' + index, t, 'Fraktionstechnologie · ' + (techKind[t.color] || 'Technologie'), t.color, { family, src: f.src }));
  f.leaders.agents.forEach((a, index) => emit('f-agent-' + f.id + '-' + index, a, 'Agent · ' + name(f), 'leader', { family, src: f.src === 'codex' ? 'codex' : 'pok' }));
  emit('f-commander-' + f.id, f.leaders.commander, 'Kommandeur · ' + name(f), 'leader', { family, src: f.src === 'codex' ? 'codex' : 'pok' });
  emit('f-hero-' + f.id, f.leaders.hero, 'Held · ' + name(f), 'leader', { family, src: f.src === 'codex' ? 'codex' : 'pok' }, [['Freischalten', '3 gewertete Aufträge.'], ...sections(f.leaders.hero)]);
  emit('f-mech-' + f.id, f.mech, 'Mech · ' + name(f), 'unit', { family, src: f.src === 'codex' ? 'codex' : 'pok' });
  (f.units || []).forEach((u, index) => {
    const blocks = sections(u);
    if (u.upgrade) blocks.push(['Aufwertung · ' + name(u.upgrade), statText(u.upgrade)], ['Aufwertung · Kurzreferenz', u.upgrade.text]);
    emit('f-unit-' + f.id + '-' + index, u, 'Sondereinheit · ' + name(f), 'unit', { family, src: f.src }, blocks);
  });
  emit('f-promissory-' + f.id, f.promissory, 'Vertragskarte · ' + name(f), 'promissory', { family, src: f.src });
}
for (const file of fs.readdirSync(out)) if (file.endsWith('.svg') && !generated.has(file)) fs.unlinkSync(path.join(out, file));
const js = '/* Generiert mit scripts/generate_reference_assets.mjs. Eigene Referenzgrafiken, keine Originalscans. */\nwindow.TI4 = window.TI4 || {};\nwindow.TI4.referenceAssets = ' + JSON.stringify(manifest, null, 2) + ';\n';
fs.writeFileSync(path.join(root, 'src/data/reference-assets.js'), js);
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${generated.size} German reference SVGs (${Object.keys(manifest).length} lookup entries).`);
