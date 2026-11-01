import test from "node:test";
import assert from "node:assert/strict";

// Sifat Curriculum
import {
  OPPOSITE_SIFAT_PAIRS,
  NON_OPPOSITE_SIFAT,
  LETTER_SIFAT_MAP,
  SIFAT_QUIZ_QUESTIONS,
  SIFAT_COUNT_PEDAGOGY,
} from "../src/features/ai-learning/data/sifatCurriculum.js";

// Tajweed Curriculum
import {
  TAJWEED_CURRICULUM,
  MADD_MEASUREMENT_STANDARDS,
} from "../src/features/ai-learning/data/tajweedLearningCurriculum.js";

// Comparative Makhraj Pairs & Makhraj Zones
import { COMPARATIVE_PAIRS } from "../src/features/ai/components/makhraj/makhrajComparativeData.js";
import { MAKHRAJ_ZONES } from "../src/features/ai/components/makhraj/makhrajZonesData.js";

// Expanded Game Data
import {
  KIDS_DOT_GAME_LEVELS,
  KIDS_HARAKAT_GAME_LEVELS,
  KIDS_SOUND_DETECTIVE_LEVELS,
  KIDS_MEMORY_GAME_LEVELS,
  KIDS_ARABIC_LETTERS,
} from "../src/features/ai-learning/data/kidsGameData.js";

import { DRAG_DROP_LEVELS } from "../src/features/ai-learning/data/dragDropGameData.js";

test("1. Sifat al-Huruf: 10 Opposite Sifat (5 Pairs) Verification", () => {
  assert.equal(OPPOSITE_SIFAT_PAIRS.length, 5, "Must have exactly 5 opposite Sifat pairs");

  // Pair 1: Hams vs Jahr
  const p1 = OPPOSITE_SIFAT_PAIRS[0];
  assert.equal(p1.sifatA.nameBn, "হামস");
  assert.equal(p1.sifatA.letters.length, 10, "Hams must have 10 letters (فحثه شخص سكت)");
  assert.equal(p1.sifatB.nameBn, "জাহর");
  assert.equal(p1.sifatB.letters.length, 19, "Jahr must have remaining 19 letters");

  // Pair 2: Shiddah vs Rikhwah vs Tawassut
  const p2 = OPPOSITE_SIFAT_PAIRS[1];
  assert.equal(p2.sifatA.nameBn, "শিদ্দাহ");
  assert.equal(p2.sifatA.letters.length, 8, "Shiddah must have 8 letters (أجد قط بكت)");
  assert.equal(p2.sifatMiddle.nameBn, "তাওয়াসসুত / বাইনিয়্যাহ");
  assert.equal(p2.sifatMiddle.letters.length, 5, "Tawassut must have 5 letters (لن عمر)");
  assert.equal(p2.sifatB.nameBn, "রিখওয়াহ");
  assert.equal(p2.sifatB.letters.length, 16, "Rikhwah must have remaining 16 letters");

  // Pair 3: Isti'la vs Istifal
  const p3 = OPPOSITE_SIFAT_PAIRS[2];
  assert.equal(p3.sifatA.nameBn, "ইস্তি'লা (তাফখীম/মোটা হরফ)");
  assert.equal(p3.sifatA.letters.length, 7, "Isti'la must have 7 letters (خص ضغط قظ)");
  assert.equal(p3.sifatB.nameBn, "ইস্তিফাল (তারক্বীক্ব/পাতলা হরফ)");
  assert.equal(p3.sifatB.letters.length, 22, "Istifal must have remaining 22 letters");

  // Pair 4: Itbaq vs Infitah
  const p4 = OPPOSITE_SIFAT_PAIRS[3];
  assert.equal(p4.sifatA.nameBn, "ইতবাক্ব (চাপা বা বেষ্টিত)");
  assert.equal(p4.sifatA.letters.length, 4, "Itbaq must have 4 letters (ص ض ط ظ)");
  assert.equal(p4.sifatB.nameBn, "ইনফিতাহ (উন্মুক্ত বা ফাঁকা)");
  assert.equal(p4.sifatB.letters.length, 25, "Infitah must have remaining 25 letters");

  // Pair 5: Idhlaq vs Ismat
  const p5 = OPPOSITE_SIFAT_PAIRS[4];
  assert.equal(p5.sifatA.nameBn, "ইযলাক্ব");
  assert.equal(p5.sifatA.letters.length, 6, "Idhlaq must have 6 letters (فر من لب)");
  assert.equal(p5.sifatB.nameBn, "ইসমাত");
  assert.equal(p5.sifatB.letters.length, 23, "Ismat must have remaining 23 letters");
});

