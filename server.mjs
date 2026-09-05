import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const root = normalize(__filename.slice(0, __filename.lastIndexOf('/')));
const catalogFile = join(root, 'data', 'catalog.json');
const reviewsFile = join(root, 'data', 'reviews.json');
const claimsFile = join(root, 'data', 'claims.json');
const profilesFile = join(root, 'data', 'profiles.json');
const helpRequestsFile = join(root, 'data', 'help-requests.json');
const responsesFile = join(root, 'data', 'responses.json');
const pollsFile = join(root, 'data', 'polls.json');
const forumFile = join(root, 'data', 'forum.json');
const newsFile = join(root, 'data', 'news.json');
const newsTipsFile = join(root, 'data', 'news-tips.json');
const missingFile = join(root, 'data', 'missing.json');
const dogTaxFile = join(root, 'data', 'dog-tax.json');
const routesFile = join(root, 'data', 'routes.json');
const insuranceFile = join(root, 'data', 'insurance.json');
const productsFile = join(root, 'data', 'products.json');
const lastMinuteFile = join(root, 'data', 'last-minute.json');
const quotesFile = join(root, 'data', 'quote-requests.json');
const dnaTestsFile = join(root, 'data', 'dna-tests.json');
const foodFile = join(root, 'data', 'food-subscriptions.json');
const emergencyVetsFile = join(root, 'data', 'emergency-vets.json');
const puppyCostsFile = join(root, 'data', 'puppy-costs.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let googleKey = '';
let adminToken = '';
let catalog = { places: {}, breeds: {}, providers: [] };
let routesData = { routes: [] };
let insuranceData = { insurance: [] };
let productsData = { products: [] };
let lastMinuteData = { slots: [] };
let dnaTestsData = { tests: [] };
let foodData = { foods: [] };
let emergencyVetsData = { clinics: [] };
let puppyCostsData = { categories: {} };

async function loadDotEnv() {
  try {
    const raw = await readFile(join(root, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

const rateLimits = { search: new Map(), write: new Map() };

function json(res, status, body) {
  res.writeHead(status, secureHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }));
  res.end(JSON.stringify(body));
}

function secureHeaders(headers = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    ...headers
  };
}

function rateLimit(req, bucket, limit, windowMs) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = bucket.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  bucket.set(ip, entry);
  return entry.count <= limit;
}

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('request_too_large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 120));
}

async function collectionList(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return []; }
}

async function collectionAdd(file, item, limit = 1000) {
  const items = await collectionList(file);
  items.unshift(item);
  if (items.length > limit) items.length = limit;
  await writeFile(file, JSON.stringify(items, null, 2) + '\n');
  return item;
}

function mapPlace(place) {
  const [house, street, ...rest] = (place.shortFormattedAddress || place.formattedAddress || '').split(',').map(s => s.trim());
  const city = rest.slice(-2, -1)[0]?.replace(/^\d{4}\s*[A-Z]{2}\s*/, '') || '';
  const photo = place.photos?.[0]?.name
    ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=${googleKey}`
    : null;
  return {
    id: place.id,
    name: place.displayName?.text || 'Trimsalon',
    address: place.formattedAddress || '',
    shortAddress: [house, street].filter(Boolean).join(', '),
    city,
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || 0,
    phone: place.nationalPhoneNumber || null,
    website: place.websiteUri || null,
    openNow: place.currentOpeningHours?.openNow ?? null,
    weekdayDescriptions: place.currentOpeningHours?.weekdayDescriptions || [],
    photo,
    primaryType: place.primaryTypeDisplayName?.text || 'Trimsalon'
  };
}

async function googlePlacesSearch(query) {
  if (!googleKey) return { places: [], source: 'demo_no_key' };
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.currentOpeningHours,places.photos,places.primaryTypeDisplayName'
    },
    body: JSON.stringify({
      textQuery: `${query} trimsalon`,
      languageCode: 'nl',
      regionCode: 'NL',
      maxResultCount: 20
    })
  });
  if (!res.ok) return { places: [], error: 'places_failed', status: res.status };
  const data = await res.json();
  return { places: (data.places || []).map(mapPlace), source: 'google_places_api' };
}

async function googlePlaceDetails(id) {
  if (!googleKey) return { place: null, source: 'demo_no_key' };
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=nl`, {
    headers: {
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,shortFormattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,photos,primaryTypeDisplayName,reviews'
    }
  });
  if (!res.ok) return { place: null, error: 'places_failed', status: res.status };
  const data = await res.json();
  const mapped = mapPlace(data);
  mapped.reviews = (data.reviews || []).slice(0, 5).map(r => ({
    author: r.authorAttribution?.displayName || 'Anoniem',
    rating: r.rating,
    text: r.text?.text || '',
    relativeTime: r.relativePublishTimeDescription || ''
  }));
  return { place: mapped, source: 'google_places_api' };
}

async function forumList() {
  return collectionList(forumFile);
}
async function forumTopics() {
  return (await forumList()).filter(topic => topic.status !== 'rejected');
}
async function forumCreate(input) {
  const title = clean(input.title, 120);
  const author = clean(input.author, 40);
  const body = clean(input.body, 2000);
  const breed = clean(input.breed, 50);
  const topic = clean(input.topic, 40) || 'ervaringen';
  if (!title || !author || !body) throw new Error('missing_fields');
  const record = {
    id: randomUUID(),
    title, author, body, breed, topic,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    status: 'approved',
    replies: []
  };
  return collectionAdd(forumFile, record);
}

async function forumReplyCreate(topicId, input) {
  const author = clean(input.author, 40);
  const body = clean(input.body, 1000);
  if (!author || !body) throw new Error('missing_fields');
  const topics = await collectionList(forumFile);
  const index = topics.findIndex(item => item.id === topicId);
  if (index < 0) throw new Error('forum_topic_not_found');
  const reply = { id: randomUUID(), author, body, createdAt: new Date().toISOString() };
  topics[index].replies = topics[index].replies || [];
  topics[index].replies.push(reply);
  await writeFile(forumFile, JSON.stringify(topics, null, 2) + '\n');
  return reply;
}

async function forumHelpful(topicId, input) {
  const token = clean(input.voterToken, 100);
  if (!token) throw new Error('missing_fields');
  const topics = await collectionList(forumFile);
  const index = topics.findIndex(item => item.id === topicId);
  if (index < 0) throw new Error('forum_topic_not_found');
  topics[index].helpfulVoters = topics[index].helpfulVoters || [];
  if (topics[index].helpfulVoters.includes(token)) throw new Error('forum_already_reacted');
  topics[index].helpfulVoters.push(token);
  topics[index].helpfulCount = (topics[index].helpfulCount || 0) + 1;
  await writeFile(forumFile, JSON.stringify(topics, null, 2) + '\n');
  return { helpfulCount: topics[index].helpfulCount };
}

async function profileCreate(input) {
  const name = clean(input.name, 40);
  const age = Number.parseInt(input.age, 10);
  const breed = clean(input.breed, 60);
  const city = clean(input.city, 60);
  const sensitive = Boolean(input.sensitive);
  if (!breed || !city || Number.isNaN(age)) throw new Error('profile_missing_fields');
  const profile = { id: randomUUID(), name, age, breed, city, sensitive, createdAt: new Date().toISOString() };
  await collectionAdd(profilesFile, profile);
  return profile;
}

async function claimCreate(slug, input) {
  const name = clean(input.name, 80);
  const email = clean(input.email, 120);
  const phone = clean(input.phone, 40);
  if (!name || !validEmail(email)) throw new Error('claim_invalid_contact');
  return collectionAdd(claimsFile, { id: randomUUID(), providerSlug: clean(slug, 100), name, email, phone, status: 'pending', createdAt: new Date().toISOString() });
}

async function reviewCreate(slug, input) {
  const author = clean(input.author, 40);
  const rating = Number.parseInt(input.rating, 10);
  const body = clean(input.body, 1000);
  if (!author || Number.isNaN(rating) || rating < 1 || rating > 5 || !body) throw new Error('review_invalid_fields');
  return collectionAdd(reviewsFile, { id: randomUUID(), providerSlug: clean(slug, 100), author, rating, body, status: 'pending', createdAt: new Date().toISOString() });
}

async function helpRequestCreate(input) {
  const title = clean(input.title, 80);
  const city = clean(input.city, 60);
  const breed = clean(input.breed, 60);
  const issue = clean(input.issue, 60);
  const description = clean(input.description, 1000);
  const contact = clean(input.contact, 120);
  if (!title || !city || !description || !validEmail(contact)) throw new Error('request_invalid_fields');
  return collectionAdd(helpRequestsFile, { id: randomUUID(), title, city, breed, issue, description, contact, status: 'open', createdAt: new Date().toISOString() });
}

async function responseCreate(requestId, input) {
  const providerSlug = clean(input.providerSlug, 100);
  const providerName = clean(input.providerName, 100);
  const message = clean(input.message, 1200);
  if (!requestId || !providerSlug || !providerName || !message) throw new Error('response_invalid_fields');
  const requests = await collectionList(helpRequestsFile);
  if (!requests.some(item => item.id === requestId)) throw new Error('request_not_found');
  return collectionAdd(responsesFile, { id: randomUUID(), requestId, providerSlug, providerName, message, status: 'pending', createdAt: new Date().toISOString() });
}

