/* Pagina: Hondenwedstrijden & sport — welke honden zijn het meest acrobatisch, waar kun je winnen.
   Interactief: "welke sport past bij jouw hond?"-kiezer. */
import { pageShell } from './base.mjs';

const CSS = `
.sports{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}
.sport{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:20px;box-shadow:var(--shadow)}
.sport .ic{font-size:30px}
.sport h3{font-size:16px;margin:8px 0 4px}
.sport p{color:var(--muted);font-size:13.5px}
.sport .best{margin-top:10px;font-size:12.5px;font-weight:800;color:var(--g);background:rgba(16,185,129,.07);border-radius:10px;padding:8px 11px}
.sport .win{margin-top:8px;font-size:12.5px;font-weight:700;color:var(--muted)}
.quiz{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow);margin-top:16px}
.quiz .q{font-size:16px;font-weight:800;margin:16px 0 8px}
.quiz .opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px}
.quiz .opts button{text-align:left;padding:12px 14px;border:1.6px solid var(--line);border-radius:12px;background:var(--bg);font-weight:700;font-size:13.5px}
.quiz .opts button.on{background:var(--g);border-color:var(--g);color:#fff}
.quiz-res{background:rgba(16,185,129,.07);border:1.6px solid var(--em);border-radius:14px;padding:16px;margin-top:16px;font-size:14.5px}
.quiz-res b{font-size:17px}
`;

const SPORTS = [
  { ic: '🏃', t: 'Agility', d: 'De meest spectaculaire hondensport: een hindernissenparcours met tunnels, horden en slaloms. Snelheid, precisie en aanwijzingen van de baas.', best: 'Best voor: Border Collie, Shetland, Australische Herder, Poedel, Malinois', win: 'NK via Raad van Beheer & FHN; promotie van debutanten naar 3e graad; internationaal: FCI WK & EU Open' },
  { ic: '🪃', t: 'Frisbee / Disc Dog', d: 'Hond vangt frisbees uit de lucht — met sprongen, draaien en "catch & flip". Recreatief en wedstrijdmatig (afstand, vrij spel, choreografie).', best: 'Best voor: Border Collie, Australische Herder, Whippet (springkracht!)', win: 'Titels en een podiumplek op NK/festivals; geen grote geldprijzen' },
  { ic: '💦', t: 'Dock Diving', d: 'De hond springt van een steiger het water in en wordt gemeten op afstand (of hoogte). Dé sport voor waterratten.', best: 'Best voor: Labrador, Golden Retriever, Duitse Herder, elke watergek', win: 'Afstandsrecords; NK en internationale DockDogs-evenementen' },
  { ic: '🤾', t: 'Flyball', d: 'Estafette met 4 honden: over horden naar een machine die een bal uitwerpt, terug met de bal. Razendsnel en superteam-gevoel.', best: 'Best voor: Border Collie, Jack Russell, Malinois, Staffords', win: 'Teamwedstrijden: bekertjes en promotieklasses; NK-format' },
  { ic: '💃', t: 'Dogdance', d: 'Hond danst op muziek met de baas: vrij programma (freestyle) of aan de lijn (HTM). Zelfs zonder talent voor sport een topper.', best: 'Best voor: Poedel, Border Collie, Maltezer, Dwergpoedel, Cavalier', win: 'FCI- en landelijke titels, vaak alleen rosetten en applaus 😉' },
  { ic: '🧲', t: 'Obedience', d: 'Gehoorzaamheidswedstrijden: apporteren, volgen, sturen op afstand. De "examenklas" van de hondensport.', best: 'Best voor: Border Collie, Duitse Herder, Poedel, Golden', win: 'Nederlandse titels; deelname aan internationale (FCI) wedstrijden' },
  { ic: '🛡️', t: 'IGP & KNPV', d: 'Speuren, volgen en verdediging onder regie. De "werkproef" waar veel politiehonden uit voortkomen; in Nederland vooral via de KNPV.', best: 'Best voor: Duitse Herder, Malinois, Hollandse Herder', win: 'KNPV-diploma\'s (bijv. Politiehond I) en promoties — soms met prijzengeld' },
  { ic: '👃', t: 'Speuren & mantrailing', d: 'Hond volgt een geurspoor van een persoon of voorwerp. Nuttig en sportief — denk aan politie en reddingswerk.', best: 'Best voor: Bloedhond, Duitse Herder, Malinois, Beagle', win: 'Titels; sommige honden werken later écht bij de politie of reddingsdienst' },
  { ic: '🪶', t: 'Coursing & windhondenrennen', d: 'Windhonden jagen op een nep-"prooi" over een afgebakend parcours; puur instinctief.', best: 'Best voor: Greyhound, Whippet, Afghaanse Windhond, Saluki', win: 'Punten, titels en liefde van het publiek' },
  { ic: '🧩', t: 'Treibball & nieuwe sporten', d: 'Hond drijft ballen in een doel; denk aan "schapen drijven zonder schapen". Ook: Canicross (hardlopen met hond), Canicross-ploeg, urbansled.', best: 'Best voor: Border Collie, Australische Herder, elke slimme hond', win: 'Steeds meer NK wedstrijden; via de hondenbond bij jou in de buurt' }
];

