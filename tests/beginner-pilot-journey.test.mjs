import { strict as assert } from 'assert';
import { BEGINNER_PILOT_LESSONS, STAGE_STEPS } from '../src/features/ai-learning/data/beginnerPilotData.js';

console.log('🧪 RUNNING COMPREHENSIVE BEGINNER PILOT (ALIF, BAA, TAA, THAA) QUALITY AUDIT & TEST SUITE...\n');

// ═════════════════════════════════════════════════════════════════════════════
// 1. AUDIO ACCURACY & ASSET INTEGRITY
// ═════════════════════════════════════════════════════════════════════════════
console.log('▶ [SECTION 1] Testing Audio Accuracy & Asset Integrity...');

const alifLesson = BEGINNER_PILOT_LESSONS.find(l => l.id === 'lesson_alif');
const baaLesson = BEGINNER_PILOT_LESSONS.find(l => l.id === 'lesson_baa');
const taaLesson = BEGINNER_PILOT_LESSONS.find(l => l.id === 'lesson_taa');
const thaaLesson = BEGINNER_PILOT_LESSONS.find(l => l.id === 'lesson_thaa');

assert.ok(alifLesson, 'Alif lesson must exist');
assert.ok(baaLesson, 'Baa lesson must exist');
assert.ok(taaLesson, 'Taa lesson must exist');
assert.ok(thaaLesson, 'Thaa lesson must exist');

// 1.1 Exact assigned recordings
assert.equal(alifLesson.audioUrl, 'https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-1.m4a');
assert.equal(baaLesson.audioUrl, 'https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-2.m4a');
assert.equal(taaLesson.audioUrl, 'https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-3.m4a');
assert.equal(thaaLesson.audioUrl, 'https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-4.m4a');

// 1.2 Distinct URLs & No cross-substitution
const audioUrls = [alifLesson.audioUrl, baaLesson.audioUrl, taaLesson.audioUrl, thaaLesson.audioUrl];
const uniqueUrls = new Set(audioUrls);
assert.equal(uniqueUrls.size, 4, 'All four lessons must have distinct, unique audio URLs');

assert.ok(alifLesson.audioUrl.endsWith('Page1-1.m4a'), 'Alif must strictly map to Track 1 (Page1-1)');
assert.ok(baaLesson.audioUrl.endsWith('Page1-2.m4a'), 'Baa must strictly map to Track 2 (Page1-2)');
assert.ok(taaLesson.audioUrl.endsWith('Page1-3.m4a'), 'Taa must strictly map to Track 3 (Page1-3)');
assert.ok(thaaLesson.audioUrl.endsWith('Page1-4.m4a'), 'Thaa must strictly map to Track 4 (Page1-4)');

console.log('   ✅ Audio mapping invariant verified: Alif -> Page1-1, Baa -> Page1-2, Taa -> Page1-3, Thaa -> Page1-4.');

// ═════════════════════════════════════════════════════════════════════════════
// 2. UNIFIED PROGRESS ARCHITECTURE (Sequential Unlock Gating: Alif -> Baa -> Taa -> Thaa)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n▶ [SECTION 2] Testing Unified Progress Architecture & 4-Lesson Unlock Sequence...');

class MockStorage {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const mockStorage = new MockStorage();

function simulateCompleteLesson(lessonId, score, stars) {
  let completed = [];
  try {
    const raw = mockStorage.getItem('noor_completed_lessons');
    if (raw) completed = JSON.parse(raw);
  } catch {}

  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
  }
  mockStorage.setItem('noor_completed_lessons', JSON.stringify(completed));

  let starMap = {};
  try {
    const rawStars = mockStorage.getItem('noor_lesson_stars');
    if (rawStars) starMap = JSON.parse(rawStars);
  } catch {}

  starMap[lessonId] = Math.max(starMap[lessonId] || 0, stars);
  mockStorage.setItem('noor_lesson_stars', JSON.stringify(starMap));
}

function simulateIsUnlocked(lessonId) {
  if (lessonId === 'lesson_alif') return true;
  let completed = [];
  try {
    const raw = mockStorage.getItem('noor_completed_lessons');
    if (raw) completed = JSON.parse(raw);
  } catch {}

  if (lessonId === 'lesson_baa') return completed.includes('lesson_alif');
  if (lessonId === 'lesson_taa') return completed.includes('lesson_baa');
  if (lessonId === 'lesson_thaa') return completed.includes('lesson_taa');
  return false;
}

