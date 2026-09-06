/* Pagina: Hondengedrag & Rasgezondheid (Ronde 13)
   — aaien/kopje vs buikje, lichaamstaal, honden onderling, wolf-vs-hond,
     en de eerlijke kijk op "zijn alle honden een beetje ziek?". */
import { pageShell, esc } from './base.mjs';

const CSS = `
/* Aai-zone explorer */
.pet-banner { border-radius: 26px; overflow: hidden; position: relative; margin: 10px 0 26px; box-shadow: var(--shadow-lg); border: 1px solid var(--line); }
.pet-banner img { width: 100%; height: 100%; max-height: 420px; object-fit: cover; display: block; }
.pet-banner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(200deg, rgba(4,20,13,0) 40%, rgba(4,20,13,.62) 100%); }
.pet-banner-caption { position: absolute; left: 24px; bottom: 20px; z-index: 2; color: #fff; max-width: 560px; }
.pet-banner-caption strong { display: block; font: 800 20px 'Sora', 'Plus Jakarta Sans', sans-serif; letter-spacing: -.02em; }
.pet-banner-caption span { font-size: 13.5px; color: rgba(255,255,255,.85); }
.pet-zone { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 18px; }
.pet-chip { display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); font: 700 13px 'Plus Jakarta Sans', sans-serif; color: var(--ink); cursor: pointer; transition: all .18s cubic-bezier(.16,1,.3,1); }
.pet-chip:hover { border-color: var(--em); transform: translateY(-1px); }
.pet-chip.on { background: linear-gradient(135deg, #0f3e28, #165b3c); color: #fff; border-color: #0f3e28; box-shadow: 0 8px 20px rgba(15,62,40,.3); }
.pet-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--em); }
.pet-chip.warn .dot { background: #d97706; }
.pet-chip.no .dot { background: #dc2626; }
.pet-panel { display: grid; grid-template-columns: 1.1fr .9fr; gap: 22px; align-items: start; margin-top: 6px; }
.pet-info { background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 24px; box-shadow: var(--shadow); min-height: 220px; }
.pet-info h3 { font-size: 20px; margin-bottom: 8px; }
.pet-info p { color: var(--muted); font-size: 14.5px; line-height: 1.7; }
.pet-verdict { margin-top: 14px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; font: 800 12.5px 'Plus Jakarta Sans', sans-serif; }
.pet-verdict.ok { background: rgba(16,185,129,.12); color: var(--g); border: 1px solid rgba(16,185,129,.3); }
.pet-verdict.warn { background: rgba(217,119,6,.12); color: #92400e; border: 1px solid rgba(217,119,6,.3); }
.pet-verdict.no { background: rgba(220,38,38,.1); color: #b91c1c; border: 1px solid rgba(220,38,38,.3); }
.pet-signs { display: grid; gap: 10px; }
.pet-sign { display: flex; align-items: flex-start; gap: 10px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 13px 15px; font-size: 13.5px; color: var(--ink); }
.pet-sign b { color: var(--g); }
.pet-sign .n { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font: 800 12px 'Plus Jakarta Sans', sans-serif; background: var(--em); color: #fff; }

/* Lichaamstaal-reader */
.bl-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0 20px; }
.bl-tab { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); font: 700 13px 'Plus Jakarta Sans', sans-serif; color: var(--muted); cursor: pointer; transition: all .18s ease; }
.bl-tab.on { background: var(--g); color: #fff; border-color: var(--g); }
.bl-view { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bl-tile { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 20px; display: grid; gap: 6px; transition: transform .2s ease, border-color .2s ease; }
.bl-tile:hover { transform: translateY(-2px); border-color: var(--em); }
.bl-tile h4 { font-size: 15.5px; }
.bl-tile p { font-size: 13.5px; color: var(--muted); }
.bl-tile .sig { font: 800 11px 'Plus Jakarta Sans', sans-serif; text-transform: uppercase; letter-spacing: .08em; color: var(--em); }

/* Wolf vs hond */
.wolf-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 20px 0; }
.wolf-cell { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 20px; text-align: center; }
.wolf-cell .big { font: 800 30px 'Sora', sans-serif; letter-spacing: -.04em; color: var(--g); }
.wolf-cell span { display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); margin-top: 4px; }
.compare-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 6px 0 10px; background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
.compare-table th, .compare-table td { text-align: left; padding: 13px 16px; font-size: 14px; border-bottom: 1px solid var(--line); }
.compare-table th { background: rgba(16,185,129,.07); font-size: 12px; text-transform: uppercase; letter-spacing: .07em; color: var(--g); }
.compare-table tr:last-child td { border-bottom: 0; }
.compare-table td:first-child { font-weight: 700; }
@media (max-width: 860px) { .wolf-grid { grid-template-columns: repeat(2, 1fr); } .pet-panel, .bl-view { grid-template-columns: 1fr; } .compare-table th, .compare-table td { padding: 10px 12px; font-size: 13px; } }

/* Rasgezondheid tabel */
.ra-tables { display: grid; gap: 16px; }
.ra-row { display: grid; grid-template-columns: 1.2fr 1.6fr .9fr; gap: 14px; align-items: center; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; }
.ra-row .name { font: 800 15px 'Plus Jakarta Sans', sans-serif; }
.ra-row .name small { display: block; font: 600 12px 'Plus Jakarta Sans', sans-serif; color: var(--muted); margin-top: 2px; }
.ra-row .risk { justify-self: end; font: 800 11.5px 'Plus Jakarta Sans', sans-serif; text-transform: uppercase; letter-spacing: .06em; padding: 6px 12px; border-radius: 999px; white-space: nowrap; }
.risk.high { background: #fee2e2; color: #b91c1c; }
.risk.mid { background: #fef3c7; color: #92400e; }
.risk.low { background: #d1fae5; color: #065f46; }
@media (max-width: 760px) { .ra-row { grid-template-columns: 1fr; gap: 8px; } .ra-row .risk { justify-self: start; } }
`;

