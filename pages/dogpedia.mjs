/* Dogpedia — de kennis-hub van TrimGids (Ronde 15).
   Bundelt alle kennisgidsen + de Guinness Honden Top 100 records. */
import { pageShell, esc } from './base.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const records = (() => {
  try {
    const data = JSON.parse(readFileSync(fileURLToPath(new URL('../data/dog-records.json', import.meta.url)), 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
})();

const CAT_ORDER = ['Snelheid', 'Geluid', 'Leeftijd & levensduur', 'Groot & klein', 'Zintuigen & slimheid', 'Eten & prijzen', 'Wereldwijd & cijfers', 'Honden in de geschiedenis', 'Record & bijzonder'];

const GUIDE_GROUPS = [
  {
    title: 'Interactief & ontdekken',
    text: 'De favorieten om mee te spelen',
    items: [
      { href: '/hondenanatomie', title: 'Hondenanatomie · interactief model', desc: 'Klik door hersenen, hart, longen, maag en darmen in een doorsnede-model.' },
      { href: '/hondengedrag', title: 'Hondengedrag · de aai-kaart', desc: 'Waarom aaien we het kopje — en hoe lees je kalmerende signalen?' },
      { href: '/zintuigen', title: 'Zintuigenlab', desc: 'Neus, oren, ogen: hoe ziet de wereld eruit voor een hond?' },
      { href: '/leeftijd-calculator', title: 'Hondenleeftijd-calculator', desc: 'Van puppytijd tot senior: reken de leeftijd van je hond om.' },
      { href: '/giftigheid-calculator', title: 'Gif- & chocoladecheck', desc: 'Hoe gevaarlijk is dat wat je hond net heeft gegeten?' },
      { href: '/puppy-kiezen', title: 'Puppymatcher', desc: 'Welk ras past bij jouw leven, huis en budget?' }
    ]
  },
  {
    title: 'Rassen & weetjes',
    text: 'Feitjes voor de avond aan de bank',
    items: [
      { href: '/rassen', title: 'Rassen & variëteiten', desc: 'Alles over de populairste en zeldzaamste rassen van Nederland.' },
      { href: '/hondenweetjes', title: 'Hondenweetjes: hypoallergeen, leeftijd & slimheid', desc: 'Zijn honden echt hypoallergeen? En hoe slim is jouw hond?' },
      { href: '/honden-cijfers', title: 'Honden in cijfers', desc: 'Populatie, geboorte, sterfte en trends in 1 overzicht.' },
      { href: '/geschiedenis-hond', title: 'Geschiedenis van de hond', desc: 'Van wolf en kampvuur tot Pomeriaan en coupestijl.' },
      { href: '/koninklijke-honden', title: 'Honden van royals', desc: "Luna, Corgi's en wereldwijde vorstelijke honden." },
      { href: '/hondenwedstrijden', title: 'Hondenwedstrijden & sport', desc: 'Agility, coursing, shows en de wedstrijdpiste.' },
      { href: '/zwerfhonden', title: 'Zwerfhonden wereldwijd', desc: 'Aantallen, oorzaken en wat jij kunt doen.' },
      { href: '/verboden-rassen', title: 'Verboden rassen: NL & wereld', desc: 'Waar is welk ras (gedeeltelijk) verboden?' }
    ]
  },
  {
    title: 'Praktisch & gezondheid',
    text: 'Voor als het ertoe doet',
    items: [
      { href: '/ehbo-hond', title: 'EHBO-noodgids', desc: 'De 5 stappen van schaduw tot kliniek — en wat je nooit moet doen.' },
      { href: '/hitteberoerte-hond', title: 'Hitteberoerte & hete auto', desc: 'Tijdlijn, symptomen en het juridische verhaal van de ruit inslaan.' },
      { href: '/braken-hond', title: 'Mijn hond braakt', desc: 'Wanneer rustig afwachten en wanneer direct naar de dierenarts?' },
      { href: '/chippen-ontwormen', title: 'Chip & ontwormen', desc: 'Verplichtingen, kosten en het juiste schema.' },
      { href: '/poepzakjes', title: 'Poepzakjes & boetes', desc: 'Regels per gemeente: waar en hoe hoog zijn de boetes?' },
      { href: '/kosten-hond', title: 'Wat kost een hond?', desc: 'Complete kostencheck inclusief eerste jaar en verzekeringen.' },
      { href: '/trimmen-kosten', title: 'Wat kost trimmen? (2026)', desc: 'Tarieven per ras, vachttype en regio.' },
      { href: '/reizen', title: 'Vliegen & reizen met je hond', desc: 'Reisdocumenten, transport en de beste voorbereiding.' }
    ]
  },
  {
    title: 'Aanschaf & verantwoord',
    text: 'Van eerste idee tot eerste wandeling',
    items: [
      { href: '/puppies', title: 'PuppyMarktplaats', desc: 'Pups van geverifieerde fokkers met zichtbare gezondheidschecks.' },
      { href: '/fokkers', title: 'Erkende fokkers', desc: 'Hoe controleer je een fokker en herken je broodfok?' },
      { href: '/aankoopgids', title: 'Aankoopgids per ras', desc: 'Alles wat je moet weten vóór je een pup koopt.' },
      { href: '/adoptie', title: 'Pup of asielhond?', desc: 'De eerlijke vergelijking: kopen of adopteren.' },
      { href: '/hond-en-werk', title: 'Hond & fulltime werken', desc: 'Ritmes, alleen-tijd en uitlaatservice.' },
      { href: '/hond-gevonden', title: 'Hond gevonden? Wat nu?', desc: 'Direct stappenplan en meldpunten.' }
    ]
  }
];

function recordHtml(r, i) {
  return `<li class="gr-row" data-cat="${esc(r.category)}">
    <span class="gr-rank">${String(i + 1).padStart(3, '0')}</span>
    <div class="gr-main">
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.text)}</p>
    </div>
    <span class="gr-value">${esc(r.value)}</span>
  </li>`;
}

const CATEGORY_PILLS = `<button type="button" class="gr-pill" data-gr="alle">Alles</button>` +
  CAT_ORDER.map(c => `<button type="button" class="gr-pill" data-gr="${esc(c)}">${esc(c)}</button>`).join('') +
  '<button type="button" class="gr-pill" data-gr="alle" style="margin-left:auto">100 records ↓</button>';

export function dogpediaPage() {
  const itemsHtml = records.map(recordHtml).join('');

  const body = `
<style>${CSS}</style>
<span class="eyebrow">TrimGids · Knowledge Hub</span>
<h1>Dogpedia: alles over honden — van records tot rasgidsen</h1>
<p class="intro">Dit is hét kenniscentrum van TrimGids: interactieve modellen, rasweetjes, EHBO-kennis en de <strong>Guinness Honden Top 100</strong> — honderd records, feiten en bijzonderheden die je hond nog interessanter maken.</p>

<div class="dp-hero-grid">
  <a class="dp-hero-card dp-feature" href="/hondenanatomie">
    <span class="dp-badge">Interactief</span>
    <strong>Hondenanatomie</strong>
    <p>Klik door het doorsnede-model van een hond: hersenen, hart, longen, maag en darmen.</p>
  </a>
  <a class="dp-hero-card dp-feature" href="/hondengedrag">
    <span class="dp-badge">Populair</span>
    <strong>Hondengedrag & de aai-kaart</strong>
    <p>Waarom aaien we het kopje? En hoe lees je je hond als een pro?</p>
  </a>
  <a class="dp-hero-card dp-feature accent" href="/hondenrecords">
    <span class="dp-badge">Recordhouder</span>
    <strong>Guinness Honden Top 100</strong>
    <p>De snelste (74,6 km/u), oudste (29+ jaar), grootste, kleinste en hardste hond ooit.</p>
  </a>
</div>

${GUIDE_GROUPS.map(g => `
<section class="sec">
  <div class="section-head"><div><span class="eyebrow">Dogpedia · ${esc(g.title)}</span><h2>${esc(g.title)}</h2><p class="sub">${esc(g.text)}</p></div></div>
  <div class="dp-guides">
    ${g.items.map(item => `<a class="dp-guide" href="${item.href}"><strong>${esc(item.title)}</strong><span>${esc(item.desc)}</span></a>`).join('')}
  </div>
</section>`).join('')}

<section class="sec" id="hondenrecords" style="scroll-margin-top:120px">
  <div class="section-head"><div><span class="eyebrow">Records & feiten</span><h2>Guinness Honden Top 100</h2><p class="sub">Honderd records, feiten en bijzonderheden — van topsnelheid en luidste blaf tot oudste, langste en zwaarste hond. Kies een categorie en ontdek de nummers.</p></div></div>
  <div class="gr-pills" id="gr-pills">${CATEGORY_PILLS}</div>
  <ol class="gr-list" id="gr-list">${itemsHtml}</ol>
  <p class="gr-note">Bronnen: Guinness World Records, raskennels en openbare diergeneeskundige publicaties. Waar twijfel bestaat over een record (zoals de ingetrokken titel van Bobi) staat dat eerlijk vermeld.</p>
</section>

<section class="sec">
  <div class="section-head"><div><span class="eyebrow">Vragen & antwoorden</span><h2>Wat baasjes vaak vragen</h2></div></div>
  <div class="dp-faq">
    <details><summary>Hoe snel kan de snelste hond rennen?</summary><p>Officieel gecertificeerd: 74,6 km/u — een Greyhound. Dat is sneller dan een mens op de 100 m en bijna net zo snel als een paard.</p></details>
    <details><summary>Hoe hard kan een hond blaffen?</summary><p>De luidste gemeten blaf ligt rond de 113 dB — vergelijkbaar met een vliegtuig op 100 m hoogte. Het volume hangt af van grootte, spanning en conditie van de hond.</p></details>
    <details><summary>Wie was de oudste hond ooit?</summary><p>De oudste hond met sluitend bewijs is Bluey (29 jaar en 5 maanden, 1939). Bobi uit Portugal werd ooit op 31 jaar erkend, maar Guinness trok dat record in 2024 in.</p></details>
    <details><summary>Welke hond is de grootste en kleinste?</summary><p>Grootste ooit: Duitse Dog Zeus (111,8 cm schofthoogte). Kleinste: Chihuahua Pearl (9,14 cm) en eerder Miracle Milly (9,65 cm).</p></details>
    <details><summary>Zijn hondenrecords eerlijk meetbaar?</summary><p>Guinness werkt met strenge regels, maar records die afhangen van claimgegevens (zoals leeftijd) kunnen nooit 100% zeker zijn. Daarom vermeldt TrimGids altijd de bron en de twijfel.</p></details>
  </div>
</section>
`;
  return pageShell({
    title: 'Dogpedia: hondenkennis, records & de Guinness Top 100 | TrimGids',
    description: 'De Dogpedia van TrimGids: interactieve hondenanatomie, gedrag, rasweetjes, EHBO-kennis en de Guinness Honden Top 100 — de snelste, oudste, grootste en luidste hond.',
    canonical: '/dogpedia',
    body
  });
}

const CSS = `
.dp-hero-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 26px 0 8px; }
.dp-hero-card { display: grid; gap: 10px; background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 22px; text-decoration: none; box-shadow: var(--shadow); transition: transform .25s cubic-bezier(.16,1,.3,1), border-color .2s, box-shadow .25s; }
.dp-hero-card:hover { transform: translateY(-4px); border-color: rgba(16,185,129,.5); box-shadow: var(--shadow-lg); }
.dp-hero-card strong { font-size: 18px; color: var(--ink); }
.dp-hero-card p { margin: 0; font-size: 13.5px; color: var(--muted); line-height: 1.55; }
.dp-hero-card.accent { background: linear-gradient(135deg, #0f3e28, #17694a); border-color: transparent; }
.dp-hero-card.accent strong, .dp-hero-card.accent p { color: #fff; }
.dp-hero-card.accent p { color: rgba(255,255,255,.82); }
.dp-badge { justify-self: start; font: 800 10.5px 'Plus Jakarta Sans', sans-serif; letter-spacing: .07em; text-transform: uppercase; color: var(--g, #065f46); background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3); padding: 4px 10px; border-radius: 999px; }
.dp-hero-card.accent .dp-badge { background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.35); color: #a7f3d0; }
.dp-guides { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
.dp-guide { display: grid; gap: 5px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; text-decoration: none; transition: border-color .2s, transform .2s; }
.dp-guide:hover { border-color: rgba(16,185,129,.55); transform: translateY(-2px); }
.dp-guide strong { color: var(--ink); font-size: 14.5px; }
.dp-guide span { color: var(--muted); font-size: 12.5px; line-height: 1.5; }
.gr-pills { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 20px; }
.gr-pill { font: 700 12.5px 'Plus Jakarta Sans', sans-serif; color: var(--ink); background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; cursor: pointer; transition: all .2s; }
.gr-pill:hover { border-color: var(--g, #10b981); color: var(--g, #065f46); }
.gr-pill.on { background: #0f3e28; border-color: #0f3e28; color: #fff; }
.gr-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; counter-reset: gr; }
.gr-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 16px; align-items: start; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 15px 18px; }
.gr-rank { font: 800 20px 'Sora', 'Plus Jakarta Sans', sans-serif; color: rgba(16,185,129,.55); }
.gr-main h3 { margin: 0 0 4px; font-size: 15.5px; }
.gr-main p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.55; }
.gr-value { font: 800 14px 'Plus Jakarta Sans', sans-serif; color: #065f46; background: rgba(16,185,129,.09); border: 1px solid rgba(16,185,129,.25); border-radius: 999px; padding: 6px 12px; white-space: nowrap; }
.gr-note { margin-top: 18px; font-size: 12px; color: var(--muted); }
.dp-faq { display: grid; gap: 10px; }
.dp-faq details { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 4px 18px; }
.dp-faq summary { cursor: pointer; font: 700 14.5px 'Plus Jakarta Sans', sans-serif; color: var(--ink); padding: 12px 0; }
.dp-faq details p { color: var(--muted); font-size: 13.5px; line-height: 1.6; padding-bottom: 12px; margin: 0; }
@media (max-width: 700px) { .gr-row { grid-template-columns: 44px 1fr; } .gr-value { grid-column: 2; justify-self: start; } }
@media (prefers-reduced-motion: no-preference) { .gr-row { animation: grIn .45s cubic-bezier(.16,1,.3,1) both; } }
@keyframes grIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
<script>
(function () {
  var pills = Array.prototype.slice.call(document.querySelectorAll('.gr-pill'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('.gr-row'));
  var list = document.getElementById('gr-list');
  function apply(cat) {
    rows.forEach(function (r) { r.hidden = !(cat === 'alle' || r.getAttribute('data-cat') === cat); });
  }
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      pills.forEach(function (x) { x.classList.remove('on'); });
      p.classList.add('on');
      apply(p.getAttribute('data-gr'));
    });
  });
  if (pills.length) pills[0].classList.add('on');
})();
</script>`;

export default dogpediaPage;
