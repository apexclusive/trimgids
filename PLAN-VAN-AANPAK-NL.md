# TrimGids — Plan van aanpak voor ultieme optimalisatie

Datum: 2026-09-11 · Branch: `arena/01a090d4-trimgids` · Volgt op `ANALYSE-NL.md`.

> Doel: de site op elk meetbaar niveau — Core Web Vitals, bandbreedte, SEO, beveiliging, toegankelijkheid, betrouwbaarheid én onderhoudbaarheid — naar het technisch haalbare maximum brengen, zonder regressies, met per fase een meetbaar acceptatiecriterium en een rollback-pad.

---

## 0. KPI's en budgetten (referentie)

De repo hanteert deze budgetten (uit `analytics-report.mjs` / `ultimate-checklist.mjs`); die gelden als "definition of done":

| Metriek | Budget | Nu (beacon-sample 49) |
|---|---|---|
| LCP | < 2.500 ms | 1.168 ms ✓ |
| INP | < 200 ms | 40 ms ✓ |
| CLS | < 0,10 | 0,00 ✓ |
| TTFB | < 800 ms | (n.v.t.) |
| Lighthouse mobile | ≥ 90 | nog te meten (B8) |

Aanvullende doelen per fase hieronder.

---

## Fase 1 — Quick wins (correctheid + dode bytes) — ✅ REEDS UITGEVOERD

**Doel:** elimineren van dubbele scriptlading en dode assets, nul gedragsverandering.

| Actie | Techniek | Resultaat |
|---|---|---|
| 1.1 Dedupliceren `nl-map.js` / `chatbot.js` | remove-then-add in `modernizeGeneratedHtmlUncached` | 2× → 1× per script ✓ |
| 1.2 Dedupliceren theme-bootstrap | guard ook op `trimgids_theme` | 2× → 1× ✓ |
| 1.3 Dode bron-JPG's verwijderen | 25 ongerefereerde `.jpg` uit `assets/img/gen/` | −5,2 MB repo ✓ |
| 1.4 Dood lettertype Fraunces | 4 `@font-face`-blokken + 4 woff2's | −3,3 KB CSS / −71 KB assets ✓ |

**Acceptatie:** `npm test` exit 0; smoke 48 pagina's + 12 API's groen; loadtest 0 failures; kaart rendert 2.941 markers met 0 JS-fouten. ✅ (gerealiseerd)

**Rollback:** `git revert` van de betreffende commit; alles is content-addressed, geen data-migratie.

---

## Fase 2 — Asset- en bundeloptimalisatie

**Doel:** bytes over de lijn minimaliseren zonder visuele regressie.

| Actie | Techniek / tool | Verwachte winst | Status |
|---|---|---|---|
| 2.1 Minify CSS (10 bestanden, 268,8 KB) | `esbuild` minify, in-place; content-hash `?v=` regelt invalidering automatisch | −30–45 % CSS | ✅ gedaan (−23 %) |
| 2.2 Minify JS (app/nl-map/forum/chatbot/poll) | `esbuild` minify; zelfde flow | −40–55 % JS | ✅ gedaan (−31 %) |
| 2.3 Minify Leaflet | bleek al byte-identiek aan de officiële `leaflet/dist`-build — niets te doen | n.v.t. | ✅ geverifieerd |
| 2.4 Font-subsetting | `glyphhanger`/`subfont`: alleen de glyphs die de site daadwerkelijk gebruikt per woff2 | −30–60 % fontbytes | ⏳ open |
| 2.5 Beeldcompressie | AVIF-kwaliteit audit; hero op de juiste `sizes`; kandidaten waar `480/960` te grof is verfijnen | −10–25 % beeldbytes | ⏳ open |
| 2.6 Introduceer een build-stap | `npm run build:assets` → `scripts/minify-assets.mjs` (esbuild, in-place) | reproduceerbaar | ✅ gedaan |

**Risico & rollback:** minificatie kan zeldzame CSS/JS-fouten introduceren → acceptatie is de volledige suite **plus** een visuele diff (zie Fase 9 screenshot-baseline). Rollback = oude assets terugzetten (content-hash maakt oud/nieuw per commit traceerbaar).

**Acceptatie:** Lighthouse mobile ≥ 90; elk eigen CSS/JS-asset < 50 KB ongecomprimeerd (Leaflet-vendor uitgezonderd — 147 KB upstream-minified); volledige suite groen. ✅ (gerealiseerd voor 2.1/2.2/2.6; 2.4/2.5 open)

---

## Fase 3 — Critical Rendering Path (CRP)

