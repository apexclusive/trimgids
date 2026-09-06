/* Crawl alle URLs uit /sitemap.xml + kernroutes; meld niet-200 en ontbrekende essentials. */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const sitemap = await (await fetch(BASE + '/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(new RegExp('^https?://[^/]+'), ''));
const extra = ['/verzekering', '/webshop', '/wandelen', '/nieuws', '/forum', '/kaart', '/kosten-hond', '/trimsalon'];
const all = [...new Set([...urls, ...extra])];
console.log(`Sitemap: ${urls.length} URLs, totaal te checken: ${all.length}`);

let ok = 0, broken = [];
for (const path of all) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    if (res.status === 200 || res.status === 304) ok++;
    else broken.push(`${path} -> ${res.status}`);
  } catch (e) { broken.push(`${path} -> ${e.message}`); }
}
console.log(`OK: ${ok}, broken: ${broken.length}`);
if (broken.length) { console.log(broken.join('\n')); process.exit(1); }
console.log('CRAWL GROEN');
