/* Ronde 10 — 1-op-1 vergelijking: homepage vs serverpagina's.
   Vergelijkt SEMANTISCH gelijke elementen (zelfde rol als op de homepage)
   op geparste stijl: kopniveau's, intro-tekst, kaarttitels, kaartparagrafen,
   lijsten, pill-knoppen, footer en dark-mode-achtergrond.
   Plus structurele shell-checks: skip-link, scroll-progress, sticky hub-nav. */
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const targets = ['/opvang', '/trimsalon/maastricht', '/hondenbelasting', '/verzekering', '/nieuws', '/honden-cijfers', '/bedrijven', '/wandelen', '/wellness', '/hondenschool', '/kaart', '/forum', '/ehbo-hond', '/braken-hond', '/hulphonden', '/fokkers', '/adoptie', '/zintuigen', '/verboden-rassen', '/trimmen-kosten', '/hondenweetjes', '/aankoopgids', '/reizen', '/vrijwilligers', '/vacatures', '/hond-gevonden', '/hondenwedstrijden', '/koninklijke-honden', '/zwerfhonden', '/hond-en-werk', '/webshop', '/geschiedenis-hond', '/poepzakjes', '/chippen-ontwormen', '/hitteberoerte-hond', '/rassen', '/dna-test', '/voeding', '/kosten-hond', '/producten', '/offerte', '/last-minute', '/bedrijven'];

const PROPS = ['font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'font-family', 'background-color', 'border', 'border-radius', 'padding', 'margin', 'display', 'gap', 'max-width', 'list-style-type'];

/* [home-selector, server-selector, label] */
const PAIRS = [
  ['.hero-title', 'main h1', 'pagina-titel (h1)'],
  ['main .hero-subtitle', 'main .intro', 'intro-tekst'],
  ['main .section-title', 'main .section-head h2', 'sectiekop (h2)'],
  ['main .k-card h3', 'main .provider h2', 'kaarttitel'],
  ['main .k-card p', 'main .provider .address', 'kaart-meta'],
  ['main .k-card p', 'main .provider p', 'kaarttekst'],
  ['.hub-pill:not(.active)', 'main .provider .pc-map', 'pill-knop'],
  ['.btn.btn-primary.btn-pill.btn-sm', 'main .provider .pc-cta', 'kaart-CTA'],
  ['footer.site-footer .footer-col a', 'footer.site-footer .footer-col a', 'footer-link'],
  ['footer.site-footer .footer-col h4', 'footer.site-footer .footer-col h4', 'footer-kop'],
  ['main .section-eyebrow', 'main .eyebrow', 'eyebrow'],
  ['main .stat-box strong', 'main .stat-card strong', 'stat-getal'],
  ['main .k-mini span', 'main .provider .chips span', 'chips'],
];

async function load(path) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const dom = new JSDOM(html, { url: BASE + path, pretendToBeVisual: true, resources: 'usable' });
  await new Promise((resolve) => {
    const finish = () => resolve();
    setTimeout(finish, 2200);
    dom.window.addEventListener('load', finish);
  });
  return dom;
}

const styles = (dom, el) => {
  const cs = dom.window.getComputedStyle(el);
  const out = {};
  for (const p of PROPS) out[p] = cs.getPropertyValue(p).trim();
  return out;
};

/* jsdom verliest `!important` bij var()-waarden en geeft geen longhands uit
   `font:`-shorthands; echte browsers doen dat wél. Daarom: mini-cascade die
   (a) waarden via CSSOM-longhands leest (shorthands opgelost) en
   (b) importantheid uit de ruwe CSS haalt. Zelfde logica op homepage én pagina. */
