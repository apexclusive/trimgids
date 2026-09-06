/* Pagina: Verboden & omstreden hondenrassen in Nederland en de wereld.
   Interactief: land-kiezer met de regels per land. */
import { pageShell } from './base.mjs';

const CSS = `
.landrow{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px}
.landrow button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.landrow button.on{background:var(--g);border-color:var(--g);color:#fff}
.rules{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.rules h3{font-size:18px;margin-bottom:8px}
.rules ul{list-style:none;display:grid;gap:9px;font-size:14.5px;margin-top:10px}
.rules li{display:flex;gap:9px;align-items:flex-start}
.rules li::before{content:"→";color:var(--em);font-weight:800}
.rules .law{background:rgba(220,38,38,.05);border:1px solid #fca5a5;border-radius:12px;padding:12px 14px;margin-top:12px;font-size:13.5px;font-weight:700}
.rules .ok{background:rgba(16,185,129,.06);border:1px solid var(--em);border-radius:12px;padding:12px 14px;margin-top:12px;font-size:13.5px;font-weight:700}
`;

const LANDS = {
  nl: {
    t: '🇳🇱 Nederland',
    d: 'Geen landelijke lijst van verboden rassen. In plaats daarvan: verantwoordelijk baasje-zijn, een landelijk meldpunt voor hondenbeten (sinds 13 januari 2026) en fokregels.',
    list: [
      'Tot 2008 golden er regels voor "pit bull-achtige" honden (Regeling Agressieve Dieren); die is per 1 januari 2009 ingetrokken — een rassenverbod bleek niet effectief.',
      'De RDA-hoogrisicolijst (2017) kreeg nooit wettelijke status en wordt door het ministerie sinds 2019 niet meer als geldend beschouwd.',
      'Na het dodelijke bijtincident van 2025 besloot het kabinet géén verbod op de American Bully XL in te voeren; wél kwamen er plannen voor een meldpunt, verplichte muilkorf en een afstammingsbewijs (versneld naar 2026).',
      'Fokken met extreem kortsnuitige honden is sinds 2019 beperkt: de snuitlengte mag niet onder ±⅓ van de schedellengte liggen.',
      'Wolfhybriden (F1–F3) mag je niet zonder meer houden; erkende wolfhonden (F5+, Tsjechoslowaakse en Saarlooswolfhond met stamboom) wél.'
    ],
    extra: { type: 'ok', text: 'Kortom: in Nederland wordt niemand gestraft voor het ras van zijn hond — wél voor gedrag, mishandeling of fokken dat welzijn schaadt.' }
  },
  uk: {
    t: '🇬🇧 Verenigd Koninkrijk',
    d: 'De strengste wet van Europa: een verbod op specifieke hondentypes, aangevuld met de XL Bully-regels.',
    list: [
      'Dangerous Dogs Act 1991 verbiedt: Pit Bull Terriër, Japanse Tosa, Dogo Argentino en Fila Brasileiro — ook als kruising die erop lijkt.',
      'Sinds 31 december 2023 is de American Bully XL ook verboden (fokken, verkopen, verwaarlozen; aanlijnen + muilkorf verplicht tot de registratie).',
      'Honden van verboden types worden in beslag genomen en geëvalueerd; zonder registratie/diploma volgt vaak euthanasie.',
      'Dit geldt ook voor het meenemen naar het VK: je kunt de grens niet over met een verboden type.'
    ],
    extra: { type: 'law', text: 'Let op: ook honden die er "op lijken" vallen onder de wet — niet alleen erkende rashonden.' }
  },
  de: {
    t: '🇩🇪 Duitsland',
    d: 'Per deelstaat verschillend. Grote verschillen tussen bijvoorbeeld Beieren, Berlijn en NRW.',
    list: [
      'De nationale Hundeverordnung (2001) noemt vier "vechthonden": Pit Bull Terriër, American Staffordshire Terriër, Staffordshire Bull Terriër, Tosa Inu.',
      'Verschillende deelstaten breiden dit uit (o.a. Dobermann, Rottweiler, Dogo Argentino) of hanteren een negatieve lijst.',
      'In veel deelstaten: muilkorfplicht, aanlijnplicht, gedragstest (Wesenstest) en een "Hundeführerschein" (vaardigheidsbewijs).',
      'Sommige deelstaten verbieden het houden volledig; andere eisen alleen een vergunning.'
    ],
    extra: { type: 'law', text: 'Check altijd de Landeshundeverordnung van de deelstaat waarheen je reist.' }
  },
  den: {
    t: '🇩🇰 Denemarken',
    d: 'Een van de oudste en strengste landen: een verbods- en een restlijst.',
    list: [
      'Verboden: Pit Bull Terriër, American Staffordshire Terriër, Staffordshire Bull Terriër, Tosa Inu, Dogo Argentino, Fila Brasileiro, Boerboel, Kangal, Centraal-Aziatische en Kaukasische Herder, Amerikaanse Bulldog en enkele andere types.',
      'Op de restlijst staan rassen met extra eisen (o.a. Dobermann, Rottweiler, Boxer in sommige gemeenten).',
      'Verboden rassen mogen niet worden gehouden, gefokt, verkocht of geïmporteerd — ook niet op doorreis.'
    ],
    extra: { type: 'law', text: 'Denemarken controleert strikt bij de grens; een "look-alike" kan al problemen geven.' }
  },
  fr: {
    t: '🇫🇷 Frankrijk',
    d: 'Twee categorieën: categorie 1 (verboden, zonder stamboom) en categorie 2 (vergunning + muilkorf).',
    list: [
      'Categorie 1: pitbulltypes zonder stamboom (American Pit Bull Terriër, Staffordshire Bull Terriër, Tosa Inu) — fokken, houden en verhandelen verboden.',
      'Categorie 2: American Staffordshire Terriër, Rottweiler, Tosa Inu mét stamboom — verplichte sterilisatie, muilkorf, aanlijnplicht en certificaat.',
      'Een buitenlandse hond die op een categorie-1-type lijkt, kan aan de grens worden geweigerd.'
    ],
    extra: { type: 'law', text: 'De "look-alike"-eis geldt ook hier: het uiterlijk is bepalend, niet alleen de stamboom.' }
  },
  andere: {
    t: '🌍 Rest van de wereld',
    d: 'Wisselend: van harde verboden tot alleen registratie en muilkorfplicht.',
    list: [
      'België: geen nationale rassenlijst; de drie gewesten kennen regels voor "gevaarlijke honden" (o.a. registratie, muilkorf in het openbaar voor enkele types bij overlast).',
      'Spanje: de "Potentially Dangerous Dogs"-wet geldt voor 8 types (o.a. Pit Bull, Rottweiler, Dobermann, Akita, Tosa); vergunning + muilkorf verplicht.',
      'Zwitserland: per kanton; sommige kantons verbieden of reguleren pitbulltypes.',
      'Oostenrijk: centrale lijst + Muulkorbpflicht voor o.a. Pit Bull, Staffordshire Bull Terriër, Tosa en kruisingen.',
      'Denemarken, Noorwegen, IJsland en Italië: wisselende lijsten of gemeentelijke regels.'
    ],
    extra: { type: 'ok', text: 'Tip: zoek "hondenreisregels + landnaam" of raadpleeg de ambassade vóór je boekt. Regelmatig verandert er iets.' }
  }
};

