import { promises as fs } from 'node:fs';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:3000';
const root = process.cwd();
const routes = JSON.parse(await fs.readFile(path.join(root, 'audit', 'route-health.json'), 'utf8')).map(item => item.route);
const links = new Map();
const skip = href => !href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:|https?:\/\/)/i.test(href);
for (const route of routes) {
  const html = await (await fetch(base + route)).text();
  for (const match of html.matchAll(/<(?:a|link|script|img|source)[^>]+(?:href|src|imagesrcset)=["']([^"']+)["']/gi)) {
    const href = match[1].split(/[?#]/)[0];
    if (skip(href) || href.startsWith('/api/')) continue;
    links.set(href, (links.get(href) || new Set()).add(route));
  }
}
const results = [];
for (const [href, sources] of links) {
  const response = await fetch(base + href, { method: 'HEAD', redirect: 'manual' });
  results.push({ href, status: response.status, sources: [...sources].slice(0, 5), ok: response.status >= 200 && response.status < 400 });
}
const broken = results.filter(item => !item.ok);
const report = { checked: results.length, broken: broken.length, results, rule: 'Interne links moeten 2xx of een bewuste 3xx redirect geven.' };
await fs.writeFile(path.join(root, 'audit', 'link-audit.json'), JSON.stringify(report, null, 2) + '\n');
if (broken.length) {
  console.error(`Link audit failed: ${broken.length} broken links`);
  for (const item of broken.slice(0, 30)) console.error(`- ${item.href}: ${item.status}`);
  process.exitCode = 1;
} else console.log(`Link audit passed: ${results.length} interne links gecontroleerd`);
