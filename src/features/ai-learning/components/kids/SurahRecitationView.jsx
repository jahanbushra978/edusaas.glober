"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Volume2, Pause, Send, CheckCircle2 } from "lucide-react";
import { KIDS_SURAHS_DATA } from "../../data/kidsGameData.js";
import { playTapSound } from "../../lib/arabicSoundPlayer";
import { submitRecitationForReview } from "../../lib/recitationReviewBridge.js";
import { universalAudioEngine } from "@/lib/quran/audio";

export default function SurahRecitationView({
  currentIdx,
  onSelectSurah,
}) {
  const [surahAyahIdx, setSurahAyahIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentItem = KIDS_SURAHS_DATA[currentIdx] || KIDS_SURAHS_DATA[0];
  const ayah = currentItem?.ayahs?.[surahAyahIdx] || currentItem?.ayahs?.[0];

  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      universalAudioEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    if (ayah?.audio) {
      setIsPlayingAudio(true);
      universalAudioEngine.playWord(ayah.audio, {
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleSendToUstadh = () => {
    submitRecitationForReview({
      studentName: "নূর শিক্ষার্থী",
      rollNo: "N-101",
      batch: "আমপারা বিভাগ",
      examType: "reading",
      examTitle: `${currentItem.nameBn} (আয়াত ${surahAyahIdx + 1})`,
      verseText: ayah?.ar || "",
      audioUrl: ayah?.audio || "",
      aiScore: 90,
    });
    setIsSubmitted(true);
  };

  return (
    <div className="py-2 space-y-4 animate-kids-pop">
      {/* 38 Surahs Selector Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-300">
        {KIDS_SURAHS_DATA.map((surah, sIdx) => (
          <button
            key={surah.id}
            type="button"
            onClick={() => {
              playTapSound();
              onSelectSurah(sIdx);
              setSurahAyahIdx(0);
              setIsSubmitted(false);
              universalAudioEngine.stop();
              setIsPlayingAudio(false);
            }}
            className={`kids-tap px-3 py-1.5 rounded-xl text-xs font-black kids-font shrink-0 transition border-2 ${
              sIdx === currentIdx
                ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm scale-105"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {surah.nameBn}
          </button>
        ))}
      </div>

      {/* Current Ayah Display */}
      <div className="p-4 sm:p-6 rounded-[2.5rem] bg-gradient-to-tr from-[#051A11] via-[#09261B] to-[#051A11] text-white border-4 border-amber-400 shadow-xl space-y-4 text-center">
        <div className="flex items-center justify-between text-xs text-amber-300 font-bold border-b border-white/10 pb-2">
          <span className="kids-font font-black">{currentItem.nameBn} ({currentItem.nameAr})</span>
          <span>আয়াত {surahAyahIdx + 1} / {currentItem.totalAyahs}</span>
        </div>

        {/* Grand Arabic Ayah */}
        <p className="font-amiri text-2xl sm:text-4xl font-black text-amber-200 leading-relaxed drop-shadow-md py-2">
          {ayah?.ar}
        </p>

        {/* Bengali Meaning */}
        <p className="kids-font text-xs sm:text-sm text-emerald-100 font-medium max-w-md mx-auto">
          {ayah?.bn}
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={surahAyahIdx === 0}
            onClick={() => {
              playTapSound();
              setSurahAyahIdx((prev) => Math.max(0, prev - 1));
              setIsSubmitted(false);
              universalAudioEngine.stop();
              setIsPlayingAudio(false);
            }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer active:scale-95"
            title="পূর্ববর্তী আয়াত"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handlePlayAudio}
            className="kids-tap px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black kids-font text-sm flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>থামাও</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>ক্বারীর তিলাওয়াত শোনো</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={surahAyahIdx >= (currentItem?.ayahs?.length || 1) - 1}
            onClick={() => {
              playTapSound();
              setSurahAyahIdx((prev) => Math.min((currentItem?.ayahs?.length || 1) - 1, prev + 1));
              setIsSubmitted(false);
              universalAudioEngine.stop();
              setIsPlayingAudio(false);
            }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer active:scale-95"
            title="পরবর্তী আয়াত"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Ustadh Review Submission Hook */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-center">
          {isSubmitted ? (
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>মাশাআল্লাহ! উস্তাদের রিভিউ কিউতে সফলভাবে জমা হয়েছে</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendToUstadh}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black kids-font flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>উস্তাদের নিকট তিলাওয়াত পাঠাও</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

