/* Pagina: Aankoopgids — per ras + universeel stappenplan en checklist. */
import { pageShell, esc } from './base.mjs';
import { readFile } from 'node:fs/promises';

const CSS = `
.breedpick{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.breedpick button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13.5px;color:var(--muted)}
.breedpick button.on{background:var(--g);border-color:var(--g);color:#fff}
.breeddetail{display:grid;grid-template-columns:280px 1fr;gap:26px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:26px;box-shadow:var(--shadow)}
.breeddetail .art{width:100%;aspect-ratio:1;border-radius:var(--r);background:radial-gradient(130% 130% at 30% 20%,rgba(16,185,129,.2),transparent 55%),var(--bg);display:grid;place-items:center;font-size:84px;border:1px solid var(--line)}
.breeddetail h3{font-size:24px;margin-bottom:4px}
.breeddetail .meta{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.breeddetail .meta span{font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;background:rgba(16,185,129,.1);color:var(--g)}
.breeddetail ul{list-style:none;display:grid;gap:8px;margin-top:10px;font-size:14.5px}
.breeddetail li::before{content:"→";color:var(--em);font-weight:800;margin-right:8px}
.breeddetail .watch{border-left:4px solid var(--em);background:rgba(16,185,129,.05);border-radius:12px;padding:14px 16px;margin-top:14px;font-size:14px}
.breeddetail .cost{font-weight:800;color:var(--g);font-size:18px}
@media(max-width:760px){.breeddetail{grid-template-columns:1fr}.breeddetail .art{max-width:260px;margin:0 auto}}
.steps2{display:grid;gap:12px}
.step2{display:grid;grid-template-columns:46px 1fr;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.step2 .n{width:42px;height:42px;border-radius:14px;background:var(--g);color:#fff;display:grid;place-items:center;font-weight:800;font-size:17px}
.step2 h3{font-size:16.5px;margin-bottom:3px}
.step2 p{color:var(--muted);font-size:14px}
.checkbar{background:var(--card);border:1px solid var(--line);border-radius:999px;height:12px;overflow:hidden;margin:12px 0 16px}
.checkbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--em),#34d399);transition:width .3s ease}
.check{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;cursor:pointer}
.check input{margin-top:4px;accent-color:var(--em);width:17px;height:17px;flex:none}
.check b{font-size:14.5px}
.check small{display:block;color:var(--muted);font-size:13px}
.check.done{border-color:var(--em);background:rgba(16,185,129,.05)}
`;

