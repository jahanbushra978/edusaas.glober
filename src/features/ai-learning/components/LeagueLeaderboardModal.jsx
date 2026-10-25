"use client";

import React from "react";
import { X, Trophy, Award, ArrowUp } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function LeagueLeaderboardModal({
  isOpen,
  onClose,
  userXp = 140,
}) {
  const { lang, dir } = useLearningLanguage();

  if (!isOpen) return null;

  // Realistic Madrasa & SaaS student rankings
  const rankings = [
    { rank: 1, name: "আব্দুল্লাহ আল-মাহমুদ", avatar: "👳", xp: Math.max(340, userXp + 80), league: "Diamond", isUser: false },
    { rank: 2, name: "ফাতিমা বিনতে হাসান", avatar: "🧕", xp: Math.max(290, userXp + 45), league: "Diamond", isUser: false },
    { rank: 3, name: lang === "en" ? "You (Learner)" : lang === "ar" ? "أنت (المتعلم)" : "আপনি (শিক্ষার্থী)", avatar: "🌟", xp: userXp, league: "Emerald", isUser: true },
    { rank: 4, name: "মুহাম্মদ রাফি", avatar: "👦", xp: Math.max(85, userXp - 30), league: "Gold", isUser: false },
    { rank: 5, name: "মারিয়াম তাসনিম", avatar: "👧", xp: Math.max(60, userXp - 50), league: "Silver", isUser: false },
    { rank: 6, name: "যোবায়ের আহমেদ", avatar: "👳", xp: Math.max(40, userXp - 75), league: "Bronze", isUser: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div
        dir={dir}
        className="bg-[#071912] border-2 border-emerald-500/80 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/60 bg-[#05140d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === "en" ? "Emerald League" : lang === "ar" ? "دوري الزمرد" : "মরকত লিগ (Emerald League)"}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                  Top 3
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === "en" ? "Top 3 learners advance to Diamond League on Friday!" : lang === "ar" ? "أفضل ٣ متعلمين يتأهلون إلى الدوري الماسي الجمعة القادمة!" : "শীর্ষ ৩ জন শিক্ষার্থী আগামী জুমায় ডায়মন্ড লিগে উন্নীত হবেন!"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Promotion Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-b border-emerald-900/50 flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
          <div className="flex items-center gap-1.5">
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>{lang === "en" ? "Promotion Zone" : lang === "ar" ? "منطقة التأهل" : "উন্নীত হওয়ার অবস্থান"}</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">
            {lang === "en" ? "Resets in 3d 14h" : lang === "ar" ? "التحديث بعد ٣ أيام" : "বাকি ৩ দিন ১৪ ঘণ্টা"}
          </span>
        </div>

        {/* Rankings List */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[380px] overflow-y-auto">
          {rankings.map((student) => {
            return (
              <div
                key={student.rank}
                className={`p-3 rounded-2xl flex items-center justify-between gap-3 border transition-all ${
                  student.isUser
                    ? "bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border-amber-400 shadow-lg scale-[1.02] ring-1 ring-amber-400/50"
                    : "bg-[#040e0a] border-emerald-900/50 hover:border-emerald-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      student.rank === 1
                        ? "bg-amber-400 text-slate-950 shadow-md"
                        : student.rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : student.rank === 3
                        ? "bg-amber-700 text-amber-100"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {student.rank}
                  </span>

                  {/* Avatar & Name */}
                  <div className="text-xl shrink-0">{student.avatar}</div>
                  <div>
                    <h5
                      className={`text-xs font-bold leading-tight ${
                        student.isUser ? "text-amber-300 font-black" : "text-white"
                      }`}
                    >
                      {student.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">{student.league}</span>
                  </div>
                </div>

                {/* XP Score */}
                <div className="flex items-center gap-1 text-xs font-black text-amber-300 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{student.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-emerald-900/60 bg-[#05140d] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {lang === "en" ? "Close" : lang === "ar" ? "إغلاق" : "বন্ধ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
