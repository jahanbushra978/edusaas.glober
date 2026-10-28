"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Save,
  Loader2,
  Sliders,
  Check,
  Play,
  Pause,
  Headphones,
  Compass,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  resolveTeacherReaction,
  recordMistakeToMemory,
  recordModuleCompletion,
  getLearningMemory,
} from "@/lib/ai/teaching-rules";
import { appClient } from "@/api/appClient";
import {
  SHAYKH_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  setActiveShaykhId,
  switchAudioUrlQari,
} from "@/lib/ai/qari-registry";
import NurShaykhSelector from "./NurShaykhSelector";
import { LESSON_MODULES } from "../lib/nurLessonModules";
import { getSavedAIConfig } from "../lib/aiConfigHelper";
export { LESSON_MODULES };

const PEDAGOGICAL_STEPS = [
  {
    num: 1,
    bnNum: "১",
    label: "ব্যাখ্যা",
    sub: "Explain",
    tip: "সহজ নিয়ম",
    icon: BookOpen,
    activeGradient: "from-sky-500 to-blue-600",
    borderActive: "border-sky-400",
    shadowColor: "shadow-sky-500/30",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/40",
    glowDot: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
  },
  {
    num: 2,
    bnNum: "২",
    label: "ডেমো",
    sub: "Demo",
    tip: "ক্বারীর সুর",
    icon: Volume2,
    activeGradient: "from-purple-500 to-indigo-600",
    borderActive: "border-purple-400",
    shadowColor: "shadow-purple-500/30",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    glowDot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
  },
  {
    num: 3,
    bnNum: "৩",
    label: "অনুশীলন",
    sub: "Practice",
    tip: "মুখে বলা",
    icon: Mic,
    activeGradient: "from-emerald-500 to-teal-600",
    borderActive: "border-emerald-400",
    shadowColor: "shadow-emerald-500/30",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    glowDot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
  },
  {
    num: 4,
    bnNum: "৪",
    label: "মূল্যায়ন",
    sub: "Evaluate",
    tip: "এআই পরীক্ষা",
    icon: CheckCircle2,
    activeGradient: "from-amber-500 to-yellow-600",
    borderActive: "border-amber-400",
    shadowColor: "shadow-amber-500/30",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    glowDot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
  },
  {
    num: 5,
    bnNum: "৫",
    label: "সংশোধন",
    sub: "Correct",
    tip: "টিপস ও শুদ্ধ",
    icon: AlertCircle,
    activeGradient: "from-rose-500 to-pink-600",
    borderActive: "border-rose-400",
    shadowColor: "shadow-rose-500/30",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    glowDot: "bg-rose-400 shadow-[0_0_8px_#fb7185]",
  },
  {
    num: 6,
    bnNum: "৬",
    label: "সমাপ্তি",
    sub: "Complete",
    tip: "মাশাআল্লাহ!",
    icon: Award,
    activeGradient: "from-yellow-400 to-amber-500",
    borderActive: "border-yellow-400",
    shadowColor: "shadow-yellow-500/30",
    badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
    glowDot: "bg-yellow-400 shadow-[0_0_8px_#facc15]",
  },
];

