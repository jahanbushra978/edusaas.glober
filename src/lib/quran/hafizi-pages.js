/**
 * Authoritative Hafizi Quran (হাফেজী কুরআন - ১৫ লাইনের স্ট্যান্ডার্ড হিসেব • সর্বমোট ৬১০ পৃষ্ঠা)
 * 30 Paras structure with exactly 610 pages (15-Line Indo-Pak / Subcontinent Standard):
 * - Para 1: 21 pages (Global 1 - 21)
 * - Para 2 to 28: 20 pages each (Global 22 - 561)
 * - Para 29: 24 pages (Global 562 - 585)
 * - Para 30: 25 pages (Global 586 - 610)
 */

import { ALL_SURAHS } from "./quran-meta.js";

export const HAFIZI_PARAS = [
  {
    "juz": 1,
    "nameBn": "১ম পারা",
    "nameAr": "الم",
    "startSurah": 1,
    "startAyah": 1,
    "totalPages": 21,
    "startPage": 1,
    "endPage": 21
  },
  {
    "juz": 2,
    "nameBn": "২য় পারা",
    "nameAr": "سَيَقُولُ",
    "startSurah": 2,
    "startAyah": 142,
    "totalPages": 20,
    "startPage": 22,
    "endPage": 41
  },
  {
    "juz": 3,
    "nameBn": "৩য় পারা",
    "nameAr": "تِلْكَ الرُّسُلُ",
    "startSurah": 2,
    "startAyah": 253,
    "totalPages": 20,
    "startPage": 42,
    "endPage": 61
  },
  {
    "juz": 4,
    "nameBn": "৪র্থ পারা",
    "nameAr": "لَنْ تَنَالُوا",
    "startSurah": 3,
    "startAyah": 93,
    "totalPages": 20,
    "startPage": 62,
    "endPage": 81
  },
  {
    "juz": 5,
    "nameBn": "৫ম পারা",
    "nameAr": "وَالْمُحْصَنَاتُ",
    "startSurah": 4,
    "startAyah": 24,
    "totalPages": 20,
    "startPage": 82,
    "endPage": 101
  },
  {
    "juz": 6,
    "nameBn": "৬ষ্ঠ পারা",
    "nameAr": "لَا يُحِبُّ اللَّهُ",
    "startSurah": 4,
    "startAyah": 148,
    "totalPages": 20,
    "startPage": 102,
    "endPage": 121
  },
  {
    "juz": 7,
    "nameBn": "৭ম পারা",
    "nameAr": "وَإِذَا سَمِعُوا",
    "startSurah": 5,
    "startAyah": 82,
    "totalPages": 20,
    "startPage": 122,
    "endPage": 141
  },
  {
    "juz": 8,
    "nameBn": "৮ম পারা",
    "nameAr": "وَلَوْ أَنَّنَا",
    "startSurah": 6,
    "startAyah": 111,
    "totalPages": 20,
    "startPage": 142,
    "endPage": 161
  },
  {
    "juz": 9,
    "nameBn": "৯ম পারা",
    "nameAr": "قَالَ الْمَلَأُ",
    "startSurah": 7,
    "startAyah": 88,
    "totalPages": 20,
    "startPage": 162,
    "endPage": 181
  },
  {
    "juz": 10,
    "nameBn": "১০ম পারা",
    "nameAr": "وَاعْلَمُوا",
    "startSurah": 8,
    "startAyah": 41,
    "totalPages": 20,
    "startPage": 182,
    "endPage": 201
  },
  {
    "juz": 11,
    "nameBn": "১১তম পারা",
    "nameAr": "يَعْتَذِرُونَ",
    "startSurah": 9,
    "startAyah": 93,
    "totalPages": 20,
    "startPage": 202,
    "endPage": 221
  },
  {
    "juz": 12,
    "nameBn": "১২তম পারা",
    "nameAr": "وَمَا مِنْ دَابَّةٍ",
    "startSurah": 11,
    "startAyah": 6,
    "totalPages": 20,
    "startPage": 222,
    "endPage": 241
  },
  {
    "juz": 13,
    "nameBn": "১৩তম পারা",
    "nameAr": "وَمَا أُبَرِّئُ",
    "startSurah": 12,
    "startAyah": 53,
    "totalPages": 20,
    "startPage": 242,
    "endPage": 261
  },
  {
    "juz": 14,
    "nameBn": "১৪তম পারা",
    "nameAr": "رُبَمَا",
    "startSurah": 15,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 262,
    "endPage": 281
  },
  {
    "juz": 15,
    "nameBn": "১৫তম পারা",
    "nameAr": "سُبْحَانَ الَّذِي",
    "startSurah": 17,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 282,
    "endPage": 301
  },
  {
    "juz": 16,
    "nameBn": "১৬তম পারা",
    "nameAr": "قَالَ أَلَمْ",
    "startSurah": 18,
    "startAyah": 75,
    "totalPages": 20,
    "startPage": 302,
    "endPage": 321
  },
  {
    "juz": 17,
    "nameBn": "১৭তম পারা",
    "nameAr": "اقْتَرَبَ",
    "startSurah": 21,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 322,
    "endPage": 341
  },
  {
    "juz": 18,
    "nameBn": "১৮তম পারা",
    "nameAr": "قَدْ أَفْلَحَ",
    "startSurah": 23,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 342,
    "endPage": 361
  },
  {
    "juz": 19,
    "nameBn": "১৯তম পারা",
    "nameAr": "وَقَالَ الَّذِينَ",
    "startSurah": 25,
    "startAyah": 21,
    "totalPages": 20,
    "startPage": 362,
    "endPage": 381
  },
  {
    "juz": 20,
    "nameBn": "২০তম পারা",
    "nameAr": "فَمَا كَانَ",
    "startSurah": 27,
    "startAyah": 56,
    "totalPages": 20,
    "startPage": 382,
    "endPage": 401
  },
  {
    "juz": 21,
    "nameBn": "২১তম পারা",
    "nameAr": "وَلَا تُجَادِلُوا",
    "startSurah": 29,
    "startAyah": 46,
    "totalPages": 20,
    "startPage": 402,
    "endPage": 421
  },
  {
    "juz": 22,
    "nameBn": "২২তম পারা",
    "nameAr": "وَمَنْ يَقْنُتْ",
    "startSurah": 33,
    "startAyah": 31,
    "totalPages": 20,
    "startPage": 422,
    "endPage": 441
  },
  {
    "juz": 23,
    "nameBn": "২৩তম পারা",
    "nameAr": "وَمَا أَنْزَلْنَا",
    "startSurah": 36,
    "startAyah": 28,
    "totalPages": 20,
    "startPage": 442,
    "endPage": 461
  },
  {
    "juz": 24,
    "nameBn": "২৪তম পারা",
    "nameAr": "فَمَنْ أَظْلَمُ",
    "startSurah": 39,
    "startAyah": 32,
    "totalPages": 20,
    "startPage": 462,
    "endPage": 481
  },
  {
    "juz": 25,
    "nameBn": "২৫তম পারা",
    "nameAr": "إِلَيْهِ يُرَدُّ",
    "startSurah": 41,
    "startAyah": 47,
    "totalPages": 20,
    "startPage": 482,
    "endPage": 501
  },
  {
    "juz": 26,
    "nameBn": "২৬তম পারা",
    "nameAr": "حم",
    "startSurah": 46,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 502,
    "endPage": 521
  },
  {
    "juz": 27,
    "nameBn": "২৭তম পারা",
    "nameAr": "قَالَ فَمَا خَطْبُكُمْ",
    "startSurah": 51,
    "startAyah": 31,
    "totalPages": 20,
    "startPage": 522,
    "endPage": 541
  },
  {
    "juz": 28,
    "nameBn": "২৮তম পারা",
    "nameAr": "قَدْ سَمِعَ اللَّهُ",
    "startSurah": 58,
    "startAyah": 1,
    "totalPages": 20,
    "startPage": 542,
    "endPage": 561
  },
  {
    "juz": 29,
    "nameBn": "২৯তম পারা",
    "nameAr": "تَبَارَكَ الَّذِي",
    "startSurah": 67,
    "startAyah": 1,
    "totalPages": 24,
    "startPage": 562,
    "endPage": 585
  },
  {
    "juz": 30,
    "nameBn": "৩০তম পারা (আম্মা পারা)",
    "nameAr": "عَمَّ يَتَسَاءَلُونَ",
    "startSurah": 78,
    "startAyah": 1,
    "totalPages": 25,
    "startPage": 586,
    "endPage": 610
  }
];

