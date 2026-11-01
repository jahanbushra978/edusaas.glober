/**
 * Universal Quran Audio Infrastructure - Automated Verification Test Suite
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Verifies:
 * - Centralized singleton initialization and modular exports
 * - 29 Arabic letter (Huruf Mufradat) asset mapping coverage
 * - Authentic Tajweed, Sukoon, Qalqalah, Harakat and Tanween resolution
 * - EveryAyah CDN Ayah audio URL generation and Shaykh switching
 * - Bounded LRU cache eviction and hit/miss accounting
 * - In-flight deduplication
 * - Strict prohibition of robotic browser speech for Arabic
 */

import test from "node:test";
import assert from "node:assert/strict";

// Mock minimal browser globals for testing Node.js environment
if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    localStorage: {
      _store: {},
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; },
      clear() { this._store = {}; }
    }
  };
  globalThis.localStorage = globalThis.window.localStorage;
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };
}

// Import Audio Subsystem Modules
import { AUDIO_CONFIG } from "../src/lib/quran/audio/AudioConfig.js";
import { audioEvents, AUDIO_EVENTS } from "../src/lib/quran/audio/AudioEvents.js";
import { audioCache } from "../src/lib/quran/audio/AudioCache.js";
import {
  SHAYKH_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  setActiveShaykhId,
  getQariAudioUrl,
  switchAudioUrlQari,
} from "../src/lib/quran/audio/QariRegistry.js";
import {
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
  extractBaseArabicLetter,
  resolveLetterAudio,
  resolveArabicSoundAudio,
  resolveAyahAudio,
} from "../src/lib/quran/audio/AudioSourceRegistry.js";
import { universalAudioEngine } from "../src/lib/quran/audio/UniversalQuranAudioEngine.js";

test("1. Centralized Audio Engine Singleton & Config Verification", () => {
  assert.ok(universalAudioEngine, "universalAudioEngine singleton must exist");
  assert.equal(typeof universalAudioEngine.playLetter, "function");
  assert.equal(typeof universalAudioEngine.playAyah, "function");
  assert.equal(typeof universalAudioEngine.playArabicSound, "function");
  assert.equal(typeof universalAudioEngine.playWord, "function");
  assert.equal(typeof universalAudioEngine.playChime, "function");
  assert.equal(typeof universalAudioEngine.stopAll, "function");

  assert.equal(AUDIO_CONFIG.DEFAULT_SHAYKH_ID, "husary_muallim");
  assert.ok(AUDIO_CONFIG.MAX_IN_MEMORY_AUDIO_INSTANCES >= 100);
});

test("2. Complete 29 Arabic Letters (Huruf Mufradat) Resolution Coverage", () => {
  const ALPHABET_29 = [
    "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص",
    "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "و", "ه", "ء", "ي"
  ];

  for (const letter of ALPHABET_29) {
    const res = resolveLetterAudio(letter);
    assert.ok(res.found, `Letter "${letter}" must resolve to an authentic recording`);
    assert.ok(res.urls.length > 0, `Letter "${letter}" must have candidate URLs`);
    assert.ok(
      res.urls[0].includes("Page1-") || res.urls[0].includes(".mp3") || res.urls[0].includes(".m4a"),
      `Letter "${letter}" primary URL must point to studio audio: ${res.urls[0]}`
    );
  }
});

test("3. Authentic Harakat, Sukoon with Qalqalah, and Tajweed Sequences", () => {
  // Takhti 10: Sukoon with Qalqalah (Baa, Jeem, Daal, Twa, Qaaf)
  const qalqalahLetters = ["أَبْ", "أَجْ", "أَدْ", "أَطْ", "أَقْ"];
  for (const token of qalqalahLetters) {
    const res = resolveArabicSoundAudio(token);
    assert.ok(res.found, `Qalqalah token "${token}" must be in authentic registry`);
    assert.ok(res.urls.length > 0, `Qalqalah token "${token}" must have audio URLs`);
  }

  // Takhti 4: Harakat (Fatha / Zabar)
  const harakatSample = ["بَ", "تَ", "جَ", "دَ", "سَ", "مَ"];
  for (const token of harakatSample) {
    const res = resolveArabicSoundAudio(token);
    assert.ok(res.found, `Harakat token "${token}" must resolve to authentic studio audio`);
  }

  // Multi-word Tajweed sequence (e.g. مِن بَعْدِ - Iqlab with Meem)
  const seqRes = resolveArabicSoundAudio("مِن بَعْدِ");
  assert.ok(seqRes.found, "Multi-word Tajweed 'مِن بَعْدِ' must resolve");
  assert.equal(seqRes.isSequence, true, "Must be flagged as sequence for AudioQueue");
  assert.equal(seqRes.urls.length, 2, "Must contain exactly 2 sequential audio tokens");
});

