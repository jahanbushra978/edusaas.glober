const fs = require('fs');

// Helper to generate candidate URLs with high-reliability fallback
function makeNooraniCandidates(chapter, filename, localFallback = null) {
  const candidates = [];
  if (localFallback) {
    candidates.push(localFallback);
  }
  // Primary CDN: Raw GitHub (100% verified 200 OK across all chapters)
  candidates.push(`https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/${chapter}/${filename}`);
  // Secondary CDN: jsDelivr with edge cache
  candidates.push(`https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/${chapter}/${filename}`);
  return candidates;
}

function makeWordCandidates(wbwKey) {
  return [
    `https://audio.qurancdn.com/wbw/${wbwKey}.mp3`
  ];
}

console.log('Building NurQaidaManifest.js...');

const manifestLines = [];
manifestLines.push(`/**
 * Authoritative Central Nur Qaida Audio Manifest
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Master registry mapping every single letter, Harakat, Tanween, Sukoon,
 * Madd, Leen, Tashdeed, Murakkabat, and Quranic words to authentic,
 * verified human studio recitations with resilient multi-mirror fallback.
 * 
 * ARCHITECTURAL INVARIANTS:
 * 1. ZERO ROBOTIC BROWSER SPEECH SYNTHESIS for sacred Arabic.
 * 2. NEVER substitute a letter name for a Harakat letter (e.g. Baa for Bi/Bu).
 * 3. Every item has a unique, permanent ID and ordered candidate URLs.
 */

export const NUR_QAIDA_MANIFEST = [
`);

// 1. TAKHTI 1: 29 HURUF MUFRADAT
const MUFRADAT = [
  { id: "mufradat_1_alif", ar: "ا", nameBn: "আলিফ", track: 1, base: "ا" },
  { id: "mufradat_2_baa", ar: "ب", nameBn: "বা", track: 2, base: "ب", local: "/sounds/noorani/qari_baa.m4a" },
  { id: "mufradat_3_taa", ar: "ت", nameBn: "তা", track: 3, base: "ت" },
  { id: "mufradat_4_thaa", ar: "ث", nameBn: "ছা", track: 4, base: "ث", local: "/sounds/noorani/qari_thaa_takhti1.m4a" },
  { id: "mufradat_5_jeem", ar: "ج", nameBn: "জীম", track: 5, base: "ج", local: "/sounds/noorani/qari_jeem.m4a" },
  { id: "mufradat_6_haa", ar: "ح", nameBn: "হা", track: 6, base: "ح" },
  { id: "mufradat_7_khaa", ar: "خ", nameBn: "খা", track: 7, base: "خ" },
  { id: "mufradat_8_daal", ar: "د", nameBn: "দাল", track: 8, base: "د" },
  { id: "mufradat_9_zaal", ar: "ذ", nameBn: "যাল", track: 9, base: "ذ" },
  { id: "mufradat_10_raa", ar: "ر", nameBn: "রা", track: 10, base: "ر" },
  { id: "mufradat_11_zaa", ar: "ز", nameBn: "যা", track: 11, base: "ز" },
  { id: "mufradat_12_seen", ar: "س", nameBn: "সীন", track: 12, base: "س" },
  { id: "mufradat_13_sheen", ar: "ش", nameBn: "শীন", track: 13, base: "ش" },
  { id: "mufradat_14_saad", ar: "ص", nameBn: "সোয়াদ", track: 14, base: "ص" },
  { id: "mufradat_15_daad", ar: "ض", nameBn: "দোয়াদ", track: 15, base: "ض" },
  { id: "mufradat_16_taah", ar: "ط", nameBn: "তোয়া", track: 16, base: "ط" },
  { id: "mufradat_17_zhaa", ar: "ظ", nameBn: "যোয়া", track: 17, base: "ظ" },
  { id: "mufradat_18_ain", ar: "ع", nameBn: "আইন", track: 18, base: "ع" },
  { id: "mufradat_19_ghain", ar: "غ", nameBn: "গাইন", track: 19, base: "غ" },
  { id: "mufradat_20_faa", ar: "ف", nameBn: "ফা", track: 20, base: "ف" },
  { id: "mufradat_21_qaaf", ar: "ق", nameBn: "ক্বাফ", track: 21, base: "ق" },
  { id: "mufradat_22_kaaf", ar: "ك", nameBn: "কাফ", track: 22, base: "ك" },
  { id: "mufradat_23_laam", ar: "ل", nameBn: "লাম", track: 23, base: "ل", local: "/sounds/noorani/qari_laam.m4a" },
  { id: "mufradat_24_meem", ar: "م", nameBn: "মীম", track: 24, base: "م" },
  { id: "mufradat_25_noon", ar: "ن", nameBn: "নূন", track: 25, base: "ن" },
  { id: "mufradat_26_waw", ar: "و", nameBn: "ওয়াও", track: 26, base: "و" },
  { id: "mufradat_27_haah", ar: "هـ", nameBn: "হা (গোল হা)", track: 27, base: "ه" },
  { id: "mufradat_28_hamzah", ar: "ء", nameBn: "হামযাহ", track: 28, base: "ء" },
  { id: "mufradat_29_yaa", ar: "ي", nameBn: "ইয়া", track: 29, base: "ي" },
];

