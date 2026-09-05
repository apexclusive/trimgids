import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('.', import.meta.url));
const forumFile = join(root, 'data', 'forum.json');
const catalogFile = join(root, 'data', 'catalog.json');
const profilesFile = join(root, 'data', 'profiles.json');
const claimsFile = join(root, 'data', 'claims.json');
const reviewsFile = join(root, 'data', 'reviews.json');
const requestsFile = join(root, 'data', 'requests.json');
const responsesFile = join(root, 'data', 'responses.json');
const pollsFile = join(root, 'data', 'polls.json');
const pollVotesFile = join(root, 'data', 'poll-votes.json');
const forumTopicsFile = join(root, 'data', 'forum-topics.json');
const forumRepliesFile = join(root, 'data', 'forum-replies.json');
const forumReactionsFile = join(root, 'data', 'forum-reactions.json');
const port = Number(process.env.PORT || 3000);
let googleKey = '';
let adminToken = '';
let catalog = { places: {}, breeds: {}, providers: [] };
const rateBuckets = new Map();
const googleCache = new Map();
const cacheTtl = 60_000;

async function loadDotEnv() {
  try {
    const content = await readFile(join(root, '.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {}
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function json(res, status, body) {
  res.writeHead(status, secureHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }));
  res.end(JSON.stringify(body));
}

function secureHeaders(headers = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...headers
  };
}

function rateLimit(req, bucket, limit, windowMs) {
  const key = `${bucket}:${req.socket.remoteAddress || 'unknown'}`;
  const now = Date.now();
  const existing = rateBuckets.get(key);
  if (!existing || now - existing.startedAt >= windowMs) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= limit;
}

function clean(value, max = 500) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error('request_too_large');
  }
  return JSON.parse(body || '{}');
}

