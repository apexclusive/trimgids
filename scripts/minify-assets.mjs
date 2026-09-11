/* TrimGids — build-stap voor asset-minificatie (Fase 2).
   Minificeert de eigen CSS en JS in-place (assets/css/*.css en assets/js/*.js)
   met esbuild. De vendorde Leaflet-bestanden (assets/vendor/leaflet) worden
   bewust NIET aangeraakt: die zijn al byte-identiek aan de officiële
   leaflet/dist-build (147 KB leaflet.js is de upstream minified build).

   Waarom in-place: de server serveert assets rechtstreeks vanaf disk en de
   content-hash cache-busting (?v= uit SHA-1) leidt de versie automatisch uit de
   bestandsinhoud af. Na minificatie verandert de hash dus vanzelf, site-breed.

   Uitvoeren:  npm run build:assets
*/
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { transform } from 'esbuild';

const root = process.cwd();
const targets = [
  { dir: join(root, 'assets', 'css'), loader: 'css', ext: '.css' },
  { dir: join(root, 'assets', 'js'), loader: 'js', ext: '.js' },
];

let totalBefore = 0;
let totalAfter = 0;

for (const { dir, loader, ext } of targets) {
  for (const file of (await readdir(dir)).filter(f => f.endsWith(ext)).sort()) {
    const path = join(dir, file);
    const src = await readFile(path, 'utf8');
    const { code } = await transform(src, { loader, minify: true, charset: 'utf8', legalComments: 'inline' });
    await writeFile(path, code + '\n');
    totalBefore += src.length;
    totalAfter += code.length;
    const pct = (100 - (100 * code.length) / src.length).toFixed(1);
    console.log(`${path.replace(root + '/', '')}: ${src.length} → ${code.length} B (−${pct}%)`);
  }
}

const saved = totalBefore - totalAfter;
console.log(`\nTotaal: ${totalBefore} → ${totalAfter} B (−${saved} B, −${(100 - (100 * totalAfter) / totalBefore).toFixed(1)}%)`);
