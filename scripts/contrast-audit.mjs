/* Contrast-audit: rekent de ECHTE cascade door (alle stylesheets in volgorde,
   CSS-variabelen, media-queries, important, overerving) en toetst de
   uiteindelijke kleurcombinaties op WCAG-contrast — in licht én donker thema.

   Gebruik: node scripts/contrast-audit.mjs [breedte]
   Vereist een draaiende server op :3000. */
import { JSDOM } from 'jsdom';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'desktop', width: 1440 },
  { name: 'mobiel', width: 390 }
];

/* ---------- kleurhelpers ---------- */
const NAMED = { white: '#ffffff', black: '#000000', transparent: 'rgba(0, 0, 0, 0)', currentcolor: null };
function parseColor(value) {
  if (!value) return null;
  value = String(value).trim().toLowerCase();
  if (NAMED[value] !== undefined && value !== 'currentcolor') return value === 'transparent' ? { r: 0, g: 0, b: 0, a: 0 } : hex(NAMED[value]);
  if (value === 'currentcolor') return null;
  if (value.startsWith('#')) return hex(value);
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  return null;
}
function hex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
}
function colorMix(a, b, pct) {
  const t = Math.max(0, Math.min(100, pct)) / 100;
  return {
    r: Math.round(a.r * t + b.r * (1 - t)),
    g: Math.round(a.g * t + b.g * (1 - t)),
    b: Math.round(a.b * t + b.b * (1 - t)),
    a: (a.a ?? 1) * t + (b.a ?? 1) * (1 - t)
  };
}
function resolveValue(value, vars) {
  if (value == null) return null;
  let out = String(value);
  for (let i = 0; i < 8; i++) {
    const m = out.match(/color-mix\(\s*in\s+srgb\s*,\s*([^,]+?)\s+(\d+(?:\.\d+)?)%\s*,\s*([^)]+?)\s*\)/);
    if (m) {
      const a = parseColor(resolveValue(m[1], vars));
      const b = parseColor(resolveValue(m[3], vars));
      if (a && b) { const mixed = colorMix(a, b, Number(m[2])); out = out.replace(m[0], `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`); continue; }
      out = out.replace(m[0], m[1]); continue;
    }
    const vm = out.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/);
    if (!vm) break;
    const val = vars[vm[1]] ?? (vm[2] ? vm[2].trim() : '');
    out = out.replace(vm[0], val);
    if (!val) return null;
  }
  return out;
}
function lum(c) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function ratio(fg, bg) {
  const l1 = lum(fg), l2 = lum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* ---------- CSS parsen ---------- */
function parseCss(text, rules = [], media = null) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  while (i < text.length) {
    const brace = text.indexOf('{', i);
    if (brace === -1) break;
    const head = text.slice(i, brace).trim();
    let depth = 1, j = brace + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    const body = text.slice(brace + 1, j - 1);
    if (head.startsWith('@media') && media === null) {
      parseCss(body, rules, head.replace('@media', '').trim());
    } else if (!head.startsWith('@keyframes') && !head.startsWith('@-webkit-keyframes') && !head.startsWith('@supports') && !head.startsWith('@font-face')) {
      for (const selGroup of head.split(',')) {
        const sel = selGroup.trim();
        if (!sel || sel.startsWith('@')) continue;
        const pseudo = sel.includes('::') || sel.includes(':hover') || sel.includes(':focus') || sel.includes(':active') || sel.includes(':visited');
        const decls = {};
        for (const d of body.split(';')) {
          const idx = d.indexOf(':');
          if (idx === -1) continue;
          const prop = d.slice(0, idx).trim().toLowerCase();
          const val = d.slice(idx + 1).trim();
          if (['color', 'background-color', 'background'].includes(prop)) decls[prop] = { val, important: /!\s*important/.test(val) };
        }
        if (Object.keys(decls).length) rules.push({ sel, media, pseudo, decls, order: rules.length });
      }
    }
    i = j;
  }
  return rules;
}
function mediaApplies(cond, width) {
  if (!cond) return true;
  /* Print-stijlen gelden nooit op een scherm-weergave (r28: de blanket
     a{color:inherit!important} uit @media print verduisterde link-kleuren). */
  if (/\bprint\b/.test(cond)) return false;
  let ok = true;
  for (const m of cond.match(/\(([^)]+)\)/g) || []) {
    const mm = m.slice(1, -1).replace(/:/g, ' ').trim().split(/\s+/);
    const [feat, ...rest] = mm;
    const val = Number(rest.join('').replace('px', ''));
    if (feat === 'min-width') ok = ok && width >= val;
    else if (feat === 'max-width') ok = ok && width <= val;
    else if (feat !== 'screen' && feat !== 'all') ok = false; // prefers-* e.d.: niet actief
  }
  return ok;
}
function specificity(sel) {
  const a = (sel.match(/#[\w-]+/g) || []).length;
  const b = (sel.match(/\.[\w-]+|\[[^\]]+\]|:[a-zA-Z-]+(?!\()/g) || []).filter(s => !s.startsWith('::')).length;
  const c = (sel.match(/(^|[\s>+~])[a-zA-Z][\w-]*|\*[>\s+~]/g) || []).length;
  return a * 100 + b * 10 + c;
}

/* ---------- elementstijl uit de cascade ---------- */
function declaredFor(el, prop, rules, width, sheetMap) {
  let best = null;
  for (const rule of rules) {
    if (rule.pseudo) continue;
    if (!mediaApplies(rule.media, width)) continue;
    const d = rule.decls[prop];
    if (!d) continue;
    let matches = false;
    try { matches = el.matches(rule.sel); } catch (e) { continue; }
    if (!matches) continue;
    const spec = specificity(rule.sel);
    const key = [d.important ? 1 : 0, spec, rule.order];
    if (!best || key[0] > best.key[0] || (key[0] === best.key[0] && key[1] > best.key[1]) || (key[0] === best.key[0] && key[1] === best.key[1])) best = { key, d, rule, sheet: sheetMap.get(rule) || '' };
  }
  return best;
}
function inheritedColor(el, prop, rules, width, vars, sheetMap) {
  let node = el;
  while (node && node.nodeType === 1) {
    const hit = declaredFor(node, prop, rules, width, sheetMap);
    if (hit) {
      const resolved = resolveValue(hit.d.val.replace(/!\s*important/g, '').trim(), vars);
      const color = parseColor(resolved);
      if (color) return { color, from: `${node.tagName.toLowerCase()} ← ${hit.rule.sel} (${hit.sheet})` };
      if (resolved && !resolved.includes('gradient')) return null;
    }
    node = node.parentElement;
  }
  return null;
}
function compositeOver(top, bottom) {
  const a = top.a ?? 1;
  return {
    r: Math.round(top.r * a + bottom.r * (1 - a)),
    g: Math.round(top.g * a + bottom.g * (1 - a)),
    b: Math.round(top.b * a + bottom.b * (1 - a)),
    a: Math.max(a, bottom.a ?? 1)
  };
}
function effectiveBg(el, rules, width, vars, sheetMap, depth = 0) {
  if (depth > 12) return { color: { r: 255, g: 255, b: 255, a: 1 }, from: 'te diep' };
  /* Alle achtergrondlagen op dít element: kleurstops uit de winnende
     `background`-shorthand (eerste in de string = bovenste laag) plus een
     aparte background-color onderaan. Semi-transparante lagen worden over
     de onderliggende (ouder-)achtergrond gelegeerd, zoals de browser dat
     ook doet — zo verdwijnen de vals-negatieven van glow-lagen. */
  const layers = [];
  for (const prop of ['background', 'background-color']) {
    const hit = declaredFor(el, prop, rules, width, sheetMap);
    if (!hit) continue;
    const val = hit.d.val.replace(/!\s*important/g, '').trim();
    /* Eerst var()/color-mix oplossen, dán kleurstops lezen — anders grijpt de
       regex in 'var(--primary)' de fallback of niets. */
    const resolved = resolveValue(val, vars);
    if (!resolved) continue;
    const stops = [...resolved.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map(m => parseColor(m[0]));
    for (const c of stops) if (c && c.a > 0) layers.push(c);
  }
  const parent = el.parentElement
    ? effectiveBg(el.parentElement, rules, width, vars, sheetMap, depth + 1)
    : { color: { r: 255, g: 255, b: 255, a: 1 }, from: 'default wit' };
  if (!layers.length) return parent;
  let result = parent.color;
  for (const c of layers) result = compositeOver(c, result);
  return { color: result, from: layers.map(c => `${c.r},${c.g},${c.b}(${c.a})`).join(' > ') + ' ⇢ ' + parent.from };
}

/* ---------- auditdraaien ---------- */
const PAGES = (process.env.PAGES || '/').split(',');
const html = await (await fetch(BASE + PAGES[0])).text();
const dom = new JSDOM(html);
const doc = dom.window.document;

const sheetTexts = [];
for (const link of doc.querySelectorAll('link[rel="stylesheet"]')) {
  const href = link.getAttribute('href');
  try { sheetTexts.push({ name: href.split('/').pop().split('?')[0], text: await (await fetch(new URL(href, BASE + '/'))).text() }); } catch (e) {}
}
for (const style of doc.querySelectorAll('style')) sheetTexts.push({ name: 'inline', text: style.textContent });

let order = 0;
const rules = [];
const sheetMap = new Map();
for (const s of sheetTexts) {
  const parsed = parseCss(s.text);
  for (const r of parsed) { r.order = order++; sheetMap.set(r, s.name); }
  rules.push(...parsed);
}

/* var-kaarten per thema */
function buildVars(theme) {
  const vars = {};
  /* verzamel alle declaratieblokken met brace-matching over alle sheets heen */
  const blocks = [];
  for (const s of sheetTexts) {
    const text = s.text.replace(/\/\*[\s\S]*?\*\//g, '');
    let i = 0;
    while (i < text.length) {
      const brace = text.indexOf('{', i);
      if (brace === -1) break;
      const head = text.slice(i, brace).trim();
      let depth = 1, j = brace + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') depth--;
        j++;
      }
      if (!head.startsWith('@')) blocks.push({ head, body: text.slice(brace + 1, j - 1), sheet: s.name });
      i = j;
    }
  }
  const isDarkBlock = b => /\[data-theme="dark"\]|\.dark\b/.test(b.head);
  const isLightBlock = b => !isDarkBlock(b) && /(^|,)\s*(:root|html)\s*(,|$)/.test(b.head + ',');
  const ordered = theme === 'light'
    ? blocks.filter(isLightBlock)
    : blocks.filter(isLightBlock).concat(blocks.filter(isDarkBlock));
  for (const block of ordered) {
    for (const d of block.body.split(';')) {
      const idx = d.indexOf(':');
      if (idx === -1) continue;
      const name = d.slice(0, idx).trim();
      if (!name.startsWith('--')) continue;
      vars[name] = d.slice(idx + 1).trim();
    }
  }
  return vars;
}

const TARGETS = [
  ['#account-btn', 'header · Inloggen', 3.0],
  ['.theme-toggle-btn', 'header · themaknop', 3.0],
  ['.menu-btn', 'header · burgerknop', 3.0],
  ['.btn-airbnb-search', 'hero · Zoeken-knop', 4.5],
  ['.btn-geo-quick', 'hero · GPS-knop', 3.0],
  ['.segment-label', 'hero · zoekveld-label', 4.5],
  ['.hero-subtitle', 'hero · subtitel', 4.5],
  ['.nav-pill', 'header · nav-pill', 4.5],
  ['.hub-pill', 'hub-navigatie · pill', 4.5],
  ['#back-to-top', 'floating · naar boven', 3.0],
  ['.home-newsletter-form button', 'nieuwsbrief · aanmelden', 4.5],
  ['.home-newsletter-form input', 'nieuwsbrief · invoerveld', 4.5],
  ['.world-kicker', 'wereldkaart · kicker', 4.5],
  ['.world-cta', 'wereldkaart · cta-tekst', 4.5],
  ['.badge-amber', 'badge · amber', 4.5],
  ['.stat-box span', 'stats · label', 4.5],
  ['.footer-trust span', 'footer · trust', 4.5],
  ['.footer-positioning p', 'footer · positionering', 4.5],
  ['.footer-bottom', 'footer · onderregel', 4.5],
  ['.btn-outline', 'algemeen · btn-outline', 4.5],
  ['.announce-text', 'aankondigingsbalk', 4.5],
  ['.announce-link', 'aankondigingsbalk · link', 4.5],
  ['.mobile-action-bar a', 'mobiel · actiebalk', 4.5],
  ['.founder-copy .section-subtitle', 'over-trimgids · tekst', 4.5],
  ['.founder-baasjes p', 'over-trimgids · voor-baasjes tekst', 4.5],
  ['.baasjes-verder', 'over-trimgids · lees-verder link', 4.5]
];

let failed = 0;
const report = [];
for (const vp of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    const vars = buildVars(theme);
    doc.documentElement.setAttribute('data-theme', theme);
    for (const [sel, label, min] of TARGETS) {
      const el = doc.querySelector(sel);
      if (!el) { report.push(`  ?  ${vp.name}/${theme} ${label}: element niet gevonden (${sel})`); continue; }
      const fgHit = inheritedColor(el, 'color', rules, vp.width, vars, sheetMap);
      const bgHit = effectiveBg(el, rules, vp.width, vars, sheetMap);
      if (!fgHit) { report.push(`  ?  ${vp.name}/${theme} ${label}: kleur niet te herleiden (${sel})`); continue; }
      const r = ratio(fgHit.color, bgHit.color);
      const pass = r >= min;
      if (!pass) failed++;
      report.push(`  ${pass ? '✓' : '✗'}  ${vp.name}/${theme} ${label}: ${r.toFixed(2)}:1 (min ${min}) — fg=${fgHit.color.r},${fgHit.color.g},${fgHit.color.b} op bg=${bgHit.color.r},${bgHit.color.g},${bgHit.color.b} [${bgHit.from}]`);
    }
  }
}
console.log(report.join('\n'));
console.log(failed ? `\nCONTRAST-AUDIT: ${failed} combinatie(s) ONDER de grens` : '\nCONTRAST-AUDIT: alles boven de grens');
process.exit(failed ? 1 : 0);
