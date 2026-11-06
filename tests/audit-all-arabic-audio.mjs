import { NOORANI_QAIDA_17_TAKHTIS, NOORANI_QAIDA_MODULES } from "../src/features/ai-learning/data/nooraniQaidaCurriculum.js";
import {
  KIDS_ARABIC_LETTERS,
  KIDS_MURAKKABAT_DATA,
  KIDS_HARAKAT_DRILL_DATA,
  KIDS_TANWEEN_DATA,
  KIDS_JAZM_QALQALAH_DATA,
  KIDS_TASHDEED_DATA,
  KIDS_MADD_DATA,
  KIDS_DOT_GAME_LEVELS,
  KIDS_HARAKAT_GAME_LEVELS,
  KIDS_MEMORY_GAME_LEVELS,
  KIDS_SOUND_DETECTIVE_LEVELS,
} from "../src/features/ai-learning/data/kidsGameData.js";
import { DRAG_DROP_LEVELS } from "../src/features/ai-learning/data/dragDropGameData.js";
import { LETTER_SIFAT_MAP } from "../src/features/ai-learning/data/sifatCurriculum.js";
import { resolveArabicSoundAudio, resolveLetterAudio, resolveWordAudio } from "../src/lib/quran/audio/AudioSourceRegistry.js";

// Collect all unique Arabic items across the entire platform
const items = new Set();

function addToken(str) {
  if (!str || typeof str !== "string") return;
  const clean = str.replace(/[➔➜➝→]/g, "").trim();
  if (clean) items.add(clean);
}

// 1. Kids Arabic Letters (all 29 letters and their isolated, initial, medial, final forms)
KIDS_ARABIC_LETTERS.forEach(l => {
  addToken(l.ar);
  if (l.shapes) {
    Object.values(l.shapes).forEach(s => addToken(s));
  }
});

// 2. Kids Murakkabat (Joined letters)
KIDS_MURAKKABAT_DATA.forEach(m => addToken(m.ar));

// 3. Kids Harakat Drill Data
KIDS_HARAKAT_DRILL_DATA.forEach(h => addToken(h.ar));

// 4. Kids Tanween Data
KIDS_TANWEEN_DATA.forEach(t => addToken(t.ar));

// 5. Kids Qalqalah & Jazm Data
KIDS_JAZM_QALQALAH_DATA.forEach(q => addToken(q.ar));

// 6. Kids Tashdeed Data
KIDS_TASHDEED_DATA.forEach(t => addToken(t.ar));

// 7. Kids Madd Data
KIDS_MADD_DATA.forEach(m => addToken(m.ar));

// 8. Kids Game Datasets
KIDS_DOT_GAME_LEVELS.forEach(lvl => {
  if (lvl.pool) lvl.pool.forEach(p => addToken(p));
});

KIDS_HARAKAT_GAME_LEVELS.forEach(lvl => {
  if (lvl.pool) lvl.pool.forEach(p => addToken(p));
  if (lvl.items) lvl.items.forEach(it => addToken(it.ar));
});

KIDS_MEMORY_GAME_LEVELS.forEach(lvl => {
  if (lvl.pool) lvl.pool.forEach(p => addToken(p));
});

KIDS_SOUND_DETECTIVE_LEVELS.forEach(lvl => {
  if (lvl.items) lvl.items.forEach(it => {
    addToken(it.ar);
    if (it.options) it.options.forEach(opt => addToken(opt.ar));
  });
});

// 9. Drag & Drop Game (Levels 1 - 14)
DRAG_DROP_LEVELS.forEach(lvl => {
  if (lvl.letters) lvl.letters.forEach(l => addToken(l.ar));
});

// 10. Noorani Qaida 17 Takhtis
for (const t of NOORANI_QAIDA_17_TAKHTIS) {
  if (t.drills) {
    for (const d of t.drills) {
      if (d.ar) {
        d.ar.split(/\s+/).forEach(tok => addToken(tok));
      }
    }
  }
}

// 11. Noorani Qaida Modules
for (const m of NOORANI_QAIDA_MODULES) {
  for (const l of m.lessons) {
    if (l.arabicItems) {
      l.arabicItems.forEach(it => addToken(it));
    }
    if (l.drills) {
      l.drills.forEach(d => {
        if (typeof d === "string") addToken(d);
        else if (d.ar) addToken(d.ar);
      });
    }
  }
}

// 12. Sifat Curriculum Letters
Object.values(LETTER_SIFAT_MAP).forEach(s => addToken(s.letterAr));

// 13. Representative Alif Combinations (both vowelled e.g. بَا and unvowelled e.g. با)
const alifLetters = [
  "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز",
  "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "و", "ه", "ي"
];
alifLetters.forEach(l => {
  addToken(l + "ا");
  addToken(l + "\u064E" + "ا");
});

console.log(`Total unique Arabic items collected: ${items.size}`);

const resolved = [];
const missing = [];

for (const item of items) {
  const soundRes = resolveArabicSoundAudio(item);
  const letterRes = resolveLetterAudio(item);
  const wordRes = resolveWordAudio(item);

  if (soundRes.found || letterRes.found || (wordRes && wordRes.found)) {
    resolved.push(item);
  } else {
    missing.push(item);
  }
}

console.log(`Working: ${resolved.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
  console.log("\n--- MISSING ITEMS ---");
  console.log(missing.join(", "));
  process.exit(1);
} else {
  console.log("\nALL ARABIC AUDIO ITEMS RESOLVE TO AUTHENTIC RECORDINGS (100% COVERAGE).");
}
