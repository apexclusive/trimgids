# TrimGids — Volledige analyse van de website

Datum: 2026-09-11 · Uitgevoerd op branch `arena/01a090d4-trimgids` · Scope: code, architectuur, performance, SEO, beveiliging, toegankelijkheid, PWA, data én de leveringsketen (Vercel).

---

## 1. Management-samenvatting

TrimGids is een **serverless, data-gedreven SSR-app** (één Node.js `http`-server, geen framework) die op Vercel draait via een catch-all rewrite naar `api/index.js`. De site is uitzonderlijk volwassen: er zit ~30 "rondes" aan techniek in de code (compressie, ETag, caches, zelf-gehoste fonts, service worker, security headers, JSON-LD, eigen kaart, chat-assistent, Supabase-adapter). De baseline is gezond: de volledige regressiesuite (smoke 48 pagina's + 12 API's, browser- en jsdom-tests, loadtest) is groen, loadtest p50 ~20 ms.

Toch vond de analyse een aantal **concrete knelpunten**, waarvan er drie in deze ronde al zijn opgelost:

| # | Knelpunt | Ernst | Status |
|---|---|---|---|
| B1 | `nl-map.js`, `chatbot.js` en de theme-bootstrap werden **2× geladen** op de homepage | Hoog (correctheid + CPU) | ✅ opgelost |
| B2 | **5,2 MB aan ongebruikte bron-JPG's** stond in de repo (25 bestanden, 0 verwijzingen) | Middel (repo/deploy) | ✅ opgelost |
| B3 | **Fraunces** lettertype was dood (0× in uitvoer) maar zat nog in `fonts.css` + 4 woff2's | Laag (bytes) | ✅ opgelost |
| B4 | Externe afhankelijkheden: vendorde Leaflet (147 KB) + CARTO-tegels + hardcoded API-key | Middel | ⏳ plan |
| B5 | `server.mjs` is monolithisch: 6.383 regels / 631 KB | Laag (onderhoud) | ⏳ plan |
| B6 | `sitemap.xml` (5,3 MB) staat in Git | Laag (repo) | ⏳ plan |
| B7 | Inline CSS/JS → CSP vereist `'unsafe-inline'` | Laag–middel | ⏳ plan |

---

## 2. Architectuur in één oogopslag

```
Browser
  │
  ├─ / en /assets/* ───────────────► statische files (Vercel edge/CDN)
  │
  └─ alle extensieloze routes ──────► vercel.json rewrite ─► /api/index.js
                                                            │
                                             import handleRequest uit server.mjs
                                                            │
                              ┌─────────────────────────────┴──────────────────────────┐
                              │ SSR-templates (pages/*.mjs + inline templates)          │
                              │ → modernizeGeneratedHtmlUncached() (postprocessing)     │
                              │   • SEO-clamp titels/descriptions                       │
                              │   • emoji-strip (scripts/styles beschermd)              │
                              │   • universele shell (header/footer)                    │
                              │   • content-hash cache-busting (?v= uit SHA-1)          │
                              │   • CSS-staart in vaste volgorde + tokens als laatste   │
                              │   • Google Fonts → zelf-gehoste fonts.css               │
                              │   • AVG-verwerkingsvermelding bij e-mail/tel-formulieren│
                              │   • lazy images, ld+json, OG-fallback, CWV-beacon       │
                              └─────────────────────────────┬──────────────────────────┘
                                                            │
                              ┌─────────────────────────────┴──────────────────────────┐
                              │ Data-laag: data/*.json (catalog.json 3,3 MB)            │
                              │ → optionele Supabase-adapter (PostgREST) met JSON-fallb.│
                              └────────────────────────────────────────────────────────┘
```

**Belangrijkste ontwerpkeuze:** elke server-gerenderde pagina loopt door één centrale postprocessing-pijplijn (`modernizeGeneratedHtmlUncached`, server.mjs ±regel 4798). Dit is het "choke point" waar SEO, AVG, cache-busting, shell en fonts site-breed worden afgedwongen. Het is krachtig, maar ook de plek waar fouten site-breed doorwerken (zie B1).

