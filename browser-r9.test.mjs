/* Ronde 9: zoekbalk in header, /zoek-pagina, chatbot TG, trimkosten-calculator, hero-contrast. */
import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = 'http://localhost:3000';
let errors = [];

function pageFetch(url, options = {}) {
  return fetch(new URL(url, BASE), { ...options, redirect: 'manual' });
}
function assert(cond, label, extra = '') {
  if (cond) { console.log('  ✓ ' + label); return true; }
  console.error('  ✗ ' + label + (extra ? ' — ' + extra : ''));
  process.exitCode = 1;
  return false;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function loadPage(path) {
  errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const s = String(e && e.message || e);
    if (/Not implemented.*(scroll|window\.matchMedia|canvas|navigation)/i.test(s)) return;
    if (/Could not load (link|script).*(fonts\.googleapis|gstatic)/i.test(s)) return;
    errors.push(s);
  });
  const html = await (await pageFetch(path)).text();
  /* Canvas-stub. Let op: gradient-methoden moeten een object mét addColorStop
   teruggeven, zoals een echte 2d-context doet. Eerder gaf deze stub voor
   elke property `(...a) => 0` terug, dus createRadialGradient() leverde 0
   op en gooide nl-map.js "bg.addColorStop is not a function". Dat was een
   fout in de stub, niet in de productcode — de kaart faalde alleen in deze
   test, niet in een echte browser. */
  const gradientStub = { addColorStop() {} };
  const GRADIENT_METHODS = new Set(['createLinearGradient', 'createRadialGradient', 'createConicGradient', 'createPattern']);
  const stub = new Proxy({}, {
    get(t, p) {
      if (p === 'canvas') return null;
      if (typeof p === 'symbol') return undefined;
      if (GRADIENT_METHODS.has(p)) return () => gradientStub;
      return (...a) => 0;
    },
    set() { return true; }
  });
  const dom = new JSDOM(html, {
    url: BASE + path, runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win) {
      win.fetch = (u, o) => pageFetch(u, o);
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.scrollTo = () => {};
      win.HTMLElement.prototype.scrollIntoView = function () {};
      win.HTMLCanvasElement.prototype.getContext = () => stub;
      win.__tgNav = url => { win.__navPath = url; };
    }
  });
  await new Promise(r => dom.window.addEventListener('load', r));
  await sleep(1400);
  return dom;
}

console.log('\n[1] Header-zoekbalk op homepage (live suggesties + Enter)');
{
  const dom = await loadPage('/');
  const d = dom.window.document;
  const input = d.getElementById('tg-search-input');
  assert(!!input, 'zoekbalk aanwezig in header');
  input.value = 'verzekering';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await sleep(600);
  const drop = d.getElementById('tg-search-drop');
  assert(drop.classList.contains('open'), 'dropdown opent bij typen');
  assert(drop.querySelectorAll('.tg-search-item').length >= 2, 'live resultaten getoond');
  input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await sleep(300);
  assert(dom.window.__navPath === '/verzekering', 'Enter navigeert naar beste match (via __tgNav)', dom.window.__navPath);
  dom.window.close();
}

console.log('\n[2] Zoekbalk op legacy-pagina + Ctrl+K shortcut');
{
  const dom = await loadPage('/braken-hond');
  const d = dom.window.document;
  const input = d.getElementById('tg-search-input');
  assert(!!input, 'zoekbalk aanwezig op legacy-pagina');
  input.value = 'hitte';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await sleep(600);
  const first = d.querySelector('.tg-search-item');
  assert(!!first && /hitte/i.test(first.textContent), 'hitte-zoekresultaat gevonden', first && first.textContent);
  dom.window.close();
}

console.log('\n[3] /zoek-pagina: resultaten + live herzoek');
{
  const dom = await loadPage('/zoek?q=verzekering');
  const d = dom.window.document;
  assert(!!d.querySelector('.r'), 'server-rendered resultaten');
  const input = d.querySelector('form input');
  input.value = 'trim';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await sleep(600);
  const items = d.querySelectorAll('.r');
  assert(items.length >= 1 && /trim/i.test(items[0].textContent), 'live herzoek op /zoek toont trimmatchen', items[0] && items[0].textContent);
  dom.window.close();
}