const WATCH = {
  'pomeriaan': 'Klein maar pittig: nooit kort scheren (alopecia-risico), patella en gebit checken, en let op sociale omgang met kleine kinderen.',
  'labradoodle': 'Vraag naar PRA/EIC-DNA en HD/ED bij beide ouders. Niet elk nest is "hypoallergeen" — test waar mogelijk eerst de vacht.',
  'poedel': 'Zoek fokkers die ogen, HD/ED én von Willebrand testen (toy/mini). Dierenarts-panel en regelmatig trimmen zijn levenslang verplicht.',
  'goldendoodle': 'Vraag de DNA-uitslagen (PRA, EIC, MDR1) en de heup/elleboogröntgen van de ouders — ook bij kruisingen betaalbaar en gangbaar.',
  'cockapoo': 'Patella, ogen en hart horen getest. Let op: cocker-afstamming brengt soms oor- en huidproblemen mee.',
  'maltezer': 'Patella- en oogtest (PRA) plus hartauscultatie. Het witte zijdevestje vereist dagelijks kammen — vraag jezelf af of je dat opbrengt.',
  'shih-tzu': 'Kortneus-ras: luister of de ouders normaal ademen (BOAS), vraag oog- en nieronderzoek en patella-uitslagen.',
  'yorkshire-terrier': 'Denk aan luchtpijp, patella en ogen. Een Yorkie is een mini-hond met maxi-persoonlijkheid — socialisatie is cruciaal.',
  'teckel': 'De rug is heilig: vraag nadrukkelijk om IVDD-protocol en röntgen van de ouderdieren, en kies een fokker die bewust op een gezonde rug fokt.',
  'golden-retriever': 'Vraag HD/ED-röntgen, jaarlijks oogonderzoek en GR-PRA-DNA. Golden Retriever is een topgezinshond met een grote verzorgingsbehoefte aan vacht en beweging.',
  'chihuahua': 'Patella en hart (mitralisklep) zijn de bekende risicos; check ook de fontanel en gebit. Zeer kwetsbaar als pup — niet met jonge kinderen zonder toezicht.',
  'cavalier-king-charles': 'Hét ras met hart- en hersenproblemen (MVDD, syringomyelia): vraag expliciet naar MRI-uitslagen van de ouders en kies alléén een fokker die hierop test.',
  'border-collie': 'Werkhond met een werkbehoefte: vraag DNA (CEA, MDR1, CL) en check of je echt uren actieve mentale én fysieke uitdaging kunt bieden.',
  'berner-sennen': 'Mooie maar zwaar belaste rasgroep: HD/ED, ogen, DM-DNA en nierpanel. Ook: korte levensverwachting (gem. 7–9 jaar) eerlijk bespreken.',
  'schnauzer': 'Ogen (PRA/cataract), HD en nieren; bij de dwergschnauzer ook hart. Sterke persoonlijkheid — leefstijl-check is verplicht.',
  'franse-bulldog': 'Kortneus-ras met BOAS- en wervelrisico: eis ademhalingsbeoordeling van de ouders, HD/patella-uitslagen, en mijd fokkers die om "extreme" bouw fokken.'
};

async function loadBreeds() {
  try {
    const raw = await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8');
    return JSON.parse(raw).breeds || {};
  } catch {
    return {};
  }
}

