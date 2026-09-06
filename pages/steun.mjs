/* Steun TrimGids — eerlijke monetisatie (Ronde 15).
   Geen harde paywalls: de site blijft gratis; steun via gift, affiliate
   of Vriend-van-TrimGids. Affiliate-inkomsten houden de servers draaiend. */
import { pageShell, esc } from './base.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const supportersFile = fileURLToPath(new URL('../data/supporters.json', import.meta.url));

function loadSupporters() {
  try { return JSON.parse(readFileSync(supportersFile, 'utf8')); } catch { return []; }
}

export function steunPage() {
  const count = loadSupporters().length;
  const body = `
<style>${CSS}</style>
<span class="eyebrow">Steun TrimGids · geen abonnementen, geen cookies-rommel</span>
<h1>Houd TrimGids gratis — voor elke baas</h1>
<p class="intro">TrimGids is en blijft gratis: geen artikelen achter een betaalmuur, geen advertenties die je klikken dicteren. Toch kost de site geld — servers, foto's, checks en vooral tijd. Daarom draait hij op drie eerlijke pijlers:</p>

<div class="su-grid">
  <div class="su-card">
    <span class="su-num">1</span>
    <h2>Koop via onze affiliate-links</h2>
    <p>Bij verzekeringen, voeding, DNA-tests, hondenbuggy's, lijnen en reisartikelen verwijzen we naar partners. <strong>Jij betaalt niets extra</strong> — wij krijgen een klein percentage en daarmee betalen we de servers.</p>
    <a class="btn-primary" href="/verzekering">Verzekeringen vergelijken →</a>
    <a class="btn-ghost" href="/webshop">Webshop & hondenbenodigdheden →</a>
    <a class="btn-ghost" href="/voeding">Voeding & vers →</a>
  </div>
  <div class="su-card">
    <span class="su-num">2</span>
    <h2>Word Vriend van TrimGids</h2>
    <p>Eenmalig of maandelijks — hoe klein ook (koffie voor de redactie!). Met je gift houden we de gidsen onafhankelijk en advertentievrij.</p>
    <form id="su-form" class="su-form">
      <label>Je naam<input name="name" required maxlength="60" placeholder="Bijv. Sanne"></label>
      <label>E-mail<input name="email" type="email" required maxlength="120" placeholder="jij@voorbeeld.nl"></label>
      <label>Bedrag<select name="amount"><option value="3">€ 3 — één koffie</option><option value="5">€ 5 — twee koffie</option><option value="10" selected>€ 10 — doos koekjes</option><option value="25">€ 25 — servermaand</option><option value="50">€ 50 — grote steun</option><option value="custom">Ander bedrag</option></select></label>
      <label>Wil je maandelijks of eenmalig?<select name="kind"><option value="eenmalig">Eenmalig</option><option value="maandelijks">Maandelijks (kan altijd stoppen)</option></select></label>
      <label>Fijne tekst (optioneel)<textarea name="message" maxlength="300" placeholder="Bijv. bedankt voor de hittegids!"></textarea></label>
      <button class="btn-primary" type="submit">Gift-intentie versturen →</button>
      <p id="su-status" class="status-msg" hidden></p>
      <p class="su-note">We versturen geen betaalpagina's per e-mail: na je intentie zie je direct de betaalgegevens. Geen automatische incasso's — je houdt zelf de controle.</p>
    </form>
  </div>
  <div class="su-card">
    <span class="su-num">3</span>
    <h2>Vertel het verder & meld je aan</h2>
    <p>Deel een gids die je hielp, meld een fout die je zag of tip een salon/opvang die het verdient. Zo groeit de database én de betrouwbaarheid.</p>
    <a class="btn-ghost" href="/forum">Ga naar het forum →</a>
    <a class="btn-ghost" href="/nieuws">Nieuwsbrief & nieuws →</a>
    <p class="su-note">Nu al <strong>${count} Vrienden</strong> van TrimGids. Kom erbij!</p>
  </div>
</div>

<section class="sec">
  <div class="section-head"><div><span class="eyebrow">Transparantie</span><h2>Zo verdient TrimGids geld — eerlijk uitgelegd</h2></div></div>
  <div class="su-truth">
    <div class="su-truth-item"><h3>Affiliate (het grootste deel)</h3><p>Verzekeringen, voer, DNA-tests en webshop-artikelen: een 'gesponsorde' link verandert je prijs niet. Onze reviews blijven onafhankelijk: een partner kan zijn score niet kopen.</p></div>
    <div class="su-truth-item"><h3>Later: uitgelichte advertenties</h3><p>Voor salons en fokkers komt er een betaalde 'Uitgelicht'-positie (€ 15-30/mnd, gepland voor 2027). Basisvermelding blijft altijd gratis — we verkopen geen nummer één die niet verdiend is.</p></div>
    <div class="su-truth-item"><h3>Giften & Vrienden</h3><p>Giften zijn bewust níet de hoofdmoat: we willen niet afhankelijk zijn van donaties alleen. Maar elke gift maakt ons minder afhankelijk van affiliate.</p></div>
  </div>
</section>

<script>
(function () {
  var form = document.getElementById('su-form');
  var status = document.getElementById('su-status');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var data = new FormData(form);
    try {
      var res = await fetch('/api/supporters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: data.get('name'), email: data.get('email'), amount: data.get('amount'), kind: data.get('kind'), message: data.get('message')
      }) });
      if (!res.ok) throw new Error();
      status.hidden = false;
      status.className = 'status-msg success';
      status.textContent = '✓ Bedankt ' + data.get('name') + '! Je gift-intentie is geregistreerd. Gebruik nu deze gegevens om te doneren: Tenaamstelling TrimGids, IBAN NL00 TGID 0000 0000 00 (komt nog live), o.v.v. "Vriend".';
      form.reset();
    } catch (err) {
      status.hidden = false;
      status.className = 'status-msg error';
      status.textContent = 'Er ging iets mis. Probeer het opnieuw of mail naar groetjes@trimgids.nl.';
    }
  });
})();
</script>`;
  return pageShell({
    title: 'Steun TrimGids: houd de hondengidsen gratis & onafhankelijk | TrimGids',
    description: 'Steun TrimGids met een gift, een affiliate-koop of door de site te delen. Geen abonnementen, geen paywall — wel eerlijkheid: zo verdient de site geld.',
    canonical: '/steun',
    body
  });
}

