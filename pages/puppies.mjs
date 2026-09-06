/* PuppyMarktplaats — geverifieerde fokkers met pups in Nederland (Ronde 15).
   SSR-marktplaats: foto-kaarten met prijs-tag, filters, detail-dialoog en
   een veilig formulier waar fokkers hun nest kunnen aanbieden. */
import { pageShell, esc } from './base.mjs';

const CSS = `
/* ---------- Marktplaats-kaarten (premium foto-tiles) ---------- */
.pm-hero {
  position: relative; border-radius: 28px; overflow: hidden;
  margin: 8px 0 26px; min-height: 260px; display: flex; align-items: flex-end;
  box-shadow: var(--shadow-lg); border: 1px solid var(--line);
}
.pm-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pm-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(200deg, rgba(6,25,15,.02) 30%, rgba(6,25,15,.86) 100%); }
.pm-hero-content { position: relative; z-index: 1; padding: 28px 30px 24px; width: 100%; color: #fff; }
.pm-hero-content h1 { color: #fff; text-shadow: 0 2px 18px rgba(0,0,0,.35); }
.pm-hero-content p { color: rgba(255,255,255,.86); max-width: 640px; }
.pm-hero-content .eyebrow { color: #a7f3d0; }
.pm-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.pm-hero-stats span { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.24); backdrop-filter: blur(8px); padding: 6px 13px; border-radius: 999px; font: 700 12.5px 'Plus Jakarta Sans', sans-serif; }

/* Filterbalk */
.pm-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 4px 0 22px; }
.pm-search { flex: 1 1 260px; display: flex; align-items: center; gap: 9px; background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 10px 16px; box-shadow: var(--shadow); }
.pm-search input { flex: 1; border: 0; background: transparent; font: 600 14px 'Plus Jakarta Sans', sans-serif; color: var(--ink); outline: none; }
.pm-select { background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 10px 16px; font: 700 13.5px 'Plus Jakarta Sans', sans-serif; color: var(--ink); cursor: pointer; box-shadow: var(--shadow); }
.pm-result { font: 700 13px 'Plus Jakarta Sans', sans-serif; color: var(--muted); margin-left: auto; }

.pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 22px; }
.pm-card { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 22px; overflow: hidden; box-shadow: var(--shadow); cursor: pointer; transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .25s ease; animation: pcIn .5s cubic-bezier(.16,1,.3,1) both; }
.pm-card:nth-child(2) { animation-delay: .05s; } .pm-card:nth-child(3) { animation-delay: .1s; } .pm-card:nth-child(4) { animation-delay: .15s; }
.pm-card:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -16px rgba(2,32,19,.28); border-color: rgba(16,185,129,.45); }
.pm-media { position: relative; aspect-ratio: 3 / 2; overflow: hidden; background: linear-gradient(135deg, #0f3e28, #165b3c); }
.pm-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.16,1,.3,1); }
.pm-card:hover .pm-media img { transform: scale(1.06); }
.pm-price { position: absolute; right: 12px; top: 12px; background: rgba(255,255,255,.95); color: var(--g); font: 800 15px 'Plus Jakarta Sans', sans-serif; padding: 6px 12px; border-radius: 999px; box-shadow: 0 6px 18px rgba(2,32,19,.25); }
.pm-badge { position: absolute; left: 12px; top: 12px; background: rgba(6,25,15,.88); color: #6ee7b7; font: 800 10.5px 'Plus Jakarta Sans', sans-serif; letter-spacing: .07em; text-transform: uppercase; padding: 5px 11px; border-radius: 999px; backdrop-filter: blur(6px); }
.pm-fav { position: absolute; right: 12px; bottom: 10px; width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255,255,255,.9); color: var(--g); font-size: 16px; cursor: pointer; display: grid; place-items: center; box-shadow: 0 4px 14px rgba(2,32,19,.2); transition: transform .2s cubic-bezier(.16,1,.3,1); }
.pm-fav:hover { transform: scale(1.15); }
.pm-fav.on { background: #10b981; color: #fff; }
.pm-body { padding: 16px 18px 18px; display: grid; gap: 8px; }
.pm-body h3 { font-size: 16.5px; line-height: 1.3; }
.pm-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font: 600 12.5px 'Plus Jakarta Sans', sans-serif; color: var(--muted); }
.pm-meta .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--line); }
.pm-checks { display: flex; flex-wrap: wrap; gap: 6px; }
.pm-check { font: 700 11px 'Plus Jakarta Sans', sans-serif; color: var(--g); background: rgba(16,185,129,.09); border: 1px solid rgba(16,185,129,.22); padding: 4px 9px; border-radius: 999px; }
.pm-breeder { display: flex; align-items: center; gap: 8px; margin-top: 2px; font: 700 13px 'Plus Jakarta Sans', sans-serif; }
.pm-breeder .avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0f3e28, #10b981); color: #fff; display: grid; place-items: center; font: 800 11px 'Plus Jakarta Sans', sans-serif; }

/* Detail-dialoog */
.pm-dialog { position: fixed; inset: 0; z-index: 1200; display: none; }
.pm-dialog.open { display: grid; place-items: center; padding: 20px; }
.pm-dialog-backdrop { position: absolute; inset: 0; background: rgba(4,16,10,.55); backdrop-filter: blur(6px); }
.pm-dialog-card { position: relative; width: min(880px, 100%); max-height: 90vh; overflow-y: auto; background: var(--card); border-radius: 26px; border: 1px solid var(--line); box-shadow: 0 40px 90px -20px rgba(0,0,0,.5); animation: pmUp .35s cubic-bezier(.16,1,.3,1) both; }
@keyframes pmUp { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: none; } }
.pm-dialog-close { position: absolute; top: 14px; right: 14px; z-index: 3; width: 38px; height: 38px; border-radius: 50%; border: 0; background: rgba(255,255,255,.92); color: var(--g); font-size: 17px; cursor: pointer; box-shadow: 0 6px 18px rgba(2,32,19,.25); }
.pm-dialog-media { position: relative; aspect-ratio: 16 / 8; }
.pm-dialog-media img { width: 100%; height: 100%; object-fit: cover; }
.pm-dialog-body { padding: 24px 26px 26px; display: grid; gap: 14px; }
.pm-dialog-body h2 { font-size: 24px; }
.pm-dialog-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.pm-dialog-checks span { background: rgba(16,185,129,.07); border: 1px solid rgba(16,185,129,.2); border-radius: 13px; padding: 10px 13px; font: 700 13px 'Plus Jakarta Sans', sans-serif; color: var(--ink); }
.pm-dialog-cta { display: flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 700px) { .pm-dialog-checks { grid-template-columns: 1fr; } .pm-dialog-media { aspect-ratio: 16 / 10; } .pm-hero-content { padding: 22px 20px 20px; } }

/* Veiligheidskader */
.safety { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 8px 0 6px; }
.safety-item { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px; }
.safety-item h4 { font-size: 15px; margin-bottom: 6px; }
.safety-item p { font-size: 13px; color: var(--muted); line-height: 1.55; }
@media (max-width: 860px) { .safety { grid-template-columns: 1fr; } }
`;

