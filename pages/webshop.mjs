/* Pagina: TrimGids Webshop — affiliate producten, incl. hypoallergeen voer en reisveiligheid.
   Interactief: categorie-filters + prijs-sortering + voorraad/score-koppen. */
import { pageShell, esc } from './base.mjs';
import { readFile } from 'node:fs/promises';

const CSS = `
.shop-hero{background:linear-gradient(135deg,#07150e,#0f3e28);color:#e7f5ec;border-radius:var(--r-lg);padding:34px;margin-top:18px;box-shadow:var(--shadow-lg)}
.shop-hero h2{color:#fff;font-size:26px;margin-bottom:8px}
.shop-hero p{color:rgba(231,245,236,.82);font-size:14.5px;max-width:720px}
.shop-hero .note{margin-top:12px;font-size:12.5px;font-weight:700;color:#a7f3d0}
.shop-bar{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 6px}
.shop-bar button{border:1.6px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;color:var(--muted)}
.shop-bar button.on{background:var(--g);border-color:var(--g);color:#fff}
.shop-sort{display:flex;gap:12px;align-items:center;margin:8px 0 16px;font-size:13px;font-weight:700;color:var(--muted)}
.shop-sort select{padding:9px 13px;border:1.6px solid var(--line);border-radius:12px;background:var(--card);font:inherit;font-weight:700;color:var(--ink)}
.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px}
.p-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px}
.p-card .b{font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--amber),#f59e0b);border-radius:999px;padding:4px 11px;align-self:flex-start}
.p-card h3{font-size:17px;line-height:1.35}
.p-card .stars{font-size:12.5px;font-weight:800;color:var(--amber)}
.p-card p{font-size:13.5px;color:var(--muted)}
.p-card .who{font-size:12.5px;font-weight:700;background:rgba(16,185,129,.07);border-radius:11px;padding:9px 12px}
.p-card .price{font-size:24px;font-weight:800;color:var(--g)}
.p-card .price small{font-size:12px;color:var(--muted);font-weight:700}
.p-card a.btn{justify-content:center}
.p-buy{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:auto;flex-wrap:wrap}
.p-card .tg-save-btn{color:var(--muted)}
.shop-empty{grid-column:1/-1;text-align:center;color:var(--muted);font-size:14px;padding:30px}
`;

const CATS = [
  ['alle', 'Alle producten'], ['hypoallergeen-voeding', '🌾 Hypoallergeen voer'],
  ['voeding-snacks', '🥩 Voeding & snacks'], ['supplementen', '💊 Darm & supplementen'],
  ['reis-veiligheid', '✈️ Reis & veiligheid'], ['training', '🧠 Training & alleen-zijn'],
  ['verzorging', '🧴 Verzorging'], ['gezondheid', '🩺 Gezondheid'], ['opbergen', '📦 Opbergen & voorraad']
];

function productSchema(items) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'ItemList', name: 'TrimGids webshop — aanbevolen producten', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: 'https://trimgids.nl/webshop#p-' + p.id })) },
    ...items.map(p => ({
      '@type': 'Product',
      name: p.title,
      description: p.description,
      brand: { '@type': 'Brand', name: (p.brand || 'TrimGids keuze') },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount },
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: p.price, availability: 'https://schema.org/InStock', url: p.affiliateUrl, priceValidUntil: '2026-12-31' },
      url: 'https://trimgids.nl/webshop#p-' + p.id,
      image: p.image || undefined
    }))
  ] };
}

