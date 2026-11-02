// Guarda la app en el dispositivo para que abra rápido y funcione sin internet.
const CACHE = 'mi-agenda-v2';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Archivos de la app: primero internet (para tener siempre la última versión), si no hay, la copia guardada.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
        return r;
      }).catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req).then(hit => hit || caches.match('index.html')))
    );
    return;
  }
  // Fuentes y la librería de Supabase: la copia guardada (no cambian).
  if (CDN.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    })));
  }
  // Lo demás (por ejemplo, Supabase) va directo a internet, sin guardar copias viejas.
});
