/* Bewaakt <picture>-opmaak: het type-attribuut van een <source> moet
   overeenkomen met het werkelijke bestandsformaat in de srcset, en elke
   <picture> moet een <img>-fallback hebben.

   Aanleiding: in index.html stonden drie <source type="image/avif"> waarvan de
   srcset naar .webp-bestanden wees (de .avif-varianten bestonden niet). Een
   browser die AVIF ondersteunt kiest die source en krijgt dan WebP-bytes — de
   bandbreedtebesparing van AVIF ging verloren en de opmaak loog over de inhoud.

   Vereist een draaiende server: BASE_URL=http://localhost:3000 node check-picture.mjs */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES = ['/', '/puppies', '/rassen', '/trimsalon', '/webshop', '/hondenanatomie', '/kosten-hond'];

let sources = 0;
let problems = 0;

/* srcset-kandidaten dragen een ?v= cache-buster, dus die eraf halen voordat
   de extensie wordt bepaald — anders lees je "webp?v=abc" als extensie. */
function extensionOf(url) {
  const path = url.split('?')[0].split('#')[0];
  const dot = path.lastIndexOf('.');
  return dot === -1 ? '' : path.slice(dot + 1).toLowerCase();
}

for (const route of ROUTES) {
  const response = await fetch(BASE + route);
  if (!response.ok) {
    console.log(`  ✗ ${route} gaf ${response.status}`);
    problems++;
    continue;
  }
  const html = await response.text();

  for (const match of html.matchAll(/<source type="image\/([a-z]+)" srcset="([^"]+)"/g)) {
    const declared = match[1];
    const files = match[2].split(',').map(candidate => candidate.trim().split(/\s+/)[0]).filter(Boolean);
    const extensions = new Set(files.map(extensionOf));
    sources++;
    if (extensions.size === 1 && extensions.has(declared)) continue;
    problems++;
    console.log(`  ✗ ${route}: type="image/${declared}" maar srcset bevat .${[...extensions].join(', .')}`);
  }

  for (const match of html.matchAll(/<picture>([\s\S]*?)<\/picture>/g)) {
    if (!/<img\b/.test(match[1])) {
      problems++;
      console.log(`  ✗ ${route}: <picture> zonder <img>-fallback (renderd niets zonder picture-ondersteuning)`);
    }
  }
}

console.log(`\n${sources} <source>-elementen gecontroleerd over ${ROUTES.length} routes`);
if (problems) {
  console.log(`RESULTAAT: ${problems} probleem(en) in picture-opmaak`);
  process.exit(1);
}
console.log('RESULTAAT: elk source-type komt overeen met het bestandsformaat, elke <picture> heeft een fallback');
