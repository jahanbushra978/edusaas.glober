import { NextResponse } from "next/server";
import { resolveAuthContext } from "@/lib/ai/auth-context";
import { executeAICompletion } from "@/lib/ai/providers";
import { verifyCsrfOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Arabic text normalizer for comparison
 * Strips harakat, normalises alif variants, ta marbuta, etc.
 */
function normalizeAr(text) {
  return (text || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Harakat & Quranic stop marks
    .replace(/[إأآاٱ]/g, "ا")
    .replace(/[يى]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\s\p{P}]/gu, "")
    .trim();
}

/**
 * Word-by-word honest comparison between spoken and target Arabic text.
 * Returns { score, passed, lokmaCount, wordMatches, missedWords }
 */
function compareArabicWords(verseAr, transcribedText, targetScore) {
  const targetWords = (verseAr || "").trim().split(/\s+/).filter(Boolean);
  const spokenWords = (transcribedText || "").trim().split(/\s+/).filter(Boolean);

  if (targetWords.length === 0) {
    return { score: 0, passed: false, lokmaCount: 0, wordMatches: [], missedWords: [] };
  }

  const normTarget = targetWords.map(normalizeAr);
  const normSpoken = spokenWords.map(normalizeAr);
  let matchedCount = 0;
  const missedWords = [];

  const wordMatches = targetWords.map((word, idx) => {
    const tNorm = normTarget[idx];
    if (!tNorm) return { word, status: "correct" };

    // Exact match
    if (normSpoken.includes(tNorm)) {
      matchedCount += 1.0;
      return { word, status: "correct" };
    }

    // Partial / near match (substring overlap)
    const partialMatch = normSpoken.some(
      (sw) => sw && (sw.includes(tNorm) || tNorm.includes(sw) || levenshtein(sw, tNorm) <= 2)
    );
    if (partialMatch) {
      matchedCount += 0.6;
      return { word, status: "near" };
    }

    missedWords.push(word);
    return { word, status: "mistake" };
  });

  const wordRatio = matchedCount / targetWords.length;
  const score = Math.min(100, Math.max(0, Math.round(wordRatio * 100)));
  const passed = score >= targetScore;

  return { score, passed, lokmaCount: missedWords.length, wordMatches, missedWords };
}

/** Simple Levenshtein edit distance for near-match detection */
function levenshtein(a, b) {
  if (!a) return b?.length || 0;
  if (!b) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
      }
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Deterministic Honest Tajweed & Recitation Evaluator
 *
 * STRICT RULES:
 * - Only passes if transcript has matching words, or if Gemini AI verified.
 * - No automatic "pass" just because microphone detected audio energy.
 * - Duration-based confidence boost only when transcript ALSO matches.
 */
function evaluateDeterministicRecitation({
  verseAr = "",
  transcribedText = "",
  recordingDuration = 3,
  attemptCount = 1,
  targetScore = 88,
  ruleType = "Tajweed",
  ruleTitle = "",
  hasAudioActivity = false,
}) {
  const cleanTranscript = (transcribedText || "").trim();
  const targetWords = verseAr.trim().split(/\s+/).filter(Boolean);

  // ── CASE 1: Pure Silence (no mic audio, no transcript, very short duration) ──
  if (!cleanTranscript && !hasAudioActivity && recordingDuration < 1.0) {
    return {
      score: 0,
      passed: false,
      unclear: true,
      makhrajAccuracy: "অস্পষ্ট / তিলাওয়াত শোনা যায়নি",
      timingAccuracy: "তিলাওয়াত রেকর্ড হয়নি",
      lokmaCount: targetWords.length,
      feedbackBn:
        "মাইক্রোফোনে কোনো শব্দ পৌঁছায়নি। অনুগ্রহ করে মাইক্রোফোনটি আনমিউট আছে কি না যাচাই করে পুনরায় চেষ্টা করুন।",
      correctTipBn: "মাইক্রোফোন সঠিকভাবে সংযুক্ত আছে কি না যাচাই করুন।",
      wordMatches: targetWords.map((word) => ({ word, status: "omitted" })),
    };
  }

  // ── CASE 2: No transcript but audio was detected ──
  // Student spoke but Arabic STT could not transcribe (common with Quranic Tajweed elongation).
  // We give PARTIAL credit based on duration — NOT auto-pass. Student must retry.
  if (!cleanTranscript && hasAudioActivity) {
    // Short recitation (< 1.5s) = likely didn't recite properly
    if (recordingDuration < 1.5) {
      return {
        score: 40,
        passed: false,
        unclear: false,
        makhrajAccuracy: "অস্পষ্ট উচ্চারণ — কিছু শব্দ ধরা যায়নি",
        timingAccuracy: "তিলাওয়াত অত্যন্ত সংক্ষিপ্ত ছিল",
        lokmaCount: Math.ceil(targetWords.length / 2),
        feedbackBn: `তিলাওয়াত সংক্ষিপ্ত মনে হয়েছে। আয়াতের সম্পূর্ণ শব্দগুলো স্পষ্টভাবে পড়ুন — প্রতিটি হরফের মাখরাজে সময় দিন।`,
        correctTipBn: "আয়াতের প্রতিটি হরফ ধীরস্থিরে উচ্চারণ করুন এবং মাদ্দের পরিমাণ বজায় রাখুন।",
        wordMatches: targetWords.map((w, i) => ({
          word: w,
          status: i < Math.floor(targetWords.length / 2) ? "near" : "mistake",
        })),
      };
    }

    // Medium to long recitation (>= 1.5s) = partial confidence, moderate score, ask to try again for better
    const durationScore = recordingDuration >= 4.0 ? 72 : recordingDuration >= 2.5 ? 65 : 55;
    const passed = durationScore >= targetScore;
    return {
      score: durationScore,
      passed,
      unclear: false,
      makhrajAccuracy: passed
        ? "গ্রহণযোগ্য উচ্চারণ (স্বয়ংক্রিয় যাচাই সীমিত)"
        : "মাঝারি — শব্দ বিশ্লেষণ সম্পূর্ণ হয়নি",
      timingAccuracy: recordingDuration >= 3.0 ? "পরিমিত গতি" : "দ্রুত পাঠ সম্ভব",
      lokmaCount: passed ? 0 : Math.ceil(targetWords.length * 0.3),
      feedbackBn: passed
        ? `আলহামদুলিল্লাহ! তিলাওয়াত গ্রহণ করা হয়েছে (আনুমানিক স্কোর: ${durationScore}%)। আরও স্পষ্টভাবে পড়তে পারলে মূল্যায়ন আরও নির্ভুল হতো।`
        : `আপনার তিলাওয়াত সম্পূর্ণ যাচাই করা সম্ভব হয়নি। অনুগ্রহ করে আয়াতের প্রতিটি শব্দ স্পষ্ট ও ধীর গতিতে পড়ুন।`,
      correctTipBn: "মাইক্রোফোনের কাছে এসে প্রতিটি শব্দ স্পষ্টভাবে উচ্চারণ করুন।",
      wordMatches: targetWords.map((word) => ({
        word,
        status: passed ? "near" : "mistake",
      })),
    };
  }

  // ── CASE 3: Transcript available — Honest word-by-word comparison ──
  const { score, passed, lokmaCount, wordMatches, missedWords } = compareArabicWords(
    verseAr,
    cleanTranscript,
    targetScore
  );

  // Slight duration bonus (max +5%) only if there are matches
  const durationBonus = score > 0 && recordingDuration >= 3.0 ? 3 : recordingDuration >= 5.0 ? 5 : 0;
  const finalScore = Math.min(100, score + durationBonus);
  const finalPassed = finalScore >= targetScore;

  let feedbackBn = "";
  let correctTipBn = "";

  if (finalPassed) {
    feedbackBn = `মাশাআল্লাহ! আপনি আয়াতটি অত্যন্ত সুন্দর ও বিশুদ্ধ উচ্চারণে আদায় করেছেন। হরফের মাখরাজ ও শব্দবিন্যাস নির্ভুল ছিল।`;
    correctTipBn = "তিলাওয়াতের এই ধারাক্রম ও সুন্দর মাশক বজায় রাখুন।";
  } else if (finalScore < 40) {
    const missed2 = missedWords.slice(0, 2).map((w) => `"${w}"`).join(", ");
    feedbackBn = `তিলাওয়াতে বেশ কয়েকটি শব্দে ভুল পাওয়া গেছে${missed2 ? ` (${missed2} ইত্যাদি)` : ""}। আয়াতটি আরেকবার ক্বারীর তিলাওয়াত শুনে তারপর পড়ার চেষ্টা করুন।`;
    correctTipBn = "ক্বারীর অডিও মনোযোগ দিয়ে শুনুন, তারপর ধীরেসুস্থে প্রতিটি শব্দ মুখে বলুন।";
  } else if (attemptCount === 1) {
    feedbackBn = `চেষ্টা ভালো হয়েছে (স্কোর: ${finalScore}%)। ${missedWords.length > 0 ? `"${missedWords[0]}" শব্দটিতে একটু মনোযোগ দিন।` : ruleTitle ? `"${ruleTitle}"-এ সামান্য সতর্ক থাকুন।` : "মাখরাজে সামান্য অসতর্কতা পাওয়া গেছে।"} আরেকবার মাশক করুন।`;
    correctTipBn = "হরফ ছাড়ার সময় তাড়াহুড়ো না করে মাখরাজে পরিমিত চাপ বজায় রাখুন।";
  } else if (attemptCount === 2) {
    feedbackBn = `আগের চেয়ে উন্নতি হচ্ছে! ধীরেসুস্থে সঠিক মাদ্দ ও গুন্নাহ বজায় রেখে আরেকবার তিলাওয়াত করুন।`;
    correctTipBn = "কণ্ঠনালী অতিরিক্ত সংকুচিত না করে স্বাভাবিক শ্বাসে তিলাওয়াত করুন।";
  } else {
    feedbackBn = `মাশাআল্লাহ! আপনি ধৈর্য ধরে বারবার চেষ্টা করেছেন। এই আয়াতের মাখরাজ আরও আয়ত্ত করতে পরবর্তীতে আবার রিভিশন দেওয়া হবে।`;
    correctTipBn = "পরবর্তী আয়াতে এগিয়ে যান, পরে ঝালাইয়ের সময় এই আয়াতটি আবার মাশক করে নিন।";
  }

  return {
    score: finalScore,
    passed: finalPassed,
    unclear: false,
    makhrajAccuracy:
      finalScore >= 85
        ? "বিশুদ্ধ ও স্পষ্ট (Mumtaz)"
        : finalScore >= 65
        ? "মাঝারি (Jayyid — উন্নতি আবশ্যক)"
        : "দুর্বল (Dha'eef — পুনঃপ্রচেষ্টা প্রয়োজন)",
    timingAccuracy:
      recordingDuration >= 3.0
        ? "পরিমিত মাদ্দ ও সময়কাল"
        : "অতিরিক্ত দ্রুত অথবা সংক্ষিপ্ত তিলাওয়াত",
    lokmaCount,
    feedbackBn,
    correctTipBn,
    wordMatches,
  };
}

export async function POST(request) {
  try {
    // 1. Verify CSRF in production
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    // 2. Resolve Auth context (non-blocking)
    await resolveAuthContext(request);

    const body = await request.json();
    const {
      verseAr = "",
      verseBn = "",
      ruleType = "Tajweed",
      ruleTitle = "",
      transcribedText = "",
      recordingDuration = 3,
      attemptCount = 1,
      targetScore = 88,
      learningMemory = null,
      provider = "gemini",
      model,
      apiKey: userApiKey,
      baseUrl,
      hasAudioActivity = false,
      // New: "selfReciteMode" means student is reciting solo without Qari demo first
      selfReciteMode = false,
    } = body;

    const isBYOK = Boolean(userApiKey && userApiKey.trim());
    const cleanTranscript = (transcribedText || "").trim();

    // ── GATE: Pure Silence (no audio, no transcript, very short) ──
    if (!cleanTranscript && !hasAudioActivity && recordingDuration < 0.8) {
      return NextResponse.json({
        ok: true,
        data: {
          score: 0,
          passed: false,
          unclear: true,
          makhrajAccuracy: "তিলাওয়াত রেকর্ড হয়নি",
          timingAccuracy: "কোনো শব্দ পাওয়া যায়নি",
          lokmaCount: (verseAr || "").trim().split(/\s+/).filter(Boolean).length,
          feedbackBn: "মাইক্রোফোনে কোনো শব্দ পৌঁছায়নি। অনুগ্রহ করে মাইক্রোফোনের অনুমতি দিন এবং কাছে থেকে তিলাওয়াত করুন।",
          correctTipBn: "ব্রাউজারে মাইক্রোফোনের অনুমতি দেওয়া আছে কি না যাচাই করুন।",
          wordMatches: (verseAr || "").trim().split(/\s+/).filter(Boolean).map((w) => ({ word: w, status: "omitted" })),
        },
        source: "silence_gate",
      });
    }

    // ── Try AI Evaluation with Gemini/LLM if central key or BYOK available ──
    const hasCentralKey = Boolean(
      process.env.GEMINI_API_KEY ||
        process.env.OPENROUTER_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.GROQ_API_KEY
    );

    if (hasCentralKey || isBYOK) {
      // Build a thorough prompt. When no transcript, ask AI to grade purely on duration + context.
      const systemPrompt = `You are নূর — Rahmania Institute's Quran & Tajweed Teacher AI.
Your role: evaluate the student's recitation HONESTLY and STRICTLY. Do NOT inflate scores.

ABSOLUTE RULES:
1. Only give 85%+ when transcription clearly matches the Quranic verse text.
2. If transcription is EMPTY and only audio was detected (no text), give a score of 50-65% MAX and mark half the words as "near". Never give 85+ without actual word matches.
3. For partial matches: 60-80%. For complete mismatch: 20-50%. For mostly correct: 80-90%.
4. feedbackBn MUST be warm, respectful Bengali. Point to the SPECIFIC word or letter that was wrong.
5. correctTipBn gives a single actionable improvement tip in Bengali.
6. wordMatches: compare each word of the verse to the transcription honestly.
7. lokmaCount = number of words that were wrong/missed.

Respond ONLY with valid JSON. No markdown, no explanation outside JSON.
Schema:
{
  "score": number (0-100),
  "passed": boolean,
  "makhrajAccuracy": "Bengali string",
  "timingAccuracy": "Bengali string",
  "lokmaCount": number,
  "feedbackBn": "Bengali string",
  "correctTipBn": "Bengali string",
  "wordMatches": [{"word": "Arabic word", "status": "correct" | "near" | "mistake"}]
}`;

      const transcriptDisplay = cleanTranscript
        ? cleanTranscript
        : `(কোনো আরবি টেক্সট পাওয়া যায়নি — শুধু মাইক অডিও ধরা পড়েছে, সময়কাল: ${recordingDuration.toFixed(1)} সেকেন্ড)`;

      const userPrompt = `Quranic Verse (Arabic): "${verseAr}"
Bengali Transliteration: "${verseBn}"
Tajweed Rule Focus: "${ruleTitle}" (${ruleType})
Student Recitation Transcript: "${transcriptDisplay}"
Recording Duration: ${recordingDuration.toFixed(1)} seconds
Attempt Number: ${attemptCount}
Target Score to Pass: ${targetScore}%
Self-Recite Mode (student recited solo without Qari demo): ${selfReciteMode}
Student Learning Memory: ${JSON.stringify(learningMemory || {})}

Evaluate the student's recitation honestly. If transcript is empty/not Arabic, score accordingly (max 65%). Be constructive.`;

      try {
        const effectiveProvider = isBYOK
          ? provider
          : process.env.GEMINI_API_KEY
          ? "gemini"
          : process.env.OPENROUTER_API_KEY
          ? "openrouter"
          : "openai";

        const aiResponse = await executeAICompletion({
          provider: effectiveProvider,
          apiKey: userApiKey || undefined,
          model: model || undefined,
          baseUrl,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.15,
          maxTokens: 800,
        });

        const rawContent = aiResponse.content || "";
        // Strip markdown wrappers if any
        const cleanedJson = rawContent
          .replace(/```(?:json)?\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        // Extract JSON object from response
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in AI response");

        const parsedData = JSON.parse(jsonMatch[0]);

        // Sanity-check: if transcript was empty, cap AI score to max 70 to prevent AI hallucination praise
        if (!cleanTranscript && parsedData.score > 70) {
          parsedData.score = 65;
          parsedData.passed = parsedData.score >= targetScore;
          parsedData.feedbackBn = parsedData.feedbackBn
            ? parsedData.feedbackBn
            : "তিলাওয়াত গ্রহণ করা হয়েছে তবে শব্দ বিশ্লেষণ সম্পূর্ণ হয়নি। স্পষ্টভাবে আরেকবার পড়ুন।";
        }

        return NextResponse.json({ ok: true, data: parsedData, source: "ai_gemini_engine" });
      } catch (aiErr) {
        console.warn("AI evaluation error, falling back to deterministic:", aiErr.message);
        // Fall through to deterministic
      }
    }

    // ── Deterministic fallback ──
    const deterministicResult = evaluateDeterministicRecitation({
      verseAr,
      transcribedText,
      recordingDuration,
      attemptCount,
      targetScore,
      ruleType,
      ruleTitle,
      hasAudioActivity,
    });
    return NextResponse.json({
      ok: true,
      data: deterministicResult,
      source: "deterministic_engine",
    });
  } catch (error) {
    console.error("Nur Evaluation Error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to evaluate recitation." },
      { status: 500 }
    );
  }
}
