import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const experiments = JSON.parse(await fs.readFile(path.join(root, 'data', 'experiments.json'), 'utf8'));
const required = ['id', 'status', 'hypothesis', 'audience', 'variantA', 'variantB', 'primaryMetric', 'secondaryMetrics', 'minimumSampleSize', 'durationDays', 'stopRule'];
const allowedStatuses = new Set(['planned', 'running', 'paused', 'completed']);
const errors = [];
const ids = new Set();
for (const experiment of experiments) {
  for (const field of required) if (experiment[field] === undefined || experiment[field] === '') errors.push(`${experiment.id || '(zonder id)'}: ontbrekend ${field}`);
  if (ids.has(experiment.id)) errors.push(`${experiment.id}: dubbele id`);
  ids.add(experiment.id);
  if (!allowedStatuses.has(experiment.status)) errors.push(`${experiment.id}: ongeldige status`);
  if (!Number.isInteger(experiment.minimumSampleSize) || experiment.minimumSampleSize < 100) errors.push(`${experiment.id}: minimumSampleSize moet minimaal 100 zijn`);
  if (!Number.isInteger(experiment.durationDays) || experiment.durationDays < 7) errors.push(`${experiment.id}: durationDays moet minimaal 7 zijn`);
  if (!Array.isArray(experiment.secondaryMetrics)) errors.push(`${experiment.id}: secondaryMetrics moet een array zijn`);
}
const report = { experiments: experiments.length, statuses: Object.fromEntries([...allowedStatuses].map(status => [status, experiments.filter(item => item.status === status).length])), errors, rule: 'Geen experiment starten zonder hypothese, primaire metric, stopregel en minimale steekproef.' };
await fs.mkdir(path.join(root, 'audit'), { recursive: true });
await fs.writeFile(path.join(root, 'audit', 'experiment-audit.json'), JSON.stringify(report, null, 2) + '\n');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Experiment audit passed: ${experiments.length} experimenten gecontroleerd`);
