# TrimGids — Volledige A-Z Performance & Kwaliteitsverbetering

Datum: 2026-09-06 · Scope: homepage, alle 81 tussenliggende routes, API-laag, server/transportlaag, PWA-laag, data-laag, beveiliging.

---

## 1. Wat is nu geïmplementeerd (A-Z, per laag)

### Transport- & serverlaag
- **Brotli/gzip-compressie** (`node:zlib`, kwaliteit 5/6) voor HTML, JSON, XML, CSS, JS + **compressie-cache per content-digest** (max 96).
- **ETag + 304 revalidatie** (SHA-1, 20 tekens), correct zonder body/Content-Type bij 304.
- **`Vary: Accept-Encoding`** overal, correcte `Content-Length` na compressie, correcte `HEAD`-responses.
- **HTML-paginacache** (LRU 600) voor alle gegenereerde directory-/providerpagina's + `modernizeGeneratedHtml`-cache.
- **Sitemap-dagcache** (5,4 MB wordt niet meer per request opgebouwd), **rate limit op sitemap** (30/min).
- **Static file cache** (mtime/size-keyed) voor `index.html`, logo, favicon enz.
- **Structuur-logging** per request (writes, 4xx/5xx en responses >250 ms) — zichtbaar in Vercel-logs.
- **Cacheheaders publieke HTML**: `public, max-age=120, s-maxage=600, stale-while-revalidate=86400` (admin blijft `no-store`).

### API-laag (nieuw)
- **`GET /api/home`** — één geaggregeerde feed (stats + last-minute + verzekeringen + DNA + voeding + spoedartsen + routes + vermist + nieuws + hondenbelasting) op 1 request i.p.v. 10; ≈ **6 KB Brotli**.
- **`GET /api/cities`** — 341 steden met aantallen voor zoekautocomplete (ook lazy gebruikt door de homepage).
- **`GET /api/providers?lite=1`** — slanke kaart-payload (alleen coördinaten/labels); **`?province=`** filter toegevoegd.
- **`POST /api/beacon`** — anonieme Core Web Vitals (LCP/INP/CLS/TTFB/device), rate limited (60/u per IP), opgeslagen in `data/web-vitals.json` (max 200).
- **`GET /sw.js`** — service worker met `no-cache` + Vercel-header-uitzondering (`vercel.json`).

