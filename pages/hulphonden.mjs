/* Pagina: Diensthonden — blindegeleidehonden, politiehonden, training, interviews & na de carrière. */
import { pageShell, esc } from './base.mjs';

const CSS = `
.hund{display:grid;gap:0;margin-top:26px}
.role{display:grid;grid-template-columns:190px 1fr;gap:22px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.role+.role{margin-top:16px}
.role .ic{width:170px;height:150px;border-radius:var(--r);display:grid;place-items:center;font-size:60px;background:radial-gradient(120% 120% at 30% 20%,rgba(16,185,129,.25),transparent 60%),var(--bg);border:1px solid var(--line)}
.role h3{font-size:21px;margin-bottom:6px}
.role p{color:var(--muted);font-size:14.5px}
.role .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.role .chips span{font-size:12px;font-weight:800;padding:4px 11px;border-radius:999px;background:rgba(16,185,129,.1);color:var(--g)}
.role.pol .ic{background:radial-gradient(120% 120% at 30% 20%,rgba(55,48,163,.2),transparent 60%),var(--bg)}
.role.pol .chips span{background:rgba(55,48,163,.1);color:#3730a3}
.big{font-size:clamp(28px,4vw,44px);font-weight:800;color:var(--g)}
.how{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:20px}
.tagrow{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 4px}
.tagrow a{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-size:13.5px;font-weight:800;color:var(--g)}
@media(max-width:700px){.role{grid-template-columns:1fr}.role .ic{width:100%;height:120px;font-size:46px}}
`;

