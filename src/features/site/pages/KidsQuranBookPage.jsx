"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Bot, ShieldCheck } from "lucide-react";
import AmarProthomQuranShikkha from "@/features/ai/components/AmarProthomQuranShikkha";

export default function KidsQuranBookPage() {
  return (
    <div className="min-h-screen bg-[#faf8f2] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── STICKY TOP BRAND BAR ── */}
      <header className="h-16 border-b border-emerald-100/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/quran-tutor"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">টিউটরে ফিরুন</span>
          </Link>
          <div className="h-5 w-px bg-emerald-200 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0d7a5f] to-[#064e3b] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
              <span className="text-lg">👶</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>আমার প্রথম কুরআন শিক্ষা</span>
                <span className="hidden md:inline text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold shadow-xs">
                  ছবি ও খেলাধুলা
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/quran-tutor/studio"
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">নূর এআই স্টুডিও</span>
          </Link>

          <Link
            href="/quran-tutor/studio?tab=reader"
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">সম্পূর্ণ কুরআন</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-800 font-bold pl-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>শিশুতোষ সংস্করণ</span>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
        <AmarProthomQuranShikkha />
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-emerald-100 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">
          🌙 আমার প্রথম কুরআন শিক্ষা — রাহমানিয়া ইনস্টিটিউট ও নূর এআই কুরআন একাডেমি
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          বাচ্চাদের জন্য ছবি, উচ্চারণ, শব্দ-অর্থ, মজার গেম ও ৩০ দিনের তারা চার্ট
        </p>
      </footer>
    </div>
  );
}
