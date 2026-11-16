"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  Settings,
  BookOpen,
  Image as ImageIcon,
  Copy,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Bot,
  GraduationCap,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Type
} from "lucide-react";
import { toast } from "sonner";
import { QARI_REGISTRY } from "@/lib/ai/qari-registry";

// Bengali numeral conversion
const toBn = (num) => {
  const enToBnMap = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
};

export default function AyahActionDrawer({
  isOpen,
  onClose,
  ayahData,
  surahNameBn,
  surahNameAr,
  isPlayingAudio = false,
  playingAyahNumber = null,
  playingSurahId = null,
  activeSpeaker = "ustad",
  selectedQari = "minshawy_teacher",
  onSelectQari,
  onPlayAyah,
  onOpenTafsir,
  onOpenShareCard,
  onLaunchNurEngine,
  onToggleBookmark,
  isBookmarked = false,
  isDay = false,
  arabicFontSize = 28,
  onChangeFontSize,
  onSwitchViewMode,
}) {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isMuhiuddinExpanded, setIsMuhiuddinExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatCount, setRepeatCount] = useState(1);

  if (!isOpen || !ayahData) return null;

  const isCurrentAyahPlaying =
    isPlayingAudio &&
    playingAyahNumber === ayahData.ayahNumber &&
    playingSurahId === ayahData.surahId;

  // Handle Play / Pause
  const handleTogglePlay = () => {
    if (onPlayAyah) {
      onPlayAyah(ayahData.ayahNumber, ayahData.surahId, selectedQari, null, 0);
    }
  };

  // Handle Copy text
  const handleCopyAyah = () => {
    const text = `« ${ayahData.arabicText} »\n\nউচ্চারণ: ${ayahData.pronunciationBn || ""}\n\nঅনুবাদ (মুফতি তকী উসমানী): ${ayahData.taqiUsmaniBn}\n${ayahData.muhiuddinKhanBn ? `\nঅনুবাদ (মাওলানা মুহিউদ্দীন খান): ${ayahData.muhiuddinKhanBn}\n` : ""}\n[সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}]\n— রহমানিয়া ইনস্টিটিউট • Edusaas`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("আয়াত টেক্সট সফলভাবে কপি হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle Web Share
  const handleShareAyah = async () => {
    const text = `« ${ayahData.arabicText} »\n\nঅনুবাদ: ${ayahData.taqiUsmaniBn}\n\n[সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}]`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}`,
          text: text,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      } catch {}
    } else {
      handleCopyAyah();
    }
  };

  const activeQariObj = QARI_REGISTRY.find((q) => q.id === selectedQari) || QARI_REGISTRY[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto select-text">
      {/* Semi-transparent backdrop for click-outside dismissal */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] -z-10"
        onClick={onClose}
      />

      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-t-3xl border-t-2 border-x-2 shadow-[0_-10px_35px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative ${
          isDay
            ? "bg-[#FAF7F2] border-amber-600/50 text-stone-900"
            : "bg-gradient-to-b from-[#08221c]/98 via-[#061814]/98 to-[#030d0a]/98 border-teal-500/50 text-slate-100"
        }`}
      >
        {/* Drag handle pill */}
        <div className="w-full flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-400/40" />
        </div>

        {/* ── TOP HEADER BAR ── */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/70 border-amber-300" : "bg-[#0a2822] border-teal-900/60"
          }`}
        >
          {/* Surah Name & Ayah Number */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-black truncate text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>সূরা {surahNameBn}</span>
                <span className="text-xs opacity-75 font-hafizi-quran">({surahNameAr})</span>
                <span>• আয়াত {toBn(ayahData.ayahNumber)}</span>
              </h3>
            </div>
          </div>

          {/* Quick Action Badges: Bookmark & Close */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(ayahData.surahId, ayahData.ayahNumber)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isBookmarked
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                    : isDay
                    ? "bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300"
                    : "bg-teal-950/70 hover:bg-teal-900 text-teal-300 border-teal-800"
                }`}
                title={isBookmarked ? "বুকমার্ক সরানো হয়েছে" : "বুকমার্ক করুন"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="পপআপ বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── AUDIO CONTROLLER & SETTINGS BAR ── */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
            isDay ? "bg-amber-50 border-amber-200" : "bg-black/30 border-teal-900/40"
          }`}
        >
          {/* Left: Play / Pause Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all ${
                isCurrentAyahPlaying
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-300"
                  : "bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-slate-950 hover:brightness-110"
              }`}
            >
              {isCurrentAyahPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>তেলাওয়াত থামুন</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>তেলাওয়াত শুনুন</span>
                </>
              )}
            </button>

            {/* Speaker Indicator */}
            {isCurrentAyahPlaying && selectedQari === "minshawy_teacher" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-500/20 border border-sky-400 text-sky-300 animate-pulse">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{activeSpeaker === "student" ? "ছাত্রদের পুনরাবৃত্তি" : "উস্তাদের তিলাওয়াত"}</span>
              </span>
            )}
          </div>

          {/* Right: In-Drawer Settings Toggle Button (ইউজারের নির্দেশ: নিচে ড্রয়ারে একটা সেটিং অপশন রেখো) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSettingsExpanded((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isSettingsExpanded
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-xs"
                  : isDay
                  ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-amber-300"
                  : "bg-teal-950/70 hover:bg-teal-900 text-teal-200 border-teal-700/50"
              }`}
              title="ক্বারী ও তিলাওয়াত সেটিংস"
            >
              <Settings className={`w-3.5 h-3.5 ${isSettingsExpanded ? "animate-spin" : ""}`} />
              <span>সেটিংস</span>
              {isSettingsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── EXPANDABLE SETTINGS PANEL (ক্বারী সিলেকশন, গতি, পুনরাবৃত্তি ও ফন্ট সাইজ) ── */}
        {isSettingsExpanded && (
          <div
            className={`p-4 sm:p-5 border-b space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDay ? "bg-amber-100/60 border-amber-300" : "bg-[#061e18] border-teal-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-teal-500/20">
              <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>তিলাওয়াত ও প্রদর্শন সেটিংস</span>
              </span>
              <span className="text-[10px] font-bold opacity-75">
                সক্রিয় ক্বারী: {activeQariObj?.shortNameBn || activeQariObj?.nameBn}
              </span>
            </div>

            {/* Qari Selector Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold opacity-80 block">ক্বারী নির্বাচন করুন:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {QARI_REGISTRY.map((q) => {
                  const isSelected = selectedQari === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        if (onSelectQari) onSelectQari(q.id);
                        toast.success(`${q.shortNameBn || q.nameBn} নির্বাচন করা হয়েছে`);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left truncate transition cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs"
                          : isDay
                          ? "bg-white hover:bg-amber-50 text-stone-800 border-amber-200"
                          : "bg-black/30 hover:bg-black/50 text-slate-200 border-teal-900/40"
                      }`}
                    >
                      <span className="truncate">{q.shortNameBn || q.nameBn}</span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size & Mode Options */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-teal-500/15">
              {/* Font Size */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  <span>আরবি ফন্ট সাইজ:</span>
                </span>
                <div className="flex items-center gap-1">
                  {[24, 28, 34].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onChangeFontSize && onChangeFontSize(size)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        arabicFontSize === size
                          ? "bg-teal-500 text-slate-950 border-teal-400 font-black"
                          : "bg-black/20 text-slate-300 border-teal-900/40"
                      }`}
                    >
                      {size === 24 ? "ছোট" : size === 28 ? "মাঝারি" : "বড়"}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle */}
              {onSwitchViewMode && (
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold opacity-80 block">ভিউ পরিবর্তন:</span>
                  <button
                    type="button"
                    onClick={onSwitchViewMode}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-500/40 cursor-pointer transition"
                  >
                    অনুবাদ মোডে যান ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT SCROLL AREA ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
          {/* 1. ARABIC VERSE (UTHMANI CALLIGRAPHY) */}
          <div className="text-right py-2 px-1">
            <p
              className="font-hafizi-quran font-extrabold leading-[2.3] sm:leading-[2.6] text-amber-600 dark:text-amber-400 transition-all select-text"
              style={{ fontSize: `${arabicFontSize}px` }}
              dir="rtl"
            >
              {ayahData.arabicText}
            </p>
          </div>

          {/* 2. BENGALI PRONUNCIATION (উচ্চারণ) */}
          {ayahData.pronunciationBn && (
            <div className={`p-3 rounded-2xl border text-xs sm:text-sm font-medium ${
              isDay ? "bg-stone-100 border-stone-200 text-stone-800" : "bg-black/20 border-teal-900/40 text-slate-300"
            }`}>
              <span className="text-[10px] font-black uppercase text-teal-400 block mb-0.5">
                বাংলা উচ্চারণ:
              </span>
              <p className="italic leading-relaxed">{ayahData.pronunciationBn}</p>
            </div>
          )}

          {/* 3. DEFAULT TRANSLATION: মুফতি তকী উসমানী (ইউজারের শর্ত: মুফতি তকী উসমানী ডিফল্ট থাকবে) */}
          <div className={`p-4 rounded-2xl border-2 space-y-1.5 ${
            isDay
              ? "bg-amber-100/50 border-amber-400/80 text-stone-950"
              : "bg-[#092b22]/70 border-teal-500/50 text-slate-100"
          }`}>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-xs">
                <span>মুফতি তকী উসমানী (ডিফল্ট অনুবাদ)</span>
              </span>
              <span className="text-[10px] opacity-75 font-bold">তাওযীহুল কুরআন</span>
            </div>
            <p className="text-sm sm:text-base font-bold leading-relaxed pt-1 select-text">
              {ayahData.taqiUsmaniBn}
            </p>
          </div>

          {/* 4. EXPANDABLE CARD: মাওলানা মুহিউদ্দীন খান (ইউজারের শর্ত: কার্ডে থাকবে মহিউদ্দিনেরটা, পরে ক্লিক করিলে বের হবে) */}
          {ayahData.muhiuddinKhanBn && (
            <div
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDay ? "border-stone-300 bg-stone-50" : "border-teal-900/60 bg-black/25"
              }`}
            >
              <button
                type="button"
                onClick={() => setIsMuhiuddinExpanded((prev) => !prev)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                  isMuhiuddinExpanded
                    ? isDay ? "bg-stone-200/60" : "bg-teal-950/40"
                    : "hover:bg-black/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span className="font-black text-slate-300">
                    মাওলানা মুহিউদ্দীন খান (অনুবাদ)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 font-bold border border-teal-500/20">
                    মা'আরিফুল কুরআন
                  </span>
                </div>
                {isMuhiuddinExpanded ? (
                  <ChevronUp className="w-4 h-4 text-teal-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isMuhiuddinExpanded && (
                <div className="px-4 pb-4 pt-1 animate-fadeIn border-t border-teal-500/15">
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDay ? "text-stone-800" : "text-slate-200"}`}>
                    {ayahData.muhiuddinKhanBn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM ACTION BUTTONS BAR ── */}
        <div
          className={`px-4 sm:px-6 py-3 border-t flex flex-wrap items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/60 border-amber-300" : "bg-[#061814] border-teal-900/60"
          }`}
        >
          {/* Left Actions: Tafsir & Share as Image */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* তাফসীর দেখুন */}
            <button
              type="button"
              onClick={onOpenTafsir}
              className="px-3 py-2 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-400/50 text-teal-300 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-xs"
              title="বিস্তারিত তাফসীর দেখুন"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>তাফসীর দেখুন</span>
            </button>

            {/* ছবি হিসেবে শেয়ার করুন */}
            <button
              type="button"
              onClick={onOpenShareCard}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-xs"
              title="আয়াত দিয়ে ইসলামিক ছবি কার্ড তৈরি করুন"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ছবি হিসেবে শেয়ার</span>
            </button>

            {/* কপি করুন */}
            <button
              type="button"
              onClick={handleCopyAyah}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isDay
                  ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300"
                  : "bg-black/30 hover:bg-black/50 text-slate-300 border-teal-900/40"
              }`}
              title="আয়াত কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">কপি</span>
            </button>

            {/* শেয়ার করুন */}
            <button
              type="button"
              onClick={handleShareAyah}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isDay
                  ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300"
                  : "bg-black/30 hover:bg-black/50 text-slate-300 border-teal-900/40"
              }`}
              title="শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: নূর এআই কুরআন শিক্ষক (ইউজারের শর্ত: ২. নূর এআই কুরআন থাকবে) */}
          {onLaunchNurEngine && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchNurEngine(
                  ayahData.surahId,
                  ayahData.ayahNumber,
                  `আমাকে সূরা ${surahNameBn}-এর আয়াত ${toBn(ayahData.ayahNumber)} তাজবীদ ও শুদ্ধ তিলাওয়াত শেখান`
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition ml-auto"
              title="নূর এআই কুরআনের সাথে এই আয়াত মাশক ও শুদ্ধ তিলাওয়াত করুন"
            >
              <Bot className="w-4 h-4 text-emerald-200" />
              <span>নূর এআই কুরআন শিক্ষক</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
