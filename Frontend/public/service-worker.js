const CACHE_NAME = "quiz-app-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 🔹 Install: cache basic static files
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔹 Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🔹 Fetch: handle requests safely
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚫 1. Skip API calls completely
  if (url.pathname.startsWith("/api")) {
    return;
  }

  // 🚫 2. Skip non-GET requests (POST, PUT, DELETE)
  if (event.request.method !== "GET") {
    return;
  }

  // 🚫 3. Skip Vite dev assets and JS/CSS modules to prevent stale React copies
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".jsx") ||
    url.pathname.endsWith(".ts") ||
    url.pathname.endsWith(".tsx") ||
    url.pathname.endsWith(".css") ||
    url.pathname.includes("node_modules") ||
    url.pathname.includes("@vite") ||
    url.pathname.includes("__vite") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/@") ||
    url.search.includes("t=")
  ) {
    return;
  }

  // ✅ 3. Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Clone response before caching
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional fallback (offline)
          return caches.match("/index.html");
        });
    })
  );
});