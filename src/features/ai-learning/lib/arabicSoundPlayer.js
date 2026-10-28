"use client";

// Noorani Qaida (Takhti 1: Huruf Mufradat) audio mapping - Exact same system as MakhrajVisualizer
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

export const NOORANI_BASE_URL =
  "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-";

export const NOORANI_CDN_FALLBACK =
  "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-";

// Fallback studio soundboard map (exact match from MakhrajVisualizer)
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

export const ARABIC_AUDIO_BASE_URL =
  "https://cdn.jsdelivr.net/gh/adnan/Arabic-Alphabet@master/sounds/";

let activeAudio = null;
let activeSequenceTimer = null;

/**
 * Stop any currently playing audio
 */
export function stopArabicAudio() {
  if (activeSequenceTimer) {
    clearTimeout(activeSequenceTimer);
    activeSequenceTimer = null;
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
}

/**
 * Extract clean single Arabic base letter (stripping tashkeel/harakat if checking qaida map)
 */
function _extractBaseLetter(char) {
  if (!char) return "";
  // Strip common harakat to match letter base
  return char.replace(/[\u064B-\u065F\u0670]/g, "").trim();
}

// Authentic Noorani Qaida Master Qari Recordings & Quranic Word Recitations
// Prioritizes authentic Qari audio with true Tajweed (including precise Qalqalah on ق ط ب ج د)
export const AUTHENTIC_TAJWEED_AUDIO_MAP = {
  // Noorani Qaida Takhti 10: Sukoon (Jazm) & Qalqalah Master Qari Audio
  // Authentic recitation with pristine Qalqalah (echo/rebound) on Baa, Jeem, Daal, Twa!
  "أَبْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a", // Master Qari with authentic Qalqalah!
  "إِبْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-2.m4a", // Qalqalah
  "أُبْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-3.m4a", // Qalqalah
  "أَتْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-4.m4a",
  "إِتْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-5.m4a",
  "أُتْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-6.m4a",
  "أَثْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-7.m4a",
  "إِثْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-8.m4a",
  "أُثْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-9.m4a",
  "أَجْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-10.m4a", // Qalqalah
  "إِجْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-11.m4a", // Qalqalah
  "أُجْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-12.m4a", // Qalqalah
  "أَحْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-13.m4a",
  "إِحْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-14.m4a",
  "أُحْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-15.m4a",
  "أَخْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-16.m4a",
  "إِخْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-17.m4a",
  "أُخْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-18.m4a",
  "أَدْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-19.m4a", // Qalqalah
  "إِدْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-20.m4a", // Qalqalah
  "أُدْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-21.m4a", // Qalqalah
  "أَذْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-22.m4a",
  "إِذْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-23.m4a",
  "أُذْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-24.m4a",
  "أَرْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-25.m4a",
  "إِرْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-26.m4a",
  "أُرْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-27.m4a",
  "أَزْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-28.m4a",
  "إِزْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-29.m4a",
  "أُزْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-30.m4a",
  "أَسْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-1.m4a",
  "إِسْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-2.m4a",
  "أُسْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-3.m4a",
  "أَطْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-13.m4a", // Qalqalah
  "إِطْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-14.m4a", // Qalqalah
  "أُطْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-15.m4a", // Qalqalah
  "أَقْ": "/sounds/noorani/qari_aq.wav?v=20", // Hamzah Qaaf Zabar Aq (Qalqalah)
  "إِقْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter11/Page20-30.m4a", // Qalqalah
  "أُقْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter11/Page20-31.m4a", // Qalqalah

  // Quranic Words & Ayahs (EveryAyah / QuranCDN Authentic Master Recitations)
  "قُلْ": "https://audio.qurancdn.com/wbw/112_001_001.mp3",
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ": "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ": "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
  "الرَّحْمَٰنِ الرَّحِيمِ": "https://everyayah.com/data/Alafasy_128kbps/001003.mp3",
  "مَالِكِ يَوْمِ الدِّينِ": "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
  "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ": "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
  "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ": "https://everyayah.com/data/Alafasy_128kbps/001006.mp3",
  "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ": "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
  "قُلْ هُوَ اللَّهُ أَحَدٌ": "https://everyayah.com/data/Alafasy_128kbps/112001.mp3",
  "اللَّهُ الصَّمَدُ": "https://everyayah.com/data/Alafasy_128kbps/112002.mp3",
  "لَمْ يَلِدْ وَلَمْ يُولَدْ": "https://everyayah.com/data/Alafasy_128kbps/112003.mp3",
  "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ": "https://everyayah.com/data/Alafasy_128kbps/112004.mp3",
  "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ": "https://everyayah.com/data/Alafasy_128kbps/113001.mp3",
  "مِن شَرِّ مَا خَلَقَ": "https://everyayah.com/data/Alafasy_128kbps/113002.mp3",
  "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ": "https://everyayah.com/data/Alafasy_128kbps/113003.mp3",
  "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ": "https://everyayah.com/data/Alafasy_128kbps/113004.mp3",
  "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ": "https://everyayah.com/data/Alafasy_128kbps/113005.mp3",
  "قُلْ أَعُوذُ بِرَبِّ النَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114001.mp3",
  "مَلِكِ النَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114002.mp3",
  "إِلَٰهِ النَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114003.mp3",
  "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114004.mp3",
  "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114005.mp3",
  "مِنَ الْجِنَّةِ وَالنَّاسِ": "https://everyayah.com/data/Alafasy_128kbps/114006.mp3",
  "الضَّالِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",
  "وَلَا الضَّالِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",
  "ٱلضَّآلِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",

  // Level 4: Iqlab (Surah Al-Baqarah 2:27 - مِنۢ بَعْدِ)
  "مِن بَعْدِ": [
    "https://audio.qurancdn.com/wbw/002_027_005.mp3", // مِنۢ (Mim - authentic Iqlab with Meem)
    "https://audio.qurancdn.com/wbw/002_027_006.mp3", // بَعْدِ
  ],
  "بَعْدِ": "https://audio.qurancdn.com/wbw/002_027_006.mp3",

  // Level 4: Idgham with Ghunnah (Surah Al-Baqarah 2:8 - مَن يَقُولُ)
  "مَن يَقُولُ": [
    "https://audio.qurancdn.com/wbw/002_08_003.mp3", // مَن (May - authentic Idgham with Ghunnah)
    "https://audio.qurancdn.com/wbw/002_08_004.mp3", // يَقُولُ
  ],

  // Level 4: Ikhfa (Surah Al-Baqarah 2:4 - مِن قَبْلِكَ)
  "مِن قَبْلُ": [
    "https://audio.qurancdn.com/wbw/002_004_008.mp3", // مِن (Min - authentic Ikhfa into Qaf)
    "https://audio.qurancdn.com/wbw/002_004_009.mp3", // قَبْلِكَ
  ],

  // Level 4: Ikhfa (Surah Al-Kafirun 109:3 - أَنتُمْ)
  "أَنتُمْ": "https://audio.qurancdn.com/wbw/109_003_002.mp3", // أَنتُمْ (authentic Ikhfa into Taa)
  "وَأَنتُمْ": "https://audio.qurancdn.com/wbw/002_022_023.mp3",

  // Level 4: Ikhfa (Surah Al-Baqarah 2:23 - مِن دُونِ)
  "مِن دُونِ": [
    "https://audio.qurancdn.com/wbw/002_023_015.mp3", // مِّن (Min - authentic Ikhfa into Dal)
    "https://audio.qurancdn.com/wbw/002_023_016.mp3", // دُونِ
  ],

  "رَبِّ": "https://audio.qurancdn.com/wbw/001_002_003.mp3",
  "اللَّهِ": "https://audio.qurancdn.com/wbw/001_001_002.mp3",
  "اللَّهُ": "https://audio.qurancdn.com/wbw/112_002_001.mp3", // Surah Al-Ikhlas 112:2 (Thick/Pur Laam)
  "بِاللَّهِ": "https://audio.qurancdn.com/wbw/002_008_006.mp3", // Surah Al-Baqarah 2:8 (Thin/Barik Laam)

  // Level 4: Izhar (Surah Al-Baqarah 2:62 - مَنْ آمَنَ)
  "مَنْ آمَنَ": [
    "https://audio.qurancdn.com/wbw/002_062_008.mp3", // مَنْ (Man - authentic Izhar before Hamzah)
    "https://audio.qurancdn.com/wbw/002_062_009.mp3", // ءَامَنَ
  ],
  "مَن آمَنَ": [
    "https://audio.qurancdn.com/wbw/002_062_008.mp3",
    "https://audio.qurancdn.com/wbw/002_062_009.mp3",
  ],

  // Level 4: Tanween Izhar (Surah Al-Baqarah 2:10 - عَذَابٌ أَلِيمٌ)
  "عَذَابٌ أَلِيمٌ": [
    "https://audio.qurancdn.com/wbw/002_010_003.mp3", // عَذَابٌ (Tanween Izhar before Hamzah)
    "https://audio.qurancdn.com/wbw/002_010_004.mp3", // أَلِيمٌۢ
  ],
  "عَلِيمٌ حَكِيمٌ": [
    "https://audio.qurancdn.com/wbw/027_006_006.mp3",
    "https://audio.qurancdn.com/wbw/027_006_007.mp3",
  ],

  "تَرْمِيهِم بِحِجَارَةٍ": [
    "https://audio.qurancdn.com/wbw/105_004_001.mp3",
    "https://audio.qurancdn.com/wbw/105_004_002.mp3",
  ], // Surah Al-Fil 105:4 (Ikhfa Shafawi)
  "لَهُم مَّا": [
    "https://audio.qurancdn.com/wbw/050_035_001.mp3",
    "https://audio.qurancdn.com/wbw/050_035_002.mp3",
  ], // Surah Qaf 50:35 (Idgham Shafawi)
  "هُمْ فِيهَا": [
    "https://audio.qurancdn.com/wbw/002_082_009.mp3",
    "https://audio.qurancdn.com/wbw/002_082_010.mp3",
  ], // Surah Al-Baqarah 2:82 (Izhar Shafawi)

  // Level 4: Idgham without Ghunnah (Surah Al-Baqarah 2:5 - مِن رَّبِّهِمْ)
  "مِن رَّبِّهِمْ": [
    "https://audio.qurancdn.com/wbw/002_005_004.mp3", // مِّن (Mir - authentic Idgham without Ghunnah)
    "https://audio.qurancdn.com/wbw/002_005_005.mp3", // رَّبِّهِمْ ۖ
  ],
  "مِن رَّبِّهِم": [
    "https://audio.qurancdn.com/wbw/002_005_004.mp3",
    "https://audio.qurancdn.com/wbw/002_005_005.mp3",
  ],

  // Level 4: Madd Munfasil (Surah Al-Baqarah 2:4 - بِمَا أُنزِلَ)
  "بِمَا أُنزِلَ": [
    "https://audio.qurancdn.com/wbw/002_004_003.mp3", // بِمَآ (Bimaa - Madd Munfasil 3 Alifs)
    "https://audio.qurancdn.com/wbw/002_004_004.mp3", // أُنزِلَ
  ],
  "بِمَآ أُنزِلَ": [
    "https://audio.qurancdn.com/wbw/002_004_003.mp3",
    "https://audio.qurancdn.com/wbw/002_004_004.mp3",
  ],

  // Positional Forms of Letters (Initial, Medial, Final)
  "بـ": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-2.m4a",
  "ـبـ": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-2.m4a",
  "ـب": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-2.m4a",
  "نـ": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-25.m4a",
  "ـنـ": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-25.m4a",
  "ـن": "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-25.m4a",

  // Tanween (Double Vowels - Ban, Bin, Bun, Tan, Tin, Tun - Noorani Qaida Takhti 5 Master Qari Recordings)
  "بً": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page9-18.m4a",
  "بٍ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page9-19.m4a",
  "بٌ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page9-20.m4a",
  "تً": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page10-16.m4a",
  "تٍ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page10-17.m4a",
  "تٌ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Page10-18.m4a",

  // Madd Asli (1 Alif - Takhti 8 Master Recordings)
  "بَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-26.m4a",
  "بُو": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-27.m4a",
  "بُوْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-27.m4a",
  "بِي": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-28.m4a",
  "بِيْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-28.m4a",

  // Standing Harakat (Khada Zabar, Khada Zer, Ulta Pesh - 100% Authentic Noorani Qaida Takhti 7 Master Qari Recordings)
  // Takhti 7: Page 12, item 28 = Meem (مٰ / مٖ / مٗ), item 25 = Baa (بٰ / بٖ / بٗ), item 29 = Laam (لٰ / لٖ / لٗ)
  "مٰ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-28.m4a", // Authentic Takhti 7 Qari Meem Standing Harakat
  "مٖ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-28.m4a",
  "مٗ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-28.m4a",
  "بٖ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-25.m4a", // Authentic Takhti 7 Qari Baa Standing Harakat
  "بٰ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-25.m4a",
  "بٗ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-25.m4a",
  "لٗ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a", // Authentic Takhti 7 Qari Laam Standing Harakat (Loo)
  "لٰ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "لٖ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "لُو": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "لَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "لِي": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "مَا": "https://audio.qurancdn.com/wbw/109_002_003.mp3", // Surah Al-Kafirun 109:2 (Authentic Qari 1-Alif Madd "Maa")
  "مِي": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-28.m4a",
  "مُو": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-28.m4a",

  // Waqf & Verse Endings
  "الْعَالَمِينَ": "https://audio.qurancdn.com/wbw/001_002_004.mp3",
  "مُسْتَقِيمٍ": "https://audio.qurancdn.com/wbw/001_006_003.mp3",
  "أَحَدٌ": "https://audio.qurancdn.com/wbw/112_001_004.mp3",
  "رَحِيمٌ": "https://audio.qurancdn.com/wbw/002_173_018.mp3",
  "رِزْقًا": "https://audio.qurancdn.com/wbw/002_022_016.mp3",

  // Murakkabat (Takhti 2 Master Recordings - 100% Authentic Human Noorani Qaida Qari Recitations)
  "لا": "/sounds/noorani/qari_lam_alif.m4a?v=15",
  "با": "/sounds/noorani/qari_baa_alif.m4a?v=15",
  "جا": ["/sounds/noorani/qari_jeem.m4a?v=15", "/sounds/noorani/qari_alif.m4a?v=15"],
  "بل": ["/sounds/noorani/qari_baa.m4a?v=15", "/sounds/noorani/qari_laam.m4a?v=15"],
  "تح": "/sounds/noorani/qari_taa_haa.m4a?v=15",

  // Additional Sukoon & Qalqalah
  "أَقْ": "/sounds/noorani/qari_aq.wav?v=20",
  "قْ": "/sounds/noorani/qari_aq.wav?v=20",

  // Tashdeed & Wajib Ghunnah (Authentic Master Qari World Recitations from EveryAyah / QuranCDN)
  "أَبَّ": "/sounds/noorani/abba.mp3?v=4", // Resonant, authentic classical Saudi Fusha "Abba" with firm Tashdeed
  "أَبَّ": "/sounds/noorani/abba.mp3?v=4", // Resonant, authentic classical Saudi Fusha "Abba" with firm Tashdeed
  "أَبَّا": "/sounds/noorani/abba.mp3?v=4",
  "إِنَّ": "https://audio.qurancdn.com/wbw/002_006_001.mp3", // Surah Al-Baqarah 2:6 (Authentic Wajib Ghunnah on Noon Tashdeed)
  "ثُمَّ": "https://audio.qurancdn.com/wbw/102_004_001.mp3", // Surah At-Takathur 102:4 (Authentic Wajib Ghunnah on Meem Tashdeed)
  "عَمَّ": "https://audio.qurancdn.com/wbw/078_001_001.mp3", // Surah An-Naba 78:1
  "الْجِنَّةِ": "https://audio.qurancdn.com/wbw/114_006_003.mp3", // Surah An-Nas 114:6
  "مِنَ الْجِنَّةِ": "https://everyayah.com/data/Alafasy_128kbps/114006.mp3",

  // ─────────────────────────────────────────────────────────────
  // Noorani Qaida Takhti 4: Harakat (Zabar / Fathah, Zer / Kasrah, Pesh / Dammah)
  // Authentic Master Qari Recordings with pure, crystal-clear Arabic pronunciation
  // ─────────────────────────────────────────────────────────────
  // 1. Baa (ب) — যবর, যের, পেশ ও জযম (বা যবর বা / বা যের বি / বা পেশ বু / আব্)
  "بَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-9.m4a",
  "بِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-10.m4a",
  "بُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-11.m4a",
  "بْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a", // Authentic Qari Qalqalah

  // 2. Taa (ت) — যবর, যের, পেশ ও জযম
  "تَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-22.m4a",
  "تِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-23.m4a",
  "تُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-24.m4a",
  "تْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-4.m4a",

  // 3. Thaa (ث) — যবর, যের, পেশ ও জযম (ছা যবর ছা / ছা যের ছি / ছা পেশ ছু / আছ্)
  "ثَ": "/sounds/noorani/thaa_zabar.mp3?v=100",
  "ثِ": "/sounds/noorani/thaa_zer.mp3?v=100",
  "ثُ": "/sounds/noorani/thaa_pesh.mp3?v=100",
  "ثْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-7.m4a",

  // 4. Jeem (ج) — যবর, যের, পেশ ও জযম (জীম যবর জা / জীম যের জি / জীম পেশ জু / আজ্)
  "جَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-25.m4a",
  "جِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-26.m4a",
  "جُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-27.m4a",
  "جْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-10.m4a", // Authentic Qari Qalqalah (আজ্)

  // Direct Sukoon (Jazm) Mappings with authentic Master Qari Takhti 10 recordings
  "حْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-13.m4a",
  "خْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-16.m4a",
  "دْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-19.m4a", // Qalqalah
  "ذْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-22.m4a",
  "رْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-25.m4a",
  "زْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-28.m4a",
  "سْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-1.m4a",
  "شْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-4.m4a",
  "أَشْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-4.m4a",
  "صْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-7.m4a",
  "أَصْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-7.m4a",
  "ضْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-10.m4a",
  "أَضْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-10.m4a",
  "طْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-13.m4a", // Qalqalah
  "ظْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-16.m4a",
  "أَظْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-16.m4a",
  "عْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-19.m4a",
  "أَعْ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-19.m4a",

  // 5. Hamzah / Alif (ء / أ / ا)
  "أَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-1.m4a",
  "إِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-2.m4a",
  "أُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-3.m4a",
  "ءَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-1.m4a",
  "ءِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-2.m4a",
  "ءُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-3.m4a",
  "اَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-1.m4a",
  "اِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-2.m4a",
  "اُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-3.m4a",

  // 6. Haa (ه)
  "هَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-4.m4a",
  "هِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-5.m4a",
  "هُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-6.m4a",
  "هـَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-4.m4a",
  "هـِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-5.m4a",
  "هـُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-6.m4a",

  // 7. Ain (ع)
  "عَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-7.m4a",
  "عِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-8.m4a",
  "عُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-9.m4a",

  // 8. Haa (ح)
  "حَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-10.m4a",
  "حِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-11.m4a",
  "حُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-12.m4a",

  // 9. Ghain (غ)
  "غَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-13.m4a",
  "غِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-14.m4a",
  "غُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-15.m4a",

  // 10. Khaa (خ)
  "خَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-16.m4a",
  "خِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-17.m4a",
  "خُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-18.m4a",

  // 11. Qaaf (ق)
  "قَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-19.m4a",
  "قِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-20.m4a",
  "قُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-21.m4a",

  // 12. Kaaf (ك)
  "كَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-22.m4a",
  "كِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-23.m4a",
  "كُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-24.m4a",

  // 13. Sheen (ش)
  "شَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-28.m4a",
  "شِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-29.m4a",
  "شُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page7-30.m4a",

  // 14. Yaa (ي)
  "يَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-1.m4a",
  "يِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-2.m4a",
  "يُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-3.m4a",

  // 15. Daad (ض)
  "ضَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-4.m4a",
  "ضِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-5.m4a",
  "ضُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-6.m4a",

  // 16. Laam (ل)
  "لَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-7.m4a",
  "لِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-8.m4a",
  "لُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-9.m4a",

  // 17. Noon (ن)
  "نَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-10.m4a",
  "نِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-11.m4a",
  "نُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-12.m4a",

  // 18. Raa (ر)
  "رَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-13.m4a",
  "رِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-14.m4a",
  "رُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-15.m4a",

  // 19. Twa (ط)
  "طَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-16.m4a",
  "طِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-17.m4a",
  "طُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-18.m4a",

  // 20. Daal (د)
  "دَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-19.m4a",
  "دِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-20.m4a",
  "دُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-21.m4a",

  // 21. Saad (ص)
  "صَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-25.m4a",
  "صِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-26.m4a",
  "صُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-27.m4a",

  // 22. Zaa (ز)
  "زَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-28.m4a",
  "زِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-29.m4a",
  "زُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-30.m4a",

  // 23. Seen (س)
  "سَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-31.m4a",
  "سِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-32.m4a",
  "سُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-33.m4a",

  // 24. Zhaa (ظ)
  "ظَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-34.m4a",
  "ظِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-35.m4a",
  "ظُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-36.m4a",

  // 25. Zaal (ذ)
  "ذَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-37.m4a",
  "ذِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-38.m4a",
  "ذُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-39.m4a",

  // 26. Faa (ف)
  "فَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-3.m4a",
  "فِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-4.m4a",
  "فُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-5.m4a",

  // 27. Waw (و)
  "وَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-6.m4a",
  "وِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-7.m4a",
  "وُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-8.m4a",

  // 28. Meem (م)
  "مَ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-12.m4a",
  "مِ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-13.m4a",
  "مُ": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-14.m4a",
};

// In-memory audio element cache for instant re-play without network round-trips
const clientAudioCache = new Map();

/**
 * Get or initialize an active Audio element (never use cloneNode which fails in browsers)
 */
function getOrCreateAudio(src, rate = 1.0) {
  let audio = clientAudioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    clientAudioCache.set(src, audio);
  } else {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }
  try {
    audio.playbackRate = rate;
    audio.preservesPitch = true;
  } catch {}
  return audio;
}

