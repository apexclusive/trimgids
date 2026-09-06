/* Pagina: Zintuigenlab — kleuren, gehoor, vuurwerk en het reukvermogen van de hond.
   Interactief: toon-proef, luister-proef (WebAudio), ruik-slider en quiz. */
import { pageShell } from './base.mjs';

const CSS = `
.lab{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-top:22px}
.lab>div{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow)}
.lab h3{font-size:19px;margin-bottom:6px}
.lab p{color:var(--muted);font-size:14px}
.lab .vis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.lab .vis figure{border-radius:12px;overflow:hidden;border:1px solid var(--line)}
.lab .vis img{width:100%;height:130px;object-fit:cover}
.lab .vis figcaption{font-size:11.5px;font-weight:800;text-align:center;padding:6px;color:var(--muted)}
.btnrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.btnrow button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:10px 16px;font-weight:800;font-size:13.5px;color:var(--ink)}
.btnrow button.on{background:var(--g);border-color:var(--g);color:#fff}
input[type=range]{width:100%;accent-color:var(--em);margin:10px 0 6px}
.readout{font-size:26px;font-weight:800;color:var(--g);letter-spacing:-.03em}
.bars{display:grid;gap:8px;margin-top:12px}
.bar{display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center;font-size:13px;font-weight:700}
.bar i{display:block;height:12px;border-radius:99px;background:linear-gradient(90deg,var(--em),#34d399)}
.bar.m i{background:linear-gradient(90deg,#cbd5e1,#94a3b8)}
.sniff{height:110px;border-radius:14px;background:radial-gradient(140% 160% at 50% 120%,rgba(16,185,129,.18),transparent 60%),var(--bg);border:1px solid var(--line);display:grid;place-items:center;font-size:44px;transition:transform .2s}
.sniff.on{transform:scale(1.12);animation:puff .9s ease-in-out infinite}
@keyframes puff{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
.quiz{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:26px;box-shadow:var(--shadow);margin-top:24px}
.quiz .q{font-size:18px;font-weight:800;margin:12px 0}
.quiz .opts{display:grid;gap:10px}
.quiz .opts button{text-align:left;padding:13px 16px;border:1.6px solid var(--line);border-radius:14px;background:var(--card);font-weight:700;font-size:14.5px}
.quiz .opts button.right{border-color:var(--em);background:rgba(16,185,129,.1)}
.quiz .opts button.wrong{border-color:#fca5a5;background:rgba(220,38,38,.06)}
.quiz-score{font-size:22px;font-weight:800;color:var(--g)}
.compare-table{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:20px}
.compare-table .card{text-align:center}
.compare-table .card strong{display:block;font-size:30px;color:var(--g)}
.compare-table .card span{color:var(--muted);font-size:13.5px}
`;

