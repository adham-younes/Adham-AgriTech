const CACHE_NAME = 'adham-agritech-v1.0.0';
const urlsToCache = [
  '/AdhamAgriTech-WebApp.html',
  '/index.html',
  '/enhanced-demo.html',
  '/ndvi-analyzer.html',
  '/apis-integration.html',
  '/smart-alerts.html',
  '/demo.html',
  '/api-demo.html',
  '/app.manifest',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});