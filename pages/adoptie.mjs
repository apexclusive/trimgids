/* Pagina: Pup van een goede fokker óf een hond opvangen uit het asiel?
   Informatief over waar asielhonden vandaan komen + interactieve keuzehulp en 30-dagen-checklist. */
import { pageShell } from './base.mjs';

const CSS = `
.lab{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:16px}
.lab>div{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.lab h3{font-size:15.5px;margin:14px 0 4px}
.btnrow{display:flex;gap:9px;flex-wrap:wrap;margin-top:6px}
.btnrow button{border:1.6px solid var(--line);background:var(--bg);border-radius:999px;padding:9px 14px;font-weight:800;font-size:12.5px;color:var(--muted)}
.btnrow button.on{background:var(--g);border-color:var(--g);color:#fff}
@media(max-width:760px){.lab{grid-template-columns:1fr}}
.cmp{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px;margin-top:16px}
.cmp .col{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow)}
.cmp .col h3{font-size:17px;margin-bottom:10px}
.cmp .col ul{list-style:none;display:grid;gap:8px;font-size:13.5px}
.cmp .col li{display:flex;gap:8px;align-items:flex-start;color:var(--muted)}
.cmp .col li::before{content:"✓";color:var(--em);font-weight:800;flex:none}
.cmp .col.alt li::before{content:"•";color:var(--amber)}
.cmp .col.warn{border-color:#fca5a5}
.cmp .col.warn li::before{content:"!";color:#dc2626;font-weight:800}
.origin{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}
.origin .card{border-top:4px solid var(--em)}
.origin .card.amber{border-top-color:var(--amber)}
.origin .card.red{border-top-color:#dc2626}
.origin .big{font-size:26px;font-weight:800;color:var(--g)}
.checkbar{background:var(--card);border:1px solid var(--line);border-radius:999px;height:12px;overflow:hidden;margin:12px 0 16px}
.checkbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--em),#34d399);transition:width .3s ease}
.check{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;cursor:pointer}
.check input{margin-top:4px;accent-color:var(--em);width:17px;height:17px;flex:none}
.check b{font-size:14.5px}
.check small{display:block;color:var(--muted);font-size:13px}
.check.done{border-color:var(--em);background:rgba(16,185,129,.05)}
.check.done span{text-decoration:line-through;color:var(--muted)}
`;

const ORIGINS = [
  {
    cls: '', big: '±70%', title: 'Afstandshonden — de grootste groep',
    text: 'Honden die hun eigenaar kwijtraakten en officieel zijn afgestaan: door gedragsproblemen, verhuizing, tijdgebrek, gezondheidsproblemen of overlijden van het baasje. Veel asielhonden hadden dus gewoon een thuis — het probleem zat bij de omstandigheden.',
    source: 'Nederlandse asielen en de Dierenbescherming'
  },
  {
    cls: 'amber', big: '±20%', title: 'Achtergelaten of weggelopen honden',
    text: 'Honden die ergens los worden aangetroffen, door politie of dierenambulance worden opgevangen en na enige tijd (vaak ±2 weken) niet door hun baasje worden opgehaald. Nederland heeft nauwelijks een zwerfhondenpopulatie — deze honden zijn bijna allemaal van een eigenaar.',
    source: 'Dierenasiel Bommelerwaard, hondenasiel-websites'
  },
  {
    cls: 'amber', big: '±10%', title: 'Honden uit het buitenland',
    text: 'Via stichtingen komen honden uit landen als Spanje, Roemenië of Griekenland naar Nederland. Goede stichtingen begeleiden, trainen en garanderen terugname — maar adoptie op basis van een foto alleen of zomaar een busreis boeken blijft risicovol.',
    source: 'NRC-reconstructie 2017: ±11.310 van ±150.000 nieuwe honden (±7,5%)'
  },
  {
    cls: 'red', big: 'Let op', title: 'Mislukte adopties & teruggekeerde honden',
    text: 'Een deel van de honden komt terug na een mislukte adoptie: ze bleken te moeilijk, het gezin paste niet, of de stichting had verwachtingen gewekt die niet uitkwamen. Daarom: goede thuisvoorbereiding, kennismaken (meerdere keren!) en afspraken over terugkeer.',
    source: 'Stichtingen rapporteren terugkeerpercentages van ±1 op de 10'
  }
];

