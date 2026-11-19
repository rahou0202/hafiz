// offline support: app page network-first, Quran text and fonts cache-first
const APP = 'hifz-app-mwnn456s', DATA = 'hifz-data-v1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(APP).then((c) => c.addAll(['./', 'index.html', 'manifest.webmanifest', 'icon-192.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== APP && k !== DATA).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.hostname === 'api.alquran.cloud' || u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(DATA).then(async (c) => { const hit = await c.match(e.request); if (hit) return hit; const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }));
  } else if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(APP).then((c) => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
  }
});