test("2. Sifat al-Huruf: 8 Non-Opposite Sifat Verification", () => {
  assert.equal(NON_OPPOSITE_SIFAT.length, 8, "Must have exactly 8 non-opposite Sifat");

  const sifatMap = {};
  NON_OPPOSITE_SIFAT.forEach((s) => {
    sifatMap[s.id] = s;
  });

  assert.ok(sifatMap.safeer, "Safeer must be present (ص، ز، س)");
  assert.equal(sifatMap.safeer.letters.length, 3);

  assert.ok(sifatMap.qalqalah, "Qalqalah must be present (ق، ط، ب، ج، د)");
  assert.equal(sifatMap.qalqalah.letters.length, 5);

  assert.ok(sifatMap.leen, "Leen must be present (و، ي)");
  assert.equal(sifatMap.leen.letters.length, 2);

  assert.ok(sifatMap.inhiraf, "Inhiraf must be present (ل، ر)");
  assert.equal(sifatMap.inhiraf.letters.length, 2);

  assert.ok(sifatMap.takreer, "Takreer must be present (ر)");
  assert.equal(sifatMap.takreer.letters.length, 1);

  assert.ok(sifatMap.tafashshi, "Tafashshi must be present (ش)");
  assert.equal(sifatMap.tafashshi.letters.length, 1);

  assert.ok(sifatMap.istitālah, "Istitālah must be present (ض)");
  assert.equal(sifatMap.istitālah.letters.length, 1);

  assert.ok(sifatMap.ghunnah, "Ghunnah must be present (ن، م)");
  assert.equal(sifatMap.ghunnah.letters.length, 2);
});

test("3. Sifat al-Huruf: Complete 29 Arabic Letters Sifat Matrix", () => {
  assert.equal(Object.keys(LETTER_SIFAT_MAP).length, 29, "Must map all 29 Arabic letters");

  KIDS_ARABIC_LETTERS.forEach((l) => {
    const s = LETTER_SIFAT_MAP[l.ar];
    assert.ok(s, `Letter ${l.ar} must have Sifat mapping`);
    assert.ok(s.sifatList.length >= 5, `Letter ${l.ar} must have at least 5 Sifat`);
    assert.ok(s.dominantSifatBn, `Letter ${l.ar} must have dominant Sifat explanation`);
  });

  // Verify unique letter traits
  assert.equal(LETTER_SIFAT_MAP["ر"].sifatCount, 7, "Ra must have 7 sifat (highest)");
  assert.ok(LETTER_SIFAT_MAP["ض"].sifatList.includes("ইস্তিতালাহ"), "Daad must have Istitālah");
  assert.ok(LETTER_SIFAT_MAP["ط"].sifatList.includes("ক্বলক্বলাহ"), "Taa must have Qalqalah");
  assert.ok(LETTER_SIFAT_MAP["ن"].sifatList.includes("গুন্নাহ"), "Noon must have Ghunnah");
});

test("4. Authentic Tajweed Curriculum: 8 Core Disciplines", () => {
  assert.equal(TAJWEED_CURRICULUM.length, 8, "Must cover exactly 8 core Tajweed subjects");

  const [noon, meem, ghunnah, madd, qalqalah, lam, raa, waqf] = TAJWEED_CURRICULUM;

  // 1. Noon Saakin & Tanween (4 rules)
  assert.equal(noon.id, "noon-saakin-tanween");
  assert.equal(noon.rules.length, 5, "Must cover Izhar, Idgham Maal, Idgham Bighair, Iqlab, Ikhfa");

  // 2. Meem Saakin (3 rules)
  assert.equal(meem.id, "meem-saakin");
  assert.equal(meem.rules.length, 3, "Must cover Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi");

  // 3. Ghunnah Wajibah
  assert.equal(ghunnah.id, "ghunnah-wajibah");
  assert.equal(ghunnah.rules.length, 2, "Must cover Noon Mushaddad and Meem Mushaddad");

  // 4. Madd (6 types)
  assert.equal(madd.id, "madd-types");
  assert.ok(madd.rules.length >= 5, "Must cover Asli, Muttasil, Munfasil, Lazim, Arid, Leen");

  // 5. Qalqalah (3 levels)
  assert.equal(qalqalah.id, "qalqalah-levels");
  assert.equal(qalqalah.rules.length, 3, "Must cover Akbar, Kubra, and Sughra");

  // 6. Lam Shamsiyyah & Qamariyyah
  assert.equal(lam.id, "lam-shamsiyyah-qamariyyah");
  assert.equal(lam.rules.length, 2, "Must cover Lam Qamariyyah and Lam Shamsiyyah");

  // 7. Raa Tafkhim & Tarqeeq
  assert.equal(raa.id, "raa-rules");
  assert.equal(raa.rules.length, 2, "Must cover Tafkhim and Tarqeeq");

  // 8. Waqf & Ibtida
  assert.equal(waqf.id, "waqf-ibtida");
  assert.ok(waqf.rules.length >= 5, "Must cover canonical stop signs (مـ, لا, قلى, صلى, ج)");
});

