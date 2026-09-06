#!/usr/bin/env node
/**
 * Ronde 10 — Hondenbelasting 2026: datacorrectie op basis van de beste
 * auteurlijke bron (Datawrapper-CSV van huisdierenverzekeringen.nl,
 * "Tarieven hondenbelasting 2026 per gemeente", gebaseerd op Coelo/ANP-2026)
 * Gevonden fouten in data/dog-tax.json o.a.:
 *  - Den Haag stond "actief €132" (afgeschaft per 1-1-2024);
 *  - Groningen/Drenthe stonden "actief" (niets meer geheven in 2026);
 *  - Doetinchem, Breda, Nijmegen, Arnhem etc. stonden actief (afgeschaft);
 *  - Veel tarieven waren verouderd (o.a. Tilburg 2e hond, Maastricht, Ede).
 * Resultaat: alleen de 101 heffende gemeenten blijven "actief" met de
 * exacte 2026-tarieven; alle overige worden "afgeschaft (€0)".
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'data', 'dog-tax.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
const rows = Array.isArray(data) ? data : Object.values(data);

/* gemeente (zonder haakjes-info) -> [provincie, 1e hond, 2e hond, toelichting] */
const A = [
  ['Katwijk', 'Zuid-Holland', 142.18, 142.18, 'Duurste gemeente van Nederland 2026: € 142,18 voor de eerste én tweede hond.'],
  ['Tilburg', 'Noord-Brabant', 132.28, 187.60, 'Op één na hoogste tarief van Nederland: € 132,28 voor de eerste hond (2026).'],
  ['Lisse', 'Zuid-Holland', 126.00, 198.00, 'Hoog tarief (bollenstreek): € 126,00 eerste hond; +24% t.o.v. 2025.'],
  ['Barendrecht', 'Zuid-Holland', 120.48, 165.60, 'Hoog tarief 2026: € 120,48 voor de eerste hond (-2,4% t.o.v. 2025).'],
  ['Veenendaal', 'Utrecht', 113.40, 165.80, 'Hoogste tarief van Utrecht 2026: € 113,40 voor de eerste hond.'],
  ['Oegstgeest', 'Zuid-Holland', 113.16, 142.68, 'Hoog tarief 2026: € 113,16 voor de eerste hond.'],
  ['Vlissingen', 'Zeeland', 110.91, 221.83, 'Hoogste tarief van Zeeland 2026: € 110,91 voor de eerste hond.'],
  ['Velsen', 'Noord-Holland', 110.40, 139.80, 'Hoogste tarief van Noord-Holland 2026: € 110,40 voor de eerste hond.'],
  ['Haarlem', 'Noord-Holland', 110.16, 186.48, 'Hoog tarief 2026: € 110,16 voor de eerste hond (verordening 2026).'],
  ['Westervoort', 'Gelderland', 109.43, 145.49, 'Hoogste tarief van Gelderland 2026: € 109,43 voor de eerste hond.'],
  ['s-Hertogenbosch', 'Noord-Brabant', 108.00, 162.36, 'Hoog tarief 2026: € 108,00 voor de eerste hond.'],
  ['Amersfoort', 'Utrecht', 106.50, 106.50, 'Hoog tarief 2026: € 106,50 voor de eerste én tweede hond.'],
  ['Wassenaar', 'Zuid-Holland', 104.64, 157.20, 'Hoog tarief 2026: € 104,64 voor de eerste hond.'],
  ['Wijdemeren', 'Noord-Holland', 103.44, 130.08, 'Hoog tarief 2026: € 103,44 voor de eerste hond.'],
  ['Wormerland', 'Noord-Holland', 102.45, 135.85, 'Hoog tarief 2026: € 102,45 voor de eerste hond.'],
  ['Heumen', 'Gelderland', 102.30, 102.30, 'Hoog tarief 2026: € 102,30 voor de eerste én tweede hond.'],
  ['Laren', 'Noord-Holland', 101.62, 101.62, 'Hoog tarief 2026: € 101,62 voor de eerste én tweede hond.'],
  ['Utrecht', 'Utrecht', 101.20, 101.20, 'Hoog tarief 2026: € 101,20 voor de eerste én tweede hond.'],
  ['Hoeksche Waard', 'Zuid-Holland', 100.85, 177.45, 'Hoog tarief 2026: € 100,85 voor de eerste hond.'],
  ['Enschede', 'Overijssel', 99.48, 99.48, 'Hoogste tarief van Overijssel 2026: € 99,48 voor de eerste hond.'],
  ['Nissewaard', 'Zuid-Holland', 99.22, 261.03, 'Grootste verschil 1e/2e hond van Nederland: tweede hond € 261,03.'],
  ['Druten', 'Gelderland', 97.68, 135.12, 'Hoog tarief 2026: € 97,68 voor de eerste hond.'],
  ['Vlieland', 'Friesland', 96.64, 149.98, 'Hoogste tarief van Friesland 2026: € 96,64 voor de eerste hond.'],
  ['Purmerend', 'Noord-Holland', 96.48, 96.48, 'Hoog tarief 2026: € 96,48 voor de eerste én tweede hond.'],
  ['Lansingerland', 'Zuid-Holland', 95.31, 133.53, 'Hoog tarief 2026: € 95,31 voor de eerste hond.'],
  ['Alblasserdam', 'Zuid-Holland', 95.30, 95.30, 'Hoog tarief 2026: € 95,30 voor de eerste én tweede hond.'],
  ['Eindhoven', 'Noord-Brabant', 94.00, 188.00, 'Hoog tarief 2026: € 94,00 voor de eerste hond (tweede hond het dubbele).'],
  ['Urk', 'Flevoland', 94.00, 138.00, 'Hoogste tarief van Flevoland 2026: € 94,00 voor de eerste hond.'],
  ['Gouda', 'Zuid-Holland', 93.84, 115.20, 'Hoog tarief 2026: € 93,84 voor de eerste hond.'],
  ['Wijchen', 'Gelderland', 93.50, 93.50, 'Hoog tarief 2026: € 93,50 voor de eerste én tweede hond.'],
  ['Wageningen', 'Gelderland', 91.60, 153.68, 'Hoog tarief 2026: € 91,60 voor de eerste hond.'],
  ['Tiel', 'Gelderland', 91.15, 96.35, 'Hoog tarief 2026: € 91,15 voor de eerste hond.'],
  ['Hardinxveld-Giessendam', 'Zuid-Holland', 90.40, 129.86, 'Hoog tarief 2026: € 90,40 voor de eerste hond.'],
  ['Leeuwarden', 'Friesland', 86.76, 130.08, 'Hoog tarief 2026: € 86,76 voor de eerste hond.'],
  ['Landgraaf', 'Limburg', 86.50, 181.50, 'Hoogste tarief van Limburg 2026: € 86,50 voor de eerste hond.'],
  ['Terneuzen', 'Zeeland', 86.00, 193.00, 'Hoog tarief 2026: € 86,00 voor de eerste hond (tweede hond € 193,00).'],
  ['Ouder-Amstel', 'Noord-Holland', 85.71, 85.71, 'Hoog tarief 2026: € 85,71 voor de eerste én tweede hond.'],
  ['Lelystad', 'Flevoland', 85.20, 85.20, 'Hoog tarief 2026: € 85,20 voor de eerste én tweede hond.'],
  ['Overbetuwe', 'Gelderland', 84.54, 126.82, 'Hoog tarief 2026: € 84,54 voor de eerste hond.'],
  ['Woudenberg', 'Utrecht', 84.40, 84.40, 'Hoog tarief 2026: € 84,40 voor de eerste én tweede hond.'],
  ['Eijsden-Margraten', 'Limburg', 84.00, 89.00, 'Hoog tarief 2026: € 84,00 voor de eerste hond.'],
  ['Hendrik-Ido-Ambacht', 'Zuid-Holland', 83.25, 83.25, 'Enige gemeente die de opbrengst 100% aan hondenvoorzieningen besteedt; -28% t.o.v. 2025.'],
  ['Neder-Betuwe', 'Gelderland', 82.95, 111.44, 'Hoog tarief 2026: € 82,95 voor de eerste hond.'],
  ['Scherpenzeel', 'Gelderland', 82.74, 138.78, 'Hoog tarief 2026: € 82,74 voor de eerste hond.'],
  ['Sliedrecht', 'Zuid-Holland', 82.32, 138.48, 'Hoog tarief 2026: € 82,32 voor de eerste hond.'],
  ['Baarn', 'Utrecht', 81.25, 162.65, 'Grote stijging 2026 (+15,9%): € 81,25 voor de eerste hond.'],
  ['Smallingerland', 'Friesland', 80.00, 116.00, 'Hoog tarief 2026: € 80,00 voor de eerste hond (verordening Smallingerland).'],
  ['Wijk bij Duurstede', 'Utrecht', 79.15, 130.30, 'Hondenbelasting per 1-1-2026 opnieuw ingevoerd; € 79,15 voor de eerste hond.'],
  ['Hulst', 'Zeeland', 78.80, 78.80, 'Hoog tarief 2026: € 78,80 voor de eerste én tweede hond.'],
  ['Maastricht', 'Limburg', 77.52, 111.72, 'Hoog tarief 2026: € 77,52 voor de eerste hond.'],
  ['Zwartewaterland', 'Overijssel', 76.00, 120.00, 'Hoog tarief 2026: € 76,00 voor de eerste hond.'],
  ['Helmond', 'Noord-Brabant', 75.48, 150.96, 'Hoog tarief 2026: € 75,48 voor de eerste hond (tweede hond het dubbele).'],
  ['Culemborg', 'Gelderland', 74.05, 113.50, 'Hoog tarief 2026: € 74,05 voor de eerste hond.'],
  ['Stede Broec', 'Noord-Holland', 72.31, 139.05, 'Hoog tarief 2026: € 72,31 voor de eerste hond.'],
  ['Asten', 'Noord-Brabant', 72.01, 92.95, 'Hoog tarief 2026: € 72,01 voor de eerste hond.'],
  ['Rhenen', 'Utrecht', 72.00, 180.00, 'Hoog tarief 2026: € 72,00 voor de eerste hond (tweede hond € 180,00).'],
  ['Someren', 'Noord-Brabant', 72.00, 72.00, 'Hoog tarief 2026: € 72,00 voor de eerste én tweede hond.'],
  ['Sluis', 'Zeeland', 71.10, 131.95, 'Hoog tarief 2026: € 71,10 voor de eerste hond.'],
  ['Heerlen', 'Limburg', 70.92, 229.08, 'Extreem groot verschil: eerste hond € 70,92, tweede hond € 229,08 (2026).'],
  ['Harderwijk', 'Gelderland', 69.31, 69.31, 'Hoog tarief 2026: € 69,31 voor de eerste én tweede hond.'],
  ['Alphen aan den Rijn', 'Zuid-Holland', 67.80, 102.48, 'Laagste tarief van Zuid-Holland 2026: € 67,80 voor de eerste hond.'],
  ['Mook en Middelaar', 'Limburg', 67.32, 100.92, 'Hoog tarief 2026: € 67,32 voor de eerste hond.'],
  ['Lopik', 'Utrecht', 67.00, 83.75, 'Hoog tarief 2026: € 67,00 voor de eerste hond.'],
  ['Gemert-Bakel', 'Noord-Brabant', 66.84, 66.84, 'Hoog tarief 2026: € 66,84 voor de eerste én tweede hond.'],
  ['Gennep', 'Limburg', 66.48, 93.60, 'Hoog tarief 2026: € 66,48 voor de eerste hond.'],
  ['Waterland', 'Noord-Holland', 66.12, 90.60, 'Hoog tarief 2026: € 66,12 voor de eerste hond.'],
  ['Deurne', 'Noord-Brabant', 63.73, 63.73, 'Hoog tarief 2026: € 63,73 voor de eerste én tweede hond.'],
  ['Gilze en Rijen', 'Noord-Brabant', 60.82, 121.64, 'Hoog tarief 2026: € 60,82 voor de eerste hond (tweede hond het dubbele).'],
  ['Waalwijk', 'Noord-Brabant', 60.75, 88.05, 'Hoog tarief 2026: € 60,75 voor de eerste hond.'],
  ['Barneveld', 'Gelderland', 60.70, 84.00, 'Hoog tarief 2026: € 60,70 voor de eerste hond.'],
  ['Oost Gelre', 'Gelderland', 60.66, 94.12, 'Hoog tarief 2026: € 60,66 voor de eerste hond.'],
  ['Zaltbommel', 'Gelderland', 60.04, 79.71, 'Hoog tarief 2026: € 60,04 voor de eerste hond.'],
  ['Kampen', 'Overijssel', 60.00, 60.00, 'Grote verlaging 2026 (-20%): € 60,00 voor de eerste én tweede hond.'],
  ['Heusden', 'Noord-Brabant', 59.40, 87.12, 'Hoog tarief 2026: € 59,40 voor de eerste hond.'],
  ['Doesburg', 'Gelderland', 58.80, 87.70, 'Hoog tarief 2026: € 58,80 voor de eerste hond.'],
  ['Geldrop-Mierlo', 'Noord-Brabant', 57.60, 57.60, 'Hoog tarief 2026: € 57,60 voor de eerste én tweede hond.'],
  ['Soest', 'Utrecht', 56.50, 77.00, 'Hoog tarief 2026: € 56,50 voor de eerste hond.'],
  ['Maasgouw', 'Limburg', 54.00, 81.00, 'Hoog tarief 2026: € 54,00 voor de eerste hond.'],
  ['Oostzaan', 'Noord-Holland', 51.70, 51.70, 'Hoog tarief 2026: € 51,70 voor de eerste én tweede hond.'],
  ['Veldhoven', 'Noord-Brabant', 51.50, 51.50, 'Hoog tarief 2026: € 51,50 voor de eerste én tweede hond.'],
  ['Staphorst', 'Overijssel', 50.85, 101.25, 'Hoog tarief 2026: € 50,85 voor de eerste hond (tweede hond het dubbele).'],
  ['Echt-Susteren', 'Limburg', 50.52, 75.00, 'Hoog tarief 2026: € 50,52 voor de eerste hond.'],
  ['Nijkerk', 'Gelderland', 50.40, 88.80, 'Hoog tarief 2026: € 50,40 voor de eerste hond.'],
  ['Sittard-Geleen', 'Limburg', 47.76, 64.32, 'Hondenbelasting 2026: € 47,76 voor de eerste hond.'],
  ['Loon op Zand', 'Noord-Brabant', 47.53, 68.56, 'Grote stijging 2026 (+11,2%): € 47,53 voor de eerste hond.'],
  ['Vaals', 'Limburg', 45.54, 45.54, 'Hondenbelasting 2026: € 45,54 voor de eerste én tweede hond.'],
  ['Ede', 'Gelderland', 45.48, 67.20, 'Hondenbelasting 2026: € 45,48 voor de eerste hond.'],
  ['Maasdriel', 'Gelderland', 45.00, 45.00, 'Hondenbelasting 2026: € 45,00 voor de eerste én tweede hond.'],
  ['West Maas en Waal', 'Gelderland', 44.21, 88.43, 'Grote stijging 2026 (+10%): € 44,21 voor de eerste hond.'],
  ['Etten-Leur', 'Noord-Brabant', 42.36, 68.16, 'Hondenbelasting 2026: € 42,36 voor de eerste hond.'],
  ['Rheden', 'Gelderland', 41.29, 47.53, 'Hondenbelasting 2026: € 41,29 voor de eerste hond.'],
  ['Beesel', 'Limburg', 40.00, 55.00, 'Hondenbelasting 2026: € 40,00 voor de eerste hond.'],
  ['Apeldoorn', 'Gelderland', 39.62, 55.46, 'Hondenbelasting 2026: € 39,62 voor de eerste hond (verordening 2026).'],
  ['Brunssum', 'Limburg', 39.60, 159.60, 'Groot verschil: eerste hond € 39,60, tweede hond € 159,60 (2026).'],
  ['Oosterhout', 'Noord-Brabant', 36.00, 72.00, 'Hondenbelasting 2026: € 36,00 voor de eerste hond (tweede hond het dubbele).'],
  ['Venlo', 'Limburg', 31.32, 46.92, 'Sterke verlaging 2026 (-28,5%). Wordt afgeschaft per 2027.'],
  ['Rijssen-Holten', 'Overijssel', 31.00, 47.00, 'Hondenbelasting 2026: € 31,00 voor de eerste hond.'],
  ['Buren', 'Gelderland', 29.00, 29.00, 'Op één na laagste actieve tarief: € 29,00 per hond; afschaffing gepland per 2030.'],
  ['Simpelveld', 'Limburg', 21.96, 25.68, 'Goedkoopste actieve gemeente van Nederland 2026: € 21,96 voor de eerste hond.'],
  ['Kerkrade', 'Limburg', 0.00, 115.00, 'Eerste hond gratis (€ 0,00); tweede hond € 115,00 in 2026.'],
  ['Valkenburg aan de Geul', 'Limburg', 0.00, 96.84, 'Eerste hond gratis (€ 0,00); tweede hond € 96,84 in 2026.']
];

