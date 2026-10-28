"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Volume2, Mic, GraduationCap, ArrowRight } from "lucide-react";

export default function NurAIBanner() {
  const handleOpenNur = (tab = "nur-lesson") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-chat", { detail: { tab } }));
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#0a1f18] via-[#0d2a20] to-[#0a1f18] text-white relative overflow-hidden border-y border-emerald-900/40">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>প্রোপাইটরি এআই প্রযুক্তি • ২৪/৭ ব্যক্তিগত শিক্ষক</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-white tracking-tight">
            নূর AI কুরআন শিক্ষক <span className="text-[#D4AF37]">(Nur AI Quran Tutor)</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            একজন অভিজ্ঞ হাফেজ ও কারির মতো তিলাওয়াত শুনবে, তাজবীদ ও মাখরাজের ভুল ধরবে, শুদ্ধ উচ্চারণ শোনাবে এবং নিয়মিত অনুশীলনে দক্ষ করে তুলবে।
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1 */}
          <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-6 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-950/40 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-serif mb-1.5">
              ৬-ধাপের পেডাগজিক্যাল লুপ
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ব্যাখ্যা ➔ ডেমো ➔ অনুশীলন ➔ মূল্যায়ন ➔ সংশোধন ➔ পুনরাবৃত্তি—দক্ষ শিক্ষক চক্র।
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-6 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-950/40 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform shadow-sm">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-serif mb-1.5">
              ১৭টি মাখরাজ গাইড
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              কণ্ঠনালী, জিহ্বা, ঠোঁট ও নাকের বাঁশি থেকে হরফের সঠিক নির্গমন স্থান অ্যানিমেশনসহ।
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-6 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-950/40 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-serif mb-1.5">
              লাইভ তিলাওয়াত মূল্যায়ন
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              মাইকে তিলাওয়াত শুনে 🟢 সঠিক, 🟡 উন্নতি দরকার ও 🔴 ভুল শব্দ চিহ্নিত করে তাৎক্ষণিক স্কোর।
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/80 border border-emerald-800/40 rounded-3xl p-6 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-950/40 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-serif mb-1.5">
              হিফজ ও ক্লাসরুম ট্র্যাকিং
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              সবক, সাত সবক, আমুখতা ও লোকমা ট্র্যাকিংয়ের সাথে সরাসরি সংযুক্ত মাদরাসা রেকর্ড।
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-center">
          <Link
            href="/ai-quran-learning"
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-full text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all active:scale-95 ring-2 ring-amber-300/40 hover:-translate-y-0.5"
          >
            <span>🎯 এআই কোরআন শিক্ষা (Duolingo)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>

          <Link
            href="/quran-tutor/live-class"
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 ring-2 ring-emerald-400/40 hover:-translate-y-0.5"
          >
            <Mic className="w-4 h-4 text-emerald-200" />
            <span>🎙️ সরাসরি মুখে মুখে কুরআন ক্লাস</span>
          </Link>

          <Link
            href="/quran-tutor/teacher"
            className="w-full sm:w-auto px-6 py-4 bg-slate-900/95 hover:bg-slate-800 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 border border-emerald-700/60 shadow-lg transition-all active:scale-95 cursor-pointer hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>নূর AI শিক্ষক পাঠশালা</span>
          </Link>

          <Link
            href="/quran-tutor/studio?tab=makhraj"
            className="w-full sm:w-auto px-6 py-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-full text-sm font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>১৭টি মাখরাজ গাইড</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
