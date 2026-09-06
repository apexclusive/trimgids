/* Pagina: Hitteberoerte bij honden + hond in hete auto (ruit inslaan, wet, aantallen).
   Interactief: "wat zie je?"-check + koel-actieplan met stappen. */
import { pageShell } from './base.mjs';

const CSS = `
.hh{display:grid;grid-template-columns:340px 1fr;gap:20px;margin-top:16px}
.hh .krt{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.hh .krt h3{font-size:17px;margin-bottom:6px}
.hh .krt p{font-size:13.5px;color:var(--muted)}
.hh .af{display:grid;gap:8px;margin-top:12px}
.hh .af label{display:flex;gap:9px;align-items:flex-start;background:var(--bg);border:1.5px solid var(--line);border-radius:13px;padding:11px 13px;font-size:13.5px;font-weight:700;line-height:1.45}
.hh .af input{margin-top:3px;accent-color:var(--em)}
.hh .adv{margin-top:14px;padding:16px;border-radius:14px;font-size:14px}
.hh .adv.ok{background:rgba(16,185,129,.07);border:1.6px solid var(--em)}
.hh .adv.spoed{background:rgba(220,38,38,.06);border:1.6px solid #fca5a5}
.hh .adv b{font-size:15px}
.hh .adv p{color:var(--muted);font-size:13.5px;margin-top:5px}
.cool{display:grid;gap:10px;margin-top:12px;counter-reset:c}
.cool .c{display:grid;grid-template-columns:44px 1fr;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.cool .n{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--em),var(--g2));color:#fff;display:grid;place-items:center;font-weight:800}
.cool h4{font-size:15px}
.cool p{font-size:13.5px;color:var(--muted)}
.auto{overflow-x:auto;margin-top:12px}
.auto table{font-size:13.5px}
.temp-timeline{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.temp-timeline .t{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center}
.temp-timeline .t b{display:block;font-size:17px;color:var(--g)}
.temp-timeline .t span{font-size:12px;color:var(--muted);font-weight:700}
@media(max-width:800px){.hh{grid-template-columns:1fr}.temp-timeline{grid-template-columns:1fr 1fr}}
`;

const SIGNS = [
  { id: 'hijgen', t: '🥵 Heftig en aanhoudend hijgen, kwijlen', s: 2 },
  { id: 'rood', t: '🩸 Felrode of juist bleke tong/slijmvliezen', s: 2 },
  { id: 'wankel', t: '🥴 Wankel, suf of niet meer reageren op naam', s: 3 },
  { id: 'braken', t: '🤮 Braken of diarree tijdens of na warmte', s: 2 },
  { id: 'auto', t: '🚗 Hond zit in een afgesloten auto in de zon', s: 3 },
  { id: 'asfalt', t: '🌡️ Hond loopt net op heet asfalt (handtest langer dan 5 sec niet vol te houden)', s: 1 },
  { id: 'aanval', t: '⚡ Stuiptrekkingen of in elkaar zakken', s: 3 },
  { id: 'koel', t: '🧊 Hond is al afgekoeld (schaduw, water) en knapt op', s: 0 }
];

