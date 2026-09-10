/* Juridische pagina's: privacyverklaring, cookieverklaring en algemene voorwaarden.

   TrimGids verwerkt persoonsgegevens (naam, telefoonnummer, e-mailadres, woonplaats,
   ras) via offerteformulieren, claims, reviews, het forum, vermiste-hondenmeldingen en
   de nieuwsbrief. Onder de AVG is een publieke privacyverklaring daarbij verplicht;
   die ontbrak tot nu toe volledig (/privacy, /cookies en /voorwaarden gaven alle 404).

   ⚠️ DEZE TEKSTEN ZIJN EEN TECHNISCH CORRECT UITGANGSPUNT, GEEN JURIDISCH ADVIES.
   Laat ze vóór publicatie controleren door een jurist of privacy-officer, en vul de
   gemarkeerde velden (contactpersoon, bewaartermijnen, verwerkers) in met de echte
   situatie van jullie organisatie. */

import { pageShell } from './base.mjs';

const LAST_UPDATED = '9 september 2026';

const notice = `<div class="card" style="border-left:4px solid var(--amber);margin-bottom:24px">
<p style="color:var(--muted-foreground);font-size:14px;margin:0"><strong style="color:var(--foreground)">Let op voor de redactie:</strong> deze verklaring is opgesteld op basis van wat de site technisch daadwerkelijk doet (formulieren, opslag, cookies). Laat de tekst vóór publicatie nalopen door een jurist of privacy-officer en vul de <em>[vierkante haken]</em> in.</p>
</div>`;

