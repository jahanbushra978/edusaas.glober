import { EdgeTTS } from "node-edge-tts";
import path from "path";
import os from "os";
import fs from "fs";

const [,, text, voice, rate] = process.argv;

if (!text) {
  process.stderr.write("No text provided\n");
  process.exit(1);
}

const tempFile = path.join(os.tmpdir(), `edge_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);

try {
  const tts = new EdgeTTS({
    voice: voice || "bn-BD-PradeepNeural",
    lang: (voice && voice.startsWith("ar")) ? "ar-SA" : "bn-BD",
    rate: rate || "-4%",
    outputFormat: "audio-24khz-48kbitrate-mono-mp3"
  });

  await tts.ttsPromise(text, tempFile);

  if (fs.existsSync(tempFile)) {
    const data = fs.readFileSync(tempFile);
    try { fs.unlinkSync(tempFile); } catch {}
    process.stdout.write(data, () => {
      process.exit(0);
    });
  } else {
    process.stderr.write("Failed to create audio file\n");
    process.exit(1);
  }
} catch (error) {
  try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
  process.stderr.write(String(error?.message || error) + "\n");
  process.exit(1);
}
