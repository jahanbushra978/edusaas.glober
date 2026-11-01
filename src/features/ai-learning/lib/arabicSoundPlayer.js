"use client";

/**
 * Arabic Sound Player - Unified Audio Engine Adapter
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Bridges all learning modules, Noor Kids, and educational games
 * to the centralized Universal Quran Audio Infrastructure (@/lib/quran/audio).
 * 
 * ZERO ROBOTIC BROWSER TTS FOR SACRED ARABIC.
 */

import {
  universalAudioEngine,
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
  AUDIO_CONFIG,
} from "@/lib/quran/audio";

export {
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
};

export const NOORANI_BASE_URL = AUDIO_CONFIG.NOORANI_FALLBACK_CDN;
export const NOORANI_CDN_FALLBACK = AUDIO_CONFIG.NOORANI_PRIMARY_CDN;
export const ARABIC_AUDIO_BASE_URL = AUDIO_CONFIG.ARABIC_STUDIO_CDN;

/**
 * Stop any currently playing audio across the entire platform
 */
export function stopArabicAudio() {
  universalAudioEngine.stopAll();
}

/**
 * Preload high-quality audio for an Arabic token (letters, vowels, sukoon)
 */
export function preloadArabicSound(arabicCharOrText) {
  universalAudioEngine.preload(arabicCharOrText);
}

/**
 * Play authentic sound for letter or Arabic text via the Centralized Audio Engine.
 * Pure unvowelled letters use authentic Takhti 1 studio recordings.
 * Harakat, Tanween, Sukoon with Qalqalah, Tajweed rules use authentic verified Qari recordings.
 * 
 * @param {string} arabicCharOrText
 * @param {Function} [onEnded]
 * @param {number} [rate=1.0]
 */
export function playArabicSound(arabicCharOrText, onEnded, rate = 1.0) {
  return universalAudioEngine.playArabicSound(arabicCharOrText, onEnded, rate);
}

/**
 * Play authentic Quranic word audio by word string or direct URL
 * @param {string} wordOrUrl
 * @param {Function} [onEnded]
 */
export function playArabicWord(wordOrUrl, onEnded) {
  return universalAudioEngine.playWord(wordOrUrl, { onEnd: onEnded });
}

export function playArabicLetterSound(char, options) {
  return universalAudioEngine.playLetter(char, options);
}

// ─────────────────────────────────────────
// Web Audio Sound Effects Synthesizer (Instant 0ms, Zero Network Delay)
// ─────────────────────────────────────────

export function playCorrectChime() {
  universalAudioEngine.playChime("correct");
}

export function playWrongBuzzer() {
  universalAudioEngine.playChime("wrong");
}

export function playLevelCompleteFanfare() {
  universalAudioEngine.playChime("complete");
}

export function playTapSound() {
  universalAudioEngine.playChime("tap");
}

export function playStarPopSound(starIndex = 1) {
  universalAudioEngine.playChime("star");
}

export function playHeartLostSound() {
  universalAudioEngine.playChime("wrong");
}

export const playLifeLostSound = playHeartLostSound;

export function playMaShaAllahCelebration() {
  universalAudioEngine.playChime("celebrate");
}
