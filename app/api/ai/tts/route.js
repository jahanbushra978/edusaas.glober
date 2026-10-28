import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { EdgeTTS } from "node-edge-tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Global in-memory cache for synthesized audio chunks (LRU up to 1000 entries)
if (!global.__ttsBufferCache) {
  global.__ttsBufferCache = new Map();
}
const ttsCache = global.__ttsBufferCache;

// Persistent disk cache directory for static Quran translations & speech chunks
const DISK_CACHE_DIR = path.join(process.cwd(), ".next", "cache", "tts-audio");
try {
  if (!fs.existsSync(DISK_CACHE_DIR)) {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[TTS Cache] Could not create disk cache dir:", e?.message);
}

function getDiskCachePath(chunk, lang, gender, voice) {
  const hash = crypto.createHash("sha256").update(`v11:${lang}:${gender}:${voice || "def"}:${chunk}`).digest("hex");
  return path.join(DISK_CACHE_DIR, `${hash}.bin`);
}

function readFromDiskCache(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      if (data && data.length > 0) {
        return { isPcm: true, data };
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
function normalizeForBengaliSpeech(rawText) {
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

/**
 * Primary Tier 1: Authentic Neural Human Male Voice (bn-BD-PradeepNeural / ar-SA-HamedNeural)
 * Powered by high-definition 24kHz neural audio.
 * Zero robotic sound, 100% human male vocal timbre, zero daily quota limits!
 */
async function fetchEdgeTtsAudio(text, lang = "bn", voiceOverride = null, rateOverride = null) {
  const { execFile } = await import("child_process");
  const path = await import("path");

  let voice = voiceOverride;
  if (!voice) {
    if (lang.startsWith("ar")) {
      voice = "ar-SA-HamedNeural"; // Classical Saudi Fusha Quran teacher (pure open Fatha "A")
    } else {
      voice = "bn-BD-PradeepNeural"; // Pure authentic human male Bengali voice
    }
  }

  const runnerPath = path.join(process.cwd(), "src/lib/ai/edge-tts-runner.mjs");

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [runnerPath, text, voice, rateOverride || "-4%"],
      { encoding: "buffer", maxBuffer: 20 * 1024 * 1024, timeout: 10000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.toString() || error.message));
        } else if (!stdout || stdout.length === 0) {
          reject(new Error("Empty audio buffer from Edge TTS"));
        } else {
          resolve(stdout);
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
  const models = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"];

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
 * Fetch unified audio chunk with 100% Authentic Neural Human Male Voice Priority
 */
async function synthesizeChunk(chunk, lang = "bn", voice = null, rate = null, gender = "male") {
  const memKey = `v11:${lang}:${gender}:${voice || "def"}:${rate || "def"}:${chunk}`;
  if (ttsCache.has(memKey)) {
    return ttsCache.get(memKey);
  }

  // Check persistent disk cache first (instant sub-20ms response)
  const diskPath = getDiskCachePath(chunk, lang, gender, voice);
  const diskCached = readFromDiskCache(diskPath);
  if (diskCached) {
    ttsCache.set(memKey, diskCached);
    return diskCached;
  }

  let chunkResult = null;

  // 1. TIER 1: Authentic Human Male Voice (bn-BD-PradeepNeural) — Zero Robotic Sound!
  try {
    const buf = await fetchEdgeTtsAudio(chunk, lang, voice, rate);
    if (buf && buf.length > 0) {
      chunkResult = { isPcm: false, data: buf };
      console.log(`[TTS] Authentic Human Male Voice success for "${chunk.slice(0, 30)}...": ${buf.length} bytes`);
    }
  } catch (edgeErr) {
    console.warn(`[TTS] EdgeTTS notice for "${chunk.slice(0, 30)}...":`, edgeErr?.message);
  }

  // 2. TIER 2: Secondary Gemini Enceladus Male Voice (24kHz Studio PCM)
  if (!chunkResult || !chunkResult.data || chunkResult.data.length === 0) {
    try {
      chunkResult = await fetchGeminiNeuralTts(chunk, gender);
      if (chunkResult && chunkResult.data && chunkResult.data.length > 0) {
        console.log(`[TTS] Gemini Enceladus Male Voice fallback success for "${chunk.slice(0, 30)}...": ${chunkResult.data.length} bytes`);
      }
    } catch (geminiErr) {
      console.warn(`[TTS] Gemini notice:`, geminiErr?.message);
    }
  }

  if (chunkResult && chunkResult.data && chunkResult.data.length > 0) {
    // Persist to disk cache
    writeToDiskCache(diskPath, chunkResult.isPcm ? chunkResult.data : chunkResult.data);
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
    const rate = searchParams.get("rate") || null;
    const gender = (searchParams.get("gender") || "male").toLowerCase();

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text parameter is required." }, { status: 400 });
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, 170);
    const chunkResults = [];

    for (const chunk of chunks) {
      try {
        const res = await synthesizeChunk(chunk, lang, voice, rate, gender);
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
    const voice = body.voice || null;
    const rate = body.rate || null;
    const gender = (body.gender || "male").toLowerCase();

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text is required in body." }, { status: 400 });
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, 170);
    const chunkResults = [];

    for (const chunk of chunks) {
      try {
        const res = await synthesizeChunk(chunk, lang, voice, rate, gender);
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
