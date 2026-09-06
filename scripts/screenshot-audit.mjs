// Ronde 10 — echte Chromium-screenshots + computed-style audit (home vs routes)
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'node:fs';

const BASE = 'http://localhost:3000';
const ROUTES = ['/', '/opvang', '/trimsalon/maastricht', '/hondenbelasting', '/verzekering', '/nieuws', '/honden-cijfers', '/bedrijven'];
const OUT = '/tmp/tg-shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: 'shell',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36');

const PROPS = ['backgroundColor', 'color', 'fontSize', 'fontWeight', 'lineHeight', 'maxWidth', 'borderRadius', 'padding', 'margin', 'display', 'gap'];
const style = (el) => {
  const s = getComputedStyle(el);
  const o = {};
  for (const p of PROPS) o[p] = s[p];
  return o;
};
const q = (sel) => document.querySelector(sel);
const norm = v => String(v).replace(/var\(--[a-z0-9-]+(?:,\s*[^)]+)?\)/gi, (m) => m.slice(4, m.indexOf(',') > -1 ? m.indexOf(',') : -1).trim());

const results = {};
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 30000 });
  // wacht op evt. client-rendered content
  await new Promise(r => setTimeout(r, 350));
  const data = await page.evaluate((selectorMap) => {
    const grab = (label, sel) => {
      const el = document.querySelector(sel);
      if (!el) return { label, missing: true };
      return { label, ...styleOf(el) };
    };
    function styleOf(el) {
      const s = getComputedStyle(el);
      const out = {};
      for (const p of Object.keys(selectorMap.props)) { /* noop */ }
      for (const p of ['backgroundColor','color','fontSize','fontWeight','lineHeight','maxWidth','borderRadius','padding','margin','display','gap']) out[p] = s[p];
      return out;
    }
    return {
      url: location.href,
      html: grab('html', 'html'),
      body: grab('body', 'body'),
      header: grab('header', 'header.site-navbar, header.tg-site-nav, body > header'),
      nav: grab('nav', 'header nav, .site-navbar'),
      footer: grab('footer', 'footer.site-footer, body > footer'),
      h1: grab('h1', 'main h1'),
      eyebrow: grab('eyebrow', 'main .eyebrow, .section-eyebrow'),
      main: grab('main', 'main'),
      hub: grab('hub', '.sticky-hub-nav'),
      pills: document.querySelectorAll('.hub-pill').length,
      skip: !!document.querySelector('.skip-link, .route-skip'),
      progress: !!document.querySelector('#scroll-progress, .scroll-progress-bar'),
      tgNav: !!document.querySelector('#tg-site-nav'),
      tgList: !!document.querySelector('.tg-list'),
      planFeatures: !!document.querySelector('.plan-features'),
      fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,p,li,a,.nav-pill,.hub-pill')].map(el => getComputedStyle(el).fontFamily.split(',')[0]))],
    };
  }, {});
  results[route] = data;
  await page.screenshot({ path: `${OUT}${route === '/' ? '/home' : route.replaceAll('/', '-')}.png`, fullPage: true });
  console.log('📸', route, 'done, hub-pills:', data.pills, 'tgList:', data.tgList, 'planFeatures:', data.planFeatures);
}

// vergelijken met home
const home = results['/'];
let diffs = 0;
for (const route of ROUTES.slice(1)) {
  const p = results[route];
  console.log(`\n===== ${route} =====`);
  for (const k of ['html', 'body', 'header', 'footer', 'h1', 'eyebrow', 'main']) {
    const h = home[k], pp = p[k];
    if (h?.missing || pp?.missing) continue;
    for (const prop of ['backgroundColor', 'color', 'fontSize', 'fontWeight', 'lineHeight', 'maxWidth']) {
      const a = norm(h[prop]), b = norm(pp[prop]);
      if (a !== b) { console.log(`  ✗ ${k}.${prop}: home="${h[prop]}" | route="${pp[prop]}"`); diffs++; }
    }
  }
  if (p.tgNav !== home.tgNav) { console.log(`  ✗ tgNav: home=${home.tgNav} | route=${p.tgNav}`); diffs++; }
  if (p.skip !== home.skip) { console.log(`  ✗ skip-link: home=${home.skip} | route=${p.skip}`); diffs++; }
  if (p.progress !== home.progress) { console.log(`  ✗ scroll-progress: home=${home.progress} | route=${p.progress}`); diffs++; }
  if (p.hub !== home.hub) { console.log(`  ✗ sticky-hub: home=${Boolean(home.hub)} | route=${Boolean(p.hub)}`); diffs++; }
}
console.log(`\nTOTAAL VISUELE DIFFS: ${diffs}`);
console.log('shots in', OUT);
await browser.close();
