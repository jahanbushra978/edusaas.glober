"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Radio,
  Volume2,
} from "lucide-react";
import NurTeachingEngine from "@/features/ai/components/NurTeachingEngine";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";

export default function NurAITeacherPage() {
  const [selectedMakhrajZone, setSelectedMakhrajZone] = useState("halq");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showMakhrajModal, setShowMakhrajModal] = useState(false);

  const handleMakhrajHighlight = (zone, letter) => {
    if (zone) setSelectedMakhrajZone(zone);
    if (letter) setSelectedLetter(letter);
    setShowMakhrajModal(true);
  };

  return (
    <div className="nur-theme min-h-screen bg-[#faf8f2] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* ── AMBIENT ISLAMIC LIGHTING & WARM GLOWS ── */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ── TOP IMMERSIVE APP BAR (Child-Friendly Frosted Ivory) ── */}
      <header className="h-16 border-b border-emerald-100/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        {/* Left: Navigation & Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/quran-tutor"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
            title="কুরআন টিউটর হোমে ফিরুন"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">ফিরে যান</span>
          </Link>

          <div className="h-5 w-px bg-emerald-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0d7a5f] to-[#064e3b] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>নূর এআই কুরআন শিক্ষক</span>
                  <span className="text-[11px] bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold shadow-xs">
                    ছোটদের পূর্ণাঙ্গ পাঠশালা
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium hidden md:block">
                শিশুদের মুখে মুখে সহজ ও বিশুদ্ধ তাজবীদ, মাখরাজ ও তিলাওয়াত শিক্ষা
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          {/* 17 Makharij Guide Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowMakhrajModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="১৭ মাখরাজ এনাটমিক্যাল মানচিত্র দেখুন"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">১৭ মাখরাজ গাইড</span>
          </button>

          {/* Live Voice Classroom Link */}
          <Link
            href="/quran-tutor/live-class"
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0d7a5f] to-[#0a634d] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="লাইভ ভয়েস ক্লাসরুমে যান"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span className="hidden sm:inline">লাইভ ক্লাস</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN FULL-PAGE CONTAINER ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
        <NurTeachingEngine
          onMakhrajHighlight={handleMakhrajHighlight}
          onMakhrajSelect={handleMakhrajHighlight}
        />
      </main>

      {/* ── MAKHRAJ MODAL COMPANION (Onosaee Clean Card) ── */}
      {showMakhrajModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#faf8f2] border-2 border-emerald-500/30 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ১৭ মাখরাজের এনাটমিক্যাল উচ্চারণ নির্দেশিকা
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMakhrajModal(false)}
                className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <MakhrajVisualizer
              activeZone={selectedMakhrajZone}
              onZoneChange={setSelectedMakhrajZone}
              interactive={true}
            />

            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMakhrajModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#0d7a5f] hover:bg-[#0b6851] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                পাঠে ফিরে যান ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
