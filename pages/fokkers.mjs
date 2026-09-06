/* Pagina: Fokkers in Nederland — erkend vs niet-erkend, waar je moet letten. */
import { pageShell, esc } from './base.mjs';

const CSS = `
.checkbar{background:var(--card);border:1px solid var(--line);border-radius:999px;height:12px;overflow:hidden;margin:12px 0 16px}
.checkbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--em),#34d399);transition:width .3s ease}
.flags{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px}
.flags .card{border-left:4px solid #fca5a5}
.flags .card li::before{content:"✕";color:#dc2626}
.brandrow{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}
.brandrow a{background:var(--card);border:1px solid var(--line);padding:12px 18px;border-radius:16px;font-weight:800;font-size:14px;color:var(--g);box-shadow:var(--shadow)}
.brandrow a small{display:block;font-weight:600;color:var(--muted);font-size:12px}
.qas{display:grid;gap:10px}
.qa{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.qa b{display:block;margin-bottom:5px}
.qa p{font-size:14px;color:var(--muted)}
.qa .why{font-size:12.5px;font-weight:700;color:var(--g);margin-top:6px}
`;

const HEALTH = {
  'pomeriaan': 'Patella (knie), oogonderzoek, gebit & luchtwegen (dwergras); klinisch: alopecia X waarschuwen',
  'labradoodle': 'DNA: prcd-PRA, EIC; HD/ED-röntgenouders; MDR1 bij collie-afstamming',
  'poedel': 'DNA: PRA; HD/ED, patella, ogen, von Willebrand (toy/mini)',
  'goldendoodle': 'DNA: PRA, EIC, MDR1; HD/ED van de ouderdieren',
  'cockapoo': 'Patella, ogen (PRA), hartauscultatie',
  'maltezer': 'Patella, ogen (PRA), hartonderzoek',
  'shih-tzu': 'Brachycefaal: ademhaling/BOAS-beoordeling, ogen & traanbuizen, patella, nieren',
  'yorkshire-terrier': 'Patella, ogen, portosystemische shunt (klinisch), luchtpijp (klinisch)',
  'teckel': '⭐ Röntgen rug/wervels (IVDD) hartstikke belangrijk!, HD, ogen, DNA PRA',
  'golden-retriever': 'HD/ED-röntgen, jaarlijks oogonderzoek, hart, DNA: GR-PRA; hypothyreoïdie-panel',
  'chihuahua': 'Patella, open fontanel (klinisch), hart (mitralisklep), ogen',
  'cavalier-king-charles': '⭐ Hart (MRI/auscultatie MVDD) & syringomyelia (SM/CM-MRI) zijn hét rasprobleem',
  'border-collie': 'DNA: CEA (oogafwijking), MDR1, CL; HD, oogonderzoek',
  'berner-sennen': 'HD/ED, oogonderzoek, DNA: degeneratieve myelopathie (DM), nierpanel',
  'schnauzer': 'Ogen (PRA/cataract), HD, nieren; mini: hart',
  'franse-bulldog': '⭐ BOAS-ademhalingscheck (kortneus!), HD, patella, wervels/IVDD, ogen'
};

