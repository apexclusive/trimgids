import { JSDOM } from 'jsdom';
const html = await (await fetch('http://localhost:3000/hondenanatomie')).text();
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, url: 'http://localhost:3000/hondenanatomie' });
const d = dom.window.document;
let pass = 0, fail = 0;
const t = (ok, name) => { if (ok) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };

t(d.querySelectorAll('.anat-hotspot').length === 12, '12 hotspots in SVG-stadium');
t(d.querySelectorAll('.anat-chip').length === 12, '12 chip-knoppen');
t(d.querySelector('#anat-title').textContent.includes('Hersenen'), 'start-info = hersenen');

// klik op maag-hotspot
const spot = d.querySelector('.anat-hotspot[data-organ="maag"]');
spot.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: true }));
t(d.querySelector('#anat-title').textContent.includes('pH'), 'hover maag -> titel pH');
t(spot.classList.contains('active'), 'hover markeert hotspot');

// klik op chip
const chip = d.querySelector('.anat-chip[data-organ="nieren"]');
chip.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(d.querySelector('#anat-title').textContent.includes('filter'), 'klik nieren-chip -> titel filter');
t(chip.getAttribute('aria-pressed') === 'true', 'aria-pressed gezet');

// keyboard
const ev = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
d.dispatchEvent(ev);
t(d.querySelector('#anat-title').textContent.length > 0, 'pijltje toont volgend orgaan');

// FAQ JSON-LD
const ldScripts = d.querySelectorAll('script[type="application/ld+json"]');
const ld = JSON.parse(Array.from(ldScripts).map(x => x.textContent).find(t => t.includes('FAQPage')));
t(ld.mainEntity.length === 3, '3 FAQ-vragen in JSON-LD');

// klik hotspot zelf
const heart = d.querySelector('.anat-hotspot[data-organ="hart"]');
heart.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(d.querySelector('#anat-title').textContent.includes('70–120'), 'klik hart -> 70-120 slagen');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
