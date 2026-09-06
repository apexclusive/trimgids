/* Pagina: Geschiedenis van de hond — domesticatie, Pomeriaan-herkomst, couperen, hondenvlees. */
import { pageShell } from './base.mjs';

const CSS = `
.tier{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
.tier .t{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.tier .t b{font-size:20px;color:var(--g);display:block}
.tier .t span{font-size:12.5px;color:var(--muted);font-weight:700}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.two .card{height:100%}
.vlees-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:12px}
.vlees-grid .v{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.vlees-grid .v h3{font-size:15px;margin-bottom:4px}
.vlees-grid .v p{font-size:13px;color:var(--muted)}
@media(max-width:760px){.two{grid-template-columns:1fr}}
`;

export function geschiedenisPage() {
  return pageShell({
    title: 'Geschiedenis van de hond: van wolf tot Pomeriaan — en waarom staarten werden gecoupeerd | TrimGids',
    description: 'Waar komt de hond vandaan, waar komt de Pomeriaan oorspronkelijk vandaan, waarom werden staarten en oren afgeknipt en waarom is dat nu verboden? Plus: waarom honden in sommige landen op het menu staan.',
    canonical: '/geschiedenis-hond',
    active: 'geschiedenis-hond',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Geschiedenis van de hond</p>
<div class="hero">
  <span class="eyebrow">Van wolf tot bankhond</span>
  <h1>De geschiedenis van de hond — en waarom zijn staarten vroeger afgeknipt?</h1>
  <p class="intro">De hond is het oudste gedomesticeerde dier: al ±15.000–40.000 jaar geleden kozen wolven voor het kampvuur van de mens. Daarna bouwden wij honderden rassen — en begonnen we ook ingrepen te doen zoals het couperen van staarten en oren. Hier het volledige verhaal, van de Pomeriaan in Pommeren tot de vraag waarom honden in sommige landen op de menukaart staan.</p>
  <div class="tier">
    <div class="t"><b>±15–40k jr</b><span>domesticatie van de wolf</span></div>
    <div class="t"><b>±4.000 jr</b><span>eerste 'rashonden' (o.a. in Mesopotamië)</span></div>
    <div class="t"><b>1767</b><span>Queen Charlotte neemt Pomeriaan mee naar Engeland</span></div>
    <div class="t"><b>1888</b><span>Queen Victoria fokt de Pomeriaan klein</span></div>
    <div class="t"><b>2001</b><span>Nederland verbiedt staartcouperen</span></div>
    <div class="t"><b>2027</b><span>Zuid-Korea verbiedt de hondenvleesindustrie</span></div>
  </div>
</div>

<section class="sec">
  <h2>🐺 Van wolf naar hond: hoe is dat gebeurd?</h2>
  <p class="sub">Er zijn twee grote theorieën — en allebei zijn waarschijnlijk een stukje waar.</p>
  <div class="two">
    <div class="card"><h3>🔥 Zelf-domesticatie</h3><p>De meest gangbare theorie: wolven kwamen vanzelf naar menselijke nederzettingen voor etensresten. De tamste, minst bange wolven kregen het beste te eten en plantten zich voort — generatie na generatie werden ze milder. De mens hoefde niets te doen.</p></div>
    <div class="card"><h3>🎯 Actieve selectie</h3><p>Daarnaast is er duidelijk bewijs dat mensen wolven bewust grootbrachten voor de jacht en het bewaken. Die selectie versnelde de verandering: kleinere schedel, kortere snuit, gevlekte vacht en uiteindelijk gedrag dat op menselijke gezichten en stemmen reageert.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Grappig feit:</strong> genetisch is de hond een ondersoort van de wolf (Canis lupus familiaris), maar honden en moderne wolven zijn bijna net zo verschillend als wij van een aap — het is dus vooral het gedrag dat hen 'menselijk' maakte.</p></div>
</section>

<section class="sec">
  <h2>🐻 Waar komt de Pomeriaan vandaan?</h2>
  <p class="sub">Niet uit Engeland — uit een streek die je op de kaart nog nauwelijks vindt.</p>
  <div class="grid g3">
    <div class="card"><h3>🗺️ Pommeren</h3><p>De naam komt van de Baltische regio <strong>Pommeren</strong> (Duits: Pommern), die nu verdeeld is tussen Polen en Duitsland, aan de Oostzee. De oorspronkelijke 'honden van Pommeren' waren spitsen van ±9–13 kg en werden gebruikt voor het hoeden van vee en het trekken van sleden.</p></div>
    <div class="card"><h3>👑 Queen Charlotte (1767)</h3><p>Koningin Charlotte bracht in 1767 de eerste twee keeshonden naar Engeland. Die wogen nog ±14–23 kg — bijna het formaat van een grote spits! De naam 'Pomeriaan' werd populair aan het Britse hof.</p></div>
    <div class="card"><h3>🎀 Queen Victoria (1888)</h3><p>Haar kleindochter Victoria werd verliefd op een klein exemplaar van ±5 kg. Ze importeerde mini-pomeriaantjes uit heel Europa en fokte erop dat ze steeds kleiner werden. Binnen enkele decennia ging het ras van ±9–13 kg naar de huidige <strong>±1,5–3,2 kg</strong>. Zónder dat fokprogramma was de kleine knuffel van vandaag er nooit geweest.</p></div>
  </div>
  <p style="font-size:13px;color:var(--muted);margin-top:10px">Lees ook: <a href="/rassen" style="color:var(--g);font-weight:700">de varianten van de Pomeriaan (bear/fox/toy face)</a> en <a href="/aankoopgids" style="color:var(--g);font-weight:700">de aankoopgids per ras</a>.</p>
</section>

<section class="sec">
  <h2>✂️ Waarom werden staarten en oren afgeknipt?</h2>
  <p class="sub">Couperen is het operatief verwijderen van een deel van de staart of oren. Het is eeuwenlang gedaan — om vier redenen die allemaal inmiddels achterhaald zijn.</p>
  <div class="grid g3">
    <div class="card"><h3>🛡️ Bescherming tegen hondsdolheid (Romeinen)</h3><p>De Romeinen geloofden dat het afknippen van de staart hondsdolheid voorkwam én dat het de rug zou versterken en de hond sneller maken. Het was een medisch bijgeloof, maar het werd eeuwenlang doorverteld.</p></div>
    <div class="card"><h3>⚔️ Vecht- en waakhonden</h3><p>Bij vechthonden en waakhonden werd gedacht dat oren en staart 'grijppunten' waren waar een tegenstander of roofdier (wolf!) je hond kon pakken. Vandaar ook de spijkers aan halsbanden. Maar het gevecht werd er niet eerlijker door — en de hond verloor zijn communicatiemiddel.</p></div>
    <div class="card"><h3>💰 Belastingontduiking (Engeland, tot 1796)</h3><p>In Engeland werd in 1796 een belasting op honden ingevoerd... en werkende honden waren vrijgesteld. Een gecoupeerde staart was het herkenningsteken van een 'werkhond', dus veel mensen lieten de staart knippen om belasting te besparen. De maatregel werd afgeschaft, maar de gewoonte bleef.</p></div>
    <div class="card"><h3>🌾 Praktisch bij herding & jacht</h3><p>Bij de kudde betekende een korte staart minder vuil en ontlasting in de vacht; bij de jacht minder kans op verwonding door takken en struiken. Een kwetsbare, kwispelende staart blesseert inderdaad snel — maar één goed opgeleide hond heeft dat niet nodig.</p></div>
    <div class="card"><h3>🎨 Cosmetiek (de laatste reden)</h3><p>Vanaf de 19e eeuw werd het vooral esthetisch: een bepaald 'type' moest er zo uitzien (boxers, dobermanns, terriërs, rottweilers). Dat is inmiddels de enige overgebleven reden — en die is geen enkele operatie waard.</p></div>
    <div class="card"><h3>⚖️ Waar is het verboden?</h3><p>Nederland: oren sinds 1 okt 1996, staarten sinds 1 sept 2001 verboden (Ingrepenbesluit). België: oren 2001, staarten 2006. Duitsland: 1989. In veel landen is couperen alleen nog om medische redenen toegestaan; in de EU mag een gecoupeerde hond niet meer op shows in landen met een verbod.</p></div>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>En de staart zelf?</strong> Een hond kwispelt om te communiceren: hoger en sneller = enthousiast, laag en langzaam = onzeker. Een gecoupeerde hond mist dit belangrijke non-verbale signaal — nog een reden waarom het verboden is.</p></div>
</section>

<section class="sec">
  <h2>🍽️ Waarom staan honden in sommige landen op de menukaart?</h2>
  <p class="sub">In het grootste deel van de wereld is hondenvlees uitzondering en taboe — maar in delen van Azië bestaat het als traditie. Dit zijn de feiten, zonder sensatie.</p>
  <div class="vlees-grid">
    <div class="v"><h3>🇰🇷 Zuid-Korea</h3><p>Het enige land met een industriële hondenvleesindustrie: ±1.150 boerderijen, ±1.600 restaurants en ±1–2,5 miljoen geslachte honden per jaar. Het parlement verbood de industrie in januari 2024; het verbod gaat in <strong>2027</strong> in (eten blijft formeel toegestaan).</p></div>
    <div class="v"><h3>🇨🇳 China & Vietnam</h3><p>Hondenvlees is regionaal bekend (bijv. het Yulin 'festival'), maar wordt vooral geassocieerd met armoede en hongersnood, niet met een eeuwenoude traditie. Grote delen van de bevolking — zeker jongeren — eten het niet en verzetten zich ertegen.</p></div>
    <div class="v"><h3>🌍 Elders</h3><p>Ook in Indonesië en sommige Afrikaanse landen wordt hondenvlees gegeten, vaak in regionale of rituele context. In Europa en Noord-Amerika is het wettelijk en cultureel taboe.</p></div>
    <div class="v"><h3>🤔 Waarom zijn honden hier 'heilig'?</h3><p>Niet omdat honden in Europa biologisch anders zijn — maar door onze cultuur: honden zijn als gezelschapsdieren 'familie' geworden, terwijl varkens en koeien dat niet zijn. In culturen waar honden geen gezelschapsrol hebben maar waak- of werkdieren zijn, is de grens anders. Belangrijk: juist in Aziatische landen groeit de tegenbeweging; het is geen statisch 'wij vs. zij'.</p></div>
    <div class="v"><h3>⚠️ Gezondheidsrisico</h3><p>De handel is ook een volksgezondheidsrisico: rabiës resistentie ondermijning, cholera, trichinellose en diefstal van huisdieren (veel 'vleeshonden' zijn gestolen huisdieren).</p></div>
    <div class="v"><h3>🥩 En in Nederland?</h3><p>Hondenvlees is hier al ruim honderd jaar taboe en sinds de Dierenbescherming (1877) actief bestreden. Honden en katten zijn gezelschapsdieren met een eigen wettelijke status.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/koninklijke-honden">👑 Honden van koningen &amp; royals →</a>
    <a class="btn ghost" href="/honden-cijfers">📊 Populaire rassen per decennium →</a>
  </div>
</section>`
  });
}
