/* Gedeelde shell + design system voor de nieuwe TrimGids-kennispagina's.
   Ronde 10: de site-chrome (announcement-bar, glass-navbar, footer + nieuwsbrief)
   komt uit ./chrome.mjs — exact dezelfde als op de homepage. */

import { siteHeader, siteFooter, chromeCssLink } from './chrome.mjs';

const BASE_CSS = `
:root{--g:#0f3e28;--g2:#165b3c;--em:#10b981;--em-l:#a7f3d0;--amber:#d97706;--ink:#0b1220;--muted:#64748b;--line:#e5e9ef;--bg:#f8fafc;--card:#ffffff;--r:18px;--r-lg:26px;--shadow:0 8px 28px -8px rgba(2,32,19,.14);--shadow-lg:0 24px 60px -20px rgba(2,32,19,.25)}
[data-theme=dark],.dark{--ink:#eef5f0;--muted:#9fb3a8;--line:rgba(255,255,255,.12);--bg:#0a1410;--card:#101d16;color-scheme:dark}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}button{font:inherit;cursor:pointer}
h1,h2,h3,h4{letter-spacing:-.02em;line-height:1.18;text-wrap:balance}
.wrap{max-width:1220px;margin:0 auto;padding:0 20px}
main{padding:44px 0 70px}
.crumb{color:var(--muted);font-size:13px;font-weight:700;margin-bottom:14px}
.crumb a{color:var(--g)}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--em);margin-bottom:8px}
h1{font-size:clamp(30px,4.6vw,46px);font-weight:800;max-width:820px}
.intro{color:var(--muted);font-size:17px;max-width:760px;margin:12px 0 26px}
.hero{background:radial-gradient(120% 130% at 20% 0%,rgba(16,185,129,.14),transparent 55%),var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:clamp(26px,4vw,44px);box-shadow:var(--shadow)}
.grid{display:grid;gap:18px}
.g3{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:22px;box-shadow:var(--shadow)}
.card h2,.card h3{font-size:19px;margin-bottom:8px}
.card p{color:var(--muted);font-size:14.5px}
.card ul{list-style:none;display:grid;gap:8px;margin-top:10px}
.card li{font-size:14px;display:flex;gap:9px;align-items:flex-start;color:var(--ink)}
.card li::before{content:"✓";color:var(--em);font-weight:800;flex:none}
section.sec{margin:56px 0 0}
.sec h2{font-size:clamp(24px,3vw,32px);font-weight:800;margin-bottom:6px}
.sec .sub{color:var(--muted);max-width:720px;margin-bottom:22px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--g);color:#fff;font-weight:800;font-size:14.5px;padding:12px 20px;border-radius:999px;border:0;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px -10px rgba(15,62,40,.45)}
.btn.ghost{background:transparent;color:var(--g);border:1.6px solid var(--line)}
.btn.gold{background:linear-gradient(135deg,#f59e0b,#d97706)}
.btn.sm{padding:9px 15px;font-size:13px}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;background:rgba(16,185,129,.12);color:var(--g)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.step{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;position:relative}
.step .n{width:34px;height:34px;border-radius:12px;background:var(--g);color:#fff;display:grid;place-items:center;font-weight:800;margin-bottom:12px}
.step h3{font-size:16.5px;margin-bottom:6px}
.step p{color:var(--muted);font-size:14px}
.quote{background:var(--card);border-left:4px solid var(--em);border-radius:var(--r);padding:20px 22px;box-shadow:var(--shadow)}
.quote p{color:var(--ink);font-size:15.5px}
.quote footer{margin-top:8px;color:var(--muted);font-size:13px;font-weight:700}
.quote footer a{color:var(--g);text-decoration:underline}
.next{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.qas{display:grid;gap:10px}
.qa{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.qa b{display:block;margin-bottom:5px}
.qa p{font-size:14px;color:var(--muted)}
.qa .why{font-size:12.5px;font-weight:700;color:var(--g);margin-top:6px}
.timeline{display:grid;gap:0;margin-top:18px}
.tl{display:grid;grid-template-columns:64px 1fr;gap:18px;padding:0 0 22px;position:relative}
.tl::before{content:"";position:absolute;left:31px;top:36px;bottom:0;width:2px;background:var(--line)}
.tl:last-child::before{display:none}
.tl .dot{width:40px;height:40px;border-radius:50%;background:var(--card);border:2px solid var(--em);display:grid;place-items:center;font-size:17px;z-index:1}
.tl h3{font-size:16px}
.tl p{color:var(--muted);font-size:14px}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.compare .ok,.compare .no{border-radius:var(--r);padding:22px}
.compare .ok{background:var(--card);border:1.6px solid var(--em)}
.compare .no{background:var(--card);border:1.6px solid #fca5a5}
.compare h3{font-size:17px;margin-bottom:10px}
.compare ul{list-style:none;display:grid;gap:8px;font-size:14px}
.compare .ok li::before{content:"✓";color:var(--em);font-weight:800;margin-right:8px}
.compare .no li::before{content:"✕";color:#dc2626;font-weight:800;margin-right:8px}
.table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;font-size:14.5px}
.table th,.table td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--line)}
.table th{background:var(--g);color:#fff;font-size:13px;letter-spacing:.04em}
.table tr:last-child td{border-bottom:0}
.checklist{display:grid;gap:10px}
.check{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;cursor:pointer;transition:border-color .2s}
.check:hover{border-color:var(--em)}
.check input{margin-top:4px;accent-color:var(--em);width:17px;height:17px;flex:none}
.check.done{border-color:var(--em);background:rgba(16,185,129,.05)}
.check.done span{text-decoration:line-through;color:var(--muted)}
.check b{font-size:14.5px}
.check small{display:block;color:var(--muted);font-size:13px}
.hero-trust-chips{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 4px}
.hero-trust-chips span{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;color:var(--g);background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);padding:7px 13px;border-radius:999px}
.score-note{font-size:12px;font-weight:700;color:var(--muted);margin-top:10px}
`;

export function pageShell({ title, description, canonical, body, extraCss = '', extraHead = '', active = '' }) {
  return `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://trimgids.nl${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta property="og:type" content="website"><meta property="og:site_name" content="TrimGids">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="https://trimgids.nl${canonical}"><meta property="og:locale" content="nl_NL">
<meta property="og:image" content="https://trimgids.nl/assets/img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
${chromeCssLink}
${extraHead}
<style>${BASE_CSS}${extraCss}</style></head>
<body>
${siteHeader()}
<main><div class="wrap">${body}</div></main>
${siteFooter()}
</body></html>`;
}

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
