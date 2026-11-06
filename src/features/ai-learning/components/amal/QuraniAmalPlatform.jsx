"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Check,
  CheckSquare,
  Square,
  Mic,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import {
  QURANI_AMAL_ITEMS,
  QURANI_AMAL_CATEGORIES,
} from "../../data/quraniAmalData";
import {
  SHAYKH_REGISTRY,
  getActiveShaykhId,
  setActiveShaykhId,
  getQariAudioUrl,
} from "@/lib/quran/audio/QariRegistry";
import { universalAudioEngine } from "@/lib/quran/audio";
import { toast } from "sonner";

export default function QuraniAmalPlatform({ _onLaunchQuranReader }) {
  // Category & Filter state
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmalIds, setSelectedAmalIds] = useState(
    QURANI_AMAL_ITEMS.map((item) => item.id)
  );

  // Global & Card Display Modes ('verses' or 'fazilat')
  const [globalDisplayMode, setGlobalDisplayMode] = useState("verses"); // 'verses' | 'fazilat'
  const [cardTabState, setCardTabState] = useState({}); // { [amalId]: 'verses' | 'fazilat' }

  // Active View / Modal state
  const [expandedAmalId, setExpandedAmalId] = useState("fatiha"); // Default first expanded
  const [fazilatModalItem, setFazilatModalItem] = useState(null);
  const [activeMicItem, setActiveMicItem] = useState(null);

  // Audio Playback State
  const [selectedQari, setSelectedQari] = useState(getActiveShaykhId() || "alafasy");
  const [playbackStatus, setPlaybackStatus] = useState("idle"); // 'idle' | 'playing' | 'paused'
  const [playbackType, setPlaybackType] = useState(null); // 'arabic' | 'bangla_meaning' | 'fazilat'
  const [activeAmalIndex, setActiveAmalIndex] = useState(-1);
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);

  // Fast loading indicators
  const [loadingAudioKey, setLoadingAudioKey] = useState(null);

  // Audio queue playlist references
  const playlistQueueRef = useRef([]);
  const currentQueueStepRef = useRef(0);
  const audioPlayerRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Live Mic State
  const [isMicListening, setIsMicListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Helper to get active tab for a card
  const getCardActiveTab = (itemId) => {
    if (globalDisplayMode === "fazilat") return "fazilat";
    return cardTabState[itemId] || "verses";
  };

  const setCardActiveTab = (itemId, tab) => {
    setCardTabState((prev) => ({ ...prev, [itemId]: tab }));
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return QURANI_AMAL_ITEMS.filter((item) => {
      const matchCat =
        activeCategory === "all" || item.category.includes(activeCategory);
      const matchSearch =
        !searchQuery ||
        item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleAr.includes(searchQuery) ||
        item.virtueSummary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Sync Qari changes
  const handleQariChange = (qariId) => {
    setSelectedQari(qariId);
    setActiveShaykhId(qariId);
    toast.success(`ক্বারী পরিবর্তিত হয়েছে: ${SHAYKH_REGISTRY.find((q) => q.id === qariId)?.nameBn || qariId}`);
    if (playbackStatus === "playing" && playbackType === "arabic") {
      stopAllAudio();
    }
  };

  // Safe Audio Stop
  const stopAllAudio = useCallback(() => {
    try {
      if (typeof universalAudioEngine !== "undefined" && universalAudioEngine) {
        if (typeof universalAudioEngine.stopAll === "function") {
          universalAudioEngine.stopAll();
        } else if (typeof universalAudioEngine.stop === "function") {
          universalAudioEngine.stop();
        }
      }
    } catch {}

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }

    isPlayingRef.current = false;
    setPlaybackStatus("idle");
    setPlaybackType(null);
    setActiveAmalIndex(-1);
    setActiveAyahIndex(0);
    setLoadingAudioKey(null);
    playlistQueueRef.current = [];
    currentQueueStepRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      stopMic();
    };
  }, [stopAllAudio]);

  // Playlist Queue Runner
  const playQueueStep = useCallback((stepIndex) => {
    const queue = playlistQueueRef.current;
    if (!queue || stepIndex < 0 || stepIndex >= queue.length) {
      stopAllAudio();
      toast.success("মাশাআল্লাহ! নির্বাচিত তিলাওয়াত সমাপ্ত হয়েছে।");
      return;
    }

    currentQueueStepRef.current = stepIndex;
    const task = queue[stepIndex];
    setActiveAmalIndex(task.amalIndex);
    setActiveAyahIndex(task.ayahIndex);
    setPlaybackStatus("playing");
    setPlaybackType(task.type);
    isPlayingRef.current = true;
    setLoadingAudioKey(task.audioKey || null);

    if (task.type === "arabic") {
      // Authentic Qari audio via EveryAyah
      const audioUrl = getQariAudioUrl(selectedQari, task.surahNumber, task.ayahNumber);
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      const audio = audioPlayerRef.current;
      audio.src = audioUrl;
      audio.play()
        .then(() => {
          setLoadingAudioKey(null);
        })
        .catch((err) => {
          console.warn("Audio play prevented:", err);
          setLoadingAudioKey(null);
          setTimeout(() => playQueueStep(stepIndex + 1), 400);
        });

      audio.onended = () => {
        if (!isPlayingRef.current) return;
        playQueueStep(stepIndex + 1);
      };
      audio.onerror = () => {
        if (!isPlayingRef.current) return;
        setLoadingAudioKey(null);
        playQueueStep(stepIndex + 1);
      };
    } else if (task.type === "bangla_meaning") {
      // Natural Bengali Neural TTS via /api/ai/tts
      const textToSpeak = task.text;
      const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(textToSpeak)}`;
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      const audio = audioPlayerRef.current;
      audio.src = ttsUrl;
      audio.play()
        .then(() => {
          setLoadingAudioKey(null);
        })
        .catch(() => {
          setLoadingAudioKey(null);
          setTimeout(() => playQueueStep(stepIndex + 1), 400);
        });

      audio.onended = () => {
        if (!isPlayingRef.current) return;
        playQueueStep(stepIndex + 1);
      };
      audio.onerror = () => {
        if (!isPlayingRef.current) return;
        setLoadingAudioKey(null);
        playQueueStep(stepIndex + 1);
      };
    }
  }, [selectedQari, stopAllAudio]);

  // Start Playing An Entire Single Amal (Arabic)
  const handlePlaySingleAmal = (amalItem) => {
    stopAllAudio();
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    const queue = amalItem.verses.map((v, vIdx) => ({
      type: "arabic",
      amalId: amalItem.id,
      amalIndex: globalIdx,
      ayahIndex: vIdx,
      surahNumber: amalItem.surahNumber,
      ayahNumber: v.ayahNumber,
      audioKey: `arabic-${amalItem.id}-${v.ayahNumber}`,
      title: `${amalItem.titleBn} (আয়াত ${v.ayahNumber})`,
    }));

    playlistQueueRef.current = queue;
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);
    toast.info(`সূরা ${amalItem.titleBn} তিলাওয়াত শুরু হয়েছে`);
  };

  // Start Playing Bengali Translation for an Amal
  const handlePlayBanglaMeaning = (amalItem) => {
    stopAllAudio();
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    const queue = amalItem.verses.map((v, vIdx) => ({
      type: "bangla_meaning",
      amalId: amalItem.id,
      amalIndex: globalIdx,
      ayahIndex: vIdx,
      audioKey: `meaning-${amalItem.id}-${v.ayahNumber}`,
      text: `${v.ayahNumber} নম্বর আয়াত: ${v.bengali}`,
      title: `${amalItem.titleBn} বাংলা অর্থ`,
    }));

    playlistQueueRef.current = queue;
    setExpandedAmalId(amalItem.id);
    setLoadingAudioKey(`meaning-${amalItem.id}-${amalItem.verses[0].ayahNumber}`);
    playQueueStep(0);
    toast.info(`${amalItem.titleBn}-এর বাংলা অর্থ শুরু হচ্ছে...`);
  };

  // Play SINGLE Ayah Arabic Audio
  const handlePlaySingleAyahArabic = (amalItem, verse, vIdx) => {
    stopAllAudio();
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    playlistQueueRef.current = [
      {
        type: "arabic",
        amalId: amalItem.id,
        amalIndex: globalIdx,
        ayahIndex: vIdx,
        surahNumber: amalItem.surahNumber,
        ayahNumber: verse.ayahNumber,
        audioKey: `arabic-${amalItem.id}-${verse.ayahNumber}`,
        title: `${amalItem.titleBn} - আয়াত ${verse.ayahNumber}`,
      },
    ];
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);
    toast.info(`${amalItem.titleBn} - আয়াত ${verse.ayahNumber} তিলাওয়াত`);
  };

  // Play SINGLE Ayah Bengali Meaning Fast
  const handlePlaySingleAyahMeaning = (amalItem, verse, vIdx) => {
    stopAllAudio();
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    const audioKey = `meaning-${amalItem.id}-${verse.ayahNumber}`;
    setLoadingAudioKey(audioKey);

    playlistQueueRef.current = [
      {
        type: "bangla_meaning",
        amalId: amalItem.id,
        amalIndex: globalIdx,
        ayahIndex: vIdx,
        audioKey,
        text: `${verse.ayahNumber} নম্বর আয়াতের অর্থ: ${verse.bengali}`,
        title: `${amalItem.titleBn} - আয়াত ${verse.ayahNumber} অর্থ`,
      },
    ];
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);
    toast.info(`আয়াত ${verse.ayahNumber}-এর অর্থ লোড হচ্ছে...`);
  };

  // Play Fazilat Audio
  const handlePlayFazilatAudio = (amalItem) => {
    stopAllAudio();
    const textToSpeak = amalItem.virtueAudioText || amalItem.virtueSummary;
    const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(textToSpeak)}`;
    setLoadingAudioKey(`fazilat-${amalItem.id}`);
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
    }
    const audio = audioPlayerRef.current;
    audio.src = ttsUrl;
    setPlaybackStatus("playing");
    setPlaybackType("fazilat");
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    setActiveAmalIndex(globalIdx);
    audio.play()
      .then(() => {
        setLoadingAudioKey(null);
      })
      .catch(() => {
        setLoadingAudioKey(null);
        setPlaybackStatus("idle");
      });
    audio.onended = () => {
      setPlaybackStatus("idle");
      setPlaybackType(null);
      setActiveAmalIndex(-1);
    };
    toast.info(`${amalItem.titleBn}-এর ফযিলত ও বরকত শোনানো হচ্ছে`);
  };

  // Continuous Play All (Or Selected)
  const handlePlayAllAmal = (onlySelected = false) => {
    stopAllAudio();
    const targetItems = onlySelected
      ? QURANI_AMAL_ITEMS.filter((i) => selectedAmalIds.includes(i.id))
      : QURANI_AMAL_ITEMS;

    if (targetItems.length === 0) {
      toast.error("অনুগ্রহ করে অন্তত একটি আমল নির্বাচন করুন");
      return;
    }

    const fullQueue = [];
    targetItems.forEach((item) => {
      const gIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === item.id);
      item.verses.forEach((v, vIdx) => {
        fullQueue.push({
          type: "arabic",
          amalId: item.id,
          amalIndex: gIdx,
          ayahIndex: vIdx,
          surahNumber: item.surahNumber,
          ayahNumber: v.ayahNumber,
          audioKey: `arabic-${item.id}-${v.ayahNumber}`,
          title: `${item.titleBn} - আয়াত ${v.ayahNumber}`,
        });
      });
    });

    playlistQueueRef.current = fullQueue;
    playQueueStep(0);
    toast.success(`${targetItems.length}টি আমলের ধারাবাহিক তিলাওয়াত শুরু হয়েছে`);
  };

  // Toggle Play / Pause
  const handleTogglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (playbackStatus === "playing") {
      audioPlayerRef.current.pause();
      setPlaybackStatus("paused");
    } else if (playbackStatus === "paused") {
      audioPlayerRef.current.play();
      setPlaybackStatus("playing");
    }
  };

  // Skip Next / Prev in Queue
  const handleSkipNext = () => {
    const nextStep = currentQueueStepRef.current + 1;
    if (nextStep < playlistQueueRef.current.length) {
      playQueueStep(nextStep);
    } else {
      stopAllAudio();
    }
  };

  const handleSkipPrev = () => {
    const prevStep = Math.max(0, currentQueueStepRef.current - 1);
    playQueueStep(prevStep);
  };

  // Multi-select helpers
  const toggleSelectAmal = (id) => {
    setSelectedAmalIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllAmal = () => {
    if (selectedAmalIds.length === QURANI_AMAL_ITEMS.length) {
      setSelectedAmalIds([]);
    } else {
      setSelectedAmalIds(QURANI_AMAL_ITEMS.map((i) => i.id));
    }
  };

  // Live Mic Practice Handlers
  const startMic = async (item) => {
    stopAllAudio();
    setActiveMicItem(item);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        toast.error("আপনার ব্রাউজারে মাইক্রোফোন সাপোর্ট নেই।");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicListening(true);
      toast.success("মাইক্রোফোন সক্রিয় হয়েছে! ক্বারীর অডিওর সাথে মুখে মুখে পড়ুন।");

      // Animate volume waveform
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Mic permission error:", err);
      toast.error("মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি।");
      setIsMicListening(false);
    }
  };

  const stopMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setIsMicListening(false);
    setMicVolume(0);
    setActiveMicItem(null);
  };

  const activeAmalData = activeAmalIndex >= 0 ? QURANI_AMAL_ITEMS[activeAmalIndex] : null;

  // Render Category Icon safely without sparkles
  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case "Sun":
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case "Moon":
        return <Moon className="w-3.5 h-3.5 text-sky-400" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />;
      case "BookOpen":
      default:
        return <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#07130E] text-slate-800 dark:text-emerald-50 transition-colors pb-32">
      {/* ── TOP HERO HEADER & CONTROLS ── */}
      <div className="bg-gradient-to-b from-emerald-900 to-teal-950 text-white pt-8 pb-10 px-4 sm:px-6 rounded-b-[2.5rem] shadow-xl border-b border-emerald-700/40 relative overflow-hidden">
        {/* Background Islamic Subtle Lattice (No Sparkles) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          {/* Top Pill / Badge without sparkles */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold backdrop-blur-md">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>দৈনন্দিন সুন্নাত ও মাসনূন আমল</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-amber-300 font-extrabold">{QURANI_AMAL_ITEMS.length}টি ফযিলতপূর্ণ আমল</span>
            </div>

            {/* Qari Selector Dropdown */}
            <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-600/40 px-3 py-1.5 rounded-2xl backdrop-blur-md">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-emerald-200 hidden sm:inline">ক্বারী:</span>
              <select
                value={selectedQari}
                onChange={(e) => handleQariChange(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-amber-300 focus:outline-none cursor-pointer"
              >
                {SHAYKH_REGISTRY.map((qari) => (
                  <option key={qari.id} value={qari.id} className="bg-emerald-950 text-white font-medium">
                    {qari.displayTitleBn || qari.nameBn} ({qari.roleBn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span>কুরআনী আমল</span>
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                الأَعْمَالُ القُرْآنِيَّة
              </span>
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              নবীজী (ﷺ)-এর সহীহ সুন্নাহ ও হাদীস অনুযায়ী দৈনন্দিন ফযিলতপূর্ণ সূরা ও আয়াতের সমষ্টি। যেকোনো আমল এককভাবে, অর্থসহ বা একসাথে শুনুন এবং ফযিলত বিস্তারিত পড়ুন।
            </p>
          </div>

          {/* Quick Action Buttons Bar + Global Display Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handlePlayAllAmal(false)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>সকল আমল একসাথে শুনুন</span>
              </button>

              <button
                onClick={() => handlePlayAllAmal(true)}
                disabled={selectedAmalIds.length === 0}
                className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 disabled:opacity-40 border border-emerald-500/40 text-emerald-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-emerald-300" />
                <span>নির্বাচিত আমল শুনুন ({selectedAmalIds.length})</span>
              </button>

              {playbackStatus !== "idle" && (
                <button
                  onClick={stopAllAudio}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>থামুন</span>
                </button>
              )}
            </div>

            {/* Global View Switch: Verses vs Fazilat Reading Mode */}
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-600/50 p-1 rounded-2xl">
              <button
                onClick={() => setGlobalDisplayMode("verses")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  globalDisplayMode === "verses"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>আয়াত ভিউ</span>
              </button>
              <button
                onClick={() => setGlobalDisplayMode("fazilat")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  globalDisplayMode === "fazilat"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ফযিলত ভিউ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER TABS (No sparkles) ── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 -mt-5 relative z-20">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-2 shadow-lg border border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QURANI_AMAL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 transition active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                {renderCategoryIcon(cat.iconName)}
                <span>{cat.labelBn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH BOX & SELECT ALL ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আমল খুঁজুন... (যেমন: আয়াতুল কুরসী, বাক্বারা, ফালাক্ব, সকাল-সন্ধ্যা)"
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={selectAllAmal}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 transition cursor-pointer"
        >
          {selectedAmalIds.length === QURANI_AMAL_ITEMS.length ? "বাছাই মুছুন" : "সবগুলো নির্বাচন করুন"}
        </button>
      </div>

      {/* ── AMAL CARDS FEED ── */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 space-y-4">
        {filteredItems.map((item, idx) => {
          const isSelected = selectedAmalIds.includes(item.id);
          const isExpanded = expandedAmalId === item.id;
          const isThisAmalPlaying = activeAmalData?.id === item.id && playbackStatus === "playing";
          const currentTab = getCardActiveTab(item.id);

          return (
            <article
              key={item.id}
              className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-stone-900 shadow-sm overflow-hidden ${
                isThisAmalPlaying
                  ? "border-amber-400/80 ring-2 ring-amber-400/30"
                  : isExpanded
                  ? "border-emerald-300 dark:border-emerald-800 shadow-md"
                  : "border-stone-200/80 dark:border-stone-800 hover:border-emerald-200"
              }`}
            >
              {/* Card Header Top */}
              <div className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelectAmal(item.id)}
                    className="mt-1 text-emerald-700 dark:text-emerald-400 hover:scale-110 transition cursor-pointer"
                    title={isSelected ? "প্লেলিস্ট থেকে বাদ দিন" : "প্লেলিস্টে যুক্ত করুন"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 dark:text-stone-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        #{idx + 1}
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-emerald-100">
                        {item.titleBn}
                      </h2>
                      <span className="font-hafizi-quran text-sm text-emerald-700 dark:text-emerald-400">
                        ({item.titleAr})
                      </span>
                    </div>

                    {/* Timing Badge & Repetition Pill */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Sun className="w-3 h-3 text-amber-500" />
                        <span>{item.timingBadge}</span>
                      </span>

                      <span className="font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        পড়ার সংখ্যা: {item.repetition}
                      </span>

                      <span className="text-[11px] text-slate-500 dark:text-stone-400">
                        {item.totalVerses}টি আয়াত
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Controls on Header Right */}
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  {/* Play Qari Audio Button */}
                  <button
                    onClick={() => handlePlaySingleAmal(item)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>তিলাওয়াত</span>
                  </button>

                  {/* Play Bangla Translation Button */}
                  <button
                    onClick={() => handlePlayBanglaMeaning(item)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    {loadingAudioKey?.startsWith(`meaning-${item.id}`) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden xs:inline">অর্থ শুনুন</span>
                  </button>

                  {/* Mic Practice Button */}
                  <button
                    onClick={() => startMic(item)}
                    className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition cursor-pointer"
                    title="মুখে মুখে তিলাওয়াত করুন (মাইক)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => setExpandedAmalId(isExpanded ? null : item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Tabs: [ আয়াত ও অনুবাদ ] vs [ ফযিলত ও পড়ার নিয়ম ] */}
              <div className="px-4 sm:px-5 pb-2">
                <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2">
                  <button
                    onClick={() => {
                      setCardActiveTab(item.id, "verses");
                      setExpandedAmalId(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      currentTab === "verses"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-extrabold border border-emerald-300 dark:border-emerald-700"
                        : "text-slate-500 hover:text-slate-800 dark:text-stone-400"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>আয়াত ও অনুবাদ ({item.totalVerses})</span>
                  </button>

                  <button
                    onClick={() => {
                      setCardActiveTab(item.id, "fazilat");
                      setExpandedAmalId(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      currentTab === "fazilat"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-700"
                        : "text-slate-500 hover:text-slate-800 dark:text-stone-400"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>ফযিলত ও সহীহ হাদীসের দলিল</span>
                  </button>
                </div>
              </div>

              {/* Virtue Summary Quick Banner */}
              {currentTab === "verses" && (
                <div className="px-4 sm:px-5 pb-3">
                  <div className="text-xs text-slate-700 dark:text-emerald-200/90 leading-relaxed bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/40 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-amber-900 dark:text-amber-300 mr-1.5">ফযিলত সংক্ষেপ:</span>
                        <span>{item.virtueSummary}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCardActiveTab(item.id, "fazilat");
                        setExpandedAmalId(item.id);
                      }}
                      className="text-emerald-700 dark:text-emerald-400 font-extrabold whitespace-nowrap hover:underline cursor-pointer"
                    >
                      হাদীস পড়ুন →
                    </button>
                  </div>
                </div>
              )}

              {/* ── CARD BODY (Expanded) ── */}
              {isExpanded && (
                <div className="border-t border-stone-100 dark:border-stone-800 bg-[#FAFBF9] dark:bg-stone-950/40 p-4 sm:p-6 space-y-4">
                  {/* TAB 1: VERSES VIEW */}
                  {currentTab === "verses" && (
                    <div className="space-y-4">
                      {item.verses.map((v, vIdx) => {
                        const isAyahActive =
                          isThisAmalPlaying && activeAyahIndex === vIdx;
                        const isMeaningLoading = loadingAudioKey === `meaning-${item.id}-${v.ayahNumber}`;

                        return (
                          <div
                            key={v.ayahNumber}
                            className={`p-3.5 sm:p-4 rounded-xl transition-all duration-200 border ${
                              isAyahActive
                                ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/40"
                                : "bg-white dark:bg-stone-900 border-stone-200/70 dark:border-stone-800"
                            }`}
                          >
                            {/* Ayah Header, Number & Individual Play Controls */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                আয়াত {v.ayahNumber}
                              </span>

                              {/* Individual Ayah Play Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handlePlaySingleAyahArabic(item, v, vIdx)}
                                  className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95"
                                  title="শুধু এই আয়াত তিলাওয়াত শুনুন"
                                >
                                  <Play className="w-3 h-3 fill-emerald-800 dark:fill-emerald-300" />
                                  <span>তিলাওয়াত</span>
                                </button>

                                <button
                                  onClick={() => handlePlaySingleAyahMeaning(item, v, vIdx)}
                                  className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-950 hover:bg-teal-200 text-teal-800 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95"
                                  title="এই আয়াতের বাংলা অর্থ শুনুন"
                                >
                                  {isMeaningLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-teal-700" />
                                  ) : (
                                    <Volume2 className="w-3 h-3" />
                                  )}
                                  <span>অর্থ</span>
                                </button>
                              </div>
                            </div>

                            {/* Arabic Uthmani Script */}
                            <p
                              dir="rtl"
                              className="font-hafizi-quran text-xl sm:text-2xl text-right leading-loose text-emerald-950 dark:text-emerald-100 my-2"
                            >
                              {v.arabic}
                            </p>

                            {/* Pronunciation & Meaning */}
                            <div className="space-y-1 text-xs pt-2 border-t border-stone-100 dark:border-stone-800/60">
                              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                                <span className="font-bold text-stone-500 mr-1">উচ্চারণ:</span>
                                {v.transliteration}
                              </p>
                              <p className="text-slate-700 dark:text-stone-300 leading-relaxed">
                                <span className="font-bold text-stone-500 mr-1">অর্থ:</span>
                                {v.bengali}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: DEDICATED FAZILAT & RULES VIEW */}
                  {currentTab === "fazilat" && (
                    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-6 border border-amber-200 dark:border-amber-900/60 space-y-4">
                      {/* Top Header of Fazilat Section */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            <BookOpen className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-100">
                              {item.titleBn} — সহীহ হাদীসের ফযিলত ও আমলবিধি
                            </h3>
                            <p className="text-xs text-slate-500 font-hafizi-quran">{item.titleAr}</p>
                          </div>
                        </div>

                        {/* Listen to Fazilat Audio Button */}
                        <button
                          onClick={() => handlePlayFazilatAudio(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>ফযিলতের অডিও শুনুন</span>
                        </button>
                      </div>

                      {/* Timing & Repetition Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                          <p className="text-amber-800 dark:text-amber-300 font-bold mb-0.5">কখন পড়তে হবে:</p>
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.timingBadge}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-0.5">পড়ার সংখ্যা ও পরিমাণ:</p>
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.repetition}
                          </p>
                        </div>
                      </div>

                      {/* Rules of Recitation */}
                      <div className="space-y-1.5 text-xs">
                        <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>আমলবিধি ও পড়ার সুন্নাত নিয়ম:</span>
                        </h4>
                        <p className="text-slate-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 font-medium">
                          {item.rulesOfRecitation}
                        </p>
                      </div>

                      {/* Detailed Authentic Hadith Proofs */}
                      <div className="space-y-1.5 text-xs">
                        <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>সহীহ হাদীসের দলিল ও বরকত:</span>
                        </h4>
                        <div className="text-slate-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-2 whitespace-pre-line font-medium text-xs sm:text-[13px]">
                          {item.virtueDetails}
                        </div>
                      </div>

                      {/* Bottom Action: Switch to Verses or Start Tilawat */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        <button
                          onClick={() => handlePlaySingleAmal(item)}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>এই আমলের তিলাওয়াত শুরু করুন</span>
                        </button>
                        <button
                          onClick={() => setCardActiveTab(item.id, "verses")}
                          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs cursor-pointer"
                        >
                          আয়াত ও অর্থ দেখুন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </main>

      {/* ── FAZILAT & RULES MODAL / DRAWER (Zero sparkles) ── */}
      {fazilatModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {fazilatModalItem.titleBn} — ফযিলত ও পড়ার নিয়ম
                  </h3>
                  <p className="text-xs text-slate-500 font-hafizi-quran">{fazilatModalItem.titleAr}</p>
                </div>
              </div>
              <button
                onClick={() => setFazilatModalItem(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action in Modal: Listen to Fazilat */}
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                মিষ্টি কণ্ঠে ফযিলত শুনুন
              </span>
              <button
                onClick={() => handlePlayFazilatAudio(fazilatModalItem)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>ফযিলতের অডিও</span>
              </button>
            </div>

            {/* When to read & repetition */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                <p className="text-slate-400 font-bold mb-0.5">কখন পড়তে হবে</p>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {fazilatModalItem.timingBadge}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                <p className="text-slate-400 font-bold mb-0.5">পড়ার সংখ্যা</p>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {fazilatModalItem.repetition}
                </p>
              </div>
            </div>

            {/* Recitation Etiquette & Rules */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>আমলবিধি ও পড়ার নিয়ম:</span>
              </h4>
              <p className="text-slate-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                {fazilatModalItem.rulesOfRecitation}
              </p>
            </div>

            {/* Hadith Proof Details */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>সহীহ হাদীসের ফযিলত ও দলিল:</span>
              </h4>
              <div className="text-slate-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 space-y-2 whitespace-pre-line font-medium">
                {fazilatModalItem.virtueDetails}
              </div>
            </div>

            <button
              onClick={() => {
                setFazilatModalItem(null);
                handlePlaySingleAmal(fazilatModalItem);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>এই আমলের তিলাওয়াত শুরু করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE MIC PRACTICE MODAL / OVERLAY ── */}
      {isMicListening && activeMicItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-emerald-950 to-teal-950 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 text-center space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600">
                লাইভ ভয়েস মাশক
              </span>
              <button
                onClick={stopMic}
                className="p-1 rounded-full hover:bg-white/10 text-emerald-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-amber-300">
                {activeMicItem.titleBn}
              </h3>
              <p className="text-xs text-emerald-200">
                ক্বারীর সুর মনে রেখে মুখে মুখে স্পষ্ট উচ্চারণে পড়ুন
              </p>
            </div>

            {/* Dynamic Volume Visualizer Ring */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl transition-all duration-75"
                style={{ transform: `scale(${1 + micVolume / 70})` }}
              />
              <div
                className="w-24 h-24 rounded-full bg-emerald-700 flex items-center justify-center shadow-lg transition-transform duration-75"
                style={{ transform: `scale(${1 + micVolume / 150})` }}
              >
                <Mic className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <p className="text-xs font-semibold text-emerald-300">
              ভয়েস লেভেল: {micVolume}%
            </p>

            <button
              onClick={stopMic}
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              মাশক সমাপ্ত করুন
            </button>
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM AUDIO PLAYER BAR (Desktop & Mobile) ── */}
      {playbackStatus !== "idle" && activeAmalData && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-t border-emerald-300 dark:border-emerald-800 shadow-2xl p-3 sm:p-4 animate-slideUp">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {playbackType === "bangla_meaning" ? "অর্থ" : playbackType === "fazilat" ? "ফযিলত" : "আরবী"}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-emerald-100">
                  {activeAmalData.titleBn}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-emerald-300">
                  {playbackType === "bangla_meaning"
                    ? `বাংলা অর্থ • আয়াত ${activeAyahIndex + 1}/${activeAmalData.totalVerses}`
                    : playbackType === "fazilat"
                    ? "ফযিলতের অডিও বিবরণ"
                    : `আয়াত ${activeAyahIndex + 1}/${activeAmalData.totalVerses} • ক্বারী: ${SHAYKH_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn || selectedQari}`}
                </p>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipPrev}
                className="p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                title="পূর্ববর্তী আয়াত"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlayPause}
                className="p-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                {playbackStatus === "playing" ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
              </button>

              <button
                onClick={handleSkipNext}
                className="p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                title="পরবর্তী আয়াত"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Close / Stop */}
            <button
              onClick={stopAllAudio}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="প্লেয়ার বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
