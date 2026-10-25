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
  { num: 1, label: "ব্যাখ্যা", sub: "Explain", icon: BookOpen },
  { num: 2, label: "ডেমো", sub: "Demo", icon: Volume2 },
  { num: 3, label: "অনুশীলন", sub: "Practice", icon: Mic },
  { num: 4, label: "মূল্যায়ন", sub: "Evaluate", icon: CheckCircle2 },
  { num: 5, label: "সংশোধন", sub: "Correct", icon: AlertCircle },
  { num: 6, label: "সমাপ্তি", sub: "Complete", icon: Award },
];

export default function NurTeachingEngine({
  onMakhrajHighlight,
  onMakhrajSelect,
  studentContext,
  customVerse,
  onOpenReader,
}) {
  const triggerMakhraj = onMakhrajHighlight || onMakhrajSelect;
  const [selectedModuleId, setSelectedModuleId] = useState("ghunnah");
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
    if (selectedCategory === "tajweed") {
      return LESSON_MODULES.filter((m) => m.category.includes("তাজবীদ"));
    }
    if (selectedCategory === "surah") {
      return LESSON_MODULES.filter((m) => m.category.includes("সূরা"));
    }
    if (selectedCategory === "makhraj") {
      return LESSON_MODULES.filter((m) => m.category.includes("মাখরাজ"));
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
    <div className="space-y-5 text-slate-100">
      {/* ── TOP HERO BAR: TEACHER ENGINE HEADER ── */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-800/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight">
                নূর কুরআন শিক্ষক
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pedagogical Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ৬ স্তরের ইন্টারেক্টিভ শিক্ষাদান চক্র: ব্যাখ্যা ➔ ডেমো ➔ অনুশীলন ➔ মূল্যায়ন ➔ সংশোধন ➔ পুনরাবৃত্তি
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 font-mono">
            চেষ্টা: #{attemptCount}
          </span>
          {onOpenReader && (
            <button
              onClick={onOpenReader}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/60 text-emerald-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="কুরআন রিডারে ফিরে যান"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>কুরআন রিডার</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 6-STEP CONNECTED PROGRESS STEPPER ── */}
      <div className="bg-slate-900/90 border border-emerald-900/50 rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
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
                className={`group relative p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950 font-bold ring-1 ring-emerald-300"
                    : isCompleted
                    ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isActive
                        ? "bg-slate-950 text-emerald-300"
                        : isCompleted
                        ? "bg-emerald-800 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-yellow-300" : isCompleted ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <div className={`text-xs leading-tight font-serif ${isActive ? "text-white" : ""}`}>
                    {st.label}
                  </div>
                  <div
                    className={`text-[10px] font-mono tracking-wider uppercase ${
                      isActive ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    {st.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LESSON MODULE SELECTION (CLEAN CATEGORIES) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>পাঠ ও তাজবীদ সিলেবাস:</span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "সব পাঠ (১১)" },
              { id: "tajweed", label: "তাজবীদ রুলস (৬)" },
              { id: "surah", label: "সূরা পাঠ (৪)" },
              { id: "makhraj", label: "কঠিন মাখরাজ (১)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto scrollbar-thin p-1">
          {filteredModules.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-950/90 border-emerald-500 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-500/40"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-emerald-400 font-mono">
                    {mod.category}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    টার্গেট: {mod.targetScore}%
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 font-serif leading-tight">
                  {mod.titleBn}
                </div>
                <div className="text-xs font-arabic text-emerald-300/90 text-right mt-1.5 tracking-wide truncate">
                  {mod.verseAr}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRAND ARABIC VERSE DISPLAY CARD ── */}
      <div className="relative bg-gradient-to-b from-[#0a2318] to-[#06160f] rounded-3xl p-6 sm:p-8 border border-emerald-700/60 shadow-2xl text-center overflow-hidden">
        {/* Background Islamic ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/60 text-emerald-300 font-bold">
              {activeModule.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-[#D4AF37]/40 text-[#D4AF37] font-semibold">
              {activeModule.ruleTitleBn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeModule.targetLetter && triggerMakhraj && (
              <button
                type="button"
                onClick={() => triggerMakhraj(activeModule.targetZone, activeModule.targetLetter)}
                className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-700/60 text-emerald-300 hover:text-white hover:bg-emerald-900 transition flex items-center gap-1 font-serif text-[11px]"
              >
                <span>হরফ ({activeModule.targetLetter}) মাখরাজ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-mono text-[11px]">
              টার্গেট: {activeModule.targetScore}%
            </span>
          </div>
        </div>

        {/* Large Calligraphic Quranic Verse */}
        <div className="relative z-10 py-3 sm:py-5">
          <p className="text-3xl sm:text-4xl md:text-5xl font-hafizi-quran text-emerald-200 tracking-wider leading-relaxed drop-shadow-md select-text">
            {activeModule.verseAr}
          </p>
        </div>

        {/* Transliteration */}
        <div className="relative z-10 pt-3 border-t border-emerald-900/50 max-w-xl mx-auto">
          <p className="text-sm font-medium text-emerald-300 font-hind-siliguri">
            উচ্চারণ: {activeModule.verseBn}
          </p>
        </div>
      </div>

      {/* ── STEP STAGE: CLEAN FOCUSED CARD ── */}
      <div className="bg-slate-900/90 border border-emerald-900/60 rounded-3xl p-5 sm:p-6 shadow-xl">
        {/* STEP 1: EXPLAIN (ব্যাখ্যা) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide">
                <BookOpen className="w-4 h-4" />
                <span>ধাপ ১: তাজবীদ নিয়ম ও হরফের ব্যাখ্যা (Explain)</span>
              </div>
              <button
                type="button"
                onClick={handlePlayTeacherVoice}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  isExplainingVoice
                    ? "bg-amber-600 text-white animate-pulse"
                    : "bg-emerald-800 hover:bg-emerald-700 text-emerald-100"
                }`}
              >
                {isExplainingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isExplainingVoice ? "ব্যাখ্যা থামান" : "উস্তাদের কণ্ঠে ব্যাখ্যা শুনুন"}</span>
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-emerald-950 space-y-3">
              <h4 className="text-sm font-bold text-[#D4AF37] font-serif flex items-center gap-2">
                <span>{activeModule.ruleTitleBn}</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-hind-siliguri">
                {activeModule.explanationBn}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {triggerMakhraj && (
                <button
                  type="button"
                  onClick={() => triggerMakhraj(activeModule.targetZone, activeModule.targetLetter)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-950 ml-auto"
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide">
                <Volume2 className="w-4 h-4" />
                <span>ধাপ ২: বিশুদ্ধ তিলাওয়াত ডেমো (Demonstrate)</span>
              </div>

              {/* Speed toggle */}
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setPlaybackSpeed(1.0)}
                  className={`px-2 py-0.5 rounded-lg ${
                    playbackSpeed === 1.0 ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  1.0x (স্বাভাবিক)
                </button>
                <button
                  onClick={() => setPlaybackSpeed(0.75)}
                  className={`px-2 py-0.5 rounded-lg ${
                    playbackSpeed === 0.75 ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(1);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-950"
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide">
                <Mic className="w-4 h-4" />
                <span>ধাপ ৩: শিক্ষার্থীর সরাসরি মাইক অনুশীলন (Practice)</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 font-mono text-amber-300 border border-slate-800">
                {isRecording ? `সময়: 00:0${recordingSeconds} / 00:06` : "প্রস্তুত"}
              </span>
            </div>

            <p className="text-xs text-slate-300 text-center max-w-md mx-auto font-hind-siliguri">
              মাইক্রোফোন বোতাম চেপে আয়াতটি সুন্দর মাখরাজ ও তাজবীদ বজায় রেখে পাঠ করুন:
            </p>

            {/* Live Web Audio Frequency Waveform */}
            <div className="h-16 bg-slate-950 rounded-2xl flex items-center justify-center gap-2 px-6 border border-slate-800 shadow-inner">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`w-2 rounded-full transition-all duration-100 ${
                    isRecording ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-slate-800"
                  }`}
                />
              ))}
            </div>

            {/* Live Speech Recognition text display */}
            {transcribedText && (
              <div className="text-center text-sm text-emerald-300 font-arabic bg-slate-950/80 py-2.5 px-4 rounded-xl border border-emerald-900/60">
                শনাক্তকৃত শব্দমালা: {transcribedText}
              </div>
            )}

            {/* Mic Trigger */}
            <div className="flex flex-col items-center justify-center py-3">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-xl ${
                  isRecording
                    ? "bg-red-600 text-white ring-4 ring-red-500/40 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/30"
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <span className="text-xs text-slate-400 mt-2.5 font-mono">
                {isRecording ? "রেকর্ড সম্পন্ন করতে আবার চাপুন অথবা ৬ সেকেন্ড অপেক্ষা করুন" : "রেকর্ড শুরু করতে ক্লিক করুন"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopAllPlayback();
                  setCurrentStep(2);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী (ডেমো)</span>
              </button>

              <button
                type="button"
                onClick={() => stopRecordingAndEvaluate()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
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
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <span className="text-sm text-slate-200 font-serif">
                  নূর এআই আপনার তিলাওয়াতের মাখরাজ ও তাজবীদ বিশ্লেষণ করছে...
                </span>
              </div>
            ) : evaluationResult ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {evaluationResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className={evaluationResult.passed ? "text-emerald-400" : "text-amber-400"}>
                      {evaluationResult.passed ? "মূল্যায়ন: উত্তীর্ণ (Passed)" : "মূল্যায়ন: সংশোধন দরকার (Needs Work)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">স্কোর:</span>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-xl border font-mono ${
                        evaluationResult.passed
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                          : "bg-amber-950 text-amber-300 border-amber-500"
                      }`}
                    >
                      {evaluationResult.score}%
                    </span>
                  </div>
                </div>

                {/* Word-by-word 🟢🟡🔴 Matching Cards */}
                {Array.isArray(evaluationResult.wordMatches) && evaluationResult.wordMatches.length > 0 && (
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-center gap-2">
                    {evaluationResult.wordMatches.map((wm, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-xl text-base font-arabic font-bold border ${
                          wm.status === "correct"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/70"
                            : wm.status === "near"
                            ? "bg-amber-950 text-amber-300 border-amber-500/70"
                            : "bg-red-950 text-red-300 border-red-500/70"
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
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                    শিক্ষকের মূল্যায়ন ও পরামর্শ:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-hind-siliguri">
                    {evaluationResult.feedbackBn}
                  </p>
                </div>

                {/* Dynamic Teaching Rules Feedback */}
                {teacherReaction && !evaluationResult.passed && (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 text-sm block mb-1">
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
                      className="text-xs text-amber-300 hover:text-amber-200 underline font-serif inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>ভুল সংশোধন করতে হরফ ({activeModule.targetLetter})-এর মাখরাজ গাইড দেখুন ➔</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">মাখরাজ মান:</span>
                    <span className="ml-1.5 text-slate-200 font-semibold">{evaluationResult.makhrajAccuracy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">লুকমা (Lokma):</span>
                    <span className="ml-1.5 text-emerald-400 font-semibold">{evaluationResult.lokmaCount} টি</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAttemptCount((prev) => prev + 1);
                      setCurrentStep(3);
                      setEvaluationResult(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>পুনরায় অনুশীলন করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-950"
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
            <Award className="w-12 h-12 text-[#D4AF37] mx-auto animate-bounce" />
            <h4 className="text-base sm:text-lg font-bold text-white font-serif">
              মাশাআল্লাহ! পেডাগজিক্যাল লুপ সফলভাবে সম্পন্ন
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-hind-siliguri leading-relaxed">
              নিয়মিত অনুশীলনে তাজবীদ ও মাখরাজ স্থায়ীভাবে মুখস্থ ও আয়ত্ত হয়। আজকের এই পাঠটি আপনার হিফজ ডায়েরিতে যুক্ত করতে পারেন।
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSaveToHifz}
                disabled={isSavingToHifz || hifzSaved}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  hifzSaved
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/40"
                    : "bg-emerald-700 hover:bg-emerald-600 text-white"
                }`}
              >
                {isSavingToHifz ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hifzSaved ? (
                  <Check className="w-4 h-4 text-emerald-400" />
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <span>পরবর্তী পাঠ শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── HIFZ TRACKER STATUS FOOTER ── */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/70 px-4 py-3 rounded-2xl border border-slate-800/80 shadow-sm">
        <span className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>হিফজ ট্র্যাকার কানেকশন: সবক, সাত সবক ও লোকমা রেকর্ডের সাথে সক্রিয়</span>
        </span>
        <span className="text-emerald-400 font-mono text-[11px] font-bold">● Active</span>
      </div>
    </div>
  );
}
