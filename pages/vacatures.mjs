/* Pagina: Vacatures & hulpkrachten voor de hondenbranche.
   Interactief: filteren op branche/type, zoeken, en zelf een vacature of hulpvraag plaatsen (POST /api/vacatures). */
import { pageShell, esc } from './base.mjs';
import { readFile } from 'node:fs/promises';

const CSS = `
.vactool{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:18px 0 8px}
.vactool input{flex:1;min-width:220px;padding:12px 16px;border:1.6px solid var(--line);border-radius:999px;background:var(--card);font:inherit;font-size:14px}
.vactool select{padding:12px 14px;border:1.6px solid var(--line);border-radius:999px;background:var(--card);font:inherit;font-size:14px;font-weight:700;color:var(--ink)}
.vacgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-top:16px}
.vac{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:20px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px}
.vac .top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.vac .tags{display:flex;gap:6px;flex-wrap:wrap}
.vac .tags span{font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(16,185,129,.1);color:var(--g)}
.vac .tags span.free{background:rgba(217,119,6,.12);color:#b45309}
.vac .tags span.lab{background:rgba(100,116,139,.12);color:var(--muted)}
.vac h3{font-size:17px}
.vac .org{font-weight:800;font-size:13.5px;color:var(--g)}
.vac .meta{font-size:12.5px;color:var(--muted);font-weight:700;display:flex;gap:10px;flex-wrap:wrap}
.vac p{color:var(--muted);font-size:14px;flex:1}
.vac .contact{font-size:13px;font-weight:800}
.vac .contact a{color:var(--g)}
.vac-empty{text-align:center;padding:40px 20px;background:var(--card);border:1.6px dashed var(--line);border-radius:var(--r-lg);color:var(--muted);font-weight:700}
form.vacpost{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
form.vacpost .full{grid-column:1/-1}
form.vacpost label{display:grid;gap:6px;font-size:13px;font-weight:800;color:var(--ink)}
form.vacpost input,form.vacpost select,form.vacpost textarea{padding:11px 13px;border:1.6px solid var(--line);border-radius:14px;background:var(--bg);font:inherit;font-size:14px;color:var(--ink)}
form.vacpost textarea{min-height:110px;resize:vertical}
form.vacpost .ok{background:rgba(16,185,129,.08);border:1.6px solid var(--em);border-radius:14px;padding:12px 14px;font-size:13.5px;font-weight:700;color:var(--g)}
@media(max-width:700px){form.vacpost{grid-template-columns:1fr}}
`;

const BRANCH_LABEL = {
  trimsalon: '✂️ Trimsalon',
  hondenschool: '🎓 Hondenschool',
  opvang: '🏨 Pension & opvang',
  asiel: '🏠 Asiel & opvang',
  ambulance: '🚑 Dierenambulance',
  opleiding: '📚 Opleiding & stage',
  uitlaat: '🐕 Uitlaat & oppas',
  overig: '🐾 Overig'
};
const TYPE_LABEL = { betaald: '💰 Betaald', vrijwillig: '🤝 Vrijwillig', stage: '🎓 Stage/BBL' };

const BRANCHES = ['trimsalon', 'hondenschool', 'opvang', 'asiel', 'ambulance', 'opleiding', 'uitlaat', 'overig'];
const PROVINCES = ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel', 'Utrecht', 'Zeeland', 'Zuid-Holland', 'Landelijk'];

