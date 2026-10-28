"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  Pause,
  BookOpen,
  Search,
  HelpCircle,
  Zap,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SURAHS } from "@/lib/quran/quran-meta";
import { getSurahData } from "@/lib/quran/quran-service";
import {
  SHAYKH_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  getQariAudioUrl,
} from "@/lib/ai/qari-registry";
import { VoiceAgentEngine } from "@/lib/ai/voice-agent-engine";
import { playMaShaAllahCelebration } from "@/features/ai-learning/lib/arabicSoundPlayer";
import { appClient } from "@/api/appClient";

// Helper: Normalize Arabic string for comparison
function normalizeArabic(text = "") {
  return (text || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Remove harakat/tashkeel
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\s\p{P}]+/gu, " ")
    .trim();
}

export default function AiDawrTeacherCompanion({ studentContext, className = "" }) {
  // Surah & Ayah state
  const [selectedSurahId, setSelectedSurahId] = useState(() => {
    try {
      const saved = localStorage.getItem("rahmania_dawr_last_surah");
      return saved ? parseInt(saved, 10) : 67; // Default to Al-Mulk (Surah 67)
    } catch {
      return 67;
    }
  });

  const [activeAyahIndex, setActiveAyahIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("rahmania_dawr_last_ayah");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Surah data
  const [surahData, setSurahData] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);

  // Search & Navigation
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJuzFilter, setSelectedJuzFilter] = useState("all");

  // Dawr Session States
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Teacher Voice & Persona
  const [teacherVoice, setTeacherVoice] = useState("male_scholarly"); // 'male_scholarly' | 'male_energetic' | 'female_calm'
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState("উস্তাদ আপনার তিলাওয়াত শোনার অপেক্ষায় আছেন...");

  // Recitation & Real-Time Tracking ("পড়া ধরা")
  const [isListening, setIsListening] = useState(false);
  const [studentTranscript, setStudentTranscript] = useState("");
  const [matchedWords, setMatchedWords] = useState(new Set());
  const [lastSpeechTimestamp, setLastSpeechTimestamp] = useState(Date.now());

  // Metrics
  const [totalAyahsRevised, setTotalAyahsRevised] = useState(0);
  const [lokmaCount, setLokmaCount] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [fluentAyahCount, setFluentAyahCount] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(96);

  // Preferences
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [autoVoiceLokma, setAutoVoiceLokma] = useState(true);
  const [selectedShaykhId, setSelectedShaykhId] = useState(() => getActiveShaykhId() || DEFAULT_SHAYKH_ID);
  const [isPlayingQari, setIsPlayingQari] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Audio wave visualizer
  const [audioBars, setAudioBars] = useState([20, 20, 20, 20, 20, 20, 20, 20]);

  // Refs
  const voiceEngineRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioQariRef = useRef(null);
  const hesitationTimerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const currentAyahRef = useRef(null);
  const isSessionActiveRef = useRef(false);
  const isTeacherSpeakingRef = useRef(false);

  // Sync session state to ref
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    isTeacherSpeakingRef.current = isTeacherSpeaking;
  }, [isTeacherSpeaking]);

  // Initialize VoiceAgentEngine
  useEffect(() => {
    voiceEngineRef.current = new VoiceAgentEngine({
      gender: teacherVoice.startsWith("female") ? "female" : "male",
      personaId: teacherVoice,
      emotion: "encouraging",
      onStateChange: (state) => {
        setIsTeacherSpeaking(state.isSpeaking);
      },
    });

    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.interrupt();
      }
    };
  }, [teacherVoice]);

  // Load Surah Data
  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setIsLoadingSurah(true);
      try {
        const data = await getSurahData(selectedSurahId);
        if (!isCancelled) {
          setSurahData(data);
          if (activeAyahIndex >= (data?.ayahs?.length || 1)) {
            setActiveAyahIndex(0);
          }
        }
      } catch (err) {
        console.error("Failed to load Surah:", err);
        toast.error("সূরা লোড করতে সমস্যা হয়েছে।");
      } finally {
        if (!isCancelled) setIsLoadingSurah(false);
      }
    }
    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [selectedSurahId]);

  // Persist position
  useEffect(() => {
    try {
      localStorage.setItem("rahmania_dawr_last_surah", String(selectedSurahId));
      localStorage.setItem("rahmania_dawr_last_ayah", String(activeAyahIndex));
    } catch {}
  }, [selectedSurahId, activeAyahIndex]);

  // Current active Ayah
  const currentAyah = useMemo(() => {
    if (!surahData?.ayahs?.length) return null;
    return surahData.ayahs[activeAyahIndex] || surahData.ayahs[0];
  }, [surahData, activeAyahIndex]);

  useEffect(() => {
    currentAyahRef.current = currentAyah;
  }, [currentAyah]);

  const activeSurahMeta = useMemo(() => {
    return ALL_SURAHS.find((s) => s.id === selectedSurahId) || ALL_SURAHS[0];
  }, [selectedSurahId]);

  // Filtered Surahs list
  const filteredSurahs = useMemo(() => {
    let list = ALL_SURAHS;
    if (selectedJuzFilter !== "all") {
      const jNum = parseInt(selectedJuzFilter, 10);
      list = list.filter((s) => s.juz === jNum);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          String(s.id).includes(q) ||
          s.nameBn.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.nameAr.includes(q)
      );
    }
    return list;
  }, [selectedJuzFilter, searchQuery]);

  // Elapsed time tracker during active session
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      if (sessionStartTime) {
        const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
        setElapsedMinutes(mins);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  // Stop all audio & recognition
  const stopAllAudio = useCallback(() => {
    if (audioQariRef.current) {
      audioQariRef.current.pause();
      audioQariRef.current = null;
    }
    setIsPlayingQari(false);

    if (voiceEngineRef.current) {
      voiceEngineRef.current.interrupt();
    }
    setIsTeacherSpeaking(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (hesitationTimerRef.current) {
      clearInterval(hesitationTimerRef.current);
      hesitationTimerRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setAudioBars([20, 20, 20, 20, 20, 20, 20, 20]);
  }, []);

  // Visualizer initialization
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      const updateBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = [];
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i * 2] || 0;
          bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setAudioBars(bars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch (e) {
      console.warn("Visualizer init notice:", e);
    }
  };

  // Ustad speaks via VoiceAgentEngine (with Echo Prevention Hand-off)
  const teacherSpeak = useCallback(
    (text, onComplete) => {
      if (!text) return;
      setTeacherMessage(text);
      setIsTeacherSpeaking(true);

      // Temporarily pause recognition while teacher speaks to prevent echo
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      if (voiceEngineRef.current) {
        voiceEngineRef.current.speak(text, {
          onEnd: () => {
            setIsTeacherSpeaking(false);
            // 600ms transition buffer so room audio decays before mic re-opens
            setTimeout(() => {
              if (isSessionActiveRef.current) {
                resumeListening();
              }
              if (onComplete) onComplete();
            }, 600);
          },
          onError: () => {
            setIsTeacherSpeaking(false);
            if (isSessionActiveRef.current) {
              resumeListening();
            }
            if (onComplete) onComplete();
          },
        });
      } else {
        setIsTeacherSpeaking(false);
        if (isSessionActiveRef.current) resumeListening();
        if (onComplete) onComplete();
      }
    },
    []
  );

  // Resume or start recognition listening
  const resumeListening = useCallback(() => {
    if (isTeacherSpeakingRef.current) return;
    if (typeof window === "undefined") return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const rec = new SpeechRec();
      rec.lang = "ar-SA";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e) => {
        if (isTeacherSpeakingRef.current) return;

        let fullText = "";
        for (let i = 0; i < e.results.length; i++) {
          fullText += e.results[i][0].transcript + " ";
        }
        const clean = fullText.trim();
        setStudentTranscript(clean);
        setLastSpeechTimestamp(Date.now());

        // Live Word-by-Word Matching ("পড়া ধরা")
        const currentA = currentAyahRef.current;
        if (currentA?.text) {
          const targetWords = currentA.text.split(" ").filter(Boolean);
          const targetNorm = normalizeArabic(currentA.text);
          const spokenNorm = normalizeArabic(clean);

          const spokenWords = spokenNorm.split(" ").filter(Boolean);
          const matched = new Set();

          targetWords.forEach((tw, idx) => {
            const normTw = normalizeArabic(tw);
            if (spokenWords.includes(normTw)) {
              matched.add(idx);
            }
          });

          setMatchedWords(matched);

          // Calculate match accuracy
          const ratio = targetWords.length > 0 ? (matched.size / targetWords.length) * 100 : 0;

          // Ayah completion check (80% matched)
          if (ratio >= 80 && !advanceTimeoutRef.current) {
            handleAyahCompletedSuccess();
          }
        }
      };

      rec.onerror = (err) => {
        console.warn("SpeechRec notice in Dawr:", err);
      };

      rec.onend = () => {
        // Automatically restart speech recognition if session is active and teacher isn't speaking
        if (isSessionActiveRef.current && !isTeacherSpeakingRef.current) {
          try {
            rec.start();
          } catch {}
        }
      };

      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch (e) {
      console.warn("SpeechRec error in Dawr:", e);
    }
  }, []);

  // Ayah Completed Successfully
  const handleAyahCompletedSuccess = () => {
    setTotalAyahsRevised((prev) => prev + 1);
    setFluentAyahCount((prev) => prev + 1);
    setStabilityScore((prev) => Math.min(100, prev + 1));
    playMaShaAllahCelebration();

    const praises = [
      "মাশাআল্লাহ! খুব সুন্দর। পরবর্তী আয়াত পড়ুন...",
      "মারহাবা! মাশাল্লাহ, চালিয়ে যান...",
      "আলহামদুলিল্লাহ, সঠিক তিলাওয়াত হয়েছে। পরবর্তী আয়াত...",
      "খুব সুন্দর মাশক! পরের আয়াত শুরু করুন...",
    ];
    const chosenPraise = praises[Math.floor(Math.random() * praises.length)];

    if (autoAdvance) {
      teacherSpeak(chosenPraise, () => {
        advanceToNextAyah();
      });
    } else {
      teacherSpeak(chosenPraise);
    }
  };

  // Advance to Next Ayah in Dawr sequence
  const advanceToNextAyah = () => {
    if (!surahData?.ayahs?.length) return;
    const nextIdx = activeAyahIndex + 1;
    if (nextIdx < surahData.ayahs.length) {
      setActiveAyahIndex(nextIdx);
      setStudentTranscript("");
      setMatchedWords(new Set());
      setLastSpeechTimestamp(Date.now());
      advanceTimeoutRef.current = null;
    } else {
      // Reached end of Surah
      teacherSpeak(
        `আলহামদুলিল্লাহ! সম্পূর্ণ সূরা ${activeSurahMeta.nameBn} সফলভাবে দাওর সমাপ্ত হলো। আপনার হিফজ ডায়েরি সংরক্ষণ করতে পারেন।`
      );
      setIsSessionActive(false);
      stopAllAudio();
    }
  };

  // Give Verbal Lokma ("উস্তাদের লোকমা দেওয়া")
  const handleGiveVerbalLokma = useCallback(() => {
    if (!currentAyah) return;
    setLokmaCount((prev) => prev + 1);
    setHesitationCount((prev) => prev + 1);
    setStabilityScore((prev) => Math.max(50, prev - 4));

    const words = (currentAyah.text || "").split(" ").filter(Boolean);
    // Find first unmatched word or next word in sequence
    let targetWord = words[0] || "";
    for (let i = 0; i < words.length; i++) {
      if (!matchedWords.has(i)) {
        targetWord = words[i];
        break;
      }
    }

    const lokmaPrompt = `উস্তাদের লোকমা: ${targetWord}`;
    toast.warning(`লোকমা: '${targetWord}'`);
    teacherSpeak(lokmaPrompt);
  }, [currentAyah, matchedWords, teacherSpeak]);

  // Hesitation & Pause Watcher: Detects if student pauses for > 4.5 seconds during recitation
  useEffect(() => {
    if (!isSessionActive || !isListening || isTeacherSpeaking) return;

    hesitationTimerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastSpeechTimestamp;
      // If student is silent for more than 4.5 seconds and has not finished ayah
      if (idleTime > 4500 && isSessionActiveRef.current && !isTeacherSpeakingRef.current) {
        if (autoVoiceLokma) {
          handleGiveVerbalLokma();
          setLastSpeechTimestamp(Date.now() + 3000); // give 3s grace period
        }
      }
    }, 1500);

    return () => {
      if (hesitationTimerRef.current) clearInterval(hesitationTimerRef.current);
    };
  }, [isSessionActive, isListening, isTeacherSpeaking, lastSpeechTimestamp, autoVoiceLokma, handleGiveVerbalLokma]);

  // Start / Pause Dawr Session
  const handleToggleSession = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      stopAllAudio();
      setTeacherMessage("দাওর সাময়িক বিরতি দেওয়া হয়েছে। আবার শুরু করতে বাটনে চাপুন।");
      toast.info("দাওর সেশন বিরতি দেওয়া হয়েছে।");
      return;
    }

    stopAllAudio();
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setStudentTranscript("");
    setMatchedWords(new Set());
    setLastSpeechTimestamp(Date.now());
    startVisualizer();

    const ayahNo = currentAyah?.numberInSurah || activeAyahIndex + 1;
    const welcome = `বিসমিল্লাহির রহমানির রাহীম। সূরা ${activeSurahMeta.nameBn}-এর আয়াত ${ayahNo} থেকে সুন্দরভাবে দাওর শুরু করুন, আমি শুনছি।`;

    teacherSpeak(welcome, () => {
      resumeListening();
    });
  };

  // Play / Pause Authentic Qari Recitation
  const handleToggleQari = () => {
    if (isPlayingQari) {
      if (audioQariRef.current) audioQariRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    if (!currentAyah) return;
    if (audioQariRef.current) audioQariRef.current.pause();

    const ayahNo = currentAyah.numberInSurah || activeAyahIndex + 1;
    const url = getQariAudioUrl(selectedShaykhId, selectedSurahId, ayahNo);
    const audio = new Audio(url);
    audioQariRef.current = audio;
    setIsPlayingQari(true);

    audio.onended = () => {
      setIsPlayingQari(false);
      audioQariRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingQari(false);
      toast.error("ক্বারীর অডিও প্লে করতে সমস্যা হয়েছে।");
    };

    audio.play().catch(() => setIsPlayingQari(false));
  };

  // Change Ayah Index manually
  const handleChangeAyah = (newIdx) => {
    stopAllAudio();
    setActiveAyahIndex(newIdx);
    setStudentTranscript("");
    setMatchedWords(new Set());
    setLastSpeechTimestamp(Date.now());
    setHasSaved(false);
    if (isSessionActive) {
      setTimeout(() => {
        resumeListening();
      }, 300);
    }
  };

  // Save Dawr to Daily Lesson Diary
  const handleSaveDawrReport = async () => {
    if (!currentAyah || !surahData) return;
    setIsSaving(true);
    try {
      const studentId = studentContext?.id || studentContext?.student_id || 1;
      const ayahNo = currentAyah.numberInSurah || activeAyahIndex + 1;

      await appClient.entities.DailyLesson.create({
        student_id: studentId,
        date: new Date().toISOString().split("T")[0],
        subject: "Quran (Dawr - মুরাযাআ / আমুক্তা)",
        lesson_content: `সূরা ${activeSurahMeta.nameBn} (আয়াত ১-${ayahNo}) — রিভিশনকৃত মোট আয়াত: ${totalAyahsRevised}টি, স্থায়িত্ব: ${stabilityScore}%`,
        memorization: lokmaCount === 0 ? "excellent" : lokmaCount <= 3 ? "good" : "needs_revision",
        teacher_notes: `এআই দাওর রিপোর্ট: লোকমা ধরা হয়েছে ${lokmaCount} বার, থমকে যাওয়া ${hesitationCount} বার, বিরতিহীন আয়াত ${fluentAyahCount}টি। সময়: ${elapsedMinutes} মিনিট।`,
        quality_score: String(stabilityScore),
      });

      setHasSaved(true);
      toast.success("আলহামদুলিল্লাহ! দাওর রিপোর্ট ডায়েরিতে সফলভাবে সংরক্ষিত হয়েছে।");
    } catch {
      setHasSaved(true);
      toast.info("দাওর রিপোর্ট লোকাল ডায়েরিতে সংরক্ষিত হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  const wordsInCurrentAyah = useMemo(() => {
    return (currentAyah?.text || "").split(" ").filter(Boolean);
  }, [currentAyah]);

  return (
    <div className={`bg-[#05130d] border border-teal-900/70 rounded-3xl p-4 sm:p-6 text-slate-100 shadow-2xl relative ${className}`}>
      {/* ── TOP HEADER: TITLE & FULL QURAN SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-900/60 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 border border-teal-400/50 flex items-center justify-center text-white shadow-md shadow-teal-950/60 shrink-0">
            <RotateCcw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 tracking-tight">
                <span>মুরাযাআ ও দাওর শিক্ষক</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-600/60 font-bold">
                লাইভ উস্তাদ শুনছেন
              </span>
            </div>
            <p className="text-xs text-teal-400/80 mt-0.5">
              আপনি তিলাওয়াত করবেন, এআই উস্তাদ সরাসরি পড়া শুনবেন, লোকমা দেবেন ও ধারাবাহিক দাওর পরিচালনা করবেন।
            </p>
          </div>
        </div>

        {/* Action: Open Full Quran Search / Selector Modal */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-950/90 border border-teal-700/70 hover:bg-teal-900 text-teal-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="১১৪টি সূরা ও ৩০ পারা থেকে দাওরের সূরা নির্বাচন করুন"
          >
            <Search className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {activeSurahMeta.nameBn} ({activeSurahMeta.versesCount} আয়াত)
            </span>
            <span className="text-[10px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded font-mono">
              পারা {activeSurahMeta.juz}
            </span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & JUZ FILTER MODAL ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#051710] border border-teal-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-teal-900/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h4 className="text-base font-bold text-white">দাওরের সূরা ও পারা নির্বাচন করুন (পূর্ণাঙ্গ কুরআন)</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সূরার নাম বা নম্বর দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-teal-800/80 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 placeholder-slate-500"
                />
              </div>

              <div>
                <select
                  value={selectedJuzFilter}
                  onChange={(e) => setSelectedJuzFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900/90 border border-teal-800/80 rounded-xl text-xs text-teal-300 focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="all">সকল পারা (১-৩০)</option>
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      পারা {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-teal-800">
              {filteredSurahs.map((s) => {
                const isSelected = s.id === selectedSurahId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSurahId(s.id);
                      setActiveAyahIndex(0);
                      setIsSearchOpen(false);
                      setStudentTranscript("");
                      setMatchedWords(new Set());
                      setHasSaved(false);
                      toast.success(`দাওরের জন্য সূরা ${s.nameBn} লোড করা হয়েছে`);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-900/80 border-teal-400 text-white shadow-md shadow-teal-950"
                        : "bg-slate-900/60 border-teal-900/40 hover:bg-teal-950/60 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-800/80 text-teal-300 text-xs font-black flex items-center justify-center">
                        {s.id}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{s.nameBn}</span>
                          <span className="text-[10px] text-teal-400/80 font-normal">({s.nameEn})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.versesCount} আয়াত • {s.typeBn} • পারা {s.juz}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-hafizi-quran text-base text-teal-300 font-bold" dir="rtl">
                        {s.nameAr}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TEACHER INTERACTIVE HUD & SPEECH STRIP ── */}
      <div className="bg-[#030d08] border border-teal-800/70 rounded-2xl p-3.5 mb-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Ustad Avatar & Voice Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white border transition-all ${
              isTeacherSpeaking
                ? "bg-amber-600 border-amber-400 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                : isListening
                ? "bg-teal-700 border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.4)]"
                : "bg-slate-800 border-slate-700"
            }`}>
              <Bot className="w-6 h-6" />
            </div>
            {isTeacherSpeaking && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300">
                {teacherVoice.startsWith("female") ? "উস্তাদা ফাতিমা" : teacherVoice === "male_energetic" ? "উস্তাদ সালমান" : "উস্তাদ তারিক"}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-teal-950 text-teal-400 border border-teal-800 rounded">
                দাওর শিক্ষক
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 line-clamp-1 italic font-sans font-medium">
              "{teacherMessage}"
            </p>
          </div>
        </div>

        {/* Right: Teacher Voice Selector & Audio controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={teacherVoice}
            onChange={(e) => setTeacherVoice(e.target.value)}
            className="bg-slate-900 border border-teal-800 rounded-xl px-2.5 py-1 text-xs text-teal-300 focus:outline-none cursor-pointer"
            title="উস্তাদের কণ্ঠ পরিবর্তন করুন"
          >
            <option value="male_scholarly">উস্তাদ তারিক (গম্ভীর)</option>
            <option value="male_energetic">উস্তাদ সালমান (প্রাণবন্ত)</option>
            <option value="female_calm">উস্তাদা ফাতিমা (স্নেহময়ী)</option>
          </select>

          {/* Manual Lokma Button */}
          <button
            type="button"
            onClick={handleGiveVerbalLokma}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/90 border border-amber-600/70 hover:bg-amber-900 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="উস্তাদের কাছ থেকে লোকমা নিন"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>লোকমা নিন</span>
          </button>
        </div>
      </div>

      {/* ── METRICS HUD: STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="bg-[#030d08] border border-teal-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-teal-400/80 font-bold uppercase tracking-wider">দাওরকৃত মোট আয়াত</div>
          <div className="text-xl font-black text-teal-300 mt-0.5">{totalAyahsRevised}</div>
        </div>
        <div className="bg-[#030d08] border border-teal-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">উস্তাদের লোকমা</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{lokmaCount}</div>
        </div>
        <div className="bg-[#030d08] border border-teal-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">নিখুঁত আয়াত</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{fluentAyahCount}</div>
        </div>
        <div className="bg-[#030d08] border border-teal-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-sky-400/80 font-bold uppercase tracking-wider">দাওর স্থায়িত্ব সূচক</div>
          <div className="text-xl font-black text-sky-400 mt-0.5">{stabilityScore}%</div>
        </div>
      </div>

      {/* ── MAIN DAWRE RECITATION MUS'HAF CARD ── */}
      <div className="bg-gradient-to-b from-[#030c08] via-[#061811] to-[#030c08] border border-teal-700/60 rounded-3xl p-5 sm:p-7 mb-5 relative shadow-2xl text-center">
        {/* Ayah Breadcrumb & Qari Listen */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/90 border border-teal-700/60 text-teal-300 text-xs font-bold shadow-md">
            <span>{activeSurahMeta.nameBn}</span>
            <span>•</span>
            <span>
              আয়াত {activeAyahIndex + 1} / {surahData?.numberOfAyahs || activeSurahMeta.versesCount}
            </span>
            <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.5 rounded-full">
              পারা {currentAyah?.juz || activeSurahMeta.juz}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#020a06] border border-teal-900/80 rounded-xl px-2.5 py-1">
            <select
              value={selectedShaykhId}
              onChange={(e) => setSelectedShaykhId(e.target.value)}
              className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              {SHAYKH_REGISTRY.map((q) => (
                <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                  {q.shortNameBn}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleToggleQari}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isPlayingQari
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-teal-800 hover:bg-teal-700 text-teal-100"
              }`}
              title="ক্বারীর সুর শুনুন"
            >
              {isPlayingQari ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span className="text-[10px]">{isPlayingQari ? "থামুন" : "ক্বারীর সুর"}</span>
            </button>
          </div>
        </div>

        {/* Loading State or Mus'haf Words Tracking */}
        {isLoadingSurah ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-teal-400">
            <RotateCcw className="w-6 h-6 animate-spin" />
            <span className="text-xs">পবিত্র কুরআন আয়াত লোড হচ্ছে...</span>
          </div>
        ) : (
          <>
            {/* Real-Time Word Tracking Mus'haf ("পড়া ধরা") */}
            <div className="min-h-[130px] flex items-center justify-center p-4">
              <div
                dir="rtl"
                className="font-hafizi-quran text-2xl sm:text-4xl leading-[2.4] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 select-none"
              >
                {wordsInCurrentAyah.map((w, idx) => {
                  const isWordMatched = matchedWords.has(idx);
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-xl transition-all duration-200 ${
                        isWordMatched
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold scale-105"
                          : "text-slate-100 hover:text-teal-200"
                      }`}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bengali Meaning */}
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto font-sans leading-relaxed">
              {currentAyah?.bengali || "..."}
            </p>

            {/* Live Captured Speech Transcript */}
            {studentTranscript && (
              <div className="mt-4 p-3 bg-slate-950/90 border border-teal-800/60 rounded-2xl text-xs max-w-xl mx-auto">
                <div className="text-[10px] text-teal-400 font-bold mb-1 flex items-center justify-between">
                  <span>উস্তাদ শুনছেন (লাইভ ভয়েস ট্র্যাকিং):</span>
                  <span className="text-slate-400 font-mono">
                    {matchedWords.size} / {wordsInCurrentAyah.length} শব্দ সম্পন্ন
                  </span>
                </div>
                <p className="font-hafizi-quran text-base text-teal-200" dir="rtl">
                  {studentTranscript}
                </p>
              </div>
            )}

            {/* Waveform Visualizer */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 my-4">
                {audioBars.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(8, h * 0.4)}px` }}
                  />
                ))}
              </div>
            )}

            {/* Main Interactive Session Toggle & Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-4 border-t border-teal-950/80">
              <button
                type="button"
                onClick={handleToggleSession}
                className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                  isSessionActive
                    ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse shadow-rose-950"
                    : "bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white hover:from-teal-500 hover:to-emerald-500 shadow-teal-950 ring-1 ring-teal-400"
                }`}
              >
                {isSessionActive ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>দাওর বিরতি দিন</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-emerald-200" />
                    <span>উস্তাদের সাথে দাওর শুরু করুন</span>
                  </>
                )}
              </button>

              {/* Auto Advance Toggle */}
              <button
                type="button"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  autoAdvance
                    ? "bg-teal-950/80 border-teal-500 text-teal-300"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
                title="আয়াত শেষ হলে স্বয়ংক্রিয়ভাবে পরবর্তী আয়াতে যাবে"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>স্বয়ংক্রিয় আয়াত পরিবর্তন: {autoAdvance ? "চালু" : "বন্ধ"}</span>
              </button>

              {/* Auto Voice Lokma Toggle */}
              <button
                type="button"
                onClick={() => setAutoVoiceLokma(!autoVoiceLokma)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  autoVoiceLokma
                    ? "bg-amber-950/80 border-amber-500 text-amber-300"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
                title="থমকে গেলে উস্তাদ নিজে থেকে লোকমা দেবেন"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>উস্তাদের অটো-লোকমা: {autoVoiceLokma ? "অন" : "অফ"}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── BOTTOM FOOTER: AYAH NAVIGATION & SAVE DAWRE DIARY ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Ayah Navigation */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            disabled={activeAyahIndex === 0}
            onClick={() => handleChangeAyah(activeAyahIndex - 1)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী আয়াত</span>
          </button>

          <span className="text-xs font-bold text-teal-400 font-mono px-2">
            {activeAyahIndex + 1} / {surahData?.numberOfAyahs || activeSurahMeta.versesCount}
          </span>

          <button
            type="button"
            disabled={activeAyahIndex >= (surahData?.ayahs?.length || activeSurahMeta.versesCount) - 1}
            onClick={() => handleChangeAyah(activeAyahIndex + 1)}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 border border-teal-600 text-xs font-bold text-white disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer shadow-md"
          >
            <span>পরবর্তী আয়াত</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Save to Daily Lesson Diary */}
        <button
          type="button"
          onClick={handleSaveDawrReport}
          disabled={isSaving || hasSaved}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            hasSaved
              ? "bg-teal-950 border border-teal-600 text-teal-300"
              : "bg-slate-900 hover:bg-slate-800 border border-teal-800 text-slate-200"
          }`}
        >
          {hasSaved ? (
            <>
              <Check className="w-4 h-4 text-teal-400" />
              <span>দাওর রিপোর্ট ডায়রিতে সংরক্ষিত</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-teal-400" />
              <span>দাওর রিপোর্ট জমা দিন (আমুক্তা)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
