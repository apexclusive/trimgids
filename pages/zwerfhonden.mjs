/* Pagina: Zwerfhonden wereldwijd — aantallen, oorzaken en wat jij kunt doen.
   Interactief: "kies jouw actie"-kaarten + cijferdashboards. */
import { pageShell } from './base.mjs';

const CSS = `
.stray-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:14px}
.stray-stats .s{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;text-align:center}
.stray-stats .s b{font-size:26px;color:var(--g);display:block}
.stray-stats .s span{font-size:13px;color:var(--muted);font-weight:700}
.acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}
.act{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:20px;box-shadow:var(--shadow);position:relative;cursor:pointer;transition:transform .2s}
.act:hover{transform:translateY(-3px);border-color:var(--em)}
.act .ic{font-size:30px}
.act h3{font-size:16.5px;margin:8px 0 4px}
.act p{font-size:13.5px;color:var(--muted)}
.act .on-badge{font-size:11.5px;font-weight:800;color:var(--g);background:rgba(16,185,129,.1);border-radius:99px;padding:4px 10px;display:inline-block}
.act .donation-note{margin-top:10px;font-size:12px;color:var(--muted);font-style:italic}
.causes{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:14px}
.cause{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.cause h3{font-size:15px;margin-bottom:4px}
.cause p{font-size:13px;color:var(--muted)}
`;

