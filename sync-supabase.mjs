/* Backfill: lokale JSON-data naar Supabase kopiëren (alleen als .env is geconfigureerd).
   Idempotent: rijen die al per id bestaan worden overgeslagen. */
import { readFile, readFileSync } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const root = existsSync(join(moduleDir, 'data', 'catalog.json')) ? moduleDir : process.cwd();

try {
  const raw = readFileSync(join(root, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
} catch { /* geen .env */ }

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Configureer SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env om te synchroniseren.');
  process.exit(1);
}

const TABLES = [
  { file: 'quote-requests.json', table: 'quote_requests', columns: { id: 'id', name: 'name', email: 'email', phone: 'phone', city: 'city', breed: 'breed', service: 'service', timeframe: 'timeframe', notes: 'notes', source: 'source', campaign: 'campaign', landingPage: 'landing_page', status: 'status', createdAt: 'created_at' } },
  { file: 'claims.json', table: 'provider_claims', columns: { id: 'id', providerSlug: 'provider_slug', name: 'name', email: 'email', phone: 'phone', status: 'status', createdAt: 'created_at' } },
  { file: 'reviews.json', table: 'provider_reviews', columns: { id: 'id', providerSlug: 'provider_slug', author: 'author', rating: 'rating', body: 'body', status: 'status', createdAt: 'created_at' } }
];

function headers() {
  return {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };
}

let created = 0, skipped = 0, failed = 0;

for (const config of TABLES) {
  let rows = [];
  try {
    rows = JSON.parse(await readFile(join(root, 'data', config.file), 'utf8'));
  } catch {
    console.log(`→ ${config.file}: geen data (overgeslagen)`);
    continue;
  }
  for (const row of rows) {
    const existing = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}?id=eq.${encodeURIComponent(row.id)}&select=id`, { headers: headers() });
    if (existing.ok) {
      const found = await existing.json();
      if (found.length) { skipped += 1; continue; }
    }
    const body = {};
    for (const [key, column] of Object.entries(config.columns)) {
      if (row[key] !== undefined) body[column] = row[key];
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}`, {
      method: 'POST',
      headers: { ...headers(), 'Prefer': 'return=minimal' },
      body: JSON.stringify(body)
    });
    if (res.ok) created += 1;
    else {
      failed += 1;
      console.error(`  ✗ ${config.table}/${row.id}: HTTP ${res.status} ${await res.text()}`);
    }
  }
}

console.log(JSON.stringify({ created, skipped, failed }, null, 2));
if (failed) process.exitCode = 1;
