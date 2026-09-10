/* Bewaakt de scroll-hint van de hub-nav.

   .hub-nav-in scrolt horizontaal met verborgen scrollbar. tokens.css geeft een
   uitdovende rechterrand als aanwijzing dat er meer pillen zijn, en haalt die
   rand weg via [data-at-end="true"]. Zonder initHubNavScroll() in app.js werd
   dat attribuut nooit gezet en bleef de rand permanent staan — de laatste pill
   leek weg te vallen terwijl hij volledig zichtbaar was.

   Vereist een draaiende server: BASE_URL=http://localhost:3000 node hub-nav.test.mjs */
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let failures = 0;

function ok(condition, message) {
  console.log(`${condition ? '  ✓' : '  ✗'} ${message}`);
  if (!condition) failures++;
}

const html = await (await fetch(BASE + '/')).text();
const dom = new JSDOM(html, { url: BASE + '/', runScripts: 'outside-only' });
const { window } = dom;

const strip = window.document.querySelector('.hub-nav-in');
ok(Boolean(strip), 'Homepage bevat .hub-nav-in');

/* app.js is een IIFE die bij DOMContentLoaded boot() draait; hier roepen we de
   module handmatig aan omdat jsdom geen externe scripts laadt. */
const appSource = await (await fetch(BASE + '/assets/js/app.js')).text();

ok(/function initHubNavScroll\s*\(/.test(appSource), 'app.js definieert initHubNavScroll');
ok(/\n\s*initHubNavScroll\(\);/.test(appSource), 'boot() roept initHubNavScroll aan');
ok(/data-at-end/.test(appSource), 'initHubNavScroll zet het data-at-end-attribuut dat de CSS gebruikt');

/* Scrollbare situatie naspelen: strip is smaller dan de inhoud en staat links. */
let scrollLeft = 0;
const clientWidth = 400;
const scrollWidth = 1600;
Object.defineProperty(strip, 'clientWidth', { get: () => clientWidth, configurable: true });
Object.defineProperty(strip, 'scrollWidth', { get: () => scrollWidth, configurable: true });
Object.defineProperty(strip, 'scrollLeft', {
  get: () => scrollLeft,
  set: value => { scrollLeft = value; },
  configurable: true
});

/* jsdom heeft geen fetch, maar boot() roept via loadSession() wel een API aan.
   Zonder stub crasht de hele IIFE en draait initHubNavScroll nooit. */
window.fetch = () => Promise.resolve({ ok: false, status: 401, json: async () => ({}) });
window.eval(appSource);

ok(strip.getAttribute('data-at-end') === 'false',
  `Links van het eind: data-at-end="false" (rand zichtbaar) — kreeg "${strip.getAttribute('data-at-end')}"`);

/* Naar het midden scrollen: rand moet zichtbaar blijven. */
strip.scrollLeft = 600;
strip.dispatchEvent(new window.Event('scroll'));
ok(strip.getAttribute('data-at-end') === 'false',
  `Halverwege: data-at-end blijft "false" — kreeg "${strip.getAttribute('data-at-end')}"`);

/* Helemaal naar rechts: rand moet verdwijnen. */
strip.scrollLeft = scrollWidth - clientWidth;
strip.dispatchEvent(new window.Event('scroll'));
ok(strip.getAttribute('data-at-end') === 'true',
  `Aan het eind: data-at-end="true" (rand weg) — kreeg "${strip.getAttribute('data-at-end')}"`);

/* Niet-scrollbare strip mag nooit een rand tonen. */
Object.defineProperty(strip, 'scrollWidth', { get: () => 300, configurable: true });
strip.scrollLeft = 0;
strip.dispatchEvent(new window.Event('scroll'));
ok(strip.getAttribute('data-at-end') === 'true',
  `Niet scrollbaar: data-at-end="true" (geen rand) — kreeg "${strip.getAttribute('data-at-end')}"`);

console.log(failures === 0 ? '\nHUB-NAV TEST: ALLES GROEN' : `\nHUB-NAV TEST: ${failures} faal/falen`);
process.exit(failures === 0 ? 0 : 1);
