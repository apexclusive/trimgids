/* Pagina: Chippen & ontwormen — verplichtingen, tarieven, waar laten doen en preventie.
   Interactief: chip- en wormcheck met een checklist van alle acties per leeftijd/hond. */
import { pageShell } from './base.mjs';

const CSS = `
.pricetable{overflow-x:auto;margin-top:12px}
.pricetable table{font-size:14px}
.chk{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-top:12px}
.chk label{display:flex;gap:9px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:12px 13px;font-size:13.5px;font-weight:700}
.chk input{margin-top:2px;accent-color:var(--em)}
.chk label b{font-size:13px;display:block;margin-bottom:2px}
.chk label span{font-weight:500;color:var(--muted);font-size:12.5px}
.progress{height:12px;background:var(--bg);border-radius:99px;overflow:hidden;border:1px solid var(--line);margin-top:14px}
.progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--em),#34d399);transition:width .3s}
`;

const DATA = {
  chipKosten: [
    ['Dierenkliniek / dierenarts (chip + registratie)', '±€30–50'], ['Dierenarts tijdens consult/operatie', 'vaak ±€20–30 extra'], ['Gratis chipacties (gemeente of organisaties)', 'soms gratis bij sterilisatie/castratie-acties'], ['Registratie in databank (eenmalig)', '±€10–20, vaak inbegrepen'], ['Adreswijziging doorgeven', 'gratis, online via de databank']
  ],
  worm: [
    ['Ontwormmiddel (dierenarts / dierenspeciaalzaak)', '±€10–20 per kuur'], ['Ontwormen op advies / bij risico', '2–4× per jaar tip; bij pups elke 2 weken tot 12 wk'], ['Duur ontwormen (werking)', 'vaak 24–48 uur, afhankelijk van middel']
  ]
};

