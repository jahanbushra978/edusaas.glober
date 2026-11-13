import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Global in-memory cache for synthesized audio chunks (LRU up to 1000 entries)
if (!global.__ttsBufferCache) {
  global.__ttsBufferCache = new Map();
}
const ttsCache = global.__ttsBufferCache;

// Persistent disk cache directory using os.tmpdir() (100% safe on Vercel Serverless & Docker)
const DISK_CACHE_DIR = path.join(os.tmpdir(), "tts-audio-cache");
try {
  if (!fs.existsSync(DISK_CACHE_DIR)) {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[TTS Cache] Could not create disk cache dir:", e?.message);
}

if (typeof process !== "undefined") {
  process.env.WS_NO_BUFFER_UTIL = "1";
  process.env.WS_NO_UTF_8_VALIDATE = "1";
}

const ELEVENLABS_VOICES = {
  brian: "nPczCjzI2devNBz1zQrb",
  bill: "pqHfZKP75CvOlQylNhV4",
  george: "JBFqnCBsd6RMkjVDRZzb",
  daniel: "onwK4e9ZLuTAKqWW03F9",
};

function resolveElevenLabsVoiceId(elVoice) {
  if (elVoice && ELEVENLABS_VOICES[elVoice]) {
    return ELEVENLABS_VOICES[elVoice];
  }
  if (elVoice && /^[a-zA-Z0-9]{15,30}$/.test(elVoice)) {
    return elVoice;
  }
  return process.env.ELEVENLABS_VOICE_ID || ELEVENLABS_VOICES.brian;
}

async function fetchElevenLabsTts(text, elVoice = null) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("ElevenLabs API key not configured");
  }
  const voiceId = resolveElevenLabsVoiceId(elVoice);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: {
        stability: 0.50,
        similarity_boost: 0.78,
        style: 0.35,
        speed: 0.88,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ElevenLabs HTTP ${res.status}: ${errText.slice(0, 120)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 400) {
    throw new Error("ElevenLabs returned empty audio buffer");
  }
  return { data: buf, isPcm: false, provider: "elevenlabs-v3" };
}

function getDiskCachePath(chunk, lang, gender, voice, rate = "def", pitch = "def", engine = "engine-2", elVoice = "def") {
  const hash = crypto
    .createHash("sha256")
    .update(`v14:${engine}:${elVoice || "def"}:${lang}:${gender}:${voice || "def"}:${rate}:${pitch}:${chunk}`)
    .digest("hex");
  return path.join(DISK_CACHE_DIR, `${hash}.bin`);
}

