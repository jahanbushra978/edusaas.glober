import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  QURANI_AMAL_ITEMS,
  QURANI_AMAL_CATEGORIES,
} from '../src/features/ai-learning/data/quraniAmalData.js';
import { getQariAudioUrl } from '../src/lib/quran/audio/QariRegistry.js';
import fs from 'node:fs';

test('1. QURANI_AMAL_ITEMS contains all mandatory user-requested Surahs and Ayahs', () => {
  const ids = QURANI_AMAL_ITEMS.map((item) => item.id);

  assert.ok(ids.includes('fatiha'), 'Must contain Surah Al-Fatiha');
  assert.ok(ids.includes('ayatul-kursi'), 'Must contain Ayatul Kursi (Al-Baqarah 255)');
  assert.ok(ids.includes('baqarah-last-3'), 'Must contain Surah Al-Baqarah last 3 verses');
  assert.ok(ids.includes('alam-nashrah'), 'Must contain Surah Ash-Sharh / Alam Nashrah');
  assert.ok(ids.includes('kafirun'), 'Must contain Surah Al-Kafirun');
  assert.ok(ids.includes('ikhlas'), 'Must contain Surah Al-Ikhlas');
  assert.ok(ids.includes('falaq'), 'Must contain Surah Al-Falaq');
  assert.ok(ids.includes('nas'), 'Must contain Surah An-Nas');
  assert.ok(ids.includes('hashr-last-3'), 'Must contain Surah Al-Hashr last 3 verses');
});

test('2. Every Qurani Amal item contains full Hadith virtues, timing, and rules of recitation', () => {
  for (const item of QURANI_AMAL_ITEMS) {
    assert.ok(item.titleBn && item.titleBn.length > 0, `Item ${item.id} has titleBn`);
    assert.ok(item.titleAr && item.titleAr.length > 0, `Item ${item.id} has titleAr`);
    assert.ok(item.timingBadge && item.timingBadge.length > 0, `Item ${item.id} has timingBadge`);
    assert.ok(item.repetition && item.repetition.length > 0, `Item ${item.id} has repetition`);
    assert.ok(item.virtueSummary && item.virtueSummary.length > 0, `Item ${item.id} has virtueSummary`);
    assert.ok(item.virtueDetails && item.virtueDetails.length > 20, `Item ${item.id} has Hadith proofs`);
    assert.ok(item.virtueAudioText && item.virtueAudioText.length > 10, `Item ${item.id} has virtueAudioText`);
    assert.ok(item.rulesOfRecitation && item.rulesOfRecitation.length > 10, `Item ${item.id} has rulesOfRecitation`);
    assert.ok(Array.isArray(item.verses) && item.verses.length > 0, `Item ${item.id} has verses`);

    for (const v of item.verses) {
      assert.ok(v.arabic && v.arabic.length > 0, `Item ${item.id} Ayah ${v.ayahNumber} has arabic`);
      assert.ok(v.transliteration && v.transliteration.length > 0, `Item ${item.id} Ayah ${v.ayahNumber} has transliteration`);
      assert.ok(v.bengali && v.bengali.length > 0, `Item ${item.id} Ayah ${v.ayahNumber} has bengali translation`);
    }
  }
});

test('3. Authentic Qari Audio URLs resolve accurately for EveryAyah CDN', () => {
  // Test Al-Fatiha Ayah 1 with Alafasy
  const fatihaUrl = getQariAudioUrl('alafasy', 1, 1);
  assert.match(fatihaUrl, /everyayah\.com\/data\/Alafasy_128kbps\/001001\.mp3/);

  // Test Ayatul Kursi (2:255) with Husary
  const kursiUrl = getQariAudioUrl('husary_muallim', 2, 255);
  assert.match(kursiUrl, /everyayah\.com\/data\/Husary_Muallim_128kbps\/002255\.mp3/);

  // Test Baqarah 286 with Abdul Basit
  const baqarahLastUrl = getQariAudioUrl('abdul_basit', 2, 286);
  assert.match(baqarahLastUrl, /everyayah\.com\/data\/Abdul_Basit_Murattal_192kbps\/002286\.mp3/);

  // Test Hashr 24 (59:24) with Minshawi
  const hashrLastUrl = getQariAudioUrl('minshawy_teacher', 59, 24);
  assert.match(hashrLastUrl, /everyayah\.com\/data\/Minshawy_Teacher_128kbps\/059024\.mp3/);
});

test('4. QuranStudioPage card order matches exact user requirement', () => {
  const content = fs.readFileSync('src/features/site/pages/QuranStudioPage.jsx', 'utf8');

  // Verify learning-tajweed card order:
  // Card 1: quran-reader
  // Card 2: quran-search
  // Card 3: qurani-amal
  const categoryMatch = content.match(/titleBn:\s*"ইলম ও তাজবীদ"[\s\S]*?cards:\s*\[([\s\S]*?)\]/);
  assert.ok(categoryMatch, 'Found learning-tajweed category in QuranStudioPage');

  const cardsSnippet = categoryMatch[1];
  const cardIdMatches = [...cardsSnippet.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);

  assert.equal(cardIdMatches[0], 'quran-reader', 'Card 1 must be quran-reader (সম্পূর্ণ কুরআন)');
  assert.equal(cardIdMatches[1], 'quran-search', 'Card 2 must be quran-search (কুরআন সার্চ)');
  assert.equal(cardIdMatches[2], 'qurani-amal', 'Card 3 must be qurani-amal (কুরআনী আমল)');
});

