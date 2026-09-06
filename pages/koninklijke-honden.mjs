/* Pagina: Honden van koningen & royals — Nederland en de wereld.
   Interactief: land-kiezer (royals per land). */
import { pageShell } from './base.mjs';

const CSS = `
.roy{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px}
.roy button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.roy button.on{background:var(--g);border-color:var(--g);color:#fff}
.rc{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.rc h3{font-size:19px;margin-bottom:6px}
.rc .dogs{display:grid;gap:12px;margin-top:12px}
.rc .dog{display:grid;grid-template-columns:52px 1fr;gap:14px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.rc .dog .ic{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--g),var(--g2));display:grid;place-items:center;font-size:23px}
.rc .dog h4{font-size:15.5px}
.rc .dog p{font-size:13.5px;color:var(--muted)}
.rc .fun{margin-top:14px;background:rgba(16,185,129,.06);border:1.6px solid var(--em);border-radius:12px;padding:12px 14px;font-size:13.5px;font-weight:700}
`;

const LANDEN = {
  nl: {
    t: '🇳🇱 Nederland — Huis van Oranje',
    intro: 'De Oranjes zijn al generaties een hondenfamilie. Momenteel: drie zwarte Labradors (Luna, Nala, Skipper — Skipper overleed in 2020) én toypoedel Mambo.',
    dogs: [
      ['🐕‍🦺', 'Luna, Nala & Skipper', 'Zwarte labradors van koning Willem-Alexander en koningin Máxima sinds respectievelijk 2018, 2016 en 2011. Skipper ging in 2020 heen; Luna en Nala verschijnen regelmatig op de kerstfoto.'],
      ['🐩', 'Mambo', 'De toypoedel van Willem-Alexander en Máxima: bekend van onder meer de strandfoto in 2023 waar hij de show stal.'],
      ['🐕‍🦺', 'Asher', 'Zwarte labrador van prinses Beatrix — de huidige hond van de voormalige koningin.'],
      ['🐕', 'Miss Pepper, Chip & Mac', 'Border Terriërs van prinses Beatrix (jaren 80–90). Miss Pepper, het lievelingetje, stikte in 1992 helaas in een konijnenhol in de tuin van Huis ten Bosch.'],
      ['🐕', 'Cleo & Arthus', 'Dalmatiërs van Beatrix uit de jaren 60–70. Cleo was de hond naast de kleine Willem-Alexander; Arthus verscheen later, samen met golden retriever Buster.'],
      ['🐕', 'Joris & Topper', 'Golden retriever Joris (jaren 60, de hond waarmee Beatrix en Claus wandelden) en Border Terriër Topper van prinses Margriet.'],
      ['🐕', 'Oma\'s honden', 'Koningin Wilhelmina en koningin Juliana hielden hun hele leven honden — de familietraditie is dus al >100 jaar oud.']
    ],
    fun: '💡 Waarom Mambo? Het koningspaar koos bewust voor een kleine, makkelijke gezelschapshond na een serie labradors — en Mambo bleek de perfecte PR-hond: pluizig, speels en fotogeniek.'
  },
  uk: {
    t: '🇬🇧 Verenigd Koninkrijk — de koningin die de hond een ‘thuis’ gaf',
    intro: 'Het Britse koningshuis is zo verweven met honden dat het bijna een nationaliteit is. Koningin Elizabeth II hield haar leven lang Corgi\'s — meer dan 30 door de eeuw heen.',
    dogs: [
      ['🐕', 'Corgi\'s (Elizabeth II)', 'De beroemdste koninklijke honden ter wereld: meer dan 30 Pembroke Welsh Corgi\'s, van Susan (1944) tot Willow (2018). De koningin liet zelfs speciaal een ‘Dorgi’ (corgi × teckel) ontstaan.'],
      ['🐶', 'Charles & Camilla', 'Jack Russell Terriërs Bluebell en Beth (Beth overleed door een tumor). Beth werd zelfs geborduurd op Camilla\'s kroningsjurk.'],
      ['🐕', 'William & Kate', 'Labrador Orla en de cocker-spaniël met de beroemde naam... afhankelijk van het jaar. Het gezin heeft historisch altijd een hond gehad.'],
      ['🐕‍🦺', 'George V & meer', 'George V was groot liefhebber van de hondenzwerverij: hij liet zelfs een hondenbegraafplaats aanleggen. Ook Edward VII had meerdere gezelschapshonden.']
    ],
    fun: '💡 Elizabeth II schreef zelfs haar Corgi\'s in op reis — ze had een eigen rijdende hondenverzorger en liet de honden meegaan in de trein bij officiële reizen.'
  },
  de: {
    t: '🇩🇪 Duitsland',
    intro: 'Het Duitse keizerlijke en latere presidentiële huizen waren meer paarden- en hondenliefhebbers dan dat ze één hondenras hadden.',
    dogs: [
      ['🐕', 'Keizer Wilhelm II', 'Hield Duitse Herders die speelden op het keizerlijk landgoed; zijn hond was een van de weinige wezens waarover hij zacht was.'],
      ['🐕', 'Presidenten', 'Theodor Heuss (teckel), Heinrich Lübke (teckel) en Gustav Heinemann (poedel). Vooral de teckel is een klassieke Duitse hondenkeuze.']
    ],
    fun: '💡 Duitsland is het land van de rashonden-lijst: veel hondenrassen zijn er ontstaan (Duitse Herder, Rottweiler, Dobermann, Boxer) en rond het hof werden ze vaak functioneel gehouden.'
  },
  se: {
    t: '🇸🇪 Zweden & Scandinavië',
    intro: 'De Scandinavische koningshuizen zijn grootgebruikers van jachthonden en spitsen.',
    dogs: [
      ['🐕', 'Koning Carl Gustaf', 'Houdt Jämthund (Zweedse elkhond) en andere jachthonden — passend bij de Zweedse jachttraditie.'],
      ['🐕', 'Prinses Christina', 'Heeft door de jaren meerdere honden gehad, vaak van jachthondenrassen.']
    ],
    fun: '💡 Scandinavië is ook de bakermat van de moderne hondenwetten: een van de eerste Europese landen met een verbod op oren- en staartcouperen.'
  },
  es: {
    t: '🇪🇸 Spanje & rest van Europa',
    intro: 'Zuid-Europese koningshuizen houden vaker gezelschapshonden en -katten; Spanje (koninklijk huis Bourbon) is bekend met een liefde voor kleine honden.',
    dogs: [
      ['🐩', 'Koningin Letizia & Felipe', 'De koninklijke familie van Spanje heeft (naast katten) een klein hondje gehad; de koninginnen stonden bekend om hun liefde voor poedels en terriërs.'],
      ['🐕', 'Overal in Europa', 'De meeste Europese koningshuizen hebben of hadden honden: van de Belgische koningin Mathilde (labradors) tot de Deense koningin Mary (labradors en terriërs).' ]
    ],
    fun: '💡 Gemeenschappelijk: koninklijke honden zijn zelden exotisch — labradors, spaniëls, terriërs en poedels zijn de top 4 onder royals wereldwijd.'
  }
};