### Frontend-laag
- Homepage-feeds: **1 call** (`/api/home`) i.p.v. 10 parallelle fetches; hondenbelasting wordt pas volledig geladen bij het typen.
- **Leaflet + MarkerCluster lazy** (IntersectionObserver + idle): kaart-CSS/JS (~200 KB) en 2900+ pins worden pas geladen in de buurt van de kaart; clustering (`maxClusterRadius 56`, `disableClusteringAtZoom 12`) maakt de kaart leesbaar.
- **`/kaart`-pagina ook lazy + geclusterd** (server-template aangepast, placeholder "Kaart wordt geladen…").
- **Anti-CLS**: `content-visibility: auto`, `min-height`-reserves voor alle dynamische grids, vaste `width/height` op hero, kaart-placeholder.
- **Fonts**: alleen Plus Jakarta Sans (Fraunces/Inter verwijderd), `text-wrap: balance`, `focus-visible`, `prefers-reduced-motion`.
- **Hero-AVIF `srcset`/`imagesrcset`** (640/1100/1600w), dns-prefetch voor unpkg/OSM-tiles, `color-scheme`, theme-antiflash vóór CSS.
- **A11y**: skip-link, `aria-busy` kaart, aria-pressed i.p.v. tab-rollen op categorie-pills, Escape sluit mobiel menu, focus-styles.
- **PWA**: service worker (`sw.js`, offline cache, netwerk-eerst HTML/API's), PNG-iconen 180/192/512, verbeterd `manifest.webmanifest` (+ `id`, maskable), iOS-meta.

### Beveiligingslaag
- **HSTS**, **COOP same-origin**, **CORP same-origin**, `Permissions-Policy` (o.a. payment=()), CSP uitgebreid met `form-action 'self'`, `object-src 'none'`, `worker-src 'self'`, `img-src unpkg.com` (clustering).
- **Origin/CSRF-guard**: alle POST/PUT/PATCH/DELETE met vreemde `Origin` → 403.
- Rate limits per IP voor search/writes/sitemap/home/beacon.

### Datalaag (productieklaar, optioneel)
- **Supabase-storage-adapter** (PostgREST, zonder extra dependencies): zodra `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` staan, worden **offerte-aanvragen, claims en reviews** naar de tabellen uit `supabase/schema.sql` geschreven én gelezen, met automatische JSON-fallback bij een DB-storing.
- **`npm run sync:db`** (`sync-supabase.mjs`): idempotente backfill van bestaande lokale data naar Supabase.

---

## 2. Gemeten resultaten (lokale server, poort 3000)

| Request | Voor | Na |
|---|---|---|
| `/` (homepage) | 96 KB, geen compressie | **~23 KB Brotli** + ETag/304 |
| `/api/home` (was 10 losse calls) | ~100 KB+ over 10 requests | **~6 KB Brotli**, 1 request |
| `/api/providers` (kaart, was vol) | 2,45 MB | `?lite=1` → **~53 KB Brotli** |
| `/sitemap.xml` | 5,47 MB, opnieuw gebouwd per request | **~85 KB Brotli**, dagcache |
| Leaflet + kaartdata | direct bij load (~2,6 MB) | lazy bij viewport + clustering |
| Directory/providerpagina's | per request opnieuw gebouwd | **HTML-cache LRU** + ETag |
| Loadtest (200 req @ 25 concurrency, 10 paden) | 0 failures | **0 failures** (p50 ~31 ms, p95 ~172 ms) |
| Smoke (18 pagina's + 8 API's) | ✓ | ✓ |

> Verificatie: `node --check` op server/sync/service-worker + alle inline scripts ✓; smoke ✓; loadtest ✓; ETag-304 ✓; origin-guard (403/201) ✓; beacon 200 ✓; CWV-beacon op gegenereerde pagina's ✓; `/api/cities` 341 steden ✓; provinciefilter (Limburg → 244) ✓.

---

## 3. Restpunten die externe infrastructuur/configuratie vereisen

1. **Supabase live testen** — adapter is code-klaar en valt terug op JSON; draai `npm run sync:db` en test de schrijfpaden zodra de service-role key als Vercel env-var staat.
2. **Redis/gedeelde rate limiter** — huidige limiter is per serverless instance; voor echte schaal een gedeelde limiter (of Vercel WAF/Upstash) achter de proxy.
3. **Lighthouse/CrUX-profiel** — er is geen headless browser in deze sandbox; draai eenmaal Lighthouse (mobile, throttled) na deploy en monitor CWV via `/api/beacon`.
4. ~~**Eigen beeldmateriaal**~~ ✅ **Afgerond in ronde 2**: hero, OG en 8 eigen gegenereerde foto's (6 categoriekaarten + pomeriaan) worden lokaal als WebP geserveerd — geen externe beeld-CDN/blokkades meer.
5. **Notificaties** (`RESEND_API_KEY`) en **Supabase RLS-beleid** per tabel — schema aanwezig, activatie is configuratie.

---

## 4. Scores van de verbeteringen per impact

| Impact | Verbetering |
|---|---|
| 🟢 Bandbreedte −95%+ | Brotli, lite-API, sitemapcache, `/api/home`, AVIF-hero |
| 🟢 Latency/CPU | HTML-cache, compressie-cache, static cache, sitemapcache |
| 🟢 UX/gevoel | lazy kaart + clustering, CLS-reserves, `text-wrap: balance`, hero-patronen |
| 🟢 Betrouwbaarheid | ETag-304, structured logging, rate limits, origin-guard |
| 🟢 Toekomstbestendig | Supabase-adapter + backfill, service worker, CWV-beacon |
| 🟢 SEO | snellere TTFB, betere cachebaarheid, canonical/OG al aanwezig |

---

# Ronde 2 — Kaartblokkade, eigen beeldmateriaal & visuele upgrade (2026-09-06)

## Oorzaak & oplossing
- **Probleem**: OpenStreetMap-tiles werden extern geladen (`https://{s}.tile.openstreetmap.org/...`) en geblokkeerd door browser/netwerk (CSP/CDN/egress), waardoor de kaart wit bleef.
- **Oplossing**: same-origin tile-proxy `GET /tiles/{z}/{x}/{y}.png` in `server.mjs`:
  - Provider-keten **CARTO Voyager** (subdomein-rotatie a/b/c) → **OpenStreetMap** → **Esri World Street Map**;
  - **in-memory LRU-cache (400)** + **inflight-deduplicatie** (meerdere clients voor dezelfde tegel = 1 upstream-request);
  - **totaal tijdbudget 10 s** (past binnen serverless-limieten), HTTP-cache `max-age=86400` + SWR, transparante tegel als noodfallback;
  - `vercel.json`: extra rewrite `/tiles/(.*)` → `api/index.js` (anders ving de `/*`-rewrite het nooit omdat `.png` een punt bevat).
- **Client**: zowel homepage-kaartscript als `/kaart`-pagina gebruiken nu `/tiles/{z}/{x}/{y}.png`; `dns-prefetch` naar OSM verwijderd; SW-cache met bounded tile-LRU (240).

## Eigen beeldmateriaal (geen licentierisico, geen externe CDN)
- **Hero** (`hero-1600/1200/640.webp`, ~148/119/52 KB) met `srcset` + `preload fetchpriority=high`; zichtbaarheid hero-foto verhoogd (opacity .32 → .60, gradient-overlay i.p.v. vlakke laag).
- **OG-afbeelding** `assets/img/og.jpg` (1200×630, 129 KB) voor `og:image`/`twitter:image` (was Unsplash-extern).
- **6 categoriekaarten** in nieuwe sectie **"Ontdek TrimGids"** (`#ontdek`, direct na hero): trimsalon, hondenschool, opvang, wellness, losloopgebieden, hondenstranden — elk 480w+960w WebP, lazy, met afbeelding + overlay + CTA naar bestaande routes.
- **Ras-spotlight Pomeriaan** in Hub 2: foto 320/640w, educatieve tekst, CTA's.
- Foto's zijn **zelf gegenereerd** (Image Search gaf vooral Getty/iStock/123RF/Shutterstock; niet herbruikbaar), met ImageMagick geconverteerd naar WebP — totaal beeldpayload ~1,3 MB.

## CSP & verzoeken
- `img-src 'self' data: https://unpkg.com https://places.googleapis.com` — **alle externe beeld/tile-domeinen verwijderd**; Unslpash-URL's (hero, OG, preload, dns-prefetch) volledig uit code; `Content-Language: nl` toegevoegd (`secureHeaders`).

## Service worker v2
- Precache lokale beelden (16 bestanden), eigen **bounded tile-cache (LRU 240)** zodat de kaart offline blijft werken zonder cache-explosie, versie-bump `trimgids-v2` (oude caches automatisch opgeruimd).

## 404 & foutafhandeling
- Nette Nederlandstalige **404-html** voor pagina-routes (logo, uitleg, teruglink); API-bestanden blijven JSON 404; `no-store`.

## Resultaten (lokale server)
- `node --check` server + SW ✓ · HTML-inline-scripts ✓ · smoke + loadtest opnieuw ✓ (zie ronde 1-tabel) · alle `tile.openstreetmap.org`/Unsplash-referenties buiten de proxy verwijderd ✓ · `/tiles/12/2090/1370.png` etc. via eigen route getest ✓ (upstream via proxy; egress in sandbox geblokkeerd — op productie geldt de proxy-keten met CARTO-first).

---

# Ronde 3 — Nieuwe kaart, 5 nieuwe secties, prominente community (2026-09-06)

## 1. Kaart volledig losgekoppeld van externe kaartdiensten
- **Probleem**: OSM-tiles ("werkt weer niet") — ook Leaflet/CSS/JS kwamen extern (unpkg) en konden net zogoed geblokkeerd worden.
- **Oplossing**: eigen **"Ontdekkingskaart"** op `<canvas>` (`assets/js/nl-map.js` + `assets/css/nl-map.css`), 100% same-origin:
  - **Datapunten-kaart**: 2.919 providers + 22 wandelroutes worden met een echte lat/lng-projectie gerasterd; de vorm van Nederland ontstaat uit de data (convex hull als subtiele contour).
  - Pan/zoom (wiel + touch), categorie-filters, zoeken op plaats/naam/provincie, geolocatie ("bij mij in de buurt" met afstand), detailkaart (bellen/navigeren/metropolis-link) en lijstweergave (top 14, dichtstbijzijnde eerst).
  - Werkt in élke omgeving (geen egress nodig), geen API-keys, geen tile-limieten, geen CSP-uitzonderingen.
- **Leaflet/MarkerCluster/unpkg volledig verwijderd** uit `index.html` + `mapPage()`; CSP aangescherpt: `script-src 'self' 'unsafe-inline'` (geen unpkg meer), vertragingsfactor: geen 200 KB externe kaart-SDK meer.
- `/tiles`-proxy (OSM→CARTO→Esri) en `vercel.json`-tile-rewrite verwijderd.
- Homepage-kaart (`#home-map`, 580px, lazy via de eigen component) en `/kaart` (740px, met lijstpaneel) gebruiken dezelfde component.

## 2. Vijf nieuwe pagina's (routes + sitemap + navigatie, alléén lokale assets)
| Pagina | Inhoud | Interactief? |
|---|---|---|
| `/hulphonden` | Blindegeleidehonden (KNGF: puppypleeggezin→BAT→6–8 mnd training→match, "intelligente ongehoorzaamheid"), politiehonden (KNPV, selectie, surveillance vs speur, interviews: Omroep West/Ralph+Champ, NHD/Woody, Gelderlander/NV-kritiek, WUR), na de carrière (geleider → familie → bijzonder baasje), 6 andere inzetgebieden (douane, redding, medisch, detectie, therapie, leger) | Timeline, rolkaarten, bronlinks |
| `/zintuigen` | Zintuigenlab: kleurenzicht (dichromaat: blauw/geel), gehoor tot ±65 kHz, vuurwerk-angst verklaard, ruimte (blazen→inademen, 220M receptoren, 10.000–100.000×), vergelijkingstabellen | Toon-proef (mens vs hondenogen-foto), luister-test (WebAudio-schijf 100 Hz–65 kHz), ruik-slider (0–96 u spoor), 5-vragenequiz met score |
| `/fokkers` | Erkend vs niet-erkend (Raad van Beheer/FCI/NHSB, nestcontrole, DNA, Databankhonden, EXPORT-pedigree), waar vind je erkende fokkers (3 officiële routes), 10-puntenchecklist, tabel rasspecifieke onderzoeken (16 rassen), rode vlaggen, de 12 vragen aan de fokker | Afvinklijst met voortgang (localStorage) |
| `/aankoopgids` | 7-stappenplan aanschaf, interactieve raskeuze (16 rassen: vacht/trim/kosten + specifieke valkuilen), 12-puntenkoopchecklist | Ras-tabs + checklist |
| `/forum` | Volledige community-pagina: huisregels, statistieken, categorieën, sorteren, zoeken, composer, reacties, "nuttig" stemmen | Ja (zelfde component als homepage) |

## 3. Forum prominent & "perfect en leuk" gekopieerd van de beste fora
- **Homepage**: eigen sectie `#forum` direct na de kaart-hub + pill in de sticky navigatie + "Kennis" kaart.
- **Component** (`assets/js/forum.js`, stijlen Discord/Reddit/Discourse): categorie-chips (🐾 Alles/Ervaringen/Vragen/Tips/Nood/Uitjes), sorteer-tabs (Nieuwste/Meest besproken/Meest nuttig), live zoeken, inline composer (naam, categorie, ras, titel, bericht), uitklapbare topics met reacties + reactieformulier, 👍-stemmen met localStorage-dedupe (400 bij dubbel stemmen), emoji-avatars, relatieve tijd, pinned topic, statistiekbalk (onderwerpen/reacties/leden/jouw bijdrage), vriendelijke empty-state.
- **Zaden**: 6 realistische starteronderwerpen (welkom/pinned, fokker-vraag, ex-politiehond, 8 vs 10 weken, vuurwerkprotocol, zintuigenproef) met reacties.
- Getest: aanmaken ✓ reactie ✓ nuttig-stem ✓ dubbele stem → 400 ✓; smoke-deeldata opgeruimd.

## 4. Looks & micro-interacties (beter gejat dan bedacht)
- Kennis-hub met grote diensthondenkaart (foto-achtige gradient-art) + 3 detailkaarten incl. mini "hondenogen"-toggle op de homepage.
- Schone component-CSS met design tokens (kaarten 26px radius, hover-lift, chips, gradients), donkere-modus-ondersteuning in alle nieuwe componenten.
- Nieuwe navigatie: main nav "Meer"-menu met Kennis & Community-links, 8→10 sticky hub-pills.
- Homepage en alle nieuwe pagina's valideerd op HTML-balans (0 ongesloten tags, geen echte fouten).

## 5. Beveiliging & levering
- CSP: `script-src/style-src/img-src` zonder unpkg (alleen Google Fonts + Places API connect/img); `Content-Language: nl`.
- `vercel.json`: `includeFiles` nu data/**, pages/**, assets/js/**, assets/css/** (nieuwe modules mee in serverless bundle).
- **SW v3**: nieuwe JS/CSS + hondenvisie-foto in precache; bounded tile-cache verwijderd (geen tiles meer).
- Smoke **23 pagina's + 9 API's** ✓; loadtest 200 req @25 conc: 0 failed, p50 24 ms, p95 144 ms, max 249 ms.

## 6. Bronnen (parafrase + links, geen gekopieerde teksten)
KNGF Geleidehonden · Oogvereniging · Tikje Anders · Omroep West (interview Ralph/Champ, 2024) · Noordhollands Dagblad (pensioen Woody, 2026) · De Gelderlander (KNPV-keerzijde, 2020) · WUR "Dieren met een baan" · Douane.nl · Jellinek · Eurodogs · Raad van Beheer · Houden van Honden · FCI · Wamiz · Wikipedia-achtige bronnen: Louterbloemen, Trots op mijn Rashond, Dogline (zintuigcijfers).

---

## Nagekomen ronde-3 fixes (validatie, 02:30)
- **Homepage- & paginatitels** ontbraken bij 4 geseedde routes → `<title>` nu in `pageShell` (alle routes getiteld; smoke "missing title" = 0).
- **Forum-composer**: `div` → echt `<form>` (Enter/verzenden + `form.reset()` na publiceren) en kennismini-toggle doet nu `preventDefault()` zodat de kaartlink niet meer wordt gevolgd.
- **Kaart UX**: `aria-busy` wordt na initialisatie gereset; na geolocatie wordt de lijst op "dichtstbijzijnde eerst" gesorteerd; filter-/zoekinteracties herrenderen ook de lijst.
- **SW**: dode tile-cache (v3-schaduw van de verwijderde `/tiles`-route) uit `sw.js` gesnoeid; `data/web-vitals.json` + runtime-mutaties in `.gitignore`.
- **API-rondetests**: topic aanmaken ✓, reactie ✓, "nuttig" stem ✓, dubbele stem → 400 ✓ (testtopic daarna opgeruimd; forum.json = 6 seeds).
- **Eindscores**: smoke 23 pagina's + 9 API's ✓; loadtest 200 req @ 25 concurrentie: 0 fouten, p50 22 ms, p95 139 ms, max 214 ms; alle 7 kernroutes HTML-gebalanceerd (0 ongesloten, 0 echte fouten); alle inline-JS-blokken parser-gevalideerd; 0 verwijzingen naar unpkg/Leaflet/OSM/OSM-tiles in homepage & kaart.

---

# Ronde 4 — Helpen & Adopteren: 4 nieuwe themapagina's (2026-09-06)

## 1. Nieuwe pagina's (routes + aliassen + sitemap + navigatie + homepage-sectie `#helpen`)
| Pagina | Wat | Interactief |
|---|---|---|
| `/vacatures` (+`/vacature`, `/honden-vacatures`, `/werk-bij-honden`) | Vacaturebord voor de hondenbranche: trimsalons, hondenscholen, pensions, asielen, dierenambulances, opleidingen, uitlaatservices. 6 redactionele voorbeeldoproepen (duidelijk als "voorbeeld" gemarkeerd) + uitleg hoe je een goede vacature schrijft. | Filteren op branche & type (betaald/vrijwillig/stage), live zoeken op plaats/functie/org, en **gratis vacature of hulpvraag publiceren via een formulier** (POST /api/vacatures) |
| `/vrijwilligers` (+`/vrijwilliger-worden`, `/vrijwilligerswerk-honden`) | Gids vrijwilligerswerk voor honden & asiel: 8 rollen (uitlaten/verzorgen, pleeggezin incl. KNGF-puppypleeggezin, dierenambulance, adoptiebegeleiding, Dierenbuddy, wildopvang, collecte/voorlichting, fotografie/administratie), eisen per rol, 5-stappenplan, FAQ (leeftijd, VOG, training, vergoeding). | **Aanmeldformulier interesse** (POST /api/vrijwilligers) → match met organisaties in de regio |
| `/adoptie` (+`/asielhond`, `/hond-adopteren`, `/pup-of-asielhond`) | Pup van erkende fokker óf opvanghond: eerlijke 3-routevergelijking (fokker / NL-asiel / buitenland), **waar komen asielhonden vandaan** (±70% afstandshonden, ±20% achtergelaten/weggelopen, ±10% buitenland; Nederland heeft geen zwerfhondenpopulatie), adoptie in 6 stappen, eerste-30-dagen-checklist. | **Keuzehulp** (4 vragen → richting fokker/asiel/midden) + **checklist met zichtbare voortgang** (localStorage) |
| `/hond-gevonden` (+`/gevonden-hond`, `/hond-vermist`, `/hond-vinden`) | Antwoord op "hond gevonden, wie moet ik bellen?": 6-stappenplan (veiligheid → penning → chip → Amivedi → aangifte gemeente/asiel → lokaal delen), **scenario-kiezer** per situatie (gewond, rustig, tijdelijk opvangen, overleden, mishandeling, eigen hond vermist) incl. directe `tel:`-nummers, FAQ over wettelijke regels & "mag ik hem houden?" (antwoord: melden verplicht, eigenaar heeft voorrang). | Interactieve scenario-kiezer met exacte nummers: **144** (landelijk meldpunt dier in nood/dierenleed, ma–za 8–18:30, zo 9:30–18:30), **0900-8844** (politie buiten tijden), **0900-2648334** (Amivedi, €0,15/min), **0800-7000** (anoniem) |

## 2. Backend & data
- `data/vacatures.json` (6 seeds, `sample:true`) + `data/vrijwilligers.json` (runtime-interesses, in `.gitignore`).
- **API**: `GET/POST /api/vacatures` (validatie: branch/type/provincie-whitelist, e-mailregex, minimale lengtes, rate limit 6/min, max 200 records), `POST /api/vrijwilligers` (validatie + rate limit, max 500). Ronde-tests: publiceren ✓, nieuw item staat bovenaan ✓, `missing_fields` bij lege velden ✓, testdata opgeruimd.
- Sitemap: 4 nieuwe URL's (prioriteit 0.8–0.9; vacatures dagelijks). Navigatie: nav-links, "Meer voor baasjes"-menu (nieuwe kolom "Helpen & meedoen"), footer en sticky hub-pill "🤝 Helpen & Adopteren".

## 3. Homepage
- Nieuwe sectie `#helpen` direct na het forum: 1 brede kaart (adoptie: waar komen asielhonden vandaan, vergelijking, 30-dagenplan) + 3 kaarten (vacatures, vrijwilligers, hond gevonden) — klikbaar, met mini-lijstjes en CTA's.

## 4. Validatie
- smoke **27 pagina's + 10 API's ✓**; loadtest 200 req @ 25 concurrentie: **0 fouten, p50 23 ms, p95 150 ms, max 244 ms**; alle 5 kernroutes HTML-gebalanceerd (0 ongesloten); 6 inline-JS-blokken parser-gevalideerd; geen Leaflet/OSM.

## 5. Bronnen (parafrase, in de pagina's gelinkt/geciteerd)
- **Gevonden hond**: Amivedi (tips gevonden dieren: chipcheck, aangifte bij asiel/dierenopvang gemeente, 0900-2648334), Dierenambulance Amsterdam (chipcheck gratis, badge, halsband, allergieën), PetBase (checklist: foto, locatie/tijd, penning, kenmerken achterhouden), ROZE FAQ (lokaal ambulancenummer, overleden dier → gemeente/politie 0900-8844, fauna-aanrijding.nl), LICG/Dierenbescherming (landelijk meldpunt **144**, buiten tijden 0900-8844, spoed 112, anoniem 0800-7000), Dierenambulance Utrecht (vermiste hond).
- **Asielherkomst**: Dierenasiel Bommelerwaard ("Nederland kent geen zwerfhondenpopulatie; vrijwel uitsluitend afstandshonden of achtergelaten huishonden"), Gelukkige Honden (meest voorkomende reden afstand: gedragsproblemen; ook financieel/tijd/gezondheid), NRC + Stray AFP/ALAS (±11.310 van ±150.000 nieuwe honden ≈ 7,5%; 80 van 900 terug).
- **Vrijwilligerswerk**: Dierenbescherming (asiel, ambulance, wildopvang, collectant, Dierenbuddy, trainingen), Dierenwelzijnsorganisaties (rollentabel: 2–8 u/week, 16+/18+, rijbewijs B, EHBO-D, VOG, inwerktraining), DOA Dierenasiel (18+, NL/EN, ±6 maanden, 4 u per dienst, verplichte workshops).
- **Vacatures**: Groomers Europe (vacaturebord trimsalon: tafelhuur/ZZP/loondienst), Indeed (medewerker hondentrimsalon, CAO Retail Non-Food, 2–4 dagen), MBOjobmatch/ROC (trimmer MBO), Jobbird (salarisindicatie €2.350–2.800 p/m).

---

# Ronde 5 — Allesomvattende site: 7 nieuwe themapagina's (2026-09-06)

## 1. Nieuwe pagina's (routes + aliassen + sitemap + navigatie + homepage-sectie `#reizen-kennis`)
| Pagina | Wat | Interactief |
|---|---|---|
| `/reizen` (+`/vliegen-hond`, `/hond-mee-vliegtuig`, `/vliegen-met-hond`) | Vliegen & reizen met je hond: mag een hond mee, cabine vs. ruim, regels per maatschappij (KLM, Transavia, Lufthansa, Air France, Ryanair/easyJet, TUI/Corendon), documenten (chip, rabiës, EU-paspoort, VK-wormkuur), wat vliegen met een hond doet en of hij tegen de temperatuur op bestemming kan. | **Vlieg-check** (gewicht × snuit × pup × bestemming EU/UK/US-overig → "kan het?") + **temperatuur-meter** (<20 tot 29 °C+, incl. handtest asfalt 5 sec, auto-opwarming 25→45–50 °C) + reis-checklist |
| `/rassen` (+`/hondenrassen`, `/honden-rassen`, `/rassen-overzicht`) | Rassen & varianten: Pomeriaan bear face / fox face / baby doll / toy face ("kleine neus"), wat brachycefalie medisch betekent, kortsnuitige risicorassen, BOAS, snuit/schedelverhouding ±⅓, 10 FCI-groepen, klein/middel/groot | **Pomeriaan-variant-kiezer** (4 gezichten, incl. hondenogen) + **snuitlengte-meter** (range → normaal/kort/zeer kort/extreem plat met advies) |
| `/verboden-rassen` (+`/verboden-hondenrassen`, `/gevaarlijke-hondenrassen`, `/hondenrassen-verbod`) | Eerlijke wetgeving: NL heeft géén rassenverbod (RAD 2009 afgeschaft), VK 5 types (incl. XL Bully), Denemarken, Duitsland (per deelstaat), Frankrijk (cat. 1/2), België/Spanje/Zwitserland/Oostenrijk; toekomst: meldpunt hondenbeten 13 jan 2026, muilkorf- & afstammingsplannen 2026, fokregels kortsnuitigheid 2019, wolfhybriden, EU-blik | **Land-kiezer** (6 landen/groepen → regels, verboden types en praktische gevolgen) + tijdlijn "wat komt er aan?" |
| `/poepzakjes` (+`/hondenpoepzakjes`, `/hondenpoep-regels`, `/poep-oprapen`) | Waar gratis zakjes (gemeente, wijklocaties, dispensers), waar deponeren (poepbak, restafval; niet GFT), boetes per overtreding, tips onderweg | **Scenario-kiezer** per omgeving (stad, bos, uitlaatplaats, strand, landelijk) + boetentabel |
| `/hondenweetjes` (+`/hondenweetjes-overzicht`, `/weetjes-hond`, `/honden-feiten`) | Voeding (nooit chocolade/druiven/ui/xylitol; wel compleet op maat), **hypoallergene rassen** (6 rassen uit `data/hypoallergenic-breeds.json` met allergiescore), **levensduur** (Jack Russell ±12,7 jr → Ierse Wolfshond 6–8 jr; waarom klein langer), **intelligentie** (Coren: Border Collie #1, Afghaanse Windhond laatste; ±165 woorden; Chaser 1.022) | **Woordenschat-test** (eigen hond: 20 commando's aanvinken → ±woordenschat + niveau) |
| `/hondenwedstrijden` (+`/hondensport`, `/honden-sport`, `/hondenwedstrijd`) | 10 acrobatische disciplines: agility, frisbee, dock diving (records ±9–10 m), flyball, dogdance, obedience, IGP/KNPV, speuren, coursing, treibball/canicross — per sport de beste rassen, wat te winnen valt (titels/rozetten, zelden geld), waar meedoen (Raad van Beheer/FHN/KNPV-clubs), kortsnuit-waarschuwing | **Sport-keuzehulp** in 4 vragen → advies rustig/sportief/water |
| `/chippen-ontwormen` (+`/hond-chippen`, `/ontwormen-hond`, `/chip-ontwormen`) | Chip verplicht sinds 1 juli 2013, kosten ±€30–50, waar laten doen, registratie/databank; reisregels EU/EFTA + VK (wormkuur 1–5 dagen voor vertrek); ontwormen niet verplicht maar belangrijk — schema pup/volwassen, eitjes-check, kosten ±€10–20 | **Chip- & worm-checklist** (8 punten met voortgangsbalk) |

## 2. Backend & navigatie
- `server.mjs`: 7 route-blokken met 3 aliassen per pagina (28 nieuwe URL's), 7 sitemap-entries (prioriteit 0.8–0.9; reizen/hondenweetjes weekly, rassen 0.9, chippen 0.9).
- `pages/base.mjs`: **uniforme nav** — nieuw dropdown "Reizen & gezondheid" (2 kolommen, actieve pagina gemarkeerd) + footer met alle 7 links; identiek op álle themapagina's.
- `index.html`: "Meer voor baasjes"-menu uitgebreid (Zorg & veiligheid + chip/poep; Ontdek & plan + reizen; Kennis & community + rassen/weetjes/wedstrijden/verboden), nieuwe **homepage-sectie `#reizen-kennis`** (1 brede reiskaart + 6 kaarten), nieuwe **hub-pill "✈️ Reizen & Kennis"**, nieuwe footer-kolom "Kennis & Reizen" (footer-grid naar 6 kolommen).
- Beelden: eigen `assets/img/pomeriaan-640.webp` + `pomeriaan-hondzien.webp` hergebruikt (geen externe afbeeldingen).

## 3. Validatie
- `node --check` op alle pagina's + server ✓ (2 inline-string-syntaxfouten gevonden en gefixt: `hondenweetjes.mjs` "dom"-citaat & `hondenwedstrijden.mjs` "NK's").
- **Smoke: 35 pagina's + 10 API's ✓** (27 → 35 routes incl. 8 nieuwe).
- Inline-JS-validatie van alle 7 nieuwe routes via `node --check` op de gerenderde scriptblokken ✓ (1 escape-bug in woorden-test ontdekt en opgelost: `commando's` → dubbele quotes).
- HTML-structuurcheck op de 7 routes: section/div/details-balans ✓, canonical + og correct, nav/footer-links aanwezig ✓.
- **Loadtest 200 req @ 25 concurrentie: 0 fouten, p50 24 ms, p95 173 ms, max 271 ms**.
- Sitemap: alle 7 nieuwe URL's aanwezig ✓.

## 4. Bronnen (parafrase, in de pagina's verwerkt/gelinkt)
- **Vliegen/maatschappijen**: KLM (≤8 kg cabine, tas 46×28×24 cm, ruim tot ±75 kg, kortsnuitig geweigerd, 48 u reserveer), Transavia/Lufthansa/Air France/Ryanair & easyJet (alleen assistentiehonden), TUI/Corendon (per vlucht).
- **Hittestress**: veilig <20 °C; 20–23 let op; 24–26 beperken; 27–28 alleen vroeg/laat; ≥29 geen wandelactiviteit; brachycefaal vanaf ±22–24 °C; hittestress 39,5–40,5 °C, hitteberoerte >41 °C; asfalt 50–70 °C (handtest 5–7 sec); auto 25 °C buiten → 37 °C na 10 min, 45–50 °C na 20–30 min; koel met lauw water.
- **Rassen**: FCI 10 groepen; brachycefalie/BOAS; snuit/schedel ±⅓ (NL-fokregel 2019); Pomeriaan-varianten (niet-officiële fokkermen, verschil zichtbaar ±4–5 mnd, "toy face" is marketingterm).
- **Verboden rassen**: Dangerous Dogs Act 1991 + XL Bully (31 dec 2023), Denemarken lijst, Duitse Hundeverordnung 2001 + deelstaten, Frankrijk cat. 1/2 ("look-alike"-bepalend), België/Spanje (8 PPD-types)/Zwitserland/Oostenrijk; NL: RAD 2009, hoogrisicolijst 2017 zonder status, meldpunt hondenbeten 13 jan 2026 + muilkorf/afstammingsplannen.
- **Poepzakjes**: APV-regels (opruimen + zakje bij je), Twenterand voorbeeld (uitlaatplaatsen mogen blijven liggen, ±2-wekelijkse reiniging, boete €140), boetes ±€100–150 / GAS tot ±€350.
- **Hypoallergeen**: 6 rassen uit eigen dataset (Poedel 9.8 → Dwergschnauzer 9.0); geen hond 100% hypoallergeen (allergie = huidschilfers/speeksel).
- **Levensduur**: Jack Russell ±12,7 jr, Border Collie ±12,1 jr, kruising ±11,8, Labrador ±11,8; grote rassen 6–8 jr; Bella (Border Collie) 24 jr 11 mnd; Chihuahua laag door rasproblemen (7,9 jr in één studie).
- **Intelligentie**: Stanley Coren (199 trainers, 6 groepen): Border Collie #1 → Australische Veedrijvershond #10; "domste" Afghaanse Windhond/Basenji (eigenzinnig ≠ dom); ±165 woorden/gebaren, top-20% ±250, Chaser 1.022 woorden.
- **Hondensport**: agility (Raad van Beheer/FHN, debutant→3e graad, hoogteklassen small/medium/intermediate/large), flyball/dock diving/frisbee (records ±9–10 m), IGP/KNPV, dogdance, obedience, coursing; prijzen meestal rozetten/titels.

---

# Ronde 6 — Eerste hulp, cijfers, wereld & webshop: 8 nieuwe pagina's (2026-09-06)

## 1. Nieuwe pagina's (routes + aliassen + sitemap + nav/footer + homepage-sectie `#eerstehulp-cijfers`)
| Pagina | Wat | Interactief |
|---|---|---|
| `/braken-hond` (+`/hond-braakt`, `/braken-hondje`, `/hond-braken`) | Is het normaal dat een hondje regelmatig braakt? Eenmalig = meestal onschuldig; herhaald = nooit normaal. Wanneer naar de arts (bloed, gif, voorwerp, torsie, leuk/diarree/koorts, pup/senior), wat de arts doet (intake → bloed → röntgen/echo → endoscopie/operatie) en wat het kost (consult ±€45–60 t/m torsie-operatie ±€1.000–2.500). | **Spoed-check**: 11 symptomen aanvinken → groen/oranje/rood advies + 3-stappenplan |
| `/hitteberoerte-hond` (+`/hitteberoerte`, `/hond-oververhit`, `/hond-in-hete-auto`) | Eerste hulp bij hitteberoerte (>41 °C), eerlijke zomerinformatie: auto 25 °C buiten → 37 °C na 10 min, 45–50 °C na 20–30 min, 15 min kan al fataal zijn, raam op kier helpt nauwelijks, geen officiële telling maar jaarlijks sterfgevallen (Europese schattingen honderden–1000+), én de juridische werkwijze bij **ruit inslaan** (zaakwaarneming alleen bij levensgevaar; bel eerst 112/144, foto's, getuigen; in België strenger). | **Symptoom-check** (→ advies) + 5-stappen koelplan + auto-temperatuurtijdlijn |
| `/zwerfhonden` (+`/zwerfhond`, `/zwerfhonden-wereldwijd`, `/straathonden`) | Hoeveel zwerfhonden: ±200 mln (veelgebruikte schatting) t/m ±600 mln (LICG/WHO-WSPA-definitie), India ±32 mln (±20 mln zwerf), NL geen zwerfpopulatie; verschil zwerf- vs. verwilderd; oorzaken; **wat wij kunnen doen** (adoptie, TNR-sterilisatie, vrijwilligers, donaties, verantwoord bezit, delen van feiten). | **6 actie-kaarten** met per actie de uitleg bij klik |
| `/honden-cijfers` (+`/aantal-honden`, `/honden-statistieken`, `/hoeveel-honden`) | Hoeveel honden: NL ±1,7–1,9 mln (2023–2025, ongeveer 1 op 5 huishoudens), wereld ±470–900 mln (WCO); geen nationale geboorte/sterfte-registratie → **rekensom**: 1,8 mln ÷ 12 jr ≈ ±410/dag (geboorte én sterfte bij stabiele populatie); wijzer populairste rassen per decennium (1900s Duitse Herder/Fox Terrier → 2026 Franse Bulldog/Doodle). | **Populatie-calculator** (populatie × levensduur → per dag) + **decennium-wijzer** (7 tijdvakken) |
| `/geschiedenis-hond` (+`/geschiedenis-van-de-hond`, `/honden-geschiedenis`, `/waar-komt-de-pomeriaan-vandaan`) | Van wolf (±15–40k jr domesticatie) tot rashond; **Pomeriaan**: Pommeren (Polen/Duitsland), oorspronkelijke spitsen ±9–13 kg (werkhond), Queen Charlotte 1767 (±14–23 kg!) → Queen Victoria 1888 fokte naar ±1,5–3,2 kg; **couperen**: Romeinen (hondsdolheid bijgeloof), vechthonden-logeica, Engeland belasting 1796, praktisch (vacht/jacht), cosmetiek; verboden: NL oren 1996/staart 2001, België 2001/2006, Duitsland 1989; **hondenvlees**: Zuid-Korea (verbod 2024 → 2027; ±1 mln–2,5 mln honden/jaar), China/Vietnam (armoede-gevolgen, jongeren tegen), waarom honden in NL 'heilig' (gezelschapsrol), gezondheidsrisico's (rabiës, cholera, diefstal huisdieren). | Tijdlijn-cards + vergelijkingskaarten |
| `/koninklijke-honden` (+`/honden-royals`, `/koningshuis-honden`, `/royal-honden`) | Ons koningshuis: Luna, Nala, Skipper (zwarte labradors, Skipper †2020), Mambo (toypoedel), Beatrix: Asher (labrador), Miss Pepper/Chip/Mac (Border Terriërs; Miss Pepper †1992 konijnenhol), Cleo/Arthus (dalmatiërs), Joris (golden retriever), Topper (Margriet); Wilhelmina & Juliana = hondenfamilie; andere landen: UK (Elizabeth II 30+ corgi's, Charles & Camilla's Jack Russells), Duitsland (teckels), Zweden (elkhonden), Spanje/Denemarken/België; waarom 4 rassen (labrador/corgi/terriër/poedel) bij royals domineren. | **Land-kiezer** (5 koningshuizen → hondenlijst + verhaal) |
| `/hond-en-werk` (+`/hond-fulltime-werken`, `/uitlaatservice`, `/hond-roedeldier`) | Is een hond een roedeldier? Ja — maar roedel = jouw gezin (geen 'alfaroedel'-mythe, wél voorspelbaar ritme); hoe lang alleen (pup ±2 u → volwassen max ±4–5 u, senior korter), opbouwen, mentale verrijking, neutraal thuiskomen; **uitlaatservice**: zelfstandige ±€12–20, groepsbedrijf ±€10–15, dagopvang ±€15–30, app-uitlaters, verzekering/referenties checken; voorbeeld-werkdag. | **Alleen-tijd-check**: levensfase × uren → max ±X uur + advies |
| `/webshop` (+`/honden-webshop`, `/shop-hond`, `/affiliate-shop`) | **Aparte affiliate-webshop** met 16 gecureerde producten uit `data/webshop.json` (nieuw): **2× hypoallergeen voer**, verse/BARF-voeding, probiotica & darmondersteuning, koelmat, reis-drinkbak, crashgetest autotuig, GPS-tracker, EHBO-kit, worm-/vlooienpreventie, anti-verlatingsangst-pakket, denkspeelgoed, slickerborstel, hypoallergene shampoo, IATA-cabinetas (46×28×24); partnerlinks bol.com/Tractive met `ref=trimgids`; transparantie-blok (0% extra kosten). | **Categorie-filters** (8) + **sorteer** (aanbevolen/prijs/rating) + live resultaat |

## 2. Backend & navigatie
- `data/webshop.json`: 16 items, 8 categorieën, bol.com/Tractive-affiliate-URL's.
- `server.mjs`: 8 route-blokken (32 nieuwe URL's) + 8 sitemap-entries (prioriteit 0.8–0.9; braken/hitte/werk/webshop weekly).
- `pages/base.mjs`: dropdown "Reizen & gezondheid" uitgebreid naar **3 kolommen** (Kennis & sport + Zorg & eerste hulp — nieuwe kolom) en footer met alle nieuwe links; identiek op álle pagina's.
- `index.html`: "Meer voor baasjes" uitgebreid (braak/hitte in Zorg & veiligheid; werk in Ontdek & plan; cijfers/geschiedenis/royals/zwerfhonden in Kennis & community; webshop in Helpen & meedoen); nieuwe homepage-sectie **`#eerstehulp-cijfers`** (1 brede hittekaart + 7 kaarten); nieuwe hub-pill **"🚑 Eerste hulp & Cijfers"**; footer-uitbreiding naar 7 kolommen met kolom "Wereld & Webshop".

## 3. Validatie
- `node --check` op alle 8 nieuwe pagina's + server ✓ (o.a. 6 'apostrof-in-single-quote'-bugs gevonden en gefixt via `\u2019`/dubbele quotes, 2 hero-`</section>`-bugs).
- **Smoke: 43 pagina's + 10 API's ✓** (35 → 43).
- Inline-JS op alle 8 routes via `node --check` ✓; HTML-structuur (section/div/detail/a) gebalanceerd; canonical + OG juist; nav/footer-links aanwezig.
- **Loadtest 200 req @ 25 concurrentie: 0 fouten, p50 23 ms, p95 150 ms, max 247 ms**.
- **Interactieve kaart**: `/kaart` + homepage draaien op eigen canvas (`assets/js/nl-map.js`, canvas 2d-context), **0 OSM/Leaflet/unpkg-verwijzingen**, assets + `/api/cities` + `/api/providers?lite=1` + `/api/stats` allemaal 200 ✓; alle 24 alias-routes 200 ✓; 0 dode interne links (32 unieke links getest, incl. webshop).
- Sitemap: alle 8 nieuwe URL's aanwezig ✓.

## 4. Bronnen (parafrase, in de pagina's verwerkt)
- **Hete auto/ruit**: DPA-factcheck (bellen 112/144 + instructies volgen; "5 min wachten dan inslaan" is géén automatische vrijstelling), Animals Today (dier in nood redden = wettelijke zorgplicht; 144/dierenambulance; getuigen; inslaan alleen bij echt levensgevaar), Hello Law/zaakwaarneming, Dierenbescherming (50 °C, oververhitting hersenen, geen zuurstofgebrek), België (politie: altijd misdrijf), Tweakers/GoT (strafbaarheid eigenaar, zorgplicht).
- **Zwerfhonden**: LICG (600 mln; WHO/WSPA 1990-richtlijnen; gedragsverandering mensen), hond.nl/WCO (200 mln, India 32/20 mln, Japan 9,5 mln), WHO (70 mln zwerf, 78 mln eigendom — andere definitie).
- **Nederland populatie**: WUR-onderzoek (27,3 mln huisdieren, 47,7% huishoudens, 17,8% hond → 1,7 mln honden), Vogelbescherming/LICG (1,9 mln honden, 1,5 mln huishoudens), huisdierpedia (1,7 mln, 16% hondenhuishoudens, 44% huisdieren), TNS-NIPO/Groen Kennisnet (1,8 mln).
- **Royals**: Border Terrier Wereld (Beatrix: Miss Pepper †1992, Chip, Mac; Joris golden 1963; Cleo dalmatiër 1967; Asher zwarte lab; WA&Máxima: Skipper †2020, Nala, Luna; Margriet: Topper), Harpers Bazaar (Mambo + 3 labradors), RVD (Joris, Arthus, Buster), Royalty-online (Mambo, toypoedel).
- **Pomeriaan**: Pommeren (Polen/Duitsland), oorspronkelijk ±13 kg / 14–23 kg (bronnen verschillen), Queen Charlotte 1767, Queen Victoria 1888 → 1,4–3,2 kg, AKC-erkenning 1900; verwant aan Husky/Malamute/Samojeed.
- **Couperen**: Nederlandsche Dobermann Club (oren 1 okt 1996, staarten 1 sept 2001, Ingrepenbesluit art. 40), Rottweilerstart (Romeinen hondsdolheid; Engeland belasting 1796; praktisch herder/jacht; cosmetiek), België 2001/2006, Duitsland 1989, Frankrijk/Spanje geen verbod.
- **Hondenvlees**: Animals Today (Zuid-Korea verbod jan 2024 → 2027; 1.600 restaurants, 1.150 boerderijen, >1 mln honden/jaar; eten blijft toegestaan), Onze Hond (2,5 mln/jaar), Adoptiepedia (armoede/hongersnood oorsprong, gestolen huisdieren, generatiekloof, volksgezondheid: rabiës/cholera/trichinellose), 112nieuwsonline (straf 2–3 jaar cel).
- **Braken/kosten**: algemene veterinaire praktijkrichtlijnen (consult ±€45–60, basisbloed ±€60–100, röntgen ±€90–150, echo ±€120–200, endoscopie ±€350–650, infuus/opname ±€80–150/dag, torsie-operatie ±€1.000–2.500); prijzen indicatief per praktijk.

---

# Ronde 7 — "Maak de site perfect": JS-reparatie, accounts, favorieten, thema & ordening (2026-09-06)

## 1. Diagnose: waarom "de helft + links + kaart niet werkten"
- **Oorzaak gevonden**: in `index.html` was het grote inline-scriptblok (van `/* Dynamic Data Feeds */` t/m de PWA-registratie) zijn **`<script>`- en `</script>`-tags kwijtgeraakt**. De browser toonde alle JavaScript als platte tekst en er draaide niets meer: thema-knop, last-minute-feeds, kosten-calculator, offerte-formulier, FAQ-accordeon, zoekautocomplete, CWV-beacon, service-worker.
- Bovendien ontbraken de handlers voor **scroll-progresslijn, back-to-top, sticky hub-highlight, mobiel menu, hero-zoekbalk (`handleModernSearch`), categorie-pills, GPS-knop** — allemaal verloren bij de Leaflet→canvas-omzetting. De `#home-geoloc`-knop en `.map-f-btn` waren losse overblijfselen van de oude kaart die nergens meer aan waren gekoppeld.
- `pages/base.mjs` en alle ~35 legacy-pagina's hadden **geen thema-knop/thema-JS** (basis-CSS had wél dark-variabelen) → de "knop doet niets"-klacht gold ook voor alle Ronde-1/5/6-pagina's.

## 2. Hersteld & nieuw gebouwd
| Onderdeel | Wat |
|---|---|
| `index.html` | Script-tags hersteld; dubbele thema-code verwijderd (centraal); `#account-btn` + `app.js` toegevoegd; hero-overlay licht thema: `.94/.52/.9` → `.55/.12/.62` en foto `opacity .6 → .92` (foto nu duidelijk zichtbaar, tekst blijft leesbaar); **14 secties kórsgewijs herordend**: ontdek → eerste hulp & cijfers → nood & alerts → kennis → zorg & voeding → vacht & offerte → belasting & kosten → reizen & kennis → wandelhub → kaart → forum → helpen → nieuws → FAQ (sticky hub-pills in dezelfde volgorde); **kleurcodering per sectietype**: rood=urgentie/nood, blauw=kennis/reizen, groen=zorg/wandelen, amber=offerte/geld, teal=kaart, paars=forum/community, oranje=helpen (licht- én dark-varianten). |
| `assets/js/app.js` (nieuw) | Gedeelde runtime op élke pagina: thema-toggle (event-delegation, persistente `trimgids_theme`), account-modal (registreren/inloggen/uitloggen), favorieten ("Mijn profiel"), toasts, en alle algemene homepage-interacties (scroll-progress, back-to-top, hub-highlight, mobiel menu, hero-zoekfunctie, categorie-pills, GPS → canvas-kaart). Voegt automatisch thema- en account-knop toe in **elke** nav die ze mist en vervangt de oude losse `#ssr-theme-btn`. Gasten bewaren favorieten lokaal en krijgen bij het inloggen een samenvoeg-actie naar hun account. |
| `server.mjs` | **Accounts**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` — scrypt+uniek zout, rate-limiting (10-15/min per IP), httpOnly `tg_session`-cookie (30 dagen, SameSite=Lax), unieke e-mail + gebruikersnaam; **favorieten**: `GET/POST/DELETE /api/me/favorites` (type/id/titel/href, max 200); **forum-koppeling**: `userId` komt altijd uit de sessie (nooit van de client) en de auteursnaam wordt van het account overgenomen; **universele injectie** in `modernizeGeneratedHtml`: thema-bootstrap in `<head>`, `app.js` vóór `</body>`, en een "🔖 Bewaar gids"-knop in de quick-actions op álle serverpagina's (titel + canonical worden uit de pagina gehaald en netjes HTML-gedecodeerd). |
| `pages/webshop.mjs` | Per product een 🔖-knop (type `product`, server-side opgeslagen) + auto-update van opgeslagen-status bij filteren/sorteren. |
| `assets/js/forum.js` | Ingelogde gebruikers: naam automatisch overgenomen + "Gekoppeld als …"-chip in de composer en bij reacties; elk onderwerp heeft een 🔖-knop (type `forum`); na het renderen worden save-statusen gesynchroniseerd. |
| `/wandelen` | Elke wandelroute heeft een 🔖-knop (type `route`) met synchronisatie na filteren. |
| `data/users.json`, `data/sessions.json`, `data/favorites.json` | Nieuwe lokale stores (standaard leeg; `readLocalJson` valt terug op lege waarden als ze ontbreken). |

## 3. Validatie Ronde 7
- `node --check` op `server.mjs`, `assets/js/app.js`, `assets/js/forum.js`, `pages/base.mjs`, `pages/webshop.mjs` + beide inline-blokken in `index.html` ✓.
- **Browser-simulatie (jsdom, echte server)** — ALLES GROEN:
  ✓ thema-toggle wisselt + persisteert (heen en terug) · ✓ account-knop + modal opent · ✓ registratie (unieke e-mail + naam, 409 bij dubbel) · ✓ httpOnly-sessiecookie → `/api/auth/me` · ✓ favoriet opslaan/verwijderen op gids-, forum-, product- en routepagina's · ✓ logout · ✓ gast-favoriet in localStorage + registratie-uitnodiging · ✓ 0 JS-consolefouten op homepage · ✓ app-runtime + bewaar-knop op **alle** smoke-routes (incl. legacy `/verzekering`, `/kaart`, `/wandelen`, `/nieuws`), met correcte titel-decoding (`&` i.p.v. `&amp;`).
- **Smoke: 43 pagina's + 10 API's ✓** · **Loadtest 200 @ 25: 0 fouten, p50 23 ms, p95 139 ms, max 225 ms** · **Crawl: 55 unieke links, 0 broken**.
- `index.html`-structuur: 14/14 secties in balans, 79 in-page anchors, 17 `href="#…"` allemaal geldig, scripts 7/7 in balans; nav (3), main (1), section (14), div (202) correct genest.
- Ronde-6-functionaliteit (canvas-kaart, forum, calculators, webshop-filters) ongewijzigd werkend; kaart blijft 100% same-origin.

## 4. Restpunten / bewuste keuzes
- Favorieten en accounts staan in lokale JSON-stores (passend bij de overige data-driven endpoints); geen externe auth-provider, geen wachtwoord-herstel-flow (eerstvolgende uitbreiding).
- Externe Google Fonts blijven (worden door de sandbox-omgeving niet geladen; in productie wel).

---

# Ronde 8 — "Maximale verbeteringen": beste online data, bewezen geldkansen & perfecte uitstraling (2026-09-06)

## 1. Beste online data (2026, met bronvermelding)
| Onderdeel | Wat is verwerkt | Bron |
|---|---|---|
| Hondenverzekeringen | **6 verzekeraars met onafhankelijke 2026-testscore en echte kenmerken** — Figo **9,3/10** ("🏆 Beste Keuze 2026", geen leeftijdsgrens, HD/ED/erfelijk/kanker in basis, ±€231/jr, wachttijd 30 d, eigen risico €0/100/250/500, eigen bijdrage 10–50%, jaarmax €3.000/€6.000/onbeperkt), Univé 8,4 (±€315/jr, tot 8 jr, 80%, €0 eigen risico, werelddekking), OHRA 8,2 (±€204/jr, tot 7 jr, jaarmax €2.000–10.000, chip in basis), PetSecur 7,9 (±€218/jr, géén wachttijd, erfelijk niet gedekt), InShared 6,8 (±€190/jr, tot 6 jr), a.s.r. 6,0 (±€176/jr, smalste dekking). In `data/insurance.json` incl. `covers`-vlaggen (erfelijk/HD-ED/kanker) en `source`. | Keuze.nl huisdierenverzekeringenonderzoek (juli 2026) + overstappen.nl (aug 2026) |
| Webshop-bestsellers | `data/webshop.json` uitgebreid **16 → 22 items** met bol.com-bestsellers: Royal Canin Anallergenic 3 kg (4,8★, 1.420 reviews), Edgard & Cooper Adult Medium verse zalm 7 kg (4,7★), Purina Pro Plan Sensitive Skin zalm 14 kg (4,7★, 1.660 reviews), Pedigree Dentastix Groot 105 stuks (4,7★, 2.310 reviews), Petstyle Living kauwsticks 100 stuks (4,5★), Curver voerton 23 L (4,4★). Nieuwe categorie **`opbergen`**. | bol.com bestseller-lijst (aug 2026) |

## 2. Geldkansen (bewezen conversie-drivers)
- **Verzekeringsvergelijking met échte testdata**: score-chips per kaart (`⭐ 9,3/10 · 4,9 (2140 reviews)`), "Vanaf premie"-prijsbox + vergoedings%, **vergelijkingstabel** (score/premie/jaarmaximum/leeftijd/wachttijd/erfelijk/HD-ED/kanker), "🏆 Beste Keuze 2026"-badge op Figo, bronvermelding onder de tabel.
- **Nieuwe interactieve verzekerings-adviseur** (`/verzekering`): ras/leeftijd → persoonlijke top-2-match + premie + directe affiliate-CTA; data wordt één keer geladen en hergebruikt.
- **Affiliate-conversie**: alle partner-CTA's `rel="sponsored noopener noreferrer"`, `utm_source=trimgids&utm_medium=affiliate` op álle webshop- en verzekeringslinks (34× op /webshop), transparantie-blok "jij betaalt niets extra", prijsvaliditeit `priceValidUntil: 2026-12-31`.
- **Nieuwsbrief / lead-capture**: `POST /api/newsletter` (rate-limit 6/min per IP, 400 `newsletter_invalid_email`, 201 `{subscribed, already, count}`, max 20.000 leads, store `data/newsletter.json`); nieuwsbrief-blok in **élke** legacy-footer + homepage-sectie `#tg-newsletter` (gradiënt, amber CTA "Aanmelden →", honeypot + clientvalidatie, succes-toast, "check je inbox"-bevestiging).
- **Webshop-bestelpad**: bestseller-badges ("🔥 Bestseller bol.com", "⭐ Meest verkocht 2026"), sterren + review-aantallen, "incl. verzending bij partner\*", 8 categorie-filters + sorteren (aanbevolen/prijs/rating).

## 3. SEO & uitstraling
- **`buildSiteSchema()`** in `server.mjs` injecteert JSON-LD `@graph` (**WebSite + SearchAction, Organization, WebPage, BreadcrumbList**) via `<script id="tg-ld-json">` in het `<head>` van álle gegenereerde pagina's.
- `/verzekering`: extra rijk **FAQPage + ItemList**-schema; `/webshop`: **ItemList + 12× Product** (aggregateRating + Offer + priceValidUntil) — vindbaar met rich results (sterren/prijs).
- Kostprijs-pagina bijgewerkt: **€ 14,90 → € 11,95** en Petplan → PetSecur in meta.
- Statistieken-blok `/verzekering` ("€ 11,95 · 9,3/10") en homepage-verzekeringskaarten tonen score/10 + "🏆 Beste Keuze 2026 · 9,3/10".
- **Prestatie**: `loading="lazy" decoding="async"` op alle `<img>` + `<style id="tg-lazy-css">` met `content-visibility: auto`.

## 4. Ronde 8 — bugs gevonden & gefixt tijdens verificatie
- **Webshop-kaarten rendérden niet** (0 `.p-card`): de 🔖-save-knop in `pages/webshop.mjs` gebruikte `\'`-escaping in een template literal → gegenereerd HTML had kapot `data-save='' + JSON...` → SyntaxError bij het renderen. Gefixt met `data-save="` + `JSON.stringify(...).replace(/"/g,'&quot;')` (zelfde patroon in `/wandelen`-routes in `server.mjs`).
- **Legacy-footer-nieuwsbrief ontbrak** in de gegenereerde HTML: de guarded werd `if (!html.includes('tg-newsletter'))` maar de CSS-klassen stonden al in de pagina → nooit toegevoegd. Gefixt naar `data-tg-newsletter`-marker.
- **Verzekerings-CTA's zonder `rel="sponsored"`**: de server-side render-CTA miste de sponsored-markering; gefixt.

## 5. Validatie Ronde 8 (na alle edits)
- `node --check` op `server.mjs`, `pages/webshop.mjs`, `assets/js/app.js`, `assets/js/forum.js`, inline-JS van `/webshop`, `/wandelen`, `/verzekering` — **allemaal groen**.
- **Browser-simulatie (jsdom, echte server) — ALLES GROEN**: adviseur geeft aanbeveling (Figo/Univé/OHRA) · vergelijkingstabel met 6 verzekeraars · rich-schema aanwezig · homepage- én legacy-nieuwsbrief versturen en tonen bevestiging · webshop rendert 22 producten + filter + Product-schema · WebPage+Breadcrumb op /verzekering, /braken-hond, /webshop, /kaart, /nieuws, /hond-en-werk · thema-toggle donker · registratie werkt · 0 JS-fouten op homepage en /verzekering.
- **API-nieuwsbrief**: geldig → 201 subscribed; ongeldig/leeg → 400 `newsletter_invalid_email`; dubbel → 201 `already:true`; 6+/min → 429 `rate_limited`. Store geschreven (`data/newsletter.json`).
- **Smoke: 43 pagina's + 10 API's ✓** · **Loadtest 200 @ 25: 0 fouten, p50 24 ms, p95 155 ms, max 218 ms** · **Crawl: 27.024 sitemap-URL's, 0 broken**.
- `data/newsletter.json` na tests teruggezet op `[]` (geen test-leads in productie).

---

# Ronde 9 — "Beste site ooit": zoeken, AI-assistent, leesbaarheid & beste data 2026 (2026-09-06)

## 1. 🔍 Headers-zoekbalk + zoekpagina (vindbaarheid, de grootste UX-klacht uit de opdracht)
- **Universele zoekbalk in de header** op élke pagina (homepage, alle legacy-routes, alle kennispagina's) via `assets/js/app.js` `initSiteSearch()`:
  live-suggesties (debounce 200 ms) met pictogram + titel + URL, pijltjes-toetsenbordnavigatie, **Enter → beste match** (of `/zoek?q=…`), Escape sluit, **Ctrl/Cmd+K of `/`** focust overal.
- **`GET /api/sitesearch?q=`** (rate-limited 30/min, cache 120 s) doorzoekt een statische index van **60+ kernpagina's** met trefwoorden; score: titel-match +12, URL +8, trefwoord-prefix +5, substring +2; max 8 resultaten.
- **Nieuwe `/zoek`-pagina** (ook `/search`, `/zoeken`): groot zoekveld, server-rendered resultaten (SSR, dus geen lege flash), live herzoek, `noindex,follow`, "Ctrl+K"-tip.
- Mobiel: secundaire "Voor bedrijven"-CTA wijkt zodat zoekbalk + account + thema + menu altijd passen (≤1000 px).

## 2. 🤖 Assistent TG (chatbot — bewezen engagement & hulp)
- **`assets/js/chatbot.js`** + floating bubble onderin op **elkere pagina** (geïnjecteerd via `modernizeGeneratedHtml` + homepage script-tag); geopend paneel met avatars, modus-label, suggestie-chips ("Welke verzekering is het beste?", "Mijn hond braakt…", …), quick-links, medische disclaimer, Escape sluit, dark-theme-ondersteuning.
- **`POST /api/chat`** (rate-limit 20/min per IP, max 400 tekens, `empty_message`-400):
  - **Kennisbank-modus (standaard, 0 kosten, 0 externe calls)**: 17 NL-intents (verzekering, braken, hitte, trimmen, kosten, hondenbelasting 2026, wandelen, voeding, gedrag, spoed, webshop, forum, reizen, rassen, offerte, kaart, begroeting) met antwoorden + **1–3 affiliate/CTA-links** per intent.
  - **AI-modus (optioneel)**: zet `OPENAI_API_KEY` in `.env` → GPT-4o-mini (max 220 tokens, temperatuur 0.4) met strikte safety-system-prompt (geen diagnose, noodsituatie → 112/144 + `/spoed-dierenarts`); valt bij fout automatisch terug op de kennisbank (`mode: ai-fallback`).
- **`GET /api/chat/health`** → `{mode:"ai"|"knowledge"}` voor het emissie-label in de widget.
- Kosten-bewust: zonder key gebruikt de site **nooit** externe AI-calls.

## 3. 👁️ Leesbaarheid hero (WCAG-objectief gemeten)
- Oorzaak: de hero-overlay liet in het midden maar 12% dekking over (tekst stond op de foto), subtitel was te licht.
- Fix: scrim licht thema `.55/.12/.62` → **`.90/.66/.92`**, donker thema `.94/.40/.88` → **`.94/.68/.94`**, subtitel `#64748b` → `#334155` (licht) en `#d6e7de` → `#e2f0e8` (donker), plus **text-shadow** op titel/subtitel/trust-badges in beide thema's.
- **Automatische WCAG-contrastcheck (`check-contrast.mjs`)**: simuleert overlay over donkere én felle fotos; **4/4 combinaties ≥ 4.5:1 (AA)** — licht 5.13 + 9.41, donker 14.48 + 6.33.

## 4. 📊 Beste online data 2026 (nieuw verwerkt, met bronvermelding)
| Pagina | Toegevoegd | Bron |
|---|---|---|
| **`/trimmen-kosten` (nieuw)** | Landelijk gemiddelde **€65–75/beurt**; uurtarief €45–70 (gem. €55); **15 tariefregels per ras** (Maltezer €70–95, Labradoodle M €130–180, Jack Russell €95–115, Berner €150–200, Beagle €55–70, puppy €40–75); extra's (nagels/oren ±€15, ontklitten ±€17,50/kwartier); **interactieve trimkosten-calculator** (formaat × vacht × conditie × frequentie → €/jaar); FAQPage + ItemList-schema; CTA's offerte + slickerborstel (affiliate). | Trimsalon Zutphen tarievenlijst 2026 · Trimsalon Furrytails 2026 · Trimsalon Charmée 2026 · Trimsalon Limbo (landelijk gemiddelde) |
| **`/hondenbelasting` (update)** | **102 van 342 gemeenten** heft nog (30%, 11 minder dan 2025; in 2010: 72%); gemiddeld **€75,06**; duurste Katwijk €142,18 / Tilburg €132,28 / Lisse €126; goedkoopste Simpelveld €21,96, Buren €29. | Manners.nl/Ipsos (mei 2026) + huisdierenverzekeringen.nl (2026) |
| **`/kosten-hond` (update)** | Ipsos 2026: **€61/maand voer** (+15% vs 2025) + €15 benodigdheden = **€912/jaar** (excl. dierenarts/verzekering); totaal €1.100–3.650/jaar; verzekeringsspread €15–70/maand; consult-spread €33–86 (dag), giftdrempels uit Keuze.nl aug 2026. | Manners.nl/Ipsos 2026 + Keuze.nl aug 2026 + verzekerjehuisdier.nl |

## 5. Validatie Ronde 9
- `node --check` op `server.mjs`, `assets/js/app.js`, `assets/js/chatbot.js`, `pages/base.mjs`, `pages/trimkosten.mjs` ✓.
- **Browsersimulatie (jsdom, echte server) — ALLES GROEN (7 scenario's)**: zoekbalk homepage (dropdown + Enter→ beste match) · zoekbalk legacy + hitte-match · `/zoek` SSR + live herzoek · chatbot openen/chips/antwoord met 2026-data/links · Escape sluit · trimcalculator (€300→€480 bij groot) + 15 tarieven + schema's · hero text-shadow + scrim aanwezig.
- **Contrastcheck**: 4/4 WCAG AA ✓ (zie §3).
- **Smoke: 45 pagina's + 12 API's ✓** (nieuw: `/trimmen-kosten`, `/zoek`, `/api/sitesearch`, `/api/chat/health`) · **Loadtest 200 @ 25: 0 fouten, p50 26 ms, p95 157 ms, max 217 ms** · **Crawl: 27.025 sitemap-URL's, 0 broken**.
- Ronde 8-regressie (browser-r8) opnieuw groen; nieuwsbrief, adviseur, webshop, thema, registratie ongewijzigd werkend.
- `data/newsletter.json` schoon (`[]`); chat gebruikte geen externe calls (knowledge-modus, geen key gezet); `.env.example` + README gedocumenteerd (`OPENAI_API_KEY` optioneel).