**Doel:** LCP verbeteren en FOUC/CLS elimineren.

| Actie | Techniek | Status |
|---|---|---|
| 3.1 Kritieke CSS inline | Eerste-viewport-regels inline in `<head>`; rest lazy/non-blocking | ⏳ bewust niet — zie toelichting |
| 3.2 Stylesheets bundelen | 10 CSS-files → 1–2 | ⏳ bewust niet — zie toelichting |
| 3.3 Fonts: `font-display: swap` + `preload` | `preload` op gebruikte gewichten, content-hash `?v=` | ✅ gedaan |
| 3.4 Scripts `defer`/`async` | kaart/chat/forum non-blocking | ✅ gedaan |
| 3.5 Hero `fetchpriority=high` + `preload` | LCP-element preloaden | ✅ n.v.t. (hero is tekst) |
| 3.6 `content-visibility` verfijnen | correct `contain-intrinsic-size` | ✅ gedaan |

**Wat er concreet is gebeurd (Fase 3):**

- **3.3 Fonts:** de LCP is tekst (`.hero-title`, Sora 800), dus het lettertype is de kritieke resource. De server preloadt nu 4 woff2's (Sora 800 + Plus Jakarta Sans 400/700/800 — de daadwerkelijk gebruikte gewichten) parallel aan `fonts.css`. De preload-URL's gaan door `assetUrl()`, dus ze krijgen exact dezelfde content-hash `?v=` als de `@font-face`-src's.
- **Fonts content-hashed:** nieuw `scripts/version-fonts.mjs` versioneert de 22 `@font-face`-src's in `fonts.css` met hetzelfde SHA-1-algoritme als de runtime; `scripts/selfhost-fonts.mjs` schrijft de hash nu zelf bij generatie. Daardoor: (a) preload en stylesheet matchen byte-voor-byte (geen dubbele font-download), (b) `woff2|woff` kan veilig immutable gecachet worden (content-hash = cache-bust), (c) `check-asset-versions` is weer schoon (88 assets, precies 1 versie).
- **3.4 Scripts:** `forum.js` is nu `defer` op de homepage (nl-map.js/chatbot.js/poll.js waren al defer). `app.js` blijft sync (laat in `<body>`) zodat het `window.TGApp` en `handleModernSearch` definieert vóór de defer-queue draait — forum.js leest daarmee nu wél de ingelogde gebruiker.
- **3.5:** n.v.t. — de hero heeft geen `<picture>`-achtergrond; het LCP-element is de `<h1>`. De ongebruikte `assets/img/hero-*.webp|avif` (6 bestanden, ~419 KB) zijn verwijderd; `og.jpg` blijft (OG-fallback).
- **3.6:** lazy-CSS teruggebracht naar `.section{content-visibility:auto;contain-intrinsic-size:auto 900px}` — `.card` verwijderd (kaarten zijn ~250–350 px, niet 720 px → te lange scrollbar en sprongen) en 900 px consistent met `content-skin.css`.
- **Extra CRP-fix (TTFB):** de "al gemoderniseerd"-check in `res.end`/`serveStatic` keek naar `id="tg-theme-boot"`, maar `index.html` heeft zijn eigen inline theme-bootstrap zónder id — gevolg: de homepage (meest aangevraagde pagina) doorliep de hele modernize-pijplijn **twee keer**. Marker is nu `tg-seo-clamp` (wordt in élke pass onvoorwaardelijk gezet): één pass, en het verhielp meteen de font-preload-mismatch.

**Bewust niet gedaan — 3.1 / 3.2:** inline-kritieke-CSS en bundelen zouden de zorgvuldig opgebouwde cascade-volgorde (tokens als laatste laag, content-skin vs premium-refresh) en de per-file `?v=`-cache-busting ondermijnen. Met HTTP/2 zijn de 8 stylesheets al ~1–2 RTT's; de FOUC/theme-flash-risico's van splitsen wegen niet op tegen die besparing. Kandidaat voor een aparte, geïsoleerde ronde.

**Acceptatie:** nog niet in het veld gemeten (vereist echte RUM); lokaal: smoke 48/12, `npm test` exit 0, loadtest 200 req @25 conc 0 fouten (p50 33 ms), `check-asset-versions` 88 assets precies 1 versie.

---

## Tussentijdse ronde (na Fase 3) — "bizarre verbeteringen" ✅ UITGEVOERD

Op verzoek van de opdrachtgever (website visueel + technisch perfect, data correct, forum en alle opties werkend):

