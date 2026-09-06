/* Pagina: Wat kost hondentrimmen in 2026?
   - Landelijk gemiddelde + uurtarieven (bron: Trimsalon Limbo, Charmée 2026)
   - Ras-tarieven 2026 (Trimsalon Zutphen tarievenlijst 2026)
   - Interactieve trimkostencalculator (formaat × vacht × conditie × frequentie)
   - FAQ-rijkschema + affiliate borstel-CTA + offerte-CTA. */
import { pageShell, esc } from './base.mjs';

const CSS = `
.cost-hero{background:linear-gradient(135deg,#07150e,#0f3e28);color:#e7f5ec;border-radius:var(--r-lg);padding:32px;margin-top:16px;box-shadow:var(--shadow-lg)}
.cost-hero h1{color:#fff;font-size:26px;margin:0 0 8px;letter-spacing:-.01em}
.cost-hero p{color:rgba(231,245,236,.82);font-size:14.5px;max-width:760px}
.cost-hero .note{margin-top:10px;font-size:12.5px;font-weight:700;color:#a7f3d0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:22px 0}
.statc{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.statc b{font-size:26px;color:var(--g);display:block;letter-spacing:-.02em}
.statc span{font-size:12.5px;color:var(--muted);font-weight:700}
.tcalc{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:26px;margin:24px 0;box-shadow:var(--shadow)}
.tcalc label{display:grid;gap:6px;font-size:12.5px;font-weight:800;color:var(--ink)}
.tcalc select,.tcalc input{padding:11px 13px;border:1.6px solid var(--line);border-radius:12px;background:var(--bg);font:inherit;font-weight:700;color:var(--ink)}
.tcalc .grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.tcalc .out{margin-top:18px;background:linear-gradient(135deg,rgba(16,185,129,.1),rgba(16,185,129,.04));border:1.6px solid rgba(16,185,129,.35);border-radius:14px;padding:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}
.tcalc .out b{font-size:22px;color:var(--g)}
.tcalc .out span{font-size:12px;color:var(--muted);font-weight:700;display:block}
.ttable{width:100%;border-collapse:collapse;background:var(--card);border-radius:var(--r);overflow:hidden;font-size:14px;box-shadow:var(--shadow)}
.ttable th,.ttable td{padding:11px 13px;text-align:left;border-bottom:1px solid var(--line)}
.ttable th{background:var(--g);color:#fff;font-size:12.5px;letter-spacing:.03em}
.ttable tr:last-child td{border-bottom:0}
.tip{display:flex;gap:12px;background:var(--card);border-left:4px solid var(--amber);border-radius:var(--r);padding:16px 18px;margin:14px 0;font-size:14px}
.tip b{color:var(--amber)}
.src{font-size:12px;color:var(--muted);margin-top:18px}
.ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
@media(max-width:620px){.ttable{font-size:12.5px}.ttable th,.ttable td{padding:8px 9px}}
`;

const RATES = [
  ['Pomeriaan / Maltezer (tot 8 kg)', '€ 60 – 85'],
  ['Maltezer vanaf 8 kg', '€ 70 – 95'],
  ['Shih Tzu / Lhasa Apso', '€ 85 – 115'],
  ['Labradoodle medium (15–21 kg)', '€ 130 – 180'],
  ['Labradoodle groot (23–42 kg)', '€ 150 – 200'],
  ['Labradoodle tussenbeurt', '€ 80 – 90'],
  ['Beagle', '€ 55 – 70'],
  ['Jack Russell Terriër', '€ 95 – 115'],
  ['West Highland White Terriër', '€ 95 – 120'],
  ['Berner Sennenhond', '€ 150 – 200'],
  ['Schnauzer dwerg', '€ 95 – 120'],
  ['Keeshond (dwerg/midden/groot)', '€ 77 – 115'],
  ['Puppy wenbezoek (9–15 weken)', '€ 40 – 75'],
  ['Grote hond tot 35 kg (bad/knippen)', '€ 65 – 100'],
  ['Zeer grote hond tot 60 kg', '€ 80 – 140']
];

