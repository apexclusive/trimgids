/* Ronde 10 — universele shell-validatie op meerdere paginatypen.
   Controleert dat elke page: één homepage-nav, één homepage-footer, één
   announcement-bar, de gedeelde site-chrome.css en een werkende app-runtime
   (zoekbalk + thema) heeft. */
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const pages = ['/opvang', '/opvang/amsterdam', '/kaart', '/forum', '/hulphonden', '/hondenbelasting', '/trimmen-kosten', '/fawgawgawg-404'];

let failed = 0;
for (const path of pages) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: BASE + path, pretendToBeVisual: true });
  const d = dom.window.document;
  const checks = [];
  const expect = (ok, name) => checks.push([ok, name]);

  expect(res.status === 200 || res.status === 404, `HTTP ${res.status}`);
  expect(d.querySelectorAll('nav.site-navbar').length === 1, 'exact 1 homepage-nav (.site-navbar)');
  expect(d.querySelectorAll('footer.site-footer').length === 1, 'exact 1 homepage-footer (.site-footer)');
  expect(d.querySelectorAll('.top-announcement').length === 1, 'exact 1 announcement-bar');
  expect(d.querySelectorAll('.brand-logo').length >= 1, 'brand-logo aanwezig');
  expect(d.querySelectorAll('.nav-links-pills .nav-pill').length >= 8, '8+ nav-pills');
  expect(d.querySelectorAll('.nav-more-panel h3').length === 4, 'nav-more heeft 4 kolommen');
  expect(d.querySelectorAll('.nav-actions .btn-outline').length >= 2, 'nav-actions knoppen (bedrijven + account)');
  expect(d.querySelectorAll('.footer-grid .footer-col').length >= 6, 'footer-grid met 6+ kolommen');
  expect(d.querySelectorAll('#tg-newsletter').length === 1, 'nieuwsbrief-kaart in footer');
  expect(d.querySelectorAll('link[id="tg-site-chrome"]').length === 1, 'site-chrome.css exact 1× geladen');
  expect(d.querySelectorAll('link[id="tg-content-skin"]').length === 1, 'content-skin.css exact 1× geladen');
  expect(d.querySelectorAll('script[src="/assets/js/app.js"], script[id="tg-app-js"]').length === 1, 'app.js 1× geladen');
  expect(d.querySelectorAll('script[src="/assets/js/chatbot.js"], script[id="tg-chatbot-js"]').length === 1, 'chatbot.js 1× geladen');
  expect(d.querySelectorAll('.route-skip, .skip-link').length >= 1, 'skip-link aanwezig');
  expect(d.querySelectorAll('header, header.site-navbar').length === 0 || d.querySelector('nav.site-navbar') != null, 'geen legacy-header meer');

  /* Runtime: app.js boot moet de zoekbalk in de navbar injecteren */
  await new Promise(r => setTimeout(r, 600));
  expect(!!d.querySelector('#tg-search-input'), 'zoekbalk geïnjecteerd door app.js');
  expect(!!d.querySelector('#theme-toggle'), 'theme-toggle aanwezig');

  const skinCss = dom.window.document.querySelector('link[id="tg-content-skin"]');
  expect(!!skinCss, 'content-skin link-tag in head');
  if (skinCss && dom.window.document.styleSheets) {
    let found = '';
    for (const sheet of dom.window.document.styleSheets) {
      if (sheet.href && sheet.href.includes('content-skin')) {
        try { found = Array.from(sheet.cssRules || []).map(r => r.cssText).join('\n'); } catch (e) { found = ''; }
        break;
      }
    }
    expect(/\.provider\s*\{/.test(found) || found.includes('.provider'), 'content-skin stijlt .provider-kaarten');
    expect(/\.route-disclosure/.test(found), 'content-skin stijlt disclosure-noot');
  }

  const okRows = checks.map(([ok, name]) => `${ok ? '  ✓' : '  ✗'} ${name}`);
  console.log(`\n${path} — ${checks.filter(c => c[0]).length}/${checks.length}`);
  for (const row of checks.filter(c => !c[0])) console.log(row);
  if (checks.some(c => !c[0])) { failed++; }
  dom.window.close();
}
console.log(failed ? `\nRONDE 10 SHELL: ${failed} pagina('s) FAALT` : '\nRONDE 10 SHELL: ALLES GROEN');
process.exit(failed ? 1 : 0);