export function fokkersPage() {
  const rows = Object.entries(HEALTH).map(([slug, tests]) => {
    const name = { 'yorkshire-terrier': 'Yorkshire Terrier', 'cavalier-king-charles': 'Cavalier King Charles', 'berner-sennen': 'Berner Sennenhond', 'franse-bulldog': 'Franse Bulldog', 'border-collie': 'Border Collie' }[slug] || slug;
    return `<tr><td><a href="/aankoopgids#${esc(slug)}" style="color:var(--g);font-weight:800">${esc(name)}</a></td><td>${esc(tests)}</td></tr>`;
  }).join('');

  return pageShell({
    title: 'Fokkers in Nederland: erkend of niet? Waar je op moet letten | TrimGids',
    description: 'Erkende fokkers in Nederland herkennen: Raad van Beheer, FCI-stamboom, DNA en chippen, gezondheidsonderzoeken, checklist, rode vlaggen en de juiste vragen aan een fokker.',
    canonical: '/fokkers',
    active: 'fokkers',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Fokkers in Nederland</p>
<div class="hero">
  <span class="eyebrow">Verantwoord kopen begint hier</span>
  <h1>Fokkers in Nederland: erkend of niet-erkend?</h1>
  <p class="intro">Een pup kopen is een beslissing voor 10–15 jaar. De makkelijkste manier om de kans op een gezonde, stabiele hond te vergroten? Koop bij een <strong>erkende fokker</strong> — en weet wat erkend betekent. Deze gids legt het verschil uit, toont waar je officieel geregistreerde fokkers vindt en geeft een checklist die je kunt afvinken.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Min. 8 weken</strong><p>leeftijd voordat een pup naar huis mag</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">1 ras</strong><p>serieuze fokkers fokken één ras, niet alles</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">100%</strong><p>DNA-afstammingscontrole bij RvB-stamboom</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0</strong><p>goede fokkers die je niet op bezoek laten komen</p></div>
  </div>
</div>

<section class="sec">
  <h2>⚖️ Erkend vs. niet-erkend: het verschil in 1 oogopslag</h2>
  <p class="sub">"Erkend" betekent in Nederland dat een fokker werkt volgens de regels van de <strong>Raad van Beheer op Kynologisch Gebied</strong> (RvB) en de bijbehorende rasvereniging — en dat de pups worden opgenomen in het <strong>NHSB</strong>, het Nederlandse stamboek dat door de <strong>FCI</strong> wordt erkend.</p>
  <div class="compare">
    <div class="ok"><h3>✅ Erkende (RvB/FCI) fokker</h3><ul>
      <li>Meldt het nest binnen 1 week aan bij de RvB</li>
      <li>Nestcontrole, chippen en DNA-afname door de buitendienst</li>
      <li>DNA-afstammingscontrole: wie de ouders zijn, is bewezen</li>
      <li>Ouderdieren met uitslagen (HD/ED, ogen, DNA-tests per ras)</li>
      <li>Pups gaan met ±8–10 weken weg, nooit eerder</li>
      <li>Kennel alleen bij de RvB geregistreerd; aangesloten bij de rasvereniging</li>
      <li>Stamboomcertificaat (hoogste eisen) of afstammingsbewijs</li>
      <li>Wettelijk geregistreerd in een door de overheid erkend portaal (Databankhonden.nl)</li>
      <li>Neemt tijd voor jou, stelt vragen en wil je levensstijl kennen</li>
    </ul></div>
    <div class="no"><h3>🚫 Niet-erkende "vermenigvulder"</h3><ul>
      <li>Advertenties op marktplaats/socials, geen bezoek mogelijk</li>
      <li>Pups 'klaar' op 6 weken, vaak nog niet gechipt</li>
      <li>Geen stamboom, of een 'papier' van een niet-FCI-organisatie</li>
      <li>Geen enkele gezondheidsuitslag van de ouderdieren</li>
      <li>Meerdere rassen tegelijk, meerdere nesten per jaar</li>
      <li>Moeder niet te zien of 'op vakantie' / kennel-taboe</li>
      <li>Geen vragen over jou — het gaat alleen om het geld</li>
      <li>Buitenlandse pups zonder EXPORT-stamboom (niet in te schrijven)</li>
      <li>Duidelijke beloften zoals "100% hypoallergeen" of "allergiehond"</li>
    </ul></div>
  </div>
  <div class="quote" style="margin-top:16px"><p><strong>Let op:</strong> een afstammingsbewijs van een organisatie die <strong>niet</strong> door de FCI is erkend, wordt nergens geaccepteerd. Koop je een pup uit het buitenland, dan moet de stamboom een officiële <em>EXPORT-pedigree</em> zijn, anders kun je de hond niet laten inschrijven.</p><footer><a href="https://www.raadvanbeheer.nl" target="_blank" rel="noopener noreferrer">raadvanbeheer.nl ↗</a> · <a href="https://www.fci.be" target="_blank" rel="noopener noreferrer">fci.be ↗</a></footer></div>
</section>

<section class="sec">
  <h2>📍 Waar vind je erkende fokkers in Nederland?</h2>
  <p class="sub">Drie officiële routes. Koop nooit blind via een advertentie — begin hier:</p>
  <div class="grid g3">
    <div class="card"><h3>1. Raad van Beheer</h3><p>Overkoepelende instantie voor rashonden in Nederland; lid van de FCI. Via hun register zie je erkende kennels, stamboekprocedures en de regels per ras.</p><p style="margin-top:8px"><a href="https://www.raadvanbeheer.nl" target="_blank" rel="noopener noreferrer">raadvanbeheer.nl ↗</a></p></div>
    <div class="card"><h3>2. Houden van Honden</h3><p>De officiële publiekssite van de RvB met een <strong>lijst van geregistreerde fokkers die pups te koop aanbieden</strong>. Hier kun je ook de wettelijke registratie (Databankhonden.nl) controleren.</p><p style="margin-top:8px"><a href="https://www.houdenvanhonden.nl" target="_blank" rel="noopener noreferrer">houdenvanhonden.nl ↗</a></p></div>
    <div class="card"><h3>3. De rasvereniging</h3><p>Elk erkend ras heeft een Nederlandse rasvereniging met fokkerslijsten, fokreglement en uitslagen van gezondheidsonderzoeken. Zoek 'rasvereniging' + je rasnaam.</p><p style="margin-top:8px"><a href="https://www.fci.be" target="_blank" rel="noopener noreferrer">FCI-rasindex ↗</a></p></div>
  </div>
  <div class="card" style="margin-top:16px"><p><strong>👀 Ter controle:</strong> sites die zelf een "erkende fokkers"-lijst tonen (zoals voorbeelden uit de puppywereld) horen een kopie van de <em>kennelregistratie bij de Raad van Beheer</em> te hebben aangeleverd. Dubbelcheck de papieren van pup én ouderdieren altijd zelf — bij de fokker thuis, op naam en met chipnummer.</p></div>
</section>

<section class="sec">
  <h2>✅ Checklist: 10 checkpunten vóór je een pup koopt</h2>
  <p class="sub">Vink af — jouw voortgang wordt automatisch bewaard (localStorage).</p>
  <div class="checkbar"><i id="breeder-progress"></i></div>
  <div class="checklist" id="breeder-checklist">
    <label class="check"><input type="checkbox"><span><b>Kennelregistratie & rasvereniging</b><small>Vraag het kennelregistratienummer van de RvB en de rasvereniging; zoek het na op hun sites.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Stamboom of afstammingsbewijs</b><small>NHSB/FCI-erkend. Buitenlands? Eis een EXPORT-pedigree, anders niet in te schrijven.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Gezondheidsuitslagen van beide ouders</b><small>HD/ED-röntgen, oogonderzoek en de DNA-testen die voor het ras gelden (zie tabel hieronder).</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Bezoek aan huis, moeder aanwezig</b><small>Een goede fokker laat je de moeder, het nest en de leefomgeving zien.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Leeftijd ≥ 8 weken</b><small>Pups gaan nooit eerder weg (7 weken = rode vlag; 8–10 weken is normaal).</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Gechipt + geregistreerd</b><small>Controleer of chip geregistreerd is bij een erkend portaal (Databankhonden.nl) en vraag het paspoort.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>De fokker stelt vragen aan jou</b><small>Woonruimte, ervaring, tijd, gezinssituatie: hij checkt jou net zo goed als jij hem.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Koopcontract & nazorg</b><small>Contract met naam/nr. van de pup, kosten, gezondheidsgarantie, en afspraken over levenslange ondersteuning.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Vaccinaties & ontworming</b><small>Vraag het vaccinatieschema dat gevolgd is en laat dit in het paspoort zetten.</small></span></label>
    <label class="check"><input type="checkbox"><span><b>Geen haast, geen druk</b><small>Koop nooit onder tijdsdruk. Een goede pup kan wachten; een slechte fokker niet op je wachten.</small></span></label>
  </div>
</section>

<section class="sec">
  <h2>🧪 Gezondheidsonderzoeken per ras</h2>
  <p class="sub">Vraag altijd naar deze onderzoeken — het zijn de bekendste rasspecifieke risico's. (⭐ = extra belangrijk voor dit ras.)</p>
  <div style="overflow-x:auto"><table class="table"><thead><tr><th>Ras</th><th>Waar je op moet letten</th></tr></thead><tbody>${rows}</tbody></table></div>
</section>

<section class="sec">
  <h2>❌ Rode vlaggen: hier stop je direct</h2>
  <div class="flags">
    <div class="card"><h3>🚩 De prijs is te laag</h3><p>Een Rashond met stamboom, DNA-controle en gechipte pup kost al snel € 1.000–1.800. "€ 350, NU MEENEMEN" is geen deal maar een waarschuwing.</p></div>
    <div class="card"><h3>🚩 Geen bezoek mogelijk</h3><p>"Wij bezorgen wel" zonder dat je het nest en de moeder hebt gezien? Dan is er iets te verbergen — of is het illegale import/handel.</p></div>
    <div class="card"><h3>🚩 Meerdere rassen & nesten</h3><p>Een erkende fokker heeft één ras (of één variant) en fokt met mate. Veel rassen tegelijk = geen specialistische kennis en vaak geen registratie.</p></div>
    <div class="card"><h3>🚩 Verzekerings- of allergiebeloftes</h3><p>"Deze pups zijn 100% hypoallergeen" of "nooit ziek" bestaat niet. Een serieuze fokker is eerlijk over de risico's van het ras.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🗣️ De 12 vragen om altijd aan de fokker te stellen</h2>
  <div class="qas">
    <div class="qa"><b>1. Bij welke rasvereniging en de Raad van Beheer bent u aangesloten? Wat is uw kennelnummer?</b><p>Het antwoord moet direct en controleerbaar zijn.</p><p class="why">Eersteklas basisvraag — alles hierna volgt.</p></div>
    <div class="qa"><b>2. Mag ik de moeder en het nest zien? Waar leven de honden?</b><p>Honden in huis = socialisatie; 'kennel-taboe' is een rode vlag.</p></div>
    <div class="qa"><b>3. Welke gezondheidsonderzoeken hebben beide ouders gehad? Mag ik de uitslagen zien?</b><p>Vraag om papieren van HD/ED, ogen en DNA-tests (zie tabel).</p></div>
    <div class="qa"><b>4. Wanneer zijn de pups gechipt en waarom? Is het nest aangemeld bij de overheid?</b><p>Alle pups in Nederland moeten wettelijk bij een erkend portaal gemeld worden.</p></div>
    <div class="qa"><b>5. Hoe oud zijn de pups als ze naar hun nieuwe huis mogen?</b><p>Minimaal 8 weken; veel fokkers wachten tot 10 weken.</p></div>
    <div class="qa"><b>6. Staan de beide ouderdieren in het NHSB? Klopt het chipnummer met de stamboom?</b><p>Check nummers ter plekke, niet op papier.</p></div>
    <div class="qa"><b>7. Hoe zijn de pups gesocialiseerd? Wat hebben ze al gezien en gehoord?</b><p>Auto's, kinderen, huisgeluid, katten: vroege ervaringen bepalen de rest van het leven.</p></div>
    <div class="qa"><b>8. Wat zit er in het koopcontract? Welke garantie en nazorg biedt u?</b><p>Zwart op wit: terugname-regeling, gezondheidsgarantie, contact na de verkoop.</p></div>
    <div class="qa"><b>9. Mag ik eerder een pup van dit nest bezichtigen/reserveren en wat gebeurt er met de reservering?</b><p>Serieuze fokkers hebben wachtlijsten en geen 'eerste komen, eerste maaien'.</p></div>
    <div class="qa"><b>10. Wat is het karakter van de ouders? Hoe gaan ze met drukke geluiden en onbekenden om?</b><p>Ouders zijn de beste voorspeller van het temperament van de pup.</p></div>
    <div class="qa"><b>11. Wat worden de totale kosten — en wat zijn mogelijke extra's (stamboom, chip, vaccinaties)?</b><p>Reken ook eerste jaar: bench, cursus, voeding, dierenarts (zie Aankoopgids).</p></div>
    <div class="qa"><b>12. Wat gebeurt er als de pup een erfelijke aandoening blijkt te hebben of als het niet klikt?</b><p>Een goed fokker neemt verantwoordelijkheid, ook maanden later.</p></div>
  </div>
</section>

<section class="sec">
  <h2>📖 Verder met je pup</h2>
  <div class="grid g3">
    <div class="card"><h3>🛍️ De complete Aankoopgids</h3><p>Per ras: vacht, verzorging, kosten en waar je extra op let — van Pomeriaan tot Berner Sennenhond.</p><p style="margin-top:10px"><a class="btn" href="/aankoopgids" style="padding:10px 18px;font-size:14px">Naar de Aankoopgids →</a></p></div>
    <div class="card"><h3>💬 Vraag andere baasjes</h3><p>Eigen ervaringen met fokkers, rasdilemma's en puppy-avonturen — in het forum.</p><p style="margin-top:10px"><a class="btn ghost" href="/forum" style="padding:10px 18px;font-size:14px">Naar het forum →</a></p></div>
    <div class="card"><h3>🧮 Welk ras past bij jou?</h3><p>De interactieve pup-pas-test helpt je kiezen op levensstijl, tijd en ruimte — vóór je een fokker benadert.</p><p style="margin-top:10px"><a class="btn ghost" href="/puppy-kiezen" style="padding:10px 18px;font-size:14px">Doe de test →</a></p></div>
  </div>
</section>

<script>
(function(){
  var checks=document.querySelectorAll('#breeder-checklist input');
  var bar=document.getElementById('breeder-progress');
  function save(){
    var done=0;
    checks.forEach(function(c,i){if(c.checked)done++;});
    bar.style.width=(done/checks.length*100)+'%';
    checks.forEach(function(c,i){c.closest('.check').classList.toggle('done',c.checked);});
    var saved=[];checks.forEach(function(c,i){if(c.checked)saved.push(i);});
    try{localStorage.setItem('tg-breeder-checklist',JSON.stringify(saved));}catch(e){}
  }
  try{
    var saved=JSON.parse(localStorage.getItem('tg-breeder-checklist')||'[]');
    checks.forEach(function(c,i){c.checked=saved.indexOf(i)!==-1;});
  }catch(e){}
  checks.forEach(function(c){c.addEventListener('change',save);});
  save();
})();
</script>`
  });
}
