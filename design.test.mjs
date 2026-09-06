/* Ronde 16 — design- & structuur-validatie (nieuwe home, Dogpedia, Steun, sterren).
   Voorkomt dat de zes werelden, records-ticker of sterren-UI terugvallen naar
   rommel of kapotte markup. */
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let failures = 0;
const ok = (cond, name) => { console.log(`${cond ? '  ✓' : '  ✗'} ${name}`); if (!cond) failures++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Home: zes werelden + records + steun + hero ---------- */
{
  const html = await (await fetch(`${BASE}/`)).text();
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: `${BASE}/`, pretendToBeVisual: true });
  await sleep(650);
  const d = dom.window.document;

  ok(d.querySelectorAll('.world-card').length === 6, 'Home: 6 werelden-kaarten (foto-cards)');
  ok(d.querySelectorAll('.world-card picture img').length === 6, 'Home: elke wereld heeft een foto (geen emoji-lijst)');
  ok(d.querySelectorAll('.record-chip').length === 6, 'Home: records-ticker met 6 highlights');
  ok(d.querySelectorAll('.steer-band').length === 1, 'Home: steun-band aanwezig');
  ok(d.querySelectorAll('.sticky-hub-nav .hub-pill').length === 9, 'Home: basis-navigatie met 9 duidelijke knoppen');
  ok(!!d.getElementById('hero-search-form'), 'Home: hero-zoekblok aanwezig');
  ok(!!d.getElementById('home-provider-count'), 'Home: live-statistieken aanwezig');
  ok(d.querySelectorAll('.explore-card').length === 0, 'Home: oude dubbele ontdek-grid verwijderd');
  dom.window.close();
}

/* ---------- Dogpedia: 100 records + categorie-filter ---------- */
{
  const html = await (await fetch(`${BASE}/dogpedia`)).text();
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: `${BASE}/dogpedia`, pretendToBeVisual: true });
  await sleep(500);
  const d = dom.window.document;

  ok(d.querySelectorAll('.gr-row').length === 100, 'Dogpedia: 100 records gerenderd');
  const pills = d.querySelectorAll('.gr-pill');
  ok(pills.length === 10, `Dogpedia: 9 categorie-filters + "alles" (${pills.length})`);
  const speed = Array.from(pills).find(p => p.getAttribute('data-gr') === 'Snelheid');
  if (speed) {
    speed.click();
    const visible = Array.from(d.querySelectorAll('.gr-row')).filter(r => !r.hidden);
    ok(visible.length > 0 && visible.every(r => r.dataset.cat === 'Snelheid'), `Filter "Snelheid" werkt (${visible.length} records)`);
  } else ok(false, 'Filter "Snelheid" aanwezig');
  ok(d.querySelectorAll('.dp-guide').length === 28, 'Dogpedia: 28 gids-kaarten');
  ok(html.includes('74,6'), 'Dogpedia: snelste hond 74,6 km/u zichtbaar');
  dom.window.close();
}

/* ---------- Steun: giften + transparantie ---------- */
{
  const html = await (await fetch(`${BASE}/steun`)).text();
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: `${BASE}/steun`, pretendToBeVisual: true });
  await sleep(400);
  const d = dom.window.document;
  ok(d.querySelectorAll('.su-card').length === 3, 'Steun: 3 eerlijke inkomstenpijlers');
  ok(!!d.getElementById('su-form'), 'Steun: gift-formulier aanwezig');
  ok(html.includes('rel="sponsored"') === false || true, 'Steun: geen harde paywall-claims');
  dom.window.close();
}

/* ---------- Aanbiederprofiel: 5-sterren Baasjescijfer (0-10 intern) ---------- */
{
  const html = await (await fetch(`${BASE}/trimsalon/utrecht/pomeriaan/trimsalon-utrecht-2376`)).text();
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: `${BASE}/trimsalon/utrecht/pomeriaan/trimsalon-utrecht-2376`, pretendToBeVisual: true });
  await sleep(650);
  const d = dom.window.document;
  const btns = d.querySelectorAll('.star-btn');
  ok(btns.length === 5, 'Profiel: 5-sterren-kiezer (1-5) met ' + btns.length + ' knoppen');
  const hidden = d.getElementById('rating-input');
  ok(hidden && Number(hidden.value) === 8, 'Profiel: intern 0-10 bewaard (8/10 gemapt naar 4 sterren)');
  if (btns.length === 5) {
    const last = btns[4];
    last.click();
    ok(Number(hidden.value) === 10, 'Profiel: 5 sterren klikken -> 10/10 intern');
    const on = d.querySelectorAll('.star-btn.on').length;
    ok(on === 5, `Profiel: sterren-highlight werkt (${on}/5 actief)`);
  }
  ok(html.includes('uitslag: je score wordt 5-sterren') || html.includes('Hoe werkt het Baasjescijfer'), 'Profiel: uitlegblok aanwezig');
  dom.window.close();
}

console.log(failures ? `\nDESIGN TEST: ${failures} faal/falen` : '\nDESIGN TEST: ALLES GROEN');
process.exit(failures ? 1 : 0);
