/**
 * Central Global Nur Qaida Audio Engine (Master Singleton)
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * CORE ARCHITECTURAL INVARIANTS:
 * 1. ONE ENGINE. ONE SOURCE OF TRUTH. Used across all Noorani Qaida pages,
 *    lessons, practices, quizzes, and mini-games.
 * 2. ZERO ROBOTIC BROWSER TTS FOR SACRED ARABIC.
 *    Only verified authentic human studio recitations (Qari audio) are played.
 * 3. STRICT IDENTITY & NO COLLISION.
 *    A letter name (e.g. "Baa") is NEVER substituted for a vowel-marked letter ("Bi" or "Bu").
 *    Every item has its own distinct audio source.
 * 4. MULTI-MIRROR RESILIENCE FOR PRODUCTION (VERCEL).
 *    Every remote asset is backed by an ordered list of candidate URLs
 *    (local static asset -> raw GitHub -> jsDelivr edge CDN) preventing 403 errors.
 * 5. CLEAN LIFECYCLE MANAGEMENT.
 *    Exclusive playback (stops previous sound immediately), prevents clashing/overlap,
 *    handles rapid clicks, and cleans up on component unmount.
 */

import { NUR_QAIDA_BY_ID, NUR_QAIDA_BY_AR } from "./NurQaidaManifest.js";
import { audioManager } from "./AudioManager.js";
import { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";
import { universalAudioEngine } from "./UniversalQuranAudioEngine.js";

class NurQaidaAudioEngine {
  constructor() {
    this.currentId = null;
    this.currentAr = null;
    this.status = "idle"; // 'idle' | 'loading' | 'playing' | 'error'
    this.error = null;
    this.lastTarget = null;
    this.lastOptions = {};
    this.speed = 1.0;
    this.volume = 1.0;
    this.subscribers = new Set();

    // Listen to global AudioManager events
    if (typeof window !== "undefined") {
      audioEvents.on("*", (evt) => {
        if (evt.event === AUDIO_EVENTS.STOPPED || evt.event === AUDIO_EVENTS.ENDED) {
          if (this.status !== "idle") {
            this.status = "idle";
            this.currentId = null;
            this.currentAr = null;
            this.notify();
          }
        } else if (evt.event === AUDIO_EVENTS.ERROR) {
          this.status = "error";
          this.error = evt.message || "Audio playback error";
          this.notify();
        }
      });
    }
  }

  /**
   * Subscribe to state changes (React hook integration)
   * @param {Function} listener
   * @returns {Function} unsubscribe
   */
  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.subscribers.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.warn("[NurQaidaAudioEngine] Listener error:", err);
      }
    });
  }

  /**
   * Current snapshot of playback state
   */
  getState() {
    return {
      currentId: this.currentId,
      currentAr: this.currentAr,
      status: this.status,
      isPlaying: this.status === "playing",
      isLoading: this.status === "loading",
      error: this.error,
      speed: this.speed,
      volume: this.volume,
    };
  }

  /**
   * Set playback speed (e.g. 0.75x for slow beginner mashq, 1.0x normal)
   */
  setSpeed(newSpeed) {
    const valid = Math.max(0.5, Math.min(2.0, Number(newSpeed) || 1.0));
    this.speed = valid;
    audioManager.setPlaybackRate(valid);
    this.notify();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(newVol) {
    const valid = Math.max(0, Math.min(1.0, Number(newVol) || 1.0));
    this.volume = valid;
    audioManager.setVolume(valid);
    this.notify();
  }

  /**
   * Resolves target to manifest entry or candidate URLs
   * @param {string|Object} target
   * @returns {{ item: Object|null, urls: string[], id: string, ar: string }}
   */
  resolveTarget(target) {
    if (!target) return { item: null, urls: [], id: "", ar: "" };

    // 1. Direct Object
    if (typeof target === "object") {
      // Direct explicit audio URLs passed in item
      if (target.candidateUrls && Array.isArray(target.candidateUrls) && target.candidateUrls.length > 0) {
        return {
          item: target,
          urls: target.candidateUrls,
          id: target.id || target.ar || "custom_item",
          ar: target.ar || "",
        };
      }
      if (target.audio || target.audioUrl) {
        const rawUrl = target.audio || target.audioUrl;
        return {
          item: target,
          urls: this.buildUrlCandidates(rawUrl),
          id: target.id || target.ar || rawUrl,
          ar: target.ar || "",
        };
      }
      // If object has id or ar, look up in manifest
      if (target.id && NUR_QAIDA_BY_ID.has(target.id)) {
        const found = NUR_QAIDA_BY_ID.get(target.id);
        return { item: found, urls: found.candidateUrls, id: found.id, ar: found.ar };
      }
      if (target.sound && NUR_QAIDA_BY_AR.has(target.sound)) {
        const found = NUR_QAIDA_BY_AR.get(target.sound);
        return { item: found, urls: found.candidateUrls, id: found.id, ar: found.ar };
      }
      if (target.ar && NUR_QAIDA_BY_AR.has(target.ar)) {
        const found = NUR_QAIDA_BY_AR.get(target.ar);
        return { item: found, urls: found.candidateUrls, id: found.id, ar: found.ar };
      }
      // String target inside object
      const text = target.sound || target.ar || "";
      return this.resolveStringTarget(text);
    }

    // 2. Direct String
    return this.resolveStringTarget(String(target));
  }

  /**
   * Resolve string target (id, direct URL, or Arabic text)
   */
  resolveStringTarget(str) {
    const clean = str.trim();
    if (!clean) return { item: null, urls: [], id: "", ar: "" };

    // Direct ID in manifest
    if (NUR_QAIDA_BY_ID.has(clean)) {
      const item = NUR_QAIDA_BY_ID.get(clean);
      return { item, urls: item.candidateUrls, id: item.id, ar: item.ar };
    }

    // Direct Arabic text in manifest
    if (NUR_QAIDA_BY_AR.has(clean)) {
      const item = NUR_QAIDA_BY_AR.get(clean);
      return { item, urls: item.candidateUrls, id: item.id, ar: item.ar };
    }

    // Unicode normalized match (NFC / NFD)
    const nfc = clean.normalize("NFC");
    if (NUR_QAIDA_BY_AR.has(nfc)) {
      const item = NUR_QAIDA_BY_AR.get(nfc);
      return { item, urls: item.candidateUrls, id: item.id, ar: item.ar };
    }

    // Direct audio URL
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/") || clean.endsWith(".mp3") || clean.endsWith(".m4a")) {
      return { item: null, urls: this.buildUrlCandidates(clean), id: clean, ar: "" };
    }

    // Fall back to Universal Quran Audio Engine's resolver
    return { item: null, urls: [], id: clean, ar: clean };
  }

  /**
   * Transforms any Noorani audio URL into multi-mirror candidate URLs
   * (local asset -> raw GitHub -> jsDelivr edge)
   */
  buildUrlCandidates(url) {
    if (!url) return [];
    if (url.startsWith("/")) {
      return [url]; // Local public file
    }
    const candidates = [];

    // If it's a nooresahar GitHub / jsDelivr path
    const match = url.match(/sounds\/(chapter\d+)\/([^/]+\.(?:m4a|mp3))/);
    if (match) {
      let chapter = match[1];
      // Normalize chapter4 -> chapter04
      if (/^chapter\d$/.test(chapter)) {
        chapter = chapter.replace("chapter", "chapter0");
      }
      const filename = match[2];
      candidates.push(`https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/${chapter}/${filename}`);
      candidates.push(`https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/${chapter}/${filename}`);
      return candidates;
    }

    // Normal URL
    candidates.push(url);
    return candidates;
  }

  /**
   * Master Playback Function (Polymorphic)
   * Plays letter, harakat, sukoon, murakkab, word, or direct audio item.
   * Immediately stops any active audio to ensure 100% exclusive playback.
   * 
   * @param {string|Object} target - Manifest ID, Arabic string, item object, or URL
   * @param {Object} [options] - { rate, onStart, onEnd, onError }
   * @returns {Promise<boolean>}
   */
  async play(target, options = {}) {
    if (typeof window === "undefined" || !target) {
      if (options.onEnd) options.onEnd();
      return false;
    }

    // Stop current audio immediately
    this.stop();

    // Signal global event to pause any active Bengali translation audio
    window.dispatchEvent(new CustomEvent("rahmania-arabic-audio-start"));

    this.lastTarget = target;
    this.lastOptions = options;
    this.status = "loading";
    this.error = null;

    const resolved = this.resolveTarget(target);
    this.currentId = resolved.id;
    this.currentAr = resolved.ar || (typeof target === "string" ? target : target.ar || "");
    this.notify();

    const rate = options.rate !== undefined ? options.rate : this.speed;

    // A. If candidate URLs resolved via Manifest or direct asset
    if (resolved.urls && resolved.urls.length > 0) {
      try {
        const audio = await audioManager.playCandidateUrls(resolved.urls, {
          assetId: resolved.id,
          rate,
          volume: this.volume,
          onStart: () => {
            this.status = "playing";
            this.notify();
            if (options.onStart) options.onStart();
          },
          onEnd: () => {
            this.status = "idle";
            this.currentId = null;
            this.currentAr = null;
            this.notify();
            if (options.onEnd) options.onEnd();
          },
          onError: (err) => {
            this.status = "error";
            this.error = err.message || "Failed to load audio";
            this.notify();
            if (options.onError) options.onError(err);
          },
        });
        return Boolean(audio);
      } catch (err) {
        this.status = "error";
        this.error = err.message;
        this.notify();
        if (options.onError) options.onError(err);
        return false;
      }
    }

    // B. Fallback to Universal Quran Audio Engine (for Ayahs, WBW words, or Tajweed sequences)
    try {
      this.status = "playing";
      this.notify();
      await universalAudioEngine.play(target, {
        rate,
        onStart: options.onStart,
        onEnd: () => {
          this.status = "idle";
          this.currentId = null;
          this.currentAr = null;
          this.notify();
          if (options.onEnd) options.onEnd();
        },
        onError: (err) => {
          this.status = "error";
          this.error = err.message;
          this.notify();
          if (options.onError) options.onError(err);
        },
      });
      return true;
    } catch (err) {
      this.status = "error";
      this.error = err.message;
      this.notify();
      if (options.onError) options.onError(err);
      return false;
    }
  }

  /**
   * Stop active playback cleanly
   */
  stop() {
    audioManager.stop();
    universalAudioEngine.stop();
    this.status = "idle";
    this.currentId = null;
    this.currentAr = null;
    this.notify();
  }

  /**
   * Replay last item
   */
  replay() {
    if (this.lastTarget) {
      return this.play(this.lastTarget, this.lastOptions);
    }
    return Promise.resolve(false);
  }

  /**
   * Direct Helper: Play letter (Takhti 1)
   */
  playLetter(char, options = {}) {
    const item = NUR_QAIDA_BY_AR.get(char) || NUR_QAIDA_BY_ID.get(`mufradat_${char}`);
    if (item) {
      return this.play(item, options);
    }
    return universalAudioEngine.playLetter(char, options);
  }

  /**
   * Direct Helper: Play Harakat (Zabar, Zer, Pesh)
   */
  playHarakat(base, harakat, options = {}) {
    const id = `harakat_${base}_${harakat}`;
    if (NUR_QAIDA_BY_ID.has(id)) {
      return this.play(NUR_QAIDA_BY_ID.get(id), options);
    }
    return this.play(`${base}`, options);
  }

  /**
   * Direct Helper: Play Sukoon / Jazm
   */
  playSukoon(ar, options = {}) {
    const id = `sukoon_${ar}`;
    if (NUR_QAIDA_BY_ID.has(id)) {
      return this.play(NUR_QAIDA_BY_ID.get(id), options);
    }
    return this.play(ar, options);
  }
}

