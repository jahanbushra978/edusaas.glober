import { NextResponse } from "next/server";
import { resolveAuthContext } from "@/lib/ai/auth-context";
import { executeAICompletion } from "@/lib/ai/providers";
import { verifyCsrfOrigin } from "@/lib/security";
import { MAKHARIJ_CANON } from "@/lib/ai/tajweed-canon";
import { resolveLocalAssistantResponse } from "@/lib/ai/local-assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Intelligent Local Tajweed & Islamic Tutor Resolver
 * Provides instant, rich, authoritative answers with zero external API dependencies.
 */
function resolveTutorAnswer(transcript = "", language = "bn-BD") {
  const q = transcript.toLowerCase().trim();
  const isEn = language.startsWith("en");

  // 1. Greetings
  if (
    q.includes("সালাম") ||
    q.includes("salam") ||
    q.includes("assalamu") ||
    q.includes("হ্যালো") ||
    q.includes("হাই") ||
    q.includes("কেমন আছেন")
  ) {
    return {
      answerText: isEn
        ? "Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! I am Nur, your AI Quran and Tajweed teacher. How may I assist your recitation today?"
        : "ওয়ালাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহ! আলহামদুলিল্লাহ, আমি আপনার এআই কুরআন উস্তাদ নূর। পবিত্র কুরআন তিলাওয়াত, মাখরাজ বা তাজবীদের যেকোনো নিয়ম সম্পর্কে বলুন, আমি বুঝিয়ে দিচ্ছি।",
      makhrajHighlight: null,
      demonstrationAudioUrl: null,
    };
  }

  // 2. Identity
  if (
    q.includes("তুমি কে") ||
    q.includes("তোমার নাম") ||
    q.includes("who are you") ||
    q.includes("পরিচয়")
  ) {
    return {
      answerText: isEn
        ? "I am Nur, the proprietary AI Quran and Tajweed teacher of Rahmania Institute. I am here to help you recite the Holy Quran with pristine Tajweed."
        : "আমি নূর (Nur AI) — রহমানিয়া ইনস্টিটিউটের অফিসিয়াল এআই কুরআন শিক্ষক। আমি আপনাকে পবিত্র কুরআনের বিশুদ্ধ তিলাওয়াত, মাখরাজের সঠিক স্থান এবং তাজবীদের বিধান শেখাতে সাহায্য করি।",
      makhrajHighlight: null,
      demonstrationAudioUrl: null,
    };
  }

  // 3. Makhraj Definition & Count
  if (
    q.includes("মাখরাজ কয়") ||
    q.includes("মাখরাজ কি") ||
    q.includes("মাখরাজ কাকে বলে") ||
    q.includes("কতটি মাখরাজ") ||
    q.includes("how many makharij")
  ) {
    return {
      answerText: isEn
        ? "Makhraj (plural: Makharij) refers to the point of articulation from which an Arabic letter originates. There are 17 primary Makharij grouped into 5 major anatomical regions: Al-Jawf (oral/throat cavity), Al-Halq (throat), Al-Lisan (tongue), Ash-Shafatan (lips), and Al-Khayshum (nasal passage)."
        : "মাখরাজ (مَخْرَج) অর্থ বের হওয়ার স্থান। আরবি হরফসমূহ মুখের যে স্থান থেকে উচ্চারিত হয় তাকে মাখরাজ বলে। সর্বমোট মাখরাজ ১৭টি, যা প্রধান ৫টি অঙ্গ—আল-জাওফ (মুখের খালি জায়গা), আল-হালক (কণ্ঠনালী), আল-লিসান (জিহ্বা), আশ-শাফাতান (দুই ঠোঁট) এবং আল-খাইশূম (নাকের বাঁশি) থেকে উচ্চারিত হয়।",
      makhrajHighlight: "Al-Halq",
      demonstrationAudioUrl: null,
    };
  }

  // 4. Specific Tajweed Rules
  // 4.1 Ikhfa
  if (q.includes("ইখফা") || q.includes("ikhfa")) {
    return {
      answerText: isEn
        ? "Ikhfa means concealment. When a Noon Saakin or Tanween is followed by any of the 15 Ikhfa letters (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك), you conceal the 'N' sound with a 2-Harakat nasal hum (Ghunnah) at Al-Khayshum. For example: مِنْ شَرِّ."
        : "ইখফা (إخفاء) অর্থ গোপন করা। নূন সাকিন বা তানভীনের পর ইখফার ১৫টি হরফের (তা, ছা, জীম, দাল, যাল, যা, সীন, শীন, সোয়াদ, দোয়াদ, ত্বা, যা, ফা, ক্বাফ, কাফ) যেকোনো একটি হরফ আসলে নূনের আওয়াজকে নাকের বাঁশিতে গোপন করে পূর্ণ ২ হরকত পরিমাণ গুন্নাহর সাথে পড়তে হয়। যেমন: مِنْ شَرِّ।",
      makhrajHighlight: "Al-Khayshum",
      demonstrationAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/113002.mp3",
    };
  }

  // 4.2 Qalqalah
  if (q.includes("ক্বলক্বলাহ") || q.includes("qalqalah") || q.includes("কলকলা")) {
    return {
      answerText: isEn
        ? "Qalqalah means echoing or bouncing sound. The 5 Qalqalah letters are Qaf, Twa, Ba, Jeem, Dal (قطب جد). When they carry a Sukoon (Jazm) or stop upon with Waqf, an echoing rebound is produced at the point of articulation. For example: the final Qaf in قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ."
        : "ক্বলক্বলাহ (قلقلة) অর্থ প্রতিধ্বনি বা কম্পন সৃষ্টি করা। ক্বলক্বলাহর হরফ ৫টি: ক্বাফ, ত্বা, বা, জীম, দাল (সংক্ষেপে ক্বুতবু জাদিন)। এই হরফগুলোতে সাকিন বা জযম থাকলে অথবা ওয়াকফকালে মাখরাজে ধাক্কা লেগে স্পষ্ট প্রতিধ্বনি তৈরি হয়। যেমন: قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ এর শেষ ক্বাফ।",
      makhrajHighlight: "Al-Lisan",
      demonstrationAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3",
    };
  }

  // 4.3 Madd
  if (q.includes("মদ") || q.includes("madd") || q.includes("মাদ্দ") || q.includes("হারাকাত")) {
    return {
      answerText: isEn
        ? "Madd means elongation. The 3 natural Madd letters are empty Alif preceded by Fathah, Wow Saakin preceded by Dammah, and Ya Saakin preceded by Kasrah. Natural Madd is prolonged for 2 Harakat. Connected/Separated Madd extends for 4-5 Harakat, while Madd Lazim requires a full 6 Harakat."
        : "মাদ্দ (مدّ) অর্থ টেনে দীর্ঘ করা। মদ্দের মূল হরফ ৩টি: যবরের পর খালি আলিফ, পেশের পর ওয়াও সাকিন, এবং যেরের পর ইয়া সাকিন। মদ্দে আসলী বা স্বাভাবিক মদ্দে ২ হরকত টানতে হয়। তবে হামযাহ বা সাকিনের কারণে মদ্দে মুত্তাসিল বা মুনফাসিলে ৪-৫ হরকত এবং মদ্দে লাযিমে পূর্ণ ৬ হরকত পরিমাণ টানতে হয়।",
      makhrajHighlight: "Al-Jawf",
      demonstrationAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
    };
  }

  // 4.4 Ghunnah
  if (q.includes("গুন্নাহ") || q.includes("ghunnah")) {
    return {
      answerText: isEn
        ? "Ghunnah is a melodious nasal sound emerging from Al-Khayshum (nasal cavity). Noon Mushaddad (نّ) and Meem Mushaddad (مّ) always require obligatory Ghunnah held for exactly 2 Harakat."
        : "গুন্নাহ হলো নাকের বাঁশি (আল-খাইশূম) থেকে উৎপন্ন সুরযুক্ত মিষ্টি ধ্বনি। তাশদীদযুক্ত নূন (نّ) ও তাশদীদযুক্ত মীম (مّ)-এ সর্বদা ওয়াজিব গুন্নাহ করতে হয় এবং এর সময়কাল পূর্ণ ২ হরকত পরিমাণ।",
      makhrajHighlight: "Al-Khayshum",
      demonstrationAudioUrl: null,
    };
  }

  // 4.5 Idgham
  if (q.includes("ইদগাম") || q.includes("idgham")) {
    return {
      answerText: isEn
        ? "Idgham means merging. When Noon Saakin or Tanween is followed by any of the 6 letters of Yarmaloon (ي, ر, م, ل, و, ن), the Noon merges into the following letter. With Ra and Lam it is without Ghunnah, while with the others it includes Ghunnah."
        : "ইদগাম (إدغام) অর্থ মিলিয়ে পড়া। নূন সাকিন বা তানভীনের পর ইদগামের ৬টি হরফ (ي ر م ل و ن - ইয়ারমালূন) আসলে নূনকে পরবর্তী হরফের সাথে মিলিয়ে পড়তে হয়। এর মধ্যে র ও লাম-এ গুন্নাহ ছাড়া (বেলা-গুন্নাহ) এবং বাকি ৪টিতে গুন্নাহসহ (বা-গুন্নাহ) পড়তে হয়।",
      makhrajHighlight: "Al-Lisan",
      demonstrationAudioUrl: null,
    };
  }

  // 4.6 Izhar
  if (q.includes("ইযহার") || q.includes("ইজহার") || q.includes("izhar")) {
    return {
      answerText: isEn
        ? "Izhar means clarity. When Noon Saakin or Tanween is followed by any of the 6 throat letters (Hamzah, Ha, Ain, Haa, Ghain, Khaa), the Noon sound must be pronounced clearly without any nasal hum."
        : "ইযহার (إظهار) অর্থ স্পষ্ট করে পড়া। নূন সাকিন বা তানভীনের পর হলকী হরফ ৬টি (হামযাহ, হা, আইন, হা, গইন, খা) আসলে কোনো প্রকার গুন্নাহ ছাড়া নূনের মূল আওয়াজ স্পষ্ট উচ্চারণ করতে হয়। যেমন: مَنْ آمَنَ।",
      makhrajHighlight: "Al-Halq",
      demonstrationAudioUrl: null,
    };
  }

  // 4.7 Iqlab
  if (q.includes("ইক্বলাব") || q.includes("ইকলাব") || q.includes("iqlab")) {
    return {
      answerText: isEn
        ? "Iqlab means conversion. When Noon Saakin or Tanween is followed by the letter Ba (ب), the Noon sound is transformed into a Meem (م) with a gentle 2-Harakat nasal hum."
        : "ইক্বলাব (إقلاب) অর্থ পরিবর্তন করা। নূন সাকিন বা তানভীনের পর বা (ب) আসলে সেই নূন সাকিন বা তানভীনকে একটি ছোট্ট মীম (م) দ্বারা পরিবর্তন করে নাকের বাঁশিতে ২ হরকত গুন্নাহর সাথে পড়তে হয়। যেমন: مِنْ بَعْدِ।",
      makhrajHighlight: "Al-Khayshum",
      demonstrationAudioUrl: null,
    };
  }

  // 4.8 Waqf
  if (q.includes("ওয়াকফ") || q.includes("থামা") || q.includes("waqf")) {
    return {
      answerText: isEn
        ? "Waqf means stopping the voice and breath during recitation. When stopping on a word, the last letter takes a Sukoon; if it has Tanween with Fathah, it becomes a 2-Harakat Alif; and round Taa (ة) changes to Haa (ه) with Sukoon."
        : "ওয়াকফ (وقف) অর্থ তিলাওয়াতকালে শ্বাস ও আওয়াজ বন্ধ করে থামা। ওয়াকফ করার সময় শেষ হরফে সাকিন দিয়ে থামতে হয়। তবে শেষ হরফে দুই যবর থাকলে এক আলিফ টেনে পড়তে হয় এবং গোল তা (ة) থাকলে তা 'হা' (ه) সাকিন হয়ে যায়।",
      makhrajHighlight: null,
      demonstrationAudioUrl: null,
    };
  }

  // 4.9 Specific letter queries from MAKHARIJ_CANON
  for (const item of MAKHARIJ_CANON) {
    for (const letter of item.letters) {
      if (q.includes(letter) || (item.nameBn && q.includes(item.nameBn.toLowerCase()))) {
        return {
          answerText: `হরফ '${letter}' (${item.nameBn}): ${item.articulationDescBn} সাধারণ ভুল: ${item.commonErrorsBn} সংশোধনের উপায়: ${item.correctionTipBn}`,
          makhrajHighlight: item.category,
          demonstrationAudioUrl: null,
        };
      }
    }
  }

  // 5. Check institutional queries (admissions, campus, fees, contact)
  const localInstResponse = resolveLocalAssistantResponse(transcript);
  if (localInstResponse && !localInstResponse.includes("API Key দিন")) {
    return {
      answerText: localInstResponse.replace(/\*\*/g, "").replace(/•/g, "-"),
      makhrajHighlight: null,
      demonstrationAudioUrl: null,
    };
  }

  // 6. Generic intelligent Tajweed advice if no exact keyword match
  return {
    answerText: isEn
      ? "Tajweed requires patient listening and repetition. Focus on the 17 articulation points (Makharij) and gentle elongation of Madd letters. Feel free to ask about any specific letter, Surah, or rule."
      : "পবিত্র কুরআন তিলাওয়াতের সৌন্দর্য নির্ভর করে সঠিক মাখরাজ ও তাজবীদের ওপর। হরফের উচ্চারণ স্থান ও গুন্নাহর নিয়ম ঠিক রেখে ধীরেসুস্থে মশ্ক করুন। মাখরাজ, ইখফা, ক্বলক্বলাহ, মাদ্দ বা কোনো নির্দিষ্ট হরফের উচ্চারণ জানতে চাইলে সরাসরি মুখে বলুন।",
    makhrajHighlight: "Al-Halq",
    demonstrationAudioUrl: null,
  };
}

