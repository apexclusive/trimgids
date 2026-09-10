import { promises as fs } from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const root = process.cwd();
const routes = [
  '/', '/nieuws', '/verzekering', '/voeding', '/trimsalon/maastricht', '/rassen/labradoodle', '/kaart', '/wandelen', '/last-minute', '/offerte', '/hondenbelasting', '/producten', '/giftigheid-calculator', '/puppy-kiezen', '/leeftijd-calculator', '/trimsalon-inkomsten-calculator', '/bedrijven', '/ehbo-hond', '/forum', '/hulphonden', '/zintuigen', '/hondenanatomie', '/hondengedrag', '/puppies', '/fokkers', '/aankoopgids', '/vacatures', '/vrijwilligers', '/adoptie', '/hond-gevonden', '/reizen', '/vliegen-hond', '/rassen', '/verboden-rassen', '/poepzakjes', '/hondenweetjes', '/hondenwedstrijden', '/chippen-ontwormen', '/braken-hond', '/hitteberoerte-hond', '/zwerfhonden', '/honden-cijfers', '/geschiedenis-hond', '/koninklijke-honden', '/hond-en-werk', '/webshop', '/trimmen-kosten', '/wat-kost-trimmen', '/trimkosten', '/zoek'
];
const apiRoutes = ['/api/insurance', '/api/foods', '/api/dna-tests', '/api/routes', '/api/news', '/api/dog-tax', '/api/home', '/api/cities', '/api/forum', '/api/vacatures', '/api/sitesearch?q=verzekering', '/api/chat/health'];
const outDir = path.join(root, 'audit');
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const attr = (html, name) => clean((html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)`, 'i')) || [])[1]);
const write = async (name, value) => fs.writeFile(path.join(outDir, name), JSON.stringify(value, null, 2) + '\n');

await fs.mkdir(outDir, { recursive: true });
const routeHealth = [];
const componentInventory = { forms: [], calculators: [], interactive: [], maps: [], filters: [], routes: routes.length };
const commercialLinks = [];
for (const route of routes) {
  const started = performance.now();
  const response = await fetch(baseUrl + route);
  const body = await response.text();
  const title = clean((body.match(/<title>([^<]*)<\/title>/i) || [])[1]);
  const h1 = (body.match(/<h1\b/gi) || []).length;
  const canonical = clean((body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i) || [])[1]);
  const shell = body.includes('id="tg-site-nav"');
  const record = {
    route, status: response.status, ms: Math.round(performance.now() - started),
    title: Boolean(title), titleText: title, description: Boolean(attr(body, 'description')),
    canonical: Boolean(canonical), canonicalUrl: canonical, h1Count: h1,
    shell, openGraph: /property=["']og:title["']/i.test(body), twitter: /name=["']twitter:card["']/i.test(body),
    schema: /application\/ld\+json/i.test(body), forms: (body.match(/<form\b/gi) || []).length,
    images: (body.match(/<img\b/gi) || []).length, altMissing: (body.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
    links: (body.match(/<a\b/gi) || []).length
  };
  routeHealth.push(record);
  const add = (type, marker) => { if (body.includes(marker)) componentInventory[type].push(route); };
  add('calculators', 'calculator'); add('maps', 'data-nl-map'); add('filters', 'data-filter'); add('interactive', 'data-');
  for (const match of body.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    if (/affiliate|partner|bedrijf|verzekering|webshop|offerte|pro|sponsor/i.test(href + match[2])) commercialLinks.push({ route, href, text: clean(match[2].replace(/<[^>]+>/g, '')) });
  }
}
const files = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'audit'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(mjs|js|html|css|json|webmanifest)$/.test(entry.name)) files.push(path.relative(root, full));
  }
}
await walk(root);
const inventory = {
  generatedBy: 'audit-site.mjs',
  baseUrl,
  routeCount: routes.length,
  apiCount: apiRoutes.length,
  sourceFiles: files,
  serviceWorker: 'sw.js',
  subdomains: [],
  note: 'Subdomains are not present in this checkout; configure BASE_URL per deployment to audit them.'
};
const seoAudit = routeHealth.map(r => ({ route: r.route, status: r.status, score: [r.status === 200, r.title, r.description, r.canonical, r.h1Count === 1, r.schema].filter(Boolean).length, checks: { http: r.status === 200, title: r.title, description: r.description, canonical: r.canonical, singleH1: r.h1Count === 1, schema: r.schema, openGraph: r.openGraph, twitter: r.twitter } }));
const accessibilityAudit = routeHealth.map(r => ({ route: r.route, score: [r.shell, r.altMissing === 0].filter(Boolean).length, checks: { universalShell: r.shell, missingAlt: r.altMissing } }));
await Promise.all([
  write('site-inventory.json', inventory),
  write('route-health.json', routeHealth),
  write('component-inventory.json', componentInventory),
  write('commercial-link-inventory.json', commercialLinks),
  write('seo-audit.json', seoAudit),
  write('accessibility-audit.json', accessibilityAudit)
]);
const failures = routeHealth.filter(r => r.status !== 200 || !r.title || !r.description || !r.canonical || r.h1Count !== 1 || !r.shell || r.altMissing > 0);
if (failures.length) {
  console.error(`Audit completed with ${failures.length} route warnings; reports written to audit/`);
  for (const failure of failures.slice(0, 20)) console.error(`- ${failure.route}: status=${failure.status}, title=${failure.title}, description=${failure.description}, canonical=${failure.canonical}, h1=${failure.h1Count}, shell=${failure.shell}, altMissing=${failure.altMissing}`);
  process.exitCode = 1;
} else {
  console.log(`Audit passed: ${routes.length} routes, ${files.length} source files; reports written to audit/`);
}