const BODY = `
<p class="crumb"><a href="/">TrimGids</a> / Zintuigenlab</p>
<div class="hero">
  <span class="eyebrow">Zintuigenlab · basiskennis hond</span>
  <h1>Hoe ziet, hoort en ruikt je hond eigenlijk?</h1>
  <p class="intro">Ziet je hond kleur zoals jij? Hoort hij even goed als jij? En waarom schrikt hij zo van vuurwerk? Klik, luister en test het zélf hieronder — met 4 proefjes en een quiz.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:28px;color:var(--g)">2 van 3</strong><p>kegeltjes: hond is dichromaat</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:28px;color:var(--g)">±65 kHz</strong><p>horen gaat 3× hoger dan bij ons</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:28px;color:var(--g)">220 mln</strong><p>geurreceptoren (mens: 5 mln)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:28px;color:var(--g)">10.000×</strong><p>minimaal beter ruiken dan een mens</p></div>
  </div>
</div>

<section class="sec">
  <h2>🎨 Proef 1: ziet een hond in kleur zoals wij?</h2>
  <p class="sub">Een wijdverbreide mythe: honden zien zwart-wit. Niet waar. Honden hebben <strong>twee</strong> soorten kegeltjes (mensen drie), waardoor ze een geel-blauw kleurenpalet zien. Rood en groen zijn voor een hond nauwelijks van elkaar te onderscheiden.</p>
  <div class="lab">
    <div>
      <h3>Dezelfde foto, twee werelden</h3>
      <p>Sleep door de knoppen (of gebruik de toetsen) en kijk wat er verandert als je 'met hondenogen' kijkt. Honden zien vooral geel en blauw; rood wordt donker geelbruin, bijna zwart.</p>
      <div class="btnrow">
        <button id="viz-human" class="on" type="button">👁️ Menselijke ogen</button>
        <button id="viz-dog" type="button">🐶 Hondenogen</button>
      </div>
      <div class="vis">
        <figure><img id="viz-img" src="/assets/img/pomeriaan-640.webp" alt="Pomeriaan gezien door menselijke ogen"><figcaption id="viz-cap">Mens (3 kegeltjes)</figcaption></figure>
        <figure><img src="/assets/img/pomeriaan-hondzien.webp" alt="Zelfde Pomeriaan gesimuleerd zoals een hond hem ziet (geel-blauw palet)"><figcaption>Hond (gesimuleerd, geel-blauw)</figcaption></figure>
      </div>
    </div>
    <div>
      <h3>Spelletje: welke kleur bal kies jij?</h3>
      <p>Volgens dezelfde logica zijn blauwe en gele ballen voor honden het duidelijkst zichtbaar — zeker op gras. Rode of groene speeltjes 'verdwijnen' voor hun neus.</p>
      <div class="bars">
        <div class="bar"><span style="color:#2563eb">Blauw</span><i style="width:92%"></i></div>
        <div class="bar"><span style="color:#ca8a04">Geel</span><i style="width:88%"></i></div>
        <div class="bar"><span style="color:#dc2626">Rood</span><i class="m" style="width:18%"></i></div>
        <div class="bar"><span style="color:#16a34a">Groen</span><i class="m" style="width:22%"></i></div>
      </div>
      <p style="margin-top:12px"><strong>Kleine extra:</strong> honden zien in het donker beter (meer staafjes en een reflecterende laag achter het netvlies, het tapetum lucidum — de groene ogen in de nacht).</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>👂 Proef 2: hoort een hond even goed als wij?</h2>
  <p class="sub">Honden horen een veel groter bereik: tot ±65 kHz tegenover ±20 kHz bij mensen. Daar komt bij dat hun beweeglijke oorschelpen (met ±17 spieren) geluid versterken en heel precies lokaliseren.</p>
  <div class="lab">
    <div>
      <h3>Luister-test: speel zelf een toon</h3>
      <p>Versleep de schuif en luister. Tussen 1 en 20 kHz hoor je het (mensen); boven 20 kHz kun jij het niet meer horen — maar je hond hoort het nog tot 65 kHz. Zet je oren dus in de 'hondenmodus'.</p>
      <input id="freq" type="range" min="100" max="65000" step="100" value="440" aria-label="Frequentie in hertz">
      <div><span class="readout" id="freq-out">440 Hz</span> <span id="freq-zone" style="font-weight:700;color:var(--muted)">→ jij hoort dit</span></div>
      <div class="btnrow">
        <button id="tone-play" type="button">▶️ Speel toon</button>
        <button id="tone-stop" type="button" disabled>⏹ Stop</button>
      </div>
      <p style="margin-top:10px;font-size:13px;color:var(--muted)">Tip: bij lage frequenties voel je de trilling, bij hoge fluit je hond. (Een speaker kan boven ±20 kHz niets meer weergeven — dat is natuurkunde, geen bug.)</p>
    </div>
    <div>
      <h3>Waarom schrikken honden dan van vuurwerk?</h3>
      <p>Niet alleen omdat het luid is. Vuurwerk is <strong>plotseling, hard (tot 150–190 dB op korte afstand), onvoorspelbaar en overal tegelijk</strong>. Honden hebben geen idee waar het geluid vandaan komt, horen ook de ultra-hoge fluitjes en de geur van buskruit versterkt, en kunnen het niet koppelen aan gevaar — er valt niets te 'vluchten' of te leren.</p>
      <ul style="list-style:none;display:grid;gap:9px;margin-top:12px;font-size:14px">
        <li>✅ <strong>Wat wél helpt:</strong> een veilige plek (bench), krabben aan de deur, dekens, witte ruis of zachte muziek, gordijnen dicht.</li>
        <li>✅ <strong>Vroeg beginnen:</strong> gewenning aan knallen (laagdrempelig, positief bekrachtigd) in de eerste levensmaanden.</li>
        <li>🚫 <strong>Niet doen:</strong> troosten met extra aandacht versterkt de angst, en 'straf' of boos worden maakt het erger.</li>
        <li>💊 <strong>Bij hevige angst:</strong> overleg met de dierenarts (gedragstraject of medicatie) en meld het in het forum — je bent niet de enige.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec">
  <h2>👃 Proef 3: hoe ruikt een hond — en hoe ver?</h2>
  <p class="sub">Dit is het geheim: een hond <strong>snuffelt niet alleen in, maar blaast eerst uit</strong>. Lucht gaat via twee gescheiden stromen door de neus: één stroom gaat direct naar het reukepitheel (220 miljoen receptoren), de andere naar de longen om te ademen. Het aparte 'snuiven in stoten' (sniffs, tot 5× per seconde) brengt steeds verse geurlucht naar binnen.</p>
  <div class="lab">
    <div>
      <div class="sniff" id="sniff" aria-hidden="true">🐶💨</div>
      <h3 style="margin-top:12px">Snuffel-modus</h3>
      <p>Klik op 'Nieuwe geur' — de hond blaast kort uit en zuigt daarna vers aan. Zo 'poetst' hij het spoor. Daarnaast heeft hij een orgaan achter in de neus (het vomeronasaal orgaan) dat feromonen leest: boodschappen van andere honden.</p>
      <div class="btnrow"><button id="sniff-btn" type="button">💨 Nieuwe geur opsnuiven</button></div>
    </div>
    <div>
      <h3>Hoe oud is dit spoor nog?</h3>
      <p>Versleep de schuif: hoelang geleden liep de persoon hier? Mens versus hond.</p>
      <input id="track" type="range" min="0" max="96" value="24" step="1" aria-label="Leeftijd van het spoor in uren">
      <div><span class="readout" id="track-out">24 uur</span></div>
      <div class="bars">
        <div class="bar"><span>Mens</span><i class="m" id="bar-human" style="width:4%"></i></div>
        <div class="bar"><span>Hond</span><i id="bar-dog" style="width:26%"></i></div>
      </div>
      <p style="margin-top:10px"><strong>Hoe ver?</strong> Honden ruiken geuren over honderden meters tot kilometers (bij wind mee en nat weer), en een spoor kan uren tot dagen oud zijn. Speurhonden van politie en douane vinden drugs in containers, mensen onder puin en ziektes die nog niet zichtbaar zijn. Één druppel zweet in een glas water? Een goed getrainde hond vindt het verschil.</p>
    </div>
    <div>
      <h3>Vergelijking mens vs hond</h3>
      <p>Klik op de knop om te wisselen — en onthoud: een hond 'ziet' zijn wereld voor een groot deel met zijn neus.</p>
      <div class="btnrow">
        <button id="cmp-human" class="on" type="button">👤 Mens</button>
        <button id="cmp-dog" type="button">🐕 Hond</button>
      </div>
      <div class="bars">
        <div class="bar"><span>Receptoren</span><i id="cmp-rec" style="width:88%"></i></div>
        <div class="bar"><span>Duur spoor</span><i id="cmp-age" style="width:92%"></i></div>
        <div class="bar"><span>Gehoortop</span><i id="cmp-hz" style="width:96%"></i></div>
      </div>
      <p id="cmp-label" style="margin-top:10px">👤 <strong>Mens:</strong> 5 mln receptoren · spoor max enkele uren · tot ±20 kHz.</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>🧠 Quiz: wat weet jij over de zintuigen van je hond?</h2>
  <div class="quiz" id="quiz">
    <p class="quiz-score" id="quiz-score">Score: —</p>
  </div>
</section>

<section class="sec">
  <h2>📚 Verder lezen of zelf uitproberen</h2>
  <div class="grid g3">
    <div class="card"><h3>🎓 Hondenschool in de buurt</h3><p>Van puppyklas tot speurwerk-cursus: vind gecertificeerde scholen die dit soort kennis in de praktijk brengen.</p><p style="margin-top:10px"><a class="btn ghost" href="/hondenschool" style="padding:9px 16px;font-size:13.5px">Vind een school →</a></p></div>
    <div class="card"><h3>💬 Ervaar het zelf</h3><p>Kies een blauwe of gele bal, leg een geurspoor met een snoepje en test het reukvermogen van je eigen hond. Deel je resultaat in het forum.</p><p style="margin-top:10px"><a class="btn ghost" href="/forum" style="padding:9px 16px;font-size:13.5px">Naar het forum →</a></p></div>
    <div class="card"><h3>🚨 Vuurwerk- en stormprotocol</h3><p>In de vermist-gids staat een compleet stappenplan voor de jaarwisseling: dubbel aanlijnen, tuincheck en veilige plek.</p><p style="margin-top:10px"><a class="btn ghost" href="/vermist" style="padding:9px 16px;font-size:13.5px">Naar de veiligheidsgids →</a></p></div>
  </div>
</section>

<script>
(function(){
  /* Kleurenproef */
  var humanImg='/assets/img/pomeriaan-640.webp', dogImg='/assets/img/pomeriaan-hondzien.webp';
  document.getElementById('viz-human').addEventListener('click',function(){swapViz(true);});
  document.getElementById('viz-dog').addEventListener('click',function(){swapViz(false);});
  function swapViz(human){
    document.getElementById('viz-img').src=human?humanImg:dogImg;
    document.getElementById('viz-cap').textContent=human?'Mens (3 kegeltjes)':'Hond (gesimuleerd)';
    document.getElementById('viz-human').classList.toggle('on',human);
    document.getElementById('viz-dog').classList.toggle('on',!human);
  }
  /* Gehoortest */
  var ctx=null, osc=null, playing=false;
  var freq=document.getElementById('freq'), out=document.getElementById('freq-out'), zone=document.getElementById('freq-zone');
  freq.addEventListener('input',function(){update();});
  function update(){
    var f=+freq.value;
    out.textContent=f.toLocaleString('nl-NL')+' Hz';
    zone.textContent=f>20000?'→ voor jou onhoorbaar, je hond hoort het wél':'→ jij hoort dit (hond ook)';
    if(playing&&osc){try{osc.frequency.setValueAtTime(f,ctx.currentTime);}catch(e){}}
  }
  document.getElementById('tone-play').addEventListener('click',function(){
    if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume();
    if(!osc){osc=ctx.createOscillator();osc.type='sine';osc.connect(ctx.destination);osc.start();}
    osc.frequency.setValueAtTime(+freq.value,ctx.currentTime);
    playing=true;document.getElementById('tone-stop').disabled=false;
  });
  document.getElementById('tone-stop').addEventListener('click',function(){
    if(osc){try{osc.stop();}catch(e){}osc=null;}
    playing=false;document.getElementById('tone-stop').disabled=true;
  });
  /* Ruik-proef */
  var sniff=document.getElementById('sniff');
  var sniffTimer=null;
  document.getElementById('sniff-btn').addEventListener('click',function(){
    sniff.classList.add('on');
    clearTimeout(sniffTimer);
    setTimeout(function(){
      sniff.classList.remove('on');
      sniffTimer=setTimeout(function(){
        sniff.querySelector('text')&&sniff.firstChild;
      },600);
    },900);
  });
  var track=document.getElementById('track'),bH=document.getElementById('bar-human'),bD=document.getElementById('bar-dog'),tOut=document.getElementById('track-out');
  track.addEventListener('input',function(){
    var h=+track.value;
    tOut.textContent=h+' uur';
    /* mens: na ±2u nauwelijks nog iets; hond: tot ±96u (speurhonden dagen) */
    bH.style.width=Math.min(100,Math.round(Math.max(2,h<=2?100:(2/h)*100*0.35)))+'%';
    bD.style.width=Math.min(100,Math.round(8+(h/96)*92))+'%';
  });
  track.dispatchEvent(new Event('input'));
  /* Vergelijking */
  var human={rec:'5 mln receptoren',age:'enkele uren',hz:'±20 kHz',line:'👤 <strong>Mens:</strong> 5 mln receptoren · spoor max enkele uren · tot ±20 kHz.'};
  var dog={rec:'220 mln receptoren',age:'dagen (speurhonden)',hz:'±65 kHz',line:'🐕 <strong>Hond:</strong> 220 mln receptoren · spoor dagen oud · tot ±65 kHz.'};
  document.getElementById('cmp-human').addEventListener('click',function(){cmp(true);});
  document.getElementById('cmp-dog').addEventListener('click',function(){cmp(false);});
  function cmp(humanMode){
    document.getElementById('cmp-human').classList.toggle('on',humanMode);
    document.getElementById('cmp-dog').classList.toggle('on',!humanMode);
    var w=humanMode?{rec:30,age:35,hz:30}:{rec:93,age:95,hz:96};
    document.getElementById('cmp-rec').style.width=w.rec+'%';
    document.getElementById('cmp-age').style.width=w.age+'%';
    document.getElementById('cmp-hz').style.width=w.hz+'%';
    document.getElementById('cmp-label').innerHTML=humanMode?human.line:dog.line;
  }
  /* Quiz */
  var QS=[
    {q:'Hoeveel soorten kegeltjes heeft een hond in zijn oog?',a:['Drie (zoals mensen)','Twee','Geen — honden zien zwart-wit'],r:1},
    {q:'Welke kleur bal is het beste zichtbaar voor je hond?',a:['Rood','Groen','Blauw of geel'],r:2},
    {q:'Tot welke frequentie hoort een hond ongeveer?',a:['±20 kHz','±65 kHz','±1 kHz'],r:1},
    {q:'Waar komt een hond zijn superieure reukvermogen vandaan?',a:['Grotere ogen','Meer geurreceptoren + twee luchtstromen','Grotere oren'],r:1},
    {q:'Waarom schrikt een hond extra heftig van vuurwerk?',a:['Omdat hij alleen hoge tonen hoort','Omdat het plotseling, hard en onvoorspelbaar is en hij het niet kan plaatsen','Omdat hij zich er niet kan verstoppen'],r:1}
  ];
  var qi=0,score=0;
  var qEl=document.getElementById('quiz');
  function ask(){
    var item=QS[qi];
    qEl.innerHTML='<p class="quiz-score">Score: '+score+' / '+QS.length+'</p><p class="q">Vraag '+(qi+1)+' van '+QS.length+': '+item.q+'</p><div class="opts">'+item.a.map(function(opt,i){return '<button type="button" data-i="'+i+'">'+opt+'</button>';}).join('')+'</div>';
    qEl.querySelectorAll('.opts button').forEach(function(b){
      b.addEventListener('click',function(){
        var i=+b.getAttribute('data-i');
        qEl.querySelectorAll('.opts button').forEach(function(x){x.classList.remove('right','wrong');});
        if(i===item.r){score++;b.classList.add('right');}else{b.classList.add('wrong');qEl.querySelectorAll('.opts button')[item.r].classList.add('right');}
        setTimeout(function(){qi++;if(qi<QS.length)ask();else{var pct=Math.round(score/QS.length*100);qEl.innerHTML='<p class="quiz-score">Eindscore: '+score+' / '+QS.length+' ('+pct+'%)</p><p class="q">'+(pct>=80?'🏆 Super! Je kent je hond als geen ander.':'🐾 Goed bezig! Lees het Zintuigenlab nog eens en probeer opnieuw.')+'</p><div class="btnrow"><button type="button" id="quiz-restart">Opnieuw doen</button></div>';document.getElementById('quiz-restart').addEventListener('click',function(){qi=0;score=0;ask();});}},900);
      });
    });
  }
  ask();
})();
</script>`
  ;

export function zintuigenPage() {
  return pageShell({
    title: 'Zintuigenlab: hoe ziet, hoort en ruikt een hond? | TrimGids',
    description: 'Ziet een hond kleur, hoort hij beter dan de mens, waarom schrikt hij van vuurwerk en hoe werkt dat beroemde reukvermogen? Interactief Zintuigenlab met proefjes en quiz.',
    canonical: '/zintuigen',
    active: 'zintuigen',
    extraCss: CSS,
    body: BODY
  });
}
