const CACHE_NAME = 'velonics-cache-v2';
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-512x512.png",
];

self.addEventListener('install', event => {
  // Activate this version immediately instead of waiting for all tabs to close.
  self.skipWaiting();
  // Cache all defined assets during the install step.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Take control of any already-open tabs right away.
  event.waitUntil(clients.claim());
  // Clean up old caches.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Network-first: always try to fetch the latest version so app updates
  // (e.g. index.html) reach the installed PWA. Fall back to cache when offline.
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
