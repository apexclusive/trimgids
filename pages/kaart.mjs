<!doctype html>
<html lang="nl" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kaart — Trimsalons, Scholen & Wandelroutes | TrimGids</title>
<meta name="description" content="Interactieve kaart van Nederland met geverifieerde trimsalons, hondenscholen, opvang en losloopgebieden. Zoek, filter en navigeer direct.">
<link rel="canonical" href="https://trimgids.nl/kaart">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site-chrome.css?v=20" id="tg-site-chrome">
<link rel="stylesheet" href="/assets/css/nl-map.css?v=16">
<style>
:root { --primary:#0f3e28; --primary-hover:#092819; --primary-light:#eaf4ee; --muted:#64748b; --background:#f8fafc; --card:#fff; --border:#e2e8f0; --radius-xl:24px; --max-width:1220px; }
[data-theme="dark"] { --background:#090d0b; --card:#111814; --border:rgba(255,255,255,.1); --muted:#a3b3ab; --primary:#10b981; --primary-light:rgba(16,185,129,.12); }
html, body { margin:0; padding:0; background:var(--background); color:var(--primary); font-family:'Plus Jakarta Sans',system-ui,sans-serif; overflow:hidden; height:100vh; }
.map-fullscreen { display:flex; flex-direction:column; height:100vh; }
.map-top-bar { padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; background:rgba(255,255,255,.88); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); z-index:10; }
[data-theme="dark"] .map-top-bar { background:rgba(9,13,11,.88); }
.map-top-bar h1 { font-family:'Sora',sans-serif; font-size:22px; letter-spacing:-.03em; margin:0; line-height:1.15; }
.map-top-bar h1 span { color:var(--muted); font-weight:600; font-size:15px; display:block; margin-top:2px; }
.map-top-bar .map-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.map-top-bar a { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:999px; font-size:13px; font-weight:700; text-decoration:none; border:1px solid var(--border); background:var(--card); color:var(--primary); transition:all .2s ease; }
.map-top-bar a:hover { border-color:var(--primary); transform:translateY(-1px); }
.map-top-bar a.btn-primary { background:linear-gradient(135deg,#0f3e28,#0b7a4f); color:#fff; border-color:transparent; box-shadow:0 8px 18px -6px rgba(15,62,40,.35); }
.map-top-bar a.btn-primary:hover { box-shadow:0 10px 22px -6px rgba(15,62,40,.45); }
.map-body { flex:1; position:relative; overflow:hidden; }
#map-canvas { width:100%; height:100%; display:block; }
.map-legend { position:absolute; bottom:20px; left:20px; z-index:5; background:rgba(255,255,255,.92); backdrop-filter:blur(14px); border:1px solid var(--border); border-radius:20px; padding:14px 18px; box-shadow:0 20px 40px -15px rgba(15,23,42,.2); max-width:260px; }
[data-theme="dark"] .map-legend { background:rgba(9,13,11,.92); }
.map-legend h3 { margin:0 0 10px; font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--primary); }
.map-legend ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.map-legend li { font-size:12.5px; font-weight:600; color:var(--primary); display:flex; align-items:center; gap:8px; }
.map-legend .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
@media (max-width:700px) { .map-top-bar { padding:10px 14px; } .map-top-bar h1 { font-size:18px; } .map-top-bar h1 span { font-size:13px; } .map-legend { max-width:200px; padding:10px 14px; bottom:14px; left:14px; } .map-legend h3 { font-size:11px; margin-bottom:6px; } .map-legend li { font-size:11px; gap:6px; } }
</style>
</head>
<body>
<section class="map-fullscreen" aria-label="Interactieve kaart">
  <header class="map-top-bar">
    <div>
      <h1>Kaart <span>Trimsalons, scholen, opvang & wandelroutes in heel Nederland</span></h1>
    </div>
    <div class="map-actions">
      <a href="/" aria-label="Terug naar homepage">← Home</a>
      <a href="/trimsalon" aria-label="Trimsalons">✂️ Trimsalons</a>
      <a href="/wandelen" aria-label="Wandelroutes">🌲 Wandelen</a>
      <a href="#" class="btn-primary" onclick="document.getElementById('map-canvas').scrollIntoView({behavior:'smooth'});return false;" aria-label="Kaart centreren">Kaart centreren</a>
    </div>
  </header>
  <div class="map-body">
    <div id="map-canvas" data-nl-map data-show-list="true" aria-label="Interactieve kaart van Nederland"></div>
    <aside class="map-legend" aria-label="Kaart legenda">
      <h3>Legenda</h3>
      <ul>
        <li><span class="dot" style="background:#1E523A" aria-hidden="true"></span> Trimsalon</li>
        <li><span class="dot" style="background:#3730A3" aria-hidden="true"></span> Hondenschool</li>
        <li><span class="dot" style="background:#D97706" aria-hidden="true"></span> Opvang</li>
        <li><span class="dot" style="background:#0D9488" aria-hidden="true"></span> Wellness</li>
        <li><span class="dot" style="background:#059669" aria-hidden="true"></span> Wandelroute</li>
      </ul>
    </aside>
  </div>
</section>
<script src="/assets/js/nl-map.js"></script>
</body>
</html>
