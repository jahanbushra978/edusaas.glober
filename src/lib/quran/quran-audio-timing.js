/**
 * Quran Audio Precise Word-by-Word Synchronizer
 * (কুরআন অডিও নিখুঁত শব্দ-বাই-শব্দ সিঙ্ক্রোনাইজার)
 *
 * Uses official millisecond-accurate verse audio segments from Quran.com / QuranCDN
 * with local caching and an intelligent Tajweed-aware fallback engine.
 */

import { WAQF_IBTIDA_REGISTRY, normalizeQuranWord } from "./hafizi-annotations.js";

export const QDC_RECITER_MAP = {
  alafasy: 7, // Mishary Rashid Alafasy
  husary_muallim: 12, // Mahmoud Khalil Al-Husary (Muallim)
  abdul_basit: 1, // Abdul Basit Abdus Samad
  sudais: 3, // Abdur-Rahman As-Sudais
  minshawy_teacher: 168, // Mohamed Siddiq Al-Minshawi (Kids repeat - মুআল্লিম ও ছাত্রদল)
};

/**
 * Standard Unicode regex matching all standalone Quranic Waqf & recitation symbols.
 * (علائم الوقف: ۚ, ۗ, ۖ, ۘ, ۙ, ۜ, ۞, ۩, ۛ etc.)
 */
export const WAQF_OR_SIGN_REGEX = /^[\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u06DE\u06E9\u06DD\uFD3E\uFD3F\s\(\)\[\]\d০-৯0-9\.,:-]+$/;

/**
 * Regex matching authentic written Quranic Waqf symbols and section marks.
 * (علائم الوقف المكتوبة في المصحف: ۖ, ۗ, ۘ, ۚ, ۛ, ۜ, قلى, صلى, ج, ط, م, قف, ۞, ۩ ইত্যাদি)
 */
