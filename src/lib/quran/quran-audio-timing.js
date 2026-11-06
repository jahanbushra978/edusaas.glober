/**
 * Quran Audio Precise Word-by-Word Synchronizer
 * (কুরআন অডিও নিখুঁত শব্দ-বাই-শব্দ সিঙ্ক্রোনাইজার)
 *
 * Uses official millisecond-accurate verse audio segments from Quran.com / QuranCDN
 * with local caching and an intelligent Tajweed-aware fallback engine.
 */

export const QDC_RECITER_MAP = {
  alafasy: 7, // Mishary Rashid Alafasy
  husary_muallim: 6, // Mahmoud Khalil Al-Husary
  abdul_basit: 1, // Abdul Basit Abdus Samad
  sudais: 3, // Abdur-Rahman As-Sudais
  ghamadi: 4, // Saad Al-Ghamdi
  minshawy_teacher: 2, // Mohamed Siddiq Al-Minshawi
};

/**
 * Standard Unicode regex matching all standalone Quranic Waqf & recitation symbols.
 * (علائم الوقف: ۚ, ۗ, ۖ, ۘ, ۙ, ۜ, ۞, ۩, ۛ etc.)
 */
export const WAQF_OR_SIGN_REGEX = /^[\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u06DE\u06E9\u06DD\uFD3E\uFD3F\s\(\)\[\]\d০-৯0-9\.,:-]+$/;

/**
 * Split Arabic Quran Ayah text into clean individual words,
 * automatically merging standalone Waqf signs with their preceding host word.
 * This ensures the word array length perfectly matches QuranCDN's word segment count 1-to-1.
 *
 * @param {string|Array} textOrWords
 * @returns {string[]} Array of synchronized Arabic words
 */
export function splitArabicAyahWords(textOrWords) {
  if (!textOrWords) return [];
  let rawList = [];
  if (Array.isArray(textOrWords)) {
    rawList = textOrWords.map((w) => (typeof w === "string" ? w : w.ar || w.text || ""));
  } else if (typeof textOrWords === "string") {
    rawList = textOrWords.trim().split(/\s+/);
  } else {
    return [];
  }

  const merged = [];
  let pendingPrefix = "";
  for (const token of rawList) {
    if (!token) continue;
    if (WAQF_OR_SIGN_REGEX.test(token)) {
      if (merged.length > 0) {
        merged[merged.length - 1] += " " + token;
      } else {
        pendingPrefix = pendingPrefix ? pendingPrefix + " " + token : token;
      }
    } else {
      if (pendingPrefix) {
        merged.push(pendingPrefix + " " + token);
        pendingPrefix = "";
      } else {
        merged.push(token);
      }
    }
  }
  return merged;
}

// In-memory cache for chapter segments
const chapterSegmentsCache = new Map();

/**
 * Fetch and cache millisecond segments for an entire chapter/surah
 */