export function zwerfhondenPage() {
  return pageShell({
    title: 'Zwerfhonden wereldwijd: aantallen en wat wij eraan kunnen doen | TrimGids',
    description: 'Hoeveel zwerfhonden zijn er wereldwijd (200–600 miljoen, afhankelijk van definitie), waar komen ze vandaan en wat kun jij doen? Adoptie, sterilisatieprogramma\u2019s, hulp en eerlijke cijfers.',
    canonical: '/zwerfhonden',
    active: 'zwerfhonden',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Zwerfhonden</p>
<div class="hero">
  <span class="eyebrow">Wereldwijd probleem · lokale oplossing</span>
  <h1>Hoeveel zwerfhonden zijn er — en kunnen wij er iets aan doen?</h1>
  <p class="intro">Het eerlijke antwoord: niemand weet het exact, want de meeste landen registeren honden niet. Schattingen lopen uiteen van <strong>±200 miljoen</strong> (veelgebruikte schatting) tot <strong>±600 miljoen</strong> (bredere definitie van LICG). Wat wél zeker is: het grootste deel is geen 'wilde' hond, maar een hond van een eigenaar die geen verantwoorde zorg kreeg.</p>
  <div class="stray-stats">
    <div class="s"><b>±200–600 mln</b><span>zwerfhonden wereldwijd (definitie-afhankelijk)</span></div>
    <div class="s"><b>±20 mln</b><span>alleen al in India (veel schattingen)</span></div>
    <div class="s"><b>0</b><span>echte zwerfhondenpopulatie in Nederland</span></div>
    <div class="s"><b>±70%</b><span>komt in NL-asielen uit eigen land (afstand of achtergelaten)</span></div>
  </div>
</div>

<section class="sec">
  <h2>🔎 Zwerf- of verwilderd? Het verschil bepaalt de aanpak</h2>
  <div class="grid g3">
    <div class="card"><h3>🐾 Zwerfhond (stray)</h3><p>Een hond die ooit een thuis had of van mensen afhankelijk is, maar los rondloopt: sociaal, zoekt menselijk contact, eet uit de buurt van mensen. Dit is de grote meerderheid en de groep die opvang en adoptie kan helpen.</p></div>
    <div class="card"><h3>🐺 Verwilderd (feral)</h3><p>Honden die generaties lang zonder mensen leven: schuw, leven in roedels, jagen zelf. Kleine minderheid in stedelijke gebieden, vaker op het platteland. Voor deze groep werkt sterilisatie + voeren op vaste plekken beter dan vangen.</p></div>
    <div class="card"><h3>🏠 In Nederland</h3><p>Er is geen zwerfhondenpopulatie. De honden in Nederlandse asielen komen vooral uit eigen land (afstand, achtergelaten, weggelopen) en uit buitenlandse opvangprojecten — zie onze <a href="/adoptie" style="color:var(--g);font-weight:700">adoptiegids</a>.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🧩 Waarom zijn er zoveel zwerfhonden?</h2>
  <div class="causes">
    <div class="cause"><h3>Geen registratie & castratie</h3><p>Zonder chip, belasting of sterilisatieplicht blijven honden zich eindeloos voortplanten — de kern van het probleem.</p></div>
    <div class="cause"><h3>Armoede & hongersnood</h3><p>In veel landen is een hond een kostenpost die men niet kan dragen; honden worden losgelaten of achtergelaten bij verhuizing.</p></div>
    <div class="cause"><h3>Natuurrampen & conflicten</h3><p>Overstromingen, oorlogen en crises laten hele hondenpopulaties achter zonder eigenaar.</p></div>
    <div class="cause"><h3>Gebrek aan voorlichting</h3><p>Waar 'verantwoordelijk hondenbezit' geen begrip is, worden pups van straathonden niet gesocialiseerd en blijven ze in de kwetsbare cyclus.</p></div>
    <div class="cause"><h3>De hondenhandel</h3><p>Gebrek aan handhaving maakt honden kwetsbaar voor illegale fok, gestolen huisdieren en de vleeshandel; elke vermiste hond wordt een potentiële straathond.</p></div>
    <div class="cause"><h3>Dierenwelzijn als luxe</h3><p>In landen zonder welzijnswet of uitvoeringscapaciteit hangt het lot van een hond volledig van individuen af.</p></div>
  </div>
</section>

<section class="sec">
  <h2>💪 Wat kunnen wij eraan doen? Kies jouw actie</h2>
  <p class="sub">Klik een actie aan en zie wat die écht oplevert — groot of klein, alles telt. De meeste oplossingen werken via dezelfde drie pijlers: <strong>voorkomen</strong> (sterilisatie), <strong>verzorgen</strong> (opvang/hulp) en <strong>bewust kiezen</strong> (adopteren i.p.v. kopen).</p>
  <div class="acts" id="acts">
    <div class="act" data-a="adoptie"><div class="ic">🏠</div><h3>1. Adopteer &amp; geen 'koopimpuls'</h3><p>Adoptie uit een asiel (NL of een goed buitenlandproject) geeft een hond een thuis én schept geen nieuwe vraag naar fok. Het is de meest directe actie.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
    <div class="act" data-a="sterilisatie"><div class="ic">✂️</div><h3>2. Steun sterilisatieprogramma's</h3><p>Castro/steriliseer je eigen hond en doneer aan orga­nisaties die straathonden steriliseren (TNR: trap-neuter-return). Eén sterilisatie voorkomt generaties nesten.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
    <div class="act" data-a="vrijwilliger"><div class="ic">🤝</div><h3>3. Word vrijwilliger</h3><p>In Nederland kun je al helpen bij asiel, ambulances en opvang. Ga naar onze <a href="/vrijwilligers" style="color:var(--g);font-weight:700">vrijwilligersgids</a> en meld je aan.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
    <div class="act" data-a="steun"><div class="ic">📣</div><h3>4. Steun lokale helpende organisaties</h3><p>Klein geld, in een goed project: voerprogramma's, vaccinatie en castratie op straat, opvanghuisjes. Check altijd waar je geld terechtkomt.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
    <div class="act" data-a="bezit"><div class="ic">🧠</div><h3>5. Wees een verantwoord baasje</h3><p>Chip & registratie, castratie, training én nooit zomaar een pup kopen. Zo help je het probleem bij de wortel — lees onze <a href="/chippen-ontwormen" style="color:var(--g);font-weight:700">chipgids</a>.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
    <div class="act" data-a="delen"><div class="ic">📣</div><h3>6. Deel &amp; informeer</h3><p>Praat over zwerfhonden zonder sensatie: feiten (aantallen, oplossingen) en cijfers delen helpt meer dan foto's die alleen emotie opwekken.</p><span class="on-badge" style="display:none">✓ Jouw bijdrage</span></div>
  </div>
  <div class="quote" style="margin-top:16px" id="act-uitkomst"><p><strong>Kies een actie hierboven</strong> om te zien wat die bijdraagt — en begin vandaag met één ervan.</p></div>
</section>

<section class="sec">
  <h2>📊 Feiten & twijfels</h2>
  <div class="grid g3">
    <div class="card"><h3>Waarom verschillen de cijfers?</h3><p>De ene schatting (WHO/WSPA-lijn) telt alleen honden zonder eigenaar in stedelijke gebieden; andere bronnen tellen ook verwilderde honden op het platteland mee. Vandaar 200 tot 600 miljoen — beide zijn indicaties, geen tellingen.</p></div>
    <div class="card"><h3>Werkt adoptie uit het buitenland?</h3><p>Ja — mits goed georganiseerd: gescreend, gevaccineerd, gechipt en met verlof. Nederland haalt jaarlijks duizenden honden uit Zuid-Europese projecten. Wees eerlijk over de risico's: lees onze <a href="/adoptie" style="color:var(--g);font-weight:700">adoptiegids</a>.</p></div>
    <div class="card"><h3>Kan Nederland het oplossen?</h3><p>Niet alleen; maar Nederland kan normen zetten: sterke wetgeving, goede asielen, respect voor internationale samenwerking. En elke baas die verantwoord houdt, is een wereld van verschil.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/adoptie">🏠 Pup of asielhond? De eerlijke vergelijking →</a>
    <a class="btn ghost" href="/honden-cijfers">📊 Hoeveel honden zijn er, geboren en gestorven? →</a>
  </div>
</section>

<script>
(function () {
  var uit = {
    'adoptie': '🏠 <strong>Adoptie is de meest directe hulp:</strong> elk geadopteerd dier is er één minder in het systeem. In Nederland komen ±70% van de asielhonden uit eigen land; buitenlandse honden komen via gescreende projecten. Lees verder in de <a href="/adoptie" style="color:var(--g);font-weight:700">adoptiegids</a>.',
    'sterilisatie': '✂️ <strong>Preventie is de kern:</strong> één ongecastreerde straathond kan per jaar meerdere nesten krijgen; sterilisatieprogramma\u2019s (TNR) zijn wereldwijd bewezen de effectiefste en goedkoopste aanpak. Laat ook je eigen hond overwegen — vraag je dierenarts om advies.',
    'vrijwilliger': '🤝 <strong>Dichtbij helpen:</strong> asielen, dierenambulances en opvangprojecten zoeken altijd vrijwilligers — 2 à 8 uur per week maakt al verschil. Bekijk de <a href="/vrijwilligers" style="color:var(--g);font-weight:700">vrijwilligersgids</a> en meld je vrijblijvend aan.',
    'steun': '📣 <strong>Geld werkt — mits goed besteed:</strong> zoek organisaties met transparante jaarverslagen, lokale partners en focus op castratie/vaccinatie. Liever één goed project dan tien goedkope.',
    'bezit': '🧠 <strong>Preventie begint bij jou:</strong> chip + registratie, castratie, training en bewuste aankoop. Zie ook onze <a href="/chippen-ontwormen" style="color:var(--g);font-weight:700">chip- & ontwormgids</a> en <a href="/verboden-rassen" style="color:var(--g);font-weight:700">ongewenste fok</a>.',
    'delen': '📣 <strong>Informatie is macht:</strong> deel feiten — aantallen, oorzaken en oplossingen — in plaats van alleen emotie. Hoe meer mensen weten dat sterilisatie werkt, hoe sneller het probleem krimpt.'
  };
  var cards = document.querySelectorAll('#acts .act');
  var out = document.getElementById('act-uitkomst');
  cards.forEach(function (c) {
    c.addEventListener('click', function () {
      cards.forEach(function (x) { x.querySelector('.on-badge').style.display = 'none'; });
      c.querySelector('.on-badge').style.display = 'inline-block';
      out.innerHTML = '<p>' + uit[c.getAttribute('data-a')] + '</p>';
    });
  });
})();
</script>`
  });
}
