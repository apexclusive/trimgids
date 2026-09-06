/* Pagina: Hondenpoepregels — waar gratis zakjes, waar deponeren en hoe hoog de boetes zijn.
   Interactief: "waar ben je?"-kiezer met het juiste antwoord per omgeving. */
import { pageShell } from './base.mjs';

const CSS = `
.spot{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px}
.spot button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.spot button.on{background:var(--g);border-color:var(--g);color:#fff}
.answer{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--em);border-radius:var(--r-lg);padding:22px 24px;box-shadow:var(--shadow)}
.answer h3{font-size:17px;margin-bottom:6px}
.answer p{color:var(--muted);font-size:14.5px}
.answer .rule{margin-top:10px;padding:12px 14px;border-radius:12px;background:rgba(217,119,6,.07);border:1px solid #fcd34d;font-size:13.5px;font-weight:700}
.fines{overflow-x:auto;margin-top:12px}
.fines table{font-size:14px}
.fines td b{color:#dc2626}
.tips{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:14px}
.tips .card p{font-size:13.5px}
`;

const SPOTS = {
  stad: {
    t: '🏙️ Binnen de bebouwde kom',
    a: 'Opruimen — altijd. En je moet een zakje of ander opruimmiddel bij je hebben, óók als de hond nog niets heeft gedaan.',
    r: 'Boete: niet opruimen ±€100–150 · geen zakje bij je ±€100–110 · hond loslopen waar dat niet mag ±€100.'
  },
  bos: {
    t: '🌲 In het bos / natuurgebied',
    a: 'Meestal óók opruimen, maar regels verschillen per terreinbeheerder (Staatsbosbeheer, gemeente, landgoed). Op veel losloopgebieden en speelbossen staan poepbakken; kijk naar de borden.',
    r: 'Onbekend terrein? Neem altijd zakjes mee. In sommige natuurgebieden is de hond alleen op de eigen wandelpaden toegestaan.'
  },
  weide: {
    t: '🐾 Op een officiële hondenuitlaatplaats',
    a: 'Vaak geldt: laten liggen mag (de gemeente ruimt periodiek), maar het mag óók niet — dit verschilt per gemeente. In Twenterand bijvoorbeeld mogen hondenuitlaatplaatsen liggen blijven en worden ze elke twee weken schoongemaakt.',
    r: 'Lees het infobord. Twijfel? Gewoon opruimen — dan zit je altijd goed.'
  },
  strand: {
    t: '🏖️ Op het hondenstrand',
    a: 'Opruimen is bijna overal verplicht, ook op hondenstranden. Neem zakjes mee en gooi ze in de afvalbak bij de strandopgang.',
    r: 'Sommige gemeenten hebben een seizoensverbod voor honden (1 mei–1 oktober); controleer de regels per strand.'
  },
  land: {
    t: '🚜 Buiten de bebouwde kom (landelijk)',
    a: 'Ook buiten de bebouwde kom geldt vaak een opruimplicht binnen de gemeente — en in weilanden en bermen is het bovendien gewoon netjes. Vee- en weide-eigenaren stellen het niet op prijs.',
    r: 'In veel gemeenten geldt de opruimplicht voor alle openbare plaatsen, óók buiten de bebouwde kom.'
  }
};

