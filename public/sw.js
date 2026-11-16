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

// Install Event: Pre-cache core shell safely item by item
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const item of STATIC_PRECACHE) {
        try {
          await cache.add(item);
        } catch (err) {
          console.warn("PWA pre-cache item warning:", item, err);
        }
      }
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

// Fetch Event: Cache strategies with robust offline support
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass non-HTTP schemes (e.g. chrome-extension, data, blob)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Completely bypass service worker on localhost / dev environments
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".local")) {
    return;
  }

  // Bypass Next.js hot module reloading on localhost during dev
  if (url.pathname.includes("/_next/webpack-hmr")) {
    return;
  }

  // 1. Audio Cache Strategy: EveryAyah, QuranCDN, and jsDelivr audio tracks
  const isAudioTrack =
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".m4a") ||
    url.hostname.includes("everyayah.com") ||
    url.hostname.includes("audio.qurancdn.com") ||
    (url.hostname.includes("jsdelivr.net") && url.pathname.includes("/sounds/"));

  if (isAudioTrack) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(AUDIO_CACHE);
          const cachedResponse = await cache.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fetch with cors mode to allow cross-origin caching
          const networkResponse = await fetch(event.request, { mode: "cors" }).catch(() => null);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
            cache.put(event.request, networkResponse.clone()).catch(() => {});
            return networkResponse;
          }

          if (networkResponse) return networkResponse;

          // Offline fallback from cache with relaxed matching
          const fallback = await cache.match(url.pathname, { ignoreSearch: true });
          if (fallback) return fallback;

          return new Response(null, { status: 504, statusText: "Offline Audio Unavailable" });
        } catch {
          const cache = await caches.open(AUDIO_CACHE);
          const fallback = await cache.match(event.request, { ignoreSearch: true });
          if (fallback) return fallback;
          return new Response(null, { status: 504, statusText: "Offline Audio Unavailable" });
        }
      })()
    );
    return;
  }

  // 2. QuranCDN Segments Cache (Offline Word-by-Word Highlighting)
  if (url.hostname.includes("api.qurancdn.com") && url.pathname.includes("/audio_files")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res && res.status === 200) {
            cache.put(event.request, res.clone()).catch(() => {});
          }
          return res;
        } catch {
          return cached || new Response(JSON.stringify({ audio_files: [] }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      })()
    );
    return;
  }

  // 3. Bypass dynamic Next.js internal APIs (never intercept auth/mutation APIs)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 4. Bypass other third-party origins
  if (url.origin !== self.location.origin) {
    return;
  }

  // 5. Static Assets & Pages (Stale-While-Revalidate with App Shell Navigation Fallback)
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        try {
          const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            // Revalidate in background
            fetch(event.request)
              .then(async (networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  const cache = await caches.open(CACHE_NAME);
                  await cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => {});
            return cachedResponse;
          }

          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse || new Response("Not Found", { status: 404 });
        } catch (err) {
          const cachedFallback = await caches.match(event.request, { ignoreSearch: true });
          if (cachedFallback) return cachedFallback;

          // NAVIGATION FALLBACK: Return cached App Shell for any HTML navigation request!
          if (event.request.mode === "navigate") {
            const shell = (await caches.match("/quran-tutor/studio")) || (await caches.match("/"));
            if (shell) return shell;
          }

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
