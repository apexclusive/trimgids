import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { brotliCompress, gzip, constants as zlibConstants } from 'node:zlib';
import { hulphondenPage } from './pages/hulphonden.mjs';
import { zintuigenPage } from './pages/zintuigen.mjs';
import { anatomiePage } from './pages/anatomie.mjs';
import { hondengedragPage } from './pages/hondengedrag.mjs';
import { puppiesPage } from './pages/puppies.mjs';
import { fokkersPage } from './pages/fokkers.mjs';
import { aankoopgidsPage } from './pages/aankoopgids.mjs';
import { communityPage } from './pages/community.mjs';
import { vacaturesPage } from './pages/vacatures.mjs';
import { vrijwilligersPage } from './pages/vrijwilligers.mjs';
import { adoptiePage } from './pages/adoptie.mjs';
import { hondGevondenPage } from './pages/hond-gevonden.mjs';
import { reizenPage } from './pages/reizen.mjs';
import { rassenPage } from './pages/rassen.mjs';
import { verbodenRassenPage } from './pages/verboden-rassen.mjs';
import { poepzakjesPage } from './pages/poepzakjes.mjs';
import { hondenweetjesPage } from './pages/hondenweetjes.mjs';
import { hondenwedstrijdenPage } from './pages/hondenwedstrijden.mjs';
import { chippenOntwormenPage } from './pages/chippen-ontwormen.mjs';
import { brakenPage } from './pages/braken.mjs';
import { hitteberoertePage } from './pages/hitteberoerte.mjs';
import { zwerfhondenPage } from './pages/zwerfhonden.mjs';
import { cijfersPage } from './pages/cijfers.mjs';
import { geschiedenisPage } from './pages/geschiedenis.mjs';
import { koninklijkeHondenPage } from './pages/koninklijke-honden.mjs';
import { werkenMetHondPage } from './pages/werken-met-hond.mjs';
import { webshopPage } from './pages/webshop.mjs';
import { trimKostenPage } from './pages/trimkosten.mjs';
import { siteHeader, siteFooter } from './pages/chrome.mjs';

const __filename = fileURLToPath(import.meta.url);
const moduleDir = dirname(__filename);
let rootPath = moduleDir;
if (!existsSync(join(rootPath, 'data', 'catalog.json'))) {
  if (existsSync(join(process.cwd(), 'data', 'catalog.json'))) {
    rootPath = process.cwd();
  } else if (existsSync(join(moduleDir, '..', 'data', 'catalog.json'))) {
    rootPath = join(moduleDir, '..');
  }
}
const root = normalize(rootPath);
const catalogFile = join(root, 'data', 'catalog.json');
const reviewsFile = join(root, 'data', 'reviews.json');
const claimsFile = join(root, 'data', 'claims.json');
const profilesFile = join(root, 'data', 'profiles.json');
const helpRequestsFile = join(root, 'data', 'help-requests.json');
const responsesFile = join(root, 'data', 'responses.json');
const pollsFile = join(root, 'data', 'polls.json');
const forumFile = join(root, 'data', 'forum.json');
const usersFile = join(root, 'data', 'users.json');
const sessionsFile = join(root, 'data', 'sessions.json');
const favoritesFile = join(root, 'data', 'favorites.json');
const newsletterFile = join(root, 'data', 'newsletter.json');
const newsFile = join(root, 'data', 'news.json');
const newsTipsFile = join(root, 'data', 'news-tips.json');
const missingFile = join(root, 'data', 'missing.json');
const dogTaxFile = join(root, 'data', 'dog-tax.json');
const webVitalsFile = join(root, 'data', 'web-vitals.json');
const vacaturesFile = join(root, 'data', 'vacatures.json');
const vrijwilligersFile = join(root, 'data', 'vrijwilligers.json');
const routesFile = join(root, 'data', 'routes.json');
const insuranceFile = join(root, 'data', 'insurance.json');
const productsFile = join(root, 'data', 'products.json');
const lastMinuteFile = join(root, 'data', 'last-minute.json');
const quotesFile = join(root, 'data', 'quote-requests.json');
const dnaTestsFile = join(root, 'data', 'dna-tests.json');
const foodFile = join(root, 'data', 'food-subscriptions.json');
const emergencyVetsFile = join(root, 'data', 'emergency-vets.json');
const puppyCostsFile = join(root, 'data', 'puppy-costs.json');
const puppiesFile = join(root, 'data', 'puppies.json');
const dogNamesFile = join(root, 'data', 'dog-names.json');
const dogCafesFile = join(root, 'data', 'dog-cafes.json');
const communityBuddiesFile = join(root, 'data', 'community-buddies.json');
const dogVacationsFile = join(root, 'data', 'dog-vacations.json');
const dogIntelligenceFile = join(root, 'data', 'dog-intelligence.json');
const hypoallergenicBreedsFile = join(root, 'data', 'hypoallergenic-breeds.json');
const vetTariffsFile = join(root, 'data', 'vet-tariffs.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
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

const rateLimits = { search: new Map(), write: new Map(), sitemap: new Map(), beacon: new Map(), home: new Map(), auth: new Map(), newsletter: new Map(), siteSearch: new Map(), chat: new Map() };

function json(res, status, body, cacheControl = 'no-store', extraHeaders = {}) {
  res.writeHead(status, secureHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl, ...extraHeaders }));
  res.end(JSON.stringify(body));
}

function publicJson(res, status, body, maxAge = 60) {
  return json(res, status, body, `public, max-age=${maxAge}, s-maxage=${maxAge * 5}, stale-while-revalidate=86400`);
}

function secureHeaders(headers = {}) {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://places.googleapis.com; connect-src 'self' https://places.googleapis.com; worker-src 'self'",
    'Content-Language': 'nl',
    ...headers
  };
}

/* Cache-control voor publieke HTML-pagina's: CDN/browser mogen kortjes cachen,
   ETag revalidatie blijft actief en stale-while-revalidate vangt hervalidatie op. */
const HTML_CACHE = 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400';

/* ---------------------------------------------------------------------------
   Transport optimizations: Brotli/gzip compression, ETag revalidation and
   Vary handling for all text responses (HTML, JSON, XML, CSS, JS, SVG).
   --------------------------------------------------------------------------- */
const COMPRESSIBLE_TYPE = /^(text\/|application\/(json|xml|javascript|x-javascript|svg\+xml)|image\/svg\+xml|font\/)/;
const MIN_COMPRESS_BYTES = 1024;
const ETAG_MIN_BYTES = 512;
const compressedResponseCache = new Map();
const COMPRESSED_CACHE_MAX = 96;

function mergeVary(existing) {
  const values = String(existing || '').split(',').map(part => part.trim()).filter(Boolean);
  if (!values.includes('Accept-Encoding')) values.push('Accept-Encoding');
  return values.join(', ');
}

function upgradeResponse(req, res) {
  const realWriteHead = res.writeHead.bind(res);
  const realEnd = res.end.bind(res);
  let writtenStatus = 200;
  let writtenHeaders = null;
  const startedAt = performance.now();

  res.writeHead = (status, headers) => {
    writtenStatus = status;
    writtenHeaders = headers || null;
    return res;
  };

  /* Compacte gestructureerde logregels voor writes, fouten en trage responses */
  const logRequest = () => {
    const duration = Math.round(performance.now() - startedAt);
    const isQuiet = req.method === 'GET' && writtenStatus < 400 && duration < 250;
    if (isQuiet) return;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '-';
    console.log(JSON.stringify({
      time: new Date().toISOString(),
      method: req.method,
      path: req.url?.split('?')[0],
      status: writtenStatus,
      ms: duration,
      ip
    }));
  };

  res.end = (chunk, encoding, callback) => {
    /* modernize alleen als dat nog niet is gebeurd (directory/profielpagina's
       worden al gemoderniseerd + gecachet in de route-handler). */
    if (typeof chunk === 'string' && chunk.includes('<html') && !chunk.includes('id="tg-theme-boot"')) chunk = modernizeGeneratedHtml(chunk);
    const raw = chunk == null ? null
      : typeof chunk === 'string' ? Buffer.from(chunk, encoding || 'utf8')
      : Buffer.isBuffer(chunk) ? chunk
      : Buffer.from(chunk);
    const finalHeaders = { ...(writtenHeaders || {}) };
    const contentType = String(finalHeaders['Content-Type'] || finalHeaders['content-type'] || '');
    const cacheControl = String(finalHeaders['Cache-Control'] || finalHeaders['cache-control'] || '');
    const isHead = req.method === 'HEAD';

    const flush = (body, status, extra) => {
      const headers = { ...finalHeaders, ...(extra || {}) };
      logRequest();
      if (isHead) {
        realWriteHead(status, headers);
        return realEnd();
      }
      realWriteHead(status, headers);
      return body == null ? realEnd() : realEnd(body);
    };

    /* ETag revalidation for cacheable GET responses */
    if (req.method === 'GET' && raw && raw.length > 0 && COMPRESSIBLE_TYPE.test(contentType) && !cacheControl.includes('no-store')) {
      const digest = raw.length >= ETAG_MIN_BYTES
        ? createHash('sha1').update(raw).digest('base64url').slice(0, 20)
        : String(raw.length);
      const etag = `W/"${digest}"`;
      if (req.headers['if-none-match'] === etag) {
        const reduced = { ...finalHeaders, ETag: etag, Vary: mergeVary(finalHeaders.Vary) };
        delete reduced['Content-Length'];
        delete reduced['Content-Type'];
        realWriteHead(304, reduced);
        return realEnd();
      }
      finalHeaders.ETag = etag;
    }

    /* Compress text payloads on the fly (with in-memory reuse per content digest) */
    if (raw && raw.length >= MIN_COMPRESS_BYTES && COMPRESSIBLE_TYPE.test(contentType) && !(finalHeaders['Content-Encoding'])) {
      const accept = String(req.headers['accept-encoding'] || '');
      const wantsBr = /\bbr\b/.test(accept);
      const wantsGzip = /\bgzip\b/.test(accept);
      if (wantsBr || wantsGzip) {
        const encoding = wantsBr ? 'br' : 'gzip';
        const cacheKey = `${finalHeaders.ETag || raw.length}:${encoding}`;
        const cachedPayload = compressedResponseCache.get(cacheKey);
        if (cachedPayload) {
          const headers = {
            ...finalHeaders,
            'Content-Encoding': encoding,
            'Content-Length': cachedPayload.length,
            Vary: mergeVary(finalHeaders.Vary)
          };
          return flush(cachedPayload, writtenStatus, headers);
        }
        const compressBuffer = done => {
          if (wantsBr) {
            brotliCompress(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } }, done);
          } else {
            gzip(raw, { level: 6 }, done);
          }
        };
        compressBuffer((error, compressed) => {
          if (error) return flush(raw);
          compressedResponseCache.set(cacheKey, compressed);
          if (compressedResponseCache.size > COMPRESSED_CACHE_MAX) {
            compressedResponseCache.delete(compressedResponseCache.keys().next().value);
          }
          const headers = {
            ...finalHeaders,
            'Content-Encoding': encoding,
            'Content-Length': compressed.length,
            Vary: mergeVary(finalHeaders.Vary)
          };
          return flush(compressed, writtenStatus, headers);
        });
        return res;
      }
    }

    return flush(raw, writtenStatus, null);
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
  if (bucket.size > 5000) {
    for (const [key, value] of bucket) if (now - value.start > windowMs) bucket.delete(key);
  }
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

/* ---------------------------------------------------------------------------
   Accounts, sessies & favorieten — lokale JSON-store (same-origin, httpOnly
   sessiecookie). Wachtwoorden worden met scrypt + uniek zout gehasht.
   --------------------------------------------------------------------------- */
const SESSION_COOKIE = 'tg_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

async function readLocalJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeLocalJson(file, value) {
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function hashPassword(password, salt) {
  return scryptSync(String(password), salt, 64).toString('hex');
}

async function usersList() {
  return readLocalJson(usersFile, []);
}

async function usersSave(list) {
  return writeLocalJson(usersFile, list);
}

function findUserById(list, id) {
  return list.find(user => user.id === id) || null;
}

function findUserByIdentity(list, identity) {
  const q = clean(identity, 120).toLowerCase();
  if (!q) return null;
  return list.find(user => user.name.toLowerCase() === q || user.email.toLowerCase() === q) || null;
}

async function sessionsList() {
  return readLocalJson(sessionsFile, []);
}

async function sessionsSave(list) {
  return writeLocalJson(sessionsFile, list);
}

async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const sessions = await sessionsList();
  sessions.push({ token, userId, createdAt: new Date().toISOString(), expiresAt: Date.now() + SESSION_TTL_MS });
  await sessionsSave(sessions.slice(-5000));
  return token;
}

async function destroySession(token) {
  if (!token) return;
  const sessions = await sessionsList();
  await sessionsSave(sessions.filter(session => session.token !== token));
}

async function currentUser(req) {
  const header = String(req.headers.cookie || '');
  const match = header.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : '';
  if (!token) return null;
  const sessions = await sessionsList();
  const session = sessions.find(item => item.token === token && item.expiresAt > Date.now());
  if (!session) return null;
  const users = await usersList();
  return findUserById(users, session.userId);
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

async function favoritesFor(userId) {
  const all = await readLocalJson(favoritesFile, {});
  return all[userId] || [];
}

async function favoritesSet(userId, list) {
  const all = await readLocalJson(favoritesFile, {});
  all[userId] = list.slice(0, 200);
  await writeLocalJson(favoritesFile, all);
  return all[userId];
}

async function favoriteUpsert(userId, input) {
  const type = clean(input.type, 40);
  const id = clean(input.id, 120);
  const title = clean(input.title, 160);
  const href = clean(input.href, 220);
  if (!type || !id || !title) throw new Error('favorite_invalid_fields');
  const list = await favoritesFor(userId);
  const existing = list.findIndex(item => item.type === type && item.id === id);
  const record = { type, id, title, href: href || '/', createdAt: new Date().toISOString() };
  if (existing >= 0) list[existing] = { ...list[existing], ...record };
  else list.unshift(record);
  return favoritesSet(userId, list);
}

async function favoriteRemove(userId, input) {
  const type = clean(input.type, 40);
  const id = clean(input.id, 120);
  const list = (await favoritesFor(userId)).filter(item => !(item.type === type && item.id === id));
  return favoritesSet(userId, list);
}

/* Nieuwsbrief / lead-magnet: e-mailadres opslaan in lokale store (GDPR-bewust). */
async function newsletterSubscribe(input) {
  const email = clean(input.email, 120).toLowerCase();
  if (!validEmail(email)) throw new Error('newsletter_invalid_email');
  const list = await readLocalJson(newsletterFile, []);
  if (list.some(item => item.email === email)) return { subscribed: true, already: true, count: list.length };
  list.unshift({ email, createdAt: new Date().toISOString() });
  await writeLocalJson(newsletterFile, list.slice(0, 20000));
  return { subscribed: true, already: false, count: list.length };
}

/* ---------------------------------------------------------------------------
   Optional PostgreSQL/Supabase storage adapter (write-through + remote reads).
   Active zodra SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY zijn geconfigureerd.
   Bij een DB-fout valt alles automatisch terug op de lokale JSON-data.
   Tabelmapping sluit aan op supabase/schema.sql.
   --------------------------------------------------------------------------- */
let supabaseUrl = '';
let supabaseKey = '';
const DB_TABLES = new Map();
const DB_COLUMN_MAP = new Map([
  ['quote_requests', { id: 'id', name: 'name', email: 'email', phone: 'phone', city: 'city', breed: 'breed', service: 'service', timeframe: 'timeframe', notes: 'notes', source: 'source', campaign: 'campaign', landingPage: 'landing_page', status: 'status', createdAt: 'created_at' }],
  ['provider_claims', { id: 'id', providerSlug: 'provider_slug', name: 'name', email: 'email', phone: 'phone', status: 'status', createdAt: 'created_at' }],
  ['provider_reviews', { id: 'id', providerSlug: 'provider_slug', author: 'author', rating: 'rating', body: 'body', status: 'status', createdAt: 'created_at' }]
]);

function dbEnabled() {
  return Boolean(supabaseUrl && supabaseKey);
}

async function dbFetch(table, path = '', options = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}${path}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  return res;
}

function mapDbRow(table, row) {
  const columns = DB_COLUMN_MAP.get(table);
  if (!columns) return row;
  const mapped = {};
  for (const [key, column] of Object.entries(columns)) mapped[key] = row[column];
  return mapped;
}

function mapLocalRow(table, item) {
  const columns = DB_COLUMN_MAP.get(table);
  if (!columns) return item;
  const mapped = {};
  for (const [key, column] of Object.entries(columns)) {
    if (item[key] !== undefined) mapped[column] = item[key];
  }
  return mapped;
}

async function dbList(table) {
  const res = await dbFetch(table, '?select=*&order=created_at.desc&limit=1000');
  if (!res.ok) throw new Error(`db_list_${res.status}`);
  const rows = await res.json();
  return rows.map(row => mapDbRow(table, row));
}

async function dbCreate(table, item) {
  const res = await dbFetch(table, '', {
    method: 'POST',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify(mapLocalRow(table, item))
  });
  if (!res.ok) throw new Error(`db_create_${res.status}`);
}

async function dbUpdate(table, id, patch) {
  const columns = DB_COLUMN_MAP.get(table);
  if (!columns) return;
  const body = {};
  for (const [key, column] of Object.entries(columns)) {
    if (patch[key] !== undefined) body[column] = patch[key];
  }
  const res = await dbFetch(table, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`db_update_${res.status}`);
}

function tableForFile(file) {
  if (file === quotesFile) return 'quote_requests';
  if (file === claimsFile) return 'provider_claims';
  if (file === reviewsFile) return 'provider_reviews';
  return null;
}

const collectionCache = new Map();
const collectionCacheTtlMs = 15_000;

async function collectionList(file) {
  const table = tableForFile(file);
  if (dbEnabled() && table) {
    try {
      const remote = await dbList(table);
      collectionCache.set(file, { value: remote, expiresAt: Date.now() + collectionCacheTtlMs });
      return remote;
    } catch (error) {
      console.error(`Supabase read fallback voor ${table}:`, error.message);
    }
  }
  const now = Date.now();
  const cached = collectionCache.get(file);
  if (cached?.value && cached.expiresAt > now) return cached.value;
  if (cached?.promise) return cached.promise;
  const promise = readFile(file, 'utf8').then(raw => {
    const value = JSON.parse(raw);
    collectionCache.set(file, { value, expiresAt: Date.now() + collectionCacheTtlMs });
    return value;
  }).catch(() => { collectionCache.delete(file); return []; });
  collectionCache.set(file, { promise });
  return promise;
}

async function collectionAdd(file, item, limit = 1000) {
  const table = tableForFile(file);
  if (dbEnabled() && table) {
    try { await dbCreate(table, item); } catch (error) { console.error(`Supabase write fallback voor ${table}:`, error.message); }
  }
  const items = await collectionList(file);
  items.unshift(item);
  if (items.length > limit) items.length = limit;
  await writeFile(file, JSON.stringify(items, null, 2) + '\n');
  collectionCache.set(file, { value: items, expiresAt: Date.now() + collectionCacheTtlMs });
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
async function forumLinkedAuthor(input, fallback) {
  /* Wanneer een ingelogde gebruiker een userId meestuurt, wordt de naam
     altijd van het account overgenomen (voorkomt impersonatie). */
  const userId = clean(input.userId, 80);
  if (!userId) return { author: clean(fallback, 40), userId: '' };
  const users = await usersList();
  const user = findUserById(users, userId);
  return user ? { author: user.name, userId } : { author: clean(fallback, 40), userId: '' };
}

async function forumCreate(input) {
  const title = clean(input.title, 120);
  const author = clean(input.author, 40);
  const body = clean(input.body, 2000);
  const breed = clean(input.breed, 50);
  const topic = clean(input.topic, 40) || 'ervaringen';
  const linked = await forumLinkedAuthor(input, author);
  if (!title || !linked.author || !body) throw new Error('missing_fields');
  const record = {
    id: randomUUID(),
    title, author: linked.author, body, breed, topic,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    status: 'approved',
    replies: []
  };
  if (linked.userId) record.userId = linked.userId;
  return collectionAdd(forumFile, record);
}

async function forumReplyCreate(topicId, input) {
  const author = clean(input.author, 40);
  const body = clean(input.body, 1000);
  const linked = await forumLinkedAuthor(input, author);
  if (!linked.author || !body) throw new Error('missing_fields');
  const topics = await collectionList(forumFile);
  const index = topics.findIndex(item => item.id === topicId);
  if (index < 0) throw new Error('forum_topic_not_found');
  const reply = { id: randomUUID(), author: linked.author, body, createdAt: new Date().toISOString() };
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

const VAC_BRANCHES = new Set(['trimsalon', 'hondenschool', 'opvang', 'asiel', 'ambulance', 'opleiding', 'uitlaat', 'overig']);
const VAC_TYPES = new Set(['betaald', 'vrijwillig', 'stage']);
const NL_PROVINCES = new Set(['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel', 'Utrecht', 'Zeeland', 'Zuid-Holland', 'Landelijk']);

async function vacatureList() {
  return collectionList(vacaturesFile);
}

async function puppiesCreate(input) {
  const title = clean(input.title, 90);
  const breed = clean(input.breed, 60);
  const breeder = clean(input.breeder, 80);
  const city = clean(input.city, 60);
  const province = clean(input.province, 40);
  const sex = clean(input.sex, 40);
  const text = clean(input.text, 800);
  const email = clean(input.email, 120);
  const price = Number(input.price);
  const weeks = Number(input.weeks);
  if (!title || !breed || !breeder || !city || !province || !text || !validEmail(email) || !isFinite(price) || price <= 0 || !isFinite(weeks) || weeks < 7) {
    throw new Error('missing_fields');
  }
  const record = {
    id: 'nest-' + randomUUID().slice(0, 8),
    title, breed,
    breedSlug: slugify(breed),
    photo: 'p-' + slugify(breed).replace(/-/g, ''),
    price: Math.round(price),
    weeks: Math.min(16, Math.round(weeks)),
    sex, city, province,
    availableAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    breeder,
    email,
    verified: false,
    checks: Array.isArray(input.checks) ? input.checks.slice(0, 4).map(c => clean(c, 60)) : [],
    text,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  return collectionAdd(puppiesFile, record, 300);
}

async function vacatureCreate(input) {
  const org = clean(input.org, 90);
  const title = clean(input.title, 120);
  const branch = clean(input.branch, 20);
  const type = clean(input.type, 20);
  const province = clean(input.province, 30);
  const city = clean(input.city, 60);
  const hours = clean(input.hours, 60);
  const pay = clean(input.pay, 80);
  const description = clean(input.description, 1200);
  const contact = clean(input.contact, 90);
  if (!org || !title || !branch || !type || !province || !city || !hours || !contact) throw new Error('missing_fields');
  if (!VAC_BRANCHES.has(branch)) throw new Error('invalid_branch');
  if (!VAC_TYPES.has(type)) throw new Error('invalid_type');
  if (!NL_PROVINCES.has(province)) throw new Error('invalid_province');
  if (description.length < 20) throw new Error('description_too_short');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) throw new Error('invalid_email');
  if (title.length < 5) throw new Error('title_too_short');
  const record = {
    id: randomUUID(),
    title, org, branch, type, province, city, hours, pay, description, contact,
    postedAt: new Date().toISOString().slice(0, 10),
    status: 'open',
    sample: false
  };
  return collectionAdd(vacaturesFile, record, 200);
}

async function vrijwilligerCreate(input) {
  const firstName = clean(input.firstName, 60);
  const email = clean(input.email, 90);
  const city = clean(input.city, 60);
  const province = clean(input.province, 30);
  const role = clean(input.role, 120);
  const availability = clean(input.availability, 80);
  const age = clean(input.age, 20);
  const motivation = clean(input.motivation, 600);
  if (!firstName || !email || !city || !province || !role) throw new Error('missing_fields');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('invalid_email');
  if (!NL_PROVINCES.has(province)) throw new Error('invalid_province');
  const record = {
    id: randomUUID(),
    firstName, email, city, province, role, availability, age, motivation,
    createdAt: new Date().toISOString(),
    status: 'new'
  };
  return collectionAdd(vrijwilligersFile, record, 500);
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


async function buddyCreate(input) {
  const ownerName = clean(input.ownerName, 50);
  const dogName = clean(input.dogName, 50);
  const breed = clean(input.breed || 'Hond', 60);
  const gender = clean(input.gender || 'Onbekend', 30);
  const city = clean(input.city, 50);
  const province = clean(input.province || 'Nederland', 40);
  const area = clean(input.area || input.city, 80);
  const vibe = clean(input.vibe || 'Sociaal en vrolijk', 80);
  const message = clean(input.message, 300);
  const contact = clean(input.contact, 80);
  if (!ownerName || !dogName || !city || !message) throw new Error('missing_fields');
  return collectionAdd(communityBuddiesFile, {
    id: 'buddy-' + Date.now(),
    ownerName,
    dogName,
    breed,
    gender,
    city,
    province,
    area,
    vibe,
    message,
    contact,
    date: 'Zojuist geplaatst',
    createdAt: new Date().toISOString()
  });
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
  const source = clean(input.source, 120);
  const campaign = clean(input.campaign, 120);
  const landingPage = clean(input.landingPage, 200);
  if (!name || !validEmail(email) || !city || !breed) throw new Error('quote_invalid_fields');
  const quote = {
    id: randomUUID(),
    name, email, phone, city, breed, service, timeframe, notes, source, campaign, landingPage,
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
  if (status === 'afgeschaft') {
    items = items.filter(d => d.status !== 'actief' && d.status !== 'onbekend');
  } else if (status) {
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
  const table = tableForFile(file);
  if (dbEnabled() && table) {
    try { await dbUpdate(table, id, { status }); } catch (error) { console.error(`Supabase update fallback voor ${table}:`, error.message); }
  }
  const items = await collectionList(file);
  const index = items.findIndex(item => item.id === id);
  if (index < 0) throw new Error('moderation_item_not_found');
  items[index] = { ...items[index], status, moderatedAt: new Date().toISOString() };
  await writeFile(file, JSON.stringify(items, null, 2) + '\n');
  collectionCache.set(file, { value: items, expiresAt: Date.now() + collectionCacheTtlMs });
  return items[index];
}

/* Dynamic XML Sitemap for Search Engines */
let sitemapCache = { key: '', body: '' };
function generateSitemap() {
  const key = new Date().toISOString().split('T')[0];
  if (sitemapCache.key === key) return sitemapCache.body;
  const body = generateSitemapUncached(key);
  sitemapCache = { key, body };
  return body;
}

function generateSitemapUncached(now) {
  const baseUrl = 'https://trimgids.nl';
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
  add('/trimmen-kosten', '0.9', 'weekly');
  add('/wandelen', '0.9', 'weekly');
  add('/kaart', '0.9', 'weekly');
  add('/nieuws', '0.9', 'daily');
  add('/vermist', '0.9', 'daily');
  add('/hondenbelasting', '0.9', 'weekly');
  add('/forum', '0.9', 'daily');
  add('/hulphonden', '0.85', 'weekly');
  add('/hondenanatomie', '0.9', 'monthly');
  add('/hondengedrag', '0.9', 'monthly');
  add('/puppies', '0.95', 'daily');
  add('/zintuigen', '0.85', 'weekly');
  add('/fokkers', '0.85', 'weekly');
  add('/aankoopgids', '0.9', 'weekly');
  add('/vacatures', '0.85', 'daily');
  add('/vrijwilligers', '0.8', 'weekly');
  add('/adoptie', '0.9', 'weekly');
  add('/hond-gevonden', '0.85', 'weekly');
  add('/reizen', '0.85', 'weekly');
  add('/rassen', '0.9', 'weekly');
  add('/verboden-rassen', '0.8', 'monthly');
  add('/poepzakjes', '0.8', 'monthly');
  add('/hondenweetjes', '0.9', 'weekly');
  add('/hondenwedstrijden', '0.85', 'weekly');
  add('/chippen-ontwormen', '0.9', 'weekly');
  add('/braken-hond', '0.9', 'weekly');
  add('/hitteberoerte-hond', '0.9', 'weekly');
  add('/zwerfhonden', '0.8', 'monthly');
  add('/honden-cijfers', '0.9', 'monthly');
  add('/geschiedenis-hond', '0.85', 'monthly');
  add('/koninklijke-honden', '0.8', 'monthly');
  add('/hond-en-werk', '0.9', 'weekly');
  add('/webshop', '0.85', 'weekly');
  /* — Ronde 10: ontbrekende indexeerbare contentpagina's aan de sitemap toegevoegd — */
  add('/producten', '0.85', 'weekly');
  add('/afvallen-hond', '0.7', 'monthly');
  add('/bedrijven', '0.7', 'weekly');
  add('/beweging-hond-calculator', '0.75', 'monthly');
  add('/dierenarts-tarieven', '0.85', 'monthly');
  add('/ehbo-hond', '0.95', 'weekly');
  add('/gebitsverzorging-hond', '0.75', 'monthly');
  add('/gewicht-calculator', '0.8', 'monthly');
  add('/giftigheid-calculator', '0.9', 'monthly');
  add('/hond-mee-op-vakantie', '0.85', 'monthly');
  add('/vakantie-met-hond', '0.85', 'monthly');
  add('/honden-bespaartips', '0.75', 'monthly');
  add('/honden-vaccinaties', '0.85', 'monthly');
  add('/hondennamen', '0.8', 'monthly');
  add('/hondenpension-checklist', '0.8', 'monthly');
  add('/hondenras-intelligentie', '0.85', 'monthly');
  add('/hondenvoer-calculator', '0.8', 'monthly');
  add('/hondvriendelijke-horeca', '0.85', 'monthly');
  add('/hypoallergene-honden', '0.85', 'monthly');
  add('/last-minute', '0.85', 'weekly');
  add('/leeftijd-calculator', '0.85', 'monthly');
  add('/offerte', '0.85', 'weekly');
  add('/puppy-gewicht-calculator', '0.75', 'monthly');
  add('/puppy-kiezen', '0.9', 'monthly');
  add('/teken-en-vlooien', '0.85', 'monthly');
  add('/trimsalon-inkomsten-calculator', '0.7', 'monthly');
  add('/vacht-herinnering', '0.8', 'monthly');
  add('/vachtverzorging-seizoenen', '0.8', 'monthly');
  add('/verhuizen-met-hond', '0.75', 'monthly');
  add('/wandelmaatje', '0.75', 'monthly');

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
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Hondenverzekering Vergelijken 2026: Premies & Dekking | TrimGids</title><meta name="description" content="Vergelijk de beste hondenverzekeringen van Nederland 2026 (Figo 9,3/10, Univé 8,4, OHRA 8,2, PetSecur). Bereken direct je maandpremie, dekking voor dierenartskosten en heup/elleboogoperaties."><link rel="canonical" href="https://trimgids.nl/verzekering"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is de beste hondenverzekering in 2026?","acceptedAnswer":{"@type":"Answer","text":"Figo wint de test van 2026 (9,3/10) met de breedste dekking en geen leeftijdsgrens; Univé (8,4) is het beste alternatief bij grote rekeningen, OHRA (8,2) het meest gekozen."}},{"@type":"Question","name":"Wat kost een hondenverzekering per maand?","acceptedAnswer":{"@type":"Answer","text":"De premie verschilt per verzekeraar: van circa 11,95 tot 17 euro per maand voor een jonge, gezonde hond; gemiddeld betaalt een baasje circa 176 tot 315 euro per jaar."}},{"@type":"Question","name":"Welke dekkingen zijn belangrijk?","acceptedAnswer":{"@type":"Answer","text":"Let op erfelijke aandoeningen (heup- en elleboogdysplasie), kankerbehandeling, het jaarmaximum, de maximale afsluitleeftijd en de combinatie eigen risico en eigen bijdrage."}}]},{"@type":"ItemList","name":"Hondenverzekeringen vergelijken 2026","itemListElement":[{"@type":"ListItem","position":1,"name":"Figo Huisdierenverzekering","url":"https://trimgids.nl/verzekering"},{"@type":"ListItem","position":2,"name":"Univé Hondenverzekering","url":"https://trimgids.nl/verzekering"},{"@type":"ListItem","position":3,"name":"OHRA Hondenverzekering","url":"https://trimgids.nl/verzekering"}]}]}</script><style>${directoryStyles()}${customModuleStyles()}.ins-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:30px 0}.ins-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.ins-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.ins-badge-top{position:absolute;top:-12px;right:24px;background:var(--amber);color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}.ins-price-box{background:var(--green-light);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center}.ins-price-box strong{font:700 28px Fraunces,Georgia,serif;color:var(--green)}.ins-list{display:grid;gap:8px;font-size:14px;color:var(--ink-2);margin:8px 0}.ins-list li{list-style:none;padding-left:22px;position:relative}.ins-list li::before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:700}.btn-ins{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px}.btn-ins:hover{background:var(--green-d)}
.ins-card{position:relative}
@media(max-width:640px){.ins-table th,.ins-table td{padding:8px 9px;font-size:12.5px}}.ins-advisor{background:linear-gradient(135deg,#0f3e28,#165b3c);border-radius:22px;padding:26px;color:#fff;margin:0 0 26px;box-shadow:0 18px 44px rgba(15,62,40,.28)}
.ins-advisor h2{color:#fff}
.ins-advisor p{color:rgba(255,255,255,.8)}
.ins-advisor-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-top:16px;align-items:end}
.ins-advisor-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:#a7f3d0}
.ins-advisor-form select,.ins-advisor-form input{padding:11px 13px;border:0;border-radius:12px;font:inherit;font-weight:700;color:#0b1220;outline:none}
.ins-advisor-form button{background:#fbbf24;color:#3b2303;border:0;border-radius:12px;padding:12px 18px;font-weight:800;cursor:pointer;font:inherit;transition:transform .15s}
.ins-advisor-form button:hover{transform:translateY(-1px)}
.ins-advisor-result{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px 18px;margin-top:16px;font-size:14px}
.ins-advisor-result b{color:#fbbf24}
.ins-advisor-result a{display:inline-block;margin-top:8px;background:#fff;color:#0f3e28;font-weight:800;padding:8px 16px;border-radius:999px;text-decoration:none}
@media(max-width:760px){.ins-advisor-form{grid-template-columns:1fr}}
</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering" style="color:var(--green);font-weight:700">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws & Alerts</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenverzekering Vergelijker</p><span class="eyebrow">Onafhankelijk Zorgkostenoverzicht 2026</span><h1>Beste Hondenverzekering Vergelijken</h1><p class="intro">Een operatie na een ongeluk of erfelijke aandoening (zoals heupdysplasie of hernia) kan oplopen tot duizenden euro's. Met een goede hondenverzekering voorkom je financiële verrassingen en kies je altijd voor de beste medische zorg voor jouw hond.</p><div class="stats-row"><div class="stat-card"><strong>€ 11,95</strong><span>Laagste vanafprijs per maand</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>Tot 90%</strong><span>Vergoeding van dierenartskosten</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>9,3/10</strong><span>Best geteste dekking van 2026 (Keuze.nl)</span></div></div><div class="ins-advisor"><div class="ins-advisor-in">
  <div><h2 style="font-size:22px;margin:0 0 4px">🧮 Adviseur: welke polis past bij jouw hond?</h2><p style="font-size:13.5px;color:var(--muted);margin:0">Kies ras en leeftijd — wij wijzen de beste match met de bijbehorende premie.</p></div>
  <div class="ins-advisor-form">
    <label>Ras of formaat<select id="adv-breed"><option value="small">Klein (&lt; 10 kg, bijv. Pomeriaan, Chihuahua)</option><option value="medium" selected>Middelgroot (10–25 kg, bijv. Labradoodle)</option><option value="large">Groot (&gt; 25 kg, bijv. Golden Retriever)</option></select></label>
    <label>Leeftijd van je hond<select id="adv-age"><option value="young" selected>Pup &amp; jong (0–2 jr)</option><option value="adult">Volwassen (2–7 jr)</option><option value="senior">Senior (7+ jr)</option></select></label>
    <button type="button" id="adv-btn">Beste match →</button>
  </div>
  <div class="ins-advisor-result" id="adv-result" hidden></div>
</div></div>
${tableForInsurance()}
  <div class="ins-grid" id="ins-container">
${(() => { const ii = loadJsonLocal(insuranceFile) || []; return ii.map((item, idx) => `<article class="ins-card${idx === 0 ? ' featured' : ''}">${idx === 0 ? '<span class="ins-badge-top">Beste Keuze 2026</span>' : ''}<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px 'Plus Jakarta Sans',sans-serif;flex:none">${item.logo}</span><div><h2 style="font-size:22px;margin:0">${item.name}</h2><span style="font-size:13px;color:var(--muted)">⭐ ${item.score}/10 · ${item.rating || ''} (${item.reviewCount} reviews)</span></div></div><div class="ins-price-box"><div><span style="font-size:12px;color:var(--muted);display:block">Vanaf premie</span><strong>€ ${item.startingPrice.toFixed(2)}</strong><span style="font-size:12px;color:var(--muted)">/mnd</span></div><div style="text-align:right"><span style="font-weight:700;color:var(--green)">${item.reimbursementPercent} vergoeding</span><br><small style="font-size:11.5px;color:var(--muted)">Gem. ± € ${(item.avgYearPremium || 0).toLocaleString('nl-NL')} per jaar</small></div></div><p style="font-size:14px;color:var(--muted);margin:0">${item.description}</p><ul class="ins-list">${item.highlights.map(h => '<li>' + h + '</li>').join('')}</ul><a class="btn-ins" href="${item.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bereken premie voor jouw hond ↗</a></article>`).join(''); })()}
</div><section class="guide-box"><h2>Waar moet je op letten bij het afsluiten van een hondenverzekering?</h2><div class="steps-grid"><div class="step-card"><h3>1. Erfelijke aandoeningen</h3><p>Controleer of aandoeningen aan heupen, ellebogen (zoals ED en HD) en patellaluxatie worden vergoed. Bij sommige verzekeraars is hiervoor een aanvullende module vereist.</p></div><div class="step-card"><h3>2. Eigen risico & vergoeding</h3><p>Kies tussen 70%, 80% of 90% vergoeding per ingreep. Een hoger eigen risico verlaagt je maandelijkse premie aanzienlijk.</p></div><div class="step-card"><h3>3. Maximale jaaruitkering</h3><p>Polissen variëren van € 2.500 tot onbeperkt per verzekeringsjaar. Voor grote of kwetsbare rassen is een ruime dekking aanbevolen.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer bespaartips voor jouw hond</h2><div class="next-links"><a href="/hondenbelasting">Hondenbelasting per gemeente →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a><a href="/wandelen">Wandelroutes & Losloopbossen →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids is een onafhankelijke vergelijker. Afsluiten gebeurt direct op de officiële website van de verzekeraar.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const loadIns=async()=>{try{const res=await fetch('/api/insurance');const data=await res.json();window.__insData=data.insurance||[];const box=document.getElementById('ins-container');if(box.children.length) return;(data.insurance||[]).forEach((item,idx)=>{const card=document.createElement('article');card.className='ins-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="ins-badge-top">Beste Keuze 2026</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px \'Plus Jakarta Sans\',sans-serif;flex:none">'+item.logo+'</span><div><h2 style="font-size:22px;margin:0">'+item.name+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+item.score+'/10 · '+(item.rating||'')+' ('+item.reviewCount+' reviews)</span></div></div><div class="ins-price-box"><div><span style="font-size:12px;color:var(--muted);display:block">Vanaf premie</span><strong>€ '+item.startingPrice.toFixed(2)+'</strong><span style="font-size:12px;color:var(--muted)">/mnd</span></div><div style="text-align:right"><span style="font-weight:700;color:var(--green)">'+item.reimbursementPercent+' vergoeding</span><br><small style="font-size:11.5px;color:var(--muted)">Gem. ± € '+(item.avgYearPremium||0).toLocaleString('nl-NL')+' per jaar</small></div></div><p style="font-size:14px;color:var(--muted);margin:0">'+item.description+'</p><ul class="ins-list">'+item.highlights.map(h=>'<li>'+h+'</li>').join('')+'</ul><a class="btn-ins" href="'+item.affiliateUrl+'" target="_blank" rel="sponsored noopener noreferrer">Bereken premie voor jouw hond ↗</a>';box.appendChild(card);});}catch(e){}}loadIns();const advBreed=document.getElementById('adv-breed'),advAge=document.getElementById('adv-age');const advBtn=document.getElementById('adv-btn');const advRes=document.getElementById('adv-result');const advRun=()=>{const breed=advBreed.value,age=advAge.value;let scores={};let picks=[];try{picks=(window.__insData||[]);}catch(e){}if(!picks.length)return;const REC={small:{young:['figo-pet-insurance','petsecur-dierenverzekering'],adult:['figo-pet-insurance','ohra-huisdierenverzekering'],senior:['figo-pet-insurance','unive-zorg-voor-dieren']},medium:{young:['figo-pet-insurance','ohra-huisdierenverzekering'],adult:['figo-pet-insurance','unive-zorg-voor-dieren'],senior:['figo-pet-insurance','unive-zorg-voor-dieren']},large:{young:['figo-pet-insurance','ohra-huisdierenverzekering'],adult:['figo-pet-insurance','unive-zorg-voor-dieren'],senior:['figo-pet-insurance','unive-zorg-voor-dieren']}};const ids=REC[breed]?REC[breed][age]:[];const top=ids.map(id=>picks.find(p=>p.id===id)).filter(Boolean);if(!top.length){const topPick=picks.filter(p=>p.covers.hereditary)[0]||picks[0];if(topPick)top.push(topPick);}advRes.hidden=false;advRes.innerHTML='<strong>Voor jouw '+breed+' hond ('+age+') adviseren wij:</strong><br>'+top.map(p=>'• <b>'+p.name+'</b> — '+p.badge+' · vanaf <b>€ '+p.startingPrice.toFixed(2)+'/mnd</b> · '+(p.covers&&p.covers.hereditary?'erfelijke aandoeningen gedekt':'basisdekking')).join('<br>')+'<br><a href="'+top[0].affiliateUrl+'" target="_blank" rel="sponsored noopener noreferrer">Premie berekenen bij '+top[0].provider+' ↗</a>';};advBtn.addEventListener('click',advRun);advRun();</script></body></html>`;
}

/* Standalone DNA Test Comparison Page (High-Ticket Affiliate) */
function dnaPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Honden DNA Test 2026: Embark vs Wisdom Panel Vergelijken | TrimGids</title><meta name="description" content="Vergelijk de beste honden DNA- & gezondheidstesten van 2026 (Embark, Wisdom Panel, Orivet). Ontdek de raszuiverheid, stamboom en 250+ erfelijke aandoeningen."><link rel="canonical" href="https://trimgids.nl/dna-test"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">${(() => { const dd = loadJsonLocal(dnaTestsFile); const tests = (dd && (Array.isArray(dd) ? dd : dd.tests)) || []; return JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "ItemList", name: "Honden DNA-testen vergeleken 2026", itemListElement: tests.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: "https://trimgids.nl/dna-test#dna-" + t.id })) }, ...tests.map(t => ({ "@type": "Product", name: t.title, description: t.description, brand: { "@type": "Brand", name: t.provider }, aggregateRating: { "@type": "AggregateRating", ratingValue: t.rating, reviewCount: t.reviewCount }, offers: { "@type": "Offer", priceCurrency: "EUR", price: t.salePrice, priceValidUntil: "2026-12-31", availability: "https://schema.org/InStock", url: t.affiliateUrl } }))] }); })()}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hoe betrouwbaar is een honden DNA test?","acceptedAnswer":{"@type":"Answer","text":"Toonaangevende testen zoals Embark en Wisdom Panel hebben een nauwkeurigheid van meer dan 98% tot 99% bij het identificeren van meer dan 350 erkende rassen en genetische mutaties."}},{"@type":"Question","name":"Waarom zou ik een DNA test doen bij een hond?","acceptedAnswer":{"@type":"Answer","text":"Het geeft inzicht in de exacte rassenkruising, potentiële erfelijke ziektes (zoals het MDR1-gen voor medicijngevoeligheid en PRA voor blindheid), en helpt bij preventieve zorg en gerichte voeding."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.dna-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.dna-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.04);position:relative}.dna-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.dna-price-box{background:var(--cream);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center}.dna-price-box strong{font:700 30px Fraunces,serif;color:var(--green)}.btn-aff{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:block}.btn-aff:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/dna-test" style="color:var(--green);font-weight:700">DNA Testen</a><a href="/voeding">Voeding</a><a href="/verzekering">Hondenverzekering</a><a href="/spoed-dierenarts">Spoed Dierenarts</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Honden DNA Testen Vergelijken</p><span class="eyebrow">Genetisch Gezondheidsonderzoek 2026</span><h1>Beste Honden DNA Testen Vergelijken</h1><p class="intro">Wil je weten welke rassen er in jouw hond schuilen, of wil je erfelijke gezondheidsrisico's (zoals heupdysplasie, blindheid of medicijnallergieën) vroegtijdig opsporen? Bekijk hieronder de beste gecertificeerde DNA-kits voor thuis.</p><div class="stats-row"><div class="stat-card"><strong>350+</strong><span>Rassen accuraat herkend</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>250+</strong><span>Erfelijke gezondheidsrisico's</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>99%</strong><span>Laboratorium betrouwbaarheid</span></div></div>${tableForDna()}
  <div class="dna-grid" id="dna-container">
${(() => { const dt = loadJsonLocal(dnaTestsFile); const tests = (dt && (Array.isArray(dt) ? dt : dt.tests)) || []; return tests.map((t, idx) => `<article class="dna-card${idx === 0 ? ' featured' : ''}">${idx === 0 ? '<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">' + t.badge + '</span>' : ''}<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px 'Plus Jakarta Sans',sans-serif;flex:none">${t.logo}</span><div><h2 style="font-size:22px;margin:0">${t.title}</h2><span style="font-size:13px;color:var(--muted)">⭐ ${t.rating} (${t.reviewCount} reviews) · ${t.provider}</span></div></div><div class="dna-price-box"><div><small style="color:var(--muted);text-decoration:line-through">€ ${t.price.toFixed(2)}</small><br><strong>€ ${t.salePrice.toFixed(2)}</strong></div><div style="text-align:right;font-size:13px;color:var(--muted)">Uitslag in<br><strong>${t.turnaroundWeeks}</strong></div></div><p style="font-size:14px;color:var(--muted);margin:0">${t.description}</p><div style="font-size:13px;background:var(--green-light);padding:10px;border-radius:10px;color:var(--green)"><strong>Rassendetectie:</strong> ${t.breedCount}<br><strong>Gezondheidsscreening:</strong> ${t.healthScreening}</div><ul class="tg-list">${t.highlights.map(h => '<li>' + h + '</li>').join('')}</ul><a class="btn-aff" href="${t.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bekijk test & bestel met korting ↗</a></article>`).join(''); })()}
</div><section class="guide-box"><h2>Hoe werkt een DNA-test voor honden?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Wangslijmvlies afnemen</h3><p>Wrijf met het bijgeleverde zachte wattenstaafje gedurende 30 seconden langs de binnenkant van de wang van je hond. Geheel pijnloos en stressvrij.</p></div><div class="step-card"><div class="step-num">2</div><h3>Gratis terugsturen naar laboratorium</h3><p>Plaats het staafje in het beschermbuisje en stuur het in de voorgefrankeerde retourenvelop naar het gecertificeerde kynologische laboratorium.</p></div><div class="step-card"><div class="step-num">3</div><h3>Online uitslag & familiezoeker</h3><p>Binnen 2 tot 4 weken ontvang je een uitgebreid digitaal rapport met stamboom, rassenpercentages, gezondheidsrisico's en DNA-matches met familieleden.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Meer gezondheid & preventie</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/voeding">Beste Verse Hondenvoeding →</a><a href="/spoed-dierenarts">24/7 Spoeddierenarts Finder →</a><a href="/kosten-hond">Wat kost een hond? →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids test en vergelijkt onafhankelijk. Bestellingen verlopen via de officiële webshops van de aanbieders.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const loadDna=async()=>{try{const res=await fetch('/api/dna-tests');const data=await res.json();const box=document.getElementById('dna-container');if(box.children.length) return;(data.tests||[]).forEach((t,idx)=>{const card=document.createElement('article');card.className='dna-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+t.badge+'</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px \'Plus Jakarta Sans\',sans-serif;flex:none">'+t.logo+'</span><div><h2 style="font-size:22px;margin:0">'+t.title+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+t.rating+' ('+t.reviewCount+' reviews) · '+t.provider+'</span></div></div><div class="dna-price-box"><div><small style="color:var(--muted);text-decoration:line-through">€ '+t.price.toFixed(2)+'</small><br><strong>€ '+t.salePrice.toFixed(2)+'</strong></div><div style="text-align:right;font-size:13px;color:var(--muted)">Uitslag in<br><strong>'+t.turnaroundWeeks+'</strong></div></div><p style="font-size:14px;color:var(--muted);margin:0">'+t.description+'</p><div style="font-size:13px;background:var(--green-light);padding:10px;border-radius:10px;color:var(--green)"><strong>Rassendetectie:</strong> '+t.breedCount+'<br><strong>Gezondheidsscreening:</strong> '+t.healthScreening+'</div><ul class="tg-list">'+t.highlights.map(h=>'<li>'+h+'</li>').join('')+'</ul><a class="btn-aff" href="'+t.affiliateUrl+'" target="_blank" rel="sponsored noopener noreferrer">Bekijk test & bestel met korting ↗</a>';box.appendChild(card);});}catch(e){}}loadDna();</script></body></html>`;
}

/* Standalone Voeding & Verse Maaltijden Page (High Recurring Affiliate) */
function foodPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Hondenvoer & Verse Maaltijden 2026: Voedingswijzer | TrimGids</title><meta name="description" content="Vergelijk de beste verse maaltijden en koudgeperste brokken (Butternut Box, Farm Food, Edgard & Cooper, Tails.com). Inclusief interactieve portiecalculator en kortingen."><link rel="canonical" href="https://trimgids.nl/voeding"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">${(() => { const fd = loadJsonLocal(foodFile); const foods = (fd && (Array.isArray(fd) ? fd : fd.foods)) || []; return JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "ItemList", name: "Hondenvoeding-abonnementen vergeleken 2026", itemListElement: foods.map((f, i) => ({ "@type": "ListItem", position: i + 1, name: f.title, url: "https://trimgids.nl/voeding#voeding-" + f.id })) }, ...foods.map(f => ({ "@type": "Product", name: f.title, description: (f.description || "").slice(0, 400), aggregateRating: f.rating ? { "@type": "AggregateRating", ratingValue: f.rating, reviewCount: f.reviewCount || 0 } : undefined, offers: { "@type": "Offer", priceCurrency: "EUR", price: f.startingPricePerDay, priceValidUntil: "2026-12-31", availability: "https://schema.org/InStock", url: f.affiliateUrl } }))] }); })()}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is gezonder: vers gestoomd voer of traditionele geëxtrudeerde brokken?","acceptedAnswer":{"@type":"Answer","text":"Vers gestoomd vlees (zoals Butternut Box) en koudgeperste brokken (zoals Farm Food) behouden aanzienlijk meer natuurlijke vitaminen en antioxidanten omdat ze niet op extreem hoge temperaturen worden verhit."}},{"@type":"Question","name":"Hoeveel gram voer heeft mijn hond per dag nodig?","acceptedAnswer":{"@type":"Answer","text":"Gemiddeld heeft een volwassen hond dagelijks ongeveer 1,2% tot 2,5% van zijn lichaamsgewicht aan kwaliteitsvoeding nodig, afhankelijk van activiteit en voersoort."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.food-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.food-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.04);position:relative}.food-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.food-promo{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:700}.btn-food{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:block}.btn-food:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/voeding" style="color:var(--green);font-weight:700">Voeding & Vers</a><a href="/dna-test">DNA Testen</a><a href="/verzekering">Hondenverzekering</a><a href="/spoed-dierenarts">Spoed Dierenarts</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Voedingswijzer & Verse Maaltijden</p><span class="eyebrow">Onafhankelijke Voedingsvergelijker 2026</span><h1>Beste Hondenvoer & Verse Maaltijdboxen</h1><p class="intro">Goede voeding is de basis voor een glanzende vacht, gezonde darmflora, sterke gewrichten en minder dierenartskosten. Vergelijk de hoogst gewaardeerde verse gestoomde maaltijden en koudgeperste brokken met exclusieve TrimGids welkomstkortingen.</p><div class="stats-row"><div class="stat-card"><strong>60%+</strong><span>Echt vlees/vis van hoge kwaliteit</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>50% Korting</strong><span>Exclusieve welkomstdeal</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>Vers aan huis</strong><span>Dagporties op maat bezorgd</span></div></div>${tableForFoods()}
  <div class="food-grid" id="food-container">
${(() => { const fd = loadJsonLocal(foodFile); const foods = (fd && (Array.isArray(fd) ? fd : fd.foods)) || []; return foods.map((f, idx) => `<article class="food-card${idx === 0 ? ' featured' : ''}">${idx === 0 ? '<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">' + f.badge + '</span>' : ''}<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px 'Plus Jakarta Sans',sans-serif;flex:none">${f.logo}</span><div><h2 style="font-size:22px;margin:0">${f.brand}</h2><span style="font-size:13px;color:var(--muted)">⭐ ${f.rating} (${f.reviewCount} reviews) · ${f.foodType}</span></div></div><div class="food-promo">🎁 ${f.discountOffer}</div><p style="font-size:14px;color:var(--muted);margin:0">${f.description}</p><ul class="tg-list">${f.benefits.map(b => '<li>' + b + '</li>').join('')}</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><span style="font-size:14px;color:var(--muted)">Vanaf <strong>€ ${f.startingPricePerDay.toFixed(2)}</strong> / dag</span></div><a class="btn-food" href="${f.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Claim deal & bestel proefbox ↗</a></article>`).join(''); })()}
</div><section class="tip-box" id="portie-calculator"><div class="tip-box-head"><span class="eyebrow" style="color:var(--green)">Rekenmodule</span><h2>🧮 Slimme Portie- & Caloriecalculator</h2><p>Bereken direct hoeveel gram voeding en kilocalorieën jouw viervoeter dagelijks nodig heeft.</p></div><div class="form-grid"><label>Gewicht van je hond (kg)<input type="number" id="calc-weight" value="15" min="1" max="90"></label><label>Activiteitsniveau<select id="calc-activity"><option value="1.2">Rustig / Senioren (weinig beweging)</option><option value="1.5" selected>Normaal (1 tot 2 uur wandelen per dag)</option><option value="1.8">Actief (sport, rennen, lange boswandelingen)</option><option value="2.2">Werkhond / Sporthond (Agility / jacht)</option></select></label><div class="full" style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:14px"><div style="text-align:center"><small style="color:var(--muted)">Aanbevolen dagelijkse portie vers voer</small><div id="res-fresh-grams" style="font:700 28px Fraunces,serif;color:var(--green)">375 g / dag</div></div><div style="text-align:center"><small style="color:var(--muted)">Aanbevolen dagelijkse portie koudgeperste brok</small><div id="res-kibble-grams" style="font:700 28px Fraunces,serif;color:var(--green)">180 g / dag</div></div><div style="text-align:center"><small style="color:var(--muted)">Dagelijkse energiebehoefte</small><div id="res-calories" style="font:700 28px Fraunces,serif;color:var(--ink)">780 kcal</div></div></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige tools & gidsen</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/dna-test">Honden DNA Testen →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a><a href="/kosten-hond">Wat kost een hond? →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids adviseert op basis van onafhankelijke voedingsanalyses.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const loadFood=async()=>{try{const res=await fetch('/api/foods');const data=await res.json();const box=document.getElementById('food-container');if(box.children.length) return;(data.foods||[]).forEach((f,idx)=>{const card=document.createElement('article');card.className='food-card'+(idx===0?' featured':'');card.innerHTML=(idx===0?'<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+f.badge+'</span>':'')+'<div style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0f3e28,#17694a);color:#fff;font:800 18px \'Plus Jakarta Sans\',sans-serif;flex:none">'+f.logo+'</span><div><h2 style="font-size:22px;margin:0">'+f.brand+'</h2><span style="font-size:13px;color:var(--muted)">⭐ '+f.rating+' ('+f.reviewCount+' reviews) · '+f.foodType+'</span></div></div><div class="food-promo">🎁 '+f.discountOffer+'</div><p style="font-size:14px;color:var(--muted);margin:0">'+f.description+'</p><ul class="tg-list">'+f.benefits.map(b=>'<li>'+b+'</li>').join('')+'</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><span style="font-size:14px;color:var(--muted)">Vanaf <strong>€ '+f.startingPricePerDay.toFixed(2)+'</strong> / dag</span></div><a class="btn-food" href="'+f.affiliateUrl+'" target="_blank" rel="sponsored noopener noreferrer">Claim deal & bestel proefbox ↗</a>';box.appendChild(card);});}catch(e){}}loadFood();const calcWeight=document.getElementById('calc-weight');const calcActivity=document.getElementById('calc-activity');const resFresh=document.getElementById('res-fresh-grams');const resKibble=document.getElementById('res-kibble-grams');const resCal=document.getElementById('res-calories');const updatePortions=()=>{const w=parseFloat(calcWeight.value)||15;const act=parseFloat(calcActivity.value)||1.5;const rer=70*Math.pow(w,0.75);const mer=Math.round(rer*act);const freshGrams=Math.round((mer/150)*100);const kibbleGrams=Math.round((mer/360)*100);resCal.textContent=mer+' kcal';resFresh.textContent=freshGrams+' g / dag';resKibble.textContent=kibbleGrams+' g / dag';};calcWeight.addEventListener('input',updatePortions);calcActivity.addEventListener('change',updatePortions);updatePortions();</script></body></html>`;
}

/* Standalone Spoed Dierenarts & Weekenddienst Finder */
function emergencyVetPage() {
  const vetData = loadJsonLocal(emergencyVetsFile);
  const allClinics = (vetData && (Array.isArray(vetData) ? vetData : vetData.clinics)) || [];
  const vetCard = (c) => {
    const maps = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(c.address) + '&travelmode=driving';
    return `<article class="vet-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2 style="font-size:21px;margin:0">${escapeHtml(c.name)}</h2><span style="font-size:13px;color:var(--muted)">${escapeHtml(c.city)} (${escapeHtml(c.region)})</span></div><span class="badge" style="background:#fee2e2;color:#991b1b;font-weight:700">24/7 Spoed</span></div><p style="font-size:13px;color:var(--muted);margin:0"><strong>Adres:</strong> ${escapeHtml(c.address)}<br><strong>Opening:</strong> ${escapeHtml(c.available)}</p><div style="font-size:13px;background:#fff;border:1px solid var(--line);padding:10px;border-radius:10px"><strong>Indicatie spoedconsult:</strong> ${escapeHtml(c.consultFeeWeekendNight)}<br><small style="color:var(--muted)">${escapeHtml(c.advice)}</small></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto"><a class="btn-call" href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a><a class="outline" href="${maps}" target="_blank" rel="noopener noreferrer" style="text-align:center;font-size:13px;padding:10px">Route (Maps) ↗</a></div></article>`;
  };
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>24/7 Spoed Dierenarts & Weekenddienst Finder | TrimGids</title><meta name="description" content="Vind direct een geopende 24/7 spoeddierenarts of weekendkliniek bij jou in de buurt in Limburg, Noord-Brabant, Utrecht, Amsterdam en heel Nederland. Met spoednummer en tarieven."><link rel="canonical" href="https://trimgids.nl/spoed-dierenarts"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wanneer moet ik direct naar een spoeddierenarts?","acceptedAnswer":{"@type":"Answer","text":"Bij acute symptomen zoals een opgezette harde buik (mogelijke maagtorsie), ernstige benauwdheid, aanhoudende epileptische aanvallen, inname van giftige stoffen (chocolade, rattengif, druiven), hevige bloedingen of aanrijdingen."}},{"@type":"Question","name":"Wat kost een consult bij de spoeddierenarts in het weekend of 's nachts?","acceptedAnswer":{"@type":"Answer","text":"Een spoedconsult buiten kantooruren kost doorgaans tussen de € 140,- en € 275,- exclusief medicatie, diagnostiek of operaties."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.vet-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:32px 0}.vet-card{background:#fff;border:1px solid #fecaca;border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 14px rgba(185,28,28,.06)}.btn-call{background:#b91c1c;color:#fff;font-weight:700;padding:12px 18px;border-radius:999px;text-align:center;text-decoration:none;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px}.btn-call:hover{background:#991b1b}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/spoed-dierenarts" style="color:#b91c1c;font-weight:700">Spoed Dierenarts</a><a href="/verzekering">Hondenverzekering</a><a href="/voeding">Voeding</a><a href="/dna-test">DNA Testen</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / 24/7 Spoeddierenartsen</p><span class="eyebrow" style="color:#b91c1c">Acute Hulp & Weekendklinieken</span><h1>24/7 Spoed Dierenarts & Weekenddienst Finder</h1><p class="intro">Heeft jouw hond met spoed veterinaire hulp nodig in het weekend of midden in de nacht? Bel direct een van de regionale 24/7 dierenziekenhuizen en spoedklinieken. <strong>Bel altijd eerst voordat je gaat rijden!</strong></p><div class="stats-row"><div class="stat-card" style="border-left-color:#b91c1c"><strong>24/7</strong><span>Dag en nacht bereikbaar</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>IC & Chirurgie</strong><span>Direct operatiekamers paraat</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>90% Vergoed</strong><span>Met actieve hondenverzekering</span></div></div><div class="vet-grid" id="vet-container">${allClinics.map(vetCard).join('')}</div><section class="guide-box" style="background:#fef2f2;border-color:#fecaca"><span class="eyebrow" style="color:#b91c1c">EHBO Noodwijzer</span><h2>Wanneer bel je onmiddellijk de spoedkliniek?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Opgezette buik & loos braken (Maagtorsie)</h3><p>Bij grote rassen (Berner Sennen, Doodles, Retrievers) kan een maagkanteling binnen 2 uur fataal zijn. Direct met spoed naar de kliniek!</p></div><div class="step-card"><div class="step-num">2</div><h3>Inname van toxische stoffen</h3><p>Chocolade (vooral puur), zoetstof xylitol (kauwgom/pindakaas), druiven/rozijnen, rattengif of lelies. Neem de verpakking mee.</p></div><div class="step-card"><div class="step-num">3</div><h3>Acute benauwdheid of blauwe tong</h3><p>Ademnood, piepende ademhaling, oververhitting in de zomer (hitteberoerte) of verstikking in speelgoed/bot.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige gidsen voor baasjes</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken (Spoeddekking) →</a><a href="/nieuws">Nieuws & Gevaarswaarschuwingen →</a><a href="/vermist">Vermiste Honden Meldpunt →</a><a href="/voeding">Beste Hondenvoeding →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids is een informatieve zorggids. Bel bij acute levensbedreigende spoed direct de dienstdoende dierenkliniek.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const box=document.getElementById('vet-container');const allClinics=${JSON.stringify(allClinics)};box.replaceChildren();allClinics.forEach(c=>{const card=document.createElement('article');card.className='vet-card';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.address)+'&travelmode=driving';card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2 style="font-size:21px;margin:0">'+c.name+'</h2><span style="font-size:13px;color:var(--muted)">'+c.city+' ('+c.region+')</span></div><span class="badge" style="background:#fee2e2;color:#991b1b;font-weight:700">24/7 Spoed</span></div><p style="font-size:13px;color:var(--muted);margin:0"><strong>Adres:</strong> '+c.address+'<br><strong>Opening:</strong> '+c.available+'</p><div style="font-size:13px;background:#fff;border:1px solid var(--line);padding:10px;border-radius:10px"><strong>Indicatie spoedconsult:</strong> '+c.consultFeeWeekendNight+'<br><small style="color:var(--muted)">'+c.advice+'</small></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto"><a class="btn-call" href="tel:'+c.phone+'">'+c.phone+'</a><a class="outline" href="'+maps+'" target="_blank" rel="noopener noreferrer" style="text-align:center;font-size:13px;padding:10px">Route (Maps) ↗</a></div>';box.appendChild(card);});</script></body></html>`;
}

/* Standalone Kosten van een Hond Calculator Page */
function costPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wat kost een hond? 2026 Kosten Calculator & Jaaroverzicht | TrimGids</title><meta name="description" content="Bereken exact wat een hond kost in het eerste jaar en per maand. Inclusief aanschaf, voeding, trimsalon, inentingen, hondenverzekering en bespaartips."><link rel="canonical" href="https://trimgids.nl/kosten-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat kost een hond gemiddeld per maand?","acceptedAnswer":{"@type":"Answer","text":"Volgens Ipsos-onderzoek 2026 geven Nederlandse huishoudens gemiddeld €61 per maand uit aan voer en €15 aan dierbenodigdheden — samen €912 per jaar, exclusief dierenarts, verzekering en uitlaatservice. Volledig meegerekend kost een hond €1.100–3.650 per jaar."}},{"@type":"Question","name":"Wat kost het eerste jaar met een puppy?","acceptedAnswer":{"@type":"Answer","text":"Inclusief aanschaf, bench, inentingen, chipregistratie, puppycursus en basisuitrusting kost een pup in het eerste jaar gemiddeld tussen de € 2.200,- en € 3.800,-."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.cost-calc-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}.cost-stat-card{background:#fff;border-radius:18px;padding:24px;border:1px solid var(--line);display:flex;flex-direction:column;gap:6px}.cost-stat-card strong{font:700 36px Fraunces,serif;color:var(--green)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kosten-hond" style="color:var(--green);font-weight:700">Kosten Calculator</a><a href="/verzekering">Hondenverzekering</a><a href="/voeding">Voeding</a><a href="/dna-test">DNA Testen</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Wat kost een hond?</p><span class="eyebrow">Financiële Hondenwijzer 2026</span><h1>Wat kost een hond per maand en per jaar?</h1><p class="intro">Een hond brengt onvoorwaardelijke vriendschap, maar ook structurele kosten met zich mee. Met onze interactieve rekentool bereken je binnen 30 seconden de verwachte eenmalige opstartkosten en de maandelijkse uitgaven voor jouw formaat hond.</p><div class="cost-calc-box"><div class="form-grid"><label>Formaat van je hond<select id="size-select"><option value="small">Kleine hond (&lt; 10 kg, bijv. Pomeriaan, Teckel, Maltezer, Chihuahua)</option><option value="medium" selected>Middelgrote hond (10 - 25 kg, bijv. Labradoodle, Border Collie, Cockapoo)</option><option value="large">Grote hond (&gt; 25 kg, bijv. Golden Retriever, Berner Sennen, Herder)</option></select></label><label>Voorkeur voeding<select id="diet-select"><option value="premium">Premium Vers / Koudgeperst (Butternut Box / Farm Food)</option><option value="standard">Standaard kwaliteitsbrok</option></select></label><label>Hondenverzekering afsluiten?<select id="ins-select"><option value="yes" selected>Ja, medische kosten verzekeren (aanbevolen)</option><option value="no">Nee, zelf een spaarpotje aanhouden</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="cost-stat-card"><small style="color:var(--muted)">Eenmalige opstartkosten (1e jaar)</small><strong id="res-startup">€ 2.010,-</strong><span>Bench, aanschaf, inentingen, tuig & cursus</span></div><div class="cost-stat-card" style="border-left:4px solid var(--amber)"><small style="color:var(--muted)">Geschatte kosten per maand</small><strong id="res-monthly">€ 142,-</strong><span>Voer, trimsalon, zorg, preventie & snacks</span></div><div class="cost-stat-card" style="border-left:4px solid #3730a3"><small style="color:var(--muted)">Levenslange totale kosten (13 jaar)</small><strong id="res-lifetime">€ 24.160,-</strong><span>Op basis van reële Nederlandse data</span></div></div></div><section class="guide-box"><h2>💡 4 Slimme manieren om te besparen zonder in te leveren op welzijn</h2><div class="steps-grid"><div class="step-card"><h3>1. Vergelijk hondenverzekeringen</h3><p>Een operatie na een kruisbandruptuur of hernia kost al snel € 2.500 tot € 4.500. Een polis vanaf € 11,95/mnd voorkomt dat je plotseling in de schulden raakt.</p></div><div class="step-card"><h3>2. Zelf borstelen tussen trimbeurten</h3><p>Door wekelijks goed door te kammen tot op de huid voorkom je vilt, waardoor de trimsalon minder ontklit-uren hoeft te rekenen.</p></div><div class="step-card"><h3>3. Check hondenbelasting in jouw gemeente</h3><p>In 2026 heft nog maar 30% (101 van 342 gemeenten) hondenbelasting; gemiddeld € 76,58 per jaar, maar variërend van € 21,96 (Simpelveld) tot € 142,18 (Katwijk). Check direct de tarieven.</p></div><div class="step-card"><h3>4. Koudgeperste voeding met hoge dichtheid</h3><p>Koudgeperste brokjes hebben een hogere voedingswaarde per gram, waardoor je minder volume hoeft te voeren dan bij goedkope supermarktbrok met veel vulmiddelen.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Gerelateerde rekentools</h2><div class="next-links"><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/hondenbelasting">Hondenbelasting Checken →</a><a href="/voeding">Beste Verse Hondenvoeding →</a><a href="/dna-test">Honden DNA Testen →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Berekeningen zijn indicatief en gebaseerd op gemiddelde consumentenprijzen in Nederland 2026.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const sizeSel=document.getElementById('size-select');const dietSel=document.getElementById('diet-select');const insSel=document.getElementById('ins-select');const resStartup=document.getElementById('res-startup');const resMonthly=document.getElementById('res-monthly');const resLifetime=document.getElementById('res-lifetime');const updateCosts=()=>{const sz=sizeSel.value;const diet=dietSel.value;const ins=insSel.value==='yes';let startup=sz==='small'?1675:(sz==='medium'?2010:2490);let annual=sz==='small'?1250:(sz==='medium'?1700:2350);if(diet==='premium')annual+=sz==='small'?120:(sz==='medium'?220:380);if(!ins)annual-=sz==='small'?240:(sz==='medium'?320:420);const monthly=Math.round(annual/12);const lifetime=startup+(annual*13);resStartup.textContent='€ '+startup.toLocaleString('nl-NL')+',-';resMonthly.textContent='€ '+monthly.toLocaleString('nl-NL')+',-';resLifetime.textContent='€ '+lifetime.toLocaleString('nl-NL')+',-';};sizeSel.addEventListener('change',updateCosts);dietSel.addEventListener('change',updateCosts);insSel.addEventListener('change',updateCosts);updateCosts();</script></body></html>`;
}
/* Standalone Nationwide News & Alerts Hub with Auto Ticker */
function newsPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Landelijke Hondennieuws Feed, Gif-Alerts & Misstanden 2026 | TrimGids</title><meta name="description" content="24/7 actueel landelijk hondennieuws voor alle 12 provincies: blauwalg-alerts, gifwaarschuwingen, inspectie-invallen bij illegale puppyhandel, speelbossen en wetgeving."><link rel="canonical" href="https://trimgids.nl/nieuws"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.news-ticker-wrap{background:var(--cream);border:1px solid var(--line);border-radius:14px;padding:12px 18px;display:flex;align-items:center;gap:12px;margin:24px 0;font-size:13px}.news-ticker-tag{background:#b91c1c;color:#fff;font-weight:800;padding:3px 8px;border-radius:6px;font-size:11px;text-transform:uppercase;flex-shrink:0}.news-prov-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--green-light);color:var(--green)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws" style="color:var(--green);font-weight:700">Landelijke Nieuwsfeed</a><a href="/vermist">Vermiste Honden</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Landelijk Hondennieuws & Alerts</p><div class="news-ticker-wrap"><span class="news-ticker-tag">🔴 Live Alert Feed</span><marquee behavior="scroll" direction="left" scrollamount="6" style="color:var(--ink);font-weight:600">🚨 Blauwalg waarschuwing in Amsterdamse Bos (Noord-Holland) &nbsp;•&nbsp; ⚠️ Hoge tekendruk gemeten op de Veluwe (Gelderland) &nbsp;•&nbsp; ✨ Nieuw 30.000m² omheind speelbos geopend (Utrechtse Heuvelrug) &nbsp;•&nbsp; 🏛️ Rotterdam en Den Haag behouden 0% hondenbelasting in 2026</marquee></div><span class="eyebrow">Landelijk Nieuwsoverzicht · Alle 12 Provincies</span><h1>Landelijke Hondennieuws Feed & Alerts</h1><p class="intro">Blijf op de hoogte van inspectie-invallen van de Landelijke Inspectie Dierenwelzijn (LID), gif- en blauwalgwaarschuwingen, nieuw geopende losloopbossen en landelijke wetgeving in heel Nederland.</p><div class="filter-bar" id="prov-filter-bar"><button class="f-btn active" data-prov="">Alle 12 Provincies</button><button class="f-btn" data-prov="Noord-Holland">Noord-Holland</button><button class="f-btn" data-prov="Zuid-Holland">Zuid-Holland</button><button class="f-btn" data-prov="Utrecht">Utrecht</button><button class="f-btn" data-prov="Gelderland">Gelderland</button><button class="f-btn" data-prov="Noord-Brabant">Noord-Brabant</button><button class="f-btn" data-prov="Overijssel">Overijssel</button><button class="f-btn" data-prov="Groningen">Groningen</button><button class="f-btn" data-prov="Zeeland">Zeeland</button><button class="f-btn" data-prov="Limburg">Limburg</button></div><div class="tax-controls" style="margin-bottom:24px"><input type="search" id="news-search" placeholder="Zoek op trefwoord, plaats of onderwerp (bijv. blauwalg, giftig, heuvelrug, hondenbelasting, speelbos...)" style="width:100%;padding:13px 18px;border:1px solid var(--line);border-radius:14px;font:inherit"></div><section><div id="news-grid" class="news-grid"><p>Nieuwsberichten laden...</p></div></section><section class="tip-box" id="meldpunt"><div class="tip-box-head"><span class="eyebrow" style="color:#d97706">Landelijke Tiplijn</span><h2>Meld een misstand, gevaar of positief initiatief</h2><p>Heb je verdacht lokaas gevonden, blauwalg gezien of wil je een nieuw losloopgebied aanmelden? Onze redactie controleert en publiceert betrouwbare meldingen direct.</p></div><form id="news-tip-form" class="form-grid"><label>Titel van je melding<input name="title" required maxlength="120" placeholder="Bijv. Verdacht vlees aangetroffen in park"></label><label>Type melding<select name="type"><option value="waarschuwing">⚠️ Gevaar / Waarschuwing (gif, blauwalg, etc.)</option><option value="misstand">🚨 Misstand (opvang, pension, illegale handel)</option><option value="goed-nieuws">✨ Goed nieuws / Nieuw losloopgebied</option><option value="tip">💡 Algemene tip of beleid</option></select></label><label>Plaats / Gemeente<input name="location" required maxlength="100" placeholder="Bijv. Amsterdam, Utrecht, Breda..."></label><label>Je e-mailadres (blijft strikt vertrouwelijk)<input name="reporterEmail" type="email" required maxlength="120" placeholder="jouw@email.nl"></label><label class="full">Omschrijving & details<textarea name="description" required maxlength="2000" placeholder="Wat is er gebeurd? Welke locatie betreft het?"></textarea></label><label class="full">Optionele link naar bron of politierapport<input name="sourceUrl" type="url" maxlength="250" placeholder="https://..."></label><button class="btn-submit full" type="submit">Melding Insturen naar Redactie →</button><p id="tip-status" class="status-msg full"></p></form></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Landelijke Nieuwsdesk — Onafhankelijk kynologisch nieuws voor heel Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeNewsProv='';let allNewsList=[];const newsGrid=document.getElementById('news-grid');const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const catBadges={misstand:'badge-misstand',waarschuwing:'badge-waarschuwing','goed-nieuws':'badge-goed','wetgeving':'badge-wet',beleid:'badge-wet'};const catLabels={misstand:'🚨 Inspectie & Misstand',waarschuwing:'⚠️ Alert / Waarschuwing','goed-nieuws':'✨ Goed Nieuws','wetgeving':'⚖️ Wet & Recht',beleid:'🏛️ Gemeentelijk Beleid'};const loadNews=async()=>{try{const res=await fetch('/api/news');const data=await res.json();allNewsList=data.news||[];renderNews();}catch(e){newsGrid.innerHTML='<p>Kon nieuws niet laden.</p>';}};const renderNews=()=>{newsGrid.replaceChildren();const q=(document.getElementById('news-search').value||'').toLowerCase().trim();const filtered=allNewsList.filter(item=>{const matchProv=!activeNewsProv||item.region===activeNewsProv;const matchQ=!q||item.title.toLowerCase().includes(q)||item.summary.toLowerCase().includes(q)||item.body.toLowerCase().includes(q)||(item.city&&item.city.toLowerCase().includes(q))||(item.region&&item.region.toLowerCase().includes(q));return matchProv&&matchQ;});if(!filtered.length){newsGrid.innerHTML='<p class="empty full">Geen nieuwsberichten gevonden voor deze selectie.</p>';return;}filtered.forEach(item=>{const art=document.createElement('article');art.className='news-card';const badgeCls=catBadges[item.category]||'badge-wet';const badgeLbl=catLabels[item.category]||item.category;art.innerHTML='<div class="news-head"><span class="news-badge '+badgeCls+'">'+badgeLbl+'</span><span class="news-prov-badge">📍 '+(item.region||'Landelijke Feed')+'</span></div><h3>'+esc(item.title)+'</h3><p class="news-sum">'+esc(item.summary)+'</p><p class="news-body">'+esc(item.body)+'</p><div class="news-foot">📅 '+esc(item.date)+' · <strong>Bron:</strong> <span>'+esc(item.source||'TrimGids Redactie')+'</span></div>';newsGrid.appendChild(art);});};document.querySelectorAll('#prov-filter-bar .f-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#prov-filter-bar .f-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeNewsProv=btn.dataset.prov;renderNews();}));document.getElementById('news-search').addEventListener('input',renderNews);loadNews();const tipForm=document.getElementById('news-tip-form');const tipStatus=document.getElementById('tip-status');tipForm.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(tipForm);try{const res=await fetch('/api/news/tips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:data.get('title'),type:data.get('type'),location:data.get('location'),reporterEmail:data.get('reporterEmail'),description:data.get('description'),sourceUrl:data.get('sourceUrl')})});if(!res.ok)throw new Error();tipStatus.textContent='Hartelijk dank. Je melding is ontvangen en wordt z.s.m. door de redactie beoordeeld!';tipStatus.className='status-msg success full';tipForm.reset();}catch(err){tipStatus.textContent='Er ging iets mis bij het verzenden. Controleer je velden en probeer het opnieuw.';tipStatus.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone Missing Dogs Page */
function missingPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mijn hond is vermist & Hoe voorkom je vermissing? | TrimGids</title><meta name="description" content="Overzicht van vermiste honden, direct vermissing melden en een compleet actieplan voor de eerste 24 uur en preventietips (chipregistratie, GPS-trackers en tuigjes)."><link rel="canonical" href="https://trimgids.nl/vermist"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Interactieve Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws & Meldpunt</a><a href="/vermist" style="color:var(--green);font-weight:700">Vermiste Honden</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Vermiste Honden & Preventie</p><span class="eyebrow">Hulp bij vermissing & Noodstappenplan</span><h1>Mijn hond is vermist & Hoe voorkom je vermissing?</h1><p class="intro">Het is de grootste nachtmerrie van elk hondenbaasje: je viervoeter schrikt ergens van of glipt door het tuinhek. Hieronder vind je actueel vermiste honden in de regio, kun je direct een vermissing aanmelden, en lees je exact welke acties binnen de eerste 24 uur het verschil maken.</p><div class="quick-links-bar"><a href="#actuele-vermissingen" class="q-link">🐾 Bekijk vermiste honden</a><a href="#meld-vermissing" class="q-link highlight">🚨 Meld een vermissing</a><a href="#actieplan" class="q-link">⚡ Stappenplan eerste 24 uur</a><a href="#preventie" class="q-link">🛡️ Vermissing voorkomen</a></div><section id="actuele-vermissingen"><div class="section-head"><div><span class="eyebrow">Actuele Signalementen</span><h2>Vermiste viervoeters in de regio</h2></div><a class="outline" href="#meld-vermissing">Meld vermissing →</a></div><div id="missing-grid" class="missing-grid"><p>Signalementen laden...</p></div></section><section class="tip-box" id="meld-vermissing" style="background:#fef2f2;border-color:#fecaca"><div class="tip-box-head"><span class="eyebrow" style="color:#b91c1c">Spoedmelding</span><h2>Meld een vermiste hond aan op TrimGids</h2><p>Vul onderstaand formulier in. Je melding wordt direct live geplaatst zodat andere baasjes, wandelaars en trimsalons in jouw plaats kunnen uitkijken.</p></div><form id="missing-form" class="form-grid"><label>Naam van de hond<input name="name" required maxlength="50" placeholder="Bijv. Bella"></label><label>Ras of kruising<input name="breed" required maxlength="60" placeholder="Bijv. Labradoodle / Pomeriaan"></label><label>Plaats / Gemeente<input name="city" required maxlength="60" placeholder="Bijv. Maastricht"></label><label>Laatst gezien (locatie / wijk / park)<input name="locationLastSeen" required maxlength="120" placeholder="Bijv. Sint Pietersberg / Enci-gebied"></label><label>Datum vermist<input name="dateMissing" type="date" required></label><label>Geslacht & leeftijd<input name="gender" maxlength="40" placeholder="Bijv. Teef, 3 jaar"></label><label>Telefoonnummer voor tips / vinder<input name="contactPhone" type="tel" required maxlength="50" placeholder="Bijv. 06-12345678"></label><label>Beloning (optioneel)<input name="reward" maxlength="100" placeholder="Bijv. € 250,- voor de vinder"></label><label class="full">Omschrijving & uiterlijke kenmerken<textarea name="description" required maxlength="1500" placeholder="Kleur vacht, halsband/tuigje, schrikachtig gedrag, medische bijzonderheden..."></textarea></label><label class="full checkbox-label"><input name="chipRegistered" type="checkbox" checked> Deze hond is gechipt en geregistreerd in een databank</label><button class="btn-submit full" type="submit" style="background:#b91c1c">Plaats Vermissingsmelding →</button><p id="missing-status" class="status-msg full"></p></form></section><section class="guide-box" id="actieplan"><span class="eyebrow">Wat te doen</span><h2>🚨 Noodstappenplan: De eerste 24 uur na vermissing</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Blijf rustig & leg een geurspoor</h3><p>Honden lopen vaak terug naar de plek van vertrek. Laat een gedragen kledingstuk (bijv. sok of T-shirt) en een bakje water achter op de plek waar de hond is weggerend. Blijf daar indien mogelijk rustig posten.</p></div><div class="step-card"><div class="step-num">2</div><h3>Meld direct bij Amivedi & Dierenambulance</h3><p>Meld de vermissing onmiddellijk op <strong>Amivedi.nl</strong> en bel de regionale <strong>Dierenambulance (0900-0245)</strong>. Geef chipnummer, signalement en de exacte locatie door.</p></div><div class="step-card"><div class="step-num">3</div><h3>Controleer chipgegevens bij NDG / Chipnummer.nl</h3><p>Veel honden zijn gechipt, maar staan nog op een oud telefoonnummer of adres geregistreerd! Check via <strong>chipnummer.nl</strong> of je gegevens up-to-date en openbaar vindbaar zijn.</p></div><div class="step-card"><div class="step-num">4</div><h3>WhatsApp Buurtpreventie & Facebookgroepen</h3><p>Plaats een beknopt bericht in lokale Facebookgroepen ('Hond vermist Limburg', wijkpagina's) en informeer buurtpreventie-apps en lokale trimsalons/hondenuitlaatdiensten.</p></div><div class="step-card"><div class="step-num">5</div><h3>Flyeren op ooghoogte</h3><p>Hang duidelijke, waterdichte flyers op bij drukke looproutes, supermarkten, dierenartsen en parkeerplaatsen van wandelgebieden in een straal van 3 tot 5 km.</p></div><div class="step-card"><div class="step-num">6</div><h3>Niet roepen of achtervolgen</h3><p>Een angstige hond in 'survival-modus' herkent zijn baasje soms niet direct en kan vluchten. Ga laag bij de grond zitten, praat zacht en gooi wat lekkers zonder plotselinge bewegingen.</p></div></div></section><section class="guide-box" id="preventie" style="background:#f0fdf4;border-color:#bbf7d0"><span class="eyebrow" style="color:var(--green)">Voorkomen is beter dan genezen</span><h2>🛡️ 5 Essentiële maatregelen om vermissing te voorkomen</h2><div class="steps-grid"><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">A</div><h3>Controleer jaarlijks de chipregistratie</h3><p>Ga naar <strong>chipnummer.nl</strong> of <strong>ndg.nl</strong>. Staat je huidige mobiele nummer vermeld? Als de dierenarts of ambulance de chip scant, moeten ze direct kunnen bellen.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">B</div><h3>Gebruik een ontsnappingsveilig Y-tuig</h3><p>Voor schrikachtige of buitenlandse adoptiehonden is een driepunts anti-paniek tuig met een extra band achter de ribbenkast essentieel. Uit een gewoon halsbandje glippen ze zo achteruit weg.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">C</div><h3>GPS-tracker met live tracking</h3><p>Een echte GPS-tracker met simkaart (zoals Tractive) werkt ook in dichte bossen en buitengebieden, in tegenstelling tot Bluetooth AirTags die afhankelijk zijn van passerende iPhones.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">D</div><h3>Penning met 2 telefoonnummers</h3><p>Een gegraveerde penning of QR-code tag aan de halsband/tuig zorgt ervoor dat een vinder binnen 1 minuut contact kan opnemen, nog vóórdat er een chiplezer aan te pas komt.</p></div><div class="step-card" style="background:#fff"><div class="step-num" style="color:var(--green)">E</div><h3>Vuurwerk- en stormprotocol</h3><p>Tijdens de jaarwisseling, onweersbuien of jachtdagen: dubbel aanlijnen (aan tuig én halsband) en de tuin dubbel controleren op losse schuttingplanken of openstaande poorten.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Handige informatie voor hondenbaasjes</h2><div class="next-links"><a href="/nieuws">Nieuws & Waarschuwingen →</a><a href="/hondenbelasting">Hondenbelasting per gemeente →</a><a href="/wandelen">Wandelroutes & Losloopgebieden →</a><a href="/verzekering">Hondenverzekering Vergelijken →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Samen zorgen we dat elke vermiste hond snel en veilig weer thuis is.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const missingGrid=document.getElementById('missing-grid');const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const loadMissing=async()=>{try{const res=await fetch('/api/missing');const data=await res.json();renderMissing(data.missing||[]);}catch(e){missingGrid.innerHTML='<p>Kon signalementen niet laden.</p>';}};const renderMissing=items=>{missingGrid.replaceChildren();if(!items.length){missingGrid.innerHTML='<p class="empty">Momenteel geen actieve vermissingen geregistreerd.</p>';return;}items.forEach(item=>{const isFound=item.status==='found';const art=document.createElement('article');art.className='missing-card'+(isFound?' found-card':'');art.innerHTML='<div class="missing-badge '+(isFound?'badge-found':'badge-active')+'">'+(isFound?'🎉 HERENIGD / GEVONDEN':'🚨 VERMIST')+ '</div><h3>'+esc(item.name)+' ('+esc(item.breed)+')</h3><div class="missing-meta"><span>📍 '+esc(item.locationLastSeen)+' ('+esc(item.city)+')</span><span>📅 Vermist sinds: '+esc(item.dateMissing)+'</span><span>🐕 '+esc(item.gender||'Onbekend')+' '+(item.age?'· '+esc(item.age)+' jaar':'')+'</span><span>'+(item.chipRegistered?'✅ Gechipt & geregistreerd':'⚠️ Niet gechipt')+'</span></div><p class="missing-desc">'+esc(item.description)+'</p>'+(item.reward?'<div class="reward-tag">🎁 '+esc(item.reward)+'</div>':'')+(isFound?'<div class="found-msg">Deze hond is veilig thuisgekomen!</div>':('<div class="missing-actions"><a class="btn-tel" href="tel:'+esc(item.contactPhone)+'">📞 Bel contactpersoon ('+esc(item.contactPhone)+')</a><button class="btn-resolve" data-id="'+esc(item.id)+'">Markeer als gevonden</button></div>'));missingGrid.appendChild(art);});document.querySelectorAll('.btn-resolve').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('Weet je zeker dat deze hond veilig herenigd/gevonden is?'))return;const res=await fetch('/api/missing/'+encodeURIComponent(btn.dataset.id)+'/resolve',{method:'POST'});if(res.ok)loadMissing();}));};loadMissing();const form=document.getElementById('missing-form');const status=document.getElementById('missing-status');form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);try{const res=await fetch('/api/missing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),breed:data.get('breed'),city:data.get('city'),locationLastSeen:data.get('locationLastSeen'),dateMissing:data.get('dateMissing'),gender:data.get('gender'),contactPhone:data.get('contactPhone'),reward:data.get('reward'),description:data.get('description'),chipRegistered:data.get('chipRegistered')==='on'})});if(!res.ok)throw new Error();status.textContent='Je vermissingsmelding staat direct live! Heel veel succes en sterkte.';status.className='status-msg success full';form.reset();loadMissing();}catch(err){status.textContent='Het formulier kon niet verwerkt worden. Controleer of alle verplichte velden zijn ingevuld.';status.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone Dog Tax Page */
function dogTaxPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondenbelasting per Gemeente 2026: Waar en Hoeveel? | TrimGids</title><meta name="description" content="Overzicht van de hondenbelasting in 2026 in alle Nederlandse gemeenten. Ontdek welke gemeenten hondenbelasting hebben afgeschaft (€0,-) en waar je nog betaalt."><link rel="canonical" href="https://trimgids.nl/hondenbelasting"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom heffen sommige gemeenten nog steeds hondenbelasting?","acceptedAnswer":{"@type":"Answer","text":"Hondenbelasting is een algemene gemeentelijke belasting die naar de algemene middelen vloeit. Gemeenten zijn niet verplicht de opbrengst te besteden aan hondenvoorzieningen."}},{"@type":"Question","name":"Welke grote steden hebben de hondenbelasting afgeschaft?","acceptedAnswer":{"@type":"Answer","text":"Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen, Arnhem, Nijmegen, Breda en Zwolle rekenen € 0,- hondenbelasting. In heel Groningen en Drenthe wordt in 2026 nergens meer geheven; in Friesland alleen nog in Leeuwarden, Smallingerland en Vlieland."}}]}</script><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting" style="color:var(--green);font-weight:700">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenbelasting per gemeente</p><span class="eyebrow">Gemeentelijke Tarievenwijzer 2026</span><h1>Hondenbelasting per Gemeente: Waar en Hoeveel?</h1><p class="intro">In 2026 heffen nog maar <strong>ongeveer 100 van de 342</strong> Nederlandse gemeenten hondenbelasting (29%) — twaalf gemeenten schaften hem dit jaar af, Wijk bij Duurstede voerde hem juist weer in. Waar de belasting nog bestaat, betaal je voor de eerste hond gemiddeld <strong>€ 76,58</strong> per jaar (duurste: Katwijk € 142,18; goedkoopste betaalde tarief: Simpelveld € 21,96; in Kerkrade en Valkenburg aan de Geul is de eerste hond gratis). Zoek hieronder direct jouw gemeente op.</p><div class="stats-row"><div class="stat-card"><strong>71%</strong><span>Gemeenten met € 0,- tarief (Afgeschaft)</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>€ 76,58</strong><span>Gemiddeld tarief 2026 (actieve heffing)</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>€ 21,96</strong><span>Laagste betaalde tarief: Simpelveld (Limburg)</span></div><div class="stat-card" style="border-left-color:#b91c1c"><strong>€ 142,18</strong><span>Hoogste tarief: Katwijk (Zuid-Holland)</span></div></div><div class="tax-controls"><input type="search" id="tax-search" placeholder="Zoek op gemeente (bijv. Maastricht, Heerlen, Sittard, Venlo, Amsterdam, Utrecht...)" autocomplete="off"><div class="tax-filters"><button class="tax-filter-btn active" data-status="">Alle gemeenten</button><button class="tax-filter-btn" data-status="afgeschaft">✅ Afgeschaft (€ 0,-)</button><button class="tax-filter-btn" data-status="actief">💶 Actieve heffing</button></div></div><div class="table-wrap"><table class="tax-table"><thead><tr><th>Gemeente</th><th>Provincie</th><th>Status</th><th>1e Hond</th><th>2e Hond</th><th>Toelichting & Vrijstellingen</th></tr></thead><tbody id="tax-tbody"><tr><td colspan="6">Tarieven laden...</td></tr></tbody></table></div><section class="guide-box"><h2>Veelgestelde vragen over hondenbelasting</h2><div class="faq-grid"><div class="faq-card"><h3>Waarom betaal ik hondenbelasting?</h3><p>Hondenbelasting stamt uit de middeleeuwen (oorspronkelijk ter bestrijding van hondsdolheid). Tegenwoordig is het een algemene belasting die naar de algemene gemeentekas vloeit.</p></div><div class="faq-card"><h3>Geldt er een vrijstelling voor hulphonden?</h3><p>Ja, in vrijwel elke gemeente zijn blindengeleidehonden, officiële assistentiehonden en honden in dierenasiels 100% vrijgesteld van belasting.</p></div><div class="faq-card"><h3>Welke gemeenten zijn het duurst in 2026?</h3><p>Katwijk (€ 142,18), Tilburg (€ 132,28) en Lisse (€ 126,00) heffen het hoogste tarief voor de eerste hond; daarna volgen Barendrecht (€ 120,48) en Veenendaal (€ 113,40). In Kerkrade en Valkenburg aan de Geul is de eerste hond gratis; daarna is Simpelveld (€ 21,96) het goedkoopst.</p></div><div class="faq-card"><h3>Betaal ik voor een tweede hond extra?</h3><p>Ja, in driekwart van de gemeenten kost de tweede hond fors meer. Het grootste verschil zit in Nissewaard: € 99,22 voor de eerste, maar € 261,03 voor de tweede hond. In Heerlen en Brunssum kost de tweede hond zelfs drie keer zoveel als de eerste.</p></div><div class="faq-card"><h3>Hoe weet de gemeente of ik een hond heb?</h3><p>Gemeenten voeren periodiek hondencontroles uit via steekproeven aan de deur of controleren registraties bij de Rijksdienst voor Ondernemend Nederland (RVO chipdatabank).</p></div></div></section><section class="next"><span class="eyebrow">Handige links</span><h2>Ontdek meer voor jouw hond</h2><div class="next-links"><a href="/wandelen">Wandelroutes & Losloopbossen →</a><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/trimsalon/labradoodle">Trimsalon Labradoodle →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Data gecontroleerd op basis van officiële gemeentelijke belastingverordeningen 2026.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeTaxStatus='';const tbody=document.getElementById('tax-tbody');const search=document.getElementById('tax-search');const loadTax=async()=>{try{const q=encodeURIComponent(search.value.trim());const st=encodeURIComponent(activeTaxStatus);const res=await fetch('/api/dog-tax?query='+q+'&status='+st);const data=await res.json();tbody.replaceChildren();if(!data.items?.length){tbody.innerHTML='<tr><td colspan="6" style="padding:20px;text-align:center">Geen gemeenten gevonden voor deze zoekopdracht.</td></tr>';return;}data.items.forEach(d=>{const isAbolished=d.status!=='actief'&&d.status!=='onbekend';const isUnknown=d.status==='onbekend';const tr=document.createElement('tr');tr.innerHTML='<td><strong>'+d.gemeente+'</strong></td><td>'+d.provincie+'</td><td><span class="tax-badge '+(isUnknown?'badge-unknown-tax':(isAbolished?'badge-zero':'badge-active-tax'))+'">'+(isUnknown?'Nog te publiceren':(isAbolished?'Afgeschaft (€ 0)':'Actief'))+'</span></td><td>'+(isUnknown?'n.n.b.':(isAbolished?'€ 0,-':('€ '+d.tarief1eHond.toFixed(2))))+'</td><td>'+(isUnknown?'n.n.b.':(isAbolished?'€ 0,-':('€ '+d.tarief2eHond.toFixed(2))))+'</td><td><small>'+d.toelichting+'</small></td>';tbody.appendChild(tr);});}catch(e){tbody.innerHTML='<tr><td colspan="6">Kon tarieven niet laden.</td></tr>';}};search.addEventListener('input',loadTax);document.querySelectorAll('.tax-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tax-filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTaxStatus=btn.dataset.status;loadTax();}));loadTax();</script></body></html>`;
}

/* Standalone Walking & routes.apexclusive.nl Page */
function walkingPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wandelroutes, Omheinde Losloopbossen & Hondenstranden | TrimGids</title><meta name="description" content="Ontdek de mooiste losloopgebieden, 100% omheinde speelbossen en hondenstranden in Limburg en Nederland. Powered by routes.apexclusive.nl met GPX navigatie."><link rel="canonical" href="https://trimgids.nl/wandelen"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.routes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:30px 0}.route-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 10px rgba(0,0,0,.04)}.route-card h2{font-size:22px;margin:0}.route-tags{display:flex;gap:6px;flex-wrap:wrap}.badge-fenced{background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.badge-water{background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.badge-dist{background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}.route-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:14px;gap:10px;flex-wrap:wrap}.btn-apex{background:var(--green);color:#fff;font-weight:700;font-size:13px;padding:9px 16px;border-radius:999px;text-decoration:none}.btn-maps{color:var(--green);font-weight:700;font-size:13px;text-decoration:none}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen" style="color:var(--green);font-weight:700">Wandelen & Stranden</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Wandelroutes & Losloopgebieden</p><span class="eyebrow">Wandelen in Limburg & Nederland · Powered by routes.apexclusive.nl</span><h1>Wandelroutes, Speelbossen & Hondenstranden</h1><p class="intro">Heerlijk samen op pad zonder aanlijnstress. Hieronder vind je de mooiste wandelroutes, 100% omheinde speelbossen voor angstige/ontsnappingsgevoelige honden, en officiële hondenstranden met schoon zwemwater. Bekijk interactieve hoogteprofielen en GPX-bestanden direct via <strong>routes.apexclusive.nl</strong>.</p><div class="filter-bar"><button class="f-btn active" data-filter="">Alle gebieden</button><button class="f-btn" data-filter="omheind">🔒 100% Omheind Speelbos</button><button class="f-btn" data-filter="strand">💧 Hondenstrand & Zwemwater</button><button class="f-btn" data-filter="limburg">🌲 Zuid- & Midden-Limburg</button></div><div id="routes-container" class="routes-grid"><p>Wandelroutes laden...</p></div><section class="guide-box"><h2>Gouden regels voor veilig loslopen</h2><div class="steps-grid"><div class="step-card"><h3>1. Respecteer het broedseizoen</h3><p>Tussen 15 maart en 15 juli geldt in veel natuurgebieden een strikte aanlijnplicht om jonge reekalfjes, hazen en op de grond broedende vogels rust te gunnen.</p></div><div class="step-card"><h3>2. Pas op met stilstaand water in de zomer</h3><p>Laat je hond bij warm weer nooit drinken of zwemmen in water met een blauwgroene drijflaag (blauwalg) of bij dode watervogels (botulisme).</p></div><div class="step-card"><h3>3. Draag een GPS-tracker of penning</h3><p>In onbekende heuvels of dichte bossen is een GPS-tracker aan het tuigje de beste garantie dat je je hond altijd binnen enkele minuten terugvindt.</p></div></div></section><section class="next"><span class="eyebrow">Handige links</span><h2>Ontdek meer</h2><div class="next-links"><a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" rel="noopener noreferrer">Wandelen in Limburg (routes.apexclusive.nl) ↗</a><a href="/verzekering">Hondenverzekering Vergelijken →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a><a href="/hondenbelasting">Hondenbelasting per gemeente →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>In samenwerking met routes.apexclusive.nl — De beste wandelgids voor Limburg en omstreken.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeRouteFilter='';const container=document.getElementById('routes-container');let allRoutes=[];const loadRoutes=async()=>{try{const res=await fetch('/api/routes');const data=await res.json();allRoutes=data.routes||[];renderRoutes();}catch(e){container.innerHTML='<p>Kon routes niet laden.</p>';}};const renderRoutes=()=>{container.replaceChildren();const filtered=allRoutes.filter(r=>{if(activeRouteFilter==='omheind')return r.fenced===true;if(activeRouteFilter==='strand')return r.type==='hondenstrand'||r.waterAccess===true;if(activeRouteFilter==='limburg')return r.province==='Limburg';return true;});if(!filtered.length){container.innerHTML='<p>Geen routes gevonden voor deze filter.</p>';return;}filtered.forEach(r=>{const art=document.createElement('article');art.className='route-card';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(r.lat+','+r.lng)+'&travelmode=driving';art.innerHTML='<div class="route-tags">'+(r.fenced?'<span class="badge-fenced">🔒 100% Omheind</span>':'<span class="badge-fenced" style="background:#f3f4f6;color:#374151">🌲 Natuurgebied</span>')+(r.waterAccess?'<span class="badge-water">💧 Zwemwater</span>':'')+'<span class="badge-dist">📏 '+r.distanceKm+' km</span></div><h2>'+r.title+'</h2><p style="font-size:14px;color:var(--muted);margin:0;line-height:1.55">'+r.description+'</p><div style="font-size:13px;color:var(--muted)">📍 '+r.city+' ('+r.region+', '+r.province+')<br>🅿️ '+r.parking+'</div><div class="route-foot"><a class="btn-apex" href="'+r.apexclusiveUrl+'" target="_blank" rel="noopener noreferrer">Bekijk op routes.apexclusive.nl ↗</a><a class="btn-maps" href="'+maps+'" target="_blank" rel="noopener noreferrer">🧭 Navigeer (Google Maps) ↗</a><button type="button" class="tg-save-btn" data-save="'+JSON.stringify({type:'route',id:r.slug||r.title,title:r.title,href:'/wandelen'}).replace(/"/g,'&quot;')+'">🔖 <span class="tg-save-label">Bewaren</span></button></div>';container.appendChild(art);});if(window.TGApp)window.TGApp.refreshSaveButtons(container);};document.querySelectorAll('.f-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeRouteFilter=btn.dataset.filter;renderRoutes();}));loadRoutes();</script></body></html>`;
}

/* Standalone Interactive Map Page */
function mapPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ontdekkingskaart Honden Nederland: Salons, Scholen, Opvang & Wandelplekken | TrimGids</title><meta name="description" content="De TrimGids-ontdekkingskaart: 2.900+ geverifieerde trimsalons, hondenscholen, hondenhotels, wellness en officiële losloopgebieden & hondenstranden in heel Nederland — zonder externe kaartblokkades."><link rel="canonical" href="https://trimgids.nl/kaart"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><meta property="og:type" content="website"><meta property="og:title" content="Ontdekkingskaart Honden Nederland | TrimGids"><meta property="og:description" content="2.900+ geverifieerde aanbieders en wandelplekken op één zelf-gehoste kaart."><meta property="og:url" content="https://trimgids.nl/kaart"><meta property="og:image" content="https://trimgids.nl/assets/img/og.jpg"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/nl-map.css"><style>${directoryStyles()}${customModuleStyles()}.map-shell{max-width:1180px;margin:24px auto 0}#nl-map{height:740px}@media(max-width:760px){#nl-map{height:560px}.map-shell{margin-top:14px}}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart" style="color:var(--green);font-weight:700">Ontdekkingskaart</a><a href="/forum">Community</a><a href="/hulphonden">Diensthonden</a><a href="/fokkers">Fokkers</a><a href="/aankoopgids">Aankoopgids</a><a href="/zintuigen">Zintuigen</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Ontdekkingskaart Nederland</p><span class="eyebrow">Gebaseerd op de TrimGids-catalogus — geen externe kaartbron</span><h1>Ontdekkingskaart voor Honden in Nederland</h1><p class="intro">Elke stip is een echte aanbieder of wandelplek uit onze geverifieerde catalogus. In- en uitzoomen, slepen, filteren op categorie, zoeken op plaats en klikken voor direct bellen of navigeren. Werkt overal — ook zonder kaart-CDN.</p><div class="map-shell"><div id="nl-map" data-nl-map data-show-list="true"></div></div><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Verder ontdekken</h2><div class="next-links"><a href="/forum">Community & Forum →</a><a href="/hulphonden">Blindegeleide- & politiehonden →</a><a href="/zintuigen">Zintuigenlab: horen & ruiken →</a><a href="/fokkers">Erkende fokkers in Nederland →</a><a href="/aankoopgids">Aankoopgids per ras →</a><a href="/trimsalon/pomeriaan">Trimsalon Pomeriaan →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Ontdekkingskaart</a>
      <a href="/forum">Forum</a>
      <a href="/hulphonden">Diensthonden</a>
      <a href="/zintuigen">Zintuigen</a>
      <a href="/fokkers">Fokkers</a>
      <a href="/aankoopgids">Aankoopgids</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>© 2026 TrimGids · Kaartdata: TrimGids-catalogus (2.900+ aanbieders)</span>
    <span>100% zelf-gehost — geen externe kaartdiensten</span>
  </div>
</footer>
<script src="/assets/js/nl-map.js" defer></script>
<script>
  (function () {
    var inject = document.createElement('style');
    inject.textContent = '.nlmap-stage{min-height:0}';
    document.head.appendChild(inject);
  })();
</script>
</body></html>`;
}
function providerPage(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'trimsalon' || parts.length !== 4) return null;
  let [, citySlug, breedSlug, providerSlug] = parts;
  const provider = catalog.providers.find(item => item.slug === providerSlug && item.city === citySlug && (item.breeds.includes(breedSlug) || item.breeds.includes('alle-rassen')));
  const place = catalog.places[citySlug];
  /* `alle-rassen` is géén ras: kies een echt ras van deze aanbieder (stabiele canonical). */
  let breed = catalog.breeds[breedSlug];
  if (!breed && provider) {
    const realBreed = (provider.breeds || []).find(b => b !== 'alle-rassen' && catalog.breeds[b]) || Object.keys(catalog.breeds || {})[0];
    if (!realBreed) return null;
    breedSlug = realBreed;
    breed = catalog.breeds[realBreed];
  }
  if (!provider || !place || !breed) return null;

  const canonical = `/trimsalon/${citySlug}/${breedSlug}/${providerSlug}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.address}`)}`;
  const shortName = name => String(name || '').split(' (')[0].replace(/[&|]/g, '&').trim();
  const nameHasPlace = provider.name.toLowerCase().includes(place.name.toLowerCase()) || provider.name.toLowerCase().includes(citySlug.replace(/-/g, ' '));
  const pName = shortName(provider.name), bName = shortName(breed.name);
  const title = nameHasPlace ? `${pName} — ${bName} | TrimGids` : `${pName} — ${bName} in ${shortName(place.name)} | TrimGids`;
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

  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://trimgids.nl${canonical}"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><meta property="og:type" content="business.business"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="https://trimgids.nl${canonical}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">${schemaJson}</script><style>${directoryStyles()}.form-row{display:grid;gap:8px;margin-top:18px}.form-row label{display:grid;gap:5px;color:var(--muted);font-size:14px}.form-row input,.form-row select,.form-row textarea{font:inherit;border:1px solid var(--line);border-radius:10px;padding:10px}.form-row textarea{min-height:100px;resize:vertical}.form-row button{justify-self:start}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon/${citySlug}/${breedSlug}">Terug naar ${breed.name} ${place.name}</a><a href="/kaart">Kaart</a><a href="/verzekering">Hondenverzekering</a><a href="/wandelen">Wandelen</a><a href="/nieuws">Nieuws</a><a href="/vermist">Vermist</a><a href="/hondenbelasting">Hondenbelasting</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / <a href="/trimsalon/${citySlug}">${escapeHtml(place.name)}</a> / <a href="/trimsalon/${citySlug}/${breedSlug}">${escapeHtml(breed.name)}</a> / ${escapeHtml(provider.name)}</p><span class="eyebrow">${provider.demo ? 'Voorbeeldprofiel' : 'Geverifieerd Aanbiederprofiel'}</span><h1>${escapeHtml(provider.name)}</h1><p class="intro">${escapeHtml(description)}</p><div class="summary"><strong>€${provider.startingPrice || 55}</strong><span>vanafprijsindicatie<br><small>Inclusief wassen, drogen en rasverzorging</small></span></div><section><div class="section-head"><div><span class="eyebrow">Aanbiedersdetails</span><h2>Waarom deze salon bij jouw ${breed.name} past</h2></div><a class="outline" href="${maps}" target="_blank" rel="noopener noreferrer">Kaart & route →</a></div><article class="provider"><div><span class="label">Geverifieerde TrimGids-partner</span><h2>${escapeHtml(provider.name)}</h2><p class="address">${escapeHtml(provider.address)}</p><div class="chips">${provider.specializations.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><div class="provider-actions"><a href="${maps}" target="_blank" rel="noopener noreferrer">🧭 Google Maps openen →</a>${provider.phone ? `<a href="tel:${escapeHtml(provider.phone)}" style="color:var(--green);font-weight:700">📞 ${escapeHtml(provider.phone)}</a>` : ''}<a href="/claim?slug=${encodeURIComponent(provider.slug)}&name=${encodeURIComponent(provider.name)}&city=${encodeURIComponent(provider.city)}&addr=${encodeURIComponent(provider.address)}" style="font-size:12px;color:var(--green);font-weight:700">🏢 Bent u de eigenaar? Claim dit gratis profiel →</a></div></article></section><section class="guide"><h2>Vachtverzorging voor een ${escapeHtml(breed.name)}</h2><p>${escapeHtml(breed.summary)}</p><ul>${breed.care.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section class="guide"><h2>Klantervaringen & Reviews</h2><div id="own-reviews"><p>Reviews laden...</p></div><form id="review-form" class="form-row"><label>Jouw naam<input name="author" required maxlength="40"></label><label>Beoordeling<select name="rating"><option value="5">5 sterren (Uitstekend)</option><option value="4">4 sterren (Goed)</option><option value="3">3 sterren (Voldoende)</option><option value="2">2 sterren (Matig)</option><option value="1">1 ster (Slecht)</option></select></label><label>Je ervaring met deze salon<textarea name="body" required maxlength="1000" placeholder="Hoe reageerde je hond? Was het resultaat naar wens?"></textarea></label><button class="outline" type="submit">Ervaring insturen</button><p id="review-status"></p></form></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids — Het onafhankelijke platform voor hondenbaasjes in Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const providerSlug=${JSON.stringify(provider.slug)};const reviews=document.getElementById('own-reviews');const status=document.getElementById('review-status');const render=items=>{reviews.replaceChildren();if(!items.length){reviews.append(Object.assign(document.createElement('p'),{textContent:'Nog geen goedgekeurde TrimGids-reviews. Wees de eerste!'}));return;}items.forEach(item=>{const article=document.createElement('article');article.className='google-review';const title=document.createElement('strong');title.textContent=item.rating+' ★ · '+item.author;const body=document.createElement('p');body.textContent=item.body;article.append(title,body);reviews.append(article);});};fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews').then(response=>response.json()).then(data=>render(data.reviews||[])).catch(()=>{reviews.textContent='Reviews zijn tijdelijk niet beschikbaar.'});document.getElementById('review-form').addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(event.currentTarget);const response=await fetch('/api/providers/'+encodeURIComponent(providerSlug)+'/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:data.get('author'),rating:data.get('rating'),body:data.get('body')})});status.textContent=response.ok?'Bedankt. Je review staat klaar voor moderatie.':'Je review kon niet worden verstuurd.';if(response.ok)event.currentTarget.reset();});</script></body></html>`;
}

/* Comprehensive SEO Directory & Breed Hub Engine */
/* Ronde 10 — herbruikbare providerkaart (directory + paginering gebruiken dezelfde markup) */
/* Ronde 11 — moderne providercard (marktleider-patroon):
   foto/kop, rating-sterren, reviews, prijs-chips, 2-regelige beschrijving,
   één hoofd-CTA + secundaire acties. Alle interactie blijft SSR-safe. */
const PROVIDER_IMG = {
  trimsalon: { src: '/assets/img/cat-trimsalon-480.avif', srcset: '/assets/img/cat-trimsalon-480.avif 480w, /assets/img/cat-trimsalon-960.avif 960w', alt: 'Trimsalon waar een hond wordt getrimd' },
  hondenschool: { src: '/assets/img/cat-school-480.avif', srcset: '/assets/img/cat-school-480.avif 480w, /assets/img/cat-school-960.avif 960w', alt: 'Hondentraining op een grasveld' },
  opvang: { src: '/assets/img/cat-opvang-480.avif', srcset: '/assets/img/cat-opvang-480.avif 480w, /assets/img/cat-opvang-960.avif 960w', alt: 'Honden spelen in een dagopvang' },
  wellness: { src: '/assets/img/cat-wellness-480.avif', srcset: '/assets/img/cat-wellness-480.avif 480w, /assets/img/cat-wellness-960.avif 960w', alt: 'Hondenwellness en fysiotherapie' }
};
function ratingStars(rating) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.round(r);
  return '<span class="pc-stars" aria-hidden="true">' +
    Array.from({ length: 5 }, (_, i) => `<i class="${i < full ? 'on' : ''}">★</i>`).join('') +
    '</span>';
}
function providerCardHtml(p, breedSlug, category = 'trimsalon') {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}`)}`;
  /* Echt ras kiezen: `alle-rassen` is géén catalogus-ras en geeft anders een 404. */
  const realBreeds = (p.breeds || []).filter(b => b !== 'alle-rassen' && catalog.breeds[b]);
  const fallbackBreed = [...realBreeds, ...(Object.keys(catalog.breeds || {})).slice(0, 1)][0] || 'labradoodle';
  const providerUrl = `/trimsalon/${p.city}/${catalog.breeds[breedSlug] ? breedSlug : fallbackBreed}/${p.slug}`;
  const img = PROVIDER_IMG[category] || PROVIDER_IMG.trimsalon;
  const rating = Number(p.rating) || 0;
  const reviews = Number(p.reviewCount) || 0;
  const desc = String(p.description || '').trim();
  const specs = (p.specializations || []).slice(0, 3);
  const moreSpecs = (p.specializations || []).length - specs.length;
  const categoryLabel = category === 'hondenschool' ? 'Hondenschool' : category === 'opvang' ? 'Opvang' : category === 'wellness' ? 'Wellness' : 'Trimsalon';
  return `<article class="provider pc-card" data-name="${escapeHtml(p.name.toLowerCase())}" data-city="${escapeHtml((p.city || '').toLowerCase())}" data-province="${escapeHtml((p.province || '').toLowerCase())}" data-spec="${escapeHtml((p.specializations || []).join(' ').toLowerCase())}" data-rating="${rating}" data-price="${p.startingPrice || 0}">
    <div class="pc-media">
      <img src="${img.src}" srcset="${img.srcset}" sizes="(max-width:640px) 100vw, 380px" width="480" height="320" loading="lazy" decoding="async" alt="${img.alt}">
      <div class="pc-shade"></div>
      <span class="pc-cat">${categoryLabel}</span>
      <span class="pc-verified">✓ Geverifieerd</span>
    </div>
    <div class="pc-body">
      <div class="pc-top">
        <div class="pc-rating">${ratingStars(rating)}<span class="pc-rating-num">${rating.toFixed(1).replace('.', ',')}</span><span class="pc-reviews">(${reviews >= 1000 ? (reviews / 1000).toFixed(1).replace('.', ',') + 'k' : reviews} reviews)</span></div>
        <span class="pc-price">${p.startingPrice ? `€${p.startingPrice}` : 'op aanvraag'}</span>
      </div>
      <h2><a href="${providerUrl}">${escapeHtml(p.name)}</a></h2>
      <p class="address">${escapeHtml(p.address)}</p>
      ${desc ? `<p class="pc-desc">${escapeHtml(desc)}</p>` : ''}
      <div class="chips">
        ${specs.map(x => `<span>${escapeHtml(x)}</span>`).join('')}
        ${moreSpecs > 0 ? `<span class="chips-more">+${moreSpecs} meer</span>` : ''}
      </div>
      <div class="pc-actions">
        <a href="${providerUrl}" class="pc-cta">Bekijk profiel →</a>
        ${p.phone ? `<a href="tel:${escapeHtml(p.phone)}" class="pc-call">Bellen</a>` : ''}
        <a href="${maps}" target="_blank" rel="noopener noreferrer" class="pc-map">Route</a>
      </div>
      <a href="/claim?slug=${encodeURIComponent(p.slug)}&name=${encodeURIComponent(p.name)}&city=${encodeURIComponent(p.city)}&addr=${encodeURIComponent(p.address)}" class="pc-claim">Bent u eigenaar? Claim dit profiel</a>
    </div>
  </article>`;
}

function directoryPage(pathname, pageParam = 1) {
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

  const isRasBreedHub = parts[0] === 'rassen' && breedSlug && !placeSlug;

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

  // Fallback: eerst aanbieders uit dezelfde provincie, dan landelijk (R10:
  // geen misleidende "in {plaats}"-claims en 0 dode/lege lijsten).
  let isFallback = false;
  const targetProvince = place ? (place.province || place.region) : null;
  if (!providers.length && (breedSlug || placeSlug)) {
    isFallback = true;
    const catMatch = p => (p.category === category || category === 'trimsalon');
    const breedMatch = p => !breedSlug || (p.breeds && (p.breeds.includes(breedSlug) || p.breeds.includes('alle-rassen')));
    const regional = catalog.providers.filter(p => catMatch(p) && breedMatch(p) && targetProvince && p.province === targetProvince);
    providers = regional.length ? regional : catalog.providers.filter(p => catMatch(p) && breedMatch(p));
  }

  // SEO Page Title & Meta Description Construction
  let title = '';
  let metaDesc = '';
  let h1 = '';
  let canonical = '';

  /* Korte namen voor >70-char titels (SERP-CTR): volle namen blijven in h1/tekst staan. */
  const shortName = name => String(name || '').split(' (')[0].replace(/[&|]/g, '&').trim();
  const clampDesc = desc => { const d = desc.trim(); return d.length > 158 ? d.slice(0, 155).replace(/[,.:;\s]+$/, '') + '…' : d; };
  const catNoun = category === 'opvang' ? 'Opvang & Hotels' : category === 'wellness' ? 'Wellness & Spas' : category === 'hondenschool' ? 'Scholen & Trainers' : 'Salons & Scholen';

  if (isBreedHub && breed) {
    const b = shortName(breed.name);
    const isRas = parts[0] === 'rassen';
    if (isRas) {
      title = `${b}: ras, kenmerken & verzorging | TrimGids`;
      if (title.length > 70) title = `${b}: rasgids & verzorging | TrimGids`;
      metaDesc = clampDesc(`Alles over de ${breed.name}: karakter, vacht en verzorging (${breed.avgCostRange}, ${breed.brushingFrequency}), plus veelgestelde vragen en gecertificeerde trimsalons.`);
      h1 = `${breed.name}: ras, kenmerken & verzorging`;
      canonical = `/rassen/${breedSlug}`;
    } else {
      title = `Trimsalon ${b}: prijzen, ontwollen & salons | TrimGids`;
      if (title.length > 70) title = `Trimsalon ${b} (2026) | TrimGids`;
      metaDesc = clampDesc(`Zoek je de beste trimsalon voor een ${breed.name}? Bekijk advies over ontwollen, efileren, kosten (${breed.avgCostRange}), verzorging en gecertificeerde salons in Nederland.`);
      h1 = `Trimsalon voor ${breed.name}`;
      canonical = `/trimsalon/${breedSlug}`;
    }
  } else if (breed && place) {
    const b = shortName(breed.name), p = shortName(place.name);
    title = `Trimsalon ${b} in ${p} | TrimGids`;
    if (title.length > 70) title = `Trimsalon ${b} ${p} | TrimGids`;
    if (title.length > 70) title = `${b}-trimsalon ${p} | TrimGids`;
    metaDesc = clampDesc(`Vind gecertificeerde trimsalons voor een ${breed.name} in ${place.name}. Vergelijk ${providers.length}+ salons op raservaring, ontwollen, teddy beer cuts, vanaf-prijzen en reviews.`);
    h1 = `Trimsalon voor ${breed.name} in ${place.name}`;
    canonical = `/${category}/${placeSlug}/${breedSlug}`;
  } else if (place) {
    const p = shortName(place.name), c = shortName(catLabel);
    title = `${c} in ${p}: aanbieders & tarieven | TrimGids`;
    if (title.length > 70) title = `${c} in ${p} (2026) | TrimGids`;
    metaDesc = clampDesc(`Vind de beste ${catLabel.toLowerCase()} in ${place.name} (${place.region || place.province}). Vergelijk betrouwbare professionals op raservaring, tarieven, klantervaringen en navigatie.`);
    h1 = `${catLabel} in ${place.name}`;
    canonical = `/${category}/${placeSlug}`;
  } else {
    const c = shortName(catLabel);
    title = `${c} in Nederland: overzicht & vergelijking 2026 | TrimGids`;
    if (title.length > 70) title = `${c} in Nederland (2026) | TrimGids`;
    metaDesc = clampDesc(`Het complete en onafhankelijke overzicht van ${catLabel.toLowerCase()} in Nederland. Zoek per provincie, stad en specifiek hondenras.`);
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

  // Provider cards rendering — gepagineerd (R10: snelheid & overzicht)
  const PAGE_SIZE = providers.length > 120 ? 36 : (providers.length > 40 ? 40 : 999);
  const totalPages = Math.max(1, Math.ceil(providers.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, pageParam || 1), totalPages);
  const pageProviders = providers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cardsHtml = pageProviders.length ? pageProviders.map(p => providerCardHtml(p, breedSlug, category)).join('') : `<div class="empty"><h2>Geen directe vermeldingen in deze specifieke selectie</h2><p>Bekijk hieronder nabijgelegen salons of vraag een offerte aan.</p></div>`;
  let paginationHtml = '';
  if (totalPages > 1) {
    const base = canonical;
    const pages = [...new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages])]
      .filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const items = [];
    let prev = 0;
    for (const n of pages) {
      if (n - prev > 1) items.push(`<span class="pag-ellipsis">…</span>`);
      items.push(n === page
        ? `<a class="outline pag-pill active" aria-current="page" href="${base}?page=${n}">${n}</a>`
        : `<a class="outline pag-pill" href="${base}?page=${n}">${n}</a>`);
      prev = n;
    }
    paginationHtml = `
    <div class="dir-pagination" role="navigation" aria-label="Aanbiederspagina's">
      <div class="dir-pagination-info"><strong>${providers.length.toLocaleString('nl-NL')}</strong> aanbieders gevonden · pagina ${page} van ${totalPages}</div>
      <div class="dir-pagination-links">
        ${page > 1 ? `<a class="outline pag-pill" rel="prev" href="${base}?page=${page - 1}">← Vorige</a>` : ''}
        ${items.join('')}
        ${page < totalPages ? `<a class="outline pag-pill" rel="next" href="${base}?page=${page + 1}">Volgende →</a>` : ''}
      </div>
    </div>`;
  }

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
        <ul class="tg-list">
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
<title>${escapeHtml(page > 1 ? `${title} – pagina ${page} van ${totalPages}` : title)}</title>
<meta name="description" content="${escapeHtml(page > 1 ? `${metaDesc} Pagina ${page} van ${totalPages}.` : metaDesc)}">
<link rel="canonical" href="https://trimgids.nl${page > 1 ? `${canonical}?page=${page}` : canonical}">
${page > 1 ? `<link rel="prev" href="https://trimgids.nl${canonical}?page=${page - 1}">` : ''}
${page < totalPages ? `<link rel="next" href="https://trimgids.nl${canonical}?page=${page + 1}">` : ''}
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDesc)}">
<meta property="og:url" content="https://trimgids.nl${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(metaDesc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
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
  ${(() => {
    const heroImg = PROVIDER_IMG[category] || PROVIDER_IMG.trimsalon;
    const avgRating = providers.length ? (providers.reduce((s, x) => s + (Number(x.rating) || 0), 0) / providers.length) : 0;
    const minPrice = providers.length ? Math.min(...providers.map(x => x.startingPrice || Infinity)) : 0;
    const provinceCount = new Set(providers.map(x => x.province).filter(Boolean)).size;
    const provOptions = [...new Set(providers.map(x => x.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'nl'));
    return `
  <section class="dir-hero" aria-label="${escapeHtml(h1)}">
    <img src="${heroImg.src}" srcset="${heroImg.srcset}" sizes="(max-width:640px) 100vw, 1200px" width="960" height="640" fetchpriority="high" decoding="async" alt="${heroImg.alt}">
    <div class="dir-hero-content">
      <span class="eyebrow">${breed && place ? `${escapeHtml(place.name)} · ${escapeHtml(breed.name)}` : (breed ? 'Ras & Vachtverzorging' : (place ? `${escapeHtml(place.name)} Regio` : 'Overzicht in Nederland'))}</span>
      <h1>${escapeHtml(h1)}</h1>
      <p class="intro">${escapeHtml(metaDesc)}</p>
      <div class="dir-stats">
        <span><b>${providers.length.toLocaleString('nl-NL')}</b> aanbieders</span>
        <span><b>${avgRating ? avgRating.toFixed(1).replace('.', ',') : '—'}</b> gem. beoordeling</span>
        ${minPrice && minPrice !== Infinity ? `<span><b>€${minPrice}</b> laagste vanafprijs</span>` : ''}
        <span><b>${provinceCount || '12'}</b> provincies</span>
      </div>
    </div>
  </section>
  <div class="dir-toolbar" role="search" aria-label="Aanbieders zoeken, filteren en sorteren">
    <div class="dir-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
      <input id="dir-q" type="search" placeholder="Zoek op naam, plaats of specialisatie…" autocomplete="off" aria-label="Zoek aanbieders">
    </div>
    <select id="dir-prov" aria-label="Filter op provincie">
      <option value="">Alle provincies</option>
      ${provOptions.map(p => `<option value="${escapeHtml(p.toLowerCase())}">${escapeHtml(p)}</option>`).join('')}
    </select>
    <select id="dir-sort" aria-label="Sorteer aanbieders">
      <option value="default">Aanbevolen</option>
      <option value="rating">Hoogste beoordeling</option>
      <option value="price">Laagste prijs</option>
      <option value="name">Naam A–Z</option>
    </select>
    <span class="dir-count" id="dir-count" aria-live="polite">${pageProviders.length.toLocaleString('nl-NL')} van ${providers.length.toLocaleString('nl-NL')} op deze pagina</span>
  </div>
  <template id="dir-prov-options" hidden>${provOptions.map(p => `<option value="${escapeHtml(p.toLowerCase())}">${escapeHtml(p)}</option>`).join('')}</template>
  <div class="dir-empty" id="dir-empty" hidden><strong>Geen aanbieders gevonden</strong><p>Pas je zoekopdracht of filters aan.</p><button type="button" class="outline" id="dir-reset">Filters wissen</button></div>`;
  })()}

  ${isFallback ? `<div class="tip-box" style="margin:-16px 0 0"><span class="eyebrow">Geen directe vermeldingen in ${place ? place.name : 'deze selectie'}</span><p>Voor ${breed ? `${breed.name} ` : ''}in ${place ? place.name : 'deze regio'} hebben we ${targetProvince ? `${targetProvince.toLowerCase()} ` : ''}geen geverifieerde ${category === 'opvang' ? 'hondenopvang' : category === 'wellness' ? 'wellnessaanbieder' : category === 'hondenschool' ? 'hondenschool' : 'trimsalon'} gevonden. Hieronder staan de beste opties ${targetProvince ? `uit ${targetProvince} ` : ''}en de rest van Nederland — bel gerust voor een verwijzing naar een salon bij jou in de buurt.</p></div>` : ''}
  ${warningBox}
  ${breedStatsHtml}

  ${isRasBreedHub ? `
  <section class="guide-box">
    <span class="eyebrow">Ras & verzorging</span>
    <h2>${escapeHtml(breed.name)} verzorgingsgids</h2>
    <p>${escapeHtml(breed.summary)}</p>
    <div class="stats-row">
      <div class="stat-card"><strong>${breed.avgCostRange}</strong><span>Gemiddelde kosten per trimbeurt</span></div>
      <div class="stat-card" style="border-left-color:var(--amber)"><strong>${breed.sheddingLevel}</strong><span>Rui-/verharingsniveau</span></div>
      <div class="stat-card" style="border-left-color:#3730a3"><strong>${breed.brushingFrequency}</strong><span>Aanbevolen borstelfrequentie</span></div>
    </div>
    <p style="margin-top:16px"><strong>Techniek:</strong> ${escapeHtml(breed.technique)}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
      <a class="outline" href="/trimsalon/${breedSlug}">✂️ ${providers.length}+ ${shortName(breed.name)}-trimsalons →</a>
      <a class="outline" href="/kaart">Bekijk op kaart →</a>
    </div>
  </section>` : `
<section class="dir-explore-sec" aria-label="${isFallback ? 'Aanbieders in jouw regio' : 'Aanbieders vinden en ontdekken'}">
    <div class="section-head">
      <div>
        <span class="eyebrow">Aanbod & Beschikbaarheid</span>
        <h2>${isFallback ? `Beste ${category === 'opvang' ? 'opvang' : category === 'wellness' ? 'wellness' : category === 'hondenschool' ? 'hondenscholen' : 'salons'} bij ${place ? place.name : 'jouw regio'}` : `Aanbieders ${breed ? `voor ${breed.name}` : ''} ${place ? `in ${place.name}` : 'in Nederland'}`}</h2>
        <p class="dir-sub">${providers.length.toLocaleString('nl-NL')} ${catLabel.toLowerCase()} gevonden — bekijk ze op de kaart of als volledige lijst.</p>
      </div>
      <a class="outline" href="/kaart">Volledige ontdekkingskaart →</a>
    </div>

    <div class="dir-tabs" role="tablist" aria-label="Weergave kiezen">
      <button class="dir-tab is-on" id="tab-explore" type="button" role="tab" aria-selected="true" aria-controls="pane-explore">Kaart & Overzicht</button>
      <button class="dir-tab" id="tab-list" type="button" role="tab" aria-selected="false" aria-controls="pane-list">Volledige lijst <span class="dir-tab-count">${providers.length.toLocaleString('nl-NL')}</span></button>
    </div>

    <div class="dir-explore is-on" id="pane-explore" role="tabpanel" aria-labelledby="tab-explore">
      <div class="dir-map-wrap">
        <div class="dir-map-box" data-nl-map data-category="${category}"${place ? ` data-province="${escapeHtml(place.province || place.region || '')}"` : ''} aria-busy="true"></div>
        <span class="dir-map-hint">Klik een stip voor adres & navigatie — of bekijk ze onder elkaar in de lijst.</span>
      </div>
      <div class="dir-mini-list" aria-label="Eerste aanbieders">
        <div class="dir-mini-head"><strong>Uitgelicht vandaag</strong><span>Top 6 van ${providers.length.toLocaleString('nl-NL')}</span></div>
        <div class="dir-mini-grid">${pageProviders.slice(0, 6).map(p => providerCardHtml(p, breedSlug, category)).join('')}</div>
        <button class="btn dir-show-all" id="dir-show-all" type="button">Bekijk alle ${providers.length.toLocaleString('nl-NL')} aanbieders →</button>
      </div>
    </div>

    <div class="dir-list-pane" id="pane-list" role="tabpanel" aria-labelledby="tab-list">
      <div class="providers" id="dir-grid">
        ${cardsHtml}
      </div>
      ${paginationHtml}
    </div>
  </section>`}

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
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids — Het onafhankelijke platform voor trimsalons, scholen en hondenwelzijn in Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script>
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

<script>
const initTheme=()=>{
  try{
    const saved=localStorage.getItem('trimgids_theme')||((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');
    document.documentElement.setAttribute('data-theme',saved);
    const btn=document.getElementById('theme-toggle');
    if(btn)btn.innerHTML='<span class="theme-icon"><svg class="ic" aria-hidden="true"><use href="#i-'+(saved==='dark'?'sun':'moon')+'"/></svg></span>';
  }catch(e){}
};
try{initTheme();}catch(e){}
document.querySelectorAll('#theme-toggle').forEach(b=>b.addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',cur);
  localStorage.setItem('trimgids_theme',cur);
  document.querySelectorAll('#theme-toggle').forEach(btn=>{
    btn.innerHTML='<span class="theme-icon"><svg class="ic" aria-hidden="true"><use href="#i-'+(cur==='dark'?'sun':'moon')+'"/></svg></span>';
  });
}));
/* Ronde 11 — directory: live zoeken, provincie-filter en sorteren (SSR-safe) */
(function(){
  var grid=document.getElementById('dir-grid');
  if(!grid) return;
  var q=document.getElementById('dir-q'), prov=document.getElementById('dir-prov'), sort=document.getElementById('dir-sort');
  var count=document.getElementById('dir-count'), empty=document.getElementById('dir-empty'), reset=document.getElementById('dir-reset');
  var cards=Array.prototype.slice.call(grid.querySelectorAll('.pc-card'));
  var total=cards.length;
  var fmt=function(n){return Number(n||0).toLocaleString('nl-NL');};
  var apply=function(){
    var query=(q.value||'').trim().toLowerCase();
    var province=prov.value;
    var visible=cards.filter(function(c){
      if(query){
        var hay=(c.getAttribute('data-name')||'')+' '+(c.getAttribute('data-city')||'')+' '+(c.getAttribute('data-spec')||'');
        if(hay.indexOf(query)===-1) return false;
      }
      if(province && (c.getAttribute('data-province')||'')!==province) return false;
      return true;
    });
    var order=sort.value;
    if(order!=='default'){
      visible.sort(function(a,b){
        if(order==='rating') return (parseFloat(b.getAttribute('data-rating'))||0)-(parseFloat(a.getAttribute('data-rating'))||0);
        if(order==='price') return (parseFloat(a.getAttribute('data-price'))||1e9)-(parseFloat(b.getAttribute('data-price'))||1e9);
        if(order==='name') return String(a.getAttribute('data-name')).localeCompare(String(b.getAttribute('data-name')),'nl');
        return 0;
      });
    }
    visible.forEach(function(c){ grid.appendChild(c); });
    cards.forEach(function(c){ c.hidden = visible.indexOf(c)===-1; });
    if(count) count.textContent=fmt(visible.length)+' van '+fmt(total)+' op deze pagina';
    if(empty) empty.hidden=visible.length>0;
    if(grid) grid.style.display=visible.length?'':'none';
  };
  /* Ronde 13 — directory: kaart/lijst tab-switch */
  (function(){
    var tabs=document.querySelectorAll('.dir-tab');
    var panes={explore:document.getElementById('pane-explore'),list:document.getElementById('pane-list')};
    var showAll=document.getElementById('dir-show-all');
    var set=function(which){
      tabs.forEach(function(t){
        var on=t.id==='tab-'+which;
        t.classList.toggle('is-on',on);
        t.setAttribute('aria-selected',on?'true':'false');
      });
      if(panes.explore) panes.explore.classList.toggle('is-on',which==='explore');
      if(panes.list){ if(which==='explore'){panes.list.setAttribute('hidden','');} else {panes.list.removeAttribute('hidden');} }
      if(showAll) showAll.hidden=(which==='list');
      if(which==='explore' && panes.explore && typeof panes.explore.scrollIntoView==='function'){try{panes.explore.scrollIntoView({block:'nearest'});}catch(e){}}
    };
    tabs.forEach(function(t){ t.addEventListener('click',function(){ set(t.id==='tab-list'?'list':'explore'); }); });
    set('explore');
    if(showAll) showAll.addEventListener('click',function(){ set('list'); var g=document.getElementById('dir-grid'); if(g&&typeof g.scrollIntoView==='function'){try{g.scrollIntoView({block:'start'});}catch(e){}} });
  })();

  [q,prov,sort].forEach(function(el){ if(el) el.addEventListener('input',apply); });
  if(reset) reset.addEventListener('click',function(){
    if(q) q.value=''; if(prov) prov.value=''; if(sort) sort.value='default';
    apply(); if(q) q.focus();
  });
  apply();
})();
</script>
</body>
</html>`;
}


/* Standalone Last-Minute Trimsalon Deals Marketplace */
function lastMinutePage() {
  const lmData = loadJsonLocal(lastMinuteFile);
  const allSlots = (lmData && (Array.isArray(lmData) ? lmData : lmData.slots)) || [];
  const dealCard = (s) => `<article class="deal-card"><span class="deal-badge">${escapeHtml(String(s.discount || 'Last-minute'))}</span><h2 style="font-size:20px;margin:0">${escapeHtml(s.providerName)}</h2><span style="font-size:13px;color:var(--muted)">${escapeHtml(s.city)} (${escapeHtml(s.province || 'NL')})</span><div style="font-size:14px;background:#f9fafb;padding:10px 14px;border-radius:10px;border:1px solid var(--line)"><strong>${escapeHtml(s.date)}</strong> om <strong>${escapeHtml(s.time)}</strong><br>${escapeHtml(s.service)}</div><div class="deal-price-box"><div><span style="font-size:11px;color:var(--muted);text-decoration:line-through;display:block">${s.originalPrice ? 'Oorspronkelijk €' + escapeHtml(String(s.originalPrice)) : ''}</span><strong style="font-size:24px;color:var(--green)">${s.dealPrice ? '€ ' + Number(s.dealPrice).toFixed(2) : 'Korting'}</strong></div><button class="btn-claim-deal" data-id="${escapeHtml(s.id)}">Claim deze plek →</button></div></article>`;
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Last-Minute Trimsalon Deals & Vrije Plekken Vandaag/Morgen | TrimGids</title><meta name="description" content="Zoek je vandaag of morgen met spoed een trimsalon? Bekijk geannuleerde afspraken en last-minute trimsalon plekken met 10% tot 25% korting in heel Nederland."><link rel="canonical" href="https://trimgids.nl/last-minute"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.deals-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:24px;margin:32px 0}.deal-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.deal-badge{position:absolute;top:-12px;right:20px;background:#b91c1c;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;text-transform:uppercase}.deal-price-box{background:var(--green-light);border-radius:14px;padding:14px;display:flex;justify-content:space-between;align-items:center}.btn-claim-deal{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;border:0;cursor:pointer;font-size:14px}.btn-claim-deal:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/last-minute" style="color:var(--green);font-weight:700">Last-Minute Deals</a><a href="/offerte">Offertes</a><a href="/kaart">Kaart</a><a href="/verzekering">Verzekering</a><a href="/bedrijven">Voor Bedrijven</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Last-Minute Deals & Vrije Plekken</p><span class="eyebrow">Direct Beschikbaar · Live Annuleringen</span><h1>Last-Minute Trimsalon Plekken & Deals</h1><p class="intro">Heeft jouw hond snel een trimbeurt, wasbeurt of ontwolbehandeling nodig? Salons bieden geannuleerde afspraken aan met exclusieve last-minute kortingen. Claim direct je plek!</p><div class="stats-row"><div class="stat-card"><strong>⚡ Vandaag & Morgen</strong><span>Geen maandenlange wachttijd</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>10% - 25%</strong><span>Last-minute prijsvoordeel</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong>Direct Bevestigd</strong><span>Rechtstreeks contact met de salon</span></div></div><div class="deals-grid" id="deals-container">${allSlots.filter(s => !s.claimed).map(dealCard).join('')}</div><section class="tip-box" id="salon-meld-plek"><div class="tip-box-head"><span class="eyebrow" style="color:var(--green)">Voor Trimsalons</span><h2>Heeft een klant afgezegd? Meld je lege plek gratis aan</h2><p>Voorkom een lege trimtafel. Meld je uitgevallen afspraak aan en bereik direct honderden baasjes in jouw regio.</p></div><form id="slot-form" class="form-grid"><label>Naam van je trimsalon<input name="providerName" required maxlength="80" placeholder="Bijv. Trimsalon La Dolce Vita"></label><label>Plaats / Gemeente<input name="city" required maxlength="60" placeholder="Bijv. Maastricht"></label><label>Datum van de open plek<input name="date" type="date" required></label><label>Tijdstip<input name="time" required maxlength="40" placeholder="Bijv. 14:00 uur"></label><label>Dienst / Geschikt voor<input name="service" required maxlength="100" placeholder="Bijv. Trimbeurt Labradoodle of Poedel"></label><label>Korting / Actie<input name="discount" required maxlength="80" placeholder="Bijv. 15% Last-minute korting"></label><label>Oorspronkelijke prijs (€)<input name="originalPrice" type="number" step="0.5" placeholder="75"></label><label>Actieprijs (€)<input name="dealPrice" type="number" step="0.5" placeholder="63.75"></label><label class="full">Telefoon / WhatsApp voor baasjes<input name="phone" type="tel" required placeholder="06-12345678"></label><button class="btn-submit full" type="submit">Plaats Vrije Plek Live →</button><p id="slot-status" class="status-msg full"></p></form></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Last-Minute Marketplace koppelt salons en baasjes direct.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const allSlots=${JSON.stringify(allSlots)};const loadDeals=()=>{const box=document.getElementById('deals-container');box.replaceChildren();const slots=allSlots.filter(s=>!s.claimed);if(!slots.length){box.innerHTML='<div class="empty full"><h3>Geen open last-minute plekken op dit moment.</h3><p>Kom later terug of meld je aan voor meldingen.</p></div>';return;}slots.forEach(s=>{const card=document.createElement('article');card.className='deal-card';card.innerHTML='<span class="deal-badge">'+s.discount+'</span><h2 style="font-size:20px;margin:0">'+s.providerName+'</h2><span style="font-size:13px;color:var(--muted)">'+s.city+' ('+(s.province||'NL')+')</span><div style="font-size:14px;background:#f9fafb;padding:10px 14px;border-radius:10px;border:1px solid var(--line)"><strong>'+s.date+'</strong> om <strong>'+s.time+'</strong><br>'+s.service+'</div><div class="deal-price-box"><div><span style="font-size:11px;color:var(--muted);text-decoration:line-through;display:block">'+(s.originalPrice?'Oorspronkelijk €'+s.originalPrice:'')+'</span><strong style="font-size:24px;color:var(--green)">'+(s.dealPrice?'€ '+s.dealPrice.toFixed(2):'Korting')+'</strong></div><button class="btn-claim-deal" data-id="'+s.id+'">Claim deze plek →</button></div>';box.appendChild(card);});document.querySelectorAll('.btn-claim-deal').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.id;try{const r=await fetch('/api/last-minute/'+encodeURIComponent(id)+'/claim',{method:'POST'});if(r.ok){alert('Gefeliciteerd! Je hebt deze plek geclaimd. De salon neemt z.s.m. contact met je op.');loadDeals();}else{alert('Deze plek is zojuist al geclaimd door een ander baasje.');loadDeals();}}catch(e){}}));};}else{alert('Deze plek is zojuist al geclaimd door een ander baasje.');loadDeals();}}catch(e){}}));}catch(e){}}loadDeals();const slotForm=document.getElementById('slot-form');const slotStatus=document.getElementById('slot-status');slotForm.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(slotForm);try{const res=await fetch('/api/last-minute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(data.entries()))});if(res.ok){slotStatus.textContent='Je open plek is succesvol live geplaatst!';slotStatus.className='status-msg success full';slotForm.reset();loadDeals();}else{throw new Error();}}catch(err){slotStatus.textContent='Plaatsen mislukt. Controleer je invoer.';slotStatus.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone 3-Step Instant Multi-Quote Lead Engine */
function quotePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vergelijk Gratis Offertes: Trimsalons & Hondenscholen | TrimGids</title><meta name="description" content="Vraag binnen 1 minuut gratis en vrijblijvend 3 offertes aan van de best beoordeelde trimsalons, hondenscholen en dagopvang in jouw regio. Direct prijzen vergelijken."><link rel="canonical" href="https://trimgids.nl/offerte"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.quote-card-wrap{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:36px;margin:32px 0;box-shadow:0 6px 20px rgba(0,0,0,.04)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/offerte" style="color:var(--green);font-weight:700">💼 Gratis Offertes</a><a href="/last-minute">Last-Minute</a><a href="/kaart">Kaart</a><a href="/verzekering">Verzekering</a><a href="/bedrijven">Voor Bedrijven</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Offerte-Aanvraag</p><span class="eyebrow">100% Gratis & Vrijblijvend</span><h1>Ontvang 3 Offertes van Specialisten in Jouw Regio</h1><p class="intro">Bespaar tijd en geld. Vul onderstaand formulier in en ontvang binnen gemiddeld 2 uur reactie en tarieven van geverifieerde trimsalons, hondenscholen of opvanglocaties bij jou in de buurt.</p><div class="quote-card-wrap"><form id="multi-quote-form" class="form-grid"><label>Welke dienst zoek je?<select name="service" required><option value="Volledige trimbeurt">✂️ Volledige Trimbeurt & Vachtverzorging</option><option value="Ontwollen / Ruiverzorging">🐕 Ontwollen & Blaasdroogbehandeling</option><option value="Puppycursus / Hondenschool">🎓 Puppycursus of Gehoorzaamheidstraining</option><option value="Gedragstherapie">🧠 Gedragstherapie & Privétraining</option><option value="Hondenhotel / Dagopvang">🏨 Hondenhotel, Vakantiepension of Dagopvang</option><option value="Hydrotherapie / Wellness">💆 Hydrotherapie of Dierfysiotherapie</option></select></label><label>Hondenras of type<input name="breed" required placeholder="Bijv. Labradoodle, Pomeriaan, Golden Retriever"></label><label>Jouw woonplaats / gemeente<input name="city" required placeholder="Bijv. Maastricht, Amsterdam, Utrecht..."></label><label>Gewenste termijn<select name="timeframe"><option value="Zo snel mogelijk (deze week)">⚡ Zo snel mogelijk (deze week)</option><option value="Binnen 2 weken" selected>Binnen 2 weken</option><option value="Binnen een maand">Binnen een maand</option><option value="Alleen oriënterend / Prijzen opvragen">Alleen tarieven vergelijken</option></select></label><label>Jouw naam<input name="name" required placeholder="Voor- en achternaam"></label><label>E-mailadres (voor offertes)<input name="email" type="email" required placeholder="jouw@email.nl"></label><label>Telefoonnummer (optioneel voor snelle WhatsApp/bel reactie)<input name="phone" type="tel" placeholder="06-12345678"></label><label class="full">Extra toelichting of speciale wensen<textarea name="notes" placeholder="Bijv. Leeftijd van de hond, eventuele klitten, vachtconditie, specifiek gedrag..."></textarea></label><button class="btn-submit full" type="submit" style="font-size:16px;padding:16px">Verstuur Aanvraag naar Lokale Bedrijven →</button><p id="quote-res" class="status-msg full"></p></form></div><section class="guide-box"><h2>Hoe werkt de TrimGids offerteservice?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Aanvraag plaatsen</h3><p>Binnen 1 minuut vul je de behoeften van jouw hond in. 100% gratis en zonder verplichtingen.</p></div><div class="step-card"><div class="step-num">2</div><h3>Lokale matches</h3><p>Wij sturen je aanvraag direct door naar maximaal 3 geverifieerde specialisten in jouw gemeente.</p></div><div class="step-card"><div class="step-num">3</div><h3>Kies de beste salon</h3><p>Je ontvangt prijzen, beschikbaarheid en advies. Jij kiest zelf met wie je in zee gaat.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Offerteaanvragen worden vertrouwelijk behandeld en enkel gedeeld met aangesloten partners.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const qForm=document.getElementById('multi-quote-form');const qRes=document.getElementById('quote-res');const params=new URLSearchParams(window.location.search);if(params.get('city'))qForm.elements['city'].value=params.get('city');if(params.get('breed'))qForm.elements['breed'].value=params.get('breed');qForm.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(qForm);try{const r=await fetch('/api/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(data.entries()))});if(r.ok){qRes.textContent='Hartelijk dank! Je offerte-aanvraag is succesvol verzonden. Lokale specialisten nemen binnen gemiddeld 2 uur contact met je op.';qRes.className='status-msg success full';qForm.reset();}else{throw new Error();}}catch(err){qRes.textContent='Verzenden mislukt. Controleer je velden en probeer het opnieuw.';qRes.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone B2B Partner Portal ("TrimGids Pro") */
/* B2B Partner & Claim Portal */

/* Standalone Automated Instant Claim Page */

/* Dierenarts Tarieven & Verrichtingen Gids */
function vetTariffsPage() {
  const tariffData = loadJsonLocal(vetTariffsFile);
  const allTariffs = (tariffData && (Array.isArray(tariffData) ? tariffData : tariffData.tariffs)) || [];
  const tariffCard = (t) => `<article class="tariff-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:20px;margin:0">${escapeHtml(t.procedure)}</h2><span class="label" style="margin-top:4px">${escapeHtml(t.category)}</span></div></div><div style="background:var(--cream);padding:12px;border-radius:12px;display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:12px;color:var(--muted)">Gemiddeld tarief</span><div class="tariff-price">€ ${Number(t.avgPrice).toFixed(2)}</div></div><div style="text-align:right;font-size:13px;color:var(--muted)">Bandbreedte:<br><strong>${escapeHtml(t.priceRange)}</strong></div></div><p style="font-size:14px;color:var(--muted);margin:0">${escapeHtml(t.description)}</p><div style="font-size:13px;color:var(--green);font-weight:700">Verzekeringsdekking: ${escapeHtml(t.coveredByInsurance)}</div><div style="font-size:12px;color:var(--muted);background:rgba(0,0,0,0.03);padding:8px 12px;border-radius:8px"><em>${escapeHtml(t.urgentTip)}</em></div><div style="margin-top:auto"><a href="/verzekering" class="btn-submit" style="display:block;text-align:center;text-decoration:none;font-size:13px;padding:9px">Bereken Vergoeding via Verzekering →</a></div></article>`;
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dierenarts Tarieven 2026: Wat Kost een Dierenartsbezoek? | TrimGids</title><meta name="description" content="Officiële gemiddelde dierenartskosten van 2026: consult, vaccinaties, castratie, sterilisatie, gebitsreiniging, röntgenfoto's en spoedoperaties. Vergelijk en bespaar."><link rel="canonical" href="https://trimgids.nl/dierenarts-tarieven"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom verschillen dierenartstarieven zo sterk per praktijk?","acceptedAnswer":{"@type":"Answer","text":"Sinds de vrijgave van de diergeneeskundige tarieven mag elke dierenartspraktijk zelf zijn prijzen bepalen. Grote ketens en gespecialiseerde spoedklinieken hanteren vaak hogere tarieven dan zelfstandige dorpspraktijken."}},{"@type":"Question","name":"Hoeveel vergoedt een hondenverzekering van deze kosten?","acceptedAnswer":{"@type":"Answer","text":"Toonaangevende verzekeraars (zoals Figo Pet en OHRA) vergoeden tot 80% - 90% van de medisch noodzakelijke dierenartskosten, inclusief consulten, röntgenfoto's, MRI-scans en spoedoperaties."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.tariffs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:24px;margin:32px 0}.tariff-card{background:var(--card-bg);border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.tariff-price{font:700 28px Fraunces,serif;color:var(--green)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/dierenarts-tarieven" style="color:var(--green);font-weight:700">Dierenartstarieven</a><a href="/spoed-dierenarts">Spoeddierenartsen</a><a href="/verzekering">Verzekering</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Dierenarts Tarieven 2026</p><span class="eyebrow">Landelijke Prijspeiling 2026</span><h1>Wat Kost een Dierenarts in Nederland?</h1><p class="intro">Dierenartskosten zijn de afgelopen jaren met ruim 30% gestegen. Bekijk hieronder de landelijke gemiddelde tarieven en prijsmarges voor consulten, vaccinaties, operaties en diagnostiek.</p><div class="stats-row"><div class="stat-card"><strong>€ 48,50</strong><span>Gemiddeld consulttarief (15 min)</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>€ 2.400,-</strong><span>Gemiddelde kosten spoedoperatie (torsie/hernia)</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>Tot 90%</strong><span>Gedekt via hondenverzekering</span></div></div><div class="tariffs-grid" id="tariff-container">${allTariffs.map(tariffCard).join('')}</div><section class="guide-box"><h2>Hoe voorkom je torenhoge dierenartsrekeningen?</h2><div class="steps-grid"><div class="step-card"><h3>1. Sluit vroeg een verzekering af</h3><p>Wacht niet tot je hond symptomen vertoont; bestaande aandoeningen worden uitgesloten. <a href="/verzekering" style="color:var(--green);font-weight:700">Vergelijk premies vanaf € 14,-/mnd →</a></p></div><div class="step-card"><h3>2. Preventieve gebits- en vachtzorg</h3><p>Door wekelijks tanden te poetsen en viltklitten tijdig te laten verwijderen voorkom je ontstekingen en narcosekosten.</p></div><div class="step-card"><h3>3. Vermijd weekendtoeslagen bij niet-spoed</h3><p>Een consult op zaterdagavond of zondag kost vaak € 120,- tot € 180,- extra. Ga bij twijfel doordeweeks overdag.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Tarieven zijn indicatieve marktgemiddelden. Vraag altijd een prijsopgave bij je eigen dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const tBox=document.getElementById('tariff-container');const allTariffs=${JSON.stringify(allTariffs)};tBox.replaceChildren();allTariffs.forEach(t=>{const card=document.createElement('article');card.className='tariff-card';card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:20px;margin:0">'+t.procedure+'</h2><span class="label" style="margin-top:4px">'+t.category+'</span></div></div><div style="background:var(--cream);padding:12px;border-radius:12px;display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:12px;color:var(--muted)">Gemiddeld tarief</span><div class="tariff-price">€ '+t.avgPrice.toFixed(2)+'</div></div><div style="text-align:right;font-size:13px;color:var(--muted)">Bandbreedte:<br><strong>'+t.priceRange+'</strong></div></div><p style="font-size:14px;color:var(--muted);margin:0">'+t.description+'</p><div style="font-size:13px;color:var(--green);font-weight:700">Verzekeringsdekking: '+t.coveredByInsurance+'</div><div style="font-size:12px;color:var(--muted);background:rgba(0,0,0,0.03);padding:8px 12px;border-radius:8px"><em>'+t.urgentTip+'</em></div><div style="margin-top:auto"><a href="/verzekering" class="btn-submit" style="display:block;text-align:center;text-decoration:none;font-size:13px;padding:9px">Bereken Vergoeding via Verzekering →</a></div>';tBox.appendChild(card);});</script></body></html>`;
}

/* Hondenvoer Koolhydraten & Kwaliteits Calculator */
function foodCalculatorPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondenvoer Calculator: Koolhydraten & Kwaliteit Berekenen | TrimGids</title><meta name="description" content="Bereken het werkelijke koolhydraatpercentage (NFE) en de vleeskwaliteit van jouw hondenbrokken of natvoer. Ontdek verborgen suikers en granen in hondenvoeding."><link rel="canonical" href="https://trimgids.nl/hondenvoer-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom staat het koolhydraatpercentage niet op de hondenvoerzak?","acceptedAnswer":{"@type":"Answer","text":"Volgens de Europese diervoederwetgeving (FEDIAF) zijn fabrikanten niet verplicht het percentage koolhydraten te vermelden. Veel goedkope merken verbergen hiermee dat hun brokken voor 50% tot 60% uit graan- en maïsvulstoffen bestaan."}},{"@type":"Question","name":"Wat is een gezond koolhydraatpercentage voor een hond?","acceptedAnswer":{"@type":"Answer","text":"Kwalitatieve verse voeding en premium koudgeperste brokken bevatten idealiter minder dan 25% tot 30% koolhydraten op droge stof."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.food-calc-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hondenvoer-calculator" style="color:var(--green);font-weight:700">🥘 Voer Kwaliteits-Check</a><a href="/voeding">Verse Voeding Deals</a><a href="/afvallen-hond">Dieet Calculator</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenvoer Calculator</p><span class="eyebrow">Wetenschappelijke Voedingsanalyse</span><h1>Hondenvoer Koolhydraten & Kwaliteits Calculator</h1><p class="intro">Fabrikanten zijn wettelijk niet verplicht om koolhydraten op het etiket te zetten. Vul de analytische bestanddelen van de achterkant van je voerzak in en bereken direct het werkelijke koolhydraatgehalte op droge stof.</p><div class="food-calc-box"><div class="form-grid"><label>Ruw Eiwit %<input type="number" id="fc-protein" value="26" min="0" max="90" step="0.5"></label><label>Ruw Vet %<input type="number" id="fc-fat" value="14" min="0" max="90" step="0.5"></label><label>Vochtgehalte % (vaak 8-10% bij brok, 75-80% bij natvoer)<input type="number" id="fc-moisture" value="9" min="0" max="90" step="0.5"></label><label>Ruwe As % (vaak 6-8%)<input type="number" id="fc-ash" value="7.5" min="0" max="25" step="0.5"></label><label class="full">Ruwe Celstof / Vezels % (vaak 2-4%)<input type="number" id="fc-fiber" value="3.5" min="0" max="25" step="0.5"></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="res-carbs">40.0</span>%</strong><span>Werkelijk percentage koolhydraten (NFE)</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong><span id="res-carbs-dm">44.0</span>%</strong><span>Koolhydraten op Droge Stof</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong><span id="res-verdict" style="color:var(--green)">Matig / Gemiddeld</span></strong><span>Onafhankelijk Kwaliteitsoordeel</span></div></div></div><section class="guide-box"><h2>Hoe herken je echt kwaliteitsvoer?</h2><div class="steps-grid"><div class="step-card"><h3>1. Duidelijke dierlijke eiwitbron</h3><p>Kijk of er specifiek 'vers lamsvlees (40%)' of 'gedroogde eend' staat in plaats van vage 'dierlijke bijproducten'.</p></div><div class="step-card"><h3>2. Geen overbodige graanvulstoffen</h3><p>Honden hebben van nature weinig amylase-enzymen in speeksel om grote hoeveelheden tarwe en maïs efficiënt te verteren.</p></div><div class="step-card"><h3>3. Gestoomd of Koudgeperst</h3><p>Koudgeperste brokken en zacht gestoomde verse maaltijden behouden natuurlijke vetzuren en vitaminen zonder te verbranden. <a href="/voeding" style="color:var(--green);font-weight:700">Bekijk 50% kortingsdeals →</a></p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Formule: NFE = 100 - (Eiwit + Vet + Vocht + As + Celstof). Gebaseerd op kynologische voedingsleer.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const fp=document.getElementById('fc-protein');const ff=document.getElementById('fc-fat');const fm=document.getElementById('fc-moisture');const fa=document.getElementById('fc-ash');const ffi=document.getElementById('fc-fiber');const rC=document.getElementById('res-carbs');const rCdm=document.getElementById('res-carbs-dm');const rV=document.getElementById('res-verdict');const calcFood=()=>{const p=parseFloat(fp.value)||0;const f=parseFloat(ff.value)||0;const m=parseFloat(fm.value)||0;const a=parseFloat(fa.value)||0;const fi=parseFloat(ffi.value)||0;const carbs=Math.max(0,100-(p+f+m+a+fi));const dryMatter=Math.max(1,100-m);const carbsDm=(carbs/dryMatter)*100;rC.textContent=carbs.toFixed(1);rCdm.textContent=carbsDm.toFixed(1);if(carbsDm<25){rV.textContent='⭐⭐⭐⭐⭐ Topkwaliteit (Laag in koolhydraten)';rV.style.color='#166534';}else if(carbsDm<40){rV.textContent='✅ Goede Kwaliteit';rV.style.color='#15803d';}else if(carbsDm<50){rV.textContent='⚠️ Matig (Veel vulstoffen)';rV.style.color='#d97706';}else{rV.textContent='🚨 Laagwaardig (Meer dan 50% granen/koolhydraten)';rV.style.color='#b91c1c';}};fp.addEventListener('input',calcFood);ff.addEventListener('input',calcFood);fm.addEventListener('input',calcFood);fa.addEventListener('input',calcFood);ffi.addEventListener('input',calcFood);calcFood();</script></body></html>`;
}

/* Honden Vaccinatieschema & Inentingen Gids */
function vaccinationGuidePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Honden Vaccinatieschema 2026: Inentingen & Titertest | TrimGids</title><meta name="description" content="Compleet vaccinatieschema voor puppy's en volwassen honden in 2026. DHP, Ziekte van Weil, Kennelhoest, Rabiës en vaccineren op maat met de Titertest (VacciCheck)."><link rel="canonical" href="https://trimgids.nl/honden-vaccinaties"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hoe vaak moet een volwassen hond ingeënt worden?","acceptedAnswer":{"@type":"Answer","text":"De grote cocktail (DHP: Hondenziekte, Parvo, Leverziekte) hoeft slechts eens per 3 jaar gegeven te worden of kan getiterd worden. De Ziekte van Weil (Leptospirose) beschermt maximaal 12 maanden en moet jaarlijks herhaald worden."}},{"@type":"Question","name":"Wat is een titertest (VacciCheck) bij honden?","acceptedAnswer":{"@type":"Answer","text":"Met een druppeltje bloed meet de dierenarts de hoeveelheid antistoffen in het bloed tegen Parvo, Hondenziekte en HCC. Heeft de hond nog voldoende antistoffen, dan is opnieuw vaccineren overbodig."}}]}</script><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/honden-vaccinaties" style="color:var(--green);font-weight:700">💉 Inentingen & Titeren</a><a href="/spoed-dierenarts">Dierenartsen</a><a href="/hondenpension-checklist">Opvang Checklist</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Honden Vaccinatieschema 2026</p><span class="eyebrow">Preventieve Diergeneeskunde 2026</span><h1>Vaccinatieschema voor Honden: Wat is Verplicht?</h1><p class="intro">Welke inentingen heeft jouw pup of volwassen hond écht nodig, hoe zit het met buitenlandreizen en wat zijn de voordelen van een titertest (VacciCheck)? Bekijk hieronder het officiële kynologische inentingsschema.</p><div class="steps-grid" style="margin:30px 0"><div class="step-card"><div class="step-num">6-9-12</div><h3>Puppy Basisserie</h3><p>Op 6 weken (Parvo/Hondenziekte), 9 weken (Weil + Parvo) en 12 weken (Grote Cocktail + optioneel Rabiës/Kennelhoest). Herhaling volgt op 1-jarige leeftijd.</p></div><div class="step-card"><div class="step-num">3 jr</div><h3>DHP Cocktail (Grote Cocktail)</h3><p>Beschermt tegen Hondenziekte, Parvo en Besmettelijke Leverziekte. Geeft minimaal 3 jaar volledige immuniteit en is uitstekend te titeren.</p></div><div class="step-card"><div class="step-num">1 jr</div><h3>Ziekte van Weil (Leptospirose - L4)</h3><p>Bacteriële infectie via rattenurine in stilstaand zoet water. Werkt maximaal 12 maanden en kan niet getiterd worden; jaarlijkse herhaling is noodzakelijk.</p></div><div class="step-card"><div class="step-num">✈️</div><h3>Rabiës & Kennelhoest (Opvang & Buitenland)</h3><p>Rabiës is wettelijk verplicht bij grensoverschrijding (3 jaar geldig). Kennelhoest (Bordetella) is verplicht bij hondenscholen, pensions en dagopvang.</p></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Diergeneeskundige Gids. Raadpleeg voor maatwerkadvies altijd je eigen dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

function claimPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Claim Gratis Jouw Bedrijfsprofiel | TrimGids Pro</title><meta name="description" content="Bent u eigenaar van een trimsalon, hondenschool of pension? Claim direct gratis uw bedrijfspagina op TrimGids, beheer uw openingstijden en ontvang boekingen."><link rel="canonical" href="https://trimgids.nl/claim"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.claim-box{background:var(--card-bg);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0;box-shadow:0 10px 30px rgba(0,0,0,.04)}.preview-box{background:var(--cream);border:1px solid var(--line);border-radius:18px;padding:22px;margin:24px 0;border-left:4px solid var(--green)}.verified-badge{display:inline-flex;align-items:center;gap:6px;background:var(--green-light);color:var(--green);font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px}.auto-badge{background:#e0e7ff;color:#3730a3;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;display:inline-block;margin-bottom:8px}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids Pro</a><div class="nav-links"><a href="/bedrijven">Voor Bedrijven</a><a href="/kaart">Kaart</a><a href="/last-minute">Last-Minute</a><a href="/offerte">Offerte Leads</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/bedrijven">Voor Bedrijven</a> / Claim Bedrijfsprofiel</p><span class="eyebrow">Geautomatiseerde Eigenaarsverificatie 2026</span><h1>Claim Jouw Gratis Bedrijfsprofiel</h1><p class="intro">TrimGids verbindt maandelijks meer dan 45.000 hondenbaasjes met lokale vakspecialisten. Claim gratis uw vermelding om direct uw openingstijden, foto's en specialisaties aan te passen.</p><div class="claim-box"><span class="auto-badge">⚡ Geautomatiseerde koppeling actief</span><div class="preview-box"><h3>Geselecteerd Bedrijf: <span id="disp-name" style="color:var(--green)">Uw Trimsalon / Onderneming</span></h3><p style="font-size:14px;color:var(--muted);margin:4px 0 0">📍 <span id="disp-city">Gemeente</span> · <span id="disp-addr">Adresgegevens</span></p><div style="margin-top:12px"><span class="verified-badge">⭐ Geverifieerd Profiel 2026 (Wordt geactiveerd na claim)</span></div></div><form id="instant-claim-form" class="form-grid"><label>Bedrijfsnaam<input name="companyName" id="f-name" required placeholder="Bijv. Trimsalon De Gouden Poot"></label><label>Gemeente / Plaats<input name="city" id="f-city" required placeholder="Bijv. Maastricht"></label><label>Straat & Huisnummer<input name="address" id="f-addr" placeholder="Bijv. Dorpsstraat 2"></label><label>Jouw Naam (Eigenaar / Beheerder)<input name="ownerName" required placeholder="Bijv. Sarah de Vries"></label><label>Zakelijk E-mailadres<input name="email" type="email" required placeholder="info@uwdomein.nl"></label><label>Mobiel / WhatsApp voor afspraken<input name="phone" type="tel" required placeholder="06-12345678"></label><label class="full">Website / Social Media URL<input name="website" placeholder="https://www.uwdomein.nl"></label><label class="full">Gewenst Partner Pakket<select name="plan"><option value="free" selected>Gratis Basis Vermelding (€ 0,- voor altijd)</option><option value="partner">TrimGids Partner Pro (€ 19,- / mnd - Inclusief No-Show vulling & Top Positie)</option><option value="lead-pro">Lead Generator Pro (€ 49,- / mnd - Directe offerte-leads)</option></select></label><button class="btn-submit full" type="submit">Claim & Activeer Mijn Pagina Direct 🚀</button><p id="claim-status" class="status-msg full"></p></form></div><section class="guide-box"><h2>Wat gebeurt er na het claimen?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Directe Toegang & Beheer</h3><p>U ontvangt direct een bevestigingsmail met een beveiligde link om openingstijden, prijzen en foto's live bij te werken.</p></div><div class="step-card"><div class="step-num">2</div><h3>Gouden Keurmerk Badge</h3><p>Uw profiel krijgt direct de officiële badge 'Geverifieerd 2026', wat zorgt voor maximaal consumentenvertrouwen.</p></div><div class="step-card"><div class="step-num">3</div><h3>Nooit meer Lege Trimtafels</h3><p>Bij afzeggingen plaatst u binnen 2 minuten een last-minute plek om uitgevallen uren direct op te vullen.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids B2B Zakelijk Netwerk. Vragen? Mail naar partners@trimgids.nl</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const params=new URLSearchParams(window.location.search);const qSlug=params.get('slug')||'';const qName=params.get('name')||'';const qCity=params.get('city')||'';const qAddr=params.get('addr')||'';if(qName){document.getElementById('disp-name').textContent=qName;document.getElementById('f-name').value=qName;}if(qCity){document.getElementById('disp-city').textContent=qCity;document.getElementById('f-city').value=qCity;}if(qAddr){document.getElementById('disp-addr').textContent=qAddr;document.getElementById('f-addr').value=qAddr;}const form=document.getElementById('instant-claim-form');const status=document.getElementById('claim-status');form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);try{const res=await fetch('/api/providers/'+encodeURIComponent(data.get('companyName'))+'/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('ownerName'),email:data.get('email'),phone:data.get('phone'),plan:data.get('plan'),notes:'Geclaimd via instant claim formulier. Adres: '+data.get('address')+' ('+data.get('city')+')'})});if(res.ok){status.textContent='🎉 Gefeliciteerd! Uw bedrijfsprofiel is succesvol geclaimd. Er is een bevestiging gestuurd naar uw e-mail.';status.className='status-msg success full';form.reset();}else{throw new Error();}}catch(err){status.textContent='Claimen mislukt. Controleer uw gegevens en probeer het opnieuw.';status.className='status-msg error full';}});</script></body></html>`;
}

function businessPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TrimGids Pro: Voor Trimsalons, Hondenscholen & Pensions | TrimGids</title><meta name="description" content="Bereik maandelijks 45.000+ hondenbaasjes in jouw regio. Claim je gratis bedrijfsprofiel of upgrade naar TrimGids Pro voor directe offerte-leads en WhatsApp boekingen."><link rel="canonical" href="https://trimgids.nl/bedrijven"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:24px;margin:36px 0}.pricing-card{background:var(--card-bg);border:1px solid var(--line);border-radius:24px;padding:32px;display:flex;flex-direction:column;gap:16px;box-shadow:0 4px 14px rgba(0,0,0,.04);position:relative}.pricing-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.plan-price{font:700 36px Fraunces,serif;color:var(--green)}.plan-features{display:grid;gap:10px;font-size:14px;color:var(--ink-2);margin:14px 0;padding-left:0;list-style:none}.plan-features li{padding-left:22px;position:relative}.plan-features li::before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:700}.btn-plan{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;display:block;border:0;cursor:pointer}.btn-plan.outline{background:transparent;color:var(--ink);border:1px solid var(--line)}.roi-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:32px;margin:36px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids Pro</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/kaart">Kaart</a><a href="/offerte">Offerte Leads</a><a href="/last-minute">Last-Minute Deals</a><a href="/trimsalon-inkomsten-calculator">Omzet Calculator</a><a href="/bedrijven" style="color:var(--green);font-weight:700">💼 Voor Bedrijven</a><a href="/">Consumenten Site</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Partner Worden</p><span class="eyebrow">Voor Trimsalons, Scholen & Pensions</span><h1>Vergroot Jouw Klantenkring met TrimGids Pro</h1><p class="intro">Elke maand zoeken meer dan 45.000 Nederlandse hondenbaasjes via TrimGids naar betrouwbare verzorgers in hun buurt. Claim vandaag nog jouw gratis basisprofiel of activeer Pro om no-show leegstand direct op te vullen.</p><div class="pricing-grid"><div class="pricing-card"><span class="eyebrow">Altijd Gratis</span><h2 style="font-size:24px;margin:0">Basis Vermelding</h2><div class="plan-price">€ 0,- <span style="font-size:14px;color:var(--muted);font-weight:400">/ voor altijd gratis</span></div><p style="font-size:14px;color:var(--muted)">Zorg dat jouw salon vindbaar is op de landelijke interactieve kaart en in de gemeentegids.</p><ul class="plan-features"><li>Vindbaar op interactieve kaart & gemeentepagina</li><li>Basis contactgegevens & Google Maps navigatie</li><li>Openingstijden & adresvermelding</li><li>Foto's en specialisaties beheren</li></ul><a href="#claim-form" class="btn-plan outline">Claim Gratis Profiel →</a></div><div class="pricing-card featured"><span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">Meest Gekozen</span><span class="eyebrow" style="color:var(--green)">Partner Pro</span><h2 style="font-size:24px;margin:0">TrimGids Partner</h2><div class="plan-price">€ 19,- <span style="font-size:14px;color:var(--muted);font-weight:400">/ maand</span></div><p style="font-size:14px;color:var(--muted)">Voor salons en scholen die continu nieuwe vaste klanten willen en no-show leegstand willen voorkomen.</p><ul class="plan-features"><li><strong>'Geverifieerd Partner 2026'</strong> gouden keurmerk badge</li><li>Directe <strong>WhatsApp & Bellen Boekingsknop</strong> op profiel</li><li><strong>Bovenaan zoekresultaten</strong> in jouw gemeente</li><li>Plaats onbeperkt <strong>Last-Minute Annuleringen</strong></li><li>Geen concurrentie-advertenties op jouw profiel</li></ul><a href="#claim-form" class="btn-plan">Start met Partner Pro →</a></div><div class="pricing-card"><span class="eyebrow" style="color:#3730a3">Ultimate</span><h2 style="font-size:24px;margin:0">Lead Generator Pro</h2><div class="plan-price">€ 49,- <span style="font-size:14px;color:var(--muted);font-weight:400">/ maand</span></div><p style="font-size:14px;color:var(--muted)">Maximale zichtbaarheid en exclusieve doorsturing van offerte-aanvragen in jouw regio.</p><ul class="plan-features"><li>Alles van Partner Pro</li><li><strong>Directe offerte-leads</strong> via SMS & WhatsApp</li><li>Exclusieve <strong>Nr. 1 Top Salon banner</strong> in jouw stad</li><li>Uitgelicht in de TrimGids seizoensnieuwsbrief</li><li>Persoonlijke support & Google vindbaarheid boost</li></ul><a href="#claim-form" class="btn-plan">Start met Lead Generator →</a></div></div><div class="roi-box"><span class="eyebrow" style="color:var(--green)">Bewezen Rendement</span><h2>Waarom TrimGids Pro zichzelf tienvoudig terugverdient</h2><p style="color:var(--muted);margin-bottom:20px">Als professioneel trimmer levert 1 extra hond of 1 opgevulde annulering per maand al direct winst op.</p><div class="stats-row"><div class="stat-card"><strong>€ 19,- / mnd</strong><span>Kosten TrimGids Pro</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>+ € 75,-</strong><span>Omzet per opgevulde last-minute no-show</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>+ € 675,- / jr</strong><span>Netto extra jaarwinst (bij slechts 1 klant extra/mnd)</span></div></div></div><section class="tip-box" id="claim-form"><div class="tip-box-head"><span class="eyebrow" style="color:var(--green)">Direct Aanmelden of Claimen</span><h2>🏢 Claim jouw bedrijfsprofiel</h2><p>Vul onderstaand formulier in. Binnen 24 uur controleren en activeren we je account.</p></div><form id="b2b-claim-form" class="form-grid"><label>Bedrijfsnaam<input name="companyName" required placeholder="Bijv. Hondentrimsalon De Gouden Poot"></label><label>Plaats / Gemeente<input name="city" required placeholder="Bijv. Maastricht"></label><label>Gewenst pakket<select name="plan"><option value="free" selected>Gratis Basis Vermelding (€ 0,- voor altijd)</option><option value="partner">TrimGids Partner Pro (€ 19,- / mnd - Meest gekozen)</option><option value="lead-pro">Lead Generator Pro (€ 49,- / mnd)</option></select></label><label>Jouw naam & functie<input name="name" required placeholder="Bijv. Sarah (Eigenaresse / Trimmer)"></label><label>E-mailadres<input name="email" type="email" required placeholder="info@jouwbedrijf.nl"></label><label>Telefoonnummer / WhatsApp<input name="phone" type="tel" required placeholder="06-12345678"></label><label class="full">Website of social media link<input name="website" placeholder="https://www.jouwbedrijf.nl"></label><label class="full">Toelichting of opmerkingen<textarea name="notes" placeholder="Vertel kort over je specialisaties (bijv. Pomeranian, Labradoodle, angstbegeleiding, handplukken)..."></textarea></label><button class="btn-submit full" type="submit">Bedrijfsprofiel Gratis Aanmelden / Claimen →</button><p id="claim-res" class="status-msg full"></p></form></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids B2B Zakelijk Platform — Samen versterken we de Nederlandse hondenbranche.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const cForm=document.getElementById('b2b-claim-form');const cRes=document.getElementById('claim-res');cForm.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(cForm);try{const res=await fetch('/api/providers/'+encodeURIComponent(data.get('companyName'))+'/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),phone:data.get('phone'),plan:data.get('plan'),notes:data.get('notes')})});if(res.ok){cRes.textContent='Bedankt voor je aanmelding! We nemen binnen 24 uur contact met je op om je profiel te verifiëren.';cRes.className='status-msg success full';cForm.reset();}else{throw new Error();}}catch(err){cRes.textContent='Aanmelden mislukt. Controleer je velden en probeer het opnieuw.';cRes.className='status-msg error full';}});</script></body></html>`;
}

/* Standalone Curated Dog Gear & Grooming Store (High-Ticket Affiliate) */
function productsPage() {
  const productItems = loadJsonLocal(productsFile) || [];
  const prodSchema = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'ItemList', name: 'Aanbevolen hondenbenodigdheden 2026', itemListElement: productItems.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: 'https://trimgids.nl/producten#produkt-' + p.id })) },
    ...productItems.map(p => ({ '@type': 'Product', name: p.title, description: (p.description || '').slice(0, 400), aggregateRating: p.rating ? { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount || 0 } : undefined, offers: { '@type': 'Offer', priceCurrency: 'EUR', price: p.price, priceValidUntil: '2026-12-31', availability: 'https://schema.org/InStock', url: p.affiliateUrl }, url: 'https://trimgids.nl/producten#produkt-' + p.id }))
  ] });
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Beste Vachtverzorging & Hondenbenodigdheden 2026 | TrimGids</title><meta name="description" content="Professionele vachtverzorgingstools aanbevolen door trimmers: ActiVet slickerborstels, professionele waterblazers, Tractive GPS, Ruffwear tuigjes en orthopedische manden."><link rel="canonical" href="https://trimgids.nl/producten"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">${prodSchema}</script><style>${directoryStyles()}${customModuleStyles()}.prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:24px;margin:32px 0}.prod-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.prod-card.featured{border-color:var(--green);box-shadow:0 0 0 3px var(--green-light)}.btn-buy{background:var(--green);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-align:center;text-decoration:none;font-size:14px;display:block}.btn-buy:hover{background:var(--green-dark)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/producten" style="color:var(--green);font-weight:700">Winkel</a><a href="/offerte">Offertes</a><a href="/last-minute">Last-Minute</a><a href="/verzekering">Verzekering</a><a href="/voeding">Voeding</a><a href="/bedrijven">Voor Bedrijven</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Aanbevolen Hondenbenodigdheden</p><span class="eyebrow">Getest & Goedgekeurd door Trimmers</span><h1>Beste Vachtverzorging & Hondenbenodigdheden 2026</h1><p class="intro">Bespaar uren borsteltijd en voorkom pijnlijke klitten. Wij selecteerden de meest betrouwbare en duurzame gereedschappen die professionele trimsalons dagelijks gebruiken.</p><div class="filter-bar"><button class="f-btn active" data-cat="">Alle Producten</button><button class="f-btn" data-cat="vachtverzorging">✂️ Borstels & Waterblazers</button><button class="f-btn" data-cat="veiligheid">🛡️ GPS & Veiligheidstuigen</button><button class="f-btn" data-cat="verzorging">🧴 Shampoos & Nagelslijpers</button><button class="f-btn" data-cat="comfort">🛏️ Orthopedische Bedden</button></div><noscript><div class="shop-empty" style="margin-bottom:14px">💡 Schakel JavaScript in om te filteren; alle producten zijn hieronder al zichtbaar.</div></noscript>
<div class="prod-grid" id="prod-container">
${productItems.map((p, idx) => `<article class="prod-card${idx === 0 ? ' featured' : ''}" id="produkt-${p.id}">${p.badge ? '<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">' + p.badge + '</span>' : ''}<h2 style="font-size:20px;margin:0">${p.title}</h2><div style="font-size:13px;color:var(--muted)">⭐ ${p.rating} (${p.reviewCount} reviews)</div><p style="font-size:14px;color:var(--muted);margin:0">${p.description}</p><ul class="tg-list">${(p.pros || []).map(pr => '<li>' + pr + '</li>').join('')}</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><strong style="font:700 24px Fraunces,serif;color:var(--green)">€ ${p.price.toFixed(2)}</strong></div><a class="btn-buy" href="${p.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bekijk & bestel direct ↗</a></article>`).join('')}
</div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids selecteert onafhankelijk de beste hondenartikelen via gecertificeerde partners.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeProdCat='';const pBox=document.getElementById('prod-container');let allProds=[];const loadProds=async()=>{try{const res=await fetch('/api/products');const data=await res.json();allProds=data.products||[];if(!pBox.children.length) renderAll();}catch(e){}};const renderAll=()=>{pBox.replaceChildren();const list=allProds.filter(p=>!activeProdCat||p.category===activeProdCat);list.forEach((p,idx)=>{const card=document.createElement('article');card.className='prod-card'+(idx===0?' featured':'');card.innerHTML=(p.badge?'<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+p.badge+'</span>':'')+'<h2 style="font-size:20px;margin:0">'+p.title+'</h2><div style="font-size:13px;color:var(--muted)">⭐ '+p.rating+' ('+p.reviewCount+' reviews)</div><p style="font-size:14px;color:var(--muted);margin:0">'+p.description+'</p><ul class="tg-list">'+(p.pros||[]).map(pr=>'<li>'+pr+'</li>').join('')+'</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><strong style="font:700 24px Fraunces,serif;color:var(--green)">€ '+p.price.toFixed(2)+'</strong></div><a class="btn-buy" href="'+p.affiliateUrl+'" target="_blank" rel="sponsored noopener noreferrer">Bekijk & bestel direct ↗</a>';pBox.appendChild(card);});};document.querySelectorAll('.f-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeProdCat=b.dataset.cat;renderAll();}));loadProds();</script></body></html>`;
}

/* Standalone Chocolade & Gif Calculator (High-Urgency Tool) */
function toxicityCalculatorPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Chocolade & Gif Calculator voor Honden | TrimGids</title><meta name="description" content="Heeft je hond chocolade of iets giftigs gegeten? Bereken direct het risico en de theobromine-dosis per kg lichaamsgewicht. Inclusief direct contact met 24/7 spoedklinieken."><link rel="canonical" href="https://trimgids.nl/giftigheid-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom is chocolade giftig voor honden?","acceptedAnswer":{"@type":"Answer","text":"Chocolade bevat theobromine en cafeïne. Honden breken theobromine veel langzamer af dan mensen, waardoor het zich ophoopt in het lichaam en kan leiden tot hartritmestoornissen, toevallen en orgaanfalen."}},{"@type":"Question","name":"Vanaf welke hoeveelheid is chocolade gevaarlijk voor een hond?","acceptedAnswer":{"@type":"Answer","text":"Vanaf 20 mg theobromine per kg lichaamsgewicht kunnen milde symptomen optreden. Boven de 40-60 mg/kg is er sprake van ernstige vergiftiging en is directe spoedbehandeling noodzakelijk."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.tox-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}.gauge-card{background:#fff;border-radius:20px;padding:26px;border:2px solid var(--line);text-align:center;display:grid;gap:10px}.danger-level{font:700 28px Fraunces,serif;padding:8px 18px;border-radius:999px;display:inline-block;margin:auto}.level-safe{background:#dcfce7;color:#166534;border:2px solid #86efac}.level-mild{background:#fef3c7;color:#92400e;border:2px solid #fcd34d}.level-danger{background:#ffedd5;color:#c2410c;border:2px solid #fdba74}.level-critical{background:#fee2e2;color:#991b1b;border:2px solid #fca5a5}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/giftigheid-calculator" style="color:#b91c1c;font-weight:700">🚨 Gif-Calculator</a><a href="/spoed-dierenarts">Spoeddierenartsen</a><a href="/verzekering">Verzekering</a><a href="/offerte">Offertes</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Chocolade & Gif Spoedcalculator</p><span class="eyebrow" style="color:#b91c1c">Spoed Diagnostiek & EHBO</span><h1>Chocolade & Gif Calculator voor Honden</h1><p class="intro">Heeft je hond chocolade binnengekregen? Bereken direct de theobromine-inname per kilogram lichaamsgewicht en zie direct of je met spoed naar de dierenarts moet.</p><div class="tox-box"><div class="form-grid"><label>Gewicht van je hond (kg)<input type="number" id="tox-weight" value="10" min="1" max="100" step="0.5"></label><label>Soort chocolade<select id="tox-type"><option value="0.1">Witte chocolade (vrijwel geen theobromine)</option><option value="2.0" selected>Melkchocolade (ca. 2 mg/g)</option><option value="5.5">Pure chocolade 50% (ca. 5.5 mg/g)</option><option value="8.5">Extra pure chocolade 72% (ca. 8.5 mg/g)</option><option value="14.0">Pure chocolade 85%+ (ca. 14 mg/g)</option><option value="16.0">Bakchocolade (zeer geconcentreerd, 16 mg/g)</option><option value="26.0">Cacaopoeder puur (extreem gevaarlijk, 26 mg/g)</option></select></label><label class="full">Opgegeten hoeveelheid (in gram)<input type="number" id="tox-grams" value="50" min="1" max="2000"></label></div><div class="gauge-card" style="margin-top:24px"><span style="font-size:13px;color:var(--muted)">Berekende theobromine dosis:</span><div id="dose-val" style="font:700 36px Fraunces,serif;color:var(--ink)">10.0 mg / kg</div><div id="danger-badge" class="danger-level level-safe">✅ Laag Risico / Geen Symptomen Verwacht</div><p id="danger-advice" style="font-size:14px;color:var(--muted);max-width:650px;margin:10px auto 0">De berekende dosis ligt onder de 20 mg/kg. Er worden geen ernstige vergiftigingsverschijnselen verwacht. Houd je hond in de gaten voor eventuele lichte maagklachten.</p><div style="margin-top:14px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap"><a href="/spoed-dierenarts" class="btn-submit" style="background:#b91c1c;text-decoration:none">🚨 Vind Direct 24/7 Spoeddierenarts →</a><a href="tel:09000245" class="btn-submit" style="background:#1f2937;text-decoration:none">📞 Bel Landelijke Dierenambulance (0900-0245)</a></div></div></div><section class="guide-box" style="background:#fef2f2;border-color:#fecaca"><span class="eyebrow" style="color:#b91c1c">Let ook op met:</span><h2>⚠️ Andere giftige stoffen voor honden</h2><div class="steps-grid"><div class="step-card"><h3>🍇 Druiven & Rozijnen</h3><p>Zelfs een klein handje druiven kan acuut nierfalen veroorzaken bij honden. Geef nooit krentenbollen of muesli met rozijnen.</p></div><div class="step-card"><h3>🍬 Xylitol (Berkensuiker)</h3><p>Zit in suikervrije kauwgom, pindakaas en snoepgoed. Veroorzaakt een levensgevaarlijke insulinepiek en acute hypoglykemie binnen 30 minuten.</p></div><div class="step-card"><h3>🧅 Uien, Knoflook & Prei</h3><p>Bevatten stoffen die de rode bloedcellen van honden afbreken (hemolytische anemie). Vermijd etensrestjes met ui of knoflookpoeder.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Deze calculator is indicatief. Neem bij twijfel of vergiftigingssymptomen altijd direct contact op met een dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const tWeight=document.getElementById('tox-weight');const tType=document.getElementById('tox-type');const tGrams=document.getElementById('tox-grams');const doseVal=document.getElementById('dose-val');const dangerBadge=document.getElementById('danger-badge');const dangerAdvice=document.getElementById('danger-advice');const updateTox=()=>{const w=parseFloat(tWeight.value)||10;const mgPerGram=parseFloat(tType.value)||2.0;const g=parseFloat(tGrams.value)||50;const totalMg=g*mgPerGram;const dose=totalMg/w;doseVal.textContent=dose.toFixed(1)+' mg / kg';if(dose<20){dangerBadge.className='danger-level level-safe';dangerBadge.textContent='✅ Minimaal Risico (Onder de 20 mg/kg)';dangerAdvice.textContent='De berekende dosis is laag. Meestal treden er geen ernstige klachten op. Zorg voor voldoende drinkwater.';}else if(dose<40){dangerBadge.className='danger-level level-mild';dangerBadge.textContent='⚠️ Matig Risico (20 - 40 mg/kg)';dangerAdvice.textContent='Kans op braken, diarree, onrust en dorst. Bel je eigen dierenarts of spoedkliniek voor telefonisch advies.';}else if(dose<60){dangerBadge.className='danger-level level-danger';dangerBadge.textContent='🚨 Ernstig Risico (40 - 60 mg/kg)';dangerAdvice.textContent='Verhoogde hartslag, spiertrillingen en benauwdheid mogelijk. Ga direct naar de dierenarts om de hond te laten braken!';}else{dangerBadge.className='danger-level level-critical';dangerBadge.textContent='☠️ ACUUT LEVENSBEDREIGEND (> 60 mg/kg)';dangerAdvice.textContent='Kans op ernstige hartritmestoornissen, epileptische toevallen en coma. Ga ONMIDDELLIJK naar de dichtstbijzijnde 24/7 spoedkliniek!';}};tWeight.addEventListener('input',updateTox);tType.addEventListener('change',updateTox);tGrams.addEventListener('input',updateTox);updateTox();</script></body></html>`;
}


/* Standalone Puppy Keuzehulp & Ras Matcher Quiz (High-Intent Lead Magnet) */
function puppyMatchPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Welk Hondenras Past Bij Mij? 2026 Puppy Matcher Quiz | TrimGids</title><meta name="description" content="Doe de interactieve puppy keuzehulp quiz. Ontdek binnen 1 minuut welk hondenras perfect past bij jouw woonsituatie, gezin, wandeltijd en vachtwensen."><link rel="canonical" href="https://trimgids.nl/puppy-kiezen"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hoe kies ik het juiste hondenras?","acceptedAnswer":{"@type":"Answer","text":"Kijk naar je beschikbare wandeltijd per dag, woonruimte (appartement vs tuin), gezinssamenstelling, bereidheid voor dagelijkse vachtverzorging en ervaring met hondentraining."}},{"@type":"Question","name":"Welke hondenrassen verharen niet of nauwelijks?","acceptedAnswer":{"@type":"Answer","text":"Labradoodles, Poedels, Bichon Frisés, Maltezers en Schnauzers hebben een niet-verharende of enkelvoudige vacht die wel regelmatig gekamd en getrimd moet worden."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.quiz-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}.quiz-res-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;display:grid;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.match-badge{position:absolute;top:-12px;right:20px;background:var(--green);color:#fff;font-size:12px;font-weight:800;padding:5px 14px;border-radius:999px}.quiz-grid-res{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:24px;margin-top:28px}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/puppy-kiezen" style="color:var(--green);font-weight:700">🐶 Puppy Matcher</a><a href="/hondenschool">Hondenscholen</a><a href="/kaart">Kaart</a><a href="/verzekering">Verzekering</a><a href="/offerte">Offertes</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Puppy Keuzehulp Quiz</p><span class="eyebrow">Interactieve Ras Matcher 2026</span><h1>Welk hondenras past perfect bij jou?</h1><p class="intro">Een pup kiezen is een beslissing voor 12 tot 15 jaar. Beantwoord onderstaande 5 korte vragen over je woonsituatie en leefstijl, en onze slimme algoritme berekent direct jouw top 3 best passende hondenrassen.</p><div class="quiz-box"><div class="form-grid"><label>1. Woonsituatie<select id="q-home"><option value="apt">Appartement / Bovenwoning (Geen eigen tuin)</option><option value="row" selected>Rijtjeshuis / Tussenwoning met tuin</option><option value="large">Vrijstaand huis / Boerderij met grote tuin</option></select></label><label>2. Beschikbare wandeltijd per dag<select id="q-walk"><option value="low">Kort (&lt; 45 minuten per dag)</option><option value="med" selected>Gemiddeld (1 tot 2 uur per dag)</option><option value="high">Veel / Sportief (&gt; 2 uur + actieve sport/rennen)</option></select></label><label>3. Gezinssamenstelling<select id="q-fam"><option value="alone">Alleenstaand / Koppel zonder kinderen</option><option value="kids" selected>Gezin met jonge kinderen / peuters</option><option value="senior">Senioren / Rustig huishouden</option></select></label><label>4. Vachtverzorging & Allergieën<select id="q-coat"><option value="hypo">Hypoallergeen gewenst (Geen losse haren, bijv. Doodle/Poedel)</option><option value="brush">Veel borstelen geen probleem (Lange/volle vacht, bijv. Pomeriaan)</option><option value="easy" selected>Makkelijk & kort (Weinig onderhoud)</option></select></label><label class="full">5. Ervaring met honden<select id="q-exp"><option value="beginner" selected>Eerste hond / Beginner (Wil een vergevingsgezinde en trainbare hond)</option><option value="experienced">Enige ervaring (Klaar voor een actieve hond)</option><option value="expert">Veel ervaring met werkhonden / sterke karakters</option></select></label></div><div class="quiz-grid-res" id="quiz-results"></div></div><section class="guide-box"><h2>3 Belangrijke tips vóór aanschaf van een puppy</h2><div class="steps-grid"><div class="step-card"><h3>1. Kies een erkende fokker</h3><p>Koop nooit een pup via anonieme advertenties of kofferbakhandel. Controleer altijd of de moederhond aanwezig is en of de officiële gezondheidsuitslagen (zoals HD/ED/DNA) ingezien mogen worden.</p></div><div class="step-card"><h3>2. Start direct met socialisatie</h3><p>Tussen week 8 en 14 beleeft een pup de belangrijkste sociale fase. Schrijf je op tijd in voor een <a href="/hondenschool" style="color:var(--green);font-weight:700">erkende hondenschool</a>.</p></div><div class="step-card"><h3>3. Sluit verzekering vroegtijdig af</h3><p>Door al in de puppytijd een <a href="/verzekering" style="color:var(--green);font-weight:700">hondenverzekering</a> af te sluiten, worden erfelijke klachten niet uitgesloten als 'vooraf bestaande aandoening'.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>De TrimGids Ras Matcher is een onafhankelijk adviesinstrument gebaseerd op officiële rasstandaarden.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const qHome=document.getElementById('q-home');const qWalk=document.getElementById('q-walk');const qFam=document.getElementById('q-fam');const qCoat=document.getElementById('q-coat');const qExp=document.getElementById('q-exp');const qRes=document.getElementById('quiz-results');const breedsData=[{name:'Labradoodle',slug:'labradoodle',match:98,coat:'Hypoallergeen / fleece',char:'Zachtaardig, vrolijk, kindvriendelijk en leergierig',walk:'1.5 uur/dag',desc:'Ideaal voor gezinnen en mensen met allergieën. Heeft regelmatige vachtverzorging nodig.'},{name:'Golden Retriever',slug:'golden-retriever',match:94,coat:'Dubbele vacht (verharend)',char:'Zeer loyaal, betrouwbaar en dol op zwemmen',walk:'2 uur/dag',desc:'De ultieme familiehond. Vriendelijk naar iedereen, heeft dagelijks beweging nodig.'},{name:'Pomeriaan (Dwergkeeshond)',slug:'pomeriaan',match:91,coat:'Lange dubbele vacht',char:'Levendig, aanhankelijk, alert en speels',walk:'45-60 min/dag',desc:'Past uitstekend op een appartement, maar vraagt regelmatige ontwol- en borstelbeurten.'},{name:'Franse Bulldog',slug:'franse-bulldog',match:88,coat:'Kortharig (onderhoudsarm)',char:'Gezellig, speels, rustig in huis',walk:'30-45 min/dag',desc:'Compact formaat, ideaal voor rustigere wandelaars. Let op goede koeling in de zomer.'},{name:'Border Collie',slug:'border-collie',match:85,coat:'Half-langharig',char:'Extreem intelligent, energiek en werkwillig',walk:'2.5+ uur/dag',desc:'Voor zeer sportieve baasjes en liefhebbers van behendigheid / hondensport.'},{name:'Teckel (Dashond)',slug:'teckel',match:89,coat:'Kort-, ruw- of langharig',char:'Karaktervol, moedig, trouw en eigenzinnig',walk:'1 uur/dag',desc:'Grote persoonlijkheid in een compacte hond. Alert en waaks met een jachtinstinct.'}];const updateQuiz=()=>{const home=qHome.value;const walk=qWalk.value;const coat=qCoat.value;const exp=qExp.value;let list=[...breedsData];list.forEach(b=>{let score=85;if(coat==='hypo'&&b.slug==='labradoodle')score+=12;if(coat==='brush'&&b.slug==='pomeriaan')score+=13;if(walk==='high'&&b.slug==='border-collie')score+=14;if(walk==='low'&&(b.slug==='franse-bulldog'||b.slug==='pomeriaan'))score+=10;if(home==='apt'&&(b.slug==='pomeriaan'||b.slug==='franse-bulldog'||b.slug==='teckel'))score+=8;if(exp==='beginner'&&(b.slug==='golden-retriever'||b.slug==='labradoodle'))score+=9;b.calculatedMatch=Math.min(99,score);});list.sort((a,b)=>b.calculatedMatch-a.calculatedMatch);const top3=list.slice(0,3);qRes.replaceChildren();top3.forEach(b=>{const card=document.createElement('article');card.className='quiz-res-card';card.innerHTML='<span class="match-badge">🎯 '+b.calculatedMatch+'% Match</span><h2 style="font-size:22px;margin:0">'+b.name+'</h2><p style="font-size:14px;color:var(--muted);margin:0"><strong>Karakter:</strong> '+b.char+'<br><strong>Vacht:</strong> '+b.coat+' · <strong>Wandeltijd:</strong> '+b.walk+'</p><p style="font-size:14px;line-height:1.5;margin:0">'+b.desc+'</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto"><a href="/trimsalon/'+b.slug+'" class="btn-submit" style="padding:10px 18px;font-size:13px;text-decoration:none">Trimsalons voor '+b.name+' →</a><a href="/hondenschool" class="outline" style="padding:10px 18px;font-size:13px;text-decoration:none">Zoek Hondenschool →</a></div>';qRes.appendChild(card);});};qHome.addEventListener('change',updateQuiz);qWalk.addEventListener('change',updateQuiz);qFam.addEventListener('change',updateQuiz);qCoat.addEventListener('change',updateQuiz);qExp.addEventListener('change',updateQuiz);updateQuiz();</script></body></html>`;
}

/* Standalone Hondenleeftijd naar Mensenjaren Calculator */
function dogAgePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondenleeftijd Berekenen in Mensenjaren 2026 | TrimGids</title><meta name="description" content="Hoe oud is jouw hond echt in mensenjaren? Bereken wetenschappelijk de leeftijd op basis van gewicht en formaat. Inclusief levensfase gezondheidscheck."><link rel="canonical" href="https://trimgids.nl/leeftijd-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Klopt de regel dat 1 hondenjaar gelijk staat aan 7 mensenjaren?","acceptedAnswer":{"@type":"Answer","text":"Nee, dit is een mythe. Honden ontwikkelen zich in het eerste jaar razendsnel (ongeveer gelijk aan 15 mensenjaren). Grote honden verouderen fysiek veel sneller dan kleine hondenrassen."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.age-calc-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}.age-res-card{background:#fff;border-radius:20px;padding:26px;border:1px solid var(--line);display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:20px;text-align:center}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/leeftijd-calculator" style="color:var(--green);font-weight:700">🎂 Hondenleeftijd</a><a href="/puppy-kiezen">Puppy Matcher</a><a href="/verzekering">Verzekering</a><a href="/voeding">Voeding</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenleeftijd Calculator</p><span class="eyebrow">Wetenschappelijke Leeftijdsmonitor</span><h1>Hoe oud is jouw hond in mensenjaren?</h1><p class="intro">De klassieke '1 hondenjaar = 7 mensenjaren' regel klopt niet. Kleine rassen worden vaak 14 tot 17 jaar, terwijl reuzenrassen op 8-jarige leeftijd al senior zijn. Bereken hieronder de biologische leeftijd en bekijk de zorgtips voor zijn levensfase.</p><div class="age-calc-box"><div class="form-grid"><label>Formaat / Gewicht van je hond<select id="age-size"><option value="small">Kleine hond (&lt; 10 kg, bijv. Pomeriaan, Teckel, Chihuahua)</option><option value="medium" selected>Middelgrote hond (10 - 25 kg, bijv. Labradoodle, Spaniël, Border Collie)</option><option value="large">Grote hond (25 - 45 kg, bijv. Golden Retriever, Labrador, Herder)</option><option value="giant">Zeer grote hond (&gt; 45 kg, bijv. Berner Sennen, Deense Dog)</option></select></label><label>Leeftijd van je hond (in kalenderjaren)<input type="number" id="age-years" value="4" min="0.5" max="22" step="0.5"></label></div><div class="age-res-card" style="margin-top:24px"><div><span style="font-size:13px;color:var(--muted)">Kalenderleeftijd</span><div id="cal-age-display" style="font:700 36px Fraunces,serif;color:var(--ink)">4.0 jaar</div></div><div><span style="font-size:13px;color:var(--muted)">Biologische leeftijd in mensenjaren</span><div id="human-age-res" style="font:700 44px Fraunces,serif;color:var(--green)">32 mensenjaren</div></div><div><span style="font-size:13px;color:var(--muted)">Levensfase</span><div id="phase-res" style="font:700 24px Fraunces,serif;color:var(--amber)">Volwassen hond</div></div></div><div id="phase-advice" style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;margin-top:20px;font-size:14px;line-height:1.6;color:var(--ink-2)"></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Wetenschappelijke berekening conform de nieuwste epigenetische veterinaire onderzoeken.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const aSize=document.getElementById('age-size');const aYears=document.getElementById('age-years');const humanRes=document.getElementById('human-age-res');const calDisp=document.getElementById('cal-age-display');const phaseRes=document.getElementById('phase-res');const phaseAdv=document.getElementById('phase-advice');const calculateDogAge=()=>{const sz=aSize.value;const y=parseFloat(aYears.value)||1;calDisp.textContent=y.toFixed(1)+' jaar';let humanAge=0;if(y<=1)humanAge=y*15;else if(y<=2)humanAge=15+((y-1)*9);else{const extra=y-2;const multiplier=sz==='small'?4:(sz==='medium'?5:(sz==='large'?6:8));humanAge=24+(extra*multiplier);}humanRes.textContent=Math.round(humanAge)+' mensenjaren';if(y<1){phaseRes.textContent='🐶 Puppy & Groei';phaseAdv.innerHTML='<strong>Zorgadvies voor de puppyfase:</strong> Focus op vroege socialisatie bij de hondenschool, regelmatige vachtgewenning bij de trimsalon en een uitgebalanceerd puppy-dieet voor een gelijkmatige botgroei.';}else if(y<3){phaseRes.textContent='🐕 Jongvolwassen & Puberteit';phaseAdv.innerHTML='<strong>Zorgadvies voor de jonge hond:</strong> De vachtwissel vindt plaats tussen 6 en 14 maanden (extra borstelen!). Zorg voor voldoende fysieke en mentale uitdaging.';}else if(humanAge<55){phaseRes.textContent='🐾 Volwassen Bloeifase';phaseAdv.innerHTML='<strong>Zorgadvies voor volwassen honden:</strong> Ideale conditie behouden met kwaliteitsvoeding, jaarlijkse gebitscontrole en periodiek professioneel ontwollen of knippen.';}else{phaseRes.textContent='🦮 Senior & Wijsheid';phaseAdv.innerHTML='<strong>Zorgadvies voor senioren:</strong> Preventieve seniorenchecks bij de dierenarts (nieren/hart), overweeg dierfysiotherapie of hydrotherapie voor soepele gewrichten, en kies een orthopedisch traagschuim bed.';}};aSize.addEventListener('change',calculateDogAge);aYears.addEventListener('input',calculateDogAge);calculateDogAge();</script></body></html>`;
}

/* Standalone Puppy Gewicht & Groeivoorspeller Calculator */
function puppyWeightPredictorPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Puppy Gewicht & Volwassen Gewicht Voorspeller | TrimGids</title><meta name="description" content="Bereken het verwachte volwassen gewicht van jouw pup op basis van leeftijd en huidig gewicht. Inclusief groeicurves en voedingsadvies."><link rel="canonical" href="https://trimgids.nl/gewicht-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.growth-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/gewicht-calculator" style="color:var(--green);font-weight:700">⚖️ Gewicht Voorspeller</a><a href="/voeding">Voeding</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Puppy Gewicht Voorspeller</p><span class="eyebrow">Groei- & Gewichtscalculator</span><h1>Hoe zwaar wordt jouw puppy als hij volwassen is?</h1><p class="intro">Benieuwd naar het uiteindelijke volwassen gewicht van je pup? Vul de huidige leeftijd in weken en het actuele gewicht in om de groeicurve en het eindgewicht te berekenen.</p><div class="growth-box"><div class="form-grid"><label>Huidige leeftijd in weken<input type="number" id="p-weeks" value="16" min="6" max="52"></label><label>Huidig gewicht van de pup (in kg)<input type="number" id="p-weight" value="6.5" min="0.3" max="50" step="0.1"></label><label class="full">Verwachte categorie<select id="p-cat"><option value="small">Klein ras (eindgewicht &lt; 10 kg, volgroeid rond 10 maanden)</option><option value="medium" selected>Middelgroot ras (eindgewicht 10 - 25 kg, volgroeid rond 12 maanden)</option><option value="large">Groot ras (eindgewicht 25 - 45 kg, volgroeid rond 16-18 maanden)</option><option value="giant">Reuzenras (eindgewicht &gt; 45 kg, volgroeid rond 24 maanden)</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="p-adult-res">18.5</span> kg</strong><span>Geschat volwassen eindgewicht</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong><span id="p-pct-res">35</span>%</strong><span>Van volwassen gewicht bereikt</span></div><div class="stat-card" style="border-left-color:#3730a3"><strong><span id="p-months-res">12</span> mnd</strong><span>Verwacht volgroeid op leeftijd</span></div></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Groeipercentages zijn indicatief. Raadpleeg je dierenarts voor een gerichte gewichtsbewaking.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const pW=document.getElementById('p-weeks');const pKg=document.getElementById('p-weight');const pCat=document.getElementById('p-cat');const resKg=document.getElementById('p-adult-res');const resPct=document.getElementById('p-pct-res');const resM=document.getElementById('p-months-res');const updateGrowth=()=>{const w=parseFloat(pW.value)||16;const kg=parseFloat(pKg.value)||5;const cat=pCat.value;let adult=0;let months=12;if(cat==='small'){months=10;adult=(kg/w)*52*0.75;}else if(cat==='medium'){months=12;adult=(kg/w)*52*0.88;}else if(cat==='large'){months=16;adult=(kg/w)*52*1.05;}else{months=24;adult=(kg/w)*52*1.25;}adult=Math.max(kg,adult);const pct=Math.min(100,Math.round((kg/adult)*100));resKg.textContent=adult.toFixed(1);resPct.textContent=pct;resM.textContent=months;};pW.addEventListener('input',updateGrowth);pKg.addEventListener('input',updateGrowth);pCat.addEventListener('change',updateGrowth);updateGrowth();</script></body></html>`;
}

/* Standalone Hond Mee op Vakantie Reisgids per Land */
function travelGuidePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hond mee op Vakantie 2026: Regels per Land & Checklist | TrimGids</title><meta name="description" content="Reizen met je hond in Europa: officiële invoereisen voor Duitsland, België, Frankrijk, Oostenrijk, Italië en Spanje. Inclusief rabiësregels, muilkorfplicht en inpakchecklist."><link rel="canonical" href="https://trimgids.nl/hond-mee-op-vakantie"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.country-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;display:grid;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hond-mee-op-vakantie" style="color:var(--green);font-weight:700">✈️ Vakantiegids</a><a href="/wandelen">Wandelen & Stranden</a><a href="/verzekering">Verzekering</a><a href="/producten">Reisartikelen</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hond mee op Vakantie</p><span class="eyebrow">Europese Reiswijzer 2026</span><h1>Hond mee op vakantie: Regels per Land & Checklist</h1><p class="intro">Ga je met je hond naar het buitenland? Elk Europees land hanteert eigen invoereisen voor rabiësvaccinaties, muilkorven, wormenkuren en verboden rassen. Kies hieronder je bestemming voor een zorgeloze vakantie.</p><div class="filter-bar"><button class="f-btn active" data-land="de">🇩🇪 Duitsland</button><button class="f-btn" data-land="be">🇧🇪 België</button><button class="f-btn" data-land="fr">🇫🇷 Frankrijk</button><button class="f-btn" data-land="at">🇦🇹 Oostenrijk</button><button class="f-btn" data-land="it">🇮🇹 Italië / 🇪🇸 Spanje</button></div><div id="country-info" class="country-card"></div><section class="guide-box"><h2>🎒 Ultieme Inpakchecklist voor de Hond</h2><div class="steps-grid"><div class="step-card"><h3>1. Europees Dierenpaspoort</h3><p>Inclusief geldige rabiësvaccinatie (minstens 21 dagen voor vertrek gezet) en geregistreerd chipnummer.</p></div><div class="step-card"><h3>2. Veiligheid in de auto</h3><p>In Duitsland en Frankrijk is het verplicht je hond vast te zetten met een gecertificeerd autotuig of in een transportbench.</p></div><div class="step-card"><h3>3. Reisapotheek & Tekentang</h3><p>Koelmat bij warm weer, tekentang, eigen voer, opvouwbare drinkbak en voldoende medicatie.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Controleer altijd de meest actuele richtlijnen bij de NVWA en de ambassade van het bestemmingsland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const cBox=document.getElementById('country-info');const cData={de:{title:'🇩🇪 Duitsland Regels & Tips',items:['Europees paspoort & chip verplicht','Rabiësvaccinatie minstens 21 dagen oud','In de auto: hond moet gezekerd zijn (gordel of bench, risico op boete)','Aanlijnplicht in natuurgebieden en bossen','In openbaar vervoer (DB treinen): muilkorfplicht voor niet-kleine honden']},be:{title:'🇧🇪 België Regels & Tips',items:['Europees paspoort, chip en rabiësvaccinatie verplicht','Hondenstranden: aan de Belgische kust gelden in het hoogseizoen strikte uren voor loslopen','Bossen in de Ardennen: strikte aanlijnplicht i.v.m. wildbestand']},fr:{title:'🇫🇷 Frankrijk Regels & Tips',items:['Europees paspoort & rabiës verplicht','Let op: Categorie 1 waakhonden (o.a. Pitbulls zonder stamboom) zijn verboden in te voeren','Categorie 2 honden (Rottweiler etc.): speciale invoereisen en muilkorfplicht in het openbaar']},at:{title:'🇦🇹 Oostenrijk Regels & Tips',items:['Paspoort, chip en geldige rabiësenting verplicht','Muilkorf- en aanlijnplicht in gondelliften, bergbanen en openbaar vervoer','Pas op met koeien op bergweides: houd je hond aangelijnd']},it:{title:'🇮🇹 Italië & 🇪🇸 Spanje Regels & Tips',items:['Paspoort, chip en rabiës verplicht','Zuid-Europa risico: zandvliegjes (Leishmania) en hartworm. Gebruik Scalibor of Advantix bescherming!','In Italië: muilkorf altijd bij je dragen (tonen op verzoek)','Asfalt en zand kunnen in de zomer extreem heet worden: bescherm de voetzooltjes']}};const renderLand=k=>{const d=cData[k]||cData.de;cBox.innerHTML='<h2 style="font-size:24px;margin:0">'+d.title+'</h2><ul class="tg-list tg-list-lg">'+d.items.map(i=>'<li>'+i+'</li>').join('')+'</ul><div style="margin-top:10px"><a href="/producten" class="btn-submit" style="display:inline-block;text-decoration:none;font-size:13px;padding:10px 18px">Bekijk gecertificeerde autotuigen & reisbenches →</a></div>';};document.querySelectorAll('.f-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderLand(b.dataset.land);}));renderLand('de');</script></body></html>`;
}

/* Standalone Teken, Vlooien & Parasieten Radar */
function parasiteRadarPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Teken & Vlooien Radar Nederland 2026: Risico & Preventie | TrimGids</title><meta name="description" content="Bekijk de actuele tekenactiviteit en het risico op de ziekte van Lyme bij honden in Nederland. Vergelijk de beste preventiemiddelen (Seresto, druppels, tekentangen)."><link rel="canonical" href="https://trimgids.nl/teken-en-vlooien"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/teken-en-vlooien" style="color:var(--green);font-weight:700">🕷️ Teken Radar</a><a href="/wandelen">Wandelroutes</a><a href="/producten">Anti-Teken Shop</a><a href="/spoed-dierenarts">Spoeddierenarts</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Teken & Parasieten Radar</p><span class="eyebrow">Seizoensgebonden Parasietenmonitor 2026</span><h1>Teken & Vlooien Radar Nederland</h1><p class="intro">Teken zijn in Nederland actief zodra de buitentemperatuur boven de 7°C komt. Vooral in bossen, duinen en hoog gras (Limburg, Veluwe, Utrechtse Heuvelrug) is het risico op de <strong>Ziekte van Lyme</strong> en <strong>Babesiose</strong> hoog.</p><div class="stats-row"><div class="stat-card" style="border-left-color:#b91c1c"><strong>Hoog Risico</strong><span>Actueel tekenseizoen (Maart - Okt)</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>1 op de 5</strong><span>Teken is besmet met bacteriën</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>Binnen 24u</strong><span>Verwijderen voorkomt besmetting</span></div></div><section class="guide-box"><h2>Hoe verwijder je een teek veilig?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>Niet verdoven met alcohol</h3><p>Gebruik nooit alcohol, olie of zeep op de teek! De teek raakt in paniek en braakt zijn maaginhoud met bacteriën direct in de bloedbaan van de hond.</p></div><div class="step-card"><div class="step-num">2</div><h3>Gebruik een tekentang of O'Tom haak</h3><p>Schuif de tekenhaak onder het lijf van de teek zo dicht mogelijk op de huid en draai rustig zonder te knijpen.</p></div><div class="step-card"><div class="step-num">3</div><h3>Desinfecteer na afloop</h3><p>Ontsmet het wondje pas nadat de teek er in zijn geheel uit is. Noteer de datum in je agenda.</p></div></div></section><section class="next"><span class="eyebrow">Bekijk ook</span><h2>Bescherming & Producten</h2><div class="next-links"><a href="/producten">Bekijk professionele borstels & waterblazers (blaast teken eruit!) →</a><a href="/wandelen">Ontdek veilige losloopgebieden →</a><a href="/verzekering">Hondenverzekering voor dierenartskosten →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Data gebaseerd op veterinaire epidemiologische rapportages Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}


/* Standalone Hondennamen Gids & Inspirator 2026 */
function dogNamesPage() {
  const namesData = loadJsonLocal(dogNamesFile);
  const allNames = (namesData && (Array.isArray(namesData) ? namesData : namesData.names)) || [];
  const nameCard = (n) => {
    const gCls = n.gender === 'teef' ? 'gender-teef' : (n.gender === 'reu' ? 'gender-reu' : 'gender-unisex');
    const gLbl = n.gender === 'teef' ? 'Teef' : (n.gender === 'reu' ? 'Reu' : 'Unisex');
    return '<article class="name-card"><span class="name-gender-badge ' + gCls + '">' + gLbl + '</span><h3>' + escapeHtml(n.name) + '</h3><p style="font-size:13px;color:var(--muted);margin:0"><strong>Betekenis:</strong> ' + escapeHtml(n.meaning) + '<br><strong>Herkomst:</strong> ' + escapeHtml(n.origin) + ' · <strong>Stijl:</strong> ' + escapeHtml(n.style) + '</p><div style="margin-top:auto;border-top:1px solid var(--line);padding-top:10px;font-size:12px;color:var(--green);font-weight:700">Nr. ' + n.rank + ' in Nederland</div></article>';
  };
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Populaire & Mooie Hondennamen 2026: Betekenis & Inspiratie | TrimGids</title><meta name="description" content="Zoek je de perfecte naam voor je puppy? Bekijk de top 100 populairste, stoerste, schattigste en unieke hondennamen van 2026 voor reutjes en teefjes met betekenis."><link rel="canonical" href="https://trimgids.nl/hondennamen"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat zijn de populairste hondennamen in 2026?","acceptedAnswer":{"@type":"Answer","text":"Luna, Bella, Pip en Lola zijn favoriet bij teefjes; Max, Milo, Guus, Diesel en Charlie zijn koploper bij reutjes."}},{"@type":"Question","name":"Hoeveel lettergrepen mag een hondennaam hebben?","acceptedAnswer":{"@type":"Answer","text":"Kynologen en hondenscholen adviseren een naam van maximaal 1 tot 2 lettergrepen met een duidelijke beginklank, omdat honden hier het snelst en meest alert op reageren."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.names-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin:30px 0}.name-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;display:flex;flex-direction:column;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.03);position:relative}.name-gender-badge{position:absolute;top:18px;right:18px;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px}.gender-teef{background:#fce7f3;color:#9d174d}.gender-reu{background:#e0e7ff;color:#3730a3}.gender-unisex{background:#dcfce7;color:#166534}.name-card h3{font:700 24px Fraunces,serif;margin:0;color:var(--ink)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hondennamen" style="color:var(--green);font-weight:700">🐶 Hondennamen 2026</a><a href="/puppy-kiezen">Puppy Matcher</a><a href="/kaart">Kaart</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondennamen Inspirator 2026</p><span class="eyebrow">Namen Database 2026 · Meer dan 150+ Namen</span><h1>De Mooiste Hondennamen van 2026</h1><p class="intro">Krijg je binnenkort een puppy of zoek je inspiratie voor een herplaatser? Filter hieronder op geslacht, stijl en herkomst en vind de naam die perfect bij jouw viervoeter past.</p><div class="filter-bar"><button class="f-btn active" data-gender="">Alle Geslachten</button><button class="f-btn" data-gender="reu">Reutjes</button><button class="f-btn" data-gender="teef">Teefjes</button><button class="f-btn" data-gender="unisex">Unisex</button></div><div class="tax-controls" style="display:flex;gap:12px;flex-wrap:wrap"><input type="search" id="name-search" placeholder="Zoek op naam, stijl of betekenis (bijv. Luna, stoer, Italiaans, Guus...)" style="flex:1;min-width:280px;padding:12px 18px;border:1px solid var(--line);border-radius:14px;font:inherit"><button id="btn-random-name" class="btn" style="background:var(--cream);border:1px solid var(--line);padding:12px 20px;border-radius:14px;font-weight:700;cursor:pointer">Verras me!</button></div><div class="names-grid" id="names-container">${allNames.map(nameCard).join('')}</div><section class="guide-box"><h2>Gouden regels van hondentrainers bij het kiezen van een naam</h2><div class="steps-grid"><div class="step-card"><h3>1. Maximaal 2 lettergrepen</h3><p>Namen als 'Max', 'Pip' of 'Milo' klinken kort en krachtig. Lange namen worden in de praktijk toch afgekort en werken verwarrend tijdens puppytraining.</p></div><div class="step-card"><h3>2. Vermijd commando-klanken</h3><p>Kies geen naam die lijkt op basiscommando's (bijv. 'Bo' lijkt op 'Nee/Foei', 'Mick' lijkt op 'Zit'). Dit voorkomt miscommunicatie op de hondenschool.</p></div><div class="step-card"><h3>3. Laat direct een penning graveren</h3><p>Heb je de naam gekozen? Laat direct een penning met naam en je mobiele nummer aan het tuigje bevestigen.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Hondennamen Inspirator 2026.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeGender='';const nBox=document.getElementById('names-container');let allNames=${JSON.stringify(allNames)};const loadNames=()=>{renderNames();};const renderNames=()=>{nBox.replaceChildren();const q=(document.getElementById('name-search').value||'').toLowerCase().trim();const filtered=allNames.filter(n=>{const matchG=!activeGender||n.gender===activeGender;const matchQ=!q||n.name.toLowerCase().includes(q)||n.style.toLowerCase().includes(q)||n.meaning.toLowerCase().includes(q)||n.origin.toLowerCase().includes(q);return matchG&&matchQ;});if(!filtered.length){nBox.innerHTML='<p class="empty full">Geen namen gevonden voor deze selectie.</p>';return;}filtered.forEach(n=>{const card=document.createElement('article');card.className='name-card';const gCls=n.gender==='teef'?'gender-teef':(n.gender==='reu'?'gender-reu':'gender-unisex');const gLbl=n.gender==='teef'?'Teef':(n.gender==='reu'?'Reu':'Unisex');card.innerHTML='<span class="name-gender-badge '+gCls+'">'+gLbl+'</span><h3>'+n.name+'</h3><p style="font-size:13px;color:var(--muted);margin:0"><strong>Betekenis:</strong> '+n.meaning+'<br><strong>Herkomst:</strong> '+n.origin+' · <strong>Stijl:</strong> '+n.style+'</p><div style="margin-top:auto;border-top:1px solid var(--line);padding-top:10px;font-size:12px;color:var(--green);font-weight:700">Nr. '+n.rank+' in Nederland</div>';nBox.appendChild(card);});};document.querySelectorAll('.f-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.f-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeGender=b.dataset.gender;renderNames();}));document.getElementById('name-search').addEventListener('input',renderNames);document.getElementById('btn-random-name').addEventListener('click',()=>{if(allNames.length){const rand=allNames[Math.floor(Math.random()*allNames.length)];alert('Inspiratie van TrimGids: Wat vind je van "'+rand.name+'" ('+rand.gender+')? Betekenis: '+rand.meaning);}});loadNames();</script></body></html>`;
}

/* Standalone Hondvriendelijke Horeca & Strandtenten Gids */
function dogFriendlyCafesPage() {
  const cafesData = loadJsonLocal(dogCafesFile);
  const allCafes = (cafesData && (Array.isArray(cafesData) ? cafesData : cafesData.cafes)) || [];
  const cafeCard = (c) => {
    const maps = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(c.address) + '&travelmode=driving';
    return `<article class="cafe-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:20px;margin:0">${escapeHtml(c.name)}</h2><span style="font-size:13px;color:var(--muted)">${escapeHtml(c.region)} (${escapeHtml(c.province)})</span></div><span class="label">${escapeHtml(c.category)}</span></div><p style="font-size:14px;color:var(--muted);margin:0">${escapeHtml(c.description)}</p><div style="background:var(--cream);padding:12px;border-radius:12px;border:1px solid var(--line);font-size:13px"><strong style="color:var(--green)">Extra verwennerij:</strong><ul class="tg-list">${(c.dogPerks || []).map(p => '<li>' + escapeHtml(p) + '</li>').join('')}</ul></div><div style="margin-top:auto"><a href="${maps}" target="_blank" rel="noopener noreferrer" class="btn-submit" style="display:block;text-align:center;text-decoration:none;font-size:13px;padding:10px">Navigeer (Google Maps) ↗</a></div></article>`;
  };
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondvriendelijke Horeca & Strandtenten Nederland 2026 | TrimGids</title><meta name="description" content="De leukste hondvriendelijke boscafés, strandpaviljoens en terrassen in Nederland. Waar je hond altijd welkom is met vers water en hondenkoekjes. Direct navigeren."><link rel="canonical" href="https://trimgids.nl/hondvriendelijke-horeca"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.cafe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:24px;margin:30px 0}.cafe-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hondvriendelijke-horeca" style="color:var(--green);font-weight:700">Hondvriendelijke Horeca</a><a href="/wandelen">Wandelen & Stranden</a><a href="/kaart">Kaart</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondvriendelijke Horeca</p><span class="eyebrow">Gastvrijheid voor Baas & Hond</span><h1>Hondvriendelijke Boscafés, Terrassen & Strandtenten</h1><p class="intro">Na een heerlijke wandeling samen neerstrijken voor een warme drank of lunch? Deze horecagelegenheden in Nederland ontvangen viervoeters met open armen, schone waterbakken en verse traktaties.</p><div class="cafe-grid" id="cafes-container">${allCafes.map(cafeCard).join('')}</div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Heb je zelf een hondvriendelijke horecazaak? Meld je gratis aan via TrimGids.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const cCont=document.getElementById('cafes-container');const cafesData=${JSON.stringify(allCafes)};cCont.replaceChildren();cafesData.forEach(c=>{const card=document.createElement('article');card.className='cafe-card';const maps='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(c.address)+'&travelmode=driving';card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:20px;margin:0">'+c.name+'</h2><span style="font-size:13px;color:var(--muted)">'+c.region+' ('+c.province+')</span></div><span class="label">'+c.category+'</span></div><p style="font-size:14px;color:var(--muted);margin:0">'+c.description+'</p><div style="background:var(--cream);padding:12px;border-radius:12px;border:1px solid var(--line);font-size:13px"><strong style="color:var(--green)">Extra verwennerij:</strong><ul class="tg-list">'+c.dogPerks.map(p=>'<li>'+p+'</li>').join('')+'</ul></div><div style="margin-top:auto"><a href="'+maps+'" target="_blank" rel="noopener noreferrer" class="btn-submit" style="display:block;text-align:center;text-decoration:none;font-size:13px;padding:10px">Navigeer (Google Maps) ↗</a></div>';cCont.appendChild(card);});</script></body></html>`;
}

/* Standalone Vacht-Herinnering & Afspraakplanner Tool */
function remindersPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vacht- & Trimbeurt Herinnering Tool | TrimGids</title><meta name="description" content="Vergeet nooit meer op tijd een trimafspraak te maken. Bereken het ideale triminterval voor jouw hondenras en ontvang een gratis herinnering vóórdat de vacht vilt."><link rel="canonical" href="https://trimgids.nl/vacht-herinnering"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.rem-box{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/vacht-herinnering" style="color:var(--green);font-weight:700">⏰ Trim-Herinnering</a><a href="/last-minute">Last-Minute</a><a href="/offerte">Offertes</a><a href="/kaart">Kaart</a><a href="/">Home</a></div></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Vacht- & Trimbeurt Herinnering</p><span class="eyebrow">Preventieve Vachtzorg</span><h1>Nooit meer te laat voor de trimbeurt</h1><p class="intro">Veel populaire hondenrassen (zoals Labradoodles, Pomerianen, Poedels en Spaniëls) hebben een strak schema nodig om pijnlijke klitten en vervilting te voorkomen. Bereken hieronder je volgende ideale trimdatum.</p><div class="rem-box"><form id="rem-form" class="form-grid"><label>Naam van je hond<input name="dogName" required placeholder="Bijv. Luna"></label><label>Hondenras<select name="breed" id="rem-breed"><option value="6">Labradoodle / Goldendoodle (elke 6-8 weken)</option><option value="8">Pomeriaan / Dwergkeeshond (elke 8-10 weken ontwollen)</option><option value="6">Poedel / Waterhond (elke 6 weken)</option><option value="12">Ruwharige Teckel / Terriër (elke 12-16 weken plukken)</option><option value="10">Golden Retriever / Berner (elke 10-12 weken ruibehandeling)</option><option value="8">Maltezer / Shih Tzu / Boomer (elke 8 weken)</option></select></label><label>Datum van de laatste trimbeurt<input type="date" name="lastDate" id="rem-date" required></label><label>Woonplaats<input name="city" placeholder="Bijv. Maastricht"></label><div class="full" style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px"><div><span style="font-size:13px;color:var(--muted)">Aanbevolen volgende afspraakdatum:</span><div id="rem-next-date" style="font:700 28px Fraunces,serif;color:var(--green)">Selecteer datum</div></div><a href="/last-minute" class="btn-submit" style="text-decoration:none;font-size:13px;padding:12px 20px">Bekijk direct beschikbare plekken →</a></div></form></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids helpt baasjes en trimsalons voor een gezonde vacht zonder vilt.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const rBreed=document.getElementById('rem-breed');const rDate=document.getElementById('rem-date');const rNext=document.getElementById('rem-next-date');const today=new Date().toISOString().split('T')[0];rDate.value=today;const updateRemDate=()=>{const weeks=parseInt(rBreed.value)||6;const d=new Date(rDate.value||today);d.setDate(d.getDate()+(weeks*7));const opts={year:'numeric',month:'long',day:'numeric'};rNext.textContent=d.toLocaleDateString('nl-NL',opts);};rBreed.addEventListener('change',updateRemDate);rDate.addEventListener('input',updateRemDate);updateRemDate();</script></body></html>`;
}


/* Standalone EHBO & Eerste Hulp bij Noodsituaties Gids */

/* Community & Wandelmaatje Finder Hub */

/* Vakantie met de Hond & Omheinde Tuin Gids */

/* Hypoallergene Honden & Allergie Gids */
function hypoallergenicPage() {
  const hypoData = loadJsonLocal(join(root, 'data', 'hypoallergenic-breeds.json'));
  const allBreeds = (hypoData && (Array.isArray(hypoData) ? hypoData : hypoData.breeds)) || [];
  const hypoCard = (b) => `<article class="hypo-card"><span class="label" style="position:absolute;top:-12px;right:20px;background:var(--green);color:#fff">${escapeHtml(b.badge)}</span><h2 style="font-size:22px;margin:0">${escapeHtml(b.breed)}</h2><span class="allergy-badge">Geschiktheid: ${escapeHtml(b.allergyScore)}</span><p style="font-size:14px;color:var(--muted);margin:0">${escapeHtml(b.description)}</p><div style="font-size:13px;background:var(--cream);padding:12px;border-radius:12px;line-height:1.4"><strong>Vachttype:</strong> ${escapeHtml(b.coatType)}<br><strong>Verzorging:</strong> ${escapeHtml(b.groomingNeeds)}<br><strong>Karakter:</strong> ${escapeHtml(b.character)}</div><div style="margin-top:auto"><a href="/trimsalon" class="outline" style="display:block;text-align:center;font-size:13px;padding:8px">Zoek gespecialiseerde trimsalon →</a></div></article>`;
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hypoallergene Honden 2026: Beste Rassen bij Hondenallergie | TrimGids</title><meta name="description" content="Ontdek de beste niet-verharende en hypoallergene hondenrassen van 2026 (Poedel, Australian Labradoodle, Maltezer, Waterhond). Inclusief vachttype en verzorgingstips."><link rel="canonical" href="https://trimgids.nl/hypoallergene-honden"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Bestaat er een 100% hypoallergene hond?","acceptedAnswer":{"@type":"Answer","text":"Nee, een 100% allergievrije hond bestaat wetenschappelijk niet. De allergische reactie wordt veroorzaakt door het Can f 1 eiwit in huidschilfers en speeksel. Wel verliezen bepaalde rassen met een enkele haarvacht nauwelijks huidschilfers in huis."}},{"@type":"Question","name":"Waarom zijn Labradoodles en Poedels zo populair bij allergieën?","acceptedAnswer":{"@type":"Answer","text":"Zij hebben een enkellaagse krul- of fleecevacht zonder ruiende ondervacht. Losse haren en schilfers blijven in de krullen hangen en worden er pas tijdens het wassen en borstelen uitgehaald."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.hypo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:32px 0}.hypo-card{background:var(--card-bg);border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.allergy-badge{display:inline-flex;align-items:center;gap:6px;background:var(--green-light);color:var(--green);font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px;width:fit-content}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hypoallergene-honden" style="color:var(--green);font-weight:700">Hypoallergene Rassen</a><a href="/puppy-kiezen">Puppy Matcher</a><a href="/producten">Luchtreinigers</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hypoallergene Hondenrassen Gids</p><span class="eyebrow">Allergievrij Genieten 2026</span><h1>Beste Hypoallergene Hondenrassen</h1><p class="intro">Heb jij of iemand in je gezin last van niesbuien, jeukende ogen of benauwdheid door honden? Bepaalde hondenrassen met een enkele haarvacht verspreiden aanzienlijk minder allergenen. Bekijk hieronder de beste keuzes.</p><div class="hypo-grid" id="hypo-container">${allBreeds.map(hypoCard).join('')}</div><section class="guide-box"><h2>3 Essentiële tips voor een allergievrij huishouden</h2><div class="steps-grid"><div class="step-card"><h3>1. Bezoek een trimsalon elke 6-8 weken</h3><p>Een professionele was- en blaassessie met een waterblazer verwijdert opgehoopte huidschilfers en dode haren grondig. <a href="/trimsalon" style="color:var(--green);font-weight:700">Vind Trimsalon →</a></p></div><div class="step-card"><h3>2. Gebruik een HEPA-13 Luchtreiniger</h3><p>Plaats een HEPA-filter in de woonkamer en slaapkamer om zwevende huidschilfers voor 99,97% uit de lucht te filteren.</p></div><div class="step-card"><h3>3. Doe altijd een knuffeltest</h3><p>Breng voor aanschaf minstens twee uur door met een volwassen hond van het betreffende ras om je persoonlijke reactie te testen.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Allergiegids voor Hondenliefhebbers.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const hCont=document.getElementById('hypo-container');const allBreeds=${JSON.stringify(allBreeds)};hCont.replaceChildren();allBreeds.forEach(b=>{const card=document.createElement('article');card.className='hypo-card';card.innerHTML='<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--green);color:#fff">'+b.badge+'</span><h2 style="font-size:22px;margin:0">'+b.breed+'</h2><span class="allergy-badge">Geschiktheid: '+b.allergyScore+'</span><p style="font-size:14px;color:var(--muted);margin:0">'+b.description+'</p><div style="font-size:13px;background:var(--cream);padding:12px;border-radius:12px;line-height:1.4"><strong>Vachttype:</strong> '+b.coatType+'<br><strong>Verzorging:</strong> '+b.groomingNeeds+'<br><strong>Karakter:</strong> '+b.character+'</div><div style="margin-top:auto"><a href="/trimsalon" class="outline" style="display:block;text-align:center;font-size:13px;padding:8px">Zoek gespecialiseerde trimsalon →</a></div>';hCont.appendChild(card);});</script></body></html>`;
}

/* Beweging & Uitlaattijd Calculator Hub */
function exerciseCalcPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hond Beweging & Uitlaattijd Calculator 2026 | TrimGids</title><meta name="description" content="Hoeveel minuten moet jouw hond dagelijks wandelen? Bereken de ideale wandeltijd, intensiteit en de 5-minuten-regel voor puppy's op basis van ras en leeftijd."><link rel="canonical" href="https://trimgids.nl/beweging-hond-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is de 5-minuten-regel bij het uitlaten van een puppy?","acceptedAnswer":{"@type":"Answer","text":"Voor elke maand dat de pup oud is, mag hij per wandeling ongeveer 5 minuten aaneengesloten lopen (bijv. een pup van 4 maanden wandelt maximaal 20 minuten per keer) om overbelasting van de heupen en groeischijven te voorkomen."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.ex-calc{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/beweging-hond-calculator" style="color:var(--green);font-weight:700">⏱️ Bewegingscalculator</a><a href="/wandelen">Wandelroutes</a><a href="/wandelmaatje">Wandelmaatjes</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Beweging & Uitlaattijd Calculator</p><span class="eyebrow">Gezonde Conditie & Gewrichten 2026</span><h1>Hoeveel Beweging Heeft Jouw Hond Nodig?</h1><p class="intro">Voldoende beweging voorkomt gedragsproblemen, overgewicht en gewrichtsslijtage. Bereken hieronder de ideale dagelijkse wandeltijd voor jouw viervoeter.</p><div class="ex-calc"><div class="form-grid"><label>Energieniveau / Type ras<select id="e-type"><option value="low">Laag energieniveau (bijv. Engelse Bulldog, Mopshond, Basset)</option><option value="med" selected>Gemiddeld (bijv. Golden Retriever, Labrador, Labradoodle)</option><option value="high">Hoog energieniveau (bijv. Border Collie, Australische Herder, Husky)</option></select></label><label>Leeftijd van de hond (in jaren of maanden)<select id="e-age"><option value="pup-3">Puppy 3 maanden</option><option value="pup-6">Puppy 6 maanden</option><option value="adult" selected>Volwassen (1 - 7 jaar)</option><option value="senior">Senior (8+ jaar)</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="res-walk-min">75 - 90</span> min</strong><span>Aanbevolen totale wandeltijd per dag</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong><span id="res-walk-times">3 - 4</span> keer</strong><span>Aantal wandelingen per dag</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong><span id="res-walk-type">Stevig + Spel</span></strong><span>Aanbevolen intensiteit</span></div></div></div><section class="next"><span class="eyebrow">Ontdek mooie losloopgebieden</span><h2>Wandel lekker samen buiten</h2><div class="next-links"><a href="/wandelen">🌲 250+ Losloopgebieden in Nederland →</a><a href="/wandelmaatje">🤝 Vind een Wandelmaatje in jouw regio →</a><a href="/hondvriendelijke-horeca">☕ Hondvriendelijke Boscafés & Terrassen →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Bewegingsadvies is indicatief. Pas de duur aan bij warm weer of artrose.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const et=document.getElementById('e-type');const ea=document.getElementById('e-age');const rMin=document.getElementById('res-walk-min');const rTimes=document.getElementById('res-walk-times');const rType=document.getElementById('res-walk-type');const updateEx=()=>{const type=et.value;const age=ea.value;if(age==='pup-3'){rMin.textContent='45 - 60 (max 15 min per keer)';rTimes.textContent='4 - 5';rType.textContent='Rustig snuffelen & zachte ondergrond';}else if(age==='pup-6'){rMin.textContent='60 - 75 (max 30 min per keer)';rTimes.textContent='3 - 4';rType.textContent='Speels wandelen zonder wilde sprongen';}else if(age==='senior'){rMin.textContent='30 - 45';rTimes.textContent='3 - 4';rType.textContent='Rustig tempo, zachte bospaadjes';}else{if(type==='low'){rMin.textContent='45 - 60';rTimes.textContent='3';rType.textContent='Ontspannen snuffelwandeling';}else if(type==='med'){rMin.textContent='75 - 90';rTimes.textContent='3 - 4';rType.textContent='Stevig stappen + apporteren / zwemmen';}else{rMin.textContent='120 - 150+';rTimes.textContent='3 - 4';rType.textContent='Hardlopen, canicross, fietsen & hersenwerk';}}};et.addEventListener('change',updateEx);ea.addEventListener('change',updateEx);updateEx();</script></body></html>`;
}

/* Seizoensgebonden Vachtverzorging & Rui Gids */
function seasonalCoatCarePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vachtverzorging per Seizoen: Ruiperiode, Hitte & Pekel 2026 | TrimGids</title><meta name="description" content="Professioneel vachtadvies per seizoen: ruiperiode in de lente overleven, zomers vachtbehoud tegen verbranding, herfstklitten voorkomen en winterpootjes beschermen."><link rel="canonical" href="https://trimgids.nl/vachtverzorging-seizoenen"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/vachtverzorging-seizoenen" style="color:var(--green);font-weight:700">🍂 Seizoensgids</a><a href="/last-minute">Last-Minute</a><a href="/producten">Borstels</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Vachtverzorging per Seizoen</p><span class="eyebrow">Kynologische Vachtverzorging 2026</span><h1>Vachtverzorging per Seizoen: Lente, Zomer, Herfst & Winter</h1><p class="intro">Elk jaargetijde stelt unieke eisen aan de huid en vacht van je hond. Ontdek hoe je vervilting voorkomt, de ruiperiode versnelt en je viervoeter beschermt tegen extreme temperaturen.</p><div class="steps-grid" style="margin:30px 0"><div class="step-card"><div class="step-num">🌸</div><h3>Lente: De Grote Rui & Ontwollen</h3><p>De dikke winteronderwol laat los. Boek een ontwolbehandeling met waterblazer in de trimsalon om 90% van de rondvliegende haren in huis te voorkomen.</p></div><div class="step-card"><div class="step-num">☀️</div><h3>Zomer: Hittebescherming & Nooit Kaalscheren!</h3><p>Scheer een dubbele vacht (zoals Golden Retriever of Herder) nooit kaal! De vacht isoleert tegen hitte en beschermt de tere huid tegen zonnebrand.</p></div><div class="step-card"><div class="step-num">🍁</div><h3>Herfst: Modder, Klitten & Teken</h3><p>Vocht en modder zorgen voor snelle klitvorming in de liezen en oksels. Droog de vacht grondig met een microvezel handdoek en kam direct door.</p></div><div class="step-card"><div class="step-num">❄️</div><h3>Winter: Strooizout & Voetzoolverzorging</h3><p>Pekel en ijs veroorzaken pijnlijke kloofjes in de kussentjes. Smeer de voetzooltjes vooraf in met natuurlijke potenwax of vaseline.</p></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Seizoenswijzer.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

/* Hondenpension & Dagopvang Keuzegids */
function boardingChecklistPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hondenpension & Dagopvang Checklist 2026: Waarop Letten? | TrimGids</title><meta name="description" content="Checklist voor het kiezen van een betrouwbaar hondenhotel of dagopvang: verplichte inentingen (Kennelhoest), nachtrust, proefdagen en hygiëne-eisen."><link rel="canonical" href="https://trimgids.nl/hondenpension-checklist"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/opvang">Hondenhotels</a><a href="/hondenpension-checklist" style="color:var(--green);font-weight:700">🏨 Checklist Opvang</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hondenpension Checklist</p><span class="eyebrow">Zorgeloos Uitbesteden 2026</span><h1>Hondenpension & Dagopvang Checklist</h1><p class="intro">Ga je op vakantie of zoek je wekelijkse dagopvang voor je hond tijdens werkdagen? Gebruik deze officiële kwaliteitschecklist om een veilig en professioneel hondenhotel te selecteren.</p><div class="steps-grid" style="margin:30px 0"><div class="step-card"><div class="step-num">1</div><h3>Verplichte Vaccinaties (Titer / Kennelhoest)</h3><p>Een gerenommeerd pension vereist een geldige cocktailenting én de neusdruppel/injectie tegen Kennelhoest (Bordetella) minimaal 2-3 weken van tevoren.</p></div><div class="step-card"><div class="step-num">2</div><h3>Plan Altijd een Proefdag of Wenuurtje</h3><p>Laat je hond eerst 4 uur of een dagdeel wennen om te kijken hoe hij reageert op de roedel, verzorgers en kennelomgeving.</p></div><div class="step-card"><div class="step-num">3</div><h3>Rust & Slaapstructuur</h3><p>Honden hebben 14-16 uur slaap per dag nodig. Kies een opvang met vaste rusttijden in afgesloten, rustige ruimtes i.p.v. continue drukte.</p></div><div class="step-card"><div class="step-num">4</div><h3>Dierenartscontract & Noodprotocol</h3><p>Vraag met welke lokale dierenartspraktijk het pension samenwerkt in geval van acute medische noodsituaties.</p></div></div><section class="next"><span class="eyebrow">Vind gecertificeerde opvang</span><h2>Zoek direct in jouw regio</h2><div class="next-links"><a href="/opvang">🏨 Bekijk Hondenhotels & Dagopvang in Nederland →</a><a href="/offerte">💼 Vraag Direct Vrijblijvende Offerte aan →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Kwaliteitsgids voor Dierenopvang in Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

function vacationsPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vakantiehuis met Omheinde Tuin Hond 2026 | TrimGids Vakanties</title><meta name="description" content="Vind de beste vakantiehuizen met 1.50m tot 1.80m omheinde tuin waar meerdere honden welkom zijn. Veluwe, Zeeland, Drenthe, Waddeneilanden & Ardennen. Boek direct."><link rel="canonical" href="https://trimgids.nl/vakantie-met-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat is de minimale hekhoogte voor een omheinde tuin met hond?","acceptedAnswer":{"@type":"Answer","text":"Voor kleine en rustige honden volstaat 1.00m tot 1.20m. Voor middelgrote en actieve werkhonden (zoals herders of jachthonden) wordt minimaal 1.50m tot 1.80m aanbevolen om ontsnappen te voorkomen."}},{"@type":"Question","name":"Mogen honden mee naar het strand in Zeeland en Texel?","acceptedAnswer":{"@type":"Answer","text":"Ja, op Texel en in Zeeland zijn speciale hondenstranden waar honden het hele jaar door los mogen rennen en zwemmen in zee."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.vac-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:32px 0}.vac-card{background:var(--card-bg);border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:14px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.vac-price{font:700 28px Fraunces,serif;color:var(--green)}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/vakantie-met-hond" style="color:var(--green);font-weight:700">🏡 Vakantiehuizen</a><a href="/hondvriendelijke-horeca">Boscafés</a><a href="/wandelen">Wandelen</a><a href="/kaart">Kaart</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Vakantiehuizen met Omheinde Tuin</p><span class="eyebrow">Zorgeloos op Vakantie 2026</span><h1>Vakantiehuizen met Omheinde Tuin voor Honden</h1><p class="intro">Wil je ontspannen op vakantie zonder dat je bang hoeft te zijn dat je hond ontsnapt? Wij selecteerden de best beoordeelde vakantiebungalows, chalets en duinvilla's in Nederland en de Ardennen met 100% omheinde privétuinen.</p><noscript><div class="shop-empty" style="margin-bottom:14px">💡 Schakel JavaScript in om vakantiehuizen te vergelijken; alle opties zijn hieronder al zichtbaar.</div></noscript>
<div class="vac-grid" id="vac-container">
${(() => { const dt = loadJsonLocal(dogVacationsFile); const vs = (dt && (Array.isArray(dt) ? dt : dt.vacations)) || []; return vs.map(v => `<article class="vac-card" id="vakantie-${v.id}"><span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">${v.badge}</span><h2 style="font-size:22px;margin:0">${v.title}</h2><span style="font-size:13px;color:var(--muted)">📍 ${v.location} (${v.region}) · ⭐ ${v.rating} (${v.reviews} reviews)</span><div style="font-size:13px;background:var(--cream);padding:12px 14px;border-radius:12px;line-height:1.4">🛡️ <strong>Omheining:</strong> ${v.fenceHeight}<br><strong>Honden:</strong> ${v.maxDogs}</div><p style="font-size:14px;color:var(--muted);margin:0">${v.highlights}</p><ul class="tg-list">${v.dogPerks.map(p => '<li>' + p + '</li>').join('')}</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;border-top:1px solid var(--line);padding-top:14px"><div><span style="font-size:12px;color:var(--muted)">Vanaf</span><div class="vac-price">€ ${v.pricePerNight} <small style="font-size:13px;color:var(--muted);font-family:Inter,sans-serif">/ nacht</small></div></div><a href="${v.bookingUrl}" target="_blank" rel="noopener noreferrer" class="btn-submit" style="text-decoration:none;font-size:13px;padding:10px 18px">Bekijk & Boek ↗</a></div></article>`).join(''); })()}
</div><section class="guide-box"><h2>Waarop letten bij het boeken van een hondvriendelijk vakantiehuis?</h2><div class="steps-grid"><div class="step-card"><h3>1. Echte omheining vs beplanting</h3><p>Controleer altijd of de tuin volledig is afgesloten met gaas of hout van minstens 1.40m tot 1.80m, zonder kieren onder het hek.</p></div><div class="step-card"><h3>2. Maximaal aantal honden</h3><p>Onze geselecteerde verblijven verwelkomen 2 tot 4 honden (sommige zelfs onbeperkt) zonder absurde extra schoonmaakkosten.</p></div><div class="step-card"><h3>3. Losloopgebied op loopafstand</h3><p>Direct vanuit je voordeur de Veluwse bossen, Drentse heide of Zeeuwse stranden in zonder eerst in de auto te moeten stappen.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids toont gecertificeerde hondvriendelijke accommodaties. Boekingen verlopen veilig via officiële partners.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const vCont=document.getElementById('vac-container');const loadVac=async()=>{try{const res=await fetch('/api/dog-vacations');const data=await res.json();if(vCont.children.length) return;(data.vacations||[]).forEach(v=>{const card=document.createElement('article');card.className='vac-card';card.innerHTML='<span class="label" style="position:absolute;top:-12px;right:20px;background:var(--amber);color:#fff">'+v.badge+'</span><h2 style="font-size:22px;margin:0">'+v.title+'</h2><span style="font-size:13px;color:var(--muted)">📍 '+v.location+' ('+v.region+') · ⭐ '+v.rating+' ('+v.reviews+' reviews)</span><div style="font-size:13px;background:var(--cream);padding:12px 14px;border-radius:12px;line-height:1.4">🛡️ <strong>Omheining:</strong> '+v.fenceHeight+'<br><strong>Honden:</strong> '+v.maxDogs+'</div><p style="font-size:14px;color:var(--muted);margin:0">'+v.highlights+'</p><ul class="tg-list">'+v.dogPerks.map(p=>'<li>'+p+'</li>').join('')+'</ul><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;border-top:1px solid var(--line);padding-top:14px"><div><span style="font-size:12px;color:var(--muted)">Vanaf</span><div class="vac-price">€ '+v.pricePerNight+' <small style="font-size:13px;color:var(--muted);font-family:Inter,sans-serif">/ nacht</small></div></div><a href="'+v.bookingUrl+'" target="_blank" rel="noopener noreferrer" class="btn-submit" style="text-decoration:none;font-size:13px;padding:10px 18px">Bekijk & Boek ↗</a></div>';vCont.appendChild(card);});}catch(e){vCont.innerHTML='<p>Kon vakantiehuizen niet laden.</p>';}};loadVac();</script></body></html>`;
}

/* Hondenras Intelligentie & Coren Ranking Gids */
function intelligencePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Slimste Hondenrassen 2026: Coren Intelligentie Ranking | TrimGids</title><meta name="description" content="Bekijk de officiële top 100 intelligentste hondenrassen ter wereld volgens de Coren ranking. Ontdek leersnelheid, gehoorzaamheid en mentale behoeften per ras."><link rel="canonical" href="https://trimgids.nl/hondenras-intelligentie"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.intel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:32px 0}.intel-card{background:var(--card-bg);border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.rank-badge{position:absolute;top:18px;right:18px;font:700 22px Fraunces,serif;color:var(--green);background:var(--green-light);width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hondenras-intelligentie" style="color:var(--green);font-weight:700">🧠 Intelligentie Ranking</a><a href="/hondenschool">Hondenscholen</a><a href="/producten">Denkspellen</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Slimste Hondenrassen Ranking</p><span class="eyebrow">Kynologisch Onderzoek</span><h1>De Slimste Hondenrassen ter Wereld</h1><p class="intro">Gebaseerd op het baanbrekende onderzoek van prof. Stanley Coren naar werkintelligentie en gehoorzaamheid bij meer dan 130 rassen. Hoe scoort jouw hond?</p><noscript><div class="shop-empty" style="margin-bottom:14px">Alle rassen staan hieronder; de interactieve keuzehulp werkt alleen met JavaScript.</div></noscript>
<div class="intel-grid" id="intel-container">
${(() => { const dt = loadJsonLocal(dogIntelligenceFile); const items = (dt && (Array.isArray(dt) ? dt : dt.intelligence)) || []; return items.map(item => `<article class="intel-card"><span class="rank-badge">#${item.rank}</span><h2 style="font-size:22px;margin:0;padding-right:48px">${item.breed}</h2><span class="label" style="background:var(--green-light);color:var(--green);font-size:12px">${item.tier}</span><p style="font-size:14px;color:var(--muted);margin:0">${item.description}</p><div style="font-size:13px;background:var(--cream);padding:12px;border-radius:12px;line-height:1.4">🎯 <strong>Leersnelheid:</strong> ${item.commandsLearned}<br>💡 <strong>Mentale behoefte:</strong> ${item.mentalExerciseNeeds}<br>🧩 <strong>Aanbevolen:</strong> ${item.recommendedGear}</div><div style="margin-top:auto"><a href="/hondenschool" class="outline" style="display:block;text-align:center;font-size:13px;padding:8px">Vind Hondenschool & Cursus →</a></div></article>`).join(''); })()}
</div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Kynologische Intelligentie Index.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const iCont=document.getElementById('intel-container');const loadIntel=async()=>{try{const res=await fetch('/api/dog-intelligence');const data=await res.json();if(iCont.children.length) return;(data.intelligence||[]).forEach(item=>{const card=document.createElement('article');card.className='intel-card';card.innerHTML='<span class="rank-badge">#'+item.rank+'</span><h2 style="font-size:22px;margin:0;padding-right:48px">'+item.breed+'</h2><span class="label" style="background:var(--green-light);color:var(--green);font-size:12px">'+item.tier+'</span><p style="font-size:14px;color:var(--muted);margin:0">'+item.description+'</p><div style="font-size:13px;background:var(--cream);padding:12px;border-radius:12px;line-height:1.4">🎯 <strong>Leersnelheid:</strong> '+item.commandsLearned+'<br>💡 <strong>Mentale behoefte:</strong> '+item.mentalExerciseNeeds+'<br>🧩 <strong>Aanbevolen:</strong> '+item.recommendedGear+'</div><div style="margin-top:auto"><a href="/hondenschool" class="outline" style="display:block;text-align:center;font-size:13px;padding:8px">Vind Hondenschool & Cursus →</a></div>';iCont.appendChild(card);});}catch(e){iCont.innerHTML='<p>Kon ranglijst niet laden.</p>';}};loadIntel();</script></body></html>`;
}

/* Verhuizen met Hond Checklist */
function relocationPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Verhuizen met een Hond Checklist 2026: Stressvrij & Regelzaken | TrimGids</title><meta name="description" content="Complete verhuischecklist voor hondenbezitters: hondenbelasting omzetten, microchip adres wijzigen (NDG), nieuwe dierenarts & trimsalon vinden, en ontstressen."><link rel="canonical" href="https://trimgids.nl/verhuizen-met-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/hondenbelasting">Hondenbelasting</a><a href="/kaart">Kaart</a><a href="/spoed-dierenarts">Dierenarts</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Verhuizen met Hond</p><span class="eyebrow">Praktische Checklist 2026</span><h1>Verhuizen met je Hond: Checklist & Regelzaken</h1><p class="intro">Een verhuizing brengt veel verandering met zich mee voor een hond. Met deze officiële checklist regel je alle administratie en zorg je voor een stressvrije overgang naar je nieuwe woning.</p><div class="steps-grid" style="margin:30px 0"><div class="step-card"><div class="step-num">1</div><h3>Chipregistratie Wijzigen (Wettelijk verplicht)</h3><p>Pas binnen 14 dagen je nieuwe adres aan in de databank (bijv. NDG, BackHomeClub of Chipnummer.nl) zodat je hond direct herenigd kan worden bij weglopen.</p></div><div class="step-card"><div class="step-num">2</div><h3>Hondenbelasting Af- & Aanmelden</h3><p>Meld je hond af bij je oude gemeente en controleer of je in de nieuwe gemeente hondenbelasting moet betalen. <a href="/hondenbelasting" style="color:var(--green);font-weight:700">Bekijk de Gemeentegids →</a></p></div><div class="step-card"><div class="step-num">3</div><h3>Schrijf je in bij een Lokale Dierenarts & Trimsalon</h3><p>Wacht niet tot er een noodgeval is. Schrijf je nieuwe adres alvast in bij een dierenartspraktijk en trimsalon in de buurt.</p></div><div class="step-card"><div class="step-num">4</div><h3>Verhuisdag Ontzorging</h3><p>Breng je hond op de dag van het sjouwen naar een vertrouwde dagopvang of familie om stress en ontsnappingsgevaar bij open deuren te voorkomen.</p></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Verhuisgids voor Hondenbezitters.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

/* Honden Bespaartips Hub */
function moneySavingPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>10 Slimme Bespaartips voor Hondenbezitters 2026 | TrimGids</title><meta name="description" content="Bespaar jaarlijks € 600 tot € 1.200 op de kosten van je hond zonder in te leveren op gezondheid of geluk. Van preventieve zorg tot voeding en verzekering."><link rel="canonical" href="https://trimgids.nl/honden-bespaartips"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/honden-bespaartips" style="color:var(--green);font-weight:700">💰 Bespaartips</a><a href="/verzekering">Verzekering</a><a href="/voeding">Voeding Deals</a><a href="/kosten-hond">Kosten Hond</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Bespaartips voor Hondenbezitters</p><span class="eyebrow">Bespaargids 2026</span><h1>Bespaar € 600,- tot € 1.200,- per Jaar op je Hond</h1><p class="intro">Een hond brengt onbetaalbaar veel liefde, maar de kosten voor voeding, dierenarts en trimsalon stijgen snel. Ontdek hier de 5 grootste geldlekken en hoe je slim bespaart.</p><div class="steps-grid" style="margin:30px 0"><div class="step-card"><div class="step-num">1</div><h3>Voorkom Tandsteen Narcose (Bespaar € 350,-)</h3><p>Regelmatige reiniging en natuurlijke zeewiersupplementen voorkomen dat je hond onder narcose moet voor gebitsreiniging bij de dierenarts. <a href="/gebitsverzorging-hond" style="color:var(--green);font-weight:700">Lees meer →</a></p></div><div class="step-card"><div class="step-num">2</div><h3>Sluit Vroeg een Ziektekostenverzekering af (Bespaar tot € 2.500,-)</h3><p>Een operatie bij een maagkanteling of kruisbandblessure kost al snel € 2.000,- tot € 4.000,-. Een goede verzekering vangt dit op. <a href="/verzekering" style="color:var(--green);font-weight:700">Vergelijk premies →</a></p></div><div class="step-card"><div class="step-num">3</div><h3>Borstel Wekelijks met het Juiste Materiaal (Bespaar € 150,- trimsalon toeslag)</h3><p>Klitvrije honden worden sneller en goedkoper behandeld in de trimsalon zonder 'verviltingstoeslag'. Gebruik een professionele universele slickerborstel. <a href="/producten" style="color:var(--green);font-weight:700">Bekijk borstels →</a></p></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Consumentenwijzer.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

function communityBuddiesPage() {
  const buddyData = loadJsonLocal(communityBuddiesFile);
  const allBuddies = (buddyData && (Array.isArray(buddyData) ? buddyData : buddyData.buddies)) || [];
  const buddyCard = (b) => `<article class="buddy-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:22px;margin:0">${escapeHtml(b.dogName)} <small style="font-size:14px;color:var(--muted);font-weight:400">met ${escapeHtml(b.ownerName)}</small></h2><span style="font-size:13px;color:var(--muted)">${escapeHtml(b.city)} (${escapeHtml(b.province)}) · ${escapeHtml(b.breed)}</span></div><span class="label" style="background:var(--green-light);color:var(--green);font-size:11px">${escapeHtml(b.gender)}</span></div><div style="font-size:13px;background:var(--cream);padding:10px 14px;border-radius:12px"><strong>Gebied:</strong> ${escapeHtml(b.area)}<br><strong>Karakter:</strong> ${escapeHtml(b.vibe)}</div><p style="font-size:14px;color:var(--muted);margin:0;line-height:1.5">“${escapeHtml(b.message)}”</p><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;border-top:1px solid var(--line);padding-top:12px"><small style="color:var(--muted);font-size:12px">${escapeHtml(b.date)}</small><a class="btn-submit" style="padding:7px 14px;font-size:12px;text-decoration:none" href="mailto:${encodeURIComponent(b.contact)}?subject=Wandelen met ${encodeURIComponent(b.dogName)}">Reageer Direct</a></div></article>`;
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wandelmaatje voor je Hond Gezocht? Community Lounge 2026 | TrimGids</title><meta name="description" content="Vind een wandelmaatje voor jouw hond in jouw buurt of losloopgebied. Plaats gratis een oproep met de naam en het ras van je hond en ontmoet lokale baasjes."><link rel="canonical" href="https://trimgids.nl/wandelmaatje"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.buddy-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin:30px 0}.buddy-card{background:var(--card-bg);border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:14px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.pulse-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.12);color:#10b981;font-weight:700;font-size:12px;padding:4px 10px;border-radius:999px}.pulse-dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/wandelen">Wandelroutes</a><a href="/wandelmaatje" style="color:var(--green);font-weight:700">Wandelmaatjes</a><a href="/hondvriendelijke-horeca">Boscafés</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Wandelmaatjes Community Lounge</p><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px"><span class="eyebrow">Hondenbaasjes Community 2026</span><span class="pulse-badge"><span class="pulse-dot"></span> 42 baasjes nu online in NL</span></div><h1>Vind een Wandelmaatje voor Jouw Hond</h1><p class="intro">Honden zijn roedeldieren en spelen het liefst met vriendjes van gelijke energie. Plaats een gratis oproep met jouw naam en hond, of reageer direct op andere enthousiaste baasjes in jouw provincie of favoriete losloopgebied.</p><div class="filter-bar"><button class="f-btn active" data-prov="">Alle Provincies</button><button class="f-btn" data-prov="Utrecht">Utrecht</button><button class="f-btn" data-prov="Limburg">Limburg</button><button class="f-btn" data-prov="Noord-Holland">Noord-Holland</button><button class="f-btn" data-prov="Gelderland">Gelderland</button><button class="f-btn" data-prov="Noord-Brabant">Noord-Brabant</button></div><div class="buddy-grid" id="buddy-container">${allBuddies.map(buddyCard).join('')}</div><section class="tip-box" id="meld-oproep"><div class="tip-box-head"><span class="eyebrow">Gratis Meedoen</span><h2>Plaats jouw Wandeloproep in 1 minuut</h2><p>Laat andere baasjes in jouw regio weten wanneer en waar je graag wandelt met je hond.</p></div><form id="buddy-form" class="form-grid"><label>Jouw Voornaam<input name="ownerName" required maxlength="50" placeholder="Bijv. Laura"></label><label>Naam van je hond<input name="dogName" required maxlength="50" placeholder="Bijv. Max"></label><label>Hondenras & Leeftijd<input name="breed" required maxlength="60" placeholder="Bijv. Border Collie (1 jaar)"></label><label>Geslacht & Status<select name="gender"><option value="Reu">Reu</option><option value="Reu (gecastreerd)">Reu (gecastreerd)</option><option value="Teef">Teef</option><option value="Teef (gesteriliseerd)">Teef (gesteriliseerd)</option></select></label><label>Gemeente / Plaats<input name="city" required maxlength="50" placeholder="Bijv. Utrecht"></label><label>Provincie<select name="province"><option value="Drenthe">Drenthe</option><option value="Flevoland">Flevoland</option><option value="Friesland">Friesland</option><option value="Gelderland">Gelderland</option><option value="Groningen">Groningen</option><option value="Limburg">Limburg</option><option value="Noord-Brabant">Noord-Brabant</option><option value="Noord-Holland">Noord-Holland</option><option value="Overijssel">Overijssel</option><option value="Utrecht" selected>Utrecht</option><option value="Zeeland">Zeeland</option><option value="Zuid-Holland">Zuid-Holland</option></select></label><label class="full">Favoriet Wandel- of Losloopgebied<input name="area" required maxlength="80" placeholder="Bijv. Panbos Zeist of Hondenstrand Noordwijk"></label><label class="full">Karakter / Vibe van de hond<input name="vibe" required maxlength="80" placeholder="Bijv. Zeer sociaal, rent graag achter de bal aan"></label><label class="full">Jouw oproep / bericht aan andere baasjes<textarea name="message" rows="3" required maxlength="300" placeholder="Vertel kort wat voor maatje je zoekt en wanneer je meestal wandelt..."></textarea></label><label class="full">E-mail of telefoon (voor reacties)<input name="contact" required maxlength="60" placeholder="Bijv. laura.max@gmail.com of 06-12345678"></label><button class="btn-submit full" type="submit">Plaats Wandeloproep Live</button><p id="buddy-status" class="status-msg full"></p></form></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Community verbindt meer dan 50.000 hondenbezitters in Nederland.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>let activeBuddyProv='';const bBox=document.getElementById('buddy-container');const allBuddies=${JSON.stringify(allBuddies)};const loadBuddies=()=>{renderBuddies();};}else{throw new Error();}}catch(err){bStatus.textContent='Fout bij plaatsen van oproep.';bStatus.className='status-msg error full';}});loadBuddies();</script></body></html>`;
}

/* Puppy Gewicht & Groeicurve Calculator Hub */
function puppyWeightPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Puppy Gewicht Calculator: Bereken Volwassen Gewicht 2026 | TrimGids</title><meta name="description" content="Bereken het verwachte volwassen gewicht en de ideale groeicurve van je pup op basis van leeftijd in weken en huidig gewicht in kg. Inclusief voedingsbehoefte per fase."><link rel="canonical" href="https://trimgids.nl/puppy-gewicht-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wanneer is een puppy volgroeid?","acceptedAnswer":{"@type":"Answer","text":"Kleine hondenrassen bereiken hun volwassen gewicht meestal rond 9-12 maanden. Grote en reuzenrassen groeien vaak door tot 18 tot 24 maanden."}},{"@type":"Question","name":"Waarom is het voorspellen van het eindgewicht belangrijk?","acceptedAnswer":{"@type":"Answer","text":"Het helpt bij het kiezen van de juiste portiegrootte puppybrokken, voorkomt te snelle skeletgroei bij grote rassen en zorgt voor de juiste maat mand, tuig en bench."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.weight-calc{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/puppy-gewicht-calculator" style="color:var(--green);font-weight:700">⚖️ Puppy Groei-Check</a><a href="/hondennamen">Namen</a><a href="/voeding">Puppyvoeding</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Puppy Gewicht & Groeicurve</p><span class="eyebrow">Kynologische Groeicurve 2026</span><h1>Puppy Gewicht Calculator: Bereken het Volwassen Gewicht</h1><p class="intro">Hoe groot en zwaar wordt jouw pup als hij straks volwassen is? Vul de huidige leeftijd en het gewicht van je pup in om de groeicurve en het geschatte eindgewicht te berekenen.</p><div class="weight-calc"><div class="form-grid"><label>Leeftijd van de pup (in weken)<input type="number" id="p-weeks" value="16" min="6" max="52"></label><label>Huidig gewicht (in kg)<input type="number" id="p-weight" value="6.5" min="0.5" max="50" step="0.1"></label><label class="full">Verwacht rasformaat<select id="p-type"><option value="small">Klein ras (&lt; 10 kg volwassen, bijv. Teckel, Jack Russell)</option><option value="med" selected>Middelgroot ras (10 - 25 kg volwassen, bijv. Labradoodle, Cocker Spaniël)</option><option value="large">Groot ras (25 - 45 kg volwassen, bijv. Golden Retriever, Labrador)</option><option value="giant">Reuzenras (&gt; 45 kg volwassen, bijv. Deense Dog, Berner Sennen)</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="res-adult-kg">16.2</span> kg</strong><span>Geschat volwassen eindgewicht</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong><span id="res-adult-months">12</span> mnd</strong><span>Verwachte volgroeide leeftijd</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong><span id="res-daily-grams">280</span> gr/dag</strong><span>Aanbevolen dagelijkse portie kwaliteitsvoeding</span></div></div></div><section class="guide-box"><h2>Groeifases van de pup: Wat te verwachten?</h2><div class="steps-grid"><div class="step-card"><div class="step-num">1</div><h3>8 - 16 weken: Snelle Groeispurt</h3><p>De zenuwen, spieren en botten groeien exponentieel. Let op: vermijd te veel traplopen of overbelasting van de groeischijven.</p></div><div class="step-card"><div class="step-num">2</div><h3>4 - 8 maanden: Wisselen & Vachtwissel</h3><p>Het melkgebit wisselt naar het volwassen gebit en de puppylockenvacht maakt plaats voor de volwassen vacht. Ideaal moment voor de eerste trimsalon wenbeurt!</p></div><div class="step-card"><div class="step-num">3</div><h3>9 - 18 maanden: Spieropbouw & Balans</h3><p>De hoogtegroei stopt en het lichaam wordt breder en gespierder. Schakel geleidelijk over naar volwassen kwaliteitsvoeding.</p></div></div></section><section class="next"><span class="eyebrow">Handige tools voor puppyeigenaren</span><h2>Alles voor een gezonde start</h2><div class="next-links"><a href="/hondennamen">🐶 Populaire Hondennamen 2026 →</a><a href="/hondenschool">🎓 Vind Puppycursus in je Regio →</a><a href="/voeding">🥩 Beste Verse Puppyvoeding & Kortingen →</a><a href="/verzekering">🛡️ Hondenverzekering Vergelijken →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Groeivoorspelling is gebaseerd op gemiddelde kynologische groeicurves. Raadpleeg bij twijfel altijd je dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const pw=document.getElementById('p-weeks');const pwg=document.getElementById('p-weight');const pt=document.getElementById('p-type');const rAkg=document.getElementById('res-adult-kg');const rAm=document.getElementById('res-adult-months');const rDg=document.getElementById('res-daily-grams');const updateCalc=()=>{const w=parseInt(pw.value)||16;const wt=parseFloat(pwg.value)||5;const type=pt.value;let adult=wt;let months=12;if(type==='small'){const pct=Math.min(1,w/40);adult=wt/(0.25+pct*0.75);months=10;}else if(type==='med'){const pct=Math.min(1,w/52);adult=wt/(0.2+pct*0.8);months=12;}else if(type==='large'){const pct=Math.min(1,w/65);adult=wt/(0.15+pct*0.85);months=16;}else{const pct=Math.min(1,w/80);adult=wt/(0.12+pct*0.88);months=20;}adult=Math.max(wt*1.1,adult);rAkg.textContent=adult.toFixed(1);rAm.textContent=months;const dailyGrams=Math.round(adult*16.5);rDg.textContent=dailyGrams;};pw.addEventListener('input',updateCalc);pwg.addEventListener('input',updateCalc);pt.addEventListener('change',updateCalc);updateCalc();</script></body></html>`;
}

/* B2B Trimsalon Inkomsten & Rendement Calculator */
function groomerCalculatorPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Trimsalon Omzet & Inkomsten Calculator 2026 | TrimGids B2B</title><meta name="description" content="Bereken de potentiële jaaromzet, nettowinst en bezettingsgraad voor jouw trimsalon. Ontdek hoe een TrimGids vermelding je agenda vult en last-minute leegstand voorkomt."><link rel="canonical" href="https://trimgids.nl/trimsalon-inkomsten-calculator"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${directoryStyles()}${customModuleStyles()}.b2b-calc{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids Pro</a><div class="nav-links"><a href="/bedrijven">Voor Bedrijven</a><a href="/trimsalon-inkomsten-calculator" style="color:var(--green);font-weight:700">💼 Omzet Calculator</a><a href="/last-minute">Last-Minute Deals</a><a href="/offerte">Offerte Leads</a><a href="/">Consumenten Site</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/bedrijven">Voor Bedrijven</a> / Trimsalon Inkomsten Calculator</p><span class="eyebrow">B2B Ondernemers Tool 2026</span><h1>Wat kan jouw Trimsalon Maandelijks Verdienen?</h1><p class="intro">Als professioneel hondentrimmer wil je een gezonde marge, een volle agenda en minimale leegstand door no-shows of afzeggingen. Bereken hieronder direct jouw potentiële maand- en jaaromzet.</p><div class="b2b-calc"><div class="form-grid"><label>Aantal honden per dag<input type="number" id="b-dogs" value="4" min="1" max="12"></label><label>Gemiddelde trimbeurt prijs (€)<input type="number" id="b-price" value="75" min="30" max="250"></label><label>Werkdagen per week<input type="number" id="b-days" value="4" min="1" max="6"></label><label>Vakantieweken per jaar<input type="number" id="b-holidays" value="5" min="0" max="15"></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong>€ <span id="b-res-month">5.640</span></strong><span>Geschatte bruto maandomzet</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>€ <span id="b-res-year">56.400</span></strong><span>Geschatte bruto jaaromzet</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>+ € 3.600,-</strong><span>Extra jaaromzet via TrimGids No-Show vulling</span></div></div></div><section class="tip-box"><div class="tip-box-head"><span class="eyebrow">Groei met TrimGids</span><h2>Meld je trimsalon aan voor het TrimGids Partnernetwerk</h2><p>Bereik maandelijks duizenden hondeneigenaren in jouw regio, ontvang geverifieerde offerte-aanvragen en vul uitgevallen uren binnen 15 minuten.</p></div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:16px"><a href="/bedrijven" class="btn-submit" style="text-decoration:none">Bekijk Partner Pakketten →</a><a href="/last-minute" class="outline" style="text-decoration:none">Plaats Vrije Trimplek →</a></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids B2B Zakelijk Netwerk voor Dierenverzorgers in Nederland & Vlaanderen.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const bd=document.getElementById('b-dogs');const bp=document.getElementById('b-price');const bda=document.getElementById('b-days');const bh=document.getElementById('b-holidays');const rM=document.getElementById('b-res-month');const rY=document.getElementById('b-res-year');const updateB2B=()=>{const dogs=parseInt(bd.value)||4;const price=parseFloat(bp.value)||75;const days=parseInt(bda.value)||4;const hol=parseInt(bh.value)||5;const workWeeks=Math.max(1,52-hol);const weekRev=dogs*price*days;const yearRev=weekRev*workWeeks;const monthRev=yearRev/12;rM.textContent=Math.round(monthRev).toLocaleString('nl-NL');rY.textContent=Math.round(yearRev).toLocaleString('nl-NL');};bd.addEventListener('input',updateB2B);bp.addEventListener('input',updateB2B);bda.addEventListener('input',updateB2B);bh.addEventListener('input',updateB2B);updateB2B();</script></body></html>`;
}

function firstAidPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>EHBO voor Honden: Eerste Hulp bij Noodgevallen 2026 | TrimGids</title><meta name="description" content="Directe stappenplannen bij acute noodsituaties met honden: oververhitting, wonden, insectensteken, verslikking, vergiftiging en maagtorsie. Met 24/7 dierenartslijn."><link rel="canonical" href="https://trimgids.nl/ehbo-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Wat moet ik doen als mijn hond oververhit raakt (hitteberoerte)?","acceptedAnswer":{"@type":"Answer","text":"Breng de hond direct naar de schaduw, koel de voetzooltjes, buik en liezen met lauw/koel water (nooit ijskoud water i.v.m. shock) en bel direct de dierenarts."}},{"@type":"Question","name":"Hoe herken ik een levensbedreigende maagkanteling (maagtorsie)?","acceptedAnswer":{"@type":"Answer","text":"Symptomen zijn loos braken (schuim kokhalzen zonder dat er iets uitkomt), een snel opzwellende harde buik, extreme onrust en kwijlen. Dit vereist binnen 1-2 uur een spoedoperatie."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.ehbo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:24px;margin:30px 0}.ehbo-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px;box-shadow:0 3px 12px rgba(0,0,0,.04);position:relative}.badge-urgency{position:absolute;top:-12px;right:20px;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;text-transform:uppercase}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/ehbo-hond" style="color:#b91c1c;font-weight:700">🚨 EHBO Noodgids</a><a href="/spoed-dierenarts">Spoeddierenartsen</a><a href="/giftigheid-calculator">Gif-Check</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / EHBO voor Honden</p><span class="eyebrow" style="color:#b91c1c">Veterinair Noodprotocol 2026</span><h1>EHBO voor Honden: Wat te doen bij spoed?</h1><p class="intro">In acute situaties telt elke seconde. Bekijk hieronder direct het juiste stappenplan bij oververhitting, snijwonden, insectensteken, vergiftiging of verstikking.</p><div class="ehbo-grid"><article class="ehbo-card"><span class="badge-urgency" style="background:#b91c1c;color:#fff">Acuut Levensgevaar</span><h2 style="font-size:22px;margin:0">🔥 Hitteberoerte & Oververhitting</h2><p style="font-size:14px;color:var(--muted);margin:0">Lichaamstemperatuur boven 40.5°C door achterlating in de auto of rennen bij warm weer.</p><div style="font-size:13px;line-height:1.5;background:var(--cream);padding:14px;border-radius:12px"><strong>Actieplan:</strong><ol style="margin:6px 0 0;padding-left:18px"><li>Direct in de schaduw of airco leggen.</li><li>Koelen met lauw/koel stromend water op poten, liezen en nek (géén ijs!).</li><li>Kleine slokjes lauw water laten drinken.</li><li>Bel direct de spoedkliniek en rijd met ramen open/airco.</li></ol></div><a href="/spoed-dierenarts" class="btn-submit" style="background:#b91c1c;text-align:center;text-decoration:none;font-size:13px;padding:10px">Bel Spoeddierenarts →</a></article><article class="ehbo-card"><span class="badge-urgency" style="background:#ea580c;color:#fff">Spoed</span><h2 style="font-size:22px;margin:0">🩸 Bloedende Voetzool of Snijwond</h2><p style="font-size:14px;color:var(--muted);margin:0">Vaak veroorzaakt door gebroken glas in het park of scherpe schelpen op het strand.</p><div style="font-size:13px;line-height:1.5;background:var(--cream);padding:14px;border-radius:12px"><strong>Actieplan:</strong><ol style="margin:6px 0 0;padding-left:18px"><li>Spoel de wond schoon met schoon water of fysiologisch zout.</li><li>Druk een steriel gaasje stevig op de wond tegen het bloeden.</li><li>Verbind de poot met een drukverband (inclusief tussen de teentjes).</li><li>Laat diepe snedes binnen 6 uur hechten bij de dierenarts.</li></ol></div><a href="/producten" class="outline" style="text-align:center;font-size:13px;padding:10px">Bekijk EHBO Wondverzorgingskit →</a></article><article class="ehbo-card"><span class="badge-urgency" style="background:#3730a3;color:#fff">Matig tot Ernstig</span><h2 style="font-size:22px;margin:0">🐝 Wesp- of Bijensteek</h2><p style="font-size:14px;color:var(--muted);margin:0">Gevaarlijk bij steken in de bek/keelholte of allergische anafylactische shock.</p><div style="font-size:13px;line-height:1.5;background:var(--cream);padding:14px;border-radius:12px"><strong>Actieplan:</strong><ol style="margin:6px 0 0;padding-left:18px"><li>Verwijder de angel voorzichtig met een bankpasje (niet knijpen).</li><li>Koel de plek met een coldpack gewikkeld in een theedoek.</li><li>Bij zwelling rond de keel of benauwdheid: direct naar de dierenarts voor antihistaminica/corticosteroïden!</li></ol></div><a href="/spoed-dierenarts" class="btn-submit" style="background:#3730a3;text-align:center;text-decoration:none;font-size:13px;padding:10px">Zoek Dierenarts in Regio →</a></article></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids EHBO Wijzer — Bij acute nood: neem altijd direct telefonisch contact op met een dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script></body></html>`;
}

/* Standalone Gebitsverzorging & Tandsteen Risico Calculator */
function dentalCarePage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Gebitsverzorging & Tandsteen bij Honden 2026 | TrimGids</title><meta name="description" content="Bereken het risico op tandsteen en parodontitis bij jouw hond. Ontdek hoe je tandsteen verwijdert zonder narcose en bespaar honderden euro's dierenartskosten."><link rel="canonical" href="https://trimgids.nl/gebitsverzorging-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Waarom hebben kleine honden vaker last van tandsteen?","acceptedAnswer":{"@type":"Answer","text":"Kleine rassen (zoals Pomerianen, Chihuahua's en Maltezers) hebben een kleinere kaak waardoor tanden dichter op elkaar staan, wat leidt tot snellere tandplakvorming en bacteriële ophoping."}},{"@type":"Question","name":"Kan tandsteen verwijderd worden zonder narcose?","acceptedAnswer":{"@type":"Answer","text":"Ja, veel professionele trimsalons bieden tegenwoordig ultrasone gebitsreiniging (zoals Emmi-Pet) aan, waarmee tandplak en beginnend tandsteen zacht en pijnloos met geluidsgolven wordt losgetrild zonder sedatie."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.dental-calc{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/gebitsverzorging-hond" style="color:var(--green);font-weight:700">🦷 Gebitsverzorging</a><a href="/verzekering">Verzekering</a><a href="/voeding">Voeding</a><a href="/producten">Producten</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Gebitsverzorging & Tandsteen</p><span class="eyebrow">Preventieve Mondzorg 2026</span><h1>Tandsteen & Gebitsverzorging bij Honden</h1><p class="intro">Wist je dat ruim 80% van de honden ouder dan 3 jaar kampt met ontstoken tandvlees of ernstig tandsteen? Een professionele gebitsreiniging onder narcose kost al snel € 250,- tot € 600,-. Bereken hieronder het tandsteenrisico voor jouw hond.</p><div class="dental-calc"><div class="form-grid"><label>Formaat van de hond<select id="d-size"><option value="toy" selected>Toy / Klein ras (&lt; 8 kg, bijv. Pomeriaan, Maltezer, Teckel)</option><option value="med">Middelgroot ras (8 - 25 kg, bijv. Labradoodle, Spaniël)</option><option value="large">Groot ras (&gt; 25 kg, bijv. Golden Retriever, Herder)</option></select></label><label>Leeftijd van de hond<select id="d-age"><option value="1">Jonger dan 2 jaar</option><option value="2" selected>2 tot 5 jaar</option><option value="3">Ouder dan 5 jaar (Senior)</option></select></label><label class="full">Wordt het gebit regelmatig gepoetst of verzorgd?<select id="d-care"><option value="daily">Ja, wekelijks poetsen of natuurlijk zeewier door het voer</option><option value="chews" selected>Alleen af en toe kauwstaven / botten</option><option value="none">Nee, nog nooit aan gebitsverzorging gedaan</option></select></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="d-risk-res" style="color:#b91c1c">Hoog Risico</span></strong><span>Verwachte tandplak- & tandsteendruk</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong>€ 350,-</strong><span>Gemiddelde besparing per jaar bij preventie</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong>Ultrasoon</strong><span>Reiniging zonder narcose in de trimsalon</span></div></div></div><section class="guide-box"><h2>3 Gouden tips voor een fris en gezond hondengebit</h2><div class="steps-grid"><div class="step-card"><h3>1. Ultrasoon reinigen in de trimsalon</h3><p>Steeds meer trimsalons bieden de <strong>Emmi-Pet</strong> ultrasone reiniging aan. Zonder trillingen, geluid of verdoving trillen de geluidsgolven tandsteen los.</p></div><div class="step-card"><h3>2. Ascophyllum Nodosum (Zeewier)</h3><p>Een theelepeltje gedroogd zeewier over de dagelijkse voeding verandert de enzymen in het speeksel, waardoor tandplak zachter wordt en vanzelf loslaat.</p></div><div class="step-card"><h3>3. Natuurlijke gedroogde kophuid</h3><p>Kauwbotten van 100% runderkophuid werken als een natuurlijke flosdraad en reinigen mechanisch de achterste kiezen.</p></div></div></section></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>TrimGids Gebitswijzer. Raadpleeg bij loszittende tanden altijd direct je dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const dSize=document.getElementById('d-size');const dAge=document.getElementById('d-age');const dCare=document.getElementById('d-care');const dRisk=document.getElementById('d-risk-res');const updateDental=()=>{let score=2;if(dSize.value==='toy')score+=3;else if(dSize.value==='med')score+=1;if(dAge.value==='3')score+=3;else if(dAge.value==='2')score+=2;if(dCare.value==='none')score+=3;else if(dCare.value==='daily')score-=3;if(score>=6){dRisk.textContent='🚨 Hoog Risico';dRisk.style.color='#b91c1c';}else if(score>=4){dRisk.textContent='⚠️ Matig Risico';dRisk.style.color='#ea580c';}else{dRisk.textContent='✅ Laag Risico';dRisk.style.color='#166534';}};dSize.addEventListener('change',updateDental);dAge.addEventListener('change',updateDental);dCare.addEventListener('change',updateDental);updateDental();</script></body></html>`;
}

/* Standalone Afvallen & Dieet Calculator voor Honden */
function weightLossPage() {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hond Afvallen Calculator: Gezond Streefgewicht Berekenen | TrimGids</title><meta name="description" content="Heeft jouw hond overgewicht? Bereken het ideale calorietekort, streefgewicht en het veilige afvaltraject per week. Inclusief dieetadvies en voedingstips."><link rel="canonical" href="https://trimgids.nl/afvallen-hond"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Hoeveel mag een hond per week maximaal afvallen?","acceptedAnswer":{"@type":"Answer","text":"Een veilig en gezond gewichtsverlies bij honden ligt tussen de 1% en 1,5% van het huidige lichaamsgewicht per week. Sneller afvallen kan leiden tot spierverlies en leververvetting."}}]}</script><style>${directoryStyles()}${customModuleStyles()}.diet-calc{background:var(--cream);border:1px solid var(--line);border-radius:24px;padding:34px;margin:32px 0}</style></head><body><header><nav><a class="logo" href="/">🐾 TrimGids</a><div class="nav-links"><a href="/trimsalon">Trimsalons</a><a href="/afvallen-hond" style="color:var(--green);font-weight:700">⚖️ Afval Calculator</a><a href="/voeding">Gezonde Voeding</a><a href="/wandelen">Wandelroutes</a><a href="/verzekering">Verzekering</a><a href="/">Home</a></div><button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema"><span class="theme-icon">🌙</span></button></nav></header><main><p class="crumb"><a href="/">TrimGids</a> / Hond Afvallen Calculator</p><span class="eyebrow">Veterinair Gewichtsbeheer 2026</span><h1>Hond Afvallen: Bereken Streefgewicht & Portie</h1><p class="intro">Ruim 45% van de Nederlandse honden kampt met overgewicht, wat de levensverwachting met gemiddeld 2 jaar verkort en leidt tot artrose en suikerziekte. Bereken hieronder een verantwoord afvalplan op maat.</p><div class="diet-calc"><div class="form-grid"><label>Huidig gewicht (in kg)<input type="number" id="w-current" value="22" min="1" max="90" step="0.5"></label><label>Geschat ideaal streefgewicht (in kg)<input type="number" id="w-target" value="18" min="1" max="85" step="0.5"></label></div><div class="stats-row" style="margin-top:24px"><div class="stat-card"><strong><span id="res-loss-kg">4.0</span> kg</strong><span>Totaal af te vallen gewicht</span></div><div class="stat-card" style="border-left-color:var(--amber)"><strong><span id="res-weeks">16</span> weken</strong><span>Verwacht verantwoord afvaltraject</span></div><div class="stat-card" style="border-left-color:var(--green)"><strong><span id="res-diet-kcal">640</span> kcal</strong><span>Aanbevolen dagelijkse dieetcalorieën</span></div></div></div></main><footer>
  <div style="width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:18px">
    <a class="logo" href="/" style="font-size:20px">🐾 TrimGids</a>
    <div style="display:flex;gap:12px;font-size:13px;font-weight:600;flex-wrap:wrap">
      <a href="/trimsalon">Trimsalons</a>
      <a href="/kaart">Kaart</a>
      <a href="/hondenschool">Hondenscholen</a>
      <a href="/opvang">Opvang</a>
      <a href="/verzekering">Verzekering</a>
      <a href="/wandelen">Wandelen</a>
      <a href="/dierenarts-tarieven">Dierenarts Tarieven</a>
      <a href="/hondenbelasting">Hondenbelasting</a>
    </div>
  </div>
  <div style="width:100%;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12.5px;color:var(--text-muted)">
    <span>Afvaladvies is indicatief. Overleg bij ernstig overgewicht altijd met je dierenarts.</span>
    <span>© 2026 TrimGids · In samenwerking met <a href="https://routes.apexclusive.nl/wandelen/limburg" target="_blank" style="text-decoration:underline">routes.apexclusive.nl</a></span>
  </div>
</footer>
<script>
(function() {
  const theme = localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const nav = document.querySelector('.nav-links') || document.querySelector('nav');
  if (nav && !document.getElementById('ssr-theme-btn')) {
    const btn = document.createElement('button');
    btn.id = 'ssr-theme-btn';
    btn.type = 'button';
    btn.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-heading);padding:4px 10px;border-radius:9999px;font-size:13px;cursor:pointer;margin-left:8px;font-weight:700;display:inline-flex;align-items:center;gap:4px;';
    btn.innerHTML = theme === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    btn.onclick = function() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('trimgids_theme', cur);
      btn.innerHTML = cur === 'dark' ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg> Thema' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg> Thema';
    };
    nav.appendChild(btn);
  }
})();
</script><script>const wCur=document.getElementById('w-current');const wTar=document.getElementById('w-target');const rKg=document.getElementById('res-loss-kg');const rW=document.getElementById('res-weeks');const rKcal=document.getElementById('res-diet-kcal');const updateDiet=()=>{const cur=parseFloat(wCur.value)||20;const tar=parseFloat(wTar.value)||16;const loss=Math.max(0,cur-tar);const weeklySafe=cur*0.012;const weeks=weeklySafe>0?Math.ceil(loss/weeklySafe):0;const targetRer=70*Math.pow(tar,0.75);const dietKcal=Math.round(targetRer*1.0);rKg.textContent=loss.toFixed(1);rW.textContent=weeks;rKcal.textContent=dietKcal;};wCur.addEventListener('input',updateDiet);wTar.addEventListener('input',updateDiet);updateDiet();</script></body></html>`;
}

/* Ronde 10 — server-gerenderde vergelijkingstabellen op geldpagina's:
   zichtbaar voor crawlers én bezoekers zonder JS, met prijsvergelijking
   en best-value callout (bewezen conversieverhoger). */
function loadJsonLocal(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}
function tableForFoods() {
  const data = loadJsonLocal(foodFile);
  const foods = (data && (Array.isArray(data) ? data : data.foods)) || [];
  const rows = foods.map((f, i) => `<tr${i === 0 ? ' class="hl"' : ''}>
    <td>${i === 0 ? '<span class="best">Beste keuze</span><br>' : ''}<strong>${f.brand}</strong><br><small style="color:var(--muted)">${f.foodType}</small></td>
    <td>${f.rating.toFixed(1)} <small style="color:var(--muted)">(${f.reviewCount.toLocaleString('nl-NL')})</small></td>
    <td><strong>€ ${f.startingPricePerDay.toFixed(2)}</strong><br><small style="color:var(--muted)">per dag</small></td>
    <td>${f.discountOffer}</td>
    <td><a class="outline" style="padding:8px 14px;font-size:13px" href="${f.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bekijk deal ↗</a></td>
  </tr>`).join('');
  return `<section class="tip-box" id="voeding-vergelijker" style="margin-top:8px">
    <span class="eyebrow">Vergelijking in 1 oogopslag</span>
    <h2>Welk hondenvoer past bij jouw hond?</h2>
    <div style="overflow-x:auto"><table class="cmp-table">
      <thead><tr style="text-align:left"><th scope="col" style="padding:10px 12px">Aanbieder</th><th scope="col" style="padding:10px 12px">Score</th><th scope="col" style="padding:10px 12px">Prijs</th><th scope="col" style="padding:10px 12px">Actuele deal</th><th scope="col" style="padding:10px 12px"></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">Tarieven per dag voor een middelgrote hond; exacte prijs hangt af van gewicht, recept en regio. Korting geldt via bovenstaande partnerlinks.</p>
  </section>`;
}
function tableForDna() {
  const data = loadJsonLocal(dnaTestsFile);
  const tests = (data && (Array.isArray(data) ? data : data.tests)) || [];
  const rows = tests.map((t, i) => `<tr${i === 0 ? ' class="hl"' : ''}>
    <td>${i === 0 ? '<span class="best">Beste keuze</span><br>' : ''}<strong>${t.title}</strong><br><small style="color:var(--muted)">${t.provider}</small></td>
    <td>${t.rating.toFixed(1)} <small style="color:var(--muted)">(${t.reviewCount.toLocaleString('nl-NL')})</small></td>
    <td>${t.breedCount}</td>
    <td>${t.healthScreening}</td>
    <td><strong>€ ${t.salePrice.toFixed(2)}</strong><br><small style="color:var(--muted)">~~€ ${t.price.toFixed(2)}~~</small></td>
    <td style="white-space:nowrap">${t.turnaroundWeeks}</td>
    <td><a class="outline" style="padding:8px 14px;font-size:13px" href="${t.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bestel ↗</a></td>
  </tr>`).join('');
  return `<section class="tip-box" id="dna-vergelijker" style="margin-top:8px">
    <span class="eyebrow">Vergelijking in 1 oogopslag</span>
    <h2>DNA-testen naast elkaar</h2>
    <div style="overflow-x:auto"><table class="cmp-table">
      <thead><tr style="text-align:left"><th scope="col" style="padding:10px 12px">Test</th><th scope="col" style="padding:10px 12px">Score</th><th scope="col" style="padding:10px 12px">Rassen</th><th scope="col" style="padding:10px 12px">Gezondheid</th><th scope="col" style="padding:10px 12px">Prijs</th><th scope="col" style="padding:10px 12px">Uitslag</th><th scope="col" style="padding:10px 12px"></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">Doorlopend bijgewerkt; kortingsprijzen gelden via de partnerlinks.</p>
  </section>`;
}
function tableForInsurance() {
  const insurances = loadJsonLocal(insuranceFile) || [];
  const rows = insurances.map((i, n) => `<tr${n === 0 ? ' class="hl"' : ''}>
    <td>${n === 0 ? '<span class="best">Beste keuze</span><br>' : ''}<strong>${i.name}</strong><br><small style="color:var(--muted)">${i.logo} ${i.provider}</small></td>
    <td>${i.score.toFixed(1)}/10</td>
    <td><strong>€ ${i.startingPrice.toFixed(2)}</strong><br><small style="color:var(--muted)">/maand</small></td>
    <td>${i.avgYearPremium ? '€ ' + i.avgYearPremium : '—'} <small style="color:var(--muted)">gem./jr</small></td>
    <td>${i.maxPayoutPerYear}</td>
    <td>${i.covers && i.covers.hereditary ? '✅ Erfelijk' : '—'}</td>
    <td>${i.covers && i.covers.cancer ? '✅ Kanker' : '—'}</td>
    <td>${i.reimbursementPercent} vergoeding</td>
    <td><a class="outline" style="padding:8px 14px;font-size:13px;white-space:nowrap" href="${i.affiliateUrl}" target="_blank" rel="sponsored noopener noreferrer">Bereken premie ↗</a></td>
  </tr>`).join('');
  return `<section class="tip-box" id="verzekering-vergelijker" style="margin-top:8px">
    <span class="eyebrow">Vergelijking in 1 oogopslag</span>
    <h2>Hondenverzekeringen naast elkaar</h2>
    <div style="overflow-x:auto"><table class="cmp-table">
      <thead><tr style="text-align:left"><th scope="col" style="padding:10px 12px">Verzekeraar</th><th scope="col" style="padding:10px 12px">Score</th><th scope="col" style="padding:10px 12px">Premie</th><th scope="col" style="padding:10px 12px">Gem. per jaar</th><th scope="col" style="padding:10px 12px">Jaarmaximum</th><th scope="col" style="padding:10px 12px">Erfelijk</th><th scope="col" style="padding:10px 12px">Kanker</th><th scope="col" style="padding:10px 12px">Vergoeding</th><th scope="col" style="padding:10px 12px"></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">Scores van de Keuze.nl-test huisdierenverzekeringen (juli 2026); jaargemiddelden uit hetzelfde onderzoek. Vanaf-premies zijn de laagste instap met eigen risico en kunnen per ras, leeftijd, postcode en dekking flink afwijken van geadverteerde prijzen (bijv. verzekeringen365.nl) — vergelijk daarom altijd je exacte premie.</p>
  </section>`;
}

function directoryStyles() {
  return `:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --card-subtle: #f8fafc;
  --popover: #ffffff;
  --popover-foreground: #09090b;
  --primary: #0f3e28;
  --primary-hover: #092819;
  --primary-light: #eaf4ee;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --brand-emerald: #10b981;
  --brand-emerald-light: rgba(16, 185, 129, 0.12);
  --brand-amber: #d97706;
  --brand-amber-light: #fef3c7;
  --destructive: #ef4444;
  --destructive-light: #fee2e2;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --border-subtle: #f1f5f9;
  --input: #e2e8f0;
  --ring: #10b981;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
  --shadow-hover: 0 14px 34px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
  --shadow-floating: 0 20px 45px -10px rgba(15, 62, 40, 0.12), 0 8px 20px -4px rgba(0, 0, 0, 0.04);
  --max-width: 1200px;

  /* Aliases for backwards compatibility */
  --bg-page: var(--background);
  --bg-card: var(--card);
  --bg-card-alt: var(--card-subtle);
  --bg-nav: rgba(255, 255, 255, 0.92);
  --text-heading: var(--foreground);
  --text-body: #334155;
  --text-muted: var(--muted-foreground);
  --border-color: var(--border);
  --brand-primary: var(--primary);
  --brand-primary-hover: var(--primary-hover);
  --brand-light: var(--primary-light);
  --brand-accent: var(--brand-amber);
  --brand-accent-light: var(--brand-amber-light);
  --brand-danger: var(--destructive);
  --brand-danger-light: var(--destructive-light);
  --green: var(--primary);
  --green-light: var(--primary-light);
  --green-dark: var(--primary-hover);
  --green-d: var(--primary-hover);
  --amber: var(--brand-amber);
  --amber-light: var(--brand-amber-light);
  --ink: var(--foreground);
  --ink-2: #334155;
  --line: var(--border);
  --cream: var(--card-subtle);
}

[data-theme="dark"], .dark {
  --background: #090d0b;
  --foreground: #f8fafc;
  --card: #111814;
  --card-foreground: #f8fafc;
  --card-subtle: #16221c;
  --popover: #111814;
  --popover-foreground: #f8fafc;
  --primary: #10b981;
  --primary-hover: #059669;
  --primary-light: rgba(16, 185, 129, 0.15);
  --primary-foreground: #090d0b;
  --secondary: #1a2720;
  --secondary-foreground: #f8fafc;
  --muted: #16221c;
  --muted-foreground: #94a3b8;
  --accent: #1a2720;
  --accent-foreground: #f8fafc;
  --brand-emerald: #34d399;
  --brand-emerald-light: rgba(52, 211, 153, 0.15);
  --brand-amber: #fbbf24;
  --brand-amber-light: rgba(251, 191, 36, 0.15);
  --destructive: #f87171;
  --destructive-light: rgba(248, 113, 113, 0.15);
  --destructive-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --input: rgba(255, 255, 255, 0.12);
  --ring: #10b981;
  --shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-card: 0 4px 24px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-hover: 0 14px 36px -4px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.15);
  --shadow-floating: 0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.2);

  --bg-page: var(--background);
  --bg-card: var(--card);
  --bg-card-alt: var(--card-subtle);
  --bg-nav: rgba(9, 13, 11, 0.92);
  --text-heading: var(--foreground);
  --text-body: #e2e8f0;
  --text-muted: var(--muted-foreground);
  --border-color: var(--border);
  --brand-primary: var(--primary);
  --brand-primary-hover: var(--primary-hover);
  --brand-light: var(--primary-light);
  --brand-accent: var(--brand-amber);
  --brand-accent-light: var(--brand-amber-light);
  --brand-danger: var(--destructive);
  --brand-danger-light: var(--destructive-light);
  --green: var(--primary);
  --green-light: var(--primary-light);
  --green-dark: var(--primary-hover);
  --green-d: var(--primary-hover);
  --amber: var(--brand-amber);
  --amber-light: var(--brand-amber-light);
  --ink: var(--foreground);
  --ink-2: #e2e8f0;
  --line: var(--border);
  --cream: var(--card-subtle);
}


/* Custom Slim Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--background); }
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 9999px;
  border: 2px solid var(--background);
}
::-webkit-scrollbar-thumb:hover { background: var(--brand-emerald); }
* { scrollbar-width: thin; scrollbar-color: var(--border) var(--background); }

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--text-body);
  font: 16px/1.6 'Plus Jakarta Sans', Inter, system-ui, sans-serif;
  background: var(--bg-page);
  transition: background-color 0.25s ease, color 0.25s ease;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--text-heading);
}

h1 { font-size: clamp(30px, 4.2vw, 48px); font-weight: 800; max-width: 920px; margin: 16px 0 18px; }
h2 { font-size: clamp(22px, 2.8vw, 32px); font-weight: 800; margin: 12px 0 12px; }
p, li, span, label, td { color: var(--text-body); }
a { color: inherit; text-decoration: none; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--brand-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.wrap, main, nav, footer { max-width: var(--max-width); margin: auto; }

header {
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-nav);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
}
nav {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 16px;
}
.nav-links { display: flex; gap: 8px; font-size: 13.5px; font-weight: 600; align-items: center; flex-wrap: wrap; }
.nav-links a {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  transition: all 0.18s ease;
}
.nav-links a:hover {
  background: var(--bg-card-alt);
  color: var(--brand-primary);
}
.logo {
  color: var(--text-heading);
  font: 800 20px 'Plus Jakarta Sans', system-ui, sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.055em;
}
.logo::before {
  content: '';
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  background: url('/logo.svg?v=3') center / contain no-repeat;
  filter: drop-shadow(0 5px 10px rgba(16, 185, 129, .2));
}

.crumb { color: var(--text-muted); font-size: 13.5px; margin-bottom: 24px; }
.crumb a { text-decoration: underline; text-underline-offset: 3px; }
main { padding: 40px 20px 80px; }
.intro { max-width: 840px; color: var(--text-muted); font-size: 17.5px; line-height: 1.6; margin-bottom: 24px; }

.btn, button.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  background: var(--brand-primary);
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}
.btn:hover {
  background: var(--brand-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 24px 0 36px;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
}
.stat-card:hover { border-color: var(--brand-primary); transform: translateY(-2px); }
.stat-card strong { font-size: 28px; font-weight: 800; color: var(--brand-primary); display: block; font-family: Fraunces, Georgia, serif; }
.stat-card span { font-size: 13px; color: var(--text-muted); font-weight: 600; margin-top: 4px; display: block; }

.guide-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 36px;
  margin: 40px 0;
  box-shadow: var(--shadow-card);
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.step-card {
  background: var(--bg-card-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.step-card h3 { font-size: 18px; margin-bottom: 8px; }
.step-card p { font-size: 14px; color: var(--text-muted); line-height: 1.5; }

.next {
  margin: 50px 0 30px;
  padding: 36px;
  background: var(--bg-card-alt);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}
.next-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.next-links a {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 14px 18px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
}
.next-links a:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

footer {
  border-top: 1px solid var(--border-color);
  padding: 40px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13.5px;
  color: var(--text-muted);
}
footer a { font-weight: 700; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 14px; color: var(--text-heading); }
`;
}

function customModuleStyles() {
  return `
  .interactive-card, .ins-card, .dna-card, .food-card, .provider-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 28px;
    box-shadow: var(--shadow-card);
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease;
    position: relative;
  }
  .interactive-card:hover, .ins-card:hover, .dna-card:hover, .food-card:hover, .provider-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    border-color: var(--brand-primary);
  }
  .table-responsive {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 1.5rem 0;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    text-align: left;
    background: var(--bg-card);
  }
  .data-table th, .data-table td {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }
  .data-table th {
    background: var(--bg-card-alt);
    font-weight: 800;
    color: var(--text-heading);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .data-table tbody tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover td { background: var(--brand-light); }
  .badge-tag, .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    background: var(--brand-light);
    color: var(--brand-primary);
    border: 1px solid transparent;
  }
  .badge-tag.amber, .badge-a { background: var(--brand-accent-light); color: var(--brand-accent); }
  .badge-tag.red, .badge-red { background: var(--brand-danger-light); color: var(--brand-danger); }
  .price-highlight {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--brand-primary);
    font-family: Fraunces, Georgia, serif;
  }
  .calc-result-box {
    background: linear-gradient(135deg, var(--brand-light), var(--bg-card));
    border: 2px solid var(--brand-primary);
    border-radius: var(--radius-xl);
    padding: 28px;
    margin-top: 24px;
    text-align: center;
    box-shadow: var(--shadow-card);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .form-grid label {
    display: grid;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-heading);
  }
  .form-grid input, .form-grid select {
    width: 100%;
    height: 44px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-heading);
    font-family: inherit;
    font-size: 14.5px;
    outline: none;
    transition: all 0.2s ease;
  }
  .form-grid input:focus, .form-grid select:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px var(--brand-light);
  }
  `;
}

function notFoundPage() {
  /* Ronde 10: 404 gebruikt dezelfde universele shell als alle andere pagina's. */
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pagina niet gevonden (404) | TrimGids</title><meta name="robots" content="noindex"><meta name="description" content="Deze pagina bestaat niet of is verplaatst — ga terug naar de TrimGids-homepage of gebruik de zoekbalk."><link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/site-chrome.css" id="tg-site-chrome"><style>body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg,#f8fafc);color:var(--ink,#0b1220);margin:0}a{color:var(--primary,#0f3e28);font-weight:800;text-decoration:none}main{padding:60px 0 80px}.box{max-width:560px;margin:0 auto;padding:44px 40px 40px;text-align:center;background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:var(--radius-xl,24px);box-shadow:var(--shadow-floating,0 20px 45px -10px rgba(15,62,40,.12))}h1{font-size:clamp(30px,4vw,40px);margin:0 0 10px;letter-spacing:-.02em;color:var(--foreground,#09090b)}.box p{color:var(--muted-foreground,#64748b);font-size:15px;line-height:1.6;margin:0 0 22px}.box .links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.box .links a{display:inline-flex;padding:11px 18px;border-radius:999px;background:var(--primary,#0f3e28);color:#fff}</style></head><body>${siteHeader()}<main><div class="box"><img src="/logo.svg?v=3" width="72" height="72" alt="TrimGids" style="margin:0 auto 18px"><h1>404 — Pagina niet gevonden</h1><p>Deze pagina bestaat (nog) niet of is verplaatst. Gebruik de zoekbalk in de header of ga terug naar de homepage.</p><div class="links"><a href="/">← Terug naar de homepage</a><a href="/opvang">Opvang &amp; hotels</a><a href="/verzekering">Hondenverzekering</a></div></div></main>${siteFooter()}</body></html>`;
}

const staticFileCache = new Map();
async function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) return json(res, 403, { error: 'forbidden' });
  try {
    const metadata = await stat(file);
    const cached = staticFileCache.get(file);
    let content;
    if (cached && cached.mtimeMs === metadata.mtimeMs && cached.size === metadata.size) {
      content = cached.buffer;
    } else {
      content = await readFile(file);
      staticFileCache.set(file, { mtimeMs: metadata.mtimeMs, size: metadata.size, buffer: content });
      if (staticFileCache.size > 64) {
        staticFileCache.delete(staticFileCache.keys().next().value);
      }
    }
    const extension = extname(file).toLowerCase();
    res.writeHead(200, secureHeaders({ 'Content-Type': mimeTypes[extension] || 'application/octet-stream', 'Cache-Control': extension === '.html' ? HTML_CACHE : 'public, max-age=31536000, immutable', 'Vary': 'Accept-Encoding' }));
    res.end(content);
  } catch {
    const requestedExt = extname(requested).toLowerCase();
    if (requestedExt) return json(res, 404, { error: 'not_found' });
    /* User-facing 404 HTML voor pagina-routes */
    res.writeHead(404, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }));
    return res.end(notFoundPage());
  }
}

const htmlPageCache = new Map();
const modernizeHtmlCache = new Map();

/* Schema.org-graf voor SEO-rich results (WebPage + BreadcrumbList + Org). */
function buildSiteSchema({ title, canonical = '/', description = '' }) {
  const crumbs = canonical.split('/').filter(Boolean);
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trimgids.nl/' },
      ...crumbs.map((part, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        item: 'https://trimgids.nl/' + crumbs.slice(0, i + 1).join('/')
      }))
    ]
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://trimgids.nl/#website',
        name: 'TrimGids',
        url: 'https://trimgids.nl/',
        inLanguage: 'nl-NL',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://trimgids.nl/trimsalon/{search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://trimgids.nl/#org',
        name: 'TrimGids Nederland',
        url: 'https://trimgids.nl/',
        logo: 'https://trimgids.nl/icon-512.png',
        sameAs: ['https://routes.apexclusive.nl/wandelen/limburg']
      },
      { '@type': 'WebPage', '@id': 'https://trimgids.nl' + canonical + '#webpage', url: 'https://trimgids.nl' + canonical, name: title, description, inLanguage: 'nl-NL', isPartOf: { '@id': 'https://trimgids.nl/#website' }, dateModified: '2026-09-06' },
      breadcrumb
    ]
  };
}

function modernizeGeneratedHtml(html) {
  const cached = modernizeHtmlCache.get(html);
  if (cached !== undefined) return cached;
  const transformed = modernizeGeneratedHtmlUncached(html);
  if (modernizeHtmlCache.size >= 64) {
    modernizeHtmlCache.delete(modernizeHtmlCache.keys().next().value);
  }
  modernizeHtmlCache.set(html, transformed);
  return transformed;
}

function modernizeGeneratedHtmlUncached(html) {
  const routeSkin = `<style>
    /* Ronde 10 — minimale legacy-compat: alleen wat de universele
       content-skin nog niet dekt (nieuwsgrid, live-ticker). */
    body > main { max-width: 1220px !important; margin: 0 auto !important; }
    body .news-ticker-wrap { max-width: 1180px; margin: 24px auto; border: 1px solid #e2e8f0 !important; border-radius: 18px !important; background: #fff !important; box-shadow: 0 8px 24px rgba(15,23,42,.06); }
    body #news-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
    body #news-grid .news-card { margin: 0 !important; padding: 22px !important; border: 1px solid #e2e8f0 !important; border-radius: 20px !important; background: #fff !important; box-shadow: 0 4px 20px rgba(15,23,42,.05) !important; }
    body #news-grid .news-card:hover { border-color: #10b981 !important; transform: translateY(-2px); }
    body #news-grid .news-card:first-child { background: linear-gradient(135deg,#0f3e28,#165b3c) !important; border-color: #0f3e28 !important; color: #fff !important; }
    body #news-grid .news-card:first-child h3, body #news-grid .news-card:first-child p, body #news-grid .news-card:first-child .news-foot { color: rgba(255,255,255,.86) !important; }
    body #news-grid .news-head { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    body #news-grid .news-body { color: #64748b !important; font-size: 14px !important; line-height: 1.6 !important; }
    @media (max-width: 760px) { body #news-grid { grid-template-columns: 1fr; } body .news-ticker-wrap { margin-left: 16px; margin-right: 16px; } }
  </style>`;
  const decodeEntities = value => String(value)
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  /* Ronde 10 — SEO-waarborg: geen geknipte SERP-titels (Google toont ~70 tekens)
     en geen afgekapte meta-descriptions op álle gegenereerde pagina's. */
  if (!html.includes('tg-seo-clamp')) {
    html = html
      .replace(/<title>([^<]*)<\/title>/, (m, t) => {
        const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const visible = decodeEntities(String(t)).trim();
        if (visible.length <= 70) return m;
        const base = visible.replace(/\s*[|·]\s*TrimGids.*$/i, '').trim();
        const out = (base.length + 11 <= 70) ? base + ' | TrimGids'
          : base.slice(0, 58).replace(/[\s,:;–-]+$/, '') + '… | TrimGids';
        return `<title>${esc(out)}</title>`;
      })
      .replace(/<meta name="description" content="([^"]*)">/, (m, d) => {
        const visible = decodeEntities(String(d)).trim();
        if (visible.length <= 160) return m;
        return `<meta name="description" content="${decodeEntities(visible.slice(0, 157).replace(/[\s,:;.]+$/, '') + '…')}">`;
      })
      .replace('</head>', '<!-- tg-seo-clamp --></head>');
  }
  /* Ronde 12 — premium-uitstraling: verwijder decoratieve emoji uit zichtbare
     HTML-tekst. Scripts, styles, textareas en templates (en tags/attributen) worden
     beschermd, zodat runtime-JS en formulierlabels intact blijven. */
  if (/[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u.test(html)) {
    const protectedChunks = [];
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<textarea\b[^>]*>[\s\S]*?<\/textarea>|<template\b[^>]*>[\s\S]*?<\/template>/gi, (m) => {
      protectedChunks.push(m);
      return `\u0000P${protectedChunks.length - 1}\u0000`;
    });
    const tagChunks = [];
    html = html.replace(/<[^>]*>/g, (m) => {
      tagChunks.push(m);
      return `\u0000T${tagChunks.length - 1}\u0000`;
    });
    html = html.replace(/[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/ {2,}/g, ' ');
    html = html.replace(/\u0000T(\d+)\u0000/g, (m, i) => tagChunks[+i]);
    html = html.replace(/\u0000P(\d+)\u0000/g, (m, i) => protectedChunks[+i]);
    html = html.replace(/> +([A-Za-z0-9€À-ÿ])/g, '>$1');
  }

  const pageTitle = decodeEntities(String((html.match(/<title>([^<]+)<\/title>/) || [])[1] || 'TrimGids').trim().replace(/\s*[|·]\s*TrimGids.*$/i, '').slice(0, 140));
  const canonicalMatch = html.match(/rel="canonical" href="([^"]+)"/);
  const canonical = decodeEntities(canonicalMatch ? canonicalMatch[1].replace(/^https:\/\/trimgids\.nl/, '') : '/');
  const saveAttr = JSON.stringify({ type: 'gids', id: canonical.replace(/^\//, '') || 'home', title: pageTitle, href: canonical })
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const disclosure = '<p class="route-disclosure">TrimGids toont bronnen, voorwaarden en partnerrelaties zo transparant mogelijk. Controleer actuele prijzen, beschikbaarheid en medische adviezen altijd bij de officiële aanbieder of dierenarts.</p>';
  /* Ronde 10 — universele homepage-shell: vervang elke legacy-header/footer door
     de exacte homepage-nav + -footer (één design system op alle pagina's). */
  if (!html.includes('id="tg-site-nav"')) {
    const legacyHeader = html.match(/<header>\s*<nav>[\s\S]*?<\/nav>\s*<\/header>/) || html.match(/<header>[\s\S]*?<\/header>/);
    if (legacyHeader) html = html.replace(legacyHeader[0], siteHeader());
    html = html.replace(/<footer>[\s\S]*?<\/footer>/, siteFooter());
    if (!html.includes('<footer')) html = html.replace('</body>', siteFooter() + '</body>');
  }
  html = html
    .replace('</head>', '<link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest">' + routeSkin + '</head>')
    .replace(/<main(?![^>]*id="main-content")/, disclosure + '<main id="main-content" tabindex="-1"')
    .replaceAll('🐾 TrimGids Pro', 'TrimGids Pro')
    .replaceAll('🐾 TrimGids', 'TrimGids')
    .replaceAll('}}loadIns();', '}};loadIns();')
    .replaceAll('}}loadDna();', '}};loadDna();')
    .replaceAll('}}loadFood();', '}};loadFood();')
    .replaceAll('Fraunces, Georgia, serif', 'Plus Jakarta Sans, system-ui, sans-serif')
    .replaceAll('Fraunces,Georgia,serif', 'Plus Jakarta Sans,system-ui,sans-serif')
    .replaceAll('Fraunces,serif', 'Plus Jakarta Sans, system-ui, sans-serif')
    .replaceAll('family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700', 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800')
    .replaceAll('family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600', 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800')
    .replace(/<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces[^"]*"[^>]*>/g, '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">')
    .replaceAll('✅ Minimaal Risico (Onder de 20 mg/kg)', 'Indicatieve lage dosis — geen vrijwaring')
    .replaceAll('De berekende dosis is laag. Meestal treden er geen ernstige klachten op. Zorg voor voldoende drinkwater.', 'Deze berekening is slechts een indicatie. Klachten, het soort product en het tijdstip van inname zijn belangrijker dan deze grenswaarde. Bel bij twijfel direct een dierenarts.')
    .replace(/(<a[^>]+href="https?:\/\/[^">]*(?:ref=trimgids|utm_source=trimgids)[^">]*"[^>]*)(>)/g, (match, opening, end) => opening.includes('rel=') ? opening.replace('rel="noopener noreferrer"', 'rel="sponsored noopener noreferrer"') + end : opening + ' rel="sponsored noopener noreferrer"' + end)
    .replaceAll("localStorage.getItem('trimgids_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')", "localStorage.getItem('trimgids_theme') || 'light'")
    .replaceAll('(data.insurance||[]).forEach((item,idx)=>{', "(data.insurance||[]).forEach((item,idx)=>{item.description=item.description||item.highlights?.[0]||'Bekijk de dekking en voorwaarden.';");

  /* Uniforme app-runtime op elke server-gegenereerde pagina:
     thema-bootstrap vóór de eerste paint + account/favorieten/thema-ui. */
    /* Ronde 14 — platform-gevoel: thema-kleur + kleurenschema voor scrollbars */
  if (!html.includes('theme-color')) {
    html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8"><meta name="theme-color" content="#0F3E28">');
  }
  if (!html.includes('color-scheme')) {
    html = html.replace('</head>', '<style id="tg-color-scheme">:root{color-scheme:light dark}</style></head>');
  }

if (!html.includes('tg-theme-boot')) {
    html = html.replace('</head>', '<script id="tg-theme-boot">try{var tgT=localStorage.getItem("trimgids_theme")||"light";document.documentElement.setAttribute("data-theme",tgT);}catch(e){}</script></head>');
  }
  if (!html.includes('tg-app-js')) {
    html = html.replace('</body>', '<script id="tg-app-js" src="/assets/js/app.js"></script></body>');
  }
  /* Ronde 11 — interactieve (mini)kaart op elke pagina met een data-nl-map-element. */
  if (html.includes('data-nl-map') && !html.includes('tg-nlmap-js')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/nl-map.css"><script id="tg-nlmap-js" src="/assets/js/nl-map.js" defer></script></head>');
  }
  /* Ronde 9 — chat-assistent TG op elke gegenereerde pagina (float-rood = laad-lazy). */
  if (!html.includes('tg-chatbot-js')) {
    html = html.replace('</body>', '<script id="tg-chatbot-js" src="/assets/js/chatbot.js" defer></script></body>');
  }
  /* OpenGraph-fallback: elke pagina zonder eigen og-tags krijgt de standaardbeeldset
     (net zo belangrijk voor click-through op social/WhatsApp als voor SEO). */
  if (!html.includes('property="og:image"')) {
    html = html.replace('</head>', '<meta property="og:type" content="website"><meta property="og:site_name" content="TrimGids"><meta property="og:title" content="' + pageTitle.replace(/"/g, '&quot;') + ' | TrimGids"><meta property="og:description" content="' + (String(html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/"/g, '&quot;').replace(/&amp;/g, '&') + '"><meta property="og:url" content="https://trimgids.nl' + canonical + '"><meta property="og:locale" content="nl_NL"><meta property="og:image" content="https://trimgids.nl/assets/img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + pageTitle.replace(/"/g, '&quot;') + ' | TrimGids"><meta name="twitter:description" content="' + (String(html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/"/g, '&quot;').replace(/&amp;/g, '&') + '"><meta name="twitter:image" content="https://trimgids.nl/assets/img/og.jpg"></head>');
  }

  /* SEO-rich-resultaten: WebPage + BreadcrumbList + Organization + WebSite
     op elke gegenereerde pagina (grote CTR- en rankingskans). */
  if (!html.includes('tg-ld-json')) {
    const ls = html.includes('tg-ld-page') ? '' :
      `<script id="tg-ld-json" type="application/ld+json">${JSON.stringify(buildSiteSchema({ title: pageTitle, canonical, description: String((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&') }))}</script>`;
    if (ls) html = html.replace('</head>', ls + '</head>');
  }
  /* Nieuwsbrief in elke legacy-footer (mits pagina er zelf geen heeft). */
  if (!html.includes('data-tg-newsletter')) {
    const nlBlock = '<div class="tg-newsletter" id="tg-newsletter" data-tg-newsletter><div class="tg-newsletter-in"><div><strong>💌 Gratis deal- & kennisbrief</strong><p>Eén keer per week: beste hondendeals, verzekeringstips en nieuwe wandelroutes. Altijd gratis, nooit spam.</p></div><form class="tg-newsletter-form"><input type="email" name="email" maxlength="120" placeholder="jouw@email.nl" aria-label="E-mailadres voor de nieuwsbrief" required><input type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" hidden><button type="submit" class="tg-newsletter-btn">Aanmelden →</button></form><p class="tg-newsletter-ok" hidden>✅ Bedankt! Je staat op de lijst — check je inbox.</p><p class="tg-newsletter-legal">Meld je aan voor updates. Uitschrijven kan altijd; we gebruiken je adres alleen voor de TrimGids-brief.</p></div></div>';
    if (html.includes('</footer>')) html = html.replace('</footer>', nlBlock + '</footer>');
  }
  /* Prestaties: niet-critische afbeeldingen lazy laden (+ async decoding). */
  if (!html.includes('tg-lazy-css')) {
    html = html.replace(/<img (?![^>]*loading=)(?![^>]*fetchpriority="high")/g, '<img loading="lazy" decoding="async" ');
    html = html.replace('</head>', '<style id="tg-lazy-css">.section,.card{content-visibility:auto;contain-intrinsic-size:auto 720px}</style></head>');
  }

  /* Shell + content-skin als LAATSTE elementen van <head>: zo winnen ze de
     cascade van álle pagina-CSS (directoryStyles/customModuleStyles enz.). */
  {
    const tailSkin =
      (html.includes('id="tg-site-chrome"') ? '' : '<link rel="stylesheet" href="/assets/css/site-chrome.css?v=15" id="tg-site-chrome">') +
      (html.includes('id="tg-content-skin"') ? '' : '<link rel="stylesheet" href="/assets/css/content-skin.css?v=15" id="tg-content-skin">');
    if (tailSkin) html = html.replace('</head>', tailSkin + '</head>');
  }

  /* Core Web Vitals beacon op elke gegenereerde pagina (anoniem, compact) */
  if (!html.includes('tg-cwv-js')) {
    html = html.replace('</body>', '<script id="tg-cwv-js">/*tg-cwv-js*/try{let lcp=0,cls=0,inp=0,tt=0,p=performance.getEntriesByType("navigation")[0];if(p)tt=Math.round(p.responseStart);new PerformanceObserver(l=>{const e=l.getEntries();if(e.length)lcp=Math.round(e[e.length-1].startTime)}).observe({type:"largest-contentful-paint",buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)cls+=e.value}).observe({type:"layout-shift",buffered:true});const io=new PerformanceObserver(l=>{const e=l.getEntries();if(e.length)inp=Math.round(e[e.length-1].duration)});io.observe({type:"event",durationThreshold:40,buffered:true});addEventListener("pagehide",()=>{const b=JSON.stringify({lcp:lcp||undefined,cls:+cls.toFixed(4),inp:inp||undefined,ttfb:tt||undefined,url:location.pathname,device:matchMedia("(pointer:coarse)").matches?"mobile":"desktop"});if(navigator.sendBeacon)navigator.sendBeacon("/api/beacon",b);else fetch("/api/beacon",{method:"POST",headers:{"Content-Type":"application/json"},body:b,keepalive:true}).catch(()=>{})})}catch(e){}</script></body>');
  }
  return html;
}

await loadDotEnv();
googleKey = process.env.GOOGLE_PLACES_API_KEY || '';
adminToken = process.env.ADMIN_TOKEN || '';
supabaseUrl = process.env.SUPABASE_URL || '';
supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (dbEnabled()) console.log('Supabase storage adapter actief (quote_requests, provider_claims, provider_reviews).');
try { catalog = JSON.parse(await readFile(catalogFile, 'utf8')); } catch (error) { console.error('Catalogus kon niet worden geladen:', error.message); }
try { routesData = JSON.parse(await readFile(routesFile, 'utf8')); } catch (error) { console.error('Routes konden niet worden geladen:', error.message); }
try { insuranceData = JSON.parse(await readFile(insuranceFile, 'utf8')); } catch (error) { console.error('Verzekeringen konden niet worden geladen:', error.message); }
try { productsData = JSON.parse(await readFile(productsFile, 'utf8')); } catch (error) { console.error('Producten konden niet worden geladen:', error.message); }
try { lastMinuteData = JSON.parse(await readFile(lastMinuteFile, 'utf8')); } catch (error) { console.error('Last-minute slots konden niet worden geladen:', error.message); }
try { dnaTestsData = JSON.parse(await readFile(dnaTestsFile, 'utf8')); } catch (error) { console.error('DNA tests konden niet worden geladen:', error.message); }
try { foodData = JSON.parse(await readFile(foodFile, 'utf8')); } catch (error) { console.error('Voeding data kon niet worden geladen:', error.message); }
try { emergencyVetsData = JSON.parse(await readFile(emergencyVetsFile, 'utf8')); } catch (error) { console.error('Spoedartsen data kon niet worden geladen:', error.message); }
try { puppyCostsData = JSON.parse(await readFile(puppyCostsFile, 'utf8')); } catch (error) { console.error('Puppykosten data kon niet worden geladen:', error.message); }

/* ------------------------------------------------------------------ */
/*  Ronde 9 — site-zoekindex (statisch, wordt live doorzocht door      */
/*  /api/sitesearch, de header-zoekbalk en de /zoek-pagina).           */
/* ------------------------------------------------------------------ */
const SITE_INDEX = [
  { icon: '🏠', t: 'Home — trim & zorg gids voor honden', u: '/', k: 'home start trimmen verzorgen hond gids' },
  { icon: '✂️', t: 'Trimsalons in jouw buurt', u: '/trimsalon', k: 'trimsalon hond knippen trimmen vacht verzorging kapper' },
  { icon: '🗺️', t: 'Interactieve kaart (canvas)', u: '/kaart', k: 'kaart interactief Nederland trimsalon hondenschool opvang wellness losloopgebied' },
  { icon: '🎓', t: 'Hondenscholen & cursussen', u: '/hondenschool', k: 'hondenschool training cursus puppy gehoorzaamheid gedrag' },
  { icon: '🏨', t: 'Opvang, pension & dagopvang', u: '/opvang', k: 'opvang pension dagopvang hotel hond vakantie' },
  { icon: '💆', t: 'Wellness, hydrotherapie & fysio', u: '/wellness', k: 'wellness hydrotherapie fysiotherapie massage hond' },
  { icon: '🌲', t: 'Losloopgebieden & wandelen', u: '/wandelen', k: 'wandelen losloopgebied hondenstrand route bos' },
  { icon: '🛡️', t: 'Beste hondenverzekering 2026', u: '/verzekering', k: 'verzekering premie hondenverzekering vergelijken dekking figo unive ohra petsecur kosten' },
  { icon: '🧬', t: 'DNA-test voor honden', u: '/dna-test', k: 'dna test raszuiverheid erfelijk health ancestry vergelijken' },
  { icon: '🥩', t: 'Verse hondenvoeding & deals', u: '/voeding', k: 'voeding vers maaltijd brok graanvrij butternut farm food deals' },
  { icon: '🚨', t: 'Spoeddierenarts bij jou', u: '/spoed-dierenarts', k: 'spoed dierenarts spoedkliniek avond weekend nacht nood' },
  { icon: '📈', t: 'Wat kost een hond? (calculator)', u: '/kosten-hond', k: 'kosten hond per jaar maand calculator budget uitgaven' },
  { icon: '💰', t: '10 slimme bespaartips', u: '/honden-bespaartips', k: 'besparen bespaartips geld kosten hond goedkoop' },
  { icon: '📰', t: 'Landelijk hondennieuws', u: '/nieuws', k: 'nieuws hond alerts wetgeving gemeente landelijk' },
  { icon: '🔎', t: 'Vermiste honden', u: '/vermist', k: 'vermist vermist hond gevonden zoeken' },
  { icon: '💶', t: 'Hondenbelasting per gemeente 2026', u: '/hondenbelasting', k: 'hondenbelasting belasting gemeente tarief 2026 afgeschaft' },
  { icon: '💬', t: 'Hondenforum & community', u: '/forum', k: 'forum community vragen chat hondenbaasjes' },
  { icon: '🦮', t: 'Dienst- & hulphonden', u: '/hulphonden', k: 'hulphonden diensthond geleidehond politiehond assistentie' },
  { icon: '🔬', t: 'Zintuigen & taal van de hond', u: '/zintuigen', k: 'zintuigen snuffelen gehoor reuk hondentaal communicatie' },
  { icon: '🐕', t: 'Erkende fokkers vinden', u: '/fokkers', k: 'fokker fokkers erkend puppy stamboom rassen' },
  { icon: '📖', t: 'Aankoopgids per ras', u: '/aankoopgids', k: 'aankoopgids puppy kopen ras kiezen fokker asiel' },
  { icon: '💼', t: 'Vacatures in de hondenbranche', u: '/vacatures', k: 'vacatures baan werk trimsalon hondenuitlater asiel' },
  { icon: '🤝', t: 'Vrijwilligerswerk bij asiel & opvang', u: '/vrijwilligers', k: 'vrijwilligerswerk vrijwilliger asiel opvang hulp' },
  { icon: '🏡', t: 'Adoptie: pup of asielhond?', u: '/adoptie', k: 'adoptie asielhond herplaatsing pup asiel' },
  { icon: '🚨', t: 'Hond gevonden? Wat nu?', u: '/hond-gevonden', k: 'hond gevonden gevonden vermist aanmelden politie chip' },
  { icon: '✈️', t: 'Vliegen & reizen met je hond', u: '/reizen', k: 'reizen vliegen auto hond vakantie EU paspoort' },
  { icon: '🧾', t: 'Rassen & variëteiten', u: '/rassen', k: 'rassen hondenrassen variëteiten lijst afmetingen karakter' },
  { icon: '⚖️', t: 'Verboden rassen in NL & wereld', u: '/verboden-rassen', k: 'verboden rassen pitbull lijst wetgeving agressief' },
  { icon: '💩', t: 'Poepzakjes & boetes', u: '/poepzakjes', k: 'poepzakjes opruimen boete uitlaatplaatsen hondenpoep' },
  { icon: '🧠', t: 'Hypoallergeen, leeftijd & slimheid', u: '/hondenweetjes', k: 'hypoallergeen honden leeftijd slimheid intelligentie hondenjaren' },
  { icon: '🏆', t: 'Hondenwedstrijden & sport', u: '/hondenwedstrijden', k: 'wedstrijden sport agility show gehoorzaamheid' },
  { icon: '💉', t: 'Chip & ontwormen', u: '/chippen-ontwormen', k: 'chip chippen ontwormen ontworming vaccinatie RVV' },
  { icon: '🤮', t: 'Mijn hond braakt: wat nu?', u: '/braken-hond', k: 'braken overgeven braakt maag diarree wanneer arts' },
  { icon: '🔥', t: 'Hitteberoerte & hete auto', u: '/hitteberoerte-hond', k: 'hitteberoerte hete auto zomer oververhitting nood' },
  { icon: '🌍', t: 'Zwerfhonden wereldwijd', u: '/zwerfhonden', k: 'zwerfhonden straathonden aantal opvang wereld' },
  { icon: '📊', t: 'Honden in cijfers Nederland', u: '/honden-cijfers', k: 'cijfers statistieken aantal honden Nederland 2026' },
  { icon: '📜', t: 'Geschiedenis van de hond', u: '/geschiedenis-hond', k: 'geschiedenis wolf domesticatie evolutie hond' },
  { icon: '👑', t: 'Honden van royals', u: '/koninklijke-honden', k: 'royals koningshuis koninklijke honden labrador corgi' },
  { icon: '💼', t: 'Hond & fulltime werken', u: '/hond-en-werk', k: 'werk fulltime alleen zijn uitlaatservice dagopvang roedel' },
  { icon: '🐾', t: 'Webshop: voer, reis & tools', u: '/webshop', k: 'webshop shop voer snacks kauwsticks borstel verzekering producten affiliate' },
  { icon: '⚡', t: 'Last-minute deals trimsalon', u: '/last-minute', k: 'last minute deal korting annulering trimsalon aanbieding' },
  { icon: '📝', t: 'Gratis offerte aanvragen', u: '/offerte', k: 'offerte aanvragen prijs vergelijken lokale salon school' },
  { icon: '🩺', t: 'Dierenarts tarieven 2026', u: '/dierenarts-tarieven', k: 'dierenartstarieven consult vaccinatie kosten tarieven 2026' },
  { icon: '🍫', t: 'Gif- & chocoladecheck', u: '/giftigheid-calculator', k: 'giftig chocolade druif ui vergiftiging calculator gevaarlijk' },
  { icon: '🐶', t: 'Puppymatcher', u: '/puppy-kiezen', k: 'puppy kiezen matcher ras kiezen kopen' },
  { icon: '🎂', t: 'Hondenleeftijd calculator', u: '/leeftijd-calculator', k: 'leeftijd calculator hondenjaren leeftijd omrekenen' },
  { icon: '🚑', t: 'EHBO-noodgids voor honden', u: '/ehbo-hond', k: 'ehbo eerste hulp noodgids reanimatie verstikking wond' },
  { icon: '🏥', t: 'Spoeddierenartsen & klinieken', u: '/spoed-dierenarts', k: 'spoed kliniek dierenarts 24 uur nood' },
  { icon: '🏢', t: 'Voor bedrijven: TrimGids Pro', u: '/bedrijven', k: 'bedrijven pro partner claimen adverteren salon school' },
  { icon: '💵', t: 'Trimsalon-omzet calculator', u: '/trimsalon-inkomsten-calculator', k: 'omzet inkomsten calculator trimsalon geld verdienen' },
  { icon: '📍', t: 'Trimmer voor Pomeriaan', u: '/trimsalon/pomeriaan', k: 'pomeriaan dwergkeeshond trimmen knippen care' },
  { icon: '📍', t: 'Trimmer voor Labradoodle', u: '/trimsalon/labradoodle', k: 'labradoodle trimmen knippen modelcoupe vacht' },
  { icon: '📍', t: 'Trimmer voor Maltezer', u: '/trimsalon/maltezer', k: 'maltezer boomer trimmen knippen' },
  { icon: '📍', t: 'Trimmer voor Shih Tzu', u: '/trimsalon/shih-tzu', k: 'shih tzu trimmen knippen vacht' },
  { icon: '💼', t: 'Hond & uitlaatservice', u: '/hond-en-werk', k: 'uitlaatservice uitlaten wandelen overdag' },
  { icon: '🏝️', t: 'Hondenstranden', u: '/wandelen', k: 'strand hondenstrand zwemmen water losloop' },
  { icon: '📅', t: 'Puppy wenbezoek trimsalon', u: '/trimsalon', k: 'puppy wenbezoek wennen eerste keer trimmen' },
  { icon: '🪮', t: 'Ontwollen & ruiverzorging', u: '/trimsalon', k: 'ontwollen ruien ruiverzorging onderwacht blazen' },
  { icon: '🧼', t: 'Hond wassen & shampoo', u: '/webshop', k: 'wassen shampoo bad hypoallergeen verzorging product' },
  { icon: '🍖', t: 'Hypoallergeen voer', u: '/webshop', k: 'hypoallergeen allergie voeding overgevoelig huid jeuk' },
  { icon: '🚗', t: 'Autotuig & reisveiligheid', u: '/webshop', k: 'autotuig harnas crashgetest reizen veiligheid auto' },
  { icon: '🔉', t: 'Gebitsverzorging hond', u: '/gebitsverzorging-hond', k: 'gebit tanden poetsen tandsteen kauwstick mondhygiëne' }
];

function searchSiteIndex(q, limit = 8) {
  const query = String(q || '').toLowerCase().trim();
  if (!query) return [];
  const tokens = query.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const item of SITE_INDEX) {
    const hay = (item.t + ' ' + item.k + ' ' + item.u).toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (item.t.toLowerCase().includes(token)) score += 12;
      if (item.u.toLowerCase().includes(token)) score += 8;
      for (const word of (item.k || '').split(/\s+/)) {
        if (word.startsWith(token) || token.startsWith(word)) score += 5;
      }
      if (hay.includes(token)) score += 2;
    }
    if (score > 0) scored.push({ ...item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ icon, t, u }) => ({ icon, title: t, url: u, type: 'gids' }));
}

/* Ronde 9 — /zoek-pagina (snel, noindex, live resultaten) */
function searchPage(q = '') {
  const query = clean(q, 80);
  const initial = searchSiteIndex(query, 8);
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zoeken: ${escapeHtml(query || 'alles')} | TrimGids</title><meta name="description" content="Zoek direct in de complete TrimGids: trimsalons, rassen, verzekeringen, kosten, regels en meer."><link rel="canonical" href="https://trimgids.nl/zoek"><meta name="robots" content="noindex, follow"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"><style>
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f8fafc;color:#0b1220;margin:0;line-height:1.6}
header{background:#07150e;color:#fff;padding:18px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
header a{color:#fff;text-decoration:none;font-weight:800;font-size:17px}
.wrap{max-width:960px;margin:0 auto;padding:30px 20px}
h1{font-size:30px;letter-spacing:-.02em;margin:0 0 6px}
.sub{color:#64748b;margin:0 0 22px}
form{display:flex;gap:10px;margin-bottom:26px}
form input{flex:1;padding:15px 18px;border:2px solid #e2e8f0;border-radius:16px;font:inherit;font-size:16px}
form input:focus{outline:none;border-color:#10b981}
form button{background:#0f3e28;color:#fff;border:0;border-radius:16px;padding:0 26px;font:inherit;font-weight:800;cursor:pointer}
.res{display:grid;gap:10px}
.r{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px 18px;text-decoration:none;color:inherit;transition:transform .15s,box-shadow .15s}
.r:hover{transform:translateY(-2px);box-shadow:0 12px 30px -12px rgba(2,32,19,.18)}
.r .i{font-size:24px;background:#eaf4ee;border-radius:12px;width:46px;height:46px;display:grid;place-items:center;flex:none}
.r b{font-size:16px}
.r small{display:block;color:#64748b;font-size:13px}
.more{color:#64748b;margin-top:16px;font-size:14px}
@media(max-width:620px){form{flex-direction:column}form button{padding:14px}}
</style></head><body><header><a href="/">🐾 TrimGids</a><span style="font-weight:400;font-size:13px;color:#a7f3d0">Zoeken</span></header><main class="wrap">
<h1>${query ? `Resultaten voor “${escapeHtml(query)}”` : 'Waar zoek je naar?'}</h1>
<p class="sub">${query ? 'De beste pagina’s binnen TrimGids, direct uit onze gids-index.' : 'Typ een onderwerp — bijv. “trimsalon”, “verzekering”, “hitteberoerte” of “kosten”.'}</p>
<form action="/zoek" method="get" role="search"><input type="search" name="q" value="${escapeHtml(query)}" placeholder="Zoek bijvoorbeeld: hondenbelasting, hitteberoerte, verzekering…" aria-label="Zoek in TrimGids" autofocus><button type="submit">Zoeken</button></form>
<div class="res" id="results">${initial.map(r => `<a class="r" href="${r.url}"><span class="i">${r.icon}</span><span><b>${escapeHtml(r.title)}</b><small>${r.url}</small></span></a>`).join('') || '<p class="more">Geen directe match. Probeer een breder woord of gebruik de zoekbalk in de header.</p>'}</div>
<p class="more">💡 Tip: gebruik <kbd>Ctrl</kbd>+<kbd>K</kbd> op elke pagina om direct te zoeken, of stel een vraag aan onze assistent (knop rechtsonder).</p>
</main><script id="tg-search-page">const wrap=document.getElementById('results');const input=document.querySelector('form input');let t;input.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(async()=>{const v=input.value.trim();if(!v){return;}try{const r=await fetch('/api/sitesearch?q='+encodeURIComponent(v));const d=await r.json();wrap.innerHTML=(d.results||[]).map(x=>'<a class="r" href="'+x.url+'"><span class="i">'+x.icon+'</span><span><b>'+x.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</b><small>'+x.url+'</small></span></a>').join('')||'<p class="more">Geen resultaten. Probeer een breder woord.</p>';}catch(e){}},220);});</script></body></html>`;
}

/* ------------------------------------------------------------------ */
/*  Ronde 9 — chatbot: kennisbank (altijd beschikbaar, geen key nodig) */
/*  + optioneel echte AI via OPENAI_API_KEY (.env).                    */
/* ------------------------------------------------------------------ */
const KB = [
  { rx: /(beste|welke).*(verzeker|verzekering)|verzeker.+aanraad|figo|unive|ohra|petsecur/i, a: 'In de Keuze.nl-test van juli 2026 scoort **Figo 9,3/10** het hoogst (geen leeftijdsgrens, HD/ED, erfelijk en kanker in de basis, vanaf ±€11,95/mnd). Univé 8,4 is het beste alternatief voor grote rekeningen, OHRA 8,2 het meest gekozen. Bekijk de volledige vergelijking en bereken direct je premie.', links: [{ label: '🛡️ Vergelijk verzekeringen 2026', url: '/verzekering' }] },
  { rx: /premie|kosten.*verzeker|verzeker.*kost|maand.*verzeker/i, a: 'De laagste vanafprijs is **€11,95 per maand** (Figo); gemiddeld betaal je ±€176–315 per jaar, afhankelijk van ras, leeftijd en dekking. Een verzekering loont vooral bij erfelijke aandoeningen: een kruisbandoperatie kost al snel €2.500–4.500.', links: [{ label: '💰 Bereken je premie', url: '/verzekering' }] },
  { rx: /braak|braakt|overgeef|spuug|kotst|diarree/i, a: 'Bij eenmalig braken zonder andere klachten: 12 uur vasten (wel water), daarna licht verteerbaar voer. **Direct naar de dierenarts** bij: bloederig braaksel, heel jonge of oude honden, sufheid, herhaald braken binnen enkele uren of braken ná het inslikken van gif. De nachttoeslag kan tot €500 extra zijn — een verzekering dekt vaak 80–90%.', links: [{ label: '🤮 Volledige braakgids', url: '/braken-hond' }, { label: '🚨 Spoeddierenarts vinden', url: '/spoed-dierenarts' }] },
  { rx: /hitte|heet|auto|zomer|oververhit|zonne/i, a: 'Een hond kan in een geparkeerde auto binnen **10 minuten** oververhit raken — ook bij 20 °C buiten. Symptomen: hijgen zonder stoppen, kwijlen, rood tandvlees, wankelen. **Direct koelen** (lauw water, niet ijskoud), naar de dierenarts en bel bij nood 112 of 144. Wederom: bel eerst 112 en volg hun instructie.', links: [{ label: '🔥 Hitteberoerte & hete auto', url: '/hitteberoerte-hond' }] },
  { rx: /trim|knippen|scheren|kapper|vacht|borstel|klitten|ontklit/i, a: 'Landelijk kost een trimbeurt in 2026 gemiddeld **€65–75** (kleine scheerbeurt €40–55, grote langharige rassen €130–200). Extra’s: nagels ±€15, oren ±€15, ontklitten ±€17,50 per kwartier. Tip: betaal nooit per uur en borstel wekelijks zodat klitten worden voorkomen.', links: [{ label: '✂️ Trimsalon in jouw buurt', url: '/trimsalon' }, { label: '📝 Gratis offerte aanvragen', url: '/offerte' }, { label: '🪮 Slickerborstel (bestseller)', url: '/webshop' }] },
  { rx: /kosten.*hond|hond.*kosten|duur|budget|maand.*hond|jaar.*hond|geld.*hond/i, a: 'Een hond kost in 2026 gemiddeld **€1.100–3.650 per jaar** (voer ±€250–750, dierenarts €200–1.000, verzekering €240–480, spullen €100–400). Volgens Ipsos geven baasjes nu ±€61/maand alleen al aan voer. Reken met onze calculator voor jouw formaat.', links: [{ label: '📈 Kostencalculator', url: '/kosten-hond' }, { label: '💰 Bespaartips', url: '/honden-bespaartips' }] },
  { rx: /belasting|gemeente|hondenbelasting/i, a: 'In 2026 heffen **nog maar 101 van 342** Nederlandse gemeenten hondenbelasting (30%), gemiddeld **€76,58** voor de eerste hond. Goedkoopste: Simpelveld €21,96. Duurste: Katwijk €142,18, Tilburg €132,28, Lisse €126. Zoek jouw gemeente in de tarievenwijzer.', links: [{ label: '💶 Tarieven per gemeente', url: '/hondenbelasting' }] },
  { rx: /wandelen|losloop|strand|route|bos/i, a: 'We hebben 22+ gecureerde wandelroutes en losloopgebieden, waaronder omheinde gebieden en hondenstranden met zwemwater. Gebruik de kaart om bij jou in de buurt te zoeken, of bekijk de filterbare wandelgids.', links: [{ label: '🌲 Wandelgids & routes', url: '/wandelen' }, { label: '🗺️ Interactieve kaart', url: '/kaart' }] },
  { rx: /voer|voeding|brok|eten|maaltijd|vers|graanvrij|allergie|allergisch/i, a: 'Bij een (vermoedelijke) voedselallergie kies je een hypoallergene of hydrolyseerde voeding — altijd in overleg met de dierenarts. Bestverkocht in 2026: Royal Canin Anallergenic, Edgard & Cooper verse zalm en Pro Plan Sensitive. Bekijk onze selectie met reviews.', links: [{ label: '🥩 Verse voeding vergelijken', url: '/voeding' }, { label: '🛒 Webshop: hypoallergeen & snacks', url: '/webshop' }] },
  { rx: /apport|slaan|bijten|agressie|puppy|pup|opvoed|training|cursus/i, a: 'Puppy’s leren het snelst in de periode 8–16 weken: socialiseren, een puppycursus en korte, positieve sessies werken het best. Bij bijtgedrag of angst adviseren we een gecertificeerde hondenschool of gedragstherapeut — vermijd straffen en schreeuwen.', links: [{ label: '🎓 Hondenscholen & cursussen', url: '/hondenschool' }, { label: '🐶 Puppymatcher', url: '/puppy-kiezen' }, { label: '💬 Vraag het forum', url: '/forum' }] },
  { rx: /ziek|ziekte|dierenarts|arts|dokter|nood|nacht|avond|spoed/i, a: 'Bij twijfel: bel je eigen dierenarts. Regulier consult kost ±€33–86 overdag; avond/weekend €105–160; spoed ’s nachts kan tot €500 extra kosten. Zie je een van de alarmsymptomen (niet eten >24u, sufheid, bloeding, ademnood, braken met bloed), ga dan direct.', links: [{ label: '🚨 Spoeddierenarts bij jou', url: '/spoed-dierenarts' }, { label: '🩺 Tarieven 2026', url: '/dierenarts-tarieven' }] },
  { rx: /webshop|kopen|bestel|product|aanbevolen.*product|borstel|kauwstick|snack/i, a: 'Onze webshop bevat 22 onafhankelijk geselecteerde producten met echte bol.com-reviews — van hypoallergeen voer tot crashgeteste autotuigen. Via partnerlinks betaal jij niets extra; de score-proof producten staan bovenaan.', links: [{ label: '🛒 Naar de webshop', url: '/webshop' }] },
  { rx: /forum|community|ervaring|vragen|sociale/i, a: 'Het Hondenforum is dé plek om ervaringen te delen: tips over voeding, gedrag, trimmers en meer. Maak (gratis) een account aan om te reageren en je favoriete topic te bewaren.', links: [{ label: '💬 Naar het forum', url: '/forum' }] },
  { rx: /vakantie|reizen|vliegen|auto.*hond|reis/i, a: 'Reizen met je hond: binnen de EU is een chip + EU-paspoort (met rabiësvaccinatie) verplicht. Neem voor autoritten een crashgetest autotuig; in landen zoals Duitsland en Frankrijk is dit verplicht. Bekijk onze volledige reisgids.', links: [{ label: '✈️ Vliegen & reizen', url: '/reizen' }, { label: '🚗 Reisveilige accessoires', url: '/webshop' }] },
  { rx: /ras|labradoodle|pomeriaan|maltezer|shih|poedel|goldendoodle|cockapoo|welk ras|hond kiezen/i, a: 'Het beste ras hangt af van je levensstijl: een Pomeriaan past bij appartementen (maar wil wel beweging), Labradoodles zijn gezinsvriendelijk en hypoallergeen-ish, en een Shih Tzu is een rustige stadsgenoot. Bekijk per ras de trimbehoefte, karakter en kosten.', links: [{ label: '🧾 Alle rassen & variëteiten', url: '/rassen' }, { label: '🐶 Puppymatcher', url: '/puppy-kiezen' }] },
  { rx: /offerte|aanvraag|salon.*vinden|prijs.*salon|3 offertes/i, a: 'Vraag gratis 3 offertes aan bij geverifieerde trimsalons, hondenscholen of pensions bij jou in de buurt — reactie meestal binnen 2 uur, volledig vrijblijvend.', links: [{ label: '📝 Offerte aanvragen', url: '/offerte' }] },
  { rx: /kaart|in de buurt|bij mij|dichtbij|locatie/i, a: 'Gebruik de interactieve kaart om trimsalons, hondenscholen, pensions, wellness en losloopgebieden bij jou in de buurt te vinden. Gebruik de GPS-knop om automatisch jouw regio te tonen.', links: [{ label: '🗺️ Kaart openen', url: '/kaart' }] },
  { rx: /dank|bedankt|top|super|mooi|leuk/i, a: 'Graag gedaan! 🐾 Is er nog iets anders — bijvoorbeeld over verzekeringen, kosten of een trimmer bij jou in de buurt?', links: [] },
  { rx: /hallo|hoi|hey|goedemorgen|goedemiddag|goedenavond|help/i, a: 'Hoi! 👋 Ik ben **TG**, de TrimGids-assistent. Ik help je met: verzekeringen, kosten, trimmen, voeding, gedrag, wandelen en noodhulp. Waar kan ik je mee helpen?', links: [{ label: '🛡️ Verzekering vergelijken', url: '/verzekering' }, { label: '✂️ Trimsalon vinden', url: '/trimsalon' }] }
];

function kbChatReply(message) {
  for (const item of KB) {
    if (item.rx.test(message)) return { mode: 'knowledge', answer: item.a, links: item.links };
  }
  const hits = searchSiteIndex(message, 3);
  return {
    mode: 'knowledge',
    answer: 'Dat weet ik niet direct, maar ik heb wel een paar goede pagina’s voor je gevonden. Stel je vraag anders iets specifieker (bijv. “verzekering”, “kosten”, “braken” of “trimsalon”). 🐾',
    links: hits.map(h => ({ label: h.icon + ' ' + h.title, url: h.url }))
  };
}

async function aiChatReply(message) {
  try {
    const sys = 'Je bent TG, een vriendelijke Nederlandse AI-assistent van TrimGids (hondenplatform NL). Antwoord in max 60 woorden, NL, zonder medische diagnoses. Benoem bij noodsituaties altijd: bel je dierenarts of 112/144 en verwijs naar https://trimgids.nl/spoed-dierenarts. Claim nooit garanties over verzekeringen of medische uitkomsten. Verwijs bij relevantie naar: /verzekering, /kosten-hond, /hondenbelasting, /trimsalon, /webshop, /braken-hond, /hitteberoerte-hond, /wandelen, /forum.';
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.4, max_tokens: 220, messages: [{ role: 'system', content: sys }, { role: 'user', content: message }] })
    });
    if (!r.ok) throw new Error('openai_' + r.status);
    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content || '';
    const links = searchSiteIndex(message, 4).map(h => ({ label: h.icon + ' ' + h.title, url: h.url }));
    return { mode: 'ai', answer: answer.trim(), links };
  } catch {
    return { mode: 'ai-fallback', answer: kbChatReply(message).answer, links: kbChatReply(message).links };
  }
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  upgradeResponse(req, res);

  /* CSRF/Origin hardening voor muterende requests: alleen zelfde oorsprong toestaan */
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin) {
      let originHost;
      try { originHost = new URL(origin).host; } catch { originHost = ''; }
      const requestHost = req.headers.host || '';
      if (!originHost || originHost !== requestHost) {
        return json(res, 403, { error: 'cross_origin_blocked' });
      }
    }
  }

  try {
    /* Search Engines: Sitemap.xml & Robots.txt (gethitrate om misbruik te beperken) */
    if ((url.pathname === '/sitemap.xml' || url.pathname === '/sitemaps.xml') && (req.method === 'GET' || req.method === 'HEAD')) {
      if (!rateLimit(req, rateLimits.sitemap, 30, 60000)) return json(res, 429, { error: 'rate_limited' });
      res.writeHead(200, secureHeaders({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }));
      if (req.method === 'HEAD') return res.end();
      return res.end(generateSitemap());
    }
    if (url.pathname === '/robots.txt' && (req.method === 'GET' || req.method === 'HEAD')) {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }));
      if (req.method === 'HEAD') return res.end();
      return res.end(robotsTxt());
    }

    /* Core Providers API */
    if (url.pathname === '/api/providers' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const breed = clean(url.searchParams.get('breed'), 60);
      const category = clean(url.searchParams.get('category'), 60);
      const province = clean(url.searchParams.get('province'), 60);
      const lite = url.searchParams.get('lite') === '1';
      let list = catalog.providers;
      if (category) list = list.filter(p => p.category === category);
      if (city) list = list.filter(p => p.city === slugify(city));
      if (province) list = list.filter(p => p.province?.toLowerCase() === province.toLowerCase());
      if (breed) list = list.filter(p => p.breeds && (p.breeds.includes(slugify(breed)) || p.breeds.includes('alle-rassen')));
      if (lite) {
        /* Slim payload for the interactive map: only coordinates + labels */
        return json(res, 200, { providers: list.map(p => ({
          name: p.name,
          category: p.category,
          city: p.city,
          province: p.province,
          lat: p.lat,
          lng: p.lng,
          slug: p.slug
        })) });
      }
      return json(res, 200, { providers: list });
    }

    /* Geaggregeerde homepage-feed: 1 request i.p.v. 10 parallelle fetches */
    if (url.pathname === '/api/home' && req.method === 'GET') {
      if (!rateLimit(req, rateLimits.home, 120, 60000)) return json(res, 429, { error: 'rate_limited' });
      const providers = catalog.providers || [];
      const cities = new Set(providers.map(provider => `${provider.city || ''}|${provider.province || ''}`)).size;
      const [ins, lm, dna, foods, vets, routes, missing, news, taxes] = await Promise.all([
        collectionList(insuranceFile), collectionList(lastMinuteFile), collectionList(dnaTestsFile),
        collectionList(foodFile), collectionList(emergencyVetsFile), collectionList(routesFile),
        collectionList(missingFile), collectionList(newsFile), collectionList(dogTaxFile)
      ]);
      return publicJson(res, 200, {
        stats: {
          providers: providers.length,
          cities,
          breeds: Object.keys(catalog.breeds || {}).length,
          routes: routesData.routes?.length || 0,
          byCategory: (catalog.providers || []).reduce((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {})
        },
        lastMinute: { slots: (lm.length ? lm : lastMinuteData.slots).filter(s => !s.claimed).slice(0, 3) },
        insurance: { insurance: (ins.length ? ins : insuranceData.insurance).slice(0, 3) },
        dnaTests: { tests: (dna.length ? dna : dnaTestsData.tests).slice(0, 2) },
        foods: { foods: (foods.length ? foods : foodData.foods).slice(0, 2) },
        emergencyVets: { clinics: (vets.length ? vets : emergencyVetsData.clinics).slice(0, 3) },
        routes: { routes: (routes.routes || routesData.routes || []).slice(0, 3) },
        missing: { missing: (missing.length ? missing : []).slice(0, 3) },
        news: { news: (news.length ? news : []).slice(0, 3) },
        dogTax: { items: (taxes.length ? taxes : []).slice(0, 4) }
      }, 60);
    }

    /* Stedenlijst voor zoekautocomplete (plaatsen met aanbieders, meest populairste eerst) */
    if (url.pathname === '/api/cities' && req.method === 'GET') {
      const counts = new Map();
      for (const provider of (catalog.providers || [])) {
        const key = `${provider.city || ''}|${provider.province || ''}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      const items = [...counts.entries()]
        .map(([key, count]) => {
          const [slug, province] = key.split('|');
          const place = catalog.places?.[slug];
          return { slug, name: place?.name || slug, province, count };
        })
        .filter(item => item.slug)
        .sort((a, b) => b.count - a.count)
        .slice(0, 500);
      return publicJson(res, 200, { cities: items }, 3600);
    }

    /* Core Web Vitals beacon (LCP, INP, CLS) — klein, rate limited, no-store */
    if (url.pathname === '/api/beacon' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.beacon, 60, 3600000)) return json(res, 429, { error: 'rate_limited' });
      const input = await readJson(req);
      const metrics = { lcp: input.lcp, inp: input.inp, cls: input.cls, ttfb: input.ttfb, url: clean(input.url, 120), device: clean(input.device, 30) };
      if (!Number.isFinite(metrics.lcp) && !Number.isFinite(metrics.inp) && !Number.isFinite(metrics.cls)) return json(res, 400, { error: 'missing_metrics' });
      const entry = { ...metrics, measuredAt: new Date().toISOString() };
      const all = await collectionList(webVitalsFile);
      all.unshift(entry);
      if (all.length > 200) all.length = 200;
      await writeFile(webVitalsFile, JSON.stringify(all, null, 2) + '\n');
      collectionCache.set(webVitalsFile, { value: all, expiresAt: Date.now() + collectionCacheTtlMs });
      return json(res, 200, { ok: true });
    }

    /* Service worker: no-cache zodat updates direct doorkomen */
    if (url.pathname === '/sw.js' && (req.method === 'GET' || req.method === 'HEAD')) {
      try {
        const content = await readFile(join(root, 'sw.js'));
        res.writeHead(200, secureHeaders({ 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' }));
        if (req.method === 'HEAD') return res.end();
        return res.end(content);
      } catch {
        return json(res, 404, { error: 'not_found' });
      }
    }

    if (url.pathname === '/api/stats' && req.method === 'GET') {
      const providers = catalog.providers || [];
      const cities = new Set(providers.map(provider => `${provider.city || ''}|${provider.province || ''}`)).size;
      return publicJson(res, 200, {
        providers: providers.length,
        cities,
        breeds: Object.keys(catalog.breeds || {}).length,
        routes: routesData.routes?.length || 0
      });
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

    /* Ronde 9 — sitebrede zoekindex (header-zoekbalk + /zoek-pagina) */
    if (url.pathname === '/api/sitesearch' && req.method === 'GET') {
      if (!rateLimit(req, rateLimits.siteSearch, 30, 60000)) return json(res, 429, { error: 'rate_limited' });
      const q = clean(url.searchParams.get('q'), 100);
      if (!q) return json(res, 200, { results: [], count: 0 });
      const results = searchSiteIndex(q, 8);
      return publicJson(res, 200, { results, count: results.length }, 120);
    }

    /* Ronde 9 — chatbot: kennisbank- of AI-antwoord (afhankelijk van OPENAI_API_KEY) */
    if (url.pathname === '/api/chat/health' && req.method === 'GET') {
      return json(res, 200, { mode: process.env.OPENAI_API_KEY ? 'ai' : 'knowledge' });
    }
    if (url.pathname === '/api/chat' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.chat, 20, 60000)) return json(res, 429, { error: 'rate_limited' });
      let payload = {};
      try { payload = await readJson(req); } catch { return json(res, 400, { error: 'bad_request' }); }
      const message = String(payload.message || '').slice(0, 400).trim();
      if (!message) return json(res, 400, { error: 'empty_message' });
      const reply = process.env.OPENAI_API_KEY ? await aiChatReply(message) : kbChatReply(message);
      return json(res, 200, reply);
    }

    /* Insurance API */
    if (url.pathname === '/api/insurance' && req.method === 'GET') {
      const ins = await collectionList(insuranceFile);
      return publicJson(res, 200, { insurance: ins.length ? ins : insuranceData.insurance });
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

    if (url.pathname === '/api/last-minute' && req.method === 'POST') {
      const input = await readJson(req);
      const slot = {
        id: randomUUID(),
        providerName: clean(input.providerName, 80),
        providerSlug: slugify(input.providerName),
        city: clean(input.city, 60),
        province: clean(input.province, 40) || 'Nederland',
        date: clean(input.date, 30),
        time: clean(input.time, 30),
        service: clean(input.service, 100),
        discount: clean(input.discount, 60) || '15% Last-minute',
        originalPrice: Number(input.originalPrice) || 75,
        dealPrice: Number(input.dealPrice) || 63.75,
        phone: clean(input.phone, 50),
        claimed: false,
        createdAt: new Date().toISOString()
      };
      await collectionAdd(lastMinuteFile, slot);
      return json(res, 201, { ok: true, slot });
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
      return publicJson(res, 200, { routes: await routesList(province, type) });
    }

    /* Vet Tariffs API */
    if (url.pathname === '/api/vet-tariffs' && req.method === 'GET') {
      const tariffs = await collectionList(vetTariffsFile);
      return json(res, 200, { tariffs });
    }
    /* Hypoallergenic Breeds API */
    if (url.pathname === '/api/hypoallergenic-breeds' && req.method === 'GET') {
      const breeds = await collectionList(hypoallergenicBreedsFile);
      return json(res, 200, { breeds });
    }
    /* Dog Vacations API */
    if (url.pathname === '/api/dog-vacations' && req.method === 'GET') {
      const vacations = await collectionList(dogVacationsFile);
      return json(res, 200, { vacations });
    }

    /* Dog Intelligence API */
    if (url.pathname === '/api/dog-intelligence' && req.method === 'GET') {
      const intelligence = await collectionList(dogIntelligenceFile);
      return json(res, 200, { intelligence });
    }
    /* Community Buddies API */
    if (url.pathname === '/api/community-buddies' && req.method === 'GET') {
      const buddies = await collectionList(communityBuddiesFile);
      return json(res, 200, { count: buddies.length, buddies });
    }
    if (url.pathname === '/api/community-buddies' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { buddy: await buddyCreate(await readJson(req)) });
    }

    /* Dog Names API */
    if (url.pathname === '/api/dog-names' && req.method === 'GET') {
      const names = await collectionList(dogNamesFile);
      return json(res, 200, { names });
    }

    /* Dog Friendly Cafes API */
    if (url.pathname === '/api/dog-cafes' && req.method === 'GET') {
      const cafes = await collectionList(dogCafesFile);
      return json(res, 200, { cafes });
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

    /* PuppyMarktplaats API */
    if (url.pathname === '/api/puppies' && req.method === 'GET') {
      const list = (await collectionList(puppiesFile)).filter(p => p.status !== 'rejected' && p.status !== 'pending');
      return json(res, 200, { puppies: list });
    }
    if (url.pathname === '/api/puppies' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 5, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { puppy: await puppiesCreate(await readJson(req)) });
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
      const input = await readJson(req);
      const sessionUser = await currentUser(req);
      if (sessionUser) input.userId = sessionUser.id;
      return json(res, 201, { topic: await forumCreate(input) });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/replies') && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/replies'.length));
      const input = await readJson(req);
      const sessionUser = await currentUser(req);
      if (sessionUser) input.userId = sessionUser.id;
      return json(res, 201, { reply: await forumReplyCreate(topicId, input) });
    }
    if (url.pathname.startsWith('/api/forum/') && url.pathname.endsWith('/helpful') && req.method === 'POST') {
      const topicId = decodeURIComponent(url.pathname.slice('/api/forum/'.length, -'/helpful'.length));
      return json(res, 201, await forumHelpful(topicId, await readJson(req)));
    }

    /* Nieuwsbrief & deal-alerts (lead-capture) */
    if (url.pathname === '/api/newsletter' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.newsletter, 6, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, await newsletterSubscribe(await readJson(req)));
    }

    /* Accounts, sessies & favorieten */
    if (url.pathname === '/api/auth/register' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.auth, 10, 60000)) return json(res, 429, { error: 'rate_limited' });
      const input = await readJson(req);
      const name = clean(input.name, 40);
      const email = clean(input.email, 120).toLowerCase();
      const password = String(input.password || '');
      if (!validEmail(email) || name.length < 2 || password.length < 8) {
        return json(res, 400, { error: 'auth_invalid_fields', message: 'Vul een geldige naam, e-mail en een wachtwoord van minimaal 8 tekens in.' });
      }
      const users = await usersList();
      if (users.some(user => user.email.toLowerCase() === email)) {
        return json(res, 409, { error: 'auth_email_exists', message: 'Dit e-mailadres is al geregistreerd. Log in of gebruik een ander adres.' });
      }
      if (users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
        return json(res, 409, { error: 'auth_name_exists', message: 'Deze gebruikersnaam is al bezet. Kies een andere naam.' });
      }
      const salt = randomBytes(16).toString('hex');
      const user = { id: randomUUID(), name, email, salt, pass: hashPassword(password, salt), createdAt: new Date().toISOString() };
      users.push(user);
      await usersSave(users);
      const token = await createSession(user.id);
      return json(res, 201, { user: publicUser(user) }, 'no-store', { 'Set-Cookie': sessionCookie(token) });
    }
    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.auth, 15, 60000)) return json(res, 429, { error: 'rate_limited' });
      const input = await readJson(req);
      const user = findUserByIdentity(await usersList(), input.identity);
      const password = String(input.password || '');
      const valid = user && user.salt && user.pass
        ? timingSafeEqual(Buffer.from(hashPassword(password, user.salt), 'hex'), Buffer.from(user.pass, 'hex'))
        : false;
      if (!valid) {
        return json(res, 401, { error: 'auth_invalid_credentials', message: 'E-mail/gebruikersnaam of wachtwoord klopt niet.' });
      }
      const token = await createSession(user.id);
      return json(res, 200, { user: publicUser(user) }, 'no-store', { 'Set-Cookie': sessionCookie(token) });
    }
    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      const header = String(req.headers.cookie || '');
      const match = header.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
      if (match) await destroySession(decodeURIComponent(match[1]));
      return json(res, 200, { ok: true }, 'no-store', { 'Set-Cookie': clearSessionCookie() });
    }
    if (url.pathname === '/api/auth/me' && req.method === 'GET') {
      const user = await currentUser(req);
      if (!user) return json(res, 401, { error: 'not_authenticated' });
      return json(res, 200, { user: publicUser(user), favorites: await favoritesFor(user.id) });
    }
    if (url.pathname === '/api/me/favorites' && req.method === 'GET') {
      const user = await currentUser(req);
      if (!user) return json(res, 401, { error: 'not_authenticated' });
      return json(res, 200, { favorites: await favoritesFor(user.id) });
    }
    if (url.pathname === '/api/me/favorites' && req.method === 'POST') {
      const user = await currentUser(req);
      if (!user) return json(res, 401, { error: 'not_authenticated' });
      return json(res, 201, { favorites: await favoriteUpsert(user.id, await readJson(req)) });
    }
    if (url.pathname === '/api/me/favorites' && req.method === 'DELETE') {
      const user = await currentUser(req);
      if (!user) return json(res, 401, { error: 'not_authenticated' });
      return json(res, 200, { favorites: await favoriteRemove(user.id, await readJson(req)) });
    }

    /* Vacatures & vrijwilligers API */
    if (url.pathname === '/api/vacatures' && req.method === 'GET') {
      const items = await vacatureList();
      return json(res, 200, { vacatures: items, stats: { total: items.length, open: items.filter(v => v.status === 'open').length, vrijwillig: items.filter(v => v.type === 'vrijwillig').length } });
    }
    if (url.pathname === '/api/vacatures' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 6, 60000)) return json(res, 429, { error: 'rate_limited' });
      return json(res, 201, { vacature: await vacatureCreate(await readJson(req)) });
    }
    if (url.pathname === '/api/vrijwilligers' && req.method === 'POST') {
      if (!rateLimit(req, rateLimits.write, 6, 60000)) return json(res, 429, { error: 'rate_limited' });
      const record = await vrijwilligerCreate(await readJson(req));
      return json(res, 201, { ok: true, id: record.id });
    }

    /* News & Tips API */
    if (url.pathname === '/api/news' && req.method === 'GET') {
      const category = clean(url.searchParams.get('category'), 40);
      const region = clean(url.searchParams.get('region'), 60);
      return publicJson(res, 200, { news: await newsList(category, region) });
    }
    if (url.pathname === '/api/news/tips' && req.method === 'POST') {
      return json(res, 201, { tip: await newsTipCreate(await readJson(req)) });
    }

    /* Missing Dogs API */
    if (url.pathname === '/api/missing' && req.method === 'GET') {
      const city = clean(url.searchParams.get('city'), 60);
      const status = clean(url.searchParams.get('status'), 30);
      return publicJson(res, 200, { missing: await missingList(city, status) });
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
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(newsPage());
    }
    if (url.pathname === '/vermist') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(missingPage());
    }
    if (url.pathname === '/hondenbelasting') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dogTaxPage());
    }
    if (url.pathname === '/verzekering') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(insurancePage());
    }
    if (url.pathname === '/dna-test' || url.pathname === '/dna-testen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dnaPage());
    }
    if (url.pathname === '/voeding' || url.pathname === '/hondenvoer' || url.pathname === '/verse-maaltijden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(foodPage());
    }
    if (url.pathname === '/spoed-dierenarts' || url.pathname === '/spoeddierenarts') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(emergencyVetPage());
    }
    if (url.pathname === '/kosten-hond' || url.pathname === '/wat-kost-een-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(costPage());
    }
    if (url.pathname === '/wandelen' || url.pathname === '/losloopgebieden' || url.pathname === '/hondenstranden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(walkingPage());
    }
    if (url.pathname === '/kaart') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(mapPage());
    }
    /* Ronde 9 — trimkosten 2026 (data + calculator) */
    if (url.pathname === '/trimmen-kosten' || url.pathname === '/wat-kost-trimmen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(trimKostenPage());
    }
    /* Ronde 9 — zoekpagina */
    if (url.pathname === '/zoek' || url.pathname === '/search' || url.pathname === '/zoeken') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=3600' }));
      return res.end(searchPage(url.searchParams.get('q')));
    }
    /* Nieuwe kennis- & communitypagina's (self-contained modules) */
    if (url.pathname === '/forum' || url.pathname === '/community' || url.pathname === '/hondenforum') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(communityPage());
    }
    if (url.pathname === '/hulphonden' || url.pathname === '/diensthonden' || url.pathname === '/assistentiehonden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hulphondenPage());
    }
    if (url.pathname === '/puppies' || url.pathname === '/puppy-marktplaats' || url.pathname === '/puppies-te-koop') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      const pups = await collectionList(puppiesFile);
      return res.end(puppiesPage(pups));
    }
    if (url.pathname === '/hondengedrag' || url.pathname === '/gedrag-hond' || url.pathname === '/hondencommunicatie') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hondengedragPage());
    }
    if (url.pathname === '/hondenanatomie' || url.pathname === '/anatomie-hond' || url.pathname === '/hond-anatomie') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(anatomiePage());
    }
    if (url.pathname === '/zintuigen' || url.pathname === '/zintuigen-hond' || url.pathname === '/honden-zintuigen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(zintuigenPage());
    }
    if (url.pathname === '/fokkers' || url.pathname === '/erkende-fokkers' || url.pathname === '/fokker-gids') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(fokkersPage());
    }
    if (url.pathname === '/aankoopgids' || url.pathname === '/pup-kopen' || url.pathname === '/hond-kopen' || url.pathname === '/aanschaf-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(await aankoopgidsPage());
    }
    if (url.pathname === '/vacatures' || url.pathname === '/vacature' || url.pathname === '/honden-vacatures' || url.pathname === '/werk-bij-honden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(await vacaturesPage());
    }
    if (url.pathname === '/vrijwilligers' || url.pathname === '/vrijwilliger-worden' || url.pathname === '/vrijwilligerswerk-honden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(vrijwilligersPage());
    }
    if (url.pathname === '/adoptie' || url.pathname === '/asielhond' || url.pathname === '/hond-adopteren' || url.pathname === '/pup-of-asielhond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(adoptiePage());
    }
    if (url.pathname === '/hond-gevonden' || url.pathname === '/gevonden-hond' || url.pathname === '/hond-vermist' || url.pathname === '/hond-vinden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hondGevondenPage());
    }
    /* Ronde 5: reizen, rassen, wetgeving, poepregels, weetjes, sport en gezondheidsplicht */
    if (url.pathname === '/reizen' || url.pathname === '/vliegen-hond' || url.pathname === '/hond-mee-vliegtuig' || url.pathname === '/vliegen-met-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(reizenPage());
    }
    if (url.pathname === '/rassen' || url.pathname === '/hondenrassen' || url.pathname === '/honden-rassen' || url.pathname === '/rassen-overzicht') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(rassenPage());
    }
    if (url.pathname === '/verboden-rassen' || url.pathname === '/verboden-hondenrassen' || url.pathname === '/gevaarlijke-hondenrassen' || url.pathname === '/hondenrassen-verbod') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(verbodenRassenPage());
    }
    if (url.pathname === '/poepzakjes' || url.pathname === '/hondenpoepzakjes' || url.pathname === '/hondenpoep-regels' || url.pathname === '/poep-oprapen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(poepzakjesPage());
    }
    if (url.pathname === '/hondenweetjes' || url.pathname === '/hondenweetjes-overzicht' || url.pathname === '/weetjes-hond' || url.pathname === '/honden-feiten') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(await hondenweetjesPage());
    }
    if (url.pathname === '/hondenwedstrijden' || url.pathname === '/hondensport' || url.pathname === '/honden-sport' || url.pathname === '/hondenwedstrijd') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hondenwedstrijdenPage());
    }
    if (url.pathname === '/chippen-ontwormen' || url.pathname === '/hond-chippen' || url.pathname === '/ontwormen-hond' || url.pathname === '/chip-ontwormen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(chippenOntwormenPage());
    }
    /* Ronde 6: eerste hulp, cijfers, geschiedenis, royals, werken & webshop */
    if (url.pathname === '/braken-hond' || url.pathname === '/hond-braakt' || url.pathname === '/braken-hondje' || url.pathname === '/hond-braken') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(brakenPage());
    }
    if (url.pathname === '/hitteberoerte-hond' || url.pathname === '/hitteberoerte' || url.pathname === '/hond-oververhit' || url.pathname === '/hond-in-hete-auto') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hitteberoertePage());
    }
    if (url.pathname === '/zwerfhonden' || url.pathname === '/zwerfhond' || url.pathname === '/zwerfhonden-wereldwijd' || url.pathname === '/straathonden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(zwerfhondenPage());
    }
    if (url.pathname === '/honden-cijfers' || url.pathname === '/aantal-honden' || url.pathname === '/honden-statistieken' || url.pathname === '/hoeveel-honden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(cijfersPage());
    }
    if (url.pathname === '/geschiedenis-hond' || url.pathname === '/geschiedenis-van-de-hond' || url.pathname === '/honden-geschiedenis' || url.pathname === '/waar-komt-de-pomeriaan-vandaan') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(geschiedenisPage());
    }
    if (url.pathname === '/koninklijke-honden' || url.pathname === '/honden-royals' || url.pathname === '/koningshuis-honden' || url.pathname === '/royal-honden') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(koninklijkeHondenPage());
    }
    if (url.pathname === '/hond-en-werk' || url.pathname === '/hond-fulltime-werken' || url.pathname === '/uitlaatservice' || url.pathname === '/hond-roedeldier') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(werkenMetHondPage());
    }
    if (url.pathname === '/webshop' || url.pathname === '/honden-webshop' || url.pathname === '/shop-hond' || url.pathname === '/affiliate-shop') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(await webshopPage());
    }
    if (url.pathname === '/last-minute' || url.pathname === '/last-minute-deals') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(lastMinutePage());
    }
    if (url.pathname === '/offerte' || url.pathname === '/offerte-aanvragen' || url.pathname === '/offertes') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(quotePage());
    }
    if (url.pathname === '/claim' || url.pathname === '/claim-profiel' || url.pathname === '/bedrijf-claimen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(claimPage());
    }
    if (url.pathname === '/bedrijven' || url.pathname === '/voor-bedrijven' || url.pathname === '/partner' || url.pathname === '/claimen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(businessPage());
    }
    if (url.pathname === '/producten' || url.pathname === '/vachtverzorging-producten' || url.pathname === '/shop') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(productsPage());
    }
    if (url.pathname === '/giftigheid-calculator' || url.pathname === '/chocolade-calculator' || url.pathname === '/gif-check') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(toxicityCalculatorPage());
    }
    if (url.pathname === '/puppy-kiezen' || url.pathname === '/hondenras-test' || url.pathname === '/welke-hond-past-bij-mij') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(puppyMatchPage());
    }
    if (url.pathname === '/leeftijd-calculator' || url.pathname === '/hondenleeftijd' || url.pathname === '/hondenjaren') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dogAgePage());
    }
    if (url.pathname === '/gewicht-calculator' || url.pathname === '/puppy-gewicht') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(puppyWeightPredictorPage());
    }
    if (url.pathname === '/hond-mee-op-vakantie' || url.pathname === '/reisgids') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(travelGuidePage());
    }
    if (url.pathname === '/hondennamen' || url.pathname === '/namen-hond' || url.pathname === '/hondennaam') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dogNamesPage());
    }
    if (url.pathname === '/hondvriendelijke-horeca' || url.pathname === '/hondvriendelijke-cafes' || url.pathname === '/hond-mee-naar-terras') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dogFriendlyCafesPage());
    }
    if (url.pathname === '/dierenarts-tarieven' || url.pathname === '/dierenarts-kosten' || url.pathname === '/tarieven-dierenarts') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(vetTariffsPage());
    }
    if (url.pathname === '/hondenvoer-calculator' || url.pathname === '/koolhydraten-hondenvoer' || url.pathname === '/voer-check') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(foodCalculatorPage());
    }
    if (url.pathname === '/honden-vaccinaties' || url.pathname === '/inentingen-hond' || url.pathname === '/vaccinatieschema-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(vaccinationGuidePage());
    }
    if (url.pathname === '/hypoallergene-honden' || url.pathname === '/hondenallergie' || url.pathname === '/allergievrije-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(hypoallergenicPage());
    }
    if (url.pathname === '/beweging-hond-calculator' || url.pathname === '/uitlaattijd-hond' || url.pathname === '/beweging-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(exerciseCalcPage());
    }
    if (url.pathname === '/vachtverzorging-seizoenen' || url.pathname === '/rui-periode-hond' || url.pathname === '/seizoensverzorging-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(seasonalCoatCarePage());
    }
    if (url.pathname === '/hondenpension-checklist' || url.pathname === '/dagopvang-hond-tips' || url.pathname === '/pension-hond-checklist') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(boardingChecklistPage());
    }
    if (url.pathname === '/vakantie-met-hond' || url.pathname === '/omheinde-tuin-hond' || url.pathname === '/hondenvakantie') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(vacationsPage());
    }
    if (url.pathname === '/hondenras-intelligentie' || url.pathname === '/slimste-hondenrassen' || url.pathname === '/intelligentie-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(intelligencePage());
    }
    if (url.pathname === '/verhuizen-met-hond' || url.pathname === '/verhuischecklist-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(relocationPage());
    }
    if (url.pathname === '/honden-bespaartips' || url.pathname === '/besparen-op-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(moneySavingPage());
    }
    if (url.pathname === '/wandelmaatje' || url.pathname === '/community' || url.pathname === '/hondenmaatjes') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(communityBuddiesPage());
    }
    if (url.pathname === '/puppy-gewicht-calculator' || url.pathname === '/puppy-groei' || url.pathname === '/gewicht-hond-berekenen') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(puppyWeightPage());
    }
    if (url.pathname === '/trimsalon-inkomsten-calculator' || url.pathname === '/trimsalon-omzet-berekenen' || url.pathname === '/tarieven-trimsalon') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(groomerCalculatorPage());
    }
    if (url.pathname === '/ehbo-hond' || url.pathname === '/spoed-ehbo' || url.pathname === '/eerste-hulp-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(firstAidPage());
    }
    if (url.pathname === '/gebitsverzorging-hond' || url.pathname === '/tandsteen-hond' || url.pathname === '/hondengebit') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(dentalCarePage());
    }
    if (url.pathname === '/afvallen-hond' || url.pathname === '/dieet-hond' || url.pathname === '/overgewicht-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(weightLossPage());
    }
    if (url.pathname === '/vacht-herinnering' || url.pathname === '/trim-herinnering' || url.pathname === '/trimplanner') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(remindersPage());
    }
    if (url.pathname === '/teken-en-vlooien' || url.pathname === '/tekenradar' || url.pathname === '/teken-hond') {
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(parasiteRadarPage());
    }

    /* Dynamic directory / provider / breed pages */
    const dirPage = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const generatedPage = providerPage(url.pathname) || directoryPage(url.pathname, dirPage);
    if (generatedPage) {
      /* LRU-cache: gegenereerde directory/profielpagina's worden per URL hergebruikt */
      const pageKey = 'gen:' + url.pathname + '?page=' + dirPage;
      let pageHtml = htmlPageCache.get(pageKey);
      if (pageHtml === undefined) {
        pageHtml = modernizeGeneratedHtml(generatedPage);
        htmlPageCache.set(pageKey, pageHtml);
        if (htmlPageCache.size > 600) htmlPageCache.delete(htmlPageCache.keys().next().value);
      }
      res.writeHead(200, secureHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': HTML_CACHE }));
      return res.end(pageHtml);
    }

    /* Static files fallback */
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    if (res.headersSent) {
      try { res.end(); } catch (_) {}
      return;
    }
    const clientErrors = [
      'missing_fields', 'request_too_large', 'profile_missing_fields', 'claim_invalid_contact',
      'review_invalid_fields', 'request_invalid_fields', 'response_invalid_fields', 'request_not_found',
      'poll_not_found', 'poll_invalid_vote', 'poll_already_voted', 'forum_topic_not_found',
      'forum_reaction_invalid', 'forum_already_reacted', 'favorite_invalid_fields', 'newsletter_invalid_email', 'invalid_moderation_status',
      'moderation_item_not_found', 'news_tip_invalid_fields', 'missing_dog_invalid_fields',
      'missing_dog_not_found', 'quote_invalid_fields', 'slot_not_found'
    ];
    const status = clientErrors.includes(error.message) ? 400 : 502;
    json(res, status, { error: error.message || 'server_error' });
  }
}

export default handleRequest;

const server = createServer(handleRequest);
const port = Number.parseInt(process.env.PORT, 10) || 3000;
if (process.env.VERCEL !== '1') {
  server.listen(port, '0.0.0.0', () => {
    console.log(`TrimGids draait op http://localhost:${port}`);
  });
}
