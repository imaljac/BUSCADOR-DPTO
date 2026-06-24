// Service Worker — siempre busca versión nueva del HTML en la red
const CACHE = "mudanza-v2";
const STATIC = ["/MUDANZA/manifest.json", "/MUDANZA/icon-192.png", "/MUDANZA/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting(); // activa inmediatamente sin esperar
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // toma control de todas las pestañas abiertas
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // HTML — siempre desde la red, nunca desde caché
  if (url.pathname.endsWith(".html") || url.pathname.endsWith("/MUDANZA/") || url.pathname === "/MUDANZA") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Otros assets — caché primero, red como fallback
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