const PROVINCES = ['Alle provincies', 'Drenthe', 'Friesland', 'Gelderland', 'Noord-Brabant', 'Utrecht', 'Zuid-Holland']; // moet overeenkomen met data/puppies.json
const BREED_ORDER = ['labrador-retriever', 'bordercollie', 'pomeriaan', 'cockapoo'];

export function puppiesPage(list = []) {
  const items = (list && list.length ? list : []).filter(p => p.status !== 'rejected' && p.status !== 'pending');
  const breedMap = new Map();
  for (const p of items) if (p.breedSlug && !breedMap.has(p.breedSlug)) breedMap.set(p.breedSlug, p.breed);
  const breedOptions = [...breedMap.entries()]
    .sort((a, b) => {
      const ia = BREED_ORDER.indexOf(a[0]), ib = BREED_ORDER.indexOf(b[0]);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || String(a[1]).localeCompare(String(b[1]));
    })
    .map(([slug, label]) => `<option value="${esc(slug)}">${esc(label)}</option>`).join('');

  const card = (p, i) => `
  <article class="pm-card" data-id="${esc(p.id)}" data-breed="${esc(p.breedSlug)}" data-province="${esc(p.province)}" data-city="${esc(p.city)}" data-breeder="${esc(p.breeder)}" data-price="${esc(String(p.price))}" data-title="${esc(p.title)}" tabindex="0" role="button" aria-label="Bekijk ${esc(p.title)}">
    <div class="pm-media">
      <picture>
        <source type="image/avif" srcset="/assets/img/gen/${esc(p.photo)}-450.avif 450w, /assets/img/gen/${esc(p.photo)}-900.avif 900w" sizes="(max-width:640px) 100vw, 380px">
        <img src="/assets/img/gen/${esc(p.photo)}-450.webp" srcset="/assets/img/gen/${esc(p.photo)}-450.webp 450w, /assets/img/gen/${esc(p.photo)}-900.webp 900w" sizes="(max-width:640px) 100vw, 380px" width="450" height="302" loading="lazy" decoding="async" alt="${esc(p.title)}">
      </picture>
      <span class="pm-price">€ ${Number(p.price).toLocaleString('nl-NL')}</span>
      <span class="pm-badge">Geverifieerde fokker</span>
      <button class="pm-fav" type="button" aria-label="Bewaar deze pup">♥</button>
    </div>
    <div class="pm-body">
      <h3>${esc(p.title)}</h3>
      <div class="pm-meta"><span>${esc(p.breed)}</span><span class="dot"></span><span>${esc(p.weeks)} weken</span><span class="dot"></span><span>${esc(p.sex)}</span></div>
      <div class="pm-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(p.city)}, ${esc(p.province)} · beschikbaar ${new Date(p.availableAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div>
      <div class="pm-checks">${(p.checks || []).slice(0, 3).map(c => `<span class="pm-check">✓ ${esc(c)}</span>`).join('')}</div>
      <div class="pm-breeder"><span class="avatar">${esc(String(p.breeder).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>${esc(p.breeder)}</div>
    </div>
  </article>`;

  const itemsHtml = items.map(card).join('') || '<div class="dir-empty"><strong>Nog geen pups geplaatst</strong><p>Wees de eerste fokker die een nest aanbiedt — gratis, met gezondheidschecks zichtbaar.</p></div>';

  return pageShell({
    title: 'PuppyMarktplaats: pups te koop bij geverifieerde fokkers (2026) | TrimGids',
    description: 'Vind pups van betrouwbare, geverifieerde fokkers in Nederland: Labrador, Border Collie, Pomeriaan en Cockapoo. Met HD/ED-röntgen, DNA-tests, stamboom en chippen zichtbaar op elke advertentie. Geen broodfok.',
    canonical: '/puppies',
    body: `
<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"Pups van geverifieerde fokkers","itemListElement":${JSON.stringify(items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title + ' — ' + p.breeder + ' (' + p.city + ')', url: 'https://trimgids.nl/puppies#' + p.id })))}}</script>

<div class="pm-hero">
  <img src="/assets/img/gen/p-labrador-900.avif" srcset="/assets/img/gen/p-labrador-450.avif 450w, /assets/img/gen/p-labrador-900.avif 900w" sizes="(max-width:640px) 100vw, 1200px" width="900" height="604" fetchpriority="high" decoding="async" alt="Labrador pups spelen op een weide">
  <div class="pm-hero-content">
    <span class="eyebrow">PuppyMarktplaats · Geverifieerde Fokkers</span>
    <h1>Pups van fokkers die je áltijd mag bezoeken</h1>
    <p>Elke advertentie toont de gezondheidschecks van de ouderdieren: HD/ED-röntgen, DNA-tests, oogonderzoek en stamboom. Geen anonieme handel — alleen nesten die je bij de fokker thuis kunt zien.</p>
    <div class="pm-hero-stats">
      <span>${items.length} nesten beschikbaar</span>
      <span>100% gezondheidscheck zichtbaar</span>
      <span>Fokker te bezoeken</span>
    </div>
  </div>
</div>

<div class="pm-bar" role="search" aria-label="Pups filteren">
  <div class="pm-search">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
    <input id="pm-q" type="search" placeholder="Zoek op ras, fokker of plaats…" aria-label="Zoek pups">
  </div>
  <select class="pm-select" id="pm-breed" aria-label="Filter op ras"><option value="">Alle rassen</option>${breedOptions}</select>
  <select class="pm-select" id="pm-prov" aria-label="Filter op provincie">${PROVINCES.map(p => `<option value="${p === 'Alle provincies' ? '' : p}">${p}</option>`).join('')}</select>
  <span class="pm-result" id="pm-count" aria-live="polite">${items.length} nesten</span>
</div>

<div class="pm-grid" id="pm-grid">${itemsHtml}</div>

<section class="sec">
  <div class="section-head"><div><span class="eyebrow">Waarom dit geen doorsnee marktplaats is</span><h2>Vijf garanties vóór je een pup koopt</h2></div></div>
  <div class="safety">
    <div class="safety-item"><h4>1 · Gezondheidsuitslagen zichtbaar</h4><p>HD/ED-röntgen, DNA-tests en oogonderzoek staan op elke advertentie — niet achteraf pas op te vragen.</p></div>
    <div class="safety-item"><h4>2 · Fokker altijd te bezoeken</h4><p>Nest en ouderdieren zijn bij de fokker thuis te zien. Geen parkeerplaats-transacties of bezorging uit het buitenland.</p></div>
    <div class="safety-item"><h4>3 · Niet eerder dan 8 weken</h4><p>Pups gaan pas weg na de sociale periode. Te jonge pups (broodfok-signaal) worden geweigerd.</p></div>
    <div class="safety-item"><h4>4 · Stamboom & chip verplicht</h4><p>FCI/NHSB-stamboom of aantoonbare lijnen, microchip geregistreerd vóór het nieuwe baasje mee naar huis gaat.</p></div>
    <div class="safety-item"><h4>5 · Levenslange ondersteuning</h4><p>De fokker blijft bereikbaar voor vragen over opvoeding, gezondheid en gedrag — dat hoort erbij.</p></div>
    <div class="safety-item"><h4>Vermoed je broodfok?</h4><p>Te goedkoop, geen bezoek mogelijk, nesten het hele jaar door? Meld het via het forum of bij de Raad van Beheer.</p></div>
  </div>
</section>

<section class="sec">
  <span class="eyebrow">Voor Dierenartsen & Fokkers</span>
  <h2>Fokker met een nest? Plaats het gratis</h2>
  <p class="sub">Vul onderstaand formulier in en jouw nest verschijnt direct op de marktplaats — mét jouw gezondheidschecks, voor baasjes die bewust kiezen.</p>
  <form class="form-grid" id="pm-form">
    <label>Nesttitel<input name="title" required maxlength="90" placeholder="Bijv. Golden Retriever pups · Litter 'Sunny'" required></label>
    <label>Ras<input name="breed" required maxlength="60" placeholder="Bijv. Golden Retriever"></label>
    <label>Prijs per pup (€)<input name="price" type="number" required min="0" step="10" placeholder="1150"></label>
    <label>Leeftijd (weken)<input name="weeks" type="number" required min="7" max="14" placeholder="8"></label>
    <label>Geslacht & aantal<input name="sex" required maxlength="40" placeholder="Bijv. 2 reuen · 1 teef"></label>
    <label>Plaats<input name="city" required maxlength="60" placeholder="Bijv. Epe"></label>
    <label>Provincie<select name="province" required>${PROVINCES.filter(p => p !== 'Alle provincies').map(p => `<option>${p}</option>`).join('')}</select></label>
    <label>Fokkernaam<input name="breeder" required maxlength="80" placeholder="Bijv. Kennel Amberfield"></label>
    <label>E-mail fokker<input name="email" type="email" required maxlength="100" placeholder="fokker@kennel.nl"></label>
    <label>Gezondheidschecks<textarea name="checks" required maxlength="400" placeholder="HD/ED-röntgen, DNA: EIC/PRA vrij, oogonderzoek, stamboom…"></textarea></label>
    <label class="full">Omschrijving<textarea name="text" required maxlength="800" placeholder="Karakter, socialisatie, bijzonderheden…"></textarea></label>
    <label class="full checkbox-label"><input type="checkbox" name="agree" required> Ik bevestig dat ouderdieren op gezondheid zijn (laten) testen, de fokker bezocht kan worden en pups niet jonger dan 8 weken weg gaan.</label>
    <button class="btn-submit full" type="submit">Plaats nest op de marktplaats →</button>
    <p id="pm-status" class="status-msg full" hidden></p>
  </form>
</section>

<div class="pm-dialog" id="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-dialog-title" hidden>
  <div class="pm-dialog-backdrop" data-pm-close></div>
  <div class="pm-dialog-card">
    <button class="pm-dialog-close" type="button" data-pm-close aria-label="Sluiten">✕</button>
    <div class="pm-dialog-media"><img id="pm-dialog-img" src="" alt=""></div>
    <div class="pm-dialog-body">
      <span class="eyebrow">Nest van geverifieerde fokker</span>
      <h2 id="pm-dialog-title"></h2>
      <div class="pm-meta" id="pm-dialog-meta"></div>
      <p id="pm-dialog-text"></p>
      <div class="pm-dialog-checks" id="pm-dialog-checks"></div>
      <div class="pm-dialog-cta">
        <a class="btn" id="pm-dialog-contact" href="#">Mail de fokker over dit nest →</a>
        <a class="btn ghost" href="/fokkers">Hoe controleer ik een fokker?</a>
      </div>
    </div>
  </div>
</div>

<script>
(function () {
  var DATA = ${JSON.stringify(items)};
  var grid = document.getElementById('pm-grid');
  var q = document.getElementById('pm-q'), breedSel = document.getElementById('pm-breed'), provSel = document.getElementById('pm-prov');
  var count = document.getElementById('pm-count');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pm-card'));
  function apply() {
    var query = (q.value || '').trim().toLowerCase();
    var breed = breedSel.value, prov = provSel.value;
    var visible = cards.filter(function (c) {
      if (query) {
        var hay = [c.getAttribute('data-title'), c.getAttribute('data-breed'), c.getAttribute('data-city'), c.getAttribute('data-province'), c.getAttribute('data-breeder')].join(' ').toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      if (breed && c.getAttribute('data-breed') !== breed) return false;
      if (prov && c.getAttribute('data-province') !== prov) return false;
      return true;
    });
    cards.forEach(function (c) { c.hidden = visible.indexOf(c) === -1; });
    if (count) count.textContent = visible.length + (visible.length === 1 ? ' nest' : ' nesten');
  }
  [q, breedSel, provSel].forEach(function (el) { if (el) el.addEventListener('input', apply); });
  if (breedSel) breedSel.addEventListener('change', apply);
  if (provSel) provSel.addEventListener('change', apply);

  var dialog = document.getElementById('pm-dialog');
  var dImg = document.getElementById('pm-dialog-img'), dTitle = document.getElementById('pm-dialog-title'), dMeta = document.getElementById('pm-dialog-meta'), dText = document.getElementById('pm-dialog-text'), dChecks = document.getElementById('pm-dialog-checks'), dContact = document.getElementById('pm-dialog-contact');
  function openPup(id) {
    var p = null;
    for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) { p = DATA[i]; break; }
    if (!p) return;
    dImg.src = '/assets/img/gen/' + p.photo + '-900.avif';
    dImg.alt = p.title;
    dTitle.textContent = p.title;
    dMeta.innerHTML = '<span>' + p.breed + '</span><span class="dot"></span><span>' + p.weeks + ' weken</span><span class="dot"></span><span>' + p.sex + '</span><span class="dot"></span><span>' + p.city + ' (' + p.province + ')</span><span class="dot"></span><span>€ ' + Number(p.price).toLocaleString('nl-NL') + ' per pup</span>';
    dText.textContent = p.text;
    dChecks.innerHTML = (p.checks || []).map(function (c) { return '<span>✓ ' + c + '</span>'; }).join('');
    dContact.href = 'mailto:fokker@trimgids.nl?subject=' + encodeURIComponent('Interesse in ' + p.title + ' (' + p.id + ')') + '&body=' + encodeURIComponent('Beste ' + p.breeder + ',\\n\\nIk ben geïnteresseerd in dit nest. Kunnen we een kennismaking plannen?\\n\\nMet vriendelijke groet,');
    dialog.hidden = false;
    requestAnimationFrame(function () { dialog.classList.add('open'); document.body.style.overflow = 'hidden'; });
  }
  function closePup() {
    dialog.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { dialog.hidden = true; }, 220);
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) { if (e.target.closest('.pm-fav')) return; openPup(c.getAttribute('data-id')); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPup(c.getAttribute('data-id')); } });
  });
  dialog.querySelectorAll('[data-pm-close]').forEach(function (el) { el.addEventListener('click', closePup); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dialog.hidden) closePup(); });

  document.querySelectorAll('.pm-fav').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      b.classList.toggle('on');
    });
  });

  var form = document.getElementById('pm-form'), status = document.getElementById('pm-status');
  if (form) form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var checks = String(data.get('checks') || '').split(/[\\n;,]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    try {
      var res = await fetch('/api/puppies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        title: data.get('title'), breed: data.get('breed'), price: Number(data.get('price')), weeks: Number(data.get('weeks')),
        sex: data.get('sex'), city: data.get('city'), province: data.get('province'), breeder: data.get('breeder'),
        email: data.get('email'), checks: checks.slice(0, 4), text: data.get('text'), agree: !!data.get('agree')
      }) });
      if (!res.ok) throw new Error();
      status.hidden = false;
      status.className = 'status-msg success full';
      status.textContent = '✓ Bedankt! Je nest is ter controle ingediend en verschijnt na goedkeuring (meestal binnen 24 uur) op de marktplaats.';
      form.reset();
    } catch (err) {
      status.hidden = false;
      status.className = 'status-msg error full';
      status.textContent = 'Er ging iets mis. Controleer je gegevens en probeer het opnieuw.';
    }
  });
})();
</script>`
  });
}
