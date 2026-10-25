"use client";

import React, { useRef } from "react";
import { Share2, Download, X, CheckCircle2, Star, Flame, Trophy } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function ParentCelebrationCard({
  isOpen,
  onClose,
  levelTitle = "লেভেল সমাপ্তি",
  levelNumber = 1,
  completedCount = 5,
  totalCount = 5,
  totalStars = 15,
  streak = 1,
  xp = 120,
  studentName = "কুরআন শিক্ষার্থী",
}) {
  const { lang, t, dir } = useLearningLanguage();
  const cardRef = useRef(null);

  if (!isOpen) return null;

  const shareText = `আলহামদুলিল্লাহ! আমাদের সন্তান রাহমানিয়া নূর এআই কুরআন শিক্ষায় '${levelTitle}' সফলভাবে সম্পন্ন করেছে! মোট স্টার: ${totalStars} ⭐, স্ট্রিক: ${streak} দিন 🔥। মাশাআল্লাহ! 🤲`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg max-h-[94vh] rounded-3xl bg-gradient-to-b from-[#092218] via-[#05150f] to-[#030d09] border-2 border-amber-500/70 shadow-2xl p-5 sm:p-8 flex flex-col items-center text-center overflow-y-auto my-auto scrollbar-thin scrollbar-thumb-emerald-800">
        {/* Islamic Ornament Geometric Background Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-emerald-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Card Content */}
        <div ref={cardRef} className="w-full flex flex-col items-center space-y-4">
          {/* Top Decorative Emblem */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-600 to-amber-300 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-[#04120c] flex items-center justify-center border border-amber-400/50">
                <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-[#092218]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              مَا شَاءَ اللَّهُ · অভিনন্দন ও প্রশংসাপত্র
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {levelTitle}
            </h2>
            <p className="text-xs text-emerald-300/90 font-medium max-w-sm">
              রাহমানিয়া ইনস্টিটিউট নূর এআই কুরআন লার্নিং প্ল্যাটফর্ম
            </p>
          </div>

          {/* Recipient Frame */}
          <div className="w-full py-3 px-4 rounded-2xl bg-[#061c12] border border-amber-500/40 shadow-inner">
            <p className="text-[11px] text-slate-400">সাফল্যের স্বীকৃতিস্বরূপ প্রদান করা হলো</p>
            <p className="text-lg font-black text-amber-200 mt-0.5">{studentName}</p>
            <p className="text-[11px] text-emerald-400/90 mt-1 font-semibold">
              কুরআন শেখার সহজ উপায় (৩৫টি প্রামাণ্য পাঠ)
            </p>
          </div>

          {/* Performance Stats Badges */}
          <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-black">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{totalStars}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">অর্জিত স্টার</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-300 text-sm font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{completedCount}/{totalCount}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">পাঠ সমাপ্ত</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex flex-col items-center">
              <div className="flex items-center gap-1 text-rose-400 text-sm font-black">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{streak} দিন</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">ধারাবাহিকতা</span>
            </div>
          </div>

          {/* Islamic Dua Ribbon */}
          <p className="text-[11px] text-slate-300 italic max-w-sm pt-1 border-t border-emerald-900/60">
            &ldquo;হে আল্লাহ! আমাদের সন্তানদের জন্য কুরআনুল কারীমকে হেদায়েত ও চোখের শীতলতা বানিয়ে দিন। আমীন।&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-6 mt-2 border-t border-emerald-900/60">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে শেয়ার করুন 📱</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ডাউনলোড / প্রিন্ট 🖨️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