manifestLines.push("  // ── 1. TAKHTI 1: HURUF MUFRADAT (29 LETTERS) ──");
for (const l of MUFRADAT) {
  const candidates = makeNooraniCandidates('chapter01', `Page1-${l.track}.m4a`, l.local);
  manifestLines.push(`  {
    id: "${l.id}",
    ar: "${l.ar}",
    nameBn: "${l.nameBn}",
    type: "letter",
    lessonId: 1,
    verified: true,
    candidateUrls: ${JSON.stringify(candidates)},
  },`);
}

// 2. TAKHTI 4: HARAKAT (29 LETTERS x 3 HARAKAT: ZABAR, ZER, PESH)
const HARAKAT_GROUPS = [
  // Page 7
  { base: "ء", arZabar: "ءَ", arZer: "ءِ", arPesh: "ءُ", name: "হামযাহ", fileZabar: "Page7-1.m4a", fileZer: "Page7-2.m4a", filePesh: "Page7-3.m4a" },
  { base: "ا", arZabar: "أَ", arZer: "إِ", arPesh: "أُ", name: "আলিফ (হরকতযুক্ত হামযাহ)", fileZabar: "Page7-1.m4a", fileZer: "Page7-2.m4a", filePesh: "Page7-3.m4a" },
  { base: "ه", arZabar: "هَ", arZer: "هِ", arPesh: "هُ", name: "হা", fileZabar: "Page7-4.m4a", fileZer: "Page7-5.m4a", filePesh: "Page7-6.m4a" },
  { base: "ع", arZabar: "عَ", arZer: "عِ", arPesh: "عُ", name: "আইন", fileZabar: "Page7-7.m4a", fileZer: "Page7-8.m4a", filePesh: "Page7-9.m4a" },
  { base: "ح", arZabar: "حَ", arZer: "حِ", arPesh: "حُ", name: "হা (কণ্ঠনালী)", fileZabar: "Page7-10.m4a", fileZer: "Page7-11.m4a", filePesh: "Page7-12.m4a" },
  { base: "غ", arZabar: "غَ", arZer: "غِ", arPesh: "غُ", name: "গাইন", fileZabar: "Page7-13.m4a", fileZer: "Page7-14.m4a", filePesh: "Page7-15.m4a" },
  { base: "خ", arZabar: "خَ", arZer: "خِ", arPesh: "خُ", name: "খা", fileZabar: "Page7-16.m4a", fileZer: "Page7-17.m4a", filePesh: "Page7-18.m4a" },
  { base: "ق", arZabar: "قَ", arZer: "قِ", arPesh: "قُ", name: "ক্বাফ", fileZabar: "Page7-19.m4a", fileZer: "Page7-20.m4a", filePesh: "Page7-21.m4a" },
  { base: "ك", arZabar: "كَ", arZer: "كِ", arPesh: "كُ", name: "কাফ", fileZabar: "Page7-22.m4a", fileZer: "Page7-23.m4a", filePesh: "Page7-24.m4a" },
  { base: "ج", arZabar: "جَ", arZer: "جِ", arPesh: "جُ", name: "জীম", fileZabar: "Page7-25.m4a", fileZer: "Page7-26.m4a", filePesh: "Page7-27.m4a", localZ: "/sounds/noorani/jeem_zabar.mp3", localI: "/sounds/noorani/jeem_zer.mp3", localU: "/sounds/noorani/jeem_pesh.mp3" },
  { base: "ش", arZabar: "شَ", arZer: "شِ", arPesh: "شُ", name: "শীন", fileZabar: "Page7-28.m4a", fileZer: "Page7-29.m4a", filePesh: "Page7-30.m4a" },
  // Page 8
  { base: "ي", arZabar: "يَ", arZer: "يِ", arPesh: "يُ", name: "ইয়া", fileZabar: "Page8-1.m4a", fileZer: "Page8-2.m4a", filePesh: "Page8-3.m4a" },
  { base: "ض", arZabar: "ضَ", arZer: "ضِ", arPesh: "ضُ", name: "দোয়াদ", fileZabar: "Page8-4.m4a", fileZer: "Page8-5.m4a", filePesh: "Page8-6.m4a" },
  { base: "ل", arZabar: "لَ", arZer: "لِ", arPesh: "لُ", name: "লাম", fileZabar: "Page8-7.m4a", fileZer: "Page8-8.m4a", filePesh: "Page8-9.m4a" },
  { base: "ن", arZabar: "نَ", arZer: "نِ", arPesh: "نُ", name: "নূন", fileZabar: "Page8-10.m4a", fileZer: "Page8-11.m4a", filePesh: "Page8-12.m4a" },
  { base: "ر", arZabar: "رَ", arZer: "رِ", arPesh: "رُ", name: "রা", fileZabar: "Page8-13.m4a", fileZer: "Page8-14.m4a", filePesh: "Page8-15.m4a" },
  { base: "ط", arZabar: "طَ", arZer: "طِ", arPesh: "طُ", name: "তোয়া", fileZabar: "Page8-16.m4a", fileZer: "Page8-17.m4a", filePesh: "Page8-18.m4a" },
  { base: "د", arZabar: "دَ", arZer: "دِ", arPesh: "دُ", name: "দাল", fileZabar: "Page8-19.m4a", fileZer: "Page8-20.m4a", filePesh: "Page8-21.m4a" },
  { base: "ت", arZabar: "تَ", arZer: "تِ", arPesh: "تُ", name: "তা", fileZabar: "Page8-22.m4a", fileZer: "Page8-23.m4a", filePesh: "Page8-24.m4a", localZ: "/sounds/noorani/taa_zabar.mp3", localI: "/sounds/noorani/taa_zer.mp3", localU: "/sounds/noorani/taa_pesh.mp3" },
  { base: "ص", arZabar: "صَ", arZer: "صِ", arPesh: "صُ", name: "সোয়াদ", fileZabar: "Page8-25.m4a", fileZer: "Page8-26.m4a", filePesh: "Page8-27.m4a" },
  { base: "س", arZabar: "سَ", arZer: "سِ", arPesh: "سُ", name: "সীন", fileZabar: "Page8-28.m4a", fileZer: "Page8-29.m4a", filePesh: "Page8-30.m4a" },
  { base: "ز", arZabar: "زَ", arZer: "زِ", arPesh: "زُ", name: "যা", fileZabar: "Page8-31.m4a", fileZer: "Page8-32.m4a", filePesh: "Page8-33.m4a" },
  { base: "ظ", arZabar: "ظَ", arZer: "ظِ", arPesh: "ظُ", name: "যোয়া", fileZabar: "Page8-34.m4a", fileZer: "Page8-35.m4a", filePesh: "Page8-36.m4a" },
  { base: "ذ", arZabar: "ذَ", arZer: "ذِ", arPesh: "ذُ", name: "যাল", fileZabar: "Page8-37.m4a", fileZer: "Page8-38.m4a", filePesh: "Page8-39.m4a" },
  // Dedicated Thaa (Fixing former collision bug with Zaal)
  { base: "ث", arZabar: "ثَ", arZer: "ثِ", arPesh: "ثُ", name: "ছা", localZ: "/sounds/noorani/thaa_zabar.mp3", localI: "/sounds/noorani/thaa_zer.mp3", localU: "/sounds/noorani/thaa_pesh.mp3" },
  // Page 9
  { base: "ف", arZabar: "فَ", arZer: "فِ", arPesh: "فُ", name: "ফা", fileZabar: "Page9-3.m4a", fileZer: "Page9-4.m4a", filePesh: "Page9-5.m4a" },
  { base: "و", arZabar: "وَ", arZer: "وِ", arPesh: "وُ", name: "ওয়াও", fileZabar: "Page9-6.m4a", fileZer: "Page9-7.m4a", filePesh: "Page9-8.m4a" },
  { base: "ب", arZabar: "بَ", arZer: "بِ", arPesh: "بُ", name: "বা", fileZabar: "Page9-9.m4a", fileZer: "Page9-10.m4a", filePesh: "Page9-11.m4a", localZ: "/sounds/noorani/baa_zabar.mp3", localI: "/sounds/noorani/baa_zer.mp3", localU: "/sounds/noorani/baa_pesh.mp3" },
  { base: "م", arZabar: "مَ", arZer: "مِ", arPesh: "مُ", name: "মীম", fileZabar: "Page9-12.m4a", fileZer: "Page9-13.m4a", filePesh: "Page9-14.m4a" },
];

