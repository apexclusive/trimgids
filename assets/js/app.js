/* TrimGids gedeelde app-runtime (same-origin, geen dependencies).
   Verantwoordelijk op ALLE pagina's:
   - thema licht/donker (persistent, alle knoppen synchroon)
   - account: registreren, inloggen, uitloggen (httpOnly sessiecookie)
   - favorieten "opslaan tijdens navigatie" (server-account + lokale fallback)
   - algemene interacties: scroll-progress, back-to-top, sticky hub, mobiel menu,
     hero-zoekbalk, categorie-pills, GPS, kaart-geolocatie */
(function () {
  'use strict';

  var STATE = { user: null, favs: [], favKeys: {}, modalOpen: false };

  /* ------------------------------- Toasts ------------------------------- */
  function toast(message, ok) {
    var wrap = document.getElementById('tg-toast-stack');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tg-toast-stack';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    var el = document.createElement('div');
    el.className = 'tg-toast' + (ok ? ' ok' : '');
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  }

  function favKey(type, id) { return 'tg:' + type + ':' + id; }

  function parseSave(attr) {
    try { return JSON.parse(attr); } catch (e) { return null; }
  }

  /* ------------------------------- Thema -------------------------------- */
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('trimgids_theme') || 'light';
  }

  function applyTheme(theme, silent) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('trimgids_theme', theme); } catch (e) {}
    if (!silent) syncThemeButtons();
  }

  function syncThemeButtons() {
    var theme = currentTheme();
    var dark = theme === 'dark';
    document.querySelectorAll('#theme-toggle, [data-theme-toggle], .tg-theme-btn').forEach(function (btn) {
      var icon = btn.querySelector('.theme-icon') || btn;
      icon.innerHTML = dark ? '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg>' : '<svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg>';
      btn.setAttribute('aria-pressed', String(dark));
      btn.title = dark ? 'Schakel naar licht thema' : 'Schakel naar donker thema';
      btn.setAttribute('aria-label', btn.title);
    });
  }

  /* --------------------- Nav-knoppen automatisch ------------------------ */
  function ensureNavButtons() {
    var container = null;
    if (!document.getElementById('account-btn')) {
      container = document.querySelector('nav.site .links') ||
        document.querySelector('header nav .nav-links') ||
        document.querySelector('.nav-actions') ||
        document.querySelector('header nav');
    }
    if (!container) container = document.querySelector('.nav-actions');
    if (container && !document.getElementById('theme-toggle')) {
      var themeBtn = document.createElement('button');
      themeBtn.id = 'theme-toggle';
      themeBtn.type = 'button';
      themeBtn.className = 'tg-nav-btn tg-theme-btn';
      themeBtn.innerHTML = '<span class="theme-icon"><svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg></span>';
      container.appendChild(themeBtn);
      if (container.classList.contains('nav-actions')) container.insertBefore(themeBtn, container.querySelector('.menu-btn') || null);
    }
    if (container && !document.getElementById('account-btn')) {
      var accBtn = document.createElement('button');
      accBtn.id = 'account-btn';
      accBtn.type = 'button';
      accBtn.className = 'tg-nav-btn tg-account-btn';
      accBtn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-user"/></svg> <span>Inloggen</span>';
      container.appendChild(accBtn);
    }
    /* Legacy losse thema-knop opruimen (wordt nu centraal beheerd) */
    var old = document.getElementById('ssr-theme-btn');
    if (old) old.remove();
    renderAccountButton();
  }

  function renderAccountButton() {
    var btn = document.getElementById('account-btn');
    if (!btn) return;
    if (STATE.user) {
      btn.innerHTML = '<span class="tg-avatar">' + esc(String(STATE.user.name || '?').slice(0, 1).toUpperCase()) + '</span><span>' + esc(STATE.user.name) + '</span>';
      btn.classList.add('logged-in');
      btn.setAttribute('aria-label', 'Mijn profiel — ' + STATE.user.name);
    } else {
      btn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-user"/></svg> <span>Inloggen</span>';
      btn.classList.remove('logged-in');
      btn.setAttribute('aria-label', 'Inloggen of registreren');
    }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------ Favorieten ---------------------------- */
  function guestFavs() {
    try { return JSON.parse(localStorage.getItem('tg-guest-favs') || '[]'); } catch (e) { return []; }
  }

  function saveGuestFavs(list) {
    try { localStorage.setItem('tg-guest-favs', JSON.stringify(list)); } catch (e) {}
  }

  function isFav(type, id) {
    return !!(STATE.favKeys[favKey(type, id)] || guestFavs().some(function (f) { return f.type === type && f.id === id; }));
  }

  function refreshSaveButtons(root) {
    (root || document).querySelectorAll('[data-save]').forEach(function (btn) {
      var data = parseSave(btn.getAttribute('data-save'));
      if (!data) return;
      var saved = isFav(data.type, data.id);
      btn.classList.toggle('is-saved', saved);
      if (btn.querySelector('.tg-save-label')) btn.querySelector('.tg-save-label').textContent = saved ? 'Opgeslagen' : 'Bewaren';
      btn.title = saved ? 'Verwijder uit mijn favorieten' : 'Bewaar in mijn favorieten';
    });
  }

  function toggleFav(data, sourceEl) {
    if (!data || !data.type || !data.id) return;
    var key = favKey(data.type, data.id);
    if (STATE.user) {
      var saved = !!STATE.favKeys[key];
      var url = '/api/me/favorites';
      var init = { method: saved ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
      fetch(url, init).then(function (r) {
        if (r.status === 401) { requireLogin('Log in om je favorieten op je profiel te bewaren.'); throw new Error('auth'); }
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function (res) {
        setFavs(res.favorites || []);
        refreshSaveButtons();
        toast(saved ? 'Uit je favorieten verwijderd' : '💾 Opgeslagen in je profiel', true);
      }).catch(function () {});
      return;
    }
    /* Gast: lokaal bewaren + uitnodigen om te koppelen */
    var guest = guestFavs();
    var idx = guest.findIndex(function (f) { return f.type === data.type && f.id === data.id; });
    if (idx >= 0) {
      guest.splice(idx, 1);
      toast('Uit je boekjes verwijderd');
    } else {
      guest.unshift({ type: data.type, id: data.id, title: data.title || '', href: data.href || '/', createdAt: new Date().toISOString() });
      toast('💾 Bewaard op dit apparaat');
    }
    saveGuestFavs(guest);
    refreshSaveButtons();
    if (idx < 0 && !STATE.user) requireLogin('Maak een gratis account om je favorieten veilig te bewaren op elk apparaat.');
  }

  function setFavs(list) {
    STATE.favs = list || [];
    STATE.favKeys = {};
    STATE.favs.forEach(function (f) { STATE.favKeys[favKey(f.type, f.id)] = true; });
    refreshSaveButtons();
    if (STATE.modalOpen) renderProfile();
  }

  function mergeGuestFavs() {
    var guest = guestFavs();
    if (!guest.length || !STATE.user) return Promise.resolve();
    var chain = Promise.resolve();
    guest.forEach(function (f) {
      chain = chain.then(function () {
        return fetch('/api/me/favorites', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: f.type, id: f.id, title: f.title || '', href: f.href || '/' })
        }).then(function (r) { if (!r.ok) throw new Error('fail'); return r.json(); })
          .then(function (res) { setFavs(res.favorites || []); })
          .catch(function () {});
      });
    });
    return chain.then(function () {
      saveGuestFavs([]);
      toast('💾 Je lokale favorieten zijn gekoppeld aan je account', true);
    });
  }

  /* ------------------------------ Account ------------------------------- */
  function api(url, options) {
    return fetch(url, options).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) { var err = new Error((body && body.message) || (body && body.error) || 'request_failed'); err.status = r.status; throw err; }
        return body;
      });
    });
  }

  function loadSession() {
    return api('/api/auth/me').then(function (res) {
      STATE.user = res.user || null;
      setFavs(res.favorites || []);
      renderAccountButton();
      return STATE.user;
    }).catch(function () {
      STATE.user = null;
      renderAccountButton();
      return null;
    });
  }

  function logout() {
    return api('/api/auth/logout', { method: 'POST' }).then(function () {
      STATE.user = null;
      STATE.favs = [];
      STATE.favKeys = {};
      renderAccountButton();
      refreshSaveButtons();
      toast('Je bent uitgelogd');
      openAuth('auth');
    }).catch(function () { toast('Uitloggen mislukt — probeer het opnieuw'); });
  }

  /* ------------------------------- Modal -------------------------------- */
  function ensureStyles() {
    if (document.getElementById('tg-app-css')) return;
    var style = document.createElement('style');
    style.id = 'tg-app-css';
    style.textContent =
      '#tg-toast-stack{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;display:grid;gap:8px;width:min(420px,calc(100vw - 32px))}' +
      '.tg-toast{background:#0f3e28;color:#fff;font:700 13.5px "Plus Jakarta Sans",system-ui,sans-serif;padding:12px 16px;border-radius:14px;box-shadow:0 14px 40px rgba(2,32,19,.35);text-align:center;opacity:1;transition:opacity .4s,transform .4s}' +
      '.tg-toast.ok{background:#065f46}' +
      '.tg-toast.out{opacity:0;transform:translateY(8px)}' +
      '.tg-nav-btn{display:inline-flex;align-items:center;gap:6px;font:800 13px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink,#0b1220);background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);border-radius:999px;padding:8px 14px;cursor:pointer;transition:border-color .18s,transform .18s,background .18s;white-space:nowrap}' +
      '.tg-nav-btn:hover{border-color:#10b981;transform:translateY(-1px)}' +
      '.tg-account-btn .tg-avatar{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#10b981,#0f3e28);color:#fff;font-size:12px}' +
      '.tg-account-btn.logged-in{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.4)}' +
      '.tg-save-btn{display:inline-flex;align-items:center;gap:6px;font:800 12.5px "Plus Jakarta Sans",system-ui,sans-serif;color:#64748b;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);border-radius:999px;padding:7px 12px;cursor:pointer;transition:all .18s}' +
      '.tg-save-btn:hover{border-color:#10b981;color:#0f3e28}' +
      '.tg-save-btn.is-saved{background:rgba(16,185,129,.12);border-color:#10b981;color:#065f46}' +
      '.tg-search-shell{position:relative;display:flex;align-items:center;min-width:0}' +
      '.tg-search-input{font:700 13.5px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink,#0b1220);background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);border-radius:999px;padding:9px 13px 9px 36px;width:min(230px,26vw);outline:none;transition:border-color .18s,box-shadow .18s,width .25s}' +
      '.tg-search-input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.15);width:min(300px,34vw)}' +
      '.tg-search-input::placeholder{color:#94a3b8}' +
      '.tg-search-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748b;pointer-events:none;display:grid;place-items:center}' +
      '.tg-search-kbd{position:absolute;right:10px;top:50%;transform:translateY(-50%);font:800 10px "Plus Jakarta Sans",sans-serif;color:#94a3b8;border:1px solid var(--line,#e2e8f0);border-radius:6px;padding:2px 5px;background:var(--bg,#f8fafc);pointer-events:none}' +
      '.tg-search-drop{position:absolute;top:calc(100% + 8px);left:0;right:0;min-width:min(380px,86vw);background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);border-radius:16px;box-shadow:0 24px 60px -18px rgba(2,32,19,.3);padding:8px;z-index:99995;display:none;max-height:min(430px,62vh);overflow:auto}' +
      '.tg-search-drop.open{display:grid;gap:2px}' +
      '.tg-search-item{display:flex;gap:11px;align-items:center;padding:10px 12px;border-radius:12px;text-decoration:none;color:var(--ink,#0b1220);cursor:pointer}' +
      '.tg-search-item:hover,.tg-search-item.act{background:rgba(16,185,129,.09)}' +
      '.tg-search-item .i{width:34px;height:34px;flex:none;border-radius:10px;background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:16px}' +
      '.tg-search-item b{font-size:13.5px;display:block;line-height:1.3}' +
      '.tg-search-item small{font-size:11.5px;color:#64748b;display:block}' +
      '.tg-search-empty{padding:14px 12px;font-size:13px;color:#64748b}' +
      '.tg-search-foot{display:flex;justify-content:space-between;align-items:center;padding:8px 12px 4px;font-size:11px;color:#94a3b8;border-top:1px solid var(--line,#e2e8f0);margin-top:4px}' +
      '@media(max-width:1000px){.nav-actions > a[href="/bedrijven"]{display:none}.tg-search-shell{order:0}.tg-search-input{width:min(150px,34vw)}.tg-search-input:focus{width:min(190px,46vw)}.tg-search-kbd{display:none}}' +
      '@media(max-width:600px){.tg-search-input{width:min(120px,36vw)}.tg-search-input:focus{width:min(168px,60vw)}}' +
      '.tg-overlay{position:fixed;inset:0;z-index:99990;background:rgba(4,20,13,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px;animation:tgFade .2s ease}' +
      '@keyframes tgFade{from{opacity:0}to{opacity:1}}' +
      '.tg-modal{background:var(--card,#fff);color:var(--ink,#0b1220);border:1px solid var(--line,#e2e8f0);border-radius:24px;box-shadow:0 30px 80px rgba(2,32,19,.4);width:min(460px,100%);max-height:min(88vh,760px);overflow:auto;padding:26px}' +
      '.tg-modal h2{margin:0 0 4px;font-size:22px;letter-spacing:-.02em}' +
      '.tg-modal .tg-sub{color:var(--muted,#64748b);font-size:13.5px;margin-bottom:16px}' +
      '.tg-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--bg,#f1f5f9);padding:5px;border-radius:14px;margin-bottom:16px}' +
      '.tg-tabs button{border:0;background:none;font:800 13.5px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--muted,#64748b);padding:9px;border-radius:10px;cursor:pointer}' +
      '.tg-tabs button.on{background:var(--card,#fff);color:var(--ink,#0f3e28);box-shadow:0 2px 8px rgba(15,62,40,.14)}' +
      '.tg-field{margin-bottom:12px}.tg-field label{display:block;font:700 12.5px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--muted,#64748b);margin-bottom:5px}' +
      '.tg-field input{width:100%;font:600 14.5px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink,#0b1220);background:var(--bg,#f8fafc);border:1px solid var(--line,#e2e8f0);border-radius:12px;padding:11px 13px;outline:none;transition:border-color .15s}' +
      '.tg-field input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.15)}' +
      '.tg-btn{width:100%;border:0;background:linear-gradient(135deg,#0f3e28,#165b3c);color:#fff;font:800 14.5px "Plus Jakarta Sans",system-ui,sans-serif;padding:13px;border-radius:14px;cursor:pointer;transition:transform .15s,box-shadow .15s}' +
      '.tg-btn:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(15,62,40,.35)}' +
      '.tg-btn:disabled{opacity:.6;cursor:wait}' +
      '.tg-msg{min-height:20px;margin:10px 0 0;font:700 13px "Plus Jakarta Sans",system-ui,sans-serif;color:#b91c1c}' +
      '.tg-msg.ok{color:#047857}' +
      '.tg-note{font-size:12px;color:var(--muted,#64748b);line-height:1.5;margin-top:12px}' +
      '.tg-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;border-radius:50%;background:var(--bg,#f1f5f9);color:var(--muted,#64748b);font-size:15px;cursor:pointer}' +
      '.tg-modal-wrap{position:relative}' +
      '.tg-fav-item{display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid var(--line,#e2e8f0);border-radius:14px;padding:11px 13px;margin-bottom:8px;background:var(--bg,#f8fafc)}' +
      '.tg-fav-item a{font:700 13.5px "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink,#0f3e28);text-decoration:none;word-break:break-word}' +
      '.tg-fav-item button{border:0;background:none;color:#b91c1c;font:800 12px "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer;padding:4px}' +
      '.tg-empty{text-align:center;color:var(--muted,#64748b);font-size:13.5px;padding:18px 0}' +
      '.tg-user-chip{display:flex;align-items:center;gap:10px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);border-radius:14px;padding:11px 13px;margin-bottom:14px}' +
      '.tg-user-chip .tg-avatar{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#0f3e28);color:#fff;font-weight:800}' +
      '.tg-user-chip b{display:block;font-size:14.5px}.tg-user-chip span{color:var(--muted,#64748b);font-size:12px}' +
      '@media(max-width:640px){.tg-modal{padding:20px;border-radius:18px}.tg-nav-btn{padding:7px 10px;font-size:12px}}';
    document.head.appendChild(style);
  }

  function ensureModal() {
    ensureStyles();
    var overlay = document.getElementById('tg-auth-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'tg-auth-overlay';
    overlay.className = 'tg-overlay';
    overlay.innerHTML =
      '<div class="tg-modal" role="dialog" aria-modal="true" aria-label="Account en favorieten">' +
      '  <div class="tg-modal-wrap">' +
      '    <button type="button" class="tg-close" aria-label="Sluiten">✕</button>' +
      '    <span class="tg-modal-head"></span>' +
      '    <div id="tg-auth-body"></div>' +
      '  </div>' +
      '</div>';
    overlay.querySelector('.tg-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && STATE.modalOpen) closeModal(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  function closeModal() {
    var overlay = document.getElementById('tg-auth-overlay');
    if (overlay) overlay.style.display = 'none';
    STATE.modalOpen = false;
  }

  function openAuth(view) {
    var overlay = ensureModal();
    overlay.style.display = 'grid';
    STATE.modalOpen = true;
    if (STATE.user) return renderProfile();
    renderAuthForm(view === 'register' ? 'register' : 'auth', '');
  }

  function requireLogin(message) {
    var overlay = ensureModal();
    overlay.style.display = 'grid';
    STATE.modalOpen = true;
    renderAuthForm('auth', message || '');
  }

  function renderAuthForm(view, notice) {
    var body = document.getElementById('tg-auth-body');
    var head = document.querySelector('#tg-auth-overlay .tg-modal-head');
    if (head) head.innerHTML = '<h2>' + (view === 'register' ? 'Account aanmaken' : 'Welkom terug') + '</h2><p class="tg-sub">Eén gratis account voor het forum en je favorieten.</p>';
    body.innerHTML =
      '<div class="tg-tabs">' +
      '  <button type="button" data-tg-view="auth" class="' + (view === 'auth' ? 'on' : '') + '">Inloggen</button>' +
      '  <button type="button" data-tg-view="register" class="' + (view === 'register' ? 'on' : '') + '">Registreren</button>' +
      '</div>' +
      (notice ? '<p class="tg-msg" style="color:#92400e">' + esc(notice) + '</p>' : '') +
      (view === 'register' ?
        '<form id="tg-register-form">' +
        '  <div class="tg-field"><label for="tg-reg-name">Gebruikersnaam (zichtbaar in het forum)</label><input id="tg-reg-name" name="name" maxlength="40" autocomplete="username" placeholder="Bijv. Sam uit Maastricht" required></div>' +
        '  <div class="tg-field"><label for="tg-reg-email">E-mailadres</label><input id="tg-reg-email" name="email" type="email" maxlength="120" autocomplete="email" required></div>' +
        '  <div class="tg-field"><label for="tg-reg-pass">Wachtwoord (minimaal 8 tekens)</label><input id="tg-reg-pass" name="password" type="password" minlength="8" maxlength="200" autocomplete="new-password" required></div>' +
        '  <button class="tg-btn" type="submit">Account maken →</button>' +
        '  <p class="tg-msg" id="tg-auth-msg" hidden></p>' +
        '</form>' :
        '<form id="tg-login-form">' +
        '  <div class="tg-field"><label for="tg-login-id">E-mail of gebruikersnaam</label><input id="tg-login-id" name="identity" maxlength="120" autocomplete="username" required></div>' +
        '  <div class="tg-field"><label for="tg-login-pass">Wachtwoord</label><input id="tg-login-pass" name="password" type="password" maxlength="200" autocomplete="current-password" required></div>' +
        '  <button class="tg-btn" type="submit">Inloggen →</button>' +
        '  <p class="tg-msg" id="tg-auth-msg" hidden></p>' +
        '</form>') +
      '<p class="tg-note">🔒 Wachtwoorden worden versleuteld opgeslagen. Je sessie geldt 30 dagen via een beveiligde cookie — er wordt geen wachtwoord in je browser bewaard.</p>';
    body.querySelectorAll('[data-tg-view]').forEach(function (btn) {
      btn.addEventListener('click', function () { renderAuthForm(btn.getAttribute('data-tg-view'), ''); });
    });
    var form = document.getElementById(view === 'register' ? 'tg-register-form' : 'tg-login-form');
    var msg = document.getElementById('tg-auth-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.tg-btn');
      btn.disabled = true;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var isRegister = form.id === 'tg-register-form';
      api(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (res) {
          STATE.user = res.user;
          setFavs([]);
          renderAccountButton();
          toast('👋 Welkom, ' + STATE.user.name + '!', true);
          return mergeGuestFavs();
        })
        .then(function () { renderProfile(); })
        .catch(function (err) {
          msg.hidden = false;
          msg.textContent = err.message || 'Er ging iets mis. Probeer het opnieuw.';
          btn.disabled = false;
        });
    });
  }

  function renderProfile() {
    var body = document.getElementById('tg-auth-body');
    var head = document.querySelector('#tg-auth-overlay .tg-modal-head');
    var user = STATE.user;
    if (!user) { renderAuthForm('auth', ''); return; }
    if (head) head.innerHTML = '<h2>Mijn profiel</h2><p class="tg-sub">Jouw favorieten — overal opgeslagen dankzij je account.</p>';
    var favsHtml = STATE.favs.length
      ? STATE.favs.map(function (f, i) {
        return '<div class="tg-fav-item"><a href="' + esc(f.href || '/') + '" data-tg-close>' + esc(f.title || f.id) + '</a><button type="button" data-tg-unfav="' + i + '">✕ verwijder</button></div>';
      }).join('')
      : '<p class="tg-empty">Nog niets bewaard. Klik op 🔖 bij artikelen, gidsen, producten of forumonderwerpen.</p>';
    body.innerHTML =
      '<div class="tg-user-chip"><span class="tg-avatar">' + esc(String(user.name || '?').slice(0, 1).toUpperCase()) + '</span><div><b>' + esc(user.name) + '</b><span>' + esc(user.email) + '</span></div></div>' +
      '<h3 style="font-size:15px;margin:0 0 10px">🔖 Mijn favorieten (' + STATE.favs.length + ')</h3>' +
      '<div id="tg-fav-list">' + favsHtml + '</div>' +
      '<button type="button" class="tg-btn" id="tg-logout" style="margin-top:10px;background:#fff;color:#b91c1c;border:1.5px solid #fca5a5">Uitloggen</button>' +
      '<p class="tg-note">Tip: gebruik de 🔖-knop bij gidsen, producten en forumonderwerpen om ze hier terug te vinden.</p>';
    body.querySelectorAll('[data-tg-close]').forEach(function (a) {
      a.addEventListener('click', closeModal);
    });
    body.querySelectorAll('[data-tg-unfav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = STATE.favs[Number(btn.getAttribute('data-tg-unfav'))];
        if (item) toggleFav({ type: item.type, id: item.id, title: item.title, href: item.href });
      });
    });
    document.getElementById('tg-logout').addEventListener('click', logout);
  }

  /* ---------------------------- Nieuwsbrief ----------------------------- */
  function initNewsletter() {
    var container = document.querySelector('[data-tg-newsletter]') || document.getElementById('tg-newsletter');
    if (!container) return;
    var form = container.querySelector('.tg-newsletter-form') || container.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('input[type=email]');
      var btn = form.querySelector('button[type=submit]');
      var ok = container.querySelector('.tg-newsletter-ok') || container.querySelector('.home-newsletter-ok');
      var email = emailInput && emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      btn.disabled = true;
      btn.textContent = 'Bezig…';
      fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res.subscribed) {
          if (ok) { ok.hidden = false; ok.textContent = res.already ? '✅ Je stond al op de lijst — bedankt!' : '✅ Bedankt! Je staat op de lijst — check je inbox.'; }
          if (emailInput) emailInput.value = '';
          toast(res.already ? 'Je stond al op de lijst 💌' : '💌 Aangemeld voor de deal- & kennisbrief', true);
        } else { toast('Aanmelden mislukt — probeer het opnieuw'); }
      }).catch(function () { toast('Aanmelden mislukt — probeer het opnieuw'); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Aanmelden →'; });
    });
  }

  /* ------------------------ Homepage-interacties ------------------------ */
  function initScrollUI() {
    var progress = document.getElementById('scroll-progress');
    var backTop = document.getElementById('back-to-top');
    var nav = document.getElementById('tg-site-nav');
    if (!progress && !backTop && !nav) return;
    var onScroll = function () {
      var top = document.documentElement.scrollTop || document.body.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (progress) progress.style.width = (height > 0 ? (top / height) * 100 : 0) + '%';
      if (backTop) backTop.classList.toggle('visible', top > 350);
      if (nav) nav.classList.toggle('scrolled', top > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* Ronde 11 — actieve nav-pill markeren (is-current) op álle pagina's */
  function initCurrentNav() {
    var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    document.querySelectorAll('#main-nav > a.nav-pill, #main-nav > .nav-more').forEach(function () {});
    document.querySelectorAll('#main-nav > a.nav-pill').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0].replace(/\/+$/, '') || '/';
      if (href === path || (href !== '/' && path.indexOf(href) === 0)) a.classList.add('is-current');
    });
  }

  function initHubHighlight() {
    var pills = document.querySelectorAll('.hub-pill');
    var sections = document.querySelectorAll('main section[id]');
    if (!pills.length || !sections.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        pills.forEach(function (pill) {
          if (pill.getAttribute('href') === '#' + id) {
            pills.forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
          }
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  function initMobileMenu() {
    var menuBtn = document.querySelector('.menu-btn');
    var mainNav = document.getElementById('main-nav');
    if (!menuBtn || !mainNav) return;
    menuBtn.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { mainNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
  }

  function slugFor(value) {
    return String(value || '').toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  window.handleModernSearch = function (e) {
    if (e) e.preventDefault();
    var service = (document.getElementById('search-service') && document.getElementById('search-service').value) || 'trimsalon';
    var loc = (document.getElementById('search-location') && document.getElementById('search-location').value.trim()) || '';
    var breed = (document.getElementById('search-breed') && document.getElementById('search-breed').value) || '';
    if (service === 'wandelen') { window.location.href = '/wandelen' + (loc ? '?q=' + encodeURIComponent(loc) : ''); return false; }
    if (service === 'verzekering') { window.location.href = '/verzekering'; return false; }
    var place = slugFor(loc);
    if (!place) { window.location.href = breed && service === 'trimsalon' ? '/trimsalon/' + breed : '/' + service; return false; }
    var target = '/' + service + '/' + place + (breed && service === 'trimsalon' ? '/' + breed : '');
    window.location.href = target;
    return false;
  };
  window.zoek = window.handleModernSearch;

  function initCategoryPills() {
    var pills = document.querySelectorAll('.cat-pill');
    var select = document.getElementById('search-service');
    if (!pills.length || !select) return;
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        select.value = pill.getAttribute('data-cat');
      });
    });
    select.addEventListener('change', function (e) {
      var value = e.target.value;
      pills.forEach(function (p) {
        var match = p.getAttribute('data-cat') === value;
        p.classList.toggle('active', match);
        p.setAttribute('aria-pressed', String(match));
      });
    });
  }

  function geoQuick(btn) {
    if (!navigator.geolocation) { toast('Geolocatie wordt niet ondersteund door je browser.'); return; }
    var mapEl = document.querySelector('[data-nl-map]');
    if (btn) { btn.style.opacity = '0.5'; btn.disabled = true; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (btn) { btn.style.opacity = '1'; btn.disabled = false; }
      if (mapEl && mapEl.__map && typeof mapEl.__map.geolocate === 'function') {
        mapEl.__map.items.forEach(function (item) {
          item.dist = haversine(pos.coords.latitude, pos.coords.longitude, item.lat, item.lng);
        });
        mapEl.__map.nearMode = true;
        mapEl.__map.renderList();
        mapEl.__map.stat.textContent = '📍 Jouw locatie is gebruikt — resultaten gesorteerd op afstand.';
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = '/kaart';
      }
    }, function () {
      if (btn) { btn.style.opacity = '1'; btn.disabled = false; }
      toast('Locatie niet beschikbaar — typ handmatig je plaatsnaam.');
    }, { timeout: 8000 });
  }

  function haversine(lat1, lng1, lat2, lng2) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function initGeoButtons() {
    var quick = document.getElementById('btn-quick-gps');
    if (quick) quick.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); geoQuick(quick); });
    var homeGeo = document.getElementById('home-geoloc');
    if (homeGeo) homeGeo.addEventListener('click', function () { geoQuick(homeGeo); });
  }

  function initSaveButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-save]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggleFav(parseSave(btn.getAttribute('data-save')), btn);
    });
    refreshSaveButtons();
  }

  function initDelegatedTheme() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#theme-toggle, [data-theme-toggle]');
      if (!btn) return;
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ------------------- Site-zoekbalk (Ronde 9) --------------------------
     Universeele zoekbalk in HEADER via /api/sitesearch:
     - live suggesties (debounce 200 ms), pijltjes + Enter, Escape sluit
     - Ctrl/Cmd+K en "/" focussen de zoekbalk op elke pagina            */
  function go(url) {
    if (window.__tgNav) { window.__tgNav(url); return; }
    window.location.href = url;
  }
  function initSiteSearch() {
    if (document.getElementById('tg-search-shell')) return;
    var host = document.querySelector('.nav-actions') || document.querySelector('nav.site .in') || document.querySelector('header nav') || document.querySelector('nav');
    if (!host) return;

    var shell = document.createElement('div');
    shell.className = 'tg-search-shell';
    shell.id = 'tg-search-shell';
    shell.innerHTML =
      '<span class="tg-search-ic" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="20.4" y1="20.4" x2="16.6" y2="16.6"></line></svg></span>' +
      '<input class="tg-search-input" id="tg-search-input" type="search" placeholder="Zoek in TrimGids…" aria-label="Zoek in TrimGids" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="tg-search-drop">' +
      '<span class="tg-search-kbd" aria-hidden="true">Ctrl K</span>' +
      '<div class="tg-search-drop" id="tg-search-drop" role="listbox"></div>';
    host.appendChild(shell);

    var input = shell.querySelector('input');
    var drop = shell.querySelector('.tg-search-drop');
    var items = [];
    var active = -1;
    var timer = null;

    function close() {
      drop.classList.remove('open');
      drop.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    }
    function render(list) {
      items = list;
      active = -1;
      if (!list.length) {
        drop.innerHTML = '<p class="tg-search-empty">Geen directe match — druk op Enter om verder te zoeken.</p>';
        drop.classList.add('open');
        return;
      }
      drop.innerHTML = list.map(function (r, i) {
        return '<a class="tg-search-item" data-i="' + i + '" href="' + r.url + '" role="option" aria-selected="false"><span class="i">' + r.icon + '</span><span><b>' + r.title + '</b><small>' + r.url + '</small></span></a>';
      }).join('') + '<div class="tg-search-foot"><span>↵ openen</span><span>' + list.length + ' resultaten</span></div>';
      drop.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('input', function () {
      var v = input.value.trim();
      clearTimeout(timer);
      if (!v) return close();
      timer = setTimeout(function () {
        fetch('/api/sitesearch?q=' + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (d) { render(d.results || []); }).catch(function () {});
      }, 200);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); input.blur(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        drop.querySelectorAll('.tg-search-item').forEach(function (el, i) { el.classList.toggle('act', i === active); el.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
        var act = drop.querySelector('.tg-search-item.act');
        if (act) act.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter') {
        var v = input.value.trim();
        var first = (active >= 0 && items[active]) ? items[active] : (items[0] || null);
        if (first) { e.preventDefault(); go(first.url); return; }
        if (v) { e.preventDefault(); go('/zoek?q=' + encodeURIComponent(v)); }
        return;
      }
    });
    document.addEventListener('click', function (e) {
      var item = e.target.closest('.tg-search-item');
      if (item) return; /* navigatie via href */
      if (!e.target.closest('.tg-search-shell')) close();
    });
    document.addEventListener('keydown', function (e) {
      var inField = /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName || '');
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); input.focus(); input.select(); return; }
      if (e.key === '/' && !inField) { e.preventDefault(); input.focus(); }
    });
  }

  /* -------------------------------- Boot -------------------------------- */
  function boot() {
    ensureStyles();
    syncThemeButtons();
    ensureNavButtons();
    initDelegatedTheme();
    initSaveButtons();
    initScrollUI();
    initHubHighlight();
    initCurrentNav();
    initMobileMenu();
    initCategoryPills();
    initGeoButtons();
    initNewsletter();
    initSiteSearch();

    document.addEventListener('click', function (e) {
      var acc = e.target.closest('#account-btn');
      if (acc) { e.preventDefault(); openAuth(STATE.user ? 'profile' : 'auth'); }
    });

    loadSession();
  }

  /* Publieke hooks voor andere componenten */
  window.TGApp = {
    get user() { return STATE.user; },
    get favorites() { return STATE.favs; },
    isFav: isFav,
    toggleFav: toggleFav,
    refreshSaveButtons: refreshSaveButtons,
    openAuth: openAuth,
    requireLogin: requireLogin,
    toast: toast
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
