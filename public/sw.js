/**
 * Nur AI Quran Tutor - Service Worker (Offline PWA & Qari Audio Cache)
 * Enables offline recitation, cached Quranic Uthmani text, and background sync.
 */

const CACHE_NAME = "nur-quran-pwa-v2";
const AUDIO_CACHE = "nur-audio-cache-v2";

const STATIC_PRECACHE = [
  "/",
  "/quran-tutor",
  "/quran-tutor/studio",
  "/favicon.png",
  "/rahmania-logo-navbar.png",
  "/manifest.json"
];

// Install Event: Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== AUDIO_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass non-HTTP schemes (e.g. chrome-extension, data, blob)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Bypass localhost & development traffic directly
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // Bypass all API endpoints & external domains (never intercept dynamic APIs in service worker)
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) {
    return;
  }

  // 1. Audio Cache (EveryAyah or Quran Audio CDNs)
  if (url.pathname.endsWith(".mp3") || url.hostname.includes("everyayah.com")) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(AUDIO_CACHE);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse || new Response(null, { status: 404, statusText: "Audio Not Found" });
        } catch {
          return new Response(null, { status: 504, statusText: "Offline Audio Unavailable" });
        }
      })()
    );
    return;
  }

  // 2. Static Assets & Pages (Stale-While-Revalidate with guaranteed Response return)
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        try {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            // Revalidate in background
            fetch(event.request)
              .then(async (networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                  const cache = await caches.open(CACHE_NAME);
                  await cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => {});
            return cachedResponse;
          }

          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse || new Response("Not Found", { status: 404 });
        } catch (err) {
          const cachedFallback = await caches.match(event.request);
          if (cachedFallback) return cachedFallback;
          return new Response("Offline network error", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })()
    );
  }
});
