/**
 * Unified Universal Quran Audio Infrastructure - Bounded LRU Cache & Request Deduplicator
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Provides bounded in-memory caching of HTMLAudioElement instances, request deduplication,
 * and safe resource eviction to prevent memory bloat and duplicate network traffic.
 */

import { AUDIO_CONFIG } from "./AudioConfig.js";
import { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";

class AudioLRUCache {
  constructor(maxEntries = AUDIO_CONFIG.MAX_IN_MEMORY_AUDIO_INSTANCES) {
    this.maxEntries = maxEntries;
    this.cache = new Map(); // url -> { audio: HTMLAudioElement, lastAccessed: number, hitCount: number }
    this.inFlightRequests = new Map(); // url -> Promise<HTMLAudioElement>
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      inFlightDeduplications: 0,
    };
  }

  /**
   * Check if an audio URL is already loaded and ready in cache
   * @param {string} url
   * @returns {boolean}
   */
  has(url) {
    return this.cache.has(url);
  }

  /**
   * Retrieve cached HTMLAudioElement or create and cache a new one.
   * If an in-flight fetch/creation is already in progress for this URL, reuses the promise.
   * @param {string} url
   * @param {Object} [options]
   * @returns {HTMLAudioElement|null}
   */
  getOrCreate(url, options = {}) {
    if (typeof window === "undefined" || !url) return null;

    // Cache Hit
    if (this.cache.has(url)) {
      const entry = this.cache.get(url);
      entry.lastAccessed = Date.now();
      entry.hitCount += 1;
      this.stats.hits += 1;

      // Move to back (most recently used in Map)
      this.cache.delete(url);
      this.cache.set(url, entry);

      audioEvents.emit(AUDIO_EVENTS.CACHE_HIT, { url, hits: entry.hitCount });

      const audio = entry.audio;
      try {
        audio.currentTime = 0;
        if (options.volume !== undefined) audio.volume = options.volume;
        if (options.rate !== undefined) audio.playbackRate = options.rate;
      } catch {}
      return audio;
    }

    // Cache Miss
    this.stats.misses += 1;
    audioEvents.emit(AUDIO_EVENTS.CACHE_MISS, { url });

    // Evict oldest if reaching capacity limit
    this.evictIfNecessary();

    // Create new Audio instance
    const audio = new Audio();
    audio.preload = options.preload || "auto";
    if (options.volume !== undefined) audio.volume = options.volume;
    if (options.rate !== undefined) audio.playbackRate = options.rate;
    audio.src = url;

    this.cache.set(url, {
      audio,
      lastAccessed: Date.now(),
      hitCount: 0,
    });

    return audio;
  }

  /**
   * Preload an audio URL in background safely without blocking
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  async preload(url) {
    if (typeof window === "undefined" || !url) return false;
    if (this.cache.has(url)) return true;

    // Deduplicate in-flight preload requests
    if (this.inFlightRequests.has(url)) {
      this.stats.inFlightDeduplications += 1;
      return this.inFlightRequests.get(url);
    }

    const promise = new Promise((resolve) => {
      try {
        const audio = this.getOrCreate(url, { preload: "auto" });
        if (!audio) {
          resolve(false);
          return;
        }

        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onReady);
          audio.removeEventListener("error", onError);
          this.inFlightRequests.delete(url);
        };

        const onReady = () => {
          cleanup();
          resolve(true);
        };

        const onError = () => {
          cleanup();
          resolve(false);
        };

        if (audio.readyState >= 3) {
          this.inFlightRequests.delete(url);
          resolve(true);
          return;
        }

        audio.addEventListener("canplaythrough", onReady, { once: true });
        audio.addEventListener("error", onError, { once: true });

        // Safety timeout to prevent hanging promises
        setTimeout(() => {
          cleanup();
          resolve(false);
        }, AUDIO_CONFIG.AUDIO_LOAD_TIMEOUT_MS);
      } catch {
        this.inFlightRequests.delete(url);
        resolve(false);
      }
    });

    this.inFlightRequests.set(url, promise);
    return promise;
  }

  /**
   * Check if an audio URL is currently in flight (loading/buffering)
   * @param {string} url
   * @returns {boolean}
   */
  isInFlight(url) {
    return this.inFlightRequests.has(url);
  }

  /**
   * Evict the least recently used entry if exceeding max capacity
   */
  evictIfNecessary() {
    if (this.cache.size < this.maxEntries) return;

    // Map preserves insertion order; first entry is the oldest
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.evict(oldestKey);
    }
  }

  /**
   * Evict a specific URL and release browser memory
   * @param {string} url
   */
  evict(url) {
    const entry = this.cache.get(url);
    if (!entry) return;

    try {
      const audio = entry.audio;
      audio.pause();
      audio.removeAttribute("src");
      audio.load(); // Forces browser to free decoding buffers immediately
    } catch {}

    this.cache.delete(url);
    this.stats.evictions += 1;
  }

  /**
   * Clear all cached audio instances and reset statistics
   */
  clear() {
    this.cache.forEach((entry) => {
      try {
        entry.audio.pause();
        entry.audio.removeAttribute("src");
        entry.audio.load();
      } catch {}
    });
    this.cache.clear();
    this.inFlightRequests.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      inFlightDeduplications: 0,
    };
  }

  /**
   * Get current cache performance statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate.toFixed(1)}%`,
      evictions: this.stats.evictions,
      inFlightDeduplications: this.stats.inFlightDeduplications,
    };
  }
}

export const audioCache = new AudioLRUCache();
export default audioCache;

