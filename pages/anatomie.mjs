/* Pagina: Hondenanatomie — interactief model met hotspots (hover/klik),
   spijsverteringsuitleg & de vragen over kauwen en levensduur. */
import { pageShell, esc } from './base.mjs';

const CSS = `
/* ---------- Interactief model ---------- */
.anat-stage {
  position: relative;
  margin: 8px 0 26px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  background: #eef8f2;
  user-select: none;
}
.anat-stage > img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
.anat-hotspot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.95);
  background: rgba(15, 62, 40, 0.55);
  color: #fff;
  font: 800 13px 'Plus Jakarta Sans', system-ui, sans-serif;
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(3px);
  box-shadow: 0 3px 12px rgba(2, 32, 19, 0.35);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
  z-index: 2;
}
.anat-hotspot::after {
  content: '';
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  border: 1.5px solid rgba(16, 185, 129, 0.0);
  animation: hotspotPulse 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes hotspotPulse { 0% { transform: scale(0.8); opacity: 0.9; } 70% { transform: scale(1.35); opacity: 0; } 100% { opacity: 0; } }
.anat-hotspot:hover, .anat-hotspot:focus-visible, .anat-hotspot.active {
  transform: translate(-50%, -50%) scale(1.22);
  background: #10b981;
  color: #062719;
  z-index: 3;
}
.anat-hotspot.active::after { animation: none; border-color: rgba(16, 185, 129, 0.6); }

/* Info-paneel naast/onder het model */
.anat-panel {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 24px;
  align-items: start;
}
.anat-info {
  position: sticky;
  top: 96px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 26px;
  box-shadow: var(--shadow);
  min-height: 300px;
}
.anat-info-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--em);
  margin-bottom: 10px;
}
.anat-info-kicker::before { content: ''; width: 20px; height: 2px; border-radius: 999px; background: linear-gradient(90deg, #10b981, #fbbf24); }
.anat-info h2 { font-size: 24px; margin-bottom: 10px; }
.anat-info p { color: var(--muted); font-size: 14.5px; line-height: 1.7; }
.anat-info .fact {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13.5px;
  color: var(--ink);
}
.anat-info .fact b { color: var(--g); }
.anat-hint { color: var(--muted); font-size: 13px; margin-top: 18px; }
.anat-index { display: grid; gap: 8px; align-content: start; }
.anat-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 16px;
  padding: 11px 14px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: var(--ink);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.anat-chip:hover, .anat-chip.active { border-color: var(--em); background: rgba(16, 185, 129, 0.06); transform: translateX(3px); }
.anat-chip .n {
  width: 30px; height: 30px; border-radius: 50%; flex: none;
  display: grid; place-items: center;
  font: 800 13px 'Plus Jakarta Sans', sans-serif;
  background: var(--g); color: #fff;
}
.anat-chip.active .n { background: #10b981; color: #062719; }
.anat-chip b { display: block; font-size: 14px; }
.anat-chip small { color: var(--muted); font-size: 12px; }

/* Spijsverteringsparcours */
.parcours { position: relative; margin: 30px 0 6px; }
.parcours-track {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.par-step {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  position: relative;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
}
.par-step:hover { transform: translateY(-3px); border-color: var(--em); }
.par-step .t { font: 800 12px 'Plus Jakarta Sans', sans-serif; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
.par-step h4 { font-size: 16px; margin: 6px 0 4px; }
.par-step p { font-size: 13px; color: var(--muted); line-height: 1.55; }
.par-arrow {
  position: absolute; right: -11px; top: 50%; transform: translateY(-50%);
  color: var(--em); font-size: 18px; z-index: 2;
}
@media (max-width: 980px) {
  .anat-panel, .parcours-track { grid-template-columns: 1fr; }
  .anat-info { position: static; }
  .par-arrow { display: none; }
  .anat-hotspot { width: 28px; height: 28px; font-size: 11.5px; }
}
`;

