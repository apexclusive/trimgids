const baseUrl = process.env.BASE_URL || 'http://localhost:3010';
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
  '/ehbo-hond'
];
const apiRoutes = [
  '/api/insurance',
  '/api/foods',
  '/api/dna-tests',
  '/api/routes',
  '/api/news',
  '/api/dog-tax'
];

const failures = [];
const request = async path => {
  const response = await fetch(baseUrl + path, { redirect: 'manual' });
  const body = await response.text();
  return { response, body };
};

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
