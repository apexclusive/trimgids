/* Pagina: Is een hond een roedeldier? Fulltime werken, uitlaatservice en alleen-zijn.
   Interactief: "hoeveel uur alleen?"-check per levensfase. */
import { pageShell } from './base.mjs';

const CSS = `
.fs{display:grid;grid-template-columns:330px 1fr;gap:20px;margin-top:16px}
.fs .krt{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.fs .krt h3{font-size:17px;margin-bottom:6px}
.fs .krt p{font-size:13.5px;color:var(--muted)}
.fs label{display:grid;gap:5px;font-size:13px;font-weight:800;margin-top:12px}
.fs input[type=range]{width:100%;accent-color:var(--em);margin-top:4px}
.fs .res{margin-top:14px;background:rgba(16,185,129,.07);border:1.6px solid var(--em);border-radius:14px;padding:16px;font-size:14.5px}
.fs .res b{display:block;font-size:17px}
.plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}
.plan .p{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.plan .p .ic{font-size:28px}
.plan .p h3{font-size:16px;margin:8px 0 4px}
.plan .p p{font-size:13.5px;color:var(--muted)}
.tv{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.tv .c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.tv .c h3{font-size:15px;margin-bottom:4px}
.tv .c p{font-size:13px;color:var(--muted)}
@media(max-width:800px){.fs{grid-template-columns:1fr}.tv{grid-template-columns:1fr}}
`;

const FASEN = {
  puppy: { b: 'Pup (tot ±6 mnd): nog nooit lang alleen', t: 'Pups kunnen pas rond ±4–5 maanden rustig alleen zijn en dan nog maximaal een paar uur. Plan: de eerste weken iemand thuis, daarna stap voor stap opbouwen (2 min → 5 min → 30 min → 2 uur).', pct: 20 },
  puber: { b: 'Puber (6–18 mnd): opbouwen naar 4–5 uur', t: 'Vanaf ±6 maanden mag je langzaam naar 4–5 uur. Verrijk de omgeving: denkspeelgoed, kauwmateriaal, een rustige kamer. Geen ‘feest’ bij thuiskomst, geen drama bij vertrek.', pct: 55 },
  adult: { b: 'Volwassen (1–7 jr): max ±4–5 uur onafgebroken', t: 'Een volwassen, getrainde hond kan overdag ±4–5 uur alleen zijn (bijv. één werkdag), mits hij ’s ochtends goed is uitgelaten en overdag een pauze heeft. Langer dan ±6–8 uur is te veel, ook al lijkt hij het te accepteren.', pct: 70 },
  senior: { b: 'Senior (8+ jr): minder, korter en vaker', t: 'Senioren hebben vaker een leeg blaasje en soms verzorging nodig. Beter: 2–3 korte momenten per dag (uitlaatservice) dan één lange dag alleen.', pct: 55 }
};

