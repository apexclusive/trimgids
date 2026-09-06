import { JSDOM } from 'jsdom';
const html = await (await fetch('http://localhost:3000/hondenschool')).text();
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, url: 'http://localhost:3000/hondenschool' });
const d = dom.window.document;
let pass = 0, fail = 0;
const t = (ok, name) => { if (ok) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };

t(d.querySelectorAll('.dir-tab').length === 2, '2 dir-tabs');
t(d.querySelector('#pane-explore').classList.contains('is-on'), 'explore pane actief default');
t(d.querySelector('#pane-list').hasAttribute('hidden'), 'list pane verborgen (js init)');
t(d.querySelectorAll('.dir-mini-grid .pc-card').length === 6, '6 mini-cards');
const all = d.querySelectorAll('#dir-grid .pc-card').length;
t(all === 36, `36 kaarten in volledige lijst (${all})`);
t(html.indexOf('data-nl-map') < html.indexOf('id="dir-grid"'), 'map vóór de lijst in HTML');

const showAll = d.getElementById('dir-show-all');
showAll.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(!d.querySelector('#pane-list').hasAttribute('hidden'), 'klik "toon alle" -> lijst paneel zichtbaar');
t(!d.querySelector('#pane-explore').classList.contains('is-on'), 'explore pane uit');

const tabExplore = d.getElementById('tab-explore');
tabExplore.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
t(d.querySelector('#pane-explore').classList.contains('is-on'), 'terug naar kaart werkt');
t(d.querySelector('#pane-list').hasAttribute('hidden'), 'lijst weer verborgen');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
