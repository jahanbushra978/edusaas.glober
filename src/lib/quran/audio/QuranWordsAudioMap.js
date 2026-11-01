/**
 * Authentic Quran Words Audio Map & Word Resolver
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Maps Quranic words, Noorani Qaida vocabulary, and Juz Amma words
 * to verified authentic human Qari studio recordings (Quran.com WBW CDN / EveryAyah / Noorani Master Tracks).
 * 
 * STRICT ARCHITECTURAL INVARIANT:
 * ZERO ROBOTIC BROWSER TTS (synthetic speech is strictly prohibited).
 */

export const AUTHENTIC_QURAN_WORDS_MAP = {
  // ── Drag & Drop Game Words (Levels 11 - 14) ──
  "قُلْ": "https://audio.qurancdn.com/wbw/112_001_001.mp3",
  "أَبْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a",
  "يَدْ": "https://audio.qurancdn.com/wbw/111_001_001.mp3",
  "رَبِّ": "https://audio.qurancdn.com/wbw/001_002_002.mp3",
  "إِنَّ": "https://audio.qurancdn.com/wbw/108_001_001.mp3",
  "ثُمَّ": "https://audio.qurancdn.com/wbw/102_004_001.mp3",
  "أَحَدٌ": "https://audio.qurancdn.com/wbw/112_001_004.mp3",
  "صَمَدٌ": "https://audio.qurancdn.com/wbw/112_002_002.mp3",
  "الصَّمَدُ": "https://audio.qurancdn.com/wbw/112_002_002.mp3",
  "كُفُوًا": "https://audio.qurancdn.com/wbw/112_004_003.mp3",
  "الْحَمْدُ": "https://audio.qurancdn.com/wbw/001_002_001.mp3",
  "الْفَلَقِ": "https://audio.qurancdn.com/wbw/113_001_003.mp3",
  "فَلَقْ": "https://audio.qurancdn.com/wbw/113_001_003.mp3",
  "النَّاسِ": "https://audio.qurancdn.com/wbw/114_001_003.mp3",

  // ── Harakat Master Words (Takhti 4, 5, 6, 8, 9, 11) ──
  "دَرَسَ": "https://audio.qurancdn.com/wbw/006_105_005.mp3",
  "وَجَدَ": "https://audio.qurancdn.com/wbw/093_007_001.mp3",
  "كَتَبَ": "https://audio.qurancdn.com/wbw/058_021_001.mp3",
  "خَلَقَ": "https://audio.qurancdn.com/wbw/096_001_003.mp3",
  "قَالَ": "https://audio.qurancdn.com/wbw/002_030_006.mp3",
  "يَقُولُ": "https://audio.qurancdn.com/wbw/002_008_002.mp3",
  "نُورٌ": "https://audio.qurancdn.com/wbw/024_035_012.mp3",
  "فِيهِ": "https://audio.qurancdn.com/wbw/002_002_003.mp3",

  // ── Tashdeed & Madd Curriculum Drill Words ──
  "مَدَّ": "https://audio.qurancdn.com/wbw/025_045_005.mp3",
  "حَقَّ": "https://audio.qurancdn.com/wbw/022_074_002.mp3",
  "عَدَّ": "https://audio.qurancdn.com/wbw/019_094_003.mp3",
  "نُوحِيهَا": "https://audio.qurancdn.com/wbw/011_049_003.mp3",

  // ── Surah Al-Fatiha Word-by-Word ──
  "بِسْمِ": "https://audio.qurancdn.com/wbw/001_001_001.mp3",
  "اللَّهِ": "https://audio.qurancdn.com/wbw/001_001_002.mp3",
  "الرَّحْمَٰنِ": "https://audio.qurancdn.com/wbw/001_001_003.mp3",
  "الرَّحِيمِ": "https://audio.qurancdn.com/wbw/001_001_004.mp3",
  "لِلَّهِ": "https://audio.qurancdn.com/wbw/001_002_002.mp3",
  "الْعَالَمِينَ": "https://audio.qurancdn.com/wbw/001_002_004.mp3",
  "مَالِكِ": "https://audio.qurancdn.com/wbw/001_004_001.mp3",
  "يَوْمِ": "https://audio.qurancdn.com/wbw/001_004_002.mp3",
  "الدِّينِ": "https://audio.qurancdn.com/wbw/001_004_003.mp3",
  "إِيَّاكَ": "https://audio.qurancdn.com/wbw/001_005_001.mp3",
  "نَعْبُدُ": "https://audio.qurancdn.com/wbw/001_005_002.mp3",
  "وَإِيَّاكَ": "https://audio.qurancdn.com/wbw/001_005_003.mp3",
  "نَسْتَعِينُ": "https://audio.qurancdn.com/wbw/001_005_004.mp3",
  "اهْدِنَا": "https://audio.qurancdn.com/wbw/001_006_001.mp3",
  "الصِّرَاطَ": "https://audio.qurancdn.com/wbw/001_006_002.mp3",
  "الْمُسْتَقِيمَ": "https://audio.qurancdn.com/wbw/001_006_003.mp3",

  // ── Murakkabat Combinations (Takhti 2) ──
  "لا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "لَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "با": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-26.m4a",
  "بَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-26.m4a",
  "جا": "https://audio.qurancdn.com/wbw/110_001_002.mp3", // جَاءَ
  "جَا": "https://audio.qurancdn.com/wbw/110_001_002.mp3",
  "بل": "https://audio.qurancdn.com/wbw/085_019_001.mp3", // بَلِ
  "بَلْ": "https://audio.qurancdn.com/wbw/085_019_001.mp3",
  "تح": "https://audio.qurancdn.com/wbw/002_025_009.mp3", // تَحْتِهَا
  "تَحْتَ": "https://audio.qurancdn.com/wbw/002_025_009.mp3",

  // ── Juz 30 Short Surah Keywords ──
  "أَعُوذُ": "https://audio.qurancdn.com/wbw/113_001_002.mp3",
  "بِرَبِّ": "https://audio.qurancdn.com/wbw/113_001_003.mp3",
  "شَرِّ": "https://audio.qurancdn.com/wbw/113_002_002.mp3",
  "مَا": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "مَلِكِ": "https://audio.qurancdn.com/wbw/114_002_001.mp3",
  "إِلَٰهِ": "https://audio.qurancdn.com/wbw/114_003_001.mp3",
  "الْوَسْوَاسِ": "https://audio.qurancdn.com/wbw/114_004_002.mp3",
  "الْخَنَّاسِ": "https://audio.qurancdn.com/wbw/114_004_003.mp3",
  "الَّذِي": "https://audio.qurancdn.com/wbw/114_005_001.mp3",
  "يُوَسْوِسُ": "https://audio.qurancdn.com/wbw/114_005_002.mp3",
  "صُدُورِ": "https://audio.qurancdn.com/wbw/114_005_004.mp3",
  "الْجِنَّةِ": "https://audio.qurancdn.com/wbw/114_006_002.mp3",
  "وَالنَّاسِ": "https://audio.qurancdn.com/wbw/114_006_003.mp3",
  "كَوْثَرَ": "https://audio.qurancdn.com/wbw/108_001_003.mp3",
  "فَصَلِّ": "https://audio.qurancdn.com/wbw/108_002_001.mp3",
  "وَانْحَرْ": "https://audio.qurancdn.com/wbw/108_002_003.mp3",
  "شَانِئَكَ": "https://audio.qurancdn.com/wbw/108_003_002.mp3",
  "الْأَبْتَرُ": "https://audio.qurancdn.com/wbw/108_003_004.mp3",
  "نَصْرُ": "https://audio.qurancdn.com/wbw/110_001_003.mp3",
  "الْفَتْحُ": "https://audio.qurancdn.com/wbw/110_001_004.mp3",
  "وَرَأَيْتَ": "https://audio.qurancdn.com/wbw/110_002_001.mp3",
  "أَفْوَاجًا": "https://audio.qurancdn.com/wbw/110_002_004.mp3",
  "تَوَّابًا": "https://audio.qurancdn.com/wbw/110_003_006.mp3",
  "تَبَّتْ": "https://audio.qurancdn.com/wbw/111_001_001.mp3",
  "أَبِي": "https://audio.qurancdn.com/wbw/111_001_002.mp3",
  "لَهَبٍ": "https://audio.qurancdn.com/wbw/111_001_003.mp3",
  "وَتَبَّ": "https://audio.qurancdn.com/wbw/111_001_004.mp3",
};