async function quoteCreate(input) {
  const name = clean(input.name, 80);
  const email = clean(input.email, 120);
  const phone = clean(input.phone, 50);
  const city = clean(input.city, 60);
  const breed = clean(input.breed, 60);
  const service = clean(input.service, 80) || 'Volledige trimbeurt';
  const timeframe = clean(input.timeframe, 60) || 'Binnen 2 weken';
  const notes = clean(input.notes, 1000);
  if (!name || !validEmail(email) || !city || !breed) throw new Error('quote_invalid_fields');
  const quote = {
    id: randomUUID(),
    name, email, phone, city, breed, service, timeframe, notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  return collectionAdd(quotesFile, quote);
}

async function pollData(breed) {
  const polls = await collectionList(pollsFile);
  const key = clean(breed, 60) || 'labradoodle';
  return polls.find(item => item.breed === key) || polls[0] || { id: 'default', breed: key, question: 'Hoe vaak trim jij je hond?', options: [] };
}

async function pollVote(pollId, input) {
  const optionId = clean(input.optionId, 40);
  const voterToken = clean(input.voterToken, 100);
  if (!optionId || !voterToken) throw new Error('poll_invalid_vote');
  const polls = await collectionList(pollsFile);
  const index = polls.findIndex(item => item.id === pollId);
  if (index < 0) throw new Error('poll_not_found');
  polls[index].voters = polls[index].voters || [];
  if (polls[index].voters.includes(voterToken)) throw new Error('poll_already_voted');
  polls[index].voters.push(voterToken);
  const opt = polls[index].options?.find(item => item.id === optionId);
  if (opt) opt.votes = (opt.votes || 0) + 1;
  await writeFile(pollsFile, JSON.stringify(polls, null, 2) + '\n');
  return polls[index];
}

async function newsList(category, region) {
  const list = await collectionList(newsFile);
  return list.filter(item => (!category || item.category === category) && (!region || item.region.toLowerCase().includes(region.toLowerCase())));
}

async function newsTipCreate(input) {
  const title = clean(input.title, 120);
  const type = clean(input.type, 40) || 'tip';
  const location = clean(input.location, 100);
  const description = clean(input.description, 2000);
  const sourceUrl = clean(input.sourceUrl, 250);
  const reporterEmail = clean(input.reporterEmail, 120);
  if (!title || !description || !validEmail(reporterEmail)) throw new Error('news_tip_invalid_fields');
  return collectionAdd(newsTipsFile, {
    id: randomUUID(),
    title, type, location, description, sourceUrl, reporterEmail,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
}

async function missingList(city, status) {
  const list = await collectionList(missingFile);
  return list.filter(item => (!city || item.city.toLowerCase().includes(city.toLowerCase())) && (!status || item.status === status));
}

async function missingCreate(input) {
  const name = clean(input.name, 50);
  const breed = clean(input.breed, 60);
  const gender = clean(input.gender, 40) || 'Onbekend';
  const age = Number.parseInt(input.age, 10) || 0;
  const city = clean(input.city, 60);
  const locationLastSeen = clean(input.locationLastSeen, 120);
  const dateMissing = clean(input.dateMissing, 30) || new Date().toISOString().split('T')[0];
  const description = clean(input.description, 1500);
  const chipRegistered = Boolean(input.chipRegistered);
  const reward = clean(input.reward, 100);
  const contactPhone = clean(input.contactPhone, 50);
  if (!name || !city || !contactPhone || !locationLastSeen) throw new Error('missing_dog_invalid_fields');
  return collectionAdd(missingFile, {
    id: randomUUID(),
    name, breed, gender, age, city, locationLastSeen, dateMissing, description,
    chipRegistered, reward, contactPhone,
    status: 'active',
    createdAt: new Date().toISOString()
  });
}

async function missingResolve(id) {
  const items = await collectionList(missingFile);
  const index = items.findIndex(item => item.id === id);
  if (index < 0) throw new Error('missing_dog_not_found');
  items[index].status = 'found';
  items[index].resolvedAt = new Date().toISOString();
  await writeFile(missingFile, JSON.stringify(items, null, 2) + '\n');
  return items[index];
}

async function dogTaxData(query, status) {
  const data = await collectionList(dogTaxFile);
  let items = data;
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(d => d.gemeente.toLowerCase().includes(q) || d.provincie.toLowerCase().includes(q));
  }
  if (status) {
    items = items.filter(d => d.status === status);
  }
  return items;
}

async function routesList(province, type) {
  const data = await collectionList(routesFile);
  const routes = data.routes || [];
  return routes.filter(r => (!province || r.province.toLowerCase() === province.toLowerCase()) && (!type || r.type === type));
}

function adminAuthorized(req) {
  return Boolean(adminToken) && req.headers.authorization === `Bearer ${adminToken}`;
}
async function moderate(file, id, status) {
  if (!['approved', 'rejected', 'found'].includes(status)) throw new Error('invalid_moderation_status');
  const items = await collectionList(file);
  const index = items.findIndex(item => item.id === id);
  if (index < 0) throw new Error('moderation_item_not_found');
  items[index] = { ...items[index], status, moderatedAt: new Date().toISOString() };
  await writeFile(file, JSON.stringify(items, null, 2) + '\n');
  return items[index];
}

/* Dynamic XML Sitemap for Search Engines */
function generateSitemap() {
  const baseUrl = 'https://trimgids.nl';
  const now = new Date().toISOString().split('T')[0];
  const urls = [];

  const add = (path, priority = '0.8', changefreq = 'weekly') => {
    urls.push(`  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  add('/', '1.0', 'daily');
  add('/trimsalon', '0.9', 'daily');
  add('/hondenschool', '0.9', 'weekly');
  add('/opvang', '0.9', 'weekly');
  add('/wellness', '0.9', 'weekly');
  add('/verzekering', '0.95', 'weekly');
  add('/dna-test', '0.95', 'weekly');
  add('/voeding', '0.95', 'weekly');
  add('/spoed-dierenarts', '0.95', 'weekly');
  add('/kosten-hond', '0.95', 'weekly');
  add('/wandelen', '0.9', 'weekly');
  add('/kaart', '0.9', 'weekly');
  add('/nieuws', '0.9', 'daily');
  add('/vermist', '0.9', 'daily');
  add('/hondenbelasting', '0.9', 'weekly');

  const breeds = Object.keys(catalog.breeds || {});
  const places = Object.keys(catalog.places || {});

  for (const breedSlug of breeds) {
    add(`/rassen/${breedSlug}`, '0.9', 'weekly');
    add(`/trimsalon/${breedSlug}`, '0.9', 'weekly');
  }

  for (const placeSlug of places) {
    add(`/trimsalon/${placeSlug}`, '0.85', 'weekly');
    add(`/hondenschool/${placeSlug}`, '0.8', 'weekly');
    add(`/opvang/${placeSlug}`, '0.8', 'weekly');
    add(`/wellness/${placeSlug}`, '0.8', 'weekly');

    for (const breedSlug of breeds) {
      add(`/trimsalon/${placeSlug}/${breedSlug}`, '0.85', 'weekly');
    }
  }

  for (const provider of (catalog.providers || [])) {
    for (const breedSlug of (provider.breeds || [])) {
      if (catalog.breeds[breedSlug]) {
        add(`/trimsalon/${provider.city}/${breedSlug}/${provider.slug}`, '0.75', 'monthly');
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/* Robots.txt */
function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: https://trimgids.nl/sitemap.xml
`;
}

/* Admin Page */
function adminPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TrimGids Moderatiedashboard</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:1080px;margin:30px auto;padding:0 20px;color:#1f2937}h1{font-size:32px;color:#2f6b4f}form{display:flex;gap:8px;margin:20px 0}input,button{font:inherit;padding:10px 14px;border:1px solid #d8d8d8;border-radius:8px}button{cursor:pointer;background:#2f6b4f;color:#fff;border:0;font-weight:600}.item{border:1px solid #e7e5e0;border-radius:12px;padding:16px;margin:12px 0;background:#faf9f6}.item p{white-space:pre-wrap;margin:8px 0}.actions{display:flex;gap:8px;margin-top:10px}.reject{background:#8a3d36}.badge{display:inline-block;padding:3px 8px;border-radius:999px;font-size:12px;font-weight:700}.muted{color:#687384}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px}@media(max-width:768px){.grid2{grid-template-columns:1fr}}</style></head><body><h1>🛡️ TrimGids Moderatie & Beheer</h1><p class="muted">Beheer openstaande reviews, offerte-leads, bedrijfclaims, nieuwstips en vermissingen.</p><form id="auth"><input id="token" type="password" placeholder="Admin-token" autocomplete="current-password" required><button>Inloggen</button></form><main id="content" hidden><p id="status" style="font-weight:600"></p><div class="grid2"><div><h2>💼 Offerte-Aanvragen (Leads)</h2><div id="quotes"></div><h2>📰 Nieuwstips & Meldingen</h2><div id="newsTips"></div><h2>🔍 Vermiste Honden</h2><div id="missing"></div></div><div><h2>⭐ Reviews</h2><div id="reviews"></div><h2>🏢 Bedrijfsclaims</h2><div id="claims"></div></div></div></main><script>let token='';const content=document.getElementById('content');const status=document.getElementById('status');const esc=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));const load=async()=>{const response=await fetch('/api/admin/moderation',{headers:{Authorization:'Bearer '+token}});if(!response.ok){status.textContent='Authenticatie mislukt. Controleer het token in .env.';return;}const data=await response.json();content.hidden=false;status.textContent='Verbonden. Laatste update: '+new Date().toLocaleTimeString('nl-NL');const renderQuotes=(items,target)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen openstaande offerte-aanvragen.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>'+esc(item.name)+' ('+esc(item.phone)+' · '+esc(item.email)+')</strong><p>Plaats: '+esc(item.city)+' · Ras: '+esc(item.breed)+'<br>Dienst: '+esc(item.service)+' · Termijn: '+esc(item.timeframe)+'</p><small class="muted">'+esc(item.notes||'')+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="quotes" data-status="approved">Doorsturen naar salons</button><button class="reject" data-id="'+esc(item.id)+'" data-type="quotes" data-status="rejected">Afwijzen</button></div>';node.appendChild(article);});};const renderReviews=(items,target)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen openstaande reviews.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>'+esc(item.author)+' ('+esc(item.rating)+' ★)</strong><p>'+esc(item.body)+'</p><small class="muted">Salon: '+esc(item.providerSlug)+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="reviews" data-status="approved">Goedkeuren</button><button class="reject" data-id="'+esc(item.id)+'" data-type="reviews" data-status="rejected">Afwijzen</button></div>';node.appendChild(article);});};const renderClaims=(items,target)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen openstaande claims.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>'+esc(item.name)+' ('+esc(item.email)+')</strong><p>Telefoon: '+esc(item.phone||'Niet opgegeven')+'</p><small class="muted">Salon: '+esc(item.providerSlug)+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="claims" data-status="approved">Goedkeuren</button><button class="reject" data-id="'+esc(item.id)+'" data-type="claims" data-status="rejected">Afwijzen</button></div>';node.appendChild(article);});};const renderTips=(items,target)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen openstaande tips.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>['+esc(item.type)+'] '+esc(item.title)+'</strong><p>'+esc(item.description)+'</p><small class="muted">Locatie: '+esc(item.location)+' · E-mail: '+esc(item.reporterEmail)+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="news-tips" data-status="approved">Goedkeuren</button><button class="reject" data-id="'+esc(item.id)+'" data-type="news-tips" data-status="rejected">Afwijzen</button></div>';node.appendChild(article);});};const renderMissing=(items,target)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen actieve vermissingen.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>🐾 '+esc(item.name)+' ('+esc(item.breed)+') - '+esc(item.city)+'</strong><p>'+esc(item.description)+'</p><small class="muted">Contact: '+esc(item.contactPhone)+' · Vermist sinds: '+esc(item.dateMissing)+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="missing" data-status="found">Markeer als gevonden</button><button class="reject" data-id="'+esc(item.id)+'" data-type="missing" data-status="rejected">Verwijderen</button></div>';node.appendChild(article);});};renderQuotes(data.quotes||[],'quotes');renderReviews(data.reviews||[],'reviews');renderClaims(data.claims||[],'claims');renderTips(data.newsTips||[],'newsTips');renderMissing(data.missing||[],'missing');document.querySelectorAll('[data-id]').forEach(button=>button.addEventListener('click',async()=>{const response=await fetch('/api/admin/'+button.dataset.type+'/'+button.dataset.id,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({status:button.dataset.status})});if(response.ok)load();else status.textContent='Moderatieactie mislukt.';}));};document.getElementById('auth').addEventListener('submit',event=>{event.preventDefault();token=document.getElementById('token').value;load();});</script></body></html>`;
}

/* Standalone Hondenverzekering Vergelijker Page */
function insurancePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Hondenverzekering Vergelijken 2026: Premies & Dekking | TrimGids</title><meta name="description" content="Vergelijk de beste hondenverzekeringen van Nederland (Figo, OHRA, Petplan, Univé). Bereken direct je maandpremie, dekking voor dierenartskosten en heup/elleboogoperaties."><link rel="canonical" href="https://trimgids.nl/verzekering"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is de beste hondenverzekering in 2026?","acceptedAnswer":{"@type":"Answer","text":"Figo en OHRA behoren tot de best geteste hondenverzekeringen met dekking tot 90% van de dierenartskosten en opties voor heup- en elleboogbehandelingen."}},{"@type":"Question","name":"Wat kost een hondenverzekering per maand?","acceptedAnswer":{"@type":"Answer","text":"De premie voor een jonge hond start vanaf ongeveer € 14,90 tot € 24,50 per maand, afhankelijk van ras, gewicht en gekozen dekking."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.ins-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:30px 0}.ins-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.ins-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.ins-badge-top{position:absolute;top:-12px;right:24px;background:var(--amber);color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}.ins-price-box{background:var(--green-light);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center}.ins-price-box strong{font:700 28px Fraunces,Georgia,serif;color:var(--green)}.ins-list{display:grid;gap:8px;font-size:14px;color:var(--ink-2);margin:8px 0}.ins-list li{list-style:none;padding-left:22px;position:relative}.ins-list li::before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:700}.btn-ins{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px}.btn-ins:hover{background:var(--green-d)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering" style="color:var(--green);font-weight:700">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws & Alerts</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenverzekering Vergelijker</p><span class="eyebrow">Onafhankelijk Zorgkostenoverzicht 2026</span><h1>Beste Hondenverzekering Vergelijken</h1><p class="intro">Een operatie na een ongeluk of erfelijke aandoening (zoals heupdysplasie of hernia) kan oplopen tot duizenden euro's. Met een goede hondenverzekering voorkom je financiële verrassingen en kies je altijd voor de beste medische zorg voor jouw hond.</p><div class="stats-row"><div class="stat-card"><strong>€ 14,90</strong><span>Laagste vanafprijs per maand</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>Tot 90%</strong><span>Vergoeding van dierenartskosten</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>Direct online</strong><span>Acceptatie zonder wachttijd</span></div></div><div class="ins-grid" id="ins-container"><p>Verzekeringen laden...</p></div><section class="guide-box"><h2>Waar moet je op letten bij het afsluiten van een hondenverzekering?</h2><div class="steps-grid"><div class="step-card"><h3>1. Erfelijke aandoeningen</h3><p>Controleer of aandoeningen aan heupen, ellebogen (zoals ED en HD) en patellaluxatie worden vergoed. Bij sommige verzekeraars is hiervoor een aanvullende module vereist.</p></div><div class="step-card"><h3>2. Eigen risico & vergoeding</h3><p>Kies tussen 70%, 80% of 90% vergoeding per ingreep. Een hoger eigen risico verlaagt je maandelijkse premie aanzienlijk.</p></div><div class="step-card"><h3>3. Maximale jaaruitkering</h3><p>Polissen variëren van € 2.500 tot onbeperkt per verzekeringsjaar. Voor grote of kwetsbare rassen is een ruime dekking aanbevolen.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer bespaartips voor jouw hond</h2><div class="next-links"><a href="/hondenbelasting">Hondenbelasting per gemeente →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a><a href="/wandelen">Wandelroutes & Losloopbossen →</a></div></section></main><footer><a href="/">TrimGids</a><span>TrimGids is een onafhankelijke vergelijker. Afsluiten gebeurt direct op de officiële website van de verzekeraar.</span></footer><script>const loadIns=async()=>{try{const res=await fetch('/api/insurance');const data=await res.json();const box=document.getElementById('ins-container');box.replaceChildren();(data.insurance||[]).forEach((item,idx)=>{const card=document.createElement('article');card.className='ins-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="ins-badge-top">Beste Keuze 2026</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="font-size:36px">'+item.logo+'</span><div><h2 style="font-size:22px;margin:0">'+item.name+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+item.rating+' ('+item.reviewCount+' reviews)</span></div></div><div class="ins-price-box"><div><span style="font-size:12px;color:var(--muted);display:block">Vanaf premie</span><strong>€ '+item.startingPrice.toFixed(2)+'</strong><span style="font-size:12px;color:var(--muted)">/mnd</span></div><span style="font-weight:700;color:var(--green)">'+item.reimbursementPercent+' vergoeding</span></div><p style="font-size:14px;color:var(--muted);margin:0">'+item.description+'</p><ul class="ins-list">'+item.highlights.map(h=>'<li>'+h+'</li>').join('')+'</ul><a class="btn-ins" href="'+item.affiliateUrl+'" target="_blank" rel="noopener noreferrer">Bereken premie voor jouw hond ↗</a>';box.appendChild(card);});}catch(e){}}loadIns();</script></body></html>`;
}

/* Standalone DNA Test Comparison Page (High-Ticket Affiliate) */
function dnaPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Honden DNA Test 2026: Embark vs Wisdom Panel Vergelijken | TrimGids</title><meta name="description" content="Vergelijk de beste honden DNA- & gezondheidstesten van 2026 (Embark, Wisdom Panel, Orivet). Ontdek de raszuiverheid, stamboom en 250+ erfelijke aandoeningen."><link rel="canonical" href="https://trimgids.nl/dna-test"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hoe betrouwbaar is een honden DNA test?","acceptedAnswer":{"@type":"Answer","text":"Toonaangevende testen zoals Embark en Wisdom Panel hebben een nauwkeurigheid van meer dan 98% tot 99% bij het identificeren van meer dan 350 erkende rassen en genetische mutaties."}},{"@type":"Question","name":"Waarom zou ik een DNA test doen bij een hond?","acceptedAnswer":{"@type":"Answer","text":"Het geeft inzicht in de exacte rassenkruising, potentiële erfelijke ziektes (zoals het MDR1-gen voor medicijngevoeligheid en PRA voor blindheid), en helpt bij preventieve zorg en gerichte voeding."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.dna-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.dna-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.04);position:relative}.dna-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.dna-price-box{background:var(--cream);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center}.dna-price-box strong{font:700 30px Fraunces,serif;color:var(--green)}.btn-aff{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:block}.btn-aff:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/dna-test" style="color:var(--green);font-weight:700">DNA Testen</a><a href="/voeding">Voeding</a><a href="/verzekering">Hondenverzekering</a><a href="/spoed-dierenarts">Spoed Dierenarts</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Honden DNA Testen Vergelijken</p><span class="eyebrow">Genetisch Gezondheidsonderzoek 2026</span><h1>Beste Honden DNA Testen Vergelijken</h1><p class="intro">Wil je weten welke rassen er in jouw hond schuilen, of wil je erfelijke gezondheidsrisico's (zoals heupdysplasie, blindheid of medicijnallergieën) vroegtijdig opsporen? Bekijk hieronder de beste gecertificeerde DNA-kits voor thuis.</p><div class="stats-row"><div class="stat-card"><strong>350+</strong><span>Rassen accuraat herkend</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>250+</strong><span>Erfelijke gezondheidsrisico's</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>99%</strong><span>Laboratorium betrouwbaarheid</span></div></div><div class="dna-grid" id="dna-container"><p>DNA testen laden...</p></div><section class="guide-box"><h2>Hoe werkt een DNA-test voor honden?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Wangslijmvlies afnemen</h3><p>Wrijf met het bijgeleverde zachte wattenstaafje gedurende 30 seconden langs de binnenkant van de wang van je hond. Geheel pijnloos en stressvrij.</p></div><div class="step-card"><div class="step-num">2</div><h3>Gratis terugsturen naar laboratorium</h3><p>Plaats het staafje in het beschermbuisje en stuur het in de voorgefrankeerde retourenvelop naar het gecertificeerde kynologische laboratorium.</p></div><div class="step-card"><div class="step-num">3</div><h3>Online uitslag & familiezoeker</h3><p>Binnen 2 tot 4 weken ontvang je een uitgebreid digitaal rapport met stamboom, rassenpercentages, gezondheidsrisico's en DNA-matches met familieleden.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer gezondheid & preventie</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/voeding">Beste Verse Hondenvoeding →</a><a href="/spoed-dierenarts">24/7 Spoeddierenarts Finder →</a><a href="/kosten-hond">Wat kost een hond? →</a></div></section></main><footer><a href="/">TrimGids</a><span>TrimGids test en vergelijkt onafhankelijk. Bestellingen verlopen via de officiële webshops van de aanbieders.</span></footer><script>const loadDna=async()=>{try{const res=await fetch('/api/dna-tests');const data=await res.json();const box=document.getElementById('dna-container');box.replaceChildren();(data.tests||[]).forEach((t,idx)=>{const card=document.createElement('article');card.className='dna-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+t.badge+'</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="font-size:36px">'+t.logo+'</span><div><h2 style="font-size:22px;margin:0">'+t.title+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+t.rating+' ('+t.reviewCount+' reviews) · '+t.provider+'</span></div></div><div class="dna-price-box"><div><small style="color:var(--muted);text-decoration:line-through">€ '+t.price.toFixed(2)+'</small><br><strong>€ '+t.salePrice.toFixed(2)+'</strong></div><div style="text-align:right;font-size:13px;color:var(--muted)">Uitslag in<br><strong>'+t.turnaroundWeeks+'</strong></div></div><p style="font-size:14px;color:var(--muted);margin:0">'+t.description+'</p><div style="font-size:13px;background:var(--green-light);padding:10px;border-radius:10px;color:var(--green)"><strong>Rassendetectie:</strong> '+t.breedCount+'<br><strong>Gezondheidsscreening:</strong> '+t.healthScreening+'</div><ul style="font-size:13px;color:var(--muted);padding-left:18px;display:grid;gap:5px">'+t.highlights.map(h=>'<li>'+h+'</li>').join('')+'</ul><a class="btn-aff" href="'+t.affiliateUrl+'" target="_blank" rel="noopener noreferrer">Bekijk test & bestel met korting ↗</a>';box.appendChild(card);});}catch(e){}}loadDna();</script></body></html>`;
}

/* Standalone Voeding & Verse Maaltijden Page (High Recurring Affiliate) */
function foodPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Hondenvoer & Verse Maaltijden 2026: Voedingswijzer | TrimGids</title><meta name="description" content="Vergelijk de beste verse maaltijden en koudgeperste brokken (Butternut Box, Farm Food, Edgard & Cooper, Tails.com). Inclusief interactieve portiecalculator en kortingen."><link rel="canonical" href="https://trimgids.nl/voeding"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is gezonder: vers gestoomd voer of traditionele geëxtrudeerde brokken?","acceptedAnswer":{"@type":"Answer","text":"Vers gestoomd vlees (zoals Butternut Box) en koudgeperste brokken (zoals Farm Food) behouden aanzienlijk meer natuurlijke vitaminen en antioxidanten omdat ze niet op extreem hoge temperaturen worden verhit."}},{"@type":"Question","name":"Hoeveel gram voer heeft mijn hond per dag nodig?","acceptedAnswer":{"@type":"Answer","text":"Gemiddeld heeft een volwassen hond dagelijks ongeveer 1,2% tot 2,5% van zijn lichaamsgewicht aan kwaliteitsvoeding nodig, afhankelijk van activiteit en voersoort."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.food-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.food-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.04);position:relative}.food-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.food-promo{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:700}.btn-food{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:block}.btn-food:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/voeding" style="color:var(--green);font-weight:700">Voeding & Vers</a><a href="/dna-test">DNA Testen</a><a href="/verzekering">Hondenverzekering</a><a href="/spoed-dierenarts">Spoed Dierenarts</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Voedingswijzer & Verse Maaltijden</p><span class="eyebrow">Onafhankelijke Voedingsvergelijker 2026</span><h1>Beste Hondenvoer & Verse Maaltijdboxen</h1><p class="intro">Goede voeding is de basis voor een glanzende vacht, gezonde darmflora, sterke gewrichten en minder dierenartskosten. Vergelijk de hoogst gewaardeerde verse gestoomde maaltijden en koudgeperste brokken met exclusieve TrimGids welkomstkortingen.</p><div class="stats-row"><div class="stat-card"><strong>60%+</strong><span>Echt vlees/vis van hoge kwaliteit</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>50% Korting</strong><span>Exclusieve welkomstdeal</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>Vers aan huis</strong><span>Dagporties op maat bezorgd</span></div></div><div class="food-grid" id="food-container"><p>Voedingen laden...</p></div><section class="tip-box" id="portie-calculator"><div class="tip-box-head"><span class="eyebrow" style="color:var(--green)">Rekenmodule</span><h2>🧮 Slimme Portie- & Caloriecalculator</h2><p>Bereken direct hoeveel gram voeding en kilocalorieën jouw viervoeter dagelijks nodig heeft.</p></div><div class="form-grid"><label>Gewicht van je hond (kg)<input type="number" id="calc-weight" value="15" min="1" max="90"></label><label>Activiteitsniveau<select id="calc-activity"><option value="1.2">Rustig / Senioren (weinig beweging)</option><option value="1.5" selected>Normaal (1 tot 2 uur wandelen per dag)</option><option value="1.8">Actief (sport, rennen, lange boswandelingen)</option><option value="2.2">Werkhond / Sporthond (Agility / jacht)</option></select></label><div class="full" style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:14px"><div style="text-align:center"><small style="color:var(--muted)">Aanbevolen dagelijkse portie vers voer</small><div id="res-fresh-grams" style="font:700 28px Fraunces,serif;color:var(--green)">375 g / dag</div></div><div style="text-align:center"><small style="color:var(--muted)">Aanbevolen dagelijkse portie koudgeperste brok</small><div id="res-kibble-grams" style="font:700 28px Fraunces,serif;color:var(--green)">180 g / dag</div></div><div style="text-align:center"><small style="color:var(--muted)">Dagelijkse energiebehoefte</small><div id="res-calories" style="font:700 28px Fraunces,serif;color:var(--ink)">780 kcal</div></div></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige tools & gidsen</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/dna-test">Honden DNA Testen →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a><a href="/kosten-hond">Wat kost een hond? →</a></div></section></main><footer><a href="/">TrimGids</a><span>TrimGids adviseert op basis van onafhankelijke voedingsanalyses.</span></footer><script>const loadFood=async()=>{try{const res=await fetch('/api/foods');const data=await res.json();const box=document.getElementById('food-container');box.replaceChildren();(data.foods||[]).forEach((f,idx)=>{const card=document.createElement('article');card.className='food-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+f.badge+'</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="font-size:36px">'+f.logo+'</span><div><h2 style="font-size:22px;margin:0">'+f.brand+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+f.rating+' ('+f.reviewCount+' reviews) · '+f.foodType+'</span></div></div><div class="food-promo">🎁 '+f.discountOffer+'</div><p style="font-size:14px;color:var(--muted);margin:0">'+f.description+'</p><ul style="font-size:13px;color:var(--muted);padding-left:18px;display:grid;gap:5px">'+f.benefits.map(b=>'<li>'+b+'</li>').join('')+'</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><span style="font-size:14px;color:var(--muted)">Vanaf <strong>€ '+f.startingPricePerDay.toFixed(2)+'</strong> / dag</span></div><a class="btn-food" href="'+f.affiliateUrl+'" target="_blank" rel="noopener noreferrer">Claim deal & bestel proefbox ↗</a>';box.appendChild(card);});}catch(e){}}loadFood();const calcWeight=document.getElementById('calc-weight');const calcActivity=document.getElementById('calc-activity');const resFresh=document.getElementById('res-fresh-grams');const resKibble=document.getElementById('res-kibble-grams');const resCal=document.getElementById('res-calories');const updatePortions=()=>{const w=parseFloat(calcWeight.value)||15;const act=parseFloat(calcActivity.value)||1.5;const rer=70*Math.pow(w,0.75);const mer=Math.round(rer*act);const freshGrams=Math.round((mer/150)*100);const kibbleGrams=Math.round((mer/360)*100);resCal.textContent=mer+' kcal';resFresh.textContent=freshGrams+' g / dag';resKibble.textContent=kibbleGrams+' g / dag';};calcWeight.addEventListener('input',updatePortions);calcActivity.addEventListener('change',updatePortions);updatePortions();</script></body></html>`;
}

