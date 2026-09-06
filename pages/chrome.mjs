/* Universele site-shell (Ronde 10): exact dezelfde announce-bar, glass-navbar
   en footer als de homepage — op álle pagina's. Geen eigen header/footer meer
   in de afzonderlijke modules; dit is de enige bron. */

export const chromeCssLink = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/assets/css/site-chrome.css?v=15" id="tg-site-chrome">';

export function siteHeader() {
  return `<!-- TRIMGIDS UNIVERSELE HEADER (Ronde 10) -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.47" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></symbol>
  <symbol id="i-map" viewBox="0 0 24 24"><path d="M9 6L3 9v12l6-3 6 3 6-3V6l-6 3-6-3z"/><path d="M9 6v12"/><path d="M15 9v12"/></symbol>
  <symbol id="i-grad" viewBox="0 0 24 24"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></symbol>
  <symbol id="i-bed" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></symbol>
  <symbol id="i-tree" viewBox="0 0 24 24"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7Z"/><path d="M12 22v-3"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></symbol>
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></symbol>
  <symbol id="i-pulse" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></symbol>
  <symbol id="i-activity" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></symbol>
  <symbol id="i-euro" viewBox="0 0 24 24"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></symbol>
  <symbol id="i-plane" viewBox="0 0 24 24"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></symbol>
  <symbol id="i-news" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></symbol>
  <symbol id="i-faq" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>
</svg>
<a href="#main-content" class="skip-link">Direct naar inhoud</a>
<div id="scroll-progress" class="scroll-progress-bar" aria-hidden="true"></div>
<div class="top-announcement">
  <div class="wrap top-announce-in">
    <span class="pulse-badge">
      <span class="pulse-beacon"><span class="pulse-ping"></span><span class="pulse-dot"></span></span>
      <strong>Nieuw 2026</strong>
    </span>
    <span class="announce-text">Vergelijk aanbieders, zorg en hondvriendelijke plekken in heel Nederland</span>
    <a href="/verzekering" class="announce-link">Vergelijk premies <span aria-hidden="true">→</span></a>
  </div>
</div>

<!-- FLOATING GLASS NAVBAR -->
<nav class="site-navbar" id="tg-site-nav">
  <div class="wrap nav-in">
    <a href="/" class="brand-logo" aria-label="TrimGids Homepage">
      <div class="brand-badge-icon" aria-hidden="true"><img src="/logo.svg?v=3" alt="" loading="eager" fetchpriority="high"></div>
      <div class="brand-text">
        <span class="brand-title">TrimGids</span>
        <span class="brand-subtitle">Nederland · 2026</span>
      </div>
    </a>

    <div class="nav-links-pills" id="main-nav">
      <a href="/trimsalon" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-scissors"/></svg> Trimsalons</a>
      <a href="/kaart" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-map"/></svg> Kaart</a>
      <a href="/dogpedia" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-book"/></svg> Dogpedia</a>
      <a href="/hondenschool" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-grad"/></svg> Hondenscholen</a>
      <a href="/opvang" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-bed"/></svg> Opvang</a>
      <a href="/wellness" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-leaf"/></svg> Wellness</a>
      <a href="/wandelen" class="nav-pill"><svg class="ic" aria-hidden="true"><use href="#i-tree"/></svg> Wandelen</a>
      <a href="/verzekering" class="nav-pill highlight-gold"><svg class="ic" aria-hidden="true"><use href="#i-shield"/></svg> Verzekering</a>
      <a href="/last-minute" class="nav-pill highlight-amber"><svg class="ic" aria-hidden="true"><use href="#i-bolt"/></svg> Deals</a>
      <details class="nav-more"><summary class="nav-pill">Meer voor baasjes</summary><div class="nav-more-panel"><div><h3>Zorg & veiligheid</h3><a href="/ehbo-hond">EHBO-noodgids →</a><a href="/braken-hond">Mijn hond braakt →</a><a href="/hitteberoerte-hond">Hitteberoerte & hete auto →</a><a href="/giftigheid-calculator">Gif- & chocoladecheck →</a><a href="/spoed-dierenarts">Spoeddierenartsen →</a><a href="/chippen-ontwormen">Chip & ontwormen →</a><a href="/poepzakjes">Poepzakjes & boetes →</a></div><div><h3>Ontdek & plan</h3><a href="/puppy-kiezen">Puppymatcher →</a><a href="/leeftijd-calculator">Hondenleeftijd →</a><a href="/kosten-hond">Wat kost een hond? →</a><a href="/trimmen-kosten">Wat kost trimmen? (2026) →</a><a href="/nieuws">Landelijk hondennieuws →</a><a href="/reizen">Vliegen & reizen met je hond →</a><a href="/hond-en-werk">Hond & fulltime werken →</a></div><div><h3>Kennis & community</h3><a href="/forum">Hondenforum →</a><a href="/hulphonden">Blindegeleide- & politiehonden →</a><a href="/zintuigen">Zintuigenlab →</a><a href="/puppies">PuppyMarktplaats →</a><a href="/hondenanatomie">Hondenanatomie →</a><a href="/hondengedrag">Hondengedrag →</a><a href="/fokkers">Erkende fokkers →</a><a href="/aankoopgids">Aankoopgids per ras →</a><a href="/adoptie">Pup of asielhond? →</a><a href="/rassen">Rassen & variëteiten →</a><a href="/hondenweetjes">Hypoallergeen, leeftijd & slimheid →</a><a href="/hondenwedstrijden">Hondenwedstrijden & sport →</a><a href="/verboden-rassen">Verboden rassen: NL & wereld →</a><a href="/honden-cijfers">Honden in cijfers →</a><a href="/geschiedenis-hond">Geschiedenis van de hond →</a><a href="/koninklijke-honden">Honden van royals →</a><a href="/zwerfhonden">Zwerfhonden wereldwijd →</a></div><div><h3>Helpen & meedoen</h3><a href="/vacatures">Vacatures & hulpkrachten →</a><a href="/vrijwilligers">Vrijwilligerswerk bij asiel & opvang →</a><a href="/adoptie">Een opvanghond een thuis geven →</a><a href="/hond-gevonden">Hond gevonden? Wat nu? →</a><a href="/webshop">Webshop: voer, reis & tools →</a><a href="/steun">Steun TrimGids →</a></div></div></details>
    </div>

    <div class="nav-actions">
      <a href="/bedrijven" class="btn btn-outline btn-pill btn-sm">Voor bedrijven</a>
      <button id="account-btn" class="btn btn-outline btn-pill btn-sm" type="button" aria-label="Inloggen of registreren"><svg class="ic" aria-hidden="true"><use href="#i-user"/></svg> <span>Inloggen</span></button>
      <button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Wissel donker/licht thema">
        <span class="theme-icon"><svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg></span>
      </button>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Open navigatiemenu"><svg class="ic" aria-hidden="true"><use href="#i-menu"/></svg></button>
    </div>
  </div>
</nav>

<!-- STICKY QUICK HUB JUMP BAR (MAAKT DE SITE DIRECT OVERZICHTELIJK) -->
<nav class="sticky-hub-nav" aria-label="Snel navigeren over de pagina">
  <div class="wrap hub-nav-in">
    <a href="/#eerstehulp-cijfers" class="hub-pill active"><svg class="ic" aria-hidden="true"><use href="#i-pulse"/></svg> Eerste hulp & Cijfers</a>
    <a href="/#alerts-veiligheid" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-alert"/></svg> Nood & Alerts</a>
    <a href="/#kennis" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-book"/></svg> Kennis & Gidsen</a>
    <a href="/#zorg-verzekering" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-shield"/></svg> Zorg & Voeding</a>
    <a href="/#vacht-offerte" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-scissors"/></svg> Vacht & Offerte</a>
    <a href="/#financien-belasting" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-euro"/></svg> Belasting & Kosten</a>
    <a href="/#reizen-kennis" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-plane"/></svg> Reizen & Kennis</a>
    <a href="/#wandelen-hub" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-tree"/></svg> Wandelbossen</a>
    <a href="/#interactieve-kaart" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-map"/></svg> Kaart & Salons</a>
    <a href="/#forum" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-chat"/></svg> Community</a>
    <a href="/#helpen" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-heart"/></svg> Helpen & Adopteren</a>
    <a href="/#nieuws" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-news"/></svg> Nieuws</a>
    <a href="/#faq" class="hub-pill"><svg class="ic" aria-hidden="true"><use href="#i-faq"/></svg> FAQ</a>
  </div>
</nav>`;
}

