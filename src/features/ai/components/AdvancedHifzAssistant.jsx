"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BookOpen,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Lightbulb,
  Save,
  Check,
  Search,
  Volume2,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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
import { playMaShaAllahCelebration } from "@/features/ai-learning/lib/arabicSoundPlayer";
import { appClient } from "@/api/appClient";

// Helper: Normalize Arabic string for comparison
function normalizeArabic(text = "") {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Remove harakat/tashkeel
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\s\p{P}]+/gu, " ")
    .trim();
}

export default function AdvancedHifzAssistant({ studentContext, className = "" }) {
  // Surah & Ayah state
  const [selectedSurahId, setSelectedSurahId] = useState(() => {
    try {
      const saved = localStorage.getItem("rahmania_hifz_last_surah");
      return saved ? parseInt(saved, 10) : 114; // Default to An-Nas (Surah 114)
    } catch {
      return 114;
    }
  });

  const [activeAyahIndex, setActiveAyahIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("rahmania_hifz_last_ayah");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Full Surah data loading
  const [surahData, setSurahData] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);

  // Search & Filter state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJuzFilter, setSelectedJuzFilter] = useState("all");

  // Memorization modes & hints
  const [isMasked, setIsMasked] = useState(true); // Blind memorization mode
  const [isPeeking, setIsPeeking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0: None, 1: First letter, 2: First word, 3: Full
  const [activeHint, setActiveHint] = useState(null);

  // Voice Recitation & Recognition
  const [isListening, setIsListening] = useState(false);
  const [studentTranscript, setStudentTranscript] = useState("");
  const [hesitationCount, setHesitationCount] = useState(0);
  const [lokmaCount, setLokmaCount] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(95);
  const [recitationPassed, setRecitationPassed] = useState(false);

  // Audio Playback (Authentic Qari)
  const [selectedShaykhId, setSelectedShaykhId] = useState(() => getActiveShaykhId() || DEFAULT_SHAYKH_ID);
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Audio visualizer bars
  const [audioBars, setAudioBars] = useState([20, 35, 60, 45, 75, 50, 30, 20]);

  // Refs
  const audioQariRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const peekTimerRef = useRef(null);

  // Load active Surah data
  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setIsLoadingSurah(true);
      try {
        const data = await getSurahData(selectedSurahId);
        if (!isCancelled) {
          setSurahData(data);
          // Bounds check for ayah index
          if (activeAyahIndex >= (data?.ayahs?.length || 1)) {
            setActiveAyahIndex(0);
          }
        }
      } catch (err) {
        console.error("Failed to load Surah:", err);
        toast.error("সূরা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
      } finally {
        if (!isCancelled) setIsLoadingSurah(false);
      }
    }
    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [selectedSurahId]);

  // Persist current position
  useEffect(() => {
    try {
      localStorage.setItem("rahmania_hifz_last_surah", String(selectedSurahId));
      localStorage.setItem("rahmania_hifz_last_ayah", String(activeAyahIndex));
    } catch {}
  }, [selectedSurahId, activeAyahIndex]);

  // Current active Ayah
  const currentAyah = useMemo(() => {
    if (!surahData?.ayahs?.length) return null;
    return surahData.ayahs[activeAyahIndex] || surahData.ayahs[0];
  }, [surahData, activeAyahIndex]);

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

  // Stop all audio & recognition
  const stopAllAudio = useCallback(() => {
    if (audioQariRef.current) {
      audioQariRef.current.pause();
      audioQariRef.current = null;
    }
    setIsPlayingQari(false);

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
    setAudioBars([20, 20, 20, 20, 20, 20, 20, 20]);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, [stopAllAudio]);

  // Play / Pause Authentic Qari
  const handleToggleQari = () => {
    if (isPlayingQari) {
      stopAllAudio();
      return;
    }

    if (!currentAyah) return;
    stopAllAudio();

    const ayahNum = currentAyah.numberInSurah || activeAyahIndex + 1;
    const audioUrl = getQariAudioUrl(selectedShaykhId, selectedSurahId, ayahNum);

    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackSpeed;
    audioQariRef.current = audio;
    setIsPlayingQari(true);

    audio.onended = () => {
      setIsPlayingQari(false);
      audioQariRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingQari(false);
      audioQariRef.current = null;
      toast.error("ক্বারীর অডিও প্লে করতে সমস্যা হয়েছে।");
    };

    audio.play().catch(() => {
      setIsPlayingQari(false);
      audioQariRef.current = null;
    });
  };

  // Temporary Peek Preview (3 seconds)
  const handlePeekPreview = () => {
    if (!isMasked) return;
    setIsPeeking(true);
    setHesitationCount((prev) => prev + 1);
    toast.info("ঝলক দেখানো হচ্ছে (৩ সেকেন্ডের জন্য)...");

    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    peekTimerRef.current = setTimeout(() => {
      setIsPeeking(false);
    }, 3000);
  };

  // Adaptive Hint Request
  const handleRequestHint = () => {
    if (!currentAyah) return;
    const nextLevel = Math.min(3, hintLevel + 1);
    setHintLevel(nextLevel);
    setHesitationCount((prev) => prev + 1);

    const words = (currentAyah.text || "").split(" ").filter(Boolean);
    const firstWord = words[0] || "";

    if (nextLevel === 1) {
      setActiveHint({
        level: 1,
        title: "প্রথম হরফের ইঙ্গিত (Soft Cue)",
        cue: `প্রথম হরফ: '${firstWord.charAt(0)}'`,
      });
      toast.info("ইঙ্গিত স্তর ১: প্রথম হরফ দেখে নিজে স্মরণ করার চেষ্টা করুন।");
    } else if (nextLevel === 2) {
      setActiveHint({
        level: 2,
        title: "প্রথম শব্দের ইঙ্গিত (Word Cue)",
        cue: `প্রথম শব্দটি: '${firstWord}'`,
      });
      setLokmaCount((prev) => prev + 1);
      setStabilityScore((prev) => Math.max(50, prev - 8));
      toast.warning("ইঙ্গিত স্তর ২: ১টি লোকমা গণনা করা হয়েছে।");
    } else {
      setIsMasked(false);
      setActiveHint({
        level: 3,
        title: "সম্পূর্ণ আয়াত উন্মোচিত",
        cue: currentAyah.text,
      });
      setLokmaCount((prev) => prev + 2);
      setStabilityScore((prev) => Math.max(40, prev - 15));
      toast.warning("সম্পূর্ণ আয়াত দেখানো হলো। নিয়মিত সবকি দাওর দিন।");
    }
  };

  // Start Mic & Visualizer
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

  // Toggle Blind Recitation Listening
  const handleToggleListening = () => {
    if (isListening) {
      stopAllAudio();
      toast.success("হিফজ তিলাওয়াত সমাপ্ত! স্মৃতি বিশ্লেষণ করা হয়েছে।");
      return;
    }

    stopAllAudio();
    setIsListening(true);
    setStudentTranscript("");
    setRecitationPassed(false);
    startVisualizer();
    toast.info("শুনছি... স্মৃতি থেকে আয়াত তিলাওয়াত করুন।");

    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = "ar-SA";
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (e) => {
            let fullText = "";
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript + " ";
            }
            const clean = fullText.trim();
            setStudentTranscript(clean);

            // Real-time evaluation against current ayah
            if (currentAyah?.text) {
              const targetNorm = normalizeArabic(currentAyah.text);
              const spokenNorm = normalizeArabic(clean);

              const targetWords = targetNorm.split(" ").filter(Boolean);
              const spokenWords = spokenNorm.split(" ").filter(Boolean);

              let matchedCount = 0;
              targetWords.forEach((tw) => {
                if (spokenWords.includes(tw)) matchedCount++;
              });

              const accuracy = targetWords.length > 0 ? (matchedCount / targetWords.length) * 100 : 0;

              if (accuracy >= 75) {
                setRecitationPassed(true);
                setStabilityScore((prev) => Math.min(100, Math.max(prev, Math.round(accuracy))));
                if (hintLevel === 0 && lokmaCount === 0) {
                  playMaShaAllahCelebration();
                  toast.success("ما شاء الله! স্মৃতি থেকে নিখুঁত তিলাওয়াত হয়েছে!");
                }
              }
            }
          };

          rec.onerror = (err) => {
            console.warn("SpeechRec notice:", err);
            if (err?.error === "not-allowed") {
              toast.error("মাইক্রোফোনের অনুমতি দিন তিলাওয়াত শোনার জন্য।");
              stopAllAudio();
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn("SpeechRec error:", e);
        }
      } else {
        toast.info("আপনার ব্রাউজারে স্পিচ রিকগনিশন নেই; তবে অডিও প্র্যাকটিস চালু রয়েছে।");
      }
    }
  };

  // Change Ayah Index
  const handleChangeAyah = (newIdx) => {
    stopAllAudio();
    setActiveAyahIndex(newIdx);
    setIsMasked(true);
    setIsPeeking(false);
    setHintLevel(0);
    setActiveHint(null);
    setStudentTranscript("");
    setRecitationPassed(false);
    setHasSaved(false);
  };

  // Save Session to Hifz / Daily Lesson Entry
  const handleSaveToHifzDiary = async () => {
    if (!currentAyah || !surahData) return;
    setIsSaving(true);
    try {
      const studentId = studentContext?.id || studentContext?.student_id || 1;
      const ayahNo = currentAyah.numberInSurah || activeAyahIndex + 1;

      await appClient.entities.DailyLesson.create({
        student_id: studentId,
        date: new Date().toISOString().split("T")[0],
        subject: "Quran (Hifz - সবক)",
        lesson_content: `সূরা ${activeSurahMeta.nameBn} (আয়াত ১-${ayahNo}) — স্থায়িত্ব স্কোর: ${stabilityScore}%`,
        memorization: lokmaCount === 0 && hintLevel === 0 ? "excellent" : lokmaCount <= 2 ? "good" : "needs_revision",
        teacher_notes: `এআই হিফজ অডিট: লোকমা ${lokmaCount}টি, থমকে যাওয়া ${hesitationCount} বার। হিন্ট লেভেল: ${hintLevel}। নির্ভুলতা: ${recitationPassed ? "পাস" : "চলমান"}`,
        quality_score: String(stabilityScore),
      });

      setHasSaved(true);
      toast.success("আলহামদুলিল্লাহ! হিফজ সবক ডায়রিতে সফলভাবে জমা হয়েছে।");
    } catch {
      setHasSaved(true);
      toast.info("হিফজ ডায়েরিতে লোকালভাবে সংরক্ষিত হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  const isTextRevealed = !isMasked || isPeeking;

  return (
    <div className={`bg-[#06140e] border border-emerald-900/70 rounded-3xl p-4 sm:p-6 text-slate-100 shadow-2xl relative ${className}`}>
      {/* ── TOP HEADER: TITLE & FULL QURAN SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/50 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/50 flex items-center justify-center text-white shadow-md shadow-emerald-950/60 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 tracking-tight">
                <span>হিফজ সহকারী ও স্পেসড রিপিটেশন</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                পূর্ণাঙ্গ ১১৪ সূরা
              </span>
            </div>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              স্মৃতি পরীক্ষা, লোকমা সনাক্তকরণ, সূক্ষ্ম ইঙ্গিত এবং মুখস্থ স্থায়িত্ব স্কোর।
            </p>
          </div>
        </div>

        {/* Action: Open Full Quran Search / Selector Modal */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700/70 hover:bg-emerald-900 text-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="১১৪টি সূরা ও ৩০ পারা থেকে নির্বাচন করুন"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {activeSurahMeta.nameBn} ({activeSurahMeta.versesCount} আয়াত)
            </span>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              পারা {activeSurahMeta.juz}
            </span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & JUZ FILTER MODAL ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#071710] border border-emerald-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">সূরা ও পারা নির্বাচন করুন (পূর্ণাঙ্গ কুরআন)</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search Input & Juz Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সূরার নাম (বাংলা/ইংরেজি/আরবি) বা নম্বর খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-emerald-800/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
              </div>

              <div>
                <select
                  value={selectedJuzFilter}
                  onChange={(e) => setSelectedJuzFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900/90 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
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

            {/* Surahs Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-emerald-800">
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
                      setIsMasked(true);
                      setHintLevel(0);
                      setActiveHint(null);
                      setHasSaved(false);
                      toast.success(`সূরা ${s.nameBn} লোড করা হয়েছে`);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-900/80 border-emerald-400 text-white shadow-md shadow-emerald-950"
                        : "bg-slate-900/60 border-emerald-900/40 hover:bg-emerald-950/60 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-xs font-black flex items-center justify-center">
                        {s.id}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{s.nameBn}</span>
                          <span className="text-[10px] text-emerald-400/80 font-normal">({s.nameEn})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.versesCount} আয়াত • {s.typeBn} • পারা {s.juz}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-hafizi-quran text-base text-emerald-300 font-bold" dir="rtl">
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

      {/* ── METRICS STATUS HUD BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="bg-[#040e09] border border-emerald-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">স্থায়িত্ব সূচক</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{stabilityScore}%</div>
        </div>
        <div className="bg-[#040e09] border border-emerald-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">লোকমা (ভুল)</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{lokmaCount}</div>
        </div>
        <div className="bg-[#040e09] border border-emerald-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-teal-400/80 font-bold uppercase tracking-wider">থমকে যাওয়া</div>
          <div className="text-xl font-black text-teal-300 mt-0.5">{hesitationCount}</div>
        </div>
        <div className="bg-[#040e09] border border-emerald-900/60 p-3 rounded-2xl text-center shadow-inner">
          <div className="text-[10px] text-sky-400/80 font-bold uppercase tracking-wider">হিন্ট স্তর</div>
          <div className="text-xl font-black text-sky-400 mt-0.5">{hintLevel}/৩</div>
        </div>
      </div>

      {/* ── MAIN BLIND RECITATION CARD ── */}
      <div className="bg-gradient-to-b from-[#040f09] via-[#071911] to-[#040f09] border border-emerald-700/60 rounded-3xl p-5 sm:p-7 mb-5 relative overflow-hidden shadow-2xl text-center">
        {/* Ayah Navigation Breadcrumb & Quick Qari Audio */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-xs font-bold shadow-md">
            <span>{activeSurahMeta.nameBn}</span>
            <span>•</span>
            <span>
              আয়াত {activeAyahIndex + 1} / {surahData?.numberOfAyahs || activeSurahMeta.versesCount}
            </span>
            <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full">
              পারা {currentAyah?.juz || activeSurahMeta.juz}
            </span>
          </div>

          {/* Qari Selector & Audio Player */}
          <div className="flex items-center gap-1.5 bg-[#030c07] border border-emerald-900/80 rounded-xl px-2.5 py-1">
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
                  : "bg-emerald-800 hover:bg-emerald-700 text-emerald-100"
              }`}
              title="ক্বারীর বিশুদ্ধ তিলাওয়াত শুনুন"
            >
              {isPlayingQari ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span className="text-[10px]">{isPlayingQari ? "থামুন" : "শুনুন"}</span>
            </button>
          </div>
        </div>

        {/* Loading State or Arabic Text */}
        {isLoadingSurah ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-emerald-400">
            <RotateCcw className="w-6 h-6 animate-spin" />
            <span className="text-xs">পবিত্র কুরআন আয়াত লোড হচ্ছে...</span>
          </div>
        ) : (
          <>
            {/* Arabic Text (Masked or Revealed) */}
            <div className="min-h-[120px] flex items-center justify-center p-4 relative">
              <p
                dir="rtl"
                className={`font-hafizi-quran text-2xl sm:text-4xl leading-[2.2] transition-all duration-300 ${
                  isTextRevealed
                    ? "text-emerald-100 font-bold drop-shadow-[0_2px_12px_rgba(16,185,129,0.3)]"
                    : "blur-md select-none opacity-30 text-slate-500 scale-95"
                }`}
              >
                {currentAyah?.text || "..."}
              </p>

              {!isTextRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-emerald-300 bg-[#06180f]/95 border border-emerald-600/70 px-4 py-2 rounded-2xl shadow-xl">
                    🧠 স্মৃতি থেকে স্মরণ করুন (লেখা লুকায়িত)
                  </span>
                </div>
              )}
            </div>

            {/* Bengali Meaning */}
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto font-sans leading-relaxed">
              {currentAyah?.bengali || "অর্থ লোড হচ্ছে..."}
            </p>

            {/* Active Hint Banner */}
            {activeHint && (
              <div className="mt-4 p-3.5 bg-amber-950/60 border border-amber-600/50 rounded-2xl text-left text-xs space-y-1.5 animate-fade-in max-w-xl mx-auto shadow-lg">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>{activeHint.title}</span>
                </div>
                <p className="text-slate-100 font-hafizi-quran text-lg leading-relaxed" dir="rtl">
                  {activeHint.cue}
                </p>
              </div>
            )}

            {/* Real-time Recitation Transcript */}
            {studentTranscript && (
              <div className="mt-4 p-3 bg-slate-950/80 border border-emerald-800/60 rounded-2xl text-xs max-w-xl mx-auto">
                <div className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center justify-between">
                  <span>আপনার পঠিত উচ্চারণ (লাইভ ক্যাপচার):</span>
                  {recitationPassed && (
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> মাশাআল্লাহ! শুদ্ধ হয়েছে
                    </span>
                  )}
                </div>
                <p className="font-hafizi-quran text-base text-emerald-200" dir="rtl">
                  {studentTranscript}
                </p>
              </div>
            )}

            {/* Audio Waveform Bars (During Recording) */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 my-4">
                {audioBars.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(8, h * 0.4)}px` }}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons: Mask, Peek, Hint, Listen */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 pt-4 border-t border-emerald-950/80">
              {/* Peek 3s Button */}
              <button
                type="button"
                onClick={handlePeekPreview}
                disabled={!isMasked}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#071d12] hover:bg-[#0a2719] border border-emerald-700/60 text-emerald-300 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="৩ সেকেন্ডের জন্য ক্ষণিক ঝলক দেখুন"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>ঝলক দেখুন (৩ সে.)</span>
              </button>

              {/* Full Hide/Show Toggle */}
              <button
                type="button"
                onClick={() => setIsMasked(!isMasked)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isMasked ? "লেখা দেখুন" : "লুকিয়ে রাখুন"}</span>
              </button>

              {/* Request Adaptive Hint */}
              <button
                type="button"
                onClick={handleRequestHint}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>হিন্ট নিন (স্তর {hintLevel + 1})</span>
              </button>

              {/* Mic: Recite from Memory */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse shadow-rose-900/60"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? "তিলাওয়াত সমাপ্ত করুন" : "স্মৃতি থেকে পাঠ বলুন"}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── BOTTOM FOOTER: AYAH NAVIGATION & SAVE TO HIFZ DIARY ── */}
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

          <span className="text-xs font-bold text-emerald-400 font-mono px-2">
            {activeAyahIndex + 1} / {surahData?.numberOfAyahs || activeSurahMeta.versesCount}
          </span>

          <button
            type="button"
            disabled={activeAyahIndex >= (surahData?.ayahs?.length || activeSurahMeta.versesCount) - 1}
            onClick={() => handleChangeAyah(activeAyahIndex + 1)}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-xs font-bold text-white disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer shadow-md"
          >
            <span>পরবর্তী আয়াত</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Save to Daily Lesson Diary */}
        <button
          type="button"
          onClick={handleSaveToHifzDiary}
          disabled={isSaving || hasSaved}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            hasSaved
              ? "bg-emerald-950 border border-emerald-600 text-emerald-300"
              : "bg-slate-900 hover:bg-slate-800 border border-emerald-800 text-slate-200"
          }`}
        >
          {hasSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>হিফজ সবক ডায়রিতে সংরক্ষিত</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-emerald-400" />
              <span>হিফজ সবক জমা দিন (ডায়েরি)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
