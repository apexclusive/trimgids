/* Pagina: Hond gevonden? Wat te doen, wie bellen, wettelijke regels & vervolg.
   Interactief: scenario-kiezer "wie moet je bellen?" met directe tel-links. */
import { pageShell } from './base.mjs';

const CSS = `
.sos{display:grid;gap:16px;margin-top:14px}
.scen{display:grid;grid-template-columns:230px 1fr;gap:18px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:18px 20px;box-shadow:var(--shadow)}
.scen .ic{background:var(--bg);border:1px solid var(--line);border-radius:var(--r);display:grid;place-items:center;font-size:38px;min-height:110px}
.scen h3{font-size:16.5px;margin-bottom:4px}
.scen p{color:var(--muted);font-size:14px}
.scen .call{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.scen .call a{background:var(--g);color:#fff;font-weight:800;font-size:13.5px;padding:9px 15px;border-radius:999px}
.scen .call .alt{background:transparent;color:var(--g);border:1.6px solid var(--line)}
.scen.warn{border-color:#fca5a5}
.scen.warn .ic{background:rgba(220,38,38,.06);border-color:#fca5a5}
.scen.ok{border-color:var(--em)}
.scen.ok .ic{background:rgba(16,185,129,.06);border-color:var(--em)}
.pick{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px}
.pick button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:10px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.pick button.on{background:var(--g);border-color:var(--g);color:#fff}
.result{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--em);border-radius:var(--r-lg);padding:22px 24px;box-shadow:var(--shadow)}
.result h3{font-size:18px;margin-bottom:6px}
.result ul{list-style:none;display:grid;gap:8px;font-size:14.5px}
.result li{display:flex;gap:9px;align-items:flex-start}
.result li::before{content:"→";color:var(--em);font-weight:800}
.result .big{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.result .big a{background:var(--g);color:#fff;font-weight:800;padding:12px 18px;border-radius:999px;font-size:15px}
.result .big a.ghost{background:transparent;color:var(--g);border:1.6px solid var(--line)}
.numbers{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px}
.num{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:18px;box-shadow:var(--shadow);text-align:center}
.num .n{font-size:22px;font-weight:800;color:var(--g)}
.num .w{font-size:12.5px;color:var(--muted);font-weight:700;margin-top:4px}
@media(max-width:760px){.scen{grid-template-columns:1fr}.scen .ic{min-height:80px}}
`;

const SCEN = [
  { id: 'nood', short: '🚑 Gewond / acute nood', ic: '🚑', cls: 'warn', t: 'De hond is gewond, aangereden of in acute nood', d: 'Bel direct de plaatselijke dierenambulance — die kent het vangnet in jouw regio. Kun je hem veilig vervoeren en weet je een open dierenarts? Rijd dan daarheen als dat sneller is. Landelijk kun je 144 bellen voor overleg en hulp.', calls: [[ '📞 Plaatselijke dierenambulance', null ], [ '🐕 Alternatief: dichtstbijzijnde dierenarts', null ]] },
  { id: 'rustig', short: '🐕‍🦺 Rustig & gezond', ic: '🐕‍🦺', cls: 'ok', t: 'De hond is rustig, lijkt gezond en heeft geen baasje bij zich', d: 'Geen spoed nodig. Check eventuele halsband/penning, laat de chip lezen (dierenarts, ambulance of asiel — gratis), meld hem op Amivedi en doe aangifte bij de dierenopvang van je gemeente. Deel vervolgens lokaal (buurtapp, Facebook).', calls: [[ '☎️ Amivedi-meldpunt', '0900-2648334' ], [ '🏠 Dierenopvang van je gemeente', null ]] },
  { id: 'bijna', short: '🏠 Even opvangen', ic: '🏠', cls: 'ok', t: 'Je kunt hem veilig een nacht opvangen en morgen verder zoeken', d: 'Dat kan. Houd hem apart van andere dieren, geef water, geen eten zonder overleg (allergieën!), en meld hem meteen als gevonden. De wettelijke regels over gevonden huisdieren verplichten je de vondst te melden — dat bepaalt ook hoe lang de eigenaar de hond kan ophalen.', calls: [[ '☎️ Melding plaatsen op Amivedi', '0900-2648334' ], [ '🏠 Aangifte bij asiel/gemeente', null ]] },
  { id: 'dood', short: '🪦 Overleden hond', ic: '🪦', t: 'Ik heb een overleden hond gevonden', d: 'Bel op werkdagen je gemeente; buiten werktijd of in het weekend de politie (0900-8844) — die stelt het dier veilig en regelt de chipcontrole. Voor een dood wild dier na een aanrijding geldt hetzelfde nummer; ophalen gebeurt via fauna-aanrijding.nl.', calls: [[ '📞 Gemeente (werkdagen)', null ], [ '👮 Politie buiten werktijd', '0900-8844' ]] },
  { id: 'mishandeling', short: '🚨 Mishandeling vermoeden', ic: '🚨', cls: 'warn', t: 'Ik vermoed mishandeling of verwaarlozing', d: 'Bel het landelijke meldpunt 144. Het is niet alleen voor noodgevallen: je kunt ook overleggen. Buiten openingstijden: 0900-8844. Anoniem melden kan via Meld Misdaad Anoniem (0800-7000).', calls: [[ '📞 Landelijk meldpunt 144', '144' ], [ '👮 Politie buiten tijden', '0900-8844' ], [ '🕵️ Anoniem melden', '0800-7000' ]] },
  { id: 'vermist', short: '🔎 Eigen hond vermist', ic: '🔎', cls: 'ok', t: 'Mijn eigen hond is vermist (of ik zoek de eigenaar)', d: 'Meld de vermissing direct op Amivedi, check of de chipregistratie nog klopt en verspreid posters en buurtapps. Politie bel je alleen bij een vermoeden van diefstal. Gevonden? Laat dan altijd eerst de chip checken en vraag om unieke kenmerken.', calls: [[ '☎️ Amivedi (vermist/gevonden)', '0900-2648334' ]] }
];

