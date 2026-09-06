# TrimGids

## Lokaal starten

1. Installeer Node.js 18 of nieuwer.
2. Kopieer `.env.example` naar `.env`.
3. Vul `GOOGLE_PLACES_API_KEY` in met een server-key uit Google Cloud.
4. Schakel **Places API (New)** in en beperk de key op server/IP-niveau.
5. Start met `npm start`.
6. Open `http://localhost:3000`.

Zonder Google-key blijft de demo beschikbaar en geeft `/api/health` aan dat Google Places niet is geconfigureerd.

## Google Places-catalogus vullen

Na het instellen van `GOOGLE_PLACES_API_KEY` kun je een gecontroleerde import starten met `npm run sync:places`. De tool haalt alleen basisgegevens van trimsalons per catalogusplaats op. Google-reviews en foto’s worden niet gekopieerd. Nieuwe imports krijgen `verified: false` en blijven daardoor buiten de index totdat ze handmatig zijn gecontroleerd.

## Performance-lagen (standaard ingeschakeld)

- **Brotli/gzip-compressie** voor alle HTML, JSON, XML, CSS en JS (met in-memory compressie-cache).
- **ETag + 304 revalidatie** en `Vary: Accept-Encoding` voor alle cachebare GET-responses.
- **HTML-paginacache** (LRU) voor gegenereerde directory- en providerpagina's; publieke HTML krijgt `public, max-age=120, s-maxage=600, stale-while-revalidate=86400`.
- **`/api/providers?lite=1`**: slank kaart-payload (+ optioneel `?province=limburg`) — ~95% minder bytes.
- **`/api/home`**: één geaggregeerde feed voor de homepage i.p.v. 10 parallelle API-calls.
- **`/api/cities`**: complete stedenlijst voor zoekautocomplete.
- **Lazy loading**: Leaflet (+ markerclustering) en alle data-feeds worden pas geladen wanneer nodig/zichtbaar.
- **`/api/beacon`**: anonieme Core Web Vitals-metrics (LCP/INP/CLS) vanuit alle pagina's; opgeslagen in `data/web-vitals.json` (max 200).
- **Service worker** (`/sw.js`): offline-capabel, netwerk-eerst voor HTML/API's, cache-eerst voor assets.
- **Security**: HSTS, COOP/CORP, verrijkte CSP (`form-action 'self'`, `object-src 'none'`, `worker-src 'self'`), origin-check op schrijfacties.

## API

- `GET /api/places/search?text=trimsalon+Maastricht`
- `GET /api/places/:placeId`
- `GET /api/photo?name=places/.../photos/...`
- `GET /api/forum`
- `POST /api/forum` met `name`, `title`, `category` en `body`
- `GET|POST /api/forum/:id/replies` voor gemodereerde topicreacties
- `POST /api/forum/:id/helpful` voor anonieme helpful-reacties
- `POST /api/profiles` voor een persoonlijk hondenprofiel
- `GET /api/profiles/:id` voor het opgeslagen profiel
- `POST /api/providers/:slug/claim` voor een claimaanvraag
- `GET|POST /api/providers/:slug/reviews` voor gemodereerde eigen reviews
- `GET|POST /api/requests` voor privacybewuste hulpvragen
- `POST /api/requests/:id/responses` voor reacties van aanbieders
- `GET /api/polls?breed=labradoodle` voor rasresultaten
- `POST /api/polls/:id/votes` voor anonieme pollstemmen
- `/admin` voor moderatie van pending reviews en claims; configureer `ADMIN_TOKEN` in `.env`

Profielen worden op dit moment gekoppeld aan een browser-ID en lokaal opgeslagen in de serverdata. Voor productie moeten authenticatie, rate limiting, CSRF-bescherming, moderatie en PostgreSQL/Supabase worden toegevoegd.

De server heeft al basisbescherming tegen overmatig API-gebruik, veilige responseheaders en korte in-memory caching voor identieke Google-requests. De rate limiter is bewust eenvoudig gehouden; achter een reverse proxy hoort in productie een gedeelde limiter zoals Redis te komen.

