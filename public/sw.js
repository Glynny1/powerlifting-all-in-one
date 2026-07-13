/*
 * Minimal, resilient service worker.
 * Strategy:
 *  - Navigation requests: network-first, fall back to cached app shell (offline SPA support).
 *  - Same-origin GET assets: stale-while-revalidate.
 * Kept intentionally small so it can never break the core app; on any error it
 * simply falls through to the network.
 *
 * Base-aware: all paths are derived from the service worker's own location, so
 * this works whether the app is served from '/' (Vercel) or '/<repo>/' (GitHub
 * Pages project sites).
 */
const CACHE = 'plwu-cache-v1';
// Directory the SW is served from, e.g. '/' or '/repo/'.
const BASE = new URL('./', self.location.href).pathname;
const APP_SHELL = BASE + 'index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([BASE, APP_SHELL, BASE + 'manifest.webmanifest', BASE + 'icon.svg']))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(APP_SHELL, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(APP_SHELL).then((r) => r || caches.match(BASE)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
