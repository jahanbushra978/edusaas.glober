/**
 * Rahmania Institute - Load Testing
 * 
 * Tests: 100, 200, 500 concurrent student fingerprint processing
 */

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const API = `${SERVER_URL}/api/attendance/device`;
const API_KEY = process.env.API_KEY || "Rahmana@1212";
const DEVICE_SERIAL = process.env.DEVICE_SERIAL || "K40-TEST-001";

let passed = 0;
let failed = 0;

function log(msg, ok) {
  const status = ok ? "✓ PASS" : "✗ FAIL";
  console.log(`[${status}] ${msg}`);
  if (ok) passed++; else failed++;
}

function generatePunches(count) {
  return Array.from({ length: count }, (_, i) => ({
    device_serial: DEVICE_SERIAL,
    device_user_id: String(1000 + i),
    punch_time: new Date().toISOString(),
    punch_type: i % 2 === 0 ? "in" : "out",
    packet_id: `load-test-${Date.now()}-${i}`,
  }));
}

async function sendBatch(punches) {
  const start = Date.now();
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(punches),
    });
    const time = Date.now() - start;
    const data = await res.json();
    return { time, ok: res.ok, data };
  } catch (e) {
    return { time: Date.now() - start, ok: false, error: e.message };
  }
}

async function testLoad(concurrent) {
  console.log(`\n--- Load Test: ${concurrent} Concurrent Fingerprints ---`);

  const batchSize = Math.min(concurrent, 50);
  const batches = [];
  for (let i = 0; i < concurrent; i += batchSize) {
    const size = Math.min(batchSize, concurrent - i);
    batches.push(generatePunches(size));
  }

  const startTime = Date.now();
  const results = await Promise.all(batches.map(b => sendBatch(b)));
  const totalTime = Date.now() - startTime;

  const successCount = results.filter(r => r.ok).length;
  const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;
  const totalProcessed = results.reduce((s, r) => s + (r.data?.processed || 0), 0);

  log(`Total batches: ${batches.length}, Successful: ${successCount}/${batches.length}`, successCount === batches.length);
  log(`Total time: ${totalTime}ms, Avg batch: ${avgTime.toFixed(0)}ms`, totalTime < 30000);
  log(`Total processed: ${totalProcessed}`, totalProcessed === concurrent);

  if (totalTime > 10000) {
    console.log(`  ⚠ Performance note: ${totalTime}ms for ${concurrent} fingerprints`);
  }

  // Rate limit check
  if (results.some(r => r.data?.error === "rate_limit")) {
    log("Rate limiting triggered", true);
  }
}

async function runAll() {
  console.log("========================================");
  console.log("Load Testing - Concurrent Fingerprint Processing");
  console.log(`Server: ${SERVER_URL}`);
  console.log(`Device Serial: ${DEVICE_SERIAL}`);
  console.log("========================================");

  const loads = [100, 200, 500];
  for (const load of loads) {
    await testLoad(load);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("\n========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("========================================");
  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(console.error);