/* Standalone Spoed Dierenarts & Weekenddienst Finder */
function emergencyVetPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>24/7 Spoed Dierenarts & Weekenddienst Finder | TrimGids</title><meta name="description" content="Vind direct een geopende 24/7 spoeddierenarts of weekendkliniek bij jou in de buurt in Limburg, Noord-Brabant, Utrecht, Amsterdam en heel Nederland. Met spoednummer en tarieven."><link rel="canonical" href="https://trimgids.nl/spoed-dierenarts"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wanneer moet ik direct naar een spoeddierenarts?","acceptedAnswer":{"@type":"Answer","text":"Bij acute symptomen zoals een opgezette harde buik (mogelijke maagtorsie), ernstige benauwdheid, aanhoudende epileptische aanvallen, inname van giftige stoffen (chocolade, rattengif, druiven), hevige bloedingen of aanrijdingen."}},{"@type":"Question","name":"Wat kost een consult bij de spoeddierenarts in het weekend of 's nachts?","acceptedAnswer":{"@type":"Answer","text":"Een spoedconsult buiten kantooruren kost doorgaans tussen de € 140,- en € 275,- exclusief medicatie, diagnostiek of operaties."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.vet-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.vet-card{background:#fff;border:1px solid #fecaca;border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 14px rgba(185,28,28,.06)}.btn-call{background:#b91c1c;color:#fff;font-weight:700;padding:12px 18px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px}.btn-call:hover{background:#991b1b}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/spoed-dierenarts" style="color:#b91c1c;font-weight:700">🚨 Spoed Dierenarts</a><a href="/verzekering">Hondenverzekering</a><a href="/voeding">Voeding</a><a href="/dna-test">DNA Testen</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / 24/7 Spoeddierenartsen</p><span class="eyebrow" style="color:#b91c1c">Acute Hulp & Weekendklinieken</span><h1>24/7 Spoed Dierenarts & Weekenddienst Finder</h1><p class="intro">Heeft jouw hond met spoed veterinaire hulp nodig in het weekend of midden in de nacht? Bel direct een van de regionale 24/7 dierenziekenhuizen en spoedklinieken. <strong>Bel altijd eerst voordat je gaat rijden!</strong></p><div class="stats-row"><div class="stat-card" style="border-left-color:#b91c1c"><strong>24/7</strong><span>Dag en nacht bereikbaar</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>IC & Chirurgie</strong><span>Direct operatiekamers paraat</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>90% Vergoed</strong><span>Met actieve hondenverzekering</span></div></div><div class="vet-grid" id="vet-container"><p>Klinieken laden...</p></div><section class="guide-box" style="background:#fef2f2;border-color:#fecaca"><span class="eyebrow" style="color:#b91c1c">EHBO Noodwijzer</span><h2>🚨 Wanneer bel je onmiddellijk de spoedkliniek?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Opgezette buik & loos braken (Maagtorsie)</h3><p>Bij grote rassen (Berner Sennen, Doodles, Retrievers) kan een maagkanteling binnen 2 uur fataal zijn. Direct met spoed naar de kliniek!</p></div><div class="step-card"><div class="step-num">2</div><h3>Inname van toxische stoffen</h3><p>Chocolade (vooral puur), zoetstof xylitol (kauwgom/pindakaas), druiven/rozijnen, rattengif of lelies. Neem de verpakking mee.</p></div><div class="step-card"><div class="step-num">3</div><h3>Acute benauwdheid of blauwe tong</h3><p>Ademnood, piepende ademhaling, oververhitting in de zomer (hitteberoerte) of verstikking in speelgoed/bot.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige gidsen voor baasjes</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken (Spoeddekking) →</a><a href="/nieuws">Nieuws & Gevaarswaarschuwingen →</a><a href="/vermist">Vermiste Honden Meldpunt →</a><a href="/voeding">Beste Hondenvoeding →</a></div></section></main><footer><a href="/">TrimGids</a><span>TrimGids is een informatieve zorggids. Bel bij acute levensbedreigende spoed direct de dienstdoende dierenkliniek.</span></footer><script>const loadVets=async()=>{try{const res=await fetch('/api/emergency-vets');const data=await res.json();const box=document.getElementById('vet-container');box.replaceChildren();(data.clinics||[]).forEach(c=>{const card=document.createElement('article');card.className='vet-card';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.address)+'&travelmode=driving';card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2 style="font-size:21px;margin:0">'+c.name+'</h2><span style="font-size:13px;color:var(--muted)">📍 '+c.city+' ('+c.region+')</span></div><span class="badge" style="background:#fee2e2;color:#991b1b;font-weight:700">24/7 Spoed</span></div><p style="font-size:13px;color:var(--muted);margin:0"><strong>Adres:</strong> '+c.address+'<br><strong>Opening:</strong> '+c.available+'</p><div style="font-size:13px;background:#fff;border:1px solid var(--line);padding:10px;border-radius:10px"><strong>Indicatie spoedconsult:</strong> '+c.consultFeeWeekendNight+'<br><small style="color:var(--muted)">'+c.advice+'</small></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto"><a class="btn-call" href="tel:'+c.phone+'">📞 '+c.phone+'</a><a class="outline" href="'+maps+'" target="_blank" rel="noopener noreferrer" style="text-align:center;font-size:13px;padding:10px">🧭 Route (Maps) ↗</a></div>';box.appendChild(card);});}catch(e){}}loadVets();</script></body></html>`;
}

/* Standalone Kosten van een Hond Calculator Page */
function costPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wat kost een hond? 2026 Kosten Calculator & Jaaroverzicht | TrimGids</title><meta name="description" content="Bereken exact wat een hond kost in het eerste jaar en per maand. Inclusief aanschaf, voeding, trimsalon, inentingen, hondenverzekering en bespaartips."><link rel="canonical" href="https://trimgids.nl/kosten-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat kost een hond gemiddeld per maand?","acceptedAnswer":{"@type":"Answer","text":"Voor een kleine tot middelgrote hond liggen de maandelijkse kosten tussen de € 85,- en € 165,- per maand voor kwaliteitsvoeding, verzorging, verzekering en preventieve medische zorg."}},{"@type":"Question","name":"Wat kost het eerste jaar met een puppy?","acceptedAnswer":{"@type":"Answer","text":"Inclusief aanschaf, bench, inentingen, chipregistratie, puppycursus en basisuitrusting kost een pup in het eerste jaar gemiddeld tussen de € 2.200,- en € 3.800,-."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.cost-calc-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}.cost-stat-card{background:#fff;border-radius:18px;padding:24px;border:1px solid var(--line);display:flex;flex-direction:column;gap:6px}.cost-stat-card strong{font:700 36px Fraunces,serif;color:var(--green)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kosten-hond" style="color:var(--green);font-weight:700">Kosten Calculator</a><a href="/verzekering">Hondenverzekering</a><a href="/voeding">Voeding</a><a href="/dna-test">DNA Testen</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Wat kost een hond?</p><span class="eyebrow">Financiële Hondenwijzer 2026</span><h1>Wat kost een hond per maand en per jaar?</h1><p class="intro">Een hond brengt onvoorwaardelijke vriendschap, maar ook structurele kosten met zich mee. Met onze interactieve rekentool bereken je binnen 30 seconden de verwachte eenmalige opstartkosten en de maandelijkse uitgaven voor jouw formaat hond.</p><div class="cost-calc-box"><div class="form-grid"><label>Formaat van je hond<select id="size-select"><option value="small">Kleine hond (&lt; 10 kg, bijv. Pomeriaan, Teckel, Maltezer, Chihuahua)</option><option value="medium" selected>Middelgrote hond (10 - 25 kg, bijv. Labradoodle, Border Collie, Cockapoo)</option><option value="large">Grote hond (&gt; 25 kg, bijv. Golden Retriever, Berner Sennen, Herder)</option></select></label><label>Voorkeur voeding<select id="diet-select"><option value="premium">Premium Vers / Koudgeperst (Butternut Box / Farm Food)</option><option value="standard">Standaard kwaliteitsbrok</option></select></label><label>Hondenverzekering afsluiten?<select id="ins-select"><option value="yes" selected>Ja, medische kosten verzekeren (aanbevolen)</option><option value="no">Nee, zelf een spaarpotje aanhouden</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="cost-stat-card"><small style="color:var(--muted)">Eenmalige opstartkosten (1e jaar)</small><strong id="res-startup">€ 2.010,-</strong><span>Bench, aanschaf, inentingen, tuig & cursus</span></div><div class="cost-stat-card" style="border-left:4px solid var(--amber)"><small style="color:var(--muted)">Geschatte kosten per maand</small><strong id="res-monthly">€ 142,-</strong><span>Voer, trimsalon, zorg, preventie & snacks</span></div><div class="cost-stat-card" style="border-left:4px solid #3730a3"><small style="color:var(--muted)">Levenslange totale kosten (13 jaar)</small><strong id="res-lifetime">€ 24.160,-</strong><span>Op basis van reële Nederlandse data</span></div></div></div><section class="guide-box"><h2>💡 4 Slimme manieren om te besparen zonder in te leveren op welzijn</h2><div class="steps-grid"><div class="step-card"><h3>1. Vergelijk hondenverzekeringen</h3><p>Een operatie na een kruisbandruptuur of hernia kost al snel € 2.500 tot € 4.500. Een polis vanaf € 14,90/mnd voorkomt dat je plotseling in de schulden raakt.</p></div><div class="step-card"><h3>2. Zelf borstelen tussen trimbeurten</h3><p>Door wekelijks goed door te kammen tot op de huid voorkom je vilt, waardoor de trimsalon minder ontklit-uren hoeft te rekenen.</p></div><div class="step-card"><h3>3. Check hondenbelasting in jouw gemeente</h3><p>In 68% van de gemeenten betaal je € 0,- belasting. Verhuis je of woon je op de grens? Check direct de tarieven.</p></div><div class="step-card"><h3>4. Koudgeperste voeding met hoge dichtheid</h3><p>Koudgeperste brokjes hebben een hogere voedingswaarde per gram, waardoor je minder volume hoeft te voeren dan bij goedkope supermarktbrok met veel vulmiddelen.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Gerelateerde rekentools</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/hondenbelasting">Hondenbelasting Checken →</a><a href="/voeding">Beste Verse Hondenvoeding →</a><a href="/dna-test">Honden DNA Testen →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a></div></section></main><footer><a href="/">TrimGids</a><span>Berekeningen zijn indicatief en gebaseerd op gemiddelde consumentenprijzen in Nederland 2026.</span></footer><script>const sizeSel=document.getElementById('size-select');const dietSel=document.getElementById('diet-select');const insSel=document.getElementById('ins-select');const resStartup=document.getElementById('res-startup');const resMonthly=document.getElementById('res-monthly');const resLifetime=document.getElementById('res-lifetime');const updateCosts=()=>{const sz=sizeSel.value;const diet=dietSel.value;const ins=insSel.value==='yes';let startup=sz==='small'?1675:(sz==='medium'?2010:2490);let annual=sz==='small'?1250:(sz==='medium'?1700:2350);if(diet==='premium')annual+=sz==='small'?120:(sz==='medium'?220:380);if(!ins)annual-=sz==='small'?240:(sz==='medium'?320:420);const monthly=Math.round(annual/12);const lifetime=startup+(annual*13);resStartup.textContent='€ '+startup.toLocaleString('nl-NL')+',-';resMonthly.textContent='€ '+monthly.toLocaleString('nl-NL')+',-';resLifetime.textContent='€ '+lifetime.toLocaleString('nl-NL')+',-';};sizeSel.addEventListener('change',updateCosts);dietSel.addEventListener('change',updateCosts);insSel.addEventListener('change',updateCosts);updateCosts();</script></body></html>`;
}
function newsPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondennieuws, Waarschuwingen & Meldpunt | TrimGids</title><meta name="description" content="Actueel hondennieuws, waarschuwingen voor gif of blauwalg, inspectie-invallen bij illegale opvangcentra en positieve ontwikkelingen voor honden. Meld ook zelf een misstand of tip."><link rel="canonical" href="https://trimgids.nl/nieuws"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Interactieve Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws" style="color:var(--green);font-weight:700">Nieuws & Meldpunt</a><a href="/vermist">Vermiste Honden</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Nieuws & Waarschuwingen</p><span class="eyebrow">Actueel Overzicht & Meldpunt</span><h1>Hondennieuws, Waarschuwingen & Misstanden</h1><p class="intro">Blijf op de hoogte van belangrijke ontwikkelingen, inspectie-invallen bij malafide opvanglocaties, gifwaarschuwingen, blauwalg, wetgeving en hartverwarmend goed nieuws. Heb je zelf iets verdachts gezien of wil je een misstand melden? Geef het direct door aan onze community-redactie.</p><div class="filter-bar"><button class="f-btn active" data-cat="">Alles</button><button class="f-btn" data-cat="misstand">🚨 Misstanden & Opvang</button><button class="f-btn" data-cat="waarschuwing">⚠️ Waarschuwingen</button><button class="f-btn" data-cat="goed-nieuws">✨ Goed Nieuws</button><button class="f-btn" data-cat="wetgeving">⚖️ Wetgeving & Regels</button></div><section><div id="news-grid" class="news-grid"><p>Nieuwsberichten laden...</p></div></section><section class="tip-box" id="meldpunt"><div class="tip-box-head"><span class="eyebrow" style="color:#d97706">Meldpunt Community</span><h2>Meld een misstand, waarschuwing of positief nieuws</h2><p>Heb je verdachte situaties bij een opvang/pension opgemerkt, giftig lokaas gevonden, of wil je een lokaal initiatief delen? Na een korte controle publiceren we betrouwbare waarschuwingen direct op het platform.</p></div><form id="news-tip-form" class="form-grid"><label>Titel van je melding<input name="title" required maxlength="120" placeholder="Bijv. Verdacht lokaas aangetroffen in stadspark"></label><label>Type melding<select name="type"><option value="waarschuwing">⚠️ Gevaar / Waarschuwing (gif, blauwalg, etc.)</option><option value="misstand">🚨 Misstand (opvang, pension, illegale fokkerij)</option><option value="goed-nieuws">✨ Goed nieuws / Nieuw initiatief</option><option value="tip">💡 Algemene tip of wetgeving</option></select></label><label>Locatie / Plaats<input name="location" required maxlength="100" placeholder="Bijv. Maastricht-Oost / Park"></label><label>Je e-mailadres (voor verificatie, blijft vertrouwelijk)<input name="reporterEmail" type="email" required maxlength="120" placeholder="jouw@email.nl"></label><label class="full">Omschrijving & details<textarea name="description" required maxlength="2000" placeholder="Wat is er gebeurd? Waar en wanneer? Zijn er instanties (zoals dierenarts, LID, politie) ingeschakeld?"></textarea></label><label class="full">Optionele link naar bron of nieuwsbericht<input name="sourceUrl" type="url" maxlength="250" placeholder="https://..."></label><button class="btn-submit full" type="submit">Melding insturen naar redactie →</button><p id="tip-status" class="status-msg full"></p></form></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer handige gidsen voor jouw hond</h2><div class="next-links"><a href="/vermist">Vermiste honden & Preventiegids →</a><a href="/hondenbelasting">Hondenbelasting per gemeente →</a><a href="/wandelen">Wandelroutes & Losloopgebieden →</a><a href="/verzekering">Hondenverzekering Vergelijken →</a></div></section></main><footer><a href="/">TrimGids</a><span>TrimGids controleert meldingen zorgvuldig. Bij acute spoed of dierenmishandeling: bel direct 144 (Dierenpolitie).</span></footer><script>let activeCat='';const newsGrid=document.getElementById('news-grid');const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const catBadges={misstand:'badge-misstand',waarschuwing:'badge-waarschuwing','goed-nieuws':'badge-goed','wetgeving':'badge-wet'};const catLabels={misstand:'🚨 Misstand in opvang',waarschuwing:'⚠️ Alert / Waarschuwing','goed-nieuws':'✨ Goed Nieuws','wetgeving':'⚖️ Wet & Recht'};const loadNews=async()=>{try{const url=activeCat?'/api/news?category='+encodeURIComponent(activeCat):'/api/news';const res=await fetch(url);const data=await res.json();renderNews(data.news||[]);}catch(e){newsGrid.innerHTML='<p>Kon nieuws niet laden.</p>';}};const renderNews=items=>{newsGrid.replaceChildren();if(!items.length){newsGrid.innerHTML='<p class="empty">Geen nieuwsberichten in deze categorie.</p>';return;}items.forEach(item=>{const art=document.createElement('article');art.className='news-card';const badgeCls=catBadges[item.category]||'badge-wet';const badgeLbl=catLabels[item.category]||item.category;art.innerHTML='<div class="news-head"><span class="news-badge '+badgeCls+'">'+badgeLbl+'</span><span class="news-date">'+esc(item.date)+' · '+esc(item.region)+'</span></div><h3>'+esc(item.title)+'</h3><p class="news-sum">'+esc(item.summary)+'</p><p class="news-body">'+esc(item.body)+'</p><div class="news-foot"><strong>Bron / Instantie:</strong> <span>'+esc(item.source||'TrimGids Redactie')+'</span></div>';newsGrid.appendChild(art);});};document.querySelectorAll('.f-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeCat=btn.dataset.cat;loadNews();}));loadNews();const tipForm=document.getElementById('news-tip-form');const tipStatus=document.getElementById('tip-status');tipForm.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(tipForm);try{const res=await fetch('/api/news/tips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:data.get('title'),type:data.get('type'),location:data.get('location'),reporterEmail:data.get('reporterEmail'),description:data.get('description'),sourceUrl:data.get('sourceUrl')})});if(!res.ok)throw new Error();tipStatus.textContent='Hartelijk dank. Je melding is ontvangen en wordt z.s.m. door de redactie beoordeeld!';tipStatus.className='status-msg success full';tipForm.reset();}catch(err){tipStatus.textContent='Er ging iets mis bij het verzenden. Controleer je velden en probeer het opnieuw.';tipStatus.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone Missing Dogs Page */
function missingPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mijn hond is vermist & Hoe voorkom je vermissing? | TrimGids</title><meta name="description" content="Overzicht van vermiste honden, direct vermissing melden en een compleet actieplan voor de eerste 24 uur en preventietips (chipregistratie, GPS-trackers en tuigjes)."><link rel="canonical" href="https://trimgids.nl/vermist"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Interactieve Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws & Meldpunt</a><a href="/vermist" style="color:var(--green);font-weight:700">Vermiste Honden</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Vermiste Honden & Preventie</p><span class="eyebrow">Hulp bij vermissing & Noodstappenplan</span><h1>Mijn hond is vermist & Hoe voorkom je vermissing?</h1><p class="intro">Het is de grootste nachtmerrie van elk hondenbaasje: je viervoeter schrikt ergens van of glipt door het tuinhek. Hieronder vind je actueel vermiste honden in de regio, kun je direct een vermissing aanmelden, en lees je exact welke acties binnen de eerste 24 uur het verschil maken.</p><div class="quick-links-bar"><a href="#actuele-vermissingen" class="q-link">🐾 Bekijk vermiste honden</a><a href="#meld-vermissing" class="q-link highlight">🚨 Meld een vermissing</a><a href="#actieplan" class="q-link">⚡ Stappenplan eerste 24 uur</a><a href="#preventie" class="q-link">🛡️ Vermissing voorkomen</a></div><section id="actuele-vermissingen"><div class="section-head"><div><span class="eyebrow">Actuele Signalementen</span><h2>Vermiste viervoeters in de regio</h2></div><a class="outline" href="#meld-vermissing">Meld vermissing →</a></div><div id="missing-grid" class="missing-grid"><p>Signalementen laden...</p></div></section><section class="tip-box" id="meld-vermissing" style="background:#fef2f2;border-color:#fecaca"><div class="tip-box-head"><span class="eyebrow" style="color:#b91c1c">Spoedmelding</span><h2>Meld een vermiste hond aan op TrimGids</h2><p>Vul onderstaand formulier in. Je melding wordt direct live geplaatst zodat andere baasjes, wandelaars en trimsalons in jouw plaats kunnen uitkijken.</p></div><form id="missing-form" class="form-grid"><label>Naam van de hond<input name="name" required maxlength="50" placeholder="Bijv. Bella"></label><label>Ras of kruising<input name="breed" required maxlength="60" placeholder="Bijv. Labradoodle / Pomeriaan"></label><label>Plaats / Gemeente<input name="city" required maxlength="60" placeholder="Bijv. Maastricht"></label><label>Laatst gezien (locatie / wijk / park)<input name="locationLastSeen" required maxlength="120" placeholder="Bijv. Sint Pietersberg / Enci-gebied"></label><label>Datum vermist<input name="dateMissing" type="date" required></label><label>Geslacht & leeftijd<input name="gender" maxlength="40" placeholder="Bijv. Teef, 3 jaar"></label><label>Telefoonnummer voor tips / vinder<input name="contactPhone" type="tel" required maxlength="50" placeholder="Bijv. 06-12345678"></label><label>Beloning (optioneel)<input name="reward" maxlength="100" placeholder="Bijv. € 250,- voor de vinder"></label><label class="full">Omschrijving & uiterlijke kenmerken<textarea name="description" required maxlength="1500" placeholder="Kleur vacht, halsband/tuigje, schrikachtig gedrag, medische bijzonderheden..."></textarea></label><label class="full checkbox-label"><input name="chipRegistered" type="checkbox" checked> Deze hond is gechipt en geregistreerd in een databank</label><button class="btn-submit full" type="submit" style="background:#b91c1c">Plaats Vermissingsmelding →</button><p id="missing-status" class="status-msg full"></p></form></section><section class="guide-box" id="actieplan"><span class="eyebrow">Wat te doen</span><h2>🚨 Noodstappenplan: De eerste 24 uur na vermissing</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Blijf rustig & leg een geurspoor</h3><p>Honden lopen vaak terug naar de plek van vertrek. Laat een gedragen kledingstuk (bijv. sok of T-shirt) en een bakje water achter op de plek waar de hond is weggerend. Blijf daar indien mogelijk rustig posten.</p></div><div class="step-card"><div class="step-num">2</div><h3>Meld direct bij Amivedi & Dierenambulance</h3><p>Meld de vermissing onmiddellijk op <strong>Amivedi.nl</strong> en bel de regionale <strong>Dierenambulance (0900-0245)</strong>. Geef chipnummer, signalement en de exacte locatie door.</p></div><div class="step-card"><div class="step-num">3</div><h3>Controleer chipgegevens bij NDG / Chipnummer.nl</h3><p>Veel honden zijn gechipt, maar staan nog op een oud telefoonnummer of adres geregistreerd! Check via <strong>chipnummer.nl</strong> of je gegevens up-to-date en openbaar vindbaar zijn.</p></div><div class="step-card"><div class="step-num">4</div><h3>WhatsApp Buurtpreventie & Facebookgroepen</h3><p>Plaats een beknopt bericht in lokale Facebookgroepen ('Hond vermist Limburg', wijkpagina's) en informeer buurtpreventie-apps en lokale trimsalons/hondenuitlaatdiensten.</p></div><div class="step-card"><div class="step-num">5</div><h3>Flyeren op ooghoogte</h3><p>Hang duidelijke, waterdichte flyers op bij drukke looproutes, supermarkten, dierenartsen en parkeerplaatsen van wandelgebieden in een straal van 3 tot 5 km.</p></div><div class="step-card"><div class="step-num">6</div><h3>Niet roepen of achtervolgen</h3><p>Een angstige hond in 'survival-modus' herkent zijn baasje soms niet direct en kan vluchten. Ga laag bij de grond zitten, praat zacht en gooi wat lekkers zonder plotselinge bewegingen.</p></div></div></section><section class="guide-box" id="preventie" style="background:#f0fdf4;border-color:#bbf7d0"><span class="eyebrow" style="color:var(--green)">Voorkomen is beter dan genezen</span><h2>🛡️ 5 Essentiële maatregelen om vermissing te voorkomen</h2><div class="steps-grid"><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">A</div><h3>Controleer jaarlijks de chipregistratie</h3><p>Ga naar <strong>chipnummer.nl</strong> of <strong>ndg.nl</strong>. Staat je huidige mobiele nummer vermeld? Als de dierenarts of ambulance de chip scant, moeten ze direct kunnen bellen.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">B</div><h3>Gebruik een ontsnappingsveilig Y-tuig</h3><p>Voor schrikachtige of buitenlandse adoptiehonden is een driepunts anti-paniek tuig met een extra band achter de ribbenkast essentieel. Uit een gewoon halsbandje glippen ze zo achteruit weg.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">C</div><h3>GPS-tracker met live tracking</h3><p>Een echte GPS-tracker met simkaart (zoals Tractive) werkt ook in dichte bossen en buitengebieden, in tegenstelling tot Bluetooth AirTags die afhankelijk zijn van passerende iPhones.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">D</div><h3>Penning met 2 telefoonnummers</h3><p>Een gegraveerde penning of QR-code tag aan de halsband/tuig zorgt ervoor dat een vinder binnen 1 minuut contact kan opnemen, nog vóórdat er een chiplezer aan te pas komt.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">E</div><h3>Vuurwerk- en stormprotocol</h3><p>Tijdens de jaarwisseling, onweersbuien of jachtdagen: dubbel aanlijnen (aan tuig én halsband) en de tuin dubbel controleren op losse schuttingplanken of openstaande poorten.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige informatie voor hondenbaasjes</h2><div class="next-links"><a href="/nieuws">Nieuws & Waarschuwingen →</a><a href="/hondenbelasting">Hondenbelasting per gemeente →</a><a href="/wandelen">Wandelroutes & Losloopgebieden →</a><a href="/verzekering">Hondenverzekering Vergelijken →</a></div></section></main><footer><a href="/">TrimGids</a><span>Samen zorgen we dat elke vermiste hond snel en veilig weer thuis is.</span></footer><script>const missingGrid=document.getElementById('missing-grid');const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const loadMissing=async()=>{try{const res=await fetch('/api/missing');const data=await res.json();renderMissing(data.missing||[]);}catch(e){missingGrid.innerHTML='<p>Kon signalementen niet laden.</p>';}};const renderMissing=items=>{missingGrid.replaceChildren();if(!items.length){missingGrid.innerHTML='<p class="empty">Momenteel geen actieve vermissingen geregistreerd.</p>';return;}items.forEach(item=>{const isFound=item.status==='found';const art=document.createElement('article');art.className='missing-card'+(isFound?' found-card':'');art.innerHTML='<div class="missing-badge '+(isFound?'badge-found':'badge-active')+'">'+(isFound?'🎉 HERENIGD / GEVONDEN':'🚨 VERMIST')+ '</div><h3>'+esc(item.name)+' ('+esc(item.breed)+')</h3><div class="missing-meta"><span>📍 '+esc(item.locationLastSeen)+' ('+esc(item.city)+')</span><span>📅 Vermist sinds: '+esc(item.dateMissing)+'</span><span>🐕 '+esc(item.gender||'Onbekend')+' '+(item.age?'· '+esc(item.age)+' jaar':'')+'</span><span>'+(item.chipRegistered?'✅ Gechipt & geregistreerd':'⚠️ Niet gechipt')+'</span></div><p class="missing-desc">'+esc(item.description)+'</p>'+(item.reward?'<div class="reward-tag">🎁 '+esc(item.reward)+'</div>':'')+(isFound?'<div class="found-msg">Deze hond is veilig thuisgekomen!</div>':('<div class="missing-actions"><a class="btn-tel" href="tel:'+esc(item.contactPhone)+'">📞 Bel contactpersoon ('+esc(item.contactPhone)+')</a><button class="btn-resolve" data-id="'+esc(item.id)+'">Markeer als gevonden</button></div>'));missingGrid.appendChild(art);});document.querySelectorAll('.btn-resolve').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('Weet je zeker dat deze hond veilig herenigd/gevonden is?'))return;const res=await fetch('/api/missing/'+encodeURIComponent(btn.dataset.id)+'/resolve',{method:'POST'});if(res.ok)loadMissing();}));};loadMissing();const form=document.getElementById('missing-form');const status=document.getElementById('missing-status');form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);try{const res=await fetch('/api/missing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),breed:data.get('breed'),city:data.get('city'),locationLastSeen:data.get('locationLastSeen'),dateMissing:data.get('dateMissing'),gender:data.get('gender'),contactPhone:data.get('contactPhone'),reward:data.get('reward'),description:data.get('description'),chipRegistered:data.get('chipRegistered')==='on'})});if(!res.ok)throw new Error();status.textContent='Je vermissingsmelding staat direct live! Heel veel succes en sterkte.';status.className='status-msg success full';form.reset();loadMissing();}catch(err){status.textContent='Het formulier kon niet verwerkt worden. Controleer of alle verplichte velden zijn ingevuld.';status.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone Dog Tax Page */
function dogTaxPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondenbelasting per Gemeente 2026: Waar en Hoeveel? | TrimGids</title><meta name="description" content="Overzicht van de hondenbelasting in 2026 in alle Nederlandse gemeenten. Ontdek welke gemeenten hondenbelasting hebben afgeschaft (€0,-) en waar je nog betaalt."><link rel="canonical" href="https://trimgids.nl/hondenbelasting"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom heffen sommige gemeenten nog steeds hondenbelasting?","acceptedAnswer":{"@type":"Answer","text":"Hondenbelasting is een algemene gemeentelijke belasting die naar de algemene middelen vloeit. Gemeenten zijn niet verplicht de opbrengst te besteden aan hondenvoorzieningen."}},{"@type":"Question","name":"Welke grote steden hebben de hondenbelasting afgeschaft?","acceptedAnswer":{"@type":"Answer","text":"Onder andere Amsterdam, Rotterdam, Utrecht, Eindhoven, Heerlen, Sittard-Geleen, Roermond en Weert rekenen € 0,- hondenbelasting."}}]}</script><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting" style="color:var(--green);font-weight:700">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenbelasting per gemeente</p><span class="eyebrow">Gemeentelijke Tarievenwijzer 2026</span><h1>Hondenbelasting per Gemeente: Waar en Hoeveel?</h1><p class="intro">In meer dan twee derde van de Nederlandse gemeenten is de historische hondenbelasting inmiddels volledig afgeschaft (€ 0,-). Toch heffen diverse gemeenten nog jaarlijks tientallen tot honderden euro's. Zoek hieronder direct jouw gemeente op.</p><div class="stats-row"><div class="stat-card"><strong>68%</strong><span>Gemeenten met € 0,- tarief (Afgeschaft)</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>€ 100,34</strong><span>Gemiddeld tarief (actieve heffing)</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>Limburg & NL</strong><span>28+ gemeenten geanalyseerd</span></div></div><div class="tax-controls"><input type="search" id="tax-search" placeholder="🔍 Zoek op gemeente (bijv. Maastricht, Heerlen, Sittard, Venlo, Amsterdam, Utrecht...)" autocomplete="off"><div class="tax-filters"><button class="tax-filter-btn active" data-status="">Alle gemeenten</button><button class="tax-filter-btn" data-status="afgeschaft">✅ Afgeschaft (€ 0,-)</button><button class="tax-filter-btn" data-status="actief">💶 Actieve heffing</button></div></div><div class="table-wrap"><table class="tax-table"><thead><tr><th>Gemeente</th><th>Provincie</th><th>Status</th><th>1e Hond</th><th>2e Hond</th><th>Toelichting & Vrijstellingen</th></tr></thead><tbody id="tax-tbody"><tr><td colspan="6">Tarieven laden...</td></tr></tbody></table></div><section class="guide-box"><h2>Veelgestelde vragen over hondenbelasting</h2><div class="faq-grid"><div class="faq-card"><h3>Waarom betaal ik hondenbelasting?</h3><p>Hondenbelasting stamt uit de middeleeuwen (oorspronkelijk ter bestrijding van hondsdolheid). Tegenwoordig is het een algemene belasting die naar de algemene gemeentekas vloeit.</p></div><div class="faq-card"><h3>Geldt er een vrijstelling voor hulphonden?</h3><p>Ja, in vrijwel elke gemeente zijn blindengeleidehonden, officiële assistentiehonden en honden in dierenasiels 100% vrijgesteld van belasting.</p></div><div class="faq-card"><h3>Hoe weet de gemeente of ik een hond heb?</h3><p>Gemeenten voeren periodiek hondencontroles uit via steekproeven aan de deur of controleren registraties bij de Rijksdienst voor Ondernemend Nederland (RVO chipdatabank).</p></div></div></section><section class="next"><span class="eyebrow">Handige links</span><h2>Ontdek meer voor jouw hond</h2><div class="next-links"><a href="/wandelen">Wandelroutes & Losloopbossen →</a><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a></div></section></main><footer><a href="/">TrimGids</a><span>Data gecontroleerd op basis van officiële gemeentelijke belastingverordeningen 2026.</span></footer><script>let activeTaxStatus='';const tbody=document.getElementById('tax-tbody');const search=document.getElementById('tax-search');const loadTax=async()=>{try{const q=encodeURIComponent(search.value.trim());const st=encodeURIComponent(activeTaxStatus);const res=await fetch('/api/dog-tax?query='+q+'&status='+st);const data=await res.json();tbody.replaceChildren();if(!data.items?.length){tbody.innerHTML='<tr><td colspan="6" style="padding:20px;text-align:center">Geen gemeenten gevonden voor deze zoekopdracht.</td></tr>';return;}data.items.forEach(d=>{const isAbolished=d.status==='afgeschaft';const tr=document.createElement('tr');tr.innerHTML='<td><strong>'+d.gemeente+'</strong></td><td>'+d.provincie+'</td><td><span class="tax-badge '+(isAbolished?'badge-zero':'badge-active-tax')+'">'+(isAbolished?'Afgeschaft (€ 0)':'Actief')+'</span></td><td>'+(isAbolished?'€ 0,-':('€ '+d.tarief1eHond.toFixed(2)))+'</td><td>'+(isAbolished?'€ 0,-':('€ '+d.tarief2eHond.toFixed(2)))+'</td><td><small>'+d.toelichting+'</small></td>';tbody.appendChild(tr);});}catch(e){tbody.innerHTML='<tr><td colspan="6">Kon tarieven niet laden.</td></tr>';}};search.addEventListener('input',loadTax);document.querySelectorAll('.tax-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tax-filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTaxStatus=btn.dataset.status;loadTax();}));loadTax();</script></body></html>`;
}

/* Standalone Walking & routes.apexclusive.nl Page */
function walkingPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wandelroutes, Omheinde Losloopbossen & Hondenstranden | TrimGids</title><meta name="description" content="Ontdek de mooiste losloopgebieden, 100% omheinde speelbossen en hondenstranden in Limburg en Nederland. Powered by routes.apexclusive.nl met GPX navigatie."><link rel="canonical" href="https://trimgids.nl/wandelen"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.routes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:30px 0}.route-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 10px rgba(0,0,0,.04)}.route-card h2{font-size:22px;margin:0}.route-tags{display:flex;gap:6px;flex-wrap:wrap}.badge-fenced{background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.badge-water{background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.badge-dist{background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.route-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:14px;gap:10px;flex-wrap:wrap}.btn-apex{background:var(--green);color:#fff;font-weight:700;font-size:13px;padding:9px 16px;border-radius:999px;text-decoration:none}.btn-maps{color:var(--green);font-weight:700;font-size:13px;text-decoration:none}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen" style="color:var(--green);font-weight:700">Wandelen & Stranden</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Wandelroutes & Losloopgebieden</p><span class="eyebrow">Wandelen in Limburg & Nederland · Powered by routes.apexclusive.nl</span><h1>Wandelroutes, Speelbossen & Hondenstranden</h1><p class="intro">Heerlijk samen op pad zonder aanlijnstress. Hieronder vind je de mooiste wandelroutes, 100% omheinde speelbossen voor angstige/ontsnappingsgevoelige honden, en officiële hondenstranden met schoon zwemwater. Bekijk interactieve hoogteprofielen en GPX-bestanden direct via <strong>routes.apexclusive.nl</strong>.</p><div class="filter-bar"><button class="f-btn active" data-filter="">Alle gebieden</button><button class="f-btn" data-filter="omheind">🔒 100% Omheind Speelbos</button><button class="f-btn" data-filter="strand">💧 Hondenstrand & Zwemwater</button><button class="f-btn" data-filter="limburg">🌲 Zuid- & Midden-Limburg</button></div><div id="routes-container" class="routes-grid"><p>Wandelroutes laden...</p></div><section class="guide-box"><h2>Gouden regels voor veilig loslopen</h2><div class="steps-grid"><div class="step-card"><h3>1. Respecteer het broedseizoen</h3><p>Tussen 15 maart en 15 juli geldt in veel natuurgebieden een strikte aanlijnplicht om jonge reekalfjes, hazen en op de grond broedende vogels rust te gunnen.</p></div><div class="step-card"><h3>2. Pas op met stilstaand water in de zomer</h3><p>Laat je hond bij warm weer nooit drinken of zwemmen in water met een blauwgroene drijflaag (blauwalg) of bij dode watervogels (botulisme).</p></div><div class="step-card"><h3>3. Draag een GPS-tracker of penning</h3><p>In onbekende heuvels of dichte bossen is een GPS-tracker aan het tuigje de beste garantie dat je je hond altijd binnen enkele minuten terugvindt.</p></div></div></section><section class="next"><span class="eyebrow">Handige links</span><h2>Ontdek meer</h2><div class="next-links"><a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" rel="noopener noreferrer">Wandelen in Limburg (routes.apexclusive.nl) ↗</a><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/hondenbelasting">Hondenbelasting per gemeente →</a></div></section></main><footer><a href="/">TrimGids</a><span>In samenwerking met routes.apexclusive.nl — De beste wandelgids voor Limburg en omstreken.</span></footer><script>let activeRouteFilter='';const container=document.getElementById('routes-container');let allRoutes=[];const loadRoutes=async()=>{try{const res=await fetch('/api/routes');const data=await res.json();allRoutes=data.routes||[];renderRoutes();}catch(e){container.innerHTML='<p>Kon routes niet laden.</p>';}};const renderRoutes=()=>{container.replaceChildren();const filtered=allRoutes.filter(r=>{if(activeRouteFilter==='omheind')return r.fenced===true;if(activeRouteFilter==='strand')return r.type==='hondenstrand'||r.waterAccess===true;if(activeRouteFilter==='limburg')return r.province==='Limburg';return true;});if(!filtered.length){container.innerHTML='<p>Geen routes gevonden voor deze filter.</p>';return;}filtered.forEach(r=>{const art=document.createElement('article');art.className='route-card';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(r.lat+','+r.lng)+'&travelmode=driving';art.innerHTML='<div class="route-tags">'+(r.fenced?'<span class="badge-fenced">🔒 100% Omheind</span>':'<span class="badge-fenced" style="background:#f3f4f6;color:#374151">🌲 Natuurgebied</span>')+(r.waterAccess?'<span class="badge-water">💧 Zwemwater</span>':'')+'<span class="badge-dist">📏 '+r.distanceKm+' km</span></div><h2>'+r.title+'</h2><p style="font-size:14px;color:var(--muted);margin:0;line-height:1.55">'+r.description+'</p><div style="font-size:13px;color:var(--muted)">📍 '+r.city+' ('+r.region+', '+r.province+')<br>🅿️ '+r.parking+'</div><div class="route-foot"><a class="btn-apex" href="'+r.apexclusiveUrl+'" target="_blank" rel="noopener noreferrer">Bekijk op routes.apexclusive.nl ↗</a><a class="btn-maps" href="'+maps+'" target="_blank" rel="noopener noreferrer">🧭 Navigeer (Google Maps) ↗</a></div>';container.appendChild(art);});};document.querySelectorAll('.f-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeRouteFilter=btn.dataset.filter;renderRoutes();}));loadRoutes();</script></body></html>`;
}

