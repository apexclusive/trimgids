// Ronde 15 — PuppyMarktplaats API-test: POST aanmaken, pending niet in GET,
// validatie en rate-limit. Ruimt alle testnesten zelf weer op.
import { readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';

const base = process.env.BASE_URL || 'http://localhost:3000';
const file = new URL('./data/puppies.json', import.meta.url);
const tag = `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const ip = `10.77.${Date.now() % 100000}`; // uniek bucket -> losse rate-limiet per testrun
let pass = 0, fail = 0;
const t = (ok, name) => { if (ok) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
const post = (body) => fetch(base + '/api/puppies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
  body: JSON.stringify(body)
}).then(r => r.json().then(j => ({ status: r.status, ...j })));

const payload = (n) => ({
  title: `Ronde 15 testnest ${tag} #${n}`,
  breed: 'Labrador Retriever',
  price: 999,
  weeks: 8,
  sex: '2 reuen',
  city: 'Amersfoort',
  province: 'Utrecht',
  breeder: 'Testfokkerij',
  email: 'fokker@example.com',
  checks: ['HD/ED goedgekeurd'],
  text: 'Gezonde pups uit een liefdevol, te bezoeken nest.'
});

// 1) POST -> 201 + status pending
const created = await post(payload(1));
t(created.status === 201, 'POST geldig nest -> 201');
t(created.puppy && created.puppy.status === 'pending', 'nieuw nest status = pending');
t(created.puppy && created.puppy.id.startsWith('nest-'), 'id = nest-...');

// 2) pending is NIET zichtbaar in GET
const list = await fetch(base + '/api/puppies').then(r => r.json());
t(Array.isArray(list.puppies), 'GET /api/puppies -> lijst');
t(!list.puppies.some(p => p.id === created.puppy.id), 'pending nest niet in GET');

// 3) validatie: ontbrekende velden -> 400
const bad = await post({ title: '', breed: 'x' });
t(bad.status === 400, 'kapotte POST -> 400');

// 4) rate-limit: zelfde bucket -> 6e POST binnen de minuut = 429
let limited = false;
for (let i = 2; i <= 6; i++) {
  const r = await post(payload(i));
  if (r.status === 429) limited = true;
}
t(limited, 'rate-limit blokkeert de 6e POST (429)');

// 5) SSR toont testnest NIET (pending verborgen op /puppies), ook zonder JS
const html = await (await fetch(base + '/puppies')).text();
t(!html.includes(tag), 'pending nest niet op SSR /puppies');
t(html.includes('id="pm-grid"'), 'SSR: pm-grid');
t(html.includes('class="pm-card"'), 'SSR: pm-cards zonder JS');
t(html.includes('id="pm-form"'), 'SSR: fokker-formulier');
t(html.includes('id="pm-dialog"'), 'SSR: detail-dialog');

// opruimen: alle testnesten met deze tag verwijderen
const data = JSON.parse(readFileSync(file, 'utf8'));
const rest = data.filter(p => !String(p.title || '').includes(tag));
writeFileSync(file, JSON.stringify(rest, null, 2) + '\n');
console.log(`\n${pass} passed, ${fail} failed`);
exit(fail ? 1 : 0);
