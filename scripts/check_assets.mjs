#!/usr/bin/env node
/* Check component coverage, provenance, version separation and offline packaging. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { TI4: {} }; ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['fraktionen', 'karten-1', 'karten-2', 'de-namen', 'reference-assets', 'original-assets', 'english-sheets']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'src/data', f + '.js'), 'utf8'), ctx);
}
const D = ctx.TI4, R = D.referenceAssets, O = D.originalAssets;
const expected = [];
for (const [list, prefix] of [[D.techs,'tech-'],[D.objectives,'c-auftrag-'],[D.relics,'c-relikt-'],[D.explore,'c-erkundung-'],[D.agendas,'c-agenda-'],[D.actionCards,'c-aktion-'],[D.actionCardsCodex,'c-aktion-']]) {
  for (const c of list) { assert(c.de, `Missing German name: ${c.en}`); expected.push(prefix+c.id); }
}
for (const f of D.factions) {
  expected.push(`fs-${f.id}-front`, `fs-${f.id}-back`, `f-mech-${f.id}`, `f-commander-${f.id}`, `f-hero-${f.id}`, `f-promissory-${f.id}`);
  f.techs.forEach((_,i)=>expected.push(`ftech-${f.id}-${i}`));
  f.leaders.agents.forEach((_,i)=>expected.push(`f-agent-${f.id}-${i}`));
  (f.units||[]).forEach((_,i)=>expected.push(`f-unit-${f.id}-${i}`));
}
for (const key of expected) assert(R[key], `Missing reference image for ${key}`);
for (const a of Object.values(R)) {
  assert.equal(a.status, 'reference'); assert.equal(a.textStatus, 'summary');
  const image = fs.readFileSync(path.join(root,'src',a.src),'utf8');
  assert(image.includes('REFERENZHILFE') && image.includes('SINNGEMÄSS'), `Unlabeled reference: ${a.src}`);
  assert(!/(?:href|src)=["']https?:/.test(image), `External dependency in ${a.src}`);
}
const ids = new Set(), keys = new Set();
for (const a of O.items) {
  assert(!ids.has(a.id), `Duplicate original id ${a.id}`); ids.add(a.id);
  assert(['de','en'].includes(a.language)); assert.equal(a.status,'original');
  assert(a.width > 100 && a.height > 100);
  if (a.language==='de') {
    assert(O.sources[a.source]?.url.startsWith('https://asmodee-resources.azureedge.net/'));
    assert(a.page > 0 && a.crop.length === 4);
  } else {
    assert.equal(a.kind,'Fraktionsbogen'); assert.equal(a.sourcekind,'community-mirror-original-scan');
    assert(a.sourceUrl.startsWith('https://ti4ultimate.com/resources/images/shared/factionimages/'));
    assert(/^[0-9a-f]{40}$/.test(a.mappingCommit)); assert(['front','back'].includes(a.side));
  }
  const image = fs.readFileSync(path.join(root,'src',a.src));
  assert.equal(crypto.createHash('sha256').update(image).digest('hex'),a.sha256,`Changed image ${a.id}`);
  if (a.key) {
    const languageKey = a.key+':'+a.language;
    assert(!keys.has(languageKey),`Duplicate primary key/language ${languageKey}`); keys.add(languageKey);
    assert(R[a.key] || /^ref-/.test(a.key) || a.key === 'strategy-diplomacy',`Unknown original target ${a.key}`);
  }
  if (a.relatedKey) {
    assert(R[a.relatedKey],`Unknown related target ${a.relatedKey}`);
    assert(a.edition.includes('optional') && a.title.includes('Ω'),`Unseparated Omega version ${a.id}`);
    assert(!a.key,`Omega replaces the box image: ${a.id}`);
  }
}
assert.equal(O.items.filter(a=>a.kind==='Fraktionsreferenz').length,24);
assert.equal(O.items.find(a=>a.key==='ftech-keleres-0').title,'Basis-Modernisierung');
assert.equal(O.items.find(a=>a.key==='ftech-keleres-1').title,'Agenten-Versorgungsnetz');
assert.equal(O.items.find(a=>a.key==='f-promissory-keleres').title,'Die Keleres-Klausel');
assert.equal(O.items.find(a=>a.id==='codex2-p5-6').kind,'Anführer');
assert.equal(D.actionCards.reduce((n,a)=>n+a.count,0),100);
assert.equal(D.actionCardsCodex.reduce((n,a)=>n+a.count,0),20);

vm.runInContext(fs.readFileSync(path.join(root,'src/assets.js'),'utf8'),ctx);
assert.equal(O.items.filter(a=>a.language==='de').length,110);
assert.equal(O.items.filter(a=>a.language==='en').length,48);
for (const f of D.factions) for (const side of ['front','back']) {
  const key = `fs-${f.id}-${side}`, asset = D.AssetUI.get(key);
  assert.equal(asset.status,'original',`Missing original sheet ${key}`);
  const german = f.id==='keleres' || (f.id==='xxcha' && side==='front');
  assert.equal(asset.language,german?'de':'en',`German preference failed for ${key}`);
  if (!german) assert(D.AssetUI.figure(key).includes('Englisches Original'));
}
assert(D.AssetUI.alternatives('fs-xxcha-front').includes('Englisch in hoher Auflösung'));
assert(D.AssetUI.alternatives('fs-sol-front').includes('Deutsche Referenzgrafik'));
for (const key of expected) {
  const html = D.AssetUI.figure(key);
  assert(html.includes('<img ') && html.includes('data-act="asset-open"'),`Cannot render ${key}`);
}
assert(D.AssetUI.related('tech-magen-defense-grid').includes('optionalen Ω-Fassung'));
const sw = fs.readFileSync(path.join(root,'site/sw.js'),'utf8');
const assets = JSON.parse(/const ASSETS = (\[[^;]+\]);/.exec(sw)[1]);
for (const a of [...O.items,...Object.values(R)]) assert(assets.includes(a.src),`Not available offline: ${a.src}`);
for (const rel of assets.filter(a=>a!== './')) assert(fs.existsSync(path.join(root,'site',rel)),`Broken precache URL ${rel}`);
console.log(`PASS: ${expected.length} component references, ${O.items.length} originals, German labels, Omega separation, hashes and ${assets.length} offline URLs.`);