export function trimKostenPage() {
  const faq = [{
    q: 'Wat kost een trimbeurt gemiddeld in 2026?',
    a: 'Landelijk betaal je gemiddeld €65–75 per trimbeurt. Afhankelijk van ras, vachttype en conditie varieert dit van €40 (kleine, kortharige hond) tot €200+ (grote, langharige rassen zoals Berner Sennenhond).'
  }, {
    q: 'Is een uurtarief of vaste prijs voordeliger?',
    a: 'Kies bijna altijd een vaste prijs per trimbeurt. Bij een uurtarief van €45–70 kan een grote hond met 3 uur werk al snel €135–210 kosten; een vaste prijs geeft zekerheid en is meestal voordeliger.'
  }, {
    q: 'Wat kost ontklitten of bijknippen?',
    a: 'Ontklitten kost gemiddeld €17,50 per kwartier (soms €15–25 per 15 minuten); nagels knippen ±€15 en haren uit de oren ±€15. Wekelijks borstelen voorkomt deze meerkosten.'
  }, {
    q: 'Hoeveel trimbeurten per jaar heeft mijn hond nodig?',
    a: 'Een langharige hond zoals een Labradoodle of Maltezer heeft meestal 4–8 beurten per jaar nodig (elke 6–8 weken), een kortharige hond 1–3 beurten (vooral bad en nagels).'
  }];

  const faqJson = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  });
  const chartJson = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Trimsalon tarieven 2026',
    itemListElement: RATES.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r[0] + ' — ' + r[1] }))
  });

  const body = `
  <div class="cost-hero">
    <span class="eyebrow" style="color:#a7f3d0">Reële prijspeiling 2026</span>
    <h1>✂️ Wat kost hondentrimmen in 2026?</h1>
    <p>De trimprijzen zijn de afgelopen jaren flink gestegen (sinds 2020 tot wel 200% bij sommige salons). Hieronder de actuele landelijke gemiddelden, tarieven per populaire ras en een calculator die jouw jaarlijkse kosten inschat.</p>
    <p class="note">Landelijk gemiddelde: €65–75 per trimbeurt · uurtarief €45–70 (gem. €55) · reken 2–4 beurten per jaar</p>
  </div>

  <div class="stats">
    <div class="statc"><b>€ 65–75</b><span>Landelijk gemiddelde per trimbeurt (2026)</span></div>
    <div class="statc"><b>€ 130–200</b><span>Labradoodle / grote langharige rassen</span></div>
    <div class="statc"><b>€ 40–75</b><span>Puppy wenbezoek (eerste kennismaking)</span></div>
    <div class="statc"><b>€ 90–200 /jr</b><span>Gemiddelde jaarlijkse trimkosten</span></div>
  </div>

  <section class="sec">
    <h2>🧮 Trimkosten-calculator 2026</h2>
    <p class="sub">Kies het formaat, vachttype en aantal beurten — wij rekenen de verwachte jaarprijs uit (incl. eventuele ontklit-toeslag).</p>
    <div class="tcalc">
      <div class="grid3">
        <label>Formaat van je hond<select id="tc-size"><option value="40">Klein (tot 10 kg — Pomeriaan, Maltezer)</option><option value="75" selected>Middelgroot (10–25 kg — Labradoodle, Cockapoo)</option><option value="120">Groot (25+ kg — Golden, Berner)</option></select></label>
        <label>Vachttype<select id="tc-coat"><option value="1" selected>Langharig / krullend (wekelijks borstelen)</option><option value="0.75">Middellang / steil</option><option value="0.55">Kortharig</option></select></label>
        <label>Vachtconditie<select id="tc-cond"><option value="1" selected>Goed (klitvrij)</option><option value="1.35">Licht vervilt (klitten)</option></select></label>
        <label>Trimbeurten per jaar<select id="tc-freq"><option value="2">2× per jaar (kortharig)</option><option value="4" selected>4× per jaar (standaard)</option><option value="6">6× per jaar (8-weeks schema)</option><option value="8">8× per jaar (langharig)</option></select></label>
      </div>
      <div class="out">
        <div><b id="tc-per">€ 75</b><span>Gemiddeld per trimbeurt</span></div>
        <div><b id="tc-year">€ 300</b><span>Verwacht per jaar</span></div>
        <div><b id="tc-tip">Voorkom klitten!</b><span>Persoonlijke tip</span></div>
      </div>
    </div>
  </section>

  <section class="sec">
    <h2>💶 Tarieven 2026 per populair ras</h2>
    <p class="sub">Actuele richtprijzen afkomstig van Nederlandse trimsalons (tarievenlijst 2026). Prijzen verschillen per regio en salon.</p>
    <div style="overflow-x:auto"><table class="ttable"><thead><tr><th>Ras / formaat</th><th>Gemiddelde prijs 2026</th></tr></thead><tbody>
      ${RATES.map(r => `<tr><td>${r[0]}</td><td><strong>${r[1]}</strong></td></tr>`).join('')}
    </tbody></table></div>
    <p class="src">Bron: Nederlandse trimsalons (tarievenlijsten 2026: Trimsalon van Zutphen, Trimsalon Furrytails, Trimsalon Charmée) en Trimsalon Limbo (landelijk gemiddelde €65–75, uurtarief €45–70). Prijzen zijn indicatief en inclusief wassen, drogen en knippen tenzij anders vermeld.</p>
  </section>

  <section class="sec">
    <h2>💡 Zo houd je de trimrekening laag</h2>
    <div class="tip"><div>🐕</div><div><b>Borstel wekelijks</b> — klitten kosten ±€17,50 per kwartier extra en zijn soms pijnlijk voor de hond. Een professionele slickerborstel betaalt zichzelf in één beurt terug.</div></div>
    <div class="tip"><div>📅</div><div><b>Kies een vast schema</b> — 4 beurten per jaar (elke 8 weken) is voor de meeste rassen goedkoper én gezonder dan 2 dure, uitgegroeide beurten.</div></div>
    <div class="tip"><div>📝</div><div><b>Vraag offertes aan</b> — prijzen verschillen tot 50% tussen salons. Vergelijk gratis 3 salons bij jou in de buurt en kies op ervaring + prijs.</div></div>
    <div class="ctas">
      <a class="btn gold" href="/offerte">📝 Vraag 3 gratis offertes aan</a>
      <a class="btn ghost" href="/webshop">🪮 Slickerborstel bekijken (bestseller)</a>
      <a class="btn ghost" href="/trimsalon">✂️ Trimsalons in jouw buurt</a>
    </div>
  </section>

  <section class="sec">
    <h2>Veelgestelde vragen</h2>
    <div class="qas">
      ${faq.map(f => `<div class="qa"><b>${f.q}</b><p>${f.a}</p></div>`).join('')}
    </div>
  </section>

  <script id="tg-trimcalc">
  (function () {
    var size = document.getElementById('tc-size'), coat = document.getElementById('tc-coat'),
        cond = document.getElementById('tc-cond'), freq = document.getElementById('tc-freq'),
        per = document.getElementById('tc-per'), year = document.getElementById('tc-year'), tip = document.getElementById('tc-tip');
    function euro(v) { return '€ ' + Math.round(v).toLocaleString('nl-NL'); }
    function calc() {
      var base = +size.value * +coat.value * +cond.value;
      var n = +freq.value;
      per.textContent = euro(base);
      year.textContent = euro(base * n);
      tip.textContent = cond.value == '1' ? 'Voorkom klitten! Wekelijks borstelen.' : 'Klitten! Vraag eerst om een tarief vóór de beurt.';
    }
    [size, coat, cond, freq].forEach(function (el) { el.addEventListener('change', calc); });
    calc();
  })();
  </script>`;

  return pageShell({
    title: 'Wat kost hondentrimmen in 2026? Tarieven & calculator | TrimGids',
    description: 'Actuele trimprijzen 2026: landelijk gemiddeld €65–75 per beurt, tarieven per ras (Labradoodle €130–200, Maltezer €70–95) en een gratis trimkosten-calculator.',
    canonical: '/trimmen-kosten',
    body,
    extraHead: `<script type="application/ld+json">${faqJson}</script><script type="application/ld+json">${chartJson}</script>`,
    active: 'trimmen-kosten'
  });
}
