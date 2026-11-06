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
  Key,
} from "lucide-react";
import LiveVoiceQuranClass from "@/features/ai/components/LiveVoiceQuranClass";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import AISettingsModal from "@/features/ai/components/AISettingsModal";
import { getSavedAIConfig, saveAIConfigToStorage } from "@/features/ai/lib/aiConfigHelper";
import { toast } from "sonner";

export default function LiveVoiceClassroomPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMakhrajZone, setSelectedMakhrajZone] = useState("halq");
  const [showMakhrajModal, setShowMakhrajModal] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);

  useEffect(() => {
    setAiConfig(getSavedAIConfig());
  }, []);

  const handleSaveAIConfig = (newConfig) => {
    saveAIConfigToStorage(newConfig);
    setAiConfig(newConfig);
    setIsAISettingsOpen(false);
    toast.success("মাশাআল্লাহ! এআই সেটিংস ও API Key সংরক্ষিত হয়েছে");
  };

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
    <div className="nur-theme min-h-screen bg-[#faf8f2] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* ── AMBIENT ISLAMIC LIGHTING & WARM GLOWS ── */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-400/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ── TOP IMMERSIVE CLASSROOM APP BAR (Frosted Ivory & Emerald) ── */}
      <header className="h-16 border-b border-emerald-100/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        {/* Left: Navigation & Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/quran-tutor/studio?feature=voice-tutor"
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
            title="উস্তাদ চ্যাটে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] sm:text-xs font-bold">উস্তাদ চ্যাট</span>
          </Link>

          <div className="h-5 w-px bg-emerald-200" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0d7a5f] to-[#064e3b] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
              <Radio className="w-5 h-5 text-emerald-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>নূর লাইভ ভয়েস ক্লাসরুম</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold shadow-xs">
                    সরাসরি মুখে মুখে তিলাওয়াত
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium hidden md:block">
                হ্যান্ডস-ফ্রি এআই উস্তাদ • রিয়েল-টাইম তাজবীদ বিশ্লেষণ ও ১৭ মাখরাজ গাইড
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 🔑 API Key Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsAISettingsOpen(true)}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              aiConfig?.apiKey
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-amber-100 border-amber-300 text-amber-950 animate-pulse"
            }`}
            title="এআই প্রোভাইডার ও নিজস্ব API Key যোগ করুন (ফ্রি Google Gemini Key)"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] sm:text-xs">
              {aiConfig?.apiKey ? "কী সক্রিয়" : "API Key"}
            </span>
          </button>

          {/* Quick Makhraj Guide Trigger */}
          <button
            type="button"
            onClick={() => setShowMakhrajModal(true)}
            className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="১৭ মাখরাজ এনাটমিক্যাল মানচিত্র দেখুন"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">১৭ মাখরাজ</span>
          </button>

          {/* AI Teacher Full Page Link */}
          <Link
            href="/quran-tutor/teacher"
            className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="নূর এআই কুরআন শিক্ষক পূর্ণাঙ্গ পেজে যান"
          >
            <Bot className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">নূর AI শিক্ষক</span>
          </Link>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faf8f2] border-2 border-emerald-500/30 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
                className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold cursor-pointer"
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
                ক্লাসরুমে ফিরে যান ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔑 AI Settings & API Key Modal */}
      <AISettingsModal
        open={isAISettingsOpen}
        onOpenChange={setIsAISettingsOpen}
        config={aiConfig}
        onSave={handleSaveAIConfig}
      />
    </div>
  );
}
