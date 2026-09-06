/* TrimGids Service Worker — offline-first voor static assets, netwerk-first voor HTML/API's */
const VERSION = 'trimgids-v3';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const PRECACHE = [
  '/', '/manifest.webmanifest', '/logo.svg', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/icon-180.png',
  '/assets/img/hero-640.webp', '/assets/img/hero-1200.webp', '/assets/img/hero-1600.webp', '/assets/img/og.jpg',
  '/assets/img/cat-trimsalon-480.webp', '/assets/img/cat-trimsalon-960.webp',
  '/assets/img/cat-school-480.webp', '/assets/img/cat-school-960.webp',
  '/assets/img/cat-opvang-480.webp', '/assets/img/cat-opvang-960.webp',
  '/assets/img/cat-wellness-480.webp', '/assets/img/cat-wellness-960.webp',
  '/assets/img/cat-wandelen-480.webp', '/assets/img/cat-wandelen-960.webp',
  '/assets/img/cat-strand-480.webp', '/assets/img/cat-strand-960.webp',
  '/assets/img/pomeriaan-320.webp', '/assets/img/pomeriaan-640.webp', '/assets/img/pomeriaan-hondzien.webp',
  '/assets/js/nl-map.js', '/assets/js/forum.js', '/assets/css/nl-map.css', '/assets/css/forum.css'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    /* API's: netwerk eerst, cache als fallback + stale-while-revalidate */
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    /* HTML: netwerk eerst, fallback naar cache of homepage */
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(hit => hit || caches.match('/')))
    );
    return;
  }
  /* Statische assets (svgs, pngs, webmanifest): cache-first */
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