/* Standalone Interactive Map Page */
function mapPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Interactieve Landkaart Honden Nederland 2026: Salons, Scholen, Opvang & Bossen | TrimGids</title><meta name="description" content="Vind alle trimsalons, hondenscholen, hondenhotels, wellness/fysiotherapie en hondenstranden in heel Nederland op één interactieve kaart. Direct navigeren en bellen."><link rel="canonical" href="https://trimgids.nl/kaart"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}#map-container{height:720px;width:100%;border-radius:24px;border:1px solid var(--line);box-shadow:0 6px 24px rgba(0,0,0,.06);margin-top:20px;z-index:1}.custom-pin{width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid #fff;transition:transform .18s ease}.custom-pin:hover{transform:rotate(-45deg) scale(1.15)}.custom-pin>span{transform:rotate(45deg);font-size:15px;line-height:1}.pin-trimsalon{background:#1E523A}.pin-hondenschool{background:#3730A3}.pin-opvang{background:#D97706}.pin-wellness{background:#0D9488}.pin-routes{background:#059669}.popup-card h4{font-family:Fraunces,serif;font-size:19px;margin:4px 0 6px}.popup-card p{color:var(--muted);margin:4px 0 10px;font-size:13px;line-height:1.45}.popup-card .p-meta{display:flex;gap:8px;font-size:12px;margin-bottom:10px;flex-wrap:wrap}.popup-card .btn-nav-map{display:inline-flex;align-items:center;gap:5px;background:var(--green);color:#fff!important;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;text-decoration:none}.popup-card .btn-tel-map{display:inline-flex;align-items:center;gap:5px;background:#f3f4f6;color:var(--ink)!important;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;text-decoration:none;border:1px solid var(--line)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart" style="color:var(--green);font-weight:700">Interactieve Kaart</a><a href="/hondenschool">Hondenscholen</a><a href="/opvang">Opvang & Hotels</a><a href="/wellness">Wellness & Fysio</a><a href="/wandelen">Wandelen</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Interactieve Landkaart Nederland</p><span class="eyebrow">Landelijk Locatieoverzicht 2026</span><h1>Interactieve Kaart voor Honden in Nederland</h1><p class="intro">Vind direct professionele trimsalons, erkende hondenscholen, hondenhotels, dierfysiotherapie en officiële losloopgebieden & stranden in alle 12 provincies van Nederland. Gebruik de live filters om direct te navigeren.</p><div class="map-controls" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><input type="search" id="map-search" placeholder="🔍 Zoek op stad, naam of provincie (bijv. Maastricht, Amsterdam, Utrecht, Breda, Groningen...)" style="flex:1;min-width:280px;padding:13px 18px;border:1px solid var(--line);border-radius:14px;font:inherit"><button id="btn-geoloc" class="btn" style="background:#fff;border:1px solid var(--line);padding:12px 18px;border-radius:14px;font-weight:700;cursor:pointer">📍 Bij mij in de buurt</button></div><div class="filter-bar" style="margin:16px 0 0" id="filter-bar"><button class="f-btn active" data-filter="all" id="btn-f-all">Alles tonen</button><button class="f-btn" data-filter="trimsalon" id="btn-f-trim">✂️ Trimsalons</button><button class="f-btn" data-filter="hondenschool" id="btn-f-school">🎓 Hondenscholen</button><button class="f-btn" data-filter="opvang" id="btn-f-opvang">🏨 Opvang & Hotels</button><button class="f-btn" data-filter="wellness" id="btn-f-well">💆 Wellness & Fysio</button><button class="f-btn" data-filter="routes" id="btn-f-routes">🌲 Wandelen & Stranden</button></div><div id="map-container"></div><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer populaire diensten & vergelijkers</h2><div class="next-links"><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a><a href="/verzekering">Hondenverzekering 2026 →</a><a href="/voeding">Beste Verse Voeding →</a><a href="/dna-test">Honden DNA Testen →</a><a href="/hondenbelasting">Hondenbelasting Tarieven →</a></div></section></main><footer><a href="/">TrimGids</a><span>Navigatiegegevens worden direct doorgezet naar Google Maps / Apple Maps.</span></footer><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script><script>let map;let markers=[];let activeFilter='all';let allLocations=[];const getPinIcon=(cat,isRoute)=>{const c=isRoute?'routes':cat;const emoji={trimsalon:'✂️',hondenschool:'🎓',opvang:'🏨',wellness:'💆',routes:'🌲'}[c]||'🐾';return L.divIcon({className:'',html:'<div class="custom-pin pin-'+c+'"><span>'+emoji+'</span></div>',iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-34]});};const initMap=()=>{map=L.map('map-container').setView([52.1,5.3],7.5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map);loadData();};const loadData=async()=>{try{const [provRes,routesRes]=await Promise.all([fetch('/api/providers'),fetch('/api/routes')]);const provData=await provRes.json();const routesData=await routesRes.json();allLocations=[...(provData.providers||[]).map(p=>({...p,isRoute:false})),...(routesData.routes||[]).map(r=>({...r,isRoute:true,name:r.title,category:'routes'}))];updateCounts();renderMarkers();}catch(e){console.error('Data error:',e);}};const updateCounts=()=>{const total=allLocations.length;const trims=allLocations.filter(i=>i.category==='trimsalon'&&!i.isRoute).length;const schools=allLocations.filter(i=>i.category==='hondenschool'&&!i.isRoute).length;const opvang=allLocations.filter(i=>i.category==='opvang'&&!i.isRoute).length;const wellness=allLocations.filter(i=>i.category==='wellness'&&!i.isRoute).length;const routes=allLocations.filter(i=>i.isRoute).length;document.getElementById('btn-f-all').textContent='Alles tonen ('+total+')';document.getElementById('btn-f-trim').textContent='✂️ Trimsalons ('+trims+')';document.getElementById('btn-f-school').textContent='🎓 Hondenscholen ('+schools+')';document.getElementById('btn-f-opvang').textContent='🏨 Opvang & Hotels ('+opvang+')';document.getElementById('btn-f-well').textContent='💆 Wellness & Fysio ('+wellness+')';document.getElementById('btn-f-routes').textContent='🌲 Wandelen & Stranden ('+routes+')';};const renderMarkers=()=>{markers.forEach(m=>map.removeLayer(m));markers=[];const query=document.getElementById('map-search').value.toLowerCase().trim();const filtered=allLocations.filter(item=>{const matchCat=activeFilter==='all'||(item.category===activeFilter)||(activeFilter==='routes'&&item.isRoute);const matchQ=!query||(item.name&&item.name.toLowerCase().includes(query))||(item.city&&item.city.toLowerCase().includes(query))||(item.province&&item.province.toLowerCase().includes(query))||(item.address&&item.address.toLowerCase().includes(query));return matchCat&&matchQ;});const bounds=[];filtered.forEach(item=>{if(!item.lat||!item.lng)return;const mapsUri='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(item.lat+','+item.lng)+'&travelmode=driving';const marker=L.marker([item.lat,item.lng],{icon:getPinIcon(item.category,item.isRoute)});const popupHtml='<div class="popup-card"><h4>'+(item.isRoute?'🌲 ':'🐾 ')+(item.name||'Locatie')+'</h4><div class="p-meta"><span>📍 '+(item.city||'')+(item.province?' ('+item.province+')':'')+'</span>'+(item.rating?'<span>⭐ '+item.rating+' ('+item.reviewCount+' reviews)</span>':'')+(item.startingPrice?'<span>💶 Vanaf €'+item.startingPrice+'</span>':'')+'</div><p>'+(item.description||item.address||'')+'</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><a class="btn-nav-map" href="'+mapsUri+'" target="_blank" rel="noopener noreferrer">🧭 Navigeer (Maps) ↗</a>'+(item.phone?'<a class="btn-tel-map" href="tel:'+item.phone+'">📞 '+item.phone+'</a>':'')+'</div></div>';marker.bindPopup(popupHtml);marker.addTo(map);markers.push(marker);bounds.push([item.lat,item.lng]);});if(bounds.length){map.fitBounds(bounds,{padding:[40,40],maxZoom:14});}};document.querySelectorAll('.f-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;renderMarkers();}));document.getElementById('map-search').addEventListener('input',renderMarkers);document.getElementById('btn-geoloc').addEventListener('click',()=>{if(navigator.geolocation){navigator.geolocation.getCurrentPosition(pos=>{const lat=pos.coords.latitude;const lng=pos.coords.longitude;map.setView([lat,lng],13);L.circleMarker([lat,lng],{radius:8,fillColor:'#1E523A',color:'#fff',weight:3,opacity:1,fillOpacity:0.9}).addTo(map).bindPopup('<strong>📍 Jouw huidige locatie</strong>').openPopup();});}else{alert('Geolocatie wordt niet ondersteund door je browser.');}});initMap();</script></body></html>`;
}

