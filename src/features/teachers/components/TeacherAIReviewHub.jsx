"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Volume2,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Sliders,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Initial mock submissions representing real-world student submissions to the AI Tutor
const INITIAL_SUBMISSIONS = [
  {
    id: "sub-101",
    studentId: "std-01",
    studentName: "আব্দুল্লাহ আল-মামুন",
    rollNo: "H-12",
    batch: "হিফজ বিভাগ (ব্যাচ ক)",
    examType: "tajweed",
    examTitle: "সূরা আন-নাস (আয়াত ১-৬) তাজবীদ পরীক্ষা",
    submittedAt: "আজ, বেলা ১১:২০",
    audioDuration: "১ মিনিট ৪৫ সেকেন্ড",
    status: "pending", // pending | approved | rejected
    aiScore: {
      overall: 88.5,
      makhraj: 86,
      tajweed: 89,
      fluency: 92,
      lokma: 0,
      deviations: [
        { word: "مِنْ شَرِّ", rule: "ইখফা হাকিকী", issue: "গুন্নাহর পরিমাণ ১.৫ হরকত ছিল (২ হরকত কাম্য)", timestamp: "0:22" },
        { word: "الْوَسْوَاسِ", rule: "হরফের মাখরাজ", issue: "সীন হরফে সফীর (বাঁশির ন্যায় আওয়াজ) কিছুটা অস্পষ্ট", timestamp: "0:45" }
      ]
    },
    teacherOverride: null,
    teacherNotes: ""
  },
  {
    id: "sub-102",
    studentId: "std-02",
    studentName: "মুহাম্মদ সালমান ফারসী",
    rollNo: "H-05",
    batch: "হিফজ বিভাগ (ব্যাচ খ)",
    examType: "hifz",
    examTitle: "সূরা আল-মুলক (আয়াত ১-১০) হিফজ সাবক পরীক্ষা",
    submittedAt: "আজ, সকাল ৯:১৫",
    audioDuration: "৩ মিনিট ১০ সেকেন্ড",
    status: "pending",
    aiScore: {
      overall: 78.0,
      makhraj: 82,
      tajweed: 76,
      fluency: 76,
      lokma: 2,
      deviations: [
        { word: "فَارْجِعِ الْبَصَرَ", rule: "আয়াত ধারাবাহিকতা", issue: "আয়াত ৩ ও ৪ এর মাঝে ৩ সেকেন্ড অতিরিক্ত বিরতি (লোকমা-১)", timestamp: "1:15" },
        { word: "هَلْ تَرَىٰ مِن فُطُورٍ", rule: "ইখফা", issue: "ফা হরফে গুন্নাহ অসম্পূর্ণ ছিল", timestamp: "1:42" }
      ]
    },
    teacherOverride: null,
    teacherNotes: ""
  },
  {
    id: "sub-103",
    studentId: "std-03",
    studentName: "ফাতিমা বিনতে ইউসুফ",
    rollNo: "N-20",
    batch: "নাজেরা বিভাগ",
    examType: "reading",
    examTitle: "সূরা আর-রহমান (১ম রুকু) নাজেরা সাবলীলতা",
    submittedAt: "গতকাল, বিকাল ৪:৫০",
    audioDuration: "২ মিনিট ৩৫ সেকেন্ড",
    status: "approved",
    aiScore: {
      overall: 95.0,
      makhraj: 96,
      tajweed: 94,
      fluency: 95,
      lokma: 0,
      deviations: []
    },
    teacherOverride: {
      overall: 96.0,
      makhraj: 97,
      tajweed: 95,
      fluency: 96,
      remarks: "মাশাআল্লাহ! উচ্চারণ অত্যন্ত সাবলীল ও স্পষ্ট।"
    },
    teacherNotes: "অত্যন্ত চমৎকার তিলাওয়াত। পরবর্তী পারায় যাওয়ার অনুমতি দেওয়া হলো।"
  }
];

