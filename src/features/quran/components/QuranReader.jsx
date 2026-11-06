"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Bookmark,
  Search,
  Bot,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  List,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SURAHS, JUZ_MAPPING } from "@/lib/quran/quran-meta";
import { getSurahData, getAyahAudioUrl } from "@/lib/quran/quran-service";
import { QARI_REGISTRY, getStoredQariPreference, setStoredQariPreference } from "@/lib/ai/qari-registry";
import {
  HAFIZI_PARAS,
  getParaTotalPages,
  getHafiziGlobalPage,
  getHafiziPageTarget,
  parseHafiziSearchQuery
} from "@/lib/quran/hafizi-pages";
import { useBanglaAudioEngine } from "@/lib/quran/bangla-audio-engine";
import { loadChapterSegments, getActiveArabicWordIndex, splitArabicAyahWords } from "@/lib/quran/quran-audio-timing";
import { universalAudioEngine, audioCache } from "@/lib/quran/audio";

const STORAGE_LAST_READ = "rahmania_quran_last_read_v1";
const STORAGE_BOOKMARKS = "rahmania_quran_bookmarks_v1";
const STORAGE_FONT_SIZE = "rahmania_quran_arabic_size_v1";
const STORAGE_READER_THEME = "rahmania_quran_reader_theme_v1";

