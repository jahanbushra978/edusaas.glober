"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function QuranRecitationAssessment({
  verseAr = "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  verseMeaning = "",
  referenceAudio = "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
  onPassed,
}) {
  const { t, dir } = useLearningLanguage();

  const displayMeaning = verseMeaning || t.honestAssessment?.fatihaMeaning || "";

  const [isRecording, setIsRecording] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState("idle"); // 'idle' | 'recording' | 'analyzing' | 'completed'
  const [assessmentResult, setAssessmentResult] = useState(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  // Start Voice Recording
  const startRecording = () => {
    transcriptRef.current = "";
    setIsRecording(true);
    setAssessmentStatus("recording");
    setAssessmentResult(null);

    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = "ar-SA";
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (e) => {
            let full = "";
            for (let i = 0; i < e.results.length; i++) {
              full += e.results[i][0].transcript + " ";
            }
            transcriptRef.current = full.trim();
          };

          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }
    }
  };

  // Stop Recording and Perform Honest Assessment
  const stopRecordingAndAssess = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    setAssessmentStatus("analyzing");

    // Allow slight buffer
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanTranscript = (transcriptRef.current || "").trim();

    // STRICT HONEST ASSESSMENT LOGIC
    if (!cleanTranscript) {
      // Audio uncertain or no Arabic words detected
      setAssessmentResult({
        category: "uncertain_assessment",
        score: 45,
        passed: false,
        accuracyText: t.honestAssessment?.uncertain || "অনিশ্চিত — স্পষ্ট শব্দ ধরা যায়নি",
        feedback: t.honestAssessment?.uncertainFeedback || "মাইক্রোফোনে স্পষ্ট আওয়াজ পাওয়া যায়নি। শান্ত পরিবেশে কাছে এসে পুনরায় তিলাওয়াত করুন অথবা শিক্ষকের সহায়তা নিন।",
        recommendation: t.honestAssessment?.uncertainRec || "ক্বারীর অডিও ডেমোটি আবার শুনে ধীরেসুস্থে পাঠ করুন।",
      });
      setAssessmentStatus("completed");
      return;
    }

    // Normalized word comparison
    const targetWords = verseAr.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").split(/\s+/);
    const spokenWords = cleanTranscript.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").split(/\s+/);

    let matchCount = 0;
    targetWords.forEach((tw) => {
      if (spokenWords.some((sw) => sw.includes(tw) || tw.includes(sw))) {
        matchCount += 1;
      }
    });

    const ratio = matchCount / targetWords.length;

    if (ratio >= 0.8) {
      // Confirmed high accuracy
      setAssessmentResult({
        category: "passed",
        score: Math.round(ratio * 100),
        passed: true,
        accuracyText: t.honestAssessment?.mumtaz || "বিশুদ্ধ তিলাওয়াত (Mumtaz)",
        feedback: t.honestAssessment?.mumtazFeedback || "মাশাআল্লাহ! আপনার তিলাওয়াতের শব্দগঠন ও হরফের সংযোগ অত্যন্ত নির্ভুল হয়েছে।",
        recommendation: t.honestAssessment?.mumtazRec || "পরবর্তী পাঠে এগিয়ে যান।",
      });
      if (onPassed) onPassed();
    } else if (ratio >= 0.4) {
      // Potential pronunciation flaw or partial match
      setAssessmentResult({
        category: "potential_pronunciation_flaw",
        score: Math.round(ratio * 100),
        passed: false,
        accuracyText: t.honestAssessment?.moderate || "মাঝারি — কিছু শব্দে অস্পষ্টতা",
        feedback: t.honestAssessment?.moderateFeedback || "কিছু হরফের মাখরাজ ও শব্দ বিন্যাসে তারতম্য দেখা গেছে। আয়াতটি আরেকবার মনোযোগ দিয়ে শুনুন।",
        recommendation: t.honestAssessment?.moderateRec || "হরফগুলোর মাখরাজ পয়েন্ট দেখে ধীরেসুস্থে মাশক করুন।",
      });
    } else {
      // Confirmed textual mismatch
      setAssessmentResult({
        category: "text_mismatch",
        score: Math.round(ratio * 100),
        passed: false,
        accuracyText: t.honestAssessment?.mismatch || "ভুল — শব্দের অমিল",
        feedback: t.honestAssessment?.mismatchFeedback || "পঠিত শব্দের সাথে মূল আয়াতের বড় ধরনের অমিল ধরা পড়েছে। দয়া করে সঠিক আয়াতটি দেখে পড়ুন।",
        recommendation: t.honestAssessment?.mismatchRec || "ক্বারীর সাথে সাথে ৩ বার পুনরাবৃত্তি করুন।",
      });
    }

    setAssessmentStatus("completed");
  };

  const playReference = () => {
    try {
      const audio = new Audio(referenceAudio);
      audio.play().catch(() => {});
    } catch {}
  };

  return (
    <div
      dir={dir}
      className="w-full p-5 sm:p-6 rounded-3xl bg-[#091a14] border border-emerald-900/60 shadow-xl flex flex-col space-y-4"
    >
      <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.honestAssessment?.title || "সততা-ভিত্তিক এআই তিলাওয়াত মূল্যায়ন"}</span>
        </h4>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
          {t.honestAssessment?.realtime || "রিয়েল-টাইম"}
        </span>
      </div>

      {/* Target Verse Calligraphy */}
      <div className="p-4 rounded-2xl bg-[#05140d] border border-emerald-700/50 text-center space-y-2">
        <p dir="rtl" className="font-amiri text-3xl sm:text-4xl font-bold text-amber-300">
          {verseAr}
        </p>
        <p className="text-xs text-slate-300">{displayMeaning}</p>
      </div>

      {/* Actions: Reference Audio & Mic */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        <button
          type="button"
          onClick={playReference}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.honestAssessment?.listenQari || "আদর্শ ক্বারী তিলাওয়াত শুনুন"}</span>
        </button>

        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Mic className="w-4 h-4" />
            <span>{t.honestAssessment?.recordRecitation || "তিলাওয়াত রেকর্ড করুন"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecordingAndAssess}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg animate-pulse"
          >
            <MicOff className="w-4 h-4" />
            <span>{t.honestAssessment?.stopAndAssess || "রেকর্ডিং থামান ও মূল্যায়ন করুন"}</span>
          </button>
        )}
      </div>

      {/* Assessment Status / Result Box */}
      {assessmentStatus === "analyzing" && (
        <div className="text-center py-4 text-xs text-amber-300 font-bold animate-pulse">
          {t.honestAssessment?.analyzing || "তিলাওয়াত ধ্বনি ও মাখরাজ বিশ্লেষণ করা হচ্ছে..."}
        </div>
      )}

      {assessmentResult && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
            assessmentResult.passed
              ? "bg-emerald-950/60 border-emerald-500 text-emerald-100"
              : "bg-amber-950/60 border-amber-500 text-amber-100"
          }`}
        >
          <div className="flex items-center justify-between font-bold border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5">
              {assessmentResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span>{assessmentResult.accuracyText}</span>
            </span>
            <span className="text-amber-300 font-black text-sm">
              {t.honestAssessment?.scoreLabel || "স্কোর"}: {assessmentResult.score}%
            </span>
          </div>

          <p>{assessmentResult.feedback}</p>
          <p className="text-[11px] text-slate-300">
            💡 <strong>{t.honestAssessment?.adviceLabel || "পরামর্শ"}:</strong> {assessmentResult.recommendation}
          </p>

          {!assessmentResult.passed && (
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.honestAssessment?.teacherReviewOption || "সন্দেহ হলে উস্তাদের রিভিউ চাওয়া যাবে"}</span>
              </span>
              <button
                type="button"
                onClick={startRecording}
                className="text-amber-300 font-bold hover:underline"
              >
                {t.honestAssessment?.tryAgain || "আবার চেষ্টা করুন ➔"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