Publieke GET-data gebruikt korte CDN-cacheheaders met `stale-while-revalidate`. Statische assets krijgen langdurige immutable caching via `vercel.json`. De homepage en alle gegenereerde routes gebruiken een gedeelde merklaag met dezelfde TG-branding, Plus Jakarta Sans, route-CTA's, skip-link en responsive header/footer.

Een eerste PostgreSQL/Supabase-schema staat in `supabase/schema.sql`. Dit bevat tabellen en indexen voor offerte-leads, claims, reviews en forumtopics/reacties. De browser mag nooit met een service-role key werken; writes horen via de server/API te verlopen.

Voor volledige productie-integratie moet `.env` worden aangevuld met `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY`. Zet de service-role key uitsluitend als Vercel Environment Variable en nooit in frontendcode.

Wanneer beide zijn geconfigureerd schakelt de **optionele storage adapter** automatisch in: offerte-aanvragen, claims en reviews worden dan via PostgREST naar de tabellen uit `supabase/schema.sql` geschreven (met automatische fallback op de lokale JSON als de DB niet bereikbaar is). Bestaande lokale data kun je eenmalig backfillen met:

```bash
npm run sync:db
```

Voor notificaties zijn optioneel `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` en `NOTIFICATION_TO_EMAIL` beschikbaar.

Bij iedere push naar `main` en bij pull requests draait GitHub Actions automatisch `smoke.mjs` via `.github/workflows/smoke.yml`.

## Regressietest

Start de server en voer uit:

```bash
BASE_URL=http://localhost:3000 npm run smoke
```

De smoke-test controleert 18 belangrijke pagina's, waaronder homepage, nieuws, kaart, wandelen, verzekering, voeding, offerte, B2B, EHBO, gifcheck, calculators en directorypagina's. Daarnaast worden 6 publieke API's gecontroleerd op HTTP-status, JSON-validiteit, ontbrekende titels en zichtbare `undefined`/`null`-tekst.

Voor een lokale concurrency-smoketest:

```bash
BASE_URL=http://localhost:3000 CONCURRENCY=25 REQUESTS=8 npm run loadtest
```

Dit meet de homepage en publieke API’s op statuscodes, p50/p95-latency en failures. Het is geen vervanging voor een productie-loadtest achter Vercel en een echte database.

## Data-gedreven SEO-pagina's

De centrale catalogus staat in `data/catalog.json` en bevat plaatsen, rassen en aanbieders. De server genereert daaruit:

- `/trimsalon/maastricht`
- `/trimsalon/maastricht/labradoodle`
- `/rassen/labradoodle`

Een combinatiepagina krijgt standaard `noindex,follow` zolang er minder dan acht gecontroleerde vermeldingen zijn of de catalogus nog demo-data bevat. Zo ontstaan geen dunne indexpagina's. Zodra echte, gecontroleerde gegevens zijn ingevoerd, kan de indexeerbaarheid automatisch ontstaan zonder handmatig HTML-pagina's te onderhouden.

Google Maps-links openen de officiële Maps-interface voor kaart, navigatie en reviews. Google-reviewdata en foto’s worden niet gescrapet. De eigen forumdata staat lokaal in `data/forum.json`; voor productie zijn een database, accounts, rate limiting, moderatie en backups nodig.

## Chat-assistent TG (Ronde 9)

De site heeft een ingebouwde chat-assistent (knop rechtsonder) die op elke pagina beschikbaar is:

- **Kennisbank-modus (standaard, gratis)**: beantwoordt ~17 veelgestelde onderwerpen (verzekering, kosten, braken, hitte, trimsalon, hondenbelasting, voeding, wandelen…) met directe links naar de juiste gids.
- **AI-modus (optioneel)**: zet `OPENAI_API_KEY=` in `.env` en herstart; de assistent beantwoordt dan vrije vragen via GPT-4o-mini (max 220 tokens, strikte safety-prompt, valt terug op de kennisbank bij een fout).
- API: `GET /api/chat/health` → `{mode:"ai"|"knowledge"}`, `POST /api/chat {message}` (rate-limit 12/min per IP).
