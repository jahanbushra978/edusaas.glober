import fs from 'fs';

const verseCache = new Map();

async function getVerseWords(surah, ayah) {
  const key = `${surah}:${ayah}`;
  if (verseCache.has(key)) return verseCache.get(key);

  try {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?words=true&word_fields=text_uthmani,text_imlaei`);
    if (!res.ok) {
      verseCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const words = (data.verse && data.verse.words) || [];
    verseCache.set(key, words);
    return words;
  } catch (err) {
    console.error(`Fetch error for ${key}:`, err.message);
    return null;
  }
}

function cleanAr(t) {
  if (!t) return "";
  return t
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, "") // strip diacritics & tashkeel
    .replace(/[إأآٱ]/g, "ا") // normalize alifs
    .replace(/ء/g, "")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

async function auditFile(filePath, regex) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  const results = [];

  while ((match = regex.exec(content)) !== null) {
    const arText = match[1];
    const surah = parseInt(match[2], 10);
    const ayah = parseInt(match[3], 10);
    const wordIdx = parseInt(match[4], 10);
    const url = `https://audio.qurancdn.com/wbw/${match[2]}_${match[3]}_${match[4]}.mp3`;

    results.push({ arText, surah, ayah, wordIdx, url, fullMatch: match[0] });
  }

  return results;
}

async function run() {
  console.log("=== COMPREHENSIVE QURAN WBW AUDIO AUDIT (WITH UTHMANI TEXT) ===");

  const filesToCheck = [
    {
      file: 'src/lib/quran/audio/QuranWordsAudioMap.js',
      regex: /"([^"]+)":\s*"https:\/\/audio\.qurancdn\.com\/wbw\/(\d{3})_(\d{3})_(\d{3})\.mp3"/g
    },
    {
      file: 'src/features/ai-learning/data/dragDropGameData.js',
      regex: /ar:\s*"([^"]+)"[^}]+audio:\s*"https:\/\/audio\.qurancdn\.com\/wbw\/(\d{3})_(\d{3})_(\d{3})\.mp3"/g
    },
    {
      file: 'src/features/ai-learning/data/kidsGameData.js',
      regex: /ar:\s*"([^"]+)"[^}]+audio:\s*"https:\/\/audio\.qurancdn\.com\/wbw\/(\d{3})_(\d{3})_(\d{3})\.mp3"/g
    }
  ];

  const discrepancies = [];
  const correct = [];

  for (const { file, regex } of filesToCheck) {
    console.log(`Auditing ${file}...`);
    const entries = await auditFile(file, regex);

    for (const item of entries) {
      const words = await getVerseWords(item.surah, item.ayah);
      if (!words) {
        console.warn(`Could not load verse ${item.surah}:${item.ayah} for ${item.arText}`);
        continue;
      }

      // Word at index (1-based position)
      const targetWord = words.find(w => w.position === item.wordIdx);
      const actualWordText = targetWord ? (targetWord.text_imlaei || targetWord.text_uthmani || targetWord.text) : null;

      const cleanedTarget = cleanAr(item.arText);
      const cleanedActual = cleanAr(actualWordText);

      // Check if matches or starts with (e.g. Alif Lam prefix or exact root)
      const isMatch = cleanedActual && (
        cleanedActual === cleanedTarget ||
        cleanedActual.endsWith(cleanedTarget) ||
        cleanedTarget.endsWith(cleanedActual) ||
        (cleanedActual.length >= 3 && cleanedTarget.length >= 3 && (cleanedActual.includes(cleanedTarget) || cleanedTarget.includes(cleanedActual)))
      );

      if (!isMatch) {
        // Search if the word exists elsewhere in this same verse
        const correctPos = words.find(w => {
          const wText = cleanAr(w.text_imlaei || w.text_uthmani || w.text);
          return wText && (wText === cleanedTarget || wText.endsWith(cleanedTarget) || (cleanedTarget.length >= 3 && wText.includes(cleanedTarget)));
        });

        discrepancies.push({
          file,
          expectedAr: item.arText,
          surah: item.surah,
          ayah: item.ayah,
          currentIdx: item.wordIdx,
          currentWordText: actualWordText,
          correctIdx: correctPos ? correctPos.position : null,
          correctWordText: correctPos ? (correctPos.text_imlaei || correctPos.text_uthmani) : null,
          currentUrl: item.url,
          suggestedUrl: correctPos ? `https://audio.qurancdn.com/wbw/${String(item.surah).padStart(3, '0')}_${String(item.ayah).padStart(3, '0')}_${String(correctPos.position).padStart(3, '0')}.mp3` : null
        });
      } else {
        correct.push({
          expected: item.arText,
          actual: actualWordText,
          surahAyah: `${item.surah}:${item.ayah}`,
          idx: item.wordIdx
        });
      }
    }
  }

  console.log(`\nAUDIT COMPLETE:`);
  console.log(`Total Correct Mappings: ${correct.length}`);
  console.log(`Total Discrepancies Found: ${discrepancies.length}`);

  if (discrepancies.length > 0) {
    console.log(`\n--- DISCREPANCIES LIST ---`);
    discrepancies.forEach((d, i) => {
      console.log(`[${i + 1}] File: ${d.file}`);
      console.log(`    Expected Text: ${d.expectedAr}`);
      console.log(`    Location: Surah ${d.surah}, Ayah ${d.ayah}`);
      console.log(`    Current Index: ${d.currentIdx} (Actually sounds like: "${d.currentWordText}")`);
      console.log(`    Current URL: ${d.currentUrl}`);
      if (d.correctIdx) {
        console.log(`    -> CORRECT Index in this Ayah: ${d.correctIdx} ("${d.correctWordText}")`);
        console.log(`    -> CORRECT URL: ${d.suggestedUrl}`);
      } else {
        console.log(`    -> NOT FOUND in this Ayah! Needs cross-Quran search.`);
      }
    });
  }
}

run();
