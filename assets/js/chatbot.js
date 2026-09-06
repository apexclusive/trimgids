/* TrimGids assistent "TG" (Ronde 9).
   - Kennisbank-modus uit /api/chat (geen API-key nodig)
   - AI-modus zodra OPENAI_API_KEY in .env staat (health-flag bepaalt badge)
   - Floating bubble rechtsonder + chatpaneel; suggestie-chips; affiliate-links
*/
(function () {
  'use strict';

  var state = { open: false, busy: false, mode: 'knowledge' };

  var CSS =
    '#tg-chat-bubble{position:fixed;right:18px;bottom:18px;z-index:99998;width:60px;height:60px;border-radius:50%;' +
    'background:linear-gradient(135deg,#10b981,#0f3e28);border:0;cursor:pointer;box-shadow:0 18px 44px -10px rgba(2,32,19,.5);' +
    'display:grid;place-items:center;color:#fff;font-size:26px;transition:transform .2s}' +
    '#tg-chat-bubble:hover{transform:translateY(-3px) scale(1.04)}' +
    '#tg-chat-bubble .tg-dot{position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;background:#fbbf24;border:2px solid #fff;animation:tgPulse 1.8s infinite}' +
    '@keyframes tgPulse{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.35);opacity:.55}}' +
    '#tg-chat-panel{position:fixed;right:18px;bottom:90px;z-index:99999;width:min(392px,calc(100vw - 28px));height:min(560px,calc(100dvh - 120px));' +
    'background:#fff;border:1px solid #e2e8f0;border-radius:22px;box-shadow:0 34px 90px -22px rgba(2,32,19,.45);display:none;flex-direction:column;overflow:hidden}' +
    '#tg-chat-panel.open{display:flex;animation:tgUp .22s ease}' +
    '@keyframes tgUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '#tg-chat-head{background:linear-gradient(135deg,#07150e,#0f3e28);color:#fff;padding:15px 18px;display:flex;gap:12px;align-items:center;flex:none}' +
    '#tg-chat-head .av{width:40px;height:40px;border-radius:13px;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:21px;flex:none}' +
    '#tg-chat-head b{display:block;font-size:15.5px}' +
    '#tg-chat-head small{color:#a7f3d0;font-size:11.5px;font-weight:700}' +
    '#tg-chat-close{margin-left:auto;background:rgba(255,255,255,.12);border:0;color:#fff;width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:15px}' +
    '#tg-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc}' +
    '.tg-msg{max-width:87%;padding:11px 14px;border-radius:16px;font:500 13.5px/1.55 "Plus Jakarta Sans",system-ui,sans-serif;white-space:pre-wrap}' +
    '.tg-msg.bot{background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:5px;color:#0b1220;align-self:flex-start}' +
    '.tg-msg.me{background:#0f3e28;color:#fff;border-bottom-right-radius:5px;align-self:flex-end}' +
    '.tg-msg b{font-weight:800}' +
    '.tg-chat-links{display:flex;flex-direction:column;gap:6px;align-self:flex-start;max-width:87%}' +
    '.tg-chat-links a{font:800 12.5px "Plus Jakarta Sans",system-ui,sans-serif;color:#0f3e28;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.28);' +
    'padding:8px 13px;border-radius:999px;text-decoration:none;align-self:flex-start;transition:background .15s}' +
    '.tg-chat-links a:hover{background:rgba(16,185,129,.2)}' +
    '.tg-chat-chips{display:flex;gap:7px;flex-wrap:wrap;padding:0 16px 12px;background:#f8fafc;flex:none}' +
    '.tg-chat-chips button{font:700 12px "Plus Jakarta Sans",system-ui,sans-serif;color:#0f3e28;background:#fff;border:1px solid #c9e8d6;border-radius:999px;padding:7px 12px;cursor:pointer}' +
    '.tg-chat-chips button:hover{background:#eaf4ee}' +
    '#tg-chat-form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e2e8f0;background:#fff;flex:none}' +
    '#tg-chat-form input{flex:1;border:1.6px solid #e2e8f0;border-radius:999px;padding:11px 16px;font:inherit;font-size:13.5px;outline:none}' +
    '#tg-chat-form input:focus{border-color:#10b981}' +
    '#tg-chat-form button{background:#0f3e28;color:#fff;border:0;border-radius:999px;padding:0 18px;font:inherit;font-weight:800;cursor:pointer}' +
    '#tg-chat-form button:disabled{opacity:.5;cursor:default}' +
    '.tg-chat-note{padding:8px 16px 0;font-size:11px;color:#94a3b8;background:#f8fafc;flex:none}' +
    '[data-theme="dark"] #tg-chat-panel{background:#101d16;border-color:rgba(255,255,255,.12)}' +
    '[data-theme="dark"] #tg-chat-body{background:#0a1410}' +
    '[data-theme="dark"] #tg-chat-head{background:linear-gradient(135deg,#0a2016,#123528)}' +
    '[data-theme="dark"] .tg-msg.bot{background:#182a20;border-color:rgba(255,255,255,.1);color:#eef5f0}' +
    '[data-theme="dark"] .tg-chat-chips{background:#0a1410}' +
    '[data-theme="dark"] .tg-chat-chips button{background:#182a20;border-color:rgba(16,185,129,.3);color:#a7f3d0}' +
    '[data-theme="dark"] #tg-chat-form{background:#101d16;border-color:rgba(255,255,255,.1)}' +
    '[data-theme="dark"] #tg-chat-form input{background:#182a20;border-color:rgba(255,255,255,.15);color:#eef5f0}' +
    '[data-theme="dark"] .tg-chat-note{background:#0a1410;color:#64748b}' +
    '@media(max-width:600px){#tg-chat-bubble{right:14px;bottom:14px}#tg-chat-panel{right:14px;bottom:86px}}';

  var SUGGESTIONS = [
    'Welke verzekering is het beste?',
    'Mijn hond braakt, wat nu?',
    'Wat kost trimmen?',
    'Hondenbelasting in mijn gemeente'
  ];

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function md(text) {
    return esc(text).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }

  function ensure() {
    if (document.getElementById('tg-chat-root')) return;
    var style = document.createElement('style');
    style.id = 'tg-chat-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = 'tg-chat-root';
    root.innerHTML =
      '<button id="tg-chat-bubble" type="button" aria-label="Open de TrimGids assistent" title="Vraag TG iets over honden">🐾<span class="tg-dot"></span></button>' +
      '<section id="tg-chat-panel" aria-label="TrimGids assistent chat">' +
      '  <header id="tg-chat-head"><span class="av">🐾</span><div><b>TG — TrimGids assistent</b><small id="tg-chat-mode">bezig met verbinden…</small></div><button id="tg-chat-close" type="button" aria-label="Sluit chat">✕</button></header>' +
      '  <div id="tg-chat-body" role="log" aria-live="polite"></div>' +
      '  <div class="tg-chat-chips" id="tg-chat-chips"></div>' +
      '  <p class="tg-chat-note">TG is een hulpmiddel, geen dierenarts. Bij een noodgeval: bel 112/144 of je eigen dierenarts.</p>' +
      '  <form id="tg-chat-form"><input id="tg-chat-input" maxlength="400" placeholder="Stel je vraag…" aria-label="Stel je vraag aan TG" autocomplete="off"><button type="submit" id="tg-chat-send">Verstuur</button></form>' +
      '</section>';
    document.body.appendChild(root);

    var bubble = document.getElementById('tg-chat-bubble');
    var panel = document.getElementById('tg-chat-panel');
    var body = document.getElementById('tg-chat-body');
    var input = document.getElementById('tg-chat-input');
    var form = document.getElementById('tg-chat-form');
    var chips = document.getElementById('tg-chat-chips');
    var send = document.getElementById('tg-chat-send');
    var closeBtn = document.getElementById('tg-chat-close');

    document.getElementById('tg-chat-mode').textContent = '…';

    function say(text, who) {
      var el = document.createElement('div');
      el.className = 'tg-msg ' + (who || 'bot');
      el.innerHTML = md(text);
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }
    function sayLinks(links) {
      if (!links || !links.length) return;
      var wrap = document.createElement('div');
      wrap.className = 'tg-chat-links';
      links.forEach(function (l) {
        var a = document.createElement('a');
        a.href = l.url;
        a.target = l.url.startsWith('/') ? '_self' : '_blank';
        a.rel = l.url.startsWith('/') ? '' : 'sponsored noopener noreferrer';
        a.textContent = l.label;
        wrap.appendChild(a);
      });
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
    }

    function pushChips(list) {
      chips.replaceChildren();
      list.forEach(function (q) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = q;
        b.addEventListener('click', function () { input.value = q; ask(q); });
        chips.appendChild(b);
      });
    }

    async function ask(q) {
      var value = String(q || input.value || '').trim().slice(0, 400);
      if (!value || state.busy) return;
      state.busy = true;
      send.disabled = true;
      input.value = '';
      say(value, 'me');
      pushChips([]);
      try {
        var r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: value }) });
        var d = await r.json();
        if (!r.ok) throw new Error(d.error || 'chat_error');
        say(d.answer || 'Hmm, dat lukte even niet. Probeer het nog eens.');
        sayLinks(d.links);
        if (d.mode) document.getElementById('tg-chat-mode').textContent = d.mode === 'ai' ? '● aangedreven door AI' : '● kennis-gidsmodus';
      } catch (e) {
        say('Oeps, ik kon je vraag niet beantwoorden. Probeer het over een paar seconden opnieuw, of blader even door de gids. 🐾');
      }
      state.busy = false;
      send.disabled = false;
      input.focus();
    }

    bubble.addEventListener('click', function () {
      state.open = !state.open;
      panel.classList.toggle('open', state.open);
      if (state.open) {
        if (!body.children.length) {
          say('Hoi! 👋 Ik ben **TG**, de TrimGids-assistent. Stel me alles over honden: verzekeringen, kosten, trimmen, voeding, wandelen of noodhulp.');
          pushChips(SUGGESTIONS);
        }
        input.focus();
      }
    });
    closeBtn.addEventListener('click', function () { state.open = false; panel.classList.remove('open'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) { state.open = false; panel.classList.remove('open'); }
    });

    /* health-check: AI- of kennis-modus label */
    fetch('/api/chat/health').then(function (r) { return r.json(); }).then(function (d) {
      state.mode = d.mode || 'knowledge';
      var el = document.getElementById('tg-chat-mode');
      if (el && !body.children.length) el.textContent = state.mode === 'ai' ? '● aangedreven door AI' : '● kennis-gidsmodus';
    }).catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else ensure();
})();
