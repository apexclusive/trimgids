import { pageShell } from './base.mjs';

const CSS = `
.baasjes-hero{
  background:linear-gradient(135deg, rgba(15,62,40,.12), rgba(16,185,129,.08)), var(--card);
  border:1px solid var(--line);
  border-radius:28px;
  padding:clamp(24px,3.4vw,38px);
  box-shadow:var(--shadow);
  display:grid;
  grid-template-columns:1.2fr .8fr;
  gap:20px;
  align-items:center;
}
.baasjes-hero img{border-radius:22px;border:1px solid var(--line);width:100%;height:100%;min-height:280px;object-fit:cover}
.baasjes-hero .eyebrow{margin-bottom:8px}
.baasjes-hero h1{font-size:clamp(30px,3.5vw,48px);margin:0 0 12px}
.baasjes-hero p{color:var(--muted);font-size:16px;line-height:1.7;margin:0}
.baasjes-trust{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.baasjes-trust span{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid rgba(16,185,129,.22);background:rgba(16,185,129,.08);border-radius:999px;font-weight:800;font-size:12.5px;color:var(--g)}
.baasjes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:18px}
.baasjes-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:var(--shadow)}
.baasjes-card h3{font-size:20px;margin:0 0 8px}
.baasjes-card p{color:var(--muted);font-size:14.5px;line-height:1.65;margin:0}
.quote-box{background:var(--card);border-left:4px solid var(--em);padding:22px 24px;border-radius:18px;box-shadow:var(--shadow);margin-top:18px}
.quote-box p{font-size:17px;line-height:1.7;color:var(--ink);margin:0}
.quote-box small{display:block;color:var(--muted);margin-top:8px;font-weight:700}
.section-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
@media(max-width:760px){.baasjes-hero{grid-template-columns:1fr}.baasjes-hero img{min-height:220px}}
`;