export async function aankoopgidsPage() {
  const breeds = await loadBreeds();
  const entries = Object.entries(breeds);
  const cards = entries.map(([slug, b]) => {
    const watch = WATCH[slug] || 'Vraag de fokker naar rasspecifieke gezondheidsonderzoeken en socialisatie.';
    const emoji = { pomeriaan: '🐕', labradoodle: '🐩', poedel: '🐩', goldendoodle: '🐩', cockapoo: '🐶', maltezer: '🐕', 'shih-tzu': '🐶', 'yorkshire-terrier': '🐕', teckel: '🦴', 'golden-retriever': '🦮', chihuahua: '🐕', 'cavalier-king-charles': '🐶', 'border-collie': '🐕‍🦺', 'berner-sennen': '🐕‍🦺', schnauzer: '🐶', 'franse-bulldog': '🐶' }[slug] || '🐾';
    return {
      slug, emoji,
      name: b.name,
      coat: b.coat || '',
      interval: b.groomingIntervalWeeks ? `elke ${b.groomingIntervalWeeks} weken` : '—',
      brush: b.brushingFrequency || '',
      cost: b.avgCostRange || '—',
      summary: b.summary || '',
      watch
    };
  });

  const breedTabs = cards.map(c => `<button type="button" data-breed="${c.slug}" class="${c.slug === 'labradoodle' ? 'on' : ''}">${c.name.split(' ')[0].replace(/[()]/g, '')}</button>`).join('');
  const detail = cards.map(c => `
    <div class="breeddetail" id="${c.slug}" style="display:${c.slug === 'labradoodle' ? 'grid' : 'none'}">
      <div class="art">${c.emoji}</div>
      <div>
        <h3>${esc(c.name)}</h3>
        <div class="meta">
          <span>✂️ ${esc(c.interval)}</span>
          <span>💶 ${esc(c.cost)} per trimbeurt</span>
          <span>🪮 ${esc(c.brush)}</span>
        </div>
        <p style="color:var(--muted);font-size:14.5px">${esc(c.summary)}</p>
        <ul>
          <li><strong>Vacht:</strong> ${esc(c.coat)}</li>
          <li><strong>Borstelen:</strong> ${esc(c.brush)}</li>
          <li><strong>Triminterval:</strong> ${esc(c.interval)}</li>
        </ul>
        <div class="cost">Trimkosten: ${esc(c.cost)}</div>
        <div class="watch"><strong>⚠️ Waar je extra op let:</strong> ${esc(c.watch)}</div>
      </div>
    </div>`).join('');

  return pageShell({
    title: 'Aankoopgids hond: per ras + complete koopchecklist | TrimGids',
    description: 'De complete aankoopgids voor een hond: stap-voor-stap van raskeuze tot eerste week thuis, per ras de vachtverzorging, kosten en rasspecifieke gezondheidschecks.',
    canonical: '/aankoopgids',
    active: 'aankoopgids',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Aankoopgids</p>
<div class="hero">
  <span class="eyebrow">Van droom tot eerste week thuis</span>
  <h1>De Aankoopgids: let op bij de aanschaf van een hond</h1>
  <p class="intro">Elke hond is een ander verhaal — maar de koop is dat nooit. Deze gids loopt je door de 7 stappen van een verantwoorde aanschaf, geeft per ras de specifieke valkuilen en eindigt met een checklist die je bij elke fokker kunt afvinken.</p>
</div>

<section class="sec">
  <h2>🗺️ Stap 1: kies je ras (interactief)</h2>
  <p class="sub">Kies een ras om de vacht-, verzorgings- en gezondheidsdetails te zien. Twijfel je nog? Doe daarna de <a href="/puppy-kiezen" style="color:var(--g);font-weight:800">Pup-pas-test</a>.</p>
  <div class="breedpick" id="breedpick">${breedTabs}</div>
  ${detail}
</section>

<section class="sec">
  <h2>🧭 De 7 stappen van een verantwoorde aanschaf</h2>
  <div class="steps2">
    <div class="step2"><div class="n">1</div><div><h3>Levensstijl-check</h3><p>Werkuren, kinderen, reizen, beweging: wees eerlijk. Een Border Collie in een 2-kamerappartement op 60 uur werk per week is geen liefde maar een mislukking op komst.</p></div></div>
    <div class="step2"><div class="n">2</div><div><h3>Budget plannen</h3><p>Aanschaf € 1.000–1.800 + eerste jaar (bench, cursus, voeding, dierenarts, verzekering) al snel € 2.500+. Zie ook de <a href="/kosten-hond" style="color:var(--g);font-weight:800">Kosten-gids</a>.</p></div></div>
    <div class="step2"><div class="n">3</div><div><h3>Kies erkend</h3><p>Raad van Beheer/FCI-geregistreerde fokker, rasvereniging, bezoek aan huis. Lees de <a href="/fokkers" style="color:var(--g);font-weight:800">Fokkers-gids</a> vóór je contact opneemt.</p></div></div>
    <div class="step2"><div class="n">4</div><div><h3>Gezondheidsbewijs</h3><p>HD/ED, ogen en DNA-uitslagen van beide ouders; chip, stamboom, paspoort en contract — zwart op wit.</p></div></div>
    <div class="step2"><div class="n">5</div><div><h3>Ken je fokker</h3><p>Hoe worden de pups gesocialiseerd? Zie je de moeder? Krijg je na de koop nog antwoord? De relatie eindigt niet bij de betaling.</p></div></div>
    <div class="step2"><div class="n">6</div><div><h3>Voorbereiding thuis</h3><p>Bench, voer, borstels, Y-tuig, puppy-proof huis, eerstvolgende dierenartsafspraak en inschrijving bij de databank — vóór de pup arriveert, niet erna.</p></div></div>
    <div class="step2"><div class="n">7</div><div><h3>Eerste 4 weken</h3><p>Rust, routine, positieve socialisatie (auto's, kinderen, geluiden), korte wandelingen en de puppyclass. Liever gewoon en positief dan overdonderend.</p></div></div>
  </div>
</section>

<section class="sec">
  <h2>✅ Universele koopchecklist (druk deze af of vink hem hier af)</h2>
  <p class="sub">Dezelfde 12 punten als in de Fokkersgids, nu als afvinklijst met voortgang.</p>
  <div class="checkbar"><i id="puppy-progress"></i></div>
  <div class="checklist" id="puppy-checklist">
    <label class="check"><input type="checkbox"><span><b>Fokker bij Raad van Beheer + rasvereniging (kennelnummer gecontroleerd)</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Nest en moeder bezichtigd; honden leven in huis</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Gezondheidsuitslagen beide ouders gezien (HD/ED, ogen, DNA per ras)</b></span></label>
    <label class="check"><input type="checkbox"><span><b>NHSB/FCI-stamboom (of EXPORT-pedigree) + chipnummer klopt</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Pup is minstens 8 weken oud en gechipt + wettelijk geregistreerd</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Vaccinaties & ontworming in het paspoort bijgewerkt</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Koopcontract gelezen: garantie, terugname, nazorg</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Socialisatieplan besproken (geluiden, kinderen, katten, auto)</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Eerste dierenartskosten & verzekering geregeld</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Bench, voer, borstels, Y-tuig en puppycursus klaar</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Rasspecifieke risico's (zie tabel) met de fokker besproken</b></span></label>
    <label class="check"><input type="checkbox"><span><b>Geen haast: fokker stelt zelf vragen en laat je wachten op de juiste pup</b></span></label>
  </div>
</section>

<section class="sec">
  <h2>💡 Slimme vervolgstappen</h2>
  <div class="grid g3">
    <div class="card"><h3>🐕‍🦺 Fokkers & erkend vs niet-erkend</h3><p>De volledige uitleg met vergelijkingstabellen en de 12 vragen aan een fokker.</p><p style="margin-top:10px"><a class="btn ghost" href="/fokkers" style="padding:9px 16px;font-size:13.5px">Naar de Fokkersgids →</a></p></div>
    <div class="card"><h3>💰 De echte kosten van een hond</h3><p>Van aanschaf tot voeding, verzekering en incidentele dierenartskosten.</p><p style="margin-top:10px"><a class="btn ghost" href="/kosten-hond" style="padding:9px 16px;font-size:13.5px">Bekijk de kosten →</a></p></div>
    <div class="card"><h3>💬 Delen in het forum</h3><p>Andere baasjes ervaringen met dezelfde fokker of hetzelfde ras? Vraag het hier.</p><p style="margin-top:10px"><a class="btn ghost" href="/forum" style="padding:9px 16px;font-size:13.5px">Naar het forum →</a></p></div>
  </div>
</section>

<script>
(function(){
  var pick=document.getElementById('breedpick');
  pick.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click',function(){
      pick.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
      document.querySelectorAll('.breeddetail').forEach(function(d){d.style.display=d.id===b.getAttribute('data-breed')?'grid':'none';});
    });
  });
  var checks=document.querySelectorAll('#puppy-checklist input');
  var bar=document.getElementById('puppy-progress');
  function save(){
    var done=0;savedArr=[];
    checks.forEach(function(c,i){if(c.checked){done++;savedArr.push(i);}c.closest('.check').classList.toggle('done',c.checked);});
    bar.style.width=(done/checks.length*100)+'%';
    try{localStorage.setItem('tg-puppy-checklist',JSON.stringify(savedArr));}catch(e){}
  }
  var savedArr=[];
  try{savedArr=JSON.parse(localStorage.getItem('tg-puppy-checklist')||'[]');}catch(e){}
  checks.forEach(function(c,i){c.checked=savedArr.indexOf(i)!==-1;c.addEventListener('change',save);});
  save();
})();
</script>`
  });
}
