/**
 * Unified Universal Quran Audio Infrastructure - Master Orchestrator
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * ONE ENGINE. ONE AUDIO MANAGEMENT SYSTEM. MULTIPLE CONSUMERS.
 * 
 * Coordinates playback, caching, Qari selection, sequencing, preloading,
 * and error recovery across all application modules.
 * 
 * ZERO ROBOTIC BROWSER TTS FOR ARABIC / QURANIC RECITATIONS.
 */

import { AUDIO_CONFIG } from "./AudioConfig.js";
import { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";
import { audioCache } from "./AudioCache.js";
import { audioManager } from "./AudioManager.js";
import { audioQueue } from "./AudioQueue.js";
import { audioPreloader } from "./AudioPreloader.js";
import {
  resolveLetterAudio,
  resolveArabicSoundAudio,
  resolveAyahAudio,
} from "./AudioSourceRegistry.js";
import {
  getActiveShaykhId,
  setActiveShaykhId,
  SHAYKH_REGISTRY,
} from "./QariRegistry.js";

class UniversalQuranAudioEngine {
  constructor() {
    this.activeType = null; // 'letter' | 'ayah' | 'word' | 'tajweed' | 'chime'
    this.activeKey = null;

    // Forward AudioEvents to engine subscribers
    audioEvents.on("*", (event) => {
      if (event.event === AUDIO_EVENTS.STOPPED || event.event === AUDIO_EVENTS.ENDED) {
        this.activeType = null;
        this.activeKey = null;
      }
    });
  }

  /**
   * Subscribe to global audio events and playback state
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    return audioEvents.on("*", listener);
  }

  /**
   * 0. UNIVERSAL SMART PLAY ROUTER (Single polymorphic trigger for all consumers)
   * Resolves direct URL strings, letter/word strings, Ayah numbers, or items
   * @param {string|Object} target
   * @param {Object} [options]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  play(target, options = {}) {
    if (typeof window === "undefined" || !target) {
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    if (typeof target === "string") {
      const clean = target.trim();
      if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/") || clean.endsWith(".mp3") || clean.endsWith(".m4a") || clean.endsWith(".wav")) {
        return this.playWord(clean, options);
      }
      return this.playArabicSound(clean, options);
    }

    if (typeof target === "object") {
      if (target.audio) {
        return this.playWord(target.audio, options);
      }
      if (target.surah && target.ayah) {
        return this.playAyah(target.surah, target.ayah, target.qariId, options);
      }
      if (target.ar) {
        return this.playArabicSound(target.ar, options);
      }
    }

    return Promise.resolve(null);
  }

  /**
   * 1. PLAY AUTHENTIC ARABIC LETTER (Single Source of Truth)
   * Pure studio Qari recording for any of the 29 letters (Huruf Mufradat: Takhti 1).
   * Automatically falls back to word audio if given a word or phrase.
   * @param {string} char
   * @param {Object} [options]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  playLetter(char, options = {}) {
    if (typeof window === "undefined" || !char) {
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    const resolved = resolveLetterAudio(char);
    if (!resolved.found) {
      // Graceful fallback to word/tajweed sound before giving up
      return this.playArabicSound(char, options);
    }

    this.activeType = "letter";
    this.activeKey = resolved.baseLetter;

    return audioManager.playCandidateUrls(resolved.urls, {
      assetId: resolved.assetId,
      rate: options.rate,
      volume: options.volume,
      onStart: options.onStart,
      onProgress: options.onProgress,
      onEnd: () => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onEnd) options.onEnd();
      },
      onError: (err) => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onError) options.onError(err);
      },
    });
  }

  /**
   * 2. PLAY AUTHENTIC QURAN AYAH RECITATION (Single Source of Truth)
   * Resolves EveryAyah CDN with Shaykh registry (Husary, Alafasy, Abdul Basit, Minshawi, etc.)
   * @param {number|string} surahNumber
   * @param {number|string} ayahNumber
   * @param {string} [qariId]
   * @param {Object} [options]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  playAyah(surahNumber, ayahNumber, qariId, options = {}) {
    if (typeof window === "undefined") {
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    const selectedQari = qariId || getActiveShaykhId() || AUDIO_CONFIG.DEFAULT_SHAYKH_ID;
    const resolved = resolveAyahAudio(surahNumber, ayahNumber, selectedQari);

    this.activeType = "ayah";
    this.activeKey = `${surahNumber}:${ayahNumber}`;

    return audioManager.playCandidateUrls(resolved.urls, {
      assetId: resolved.assetId,
      rate: options.rate,
      volume: options.volume,
      onStart: options.onStart,
      onProgress: options.onProgress,
      onEnd: () => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onEnd) options.onEnd();
      },
      onError: (err) => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onError) options.onError(err);
      },
    });
  }

  /**
   * 3. PLAY AUTHENTIC ARABIC SOUND (Harakat, Tanween, Sukoon, Tajweed, Words)
   * Handles single audio assets as well as multi-word Tajweed sequences (e.g. مِن بَعْدِ)
   * @param {string} text
   * @param {Object|Function} [optionsOrCallback]
   * @param {number} [rate=1.0]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  playArabicSound(text, optionsOrCallback = {}, rate = 1.0) {
    if (typeof window === "undefined" || !text) {
      if (typeof optionsOrCallback === "function") optionsOrCallback();
      return Promise.resolve(null);
    }

    const options = typeof optionsOrCallback === "function"
      ? { onEnd: optionsOrCallback, rate }
      : { ...optionsOrCallback, rate: optionsOrCallback.rate || rate };

    const resolved = resolveArabicSoundAudio(text);

    if (!resolved.found) {
      audioEvents.emit(AUDIO_EVENTS.ASSET_MISSING, {
        assetId: resolved.assetId,
        text,
        reason: resolved.reason,
      });
      console.warn(`[UniversalAudioEngine] ${resolved.reason}`);
      if (options.onError) options.onError(new Error(resolved.reason));
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    // If item is a multi-track sequence (e.g. Tajweed two-word rule), route via AudioQueue
    if (resolved.isSequence && Array.isArray(resolved.urls)) {
      this.activeType = "tajweed_seq";
      this.activeKey = text;

      const queueItems = resolved.urls.map((u, i) => ({
        urls: [u],
        assetId: `${resolved.assetId}_${i}`,
      }));

      audioQueue.start(queueItems, {
        rate: options.rate,
        volume: options.volume,
        delayMs: 180,
        onComplete: () => {
          this.activeType = null;
          this.activeKey = null;
          if (options.onEnd) options.onEnd();
        },
      });
      return Promise.resolve(null);
    }

    this.activeType = "tajweed";
    this.activeKey = text;

    return audioManager.playCandidateUrls(resolved.urls, {
      assetId: resolved.assetId,
      rate: options.rate,
      volume: options.volume,
      onStart: options.onStart,
      onProgress: options.onProgress,
      onEnd: () => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onEnd) options.onEnd();
      },
      onError: (err) => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onError) options.onError(err);
      },
    });
  }

  /**
   * 4. PLAY QURANIC WORD-BY-WORD AUDIO (QuranCDN or direct audio URL)
   * @param {string} wordAudioUrl
   * @param {Object} [options]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  playWord(wordAudioUrl, options = {}) {
    if (typeof window === "undefined" || !wordAudioUrl) {
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    // If caller passed Arabic word text instead of an audio URL, route to playArabicSound
    if (typeof wordAudioUrl === "string" && !wordAudioUrl.startsWith("http://") && !wordAudioUrl.startsWith("https://") && !wordAudioUrl.startsWith("/")) {
      return this.playArabicSound(wordAudioUrl, options);
    }

    this.activeType = "word";
    this.activeKey = wordAudioUrl;

    return audioManager.playCandidateUrls([wordAudioUrl], {
      assetId: `word_${wordAudioUrl}`,
      rate: options.rate,
      volume: options.volume,
      onStart: options.onStart,
      onProgress: options.onProgress,
      onEnd: () => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onEnd) options.onEnd();
      },
      onError: (err) => {
        this.activeType = null;
        this.activeKey = null;
        if (options.onError) options.onError(err);
      },
    });
  }

  /**
   * 5. PLAY INTERFACE & LEARNING FEEDBACK CHIMES (Instant Web Audio API)
   * High performance, zero network delay, instant response.
   * @param {"correct"|"wrong"|"tap"|"star"|"complete"} type
   */
  playChime(type = "correct") {
    audioManager.playSynthesizedChime(type);
  }

  /**
   * 6. QUEUE SEQUENTIAL AUDIO PLAYBACK
   * @param {Array<{ urls: string[], assetId?: string }>} items
   * @param {Object} [options]
   */
  playQueue(items, options = {}) {
    audioQueue.start(items, options);
  }

  /**
   * 7. PRELOAD AUDIO ASSETS PREDICTIVELY
   * @param {string|string[]|Object} target
   */
  preload(target) {
    audioPreloader.preload(target);
  }

  /**
   * Stop all active audio playback and sequential queues
   */
  stopAll() {
    audioQueue.stop();
    audioManager.stop();
    this.activeType = null;
    this.activeKey = null;
  }

  /**
   * Alias for stopAll() to prevent consumer errors
   */
  stop() {
    this.stopAll();
  }

  /**
   * Pause active audio playback
   */
  pause() {
    audioManager.pause();
  }

  /**
   * Resume paused audio playback
   */
  resume() {
    audioManager.resume();
  }

  /**
   * Seek in active audio track
   * @param {number} timeSeconds
   */
  seek(timeSeconds) {
    audioManager.seek(timeSeconds);
  }

  /**
   * Set volume globally (0.0 to 1.0)
   * @param {number} vol
   */
  setVolume(vol) {
    audioManager.setVolume(vol);
  }

  /**
   * Set playback speed multiplier (0.5 to 2.0)
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    audioManager.setPlaybackRate(rate);
  }

  /**
   * Change user's active Shaykh
   * @param {string} qariId
   */
  setActiveQari(qariId) {
    setActiveShaykhId(qariId);
  }

  /**
   * Retrieve current active Shaykh ID
   * @returns {string}
   */
  getActiveQari() {
    return getActiveShaykhId();
  }

  /**
   * Retrieve all supported Shaykhs
   */
  getSupportedQaris() {
    return SHAYKH_REGISTRY;
  }

  /**
   * Retrieve cache and performance diagnostics
   */
  getStats() {
    return {
      activeType: this.activeType,
      activeKey: this.activeKey,
      volume: audioManager.volume,
      playbackRate: audioManager.playbackRate,
      activeQari: this.getActiveQari(),
      cache: audioCache.getStats(),
    };
  }
}

// Global Singleton Instance
export const universalAudioEngine = new UniversalQuranAudioEngine();
export default universalAudioEngine;

