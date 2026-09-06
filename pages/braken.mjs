/* Pagina: Braken bij honden — normaal of niet, wanneer naar de arts, wat gebeurt daar.
   Interactief: spoed-check (symptomen → advies) + kostenoverzicht. */
import { pageShell } from './base.mjs';

const CSS = `
.bq{display:grid;grid-template-columns:320px 1fr;gap:20px;margin-top:16px}
.bq .krt{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.bq .krt h3{font-size:17px;margin-bottom:6px}
.bq .krt p{font-size:13.5px;color:var(--muted)}
.bq .af{display:grid;gap:8px;margin-top:12px}
.bq .af label{display:flex;gap:9px;align-items:flex-start;background:var(--bg);border:1.5px solid var(--line);border-radius:13px;padding:11px 13px;font-size:13.5px;font-weight:700;line-height:1.45}
.bq .af input{margin-top:3px;accent-color:var(--em)}
.bq .adv{margin-top:14px;padding:16px;border-radius:14px;font-size:14px}
.bq .adv.ok{background:rgba(16,185,129,.07);border:1.6px solid var(--em)}
.bq .adv.let{background:rgba(217,119,6,.07);border:1.6px solid #fcd34d}
.bq .adv.spoed{background:rgba(220,38,38,.06);border:1.6px solid #fca5a5}
.bq .adv b{font-size:15px}
.bq .adv p{color:var(--muted);font-size:13.5px;margin-top:5px}
.ong{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.ong .c{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px}
.ong .c h3{font-size:15.5px;margin-bottom:6px}
.ong .c p{font-size:13.5px;color:var(--muted)}
.steps3{display:grid;gap:10px;margin-top:12px}
.s3{display:grid;grid-template-columns:44px 1fr;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.s3 .n{width:40px;height:40px;border-radius:12px;background:var(--g);color:#fff;display:grid;place-items:center;font-weight:800}
.s3 h4{font-size:15px}
.s3 p{font-size:13.5px;color:var(--muted)}
@media(max-width:800px){.bq{grid-template-columns:1fr}.ong{grid-template-columns:1fr}}
`;

const SIGNS = [
  { id: 'bloed', t: '🩸 Bloed in het braaksel (felrood of koffiedik-achtig)', s: 3 },
  { id: 'gif', t: '☠️ Mogelijke vergiftiging (chocolade, druiven, rattengif, uien)', s: 3 },
  { id: 'voorwerp', t: '🧸 Mogelijk een voorwerp ingeslikt (speelgoed, sok, bot)', s: 3 },
  { id: 'tor', t: '🎈 Opgezette, harde buik + kokhalzen zonder dat er iets komt', s: 3 },
  { id: 'herhaald', t: '🔁 Meer dan 2–3 keer braken binnen 24 uur', s: 2 },
  { id: 'suf', t: '😴 Lethargisch, suf of niet meer reageren', s: 2 },
  { id: 'diarree', t: '💩 Diarree of helemaal niet meer drinken', s: 2 },
  { id: 'groen', t: '💛 Gal (geel/groen) braken op de nuchtere maag', s: 1 },
  { id: 'pup', t: '🐶 Pup, senior of hond met een chronische ziekte', s: 2 },
  { id: 'gras', t: '🌱 Eén keer braken na gras/te snel eten, daarna vrolijk', s: 0 },
  { id: 'reis', t: '🚗 Braken tijdens autoritten (wagenspijs)', s: 0 }
];

const KOSTEN = [
  ['Consult + lichamelijk onderzoek', '±€45–60'], ['Bloedonderzoek (basispakket)', '±€60–100'],
  ['Röntgenfoto (buik)', '±€90–150'], ['Echo van de buik', '±€120–200'],
  ['Gastroscopie (kijkoperatie via de slokdarm)', '±€350–650'], ['Infuus + opname (per dag)', '±€80–150'],
  ['Anti-braakmiddel (maropitant e.d.)', '±€15–35'], ['Operatie bij voorwerp of maagtorsie', '±€1.000–2.500']
];

