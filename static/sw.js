/**
 * Service Worker — A Guide to Cloud & AI
 * Strategy: cache versioned static assets only, network-first for everything else.
 * Does NOT cache /data/*, /api/*, or HTML pages to avoid stale content.
 */

var CACHE_NAME = 'agtc-v1';

// Precache essential shell assets (updated on deploy via cache_version)
var PRECACHE_URLS = [
  '/favicon.svg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// Install: precache shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first for versioned static assets, network-only for everything else
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip: API routes, data files — always network
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/data/')) {
    return;
  }

  // Only cache assets with explicit version param (?v=...) to avoid stale content
  if (isStaticAsset(url.pathname) && url.search.includes('v=')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (HTML, unversioned assets, Pagefind): network-only
});

function isStaticAsset(pathname) {
  return /\.(css|js|woff2?|ttf|eot|png|jpg|jpeg|webp|svg|ico|gif)(\?|$)/.test(pathname);
}
