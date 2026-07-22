// ============================================================
// Rahmania Institute - Centralized Logging System
// Separate loggers for: Device, Bridge, API, Attendance, Security
// ============================================================

const LOG_PREFIX = {
  device: "[DEVICE]",
  bridge: "[BRIDGE]",
  api: "[API]",
  attendance: "[ATTENDANCE]",
  security: "[SECURITY]",
};

function formatLog(level, category, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = LOG_PREFIX[category] || "[GENERAL]";
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}${dataStr}`;
}

function writeLog(level, category, message, data) {
  const entry = formatLog(level, category, message, data);
  if (process.env.NODE_ENV === "production") {
    console.log(entry);
  } else {
    switch (level) {
      case "error": console.error(entry); break;
      case "warn": console.warn(entry); break;
      default: console.log(entry);
    }
  }
}

export const logger = {
  device: {
    info: (msg, data) => writeLog("info", "device", msg, data),
    warn: (msg, data) => writeLog("warn", "device", msg, data),
    error: (msg, data) => writeLog("error", "device", msg, data),
  },
  bridge: {
    info: (msg, data) => writeLog("info", "bridge", msg, data),
    warn: (msg, data) => writeLog("warn", "bridge", msg, data),
    error: (msg, data) => writeLog("error", "bridge", msg, data),
  },
  api: {
    info: (msg, data) => writeLog("info", "api", msg, data),
    warn: (msg, data) => writeLog("warn", "api", msg, data),
    error: (msg, data) => writeLog("error", "api", msg, data),
  },
  attendance: {
    info: (msg, data) => writeLog("info", "attendance", msg, data),
    warn: (msg, data) => writeLog("warn", "attendance", msg, data),
    error: (msg, data) => writeLog("error", "attendance", msg, data),
  },
  security: {
    info: (msg, data) => writeLog("info", "security", msg, data),
    warn: (msg, data) => writeLog("warn", "security", msg, data),
    error: (msg, data) => writeLog("error", "security", msg, data),
  },
};