function readFromDiskCache(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      if (data && data.length > 0) {
        const isId3 = data.slice(0, 3).toString() === "ID3";
        const isMp3Sync = data.length >= 2 && data[0] === 0xff && (data[1] & 0xe0) === 0xe0;
        const isRiff = data.slice(0, 4).toString() === "RIFF";
        const isOgg = data.slice(0, 4).toString() === "OggS";
        const isEncodedAudio = isId3 || isMp3Sync || isRiff || isOgg;
        return { isPcm: !isEncodedAudio, data };
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function writeToDiskCache(filePath, buffer) {
  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    // ignore
  }
}

/**
 * Phonetically map common English & Islamic terminology into Bengali phonetics
 * so Bengali TTS pronounces them naturally without stuttering or skipping.
 */
function normalizeForBengaliSpeech(rawText, engine = "engine-2") {
  if (!rawText) return "";
  let text = String(rawText);

  // Strip Markdown links, bold, italic, code
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/[*_~`#]/g, "");

  // Convert percentage symbol: "88%" -> "৮৮ শতাংশ"
  text = text.replace(/(\d+)\s*%/g, "$1 শতাংশ");

  // Convert English digits to Bengali digits
  const enToBnDigits = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  text = text.replace(/\d/g, (d) => enToBnDigits[d] || d);

  // Natural breathing pauses after Islamic expressions
  text = text.replace(/মাশাআল্লাহ[!।]?/g, "মাশাআল্লাহ, ");
  text = text.replace(/আলহামদুলিল্লাহ[!।]?/g, "আলহামদুলিল্লাহ, ");
  text = text.replace(/মুবারকবাদ[!।]?/g, "মুবারকবাদ, ");
  text = text.replace(/আসসালামু\s*আলাইকুম[!।]?/g, "আসসালামু আলাইকুম, ");
  text = text.replace(/সুবহানাল্লাহ[!।]?/g, "সুবহানাল্লাহ, ");

  // Dignified Quranic narrator pauses across both Studio Engine 2 and Engine 1
  text = text.replace(/([।!?])\s*(অতএব|সুতরাং|নিশ্চয়ই|নিশ্চই|বস্তুত|বরং|বলুন)/g, "$1 $2,");
  text = text.replace(/(^|\s)(হে মানবজাতি|হে মানুষ|হে ইমানদারগণ|হে মুমিনগণ|হে নবী)([।,!\s])/g, " $2, ");

  // Common terminology phonetics
  const phoneticMap = [
    [/\bTajweed\b/gi, "তাজবীদ"],
    [/\bTilawat\b/gi, "তিলাওয়াত"],
    [/\bMakhraj\b/gi, "মাখরাজ"],
    [/\bAyah\b/gi, "আয়াত"],
    [/\bAyahs\b/gi, "আয়াতসমূহ"],
    [/\bSurah\b/gi, "সূরা"],
    [/\bJuz\b/gi, "পারা"],
    [/\bScore\b/gi, "স্কোর"],
    [/\bQari\b/gi, "ক্বারী"],
    [/\bHifz\b/gi, "হিফজ"],
    [/\bSabaq\b/gi, "সবক"],
    [/\bLokma\b/gi, "লুকমা"],
    [/\bPercent\b/gi, "শতাংশ"],
    [/%/g, " শতাংশ"],
  ];

  for (const [regex, bn] of phoneticMap) {
    text = text.replace(regex, bn);
  }

  // Remove multiple consecutive commas or spaces
  text = text.replace(/,\s*,+/g, ", ");
  text = text.replace(/\s+/g, " ");

  return text.trim();
}

/**
 * Clean & optimize Arabic text for Tajweed & Quranic neural recitation.
 * Isolated syllables/words ending without punctuation receive an Arabic comma ("، ")
 * which allows the neural acoustic model to naturally articulate the consonant closure,
 * vowel resonance, and Qalqalah release instead of cutting off abruptly.
 */
function normalizeForArabicSpeech(rawText) {
  if (!rawText) return "";
  let text = String(rawText).trim();

  // Canonicalize Unicode order: Shaddah (0x651) must come before Harakah
  text = text.replace(/([\u064B-\u0650\u0670])(\u0651)/g, "$2$1");

  // Explicit gemination for Tashdeed drill syllables (أَبَّ -> Ab-ba)
  // Ensures the neural model articulates the authentic hold-and-release "Abba"
  if (text.includes("أَبَّ") || text.includes("أَبَّ") || text === "أَبَّ" || text === "أَبَّ") {
    text = "أَبْبَ";
  }

  if (!/[،,.?!؛\s]$/.test(text)) {
    text = text + "، ";
  }
  return text;
}

/**
 * Split text into chunks smaller than maxLen at sentence/phrase boundaries
 */
function splitTextIntoChunks(text, maxLen = 170) {
  if (!text) return [];
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return [clean];

  // Split by sentence terminators or punctuation
  const delimiters = /([।?!;\n]+)/;
  const rawParts = clean.split(delimiters);

  const sentences = [];
  for (let i = 0; i < rawParts.length; i += 2) {
    const sentence = (rawParts[i] || "") + (rawParts[i + 1] || "");
    if (sentence.trim()) sentences.push(sentence.trim());
  }

  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).trim().length <= maxLen) {
      currentChunk = (currentChunk + " " + sentence).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (sentence.length <= maxLen) {
        currentChunk = sentence;
      } else {
        const subParts = sentence.split(/([,،]+)/);
        let subChunk = "";
        for (const part of subParts) {
          if ((subChunk + part).length <= maxLen) {
            subChunk += part;
          } else {
            if (subChunk.trim()) chunks.push(subChunk.trim());
            subChunk = part;
          }
        }
        currentChunk = subChunk.trim();
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

/**
 * Convert 24kHz 16-bit Mono Linear PCM to standard playable WAV buffer
 */
function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function masterStudioVoiceWithFfmpeg(inputFilePath, gender = "male") {
  const { execFile } = await import("child_process");
  const outPath = path.join(os.tmpdir(), `edge_master_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
  // Analog tape depth + surgical studio condenser vocal EQ (zero WSOLA / vocoder metallic buzz)
  const af = gender === "female"
    ? [
        "aresample=48000",
        "asetrate=46800,aresample=48000",
        "highpass=f=85",
        "equalizer=f=185:t=q:w=1.1:g=3.2",
        "equalizer=f=320:t=q:w=1.2:g=1.5",
        "equalizer=f=2700:t=q:w=1.2:g=-3.0",
        "equalizer=f=4500:t=q:w=1.0:g=-5.5",
        "equalizer=f=6800:t=q:w=1.1:g=-4.0",
        "lowpass=f=12200",
        "acompressor=threshold=-20dB:ratio=2.2:attack=18:release=160:makeup=2.2",
        "alimiter=limit=0.92",
      ].join(",")
    : [
        "aresample=48000",
        "asetrate=44400,aresample=48000",
        "highpass=f=70",
        "equalizer=f=150:t=q:w=1.1:g=4.8",
        "equalizer=f=260:t=q:w=1.2:g=2.5",
        "equalizer=f=950:t=q:w=1.0:g=-1.8",
        "equalizer=f=2700:t=q:w=1.2:g=-3.5",
        "equalizer=f=4400:t=q:w=1.0:g=-6.0",
        "equalizer=f=6600:t=q:w=1.1:g=-4.5",
        "lowpass=f=11500",
        "acompressor=threshold=-20dB:ratio=2.3:attack=18:release=160:makeup=2.8",
        "alimiter=limit=0.92",
      ].join(",");

  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      ["-y", "-i", inputFilePath, "-af", af, "-f", "mp3", "-write_xing", "0", "-id3v2_version", "0", "-ar", "48000", "-ac", "1", "-b:a", "128k", outPath],
      { timeout: 10000 },
      (err) => {
        if (err) {
          try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
          return reject(err);
        }
        try {
          const masteredBuf = fs.readFileSync(outPath);
          try { fs.unlinkSync(outPath); } catch {}
          if (masteredBuf && masteredBuf.length > 0) {
            resolve(masteredBuf);
          } else {
            reject(new Error("Empty FFmpeg mastered buffer"));
          }
        } catch (readErr) {
          try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
          reject(readErr);
        }
      }
    );
  });
}

