/* Bewaakt dat de hub-navigatie op de homepage en op gegenereerde pagina's
   identiek is:zelfde items, zelfde labels, zelfde iconen, zelfde volgorde.

   Aanleiding: de navigatie bestaat in twee losse implementaties — index.html
   (statische homepage) en pages/chrome.mjs (shell voor alle gegenereerde
   pagina's). Die waren uit elkaar gedreven:
     - index.html had 18 pills, chrome.mjs 17 ("Voor baasjes" ontbrak)
     - drie labels verschilden: "Eerste hulp & cijfers" vs "& feiten",
       "Nood & vermist" vs "Noodhulp & vermist", "Actueel" vs "Nieuws"
     - posities 4 en 5 waren omgewisseld
   Gevolg: dezelfde navigatie toonde andere namen en een ander aantal items
   afhankelijk van de pagina waarop je was.

   De enige bedoelde verschillen zijn de href-vorm (een anker is "#x" op de
   homepage en "/#x" elders, omdat die pills daar naar een homepage-sectie
   wijzen) en de 'active'-klasse, die alleen op de homepage in de markup staat
   en elders door app.js per route wordt gezet.

   Vereist een draaiende server: BASE_URL=http://localhost:3000 node check-nav-consistency.mjs */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

function parsePills(html) {
  return [...html.matchAll(/<a href="([^"]*)" class="hub-pill(?: active)?">([\s\S]*?)<\/a>/g)].map(m => ({
    href: m[1],
    icon: (m[2].match(/use href="([^"]*)"/) || [])[1] || '',
    text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }));
}

/* "#x" en "/#x" zijn hetzelfde doel, alleen geschreven vanaf een andere pagina. */
const normalize = href => (href.startsWith('/#') ? href.slice(1) : href);

const pages = ['/', '/trimsalon', '/puppies', '/verzekering', '/forum'];
const reference = parsePills(await (await fetch(BASE + '/')).text());

let problems = 0;

if (reference.length === 0) {
  console.log('  ✗ homepage bevat geen hub-pills');
  process.exit(1);
}
console.log(`homepage: ${reference.length} pills (referentie)`);

for (const route of pages.slice(1)) {
  const pills = parsePills(await (await fetch(BASE + route)).text());
  if (pills.length !== reference.length) {
    problems++;
    console.log(`  ✗ ${route}: ${pills.length} pills, verwacht ${reference.length}`);
  }
  for (let i = 0; i < Math.max(pills.length, reference.length); i++) {
    const expected = reference[i];
    const actual = pills[i];
    if (!expected || !actual) continue;
    if (normalize(expected.href) !== normalize(actual.href)) {
      problems++;
      console.log(`  ✗ ${route} pill ${i + 1}: href "${actual.href}", verwacht "${expected.href}"`);
    }
    if (expected.text !== actual.text) {
      problems++;
      console.log(`  ✗ ${route} pill ${i + 1}: label "${actual.text}", verwacht "${expected.text}"`);
    }
    if (expected.icon !== actual.icon) {
      problems++;
      console.log(`  ✗ ${route} pill ${i + 1}: icoon "${actual.icon}", verwacht "${expected.icon}"`);
    }
  }
}

/* Elk nav-doel moet bestaan: een anker op de homepage, of een route die 200 geeft. */
const homepageHtml = await (await fetch(BASE + '/')).text();
for (const pill of reference) {
  if (pill.href.startsWith('/#') || pill.href.startsWith('#')) {
    const id = pill.href.replace(/^\/?#/, '');
    if (!new RegExp(`id="${id}"`).test(homepageHtml)) {
      problems++;
      console.log(`  ✗ nav-doel ontbreekt: anker #${id} ("${pill.text}") staat niet op de homepage`);
    }
  } else if (pill.href.startsWith('/')) {
    const status = (await fetch(BASE + pill.href)).status;
    if (status !== 200) {
      problems++;
      console.log(`  ✗ nav-doel kapot: ${pill.href} ("${pill.text}") geeft ${status}`);
    }
  }
}

console.log(`\n${reference.length} pills vergeleken over ${pages.length} pagina's, alle doelen gecontroleerd`);
if (problems) {
  console.log(`RESULTAAT: ${problems} verschil(len) in de hub-navigatie`);
  process.exit(1);
}
console.log('RESULTAAT: hub-navigatie identiek op alle pagina\'s en elk doel bereikbaar');