export function siteFooter() {
  return `<!-- TRIMGIDS UNIVERSELE FOOTER (Ronde 10) -->
<div class="home-newsletter" id="tg-newsletter" data-tg-newsletter>
  <div class="home-newsletter-in">
    <div class="wrap" style="padding:0">
      <strong>Gratis deal- &amp; kennisbrief</strong>
      <p style="margin-top:4px">Eén keer per week: beste hondendeals, verzekeringstips en nieuwe wandelroutes. Altijd gratis, nooit spam.</p>
    </div>
    <form class="home-newsletter-form" data-tg-newsletter-form>
      <input type="email" name="email" maxlength="120" placeholder="jouw@email.nl" aria-label="E-mailadres voor de nieuwsbrief" required>
      <input type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" hidden>
      <button type="submit">Aanmelden →</button>
    </form>
    <p class="home-newsletter-ok" hidden>Bedankt! Je staat op de lijst — check je inbox.</p>
  </div>
</div>
<footer class="site-footer">
  <div class="wrap">
    <section class="footer-cta" aria-label="Aan de slag">
      <div>
        <span class="footer-cta-kicker">Klaar om te starten?</span>
        <h3>De beste hondenzorg, vlak bij jou</h3>
        <p>2.900+ geverifieerde aanbieders, actuele prijzen en onafhankelijke gidsen — alles in één overzicht.</p>
      </div>
      <div class="footer-cta-actions">
        <a href="/trimsalon" class="btn btn-primary">Vind een trimsalon</a>
        <a href="/verzekering" class="btn btn-outline">Vergelijk verzekering</a>
      </div>
    </section>
    <div class="footer-grid">
      <div class="footer-col">
        <a href="/" class="brand-logo" style="margin-bottom:12px">
          <div class="brand-badge-icon" aria-hidden="true"><img src="/logo.svg?v=3" alt="" loading="lazy" decoding="async"></div>
          <div class="brand-text">
            <span class="brand-title">TrimGids</span>
            <span class="brand-subtitle">Nederland · 2026</span>
          </div>
        </a>
        <p style="font-size:13.5px;color:var(--muted-foreground);line-height:1.6;margin-bottom:14px">
          De onafhankelijke gids voor verzorging, gezondheid, veiligheid en hondvriendelijke plekken in Nederland.
        </p>
        <div style="font-size:12px;color:var(--muted-foreground)">© 2026 TrimGids B.V. · Alle rechten voorbehouden.</div>
      </div>
      <div class="footer-col">
        <h4>Diensten</h4>
        <ul>
          <li><a href="/trimsalon">Trimsalons</a></li>
          <li><a href="/kaart">Interactieve Kaart</a></li>
          <li><a href="/hondenschool">Hondenscholen</a></li>
          <li><a href="/opvang">Opvang & Hotels</a></li>
          <li><a href="/wellness">Wellness & Fysio</a></li>
          <li><a href="/last-minute">Last-Minute Deals</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Vergelijkers</h4>
        <ul>
          <li><a href="/verzekering">Hondenverzekering 2026</a></li>
          <li><a href="/dna-test">DNA Gezondheidstesten</a></li>
          <li><a href="/voeding">Verse Hondenvoeding</a></li>
          <li><a href="/spoed-dierenarts">24/7 Spoeddierenartsen</a></li>
          <li><a href="/dierenarts-tarieven">Dierenarts Tarieven</a></li>
          <li><a href="/hondenbelasting">Hondenbelasting</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Tools & Zorg</h4>
        <ul>
          <li><a href="/giftigheid-calculator">Gif &amp; Chocolade Check</a></li>
          <li><a href="/hondenvoer-calculator">Voer & NFE Calculator</a></li>
          <li><a href="/honden-vaccinaties">Vaccinatie Wijzer</a></li>
          <li><a href="/leeftijd-calculator">Hondenleeftijd Calculator</a></li>
          <li><a href="/kosten-hond">Wat Kost een Hond?</a></li>
          <li><a href="/wandelen">Wandelroutes & Bossen</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kennis & Reizen</h4>
        <ul>
          <li><a href="/reizen">Vliegen & reizen met je hond</a></li>
          <li><a href="/rassen">Rassen & variëteiten</a></li>
          <li><a href="/verboden-rassen">Verboden & omstreden rassen</a></li>
          <li><a href="/poepzakjes">Poepzakjes & boetes</a></li>
          <li><a href="/hondenweetjes">Hypoallergeen, leeftijd & slimheid</a></li>
          <li><a href="/hondenwedstrijden">Hondenwedstrijden & sport</a></li>
          <li><a href="/chippen-ontwormen">Chip & ontwormen</a></li>
          <li><a href="/braken-hond">Mijn hond braakt</a></li>
          <li><a href="/hitteberoerte-hond">Hitte & hete auto</a></li>
          <li><a href="/honden-cijfers">Honden in cijfers</a></li>
          <li><a href="/hond-en-werk">Werk & uitlaatservice</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Wereld & Webshop</h4>
        <ul>
          <li><a href="/zwerfhonden">Zwerfhonden wereldwijd</a></li>
          <li><a href="/geschiedenis-hond">Geschiedenis van de hond</a></li>
          <li><a href="/koninklijke-honden">Honden van royals</a></li>
          <li><a href="/webshop">Webshop: voer & reis</a></li>
          <li><a href="/trimmen-kosten">Wat kost trimmen? (2026)</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Voor Bedrijven</h4>
        <ul>
          <li><a href="/bedrijven">Voor Bedrijven</a></li>
          <li><a href="/claim">Bedrijf Claimen</a></li>
          <li><a href="/offerte">Offertes Ontvangen</a></li>
          <li><a href="/nieuws">Nieuws & Alerts</a></li>
          <li><a href="/vermist">Vermiste Honden</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Gemaakt met passie voor honden in Nederland. In samenwerking met routes.apexclusive.nl</span>
      <div style="display:flex;gap:16px">
        <a href="/sitemap.xml">Sitemap</a>
        <a href="/robots.txt">Robots</a>
        <a href="/bedrijven">Partner Worden</a>
      </div>
    </div>
  </div>
</footer>`;
}
