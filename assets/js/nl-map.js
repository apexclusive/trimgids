/* TrimGids Ontdekkingskaart — Leaflet-gebaseerde kaart met OpenStreetMap-basislaag.

   Waarom Leaflet: de eerdere eigen canvas-implementatie tekende niets zodra de
   tegellaag faalde en moest pan/zoom/markers zelf uitvinden. Leaflet is een
   beproefde kaartbibliotheek die lokaal is ge-vendored (assets/vendor/leaflet),
   dus geen CDN-afhankelijkheid. De tegels komen rechtstreeks uit de browser van
   de bezoeker bij OpenStreetMap vandaan; valt dat weg, dan blijven de markers en
   de filters gewoon werken op een egale achtergrond.

   Behouden van de oude component: dezelfde UI-klassen (nl-map.css blijft gelden),
   dezelfde data-eindpunten (/api/providers?lite=1 en /api/routes), filters per
   categorie, zoeken, provincie, geolocatie, lijstweergave en detailkaart. */
(function () {
  'use strict';

  var CAT_COLORS = { trimsalon: '#1E523A', hondenschool: '#3730A3', opvang: '#D97706', wellness: '#0D9488', routes: '#059669' };
  var CAT_LABEL = { trimsalon: 'Trimsalon', hondenschool: 'Hondenschool', opvang: 'Opvang', wellness: 'Wellness', routes: 'Wandelen' };
  var NL_BOUNDS = [[50.65, 3.15], [53.70, 7.40]];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function haversineKm(la1, lo1, la2, lo2) {
    var r = Math.PI / 180, R = 6371;
    var dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
    var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function NLMap(el) {
    this.el = el;
    el.classList.add('nlmap');
    this.showList = el.getAttribute('data-show-list') === 'true';
    this.fixedCategory = el.getAttribute('data-category');
    this.activeCats = {};
    this.province = 'all';
    this.query = '';
    this.items = [];
    this.nearMode = false;
    this.build();
    this.initMap();
    this.bind();
    this.load();
  }

  NLMap.prototype.build = function () {
    var chips = '';
    for (var k in CAT_COLORS) {
      chips += '<button data-f="' + k + '" type="button" aria-pressed="false"><i style="background:' + CAT_COLORS[k] + '"></i>' + CAT_LABEL[k] + '</button>';
    }
    this.el.innerHTML =
      '<div class="nlmap-top">' +
      '  <div class="nlmap-search"><span aria-hidden="true">🔍</span><input type="search" placeholder="Zoek plaats, aanbieder of provincie…" aria-label="Zoek op de kaart"><button class="nlmap-clear" type="button" aria-label="Zoekopdracht wissen">✕</button></div>' +
      '  <div class="nlmap-chips">' + chips + '</div>' +
      '  <label class="nlmap-province"><span>Provincie</span><select aria-label="Filter op provincie"><option value="all">Heel Nederland</option></select></label>' +
      '  <div class="nlmap-actions">' +
      '    <button class="nlmap-geo" type="button" title="Toon aanbieders bij mij in de buurt">📍 Bij mij</button>' +
      '    <button class="nlmap-zoom" type="button" title="Inzoomen">＋</button>' +
      '    <button class="nlmap-zoomout" type="button" title="Uitzoomen">－</button>' +
      '    <button class="nlmap-reset" type="button" title="Terug naar overzicht">⌂</button>' +
      '  </div>' +
      '</div>' +
      '<div class="nlmap-stage"></div>' +
      '<div class="nlmap-stat" role="status">Kaart wordt geladen…</div>' +
      '<div class="nlmap-card" hidden></div>' +
      '<div class="nlmap-empty" hidden><strong>Geen resultaten</strong><span>Probeer een andere zoekterm of categorie.</span></div>' +
      (this.showList ? '<div class="nlmap-list" hidden></div>' : '');

    this.stage = this.el.querySelector('.nlmap-stage');
    this.stat = this.el.querySelector('.nlmap-stat');
    this.card = this.el.querySelector('.nlmap-card');
    this.empty = this.el.querySelector('.nlmap-empty');
    this.list = this.el.querySelector('.nlmap-list');
    this.input = this.el.querySelector('.nlmap-search input');
    this.provinceSelect = this.el.querySelector('.nlmap-province select');
  };

  NLMap.prototype.initMap = function () {
    if (typeof window.L === 'undefined') {
      // Leaflet niet geladen: geen basiskaart, maar data en lijst blijven bruikbaar.
      this.stage.innerHTML = '<div class="nlmap-fallback" style="display:grid;place-items:center;height:100%;color:var(--muted);font-size:14px">De basiskaart kon niet laden — de resultaten en lijst hieronder werken wel.</div>';
      this.map = null;
      return;
    }
    /* Gebruik de Voyager-tegels van CARTO als primaire basislaag. Die gebruikt
       OpenStreetMap-data, maar vermijdt de bekende 403 "Referer is required"
       van tile.openstreetmap.org in embeds en preview-proxy's. De Leaflet-
       attribution control staat bewust aan: de bronvermelding moet op zowel
       /kaart als de kleine homepagekaart zichtbaar zijn. */
    var OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    /* CARTO Basemaps is a client-side service: deze sleutel is daarom bewust
       publiek en hoort in de tegel-URL. Zonder key toont CARTO op elke tegel
       de tekst "API key required". */
    var CARTO_BASEMAP_KEY = 'cb1_34ai_1_38282152c7e6f64ac160316e';
    var map = L.map(this.stage, { zoomControl: false, attributionControl: true, scrollWheelZoom: true });
    map.fitBounds(NL_BOUNDS, { padding: [8, 8] });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=' + CARTO_BASEMAP_KEY, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: OSM_ATTR + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
    }).addTo(map);

    this.layer = L.layerGroup().addTo(map);
    this.map = map;
  };

  NLMap.prototype.bind = function () {
    var self = this;
    this.el.querySelectorAll('.nlmap-chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-f');
        if (self.fixedCategory) return; // mini-kaarten hebben een vaste categorie
        self.activeCats[cat] = !self.activeCats[cat];
        b.setAttribute('aria-pressed', self.activeCats[cat] ? 'true' : 'false');
        self.render();
      });
    });
    this.provinceSelect.addEventListener('change', function () { self.province = self.provinceSelect.value; self.render(); });
    var t;
    this.input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { self.query = self.input.value.trim().toLowerCase(); self.render(); }, 180); });
    this.el.querySelector('.nlmap-clear').addEventListener('click', function () { self.input.value = ''; self.query = ''; self.render(); });
    this.el.querySelector('.nlmap-geo').addEventListener('click', function () { self.geolocate(); });
    this.el.querySelector('.nlmap-zoom').addEventListener('click', function () { if (self.map) self.map.zoomIn(); });
    this.el.querySelector('.nlmap-zoomout').addEventListener('click', function () { if (self.map) self.map.zoomOut(); });
    this.el.querySelector('.nlmap-reset').addEventListener('click', function () { if (self.map) self.map.fitBounds(NL_BOUNDS, { padding: [8, 8] }); self.card.hidden = true; });
  };

  NLMap.prototype.filtered = function () {
    var self = this;
    var anyCat = Object.keys(this.activeCats).some(function (k) { return self.activeCats[k]; });
    return this.items.filter(function (i) {
      if (self.fixedCategory && i.cat !== self.fixedCategory) return false;
      if (!self.fixedCategory && anyCat && !self.activeCats[i.cat]) return false;
      if (self.province !== 'all' && i.province !== self.province) return false;
      if (self.query) {
        var hay = (i.name + ' ' + i.city + ' ' + i.province).toLowerCase();
        if (hay.indexOf(self.query) === -1) return false;
      }
      return true;
    });
  };

  NLMap.prototype.load = function () {
    var self = this;
    var qs = [];
    if (this.fixedCategory) qs.push('category=' + encodeURIComponent(this.fixedCategory));
    if (this.el.getAttribute('data-province')) qs.push('province=' + encodeURIComponent(this.el.getAttribute('data-province')));
    var providerUrl = '/api/providers?lite=1' + (qs.length ? '&' + qs.join('&') : '');
    function getJson(url) {
      return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) {
        if (!r.ok) throw new Error('kaart_api_' + r.status);
        return r.json();
      });
    }
    Promise.all([getJson(providerUrl), getJson('/api/routes')])
      .then(function (res) {
        var providers = (res[0] && Array.isArray(res[0].providers) ? res[0].providers : []).map(function (p) {
          return { id: p.id || p.slug, name: p.name, city: p.city, province: p.province, cat: p.category, lat: +p.lat, lng: +p.lng, phone: p.phone, slug: p.slug, isRoute: false };
        });
        var routes = (res[1] && Array.isArray(res[1].routes) ? res[1].routes : []).map(function (r) {
          return { id: 'route-' + r.slug, name: r.title || r.name, city: r.city || '', province: r.province || '', cat: 'routes', lat: +r.lat, lng: +r.lng, isRoute: true };
        });
        self.items = providers.concat(routes).filter(function (i) { return Number.isFinite(i.lat) && Number.isFinite(i.lng); });
        var provinces = Array.from(new Set(self.items.map(function (i) { return i.province; }).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, 'nl'); });
        self.provinceSelect.innerHTML = '<option value="all">Heel Nederland</option>' + provinces.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join('');
        self.render();
      })
      .catch(function () {
        self.items = [];
        self.empty.hidden = false;
        self.stat.textContent = 'Kaartdata tijdelijk niet beschikbaar';
      });
  };

  NLMap.prototype.render = function () {
    var self = this, items = this.filtered();
    this.empty.hidden = items.length > 0;
    this.stat.textContent = items.length + ' locaties · ' + this.items.length + ' totaal';

    if (this.map && this.layer) {
      this.layer.clearLayers();
      items.forEach(function (i) {
        var m = L.circleMarker([i.lat, i.lng], {
          radius: i.isRoute ? 6 : 7,
          color: '#ffffff', weight: 1.6,
          fillColor: CAT_COLORS[i.cat] || '#334155', fillOpacity: 0.92
        });
        m.bindTooltip(esc(i.name), { direction: 'top' });
        m.on('click', function () { self.showCard(i); });
        i.__marker = m;
        self.layer.addLayer(m);
      });
    }
    if (this.list) this.renderList(items);
  };

  NLMap.prototype.showCard = function (i) {
    var self = this;
    this.card.hidden = false;
    this.card.innerHTML =
      '<button class="nlmap-card-close" type="button" aria-label="Sluiten">✕</button>' +
      '<h3>' + esc(i.name) + '</h3>' +
      '<p>' + esc(CAT_LABEL[i.cat] || i.cat) + ' · ' + esc(i.city || '') + (i.province ? ', ' + esc(i.province) : '') + '</p>' +
      (i.dist != null ? '<p>📍 ' + i.dist.toFixed(1) + ' km bij jou vandaan</p>' : '') +
      '<div class="nlmap-card-actions">' +
      (i.phone ? '<a href="tel:' + esc(i.phone) + '">📞 Bellen</a>' : '') +
      '<a href="https://www.google.com/maps/dir/?api=1&destination=' + i.lat + ',' + i.lng + '" target="_blank" rel="noopener noreferrer">🧭 Navigeren</a>' +
      '</div>';
    this.card.querySelector('.nlmap-card-close').addEventListener('click', function () { self.card.hidden = true; });
    if (this.map) this.map.setView([i.lat, i.lng], Math.max(this.map.getZoom(), 12), { animate: true });
    if (this.list) this.scrollList(i);
  };

  NLMap.prototype.renderList = function (items) {
    var self = this;
    var rows = items.slice(0, 200);
    this.list.hidden = false;
    this.list.innerHTML = rows.map(function (i) {
      return '<button type="button" data-id="' + esc(i.id) + '"><i style="background:' + (CAT_COLORS[i.cat] || '#334155') + '"></i><span>' + esc(i.name) + '</span><em>' + esc(i.city || i.province || '') + (i.dist != null ? ' · ' + i.dist.toFixed(1) + ' km' : '') + '</em></button>';
    }).join('');
    this.list.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = items.find(function (x) { return String(x.id) === b.getAttribute('data-id'); });
        if (item) self.showCard(item);
      });
    });
  };

  NLMap.prototype.scrollList = function (i) {
    var b = this.list && this.list.querySelector('[data-id="' + (i.id + '').replace(/"/g, '') + '"]');
    if (b) b.scrollIntoView({ block: 'nearest' });
  };

  NLMap.prototype.geolocate = function () {
    var self = this;
    if (!navigator.geolocation) { this.stat.textContent = '📍 Geolocatie wordt niet ondersteund door je browser.'; return; }
    this.stat.textContent = '📍 Locatie bepalen…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var la = pos.coords.latitude, lo = pos.coords.longitude;
      self.items.forEach(function (i) { i.dist = haversineKm(la, lo, i.lat, i.lng); });
      if (self.map) self.map.setView([la, lo], 10);
      var near = self.items.filter(function (i) { return i.dist <= 25; }).sort(function (a, b) { return a.dist - b.dist; });
      self.stat.textContent = '📍 ' + near.length + ' aanbieders binnen 25 km';
      self.render();
    }, function () {
      self.stat.textContent = '📍 Locatie niet beschikbaar — zoek handmatig op plaatsnaam.';
    }, { timeout: 8000 });
  };

  function bootAll() {
    document.querySelectorAll('[data-nl-map]').forEach(function (el) {
      if (el.__map) return;
      el.__map = new NLMap(el);
      el.removeAttribute('aria-busy');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootAll);
  else bootAll();
})();