export function hitteberoertePage() {
  return pageShell({
    title: 'Hitteberoerte bij honden: eerste hulp, hete auto & mag je de ruit inslaan? | TrimGids',
    description: 'Wat doe je als je hond een hitteberoerte krijgt? Het complete EHBO-plan, waarom een hete auto levensgevaarlijk is, wat de wet zegt over een ruit inslaan en hoeveel honden hier jaarlijks sterven.',
    canonical: '/hitteberoerte-hond',
    active: 'hitteberoerte-hond',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Hitte &amp; noodhulp</p>
<div class="hero">
  <span class="eyebrow">Eerste hulp · Zomerveiligheid</span>
  <h1>Hitteberoerte: wat moet je doen — en wat mag je als je hond in een hete auto zit?</h1>
  <p class="intro">Een hond koelt via hijgen af en kan dus veel slechter tegen warmte dan wij. Bij een hitteberoerte (lichaamstemperatuur boven <strong>±41 °C</strong>) telt elke minuut. Deze pagina geeft het echte actieplan, en beantwoordt de zomerkwestie: <strong>mag je de ruit van een auto inslaan</strong> als er een hond in zit?</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">&gt;41 °C</strong><p>hitteberoerte = levensgevaar</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">50 °C+</strong><p>in een auto in de zon (raam op een kier helpt niet)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">15 min</strong><p>kan al fataal zijn in een afgesloten auto</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Een dier in nood redden</strong><p>is een wettelijke zorgplicht</p></div>
  </div>
</div>

<section class="sec">
  <h2>🧭 "Wat zie ik?" — herken je een hitteberoerte?</h2>
  <p class="sub">Vink aan wat je ziet. Scoor je hoog, start dan direct het koelplan hieronder en bel onderweg naar de kliniek.</p>
  <div class="hh">
    <div class="krt">
      <h3>Symptomen-check</h3>
      <p>Hoe meer punten, hoe urgenter de situatie.</p>
      <div class="af" id="hs">
        ${SIGNS.map(s => `<label><input type="checkbox" data-s="${s.s}"><span>${s.t}</span></label>`).join('')}
      </div>
    </div>
    <div>
      <div class="adv ok" id="had"><b>💚 Rustig</b><p>Geen signalen aangevinkt. Bij warm weer: wandel vroeg en laat, laat je hond zelf het tempo bepalen en neem altijd water mee. Check het asfalt met de handtest (5 seconden).</p></div>
      <div class="cool" style="margin-top:16px">
        <div class="c"><div class="n">1</div><div><h4>Naar de schaduw of airconditioning</h4><p>Direct uit de zon en van het warme asfalt. Laat de hond liggen — niet laten doorlopen. Bel intussen je dierenarts of de spoedkliniek, zodat je onderweg al advies krijgt.</p></div></div>
        <div class="c"><div class="n">2</div><div><h4>Koel met lauw (niet ijskoud!) water</h4><p>Bevochtig buik, liezen, poten en oren met lauw/koel stromend water. <strong>Nooit ijskoud water of ijsblokjes</strong>: dat vernauwt de bloedvaten en kan shock veroorzaken. Niet het hele dier onderdompelen.</p></div></div>
        <div class="c"><div class="n">3</div><div><h4>Ventileer en blijf koelen onderweg</h4><p>Auto-airco volle kracht of raam open, hond op een natte handdoek. Meet zo mogelijk de temperatuur (normaal 38–39,2 °C, hitteberoerte vaak >41 °C).</p></div></div>
        <div class="c"><div class="n">4</div><div><h4>Kleine slokjes lauw water — nooit gieten</h4><p>Alleen als de hond zelf wil drinken, kleine slokjes. Geef niets door de keel en forceer geen drinken bij een suf of braken hond.</p></div></div>
        <div class="c"><div class="n">5</div><div><h4>Naar de kliniek — ook als hij opknapt</h4><p>Een hitteberoerte kan uren later schade geven aan organen en hersenen. Laat je hond altijd nakijken, ook als hij zich na afkoelen beter lijkt te voelen.</p></div></div>
      </div>
    </div>
  </div>
  <div class="danger" style="margin-top:14px;background:rgba(220,38,38,.05);border:1px solid #fca5a5;border-radius:14px;padding:14px 16px;font-size:13.5px;font-weight:700">⛔ Niet doen: koud water over het hoofd of hele lichaam, ijsblokjes, in een koude vijver gooien, laten doorlopen "om af te koelen", of wachten "of het overgaat".</div>
</section>

<section class="sec">
  <h2>🚗 Hond in de auto: het eerlijke verhaal</h2>
  <p class="sub">Een stilstaande auto wordt in de zon razendsnel een oven — ook met de ramen op een kier. En het is meestal niet zuurstofgebrek dat de hond doodt, maar oververhitting van de hersenen.</p>
  <div class="temp-timeline">
    <div class="t"><b>25 °C buiten</b><span>na 10 min ±37 °C binnen</span></div>
    <div class="t"><b>25 °C buiten</b><span>na 20–30 min ±45–50 °C binnen</span></div>
    <div class="t"><b>30 °C+ / zon</b><span>snel &gt;50 °C in de auto</span></div>
    <div class="t"><b>Raam op een kier</b><span>verlaagt dit nauwelijks</span></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Hoeveel honden sterven hieraan?</strong> Er bestaat geen officiële nationale telling. De Dierenbescherming bevestigt dat er jaarlijks meldingen én sterfgevallen zijn van oververhitte honden in auto's; schattingen op Europees niveau spreken van honderden tot meer dan duizend gevallen per jaar. Wat vooral telt: elk geval is 100% vermijdbaar — je hond hoort bij warmte nooit (zelfs geen 10 minuten) alleen in de auto.</p></div>
  <h3 style="margin-top:20px;font-size:18px">⚖️ Mag jij de ruit inslaan? Zo zit het juridisch</h3>
  <div class="grid g3" style="margin-top:10px">
    <div class="card"><h3>De basisregel</h3><p>Dieren in nood hulp verlenen is een wettelijke zorgplicht. Een hond die in een hete auto zit is een dier in nood; de eigenaar die hem achterlaat is strafbaar.</p></div>
    <div class="card"><h3>Ruit inslaan? Voorzichtig!</h3><p>Bij een echt levensgevaar kan het inslaan worden gezien als <strong>zaakwaarneming</strong> (je voorkomt grotere schade aan het eigendom van de eigenaar: de hond zelf). Maar <strong>bel eerst 112 of 144</strong>, beoordeel de situatie en volg hun instructies. Politie en OM adviseren niet op eigen houtje te handelen; zonder acute noodloop is beschadiging een strafbaar feit.</p></div>
    <div class="card"><h3>Goede werkwijze</h3><p>1. Foto's maken (tijd, situatie) · 2. 112 of 144 bellen (of 0900-8844) · 3. Getuigen vragen erbij te blijven · 4. Alleen handelen als de hond er echt aan toe is (suf, instorten, fel hijgen) · 5. Direct overnemen op de plek van een bevoegde hulpverlener. Blijf buitenlandse regels checken — in België geldt bijvoorbeeld een strenger regime.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/braken-hond">🤢 Braken & maagklachten: wanneer naar de arts? →</a>
    <a class="btn ghost" href="/reizen">✈️ Warmte & vliegen: kan mijn hond tegen de bestemming? →</a>
  </div>
</section>

<script>
(function () {
  var boxes = document.querySelectorAll('#hs input');
  var adv = document.getElementById('had');
  function upd() {
    var s = 0;
    boxes.forEach(function (b) { if (b.checked) s += +b.getAttribute('data-s'); });
    if (s >= 5) {
      adv.className = 'adv spoed';
      adv.innerHTML = '<b>🚨 Direct het koelplan en naar de kliniek</b><p>Start stap 1–3 méteen, bel alvast onderweg en rijd met airco naar de dichtstbijzijnde spoedkliniek. Een hond met stuiptrekkingen of een bewustzijnsdaling mag niet alleen blijven.</p>';
    } else if (s >= 2) {
      adv.className = 'adv spoed';
      adv.innerHTML = '<b>🟠 Handel nu: koelen + bellen</b><p>Schaduw, lauw water op buik/liezen/poten, ventileren. Bel je eigen dierenarts en vraag of je meteen langs moet komen. Twijfel niet: bij hitte kun je beter te vroeg dan te laat bellen.</p>';
    } else {
      adv.className = 'adv ok';
      adv.innerHTML = '<b>💚 Rustig</b><p>Geen signalen aangevinkt. Bij warm weer: wandel vroeg en laat, laat je hond zelf het tempo bepalen en neem altijd water mee. Check het asfalt met de handtest (5 seconden).</p>';
    }
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
})();
</script>`
  });
}
