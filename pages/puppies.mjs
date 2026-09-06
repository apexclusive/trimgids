/* PuppyMarktplaats — geverifieerde fokkers met pups in Nederland (Ronde 15).
   SSR-marktplaats: foto-kaarten met prijs-tag, filters, detail-dialoog en
   een veilig formulier waar fokkers hun nest kunnen aanbieden. */
import { pageShell, esc } from './base.mjs';

const CSS_LINK = '<link rel="stylesheet" href="/assets/css/puppies.css?v=15">';

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
      <span class="pm-badge">${p.verified ? 'Geverifieerde fokker' : 'Fokker te bezoeken'}</span>
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
    extraHead: CSS_LINK,
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
  <div class="section-head"><div><span class="eyebrow">Waarom dit geen doorsnee marktplaats is</span><h2>Zes garanties vóór je een pup koopt</h2></div></div>
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
  <span class="eyebrow">Voor fokkers</span>
  <h2>Fokker met een nest? Plaats het gratis</h2>
  <p class="sub">Vul onderstaand formulier in. Je nest wordt ter controle ingediend en verschijnt na goedkeuring op de marktplaats — mét jouw gezondheidschecks, voor baasjes die bewust kiezen.</p>
  <form class="form-grid" id="pm-form" style="scroll-margin-top: 120px">
    <label>Nesttitel<input name="title" required maxlength="90" placeholder="Bijv. Golden Retriever pups · Litter 'Sunny'"></label>
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

<section class="sec">
  <div class="section-head"><div><span class="eyebrow">Eerlijk adverteren</span><h2>Gratis nu — en zo blijft het eerlijk</h2><p class="sub">De marktplaats is bewust zo opgebouwd dat iedereen kan starten, en pas kan betalen als het er toe doet:</p></div></div>
  <div class="pm-plans">
    <div class="pm-plan pm-plan-free"><span class="pm-plan-tag">Nu · gratis</span><h3>Basisadvertentie</h3><p>Onbeperkt in de uitvoering: nest, foto's, checks, contact. Geen kosten, geen verborgen voorwaarden. Zolang we groeien, blijft dit zo.</p><strong>€ 0,00</strong></div>
    <div class="pm-plan pm-plan-star"><span class="pm-plan-tag">Straks · gepland 2027</span><h3>Uitgelicht</h3><p>Jouw nest bovenaan bij de rassenfilters + badge. Alleen beschikbaar voor geverifieerde fokkers. We starten hiermee pas als er voldoende bezoekers zijn — anders verkoop je lucht.</p><strong>€ 15/mnd (gepland)</strong></div>
    <div class="pm-plan"><span class="pm-plan-tag">Later</span><h3>Fokkera-pagina</h3><p>Eigen pagina met stamboom, historie en alle nesten — ideaal voor serieuze fokkers die bezoekers willen overtuigen.</p><strong>€ 25/mnd (gepland)</strong></div>
  </div>
  <p class="pm-plans-note">Waarom zo? Omdat een marktplaats alleen werkt als er én genoeg kopers zijn én genoeg goede aanbieders. Eerst gratis opbouwen, dan pas eerlijk verdienen — dat is de beste tactiek voor vertrouwen.</p>
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

  var favs = [];
  try { favs = JSON.parse(localStorage.getItem('pm-favs') || '[]'); } catch (_) { favs = []; }
  document.querySelectorAll('.pm-fav').forEach(function (b) {
    var cardId = b.closest('.pm-card') && b.closest('.pm-card').getAttribute('data-id');
    if (cardId && favs.indexOf(cardId) !== -1) b.classList.add('on');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      b.classList.toggle('on');
      if (!cardId) return;
      var idx = favs.indexOf(cardId);
      if (b.classList.contains('on')) { if (idx === -1) favs.push(cardId); }
      else if (idx !== -1) favs.splice(idx, 1);
      try { localStorage.setItem('pm-favs', JSON.stringify(favs)); } catch (_) {}
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