const ORGANS = [
  {
    id: 'hersenen', label: 'Hersenen', x: 27.0, y: 11.8,
    title: 'Hersenen: een neus op poten',
    body: 'De hersenen van een hond zijn kleiner dan die van ons, maar de reukkwab is relatief enorm: tot wel 40× groter dan bij de mens. Een derde van het hondenbrein is gereserveerd voor het verwerken van geuren. Honden begrijpen gemiddeld zo’n 165 woorden en gebaren — de slimste (zoals een border collie) haalde er meer dan 1.000.',
    fact: '<b>Wist je dat?</b> Rassen verschillen in hersenaanleg: veel fokwerk ging naar uiterlijk, terwijl werkende honden (herders, retrievers) juist op denkvermogen zijn gefokt.'
  },
  {
    id: 'oren', label: 'Oren', x: 27.6, y: 16.6,
    title: 'Oren: 18 spieren per oor',
    body: 'Elk oor heeft 18 spieren, waardoor een hond zijn oren onafhankelijk kan draaien tot zo’n 180 graden. Horen gaat tot ±65 kHz; wij komen tot ±20 kHz. Daardoor hoort je hond het fluitje dat jij niet meer hoort — en het piepje van de koelkast dat jij allang niet meer opmerkt.',
    fact: '<b>Wist je dat?</b> Hangen de oren slap? Dan horen ze slechter — en kan vocht (bij zwemmen) makkelijker vast blijven zitten. Daarom krijgt een spaniel vaker oorproblemen dan een herdershond.'
  },
  {
    id: 'ogen', label: 'Ogen', x: 15.4, y: 21.7,
    title: 'Ogen: nachtzicht, maar kleurenblind voor rood',
    body: 'Honden zien in het donker ongeveer 5× beter dan wij: het lichtgevoelige laagje achter in het oog (tapetum) kaatst licht terug. Kleuren zien ze als blauw-geel — rood en groen lijken op elkaar. Daarom is rood speelgoed in het gras voor jou duidelijk, maar voor je hond bijna onzichtbaar.',
    fact: '<b>Wist je dat?</b> Het totale gezichtsveld is ±250 graden (wij ±180), maar het scherpe midden is kleiner: een hond ruikt en hoort liever dan dat hij staart.'
  },
  {
    id: 'neus', label: 'Neus', x: 10.8, y: 23.4,
    title: 'Neus: ±300 miljoen geurreceptoren',
    body: 'Een hond heeft ±220–300 miljoen geurreceptoren (de mens ±6 miljoen). De twee neusgaten werken apart: het ene ruikt wat er links gebeurt, het andere rechts — zo “ziet” een hond een geur als een beeld. Geurgeheugen blijft ook jaren hangen: daarom herkent een hond je na maanden.',
    fact: '<b>Wist je dat?</b> Een natte neus vangt geurmoleculen beter. Droge neus betekent niet automatisch ziekte — maar luid snuffelen wel: dat is voor een hond wat scrollen voor ons is.'
  },
  {
    id: 'gebit', label: 'Gebit', x: 15.8, y: 27.3,
    title: 'Gebit: 42 tanden om te scheuren, niet te malen',
    body: 'Volwassen honden hebben 42 tanden: 12 snijtanden, 4 hoektanden, 16 premolaren en 10 molaren. De hoektanden zijn gemaakt voor grijpen en scheuren; de achterste tanden kraken botten. Écht malen zoals een koe of paard kan een hond niet — daarom kauwt hij vooral om brokken kleiner en gladder te maken.',
    fact: '<b>Wist je dat?</b> Net als bij mensen: poetsen voorkomt tandsteen en tandvleesontsteking — bij honden een van de meest voorkomende “stille” ziektes.'
  },
  {
    id: 'slokdarm', label: 'Slokdarm & luchtpijp', x: 27.5, y: 31.5,
    title: 'Slokdarm & luchtpijp: twee buizen naast elkaar',
    body: 'De slokdarm (voedsel) loopt vlak naast de luchtpijp (lucht). Bij het slikken klapt een klepje (epiglottis) dicht zodat er geen brok in de longen kan schieten. Daarna duwt een golfbeweging (peristaltiek) het voer in enkele seconden naar de maag — honden slikken overigens ook prima in liggende houding.',
    fact: '<b>Wist je dat?</b> Bij “megaoesofagus” (verlamde slokdarm) komt voer terug zonder dat de hond hoeft te braken. In dat geval moeten honden rechtop eten.'
  },
  {
    id: 'longen', label: 'Longen', x: 43.0, y: 44.6,
    title: 'Longen: ademen én koelen',
    body: 'In rust haalt een hond ±30–40 keer per minuut adem. Hijgen is géén paniek maar koeling: via tong en luchtpijp verdampt vocht — tot ±300–400 hijgende slagen per minuut. Let op: diep, langzaam hijgen bij stilzitten kan wél een signaal zijn van pijn of stress.',
    fact: '<b>Wist je dat?</b> Honden zweten bijna niet (alleen via de voetzooltjes). Daarom is een hete auto of een warme dag voor een hond levensgevaarlijk — en dus ouderwets de vraag: hoe snel stijgt de temperatuur? Al na 10 minuten kan het te laat zijn.'
  },
  {
    id: 'hart', label: 'Hart', x: 39.6, y: 52.8,
    title: 'Hart: 70–120 slagen per minuut',
    body: 'Het hart van een hond weegt ±0,7% van het lichaamsgewicht en klopt in rust ±70–120 keer per minuut — sneller dan dat van een mens. Bij inspanning kan de bloedsomloop tot 5× meer bloed rondpompen. Kleine honden hebben een sneller hart en een hogere rusthartslag dan grote.',
    fact: '<b>Wist je dat?</b> Hoe groter de hond, hoe trager het hart — en hoe korter het leven. Dat verband is een van de meest onderzochte in de hondengeneeskunde.'
  },
  {
    id: 'lever', label: 'Lever', x: 51.0, y: 45.6,
    title: 'Lever: het chemisch laboratorium',
    body: 'De lever doet 500+ klussen tegelijk: gifstoffen afbreken, gal maken voor vetvertering, eiwitten en energie opslaan en medicijnen verwerken. Alles wat via de darmen in het bloed komt, passeert eerst de lever. Omdat de lever veel reservecapaciteit heeft, zie je leverproblemen vaak pas laat.',
    fact: '<b>Wist je dat?</b> Chocolade is giftig omdat de lever het theobromine niet goed kan afbreken — bij een kleine hond kan dat binnen uren fataal worden.'
  },
  {
    id: 'maag', label: 'Maag', x: 55.2, y: 43.8,
    title: 'Maag: een sterke kookpan met pH 1–2',
    body: 'De maag heeft extreem zuur maagsap (pH 1–2 — vergelijkbaar met accuzuur). Daardoor worden eiwitten sterk afgebroken en bacteriën gedood. Brokken zwellen in de maag op en worden 4–8 uur “voorgekookt” voordat ze als brei naar de dunne darm gaan. De maag kan enorm uitzetten: een wolf at ooit 22% van zijn eigen gewicht in één maaltijd.',
    fact: '<b>Wist je dat?</b> Bij grote, diepe borstkasten (Berner Sennen, Duitse Dog, Doodles) kan de maag draaien — maagkanteling. Dat is binnen 2 uur fataal: direct naar de spoedkliniek bij een opgezette, harde buik en loos braken.'
  },
  {
    id: 'darmen', label: 'Darmen', x: 63.5, y: 47.2,
    title: 'Darmen: snel verwerken, veel opnemen',
    body: 'De dunne darm is bij een hond relatief kort — het hele kanaal is zo’n 4–6× de lichaamslengte (bij mensen 8–10×). Daardoor verwerkt een hond voer sneller: totale vertering duurt gemiddeld 8–24 uur, waarvan de maag 4–8 uur en de darmen de rest. In de dikke darm wordt vocht teruggewonnen en fermenteren vezels.',
    fact: '<b>Wist je dat?</b> Zetmeel (uit granen in brokken) wordt pas in de dunne darm afgebroken — in het speeksel van een hond zit amper amylase. Daarom gelden brokken langer in de maag en hebben ze ook meer drinkwater nodig.'
  },
  {
    id: 'nieren', label: 'Nieren', x: 54.0, y: 36.5,
    title: 'Nieren: continue filters',
    body: 'De nieren filteren continu het bloed en maken er urine van. Daarmee regelen ze water, zout, en bloeddruk. Nierproblemen zie je pas laat: tot 75% van de nierfunctie kan weg zijn voordat het opvalt. Meer drinken, geen druiven/rozijnen en regelmatig controle maken het verschil, zeker bij oudere honden.',
    fact: '<b>Wist je dat?</b> Druiven en rozijnen zijn voor sommige honden zelfs in kleine hoeveelheden levensgevaarlijk voor de nieren — bij twijfel direct bellen.'
  }
];