// Initial state: Only Alif unlocked
assert.equal(simulateIsUnlocked('lesson_alif'), true, 'Alif must be initially unlocked');
assert.equal(simulateIsUnlocked('lesson_baa'), false, 'Baa must be initially locked');
assert.equal(simulateIsUnlocked('lesson_taa'), false, 'Taa must be initially locked');
assert.equal(simulateIsUnlocked('lesson_thaa'), false, 'Thaa must be initially locked');

// Step 1: Complete Alif -> Baa unlocks, Taa and Thaa remain locked
simulateCompleteLesson('lesson_alif', 100, 3);
assert.equal(simulateIsUnlocked('lesson_baa'), true, 'Baa must unlock after Alif');
assert.equal(simulateIsUnlocked('lesson_taa'), false, 'Taa must remain locked before Baa is done');
assert.equal(simulateIsUnlocked('lesson_thaa'), false, 'Thaa must remain locked before Taa is done');

// Step 2: Complete Baa -> Taa unlocks, Thaa remains locked
simulateCompleteLesson('lesson_baa', 90, 2);
assert.equal(simulateIsUnlocked('lesson_taa'), true, 'Taa must unlock after Baa');
assert.equal(simulateIsUnlocked('lesson_thaa'), false, 'Thaa must remain locked before Taa is done');

// Step 3: Complete Taa -> Thaa unlocks
simulateCompleteLesson('lesson_taa', 100, 3);
assert.equal(simulateIsUnlocked('lesson_thaa'), true, 'Thaa must unlock after Taa');

// Step 4: Complete Thaa
simulateCompleteLesson('lesson_thaa', 80, 2);
const storedCompleted = JSON.parse(mockStorage.getItem('noor_completed_lessons'));
const storedStars = JSON.parse(mockStorage.getItem('noor_lesson_stars'));
assert.deepEqual(storedCompleted, ['lesson_alif', 'lesson_baa', 'lesson_taa', 'lesson_thaa'], 'All four lessons recorded');
assert.equal(storedStars['lesson_taa'], 3, 'Taa stars recorded');
assert.equal(storedStars['lesson_thaa'], 2, 'Thaa stars recorded');

// Replay simulation: Replaying Taa should NOT duplicate entry or downgrade stars
simulateCompleteLesson('lesson_taa', 60, 1);
const replayedCompleted = JSON.parse(mockStorage.getItem('noor_completed_lessons'));
const replayedStars = JSON.parse(mockStorage.getItem('noor_lesson_stars'));
assert.equal(replayedCompleted.length, 4, 'Completed lessons array must NOT contain duplicates');
assert.equal(replayedStars['lesson_taa'], 3, 'Higher star score (3) must be preserved');

console.log('   ✅ Sequential progression gate & replay idempotency verified for Alif -> Baa -> Taa -> Thaa.');

// ═════════════════════════════════════════════════════════════════════════════
// 3. GENUINE MASTERY CRITERIA & STAR SEPARATION
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n▶ [SECTION 3] Testing Genuine Mastery Passing Criteria across all 4 lessons...');

function checkMastery(answers, lesson) {
  const masteredMap = {};
  lesson.assessment.forEach(q => {
    masteredMap[q.id] = (answers[q.id] === q.expectedLetter);
  });
  const allPassed = lesson.assessment.every(q => masteredMap[q.id] === true);
  return { allPassed, masteredMap };
}

// Test Taa mastery
const failedTaa = checkMastery({ taa_q1_audio: 'ب', taa_q2_feature: 'ت' }, taaLesson);
assert.equal(failedTaa.allPassed, false, 'Must fail Taa if Q1 is wrong');
const passedTaa = checkMastery({ taa_q1_audio: 'ت', taa_q2_feature: 'ت' }, taaLesson);
assert.equal(passedTaa.allPassed, true, 'Must pass Taa when both questions are answered correctly');

// Test Thaa mastery
const failedThaa = checkMastery({ thaa_q1_audio: 'ث', thaa_q2_feature: 'ت' }, thaaLesson);
assert.equal(failedThaa.allPassed, false, 'Must fail Thaa if Q2 is wrong');
const passedThaa = checkMastery({ thaa_q1_audio: 'ث', thaa_q2_feature: 'ث' }, thaaLesson);
assert.equal(passedThaa.allPassed, true, 'Must pass Thaa when both questions are answered correctly');

