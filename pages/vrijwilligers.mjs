/* Pagina: Vrijwilligerswerk bij honden, opvang en asiel.
   Interactief: rolkiezer, eisenkaarten, stappenplan en aanmeldformulier (POST /api/vrijwilligers). */
import { pageShell, esc } from './base.mjs';

const CSS = `
.roles{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:16px}
.role{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:20px;box-shadow:var(--shadow)}
.role .ic{font-size:30px}
.role h3{font-size:16.5px;margin:8px 0 4px}
.role p{color:var(--muted);font-size:14px}
.role .need{margin-top:10px;padding:11px 13px;border-radius:12px;background:rgba(217,119,6,.08);border:1px solid rgba(217,119,6,.25);font-size:13px;font-weight:700}
.role .need b{display:block;color:#b45309;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.avail{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}
.avail button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.avail button.on{background:var(--g);border-color:var(--g);color:#fff}
form.vol{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
form.vol .full{grid-column:1/-1}
form.vol label{display:grid;gap:6px;font-size:13px;font-weight:800}
form.vol input,form.vol select,form.vol textarea{padding:11px 13px;border:1.6px solid var(--line);border-radius:14px;background:var(--bg);font:inherit;font-size:14px;color:var(--ink)}
form.vol textarea{min-height:100px;resize:vertical}
.orow{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:16px}
.ostep{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;position:relative}
.ostep .n{width:34px;height:34px;border-radius:12px;background:var(--g);color:#fff;display:grid;place-items:center;font-weight:800;margin-bottom:10px}
.ostep h3{font-size:15.5px;margin-bottom:4px}
.ostep p{color:var(--muted);font-size:13.5px}
@media(max-width:700px){form.vol{grid-template-columns:1fr}}
`;

const ROLES = [
  { ic: '🦮', t: 'Uitlaten & verzorgen in het asiel', p: 'De meest gevraagde rol: wandelen, socialiseren, kennels poetsen en meehelpen bij kennismakingen. Direct contact met de honden en vaak flexibele diensten.', need: '16+ (asielafhankelijk), inwerktraining, vaste dienst van ±4 uur per week', dur: 'Gemiddeld 2–8 uur per week' },
  { ic: '🏠', t: 'Pleeggezin / gastgezin', p: 'Honden die (nog) niet in het asiel kunnen — jonge pups, herstellende dieren of honden die in een huiselijke setting moeten wennen. Ook rolstoelhonden en puppypleeggezinnen voor geleidehonden.', need: 'Rustige woonomgeving, tijd, vaak een hond- of kattentest; asiel betaalt voer en zorg', dur: 'Van enkele weken tot maanden; bij geleidehonden 14–16 maanden' },
  { ic: '🚑', t: 'Dierenambulance', p: 'Zieke, gewonde of gevonden dieren ophalen, vervoeren en melden bij de juiste opvang. Je werkt meestal in duo en draait ook avond- en weekenddiensten.', need: '18+, rijbewijs B, EHBO-dieren is een plus, inwerktraject', dur: '1–2 diensten per maand' },
  { ic: '🎓', t: 'Adoptiebegeleiding & intake', p: 'Adoptiegesprekken voeren, thuischecks plannen, dossiers bijhouden en nabeleggen met adoptanten na de eerste weken thuis.', need: 'Goede communicatie, soms VOG, inwerktraining', dur: 'Flexibel, vaak 2–4 uur per week' },
  { ic: '🥰', t: 'Dierenbuddy', p: 'Helpen bij kwetsbare baasjes: uitlaten, passen op de hond of boodschappen tijdens ziekte, ziekenhuisopname of ouderdom. Kleine moeite, groot verschil.', need: 'Betrouwbaar, empathisch; afstemming lokale organisatie', dur: 'Enkele uren per week, flexibel' },
  { ic: '🦉', t: 'Wildopvang & revalidatie', p: 'Egels, vogels en andere wilde dieren opvangen, verzorgen en weer vrijlaten. Werkt vaak op termijn en vraagt discipline: geen aanhechting tonen.', need: 'Bereidheid tot kwetsbare dieren, weekend- en avondwerk, training', dur: 'Variabel, weekenden veel gevraagd' },
  { ic: '📣', t: 'Collecte, acties & voorlichting', p: 'Collecteren in de week rond Dierendag, gastlessen op scholen, kraampjes op evenementen of social media beheren voor je lokale opvang.', need: 'Enthousiasme; kennis van dierenwelzijn is een plus', dur: 'Projectmatig of enkele uren per week' },
  { ic: '📸', t: 'Fotografie, website & administratie', p: 'Hondenfoto\'s maken voor het adoptieplatform, de website bijhouden, vertalen of de administratie ondersteunen — vaak gewoon vanaf de bank.', need: 'Vakkennis (foto/IT/administratie), soms VOG', dur: 'Thuis, flexibel' }
];

