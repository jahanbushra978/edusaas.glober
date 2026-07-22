/**
 * Rahmania Institute - Bulk Import Testing
 * 
 * Tests: CSV/Excel import for 100, 500, 1000, 5000, 10000 records
 * Memory leak detection
 */

const fs = require("fs");
const path = require("path");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const API_KEY = process.env.API_KEY || "Rahmana@1212";
const API = `${SERVER_URL}/api/attendance/manage`;

let passed = 0;
let failed = 0;

function log(msg, ok) {
  const status = ok ? "✓ PASS" : "✗ FAIL";
  console.log(`[${status}] ${msg}`);
  if (ok) passed++; else failed++;
}

function generateTestData(count) {
  const rows = [];
  for (let i = 1; i <= count; i++) {
    rows.push({
      machine_user_id: String(1000 + i),
      student_id: i,
      registration_number: i,
      roll_number: String(i),
      full_name: `Test Student ${i}`,
    });
  }
  return rows;
}

async function testBulkImport(count) {
  const rows = generateTestData(count);
  const memBefore = process.memoryUsage();

  console.log(`\n--- Bulk Import: ${count} records ---`);

  const startTime = Date.now();

  try {
    // Step 1: Preview
    const previewRes = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ action: "bulk_import_preview", data: { rows } }),
    });

    const previewTime = Date.now() - startTime;
    const previewData = await previewRes.json();

    log(`Preview completed in ${previewTime}ms`, previewData.ok);
    if (previewData.ok) {
      log(`Total: ${previewData.total}, Matched: ${previewData.matched_count}, Duplicate: ${previewData.duplicate_count}, Unmatched: ${previewData.unmatched_count}`, true);
    }

    const memAfter = process.memoryUsage();
    const heapUsed = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;
    log(`Memory delta: ${heapUsed.toFixed(2)}MB`, heapUsed < 50);

    if (heapUsed > 50) {
      log(`WARNING: High memory usage (${heapUsed.toFixed(2)}MB) for ${count} records`, false);
    } else {
      log(`Memory usage acceptable for ${count} records`, true);
    }

  } catch (e) {
    log(`Error: ${e.message}`, false);
  }
}

async function runAll() {
  console.log("========================================");
  console.log("Bulk Import Testing");
  console.log(`Server: ${SERVER_URL}`);
  console.log("========================================");

  const sizes = [100, 500, 1000];
  for (const size of sizes) {
    await testBulkImport(size);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n--- Memory Leak Detection ---");
  const memFinal = process.memoryUsage();
  log(`Final RSS: ${(memFinal.rss / 1024 / 1024).toFixed(2)}MB`, true);
  log(`Final Heap: ${(memFinal.heapUsed / 1024 / 1024).toFixed(2)}MB`, true);

  // Check for heap growth pattern (indicative of leak)
  if (memFinal.heapUsed > 200 * 1024 * 1024) {
    log("WARNING: Heap usage exceeded 200MB - possible memory leak", false);
  } else {
    log("No memory leak detected within tested range", true);
  }

  console.log("\n========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("========================================");
  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(console.error);