export function baasjesPage() {
  return pageShell({
    title: 'Voor baasjes: jouw hond, jouw gezin, jouw verhaal | TrimGids',
    description: 'Een warme, praktische pagina voor baasjes: over liefde, verlies, twijfel, fokkers, bevallingen, doodgebore pups, verwachtingen en steun. Jij bent niet de enige.',
    canonical: '/voor-baasjes',
    active: 'baasjes',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Voor baasjes</p>
<div class="baasjes-hero">
  <div>
    <span class="eyebrow">Voor baasjes</span>
    <h1>Jouw hond is meer dan een dier. Voor veel mensen voelt hij als een kind.</h1>
    <p>Wij weten uit eigen ervaring hoe belangrijk een hond kan zijn in je leven. Een hond brengt liefde, structuur, vreugde en soms ook zorgen. En dat is precies waarom we deze pagina hebben gemaakt: voor alle baasjes die op een moment in hun leven voelen dat ze niet alleen zijn in de zorgen, de twijfels en de liefde.</p>
    <div class="baasjes-trust">
      <span>💛 Liefde zonder voorwaardes</span>
      <span>🫶 Ongerustheid, hoop en verlies</span>
      <span>🐾 Geen eenzame zorgen</span>
    </div>
  </div>
  <img src="/assets/img/cat-opvang-960.webp" alt="Hond met baasje tijdens een warme, veilige moment" loading="lazy" decoding="async">
</div>

<section class="sec">
  <h2>Wij zijn niet alleen. In Nederland hebben veel huishoudens een hond — en vaak meer dan één.</h2>
  <p class="sub">Bijna 1 op de 3 huishoudens in Nederland heeft één of meerdere honden. Dat is geen random getal: het laat zien hoe normaal het is om een hond niet als “gewoon dier” te zien, maar als een echte deel van het gezin. Een tweede hond wordt vaak niet gedaan uit impuls, maar uit liefde, rust en een diep verlangen om de band nog verder te vullen. Veel baasjes ontdekken dat een tweede hond niet alleen meer warmte geeft, maar ook meer balans in het dagelijks leven.</p>
  <div class="baasjes-grid">
    <div class="baasjes-card">
      <h3>Een tweede hond kan een verrijking zijn</h3>
      <p>Honden vullen elkaar aan. De een is rustig en attent, de ander druk en speels. Samen creëren ze een dynamiek die voor veel baasjes echt een verrijking is. Ze houden elkaar gezelschap, brengen elkaar afleiding en zorgen voor een extra laag van warmte in huis.</p>
    </div>
    <div class="baasjes-card">
      <h3>Maar een goede training is een investering</h3>
      <p>Als je meerdere honden in huis hebt, vraagt dat om structuur, rust en duidelijke grenzen. Niet alles verloopt vanzelf. Goede training, consistente afspraken en een gezonde sociale ontwikkeling maken het verschil tussen een ontspannen huishouden en een overweldigende situatie.</p>
    </div>
    <div class="baasjes-card">
      <h3>Jij bent niet de enige</h3>
      <p>Veel mensen hebben dit bedacht, geprobeerd of meegemaakt. Sommige gaan met een tweede hond de stap in omdat ze weten dat honden een enorme positieve kracht kunnen hebben in een gezin. Anderen willen vooral steun, helderheid en herkenning bij de praktische kant ervan. Beide zijn legitiem.</p>
    </div>
  </div>
</section>

<section class="sec">
  <h2>Wat veel baasjes meemaken in de zoektocht naar een tweede hond of een goede pup</h2>
  <p class="sub">De zoektocht naar een juiste fokker, een gezonde pup of een veilig begin kan ook een zware reis zijn. Niet iedereen krijgt een hartelijk, helder verhaal. Soms gaat het goed, soms niet. En soms ga je met je hart te veel mee. Maar dat maakt de liefde niet minder echt.</p>
  <div class="baasjes-grid">
    <div class="baasjes-card">
      <h3>Wensen, dromen en hoge verwachtingen</h3>
      <p>Sommige rassen kunnen veel pups krijgen. Vaak zijn er dan veel nieuwe baasjes met hoge verwachtingen: een gezond, mooi, rustig, sociaal en “perfect” dier. Maar dat is niet altijd wat het traject oplevert.</p>
    </div>
    <div class="baasjes-card">
      <h3>Bevruchting, dracht en bevalling</h3>
      <p>Op afstand meekrijgen van een dracht en een bevalling is emotioneel zwaar. Je wilt zo graag dat alles goed gaat. Maar dat is niet altijd het geval. En dat doet pijn.</p>
    </div>
    <div class="baasjes-card">
      <h3>Pijnlijke realiteit</h3>
      <p>Helaas halen sommige pups het niet. Er kan sprake zijn van te weinig levensvatbaarheid, ziekte, complicaties of een uitval die je als baasje onvoorstelbaar hard raakt. Dat is geen “slecht” gevoel — het is menselijk.</p>
    </div>
  </div>
  <div class="quote-box">
    <p>“Het is niet alleen een puppy of een hond. Voor veel mensen is het een stukje van hun gezin, hun routine, hun toekomst. Wanneer iets niet goed gaat, voelt dat soms veel zwaarder aan dan mensen beseffen. En wanneer het wél goed gaat, voelt dat soms bijna onbeschrijflijk mooi.”</p>
    <small>TrimGids — voor baasjes met hart</small>
  </div>
</section>

<section class="sec">
  <h2>Waar kun je terecht als je dit meemaakt?</h2>
  <p class="sub">Je bent niet de enige. Heb je twijfels, zorgen of een verhaal dat je wilt delen? Dan is er plaats voor je. Hier kun je terecht voor herkenning, steun, ervaring en praktische hulp.</p>
  <div class="baasjes-grid">
    <div class="baasjes-card">
      <h3>🌿 In het forum</h3>
      <p>Deel je verhaal met andere baasjes die het misschien ook hebben meegemaakt. Er is geen oordeel, alleen steun. Je bent niet alleen — en je hoeft het niet stil te houden.</p>
    </div>
    <div class="baasjes-card">
      <h3>🐾 In de gidsen</h3>
      <p>Lees hoe je een goede fokker herkent, waar je op moet letten en welke vragen je kunt stellen voordat een pup bij jou thuis komt.</p>
    </div>
    <div class="baasjes-card">
      <h3>💬 Bij mensen die begrijpen</h3>
      <p>We willen een veilige, eerlijke en liefdevolle plek bouwen waar mensen met een hart voor honden zich gehoord voelen, ook in moeilijke tijden.</p>
    </div>
  </div>
  <div class="section-cta">
    <a class="btn" href="/forum">Ga naar het forum →</a>
    <a class="btn ghost" href="/fokkers">Bekijk de fokkersgids →</a>
    <a class="btn ghost" href="/aankoopgids">Lees de aankoopgids →</a>
  </div>
</section>

<section class="sec">
  <h2>En ook: als het goed gaat, is het het mooiste wat er is.</h2>
  <p class="sub">Als alles goed gaat, dan wordt een hond vaak je beste vriend of vriendin. De hond die je van de supermarkt terug ziet, alsof je een jaar weggeweest bent. De hond die altijd blij is om je te zien. De hond die loyaal is, liefdevol en zonder voorwaarde. Geen mens kan die trouw en warmte altijd even goed geven als een hond.</p>
  <div class="quote-box">
    <p>“Niets is zo lief, trouw, aanhankelijk en betrouwbaar als een mooie hond. Een hond is niet alleen een dier — voor veel mensen is een hond een gezin, een vriend, een troost, een kind en een bron van pure liefde.”</p>
    <small>TrimGids — met hart voor ieder baasje</small>
  </div>
</section>
` })
}

export default baasjesPage;
