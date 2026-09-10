/* Bewaakt dat elke fout die server.mjs bewust gooit, geclassificeerd is als
   clientfout (400) of als serverfout (502).

   Aanleiding: de clientErrors-lijst in de catch-blok was verouderd. Zeven
   validatiefouten stonden er niet in en vielen daardoor op de 502-fallback.
   Gemeten: POST /api/vacatures met een onbekende branch gaf
   502 {"error":"invalid_branch"} in plaats van 400 — een formulier dat een
   verkeerde provincie of te korte omschrijving stuurt kreeg "bad gateway"
   terwijl het een gewone validatiefout was.

   Deze check voorkomt dat de lijst opnieuw stilletjs veroudert: wie een nieuwe
   `throw new Error('...')` toevoegt, moet hier bewust een keuze maken.

   Vereist geen draaiende server: node check-error-status.mjs */
import { readFileSync, readdirSync } from 'node:fs';

const source = readFileSync(new URL('./server.mjs', import.meta.url), 'utf8');

/* Fouten worden ook vanuit pages/ gegooid (bijv. supporter_invalid_fields in
   pages/steun.mjs), dus die map meescannen — anders meldt deze check onterecht
   dat zo'n entry verouderd is. */
const sources = [source];
for (const entry of readdirSync(new URL('./pages', import.meta.url))) {
  if (entry.endsWith('.mjs')) sources.push(readFileSync(new URL(`./pages/${entry}`, import.meta.url), 'utf8'));
}
const allSource = sources.join('\n');

const thrown = new Set(
  [...allSource.matchAll(/throw new Error\('([a-z_]+)'\)/g)].map(m => m[1])
);

const listMatch = source.match(/const clientErrors = \[([\s\S]*?)\];/);
if (!listMatch) {
  console.log('  ✗ clientErrors-lijst niet gevonden in server.mjs');
  process.exit(1);
}
const clientErrors = new Set([...listMatch[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]));

/* Fouten die bewust 502 mogen blijven: onverwachte toestand, geen
   gebruikersinvoer die dit kan veroorzaken. */
const SERVER_ERRORS = new Set([]);

let problems = 0;

const unclassified = [...thrown].filter(name => !clientErrors.has(name) && !SERVER_ERRORS.has(name)).sort();
for (const name of unclassified) {
  problems++;
  console.log(`  ✗ '${name}' wordt gegooid maar is niet geclassificeerd -> valt op 502`);
}

const stale = [...clientErrors].filter(name => !thrown.has(name)).sort();
for (const name of stale) {
  problems++;
  console.log(`  ! '${name}' staat in clientErrors maar wordt nergens gegooid (verouderd)`);
}

console.log(`\n${thrown.size} gegooide fouten, ${clientErrors.size} in clientErrors`);
if (problems) {
  console.log(`RESULTAAT: ${problems} probleem(en) in de foutclassificatie`);
  process.exit(1);
}
console.log('RESULTAAT: elke gegooide fout is bewust als 400 of 502 geclassificeerd');