export async function vacaturesPage() {
  let items = [];
  try {
    items = JSON.parse(await readFile(new URL('../data/vacatures.json', import.meta.url), 'utf8'));
  } catch { items = []; }

  const cards = items.map(v => `
    <article class="vac" data-branch="${esc(v.branch)}" data-type="${esc(v.type)}">
      <div class="top">
        <div>
          <div class="org">${BRANCH_LABEL[v.branch] || '🐾'} · ${esc(v.org)}</div>
          <h3>${esc(v.title)}</h3>
        </div>
        <div class="tags">
          <span class="${v.type === 'vrijwillig' ? 'free' : ''}">${TYPE_LABEL[v.type] || esc(v.type)}</span>
          ${v.sample ? '<span class="lab">voorbeeld</span>' : ''}
        </div>
      </div>
      <div class="meta"><span>📍 ${esc(v.city)}${v.province && v.province !== 'Landelijk' ? ', ' + esc(v.province) : ''}</span><span>⏱ ${esc(v.hours)}</span>${v.pay ? `<span>💶 ${esc(v.pay)}</span>` : ''}</div>
      <p>${esc(v.description)}</p>
      <div class="contact">✉️ <a href="mailto:${esc(v.contact)}">${esc(v.contact)}</a>${v.postedAt ? ` · <span style="color:var(--muted)">geplaatst ${esc(v.postedAt)}</span>` : ''}</div>
    </article>`).join('');

  return pageShell({
    title: 'Vacatures in de hondenbranche: werk én hulp gezocht | TrimGids',
    description: 'Vacatures en hulpvragen uit de hondenbranche: trimsalons, hondenscholen, pensions, asielen en dierenambulances. Plaats zelf gratis een vacature of oproep.',
    canonical: '/vacatures',
    active: 'vacatures',
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Vacatures & hulpkrachten</p>
<div class="hero">
  <span class="eyebrow">Werk · Hulp · Vrijwillig</span>
  <h1>Vacatures in de hondenbranche — en hulp vragen kan hier</h1>
  <p class="intro">Trimsalon volgeboekt, hondenschool zonder trainer, asiel dat extra wandelaars zoekt? Plaats hier gratis een vacature of hulpvraag. En ben jij op zoek naar werk of een leuke bijbaan met honden? Filter, zoek en reageer direct.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">${items.length}</strong><p>actuele vacatures & oproepen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">${items.filter(v => v.type === 'vrijwillig').length}</strong><p>vrijwilligersoproepen</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">€2.350–2.800</strong><p>indicatie salaris trimmer p/m</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0 €</strong><p>plaatsen van een vacature — altijd</p></div>
  </div>
</div>

<section class="sec">
  <h2>🔎 Vind een baan of help mee</h2>
  <p class="sub">Filter op branche en/of soort, of typ een plaats of functie. Klik op de vacature om te reageren per e-mail.</p>
  <div class="vactool">
    <input id="vac-q" type="search" placeholder="Zoek op plaats, functie of organisatie…" aria-label="Zoek vacatures">
    <select id="vac-branch" aria-label="Filter op branche">
      <option value="">Alle branches</option>
      ${BRANCHES.map(b => `<option value="${b}">${BRANCH_LABEL[b]}</option>`).join('')}
    </select>
    <select id="vac-type" aria-label="Filter op soort">
      <option value="">Alles</option>
      <option value="betaald">💰 Betaald</option>
      <option value="vrijwillig">🤝 Vrijwillig</option>
      <option value="stage">🎓 Stage/BBL</option>
    </select>
  </div>
  <div id="vac-count" style="font-size:13px;font-weight:800;color:var(--muted)"></div>
  <div class="vacgrid" id="vac-grid">${cards || '<div class="vac-empty">Nog geen vacatures — plaats de eerste!</div>'}</div>
  <div class="vac-empty" id="vac-none" hidden>Geen resultaten. Pas je zoekopdracht aan of plaats hieronder zelf een oproep. 🐾</div>
</section>

<section class="sec">
  <h2>📮 Plaats zelf een vacature of hulpvraag</h2>
  <p class="sub">Gratis, zonder account. Wij publiceren vakinhoudelijke en eerlijke oproepen voor de hondenbranche; wij controleren deze redactioneel en verwijderen spam.</p>
  <form class="vacpost" id="vac-form" novalidate>
    <label>Naam organisatie / salon *<input name="org" required maxlength="90" placeholder="Bijv. Trimsalon De Vachtbaas"></label>
    <label>Functietitel *<input name="title" required maxlength="120" placeholder="Bijv. Gediplomeerd trimmer (m/v)"></label>
    <label>Branche *
      <select name="branch" required>${BRANCHES.map(b => `<option value="${b}">${BRANCH_LABEL[b]}</option>`).join('')}</select>
    </label>
    <label>Soort *
      <select name="type" required>
        <option value="betaald">💰 Betaald werk</option>
        <option value="vrijwillig">🤝 Vrijwilligerswerk / hulpvraag</option>
        <option value="stage">🎓 Stage / BBL</option>
      </select>
    </label>
    <label>Provincie *
      <select name="province" required>${PROVINCES.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
    </label>
    <label>Plaats *<input name="city" required maxlength="60" placeholder="Bijv. Utrecht"></label>
    <label>Uren / beschikbaarheid *<input name="hours" required maxlength="60" placeholder="Bijv. 2–4 dagen per week"></label>
    <label>Salaris of vergoeding<input name="pay" maxlength="80" placeholder="Bijv. €2.400–€2.800 p/m of 'vrijwillig + onkosten'"></label>
    <label class="full">Korte omschrijving *<textarea name="description" required maxlength="1200" placeholder="Wat ga je doen, wat zoek je, wat bied je? Max. 1.200 tekens."></textarea></label>
    <label class="full">Contact-e-mail (wordt openbaar getoond) *<input name="contact" type="email" required maxlength="90" placeholder="naam@organisatie.nl"></label>
    <div class="full"><button class="btn" type="submit" id="vac-submit">📤 Vacature publiceren</button> <span id="vac-msg" role="status" style="font-weight:800;margin-left:8px"></span></div>
  </form>
</section>

<section class="sec">
  <h2>✍️ Zo schrijf je een vacature die wél reacties oplevert</h2>
  <div class="grid g3">
    <div class="card"><h3>1. Wees concreet over uren</h3><p>"Af en toe" schrikt af. "2–4 dagen per week, woensdag en vrijdag" trekt precies de juiste mensen aan — zeker ook ZZP'ers en tafelhuurders.</p></div>
    <div class="card"><h3>2. Betaal eerlijk en transparant</h3><p>Vermeld salaris of een vergoeding. Voor trimwerk is €2.350–€2.800 per maand een gangbare indicatie; vrijwilligerswerk vraagt een onkostenvergoeding of training.</p></div>
    <div class="card"><h3>3. Vertel hoe het werkt met honden</h3><p>Werkt iemand zelfstandig of in een team? Welke rassen, welke vachten, hoe groot zijn de groepen? Realistische verwachtingen = minder verloop.</p></div>
    <div class="card"><h3>4. Geef de eerste stap concreet</h3><p>Mail, bel of plan een dagje mee? Een uitnodiging om een ochtend mee te lopen maakt de drempel laag en filtert meteen op motivatie.</p></div>
    <div class="card"><h3>5. Glans voor vrijwilligers</h3><p>Benoem training, begeleiding en de vaste dienst die je vraagt. Transparantie over leeftijd, rijbewijs en inwerktijd voorkomt misverstanden.</p></div>
    <div class="card"><h3>6. Denk aan vacatures wijd en zijd</h3><p>Dierenbranche-posters zoals de Dierenbescherming, Groomers Europe, indeed en regionale MBO-bemiddelaars zijn goede extra kanalen naast deze pagina.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/vrijwilligers">🤝 Meer over vrijwilligerswerk bij asiel & opvang →</a>
    <a class="btn ghost" href="/forum">💬 Vraag het de community →</a>
  </div>
</section>

<script>
(function () {
  var grid = document.getElementById('vac-grid');
  var none = document.getElementById('vac-none');
  var count = document.getElementById('vac-count');
  var q = document.getElementById('vac-q');
  var branch = document.getElementById('vac-branch');
  var type = document.getElementById('vac-type');
  var form = document.getElementById('vac-form');
  var msg = document.getElementById('vac-msg');

  function applyFilters() {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.vac'));
    var query = q.value.trim().toLowerCase();
    var b = branch.value, t = type.value;
    var shown = 0;
    cards.forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var ok = (!query || text.indexOf(query) !== -1) && (!b || card.getAttribute('data-branch') === b) && (!t || card.getAttribute('data-type') === t);
      card.hidden = !ok;
      if (ok) shown++;
    });
    none.hidden = shown !== 0;
    count.textContent = shown + (shown === 1 ? ' vacature/oproep' : ' vacatures/oproepen') + ' getoond';
  }
  applyFilters();
  [q, branch, type].forEach(function (el) { el.addEventListener('input', applyFilters); el.addEventListener('change', applyFilters); });

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var btn = document.getElementById('vac-submit');
    if (!form.reportValidity()) return;
    btn.disabled = true;
    msg.textContent = 'Publiceren…';
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    try {
      var res = await fetch('/api/vacatures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Er ging iets mis');
      msg.textContent = '';
      form.reset();
      var card = document.createElement('article');
      card.className = 'vac';
      card.setAttribute('data-branch', data.branch);
      card.setAttribute('data-type', data.type);
      var typeLabel = { betaald: '💰 Betaald', vrijwillig: '🤝 Vrijwillig', stage: '🎓 Stage/BBL' }[data.type] || data.type;
      card.innerHTML = '<div class="top"><div><div class="org">' + data.branch + ' · ' + data.org + '</div><h3>' + data.title + '</h3></div><div class="tags"><span>' + typeLabel + '</span><span class="lab">nieuw</span></div></div><div class="meta"><span>📍 ' + data.city + (data.province && data.province !== 'Landelijk' ? ', ' + data.province : '') + '</span><span>⏱ ' + data.hours + '</span>' + (data.pay ? '<span>💶 ' + data.pay + '</span>' : '') + '</div><p>' + data.description + '</p><div class="contact">✉️ <a href="mailto:' + data.contact + '">' + data.contact + '</a></div>';
      grid.prepend(card);
      applyFilters();
      msg.innerHTML = '✅ <span style="color:var(--g)">Gepubliceerd! Je oproep staat bovenaan de lijst.</span>';
    } catch (err) {
      msg.innerHTML = '<span style="color:#dc2626">⚠️ ' + (err.message || 'Publiceren mislukt') + '</span>';
    }
    btn.disabled = false;
  });
})();
</script>`
  });
}
