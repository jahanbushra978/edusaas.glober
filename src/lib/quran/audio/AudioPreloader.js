/**
 * Unified Universal Quran Audio Infrastructure - Smart Predictive Preloader
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Non-blocking, concurrency-limited predictive preloading for subsequent lesson assets,
 * next Ayahs, and consecutive letters without blocking UI rendering or hogging network bandwidth.
 */

import { AUDIO_CONFIG } from "./AudioConfig.js";
import { audioCache } from "./AudioCache.js";
import { resolveLetterAudio, resolveAyahAudio, resolveArabicSoundAudio } from "./AudioSourceRegistry.js";

class AudioPreloader {
  constructor() {
    this.preloadQueue = [];
    this.activeWorkers = 0;
    this.maxWorkers = AUDIO_CONFIG.PRELOAD_CONCURRENCY_LIMIT;
    this.preloadedUrls = new Set();
  }

  /**
   * Preload an array of candidate URLs or educational asset identifiers
   * @param {string|string[]|Object} target
   */
  preload(target) {
    if (typeof window === "undefined" || !target) return;

    if (Array.isArray(target)) {
      target.slice(0, AUDIO_CONFIG.MAX_PRELOAD_ITEMS).forEach((item) => this.preload(item));
      return;
    }

    let urlToPreload = null;

    if (typeof target === "string") {
      if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("/")) {
        urlToPreload = target;
      } else {
        // Assume Arabic letter or text
        const resolved = resolveArabicSoundAudio(target);
        if (resolved.found && resolved.urls && resolved.urls.length > 0) {
          urlToPreload = Array.isArray(resolved.urls[0]) ? resolved.urls[0][0] : resolved.urls[0];
        }
      }
    } else if (target && typeof target === "object") {
      if (target.surahNumber && target.ayahNumber) {
        const resolved = resolveAyahAudio(target.surahNumber, target.ayahNumber, target.qariId);
        if (resolved.found && resolved.urls.length > 0) {
          urlToPreload = resolved.urls[0];
        }
      } else if (target.letter) {
        const resolved = resolveLetterAudio(target.letter);
        if (resolved.found && resolved.urls.length > 0) {
          urlToPreload = resolved.urls[0];
        }
      } else if (target.url) {
        urlToPreload = target.url;
      }
    }

    if (!urlToPreload || this.preloadedUrls.has(urlToPreload) || audioCache.has(urlToPreload)) {
      return;
    }

    this.preloadQueue.push(urlToPreload);
    this.processQueue();
  }

  /**
   * Process background preload queue with strict concurrency limit
   */
  processQueue() {
    if (this.activeWorkers >= this.maxWorkers || this.preloadQueue.length === 0) {
      return;
    }

    const nextUrl = this.preloadQueue.shift();
    if (!nextUrl || this.preloadedUrls.has(nextUrl)) {
      this.processQueue();
      return;
    }

    this.activeWorkers += 1;
    this.preloadedUrls.add(nextUrl);

    audioCache
      .preload(nextUrl)
      .catch(() => {})
      .finally(() => {
        this.activeWorkers = Math.max(0, this.activeWorkers - 1);
        // Process next after small microtask tick to let UI breathe
        setTimeout(() => this.processQueue(), 50);
      });
  }

  /**
   * Clear preloader queue
   */
  clear() {
    this.preloadQueue = [];
    this.preloadedUrls.clear();
  }
}

export const audioPreloader = new AudioPreloader();
export default audioPreloader;

