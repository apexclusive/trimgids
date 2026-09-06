/* Pagina: Honden in cijfers — populatie, geboorte/sterfte per dag, wiskundige schattingen.
   Interactief: dag-calculator (populatie × levensduur) + decennium-wijzer populaire rassen. */
import { pageShell } from './base.mjs';

const CSS = `
.calc{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:16px}
.calc .bx{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.calc label{display:grid;gap:5px;font-size:13px;font-weight:800;margin-bottom:12px}
.calc input,.calc select{width:100%;padding:12px 14px;border:1.6px solid var(--line);border-radius:13px;background:var(--bg);font:inherit;font-weight:700}
.calc .res{margin-top:10px;background:rgba(16,185,129,.07);border:1.6px solid var(--em);border-radius:14px;padding:16px;font-size:14.5px}
.calc .res b{display:block;font-size:21px;color:var(--g)}
.wijzer{display:grid;gap:12px;margin-top:14px}
.wijzer .dec{display:flex;gap:8px;flex-wrap:wrap}
.wijzer .dec button{border:1.6px solid var(--line);background:var(--card);border-radius:99px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.wijzer .dec button.on{background:var(--g);border-color:var(--g);color:#fff}
.wijzer .uit{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.wijzer .uit h3{font-size:17px;margin-bottom:6px}
.wijzer .uit p{font-size:14px;color:var(--muted)}
.wijzer .uit .top{display:grid;gap:6px;margin-top:10px}
.wijzer .uit .top span{font-size:13.5px;font-weight:700;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:9px 12px}
.table-note{font-size:12px;color:var(--muted);margin-top:8px}
@media(max-width:800px){.calc{grid-template-columns:1fr}}
`;

const DECADES = {
  '1900s': { t: '1900–1910 · De eerste rasregistraties', d: 'In de tijd dat kennelclubs en hondenshows opkwamen, domineerden werkende rassen: de Duitse Herder werd wereldwijd populair als hondenster én waakhond, terwijl de Fox Terrier het lievelingetje van de burgers was. Oorspronkelijke werkhonden waren nog niet ‘verbeterd’ tot gezelschapsformaat.', top: ['Duitse Herder', 'Fox Terrier', 'Beagle'] },
  '1920s': { t: '1920–1930 · De hondenster & de huishond', d: 'Films met Rin Tin Tin maakten de Duitse Herder immens populair. Intussen werden kleine rassen zoals de Dwergkeeshond en de Pekinees favoriet bij dames met modebewustzijn.', top: ['Duitse Herder', 'Pekinees', 'Fox Terrier'] },
  '1940s': { t: '1940–1950 · Cocker Spaniel-revolutie', d: 'De Cocker Spaniel werd in de jaren 40 wereldwijd de populairste huishond (met de American Cocker op nummer één), gevolgd door de Duitse Herder en Beagle. Het was de tijd van de échte ‘familiehond’.', top: ['Cocker Spaniël', 'Duitse Herder', 'Beagle'] },
  '1960s': { t: '1960–1970 · De poedel & de boomer', d: 'De (Dwerg)Poedel werd hét statussymbool — de ‘moderne’ hond hield je binnen, hoefde nauwelijks te ruien en kon alle kunstjes. Ook Beagles en Dalmatiërs deden het goed door films als 101 Dalmatiërs.', top: ['Poedel', 'Duitse Herder', 'Dalmatiër'] },
  '1980s': { t: '1980–1990 · De gouden retrievers', d: 'Golden Retrievers en Labradors veroverden de wereld als gezinshonden: vriendelijk, intelligent en fotogeniek. De Duitse Herder bleef de nummer één werk- en waakhond.', top: ['Golden Retriever', 'Labrador', 'Duitse Herder'] },
  '2000s': { t: '2000–2010 · De doodlenboom', d: 'De Labradoodle en Goldendoodle ontploften in populariteit; tegelijk was de Labrador nog steeds de meest geregistreerde rashond. Ontwerphonden zetten de toon voor de ‘personalised pet’.' , top: ['Labrador', 'Labradoodle', 'Golden Retriever'] },
  '2020s': { t: '2020–2026 · Klein, fluffy en ‘design’', d: 'De Franse Bulldog en de Doodle-varianten domineren de registraties, gevolgd door kleine gezelschapshonden. Grote werkhonden worden minder populair; wél stijgt de aandacht voor gezondheid en welzijn (denk aan de discussie over kortsnuitige rassen).', top: ['Franse Bulldog', 'Labradoodle', 'Border Collie'] }
};

