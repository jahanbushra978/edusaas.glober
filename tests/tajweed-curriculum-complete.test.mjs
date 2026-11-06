import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TAJWEED_LEVELS,
  MASTER_TAJWEED_UNITS,
  getLessonById,
  getCurriculumStats,
} from "../src/features/ai-learning/data/masterTajweedCurriculum.js";

describe("Complete Tajweed Platform — 'তাজবিদ শিখি' Curriculum Verification", () => {
  it("should have all 4 progressive levels with correct metadata", () => {
    assert.equal(TAJWEED_LEVELS.length, 4);
    assert.deepEqual(
      TAJWEED_LEVELS.map((l) => l.id),
      ["beginner", "foundation", "intermediate", "advanced"]
    );
    assert.equal(TAJWEED_LEVELS[0].titleBn, "প্রারম্ভিক স্তর");
    assert.equal(TAJWEED_LEVELS[1].titleBn, "বুনিয়াদ স্তর");
    assert.equal(TAJWEED_LEVELS[2].titleBn, "মাঝারি স্তর");
    assert.equal(TAJWEED_LEVELS[3].titleBn, "উচ্চতর স্তর");
  });

  it("should have all 12 core units according to the Master Directive", () => {
    assert.equal(MASTER_TAJWEED_UNITS.length, 12);
    const unitTitles = MASTER_TAJWEED_UNITS.map((u) => u.titleBn);
    assert.ok(unitTitles[0].includes("তাজবিদ পরিচিতি"));
    assert.ok(unitTitles[1].includes("আরবি হরফ"));
    assert.ok(unitTitles[2].includes("মাখরাজুল হুরূফ"));
    assert.ok(unitTitles[3].includes("সিফাতুল হুরূফ"));
    assert.ok(unitTitles[4].includes("নূন সাকিন ও তানভীন"));
    assert.ok(unitTitles[5].includes("মীম সাকিন"));
    assert.ok(unitTitles[6].includes("ওয়াজিব গুন্নাহ ও কলক্বলাহ"));
    assert.ok(unitTitles[7].includes("মাদ্দ বা দীর্ঘ স্বর"));
    assert.ok(unitTitles[8].includes("লাম ও রা"));
    assert.ok(unitTitles[9].includes("ওয়াকফ ও ইবতিদা"));
    assert.ok(unitTitles[10].includes("হামজাতুল ওয়াসল"));
    assert.ok(unitTitles[11].includes("কুরআনভিত্তিক তাজবিদ প্রয়োগ"));
  });

  it("should have all 4 rules of Noon Saakin in Unit 05", () => {
    const unit5 = MASTER_TAJWEED_UNITS.find((u) => u.id === "unit-05");
    assert.ok(unit5);
    assert.equal(unit5.lessons.length, 5);
    const lessonIds = unit5.lessons.map((l) => l.id);
    assert.ok(lessonIds.includes("noon-izhar-halqi"));
    assert.ok(lessonIds.includes("noon-idgham-maal-ghunnah"));
    assert.ok(lessonIds.includes("noon-idgham-bighair-ghunnah"));
    assert.ok(lessonIds.includes("noon-iqlab"));
    assert.ok(lessonIds.includes("noon-ikhfa-haqiqi"));
  });

  it("should have all 3 rules of Meem Saakin in Unit 06", () => {
    const unit6 = MASTER_TAJWEED_UNITS.find((u) => u.id === "unit-06");
    assert.ok(unit6);
    assert.equal(unit6.lessons.length, 3);
    const lessonIds = unit6.lessons.map((l) => l.id);
    assert.ok(lessonIds.includes("meem-ikhfa-shafawi"));
    assert.ok(lessonIds.includes("meem-idgham-shafawi"));
    assert.ok(lessonIds.includes("meem-izhar-shafawi"));
  });

  it("should have full Sifat coverage with opposites and non-opposites in Unit 04", () => {
    const unit4 = MASTER_TAJWEED_UNITS.find((u) => u.id === "unit-04");
    assert.ok(unit4);
    assert.equal(unit4.lessons.length, 5);
    const lessonIds = unit4.lessons.map((l) => l.id);
    assert.ok(lessonIds.includes("sifat-hams-jahr"));
    assert.ok(lessonIds.includes("sifat-sound-flow"));
    assert.ok(lessonIds.includes("sifat-tongue-elevation"));
    assert.ok(lessonIds.includes("sifat-non-opposite-special"));
    assert.ok(lessonIds.includes("sifat-similar-letters-comparison"));
  });

  it("should have full Waqf & Ibtida coverage in Unit 10", () => {
    const unit10 = MASTER_TAJWEED_UNITS.find((u) => u.id === "unit-10");
    assert.ok(unit10);
    assert.equal(unit10.lessons.length, 3);
    const lessonIds = unit10.lessons.map((l) => l.id);
    assert.ok(lessonIds.includes("waqf-meaning-and-types"));
    assert.ok(lessonIds.includes("waqf-mushaf-symbols"));
    assert.ok(lessonIds.includes("waqf-breath-management-ibtida"));
  });

  it("should verify every single lesson has authentic human Qari audio and valid quiz", () => {
    const stats = getCurriculumStats();
    assert.equal(stats.totalLessons, 41);

    for (const unit of MASTER_TAJWEED_UNITS) {
      for (const lesson of unit.lessons) {
        // Quran example verification
        assert.ok(lesson.quranExample, `Lesson ${lesson.id} missing quranExample`);
        assert.ok(lesson.quranExample.audioUrl, `Lesson ${lesson.id} missing audioUrl`);
        assert.ok(
          lesson.quranExample.audioUrl.startsWith("https://everyayah.com/data/"),
          `Lesson ${lesson.id} audio must use authentic everyayah Qari recording`
        );
        assert.ok(lesson.quranExample.surahNo > 0, `Lesson ${lesson.id} invalid surahNo`);
        assert.ok(lesson.quranExample.ayahNo > 0, `Lesson ${lesson.id} invalid ayahNo`);

        // Teaching cycle verification
        assert.ok(lesson.introBn && lesson.introBn.length > 20, `Lesson ${lesson.id} invalid introBn`);
        assert.ok(lesson.ruleExplanationBn && lesson.ruleExplanationBn.length > 30, `Lesson ${lesson.id} invalid ruleExplanationBn`);
        assert.ok(lesson.comparison, `Lesson ${lesson.id} missing comparison`);

        // Assessment quiz verification
        assert.ok(lesson.quiz, `Lesson ${lesson.id} missing quiz`);
        assert.ok(lesson.quiz.questionBn, `Lesson ${lesson.id} missing quiz question`);
        assert.ok(lesson.quiz.options.length >= 3, `Lesson ${lesson.id} quiz options < 3`);
        const correctCount = lesson.quiz.options.filter((o) => o.correct).length;
        assert.equal(correctCount, 1, `Lesson ${lesson.id} quiz must have exactly 1 correct answer`);
      }
    }
  });

  it("getLessonById should retrieve lesson and attach unit metadata", () => {
    const lesson = getLessonById("madd-lazim-types");
    assert.ok(lesson);
    assert.equal(lesson.titleBn, "মাদ্দ লাযিম (বাধ্যতামূলক ৬ হরকত = ৩ আলিফ)");
    assert.equal(lesson.unit.id, "unit-08");
    assert.equal(lesson.maddStandard.harakats, 6);
  });
});

