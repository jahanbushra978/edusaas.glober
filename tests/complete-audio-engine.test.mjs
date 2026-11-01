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

      // 2. resolveArabicSoundAudio
      const soundRes = resolveArabicSoundAudio(word);
      assert.equal(soundRes.found, true, `Word "${word}" must resolve in resolveArabicSoundAudio`);
      assert.ok(soundRes.urls.length > 0, `Word "${word}" must return playable URLs`);

      // 3. Fallback inside resolveLetterAudio (when component calls letter resolver for a word)
      const letterRes = resolveLetterAudio(word);
      assert.equal(letterRes.found, true, `Word "${word}" must be gracefully resolved even if passed to resolveLetterAudio`);
    });
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

  it("enforces ZERO synthetic SpeechSynthesis in audio engine", async () => {
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
  });
});

