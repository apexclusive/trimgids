/* Pagina: Vliegen & reizen met je hond — cabine vs ruim, documenten, temperatuur & hitte, checklist.
   Interactief: vlieg-check (gewicht × snuit × bestemming) en temperatuur-meter. */
import { pageShell, esc } from './base.mjs';

const CSS = `
.vlg{display:grid;grid-template-columns:420px 1fr;gap:20px;margin-top:16px}
.vlg .box{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.vlg .box input[type=range]{width:100%;accent-color:var(--em);margin:8px 0 4px}
.vlg label.opt{display:flex;gap:10px;align-items:center;font-weight:700;font-size:14px;margin:12px 0}
.vlg select{width:100%;padding:12px 14px;border:1.6px solid var(--line);border-radius:14px;background:var(--bg);font:inherit;font-weight:700;color:var(--ink)}
.verdict{margin-top:16px;padding:16px;border-radius:14px;background:rgba(16,185,129,.07);border:1.6px solid var(--em)}
.verdict.no{background:rgba(220,38,38,.05);border-color:#fca5a5}
.verdict.ok{background:rgba(16,185,129,.07);border-color:var(--em)}
.verdict b{font-size:16px}
.verdict p{font-size:14px;color:var(--muted);margin-top:6px}
.airline{overflow-x:auto}
.airline table{font-size:13.5px}
.heat{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px}
.heat .h{border-radius:14px;padding:14px;border:1px solid var(--line);font-size:13px;font-weight:700}
.heat .h b{display:block;font-size:19px;margin-bottom:2px}
.heat .g{background:rgba(16,185,129,.08);border-color:var(--em)}
.heat .y{background:rgba(217,119,6,.08);border-color:#fcd34d}
.heat .o{background:rgba(249,115,22,.1);border-color:#fb923c}
.heat .r{background:rgba(220,38,38,.08);border-color:#fca5a5}
.steps2{display:grid;gap:12px}
.step2{display:grid;grid-template-columns:46px 1fr;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.step2 .n{width:42px;height:42px;border-radius:14px;background:var(--g);color:#fff;display:grid;place-items:center;font-weight:800;font-size:17px}
.step2 h3{font-size:16.5px;margin-bottom:3px}
.step2 p{color:var(--muted);font-size:14px}
@media(max-width:900px){.vlg{grid-template-columns:1fr}}
`;

const AIRLINES = [
  ['KLM', '≤8 kg (incl. tas) in cabine, tas max. 46×28×24 cm, onder stoel', 'Ja, ruim in IATA-bench (tot ±75 kg incl. bench)', 'Kortsnuitige rassen geweigerd in ruim; 48 u reserveren', '€70–€500 enkel'],
  ['Transavia', 'Kleine hond/kat in cabine (richtprijs ±€45)', 'Ja (±€70)', 'Min. 3 maanden', '±€45–€70 enkel'],
  ['Lufthansa', '≤8 kg in cabine voor NL-vluchten', 'Ja, via Lufthansa Cargo (boeking via agent)', 'Leeftijdsgrenzen per bestemming', 'Wordt per route bepaald'],
  ['Air France', '≤8 kg (vanuit Frankrijk; vanuit UK alleen cargo)', 'Ja, tot ±75 kg', 'Kortsnuitige rassen beperkt; min. 15 weken', 'vanaf €70 cabine / €100 ruim'],
  ['Ryanair & easyJet', '❌ Nee (alleen erkende assistentiehonden)', '❌ Nee', 'Assistentiehonden: EU-paspoort + certificering', 'n.v.t.'],
  ['TUI / Corendon', 'Vaak kleine hond in cabine (per vlucht verschillend)', 'Soms via cargo-afdeling', 'Altijd vooraf aanvragen via maatschappij', 'Wordt per route bepaald']
];

const HEAT = [
  ['< 20 °C', '🟢 Veilig', 'Normale wandeling en sport voor alle rassen.', 'g'],
  ['20–23 °C', '🟡 Let op', 'Veilig voor de meeste honden; kortsnuitig & dikke vacht in de gaten houden.', 'y'],
  ['24–26 °C', '🟠 Beperken', 'Korte wandelingen, altijd water, schaduw; brachycefale rassen: voorzichtig vanaf ±22–24 °C.', 'o'],
  ['27–28 °C', '🔴 Te warm', 'Alleen vroeg of laat; geen lange wandelingen. Kortsnuitige honden: binnen laten.', 'r'],
  ['29 °C+', '⛔ Extreem', 'Geen wandelactiviteit; asfalt kan 50–70 °C worden (handtest 5 seconden!).', 'r']
];