function mapPlace(place) {
  const photo = place.photos?.[0]?.name || null;
  return {
    id: place.id,
    name: place.displayName?.text || 'Onbekende aanbieder',
    address: place.formattedAddress || '',
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    googleMapsUri: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || '')}`,
    website: place.websiteUri || null,
    phone: place.nationalPhoneNumber || null,
    openNow: place.regularOpeningHours?.openNow ?? null,
    weekdayHours: place.regularOpeningHours?.weekdayDescriptions || [],
    photoUrl: photo ? `/api/photo?name=${encodeURIComponent(photo)}` : null,
    reviews: (place.reviews || []).map(review => ({
      author: review.authorAttribution?.displayName || 'Google-gebruiker',
      rating: review.rating ?? null,
      text: review.text?.text || '',
      relativeTime: review.relativePublishTimeDescription || ''
    }))
  };
}

async function googlePlacesSearch(query) {
  if (!googleKey) return { configured: false, places: [], message: 'Google Places is nog niet geconfigureerd.' };
  const cached = googleCache.get(`search:${query}`);
  if (cached && Date.now() - cached.createdAt < cacheTtl) return cached.value;
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.photos'
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'nl', regionCode: 'NL', maxResultCount: 20 })
  });
  if (!response.ok) throw new Error(`google_places_${response.status}`);
  const data = await response.json();
  const value = { configured: true, places: (data.places || []).map(mapPlace) };
  googleCache.set(`search:${query}`, { createdAt: Date.now(), value });
  return value;
}

async function googlePlaceDetails(id) {
  if (!googleKey) return { configured: false, message: 'Google Places is nog niet geconfigureerd.' };
  const cached = googleCache.get(`details:${id}`);
  if (cached && Date.now() - cached.createdAt < cacheTtl) return cached.value;
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: {
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,websiteUri,nationalPhoneNumber,regularOpeningHours,photos,reviews'
    }
  });
  if (!response.ok) throw new Error(`google_place_${response.status}`);
  const value = { configured: true, place: mapPlace(await response.json()) };
  googleCache.set(`details:${id}`, { createdAt: Date.now(), value });
  return value;
}

async function forumList() {
  try { return JSON.parse(await readFile(forumFile, 'utf8')); } catch { return []; }
}

async function forumTopics() {
  try { return JSON.parse(await readFile(forumTopicsFile, 'utf8')); } catch { return []; }
}

async function forumReplyCreate(topicId, input) {
  const topicExists = (await forumTopics()).some(item => item.id === topicId) || (await forumList()).some(item => item.id === topicId);
  const author = clean(input.author, 40) || 'Anoniem';
  const body = clean(input.body, 1200);
  if (!topicExists || !body) throw new Error('forum_topic_not_found');
  return collectionAdd(forumRepliesFile, { id: crypto.randomUUID(), topicId, author, body, status: 'pending', createdAt: new Date().toISOString() });
}

async function forumHelpful(topicId, input) {
  const voterId = clean(input.voterId, 160);
  if (!voterId) throw new Error('forum_reaction_invalid');
  const voterHash = createHash('sha256').update(`${topicId}:${voterId}`).digest('hex');
  const reactions = await collectionList(forumReactionsFile);
  if (reactions.some(item => item.voterHash === voterHash)) throw new Error('forum_already_reacted');
  await collectionAdd(forumReactionsFile, { id: crypto.randomUUID(), topicId, voterHash, createdAt: new Date().toISOString() }, 100000);
  return { helpful: reactions.filter(item => item.topicId === topicId).length + 1 };
}

async function collectionList(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return []; }
}

async function collectionAdd(file, item, limit = 1000) {
  const items = await collectionList(file);
  items.push(item);
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(file, JSON.stringify(items.slice(-limit), null, 2) + '\n');
  return item;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function profileCreate(input) {
  const profile = {
    id: clean(input.id, 80) || crypto.randomUUID(),
    name: clean(input.name, 40),
    age: Math.max(0, Math.min(30, Number(input.age) || 0)),
    breed: slugify(input.breed),
    city: slugify(input.city),
    sensitive: input.sensitive === true,
    updatedAt: new Date().toISOString()
  };
  if (!profile.breed || !profile.city) throw new Error('profile_missing_fields');
  const profiles = await collectionList(profilesFile);
  const existingIndex = profiles.findIndex(item => item.id === profile.id);
  if (existingIndex >= 0) profiles[existingIndex] = profile;
  else profiles.push(profile);
  await writeFile(profilesFile, JSON.stringify(profiles.slice(-1000), null, 2) + '\n');
  return profile;
}

async function claimCreate(slug, input) {
  const name = clean(input.name, 80);
  const email = clean(input.email, 120);
  if (!name || !validEmail(email)) throw new Error('claim_invalid_contact');
  return collectionAdd(claimsFile, { id: crypto.randomUUID(), providerSlug: slugify(slug), name, email, phone: clean(input.phone, 40), status: 'pending', createdAt: new Date().toISOString() });
}

async function reviewCreate(slug, input) {
  const author = clean(input.author, 40);
  const body = clean(input.body, 1000);
  const rating = Math.max(1, Math.min(5, Number(input.rating) || 0));
  if (!author || !body || !rating) throw new Error('review_invalid_fields');
  return collectionAdd(reviewsFile, { id: crypto.randomUUID(), providerSlug: slugify(slug), author, body, rating, status: 'pending', createdAt: new Date().toISOString() });
}

async function helpRequestCreate(input) {
  const title = clean(input.title, 90);
  const issue = clean(input.issue, 50);
  const breed = slugify(input.breed);
  const city = slugify(input.city);
  const description = clean(input.description, 1500);
  const contactEmail = clean(input.contactEmail, 120);
  if (!title || !issue || !breed || !city || !description || !validEmail(contactEmail) || input.consent !== true) throw new Error('request_invalid_fields');
  return collectionAdd(requestsFile, { id: crypto.randomUUID(), title, issue, breed, city, description, contactEmail, status: 'open', createdAt: new Date().toISOString() });
}

async function responseCreate(requestId, input) {
  const providerSlug = slugify(input.providerSlug);
  const providerName = clean(input.providerName, 100);
  const message = clean(input.message, 1200);
  if (!providerSlug || !providerName || !message) throw new Error('response_invalid_fields');
  const request = (await collectionList(requestsFile)).find(item => item.id === requestId && item.status === 'open');
  if (!request) throw new Error('request_not_found');
  return collectionAdd(responsesFile, { id: crypto.randomUUID(), requestId, providerSlug, providerName, message, status: 'pending', createdAt: new Date().toISOString() });
}

async function pollData(breed) {
  const polls = await collectionList(pollsFile);
  const poll = polls.find(item => item.breed === slugify(breed)) || polls[0];
  if (!poll) throw new Error('poll_not_found');
  const votes = (await collectionList(pollVotesFile)).filter(item => item.pollId === poll.id);
  return { ...poll, total: votes.length, results: poll.options.map(option => ({ option, votes: votes.filter(item => item.option === option).length })) };
}

async function pollVote(pollId, input) {
  const polls = await collectionList(pollsFile);
  const poll = polls.find(item => item.id === pollId);
  const option = clean(input.option, 120);
  const voterId = clean(input.voterId, 160);
  if (!poll || !poll.options.includes(option) || !voterId) throw new Error('poll_invalid_vote');
  const voterHash = createHash('sha256').update(`${pollId}:${voterId}`).digest('hex');
  const votes = await collectionList(pollVotesFile);
  if (votes.some(item => item.voterHash === voterHash)) throw new Error('poll_already_voted');
  await collectionAdd(pollVotesFile, { id: crypto.randomUUID(), pollId, option, voterHash, createdAt: new Date().toISOString() }, 100000);
  return pollData(poll.breed);
}

function adminAuthorized(req) {
  return Boolean(adminToken) && req.headers.authorization === `Bearer ${adminToken}`;
}

async function moderate(file, id, status) {
  if (!['approved', 'rejected'].includes(status)) throw new Error('invalid_moderation_status');
  const items = await collectionList(file);
  const index = items.findIndex(item => item.id === id);
  if (index < 0) throw new Error('moderation_item_not_found');
  items[index] = { ...items[index], status, moderatedAt: new Date().toISOString() };
  await writeFile(file, JSON.stringify(items, null, 2) + '\n');
  return items[index];
}

function adminPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TrimGids moderatie</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:960px;margin:40px auto;padding:0 20px;color:#1f2937}h1{font-size:34px}form{display:flex;gap:8px;margin:20px 0}input,button{font:inherit;padding:10px;border:1px solid #d8d8d8;border-radius:8px}button{cursor:pointer;background:#2f6b4f;color:#fff;border:0}.item{border:1px solid #e7e5e0;border-radius:12px;padding:16px;margin:10px 0}.item p{white-space:pre-wrap}.actions{display:flex;gap:8px}.reject{background:#8a3d36}.muted{color:#687384}</style></head><body><h1>TrimGids moderatie</h1><p class="muted">Deze pagina toont alleen inzendingen na authenticatie. Goedkeuren maakt een eigen review zichtbaar; Google-reviews worden hier niet gewijzigd.</p><form id="auth"><input id="token" type="password" placeholder="Admin-token" autocomplete="current-password" required><button>Inloggen</button></form><main id="content" hidden><p id="status"></p><h2>Reviews</h2><div id="reviews"></div><h2>Claims</h2><div id="claims"></div></main><script>let token='';const content=document.getElementById('content');const status=document.getElementById('status');const esc=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));const load=async()=>{const response=await fetch('/api/admin/moderation',{headers:{Authorization:'Bearer '+token}});if(!response.ok){status.textContent='Authenticatie mislukt.';return;}const data=await response.json();content.hidden=false;const render=(items,target,type)=>{const node=document.getElementById(target);node.replaceChildren();if(!items.length){node.textContent='Geen openstaande items.';return;}items.forEach(item=>{const article=document.createElement('article');article.className='item';article.innerHTML='<strong>'+esc(item.author||item.name||'Onbekend')+'</strong><p>'+esc(item.body||item.email||'')+'</p><small>'+esc(item.providerSlug||item.category||'')+'</small><div class="actions"><button data-id="'+esc(item.id)+'" data-type="'+type+'" data-status="approved">Goedkeuren</button><button class="reject" data-id="'+esc(item.id)+'" data-type="'+type+'" data-status="rejected">Afwijzen</button></div>';node.appendChild(article);});};render(data.reviews,'reviews','reviews');render(data.claims,'claims','claims');document.querySelectorAll('[data-id]').forEach(button=>button.addEventListener('click',async()=>{const response=await fetch('/api/admin/'+button.dataset.type+'/'+button.dataset.id,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({status:button.dataset.status})});if(response.ok)load();else status.textContent='Moderatieactie mislukt.';}));};document.getElementById('auth').addEventListener('submit',event=>{event.preventDefault();token=document.getElementById('token').value;load();});</script></body></html>`;
}

