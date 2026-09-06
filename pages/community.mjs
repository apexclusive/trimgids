/* Pagina: Forum / Community — prominent, interactief, met dezelfde component als de homepage. */
import { pageShell } from './base.mjs';

const CSS = `
.cb{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:18px}
.cb .card{text-align:center}
.cb .card strong{display:block;font-size:26px;color:var(--g)}
.cb .card span{color:var(--muted);font-size:13px}
.rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:16px}
.rules .card{border-left:4px solid var(--em)}
.rules li{font-size:13.5px;color:var(--muted);margin-bottom:6px}
.rules li::before{content:"●";color:var(--em);margin-right:8px}
.pinbox{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;box-shadow:var(--shadow);margin-top:16px}
.pinbox .ic{font-size:30px}
.pinbox b{display:block;font-size:15.5px}
.pinbox p{color:var(--muted);font-size:13.5px}
`;

export function communityPage() {
  return pageShell({
    title: 'Hondenforum & Community: vraag het andere baasjes | TrimGids',
    description: 'Het TrimGids hondenforum: stel vragen, deel ervaringen, tips en uitjes met duizenden hondenbaasjes in Nederland. Gratis, vriendelijk en snel antwoord van de community.',
    canonical: '/forum',
    active: 'forum',
    extraCss: CSS,
    extraHead: '<link rel="stylesheet" href="/assets/css/forum.css">',
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Community & Forum</p>
<div class="hero">
  <span class="eyebrow">De community van TrimGids</span>
  <h1>Hondenforum: vraag het de andere baasjes</h1>
  <p class="intro">De beste hondenkennis zit niet in een artikel — die zit tussen baasjes. Stel je vraag, deel je ervaring met een fokker, trimsalon of opvang, en help iemand anders verder. Vriendelijk, gratis en altijd met een kwispel.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">30 sec</strong><p>zo snel plaats je een onderwerp</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">24/7</strong><p>online, ook 's nachts bij een nood</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">100%</strong><p>gratis — geen account nodig</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">🐾</strong><p>van baasje voor baasje</p></div>
  </div>
</div>

<nav class="pinbox">
  <span class="ic">📌</span>
  <div><b>Welkom! Lees eerst even de huisregels</b><p>Blijf vriendelijk, deel geen privéadressen/telefoonnummers in het openbaar en vermijd medisch advies dat je dierenarts zou moeten geven. Vragen over acute nood? Bel je dierenarts of de Dierenambulance (0900-0245).</p></div>
  <a class="btn ghost" href="#forum-ui">Direct naar het forum ↓</a>
</nav>

<section class="sec">
  <h2>💬 Het forum</h2>
  <p class="sub">Kies een categorie, sorteer, zoek, open een topic om te lezen en te reageren — of start zelf iets nieuws. Je kunt stemmen op nuttige antwoorden 💚</p>
  <div data-forum-ui id="forum-ui"></div>
</section>

<section class="sec">
  <h2>📖 Handige links uit de community</h2>
  <div class="grid g3">
    <div class="card"><h3>🐕‍🦺 Diensthonden & interviews</h3><p>Alles over blindegeleide- en politiehonden, training en wat er na de carrière gebeurt.</p><p style="margin-top:10px"><a class="btn ghost" href="/hulphonden" style="padding:9px 16px;font-size:13.5px">Lees de gids →</a></p></div>
    <div class="card"><h3>🐾 Fokkers & aankoop</h3><p>Erkend vs niet-erkend, de 12 vragen en per ras de valkuilen.</p><p style="margin-top:10px"><a class="btn ghost" href="/fokkers" style="padding:9px 16px;font-size:13.5px">Naar de Fokkersgids →</a></p></div>
    <div class="card"><h3>🗺️ Vind een aanbieder</h3><p>De ontdekkingskaart toont 2.900+ geverifieerde aanbieders in heel Nederland.</p><p style="margin-top:10px"><a class="btn ghost" href="/kaart" style="padding:9px 16px;font-size:13.5px">Open de kaart →</a></p></div>
  </div>
</section>

<script src="/assets/js/forum.js" defer></script>`
  });
}
