#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genereert één rasdetailpagina per ras (rassen/<slug>/index.html) op basis
van de data in rassen.html. Honest content: alleen vachttype, FCI-groep,
verzorgingsfrequentie en prijsindicatie die al in de overzichtspagina staan,
plus algemene (ras-onafhankelijke) vachtverzorgingsuitleg per vachttype."""
import re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

t = open(os.path.join('rassen', 'index.html'), encoding='utf-8').read()

# --- online-bronbare feiten per ras (herkomst / schofthoogte / gewicht), indien beschikbaar ---
FEITEN = {}
feiten_path = os.path.join('tools', 'rasfeiten.json')
if os.path.exists(feiten_path):
    FEITEN = json.load(open(feiten_path, encoding='utf-8'))

# --- groeptitels uit de sectiekoppen ---
GROEP = {}
for m in re.finditer(r'<section class="groep" data-groep="([^"]+)"[^>]*>\s*<div class="groep-kop"><h2[^>]*>(.*?)</h2>', t):
    GROEP[m.group(1)] = re.sub(r'^Groep \d+ · ', '', m.group(2)).replace('&amp;', '&')

# FCI-groepnummer per sectie (1–10), 'k' = kruisingen/niet-erkend
GROEP_LABEL = {}
for g in GROEP:
    GROEP_LABEL[g] = ('FCI Groep ' + g + ' · ' + GROEP[g]) if g.isdigit() else ('Niet-FCI · ' + GROEP[g])

# --- rassen parsen (sectie = echte FCI-groep) ---
sections = re.split(r'<section class="groep" data-groep="([^"]+)"', t)
rassen = []
for i in range(1, len(sections), 2):
    g = sections[i]; body = sections[i+1]
    for m in re.finditer(
        r'<div class="raskaart(?: pom)?" data-naam="([^"]+)" data-slug="([^"]+)" data-groep="([^"]+)" data-zorg="([^"]+)">'
        r'(?P<rest>.*?)</div>', body, re.S):
        naam, slug, _, zorg = m.group(1), m.group(2), m.group(3), m.group(4)
        rest = m.group('rest')
        nm = re.search(r'<span class="nm"><a [^>]*>([^<]+)</a></span>', rest)
        if nm:
            naam = nm.group(1)  # display-naam, bijv. "Labradoodle"
        pop = 'Populair' in rest
        zorglabel = re.search(r'<span class="zorg ?[^"]*">([^<]+)</span>', rest).group(1)
        freq = re.search(r'<span class="meta">([^<]+)</span>', rest).group(1)
        prijzen = re.search(r'<span class="prijs">([^<]*)<small>([^<]*)</small>', rest)
        prijs = prijzen.group(1).strip() if prijzen else '€60–€90'
        rassen.append(dict(groep=g, naam=naam, slug=slug, zorg=zorg,
                           zorglabel=zorglabel, freq=freq, prijs=prijs, pop=pop))

assert len(rassen) == 377, f'verwacht 377, kreeg {len(rassen)}'
slugs = [r['slug'] for r in rassen]
assert len(set(slugs)) == 377, 'dubbele slugs!'

# --- vachtverzorgingsuitleg per type (ras-onafhankelijk, correct) ---
UITLEG = {
    'wassen': dict(
        kop='Kortharige vacht: wassen en ontwollen',
        p1=('Een kortharige vacht vraagt weinig knipwerk. De verzorging draait vooral om wassen '
            'en het verwijderen van losse (onder)vacht. Regelmatig borstelen met een rubberborstel '
            'of borstelhandschoen haalt losse haren eruit en houdt de vacht glanzend.'),
        p2=('Een trimbeurt is voor dit vachttype meestal een was- en droogbeurt, eventueel aangevuld '
            'met ontwollen tijdens de rui (twee keer per jaar).'),
        tips=['Rubberborstel of borstelhandschoen voor losse haren',
              'Laat in de rui de ondervacht uitblazen/ontwollen',
              'Controleer oren, voeten en huid regelmatig']),
    'uitkammen': dict(
        kop='Dubbele vacht: uitkammen, nooit scheren',
        p1=('Een dubbele vacht bestaat uit een zachte ondervacht en een hardere dekvacht. Die mag je '
            'niet scheren: scheren kan de vacht blijvend beschadigen (scheer-alopecie) en haalt de '
            'natuurlijke bescherming tegen warmte en kou weg.'),
        p2=('De verzorging bestaat uit wekelijks borstelen en het uitkammen van losse ondervacht, '
            'vooral tijdens de rui. Zo blijft de vacht luchtig en klitvrij.'),
        tips=['Slickerborstel gevolgd door een metalen kam',
              'Ondervachthark tijdens de rui (uitkammen, niet scheren)',
              'Controleer oren, kraag, oksels en broek op klitten']),
    'plukken': dict(
        kop='Ruwharige vacht: plukken (strippen)',
        p1=('Een ruwharige vacht wordt met de hand geplukt of gestript in plaats van geschoren. '
            'Plukken verwijdert dode dekharen tot bij de wortel, waardoor de stugge structuur en de '
            'kleur behouden blijven.'),
        p2=('Scheren maakt de vacht na verloop van tijd zacht en dof. Daarom kiest een goede trimmer '
            'bij dit vachttype voor plukken of strippen, niet voor de tondeuse.'),
        tips=['Plukken/strippen met de hand of een stripmes',
              'Niet scheren: dat verpest de vachtstructuur',
              'Vraag een trimmer met ruwhaar-ervaring']),
    'scheren': dict(
        kop='Krulvacht: scheren of knippen',
        p1=('Een krulvacht groeit door en moet regelmatig geknipt of geschoren worden om klitten te '
            'voorkomen. Hoe korter het model, hoe minder borstelwerk — maar borstelen tussen de '
            'trims door blijft nodig.'),
        p2=('De vacht wordt vóór het wassen eerst goed doorgekamd; klitten worden losgemaakt of weg '
            'geschoren zodat wassen en drogen netjes gaan.'),
        tips=['Kam of slicker vóór het wassen',
              'Reken op een trimbeurt elke 6–8 weken',
              'Laat oren en poten meenemen in het model']),
    'borstelen': dict(
        kop='Langhaar: borstelen tegen klitten',
        p1=('Een langharige vacht klit snel en vraagt frequente borstelbeurten. Dagelijks tot '
            'wekelijks borstelen met een slicker en een kam voorkomt klitten en houdt de vacht '
            'gezond.'),
        p2=('Beste volgorde: borstel tot op de huid, kam daarna na, en spoel na een wasbeurt alle '
            'shampoo goed uit om huidirritatie te voorkomen.'),
        tips=['Borstel tot op de huid, niet alleen de bovenlaag',
              'Kam met wijde tanden om restklitten te vinden',
              'Spoel shampoo en conditioner volledig uit']),
    'knippen': dict(
        kop='Zijdevacht: knippen',
        p1=('Een zachte, zijdeachtige vacht groeit door en wordt geknipt in een model dat bij het ras '
            'past. Tussen de knipbeurten blijft regelmatig borstelen nodig om klitten te voorkomen.'),
        p2=('De vacht rond ogen, oren en poten wordt kort gehouden; de rest wordt gekamd, gewassen en '
            'in model geknipt.'),
        tips=['Borstel of kam regelmatig om klitten te voorkomen',
              'Knipbeurt elke 6–8 weken',
              'Houd de vacht rond ogen en oren kort']),
    'nvt': dict(
        kop='Geen standaard trim',
        p1=('Dit ras heeft een vachttype dat geen standaard trim vraagt: een gevlochten/gekoorde '
            'vacht of een (vrijwel) vachtloze huid. De verzorging is daardoor echt maatwerk.'),
        p2=('Laat je adviseren door een trimmer met ervaring met dit specifieke vachttype. Bij '
            'vachtloze rassen draait het vooral om huidverzorging: wassen met een milde shampoo en '
            'bescherming tegen zon en kou.'),
        tips=['Laat je adviseren door een specialist in dit vachttype',
              'Gebruik een milde hondenshampoo',
              'Bescherm de huid tegen zon en kou']),
}

# --- korte, eerlijke intro voor de populairste rassen (algemene kennis, geen verzonnen cijfers) ---
POPULAR = {
    'border-collie': 'Een van de slimste en meest energieke herdershonden. De middellange dubbele vacht verhaart flink en vraagt wekelijks borstelen.',
    'duitse-herdershond': 'Een veelzijdige, intelligente werkhond met een dikke dubbele vacht die twee keer per jaar flink verhaart.',
    'rottweiler': 'Een zelfverzekerde, krachtige hond met een korte, glanzende vacht die weinig trimwerk vraagt.',
    'golden-retriever': 'Een vriendelijke, actieve gezinshond met een middellange dubbele vacht die vooral in de rui veel haar loslaat.',
    'labrador-retriever': 'Een energieke, mensgerichte hond met een korte, waterafstotende dubbele vacht die het hele jaar door verhaart.',
    'franse-buldog': 'Een kleine, aanhankelijke gezelschapshond met een gladde vacht die weinig onderhoud vraagt.',
    'maltezer': 'Een kleine, vrolijke gezelschapshond met een lange, zijdeachtige witte vacht die dagelijks gekamd wil worden.',
    'poedel-toy': 'Een kleine, slimme gezelschapshond met een krullende vacht die niet verhaart maar doorgroeit en dus regelmatig getrimd wordt.',
    'poedel-dwerg': 'Een kleine, alerte allrounder met een krullende vacht die niet verhaart maar doorgroeit; een trimbeurt hoort er standaard bij.',
    'poedel-middenslag': 'Een vrolijke, leergierige allrounder met een krullende, niet-verharende vacht die regelmatig getrimd wordt.',
    'poedel-groot': 'Een sportieve, intelligente hond met een krullende vacht die niet verhaart maar doorgroeit; een trimbeurt hoort er standaard bij.',
    'shih-tzu': 'Een vriendelijk, klein gezelschapshondje met een lange, dikke vacht die dagelijks geborsteld wil worden om klitten te voorkomen.',
    'cockapoo': 'Een kruising van Cocker Spaniël en Poedel met een zachte, krullende vacht die weinig verhaart en regelmatig getrimd wordt.',
    'goldendoodle': 'Combineert het karakter van de Golden retriever met de niet-verharende vacht van de Poedel; de vacht vraagt wel regelmatig trimmen.',
    'labradoodle': 'Combineert het karakter van de Labrador met de gekrulde vacht van de Poedel. De vacht verhaart minder, maar wil elke 6–8 weken getrimd worden.',
}

# --- header/nav (Rassen actief) ---
NAV = '''<a href="#inhoud" class="skip">Direct naar inhoud</a>

<nav aria-label="Hoofdnavigatie">
  <div class="wrap nav-in">
    <a href="/" class="logo" aria-label="Pupgids, naar de homepage">
      <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6.2" cy="8" rx="2" ry="2.4"/><ellipse cx="10" cy="6.3" rx="2" ry="2.4"/><ellipse cx="14" cy="6.3" rx="2" ry="2.4"/><ellipse cx="17.8" cy="8" rx="2" ry="2.4"/><path d="M12 12.6c-2.9 0-4.9 2.1-4.9 4.4 0 2.5 2.2 4.4 4.9 4.4s4.9-1.9 4.9-4.4c0-2.3-2-4.4-4.9-4.4z"/></svg></span>
      Pupgids
    </a>
    <div class="nav-links" id="menu">
      <a href="/trimsalon/">Trimsalons</a>
      <a href="/binnenkort/?cat=hondenschool">Hondenscholen</a>
      <a href="/binnenkort/?cat=opvang">Opvang</a>
      <a href="/rassen/" class="actief">Rassen</a>
      <a href="/premium/">Voor bedrijven</a>
    </div>
    <div class="nav-cta">
      <a href="/premium/" class="btn btn-s" style="padding:10px 18px;font-size:14px">Voor bedrijven</a>
      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="menu" aria-label="Menu openen of sluiten">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
    </div>
  </div>
</nav>
'''

FOOTER = '''<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a href="/" class="logo" style="margin-bottom:14px">
          <span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6.2" cy="8" rx="2" ry="2.4"/><ellipse cx="10" cy="6.3" rx="2" ry="2.4"/><ellipse cx="14" cy="6.3" rx="2" ry="2.4"/><ellipse cx="17.8" cy="8" rx="2" ry="2.4"/><path d="M12 12.6c-2.9 0-4.9 2.1-4.9 4.4 0 2.5 2.2 4.4 4.9 4.4s4.9-1.9 4.9-4.4c0-2.3-2-4.4-4.9-4.4z"/></svg></span>
          Pupgids
        </a>
        <p>De onafhankelijke gids voor trimsalons, hondenscholen en opvang. Gefilterd op ras, per plaats, met echte reviews.</p>
      </div>
      <div><h4>Zoeken</h4><a href="/trimsalon/">Trimsalons</a><a href="/binnenkort/?cat=hondenschool">Hondenscholen</a><a href="/binnenkort/?cat=opvang">Pension &amp; dagopvang</a><a href="/rassen/">Rassen</a><a href="/vachtwijzer/">Vachtwijzer</a><a href="/binnenkort/?cat=pup">Nieuwe pup</a></div>
      <div><h4>Bedrijven</h4><a href="/premium/">Premium vermelding</a><a href="/premium/#aanmelden">Vermelding claimen</a><a href="/binnenkort/?cat=dashboard">Inloggen</a></div>
      <div><h4>Pupgids</h4><a href="/over/">Over ons</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/voorwaarden/">Voorwaarden</a></div>
    </div>
    <div class="copy">
      <span>© <span class="jaar">2025</span> Pupgids.nl · Ook bereikbaar via trimgids.nl</span>
      <span>Gemaakt in Limburg · <a href="/privacy/">Privacy</a> · <a href="/voorwaarden/">Voorwaarden</a></span>
    </div>
  </div>
</footer>
'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@@NAAM@@ · vacht, verzorging &amp; trimsalon | Pupgids</title>
<meta name="description" content="Alles over de vacht en verzorging van de @@NAAM@@: @@ZORG@@ (@@FREQ@@), wat een trim kost (@@PRIJS@@ indicatie) en waar je een trimmer vindt.">
<meta name="theme-color" content="#2F6B4F">
<meta name="author" content="Pupgids">
<link rel="canonical" href="https://pupgids.nl/rassen/@@SLUG@@/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Pupgids">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="@@NAAM@@ · vacht, verzorging &amp; trimsalon">
<meta property="og:description" content="Vachttype @@ZORG@@, verzorging @@FREQ@@ en een trimbeurt vanaf ±@@PRIJS@@ (indicatie).">
<meta property="og:url" content="https://pupgids.nl/rassen/@@SLUG@@/">
<meta property="og:image" content="https://pupgids.nl/images/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="@@NAAM@@ · vacht, verzorging &amp; trimsalon">
<meta name="twitter:description" content="Vachttype @@ZORG@@, verzorging @@FREQ@@ en een trimbeurt vanaf ±@@PRIJS@@ (indicatie).">
<meta name="twitter:image" content="https://pupgids.nl/images/og-image.jpg">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%232F6B4F'/%3E%3Cg fill='%23fff'%3E%3Cellipse cx='20' cy='22' rx='6' ry='7'/%3E%3Cellipse cx='32' cy='17' rx='6' ry='7'/%3E%3Cellipse cx='44' cy='22' rx='6' ry='7'/%3E%3Cpath d='M32 34c-7.5 0-12.5 5.5-12.5 11.5C19.5 52 25 57 32 57s12.5-5 12.5-11.5C44.5 39.5 39.5 34 32 34z'/%3E%3C/g%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://pupgids.nl/"},
    {"@type": "ListItem", "position": 2, "name": "Hondenrassen", "item": "https://pupgids.nl/rassen/"},
    {"@type": "ListItem", "position": 3, "name": "@@NAAM@@"}
  ]
}
</script>
</head>
<body>
@@NAV@@
<main id="inhoud">

<header class="hero ras-hero">
  <div class="wrap">
    <nav class="kruimel" aria-label="Broodkruimel">
      <a href="/">Home</a><span aria-hidden="true">›</span><a href="/rassen/">Rassen</a><span aria-hidden="true">›</span><span>@@NAAM@@</span>
    </nav>
    <span class="eyebrow">@@GROEP@@</span>
    <h1 style="font-size:clamp(34px,4.6vw,52px);margin:12px 0 16px">@@NAAM@@@@POP@@</h1>
    <p class="lead">Vachttype <strong>@@ZORG@@</strong>, verzorging <strong>@@FREQ@@</strong>. Een trimbeurt kost gemiddeld <strong>@@PRIJS@@</strong> (indicatie). Hieronder lees je hoe je de vacht het beste verzorgt en waar je een trimmer voor dit ras vindt.</p>
    @@INTRO@@
  </div>
</header>

<div class="sec">
  <div class="wrap">
    <div class="feitengrid" aria-label="Kerngegevens">
      <div class="feit"><b>Vachttype</b><span>@@ZORG@@</span></div>
      <div class="feit"><b>Verzorging</b><span>@@FREQ@@</span></div>
      <div class="feit"><b>Trimprijs</b><span>@@PRIJS@@ <small>indicatie</small></span></div>
      <div class="feit"><b>Rasgroep</b><span>@@GROEPVOLLEDIG@@</span></div>
      @@FEITEN@@
    </div>
    @@FEITEN_BRON@@

    <section class="paneel" style="margin-top:24px">
      <h2>@@KOP@@</h2>
      <p>@@P1@@</p>
      <p>@@P2@@</p>
      <h3>Verzorgingstips</h3>
      <ul class="tips">
        <li>@@TIP1@@</li>
        <li>@@TIP2@@</li>
        <li>@@TIP3@@</li>
      </ul>
    </section>

    <section class="paneel" style="margin-top:16px">
      <h2>Wat kost een trimbeurt voor de @@NAAM@@?</h2>
      <p>Reken op gemiddeld <strong>@@PRIJS@@</strong> per volledige trimbeurt. Dat is een richtprijs op basis van openbare tarieflijsten van trimsalons; de werkelijke prijs hangt af van de salon, de plaats, de vachtconditie en het gedrag van je hond.</p>
      <p style="color:var(--ink-2);font-size:15px">Lees <a href="/over/" style="font-weight:600">hoe onze prijsdata tot stand komt</a> en waarom we indicaties geven in plaats van vaste prijzen.</p>
      <div class="cta-band" style="margin-top:20px">
        <a class="btn btn-p" href="/trimsalon/?ras=@@SLUG@@">Zoek een trimmer voor de @@NAAM@@ →</a>
        <a class="btn btn-s" href="/vachtwijzer/">Doe de Vachtwijzer</a>
      </div>
    </section>

    <section class="sec" style="padding-top:8px">
      <h2 style="font-size:22px">Meer rassen in deze groep</h2>
      <div class="rassengrid" style="margin-top:16px">
@@RELATED@@
      </div>
    </section>
  </div>
</div>

</main>
@@FOOTER@@
<script src="/assets/main.js" defer></script>
</body>
</html>
'''

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

# per-groep lijst voor "meer rassen"
per_groep = {}
for r in rassen:
    per_groep.setdefault(r['groep'], []).append(r)

outdir = os.path.join('rassen')
os.makedirs(outdir, exist_ok=True)
geschreven = 0
for r in rassen:
    u = UITLEG[r['zorg']]
    if r['slug'] == 'pomeriaan':
        # redirect naar de rijke gids
        html = ('<!DOCTYPE html>\n<html lang="nl">\n<head>\n<meta charset="UTF-8">\n'
                '<meta name="robots" content="noindex,follow">\n'
                '<meta http-equiv="refresh" content="0; url=/pomeriaan/">\n'
                '<link rel="canonical" href="https://pupgids.nl/pomeriaan/">\n'
                '<title>Pomeriaan | Pupgids</title>\n'
                '<script>location.replace("/pomeriaan/");</script>\n'
                '</head>\n<body style="font-family:sans-serif;padding:40px">\n'
                '<p>Naar de <a href="/pomeriaan/">Pomeriaan-gids</a>…</p>\n</body>\n</html>\n')
        os.makedirs(os.path.join(outdir, 'pomeriaan'), exist_ok=True)
        open(os.path.join(outdir, 'pomeriaan', 'index.html'), 'w', encoding='utf-8').write(html)
        geschreven += 1
        continue

    # gerelateerde rassen (max 5) uit dezelfde groep, excl. zichzelf, cyclic
    groep_lijst = per_groep[r['groep']]
    idx = next(i for i, x in enumerate(groep_lijst) if x['slug'] == r['slug'])
    if len(groep_lijst) > 1:
        broers = [groep_lijst[(idx + 1 + k) % len(groep_lijst)] for k in range(1, min(6, len(groep_lijst)))]
    else:
        broers = []
    related_html = ''
    for b in broers:
        href = '/rassen/%s/' % b['slug']
        pop = ' <span class="pop">Populair</span>' if b['pop'] else ''
        related_html += ('<div class="raskaart"><span class="nm"><a href="%s">%s</a></span>%s'
                         '<span class="zorg ">%s</span><span class="meta">%s</span>'
                         '<span class="prijs">%s <small>indicatie</small></span>'
                         '<a class="zoeklink" href="/trimsalon/?ras=%s">Zoek trimmer →</a></div>\n'
                         % (href, esc(b['naam']), pop, esc(b['zorglabel']), esc(b['freq']),
                            esc(b['prijs']), b['slug']))

    pop_html = ' <span class="pop" style="vertical-align:middle">Populair</span>' if r['pop'] else ''

    feiten = FEITEN.get(r['slug'])
    feiten_html, feiten_bron = '', ''
    if feiten:
        if feiten.get('herkomst'):
            feiten_html += '<div class="feit"><b>Herkomst</b><span>%s</span></div>' % esc(feiten['herkomst'])
        if feiten.get('hoogte'):
            feiten_html += '<div class="feit"><b>Schofthoogte</b><span>%s</span></div>' % esc(feiten['hoogte'])
        if feiten.get('gewicht'):
            feiten_html += '<div class="feit"><b>Gewicht</b><span>%s</span></div>' % esc(feiten['gewicht'])
        if feiten.get('leeftijd'):
            feiten_html += '<div class="feit"><b>Levensverwachting</b><span>%s</span></div>' % esc(feiten['leeftijd'])
        if feiten_html:
            feiten_bron = '<p style="font-size:12.5px;color:var(--ink-3);margin-top:10px">Bron: FCI-standaard · Wikipedia (Engelstalig).</p>'

    html = (TEMPLATE
            .replace('@@NAAM@@', esc(r['naam']))
            .replace('@@SLUG@@', r['slug'])
            .replace('@@GROEP@@', esc(GROEP[r['groep']]))
            .replace('@@GROEPVOLLEDIG@@', esc(GROEP_LABEL[r['groep']]))
            .replace('@@INTRO@@', ('<p class="ras-intro">' + POPULAR.get(r['slug'], '') + '</p>') if r['slug'] in POPULAR else '')
            .replace('@@FEITEN@@', feiten_html)
            .replace('@@FEITEN_BRON@@', feiten_bron)
            .replace('@@ZORG@@', esc(r['zorglabel']))
            .replace('@@FREQ@@', esc(r['freq']))
            .replace('@@PRIJS@@', esc(r['prijs']))
            .replace('@@POP@@', pop_html)
            .replace('@@KOP@@', esc(u['kop']))
            .replace('@@P1@@', esc(u['p1']))
            .replace('@@P2@@', esc(u['p2']))
            .replace('@@TIP1@@', esc(u['tips'][0]))
            .replace('@@TIP2@@', esc(u['tips'][1]))
            .replace('@@TIP3@@', esc(u['tips'][2]))
            .replace('@@RELATED@@', related_html)
            .replace('@@NAV@@', NAV)
            .replace('@@FOOTER@@', FOOTER))

    os.makedirs(os.path.join(outdir, r['slug']), exist_ok=True)
    open(os.path.join(outdir, r['slug'], 'index.html'), 'w', encoding='utf-8').write(html)
    geschreven += 1

print(f'Geschreven: {geschreven} raspagina\'s (376 detail + 1 redirect) in rassen/')
