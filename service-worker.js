const CACHE_NAME = 'velonics-cache-v1';
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener('install', event => {
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
  // Serve cached assets when available; otherwise fetch from the network.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found.
        if (response) {
          return response;
        }
        // Otherwise, fetch from network.
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(networkResponse => {
          // Check if the response is valid.
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // Cache the network response.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        });
      })
  );
});
