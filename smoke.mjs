const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const routes = [
  '/',
  '/nieuws',
  '/verzekering',
  '/voeding',
  '/trimsalon/maastricht',
  '/rassen/labradoodle',
  '/kaart',
  '/wandelen',
  '/last-minute',
  '/offerte',
  '/hondenbelasting',
  '/producten',
  '/giftigheid-calculator',
  '/puppy-kiezen',
  '/leeftijd-calculator',
  '/trimsalon-inkomsten-calculator',
  '/bedrijven',
  '/ehbo-hond',
  '/forum',
  '/hulphonden',
  '/zintuigen',
  '/hondenanatomie',
  '/hondengedrag',
  '/puppies',
  '/fokkers',
  '/aankoopgids',
  '/vacatures',
  '/vrijwilligers',
  '/adoptie',
  '/hond-gevonden',
  '/reizen',
  '/rassen',
  '/verboden-rassen',
  '/poepzakjes',
  '/hondenweetjes',
  '/hondenwedstrijden',
  '/chippen-ontwormen',
  '/braken-hond',
  '/hitteberoerte-hond',
  '/zwerfhonden',
  '/honden-cijfers',
  '/geschiedenis-hond',
  '/koninklijke-honden',
  '/hond-en-werk',
  '/webshop',
  '/trimmen-kosten',
  '/zoek'
];
const apiRoutes = [
  '/api/insurance',
  '/api/foods',
  '/api/dna-tests',
  '/api/routes',
  '/api/news',
  '/api/dog-tax',
  '/api/home',
  '/api/cities',
  '/api/forum',
  '/api/vacatures',
  '/api/sitesearch?q=verzekering',
  '/api/chat/health'
];

const failures = [];
const request = async path => {
  const response = await fetch(baseUrl + path, { redirect: 'manual' });
  const body = await response.text();
  return { response, body };
};

/* CI-start: de server draait in de achtergrond en is op tragere runners
   nog niet klaar als de test begint — wacht dus kort op het eerste antwoord
   i.p.v. meteen op connection refused te falen. */
const start = Date.now();
for (;;) {
  try { await request('/'); break; }
  catch (e) {
    if (Date.now() - start > 30000) { console.error('server niet bereikbaar binnen 30s op ' + baseUrl); process.exit(1); }
    await new Promise(r => setTimeout(r, 1000));
  }
}

for (const path of routes) {
  try {
    const { response, body } = await request(path);
    const title = body.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
    if (response.status !== 200) failures.push(`${path}: HTTP ${response.status}`);
    if (!title) failures.push(`${path}: missing title`);
    if (/>\s*(undefined|null)\s*</i.test(body)) failures.push(`${path}: undefined/null text node`);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}

for (const path of apiRoutes) {
  try {
    const { response, body } = await request(path);
    if (response.status !== 200) failures.push(`${path}: HTTP ${response.status}`);
    JSON.parse(body);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}

if (failures.length) {
  console.error('Smoke test failed:\n- ' + failures.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`Smoke test passed: ${routes.length} pages and ${apiRoutes.length} APIs at ${baseUrl}`);
}

/* Ronde 31 — alias-routes moeten 301-redirecten naar hun canonieke URL.
   (redirect:'manual' zodat we de 301 zelf zien, niet de doorgestuurde 200.) */
const aliasChecks = [
  ['/vliegen-hond', '/reizen'],
  ['/trimkosten', '/trimmen-kosten'],
  ['/wat-kost-trimmen', '/trimmen-kosten'],
  ['/community', '/forum'],
  ['/hondenforum', '/forum'],
  ['/search?q=verzekering', '/zoek?q=verzekering']
];
for (const [alias, canonical] of aliasChecks) {
  try {
    const response = await fetch(baseUrl + alias, { redirect: 'manual' });
    if (response.status !== 301) failures.push(`${alias}: verwacht 301, kreeg ${response.status}`);
    else if (response.headers.get('location') !== canonical) failures.push(`${alias}: location=${response.headers.get('location')}, verwacht ${canonical}`);
  } catch (error) {
    failures.push(`${alias}: ${error.message}`);
  }
}
if (failures.length) {
  console.error('Alias-redirect checks failed:\n- ' + failures.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Alias-redirects correct (301 → canoniek)');
}
