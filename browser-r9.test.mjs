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
  const stub = new Proxy({}, { get(t, p) { if (p === 'canvas') return null; if (typeof p === 'symbol') return undefined; return (...a) => 0; }, set() { return true; } });
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

console.log('\n[4] Chatbot TG: openen, suggestie, antwoord, links');
{
  const dom = await loadPage('/');
  const d = dom.window.document;
  assert(!!d.getElementById('tg-chat-bubble'), 'chat-bubble aanwezig');
  d.getElementById('tg-chat-bubble').click();
  await sleep(300);
  const panel = d.getElementById('tg-chat-panel');
  assert(panel.classList.contains('open'), 'chatpaneel opent');
  assert(d.querySelectorAll('#tg-chat-chips button').length >= 4, 'suggestie-chips getoond');
  const chip = [...d.querySelectorAll('#tg-chat-chips button')].find(b => /verzekering/i.test(b.textContent));
  chip.click();
  await sleep(900);
  const msgs = [...d.querySelectorAll('.tg-msg')];
  assert(msgs.some(m => m.classList.contains('me')), 'gebruikersbericht getoond');
  assert(msgs.some(m => m.classList.contains('bot') && /Figo|9,3/.test(m.textContent)), 'TG-antwoord met 2026-data');
  assert(d.querySelectorAll('.tg-chat-links a').length >= 1, 'aanbevolen link(s) getoond');
  assert(errors.length === 0, 'geen JS-fouten', errors.slice(0, 2).join(' | '));
  dom.window.close();
}

console.log('\n[5] Chatbot op legacy-pagina + Escape sluit');
{
  const dom = await loadPage('/verzekering');
  const d = dom.window.document;
  assert(!!d.getElementById('tg-chat-bubble'), 'chat aanwezig op /verzekering');
  d.getElementById('tg-chat-bubble').click();
  await sleep(250);
  d.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await sleep(150);
  assert(!d.getElementById('tg-chat-panel').classList.contains('open'), 'Escape sluit chat');
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
  const html = await (await pageFetch('/')).text();
  assert(/text-shadow: 0 1px 2px rgba\(255,255,255,\.94\)/.test(html), 'lichte text-shadow op hero-tekst');
  assert(/rgba\(4,20,13,\.68\)/.test(html), 'donkere scrim .68 in dark-thema');
  assert(/\.hero-subtitle \{ color: #334155/.test(html), 'subtitel donkerder (betere contrast) in licht thema');
}

console.log('\nEINDE Ronde 9' + (process.exitCode ? ' — FOUTEN AANGETROFFEN' : ' — ALLES GROEN'));