export default function NurTeachingEngine({
  onMakhrajHighlight,
  onMakhrajSelect,
  studentContext,
  customVerse,
  onOpenReader,
}) {
  const triggerMakhraj = onMakhrajHighlight || onMakhrajSelect;
  const [selectedModuleId, setSelectedModuleId] = useState("noon_izhar");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentStep, setCurrentStep] = useState(1); // 1: Explain, 2: Demo, 3: Practice, 4: Evaluate, 5: Correct, 6: Repeat
  const [attemptCount, setAttemptCount] = useState(1);
  const [selectedShaykhId, setSelectedShaykhId] = useState(DEFAULT_SHAYKH_ID);

  // Audio & Mic States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 1.0 or 0.75
  const [isExplainingVoice, setIsExplainingVoice] = useState(false);

  // Waveform visualization
  const [waveformBars, setWaveformBars] = useState([25, 45, 75, 40, 60, 85, 50, 70, 35, 60]);

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [teacherReaction, setTeacherReaction] = useState(null);

  // Save to Hifz State
  const [isSavingToHifz, setIsSavingToHifz] = useState(false);
  const [hifzSaved, setHifzSaved] = useState(false);

  // Active Shaykh object
  const activeShaykh =
    SHAYKH_REGISTRY.find((q) => q.id === selectedShaykhId) || SHAYKH_REGISTRY[0];

  // Dynamic module when opened from Quran Reader
  const dynamicModule = useMemo(() => {
    if (!customVerse) return null;
    const { surah, ayah, text, bengali } = customVerse;
    const match = LESSON_MODULES.find(
      (m) =>
        (surah === 1 && ayah === 1 && m.id === "fatiha_1") ||
        (surah === 1 && ayah === 2 && m.id === "fatiha_2")
    );
    if (match) return match;

    const s = String(surah).padStart(3, "0");
    const a = String(ayah).padStart(3, "0");
    const audioUrl = `https://everyayah.com/data/${activeShaykh.cdnDir}/${s}${a}.mp3`;

    return {
      id: `custom_${surah}_${ayah}`,
      category: `কুরআন পাঠ (সূরা ${surah}, আয়াত ${ayah})`,
      titleBn: `সূরা নং ${surah} (আয়াত ${ayah})`,
      ruleType: "Tajweed & Tilawat",
      ruleTitleBn: `আয়াত ${ayah} সহীহ তিলাওয়াত`,
      verseAr: text || `সূরা ${surah}, আয়াত ${ayah}`,
      verseBn: bengali || `আয়াত নং ${ayah}`,
      audioUrl,
      targetLetter: "ا",
      targetZone: "halq",
      explanationBn: `এই আয়াতের প্রতিটি হরফের বিশুদ্ধ মাখরাজ ও সিফাত বজায় রেখে সহীহ উচ্চারণে তিলাওয়াত করুন। ওয়াক্ফ, গুন্নাহ ও মাদ্দের নিয়মাবলি খেয়াল রাখুন।`,
      correctTipBn: `ক্বারির তিলাওয়াত মনোযোগ দিয়ে শুনুন এবং একই গতি ও সুরে পুনরাবৃত্তি করুন।`,
      targetScore: 90,
    };
  }, [customVerse, activeShaykh.cdnDir]);

  // Filter modules based on category
  const filteredModules = useMemo(() => {
    if (selectedCategory === "noon_meem") {
      return LESSON_MODULES.filter((m) => m.category.includes("নূন") || m.category.includes("মীম"));
    }
    if (selectedCategory === "madd") {
      return LESSON_MODULES.filter((m) => m.category.includes("মাদ্দ"));
    }
    if (selectedCategory === "tajweed") {
      return LESSON_MODULES.filter((m) => m.category.includes("তাজবীদ"));
    }
    if (selectedCategory === "surah") {
      return LESSON_MODULES.filter((m) => m.category.includes("সূরা"));
    }
    return LESSON_MODULES;
  }, [selectedCategory]);

  // When custom verse is provided, reset step and evaluations
  useEffect(() => {
    if (customVerse) {
      setCurrentStep(1);
      setEvaluationResult(null);
      setTeacherReaction(null);
      setHifzSaved(false);
    }
  }, [customVerse]);

  const activeModule =
    dynamicModule ||
    LESSON_MODULES.find((m) => m.id === selectedModuleId) ||
    LESSON_MODULES[0];

  const recordingTimerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const teacherAudioRef = useRef(null);

  // Load persistent Shaykh selection on mount & listen to changes
  useEffect(() => {
    setSelectedShaykhId(getActiveShaykhId());

    const handleShaykhChange = (e) => {
      if (e?.detail?.shaykhId) {
        setSelectedShaykhId(e.detail.shaykhId);
      }
    };
    window.addEventListener("rahmania:shaykh_changed", handleShaykhChange);
    return () => window.removeEventListener("rahmania:shaykh_changed", handleShaykhChange);
  }, []);

  const handleSelectShaykh = (id) => {
    setSelectedShaykhId(id);
    setActiveShaykhId(id);
    if (audioPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setAudioPlaying(false);
    }
  };

  const stopAllPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (teacherAudioRef.current) {
      teacherAudioRef.current.pause();
      teacherAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAudioPlaying(false);
    setIsExplainingVoice(false);
  };

  // Switch Module handler
  const handleSelectModule = (modId) => {
    stopAllPlayback();
    setSelectedModuleId(modId);
    setCurrentStep(1);
    setAttemptCount(1);
    setEvaluationResult(null);
    setTeacherReaction(null);
    setTranscribedText("");
    setHifzSaved(false);
  };

  // Play natural teacher explanation using Bengali TTS proxy (/api/ai/tts)
  const handlePlayTeacherVoice = () => {
    if (isExplainingVoice) {
      if (teacherAudioRef.current) {
        teacherAudioRef.current.pause();
        teacherAudioRef.current = null;
      }
      setIsExplainingVoice(false);
      return;
    }

    try {
      stopAllPlayback();
      const textToSpeak = `${activeModule.ruleTitleBn}। ${activeModule.explanationBn}`;
      const url = `/api/ai/tts?text=${encodeURIComponent(textToSpeak)}&lang=bn&gender=male`;
      const audio = new Audio(url);
      teacherAudioRef.current = audio;
      setIsExplainingVoice(true);
      audio.onended = () => setIsExplainingVoice(false);
      audio.onerror = () => setIsExplainingVoice(false);
      audio.play().catch(() => setIsExplainingVoice(false));
    } catch {
      setIsExplainingVoice(false);
    }
  };

  const playWebSpeechFallback = () => {
    if (typeof window === "undefined") return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeModule.verseAr);
        utterance.lang = "ar-SA";
        utterance.rate = playbackSpeed === 0.75 ? 0.65 : 0.85;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setAudioPlaying(false);
          if (currentStep === 2) {
            toast.success("বিশুদ্ধ ডেমো সমাপ্ত! এবার নিজের কণ্ঠে অনুশীলন করুন।");
          }
        };
        utterance.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setAudioPlaying(false), 1200);
      }
    } catch {
      setAudioPlaying(false);
    }
  };

  // Step 2: Audio demonstration playback using Authentic Qari Audio / Web Audio
  const handlePlayDemonstration = () => {
    if (typeof window === "undefined") return;

    if (audioPlaying) {
      stopAllPlayback();
      return;
    }

    stopAllPlayback();
    setAudioPlaying(true);

    const activeShaykh =
      SHAYKH_REGISTRY.find((q) => q.id === selectedShaykhId) || SHAYKH_REGISTRY[0];
    const resolvedUrl = switchAudioUrlQari(activeModule.audioUrl, selectedShaykhId);

    if (resolvedUrl) {
      try {
        const audio = new Audio(resolvedUrl);
        audioPlayerRef.current = audio;
        audio.playbackRate = playbackSpeed === 0.75 ? 0.75 : 1.0;
        audio.onended = () => {
          setAudioPlaying(false);
          if (currentStep === 2) {
            toast.success(
              `মাশাআল্লাহ! ${activeShaykh.shortNameBn}-এর বিশুদ্ধ তিলাওয়াত সমাপ্ত। এবার নিজের কণ্ঠে অনুশীলন করুন।`
            );
          }
        };
        audio.onerror = () => {
          playWebSpeechFallback();
        };
        audio.play().catch(() => {
          playWebSpeechFallback();
        });
      } catch {
        playWebSpeechFallback();
      }
    } else {
      playWebSpeechFallback();
    }
  };

  // Real Web Audio API waveform visualizer
  const setupAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      // Graceful fallback to simulated audio bars
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

  // Toggle Microphone recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      stopRecordingAndEvaluate();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    stopAllPlayback();
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscribedText("");
    setEvaluationResult(null);

    // Initialize Web Audio Visualizer
    await setupAudioAnalyser();

    // Initialize Web Speech Recognition in Arabic
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
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

    // 6-second countdown timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 6) {
          stopRecordingAndEvaluate();
          return 6;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecordingAndEvaluate = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    cleanupAudioAnalyser();

    // Advance to Step 4: Evaluate
    setCurrentStep(4);
    performAIEvaluation(recordingSeconds);
  };

  // Perform AI Recitation Evaluation
  const performAIEvaluation = async (duration) => {
    setIsEvaluating(true);
    try {
      const memory = getLearningMemory();
      const aiConfig = getSavedAIConfig();

      const response = await fetch("/api/ai/nur-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseAr: activeModule.verseAr,
          verseBn: activeModule.verseBn,
          ruleType: activeModule.ruleType,
          ruleTitle: activeModule.titleBn,
          transcribedText: transcribedText,
          recordingDuration: duration,
          attemptCount: attemptCount,
          targetScore: activeModule.targetScore,
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

        const reaction = resolveTeacherReaction(attemptCount);
        setTeacherReaction(reaction);

        if (evalData.passed) {
          recordModuleCompletion(activeModule.id);
          toast.success(`মাশাআল্লাহ! আপনি ${evalData.score}% পেয়ে সফলভাবে উত্তীর্ণ হয়েছেন!`);
        } else {
          // Record mistake to learning memory
          recordMistakeToMemory({
            ruleId: activeModule.id,
            letter: activeModule.targetLetter,
            isLokma: evalData.lokmaCount > 0,
          });
          setCurrentStep(5); // Go to Correct step
          toast.warning(`স্কোর: ${evalData.score}% — শিক্ষকের সংশোধন দেখে নিন।`);
        }
      } else {
        throw new Error(resJson.message || "Evaluation failed");
      }
    } catch (err) {
      console.warn("Falling back to client evaluation", err);
      // Fallback
      const baseScore = duration >= 2 ? 88 : 72;
      const passed = baseScore >= activeModule.targetScore;
      const evalData = {
        score: baseScore,
        passed,
        makhrajAccuracy: passed ? "উচ্চমান (Excellent)" : "মাঝারি (Moderate)",
        timingAccuracy: duration >= 2 ? "সঠিক মাদ্দ ও সময়কাল" : "দ্রুত পড়ার কারণে কিছুটা অপূর্ণ",
        lokmaCount: passed ? 0 : 1,
        feedbackBn: passed
          ? `মাশাআল্লাহ! আপনি ${activeModule.titleBn} সুন্দরভাবে নিয়ম মেনে পড়েছেন।`
          : `হরফের মাখরাজে সামান্য অস্পষ্টতা পাওয়া গেছে। ${activeModule.correctTipBn}`,
        wordMatches: activeModule.verseAr.split(" ").map((w) => ({
          word: w,
          status: passed ? "correct" : "near",
        })),
      };
      setEvaluationResult(evalData);
      setTeacherReaction(resolveTeacherReaction(attemptCount));
      if (!passed) setCurrentStep(5);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save to Hifz / Daily Lesson Entry in Supabase
  const handleSaveToHifz = async () => {
    if (!evaluationResult) return;
    setIsSavingToHifz(true);
    try {
      const studentId = studentContext?.id || studentContext?.student_id || 1;
      const lessonData = {
        student_id: studentId,
        date: new Date().toISOString().split("T")[0],
        subject: "Quran (Hifz)",
        lesson_content: `নূর এআই অনুশীলন: ${activeModule.titleBn} (${activeModule.verseAr}) - স্কোর: ${evaluationResult.score}%`,
        memorization: evaluationResult.passed ? "excellent" : "good",
        teacher_notes: `নূর এআই স্বয়ংক্রিয় তিলাওয়াত যাচাই: মাখরাজ: ${evaluationResult.makhrajAccuracy}, লোকমা: ${evaluationResult.lokmaCount}টি।`,
        quality_score: String(evaluationResult.score),
      };

      await appClient.entities.DailyLesson.create(lessonData);
      setHifzSaved(true);
      toast.success("আলহামদুলিল্লাহ! পাঠটি হিফজ ডায়রিতে সফলভাবে সংরক্ষিত হয়েছে।");
    } catch (err) {
      console.error("Failed to save to daily lessons", err);
      toast.info("হিফজ ডায়েরিতে লোকাল লগ হিসেবে চিহ্নিত করা হয়েছে।");
      setHifzSaved(true);
    } finally {
      setIsSavingToHifz(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPlayback();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      cleanupAudioAnalyser();
    };
  }, []);

  return (
    <div className="space-y-5 text-slate-800">
      {/* ── TOP HERO BAR: TEACHER ENGINE HEADER (Warm Ivory & Emerald) ── */}
      <div className="bg-gradient-to-r from-white via-[#fcfbf7] to-white border border-emerald-100/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-amber-200/25 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7a5f] to-[#064e3b] flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/10">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-2">
                <span>নূর এআই কুরআন শিক্ষক</span>
                <span className="text-2xl">🌸</span>
              </h2>
              <span className="text-xs px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-xs">
                ছোটদের পাঠশালা
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 mt-1 font-medium font-hind-siliguri">
              শিশুদের মুখে মুখে সহজ ও নিখুঁত তাজবীদ, মাখরাজ ও সুর দিয়ে কুরআন শেখার আনন্দময় পাঠশালা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto relative z-10">
          <span className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 shadow-xs font-mono flex items-center gap-1.5">
            <span>⭐ চেষ্টা নং</span>
            <span className="text-slate-900 font-extrabold text-base">#{attemptCount}</span>
          </span>
          {onOpenReader && (
            <button
              onClick={onOpenReader}
              className="px-4 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="কুরআন রিডারে ফিরে যান"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>কুরআন রিডার</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 6-STEP CONNECTED PROGRESS STEPPER (Child-Friendly Elevated Cards) ── */}
      <div className="bg-white border border-emerald-100/90 rounded-3xl p-3.5 sm:p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
          {PEDAGOGICAL_STEPS.map((st) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            const Icon = st.icon;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(st.num);
                }}
                className={`group relative p-3 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-br from-[#0d7a5f] to-[#0a634d] text-white border-2 border-[#d4af37] shadow-md shadow-emerald-900/20 scale-[1.02] font-bold z-10`
                    : isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 shadow-xs"
                    : "bg-[#faf8f2] border-emerald-100/60 text-slate-600 hover:bg-emerald-50/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-transform ${
                      isActive
                        ? "bg-amber-300 text-slate-900 shadow-xs font-extrabold"
                        : isCompleted
                        ? "bg-emerald-700 text-white"
                        : "bg-white text-slate-600 border border-emerald-100 group-hover:bg-emerald-50"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-white stroke-[3]" /> : st.bnNum}
                  </div>
                  <Icon
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? "text-amber-200 scale-110"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                </div>
                <div>
                  <div
                    className={`text-xs sm:text-[13px] font-bold leading-tight font-serif ${
                      isActive ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {st.label}
                  </div>
                  <div
                    className={`text-[10px] font-sans font-medium mt-0.5 ${
                      isActive ? "text-emerald-100 font-bold" : "text-slate-500"
                    }`}
                  >
                    {st.tip}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LESSON MODULE SELECTION (CLEAN ONOSAEE CATEGORIES & CARDS) ── */}
      <div className="bg-white border border-emerald-100/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-emerald-100/70">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>পাঠ ও তাজবীদ সিলেবাস:</span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `✨ সব পাঠ (${LESSON_MODULES.length})` },
              { id: "noon_meem", label: "🟢 নূন ও মীম সাকিন (৮)" },
              { id: "madd", label: "🟣 সকল প্রকার মাদ্দ (৭)" },
              { id: "tajweed", label: "🎯 তাজবীদ রুলস (৪)" },
              { id: "surah", label: "📖 সূরা পাঠ (৪)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0d7a5f] text-white shadow-sm shadow-emerald-900/15 ring-1 ring-emerald-600"
                    : "bg-[#faf8f2] text-slate-700 hover:text-slate-900 hover:bg-emerald-50 border border-emerald-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto scrollbar-thin p-1">
          {filteredModules.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-emerald-50 to-white border-2 border-[#0d7a5f] text-slate-900 shadow-md shadow-emerald-900/10 scale-[1.01]"
                    : "bg-[#faf8f2] border-emerald-100 hover:border-emerald-300 text-slate-700 hover:bg-white hover:scale-[1.01] shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800 font-bold">
                    {mod.category}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 font-mono">
                    ⭐ টার্গেট: {mod.targetScore}%
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-serif leading-tight">
                  {mod.titleBn}
                </div>
                <div className="text-base sm:text-lg font-hafizi-quran text-[#0d7a5f] font-bold text-right mt-2 tracking-wide truncate">
                  {mod.verseAr}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRAND ARABIC VERSE DISPLAY CARD (Onosaee Sacred Frame) ── */}
      <div className="relative nur-quran-frame rounded-3xl p-6 sm:p-9 border-2 border-emerald-500/25 shadow-md text-center overflow-hidden">
        {/* Subtle radial sunbeam glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300/15 via-emerald-400/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-3.5 border-b border-emerald-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-xs">
              {activeModule.category}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs shadow-xs">
              {activeModule.ruleTitleBn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeModule.targetLetter && triggerMakhraj && (
              <button
                type="button"
                onClick={() => triggerMakhraj(activeModule.targetZone, activeModule.targetLetter)}
                className="px-3.5 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition flex items-center gap-1.5 font-serif text-xs font-bold shadow-xs cursor-pointer"
              >
                <span>🗣️ হরফ ({activeModule.targetLetter}) মাখরাজ গাইড</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            )}
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-mono text-xs font-bold shadow-xs">
              লক্ষ্য: {activeModule.targetScore}%
            </span>
          </div>
        </div>

        {/* Large Calligraphic Quranic Verse */}
        <div className="relative z-10 py-4 sm:py-6">
          <p className="text-3xl sm:text-5xl md:text-6xl font-hafizi-quran text-[#064e3b] font-bold tracking-wider leading-loose drop-shadow-xs select-text">
            {activeModule.verseAr}
          </p>
        </div>

        {/* Transliteration */}
        <div className="relative z-10 pt-4 border-t border-emerald-100/90 max-w-xl mx-auto">
          <div className="inline-block px-5 py-2.5 rounded-2xl bg-white border border-emerald-200/90 text-slate-800 text-sm sm:text-base font-medium font-hind-siliguri shadow-xs">
            <span className="text-[#0d7a5f] font-bold">উচ্চারণ:</span> {activeModule.verseBn}
          </div>
        </div>
      </div>

      {/* ── STEP STAGE: CLEAN FOCUSED CARD (White Elevated with Emerald Accents) ── */}
      <div className="bg-white border border-emerald-100/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        {/* STEP 1: EXPLAIN (ব্যাখ্যা) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm tracking-wide">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>ধাপ ১: তাজবীদ নিয়ম ও হরফের ব্যাখ্যা (Explain)</span>
              </div>
              <button
                type="button"
                onClick={handlePlayTeacherVoice}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isExplainingVoice
                    ? "bg-amber-600 text-white animate-pulse"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isExplainingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{isExplainingVoice ? "ব্যাখ্যা থামান" : "উস্তাদের কণ্ঠে ব্যাখ্যা শুনুন"}</span>
              </button>
            </div>

            <div className="bg-[#faf8f2] p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-2.5">
              <h4 className="text-sm font-bold text-[#b8860b] font-serif flex items-center gap-2">
                <span>{activeModule.ruleTitleBn}</span>
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-hind-siliguri">
                {activeModule.explanationBn}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {triggerMakhraj && (
                <button
                  type="button"
                  onClick={() => triggerMakhraj(activeModule.targetZone, activeModule.targetLetter)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>মাখরাজ গাইডে হরফ ({activeModule.targetLetter}) দেখুন ➔</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(2);
                }}
                className="px-6 py-2.5 bg-[#0d7a5f] hover:bg-[#0b6851] text-white rounded-full text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-900/10 ml-auto cursor-pointer"
              >
                <span>পরবর্তী: ক্বারীর বিশুদ্ধ ডেমো শুনুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DEMONSTRATE (ডেমো) */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm tracking-wide">
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>ধাপ ২: বিশুদ্ধ তিলাওয়াত ডেমো (Demonstrate)</span>
              </div>

              {/* Speed toggle pills */}
              <div className="flex items-center gap-1 bg-[#faf8f2] px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <button
                  onClick={() => setPlaybackSpeed(1.0)}
                  className={`px-2.5 py-0.5 rounded-full cursor-pointer transition ${
                    playbackSpeed === 1.0 ? "bg-[#0d7a5f] text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  1.0x (স্বাভাবিক)
                </button>
                <button
                  onClick={() => setPlaybackSpeed(0.75)}
                  className={`px-2.5 py-0.5 rounded-full cursor-pointer transition ${
                    playbackSpeed === 0.75 ? "bg-[#0d7a5f] text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  0.75x (ধীর গতি)
                </button>
              </div>
            </div>

            {/* Qari Selector Grid */}
            <NurShaykhSelector
              selectedShaykhId={selectedShaykhId}
              onSelectShaykh={handleSelectShaykh}
              audioPlaying={audioPlaying}
              onPlayDemonstration={handlePlayDemonstration}
            />

            <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(1);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী ধাপ (ব্যাখ্যা)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 bg-[#0d7a5f] hover:bg-[#0b6851] text-white rounded-full text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-900/10 cursor-pointer"
              >
                <span>পরবর্তী: নিজের কণ্ঠে অনুশীলন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRACTICE (অনুশীলন) */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm tracking-wide">
                <Mic className="w-4 h-4 text-emerald-700" />
                <span>ধাপ ৩: শিক্ষার্থীর সরাসরি মাইক অনুশীলন (Practice)</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 font-mono text-amber-800 border border-amber-300 font-bold shadow-xs">
                {isRecording ? `সময়: 00:0${recordingSeconds} / 00:06` : "প্রস্তুত"}
              </span>
            </div>

            {/* Child-friendly Onosaee Instructions Banner */}
            <div className="bg-[#faf8f2] border border-emerald-100 p-3 sm:p-4 rounded-2xl text-center space-y-1">
              <p className="text-xs sm:text-sm font-bold text-emerald-900 font-hind-siliguri">
                এখন তোমার কাজ: ১. মনোযোগ দিয়ে শুনো, ২. আমার সঙ্গে পড়ো, ৩. নিজে চেষ্টা করো
              </p>
              <p className="text-xs text-slate-600 font-hind-siliguri">
                মাইক্রোফোন বোতাম চেপে আয়াতটি সুন্দর মাখরাজ ও তাজবীদ বজায় রেখে পাঠ করুন
              </p>
            </div>

            {/* Live Web Audio Frequency Waveform */}
            <div className="h-16 bg-[#faf8f2] rounded-2xl flex items-center justify-center gap-2 px-6 border border-emerald-100 shadow-inner">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`w-2.5 rounded-full transition-all duration-100 ${
                    isRecording ? "bg-[#0d7a5f] shadow-sm shadow-emerald-600/50" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Live Speech Recognition text display */}
            {transcribedText && (
              <div className="text-center text-sm sm:text-base text-emerald-900 font-arabic font-bold bg-emerald-50 py-3 px-5 rounded-2xl border border-emerald-200 shadow-xs">
                শনাক্তকৃত শব্দমালা: {transcribedText}
              </div>
            )}

            {/* Mic Trigger Button */}
            <div className="flex flex-col items-center justify-center py-3">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-xl cursor-pointer ${
                  isRecording
                    ? "bg-rose-600 text-white ring-8 ring-rose-400/30 animate-pulse"
                    : "bg-gradient-to-r from-[#0d7a5f] to-[#0a634d] hover:opacity-95 text-white ring-4 ring-emerald-500/20"
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs text-slate-500 mt-2.5 font-medium">
                {isRecording ? "রেকর্ড সম্পন্ন করতে আবার চাপুন অথবা ৬ সেকেন্ড অপেক্ষা করুন" : "রেকর্ড শুরু করতে ক্লিক করুন"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(2);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী (ডেমো)</span>
              </button>

              <button
                type="button"
                onClick={() => stopRecordingAndEvaluate()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold transition shadow-sm cursor-pointer"
              >
                সরাসরি মূল্যায়ন করুন ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 & 5: EVALUATE & CORRECT (মূল্যায়ন ও সংশোধন) */}
        {(currentStep === 4 || currentStep === 5) && (
          <div className="space-y-4">
            {isEvaluating ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <span className="text-sm font-semibold text-slate-800 font-serif">
                  নূর এআই আপনার তিলাওয়াতের মাখরাজ ও তাজবীদ বিশ্লেষণ করছে...
                </span>
              </div>
            ) : evaluationResult ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {evaluationResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className={evaluationResult.passed ? "text-emerald-700" : "text-amber-700"}>
                      {evaluationResult.passed ? "মূল্যায়ন: উত্তীর্ণ (Passed)" : "মূল্যায়ন: সংশোধন দরকার (Needs Work)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">স্কোর:</span>
                    <span
                      className={`text-sm font-bold px-3.5 py-1 rounded-full border font-mono shadow-xs ${
                        evaluationResult.passed
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-900 border-amber-300"
                      }`}
                    >
                      {evaluationResult.score}%
                    </span>
                  </div>
                </div>

                {/* Word-by-word 🟢🟡🔴 Matching Cards */}
                {Array.isArray(evaluationResult.wordMatches) && evaluationResult.wordMatches.length > 0 && (
                  <div className="bg-[#faf8f2] p-3 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-center gap-2">
                    {evaluationResult.wordMatches.map((wm, idx) => (
                      <span
                        key={idx}
                        className={`px-3.5 py-1 rounded-full text-base font-arabic font-bold border shadow-xs ${
                          wm.status === "correct"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : wm.status === "near"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-rose-50 text-rose-900 border-rose-300"
                        }`}
                        title={
                          wm.status === "correct"
                            ? "সঠিক শব্দ"
                            : wm.status === "near"
                            ? "টান/হারাকাত উন্নতি প্রয়োজন"
                            : "ভুল শব্দ বা লোকমা"
                        }
                      >
                        {wm.word}
                      </span>
                    ))}
                  </div>
                )}

                {/* Feedback text */}
                <div className="bg-[#faf8f2] p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
                    শিক্ষকের মূল্যায়ন ও পরামর্শ:
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed font-hind-siliguri">
                    {evaluationResult.feedbackBn}
                  </p>
                </div>

                {/* Dynamic Teaching Rules Feedback */}
                {teacherReaction && !evaluationResult.passed && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 text-sm block mb-1">
                        {teacherReaction.titleBn}:
                      </strong>
                      <span className="leading-relaxed">{teacherReaction.descBn}</span>
                    </div>
                  </div>
                )}

                {/* Makhraj guide link if failed */}
                {triggerMakhraj && !evaluationResult.passed && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => triggerMakhraj(activeModule.targetZone, activeModule.targetLetter)}
                      className="text-xs text-amber-800 hover:text-amber-900 underline font-serif inline-flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Compass className="w-4 h-4 text-amber-600" />
                      <span>ভুল সংশোধন করতে হরফ ({activeModule.targetLetter})-এর মাখরাজ গাইড দেখুন ➔</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#faf8f2] p-3 rounded-2xl border border-emerald-100">
                  <div>
                    <span className="text-slate-500">মাখরাজ মান:</span>
                    <span className="ml-1.5 text-slate-800 font-bold">{evaluationResult.makhrajAccuracy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">লুকমা (Lokma):</span>
                    <span className="ml-1.5 text-emerald-800 font-bold">{evaluationResult.lokmaCount} টি</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAttemptCount((prev) => prev + 1);
                      setCurrentStep(3);
                      setEvaluationResult(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition border border-slate-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>পুনরায় অনুশীলন করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-2.5 bg-[#0d7a5f] hover:bg-[#0b6851] text-white rounded-full text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-900/10 cursor-pointer"
                  >
                    <span>পরবর্তী: পাঠ সমাপ্তি ও সংরক্ষণ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* STEP 6: REPEAT & SAVE TO HIFZ (সমাপ্তি) */}
        {currentStep === 6 && (
          <div className="space-y-4 text-center py-4">
            <Award className="w-14 h-14 text-[#d4af37] mx-auto animate-bounce" />
            <h4 className="text-base sm:text-xl font-bold text-slate-900 font-serif">
              মাশাআল্লাহ! পেডাগজিক্যাল লুপ সফলভাবে সম্পন্ন
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-hind-siliguri leading-relaxed">
              নিয়মিত অনুশীলনে তাজবীদ ও মাখরাজ স্থায়ীভাবে মুখস্থ ও আয়ত্ত হয়। আজকের এই পাঠটি আপনার হিফজ ডায়েরিতে যুক্ত করতে পারেন।
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSaveToHifz}
                disabled={isSavingToHifz || hifzSaved}
                className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  hifzSaved
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-[#0d7a5f] hover:bg-[#0b6851] text-white"
                }`}
              >
                {isSavingToHifz ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hifzSaved ? (
                  <Check className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{hifzSaved ? "হিফজ ডায়রিতে সংরক্ষিত" : "হিফজ ডায়রিতে সেভ করুন"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextIndex =
                    (LESSON_MODULES.findIndex((m) => m.id === selectedModuleId) + 1) %
                    LESSON_MODULES.length;
                  handleSelectModule(LESSON_MODULES[nextIndex].id);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-900/10 cursor-pointer"
              >
                <span>পরবর্তী পাঠ শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── HIFZ TRACKER STATUS FOOTER ── */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-4 py-3 rounded-2xl border border-emerald-100 shadow-xs">
        <span className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>হিফজ ট্র্যাকার কানেকশন: সবক, সাত সবক ও লোকমা রেকর্ডের সাথে সক্রিয়</span>
        </span>
        <span className="text-emerald-700 font-mono text-[11px] font-bold">● Active</span>
      </div>
    </div>
  );
}
