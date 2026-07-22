// ============================================================
// Rahmania Institute - Biometric Bridge Service
// ZKTeco K40 Attendance Bridge
// Connects local biometric device to Next.js API
// ============================================================

const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const { EventEmitter } = require("events");

// ── Configuration ──
const ENV_PATH = path.join(__dirname, ".env");

function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  } catch {
    console.warn("[WARN] No .env file found. Using defaults.");
  }
  return env;
}

const ENV = loadEnv();

const hostname = os.hostname().toLowerCase().replace(/[^a-z0-9-]/g, "-");
const defaultBridgeId = `bridge-${hostname}`;

const CONFIG = {
  bridgeId: ENV.BRIDGE_ID || defaultBridgeId,
  computerName: ENV.COMPUTER_NAME || hostname,
  softwareVersion: ENV.SOFTWARE_VERSION || "1.1.0",
  deviceIp: ENV.DEVICE_IP || "192.168.1.100",
  devicePort: parseInt(ENV.DEVICE_PORT || "4370", 10),
  deviceSerial: ENV.DEVICE_SERIAL || `K40-${ENV.DEVICE_IP || "unknown"}`.replace(/\./g, "-"),
  branchId: parseInt(ENV.BRANCH_ID || "0", 10),
  serverUrl: (ENV.SERVER_URL || "http://localhost:3000").replace(/\/+$/, ""),
  apiKey: ENV.API_KEY || "Rahmana@1212",
  pollIntervalMs: parseInt(ENV.POLL_INTERVAL_MS || "5000", 10),
  batchSize: parseInt(ENV.BATCH_SIZE || "50", 10),
  logLevel: ENV.LOG_LEVEL || "info",
};

// ── Logger ──
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[CONFIG.logLevel] ?? 2;

const LOG_FILE = path.join(__dirname, "bridge.log");