// Singleton Engine Instance
export { NurQaidaAudioEngine };
export const nurQaidaAudioEngine = new NurQaidaAudioEngine();

/**
 * React Hook for Seamless Noorani Qaida Audio Playback
 */
import { useState, useEffect, useCallback } from "react";

export function useNurQaidaAudio() {
  const [state, setState] = useState(() => nurQaidaAudioEngine.getState());

  useEffect(() => {
    const unsubscribe = nurQaidaAudioEngine.subscribe((nextState) => {
      setState(nextState);
    });
    return () => {
      unsubscribe();
      // Component unmount cleanup: stop any running audio
      nurQaidaAudioEngine.stop();
    };
  }, []);

  const play = useCallback((target, options) => {
    return nurQaidaAudioEngine.play(target, options);
  }, []);

  const stop = useCallback(() => {
    nurQaidaAudioEngine.stop();
  }, []);

  const replay = useCallback(() => {
    return nurQaidaAudioEngine.replay();
  }, []);

  const setSpeed = useCallback((newSpeed) => {
    nurQaidaAudioEngine.setSpeed(newSpeed);
  }, []);

  const setVolume = useCallback((newVol) => {
    nurQaidaAudioEngine.setVolume(newVol);
  }, []);

  return {
    ...state,
    play,
    stop,
    replay,
    setSpeed,
    setVolume,
    engine: nurQaidaAudioEngine,
  };
}

export default nurQaidaAudioEngine;