export const AUTHENTIC_WAQF_GLYPH_REGEX = /[\u06D6-\u06DC\u06DE\u06E9ۖۗۘۚۛۜ۞۩]|(?:\s|^)(?:قلى|صلى|ج|ط|م|قف)(?:\s|$)/;

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
  const reciterId = QDC_RECITER_MAP[qariId];
  if (!reciterId) {
    // This reciter (e.g. Saad Al-Ghamdi) does not have QuranCDN segment maps.
    // Return null so the system uses the Tajweed acoustic fallback engine smoothly.
    return null;
  }
  const cacheKey = `${reciterId}:${chapterNumber}`;

  if (chapterSegmentsCache.has(cacheKey)) {
    return chapterSegmentsCache.get(cacheKey);
  }

  // Check localStorage if available
  const storageKey = `rahmania_segments_v5_${reciterId}_${chapterNumber}`;
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
      const isTeacherMode = qariId === "minshawy_teacher" || reciterId === 168;

      timings.forEach((vt) => {
        if (!vt.segments || vt.segments.length === 0) return;
        // Filter out any malformed/trailing non-tuple segment entries
        const validSegments = vt.segments.filter((seg) => Array.isArray(seg) && seg.length >= 3);
        if (validSegments.length === 0) return;

        // Detect and remove trailing outro artifact (e.g. abrupt reset to word 1 after verse completion)
        let cleanSegments = validSegments;
        if (!isTeacherMode) {
          let maxWord = 0;
          for (const s of validSegments) {
            if (s[0] > maxWord) maxWord = s[0];
          }
          const lastSeg = validSegments[validSegments.length - 1];
          cleanSegments = (validSegments.length > 3 && maxWord >= 5 && lastSeg[0] <= 2)
            ? validSegments.slice(0, -1)
            : validSegments;
        }

        const baseOffset = cleanSegments[0][1];
        let currentSpeaker = "ustad";
        let prevWord = 0;
        const repeats = [];

        // Normalize segment timings relative to the start of this verse audio (0ms)
        const normalized = cleanSegments.map((seg) => {
          const currWord = seg[0];
          // Authentic repeat occurs ONLY when Qari steps BACKWARDS in the verse (currWord < prevWord).
          // If currWord === prevWord, it is simply a multi-part segment of the same word (e.g. Madd elongation), NOT a repeat!
          if (currWord < prevWord && prevWord > 0) {
            if (isTeacherMode) {
              currentSpeaker = currentSpeaker === "ustad" ? "student" : "ustad";
            }
            repeats.push({
              stopWordIdx: prevWord - 1, // 0-based word index
              resumeWordIdx: currWord - 1, // 0-based word index
            });
          }
          prevWord = currWord;

          return {
            wordIndex: Math.max(0, currWord - 1),
            startMs: Math.max(0, seg[1] - baseOffset),
            endMs: Math.max(0, seg[2] - baseOffset),
            speaker: currentSpeaker,
          };
        });

        segmentMap[vt.verse_key] = normalized;
        const validRepeats = repeats.filter(
          (r) => r.stopWordIdx > r.resumeWordIdx && r.stopWordIdx >= 0 && r.resumeWordIdx >= 0
        );
        if (validRepeats.length > 0) {
          segmentMap[`${vt.verse_key}_repeats`] = validRepeats;
        }
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

  // Account for acoustic boundaries with natural micro-offset
  const introSilence = 0.12;
  const outroSilence = 0.2;
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
      wt += 14.0; // Madd Lazim takes 6 counts (~3-4x normal word time)
    } else if (/[اوي]/.test(clean)) {
      wt += 1.8;
    }

    // 2. Tashdeed (ّ) gemination hold:
    if (/[\u0651]/.test(raw)) {
      wt += 1.5;
    }

    // 3. Waqf breath pause marks (الوقف والتنفس: ۘ, ۚ, ۗ, ۖ, ۜ, ۞, ۩):
    // Every Qari halts 1.5s to 3s to breathe at internal stop signs in long verses.
    // Weighting these prevents the highlight from prematurely flying into the next sentence.
    if (/[ۘۚۗۖۜ۞۩]/.test(raw)) {
      wt += 12.0;
    }

    // 4. Ending word of the Ayah (Waqf & Madd Arid Lis-Sukoon):
    if (idx === totalWords - 1) {
      wt += 5.0;
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
 * Compute the precise active Arabic word index and speaker role
 * (Distinguishes between Ustad and Student repetitions in Teacher recitations)
 */
export function getActiveArabicWordDetails({
  currentTime,
  duration,
  surahNumber,
  ayahNumber,
  qariId = "alafasy",
  words = [],
}) {
  const isTeacherMode = qariId === "minshawy_teacher";
  if (!words || words.length === 0) return { wordIndex: 0, speaker: "ustad", isTeacherMode };
  if (!duration || duration <= 0) return { wordIndex: 0, speaker: "ustad", isTeacherMode };

  const cleanWords = splitArabicAyahWords(words);
  const totalWords = cleanWords.length || (Array.isArray(words) ? words.length : 1);
  if (totalWords <= 1) return { wordIndex: 0, speaker: "ustad", isTeacherMode };

  const reciterId = QDC_RECITER_MAP[qariId];
  if (!reciterId) {
    // Reciters without QuranCDN segment maps (e.g. Saad Al-Ghamdi)
    // Synchronize smoothly using Tajweed acoustic pacing against actual EveryAyah audio duration
    return {
      wordIndex: calculateTajweedWordIndex(currentTime, duration, cleanWords),
      speaker: "ustad",
      isTeacherMode,
    };
  }

  const cacheKey = `${reciterId}:${surahNumber}`;
  let segmentsMap = chapterSegmentsCache.get(cacheKey);

  // Fast synchronous hydrate from localStorage if in-memory cache is cold
  if (!segmentsMap && typeof window !== "undefined") {
    try {
      const storageKey = `rahmania_segments_v5_${reciterId}_${surahNumber}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        segmentsMap = JSON.parse(stored);
        chapterSegmentsCache.set(cacheKey, segmentsMap);
      }
    } catch {}

    // Trigger async preload in the background if neither memory nor storage has it yet
    if (!segmentsMap) {
      loadChapterSegments(surahNumber, qariId).catch(() => {});
    }
  }

  const verseKey = `${surahNumber}:${ayahNumber}`;

  if (segmentsMap && segmentsMap[verseKey]) {
    const rawSegments = segmentsMap[verseKey];
    if (rawSegments && rawSegments.length > 0) {
      const maxSegEndMs = rawSegments[rawSegments.length - 1].endMs || (duration * 1000);
      const audioDurationMs = duration * 1000;

      // Proportional scale factor between QuranCDN verse segments and actual EveryAyah audio duration.
      // Clamp scale to [0.6, 1.8] to prevent extreme drift when segment/audio durations mismatch.
      const rawScale = (maxSegEndMs > 1000 && audioDurationMs > 1000)
        ? audioDurationMs / maxSegEndMs
        : 1.0;
      const scale = Math.min(1.8, Math.max(0.6, rawScale));

      // Synchronize directly with millisecond-accurate QuranCDN segment boundaries (0ms lag)
      const currentMs = Math.max(0, currentTime * 1000);

      // If currentMs is before the very first segment, stay on the first segment
      if (currentMs < rawSegments[0].startMs * scale) {
        return {
          wordIndex: Math.min(rawSegments[0].wordIndex, totalWords - 1),
          speaker: rawSegments[0].speaker || "ustad",
          isTeacherMode,
        };
      }

      // Find which segment currentMs belongs to.
      // Crucial: A word remains smoothly highlighted through acoustic pauses until the NEXT word begins.
      for (let i = 0; i < rawSegments.length; i++) {
        const seg = rawSegments[i];
        const segStart = seg.startMs * scale;
        const nextSeg = rawSegments[i + 1];
        const segEnd = nextSeg ? nextSeg.startMs * scale : (seg.endMs * scale);

        if (currentMs >= segStart && currentMs < segEnd) {
          return {
            wordIndex: Math.min(seg.wordIndex, totalWords - 1),
            speaker: seg.speaker || "ustad",
            isTeacherMode,
          };
        }
      }

      // If past the last segment, hold on the last segment until playback completes
      const lastSeg = rawSegments[rawSegments.length - 1];
      return {
        wordIndex: Math.min(lastSeg.wordIndex, totalWords - 1),
        speaker: lastSeg.speaker || "ustad",
        isTeacherMode,
      };
    }
  }

  // Fallback to Tajweed acoustic pacing with waqf breath pauses
  return {
    wordIndex: calculateTajweedWordIndex(currentTime, duration, cleanWords),
    speaker: "ustad",
    isTeacherMode,
  };
}

/**
 * Compute the precise active Arabic word index (backward-compatible wrapper)
 */
export function getActiveArabicWordIndex(args) {
  return getActiveArabicWordDetails(args).wordIndex;
}

/**
 * Calculate expected start time in seconds for a specific word based on Tajweed syllable weights
 */
export function calculateTajweedWordStartTime(targetWordIndex, durationSec, words = []) {
  if (!targetWordIndex || targetWordIndex <= 0) return 0;
  if (!words || words.length <= 1) return 0;

  const totalWords = words.length;
  const weights = words.map((w, idx) => {
    const raw = typeof w === "string" ? w : (w.ar || w.text || "");
    const clean = raw.replace(/[\u064B-\u065F\u0670]/g, "");
    let wt = Math.max(2, clean.length);
    if (/[~ٓ]/.test(raw) || clean.includes("الضالين")) wt += 14.0;
    else if (/[اوي]/.test(clean)) wt += 1.8;
    if (/[\u0651]/.test(raw)) wt += 1.5;
    if (/[ۘۚۗۖۜ۞۩]/.test(raw)) wt += 12.0;
    if (idx === totalWords - 1) wt += 5.0;
    return wt;
  });

  const totalWeight = weights.reduce((sum, v) => sum + v, 0);
  let accumulatedBefore = 0;
  for (let i = 0; i < Math.min(targetWordIndex, totalWords); i++) {
    accumulatedBefore += weights[i];
  }

  const introSilence = 0.5;
  const outroSilence = 0.4;
  const effectiveDuration = Math.max(0.1, (durationSec || (totalWords * 1.5)) - introSilence - outroSilence);
  const ratio = totalWeight > 0 ? accumulatedBefore / totalWeight : 0;
  return Math.max(0, introSilence + (ratio * effectiveDuration));
}

/**
 * Compute the precise start timestamp (in seconds) for seeking to an exact word in an Ayah
 */
export function getWordStartTimeSec({
  surahNumber,
  ayahNumber,
  wordIndex = 0,
  qariId = "husary_muallim",
  duration = 0,
  words = [],
}) {
  if (!wordIndex || wordIndex <= 0) return 0;
  const cleanWords = splitArabicAyahWords(words);
  const totalWords = cleanWords.length || 1;
  const targetIdx = Math.min(wordIndex, totalWords - 1);

  const reciterId = QDC_RECITER_MAP[qariId];
  if (!reciterId) {
    return calculateTajweedWordStartTime(targetIdx, duration, cleanWords);
  }

  const cacheKey = `${reciterId}:${surahNumber}`;
  let segmentsMap = chapterSegmentsCache.get(cacheKey);

  if (!segmentsMap && typeof window !== "undefined") {
    try {
      const storageKey = `rahmania_segments_v5_${reciterId}_${surahNumber}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        segmentsMap = JSON.parse(stored);
        chapterSegmentsCache.set(cacheKey, segmentsMap);
      }
    } catch {}
  }

  const verseKey = `${surahNumber}:${ayahNumber}`;
  if (segmentsMap && segmentsMap[verseKey]) {
    const rawSegments = segmentsMap[verseKey];
    if (rawSegments && rawSegments.length > 0) {
      const seg = rawSegments.find((s) => s.wordIndex === targetIdx);
      if (seg) {
        const maxSegEndMs = rawSegments[rawSegments.length - 1].endMs || (duration * 1000);
        const audioDurationMs = duration > 0 ? duration * 1000 : maxSegEndMs;
        const scale = (maxSegEndMs > 1000 && audioDurationMs > 1000)
          ? audioDurationMs / maxSegEndMs
          : 1.0;
        return Math.max(0, (seg.startMs * scale) / 1000);
      }
    }
  }

  // Tajweed acoustic pacing fallback based on syllable weight
  return calculateTajweedWordStartTime(targetIdx, duration, cleanWords);
}

/**
 * Get authentic reciter breath pause (Waqf) and restart (Ibtida) word indices
 * computed dynamically from millisecond audio segments across all 114 Surahs
 */
export function getVerseRepeats(surahNumber, ayahNumber, qariId = "alafasy") {
  const reciterId = QDC_RECITER_MAP[qariId];
  if (!reciterId) {
    return [];
  }

  const cacheKey = `${reciterId}:${surahNumber}`;
  let segmentsMap = chapterSegmentsCache.get(cacheKey);

  if (!segmentsMap && typeof window !== "undefined") {
    try {
      const storageKey = `rahmania_segments_v5_${reciterId}_${surahNumber}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        segmentsMap = JSON.parse(stored);
        chapterSegmentsCache.set(cacheKey, segmentsMap);
      }
    } catch {}
  }

  const verseKey = `${surahNumber}:${ayahNumber}`;
  if (segmentsMap && segmentsMap[`${verseKey}_repeats`]) {
    return segmentsMap[`${verseKey}_repeats`];
  }
  return [];
}

/**
 * Universal Waqf & Ibtida Calculation Engine for ALL 114 Surahs and 6,236 Ayahs.
 * Priority 1: Exact audio segment repeats from QuranCDN for the active Qari
 * Priority 2: Canonical verified scholarly registry (WAQF_IBTIDA_REGISTRY)
 * Priority 3: Algorithmic Tajweed breath pause and syntactic resume engine across any long span
 */
export function getUniversalAyahRepeats(surahNumber, ayahNumber, words = [], qariId = "minshawy_teacher") {
  const cleanWords = Array.isArray(words) ? words : splitArabicAyahWords(words);
  if (!cleanWords || cleanWords.length === 0) return [];

  // 1. Dynamic audio repeats for the active Qari
  const dynamic = getVerseRepeats(surahNumber, ayahNumber, qariId);
  if (dynamic && dynamic.length > 0) {
    const validDynamic = dynamic.filter(
      (d) =>
        d.stopWordIdx !== d.resumeWordIdx &&
        d.stopWordIdx >= 0 &&
        d.stopWordIdx < cleanWords.length &&
        d.resumeWordIdx >= 0 &&
        d.resumeWordIdx < cleanWords.length &&
        !AUTHENTIC_WAQF_GLYPH_REGEX.test(cleanWords[d.stopWordIdx] || "")
    );
    if (validDynamic.length > 0) {
      return validDynamic.map((d) => ({
        ...d,
        stopAfterWord: d.stopAfterWord || cleanWords[d.stopWordIdx] || "",
        resumeAtWord: d.resumeAtWord || cleanWords[d.resumeWordIdx] || "",
      }));
    }
  }

  // 2. Canonical verified registry
  const key = `${surahNumber}-${ayahNumber}`;
  if (WAQF_IBTIDA_REGISTRY[key] && WAQF_IBTIDA_REGISTRY[key].length > 0) {
    const filteredRegistry = WAQF_IBTIDA_REGISTRY[key].filter((entry) => {
      const stopWord = cleanWords[entry.stopWordIdx] || entry.stopAfterWord || "";
      return !AUTHENTIC_WAQF_GLYPH_REGEX.test(stopWord);
    });
    if (filteredRegistry.length > 0) {
      return filteredRegistry;
    }
  }

  // 3. Universal Quranic breath pause engine for any long verse across all 114 Surahs
  // Rules:
  // - Verse must be long (cleanWords.length >= 14)
  // - Breath span between pauses >= 7 words before a grammatical transition particle, or >= 11 words
  // - No printed stop signs on current word, next word, or next 2 words
  // - At least 3 words away from end of Ayah
  if (!cleanWords || cleanWords.length < 14) return [];

  const repeats = [];
  let lastPauseIdx = 0;

  for (let i = 0; i < cleanWords.length; i++) {
    const w = cleanWords[i];
    const hasWrittenWaqf = AUTHENTIC_WAQF_GLYPH_REGEX.test(w);

    if (hasWrittenWaqf) {
      lastPauseIdx = i;
    } else {
      const spanLen = i - lastPauseIdx;
      if (spanLen >= 7 && i <= cleanWords.length - 3) {
        // If upcoming words already have a printed Waqf mark, let Qari pause on that instead
        const next1HasWaqf = AUTHENTIC_WAQF_GLYPH_REGEX.test(cleanWords[i + 1] || "");
        const next2HasWaqf = AUTHENTIC_WAQF_GLYPH_REGEX.test(cleanWords[i + 2] || "");
        if (next1HasWaqf || next2HasWaqf) {
          continue;
        }

        const nextWord = cleanWords[i + 1] || "";
        const wNorm = normalizeQuranWord(nextWord);
        const isTransitionParticle = /^(واذ|ثم|فان|كما|ان|لعل|بل|حتي|ولكن|فاذا|وهو|وان|فمن|الذين|قال|قالوا|الا|فلما|واذا)$/.test(wNorm);

        if (isTransitionParticle || spanLen >= 11) {
          repeats.push({
            stopWordIdx: i,
            stopAfterWord: cleanWords[i],
            resumeWordIdx: Math.max(0, i - 1),
            resumeAtWord: cleanWords[Math.max(0, i - 1)],
            isAlgorithmic: true,
          });
          lastPauseIdx = i;
        }
      }
    }
  }

  return repeats;
}

