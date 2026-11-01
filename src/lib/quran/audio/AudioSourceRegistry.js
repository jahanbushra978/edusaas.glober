/**
 * Unified Universal Quran Audio Infrastructure - Audio Asset Registry & Resolvers
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Single source of truth for mapping educational Arabic content, Noorani Qaida,
 * Harakat, Tanween, Sukoon with Qalqalah, Tajweed rules, Quranic words and Ayahs
 * to authentic, verified human studio recitations.
 * 
 * ZERO ROBOTIC BROWSER TTS FOR SACRED ARABIC.
 */

import { AUDIO_CONFIG } from "./AudioConfig.js";
import { getQariAudioUrl } from "./QariRegistry.js";
import { AUTHENTIC_QURAN_WORDS_MAP, resolveWordAudio } from "./QuranWordsAudioMap.js";

export { AUTHENTIC_QURAN_WORDS_MAP, resolveWordAudio };

// Noorani Qaida Takhti 1: Huruf Mufradat (29 Letters) Track Numbers
export const NOORANI_TRACK_MAP = {
  "ا": 1,
  "ب": 2,
  "ت": 3,
  "ث": 4,
  "ج": 5,
  "ح": 6,
  "خ": 7,
  "د": 8,
  "ذ": 9,
  "ر": 10,
  "ز": 11,
  "س": 12,
  "ش": 13,
  "ص": 14,
  "ض": 15,
  "ط": 16,
  "ظ": 17,
  "ع": 18,
  "غ": 19,
  "ف": 20,
  "ق": 21,
  "ك": 22,
  "ل": 23,
  "م": 24,
  "ن": 25,
  "و": 26,
  "هـ": 27,
  "ه": 27,
  "ء": 28,
  "ي": 29,
};

// Fallback Studio Soundboard (Alternative high-fidelity human recordings)
export const ARABIC_LETTER_AUDIO_MAP = {
  "ا": "1_alif.mp3",
  "ب": "2_baa.mp3",
  "ت": "3_taa.mp3",
  "ث": "4_thaa.mp3",
  "ج": "5_jeem.mp3",
  "ح": "6_haa.mp3",
  "خ": "7_khaa.mp3",
  "د": "8_daal.mp3",
  "ذ": "9_zaal.mp3",
  "ر": "10_raa.mp3",
  "ز": "11_zaa.mp3",
  "س": "12_seen.mp3",
  "ش": "13_sheen.mp3",
  "ص": "14_saad.mp3",
  "ض": "15_daad.mp3",
  "ط": "16_taah.mp3",
  "ظ": "17_zhaa.mp3",
  "ع": "18_ain.mp3",
  "غ": "19_ghain.mp3",
  "ف": "20_faa.mp3",
  "ق": "21_qaaf.mp3",
  "ك": "22_kaaf.mp3",
  "ل": "23_laam.mp3",
  "م": "24_meem.mp3",
  "ن": "25_noon.mp3",
  "ه": "26_haah.mp3",
  "هـ": "26_haah.mp3",
  "و": "27_waw.mp3",
  "ء": "28_hamzah.mp3",
  "ي": "30_yaa.mp3",
};

// Authentic Noorani Qaida Master Qari Recordings & Tajweed Rules Audio Map
import { AUTHENTIC_TAJWEED_AUDIO_MAP } from "./TajweedAudioMap.js";
export { AUTHENTIC_TAJWEED_AUDIO_MAP };

/**
 * Strips tatweel (kashida) and whitespace
 */
function cleanArabicString(str) {
  if (!str) return "";
  return String(str).replace(/\u0640/g, "").trim();
}

/**
 * Strips harakat to extract base letter
 */
export function extractBaseArabicLetter(char) {
  if (!char) return "";
  const cleaned = cleanArabicString(char);
  return cleaned.replace(/[\u064B-\u065F\u0670]/g, "").trim();
}

/**
 * Resolves candidate audio URLs for an Arabic letter (Huruf Mufradat)
 * @param {string} char
 * @returns {{ found: boolean, urls: string[], assetId: string, trackNumber?: number }}
 */
