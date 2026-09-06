/* Ronde 10 — valideert de universele content-skin zonder echte layout-engine:
   1) skin-CSS is syntactisch geldig en bevat alle kernselectors;
   2) skin wordt exact 1× geladen en staat NA alle pagina-<style>-blokken
      (dus wint de cascade van alle legacy/directory-styles);
   3) alle pagina's hebben nog 1× site-chrome + 1× content-skin (geen duplicaten). */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const pages = ['/opvang', '/trimsalon/maastricht', '/hondenbelasting', '/rassen/labradoodle', '/kaart', '/forum', '/hulphonden', '/trimmen-kosten', '/fawgawgawg-404'];
const NEED_RULES = ['.provider', '.route-disclosure', '.tax-table', '.btn-submit', '.route-quick-actions', '.chips', '.form-grid', '.provider-actions'];
const SOURCES = ['/assets/css/content-skin.css', '/assets/css/site-chrome.css'];

let failed = 0;

/* 1. Geldigheid + kernselectors uit de échte bestanden */
for (const src of SOURCES) {
  const url = BASE + src;
  const res = await fetch(url);
  const css = await res.text();
  let bal = 0, ok = true;
  for (const ch of css) { if (ch === '{') bal++; if (ch === '}') bal--; if (bal < 0) { ok = false; break; } }
  const parseOk = res.ok && ok && bal === 0;
  console.log(`${parseOk ? '✓' : '✗'} ${src}: HTTP ${res.status} + CSS-syntax OK`);
  if (!parseOk) failed++;

  if (src.includes('content-skin')) {
    const dom = new JSDOM('<style id="s"></style>');
    dom.window.document.getElementById('s').textContent = css;
    const rules = Array.from(dom.window.document.styleSheets[0].cssRules).map(r => r.cssText);
    for (const sel of NEED_RULES) {
      const hit = rules.some(t => t.includes(sel));
      console.log(`${hit ? '✓' : '✗'} selector ${sel} in ${src}`);
      if (!hit) failed++;
    }
  }
}

/* 2+3. Per pagina: 1× skin-link, NA pagina-CSS; 1× site-chrome-link */
for (const path of pages) {
  const html = await (await fetch(BASE + path)).text();
  const dom = new JSDOM(html, { url: BASE + path });
  const doc = dom.window.document;
  const skinLinks = [...doc.querySelectorAll('link[id="tg-content-skin"]')];
  const chromeLinks = [...doc.querySelectorAll('link[id="tg-site-chrome"]')];
  const head = doc.head.innerHTML;
  const skinPos = head.lastIndexOf('id="tg-content-skin"');
  const lastStylePos = head.lastIndexOf('<style');
  const okSkin = skinLinks.length === 1;
  const okChrome = chromeLinks.length === 1;
  const okOrder = skinPos > lastStylePos;
  console.log(`${okSkin ? '✓' : '✗'} ${path}: content-skin exact 1×`);
  console.log(`${okOrder ? '✓' : '✗'} ${path}: content-skin NA pagina-CSS (cascade wint)`);
  console.log(`${okChrome ? '✓' : '✗'} ${path}: site-chrome exact 1×`);
  if (!okSkin || !okOrder || !okChrome) failed++;
  dom.window.close();
}

console.log(`\n${failed ? `CONTENT-SKIN: ${failed} FAIL` : 'CONTENT-SKIN: ALLE CHECKS GROEN'}`);
process.exit(failed ? 1 : 0);