const CHECKLIST = [
  ['Bench of rustige plek', 'Een eigen, afgesloten plekje in huis; de eerste weken is rust belangrijker dan speelgoed.'],
  ['Lange lijn + goed passend tuigje', 'De hond kent jou nog niet: buiten altijd aan de lijn, ook in de tuin de eerste dagen.'],
  ['Chip registreren op jouw naam', 'Vraag het asiel naar het chipnummer en zorg dat de registratie direct wordt gewijzigd.'],
  ['Eigen voer & bakjes', 'Houd de eerste weken hetzelfde voer aan dat de hond gewend was; verander stap voor stap.'],
  ['Rustige eerste week (max. 1–2 bezoeken)', 'Geen visitepronken, geen hondenpark; de hond moet eerst zijn nieuwe huis leren kennen.'],
  ['Kluifjes en speelgoed gescheiden', 'Bij een bestaande hond: kluifjes op eigen plekken, hekje of ren als management.'],
  ['Kind & huisdier nooit alleen laten', 'Zelfs als het asiel zei dat het "kan met kinderen" — eerst samen wennen en managen.'],
  ['Slaap inhalen toestaan', 'Asielhonden slapen vaak slecht; de eerste dagen veel slapen is normaal en goed.'],
  ['Kort en positief wandelen', 'Dagelijks korte, rustige wandelingen op vaste tijden; dat schept vertrouwen.'],
  ['Voeding uit de hand (bij terughoudendheid)', 'Als de hond niet durft te eten: uit de hand voeren helpt bij het opbouwen van vertrouwen.'],
  ['Vraag het asiel om een hondenschool', 'Veel asielen regelen "tweedehands"-cursussen of een gedragstherapeut als vervolg.'],
  ['Gedrag en "logeergedrag" kennen', 'De eerste 1–2 weken gedraagt een hond zich vaak voorbeeldig — daarna komt zijn echte ik. Wees erop voorbereid.']
];