export const TOTAL_HAFIZI_PAGES = 610;

// Canonical 604 Uthmani mushaf page start references
export const UTHMANI_PAGE_REFERENCES = [{"surah":1,"ayah":1},{"surah":2,"ayah":1},{"surah":2,"ayah":6},{"surah":2,"ayah":17},{"surah":2,"ayah":25},{"surah":2,"ayah":30},{"surah":2,"ayah":38},{"surah":2,"ayah":49},{"surah":2,"ayah":58},{"surah":2,"ayah":62},{"surah":2,"ayah":70},{"surah":2,"ayah":77},{"surah":2,"ayah":84},{"surah":2,"ayah":89},{"surah":2,"ayah":94},{"surah":2,"ayah":102},{"surah":2,"ayah":106},{"surah":2,"ayah":113},{"surah":2,"ayah":120},{"surah":2,"ayah":127},{"surah":2,"ayah":135},{"surah":2,"ayah":142},{"surah":2,"ayah":146},{"surah":2,"ayah":154},{"surah":2,"ayah":164},{"surah":2,"ayah":170},{"surah":2,"ayah":177},{"surah":2,"ayah":182},{"surah":2,"ayah":187},{"surah":2,"ayah":191},{"surah":2,"ayah":197},{"surah":2,"ayah":203},{"surah":2,"ayah":211},{"surah":2,"ayah":216},{"surah":2,"ayah":220},{"surah":2,"ayah":225},{"surah":2,"ayah":231},{"surah":2,"ayah":234},{"surah":2,"ayah":238},{"surah":2,"ayah":246},{"surah":2,"ayah":249},{"surah":2,"ayah":253},{"surah":2,"ayah":257},{"surah":2,"ayah":260},{"surah":2,"ayah":265},{"surah":2,"ayah":270},{"surah":2,"ayah":275},{"surah":2,"ayah":282},{"surah":2,"ayah":283},{"surah":3,"ayah":1},{"surah":3,"ayah":10},{"surah":3,"ayah":16},{"surah":3,"ayah":23},{"surah":3,"ayah":30},{"surah":3,"ayah":38},{"surah":3,"ayah":46},{"surah":3,"ayah":53},{"surah":3,"ayah":62},{"surah":3,"ayah":71},{"surah":3,"ayah":78},{"surah":3,"ayah":84},{"surah":3,"ayah":92},{"surah":3,"ayah":101},{"surah":3,"ayah":109},{"surah":3,"ayah":116},{"surah":3,"ayah":122},{"surah":3,"ayah":133},{"surah":3,"ayah":141},{"surah":3,"ayah":149},{"surah":3,"ayah":154},{"surah":3,"ayah":158},{"surah":3,"ayah":166},{"surah":3,"ayah":174},{"surah":3,"ayah":181},{"surah":3,"ayah":187},{"surah":3,"ayah":195},{"surah":4,"ayah":1},{"surah":4,"ayah":7},{"surah":4,"ayah":12},{"surah":4,"ayah":15},{"surah":4,"ayah":20},{"surah":4,"ayah":24},{"surah":4,"ayah":27},{"surah":4,"ayah":34},{"surah":4,"ayah":38},{"surah":4,"ayah":45},{"surah":4,"ayah":52},{"surah":4,"ayah":60},{"surah":4,"ayah":66},{"surah":4,"ayah":75},{"surah":4,"ayah":80},{"surah":4,"ayah":87},{"surah":4,"ayah":92},{"surah":4,"ayah":95},{"surah":4,"ayah":102},{"surah":4,"ayah":106},{"surah":4,"ayah":114},{"surah":4,"ayah":122},{"surah":4,"ayah":128},{"surah":4,"ayah":135},{"surah":4,"ayah":141},{"surah":4,"ayah":148},{"surah":4,"ayah":155},{"surah":4,"ayah":163},{"surah":4,"ayah":171},{"surah":4,"ayah":176},{"surah":5,"ayah":3},{"surah":5,"ayah":6},{"surah":5,"ayah":10},{"surah":5,"ayah":14},{"surah":5,"ayah":18},{"surah":5,"ayah":24},{"surah":5,"ayah":32},{"surah":5,"ayah":37},{"surah":5,"ayah":42},{"surah":5,"ayah":46},{"surah":5,"ayah":51},{"surah":5,"ayah":58},{"surah":5,"ayah":65},{"surah":5,"ayah":71},{"surah":5,"ayah":77},{"surah":5,"ayah":83},{"surah":5,"ayah":90},{"surah":5,"ayah":96},{"surah":5,"ayah":104},{"surah":5,"ayah":109},{"surah":5,"ayah":114},{"surah":6,"ayah":1},{"surah":6,"ayah":9},{"surah":6,"ayah":19},{"surah":6,"ayah":28},{"surah":6,"ayah":36},{"surah":6,"ayah":45},{"surah":6,"ayah":53},{"surah":6,"ayah":60},{"surah":6,"ayah":69},{"surah":6,"ayah":74},{"surah":6,"ayah":82},{"surah":6,"ayah":91},{"surah":6,"ayah":95},{"surah":6,"ayah":102},{"surah":6,"ayah":111},{"surah":6,"ayah":119},{"surah":6,"ayah":125},{"surah":6,"ayah":132},{"surah":6,"ayah":138},{"surah":6,"ayah":143},{"surah":6,"ayah":147},{"surah":6,"ayah":152},{"surah":6,"ayah":158},{"surah":7,"ayah":1},{"surah":7,"ayah":12},{"surah":7,"ayah":23},{"surah":7,"ayah":31},{"surah":7,"ayah":38},{"surah":7,"ayah":44},{"surah":7,"ayah":52},{"surah":7,"ayah":58},{"surah":7,"ayah":68},{"surah":7,"ayah":74},{"surah":7,"ayah":82},{"surah":7,"ayah":88},{"surah":7,"ayah":96},{"surah":7,"ayah":105},{"surah":7,"ayah":121},{"surah":7,"ayah":131},{"surah":7,"ayah":138},{"surah":7,"ayah":144},{"surah":7,"ayah":150},{"surah":7,"ayah":156},{"surah":7,"ayah":160},{"surah":7,"ayah":164},{"surah":7,"ayah":171},{"surah":7,"ayah":179},{"surah":7,"ayah":188},{"surah":7,"ayah":196},{"surah":8,"ayah":1},{"surah":8,"ayah":9},{"surah":8,"ayah":17},{"surah":8,"ayah":26},{"surah":8,"ayah":34},{"surah":8,"ayah":41},{"surah":8,"ayah":46},{"surah":8,"ayah":53},{"surah":8,"ayah":62},{"surah":8,"ayah":70},{"surah":9,"ayah":1},{"surah":9,"ayah":7},{"surah":9,"ayah":14},{"surah":9,"ayah":21},{"surah":9,"ayah":27},{"surah":9,"ayah":32},{"surah":9,"ayah":37},{"surah":9,"ayah":41},{"surah":9,"ayah":48},{"surah":9,"ayah":55},{"surah":9,"ayah":62},{"surah":9,"ayah":69},{"surah":9,"ayah":73},{"surah":9,"ayah":80},{"surah":9,"ayah":87},{"surah":9,"ayah":94},{"surah":9,"ayah":100},{"surah":9,"ayah":107},{"surah":9,"ayah":112},{"surah":9,"ayah":118},{"surah":9,"ayah":123},{"surah":10,"ayah":1},{"surah":10,"ayah":7},{"surah":10,"ayah":15},{"surah":10,"ayah":21},{"surah":10,"ayah":26},{"surah":10,"ayah":34},{"surah":10,"ayah":43},{"surah":10,"ayah":54},{"surah":10,"ayah":62},{"surah":10,"ayah":71},{"surah":10,"ayah":79},{"surah":10,"ayah":89},{"surah":10,"ayah":98},{"surah":10,"ayah":107},{"surah":11,"ayah":6},{"surah":11,"ayah":13},{"surah":11,"ayah":20},{"surah":11,"ayah":29},{"surah":11,"ayah":38},{"surah":11,"ayah":46},{"surah":11,"ayah":54},{"surah":11,"ayah":63},{"surah":11,"ayah":72},{"surah":11,"ayah":82},{"surah":11,"ayah":89},{"surah":11,"ayah":98},{"surah":11,"ayah":109},{"surah":11,"ayah":118},{"surah":12,"ayah":5},{"surah":12,"ayah":15},{"surah":12,"ayah":23},{"surah":12,"ayah":31},{"surah":12,"ayah":38},{"surah":12,"ayah":44},{"surah":12,"ayah":53},{"surah":12,"ayah":64},{"surah":12,"ayah":70},{"surah":12,"ayah":79},{"surah":12,"ayah":87},{"surah":12,"ayah":96},{"surah":12,"ayah":104},{"surah":13,"ayah":1},{"surah":13,"ayah":6},{"surah":13,"ayah":14},{"surah":13,"ayah":19},{"surah":13,"ayah":29},{"surah":13,"ayah":35},{"surah":13,"ayah":43},{"surah":14,"ayah":6},{"surah":14,"ayah":11},{"surah":14,"ayah":19},{"surah":14,"ayah":25},{"surah":14,"ayah":34},{"surah":14,"ayah":43},{"surah":15,"ayah":1},{"surah":15,"ayah":16},{"surah":15,"ayah":32},{"surah":15,"ayah":52},{"surah":15,"ayah":71},{"surah":15,"ayah":91},{"surah":16,"ayah":7},{"surah":16,"ayah":15},{"surah":16,"ayah":27},{"surah":16,"ayah":35},{"surah":16,"ayah":43},{"surah":16,"ayah":55},{"surah":16,"ayah":65},{"surah":16,"ayah":73},{"surah":16,"ayah":80},{"surah":16,"ayah":88},{"surah":16,"ayah":94},{"surah":16,"ayah":103},{"surah":16,"ayah":111},{"surah":16,"ayah":119},{"surah":17,"ayah":1},{"surah":17,"ayah":8},{"surah":17,"ayah":18},{"surah":17,"ayah":28},{"surah":17,"ayah":39},{"surah":17,"ayah":50},{"surah":17,"ayah":59},{"surah":17,"ayah":67},{"surah":17,"ayah":76},{"surah":17,"ayah":87},{"surah":17,"ayah":97},{"surah":17,"ayah":105},{"surah":18,"ayah":5},{"surah":18,"ayah":16},{"surah":18,"ayah":21},{"surah":18,"ayah":28},{"surah":18,"ayah":35},{"surah":18,"ayah":46},{"surah":18,"ayah":54},{"surah":18,"ayah":62},{"surah":18,"ayah":75},{"surah":18,"ayah":84},{"surah":18,"ayah":98},{"surah":19,"ayah":1},{"surah":19,"ayah":12},{"surah":19,"ayah":26},{"surah":19,"ayah":39},{"surah":19,"ayah":52},{"surah":19,"ayah":65},{"surah":19,"ayah":77},{"surah":19,"ayah":96},{"surah":20,"ayah":13},{"surah":20,"ayah":38},{"surah":20,"ayah":52},{"surah":20,"ayah":65},{"surah":20,"ayah":77},{"surah":20,"ayah":88},{"surah":20,"ayah":99},{"surah":20,"ayah":114},{"surah":20,"ayah":126},{"surah":21,"ayah":1},{"surah":21,"ayah":11},{"surah":21,"ayah":25},{"surah":21,"ayah":36},{"surah":21,"ayah":45},{"surah":21,"ayah":58},{"surah":21,"ayah":73},{"surah":21,"ayah":82},{"surah":21,"ayah":91},{"surah":21,"ayah":102},{"surah":22,"ayah":1},{"surah":22,"ayah":6},{"surah":22,"ayah":16},{"surah":22,"ayah":24},{"surah":22,"ayah":31},{"surah":22,"ayah":39},{"surah":22,"ayah":47},{"surah":22,"ayah":56},{"surah":22,"ayah":65},{"surah":22,"ayah":73},{"surah":23,"ayah":1},{"surah":23,"ayah":18},{"surah":23,"ayah":28},{"surah":23,"ayah":43},{"surah":23,"ayah":60},{"surah":23,"ayah":75},{"surah":23,"ayah":90},{"surah":23,"ayah":105},{"surah":24,"ayah":1},{"surah":24,"ayah":11},{"surah":24,"ayah":21},{"surah":24,"ayah":28},{"surah":24,"ayah":32},{"surah":24,"ayah":37},{"surah":24,"ayah":44},{"surah":24,"ayah":54},{"surah":24,"ayah":59},{"surah":24,"ayah":62},{"surah":25,"ayah":3},{"surah":25,"ayah":12},{"surah":25,"ayah":21},{"surah":25,"ayah":33},{"surah":25,"ayah":44},{"surah":25,"ayah":56},{"surah":25,"ayah":68},{"surah":26,"ayah":1},{"surah":26,"ayah":20},{"surah":26,"ayah":40},{"surah":26,"ayah":61},{"surah":26,"ayah":84},{"surah":26,"ayah":112},{"surah":26,"ayah":137},{"surah":26,"ayah":160},{"surah":26,"ayah":184},{"surah":26,"ayah":207},{"surah":27,"ayah":1},{"surah":27,"ayah":14},{"surah":27,"ayah":23},{"surah":27,"ayah":36},{"surah":27,"ayah":45},{"surah":27,"ayah":56},{"surah":27,"ayah":64},{"surah":27,"ayah":77},{"surah":27,"ayah":89},{"surah":28,"ayah":6},{"surah":28,"ayah":14},{"surah":28,"ayah":22},{"surah":28,"ayah":29},{"surah":28,"ayah":36},{"surah":28,"ayah":44},{"surah":28,"ayah":51},{"surah":28,"ayah":60},{"surah":28,"ayah":71},{"surah":28,"ayah":78},{"surah":28,"ayah":85},{"surah":29,"ayah":7},{"surah":29,"ayah":15},{"surah":29,"ayah":24},{"surah":29,"ayah":31},{"surah":29,"ayah":39},{"surah":29,"ayah":46},{"surah":29,"ayah":53},{"surah":29,"ayah":64},{"surah":30,"ayah":6},{"surah":30,"ayah":16},{"surah":30,"ayah":25},{"surah":30,"ayah":33},{"surah":30,"ayah":42},{"surah":30,"ayah":51},{"surah":31,"ayah":1},{"surah":31,"ayah":12},{"surah":31,"ayah":20},{"surah":31,"ayah":29},{"surah":32,"ayah":1},{"surah":32,"ayah":12},{"surah":32,"ayah":21},{"surah":33,"ayah":1},{"surah":33,"ayah":7},{"surah":33,"ayah":16},{"surah":33,"ayah":23},{"surah":33,"ayah":31},{"surah":33,"ayah":36},{"surah":33,"ayah":44},{"surah":33,"ayah":51},{"surah":33,"ayah":55},{"surah":33,"ayah":63},{"surah":34,"ayah":1},{"surah":34,"ayah":8},{"surah":34,"ayah":15},{"surah":34,"ayah":23},{"surah":34,"ayah":32},{"surah":34,"ayah":40},{"surah":34,"ayah":49},{"surah":35,"ayah":4},{"surah":35,"ayah":12},{"surah":35,"ayah":19},{"surah":35,"ayah":31},{"surah":35,"ayah":39},{"surah":35,"ayah":45},{"surah":36,"ayah":13},{"surah":36,"ayah":28},{"surah":36,"ayah":41},{"surah":36,"ayah":55},{"surah":36,"ayah":71},{"surah":37,"ayah":1},{"surah":37,"ayah":25},{"surah":37,"ayah":52},{"surah":37,"ayah":77},{"surah":37,"ayah":103},{"surah":37,"ayah":127},{"surah":37,"ayah":154},{"surah":38,"ayah":1},{"surah":38,"ayah":17},{"surah":38,"ayah":27},{"surah":38,"ayah":43},{"surah":38,"ayah":62},{"surah":38,"ayah":84},{"surah":39,"ayah":6},{"surah":39,"ayah":11},{"surah":39,"ayah":22},{"surah":39,"ayah":32},{"surah":39,"ayah":41},{"surah":39,"ayah":48},{"surah":39,"ayah":57},{"surah":39,"ayah":68},{"surah":39,"ayah":75},{"surah":40,"ayah":8},{"surah":40,"ayah":17},{"surah":40,"ayah":26},{"surah":40,"ayah":34},{"surah":40,"ayah":41},{"surah":40,"ayah":50},{"surah":40,"ayah":59},{"surah":40,"ayah":67},{"surah":40,"ayah":78},{"surah":41,"ayah":1},{"surah":41,"ayah":12},{"surah":41,"ayah":21},{"surah":41,"ayah":30},{"surah":41,"ayah":39},{"surah":41,"ayah":47},{"surah":42,"ayah":1},{"surah":42,"ayah":11},{"surah":42,"ayah":16},{"surah":42,"ayah":23},{"surah":42,"ayah":32},{"surah":42,"ayah":45},{"surah":42,"ayah":52},{"surah":43,"ayah":11},{"surah":43,"ayah":23},{"surah":43,"ayah":34},{"surah":43,"ayah":48},{"surah":43,"ayah":61},{"surah":43,"ayah":74},{"surah":44,"ayah":1},{"surah":44,"ayah":19},{"surah":44,"ayah":40},{"surah":45,"ayah":1},{"surah":45,"ayah":14},{"surah":45,"ayah":23},{"surah":45,"ayah":33},{"surah":46,"ayah":6},{"surah":46,"ayah":15},{"surah":46,"ayah":21},{"surah":46,"ayah":29},{"surah":47,"ayah":1},{"surah":47,"ayah":12},{"surah":47,"ayah":20},{"surah":47,"ayah":30},{"surah":48,"ayah":1},{"surah":48,"ayah":10},{"surah":48,"ayah":16},{"surah":48,"ayah":24},{"surah":48,"ayah":29},{"surah":49,"ayah":5},{"surah":49,"ayah":12},{"surah":50,"ayah":1},{"surah":50,"ayah":16},{"surah":50,"ayah":36},{"surah":51,"ayah":7},{"surah":51,"ayah":31},{"surah":51,"ayah":52},{"surah":52,"ayah":15},{"surah":52,"ayah":32},{"surah":53,"ayah":1},{"surah":53,"ayah":27},{"surah":53,"ayah":45},{"surah":54,"ayah":7},{"surah":54,"ayah":28},{"surah":54,"ayah":50},{"surah":55,"ayah":17},{"surah":55,"ayah":41},{"surah":55,"ayah":68},{"surah":56,"ayah":17},{"surah":56,"ayah":51},{"surah":56,"ayah":77},{"surah":57,"ayah":4},{"surah":57,"ayah":12},{"surah":57,"ayah":19},{"surah":57,"ayah":25},{"surah":58,"ayah":1},{"surah":58,"ayah":7},{"surah":58,"ayah":12},{"surah":58,"ayah":22},{"surah":59,"ayah":4},{"surah":59,"ayah":10},{"surah":59,"ayah":17},{"surah":60,"ayah":1},{"surah":60,"ayah":6},{"surah":60,"ayah":12},{"surah":61,"ayah":6},{"surah":62,"ayah":1},{"surah":62,"ayah":9},{"surah":63,"ayah":5},{"surah":64,"ayah":1},{"surah":64,"ayah":10},{"surah":65,"ayah":1},{"surah":65,"ayah":6},{"surah":66,"ayah":1},{"surah":66,"ayah":8},{"surah":67,"ayah":1},{"surah":67,"ayah":13},{"surah":67,"ayah":27},{"surah":68,"ayah":16},{"surah":68,"ayah":43},{"surah":69,"ayah":9},{"surah":69,"ayah":35},{"surah":70,"ayah":11},{"surah":70,"ayah":40},{"surah":71,"ayah":11},{"surah":72,"ayah":1},{"surah":72,"ayah":14},{"surah":73,"ayah":1},{"surah":73,"ayah":20},{"surah":74,"ayah":18},{"surah":74,"ayah":48},{"surah":75,"ayah":20},{"surah":76,"ayah":6},{"surah":76,"ayah":26},{"surah":77,"ayah":20},{"surah":78,"ayah":1},{"surah":78,"ayah":31},{"surah":79,"ayah":16},{"surah":80,"ayah":1},{"surah":81,"ayah":1},{"surah":82,"ayah":1},{"surah":83,"ayah":7},{"surah":83,"ayah":35},{"surah":85,"ayah":1},{"surah":86,"ayah":1},{"surah":87,"ayah":16},{"surah":89,"ayah":1},{"surah":89,"ayah":24},{"surah":91,"ayah":1},{"surah":92,"ayah":15},{"surah":95,"ayah":1},{"surah":97,"ayah":1},{"surah":98,"ayah":8},{"surah":100,"ayah":10},{"surah":103,"ayah":1},{"surah":106,"ayah":1},{"surah":109,"ayah":1},{"surah":112,"ayah":1}];

