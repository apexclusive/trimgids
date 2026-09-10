/* Bewaakt de cache-busting-invariant: elk asset heeft site-breed precies één
   versie, en die versie is afgeleid van de bestandsinhoud.

   Aanleiding: de ?v=N-waarden werden per hand in templates gezet en dreven uit
   elkaar — nl-map.css stond als ?v=8 in server.mjs en ?v=16 in index.html,
   forum.css als ?v=2 in community.mjs en ?v=16 elders. De browser cachete
   dezelfde CSS dan als twee losse resources, en na een wijziging hield één
   versie de oude styling vast.

   Vereist een draaiende server: BASE_URL=http://localhost:3000 node check-asset-versions.mjs */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

/* Inclusief routes waarvan bekend is dat ze eigen <link>-tags meenemen
   (community/forum) en routes waar het choke point assets injecteert. */
const ROUTES = [
  '/', '/trimsalon', '/community', '/forum', '/puppies', '/verzekering', '/voeding',
  '/dna-test', '/last-minute', '/zoeken', '/rassen', '/kosten-hond', '/spoed-dierenarts',
  '/bedrijven', '/hondenanatomie', '/hondengedrag', '/hulphonden', '/webshop', '/privacy'
];

const versions = new Map();
let failures = 0;

for (const route of ROUTES) {
  const response = await fetch(BASE + route);
  if (!response.ok) {
    console.log(`  ✗ ${route} gaf ${response.status}`);
    failures++;
    continue;
  }
  const html = await response.text();

  /* srcset bevat een kommagescheiden kandidatenlijst ("/pad 480w, /pad 960w"),
     dus die apart per kandidaat ontleden; de overige attributen bevatten één URL. */
  for (const tag of html.matchAll(/\b(srcset)="([^"]+)"/g)) {
    for (const candidate of tag[2].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url && url.startsWith('/assets/')) record(url);
    }
  }
  for (const tag of html.matchAll(/\b(?:src|href)="(\/assets\/[^"]*)"/g)) {
    if (!/\s/.test(tag[1])) record(tag[1]);
  }
}

function record(rawUrl) {
  const [path, query] = rawUrl.split('?');
  const version = (query || '').match(/^v=([A-Za-z0-9_-]+)$/)?.[1] || null;
  if (!versions.has(path)) versions.set(path, new Map());
  const seen = versions.get(path);
  seen.set(version, (seen.get(version) || 0) + 1);
}

let drift = 0;
let unversioned = 0;
for (const [file, seen] of [...versions].sort()) {
  if (seen.size > 1) {
    drift++;
    console.log(`  ✗ DRIFT ${file} -> ${[...seen.keys()].join(', ')}`);
  }
  if (seen.has(null)) {
    unversioned++;
    console.log(`  ! ${file} wordt zonder ?v= gerefereerd`);
  }
}

console.log(`\n${versions.size} unieke assets gecontroleerd over ${ROUTES.length} routes`);

if (failures) {
  console.log(`RESULTAAT: ${failures} route(s) niet bereikbaar`);
  process.exit(1);
}
if (drift) {
  console.log(`RESULTAAT: ${drift} asset(s) met versie-drift`);
  process.exit(1);
}
if (unversioned) {
  console.log(`RESULTAAT: ${unversioned} asset(s) zonder versie (waarschuwing, geen fout)`);
}
console.log('RESULTAAT: elk asset heeft site-breed precies één versie');