export function cijfersPage() {
  return pageShell({
    title: 'Honden in cijfers: populatie, geboorte en sterfte per dag | TrimGids',
    description: 'Hoeveel honden telt Nederland en de wereld? Reken het zelf uit met onze populatie-calculator, plus de meest populaire rassen per decennium.',
    canonical: '/honden-cijfers',
    active: 'honden-cijfers',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Honden in cijfers</p>
<div class="hero">
  <span class="eyebrow">Feiten &amp; rekensommen</span>
  <h1>Hoeveel honden zijn er — en hoeveel worden er per dag geboren of sterven er?</h1>
  <p class="intro">Nederland heeft <strong>geen nationale hondenregistratie</strong>, dus ook geen officiële lijst van geboorte en sterfte. Wat we wél kennen: de populatieschattingen (±1,7–1,9 miljoen in Nederland; ±470–900 miljoen wereldwijd), de gemiddelde levensduur per ras, en dus een <strong>goede indicatie op basis van een rekensom</strong>. Die reken je hier zelf na.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±1,7–1,9 mln</strong><p>honden in Nederland (2023–2025 schattingen)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±470–900 mln</strong><p>honden wereldwijd (WCO-schatting)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±1 op 5</strong><p>Nederlandse huishoudens heeft een hond</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">±12 jr</strong><p>gemiddelde levensduur van een (Nederlandse) hond</p></div>
  </div>
</div>

<section class="sec">
  <h2>🧮 Reken het zelf: geboorte &amp; sterfte per dag</h2>
  <p class="sub">Vul de populatie en de gemiddelde levensduur in. Bij een stabiele populatie geldt: <strong>wat er sterft, wordt geboren</strong> — dus beide getallen komen op hetzelfde uit. Dit is een indicatie, geen telling.</p>
  <div class="calc">
    <div class="bx">
      <label>Populatie honden <input type="number" id="pop" value="1800000" min="1000" step="100000"></label>
      <label>Gemiddelde levensduur (jaar) <select id="life">
        <option value="8">Groot ras (±6–8 jaar)</option>
        <option value="10">Middelgroot ras (±10 jaar)</option>
        <option value="12" selected>Mengelmoes / gemiddelde (±12 jaar)</option>
        <option value="14">Klein ras (±12–15 jaar)</option>
      </select></label>
      <div class="res" id="res-dag"><b>—</b><span>Vul de velden in om per dag te berekenen.</span></div>
    </div>
    <div class="bx">
      <h3 style="font-size:16px;margin-bottom:10px">📌 Bekende referentiepunten</h3>
      <ul class="tg-list tg-list-lg">
        <li>🇳🇱 Nederland: ±1,7–1,9 miljoen honden</li>
        <li>🌍 Wereld: ±470–900 miljoen honden (WCO)</li>
        <li>🇮🇳 India: ±32 miljoen honden, waarvan ±20 miljoen zwerfhonden</li>
        <li>🇺🇸 VS: ±78 miljoen honden (AKC-schatting)</li>
        <li>🐕 Gemiddelde levensduur: klein ±12–15 jr · groot ±6–10 jr (zie <a href="/hondenweetjes" style="color:var(--g)">onze levensduurgids</a>)</li>
      </ul>
      <div class="quote" style="margin-top:12px;padding:14px"><p style="font-size:13px">Reken maar mee: ±1,8 mln honden ÷ 12 jaar = ±150.000 per jaar ≈ <strong>±410 per dag</strong> — zowel geboorte als sterfte bij een stabiele populatie.</p></div>
    </div>
  </div>
  <p class="table-note">Let op: dit is een theoretische benadering. In werkelijkheid is er een ‘kinderkamer’-effect: er worden meer pups geboren dan er volwassen honden bijkomen, omdat jonge honden kunnen overlijden en er honden uit het buitenland bij komen. Exacte cijfers bestaan alleen voor deelgroepen (bijv. geregistreerde rashonden).</p>
</section>

<section class="sec">
  <h2>⏳ Wijzer: welke honden waren vroeger populair?</h2>
  <p class="sub">Hondentrends volgen mode, film en maatschappij. Er is geen officiële Nederlandse rassenstatistiek over alle decennia — dit is een beeld op basis van internationale kennelregistraties en bekende trends. Klik per decennium.</p>
  <div class="wijzer">
    <div class="dec" id="dec">${Object.keys(DECADES).map((k, i) => `<button data-d="${k}" class="${i === 0 ? 'on' : ''}">${k}</button>`).join('')}</div>
    <div class="uit" id="dec-uit"></div>
  </div>
</section>

<section class="sec">
  <h2>📈 De grote lijn: van werkhond naar gezinslid</h2>
  <div class="grid g3">
    <div class="card"><h3>🐕 1900–1950: functie eerst</h3><p>Honden werden gekozen op wat ze deden: hoeden, jagen, bewaken. Shimpansee-films en politiewerk maakten de Duitse Herder groot.</p></div>
    <div class="card"><h3>🐩 1950–1990: het gezin</h3><p>Kleinere, rustigere rassen wonnen terrein: poedels, cocker-spaniëls, retrievers. De hond werd een lid van het gezin, niet langer alleen een werker.</p></div>
    <div class="card"><h3>🐶 1990–2026: design &amp; gezondheid</h3><p>Doodles, mini-varianten en 'designer' rassen; tegelijkertijd een groeiend debat over kortsnuitigheid en erfelijke ziektes. De populariteitswisseling werd sneller dan ooit.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/geschiedenis-hond">📜 De volledige geschiedenis van de hond →</a>
    <a class="btn ghost" href="/koninklijke-honden">👑 Honden van koningen &amp; royals →</a>
  </div>
</section>

<script>
(function () {
  var pop = document.getElementById('pop'), life = document.getElementById('life'), out = document.getElementById('res-dag');
  function upd() {
    var p = Math.max(1000, +pop.value || 0), l = Math.max(1, +life.value || 12);
    var perY = Math.round(p / l);
    var perD = Math.round(perY / 365);
    out.innerHTML = '<b>±' + perD.toLocaleString('nl-NL') + ' per dag</b><span>Bij een stabiele populatie van ' + p.toLocaleString('nl-NL') + ' honden en een levensduur van ±' + l + ' jaar: ±' + perY.toLocaleString('nl-NL') + ' geboorten én sterfgevallen per jaar, verdeeld over 365 dagen.</span>';
  }
  pop.addEventListener('input', upd); life.addEventListener('change', upd); upd();

  var D = ${JSON.stringify(DECADES)};
  var dec = document.getElementById('dec'), dout = document.getElementById('dec-uit');
  function show(k) {
    var d = D[k];
    dout.innerHTML = '<h3>' + d.t + '</h3><p>' + d.d + '</p><div class="top">' + d.top.map(function (x) { return '<span>🏆 ' + x + '</span>'; }).join('') + '</div>';
  }
  dec.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    dec.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    show(b.getAttribute('data-d'));
  });
  show('1900s');
})();
</script>`
  });
}
