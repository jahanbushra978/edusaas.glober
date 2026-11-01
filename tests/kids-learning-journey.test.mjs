/**
 * Automated Verification Test Suite for Kids Learning Journey & Educational Games
 * Rahmania Institute / Nur AI Quran Learning Platform
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  KIDS_ARABIC_LETTERS,
  KIDS_CURRICULUM_STAGES,
  KIDS_DOT_GAME_LEVELS,
  KIDS_HARAKAT_GAME_LEVELS,
  KIDS_SOUND_DETECTIVE_LEVELS,
  KIDS_MEMORY_GAME_LEVELS,
  KIDS_TRACING_GROUPS,
  KIDS_TASHDEED_DATA,
  KIDS_MADD_DATA,
  KIDS_BADGES,
  KIDS_SURAHS_DATA,
  NUQTA_CATEGORIES,
  DOT_POSITIONS_SUMMARY,
  ALIF_HAMZAH_DISTINCTION,
} from "../src/features/ai-learning/data/kidsGameData.js";

import {
  NOORANI_QAIDA_17_TAKHTIS,
  NOORANI_QAIDA_MODULES,
} from "../src/features/ai-learning/data/nooraniQaidaCurriculum.js";

import { AMPARA_JUZ_30_SURAHS } from "../src/features/ai-learning/data/amparaCurriculum.js";
import { LETTER_WAYPOINTS } from "../src/features/ai-learning/data/letterWaypoints.js";
import {
  submitRecitationForReview,
  getStoredSubmissions,
} from "../src/features/ai-learning/lib/recitationReviewBridge.js";

test("1. Comprehensive Maktab Curriculum Stages (Zero to Quran Reading)", () => {
  assert.equal(KIDS_CURRICULUM_STAGES.length, 8, "Must have all 8 complete maktab curriculum stages");

  const expectedStages = [
    "stage-huruf",
    "stage-murakkabat",
    "stage-harakat",
    "stage-tanween",
    "stage-qalqalah",
    "stage-tashdeed",
    "stage-madd",
    "stage-surahs",
  ];

  KIDS_CURRICULUM_STAGES.forEach((stg, i) => {
    assert.equal(stg.id, expectedStages[i], `Stage ${i + 1} must match id ${expectedStages[i]}`);
    assert.ok(stg.titleBn, `Stage ${stg.id} must have Bengali title`);
    assert.ok(stg.desc, `Stage ${stg.id} must have educational description`);
    assert.ok(stg.itemCount > 0, `Stage ${stg.id} must have item count > 0`);
  });

  // Verify progression stars are monotonically increasing
  for (let i = 1; i < KIDS_CURRICULUM_STAGES.length; i++) {
    assert.ok(
      KIDS_CURRICULUM_STAGES[i].minStarsToUnlock > KIDS_CURRICULUM_STAGES[i - 1].minStarsToUnlock,
      `Stage ${KIDS_CURRICULUM_STAGES[i].id} minStarsToUnlock must be greater than previous stage`
    );
  }
});

test("2. Dot Count Game (Progressive Levels)", () => {
  assert.ok(KIDS_DOT_GAME_LEVELS.length >= 5, "Dot Count Game must have at least 5 progressive levels");

  assert.equal(KIDS_DOT_GAME_LEVELS[0].targetDots, 0, "Level 1 must be dotless letters (0 dots)");
  assert.equal(KIDS_DOT_GAME_LEVELS[1].targetDots, 1, "Level 2 must be 1-dot letters");
  assert.equal(KIDS_DOT_GAME_LEVELS[2].targetDots, 2, "Level 3 must be 2-dot letters");
  assert.equal(KIDS_DOT_GAME_LEVELS[3].targetDots, 3, "Level 4 must be 3-dot letters");
  assert.equal(KIDS_DOT_GAME_LEVELS[4].mixed, true, "Level 5 must be mixed champion challenge");

  KIDS_DOT_GAME_LEVELS.forEach((lvl) => {
    assert.ok(lvl.title, `Level ${lvl.id} must have a title`);
    assert.ok(lvl.instructionBn, `Level ${lvl.id} must have age-appropriate instructions`);
    assert.ok(lvl.tipBn, `Level ${lvl.id} must have an educational tip`);
  });
});

test("3. Harakat Master Game (Progressive Levels)", () => {
  assert.ok(KIDS_HARAKAT_GAME_LEVELS.length >= 6, "Harakat Master must have at least 6 progressive levels");

  assert.equal(KIDS_HARAKAT_GAME_LEVELS[0].harakat, "যবর", "Level 1 must be Fathah (যবর)");
  assert.equal(KIDS_HARAKAT_GAME_LEVELS[1].harakat, "যের", "Level 2 must be Kasrah (যের)");
  assert.equal(KIDS_HARAKAT_GAME_LEVELS[2].harakat, "পেশ", "Level 3 must be Dammah (পেশ)");
  assert.equal(KIDS_HARAKAT_GAME_LEVELS[3].mixed, true, "Level 4 must be Mixed Trio Challenge");
  assert.equal(KIDS_HARAKAT_GAME_LEVELS[4].tanween, true, "Level 5 must be Tanween Drill");
  assert.equal(KIDS_HARAKAT_GAME_LEVELS[5].words, true, "Level 6 must be 3-Letter Word Reading");

  KIDS_HARAKAT_GAME_LEVELS.forEach((lvl) => {
    assert.ok(lvl.title, `Level ${lvl.id} must have title`);
    assert.ok(lvl.instructionBn, `Level ${lvl.id} must have instruction`);
    if (lvl.items) {
      assert.ok(lvl.items.length >= 3, `Level ${lvl.id} must have at least 3 items`);
    }
  });
});

test("4. Sound Detective Game (Progressive Levels)", () => {
  assert.ok(KIDS_SOUND_DETECTIVE_LEVELS.length >= 5, "Sound Detective must have at least 5 progressive levels");

  assert.ok(KIDS_SOUND_DETECTIVE_LEVELS[0].letters.length >= 5, "Level 1 must have clear letters");
  assert.ok(KIDS_SOUND_DETECTIVE_LEVELS[1].similarPairs.length >= 5, "Level 2 must have similar articulation pairs");
  assert.equal(KIDS_SOUND_DETECTIVE_LEVELS[2].harakatPool, true, "Level 3 must test Harakat sounds");
  assert.equal(KIDS_SOUND_DETECTIVE_LEVELS[3].qalqalahPool, true, "Level 4 must test Qalqalah sounds");
  assert.equal(KIDS_SOUND_DETECTIVE_LEVELS[4].wordPool, true, "Level 5 must test Master words");
});

test("5. Memory Match Game (Progressive Levels)", () => {
  assert.ok(KIDS_MEMORY_GAME_LEVELS.length >= 5, "Memory Match must have at least 5 progressive levels");

  assert.equal(KIDS_MEMORY_GAME_LEVELS[0].pairsCount, 2, "Level 1 must have 2 pairs (4 cards)");
  assert.equal(KIDS_MEMORY_GAME_LEVELS[1].pairsCount, 3, "Level 2 must have 3 pairs (6 cards)");
  assert.equal(KIDS_MEMORY_GAME_LEVELS[2].pairsCount, 4, "Level 3 must have 4 pairs (8 cards)");
  assert.equal(KIDS_MEMORY_GAME_LEVELS[3].pairsCount, 4, "Level 4 must have 4 pairs (8 cards)");
  assert.equal(KIDS_MEMORY_GAME_LEVELS[4].pairsCount, 6, "Level 5 must have 6 pairs (12 cards)");
});

test("6. Finger Tracing Groups (Complete 29 Letters Coverage)", () => {
  assert.equal(KIDS_TRACING_GROUPS.length, 4, "Finger Tracing must have 4 letter groups");

  const allTracedLetters = KIDS_TRACING_GROUPS.flatMap((g) => g.letters);
  assert.equal(allTracedLetters.length, 29, "Finger Tracing must cover all 29 Arabic letters");

  allTracedLetters.forEach((l) => {
    assert.ok(l.ar, "Traced letter must have Arabic character");
    assert.ok(l.nameBn, "Traced letter must have Bengali name");
    assert.ok(l.guide, "Traced letter must have stroke guide direction");
  });
});

test("7. Tashdeed & Madd Educational Datasets", () => {
  assert.ok(KIDS_TASHDEED_DATA.length >= 5, "Must have authentic Tashdeed exercises");
  assert.ok(KIDS_MADD_DATA.length >= 5, "Must have authentic Madd exercises");

  KIDS_TASHDEED_DATA.forEach((item) => {
    assert.ok(item.ar, "Tashdeed item must have Arabic text");
    assert.ok(item.nameBn, "Tashdeed item must have Bengali name");
    assert.ok(item.tip, "Tashdeed item must have pedagogical tip");
  });

  KIDS_MADD_DATA.forEach((item) => {
    assert.ok(item.ar, "Madd item must have Arabic text");
    assert.ok(item.nameBn, "Madd item must have Bengali name");
    assert.ok(item.tip, "Madd item must have pedagogical tip");
  });
});

test("8. Kids Badges & Mastery Achievements", () => {
  assert.ok(KIDS_BADGES.length >= 4, "Must have kids badges");
  KIDS_BADGES.forEach((b) => {
    assert.ok(b.id, "Badge must have id");
    assert.ok(b.title, "Badge must have title");
    assert.ok(b.minStars > 0, "Badge must require stars");
    assert.ok(b.desc, "Badge must have description");
  });
});

test("9. Canonical 17 Takhtis of Noorani Qaida Curriculum (Complete Coverage)", () => {
  assert.equal(NOORANI_QAIDA_17_TAKHTIS.length, 17, "Must have all 17 canonical Takhtis defined");

  NOORANI_QAIDA_17_TAKHTIS.forEach((takhti, idx) => {
    assert.equal(takhti.number, idx + 1, `Takhti number must match sequence ${idx + 1}`);
    assert.ok(takhti.titleBn, `Takhti ${idx + 1} must have Bengali title`);
    assert.ok(takhti.titleAr, `Takhti ${idx + 1} must have Arabic title`);
    assert.ok(takhti.summaryBn, `Takhti ${idx + 1} must have summary rules in Bengali`);
    assert.ok(takhti.ruleCategory, `Takhti ${idx + 1} must have rule category`);
    assert.ok(takhti.drills.length > 0, `Takhti ${idx + 1} must have exercise drills`);
  });

  // Verify all 35 Noorani lessons are mapped to a Takhti
  let totalMappedLessons = 0;
  NOORANI_QAIDA_MODULES.forEach((m) => {
    m.lessons.forEach((l) => {
      assert.ok(l.takhtiNumber >= 1 && l.takhtiNumber <= 17, `Lesson ${l.id} must be mapped to Takhti 1..17`);
      assert.ok(l.takhtiTitle, `Lesson ${l.id} must have takhtiTitle string`);
      totalMappedLessons++;
    });
  });
  assert.equal(totalMappedLessons, 35, "All 35 lessons must have Takhti indexing");
});

test("10. Classical 29 Arabic Letters Taxonomy, Shapes & 17 Makharij", () => {
  assert.equal(KIDS_ARABIC_LETTERS.length, 29, "Must have exactly 29 Arabic letters");

  // Nuqta Distribution: 14 dotless, 10 single-dot, 3 two-dot, 2 three-dot = 29
  const dotless = KIDS_ARABIC_LETTERS.filter((l) => l.dots === 0);
  const single = KIDS_ARABIC_LETTERS.filter((l) => l.dots === 1);
  const two = KIDS_ARABIC_LETTERS.filter((l) => l.dots === 2);
  const three = KIDS_ARABIC_LETTERS.filter((l) => l.dots === 3);

  assert.equal(dotless.length, 14, "Must have exactly 14 dotless letters (মুকতা বা মুহমালাহ)");
  assert.equal(single.length, 10, "Must have exactly 10 single-dot letters (মু'জামা)");
  assert.equal(two.length, 3, "Must have exactly 3 two-dot letters (মুসান্নাহ: ت, ق, ي)");
  assert.equal(three.length, 2, "Must have exactly 2 three-dot letters (মুসাল্লাসাহ: ث, ش)");

  // Dot Positions: 12 top, 2 bottom, 1 inside, 14 none = 29
  const topDots = KIDS_ARABIC_LETTERS.filter((l) => l.dotPos === "top");
  const bottomDots = KIDS_ARABIC_LETTERS.filter((l) => l.dotPos === "bottom");
  const insideDots = KIDS_ARABIC_LETTERS.filter((l) => l.dotPos === "inside");

  assert.equal(topDots.length, 12, "Must have exactly 12 letters with dots on top");
  assert.equal(bottomDots.length, 2, "Must have exactly 2 letters with dots on bottom (ب, ي)");
  assert.equal(insideDots.length, 1, "Must have exactly 1 letter with dot inside (ج)");

  // Alif vs Hamzah distinction
  const alif = KIDS_ARABIC_LETTERS.find((l) => l.ar === "ا");
  const hamzah = KIDS_ARABIC_LETTERS.find((l) => l.ar === "ء");
  assert.ok(alif.isMaddVowel, "Alif must be categorized as vowel lengthener (isMaddVowel)");
  assert.ok(hamzah.isGlottalStop, "Hamzah must be categorized as consonantal glottal stop (isGlottalStop)");

  // Every letter must have 4 positional shapes (isolated, initial, medial, final)
  KIDS_ARABIC_LETTERS.forEach((l) => {
    assert.ok(l.shapes, `Letter ${l.ar} must have shapes object`);
    assert.ok(l.shapes.isolated, `Letter ${l.ar} must have isolated shape`);
    assert.ok(l.shapes.initial, `Letter ${l.ar} must have initial shape`);
    assert.ok(l.shapes.medial, `Letter ${l.ar} must have medial shape`);
    assert.ok(l.shapes.final, `Letter ${l.ar} must have final shape`);

    // Every letter must have 17 Makharij detail
    assert.ok(l.makhraj, `Letter ${l.ar} must have makhraj metadata`);
    assert.ok(l.makhraj.number >= 1 && l.makhraj.number <= 17, `Letter ${l.ar} makhraj number must be 1..17`);
    assert.ok(l.makhraj.zoneBn, `Letter ${l.ar} must have Bengali makhraj zone`);
    assert.ok(l.makhraj.descriptionBn, `Letter ${l.ar} must have articulation description`);
  });
});

test("11. Complete Ampara (Juz 30) 37 Surahs Dataset & Audio Resolution", () => {
  // 37 Surahs in Juz 30 (78 to 114) + Surah 1 Al-Fatiha = 38 total
  assert.equal(AMPARA_JUZ_30_SURAHS.length, 38, "Ampara curriculum must have 38 Surahs (Juz 30 + Fatiha)");
  assert.equal(KIDS_SURAHS_DATA.length, 38, "KIDS_SURAHS_DATA must contain all 38 Surahs");

  // Verify Surahs sequence: first is 1, second is 78, last is 114
  assert.equal(AMPARA_JUZ_30_SURAHS[0].num, 1, "First Surah must be Surah 1 (Al-Fatiha)");
  assert.equal(AMPARA_JUZ_30_SURAHS[1].num, 78, "Second Surah must be Surah 78 (An-Naba)");
  assert.equal(AMPARA_JUZ_30_SURAHS[37].num, 114, "Last Surah must be Surah 114 (An-Nas)");

  AMPARA_JUZ_30_SURAHS.forEach((s) => {
    assert.ok(s.id, `Surah ${s.num} must have id`);
    assert.ok(s.nameBn, `Surah ${s.num} must have Bengali name`);
    assert.ok(s.nameAr, `Surah ${s.num} must have Arabic name`);
    assert.ok(s.totalAyahs > 0, `Surah ${s.num} must have totalAyahs`);
    assert.ok(s.ayahs.length > 0, `Surah ${s.num} must have practice verses`);

    s.ayahs.forEach((a) => {
      assert.ok(a.ar, `Ayah ${a.num} of Surah ${s.num} must have Arabic text`);
      assert.ok(a.bn, `Ayah ${a.num} of Surah ${s.num} must have Bengali translation`);
      assert.ok(a.audio.startsWith("https://everyayah.com/data/"), `Ayah ${a.num} of Surah ${s.num} must have EveryAyah CDN URL`);
    });
  });
});

test("12. Real Directional Waypoint Finger Tracing Engine (29 Letters)", () => {
  assert.equal(Object.keys(LETTER_WAYPOINTS).length, 29, "Must have waypoints for all 29 Arabic letters");

  KIDS_ARABIC_LETTERS.forEach((l) => {
    const wp = LETTER_WAYPOINTS[l.ar];
    assert.ok(wp, `Letter ${l.ar} must have defined waypoints`);
    assert.ok(wp.length >= 3, `Letter ${l.ar} must have at least 3 waypoints for stroke direction`);

    // Verify waypoints are sequential
    wp.forEach((point, pIdx) => {
      assert.equal(point.step, pIdx + 1, `Waypoint step must be sequential (1 ➔ 2 ➔ 3)`);
      assert.ok(point.x >= 0 && point.x <= 1, `Waypoint x must be normalized (0.0 to 1.0)`);
      assert.ok(point.y >= 0 && point.y <= 1, `Waypoint y must be normalized (0.0 to 1.0)`);
      assert.ok(point.label, `Waypoint must have step label`);
    });
  });
});

test("13. Teacher Verification Channel Bridge & Submission Generation", () => {
  const submission = submitRecitationForReview({
    studentName: "আব্দুল হালীম",
    rollNo: "K-07",
    batch: "নূরানী কায়দা",
    examTitle: "তখতী ১০: সাকিন ও ক্বলক্বলাহ পরীক্ষা",
    verseText: "أَبْ أَتْ أَجْ",
    aiScore: 92,
  });

  assert.ok(submission.id.startsWith("sub-"), "Submission must generate a unique ID");
  assert.equal(submission.status, "pending", "Initial status must be pending review");
  assert.equal(submission.studentName, "আব্দুল হালীম", "Student name must match");
  assert.equal(submission.aiScore.overall, 92, "AI score must be preserved");
  assert.ok(submission.aiScore.makhraj > 0, "Makhraj sub-score must be calculated");
});
