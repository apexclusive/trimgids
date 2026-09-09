/* TrimGids Ontdekkingskaart — lokale kaartcomponent met OpenStreetMap-basislaag.
   Rastert de Nederlandse aanbiedersdata als interactieve datapunten-kaart op canvas:
   projectie, pan/zoom, filters, zoeken, geolocatie, detailkaart en lijstweergave. */
(function () {
  'use strict';

  var LON_MIN = 3.15, LON_MAX = 7.40, LAT_MIN = 50.65, LAT_MAX = 53.70;
  var W = 1560, H = 1760;
  var CAT_COLORS = { trimsalon: '#1E523A', hondenschool: '#3730A3', opvang: '#D97706', wellness: '#0D9488', routes: '#059669' };
  var CAT_LABEL = { trimsalon: 'Trimsalon', hondenschool: 'Hondenschool', opvang: 'Opvang', wellness: 'Wellness', routes: 'Wandelen' };
  var PROVINCES = [
    ['Groningen', 6.58, 53.22], ['Friesland', 5.80, 53.19], ['Drenthe', 6.56, 52.95],
    ['Overijssel', 6.42, 52.46], ['Flevoland', 5.62, 52.58], ['Gelderland', 5.62, 52.14],
    ['Utrecht', 5.10, 52.06], ['Noord-Holland', 4.72, 52.72], ['Zuid-Holland', 4.22, 51.93],
    ['Zeeland', 3.78, 51.55], ['Noord-Brabant', 5.32, 51.57], ['Limburg', 5.90, 51.16]
  ];
  var NL_OUTLINE = [
    [3.36, 51.37], [3.72, 51.31], [3.94, 51.43], [4.14, 51.46], [4.19, 51.68],
    [4.08, 51.86], [4.24, 52.02], [4.48, 52.12], [4.52, 52.32], [4.66, 52.52],
    [4.55, 52.70], [4.66, 52.88], [4.82, 53.04], [4.84, 53.21], [5.08, 53.36],
    [5.29, 53.48], [5.52, 53.43], [5.67, 53.55], [5.94, 53.56], [6.12, 53.40],
    [6.34, 53.50], [6.66, 53.49], [6.93, 53.38], [7.01, 53.19], [7.18, 53.03],
    [7.06, 52.77], [7.15, 52.51], [7.02, 52.31], [7.04, 52.12], [6.84, 52.00],
    [6.73, 51.80], [6.61, 51.64], [6.43, 51.42], [6.27, 51.25], [6.08, 51.12],
    [5.96, 50.78], [5.73, 50.74], [5.52, 50.86], [5.32, 51.02], [5.11, 51.12],
    [4.91, 51.21], [4.70, 51.27], [4.51, 51.35], [4.30, 51.39], [4.10, 51.34],
    [3.88, 51.30]
  ];

  var MAP_ZOOM = 7, TILE_SIZE = 256;
  function worldXAt(lon, zoom) { return (lon + 180) / 360 * Math.pow(2, zoom) * TILE_SIZE; }
  function worldYAt(lat, zoom) {
    var sin = Math.sin(lat * Math.PI / 180);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * Math.pow(2, zoom) * TILE_SIZE;
  }
  function worldX(lon) { return worldXAt(lon, MAP_ZOOM); }
  function worldY(lat) { return worldYAt(lat, MAP_ZOOM); }
  var WORLD_X_MIN = worldX(LON_MIN), WORLD_X_MAX = worldX(LON_MAX);
  var WORLD_Y_TOP = worldY(LAT_MAX), WORLD_Y_BOTTOM = worldY(LAT_MIN);
  function xP(lon) { return (worldX(lon) - WORLD_X_MIN) / (WORLD_X_MAX - WORLD_X_MIN) * W; }
  function yP(lat) { return (worldY(lat) - WORLD_Y_TOP) / (WORLD_Y_BOTTOM - WORLD_Y_TOP) * H; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function timeAgo(iso) {
    var ms = Date.now() - new Date(iso).getTime();
    var m = Math.floor(ms / 60000);
    if (m < 1) return 'zojuist';
    if (m < 60) return m + ' min geleden';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' u geleden';
    var d = Math.floor(h / 24);
    return d + (d === 1 ? ' dag geleden' : ' dagen geleden');
  }

  function convexHull(points) {
    var pts = points.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [];
    for (var i = 0; i < pts.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
      lower.push(pts[i]);
    }
    for (var j = pts.length - 1; j >= 0; j--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[j]) <= 0) upper.pop();
      upper.push(pts[j]);
    }
    lower.pop(); upper.pop();
    return lower.concat(upper);
  }

  function haversineKm(aLat, aLng, bLat, bLng) {
    var R = 6371, dLa = (bLat - aLat) * Math.PI / 180, dLo = (bLng - aLng) * Math.PI / 180;
    var q = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(q));
  }

  function NLMap(el) {
    this.el = el;
    this.showList = el.getAttribute('data-show-list') === 'true';
    this.scale = 1; this.minScale = 0.75; this.maxScale = 8;
    this.px = 0; this.py = 0; this.drag = null;
    this.filter = 'all'; this.province = 'all'; this.query = ''; this.selected = null; this.hover = null;
    this.items = []; this.boundsCache = null; this.tileZoom = 0;
    this._build();
  }

  NLMap.prototype._build = function () {
    var self = this;
    this.el.classList.add('nlmap');
    this.el.innerHTML =
      '<div class="nlmap-top">' +
      '  <div class="nlmap-search"><svg class="ic" aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg><input type="search" placeholder="Zoek plaats, aanbieder of provincie…" aria-label="Zoek op de kaart"><button class="nlmap-clear" type="button" aria-label="Zoekopdracht wissen">✕</button></div>' +
      '  <div class="nlmap-chips" role="toolbar" aria-label="Categorie filteren">' +
      '    <button data-f="all" class="active" type="button">Alles</button>' +
      '    <button data-f="trimsalon" type="button"><i style="background:#1E523A"></i>Trimsalons</button>' +
      '    <button data-f="hondenschool" type="button"><i style="background:#3730A3"></i>Scholen</button>' +
      '    <button data-f="opvang" type="button"><i style="background:#D97706"></i>Opvang</button>' +
      '    <button data-f="wellness" type="button"><i style="background:#0D9488"></i>Wellness</button>' +
      '    <button data-f="routes" type="button"><i style="background:#059669"></i>Wandelen</button>' +
      '  </div>' +
      '  <label class="nlmap-province"><span>Provincie</span><select aria-label="Filter op provincie"><option value="all">Heel Nederland</option></select></label>' +
      '  <div class="nlmap-actions">' +
      '    <button class="nlmap-geo" type="button" title="Toon aanbieders bij mij in de buurt"><svg class="ic" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> Bij mij</button>' +
      '    <button class="nlmap-zoom" type="button" title="Inzoomen">＋</button>' +
      '    <button class="nlmap-zoomout" type="button" title="Uitzoomen">－</button>' +
      '    <button class="nlmap-reset" type="button" title="Terug naar overzicht">⌂</button>' +
      '  </div>' +
      '</div>' +
      '<div class="nlmap-stage"><div class="nlmap-tiles" aria-hidden="true"></div><canvas tabindex="0" role="img" aria-label="Interactieve kaart met TrimGids-catalogusvermeldingen en wandelroutes"></canvas>' +
      '  <a class="nlmap-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>' +
      '  <div class="nlmap-stat" role="status">Kaart wordt geladen…</div>' +
      '  <div class="nlmap-disclosure">Catalogusvermeldingen · niet betaald gerangschikt · controleer gegevens zelf</div>' +
      '  <div class="nlmap-card" hidden></div>' +
      '  <div class="nlmap-empty" hidden><strong>Geen resultaten</strong><span>Probeer een andere zoekterm of categorie.</span></div>' +
      '</div>' +
      (this.showList ? '<div class="nlmap-list" hidden></div>' : '');

    this.canvas = this.el.querySelector('canvas');
    this.stage = this.el.querySelector('.nlmap-stage');
    this.tiles = this.el.querySelector('.nlmap-tiles');
    this.ctx = this.canvas.getContext('2d');
    this.stat = this.el.querySelector('.nlmap-stat');
    this.card = this.el.querySelector('.nlmap-card');
    this.empty = this.el.querySelector('.nlmap-empty');
    this.list = this.el.querySelector('.nlmap-list');
    this.input = this.el.querySelector('.nlmap-search input');
    this.provinceSelect = this.el.querySelector('.nlmap-province select');

    this.resizeCanvas(true);
    this.fitView();
    this.loadTiles(MAP_ZOOM);

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(function () { self.resizeCanvas(false); });
      this.resizeObserver.observe(this.stage);
    } else {
      window.addEventListener('resize', function () { self.resizeCanvas(false); });
    }

    this.el.querySelector('.nlmap-search input').addEventListener('input', function () {
      self.query = this.value.trim().toLowerCase();
      self.render(); self.renderList();
    });
    this.el.querySelector('.nlmap-clear').addEventListener('click', function () {
      self.query = ''; self.input.value = ''; self.render(); self.input.focus();
    });
    this.provinceSelect.addEventListener('change', function () {
      self.province = this.value;
      if (self.province === 'all') self.fitView();
      else self.focusProvince(self.province);
      self.render(); self.renderList();
    });
    this.el.querySelectorAll('.nlmap-chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        self.filter = b.getAttribute('data-f');
        self.el.querySelectorAll('.nlmap-chips button').forEach(function (x) { x.classList.toggle('active', x === b); });
        self.render(); self.renderList();
      });
    });
    this.el.querySelector('.nlmap-geo').addEventListener('click', function () { self.geolocate(); });
    this.el.querySelector('.nlmap-zoom').addEventListener('click', function () { self.zoomBy(1.6, null, null); });
    this.el.querySelector('.nlmap-zoomout').addEventListener('click', function () { self.zoomBy(1 / 1.6, null, null); });
    this.el.querySelector('.nlmap-reset').addEventListener('click', function () { self.fitView(); self.render(); });
    this.canvas.addEventListener('keydown', function (e) {
      if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') { e.preventDefault(); self.zoomBy(1.35, null, null); }
      else if (e.key === '-' || e.key === '_' || e.key === 'ArrowDown') { e.preventDefault(); self.zoomBy(1 / 1.35, null, null); }
      else if (e.key === '0' || e.key === 'Home') { e.preventDefault(); self.fitView(); self.render(); }
    });

    this.canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = self.canvas.getBoundingClientRect();
      self.zoomBy(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });
    this.canvas.addEventListener('dblclick', function (e) {
      e.preventDefault();
      var rect = self.canvas.getBoundingClientRect();
      self.zoomBy(1.6, e.clientX - rect.left, e.clientY - rect.top);
      self.stat.textContent = 'Ingezoomd · klik op een marker voor details';
    });

    this.canvas.addEventListener('mousedown', function (e) { self.drag = { x: e.clientX, y: e.clientY, px: self.px, py: self.py, moved: false }; });
    window.addEventListener('mousemove', function (e) {
      if (!self.drag) { self.hover = null; return; }
      var dx = e.clientX - self.drag.x, dy = e.clientY - self.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) self.drag.moved = true;
      self.px = self.drag.px + dx; self.py = self.drag.py + dy;
      self.render();
    });
    window.addEventListener('mouseup', function (e) {
      if (!self.drag) return;
      var wasMoved = self.drag.moved;
      self.drag = null;
      if (!wasMoved) self.handleClick(e);
    });
    this.canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) self.drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, px: self.px, py: self.py, moved: false };
    }, { passive: true });
    this.canvas.addEventListener('touchmove', function (e) {
      if (!self.drag || e.touches.length !== 1) return;
      var t = e.touches[0];
      var dx = t.clientX - self.drag.x, dy = t.clientY - self.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) self.drag.moved = true;
      self.px = self.drag.px + dx; self.py = self.drag.py + dy;
      self.render();
    }, { passive: true });
    this.canvas.addEventListener('touchend', function (e) {
      if (!self.drag) return;
      var moved = self.drag.moved;
      self.drag = null;
      if (!moved && e.changedTouches.length) self.handleTouchClick(e);
    }, { passive: true });

    this.load();
  };

  NLMap.prototype.resizeCanvas = function (resetView) {
    var widthPx = this.stage.clientWidth || this.el.clientWidth || 900;
    var heightPx = this.stage.clientHeight || 440;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var oldScale = this.scale;
    this.canvas.width = Math.max(1, Math.round(widthPx * dpr));
    this.canvas.height = Math.max(1, Math.round(heightPx * dpr));
    this.canvas.style.width = widthPx + 'px';
    this.canvas.style.height = heightPx + 'px';
    this.fitView();
    if (!resetView && oldScale) this.scale = Math.min(this.maxScale, Math.max(this.minScale, oldScale));
    this.render();
  };

  NLMap.prototype.loadTiles = function (zoom) {
    if (this.tileZoom === zoom) return;
    this.tileZoom = zoom;
    var self = this, tileSize = TILE_SIZE, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var originX = worldXAt(LON_MIN, zoom), originY = worldYAt(LAT_MAX, zoom);
    var sx = W / (worldXAt(LON_MAX, zoom) - originX), sy = H / (worldYAt(LAT_MIN, zoom) - originY);
    var minX = Math.floor(originX / tileSize) - 1;
    var maxX = Math.floor(worldXAt(LON_MAX, zoom) / tileSize) + 1;
    var minY = Math.floor(originY / tileSize) - 1;
    var maxY = Math.floor(worldYAt(LAT_MIN, zoom) / tileSize) + 1;
    var pending = 0, loaded = 0;
    this.tiles.innerHTML = '';
    for (var tx = minX; tx <= maxX; tx++) {
      for (var ty = minY; ty <= maxY; ty++) {
        pending++;
        var img = document.createElement('img');
        img.alt = '';
        img.width = tileSize;
        img.height = tileSize;
        img.loading = 'eager';
        img.decoding = 'async';
        img.src = '/api/map-tile?z=' + zoom + '&x=' + tx + '&y=' + ty;
        img.dataset.baseLeft = ((tx * tileSize - originX) * sx / dpr).toString();
        img.dataset.baseTop = ((ty * tileSize - originY) * sy / dpr).toString();
        img.style.left = '0px';
        img.style.top = '0px';
        img.style.width = (tileSize * sx / dpr) + 'px';
        img.style.height = (tileSize * sy / dpr) + 'px';
        img.addEventListener('load', function () {
          loaded++;
          if (loaded >= 1) {
            self.tiles.classList.add('is-ready');
            self.render();
          }
        }, { once: true });
        this.tiles.appendChild(img);
      }
    }
    this.tileTransform = function () {
      self.tiles.style.transform = 'none';
      Array.prototype.forEach.call(self.tiles.querySelectorAll('img'), function (image) {
        var zoom = self.scale / dpr;
        image.style.transformOrigin = '0 0';
        image.style.transform = 'translate(' + ((self.px / dpr) + Number(image.dataset.baseLeft) * zoom) + 'px,' + ((self.py / dpr) + Number(image.dataset.baseTop) * zoom) + 'px) scale(' + zoom + ')';
      });
    };
    this.tileTransform();
  };

  NLMap.prototype.syncTileZoom = function () {
    var level = Math.max(0, Math.min(5, Math.round(Math.log(this.scale / 0.75) / Math.LN2)));
    this.loadTiles(MAP_ZOOM + level);
  };

  NLMap.prototype.load = function () {
    var self = this;
    /* Ronde 11: data-attrs filteren de kaart op categorie/provincie/zoekterm */
    var qs = [];
    if (self.el.getAttribute('data-category')) qs.push('category=' + encodeURIComponent(self.el.getAttribute('data-category')));
    if (self.el.getAttribute('data-province')) qs.push('province=' + encodeURIComponent(self.el.getAttribute('data-province')));
    var providerUrl = '/api/providers?lite=1' + (qs.length ? '&' + qs.join('&') : '');
    function getJson(url) {
      return fetch(url, { headers: { Accept: 'application/json' } }).then(function (response) {
        if (!response.ok) throw new Error('kaart_api_' + response.status);
        return response.json();
      });
    }
    Promise.all([getJson(providerUrl), getJson('/api/routes')])
      .then(function (results) {
        var providers = (results[0] && Array.isArray(results[0].providers) ? results[0].providers : []).map(function (p) {
          return { id: p.id || p.slug || Math.random().toString(36).slice(2), name: p.name, city: p.city, province: p.province, cat: p.category, lat: +p.lat, lng: +p.lng, rating: p.rating, reviewCount: p.reviewCount, phone: p.phone, startingPrice: p.startingPrice, slug: p.slug, isRoute: false };
        });
        var routes = (results[1] && Array.isArray(results[1].routes) ? results[1].routes : []).map(function (r) {
          return { id: 'route-' + r.slug, name: r.title || r.name, city: r.city || '', province: r.province || '', cat: 'routes', lat: +r.lat, lng: +r.lng, description: r.description || '', isRoute: true };
        });
        self.items = providers.concat(routes).filter(function (item) { return Number.isFinite(item.lat) && Number.isFinite(item.lng); });
        var provinces = Array.from(new Set(self.items.map(function (item) { return item.province; }).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, 'nl'); });
        self.provinceSelect.innerHTML = '<option value="all">Heel Nederland</option>' + provinces.map(function (province) { return '<option value="' + esc(province) + '">' + esc(province) + '</option>'; }).join('');
        self.stat.textContent = self.items.length + ' plekken in Nederland';
        self.render();
      })
      .catch(function () {
        self.items = [];
        self.empty.hidden = false;
        self.stat.textContent = 'Kaartdata tijdelijk niet beschikbaar';
        self.empty.querySelector('span').textContent = 'Probeer opnieuw of gebruik de lijst met plaatsen.';
      });
  };

  NLMap.prototype.fitView = function () {
    this.scale = Math.min(this.canvas.width / W, this.canvas.height / H) * 0.96;
    this.scale = Math.max(this.scale, this.minScale);
    this.px = (this.canvas.width - W * this.scale) / 2;
    this.py = (this.canvas.height - H * this.scale) / 2;
  };

  NLMap.prototype.zoomBy = function (factor, cx, cy) {
    var rect = this.canvas.getBoundingClientRect();
    var mx = cx == null ? this.canvas.width / 2 : (cx / rect.width) * this.canvas.width;
    var my = cy == null ? this.canvas.height / 2 : (cy / rect.height) * this.canvas.height;
    var ns = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    var k = ns / this.scale;
    this.px = mx - (mx - this.px) * k;
    this.py = my - (my - this.py) * k;
    this.scale = ns;
    this.render();
  };

  NLMap.prototype.focus = function (item) {
    var tx = xP(item.lng) * this.scale + this.px;
    var ty = yP(item.lat) * this.scale + this.py;
    this.scale = Math.max(this.scale, 2.4);
    this.px = this.canvas.width / 2 - xP(item.lng) * this.scale;
    this.py = this.canvas.height / 2 - yP(item.lat) * this.scale;
    this.selected = item;
    this.showCard(item);
    if (this.list) this.scrollList(item);
    this.render();
  };

  NLMap.prototype.focusProvince = function (name) {
    var province = PROVINCES.find(function (item) { return item[0] === name; });
    if (!province) return;
    this.scale = Math.max(this.scale, 2.15);
    this.scale = Math.min(this.scale, this.maxScale);
    this.px = this.canvas.width / 2 - xP(province[1]) * this.scale;
    this.py = this.canvas.height / 2 - yP(province[2]) * this.scale;
    this.selected = null;
    this.card.hidden = true;
  };

  NLMap.prototype.filtered = function () {
    var self = this;
    return this.items.filter(function (i) {
      if (self.filter !== 'all' && i.cat !== self.filter) return false;
      if (self.province !== 'all' && i.province !== self.province) return false;
      if (!self.query) return true;
      var hay = (i.name + ' ' + (i.city || '') + ' ' + (i.province || '')).toLowerCase();
      return hay.indexOf(self.query) !== -1;
    });
  };

  NLMap.prototype.clustered = function (items) {
    var buckets = Object.create(null);
    var cell = 42;
    var self = this;
    items.forEach(function (item) {
      var worldX = xP(item.lng), worldY = yP(item.lat);
      var screenX = worldX * self.scale + self.px;
      var screenY = worldY * self.scale + self.py;
      var key = Math.floor(screenX / cell) + ':' + Math.floor(screenY / cell);
      var bucket = buckets[key];
      if (!bucket) bucket = buckets[key] = { items: [], x: 0, y: 0 };
      bucket.items.push(item);
      bucket.x += worldX;
      bucket.y += worldY;
    });
    return Object.keys(buckets).map(function (key) {
      var bucket = buckets[key];
      bucket.x /= bucket.items.length;
      bucket.y /= bucket.items.length;
      bucket.item = bucket.items[0];
      bucket.count = bucket.items.length;
      bucket.isCluster = bucket.count > 1;
      return bucket;
    });
  };

  NLMap.prototype.render = function () {
    var self = this, ctx = this.ctx, items = this.filtered();
    this.empty.hidden = items.length > 0;
    if (!this.empty.hidden) this.stat.textContent = '0 locaties';
    else this.stat.textContent = items.length + ' locaties · ' + this.items.length + ' totaal';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var dpr = window.devicePixelRatio || 1;
    this.syncTileZoom();
    if (this.tileTransform) this.tileTransform();

    /* Achtergrond en herkenbare Nederlandse landvorm, zonder externe kaartdienst. */
    var bg = ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 40, this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) * 0.75);
    bg.addColorStop(0, dark ? '#17352e' : '#e7f3f6');
    bg.addColorStop(1, dark ? '#0c1d1c' : '#cfe6ed');
    if (!this.tiles.classList.contains('is-ready')) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.scale(this.scale, this.scale);

    ctx.beginPath();
    NL_OUTLINE.forEach(function (point, index) {
      var x = xP(point[0]), y = yP(point[1]);
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = this.tiles.classList.contains('is-ready')
      ? (dark ? 'rgba(20, 84, 57, .20)' : 'rgba(247, 251, 246, .12)')
      : (dark ? 'rgba(28, 103, 72, .72)' : 'rgba(247, 251, 246, .94)');
    ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(110, 231, 183, .58)' : 'rgba(15, 62, 40, .42)';
    ctx.lineWidth = 3 / this.scale;
    ctx.stroke();

    /* Markers are clustered in screen space so dense regions stay readable. */
    var points = this.clustered(items);
    this.renderedPoints = points;
    points.forEach(function (point) {
      var i = point.item, x = point.x, y = point.y;
      var r = (point.isCluster ? Math.min(17, 9 + Math.log(point.count) * 2.2) : 5.5) / self.scale;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = CAT_COLORS[i.cat] || '#334155';
      ctx.globalAlpha = point.isCluster ? 0.96 : (i.isRoute ? 0.92 : 0.88);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.6 / self.scale;
      ctx.strokeStyle = dark ? 'rgba(4,20,13,.9)' : 'rgba(255,255,255,.95)';
      ctx.stroke();
      if (point.isCluster) {
        ctx.fillStyle = '#fff';
        ctx.font = '800 ' + (Math.max(10, Math.min(14, 9 + Math.log(point.count))) / self.scale) + 'px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(point.count), x, y);
      } else if (i.isRoute) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3.4 / self.scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(5,150,105,.5)';
        ctx.lineWidth = 1.4 / self.scale;
        ctx.stroke();
      }
      if (self.hover === i || self.selected === i) {
        ctx.beginPath();
        ctx.arc(x, y, r + 7 / self.scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.4 / self.scale;
        ctx.stroke();
      }
    });
    ctx.restore();

    /* Reeds geselecteerd? kaartje tonen */
    if (this.selected && this.list && this.list.hidden === false) this.showCard(this.selected);
  };

  NLMap.prototype.handleClick = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    this.pick(e.clientX - rect.left, e.clientY - rect.top);
  };
  NLMap.prototype.handleTouchClick = function (e) {
    var t = e.changedTouches[0], rect = this.canvas.getBoundingClientRect();
    this.pick(t.clientX - rect.left, t.clientY - rect.top);
  };
  NLMap.prototype.pick = function (mx, my) {
    var self = this, wx = (mx - this.px) / this.scale, wy = (my - this.py) / this.scale;
    var best = null, bestD = 28 / this.scale;
    (this.renderedPoints || this.clustered(this.filtered())).forEach(function (point) {
      var d = Math.hypot(point.x - wx, point.y - wy);
      if (d < bestD) { bestD = d; best = point; }
    });
    if (best && best.isCluster && this.scale < this.maxScale) {
      this.scale = Math.min(this.maxScale, this.scale * 1.8);
      this.px = this.canvas.width / 2 - best.x * this.scale;
      this.py = this.canvas.height / 2 - best.y * this.scale;
      this.selected = null;
      this.card.hidden = true;
      this.stat.textContent = best.count + ' locaties in dit cluster · verder inzoomen voor details';
    } else if (best) {
      this.selected = best.item || best;
      this.showCard(this.selected);
      if (this.list) this.scrollList(this.selected);
    }
    else this.card.hidden = true;
    this.render();
  };

  NLMap.prototype.showCard = function (item) {
    var self = this;
    var maps = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.lat + ',' + item.lng) + '&travelmode=driving';
    var cats = Object.keys(CAT_LABEL).filter(function (c) { return c === item.cat; });
    var spec = item.isRoute ? (item.description || 'Wandelplek') : (item.specializations && item.specializations.slice(0, 3).join(' · ')) || 'Aanbieder in de TrimGids-catalogus';
    this.card.innerHTML =
      '<button class="nlmap-card-close" type="button" aria-label="Sluiten">✕</button>' +
      '<span class="nlmap-card-tag" style="background:' + (CAT_COLORS[item.cat] || '#334155') + '">' + (CAT_LABEL[item.cat] || 'Plek') + '</span>' +
      '<span class="nlmap-card-source">Catalogusvermelding · geen betaalde aanbeveling</span>' +
      '<h3>' + esc(item.name) + '</h3>' +
      '<p class="nlmap-card-meta">📍 ' + esc(item.city || '') + (item.province ? ' · ' + esc(item.province) : '') + (item.rating ? ' · ⭐ ' + item.rating + ' (' + item.reviewCount + ')' : '') + '</p>' +
      '<p>' + esc(spec) + '</p>' +
      '<div class="nlmap-card-actions">' +
      (item.phone ? '<a href="tel:' + esc(item.phone) + '">📞 Bellen</a>' : '') +
      '<a href="' + maps + '" target="_blank" rel="noopener noreferrer">🧭 Navigeren ↗</a>' +
      (item.slug && !item.isRoute ? '<a href="/trimsalon/' + esc(item.city) + '">Alle in ' + esc(item.city) + ' →</a>' : '') +
      '</div>';
    this.card.hidden = false;
    this.renderList();
  };

  NLMap.prototype.scrollList = function (item) {
    if (!this.list) return;
    var card = this.list.querySelector('[data-id="' + item.id + '"]');
    if (card) card.scrollIntoView({ block: 'nearest' });
  };

  NLMap.prototype.renderList = function () {
    if (!this.list) return;
    var self = this;
    var items = this.filtered();
    if (this.nearMode) items = items.slice().sort(function (a, b) { return (a.dist || 1e12) - (b.dist || 1e12); });
    items = items.slice(0, 14);
    this.list.hidden = items.length === 0;
    if (!items.length) return;
    this.list.innerHTML = '<div class="nlmap-list-head"><strong>Dichtstbij & beste matches</strong><span>' + this.filtered().length + ' resultaten</span></div>' +
      items.map(function (i) {
        return '<button type="button" data-id="' + esc(i.id) + '" class="' + (self.selected === i ? 'active' : '') + '">' +
          '<i style="background:' + (CAT_COLORS[i.cat] || '#334155') + '"></i>' +
          '<span><b>' + esc(i.name) + '</b><small>' + esc(i.city || '') + (i.province ? ' · ' + esc(i.province) : '') + (i.rating ? ' · ⭐' + i.rating : '') + '</small></span>' +
          '</button>';
      }).join('');
    this.list.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = self.filtered().find(function (i) { return String(i.id) === b.getAttribute('data-id'); });
        if (item) self.focus(item);
      });
    });
  };

  NLMap.prototype.geolocate = function () {
    var self = this;
    if (!navigator.geolocation) { this.stat.textContent = '📍 Geolocatie wordt niet ondersteund door je browser.'; return; }
    this.stat.textContent = '📍 Locatie bepalen…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var la = pos.coords.latitude, lo = pos.coords.longitude;
      self.items.forEach(function (i) { i.dist = haversineKm(la, lo, i.lat, i.lng); });
      var near = self.items.filter(function (i) { return i.dist <= 25; }).sort(function (a, b) { return a.dist - b.dist; });
      if (!near.length) near = self.items.slice().sort(function (a, b) { return a.dist - b.dist; }).slice(0, 8);
      self.stat.textContent = '📍 ' + near.filter(function (i) { return i.dist <= 25; }).length + ' aanbieders binnen 25 km';
      self.nearMode = true;
      self.renderList();
      if (near[0]) {
        self.focus(near[0]);
        self.card.querySelector('h3').textContent = near[0].name;
      }
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
