"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Volume2,
  Maximize2,
  Minimize2,
  Compass,
  Radio,
} from "lucide-react";
import LiveVoiceQuranClass from "@/features/ai/components/LiveVoiceQuranClass";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";

export default function LiveVoiceClassroomPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMakhrajZone, setSelectedMakhrajZone] = useState("halq");
  const [showMakhrajModal, setShowMakhrajModal] = useState(false);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#040e0a] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* ── AMBIENT ISLAMIC LIGHTING & GLOW ── */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ── TOP IMMERSIVE CLASSROOM APP BAR ── */}
      <header className="h-16 border-b border-emerald-900/60 bg-[#06150f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-lg shadow-black/40">
        {/* Left: Navigation & Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/quran-tutor/studio"
            className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-inner"
            title="নূর লার্নিং স্টুডিওতে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">স্টুডিও</span>
          </Link>

          <div className="h-5 w-px bg-emerald-900/80" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950 border border-emerald-400/40">
              <Radio className="w-5 h-5 text-emerald-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>নূর লাইভ ভয়েস ক্লাসরুম</span>
                  <span className="text-[10px] bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/50 font-medium">
                    সরাসরি মুখে মুখে তিলাওয়াত
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-emerald-400/80 hidden md:block">
                হ্যান্ডস-ফ্রি এআই উস্তাদ • রিয়েল-টাইম তাজবীদ বিশ্লেষণ ও ১৭ মাখরাজ গাইড
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Makhraj Guide Trigger */}
          <button
            type="button"
            onClick={() => setShowMakhrajModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-800/60 hover:bg-emerald-950 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="১৭ মাখরাজ এনাটমিক্যাল মানচিত্র দেখুন"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">১৭ মাখরাজ গাইড</span>
          </button>

          {/* AI Settings Trigger */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-ai-chat"));
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="নূর AI / API কী সেটিংস"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">নূর AI কী</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "ফুলস্ক্রিন থেকে বের হন" : "সম্পূর্ণ ফুলস্ক্রিনে ক্লাস করুন"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN FULL-PAGE CLASSROOM STAGE ── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
        <LiveVoiceQuranClass
          isFullPage={true}
          onMakhrajHighlight={(zone) => {
            setSelectedMakhrajZone(zone);
            setShowMakhrajModal(true);
          }}
          className="flex-1 min-h-[calc(100vh-6rem)]"
        />
      </main>

      {/* ── MAKHRAJ MODAL (WHEN REQUESTED FROM CLASSROOM) ── */}
      {showMakhrajModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-emerald-600/60 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-900/60">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  ১৭ মাখরাজের এনাটমিক্যাল উচ্চারণ নির্দেশিকা
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMakhrajModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <MakhrajVisualizer
              activeZone={selectedMakhrajZone}
              onZoneChange={setSelectedMakhrajZone}
              interactive={true}
            />

            <div className="mt-4 pt-3 border-t border-emerald-950 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMakhrajModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                ক্লাসরুমে ফিরে যান ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