const rawCache = new Map();
async function rawCss(dom) {
  const key = dom.window.location.href;
  if (rawCache.has(key)) return rawCache.get(key);
  let css = '';
  for (const el of dom.window.document.querySelectorAll('style')) css += el.textContent + '\n';
  for (const link of dom.window.document.querySelectorAll('link[rel="stylesheet"][href]')) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/')) {
      try { css += await (await fetch(BASE + href)).text() + '\n'; } catch {}
    }
  }
  rawCache.set(key, css);
  return css;
}
function importanceMap(css) {
  const map = new Map(); // selector -> { prop: true }
  const re = /([^{}]+)\s*\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (sel.startsWith('@media') || sel.startsWith('@supports') || sel.startsWith('@keyframes') || sel.startsWith('@font-face')) continue;
    const imp = {};
    for (const dm of m[2].matchAll(/([a-z-]+)\s*:\s*([^;]+)/gi)) {
      if (/!important\s*$/i.test(dm[2])) imp[dm[1].toLowerCase()] = true;
    }
    map.set(sel, imp);
  }
  return map;
}
function allRules(dom) {
  const out = [];
  const walk = list => {
    for (const r of list) {
      if (r.cssRules) { try { walk(r.cssRules); } catch {} }
      else if (r.selectorText) out.push(r);
    }
  };
  for (const sheet of dom.window.document.styleSheets) {
    try { walk(sheet.cssRules || []); } catch {}
  }
  return out;
}
function longhandsFor(dom, el, props) {
  const collected = []; // {rule, vals}
  for (const r of allRules(dom)) {
    try { if (!el.matches(r.selectorText)) continue; } catch { continue; }
    const vals = {};
    for (const p of props) {
      try { const v = r.style.getPropertyValue(p); if (v) vals[p] = v; } catch {}
    }
    if (Object.keys(vals).length) collected.push({ rule: r, vals });
  }
  return collected;
}
async function rawStyles(dom, el, props) {
  const out = {};
  if (!el || !el.matches) return out;
  const impMap = importanceMap(await rawCss(dom));
  const collected = longhandsFor(dom, el, props);
  const nonImp = [], imp = [];
  for (const c of collected) {
    const im = impMap.get(c.rule.selectorText) || {};
    // shorthand font: belangrijk als één van font-* afgeleide longhands belangrijk is
    const anyImp = Object.keys(c.vals).some(p => im[p]) ||
      /font\s*:[^;]*!important/i.test(c.rule.cssText || '');
    (anyImp ? imp : nonImp).push(c.vals);
  }
  const merge = list => {
    const o = {};
    for (const vals of list) for (const p of props) if (vals[p]) o[p] = vals[p];
    return o;
  };
  const impVals = merge(imp);
  const inline = el.getAttribute('style') || '';
  for (const p of props) {
    let v = impVals[p];
    if (v !== undefined) {
      // inline-style zonder important verliest van sheet-important
      out[p] = v;
      continue;
    }
    const im = (inline + ';').match(new RegExp('(?:^|[;\\s])' + p.replaceAll('-', '\\-') + '\\s*:\\s*([^;]+)', 'i'));
    if (im) { out[p] = im[1].replace(/!important\s*$/i, '').trim(); continue; }
    const nv = merge(nonImp)[p];
    if (nv !== undefined) out[p] = nv;
  }
  return out;
}

