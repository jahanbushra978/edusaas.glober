import { AUDIO_CONFIG } from "../src/lib/quran/audio/AudioConfig.js";
import { resolveLetterAudio, resolveAyahAudio } from "../src/lib/quran/audio/AudioSourceRegistry.js";

async function verifyAudioUrls() {
  console.log("=== Verifying Actual Audio File Accessibility ===");
  
  // 1. Test Noorani Letter Audio (e.g., Alif, Baa)
  const letters = ["ا", "ب", "ج", "ر", "ي"];
  for (const l of letters) {
    const resolved = resolveLetterAudio(l);
    if (!resolved.found || !resolved.urls.length) {
      console.log(`[!] Letter ${l} not found in registry`);
      continue;
    }
    const testUrl = resolved.urls[0];
    try {
      const res = await fetch(testUrl, { method: "HEAD" });
      console.log(`[Letter ${l}] URL: ${testUrl} -> Status: ${res.status} (${res.headers.get("content-type") || "unknown"})`);
    } catch (err) {
      console.log(`[Letter ${l}] Network error for ${testUrl}: ${err.message}`);
    }
  }

  // 2. Test EveryAyah CDN (Ayah 1:1, Ayah 112:1)
  const ayahs = [
    { s: 1, a: 1, q: "husary_muallim" },
    { s: 112, a: 1, q: "alafasy" },
    { s: 114, a: 1, q: "abdul_basit" },
  ];
  for (const item of ayahs) {
    const resolved = resolveAyahAudio(item.s, item.a, item.q);
    const testUrl = resolved.urls[0];
    try {
      const res = await fetch(testUrl, { method: "HEAD" });
      console.log(`[Ayah ${item.s}:${item.a} (${item.q})] URL: ${testUrl} -> Status: ${res.status} (${res.headers.get("content-type") || "unknown"})`);
    } catch (err) {
      console.log(`[Ayah ${item.s}:${item.a}] Network error for ${testUrl}: ${err.message}`);
    }
  }
}

verifyAudioUrls();

