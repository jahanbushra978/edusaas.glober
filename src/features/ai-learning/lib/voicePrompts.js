"use client";

import { stopArabicAudio } from "./arabicSoundPlayer";

/**
 * Pre-recorded audio prompt map & script text.
 * Future studio recording files will be placed in /sounds/prompts/bn/<key>.mp3.
 * Until audio files are recorded, Web SpeechSynthesis acts as an immediate fallback.
 */
export const VOICE_PROMPTS_SCRIPTS = {
  welcome: "আসসালামু আলাইকুম! চলো, আমরা খেলি!",
  press_start: "বড় বোতামটা ছোঁও!",
  pick_kids: "ছোটদের জন্য ছবিটা ছোঁও",
  lets_listen: "চলো শুনি!",
  find_it: "খুঁজে বের করো!",
  which_one: "কোনটা? ছুঁয়ে দেখাও!",
  try_again: "উঁহু, আবার চেষ্টা করি!",
  almost: "প্রায় হয়ে গেছে!",
  great: "মাশাআল্লাহ! খুব ভালো!",
  star_earned: "তুমি একটা তারা পেলে!",
  how_many_dots: "কয়টা নুকতা?",
  match_pairs: "জোড়া মেলাও!",
  draw_it: "আঙুল দিয়ে আঁকো!",
  pick_sound: "কোন আওয়াজ শুনলে?",
  hint_look: "এইদিকে দেখো!",
  session_end: "আজকের মতো শেষ! কাল আবার আসবে?",
  bye: "আল্লাহ হাফেজ!",
  learn_mode: "চলো নতুন হরফ শিখি!",
  game_mode: "মজার মজার খেলা খেলি!",
  star_mode: "তোমার জমানো তারা দেখো!",
  parent_gate: "অভিভাবকদের জন্য: বোতামটি দুই সেকেন্ড চেপে রাখুন",
};

let currentAudio = null;
let isSpeaking = false;
const speechListeners = new Set();

function notifySpeechState(speaking) {
  isSpeaking = speaking;
  speechListeners.forEach((listener) => {
    try {
      listener(speaking);
    } catch {}
  });
}

/**
 * Subscribe to voice prompt speaking state (e.g. for mascot mouth movement)
 */
export function subscribeVoicePromptState(listener) {
  speechListeners.add(listener);
  listener(isSpeaking);
  return () => speechListeners.delete(listener);
}

/**
 * Stop any ongoing voice prompt immediately
 */
export function stopVoicePrompt() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  notifySpeechState(false);
}

/**
 * Play a kid-friendly Bengali voice prompt
 * @param {string} key - prompt key in VOICE_PROMPTS_SCRIPTS
 * @param {Object} options - { onStart, onEnded }
 */
export function playVoicePrompt(key, { onStart, onEnded } = {}) {
  if (typeof window === "undefined") return;

  // Stop any other Arabic recitation or previous prompt so sounds don't overlap
  stopArabicAudio();
  stopVoicePrompt();

  const text = VOICE_PROMPTS_SCRIPTS[key] || key;
  const audioUrl = `/sounds/prompts/bn/${key}.mp3`;

  // Try pre-recorded mp3 first
  const audio = new Audio(audioUrl);
  currentAudio = audio;

  let hasEnded = false;
  const handleEnd = () => {
    if (hasEnded) return;
    hasEnded = true;
    notifySpeechState(false);
    if (onEnded) onEnded();
  };

  audio.onplay = () => {
    notifySpeechState(true);
    if (onStart) onStart();
  };

  audio.onended = handleEnd;

  // If mp3 is missing (404), fall back seamlessly to Bengali speech synthesis
  audio.onerror = () => {
    currentAudio = null;
    playSpeechSynthesisFallback(text, { onStart, onEnded });
  };

  audio.play().catch(() => {
    // Autoplay prevented or file missing -> fallback
    playSpeechSynthesisFallback(text, { onStart, onEnded });
  });
}

function playSpeechSynthesisFallback(text, { onStart, onEnded } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnded) onEnded();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = 0.90; // Gentle, clear speed for young children
    utterance.pitch = 1.12; // Friendly, warm tone

    // Try finding Bengali voice
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(
      (v) => v.lang.includes("bn") || v.lang.includes("ben") || v.name.toLowerCase().includes("bangla")
    );
    if (bnVoice) {
      utterance.voice = bnVoice;
    }

    utterance.onstart = () => {
      notifySpeechState(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      notifySpeechState(false);
      if (onEnded) onEnded();
    };

    utterance.onerror = () => {
      notifySpeechState(false);
      if (onEnded) onEnded();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    notifySpeechState(false);
    if (onEnded) onEnded();
  }
}
