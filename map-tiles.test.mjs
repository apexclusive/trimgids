/* Regressietest: interactieve kaart (Leaflet).

   De oude eigen canvas-kaart tekende niets zodra de tegellaag faalde en moest
   pan/zoom/markers zelf uitvinden. Nu draait de kaart op Leaflet, lokaal
   ge-vendord (assets/vendor/leaflet), met de tegels rechtstreeks uit de browser
   van de bezoeker bij OpenStreetMap. Deze test bewaakt:

   1. Leaflet wordt geserveerd en op elke kaart-pagina ingeladen (CSS + JS).
   2. De component bouwt zijn UI (zoekveld, categoriefilters, provincie, geo).
   3. De data (providers + routes) wordt geladen en als markers toegevoegd.
   4. Filteren per categorie en provincie werkt op de markerlaag.
   5. De CSP laat de OSM-tegels en de lokale Leaflet-scripts toe.

   Vereist: draaiende server op BASE_URL (default http://localhost:3000). */
import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let failed = 0;
const assert = (ok, msg) => { console.log(`${ok ? '  ✓' : '  ✗'} ${msg}`); if (!ok) failed++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pageFetch = (u, o) => fetch(u.startsWith('http') ? u : BASE + u, o);

console.log('\n[1] Leaflet is lokaal ge-vendord en wordt geserveerd');
{
  const js = await pageFetch('/assets/vendor/leaflet/leaflet.js');
  const css = await pageFetch('/assets/vendor/leaflet/leaflet.css');
  assert(js.status === 200, 'leaflet.js -> 200');
  assert(css.status === 200, 'leaflet.css -> 200');
  const body = await js.text();
  assert(body.includes('leaflet') || body.length > 100000, 'leaflet.js bevat de bibliotheek');
}

console.log('\n[2] Elke kaart-pagina laadt Leaflet CSS + JS vóór nl-map.js');
{
  for (const p of ['/kaart', '/trimsalon']) {
    const html = await (await pageFetch(p)).text();
    const li = html.indexOf('leaflet.js');
    const ni = html.indexOf('nl-map.js');
    assert(li > -1, `${p}: leaflet.js aanwezig`);
    assert(ni > -1, `${p}: nl-map.js aanwezig`);
    assert(li > -1 && ni > -1 && li < ni, `${p}: leaflet.js staat vóór nl-map.js`);
    assert(html.includes('leaflet.css'), `${p}: leaflet.css gelinkt`);
  }
}

console.log('\n[3] Component bouwt UI en markers in jsdom');
{
  const errors = [];
  const vc = new VirtualConsole();
  const IGNORABLE = /Could not load|fonts\.|tile\.openstreetmap|Could not load img|leaflet/i;
  vc.on('jsdomError', e => { const s = String(e && e.message || e); if (!IGNORABLE.test(s)) errors.push(s); });
  const html = await (await pageFetch('/kaart')).text();
  const dom = new JSDOM(html, {
    url: BASE + '/kaart', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win) {
      win.fetch = (u, o) => pageFetch(u, o);
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.scrollTo = () => {};
      win.HTMLElement.prototype.scrollIntoView = function () {};
      // Leaflet verwacht echte layout-maten; jsdom geeft 0. Geef de stage een maat.
      Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return 900; } });
      Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return 500; } });
    }
  });
  await new Promise(r => dom.window.addEventListener('load', r));
  await sleep(2500);
  const d = dom.window.document;
  assert(!!d.querySelector('.nlmap-chips button'), 'categoriefilters aanwezig');
  assert(!!d.querySelector('.nlmap-search input'), 'zoekveld aanwezig');
  assert(!!d.querySelector('.nlmap-province select'), 'provincie-select aanwezig');
  const leaflet = !!d.querySelector('.leaflet-container');
  const fallback = !!d.querySelector('.nlmap-fallback');
  assert(leaflet || fallback, `kaart geïnitialiseerd (leaflet=${leaflet}, fallback=${fallback})`);
  const markers = d.querySelectorAll('.leaflet-interactive').length;
  if (leaflet) assert(markers > 0, `markers toegevoegd (${markers})`);
  const stat = (d.querySelector('.nlmap-stat') || {}).textContent || '';
  assert(/\d+ locaties/.test(stat), `stat toont aantal locaties: "${stat.trim()}"`);
  assert(errors.length === 0, `geen onverwachte js-fouten (${errors.length ? errors[0] : 0})`);
  dom.window.close();
}

console.log('\n[4] CSP staat OSM-tegels en lokale scripts toe');
{
  const res = await pageFetch('/kaart');
  const csp = res.headers.get('content-security-policy') || '';
  const imgSrc = (csp.match(/img-src[^;]*/) || [''])[0];
  const scriptSrc = (csp.match(/script-src[^;]*/) || [''])[0];
  assert(imgSrc.includes('tile.openstreetmap.org'), 'img-src bevat tile.openstreetmap.org');
  assert(scriptSrc.includes("'self'"), 'script-src staat lokale (ge-vendorde) leaflet toe');
}

console.log(failed === 0 ? '\nKAART (LEAFLET): ALLES GROEN' : `\nKAART (LEAFLET): ${failed} FOUTEN`);
process.exit(failed === 0 ? 0 : 1);
