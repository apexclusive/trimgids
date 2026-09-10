/* Valideert elk inline <script> van elke geserveerde pagina met node --check.

   Aanleiding: op /puppies stond in de bron  ' foto\'s voor dit pakket.'
   binnen een template literal. In een template literal is \' een no-op escape,
   dus de uitgeserveerde JS bevatte een kale apostrof in een single-quoted
   string: SyntaxError. Gevolg: het hele inline script viel uit en dialoog,
   filters, favorieten en het uploadformulier werkten niet — in elke browser.

   Dit soort fouten zie je niet met een rooktest (de pagina geeft 200) en ook
   niet met node --check op de .mjs-bron (die is zelf wel geldig). Alleen de
   GERENDERDE output vangt het. */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ROUTES = ['/', '/puppies', '/forum', '/trimsalon', '/rassen', '/dogpedia', '/zoeken',
  '/nieuws', '/verzekering', '/hondenbelasting', '/bedrijven', '/aankoopgids', '/adoptie',
  '/anatomie-hond', '/hondengedrag', '/vacatures', '/webshop', '/wandelen', '/opvang',
  '/hondenschool', '/kosten-hond', '/claim', '/fokkers', '/reizen', '/verboden-rassen',
  '/spoed-dierenarts', '/voeding', '/dna-test', '/producten', '/offerte', '/last-minute',
  '/vermist', '/steun', '/zintuigen', '/geschiedenis-hond', '/hulphonden', '/vrijwilligers',
  '/hond-gevonden', '/poepzakjes', '/hondenweetjes', '/hondenwedstrijden', '/chippen-ontwormen',
  '/braken-hond', '/hitteberoerte-hond', '/zwerfhonden', '/koninklijke-honden', '/honden-cijfers',
  '/privacy', '/cookies', '/voorwaarden', '/kaart', '/trimsalon/maastricht', '/trimkosten'];

const dir = mkdtempSync(join(tmpdir(), 'tg-js-'));
let checkedScripts = 0, badScripts = 0, badPages = 0;

for (const route of ROUTES) {
  let html;
  try { const res = await fetch(BASE + route); if (res.status !== 200) continue; html = await res.text(); } catch { continue; }

  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
  let pageBad = 0;
  for (const [i, m] of scripts.entries()) {
    const attrs = m[1] || '';
    // JSON-LD is geen JavaScript — overslaan
    if (/application\/ld\+json/i.test(attrs)) continue;
    const code = m[2];
    if (!code.trim()) continue;
    checkedScripts++;
    const file = join(dir, `p${ROUTES.indexOf(route)}_${i}.js`);
    writeFileSync(file, code);
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (err) {
      badScripts++; pageBad++;
      const msg = String(err.stderr || err.message).split('\n').find(l => /SyntaxError|Error:/.test(l)) || 'onbekende fout';
      // vind de regel in kwestie
      const lineMatch = String(err.stderr || '').match(/:(\d+)\n/);
      console.log(`✗ ${route} · inline script #${i}: ${msg.trim()}`);
      if (lineMatch) {
        const ln = +lineMatch[1];
        const line = code.split('\n')[ln - 1] || '';
        console.log(`   regel ${ln}: ${line.trim().slice(0, 150)}`);
      }
    }
  }
  if (pageBad) badPages++;
}

console.log(`\n${checkedScripts} inline scripts gecontroleerd op ${ROUTES.length} routes`);
console.log(badScripts
  ? `RESULTAAT: ${badScripts} kapot(te) script(s) op ${badPages} pagina(s) — de JS op die pagina's doet helemaal niets`
  : 'RESULTAAT: alle inline scripts syntactisch geldig');
process.exit(badScripts ? 1 : 0);