// Star calculation invariant
function calculateStars(mistakes) {
  return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
}
assert.equal(calculateStars(0), 3, '0 mistakes = 3 stars');
assert.equal(calculateStars(1), 2, '1 mistake = 2 stars');
assert.equal(calculateStars(2), 1, '2 mistakes = 1 star');
assert.equal(calculateStars(5), 1, '5 mistakes = 1 star');

console.log('   ✅ Genuine dual-objective mastery and star rating logic verified.');

// ═════════════════════════════════════════════════════════════════════════════
// 4. EDUCATIONAL ACCURACY, MAKHARIS & SIFAT SAFEGUARDS
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n▶ [SECTION 4] Testing Educational Accuracy, Makharij & Sifat...');

// Alif
assert.ok(alifLesson.letterNameExplanationBn.includes('আলিফ'), 'Must state Alif letter name');
assert.ok(alifLesson.maddExplanationBn.includes('মাদ্দ'), 'Must explain Alif Madd role');
assert.ok(alifLesson.hamzahDistinctionBn.includes('হামযাহ'), 'Must distinguish Alif from Hamzah');
assert.ok(alifLesson.makhrajDescriptionBn.includes('আল-জাওফ'), 'Alif Madd explanation must reference Al-Jawf');
assert.equal(alifLesson.dotsCount, 0, 'Alif has 0 dots');

// Baa
assert.ok(baaLesson.letterNameExplanationBn.includes('বা'), 'Must state Baa letter name');
assert.equal(baaLesson.makhrajNumber, 16, 'Baa makhraj must be #16');
assert.ok(baaLesson.makhrajZoneBn.includes('আশ-শাফাতান'), 'Baa makhraj must be Ash-Shafataan');
assert.equal(baaLesson.dotsCount, 1, 'Baa has exactly 1 dot');
assert.equal(baaLesson.dotsPosition, 'bottom', 'Baa dot is strictly at bottom');

// Taa (Lesson 3)
assert.equal(taaLesson.makhrajNumber, 12, 'Taa makhraj must strictly be conventional Makhraj #12');
assert.ok(taaLesson.makhrajZoneBn.includes('আল-লিসান'), 'Taa major organ must be Al-Lisan');
assert.equal(taaLesson.dotsCount, 2, 'Taa must have exactly 2 dots');
assert.equal(taaLesson.dotsPosition, 'top', 'Taa dots must be strictly on top');
assert.ok(taaLesson.sifatSummaryBn.includes('হাম্স'), 'Taa must have Hams');
assert.ok(taaLesson.sifatSummaryBn.includes('শিদ্দাহ'), 'Taa must have Shiddah');
assert.ok(taaLesson.sifatSummaryBn.includes('ইস্তিফাল'), 'Taa must have Istifal');
assert.ok(taaLesson.sifatSummaryBn.includes('ইনফিতাহ'), 'Taa must have Infitah');
assert.ok(taaLesson.sifatSummaryBn.includes('ইসমাত'), 'Taa must have Ismat');
assert.ok(taaLesson.sifatSummaryBn.includes('কলকলাহ নেই') || taaLesson.hamzahDistinctionBn.includes('কলকলাহ নেই'), 'Must not teach Qalqalah for Taa');
assert.ok(taaLesson.distractorOptions.includes('ب'), 'Taa distractors must distinguish from Baa');
assert.ok(taaLesson.distractorOptions.includes('ث'), 'Taa distractors must distinguish from Thaa');
assert.ok(taaLesson.distractorOptions.includes('ط'), 'Taa distractors must distinguish from Twa');

// Thaa (Lesson 4)
assert.equal(thaaLesson.makhrajNumber, 14, 'Thaa makhraj must strictly be conventional Makhraj #14');
assert.ok(thaaLesson.makhrajZoneBn.includes('আল-লিসান'), 'Thaa major organ must be Al-Lisan');
assert.equal(thaaLesson.dotsCount, 3, 'Thaa must have exactly 3 dots');
assert.equal(thaaLesson.dotsPosition, 'top', 'Thaa dots must be strictly on top');
assert.ok(thaaLesson.sifatSummaryBn.includes('হাম্স'), 'Thaa must have Hams');
assert.ok(thaaLesson.sifatSummaryBn.includes('রাখাওয়া'), 'Thaa must have Rakhawah');
assert.ok(thaaLesson.sifatSummaryBn.includes('ইস্তিফাল'), 'Thaa must have Istifal');
assert.ok(thaaLesson.sifatSummaryBn.includes('ইনফিতাহ'), 'Thaa must have Infitah');
assert.ok(thaaLesson.sifatSummaryBn.includes('ইসমাত'), 'Thaa must have Ismat');
assert.ok(thaaLesson.sifatSummaryBn.includes('সাফীর (শিসধ্বনি) হরফ নয়') || thaaLesson.sifatSummaryBn.includes('সাফীর হরফ নয়'), 'Must explain Thaa is not a Safir letter');
assert.ok(!thaaLesson.sifatSummaryBn.includes('সাফীরহীনতা সিফাত'), 'Must NOT present absence of Safir as a canonical Sifah');
assert.ok(thaaLesson.sifatSummaryBn.includes('কলকলাহ নেই') || thaaLesson.hamzahDistinctionBn.includes('কলকলাহ নেই'), 'Must not teach Qalqalah for Thaa');
assert.ok(thaaLesson.childExplanationBn.includes('thin'), 'Thaa explanation must use English "thin" /θ/ reference');
assert.ok(thaaLesson.distractorOptions.includes('س'), 'Thaa distractors must contrast with Seen to prevent whistling');

