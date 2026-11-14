export interface SurahMeta {
  no: number;
  name: string;
  english: string;
  page: number;
  juz: number;
  ayahs: number;
  place: "মক্কী" | "মাদানী";
}

export interface ParaMeta {
  juz: number;
  name: string;
  arabic: string;
  startPage: number;
}

export const PARAS_DATA: ParaMeta[] = [
  { juz: 1, name: "আলিফ লাম মীম", arabic: "الم", startPage: 1 },
  { juz: 2, name: "সায়াকূলু", arabic: "سَيَقُولُ", startPage: 22 },
  { juz: 3, name: "তিলকার রুসুল", arabic: "تِلْكَ الرُّسُلُ", startPage: 42 },
  { juz: 4, name: "লান তানালূ", arabic: "لَنْ تَنَالُوا", startPage: 62 },
  { juz: 5, name: "ওয়াল মুহছানাত", arabic: "وَالْمُحْصَنَاتُ", startPage: 82 },
  { juz: 6, name: "লা ইউহিব্বুল্লাহ", arabic: "لَا يُحِبُّ اللَّهُ", startPage: 102 },
  { juz: 7, name: "ওয়া ইযা সামিঊ", arabic: "وَإِذَا سَمِعُوا", startPage: 121 },
  { juz: 8, name: "ওয়া লাও আন্নানা", arabic: "وَلَوْ أَنَّنَا", startPage: 142 },
  { juz: 9, name: "ক্বালা আল-মালাউ", arabic: "قَالَ الْمَلَأُ", startPage: 162 },
  { juz: 10, name: "ওয়া'লামূ", arabic: "وَاعْلَمُوا", startPage: 182 },
  { juz: 11, name: "ইয়া'তাযিরূন", arabic: "يَعْتَذِرُونَ", startPage: 201 },
  { juz: 12, name: "ওয়ামা মিন দা-ব্বাহ", arabic: "وَمَا مِنْ دَابَّةٍ", startPage: 222 },
  { juz: 13, name: "ওয়ামা উবাররিউ", arabic: "وَمَا أُبَرِّئُ", startPage: 242 },
  { juz: 14, name: "রুবামা", arabic: "رُبَمَا", startPage: 262 },
  { juz: 15, name: "সুবহানাল্লাযী", arabic: "سُبْحَانَ الَّذِي", startPage: 282 },
  { juz: 16, name: "ক্বালা আলাম", arabic: "قَالَ أَلَمْ", startPage: 302 },
  { juz: 17, name: "ইক্বতারাTabs", arabic: "اقْتَرَبَ", startPage: 322 },
  { juz: 18, name: "ক্বাদ আফলাহা", arabic: "قَدْ أَفْلَحَ", startPage: 342 },
  { juz: 19, name: "ওয়াক্বালা কাফারূ", arabic: "وَقَالَ الَّذِينَ", startPage: 362 },
  { juz: 20, name: "আম্মান খালাক্বা", arabic: "أَمَّنْ خَلَقَ", startPage: 382 },
  { juz: 21, name: "উতলু মা উহিয়া", arabic: "اتْلُ مَا أُوحِيَ", startPage: 402 },
  { juz: 22, name: "ওয়ামান ইয়াক্বনুত", arabic: "وَمَنْ يَقْنُتْ", startPage: 422 },
  { juz: 23, name: "ওয়ামালী", arabic: "وَمَا لِيَ", startPage: 442 },
  { juz: 24, name: "ফামান আযলামু", arabic: "فَمَنْ أَظْلَمُ", startPage: 462 },
  { juz: 25, name: "ইলাইহি ইউরাদ্দু", arabic: "إِلَيْهِ يُرَدُّ", startPage: 482 },
  { juz: 26, name: "হা-মীম", arabic: "حم", startPage: 502 },
  { juz: 27, name: "ক্বালা ফামা খাতবুকুম", arabic: "قَالَ فَمَا خَطْبُكُمْ", startPage: 522 },
  { juz: 28, name: "ক্বাদ সামি'আল্লাহ", arabic: "قَدْ سَمِعَ اللَّهُ", startPage: 542 },
  { juz: 29, name: "তাবারাকাল্লাযী", arabic: "تَبَارَكَ الَّذِي", startPage: 562 },
  { juz: 30, name: "আম্মা ইয়াতাসাআলূন", arabic: "عَمَّ يَتَسَاءَلُونَ", startPage: 582 },
];

