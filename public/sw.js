/**
 * Nur AI Quran Tutor - Service Worker (Offline PWA & Qari Audio Cache)
 * Enables offline recitation, cached Quranic Uthmani text, and background sync.
 */

const CACHE_NAME = "nur-quran-pwa-v1";
const AUDIO_CACHE = "nur-audio-cache-v1";

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

  // Bypass localhost & development traffic directly
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // 1. Audio Cache (EveryAyah or Quran Audio CDNs)
  if (url.pathname.endsWith(".mp3") || url.hostname.includes("everyayah.com")) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return new Response(null, { status: 504, statusText: "Offline Audio Unavailable" });
        }
      })
    );
    return;
  }

  // 2. Static Assets & Pages (Stale-While-Revalidate)
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