// Exact start page and page range for each Juz (1 - 30) in the 604-page Mushaf
export const JUZ_UTHMANI_PAGES = [
  { juz: 1, startPg: 1, endPg: 21, totalPages: 21, nameBn: "১ম পারা", nameAr: "الم", startSurah: 1, startAyah: 1 },
  { juz: 2, startPg: 22, endPg: 41, totalPages: 20, nameBn: "২য় পারা", nameAr: "سَيَقُولُ", startSurah: 2, startAyah: 142 },
  { juz: 3, startPg: 42, endPg: 61, totalPages: 20, nameBn: "৩য় পারা", nameAr: "تِلْكَ الرُّسُلُ", startSurah: 2, startAyah: 253 },
  { juz: 4, startPg: 62, endPg: 81, totalPages: 20, nameBn: "৪র্থ পারা", nameAr: "لَنْ تَنَالُوا", startSurah: 3, startAyah: 93 },
  { juz: 5, startPg: 82, endPg: 101, totalPages: 20, nameBn: "৫ম পারা", nameAr: "وَالْمُحْصَنَاتُ", startSurah: 4, startAyah: 24 },
  { juz: 6, startPg: 102, endPg: 120, totalPages: 19, nameBn: "৬ষ্ঠ পারা", nameAr: "لَا يُحِبُّ اللَّهُ", startSurah: 4, startAyah: 148 },
  { juz: 7, startPg: 121, endPg: 141, totalPages: 21, nameBn: "৭ম পারা", nameAr: "وَإِذَا سَمِعُوا", startSurah: 5, startAyah: 82 },
  { juz: 8, startPg: 142, endPg: 161, totalPages: 20, nameBn: "৮ম পারা", nameAr: "وَلَوْ أَنَّنَا", startSurah: 6, startAyah: 111 },
  { juz: 9, startPg: 162, endPg: 181, totalPages: 20, nameBn: "৯ম পারা", nameAr: "قَالَ الْمَلَأُ", startSurah: 7, startAyah: 88 },
  { juz: 10, startPg: 182, endPg: 200, totalPages: 19, nameBn: "১০ম পারা", nameAr: "وَاعْلَمُوا", startSurah: 8, startAyah: 41 },
  { juz: 11, startPg: 201, endPg: 221, totalPages: 21, nameBn: "১১তম পারা", nameAr: "يَعْتَذِرُونَ", startSurah: 9, startAyah: 93 },
  { juz: 12, startPg: 222, endPg: 241, totalPages: 20, nameBn: "১২তম পারা", nameAr: "وَمَا مِنْ دَابَّةٍ", startSurah: 11, startAyah: 6 },
  { juz: 13, startPg: 242, endPg: 261, totalPages: 20, nameBn: "১৩তম পারা", nameAr: "وَمَا أُبَرِّئُ", startSurah: 12, startAyah: 53 },
  { juz: 14, startPg: 262, endPg: 281, totalPages: 20, nameBn: "১৪তম পারা", nameAr: "رُبَمَا", startSurah: 15, startAyah: 1 },
  { juz: 15, startPg: 282, endPg: 301, totalPages: 20, nameBn: "১৫তম পারা", nameAr: "سُبْحَانَ الَّذِي", startSurah: 17, startAyah: 1 },
  { juz: 16, startPg: 302, endPg: 321, totalPages: 20, nameBn: "১৬তম পারা", nameAr: "قَالَ أَلَمْ", startSurah: 18, startAyah: 75 },
  { juz: 17, startPg: 322, endPg: 341, totalPages: 20, nameBn: "১৭তম পারা", nameAr: "اقْتَرَبَ", startSurah: 21, startAyah: 1 },
  { juz: 18, startPg: 342, endPg: 361, totalPages: 20, nameBn: "১৮তম পারা", nameAr: "قَدْ أَفْلَحَ", startSurah: 23, startAyah: 1 },
  { juz: 19, startPg: 362, endPg: 381, totalPages: 20, nameBn: "১৯তম পারা", nameAr: "وَقَالَ الَّذِينَ", startSurah: 25, startAyah: 21 },
  { juz: 20, startPg: 382, endPg: 401, totalPages: 20, nameBn: "২০তম পারা", nameAr: "فَمَا كَانَ", startSurah: 27, startAyah: 56 },
  { juz: 21, startPg: 402, endPg: 421, totalPages: 20, nameBn: "২১তম পারা", nameAr: "وَلَا تُجَادِلُوا", startSurah: 29, startAyah: 46 },
  { juz: 22, startPg: 422, endPg: 441, totalPages: 20, nameBn: "২২তম পারা", nameAr: "وَمَنْ يَقْنُتْ", startSurah: 33, startAyah: 31 },
  { juz: 23, startPg: 442, endPg: 461, totalPages: 20, nameBn: "২৩তম পারা", nameAr: "وَمَا أَنْزَلْنَا", startSurah: 36, startAyah: 28 },
  { juz: 24, startPg: 462, endPg: 481, totalPages: 20, nameBn: "২৪তম পারা", nameAr: "فَمَنْ أَظْلَمُ", startSurah: 39, startAyah: 32 },
  { juz: 25, startPg: 482, endPg: 501, totalPages: 20, nameBn: "২৫তম পারা", nameAr: "إِلَيْهِ يُرَدُّ", startSurah: 41, startAyah: 47 },
  { juz: 26, startPg: 502, endPg: 521, totalPages: 20, nameBn: "২৬তম পারা", nameAr: "حم", startSurah: 46, startAyah: 1 },
  { juz: 27, startPg: 522, endPg: 541, totalPages: 20, nameBn: "২৭তম পারা", nameAr: "قَالَ فَمَا خَطْبُكُمْ", startSurah: 51, startAyah: 31 },
  { juz: 28, startPg: 542, endPg: 561, totalPages: 20, nameBn: "২৮তম পারা", nameAr: "قَدْ سَمِعَ اللَّهُ", startSurah: 58, startAyah: 1 },
  { juz: 29, startPg: 562, endPg: 581, totalPages: 20, nameBn: "২৯তম পারা", nameAr: "تَبَارَكَ الَّذِي", startSurah: 67, startAyah: 1 },
  { juz: 30, startPg: 582, endPg: 604, totalPages: 23, nameBn: "৩০তম পারা (আম্মা পারা)", nameAr: "عَمَّ يَتَسَاءَلُونَ", startSurah: 78, startAyah: 1 },
];

