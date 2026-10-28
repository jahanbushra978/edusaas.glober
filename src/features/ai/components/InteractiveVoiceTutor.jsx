"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  BookOpen,
  Play,
  Square,
  Loader2,
  Settings,
  ShieldCheck,
  Send,
  User,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { NurClient } from "@/lib/ai/nur-client";
import {
  VoiceAgentEngine,
  getOptimalAudioConstraints,
  VOICE_PERSONAS,
  EMOTIONS,
} from "@/lib/ai/voice-agent-engine";
import VoiceAgentSettingsModal from "./VoiceAgentSettingsModal";
import LiveVoiceQuranClass from "./LiveVoiceQuranClass";

const STORAGE_VOICE_CONFIG_KEY = "rahmania_voice_agent_config_v1";

const DEFAULT_CONFIG = {
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
  className = "",
}) {
  // Tutor Submode: 'qa_dialogue' (সরাসরি কথা বলুন ও শিখুন) | 'live_class' (সরাসরি মুখে মুখে কুরআন মাশক)
  const [tutorMode, setTutorMode] = useState("qa_dialogue");
  // Voice states: 'idle' | 'listening' | 'analyzing' | 'speaking'
  const [voiceState, setVoiceState] = useState("idle");
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState(DEFAULT_CONFIG);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState(null);

  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! আমি আপনার সার্বক্ষণিক এআই কুরআন উস্তাদ নূর।\n\nপবিত্র কুরআনের বিশুদ্ধ তিলাওয়াত, ১৭টি মাখরাজ, তাজবীদের যে কোনো নিয়ম (ইখফা, ক্বলক্বলাহ, গুন্নাহ, মদ) বা হিফজ নিয়ে যে কোনো প্রশ্ন সরাসরি মুখে বলুন অথবা নিচে লিখে পাঠান। আমি সরাসরি বাংলা কণ্ঠে বুঝিয়ে দেব।",
      timestamp: "এখন",
    },
  ]);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Audio & Speech References
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioDemoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const engineRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  const [audioBars, setAudioBars] = useState([20, 30, 45, 60, 40, 50, 30, 20]);

  // Auto-scroll chat to bottom when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, voiceState]);

  // Load saved voice settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOICE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setVoiceConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // Sync VoiceAgentEngine instance
  useEffect(() => {
    engineRef.current = new VoiceAgentEngine({
      ...voiceConfig,
      onStateChange: (state) => {
        if (state === "speaking") {
          setVoiceState("speaking");
          isSpeakingRef.current = true;
        } else if (state === "idle") {
          isSpeakingRef.current = false;
          setCurrentlySpeakingIdx(null);
          setVoiceState((curr) => (curr === "speaking" ? "idle" : curr));
        }
      },
    });
  }, [voiceConfig]);

  const handleSaveConfig = (newConfig) => {
    setVoiceConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_VOICE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch {}
  };

  // Sensitivity thresholds for Barge-In Voice Activity Detection
  const getVadThreshold = useCallback(() => {
    switch (voiceConfig.bargeInSensitivity) {
      case "high":
        return 0.025;
      case "low":
        return 0.08;
      case "medium":
      default:
        return 0.045;
    }
  }, [voiceConfig.bargeInSensitivity]);

  // Start Audio Visualizer & Real-Time Barge-In VAD
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const constraints = getOptimalAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;

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
      const timeDomainArray = new Float32Array(analyser.fftSize);

      const update = () => {
        if (!analyserRef.current) return;

        // 1. Frequency visualization
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = [];
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i] || 20;
          bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setAudioBars(bars);

        // 2. Real-Time Barge-In Detection (RMS calculation)
        if (voiceConfig.bargeInEnabled && isSpeakingRef.current) {
          analyserRef.current.getFloatTimeDomainData(timeDomainArray);
          let sumSquares = 0;
          for (let i = 0; i < timeDomainArray.length; i++) {
            sumSquares += timeDomainArray[i] * timeDomainArray[i];
          }
          const rms = Math.sqrt(sumSquares / timeDomainArray.length);
          const threshold = getVadThreshold();

          if (rms > threshold) {
            handleBargeInInterruption();
          }
        }

        animFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch {
      // Graceful fallback for environments without microphone access
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    setAudioBars([20, 20, 20, 20, 20, 20, 20, 20]);
  };

  // Immediate Barge-in execution
  const handleBargeInInterruption = () => {
    if (engineRef.current) {
      engineRef.current.interrupt();
    }
    isSpeakingRef.current = false;
    setCurrentlySpeakingIdx(null);
    setIsInterrupted(true);
    setVoiceState("listening");
    toast.info("কথার মাঝখানে থামানো হয়েছে — আপনার কথা শুনছি...");
    setTimeout(() => setIsInterrupted(false), 2000);
  };

  // Toggle Live Speech Recognition
  const handleToggleListening = () => {
    if (voiceState === "speaking") {
      handleBargeInInterruption();
      return;
    }

    if (voiceState === "listening") {
      stopListeningAndAnalyze();
    } else {
      startListening();
    }
  };

  // Reset silence timer on speech
  const resetSilenceTimer = (textToSubmit) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
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
            } else if (e.error === "no-speech") {
              // Wait or gentle reset
            } else {
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
        toast.info("আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থন নেই, নিচে টাইপ করে প্রশ্ন করুন।");
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
      } catch {}
    }

    const queryText = (explicitText || spokenTranscript).trim();
    setSpokenTranscript("");

    if (!queryText) {
      setVoiceState("idle");
      toast.info("কোনো কথা শোনা যায়নি। মাইক চেপে স্পষ্ট করে বলুন অথবা নিচে লিখে পাঠান।");
      return;
    }

    await submitVoiceQuery(queryText);
  };

  // Submit query (from voice, text input, or quick chips)
  const submitVoiceQuery = async (queryText) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    setVoiceState("analyzing");
    setTextInput("");

    // Add user message to history
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

        // Speak aloud using VoiceAgentEngine
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
      // Deterministic Tajweed rule fallback based on query keywords
      let fallbackText =
        "আপনার প্রশ্নটি তাজবীদ ও মাখরাজ শিক্ষার জন্য অত্যন্ত মূল্যবান। শান্তভাবে বিশুদ্ধ উচ্চারণে তিলাওয়াত অনুশীলন করুন।";
      let makhrajHighlight = null;
      let demonstrationAudioUrl = null;

      const lower = cleanQuery.toLowerCase();
      if (lower.includes("ইখফা") || lower.includes("ikhfa")) {
        fallbackText =
          "ইখফা (إخفاء) অর্থ গোপন করা। নূন সাকিন (نْ) বা তানভীন (দুই যবর, দুই যের, দুই পেশ)-এর পর ইখফার ১৫টি হরফের (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك) যেকোনো একটি হরফ আসলে নূনের আওয়াজকে নাকের বাঁশিতে গোপন করে পূর্ণ ২ হরকত পরিমাণ গুন্নাহর সাথে পড়তে হয়। যেমন: مِنْ شَرِّ।";
        makhrajHighlight = "Al-Khayshum";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/113002.mp3";
      } else if (lower.includes("ক্বলক্বলাহ") || lower.includes("কলকলা")) {
        fallbackText =
          "ক্বলক্বলাহ (قلقلة) অর্থ প্রতিধ্বনি বা কম্পন সৃষ্টি করা। ক্বলক্বলাহর হরফ ৫টি: ক্বাফ, তোয়া, বা, জীম, দাল (قطب جد)। এই হরফগুলোতে যখন সাকিন বা জযম থাকে তখন মাখরাজে ধাক্কা লেগে সুন্দর প্রতিধ্বনি সৃষ্টি হয়। যেমন: قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ এর শেষ ক্বাফ।";
        makhrajHighlight = "Al-Lisan";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/113001.mp3";
      } else if (lower.includes("মদ") || lower.includes("মদ্দে")) {
        fallbackText =
          "মদ্দের হরফ ৩টি: খালি আলিফ, ওয়াও সাকিন এবং ইয়া সাকিন। মদ্দে আসলী বা স্বাভাবিক মদ্দে ২ হরকত টানতে হয়। তবে হামযাহ বা সাকিনের কারণে মদ্দে মুত্তাসিল বা মুনফাসিলে ৪-৫ হরকত এবং মদ্দে লাযিমে পূর্ণ ৬ হরকত পরিমাণ টানতে হয়।";
        makhrajHighlight = "Al-Jawf";
        demonstrationAudioUrl =
          "https://everyayah.com/data/Alafasy_128kbps/001007.mp3";
      } else if (lower.includes("গুন্নাহ")) {
        fallbackText =
          "গুন্নাহ হলো নাকের বাঁশি (আল-খাইশূম) থেকে উৎপন্ন সুরযুক্ত মিষ্টি ধ্বনি। তাশদীদযুক্ত নূন (نّ) ও তাশদীদযুক্ত মীম (مّ)-এ সর্বদা ওয়াজিব গুন্নাহ করতে হয় এবং এর স্থায়িত্বকাল পূর্ণ ২ হরকত।";
        makhrajHighlight = "Al-Khayshum";
      } else if (lower.includes("আইন") || lower.includes("ع")) {
        fallbackText =
          "আইন (ع) হরফের মাখরাজ হলো কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)। গলার মাঝখান সংকুচিত করে গভীর পরিষ্কার শব্দে আদায় করতে হয়।";
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
      if (engineRef.current) engineRef.current.interrupt();
      setCurrentlySpeakingIdx(null);
      setVoiceState("idle");
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

  const playDemoAudio = (url) => {
    if (!url) return;
    if (isPlayingDemo) {
      if (audioDemoRef.current) audioDemoRef.current.pause();
      setIsPlayingDemo(false);
      return;
    }

    const audio = new Audio(url);
    audioDemoRef.current = audio;
    setIsPlayingDemo(true);
    audio.onended = () => setIsPlayingDemo(false);
    audio.onerror = () => setIsPlayingDemo(false);
    audio.play().catch(() => setIsPlayingDemo(false));
  };

  const handleClearConversation = () => {
    if (engineRef.current) engineRef.current.interrupt();
    setConversationHistory([
      {
        role: "assistant",
        text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! আমি আপনার সার্বক্ষণিক এআই কুরআন উস্তাদ নূর।\n\nপবিত্র কুরআনের বিশুদ্ধ তিলাওয়াত, ১৭টি মাখরাজ, তাজবীদের যে কোনো নিয়ম (ইখফা, ক্বলক্বলাহ, গুন্নাহ, মদ) বা হিফজ নিয়ে যে কোনো প্রশ্ন সরাসরি মুখে বলুন অথবা নিচে লিখে পাঠান। আমি সরাসরি বাংলা কণ্ঠে বুঝিয়ে দেব।",
        timestamp: "এখন",
      },
    ]);
    setVoiceState("idle");
    setCurrentlySpeakingIdx(null);
    toast.success("কথোপকথন নতুন করে শুরু করা হয়েছে।");
  };

  // Clean up
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (engineRef.current) {
        engineRef.current.interrupt();
      }
    };
  }, []);

  const activePersona =
    VOICE_PERSONAS[voiceConfig.gender]?.find(
      (p) => p.id === voiceConfig.personaId
    ) || VOICE_PERSONAS.male[0];
  const activeEmotionObj =
    EMOTIONS.find((e) => e.id === voiceConfig.emotion) || EMOTIONS[1];

  return (
    <div
      className={`nur-theme flex flex-col h-full bg-white border border-emerald-100/90 rounded-3xl p-3 sm:p-5 text-slate-800 shadow-xl shadow-emerald-950/5 font-hind-siliguri ${className}`}
    >
      {/* ── TOP HEADER: USTADH IDENTITY & STATUS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3.5 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center text-[#0d7a5f] shadow-xs">
              <Bot className="w-6 h-6 text-[#0d7a5f]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="কথা বলতে প্রস্তুত">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>{activePersona.nameBn}</span>
                <span className="text-[11px] text-[#0d7a5f] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {voiceConfig.gender === "male" ? "পুরুষ উস্তাদ" : "নারী শিক্ষিকা"}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              নূর এআই সার্বক্ষণিক কুরআন মেন্টর • <span className="text-[#0d7a5f] font-bold">প্রাকৃতিক মানুষের কণ্ঠ (২৪ kHz HD)</span>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                মুড: {activeEmotionObj.labelBn}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3 text-[#0d7a5f]" />
                লাইভ ইন্টারাপশন সক্রিয়
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Reset & Settings */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {tutorMode === "qa_dialogue" && (
            <button
              onClick={handleClearConversation}
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="নতুন কথোপকথন শুরু করুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
              <span>নতুন আলোচনা</span>
            </button>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="ভয়েস, গতি ও পিচ সেটিংস"
          >
            <Settings className="w-4 h-4 text-[#0d7a5f]" />
            <span className="hidden sm:inline">ভয়েস সেটিংস</span>
          </button>
        </div>
      </div>

      {/* ── DUAL SUBMODE SELECTOR: HIGH CLARITY 2-CARD DECK ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl mb-4 shadow-inner">
        <button
          type="button"
          onClick={() => {
            if (engineRef.current) engineRef.current.interrupt();
            setTutorMode("qa_dialogue");
          }}
          className={`p-3 rounded-xl transition-all duration-200 text-left border cursor-pointer flex items-center justify-between gap-3 ${
            tutorMode === "qa_dialogue"
              ? "bg-white border-2 border-[#0d7a5f] shadow-md text-slate-900"
              : "bg-white/60 hover:bg-white border-transparent text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              tutorMode === "qa_dialogue"
                ? "bg-emerald-100 text-[#0d7a5f]"
                : "bg-slate-100 text-slate-500"
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-extrabold ${tutorMode === "qa_dialogue" ? "text-slate-900" : "text-slate-700"}`}>
                উস্তাদের সাথে প্রশ্নোত্তর (Voice Q&A)
              </h4>
              <p className={`text-[11px] leading-snug mt-0.5 ${tutorMode === "qa_dialogue" ? "text-[#0d7a5f]" : "text-slate-500"}`}>
                মাখরাজ, তাজবীদ বা হিফজ নিয়ে মুখে মুখে প্রশ্ন করুন
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
            tutorMode === "qa_dialogue"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}>
            ভয়েস ও চ্যাট
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (engineRef.current) engineRef.current.interrupt();
            setTutorMode("live_class");
          }}
          className={`p-3 rounded-xl transition-all duration-200 text-left border cursor-pointer flex items-center justify-between gap-3 ${
            tutorMode === "live_class"
              ? "bg-white border-2 border-[#0d7a5f] shadow-md text-slate-900"
              : "bg-white/60 hover:bg-white border-transparent text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              tutorMode === "live_class"
                ? "bg-teal-100 text-teal-800"
                : "bg-slate-100 text-slate-500"
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-extrabold ${tutorMode === "live_class" ? "text-slate-900" : "text-slate-700"}`}>
                লাইভ কুরআন মাশক (Recitation Mashq)
              </h4>
              <p className={`text-[11px] leading-snug mt-0.5 ${tutorMode === "live_class" ? "text-[#0d7a5f]" : "text-slate-500"}`}>
                উস্তাদের সামনে আয়াত পাঠ করুন, এআই ভুল ধরিয়ে দেবে
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
            tutorMode === "live_class"
              ? "bg-teal-100 text-teal-800 border-teal-300"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}>
            মুখোমুখি ক্লাস
          </span>
        </button>
      </div>

      {/* ── 1. SUBMODE: DIRECT VOICE CONVERSATION & ISLAMIC GUIDANCE ── */}
      {tutorMode === "qa_dialogue" ? (
        <div className="flex flex-col flex-1 min-h-0 space-y-3">
          {/* ── CENTRAL INTERACTIVE CALL ORB & STATUS HUB ── */}
          <div className="bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            {/* Left/Center: Voice Orb Button */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  voiceState === "listening"
                    ? "bg-rose-500 text-white shadow-xl shadow-rose-500/40 ring-4 ring-rose-200 animate-pulse scale-105"
                    : voiceState === "speaking"
                    ? "bg-teal-600 text-white hover:bg-rose-600 ring-4 ring-teal-200 shadow-xl shadow-teal-600/30"
                    : "bg-gradient-to-br from-[#0d7a5f] to-[#085a45] hover:from-[#0b664f] hover:to-[#064e3b] text-white shadow-lg shadow-emerald-900/20 ring-4 ring-emerald-100 active:scale-95"
                }`}
                title={
                  voiceState === "listening"
                    ? "শুনছি... থামাতে বা সাবমিট করতে ক্লিক করুন"
                    : voiceState === "speaking"
                    ? "উস্তাদের কথা থামাতে ক্লিক করুন"
                    : "মাইকে সরাসরি কথা বলুন"
                }
              >
                {voiceState === "listening" ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : voiceState === "speaking" ? (
                  <Volume2 className="w-7 h-7 text-white animate-pulse" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
                {/* Ping wave effect when active */}
                {voiceState === "listening" && (
                  <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-75 pointer-events-none" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      voiceState === "listening"
                        ? "bg-rose-500 animate-ping"
                        : voiceState === "speaking"
                        ? "bg-teal-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {voiceState === "listening"
                      ? "🔴 আপনার কথা শুনছি..."
                      : voiceState === "speaking"
                      ? "🔊 উস্তাদজি উত্তর দিচ্ছেন..."
                      : voiceState === "analyzing"
                      ? "⏳ উত্তর তৈরি হচ্ছে..."
                      : "🎙️ মাইকে সরাসরি কথা বলুন"}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                  {voiceState === "listening"
                    ? spokenTranscript || "আপনার প্রশ্ন বা তিলাওয়াত বলুন (বলা শেষ হলে উস্তাদজি স্বয়ংক্রিয় উত্তর দেবেন)"
                    : voiceState === "speaking"
                    ? "উস্তাদজি বাংলা কণ্ঠে বলছেন — কথার মাঝখানে থামাতে মাইক চাপুন বা কথা বলুন।"
                    : "যেকোনো হরফ, মাখরাজ, তাজবীদ নিয়ম বা কুরআন নিয়ে প্রশ্ন মুখে বলুন অথবা নিচের ঘরে লিখুন।"}
                </p>
              </div>
            </div>

            {/* Right: Audio Waveform Frequency Visualizer */}
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full border border-emerald-200/80 shadow-xs">
              <span className="text-[10px] text-[#0d7a5f] font-bold mr-1 uppercase tracking-wider">
                তরঙ্গ:
              </span>
              <div className="flex items-end gap-1 h-6">
                {audioBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      voiceState === "listening"
                        ? "bg-rose-500"
                        : voiceState === "speaking"
                        ? "bg-teal-500"
                        : "bg-emerald-500/70"
                    }`}
                    style={{ height: `${Math.max(15, height)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── CONVERSATION MESSAGE LIST ── */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin min-h-[300px] max-h-[460px] bg-emerald-50/30 p-3 sm:p-4 rounded-2xl border border-emerald-100">
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#0d7a5f] to-[#085a45] text-white rounded-br-xs shadow-sm"
                      : "bg-white border border-emerald-200/80 text-slate-800 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 opacity-80 text-[11px] font-medium border-b border-black/5 pb-1">
                    <span className="flex items-center gap-1.5">
                      {msg.role === "user" ? (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-200" />
                          <span className="font-bold">আপনি</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-[#0d7a5f]" />
                          <span className="font-bold text-[#0d7a5f]">{activePersona.nameBn}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line font-normal leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Actions inside assistant message */}
                  {msg.role === "assistant" && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSpeakSingleMessage(msg.text, idx)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          currentlySpeakingIdx === idx
                            ? "bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-400"
                            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                        }`}
                        title="উস্তাদের প্রাকৃতিক কণ্ঠে শুনুন"
                      >
                        {currentlySpeakingIdx === idx ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span>কথা থামান</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#0d7a5f]" />
                            <span>উস্তাদের কণ্ঠে শুনুন</span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full font-bold">HD</span>
                          </>
                        )}
                      </button>

                      {msg.demonstrationAudioUrl && (
                        <button
                          onClick={() => playDemoAudio(msg.demonstrationAudioUrl)}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#0d7a5f] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          {isPlayingDemo ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-[#0d7a5f]" />
                              <span>ডেমো থামান</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-[#0d7a5f]" />
                              <span>বিশুদ্ধ ক্বারী তিলাওয়াত ডেমো</span>
                            </>
                          )}
                        </button>
                      )}

                      {msg.makhrajHighlight && onMakhrajHighlight && (
                        <button
                          onClick={() =>
                            onMakhrajHighlight(msg.makhrajHighlight.toLowerCase())
                          }
                          className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#0d7a5f]" />
                          <span>মাখরাজ মানচিত্রে দেখুন</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Analyzing State Indicator */}
            {voiceState === "analyzing" && (
              <div className="flex items-start">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs sm:text-sm text-amber-900 flex items-center gap-2.5 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>উস্তাদজি উত্তর প্রস্তুত করছেন...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── QUICK QUESTIONS STARTER CHIPS ── */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-3 shadow-xs">
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#0d7a5f]" />
                <span>সরাসরি প্রশ্ন করতে ক্লিক করুন (এক ক্লিকেই উত্তর ও কণ্ঠস্বর):</span>
              </span>
              <span className="text-[#0d7a5f] text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold">বাংলা অডিও উত্তর</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "আসসালামু আলাইকুম, আপনি কে?",
                "মাখরাজ কাকে বলে এবং মোট কতটি?",
                "ইখফা করার সঠিক নিয়ম কী?",
                "ক্বলক্বলাহর হরফ ও নিয়ম বুঝিয়ে দিন",
                "মদ্দে আসলী কত হরকত টানতে হয়?",
                "ওয়াজিব গুন্নাহর সময়কাল কত হরকত?",
                "আইন (ع) হরফের মাখরাজ কোথায়?",
                "সূরা ফাতিহা তিলাওয়াতের বিশুদ্ধ নিয়ম",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => submitVoiceQuery(q)}
                  className="px-3 py-1.5 rounded-full text-xs bg-emerald-50/60 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-medium transition-all text-left cursor-pointer shadow-xs active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* ── UNIFIED STICKY INPUT CONTROLLER ── */}
          <div className="bg-white border border-emerald-200 rounded-full p-2 flex items-center gap-2 shadow-md">
            <button
              onClick={handleToggleListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer ${
                voiceState === "listening"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-2 ring-rose-300"
                  : voiceState === "speaking"
                  ? "bg-teal-600 text-white hover:bg-rose-600 ring-2 ring-teal-300"
                  : "bg-[#0d7a5f] hover:bg-[#0b664f] text-white shadow-md shadow-emerald-900/20 active:scale-95"
              }`}
              title={
                voiceState === "listening"
                  ? "শুনছি... থামাতে বা সাবমিট করতে ক্লিক করুন"
                  : voiceState === "speaking"
                  ? "উস্তাদের কথা থামাতে ক্লিক করুন"
                  : "মাইক্রোফোনে কথা বলুন"
              }
            >
              {voiceState === "listening" ? (
                <MicOff className="w-5 h-5" />
              ) : voiceState === "speaking" ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5" />
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
              placeholder="এখানে প্রশ্ন লিখুন বা সরাসরি মাইকে কথা বলুন..."
              className="flex-1 bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            <button
              onClick={() => submitVoiceQuery(textInput)}
              disabled={!textInput.trim() || voiceState === "analyzing"}
              className="px-5 h-10 rounded-full bg-[#0d7a5f] hover:bg-[#0b664f] disabled:opacity-40 disabled:hover:bg-[#0d7a5f] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all flex-shrink-0 shadow-sm cursor-pointer"
              title="প্রশ্ন পাঠান"
            >
              {voiceState === "analyzing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">পাঠান</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ── 2. SUBMODE: LIVE VOICE QURAN RECITATION MASHQ & GRADING ── */
        <LiveVoiceQuranClass
          isFullPage={true}
          onMakhrajHighlight={onMakhrajHighlight}
          className="flex-1"
        />
      )}

      {/* Voice Agent Settings Modal */}
      <VoiceAgentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={voiceConfig}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
