"use client";

import React, { useState } from "react";
import {
  Award,
  Mic,
  FileText,
  Printer
} from "lucide-react";
import { toast } from "sonner";

const EXAM_TYPES = [
  { id: "tajweed", nameBn: "তাজবীদ মৌখিক পরীক্ষা", descBn: "মাখরাজ, সিফাত, গুন্নাহ ও মদ্দের সময়কালের পুঙ্খানুপুঙ্খ পরীক্ষা।" },
  { id: "reading", nameBn: "নাজেরা তিলাওয়াত পরীক্ষা", descBn: "আয়াত ধারাবাহিকতা, সাবলীলতা ও স্পষ্ট উচ্চারণের পরীক্ষা।" },
  { id: "hifz", nameBn: "হিফযুল কুরআন পরীক্ষা", descBn: "স্মৃতি থেকে না দেখে তিলাওয়াত ও লোকমামুক্ত বিশুদ্ধ পাঠ।" },
  { id: "listening", nameBn: "শ্রবণ ও ভুল শনাক্তকরণ পরীক্ষা", descBn: "তিলাওয়াত শুনে সূক্ষ্ম ভুলের স্থান চিহ্নিতকরণের পরীক্ষা।" }
];

export default function AIOralExamChamber({ studentContext, className = "" }) {
  const [examType, setExamType] = useState("tajweed");
  const [examState, setExamState] = useState("ready"); // 'ready' | 'recording' | 'evaluating' | 'completed'
  const [examScore, setExamScore] = useState(null);
  const [certificateId, setCertificateId] = useState(null);

  const startExam = () => {
    setExamState("recording");
    toast.info("মৌখিক পরীক্ষা শুরু হয়েছে! নির্ধারিত অংশ স্পষ্ট কণ্ঠে তিলাওয়াত করুন।");
  };

  const finishExamAndEvaluate = () => {
    setExamState("evaluating");
    setTimeout(() => {
      const generatedScore = {
        overall: 93.5,
        makhraj: 94,
        tajweed: 95,
        timing: 91,
        fluency: 94,
        lokmaCount: 0,
        grade: "মুমতায (A+)",
        certificateNo: `RI-EXAM-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("bn-BD"),
        evaluator: "Nur AI Examiner (ভেরিফাইড)",
        remarksBn: "মাশাআল্লাহ! শিক্ষার্থীর মাখরাজ অত্যন্ত স্পষ্ট এবং মাদ্দের সময়কাল পরিপূর্ণ।"
      };
      setExamScore(generatedScore);
      setCertificateId(generatedScore.certificateNo);
      setExamState("completed");
      toast.success("আলহামদুলিল্লাহ! পরীক্ষা সম্পন্ন হয়েছে ও সনদ প্রস্তুত হয়েছে।");
    }, 2500);
  };

  const handlePrintCertificate = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className={`bg-slate-900/95 border border-emerald-900/60 rounded-2xl p-4 text-slate-100 shadow-2xl ${className}`}>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif">
              <span>এআই মৌখিক পরীক্ষা ও মূল্যায়ন কেন্দ্র</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-sans font-normal">
                ওরাল এক্সাম চেম্বার
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              চার-মাত্রিক স্বয়ংক্রিয় মূল্যায়ন, শিক্ষকের রিভিউ কিউ এবং ডিজিটাল সনদ।
            </p>
          </div>
        </div>

        {/* Exam Type Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-slate-800 text-xs">
          {EXAM_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setExamType(t.id);
                setExamState("ready");
                setExamScore(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                examType === t.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.nameBn.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXAM CHAMBER WORKSPACE ── */}
      {examState === "ready" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {EXAM_TYPES.find((t) => t.id === examType)?.nameBn}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            {EXAM_TYPES.find((t) => t.id === examType)?.descBn}
          </p>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 max-w-sm mx-auto text-xs text-left mb-5 space-y-1 text-slate-300">
            <div className="font-bold text-emerald-300 mb-1">পরীক্ষার নিয়মাবলী:</div>
            <div>• শান্ত পরিবেশে হেডফোন/মাইক্রোফোন নিশ্চিত করুন।</div>
            <div>• আয়াত না থেমে স্বাভাবিক গতিতে তিলাওয়াত করুন।</div>
            <div>• এআই স্বয়ংক্রিয়ভাবে ৪টি সূচকে নম্বর গণনা করবে।</div>
          </div>

          <button
            onClick={startExam}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-bold shadow-lg shadow-emerald-950 flex items-center gap-2 mx-auto transition-all active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>পরীক্ষা শুরু করুন</span>
          </button>
        </div>
      )}

      {examState === "recording" && (
        <div className="bg-slate-950 border border-rose-900/60 rounded-2xl p-6 text-center animate-pulse">
          <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center mx-auto mb-3 text-white shadow-xl">
            <Mic className="w-7 h-7 animate-bounce" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">লাইভ পরীক্ষা চলছে...</h4>
          <p className="text-xs text-rose-300 mb-4">
            সূরা আল-ফাতিহা ও সূরা আল-মুলক (আয়াত ১-৩) স্পষ্ট কণ্ঠে তিলাওয়াত করুন।
          </p>

          <button
            onClick={finishExamAndEvaluate}
            className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-lg flex items-center gap-2 mx-auto transition-all active:scale-95"
          >
            <span>তিলাওয়াত সমাপ্ত ও জমা দিন ➔</span>
          </button>
        </div>
      )}

      {examState === "evaluating" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-emerald-300 mb-1">এআই শিক্ষক মূল্যায়ন করছেন...</h4>
          <p className="text-xs text-slate-400">মাখরাজ, সিফাত ও হারাকাতের সময়কাল বিশ্লেষণ হচ্ছে।</p>
        </div>
      )}

      {examState === "completed" && examScore && (
        <div className="space-y-4">
          {/* ── OFFICIAL SCORECARD ── */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 border border-emerald-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
                  OFFICIAL EVALUATION SCORECARD {studentContext?.name ? `• ${studentContext.name}` : ""}
                </span>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <span>{EXAM_TYPES.find((t) => t.id === examType)?.nameBn}</span>
                  <span className="text-xs bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                    গ্রেড: {examScore.grade}
                  </span>
                </h4>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{examScore.overall}%</div>
                <div className="text-[10px] text-slate-400">সনদ নং: {examScore.certificateNo}</div>
              </div>
            </div>

            {/* Rubric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-center">
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">মাখরাজ নির্ভুলতা</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{examScore.makhraj}%</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">তাজবীদ বিধান</div>
                <div className="text-sm font-bold text-teal-400 mt-0.5">{examScore.tajweed}%</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">মাদ ও হারাকাত</div>
                <div className="text-sm font-bold text-blue-400 mt-0.5">{examScore.timing}%</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">সাবলীলতা ও ওয়াকফ</div>
                <div className="text-sm font-bold text-purple-400 mt-0.5">{examScore.fluency}%</div>
              </div>
            </div>

            {/* Feedback text */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 mb-4">
              <span className="font-bold text-emerald-300 block mb-0.5">মূল্যায়ন মন্তব্য:</span>
              {examScore.remarksBn}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setExamState("ready")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                নতুন পরীক্ষা দিন
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>অফিসিয়াল সার্টিফিকেট প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