/**
 * Get total pages in any Para
 */
export function getParaTotalPages(paraNumber) {
  const p = Math.max(1, Math.min(30, Number(paraNumber) || 1));
  return JUZ_UTHMANI_PAGES[p - 1].totalPages;
}

/**
 * Compute global Hafizi page (1 - 610) from (Para, ParaPage)
 */
export function getHafiziGlobalPage(paraNumber, paraPageNumber) {
  const p = Math.max(1, Math.min(30, Number(paraNumber) || 1));
  const info = JUZ_UTHMANI_PAGES[p - 1];
  const pageInPara = Math.max(1, Math.min(info.totalPages, Number(paraPageNumber) || 1));
  return info.startPg + pageInPara - 1;
}

/**
 * Convert global Hafizi page (1 - 610) into { para, paraPage, totalPages, globalPage, nameBn, nameAr }
 */
export function getHafiziLocation(globalPage) {
  const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
  const str = String(globalPage || '').replace(/[০-৯]/g, (d) => bnToEnMap[d] || d).trim();
  const num = parseInt(str, 10);
  const g = Math.max(1, Math.min(604, isNaN(num) ? 1 : num));
  const info = JUZ_UTHMANI_PAGES.find((p) => g >= p.startPg && g <= p.endPg) || JUZ_UTHMANI_PAGES[0];
  const paraPage = g - info.startPg + 1;
  return {
    para: info.juz,
    paraPage,
    totalPages: info.totalPages,
    globalPage: g,
    uthmaniPage: g,
    nameBn: info.nameBn,
    nameAr: info.nameAr,
    startSurah: info.startSurah,
    startAyah: info.startAyah,
  };
}

