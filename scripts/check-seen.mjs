import { resolveArabicSoundAudio, resolveWordAudio, resolveLetterAudio, AUTHENTIC_TAJWEED_AUDIO_MAP } from "../src/lib/quran/audio/AudioSourceRegistry.js";
import { AUTHENTIC_QURAN_WORDS_MAP } from "../src/lib/quran/audio/QuranWordsAudioMap.js";

console.log("=== CHECKING سِ ===");
const si = "سِ";
console.log("Code points of سِ:", [...si].map(c => c.charCodeAt(0).toString(16)));
console.log("AUTHENTIC_TAJWEED_AUDIO_MAP[سِ]:", AUTHENTIC_TAJWEED_AUDIO_MAP[si]);
console.log("AUTHENTIC_QURAN_WORDS_MAP[سِ]:", AUTHENTIC_QURAN_WORDS_MAP[si]);
console.log("resolveArabicSoundAudio(سِ):", resolveArabicSoundAudio(si));

console.log("\n=== CHECKING سَ ===");
const sa = "سَ";
console.log("Code points of سَ:", [...sa].map(c => c.charCodeAt(0).toString(16)));
console.log("AUTHENTIC_TAJWEED_AUDIO_MAP[سَ]:", AUTHENTIC_TAJWEED_AUDIO_MAP[sa]);
console.log("resolveArabicSoundAudio(سَ):", resolveArabicSoundAudio(sa));

console.log("\n=== CHECKING سُ ===");
const su = "سُ";
console.log("AUTHENTIC_TAJWEED_AUDIO_MAP[سُ]:", AUTHENTIC_TAJWEED_AUDIO_MAP[su]);
console.log("resolveArabicSoundAudio(سُ):", resolveArabicSoundAudio(su));
