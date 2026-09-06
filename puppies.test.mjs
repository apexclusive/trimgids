// Ronde 15 — PuppyMarktplaats UI-test (jsdom): filters en detail-dialog zijn
// progressive enhancement en werken zonder browser-API's als matchMedia.
import { JSDOM } from 'jsdom';

const html = await (await fetch('http://localhost:3000/puppies')).text();
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, url: 'http://localhost:3000/puppies' });
const { document } = dom.window;
let pass = 0, fail = 0;
const t = (ok, name) => { if (ok) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
const visible = () => Array.from(document.querySelectorAll('.pm-card')).filter(c => !c.hidden).length;

await new Promise(r => setTimeout(r, 50));

// basis
t(document.querySelectorAll('.pm-card').length === 12, '12 nesten zonder JS gerenderd (SSR)');

// ras-filter (bekende bug: slug-matching)
const breedSel = document.querySelector('#pm-breed');
breedSel.value = 'labrador-retriever';
breedSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
t(visible() === 4, 'filter Labrador Retriever -> 4 nesten');
t(document.querySelector('#pm-count').textContent.includes('4'), 'teller = 4');

// provincie-filter
const provSel = document.querySelector('#pm-prov');
provSel.value = 'Gelderland';
breedSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
t(visible() === 2, '+ provincie Gelderland -> 2 nesten');

// zoekveld
const q = document.querySelector('#pm-q');
q.value = 'Epe';
q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
t(visible() === 1, 'zoekterm Epe -> 1 nest');

// combi reset + detail-dialog
breedSel.value = ''; breedSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
provSel.value = ''; provSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
q.value = ''; q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
t(visible() === 12, 'filters wissen -> 12 nesten');

const card = document.querySelector('.pm-card');
card.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
await new Promise(r => setTimeout(r, 50));
t(!document.querySelector('#pm-dialog').hidden, 'klik op kaart opent detail-dialog');
t(Number(document.querySelector('#pm-dialog-title').textContent.length) > 5, 'dialoog toont titel');
t(document.querySelector('#pm-dialog-checks').children.length > 0, 'dialoog toont gezondheidschecks');

// sluiten via ESC
document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await new Promise(r => setTimeout(r, 300));
t(document.querySelector('#pm-dialog').hidden, 'ESC sluit dialoog');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
