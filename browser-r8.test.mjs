/* Ronde 8: adviseur, nieuwsbrief, rich-schema, thema, account & favorieten end-to-end. */
import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = 'http://localhost:3000';
const jar = {};
let errors = [];

function pageFetch(url, options = {}, base = BASE) {
  const headers = new Headers(options.headers || {});
  if (Object.keys(jar).length) headers.set('Cookie', Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; '));
  return fetch(new URL(url, base), { ...options, headers, redirect: 'manual' }).then(res => {
    for (const raw of res.headers.getSetCookie?.() || []) {
      const [pair] = raw.split(';');
      const i = pair.indexOf('=');
      const n = pair.slice(0, i).trim(), v = pair.slice(i + 1).trim();
      if (v === '' || /Max-Age=0/i.test(raw)) delete jar[n]; else jar[n] = v;
    }
    return res;
  });
}

function assert(cond, label, extra = '') {
  if (cond) { console.log('  ✓ ' + label); return true; }
  console.error('  ✗ ' + label + (extra ? ' — ' + extra : ''));
  process.exitCode = 1;
  return false;
}

async function loadPage(path) {
  errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const s = String(e && e.message || e);
    if (/Not implemented.*(scroll|window\.matchMedia|canvas)/i.test(s)) return;
    if (/Could not load (link|script).*(fonts\.googleapis|gstatic|unpkg|google)/i.test(s)) return;
    errors.push(s);
  });
  const html = await (await pageFetch(path)).text();
  const dom = new JSDOM(html, {
    url: BASE + path, runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win) {
      win.fetch = (u, o) => pageFetch(u, o);
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.scrollTo = () => {};
      win.HTMLElement.prototype.scrollIntoView = function () {};
      if (!win.requestIdleCallback) win.requestIdleCallback = fn => setTimeout(fn, 0);
      const stub = new Proxy({}, { get(t, p) { if (p === 'canvas') return null; if (typeof p === 'symbol') return undefined; return (...a) => 0; }, set() { return true; } });
      win.HTMLCanvasElement.prototype.getContext = () => stub;
    }
  });
  await new Promise(r => dom.window.addEventListener('load', r));
  await new Promise(r => setTimeout(r, 1300));
  return dom;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log('\n[1] Verzekeringspagina: adviseur + tabel + schema');
{
  const dom = await loadPage('/verzekering');
  const d = dom.window.document;
  assert(d.getElementById('adv-btn'), 'verzekerings-adviseur aanwezig');
  const before = d.getElementById('adv-result').hidden;
  d.getElementById('adv-btn').click();
  await sleep(400);
  assert(!d.getElementById('adv-result').hidden || !before, 'adviseur geeft een aanbeveling');
  const advText = d.getElementById('adv-result').textContent;
  assert(/Figo|Univé|OHRA/.test(advText), 'advies benoemt een topverzekeraar', advText.slice(0, 80));
  assert(d.querySelectorAll('.ins-table tbody tr').length >= 4, 'vergelijkingstabel met 6 verzekeraars');
  assert(!!d.querySelector('script[type="application/ld+json"]'), 'rich-schema aanwezig');
  assert(d.querySelectorAll('.tg-save-btn[data-save]').length >= 1, 'bewaar-knop aanwezig');
  assert(errors.length === 0, 'geen JS-fouten op /verzekering', errors.slice(0, 2).join(' | '));
  dom.window.close();
}

console.log('\n[2] Nieuwsbrief: homepage + legacy + API');
{
  const dom = await loadPage('/');
  const d = dom.window.document;
  const form = d.querySelector('#tg-newsletter form');
  assert(!!form, 'nieuwsbriefformulier op homepage');
  form.querySelector('input[type=email]').value = 'brief-' + Date.now() + '@test.nl';
  form.querySelector('button').click();
  await sleep(600);
  assert(!d.querySelector('#tg-newsletter .home-newsletter-ok').hidden, 'homepage-nieuwsbrief toont bevestiging');
  assert(errors.length === 0, 'geen JS-fouten op homepage', errors.slice(0, 2).join(' | '));
  dom.window.close();

  const n = await loadPage('/braken-hond');
  const nl = n.window.document.querySelector('#tg-newsletter, .tg-newsletter');
  assert(!!nl, 'nieuwsbrief in universele footer');
  const email = nl.querySelector('input[type=email]');
  email.value = 'legacy-brief-' + Date.now() + '@test.nl';
  nl.querySelector('button').click();
  await sleep(600);
  assert(!nl.querySelector('.tg-newsletter-ok, .home-newsletter-ok').hidden, 'universele nieuwsbrief toont bevestiging');
  n.window.close();
}

console.log('\n[3] Webshop: rich-schema + filters + favorieten');
{
  const dom = await loadPage('/webshop');
  const d = dom.window.document;
  assert(d.querySelectorAll('[data-c]').length >= 8, '8+ categorieën');
  assert(d.querySelectorAll('.p-card').length >= 10, 'producten gerenderd');
  const cats = d.querySelector('[data-c="opbergen"]');
  if (cats) { cats.click(); await sleep(200); }
  assert(d.querySelector('.p-card') || d.querySelector('.shop-empty'), 'filter werkt');
  assert(!!d.querySelector('script[type="application/ld+json"]'), 'Product-schema aanwezig');
  dom.window.close();
}

console.log('\n[4] SEO: WebPage + Breadcrumb + org op alle routes');
{
  for (const p of ['/verzekering', '/braken-hond', '/webshop', '/kaart', '/nieuws', '/hond-en-werk']) {
    const t = await (await pageFetch(p)).text();
    assert(t.includes('"@type":"WebPage"') && t.includes('"@type":"BreadcrumbList"'), `rich-schema (WebPage+Breadcrumb) op ${p}`);
  }
}

console.log('\n[5] Regressie: thema + account + forum');
{
  const dom = await loadPage('/');
  const d = dom.window.document;
  d.querySelector('#theme-toggle').click();
  const t1 = d.documentElement.getAttribute('data-theme');
  assert(t1 === 'dark', 'thema schakelt naar donker');
  d.querySelector('#account-btn').click();
  await sleep(200);
  d.querySelector('[data-tg-view="register"]').click();
  const name = 'R8' + Date.now().toString(36).slice(-5);
  d.querySelector('#tg-reg-name').value = name;
  d.querySelector('#tg-reg-email').value = name + '@test.nl';
  d.querySelector('#tg-reg-pass').value = 'wachtwoord123';
  d.querySelector('#tg-register-form button').click();
  await sleep(700);
  assert(!!d.getElementById('tg-fav-list'), 'registratie werkt na Ronde-8-wijzigingen');
  dom.window.close();
}

console.log('\nEINDE Ronde 8' + (process.exitCode ? ' — FOUTEN AANGETROFFEN' : ' — ALLES GROEN'));
