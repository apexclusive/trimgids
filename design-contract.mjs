import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = process.env.BASE_URL || 'http://localhost:3000';
const routes = ['/', '/trimsalon', '/kaart', '/verzekering', '/wandelen', '/opvang', '/forum', '/puppies', '/hondenbelasting', '/trimkosten', '/nieuws', '/webshop', '/bedrijven', '/zoek'];
const report = { breakpoints: [320, 375, 430, 768, 1024, 1280, 1440], routes: [], rules: { maxPrimaryActionsPerViewport: 1, maxCardVariants: 3, sharedShellRequired: true, statusMessagesMustBeLive: true } };
const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
for (const route of routes) {
  const html = await (await fetch(base + route)).text();
  const formStatus = [...html.matchAll(/<(?:p|span)[^>]+class=["'][^"']*status-msg[^"']*["'][^>]*>/gi)].map(match => match[0]);
  const inlineStyles = (html.match(/\sstyle=["']/gi) || []).length;
  const cards = new Set([...html.matchAll(/class=["'][^"']*(?:card|provider|tip-box|step-card|news-card|stat-card)[^"']*["']/gi)].map(match => match[0].replace(/class=["']|["']/g, '').split(/\s+/).filter(Boolean).find(name => /card|provider|tip-box|step-card|news-card|stat-card/.test(name))));
  const primaryActions = (html.match(/class=["'][^"']*(?:btn-primary|btn-submit)[^"']*["']/gi) || []).length;
  report.routes.push({ route, sharedShell: html.includes('id="tg-site-nav"'), h1: (html.match(/<h1\b/gi) || []).length, inlineStyles, cardVariants: cards.size, primaryActions, emojiPresent: emoji.test(html), liveStatusMessages: formStatus.length === 0 || formStatus.every(tag => /role=["']status|aria-live=["']/i.test(tag)) });
}
report.summary = {
  routesChecked: report.routes.length,
  shellFailures: report.routes.filter(item => !item.sharedShell).length,
  multipleH1: report.routes.filter(item => item.h1 !== 1).length,
  statusFailures: report.routes.filter(item => !item.liveStatusMessages).length,
  routesWithInlineStyles: report.routes.filter(item => item.inlineStyles > 0).length,
  routesWithEmoji: report.routes.filter(item => item.emojiPresent).length,
  cardVariantWarnings: report.routes.filter(item => item.cardVariants > 3).length,
  primaryActionWarnings: report.routes.filter(item => item.primaryActions > 1).length
};
await fs.mkdir(path.join(root, 'audit'), { recursive: true });
await fs.writeFile(path.join(root, 'audit', 'design-contract.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Design contract written: ${report.summary.routesChecked} routes, ${report.summary.shellFailures} shell failures, ${report.summary.statusFailures} status failures`);
