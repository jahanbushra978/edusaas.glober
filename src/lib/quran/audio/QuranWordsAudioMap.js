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
  "يَدْ": "https://audio.qurancdn.com/wbw/009_029_027.mp3",
  "رَبِّ": "https://audio.qurancdn.com/wbw/001_002_003.mp3",
  "إِنَّ": "https://audio.qurancdn.com/wbw/002_006_001.mp3",
  "ثُمَّ": "https://audio.qurancdn.com/wbw/102_004_001.mp3",
  "أَحَدٌ": "https://audio.qurancdn.com/wbw/112_001_004.mp3",
  "صَمَدٌ": "https://audio.qurancdn.com/wbw/112_002_002.mp3",
  "الصَّمَدُ": "https://audio.qurancdn.com/wbw/112_002_002.mp3",
  "كُفُوًا": "https://audio.qurancdn.com/wbw/112_004_004.mp3",
  "الْحَمْدُ": "https://audio.qurancdn.com/wbw/001_002_001.mp3",
  "الْفَلَقِ": "https://audio.qurancdn.com/wbw/113_001_004.mp3",
  "فَلَقْ": "https://audio.qurancdn.com/wbw/113_001_004.mp3",
  "النَّاسِ": "https://audio.qurancdn.com/wbw/114_001_004.mp3",
  "غَاسِقٍ": "https://audio.qurancdn.com/wbw/113_003_001.mp3",
  "وَقَبَ": "https://audio.qurancdn.com/wbw/113_003_003.mp3",
  "الْوَسْوَاسِ": "https://audio.qurancdn.com/wbw/114_004_002.mp3",
  "شَرِّ": "https://audio.qurancdn.com/wbw/113_002_001.mp3",
  "رَبِّ الْعَالَمِينَ": "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
  "إِيَّاكَ نَعْبُدُ": "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
  "قُلْ هُوَ اللَّهُ أَحَدٌ": "https://everyayah.com/data/Alafasy_128kbps/112001.mp3",
  "حَبْلٌ": "https://audio.qurancdn.com/wbw/111_005_002.mp3",
  "حَقّ": "https://audio.qurancdn.com/wbw/002_026_015.mp3",
  "نُوحٍ": "https://audio.qurancdn.com/wbw/071_001_002.mp3",
  "بَيْتٍ": "https://audio.qurancdn.com/wbw/106_003_003.mp3",

  // ── Harakat Master Words (Takhti 4, 5, 6, 8, 9, 11) ──
  "دَرَسَ": "https://audio.qurancdn.com/wbw/006_105_005.mp3",
  "وَجَدَ": "https://audio.qurancdn.com/wbw/093_007_001.mp3",
  "كَتَبَ": "https://audio.qurancdn.com/wbw/058_021_001.mp3",
  "خَلَقَ": "https://audio.qurancdn.com/wbw/096_001_005.mp3",
  "قَالَ": "https://audio.qurancdn.com/wbw/002_030_002.mp3",
  "يَقُولُ": "https://audio.qurancdn.com/wbw/002_008_004.mp3",
  "نُورٌ": "https://audio.qurancdn.com/wbw/024_035_002.mp3",
  "فِيهِ": "https://audio.qurancdn.com/wbw/002_002_005.mp3",

  // ── Tashdeed & Madd Curriculum Drill Words ──
  "مَدَّ": "https://audio.qurancdn.com/wbw/025_045_006.mp3",
  "حَقَّ": "https://audio.qurancdn.com/wbw/022_074_004.mp3",
  "عَدَّ": "https://audio.qurancdn.com/wbw/019_094_003.mp3",
  "نُوحِيهَا": "https://audio.qurancdn.com/wbw/011_049_005.mp3",

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
  "تا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-29.m4a",
  "تَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-29.m4a",
  "ثا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-25.m4a",
  "ثَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-25.m4a",
  "جا": "https://audio.qurancdn.com/wbw/110_001_002.mp3", // جَاءَ
  "جَا": "https://audio.qurancdn.com/wbw/110_001_002.mp3",
  "حا": "https://audio.qurancdn.com/wbw/002_238_001.mp3",
  "حَا": "https://audio.qurancdn.com/wbw/002_238_001.mp3",
  "خا": "https://audio.qurancdn.com/wbw/002_039_006.mp3", // خَالِدُونَ
  "خَا": "https://audio.qurancdn.com/wbw/002_039_006.mp3",
  "দা": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-1.m4a",
  "دا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-1.m4a",
  "دَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-1.m4a",
  "ذا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-4.m4a",
  "ذَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-4.m4a",
  "রা": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-7.m4a",
  "را": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-7.m4a",
  "رَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-7.m4a",
  "زا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-10.m4a",
  "زَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-10.m4a",
  "সা": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-13.m4a",
  "سا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-13.m4a",
  "سَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-13.m4a",
  "شا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-16.m4a",
  "شَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-16.m4a",
  "صا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-19.m4a",
  "صَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-19.m4a",
  "ضا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-22.m4a",
  "ضَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-22.m4a",
  "طا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-25.m4a",
  "طَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-25.m4a",
  "ظا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-28.m4a",
  "ظَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-28.m4a",
  "عا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-31.m4a",
  "عَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-31.m4a",
  "غا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-34.m4a",
  "غَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page14-34.m4a",
  "فا": "https://audio.qurancdn.com/wbw/002_024_001.mp3",
  "فَا": "https://audio.qurancdn.com/wbw/002_024_001.mp3",
  "قا": "https://audio.qurancdn.com/wbw/002_030_002.mp3",
  "قَا": "https://audio.qurancdn.com/wbw/002_030_002.mp3",
  "كا": "https://audio.qurancdn.com/wbw/002_034_009.mp3",
  "كَا": "https://audio.qurancdn.com/wbw/002_034_009.mp3",
  "মা": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "ما": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "مَا": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "না": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-26.m4a",
  "نا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-26.m4a",
  "نَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-26.m4a",
  "وا": "https://audio.qurancdn.com/wbw/002_035_001.mp3",
  "وَا": "https://audio.qurancdn.com/wbw/002_035_001.mp3",
  "হা": "https://audio.qurancdn.com/wbw/091_001_002.mp3",
  "ها": "https://audio.qurancdn.com/wbw/091_001_002.mp3",
  "هَا": "https://audio.qurancdn.com/wbw/091_001_002.mp3",
  "য়া": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-27.m4a",
  "يا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-27.m4a",
  "يَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page2-27.m4a",
  "تَه": "/sounds/noorani/murakkab_taa_haa.mp3",
  "بل": "https://audio.qurancdn.com/wbw/085_019_001.mp3", // بَلِ
  "بَلْ": "https://audio.qurancdn.com/wbw/085_019_001.mp3",
  "تح": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter02/Page3-4.m4a",
  "تَحْتَ": "https://audio.qurancdn.com/wbw/002_025_011.mp3",
  "نح": "https://audio.qurancdn.com/wbw/056_057_001.mp3",
  "نَحْ": "https://audio.qurancdn.com/wbw/056_057_001.mp3",
  "جح": "https://audio.qurancdn.com/wbw/102_006_002.mp3",
  "جَحْ": "https://audio.qurancdn.com/wbw/102_006_002.mp3",
  "عس": "https://audio.qurancdn.com/wbw/081_017_003.mp3", // عَسْعَسَ
  "عَسْ": "https://audio.qurancdn.com/wbw/081_017_003.mp3",

  // ── Noorani Qaida Curriculum Vocabulary ──
  "أَبَدًا": "https://audio.qurancdn.com/wbw/002_095_003.mp3",
  "بَلَدٍ": "https://audio.qurancdn.com/wbw/090_001_004.mp3",
  "بَوْ": "https://audio.qurancdn.com/wbw/002_061_025.mp3", // وَبَاءُوا
  "بَيْ": "https://audio.qurancdn.com/wbw/002_275_018.mp3", // الْبَيْعُ
  "قِيلَ": "https://audio.qurancdn.com/wbw/002_011_002.mp3",
  "خَوْفٌ": "https://audio.qurancdn.com/wbw/002_038_013.mp3",
  "بَيْتٌ": "https://audio.qurancdn.com/wbw/003_096_003.mp3",
  "بَيْتٍ": "https://audio.qurancdn.com/wbw/003_096_003.mp3",
  "الْبَيْتِ": "https://audio.qurancdn.com/wbw/106_003_004.mp3",
  "خَوْفٍ": "https://audio.qurancdn.com/wbw/106_004_007.mp3",
  "يَقْطَعُ": "https://audio.qurancdn.com/wbw/022_015_016.mp3",
  "إِطْعَامٌ": "https://audio.qurancdn.com/wbw/090_014_002.mp3",
  "عَمَّ": "https://audio.qurancdn.com/wbw/078_001_001.mp3",
  "جَنَّةٌ": "https://audio.qurancdn.com/wbw/002_265_012.mp3",
  "كَذَّبَ": "https://audio.qurancdn.com/wbw/091_011_001.mp3",
  "يَزَّكَّىٰ": "https://audio.qurancdn.com/wbw/080_003_004.mp3",
  "مُزَّمِّلُ": "https://audio.qurancdn.com/wbw/073_001_002.mp3",
  "يَصَّدَّقُ": "https://audio.qurancdn.com/wbw/004_092_022.mp3",
  "وَالْعَادِيَاتِ": "https://audio.qurancdn.com/wbw/100_001_001.mp3",
  "وَٱلْعَـٰدِيَـٰتِ": "https://audio.qurancdn.com/wbw/100_001_001.mp3",
  "الضَّالِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",
  "ٱلضَّآلِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",
  "مَنْ": "https://audio.qurancdn.com/wbw/002_008_003.mp3",
  "مَن": "https://audio.qurancdn.com/wbw/002_008_003.mp3",
  "مِن": "https://audio.qurancdn.com/wbw/002_004_008.mp3",
  "ءَامَنَ": "https://audio.qurancdn.com/wbw/002_062_009.mp3",
  "آمَنَ": "https://audio.qurancdn.com/wbw/002_062_009.mp3",
  "تَرْمِيهِم": "https://audio.qurancdn.com/wbw/105_004_001.mp3",
  "بِحِجَارَةٍ": "https://audio.qurancdn.com/wbw/105_004_002.mp3",
  "رَحْمَةٌ": "https://audio.qurancdn.com/wbw/002_157_006.mp3",
  "رَحْمَهْ": "https://audio.qurancdn.com/wbw/002_157_006.mp3",
  "عَلِيمًا": "https://audio.qurancdn.com/wbw/004_017_019.mp3",
  "عَلِيمَا": "https://audio.qurancdn.com/wbw/004_017_019.mp3",
  "جَعَلَ": "https://audio.qurancdn.com/wbw/002_022_002.mp3",
  "رِزْقًا": "https://audio.qurancdn.com/wbw/002_022_016.mp3",
  "جَاءَ": "https://audio.qurancdn.com/wbw/110_001_002.mp3",
  "مُسْتَقِيمٍ": "https://audio.qurancdn.com/wbw/036_004_003.mp3",
  "رَحِيمٌ": "https://audio.qurancdn.com/wbw/002_173_025.mp3",
  "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ": "https://everyayah.com/data/Alafasy_128kbps/002255.mp3",
  "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ": "https://everyayah.com/data/Alafasy_128kbps/002255.mp3",
  "لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ": "https://everyayah.com/data/Alafasy_128kbps/002255.mp3",

  // ── Juz 30 Short Surah Keywords ──
  "أَعُوذُ": "https://audio.qurancdn.com/wbw/113_001_002.mp3",
  "بِرَبِّ": "https://audio.qurancdn.com/wbw/113_001_003.mp3",
  "شَرِّ": "https://audio.qurancdn.com/wbw/113_002_002.mp3",
  "مَا": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "مَلِكِ": "https://audio.qurancdn.com/wbw/114_002_001.mp3",
  "إِلَٰهِ": "https://audio.qurancdn.com/wbw/114_003_001.mp3",
  "الْوَسْوَاسِ": "https://audio.qurancdn.com/wbw/114_004_003.mp3",
  "الْخَنَّاسِ": "https://audio.qurancdn.com/wbw/114_004_004.mp3",
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
  "الْفَتْحُ": "https://audio.qurancdn.com/wbw/110_001_005.mp3",
  "وَرَأَيْتَ": "https://audio.qurancdn.com/wbw/110_002_001.mp3",
  "أَفْوَاجًا": "https://audio.qurancdn.com/wbw/110_002_007.mp3",
  "تَوَّابًا": "https://audio.qurancdn.com/wbw/110_003_007.mp3",
  "تَبَّتْ": "https://audio.qurancdn.com/wbw/111_001_001.mp3",
  "أَبِي": "https://audio.qurancdn.com/wbw/111_001_003.mp3",
  "لَهَبٍ": "https://audio.qurancdn.com/wbw/111_001_004.mp3",
  "وَتَبَّ": "https://audio.qurancdn.com/wbw/111_001_005.mp3",
};

/**
 * Strips tatweel (kashida) and extra whitespace
 */
function normalizeArabicText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\u0640/g, "")
    .replace(/\u0671/g, "\u0627") // Wasla to standard Alif
    .replace(/[➔➜➝→]/g, "") // UI arrow characters
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

  // 2. Strip diacritics & orthography match as fallback (Uthmani vs Imla'ei)
  const normalizeForMatch = (s) =>
    s
      .replace(/\u0670/g, "ا") // Dagger alif to standard alif
      .replace(/[\u064B-\u065F\u0653]/g, "") // Harakat & Maddah
      .replace(/[آأإٱ]/g, "ا") // Normalizing alif variants
      .replace(/\u0640/g, "") // Tatweel
      .trim();

  const baseNormalized = normalizeForMatch(clean);

  for (const [key, audioUrl] of Object.entries(AUTHENTIC_QURAN_WORDS_MAP)) {
    if (normalizeForMatch(key) === baseNormalized) {
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