export function hulphondenPage() {
  return pageShell({
    title: 'Diensthonden: blindegeleidehonden, politiehonden & meer | TrimGids',
    description: 'Hoe worden blindegeleidehonden en politiehonden getraind, wat maakt die training bijzonder, waar vind je interviews met hondengeleiders en wat gebeurt er met een diensthond na zijn carrière?',
    canonical: '/hulphonden',
    active: 'hulphonden',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Diensthonden</p>
<div class="hero">
  <span class="eyebrow">Dieren met een baan</span>
  <h1>Diensthonden: de slimste collega’s van Nederland</h1>
  <p class="intro">Van blindegeleidehond tot politiehond: honden werken al eeuwen met mensen. Hieronder lees je hoe ze worden geselecteerd en getraind, wat die training zo bijzonder maakt, wat hondengeleiders zelf vertellen en — misschien wel het mooiste — wat er gebeurt als de carrière voorbij is.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><div class="big">±50</div><p>nieuwe blindegeleidehonden per jaar (KNGF)</p></div>
    <div class="card" style="text-align:center"><div class="big">~8 jr</div><p>gemiddelde werkcarrière van een politiehond</p></div>
    <div class="card" style="text-align:center"><div class="big">3%</div><p>van alle pups haalt het echte selectietraject</p></div>
    <div class="card" style="text-align:center"><div class="big">1 team</div><p>mens + hond trainen en werken altijd samen</p></div>
  </div>
</div>

<section class="sec">
  <h2>🐕‍🦺 Blindengeleidehonden (KNGF)</h2>
  <p class="sub">Een geleidehond is geen gewone hond die een trucje leert. Het is een partner die de veiligheid van een slechtziende of blinde gebruiker letterlijk in zijn poten heeft.</p>
  <div class="card">
    <div class="timeline">
      <div class="tl"><div class="dot">🏠</div><div><h3>1. Puppypleeggezin (tot ±14–16 maanden)</h3><p>De pup groeit op in een gewoon gezin, wordt gesocialiseerd met verkeer, kinderen, trams en winkelcentra en leert netjes lopen aan de lijn. Het pleeggezin wordt begeleid door een consulent van KNGF Geleidehonden.</p></div></div>
      <div class="tl"><div class="dot">🎓</div><div><h3>2. Basistraining (BAT) op de school</h3><p>In Amstelveen/Amsterdam wordt getest wat de hond al kan, went hij aan de kennel en start de formele opleiding: werken in het tuig, stoppen bij obstakels, veilig oversteken en 'intelligente ongehoorzaamheid'.</p></div></div>
      <div class="tl"><div class="dot">🗺️</div><div><h3>3. Training in de echte wereld (6–8 maanden)</h3><p>Elke dag oefenen op markten, perrons, in het winkelcentrum en op gevaarlijke kruispunten. De opleiding duurt totaal zo’n 6 tot 8 maanden voordat de hond klaar is voor een gebruiker.</p></div></div>
      <div class="tl"><div class="dot">🤝</div><div><h3>4. Match & instructieperiode</h3><p>De school matcht hond en gebruiker op tempo, maat en leefstijl. Daarna volgt een instructieperiode bij de gebruiker thuis: samen routes leren, verzorging en vertrouwen opbouwen.</p></div></div>
    </div>
    <p style="margin-top:6px"><strong>Wat maakt dit speciaal?</strong> Het draait niet om gehoorzaamheid, maar om <em>intelligente ongehoorzaamheid</em>: als de baas iets gevaarlijks wil doen (een afdaling zonder stoeprand, een snelle auto), wéét de hond dat er een betere route is en weigert beleefd. De beugel betekent 'aan het werk'; zonder tuig is het een gewone, dolle hond. Medische indicatie loopt via Visio of Bartiméus, waarna een DogSim-training volgt — je leert eerst zelf oriënteren met een stok voordat je met een echte hond loopt. Je kunt het zelf ervaren in de VR-geleidehondenbeleving van KNGF.</p>
    <div class="tagrow"><a href="https://geleidehond.nl" target="_blank" rel="noopener noreferrer">KNGF Geleidehonden ↗</a><a href="https://www.oogvereniging.nl/leven-met/geleidehonden/een-geleidehond-aanvragen/" target="_blank" rel="noopener noreferrer">Aanvragen via Oogvereniging ↗</a></div>
  </div>
</section>

<section class="sec">
  <h2>🚓 Politiehonden</h2>
  <p class="sub">De Nederlandse politiehond is wereldwijd beroemd. Waarom? Omdat de selectie en training hier extreem streng zijn — met alle voor- én nadelen van dien.</p>
  <div class="role pol">
    <div class="ic">🚓</div>
    <div>
      <h3>Selectie & training: van test naar certificaat</h3>
      <p>Jonge honden worden uitgebreid getest op karakter, kalmte en betrouwbaarheid — dat zijn de belangrijkste eigenschappen. Daarna worden ze opgeleid binnen de <strong>KNPV</strong> (Koninklijke Nederlandse Politiehond Vereniging). De politie koopt honden meestal rond hun derde jaar, op voorwaarde dat ze geslaagd zijn voor het basisdiploma <strong>Politiehond I</strong>. Een geleider mag alleen werken met de hond waarmee hij examen heeft gedaan. Rassen: Duitse herder, Mechelse/ Belgische herder, Laekense herder en Labrador (voor speurwerk).</p>
      <div class="chips"><span>Gehoorzaamheid</span><span>Apporteren</span><span>Volgen & opsporen</span><span>Verdedigen (laatste middel)</span><span>Kalme karaktertest</span></div>
    </div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>👮 Surveillancehonden</h3><p>Patrouilleren met de agent, verdachten aanhouden en veilig politieoptreden mogelijk maken. Het uitgangspunt is altijd: <em>niet</em> bijten — de aanwezigheid en training moeten escalatie voorkomen.</p></div>
    <div class="card"><h3>🔍 Speur- & opsporingshonden</h3><p>Sporen volgen die mensen niet kunnen waarnemen: vermiste personen, verdachten, drugs, wapens, explosieven, geld of bewijsmateriaal — binnen én buiten.</p></div>
    <div class="card"><h3>🏛️ Team met de geleider</h3><p>Een hondengeleider noemt het geen beroep maar een 'way of life': de hond is er 24/7, vakanties gaan naar aangewezen pensions en de hond woont bij de geleider thuis.</p></div>
  </div>

  <h3 style="margin:26px 0 10px;font-size:20px">🎙️ Wat hondengeleiders zelf vertellen (interviews)</h3>
  <div class="grid g3">
    <div class="quote"><p>"Het is geen beroep, maar een way of life. Je moet de hond ook als je vrij bent meerdere keren per dag uitlaten — met vakanties heb je aangewezen pensions."</p><footer>— Agent Ralph, hondengeleider van het 2-jarige Mechelse baasje Champ · <a href="https://www.omroepwest.nl/nieuws/4876065/mijn-kinderen-mogen-champ-niet-zomaar-aaien-hondengeleider-zijn-heeft-grote-impact-op-leven-agent" target="_blank" rel="noopener noreferrer">Omroep West ↗</a></footer></div>
    <div class="quote"><p>"Mijn kinderen mogen Champ niet zomaar aaien. Het gezin laat ik hem wel kennen, zodat hij weet: daar krijg ik mijn eten van, dat is goed volk. Andere mensen niet."</p><footer>— Ralph · <a href="https://www.omroepwest.nl/nieuws/4876065/mijn-kinderen-mogen-champ-niet-zomaar-aaien-hondengeleider-zijn-heeft-grote-impact-op-leven-agent" target="_blank" rel="noopener noreferrer">Omroep West ↗</a></footer></div>
    <div class="quote"><p>"Na jarenlange dienst zit de loopbaan van de achtjarige Woody er op. Ik ga hem ontzettend missen, maar voor hem is het beter."</p><footer>— Geleider van politiehond Woody (Team Surveillancehonden) · <a href="https://www.noordhollandsdagblad.nl/regio/ijmond/politiehond-woody-gaat-met-pensioen-en-zoekt-een-nieuw-baasje-ik-ga-hem-ontzettend-missen-maar-voor-hem-is-het-beter/145478432.html" target="_blank" rel="noopener noreferrer">Noordhollands Dagblad ↗</a></footer></div>
  </div>
  <div class="quote" style="margin-top:16px;border-left-color:#f59e0b">
    <p><strong>De keerzijde (belangrijk om te weten):</strong> de KNPV is al jaren bezig met een omslag naar diervriendelijker training. In 2020 werden na de uitzending van Undercover in Nederland zeven hondentrainers aangehouden op verdenking van dierenmishandeling, en bestuursleden stapten op. De overgrote meerderheid traint volgens het hoofdbestuur wél op een goede manier — maar wie een (ex-)politiehond of afgekeurde werkhond overweegt, moet weten dat deze honden nooit een 'gewone hond' worden.</p>
    <footer>— o.a. <a href="https://www.gelderlander.nl/doetinchem/hele-wereld-wil-de-nederlandse-politiehond-maar-er-is-een-keerzijde~afabab42/" target="_blank" rel="noopener noreferrer">De Gelderlander ↗</a> · <a href="https://edepot.wur.nl/264232" target="_blank" rel="noopener noreferrer">WUR: Les, dieren met een baan ↗</a></footer>
  </div>
</section>

<section class="sec">
  <h2>🏡 Na de carrière: met pensioen, maar nooit 'gewoon'</h2>
  <p class="sub">Politiehonden werken gemiddeld tot hun achtste levensjaar en blijven in principe tot hun tiende bij de politie — zolang ze gecertificeerd zijn. En daarna?</p>
  <div class="grid g3">
    <div class="card"><h3>1. Meestal bij de geleider</h3><p>De standaard: de hond blijft bij de hondengeleider wonen. Die kent de hond, de signalen en de commando's — de veiligste optie voor een werkhond.</p></div>
    <div class="card"><h3>2. Familie of collega</h3><p>Kan dat niet, dan zoekt de dienst vaak een warm gezin in de directe omgeving, zoals een collega of familielid. Agent Ralph's hond Boet ging naar zijn vader: 'dan zie ik hem af en toe nog'.</p></div>
    <div class="card"><h3>3. Bijzonder baasje nodig</h3><p>Een gepensioneerde politiehond kan getriggerd worden door geluiden en is nooit een gewone hond. Daarom is herplaatsing niet vrijblijvend: kenners waarschuwen dat een afgekeurde of zwaar getrainde werkhond zonder ervaring voor grote problemen kan zorgen.</p></div>
  </div>
  <div class="card" style="margin-top:16px;border-left:4px solid var(--em)">
    <p><strong>Onze tip:</strong> wil je een gepensioneerde diensthond een thuis geven? Doe dat alleen via officiële kanalen (de geleider/het korps en gecertificeerde herplaatsingsinitiatieven), met een echt kennismakingstraject en een gedragsexpert erbij. En reken erop dat hij zijn hele leven een hond met een verleden blijft.</p>
  </div>
</section>

<section class="sec">
  <h2>🌍 Waar worden honden nog meer voor ingezet?</h2>
  <p class="sub">Naast geleide- en politiewerk draait er een hele wereld van gespecialiseerde hondenteams. Klik door op de kaart of het forum om erover te praten.</p>
  <div class="hund">
    <div class="role"><div class="ic">🛃</div><div><h3>Douane & grenscontrole</h3><p>Speurhonden van de Douane vinden drugs, contant geld, tabak en verstekelingen in havens, luchthavens en containers. Eerst wordt de hond door een instructeur getest op de benodigde eigenschappen, dan volgt een grondige medische keuring, pas daarna wordt hij aangekocht en vormt hij een team met een geleider.</p><div class="chips"><span>Drugs</span><span>Contant geld</span><span>Tabak</span><span>Mensen</span></div></div></div>
    <div class="role"><div class="ic">🆘</div><div><h3>Reddings- & zoekhonden</h3><p>Na aardbevingen, instortingen of bij vermiste personen zoeken honden met hun neus waar mensen en techniek het laten afweten. Ze werken met geuren die dagen oud kunnen zijn.</p><div class="chips"><span>Aardbevingen</span><span>Vermisten</span><span>Lawines</span></div></div></div>
    <div class="role"><div class="ic">🩺</div><div><h3>Medische alert & assistentie</h3><p>Hulphonden waarschuwen bij epilepsie, lage bloedsuiker (diabetes) en in onderzoek naar het detecteren van ziektes zoals bepaalde vormen van kanker of COVID. Assistentiehonden openen deuren, pakken spullen op en geven rust bij PTSS.</p><div class="chips"><span>Diabetes</span><span>Epilepsie</span><span>PTSS</span><span>Mobiliteit</span></div></div></div>
    <div class="role"><div class="ic">🔥</div><div><h3>Detectie in het dagelijks leven</h3><p>Gespecialiseerde teams ruiken bedwantsen, brandversnellende stoffen (brandonderzoek), explosieven, drugs in scholen en gebouwen — zelfs truffels en landbouwproducten worden met honden opgespoord.</p><div class="chips"><span>Bedwantsen</span><span>Brandonderzoek</span><span>Explosieven</span><span>Scholen</span></div></div></div>
    <div class="role"><div class="ic">🎗️</div><div><h3>Therapie- & zorgteams</h3><p>Ziekenhuishonden, leeshonden (kinderen die moeite hebben met lezen), rouw- en zorgteams: hier draait het niet om werken maar om aanwezigheid, rust en verbinding.</p><div class="chips"><span>Ziekenhuis</span><span>Leeshond</span><span>Rouwbegeleiding</span></div></div></div>
  </div>
</section>

<section class="sec">
  <h2>💬 Praat mee in de community</h2>
  <p class="sub">Vragen over diensthonden of een eigen verhaal? Het forum is dé plek voor ervaringen van andere baasjes.</p>
  <a class="btn" href="/forum">Naar het forum →</a>
  <a class="btn ghost" href="/zintuigen" style="margin-left:8px">Hoe sterk is de neus van een hond? →</a>
</section>`
  });
}