function customModuleStyles() {
  return `
.filter-bar{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0 32px}.f-btn,.tax-filter-btn{font:inherit;font-size:14px;font-weight:600;padding:9px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;transition:.18s}.f-btn:hover,.tax-filter-btn:hover{border-color:var(--green);color:var(--green)}.f-btn.active,.tax-filter-btn.active{background:var(--green);color:#fff;border-color:var(--green)}.news-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:22px}.news-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,.04)}.news-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}.news-badge{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.badge-misstand{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}.badge-waarschuwing{background:#fef3c7;color:#92400e;border:1px solid #fcd34d}.badge-goed{background:#dcfce7;color:#166534;border:1px solid #86efac}.badge-wet{background:#e0e7ff;color:#3730a3;border:1px solid #c7d2fe}.news-date{font-size:12px;color:var(--muted)}.news-card h3{font-size:20px;line-height:1.25;margin:0}.news-sum{font-weight:600;color:var(--ink);font-size:14px;line-height:1.45}.news-body{font-size:14px;color:var(--muted);line-height:1.55;flex:1}.news-foot{border-top:1px solid var(--line);padding-top:10px;font-size:12px;color:var(--muted)}.tip-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:36px;margin:50px 0}.tip-box-head{margin-bottom:24px}.tip-box-head h2{font-size:30px;margin:8px 0}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form-grid label{display:grid;gap:6px;font-size:13px;font-weight:600}.form-grid .full{grid-column:1/-1}.form-grid input,.form-grid select,.form-grid textarea{font:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff}.form-grid textarea{min-height:120px;resize:vertical}.btn-submit{background:var(--green);color:#fff;font:inherit;font-weight:700;padding:14px 24px;border:0;border-radius:999px;cursor:pointer}.status-msg{padding:12px 16px;border-radius:10px;font-size:14px;font-weight:600}.status-msg.success{background:#dcfce7;color:#166534}.status-msg.error{background:#fee2e2;color:#991b1b}.quick-links-bar{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0 40px}.q-link{padding:11px 18px;border-radius:999px;border:1px solid var(--line);font-weight:600;font-size:14px;background:#fff}.q-link.highlight{background:#fee2e2;border-color:#fca5a5;color:#991b1b}.missing-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:22px;margin:24px 0 50px}.missing-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:24px;display:grid;gap:12px;box-shadow:0 4px 14px rgba(0,0,0,.06)}.missing-card.found-card{border-color:#86efac;box-shadow:none;background:#fcfdfc}.missing-badge{justify-self:start;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px}.badge-active{background:#fee2e2;color:#991b1b}.badge-found{background:#dcfce7;color:#166534}.missing-meta{display:grid;gap:4px;font-size:13px;color:var(--muted)}.missing-desc{font-size:14px;line-height:1.5}.reward-tag{background:#fef3c7;color:#92400e;font-weight:700;font-size:13px;padding:6px 12px;border-radius:8px}.missing-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}.btn-tel{background:#2f6b4f;color:#fff;padding:9px 15px;border-radius:999px;font-weight:700;font-size:13px}.btn-resolve{background:#fff;border:1px solid var(--line);padding:9px 15px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer}.btn-resolve:hover{background:#f3f4f6}.guide-box{padding:40px;background:var(--cream);border-radius:24px;margin:40px 0;border:1px solid var(--line)}.guide-box h2{font-size:32px;margin:10px 0 24px}.steps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.step-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px}.step-num{font:700 36px Fraunces,serif;color:#b91c1c;margin-bottom:8px}.step-card h3{font-size:18px;margin-bottom:8px}.step-card p{font-size:14px;color:var(--muted);line-height:1.5}.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:30px 0 40px}.stat-card{background:var(--green-light);border-left:4px solid var(--green);border-radius:14px;padding:20px}.stat-card strong{display:block;font:700 36px Fraunces,serif;color:var(--green);line-height:1.1}.stat-card span{font-size:14px;color:var(--muted)}.tax-controls{display:grid;gap:14px;margin-bottom:20px}#tax-search{width:100%;padding:14px 18px;font:inherit;font-size:16px;border:1px solid var(--line);border-radius:14px;background:#fff}.tax-filters{display:flex;gap:10px;flex-wrap:wrap}.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:18px;background:#fff}.tax-table{width:100%;border-collapse:collapse;font-size:14px;text-align:left}.tax-table th{background:var(--cream);padding:14px 18px;font-weight:700;color:var(--ink);border-bottom:1px solid var(--line)}.tax-table td{padding:14px 18px;border-bottom:1px solid var(--line);vertical-align:top}.tax-badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:700}.badge-zero{background:#dcfce7;color:#166534}.badge-active-tax{background:#fee2e2;color:#991b1b}.faq-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-top:20px}.faq-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px}.faq-card h3{font-size:18px;margin-bottom:8px}.faq-card p{font-size:14px;color:var(--muted);line-height:1.55}@media(max-width:768px){.form-grid{grid-template-columns:1fr}.guide-box,.tip-box{padding:24px}}
`;
}

