"use client";

import React, { useState } from "react";
import { X, BookOpen, Copy, Check, Share2, Sparkles, Award, Bot } from "lucide-react";
import { toast } from "sonner";

// Bengali numeral conversion
const toBn = (num) => {
  const enToBnMap = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
};

export default function AyahTafsirModal({
  isOpen,
  onClose,
  ayahData,
  surahNameBn,
  isDay = false,
  onLaunchNurEngine,
}) {
  const [activeTab, setActiveTab] = useState("usmani"); // 'usmani' | 'ahsanulBayan' | 'lesson'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ayahData) return null;

  const handleCopyTafsir = () => {
    let content = "";
    if (activeTab === "usmani") {
      content = `[তাফসীরে উসমানী — সূরা ${surahNameBn}, আয়াত ${toBn(ayahData.ayahNumber)}]\n${ayahData.tafsir?.usmani || ""}`;
    } else if (activeTab === "ahsanulBayan") {
      content = `[তাফসীরে আহসানুল বায়ান — সূরা ${surahNameBn}, আয়াত ${toBn(ayahData.ayahNumber)}]\n${ayahData.tafsir?.ahsanulBayan || ""}`;
    } else {
      content = `[শিক্ষণীয় বিষয় ও আমল — সূরা ${surahNameBn}, আয়াত ${toBn(ayahData.ayahNumber)}]\n${ayahData.tafsir?.lesson || ""}`;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("তাফসীর কপি করা হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-xl max-h-[85vh] rounded-3xl border-2 shadow-2xl flex flex-col overflow-hidden relative ${
          isDay
            ? "bg-[#FAF7F2] border-amber-600/50 text-stone-900 shadow-amber-950/20"
            : "bg-[#061814] border-teal-500/50 text-slate-100 shadow-teal-950/60"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/70 border-amber-300" : "bg-[#09221c] border-teal-900/60"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 text-amber-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate text-amber-600 dark:text-amber-400">
                সূরা {surahNameBn} — আয়াত {toBn(ayahData.ayahNumber)}
              </h3>
              <p className="text-[11px] opacity-75 font-bold">তাফসীরুল কুরআন ও গভীর অনুধাবন</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyTafsir}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isDay
                  ? "bg-amber-200/60 hover:bg-amber-300 border-amber-400 text-stone-900"
                  : "bg-teal-950/60 hover:bg-teal-900 border-teal-500/40 text-teal-300"
              }`}
              title="তাফসীর টেক্সট কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">কপি</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Arabic Verse Header Plaque */}
        <div
          className={`px-4 sm:px-6 py-3 border-b text-center select-text ${
            isDay ? "bg-stone-50 border-amber-200" : "bg-black/30 border-teal-900/40"
          }`}
        >
          <p
            className="font-hafizi-quran text-lg sm:text-xl font-bold leading-relaxed text-amber-600 dark:text-amber-400"
            dir="rtl"
          >
            {ayahData.arabicText}
          </p>
          {ayahData.pronunciationBn && (
            <p className="text-xs font-semibold opacity-80 pt-1 text-slate-600 dark:text-slate-300">
              উচ্চারণ: {ayahData.pronunciationBn}
            </p>
          )}
        </div>

        {/* Tafsir Source Switcher Tabs */}
        <div className={`px-4 sm:px-6 pt-3 flex items-center gap-1.5 border-b ${isDay ? "border-amber-200" : "border-teal-900/50"}`}>
          <button
            type="button"
            onClick={() => setActiveTab("usmani")}
            className={`px-3 py-2 rounded-t-xl text-xs font-black transition cursor-pointer border-t border-x ${
              activeTab === "usmani"
                ? isDay
                  ? "bg-[#FAF7F2] text-amber-700 border-amber-400 border-b-transparent shadow-xs"
                  : "bg-[#061814] text-amber-300 border-teal-500/50 border-b-transparent shadow-xs"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            তাফসীরে উসমানী
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ahsanulBayan")}
            className={`px-3 py-2 rounded-t-xl text-xs font-black transition cursor-pointer border-t border-x ${
              activeTab === "ahsanulBayan"
                ? isDay
                  ? "bg-[#FAF7F2] text-amber-700 border-amber-400 border-b-transparent shadow-xs"
                  : "bg-[#061814] text-amber-300 border-teal-500/50 border-b-transparent shadow-xs"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            আহসানুল বায়ান
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lesson")}
            className={`px-3 py-2 rounded-t-xl text-xs font-black transition cursor-pointer border-t border-x ${
              activeTab === "lesson"
                ? isDay
                  ? "bg-[#FAF7F2] text-amber-700 border-amber-400 border-b-transparent shadow-xs"
                  : "bg-[#061814] text-amber-300 border-teal-500/50 border-b-transparent shadow-xs"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            শিক্ষা ও আমল
          </button>
        </div>

        {/* Tafsir Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text leading-relaxed text-sm">
          {activeTab === "usmani" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                <span className="text-xs font-black text-amber-500 uppercase">
                  মুফতি মুহাম্মদ তকী উসমানী ও আল্লামা শাব্বীর আহমদ উসমানী (রহ.)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-400/30">
                  দেওবন্দী প্রামাণ্য তাফসীর
                </span>
              </div>
              <p className={`text-sm sm:text-base leading-relaxed ${isDay ? "text-stone-800" : "text-slate-200"}`}>
                {ayahData.tafsir?.usmani}
              </p>
            </div>
          )}

          {activeTab === "ahsanulBayan" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-teal-500/20">
                <span className="text-xs font-black text-teal-400 uppercase">
                  তাফসীরে আহসানুল বায়ান — হাফেজ সালাহুদ্দীন ইউসুফ
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold border border-teal-400/30">
                  বিশুদ্ধ ব্যাখ্যা
                </span>
              </div>
              <p className={`text-sm sm:text-base leading-relaxed ${isDay ? "text-stone-800" : "text-slate-200"}`}>
                {ayahData.tafsir?.ahsanulBayan}
              </p>
            </div>
          )}

          {activeTab === "lesson" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                <span className="text-xs font-black text-emerald-400 uppercase">
                  আয়াতের শিক্ষণীয় বিষয় ও প্রাত্যহিক আমল
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-400/30">
                  তাজকিয়া ও আমল
                </span>
              </div>
              <div className={`p-4 rounded-2xl border ${
                isDay ? "bg-emerald-50/80 border-emerald-300 text-emerald-950" : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              }`}>
                <p className="text-sm sm:text-base leading-relaxed font-medium">
                  {ayahData.tafsir?.lesson}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar with Nur AI Assistant Bridge */}
        <div
          className={`p-3 sm:p-4 border-t flex flex-wrap items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/50 border-amber-300" : "bg-[#09221c]/90 border-teal-900/60"
          }`}
        >
          {onLaunchNurEngine && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchNurEngine(
                  ayahData.surahId,
                  ayahData.ayahNumber,
                  `আমাকে সূরা ${surahNameBn}-এর আয়াত ${toBn(ayahData.ayahNumber)}-এর বিস্তারিত ব্যাখ্যা বুঝিয়ে বলুন`
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Bot className="w-4 h-4 text-emerald-200" />
              <span>নূর এআই শিক্ষকের সাথে তাফসীর আলোচনা করুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ml-auto ${
              isDay
                ? "bg-stone-200 hover:bg-stone-300 text-stone-900 border-stone-300"
                : "bg-teal-950 hover:bg-teal-900 text-slate-300 border-teal-800"
            }`}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
