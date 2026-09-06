/* Pagina: Hondenweetjes — voeding & hypoallergene rassen, leeftijd en intelligentie.
   Interactief: hypoallergeen-tabel (uit data), ouderdom-meter, "woorden-teller" met je eigen hond. */
import { pageShell, esc } from './base.mjs';
import { readFile } from 'node:fs/promises';

const CSS = `
.wijze{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:12px}
.wijze .card{text-align:center}
.wijze .big{font-size:26px;font-weight:800;color:var(--g)}
.words{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow)}
.words .cmds{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:10px}
.words .cmds label{display:flex;gap:8px;align-items:center;font-size:13.5px;font-weight:700;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:9px 11px}
.words .cmds input{accent-color:var(--em)}
.words .score{font-size:24px;font-weight:800;color:var(--g);margin-top:14px}
.food-danger{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.danger{background:var(--card);border:1px solid #fca5a5;border-radius:14px;padding:16px}
.danger h3{font-size:15px;color:#b91c1c}
.danger ul{list-style:none;display:grid;gap:7px;font-size:13.5px;margin-top:8px}
.danger li::before{content:"⛔ ";font-weight:800}
.safe{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.safe h3{font-size:15px;color:var(--g)}
.safe ul{list-style:none;display:grid;gap:7px;font-size:13.5px;margin-top:8px}
.safe li::before{content:"✅ ";font-weight:800}
.age-bars{display:grid;gap:10px;margin-top:12px}
.age-bar{display:grid;grid-template-columns:170px 1fr 110px;gap:12px;align-items:center;font-size:13.5px;font-weight:700}
.age-bar i{display:block;height:14px;border-radius:99px;background:linear-gradient(90deg,var(--em),#34d399)}
.age-bar .ml{color:var(--muted);font-weight:700;text-align:right}
@media(max-width:700px){.food-danger{grid-template-columns:1fr}.age-bar{grid-template-columns:1fr 1fr}}
`;