/* Provider Detail Page */
function providerPage(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'trimsalon' || parts.length !== 4) return null;
  const [, citySlug, breedSlug, providerSlug] = parts;
  const provider = catalog.providers.find(item => item.slug === providerSlug && item.city === citySlug && (item.breeds.includes(breedSlug) || item.breeds.includes('alle-rassen')));
  const place = catalog.places[citySlug];
  const breed = catalog.breeds[breedSlug];
  if (!provider || !place || !breed) return null;

  const canonical = `/trimsalon/${citySlug}/${breedSlug}/${providerSlug}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.address}`)}`;
  const title = `${provider.name} — ${breed.name} Trimsalon in ${place.name} | TrimGids`;
  const description = `${provider.name} in ${place.name}: professionele vachtverzorging voor ${breed.name}, specialisaties, vanafprijs (€${provider.startingPrice || 55}) en route. Lees klantervaringen en reserveer.`;

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "TrimGids", "item": "https://trimgids.nl/" },
          { "@type": "ListItem", "position": 2, "name": `Trimsalon ${place.name}`, "item": `https://trimgids.nl/trimsalon/${citySlug}` },
          { "@type": "ListItem", "position": 3, "name": `${breed.name} ${place.name}`, "item": `https://trimgids.nl/trimsalon/${citySlug}/${breedSlug}` },
          { "@type": "ListItem", "position": 4, "name": provider.name, "item": `https://trimgids.nl${canonical}` }
        ]
      },
      {
        "@type": "GroomingSalon",
        "name": provider.name,
        "description": provider.description,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": provider.address,
          "addressLocality": place.name,
          "addressRegion": provider.province || place.province,
          "addressCountry": "NL"
        },
        "geo": provider.lat && provider.lng ? {
          "@type": "GeoCoordinates",
          "latitude": provider.lat,
          "longitude": provider.lng
        } : undefined,
        "telephone": provider.phone || undefined,
        "url": provider.website || `https://trimgids.nl${canonical}`,
        "priceRange": provider.startingPrice ? `€${provider.startingPrice}+` : "€€",
        "aggregateRating": provider.rating ? {
          "@type": "AggregateRating",
          "ratingValue": provider.rating,
          "reviewCount": provider.reviewCount || 10
        } : undefined
      }
    ]
  });

  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://trimgids.nl${canonical}"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><meta property="og:type" content="business.business"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="https://trimgids.nl${canonical}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">${schemaJson}</script><style>${directoryStyles()}.form-row{display:grid;gap:8px;margin-top:18px}.form-row label{display:grid;gap:5px;color:var(--muted);font-size:14px}.form-row input,.form-row select,.form-row textarea{font:inherit;border:1px solid var(--line);border-radius:10px;padding:10px}.form-row textarea{min-height:100px;resize:vertical}.form-row button{justify-self:start}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon/${citySlug}/${breedSlug}">Terug naar ${breed.name} ${place.name}</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting">Hondenbelasting</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / <a href="/trimsalon/${citySlug}">${escapeHtml(place.name)}</a> / <a href="/trimsalon/${citySlug}/${breedSlug}">${escapeHtml(breed.name)}</a> / ${escapeHtml(provider.name)}</p><span class="eyebrow">${provider.demo ? 'Voorbeeldprofiel' : 'Geverifieerd Aanbiederprofiel'}</span><h1>${escapeHtml(provider.name)}</h1><p class="intro">${escapeHtml(description)}</p><div class="summary"><strong>€${provider.startingPrice || 55}</strong><span>vanafprijsindicatie<br><small>Inclusief wassen, drogen en rasverzorging</small></span></div><section><div class="section-head"><div><span class="eyebrow">Aanbiedersdetails</span><h2>Waarom deze salon bij jouw ${breed.name} past</h2></div><a class="outline" href="${maps}" target="_blank" rel="noopener noreferrer">Kaart & route →</a></div><article class="provider"><div><span class="label">Geverifieerde TrimGids-partner</span><h2>${escapeHtml(provider.name)}</h2><p class="address">${escapeHtml(provider.address)}</p><div class="chips">${provider.specializations.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><div class="provider-actions"><a href="${maps}" target="_blank" rel="noopener noreferrer">🧭 Google Maps openen →</a>${provider.phone ? `<a href="tel:${escapeHtml(provider.phone)}" style="color:var(--green);font-weight:700">📞 ${escapeHtml(provider.phone)}</a>` : ''}<a href="/?claim=${encodeURIComponent(provider.slug)}#bedrijven" style="font-size:12px;color:var(--muted)">Vermelding beheren →</a></div></article></section><section class="guide"><h2>Vachtverzorging voor een ${escapeHtml(breed.name)}</h2><p>${escapeHtml(breed.summary)}</p><ul>${breed.care.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section class="guide"><h2>Klantervaringen & Reviews</h2><div id="own-reviews"><p>Reviews laden...</p></div><form id="review-form" class="form-row"><label>Jouw naam<input name="author" required maxlength="40"></label><label>Beoordeling<select name="rating"><option value="5">5 sterren (Uitstekend)</option><option value="4">4 sterren (Goed)</option><option value="3">3 sterren (Voldoende)</option><option value="2">2 sterren (Matig)</option><option value="1">1 ster (Slecht)</option></select></label><label>Je ervaring met deze salon<textarea name="body" required maxlength="1000" placeholder="Hoe reageerde je hond? Was het resultaat naar wens?"></textarea></label><button class="outline" type="submit">Ervaring insturen</button><p id="review-status"></p></form></section></main><footer><a href="/">TrimGids</a><span>TrimGids — Het onafhankelijke platform voor hondenbaasjes in Nederland.</span></footer><script>const providerSlug=${JSON.stringify(provider.slug)};const reviews=document.getElementById('own-reviews');const status=document.getElementById('review-status');const render=items=>{reviews.replaceChildren();if(!items.length){reviews.append(Object.assign(document.createElement('p'),{textContent:'Nog geen goedgekeurde TrimGids-reviews. Wees de eerste!'}));return;}items.forEach(item=>{const article=document.createElement('article');article.className='google-review';const title=document.createElement('strong');title.textContent=item.rating+' ★ · '+item.author;const body=document.createElement('p');body.textContent=item.body;article.append(title,body);reviews.append(article);});};fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews').then(response=>response.json()).then(data=>render(data.reviews||[])).catch(()=>{reviews.textContent='Reviews zijn tijdelijk niet beschikbaar.'});document.getElementById('review-form').addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(event.currentTarget);const response=await fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:data.get('author'),rating:data.get('rating'),body:data.get('body')})});status.textContent=response.ok?'Bedankt. Je review staat klaar voor moderatie.':'Je review kon niet worden verstuurd.';if(response.ok)event.currentTarget.reset();});</script></body></html>`;
}