async function forumCreate(input) {
  const name = clean(input.name, 40) || 'Anoniem';
  const title = clean(input.title, 90);
  const body = clean(input.body, 1000);
  const category = clean(input.category, 40);
  if (!title || !body) throw new Error('missing_fields');
  const items = await forumList();
  const item = { id: crypto.randomUUID(), name, title, body, category: category || 'Algemeen', createdAt: new Date().toISOString() };
  items.push(item);
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(forumFile, JSON.stringify(items.slice(-200), null, 2) + '\n');
  return item;
}

function providerPage(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'trimsalon' || parts.length !== 4) return null;
  const [, citySlug, breedSlug, providerSlug] = parts;
  const provider = catalog.providers.find(item => item.slug === providerSlug && item.city === citySlug && item.breeds.includes(breedSlug));
  const place = catalog.places[citySlug];
  const breed = catalog.breeds[breedSlug];
  if (!provider || !place || !breed) return null;
  const canonical = `/trimsalon/${citySlug}/${breedSlug}/${providerSlug}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.address}`)}`;
  const title = `${provider.name} — ${breed.name} trimsalon in ${place.name} | TrimGids`;
  const description = `${provider.name} in ${place.name}: informatie over ${breed.name}, specialisaties, prijsindicatie en route. Controleer beschikbaarheid rechtstreeks bij de aanbieder.`;
  const robots = provider.demo || provider.verified !== true ? 'noindex,follow' : 'index,follow';
    return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://trimgids.nl${canonical}"><meta name="robots" content="${robots}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}.form-row{display:grid;gap:8px;margin-top:18px}.form-row label{display:grid;gap:5px;color:var(--muted);font-size:14px}.form-row input,.form-row select,.form-row textarea{font:inherit;border:1px solid var(--line);border-radius:10px;padding:10px}.form-row textarea{min-height:100px;resize:vertical}.form-row button{justify-self:start}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><a href="/trimsalon/${citySlug}/${breedSlug}">Terug naar resultaten</a></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / <a href="/trimsalon/${citySlug}">${escapeHtml(place.name)}</a> / <a href="/trimsalon/${citySlug}/${breedSlug}">${escapeHtml(breed.name)}</a> / ${escapeHtml(provider.name)}</p><span class="eyebrow">${provider.demo ? 'Voorbeeldprofiel' : 'Aanbiederprofiel'}</span><h1>${escapeHtml(provider.name)}</h1><p class="intro">${escapeHtml(description)}</p><div class="summary"><strong>€${provider.startingPrice || '—'}</strong><span>vanafprijsindicatie<br><small>Vraag de actuele prijs en beschikbaarheid na</small></span></div><section><div class="section-head"><div><span class="eyebrow">Profiel</span><h2>Waarom deze aanbieder bij jouw zoekopdracht past</h2></div><a class="outline" href="${maps}" target="_blank" rel="noopener noreferrer">Kaart & route →</a></div><article class="provider"><div><span class="label">${provider.demo ? 'Voorbeeldweergave' : 'Vermelding gecontroleerd'}</span><h2>${escapeHtml(provider.name)}</h2><p>${escapeHtml(provider.address)}</p><div class="chips">${provider.specializations.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><div class="provider-actions"><a href="${maps}" target="_blank" rel="noopener noreferrer">Google Maps openen →</a><a href="/?claim=${encodeURIComponent(provider.slug)}#bedrijven">Vermelding claimen →</a></div></article></section><section class="guide"><h2>Voor een ${escapeHtml(breed.name)}-vacht</h2><p>${escapeHtml(breed.summary)}</p><ul>${breed.care.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section class="guide"><h2>Open hulpvragen in ${escapeHtml(place.name)}</h2><div id="help-requests"><p>Hulpvragen laden...</p></div></section><section class="guide"><h2>TrimGids-communityreviews</h2><div id="own-reviews"><p>Reviews laden...</p></div><form id="review-form" class="form-row"><label>Naam<input name="author" required maxlength="40"></label><label>Beoordeling<select name="rating"><option value="5">5 sterren</option><option value="4">4 sterren</option><option value="3">3 sterren</option><option value="2">2 sterren</option><option value="1">1 ster</option></select></label><label>Je ervaring<textarea name="body" required maxlength="1000"></textarea></label><button class="outline" type="submit">Ervaring insturen</button><p id="review-status"></p></form></section></main><footer><a href="/">TrimGids</a><span>${provider.demo ? 'Voorbeelddata: dit profiel is nog niet live.' : 'Controleer beschikbaarheid en actuele informatie bij de aanbieder.'}</span></footer><script>const providerSlug=${JSON.stringify(provider.slug)};const requests=document.getElementById('help-requests');const renderRequests=items=>{requests.replaceChildren();if(!items.length){requests.append(Object.assign(document.createElement('p'),{textContent:'Geen openstaande hulpvragen voor deze selectie.'}));return;}items.forEach(item=>{const article=document.createElement('article');article.className='google-review';const title=document.createElement('strong');title.textContent=item.title+' · '+item.issue;const body=document.createElement('p');body.textContent=item.description;const form=document.createElement('form');form.className='form-row';const input=document.createElement('textarea');input.required=true;input.maxLength=1200;input.placeholder='Hoe kun je helpen?';const button=document.createElement('button');button.className='outline';button.type='submit';button.textContent='Reageer als aanbieder';const status=document.createElement('p');form.append(input,button,status);form.addEventListener('submit',async event=>{event.preventDefault();const response=await fetch('/api/requests/'+encodeURIComponent(item.id)+'/responses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({providerSlug,providerName:${JSON.stringify(provider.name)},message:input.value})});status.textContent=response.ok?'Reactie staat klaar voor moderatie.':'Reactie kon niet worden verstuurd.';if(response.ok)form.reset();});article.append(title,body,form);requests.append(article);});};fetch('/api/requests?city=${encodeURIComponent(citySlug)}&breed=${encodeURIComponent(breedSlug)}').then(response=>response.json()).then(data=>renderRequests(data.requests||[])).catch(()=>{requests.textContent='Hulpvragen zijn tijdelijk niet beschikbaar.'});const reviews=document.getElementById('own-reviews');const status=document.getElementById('review-status');const render=items=>{reviews.replaceChildren();if(!items.length){reviews.append(Object.assign(document.createElement('p'),{textContent:'Nog geen goedgekeurde TrimGids-reviews.'}));return;}items.forEach(item=>{const article=document.createElement('article');article.className='google-review';const title=document.createElement('strong');title.textContent=item.rating+' ★ · '+item.author;const body=document.createElement('p');body.textContent=item.body;article.append(title,body);reviews.append(article);});};fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews').then(response=>response.json()).then(data=>render(data.reviews||[])).catch(()=>{reviews.textContent='Reviews zijn tijdelijk niet beschikbaar.'});document.getElementById('review-form').addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(event.currentTarget);const response=await fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:data.get('author'),rating:data.get('rating'),body:data.get('body')})});status.textContent=response.ok?'Bedankt. Je review staat klaar voor moderatie.':'Je review kon niet worden verstuurd.';if(response.ok)event.currentTarget.reset();});</script></body></html>`;
}

