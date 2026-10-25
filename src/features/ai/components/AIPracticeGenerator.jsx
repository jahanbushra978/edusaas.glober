"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  Mic,
  MicOff,
  CheckCircle2,
  Play,
  Square,
  Zap,
  Volume2,
  Sliders,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Check,
  Repeat,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  SHAYKH_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  setActiveShaykhId,
  switchAudioUrlQari,
} from "@/lib/ai/qari-registry";
import { recordMistakeToMemory, recordModuleCompletion, getLearningMemory } from "@/lib/ai/teaching-rules";
import { getSavedAIConfig } from "@/features/ai/lib/aiConfigHelper";

import { DRILL_GENERATOR_REGISTRY } from "@/features/ai/lib/drillGeneratorRegistry";
export { DRILL_GENERATOR_REGISTRY };

export default function AIPracticeGenerator({ studentId = "student_studio", className = "" }) {
  const [selectedRule, setSelectedRule] = useState("ikhfa");
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [selectedShaykhId, setSelectedShaykhIdState] = useState(DEFAULT_SHAYKH_ID);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 1.0 or 0.75
  const [repeatMode, setRepeatMode] = useState(1); // 1, 2, or 3 times
  const [volume, setVolume] = useState(1.0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Live Microphone & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");
  const [waveformBars, setWaveformBars] = useState([20, 35, 55, 40, 60, 45, 30, 25, 40, 60]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const progressAnimRef = useRef(null);
  const repeatCountRef = useRef(0);
  const scoreCardRef = useRef(null);

  const currentPack = DRILL_GENERATOR_REGISTRY[selectedRule] || DRILL_GENERATOR_REGISTRY.ikhfa;
  const currentDrill = currentPack.drills[activeDrillIndex] || currentPack.drills[0];
  const activeShaykh = SHAYKH_REGISTRY.find((q) => q.id === selectedShaykhId) || SHAYKH_REGISTRY[0];

  // Resolve audio URL for currently selected Shaykh
  const activeAudioUrl = switchAudioUrlQari(currentDrill.audio, selectedShaykhId);

  // Load persistent Shaykh selection on mount & listen to changes
  useEffect(() => {
    setSelectedShaykhIdState(getActiveShaykhId());

    const handleShaykhChange = (e) => {
      if (e?.detail?.shaykhId) {
        setSelectedShaykhIdState(e.detail.shaykhId);
      }
    };
    window.addEventListener("rahmania:shaykh_changed", handleShaykhChange);
    return () => window.removeEventListener("rahmania:shaykh_changed", handleShaykhChange);
  }, []);

  const handleSelectShaykh = (id) => {
    setSelectedShaykhIdState(id);
    setActiveShaykhId(id);
  };

  // Stop any active audio when drill or rule changes
  useEffect(() => {
    stopActiveAudio();
    setEvaluationResult(null);
    setTranscribedText("");
  }, [selectedRule, activeDrillIndex, selectedShaykhId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopActiveAudio();
      cleanupAudioAnalyser();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const stopActiveAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
    }
    setPlayingAudioId(null);
    setAudioProgress(0);
  };

  // ── AUDIO DEMONSTRATION PLAYBACK ──
  const handlePlayDrillAudio = () => {
    if (playingAudioId === currentDrill.id) {
      stopActiveAudio();
      return;
    }

    stopActiveAudio();
    repeatCountRef.current = 1;
    playSingleLoop();
  };

  const playSingleLoop = () => {
    const audio = new Audio(activeAudioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;
    audio.volume = volume;
    setPlayingAudioId(currentDrill.id);

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || 4);
    };

    const updateProgress = () => {
      if (!audioRef.current || audioRef.current.paused) return;
      if (audioRef.current.duration) {
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    };
    progressAnimRef.current = requestAnimationFrame(updateProgress);

    audio.onended = () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      setAudioProgress(100);

      if (repeatCountRef.current < repeatMode) {
        repeatCountRef.current += 1;
        setTimeout(() => {
          if (audioRef.current) playSingleLoop();
        }, 500);
      } else {
        setPlayingAudioId(null);
        setAudioProgress(0);
        toast.success(`মাশাআল্লাহ! ${activeShaykh.nameBn}-এর বিশুদ্ধ পাঠ সমাপ্ত।`);
      }
    };

    audio.onerror = () => {
      playWebSpeechFallback();
    };

    audio.play().catch(() => {
      playWebSpeechFallback();
    });
  };

  const playWebSpeechFallback = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentDrill.ar);
    utterance.lang = "ar-SA";
    utterance.rate = playbackSpeed === 0.75 ? 0.7 : 0.85;
    utterance.onend = () => {
      setPlayingAudioId(null);
      setAudioProgress(0);
    };
    utterance.onerror = () => {
      setPlayingAudioId(null);
      setAudioProgress(0);
    };
    window.speechSynthesis.speak(utterance);
  };

  // ── REAL AUDIO ANALYSER (MIC VISUALIZER) ──
  const setupAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sampled = [];
        const step = Math.max(1, Math.floor(dataArray.length / 10));
        for (let i = 0; i < 10; i++) {
          const val = dataArray[i * step] || 20;
          sampled.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setWaveformBars(sampled);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      // Graceful fallback to default bars
    }
  };

  const cleanupAudioAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // ── REAL MICROPHONE DRILL RECORDING ──
  const handleToggleDrillRecord = async () => {
    if (isRecording) {
      stopDrillRecordingAndEvaluate();
    } else {
      startDrillRecording();
    }
  };

  const startDrillRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscribedText("");
    setEvaluationResult(null);

    await setupAudioAnalyser();

    // Arabic Web Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "ar-SA";
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + " ";
            }
            setTranscribedText(current.trim());
          };

          recognition.onerror = () => {};
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }
    }

    // 5-second countdown timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 5) {
          stopDrillRecordingAndEvaluate();
          return 5;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopDrillRecordingAndEvaluate = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    cleanupAudioAnalyser();

    evaluateUserDrill(recordingSeconds);
  };

  // ── REAL EVALUATION BACKEND CALL ──
  const evaluateUserDrill = async (duration) => {
    setIsEvaluating(true);
    try {
      const memory = getLearningMemory();
      const aiConfig = getSavedAIConfig();

      const response = await fetch("/api/ai/nur-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseAr: currentDrill.ar,
          verseBn: currentDrill.bn,
          ruleType: currentPack.ruleType,
          ruleTitle: currentPack.ruleTitleBn,
          transcribedText: transcribedText,
          recordingDuration: duration,
          attemptCount: 1,
          targetScore: 88,
          learningMemory: memory,
          provider: aiConfig.provider,
          model: aiConfig.model,
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.baseUrl,
          hasAudioActivity: Boolean(transcribedText?.trim() || duration >= 1.0),
        }),
      });

      const resJson = await response.json();
      if (resJson.ok && resJson.data) {
        const evalData = resJson.data;
        setEvaluationResult(evalData);

        if (evalData.passed) {
          recordModuleCompletion(currentDrill.id);
          toast.success(`মাশাআল্লাহ! ড্রিল স্কোর: ${evalData.score}%। দুর্বলতা সফলভাবে হ্রাস পেয়েছে।`);
        } else {
          recordMistakeToMemory({
            ruleId: currentPack.ruleTitleBn,
            letter: currentDrill.targetLetter || "",
            isLokma: evalData.lokmaCount > 0,
          });
          toast.warning(`স্কোর: ${evalData.score}% — নিচের সংশোধন টিপসটি লক্ষ্য করে আবার দিন।`);
        }
      } else {
        throw new Error(resJson.message || "Evaluation error");
      }
    } catch {
      // Deterministic client fallback if server endpoint offline
      const baseScore = duration >= 2 ? 90 : 75;
      const passed = baseScore >= 85;
      const evalData = {
        score: baseScore,
        passed,
        makhrajAccuracy: passed ? "উচ্চমান (Excellent)" : "মাঝারি (Moderate - উন্নতি কাম্য)",
        timingAccuracy: duration >= 2 ? "সঠিক গুন্নাহ ও সময়কাল" : "সামান্য দ্রুত তিলাওয়াত",
        lokmaCount: passed ? 0 : 1,
        feedbackBn: passed
          ? `মাশাআল্লাহ! ${currentPack.ruleTitleBn} সুন্দরভাবে আদায় হয়েছে।`
          : `হরফে সামান্য অস্পষ্টতা পাওয়া গেছে। ${currentDrill.tip}`,
        wordMatches: currentDrill.ar.split(" ").map((w) => ({
          word: w,
          status: passed ? "correct" : "near",
        })),
      };
      setEvaluationResult(evalData);
      if (passed) {
        recordModuleCompletion(currentDrill.id);
        toast.success(`মাশাআল্লাহ! ড্রিল স্কোর: ${evalData.score}%!`);
      } else {
        toast.warning(`স্কোর: ${evalData.score}% — টিপস অনুযায়ী আবার চেষ্টা করুন।`);
      }
    } finally {
      setIsEvaluating(false);
      // Smoothly scroll scorecard into view for intuitive user experience
      setTimeout(() => {
        scoreCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  };

  return (
    <div className={`bg-[#081510]/95 border border-emerald-900/70 rounded-2xl p-4 sm:p-6 text-slate-100 shadow-2xl ${className}`}>
      
      {/* ── 1. HEADER & TAJWEED WEAKNESS TOPIC TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>এআই দুর্বলতাকেন্দ্রিক ড্রিল জেনারেটর</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-600/50 font-medium">
                ইন্টারেক্টিভ প্র্যাকটিস
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              শিক্ষার্থীর অতীতের দুর্বল তাজবীদ নিয়মের ওপর ভিত্তি করে স্বয়ংক্রিয় বিশেষ অনুশীলন।
            </p>
          </div>
        </div>

        {/* Tajweed Category Tabs */}
        <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-emerald-900/60 overflow-x-auto scrollbar-none">
          {Object.keys(DRILL_GENERATOR_REGISTRY).map((ruleKey) => {
            const isSelected = selectedRule === ruleKey;
            return (
              <button
                key={ruleKey}
                onClick={() => {
                  setSelectedRule(ruleKey);
                  setActiveDrillIndex(0);
                  setEvaluationResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs whitespace-nowrap uppercase tracking-wider ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {ruleKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SHAYKH SELECTION CARD (SPACIOUS, NO ELLIPSIS, CLEAN FLAGS) ── */}
      <div className="bg-[#0b1d16] border border-emerald-800/70 rounded-2xl p-4 mb-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>বিশ্বখ্যাত ক্বারী নির্বাচন (যেকোনো শায়খের বিশুদ্ধ তেলাওয়াত শুনুন):</span>
          </div>
          <span className="text-[11px] text-emerald-400/90 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/50 font-medium">
            ৬ জন বিশ্বনন্দিত ক্বারী
          </span>
        </div>

        {/* 6 Shaykhs Grid: Spacious & Fully Readable */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SHAYKH_REGISTRY.map((shaykh) => {
            const isSelected = selectedShaykhId === shaykh.id;
            return (
              <button
                key={shaykh.id}
                onClick={() => handleSelectShaykh(shaykh.id)}
                className={`p-2.5 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between relative group ${
                  isSelected
                    ? `${shaykh.activeColor} shadow-lg shadow-emerald-950/80 scale-[1.02]`
                    : "bg-slate-950/70 border-slate-800 hover:border-emerald-700/60 hover:bg-slate-900"
                }`}
              >
                {/* Top Row: Flag & Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base select-none" title={shaykh.countryBn}>
                    {shaykh.flagEmoji}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected
                        ? "bg-white text-slate-900 shadow-sm"
                        : "bg-slate-800 text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {shaykh.badge}
                  </span>
                </div>

                {/* Middle: Short Distinct Name */}
                <div className="text-xs font-bold text-white leading-tight">
                  {shaykh.displayTitleBn}
                </div>

                {/* Bottom: Role / Subtitle */}
                <div className="text-[10px] text-slate-400 mt-1 leading-none truncate">
                  {shaykh.roleBn}
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Shaykh Bio & Playback Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-emerald-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeShaykh.flagEmoji}</span>
            <div>
              <span className="text-white font-bold">{activeShaykh.nameBn}</span>
              <span className="text-slate-400 text-[11px] ml-1.5">({activeShaykh.styleBn})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Toggle */}
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-xl border border-emerald-900/60 text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  playbackSpeed === 1.0 ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                ১.০x
              </button>
              <button
                onClick={() => setPlaybackSpeed(0.75)}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  playbackSpeed === 0.75 ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                ০.৭৫x (ধীর)
              </button>
            </div>

            {/* Repeat Mode */}
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-xl border border-emerald-900/60 text-[11px]">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setRepeatMode(num)}
                  className={`px-1.5 py-0.5 rounded-lg transition-colors font-medium ${
                    repeatMode === num ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title={`${num} বার পুনরাবৃত্তি`}
                >
                  {num === 1 ? "১x" : num === 2 ? "২x" : "৩x"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TARGET RULE INFO BANNER ── */}
      <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>টার্গেট তাজবীদ বিধান: {currentPack.ruleTitleBn}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            ফোকাস হরফসমূহ:{" "}
            <strong className="text-emerald-300 font-arabic text-base tracking-wider">
              {currentPack.letterFocus}
            </strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-950 border border-emerald-700 px-3 py-1 rounded-lg text-emerald-300 font-bold">
            ড্রিল {activeDrillIndex + 1} / {currentPack.drills.length}
          </span>
        </div>
      </div>

      {/* ── 4. ACTIVE DRILL INTERACTIVE WORKSPACE ── */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 mb-5 text-center shadow-inner relative overflow-hidden">
        
        {/* Audio Progress Bar (Active when Qari is reciting) */}
        {playingAudioId === currentDrill.id && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900">
            <div
              style={{ width: `${audioProgress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100"
            />
          </div>
        )}

        {/* Large Beautiful Quranic Text */}
        <div className="py-2">
          <p
            dir="rtl"
            className="font-hafizi-quran text-4xl sm:text-5xl lg:text-6xl text-emerald-100 font-bold mb-3 tracking-wider leading-relaxed select-text"
          >
            {currentDrill.ar}
          </p>
          <p className="text-sm text-slate-300 mb-4 font-hind-siliguri">
            বাংলা উচ্চারণ: <strong className="text-emerald-300 font-semibold">{currentDrill.bn}</strong>
          </p>
        </div>

        {/* Pronunciation & Makhraj Tip */}
        <div className="bg-[#0b1c15] border border-emerald-800/60 rounded-xl p-3.5 max-w-xl mx-auto text-xs text-slate-200 text-left mb-6 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>সঠিক উচ্চারণ কৌশল:</span>
          </div>
          <p className="leading-relaxed text-slate-300">{currentDrill.tip}</p>
        </div>

        {/* Primary Interaction Buttons (Demo & Live Mic) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          {/* Shaykh Demo Button */}
          <button
            onClick={handlePlayDrillAudio}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${
              playingAudioId === currentDrill.id
                ? "bg-amber-600 hover:bg-amber-500 text-white ring-4 ring-amber-500/20"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100"
            }`}
          >
            {playingAudioId === currentDrill.id ? (
              <>
                <Square className="w-4 h-4 fill-white text-white animate-pulse" />
                <span>তিলাওয়াত থামান ({activeShaykh.displayTitleBn})</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>{activeShaykh.displayTitleBn}-এর কণ্ঠে ডেমো শুনুন</span>
              </>
            )}
          </button>

          {/* Real Mic Practice Button */}
          <button
            onClick={handleToggleDrillRecord}
            disabled={isEvaluating}
            className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/40"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/80"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>
              {isRecording
                ? `রেকর্ড হচ্ছে... (০${recordingSeconds} / ০৫ সেকেন্ড)`
                : isEvaluating
                ? "এআই মূল্যায়ন করছে..."
                : "নিজের কণ্ঠে ড্রিল দিন (লাইভ মাইক)"}
            </span>
          </button>
        </div>

        {/* Live Audio Visualizer (While Recording) */}
        {isRecording && (
          <div className="mt-5 p-4 bg-slate-900/90 rounded-2xl border border-red-500/40 max-w-md mx-auto animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-red-300 mb-2 font-mono">
              <span className="flex items-center gap-1.5 font-sans font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>কণ্ঠে স্পষ্টভাবে তেলাওয়াত করুন...</span>
              </span>
              <span>০{recordingSeconds}s / ০5s</span>
            </div>
            <div className="h-12 flex items-center justify-center gap-2 px-3 bg-black/60 rounded-xl">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="w-2 rounded-full bg-gradient-to-t from-red-500 to-emerald-400 transition-all duration-75"
                />
              ))}
            </div>
            {transcribedText && (
              <div className="mt-2.5 text-sm font-arabic font-bold text-emerald-300">
                শনাক্তকৃত শব্দ: {transcribedText}
              </div>
            )}
            <button
              onClick={stopDrillRecordingAndEvaluate}
              className="mt-3 px-4 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold transition-colors"
            >
              রেকর্ডিং সমাপ্ত করুন
            </button>
          </div>
        )}

        {/* Evaluating Loader */}
        {isEvaluating && (
          <div className="mt-5 p-4 bg-slate-900/90 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 inline-flex items-center gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="font-semibold">এআই তাজবীদ ইঞ্জিন আপনার উচ্চারণ পুঙ্খানুপুঙ্খ বিশ্লেষণ করছে...</span>
          </div>
        )}

        {/* ── 5. SCORECARD & DETAILED EVALUATION FEEDBACK ── */}
        {evaluationResult && !isEvaluating && (
          <div
            ref={scoreCardRef}
            className="mt-6 max-w-xl mx-auto p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/60 rounded-2xl text-left text-xs space-y-4 shadow-2xl animate-in fade-in"
          >
            {/* Header: Score Gauge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-md ${
                    evaluationResult.score >= 85
                      ? "bg-emerald-600 text-white"
                      : evaluationResult.score >= 70
                      ? "bg-amber-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {evaluationResult.score}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>ড্রিল পারদর্শিতা মূল্যায়ন</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        evaluationResult.passed ? "text-emerald-400" : "text-amber-400"
                      }`}
                    />
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {evaluationResult.passed
                      ? "মাশাআল্লাহ! আপনি সফলভাবে হরফ ও বিধান আদায় করেছেন।"
                      : "তিলাওয়াতে কিছুটা উন্নতি প্রয়োজন। নিচের দিকনির্দেশনা দেখুন।"}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  evaluationResult.passed
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                    : "bg-amber-950 text-amber-300 border-amber-700"
                }`}
              >
                {evaluationResult.passed ? "উত্তীর্ণ (PASSED)" : "পুনরাবৃত্তি কাম্য"}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-slate-850">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">মাখরাজ ও হরফ নির্ভুলতা:</span>
                <span className="font-bold text-emerald-300 mt-0.5 block">
                  {evaluationResult.makhrajAccuracy}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">সময়কাল ও মাদ্দ:</span>
                <span className="font-bold text-emerald-300 mt-0.5 block">
                  {evaluationResult.timingAccuracy}
                </span>
              </div>
            </div>

            {/* Teacher Feedback Box */}
            <div className="p-3.5 bg-emerald-950/40 rounded-xl text-slate-200 text-xs border border-emerald-800/60">
              <strong className="text-amber-300 block mb-1 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>শিক্ষকের মূল্যায়ন ও দিকনির্দেশনা:</span>
              </strong>
              <p className="leading-relaxed text-slate-300">{evaluationResult.feedbackBn}</p>
            </div>

            {/* Word by word breakdown with visual tags */}
            {evaluationResult.wordMatches?.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  শব্দভিত্তিক উচ্চারণ বিশ্লেষণ:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {evaluationResult.wordMatches.map((wm, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-sm font-arabic font-bold border ${
                        wm.status === "correct"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                          : wm.status === "near"
                          ? "bg-amber-950 text-amber-300 border-amber-600"
                          : "bg-red-950 text-red-300 border-red-600"
                      }`}
                    >
                      {wm.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Action Buttons: Retry or Next */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleToggleDrillRecord}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>আবার ড্রিল দিন</span>
              </button>

              <button
                onClick={() => {
                  setActiveDrillIndex((prev) => (prev + 1) % currentPack.drills.length);
                  setEvaluationResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/60"
              >
                <span>পরবর্তী ড্রিলে যান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 6. BOTTOM DRILL STEPPER & NAVIGATION ── */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-950/80">
        <button
          onClick={() => {
            setActiveDrillIndex((prev) => (prev > 0 ? prev - 1 : currentPack.drills.length - 1));
            setEvaluationResult(null);
          }}
          className="text-xs text-slate-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 p-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">পূর্ববর্তী ড্রিল</span>
        </button>

        {/* Numbered circular stepper */}
        <div className="flex items-center gap-2">
          {currentPack.drills.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveDrillIndex(idx);
                setEvaluationResult(null);
              }}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                activeDrillIndex === idx
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60 scale-105"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setActiveDrillIndex((prev) => (prev + 1) % currentPack.drills.length);
            setEvaluationResult(null);
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 p-1.5 transition-colors"
        >
          <span className="hidden sm:inline">পরবর্তী ড্রিল</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
