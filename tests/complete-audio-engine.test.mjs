import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  resolveLetterAudio,
  resolveArabicSoundAudio,
  resolveWordAudio,
  AUTHENTIC_QURAN_WORDS_MAP,
  NOORANI_TRACK_MAP,
  ARABIC_LETTER_AUDIO_MAP,
  AUTHENTIC_TAJWEED_AUDIO_MAP,
} from "../src/lib/quran/audio/index.js";
import { DRAG_DROP_LEVELS } from "../src/features/ai-learning/data/dragDropGameData.js";
import {
  KIDS_HARAKAT_GAME_LEVELS,
  KIDS_MEMORY_GAME_LEVELS,
  KIDS_TASHDEED_DATA,
  KIDS_MADD_DATA,
} from "../src/features/ai-learning/data/kidsGameData.js";

describe("Complete Quran Learning Audio Resolution Test Suite", () => {
  it("resolves all 29 individual Arabic letters (Alif to Ya) to authentic tracks", () => {
    const letters = [
      "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
      "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
      "ق", "ك", "ل", "م", "ن", "و", "هـ", "ء", "ي"
    ];

    letters.forEach((l) => {
      const res = resolveLetterAudio(l);
      assert.equal(res.found, true, `Letter "${l}" must be found`);
      assert.ok(res.urls.length > 0, `Letter "${l}" must have candidate URLs`);
    });
  });

  it("resolves Drag & Drop Game Level 14 words (الْفَلَقِ, الْحَمْدُ, النَّاسِ) with 100% authentic audio", () => {
    const level14Words = ["الْفَلَقِ", "الْحَمْدُ", "النَّاسِ"];
    level14Words.forEach((word) => {
      // 1. Direct word resolver
      const wordRes = resolveWordAudio(word);
      assert.equal(wordRes.found, true, `Word "${word}" must resolve in resolveWordAudio`);
      assert.ok(wordRes.urls[0].startsWith("https://audio.qurancdn.com/wbw/"), `Word "${word}" URL should be WBW CDN`);

      // Verify exact verified positions for Surah 113 and 114
      if (word === "الْفَلَقِ") {
        assert.equal(wordRes.urls[0], "https://audio.qurancdn.com/wbw/113_001_004.mp3", "الْفَلَقِ must be word 4 in 113:1");
      } else if (word === "النَّاسِ") {
        assert.equal(wordRes.urls[0], "https://audio.qurancdn.com/wbw/114_001_004.mp3", "النَّاسِ must be word 4 in 114:1");
      } else if (word === "الْحَمْدُ") {
        assert.equal(wordRes.urls[0], "https://audio.qurancdn.com/wbw/001_002_001.mp3", "الْحَمْدُ must be word 1 in 1:2");
      }

      // 2. resolveArabicSoundAudio
      const soundRes = resolveArabicSoundAudio(word);
      assert.equal(soundRes.found, true, `Word "${word}" must resolve in resolveArabicSoundAudio`);
      assert.ok(soundRes.urls.length > 0, `Word "${word}" must return playable URLs`);

      // 3. Fallback inside resolveLetterAudio (when component calls letter resolver for a word)
      const letterRes = resolveLetterAudio(word);
      assert.equal(letterRes.found, true, `Word "${word}" must be gracefully resolved even if passed to resolveLetterAudio`);
    });
  });

  it("verifies accurate word indices for critical Quran words (Rabbi, Kufuwan, Falaq, Naas, etc.)", () => {
    const expectedMappings = {
      "الْفَلَقِ": "https://audio.qurancdn.com/wbw/113_001_004.mp3",
      "النَّاسِ": "https://audio.qurancdn.com/wbw/114_001_004.mp3",
      "رَبِّ": "https://audio.qurancdn.com/wbw/001_002_003.mp3",
      "كُفُوًا": "https://audio.qurancdn.com/wbw/112_004_004.mp3",
      "خَلَقَ": "https://audio.qurancdn.com/wbw/096_001_005.mp3",
      "قَالَ": "https://audio.qurancdn.com/wbw/002_030_002.mp3",
      "يَقُولُ": "https://audio.qurancdn.com/wbw/002_008_004.mp3",
      "نُورٌ": "https://audio.qurancdn.com/wbw/024_035_002.mp3",
      "فِيهِ": "https://audio.qurancdn.com/wbw/002_002_005.mp3",
      "مَدَّ": "https://audio.qurancdn.com/wbw/025_045_006.mp3",
      "حَقَّ": "https://audio.qurancdn.com/wbw/022_074_004.mp3",
      "نُوحِيهَا": "https://audio.qurancdn.com/wbw/011_049_005.mp3",
    };

    for (const [word, expectedUrl] of Object.entries(expectedMappings)) {
      const res = resolveWordAudio(word);
      assert.equal(res.found, true, `"${word}" must be found`);
      assert.equal(res.urls[0], expectedUrl, `"${word}" must match exact verified audio URL ${expectedUrl}`);
    }
  });

  it("resolves all words across Drag & Drop levels 11, 12, 13, 14", () => {
    const wordLevels = DRAG_DROP_LEVELS.filter((lvl) => lvl.id >= 11);
    assert.equal(wordLevels.length, 4, "Must have 4 word levels in DragDropLetterGame");

    wordLevels.forEach((lvl) => {
      lvl.letters.forEach((item) => {
        const soundRes = resolveArabicSoundAudio(item.ar);
        assert.equal(
          soundRes.found,
          true,
          `Level ${lvl.id} word "${item.ar}" (${item.nameBn}) must have valid audio resolution`
        );
        assert.ok(soundRes.urls.length > 0, `Level ${lvl.id} word "${item.ar}" must have at least one URL`);
      });
    });
  });

  it("resolves words in Harakat Master Game (Levels 6 - 9)", () => {
    const words = [
      "دَرَسَ", "وَجَدَ", "كَتَبَ", "خَلَقَ",
      "قُلْ", "أَبْ", "فَلَقْ",
      "رَبِّ", "إِنَّ", "ثُمَّ",
      "قَالَ", "نُورٌ", "فِيهِ"
    ];

    words.forEach((w) => {
      const res = resolveArabicSoundAudio(w);
      assert.equal(res.found, true, `Harakat game word "${w}" must resolve`);
      assert.ok(res.urls.length > 0);
    });
  });

  it("resolves words in Memory Match Game Level 7 (Ampara words)", () => {
    const lvl7 = KIDS_MEMORY_GAME_LEVELS.find((l) => l.id === 7);
    assert.ok(lvl7, "Level 7 must exist in KIDS_MEMORY_GAME_LEVELS");

    lvl7.pool.forEach((word) => {
      const res = resolveArabicSoundAudio(word);
      assert.equal(res.found, true, `Memory game pool word "${word}" must resolve`);
      assert.ok(res.urls.length > 0);
    });
  });

  it("resolves Tashdeed and Madd curriculum drill words", () => {
    KIDS_TASHDEED_DATA.forEach((item) => {
      const res = resolveArabicSoundAudio(item.ar);
      assert.equal(res.found, true, `Tashdeed drill "${item.ar}" must resolve`);
      assert.ok(res.urls.length > 0);
    });

    KIDS_MADD_DATA.forEach((item) => {
      const res = resolveArabicSoundAudio(item.ar);
      assert.equal(res.found, true, `Madd drill "${item.ar}" must resolve`);
      assert.ok(res.urls.length > 0);
    });
  });

  it("resolves all letters combined with Alif (both vowelled and unvowelled Murakkabat)", () => {
    const vowelledAlifPairs = [
      "بَا", "تَا", "ثَا", "جَا", "حَا", "خَا", "دَا", "ذَا", "رَا", "زَا",
      "سَا", "شَا", "صَا", "ضَا", "طَا", "ظَا", "عَا", "غَا", "فَا", "قَا",
      "كَا", "لَا", "مَا", "نَا", "وَا", "هَا", "يَا"
    ];

    vowelledAlifPairs.forEach((pair) => {
      const res = resolveArabicSoundAudio(pair);
      assert.equal(res.found, true, `Vowelled Alif combination "${pair}" must resolve`);
      assert.ok(res.urls.length > 0, `"${pair}" must have candidate URLs`);
    });

    const unvowelledAlifPairs = [
      "با", "تا", "ثا", "جا", "حا", "خا", "دا", "را", "سا", "لا", "ما", "نا", "ها", "يا"
    ];

    unvowelledAlifPairs.forEach((pair) => {
      const res = resolveArabicSoundAudio(pair);
      assert.equal(res.found, true, `Unvowelled Alif combination "${pair}" must resolve via fallback`);
      assert.ok(res.urls.length > 0, `"${pair}" must have candidate URLs`);
    });
  });

  it("resolves Huroof Muqatta'at (Takhti 3) and Murakkabat (Takhti 2)", () => {
    const muqattaat = ["الم", "الر", "طه", "يس", "حم", "كهيعص"];
    muqattaat.forEach((m) => {
      const res = resolveArabicSoundAudio(m);
      assert.equal(res.found, true, `Muqatta'ah "${m}" must resolve`);
      assert.ok(res.urls.length > 0);
    });

    const murakkabat = ["بل", "تح", "نح", "جح", "عس", "بَلْ", "تَحْتَ", "نَحْ", "جَحْ", "عَسْ"];
    murakkabat.forEach((m) => {
      const res = resolveArabicSoundAudio(m);
      assert.equal(res.found, true, `Murakkabat "${m}" must resolve`);
      assert.ok(res.urls.length > 0);
    });
  });

  it("enforces ZERO synthetic SpeechSynthesis in audio engine and voice prompts", async () => {
    const fs = await import("fs");
    const audioDir = "src/lib/quran/audio";
    const files = fs.readdirSync(audioDir);

    files.forEach((f) => {
      if (f.endsWith(".js")) {
        const content = fs.readFileSync(`${audioDir}/${f}`, "utf8");
        assert.equal(
          content.includes("speechSynthesis"),
          false,
          `File ${f} must not contain speechSynthesis`
        );
        assert.equal(
          content.includes("SpeechSynthesisUtterance"),
          false,
          `File ${f} must not contain SpeechSynthesisUtterance`
        );
      }
    });

    // Enforce ZERO synthetic speech in children's voicePrompts
    const promptContent = fs.readFileSync("src/features/ai-learning/lib/voicePrompts.js", "utf8");
    assert.equal(
      promptContent.includes("speechSynthesis"),
      false,
      "voicePrompts.js must not contain speechSynthesis"
    );
    assert.equal(
      promptContent.includes("SpeechSynthesisUtterance"),
      false,
      "voicePrompts.js must not contain SpeechSynthesisUtterance"
    );
  });

  it("verifies accurate authentic audio resolution for Seen (سَ, سِ, سُ) and Zay (زَ, زِ, زُ)", () => {
    const testCases = [
      { token: "سَ", expectedFile: "Page8-28.m4a" },
      { token: "سِ", expectedFile: "Page8-29.m4a" },
      { token: "سُ", expectedFile: "Page8-30.m4a" },
      { token: "زَ", expectedFile: "Page8-31.m4a" },
      { token: "زِ", expectedFile: "Page8-32.m4a" },
      { token: "زُ", expectedFile: "Page8-33.m4a" },
    ];

    testCases.forEach(({ token, expectedFile }) => {
      const res = resolveArabicSoundAudio(token);
      assert.equal(res.found, true, `${token} must resolve`);
      assert.ok(
        res.urls.some((u) => u.includes(expectedFile)),
        `${token} must resolve to ${expectedFile}, got ${res.urls.join(", ")}`
      );
    });

    // Specifically verify Seen with Kasrah produces short "si" sound (Page8-29.m4a) and NOT "sa" or Zay (Page8-31/32)
    const seenKasrah = resolveArabicSoundAudio("سِ");
    assert.equal(seenKasrah.found, true);
    assert.ok(seenKasrah.urls[0].includes("Page8-29.m4a"));
    assert.ok(!seenKasrah.urls[0].includes("Page8-32.m4a"));
    assert.ok(!seenKasrah.urls[0].includes("Page8-31.m4a"));
  });
});

