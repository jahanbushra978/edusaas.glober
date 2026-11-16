import test from "node:test";
import assert from "node:assert/strict";
import {
  getUniversalAyahRepeats,
  splitArabicAyahWords,
  AUTHENTIC_WAQF_GLYPH_REGEX,
  getActiveArabicWordDetails,
} from "../src/lib/quran/quran-audio-timing.js";
import { normalizeQuranWord } from "../src/lib/quran/hafizi-annotations.js";

test("Universal Waqf (★) and Ibtida (✓) across All 114 Surahs", async (t) => {
  await t.test("Surah 8 Ayah 44 generates verified stop at أَعْيُنِهِمْ and resume at وَيُقَلِّلُكُمْ", () => {
    const text = "وَإِذْ يُرِيكُمُوهُمْ إِذِ ٱلْتَقَيْتُمْ فِىٓ أَعْيُنِكُمْ قَلِيلًا وَيُقَلِّلُكُمْ فِىٓ أَعْيُنِهِمْ لِيَقْضِىَ ٱللَّهُ أَمْرًا كَانَ مَفْعُولًا ۗ وَإِلَى ٱللَّهِ تُرْجَعُ ٱلْأُمُورُ";
    const words = splitArabicAyahWords(text);
    const repeats = getUniversalAyahRepeats(8, 44, words, "minshawy_teacher");

    assert.ok(repeats.length > 0, "Repeats must exist for Surah 8 Ayah 44");
    const repeat = repeats[0];

    // Verify stop point (★)
    assert.equal(repeat.stopWordIdx, 9);
    assert.equal(normalizeQuranWord(repeat.stopAfterWord), normalizeQuranWord("أَعْيُنِهِمْ"));

    // Verify resume point (✓)
    assert.equal(repeat.resumeWordIdx, 7);
    assert.equal(normalizeQuranWord(repeat.resumeAtWord), normalizeQuranWord("وَيُقَلِّلُكُمْ"));
  });

  await t.test("Ayatul Kursi (2:255) with existing printed Waqf glyphs contains zero false stars or ticks", () => {
    const text = "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ";
    const words = splitArabicAyahWords(text);
    const repeats = getUniversalAyahRepeats(2, 255, words, "minshawy_teacher");

    assert.equal(repeats.length, 0, "No duplicate synthetic markers allowed where printed Quranic waqf marks exist");
  });

  await t.test("AUTHENTIC_WAQF_GLYPH_REGEX matches all canonical stop signs without matching plain letters", () => {
    const canonicalSigns = ["ۚ", "ۗ", "ۘ", "ۖ", "ۜ", "۞", "۩", "ج", "ط", "م", "قلى", "صلى"];
    canonicalSigns.forEach((sign) => {
      assert.ok(AUTHENTIC_WAQF_GLYPH_REGEX.test(sign), `Regex should match canonical stop sign: ${sign}`);
    });

    // Plain words ending in Meem or Jeem without stop mark should not falsely trigger
    assert.equal(AUTHENTIC_WAQF_GLYPH_REGEX.test("أَعْيُنِهِمْ"), false);
    assert.equal(AUTHENTIC_WAQF_GLYPH_REGEX.test("عَلِيمٌ"), false);
    assert.equal(AUTHENTIC_WAQF_GLYPH_REGEX.test("حَكِيمٌ"), false);
  });

  await t.test("Short verses (e.g. Surah 112 Al-Ikhlas) require zero mid-verse pauses", () => {
    const text = "قُلْ هُوَ ٱللَّهُ أَحَدٌ";
    const words = splitArabicAyahWords(text);
    const repeats = getUniversalAyahRepeats(112, 1, words, "minshawy_teacher");

    assert.equal(repeats.length, 0, "Short verses do not require breath pause markers");
  });

  await t.test("Universal engine handles any long verse across all 114 Surahs syntactically", () => {
    // Artificial 15-word span with transition particle
    const words = [
      "قَالَ", "يَٰقَوْمِ", "ٱعْبُدُوا۟", "ٱللَّهَ", "مَا", "لَكُم", "مِّنْ", "إِلَٰهٍ", "غَيْرُهُۥ",
      "إِنَّ", "فِى", "ذَٰلِكَ", "لَءَايَةً", "لِّقَوْمٍ", "يُؤْمِنُونَ"
    ];
    const repeats = getUniversalAyahRepeats(999, 1, words, "alafasy");

    assert.ok(repeats.length > 0, "Algorithmic engine must identify pause before particle 'إِنَّ'");
    assert.equal(repeats[0].stopWordIdx, 8);
    assert.equal(repeats[0].stopAfterWord, "غَيْرُهُۥ");
  });

  await t.test("Word index does not jump back and forth to the last word during inter-word silence", () => {
    const words = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"];
    const duration = 5.0;

    // Simulate timeline progress from 0.0s to 4.5s in 0.1s increments
    let prevWord = 0;
    for (let sec = 0.1; sec <= 4.5; sec += 0.1) {
      const { wordIndex } = getActiveArabicWordDetails({
        currentTime: sec,
        duration,
        surahNumber: 1,
        ayahNumber: 1,
        qariId: "alafasy",
        words,
      });

      // Word index must monotonically advance or stay the same; it must never jump ahead to the end and jump back!
      assert.ok(
        wordIndex >= prevWord,
        `Word index must not jump backward or jump erratically (at ${sec}s got ${wordIndex}, previously ${prevWord})`
      );
      prevWord = wordIndex;
    }
  });
});
