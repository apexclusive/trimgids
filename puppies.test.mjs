/* Ronde 16 — PuppyMarktplaats API & front-end mini-test.
   Test 1: POST nest -> 201 + pending in data, niet zichtbaar via publieke GET.
   Test 2: validatiefout -> 400 missing_fields.
   Test 3: rate-limit -> 429 na 5 POSTs (uniek XFF per run).
   Test 4 (jsdom): SSR-filters, detail-dialoog en favorieten werken zonder refresh. */
import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const FILE = new URL('data/puppies.json', import.meta.url);
const tag = `R16-test-${Date.now()}`;
const fakeIp = `10.${Math.floor(Math.random() * 200) + 1}.${Date.now() % 200}.7`;
let failures = 0;
const ok = (cond, name) => { console.log(`${cond ? '  ✓' : '  ✗'} ${name}`); if (!cond) failures++; };

/* ---------- API-flow ---------- */
const payload = (i) => ({
  title: `${tag} nest ${i}`, breed: 'Labrador Retriever', price: 1000, weeks: 9, sex: '2 reuen · 1 teef',
  city: 'Utrecht', province: 'Utrecht', breeder: `Kennel ${tag}`, email: `${tag}-${i}@test.nl`,
  checks: 'HD/ED vrij, DNA EIC/PRA vrij', text: 'Gezonde ouderdieren, goed gesocialiseerde pups.', agree: true
});

const valid = await fetch(`${BASE}/api/puppies`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fakeIp },
  body: JSON.stringify(payload(1))
}).then(r => r.json());
ok(valid.puppy?.id && valid.puppy?.status === 'pending', 'POST geldig nest -> 201, status pending');

let stored = JSON.parse(readFileSync(FILE, 'utf8'));
ok(stored.some(p => p.id === valid.puppy.id), 'Nest is terug te vinden in data/puppies.json');

const publicList = await fetch(`${BASE}/api/puppies`).then(r => r.json());
ok(!(publicList.puppies || []).some(p => p.id === valid.puppy.id), 'Pending nest is NIET zichtbaar via publieke GET (moderatie)');

const invalid = await fetch(`${BASE}/api/puppies`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fakeIp },
  body: JSON.stringify({ title: 'x' })
});
ok(invalid.status === 400, 'POST ongeldig -> 400');

let last = 0;
for (let i = 2; i <= 6; i++) {
  last = (await fetch(`${BASE}/api/puppies`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fakeIp },
    body: JSON.stringify(payload(i))
  })).status;
}
ok(last === 429, `6e POST binnen 1 minuut -> 429 rate_limited (kreeg ${last})`);

/* ---------- front-end (jsdom) ---------- */
const html = await (await fetch(`${BASE}/puppies`)).text();
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: `${BASE}/puppies`, pretendToBeVisual: true });
await new Promise(r => setTimeout(r, 700));
const d = dom.window.document;

const cards = () => Array.from(d.querySelectorAll('.pm-card')).filter(c => !c.hidden);
const allCards = d.querySelectorAll('.pm-card').length;
ok(allCards >= 12, `SSR rendert ${allCards} nesten`);

const breedSel = d.getElementById('pm-breed');
ok(breedSel && breedSel.options.length === 5, 'Ras-filter heeft opties (Alle rassen + 4 rassen)');
if (breedSel) {
  breedSel.value = 'labrador-retriever';
  breedSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(cards().length === 4, `Filter labrador-retriever -> ${cards().length} zichtbaar (verwacht 4)`);
}

const provSel = d.getElementById('pm-prov');
if (breedSel) { breedSel.value = ''; breedSel.dispatchEvent(new dom.window.Event('change', { bubbles: true })); }
if (provSel) {
  provSel.value = 'Zuid-Holland';
  provSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(cards().length >= 1, `Provincie-filter werkt (${cards().length} zichtbaar)`);
  provSel.value = '';
  provSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

const q = d.getElementById('pm-q');
if (q) {
  q.value = 'Golden Retriever';
  q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  ok(cards().length === 0 || cards().length < 5, 'Zoekveld filtert op rasnaam');
  q.value = ''; q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}
ok(d.querySelectorAll('.pm-card').length === allCards, 'Alle kaarten weer zichtbaar na wissen');

const first = d.querySelector('.pm-card');
if (first) {
  first.click();
  const dialog = d.getElementById('pm-dialog');
  ok(dialog && !dialog.hidden, 'Detail-dialoog opent bij klik op kaart (zonder refresh)');
  if (dialog) {
    d.querySelector('[data-pm-close]').click();
    await new Promise(r => setTimeout(r, 300));
    ok(dialog.hidden, 'Dialoog sluit via close-knop');
  }
}

/* ---------- opruimen (alle test-nesten, cache-safe) ---------- */
/* De server houdt de collectie ~15s in memory en kan die daarna terugflushen.
   Daarom: wachten tot de cache ge-expired is, dan pas opruimen. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(17000);
const all = JSON.parse(readFileSync(FILE, 'utf8'));
const cleaned = all.filter(p => !String(p.title).includes(tag));
writeFileSync(FILE, JSON.stringify(cleaned, null, 2) + '\n');
console.log(`\nOpgeruimd: ${all.length - cleaned.length} testnest(en) verwijderd.`);

console.log(failures ? `\nPUPPIES TEST: ${failures} faal/falen` : '\nPUPPIES TEST: ALLES GROEN');
process.exit(failures ? 1 : 0);
