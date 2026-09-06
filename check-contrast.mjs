/* WCAG 2.1 contrastcheck voor de hero (licht + donker).
   Simuleert de gemiddelde hero-achtergrond = overlay-blend over de foto
   (worst case: donkere foto #1d3a2a en felle foto #d8ede2). */
const lum = ([r, g, b]) => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const blend = (a, b, alpha) => a.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)));
const ratio = (c1, c2) => {
  const l1 = lum(c1), l2 = lum(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const parse = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

const light = { fg: parse('#334155'), scrim: [248, 250, 252], alpha: 0.66 };
const dark = { fg: parse('#e2f0e8'), scrim: [4, 20, 13], alpha: 0.68 };
const photoWorst = [29, 58, 42];   // donkere groene foto
const photoLight = [216, 237, 226]; // felle foto

let failed = 0;
for (const [name, t] of [['licht thema', light], ['donker thema', dark]]) {
  for (const [photo, label] of [[photoWorst, 'donkere foto'], [photoLight, 'felle foto']]) {
    const bg = blend(t.scrim, photo, t.alpha);
    const r = ratio(t.fg, bg).toFixed(2);
    const pass = +r >= 4.5;
    console.log(`${name} · ${label}: contrast ${r}:1 ${pass ? '✓ (AA)' : '✗ (onder 4.5)'}  bg=${bg.join(',')}`);
    if (!pass) failed++;
  }
}
console.log(failed ? `\n${failed} combinatie(s) onder WCAG AA` : '\nAlle hero-tekstcombinaties ≥ 4.5:1 (WCAG AA)');
process.exit(failed ? 1 : 0);
