const CACHE = "vr-cache-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/style.css",
  "/js/app.js",
  "/js/db.js",
  "/js/auth.js",
  "/js/scoring.js",
  "/js/utils.js",
  "/js/ui.js",
  "/js/dashboard.js",
  "/js/export.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // Network-first for HTML
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("/index.html")))
    );
    return;
  }

  // Cache-first for others
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      })
    )
  );
});
