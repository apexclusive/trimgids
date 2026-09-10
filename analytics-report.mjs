import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = async name => JSON.parse(await fs.readFile(path.join(root, 'data', name), 'utf8'));
const events = await readJson('analytics-events.json');
const vitals = await readJson('web-vitals.json');
const count = name => events.filter(item => item.event === name).length;
const conversion = (from, to) => count(from) ? Number((count(to) / count(from)).toFixed(4)) : null;
const finite = values => values.filter(value => Number.isFinite(value));
const median = values => {
  const sorted = [...finite(values)].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
};
const report = {
  generatedBy: 'analytics-report.mjs',
  privacy: { identifiersStored: false, freeTextStored: false, cookieRequired: false },
  sample: { events: events.length, webVitals: vitals.length },
  events: Object.fromEntries([...new Set(events.map(item => item.event))].sort().map(name => [name, count(name)])),
  funnel: {
    searchToResult: conversion('search_started', 'search_completed'),
    resultToClick: conversion('search_completed', 'search_result_clicked'),
    quoteStartToComplete: conversion('quote_started', 'quote_completed'),
    newsletterStartToComplete: conversion('newsletter_started', 'newsletter_completed'),
    providerViewToContact: conversion('provider_viewed', 'provider_contacted')
  },
  webVitals: {
    sample: vitals.length,
    medianLcpMs: median(vitals.map(item => item.lcp)),
    medianInpMs: median(vitals.map(item => item.inp)),
    medianCls: median(vitals.map(item => item.cls)),
    medianTtfbMs: median(vitals.map(item => item.ttfb)),
    budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1, ttfbMs: 800 }
  },
  nextActions: events.length < 100 ? ['Verzamel minimaal 100 events per funnel voordat conversies worden geïnterpreteerd.'] : []
};
await fs.mkdir(path.join(root, 'audit'), { recursive: true });
await fs.writeFile(path.join(root, 'audit', 'analytics-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Analytics report written: ${events.length} events, ${vitals.length} web-vitals samples`);