export async function supporterCreate(input) {
  const name = String(input.name || '').trim().slice(0, 60);
  const email = String(input.email || '').trim().slice(0, 120).toLowerCase();
  const amount = String(input.amount || '').trim().slice(0, 20);
  const kind = String(input.kind || '').trim().slice(0, 20);
  const message = String(input.message || '').trim().slice(0, 300);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !amount) throw new Error('supporter_invalid_fields');
  const list = loadSupporters();
  const record = { id: randomUUID(), name, email, amount, kind, message, status: 'nieuw', createdAt: new Date().toISOString() };
  list.push(record);
  writeFileSync(supportersFile, JSON.stringify(list, null, 2) + '\n');
  return record;
}

const CSS = `
.su-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin: 10px 0 6px; }
.su-card { position: relative; display: grid; gap: 12px; align-content: start; background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 26px; box-shadow: var(--shadow); }
.su-card h2 { font-size: 19px; }
.su-card p { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin: 0; }
.su-num { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 12px; background: linear-gradient(135deg, #0f3e28, #17694a); color: #fff; font: 800 15px 'Plus Jakarta Sans', sans-serif; }
.btn-primary { display: inline-block; background: linear-gradient(135deg, #0f3e28, #17694a); color: #fff; font: 700 14px 'Plus Jakarta Sans', sans-serif; padding: 12px 18px; border-radius: 999px; text-align: center; text-decoration: none; border: 0; cursor: pointer; }
.btn-primary:hover { filter: brightness(1.08); }
.btn-ghost { display: inline-block; background: var(--card); border: 1px solid var(--line); color: var(--ink); font: 700 13.5px 'Plus Jakarta Sans', sans-serif; padding: 11px 16px; border-radius: 999px; text-align: center; text-decoration: none; }
.btn-ghost:hover { border-color: rgba(16,185,129,.55); }
.su-form { display: grid; gap: 12px; margin-top: 4px; }
.su-form label { display: grid; gap: 5px; font: 700 12.5px 'Plus Jakarta Sans', sans-serif; color: var(--ink); }
.su-form input, .su-form select, .su-form textarea { font: 600 14px 'Plus Jakarta Sans', sans-serif; border: 1px solid var(--line); border-radius: 12px; padding: 10px 13px; background: var(--card); color: var(--ink); }
.su-form textarea { min-height: 70px; resize: vertical; }
.su-note { font-size: 12px !important; color: var(--muted) !important; }
.su-truth { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.su-truth-item { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 20px; }
.su-truth-item h3 { font-size: 15px; margin-bottom: 8px; }
.su-truth-item p { font-size: 13px; color: var(--muted); line-height: 1.6; margin: 0; }
.status-msg.success { background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.35); color: #065f46; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
.status-msg.error { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.35); color: #991b1b; padding: 12px 14px; border-radius: 12px; font-size: 13px; }
`;

export default steunPage;