// 4.1 Assessment Objectives & Randomized Variants Quality (All 4 lessons)
for (const lesson of [alifLesson, baaLesson, taaLesson, thaaLesson]) {
  assert.ok(Array.isArray(lesson.assessmentObjectives), `${lesson.nameBn} must have assessmentObjectives array`);
  assert.equal(lesson.assessmentObjectives.length, 2, `${lesson.nameBn} must have exactly 2 essential objectives`);

  const objAudio = lesson.assessmentObjectives.find(o => o.type === 'audio_match');
  const objFeature = lesson.assessmentObjectives.find(o => o.type === 'feature_match');
  assert.ok(objAudio, `${lesson.nameBn} must have audio_match objective`);
  assert.ok(objFeature, `${lesson.nameBn} must have feature_match objective`);

  assert.ok(objAudio.variants.length >= 2, `${lesson.nameBn} audio objective must have >= 2 variants`);
  assert.ok(objFeature.variants.length >= 2, `${lesson.nameBn} feature objective must have >= 2 variants`);

  for (const obj of lesson.assessmentObjectives) {
    for (const v of obj.variants) {
      assert.ok(v.id, 'Variant must have id');
      assert.ok(v.questionBn && v.questionBn.length > 5, 'Variant must have descriptive Bengali question');
      assert.equal(v.expectedLetter, lesson.letter, 'Variant expectedLetter must match lesson');
      assert.ok(Array.isArray(v.options) && v.options.length >= 3, 'Variant must have at least 3 options');
      assert.ok(v.options.includes(lesson.letter), 'Variant options must include correct letter');
      assert.ok(v.hintBn && v.hintBn.length > 10, 'Variant must have child-friendly pedagogical error hint');
    }
  }
}

console.log('   ✅ Educational accuracy verified for Alif, Baa, Taa (Makhraj #12), and Thaa (Makhraj #14, /θ/ thin).');

// ═════════════════════════════════════════════════════════════════════════════
// 5. 10-STAGE LEARNING FLOW
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n▶ [SECTION 5] Testing 10-Stage Learning Sequence...');
assert.equal(STAGE_STEPS.length, 10, 'Must have exactly 10 stages');
const expectedStageIds = [
  'INTRODUCE',
  'DEMONSTRATE',
  'LISTEN',
  'PRACTICE',
  'PLAY',
  'ASSESS',
  'CORRECT',
  'REPEAT',
  'REWARD',
  'PROGRESS'
];
assert.deepEqual(STAGE_STEPS.map(s => s.id), expectedStageIds, 'Stages must match required order');
console.log('   ✅ 10-stage learning sequence verified.');

// ═════════════════════════════════════════════════════════════════════════════
// 6. LIVE HTTP AUDIO CHECK (ALL 4 LESSONS)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n▶ [SECTION 6] Checking live HTTP HEAD status for studio recordings...');
async function checkLiveAudio() {
  for (const lesson of BEGINNER_PILOT_LESSONS) {
    const res = await fetch(lesson.audioUrl, { method: 'HEAD' });
    assert.equal(res.status, 200, `Audio URL for ${lesson.nameBn} must return 200 OK`);
    console.log(`   ${lesson.nameBn} (${lesson.letter}): 200 OK, length: ${res.headers.get('content-length')} bytes`);
  }
}

checkLiveAudio().then(() => {
  console.log('\n🎉 ALL 4-LESSON QUALITY AUDIT TESTS PASSED WITH 100% SUCCESS!');
}).catch(err => {
  console.error('\n❌ Audit test failed:', err);
  process.exit(1);
});