/**
 * Strips tatweel (kashida) and extra whitespace
 */
function normalizeArabicText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves candidate audio URLs for any Quranic word
 * @param {string} wordText
 * @returns {{ found: boolean, urls: string[], assetId: string, word: string }}
 */
export function resolveWordAudio(wordText) {
  if (!wordText) {
    return { found: false, urls: [], assetId: "word_empty", word: "" };
  }

  const clean = normalizeArabicText(wordText);
  const nfc = clean.normalize("NFC");
  const nfd = clean.normalize("NFD");

  // 1. Direct match with exact diacritics
  const url =
    AUTHENTIC_QURAN_WORDS_MAP[clean] ||
    AUTHENTIC_QURAN_WORDS_MAP[nfc] ||
    AUTHENTIC_QURAN_WORDS_MAP[nfd];

  if (url) {
    return {
      found: true,
      urls: [url],
      assetId: `quran_word_${clean}`,
      word: clean,
    };
  }

  // 2. Strip diacritics match as fallback
  const stripped = clean.replace(/[\u064B-\u065F\u0670]/g, "").trim();
  const strippedNfc = stripped.normalize("NFC");

  for (const [key, audioUrl] of Object.entries(AUTHENTIC_QURAN_WORDS_MAP)) {
    const keyStripped = key.replace(/[\u064B-\u065F\u0670]/g, "").trim();
    if (keyStripped === stripped || keyStripped.normalize("NFC") === strippedNfc) {
      return {
        found: true,
        urls: [audioUrl],
        assetId: `quran_word_${clean}`,
        word: clean,
      };
    }
  }

  return {
    found: false,
    urls: [],
    assetId: `quran_word_${clean}`,
    word: clean,
  };
}

export default {
  AUTHENTIC_QURAN_WORDS_MAP,
  resolveWordAudio,
};