- **Zwevende UI verwijderd:** scroll-progress-balk, "naar boven"-knop en chat-bel (incl. chatpaneel) zijn uit de markup (index.html + `pages/chrome.mjs`), runtime (`app.js`) en CSS gehaald; de server injecteert geen `chatbot.js` meer (bestand blijft bewaard voor eventuele herintroductie).
- **Hover-onderstreping gefixt:** niet langer héle kaarten onderstreept; alleen tekstlinks in lopende tekst.
- **Werelden-kaart 6 gefixt:** gedraagt zich nu als kaarten 1–5 (klikbaar naar `/voor-baasjes`, toetsenbordbedienbaar, binnenste links blijven werken).
- **Verborgen content hersteld:** de `display:none!important`-cascade bovenaan `site-polish.css` (15 homepage-secties, hub-nav, announcement-bar, 4 top-nav-pillen) is verwijderd — de volledige homepage en navigatie renderen weer.
- **Tests bijgewerkt:** r9/r10 bewaken nu de afwezigheid van de zwevende chat-UI.

**Acceptatie:** `npm test` exit 0 (0 ✗; smoke 47 pagina's + 12 API's + alias-redirect-checks; DESIGN/HUB-NAV/PUPPIES/KAART + Ronde 8/9/10 groen). `/api/health` ok, `/api/forum` 7 topics, forum-UI rendert op homepage én `/forum`. (Zie ook ANALYSE-NL.md §9.)

**Vervolg (alias/canonical-rondleiding, zie ANALYSE-NL.md §10):** alle ~158 alias-paden 301'en nu naar hun canonieke route (`ALIAS_REDIRECTS` in server.mjs), `sitemap.xml` + `audit/` uit Git gehaald, `duplicateTitles: []`, smoke test de redirects. `npm test` exit 0.

---

## Fase 4 — Netwerk, cache & edge

**Doel:** TTFB en herhaaldbezoek maximaliseren.

| Actie | Techniek |
|---|---|
| 4.1 Cache-verfijning | Directory/providerpagina's: `stale-while-revalidate` verlengen; sitemap op CDN-niveau cachen |
| 4.2 ETag-verificatie onder Vercel | bevestigen dat Vercel de eigen ETags respecteert; anders op Vercel-headers (`vercel.json`) leunen |
| 4.3 Tegels: eigen proxy + cache | `/api/map-tile`-proxy nieuw leven inblazen (CARTO-first, LRU + negative-cache) → tegels onder eigen domein + eigen cache-regime; eigen CARTO-account-key via env |
| 4.4 Preconnect/`dns-prefetch` audit | alleen houden wat écht gebruikt wordt (basemaps, places.googleapis) |
| 4.5 Immutable-assets op CDN | is al via `vercel.json`; verifieer `?v=`-hash én CDN-hitratio |

**Acceptatie:** TTFB p75 < 500 ms (gedocumenteerd via beacon); 90 %+ CDN-hits op assets.

---

## Fase 5 — SEO & structured data

**Doel:** maximaliseren vindbaarheid en rich results.

| Actie | Techniek |
|---|---|
| 5.1 Titel/description-afronding | verifieer 60/160-clamp op álle 27k sitemap-URL's (steekproef + crawl) |
| 5.2 Sitemap-segmentatie | `sitemap.xml` splitsen in index + deelbestanden (provincie/rascategorie) zodat 5,3 MB niet als één blob geserveerd hoeft |
| 5.3 Schema-uitbreiding | `LocalBusiness`/`Service` op directory/providerpagina's; `Review` zodra eigen reviews live zijn; `Event` voor last-minute |
| 5.4 `hreflang`/`inLanguage` consistentie | `nl-NL` overal gelijk |
| 5.5 Sitemap uit Git | genereren in build (zie B6) |
| 5.6 Core-dossier | Search Console koppelen, indexatie van de 27k URL's monitoren, thin-content-regels (bestaande noindex-logica) valideren |

**Acceptatie:** 0 gebroken canonicals; rich-result-tests groen (Google Rich Results Test op steekproef).

---

## Fase 6 — Toegankelijkheid (WCAG 2.2 AA)

**Doel:** AA overal, inclusief de dynamische componenten.

| Actie | Techniek |
|---|---|
| 6.1 Keyboard-nav audit | kaart-filters, chatpaneel, forum, calculators: tab-volgorde + focus-traps |
| 6.2 `aria-live` op dynamische updates | forum-reacties, calculator-resultaten, chat |
| 6.3 Contrast in dark-theme | bestaande `check-contrast.mjs` uitbreiden naar dark-paletten |
| 6.4 Formulieren | label-associaties, foutmeldingen gekoppeld via `aria-describedby` |
| 6.5 Automatische audit in CI | `axe-core` (jsdom) als test toevoegen |