/**
 * Preload high-quality audio for an Arabic token (letters, vowels, sukoon)
 */
export function preloadArabicSound(arabicCharOrText) {
  if (typeof window === "undefined" || !arabicCharOrText) return;
  const clean = String(arabicCharOrText).trim();
  if (!clean) return;

  let src = "";
  const authenticTrack =
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean] ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFC")] ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFD")];

  if (authenticTrack) {
    if (Array.isArray(authenticTrack)) {
      authenticTrack.forEach((t) => getOrCreateAudio(t));
      return;
    }
    src = authenticTrack;
  } else if (!/[\u064B-\u065F\u0670]/.test(clean) && NOORANI_TRACK_MAP[clean]) {
    src = `${NOORANI_BASE_URL}${NOORANI_TRACK_MAP[clean]}.m4a`;
  } else {
    src = `/api/ai/tts?text=${encodeURIComponent(clean)}&lang=ar&voice=ar-SA-HamedNeural&rate=-15%`;
  }

  getOrCreateAudio(src);
}

/**
 * Play authentic sound for letter or Arabic text
 * Pure unvowelled letters (Takhti 1) use verified authentic Qari tracks (Page1-X.m4a).
 * Harakat (Zabar, Zer, Pesh, Tanween, Sukoon) use precise classical Arabic pronunciation.
 */