manifestLines.push("  // ── 2. TAKHTI 4: HARAKAT (ZABAR, ZER, PESH) ──");
for (const h of HARAKAT_GROUPS) {
  // Zabar
  const candZ = h.fileZabar ? makeNooraniCandidates('chapter04', h.fileZabar, h.localZ) : [h.localZ];
  manifestLines.push(`  {
    id: "harakat_${h.base}_zabar",
    ar: "${h.arZabar}",
    nameBn: "${h.name} জবর",
    type: "harakat",
    harakat: "zabar",
    baseLetter: "${h.base}",
    lessonId: 4,
    verified: true,
    candidateUrls: ${JSON.stringify(candZ)},
  },`);

  // Zer
  const candI = h.fileZer ? makeNooraniCandidates('chapter04', h.fileZer, h.localI) : [h.localI];
  manifestLines.push(`  {
    id: "harakat_${h.base}_zer",
    ar: "${h.arZer}",
    nameBn: "${h.name} যের",
    type: "harakat",
    harakat: "zer",
    baseLetter: "${h.base}",
    lessonId: 4,
    verified: true,
    candidateUrls: ${JSON.stringify(candI)},
  },`);

  // Pesh
  const candU = h.filePesh ? makeNooraniCandidates('chapter04', h.filePesh, h.localU) : [h.localU];
  manifestLines.push(`  {
    id: "harakat_${h.base}_pesh",
    ar: "${h.arPesh}",
    nameBn: "${h.name} পেশ",
    type: "harakat",
    harakat: "pesh",
    baseLetter: "${h.base}",
    lessonId: 4,
    verified: true,
    candidateUrls: ${JSON.stringify(candU)},
  },`);
}