export function privacyPage() {
  return pageShell({
    title: 'Privacyverklaring TrimGids — zo gaan wij om met jouw gegevens',
    description: 'De privacyverklaring van TrimGids: welke persoonsgegevens we verwerken, waarom, hoe lang we ze bewaren en welke rechten je hebt onder de AVG.',
    canonical: '/privacy',
    active: 'privacy',
    body: `
${notice}
<p class="crumb"><a href="/">TrimGids</a> / Privacyverklaring</p>
<span class="eyebrow">AVG / GDPR</span>
<h1>Privacyverklaring</h1>
<p class="intro">TrimGids is de onafhankelijke gids voor hondenbaasjes in Nederland. Wij vinden dat je moet kunnen zien welke gegevens we van je vragen en wat daarmee gebeurt. Deze verklaring legt dat uit, in gewone taal.</p>
<p style="color:var(--muted-foreground);font-size:13px">Laatst bijgewerkt: ${LAST_UPDATED}</p>

<section class="sec">
<h2>1. Wie is verantwoordelijk voor je gegevens</h2>
<div class="card">
<p><strong>[Volledige juridische naam van de organisatie]</strong><br>
[Adres, postcode, plaats]<br>
E-mail: <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a><br>
KvK-nummer: [nummer] · Btw-nummer: [nummer]</p>
<p style="margin-top:10px">Voor vragen over privacy kun je mailen naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a>. We reageren binnen vier weken, zoals de AVG voorschrijft.</p>
</div>
</section>

<section class="sec">
<h2>2. Welke gegevens verwerken we, en waarom</h2>
<div class="grid g3">
<div class="card"><h3>Offerte-aanvraag</h3><p>Naam, telefoonnummer, e-mailadres, woonplaats, ras en gewenste dienst.</p><p style="margin-top:8px"><strong>Waarom:</strong> om je aanvraag door te geven aan trimsalons in jouw regio, zodat zij contact kunnen opnemen.</p><p style="margin-top:8px"><strong>Grondslag:</strong> uitvoering van een verzoek dat jij zelf doet (art. 6.1.b AVG).</p></div>
<div class="card"><h3>Bedrijfsprofiel claimen</h3><p>Bedrijfsnaam, plaats, contactpersoon, e-mailadres, telefoonnummer en eventueel website.</p><p style="margin-top:8px"><strong>Waarom:</strong> om te controleren dat jij bij het bedrijf hoort en je profiel te activeren.</p><p style="margin-top:8px"><strong>Grondslag:</strong> gerechtvaardigd belang (art. 6.1.f AVG) — het kloppend houden van de catalogus.</p></div>
<div class="card"><h3>Reviews &amp; forum</h3><p>De naam die je zelf invult en de tekst van je bericht of review.</p><p style="margin-top:8px"><strong>Waarom:</strong> om ervaringen te delen met andere baasjes. Berichten worden gemodereerd vóór publicatie.</p><p style="margin-top:8px"><strong>Tip:</strong> gebruik een voornaam of bijnaam. Vermeld geen adressen, telefoonnummers of gezondheidsgegevens van je hond of jezelf.</p></div>
<div class="card"><h3>Vermiste hond melden</h3><p>Wat je invult in het meldformulier, inclusief eventueel een foto en contactgegeven.</p><p style="margin-top:8px"><strong>Waarom:</strong> om de melding zo snel en breed mogelijk te verspreiden.</p><p style="margin-top:8px"><strong>Grondslag:</strong> jouw toestemming (art. 6.1.a AVG). Je kunt de melding altijd laten verwijderen.</p></div>
<div class="card"><h3>Nieuwsbrief</h3><p>Alleen je e-mailadres.</p><p style="margin-top:8px"><strong>Waarom:</strong> om je de brief te sturen.</p><p style="margin-top:8px"><strong>Grondslag:</strong> toestemming (art. 6.1.a AVG). Elke brief bevat een uitschrijflink; daarna verwijderen we je adres.</p></div>
<div class="card"><h3>Technische gegevens</h3><p>IP-adres bij een verzoek, browserinformatie en anonieme laadtijden van pagina's.</p><p style="margin-top:8px"><strong>Waarom:</strong> om de site te beveiligen tegen misbruik en om te zien welke pagina's traag laden.</p><p style="margin-top:8px"><strong>Grondslag:</strong> gerechtvaardigd belang (art. 6.1.f AVG). Deze metingen zijn niet tot jou herleidbaar en we verkopen ze niet door.</p></div>
</div>
</section>

<section class="sec">
<h2>3. Wat we níét doen</h2>
<div class="card">
<ul>
<li>We verkopen je gegevens nooit aan derden.</li>
<li>We plaatsen geen advertentie- of trackingcookies van derde partijen.</li>
<li>We bouwen geen profiel van je op voor advertenties.</li>
<li>We vragen geen bijzondere persoonsgegevens (zoals gezondheid of geloof).</li>
</ul>
</div>
</section>

<section class="sec">
<h2>4. Hoe lang bewaren we je gegevens</h2>
<div class="table" style="overflow-x:auto"><table class="table">
<thead><tr><th scope="col">Gegevens</th><th scope="col">Bewaartermijn</th></tr></thead>
<tbody>
<tr><td>Offerte-aanvragen</td><td>[bijv. 12 maanden] na de aanvraag</td></tr>
<tr><td>Claimaanvragen</td><td>[bijv. 24 maanden] na afhandeling</td></tr>
<tr><td>Reviews en forumberichten</td><td>Zolang de site bestaat, tenzij je om verwijdering vraagt</td></tr>
<tr><td>Meldingen vermiste honden</td><td>[bijv. 90 dagen] na plaatsing of nadat de hond terecht is</td></tr>
<tr><td>Nieuwsbriefadressen</td><td>Tot je je uitschrijft</td></tr>
<tr><td>Technische logs</td><td>[bijv. 14 dagen]</td></tr>
</tbody></table></div>
</section>

<section class="sec">
<h2>5. Met wie delen we gegevens</h2>
<div class="card">
<p>We delen alleen wat nodig is:</p>
<ul>
<li><strong>Trimsalons en aanbieders</strong> — alleen de gegevens uit jouw offerte-aanvraag, zodat zij kunnen reageren.</li>
<li><strong>Hostingpartij [naam]</strong> — bewaart de technische gegevens van de site. Met hen is een verwerkersovereenkomst gesloten.</li>
<li><strong>[Eventuele andere verwerkers: e-maildienst, analytics]</strong></li>
</ul>
<p style="margin-top:10px">We geven niets door buiten de Europese Economische Ruimte, tenzij hierboven staat vermeld en met passende waarborgen.</p>
</div>
</section>

<section class="sec">
<h2>6. Je rechten</h2>
<div class="grid g3">
<div class="card"><h3>Inzien</h3><p>Je mag opvragen welke gegevens we van je hebben.</p></div>
<div class="card"><h3>Wijzigen</h3><p>Klopt er iets niet? Dan passen we het aan.</p></div>
<div class="card"><h3>Verwijderen</h3><p>Je mag vragen je gegevens te wissen ("recht om vergeten te worden").</p></div>
<div class="card"><h3>Intrekken</h3><p>Toestemming (nieuwsbrief, vermiste hond) trek je op elk moment in.</p></div>
<div class="card"><h3>Bezwaar maken</h3><p>Tegen verwerking op basis van gerechtvaardigd belang kun je bezwaar maken.</p></div>
<div class="card"><h3>Overdragen</h3><p>Je mag je gegevens in een gangbaar formaat ontvangen.</p></div>
</div>
<p style="margin-top:16px;color:var(--muted-foreground);font-size:14px">Stuur je verzoek naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a>. We reageren binnen vier weken. Ben je het niet eens met hoe wij je verzoek afhandelen, dan kun je klagen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p>
</section>

<section class="sec">
<h2>7. Hoe beveiligen we je gegevens</h2>
<div class="card"><ul>
<li>Alle verbindingen lopen via HTTPS met HSTS.</li>
<li>Formulieren zijn beschermd tegen geautomatiseerd misbruik (snelheidslimieten en honeypot-velden).</li>
<li>Schrijfacties controleren de herkomst van het verzoek (origin-check).</li>
<li>Beheerders werken met een apart, persoonlijk token.</li>
</ul></div>
</section>

<section class="sec">
<h2>8. Wijzigingen</h2>
<p style="color:var(--muted-foreground);font-size:14.5px">Verandert er iets aan hoe we met gegevens omgaan, dan passen we deze verklaring aan en zetten de datum bovenaan bij. Bij ingrijpende wijzigingen melden we dat op de site.</p>
</section>

<section class="sec">
<div class="card" style="text-align:center">
<h2 style="font-size:20px">Vragen over je privacy?</h2>
<p>Mail naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a> — we helpen je graag verder.</p>
<p style="margin-top:12px"><a class="btn" href="/cookies">Cookieverklaring</a> <a class="btn ghost" href="/voorwaarden">Algemene voorwaarden</a></p>
</div>
</section>`
  });
}

