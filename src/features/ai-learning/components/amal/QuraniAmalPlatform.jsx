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
  Repeat,
  SlidersHorizontal,
  HelpCircle,
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
import {
  getActiveArabicWordDetails,
  splitArabicAyahWords,
  getWordStartTimeSec,
} from "@/lib/quran/quran-audio-timing";
import { toast } from "sonner";

export default function QuraniAmalPlatform({ _onLaunchQuranReader }) {
  // Category & Filter state
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmalIds, setSelectedAmalIds] = useState(
    QURANI_AMAL_ITEMS.map((item) => item.id)
  );

  // Global & Card Display Modes: 'mushaf' (আয়াতভিত্তিক) | 'meaning' (অর্থভিত্তিক আয়াত) | 'fazilat' (ফযিলত ভিউ)
  const [globalDisplayMode, setGlobalDisplayMode] = useState("mushaf");
  const [cardTabState, setCardTabState] = useState({}); // { [amalId]: 'mushaf' | 'meaning' | 'fazilat' }

  // Active View / Modal state
  const [expandedAmalId, setExpandedAmalId] = useState("fatiha"); // Default first expanded
  const [fazilatModalItem, setFazilatModalItem] = useState(null);
  const [activeMicItem, setActiveMicItem] = useState(null);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Audio Playback State
  const [selectedQari, setSelectedQari] = useState(getActiveShaykhId() || "alafasy");
  const [playbackStatus, setPlaybackStatus] = useState("idle"); // 'idle' | 'playing' | 'paused'
  const [playbackType, setPlaybackType] = useState(null); // 'arabic' | 'bangla_meaning' | 'fazilat'
  const [activeAmalIndex, setActiveAmalIndex] = useState(-1);
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const activeWordIndexRef = useRef(-1);

  // 🔁 Repeat & Multiple Playback Loop State (একাধিক বার ও একটানা বাজানোর নিয়ন্ত্রণ)
  const [repeatCount, setRepeatCount] = useState("1"); // '1' | '3' | '5' | '7' | '11' | '33' | '100' | 'infinite'
  const [currentLoopCycle, setCurrentLoopCycle] = useState(1);
  const repeatCountRef = useRef("1");
  const currentLoopCycleRef = useRef(1);
  // Per-card repeat settings state (সুনির্দিষ্ট সূরায় কতবার পড়া হবে তা নির্ধারণ)
  const [cardRepeatCounts, setCardRepeatCounts] = useState({});

  const getCardRepeatCount = (itemId) => {
    return cardRepeatCounts[itemId] || repeatCount || "1";
  };

  // Helper to extract numeric repetition from text (e.g. "৩ বার" -> 3, "৭ বার" -> 7)
  const extractRepetitionNumber = (repText) => {
    if (!repText) return 1;
    if (repText.includes("১০০")) return 100;
    if (repText.includes("৩৩")) return 33;
    if (repText.includes("১১")) return 11;
    if (repText.includes("৭")) return 7;
    if (repText.includes("৫")) return 5;
    if (repText.includes("৩")) return 3;
    return 1;
  };

  const handleRepeatCountChange = (newCount) => {
    const val = String(newCount);
    repeatCountRef.current = val;
    setRepeatCount(val);
    const label =
      val === "infinite"
        ? "একটানা অসীম লুপ (Continuous Loop)"
        : `${val} বার পুনরাবৃত্তি (Repeat ${val}x)`;
    toast.success(`পুনরাবৃত্তি সংখ্যা নির্ধারণ: ${label}`);
  };

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

  // Helper to get active tab for a card: 'mushaf' | 'meaning' | 'fazilat'
  const getCardActiveTab = (itemId) => {
    if (cardTabState[itemId]) return cardTabState[itemId];
    return globalDisplayMode;
  };

  const setCardActiveTab = (itemId, tab) => {
    setCardTabState((prev) => ({ ...prev, [itemId]: tab }));
  };

  const handleGlobalDisplayModeChange = (mode) => {
    setGlobalDisplayMode(mode);
    setCardTabState({});
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
      audioPlayerRef.current.ontimeupdate = null;
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.onloadedmetadata = null;
    }

    isPlayingRef.current = false;
    setPlaybackStatus("idle");
    setPlaybackType(null);
    setActiveAmalIndex(-1);
    setActiveAyahIndex(0);
    setActiveWordIndex(-1);
    activeWordIndexRef.current = -1;
    setLoadingAudioKey(null);
    playlistQueueRef.current = [];
    currentQueueStepRef.current = 0;
    currentLoopCycleRef.current = 1;
    setCurrentLoopCycle(1);
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
      const isInfinite = repeatCountRef.current === "infinite";
      const targetRepeat = isInfinite ? Infinity : Number(repeatCountRef.current || 1);

      // 🔁 Loop Check: If more repeat cycles remain, restart the queue from the beginning!
      if (currentLoopCycleRef.current < targetRepeat) {
        currentLoopCycleRef.current += 1;
        setCurrentLoopCycle(currentLoopCycleRef.current);
        const cycleLabel = isInfinite
          ? `চক্র ${currentLoopCycleRef.current}`
          : `চক্র ${currentLoopCycleRef.current}/${targetRepeat}`;
        toast.info(`🔁 পুনরাবৃত্তি: ${cycleLabel} শুরু হচ্ছে...`);

        setTimeout(() => {
          if (!isPlayingRef.current) return;
          playQueueStep(0);
        }, 500);
        return;
      }

      stopAllAudio();
      const completedMsg = targetRepeat > 1
        ? `মাশাআল্লাহ! সফলভাবে ${targetRepeat} বার তিলাওয়াত সম্পন্ন হয়েছে।`
        : "মাশাআল্লাহ! নির্বাচিত তিলাওয়াত সমাপ্ত হয়েছে।";
      toast.success(completedMsg);
      return;
    }

    currentQueueStepRef.current = stepIndex;
    const task = queue[stepIndex];
    setActiveAmalIndex(task.amalIndex);
    setActiveAyahIndex(task.ayahIndex);
    const initialWord = task.startWordIdx && task.startWordIdx > 0 ? task.startWordIdx : 0;
    activeWordIndexRef.current = initialWord;
    setActiveWordIndex(initialWord);
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

      // Extract / split words for real-time word-by-word tracking
      const cleanWords = task.words && task.words.length > 0
        ? task.words
        : splitArabicAyahWords(task.arabic || "");

      // Real-time word-by-word tracking synchronized with EveryAyah / QuranCDN
      audio.ontimeupdate = () => {
        if (!isPlayingRef.current || !audioPlayerRef.current) return;
        const { currentTime, duration } = audio;
        if (!duration || isNaN(duration)) return;

        const details = getActiveArabicWordDetails({
          currentTime,
          duration,
          surahNumber: task.surahNumber,
          ayahNumber: task.ayahNumber,
          qariId: selectedQari,
          words: cleanWords,
        });

        if (details && details.wordIndex !== activeWordIndexRef.current && details.wordIndex >= 0) {
          activeWordIndexRef.current = details.wordIndex;
          setActiveWordIndex(details.wordIndex);
        }
      };

      const handleLoadedMeta = () => {
        if (task.startWordIdx && task.startWordIdx > 0) {
          const dur = audio.duration || 0;
          const seekTime = getWordStartTimeSec({
            surahNumber: task.surahNumber,
            ayahNumber: task.ayahNumber,
            wordIndex: task.startWordIdx,
            qariId: selectedQari,
            duration: dur,
            words: cleanWords,
          });
          try {
            audio.currentTime = seekTime;
          } catch {}
        }
      };

      if (audio.readyState >= 1) {
        handleLoadedMeta();
      } else {
        audio.onloadedmetadata = handleLoadedMeta;
      }

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
        activeWordIndexRef.current = -1;
        setActiveWordIndex(-1);
        playQueueStep(stepIndex + 1);
      };
      audio.onerror = () => {
        if (!isPlayingRef.current) return;
        setLoadingAudioKey(null);
        activeWordIndexRef.current = -1;
        setActiveWordIndex(-1);
        playQueueStep(stepIndex + 1);
      };
    } else if (task.type === "bangla_meaning") {
      // Natural Bengali Neural TTS via /api/ai/tts
      const textToSpeak = task.text;
      const storedEngine = typeof window !== "undefined" ? (localStorage.getItem("rahmania_bangla_voice_engine") || "engine-2") : "engine-2";
      const storedElVoice = typeof window !== "undefined" ? (localStorage.getItem("rahmania_bangla_el_voice") || "brian") : "brian";
      const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(textToSpeak)}&engine=${encodeURIComponent(storedEngine)}&elVoice=${encodeURIComponent(storedElVoice)}&v=studio-v14`;
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

  // Start Playing An Entire Single Amal (Arabic) - Supports Custom / Multiple Repeat Counts
  const handlePlaySingleAmal = (amalItem, specificRepeat = null) => {
    stopAllAudio();
    if (specificRepeat !== null && specificRepeat !== undefined) {
      repeatCountRef.current = String(specificRepeat);
      setRepeatCount(String(specificRepeat));
    }
    currentLoopCycleRef.current = 1;
    setCurrentLoopCycle(1);

    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    const queue = amalItem.verses.map((v, vIdx) => ({
      type: "arabic",
      amalId: amalItem.id,
      amalIndex: globalIdx,
      ayahIndex: vIdx,
      surahNumber: amalItem.surahNumber,
      ayahNumber: v.ayahNumber,
      arabic: v.arabic,
      words: splitArabicAyahWords(v.arabic),
      startWordIdx: 0,
      audioKey: `arabic-${amalItem.id}-${v.ayahNumber}`,
      title: `${amalItem.titleBn} (আয়াত ${v.ayahNumber})`,
    }));

    playlistQueueRef.current = queue;
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);

    const count = specificRepeat !== null ? String(specificRepeat) : repeatCountRef.current;
    const countLabel =
      count === "infinite"
        ? " (একটানা লুপ)"
        : Number(count) > 1
        ? ` (${count} বার পুনরাবৃত্তি)`
        : "";
    toast.info(`সূরা ${amalItem.titleBn} তিলাওয়াত শুরু হয়েছে${countLabel}`);
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

  // Play SINGLE Ayah Arabic Audio - Supports Custom / Multiple Repeat Counts
  const handlePlaySingleAyahArabic = (amalItem, verse, vIdx, specificRepeat = null, startWord = 0) => {
    stopAllAudio();
    if (specificRepeat !== null && specificRepeat !== undefined) {
      repeatCountRef.current = String(specificRepeat);
      setRepeatCount(String(specificRepeat));
    }
    currentLoopCycleRef.current = 1;
    setCurrentLoopCycle(1);

    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    playlistQueueRef.current = [
      {
        type: "arabic",
        amalId: amalItem.id,
        amalIndex: globalIdx,
        ayahIndex: vIdx,
        surahNumber: amalItem.surahNumber,
        ayahNumber: verse.ayahNumber,
        arabic: verse.arabic,
        words: splitArabicAyahWords(verse.arabic),
        startWordIdx: startWord,
        audioKey: `arabic-${amalItem.id}-${verse.ayahNumber}`,
        title: `${amalItem.titleBn} - আয়াত ${verse.ayahNumber}`,
      },
    ];
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);
    const count = specificRepeat !== null ? String(specificRepeat) : repeatCountRef.current;
    const countLabel = count === "infinite" ? " (একটানা লুপ)" : Number(count) > 1 ? ` (${count} বার)` : "";
    toast.info(`${amalItem.titleBn} - আয়াত ${verse.ayahNumber} তিলাওয়াত শুরু${countLabel}`);
  };

  // Play from a specific word in an Amal (for Mushaf / আয়াতভিত্তিক View)
  const handlePlayFromWord = (amalItem, verse, vIdx, wordIdx, words) => {
    stopAllAudio();
    const globalIdx = QURANI_AMAL_ITEMS.findIndex((i) => i.id === amalItem.id);
    const remainingVerses = amalItem.verses.slice(vIdx);
    const queue = remainingVerses.map((v, relIdx) => {
      const wList = relIdx === 0 && words && words.length > 0 ? words : splitArabicAyahWords(v.arabic);
      return {
        type: "arabic",
        amalId: amalItem.id,
        amalIndex: globalIdx,
        ayahIndex: vIdx + relIdx,
        surahNumber: amalItem.surahNumber,
        ayahNumber: v.ayahNumber,
        arabic: v.arabic,
        words: wList,
        startWordIdx: relIdx === 0 ? wordIdx : 0,
        audioKey: `arabic-${amalItem.id}-${v.ayahNumber}`,
        title: `${amalItem.titleBn} (আয়াত ${v.ayahNumber})`,
      };
    });

    playlistQueueRef.current = queue;
    currentLoopCycleRef.current = 1;
    setCurrentLoopCycle(1);
    setExpandedAmalId(amalItem.id);
    playQueueStep(0);
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
    const storedEngine = typeof window !== "undefined" ? (localStorage.getItem("rahmania_bangla_voice_engine") || "engine-2") : "engine-2";
    const storedElVoice = typeof window !== "undefined" ? (localStorage.getItem("rahmania_bangla_el_voice") || "brian") : "brian";
    const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(textToSpeak)}&engine=${encodeURIComponent(storedEngine)}&elVoice=${encodeURIComponent(storedElVoice)}&v=studio-v14`;
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
          arabic: v.arabic,
          words: splitArabicAyahWords(v.arabic),
          startWordIdx: 0,
          audioKey: `arabic-${item.id}-${v.ayahNumber}`,
          title: `${item.titleBn} - আয়াত ${v.ayahNumber}`,
        });
      });
    });

    playlistQueueRef.current = fullQueue;
    currentLoopCycleRef.current = 1;
    setCurrentLoopCycle(1);
    playQueueStep(0);
    const count = repeatCountRef.current;
    const countLabel = count === "infinite" ? " (একটানা লুপ)" : Number(count) > 1 ? ` (${count} বার)` : "";
    toast.success(`${targetItems.length}টি আমলের ধারাবাহিক তিলাওয়াত শুরু হয়েছে${countLabel}`);
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
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#06140D] text-slate-800 dark:text-emerald-50 transition-colors pb-32">
      {/* ── TOP HERO HEADER & CONTROLS ── */}
      <div className="bg-gradient-to-b from-emerald-900 to-teal-950 text-white pt-5 pb-7 px-3 sm:px-6 rounded-b-[2rem] shadow-xl border-b border-emerald-700/40 relative overflow-hidden">
        {/* Subtle Islamic Lattice Background (No Sparkles) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto space-y-3.5 relative z-10">
          {/* Top Row: Title, Quick Badges & Settings Menu Bar */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                <span>কুরআনী আমল</span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  الأَعْمَالُ القُرْآنِيَّة
                </span>
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 shrink-0">
                {QURANI_AMAL_ITEMS.length}টি আমল
              </span>
            </div>

            {/* তিলাওয়াত সেটিংস মেনুবার ও নির্দেশিকা বাটন (Settings Menu Bar) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAudioSettings(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-100 text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-md"
                title="ক্বারী ও তিলাওয়াত সেটিংস পরিবর্তন করুন"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-extrabold text-xs">
                  {SHAYKH_REGISTRY.find((q) => q.id === selectedQari)?.nameBn?.split(" ")?.[0] || "ক্বারী"}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-black border border-amber-400/30">
                  {repeatCount === "infinite" ? "♾️" : `${repeatCount}x`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-200 hover:text-white transition cursor-pointer"
                title="আমল ব্যবহারের নির্দেশিকা"
              >
                <HelpCircle className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Actions & 3-View Switcher (100% Mobile Responsive) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2.5 pt-0.5">
            {/* Play Actions: সকল আমল শুনুন & নির্বাচিত শুনুন */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePlayAllAmal(false)}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>সকল আমল শুনুন</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayAllAmal(true)}
                disabled={selectedAmalIds.length === 0}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 disabled:opacity-40 border border-emerald-500/40 text-emerald-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                <span>নির্বাচিত ({selectedAmalIds.length})</span>
              </button>

              {playbackStatus !== "idle" && (
                <button
                  type="button"
                  onClick={stopAllAudio}
                  className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>থামুন</span>
                </button>
              )}
            </div>

            {/* Global View Switch: আয়াতভিত্তিক (মুসহাফ) vs অর্থভিত্তিক আয়াত vs ফযিলত ভিউ */}
            <div className="inline-flex items-center gap-1 bg-emerald-950/90 border border-emerald-600/50 p-1 rounded-2xl shadow-inner self-stretch sm:self-auto justify-between sm:justify-start">
              {/* ১. আয়াতভিত্তিক (কুরআনের মূল নুসখা/মুসহাফ — শুধু আয়াত, শব্দ-বাই-শব্দ সিঙ্ক ও তিলাওয়াত) */}
              <button
                type="button"
                onClick={() => handleGlobalDisplayModeChange("mushaf")}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  globalDisplayMode === "mushaf"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "text-emerald-200 hover:text-white"
                }`}
                title="শুধুমাত্র কুরআনের নুসখা/মুসহাফ — একটার পর একটা শব্দ শব্দ তিলাওয়াত"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>আয়াতভিত্তিক</span>
              </button>

              {/* ২. অর্থভিত্তিক আয়াত (আরবি + উচ্চারণ + বাংলা অর্থ — ইউজার মার্ককৃত অবস্থান) */}
              <button
                type="button"
                onClick={() => handleGlobalDisplayModeChange("meaning")}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  globalDisplayMode === "meaning"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "text-emerald-200 hover:text-white"
                }`}
                title="আয়াত ও বাংলা অনুবাদসহ বিস্তারিত ভিউ"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>অর্থভিত্তিক<span className="hidden sm:inline"> আয়াত</span></span>
              </button>

              {/* ৩. ফযিলত ভিউ (হাদীসের দলিল ও আমলবিধি) */}
              <button
                type="button"
                onClick={() => handleGlobalDisplayModeChange("fazilat")}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  globalDisplayMode === "fazilat"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "text-emerald-200 hover:text-white"
                }`}
                title="সহীহ হাদিসের ফযিলত ও আমলবিধি"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ফযিলত<span className="hidden sm:inline"> ভিউ</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER TABS (No sparkles) ── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 -mt-4 sm:-mt-5 relative z-20">
        <div className="bg-white dark:bg-[#0D271D] rounded-2xl p-1.5 sm:p-2 shadow-lg border border-stone-200/80 dark:border-[#1B4A37] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QURANI_AMAL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 transition active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 dark:text-emerald-200/80 hover:bg-stone-100 dark:hover:bg-[#143B2C]"
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
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-5 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আমল খুঁজুন... (যেমন: আয়াতুল কুরসী, বাক্বারা, ফালাক্ব, সকাল-সন্ধ্যা)"
            className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white dark:bg-[#0D271D] border border-stone-200 dark:border-[#1B4A37] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={selectAllAmal}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D271D] border border-stone-200 dark:border-[#1B4A37] text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-[#143B2C] transition cursor-pointer text-center whitespace-nowrap shrink-0"
        >
          {selectedAmalIds.length === QURANI_AMAL_ITEMS.length ? "বাছাই মুছুন" : "সবগুলো নির্বাচন করুন"}
        </button>
      </div>

      {/* ── AMAL CARDS FEED ── */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-3.5 sm:space-y-4">
        {filteredItems.map((item, idx) => {
          const isSelected = selectedAmalIds.includes(item.id);
          const isExpanded = expandedAmalId === item.id;
          const isThisAmalPlaying = activeAmalData?.id === item.id && playbackStatus === "playing";
          const currentTab = getCardActiveTab(item.id);

          return (
            <article
              key={item.id}
              className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-[#0D271D] shadow-sm overflow-hidden ${
                isThisAmalPlaying
                  ? "border-amber-400/80 ring-2 ring-amber-400/40 dark:border-amber-400/80 dark:ring-amber-400/30"
                  : isExpanded
                  ? "border-emerald-300 dark:border-[#1B4A37] shadow-md"
                  : "border-stone-200/80 dark:border-[#1B4A37]/70 hover:border-emerald-200 dark:hover:border-emerald-600/50"
              }`}
            >
              {/* Card Header Top */}
              <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
                <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelectAmal(item.id)}
                    className="mt-0.5 sm:mt-1 text-emerald-700 dark:text-emerald-400 hover:scale-110 transition cursor-pointer shrink-0"
                    title={isSelected ? "প্লেলিস্ট থেকে বাদ দিন" : "প্লেলিস্টে যুক্ত করুন"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 dark:text-emerald-700/60" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-[11px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-[#143B2C] text-emerald-800 dark:text-emerald-300">
                        #{idx + 1}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                        {item.titleBn}
                      </h2>
                      <span className="font-hafizi-quran text-sm text-emerald-700 dark:text-emerald-400">
                        ({item.titleAr})
                      </span>
                    </div>

                    {/* Compact metadata line */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-emerald-200/70">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
                        <Sun className="w-3 h-3 text-amber-500" />
                        <span>{item.timingBadge}</span>
                      </span>
                      <span>•</span>
                      <span>{item.totalVerses}টি আয়াত</span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const num = extractRepetitionNumber(item.repetition);
                          setCardRepeatCounts((prev) => ({ ...prev, [item.id]: String(num) }));
                          handlePlaySingleAmal(item, num);
                        }}
                        className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        title={`সুন্নাহ অনুযায়ী ${item.repetition} বাজান`}
                      >
                        সুন্নাহ: {item.repetition}
                      </button>
                    </div>
                  </div>

                  {/* Mobile-only Expand/Collapse Chevron in top row */}
                  <button
                    type="button"
                    onClick={() => setExpandedAmalId(isExpanded ? null : item.id)}
                    className="sm:hidden p-1 rounded-xl text-slate-400 dark:text-emerald-300/70 hover:bg-stone-100 dark:hover:bg-emerald-900/40 transition cursor-pointer shrink-0"
                    title={isExpanded ? "সংকুচিত করুন" : "বিস্তারিত দেখুন"}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Quick Action Controls on Header Right */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 pt-1.5 sm:pt-0 border-t border-stone-100 dark:border-[#1B4A37]/50 sm:border-0">
                  {/* Play Qari Audio with Integrated Repeat / Loop Selector */}
                  <div className="flex-1 sm:flex-initial flex items-center rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white shadow-2xs overflow-hidden transition">
                    <button
                      type="button"
                      onClick={() => handlePlaySingleAmal(item, getCardRepeatCount(item.id))}
                      className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                      title={`এই সূরাটি তিলাওয়াত শুনুন (${getCardRepeatCount(item.id) === "infinite" ? "লুপ" : `${getCardRepeatCount(item.id)}x`})`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>
                        তিলাওয়াত
                        {getCardRepeatCount(item.id) === "infinite"
                          ? " ♾️"
                          : Number(getCardRepeatCount(item.id)) > 1
                          ? ` (${getCardRepeatCount(item.id)}x)`
                          : ""}
                      </span>
                    </button>
                    <select
                      value={getCardRepeatCount(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const val = e.target.value;
                        setCardRepeatCounts((prev) => ({ ...prev, [item.id]: val }));
                        handleRepeatCountChange(val);
                      }}
                      className="bg-emerald-950/90 dark:bg-[#06140E] text-amber-300 hover:bg-black px-1.5 py-1.5 text-[11px] font-black border-l border-emerald-600/70 dark:border-emerald-700/60 focus:outline-none cursor-pointer"
                      title="এই সূরাটি কতবার পড়া হবে নির্বাচন করুন"
                    >
                      <option value="1">১x</option>
                      <option value="3">৩x (সুন্নাহ)</option>
                      <option value="5">৫x</option>
                      <option value="7">৭x (শিফা)</option>
                      <option value="11">১১x</option>
                      <option value="33">৩৩x</option>
                      <option value="100">১০০x</option>
                      <option value="infinite">♾️ লুপ</option>
                    </select>
                  </div>

                  {/* Play Bangla Translation Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayBanglaMeaning(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-[#0A2218] hover:bg-teal-100 dark:hover:bg-[#113526] text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
                    title="বাংলা অর্থ শুনুন"
                  >
                    {loadingAudioKey?.startsWith(`meaning-${item.id}`) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>অর্থ</span>
                  </button>

                  {/* Mic Practice Button */}
                  <button
                    type="button"
                    onClick={() => startMic(item)}
                    className="p-1.5 rounded-xl bg-emerald-100 dark:bg-[#143B2C] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/80 transition cursor-pointer shrink-0"
                    title="মুখে মুখে তিলাওয়াত করুন (মাইক)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Desktop-only Expand / Collapse Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedAmalId(isExpanded ? null : item.id)}
                    className="hidden sm:inline-flex p-1.5 rounded-xl text-slate-400 dark:text-emerald-300/70 hover:bg-stone-100 dark:hover:bg-[#143B2C] transition cursor-pointer shrink-0"
                    title={isExpanded ? "সংকুচিত করুন" : "বিস্তারিত দেখুন"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Active Loop / Repetition Status Banner inside Playing Card */}
              {isThisAmalPlaying && (Number(repeatCount) > 1 || repeatCount === "infinite") && (
                <div className="mx-3.5 sm:mx-6 mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-400/60 dark:border-amber-500/40 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200 animate-pulse shadow-xs">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {repeatCount === "infinite"
                        ? `🔁 একটানা লুপ চলছে — বর্তমান চক্র: ${currentLoopCycle}`
                        : `🔁 পুনরাবৃত্তি তিলাওয়াত চলছে — চক্র ${currentLoopCycle} / ${repeatCount}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRepeatCountChange("1")}
                    className="px-2 py-0.5 rounded-lg bg-amber-200/80 dark:bg-amber-950/80 hover:bg-amber-300 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 text-[10px] font-black transition cursor-pointer"
                    title="পুনরাবৃত্তি বন্ধ করে স্বাভাবিক ১ বার করুন"
                  >
                    লুপ বন্ধ (১x)
                  </button>
                </div>
              )}

              {/* Card Tabs: [ আয়াতভিত্তিক (মুসহাফ) ] vs [ অর্থভিত্তিক আয়াত ] vs [ ফযিলত ও পড়ার নিয়ম ] */}
              <div className="px-3.5 sm:px-5 pb-2">
                <div className="flex items-center gap-1.5 sm:gap-2 border-b border-stone-200/80 dark:border-[#1B4A37]/80 pb-2 overflow-x-auto no-scrollbar">
                  {/* ১. আয়াতভিত্তিক (মুসহাফ) — শুধুমাত্র আয়াত, শব্দ-বাই-শব্দ তিলাওয়াত */}
                  <button
                    type="button"
                    onClick={() => {
                      setCardActiveTab(item.id, "mushaf");
                      setExpandedAmalId(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      currentTab === "mushaf"
                        ? "bg-emerald-100 dark:bg-[#143B2C] text-emerald-900 dark:text-emerald-200 font-extrabold border border-emerald-300 dark:border-emerald-600/50 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-300/70 dark:hover:text-emerald-100"
                    }`}
                    title="কুরআনের মূল নুসখা — শুধুমাত্র আয়াত"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>আয়াতভিত্তিক (মুসহাফ)</span>
                  </button>

                  {/* ২. অর্থভিত্তিক আয়াত — আরবি + উচ্চারণ + বাংলা অর্থ */}
                  <button
                    type="button"
                    onClick={() => {
                      setCardActiveTab(item.id, "meaning");
                      setExpandedAmalId(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      currentTab === "meaning"
                        ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-700/60 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-300/70 dark:hover:text-emerald-100"
                    }`}
                    title="আয়াত ও বাংলা অনুবাদসহ বিস্তারিত ভিউ"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>অর্থভিত্তিক আয়াত ({item.totalVerses})</span>
                  </button>

                  {/* ৩. ফযিলত ও সহীহ হাদীসের দলিল */}
                  <button
                    type="button"
                    onClick={() => {
                      setCardActiveTab(item.id, "fazilat");
                      setExpandedAmalId(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      currentTab === "fazilat"
                        ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-700/60 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-300/70 dark:hover:text-emerald-100"
                    }`}
                    title="সহীহ হাদিসের ফযিলত ও আমলবিধি"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>ফযিলত ও সহীহ দলিল</span>
                  </button>
                </div>
              </div>

              {/* ── CARD BODY (Expanded) ── */}
              {isExpanded && (
                <div className="border-t border-stone-100 dark:border-[#1B4A37]/80 bg-[#FAFBF9] dark:bg-[#071912]/80 p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
                  {/* TAB 1: MUSHAF / শুধুমাত্র আয়াতভিত্তিক ভিউ (কোরআনের মূল নুসখা — কোনো অর্থ ছাড়া খাঁটি পাঠ) */}
                  {currentTab === "mushaf" && (
                    <div className="relative rounded-2xl border-2 border-emerald-800/25 dark:border-[#1B4A37] bg-[#FBF9F4] dark:bg-[#071912] shadow-inner p-3.5 sm:p-6 sm:px-8 space-y-3 sm:space-y-4 overflow-hidden">
                      {/* Decorative Mushaf Corner Accents */}
                      <div className="absolute top-2 left-2 text-emerald-800/20 dark:text-emerald-400/30 text-xs font-serif select-none pointer-events-none">
                        ❖
                      </div>
                      <div className="absolute top-2 right-2 text-emerald-800/20 dark:text-emerald-400/30 text-xs font-serif select-none pointer-events-none">
                        ❖
                      </div>
                      <div className="absolute bottom-2 left-2 text-emerald-800/20 dark:text-emerald-400/30 text-xs font-serif select-none pointer-events-none">
                        ❖
                      </div>
                      <div className="absolute bottom-2 right-2 text-emerald-800/20 dark:text-emerald-400/30 text-xs font-serif select-none pointer-events-none">
                        ❖
                      </div>

                      {/* Bismillah Header (if fromAyah === 1 and not Surah Fatiha where Bismillah is Ayah 1) */}
                      {item.fromAyah === 1 && item.id !== "fatiha" && (
                        <div className="text-center pb-3 border-b border-emerald-900/10 dark:border-emerald-800/40">
                          <p
                            dir="rtl"
                            className="font-hafizi-quran text-xl sm:text-3xl text-emerald-950 dark:text-emerald-200"
                          >
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                          </p>
                        </div>
                      )}

                      {/* Continuous Mushaf Flow of Ayahs */}
                      <div
                        dir="rtl"
                        className="font-hafizi-quran text-xl sm:text-2xl md:text-3xl leading-[2.4] sm:leading-[2.8] md:leading-[3.0] text-right text-emerald-950 dark:text-emerald-50 select-text"
                      >
                        {item.verses.map((v, vIdx) => {
                          const isAyahPlaying = isThisAmalPlaying && activeAyahIndex === vIdx;
                          const words = splitArabicAyahWords(v.arabic);

                          return (
                            <React.Fragment key={v.ayahNumber}>
                              {words.map((word, wIdx) => {
                                const isWordActive =
                                  isAyahPlaying && activeWordIndex === wIdx;

                                return (
                                  <span
                                    key={wIdx}
                                    onClick={() => handlePlayFromWord(item, v, vIdx, wIdx, words)}
                                    className={`inline-block transition-all duration-150 px-1 sm:px-1.5 py-0.5 mx-0.5 rounded-lg cursor-pointer ${
                                      isWordActive
                                        ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300 scale-105"
                                        : isAyahPlaying
                                        ? "text-emerald-900 dark:text-amber-300 font-bold hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                                        : "text-slate-900 dark:text-emerald-100/90 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40"
                                    }`}
                                    title={`শব্দ #${wIdx + 1}: ${word} (ক্লিক করে শুনুন)`}
                                  >
                                    {word}
                                  </span>
                                );
                              })}

                              {/* Ayah End Circle Marker */}
                              <span
                                onClick={() => handlePlaySingleAyahArabic(item, v, vIdx)}
                                className={`inline-flex items-center justify-center min-w-[28px] sm:min-w-[30px] h-6 sm:h-7 px-1 sm:px-1.5 rounded-full border text-[11px] sm:text-xs font-bold font-mono mx-1 sm:mx-1.5 align-middle select-none transition-all cursor-pointer shadow-2xs ${
                                  isAyahPlaying
                                    ? "bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300 scale-110 shadow-xs"
                                    : "border-amber-600/50 dark:border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 hover:scale-105"
                                }`}
                                title={`আয়াত ${v.ayahNumber} (ক্লিক করে শুনুন)`}
                              >
                                ﴿{v.ayahNumber}﴾
                              </span>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Mushaf Interactive Guidance Footer */}
                      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-900/10 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-stone-500 dark:text-emerald-200/70">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          <span>শব্দে বা আয়াতের চিহ্নে ﴿১﴾ ট্যাপ করে শুনুন • ক্বারীর তিলাওয়াত শব্দ অনুযায়ী সিঙ্ক হবে</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlaySingleAmal(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-extrabold text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs shrink-0"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>শুরু থেকে শুনুন</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: অর্থভিত্তিক আয়াত ভিউ (আরবি + উচ্চারণ + বাংলা অর্থ) */}
                  {currentTab === "meaning" && (
                    <div className="space-y-3 sm:space-y-4">
                      {item.verses.map((v, vIdx) => {
                        const isAyahActive =
                          isThisAmalPlaying && activeAyahIndex === vIdx;
                        const isMeaningLoading = loadingAudioKey === `meaning-${item.id}-${v.ayahNumber}`;

                        return (
                          <div
                            key={v.ayahNumber}
                            className={`p-3 sm:p-4 rounded-xl transition-all duration-200 border ${
                              isAyahActive
                                ? "bg-amber-50/90 dark:bg-[#143B2C]/90 border-amber-300 dark:border-amber-400/80 ring-2 ring-amber-400/40"
                                : "bg-white dark:bg-[#071912] border-stone-200/70 dark:border-[#1B4A37]"
                            }`}
                          >
                            {/* Ayah Header, Number & Individual Play Controls */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#143B2C] text-stone-600 dark:text-emerald-300">
                                আয়াত {v.ayahNumber}
                              </span>

                              {/* Individual Ayah Play Buttons */}
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handlePlaySingleAyahArabic(item, v, vIdx)}
                                  className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/70 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95"
                                  title="শুধু এই আয়াত তিলাওয়াত শুনুন"
                                >
                                  <Play className="w-3 h-3 fill-emerald-800 dark:fill-emerald-200" />
                                  <span>তিলাওয়াত</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePlaySingleAyahMeaning(item, v, vIdx)}
                                  className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/70 hover:bg-teal-200 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95"
                                  title="এই আয়াতের বাংলা অর্থ শুনুন"
                                >
                                  {isMeaningLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-teal-700 dark:text-teal-300" />
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
                              className="font-hafizi-quran text-xl sm:text-2xl text-right leading-loose text-emerald-950 dark:text-emerald-50 my-2"
                            >
                              {v.arabic}
                            </p>

                            {/* Pronunciation & Meaning */}
                            <div className="space-y-1 text-xs pt-2 border-t border-stone-100 dark:border-emerald-800/40">
                              <p className="text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                                <span className="font-bold text-stone-500 dark:text-emerald-400/80 mr-1">উচ্চারণ:</span>
                                {v.transliteration}
                              </p>
                              <p className="text-slate-700 dark:text-emerald-100/90 leading-relaxed">
                                <span className="font-bold text-stone-500 dark:text-emerald-400/80 mr-1">অর্থ:</span>
                                {v.bengali}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 3: DEDICATED FAZILAT & RULES VIEW */}
                  {currentTab === "fazilat" && (
                    <div className="bg-white dark:bg-[#071912] rounded-2xl p-3.5 sm:p-6 border border-amber-200 dark:border-amber-600/40 space-y-3 sm:space-y-4">
                      {/* Top Header of Fazilat Section */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-100 dark:border-emerald-800/40 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 sm:p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          </span>
                          <div>
                            <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-emerald-100">
                              {item.titleBn} — সহীহ হাদীসের ফযিলত ও আমলবিধি
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400 font-hafizi-quran">{item.titleAr}</p>
                          </div>
                        </div>

                        {/* Listen to Fazilat Audio Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayFazilatAudio(item)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>ফযিলতের অডিও শুনুন</span>
                        </button>
                      </div>

                      {/* Timing & Repetition Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                          <p className="text-amber-800 dark:text-amber-300 font-bold mb-0.5">কখন পড়তে হবে:</p>
                          <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-amber-100">
                            {item.timingBadge}
                          </p>
                        </div>

                        <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/80 dark:bg-[#0D271D] border border-emerald-200 dark:border-[#1B4A37]">
                          <p className="text-emerald-800 dark:text-emerald-300 font-bold mb-0.5">পড়ার সংখ্যা ও পরিমাণ:</p>
                          <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-emerald-100">
                            {item.repetition}
                          </p>
                        </div>
                      </div>

                      {/* Rules of Recitation */}
                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>আমলবিধি ও পড়ার সুন্নাত নিয়ম:</span>
                        </h4>
                        <p className="text-slate-700 dark:text-emerald-100/90 leading-relaxed bg-stone-50 dark:bg-[#0A2218] p-3 sm:p-3.5 rounded-xl border border-stone-200/80 dark:border-emerald-800/40 font-medium">
                          {item.rulesOfRecitation}
                        </p>
                      </div>

                      {/* Detailed Authentic Hadith Proofs */}
                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>সহীহ হাদীসের দলিল ও বরকত:</span>
                        </h4>
                        <div className="text-slate-700 dark:text-emerald-100/90 leading-relaxed bg-stone-50 dark:bg-[#0A2218] p-3 sm:p-3.5 rounded-xl border border-stone-200/80 dark:border-emerald-800/40 space-y-2 whitespace-pre-line font-medium text-xs sm:text-[13px]">
                          {item.virtueDetails}
                        </div>
                      </div>

                      {/* Bottom Action: Switch to Verses or Start Tilawat */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
                        <button
                          type="button"
                          onClick={() => handlePlaySingleAmal(item)}
                          className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>এই আমলের তিলাওয়াত শুরু করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardActiveTab(item.id, "mushaf")}
                          className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-[#143B2C] text-emerald-800 dark:text-emerald-200 font-bold text-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>আয়াতভিত্তিক (মুসহাফ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardActiveTab(item.id, "meaning")}
                          className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#0D271D] text-stone-700 dark:text-emerald-200 font-bold text-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>অর্থভিত্তিক আয়াত</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#091F17] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-[#1B4A37] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#1B4A37]/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {fazilatModalItem.titleBn} — ফযিলত ও পড়ার নিয়ম
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-400 font-hafizi-quran">{fazilatModalItem.titleAr}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFazilatModalItem(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#143B2C] text-slate-400 dark:text-emerald-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action in Modal: Listen to Fazilat */}
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                মিষ্টি কণ্ঠে ফযিলত শুনুন
              </span>
              <button
                type="button"
                onClick={() => handlePlayFazilatAudio(fazilatModalItem)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>ফযিলতের অডিও</span>
              </button>
            </div>

            {/* When to read & repetition */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0D271D] border border-stone-100 dark:border-[#1B4A37]/60">
                <p className="text-slate-400 dark:text-emerald-400/80 font-bold mb-0.5">কখন পড়তে হবে</p>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
                  {fazilatModalItem.timingBadge}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0D271D] border border-stone-100 dark:border-[#1B4A37]/60">
                <p className="text-slate-400 dark:text-emerald-400/80 font-bold mb-0.5">পড়ার সংখ্যা</p>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
                  {fazilatModalItem.repetition}
                </p>
              </div>
            </div>

            {/* Recitation Etiquette & Rules */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>আমলবিধি ও পড়ার নিয়ম:</span>
              </h4>
              <p className="text-slate-600 dark:text-emerald-100/90 leading-relaxed bg-stone-50 dark:bg-[#0A2218] p-3 rounded-xl border border-stone-100 dark:border-emerald-800/40">
                {fazilatModalItem.rulesOfRecitation}
              </p>
            </div>

            {/* Hadith Proof Details */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>সহীহ হাদীসের ফযিলত ও দলিল:</span>
              </h4>
              <div className="text-slate-700 dark:text-emerald-100/90 leading-relaxed bg-stone-50 dark:bg-[#0A2218] p-3.5 rounded-xl border border-stone-100 dark:border-emerald-800/40 space-y-2 whitespace-pre-line font-medium text-xs sm:text-[13px]">
                {fazilatModalItem.virtueDetails}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFazilatModalItem(null);
                  handlePlaySingleAmal(fazilatModalItem);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>তিলাওয়াত শুরু করুন {repeatCount === "infinite" ? "(♾️ লুপ)" : Number(repeatCount) > 1 ? `(${repeatCount}x)` : ""}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFazilatModalItem(null);
                  handlePlaySingleAmal(fazilatModalItem, extractRepetitionNumber(fazilatModalItem.repetition));
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition active:scale-95 shrink-0"
                title={`সুন্নাহ আমল অনুযায়ী ${fazilatModalItem.repetition} বাজান`}
              >
                <Repeat className="w-4 h-4 text-slate-950" />
                <span>{fazilatModalItem.repetition} বাজান</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TILAWAAT & QARI SETTINGS MODAL (Dedicated Menu Bar Popup) ── */}
      {showAudioSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#091F17] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-[#1B4A37] p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#1B4A37]/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-[#143B2C] text-emerald-800 dark:text-emerald-300">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    তিলাওয়াত ও ক্বারী সেটিংস
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                    ক্বারী নির্বাচন এবং পুনরাবৃত্তির সংখ্যা নির্ধারণ করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioSettings(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#143B2C] text-slate-400 dark:text-emerald-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Qari Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>পছন্দের ক্বারী নির্বাচন করুন:</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#143B2C] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-700/60">
                  বর্তমান: {SHAYKH_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn || selectedQari}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SHAYKH_REGISTRY.map((qari) => {
                  const isCurrent = selectedQari === qari.id;
                  return (
                    <button
                      key={qari.id}
                      type="button"
                      onClick={() => handleQariChange(qari.id)}
                      className={`p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-emerald-50 dark:bg-[#143B2C] border-emerald-500 dark:border-emerald-400 shadow-xs ring-2 ring-emerald-500/20"
                          : "bg-stone-50/70 dark:bg-[#0D271D] border-stone-200/80 dark:border-[#1B4A37] hover:border-emerald-300 dark:hover:border-emerald-500"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {qari.displayTitleBn || qari.nameBn}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 truncate">
                          {qari.styleBn || qari.roleBn}
                        </p>
                      </div>
                      {isCurrent ? (
                        <span className="p-1 rounded-full bg-emerald-600 text-white shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-stone-300 dark:border-emerald-700/60 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Repetition / Loop Count */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-[#1B4A37]/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-amber-500" />
                  <span>পুনরাবৃত্তি / লুপ সংখ্যা:</span>
                </span>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  {repeatCount === "infinite" ? "♾️ একটানা বাজবে" : `${repeatCount} বার বাজবে`}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "1", label: "১ বার", hint: "স্বাভাবিক" },
                  { value: "3", label: "৩ বার", hint: "সুন্নাহ আমল" },
                  { value: "5", label: "৫ বার", hint: "হিফজ" },
                  { value: "7", label: "৭ বার", hint: "শিফা" },
                  { value: "11", label: "১১ বার", hint: "নফল" },
                  { value: "33", label: "৩৩ বার", hint: "তাসবীহ" },
                  { value: "100", label: "১০০ বার", hint: "জিকির" },
                  { value: "infinite", label: "♾️ লুপ", hint: "একটানা" },
                ].map((opt) => {
                  const isCur = repeatCount === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleRepeatCountChange(opt.value)}
                      className={`p-2 rounded-xl border text-center transition active:scale-95 cursor-pointer ${
                        isCur
                          ? "bg-amber-400 text-slate-950 font-black border-amber-500 shadow-xs"
                          : "bg-stone-50 dark:bg-[#0D271D] text-slate-700 dark:text-emerald-200 font-bold border-stone-200 dark:border-[#1B4A37] hover:bg-stone-100 dark:hover:bg-[#143B2C]"
                      }`}
                    >
                      <div className="text-xs font-black">{opt.label}</div>
                      <div className={`text-[9px] ${isCur ? "text-slate-900/80" : "text-slate-400 dark:text-emerald-400/70"}`}>
                        {opt.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/70 leading-normal">
                পছন্দমতো পুনরাবৃত্তি নির্ধারণ করলে যেকোনো সূরা বা আয়াত স্বয়ংক্রিয়ভাবে ততবার পাঠ সম্পন্ন করবে।
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAudioSettings(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                সেটিংস সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INFO & GUIDELINES MODAL (Clean Non-Technical Guide) ── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#091F17] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-[#1B4A37] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#1B4A37]/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    কুরআনী আমল নির্দেশিকা
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                    দৈনন্দিন সুন্নাত ও মাসনূন আমল ব্যবহারের নিয়ম
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#143B2C] text-slate-400 dark:text-emerald-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/70 dark:border-amber-800/60 text-amber-950 dark:text-amber-200">
                <span className="font-extrabold block mb-1">হাদীসের নির্দেশিকা:</span>
                রাসূলুল্লাহ (ﷺ) দৈনন্দিন সকাল-সন্ধ্যায়, ঘুমানোর পূর্বে এবং পাঁচ ওয়াক্ত ফরজ সালাত পরবর্তী সময়ে এই বরকতময় সূরা ও আয়াতগুলো পাঠের বিশেষ তাগিদ দিয়েছেন।
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-emerald-200">
                  ৩টি ভিউ মোডের কার্যপদ্ধতি:
                </h4>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0D271D] border border-stone-200/80 dark:border-[#1B4A37] space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>১. আয়াতভিত্তিক (মুসহাফ):</span>
                  </div>
                  <p className="text-slate-600 dark:text-emerald-100/90 pl-5">
                    অর্থ ছাড়া পবিত্র কুরআনের মূল নুসখা। ক্বারীর তিলাওয়াতের সাথে শব্দ শব্দ হাইলাইট হয়। যেকোনো শব্দে ট্যাপ করে সেখান থেকে সরাসরি তিলাওয়াত শোনা যায়।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0D271D] border border-stone-200/80 dark:border-[#1B4A37] space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-teal-800 dark:text-teal-300">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>২. অর্থভিত্তিক আয়াত:</span>
                  </div>
                  <p className="text-slate-600 dark:text-emerald-100/90 pl-5">
                    আরবি আয়াতের পাশাপাশি বিশুদ্ধ বাংলা উচ্চারণ ও নির্ভরযোগ্য অর্থ। পাশে থাকা স্পিকারে ক্লিক করে বাংলা অডিও শোনা যায়।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0D271D] border border-stone-200/80 dark:border-[#1B4A37] space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>৩. ফযিলত ভিউ:</span>
                  </div>
                  <p className="text-slate-600 dark:text-emerald-100/90 pl-5">
                    সহীহ বুখারী, মুসলিম ও সুনান গ্রন্থসমূহ থেকে সংগৃহীত ফজিলত, রোগমুক্তি (শিফা) এবং আমলবিধির বিস্তারিত বিবরণ।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-[#0D271D] border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  প্লেলিস্ট ও একাধারে শোনা:
                </span>
                <p className="text-emerald-800 dark:text-emerald-300">
                  নির্দিষ্ট কয়েকটি আমল বামপাশের বক্সে মার্ক করে &quot;নির্বাচিত আমল শুনুন&quot; বাটনে ক্লিক করলে তা একের পর এক স্বয়ংক্রিয়ভাবে বাজতে থাকবে।
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                বুঝেছি, আলহামদুলিল্লাহ
              </button>
            </div>
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
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#071912]/95 backdrop-blur-md border-t border-emerald-300 dark:border-[#1B4A37] shadow-2xl p-2 sm:p-4 animate-slideUp">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
            {/* Left: Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 dark:bg-emerald-800 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs shrink-0">
                {playbackType === "bangla_meaning" ? "অর্থ" : playbackType === "fazilat" ? "ফযিলত" : "আরবী"}
              </div>
              <div className="space-y-0.5 min-w-0 max-w-[125px] xs:max-w-[180px] sm:max-w-none">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-emerald-50 truncate">
                  {activeAmalData.titleBn}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-emerald-300/80 truncate">
                  {playbackType === "bangla_meaning"
                    ? `বাংলা অর্থ • আয়াত ${activeAyahIndex + 1}/${activeAmalData.totalVerses}`
                    : playbackType === "fazilat"
                    ? "ফযিলতের অডিও বিবরণ"
                    : `আয়াত ${activeAyahIndex + 1}/${activeAmalData.totalVerses} • ক্বারী: ${SHAYKH_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn || selectedQari}${Number(repeatCount) > 1 ? ` • 🔁 ${currentLoopCycle}/${repeatCount}` : repeatCount === "infinite" ? ` • 🔁 চক্র ${currentLoopCycle}` : ""}`}
                </p>
              </div>
            </div>

            {/* Center Controls & Repeat */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSkipPrev}
                className="p-1 sm:p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-[#143B2C] cursor-pointer"
                title="পূর্ববর্তী আয়াত"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlayPause}
                className="p-2 sm:p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                {playbackStatus === "playing" ? (
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                )}
              </button>

              <button
                type="button"
                onClick={handleSkipNext}
                className="p-1 sm:p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-[#143B2C] cursor-pointer"
                title="পরবর্তী আয়াত"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* 🔁 Live Repeat Selector inside Bottom Player Bar */}
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-emerald-100/90 dark:bg-[#0D271D] border border-emerald-300/80 dark:border-[#1B4A37] shadow-2xs ml-0.5 sm:ml-1">
                <Repeat className="w-3 h-3 text-emerald-800 dark:text-amber-400 shrink-0" />
                <select
                  value={repeatCount}
                  onChange={(e) => handleRepeatCountChange(e.target.value)}
                  className="bg-transparent font-black text-emerald-950 dark:text-emerald-100 text-[10px] sm:text-xs focus:outline-none cursor-pointer"
                  title="পুনরাবৃত্তি সংখ্যা পরিবর্তন করুন"
                >
                  <option value="1" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">১x</option>
                  <option value="3" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">৩x (সুন্নাহ)</option>
                  <option value="5" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">৫x</option>
                  <option value="7" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">৭x (শিফা)</option>
                  <option value="11" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">১১x</option>
                  <option value="33" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">৩৩x</option>
                  <option value="100" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">১০০x</option>
                  <option value="infinite" className="bg-white dark:bg-[#071912] text-slate-900 dark:text-emerald-100">♾️ লুপ</option>
                </select>
                {(Number(repeatCount) > 1 || repeatCount === "infinite") && (
                  <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-700/60 shrink-0">
                    {repeatCount === "infinite" ? `চক্র ${currentLoopCycle}` : `${currentLoopCycle}/${repeatCount}`}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Close / Stop */}
            <button
              type="button"
              onClick={stopAllAudio}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 dark:text-emerald-400/80 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
              title="প্লেয়ার বন্ধ করুন"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