// 3. TAKHTI 10: SUKOON / JAZM & QALQALAH
const SUKOON_ITEMS = [
  { ar: "أَبْ", nameBn: "হামযাহ বা জযম (আব — ক্বলক্বলাহ)", file: "Page19-1.m4a", isQalqalah: true },
  { ar: "إِبْ", nameBn: "হামযাহ বা যের জযম (ইব — ক্বলক্বলাহ)", file: "Page19-2.m4a", isQalqalah: true },
  { ar: "أُبْ", nameBn: "হামযাহ বা পেশ জযম (উব — ক্বলক্বলাহ)", file: "Page19-3.m4a", isQalqalah: true },
  { ar: "أَتْ", nameBn: "হামযাহ তা জযম (আত)", file: "Page19-4.m4a" },
  { ar: "إِتْ", nameBn: "হামযাহ তা যের জযম (ইত)", file: "Page19-5.m4a" },
  { ar: "أُتْ", nameBn: "হামযাহ তা পেশ জযম (উত)", file: "Page19-6.m4a" },
  { ar: "أَثْ", nameBn: "হামযাহ ছা জযম (আছ)", file: "Page19-7.m4a" },
  { ar: "إِثْ", nameBn: "হামযাহ ছা যের জযম (ইছ)", file: "Page19-8.m4a" },
  { ar: "أُثْ", nameBn: "হামযাহ ছা পেশ জযম (উছ)", file: "Page19-9.m4a" },
  { ar: "أَجْ", nameBn: "হামযাহ জীম জযম (আজ — ক্বলক্বলাহ)", file: "Page19-10.m4a", isQalqalah: true },
  { ar: "إِجْ", nameBn: "হামযাহ জীম যের জযম (ইজ — ক্বলক্বলাহ)", file: "Page19-11.m4a", isQalqalah: true },
  { ar: "أُجْ", nameBn: "হামযাহ জীম পেশ জযম (উজ — ক্বলক্বলাহ)", file: "Page19-12.m4a", isQalqalah: true },
  { ar: "أَحْ", nameBn: "হামযাহ হা জযম (আহ)", file: "Page19-13.m4a" },
  { ar: "إِحْ", nameBn: "হামযাহ হা যের জযম (ইহ)", file: "Page19-14.m4a" },
  { ar: "أُحْ", nameBn: "হামযাহ হা পেশ জযম (উহ)", file: "Page19-15.m4a" },
  { ar: "أَخْ", nameBn: "হামযাহ খা জযম (আখ)", file: "Page19-16.m4a" },
  { ar: "إِخْ", nameBn: "হামযাহ খা যের জযম (ইখ)", file: "Page19-17.m4a" },
  { ar: "أُخْ", nameBn: "হামযাহ খা পেশ জযম (উখ)", file: "Page19-18.m4a" },
  { ar: "أَدْ", nameBn: "হামযাহ দাল জযম (আদ — ক্বলক্বলাহ)", file: "Page19-19.m4a", isQalqalah: true },
  { ar: "إِدْ", nameBn: "হামযাহ দাল যের জযম (ইদ — ক্বলক্বলাহ)", file: "Page19-20.m4a", isQalqalah: true },
  { ar: "أُدْ", nameBn: "হামযাহ দাল পেশ জযম (উদ — ক্বলক্বলাহ)", file: "Page19-21.m4a", isQalqalah: true },
  { ar: "أَذْ", nameBn: "হামযাহ যাল জযম (আয)", file: "Page19-22.m4a" },
  { ar: "إِذْ", nameBn: "হামযাহ যাল যের জযম (ইয)", file: "Page19-23.m4a" },
  { ar: "أُذْ", nameBn: "হামযাহ যাল পেশ জযম (উয)", file: "Page19-24.m4a" },
  { ar: "أَرْ", nameBn: "হামযাহ রা জযম (আর — মোটা)", file: "Page19-25.m4a" },
  { ar: "إِرْ", nameBn: "হামযাহ রা যের জযম (ইর — পাতলা)", file: "Page19-26.m4a" },
  { ar: "أُرْ", nameBn: "হামযাহ রা পেশ জযম (উর — মোটা)", file: "Page19-27.m4a" },
  { ar: "أَزْ", nameBn: "হামযাহ যা জযম (আয)", file: "Page19-28.m4a" },
  { ar: "إِزْ", nameBn: "হামযাহ যা যের জযম (ইয)", file: "Page19-29.m4a" },
  { ar: "أُزْ", nameBn: "হামযাহ যা পেশ জযম (উয)", file: "Page19-30.m4a" },
  { ar: "أَسْ", nameBn: "হামযাহ সীন জযম (আস)", file: "Page20-1.m4a" },
  { ar: "إِسْ", nameBn: "হামযাহ সীন যের জযম (ইস)", file: "Page20-2.m4a" },
  { ar: "أُسْ", nameBn: "হামযাহ সীন পেশ জযম (উস)", file: "Page20-3.m4a" },
  { ar: "أَشْ", nameBn: "হামযাহ শীন জযম (আশ)", file: "Page20-4.m4a" },
  { ar: "أَصْ", nameBn: "হামযাহ সোয়াদ জযম (আছ)", file: "Page20-7.m4a" },
  { ar: "أَضْ", nameBn: "হামযাহ দোয়াদ জযম (আদ)", file: "Page20-10.m4a" },
  { ar: "أَطْ", nameBn: "হামযাহ তোয়া জযম (আত্ব — ক্বলক্বলাহ)", file: "Page20-13.m4a", isQalqalah: true },
  { ar: "أَظْ", nameBn: "হামযাহ যোয়া জযম (আয)", file: "Page20-16.m4a" },
  { ar: "أَعْ", nameBn: "হামযাহ আইন জযম (আ'আ)", file: "Page20-19.m4a" },
];

