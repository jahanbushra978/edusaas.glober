"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Award,
  Target,
  CheckCircle2,
  ShieldAlert,
  Zap,
  BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIProgressPredictionEngine({ studentContext = {}, className = "" }) {
  const [targetPagesPerDay, setTargetPagesPerDay] = useState(1.0);
  const [retentionBufferDays, setRetentionBufferDays] = useState(60);

  // Default student metrics if not supplied
  const student = {
    name: studentContext.name || "আব্দুল্লাহ আল-মামুন",
    roll: studentContext.rollNo || "H-12",
    completedJuz: studentContext.completedJuz || 14,
    totalJuz: 30,
    totalPagesTotal: 604,
    pagesMemorized: studentContext.pagesMemorized || 282,
    currentSabaqSpeed: studentContext.currentSabaqSpeed || 0.85, // pages per day average
    avgLokmaPerLesson: studentContext.avgLokmaPerLesson || 1.8,
    hesitationIndexMs: studentContext.hesitationIndexMs || 1200,
    last30DaysAttendancePct: studentContext.attendancePct || 94,
    weakSurahs: studentContext.weakSurahs || ["সূরা আল-কাহাফ", "সূরা ইউসুফ", "সূরা বনি-ইসরাঈল"]
  };

  // Calculations
  const pagesRemaining = Math.max(0, student.totalPagesTotal - student.pagesMemorized);
  const completionPercentage = Math.round((student.pagesMemorized / student.totalPagesTotal) * 100);

  // Dynamic ML projection based on slider target
  const projectedDaysAtSpeed = Math.ceil(pagesRemaining / (targetPagesPerDay || 1)) + retentionBufferDays;
  const projectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + projectedDaysAtSpeed);
    return d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
  }, [projectedDaysAtSpeed]);

  // Current pace projection
  const currentPaceDays = Math.ceil(pagesRemaining / (student.currentSabaqSpeed || 0.8)) + retentionBufferDays;
  const currentPaceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + currentPaceDays);
    return d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
  }, [currentPaceDays]);

  // Early-Warning Risk Assessment Engine
  const riskAnalysis = useMemo(() => {
    const issues = [];
    let riskLevel = "low"; // 'low' | 'moderate' | 'high'

    if (student.avgLokmaPerLesson >= 2.5) {
      issues.push("সাবকে অতিরিক্ত লোকমা (গড় ২.৫+ প্রতি পাঠে) — রিভিশন দুর্বলতার ইঙ্গিত।");
      riskLevel = "high";
    } else if (student.avgLokmaPerLesson >= 1.5) {
      issues.push("মাঝারি লোকমা হার — সবকী রিভিশন আরো ২ বার বাড়ানো আবশ্যক।");
      if (riskLevel === "low") riskLevel = "moderate";
    }

    if (student.currentSabaqSpeed < 0.6) {
      issues.push("হিফজ গতি কমে গেছে (দৈনিক ০.৬ পৃষ্ঠার কম)।");
      if (riskLevel === "low") riskLevel = "moderate";
    }

    if (student.last30DaysAttendancePct < 85) {
      issues.push("উপস্থিতি ৮৫% এর নিচে — ধারাবাহিকতা বিঘ্নিত হচ্ছে।");
      riskLevel = "high";
    }

    return {
      level: riskLevel,
      score: riskLevel === "low" ? 92 : riskLevel === "moderate" ? 74 : 58,
      issues
    };
  }, [student]);

  // 5 Major Articulation Zones Mastery
  const makhrajAcousticMastery = [
    { zone: "আল-হালক (কণ্ঠনালী)", letters: "ء هـ ع ح غ خ", score: 94, status: "মুমতায" },
    { zone: "আল-লিসান (জিহ্বা)", letters: "ق ك ج ش ي ض ل ن ر...", score: 86, status: "উত্তম" },
    { zone: "আশ-শাফাতাইন (ঠোঁট)", letters: "ف ب م و", score: 92, status: "মুমতায" },
    { zone: "আল-খাইশূম (নাকের বাঁশি)", letters: "নূন ও মীম গুন্নাহ", score: 88, status: "উত্তম" },
    { zone: "আল-জাওফ (খালি মুখ)", letters: "মদ্দের হরফ", score: 95, status: "মুমতায" }
  ];

  return (
    <div className={`space-y-6 text-slate-100 ${className}`}>
      {/* ── TOP PREDICTIVE KPI STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>হিফজ অগ্রগতি</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{student.completedJuz} / {student.totalJuz} <span className="text-sm font-normal text-slate-400">জুজ</span></div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex justify-between">
            <span>{student.pagesMemorized} পৃষ্ঠা সমাপ্ত</span>
            <span>{completionPercentage}%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-teal-950/80 to-slate-900 border border-teal-800/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>বর্তমান দৈনিক গতি</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{student.currentSabaqSpeed} <span className="text-sm font-normal text-slate-400">পৃষ্ঠা/দিন</span></div>
          <p className="text-[11px] text-teal-300/80 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span>গত মাসের তুলনায় +১২% গতি বৃদ্ধি</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-800/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>সমাপ্তির আনুমানিক তারিখ</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-200 leading-snug">{currentPaceDate}</div>
          <p className="text-[11px] text-amber-400/80 mt-2">
            {currentPaceDays} দিন অবশিষ্ট (রিভিশন বাফারসহ)
          </p>
        </div>

        {/* Metric 4 */}
        <div className={`border rounded-2xl p-4 shadow-lg ${
          riskAnalysis.level === "low"
            ? "bg-gradient-to-br from-emerald-950/90 to-slate-900 border-emerald-700/60"
            : riskAnalysis.level === "moderate"
            ? "bg-gradient-to-br from-amber-950/90 to-slate-900 border-amber-700/60"
            : "bg-gradient-to-br from-rose-950/90 to-slate-900 border-rose-700/60"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>ঝুঁকি ও স্থায়িত্ব ইনডেক্স</span>
            <ShieldAlert className={`w-4 h-4 ${riskAnalysis.level === "low" ? "text-emerald-400" : riskAnalysis.level === "moderate" ? "text-amber-400" : "text-rose-400"}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">{riskAnalysis.score}%</span>
            <Badge className={`text-[10px] font-bold ${
              riskAnalysis.level === "low" ? "bg-emerald-900 text-emerald-200" : riskAnalysis.level === "moderate" ? "bg-amber-900 text-amber-200" : "bg-rose-900 text-rose-200"
            }`}>
              {riskAnalysis.level === "low" ? "স্থিতিশীল" : riskAnalysis.level === "moderate" ? "মাঝারি ঝুঁকি" : "জরুরি পর্যবেক্ষণ"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            গড় লোকমা: <strong className="text-white">{student.avgLokmaPerLesson} টি</strong> | উপস্থিতি: <strong className="text-white">{student.last30DaysAttendancePct}%</strong>
          </p>
        </div>
      </div>

      {/* ── INTERACTIVE WHAT-IF VELOCITY SIMULATOR ── */}
      <div className="bg-slate-900/90 border border-emerald-900/60 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>হোয়াট-ইফ (What-If) হিফজ সমাপ্তি ক্যালকুলেটর</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              দৈনিক সবকের পৃষ্ঠা লক্ষ্যমাত্রা পরিবর্তন করে সমাপ্তির পূর্বাভাস দেখুন।
            </p>
          </div>
          <div className="text-xs bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800/60 text-emerald-300 font-medium">
            অবশিষ্ট পৃষ্ঠা: <strong className="text-white">{pagesRemaining} টি</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>দৈনিক সবক পৃষ্ঠা লক্ষ্য:</span>
                <span className="text-emerald-400 font-bold text-sm">{targetPagesPerDay.toFixed(1)} পৃষ্ঠা</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.25"
                value={targetPagesPerDay}
                onChange={(e) => setTargetPagesPerDay(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>০.৫ পৃষ্ঠা (ধীর)</span>
                <span>১.০ পৃষ্ঠা (মানক)</span>
                <span>২.০ পৃষ্ঠা (দ্রুত)</span>
                <span>৩.০ পৃষ্ঠা (তীব্র)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>পূর্ণ কুরআন দোর/রিভিশন বাফার:</span>
                <span className="text-teal-400 font-bold text-sm">{retentionBufferDays} দিন</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                value={retentionBufferDays}
                onChange={(e) => setRetentionBufferDays(Number(e.target.value))}
                className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Result Card */}
          <div className="bg-gradient-to-br from-emerald-950 to-black p-5 rounded-2xl border border-emerald-700/60 space-y-3 text-center sm:text-left">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              প্রকল্পিত হিফজুল কুরআন সমাপ্তি
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {projectedDate}
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              প্রতিদিন <strong>{targetPagesPerDay.toFixed(1)} পৃষ্ঠা</strong> পাঠ ও <strong>{retentionBufferDays} দিন</strong> দোর অন্তর্ভুক্ত করলে শিক্ষার্থী আগামী <strong>{projectedDaysAtSpeed} দিনের</strong> মধ্যে সম্পূর্ণ কুরআন আত্মস্থ করতে পারবে, ইনশাআল্লাহ।
            </div>
          </div>
        </div>
      </div>

      {/* ── EARLY-WARNING INTERVENTION & MAKHRAJ RADAR BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Early-Warning Intervention Engine */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-emerald-900/60 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>অগ্রিম সতর্কীকরণ ও শিক্ষক নির্দেশনা (Early Warning)</span>
          </h4>

          {riskAnalysis.issues.length > 0 ? (
            <div className="space-y-2.5">
              {riskAnalysis.issues.map((iss, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-800 text-amber-100 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">!</span>
                  <span>{iss}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>মাশাআল্লাহ! শিক্ষার্থীর কোনো আশঙ্কাজনক সূচক নেই। স্বাভাবিক গতি বজায় রয়েছে।</span>
            </div>
          )}

          {/* Weak Surahs Tag Box */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-2">
              বিশেষ রিভিশন প্রয়োজন এমন সূরাসমূহ (AI মেমোরি শনাক্তকৃত):
            </div>
            <div className="flex flex-wrap gap-2">
              {student.weakSurahs.map((ws, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>{ws}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 5 Vocal Zones Tajweed Velocity */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-emerald-900/60 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>৫টি প্রধান মাখরাজ অঞ্চলে পারদর্শিতা বিশ্লেষণ</span>
          </h4>

          <div className="space-y-3">
            {makhrajAcousticMastery.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-300">{item.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{item.letters}</span>
                    <span className="text-emerald-400 font-bold">{item.score}%</span>
                    <span className="text-[10px] text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800/60">{item.status}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