function directoryPage(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  let placeSlug = null;
  let breedSlug = null;
  let breedOnly = false;
  if (parts[0] === 'trimsalon' && (parts.length === 2 || parts.length === 3)) {
    placeSlug = parts[1];
    breedSlug = parts[2] || null;
  } else if (parts[0] === 'rassen' && parts.length === 2) {
    breedSlug = parts[1];
    breedOnly = true;
  } else return null;

  const place = placeSlug ? catalog.places[placeSlug] : null;
  const breed = breedSlug ? catalog.breeds[breedSlug] : null;
  if ((placeSlug && !place) || (breedSlug && !breed)) return null;
  const providers = catalog.providers.filter(provider => (!placeSlug || provider.city === placeSlug) && (!breedSlug || provider.breeds.includes(breedSlug)));
  const title = breed && place ? `${breed.name} trimsalon in ${place.name} | TrimGids` : breed ? `${breed.name} trimsalon vinden | TrimGids` : `Trimsalon in ${place.name} | TrimGids`;
  const heading = breed && place ? `${breed.name} trimsalon in ${place.name}` : breed ? `${breed.name} trimsalons vinden` : `Trimsalons in ${place.name}`;
  const canonical = breedOnly ? `/rassen/${breedSlug}` : `/trimsalon/${placeSlug}${breedSlug ? `/${breedSlug}` : ''}`;
  const indexable = providers.length >= 8 && providers.every(provider => provider.demo !== true && provider.verified === true);
  const intro = breed && place ? `Je zoekt een trimsalon in ${place.name} voor een ${breed.name}. Hieronder zie je hoe een goede vergelijking eruitziet: kijk naar ervaring met de ${breed.coat}, praktische bereikbaarheid en de vragen die je vooraf wilt stellen.` : breed ? breed.summary : place.description;
  const care = breed ? `<section class="guide"><h2>Waar let je op bij een ${escapeHtml(breed.name)}?</h2><p>${escapeHtml(breed.summary)}</p><ul>${breed.care.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : `<section class="guide"><h2>Zo kies je een trimsalon in ${escapeHtml(place.name)}</h2><p>Vergelijk niet alleen afstand. Vraag naar ervaring met het ras, de gewenste behandeling, de aanpak bij stress en wat je thuis tussen afspraken door kunt doen.</p><a href="/rassen/labradoodle">Lees de Labradoodle-gids →</a></section>`;
  const cards = providers.length ? providers.map(provider => {
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.address}`)}`;
    return `<article class="provider"><div><span class="label">${provider.demo ? 'Voorbeeldweergave' : 'Vermelding gecontroleerd'}</span><h2>${escapeHtml(provider.name)}</h2><p class="address">${escapeHtml(provider.address)}</p><div class="chips">${provider.specializations.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><div class="provider-actions"><span>${provider.startingPrice ? `Vanaf €${provider.startingPrice}` : 'Prijs op aanvraag'}</span><a href="/trimsalon/${provider.city}/${breedSlug}/${provider.slug}">Bekijk profiel →</a><a href="${maps}" target="_blank" rel="noopener noreferrer">Kaart & route →</a></div></article>`;
  }).join('') : `<div class="empty"><h2>Nog geen passend aanbod</h2><p>Deze combinatie is nog niet gevuld met voldoende gecontroleerde vermeldingen. Bekijk een bredere plaats of <a href="/rassen/${breedSlug || 'labradoodle'}">lees de rasgids</a>.</p></div>`;
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(intro)}"><link rel="canonical" href="https://trimgids.nl${canonical}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><a href="/">Terug naar zoeken</a></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / <a href="/trimsalon/${placeSlug || ''}">${place?.name || 'Rassen'}</a>${breed ? ` / ${breed.name}` : ''}</p><span class="eyebrow">${breed ? 'Ras en plaats' : 'Lokale gids'}</span><h1>${escapeHtml(heading)}</h1><p class="intro">${escapeHtml(intro)}</p><div class="summary"><strong>${providers.length}</strong><span>${providers.length === 1 ? 'voorbeeldvermelding' : 'vermeldingen'} in deze selectie<br><small>${indexable ? 'Geselecteerd voor indexering' : 'Nog niet indexeerbaar: eerst meer gecontroleerde data'}</small></span></div><section><div class="section-head"><div><span class="eyebrow">Aanbod vergelijken</span><h2>${breed ? `Aanbieders voor ${breed.name} in ${place?.name || 'Nederland'}` : `Aanbieders in ${place.name}`}</h2></div><a class="outline" href="/">Nieuwe zoekopdracht</a></div><div class="providers">${cards}</div></section>${care}<section class="next"><span class="eyebrow">Ook handig</span><h2>Ontdek meer voor jouw hond.</h2><div class="next-links"><a href="/rassen/${breedSlug || 'labradoodle'}">Rasverzorging →</a><a href="/#forum">Ervaringen delen →</a><a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" rel="noopener noreferrer">Wandelen in Limburg →</a></div></section></main><footer><a href="/">TrimGids</a><span>Gegevens worden alleen indexeerbaar wanneer ze inhoudelijk sterk genoeg zijn.</span></footer></body></html>`;
}