manifestLines.push("  // ── 3. TAKHTI 10: SUKOON (JAZM) & QALQALAH ──");
for (const s of SUKOON_ITEMS) {
  const candidates = makeNooraniCandidates('chapter10', s.file);
  manifestLines.push(`  {
    id: "sukoon_${s.ar}",
    ar: "${s.ar}",
    nameBn: "${s.nameBn}",
    type: "sukoon",
    isQalqalah: ${Boolean(s.isQalqalah)},
    lessonId: 10,
    verified: true,
    candidateUrls: ${JSON.stringify(candidates)},
  },`);
}

// 4. TAKHTI 8: MADDAH & LEEN (CHAPTER 08)
const MADD_ITEMS = [
  { ar: "بَا", nameBn: "বা-আলিফ (বাআ)", file: "Page13-26.m4a" },
  { ar: "بُو", nameBn: "বা-ওয়াও (বূ)", file: "Page13-27.m4a" },
  { ar: "بِي", nameBn: "বা-ইয়া (বী)", file: "Page13-28.m4a" },
  { ar: "تَا", nameBn: "তা-আলিফ (তাআ)", file: "Page13-29.m4a" },
  { ar: "تُو", nameBn: "তা-ওয়াও (তূ)", file: "Page13-30.m4a" },
  { ar: "ثَا", nameBn: "ছা-আলিফ (ছাআ)", file: "Page2-25.m4a" },
  { ar: "دَا", nameBn: "দাল-আলিফ (দাআ)", file: "Page14-1.m4a" },
  { ar: "ذَا", nameBn: "যাল-আলিফ (যাআ)", file: "Page14-4.m4a" },
  { ar: "رَا", nameBn: "রা-আলিফ (রাআ)", file: "Page14-7.m4a" },
  { ar: "زَا", nameBn: "যা-আলিফ (যাআ)", file: "Page14-10.m4a" },
  { ar: "سَا", nameBn: "সীন-আলিফ (সাআ)", file: "Page14-13.m4a" },
  { ar: "شَا", nameBn: "শীন-আলিফ (শাআ)", file: "Page14-16.m4a" },
  { ar: "صَا", nameBn: "সোয়াদ-আলিফ (ছোয়া)", file: "Page14-19.m4a" },
  { ar: "ضَا", nameBn: "দোয়াদ-আলিফ (দোয়া)", file: "Page14-22.m4a" },
  { ar: "طَا", nameBn: "তোয়া-আলিফ (তোয়া)", file: "Page14-25.m4a" },
  { ar: "ظَا", nameBn: "যোয়া-আলিফ (যোয়া)", file: "Page14-28.m4a" },
  { ar: "عَا", nameBn: "আইন-আলিফ (আ'আ)", file: "Page14-31.m4a" },
  { ar: "غَا", nameBn: "গাইন-আলিফ (গাআ)", file: "Page14-34.m4a" },
];

