/* Pagina: Rassen & variëteiten — van Pomeriaan bear/toy/fox face tot kortsnuitige rassen.
   Interactief: variant-kiezer (Pomeriaan) en snuitlengte-meter (brachycefalie). */
import { pageShell } from './base.mjs';

const CSS = `
.varrow{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px}
.varrow button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.varrow button.on{background:var(--g);border-color:var(--g);color:#fff}
.variant{display:grid;grid-template-columns:300px 1fr;gap:22px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow)}
.variant img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r)}
.variant .face{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
.variant .face figure{background:var(--bg);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.variant .face img{height:150px}
.variant .face figcaption{font-size:12px;font-weight:800;text-align:center;padding:7px;color:var(--muted)}
.snuit{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px;align-items:center}
.snuit input[type=range]{width:100%;accent-color:var(--em)}
.snuit .r{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px}
.snuit .r b{font-size:18px;color:var(--g)}
.snuit .r p{font-size:13.5px;color:var(--muted)}
.groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.groups .gr{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
.groups .gr b{display:block;font-size:14px}
.groups .gr span{font-size:12.5px;color:var(--muted)}
@media(max-width:760px){.variant{grid-template-columns:1fr}.variant img{max-width:280px;margin:0 auto}.snuit{grid-template-columns:1fr}}
`;

const VARIANTS = {
  'bear': {
    t: 'Bear Face (teddybeer-gezicht)',
    d: 'Korte, brede snuit, ronde kop, bolle wangen, grote donkere ogen dicht bij elkaar en kleine laag geplaatste oren. Ziet eruit als een knuffelbeer. Bij Rusland-lijnen populair; een "echte" bear face vraagt jarenlange selectie op een goede verhouding tussen schedel en snuit (CFR).',
    pl: 'Schattig, maar: een te korte snuit bij een Pomeriaan kan ademhalingsproblemen geven (brachycefaal). Kies een fokker die de CFR-verhouding toont en de ouders laat zien.',
    img: '/assets/img/pomeriaan-640.webp'
  },
  'fox': {
    t: 'Fox Face (vossengezicht)',
    d: 'Langere, spitsere snuit (±3–5 cm), slankere kop, grotere hoger geplaatste oren en een alerte vosachtige uitdrukking. Gewicht meestal 1,5–3,5 kg. Dit is de meest "natuurlijke" verschijningsvorm zonder ademhalingsrisico.',
    pl: 'De beste keuze als je een gezonde snuit én de Pomeriaan-look wilt. Het verschil met een bear face is pas goed zichtbaar rond 4–5 maanden — veel "bear face" pups blijken later fox face te zijn.',
    img: '/assets/img/pomeriaan-640.webp'
  },
  'babydoll': {
    t: 'Baby Doll Face',
    d: 'Korte snuit maar níet plat: een klein, speels gezicht met grote ogen en zachte wangen — het midden tussen bear en fox face. Vaak het favoriete "showtype" in Europa.',
    pl: 'Een gezonde tussenweg: korter dan een vossengezicht, maar zonder de risico\'s van een extreem plat gezicht.',
    img: '/assets/img/pomeriaan-640.webp'
  },
  'toy': {
    t: 'Toy Face ("kleine neus")',
    d: 'Term die fokkers gebruiken voor een miniatuur-uitstraling: kleiner, compacter gezicht met een korte stompe neus en grote ronde ogen. Let op: "toy" is geen officiële rasstandaard-klasse; het wordt vaak gebruikt als marketingterm.',
    pl: 'Vraag altijd om de officiële stamboom en stamboekregistratie. Een "toy face" pup die nog moet uitgroeien kan als volwassene heel anders uitvallen.',
    img: '/assets/img/pomeriaan-640.webp'
  }
};

const GROUPS = [
  ['1 · Herders & veedrijvers', 'Herdershonden, veewerkshonden (bijv. Duitse Herder, Border Collie, Bouvier)'],
  ['2 · Pinschers & doggen', 'Pinscher, Schnauzer, Mastiff, Berner Sennen, Duitse Dog'],
  ['3 · Terriërs', 'Jack Russell, Staffordshire Bull Terriër, West Highland White'],
  ['4 · Dashonden', 'Teckel (lang-, korthaar, ruighaar)'],
  ['5 · Spitsen & oertypes', 'Pomeriaan, Chow Chow, Husky, Samojeed, Akita'],
  ['6 · Lopende honden', 'Beagle, Basset, Bloedhond'],
  ['7 · Staande honden', 'Pointer, Setters, Duitse Staande Hond'],
  ['8 · Retrievers & waterhonden', 'Labrador, Golden Retriever, Poedel, Portugese Waterhond'],
  ['9 · Gezelschapshonden', 'Maltezer, Chihuahua, Shih Tzu, Cavalier King Charles'],
  ['10 · Windhonden', 'Greyhound, Whippet, Afghaanse Windhond, Saluki']
];

