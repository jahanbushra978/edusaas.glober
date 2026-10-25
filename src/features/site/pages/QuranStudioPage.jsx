"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Volume2, ArrowLeft, Bot, Award, Headphones, ShieldCheck, Mic, Compass, Zap, Search, TrendingUp } from "lucide-react";
import NurTeachingEngine from "@/features/ai/components/NurTeachingEngine";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import InteractiveVoiceTutor from "@/features/ai/components/InteractiveVoiceTutor";
import AdvancedHifzAssistant from "@/features/ai/components/AdvancedHifzAssistant";
import AIPracticeGenerator from "@/features/ai/components/AIPracticeGenerator";
import AIOralExamChamber from "@/features/ai/components/AIOralExamChamber";
import QuranSemanticSearchModal from "@/features/ai/components/QuranSemanticSearchModal";
import AIProgressPredictionEngine from "@/features/ai/components/AIProgressPredictionEngine";
import QuranReader from "@/features/quran/components/QuranReader";

export default function QuranStudioPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const p = new URLSearchParams(window.location.search).get("tab");
        if (p === "reader" || p === "quran" || p === "mushaf") return "quran-reader";
        if (p === "drills" || p === "practice-generator") return "practice-generator";
        if (p === "engine" || p === "teaching-engine") return "teaching-engine";
        if (p === "voice" || p === "voice-tutor") return "voice-tutor";
        if (p === "hifz" || p === "hifz-assistant") return "hifz-assistant";
        if (p === "exam" || p === "oral-exam") return "oral-exam";
        if (p === "prediction" || p === "predictive-progress") return "predictive-progress";
        if (p === "makhraj" || p === "makhraj-3d") return "makhraj-3d";
      } catch {}
    }
    return "quran-reader";
  });
  const [selectedZone, setSelectedZone] = useState("lisan");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerseForNur, setSelectedVerseForNur] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "reader" || tabParam === "quran" || tabParam === "mushaf") {
        setActiveTab("quran-reader");
      } else if (tabParam === "drills" || tabParam === "practice-generator") {
        setActiveTab("practice-generator");
      } else if (tabParam === "engine" || tabParam === "teaching-engine") {
        setActiveTab("teaching-engine");
      } else if (tabParam === "voice" || tabParam === "voice-tutor") {
        setActiveTab("voice-tutor");
      } else if (tabParam === "hifz" || tabParam === "hifz-assistant") {
        setActiveTab("hifz-assistant");
      } else if (tabParam === "exam" || tabParam === "oral-exam") {
        setActiveTab("oral-exam");
      } else if (tabParam === "prediction" || tabParam === "predictive-progress") {
        setActiveTab("predictive-progress");
      } else if (tabParam === "makhraj" || tabParam === "makhraj-3d") {
        setActiveTab("makhraj-3d");
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
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer"
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

      {/* ── TIER 2: WORKSPACE MODES SEGMENTED STRIP (NON-COLLIDING TABS) ── */}
      <nav
        aria-label="Studio Workspace Modes"
        className="bg-[#06140f] border-b border-emerald-900/60 px-3 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none sticky top-14 z-20 shadow-md"
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
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "voice-tutor"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/50 ring-1 ring-emerald-400"
              : "bg-slate-900/60 border border-emerald-900/60 text-emerald-300/80 hover:text-white hover:bg-emerald-950"
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-emerald-300" />
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
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "quran-reader"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>📖 সম্পূর্ণ কুরআন</span>
        </button>

        {/* Tab 3: Pedagogical Teaching Engine */}
        <button
          id="studio-tab-teaching"
          onClick={() => {
            setActiveTab("teaching-engine");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "engine");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "teaching-engine"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>🤖 পেডাগজিক্যাল ইঞ্জিন</span>
        </button>

        {/* Tab 4: 17 Makharij 3D Visualizer */}
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
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "makhraj-3d"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>🗣️ ১৭ মাখরাজ মানচিত্র</span>
        </button>

        {/* Tab 5: Advanced Hifz Assistant */}
        <button
          id="studio-tab-hifz"
          onClick={() => {
            setActiveTab("hifz-assistant");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "hifz");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "hifz-assistant"
              ? "bg-amber-600 text-white shadow-md shadow-amber-700/30 ring-1 ring-amber-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>🧠 হিফজ সহকারী</span>
        </button>

        {/* Tab 6: Weakness Practice Generator */}
        <button
          id="studio-tab-drills"
          onClick={() => {
            setActiveTab("practice-generator");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "drills");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "practice-generator"
              ? "bg-purple-600 text-white shadow-md shadow-purple-700/30 ring-1 ring-purple-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>⚡ দুর্বলতা ড্রিল</span>
        </button>

        {/* Tab 7: Oral Exam Chamber */}
        <button
          id="studio-tab-exam"
          onClick={() => {
            setActiveTab("oral-exam");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "exam");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "oral-exam"
              ? "bg-rose-700 text-white shadow-md shadow-rose-800/30 ring-1 ring-rose-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-rose-400" />
          <span>🏆 মৌখিক পরীক্ষা</span>
        </button>

        {/* Tab 8: Predictive Progress */}
        <button
          id="studio-tab-prediction"
          onClick={() => {
            setActiveTab("predictive-progress");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "prediction");
              window.history.replaceState(null, "", url.toString());
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "predictive-progress"
              ? "bg-amber-600 text-white shadow-md shadow-amber-700/30 ring-1 ring-amber-400"
              : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>📈 প্রগতি পূর্বাভাস</span>
        </button>
      </nav>

      {/* ── MAIN STUDIO CONTENT ── */}
      {activeTab === "quran-reader" ? (
        <main className="flex-1 w-full mx-auto">
          <QuranReader
            onLaunchNurEngine={(surah, ayah, ayahData) => {
              setSelectedVerseForNur({
                surah,
                ayah,
                text: ayahData?.text,
                bengali: ayahData?.bengali
              });
              setActiveTab("teaching-engine");
            }}
            onLaunchVoiceTutor={() => setActiveTab("voice-tutor")}
          />
        </main>
      ) : activeTab === "voice-tutor" ? (
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
          <InteractiveVoiceTutor
            onMakhrajHighlight={(zone) => {
              setSelectedZone(zone);
              setActiveTab("makhraj-3d");
            }}
          />
        </main>
      ) : activeTab === "teaching-engine" ? (
        <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
          <NurTeachingEngine
            customVerse={selectedVerseForNur}
            onOpenReader={() => setActiveTab("quran-reader")}
            studentContext={{ id: "student_studio", name: "শিক্ষার্থী" }}
            onMakhrajSelect={(zone) => {
              setSelectedZone(zone);
              setActiveTab("makhraj-3d");
            }}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Primary Active Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === "predictive-progress" ? (
              <AIProgressPredictionEngine
                studentContext={{
                  name: "শিক্ষার্থী",
                  completedJuz: 14,
                  pagesMemorized: 282,
                  currentSabaqSpeed: 0.85
                }}
              />
            ) : activeTab === "oral-exam" ? (
              <AIOralExamChamber
                studentContext={{ id: "student_studio", name: "শিক্ষার্থী" }}
              />
            ) : activeTab === "practice-generator" ? (
              <AIPracticeGenerator studentId="student_studio" />
            ) : activeTab === "hifz-assistant" ? (
              <AdvancedHifzAssistant
                studentContext={{ id: "student_studio", name: "শিক্ষার্থী" }}
              />
            ) : (
              <div className="bg-slate-900/90 border border-emerald-900/60 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>১৭ মাখরাজের ত্রিমাত্রিক উচ্চারণ নির্দেশিকা</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      প্রতিটি উচ্চারণস্থানের সঠিক জিহ্বা, ঠোঁট ও কণ্ঠনালীর স্পর্শবিন্দু পর্যবেক্ষণ করুন।
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("teaching-engine")}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 rounded-lg border border-emerald-600/40 transition-colors"
                  >
                    পাঠাভ্যাসে ফিরুন ➔
                  </button>
                </div>
                <MakhrajVisualizer
                  activeZone={selectedZone}
                  onZoneChange={setSelectedZone}
                  interactive={true}
                />
              </div>
            )}
          </div>

        {/* Right Column: Reference & Guide Drawer */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Makhraj Peek Card */}
          <div className="bg-slate-900/80 border border-emerald-900/60 rounded-2xl p-4 shadow-lg">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              <span>মাখরাজ অ্যাক্সিস ও উচ্চারণ অঙ্গ</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              কুরআনের প্রতিটি হরফ তার নির্ধারিত মাখরাজ থেকে আদায় করা ফরজ। সঠিক মাখরাজ নিশ্চিত করতে পাশের ভিজ্যুয়ালাইজারে ক্লিক করুন।
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { zone: "halq", label: "১. কণ্ঠনালী (আল-হালক)", count: "৬ হরফ" },
                { zone: "lisan", label: "২. জিহ্বা (আল-লিসান)", count: "১৮ হরফ" },
                { zone: "shafatan", label: "৩. ঠোঁটদ্বয় (শাফাতাইন)", count: "৪ হরফ" },
                { zone: "khayshum", label: "৪. নাকের বাঁশি (খাইশূম)", count: "গুন্নাহ" },
                { zone: "jawf", label: "৫. খালি মুখ (আল-জাওফ)", count: "মদ" },
              ].map((item) => (
                <button
                  key={item.zone}
                  onClick={() => {
                    setSelectedZone(item.zone);
                    setActiveTab("makhraj-3d");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedZone === item.zone
                      ? "bg-emerald-950 border-emerald-500/80 text-white shadow-inner"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-800 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{item.label}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">{item.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pedagogical Loop Heuristics Card */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border border-emerald-800/40 rounded-2xl p-4 shadow-lg text-xs space-y-2.5">
            <h4 className="font-bold text-emerald-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>পেডাগজিক্যাল সাইকেল (৬ স্তর)</span>
            </h4>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                <span><strong>ব্যাখ্যা:</strong> তাজবীদ নিয়ম ও ভুলের কারণ পর্যালোচনা।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                <span><strong>ডেমো:</strong> ক্বারির বিশুদ্ধ অডিও ও আর্টিকুলেশন প্রদর্শন।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">৩</span>
                <span><strong>অনুশীলন:</strong> লাইভ মাইক্রোফোনে শিক্ষার্থীর তেলাওয়াত।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">৪</span>
                <span><strong>মূল্যায়ন:</strong> তাৎক্ষণিক অ্যাকোস্টিক ও তাজবীদ স্কোর।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">৫</span>
                <span><strong>সংশোধন:</strong> ভিন্ন আঙ্গিকে শিক্ষক কর্তৃক হেউরিস্টিক টিপ।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-[10px]">৬</span>
                <span><strong>পুনরাবৃত্তি:</strong> ৯০%+ পারদর্শিতা অর্জন পর্যন্ত চক্র চালু।</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    )}

      {/* Semantic Quran Search Modal */}
      <QuranSemanticSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAyah={(verse) => {
          if (verse) {
            setSelectedVerseForNur(verse);
          }
          setActiveTab("teaching-engine");
        }}
      />
    </div>
  );
}