export function chippenOntwormenPage() {
  return pageShell({
    title: 'Chippen & ontwormen: verplicht of niet, waar laten doen en wat kost het? | TrimGids',
    description: 'Is een chip verplicht in Nederland? Waar laat je je hond chippen en registreren, wat kost dat, en hoe zit het met ontwormen? Alle regels, doseringen en een gratis checklist.',
    canonical: '/chippen-ontwormen',
    active: 'chippen-ontwormen',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Chip &amp; ontwormen</p>
<div class="hero">
  <span class="eyebrow">Verplicht, veilig en goedkoop</span>
  <h1>Chippen &amp; ontwormen: de echte regels, kosten en waar je moet zijn</h1>
  <p class="intro">Een microchip is in Nederland <strong>verplicht voor alle honden</strong> (sinds 2013); zonder chip en registratie kan een hond bij inspectie in beslag worden genomen. Ontwormen is niet verplicht, maar het is een belangrijk onderdeel van de gezondheid van je hond én van de volksgezondheid (lintworm- en spoelwormeitjes kunnen óók mensen besmetten). Hier alles op een rij: waar, wat kost het en hoe vaak?</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Verplicht</strong><p>chip sinds 1 juli 2013 (alle honden)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±€30–50</strong><p>chip + registratie bij de dierenarts</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2–4×/jr</strong><p>ontwormen bij volwassen honden met risico</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0 dagen</strong><p>mag een hond zónder chip het land uit?</p></div>
  </div>
</div>

<section class="sec">
  <h2>💉 Chippen: wie, wat, waar en wat kost het?</h2>
  <div class="grid g2">
    <div class="card"><h3>📋 Wat is het precies?</h3><p>Een microchip ter grootte van een rijstkorrel wordt onder de huid tussen de schouderbladen geplaatst. De unieke code (15 cijfers) is gekoppeld aan jouw gegevens in een nationale databank. Zo kan een gevonden hond binnen minuten bij de eigenaar terugkomen.</p>
    <h3 style="margin-top:14px">🏥 Waar laat je het doen?</h3><ul style="margin-left:18px;margin-top:6px;display:grid;gap:5px;font-size:14px"><li>Bij de <strong>dierenarts/kliniek</strong> (aanbevolen: controle + juiste plaatsing)</li><li>Bij de <strong>vestigingen van o.a. dierenambulances en asielen</strong> tijdens acties</li><li>Bij sommige <strong>dierenopvangcentra en dierenwinkels</strong> (check of het via een erkend chip-setje gaat en of registratie in de juiste databank plaatsvindt)</li></ul></div>
    <div class="card"><h3>💰 Kosten (indicatie)</h3><div class="pricetable"><table class="table">
      ${DATA.chipKosten.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('')}
    </table></div>
    <p style="font-size:13px;color:var(--muted);margin-top:8px">Sommige gemeenten en asielen organiseren gratis chipacties. Doe het tijdens een vaccinatie- of castratiebezoek om dubbele consultkosten te vermijden.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Belangrijk:</strong> een chip zonder registratie is bijna waardeloos — controleer jaarlijks dat je gegevens (adres, telefoon) kloppen. Gebruik de gratis chipnummer-check van o.a. de databank van de Raad van Beheer of universele zoeksites.</p></div>
</section>

<section class="sec">
  <h2>🌍 Reizen & chip: de EU-regels</h2>
  <div class="grid g3">
    <div class="card"><h3>🔗 EU/EFTA</h3><p>Alleen met <strong>microchip (ISO 11784/11785)</strong> + geldig <strong>EU-dierenpaspoort</strong> + actuele <strong>rabiësvaccinatie</strong>. De chip wordt vóór de rabiësvaccinatie geplaatst, anders is de vaccinatie niet geldig. Geen quarantaine bij een geldig stel.</p></div>
    <div class="card"><h3>🗺️ Niet-EU (bijv. VK, VS, Canada)</h3><p>VK: chip + rabiës + een <strong>wormbehandeling 1–5 dagen voor vertrek</strong> (ook binnen 48 uur na aankomst; specifiek tegen <em>Echinococcus multilocularis</em>). VS/Canada: chip + rabiës, check de inreisregels per staat. Dierenpaspoort helpt, maar niet alle landen erkennen het EU-paspoort.</p></div>
    <div class="card"><h3>⚠️ Zonder chip?</h3><p>Dieren worden geweigerd, in quarantaine geplaatst of in beslag genomen. Reispapieren moet je altijd bij je hebben; aan de grens wordt steekproefsgewijs gecontroleerd.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🐛 Ontwormen: hoe vaak, wat en wanneer?</h2>
  <p class="sub">Ontwormen is <strong>geen verplichting</strong>, maar we adviseren het wél: vooral voor pups, honden die op de grond eten, in de natuur lopen of onbeschermd in contact komen met katten en knaagdieren. Vraag je dierenarts om een wormadvies op maat; vraag nooit "blind" aan een dierenspeciaalzaak zonder gewicht of leeftijd.</p>
  <div class="grid g3">
    <div class="card"><h3>🐶 Pups</h3><ul style="margin-left:18px;margin-top:6px;display:grid;gap:5px;font-size:14px"><li>Vanaf 2 weken, elke <strong>2 weken</strong> tot 12 weken</li><li>Daarna maandelijks tot 6 maanden</li><li>Vanaf 6 maanden: volgens het normale schema</li></ul></div>
    <div class="card"><h3>🐕 Volwassen honden</h3><ul style="margin-left:18px;margin-top:6px;display:grid;gap:5px;font-size:14px"><li>Standaard: <strong>2–4 keer per jaar</strong></li><li>Bij risico (jagen, rauwe voeding, veel natuur): elke <strong>6 weken–3 maanden</strong></li><li>Drachtige teven: volgens schema van de dierenarts</li></ul></div>
    <div class="card"><h3>🧪 Ontlasting check</h3><ul style="margin-left:18px;margin-top:6px;display:grid;gap:5px;font-size:14px"><li>Een <strong>wormeitjes-check</strong> van de ontlasting (feces-onderzoek) kan de frequentie verlagen: alleen ontwormen als er eitjes zijn.</li><li>Spoelwormen (rondwormen) en lintwormen: wisselende middelen; vraag de juiste combinatie.</li></ul></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Kosten en bijwerkingen:</strong> ±€10–20 per kuur; bijwerkingen zijn zeldzaam, maar geef een middel dat op het juiste gewicht is afgestemd (te laag = werkt niet, te hoog = risico). Volg altijd de bijsluiter en laat een overdosis nooit "wel" bij een speciaalzaak.</p></div>
</section>

<section class="sec">
  <h2>✅ Je gratis chip- &amp; worm-checklist</h2>
  <p class="sub">Vink aan wanneer alles in orde is — de meter springt mee:</p>
  <div class="chk" id="chk">
    ${['Chip geplaatst (tussen schouderbladen)', 'Chip geregistreerd op mijn naam + adres', 'Chipnummer bekend & in paspoort', 'EU-dierenpaspoort aanwezig (reizen)', 'Ontworm-schema op maat (leeftijd/risico)', 'Wormmiddel op het juiste gewicht', 'Ontlasting gecheckt bij nieuwe klachten', 'Vlooien-/tekenpreventie buiten het wormmiddel (niet één middel voor alles!)'].map(c => `<label><input type="checkbox" data-x><span><b>${c}</b></span></label>`).join('')}
  </div>
  <div class="progress"><i id="bar"></i></div>
  <div id="chk-out" class="score" style="font-size:19px;font-weight:800;color:var(--g);margin-top:10px">—</div>
</section>

<section class="sec">
  <h2>📅 Jaarplan gezondheidszorg (ook zonder verplichting!)</h2>
  <div class="grid g3">
    <div class="card"><h3>✂️ Castratie/sterilisatie</h3><p>Niet verplicht in Nederland, maar het voorkomt ongewenste nestjes en sommige ziektes. Overleg de timing met je dierenarts (ras-specifiek).</p></div>
    <div class="card"><h3>🏥 Jaarlijkse check</h3><p>Gewicht, gebit, oren, gewrichten en hart; een korte controle vangt veel problemen vroegtijdig op.</p></div>
    <div class="card"><h3>🎫 Bij verhuizing/verlies</h3><p>Adreswijziging doorgeven aan de databank; bij verlies: check gratis chipnummer bij gevonden honden en meld bij Amivedi en het landelijk meldpunt.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/honden-vaccinaties">💉 Vaccinaties: verplichte & aanbevolen entingen →</a>
    <a class="btn ghost" href="/hondenweetjes">🥩 Voeding, leeftijd & slimheid: de rest van de weetjes →</a>
  </div>
</section>

<script>
(function () {
  var boxes = document.querySelectorAll('#chk input');
  var bar = document.getElementById('bar'), out = document.getElementById('chk-out');
  function upd() {
    var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
    var pct = Math.round(n / boxes.length * 100);
    bar.style.width = pct + '%';
    out.textContent = pct === 100 ? '🎉 100% — jullie zijn helemaal klaar voor een gezond & veilig avontuur!' : pct >= 50 ? 'Goed bezig! Nog ' + (boxes.length - n) + ' punt(en) open.' : 'Nog ' + (boxes.length - n) + ' punt(en) open. Chip check je het snelst bij de databank.';
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
})();
</script>`
  });
}