export function playArabicSound(arabicCharOrText, onEnded, rate = 1.0) {
  if (typeof window === "undefined" || !arabicCharOrText) return null;
  
  stopArabicAudio();
  const raw = String(arabicCharOrText).trim();
  if (!raw) return null;

  // Strip Tatweel/Kashida (\u0640) so positional shapes (جـَ, ـجـَ, ـج) match base audio
  let clean = raw.replace(/\u0640/g, "");

  // If a single letter with Sukoon (e.g. جْ, بْ), classical Arabic requires a preceding Hamzah: "أَ" + base + "ْ"
  const isSingleLetterSukoon = /^[\u0621-\u064A]\u0652$/.test(clean);
  const sukoonHamzaForm = isSingleLetterSukoon ? "أَ" + clean : null;

  // Check if string contains ANY Harakat (Fatha, Kasra, Damma, Tanween, Sukoon, Shaddah, Dagger Alif)
  const hasHarakat = /[\u064B-\u065F\u0670]/.test(clean);

  // Helper to trigger onEnded and cleanup
  const handleEnd = () => {
    activeAudio = null;
    if (onEnded) onEnded();
  };

  // Helper 3: Arabic Neural TTS (Exact classical Arabic pronunciation with Harakat)
  const playTtsFallback = () => {
    try {
      // Speak Hamzah-vowelled form for single letter with Sukoon (e.g. أَجْ instead of unpronounceable جْ)
      const ttsText = sukoonHamzaForm || clean;
      const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(ttsText)}&lang=ar&voice=ar-SA-HamedNeural&rate=-15%`;
      const audio = getOrCreateAudio(ttsUrl, rate);
      activeAudio = audio;
      audio.onended = handleEnd;
      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis in Arabic if network drops
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(clean);
            utter.lang = "ar-SA";
            utter.rate = 0.82 * rate;
            utter.onend = handleEnd;
            utter.onerror = handleEnd;
            window.speechSynthesis.speak(utter);
            return;
          } catch {}
        }
        handleEnd();
      };
      audio.play().catch(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(clean);
            utter.lang = "ar-SA";
            utter.rate = 0.82 * rate;
            utter.onend = handleEnd;
            utter.onerror = handleEnd;
            window.speechSynthesis.speak(utter);
            return;
          } catch {}
        }
        handleEnd();
      });
      return audio;
    } catch {
      handleEnd();
      return null;
    }
  };

  // Helper 2: Studio MP3 Fallback (Only for pure letters without Harakat)
  const playStudioFallback = () => {
    const soundFile = ARABIC_LETTER_AUDIO_MAP[clean];
    if (soundFile) {
      try {
        const audio = getOrCreateAudio(`${ARABIC_AUDIO_BASE_URL}${soundFile}`, rate);
        activeAudio = audio;
        audio.onended = handleEnd;
        audio.onerror = playTtsFallback;
        audio.play().catch(playTtsFallback);
        return audio;
      } catch {
        return playTtsFallback();
      }
    }
    return playTtsFallback();
  };

  // Helper 1: CDN Fallback for Noorani Qaida Takhti 1
  const playCdnQaidaFallback = (trk) => {
    try {
      const audio = getOrCreateAudio(`${NOORANI_CDN_FALLBACK}${trk}.m4a`, rate);
      activeAudio = audio;
      audio.onended = handleEnd;
      audio.onerror = playStudioFallback;
      audio.play().catch(playStudioFallback);
      return audio;
    } catch {
      return playStudioFallback();
    }
  };

  // 1. PRIORITY 0: Authentic Master Qari Tajweed Recordings (Takhti 4 Harakat, Takhti 10 Sukoon with Qalqalah, Words, Ayahs)
  const authenticTrack =
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean] ||
    (sukoonHamzaForm && AUTHENTIC_TAJWEED_AUDIO_MAP[sukoonHamzaForm]) ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFC")] ||
    AUTHENTIC_TAJWEED_AUDIO_MAP[clean.normalize("NFD")];

  if (authenticTrack) {
    if (Array.isArray(authenticTrack)) {
      let currentIdx = 0;
      const playNextInSequence = () => {
        if (currentIdx >= authenticTrack.length) {
          activeSequenceTimer = null;
          handleEnd();
          return;
        }
        const trk = authenticTrack[currentIdx];
        currentIdx++;
        try {
          const audio = getOrCreateAudio(trk, rate);
          activeAudio = audio;
          audio.onended = () => {
            activeSequenceTimer = setTimeout(playNextInSequence, 180);
          };
          audio.onerror = () => {
            activeSequenceTimer = setTimeout(playNextInSequence, 50);
          };
          audio.play().catch(() => {
            activeSequenceTimer = setTimeout(playNextInSequence, 50);
          });
        } catch {
          handleEnd();
        }
      };
      playNextInSequence();
      return activeAudio;
    }

    try {
      const audio = getOrCreateAudio(authenticTrack, rate);
      activeAudio = audio;
      audio.onended = handleEnd;
      audio.onerror = () => {
        if (authenticTrack.includes("cdn.jsdelivr.net")) {
          const rawUrl = authenticTrack.replace(
            "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/",
            "https://raw.githubusercontent.com/nooresahar/noorani/master/"
          );
          try {
            const fbAudio = getOrCreateAudio(rawUrl);
            activeAudio = fbAudio;
            fbAudio.onended = handleEnd;
            fbAudio.onerror = () => playTtsFallback();
            fbAudio.play().catch(() => playTtsFallback());
            return;
          } catch {
            playTtsFallback();
          }
        } else {
          playTtsFallback();
        }
      };
      audio.play().catch(() => {
        if (authenticTrack.includes("cdn.jsdelivr.net")) {
          const rawUrl = authenticTrack.replace(
            "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/",
            "https://raw.githubusercontent.com/nooresahar/noorani/master/"
          );
          try {
            const fbAudio = getOrCreateAudio(rawUrl);
            activeAudio = fbAudio;
            fbAudio.onended = handleEnd;
            fbAudio.onerror = () => playTtsFallback();
            fbAudio.play().catch(() => playTtsFallback());
            return;
          } catch {
            playTtsFallback();
          }
        } else {
          playTtsFallback();
        }
      });
      return audio;
    } catch {
      return playTtsFallback();
    }
  }

  // 2. If item has ANY Harakat (Zabar, Zer, Pesh, Tanween, Sukoon, words) not in authentic map:
  if (hasHarakat) {
    return playTtsFallback();
  }

  // 2. Pure standalone letters without Harakat (Takhti 1: Huruf Mufradat: ا, ب, ت, ث, ...)
  // Play authentic Takhti 1 Master Qari recordings (Page1-X.m4a)
  const trackNumber = NOORANI_TRACK_MAP[clean];
  if (trackNumber) {
    try {
      const primaryUrl = `${NOORANI_BASE_URL}${trackNumber}.m4a`;
      const audio = new Audio(primaryUrl);
      activeAudio = audio;
      audio.onended = handleEnd;
      audio.onerror = () => playCdnQaidaFallback(trackNumber);
      audio.play().catch(() => playCdnQaidaFallback(trackNumber));
      return audio;
    } catch {
      return playCdnQaidaFallback(trackNumber);
    }
  }

  // 3. Fallback for any other text
  return playTtsFallback();
}

// ─────────────────────────────────────────
// Duolingo Web Audio Sound Effects Synthesizer
// Zero external files, ultra-low latency, pure crisp tones
// ─────────────────────────────────────────

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Duolingo Correct Answer Chime (Major Triad Ascending: C5 -> E5 -> G5)
 */
export function playCorrectChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.3);
  });
}

/**
 * Duolingo Wrong Answer Soft Buzzer (Gentle descending chord)
 */
export function playWrongBuzzer() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [293.66, 277.18]; // D4, C#4
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0, now + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.38);
  });
}

/**
 * Duolingo Level Complete Fanfare (Celebration Arpeggio)
 */
export function playLevelCompleteFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);

    gain.gain.setValueAtTime(0, now + idx * 0.1);
    gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.5);
  });
}

/**
 * Subtle Button Tap
 */
export function playTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Star Pop Sound: Crisp ascending sparkle as each star (1, 2, 3) pops onto screen
 */
export function playStarPopSound(starIndex = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = 587.33 * Math.pow(1.25, starIndex); // D5, F#5, A5
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * Heart Gain Sound: Warm uplifting chime when rewarded +1 Heart for 3 stars
 */
export function playHeartGainSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [440, 554.37, 659.25, 880]; // A4 -> C#5 -> E5 -> A5

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.32);
  });
}

/**
 * Heart Lost Sound: Soft descending thud when wrong answer is given
 */
export function playHeartLostSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(130, now + 0.25);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Grand Ma Sha Allah & Wing Victory Celebration Fanfare
 * Fills user with joy, encouragement, and motivation
 */
export function playMaShaAllahCelebration() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // 1. Grand Brass-style Major Triad Arpeggio + High Shimmer
  const chords = [
    { time: 0.0, freqs: [261.63, 329.63, 392.00] }, // C4 Major
    { time: 0.15, freqs: [329.63, 392.00, 523.25] }, // E4 Major inversion
    { time: 0.30, freqs: [392.00, 523.25, 659.25] }, // G4 Major
    { time: 0.45, freqs: [523.25, 659.25, 783.99, 1046.50] }, // C5 Grand Chord
  ];

  chords.forEach((chord) => {
    chord.freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + chord.time);

      gain.gain.setValueAtTime(0, now + chord.time);
      gain.gain.linearRampToValueAtTime(0.18, now + chord.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + chord.time);
      osc.stop(now + chord.time + 0.6);
    });
  });

  // 2. High Shimmer Sparkle at end (Wing triumph feeling)
  setTimeout(() => {
    if (!ctx) return;
    const shimmerNotes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    const sNow = ctx.currentTime;
    shimmerNotes.forEach((f, idx) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();

      sOsc.type = "triangle";
      sOsc.frequency.setValueAtTime(f, sNow + idx * 0.05);

      sGain.gain.setValueAtTime(0, sNow + idx * 0.05);
      sGain.gain.linearRampToValueAtTime(0.2, sNow + idx * 0.05 + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.001, sNow + idx * 0.05 + 0.35);

      sOsc.connect(sGain);
      sGain.connect(ctx.destination);

      sOsc.start(sNow + idx * 0.05);
      sOsc.stop(sNow + idx * 0.05 + 0.4);
    });
  }, 480);
}

// Alias for backwards compatibility
export const playLifeLostSound = playHeartLostSound;