export function vrijwilligersPage() {
  return pageShell({
    title: 'Vrijwilligerswerk met honden: asiel, opvang & ambulance | TrimGids',
    description: 'Vrijwilligerswerk voor honden en hondenopvang: rollen, eisen, tijdsinvestering en hoe je begint. Van uitlaten in het asiel tot dierenambulance en pleeggezin.',
    canonical: '/vrijwilligers',
    active: 'vrijwilligers',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Vrijwilligerswerk</p>
<div class="hero">
  <span class="eyebrow">Honden helpen · mensen blijven</span>
  <h1>Vrijwilligerswerk voor honden, asiel & opvang</h1>
  <p class="intro">Nederlandse asielen en hondenopvangcentra draaien voor een groot deel op vrijwilligers: uitlaten, verzorgen, kennismakingen, chauffeur zijn op de ambulance of een pleeggezin vormen. Kies hieronder een rol die past bij jouw tijd en situatie — en meld je aan.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">Tienduizenden</strong><p>dieren per jaar opgevangen door o.a. de Dierenbescherming</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">2–8 uur</strong><p>per week is vaak al genoeg</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">16+</strong><p>meestal de minimumleeftijd in het asiel (18+ bij ambulance)</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0 €</strong><p>kosten voor jou — trainingen vaak gratis</p></div>
  </div>
</div>

<section class="sec">
  <h2>🐾 Kies een rol: wat past bij jou?</h2>
  <p class="sub">Klik op een rol om te zien wat er wordt gevraagd. Veel organisaties kijken vooral naar betrouwbaarheid en liefde voor dieren — vakdiploma's zijn zelden nodig.</p>
  <div class="roles">
    ${ROLES.map(r => `
    <div class="role">
      <div class="ic">${r.ic}</div>
      <h3>${r.t}</h3>
      <p>${r.p}</p>
      <div class="need"><b>Wat wordt gevraagd</b>${r.need}</div>
      <p style="font-size:12.5px;color:var(--muted)">⏳ <strong>Tijdsinvestering:</strong> ${r.dur}</p>
    </div>`).join('')}
  </div>
</section>

<section class="sec">
  <h2>📋 Hoe begin je? In 5 stappen</h2>
  <div class="orow">
    <div class="ostep"><div class="n">1</div><h3>Oriënteer je</h3><p>Kies een rol en een organisatie bij jou in de buurt. Kijk op de website van de Dierenbescherming, jouw lokale asiel of een dierenambulance.</p></div>
    <div class="ostep"><div class="n">2</div><h3>Meld je aan</h3><p>De meeste organisaties hebben een online aanmeldformulier of een vacaturepagina. Solliciteer soms ook gewoon bellen, informeer naar de eerstvolgende vrijwilligersavond.</p></div>
    <div class="ostep"><div class="n">3</div><h3>Doe de intake</h3><p>Een kennismakingsgesprek en rondleiding: organisaties kijken of jij bij de honden en het team past en informeren naar je beschikbaarheid.</p></div>
    <div class="ostep"><div class="n">4</div><h3>Volg de inwerktraining</h3><p>Bij de meeste serieuze organisaties verplicht: huisregels, omgang met de dieren, dossiers en hygiëne. Bij de ambulance ook vangen, vervoeren en EHBO.</p></div>
    <div class="ostep"><div class="n">5</div><h3>Bouw een vaste routine</h3><p>Dieren in een opvang reageren goed op vaste gezichten en diensten. Onregelmatige inzet verstoort de rust en legt druk op de vaste krachten.</p></div>
  </div>
</section>

<section class="sec">
  <h2>📬 Aanmeldinteresse doorgeven</h2>
  <p class="sub">Vul dit formulier in en wij sturen je (per e-mail) een kort overzicht van organisaties en vacatures die bij jouw keuze en regio passen. Vrijblijvend, geen account nodig.</p>
  <form class="vol" id="vol-form" novalidate>
    <label>Voornaam *<input name="firstName" required maxlength="60" placeholder="Bijv. Sanne"></label>
    <label>E-mailadres *<input name="email" type="email" required maxlength="90" placeholder="jij@voorbeeld.nl"></label>
    <label>Woonplaats *<input name="city" required maxlength="60" placeholder="Bijv. Eindhoven"></label>
    <label>Provincie *
      <select name="province" required>
        <option value="">— kies —</option>
        ${['Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'].map(p => `<option>${p}</option>`).join('')}
      </select>
    </label>
    <label class="full">Favoriete rol *
      <select name="role" required>
        <option value="">— kies een rol —</option>
        ${ROLES.map(r => `<option>${r.t}</option>`).join('')}
      </select>
    </label>
    <label>Beschikbaarheid<input name="availability" maxlength="80" placeholder="Bijv. '2 avonden per week' of 'elke zondagochtend'"></label>
    <label>Leeftijd (16+ / 18+ bij ambulance)<input name="age" maxlength="20" placeholder="Bijv. 24"></label>
    <label class="full">Waarom wil je helpen? (optioneel)<textarea name="motivation" maxlength="600" placeholder="Vertel kort over je ervaring met honden en je motivatie."></textarea></label>
    <div class="full"><button class="btn" type="submit" id="vol-submit">🤝 Interesse doorgeven</button> <span id="vol-msg" role="status" style="font-weight:800;margin-left:8px"></span></div>
  </form>
</section>

<section class="sec">
  <h2>❓ Veelgestelde vragen over vrijwilligerswerk</h2>
  <div class="qas">
    <div class="qa"><b>Moet ik een opleiding hebben?</b><p>Voor de meeste rollen niet. Wat je nodig hebt, leer je in de inwerktraining van de organisatie zelf. Alleen voor bepaalde taken is iets extra's gevraagd: rijbewijs B voor de ambulance, EHBO-dieren als pluspunt, of communicatieve vaardigheden bij voorlichting.</p></div>
    <div class="qa"><b>Hoe oud moet ik zijn?</b><p>De meeste asielen hanteren 16 jaar voor zelfstandig uitlaten; 12–16 jaar kan vaak alleen onder begeleiding. Voor de dierenambulance geldt meestal 18 jaar + rijbewijs B. Sommige asielen vragen 18+ — check het per organisatie.</p></div>
    <div class="qa"><b>Krijg ik een vergoeding?</b><p>Vrijwilligerswerk is onbetaald, maar trainingen zijn vaak gratis en sommige organisaties vergoeden reis- of verzorgingskosten. Bij pleegzorg worden voer en dierzorg meestal betaald door de organisatie.</p></div>
    <div class="qa"><b>Hoeveel tijd kost het?</b><p>Van een paar uur per maand (collecte, fotografie achter de laptop) tot een vaste dienst van 4 uur per week. Sommige asielen vragen een minimale inzet van ±6 maanden — eerlijk is dat ze investeren in jouw training.</p></div>
    <div class="qa"><b>Is een VOG nodig?</b><p>Soms, vooral bij adoptiebegeleiding en rollen met kwetsbare mensen. Vraag het na bij de organisatie; zij regelen de aanvraag meestal.</p></div>
    <div class="qa"><b>En als ik liever betaald werk wil?</b><p>Prima — er is ook genoeg betaald werk in de hondenbranche. Bekijk de <a href="/vacatures" style="color:var(--g);font-weight:800">vacaturepagina</a> of de vacatures van de Dierenbescherming en lokale opvangcentra.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/vacatures">💼 Betaald werk of vrijwillig? Bekijk vacatures →</a>
    <a class="btn ghost" href="/adoptie">🏠 Liever zelf een hond opvangen? →</a>
  </div>
</section>

<script>
(function () {
  var form = document.getElementById('vol-form');
  var msg = document.getElementById('vol-msg');
  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    var btn = document.getElementById('vol-submit');
    btn.disabled = true;
    msg.textContent = 'Versturen…';
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    try {
      var res = await fetch('/api/vrijwilligers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Er ging iets mis');
      form.reset();
      msg.innerHTML = '✅ <span style="color:var(--g)">Ontvangen! We mailen je binnen enkele dagen een overzicht voor ' + data.city + '.</span>';
      btn.textContent = '✅ Aangemeld';
    } catch (err) {
      msg.innerHTML = '<span style="color:#dc2626">⚠️ ' + (err.message || 'Versturen mislukt') + '</span>';
    }
    btn.disabled = false;
  });
})();
</script>`
  });
}