export default function TeacherAIReviewHub({ students = [], teacherName = "উস্তাদ" }) {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selectedSubId, setSelectedSubId] = useState(INITIAL_SUBMISSIONS[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'approved'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Edit / Override State for the selected submission
  const selectedSub = submissions.find((s) => s.id === selectedSubId);
  const [overrideMakhraj, setOverrideMakhraj] = useState(selectedSub?.aiScore.makhraj || 85);
  const [overrideTajweed, setOverrideTajweed] = useState(selectedSub?.aiScore.tajweed || 85);
  const [overrideFluency, setOverrideFluency] = useState(selectedSub?.aiScore.fluency || 85);
  const [teacherRemarks, setTeacherRemarks] = useState(selectedSub?.teacherNotes || "");
  const [isApplying, setIsApplying] = useState(false);

  const handleSelectSubmission = (sub) => {
    setSelectedSubId(sub.id);
    const m = sub.teacherOverride ? sub.teacherOverride.makhraj : sub.aiScore.makhraj;
    const t = sub.teacherOverride ? sub.teacherOverride.tajweed : sub.aiScore.tajweed;
    const f = sub.teacherOverride ? sub.teacherOverride.fluency : sub.aiScore.fluency;
    setOverrideMakhraj(m);
    setOverrideTajweed(t);
    setOverrideFluency(f);
    setTeacherRemarks(sub.teacherNotes || "");
  };

  const calculatedOverall = Math.round((overrideMakhraj * 0.4 + overrideTajweed * 0.4 + overrideFluency * 0.2) * 10) / 10;

  const handleApprove = (isApproved) => {
    if (!selectedSub) return;
    setIsApplying(true);

    setTimeout(() => {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id === selectedSub.id) {
            return {
              ...s,
              status: isApproved ? "approved" : "rejected",
              teacherNotes: teacherRemarks,
              teacherOverride: {
                overall: calculatedOverall,
                makhraj: overrideMakhraj,
                tajweed: overrideTajweed,
                fluency: overrideFluency,
                remarks: teacherRemarks,
                approvedBy: teacherName,
                approvedAt: new Date().toLocaleTimeString("bn-BD")
              }
            };
          }
          return s;
        })
      );
      setIsApplying(false);
      if (isApproved) {
        toast.success(`মাশাআল্লাহ! ${selectedSub.studentName} এর মৌখিক পরীক্ষা অনুমোদিত হয়েছে ও সনদ হালনাগাদ করা হয়েছে।`);
      } else {
        toast.info(`${selectedSub.studentName} কে সংশোধনের জন্য নির্দেশ পাঠানো হয়েছে।`);
      }
    }, 600);
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  return (
    <div className="bg-slate-900/90 text-slate-100 rounded-2xl border border-emerald-900/60 p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>AI মৌখিক পরীক্ষা ও শিক্ষক ওভাররাইড হাব</span>
            <Badge className="bg-emerald-900/80 text-emerald-300 border-emerald-700/60 text-xs">
              হিউম্যান-ইন-দ্য-লুপ (Human-in-the-Loop)
            </Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            এআই পরীক্ষক দ্বারা মূল্যায়নকৃত শিক্ষার্থীর তিলাওয়াত অডিও শুনুন, স্কোর সংশোধন করুন এবং সার্টিফিকেট অনুমোদন দিন।
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-emerald-900/60 text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === "all" ? "bg-emerald-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            সব ({submissions.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === "pending" ? "bg-amber-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            অপেক্ষমান ({submissions.filter((s) => s.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === "approved" ? "bg-teal-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            অনুমোদিত ({submissions.filter((s) => s.status === "approved").length})
          </button>
        </div>
      </div>

      {/* Grid Layout: Submissions List (Left) + Detail & Override Chamber (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submissions Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>পরীক্ষা তালিকা ({filteredSubmissions.length} টি)</span>
            <span>জমা পড়ার সময়</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredSubmissions.map((sub) => {
              const isSelected = sub.id === selectedSubId;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50"
                      : "bg-slate-950/60 border-slate-800 hover:border-emerald-800/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{sub.studentName}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>রোল: {sub.rollNo}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{sub.batch}</span>
                      </div>
                    </div>
                    <div>
                      {sub.status === "approved" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-400" /> অনুমোদিত
                        </span>
                      ) : sub.status === "rejected" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-rose-400" /> পুনঃপরীক্ষা
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> অপেক্ষমান
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium truncate mb-2">{sub.examTitle}</p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                    <span>AI স্কোর: <strong className="text-emerald-300">{sub.teacherOverride ? sub.teacherOverride.overall : sub.aiScore.overall}%</strong></span>
                    <span>{sub.submittedAt}</span>
                  </div>
                </div>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                কোনো পরীক্ষা পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Evaluation & Human-in-the-Loop Override */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-5">
          {selectedSub ? (
            <>
              {/* Submission Title Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>{selectedSub.examTitle}</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>শিক্ষার্থী: <strong className="text-white">{selectedSub.studentName}</strong></span>
                    <span>রোল: {selectedSub.rollNo}</span>
                    <span>সময়: {selectedSub.audioDuration}</span>
                  </div>
                </div>

                {/* Audio Player Action */}
                <button
                  onClick={() => {
                    setIsPlayingAudio(!isPlayingAudio);
                    if (!isPlayingAudio) toast.info("তিলাওয়াত অডিও প্লেব্যাক শুরু হয়েছে...");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPlayingAudio
                      ? "bg-amber-600 text-white animate-pulse"
                      : "bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? "অডিও বাজছে..." : "রেকর্ডিং শুনুন"}</span>
                </button>
              </div>

              {/* AI Diagnosis Deviations Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-950 space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>এআই ফনোলজি ও তাজবীদ বিশ্লেষণ ফলাফল</span>
                </h4>
                {selectedSub.aiScore.deviations.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedSub.aiScore.deviations.map((dev, i) => (
                      <div key={i} className="text-xs bg-black/40 p-2 rounded-lg border border-slate-800 flex items-start justify-between">
                        <div>
                          <span className="font-bold text-amber-200 font-serif text-sm mr-2">{dev.word}</span>
                          <span className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono mr-2">{dev.rule}</span>
                          <span className="text-slate-300 text-[11px]">{dev.issue}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{dev.timestamp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>মাশাআল্লাহ! কোনো লহন (লহনে জলী বা খফী) পাওয়া যায়নি। বিশুদ্ধ তিলাওয়াত।</span>
                  </div>
                )}
              </div>

              {/* Teacher Override Sliders */}
              <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-400" />
                    <span>শিক্ষক ম্যানুয়াল মূল্যায়ন ও ওভাররাইড</span>
                  </h4>
                  <div className="text-xs font-bold text-emerald-400">
                    চূড়ান্ত সমন্বিত স্কোর: <span className="text-base text-white">{calculatedOverall}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 font-medium">
                      <span>মাখরাজ (৪০%)</span>
                      <span className="text-emerald-400 font-bold">{overrideMakhraj}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={overrideMakhraj}
                      onChange={(e) => setOverrideMakhraj(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 font-medium">
                      <span>তাজবীদ (৪০%)</span>
                      <span className="text-emerald-400 font-bold">{overrideTajweed}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={overrideTajweed}
                      onChange={(e) => setOverrideTajweed(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 font-medium">
                      <span>সাবলীলতা (২০%)</span>
                      <span className="text-emerald-400 font-bold">{overrideFluency}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={overrideFluency}
                      onChange={(e) => setOverrideFluency(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Ustadh Feedback Field */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    উস্তাদের মন্তব্য ও পরবর্তী ক্লাসের নির্দেশিকা:
                  </label>
                  <textarea
                    rows={2}
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                    placeholder="যেমন: মাশাআল্লাহ চমৎকার হয়েছে। গুন্নাহ ২ হরকত ঠিক রাখুন..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(false)}
                  disabled={isApplying}
                  className="border-rose-800/80 text-rose-300 hover:bg-rose-950/60 rounded-xl text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>পুনঃপরীক্ষার নির্দেশ দিন</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApprove(true)}
                  disabled={isApplying}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-emerald-700/30 px-5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{isApplying ? "সংরক্ষণ হচ্ছে..." : "স্কোর নিশ্চিত ও অনুমোদন করুন"}</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500 text-sm">
              বাম পাশের তালিকা থেকে একটি পরীক্ষা নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
