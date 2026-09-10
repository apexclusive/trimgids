/* Zelf hosten van de TrimGids-lettertypes.

   Waarom: de site laadt Plus Jakarta Sans en Sora van fonts.googleapis.com.
   Daarmee gaat het IP-adres van élke bezoeker naar Google, vóórdat de pagina
   rendert. Voor een Nederlandse site is dat AVG-gevoelig, en het kost bovendien
   twee render-blocking rondes naar een derde partij.

   Dit script downloadt de woff2-bestanden, subset ze niet (Google levert al
   latin-subsets) en schrijft een kant-en-klare @font-face-stylesheet naar
   assets/css/fonts.css. Draai het op een machine mét internettoegang:

       node scripts/selfhost-fonts.mjs

   Daarna is er geen externe font-aanvraag meer nodig. Zolang assets/css/fonts.css
   nog niet bestaat, blijft de site terugvallen op Google Fonts — er breekt dus
   niets als je het script nog niet draait.

   We laten bewust gewicht 500 weg: dat komt op de hele site maar 2× voor en
   400 slechts 8×, tegenover 800 (71×) en 700 (32×). Minder bestanden = sneller. */

import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'assets', 'fonts');
const outCss = join(root, 'assets', 'css', 'fonts.css');

// family, CSS-naam, gewichten, en of het een display-lettertype is
const FAMILIES = [
  { css: 'Plus+Jakarta+Sans', name: 'Plus Jakarta Sans', weights: [400, 600, 700, 800], dir: 'plus-jakarta-sans' },
  { css: 'Sora', name: 'Sora', weights: [600, 700, 800], dir: 'sora' }
];

// Google serveert per user-agent een ander formaat; deze UA krijgt woff2.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchCss(family) {
  const url = `https://fonts.googleapis.com/css2?family=${family.css}:wght@${family.weights.join(';')}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Google Fonts CSS ${res.status} voor ${family.name}`);
  return res.text();
}

const blocks = [];
let total = 0;

for (const family of FAMILIES) {
  const css = await fetchCss(family);
  // Elk @font-face-blok bevat een src: url(...) naar een woff2 met een unicode-range.
  const faces = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)];
  if (!faces.length) throw new Error(`Geen @font-face gevonden voor ${family.name}`);

  let n = 0;
  for (const face of faces) {
    const body = face[1];
    const src = /url\((https:\/\/[^)]+\.woff2)\)/.exec(body);
    if (!src) continue; // geen woff2 (bijv. ttf-fallback) — overslaan
    const weight = /font-weight:\s*(\d+)/.exec(body)?.[1] || '400';
    const style = /font-style:\s*([a-z-]+)/.exec(body)?.[1] || 'normal';
    const range = /unicode-range:\s*([^;]+)/.exec(body)?.[1]?.trim();

    const file = `${family.dir}-${weight}-${style}-${n}.woff2`;
    const buf = Buffer.from(await (await fetch(src[1])).arrayBuffer());
    await writeFile(join(outDir, file), buf);
    total += buf.length;
    n++;

    blocks.push(`@font-face {
  font-family: '${family.name}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('/assets/fonts/${file}') format('woff2');${range ? `\n  unicode-range: ${range};` : ''}
}`);
  }
  console.log(`  ${family.name}: ${n} bestanden`);
}

await mkdir(outDir, { recursive: true });
await writeFile(outCss, `/* Automatisch gegenereerd door scripts/selfhost-fonts.mjs — niet met de hand bewerken.
   Zelf-gehoste lettertypes: geen externe aanvraag naar fonts.gstatic.com meer,
   dus geen IP-doorgifte aan Google en één ronde minder vóór de eerste paint. */
${blocks.join('\n\n')}
`);

console.log(`\n${blocks.length} @font-face-blokken, ${(total / 1024).toFixed(0)} KB totaal.`);
console.log('Geschreven naar assets/css/fonts.css en assets/fonts/');
console.log('\nVolgende stap: in index.html, pages/base.mjs en pages/chrome.mjs de');
console.log('Google Fonts <link> vervangen door <link rel="stylesheet" href="/assets/css/fonts.css">.');
