const fs = require('fs');
const https = require('https');
const http = require('http');

async function testHead(url) {
  if (url.startsWith('/')) {
    const exists = fs.existsSync('public' + url);
    return { status: exists ? 200 : 404, ok: exists };
  }
  return new Promise(resolve => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, res => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', err => resolve({ status: 500, error: err.message, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 504, error: 'timeout', ok: false }); });
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 NUR QAIDA AUDIO ENGINE & MANIFEST VALIDATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const { NUR_QAIDA_MANIFEST, NUR_QAIDA_BY_ID, NUR_QAIDA_BY_AR } = await import('../src/lib/quran/audio/NurQaidaManifest.js');
  const { nurQaidaAudioEngine } = await import('../src/lib/quran/audio/NurQaidaAudioEngine.js');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Manifest Integrity ──
  console.log('TEST 1: Manifest Integrity & Uniqueness');
  assert(NUR_QAIDA_MANIFEST.length > 0, `Manifest loaded with ${NUR_QAIDA_MANIFEST.length} items`);
  assert(NUR_QAIDA_BY_ID.size === NUR_QAIDA_MANIFEST.length, `All ${NUR_QAIDA_MANIFEST.length} items have unique IDs (0 ID collisions)`);

  // ── TEST 2: Harakat Integrity & Distinctness ──
  console.log('\nTEST 2: Harakat Non-Substitution Invariant');
  const baaLetter = NUR_QAIDA_BY_ID.get('mufradat_2_baa');
  const baaZabar = NUR_QAIDA_BY_ID.get('harakat_ب_zabar');
  const baaZer = NUR_QAIDA_BY_ID.get('harakat_ب_zer');
  const baaPesh = NUR_QAIDA_BY_ID.get('harakat_ب_pesh');

  assert(baaLetter && baaLetter.candidateUrls.length > 0, 'Baa letter audio exists');
  assert(baaZabar && baaZabar.candidateUrls.length > 0, 'Baa Zabar audio exists');
  assert(baaZer && baaZer.candidateUrls.length > 0, 'Baa Zer audio exists');
  assert(baaPesh && baaPesh.candidateUrls.length > 0, 'Baa Pesh audio exists');

  // Verify Harakat does NOT equal Letter name!
  assert(baaZabar.candidateUrls[0] !== baaLetter.candidateUrls[0], 'Baa Zabar audio does NOT equal Baa letter name');
  assert(baaZer.candidateUrls[0] !== baaLetter.candidateUrls[0], 'Baa Zer audio does NOT equal Baa letter name');
  assert(baaPesh.candidateUrls[0] !== baaLetter.candidateUrls[0], 'Baa Pesh audio does NOT equal Baa letter name');
  assert(baaZabar.candidateUrls[0] !== baaZer.candidateUrls[0], 'Baa Zabar audio does NOT equal Baa Zer audio');

  // ── TEST 3: Collision Elimination: Thaa (ث) vs Zaal (ذ) ──
  console.log('\nTEST 3: Thaa (ث) vs Zaal (ذ) Collision Elimination');
  const thaaZabar = NUR_QAIDA_BY_ID.get('harakat_ث_zabar');
  const zaalZabar = NUR_QAIDA_BY_ID.get('harakat_ذ_zabar');
  assert(thaaZabar && zaalZabar, 'Both Thaa Zabar and Zaal Zabar entries exist');
  assert(thaaZabar.candidateUrls[0] !== zaalZabar.candidateUrls[0], 'Thaa Zabar audio does NOT equal Zaal Zabar audio');
  assert(thaaZabar.candidateUrls[0].includes('thaa'), `Thaa audio correctly points to Thaa recording: ${thaaZabar.candidateUrls[0]}`);
  assert(zaalZabar.candidateUrls[0].includes('Page8-37'), `Zaal audio correctly points to Page8-37: ${zaalZabar.candidateUrls[0]}`);

  // ── TEST 4: Engine Target Resolution ──
  console.log('\nTEST 4: NurQaidaAudioEngine Resolution Logic');
  const resBaaZabar = nurQaidaAudioEngine.resolveTarget('بَ');
  assert(resBaaZabar.id === 'harakat_ب_zabar', `resolveTarget("بَ") correctly resolves to ${resBaaZabar.id}`);
  assert(!resBaaZabar.urls[0].includes('Page1-2'), 'resolveTarget("بَ") does NOT return letter name Page1-2');

  const resThaaZabar = nurQaidaAudioEngine.resolveTarget('ثَ');
  assert(resThaaZabar.id === 'harakat_ث_zabar', `resolveTarget("ثَ") correctly resolves to ${resThaaZabar.id}`);
  assert(!resThaaZabar.urls[0].includes('Page8-37'), 'resolveTarget("ثَ") does NOT return Zaal audio');

  const resZaalZabar = nurQaidaAudioEngine.resolveTarget('ذَ');
  assert(resZaalZabar.id === 'harakat_ذ_zabar', `resolveTarget("ذَ") correctly resolves to ${resZaalZabar.id}`);

  // ── TEST 5: Sample URL Accessibility Check (HTTP 200) ──
  console.log('\nTEST 5: Remote & Local URL HTTP Accessibility (200 OK)');
  const sampleItems = [
    NUR_QAIDA_BY_ID.get('mufradat_1_alif'),
    NUR_QAIDA_BY_ID.get('mufradat_2_baa'),
    NUR_QAIDA_BY_ID.get('harakat_ب_zabar'),
    NUR_QAIDA_BY_ID.get('harakat_ث_zabar'),
    NUR_QAIDA_BY_ID.get('harakat_ذ_zabar'),
    NUR_QAIDA_BY_ID.get('sukoon_أَبْ'),
    NUR_QAIDA_BY_ID.get('sukoon_أَتْ'),
    NUR_QAIDA_BY_ID.get('madd_بَا'),
    NUR_QAIDA_BY_ID.get('murakkab_لَا'),
  ];

  for (const item of sampleItems) {
    if (!item) continue;
    const url = item.candidateUrls[0];
    const res = await testHead(url);
    assert(res.ok, `[HTTP ${res.status}] ${item.nameBn} (${item.ar}) -> ${url}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
