"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  Bot,
  Square,
  Loader2,
  Settings,
  Send,
  RotateCcw,
  Key,
  Compass,
  BookOpen,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { NurClient } from "@/lib/ai/nur-client";
import {
  VoiceAgentEngine,
  VOICE_PERSONAS,
} from "@/lib/ai/voice-agent-engine";
import VoiceAgentSettingsModal from "./VoiceAgentSettingsModal";
import AISettingsModal from "./AISettingsModal";
import { universalAudioEngine } from "@/lib/quran/audio";
import {
  getSavedAIConfig,
  saveAIConfigToStorage,
} from "../lib/aiConfigHelper";

const STORAGE_VOICE_CONFIG_KEY = "rahmania_voice_agent_config_v1";

const DEFAULT_VOICE_CONFIG = {
  gender: "male",
  personaId: "male_scholarly",
  emotion: "encouraging",
  language: "bn-BD",
  baseSpeed: 1.0,
  basePitch: 1.0,
  bargeInEnabled: true,
  bargeInSensitivity: "medium",
  backchannelsEnabled: true,
};

export default function InteractiveVoiceTutor({
  onMakhrajHighlight,
  onClose,
  className = "",
}) {
  // Tutor Submode: 'qa_dialogue' (উস্তাদের সাথে প্রশ্নোত্তর) | 'live_class' (লাইভ কুরআন মাশক)
  const [tutorMode, setTutorMode] = useState("qa_dialogue");
  // Voice states: 'idle' | 'listening' | 'analyzing' | 'speaking'
  const [voiceState, setVoiceState] = useState("idle");
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState(DEFAULT_VOICE_CONFIG);
  const [aiConfig, setAiConfig] = useState(getSavedAIConfig);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState(null);

  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      text: "আসসালামু আলাইকুম! পবিত্র কুরআন তিলাওয়াত, ১৭টি মাখরাজ বা তাজবীদের যেকোনো নিয়ম সম্পর্কে প্রশ্ন সরাসরি মুখে বলুন বা নিচে লিখুন।",
      timestamp: "এখন",
    },
  ]);

  // Audio & Speech References
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const engineRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  const [audioBars, setAudioBars] = useState([20, 30, 45, 60, 40, 50, 30, 20]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, voiceState]);

  // Load saved voice settings and listen for AI config updates
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOICE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setVoiceConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch { }

    const handleAIConfigUpdated = () => {
      setAiConfig(getSavedAIConfig());
    };
    window.addEventListener("rahmania-ai-settings-updated", handleAIConfigUpdated);
    return () => {
      window.removeEventListener("rahmania-ai-settings-updated", handleAIConfigUpdated);
    };
  }, []);

  // Initialize VoiceAgentEngine
  useEffect(() => {
    engineRef.current = new VoiceAgentEngine(voiceConfig);
    return () => {
      if (engineRef.current) engineRef.current.interrupt();
    };
  }, [voiceConfig]);

  // Audio Visualizer
  const startAudioVisualizer = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      if (audioContextRef.current.state === "suspended") audioContextRef.current.resume();

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 32;
      }

      const updateBars = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = [];
        for (let i = 0; i < 8; i++) {
          const val = data[i * 2] || 0;
          bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setAudioBars(bars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      animFrameRef.current = requestAnimationFrame(updateBars);
    } catch { }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioBars([20, 20, 20, 20, 20, 20, 20, 20]);
  };

  // Immediate Stop / Silence Audio
  const handleStopAllAudio = useCallback(() => {
    universalAudioEngine.stopAll();
    if (engineRef.current) {
      engineRef.current.interrupt();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
    }
    stopAudioVisualizer();
    isSpeakingRef.current = false;
    setCurrentlySpeakingIdx(null);
    setVoiceState("idle");
    setSpokenTranscript("");
  }, []);

  // Toggle Mic Mute
  const handleToggleMicMute = () => {
    if (!isMicMuted) {
      // Mute the mic
      setIsMicMuted(true);
      if (voiceState === "listening") {
        handleStopAllAudio();
      }
      toast.info("মাইক্রোফোন বন্ধ করা হয়েছে (Muted)");
    } else {
      // Unmute the mic
      setIsMicMuted(false);
      toast.success("মাইক্রোফোন সচল করা হয়েছে");
    }
  };

  // Toggle Speech Recognition
  const handleToggleListening = () => {
    if (voiceState === "speaking") {
      handleStopAllAudio();
      return;
    }

    if (voiceState === "listening") {
      if (spokenTranscript && spokenTranscript.trim().length > 1) {
        stopListeningAndAnalyze();
      } else {
        handleStopAllAudio();
        toast.info("মাইক্রোফোন বন্ধ করা হয়েছে");
      }
      return;
    }

    if (isMicMuted) {
      setIsMicMuted(false);
      toast.success("মাইক চালু করে কথা শুনছি...");
    }

    startListening();
  };

  const resetSilenceTimer = (textToSubmit) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (textToSubmit && textToSubmit.trim().length > 1) {
        stopListeningAndAnalyze(textToSubmit);
      }
    }, 1800);
  };

  const startListening = () => {
    setVoiceState("listening");
    setSpokenTranscript("");
    startAudioVisualizer();

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = voiceConfig.language || "bn-BD";
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (event) => {
            let text = "";
            let isFinal = false;
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript + " ";
              if (event.results[i].isFinal) isFinal = true;
            }
            const cleanText = text.trim();
            setSpokenTranscript(cleanText);

            if (isFinal && cleanText.length > 2) {
              stopListeningAndAnalyze(cleanText);
            } else {
              resetSilenceTimer(cleanText);
            }
          };

          rec.onerror = (e) => {
            console.warn("Speech recognition error:", e.error);
            if (e.error === "not-allowed" || e.error === "service-not-allowed") {
              toast.error("মাইক্রোফোন অনুমতি পাওয়া যায়নি। নিচে লিখে প্রশ্ন করুন।");
              setVoiceState("idle");
              stopAudioVisualizer();
              textInputRef.current?.focus();
            } else if (e.error !== "no-speech") {
              setVoiceState("idle");
              stopAudioVisualizer();
            }
          };

          rec.onend = () => {
            if (voiceState === "listening" && !spokenTranscript.trim()) {
              setVoiceState("idle");
              stopAudioVisualizer();
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch {
          toast.info("ভয়েস ইনপুট প্রস্তুত, প্রশ্ন বলুন বা নিচে লিখুন...");
        }
      } else {
        toast.info("ব্রাউজারে স্পিচ রিকগনিশন সমর্থন নেই, নিচে টাইপ করে প্রশ্ন করুন।");
        setVoiceState("idle");
        textInputRef.current?.focus();
      }
    }
  };

  const stopListeningAndAnalyze = async (explicitText) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    stopAudioVisualizer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
    }

    const queryText = (explicitText || spokenTranscript).trim();
    setSpokenTranscript("");

    if (!queryText) {
      setVoiceState("idle");
      return;
    }

    await submitVoiceQuery(queryText);
  };

  const submitVoiceQuery = async (queryText) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    setVoiceState("analyzing");
    setTextInput("");

    const userMsg = { role: "user", text: cleanQuery, timestamp: "এখন" };
    setConversationHistory((prev) => [...prev, userMsg]);

    try {
      const response = await NurClient.sendVoiceQuery({
        transcript: cleanQuery,
        history: conversationHistory.slice(-4),
        voiceConfig,
      });

      if (response && response.ok && response.answerText) {
        const answerText = response.answerText;
        const newMsgIdx = conversationHistory.length + 1;
        const aiMsg = {
          role: "assistant",
          text: answerText,
          makhrajHighlight: response.makhrajHighlight,
          demonstrationAudioUrl: response.demonstrationAudioUrl,
          timestamp: "এখন",
        };
        setConversationHistory((prev) => [...prev, aiMsg]);
        setVoiceState("speaking");
        setCurrentlySpeakingIdx(newMsgIdx);

        if (engineRef.current) {
          engineRef.current.speak(answerText, {
            onStart: () => {
              isSpeakingRef.current = true;
              startAudioVisualizer();
            },
            onEnd: () => {
              isSpeakingRef.current = false;
              setVoiceState("idle");
              setCurrentlySpeakingIdx(null);
              stopAudioVisualizer();
            },
            onError: () => {
              isSpeakingRef.current = false;
              setVoiceState("idle");
              setCurrentlySpeakingIdx(null);
              stopAudioVisualizer();
            },
          });
        }
      } else {
        throw new Error(response?.error || "Failed to get teacher response");
      }
    } catch {
      // Deterministic Tajweed rule fallback
      let fallbackText =
        "আপনার প্রশ্নটি তাজবীদ ও মাখরাজ শিক্ষার জন্য অত্যন্ত মূল্যবান। শান্তভাবে বিশুদ্ধ উচ্চারণে তিলাওয়াত অনুশীলন করুন।";
      let makhrajHighlight = null;
      let demonstrationAudioUrl = null;

      const lower = cleanQuery.toLowerCase();
      if (lower.includes("ইখফা") || lower.includes("ikhfa")) {
        fallbackText =
          "ইখফা (إخفاء) অর্থ গোপন করা। নূন সাকিন (نْ) বা তানভীন-এর পর ইখফার ১৫টি হরফের (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك) যেকোনো একটি হরফ আসলে নূনের আওয়াজকে নাকের বাঁশিতে গোপন করে পূর্ণ ১ আলিফ গুন্নাহর সাথে পড়তে হয়। যেমন: مِنْ شَرِّ।";
        makhrajHighlight = "Al-Khayshum";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/113002.mp3";
      } else if (lower.includes("ক্বলক্বলাহ") || lower.includes("কলকলা")) {
        fallbackText =
          "ক্বলক্বলাহ (قلقلة) অর্থ প্রতিধ্বনি সৃষ্টি করা। ক্বলক্বলাহর হরফ ৫টি: ক্বাফ, ত্বো, বা, জীম, দাল (قطب جد)। এই হরফগুলোতে জযম হলে মাখরাজে ধাক্কা লেগে স্পষ্ট প্রতিধ্বনি তৈরি হয়।";
        makhrajHighlight = "Al-Lisan";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/113001.mp3";
      } else if (lower.includes("মদ") || lower.includes("মদ্দে")) {
        fallbackText =
          "মদ্দের হরফ ৩টি: খালি আলিফ, ওয়াও সাকিন এবং ইয়া সাকিন। স্বাভাবিক মাদ্দে ১ আলিফ (২ হরকত) টানতে হয়।";
        makhrajHighlight = "Al-Jawf";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/001007.mp3";
      } else if (lower.includes("গুন্নাহ")) {
        fallbackText =
          "গুন্নাহ হলো নাকের বাঁশি (আল-খাইশূম) থেকে উৎপন্ন সুরযুক্ত ধ্বনি। তাশদীদযুক্ত নূন (نّ) ও তাশদীদযুক্ত মীম (مّ)-এ ওয়াজিব গুন্নাহ করা আবশ্যক।";
        makhrajHighlight = "Al-Khayshum";
      } else if (lower.includes("আইন") || lower.includes("ع")) {
        fallbackText =
          "আইন (ع) হরফের মাখরাজ হলো কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)। গলার মাঝখান সংকুচিত করে পরিষ্কার শব্দে আদায় করতে হয়।";
        makhrajHighlight = "Al-Halq";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/001005.mp3";
      }

      const fallbackMsg = {
        role: "assistant",
        text: fallbackText,
        makhrajHighlight,
        demonstrationAudioUrl,
        timestamp: "এখন",
      };
      setConversationHistory((prev) => [...prev, fallbackMsg]);
      setVoiceState("speaking");

      if (engineRef.current) {
        engineRef.current.speak(fallbackText, {
          onEnd: () => {
            isSpeakingRef.current = false;
            setVoiceState("idle");
            stopAudioVisualizer();
          },
        });
      }
    }
  };

  const handleSpeakSingleMessage = (text, idx) => {
    if (currentlySpeakingIdx === idx) {
      handleStopAllAudio();
      return;
    }

    setCurrentlySpeakingIdx(idx);
    setVoiceState("speaking");
    if (engineRef.current) {
      engineRef.current.speak(text, {
        onEnd: () => {
          setCurrentlySpeakingIdx(null);
          setVoiceState("idle");
        },
        onError: () => {
          setCurrentlySpeakingIdx(null);
          setVoiceState("idle");
        },
      });
    }
  };

  const handleClearConversation = () => {
    handleStopAllAudio();
    setConversationHistory([
      {
        role: "assistant",
        text: "আসসালামু আলাইকুম! পবিত্র কুরআন তিলাওয়াত, ১৭টি মাখরাজ বা তাজবীদের যেকোনো নিয়ম সম্পর্কে প্রশ্ন মুখে বলুন বা নিচে লিখুন।",
        timestamp: "এখন",
      },
    ]);
    toast.success("কথোপকথন নতুন করে শুরু করা হয়েছে");
  };

  const handleSaveVoiceConfig = (updated) => {
    setVoiceConfig(updated);
    try {
      localStorage.setItem(STORAGE_VOICE_CONFIG_KEY, JSON.stringify(updated));
    } catch { }
  };

  const handleSaveAIConfig = (newConfig) => {
    saveAIConfigToStorage(newConfig);
    setAiConfig(newConfig);
    setIsAISettingsOpen(false);
    toast.success("মাশাআল্লাহ! এআই সেটিংস ও API Key সংরক্ষিত হয়েছে");
  };

  const activePersona =
    VOICE_PERSONAS[voiceConfig.gender]?.find(
      (p) => p.id === voiceConfig.personaId
    ) || VOICE_PERSONAS.male[0];

  return (
    <div
      className={`flex flex-col h-full bg-[#FCFDFD] dark:bg-[#07150E] text-slate-800 dark:text-slate-100 rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-emerald-900/60 shadow-lg overflow-hidden ${className}`}
    >
              {/* ── 1. CLEAN NATIVE APP HEADER (সাদামাটা, সুন্দর ও মার্জিত) ── */}
              <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-stone-200/80 dark:border-emerald-950/80 bg-white/95 dark:bg-[#071912]/95 flex items-center justify-between gap-2 shrink-0">
                {/* Left: Back Link & Persona Identity */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Link
                    href="/quran-tutor"
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0"
                    title="এআই হোম পেজে ফিরে যান"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                    <span className="text-[11px] font-bold hidden xs:inline">এআই হোম</span>
                  </Link>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950 border border-emerald-300/80 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-200 shadow-2xs">
                        <Bot className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${voiceState === "listening"
                            ? "bg-rose-500 animate-ping"
                            : voiceState === "speaking"
                              ? "bg-amber-400 animate-pulse"
                              : isMicMuted
                                ? "bg-slate-400"
                                : "bg-emerald-500"
                          }`}
                        title={isMicMuted ? "মাইক বন্ধ" : "অনলাইন"}
                      />
                    </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                            {activePersona.nameBn}
                          </h3>
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0">
                            {voiceConfig.gender === "male" ? "উস্তাদ" : "উস্তাজা"}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          {isMicMuted ? "মাইক বন্ধ 🔇" : "অনলাইন • কথা বলতে প্রস্তুত"}
                        </p>
                      </div>
                    </div>
                  </div>

                    {/* Right: Prominent API Key, Mic Mute Toggle, Settings & Close */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {/* 🔑 API Key Button (Ultra-Clear & Obvious) */}
                      <button
                        type="button"
                        onClick={() => setIsAISettingsOpen(true)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${aiConfig?.apiKey
                              ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                              : "bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 border-amber-400 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/50 animate-pulse font-extrabold"
                          }`}
                        title="এআই প্রোভাইডার ও নিজস্ব API Key সেটিংস (ফ্রি Google Gemini Key)"
                      >
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[11px] font-bold">
                            {aiConfig?.apiKey ? "কী সক্রিয় ✅" : "🔑 API Key দিন"}
                          </span>
                      </button>

                      {/* 🎙️ Mic Mute/Unmute Toggle Button (Easy One-Tap Mic Control) */}
                      <button
                        type="button"
                        onClick={handleToggleMicMute}
                        className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          isMicMuted
                            ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                            : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        }`}
                        title={isMicMuted ? "মাইক্রোফোন চালু করুন" : "মাইক্রোফোন বন্ধ করুন (Mute)"}
                      >
            {isMicMuted ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">মাইক বন্ধ</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">মাইক সচল</span>
              </>
            )}
          </button>

          {/* Reset Chat */}
          <button
            type="button"
            onClick={handleClearConversation}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
            title="নতুন করে কথোপকথন শুরু করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Voice Settings */}
          <button
            type="button"
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
            title="ভয়েস ও উচ্চারণ সেটিংস"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Exit / Close button if onClose is provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="চ্যাট বন্ধ করে স্টুডিও কার্ডে ফিরুন"
            >
              <X className="w-4 h-4" />
              <span className="hidden md:inline">বন্ধ</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. SUBTLE NAVIGATION BAR (Dedicated Clean Switcher) ── */}
      <div className="px-3.5 sm:px-5 pt-2 pb-1.5 flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-black/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">সক্রিয়:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <Bot className="w-3 h-3 text-emerald-600" />
            <span>উস্তাদ প্রশ্ন-উত্তর</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/quran-tutor/live-class"
            onClick={() => handleStopAllAudio()}
            className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-stone-200 dark:border-stone-800"
            title="লাইভ কুরআন মাশক আলাদা পেজে খুলুন"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>লাইভ কুরআন মাশক (আলাদা পেজ ➔)</span>
          </a>
        </div>
      </div>

      {/* ── 3. CONTENT AREA ── */}
      <div className="flex flex-col flex-1 min-h-0 p-3 sm:p-4 space-y-2">
        {/* Active Listening Alert with Immediate Stop Button (Ensures user can turn off mic instantly) */}
        {voiceState === "listening" ? (
          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-between gap-2 shadow-xs animate-pulse shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 truncate">
                {spokenTranscript ? `শুনছি: "${spokenTranscript}"` : "আপনার প্রশ্ন মনোযোগ দিয়ে শুনছি..."}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleStopAllAudio}
                              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                              title="মাইক্রোফোন এখনই বন্ধ করুন"
                            >
                              <Square className="w-3 h-3 fill-white" />
                              <span>মাইক বন্ধ করুন ⏹️</span>
                            </button>
                          </div>
        ) : voiceState === "speaking" ? (
                        <div className="px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-2 shadow-xs shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                              উস্তাদ উত্তর তিলাওয়াত করছেন...
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleStopAllAudio}
                            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                          >
                            <Square className="w-3 h-3 fill-white" />
                            <span>সাউন্ড থামান ⏹️</span>
                          </button>
                        </div>
        ) : null}

                          {/* Informative API Key Prompt for first-time users */}
                          {!aiConfig?.apiKey && (
                            <div className="px-3 py-1.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2 text-xs shrink-0">
                              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium min-w-0">
                                <span className="text-sm shrink-0">💡</span>
                                <span className="text-[11px] sm:text-xs truncate">
                                  সম্পূর্ণ <strong>ফ্রি Google Gemini API Key</strong> যোগ করে দ্রুত ও নির্ভুল উত্তর পান।
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsAISettingsOpen(true)}
                                className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
                              >
                                Key দিন ➔
                              </button>
                            </div>
        )}

                        {/* Chat Message Stream */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin rounded-2xl bg-stone-50/50 dark:bg-black/20 p-3 sm:p-4 border border-stone-200/60 dark:border-stone-800">
                          {conversationHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                                }`}
                            >
                              <div
                                className={`max-w-[92%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-br-xs shadow-xs"
                                    : "bg-white dark:bg-[#0B2117] border border-stone-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-100 rounded-bl-xs shadow-xs"
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-1 opacity-70 text-[10px] font-bold">
                                  <span>
                                    {msg.role === "user" ? "আপনি" : activePersona.nameBn}
                                  </span>
                                  <span>{msg.timestamp}</span>
                                </div>

                                <p className="whitespace-pre-line font-medium leading-relaxed">
                                  {msg.text}
                                </p>

                                {/* Actions inside assistant message */}
                                {msg.role === "assistant" && (
                                  <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
                                    {/* Speak / Stop Sound Button */}
                                    {(() => {
                                      const isThisSpeaking =
                                        currentlySpeakingIdx === idx ||
                                        (voiceState === "speaking" && currentlySpeakingIdx === null && idx === conversationHistory.length - 1);

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isThisSpeaking) {
                                              handleStopAllAudio();
                                            } else {
                                              handleSpeakSingleMessage(msg.text, idx);
                                            }
                                          }}
                                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${isThisSpeaking
                                              ? "bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 ring-2 ring-rose-400 animate-pulse"
                                              : "bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                                            }`}
                                          title={isThisSpeaking ? "কথা বলা বন্ধ করুন" : "উস্তাদের কণ্ঠে শুনুন"}
                                        >
                                          {isThisSpeaking ? (
                                            <>
                                              <Square className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                                              <span>সাউন্ড বন্ধ করুন ⏹️</span>
                                            </>
                                          ) : (
                                            <>
                                              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                                              <span>উস্তাদের কণ্ঠে শুনুন</span>
                                            </>
                                          )}
                                        </button>
                                      );
                                    })()}

                                    {msg.demonstrationAudioUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (currentlySpeakingIdx === `demo-${idx}`) {
                                            universalAudioEngine.stopAll();
                                            setCurrentlySpeakingIdx(null);
                                          } else {
                                            setCurrentlySpeakingIdx(`demo-${idx}`);
                                            universalAudioEngine.playWord(msg.demonstrationAudioUrl, {
                                              onEnd: () => setCurrentlySpeakingIdx(null),
                                              onError: () => setCurrentlySpeakingIdx(null),
                                            });
                                          }
                                        }}
                                        className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                      >
                                        {currentlySpeakingIdx === `demo-${idx}` ? (
                                          <>
                                            <Square className="w-3 h-3 text-rose-600 fill-rose-600" />
                                            <span>ডেমো থামান</span>
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="w-3 h-3 text-emerald-600" />
                                            <span>ক্বারী তিলাওয়াত ডেমো</span>
                                          </>
                                        )}
                                      </button>
                                    )}

                                    {msg.makhrajHighlight && onMakhrajHighlight && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onMakhrajHighlight(msg.makhrajHighlight.toLowerCase())
                                        }
                                        className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800 cursor-pointer"
                                      >
                                        মাখরাজ মানচিত্র ➔
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {voiceState === "analyzing" && (
                            <div className="flex items-start">
                              <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                <span>উত্তর তৈরি হচ্ছে...</span>
                              </div>
                            </div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>

                        {/* ── QUICK SUGGESTION CHIPS (Compact Single Row) ── */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">পরামর্শ:</span>
                          {[
                            "মাখরাজ কাকে বলে?",
                            "ইখফার সঠিক নিয়ম",
                            "ক্বলক্বলাহর হরফ কয়টি?",
                            "ওয়াজিব গুন্নাহ কী?",
                            "মদ্দে আসলী কত হরকত?",
                            "আইন (ع) হরফের মাখরাজ",
                          ].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => submitVoiceQuery(q)}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 shrink-0 cursor-pointer transition active:scale-95"
                            >
                              {q}
                            </button>
                          ))}
                        </div>

                        {/* ── STICKY INPUT BAR (APK Phone Style) ── */}
                        <div className="p-1.5 rounded-full bg-white dark:bg-[#0B2117] border border-stone-300 dark:border-emerald-900/80 shadow-md flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleListening}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
                              voiceState === "listening"
                                ? "bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse shadow-lg"
                                : voiceState === "speaking"
                                ? "bg-amber-500 hover:bg-rose-600 text-white ring-2 ring-amber-300"
                                : isMicMuted
                                ? "bg-stone-200 dark:bg-stone-800 text-stone-500"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
                            }`}
              title={
                voiceState === "listening"
                  ? "মাইক বন্ধ করতে চাপুন (থামুন)"
                  : voiceState === "speaking"
                  ? "কথা বলা বন্ধ করুন"
                  : isMicMuted
                  ? "মাইক চালু করুন"
                  : "মাইকে কথা বলুন"
              }
            >
              {voiceState === "listening" ? (
                <Square className="w-4 h-4 fill-white" />
              ) : voiceState === "speaking" ? (
                <Square className="w-4 h-4 fill-white" />
              ) : isMicMuted ? (
                <MicOff className="w-4 h-4 text-stone-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitVoiceQuery(textInput);
                }
              }}
              placeholder="প্রশ্ন লিখুন বা মাইকে কথা বলুন..."
              className="flex-1 bg-transparent border-0 px-2 py-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => submitVoiceQuery(textInput)}
              disabled={!textInput.trim() || voiceState === "analyzing"}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition active:scale-95"
              title="পাঠান"
            >
              {voiceState === "analyzing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      {/* ── 📱 NATIVE APK MOBILE BOTTOM BAR (Muslim Bangla APK Style) ── */}
      <div className="md:hidden border-t border-stone-200/90 dark:border-emerald-950/80 bg-white/95 dark:bg-[#071912]/95 px-2 py-1.5 flex items-center justify-around text-center shrink-0">
        <Link
          href="/quran-tutor"
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 py-1 px-2 rounded-xl transition"
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-bold">এআই হোম</span>
        </Link>
        <Link
          href="/quran-tutor/studio?feature=voice-tutor"
          className="flex flex-col items-center gap-0.5 text-emerald-800 dark:text-emerald-300 font-extrabold py-1 px-2 rounded-xl transition bg-emerald-50 dark:bg-emerald-950/60"
        >
          <Bot className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px]">উস্তাদ চ্যাট</span>
        </Link>
        <Link
          href="/quran-tutor/live-class"
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 py-1 px-2 rounded-xl transition"
        >
          <Mic className="w-4 h-4" />
          <span className="text-[10px] font-bold">লাইভ ক্লাস</span>
        </Link>
        <Link
          href="/quran-tutor/kids"
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 py-1 px-2 rounded-xl transition"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-bold">ছোটদের</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsAISettingsOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 py-1 px-2 rounded-xl transition cursor-pointer"
        >
          <Key className="w-4 h-4 text-amber-600" />
          <span className="text-[10px] font-bold">API Key</span>
        </button>
      </div>

      {/* Voice Settings Modal */}
      <VoiceAgentSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        config={voiceConfig}
        onSaveConfig={handleSaveVoiceConfig}
      />

      {/* 🔑 API Key & AI Provider Settings Modal */}
      <AISettingsModal
        open={isAISettingsOpen}
        onOpenChange={setIsAISettingsOpen}
        config={aiConfig}
        onSave={handleSaveAIConfig}
      />
    </div>
  );
}
