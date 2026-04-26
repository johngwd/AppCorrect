const CACHE_NAME = 'appcorrect-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/pwa-192.svg', '/pwa-512.svg'];

// Installe le cache minimal pour rendre l'application consultable hors ligne apres le premier chargement.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Nettoie les anciens caches lorsque la version de l'application change.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

// Sert les ressources depuis le cache quand le reseau n'est pas disponible.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('/'))),
  );
});
