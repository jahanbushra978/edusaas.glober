"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Volume2, ArrowLeft, Bot, ShieldCheck, Mic, Search } from "lucide-react";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import InteractiveVoiceTutor from "@/features/ai/components/InteractiveVoiceTutor";
import QuranSemanticSearchModal from "@/features/ai/components/QuranSemanticSearchModal";
import QuranReader from "@/features/quran/components/QuranReader";

export default function QuranStudioPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const p = new URLSearchParams(window.location.search).get("tab");
        if (p === "reader" || p === "quran" || p === "mushaf") return "quran-reader";
        if (p === "makhraj" || p === "makhraj-3d") return "makhraj-3d";
        if (p === "voice" || p === "voice-tutor") return "voice-tutor";
      } catch {}
    }
    return "voice-tutor";
  });
  const [selectedZone, setSelectedZone] = useState("lisan");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "reader" || tabParam === "quran" || tabParam === "mushaf") {
        setActiveTab("quran-reader");
      } else if (tabParam === "makhraj" || tabParam === "makhraj-3d") {
        setActiveTab("makhraj-3d");
      } else {
        setActiveTab("voice-tutor");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#07130e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── TIER 1: BRAND & GLOBAL UTILITIES BAR ── */}
      <header className="h-14 border-b border-emerald-900/60 bg-[#091a14]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        {/* Left: Back & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/quran-tutor"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ফিরে যান</span>
          </Link>
          <div className="h-5 w-px bg-emerald-900/80 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>নূর লার্নিং স্টুডিও</span>
                <span className="hidden md:inline text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50 font-normal">
                  এআই কুরআন একাডেমি
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Global Actions (Strictly shrink-0, zero overlapping) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ai-quran-learning"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer shadow-sm"
            title="ডুওলিঙ্গো স্টাইল নূরানী কায়দা ও কুরআন শিক্ষা"
          >
            <span>🎯 ডুওলিঙ্গো কোর্স</span>
          </Link>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-ai-chat"));
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
            title="নূর এআই সহকারী ও API Key সেটিংস (Alt+A)"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">নূর AI / Key</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">কুরআন সার্চ</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400/80 font-medium pl-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI ভেরিফাইড</span>
          </div>
        </div>
      </header>

      {/* ── TIER 2: WORKSPACE MODES SEGMENTED STRIP (CLEAN 3 MODES) ── */}
      <nav
        aria-label="Studio Workspace Modes"
        className="bg-[#06140f] border-b border-emerald-900/60 px-4 sm:px-8 py-2.5 flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none sticky top-14 z-20 shadow-md"
      >
        {/* Tab 1: Live Voice AI Teacher */}
        <button
          id="studio-tab-voice"
          onClick={() => {
            setActiveTab("voice-tutor");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "voice");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "voice-tutor"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400 font-extrabold"
              : "bg-slate-900/70 border border-emerald-900/60 text-emerald-300/80 hover:text-white hover:bg-emerald-950"
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-300" />
          <span>🎙️ সরাসরি এআই উস্তাদ</span>
          {activeTab === "voice-tutor" && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        {/* Tab 2: Full Quran Reader */}
        <button
          id="studio-tab-quran"
          onClick={() => {
            setActiveTab("quran-reader");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "reader");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "quran-reader"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400 font-extrabold"
              : "bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>📖 সম্পূর্ণ কুরআন</span>
        </button>

        {/* Tab 3: 17 Makharij 3D Visualizer */}
        <button
          id="studio-tab-makhraj"
          onClick={() => {
            setActiveTab("makhraj-3d");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "makhraj");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "makhraj-3d"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400 font-extrabold"
              : "bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>🗣️ ১৭ মাখরাজ মানচিত্র</span>
        </button>
      </nav>

      {/* ── MAIN STUDIO CONTENT ── */}
      {activeTab === "quran-reader" ? (
        <main className="flex-1 w-full mx-auto">
          <QuranReader
            onLaunchVoiceTutor={() => setActiveTab("voice-tutor")}
            onLaunchNurEngine={() => setActiveTab("voice-tutor")}
          />
        </main>
      ) : activeTab === "voice-tutor" ? (
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
          <InteractiveVoiceTutor
            onMakhrajHighlight={(zone) => {
              if (zone) setSelectedZone(zone);
              setActiveTab("makhraj-3d");
            }}
          />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col">
          <div className="bg-slate-900/90 border border-emerald-900/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <span>১৭ মাখরাজের ত্রিমাত্রিক উচ্চারণ নির্দেশিকা</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                কুরআনের প্রতিটি হরফ তার নির্ধারিত মাখরাজ থেকে বিশুদ্ধভাবে আদায় করার নিয়ম ও অ্যানিমেশন দেখুন।
              </p>
            </div>
            <MakhrajVisualizer
              activeZone={selectedZone}
              onZoneChange={setSelectedZone}
              interactive={true}
            />
          </div>
        </main>
      )}

      {/* Semantic Quran Search Modal */}
      <QuranSemanticSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAyah={() => {
          setActiveTab("voice-tutor");
        }}
      />
    </div>
  );
}