export function hondGevondenPage() {
  return pageShell({
    title: 'Hond gevonden? Wat moet ik doen en wie moet ik bellen? | TrimGids',
    description: 'Hond gevonden: stappenplan, chipcontrole, Amivedi, aangifte bij de gemeente, de plaatselijke dierenambulance of 144? Wie bel je in welke situatie — inclusief telefoonnummers.',
    canonical: '/hond-gevonden',
    active: 'hond-gevonden',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Hond gevonden?</p>
<div class="hero">
  <span class="eyebrow">Noodhulp · Melden · Herenigen</span>
  <h1>Hond gevonden? Doe dit — en bel wie je móet bellen</h1>
  <p class="intro">Rustig blijven helpt de hond, en de juiste volgorde helpt de eigenaar. Hieronder: een kort stappenplan, een scenario-kiezer met de juiste telefoonnummers en de wetenswaardigheden die 99% van de mensen niet kent.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">144</strong><p>landelijk meldpunt dier in nood / dierenleed</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0900-8844</strong><p>politie: buiten werktijd & dode dieren</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0900-2648334</strong><p>Amivedi: vermist- & gevondenregister</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Chip</strong><p>lezen = snelste route naar de eigenaar</p></div>
  </div>
</div>

<section class="sec">
  <h2>🪜 In 6 stappen: van vondst tot eigenaar</h2>
  <div class="timeline">
    <div class="tl"><div class="dot">1</div><div><h3>Veiligheid eerst — en noteer alles</h3><p>Zorg dat hond én jij niet in gevaar komen (niet op de rijbaan blijven staan). Noteer de exacte locatie, datum en tijd en maak een duidelijke foto.</p></div></div>
    <div class="tl"><div class="dot">2</div><div><h3>Check halsband en penning</h3><p>Staat er een telefoonnummer op, of in een adreskoker? Bel dat nummer dan rustig op — en vraag om een bewijs (naam eigenaar, chipnummer).</p></div></div>
    <div class="tl"><div class="dot">3</div><div><h3>Is het dier gewond of in nood? Bel de ambulance</h3><p>Plaatselijke dierenambulance, of 144 voor overleg. Een dierenarts kan de chip ook gratis lezen.</p></div></div>
    <div class="tl"><div class="dot">4</div><div><h3>Laat de chip uitlezen</h3><p>Bij de dierenarts, dierenambulance of het asiel. Chippen is verplicht voor honden geboren na april 2013 — en een correct geregistreerde chip betekent vaak dezelfde dag hereniging.</p></div></div>
    <div class="tl"><div class="dot">5</div><div><h3>Meld de vondst: Amivedi + gemeente/asiel</h3><p>Registreer op Amivedi (landelijk register, gevonden én vermist) en doe aangifte bij de dierenopvang van de gemeente waar je de hond vond. Daar gelden de wettelijke regels voor opvang van een gevonden dier.</p></div></div>
    <div class="tl"><div class="dot">6</div><div><h3>Verspreid lokaal — maar houd details achter</h3><p>Buurtapp en lokale Facebookgroepen. Vraag een "eigenaar" altijd om unieke kenmerken, chipnummer of een foto-cue; zo filter je oplichters. Zie je de eigenaar nog rondlopen op de vindplek? Loop er nog even terug.</p></div></div>
  </div>
</section>

<section class="sec">
  <h2>📞 Wie moet je bellen? Kies jouw situatie</h2>
  <p class="sub">Klik op de situatie die het dichtst bij jouw vondst komt — je krijgt direct het telefoonnummer en de beste volgende stap.</p>
  <div class="pick" id="scen-pick">
    ${SCEN.map(s => `<button data-s="${s.id}" class="${s.id === 'nood' ? 'on' : ''}">${s.short}</button>`).join('')}
  </div>
  <p id="scen-mark" class="sub" style="font-size:13.5px;color:var(--muted)"></p>
  <div class="numbers" id="scen-holder"></div>
</section>

<section class="sec">
  <h2>⚡ Snel overzicht per situatie</h2>
  <div class="sos">
    ${SCEN.map(s => `
    <div class="scen ${s.cls}">
      <div class="ic">${s.ic}</div>
      <div>
        <h3>${s.t}</h3>
        <p>${s.d}</p>
        <div class="call">
          ${s.calls.map(c => c[1] ? `<a href="tel:${c[1]}">${c[0]}</a>` : `<a class="alt" href="#scen-pick">${c[0]}</a>`).join('')}
        </div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="sec">
  <h2>❓ Wat vrijwel niemand weet (maar wél moet)</h2>
  <div class="qas">
    <div class="qa"><b>Mag ik de hond gewoon houden als niemand hem ophaalt?</b><p>Nee, niet zomaar. Een gevonden dier is wettelijk gezien niet "van jou": je bent tijdelijk opvanger. Je moet de vondst melden bij de dierenopvang van de gemeente (aangifte), zodat de eigenaar een eerlijke kans krijgt hem terug te halen. Na een afgesproken periode (per opvang vaak ±2 weken) bepaalt de opvang wat er gebeurt — soms kun je hem dan officieel adopteren. Vraag het na bij de opvang in jouw gemeente.</p><p class="why">Bron: wettelijke regels over opvang van gevonden huisdieren (Amivedi / gemeente-dierenopvang)</p></div>
    <div class="qa"><b>Moet ik betalen voor de dierenambulance?</b><p>Dat kan. Veel ambulances vragen een (vrijwillige) bijdrage of rekenen transport- en nachturen door. Voor de vinder geldt meestal geen kosten voor de chipcontrole; de kosten voor opvang en zorg lopen bij de opvang.</p><p class="why">Bron: Dierenambulance Amsterdam & ROZE FAQ</p></div>
    <div class="qa"><b>De hond heeft geen chip. Wat nu?</b><p>Dat kan: chippen is verplicht voor honden geboren na april 2013, maar niet alle chips zijn correct geregistreerd. Meld de hond dan met hoge prioriteit op Amivedi + lokale kanalen en vraag bij de opvang na hoelang je hem kunt aanhouden terwijl de eigenaar wordt gezocht.</p><p class="why">Bron: Amivedi — tips gevonden dieren</p></div>
    <div class="qa"><b>Welke locaties kan ik zelf checken?</b><p>Amivedi.nl (ook als app/Buurtapp), lokale Facebookgroepen "huisdier vermist/gevonden", dierenartsen in de buurt (vraag of zij de chip willen scannen), en de vindplek zelf — soms loopt de eigenaar er nog te zoeken.</p></div>
    <div class="qa"><b>Gaat het om mijn eigen hond?</b><p>Meld de vermissing direct op Amivedi, controleer je chipregistratie en verspreid foto's in de buurt. Alleen bij een vermoeden van diefstal bel je de politie (0900-8844, geen spoed).</p><p class="why">Bron: Dierenambulance Utrecht — huisdier kwijt of gevonden</p></div>
  </div>
</section>

<section class="sec">
  <h2>🔢 Belangrijke nummers (bewaar deze pagina)</h2>
  <div class="numbers">
    <div class="num"><div class="n">144</div><div class="w">Landelijk meldpunt dier in nood / dierenleed</div><div class="w">Ma–za 8:00–18:30 · zo 9:30–18:30</div></div>
    <div class="num"><div class="n">0900-8844</div><div class="w">Politie: buiten werktijd, dode dieren, diefstal</div></div>
    <div class="num"><div class="n">0900-2648334</div><div class="w">Amivedi: vermist- & gevondenregister (€0,15/min)</div></div>
    <div class="num"><div class="n">0800-7000</div><div class="w">Meld Misdaad Anoniem (dierenleed anoniem)</div></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/vrijwilligers">🚑 Wil je zelf helpen op een ambulance of in het asiel? →</a>
    <a class="btn ghost" href="/adoptie">🏠 Een opvanghond een thuis geven? →</a>
  </div>
</section>

<script>
(function () {
  var pick = document.getElementById('scen-pick');
  var holder = document.getElementById('scen-holder');
  var mark = document.getElementById('scen-mark');
  var S = ${JSON.stringify(SCEN)};
  function render(id) {
    var s = S.find(function (x) { return x.id === id; }) || S[0];
    mark.textContent = 'Jouw situatie: ' + s.t;
    holder.innerHTML = s.calls.map(function (c) {
      var num = c[1];
      return '<div class="num"><div class="n">' + (num || '→ kies een meldpunt') + '</div><div class="w"><a href="' + (num ? 'tel:' + num : '#scen-pick') + '" style="color:var(--g);font-weight:800">' + c[0] + '</a></div></div>';
    }).join('') + '<div class="num" style="grid-column:1/-1;text-align:left"><b style="color:var(--g)">Stappen:</b> ' + s.d + '</div>';
  }
  pick.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    pick.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    render(b.getAttribute('data-s'));
  });
  render('nood');
})();
</script>`
  });
}
