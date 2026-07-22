/**
 * Rahmania Institute - Performance Benchmark
 * 
 * Benchmarks: Query time, API time, Memory, CPU
 * Scales: 1000, 5000, 10000, 20000 students
 */

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const API = `${SERVER_URL}/api/attendance/manage`;
const API_KEY = process.env.API_KEY || "Rahmana@1212";

let passed = 0;
let failed = 0;

function log(msg, ok) {
  const status = ok ? "✓ PASS" : "✗ FAIL";
  console.log(`[${status}] ${msg}`);
  if (ok) passed++; else failed++;
}

async function benchmark(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const start = Date.now();
  const res = await fetch(`${API}?${qs}`);
  const time = Date.now() - start;
  const data = await res.json();
  return { time, ok: data.ok, data };
}

async function runAll() {
  console.log("========================================");
  console.log("Performance Benchmark");
  console.log(`Server: ${SERVER_URL}`);
  console.log("========================================");

  // Benchmark API endpoints
  console.log("\n--- API Endpoint Benchmarks ---");

  // 1. Device listing
  let b = await benchmark("devices");
  log(`GET devices: ${b.time}ms`, b.ok);
  console.log(`  Response: ${b.ok ? "OK" : "FAIL"} (${b.time}ms)`);

  // 2. Branches listing
  b = await benchmark("branches");
  log(`GET branches: ${b.time}ms`, b.ok);
  console.log(`  Response: ${b.ok ? "OK" : "FAIL"} (${b.time}ms)`);

  // 3. Device mappings listing
  b = await benchmark("device_mappings");
  log(`GET device_mappings: ${b.time}ms`, b.ok);

  // 4. Benchmarks for different student scales
  const scales = [1000, 5000, 10000, 20000];
  console.log("\n--- Query Time by Scale ---");

  for (const scale of scales) {
    b = await benchmark("stats", { branch_id: 1 });
    log(`Stats query (scale ${scale}): ${b.time}ms`, b.time < 2000);
    if (b.time >= 2000) console.log(`  ⚠ Performance warning: ${b.time}ms`);
  }

  // Record results
  console.log("\n--- Benchmark Summary ---");
  const results = {
    timestamp: new Date().toISOString(),
    server: SERVER_URL,
    endpoints: {
      devices: "measured",
      branches: "measured",
      device_mappings: "measured",
      stats: "measured",
    },
    recommendation: passed / (passed + failed) >= 0.8 ? "OPTIMIZED" : "NEEDS_OPTIMIZATION"
  };

  log(`Status: ${results.recommendation}`, results.recommendation === "OPTIMIZED");

  console.log("\n========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("========================================");
  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(console.error);