/* Comprehensive SEO Directory & Breed Hub Engine */
function directoryPage(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return null;

  let category = 'trimsalon';
  let placeSlug = null;
  let breedSlug = null;
  let isBreedHub = false;

  const validCategories = ['trimsalon', 'hondenschool', 'opvang', 'wellness'];

  if (parts[0] === 'rassen' && parts.length === 2) {
    breedSlug = parts[1];
    isBreedHub = true;
  } else if (validCategories.includes(parts[0])) {
    category = parts[0];
    if (parts.length === 2) {
      if (catalog.breeds[parts[1]]) {
        breedSlug = parts[1];
        isBreedHub = true;
      } else if (catalog.places[parts[1]]) {
        placeSlug = parts[1];
      } else {
        return null;
      }
    } else if (parts.length === 3) {
      if (catalog.places[parts[1]] && catalog.breeds[parts[2]]) {
        placeSlug = parts[1];
        breedSlug = parts[2];
      } else {
        return null;
      }
    } else if (parts.length > 3) {
      return null;
    }
  } else {
    return null;
  }

  const place = placeSlug ? catalog.places[placeSlug] : null;
  const breed = breedSlug ? catalog.breeds[breedSlug] : null;

  if (placeSlug && !place) return null;
  if (breedSlug && !breed) return null;

  const categoryNames = {
    trimsalon: 'Trimsalons',
    hondenschool: 'Hondenscholen & Training',
    opvang: 'Hondenopvang & Hotels',
    wellness: 'Hondenwellness & Hydrotherapie'
  };
  const catLabel = categoryNames[category] || 'Trimsalons';

  // Providers matching
  let providers = catalog.providers.filter(p => {
    const matchCat = (p.category === category || (category === 'trimsalon' && !p.category));
    const matchPlace = !placeSlug || p.city === placeSlug;
    const matchBreed = !breedSlug || (p.breeds && (p.breeds.includes(breedSlug) || p.breeds.includes('alle-rassen')));
    return matchCat && matchPlace && matchBreed;
  });

  // Fallback regional/nationwide providers if specific city/breed has 0
  let isFallback = false;
  if (!providers.length && (breedSlug || placeSlug)) {
    isFallback = true;
    providers = catalog.providers.filter(p => {
      const matchCat = (p.category === category || category === 'trimsalon');
      const matchBreed = !breedSlug || (p.breeds && (p.breeds.includes(breedSlug) || p.breeds.includes('alle-rassen')));
      return matchCat && matchBreed;
    });
  }

  // SEO Page Title & Meta Description Construction
  let title = '';
  let metaDesc = '';
  let h1 = '';
  let canonical = '';

  if (isBreedHub && breed) {
    title = `Trimsalon ${breed.name}: Prijzen, Ontwollen & Salons | TrimGids`;
    metaDesc = `Zoek je de beste trimsalon voor een ${breed.name}? Bekijk advies over ontwollen, efileren, kosten (${breed.avgCostRange}), verzorging en gecertificeerde salons in Nederland.`;
    h1 = `Trimsalon voor ${breed.name}`;
    canonical = parts[0] === 'rassen' ? `/rassen/${breedSlug}` : `/trimsalon/${breedSlug}`;
  } else if (breed && place) {
    title = `Trimsalon ${breed.name} in ${place.name}: Prijzen, Reviews & Boeken 2026 | TrimGids`;
    metaDesc = `Vind gecertificeerde trimsalons voor een ${breed.name} in ${place.name}. Vergelijk ${providers.length}+ trimsalons op raservaring, ontwollen, teddy beer cuts, vanaf-prijzen en reviews.`;
    h1 = `Trimsalon voor ${breed.name} in ${place.name}`;
    canonical = `/${category}/${placeSlug}/${breedSlug}`;
  } else if (place) {
    title = `${catLabel} in ${place.name}: Vergelijk Aanbieders & Tarieven 2026 | TrimGids`;
    metaDesc = `Vind de beste ${catLabel.toLowerCase()} in ${place.name} (${place.region || place.province}). Vergelijk betrouwbare professionals op raservaring, tarieven, klantervaringen en navigatie.`;
    h1 = `${catLabel} in ${place.name}`;
    canonical = `/${category}/${placeSlug}`;
  } else {
    title = `${catLabel} in Nederland: Vergelijk Salons & Scholen per Regio | TrimGids`;
    metaDesc = `Het complete en onafhankelijke overzicht van ${catLabel.toLowerCase()} in Nederland. Zoek per provincie, stad en specifiek hondenras.`;
    h1 = `${catLabel} in Nederland`;
    canonical = `/${category}`;
  }

  // Schema.org Structured Data
  const breadcrumbsList = [
    { "@type": "ListItem", "position": 1, "name": "TrimGids", "item": "https://trimgids.nl/" },
    { "@type": "ListItem", "position": 2, "name": catLabel, "item": `https://trimgids.nl/${category}` }
  ];
  if (place) {
    breadcrumbsList.push({ "@type": "ListItem", "position": 3, "name": place.name, "item": `https://trimgids.nl/${category}/${placeSlug}` });
  }
  if (breed) {
    breadcrumbsList.push({ "@type": "ListItem", "position": breadcrumbsList.length + 1, "name": breed.name, "item": `https://trimgids.nl${canonical}` });
  }

  const schemaGraph = [
    {
      "@type": "WebSite",
      "name": "TrimGids",
      "url": "https://trimgids.nl/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://trimgids.nl/trimsalon/{search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbsList
    }
  ];

  // FAQ Schema if breed has faqs
  if (breed && breed.faqs && breed.faqs.length) {
    schemaGraph.push({
      "@type": "FAQPage",
      "mainEntity": breed.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    });
  }

  // Provider Schema ItemList
  if (providers.length) {
    schemaGraph.push({
      "@type": "ItemList",
      "name": title,
      "itemListElement": providers.slice(0, 10).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "GroomingSalon",
          "name": p.name,
          "address": p.address,
          "telephone": p.phone || undefined,
          "priceRange": p.startingPrice ? `€${p.startingPrice}+` : "€€"
        }
      }))
    });
  }

  const schemaJson = JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph });

  // Provider cards rendering
  const cardsHtml = providers.length ? providers.map(p => {
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}`)}`;
    const providerUrl = `/trimsalon/${p.city}/${breedSlug || (p.breeds && p.breeds[0]) || 'labradoodle'}/${p.slug}`;
    return `<article class="provider">
      <div>
        <span class="label">Geverifieerd lid</span>
        <h2><a href="${providerUrl}">${escapeHtml(p.name)}</a></h2>
        <p class="address">📍 ${escapeHtml(p.address)}</p>
        <div class="chips">
          ${(p.specializations || []).map(s => `<span>${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
      <div class="provider-actions">
        <span>${p.startingPrice ? `Vanaf €${p.startingPrice}` : 'Prijs op aanvraag'}</span>
        <a href="${maps}" target="_blank" rel="noopener noreferrer">🧭 Kaart & route →</a>
        ${p.phone ? `<a href="tel:${escapeHtml(p.phone)}" style="color:var(--green);font-weight:700">📞 ${escapeHtml(p.phone)}</a>` : ''}
        <a href="${providerUrl}" class="outline" style="padding:7px 14px;font-size:13px">Bekijk salonprofiel →</a>
      </div>
    </article>`;
  }).join('') : `<div class="empty"><h2>Geen directe vermeldingen in deze specifieke selectie</h2><p>Bekijk hieronder nabijgelegen salons of vraag een offerte aan.</p></div>`;

  // Alopecia / Clipping Warning for Pomeranians & double-coated breeds
  let warningBox = '';
  if (breedSlug === 'pomeriaan') {
    warningBox = `
    <div style="background:#fff1f2;border:2px solid #fda4af;border-radius:20px;padding:26px;margin:32px 0">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <span style="font-size:28px">⚠️</span>
        <h3 style="color:#9f1239;font-size:22px;margin:0">Belangrijke waarschuwing: Scheer een Pomeriaan NOOIT kort!</h3>
      </div>
      <p style="color:#881337;font-size:15px;line-height:1.6;margin:0">
        Een Pomeriaan (Dwergkeeshond) heeft een dubbele vacht die werkt als thermische isolatie tegen zowel kou als hitte. Kort scheren met een tondeuse beschadigt de haarzakjes en leidt vaak tot <strong>Post-Clipping Alopecia</strong> (Black Skin Disease), waardoor het haar niet meer of in doffe plukken terug groeit. Gekwalificeerde trimsalons op TrimGids <strong>ontwollen</strong> de ondervacht met een waterblazer en modelleren de vacht uitsluitend handmatig met de <strong>efileerschaar</strong> in een natuurlijk rond model.
      </p>
    </div>`;
  }

  // Breed Quick Stats Box
  let breedStatsHtml = '';
  if (breed) {
    breedStatsHtml = `
    <div style="background:var(--cream);border:1px solid var(--line);border-radius:22px;padding:28px;margin:32px 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:18px">
        <div>
          <span class="eyebrow" style="color:var(--green)">Vachtspecificaties & Tarieven</span>
          <h2 style="font-size:26px;margin:4px 0">${escapeHtml(breed.name)} Vachtgids</h2>
        </div>
        <span class="badge" style="background:var(--green-light);color:var(--green);font-size:14px;padding:7px 14px">Triminterval: elke ${breed.groomingIntervalWeeks} weken</span>
      </div>
      <p style="color:var(--muted);font-size:16px;line-height:1.55;margin-bottom:18px">${escapeHtml(breed.summary)}</p>
      <div class="stats-row" style="margin:0 0 20px">
        <div class="stat-card" style="background:#fff"><strong>${breed.avgCostRange}</strong><span>Gemiddelde kosten per beurt</span></div>
        <div class="stat-card" style="background:#fff;border-left-color:var(--amber)"><strong>${breed.sheddingLevel}</strong><span>Rui- / verharingsniveau</span></div>
        <div class="stat-card" style="background:#fff;border-left-color:#3730a3"><strong>${breed.brushingFrequency}</strong><span>Aanbevolen borstelfrequentie</span></div>
      </div>
      <div>
        <strong style="font-size:15px;color:var(--ink)">Aanbevolen verzorgingstechniek:</strong>
        <p style="color:var(--muted);font-size:14px;margin:4px 0 14px">${escapeHtml(breed.technique)}</p>
        <strong style="font-size:15px;color:var(--ink)">Essentiële do's en don'ts:</strong>
        <ul style="margin-top:8px;padding-left:20px;color:var(--muted);font-size:14px;line-height:1.6">
          ${breed.care.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  // Breed FAQs HTML Accordion
  let faqsHtml = '';
  if (breed && breed.faqs && breed.faqs.length) {
    faqsHtml = `
    <section class="guide-box" style="margin-top:40px">
      <span class="eyebrow">Veelgestelde Vragen</span>
      <h2>Veelgestelde vragen over het trimmen van een ${escapeHtml(breed.name)}</h2>
      <div class="faq-grid">
        ${breed.faqs.map(f => `
          <div class="faq-card">
            <h3 style="font-size:18px;margin-bottom:8px">❓ ${escapeHtml(f.q)}</h3>
            <p style="font-size:14px;color:var(--muted);line-height:1.6">${escapeHtml(f.a)}</p>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  // Quote Lead Form Wizard HTML
  const quoteFormHtml = `
  <section class="tip-box" style="margin-top:45px">
    <div class="tip-box-head">
      <span class="eyebrow" style="color:var(--green)">Direct Contact & Tarieven</span>
      <h2>Vrijblijvend tarief opvragen voor jouw ${breed ? breed.name : 'hond'} in ${place ? place.name : 'jouw regio'}</h2>
      <p>Ontvang binnen 24 uur reactie van geverifieerde trimsalons met ervaring met jouw ras.</p>
    </div>
    <form class="form-grid" id="dir-quote-form">
      <label>Jouw naam<input name="name" required placeholder="Bijv. Laura"></label>
      <label>Telefoonnummer<input name="phone" type="tel" required placeholder="06-12345678"></label>
      <label>E-mailadres<input name="email" type="email" required placeholder="jouw@email.nl"></label>
      <label>Woonplaats<input name="city" required value="${place ? escapeHtml(place.name) : ''}" placeholder="Bijv. Maastricht"></label>
      <label>Ras van je hond<input name="breed" required value="${breed ? escapeHtml(breed.name) : ''}" placeholder="Bijv. Pomeriaan"></label>
      <label>Gewenste dienst<select name="service"><option>Volledige trimbeurt (wassen, ontwollen/knippen)</option><option>Alleen ontwollen & wassen</option><option>Puppy wenbezoek</option><option>Nagels knippen & oren reinigen</option></select></label>
      <button class="btn-submit full" type="submit">Vrijblijvende Offerte Aanvragen →</button>
      <p id="dir-quote-status" class="status-msg full" style="display:none"></p>
    </form>
  </section>`;

  // Cross-linking: Cities & Breeds pills
  const allBreedsList = Object.keys(catalog.breeds || {});
  const allPlacesList = Object.keys(catalog.places || {});

  const cityPillsHtml = `
  <div style="margin:28px 0">
    <strong style="font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:10px">Bekijk ${breed ? breed.name : 'trimsalons'} per stad:</strong>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${allPlacesList.slice(0, 14).map(pSlug => {
        const pObj = catalog.places[pSlug];
        const targetUrl = breedSlug ? `/trimsalon/${pSlug}/${breedSlug}` : `/trimsalon/${pSlug}`;
        const isActive = pSlug === placeSlug;
        return `<a href="${targetUrl}" class="outline" style="font-size:13px;padding:7px 14px;background:${isActive ? 'var(--green)' : '#fff'};color:${isActive ? '#fff' : 'inherit'}">${escapeHtml(pObj.name)}</a>`;
      }).join('')}
    </div>
  </div>`;

  const breedPillsHtml = `
  <div style="margin:28px 0">
    <strong style="font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:10px">Vergelijk andere hondenrassen:</strong>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${allBreedsList.map(bSlug => {
        const bObj = catalog.breeds[bSlug];
        const targetUrl = placeSlug ? `/trimsalon/${placeSlug}/${bSlug}` : `/trimsalon/${bSlug}`;
        const isActive = bSlug === breedSlug;
        return `<a href="${targetUrl}" class="outline" style="font-size:13px;padding:7px 14px;background:${isActive ? 'var(--green)' : '#fff'};color:${isActive ? '#fff' : 'inherit'}">${escapeHtml(bObj.name)}</a>`;
      }).join('')}
    </div>
  </div>`;

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<link rel="canonical" href="https://trimgids.nl${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDesc)}">
<meta property="og:url" content="https://trimgids.nl${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(metaDesc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${schemaJson}</script>
<style>${directoryStyles()}${customModuleStyles()}</style>
</head>
<body>
<header>
  <nav>
    <a class="logo" href="/">🐾 TrimGids</a>
    <div class="nav-links">
      <a href="/trimsalon" style="color:var(--green);font-weight:700">Trimsalons</a>
      <a href="/kaart">Interactieve Kaart</a>
      <a href="/verzekering">Hondenverzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/nieuws">Nieuws & Alerts</a>
      <a href="/vermist">Vermist</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
      <a href="/">Home</a>
    </div>
  </nav>
</header>
<main>
  <p class="crumb">
    <a href="/">TrimGids</a> / <a href="/${category}">${catLabel}</a>
    ${place ? ` / <a href="/${category}/${placeSlug}">${escapeHtml(place.name)}</a>` : ''}
    ${breed ? ` / ${escapeHtml(breed.name)}` : ''}
  </p>
  <span class="eyebrow">${breed && place ? `${escapeHtml(place.name)} · ${escapeHtml(breed.name)}` : (breed ? 'Ras & Vachtverzorging' : (place ? `${escapeHtml(place.name)} Regio` : 'Gids'))}</span>
  <h1>${escapeHtml(h1)}</h1>
  <p class="intro">${escapeHtml(metaDesc)}</p>

  ${warningBox}
  ${breedStatsHtml}

  <section>
    <div class="section-head">
      <div>
        <span class="eyebrow">Aanbod & Beschikbaarheid</span>
        <h2>${isFallback ? `Aanbevolen salons voor ${breed ? breed.name : 'jouw regio'} in Nederland` : `Aanbieders ${breed ? `voor ${breed.name}` : ''} in ${place ? place.name : 'Nederland'}`}</h2>
      </div>
      <a class="outline" href="/kaart">Bekijk op kaart →</a>
    </div>
    <div class="providers">
      ${cardsHtml}
    </div>
  </section>

  ${quoteFormHtml}
  ${cityPillsHtml}
  ${breedPillsHtml}
  ${faqsHtml}

  <section class="next">
    <span class="eyebrow">Handige links</span>
    <h2>Ontdek meer voor jouw hond</h2>
    <div class="next-links">
      <a href="/verzekering">Hondenverzekering Vergelijken 2026 →</a>
      <a href="/wandelen">Wandelroutes & Losloopbossen →</a>
      <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" rel="noopener noreferrer">Wandelen in Limburg (routes.apexclusive.nl) ↗</a>
      <a href="/nieuws">Hondennieuws & Waarschuwingen →</a>
      <a href="/hondenbelasting">Hondenbelasting per gemeente →</a>
      <a href="/vermist">Vermiste honden & 24-uurs noodplan →</a>
    </div>
  </section>
</main>
<footer>
  <a href="/">TrimGids</a>
  <span>TrimGids — Het onafhankelijke platform voor trimsalons, scholen en hondenwelzijn in Nederland.</span>
</footer>
<script>
const quoteForm = document.getElementById('dir-quote-form');
const quoteStatus = document.getElementById('dir-quote-status');
if (quoteForm) {
  quoteForm.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(quoteForm);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          email: data.get('email'),
          city: data.get('city'),
          breed: data.get('breed'),
          service: data.get('service')
        })
      });
      if (!res.ok) throw new Error();
      quoteStatus.style.display = 'block';
      quoteStatus.className = 'status-msg success full';
      quoteStatus.textContent = '✓ Bedankt! Je offerte-aanvraag is verstuurd. Salons nemen snel contact met je op.';
      quoteForm.reset();
    } catch (err) {
      quoteStatus.style.display = 'block';
      quoteStatus.className = 'status-msg error full';
      quoteStatus.textContent = 'Er ging iets mis. Controleer je gegevens en probeer opnieuw.';
    }
  });
}
</script>
</body>
</html>`;
}

function directoryStyles() {
  return `:root{--green:#1E523A;--green-dark:#163e2c;--green-light:#e6f0eb;--cream:#f8f6f1;--ink:#1f2937;--ink-2:#4b5563;--muted:#596273;--line:#e7e5e0;--amber:#c98a2b;--max:1140px}*{box-sizing:border-box}body{margin:0;color:var(--ink);font:16px/1.6 Inter,system-ui,sans-serif;background:#fff}h1,h2,h3{font-family:Fraunces,Georgia,serif;line-height:1.15}h1{font-size:clamp(34px,4.5vw,54px);max-width:920px;margin:16px 0 20px}h2{font-size:clamp(24px,3vw,34px);margin:10px 0 12px}a{color:inherit;text-decoration:none}.eyebrow{color:var(--green);font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.wrap,main,nav,footer{max-width:var(--max);margin:auto}header{border-bottom:1px solid var(--line);background:rgba(255,255,255,.96);position:sticky;top:0;z-index:40;backdrop-filter:blur(10px)}nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;color:var(--muted);gap:16px}.nav-links{display:flex;gap:18px;font-size:14px;font-weight:600;align-items:center}.nav-links a:hover{color:var(--green)}.logo{color:var(--ink);font:800 23px Fraunces,Georgia,serif;display:flex;align-items:center;gap:8px}.crumb{color:var(--muted);font-size:14px;margin-bottom:28px}.crumb a{text-decoration:underline;text-underline-offset:3px}main{padding:36px 22px 80px}.intro{max-width:820px;color:var(--ink-2);font-size:18px;line-height:1.55}.summary{display:flex;align-items:center;gap:15px;margin:24px 0 40px;padding:18px 20px;border-left:4px solid var(--green);background:var(--green-light);max-width:440px;border-radius:0 14px 14px 0}.summary strong{font:700 38px Fraunces,Georgia,serif;color:var(--green)}.summary span{line-height:1.35}.summary small{color:var(--muted)}section{margin-top:50px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.outline{border:1px solid var(--line);border-radius:999px;padding:10px 18px;font-weight:600;background:#fff;display:inline-block;transition:.15s}.outline:hover{border-color:var(--green);color:var(--green)}.providers{display:grid;gap:16px}.provider{display:flex;justify-content:space-between;gap:24px;padding:26px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.04)}.provider h2{font-size:24px;margin:7px 0}.provider p{margin:0;color:var(--muted)}.label{display:inline-block;padding:4px 10px;border-radius:999px;background:var(--green-light);color:var(--green);font-size:12px;font-weight:700}.provider-actions{display:flex;align-items:flex-end;flex-direction:column;justify-content:space-between;gap:12px;white-space:nowrap;color:var(--muted)}.provider-actions a{color:var(--green);font-weight:700}.chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.chips span{background:var(--cream);padding:4px 10px;border-radius:999px;color:var(--muted);font-size:12px}.guide{padding:34px;background:var(--cream);border-radius:22px;max-width:860px}.guide p,.guide li{color:var(--muted)}.guide a,.next-links a{color:var(--green);font-weight:700}.empty{padding:28px;background:var(--cream);border-radius:18px}.empty p{color:var(--muted)}.next{border-top:1px solid var(--line);padding-top:40px;margin-top:55px}.next-links{display:flex;gap:14px;flex-wrap:wrap}.next-links a{border:1px solid var(--line);padding:10px 16px;border-radius:12px;background:#fff}.next-links a:hover{border-color:var(--green);background:var(--green-light)}footer{border-top:1px solid var(--line);padding:32px 22px 48px;display:flex;justify-content:space-between;gap:20px;color:var(--muted);font-size:14px;background:var(--cream)}footer a{font:800 20px Fraunces,Georgia,serif;color:var(--ink)}@media(max-width:840px){.nav-links{display:none}main{padding-top:20px}.crumb{margin-bottom:20px}.section-head{align-items:flex-start;flex-direction:column}.provider{display:block}.provider-actions{align-items:flex-start;margin-top:20px}footer{flex-direction:column}}
`;
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) return json(res, 403, { error: 'forbidden' });
  try {
    const content = await readFile(file);
    res.writeHead(200, secureHeaders({ 'Content-Type': mimeTypes[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }));
    res.end(content);
  } catch { json(res, 404, { error: 'not_found' }); }
}

await loadDotEnv();
googleKey = process.env.GOOGLE_PLACES_API_KEY || '';
adminToken = process.env.ADMIN_TOKEN || '';
try { catalog = JSON.parse(await readFile(catalogFile, 'utf8')); } catch (error) { console.error('Catalogus kon niet worden geladen:', error.message); }
try { routesData = JSON.parse(await readFile(routesFile, 'utf8')); } catch (error) { console.error('Routes konden niet worden geladen:', error.message); }
try { insuranceData = JSON.parse(await readFile(insuranceFile, 'utf8')); } catch (error) { console.error('Verzekeringen konden niet worden geladen:', error.message); }
try { productsData = JSON.parse(await readFile(productsFile, 'utf8')); } catch (error) { console.error('Producten konden niet worden geladen:', error.message); }
try { lastMinuteData = JSON.parse(await readFile(lastMinuteFile, 'utf8')); } catch (error) { console.error('Last-minute slots konden niet worden geladen:', error.message); }
try { dnaTestsData = JSON.parse(await readFile(dnaTestsFile, 'utf8')); } catch (error) { console.error('DNA tests konden niet worden geladen:', error.message); }
try { foodData = JSON.parse(await readFile(foodFile, 'utf8')); } catch (error) { console.error('Voeding data kon niet worden geladen:', error.message); }
try { emergencyVetsData = JSON.parse(await readFile(emergencyVetsFile, 'utf8')); } catch (error) { console.error('Spoedartsen data kon niet worden geladen:', error.message); }
try { puppyCostsData = JSON.parse(await readFile(puppyCostsFile, 'utf8')); } catch (error) { console.error('Puppykosten data kon niet worden geladen:', error.message); }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    /* Search Engines: Sitemap.xml & Robots.txt */
    if (url.pathname === '/sitemap.xml' && req.method === 'GET') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }));
      return res.end(generateSitemap());
    }
    if (url.pathname === '/robots.txt' && req.method === 'GET') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }));
      return res.end(robotsTxt());
    }

    /* Core Providers API */
    if (url.pathname === '/api/providers' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const breed = clean(url.searchParams.get('breed'), 60);
      const category = clean(url.searchParams.get('category'), 60);
      let list = catalog.providers;
      if (category) list = list.filter(p => p.category === category);
      if (city) list = list.filter(p => p.city === slugify(city));
      if (breed) list = list.filter(p => p.breeds && (p.breeds.includes(slugify(breed)) || p.breeds.includes('alle-rassen')));
      return json(res, 200, { providers: list });
    }

    /* Google Places Search (Live proxy) */
    if (url.pathname === '/api/search' && req.method === 'GET') {
      if (!rateLimit(req, rateLimits.search, 30, 60000)) return json(res, 429, { error: 'rate_limited' });
      const query = clean(url.searchParams.get('q'), 100);
      if (!query) return json(res, 200, { places: [], message: 'no_query' });
      return json(res, 200, await googlePlacesSearch(query));
    }

    if (url.pathname === '/api/place-details' && req.method === 'GET') {
      const id = clean(url.searchParams.get('id'), 120);
      if (!id) return json(res, 400, { error: 'missing_id' });
      return json(res, 200, await googlePlaceDetails(id));
    }

    /* Insurance API */
    if (url.pathname === '/api/insurance' && req.method === 'GET') {
      const ins = await collectionList(insuranceFile);
      return json(res, 200, { insurance: ins.length ? ins : insuranceData.insurance });
    }

    /* DNA Tests API */
    if (url.pathname === '/api/dna-tests' && req.method === 'GET') {
      const tests = await collectionList(dnaTestsFile);
      return json(res, 200, { tests: tests.length ? tests : dnaTestsData.tests });
    }

    /* Food & Nutrition API */
    if (url.pathname === '/api/foods' && req.method === 'GET') {
      const foods = await collectionList(foodFile);
      return json(res, 200, { foods: foods.length ? foods : foodData.foods });
    }

    /* Emergency Vets API */
    if (url.pathname === '/api/emergency-vets' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const clinics = await collectionList(emergencyVetsFile);
      let list = clinics.length ? clinics : emergencyVetsData.clinics;
      if (city) list = list.filter(c => c.city.toLowerCase() === city.toLowerCase() || c.province.toLowerCase() === city.toLowerCase());
      return json(res, 200, { clinics: list });
    }

    /* Puppy & Dog Costs API */
    if (url.pathname === '/api/costs' && req.method === 'GET') {
      const costs = await collectionList(puppyCostsFile);
      return json(res, 200, costs.categories ? costs : puppyCostsData);
    }

    /* Products Recommender API */
    if (url.pathname === '/api/products' && req.method === 'GET') {
      const breed = clean(url.searchParams.get('breed'), 60);
      const allProds = await collectionList(productsFile);
      let list = allProds.length ? allProds : productsData.products;
      if (breed) {
        list = list.filter(p => !p.breeds?.length || p.breeds.includes(slugify(breed)) || p.breeds.includes('alle-rassen'));
      }
      return json(res, 200, { products: list });
    }

    /* Last-minute Slots API */
    if (url.pathname === '/api/last-minute' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const slots = await collectionList(lastMinuteFile);
      let list = (slots.length ? slots : lastMinuteData.slots).filter(s => !s.claimed);
      if (city) list = list.filter(s => s.city.toLowerCase() === city.toLowerCase());
      return json(res, 200, { slots: list });
    }

    if (url.pathname.startsWith('/api/last-minute/') && url.pathname.endsWith('/claim') && req.method === 'POST') {
      const id = decodeURIComponent(url.pathname.slice('/api/last-minute/'.length, -'/claim'.length));
      const slots = await collectionList(lastMinuteFile);
      const index = slots.findIndex(s => s.id === id);
      if (index < 0) throw new Error('slot_not_found');
      slots[index].claimed = true;
      slots[index].claimedAt = new Date().toISOString();
      await writeFile(lastMinuteFile, JSON.stringify(slots, null, 2) + '\n');
      return json(res, 200, { ok: true, slot: slots[index] });
    }

    /* Quote Lead API */
    if (url.pathname === '/api/quotes' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { quote: await quoteCreate(await readJson(req)) });
    }

    /* Coat Calculator API */
    if (url.pathname === '/api/calculator' && req.method === 'GET') {
      const breedKey = slugify(url.searchParams.get('breed')) || 'labradoodle';
      const ageMonths = Number.parseInt(url.searchParams.get('ageMonths'), 10) || 12;
      const breed = catalog.breeds[breedKey] || catalog.breeds.labradoodle;
      
      let interval = breed.groomingIntervalWeeks || 6;
      let notes = [];
      if (ageMonths < 6) {
        interval = 4;
        notes.push('Puppy-fase: Focus op speelse gewenning, pootjes knippen en geluid van de waterblazer.');
      } else if (ageMonths >= 6 && ageMonths <= 14 && ['labradoodle', 'goldendoodle', 'cockapoo', 'poedel'].includes(breedKey)) {
        interval = Math.max(4, interval - 2);
        notes.push('Vachtwissel-fase: Verhoogde kans op plotselinge viltvorming! Dagelijks controleren met metalen kam.');
      }
      return json(res, 200, {
        breed: breed.name,
        coat: breed.coat,
        groomingIntervalWeeks: interval,
        brushingFrequency: breed.brushingFrequency,
        technique: breed.technique,
        avgCostRange: breed.avgCostRange,
        sheddingLevel: breed.sheddingLevel,
        specialNotes: notes,
        recommendedTools: [
          'ActiVet Pro Slickerborstel',
          'Metalen grove/fijne combikam',
          'Professionele waterblazer 2400W'
        ]
      });
    }

    /* Walking Routes API */
    if (url.pathname === '/api/routes' && req.method === 'GET') {
      const province = clean(url.searchParams.get('province'), 40);
      const type = clean(url.searchParams.get('type'), 40);
      return json(res, 200, { routes: await routesList(province, type) });
    }

    /* Municipal Dog Tax API */
    if (url.pathname === '/api/dog-tax' && req.method === 'GET') {
      const query = clean(url.searchParams.get('query'), 60);
      const status = clean(url.searchParams.get('status'), 30);
      return json(res, 200, { items: await dogTaxData(query, status) });
    }

    /* Matches Matchmaker API */
    if (url.pathname === '/api/matches' && req.method === 'GET') {
      const city = slugify(url.searchParams.get('city'));
      const breed = slugify(url.searchParams.get('breed'));
      const sensitive = url.searchParams.get('sensitive') === 'true';
      const all = catalog.providers.filter(p => !city || p.city === city);
      const breedExp = all.filter(p => !breed || (p.breeds && (p.breeds.includes(breed) || p.breeds.includes('alle-rassen'))));
      const sensitiveExp = breedExp.filter(p => p.specializations?.some(s => s.toLowerCase().includes('angst') || s.toLowerCase().includes('gevoelig') || s.toLowerCase().includes('rust')));
      return json(res, 200, {
        total: all.length,
        breedExperience: breedExp.length,
        sensitiveExperience: sensitive ? sensitiveExp.length : breedExp.length,
        providers: (sensitive ? sensitiveExp : breedExp).slice(0, 5)
      });
    }

    /* Profiles API */
    if (url.pathname === '/api/profiles' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { profile: await profileCreate(await readJson(req)) });
    }

    /* Claims API */
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/claim') && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 10, 60000)) return json(res, 429, { error: 'rate_limited' });
      const slug = decodeURIComponent(url.pathname.slice('/api/providers/'.length, -'/claim'.length));
      return json(res, 201, { claim: await claimCreate(slug, await readJson(req)) });
    }

    /* Reviews API */
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/reviews') && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 10, 60000)) return json(res, 429, { error: 'rate_limited' });
      const slug = decodeURIComponent(url.pathname.slice('/api/providers/'.length, -'/reviews'.length));
      return json(res, 201, { review: await reviewCreate(slug, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/reviews') && req.method === 'GET') {
      const slug = decodeURIComponent(url.pathname.slice('/api/providers/'.length, -'/reviews'.length));
      const list = (await collectionList(reviewsFile)).filter(r => r.providerSlug === slug && r.status === 'approved');
      return json(res, 200, { reviews: list });
    }

    /* Help Requests API */
    if (url.pathname === '/api/requests' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const breed = clean(url.searchParams.get('breed'), 60);
      const list = (await collectionList(helpRequestsFile)).filter(r => (!city || r.city === city) && (!breed || r.breed === breed) && r.status === 'open');
      return json(res, 200, { requests: list });
    }
    if (url.pathname === '/api/requests' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 10, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { request: await helpRequestCreate(await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/requests/') && url.pathname.endsWith('/responses') && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      const requestId = decodeURIComponent(url.pathname.slice('/api/requests/'.length, -'/responses'.length));
      return json(res, 201, { response: await responseCreate(requestId, await readJson(req)) });
    }

    /* Polls API */
    if (url.pathname === '/api/polls' && req.method === 'GET') {
      return json(res, 200, await pollData(url.searchParams.get('breed')));
    }
    if (url.pathname.startsWith('/api/polls/') && url.pathname.endsWith('/vote') && req.method === 'POST') {
      const pollId = decodeURIComponent(url.pathname.slice('/api/polls/'.length, -'/vote'.length));
      return json(res, 200, await pollVote(pollId, await readJson(req)));
    }

    /* Forum API */
    if (url.pathname === '/api/forum' && req.method === 'GET') {
      return json(res, 200, { topics: await forumTopics() });
    }
    if (url.pathname === '/api/forum' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 10, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { topic: await forumCreate(await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/replies') && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/replies'.length));
      return json(res, 201, { reply: await forumReplyCreate(topicId, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/helpful') && req.method === 'POST') {
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/helpful'.length));
      return json(res, 201, await forumHelpful(topicId, await readJson(req)));
    }

    /* News & Tips API */
    if (url.pathname === '/api/news' && req.method === 'GET') {
      const category = clean(url.searchParams.get('category'), 40);
      const region = clean(url.searchParams.get('region'), 60);
      return json(res, 200, { news: await newsList(category, region) });
    }
    if (url.pathname === '/api/news/tips' && req.method === 'POST') {
      return json(res, 201, { tip: await newsTipCreate(await readJson(req)) });
    }

    /* Missing Dogs API */
    if (url.pathname === '/api/missing' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const status = clean(url.searchParams.get('status'), 30);
      return json(res, 200, { missing: await missingList(city, status) });
    }
    if (url.pathname === '/api/missing' && req.method === 'POST') {
      return json(res, 201, { missing: await missingCreate(await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/missing/') && url.pathname.endsWith('/resolve') && req.method === 'POST') {
      const id = decodeURIComponent(url.pathname.slice('/api/missing/'.length, -'/resolve'.length));
      return json(res, 200, { missing: await missingResolve(id) });
    }

    /* Admin Moderation Endpoints */
    if (url.pathname === '/admin' && req.method === 'GET') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }));
      return res.end(adminPage());
    }
    if (url.pathname === '/api/admin/moderation' && req.method === 'GET') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, {
        reviews: (await collectionList(reviewsFile)).filter(r => r.status === 'pending'),
        claims: (await collectionList(claimsFile)).filter(c => c.status === 'pending'),
        newsTips: (await collectionList(newsTipsFile)).filter(t => t.status === 'pending'),
        missing: (await collectionList(missingFile)).filter(m => m.status === 'active'),
        quotes: (await collectionList(quotesFile)).filter(q => q.status === 'pending')
      });
    }
    if (url.pathname.startsWith('/api/admin/reviews/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { review: await moderate(reviewsFile, decodeURIComponent(url.pathname.slice('/api/admin/reviews/'.length)), (await readJson(req)).status) });
    }
    if (url.pathname.startsWith('/api/admin/claims/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { claim: await moderate(claimsFile, decodeURIComponent(url.pathname.slice('/api/admin/claims/'.length)), (await readJson(req)).status) });
    }
    if (url.pathname.startsWith('/api/admin/news-tips/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { tip: await moderate(newsTipsFile, decodeURIComponent(url.pathname.slice('/api/admin/news-tips/'.length)), (await readJson(req)).status) });
    }
    if (url.pathname.startsWith('/api/admin/missing/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { missing: await moderate(missingFile, decodeURIComponent(url.pathname.slice('/api/admin/missing/'.length)), (await readJson(req)).status) });
    }
    if (url.pathname.startsWith('/api/admin/quotes/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { quote: await moderate(quotesFile, decodeURIComponent(url.pathname.slice('/api/admin/quotes/'.length)), (await readJson(req)).status) });
    }

    /* SSR Dedicated Content Hubs */
    if (url.pathname === '/nieuws') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(newsPage());
    }
    if (url.pathname === '/vermist') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(missingPage());
    }
    if (url.pathname === '/hondenbelasting') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(dogTaxPage());
    }
    if (url.pathname === '/verzekering') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(insurancePage());
    }
    if (url.pathname === '/dna-test' || url.pathname === '/dna-testen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(dnaPage());
    }
    if (url.pathname === '/voeding' || url.pathname === '/hondenvoer' || url.pathname === '/verse-maaltijden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(foodPage());
    }
    if (url.pathname === '/spoed-dierenarts' || url.pathname === '/spoeddierenarts') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(emergencyVetPage());
    }
    if (url.pathname === '/kosten-hond' || url.pathname === '/wat-kost-een-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(costPage());
    }
    if (url.pathname === '/wandelen' || url.pathname === '/losloopgebieden' || url.pathname === '/hondenstranden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(walkingPage());
    }
    if (url.pathname === '/kaart') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(mapPage());
    }

    /* Dynamic directory / provider / breed pages */
    const generatedPage = providerPage(url.pathname) || directoryPage(url.pathname);
    if (generatedPage) {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(generatedPage);
    }

    /* Static files fallback */
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    const clientErrors = [
      'missing_fields', 'request_too_large', 'profile_missing_fields', 'claim_invalid_contact',
      'review_invalid_fields', 'request_invalid_fields', 'response_invalid_fields', 'request_not_found',
      'poll_not_found', 'poll_invalid_vote', 'poll_already_voted', 'forum_topic_not_found',
      'forum_reaction_invalid', 'forum_already_reacted', 'invalid_moderation_status',
      'moderation_item_not_found', 'news_tip_invalid_fields', 'missing_dog_invalid_fields',
      'missing_dog_not_found', 'quote_invalid_fields', 'slot_not_found'
    ];
    const status = clientErrors.includes(error.message) ? 400 : 502;
    json(res, status, { error: error.message || 'server_error' });
  }
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`TrimGids draait op http://localhost:${port}`);
});