const PET_ZONES = [
  { id: 'borst', label: 'Borst & schouder', verdict: 'ok', verdictText: 'Favoriet van bijna elke hond',
    title: 'Borst, schouder & kin: de veilige zones',
    body: 'Onderzoek naar aaigedrag (o.a. Universiteit van Lincoln) laat zien dat honden het meest ontspannen reageren op aaien op de zijkant van de borst, onder de kin en langs de schouders. Waarom? Je hand komt van opzij (niet van bovenaf), de hond houdt je in beeld en het gebied is niet kwetsbaar. Veel honden drukken zich zelfs tegen je hand aan — dat is het honden-woord voor "doorgaan".',
    signs: ['Leunt in je hand of duwt met de snuit', 'Ogen half dicht, zachte blik', 'Staart laag en langzaam kwispelend', 'Haalt rustig adem, eventueel "zucht" van tevredenheid'] },
  { id: 'kop', label: 'Kopje aaien', verdict: 'warn', verdictText: 'Kan — maar alleen bij goede kennissen',
    title: 'Waarom aaien wij eigenlijk het kopje?',
    body: 'Wij doen het omdat wij mensen óók elkaars hoofd aanraken als teken van genegenheid, en omdat de kop het eerst binnen handbereik is. Maar veel honden ervaren een hand die van bovenaf over hun kop komt als bedreigend: het blokkeert hun zicht en komt uit hun "blinde vlek". Bekende honden vinden het vaak prima — vreemden kunnen beter onder de kin of op de borst starten.',
    signs: ['Bij vreemden: eerst hand laten ruiken', 'Wegdraaien van de kop = stop', "Kop laag houden = 'doe maar rustig'", 'Bij eigen hond: achter de oren krabben is een klassieker'] },
  { id: 'buik', label: 'Buikje', verdict: 'warn', verdictText: 'Alleen als híj het aanbiedt',
    title: 'Het buikje: kwetsbaar vertrouwen',
    body: 'Een hond die op zijn rug gaat liggen toont de meest kwetsbare kant van zijn lijf. Dat is een teken van groot vertrouwen — geen uitnodiging om altijd direct te gaan wrijven. Rol een hond nooit om; wacht tot hij het zelf doet. Sommige honden vinden buikwrijven heerlijk, andere vinden het eng of prikkelend. Let op: een hond die op zijn rug ligt maar stijf is, lippen likt of wegkijkt, zegt "ik laat het toe, maar ik vind het niet fijn".',
    signs: ['Zelf op de rug rollen = uitnodiging', 'Potenvouw of stijfheid = afhaken', 'Korte, snelle likjes aan je hand = kalmeren', 'Met een pootje "terugduwen" = genoeg'] },
  { id: 'poot', label: 'Poten & staart', verdict: 'no', verdictText: 'Meestal niet — begin er niet aan',
    title: 'Poten, staart en achterlijf: hands-off',
    body: 'Potenvullingen en staart zijn voor veel honden gevoelige, beschermde gebieden. Zelfs honden die verder enorm aaibaar zijn, trekken hun poot weg of worden stijf als je eraan komt. Bij onbekende honden is dat extra risicovol. Ben je toch bezig met training of verzorging? Bouw het op met beloning en heel korte aanrakingen — nooit als verrassing.',
    signs: ['Poot wegtrekken of op de grond "vasthouden"', 'Staart tussen de poten of strak omhoog', 'Plotseling weglopen = duidelijke grens', 'Bonken met de staart is géén toestemming'] }
];