export function rassenPage() {
  return pageShell({
    title: 'Rassen & variëteiten: Pomeriaan bear face, toy face, kleine neus en meer | TrimGids',
    description: 'Wat is het verschil tussen een Pomeriaan bear face, fox face, baby doll en toy face? Wat betekent een "kleine neus" (brachycefaal) en welke kortsnuitige rassen hebben extra risico?',
    canonical: '/rassen',
    active: 'rassen',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Rassen &amp; variëteiten</p>
<div class="hero">
  <span class="eyebrow">Eén ras · veel verschijningsvormen</span>
  <h1>Rassen, variëteiten en "gezichten": van Pomeriaan tot korte neus</h1>
  <p class="intro">Binnen één ras bestaan vaak verschillende types: een Pomeriaan kan een fox face, bear face, baby doll of "toy face" zijn. En die "schattige kleine neus" heeft een medische naam — brachycefalie — met echte gezondheidsgevolgen. Daarom deze gids: wat betekent het, waar let je op en welke rassen zijn kortsnuitig?</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">10 groepen</strong><p>FCI verdeelt rassen in 10 groepen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">340+</strong><p>erkende rassen wereldwijd (FCI)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">4–5 mnd</strong><p>krijgt een Pomeriaan z'n echte gezicht</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">⅓</strong><p>snuitlengte = ondergrens die fokkers moeten respecteren</p></div>
  </div>
</div>

<section class="sec">
  <h2>🐻 Pomeriaan: bear face, fox face, baby doll of toy face?</h2>
  <p class="sub">Het "ras" Pomeriaan kent verschillende <strong>verschijningsvormen</strong> — geen officiële subrassen: fokkers en handelaren geven ze eigen namen. Klik door de varianten en zie wat het verschil betekent voor gezondheid en aankoop.</p>
  <div class="varrow" id="varrow">
    <button data-v="bear" class="on">🐻 Bear Face</button>
    <button data-v="fox">🦊 Fox Face</button>
    <button data-v="babydoll">👶 Baby Doll</button>
    <button data-v="toy">🧸 Toy Face / kleine neus</button>
  </div>
  <div class="variant">
    <img id="var-img" src="/assets/img/pomeriaan-640.webp" alt="Pomeriaan" width="640" height="640" loading="lazy" decoding="async">
    <div>
      <h3 id="var-t" style="font-size:20px"></h3>
      <p id="var-d" style="color:var(--muted);font-size:14.5px"></p>
      <p class="watch" id="var-p" style="border-left:4px solid var(--em);background:rgba(16,185,129,.05);border-radius:12px;padding:12px 14px;font-size:13.5px;margin-top:10px"></p>
      <div class="face">
        <figure><img src="/assets/img/pomeriaan-640.webp" alt="Pomeriaan met menselijke kleurenweergave" loading="lazy" decoding="async"><figcaption>Menselijk oog</figcaption></figure>
        <figure><img src="/assets/img/pomeriaan-hondzien.webp" alt="Zelfde Pomeriaan door hondenogen (geel-blauw)" loading="lazy" decoding="async"><figcaption>Zo ziet je hond je</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <h2>👃 "Kleine neus" = brachycefaal: wat betekent dat?</h2>
  <p class="sub">Een verkorte snuit heet in vaktermen <strong>brachycefaal</strong> (Grieks: kort hoofd). Door de ingekorte luchtwegen kan het moeilijker ademhalen. Niet elke kortsnuitige hond heeft klachten — maar de kans neemt toe naarmate de snuit korter wordt.</p>
  <div class="snuit">
    <div>
      <label style="font-weight:800;font-size:14px">Snuitlengte: <strong id="sn-fold">normaal</strong></label>
      <input id="snr" type="range" min="0" max="100" value="80" aria-label="Snuitlengte">
    </div>
    <div class="r" id="snuit-out"><b>Normale snuit</b><p>Goede ademhaling, normale inspanning en luchtwegen. Dit is de richting die fokkers wereldwijd aanmoedigen.</p></div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>⚠️ Kortsnuitige rassen (risk)</h3><p>Franse Bulldog, Mopshond, Engelse Bulldog, Boston Terriër, Pekingees, Shih Tzu, Boxer, Cavalier King Charles (mild) en sommige lijnen van de Dwerghond. Kijk ook naar <a href="/aankoopgids" style="color:var(--g);font-weight:700">onze aankoopgids</a>.</p></div>
    <div class="card"><h3>🫁 Wat kan er misgaan?</h3><p>Snurken, benauwdheid bij inspanning, kokhalsneigingen, slecht slapen en oververhitting (hijgen werkt slechter). Bij ernstige BOAS kan een operatie aan neusgaten en gehemelte nodig zijn.</p></div>
    <div class="card"><h3>💡 Waar let je op bij aankoop?</h3><p>Vraag de fokker naar de snuit/schedelverhouding, zie de ouderdieren (beide!), en leer je hond op gewicht en conditie te houden. Kortsnuitige honden hebben extra bescherming nodig bij warmte en vliegreizen.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🗂️ 10 FCI-groepen: de wereldkaart van hondenrassen</h2>
  <p class="sub">De FCI (Fédération Cynologique Internationale) erkent wereldwijd honderden rassen en groepeert ze naar functie en afstamming. Nederland werkt hiervoor samen met de Raad van Beheer en de FCI-instantie Nederland (via de rasverenigingen).</p>
  <div class="groups">
    ${GROUPS.map(g => `<div class="gr"><b>${g[0]}</b><span>${g[1]}</span></div>`).join('')}
  </div>
  <p style="font-size:13px;color:var(--muted);margin-top:10px">Wist je dat: niet alle "rassen" officieel erkend zijn. Zonder erkende stamboom (bijv. FCI/NHSB) is er geen officiële raskenmerken-standaard — belangrijk bij de aankoop van een pup. Zie: <a href="/fokkers" style="color:var(--g);font-weight:700">fokkergids</a>.</p>
</section>

<section class="sec">
  <h2>📏 Klein, middelgroot of groot — en wat betekent dat?</h2>
  <div class="grid g3">
    <div class="card"><h3>🐕 Klein (&lt; 10 kg)</h3><p>Maltezer, Chihuahua, Dwergpincher, Toy Poedel. Meestal makkelijk mee te nemen, langere levensverwachting (±12–15 jr), maar kwetsbaar voor letsel (trappen, grote honden), gebitsproblemen en luchtpijp-klachten bij halsbanden.</p></div>
    <div class="card"><h3>🐕‍🦺 Middelgroot (10–25 kg)</h3><p>Beagle, Cocker Spaniël, Labrador, Franse Bulldog (wel kortsnuitig!). Meestal de "gouden middenweg" qua energie, gezondheid en levensverwachting (±10–13 jr).</p></div>
    <div class="card"><h3>🐕‍🦺🦮 Groot (&gt; 25 kg)</h3><p>Duitse Herder, Golden, Berner Sennen, Duitse Dog, Ierse Wolfshond. Veel karakter en bescherming, maar hogere kosten, kortere levensverwachting (±6–10 jr) en meer kans op gewrichts- en hartproblemen.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/aankoopgids">🐾 Aankoopgids: 16 rassen met vacht & kosten →</a>
    <a class="btn ghost" href="/verboden-rassen">⚖️ Welke rassen zijn (bijna) verboden? →</a>
  </div>
</section>

<script>
(function () {
  var V = ${JSON.stringify(VARIANTS)};
  var row = document.getElementById('varrow');
  function show(key) {
    var v = V[key];
    document.getElementById('var-t').textContent = v.t;
    document.getElementById('var-d').textContent = v.d;
    document.getElementById('var-p').textContent = '⚠️ Aankoopwijzer: ' + v.pl;
    document.getElementById('var-img').src = v.img;
  }
  row.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    row.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    show(b.getAttribute('data-v'));
  });
  show('bear');

  var snr = document.getElementById('snr'), out = document.getElementById('snuit-out'), lab = document.getElementById('sn-fold');
  function snuit() {
    var v = +snr.value;
    if (v >= 70) { lab.textContent = 'normaal'; out.innerHTML = '<b>Normale snuit</b><p>Goede ademhaling, normale inspanning. Dit is de richting die fokkers wereldwijd aanmoedigen.</p>'; }
    else if (v >= 45) { lab.textContent = 'kort'; out.innerHTML = '<b>Korte snuit</b><p>Licht brachycefaal: kan snurken en sneller hijgen bij inspanning. Vraag naar BOAS-screening en gewichtscontrole.</p>'; }
    else if (v >= 20) { lab.textContent = 'zeer kort'; out.innerHTML = '<b>Zeer korte snuit (brachycefaal)</b><p>Verhoogd risico op benauwdheid, oververhitting en operaties (BOAS). Extra voorzichtig bij warmte, sport en vliegen.</p>'; }
    else { lab.textContent = 'extreem plat'; out.innerHTML = '<b>Extreem plat gezicht</b><p>Hoog risico op chronische ademhalingsproblemen. Zoek een fokker die juist voor een langere snuit fokt — de wet verbiedt fokken met honden die te kortsnuitig zijn.</p>'; }
  }
  snr.addEventListener('input', snuit); snuit();
})();
</script>`
  });
}