export async function hondenweetjesPage() {
  let hypo = [];
  try {
    hypo = JSON.parse(await readFile(new URL('../data/hypoallergenic-breeds.json', import.meta.url), 'utf8'));
  } catch { hypo = []; }

  return pageShell({
    title: 'Hondenweetjes: voeding, hypoallergeen, ouderdom & slimheid | TrimGids',
    description: 'Welke honden zijn hypoallergeen, welk ras wordt het oudst en waarom leven kleine honden langer? Hoeveel woorden kan een hond leren en welk ras is slim — of "dom"? Alle hondenweetjes op een rij.',
    canonical: '/hondenweetjes',
    active: 'hondenweetjes',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Hondenweetjes</p>
<div class="hero">
  <span class="eyebrow">Voeding · Leeftijd · Slimheid</span>
  <h1>Hondenweetjes: hypoallergeen, oudste rassen en hoe slim je hond echt is</h1>
  <p class="intro">Welke honden zijn hypoallergeen? Welk ras wordt het oudst — en waarom leven kleine honden gemiddeld langer? Hoeveel woorden kan een hond leren en welk ras is de "slimste" (en de "domste")? Hier komen de leukste feiten samen, mét de checklists die je zelf kunt gebruiken.</p>
  <div class="wijze">
    <div class="card"><div class="big">±165</div><p>woorden en gebaren begrijpt de gemiddelde hond</p></div>
    <div class="card"><div class="big">1.022</div><p>woorden kende Chaser (Border Collie, record)</p></div>
    <div class="card"><div class="big">12–15 jr</div><p>gemiddelde leeftijd kleine rassen (groot: 6–10 jr)</p></div>
    <div class="card"><div class="big">0</div><p>huidharen? Nee — géén hond is 100% hypoallergeen</p></div>
  </div>
</div>

<section class="sec">
  <h2>🥩 Voeding: de basis (en wat echt niet mag)</h2>
  <p class="sub">Een gezonde hond eet per dag ±2–3% van zijn lichaamsgewicht, verdeeld over 2 maaltijden voor volwassen honden (pups: 3–4 kleine maaltijden). Kies complete voeding (brokken, vers of Barf — mits volledig en op de hond afgestemd) en stem de hoeveelheid op conditie, leeftijd en beweging af.</p>
  <div class="food-danger">
    <div class="danger">
      <h3>⛔ Nooit geven</h3>
      <ul>
        <li>Chocolade (theobromine — al 1 stukje kan giftig zijn)</li>
        <li>Druiven & rozijnen (nierfalen)</li>
        <li>Ui, knoflook, prei (beschadigt rode bloedcellen)</li>
        <li>Xylitol (kauwgom/zoetstof — levensgevaarlijk)</li>
        <li>Avocado, alcohol, cafeïne en rauw varkensvlees (Aujeszky)</li>
        <li>Gekookte kippenbotjes (splinteren!)</li>
      </ul>
    </div>
    <div class="safe">
      <h3>✅ Wel verantwoord</h3>
      <ul>
        <li>Complete brokken of verse voeding op maat</li>
        <li>Mager vlees, vis en gekookte groente (zonder kruiden)</li>
        <li>Rijst en pasta bij maagklachten (advies dierenarts)</li>
        <li>Geschikte snacks in kleine hoeveelheden</li>
        <li>Altijd vers water — vooral bij brokken en in de warmte</li>
      </ul>
    </div>
  </div>
  <div class="next" style="margin-top:16px"><a class="btn ghost" href="/giftigheid-calculator">🧮 Twijfel je over chocolade of iets anders? Check de gifcalculator →</a></div>
</section>

<section class="sec">
  <h2>🌾 Hypoallergene honden: wie is het meest geschikt?</h2>
  <p class="sub">Belangrijk om te weten: hypoallergeen bestaat niet — de allergie zit in huidschilfers en speeksel, niet in de vacht. Honden met een enkele krul- of waterhondvacht verharen nauwelijks en houden schilfers vast tot de was- en trimbeurt, waardoor de meeste mensen met een milde tot matige allergie er goed mee kunnen. Deze lijst uit onze databank:</p>
  <div class="airline">
    <table class="table">
      <tr><th>Ras</th><th>Vacht & verharing</th><th>Allergie-score</th><th>Trimritme</th></tr>
      ${hypo.map(h => `<tr><td><strong>${esc(h.breed)}</strong>${h.badge ? `<br><span style="font-size:12px;color:var(--muted)">${esc(h.badge)}</span>` : ''}</td><td>${esc(h.coatType)} · ${esc(h.sheddingLevel)}</td><td><b style="color:var(--g)">${esc(h.allergyScore)}</b></td><td>${esc(h.groomingNeeds)}</td></tr>`).join('') || '<tr><td colspan="4">—</td></tr>'}
    </table>
  </div>
  <div class="quote" style="margin-top:14px"><p><strong>Praktisch:</strong> laat je hond regelmatig wassen en kammen, gebruik een luchtreiniger met HEPA-filter, houd de slaapkamer hondvrij en overleg met een allergoloog. Er is geen garantie — alleen een aanzienlijk kleinere kans op klachten.</p></div>
</section>

<section class="sec">
  <h2>🐕‍🦺 Leeftijd: welk ras wordt het oudst — en waarom kleine honden langer leven</h2>
  <p class="sub">Gemiddelden (Britse studies, o.a. gepubliceerd in Nature-onderzoeken): de Jack Russell (~12,7 jaar) en Border Collie (~12,1 jaar) scoren hoog, terwijl de Chihuahua in één studie opvallend laag uitkwam (7,9 jaar, vaak door rasgebonden gezondheidsproblemen). Uitschieters: Bella, een Border Collie, werd 24 jaar en 11 maanden.</p>
  <div class="age-bars">
    <div class="age-bar"><span>Jack Russell Terriër</span><i style="width:84%"></i><span class="ml">±12,7 jr</span></div>
    <div class="age-bar"><span>Border Collie</span><i style="width:80%"></i><span class="ml">±12,1 jr</span></div>
    <div class="age-bar"><span>Kruising (bastaard)</span><i style="width:78%"></i><span class="ml">±11,8 jr</span></div>
    <div class="age-bar"><span>Labrador</span><i style="width:77%"></i><span class="ml">±11,8 jr</span></div>
    <div class="age-bar"><span>Duitse Dog / Berner</span><i style="width:46%"></i><span class="ml">±6–8 jr</span></div>
    <div class="age-bar"><span>Ierse Wolfshond</span><i style="width:42%"></i><span class="ml">±6–8 jr</span></div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>🧬 Waarom klein langer?</h3><p>Grote honden groeien veel sneller en worden groter; dat kost extra cel-/energie-inspanning en geeft meer kans op kankers en gewrichtsproblemen. Hun hart en organen moeten een zwaarder lichaam onderhouden. Kleine honden verouderen relatief "langzamer" in verhouding.</p></div>
    <div class="card"><h3>📈 Groei & levensduur</h3><p>Kleine rassen zijn vaak al met ±9–12 maanden volgroeid; grote rassen groeien tot 2 jaar. Studies laten een duidelijk negatief verband zien tussen gewicht/grootte en levensverwachting.</p></div>
    <div class="card"><h3>⚠️ Groot is niet alles</h3><p>Pomerianen en Chihuahua's kunnen lang leven, maar hebben ras-specifieke problemen (gebit, patella, luchtpijp). En de Mopshond (kortsnuitig) scoort laag ondanks zijn kleine formaat: bouw bepaalt vaak meer dan formaat alleen.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🧠 Slimste en "domste" ras — en hoeveel woorden leert een hond?</h2>
  <p class="sub"><strong>Stanley Coren</strong> (Universiteit van British Columbia) interviewde 199 hondentrainers en rangschikte rassen op gehoorzaamheid en leervermogen. Belangrijke nuance: "dom" betekent hier <em>minder geneigd om commando's op te volgen</em> — niet minder intelligent op andere vlakken.</p>
  <div class="grid g2">
    <div class="card"><h3>🏆 Top 10 slimste (gehoorzaamheidsranglijst Coren)</h3><ol style="margin-left:20px;margin-top:8px;font-size:14.5px;display:grid;gap:5px">
      <li>Border Collie — leert commando's in &lt;5 herhalingen</li>
      <li>Poedel</li>
      <li>Duitse Herder</li>
      <li>Golden Retriever</li>
      <li>Dobermann</li>
      <li>Shetland Sheepdog</li>
      <li>Labrador</li>
      <li>Continentaal Dwergspaniël (Papillon)</li>
      <li>Rottweiler</li>
      <li>Australische Veedrijvershond</li>
    </ol></div>
    <div class="card" style="border-color:#fca5a5"><h3>🐢 Onderaan de ranglijst (grappig bedoeld)</h3><ul style="margin-top:8px">
      <li>Afghaanse Windhond — nummer 1 "moeilijkst te trainen"</li>
      <li>Basenji — eigenzinnig, nauwelijks blaft</li>
      <li>Chow Chow — kan prima nadenken, doet alleen niet wat jij wilt</li>
      <li>Bulldog — liever lui dan moe</li>
      <li>Basset Hound — volgt zijn neus, niet jouw stem</li>
    </ul><p style="font-size:13px;color:var(--muted);margin-top:8px">Deze honden zijn vaak wél sociaal en probleemoplossend — ze hebben alleen geen zin in jouw "zit!".</p></div>
  </div>
  <div class="words">
    <h3 style="font-size:17px">🗣️ Hoeveel woorden kent jouw hond? (test het zelf)</h3>
    <p style="color:var(--muted);font-size:14px">De gemiddelde hond begrijpt ±165 woorden en gebaren (Coren); de top 20% haalt ±250. De wereldrecordhouder Chaser (Border Collie) kende <strong>1.022 woorden</strong> — voornamelijk namen van speeltjes. Vink aan wat jouw hond echt begrijpt:</p>
    <div class="cmds" id="cmds"></div>
    <div class="score" id="words-out">—</div>
  </div>
</section>

<section class="sec">
  <h2>🎯 Samengevat</h2>
  <div class="grid g3">
    <div class="card"><h3>🥩 Voeding</h3><p>Compleet en op maat; nooit chocolade, druiven, ui of xylitol. Twijfel? Check de gifcalculator en bel de dierenarts.</p></div>
    <div class="card"><h3>🐕 Leeftijd</h3><p>Klein = gemiddeld ouder (±12–15), groot = korter (±6–10). Goede verzorging, gezond gewicht en preventieve controles maken het verschil.</p></div>
    <div class="card"><h3>🧠 Slimheid</h3><p>Borders en poedels blinken uit in training; afghaan en basenji "winnen" op eigenwijsheid. En elke hond kan tientallen woorden leren — gewoon beginnen!</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/chippen-ontwormen">💉 Chip & ontwormen: alles over gezondheidsplicht →</a>
    <a class="btn ghost" href="/hondenwedstrijden">🏆 Welke honden zijn het meest acrobatisch? →</a>
  </div>
</section>

<script>
(function () {
  var commands = ['Zit', 'Af', 'Blijf', 'Hier komen', 'Sta', 'Poot', 'Rollen', 'Tasje pakken', 'Naar je mand', 'Rustig', 'Laat los', 'Bal zoeken', 'Nee', 'Doorlopen', 'Naast me', 'Rondje draaien', 'Kusje geven', 'Klaar', 'Auto in', 'Wachten'];
  var cmds = document.getElementById('cmds');
  cmds.innerHTML = commands.map(function (c) { return '<label><input type="checkbox" data-w="' + Math.round(1 + Math.random() * 3) + '"><span>' + c + '</span></label>'; }).join('');
  var out = document.getElementById('words-out');
  function count() {
    var n = 0;
    cmds.querySelectorAll('input').forEach(function (i) { if (i.checked) n++; });
    if (n === 0) { out.textContent = "Vink de commando's aan die jouw hond kent…"; return; }
    var extra = Math.max(5, Math.round(n * 2.4));
    var tot = n + extra;
    var nice = tot < 40 ? 'Topper! Dat is een prima woordenschat.' : tot < 100 ? 'Indrukwekkend — jouw hond is een echte taalster!' : 'Wow! Waarschijnlijk een toekomstige Chaser in huis. 🏆';
    out.textContent = 'Jouw hond begrijpt ±' + tot + ' woorden en gebaren. ' + nice;
  }
  cmds.addEventListener('change', count);
})();
</script>`
  });
}