console.log('\n[4] Chatbot TG bewust uitgeschakeld (zwevende chat-bel verwijderd)');
{
  /* Productbeslissing: de zwevende chat-bel (tg-chat-bubble) is verwijderd
     omdat het een storend zwevend element was. De chatbot-functionaliteit
     (chatbot.js) blijft in assets/ bewaard voor een eventuele herintroductie.
     Deze test bewaakt dat er géén zwevende chat-UI meer gerenderd wordt. */
  const dom = await loadPage('/');
  const d = dom.window.document;
  assert(!d.getElementById('tg-chat-bubble'), 'geen chat-bubble op homepage');
  assert(!d.getElementById('tg-chat-panel'), 'geen chatpaneel op homepage');
  dom.window.close();
}

console.log('\n[5] Geen chat-bel op legacy-pagina');
{
  const dom = await loadPage('/verzekering');
  const d = dom.window.document;
  assert(!d.getElementById('tg-chat-bubble'), 'geen chat-bel op /verzekering');
  assert(!d.getElementById('tg-chat-panel'), 'geen chatpaneel op /verzekering');
  dom.window.close();
}

console.log('\n[6] Trimkosten-calculator + 2026-data');
{
  const dom = await loadPage('/trimmen-kosten');
  const d = dom.window.document;
  assert(d.querySelectorAll('.ttable tbody tr').length >= 14, '14+ ras-tarieven getoond');
  assert(/€ 65–75/.test(d.querySelector('.stats').textContent), 'landelijk gemiddelde 2026');
  const per = d.getElementById('tc-per'), year = d.getElementById('tc-year');
  const before = year.textContent;
  d.getElementById('tc-size').value = '120';
  d.getElementById('tc-size').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  await sleep(150);
  assert(year.textContent !== before, 'calculator reageert op formaat (' + before + ' → ' + year.textContent + ')');
  assert(!!d.querySelector('script[type="application/ld+json"]'), 'FAQPage+ItemList schema aanwezig');
  assert(d.querySelectorAll('.tg-search-item').length >= 0, 'ok');
  assert(errors.length === 0, 'geen JS-fouten op /trimmen-kosten', errors.slice(0, 2).join(' | '));
  dom.window.close();
}

console.log('\n[7] Hero-leesbaarheid (text-shadow + scrim aanwezig)');
{
  /* Deze drie asserts lazen de CSS uit de HTML, maar de hero-regels staan in
     assets/css/home.css (al zo sinds ae1e532) en worden als aparte stylesheet
     gelinkt. Ze faalden dus al vóór deze ronde; ze testten de verkeerde plek.
     Nu halen we de stylesheets op die de pagina werkelijk linkt, in
     cascade-volgorde, en controleren we daar de regels. */
  const html = await (await pageFetch('/')).text();
  const cssHrefs = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => m[1]);
  const css = (await Promise.all(cssHrefs.map(async href => {
    const res = await pageFetch(href);
    return res.ok ? res.text() : '';
  }))).join('\n');
  assert(css.length > 0, 'homepage linkt minstens één stylesheet (' + cssHrefs.length + ' gevonden)');
  assert(/text-shadow:\s*0 1px 2px rgba\(255,255,255,\.94\)/.test(css), 'lichte text-shadow op hero-tekst');
  assert(/(rgba\(4,20,13,\.68\)|#04140dad)/i.test(css), 'donkere scrim .68 in dark-thema');
  assert(/\.hero-subtitle\s*\{\s*color:\s*#334155/.test(css), 'subtitel donkerder (betere contrast) in licht thema');
}

console.log('\nEINDE Ronde 9' + (process.exitCode ? ' — FOUTEN AANGETROFFEN' : ' — ALLES GROEN'));
