/**
 * Unified Universal Quran Audio Infrastructure - Public API Entry Point
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * ONE ENGINE. ONE AUDIO MANAGEMENT SYSTEM. MULTIPLE CONSUMERS.
 */

import { universalAudioEngine } from "./UniversalQuranAudioEngine.js";
export { universalAudioEngine } from "./UniversalQuranAudioEngine.js";
export default universalAudioEngine;

export { audioManager } from "./AudioManager.js";
export { audioCache } from "./AudioCache.js";
export { audioQueue } from "./AudioQueue.js";
export { audioPreloader } from "./AudioPreloader.js";
export { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";
export { AUDIO_CONFIG } from "./AudioConfig.js";
export {
  SHAYKH_REGISTRY,
  QARI_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  setActiveShaykhId,
  getQariAudioUrl,
  switchAudioUrlQari,
  getStoredQariPreference,
  setStoredQariPreference,
} from "./QariRegistry.js";

export {
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
  AUTHENTIC_QURAN_WORDS_MAP,
  extractBaseArabicLetter,
  resolveLetterAudio,
  resolveArabicSoundAudio,
  resolveWordAudio,
  resolveAyahAudio,
} from "./AudioSourceRegistry.js";

// Convenient Direct Helper Functions
export const playArabicLetterSound = (char, options) =>
  universalAudioEngine.playLetter(char, options);

export const playQariRecitation = (surahNumber, ayahNumber, qariId, options) =>
  universalAudioEngine.playAyah(surahNumber, ayahNumber, qariId, options);

export const playQuranWordSound = (url, options) =>
  universalAudioEngine.playWord(url, options);

export const playArabicWord = (wordOrUrl, options) =>
  universalAudioEngine.playWord(wordOrUrl, options);

export const playArabicSound = (text, options, rate) =>
  universalAudioEngine.playArabicSound(text, options, rate);

export const playAudioAuto = (target, options) =>
  universalAudioEngine.play(target, options);

export const playFeedbackChime = (type) =>
  universalAudioEngine.playChime(type);

export const stopAllAudio = () =>
  universalAudioEngine.stopAll();

export const preloadAudio = (target) =>
  universalAudioEngine.preload(target);