export async function POST(request) {
  try {
    const isCsrfSafe = await verifyCsrfOrigin(request);
    if (!isCsrfSafe) {
      return NextResponse.json({ ok: false, message: "CSRF verification failed" }, { status: 403 });
    }

    const _authContext = await resolveAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const {
      transcript = "",
      conversationHistory = [],
      voiceConfig = {},
      provider,
      model,
      apiKey: userApiKey,
      baseUrl,
    } = body;

    if (!transcript.trim()) {
      return NextResponse.json({ ok: false, message: "Transcript text is required" }, { status: 400 });
    }

    const emotion = voiceConfig.emotion || "encouraging";
    const language = voiceConfig.language || "bn-BD";
    const gender = voiceConfig.gender || "male";

    // 1. First resolve rich local deterministic answer
    const localResult = resolveTutorAnswer(transcript, language);

    // 2. If client supplied a valid BYOK key or central key, optionally augment with generative LLM
    const isBYOK = Boolean(userApiKey && userApiKey.trim());
    const hasCentralKey = Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);

    if (isBYOK || hasCentralKey) {
      try {
        const emotionPrompt =
          emotion === "calm"
            ? "Speak with a serene, patient, and soothing cadence."
            : emotion === "empathetic"
            ? "Speak with gentle empathy, kindness, and understanding."
            : emotion === "scholarly"
            ? "Speak with scholarly authority, precise terminology, and dignified presence."
            : emotion === "cheerful"
            ? "Speak with vibrant warmth, enthusiasm, and joyful encouragement."
            : "Speak with inspiring warmth and steady teacher confidence.";

        const systemPrompt = `You are "Nur" (নূর), an expert, compassionate Islamic Quran Teacher (${gender === "female" ? "Ustadha" : "Ustadh"}) for Rahmania Institute.
Language: ${language.startsWith("en") ? "Clear, natural English with Arabic citations" : "Warm, respectful, authoritative Bengali with Arabic citations"}.
Vocal Delivery Style: ${emotionPrompt}
Rules:
1. Answer the student's question directly about Quran recitation, Tajweed rules, or memorization.
2. Keep response natural, human-like, and conversational (under 90 words). Avoid robotic markdown; use spoken prose.`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...conversationHistory.slice(-3),
          { role: "user", content: transcript },
        ];

        const effectiveProvider = isBYOK
          ? provider || "openrouter"
          : process.env.OPENROUTER_API_KEY
          ? "openrouter"
          : "openai";

        const aiResponse = await executeAICompletion({
          provider: effectiveProvider,
          apiKey: userApiKey,
          model: model || undefined,
          baseUrl,
          messages,
          temperature: 0.3,
          maxTokens: 250,
        });

        if (aiResponse && aiResponse.content && aiResponse.content.trim()) {
          return NextResponse.json({
            ok: true,
            answerText: aiResponse.content.trim(),
            makhrajHighlight: localResult.makhrajHighlight,
            demonstrationAudioUrl: localResult.demonstrationAudioUrl,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (aiErr) {
        console.warn("LLM generation failed, falling back to rich local tutor engine:", aiErr?.message);
      }
    }

    // 3. Return rich local tutor answer
    return NextResponse.json({
      ok: true,
      answerText: localResult.answerText,
      makhrajHighlight: localResult.makhrajHighlight,
      demonstrationAudioUrl: localResult.demonstrationAudioUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("conversational-tutor API error:", err);
    return NextResponse.json({ ok: false, message: err.message || "Internal server error" }, { status: 500 });
  }
}
