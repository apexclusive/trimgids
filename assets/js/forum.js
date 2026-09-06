/* TrimGids Community — forumcomponent (prominent, interactief, volledig same-origin).
   Zelfde UI op homepage en /forum: categorieën, sorteren, zoeken, composen,
   uitklappen + reageren, "nuttig"-stemmen, live statistieken. */
(function () {
  'use strict';

  var CATS = [
    { id: 'alle', label: '🐾 Alles', emoji: '🐾' },
    { id: 'ervaringen', label: 'Ervaringen', emoji: '✨' },
    { id: 'vragen', label: 'Vragen', emoji: '❓' },
    { id: 'tips', label: 'Tips & Tricks', emoji: '💡' },
    { id: 'nood', label: 'Nood & Alert', emoji: '🚨' },
    { id: 'uitjes', label: 'Uitjes & Bijeenkomsten', emoji: '🎉' }
  ];
  var AVATARS = ['🐶', '🐕', '🦴', '🐾', '🦮', '🐩', '🐕‍🦺', '🦴', '🤎', '🧡'];
  var SORT = [
    { id: 'new', label: 'Nieuwste' },
    { id: 'replies', label: 'Meest besproken' },
    { id: 'helpful', label: 'Meest nuttig' }
  ];

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
    if (d < 7) return d + (d === 1 ? ' dag geleden' : ' dagen geleden');
    var w = Math.floor(d / 7);
    if (w < 5) return w + (w === 1 ? ' week geleden' : ' weken geleden');
    return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function avatarFor(name) {
    var s = String(name || '').split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    return AVATARS[s % AVATARS.length];
  }
  function catOf(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
    return CATS[0];
  }
  function token() {
    var t = localStorage.getItem('tg-forum-token');
    if (!t) {
      t = 'u-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
      localStorage.setItem('tg-forum-token', t);
    }
    return t;
  }

  function Forum(el) {
    this.el = el;
    this.compact = el.getAttribute('data-compact') === 'true';
    this.topics = [];
    this.cat = 'alle'; this.sort = 'new'; this.q = ''; this.open = {};
    this.voted = JSON.parse(localStorage.getItem('tg-forum-votes') || '[]');
    this.user = (window.TGApp && window.TGApp.user) || null;
    this._build();
    var self = this;
    fetch('/api/auth/me').then(function (r) { return r.ok ? r.json() : null; }).then(function (res) {
      if (res && res.user) { self.user = res.user; self.syncUser(); }
    }).catch(function () {});
  }

  Forum.prototype.syncUser = function () {
    var self = this;
    var composerName = this.el.querySelector('.tg-f-form input[name="author"]');
    if (composerName && this.user) {
      composerName.value = this.user.name;
      composerName.setAttribute('title', 'Gekoppeld aan je TrimGids-account');
    }
    var chip = this.el.querySelector('.tg-f-account-chip');
    if (chip && this.user) {
      chip.hidden = false;
      chip.innerHTML = '<span>' + avatarFor(this.user.name) + '</span> Gekoppeld als <b>' + esc(this.user.name) + '</b> — je naam wordt automatisch overgenomen.';
    }
  };

  Forum.prototype._build = function () {
    var self = this;
    this.el.classList.add('tg-f');
    this.el.innerHTML =
      '<div class="tg-f-body">' +
      '  <div class="tg-f-toolbar">' +
      '    <div class="tg-f-chips">' + CATS.map(function (c) {
        return '<button type="button" data-cat="' + c.id + '" class="' + (c.id === 'alle' ? 'active' : '') + '"><span>' + c.emoji + '</span>' + c.label + '</button>';
      }).join('') + '</div>' +
      '    <div class="tg-f-right">' +
      '      <div class="tg-f-sort">' + SORT.map(function (s) {
        return '<button type="button" data-sort="' + s.id + '" class="' + (s.id === 'new' ? 'active' : '') + '">' + s.label + '</button>';
      }).join('') + '</div>' +
      '      <input class="tg-f-search" type="search" placeholder="Zoek in het forum…" aria-label="Zoek in forumonderwerpen">' +
      '      <button class="tg-f-new" type="button">✏️ Nieuw onderwerp</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="tg-f-stats" role="status"><span>Forum wordt geladen…</span></div>' +
      '  <div class="tg-f-composer" hidden>' +
      '    <div class="tg-f-composer-head"><strong>✏️ Start een gesprek</strong><button type="button" class="tg-f-composer-close" aria-label="Sluiten">✕</button></div>' +
      '    <form class="tg-f-form">' +
      '      <p class="tg-f-account-chip" hidden></p>' +
      '      <label>Jouw naam<input name="author" maxlength="40" required placeholder="Bijv. Sam uit Maastricht"></label>' +
      '      <label>Categorie<select name="topic">' + CATS.slice(1).map(function (c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join('') + '</select></label>' +
      '      <label>Ras van je hond (optioneel)<input name="breed" maxlength="50" placeholder="Bijv. Labradoodle, Pomeriaan…"></label>' +
      '      <label class="tg-f-wide">Onderwerp<input name="title" maxlength="120" required placeholder="Waar gaat dit over? Houd het kort en duidelijk…"></label>' +
      '      <label class="tg-f-wide">Bericht<textarea name="body" maxlength="2000" required rows="4" placeholder="Vertel je verhaal, vraag of tip. Wees aardig, andere baasjes lezen mee 😉"></textarea></label>' +
      '      <div class="tg-f-wide tg-f-submit"><span><em>Tip:</em> voeg je regio toe — antwoorden komen vaak eerder van baasjes uit je buurt.</span><button type="submit" class="tg-f-post">Plaats onderwerp →</button></div>' +
      '      <p class="tg-f-msg" hidden></p>' +
      '    </form>' +
      '  </div>' +
      '  <div class="tg-f-list"></div>' +
      '</div>';

    var chips = this.el.querySelectorAll('[data-cat]');
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        self.cat = b.getAttribute('data-cat');
        chips.forEach(function (x) { x.classList.toggle('active', x === b); });
        self.render();
      });
    });
    this.el.querySelectorAll('[data-sort]').forEach(function (b) {
      b.addEventListener('click', function () {
        self.sort = b.getAttribute('data-sort');
        self.el.querySelectorAll('[data-sort]').forEach(function (x) { x.classList.toggle('active', x === b); });
        self.render();
      });
    });
    this.el.querySelector('.tg-f-search').addEventListener('input', function () {
      self.q = this.value.trim().toLowerCase();
      self.render();
    });
    this.el.querySelector('.tg-f-new').addEventListener('click', function () { self.toggleComposer(true); });
    this.el.querySelector('.tg-f-composer-close').addEventListener('click', function () { self.toggleComposer(false); });
    this.el.querySelector('.tg-f-composer form, .tg-f-form').addEventListener('submit', function (e) {
      e.preventDefault();
      self.publish(e.currentTarget);
    });

    this.load();
  };

  Forum.prototype.toggleComposer = function (open) {
    var c = this.el.querySelector('.tg-f-composer');
    c.hidden = !open;
    if (open) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  Forum.prototype.load = function () {
    var self = this;
    this.el.querySelector('.tg-f-stats').innerHTML = '<span>Forum wordt geladen…</span>';
    fetch('/api/forum').then(function (r) { return r.json(); }).then(function (data) {
      self.topics = (data.topics || []).slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      self.render();
    }).catch(function () {
      self.el.querySelector('.tg-f-stats').innerHTML = '<span>⚠️ Forum kon niet worden geladen.</span>';
    });
  };

  Forum.prototype.visible = function () {
    var self = this;
    return this.topics.filter(function (t) {
      if (self.cat !== 'alle' && (t.topic || 'ervaringen') !== self.cat) return false;
      if (!self.q) return true;
      return ((t.title || '') + ' ' + (t.body || '') + ' ' + (t.author || '')).toLowerCase().indexOf(self.q) !== -1;
    });
  };

  Forum.prototype.render = function () {
    var self = this;
    var all = this.visible();
    if (this.sort === 'replies') all.sort(function (a, b) { return ((b.replies || []).length - (a.replies || []).length) || new Date(b.createdAt) - new Date(a.createdAt); });
    if (this.sort === 'helpful') all.sort(function (a, b) { return (b.helpfulCount || 0) - (a.helpfulCount || 0) || new Date(b.createdAt) - new Date(a.createdAt); });

    var members = {};
    this.topics.forEach(function (t) { members[t.author] = 1; (t.replies || []).forEach(function (r) { members[r.author] = 1; }); });
    var replies = this.topics.reduce(function (a, t) { return a + (t.replies || []).length; }, 0);
    this.el.querySelector('.tg-f-stats').innerHTML =
      '<span><b>' + this.topics.length + '</b> onderwerpen</span><span><b>' + replies + '</b> reacties</span><span><b>' + Object.keys(members).length + '</b> leden</span>' +
      (this.voted.length ? '<span>💚 Jij hebt ' + this.voted.length + ' × geholpen</span>' : '<span>Wees de eerste die iets deelt 🐾</span>');

    var list = this.el.querySelector('.tg-f-list');
    if (!all.length) {
      list.innerHTML = '<div class="tg-f-empty"><span>🦴</span><strong>Nog geen onderwerpen ' + (this.q ? 'voor “' + esc(this.q) + '”' : 'in deze categorie') + '</strong><p>Deel als eerste je verhaal, vraag of tip — het duurt maar 30 seconden en andere baasjes zijn je er dankbaar voor.</p><button type="button" class="tg-f-empty-cta">✏️ Start het eerste onderwerp</button></div>';
      var cta = list.querySelector('.tg-f-empty-cta');
      if (cta) cta.addEventListener('click', function () { self.toggleComposer(true); });
      return;
    }
    list.innerHTML = all.map(function (t) { return self.row(t); }).join('');
    list.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-toggle');
        self.open[id] = !self.open[id];
        self.render();
      });
    });
    list.querySelectorAll('[data-helpful]').forEach(function (b) {
      b.addEventListener('click', function () { self.helpful(b.getAttribute('data-helpful')); });
    });
    list.querySelectorAll('.tg-f-reply-form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        self.reply(f.getAttribute('data-id'), f);
      });
    });
    if (window.TGApp) window.TGApp.refreshSaveButtons(list);
  };

  Forum.prototype.row = function (t) {
    var self = this;
    var id = t.id;
    var replies = t.replies || [];
    var cat = catOf(t.topic);
    var votes = t.helpfulCount || 0;
    var voted = this.voted.indexOf(id) !== -1;
    var expanded = !!this.open[id];
    var preview = String(t.body || '').slice(0, 170);
    return '<article class="tg-f-topic' + (t.kind === 'pinned' ? ' tg-f-pinned' : '') + '">' +
      '<div class="tg-f-topic-main">' +
      '  <div class="tg-f-avatar" aria-hidden="true">' + avatarFor(t.author) + '</div>' +
      '  <div class="tg-f-topic-content">' +
      '    <div class="tg-f-topic-head">' +
      '      <span class="tg-f-cat" style="background:' + (cat.id === 'alle' ? '#334155' : '#0f3e28') + '">' + cat.emoji + ' ' + cat.label + '</span>' +
      (t.breed ? '<span class="tg-f-breed">' + esc(t.breed) + '</span>' : '') +
      (t.kind === 'pinned' ? '<span class="tg-f-pin">📌 Pinned</span>' : '') +
      '      <span class="tg-f-time">' + timeAgo(t.createdAt) + '</span>' +
      '    </div>' +
      '    <button class="tg-f-title" type="button" data-toggle="' + esc(id) + '" aria-expanded="' + expanded + '">' + esc(t.title) + '</button>' +
      (expanded ? '<div class="tg-f-body">' + esc(t.body).replace(/\n/g, '<br>') + '</div>' : '<p class="tg-f-preview">' + esc(preview) + (String(t.body || '').length > 170 ? '…' : '') + '</p>') +
      '    <div class="tg-f-actions">' +
      '      <button type="button" data-toggle="' + esc(id) + '">💬 ' + replies.length + (replies.length === 1 ? ' reactie' : ' reacties') + (replies.length ? ' · laatste ' + timeAgo(replies[replies.length - 1].createdAt) : '') + '</button>' +
      '      <button type="button" data-helpful="' + esc(id) + '" class="' + (voted ? 'voted' : '') + '"' + (voted ? ' disabled' : '') + '>👍 ' + votes + (voted ? ' (bedankt!)' : ' nuttig') + '</button>' +
      '      <button type="button" class="tg-f-save tg-save-btn" data-save=\'' + JSON.stringify({ type: 'forum', id: t.id, title: t.title, href: '/forum' }).replace(/'/g, '&#39;') + '\'>🔖 <span class="tg-save-label">Bewaren</span></button>' +
      '      <span class="tg-f-author">door ' + esc(t.author) + '</span>' +
      '    </div>' +
      (expanded ? '<div class="tg-f-replies">' +
        (replies.length ? replies.map(function (r) {
          return '<div class="tg-f-reply"><div class="tg-f-avatar sm">' + avatarFor(r.author) + '</div><div><p>' + esc(r.body).replace(/\n/g, '<br>') + '</p><span>' + esc(r.author) + ' · ' + timeAgo(r.createdAt) + '</span></div></div>';
        }).join('') : '<p class="tg-f-noreplies">Nog geen reacties — wees de eerste die antwoordt! 🐾</p>') +
        '<form class="tg-f-reply-form" data-id="' + esc(id) + '"><input name="author" maxlength="40" required placeholder="Jouw naam" aria-label="Jouw naam"' + (self.user ? ' value="' + esc(self.user.name) + '"' : '') + '><input name="body" maxlength="1000" required placeholder="Schrijf een vriendelijke reactie…" aria-label="Reactie"><button type="submit">Antwoord →</button></form>' +
        '</div>' : '') +
      '  </div>' +
      '</div>' +
      '</article>';
  };

  Forum.prototype.publish = function (form) {
    var self = this;
    var data = {
      author: form.author.value.trim(), topic: form.topic.value,
      breed: form.breed.value.trim(), title: form.title.value.trim(), body: form.body.value.trim()
    };
    if (this.user && this.user.id) data.userId = this.user.id;
    var msg = this.el.querySelector('.tg-f-msg');
    if (!data.author || !data.title || !data.body) {
      msg.textContent = 'Vul minimaal je naam, een onderwerp en een bericht in.';
      msg.hidden = false;
      return;
    }
    fetch('/api/forum', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.topic) throw new Error('no');
      self.topics.unshift(res.topic);
      self.cat = 'alle';
      self.el.querySelectorAll('[data-cat]').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-cat') === 'alle'); });
      form.reset();
      self.toggleComposer(false);
      self.render();
      window.scrollTo({ top: self.el.offsetTop - 96, behavior: 'smooth' });
    }).catch(function () {
      msg.textContent = 'Er ging iets mis bij het plaatsen. Probeer het nog eens.';
      msg.hidden = false;
    });
  };

  Forum.prototype.reply = function (id, form) {
    var self = this;
    var msg = form.parentElement.querySelector('.tg-f-reply-msg') || form.querySelector('p') || null;
    form.querySelector('button').textContent = 'Bezig…';
    var payload = { author: form.author.value.trim(), body: form.body.value.trim() };
    if (this.user && this.user.id) payload.userId = this.user.id;
    fetch('/api/forum/' + encodeURIComponent(id) + '/replies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.reply) throw new Error('no');
      var topic = self.topics.find(function (t) { return t.id === id; });
      if (topic) { topic.replies = topic.replies || []; topic.replies.push(res.reply); }
      self.open[id] = true;
      form.author.value = ''; form.body.value = '';
      form.querySelector('button').textContent = 'Antwoord →';
      self.render();
    }).catch(function () {
      form.querySelector('button').textContent = 'Antwoord →';
    });
  };

  Forum.prototype.helpful = function (id) {
    var self = this;
    if (this.voted.indexOf(id) !== -1) return;
    fetch('/api/forum/' + encodeURIComponent(id) + '/helpful', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voterToken: token() })
    }).then(function (r) { return r.json(); }).then(function (res) {
      var topic = self.topics.find(function (t) { return t.id === id; });
      if (topic) topic.helpfulCount = res.helpfulCount;
      self.voted.push(id);
      localStorage.setItem('tg-forum-votes', JSON.stringify(self.voted));
      self.render();
    }).catch(function () { /* al gestemd of offline */ });
  };

  function bootAll() {
    document.querySelectorAll('[data-forum-ui]').forEach(function (el) {
      if (!el.__forum) el.__forum = new Forum(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootAll);
  else bootAll();
})();