export function verbodenRassenPage() {
  return pageShell({
    title: 'Verboden hondenrassen: Nederland, EU en de rest van de wereld | TrimGids',
    description: 'Welke hondenrassen zijn verboden in Nederland en in het buitenland? De waarheid: NL heeft geen rassenverbod — wél regels en meldpunten. Per land de actuele lijst en toekomstige plannen.',
    canonical: '/verboden-rassen',
    active: 'verboden-rassen',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Verboden &amp; omstreden rassen</p>
<div class="hero">
  <span class="eyebrow">Feiten boven bangmakerij</span>
  <h1>Welke hondenrassen zijn verboden — en welke worden het straks?</h1>
  <p class="intro">Korte antwoorden: in <strong>Nederland bestaat géén rassenverbod</strong> (de oude "vechthondenregeling" is in 2009 afgeschaft). In het buitenland ligt dat anders: het Verenigd Koninkrijk, Denemarken, Duitsland en Frankrijk kennen wél lijsten. Wat er wél verandert in Nederland zijn meldpunten, muilkorfplanning en fokregels. Klik per land en zie de actuele regels.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0</strong><p>rassen wettelijk verboden in Nederland</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">5</strong><p>hondentypes verboden in het VK (incl. XL Bully)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2009</strong><p>afschaffing RAD: rassenverbod bleek niet effectief</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2026</strong><p>landelijk meldpunt hondenbeten + muilkorf-plannen</p></div>
  </div>
</div>

<section class="sec">
  <h2>🗺️ Kies een land: wat geldt daar?</h2>
  <p class="sub">Klik op een land voor de actuele regels. Deze pagina is een samenvatting — voor reizen geldt altijd: controleer de officiële bron van het bestemmingsland.</p>
  <div class="landrow" id="landrow">
    ${Object.entries(LANDS).map(([k, v], i) => `<button data-l="${k}" class="${i === 0 ? 'on' : ''}">${v.t}</button>`).join('')}
  </div>
  <div class="rules" id="rules"></div>
</section>

<section class="sec">
  <h2>🔮 Wat komt er in Nederland in de toekomst aan?</h2>
  <p class="sub">Geen rassenverbod — wél een duidelijke verschuiving naar "eigenaar & hond" in plaats van "ras".</p>
  <div class="timeline">
    <div class="tl"><div class="dot">1</div><div><h3>Meldpunt hondenbeten (sinds 13 jan 2026)</h3><p>Een landelijk meldpunt om bijtincidenten beter in kaart te brengen — met als doel: gericht beleid in plaats van paniekreacties.</p></div></div>
    <div class="tl"><div class="dot">2</div><div><h3>Muilkorven & afstammingsbewijs (voorgesteld 2026)</h3><p>Het kabinet versnelt plannen voor verplichte muilkorf en bewijs van afstamming voor "hoogrisicohonden" — als alternatief voor een rasverbod. Let op: dit is een voornemen; de exacte uitwerking volgt.</p></div></div>
    <div class="tl"><div class="dot">3</div><div><h3>Fokregels kortsnuitigheid (sinds 2019)</h3><p>Niet het ras, maar de bouw is beperkt: fokken met honden met een te korte snuit (minder dan ±⅓ van de schedellengte) is niet toegestaan, vanwege ademhalings- en welzijnsproblemen.</p></div></div>
    <div class="tl"><div class="dot">4</div><div><h3>Wolfhybriden</h3><p>Hybriden van de eerste generaties (F1–F3) zijn aan strenge eisen gebonden; erkende wolfhonden (F5+) met een officiële stamboom zijn toegestaan.</p></div></div>
    <div class="tl"><div class="dot">5</div><div><h3>De Europese blik</h3><p>De EU heeft geen gezamenlijke rassenlijst. De discussie op Europees niveau gaat vooral over fokverboden bij erfelijke welzijnsproblemen (zoals extreme kortsnuitigheid) en een verplichte identificatie/registratie — niet over het verbieden van rassen.</p></div></div>
  </div>
</section>

<section class="sec">
  <h2>💬 En nu het eerlijke verhaal</h2>
  <div class="grid g3">
    <div class="card"><h3>Een verbod werkt niet</h3><p>Nederlandse onderzoekscommissies concludeerden dat rassenverboden bijtincidenten niet verminderen; het gedrag van hond én baasje, socialisatie, training en opvoeding spelen de hoofdrol.</p></div>
    <div class="card"><h3>Het werkelijk risico</h3><p>Van alle honden beten komt het grootste deel van niet-verboden rassen. Toch zijn er (grote) krachtige honden die niet door iedereen verantwoord gehouden kunnen worden — daar komen de muilkorf-plannen vandaan.</p></div>
    <div class="card"><h3>Wat jij kunt doen</h3><p>Kies een hond die bij jouw ervaring en leefsituatie past, train positief, socialiseer vroeg en raadpleeg een gedragstherapeut bij waarschuwingssignalen. Schaam je nooit voor vragen — het gaat om veiligheid én welzijn.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/rassen">🐾 Rassen & variëteiten: wat betekent een "kleine neus"? →</a>
    <a class="btn ghost" href="/fokkers">🏅 Erkende fokkers & rasverenigingen →</a>
  </div>
</section>

<script>
(function () {
  var R = ${JSON.stringify(LANDS)};
  var row = document.getElementById('landrow');
  var out = document.getElementById('rules');
  function show(k) {
    var r = R[k];
    out.innerHTML = '<h3>' + r.t + '</h3><p style="color:var(--muted);font-size:14.5px">' + r.d + '</p><ul>' + r.list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><div class="' + r.extra.type + '">' + r.extra.text + '</div>';
  }
  row.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    row.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    show(b.getAttribute('data-l'));
  });
  show('nl');
})();
</script>`
  });
}
