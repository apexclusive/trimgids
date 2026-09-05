import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const catalogFile = join(root, 'data', 'catalog.json');

async function loadEnv() {
  try {
    const content = await readFile(join(root, '.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {}
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function uniqueSlug(name, city, providers) {
  const base = `${slugify(name)}-${slugify(city)}`;
  let slug = base;
  let suffix = 2;
  while (providers.some(provider => provider.slug === slug && provider.name !== name)) slug = `${base}-${suffix++}`;
  return slug;
}

async function searchCity(city, apiKey) {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount'
    },
    body: JSON.stringify({ textQuery: `trimsalon in ${city}, Nederland`, languageCode: 'nl', regionCode: 'NL', maxResultCount: 20 })
  });
  if (!response.ok) throw new Error(`Google Places ${response.status} voor ${city}`);
  const data = await response.json();
  return data.places || [];
}

await loadEnv();
if (!process.env.GOOGLE_PLACES_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY ontbreekt. Maak .env aan op basis van .env.example.');
  process.exitCode = 1;
} else {
  const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
  let imported = 0;
  for (const [citySlug, place] of Object.entries(catalog.places)) {
    const places = await searchCity(place.name, process.env.GOOGLE_PLACES_API_KEY);
    for (const result of places) {
      const name = result.displayName?.text;
      if (!name || !result.id) continue;
      const existing = catalog.providers.find(provider => provider.googlePlaceId === result.id);
      const provider = existing || {
        slug: uniqueSlug(name, citySlug, catalog.providers),
        name,
        city: citySlug,
        breeds: [],
        specializations: [],
        verified: false,
        demo: false
      };
      Object.assign(provider, {
        name,
        city: citySlug,
        address: result.formattedAddress || '',
        googlePlaceId: result.id,
        googleMapsUri: result.googleMapsUri || '',
        website: result.websiteUri || '',
        phone: result.nationalPhoneNumber || '',
        googleRating: result.rating ?? null,
        googleReviewCount: result.userRatingCount ?? 0,
        lastGoogleSync: new Date().toISOString()
      });
      if (!existing) catalog.providers.push(provider);
      imported += existing ? 0 : 1;
    }
  }
  await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Google Places sync klaar. ${imported} nieuwe aanbieders toegevoegd.`);
  console.log('Nieuwe aanbieders blijven ongeverifieerd en worden niet automatisch geïndexeerd.');
}