/* Afgeschaft per 2026 (12 gemeenten, Coelo/ANP) — ook al staan ze in het oude bestand als actief. */
const ABOLISHED_2026 = ['Aalten', 'Beuningen', 'Lingewaard', 'Montferland', 'Meerssen', 'Woensdrecht', 'Hoorn', 'Opmeer', 'Hengelo', 'De Bilt', 'Eemnes', 'Utrechtse Heuvelrug'];

const byName = new Map();
for (const r of rows) {
  const key = r.gemeente.split(' (')[0].replace(/'/g, '').trim().toLowerCase();
  if (!byName.has(key)) byName.set(key, r);
}
const norm = s => s.toLowerCase().replace(/'/g, '').trim();

let applied = 0, notFound = [], fixedText = 0;
for (const [name, prov, t1, t2, note] of A) {
  const r = byName.get(norm(name));
  if (!r) { notFound.push(name); continue; }
  r.status = (t1 > 0) ? 'actief' : 'actief';
  r.tarief1eHond = t1;
  r.tarief2eHond = t2;
  r.provincie = prov;
  r.toelichting = note;
  applied++;
}

/* Alles wat NIET in de auteurlijke actieve lijst staat → afgeschaft (0/0). */
const actives = new Set(A.map(x => norm(x[0])));
let flipped = 0;
for (const r of rows) {
  const key = norm(r.gemeente.split(' (')[0]);
  if (actives.has(key) || r.status !== 'actief') continue;
  r.status = 'afgeschaft';
  r.tarief1eHond = 0;
  r.tarief2eHond = 0;
  r.toelichting = 'Hondenbelasting volledig afgeschaft (€ 0,-) — in 2026 wordt hier geen hondenbelasting geheven.';
  flipped++;
}

/* Corrigeer de 12 in 2026 afgeschafte gemeenten (ook eventueel 'actief'). */
for (const name of ABOLISHED_2026) {
  const r = byName.get(norm(name));
  if (!r) { notFound.push(name + ' (afgeschaft)'); continue; }
  r.status = 'afgeschaft';
  r.tarief1eHond = 0;
  r.tarief2eHond = 0;
  if (!r.toelichting.includes('afgeschaft')) r.toelichting = 'Hondenbelasting per 2026 afgeschaft (€ 0,-).';
  fixedText++;
}

/* Los de 3 corrupte toelichtingen op. */
for (const name of ['Buren', 'Simpelveld', 'Lisse']) {
  const r = byName.get(norm(name));
  if (r && r.toelichting.includes('volledig afgeschaft')) r.toelichting = A.find(x => norm(x[0]) === norm(name))[3];
}

writeFileSync(file, JSON.stringify(rows, null, 2));
const active = rows.filter(x => x.status === 'actief');
const avg = active.length ? active.reduce((s, x) => s + x.tarief1eHond, 0) / active.length : 0;
console.log('toegepaste 2026-tarieven:', applied);
console.log('omgezet naar afgeschaft:', flipped);
console.log('afschaffing per 2026 gecorrigeerd:', fixedText);
console.log('niet gevonden:', notFound);
console.log(`resultaat: ${rows.length} gemeenten | actief: ${active.length} | gemiddelde 1e hond: €${avg.toFixed(2)}`);
if (notFound.length) process.exitCode = 1;