export function cookiesPage() {
  return pageShell({
    title: 'Cookieverklaring TrimGids — welke cookies en waarom',
    description: 'De cookieverklaring van TrimGids: welke functionele cookies en lokale opslag we gebruiken, waarom, en hoe je die zelf uitzet in je browser.',
    canonical: '/cookies',
    active: 'cookies',
    body: `
${notice}
<p class="crumb"><a href="/">TrimGids</a> / Cookieverklaring</p>
<span class="eyebrow">Cookies</span>
<h1>Cookieverklaring</h1>
<p class="intro">Kort samengevat: TrimGids plaatst géén advertentie- of trackingcookies. We gebruiken alleen functionele opslag die nodig is om de site te laten werken. Daarvoor is volgens de Telecommunicatiewet geen toestemming nodig — maar we leggen het je graag uit.</p>
<p style="color:var(--muted-foreground);font-size:13px">Laatst bijgewerkt: ${LAST_UPDATED}</p>

<section class="sec">
<h2>Wat we gebruiken</h2>
<div class="table" style="overflow-x:auto"><table class="table">
<thead><tr><th scope="col">Naam</th><th scope="col">Type</th><th scope="col">Doel</th><th scope="col">Bewaard</th></tr></thead>
<tbody>
<tr><td><code>trimgids_theme</code></td><td>Functioneel (localStorage)</td><td>Onthoudt of je het lichte of donkere thema koos, zodat de site bij je volgende bezoek hetzelfde oogt.</td><td>Tot je het zelf wist</td></tr>
<tr><td><code>trimgids-attribution</code></td><td>Functioneel (localStorage)</td><td>Onthoudt via welke TrimGids-pagina je bij een aanbieder terechtkwam, zodat we kunnen zien welke gidsen nuttig zijn.</td><td>Korte periode</td></tr>
<tr><td>Sessietoken (alleen na inloggen)</td><td>Functioneel (cookie)</td><td>Houdt je ingelogd tijdens je bezoek, zodat je favorieten en profiel bewaard blijven.</td><td>Tot je uitlogt</td></tr>
<tr><td>Favorieten</td><td>Functioneel (localStorage)</td><td>Bewaart welke aanbieders je een hartje gaf.</td><td>Tot je het zelf wist</td></tr>
</tbody></table></div>
</section>

<section class="sec">
<h2>Wat we níét gebruiken</h2>
<div class="card">
<ul>
<li>Geen advertentiecookies</li>
<li>Geen cookies van advertentienetwerken</li>
<li>Geen sociale-media-trackingpixels</li>
<li>Geen cookies die je gedrag over meerdere websites volgen</li>
</ul>
</div>
</section>

<section class="sec">
<h2>Anonieme prestatiemeting</h2>
<p style="color:var(--muted-foreground);font-size:14.5px">Om te zien of pagina's snel genoeg laden, stuurt de site anonieme meetwaarden (zoals laadtijd) naar onze eigen server. Daarbij wordt <strong>geen</strong> IP-adres, geen naam en geen browseridentificatie bewaard, en er wordt geen cookie voor geplaatst. De gegevens zijn niet tot een persoon herleidbaar.</p>
</section>

<section class="sec">
<h2>Zelf uitzetten of wissen</h2>
<div class="grid g3">
<div class="card"><h3>Chrome</h3><p>Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens. Of wis alleen TrimGids: het slotje naast de adresbalk → Cookies en sitegegevens.</p></div>
<div class="card"><h3>Firefox</h3><p>Instellingen → Privacy &amp; beveiliging → Cookies en sitegegevens → Gegevens beheren.</p></div>
<div class="card"><h3>Safari</h3><p>Instellingen → Privacy → Beheer websitegegevens.</p></div>
</div>
<p style="margin-top:16px;color:var(--muted-foreground);font-size:14.5px">Zet je functionele opslag uit, dan onthoudt de site je thema en favorieten niet meer. De site blijft gewoon werken.</p>
</section>

<section class="sec">
<div class="card" style="text-align:center">
<h2 style="font-size:20px">Meer weten?</h2>
<p>Lees de volledige <a href="/privacy">privacyverklaring</a> of mail naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a>.</p>
<p style="margin-top:12px"><a class="btn" href="/privacy">Privacyverklaring</a> <a class="btn ghost" href="/voorwaarden">Algemene voorwaarden</a></p>
</div>
</section>`
  });
}