function log(level, message, data) {
  if (LOG_LEVELS[level] === undefined || LOG_LEVELS[level] > currentLevel) return;
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? " " + JSON.stringify(data) : ""}`;
  console.log(entry);
  try {
    fs.appendFileSync(LOG_FILE, entry + "\n");
  } catch {}
}

// ── Queue for offline support ──
const QUEUE_FILE = path.join(__dirname, "offline_queue.json");

class OfflineQueue {
  constructor() {
    this.queue = [];
    this._load();
  }

  _load() {
    try {
      const data = fs.readFileSync(QUEUE_FILE, "utf-8");
      this.queue = JSON.parse(data);
      log("info", `Loaded ${this.queue.length} queued items from disk`);
    } catch {
      this.queue = [];
    }
  }

  _save() {
    try {
      fs.writeFileSync(QUEUE_FILE, JSON.stringify(this.queue));
    } catch (err) {
      log("error", "Failed to save queue", err.message);
    }
  }

  enqueue(items) {
    if (!Array.isArray(items)) items = [items];
    this.queue.push(...items);
    this._save();
    log("info", `Queued ${items.length} items (total queue: ${this.queue.length})`);
  }

  dequeue(count) {
    const batch = this.queue.splice(0, count);
    this._save();
    return batch;
  }

  get length() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
    this._save();
  }
}

// ── HTTP Client for sending data to API ──
async function sendToServer(endpoint, payload) {
  const url = `${CONFIG.serverUrl}${endpoint}`;
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.apiKey,
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}

// ── Heartbeat sender ──
async function sendHeartbeat(bridgeId, deviceSerial, branchId, computerName, softwareVersion) {
  try {
    const result = await sendToServer("/api/attendance/manage", {
      action: "heartbeat",
      data: {
        bridge_id: bridgeId,
        device_serial: deviceSerial,
        ip_address: CONFIG.deviceIp,
        status: "online",
        branch_id: branchId,
        computer_name: computerName,
        software_version: softwareVersion,
      },
    });
    log("debug", "Heartbeat sent", result);
    return result;
  } catch (err) {
    log("warn", "Heartbeat failed", err.message);
    return null;
  }
}

// ── Attendance push ──
async function sendAttendance(attendanceBatch) {
  try {
    const result = await sendToServer("/api/attendance/device", attendanceBatch);
    log("info", `Sent ${attendanceBatch.length} attendance records`);
    return result;
  } catch (err) {
    log("error", "Failed to send attendance", err.message);
    throw err;
  }
}

// ── Device Communications (ZKTeco UDP Protocol Emulation) ──
class DeviceConnector extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.lastPunchTime = null;
    this.lastSeenPunches = new Map();
    this._buffer = [];
    this._punchRetentionMs = 120000;
  }

  connect() {
    log("info", `Connecting to device at ${CONFIG.deviceIp}:${CONFIG.devicePort}...`);

    // For ZKTeco K40, we attempt a TCP connection
    const socket = new http.Agent({
      keepAlive: true,
      maxSockets: 1,
    });

    const req = http.request(
      {
        hostname: CONFIG.deviceIp,
        port: CONFIG.devicePort,
        path: "/",
        method: "GET",
        agent: socket,
        timeout: 3000,
      },
      (res) => {
        this.connected = true;
        log("info", `Device connected (HTTP ${res.statusCode})`);
        this.emit("connected");
        res.on("data", () => {});
        res.on("end", () => {
          log("debug", "Device response ended");
        });
      }
    );

    req.on("error", (err) => {
      this.connected = false;
      log("warn", `Device connection failed: ${err.code || err.message}`);
      this.emit("disconnected");
    });

    req.on("timeout", () => {
      req.destroy();
      this.connected = false;
      log("warn", "Device connection timeout");
      this.emit("disconnected");
    });

    req.end();
  }

  isConnected() {
    return this.connected;
  }

  // Read attendance from device (simulated for SDK-less operation)
  // In production, replace with actual ZKTeco SDK calls or ADMS protocol
  async readAttendance() {
    if (!this.connected) {
      log("debug", "Cannot read attendance: device not connected");
      return [];
    }

    // Simulated attendance read
    // Replace this with actual ZKTeco SDK command when available
    log("debug", "Polling device for new attendance...");
    return [];
  }
}

// ── Main Bridge Application ──
class BiometricBridge {
  constructor() {
    this.device = new DeviceConnector();
    this.queue = new OfflineQueue();
    this.heartbeatInterval = null;
    this.pollInterval = null;
    this.syncInterval = null;
    this.healthCheckInterval = null;
    this.bridgeId = CONFIG.bridgeId;
    this.deviceSerial = CONFIG.deviceSerial;
    this.branchId = CONFIG.branchId;
    this.computerName = CONFIG.computerName;
    this.softwareVersion = CONFIG.softwareVersion;
    this.startTime = new Date();
    this.stats = {
      totalPunches: 0,
      totalSent: 0,
      totalFailed: 0,
      totalQueued: 0,
      totalSynced: 0,
    };
  }

  async start() {
    log("info", "========================================");
    log("info", "Rahmania Institute - Biometric Bridge");
    log("info", `Bridge ID: ${this.bridgeId}`);
    log("info", `Computer: ${this.computerName}`);
    log("info", `Device: ${this.deviceSerial} @ ${CONFIG.deviceIp}:${CONFIG.devicePort}`);
    log("info", `Branch ID: ${this.branchId}`);
    log("info", `Version: ${this.softwareVersion}`);
    log("info", `Server URL: ${CONFIG.serverUrl}`);
    log("info", `Poll Interval: ${CONFIG.pollIntervalMs}ms`);
    log("info", `Batch Size: ${CONFIG.batchSize}`);
    log("info", "========================================");

    // Step 1: Connect to device
    this.device.connect();

    // Step 2: Start periodic polling for attendance
    this.pollInterval = setInterval(() => this._pollDevice(), CONFIG.pollIntervalMs);

    // Step 3: Send heartbeat every 60 seconds
    this.heartbeatInterval = setInterval(() => this._sendHeartbeat(), 60000);

    // Step 4: Try to sync offline queue every 30 seconds
    this.syncInterval = setInterval(() => this._syncQueue(), 30000);

    // Step 5: Health check and reconnection every 10 seconds
    this.healthCheckInterval = setInterval(() => this._healthCheck(), 10000);

    // Step 6: Send initial heartbeat
    setTimeout(() => this._sendHeartbeat(), 1000);

    // Step 7: Sync any existing queue on startup
    setTimeout(() => this._syncQueue(), 5000);

    log("info", "Bridge started successfully");
  }

  async _pollDevice() {
    try {
      const punches = await this.device.readAttendance();

      if (!punches || punches.length === 0) return;

      // Filter out duplicate punches within the same minute
      const newPunches = punches.filter((p) => {
        const key = `${p.userId}-${p.timestamp}`;
        const now = Date.now();
        if (this.device.lastSeenPunches.has(key)) {
          const entry = this.device.lastSeenPunches.get(key);
          if (now - entry < this.device._punchRetentionMs) return false;
        }
        this.device.lastSeenPunches.set(key, now);

        // Evict entries older than retention period
        if (this.device.lastSeenPunches.size > 10000) {
          const cutoff = now - this.device._punchRetentionMs;
          for (const [k, t] of this.device.lastSeenPunches) {
            if (t < cutoff) this.device.lastSeenPunches.delete(k);
          }
        }
        return true;
      });

      if (newPunches.length === 0) return;

      this.stats.totalPunches += newPunches.length;
      log("info", `Found ${newPunches.length} new punches`);

      // Try to send immediately
      try {
        const result = await this._sendBatch(newPunches);
        if (result) {
          this.stats.totalSent += newPunches.length;
        }
      } catch {
        // If send fails, queue for later
        this.stats.totalQueued += newPunches.length;
        this.queue.enqueue(
          newPunches.map((p) => ({
            ...p,
            _queuedAt: new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      log("debug", "Poll error", err.message);
    }
  }

  async _sendBatch(punches) {
    const payload = {
      bridge_id: this.bridgeId,
      computer_name: this.computerName,
      branch_id: this.branchId,
      device_serial: this.deviceSerial,
      device_ip: CONFIG.deviceIp,
      punches: punches.map((p) => ({
        device_user_id: String(p.userId),
        punch_time: p.timestamp || new Date().toISOString(),
        punch_type: p.type || "in",
        verified: p.verified !== false,
      })),
    };

    return await sendAttendance(payload);
  }

  async _sendHeartbeat() {
    await sendHeartbeat(this.bridgeId, this.deviceSerial, this.branchId, this.computerName, this.softwareVersion);
  }

  async _syncQueue() {
    if (this.queue.length === 0) return;

    const batch = this.queue.dequeue(CONFIG.batchSize);
    log("info", `Syncing ${batch.length} queued items...`);

    try {
      await this._sendBatch(batch);
      this.stats.totalSynced += batch.length;
      log("info", `Synced ${batch.length} items successfully`);
    } catch (err) {
      log("error", "Sync failed, re-queueing", err.message);
      this.queue.enqueue(batch);
    }
  }

  async _healthCheck() {
    const wasConnected = this.device.isConnected();

    if (!wasConnected) {
      log("debug", "Attempting device reconnection...");
      this.device.connect();
    }
  }

  stop() {
    log("info", "Stopping bridge...");
    clearInterval(this.pollInterval);
    clearInterval(this.heartbeatInterval);
    clearInterval(this.syncInterval);
    clearInterval(this.healthCheckInterval);
    log("info", "Bridge stopped");
  }

  getStatus() {
    return {
      bridge_id: this.bridgeId,
      computer_name: this.computerName,
      software_version: this.softwareVersion,
      branch_id: this.branchId,
      device: {
        serial: this.deviceSerial,
        ip: CONFIG.deviceIp,
        port: CONFIG.devicePort,
        connected: this.device.isConnected(),
      },
      server: {
        url: CONFIG.serverUrl,
      },
      queue: {
        length: this.queue.length,
      },
      stats: this.stats,
      uptime: Math.floor((new Date() - this.startTime) / 1000),
    };
  }
}

// ── Startup ──
const bridge = new BiometricBridge();

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("info", "Shutting down...");
  bridge.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("info", "SIGTERM received");
  bridge.stop();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  log("error", "Uncaught exception", err.message);
});

process.on("unhandledRejection", (reason) => {
  log("error", "Unhandled rejection", String(reason));
});

// Simple HTTP status endpoint on port 3470 (localhost only)
const STATUS_PORT = 3470;
const statusServer = http.createServer((req, res) => {
  res.setHeader("Connection", "close");
  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(bridge.getStatus(), null, 2));
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Rahmania Biometric Bridge - Running");
  }
});

statusServer.timeout = 5000;
statusServer.headersTimeout = 3000;
statusServer.requestTimeout = 3000;

statusServer.listen(STATUS_PORT, "127.0.0.1", () => {
  log("info", `Status server listening on http://127.0.0.1:${STATUS_PORT}`);
});

// Start the bridge
bridge.start().catch((err) => {
  log("error", "Failed to start bridge", err.message);
  process.exit(1);
});
