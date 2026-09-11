/* TrimGids — versioneert de @font-face src-url's in fonts.css met dezelfde
   content-hash als de server-runtime (?v= uit SHA-1, base64url, 8 tekens).

   Waarom: de site serveert elk immutable asset onder een inhoudsgebaseerde
   ?v=-versie, zodat een gewijzigd bestand automatisch een nieuwe URL krijgt en
   de 1-jaar-cache nooit een verouderd bestand vasthoudt. De lettertypes waren
   daarop de uitzondering: fonts.css verwees ze versieloos, dus (a) zouden ze
   bij immutable caching nooit meer verversen en (b) kwamen de kritieke
   font-preloads in de HTML niet overeen met de @font-face-url — met een
   dubbele download tot gevolg. Dit script sluit die uitzondering:

   - fonts.css krijgt src: url(/assets/fonts/<f>.woff2?v=<sha1>)
   - de server injecteert dezelfde ?v= via assetUrl() (zelfde algoritme),
     dus preload en stylesheet matchen byte-voor-byte.
   - als een woff2 wijzigt, wijzigt fonts.css mee (nieuwe hash in de src),
     waardoor de fonts.css-versie verandert en de hele keten vernieuwt.

   Uitvoeren:  npm run build:assets  (na minificatie).
*/
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = process.cwd();
const cssPath = join(root, 'assets', 'css', 'fonts.css');

const css = readFileSync(cssPath, 'utf8');

let matched = 0;
let missing = 0;

const versioned = css.replace(/url\((['"]?)(\/assets\/fonts\/[^'")\s?]+\.woff2)\1\)/g, (whole, quote, fontRef) => {
  const file = fontRef.split('/').pop();
  let hash;
  try {
    hash = createHash('sha1')
      .update(readFileSync(join(root, 'assets', 'fonts', file)))
      .digest('base64url')
      .slice(0, 8);
  } catch {
    missing++;
    return whole; // bestand bestaat niet: ongemoeid laten (verbroken pad blijft zichtbaar)
  }
  matched++;
  return `url(${quote}${fontRef}?v=${hash}${quote})`;
});

await writeFile(cssPath, versioned);
console.log(`fonts.css: ${matched} font-url('s) ge-versioned${missing ? `, ${missing} gemist (bestand ontbreekt)` : ''}`);
