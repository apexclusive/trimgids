/* TrimGids Ontdekkingskaart — eigen kaartcomponent (100% same-origin, geen externe tiles/CDN's).
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

  function xP(lon) { return (lon - LON_MIN) / (LON_MAX - LON_MIN) * W; }
  function yP(lat) { return (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H; }
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
    this.filter = 'all'; this.query = ''; this.selected = null; this.hover = null;
    this.items = []; this.boundsCache = null;
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
      '  <div class="nlmap-actions">' +
      '    <button class="nlmap-geo" type="button" title="Toon aanbieders bij mij in de buurt"><svg class="ic" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> Bij mij</button>' +
      '    <button class="nlmap-zoom" type="button" title="Inzoomen">＋</button>' +
      '    <button class="nlmap-zoomout" type="button" title="Uitzoomen">－</button>' +
      '    <button class="nlmap-reset" type="button" title="Terug naar overzicht">⌂</button>' +
      '  </div>' +
      '</div>' +
      '<div class="nlmap-stage"><canvas></canvas>' +
      '  <div class="nlmap-stat" role="status">Kaart wordt geladen…</div>' +
      '  <div class="nlmap-card" hidden></div>' +
      '  <div class="nlmap-empty" hidden><strong>Geen resultaten</strong><span>Probeer een andere zoekterm of categorie.</span></div>' +
      '</div>' +
      (this.showList ? '<div class="nlmap-list" hidden></div>' : '');

    this.canvas = this.el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.stat = this.el.querySelector('.nlmap-stat');
    this.card = this.el.querySelector('.nlmap-card');
    this.empty = this.el.querySelector('.nlmap-empty');
    this.list = this.el.querySelector('.nlmap-list');
    this.input = this.el.querySelector('.nlmap-search input');

    var widthPx = this.el.clientWidth || 900;
    this.canvas.width = widthPx * (window.devicePixelRatio || 1);
    this.canvas.height = this.el.clientHeight * (window.devicePixelRatio || 1);
    this.canvas.style.width = widthPx + 'px';
    this.canvas.style.height = this.el.clientHeight + 'px';
    this.fitView();

    this.el.querySelector('.nlmap-search input').addEventListener('input', function () {
      self.query = this.value.trim().toLowerCase();
      self.render(); self.renderList();
    });
    this.el.querySelector('.nlmap-clear').addEventListener('click', function () {
      self.query = ''; self.input.value = ''; self.render(); self.input.focus();
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

    this.canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = self.canvas.getBoundingClientRect();
      self.zoomBy(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

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

  NLMap.prototype.load = function () {
    var self = this;
    /* Ronde 11: data-attrs filteren de kaart op categorie/provincie/zoekterm */
    var qs = [];
    if (self.el.getAttribute('data-category')) qs.push('category=' + encodeURIComponent(self.el.getAttribute('data-category')));
    if (self.el.getAttribute('data-province')) qs.push('province=' + encodeURIComponent(self.el.getAttribute('data-province')));
    var providerUrl = '/api/providers?lite=1' + (qs.length ? '&' + qs.join('&') : '');
    Promise.all([fetch(providerUrl).then(function (r) { return r.json(); }), fetch('/api/routes').then(function (r) { return r.json(); })])
      .then(function (results) {
        var providers = (results[0].providers || []).map(function (p) {
          return { id: p.id || p.slug || Math.random().toString(36).slice(2), name: p.name, city: p.city, province: p.province, cat: p.category, lat: +p.lat, lng: +p.lng, rating: p.rating, reviewCount: p.reviewCount, phone: p.phone, startingPrice: p.startingPrice, slug: p.slug, isRoute: false };
        });
        var routes = ((results[1] || {}).routes || []).map(function (r) {
          return { id: 'route-' + r.slug, name: r.title || r.name, city: r.city || '', province: r.province || '', cat: 'routes', lat: +r.lat, lng: +r.lng, description: r.description || '', isRoute: true };
        });
        self.items = providers.concat(routes);
        self.render();
      })
      .catch(function () {
        self.stat.textContent = '⚠️ Kaartdata kon niet worden geladen.';
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

  NLMap.prototype.filtered = function () {
    var self = this;
    return this.items.filter(function (i) {
      if (self.filter !== 'all' && i.cat !== self.filter) return false;
      if (!self.query) return true;
      var hay = (i.name + ' ' + (i.city || '') + ' ' + (i.province || '')).toLowerCase();
      return hay.indexOf(self.query) !== -1;
    });
  };

  NLMap.prototype.render = function () {
    var ctx = this.ctx, items = this.filtered();
    this.empty.hidden = items.length > 0;
    if (!this.empty.hidden) this.stat.textContent = '0 locaties';
    else this.stat.textContent = items.length + ' locaties · ' + this.items.length + ' totaal';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var dpr = window.devicePixelRatio || 1;

    /* Achtergrond */
    var bg = ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 40, this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) * 0.75);
    bg.addColorStop(0, dark ? 'rgba(16,185,129,.10)' : 'rgba(16,185,129,.08)');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.scale(this.scale, this.scale);

    /* Subtiel grid */
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.045)' : 'rgba(15,62,40,.05)';
    ctx.lineWidth = 1 / this.scale;
    ctx.beginPath();
    for (var gx = 0; gx <= W; gx += 156) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
    for (var gy = 0; gy <= H; gy += 160) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
    ctx.stroke();

    /* Vorm van Nederland (convex hull van de echte data = kloppende contour) */
    var pts = items.map(function (i) { return [xP(i.lng), yP(i.lat)]; });
    if (pts.length > 4) {
      var ptsAll = this.items.map(function (i) { return [xP(i.lng), yP(i.lat)]; });
      var hull = convexHull(ptsAll);
      ctx.beginPath();
      ctx.moveTo(hull[0][0], hull[0][1]);
      for (var h = 1; h < hull.length; h++) ctx.lineTo(hull[h][0], hull[h][1]);
      ctx.closePath();
      ctx.fillStyle = dark ? 'rgba(16,185,129,.07)' : 'rgba(16,185,129,.06)';
      ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(52,211,153,.35)' : 'rgba(15,62,40,.28)';
      ctx.lineWidth = 2 / this.scale;
      ctx.setLineDash([10 / this.scale, 8 / this.scale]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* Provincielabels */
    if (this.scale < 3.2) {
      ctx.font = 600 + ' ' + (26 / this.scale) + 'px system-ui,sans-serif';
      ctx.fillStyle = dark ? 'rgba(255,255,255,.30)' : 'rgba(15,62,40,.30)';
      ctx.textAlign = 'center';
      PROVINCES.forEach(function (p) {
        ctx.fillText(p[0], xP(p[1]), yP(p[2]));
      });
    }

    /* Datapunten */
    var r = 5.5 / this.scale;
    items.forEach(function (i) {
      var x = xP(i.lng), y = yP(i.lat);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = CAT_COLORS[i.cat] || '#334155';
      ctx.globalAlpha = i.isRoute ? 0.92 : 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.6 / this.scale;
      ctx.strokeStyle = dark ? 'rgba(4,20,13,.9)' : 'rgba(255,255,255,.95)';
      ctx.stroke();
      if (i.isRoute) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3.4 / this.scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(5,150,105,.5)';
        ctx.lineWidth = 1.4 / this.scale;
        ctx.stroke();
      }
      if (this.hover === i || this.selected === i) {
        ctx.beginPath();
        ctx.arc(x, y, r + 7 / this.scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.4 / this.scale;
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
    var best = null, bestD = 22 / this.scale;
    this.filtered().forEach(function (i) {
      var d = Math.hypot(xP(i.lng) - wx, yP(i.lat) - wy);
      if (d < bestD) { bestD = d; best = i; }
    });
    this.selected = best;
    if (best) { this.showCard(best); if (this.list) this.scrollList(best); }
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