/**
 * Resolve target Surah & Ayah for any Hafizi Para and Para-Page
 * Directly and accurately maps to the exact page without rounding skew!
 */
export function getHafiziPageTarget(paraNumber, paraPageNumber) {
  const p = Math.max(1, Math.min(30, Number(paraNumber) || 1));
  const info = JUZ_UTHMANI_PAGES[p - 1];

  let rawPg = Number(paraPageNumber) || 1;
  let pageInPara = 1;
  let targetUthmaniPage = info.startPg;

  // Polymorphic resolution: if rawPg is a global page (e.g. 182 or 586)
  if (rawPg >= info.startPg && rawPg <= info.endPg) {
    targetUthmaniPage = rawPg;
    pageInPara = Math.max(1, Math.min(info.totalPages, rawPg - info.startPg + 1));
  } else if (rawPg > info.totalPages && rawPg >= 1 && rawPg <= TOTAL_UTHMANI_PAGES) {
    // Global page outside this Para range: find that page's actual Juz
    targetUthmaniPage = rawPg;
    const actualJuz = JUZ_UTHMANI_PAGES.find((j) => rawPg >= j.startPg && rawPg <= j.endPg) || info;
    pageInPara = Math.max(1, Math.min(actualJuz.totalPages, rawPg - actualJuz.startPg + 1));
  } else {
    // Normal 1-based page within this Para (e.g. 1 to 20)
    pageInPara = Math.max(1, Math.min(info.totalPages, rawPg));
    targetUthmaniPage = Math.min(604, Math.max(1, info.startPg + pageInPara - 1));
  }

  // Exact verse reference for this page
  const ref = UTHMANI_PAGE_REFERENCES[targetUthmaniPage - 1] || { surah: info.startSurah, ayah: info.startAyah };

  return {
    surah: ref.surah,
    ayah: ref.ayah,
    globalPage: targetUthmaniPage,
    uthmaniPage: targetUthmaniPage,
    para: p,
    paraPage: pageInPara,
    totalPagesInPara: info.totalPages,
  };
}