const norm0 = v => String(v)
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/var\((--[a-z-]+)(?:,\s*[^)]*)?\)/g, '$1')
  .replace(/\b(normal)\b/g, '400')
  .replace(/\b(bold)\b/g, '700')
  .replace(/rgba?\(0,\s*0,\s*0,\s*0\)/g, 'transparent')
  .replace(/['"]/g, '')
  .replace(/\b0(px|em|rem|%)/g, '0')
  .replace(/\s*(,)\s*/g, '$1');
const norm = v => norm0(v);

const home = await load('/');
let failed = 0;
const homeEls = {};
for (const [hs, ss, label] of PAIRS) {
  const el = home.window.document.querySelector(hs);
  homeEls[label] = el ? await rawStyles(home, el, PROPS) : null;
}
const homeBody = home.window.getComputedStyle(home.window.document.body);
const homeHtml = home.window.getComputedStyle(home.window.document.documentElement);

for (const p of targets) {
  const dom = await load(p);
  const d = dom.window.document;
  console.log(`\n===== ${p} =====`);
/* Structurele shell-checks (homepage vs route) */
  const shell = {
    'skip-link #main-content': [d.querySelector('a.skip-link[href="#main-content"]'), home.window.document.querySelector('a.skip-link[href="#main-content"]')],
    'scroll-progress-bar': [d.querySelector('.scroll-progress-bar'), home.window.document.querySelector('.scroll-progress-bar')],
    'sticky-hub-nav': [d.querySelector('.sticky-hub-nav'), home.window.document.querySelector('.sticky-hub-nav')],
    '13 hub-pills': [d.querySelectorAll('.hub-pill').length, home.window.document.querySelectorAll('.hub-pill').length],
    'site-navbar': [d.querySelector('.site-navbar#tg-site-nav'), home.window.document.querySelector('.site-navbar')],
  };
  for (const [label, [pageEl, homeEl]] of Object.entries(shell)) {
    const pageVal = typeof pageEl === 'number' ? pageEl : Boolean(pageEl);
    const homeVal = typeof homeEl === 'number' ? homeEl : Boolean(homeEl);
    if (pageVal !== homeVal) { console.log(`  ✗ shell ${label}: home=${homeVal} | page=${pageVal}`); failed++; }
  }
  if (d.querySelector('a.skip-link') && home.window.document.querySelector('a.skip-link')) {
    const a = await rawStyles(dom, d.querySelector('a.skip-link'), ['background-color','color','border-radius','font-weight']);
    const b = await rawStyles(home, home.window.document.querySelector('a.skip-link'), ['background-color','color','border-radius','font-weight']);
    for (const prop of ['background-color', 'color', 'border-radius', 'font-weight']) {
      if (norm(a[prop]) !== norm(b[prop])) { console.log(`  ✗ skip-link ${prop}: home="${b[prop]}" | page="${a[prop]}"`); failed++; }
    }
  }

  for (const [hs, ss, label] of PAIRS) {
    const el = d.querySelector(ss);
    if (!el) { console.log(`  - ${label}: geen element op ${p}`); continue; }
    const h = homeEls[label];
    if (!h) continue;
    const s = await rawStyles(dom, el, PROPS);
    for (const prop of PROPS) {
      const a = h[prop], b = s[prop];
      if (!a || !b) continue;
      if (prop === 'border') {
        // alleen relevant als er een zichtbare rand is
        const styleA = a.includes('none') ? 'none' : a;
        const styleB = b.includes('none') ? 'none' : b;
        if ((styleA === 'none') !== (styleB === 'none') || (styleA !== 'none' && norm(a) !== norm(b))) {
          console.log(`  ✗ ${label} ${prop}: home="${a}" | page="${b}"`);
          failed++;
        }
        continue;
      }
      const na = norm(a);
      const nb = norm(b);
      if (na !== nb) {
        console.log(`  ✗ ${label} ${prop}: home="${a}" | page="${b}"`);
        failed++;
      }
    }
  }
  /* body-achtergrond: homepage gebruikt html-bg; vergelijk met html-bg van de pagina */
  const body = dom.window.getComputedStyle(d.body);
  const html = dom.window.getComputedStyle(d.documentElement);
  const bodyBgOk = (norm(body.backgroundColor) === 'transparent' && norm(html.backgroundColor) === norm(homeHtml.backgroundColor)) ||
    (norm(body.backgroundColor) === norm(homeHtml.backgroundColor));
  if (!bodyBgOk) { console.log(`  ✗ body-achtergrond: home-html="${homeHtml.backgroundColor}" | page-body="${body.backgroundColor}" | page-html="${html.backgroundColor}"`); failed++; }
  const bodyColor = body.color, homeColor = homeBody.color;
  if (norm(bodyColor) !== norm(homeColor)) { console.log(`  ✗ body-kleur: home="${homeColor}" | page="${bodyColor}"`); failed++; }
  dom.window.close();
}
console.log(failed === 0 ? '\n1-OP-1: GEEN STIJLVERSCHILLEN' : `\n1-OP-1: ${failed} VERSCHILLEN`);
process.exit(failed === 0 ? 0 : 1);