export async function loadChapterSegments(chapterNumber, qariId = "alafasy") {
  const reciterId = QDC_RECITER_MAP[qariId] || 7;
  const cacheKey = `${reciterId}:${chapterNumber}`;

  if (chapterSegmentsCache.has(cacheKey)) {
    return chapterSegmentsCache.get(cacheKey);
  }

  // Check localStorage if available
  const storageKey = `rahmania_segments_v2_${reciterId}_${chapterNumber}`;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        chapterSegmentsCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${chapterNumber}&segments=true`,
      { signal: AbortSignal.timeout(7000) }
    );

    if (res.ok) {
      const data = await res.json();
      const timings = data.audio_files?.[0]?.verse_timings || [];
      const segmentMap = {};

      timings.forEach((vt) => {
        if (!vt.segments || vt.segments.length === 0) return;
        // Filter out any malformed/trailing non-tuple segment entries
        const validSegments = vt.segments.filter((seg) => Array.isArray(seg) && seg.length >= 3);
        if (validSegments.length === 0) return;

        // Detect and remove trailing outro artifact (e.g. abrupt reset to word 1 after verse completion)
        let maxWord = 0;
        for (const s of validSegments) {
          if (s[0] > maxWord) maxWord = s[0];
        }
        const lastSeg = validSegments[validSegments.length - 1];
        const cleanSegments = (validSegments.length > 3 && maxWord >= 5 && lastSeg[0] <= 2)
          ? validSegments.slice(0, -1)
          : validSegments;

        const baseOffset = cleanSegments[0][1];
        // Normalize segment timings relative to the start of this verse audio (0ms)
        const normalized = cleanSegments.map((seg) => ({
          wordIndex: Math.max(0, seg[0] - 1),
          startMs: Math.max(0, seg[1] - baseOffset),
          endMs: Math.max(0, seg[2] - baseOffset),
        }));
        segmentMap[vt.verse_key] = normalized;
      });

      chapterSegmentsCache.set(cacheKey, segmentMap);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(segmentMap));
        } catch {}
      }

      return segmentMap;
    }
  } catch (err) {
    console.warn(`[QuranTiming] Could not load QuranCDN segments for Surah ${chapterNumber}:`, err?.message);
  }

  return null;
}

/**
 * Enhanced Tajweed-aware timing calculation fallback
 * Handles Madd letters, Tashdeed, and Ayah-ending stops
 */
export function calculateTajweedWordIndex(currentTimeSec, durationSec, words = []) {
  if (!words || words.length <= 1) return 0;
  if (!durationSec || durationSec <= 0) return 0;

  // Account for typical introductory silence (0.25s) and trailing reverb (0.5s)
  const introSilence = 0.25;
  const outroSilence = 0.5;
  const effectiveTime = Math.max(0, currentTimeSec - introSilence);
  const effectiveDuration = Math.max(0.1, durationSec - introSilence - outroSilence);
  const progress = Math.min(0.999, effectiveTime / effectiveDuration);

  const totalWords = words.length;

  const weights = words.map((w, idx) => {
    const raw = typeof w === "string" ? w : (w.ar || w.text || "");
    const clean = raw.replace(/[\u064B-\u065F\u0670]/g, "");
    let wt = Math.max(2, clean.length);

    // 1. Long Madd (مَدّ لازِم / متصل / منفصل) with tilde (~) or superscripts:
    if (/[~ٓ]/.test(raw) || clean.includes("الضالين")) {
      wt += 16.0; // Madd Lazim takes 6 counts (~3-4x normal word time)
    } else if (/[اوي]/.test(clean)) {
      wt += 1.8;
    }

    // 2. Tashdeed (ّ) gemination hold:
    if (/[\u0651]/.test(raw)) {
      wt += 1.5;
    }

    // 3. Ending word of the Ayah (Waqf & Madd Arid Lis-Sukoon):
    if (idx === totalWords - 1) {
      wt += 4.5;
    }

    return wt;
  });

  const totalWeight = weights.reduce((sum, v) => sum + v, 0);
  let accumulated = 0;
  let activeIndex = 0;

  for (let i = 0; i < totalWords; i++) {
    accumulated += weights[i] / totalWeight;
    if (progress < accumulated || i === totalWords - 1) {
      activeIndex = i;
      break;
    }
  }

  return activeIndex;
}

/**
 * Compute the precise active Arabic word index
 */
export function getActiveArabicWordIndex({
  currentTime,
  duration,
  surahNumber,
  ayahNumber,
  qariId,
  words = [],
}) {
  if (!words || words.length === 0) return 0;
  if (!duration || duration <= 0) return 0;

  const cleanWords = splitArabicAyahWords(words);
  const totalWords = cleanWords.length || (Array.isArray(words) ? words.length : 1);
  if (totalWords <= 1) return 0;

  const reciterId = QDC_RECITER_MAP[qariId] || 7;
  const cacheKey = `${reciterId}:${surahNumber}`;
  const segmentsMap = chapterSegmentsCache.get(cacheKey);
  const verseKey = `${surahNumber}:${ayahNumber}`;

  if (segmentsMap && segmentsMap[verseKey]) {
    const segments = segmentsMap[verseKey];
    const currentMs = currentTime * 1000;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (currentMs >= seg.startMs && currentMs < seg.endMs) {
        return Math.min(seg.wordIndex, totalWords - 1);
      }
      // If past the last segment, hold on the last word until playback ends
      if (i === segments.length - 1 && currentMs >= seg.endMs) {
        return totalWords - 1;
      }
    }
  }

  // Fallback to Tajweed acoustic pacing
  return calculateTajweedWordIndex(currentTime, duration, cleanWords);
}

