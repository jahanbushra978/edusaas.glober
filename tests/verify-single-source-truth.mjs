import { resolveLetterAudio, resolveArabicSoundAudio } from "../src/lib/quran/audio/AudioSourceRegistry.js";
import { universalAudioEngine } from "../src/lib/quran/audio/UniversalQuranAudioEngine.js";

console.log("=== Testing Single Source of Truth Across Multiple Consumers ===");

const testLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

let allMatch = true;

for (const char of testLetters) {
  const fromRegistry = resolveLetterAudio(char);
  const fromArabicSound = resolveArabicSoundAudio(char);

  const url1 = fromRegistry.urls[0];
  const url2 = fromArabicSound.urls[0];

  const match = url1 === url2;
  if (!match) allMatch = false;

  console.log(`Letter [${char}]:`);
  console.log(`  - resolveLetterAudio URL:      ${url1}`);
  console.log(`  - resolveArabicSoundAudio URL:  ${url2}`);
  console.log(`  - Identity Matched: ${match ? "YES (Exact Same Studio Track)" : "NO (MISMATCH)"}`);
}

console.log(`\nOverall Identity Consistency: ${allMatch ? "100% IDENTICAL" : "FAILED"}`);

