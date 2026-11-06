import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { QuranGamesHub } from "@/features/ai-learning";

export const metadata = {
  title: "ছোটদের কুরআন লার্নিং গেমস — খেলে শিখি | Rahmania Institute",
  description: "শিশুদের জন্য আকর্ষণীয় কুরআন লার্নিং গেমস। হরকত বেলুন পপ, হরফ মেলানো মেমোরি কার্ড ও মাখরাজ লক্ষ্যভেদ গেম খেলে অর্জন করুন পয়েন্ট ও উপহার।",
  keywords: ["Quran Games", "কুরআন গেম", "ছোটদের কুরআন শিক্ষা", "খেলে শিখি", "হরকত বেলুন পপ", "মাখরাজ গেম"],
};

export default function QuranGamesRoute() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#071912] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── TOP HEADER ── */}
      <header className="h-14 sm:h-16 border-b border-emerald-100 dark:border-emerald-900/60 bg-white/95 dark:bg-[#0a2318]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/quran-tutor/learning"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">লার্নিং ড্যাশবোর্ড</span>
          </Link>
          <div className="h-4 sm:h-5 w-px bg-emerald-200 dark:bg-emerald-900/80 shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h1 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white truncate">
              ছোটদের কুরআন গেম জোন
            </h1>
          </div>
        </div>

        <Link
          href="/quran-tutor"
          className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline font-bold shrink-0"
        >
          <span className="hidden sm:inline">টিউটর </span>হোম ➔
        </Link>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-6">
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-400">গেমস লোড হচ্ছে...</div>}>
          <QuranGamesHub />
        </Suspense>
      </main>
    </div>
  );
}
