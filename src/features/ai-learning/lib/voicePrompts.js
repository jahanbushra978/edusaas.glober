"use client";

import { stopArabicAudio } from "./arabicSoundPlayer";

/**
 * Pre-recorded audio prompt map & script text.
 * Authentic human audio prompt files reside in /sounds/prompts/bn/<key>.mp3.
 * ZERO ROBOTIC SPEECH: Missing prompt files NEVER trigger synthetic browser TTS.
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

  notifySpeechState(false);
}

/**
 * Play a human Bengali voice prompt from verified audio assets.
 * ZERO ROBOTIC SPEECH: If asset is missing, cleanly terminates without synthetic fallback.
 * @param {string} key - prompt key in VOICE_PROMPTS_SCRIPTS
 * @param {Object} options - { onStart, onEnded }
 */
export function playVoicePrompt(key, { onStart, onEnded } = {}) {
  if (typeof window === "undefined") return;

  // Stop any other Arabic recitation or previous prompt so sounds don't overlap
  stopArabicAudio();
  stopVoicePrompt();

  const audioUrl = `/sounds/prompts/bn/${key}.mp3`;

  // Try pre-recorded human audio file
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

  // If mp3 is missing (404), do NOT fall back to robotic TTS; cleanly terminate
  audio.onerror = () => {
    currentAudio = null;
    notifySpeechState(false);
    if (onEnded) onEnded();
  };

  audio.play().catch(() => {
    // Autoplay blocked or asset unavailable -> cleanly terminate with zero synthetic speech
    currentAudio = null;
    notifySpeechState(false);
    if (onEnded) onEnded();
  });
}