test("5. Comparative Makhraj Letter Pairs (6 Critical Pairs)", () => {
  assert.equal(COMPARATIVE_PAIRS.length, 6, "Must cover 6 critical similar pairs");

  const pairIds = COMPARATIVE_PAIRS.map((p) => p.id);
  assert.ok(pairIds.includes("haa-haah"), "Must cover ح vs هـ");
  assert.ok(pairIds.includes("qaaf-kaaf"), "Must cover ق vs ك");
  assert.ok(pairIds.includes("taa-taa-heavy"), "Must cover ط vs ت");
  assert.ok(pairIds.includes("saad-seen"), "Must cover ص vs س");
  assert.ok(pairIds.includes("daad-daal-zhaa"), "Must cover ض vs د vs ظ");
  assert.ok(pairIds.includes("ain-hamzah"), "Must cover ع vs ء");

  COMPARATIVE_PAIRS.forEach((p) => {
    assert.ok(p.title, "Pair must have title");
    assert.ok(p.letters.length >= 2, "Pair must have at least 2 contrasting letters");
    p.letters.forEach((l) => {
      assert.ok(l.organBn, "Letter must have articulation organ");
      assert.ok(l.commonMistake, "Letter must describe common mistake");
      assert.ok(l.sampleWord, "Letter must have sample word");
      assert.ok(l.audioAyah?.surah && l.audioAyah?.ayah, "Letter must have Quranic audio benchmark");
    });
  });
});

test("6. Expanded Game Content: Levels & Curricular Breadth", () => {
  // Dot Count: 6 Levels
  assert.equal(KIDS_DOT_GAME_LEVELS.length, 6, "Dot Count Game must have 6 progressive levels");
  assert.ok(KIDS_DOT_GAME_LEVELS[5].positionalDistinction, "Level 6 must test positional distinction");

  // Harakat Master: 9 Levels
  assert.equal(KIDS_HARAKAT_GAME_LEVELS.length, 9, "Harakat Master Game must have 9 levels");
  assert.ok(KIDS_HARAKAT_GAME_LEVELS[6].jazm, "Level 7 must test Sukoon/Jazm");
  assert.ok(KIDS_HARAKAT_GAME_LEVELS[7].tashdeed, "Level 8 must test Tashdeed & Ghunnah");
  assert.ok(KIDS_HARAKAT_GAME_LEVELS[8].madd, "Level 9 must test Madd words");

  // Sound Detective: 7 Levels
  assert.equal(KIDS_SOUND_DETECTIVE_LEVELS.length, 7, "Sound Detective Game must have 7 levels");
  assert.ok(KIDS_SOUND_DETECTIVE_LEVELS[5].sifatPool, "Level 6 must test Sifat detection");
  assert.ok(KIDS_SOUND_DETECTIVE_LEVELS[6].tajweedPool, "Level 7 must test Tajweed rule recognition");

  // Memory Match: 7 Levels
  assert.equal(KIDS_MEMORY_GAME_LEVELS.length, 7, "Memory Match Game must have 7 levels");

  // Drag & Drop: 14 Levels
  assert.equal(DRAG_DROP_LEVELS.length, 14, "Drag Drop Game must have 14 curated levels");
  assert.ok(DRAG_DROP_LEVELS[10].letters.length > 0, "Level 11 Sukoon must have letters");
  assert.ok(DRAG_DROP_LEVELS[11].letters.length > 0, "Level 12 Tashdeed must have letters");
  assert.ok(DRAG_DROP_LEVELS[12].letters.length > 0, "Level 13 Tanween must have letters");
  assert.ok(DRAG_DROP_LEVELS[13].letters.length > 0, "Level 14 Ampara must have letters");
});