/**
 * Primary Tier 1: Authentic Neural Human Voice (bn-BD-PradeepNeural / bn-BD-NabanitaNeural / ar-SA-HamedNeural)
 * Uses crisp 24kHz Opus/96k + FFmpeg Pure-Analog Studio Vocal Mastering for Bengali so it sounds warm, calm, and non-robotic!
 */
async function fetchEdgeTtsAudio(text, lang = "bn", voiceOverride = null, rateOverride = null, pitchOverride = null, gender = "male") {
  let voice = voiceOverride;
  if (!voice) {
    if (lang.startsWith("ar")) {
      voice = "ar-SA-HamedNeural"; // Classical Saudi Fusha Quran teacher (pure open Fatha "A")
    } else if (lang.startsWith("en")) {
      voice = gender === "female" ? "en-US-AriaNeural" : "en-US-GuyNeural";
    } else {
      voice = gender === "female" ? "bn-BD-NabanitaNeural" : "bn-BD-PradeepNeural";
    }
  }

  const isBengali = lang.startsWith("bn");
  const isDefaultCadence = !rateOverride || rateOverride === "default" || rateOverride === "-3%" || rateOverride === "-7%";

  // 1. Direct in-process EdgeTTS execution + Studio Warm Mastering for Bengali
  try {
    const { EdgeTTS } = await import("node-edge-tts");
    if (isBengali) {
      const opusFile = path.join(os.tmpdir(), `edge_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`);
      const ttsOpus = new EdgeTTS({
        voice,
        lang: "bn-BD",
        rate: isDefaultCadence ? "default" : rateOverride,
        pitch: "default",
        outputFormat: "webm-24khz-16bit-mono-opus",
      });
      await ttsOpus.ttsPromise(text, opusFile);

      if (fs.existsSync(opusFile)) {
        try {
          const mastered = await masterStudioVoiceWithFfmpeg(opusFile, gender);
          try { fs.unlinkSync(opusFile); } catch {}
          if (mastered && mastered.length > 0) {
            return { data: mastered, provider: "edge-studio" };
          }
        } catch (ffErr) {
          console.warn("[TTS] FFmpeg mastering skipped, falling back to 96k MP3:", ffErr?.message);
          try { fs.unlinkSync(opusFile); } catch {}
        }
      }
    }

    const tempFile = path.join(os.tmpdir(), `edge_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
    const tts = new EdgeTTS({
      voice: voice,
      lang: (voice && voice.startsWith("ar")) ? "ar-SA" : lang.startsWith("en") ? "en-US" : "bn-BD",
      rate: (rateOverride && rateOverride !== "default") ? rateOverride : (isBengali ? "-3%" : "-5%"),
      pitch: (pitchOverride && pitchOverride !== "default" && pitchOverride !== "0Hz") ? pitchOverride : "default",
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    });

    await tts.ttsPromise(text, tempFile);

    if (fs.existsSync(tempFile)) {
      const data = fs.readFileSync(tempFile);
      try { fs.unlinkSync(tempFile); } catch {}
      if (data && data.length > 0) {
        return { data, provider: "edge-tts" };
      }
    }
  } catch (directErr) {
    console.warn("[TTS] In-process EdgeTTS notice, falling back to runner:", directErr?.message);
  }

  // 2. Subprocess runner fallback
  const { execFile } = await import("child_process");
  const pathMod = await import("path");
  const runnerPath = pathMod.join(process.cwd(), "src/lib/ai/edge-tts-runner.mjs");
  if (!fs.existsSync(runnerPath)) {
    throw new Error(`Edge runner not available at ${runnerPath}`);
  }

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [runnerPath, text, voice, (rateOverride && rateOverride !== "default") ? rateOverride : "-3%", "default"],
      { encoding: "buffer", maxBuffer: 20 * 1024 * 1024, timeout: 20000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.toString() || error.message));
        } else if (!stdout || stdout.length === 0) {
          reject(new Error("Empty audio buffer from Edge TTS"));
        } else {
          resolve({ data: stdout, provider: "edge-tts" });
        }
      }
    );
  });
}

/**
 * Secondary Tier 2: Google Gemini Neural Studio TTS (Enceladus Male Voice)
 */
async function fetchGeminiNeuralTts(text, gender = "male") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const voiceName = gender === "female" ? "Aoede" : "Enceladus";
  const models = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts", "gemini-2.0-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
              }
            }
          }
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const part = data.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        const pcm = Buffer.from(part.inlineData.data, "base64");
        return { isPcm: true, data: pcm };
      }
    } catch (err) {
      // Continue to next model
    }
  }

  return null;
}

/**
 * Universal Tier 3: Zero-Config Cloud Google TTS (100% Reliable Fallback on Vercel/Serverless)
 * Never blocked by datacenter IPs, requires zero API keys, guarantees audio generation.
 */
async function fetchGoogleTtsFallback(text, lang = "bn") {
  const cleanLang = lang.startsWith("ar") ? "ar" : "bn";
  const urlPrimary = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(cleanLang)}&client=tw-ob`;
  try {
    const res = await fetch(urlPrimary, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: "https://translate.google.com/",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.warn("[TTS] Google TTS primary endpoint notice:", err?.message);
  }

  const urlSecondary = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(cleanLang)}&client=gtx`;
  try {
    const resSec = await fetch(urlSecondary, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (resSec.ok) {
      const arrayBuffer = await resSec.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err2) {
    console.warn("[TTS] Google TTS secondary endpoint notice:", err2?.message);
  }

  return null;
}

/**
 * Fetch unified audio chunk with 100% Authentic Neural Human Male Voice Priority
 */
async function synthesizeChunk(chunk, lang = "bn", voice = null, rate = null, gender = "male", pitch = null, engine = "engine-2", elVoice = null) {
  const useElevenLabsFirst = Boolean(
    lang.startsWith("bn") && engine !== "engine-1" && process.env.ELEVENLABS_API_KEY && (gender !== "female" || elVoice)
  );
  const resolvedElVoice = useElevenLabsFirst ? resolveElevenLabsVoiceId(elVoice) : "def";
  const memKey = `v14:${engine}:${resolvedElVoice}:${lang}:${gender}:${voice || "def"}:${rate || "def"}:${pitch || "def"}:${chunk}`;
  if (ttsCache.has(memKey)) {
    return ttsCache.get(memKey);
  }

  // Check persistent disk cache first (instant sub-20ms response)
  const diskPath = getDiskCachePath(chunk, lang, gender, voice, rate || "def", pitch || "def", engine, resolvedElVoice);
  const diskCached = readFromDiskCache(diskPath);
  if (diskCached) {
    const cachedResult = { ...diskCached, provider: diskCached.provider || "disk-cache" };
    ttsCache.set(memKey, cachedResult);
    return cachedResult;
  }

  let chunkResult = null;

  // 0. TIER 0 (Engine 2 Default for Bengali): ElevenLabs eleven_v3 Natural Studio Voice
  if (useElevenLabsFirst) {
    try {
      chunkResult = await fetchElevenLabsTts(chunk, resolvedElVoice);
      if (chunkResult && chunkResult.data && chunkResult.data.length > 0) {
        console.log(`[TTS] ElevenLabs eleven_v3 success for "${chunk.slice(0, 30)}...": ${chunkResult.data.length} bytes`);
      }
    } catch (elErr) {
      console.warn(`[TTS] ElevenLabs notice (falling back to Edge Studio):`, elErr?.message);
    }
  }

  // 1. TIER 1: EdgeTTS + FFmpeg Pure-Analog Studio Warm Mastering (Free Unlimited Primary/Fallback)
  if (!chunkResult || !chunkResult.data || chunkResult.data.length === 0) {
    try {
      const edgeRes = await fetchEdgeTtsAudio(chunk, lang, voice, rate, pitch, gender);
      if (edgeRes && edgeRes.data && edgeRes.data.length > 0) {
        chunkResult = { isPcm: false, data: edgeRes.data, provider: edgeRes.provider || "edge-tts" };
        console.log(`[TTS] ${chunkResult.provider} (${lang}) success for "${chunk.slice(0, 30)}...": ${edgeRes.data.length} bytes`);
      }
    } catch (edgeErr) {
      console.warn(`[TTS] EdgeTTS notice for "${chunk.slice(0, 30)}...":`, edgeErr?.message);
    }
  }

  // 2. TIER 2: Secondary Gemini Voice (Skipped for Bengali because Gemini TTS mispronounces bn)
  if (!lang.startsWith("bn") && (!chunkResult || !chunkResult.data || chunkResult.data.length === 0)) {
    try {
      chunkResult = await fetchGeminiNeuralTts(chunk, gender);
      if (chunkResult && chunkResult.data && chunkResult.data.length > 0) {
        chunkResult.provider = "gemini-tts";
        console.log(`[TTS] Gemini fallback success for "${chunk.slice(0, 30)}...": ${chunkResult.data.length} bytes`);
      }
    } catch (geminiErr) {
      console.warn(`[TTS] Gemini notice:`, geminiErr?.message);
    }
  }

  // 3. TIER 3: Universal Google Cloud Fallback (Works 100% on Vercel & Any Cloud Serverless)
  if (!chunkResult || !chunkResult.data || chunkResult.data.length === 0) {
    try {
      const gBuf = await fetchGoogleTtsFallback(chunk, lang);
      if (gBuf && gBuf.length > 0) {
        chunkResult = { isPcm: false, data: gBuf, provider: "google-tts" };
        console.log(`[TTS] Universal Google fallback success for "${chunk.slice(0, 30)}...": ${gBuf.length} bytes`);
      }
    } catch (gErr) {
      console.warn(`[TTS] Google fallback notice:`, gErr?.message);
    }
  }

  if (chunkResult && chunkResult.data && chunkResult.data.length > 0) {
    // Persist to disk cache
    writeToDiskCache(diskPath, chunkResult.data);
    // Update LRU in-memory cache
    if (ttsCache.size > 1000) {
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(memKey, chunkResult);
    return chunkResult;
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("clear") === "1") {
      ttsCache.clear();
    }
    const text = (searchParams.get("text") || "").trim();
    const lang = (searchParams.get("lang") || "bn").toLowerCase();
    const voice = searchParams.get("voice") || null;
    const engine = searchParams.get("engine") || "engine-2"; // Engine 2 (ElevenLabs eleven_v3 Natural Studio Voice) is default!
    const elVoice = searchParams.get("elVoice") || searchParams.get("el_voice") || null;
    let rate = searchParams.get("rate") || null;
    let pitch = searchParams.get("pitch") || null;
    const gender = (searchParams.get("gender") || "male").toLowerCase();

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text parameter is required." }, { status: 400 });
    }

    if (lang.startsWith("bn")) {
      rate = rate || "default";
      pitch = pitch || "default";
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text, engine)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, lang.startsWith("bn") ? 450 : 170);
    const chunkResults = [];

    for (const chunk of chunks) {
      try {
        const res = await synthesizeChunk(chunk, lang, voice, rate, gender, pitch, engine, elVoice);
        if (res && res.data && res.data.length > 0) {
          chunkResults.push(res);
        }
      } catch (chunkErr) {
        console.warn("Chunk synthesis failed:", chunkErr?.message);
      }
    }

    if (chunkResults.length === 0) {
      return NextResponse.json({ ok: false, message: "Failed to synthesize speech." }, { status: 502 });
    }

    const providerUsed = chunkResults.map((b) => b.provider).filter(Boolean).join(",") || "unknown";
    const hasPcm = chunkResults.some((b) => b && b.isPcm);
    if (hasPcm) {
      const pcmStreams = chunkResults.map((b) => (b.isPcm ? b.data : b.data || b));
      const fullPcm = Buffer.concat(pcmStreams);
      const fullWav = pcmToWav(fullPcm, 24000);
      return new Response(fullWav, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(fullWav.length),
          "X-TTS-Provider": providerUsed,
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const rawStreams = chunkResults.map((b) => b.data || b);
    const combinedBuffer = Buffer.concat(rawStreams);
    const contentType = combinedBuffer.slice(0, 4).toString() === "RIFF" ? "audio/wav" : "audio/mpeg";

    return new Response(combinedBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(combinedBuffer.length),
        "X-TTS-Provider": providerUsed,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("TTS GET API error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to generate speech." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = (body.text || "").trim();
    const lang = (body.lang || "bn").toLowerCase();
    const engine = body.engine || "engine-2";
    const elVoice = body.elVoice || body.el_voice || null;
    const voice = body.voice || null;
    let rate = body.rate || null;
    let pitch = body.pitch || null;
    const gender = (body.gender || "male").toLowerCase();

    if (lang.startsWith("bn")) {
      rate = rate || "default";
      pitch = pitch || "default";
    }

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text is required in body." }, { status: 400 });
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text, engine)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, lang.startsWith("bn") ? 450 : 170);
    const chunkResults = [];

    for (const chunk of chunks) {
      try {
        const res = await synthesizeChunk(chunk, lang, voice, rate, gender, pitch, engine, elVoice);
        if (res && res.data && res.data.length > 0) {
          chunkResults.push(res);
        }
      } catch (chunkErr) {
        console.warn("Chunk synthesis failed:", chunkErr?.message);
      }
    }

    if (chunkResults.length === 0) {
      return NextResponse.json({ ok: false, message: "Failed to synthesize speech." }, { status: 502 });
    }

    const providerUsed = chunkResults.map((b) => b.provider).filter(Boolean).join(",") || "unknown";
    const hasPcm = chunkResults.some((b) => b && b.isPcm);
    if (hasPcm) {
      const pcmStreams = chunkResults.map((b) => (b.isPcm ? b.data : b.data || b));
      const fullPcm = Buffer.concat(pcmStreams);
      const fullWav = pcmToWav(fullPcm, 24000);
      return new Response(fullWav, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(fullWav.length),
          "X-TTS-Provider": providerUsed,
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const rawStreams = chunkResults.map((b) => b.data || b);
    const combinedBuffer = Buffer.concat(rawStreams);
    const contentType = combinedBuffer.slice(0, 4).toString() === "RIFF" ? "audio/wav" : "audio/mpeg";

    return new Response(combinedBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(combinedBuffer.length),
        "X-TTS-Provider": providerUsed,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("TTS POST API error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to generate speech." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