/**
 * Find Hafizi location (Para, ParaPage, GlobalPage) for any given Surah and Ayah number
 */
export function getHafiziLocationForAyah(surahNum, ayahNum) {
  const s = Number(surahNum) || 1;
  const a = Number(ayahNum) || 1;

  // Search through UTHMANI_PAGE_REFERENCES to find the latest page that started at or before (s, a)
  let foundUthmaniPage = 1;
  for (let i = UTHMANI_PAGE_REFERENCES.length - 1; i >= 0; i--) {
    const ref = UTHMANI_PAGE_REFERENCES[i];
    if (ref.surah < s || (ref.surah === s && ref.ayah <= a)) {
      foundUthmaniPage = i + 1;
      break;
    }
  }

  const juzInfo = JUZ_UTHMANI_PAGES.find((j) => foundUthmaniPage >= j.startPg && foundUthmaniPage <= j.endPg) || JUZ_UTHMANI_PAGES[0];
  const paraPage = foundUthmaniPage - juzInfo.startPg + 1;

  return {
    para: juzInfo.juz,
    paraPage,
    totalPages: juzInfo.totalPages,
    globalPage: foundUthmaniPage,
    uthmaniPage: foundUthmaniPage,
    nameBn: juzInfo.nameBn,
    nameAr: juzInfo.nameAr,
    startSurah: juzInfo.startSurah,
    startAyah: juzInfo.startAyah,
  };
}