export function hondenwedstrijdenPage() {
  return pageShell({
    title: 'Hondenwedstrijden & sport: welke honden zijn het meest acrobatisch? | TrimGids',
    description: 'Agility, frisbee, dock diving, flyball, dogdance, KNPV: de acrobatische hondensporten op een rij. Welke rassen scoren het best, wat kun je winnen en waar kun je meedoen?',
    canonical: '/hondenwedstrijden',
    active: 'hondenwedstrijden',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Hondenwedstrijden &amp; sport</p>
<div class="hero">
  <span class="eyebrow">Sport voor baas én hond</span>
  <h1>Hondenwedstrijden: wie zijn de acrobaten en wat kunnen ze winnen?</h1>
  <p class="intro">Honden kunnen springen, draaien, vangen, dansen en zwemmen op ongekende niveaus. Van de klassieke agility tot frisbee en dock diving: dit zijn de disciplines, de beste rassen per sport, wat er te winnen valt en hoe je zelf begint.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">4</strong><p>hoogteklassen in agility (FCI)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">1–4 m</strong><p>springafstand dock diving (records tot ±9–10 m)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">15+</strong><p>disciplines in Nederland</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0 €</strong><p>nodig om recreatief te beginnen — veel verenigingen hebben proeflessen</p></div>
  </div>
</div>

<section class="sec">
  <h2>🏅 De acrobatische sporten op een rij</h2>
  <p class="sub">Welke honden zijn het meest acrobatisch? De top-3 bij agility, frisbee en dogdance is eigenlijk altijd hetzelfde: <strong>Border Collie, Australische Herder en (Dwerg)Poedel</strong> — slim, wendbaar en werklustig. Maar kijk vooral naar de klik met jouw hond.</p>
  <div class="sports">
    ${SPORTS.map(s => `<div class="sport"><div class="ic">${s.ic}</div><h3>${s.t}</h3><p>${s.d}</p><div class="best">${s.best}</div><div class="win">🏆 ${s.win}</div></div>`).join('')}
  </div>
</section>

<section class="sec">
  <h2>📊 Waar kun je "winnen" en hoe werkt dat?</h2>
  <div class="grid g3">
    <div class="card"><h3>🥇 Titels & promotie</h3><p>Bij agility: debutanten → 1e → 2e → 3e graad, en meedoen aan NK & internationale wedstrijden (FCI WK, EU Open). In de KNPV zijn diploma's (bijv. Politiehond I) het doel; bij dogdance en frisbee gaat het om hoge cijfers en landelijke titels.</p></div>
    <div class="card"><h3>💰 Prijzengeld?</h3><p>Meestal niet: de "prijs" is een roset, beker, mooie titel en heel veel applaus. Alleen enkele werk/proeven zoals KNPV kennen soms prijzengeld. De echte beloning is de band met je hond.</p></div>
    <div class="card"><h3>📍 Waar in Nederland?</h3><p>Verenigingen (o.a. onder de Raad van Beheer en de FHN) organiseren door het hele land wedstrijden en proeflessen. Zoek op "hondensport + jouw plaats" of vraag bij je hondenschool — veel verenigingen hebben open avonden.</p></div>
  </div>
</section>

<section class="sec">
  <h2>🧭 Welke sport past bij jouw hond? (4 vragen)</h2>
  <p class="sub">Klik je antwoorden — je krijgt een eerlijk advies. Niet alleen voor acrobatiek, maar ook voor honden die liever rustig zijn: er is voor élke hond een sport.</p>
  <div class="quiz" id="quiz"></div>
  <p style="font-size:12.5px;color:var(--muted);margin-top:8px">Tip: begin recreatief. Veel verenigingen laten je eerst een proefles volgen voordat je inschrijft.</p>
</section>

<section class="sec">
  <h2>💪 Zelf beginnen, waar let je op?</h2>
  <div class="grid g3">
    <div class="card"><h3>1. Start gezond!</h3><p>Kortsnuitige honden zijn géén agility-atleten; controleer gewicht, gewrichten en ademhaling met je dierenarts. Volwassen honden: opbouwen, nooit meteen volle parcours.</p></div>
    <div class="card"><h3>2. Vind een goede club</h3><p>Kleine groepen, positieve bekrachtiging, geen dwang/gillen. Vraag naar een gratis proefles en kijk hoe de trainers met de honden omgaan.</p></div>
    <div class="card"><h3>3. Blijf het leuk houden</h3><p>Sport moet spel zijn. Als je hond moet, is het geen sport meer — stop op tijd, beloon veel en wissel disciplines af.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/hondenweetjes">🧠 Leeftijd & slimheid: wat maakt een top-sport-hond? →</a>
    <a class="btn ghost" href="/zintuigen">👂 Zintuigenlab: zo wordt je hond een topatleet →</a>
  </div>
</section>

<script>
(function () {
  var QS = [
    { q: 'Wat is het energieniveau van je hond?', a: [['Rustig — liever lui dan moe', 1], ['Gemiddeld — kan wel een half uurtje', 2], ['Eindeloos — stopt nooit', 3]] },
    { q: 'Hoe staat je hond tegenover water?', a: [['Haalt liever een riem', 1], ['Kan een plons waarderen', 2], ['Een waterrat, springt het meer in!', 3]] },
    { q: 'En jij zelf: wat lijkt je leuk?', a: [['Samen een routine en gehoorzaamheid', 2], ['Snelheid en hindernissen', 3], ['Muziek, dans en showtijd', 1]] },
    { q: 'En je hond qua neus?', a: [['Neus aan de grond, altijd aan het speuren', 1], ['Volgt soms een spoor', 2], ['Niet speciaal — ogen en oren eerst', 3]] }
  ];
  var quiz = document.getElementById('quiz');
  var qi = 0, picked = new Array(QS.length).fill(null);
  function ask() {
    var q = QS[qi];
    quiz.innerHTML = '<p class="q">Vraag ' + (qi + 1) + ' van ' + QS.length + ': ' + q.q + '</p><div class="opts">' + q.a.map(function (o, i) { return '<button data-i="' + i + '" class="' + (picked[qi] === i ? 'on' : '') + '">' + o[0] + '</button>'; }).join('') + '</div>' + (qi > 0 ? '<div style="margin-top:10px"><button class="btn ghost btn-sm" id="back">← Vorige</button></div>' : '');
    quiz.querySelectorAll('.opts button').forEach(function (b) {
      b.addEventListener('click', function () {
        picked[qi] = +b.getAttribute('data-i');
        quiz.querySelectorAll('.opts button').forEach(function (x) { x.classList.toggle('on', x === b); });
        setTimeout(function () { if (qi < QS.length - 1) { qi++; ask(); } else finish(); }, 150);
      });
    });
    var back = document.getElementById('back');
    if (back) back.addEventListener('click', function () { qi = Math.max(0, qi - 1); ask(); });
  }
  function finish() {
    var score = picked.reduce(function (s, i, n) { return s + QS[n].a[i][1]; }, 0) - QS.length;
    var res = score <= 2
      ? '<b>🗣️ Rustig & sociaal: Dogdance, Obedience of speuren!</b><br>Deze honden bouwen het best aan een routine en een band: dogdance (zelfs aan de lijn!), obedience en speuren zijn perfect. Veel clubs bieden "Fun & Obedience".'
      : score <= 5
        ? '<b>🏃 Sportief & behendig: Agility, Flyball of Frisbee!</b><br>Jullie kunnen samen snelheid en precisie combineren. Begin met agility (of flyball als je van teamwerk houdt) — en vergeet niet de kortsnuit-check en opbouw!'
        : '<b>💦 Water & snelheid: Dock Diving, Courssing of Canicross!</b><br>Zelfs de "gekste" honden kunnen hier hun ei kwijt. Dock diving voor waterratten, coursing voor jagers en canicross voor de renners. Veel plezier!';
    quiz.innerHTML = '<div class="quiz-res">' + res + '</div><div style="margin-top:12px"><button class="btn ghost" id="again">↻ Opnieuw</button></div>';
    document.getElementById('again').addEventListener('click', function () { qi = 0; picked = new Array(QS.length).fill(null); ask(); });
  }
  ask();
})();
</script>`
  });
}