test("7. Classical Makharij: 5 Primary Organs & Exactly 17 Detailed Articulation Points", () => {
  assert.equal(MAKHRAJ_ZONES.length, 5, "Must have exactly 5 primary articulation zones");

  const zoneMap = {};
  let totalSubzones = 0;
  MAKHRAJ_ZONES.forEach((z) => {
    zoneMap[z.id] = z;
    totalSubzones += z.subZones.length;
  });

  // 1. Al-Halq (Throat): 3 articulation points
  assert.equal(zoneMap.halq?.subZones.length, 3, "Halq must have 3 subzones (Aqsa, Wasat, Adna)");

  // 2. Al-Lisan (Tongue): 10 articulation points
  assert.equal(zoneMap.lisan?.subZones.length, 10, "Lisan must have exactly 10 articulation subzones (Ibn al-Jazari)");

  // 3. Ash-Shafatan (Lips): 2 articulation points
  assert.equal(zoneMap.shafatan?.subZones.length, 2, "Shafatan must have 2 subzones (Fa, and Baa/Meem/Waw)");

  // 4. Al-Khayshum (Nose): 1 articulation point
  assert.equal(zoneMap.khayshum?.subZones.length, 1, "Khayshum must have 1 subzone (Ghunnah)");

  // 5. Al-Jawf (Oral Cavity): 1 articulation point
  assert.equal(zoneMap.jawf?.subZones.length, 1, "Jawf must have 1 subzone (Madd letters)");

  // Grand total must equal 17
  assert.equal(totalSubzones, 17, "Total classical articulation points must equal 17 (3 + 10 + 2 + 1 + 1)");
});

test("8. Sifat Counting Pedagogy: 17 (Classical) vs 18 (Jumhur) Scholarly Clarification", () => {
  assert.ok(SIFAT_COUNT_PEDAGOGY, "Must export pedagogical clarification metadata");
  assert.equal(SIFAT_COUNT_PEDAGOGY.jazariCount, 17, "Ibn al-Jazari classical count must be 17");
  assert.equal(SIFAT_COUNT_PEDAGOGY.jumhurCount, 18, "Jumhur/modern count must be 18 (including Ghunnah)");
  assert.ok(SIFAT_COUNT_PEDAGOGY.comparison.length >= 2, "Must include comparative scholarly breakdown");
});

test("9. Madd Measurement Consistency: 1 Alif = 2 Harakat strictly", () => {
  assert.equal(MADD_MEASUREMENT_STANDARDS.oneAlifInHarakats, 2, "1 Alif must equal exactly 2 Harakats");

  const maddCategory = TAJWEED_CURRICULUM.find((c) => c.id === "madd-types");
  assert.ok(maddCategory, "Madd category must exist");

  const asli = maddCategory.rules.find((r) => r.id === "madd-asli");
  assert.ok(asli.nameBn.includes("১ আলিফ = ২ হরকত") || asli.definitionBn.includes("১ আলিফ (২ হরকত)"));

  const lazim = maddCategory.rules.find((r) => r.id === "madd-lazim");
  assert.ok(lazim.nameBn.includes("৬ হরকত = ৩ আলিফ"), "Madd Lazim must state 6 Harakat = 3 Alifs");
  assert.ok(!lazim.nameBn.includes("৪ আলিফ"), "Madd Lazim must NOT say 4 Alifs");
  assert.ok(!lazim.definitionBn.includes("৪ আলিফ"), "Madd Lazim definition must NOT say 4 Alifs");
});

test("10. Waqf & Ibtida Suite: All 9 Canonical Quranic Stop Signs", () => {
  const waqfCategory = TAJWEED_CURRICULUM.find((c) => c.id === "waqf-ibtida");
  assert.ok(waqfCategory, "Waqf category must exist");
  assert.equal(waqfCategory.rules.length, 9, "Must include all 9 canonical stop signs");

  const ruleIds = waqfCategory.rules.map((r) => r.id);
  assert.ok(ruleIds.includes("waqf-lazim"), "Must include مـ (Waqf Lazim)");
  assert.ok(ruleIds.includes("waqf-mamnu"), "Must include لا (Waqf Mamnu)");
  assert.ok(ruleIds.includes("waqf-qula"), "Must include قلى (Al-Waqfu Awla)");
  assert.ok(ruleIds.includes("waqf-sila"), "Must include صلى (Al-Waslu Awla)");
  assert.ok(ruleIds.includes("waqf-jaiz"), "Must include ج (Waqf Jaiz)");
  assert.ok(ruleIds.includes("waqf-mutlaq"), "Must include ط (Waqf Mutlaq)");
  assert.ok(ruleIds.includes("waqf-mujawwaz"), "Must include ز (Waqf Mujawwaz)");
  assert.ok(ruleIds.includes("waqf-murakhkhas"), "Must include ص (Waqf Murakhkhas)");
  assert.ok(ruleIds.includes("waqf-muanaqah"), "Must include ∴ ... ∴ (Mu'anaqah)");
});