/**
 * Parse human Bengali or English search queries for Para & Page:
 * e.g. "পারা ৫ পৃষ্ঠা ১২", "para 5 page 12", "পৃষ্ঠা ৮৫", "p 30 p 25", "5 12"
 */
export function parseHafiziSearchQuery(inputQuery) {
  if (!inputQuery) return null;
  const q = String(inputQuery).trim();

  // Convert Bengali numerals to English numerals
  const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
  const normalized = q.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d).toLowerCase();

  // Pattern 1: "para 5 page 12" or "পারা ৫ পৃষ্ঠা ১২" or "পারা ৫ এর ১২ পৃষ্ঠা" or "p 5 p 12"
  const paraPageMatch = normalized.match(/(?:পারা|para|juz|p)\s*(\d+)\s*(?:এর|no|নং|র)?\s*(?:পৃষ্ঠা|পৃ|page|pg|p)?\s*(\d+)/i);
  if (paraPageMatch) {
    const p = parseInt(paraPageMatch[1], 10);
    const pg = parseInt(paraPageMatch[2], 10);
    if (p >= 1 && p <= 30) {
      return getHafiziPageTarget(p, pg);
    }
  }

  // Pattern 2: Page before Para: "পৃষ্ঠা ১২ পারা ৫" or "page 12 para 5"
  const pageBeforeParaMatch = normalized.match(/(?:পৃষ্ঠা|পৃ|page|pg)\s*(\d+)\s*(?:পারা|para|juz|p)\s*(\d+)/i);
  if (pageBeforeParaMatch) {
    const pg = parseInt(pageBeforeParaMatch[1], 10);
    const p = parseInt(pageBeforeParaMatch[2], 10);
    if (p >= 1 && p <= 30) {
      return getHafiziPageTarget(p, pg);
    }
  }

  // Pattern 3: Global Page alone: "পৃষ্ঠা ৯৩" or "page 93"
  const pageAloneMatch = normalized.match(/(?:পৃষ্ঠা|page|pg)\s*(\d+)/i);
  if (pageAloneMatch) {
    const g = parseInt(pageAloneMatch[1], 10);
    if (g >= 1 && g <= TOTAL_HAFIZI_PAGES) {
      const loc = getHafiziLocation(g);
      return getHafiziPageTarget(loc.para, loc.paraPage);
    }
  }

  // Pattern 4: "5, 12" or "5 12" or "5-12" or "5/12" or "5:12"
  const twoNumbersMatch = normalized.match(/^(\d{1,2})\s*[,:\-\/\s]\s*(\d{1,2})$/);
  if (twoNumbersMatch) {
    const p = parseInt(twoNumbersMatch[1], 10);
    const pg = parseInt(twoNumbersMatch[2], 10);
    if (p >= 1 && p <= 30 && pg >= 1 && pg <= 30) {
      return getHafiziPageTarget(p, pg);
    }
  }

  // Pattern 5: Para alone: "পারা ৫" or "para 5"
  const paraAloneMatch = normalized.match(/^(?:পারা|para|juz)\s*(\d{1,2})$/i);
  if (paraAloneMatch) {
    const p = parseInt(paraAloneMatch[1], 10);
    if (p >= 1 && p <= 30) {
      return getHafiziPageTarget(p, 1);
    }
  }

  return null;
}

