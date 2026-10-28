"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Gift } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import { playMaShaAllahCelebration } from "../lib/arabicSoundPlayer";

const QUESTS_STORAGE_KEY = "noor_ai_daily_quests_v1";

export default function DailyQuestsModal({
  isOpen,
  onClose,
  completedLessonsCount = 0,
  xp = 0,
  onClaimReward,
}) {
  const { lang, dir } = useLearningLanguage();

  const [questsState, setQuestsState] = useState({
    quest1Claimed: false, // Complete 2 lessons -> +20 XP
    quest2Claimed: false, // Earn 30 XP -> +1 Heart / 15 XP
    quest3Claimed: false, // Perfect score -> +25 XP
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(QUESTS_STORAGE_KEY);
      if (saved) {
        setQuestsState(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveQuestsState = (newState) => {
    setQuestsState(newState);
    try {
      localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  };

  if (!isOpen) return null;

  const questList = [
    {
      id: "q1",
      title: {
        bn: "আজকের ২টি পাঠ সম্পন্ন করুন",
        en: "Complete 2 lessons today",
        ar: "أكمل درسين اليوم",
      },
      current: Math.min(2, completedLessonsCount),
      target: 2,
      reward: "+২০ XP",
      isReady: completedLessonsCount >= 2,
      isClaimed: questsState.quest1Claimed,
      claimKey: "quest1Claimed",
    },
    {
      id: "q2",
      title: {
        bn: "৫০ বা তার বেশি XP পয়েন্ট অর্জন করুন",
        en: "Earn 50 or more XP Points",
        ar: "احصل على ٥٠ نقطة خبرة أو أكثر",
      },
      current: Math.min(50, xp),
      target: 50,
      reward: "+২৫ XP",
      isReady: xp >= 50,
      isClaimed: questsState.quest2Claimed,
      claimKey: "quest2Claimed",
    },
    {
      id: "q3",
      title: {
        bn: "কুরআন কুইজে ১০০% বিশুদ্ধ স্কোর",
        en: "Score 100% pure in a lesson quiz",
        ar: "حقق نتيجة كاملة ١٠٠٪ في اختبار الدرس",
      },
      current: completedLessonsCount > 0 ? 1 : 0,
      target: 1,
      reward: "+১টি লাইভ (❤️)",
      isReady: completedLessonsCount > 0,
      isClaimed: questsState.quest3Claimed,
      claimKey: "quest3Claimed",
    },
  ];

  const handleClaim = (quest) => {
    playMaShaAllahCelebration();
    const updated = { ...questsState, [quest.claimKey]: true };
    saveQuestsState(updated);
    if (onClaimReward) {
      onClaimReward(quest);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div
        dir={dir}
        className="bg-white dark:bg-[#0c241a] border-2 border-emerald-200 dark:border-emerald-700/80 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden font-sans transition-all"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-[#071912] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {lang === "en" ? "Daily Quests & Rewards" : lang === "ar" ? "المهام والمكافآت اليومية" : "দৈনিক মিশন ও উপহার"}
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {lang === "en" ? "Complete tasks to unlock bonus rewards!" : lang === "ar" ? "أنجز المهام واحصل على مكافآت إضافية!" : "প্রতিদিনের মিশন সম্পন্ন করে বিশেষ পুরস্কার আনলক করুন!"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[420px] overflow-y-auto">
          {questList.map((q) => {
            const title = q.title[lang] || q.title.bn;
            const progressPercent = Math.min(100, Math.round((q.current / q.target) * 100));

            return (
              <div
                key={q.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#071d14] border border-slate-200 dark:border-emerald-900/70 shadow-xs flex flex-col space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight pr-2">
                    {title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold shrink-0">
                    {q.reward}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-emerald-950">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {q.current} / {q.target}
                  </span>

                  {q.isClaimed ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{lang === "en" ? "Claimed" : lang === "ar" ? "تم التحصيل" : "গৃহীত হয়েছে"}</span>
                    </span>
                  ) : q.isReady ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(q)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer animate-bounce"
                    >
                      {lang === "en" ? "Claim ➔" : lang === "ar" ? "تحصيل ➔" : "দাবি করুন ➔"}
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-medium">
                      {lang === "en" ? "In Progress" : lang === "ar" ? "قيد الإنجاز" : "চলমান"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-[#071912] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {lang === "en" ? "Close" : lang === "ar" ? "إغلاق" : "বন্ধ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