const BODY_LANG = {
  'staart': [
    { sig: 'Laag en langzaam kwispelen', t: 'Ontspannen en tevreden', p: 'De "neutrale" stand. Een kwispelende staart betekent niet altijd blij: de SNAALHEID, HOOGTE en richting vertellen het echte verhaal.' },
    { sig: 'Hoog en stijf rechtop', t: 'Alert of spanning', p: 'Hoge, stijve staart met snelle kleine bewegingen = opwinding of onzekerheid. Combineer dit met oren naar voren? Dan is er iets wat zijn aandacht vangt.' },
    { sig: 'Tussen de poten', t: 'Onderdanig of bang', p: 'De staart "vouwt" naar binnen om geur en grootte te verstoppen. Dit is een kalmerend signaal — geen uitnodiging om te aaien.' },
    { sig: 'Wijd en cirkelend', t: 'Pure vreugde', p: 'De helicopterstaart: de hele achterkant beweegt mee. Dit is het dichtst bij een "ik ben blij jou te zien".' }
  ],
  'oren': [
    { sig: 'Ontspannen, iets naar voren', t: 'Nieuwsgierig & vriendelijk', p: 'De oren luisteren mee: ontspannen oren die meebewegen met geluid zijn het beste teken van een rustige hond.' },
    { sig: 'Strak naar voren', t: 'Focus of jachtinstinct', p: 'Oren als radar naar voren = intense aandacht. Bij een vreemde hond: laat hem eerst afstand houden.' },
    { sig: 'Slap naar achteren', t: 'Onderdanig of onzeker', p: 'Vlakke, naar achteren getrokken oren ("puppy-oren") betekenen vaak: "ik ben niet bedreigend". Kan ook angst zijn — kijk naar de rest van het lichaam.' },
    { sig: 'Stijf tegen de kop', t: 'Stress of vrees', p: 'Eén oor terug + lippen likken + wegkijken = hond voelt zich niet op zijn gemak. Geef ruimte.' }
  ],
  'lichaam': [
    { sig: 'Speelbuiging (play bow)', t: 'Hé, wil je spelen?', p: 'Voorpoten plat, achterlijf hoog. Honden gebruiken dit als universeel "alles wat nu komt is spel" — dé uitnodiging bij honden onderling, én naar mensen toe.' },
    { sig: 'Spelen-happen (mouthing)', t: 'Vriendelijk contact', p: 'Zachte happen zonder druk, met kwispelende staart en rollende bewegingen. Bij puppy\'s is dit normale socialisatie; leer liever "zacht" aan dan te straffen.' },
    { sig: 'Gapen & rekken', t: 'Kalmerend signaal', p: 'Honden gapen niet alleen bij vermoeidheid: het is een "kalmerend signaal" om spanning te breken. Wissel gapen af met wegkijken? Dan is de hond onzeker of vervuld — of het even zelf even rustig te maken.' },
    { sig: 'Zich uitschudden (shake-off)', t: 'Spanning loslaten', p: 'Na een spannend of verwarrend moment schudt een hond zich uit alsof hij nat is. Dit "reset" zijn lichaam — handig om te weten als je zelf net iets engs deed.' }
  ],
  'hoofd': [
    { sig: 'Whale eye (oogwit zichtbaar)', t: 'Onzeker of bang', p: 'Als je het wit rond de ogen ziet terwijl de hond wegkijkt, voelt hij zich klem. Dit is een waarschuwing vóór het grommen — geef ruimte, doe niets.' },
    { sig: 'Lippen likken bij niets', t: 'Licht ongemak', p: 'Even snel je lippen likken zonder dat er eten in de buurt is, betekent vaak: "ik vind dit spannend". Herhaal dit patroon vaker? Dan stijgt de stress.' },
    { sig: 'Zachte, halfgesloten ogen', t: 'Vertrouwen & ontspanning', p: 'Een langzame, zachte blik ("soft eyes") is het honden-equivalent van een glimlach. Sommige honden doen zelfs een langzame knipoog naar hun baas.' },
    { sig: 'Snuit naar je hand', t: '"Ik wil contact"', p: 'Een hond die zijn snuit tegen je hand of been duwt, vraagt om aandacht of een aai — dat is toestemming die hij zélf geeft. Precies waar je op wilt wachten.' }
  ]
};