export function anatomiePage() {
  const chips = ORGANS.map(o => `
    <button class="anat-chip" data-organ="${o.id}" type="button" aria-pressed="false">
      <span class="n">${ORGANS.indexOf(o) + 1}</span>
      <span><b>${esc(o.label)}</b><small>Klik voor uitleg</small></span>
    </button>`).join('');

  const spots = ORGANS.map((o, i) => `
    <button class="anat-hotspot" data-organ="${o.id}" type="button" style="left:${o.x}%;top:${o.y}%" aria-label="${esc(o.label)} — toon uitleg" title="${esc(o.label)}">${i + 1}</button>`).join('');

  const defaultInfo = ORGANS[0];

  const steps = [
    { t: 'Mond', h: 'Bijten & smeren', p: 'Tanden breken de brok; speeksel is vooral glijmiddel. Een hond kauwt minder grondig dan een mens.' },
    { t: 'Slokdarm', h: 'Golfbeweging', p: 'Peristaltiek duwt de brok in ±2–5 seconden naar de maag — gepaard met een dichtklappend klepje.' },
    { t: 'Maag', h: 'Zuur bad (pH 1–2)', p: '4–8 uur: brokken zwellen op, eiwitten breken af, bacteriën sterven. Vlees is sneller klaar dan droge brok.' },
    { t: 'Dunne darm', h: 'Opname in het bloed', p: '1–2 uur: vetten, eiwitten en zetmeel worden opgenomen. Hier gebeurt de echte vertering.' },
    { t: 'Dikke darm', h: 'Vocht & fermentatie', p: 'Water wordt teruggewonnen, vezels vergisten; bacteriën maken vitamine K en helpen bij de laatste afbraak.' },
    { t: 'Poep', h: 'Einde parcours', p: 'Na ±8–24 uur is de maaltijd eruit. Kijk naar kleur, vorm en regelmaat: het is een gratis gezondheidscheck.' }
  ];

  const parcours = steps.map((s, i) => `
    <div class="par-step">
      <span class="t">${i + 1}. ${s.t}</span>
      <h4>${s.h}</h4>
      <p>${s.p}</p>
    </div>`).join('');

  return pageShell({
    title: 'Hondenanatomie uitgelegd: interactief model van organen (2026) | TrimGids',
    description: 'Hoe zit een hond in elkaar? Interactief anatomiemodel met hover- en klikbare organen, plus uitleg over de spijsvertering van brokken, waarom de ene hond kauwt en de andere slikt, en waarom kleine en gemengde honden gemiddeld ouder worden.',
    canonical: '/hondenanatomie',
    body: `
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Hoe verwerkt een hond brokken?","acceptedAnswer":{"@type":"Answer","text":"De hond bijt brokken klein, het speeksel is vooral glijmiddel. Via de slokdarm komt het voer in de sterk zure maag (pH 1-2), waar het 4 tot 8 uur wordt afgebroken. Daarna neemt de dunne darm de voedingsstoffen op en wint de dikke darm vocht terug. De totale vertering duurt gemiddeld 8 tot 24 uur."}},
{"@type":"Question","name":"Waarom kauwt de ene hond en slikt de andere de brok door?","acceptedAnswer":{"@type":"Answer","text":"Dat is een combinatie van ras, karakter en voeding: Labradors en retrievers schrokken door hun jacht-/voedselinstinct, terwijl fijnproevers zoals de Chihuahua kauwen. Ook brokvorm beïnvloedt het: cilindervormige brokken stimuleren kauwen. Schrokken verhoogt het risico op maagklachten, braken en zelfs maagkanteling."}},
{"@type":"Question","name":"Waarom worden kleine en gemengde honden gemiddeld ouder?","acceptedAnswer":{"@type":"Answer","text":"Kleine honden groeien langzamer en hebben door een genetische variant een lager IGF-1 (groeihormoon), wat veroudering en kanker vertraagt: kleine honden halen gemiddeld 16,4 jaar, reuzehonden 12,0 jaar. Kruisingen profiteren bovendien van genetische diversiteit (hybrid vigor) en leven gemiddeld 6 tot 12 maanden langer dan rashonden van hetzelfde formaat."}}
]}</script>

<span class="eyebrow">Interactief Anatomiemodel · Voor Baasjes</span>
<h1>Hoe zit een hond in elkaar?</h1>
<p class="intro">Zweef met je muis over het model of tik op een nummer en ontdek wat er in je hond gebeurt — van de neus tot de blaas. Daarna leggen we uit hoe brokken worden verwerkt, waarom de ene hond kauwt en de andere slikt, en waarom kleine en gemengde honden gemiddeld ouder worden.</p>

<div class="anat-stage" id="anat-stage">
  <img src="/assets/img/gen/k-anatomie-960.webp" srcset="/assets/img/gen/k-anatomie-480.webp 480w, /assets/img/gen/k-anatomie-960.webp 960w" sizes="(max-width:980px) 100vw, 900px" width="960" height="717" decoding="async" alt="Realistische doorsnede van een hond met zichtbare hersenen, longen, hart, lever, maag, darmen en nieren" fetchpriority="high">
  ${spots}
</div>

<div class="anat-panel">
  <aside class="anat-info" id="anat-info" aria-live="polite">
    <span class="anat-info-kicker" id="anat-kicker">Orgaan 1 · ${esc(defaultInfo.label)}</span>
    <h2 id="anat-title">${esc(defaultInfo.title)}</h2>
    <p id="anat-body">${defaultInfo.body}</p>
    <div class="fact" id="anat-fact">${defaultInfo.fact}</div>
    <p class="anat-hint">Tip: hover met je muis of tik op een nummer in de tekening, of kies hieronder een orgaan.</p>
  </aside>
  <div class="anat-index" id="anat-index">${chips}</div>
</div>

<section class="sec">
  <h2>Het spijsverteringsparcours: van brok tot poep</h2>
  <p class="sub">Een hond verwerkt voer sneller dan wij, maar wel in dezelfde volgorde. Volg de brok van links naar rechts.</p>
  <div class="parcours">
    <div class="parcours-track">${parcours}</div>
  </div>
</section>

<section class="sec">
  <h2>Waarom kauwt de ene hond en slikt de ander de brok door?</h2>
  <p class="sub">Het heeft niets met “luiheid” te maken: ras, karakter en brokvorm bepalen hoe er wordt gegeten.</p>
  <div class="compare">
    <div class="ok">
      <h3>De kauwer</h3>
      <ul>
        <li>Kleine, fijnproevende rassen (Chihuahua, Maltezer) eten langzaam en kauwen bewust.</li>
        <li>Voedsel wordt beter gemengd met speeksel en daalt rustiger in de maag.</li>
        <li>Het risico op maagkanteling en verstikking is kleiner.</li>
      </ul>
    </div>
    <div class="no">
      <h3>De schrokken</h3>
      <ul>
        <li>Labradors, retrievers en andere “voedselgedreven” rassen slikken uit instinct snel — ooit was dat overleven.</li>
        <li>Grote brokken blijven als blok in de maag en verteren slechter; er kan lucht mee naar binnen.</li>
        <li>Bij grote honden verhoogt schrokken het risico op de levensgevaarlijke maagkanteling.</li>
      </ul>
    </div>
  </div>
  <div class="tip-box" style="margin-top:22px">
    <div class="tip-box-head">
      <span class="eyebrow" style="color:var(--g)">Zo help je een schrokker</span>
      <h2>5 bewezen trucs tegen schrokken</h2>
      <p>Anti-schrokbak (met ribbels of pootjes), trage voerbord, brokjes verdelen over 2–3 maaltijden, voer in een likmat, en eventueel speciale cilindervormige brokken die stimuleren om te kauwen. Een hond die rustig eet, verteert beter én blijft veiliger.</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>Waarom worden kleine honden ouder — en gemengde ook?</h2>
  <p class="sub">Twee verschillende effecten, samen goed voor jaren verschil.</p>
  <div class="grid g3">
    <div class="card">
      <h3>1. Klein = langzamer groeien</h3>
      <p>Kleine honden groeien langzamer en hebben door een genetische variant een lager niveau van het groeihormoon <b>IGF-1</b>. Dat hormoon bepaalt niet alleen de grootte, maar ook hoe snel cellen slijten en kanker ontstaat. Lage IGF-1 = minder snelle veroudering.</p>
    </div>
    <div class="card">
      <h3>2. Groot = sneller oud</h3>
      <p>Grote en reuzehonden groeien veel sneller en hebben hogere IGF-1-waarden. Ze worden daarom eerder “senior” (vanaf 5–6 jaar bij reuzehonden) en hebben een kortere levensverwachting: klein ±16,4 jaar, gemiddeld ±15,7, groot ±14,3 en reuze ±12,0 jaar.</p>
    </div>
    <div class="card">
      <h3>3. Kruising = genetische diversiteit</h3>
      <p>Een kruising (of “niet-rashond”) erft minder vaak twee keer hetzelfde ziektegen. Dat “hybrid vigor” geeft gemiddeld ±6–12 maanden extra levensverwachting ten opzichte van een rashond van hetzelfde formaat — minder dan vaak wordt beweerd, maar wel echt.</p>
    </div>
  </div>
  <div class="stats-row" style="margin-top:20px">
    <div class="stat-card"><strong>16,4 jr</strong><span>Kleine hond (&lt;10 kg)</span></div>
    <div class="stat-card"><strong>15,7 jr</strong><span>Middelgroot (10–25 kg)</span></div>
    <div class="stat-card"><strong>14,3 jr</strong><span>Groot (25–40 kg)</span></div>
    <div class="stat-card" style="border-left-color:#3730a3"><strong>12,0 jr</strong><span>Reuzehond (&gt;40 kg)</span></div>
  </div>
  <p class="score-note">Bron: Amerikaanse eerstelijns-studie (2020, 3 praktijken, ~25.000 honden) en de grote Britse studie over 584.734 honden in <em>Scientific Reports</em> (2024). Ook geldt: teefjes leven gemiddeld ±6 maanden langer en gecastreerde honden langer dan niet-gecastreerde. Vlakke snoetjes (Franse Bulldog e.a.) leven korter dan langsnuitige honden.</p>
</section>

<section class="sec">
  <h2>Veelgestelde vragen</h2>
  <div class="qas">
    <div class="qa">
      <b>Hoe lang duurt de vertering bij een hond?</b>
      <p>Gemiddeld 8–24 uur. De maag is na 4–8 uur leeg; daarna neemt de dunne darm in 1–2 uur de voedingsstoffen op en wint de dikke darm vocht terug.</p>
      <span class="why">Droge brok blijft langer in de maag dan nat voer of vlees — voldoende drinken is dus extra belangrijk.</span>
    </div>
    <div class="qa">
      <b>Is schrokken gevaarlijk?</b>
      <p>Meestal niet direct, maar wel risicovol: brokken komen als blok in de maag en verteren slechter, er kan lucht mee naar binnen en bij grote honden stijgt het risico op maagkanteling. Een anti-schrokbak lost het meeste op.</p>
      <span class="why">Brak je hond kort na het eten al het eten weer uit? Dat kan door schrokken komen — maar houd het in de gaten.</span>
    </div>
    <div class="qa">
      <b>Klopt het dat kruisingen gezonder zijn?</b>
      <p>Gemiddeld wel iets — maar het grootste deel van het effect zit in het formaat. Kruisingen leven ±6–12 maanden langer dan rashonden van hetzelfde formaat; het verschil tussen klein en reuze is 4+ jaar.</p>
      <span class="why">Dus: kies liever op formaat en op gezonde ouders dan op “ras” of “kruising”.</span>
    </div>
  </div>
</section>

<script>
(function () {
  var ORG = ${JSON.stringify(ORGANS)};
  var stage = document.getElementById('anat-stage');
  var info = document.getElementById('anat-info');
  var kicker = document.getElementById('anat-kicker');
  var title = document.getElementById('anat-title');
  var body = document.getElementById('anat-body');
  var fact = document.getElementById('anat-fact');
  var chips = document.querySelectorAll('.anat-chip');
  var spots = document.querySelectorAll('.anat-hotspot');
  var current = null;

  function show(id, focus) {
    var o = null;
    for (var i = 0; i < ORG.length; i++) if (ORG[i].id === id) { o = ORG[i]; break; }
    if (!o) return;
    current = id;
    kicker.textContent = 'Orgaan ' + (ORG.indexOf(o) + 1) + ' · ' + o.label;
    title.textContent = o.title;
    body.textContent = o.body;
    fact.innerHTML = o.fact;
    chips.forEach(function (c) { c.classList.toggle('active', c.dataset.organ === id); c.setAttribute('aria-pressed', String(c.dataset.organ === id)); });
    spots.forEach(function (s) { s.classList.toggle('active', s.dataset.organ === id); });
    if (focus && typeof info.scrollIntoView === 'function') { try { info.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {} }
  }

  spots.forEach(function (s) {
    s.addEventListener('mouseenter', function () { show(s.dataset.organ); });
    s.addEventListener('focus', function () { show(s.dataset.organ); });
    s.addEventListener('click', function () { show(s.dataset.organ, true); });
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () { show(c.dataset.organ, true); });
  });

  /* Toetsenbord: pijltjes door de organen */
  document.addEventListener('keydown', function (e) {
    if (!stage) return;
    var idx = ORG.findIndex(function (o) { return o.id === current; });
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      var n = (idx + 1) % ORG.length;
      show(ORG[n].id, true); e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      var p = (idx - 1 + ORG.length) % ORG.length;
      show(ORG[p].id, true); e.preventDefault();
    }
  });
})();
</script>`
  });
}
