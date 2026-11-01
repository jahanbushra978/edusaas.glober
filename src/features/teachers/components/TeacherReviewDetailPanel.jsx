"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Volume2,
  AlertTriangle,
  Sliders,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { universalAudioEngine } from "@/lib/quran/audio";

export default function TeacherReviewDetailPanel({
  selectedSub,
  _teacherName,
  onApproveSubmission,
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [overrideMakhraj, setOverrideMakhraj] = useState(
    selectedSub?.teacherOverride ? selectedSub.teacherOverride.makhraj : selectedSub?.aiScore.makhraj || 85
  );
  const [overrideTajweed, setOverrideTajweed] = useState(
    selectedSub?.teacherOverride ? selectedSub.teacherOverride.tajweed : selectedSub?.aiScore.tajweed || 85
  );
  const [overrideFluency, setOverrideFluency] = useState(
    selectedSub?.teacherOverride ? selectedSub.teacherOverride.fluency : selectedSub?.aiScore.fluency || 85
  );
  const [teacherRemarks, setTeacherRemarks] = useState(selectedSub?.teacherNotes || "");
  const [isApplying, setIsApplying] = useState(false);

  // Sync state when selectedSub changes
  React.useEffect(() => {
    if (!selectedSub) return;
    const m = selectedSub.teacherOverride ? selectedSub.teacherOverride.makhraj : selectedSub.aiScore.makhraj;
    const t = selectedSub.teacherOverride ? selectedSub.teacherOverride.tajweed : selectedSub.aiScore.tajweed;
    const f = selectedSub.teacherOverride ? selectedSub.teacherOverride.fluency : selectedSub.aiScore.fluency;
    setOverrideMakhraj(m);
    setOverrideTajweed(t);
    setOverrideFluency(f);
    setTeacherRemarks(selectedSub.teacherNotes || "");
    setIsPlayingAudio(false);
  }, [selectedSub]);

  if (!selectedSub) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <BookOpen className="w-12 h-12 mb-3 text-slate-600 opacity-40" />
        <p className="text-sm font-medium">বাম পাশের তালিকা থেকে একটি পরীক্ষা বা সাবমিশন নির্বাচন করুন।</p>
      </div>
    );
  }

  const calculatedOverall =
    Math.round((overrideMakhraj * 0.4 + overrideTajweed * 0.4 + overrideFluency * 0.2) * 10) / 10;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      universalAudioEngine.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const audioUrl = selectedSub.audioUrl || "https://everyayah.com/data/Alafasy_128kbps/001001.mp3";
      universalAudioEngine.playWord(audioUrl, {
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
      toast.info("তিলাওয়াত অডিও প্লেব্যাক শুরু হয়েছে...");
    }
  };

  const handleApprove = (isApproved) => {
    setIsApplying(true);
    setTimeout(() => {
      onApproveSubmission(selectedSub.id, isApproved, {
        overrideMakhraj,
        overrideTajweed,
        overrideFluency,
        calculatedOverall,
        teacherRemarks,
      });
      setIsApplying(false);
      toast.success(isApproved ? "সাবমিশন অনুমোদিত ও রেকর্ড আপডেট করা হয়েছে!" : "সাবমিশন প্রত্যাখ্যাত হয়েছে।");
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Detail Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-950 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>{selectedSub.studentName}</span>
            <span className="text-xs font-normal text-emerald-400">({selectedSub.rollNo})</span>
          </h3>
          <p className="text-xs text-slate-400">{selectedSub.examTitle}</p>
        </div>

        {/* Audio Player Action */}
        <button
          onClick={handleToggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 ${
            isPlayingAudio
              ? "bg-amber-600 text-white animate-pulse"
              : "bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isPlayingAudio ? "অডিও থামান" : "রেকর্ডিং শুনুন"}</span>
        </button>
      </div>

      {/* AI Diagnosis Deviations Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-950 space-y-2">
        <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>এআই ফনোলজি ও তাজবীদ বিশ্লেষণ ফলাফল</span>
        </h4>
        {selectedSub.aiScore.deviations.length > 0 ? (
          <div className="space-y-1.5">
            {selectedSub.aiScore.deviations.map((dev, i) => (
              <div key={i} className="text-xs bg-black/40 p-2 rounded-lg border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="font-uthmani text-amber-300 text-sm font-bold mr-2">{dev.word}</span>
                  <span className="text-slate-300">({dev.rule}):</span>
                  <span className="text-slate-400 ml-1">{dev.issue}</span>
                </div>
                {dev.timestamp && <span className="text-[10px] text-slate-500 font-mono shrink-0">{dev.timestamp}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-400 font-medium">কোনো গুরুতর ভুল বা তাজবীদ বিচ্যুতি ধরা পড়েনি। মাশাআল্লাহ!</p>
        )}
      </div>

      {/* Score Comparison & Teacher Override */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI Given Scores */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400">এআই মূল্যায়িত স্কোর</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">মাখরাজ</span>
              <span className="text-sm font-bold text-white">{selectedSub.aiScore.makhraj}%</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">তাজবীদ</span>
              <span className="text-sm font-bold text-white">{selectedSub.aiScore.tajweed}%</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">সাবলীলতা</span>
              <span className="text-sm font-bold text-white">{selectedSub.aiScore.fluency}%</span>
            </div>
          </div>
        </div>

        {/* Teacher Adjusted Live Total */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
          <span className="text-xs font-bold text-emerald-400">চূড়ান্ত শিক্ষক সমন্বিত স্কোর</span>
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-slate-300">ওভারল স্কোর:</span>
            <span className="text-2xl font-black text-amber-400">{calculatedOverall}%</span>
          </div>
          <span className="text-[10px] text-slate-400 block text-right">মাখরাজ ৪০% + তাজবীদ ৪০% + সাবলীলতা ২০%</span>
        </div>
      </div>

      {/* Teacher Override Sliders */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-950 space-y-3">
        <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>শিক্ষক মূল্যায়ন সমন্বয় (Teacher Override)</span>
        </h4>

        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">মাখরাজ ও হরফ স্পষ্টতা:</span>
              <span className="text-emerald-400 font-bold">{overrideMakhraj}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={overrideMakhraj}
              onChange={(e) => setOverrideMakhraj(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">তাজবীদ ও গুন্নাহ নিয়ম:</span>
              <span className="text-emerald-400 font-bold">{overrideTajweed}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={overrideTajweed}
              onChange={(e) => setOverrideTajweed(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">সাবলীলতা ও রিডিং স্পিড:</span>
              <span className="text-emerald-400 font-bold">{overrideFluency}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={overrideFluency}
              onChange={(e) => setOverrideFluency(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Remarks Input */}
        <div className="space-y-1 pt-1">
          <label className="text-xs text-slate-300 block font-medium">শিক্ষকের নোট ও পরামর্শ:</label>
          <textarea
            value={teacherRemarks}
            onChange={(e) => setTeacherRemarks(e.target.value)}
            placeholder="শিক্ষার্থীর ভুল ও সংশোধনের নির্দেশনা লিখুন..."
            rows={2}
            className="w-full p-2.5 rounded-lg bg-black/40 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isApplying}
            onClick={() => handleApprove(false)}
            className="text-xs h-8 cursor-pointer"
          >
            প্রত্যাখ্যান করুন
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isApplying}
            onClick={() => handleApprove(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            অনুমোদন ও রেজাল্ট আপডেট
          </Button>
        </div>
      </div>
    </div>
  );
}
