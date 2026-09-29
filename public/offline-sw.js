const CACHE_NAME = 'changsha-trip-offline-v4';
const OFFLINE_URL = new URL('./offline.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('changsha-trip-offline-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate' || new URL(event.request.url).pathname !== new URL(OFFLINE_URL).pathname) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, copy)));
        }
        return response;
      })
      .catch(async () => (await caches.match(OFFLINE_URL)) || new Response('离线页面尚未缓存，请联网打开一次。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })),
  );
});