export function reizenPage() {
  return pageShell({
    title: 'Vliegen & reizen met je hond: regels, kosten en hitte op bestemming | TrimGids',
    description: 'Mag een hond mee in het vliegtuig? Cabine of ruim, documenten (chip, rabiës, EU-paspoort), kosten per maatschappij, wat vliegen met een hond doet en of een hond tegen de temperatuur op bestemming kan.',
    canonical: '/reizen',
    active: 'reizen',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Vliegen &amp; reizen met je hond</p>
<div class="hero">
  <span class="eyebrow">Reizen met je beste vriend</span>
  <h1>Vliegen met een hond: mag het, hoe lang en hoe warm mag het worden?</h1>
  <p class="intro">Ja — de meeste luchtvaartmaatschappijen nemen kleine honden mee in de cabine en grotere in het (verwarmde, drukgecontroleerde) ruim. Maar er zijn strikte regels over gewicht, kennel, documenten en temperatuur. Deze gids vertelt wat vliegen met je hond doet, waarheen je kunt en wanneer het níet verantwoord is.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">8 kg</strong><p>incl. reistas = cabine (meestal)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">15 weken</strong><p>minimale leeftijd binnen de EU</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">21 dagen</strong><p>wachttijd na rabiësvaccinatie</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">29 °C</strong><p>grens: geen wandelactiviteit meer</p></div>
  </div>
</div>

<section class="sec">
  <h2>✈️ Mag een hond mee in het vliegtuig? (en hoe?</h2>
  <p class="sub">Kort antwoord: bij de meeste maatschappijen wel — in de cabine tot ongeveer 8 kg inclusief reistas, anders in het ruim. Ryanair en easyJet vervoeren alleen erkende assistentiehonden.</p>
  <div class="airline">
    <table class="table">
      <tr><th>Maatschappij</th><th>Cabine</th><th>Ruim</th><th>Belangrijkste regels</th><th>Kosten (indicatie)</th></tr>
      ${AIRLINES.map(a => `<tr><td><strong>${a[0]}</strong></td><td>${a[1]}</td><td>${a[2]}</td><td>${a[3]}</td><td>${a[4]}</td></tr>`).join('')}
    </table>
  </div>
  <div class="quote" style="margin-top:14px"><p>Belangrijk: het aantal "huisdierplaatsen" per vlucht is beperkt en kortsnuitige rassen (Franse Bulldog, Mopshond, Boxer, Boston Terriër e.d.) worden bij veel maatschappijen <strong>geweigerd in het ruim</strong> vanwege ademhalingsrisico's. Vraag het altijd na vóór je boekt.</p></div>
</section>

<section class="sec">
  <h2>🧳 Vlieg-check: kan jouw hond mee in de cabine?</h2>
  <p class="sub">Sleep, vink aan en kies je bestemming — zie direct wat in de praktijk bij de meeste maatschappijen geldt. De check is een indicatie; de definitieve regels staan bij de maatschappij en het bestemmingsland.</p>
  <div class="vlg">
    <div class="box">
      <label style="font-weight:800;font-size:14px">Gewicht hond: <strong id="w-out">6 kg</strong></label>
      <input id="w" type="range" min="1" max="60" step="0.5" value="6" aria-label="Gewicht hond">
      <label class="opt"><input id="snuit" type="checkbox"> Kortsnuitige hond (brachycefaal: mopshond, bulldog, boxer, boston, pekingees…)</label>
      <label class="opt"><input id="junior" type="checkbox"> Pup jonger dan 15–16 weken</label>
      <select id="land" aria-label="Bestemming">
        <option value="eu">Bestemming: binnen de EU</option>
        <option value="uk">Bestemming: Verenigd Koninkrijk</option>
        <option value="us">Bestemming: Verenigde Staten</option>
        <option value="ver">Bestemming: ver buitenland (Azië/Australië/Zuid-Amerika…)</option>
      </select>
      <div class="verdict ok" id="verdict"><b>—</b><p>Stel de gegevens in om je advies te zien.</p></div>
    </div>
    <div>
      <h3 style="font-size:17px">📄 Documenten die je (bijna) altijd nodig hebt</h3>
      <ul style="list-style:none;display:grid;gap:9px;margin-top:10px;font-size:14.5px">
        <li>✅ <strong>Microchip (ISO 11784/11785)</strong> — verplicht in de EU, ook voor reizen.</li>
        <li>✅ <strong>Rabiësvaccinatie</strong> — geldig, en <strong>21 dagen wachttijd</strong> na de eerste vaccinatie.</li>
        <li>✅ <strong>EU-dierenpaspoort</strong> — ingevuld door een dierenarts (verplicht binnen de EU).</li>
        <li>📗 <strong>Verenigd Koninkrijk:</strong> extra verplichte lintwormbehandeling (Echinococcus) tussen 24 en 120 uur vóór aankomst.</li>
        <li>🇺🇸 <strong>Verenigde Staten:</strong> sinds 2024 verscherpte regels: min. 6 maanden oud, CDC Dog Import Form, chip en gezondheidsverklaring.</li>
        <li>🌏 <strong>Overige landen:</strong> sommige landen eisen quarantaine of vooraf een importvergunning (bijv. Australië, Nieuw-Zeeland, meerdere Aziatische landen). Check altijd de ambassade of de officiële dierregels-site.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec">
  <h2>🧠 Wat doet vliegen met een hond?</h2>
  <p class="sub">Vliegen is voor een hond geen "vakantie", maar een verstoring: vreemde geluiden, drukverschillen, een afgesloten tas of bench en urenlang niet kunnen wandelen. Dat kan stress geven, maar is meestal goed te managen — behalve wanneer er gezondheidsrisico's zijn.</p>
  <div class="grid g3">
    <div class="card"><h3>🔊 Geluid & druk</h3><p>In het ruim en op de luchthaven is het luid (85–95 dB tijdens start en landing) en verandert de luchtdruk. De bench dempt geluid; de cabine ervaart dezelfde druk als jij.</p></div>
    <div class="card"><h3>🌡️ Temperatuur</h3><p>Het ruim is bij goede maatschappijen verwarmd en gecontroleerd, maar bij <strong>extreme hitte of kou op vertrek- of aankomstluchthaven</strong> weigeren maatschappijen dieren vaak te vervoeren. Dat is bescherming, geen bureaucratie.</p></div>
    <div class="card"><h3>😰 Stress & beweging</h3><p>Een hond kan 4–12 uur in de box zitten zonder pauze. Train de bench vóór de reis (dagenlang wennen), geef geen zware maaltijd 3 uur voor vertrek en laat op de bestemming rustig uit.</p></div>
    <div class="card"><h3>🫁 Kortsnuitige honden</h3><p>Brachycefale rassen hebben nauwere luchtwegen; combinatie van stress, warmte en gesloten bench kan levensgevaarlijk zijn. Veel maatschappijen weigeren ze daarom in het ruim. Voor deze honden: auto of geen vliegreis.</p></div>
    <div class="card"><h3>🦴 Hoe lang mag dat?</h3><p>Er is geen EU-norm voor maximale reisduur; richtlijn van maatschappijen is meestal ≤8–12 uur in de bench. Kortere vluchten, overstap vermijden en een directe verbinding kiezen is het meest diervriendelijk.</p></div>
    <div class="card"><h3>🚗 Alternatieven</h3><p>Auto (met airco, hond in harnas of box), Eurotunnel (hond blijft in de auto), veerboot (DFDS, Stena, P&O — hond in de auto of aan boord) of een opvang bij een gedegen pension/hondenhotel thuis.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🌡️ Temperatuur op bestemming: kan een hond daar tegen?</h2>
  <p class="sub">Honden zijn geen "mini-mensen": ze zweten nauwelijks en koelen vooral door te hijgen. Daarom kan 28 °C op een vakantiebestemming gevaarlijk zijn voor een hond, terwijl het voor jou heerlijk is. Ze <strong>kunnen</strong> wennen (acclimatiseren in ±1–2 weken), maar kortsnuitige, dikbehaarde, oude honden en pups niet zonder hulp.</p>
  <div class="heat">
    ${HEAT.map(h => `<div class="h ${h[3]}"><b>${h[0]}</b><strong>${h[1]}</strong><p>${h[2]}</p></div>`).join('')}
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>💧 Acclimatiseren</h3><p>Kom je aan in een warm land? Geef de eerste week rustige wandelingen (ochtend/avond), veel water, en laat de hond wennen aan airconditioning. Bouw inspanning langzaam op.</p></div>
    <div class="card"><h3>🏖️ Praktisch op vakantie</h3><p>Koelmat, opvouwbare drinkbak, schaduw en nooit (!!) in de auto laten — bij 25 °C buiten kan het binnen 20 minuten 45 °C worden. Asfalt kan 60 °C halen: handtest 5 seconden.</p></div>
    <div class="card"><h3>⚠️ Waarheen niet (of heel voorzichtig)</h3><p>Hoe dichter bij de evenaar en hoe vochtiger, hoe risicovoller voor brachycefale en dikbehaarde rassen. Check vooraf de temperaturen in het seizoen van je reis en kies klimaatbewust.</p></div>
  </div>
</section>

<section class="sec">
  <h2>✅ Reis-checklist (vink af vóór de reis)</h2>
  <div class="grid g3">
    <div class="card"><h3>Maanden vóór de vlucht</h3><ul>
      <li>Chip + registratie op jouw naam gecontroleerd</li>
      <li>Rabiësvaccinatie bijgewerkt (21 dagen wachttijd)</li>
      <li>EU-dierenpaspoort aangevraagd</li>
      <li>Kennel/bench aangeschaft en getraind</li></ul></div>
    <div class="card"><h3>Weken vóór de vlucht</h3><ul>
      <li>Vlucht + huisdierenplaats geboekt (beperkt aantal!)</li>
      <li>Maatschappij gebeld: gewicht, kortsnuitig, temperatuurregels</li>
      <li>Bestemmingsland gecheckt (quarantaine? importeisen?)</li>
      <li>UK: datum lintwormbehandeling ingepland</li></ul></div>
    <div class="card"><h3>Dag van vertrek</h3><ul>
      <li>Geen zware maaltijd 3 uur van tevoren</li>
      <li>Waterfles + opvouwbare bak in de tas</li>
      <li>Vertrouwd kleedje en favoriete kluif in de bench</li>
      <li>Rustig, zonder drama afscheid — kalme energie werkt</li></ul></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/chippen-ontwormen">💉 Chip, vaccinaties & ontwormen: alles op een rij →</a>
    <a class="btn ghost" href="/hulphonden">🐕‍🦺 Werkhonden op reis: zo werkt dat →</a>
  </div>
</section>

<script>
(function () {
  var w = document.getElementById('w'), wOut = document.getElementById('w-out');
  var snuit = document.getElementById('snuit'), junior = document.getElementById('junior');
  var land = document.getElementById('land'), verdict = document.getElementById('verdict');
  function calc() {
    wOut.textContent = Number(w.value) % 1 === 0 ? w.value + ' kg' : w.value + ' kg';
    var kg = +w.value, sn = snuit.checked, j = junior.checked, l = land.value;
    var el = document.getElementById('verdict');
    var html = '', cls = 'ok';
    if (sn) {
      html = '<b>⚠️ Kortsnuitig: let op!</b><p>De meeste maatschappijen weigeren brachycefale rassen in het ruim (ademhalingsrisico). In de cabine kan het soms, mits gewicht ≤8 kg en de maatschappij het toestaat — vraag altijd eerst telefonisch na. Voor vakantie naar warme landen: overweeg een andere reisvorm.</p>';
      cls = 'no';
    } else if (j) {
      html = '<b>🐶 Jonge pup</b><p>Binnen de EU minimaal 15 weken (12 weken rabiës + 21 dagen wachttijd); Transavia vraagt 3 maanden; de VS minimaal 6 maanden. Plan je reis dus ná die leeftijd.</p>';
      cls = 'no';
    } else if (kg <= 8) {
      html = '<b>🛫 In de cabine (indicatie)</b><p>Tot ±8 kg inclusief zachte reistas is de kans groot dat je hond bij jou naast de stoel mee mag. Reserveer direct een huisdierenplaats; het aantal is beperkt.</p>';
    } else if (kg <= 75) {
      html = '<b>📦 In het ruim (indicatie)</b><p>Grotere honden reizen in een IATA-goedgekeurde harde bench in het verwarmde, drukgecontroleerde ruim. Check de weerslimieten (extreme hitte/kou = weigering) en boek via de maatschappij of een gespecialiseerde agent.</p>';
    } else {
      html = '<b>🛑 Boven de praktische limiet</b><p>Meestal is ±75 kg inclusief bench de maximale combinatie voor het ruim. Dan is reizen per auto/veerboot de veiligste keuze.</p>';
      cls = 'no';
    }
    if (l !== 'eu') {
      html += (l === 'uk' ? '<p><strong>UK:</strong> vergeet de lintwormbehandeling (24–120 uur vóór aankomst) — anders wordt je hond geweigerd.</p>'
        : l === 'us' ? '<p><strong>VS:</strong> minimumleeftijd 6 maanden, CDC-importformulier en gezondheidsverklaring.</p>'
        : '<p><strong>Ver buitenland:</strong> check importregels en mogelijke quarantaine bij de ambassade; boek een specialisten-agent.</p>');
    }
    el.className = 'verdict ' + cls;
    el.innerHTML = html;
  }
  [w, snuit, junior, land].forEach(function (x) { x.addEventListener('input', calc); x.addEventListener('change', calc); });
  calc();
})();
</script>`
  });
}
