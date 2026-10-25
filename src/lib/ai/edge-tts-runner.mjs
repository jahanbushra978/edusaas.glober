import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const [,, text, voice, rate] = process.argv;

if (!text) {
  process.stderr.write("No text provided\n");
  process.exit(1);
}

try {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice || "ar-EG-ShakirNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: rate || "-15%" });
  const chunks = [];

  audioStream.on("data", (chunk) => chunks.push(chunk));
  audioStream.on("end", () => {
    try { tts.close?.().catch(() => {}); } catch {}
    const full = Buffer.concat(chunks);
    process.stdout.write(full, () => {
      process.exit(0);
    });
  });
  audioStream.on("error", (err) => {
    try { tts.close?.().catch(() => {}); } catch {}
    process.stderr.write(String(err?.message || err) + "\n");
    process.exit(1);
  });
} catch (error) {
  process.stderr.write(String(error?.message || error) + "\n");
  process.exit(1);
}