function directoryStyles() {
  return `:root{--green:#2f6b4f;--green-dark:#245640;--green-light:#e6f0eb;--cream:#f7f5f0;--ink:#1f2937;--muted:#596273;--line:#e7e5e0;--amber:#c98a2b;--max:1080px}*{box-sizing:border-box}body{margin:0;color:var(--ink);font:16px/1.6 Inter,system-ui,sans-serif;background:#fff}h1,h2{font-family:Fraunces,Georgia,serif;line-height:1.1}h1{font-size:clamp(42px,6vw,72px);max-width:860px;margin:16px 0 22px}h2{font-size:clamp(25px,3vw,38px);margin:10px 0 12px}a{color:inherit;text-decoration:none}.eyebrow{color:var(--green);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.wrap,main,nav,footer{max-width:var(--max);margin:auto}header{border-bottom:1px solid var(--line);background:rgba(255,255,255,.95)}nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;color:var(--muted)}.logo{color:var(--ink);font:700 23px Fraunces,Georgia,serif}.crumb{color:var(--muted);font-size:14px;margin-bottom:60px}.crumb a{text-decoration:underline;text-underline-offset:3px}main{padding:45px 22px 80px}.intro{max-width:720px;color:var(--muted);font-size:19px}.summary{display:flex;align-items:center;gap:15px;margin:32px 0 70px;padding:18px 20px;border-left:4px solid var(--green);background:var(--green-light);max-width:390px}.summary strong{font:700 42px Fraunces,Georgia,serif;color:var(--green)}.summary span{line-height:1.35}.summary small{color:var(--muted)}section{margin-top:60px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.outline{border:1px solid var(--line);border-radius:999px;padding:11px 16px;font-weight:600}.providers{display:grid;gap:12px}.provider{display:flex;justify-content:space-between;gap:24px;padding:24px;border:1px solid var(--line);border-radius:18px;background:#fff}.provider h2{font-size:25px;margin:7px 0}.provider p{margin:0;color:var(--muted)}.label{display:inline-block;padding:5px 9px;border-radius:999px;background:var(--cream);color:#8a5a12;font-size:12px;font-weight:700}.provider-actions{display:flex;align-items:flex-end;flex-direction:column;justify-content:space-between;gap:18px;white-space:nowrap;color:var(--muted)}.provider-actions a{color:var(--green);font-weight:700}.chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.chips span{background:var(--cream);padding:4px 9px;border-radius:999px;color:var(--muted);font-size:12px}.guide{padding:34px;background:var(--cream);border-radius:22px;max-width:780px}.guide p,.guide li{color:var(--muted)}.guide a,.next-links a{color:var(--green);font-weight:700}.empty{padding:28px;background:var(--cream);border-radius:18px}.empty p{color:var(--muted)}.empty a{color:var(--green);font-weight:700}.next{border-top:1px solid var(--line);padding-top:35px}.next-links{display:flex;gap:20px;flex-wrap:wrap}.next-links a{border-bottom:1px solid var(--green);padding-bottom:3px}footer{border-top:1px solid var(--line);padding:26px 22px 40px;display:flex;justify-content:space-between;gap:20px;color:var(--muted);font-size:13px}footer a{font:700 20px Fraunces,Georgia,serif;color:var(--ink)}@media(max-width:650px){main{padding-top:28px}.crumb{margin-bottom:40px}.section-head{align-items:flex-start;flex-direction:column}.provider{display:block}.provider-actions{align-items:flex-start;margin-top:20px}footer{flex-direction:column}}
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
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/') && !rateLimit(req, 'api', 120, 60_000)) return json(res, 429, { error: 'rate_limit_exceeded' });
    if (url.pathname.startsWith('/api/') && req.method === 'POST' && !rateLimit(req, 'write', 20, 60_000)) return json(res, 429, { error: 'write_rate_limit_exceeded' });
    if (url.pathname === '/api/health') return json(res, 200, { ok: true, googlePlacesConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY) });
    if (url.pathname === '/api/places/search' && req.method === 'GET') {
      const text = clean(url.searchParams.get('text'), 180);
      if (!text) return json(res, 400, { error: 'missing_query' });
      return json(res, 200, await googlePlacesSearch(text));
    }
    if (url.pathname === '/api/matches' && req.method === 'GET') {
      const city = slugify(clean(url.searchParams.get('city'), 80));
      const breed = slugify(clean(url.searchParams.get('breed'), 80));
      const sensitive = url.searchParams.get('sensitive') === 'true';
      const matches = catalog.providers.filter(provider => (!city || provider.city === city) && (!breed || provider.breeds.includes(breed)));
      const breedExperience = matches.filter(provider => provider.breeds.includes(breed)).length;
      const sensitiveExperience = matches.filter(provider => provider.specializations.some(item => /angstig|gevoelig|prikkel/i.test(item))).length;
      return json(res, 200, { total: matches.length, breedExperience, sensitiveExperience, demo: matches.some(provider => provider.demo) });
    }
    if (url.pathname === '/api/profiles' && req.method === 'POST') return json(res, 201, { profile: await profileCreate(await readJson(req)) });
    if (url.pathname.startsWith('/api/profiles/') && req.method === 'GET') {
      const id = decodeURIComponent(url.pathname.slice('/api/profiles/'.length));
      const profile = (await collectionList(profilesFile)).find(item => item.id === id);
      return profile ? json(res, 200, { profile }) : json(res, 404, { error: 'profile_not_found' });
    }
    if (url.pathname === '/api/requests' && req.method === 'POST') return json(res, 201, { request: await helpRequestCreate(await readJson(req)) });
    if (url.pathname === '/api/requests' && req.method === 'GET') {
      const city = slugify(url.searchParams.get('city'));
      const breed = slugify(url.searchParams.get('breed'));
      const issue = clean(url.searchParams.get('issue'), 50);
      const requests = (await collectionList(requestsFile)).filter(item => item.status === 'open' && (!city || item.city === city) && (!breed || item.breed === breed) && (!issue || item.issue === issue)).map(item => ({ id: item.id, title: item.title, issue: item.issue, breed: item.breed, city: item.city, description: item.description, createdAt: item.createdAt }));
      return json(res, 200, { requests });
    }
    if (url.pathname === '/api/polls' && req.method === 'GET') return json(res, 200, await pollData(url.searchParams.get('breed')));
    if (url.pathname.startsWith('/api/polls/') && url.pathname.endsWith('/votes') && req.method === 'POST') {
      const pollId = decodeURIComponent(url.pathname.slice('/api/polls/'.length, -'/votes'.length));
      return json(res, 201, { poll: await pollVote(pollId, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/requests/') && url.pathname.endsWith('/responses') && req.method === 'POST') {
      const requestId = decodeURIComponent(url.pathname.slice('/api/requests/'.length, -'/responses'.length));
      return json(res, 201, { response: await responseCreate(requestId, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/claim') && req.method === 'POST') {
      const slug = url.pathname.slice('/api/providers/'.length, -'/claim'.length);
      return json(res, 201, { claim: await claimCreate(slug, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/reviews') && req.method === 'GET') {
      const slug = url.pathname.slice('/api/providers/'.length, -'/reviews'.length);
      const reviews = (await collectionList(reviewsFile)).filter(item => item.providerSlug === slug && item.status === 'approved');
      return json(res, 200, { reviews });
    }
    if (url.pathname.startsWith('/api/providers/') && url.pathname.endsWith('/reviews') && req.method === 'POST') {
      const slug = url.pathname.slice('/api/providers/'.length, -'/reviews'.length);
      return json(res, 201, { review: await reviewCreate(slug, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/places/') && req.method === 'GET') {
      const id = decodeURIComponent(url.pathname.slice('/api/places/'.length));
      return json(res, 200, await googlePlaceDetails(id));
    }
    if (url.pathname === '/api/photo' && req.method === 'GET') {
      if (!googleKey) return json(res, 503, { error: 'google_places_not_configured' });
      const name = url.searchParams.get('name');
      if (!name || !name.startsWith('places/')) return json(res, 400, { error: 'invalid_photo' });
      const response = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${encodeURIComponent(googleKey)}`);
      if (!response.ok) return json(res, response.status, { error: 'photo_unavailable' });
      res.writeHead(200, secureHeaders({ 'Content-Type': response.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }));
      return res.end(Buffer.from(await response.arrayBuffer()));
    }
    if (url.pathname === '/api/forum' && req.method === 'GET') return json(res, 200, { topics: await forumTopics(), posts: await forumList() });
    if (url.pathname === '/api/forum' && req.method === 'POST') return json(res, 201, { post: await forumCreate(await readJson(req)) });
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/replies') && req.method === 'GET') {
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/replies'.length));
      return json(res, 200, { replies: (await collectionList(forumRepliesFile)).filter(item => item.topicId === topicId && item.status === 'approved') });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/replies') && req.method === 'POST') {
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/replies'.length));
      return json(res, 201, { reply: await forumReplyCreate(topicId, await readJson(req)) });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/helpful') && req.method === 'POST') {
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/helpful'.length));
      return json(res, 201, await forumHelpful(topicId, await readJson(req)));
    }
    if (url.pathname === '/admin' && req.method === 'GET') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }));
      return res.end(adminPage());
    }
    if (url.pathname === '/api/admin/moderation' && req.method === 'GET') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { reviews: (await collectionList(reviewsFile)).filter(item => item.status === 'pending'), claims: (await collectionList(claimsFile)).filter(item => item.status === 'pending') });
    }
    if (url.pathname.startsWith('/api/admin/reviews/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { review: await moderate(reviewsFile, decodeURIComponent(url.pathname.slice('/api/admin/reviews/'.length)), (await readJson(req)).status) });
    }
    if (url.pathname.startsWith('/api/admin/claims/') && req.method === 'POST') {
      if (!adminAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { claim: await moderate(claimsFile, decodeURIComponent(url.pathname.slice('/api/admin/claims/'.length)), (await readJson(req)).status) });
    }
    const generatedPage = providerPage(url.pathname) || directoryPage(url.pathname);
    if (generatedPage) {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }));
      return res.end(generatedPage);
    }
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    const clientErrors = ['missing_fields', 'request_too_large', 'profile_missing_fields', 'claim_invalid_contact', 'review_invalid_fields', 'request_invalid_fields', 'response_invalid_fields', 'request_not_found', 'poll_not_found', 'poll_invalid_vote', 'poll_already_voted', 'forum_topic_not_found', 'forum_reaction_invalid', 'forum_already_reacted', 'invalid_moderation_status', 'moderation_item_not_found'];
    const status = clientErrors.includes(error.message) ? 400 : 502;
    json(res, status, { error: error.message || 'server_error' });
  }
});

server.listen(port, () => console.log(`TrimGids draait op http://localhost:${port}`));
