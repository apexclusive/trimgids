import { JSDOM } from 'jsdom';
const html = await (await fetch('http://localhost:3000/hondengedrag')).text();
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, url: 'http://localhost:3000/hondengedrag' });
const d = dom.window.document;
let pass = 0, fail = 0;
const t = (ok, name) => { if (ok) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };

t(d.querySelectorAll('.pet-chip').length === 4, '4 aai-zones');
t(d.querySelector('#pet-title').textContent.includes('Borst'), 'default zone = borst');

const chip = d.querySelector('.pet-chip[data-zone="buik"]');
chip.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(d.querySelector('#pet-title').textContent.includes('kwetsbaar'), 'klik buikje -> kwetsbaar vertrouwen');
t(chip.classList.contains('on'), 'chip actief');
t(d.querySelectorAll('.pet-sign').length === 4, '4 signalen in paneel');

const tab = d.querySelector('.bl-tab[data-bl="hoofd"]');
tab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(d.querySelector('[data-bl-view="hoofd"]').hidden === false, 'hoofd-tab zichtbaar');
t(d.querySelector('[data-bl-view="staart"]').hidden === true, 'staart verborgen');
t(d.querySelectorAll('[data-bl-view="hoofd"] .bl-tile').length === 4, '4 hoofdsignalen');

const ld = JSON.parse(Array.from(d.querySelectorAll('script[type="application/ld+json"]')).map(x => x.textContent).find(x => x.includes('FAQPage')));
t(ld.mainEntity.length === 3, '3 FAQ JSON-LD');
t(html.includes('k-wolf-hond-960.webp'), 'wolf-foto geladen');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