export function koninklijkeHondenPage() {
  return pageShell({
    title: 'Honden van koningen en royals: van Mambo tot de Corgi\'s van Elizabeth II | TrimGids',
    description: 'Welke honden heeft het Nederlandse koningshuis (Luna, Nala, Mambo, Asher) en welke honden hadden vorige koningen en koninginnen? Van Beatrix\' Border Terriërs tot de Corgi\'s van Elizabeth II — per land.',
    canonical: '/koninklijke-honden',
    active: 'koninklijke-honden',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Honden van royals</p>
<div class="hero">
  <span class="eyebrow">Kronen, kastelen &amp; kennelclubs</span>
  <h1>Welke honden hebben onze koning en vorige koningen — en royals elders?</h1>
  <p class="intro">Royals zijn al eeuwen hondenmensen: van de Corgi\'s van koningin Elizabeth II tot de zwarte labradors en toypoedel Mambo van Willem-Alexander en Máxima. Klik per land en zie niet alleen het ras, maar ook het verhaal erachter.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">3</strong><p>zwarte labradors bij koning & Máxima</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">1</strong><p>toypoedel Mambo (de PR-hond van Oranje)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">30+</strong><p>corgi\'s van koningin Elizabeth II</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">4</strong><p>hondenrassen domineren royals: labrador, corgi, terriër, poedel</p></div>
  </div>
</div>

<section class="sec">
  <h2>🌍 Kies een koningshuis</h2>
  <div class="roy" id="landrow">
    ${Object.keys(LANDEN).map((k, i) => `<button data-l="${k}" class="${i === 0 ? 'on' : ''}">${LANDEN[k].t}</button>`).join('')}
  </div>
  <div class="rc" id="land-uit"></div>
</section>

<section class="sec">
  <h2>🐾 Waarom kiezen royals juist deze rassen?</h2>
  <div class="grid g3">
    <div class="card"><h3>Praktisch & publiek</h3><p>Labradors en corgi\'s zijn niet te groot, volgen hun baas overal en zijn foto- en publieksvriendelijk. Een kleine hond kan mee naar officiële gelegenheden zonder te veel ruimte.</p></div>
    <div class="card"><h3>Traditie</h3><p>Veel koningshuizen blijven bij het ras van hun voorgangers: Elizabeth II bij de corgi, Oranje bij de labrador. Het wordt een onderdeel van de identiteit van het huis.</p></div>
    <div class="card"><h3>De PR-waarde</h3><p>Een hond maakt een koninklijk gezin menselijk. Mambo stal in 2023 de show op het strand; Luna en Nala staan op de kerstfoto. De hond is de beste brand ambassador.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/geschiedenis-hond">📜 De complete geschiedenis van de hond →</a>
    <a class="btn ghost" href="/aankoopgids">🛍️ Kies zelf een ras: de aankoopgids →</a>
  </div>
</section>

<script>
(function () {
  var L = ${JSON.stringify(LANDEN)};
  var row = document.getElementById('landrow'), out = document.getElementById('land-uit');
  function show(k) {
    var l = L[k];
    out.innerHTML = '<h3>' + l.t + '</h3><p style="color:var(--muted);font-size:14.5px">' + l.intro + '</p><div class="dogs">' + l.dogs.map(function (d) { return '<div class="dog"><div class="ic">' + d[0] + '</div><div><h4>' + d[1] + '</h4><p>' + d[2] + '</p></div></div>'; }).join('') + '</div><div class="fun">' + l.fun + '</div>';
  }
  row.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    row.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    show(b.getAttribute('data-l'));
  });
  show('nl');
})();
</script>`
  });
}