### Hoe Vercel het draait
- `vercel.json` → `functions.api.index.js.includeFiles = "data/**"` (data mee in de serverless bundle; `pages/*.mjs` komt via statische imports mee).
- Rewrite `/((?!.*\.).*)` → `/api/index.js`: **alleen paden zonder punt** gaan naar de server; `assets/*` (met extensie) worden door Vercel als statische bestanden geserveerd.
- `headers` in `vercel.json` leggen immutable caching op voor `svg|png|jpg|webp|avif|ico|css|js|webmanifest` en `no-cache` voor `sw.js`.

---

## 3. Inventaris (gemeten)

| Laag | Omvang |
|---|---|
| Routes (SSR-pagina's) | ~50 vaste hubs + dynamische directory/provider-/rassenpagina's uit `data/catalog.json` |
| Publieke API's | ~50 endpoints (providers, home, cities, search, chat, forum, reviews, quotes, polls, puppy's, vacatures, vrijwilligers, vermist, nieuws, hondenbelasting, verzekering, webshop, calculators …) |
| Paginamodules | `pages/*.mjs` — 37 bestanden |
| CSS | 10 bestanden, **268.820 B** (content-skin 51,9 KB · home 54,1 KB · site-polish 47,1 KB · site-chrome 30,4 KB · tokens 25,9 KB · premium-refresh 23,5 KB · puppies 10,8 KB · fonts 9,6 KB · forum 8,3 KB · nl-map 7,2 KB) |
| JS | 5 bestanden, **110.020 B** (app 59,1 KB · nl-map 18,6 KB · forum 17,6 KB · chatbot 10,9 KB · poll 3,7 KB) |
| Vendorde Leaflet | 188 KB (leaflet.js 147,5 KB + leaflet.css 14,8 KB + marker-images) |
| Zelf-gehoste fonts | 27 woff2's (nu 23 na B3) · Plus Jakarta Sans, Sora, Inter |
| Afbeeldingen | hero (webp/avif 640–1600w), 6 categoriekaarten, ~22 kenniskaarten, 4 ras-spotlights — allemaal `<picture>` met webp+avif |
| Data | ~40 JSON-bestanden; `catalog.json` 3,3 MB (2.900+ aanbieders, 341 steden, rassen) |
| Sitemap | `sitemap.xml` **5,3 MB**, ~27.000 URL's (dagcache + Brotli ~85 KB over de lijn) |

---

## 4. Laag-voor-laag analyse

### 4.1 Transport- & serverlaag — sterk
- **Brotli/gzip** voor HTML/JSON/XML/CSS/JS + compressie-cache per content-digest.
- **ETag + 304**, correcte `Vary: Accept-Encoding`, correcte `HEAD`-responses.
- **HTML-paginacache (LRU 600)** voor directory/providerpagina's; static-file-cache; sitemap-dagcache.
- **Rate limits** per IP per bucket (search, writes, sitemap, home, beacon, chat).
- Gemeten: homepage 115.855 B → **32.134 B gzip**; `/api/home` 16,5 KB; loadtest 200 req @25 conc: **0 failures, p50 20 ms, p95 157 ms**.

### 4.2 Frontend / rendering
- Homepage haalt 10 stylesheets + 7 scripts (Leaflet + nl-map + forum + poll + app + chatbot) + CWV-beacon inline. Alles Brotli-gecomprimeerd en met content-hash `?v=` (immutable caching).
- **Ná de fix (B1)** laadt elk script precies één keer; voorheen: nl-map ×2, chatbot ×2, theme-bootstrap ×2.
- Kaart is **Leaflet** (lokaal ge-vendord) met CARTO Voyager-tegels — zie B4.
- `content-visibility: auto` + `min-height`-reserves tegen CLS; `loading="lazy" decoding="async"` op 36/36 homepage-afbeeldingen.