/* Zelfde kaart-markup als de client-renderer, zodat SSR en JS dezelfde output geven. */
function cardHtml(p) {
  return `<article class="p-card" id="p-${p.id}">` +
    (p.badge ? '<span class="b">' + p.badge + '</span>' : '') +
    '<h3>' + p.title + '</h3>' +
    '<div class="stars">⭐ ' + p.rating.toFixed(1) + ' (' + p.reviewCount + ' reviews)</div>' +
    '<p>' + p.description + '</p>' +
    '<div class="who">👤 ' + p.forWho + '</div>' +
    '<div class="p-buy"><div class="price">€ ' + p.price.toFixed(2).replace('.', ',') + ' <small>incl. verzending bij partner*</small></div>' +
    '<button type="button" class="tg-save-btn" data-save="' + JSON.stringify({ type: 'product', id: p.id || p.title, title: p.title, href: '/webshop' }).replace(/"/g, '&quot;') + '">🔖 <span class="tg-save-label">Bewaren</span></button></div>' +
    '<a class="btn" href="' + p.affiliateUrl + '" target="_blank" rel="sponsored noopener noreferrer">Bekijk & bestel ↗</a>' +
    '</article>';
}

export async function webshopPage() {
  let items = [];
  try {
    items = JSON.parse(await readFile(new URL('../data/webshop.json', import.meta.url), 'utf8'));
  } catch { items = []; }

  return pageShell({
    title: 'Webshop: hypoallergeen voer, reisveiligheid & verzorging voor je hond | TrimGids',
    description: 'De TrimGids webshop met onafhankelijk geselecteerde producten: hypoallergeen hondenvoer, probiotica, koelmatten, autotuigen, GPS-trackers, EHBO-kits en trimsalontools. Affiliate: jij betaalt niets extra.',
    canonical: '/webshop',
    active: 'webshop',
    extraHead: `<script type="application/ld+json">${JSON.stringify(productSchema(items))}</script>`,
    extraCss: CSS,
    body: `
<p class="crumb"><a href="/">TrimGids</a> / Webshop</p>
<div class="hero">
  <span class="eyebrow">Partnerwinkel · onafhankelijk geselecteerd</span>
  <h1>Webshop: wat wij zelf zouden kopen voor onze hond</h1>
  <p class="intro">Geselecteerd op basis van onze gidsen: hypoallergeen voer voor gevoelige honden, darmondersteuning bij maagklachten, koelmatten voor de zomer, veilige reisbenodigdheden, training voor alleen-zijn en de tools die trimsalons écht gebruiken.</p>
  <div class="grid g4">
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">${items.length}</strong><p>gecurieerde producten</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">0%</strong><p>extra kosten voor jou</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">100%</strong><p>partners: bol.com & Tractive</p></div>
    <div class="card" style="text-align:center"><strong style="font-size:26px;color:var(--g)">8</strong><p>categorieën, van voer tot EHBO &amp; opbergen</p></div>
  </div>
</div>

<div class="shop-hero">
  <h2>🛒 Hoe werkt onze webshop?</h2>
  <p>Wij selecteren producten op basis van onze <a href="/hondenweetjes" style="color:#a7f3d0;font-weight:700">gidsen</a>, tests en ervaring. Klik je op "Bekijk & bestel", dan ga je naar de partner (bol.com of Tractive). TrimGids ontvangt daar een klein percentage — <strong>jij betaalt niets extra</strong>. Je steunt daarmee het gratis platform.</p>
  <p class="note">ℹ️ Transparantie: dit is adverteren via partnerlinks. Wij promoten géén product dat we niet zouden aanraden; vergelijk altijd zelf de voorwaarden.</p>
</div>

<section class="sec">
  <h2>🛍️ Alle producten</h2>
  <div class="shop-bar" id="cats">
    ${CATS.map((c, i) => `<button data-c="${c[0]}" class="${i === 0 ? 'on' : ''}">${c[1]}</button>`).join('')}
  </div>
  <div class="shop-sort">
    <span>Sorteer:</span>
    <select id="sort"><option value="recommended">Aanbevolen</option><option value="price-asc">Prijs laag → hoog</option><option value="price-desc">Prijs hoog → laag</option><option value="rating">Best beoordeeld</option></select>
    <span id="count">${items.length} product(en) — server-gerenderd</span>
  </div>
  <noscript><div class="shop-empty" style="margin-bottom:14px">💡 Schakel JavaScript in om te filteren en sorteren; alle producten zijn hieronder al zichtbaar.</div></noscript>
  <div class="shop-grid" id="grid">
    ${items.map(cardHtml).join('')}
  </div>
</section>

<section class="sec">
  <h2>📦 Veelgestelde vragen over de shop</h2>
  <div class="qas">
    <div class="qa"><b>Is hypoallergeen voer voor elke hond?</b><p>Nee. Hypoallergeen voer is bedoeld voor honden met (vermoedelijke) voedselallergie en moet bij een vermoeden altijd in overleg met de dierenarts worden gestart (eliminatiedieet). Voor gezonde honden volstaat een complete, goed afgestemde voeding.</p></div>
    <div class="qa"><b>Zijn de reisproducten echt nodig?</b><p>Een crashgetest autotuig is in enkele landen verplicht en beschermt je hond bij een aanrijding. Een reistas tot 8 kg is nodig voor cabinevluchten; check altijd de maatvoering van je maatschappij (zie <a href="/reizen" style="color:var(--g);font-weight:700">onze reisgids</a>).</p></div>
    <div class="qa"><b>Wat als ik een product retour wil?</b><p>Retourneren verloopt via de partner (bol.com of Tractive) volgens hun algemene voorwaarden. TrimGids is geen verkoper, maar een onafhankelijke aanbeveler.</p></div>
  </div>
  <div class="next" style="margin-top:26px">
    <a class="btn" href="/hondenweetjes">🌾 Hypoallergeen & levensduur: de kennisgids →</a>
    <a class="btn ghost" href="/producten">💈 Vachtverzorging & trimtools (overzicht) →</a>
  </div>
</section>

<script>
(function () {
  var I = ${JSON.stringify(items)};
  var cats = document.getElementById('cats'), grid = document.getElementById('grid');
  var sort = document.getElementById('sort'), count = document.getElementById('count');
  var active = 'alle', ord = 'recommended';
  function render() {
    var list = I.filter(function (p) { return active === 'alle' || p.category === active; });
    if (ord === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (ord === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (ord === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
    count.textContent = list.length + ' product(en)';
    grid.replaceChildren();
    if (!list.length) { grid.innerHTML = '<div class="shop-empty">Geen producten in deze categorie.</div>'; return; }
    list.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'p-card';
      card.innerHTML = (p.badge ? '<span class="b">' + p.badge + '</span>' : '') +
        '<h3>' + p.title + '</h3>' +
        '<div class="stars">⭐ ' + p.rating.toFixed(1) + ' (' + p.reviewCount + ' reviews)</div>' +
        '<p>' + p.description + '</p>' +
        '<div class="who">👤 ' + p.forWho + '</div>' +
        '<div class="p-buy"><div class="price">€ ' + p.price.toFixed(2).replace('.', ',') + ' <small>incl. verzending bij partner*</small></div>' +
        '<button type="button" class="tg-save-btn" data-save="' + JSON.stringify({ type: 'product', id: p.id || p.title, title: p.title, href: '/webshop' }).replace(/"/g, '&quot;') + '">🔖 <span class="tg-save-label">Bewaren</span></button></div>' +
        '<a class="btn" href="' + p.affiliateUrl + '" target="_blank" rel="sponsored noopener noreferrer">Bekijk & bestel ↗</a>';
      grid.appendChild(card);
    });
    if (window.TGApp) window.TGApp.refreshSaveButtons(grid);
  }
  cats.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    cats.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    active = b.getAttribute('data-c'); render();
  });
  sort.addEventListener('change', function () { ord = sort.value; render(); });
  /* SSR-grid staat er al; alleen initialiseren als het grid leeg is (no-JS fallback) of na interactie. */
  if (!grid.children.length) render();
})();
</script>`
  });
}