export function resolveLetterAudio(char) {
  const base = extractBaseArabicLetter(char);
  const trackNumber = NOORANI_TRACK_MAP[base];
  const studioFile = ARABIC_LETTER_AUDIO_MAP[base];
  const candidateUrls = [];

  if (trackNumber) {
    candidateUrls.push(`${AUDIO_CONFIG.NOORANI_PRIMARY_CDN}${trackNumber}.m4a`);
    candidateUrls.push(`${AUDIO_CONFIG.NOORANI_FALLBACK_CDN}${trackNumber}.m4a`);
  }

  if (studioFile) {
    candidateUrls.push(`${AUDIO_CONFIG.ARABIC_STUDIO_CDN}${studioFile}`);
  }

  if (candidateUrls.length > 0) {
    return {
      found: true,
      urls: candidateUrls,
      assetId: `letter_${base}`,
      baseLetter: base,
      trackNumber,
    };
  }

  // Graceful Fallback: If caller passed a word, vowel-marked token or multi-letter combination,
  // resolve via Authentic Quran Words Map rather than failing
  const wordFallback = resolveWordAudio(char) || resolveWordAudio(base);
  if (wordFallback && wordFallback.found) {
    return {
      found: true,
      urls: wordFallback.urls,
      assetId: wordFallback.assetId,
      baseLetter: base || char,
    };
  }

  return {
    found: false,
    urls: [],
    assetId: `letter_${base || char}`,
    missingAsset: true,
    reason: `No verified studio recording available for letter: "${char}"`,
  };
}

/**
 * Resolves candidate audio URLs for Arabic text (Harakat, Sukoon, Tajweed, Words)
 * @param {string} text
 * @returns {{ found: boolean, urls: string[]|string[][], assetId: string, isSequence?: boolean }}
 */
export function resolveArabicSoundAudio(text) {
  if (!text) {
    return { found: false, urls: [], missingAsset: true, reason: "Empty text" };
  }

  const clean = cleanArabicString(text);

  // 1. Direct match in Authentic Quran Words Map (WBW CDN / Master Qari recordings)
  const wordMatch = resolveWordAudio(clean);
  if (wordMatch.found) {
    return {
      found: true,
      urls: wordMatch.urls,
      isSequence: false,
      assetId: wordMatch.assetId,
    };
  }

  // 2. Direct match in Authentic Tajweed / Noorani Map
  const authenticTrack =
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean] ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFC")] ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFD")];

  if (authenticTrack) {
    if (Array.isArray(authenticTrack)) {
      return {
        found: true,
        urls: authenticTrack,
        isSequence: true,
        assetId: `tajweed_seq_${clean}`,
      };
    }
    return {
      found: true,
      urls: [authenticTrack],
      isSequence: false,
      assetId: `tajweed_${clean}`,
    };
  }

  // 2. Single letter with Sukoon (requires preceding Hamzah e.g. جْ -> أَجْ)
  const isSingleLetterSukoon = /^[\u0621-\u064A]\u0652$/.test(clean);
  if (isSingleLetterSukoon) {
    const hamzaForm = "أَ" + clean;
    const hamzaTrack = AUTHENTIC_TAJWEED_AUDIO_MAP[hamzaForm];
    if (hamzaTrack) {
      return {
        found: true,
        urls: Array.isArray(hamzaTrack) ? hamzaTrack : [hamzaTrack],
        isSequence: Array.isArray(hamzaTrack),
        assetId: `sukoon_${clean}`,
      };
    }
  }

  // 3. Pure letter without Harakat -> Takhti 1
  const hasHarakat = /[\u064B-\u065F\u0670]/.test(clean);
  if (!hasHarakat) {
    const letterRes = resolveLetterAudio(clean);
    if (letterRes.found) {
      return {
        found: true,
        urls: letterRes.urls,
        isSequence: false,
        assetId: letterRes.assetId,
      };
    }
  }

  // Missing Asset: NEVER substitute robotic browser speech for Quranic Arabic!
  return {
    found: false,
    urls: [],
    assetId: `arabic_${clean}`,
    missingAsset: true,
    reason: `Missing verified Qari studio recording for "${clean}". Robotic voice substitution prohibited.`,
  };
}

/**
 * Resolves candidate audio URLs for Quran Ayah recitation
 * @param {number|string} surahNumber
 * @param {number|string} ayahNumber
 * @param {string} [qariId="alafasy"]
 */
export function resolveAyahAudio(surahNumber, ayahNumber, qariId = "alafasy") {
  const url = getQariAudioUrl(qariId, surahNumber, ayahNumber);
  const fallbackUrl = qariId !== "alafasy"
    ? getQariAudioUrl("alafasy", surahNumber, ayahNumber)
    : getQariAudioUrl("husary_muallim", surahNumber, ayahNumber);

  return {
    found: true,
    urls: [url, fallbackUrl],
    assetId: `ayah_${surahNumber}_${ayahNumber}_${qariId}`,
    surahNumber,
    ayahNumber,
    qariId,
  };
}

export default {
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
  AUTHENTIC_QURAN_WORDS_MAP,
  extractBaseArabicLetter,
  resolveLetterAudio,
  resolveArabicSoundAudio,
  resolveWordAudio,
  resolveAyahAudio,
};