export const SURAHS_DATA: SurahMeta[] = [
  { no: 1, name: "আল-ফাতিহা", english: "Al-Fatihah", page: 1, juz: 1, ayahs: 7, place: "মক্কী" },
  { no: 2, name: "আল-বাকারাহ", english: "Al-Baqarah", page: 2, juz: 1, ayahs: 286, place: "মাদানী" },
  { no: 3, name: "আলে ইমরান", english: "Ali 'Imran", page: 50, juz: 3, ayahs: 200, place: "মাদানী" },
  { no: 4, name: "আন-নিসা", english: "An-Nisa", page: 77, juz: 4, ayahs: 176, place: "মাদানী" },
  { no: 5, name: "আল-মায়েদাহ", english: "Al-Ma'idah", page: 106, juz: 6, ayahs: 120, place: "মাদানী" },
  { no: 6, name: "আল-আনআম", english: "Al-An'am", page: 128, juz: 7, ayahs: 165, place: "মক্কী" },
  { no: 7, name: "আল-আরাফ", english: "Al-A'raf", page: 151, juz: 8, ayahs: 206, place: "মক্কী" },
  { no: 8, name: "আল-আনফাল", english: "Al-Anfal", page: 177, juz: 9, ayahs: 75, place: "মাদানী" },
  { no: 9, name: "আত-তাওবাহ", english: "At-Tawbah", page: 187, juz: 10, ayahs: 129, place: "মাদানী" },
  { no: 10, name: "ইউনুস", english: "Yunus", page: 208, juz: 11, ayahs: 109, place: "মক্কী" },
  { no: 11, name: "হুদ", english: "Hud", page: 221, juz: 11, ayahs: 123, place: "মক্কী" },
  { no: 12, name: "ইউসুফ", english: "Yusuf", page: 235, juz: 12, ayahs: 111, place: "মক্কী" },
  { no: 13, name: "আর-রাদ", english: "Ar-Ra'd", page: 249, juz: 13, ayahs: 43, place: "মাদানী" },
  { no: 14, name: "ইব্রাহিম", english: "Ibrahim", page: 255, juz: 13, ayahs: 52, place: "মক্কী" },
  { no: 15, name: "আল-হিজর", english: "Al-Hijr", page: 262, juz: 14, ayahs: 99, place: "মক্কী" },
  { no: 16, name: "আন-নাহল", english: "An-Nahl", page: 267, juz: 14, ayahs: 128, place: "মক্কী" },
  { no: 17, name: "বনি ইসরাঈল", english: "Al-Isra", page: 282, juz: 15, ayahs: 111, place: "মক্কী" },
  { no: 18, name: "আল-কাহফ", english: "Al-Kahf", page: 293, juz: 15, ayahs: 110, place: "মক্কী" },
  { no: 19, name: "মারইয়াম", english: "Maryam", page: 305, juz: 16, ayahs: 98, place: "মক্কী" },
  { no: 20, name: "ত্বা-হা", english: "Ta-Ha", page: 312, juz: 16, ayahs: 135, place: "মক্কী" },
  { no: 21, name: "আল-আম্বিয়া", english: "Al-Anbiya", page: 322, juz: 17, ayahs: 112, place: "মক্কী" },
  { no: 22, name: "আল-হাজ্জ", english: "Al-Hajj", page: 332, juz: 17, ayahs: 78, place: "মাদানী" },
  { no: 23, name: "আল-মুমিনুন", english: "Al-Mu'minun", page: 342, juz: 18, ayahs: 118, place: "মক্কী" },
  { no: 24, name: "আন-নূর", english: "An-Nur", page: 350, juz: 18, ayahs: 64, place: "মাদানী" },
  { no: 25, name: "আল-ফুরকান", english: "Al-Furqan", page: 359, juz: 18, ayahs: 77, place: "মক্কী" },
  { no: 26, name: "আশ-শুয়ারা", english: "Ash-Shu'ara", page: 367, juz: 19, ayahs: 227, place: "মক্কী" },
  { no: 27, name: "আন-নামল", english: "An-Naml", page: 377, juz: 19, ayahs: 93, place: "মক্কী" },
  { no: 28, name: "আল-কাসাস", english: "Al-Qasas", page: 385, juz: 20, ayahs: 88, place: "মক্কী" },
  { no: 29, name: "আল-আনকাবুত", english: "Al-'Ankabut", page: 396, juz: 20, ayahs: 69, place: "মক্কী" },
  { no: 30, name: "আর-রূম", english: "Ar-Rum", page: 404, juz: 21, ayahs: 60, place: "মক্কী" },
  { no: 31, name: "লুকমান", english: "Luqman", page: 411, juz: 21, ayahs: 34, place: "মক্কী" },
  { no: 32, name: "আস-সাজদাহ", english: "As-Sajdah", page: 415, juz: 21, ayahs: 30, place: "মক্কী" },
  { no: 33, name: "আল-আহযাব", english: "Al-Ahzab", page: 418, juz: 21, ayahs: 73, place: "মাদানী" },
  { no: 34, name: "সাবা", english: "Saba", page: 428, juz: 22, ayahs: 54, place: "মক্কী" },
  { no: 35, name: "ফাতির", english: "Fatir", page: 434, juz: 22, ayahs: 45, place: "মক্কী" },
  { no: 36, name: "ইয়াসিন", english: "Ya-Sin", page: 440, juz: 22, ayahs: 83, place: "মক্কী" },
  { no: 37, name: "আস-সাফফাত", english: "As-Saffat", page: 446, juz: 23, ayahs: 182, place: "মক্কী" },
  { no: 38, name: "ছোয়াদ", english: "Sad", page: 453, juz: 23, ayahs: 88, place: "মক্কী" },
  { no: 39, name: "আজ-যুমার", english: "Az-Zumar", page: 458, juz: 23, ayahs: 75, place: "মক্কী" },
  { no: 40, name: "গাফির", english: "Ghafir", page: 467, juz: 24, ayahs: 85, place: "মক্কী" },
  { no: 41, name: "ফুসসিলাত", english: "Fussilat", page: 477, juz: 24, ayahs: 54, place: "মক্কী" },
  { no: 42, name: "আশ-শুরা", english: "Ash-Shura", page: 483, juz: 25, ayahs: 53, place: "মক্কী" },
  { no: 43, name: "আজ-জু Ruf", english: "Az-Zukhruf", page: 489, juz: 25, ayahs: 89, place: "মক্কী" },
  { no: 44, name: "আদ-দুখান", english: "Ad-Dukhan", page: 496, juz: 25, ayahs: 59, place: "মক্কী" },
  { no: 45, name: "আল-জাসিয়াহ", english: "Al-Jathiyah", page: 499, juz: 25, ayahs: 37, place: "মক্কী" },
  { no: 46, name: "আল-আহকাফ", english: "Al-Ahqaf", page: 502, juz: 26, ayahs: 35, place: "মক্কী" },
  { no: 47, name: "মুহাম্মদ", english: "Muhammad", page: 507, juz: 26, ayahs: 38, place: "মাদানী" },
  { no: 48, name: "আল-ফাতহ", english: "Al-Fath", page: 511, juz: 26, ayahs: 29, place: "মাদানী" },
  { no: 49, name: "আল-হুজুরাত", english: "Al-Hujurat", page: 515, juz: 26, ayahs: 18, place: "মাদানী" },
  { no: 50, name: "কাফ", english: "Qaf", page: 518, juz: 26, ayahs: 45, place: "মক্কী" },
  { no: 55, name: "আর-রহমান", english: "Ar-Rahman", page: 531, juz: 27, ayahs: 78, place: "মাদানী" },
  { no: 56, name: "আল-ওয়াকিয়াহ", english: "Al-Waqi'ah", page: 534, juz: 27, ayahs: 96, place: "মক্কী" },
  { no: 67, name: "আল-মুলক", english: "Al-Mulk", page: 562, juz: 29, ayahs: 30, place: "মক্কী" },
  { no: 78, name: "আন-নাবা", english: "An-Naba", page: 582, juz: 30, ayahs: 40, place: "মক্কী" },
  { no: 87, name: "আল-আ'লা", english: "Al-A'la", page: 591, juz: 30, ayahs: 19, place: "মক্কী" },
  { no: 97, name: "আল-কদর", english: "Al-Qadr", page: 598, juz: 30, ayahs: 5, place: "মক্কী" },
  { no: 112, name: "আল-ইখলাস", english: "Al-Ikhlas", page: 604, juz: 30, ayahs: 4, place: "মক্কী" },
  { no: 113, name: "আল-ফালাক", english: "Al-Falaq", page: 604, juz: 30, ayahs: 5, place: "মক্কী" },
  { no: 114, name: "আন-নাস", english: "An-Nas", page: 604, juz: 30, ayahs: 6, place: "মক্কী" },
];