export const TOTAL_UTHMANI_PAGES = 604;

/**
 * Get full Hafizi / Mushaf Page Metadata for any page (1 - 604)
 * Returns the exact Ayah ranges, whether a new Surah begins on this page,
 * the expected line count (13 if new Surah header present, 15 lines if regular recitation),
 * and the corresponding Juz / Para information.
 */
export function getHafiziPageMeta(pageNum) {
  const pIndex = Math.max(0, Math.min(603, (Number(pageNum) || 1) - 1));
  const start = UTHMANI_PAGE_REFERENCES[pIndex];
  const next = pIndex < 603 ? UTHMANI_PAGE_REFERENCES[pIndex + 1] : null;
  const ranges = [];
  const newSurahs = [];

  if (!next) {
    for (let s = start.surah; s <= 114; s++) {
      const sMeta = ALL_SURAHS.find((x) => x.id === s) || { id: s, nameAr: `سورة ${s}`, nameBn: `সূরা ${s}`, versesCount: 7 };
      const fromAyah = (s === start.surah) ? start.ayah : 1;
      if (fromAyah === 1) newSurahs.push(sMeta);
      ranges.push({ surah: s, fromAyah, toAyah: sMeta.versesCount, meta: sMeta });
    }
  } else {
    for (let s = start.surah; s <= next.surah; s++) {
      const sMeta = ALL_SURAHS.find((x) => x.id === s) || { id: s, nameAr: `سورة ${s}`, nameBn: `সূরা ${s}`, versesCount: 7 };
      const fromAyah = (s === start.surah) ? start.ayah : 1;
      let toAyah = sMeta.versesCount;
      if (s === next.surah) {
        toAyah = next.ayah - 1;
      }
      if (toAyah >= fromAyah) {
        if (fromAyah === 1) newSurahs.push(sMeta);
        ranges.push({ surah: s, fromAyah, toAyah, meta: sMeta });
      }
    }
  }

  const firstSurah = ranges[0]?.surah || 1;
  const firstAyah = ranges[0]?.fromAyah || 1;
  const paraLoc = getHafiziLocationForAyah(firstSurah, firstAyah);

  return {
    page: pIndex + 1,
    totalPages: TOTAL_UTHMANI_PAGES,
    ranges,
    newSurahs,
    hasNewSurah: newSurahs.length > 0,
    expectedLines: newSurahs.length > 0 ? 13 : 15,
    para: paraLoc.para,
    paraNameBn: paraLoc.nameBn,
    paraNameAr: paraLoc.nameAr,
    paraPage: paraLoc.paraPage,
    totalPagesInPara: paraLoc.totalPages,
    firstSurahMeta: ranges[0]?.meta || ALL_SURAHS[0],
    lastSurahMeta: ranges[ranges.length - 1]?.meta || ALL_SURAHS[0],
  };
}
