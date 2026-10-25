import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Global in-memory cache for synthesized audio chunks (LRU up to 500 entries)
if (!global.__ttsBufferCache) {
  global.__ttsBufferCache = new Map();
}
const ttsCache = global.__ttsBufferCache;

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
 * Primary: Microsoft Edge Neural Studio TTS (High-Definition 24kHz Audio via standalone runner)
 */
async function fetchEdgeTtsAudio(text, lang = "bn", voiceOverride = null, rateOverride = null) {
  const { execFile } = await import("child_process");
  const path = await import("path");

  let voice = voiceOverride;
  let rate = rateOverride;

  if (!voice) {
    if (lang.startsWith("ar")) {
      voice = "ar-SA-HamedNeural"; // Classical Saudi Fusha Quran teacher (pure open Fatha "A")
      rate = rateOverride || "-15%"; // Deliberate, clear articulation for learning
    } else {
      voice = "bn-BD-PradeepNeural"; // Clear neural Bengali voice
      rate = rateOverride || "0%";
    }
  }

  const runnerPath = path.join(process.cwd(), "src/lib/ai/edge-tts-runner.mjs");

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [runnerPath, text, voice, rate || "-10%"],
      { encoding: "buffer", maxBuffer: 20 * 1024 * 1024, timeout: 5500 },
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
 * Fallback: Google Translate TTS with twin-endpoint resilience
 */
async function fetchGoogleTtsFallback(text, lang = "bn") {
  const urlPrimary = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
  try {
    const res = await fetch(urlPrimary, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: "https://translate.google.com/",
      },
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.warn("Google TTS primary endpoint failed, trying gtx:", err?.message);
  }

  const urlSecondary = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=gtx`;
  const resSec = await fetch(urlSecondary, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
    },
    signal: AbortSignal.timeout(4500),
  });

  if (!resSec.ok) {
    throw new Error(`Google TTS secondary returned HTTP ${resSec.status}`);
  }

  const arrayBuffer = await resSec.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Fetch unified audio chunk with Edge Neural priority and Google fallback
 */
async function synthesizeChunk(chunk, lang = "bn", voice = null, rate = null) {
  const cacheKey = `v5:${lang}:${voice || "def"}:${rate || "def"}:${chunk}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey);
  }

  let buf = null;
  // Try Edge TTS first for studio clarity
  try {
    buf = await fetchEdgeTtsAudio(chunk, lang, voice, rate);
    if (buf && buf.length > 0) {
      console.log(`[TTS] Edge TTS success for "${chunk}" (${lang}): ${buf.length} bytes`);
    }
  } catch (edgeErr) {
    try {
      const fs = await import("fs");
      fs.appendFileSync("tts_debug.log", `[${new Date().toISOString()}] Edge TTS error for "${chunk}": ${edgeErr?.message}\n${edgeErr?.stack}\n`);
    } catch {}
    console.warn(`[TTS] Edge TTS error for "${chunk}":`, edgeErr?.message);
  }

  // Fallback to Google Translate if Edge TTS had an issue
  if (!buf || buf.length === 0) {
    try {
      buf = await fetchGoogleTtsFallback(chunk, lang);
      if (buf && buf.length > 0) {
        console.log(`[TTS] Google fallback used for "${chunk}" (${lang}): ${buf.length} bytes`);
      }
    } catch (googleErr) {
      console.warn(`[TTS] Google fallback failed for "${chunk}":`, googleErr?.message);
    }
  }

  if (buf && buf.length > 0) {
    if (ttsCache.size > 500) {
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, buf);
    return buf;
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

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text parameter is required." }, { status: 400 });
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, 170);
    const buffers = [];

    for (const chunk of chunks) {
      try {
        const buf = await synthesizeChunk(chunk, lang, voice, rate);
        if (buf && buf.length > 0) {
          buffers.push(buf);
        }
      } catch (chunkErr) {
        console.warn("Chunk synthesis failed:", chunkErr?.message);
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json({ ok: false, message: "Failed to synthesize speech." }, { status: 502 });
    }

    const combinedBuffer = Buffer.concat(buffers);

    return new Response(combinedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(combinedBuffer.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
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

    if (!text) {
      return NextResponse.json({ ok: false, message: "Text is required in body." }, { status: 400 });
    }

    const normalized = lang.startsWith("bn")
      ? normalizeForBengaliSpeech(text)
      : lang.startsWith("ar")
      ? normalizeForArabicSpeech(text)
      : text;
    const chunks = splitTextIntoChunks(normalized, 170);
    const buffers = [];

    for (const chunk of chunks) {
      try {
        const buf = await synthesizeChunk(chunk, lang, voice, rate);
        if (buf && buf.length > 0) {
          buffers.push(buf);
        }
      } catch (chunkErr) {
        console.warn("Chunk synthesis failed:", chunkErr?.message);
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json({ ok: false, message: "Failed to synthesize speech." }, { status: 502 });
    }

    const combinedBuffer = Buffer.concat(buffers);

    return new Response(combinedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(combinedBuffer.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
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
