import { execSync } from "child_process";

/**
 * Pre-dev Lifecycle Script
 * Ensures port 3000 is clean and prevents zombie process collisions when starting `npm run dev`.
 */
try {
  if (process.platform === "win32") {
    const output = execSync("netstat -ano", { encoding: "utf8" });
    const lines = output.split("\n");
    const currentPid = process.pid;
    const pidsToKill = new Set();

    for (const line of lines) {
      if (line.includes(":3000") && line.includes("LISTENING")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0" && Number(pid) !== currentPid) {
          pidsToKill.add(pid);
        }
      }
    }

    for (const pid of pidsToKill) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`[predev] Cleaned lingering process PID ${pid} on port 3000.`);
      } catch {}
    }
  }
} catch {
  // Port is clean - proceed immediately
}