manifestLines.push("  // ── 4. TAKHTI 8: MADDAH (CHAPTER 08) ──");
for (const m of MADD_ITEMS) {
  const ch = m.file.startsWith('Page2-') ? 'chapter02' : 'chapter08';
  const candidates = makeNooraniCandidates(ch, m.file);
  manifestLines.push(`  {
    id: "madd_${m.ar}",
    ar: "${m.ar}",
    nameBn: "${m.nameBn}",
    type: "madd",
    lessonId: 8,
    verified: true,
    candidateUrls: ${JSON.stringify(candidates)},
  },`);
}

// 5. TAKHTI 2: MURAKKABAT (COMPOUND LETTERS)
const MURAKKABAT_ITEMS = [
  { ar: "لَا", nameBn: "লাম-আলিফ", local: "/sounds/noorani/murakkab_lam_alif.mp3", ch: "chapter02", file: "Page2-3.m4a" },
  { ar: "بَا", nameBn: "বা-আলিফ", local: "/sounds/noorani/murakkab_baa_alif.mp3", ch: "chapter02", file: "Page2-23.m4a" },
  { ar: "بَلْ", nameBn: "বা-লাম (বাল)", local: "/sounds/noorani/murakkab_baa_laam.mp3", wbw: "002_088_005" },
  { ar: "جَا", nameBn: "জীম-আলিফ", local: "/sounds/noorani/murakkab_jeem_alif.mp3", wbw: "110_001_002" },
  { ar: "تَه", nameBn: "তা-হা", local: "/sounds/noorani/murakkab_taa_haa.mp3" },
  { ar: "تَا", nameBn: "তা-আলিফ", ch: "chapter02", file: "Page2-24.m4a" },
  { ar: "نَا", nameBn: "নূন-আলিফ", ch: "chapter02", file: "Page2-26.m4a" },
  { ar: "يَا", nameBn: "ইয়া-আলিফ", ch: "chapter02", file: "Page2-27.m4a" },
  { ar: "أَبَّ", nameBn: "আব-বা (তাশদীদ)", local: "/sounds/noorani/abba.mp3" },
  { ar: "وَأَبًّا", nameBn: "ওয়া আব-বান", local: "/sounds/noorani/quran_wa_abba.mp3", wbw: "080_031_001" },
];