### 4.3 SEO — sterk
- Elke route: title (≤60 tekens via SEO-clamp), description (≤160), canonical, exact 1 H1, robots-meta.
- JSON-LD `@graph` (WebSite + SearchAction, Organization, WebPage, BreadcrumbList) + rijke schema's op verzekering/webshop/trimkosten (FAQPage, ItemList, Product, Offer).
- OG/Twitter-fallback op elke pagina; `og.jpg` 1200×630.
- Sitemap + robots.txt (Disallow `/admin`, `/api/admin/`).
- Eigen zoekindex (`/api/sitesearch`, 60+ kernpagina's) + `/zoek`-pagina.

### 4.4 Beveiliging — sterk
- HSTS, `nosniff`, `X-Frame-Options`, COOP/CORP `same-origin`, `Permissions-Policy`, `Referrer-Policy`, `Content-Language: nl`.
- CSP: `default-src 'self'`, `object-src 'none'`, `worker-src 'self'`, `base-uri 'self'`; `script-src/style-src 'unsafe-inline'` (noodzakelijk door inline JS/CSS — zie B7).
- Origin/CSRF-guard: muterende requests met vreemde `Origin` → 403. Admin via `ADMIN_TOKEN`.
- Rate limiting + input-validatie (whitelists, e-mailregex, lengtelimieten).

### 4.5 Toegankelijkheid — ruim voldoende
- Skip-link, `main id="main-content" tabindex="-1"`, `focus-visible`, `aria-*` op kaart/chat/pills, `prefers-reduced-motion`, donker thema.
- Automatische WCAG AA-contrastcheck (`check-contrast.mjs`): 4/4 combinaties ≥ 4,5:1. `missingAlt = 0` op alle geaudite routes.

### 4.6 PWA
- Service worker v18: precache (HTML/JS/CSS/images), netwerk-eerst voor HTML/API's, cache-eerst voor assets, `/offline`-pagina.

### 4.7 Data-laag
- JSON-file-per-collectie met LRU-cache; optionele Supabase-adapter (PostgREST) voor quotes/claims/reviews met automatische JSON-fallback; `sync:db` voor backfill. Schema in `supabase/schema.sql`.

---

## 5. Bevindingen (knelpunten)

### B1 — Dubbele scriptlading op de homepage ✅ OPGELOST
`index.html` linkte `nl-map.js` (regel 1597), `chatbot.js` (regel 1603) en een eigen theme-bootstrap (regel 70) **zonder** de marker-id's (`tg-nlmap-js` / `tg-chatbot-js` / `tg-theme-boot`). De id-only guards in `modernizeGeneratedHtmlUncached` detecteerden ze daardoor niet en injecteerden een tweede kopie. Gevolg op de homepage: `nl-map.js` en `chatbot.js` stonden elk 2× in de DOM (dubbele parse + executie; na cache-bust-normalisatie onder dezelfde URL, dus wel 1 netwerkfetch) en de theme-bootstrap 2×.

**Fix:** thema-guard checkt nu ook op de variabelenaam `trimgids_theme`; kaart- en chat-scripts worden eerst verwijderd en daarna precies één gemarkeerde versie toegevoegd (zelfde remove-then-add-patroon als de CSS-staart). Geverifieerd: 1× per script op de homepage; volledige suite groen; kaart rendert 2.941 markers, 0 JS-fouten.

### B2 — 5,2 MB dode bron-JPG's ✅ OPGELOST
`assets/img/gen/*.jpg` (25 bestanden: 18 kenniskaarten + 4 ras-spotlights + 3 NL-kaartbronnen) waren nergens gerefereerd — alleen hun `.webp`/`.avif`-afgeleiden worden gebruikt. Verwijderd (5.205.351 B) → kleinere clone, minder deploy-upload. Bronnen blijven herstelbaar via git-historie op `main`.

### B3 — Fraunces was dood ✅ OPGELOST
`Fraunces` kwam **0×** voor in de uitvoer (alle verwijzingen worden al herschreven naar Plus Jakarta Sans). De 4 `@font-face`-blokken en 4 woff2's (~71 KB) zijn verwijderd. `fonts.css` bevat nu alleen Plus Jakarta Sans (body), Sora (display) en Inter (klein gebruik, o.a. `/ nacht`-labels op vakantiekaarten).

### B4 — Externe afhankelijkheden van de kaart ⏳
De kaart gebruikt lokaal ge-vendorde **Leaflet** (byte-identiek aan de officiële geminificeerde `leaflet/dist`-build, dus geen minificatie meer nodig) met **CARTO Voyager-tegels** van `basemaps.cartocdn.com` en een **hardcoded API-key** in `assets/js/nl-map.js`. Implicaties: (a) ~147 KB JS op kaartpagina's, (b) afhankelijkheid van een derde partij voor tegels, (c) de key is per definitie publiek (client-side) — een configuratie- ipv een veiligheidsprobleem, maar hoort in een constant/env en met een expliciete eigen CARTO-account. Aanbevolen: key uit env injecteren op de `/kaart`-route, en de bestaande `/api/map-tile`-proxy als fallback heroverwegen.

### B5 — Monolithische server ⏳
`server.mjs` is 6.383 regels / 631 KB: routing, 50+ API's, ~60 inline HTML-templates, CSS (`directoryStyles`/`customModuleStyles`), auth, caching en de modernize-pijplijn in één module. Functioneel prima (één serverless functie), maar onderhouds- en risico-technisch kwetsbaar. Aanbevolen (lange termijn): opsplitsen in `routes/`, `templates/`, `lib/`, `middleware/` — zonder gedragsverandering.

### B6 — Sitemap in Git ✅ OPGELOST
`sitemap.xml` (5,4 MB, 27k URL's) stond in Git maar de server genereert de sitemap toch al bij élke request dynamisch uit de catalogus (`generateSitemap()`). Het vaste bestand was dus dode bytes die alleen maar uit de pas liepen. Uit Git gehaald + in `.gitignore`. Ook de gegenereerde `audit/`-rapporten zijn ontrackt en genegeerd.

### B7 — `'unsafe-inline'` in CSP ⏳
Veel JS/CSS is inline (templates + injecties), dus CSP vereist `script-src 'unsafe-inline'` en `style-src 'unsafe-inline'`. Dat verzwakt XSS-mitigatie. Aanbevolen: nonce- of hash-gebaseerde CSP voor de inline scripts, externe bestanden waar mogelijk. (Bewust nog niet gedaan: een per-request nonce zou de HTML-ETag/304- en compressie-cache per request onbruikbaar maken; zie §10.)
Veel JS/CSS is inline (templates + injecties), dus CSP vereist `script-src 'unsafe-inline'` en `style-src 'unsafe-inline'`. Dat verzwakt XSS-mitigatie. Aanbevolen: nonce- of hash-gebaseerde CSP voor de inline scripts, externe bestanden waar mogelijk.

### B8 — Geen continue RUM/Lighthouse ⏳
Er is een eigen `/api/beacon` (CWV: LCP/INP/CLS), maar geen geautomatiseerde Lighthouse-run in CI en geen echte-device-metingen. Aanbevolen: Lighthouse CI in `.github/workflows`, plus de bestaande beacon-data periodiek aggregeren (er is al `analytics-report.mjs`).

### B9 — Verouderde documentatie ⏳
`PERFORMANCE-AUDIT-NL.md` documenteert rondes t/m 9; de code bevat inmiddels minstens ~30 rondes (Leaflet is zelfs teruggekomen na de canvas-kaart uit ronde 3). Aanbevolen: audit-log bijwerken of vervangen door dit document + het plan.

### B10 — Opmerking (geen bug)
Sommige afbeeldingen worden bewust hergebruikt (bijv. `cat-wandelen-480.webp` 3×, `pomeriaan-640.webp` 2×). Zelfde URL → 1 netwerkfetch, dus geen performanceprobleem; puur DOM-herhaling.

---

## 7. Update na Fase 2 (asset-minificatie)

De eigen CSS en JS zijn inmiddels geminificeerd met esbuild (`npm run build:assets` → `scripts/minify-assets.mjs`):

| Assets | Voor | Na | Winst |
|---|---|---|---|
| 10 CSS-bestanden | 268.820 B | ~207.576 B | −23 % |
| 5 JS-bestanden | 110.020 B | ~75.521 B | −31 % |
| Leaflet (vendor) | 147.552 B | ongewijzigd (al upstream-minified) | — |

De `?v=`-cache-busting wordt uit de bestandsinhoud afgeleid, dus de nieuwe versies gelden automatisch site-breed. Service worker versie-bump v18 → v19 zodat precache ververst. Twee tests die op de *broncode-indeling* van assets matchten (`hub-nav.test.mjs`, `browser-r9.test.mjs`) zijn gedrags-/formaat-onafhankelijk gemaakt. Volledige suite (`npm test`), smoke (48 pagina's + 12 API's) en loadtest (200 req @25 conc, 0 fouten, p50 ~22 ms) blijven groen.

## 8. Update na Fase 3 (kritiek renderpad)

- **Dode hero-assets weg:** `assets/img/hero-{640,1200,1600}.{webp,avif}` (6 bestanden, ~419 KB) bestonden maar werden nergens gerefereerd — de hero is tekst (`<h1>` + gradient), geen `<picture>`. Verwijderd; `og.jpg` blijft als OG-fallback.
- **LCP = tekst → het lettertype is de kritieke resource:** de server preloadt nu Sora 800 + Plus Jakarta Sans 400/700/800 (latin-subsets) parallel aan `fonts.css`. De preload-URL's gaan door `assetUrl()` en matchen daardoor exact de nu ge-content-hashte `@font-face`-src's — geen dubbele font-download.
- **Fonts content-hashed (cache-correct):** nieuw `scripts/version-fonts.mjs` versioneert 22 `@font-face`-src's in `fonts.css` met hetzelfde SHA-1-algoritme als de runtime; `scripts/selfhost-fonts.mjs` schrijft de hash nu zelf. Daardoor is `woff2|woff` veilig immutable gecachet in `vercel.json`; `check-asset-versions` telt 88 assets met exact één versie.
- **Dubbele modernize-pass weg (TTFB):** de "al gedaan"-check keek naar `id="tg-theme-boot"`, terwijl `index.html` alleen een eigen inline theme-bootstrap heeft → de homepage doorliep de pijplijn 2×. Marker is nu `tg-seo-clamp`; één pass per pagina, en het verhielp meteen de font-preload-mismatch.
- **Lazy-CSS verfijnd:** `content-visibility` nu alleen op `.section` met `contain-intrinsic-size:auto 900px` (was ook `.card` op 720 px → lange scrollbar/sprongen).
- **Scripts:** `forum.js` nu `defer` op de homepage, zodat het `window.TGApp` (gedefinieerd in het sync `app.js`) pas leest nádat dat bestaat.
- **Verificatie:** `npm test` exit 0, smoke 48/12, loadtest 200 req @25 conc 0 fouten, `check-asset-versions` schoon.

## 9. Update na de "bizarre verbeteringen"-ronde (UI-opschoning + verborgen content)

Na de Fases 1–3 zijn op verzoek van de opdrachtgever de volgende "bizarre" punten aangepakt:

- **Zwevende UI-elementen verwijderd.** Drie zwevende/vaste scroll-elementen zijn weg: (1) de scroll-progress-balk bovenin (`#scroll-progress` / `.scroll-progress-bar`), (2) de zwevende "naar boven"-knop rechtsonder (`#back-to-top` / `.back-to-top-btn`) en (3) de zwevende chat-bel met 🐾-poot (`#tg-chat-bubble` + `#tg-chat-panel`). Markup (index.html + `pages/chrome.mjs`), runtime-logica (`assets/js/app.js` → `V()` verwerkt nu alleen nog het navbar-gedrag) én de bijbehorende CSS zijn verwijderd; `chatbot.js` blijft in `assets/` bewaard voor een eventuele herintroductie. De server injecteert geen chat-script meer.
- **Hover-onderstreping gescoped.** De oude regel `main a:not(.btn):hover{text-decoration:underline}` onderstreepte héle kaart-links (o.a. de zes "Werelden"-kaarten) — de volledige kaarttekst kreeg een streep. Nu geldt de onderstreping alleen voor tekstlinks in lopende tekst (`main :is(p, li, td, .intro, …) a:hover`).
- **Werelden-kaart 6 klikbaar gemaakt.** Kaarten 1–5 zijn `<a>`-links; kaart 6 ("Actueel & verhalen voor baasjes") was een `<div>` — hover gaf niets en klikken deed niets. Kaart 6 linkt nu via het stretched-link-patroon (`data-world-link` + kleine handler met `role="link"`/`tabindex="0"` en toetsenbordbediening) naar `/voor-baasjes`, terwijl de binnenste links (`/nieuws`) zelfstandig blijven werken.
- **Verborgen homepage-content hersteld (grote bug).** `site-polish.css` begon met een cascade aan `display:none!important`-regels die op de homepage 15 secties verborgen (`#records`, `#eerstehulp-cijfers`, `#kennis`, `#forum`, `#faq`, …), de sticky hub-nav site-breed uitschakelde, de announcement-bar (`top-announcement`) verborg en vier top-nav-pillen (`hondenschool`, `opvang`, `wellness`, `last-minute`) weghaalde. Al deze regels zijn verwijderd; de volledige homepage, hub-nav, announcement-bar en 9/9 nav-pillen renderen nu weer (geverifieerd via de jsdom-cascade én de regressiesuite).
- **Tests bijgewerkt:** `browser-r9.test.mjs` en `browser-r10.test.mjs` bewaken nu de afwezigheid van de zwevende chat-UI in plaats van de aanwezigheid ervan.

**Verificatie:** `npm test` exit 0 (smoke 48 pagina's + 12 API's, DESIGN/HUB-NAV/PUPPIES/KAART groen, Ronde 8/9/10 groen, 0 ✗). `/api/health` ok, `/api/forum` levert 7 topics, homepage + `/forum` renderen de forum-UI.

## 10. Update na de alias/canonical-rondleiding (SEO + dode bytes)

- **Alias-routes → 301 naar canoniek.** De site had ~70 alias-groepen (`/trimkosten` = `/wat-kost-trimmen` = `/trimmen-kosten`, `/vliegen-hond` = `/reizen`, `/community` = `/forum`, `/hondenforum` = `/forum`, enz.) die allemaal dezelfde pagina mét dezelfde `<title>` serveerden. Dat gaf dubbele titels en versplinterde linkwaarde. Er staat nu één `ALIAS_REDIRECTS`-tabel (158 entries) in `server.mjs`; elke alias geeft een 301 naar zijn canonieke route (query-string blijft behouden, dus `/search?q=x` → `/zoek?q=x`).
- **`/community`-conflict opgelost.** `/community` stond in twéé route-groepen (`/forum` én `/wandelmaatje`); de eerste won. Nu redirect `/community` expliciet naar `/forum` en is hij uit de `/wandelmaatje`-groep verwijderd.
- **Dubbele titels weg.** `audit/content-duplicates.json` rapporteert nu `duplicateTitles: []` (was 2 groepen). De duplicate-check in `audit-site.mjs` telt aliassen niet meer mee (die zijn geen eigen indexeerbare URL's meer).
- **Dode bytes uit Git.** `sitemap.xml` (5,4 MB, runtime-gegenereerd) en de gegenereerde `audit/`-rapporten zijn ontrackt en in `.gitignore` gezet (B6).
- **Smoke-test uitgebreid.** `smoke.mjs` verifieert nu expliciet dat een set alias-paden 301't naar het juiste canonieke pad.
- **Bewust niet gedaan — nonce-CSP (B7).** Een per-request nonce zou de bestaande ETag/304- en compressie-cache (gekeyd op content-digest) per request onbruikbaar maken; dat is een netto performanceverlies op de meest aangevraagde pagina's. Genoteerd als kandidaat voor een aparte, geïsoleerde ronde met hash-gebaseerde CSP per template.

## 6. Wat al uitstekend is (niet aanraken)

- Het centrale modernize-choke point (site-breed consistente SEO/AVG/cache-busting).
- Content-hash cache-busting (`?v=` uit SHA-1) — drift is structureel onmogelijk.
- De vaste CSS-staartvolgorde + tokens-als-laatste (één winnaar in de cascade).
- Zelf-gehoste fonts (geen Google IP-doorgifte, AVG).
- Origin/CSRF-guard, rate limits, input-whitelisting en de clientErrors-400-mapping (bewaakt door `check-error-status.mjs`).
- Privacybewuste analytics + CWV-beacon zonder identifiers/cookies.
- Uitgebreide, werkende regressiesuite (smoke, jsdom-browsertests, loadtest, crawler, 7 check-scripts).