**Acceptatie:** axe: 0 serious/critical op alle kernroutes; keyboard-flow doorloopt de kaart en chat zonder vastlopen.

---

## Fase 7 — Beveiliging hardening

**Doel:** aanvalsoppervlak verkleinen.

| Actie | Techniek |
|---|---|
| 7.1 CSP zonder `'unsafe-inline'` | nonce-gebaseerde CSP: modernize-pijplijn geeft elk inline `<script>` een per-request nonce; externe inline-CSS verplaatsen |
| 7.2 CSRF-tokens voor mutaties | aanvullend op de bestaande origin-guard (die blijft) |
| 7.3 Gedeelde rate limiter | Upstash/Redis (serverless-safe) i.p.v. per-instance Map |
| 7.4 Secrets-audit | CARTO-key, `ADMIN_TOKEN`, service-role key: nooit in frontend/geschiedenis |
| 7.5 Dependency-audit | `npm audit` in CI (is 0 bij installatie), Dependabot aanzetten |

**Acceptatie:** CSP zonder `'unsafe-inline'`; `npm audit` 0; rate limits gedeeld over instances.

---

## Fase 8 — Data & infrastructuur

**Doel:** productieklaar, schaalbaar.

| Actie | Techniek |
|---|---|
| 8.1 Supabase live | service-role key als Vercel env; RLS-beleid per tabel; `sync:db` backfill |
| 8.2 Schrijfpaden op DB | quotes/claims/reviews via PostgREST (adapter is klaar) met JSON-fallback |
| 8.3 Backups | Supabase PITR + export van resterende JSON-collecties |
| 8.4 Notificaties | `RESEND_API_KEY` voor leads/claims |
| 8.5 Monolithische server opsplitsen | `routes/`, `templates/`, `lib/`, `middleware/` (gedragsneutraal, door de suite bewaakt) |

**Acceptatie:** schrijfacties overleven een cold start én een DB-storing (fallback werkt); `sync:db` idempotent.

---

## Fase 9 — Observability, CI/CD en regressie

**Doel:** elke wijziging automatisch veilig stellen.

| Actie | Techniek |
|---|---|
| 9.1 Lighthouse CI | `lhci` in `.github/workflows` met budgetten (Fase 0-tabel) |
| 9.2 Visuele regressie | Playwright-screenshots + baseline (mobile/desktop/breakpoints) — lost ook ultimate-checklist 28 op |
| 9.3 RUM-dashboard | beacon-data aggregeren via `analytics-report.mjs` + opslaan (niet in Git) |
| 9.4 Fout-tracking | structured logging (bestaat) → Sentry/Vercel Log Drains voor 5xx en slow responses |
| 9.5 Previews | Vercel preview-deploys per PR + smoke in CI (bestaat) |
| 9.6 Crawler in CI | bestaande `crawl.mjs` (27k URL's, 0 broken) periodiek draaien |

**Acceptatie:** PR merge blocked bij budget-overschrijding of 0-JS-fout-regressie.

---

## Fase 10 — Continue optimalisatieloop

1. **Meten** (beacon + Lighthouse CI + Search Console + RUM).
2. **Prioriteren** op de grootste CWV/business-impact (er is al een experiment-framework: `data/experiments.json`, `experiment-audit.mjs`).
3. **A/B-testen** met voldoende steekproef (ultimate-checklist 30/31: pas interpreteren ≥ 100 events per funnel).
4. **Documenteren** in de audit-log (B9).
5. **Herhalen**.

---

## Risico-overzicht & mitigatie

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Minificatie breekt CSS/JS | Middel | Hoog | Fase 9 visuele diff + volledige suite vóór merge |
| CSP-nonce breekt inline JS | Middel | Hoog | gefaseerd; per route uitrollen achter feature-flag |
| Kaarttegels (CARTO) vallen uit | Middel | Middel | eigen `/api/map-tile`-proxy + negative-cache + placeholder |
| Supabase outage | Laag | Middel | bestaande JSON-fallback blijft |
| Server opsplitsen introduceert regressie | Middel | Middel | gedragsneutraal refactor, suite = vangnet |

## Volgorde van uitvoering (suggestie)

Fase 1 (✅ klaar) → Fase 9.1/9.2 (baseline vastleggen) → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8 → Fase 10.

> Afhankelijkheid: Fase 9 (screenshot-baseline + Lighthouse CI) **eerst** instellen maakt elke volgende fase veilig verifieerbaar.