export default function QuranReader({ onLaunchNurEngine, onLaunchVoiceTutor, initialSurah = 1 }) {
  // Navigation & Surah State
  const [selectedSurahId, setSelectedSurahId] = useState(initialSurah);
  const [surahData, setSurahData] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'meccan' | 'medinan' | 'popular' | 'juz'
  const [selectedJuz, setSelectedJuz] = useState(1);
  const [isSurahDrawerOpen, setIsSurahDrawerOpen] = useState(false);

  // View & Typography Options
  const [viewMode, setViewMode] = useState("ayah"); // 'ayah' | 'mushaf'
  const [arabicFontSize, setArabicFontSize] = useState(28); // 20 to 44 px
  const [showBengali, setShowBengali] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [enableTajweedColors, setEnableTajweedColors] = useState(true);
  const [readerTheme, setReaderTheme] = useState("day"); // 'day' (kids/warm) | 'night' (dark sanctuary)

  // Audio Player State
  const [selectedQari, setSelectedQari] = useState(QARI_REGISTRY[1].id); // Default Alafasy
  const [playingAyahNumber, setPlayingAyahNumber] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState("none"); // 'none' | '1x' | '3x' | 'surah'
  const [repeatCounter, setRepeatCounter] = useState(0);
  const audioRef = useRef(null);

  // Synchronized Mutable Refs to guarantee zero stale closures in audio event handlers
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const repeatCounterRef = useRef(0);
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const playingAyahRef = useRef(playingAyahNumber);
  playingAyahRef.current = playingAyahNumber;
  const surahDataRef = useRef(surahData);
  surahDataRef.current = surahData;
  const selectedQariRef = useRef(selectedQari);
  selectedQariRef.current = selectedQari;
  const selectedSurahIdRef = useRef(selectedSurahId);
  selectedSurahIdRef.current = selectedSurahId;

  // Bookmarks & Word Breakdown Modal
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [wordModalAyah, setWordModalAyah] = useState(null);

  // Hafizi Quran Selection State
  const [hafiziPara, setHafiziPara] = useState(1);
  const [hafiziPage, setHafiziPage] = useState(1);
  const [pendingScrollAyah, setPendingScrollAyah] = useState(null);

  // Universal Authentic Human Male Bengali Audio Engine
  const {
    currentId: playingBanglaId,
    isLoading: isBanglaLoading,
    activeWordIndex: activeBanglaWordIndex,
    toggle: toggleBanglaAudio,
    stop: stopBanglaAudio,
  } = useBanglaAudioEngine();

  const handleToggleBangla = (text, id) => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
    toggleBanglaAudio(text, id);
  };

  // Audio unmount cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      stopBanglaAudio();
    };
  }, [stopBanglaAudio]);

  // Pre-load QuranCDN millisecond-accurate word timing segments for active Surah & Qari
  useEffect(() => {
    if (selectedSurahId) {
      loadChapterSegments(selectedSurahId, selectedQari);
    }
  }, [selectedSurahId, selectedQari]);

  const hafiziSearchMatch = useMemo(() => {
    return parseHafiziSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleJumpToHafiziPage = (paraNum, pageNum) => {
    const target = getHafiziPageTarget(paraNum, pageNum);
    setSelectedSurahId(target.surah);
    setPendingScrollAyah(target.ayah);
    setIsSurahDrawerOpen(false);
    stopAudio();
    toast.success(`হাফেজী পারা ${paraNum}, পৃষ্ঠা ${pageNum} — সূরা ${ALL_SURAHS.find((s) => s.id === target.surah)?.nameBn || target.surah}, আয়াত ${target.ayah}`);
  };

  useEffect(() => {
    if (pendingScrollAyah && !isLoadingSurah && surahData) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`ayah-${pendingScrollAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setPendingScrollAyah(null);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pendingScrollAyah, isLoadingSurah, surahData]);

  // Auto-scroll active reciting Ayah smoothly into view
  useEffect(() => {
    if (playingAyahNumber && !isLoadingSurah) {
      const scrollTimer = setTimeout(() => {
        const el =
          document.getElementById(`mushaf-ayah-${playingAyahNumber}`) ||
          document.getElementById(`ayah-${playingAyahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 120);
      return () => clearTimeout(scrollTimer);
    }
  }, [playingAyahNumber, viewMode, isLoadingSurah]);

  // Load Preferences & Bookmarks
  useEffect(() => {
    try {
      const qari = getStoredQariPreference();
      if (qari) setSelectedQari(qari);

      const savedBm = localStorage.getItem(STORAGE_BOOKMARKS);
      if (savedBm) setBookmarks(JSON.parse(savedBm));

      const savedLr = localStorage.getItem(STORAGE_LAST_READ);
      if (savedLr) setLastRead(JSON.parse(savedLr));

      const savedFs = localStorage.getItem(STORAGE_FONT_SIZE);
      if (savedFs) setArabicFontSize(parseInt(savedFs, 10));

      const savedTheme = localStorage.getItem(STORAGE_READER_THEME);
      if (savedTheme) setReaderTheme(savedTheme);
    } catch {}
  }, []);

  const toggleReaderTheme = () => {
    const next = readerTheme === "day" ? "night" : "day";
    setReaderTheme(next);
    try {
      localStorage.setItem(STORAGE_READER_THEME, next);
    } catch {}
  };

  // Fetch Surah Data
  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setIsLoadingSurah(true);
      try {
        const data = await getSurahData(selectedSurahId);
        if (!isCancelled) {
          setSurahData(data);
          surahDataRef.current = data;
          setIsLoadingSurah(false);
          // If surah changes, reset audio safely
          if (audioRef.current && playingAyahRef.current) {
            try {
              audioRef.current.pause();
            } catch {}
            setIsPlayingAudio(false);
            setPlayingAyahNumber(null);
            playingAyahRef.current = null;
            setActiveWordIndex(0);
          }
          // Update last read
          const lrObj = { surahId: selectedSurahId, surahNameBn: data.bengaliName, timestamp: Date.now() };
          setLastRead(lrObj);
          localStorage.setItem(STORAGE_LAST_READ, JSON.stringify(lrObj));
        }
      } catch (err) {
        if (!isCancelled) {
          setIsLoadingSurah(false);
          toast.error("সূরা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
        }
      }
    }
    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [selectedSurahId]);

  // Forward-declared advance function using fresh refs (immune to stale closures)
  const advanceNextAyah = () => {
    const currentAyah = playingAyahRef.current;
    const currentSurah = surahDataRef.current;
    if (!currentAyah || !currentSurah?.ayahs?.length) return;

    const maxAyahs = currentSurah.ayahs.length;
    if (currentAyah < maxAyahs) {
      startNewAyahAudio(currentAyah + 1);
    } else {
      // Last Ayah of Surah reached
      if (repeatModeRef.current === "surah") {
        startNewAyahAudio(1);
      } else {
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch {}
        }
        setIsPlayingAudio(false);
        setActiveWordIndex(-1);
        setPlayingAyahNumber(null);
        playingAyahRef.current = null;
        toast.success(`মাশাআল্লাহ! সূরা ${currentSurah.bengaliName || currentSurah.name || ""} তিলাওয়াত সমাপ্ত হয়েছে।`);
      }
    }
  };

  const startNewAyahAudio = (ayahNumber) => {
    const currentSurah = surahDataRef.current;
    if (!currentSurah?.ayahs?.length) return;

    universalAudioEngine.stopAll();

    const audioUrl = getAyahAudioUrl(selectedQariRef.current, selectedSurahIdRef.current, ayahNumber);
    audioRef.current = audioCache.getOrCreate(audioUrl);

    // Predictive preload next Ayah
    if (ayahNumber < currentSurah.ayahs.length) {
      universalAudioEngine.preload({
        surahNumber: selectedSurahIdRef.current,
        ayahNumber: ayahNumber + 1,
        qariId: selectedQariRef.current,
      });
    }

    // Reset loop counter on newly selected or advanced Ayah
    repeatCounterRef.current = 0;
    setRepeatCounter(0);

    setPlayingAyahNumber(ayahNumber);
    playingAyahRef.current = ayahNumber;
    setActiveWordIndex(0);

    stopBanglaAudio();

    try {
      audioRef.current.pause();
    } catch {}

    audioRef.current.src = audioUrl;
    audioRef.current.defaultPlaybackRate = playbackSpeedRef.current;
    audioRef.current.playbackRate = playbackSpeedRef.current;

    // Preserving playbackRate on media events
    audioRef.current.oncanplay = () => {
      if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;
    };
    audioRef.current.onplay = () => {
      if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;
    };

    // Precise word-by-word tracking during playback (QuranCDN Millisecond Segments + Tajweed Pacing)
    audioRef.current.ontimeupdate = () => {
      if (!audioRef.current) return;
      const { currentTime, duration } = audioRef.current;
      if (!duration || isNaN(duration)) return;

      const currentAyahObj = surahDataRef.current?.ayahs?.find((a) => a.numberInSurah === ayahNumber);
      if (!currentAyahObj) return;

      const words = splitArabicAyahWords(
        currentAyahObj.words && currentAyahObj.words.length > 0
          ? currentAyahObj.words
          : currentAyahObj.text
      );

      const computedIndex = getActiveArabicWordIndex({
        currentTime,
        duration,
        surahNumber: selectedSurahId,
        ayahNumber,
        qariId: selectedQari,
        words,
      });

      setActiveWordIndex(computedIndex);
    };

    // Playback with safe promise handling
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
          if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("Audio playback interrupted or failed:", err);
            setIsPlayingAudio(false);
          }
        });
    }

    // Dynamic onended using synchronized refs (100% immune to stale closures)
    audioRef.current.onended = () => {
      const mode = repeatModeRef.current;
      if (mode === "1x") {
        if (repeatCounterRef.current < 1) {
          repeatCounterRef.current += 1;
          setRepeatCounter(1);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.playbackRate = playbackSpeedRef.current;
            audioRef.current.play().catch(() => {});
          }
        } else {
          repeatCounterRef.current = 0;
          setRepeatCounter(0);
          setRepeatMode("none");
          repeatModeRef.current = "none";
          advanceNextAyah();
        }
      } else if (mode === "3x") {
        if (repeatCounterRef.current < 2) {
          repeatCounterRef.current += 1;
          setRepeatCounter(repeatCounterRef.current);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.playbackRate = playbackSpeedRef.current;
            audioRef.current.play().catch(() => {});
          }
        } else {
          repeatCounterRef.current = 0;
          setRepeatCounter(0);
          setRepeatMode("none");
          repeatModeRef.current = "none";
          advanceNextAyah();
        }
      } else {
        advanceNextAyah();
      }
    };
  };

  // Audio player handler
  const playAyahAudio = (ayahNumber) => {
    // If clicking on currently active Ayah: toggle pause or resume
    if (playingAyahRef.current === ayahNumber) {
      if (isPlayingAudio) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
        }
        return;
      } else if (audioRef.current && audioRef.current.src) {
        audioRef.current.playbackRate = playbackSpeedRef.current;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingAudio(true);
              if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;
            })
            .catch(() => {
              startNewAyahAudio(ayahNumber);
            });
        }
        return;
      }
    }

    startNewAyahAudio(ayahNumber);
  };

  // Toggle Play / Pause on currently active Ayah
  const togglePlayPauseAudio = () => {
    if (!playingAyahRef.current) {
      startNewAyahAudio(1);
      return;
    }
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    } else {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.playbackRate = playbackSpeedRef.current;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingAudio(true);
              if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;
            })
            .catch(() => {
              startNewAyahAudio(playingAyahRef.current);
            });
        }
      } else {
        startNewAyahAudio(playingAyahRef.current);
      }
    }
  };

  // Explicitly close player bar and reset
  const closePlayerBar = () => {
    universalAudioEngine.stopAll();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
    playingAyahRef.current = null;
    setActiveWordIndex(-1);
    repeatCounterRef.current = 0;
    setRepeatCounter(0);
  };

  const stopAudio = closePlayerBar;

  // Change playback speed with immediate application
  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
    playbackSpeedRef.current = newSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
      audioRef.current.defaultPlaybackRate = newSpeed;
    }
    toast.info(`তিলাওয়াতের গতি: ${newSpeed}x`);
  };

  const handleQariChange = (qariId) => {
    setSelectedQari(qariId);
    selectedQariRef.current = qariId;
    setStoredQariPreference(qariId);
    if (isPlayingAudio && playingAyahRef.current) {
      startNewAyahAudio(playingAyahRef.current);
    }
  };

  const toggleBookmark = (surahId, ayahNumber) => {
    const key = `${surahId}:${ayahNumber}`;
    let updated;
    if (bookmarks.some((b) => b.key === key)) {
      updated = bookmarks.filter((b) => b.key !== key);
      toast.info("বুকমার্ক সরানো হয়েছে");
    } else {
      updated = [
        ...bookmarks,
        {
          key,
          surahId,
          ayahNumber,
          surahNameBn: surahData?.bengaliName || `সূরা ${surahId}`,
          createdAt: Date.now()
        }
      ];
      toast.success("আয়াতটি বুকমার্কে সংরক্ষিত হয়েছে!");
    }
    setBookmarks(updated);
    try {
      localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(updated));
    } catch {}
  };

  const changeFontSize = (delta) => {
    const nextSize = Math.min(46, Math.max(20, arabicFontSize + delta));
    setArabicFontSize(nextSize);
    try {
      localStorage.setItem(STORAGE_FONT_SIZE, String(nextSize));
    } catch {}
  };

  // Filtered Surahs List
  const filteredSurahs = useMemo(() => {
    return ALL_SURAHS.filter((s) => {
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNameBn = s.nameBn.toLowerCase().includes(q);
        const matchNameEn = s.nameEn.toLowerCase().includes(q);
        const matchNameAr = s.nameAr.includes(q);
        const matchId = String(s.id) === q;
        if (!matchNameBn && !matchNameEn && !matchNameAr && !matchId) return false;
      }
      // Filter tab
      if (activeFilter === "meccan") return s.type === "Meccan";
      if (activeFilter === "medinan") return s.type === "Medinan";
      if (activeFilter === "popular") return [1, 2, 18, 36, 55, 56, 67, 112, 113, 114].includes(s.id);
      if (activeFilter === "juz") return s.juz === selectedJuz;
      return true;
    });
  }, [searchQuery, activeFilter, selectedJuz]);

  const currentSurahMeta = ALL_SURAHS.find((s) => s.id === selectedSurahId) || ALL_SURAHS[0];
  const isDay = readerTheme === "day";

  return (
    <div className={`flex flex-col min-h-screen ${isDay ? "bg-[#FAF7F2] text-slate-900" : "bg-[#071510] text-slate-100"} ${playingAyahNumber !== null ? "pb-28" : "pb-12"} transition-colors duration-200`}>
      {/* ── TOP CONTROL BAR ── */}
      <div className={`sticky top-16 z-20 ${isDay ? "bg-[#FAF7F2]/95 border-b border-amber-200/80 shadow-xs" : "bg-[#091f16]/95 border-b border-emerald-900/60"} backdrop-blur-md px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5`}>
        {/* Left: Surah Selector Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSurahDrawerOpen(true)}
            className={`px-3 sm:px-3.5 py-2 rounded-2xl ${isDay ? "bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs" : "bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-white shadow-sm"} font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer`}
          >
            <BookOpen className={`w-4 h-4 ${isDay ? "text-emerald-700" : "text-emerald-400"}`} />
            <span className={`font-extrabold ${isDay ? "text-emerald-950" : "text-emerald-200"}`}>
              {currentSurahMeta.id}. {currentSurahMeta.nameBn}
            </span>
            <span className={`font-hafizi-quran text-sm ${isDay ? "text-emerald-800" : "text-emerald-300"} mr-1`}>
              ({currentSurahMeta.nameAr})
            </span>
            <span className={`text-[10px] ${isDay ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-emerald-950 text-emerald-400 border-emerald-800"} px-2 py-0.5 rounded-full border font-bold hidden xs:inline`}>
              সূরা তালিকা
            </span>
          </button>

          {/* Quick Prev / Next Surah */}
          <div className="flex items-center gap-1">
            <button
              disabled={selectedSurahId <= 1}
              onClick={() => setSelectedSurahId((s) => Math.max(1, s - 1))}
              className={`p-2 rounded-xl ${isDay ? "bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs" : "bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300"} disabled:opacity-40 transition cursor-pointer`}
              title="পূর্ববর্তী সূরা"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={selectedSurahId >= 114}
              onClick={() => setSelectedSurahId((s) => Math.min(114, s + 1))}
              className={`p-2 rounded-xl ${isDay ? "bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs" : "bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300"} disabled:opacity-40 transition cursor-pointer`}
              title="পরবর্তী সূরা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Reciter Selection */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isDay ? "text-stone-600" : "text-slate-400"} hidden sm:inline`}>ক্বারী:</span>
          <select
            value={selectedQari}
            onChange={(e) => handleQariChange(e.target.value)}
            className={`${isDay ? "bg-white text-emerald-950 border border-emerald-300 shadow-2xs" : "bg-emerald-950/90 text-emerald-200 border border-emerald-800/70"} rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500`}
          >
            {QARI_REGISTRY.map((qari) => (
              <option key={qari.id} value={qari.id} className="bg-white text-slate-900">
                {qari.displayTitleBn} ({qari.styleBn})
              </option>
            ))}
          </select>
        </div>

        {/* Right: View, Font Zoom & Day/Night Toggle Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day / Night Theme Toggle */}
          <button
            type="button"
            onClick={toggleReaderTheme}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 ${
              isDay
                ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 font-black"
                : "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-300"
            }`}
            title="দিনের আরামদায়ক আলো ও রাতের মোড পরিবর্তন করুন"
          >
            <span>{isDay ? "☀️ দিন" : "🌙 রাত"}</span>
          </button>

          {/* View mode toggle */}
          <div className={`flex items-center ${isDay ? "bg-stone-200/60 border border-stone-300/80" : "bg-black/40 border border-emerald-900/60"} p-1 rounded-xl text-xs`}>
            <button
              onClick={() => setViewMode("ayah")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                viewMode === "ayah"
                  ? isDay ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-600 text-white"
                  : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>আয়াত</span>
            </button>
            <button
              onClick={() => setViewMode("mushaf")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                viewMode === "mushaf"
                  ? isDay ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-600 text-white"
                  : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>মুসহাফ</span>
            </button>
          </div>

          {/* Font Zoom Controls */}
          <div className={`flex items-center ${isDay ? "bg-stone-200/60 border border-stone-300/80" : "bg-black/40 border border-emerald-900/60"} px-2 py-1 rounded-xl text-xs gap-1.5`}>
            <button
              onClick={() => changeFontSize(-2)}
              className={`px-2 py-0.5 rounded ${isDay ? "hover:bg-white text-stone-700" : "hover:bg-emerald-900/60 text-slate-300"} font-black`}
              title="ফন্ট ছোট করুন"
            >
              A-
            </button>
            <span className={`text-[11px] ${isDay ? "text-emerald-700" : "text-emerald-400"} font-black`}>{arabicFontSize}px</span>
            <button
              onClick={() => changeFontSize(2)}
              className={`px-2 py-0.5 rounded ${isDay ? "hover:bg-white text-stone-700" : "hover:bg-emerald-900/60 text-slate-300"} font-black`}
              title="ফন্ট বড় করুন"
            >
              A+
            </button>
          </div>

          {/* Toggle Translation Visibility */}
          <button
            onClick={() => setShowBengali((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
              showBengali
                ? isDay
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-2xs"
                  : "bg-emerald-900/70 border-emerald-600 text-emerald-200"
                : isDay
                ? "bg-white border-stone-200 text-stone-500"
                : "bg-black/30 border-emerald-900 text-slate-500"
            }`}
            title="বাংলা অনুবাদ দেখান বা লুকান"
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1">
        {/* SURAH TITLE CARD */}
        <div className={`relative mb-8 rounded-3xl ${isDay ? "bg-gradient-to-br from-[#0c533c] via-[#083e2d] to-[#05291e] text-white" : "bg-gradient-to-br from-[#0c291d] via-[#082017] to-[#04140e] text-white"} p-6 sm:p-8 border border-emerald-700/50 shadow-2xl text-center overflow-hidden`}>
          {/* Subtle gold ornamentation glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-amber-300">
              <span>{currentSurahMeta.typeBn}</span>
              <span>•</span>
              <span>{currentSurahMeta.versesCount} আয়াত</span>
              <span>•</span>
              <span>{currentSurahMeta.juz}ম পারা</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-hafizi-quran text-emerald-300 tracking-wide">
              {currentSurahMeta.nameAr}
            </h2>

            <div className="text-xl sm:text-2xl font-bold font-hind-siliguri text-white">
              {currentSurahMeta.nameBn} —{" "}
              <span className="text-emerald-300 font-normal italic text-lg">{currentSurahMeta.meaningBn}</span>
            </div>

            <p className="text-xs text-emerald-200/80 font-english-italic">
              Surah {currentSurahMeta.nameEn} • Verses: {currentSurahMeta.versesCount}
            </p>

            {/* Bismillah Header (Except Surah 9) */}
            {selectedSurahId !== 9 && (
              <div className="pt-4 pb-2 border-t border-white/15">
                <div className="text-2xl sm:text-3xl font-hafizi-quran text-amber-300 tracking-wider">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
                <div className="text-xs font-hind-siliguri text-emerald-200 mt-1">
                  পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে শুরু করছি
                </div>
              </div>
            )}

            {/* 🌟 Quick Surah Audio Action Bar (Play whole Surah or stop anytime) */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio) {
                    togglePlayPauseAudio();
                  } else {
                    playAyahAudio(playingAyahNumber || 1);
                  }
                }}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
                  isPlayingAudio
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-950/30"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/30"
                }`}
                title={isPlayingAudio ? "তিলাওয়াত সাময়িক থামান" : "সম্পূর্ণ সূরা তিলাওয়াত শুরু করুন"}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>তিলাওয়াত বিরতি দিন (আয়াত {playingAyahNumber || 1})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>
                      {playingAyahNumber
                        ? `তিলাওয়াত পুনরায় চালু করুন (আয়াত ${playingAyahNumber})`
                        : "সম্পূর্ণ সূরা তিলাওয়াত শুনুন"}
                    </span>
                  </>
                )}
              </button>

              {playingAyahNumber !== null && (
                <button
                  type="button"
                  onClick={closePlayerBar}
                  className="px-4 py-2.5 rounded-2xl bg-black/60 hover:bg-rose-950/80 border border-white/20 text-rose-300 hover:text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                  title="তিলাওয়াত সম্পূর্ণ বন্ধ করুন (মাঝপথে বন্ধ)"
                >
                  <X className="w-4 h-4" />
                  <span>বন্ধ করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoadingSurah && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-sm font-hind-siliguri ${isDay ? "text-emerald-900" : "text-emerald-300"}`}>
              হাফিজি কুরআন শরিফের আয়াতসমূহ সুন্দরভাবে লোড হচ্ছে...
            </p>
          </div>
        )}

        {/* ── AYAH VIEW MODE ── */}
        {!isLoadingSurah && viewMode === "ayah" && surahData?.ayahs && (
          <div className="space-y-5">
            {surahData.ayahs.map((ayah) => {
              const isThisAyahActive = playingAyahNumber === ayah.numberInSurah;
              const isPlayingThis = isThisAyahActive && isPlayingAudio;
              const isBookmarked = bookmarks.some(
                (b) => b.key === `${selectedSurahId}:${ayah.numberInSurah}`
              );

              const words = splitArabicAyahWords(
                ayah.words && ayah.words.length > 0 ? ayah.words : ayah.text
              );

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`p-5 sm:p-7 rounded-3xl border transition-all duration-300 relative ${
                    isThisAyahActive
                      ? isPlayingAudio
                        ? isDay
                          ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-500 shadow-xl ring-2 ring-emerald-300"
                          : "bg-gradient-to-br from-[#0c2e21] to-[#071d15] border-emerald-400/90 shadow-2xl shadow-emerald-950/40 ring-2 ring-emerald-500/40"
                        : isDay
                        ? "bg-amber-50/60 border-amber-400 shadow-md ring-1 ring-amber-300/60"
                        : "bg-[#0b241b] border-amber-500/70 shadow-xl ring-1 ring-amber-400/40"
                      : isDay
                      ? "bg-white hover:bg-stone-50/60 border-amber-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md"
                      : "bg-[#091c15]/80 hover:bg-[#0b241b] border-emerald-900/60 shadow-lg"
                  }`}
                >
                  {/* Ayah Header Bar */}
                  <div className={`flex items-center justify-between pb-3 mb-3 border-b ${isDay ? "border-stone-100" : "border-emerald-900/40"} text-xs`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black border transition-colors shadow-2xs ${
                        isThisAyahActive
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : isDay
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                          : "bg-emerald-900/70 text-emerald-300 border-emerald-700/60"
                      }`}>
                        {ayah.numberInSurah}
                      </span>
                      <span className={`${isDay ? "text-stone-500 font-semibold" : "text-slate-400"} text-xs font-english-italic`}>
                        {selectedSurahId}:{ayah.numberInSurah}
                      </span>
                      {isThisAyahActive && !isPlayingAudio && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                          বিরতি
                        </span>
                      )}
                    </div>

                    {/* Ayah Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Play / Pause Ayah */}
                      <button
                        onClick={() => playAyahAudio(ayah.numberInSurah)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs ${
                          isThisAyahActive
                            ? isPlayingAudio
                              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                            : isDay
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800"
                        }`}
                      >
                        {isThisAyahActive && isPlayingAudio ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>থামান</span>
                          </>
                        ) : isThisAyahActive && !isPlayingAudio ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            <span>চালু</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                            <span>তিলাওয়াত</span>
                          </>
                        )}
                      </button>

                      {/* Launch Nur AI Teacher on this Ayah */}
                      <button
                        onClick={() => {
                          if (onLaunchNurEngine) {
                            onLaunchNurEngine(selectedSurahId, ayah.numberInSurah);
                          } else {
                            toast.info(`সূরা ${selectedSurahId}, আয়াত ${ayah.numberInSurah} এআই শিক্ষকে পাঠানো হচ্ছে...`);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                        title="এই আয়াতটি এআই শিক্ষক নূরের সাথে ৬ ধাপে অনুশীলন করুন"
                      >
                        <Bot className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="hidden sm:inline">নূর শিক্ষক</span>
                      </button>

                      {/* Word Breakdown */}
                      {ayah.words && ayah.words.length > 0 && (
                        <button
                          onClick={() => setWordModalAyah(ayah)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isDay
                              ? "bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900"
                              : "bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 text-purple-300"
                          }`}
                          title="শব্দার্থে শব্দার্থ তাজবীদ বিশ্লেষণ"
                        >
                          শব্দার্থ
                        </button>
                      )}

                      {/* Bookmark */}
                      <button
                        onClick={() => toggleBookmark(selectedSurahId, ayah.numberInSurah)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isBookmarked
                            ? "bg-amber-500/20 text-amber-600 border border-amber-500/60"
                            : isDay
                            ? "bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-200"
                            : "bg-black/30 text-slate-400 hover:text-slate-200 border border-emerald-900"
                        }`}
                        title={isBookmarked ? "বুকমার্ক সরানো" : "বুকমার্ক যোগ করুন"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ARABIC TEXT with Word-by-Word Active Highlighting */}
                  <div className="py-3 text-right">
                    <p
                      className={`font-hafizi-quran ${isDay ? "text-slate-900" : "text-slate-100"} tracking-wide select-text leading-[2.6]`}
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {words.map((word, wIdx) => {
                        const isThisWordActive = isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;
                        return (
                          <span
                            key={wIdx}
                            className={`inline-block transition-all duration-150 px-2 py-0.5 mx-0.5 rounded-xl ${
                              isThisWordActive
                                ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-300 scale-105"
                                : isThisAyahActive
                                ? isDay ? "text-emerald-800 font-bold" : "text-amber-200 font-semibold"
                                : isDay ? "text-slate-900" : "text-slate-100"
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}{" "}
                      <span className={`inline-flex items-center justify-center font-hafizi-quran ${isDay ? "text-amber-600" : "text-amber-400"} text-2xl mx-1 select-none`}>
                        ۝{ayah.numberInSurah}
                      </span>
                    </p>
                  </div>

                  {/* BENGALI TRANSLATION with Authentic Human Male Voice Player & Live Word-by-Word Highlighting */}
                  {showBengali && ayah.bengali && (() => {
                    const banglaKey = `reader-bn-${selectedSurahId}-${ayah.numberInSurah}`;
                    const isThisBanglaPlaying = playingBanglaId === banglaKey && !isBanglaLoading;
                    const isThisBanglaLoading = playingBanglaId === banglaKey && isBanglaLoading;
                    const banglaWords = ayah.bengali
                      .replace(/\[\s*[\d০-৯]+\s*\]/g, "")
                      .replace(/\(\s*[\d০-৯]+\s*\)/g, "")
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean);

                    return (
                      <div className={`pt-3 border-t ${isDay ? "border-stone-100" : "border-emerald-950/80"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                        <div className={`font-hind-siliguri ${isDay ? "text-emerald-950" : "text-emerald-100/90"} text-base sm:text-lg leading-relaxed font-normal flex-1 flex flex-wrap items-center`}>
                          {banglaWords.map((word, bIdx) => {
                            const isThisWordActive = isThisBanglaPlaying && activeBanglaWordIndex === bIdx;
                            return (
                              <span
                                key={bIdx}
                                className={`inline-block transition-all duration-150 px-1.5 py-0.5 mx-0.5 rounded-xl ${
                                  isThisWordActive
                                    ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-200 scale-105"
                                    : isThisBanglaPlaying
                                    ? isDay ? "text-emerald-800 font-bold" : "text-emerald-200"
                                    : isDay ? "text-emerald-950" : "text-emerald-100/90"
                                }`}
                              >
                                {word}
                              </span>
                            );
                          })}
                        </div>

                        {/* খাঁটি মানুষের পুরুষ কণ্ঠে বাংলা অনুবাদ অডিও প্লেয়ার */}
                        <button
                          type="button"
                          onClick={() => handleToggleBangla(ayah.bengali, banglaKey)}
                          className={`shrink-0 self-end sm:self-center px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                            isThisBanglaPlaying
                              ? "bg-amber-500 border-amber-300 text-slate-950 shadow-md animate-pulse font-extrabold"
                              : isThisBanglaLoading
                              ? "bg-emerald-100 border-emerald-300 text-amber-800 animate-pulse"
                              : isDay
                              ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950"
                              : "bg-[#05140d] border-emerald-900/80 hover:border-emerald-600 text-emerald-300 hover:bg-emerald-950/80"
                          }`}
                          title="খাঁটি পুরুষ কণ্ঠে বাংলা অনুবাদ শুনুন"
                        >
                          {isThisBanglaLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Volume2 className={`w-3.5 h-3.5 ${isThisBanglaPlaying ? "animate-bounce" : ""}`} />
                          )}
                          <span className="text-[11px] font-hind-siliguri font-bold">
                            {isThisBanglaPlaying
                              ? "অনুবাদ বাজছে (থামুন)"
                              : isThisBanglaLoading
                              ? "লোড হচ্ছে..."
                              : "অনুবাদ শুনুন"}
                          </span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* ENGLISH TRANSLITERATION / TRANSLATION (Italic English) */}
                  {showEnglish && ayah.english && (
                    <div className="pt-2">
                      <p className={`font-english-italic ${isDay ? "text-stone-500" : "text-slate-400"} text-xs sm:text-sm leading-relaxed`}>
                        {ayah.english}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MUSHAF PAGE VIEW MODE (Continuous Reading with Word-by-Word Highlighting) ── */}
        {!isLoadingSurah && viewMode === "mushaf" && surahData?.ayahs && (
          <div className="p-6 sm:p-10 rounded-3xl bg-[#091f16] border-2 border-emerald-700/60 shadow-2xl space-y-6">
            <div className="text-center pb-4 border-b border-emerald-900/60 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 font-hind-siliguri">
                মুসহাফ পঠন মোড — সূরা {surahData.bengaliName}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                তিলাওয়াত চলাকালে শব্দ স্বয়ংক্রিয়ভাবে উজ্জ্বল সোনালী রঙে নির্দেশিত হবে
              </span>
            </div>

            <div
              className="font-hafizi-quran text-justify leading-[2.8] select-text text-slate-100"
              style={{ fontSize: `${arabicFontSize + 2}px` }}
            >
              {surahData.ayahs.map((ayah) => {
                const isThisAyahActive = playingAyahNumber === ayah.numberInSurah;
                const words = splitArabicAyahWords(
                  ayah.words && ayah.words.length > 0 ? ayah.words : ayah.text
                );

                return (
                  <span
                    key={ayah.numberInSurah}
                    id={`mushaf-ayah-${ayah.numberInSurah}`}
                    onClick={() => playAyahAudio(ayah.numberInSurah)}
                    className={`inline cursor-pointer transition-all px-1.5 py-1 rounded-2xl ${
                      isThisAyahActive
                        ? isPlayingAudio
                          ? "bg-emerald-800/70 ring-2 ring-emerald-400/90 shadow-md"
                          : "bg-emerald-900/50 ring-1 ring-amber-400/60"
                        : "hover:bg-emerald-800/30"
                    }`}
                    title={`আয়াত ${ayah.numberInSurah} শুনতে ক্লিক করুন`}
                  >
                    {words.map((word, wIdx) => {
                      const isThisWordActive = isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;
                      return (
                        <span
                          key={wIdx}
                          className={`inline-block transition-all duration-150 px-1.5 mx-0.5 rounded-lg ${
                            isThisWordActive
                              ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-200 scale-105"
                              : isThisAyahActive
                              ? "text-amber-200 font-semibold"
                              : "text-slate-100"
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center justify-center font-hafizi-quran text-amber-400 font-bold text-2xl mx-1 select-none">
                      ۝{ayah.numberInSurah}
                    </span>{" "}
                  </span>
                );
              })}
            </div>

            <div className="pt-6 border-t border-emerald-900/60 text-center">
              <p className="text-xs font-hind-siliguri text-slate-400">
                যেকোনো আয়াতে ক্লিক করলেই তা নির্বাচিত ক্বারীর কণ্ঠে বেজে উঠবে এবং শব্দে শব্দে হাইলাইট হবে।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM AUDIO PLAYER BAR (Always Visible & Pinned to Viewport Bottom like Qurani Amal) ── */}
      {playingAyahNumber !== null && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#071d15]/95 backdrop-blur-md border-t border-emerald-300 dark:border-emerald-800 shadow-2xl p-3 sm:p-4 animate-slideUp">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                আরবী
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  সূরা {currentSurahMeta.nameBn} ({currentSurahMeta.nameAr})
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold truncate">
                  আয়াত {playingAyahNumber}/{surahData?.ayahs?.length || currentSurahMeta.versesCount} • ক্বারী: {QARI_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn || "মিশারী রাশিদ আল-আফাসী"}
                  {!isPlayingAudio && " • (বিরতি)"}
                </p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (playingAyahNumber > 1) playAyahAudio(playingAyahNumber - 1);
                }}
                disabled={playingAyahNumber <= 1}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-emerald-900/60 disabled:opacity-40 transition cursor-pointer"
                title="পূর্ববর্তী আয়াত"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlayPauseAudio}
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer ${
                  isPlayingAudio
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-950/20"
                    : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-950/20"
                }`}
                title={isPlayingAudio ? "থামান (Pause)" : "চালু করুন (Play)"}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (playingAyahNumber < (surahData?.ayahs?.length || 1)) {
                    playAyahAudio(playingAyahNumber + 1);
                  }
                }}
                disabled={playingAyahNumber >= (surahData?.ayahs?.length || 1)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-emerald-900/60 disabled:opacity-40 transition cursor-pointer"
                title="পরবর্তী আয়াত"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat Mode Cycle */}
              <button
                type="button"
                onClick={() => {
                  const nextMode =
                    repeatMode === "none" ? "1x" : repeatMode === "1x" ? "3x" : repeatMode === "3x" ? "surah" : "none";
                  setRepeatMode(nextMode);
                  repeatModeRef.current = nextMode;
                  repeatCounterRef.current = 0;
                  setRepeatCounter(0);
                  toast.info(`রিপিট মোড: ${nextMode === "none" ? "বন্ধ" : nextMode === "surah" ? "পুরো সূরা" : nextMode}`);
                }}
                className={`hidden sm:flex px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition items-center gap-1 cursor-pointer ${
                  repeatMode !== "none"
                    ? "bg-purple-900/80 border-purple-500 text-purple-200"
                    : "bg-stone-100 dark:bg-black/30 border-stone-200 dark:border-emerald-900 text-slate-600 dark:text-slate-400"
                }`}
                title="রিপিট মোড"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{repeatMode === "none" ? "রিপিট বন্ধ" : repeatMode}</span>
              </button>

              {/* Playback Speed Selector */}
              <button
                type="button"
                onClick={() => {
                  const speeds = [0.75, 1.0, 1.25, 1.5];
                  const currentIndex = speeds.indexOf(playbackSpeed);
                  const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                  handleSpeedChange(nextSpeed);
                }}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-black/60 hover:bg-stone-200 dark:hover:bg-emerald-950 border border-stone-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-[11px] font-bold transition items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                title="গতি পরিবর্তন"
              >
                <span>⚡ {playbackSpeed}x</span>
              </button>
            </div>

            {/* Right: Close / Stop */}
            <button
              type="button"
              onClick={closePlayerBar}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
              title="তিলাওয়াত সম্পূর্ণ বন্ধ করুন (মাঝপথে বন্ধ করার বাটন)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── SURAH SELECTOR DRAWER MODAL ── */}
      {isSurahDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-[#081f16] border-l border-emerald-800/70 h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base font-hind-siliguri">
                  পবিত্র কুরআন শরিফ — ১১৪ সূরা ক্যাটালগ
                </h3>
              </div>
              <button
                onClick={() => setIsSurahDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-black/30 hover:bg-emerald-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-4 border-b border-emerald-900/60 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="সূরার নাম বা পারা-পৃষ্ঠা (যেমন: পারা ৫ পৃষ্ঠা ১২, 36, ফাতিহা)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && hafiziSearchMatch) {
                      handleJumpToHafiziPage(hafiziSearchMatch.para, hafiziSearchMatch.paraPage);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#04140e] border border-emerald-800/70 text-white placeholder-slate-500 text-xs font-hind-siliguri focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-bold pb-1">
                {[
                  { id: "all", label: "সব সূরা (১১৪)" },
                  { id: "hafizi", label: "📖 হাফেজী পারা ও পৃষ্ঠা" },
                  { id: "popular", label: "জনপ্রিয় সূরা" },
                  { id: "meccan", label: "মাক্কী" },
                  { id: "medinan", label: "মাদানী" },
                  { id: "juz", label: "৩০ পারা" }
                ].map((f) => {
                  const isHafizi = f.id === "hafizi";
                  const isActive = activeFilter === f.id;
                  let tabClasses = "bg-black/30 text-slate-400 hover:text-slate-200";
                  if (isHafizi) {
                    tabClasses = isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300"
                      : "bg-amber-950/60 text-amber-300 border border-amber-500/70 hover:bg-amber-900/80 font-bold";
                  } else if (isActive) {
                    tabClasses = "bg-emerald-600 text-white shadow";
                  }

                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${tabClasses}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick Hafizi Jump Toolbar (Always Visible) */}
              <div className="pt-2 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">হাফেজী কুরআন (১৫ লাইন):</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Para Selector */}
                  <div className="flex items-center gap-1 bg-[#040e0a] border border-emerald-800 rounded-lg px-2 py-0.5 text-xs text-slate-200">
                    <span className="text-emerald-400 font-bold text-[10px]">পারা:</span>
                    <select
                      value={hafiziPara}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setHafiziPara(p);
                        const maxP = getParaTotalPages(p);
                        if (hafiziPage > maxP) setHafiziPage(1);
                      }}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                    >
                      {HAFIZI_PARAS.map((p) => (
                        <option key={p.juz} value={p.juz} className="bg-slate-900 text-white">
                          {p.juz} ({p.nameBn} • {p.totalPages} পৃ:)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Page Selector */}
                  <div className="flex items-center gap-1 bg-[#040e0a] border border-emerald-800 rounded-lg px-2 py-0.5 text-xs text-slate-200">
                    <span className="text-emerald-400 font-bold text-[10px]">পৃষ্ঠা:</span>
                    <select
                      value={hafiziPage}
                      onChange={(e) => setHafiziPage(Number(e.target.value))}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                    >
                      {Array.from({ length: getParaTotalPages(hafiziPara) }, (_, i) => i + 1).map((pg) => (
                        <option key={pg} value={pg} className="bg-slate-900 text-white">
                          পৃ: {pg} ({getHafiziGlobalPage(hafiziPara, pg)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jump Button */}
                  <button
                    type="button"
                    onClick={() => handleJumpToHafiziPage(hafiziPara, hafiziPage)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow transition active:scale-95 cursor-pointer"
                  >
                    <span>যান</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Smart Hafizi Search Banner */}
              {hafiziSearchMatch && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-emerald-950/80 to-[#04140e] border border-amber-500 shadow-md flex items-center justify-between gap-2 animate-fade-in">
                  <div>
                    <p className="text-xs font-black text-amber-200">
                      হাফেজী পৃষ্ঠা পাওয়া গেছে: পারা {hafiziSearchMatch.para}, পৃষ্ঠা {hafiziSearchMatch.paraPage}
                    </p>
                    <p className="text-[10px] text-emerald-300">
                      সূরা {ALL_SURAHS.find((s) => s.id === hafiziSearchMatch.surah)?.nameBn || hafiziSearchMatch.surah} • আয়াত {hafiziSearchMatch.ayah} (মোট পৃষ্ঠা: {hafiziSearchMatch.globalPage})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToHafiziPage(hafiziSearchMatch.para, hafiziSearchMatch.paraPage)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow"
                  >
                    <span>যান</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Juz Selector if active */}
              {activeFilter === "juz" && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 font-hind-siliguri">পারা নির্বাচন:</span>
                  <select
                    value={selectedJuz}
                    onChange={(e) => setSelectedJuz(parseInt(e.target.value, 10))}
                    className="bg-[#04140e] text-emerald-300 border border-emerald-800 rounded-lg px-2 py-1 text-xs font-bold"
                  >
                    {JUZ_MAPPING.map((j) => (
                      <option key={j.juz} value={j.juz}>
                        {j.nameBn} — {j.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Content Area: Hafizi Browser OR Surah List */}
            {activeFilter === "hafizi" ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#05140e]">
                {/* 30 Paras Horizontal Scroll Badges */}
                <div className="p-3 bg-[#030d08] border-b border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                  {HAFIZI_PARAS.map((p) => {
                    const isSelected = hafiziPara === p.juz;
                    return (
                      <button
                        key={p.juz}
                        type="button"
                        onClick={() => {
                          setHafiziPara(p.juz);
                          const maxP = p.totalPages;
                          if (hafiziPage > maxP) setHafiziPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-black shadow"
                            : "bg-[#061710] text-slate-300 border border-emerald-900/80 hover:bg-emerald-950"
                        }`}
                      >
                        <span>পারা {p.juz}</span>
                        <span className="opacity-70 text-[10px]">({p.totalPages} পৃ:)</span>
                      </button>
                    );
                  })}
                </div>

                {/* Para Info Summary */}
                {(() => {
                  const info = HAFIZI_PARAS.find((p) => p.juz === hafiziPara) || HAFIZI_PARAS[0];
                  return (
                    <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/60 via-[#071912] to-slate-950 border-b border-emerald-900/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-white text-xs">{info.nameBn}</span>
                        <span className="font-hafizi-quran text-amber-300 ml-2 font-bold">{info.nameAr}</span>
                        <span className="text-slate-400 text-[11px] ml-2">
                          (মোট {info.totalPages} পৃষ্ঠা • কুরআনের পৃষ্ঠা: {info.startPage} - {info.endPage})
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400 hidden sm:inline">পৃষ্ঠা ক্লিক করুন ➔</span>
                    </div>
                  );
                })()}

                {/* Grid of Pages for Selected Para */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(() => {
                    const info = HAFIZI_PARAS.find((p) => p.juz === hafiziPara) || HAFIZI_PARAS[0];
                    return Array.from({ length: info.totalPages }, (_, i) => {
                      const pageNo = i + 1;
                      const globalPg = info.startPage + i;
                      const target = getHafiziPageTarget(info.juz, pageNo);
                      const targetSurahMeta = ALL_SURAHS.find((s) => s.id === target.surah);
                      return (
                        <button
                          key={pageNo}
                          type="button"
                          onClick={() => handleJumpToHafiziPage(info.juz, pageNo)}
                          className="p-2.5 rounded-xl bg-[#040e0a] border border-emerald-800/60 hover:border-amber-400 hover:bg-emerald-950 transition text-left flex flex-col justify-between cursor-pointer group shadow-sm active:scale-95"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-amber-300 group-hover:text-amber-200">
                              পৃষ্ঠা {pageNo}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              মোট {globalPg}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">
                            {targetSurahMeta?.nameBn || `সূরা ${target.surah}`}
                          </p>
                          <p className="text-[10px] text-emerald-400">
                            আয়াত {target.ayah} থেকে
                          </p>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              /* Surah List */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.id === selectedSurahId;
                return (
                  <button
                    key={surah.id}
                    onClick={() => {
                      setSelectedSurahId(surah.id);
                      setIsSurahDrawerOpen(false);
                      stopAudio();
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-emerald-800/80 border-emerald-500 shadow-lg text-white"
                        : "bg-[#061811] hover:bg-[#0b261b] border-emerald-900/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-white text-emerald-900" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {surah.id}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white font-hind-siliguri">
                          {surah.nameBn}
                        </div>
                        <div className="text-[11px] text-slate-400 font-english-italic">
                          {surah.nameEn} • {surah.meaningBn} • {surah.versesCount} আয়াত
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-hafizi-quran text-lg text-emerald-300">{surah.nameAr}</div>
                      <div className="text-[10px] text-emerald-400/80 font-hind-siliguri">
                        {surah.typeBn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* ── WORD-BY-WORD MODAL ── */}
      {wordModalAyah && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#081f16] border border-emerald-700/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <div>
                <h3 className="font-extrabold text-white text-base font-hind-siliguri">
                  শব্দে-শব্দে অর্থ ও তাজবীদ বিশ্লেষণ
                </h3>
                <p className="text-xs text-slate-400 font-english-italic">
                  Surah {selectedSurahId}, Ayah {wordModalAyah.numberInSurah}
                </p>
              </div>
              <button
                onClick={() => setWordModalAyah(null)}
                className="p-1.5 rounded-xl bg-black/30 hover:bg-emerald-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#04140e] border border-emerald-900 text-right">
              <p className="font-hafizi-quran text-2xl text-emerald-200 leading-relaxed">
                {wordModalAyah.text}
              </p>
            </div>

            {/* Word Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {wordModalAyah.words?.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#0c291d] border border-emerald-800/70 text-center space-y-1.5"
                >
                  <div className="font-hafizi-quran text-xl text-emerald-300 font-bold">{w.ar}</div>
                  <div className="font-hind-siliguri text-xs text-white font-bold">{w.bn}</div>
                  <div className="font-english-italic text-[11px] text-slate-400">{w.en}</div>
                  {w.tajweed && (
                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {w.tajweed}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setWordModalAyah(null)}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