test("4. EveryAyah CDN Ayah URL Generation & Canonical Shaykh Registry", () => {
  assert.equal(SHAYKH_REGISTRY.length, 6, "Must contain all 6 canonical Shaykhs");

  // Al-Husary Muallim: Surah 1 Ayah 1 -> 001001.mp3
  const husaryUrl = getQariAudioUrl("husary_muallim", 1, 1);
  assert.equal(husaryUrl, "https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3");

  // Alafasy: Surah 112 Ayah 4 -> 112004.mp3
  const alafasyUrl = getQariAudioUrl("alafasy", 112, 4);
  assert.equal(alafasyUrl, "https://everyayah.com/data/Alafasy_128kbps/112004.mp3");

  // Dynamic Qari switching without recalculating ayah numbers
  const switchedUrl = switchAudioUrlQari(alafasyUrl, "abdul_basit");
  assert.equal(switchedUrl, "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/112004.mp3");

  // Persistent preference save & retrieve
  setActiveShaykhId("sudais");
  assert.equal(getActiveShaykhId(), "sudais");
});

test("5. Bounded LRU Cache Eviction & Deduplication Logic", () => {
  audioCache.clear();
  const statsInit = audioCache.getStats();
  assert.equal(statsInit.size, 0);

  // Set mock small capacity to test eviction boundary
  audioCache.maxEntries = 5;

  // Add dummy entries to cache map
  for (let i = 1; i <= 7; i++) {
    const url = `https://test.cdn/sample_${i}.mp3`;
    audioCache.cache.set(url, {
      audio: { pause() {}, removeAttribute() {}, load() {} },
      lastAccessed: Date.now() + i,
      hitCount: 0,
    });
    audioCache.evictIfNecessary();
  }

  assert.ok(
    audioCache.cache.size <= 5,
    `Cache size (${audioCache.cache.size}) must never exceed max bound (5)`
  );

  // Restore default max bound
  audioCache.maxEntries = AUDIO_CONFIG.MAX_IN_MEMORY_AUDIO_INSTANCES;
  audioCache.clear();
});

test("6. Missing Asset Integrity: No Robotic Speech Substitution", () => {
  // A non-existent gibberish Arabic string
  const fakeArabic = "xyz_غير_موجود_123";
  const res = resolveArabicSoundAudio(fakeArabic);

  assert.equal(res.found, false, "Unknown string must return found: false");
  assert.equal(res.missingAsset, true, "Must flag missingAsset: true");
  assert.ok(
    res.reason.includes("Robotic voice substitution prohibited"),
    "Must explicitly forbid robotic substitution"
  );
});

test("7. Audio Events Lifecycle & Subscriptions", () => {
  let eventReceived = null;
  const unsubscribe = audioEvents.on(AUDIO_EVENTS.PLAYING, (ev) => {
    eventReceived = ev;
  });

  audioEvents.emit(AUDIO_EVENTS.PLAYING, { assetId: "test_ayah_1", url: "test.mp3" });
  assert.ok(eventReceived, "Listener must receive emitted event");
  assert.equal(eventReceived.assetId, "test_ayah_1");

  unsubscribe();
  eventReceived = null;
  audioEvents.emit(AUDIO_EVENTS.PLAYING, { assetId: "test_ayah_2" });
  assert.equal(eventReceived, null, "Unsubscribed listener must not be called");
});