export function adoptiePage() {
  return pageShell({
    title: 'Pup van de fokker of hond uit het asiel? Alles over asielhonden | TrimGids',
    description: 'Pup kopen bij een goede fokker óf een hond opvangen uit het asiel? Waar komen asielhonden vandaan, hoe werkt adoptie, wat kost het en hoe zien de eerste 30 dagen eruit?',
    canonical: '/adoptie',
    active: 'adoptie',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Pup of asielhond?</p>
<div class="hero">
  <span class="eyebrow">Twee goede routes · één verantwoorde keuze</span>
  <h1>Pup van een goede fokker… of een hond opvangen uit het asiel?</h1>
  <p class="intro">Beide routes kunnen de beste keuze zijn — het hangt af van jouw leven, ervaring en tijd. Deze gids zet ze eerlijk naast elkaar, vertelt waar asielhonden vandaan komen en helpt je met een echte keuze in plaats van een gevoel alleen.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±5.000 honden</strong><p>zitten er tegelijk in Nederlandse asielen*</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±70%</strong><p>van de asielhonden is een afstandshond</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±1 op 10</strong><p>keert terug na een mislukte adoptie</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2 weken</strong><p>gedraagt een asielhond zich vaak "voorbeeldig"</p></div>
  </div>
  <p style="font-size:12px;color:var(--muted)">*schatting op basis van NRC/Stray AFP (2017) en openbare asielcijfers; aantallen fluctueren per jaar en per periode.</p>
</div>

<section class="sec">
  <h2>⚖️ Drie routes, eerlijk vergeleken</h2>
  <p class="sub">Een pup bij een erkende fokker, een volwassen hond uit het Nederlandse asiel of een hond via een buitenlandse stichting: kijk goed wat bij jou past.</p>
  <div class="cmp">
    <div class="col">
      <h3>🐶 Pup van een erkende fokker</h3>
      <ul>
        <li>Je weet (meestal) de ouders, opvoeding en gezondheidsonderzoeken</li>
        <li>Puppyperiode: jij bepaalt de basis van opvoeding en socialisatie</li>
        <li>Kosten: ±€1.250–1.850 aanschaf (S/M/L) + startuitrusting + verzekering + cursus</li>
        <li>Wachttijd: regelmatig maanden bij een goede fokker</li>
        <li>Ras-eigenschappen en vachtverzorging worden voorspelbaarder</li>
        <li>Bekijk ook: <a href="/fokkers" style="color:var(--g);font-weight:800">gids erkende fokkers</a> en <a href="/aankoopgids" style="color:var(--g);font-weight:800">aankoopgids per ras</a></li>
      </ul>
    </div>
    <div class="col alt">
      <h3>🏠 Volwassen hond uit een Nederlands asiel</h3>
      <ul>
        <li>Volwassen karakter is al zichtbaar: grootte, vacht en gedrag bekend</li>
        <li>Vaak al zindelijk, getraind en sociaal met honden</li>
        <li>Kosten: adoptievergoeding ±€150–300 + inentingen/chip vaak al in orde</li>
        <li>Het asiel kent de hond en helpt bij de match (meerdere kennismakingen)</li>
        <li>Eerste weken vragen tijd, rust en geduld; een "rugzakje" is mogelijk</li>
        <li>Je geeft een hond die al een verlies meemaakte een tweede kans</li>
      </ul>
    </div>
    <div class="col warn">
      <h3>✈️ Honden uit het buitenland</h3>
      <ul>
        <li>Kies een transparante stichting die training, quarantaine en teruggarantie regelt</li>
        <li>Adoptie op afstand op basis van een foto is af te raden — karakter lees je niet af aan een screenshot</li>
        <li>Houd rekening met gezondheidsrisico's en onbekende voorgeschiedenis</li>
        <li>Vraag: waar is de hond opgevangen, hoe lang getraind, is er een terugnamegarantie?</li>
        <li>Ongeveer 1 op de 10 adoptie-honden keert terug naar de stichting; meestal door veranderde persoonlijke omstandigheden</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec">
  <h2>📍 Waar komen asielhonden vandaan?</h2>
  <p class="sub">Veel mensen denken dat een asiel vol "probleemhonden" zit. De werkelijkheid is genuanceerder — en daarom kan een asielhond een uitstekende keuze zijn.</p>
  <div class="origin">
    ${ORIGINS.map(o => `
    <div class="card ${o.cls}">
      <div class="big">${o.big}</div>
      <h3>${o.title}</h3>
      <p>${o.text}</p>
      <p style="font-size:12px;color:var(--muted);margin-top:8px">Bron: ${o.source}</p>
    </div>`).join('')}
  </div>
  <div class="quote" style="margin-top:16px">
    <p>Nederland kent geen zwerfhondenpopulatie. Honden die in asielen terechtkomen zijn vrijwel uitsluitend <strong>afstandshonden</strong> (om wat voor reden niet meer bij hun baas kunnen blijven) of <strong>achtergelaten huishonden</strong>. Juist omdat ze vaak een geschiedenis hebben, kennen veel asielen ook meer gezondheids- en gedragsproblemen — en dat betekent: eerlijke voorlichting en een goede match zijn cruciaal.</p>
    <footer>Dierenasiel Bommelerwaard — wat je moet weten over buitenlandse honden</footer>
  </div>
</section>

<section class="sec">
  <h2>🗺️ Hoe werkt een adoptie? In 6 stappen</h2>
  <div class="timeline">
    <div class="tl"><div class="dot">1</div><div><h3>Kies bewust: pup, asiel of buitenland</h3><p>Lees bovenstaande vergelijking én de <a href="/fokkers" style="color:var(--g)">fokkergids</a>. Twijfel je? Doe dan de korte keuzehulp hieronder.</p></div></div>
    <div class="tl"><div class="dot">2</div><div><h3>Bereid je huis voor</h3><p>Bench of rustige plek, voer, lijn, halsband/tuigje, speelgoed — en check of er geen giftige planten of losse kabels staan.</p></div></div>
    <div class="tl"><div class="dot">3</div><div><h3>Meerdere kennismakingen (minimaal 3)</h3><p>Eén wandeling zegt weinig; sommige honden "klikken" pas bij de derde ontmoeting. Neem de tijd en laat de hond naar jou toe komen.</p></div></div>
    <div class="tl"><div class="dot">4</div><div><h3>Intake, thuischeck & adoptiecontract</h3><p>Het asiel wil je situatie leren kennen en checkt soms de thuissituatie. Vraag alles wat je wilt weten: gedrag, gezondheid, wat al wel/niet getraind is.</p></div></div>
    <div class="tl"><div class="dot">5</div><div><h3>Registreer de chip op jouw naam</h3><p>Dit wordt vaak vergeten! Vraag het chipnummer en wijzig de eigenaar-registratie direct — zo vind je elkaar als de hond ooit wegloopt.</p></div></div>
    <div class="tl"><div class="dot">6</div><div><h3>Eerste 30 dagen: rust & routine</h3><p>Vink de checklist hieronder af; de eerste 2 weken vaak "voorbeeldgedrag", daarna het echte gedrag. Dat is normaal — vraag hulp bij het asiel of een hondenschool.</p></div></div>
  </div>
</section>

<section class="sec">
  <h2>📝 Eerste 30 dagen-checklist (wordt bewaard)</h2>
  <p class="sub">Vink af wat je regelt — jouw voortgang wordt lokaal opgeslagen (localStorage).</p>
  <div class="checkbar"><i id="adoptie-progress"></i></div>
  <div class="checklist" id="adoptie-checklist">
    ${CHECKLIST.map(c => `<label class="check"><input type="checkbox"><span><b>${c[0]}</b><small>${c[1]}</small></span></label>`).join('')}
  </div>
</section>

<section class="sec">
  <h2>🧭 Korte keuzehulp: welke route past bij jou?</h2>
  <p class="sub">Vier eerlijke vragen. Geen trucje — alleen een richting die je samen met de informatie hierboven kunt gebruiken.</p>
  <div class="lab">
    <div>
      <h3>1. Hoeveel ervaring heb je met honden?</h3>
      <div class="btnrow"><button class="on" data-v="0">Nog nooit een eigen hond gehad</button><button data-v="1">Ik heb al eens een hond gehad</button><button data-v="2">Ik ben een ervaren baas (meerdere honden)</button></div>
      <h3>2. Hoeveel tijd heb je de komende maanden?</h3>
      <div class="btnrow"><button data-v="0">Veel tijd, ook op doordeweekse dagen</button><button data-v="1">Gemiddeld: werk maar flexibel</button><button data-v="2">Weinig tijd, vooral weekend</button></div>
      <h3>3. Wat past bij jouw leefritme?</h3>
      <div class="btnrow"><button data-v="0">Rustig: ik houd van thuis en korte wandelingen</button><button data-v="1">Actief: elke dag sport en lange buitenmomenten</button></div>
      <h3>4. Een onbekende voorgeschiedenis vind ik…</h3>
      <div class="btnrow"><button data-v="0">Spannend — ik wil alles zeker weten</button><button data-v="1">Prima — met goede begeleiding durf ik dat aan</button></div>
    </div>
    <div>
      <p class="q" id="keuze-out" style="font-size:22px;font-weight:800;color:var(--g)">Beantwoord de vragen →</p>
      <p id="keuze-tip" style="color:var(--muted);font-size:14.5px">Deze tool telt simpelweg op: hoe meer "ik wil zekerheid + weinig tijd", hoe logischer een pup bij een erkende fokker is. Hoe meer "ik heb tijd en durf een verhaal", hoe logischer een asielhond wordt. Daartussen? Beide zijn prima — lees dan de vergelijking nog eens.</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>💬 Eerlijk advies</h2>
  <div class="grid g3">
    <div class="card"><h3>Asielhond = niet per se "moeilijk"</h3><p>Veel asielhonden zijn gewone honden met een gewoon verhaal: te druk gezin, verhuizing, overlijden van het baasje. Het asiel kent ze meestal goed en matcht eerlijk.</p></div>
    <div class="card"><h3>Pup = niet per se "makkelijk"</h3><p>Een pup kost de eerste jaren veel tijd en energie op het vlak van opvoeding, zindelijkheid, socialisatie en gebit — zeker voor wie overdag werkt.</p></div>
    <div class="card"><h3>Beide vragen voorbereiding</h3><p>Zorg voor een vast budget (voer, verzekering, dierenarts), een hondenschool bij jou in de buurt en een plan voor vakanties. Onverwacht gedrag los je op met begeleiding — niet met opgeven.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/fokkers">✅ Pup kiezen: gids erkende fokkers →</a>
    <a class="btn ghost" href="/vrijwilligers">🤝 Wil je eerst helpen zonder te adopteren? →</a>
  </div>
</section>

<script>
(function () {
  /* Keuzehulp */
  var out = document.getElementById('keuze-out');
  var tip = document.getElementById('keuze-tip');
  var picks = [null, null, null, null];
  document.querySelectorAll('.lab .btnrow').forEach(function (row, q) {
    row.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        picks[q] = +b.getAttribute('data-v');
        row.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        if (picks.every(function (p) { return p !== null; })) {
          var score = picks[0] + picks[1] + picks[2] + picks[3];
          if (score <= 2) {
            out.textContent = '🐶 Richting: pup (erkende fokker)';
            tip.innerHTML = 'Jij wilt zekerheid en hebt minder tijd: een pup met bekende ouders en gezondheidsonderzoeken past goed. Lees de <a href="/fokkers" style="color:var(--g)">fokkergids</a> en de <a href="/aankoopgids" style="color:var(--g)">aankoopgids</a>.';
          } else if (score <= 5) {
            out.textContent = '⚖️ Beide routes passen — kies op gevoel + info';
            tip.innerHTML = 'Je zit precies in het midden. Bezoek een asiel én een goede fokker, praat met beide, en wees eerlijk over je dagritme. Oók een volwassen asielhond is prima voor een eerstebaasje als het asiel de match begeleidt.';
          } else {
            out.textContent = '🏠 Richting: asielhond';
            tip.innerHTML = 'Je hebt tijd, ervaring en durf — precies wat een asielhond verdient. Kijk naar de adoptie-stappen hierboven en vraag het asiel naar honden met een "rugzakje" die vaak over het hoofd worden gezien.';
          }
        }
      });
    });
  });

  /* 30-dagen-checklist */
  var checks = document.querySelectorAll('#adoptie-checklist input');
  var bar = document.getElementById('adoptie-progress');
  function save() {
    var done = 0;
    checks.forEach(function (c, i) { if (c.checked) done++; });
    bar.style.width = (done / checks.length * 100) + '%';
    checks.forEach(function (c) { c.closest('.check').classList.toggle('done', c.checked); });
    var saved = []; checks.forEach(function (c, i) { if (c.checked) saved.push(i); });
    try { localStorage.setItem('tg-adoptie-checklist', JSON.stringify(saved)); } catch (e) {}
  }
  try {
    var saved = JSON.parse(localStorage.getItem('tg-adoptie-checklist') || '[]');
    checks.forEach(function (c, i) { c.checked = saved.indexOf(i) !== -1; });
  } catch (e) {}
  checks.forEach(function (c) { c.addEventListener('change', save); });
  save();
})();
</script>`
  });
}