const WOLF_ROWS = [
  ['Genen', '±99,9% hetzelfde DNA — maar dat zegt weinig over gedrag', 'Ruim 20.000–40.000 jaar samen evolutie'],
  ['Lezen van mensen', 'Begrijpt wijzen, oogcontact en honderden woorden', 'Zelfs handgetrainde wolven pakken het wijzen niet op'],
  ['Sociale structuur', 'Flexibele "familie" met baas, gezin en hondenvrienden', 'Nucleaire gezinsroedel van ouders + jongen, geen rangorde-gevechten'],
  ['Voeding', 'Amylase-genen 4–30× gekopieerd: verwerkt zetmeel (brokken!)', 'Slechts 2 kopieën: puur vleeseter-ontwerp'],
  ['Ontwikkeling', 'Blijft "puppy" — neotenie: grote ogen, speelsheid, kwispelen', 'Wordt volwassen, jager en zelfstandig'],
  ['Hond-wezen', 'Kiest mensen: van kolonisatie tot knuffelpartner', 'Kiest de roedel: de wolf blijft een wild dier']
];

const BREED_ROWS = [
  { name: 'Labrador', small: 'Populairste familiehond — groot formaat', risk: 'high', riskLabel: 'Hoog op gewricht',
    text: 'Heup- en elleboogdysplasie, obesitas, allergische huid en Exercise-Induced Collapse (EIC). Trombose is géén typische Labradorkwaal — dat hoor je vaker over mensen of katten. Labradors zijn wél vatbaar voor een stollings-afwijking (von Willebrand), dat is het tegenovergestelde: een verhoogde bloedingneiging. Check: HD/ED-röntgen bij de ouders + DNA-test voor EIC en PRA.' },
  { name: 'Platneus honden', small: 'Mopshond, Franse Bulldog, Boxer', risk: 'high', riskLabel: 'Ademhaling',
    text: 'Brachycephalic Obstructive Airway Syndrome (BOAS): verkorte snuit = vernauwde luchtwegen, snurken, hijgen, slechte warmteregulatie. Studies schatten dat een groot deel merkbare klachten heeft. Kies bij platneuzen altijd een fokker die op gezondheid fokt (langer neusbeen, open neusgaten) en vermijd inspanning in de warmte.' },
  { name: 'Chihuahua & kleine honden', small: 'Tot ±5 kg', risk: 'mid', riskLabel: 'Klein maar kwetsbaar',
    text: 'Kleine honden leven gemiddeld het langst, maar hebben eigen risico\'s: ingeklapte luchtpijp (tracheacollaps), losse knieschijf (patella luxatie), gebitsproblemen en bij pups lage bloedsuiker. Met de juiste gewichtscontrole en zachte aanlijnmethoden (tuigje!) zijn dit prima levende mini\'s.' },
  { name: 'Golden Retriever', small: 'Groot, zacht, vacht', risk: 'mid', riskLabel: 'Kanker & gewricht',
    text: 'Goudjes scoren hoog op gewrichtsproblemen en bepaalde kankers (hemangiosarcoom, lymfoom). Het goede nieuws: door strenge fokselectie en DNA-screening dalen de cijfers. Vraag altijd naar de gezondheidsuitslagen van de ouders.' },
  { name: 'Teckel & laagbenige rassen', small: 'Lange rug, korte poten', risk: 'high', riskLabel: 'Rug',
    text: 'De langste rug ter wereld per kilo: tussenwervelschijfproblemen (IVDD) komen veel voor. Voorkom: geen trappen springen, hond niet aan de lijn laten hangen, gewicht laag houden. Nieuwe tests en rug-screening helpen fokkers om risico te verlagen.' },
  { name: 'Kruising / niet-ras', small: 'Alle groottes', risk: 'low', riskLabel: 'Gemiddeld gezonder',
    text: 'Gemengde honden erven minder vaak twee dezelfde ziektesgenen ("hybrid vigor") en leven gemiddeld ±6–12 maanden langer dan rashonden van hetzelfde formaat. Let op: dat is minder dan vaak wordt beweerd — formaat en levensstijl wegen zwaarder dan rasverklaring.' }
];