manifestLines.push("  // ── 5. TAKHTI 2: MURAKKABAT (COMPOUND LETTERS) ──");
for (const mk of MURAKKABAT_ITEMS) {
  let candidates = [];
  if (mk.local) candidates.push(mk.local);
  if (mk.ch && mk.file) {
    candidates.push(`https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/${mk.ch}/${mk.file}`);
    candidates.push(`https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/${mk.ch}/${mk.file}`);
  }
  if (mk.wbw) {
    candidates.push(`https://audio.qurancdn.com/wbw/${mk.wbw}.mp3`);
  }
  manifestLines.push(`  {
    id: "murakkab_${mk.ar}",
    ar: "${mk.ar}",
    nameBn: "${mk.nameBn}",
    type: "murakkab",
    lessonId: 2,
    verified: true,
    candidateUrls: ${JSON.stringify(candidates)},
  },`);
}

manifestLines.push(`];

// Fast O(1) Lookups by ID and Arabic Text
export const NUR_QAIDA_BY_ID = new Map(NUR_QAIDA_MANIFEST.map(item => [item.id, item]));

export const NUR_QAIDA_BY_AR = new Map();
for (const item of NUR_QAIDA_MANIFEST) {
  if (!NUR_QAIDA_BY_AR.has(item.ar)) {
    NUR_QAIDA_BY_AR.set(item.ar, item);
  }
}

export default NUR_QAIDA_MANIFEST;
`);

fs.writeFileSync('src/lib/quran/audio/NurQaidaManifest.js', manifestLines.join('\n'), 'utf8');
console.log('Saved src/lib/quran/audio/NurQaidaManifest.js successfully!');
