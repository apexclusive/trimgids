const baseUrl = process.env.BASE_URL || 'http://localhost:3025';
const concurrency = Number(process.env.CONCURRENCY || 25);
const requestsPerWorker = Number(process.env.REQUESTS || 8);
const paths = [
  '/',
  '/api/stats',
  '/api/home',
  '/api/cities',
  '/api/news',
  '/api/routes',
  '/api/providers?lite=1',
  '/api/insurance',
  '/trimsalon/maastricht',
  '/kaart',
  '/reizen',
  '/hondenweetjes',
  '/rassen',
  '/hitteberoerte-hond',
  '/webshop',
  '/hond-en-werk'
];

const runWorker = async workerId => {
  const results = [];
  for (let index = 0; index < requestsPerWorker; index += 1) {
    const path = paths[(workerId + index) % paths.length];
    const started = performance.now();
    try {
      const response = await fetch(baseUrl + path);
      await response.arrayBuffer();
      results.push({ path, status: response.status, duration: performance.now() - started });
    } catch (error) {
      results.push({ path, status: 0, duration: performance.now() - started, error: error.message });
    }
  }
  return results;
};

const started = performance.now();
const batches = await Promise.all(Array.from({ length: concurrency }, (_, workerId) => runWorker(workerId)));
const results = batches.flat();
const failed = results.filter(result => result.status !== 200 && result.status !== 304);
const durations = results.map(result => result.duration).sort((a, b) => a - b);
const percentile = value => durations[Math.min(durations.length - 1, Math.floor(durations.length * value))] || 0;

console.log(JSON.stringify({
  baseUrl,
  requests: results.length,
  concurrency,
  elapsedMs: Math.round(performance.now() - started),
  failed: failed.length,
  p50Ms: Math.round(percentile(.5)),
  p95Ms: Math.round(percentile(.95)),
  maxMs: Math.round(durations.at(-1) || 0)
}, null, 2));

if (failed.length) {
  console.error(failed.slice(0, 5));
  process.exitCode = 1;
}