export function hondengedragPage() {
  const zones = PET_ZONES.map(z => `
    <button class="pet-chip${z.id === 'borst' ? ' on' : ''} ${z.verdict === 'no' ? 'no' : z.verdict === 'warn' ? 'warn' : ''}" data-zone="${z.id}" type="button" aria-pressed="${z.id === 'borst'}">
      <span class="dot"></span>${z.label}
    </button>`).join('');

  const blTabs = Object.keys(BODY_LANG).map((k, i) =>
    `<button class="bl-tab${i === 0 ? ' on' : ''}" data-bl="${k}" type="button">${k === 'staart' ? 'Staart' : k === 'oren' ? 'Oren' : k === 'lichaam' ? 'Lichaam' : 'Kop & ogen'}</button>`).join('');

  const blViews = Object.keys(BODY_LANG).map((k, i) => `
    <div class="bl-view" data-bl-view="${k}"${i === 0 ? '' : ' hidden'}>
      ${BODY_LANG[k].map(t => `
        <div class="bl-tile">
          <span class="sig">${t.sig}</span>
          <h4>${t.t}</h4>
          <p>${t.p}</p>
        </div>`).join('')}
    </div>`).join('');

  const wolfCells = [
    ['99,9%', 'zelfde DNA als de wolf'],
    ['±30.000', 'jaar samen evolutie'],
    ['4–30×', 'amylase-genen (zetmeel!)'],
    ['165+', 'woorden die een hond snapt']
  ].map(c => `<div class="wolf-cell"><div class="big">${c[0]}</div><span>${c[1]}</span></div>`).join('');

  const wolfRows = WOLF_ROWS.map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');

  const breedRows = BREED_ROWS.map(b => `
    <div class="ra-row">
      <div class="name">${b.name}<small>${b.small}</small></div>
      <div class="bl-tile" style="background:transparent;border:0;padding:0"><p style="font-size:13.5px;color:var(--muted);margin:0">${b.text}</p></div>
      <span class="risk ${b.risk}">${b.riskLabel}</span>
    </div>`).join('');

  return pageShell({
    title: 'Waarom aaien we het kopje? Hondengedrag, communicatie & rasgezondheid (2026) | TrimGids',
    description: 'Waarom aaien mensen het kopje van een hond en niet het buikje? Hoe vindt een hond het fijn geaaid te worden, hoe communiceren honden met elkaar en met mensen, en hoe dicht staat de hond nog bij de wolf? Plus: een eerlijke blik op rasziektes zoals heupdysplasie bij Labradors en ademhalingsproblemen bij kleine platneuzen.',
    canonical: '/hondengedrag',
    body: `
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Waarom aaien mensen het kopje van een hond en niet het buikje?","acceptedAnswer":{"@type":"Answer","text":"Mensen aaien de kop omdat dat het dichtst bij is, omdat wij bij elkaar ook het hoofd aanraken en omdat je de hond zo makkelijk recht in de ogen kijkt. Honden zelf prefereren echter borst, kin en schouders: een hand van bovenaf over de kop kan bedreigend overkomen omdat hij het zicht blokkeert. Het buikje is kwetsbaar: een hond die zich aanbiedt toont vertrouwen, maar een hond mag nooit gedwongen worden."}},
{"@type":"Question","name":"Hoe communiceren honden met elkaar?","acceptedAnswer":{"@type":"Answer","text":"Honden communiceren vooral met lichaamstaal: staarthoogte, oorstand, blik, houding en kalmerende signalen zoals gapen, lippen likken en wegkijken. De speelbuiging is de universele uitnodiging voor spel. Ook ruiken ze elkaar uitgebreid (neus, wangen, achterlijf) om leeftijd, gezondheid en stemming te lezen."}},
{"@type":"Question","name":"Lijkt een hond nog op de wolf en zijn alle honden een soort van ziek?","acceptedAnswer":{"@type":"Answer","text":"Honden delen ongeveer 99,9% van hun DNA met de wolf, maar zijn door duizenden jaren domesticatie anders gaan denken: ze lezen menselijke aanwijzingen zoals wijzen, hebben extra amylase-genen voor zetmeel en blijven speelser ('puppy's'). Niet alle honden zijn ziek, maar fokken op uiterlijk heeft rasspecifieke risico's gecreëerd: Labradors scoren hoog op heupdysplasie en Exercise-Induced Collapse, platneuzen op ademhalingsproblemen en teckels op rugproblemen. Gezonde fokkers (met HD/ED-röntgen, DNA- en oogscreening) reduceren dat risico sterk; kruisingen zijn gemiddeld iets gezonder."}}
]}</script>

<span class="eyebrow">Hondengedrag · Communicatie · Gezondheid</span>
<h1>Waarom aaien we het kopje — en hoe praat een hond eigenlijk met je?</h1>
<p class="intro">De meeste mensen aaien een hond op de kop. De meeste honden zouden liever op de borst of onder de kin geaaid worden. In deze interactieve gids ontdek je waarom, hoe je "hond" leest als een pro, hoe honden onder elkaar praten, hoe dicht je viervoeter nog bij de wolf staat — en of het waar is dat álle honden een beetje ziek zijn.</p>

<div class="pet-banner">
  <img src="/assets/img/gen/k-aaien-960.webp" srcset="/assets/img/gen/k-aaien-480.webp 480w, /assets/img/gen/k-aaien-960.webp 960w" sizes="(max-width:980px) 100vw, 1100px" width="960" height="644" fetchpriority="high" decoding="async" alt="Golden retriever geniet met gesloten ogen van een rustige aai op de borst">
  <div class="pet-banner-caption">
    <strong>Dit is de beste plek om te aaien</strong>
    <span>De borst — niet de bovenkant van de kop, tenzij je hond het zelf vraagt.</span>
  </div>
</div>

<section class="sec">
  <h2>Kopje, borst of buikje? De aai-kaart voor elke hond</h2>
  <p class="sub">Klik op een zone en lees wat een hond daar écht van vindt — plus de signalen waarmee hij jou "toestemming" geeft of juist "stop" zegt.</p>
  <div class="pet-zone" role="tablist" aria-label="Aai-zones">${zones}</div>
  <div class="pet-panel">
    <div class="pet-info" id="pet-info" aria-live="polite">
      <h3 id="pet-title">${PET_ZONES[0].title}</h3>
      <p id="pet-body">${PET_ZONES[0].body}</p>
      <span class="pet-verdict ${PET_ZONES[0].verdict}" id="pet-verdict">${PET_ZONES[0].verdictText}</span>
    </div>
    <div class="pet-signs" id="pet-signs">
      ${PET_ZONES[0].signs.map((x, i) => `<div class="pet-sign"><span class="n">${i + 1}</span><b>${x}</b></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec">
  <h2>Hoe lees je een hond als een pro?</h2>
  <p class="sub">Honden praten niet — ze zenden. Deze Lichaamstaal-Reader leert je de vier belangrijkste kanalen. Kies een tab.</p>
  <div class="bl-tabs" role="tablist" aria-label="Lichaamstaal kanalen">${blTabs}</div>
  ${blViews}
</section>

<section class="sec">
  <h2>Hoe praten honden met elkaar?</h2>
  <p class="sub">Vergelijk het met een handdruk die 5 seconden duurt, gevolgd door een volledig gesprek zonder woorden.</p>
  <div class="grid g3">
    <div class="card">
      <h3>1 · De begroeting</h3>
      <p>Honden snuffelen elkaar eerst bij neus en wangen, daarna (kort) bij het achterlijf. Die geur vertelt leeftijd, gezondheid, stemming en geslacht. Hard trekken of opdringen breekt het ritueel — laat ze even.</p>
    </div>
    <div class="card">
      <h3>2 · De speelbuiging</h3>
      <p>Voorpoten plat, kont omhoog: de meest herkenbare "alles is nu spel"-uitnodiging. Honden gebruiken hem ook naar mensen toe. Speel je mee? Dan beantwoord je het vriendschapsaanbod.</p>
    </div>
    <div class="card">
      <h3>3 · Kalmerende signalen</h3>
      <p>Gapen, wegkijken, lippen likken, langzaam bewegen, zich uitschudden: dit zijn "remmen" waarmee honden spanning verlagen — bij zichzelf én bij de ander. Zie je ze? Geef ruimte.</p>
    </div>
  </div>
  <div class="stats-row">
    <div class="stat-card"><strong>±70</strong><span>kalmerende signalen beschreven</span></div>
    <div class="stat-card" style="border-left-color:var(--amber)"><strong>0,5–3 sec</strong><span>zo lang duurt een begroeting</span></div>
    <div class="stat-card" style="border-left-color:#3730a3"><strong>99%</strong><span>van het "gesprek" is lichaamstaal</span></div>
  </div>
</section>

<section class="sec">
  <h2>Hoe dicht staat je hond nog bij de wolf?</h2>
  <p class="sub">Bijna hetzelfde DNA — maar een totaal ander wezen. Dit is het eerlijke antwoord.</p>
  <div class="pet-banner" style="margin:6px 0 18px">
    <img src="/assets/img/gen/k-wolf-hond-960.webp" srcset="/assets/img/gen/k-wolf-hond-480.webp 480w, /assets/img/gen/k-wolf-hond-960.webp 960w" sizes="(max-width:980px) 100vw, 1100px" width="960" height="644" loading="lazy" decoding="async" alt="Grijze wolf en golden retriever naast elkaar in een herfstbos">
    <div class="pet-banner-caption">
      <strong>Één forse stap verwijderd</strong>
      <span>Twee wezens, bijna hetzelfde DNA — maar een totaal ander leven.</span>
    </div>
  </div>
  <div class="wolf-grid">${wolfCells}</div>
  <table class="compare-table">
    <thead><tr><th>Sleutel</th><th>Hond</th><th>Wolf</th></tr></thead>
    <tbody>${wolfRows}</tbody>
  </table>
  <div class="tip-box">
    <div class="tip-box-head">
      <span class="eyebrow" style="color:var(--g)">De kern</span>
      <h2>Een hond is geen "tamme wolf"</h2>
      <p>De hond is door duizenden jaren fokken en kiezen een aparte tak geworden: hij leest onze ogen, begrijpt wijzen, kwispelt met een staart die de wolf niet eens heeft, en kan brokken verteren die een wolf nauwelijks aankan. De wolf is familie — maar de hond is mens geworden.</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>Zijn alle honden een beetje ziek? De eerlijke check</h2>
  <p class="sub">Kort antwoord: <strong>nee</strong>. Maar ja — sommige rassen dragen door het fokken op uiterlijk een hogere ziektelast. Dit is wat je moet weten per type hond. Klik door en vergelijk.</p>
  <div class="ra-tables">${breedRows}</div>
  <div class="compare" style="margin-top:26px">
    <div class="ok">
      <h3>Zo kies je een gezonde rashond</h3>
      <ul>
        <li>HD/ED-röntgen van beide ouders bij grote rassen</li>
        <li>DNA-tests: EIC + PRA bij Labradors, IVDD bij teckels, oogonderzoek bij golden retrievers</li>
        <li>Fokker laat pups én ouders zien, met stamboom en vaccinaties</li>
        <li>Vraag naar levensverwachting en de zwakste kanten van het ras</li>
      </ul>
    </div>
    <div class="no">
      <h3>Verkeerde mythes (opgeruimd)</h3>
      <ul>
        <li>"Labradors krijgen trombose" → onjuist; ze hebben vaker gewrichts- en spierproblemen</li>
        <li>"Kleine honden zijn altijd ongezond" → onjuist; ze leven gemiddeld het langst</li>
        <li>"Kruisingen zijn per definitie gezond" → deels waar: +6–12 maanden, minder dan vaak gedacht</li>
        <li>"Alle honden zijn een beetje ziek" → nee; de meeste honden worden gezond oud</li>
      </ul>
    </div>
  </div>
  <p class="score-note">Let op: dit is algemene voorlichting, geen medisch advies. Bij klachten over ademhaling, gewrichten of gedrag: altijd een dierenarts raadplegen.</p>
</section>

<section class="sec">
  <h2>Veelgestelde vragen</h2>
  <div class="qas">
    <div class="qa">
      <b>Waarom aaien mensen over het kopje en niet over het buikje?</b>
      <p>Omdat de kop het makkelijkst bereikbaar is en we ook bij mensen het hoofd aanraken als teken van genegenheid. Honden zelf prefereren borst, kin en schouders — een hand van bovenaf over de kop kan hun zicht blokkeren en bedreigend voelen. Het buikje is kwetsbaar: alleen als de hond het zelf aanbiedt.</p>
      <span class="why">Gouden regel: laat de hond naar jóú toe komen en begin onder de kin of op de borst.</span>
    </div>
    <div class="qa">
      <b>Hoe zie je of een hond geniet van aaien?</b>
      <p>Ontspannen lichaam, halfgesloten zachte ogen, laag kwispelende staart, in je hand leunen en zelfs een "zucht" van tevredenheid. Stopt de hond met bewegen, likt hij zijn lippen of kijkt hij weg? Dan is het tijd om te stoppen — dat is de hondenmanier van "nee".</p>
      <span class="why">De beste test: stop even met aaien. Blijft hij contact zoeken? Doorgaan.</span>
    </div>
    <div class="qa">
      <b>Kan ik mijn hond het beste met een hondje laten kennismaken?</b>
      <p>Ja — maar niet aan de lijn, en niet frontaal met strakke lijn. Laat ze elkaar ontmoeten op neutraal terrein, in een boog, met losse lijn. Eén kort snuffelen (0,5–3 sec) is genoeg; wacht op de speelbuiging voordat het echte spel begint.</p>
      <span class="why">Honden die elkaar niet mogen: grommen, stijve staarten en staren. Haal rustig afstand.</span>
    </div>
  </div>
</section>

<section class="sec">
  <span class="eyebrow">Verder lezen</span>
  <h2>Meer weten over je hond?</h2>
  <div class="grid g3">
    <a class="card" href="/zintuigen"><h3>Zintuigenlab: horen, zien, ruiken</h3><p>Hoe werkt die 220 miljoen receptoren-neus van je hond — en ziet hij echt kleuren?</p></a>
    <a class="card" href="/hondenanatomie"><h3>Interactieve hondenanatomie</h3><p>Klik door het doorstm-model en zie hoe brokken van mond tot poep reizen.</p></a>
    <a class="card" href="/hondenweetjes"><h3>Hypoallergeen, leeftijd & slimheid</h3><p>De feiten achter de grootste hondenmythes — zonder marketingpraat.</p></a>
  </div>
</section>

<script>
(function () {
  var ZONES = ${JSON.stringify(PET_ZONES)};
  var zoneChips = document.querySelectorAll('.pet-chip');
  var petTitle = document.getElementById('pet-title');
  var petBody = document.getElementById('pet-body');
  var petVerdict = document.getElementById('pet-verdict');
  var petSigns = document.getElementById('pet-signs');
  function showZone(id) {
    var z = null;
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) { z = ZONES[i]; break; }
    if (!z) return;
    zoneChips.forEach(function (c) {
      var on = c.dataset.zone === id;
      c.classList.toggle('on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    petTitle.textContent = z.title;
    petBody.textContent = z.body;
    petVerdict.textContent = z.verdictText;
    petVerdict.className = 'pet-verdict ' + z.verdict;
    petSigns.innerHTML = z.signs.map(function (s, i) {
      return '<div class="pet-sign"><span class="n">' + (i + 1) + '</span><b>' + s + '</b></div>';
    }).join('');
  }
  zoneChips.forEach(function (c) { c.addEventListener('click', function () { showZone(c.dataset.zone); }); });

  var blTabs = document.querySelectorAll('.bl-tab');
  blTabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.dataset.bl;
      blTabs.forEach(function (x) { x.classList.toggle('on', x === t); });
      document.querySelectorAll('[data-bl-view]').forEach(function (v) {
        v.hidden = v.dataset.blView !== k;
      });
    });
  });
})();
</script>`
  });
}
