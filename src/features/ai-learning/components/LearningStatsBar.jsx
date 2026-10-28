"use client";

import React, { useState } from "react";
import { Flame, Trophy, Heart, Globe, AlertCircle, Smile } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function LearningStatsBar({
  xp = 140,
  streak = 4,
  lives = 5,
  mistakesCount = 0,
  onOpenMistakes,
  studentName = "রাহমান",
}) {
  const { lang, setLanguage, t, dir } = useLearningLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-3xl bg-white/95 dark:bg-[#0c241a]/95 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-800/60 shadow-md shadow-emerald-950/5 relative z-30 transition-all"
    >
      {/* ── LEFT: STUDENT AVATAR & STREAK / XP / LIVES ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
        {/* Child Friendly Student Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100 shadow-xs">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
            <Smile className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-tight">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">আসসালামু আলাইকুম</span>
            <span className="text-xs font-extrabold text-emerald-950 dark:text-white">{studentName}</span>
          </div>
        </div>

        {/* Streak Flame */}
        <div 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-600/50 text-amber-800 dark:text-amber-300 shadow-xs hover:scale-102 transition-transform"
          title={`${streak} দিনের নিয়মিত পড়ার স্ট্রিক`}
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-xs font-black">{streak}</span>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-200 font-semibold hidden sm:inline">{t.days}</span>
        </div>

        {/* XP Points (Onosaee Gold Badge) */}
        <div 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-600/50 text-emerald-800 dark:text-emerald-300 shadow-xs hover:scale-102 transition-transform"
          title={`${xp} অর্জিত শিক্ষা পয়েন্ট (XP)`}
        >
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs font-black">{xp}</span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-200 font-semibold hidden sm:inline">XP</span>
        </div>

        {/* Focus / Lives (❤️ 5 Hearts) */}
        <div 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300/80 dark:border-rose-600/50 text-rose-800 dark:text-rose-300 shadow-xs hover:scale-102 transition-transform"
          title={`বর্তমান লাইফ: ${lives} / ৫ (ভুল হলে ১ লাইফ কমে)`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="text-xs font-black">{lives}</span>
        </div>
      </div>

      {/* ── RIGHT: MISTAKES REVIEW & 3-LANGUAGE SELECTOR ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Review Mistakes Button */}
        {mistakesCount > 0 && (
          <button
            type="button"
            onClick={onOpenMistakes}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-600 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
            title="ভুলগুলো আবার অনুশীলন করো"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">{t.reviewMistakes}</span>
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {mistakesCount}
            </span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            aria-label="ভাষা পরিবর্তন করুন"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="uppercase tracking-wider font-extrabold">{lang}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-38 rounded-2xl bg-white dark:bg-[#071d14] border border-emerald-200 dark:border-emerald-700 shadow-xl p-1.5 z-50 flex flex-col space-y-1 animate-fade-in">
              {[
                { code: "bn", label: "বাংলা (BN)" },
                { code: "en", label: "English (EN)" },
                { code: "ar", label: "العربية (AR)" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    lang === l.code
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/80"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