export function brakenPage() {
  return pageShell({
    title: 'Braken bij honden: normaal of niet, wanneer naar de arts en wat krijgt hij daar? | TrimGids',
    description: 'Is het normaal dat mijn hondje regelmatig braakt? Waaraan herken je spoed (bloed, giftige stof, voorwerp, maagtorsie), wanneer bel je de dierenarts en wat gebeurt daar — inclusief kostenoverzicht.',
    canonical: '/braken-hond',
    active: 'braken-hond',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Braken &amp; maagklachten</p>
<div class="hero">
  <span class="eyebrow">Spoed of geen spoed?</span>
  <h1>Is het normaal dat mijn hondje braakt — en wanneer moet ik naar de arts?</h1>
  <p class="intro">Korte antwoorden: <strong>één keer braken</strong> na gras of te snel eten hoeft geen probleem te zijn. <strong>Regelmatig of herhaald braken is nooit normaal</strong> — dat is een signaal dat je moet uitzoeken, en soms direct naar de dierenarts. Hieronder: wanneer wel, wanneer niet, wat er bij de arts gebeurt en wat dat kost.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">1×</strong><p>braken kan normaal zijn (gras, te snel eten, wagenziekte)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2–3×</strong><p>binnen 24 uur = contact opnemen met de arts</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">41 °C+</strong><p>bij braken + hitteverschijnselen: direct spoed</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±45–60 €</strong><p>startkosten consult bij de dierenarts</p></div>
  </div>
</div>

<section class="sec">
  <h2>🧭 Spoed-check: vink aan wat op je hond van toepassing is</h2>
  <p class="sub">Vink alle symptomen aan en zie direct welk advies past. Hoe meer vinkjes, hoe sneller je belt. Bij twijfel: <strong>altijd bellen</strong> — de dierenarts beoordeelt het graag even.</p>
  <div class="bq">
    <div class="krt">
      <h3>Pas dit toe op jouw hond</h3>
      <p>Vink aan wat klopt. De meter telt het risico op.</p>
      <div class="af" id="signs">
        ${SIGNS.map(s => `<label><input type="checkbox" data-s="${s.s}"><span>${s.t}</span></label>`).join('')}
      </div>
    </div>
    <div>
      <div class="adv ok" id="advice"><b>💚 Geen spoed</b><p>Geen symptomen aangevinkt. Eén keer braken zonder andere klachten is meestal onschuldig. Houd je hond in de gaten, laat de maag even rusten en geef daarna kleine, lichte maaltijden.</p></div>
      <div class="steps3" style="margin-top:16px">
        <div class="s3"><div class="n">1</div><div><h4>Blijf rustig en observeer</h4><p>Noteer hoe vaak, wat eruit komt (voedsel, gal, bloed?), en of je hond nog drinkt, eet en alert is.</p></div></div>
        <div class="s3"><div class="n">2</div><div><h4>Bel bij twijfel de eigen dierenarts</h4><p>Bel vóór je komt: de praktijk kan dan alvast voorbereiden en beoordeelt of je direct of binnen een paar uur kunt komen.</p></div></div>
        <div class="s3"><div class="n">3</div><div><h4>Spoed? Bel 112 / 144 en rijd naar de kliniek</h4><p>Bij bloeding, vergiftiging, een mogelijk ingeslikt voorwerp of een harde opgezette buik telt elke minuut. Neem de verpakking van een mogelijk gif mee.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <h2>🔍 Wat is 'normaal' braken en wat niet?</h2>
  <div class="ong">
    <div class="c"><h3>🟢 Meestal geen probleem</h3><p>Eén keer braken en daarna weer vrolijk eten en spelen; braken na het eten van gras; braken bij wagenziekte in de auto; een enkele gele gal-braak op de nuchtere maag (vroeg in de ochtend) zonder verdere klachten.</p></div>
    <div class="c" style="border-color:#fca5a5"><h3>🔴 Nooit 'gewoon'</h3><p>Meerdere keren per dag of dagen achter elkaar; braken én diarree of koorts; braken bij een lusteloze hond; pups en senioren die braken; braken na het eten van iets verdachts; een hond die niet meer drinkt of opgezwollen is.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Braken vs. oprisping:</strong> bij braken komt de maaginhoud met kracht omhoog (met buikspieren, vaak schuim of gal erbij); bij een oprisping komt voer zónder inspanning terug uit de slokdarm, vaak vlak na het eten. Bij veelvuldig oprispen gaat het meestal om een slokdarmprobleem — ook dat hoort bij de arts gemeld te worden.</p></div>
</section>

<section class="sec">
  <h2>🏥 Wat gebeurt er bij de dierenarts?</h2>
  <p class="sub">Wie met een braakprobleem komt, krijgt meestal dit traject. Hoe ernstiger, hoe meer stappen — en hoe hoger de kosten.</p>
  <div class="steps3">
    <div class="s3"><div class="n">1</div><div><h4>Intake & lichamelijk onderzoek</h4><p>Vragen over eten, toegang tot gif/voorwerpen, frequentie, ontlasting en vaccinatie; daarna temperatuur, pols, ademhaling, buik voelen en de slijmvliezen bekijken (uitdroging?).</p></div></div>
    <div class="s3"><div class="n">2</div><div><h4>Bloedonderzoek & beeldvorming</h4><p>Een basisbloedonderzoek kijkt naar ontsteking, organen en vochtbalans. Bij vermoeden van een voorwerp of torsie volgen röntgen en/of echo.</p></div></div>
    <div class="s3"><div class="n">3</div><div><h4>Behandeling</h4><p>Bij milde klachten: anti-braakmiddel (bijv. maropitant), maagbeschermer en een lichte dieetvoeding. Bij uitdroging: infuus. Bij een voorwerp of torsie: endoscopie of operatie.</p></div></div>
    <div class="s3"><div class="n">4</div><div><h4>Thuis verder</h4><p>Vaak 2–3 dagen licht verteerbaar voer (of een veterinair maag/darm-dieet) in kleine porties, met voldoende water. Volg het advies van de praktijk; geen 'vrije' snacks tijdens het herstel.</p></div></div>
  </div>
  <div class="pricetable" style="margin-top:18px">
    <table class="table">
      <tr><th>Onderzoek / behandeling</th><th>Indicatieve kosten</th></tr>
      ${KOSTEN.map(k => `<tr><td>${k[0]}</td><td><b>${k[1]}</b></td></tr>`).join('')}
    </table>
  </div>
  <p style="font-size:12.5px;color:var(--muted);margin-top:8px">Tarieven verschillen per praktijk en regio; voor 2026 geldt: grootste stijgingen bij spoed en diagnostiek. Een goede hondenverzekering dekt vaak 70–90% van dit soort kosten.</p>
</section>

<section class="sec">
  <h2>💊 Veelvoorkomende oorzaken in het kort</h2>
  <div class="grid g3">
    <div class="card"><h3>🥗 Voeding & snelheid</h3><p>Te snel eten, plotselinge voerwissel, te vet voer, etensresten of gras. Anti-schrokbak en langzaam overstappen (7–10 dagen) voorkomen veel gevallen.</p></div>
    <div class="card"><h3>🪱 Maagdarmparasieten</h3><p>Spoelwormen, lintwormen en giardia veroorzaken terugkerend braken en dunne ontlasting. Regelmatige ontlastingcheck + ontwormen op advies (zie onze <a href="/chippen-ontwormen" style="color:var(--g);font-weight:700">chip- & ontwormgids</a>).</p></div>
    <div class="card"><h3>🧸 Voorwerp & maagtorsie</h3><p>Een ingeslikte sok of een draad kan de darm afknellen; bij grote rassen kan de maag kantelen (torsie) — dan is er sprake van een acute spoedoperatie binnen 1–2 uur.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/hitteberoerte-hond">🔥 Ook oververhit of in de auto? Eerstehulpwijzer →</a>
    <a class="btn ghost" href="/webshop">🛒 Maag- & darmondersteuning in de webshop →</a>
  </div>
</section>

<script>
(function () {
  var boxes = document.querySelectorAll('#signs input');
  var adv = document.getElementById('advice');
  function upd() {
    var s = 0;
    boxes.forEach(function (b) { if (b.checked) s += +b.getAttribute('data-s'); });
    if (s >= 6) {
      adv.className = 'adv spoed';
      adv.innerHTML = '<b>🚨 Spoed: bel direct 112 (of 144) en ga naar de kliniek</b><p>Bloed, vermoeden van gif of een ingeslikt voorwerp, een harde opgezette buik of een suf dier: wacht niet op de volgende afspraak. Neem de verpakking van een mogelijk gif mee en laat iemand anders rijden als je zelf overstuur bent.</p>';
    } else if (s >= 3) {
      adv.className = 'adv let';
      adv.innerHTML = '<b>🟠 Vandaag contact: bel je eigen praktijk</b><p>Meerdere of terugkerende symptomen: bel de dierenarts vandaag nog en bespreek of je langs kunt komen. Houd vocht in de gaten; bied kleine slokjes aan en géén snacks.</p>';
    } else if (s >= 1) {
      adv.className = 'adv ok';
      adv.innerHTML = '<b>💛 Houd in de gaten, bij twijfel bellen</b><p>Eén of twee milde klachten: laat de maag 6–12 uur rusten, bied daarna kleine lichte maaltijden aan. Wordt het erger, braakt je hond opnieuw of wordt hij suf? Dan alsnog contact opnemen.</p>';
    } else {
      adv.className = 'adv ok';
      adv.innerHTML = '<b>💚 Geen spoed</b><p>Geen symptomen aangevinkt. Eén keer braken zonder andere klachten is meestal onschuldig. Houd je hond in de gaten, laat de maag even rusten en geef daarna kleine, lichte maaltijden.</p>';
    }
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
})();
</script>`
  });
}