export function poepzakjesPage() {
  return pageShell({
    title: 'Hondenpoepzakjes: gratis afhalen, deponeren en boetes | TrimGids',
    description: 'Waar haal je gratis hondenpoepzakjes, waar moet je poep deponeren (restafval of poepbak?), en welke boete krijg je als je het niet opruimt? Alle hondenpoepregels per omgeving.',
    canonical: '/poepzakjes',
    active: 'poepzakjes',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Hondenpoepregels</p>
<div class="hero">
  <span class="eyebrow">Poep oprapen = netjes én verplicht</span>
  <h1>Hondenpoepzakjes: gratis afhalen, waar deponeren en hoe groot is de boete?</h1>
  <p class="intro">Bijna elke Nederlandse gemeente heeft hondenpoepregels in de Algemene Plaatselijke Verordening (APV). De kern: <strong>opruimen</strong> en <strong>een zakje bij je hebben</strong>. Waar haal je gratis zakjes, waar mag de poep wel blijven liggen en wat kost het als je het vergeet? Dit overzicht.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">€100–150</strong><p>boete voor niet opruimen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">€100–110</strong><p>boete: geen zakje bij je</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2 weken</strong><p>reinigingsinterval op uitlaatplaatsen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0</strong><p>gemeenten waar opruimen "vrijblijvend" is</p></div>
  </div>
</div>

<section class="sec">
  <h2>🗑️ Waar haal je gratis poepzakjes?</h2>
  <p class="sub">Gemeenten mogen zelf bepalen of ze gratis zakjes verstrekken. In veel gemeenten kun je ze ophalen op vaste plekken; in sommige plaatsen hangen dispensers bij uitlaatplaatsen. Goede plekken om te zoeken:</p>
  <div class="grid g3">
    <div class="card"><h3>🏛️ Gemeente & wijklocaties</h3><p>Gemeentehuis, servicepunten, buurthuizen en "milieustraten". Veel gemeenten vermelden op hun site waar gratis zakjes liggen — check "gratis hondenpoepzakjes + jouw gemeente".</p></div>
    <div class="card"><h3>🐾 Uitlaatplaatsen & poepbakken</h3><p>Steeds vaker hangen zakjesdispensers naast hondenpoepbakken op uitlaatweides en hondenstranden. Neem er eentje mee naar huis voor onderweg (en een extra voor de terugweg).</p></div>
    <div class="card"><h3>🛒 Altijd reserve achter de hand</h3><p>Gratis is fijn, maar betrouwbaar is beter: een rol zakjes in de jaszak, de auto en de riemhouder kost een paar euro en voorkomt dat je ooit zonder zit.</p></div>
  </div>
</section>

<section class="sec">
  <h2>📦 Waar moet je de poep deponeren?</h2>
  <div class="grid g2">
    <div class="card"><h3>✅ Wel doen</h3><ul>
      <li>In een <strong>hondenpoepbak</strong> of speciale uitwerpselen-afvalbak (als die er staat).</li>
      <li>In je <strong>eigen grijze container</strong> (restafval) — in veel gemeenten expliciet toegestaan.</li>
      <li>In een afvalbak langs de wandelroute / bij de strandopgang.</li></ul></div>
    <div class="card" style="border-color:#fca5a5"><h3>🚫 Liever niet / niet doen</h3><ul>
      <li>In de <strong>groene GFT-container</strong>: hondenpoep is geen plantenafval en hoort daar niet thuis.</li>
      <li>In de berm of het bos achterlaten: in de meeste gemeenten binnen de bebouwde kom verboden en in natuurgebieden vaak ook.</li>
      <li>Zakjes met poep in een willekeurige prullenbak bij speelplaatsen? Mag meestal wél, maar alleen als het een algemene afvalbak is — niet in de papierbak.</li></ul></div>
  </div>
</section>

<section class="sec">
  <h2>🚨 Hoe hoog zijn de boetes?</h2>
  <p class="sub">In 2026 ligt het tarief voor niet-opruimen op ±€100–150, afhankelijk van de gemeente. Zonder zakje bij je: ±€100–110. Bij herhaling kan het oplopen tot een GAS-boete van ±€350.</p>
  <div class="fines">
    <table class="table">
      <tr><th>Overtreding</th><th>Boete (indicatie)</th><th>Let op</th></tr>
      <tr><td>Hondenpoep niet opruimen</td><td><b>€100–150</b></td><td>Gemeente bepaalt; Twenterand bijv. €140</td></tr>
      <tr><td>Geen poepzakje / opruimmiddel bij je</td><td><b>€100–110</b></td><td>Ook als de hond nog niets heeft gedaan</td></tr>
      <tr><td>Hond loslopen waar dat niet mag</td><td><b>±€100</b></td><td>Kan oplopen bij herhaling</td></tr>
      <tr><td>Herhaling / bijzondere overtreding</td><td><b>tot ±€350</b></td><td>GAS-boete (gemeentelijke bestuurlijke strafbeschikking)</td></tr>
    </table>
  </div>
  <div class="quote" style="margin-top:14px"><p>Check altijd de APV van jouw gemeente: een halve minuut zoeken kan je €150 besparen. Gemeenten controleren vooral in de buurt van scholen, speeltuinen, winkelcentra en uitlaatweides.</p></div>
</section>

<section class="sec">
  <h2>📍 "In welke situatie ben ik?" — het juiste antwoord</h2>
  <div class="spot" id="spot">
    ${Object.entries(SPOTS).map(([k, v], i) => `<button data-s="${k}" class="${i === 0 ? 'on' : ''}">${v.t}</button>`).join('')}
  </div>
  <div class="answer" id="answer"></div>
</section>

<section class="sec">
  <h2>🧠 Slimme tips voor onderweg</h2>
  <div class="tips">
    <div class="card"><h3>🪢 Zakje aan de riem</h3><p>Een zakjesdispenser aan de riem of het harnas betekent: nooit meer zonder. Kies biologisch afbreekbare zakjes als je ze in de poepbak deponeert.</p></div>
    <div class="card"><h3>🌀 Dubbel pakken</h3><p>Op hondenstranden en in het bos: twee zakjes over elkaar — steviger en minder kans op lekken. Gooi ze in de daarvoor bestemde bakken.</p></div>
    <div class="card"><h3>🧤 Handen schoon</h3><p>Neem handgel mee; hondenpoep kan parasieten (o.a. spoelwormeitjes) bevatten die niet alleen voor honden risico's zijn.</p></div>
    <div class="card"><h3>💸 Boete voorkomen</h3><p>Klein zakje = groot verschil. Check voor je vertrekt even de APV van de gemeente waar je wandelt — zeker op vakantie in een andere gemeente.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/chippen-ontwormen">💉 Chip, wormen & de gezondheid van je hond →</a>
    <a class="btn ghost" href="/wandelen">🌲 Losloopgebieden in heel Nederland →</a>
  </div>
</section>

<script>
(function () {
  var S = ${JSON.stringify(SPOTS)};
  var row = document.getElementById('spot');
  var out = document.getElementById('answer');
  function show(k) {
    var s = S[k];
    out.innerHTML = '<h3>' + s.t + '</h3><p>' + s.a + '</p><div class="rule">' + s.r + '</div>';
  }
  row.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    row.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    show(b.getAttribute('data-s'));
  });
  show('stad');
})();
</script>`
  });
}