export function werkenMetHondPage() {
  return pageShell({
    title: 'Is een hond een roedeldier en kan hij alleen zijn als je fulltime werkt? | TrimGids',
    description: 'Is een hond echt een roedeldier? Hoeveel uur mag een hond alleen zijn als je fulltime werkt, hoe train je dat en hoe werkt een uitlaatservice? Complete gids voor werkende baasjes.',
    canonical: '/hond-en-werk',
    active: 'hond-en-werk',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Honden &amp; werken</p>
<div class="hero">
  <span class="eyebrow">Fulltime werken · hondenopvoeding</span>
  <h1>Is een hond een roedeldier — en hoe kun je hem hebben als je fulltime werkt?</h1>
  <p class="intro">Het korte antwoord: <strong>ja, de hond is van oorsprong een roedeldier</strong> — maar niet in de zin dat hij altijd bij andere honden moet zijn. Moderne honden zien hun mens als hun roedel, en kunnen prima alleen zijn als je dat goed opbouwt. Het echte verhaal zit in de balans: beweging, mentale rust en niet te lang alleen.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Roedeldier</strong><p>maar de roedel = jouw gezin</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±4–5 u</strong><p>maximaal alleen (volwassen, getraind)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">20 min</strong><p>mentale rust = 1 uur lopen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±€15–25</strong><p>per wandeling uitlaatservice (indicatie)</p></div>
  </div>
</div>

<section class="sec">
  <h2>🐺 Is een hond echt een roedeldier?</h2>
  <p class="sub">Ja — maar "roedel" betekent niet "roedel honden".</p>
  <div class="tv">
    <div class="c"><h3>De oude roedelmythe</h3><p>Lange tijd dachten we dat honden in een strikte 'alfaroedel' leven zoals in oude wolvenboeken stond: één baas, één rangorde, altijd samen. Dat beeld is inmiddels grotendeels achterhaald.</p></div>
    <div class="c"><h3>De moderne waarheid</h3><p>Honden zijn flexibele sociale wezens. Natuurlijk leven wilde honden in groepen, maar hun roedel bestaat uit familie/dieren die ze kennen. Een huishond ziet zijn menselijke gezin als zijn roedel — hij heeft geen tweede hond nodig om gelukkig te zijn, maar wél een stabiel sociaal leven met zijn mensen.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Conclusie:</strong> je hond heeft geen constante aanwezigheid nodig, maar wél een voorspelbaar ritme. Hij wil weten wanneer hij wordt uitgelaten, wanneer er gevoerd wordt en wanneer jij terugkomt. Het is dus geen 'sociale hond vs. eenzame hond' — het is 'voorspelbaar vs. onvoorspelbaar'.</p></div>
</section>

<section class="sec">
  <h2>⏰ Hoe lang mag een hond alleen zijn?</h2>
  <p class="sub">Doe de check: kies de levensfase en sleep de schuif naar jouw situatie.</p>
  <div class="fs">
    <div class="krt">
      <h3>Alleen-tijd-check</h3>
      <p>Kies de levensfase van je hond en vul in hoeveel uur hij overdag alleen is.</p>
      <label>Levensfase<select id="fase">
        <option value="puppy">Pup (tot ±6 mnd)</option>
        <option value="puber">Puber (6–18 mnd)</option>
        <option value="adult" selected>Volwassen (1–7 jr)</option>
        <option value="senior">Senior (8+ jr)</option>
      </select></label>
      <label>Uren alleen per dag: <strong id="uren-lbl">8 uur</strong></label>
      <input type="range" id="uren" min="1" max="12" value="8" aria-label="Uren alleen">
      <div class="res" id="fs-res"><b>—</b><p>Kies en sleep om advies te zien.</p></div>
    </div>
    <div>
      <h3 style="font-size:18px">Gouden regels voor fulltime werkende baasjes</h3>
      <ul style="list-style:none;display:grid;gap:10px;margin-top:12px;font-size:14.5px">
        <li style="display:flex;gap:10px"><span>🌅</span><div><b>'s Ochtends goed uit.</b> Een 's ochtends uitgelaten en gevoede hond slaapt overdag uren — rust is voor hem geen straf maar normaal.</div></li>
        <li style="display:flex;gap:10px"><span>🧠</span><div><b>Mentale verrijking.</b> Denkspeelgoed, snuffelmat, kauwmateriaal. 20 minuten puzzelen of snuffelen rust een hond net zo goed uit als een wandeling.</div></li>
        <li style="display:flex;gap:10px"><span>🚪</span><div><b>Neutraal vertrekken en thuiskomen.</b> Geen theater: kort gedag, deur dicht. Bij thuiskomst even rustig, pas daarna aandacht.</div></li>
        <li style="display:flex;gap:10px"><span>📅</span><div><b>Vaste tijden, elke dag.</b> Hond houdt van routine: uitlaat, voer, slaap. Perfect voor werkende baasjes — ook in het weekend.</div></li>
        <li style="display:flex;gap:10px"><span>🚶</span><div><b>Na werk weer echt uit.</b> Niet alleen 'even plassen', maar een echte wandeling van 30–60 min. Daarna pas eten en rusten.</div></li>
        <li style="display:flex;gap:10px"><span>📈</span><div><b>Buurt de eenzaamheid niet met een tweede hond.</b> Twee honden kunnen samen verlatingsangst ontwikkelen; een goede routine + uitlaatservice is beter.</div></li>
      </ul>
    </div>
  </div>
</section>

<section class="sec">
  <h2>🐕‍🦺 Uitlaatservice: hoe werkt dat en wat kost het?</h2>
  <p class="sub">Een uitlaatservice is dé oplossing voor werkende baasjes: een professional haalt je hond op, wandelt ±30–60 minuten en brengt hem weer thuis — soms ook met voeren, foto's en appjes.</p>
  <div class="plan">
    <div class="p"><div class="ic">🚶</div><h3>Zelfstandige uitlater</h3><p>Vaak 1–2 honden per wandeling, flexibel in te plannen, persoonlijke aandacht. Kosten ±€12–20 per wandeling.</p></div>
    <div class="p"><div class="ic">🐾</div><h3>Uitlaatbedrijf / dagopvang</h3><p>Grote groepen (soms 5–10 honden) in groepsrondes. Goedkoper (±€10–15) maar minder individuele aandacht; let op sociale honden-ervaring.</p></div>
    <div class="p"><div class="ic">🏡</div><h3>Hondenuitlaatservice met app</h3><p>Veel bedrijven appen je foto's en route na elke wandeling. Handig voor vertrouwen en als bewijs dat alles oké is.</p></div>
    <div class="p"><div class="ic">🏢</div><h3>Dagopvang (dagbesteding)</h3><p>Voor pups, honden met verlatingsangst of honden die sociaal veel energie hebben. Kosten ±€15–30 per dag; combineert vaak met voeren en spelen.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Belangrijk:</strong> check altijd of de uitlaatservice verzekerd is, ervaring heeft met jouw ras/maat, en of jouw hond sociaal genoeg is. Vraag een proefwandeling en referenties. Ook kun je via onze <a href="/vacatures" style="color:var(--g);font-weight:700">vacature & hulpkrachten-pagina</a> zelf een uitlater in je regio vinden.</p></div>
</section>

<section class="sec">
  <h2>🗓️ Een voorbeeld-werkdag (8 uur kantoor)</h2>
  <div class="grid g3">
    <div class="card"><h3>07:00 · Ochtendritueel</h3><p>20–30 min wandelen + voeren + 5 min denkspel. Hond is klaar voor de 'werkdag' en slaapt daarna uren.</p></div>
    <div class="card"><h3>11:30 · Uitlaatservice</h3><p>30–45 min wandelen, eventueel met appje. Tussendoor: denkspeelgoed met snoepjes of een kauwstaaf.</p></div>
    <div class="card"><h3>17:30 · Echte tijd samen</h3><p>45–60 min wandelen of spelen, daarna eten en rust. Voor de rest van de avond is je hond voldaan en jij vrij.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/hitteberoerte-hond">🔥 Let op bij warm weer: de hittewijzer →</a>
    <a class="btn ghost" href="/hondenweetjes">🧠 Wat is slim gedrag bij een hond? →</a>
  </div>
</section>

<script>
(function () {
  var F = ${JSON.stringify(FASEN)};
  var fase = document.getElementById('fase'), uren = document.getElementById('uren');
  var uLbl = document.getElementById('uren-lbl'), res = document.getElementById('fs-res');
  function upd() {
    var f = F[fase.value], u = +uren.value;
    uLbl.textContent = u + (u === 1 ? ' uur' : ' uur');
    var max = Math.round(f.pct / 100 * ((fase.value === 'adult' ? 7 : 5)));
    var status, color, advies;
    if (fase.value === 'puppy') {
      status = u <= 2 ? '🟢 Goed bezig' : '🟠 Te veel voor een pup';
      advies = u <= 2 ? 'Een pup kan dit prima aan na de opbouwfase.' : 'Neem de eerste maanden een oppas, familielid of uitlaatservice. Een pup mag nog niet uren alleen zijn.';
    } else {
      status = u <= max ? '🟢 Prima werkbaar' : '🟠 Te veel zonder pauze';
      advies = u <= max ? f.t : 'Langer dan ' + max + ' uur is voor deze fase te veel. Plan een uitlaatservice of dagopvang in het middaguur.';
    }
    res.innerHTML = '<b>' + status + ' · max ±' + max + ' uur aan één stuk</b><p>' + advies + ' — ' + f.b + '</p>';
  }
  fase.addEventListener('change', upd);
  uren.addEventListener('input', upd);
  upd();
})();
</script>`
  });
}