export function termsPage() {
  return pageShell({
    title: 'Algemene voorwaarden TrimGids — wat je van ons mag verwachten',
    description: 'De algemene voorwaarden van TrimGids: onze rol als onafhankelijke gids, wat aanbieders zelf verantwoordelijk blijven, en de regels voor reviews en inhoud.',
    canonical: '/voorwaarden',
    active: 'voorwaarden',
    body: `
${notice}
<p class="crumb"><a href="/">TrimGids</a> / Algemene voorwaarden</p>
<span class="eyebrow">Voorwaarden</span>
<h1>Algemene voorwaarden</h1>
<p class="intro">TrimGids is een informatieve gids, geen uitvoerende partij. Deze voorwaarden leggen vast wat dat betekent voor jou en voor aanbieders.</p>
<p style="color:var(--muted-foreground);font-size:13px">Laatst bijgewerkt: ${LAST_UPDATED}</p>

<section class="sec">
<h2>1. Wat TrimGids is — en wat niet</h2>
<div class="card">
<p>TrimGids verzamelt en ordent informatie over trimsalons, hondenscholen, pensions, losloopgebieden en aanverwante diensten in Nederland. Wij brengen vraag en aanbod bij elkaar, maar:</p>
<ul>
<li>We zijn <strong>geen partij</strong> bij een overeenkomst tussen jou en een aanbieder.</li>
<li>We voeren <strong>geen diensten uit</strong> en nemen geen boekingen aan.</li>
<li>We zijn <strong>geen werkgever</strong> van de vermelde professionals.</li>
</ul>
<p style="margin-top:10px">Een overeenkomst komt uitsluitend tot stand tussen jou en de aanbieder. Daarop zijn hun eigen voorwaarden van toepassing.</p>
</div>
</section>

<section class="sec">
<h2>2. Juistheid van informatie</h2>
<div class="card">
<p>We doen ons best om prijzen, openingstijden, tarieven en regelgeving actueel te houden. Toch kunnen gegevens verouderd raken: een salon verhuist, een gemeente schaft de hondenbelasting af, een premie gaat omhoog.</p>
<p style="margin-top:10px"><strong>Controleer daarom altijd de actuele gegevens bij de aanbieder zelf</strong> vóórdat je boekt, betaalt of een besluit neemt.</p>
<p style="margin-top:10px">Ontdek je een fout? <a href="mailto:info@mpxstudio.nl">Laat het ons weten</a>, dan passen we het zo snel mogelijk aan.</p>
</div>
</section>

<section class="sec">
<h2>3. Medische en gedragsinformatie</h2>
<div class="card">
<p>Artikelen over gezondheid, gedrag, voeding, eerste hulp en calculators (zoals de chocoladedosering en de vachtplanner) zijn <strong>algemene voorlichting</strong>. Ze zijn geen diagnose, geen advies en geen vervanging van een dierenarts.</p>
<p style="margin-top:10px"><strong>Bij twijfel of bij een noodgeval: bel altijd een dierenarts.</strong> TrimGids is niet aansprakelijk voor gevolgen van het opvolgen van informatie op deze site.</p>
</div>
</section>

<section class="sec">
<h2>4. Reviews en gebruikersinhoud</h2>
<div class="card">
<ul>
<li>Je bent zelf verantwoordelijk voor wat je plaatst.</li>
<li>Plaats geen beledigingen, bedreigingen, discriminatie of persoonsgegevens van anderen.</li>
<li>Reviews horen over een echte ervaring te gaan. Reclame of concurrentie-bashing verwijderen we.</li>
<li>We modereren vóór publicatie en mogen inhoud weigeren, aanpassen of verwijderen zonder opgaaf van reden.</li>
<li>Je geeft TrimGids het recht je bijdrage op de site te tonen en te bewaren.</li>
</ul>
<p style="margin-top:10px">Ben je het niet eens met een review over jouw bedrijf? Mail naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a>. We verwijderen niet zomaar kritiek, maar wel inhoud die tegen deze regels ingaat.</p>
</div>
</section>

<section class="sec">
<h2>5. Voor aanbieders</h2>
<div class="grid g3">
<div class="card"><h3>Verantwoordelijkheid</h3><p>Jij staat in voor de juistheid van je eigen profielgegevens, prijzen en openingstijden.</p></div>
<div class="card"><h3>Claimen</h3><p>Alleen wie aantoonbaar bij een bedrijf hoort, mag een profiel claimen. We controleren dat.</p></div>
<div class="card"><h3>Lead-opvolging</h3><p>Reageer op offerte-aanvragen binnen een redelijke termijn en respecteer de privacy van de aanvrager.</p></div>
</div>
</section>

<section class="sec">
<h2>6. Partnerlinks</h2>
<p style="color:var(--muted-foreground);font-size:14.5px">Sommige links op TrimGids zijn partnerlinks. Bestel je via zo'n link, dan ontvangen wij mogelijk een kleine vergoeding. Dat verandert niets aan jouw prijs. We geven zulke links aan met <code>rel="sponsored"</code> en benoemen partnerrelaties in de tekst waar dat relevant is. Onze redactionele keuze laat zich niet door vergoedingen sturen.</p>
</section>

<section class="sec">
<h2>7. Aansprakelijkheid</h2>
<div class="card">
<p>De site wordt aangeboden zoals hij is. Voor zover de wet dat toestaat is TrimGids niet aansprakelijk voor schade die voortkomt uit het gebruik van de site of uit informatie die erop staat, noch voor het handelen van een via TrimGids gevonden aanbieder.</p>
<p style="margin-top:10px">Onze aansprakelijkheid is in elk geval beperkt tot het bedrag dat onze aansprakelijkheidsverzekering in het betreffende geval uitkeert.</p>
</div>
</section>

<section class="sec">
<h2>8. Intellectueel eigendom</h2>
<p style="color:var(--muted-foreground);font-size:14.5px">De vormgeving, teksten en het databestand van TrimGids zijn beschermd. Overnemen mag alleen met voorafgaande schriftelijke toestemming, of binnen de grenzen van het citaatrecht met duidelijke bronvermelding.</p>
</section>

<section class="sec">
<h2>9. Toepasselijk recht</h2>
<p style="color:var(--muted-foreground);font-size:14.5px">Op deze voorwaarden is Nederlands recht van toepassing. Geschillen leggen we eerst voorgelegd aan de bevoegde rechter van [woonplaats vestiging].</p>
</section>

<section class="sec">
<div class="card" style="text-align:center">
<h2 style="font-size:20px">Vragen?</h2>
<p>Mail naar <a href="mailto:info@mpxstudio.nl">info@mpxstudio.nl</a>.</p>
<p style="margin-top:12px"><a class="btn" href="/privacy">Privacyverklaring</a> <a class="btn ghost" href="/cookies">Cookieverklaring</a></p>
</div>
</section>`
  });
}
