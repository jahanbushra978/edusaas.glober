"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Search,
  Bookmark,
  Sun,
  Moon,
  Settings,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Play,
  Pause,
  Award,
  Compass,
  FileText,
  List
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SURAHS } from "@/lib/quran/quran-meta";
import {
  HAFIZI_PARAS,
  TOTAL_UTHMANI_PAGES,
  getHafiziPageMeta,
  getHafiziLocation,
  getHafiziLocationForAyah,
  getHafiziPageTarget
} from "@/lib/quran/hafizi-pages";
import { getSurahData, getAyahAudioUrl } from "@/lib/quran/quran-service";
import { loadChapterSegments, getActiveArabicWordIndex, splitArabicAyahWords, getWordStartTimeSec } from "@/lib/quran/quran-audio-timing";
import { QARI_REGISTRY, getStoredQariPreference, setStoredQariPreference } from "@/lib/ai/qari-registry";
import AmbientFloatingOrbs from "./AmbientFloatingOrbs";
import HafiziMushafSheet from "./HafiziMushafSheet";
import QuranReader from "./QuranReader";

// Bengali numeral conversion helper
const toBn = (num) => {
  if (num === null || num === undefined) return "০";
  const enToBnMap = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
};

export default function TahfizQuranApp({
  onClose,
  initialScreen = "home",
  initialPage = 1,
  initialSurah = 2,
  onLaunchNurEngine,
  onNavigateToFeature,
}) {
  // Navigation Screens: 'home' | 'surahs' | 'paras' | 'reader' | 'tasbih' | 'bookmarks' | 'last-read'
  const [currentScreen, setCurrentScreen] = useState(initialScreen);
  const [bottomNavTab, setBottomNavTab] = useState(initialScreen === "reader" ? "reader" : "home");

  // Reader State
  const [readerSurahId, setReaderSurahId] = useState(initialSurah);
  const [readerPageNum, setReaderPageNum] = useState(initialPage);
  const [readerMode, setReaderMode] = useState("mushaf"); // 'mushaf' | 'ayah'
  const [pageFilter, setPageFilter] = useState("night"); // 'night' | 'day' | 'sepia'
  const [readingNavStyle, setReadingNavStyle] = useState("flip"); // 'flip' | 'scroll'

  // Universal Authentic Audio Engine State
  const [selectedQari, setSelectedQari] = useState("husary_muallim");
  const [playingAyahNumber, setPlayingAyahNumber] = useState(null);
  const [playingSurahId, setPlayingSurahId] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const audioRef = useRef(null);
  const playingAyahWordsRef = useRef([]);

  // Search Modals State (3-Tabbed Unified Search Engine)
  const [isPageSearchOpen, setIsPageSearchOpen] = useState(false);
  const [searchModalTab, setSearchModalTab] = useState("para"); // 'para' | 'surah' | 'page'
  const [searchParaNum, setSearchParaNum] = useState(1);
  const [searchParaPageNum, setSearchParaPageNum] = useState("1");
  const [searchSurahId, setSearchSurahId] = useState(2);
  const [searchAyahNum, setSearchAyahNum] = useState("");
  const [searchDirectPage, setSearchDirectPage] = useState("");
  const [targetHighlightAyah, setTargetHighlightAyah] = useState(null);
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [paraSearchQuery, setParaSearchQuery] = useState("");

  // Default initial states to prevent SSR Hydration Mismatch
  const DEFAULT_BOOKMARKS = [
    { id: "bm-1", surahId: 2, ayah: 255, para: 3, page: 42, label: "আয়াতুল কুরসী", date: "০৯ নভে ২০২৬" },
    { id: "bm-2", surahId: 36, ayah: 1, para: 22, page: 440, label: "সূরা ইয়াসীন শুরু", date: "০৮ নভে ২০২৬" }
  ];
  const DEFAULT_LAST_READ = { surahId: 2, ayah: 1, para: 1, page: 2, percentage: 3 };

  // Bookmark State
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState("");

  // Last Read State
  const [lastRead, setLastRead] = useState(DEFAULT_LAST_READ);
  const hasLoadedStorageRef = useRef(false);

  // Hydrate Client Storage safely after mount (Zero SSR Hydration Mismatch)
  useEffect(() => {
    try {
      const savedLastRead = localStorage.getItem("tahfiz_quran_last_read_v1");
      if (savedLastRead) {
        setLastRead(JSON.parse(savedLastRead));
      }
      const savedBookmarks = localStorage.getItem("tahfiz_quran_bookmarks_v1");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const prefQari = getStoredQariPreference();
      if (prefQari) {
        setSelectedQari(prefQari);
      }

      // Check URL query parameters on client mount
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const qScreen = sp.get("screen");
        const qPage = sp.get("page");
        const qSurah = sp.get("surah");
        if (qScreen && ["home", "surahs", "paras", "reader", "tasbih", "bookmarks"].includes(qScreen)) {
          setCurrentScreen(qScreen);
        }
        if (qPage && Number(qPage) >= 1 && Number(qPage) <= TOTAL_UTHMANI_PAGES) {
          setReaderPageNum(Number(qPage));
          setCurrentScreen("reader");
        }
        if (qSurah && Number(qSurah) >= 1 && Number(qSurah) <= 114) {
          setReaderSurahId(Number(qSurah));
        }
      }
    } catch {} finally {
      hasLoadedStorageRef.current = true;
    }
  }, []);

  // Rewarded Ad-Free Mode State (Countdown)
  const [adFreeRemainingSeconds, setAdFreeRemainingSeconds] = useState(35820); // ~9h 57m
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Digital Tasbih State
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [tasbihRounds, setTasbihRounds] = useState(0);
  const [tasbihTotal, setTasbihTotal] = useState(13);
  const [tasbihSound, setTasbihSound] = useState(true);
  const [activeDhikrIndex, setActiveDhikrIndex] = useState(0);

  const DHIKRS = [
    { ar: "سُبْحَانَ اللّٰهِ", bn: "সুবহানাল্লাহ", meaning: "আল্লাহ অতীব পবিত্র" },
    { ar: "الْحَمْدُ لِلّٰهِ", bn: "আলহামদুলিল্লাহ", meaning: "সকল প্রশংসা আল্লাহর" },
    { ar: "اللّٰهُ أَكْبَرُ", bn: "আল্লাহু আকবার", meaning: "আল্লাহ মহান" },
    { ar: "لَا إِلٰهَ إِلَّا اللّٰهُ", bn: "লা ইলাহা ইল্লাল্লাহ", meaning: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই" },
    { ar: "أَسْتَغْفِرُ اللّٰهَ", bn: "আস্তাগফিরুল্লাহ", meaning: "আমি আল্লাহর কাছে ক্ষমা চাই" }
  ];

  // Persist Bookmarks (Only after initial storage load)
  useEffect(() => {
    if (!hasLoadedStorageRef.current) return;
    try {
      localStorage.setItem("tahfiz_quran_bookmarks_v1", JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // Persist Last Read (Only after initial storage load)
  useEffect(() => {
    if (!hasLoadedStorageRef.current) return;
    try {
      localStorage.setItem("tahfiz_quran_last_read_v1", JSON.stringify(lastRead));
    } catch {}
  }, [lastRead]);

  // Countdown timer for ad-free mode
  useEffect(() => {
    const timer = setInterval(() => {
      setAdFreeRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${toBn(hours)} ঘণ্টা ${toBn(mins)} মিনিট`;
  };

  // Sound Synthesizer for Digital Tasbih
  const playBeadClickSound = () => {
    if (!tasbihSound || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);

      if ("vibrate" in navigator) {
        navigator.vibrate(15);
      }
    } catch {}
  };

  // Handle Tasbih Tap
  const handleTasbihTap = () => {
    playBeadClickSound();
    const nextCount = tasbihCount + 1;
    setTasbihTotal((prev) => prev + 1);

    if (nextCount >= tasbihTarget) {
      setTasbihCount(0);
      setTasbihRounds((r) => r + 1);
      toast.success(`${toBn(tasbihTarget)} বার জিকির সম্পন্ন হয়েছে! মাশাআল্লাহ`, {
        icon: "⭐"
      });
    } else {
      setTasbihCount(nextCount);
    }
  };

  // Handle Rewarded Ad Extension (+3 Hours)
  const handleWatchRewardedAd = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      setIsRewardModalOpen(false);
      setAdFreeRemainingSeconds((prev) => prev + 3 * 3600);
      toast.success("মাশাআল্লাহ! বিজ্ঞাপন মুক্ত মোড ৩ ঘণ্টা বাড়ানো হয়েছে।", {
        icon: "👑"
      });
    }, 2500);
  };

  // Audio Engine Playback Handlers (Instant Recitation from Ayah Start + Live Synchronized Highlighting)
  const handlePlayAyah = (ayahNum, surahId, overrideQariId = null, directWords = null, startWordIndex = 0) => {
    const sId = surahId || readerSurahId;
    const aNum = ayahNum || 1;
    const activeQari = overrideQariId || selectedQari || "husary_muallim";

    // Update active Qari if an override is provided
    if (overrideQariId && overrideQariId !== selectedQari) {
      setSelectedQari(overrideQariId);
      setStoredQariPreference(overrideQariId);
    }

    // 1. Toggle pause/play if clicking the currently playing Ayah
    if (
      playingAyahNumber === aNum &&
      playingSurahId === sId &&
      audioRef.current &&
      (!overrideQariId || overrideQariId === selectedQari)
    ) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
        setActiveWordIndex(-1);
        return;
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlayingAudio(true);
        setActiveWordIndex(0);
        return;
      }
    }

    try {
      const audioUrl = getAyahAudioUrl(activeQari, sId, aNum);
      if (!audioRef.current) {
        audioRef.current = new Audio();
      } else {
        try {
          audioRef.current.pause();
        } catch {}
      }

      // Preload timing segments and set Ayah text/words for live synchronized highlighting
      if (directWords && directWords.length > 0) {
        playingAyahWordsRef.current = directWords;
      } else {
        playingAyahWordsRef.current = [];
        getSurahData(sId)
          .then((data) => {
            if (data && data.ayahs) {
              const targetAyah = data.ayahs.find((a) => a.numberInSurah === aNum);
              if (targetAyah) {
                playingAyahWordsRef.current = splitArabicAyahWords(
                  targetAyah.words && targetAyah.words.length > 0 ? targetAyah.words : targetAyah.text
                );
              }
            }
          })
          .catch(() => {});
      }
      loadChapterSegments(sId, activeQari).catch(() => {});

      // Precise live audio word-by-word tracking
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const { currentTime, duration } = audioRef.current;
        if (!duration || isNaN(duration)) return;

        const words = playingAyahWordsRef.current;
        if (!words || words.length === 0) return;

        const computedIndex = getActiveArabicWordIndex({
          currentTime,
          duration,
          surahNumber: sId,
          ayahNumber: aNum,
          qariId: activeQari,
          words,
        });

        setActiveWordIndex(computedIndex);
      };

      audioRef.current.onended = () => {
        setActiveWordIndex(-1);
        const sMeta = ALL_SURAHS.find((s) => s.id === sId);
        if (sMeta && aNum < sMeta.versesCount) {
          handlePlayAyah(aNum + 1, sId, activeQari, null, 0);
        } else {
          setIsPlayingAudio(false);
          setPlayingAyahNumber(null);
        }
      };

      // Play cleanly from beginning of the Ayah
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;

      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
          setPlayingAyahNumber(aNum);
          setPlayingSurahId(sId);
          setActiveWordIndex(0);
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          // Auto fallback to Alafasy if original Qari had a network issue
          if (activeQari !== "alafasy") {
            const fallbackUrl = getAyahAudioUrl("alafasy", sId, aNum);
            audioRef.current.src = fallbackUrl;
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .then(() => {
                setIsPlayingAudio(true);
                setPlayingAyahNumber(aNum);
                setPlayingSurahId(sId);
                setActiveWordIndex(0);
              })
              .catch(() => {
                toast.error("ক্বারীর তিলাওয়াত বাজাতে সমস্যা হয়েছে");
                setActiveWordIndex(-1);
                setIsPlayingAudio(false);
              });
          } else {
            toast.error("ক্বারীর তিলাওয়াত বাজাতে সমস্যা হয়েছে");
            setActiveWordIndex(-1);
            setIsPlayingAudio(false);
          }
        });
    } catch (e) {
      console.error(e);
      setActiveWordIndex(-1);
      setIsPlayingAudio(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
    setActiveWordIndex(-1);
    playingAyahWordsRef.current = [];
  };

  // Jump to specific Para & Page (হাফেজী বিন্যাস: ১নং পারায় ২১ পৃষ্ঠা, ২৯নং এ ২৪, ৩০নং এ ২৫, বাকিগুলোতে ২০ পৃষ্ঠা করে)
  const handleJumpToParaAndPage = (para, pageInParaInput) => {
    const p = Math.max(1, Math.min(30, Number(para) || 1));
    const target = getHafiziPageTarget(p, pageInParaInput || 1);
    const uthmaniPage = target.uthmaniPage || target.globalPage;

    setReaderPageNum(uthmaniPage);
    setReaderSurahId(target.surah);
    setTargetHighlightAyah({ surah: target.surah, ayah: target.ayah });
    setReaderMode("mushaf");

    // Update last read
    setLastRead({
      surahId: target.surah,
      ayah: target.ayah,
      para: p,
      page: uthmaniPage,
      percentage: Math.min(100, Math.round((uthmaniPage / TOTAL_UTHMANI_PAGES) * 100))
    });

    setIsPageSearchOpen(false);
    setCurrentScreen("reader");
    toast.success(`হাফেজী পারা ${toBn(p)}, পৃষ্ঠা ${toBn(target.paraPage)} — পৃষ্ঠা ${toBn(uthmaniPage)}-এ যাওয়া হয়েছে`);
  };

  // Jump to specific Surah & Ayah (সূরা ও আয়াত ভিত্তিক সার্চ)
  const handleJumpToSurahAndAyah = (surahId, ayahNum) => {
    const sId = Math.max(1, Math.min(114, Number(surahId) || 1));
    const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
    const cleanAyahStr = String(ayahNum || "").replace(/[০-৯]/g, (d) => bnToEnMap[d] || d).trim();
    const aNum = Math.max(1, parseInt(cleanAyahStr, 10) || 1);
    const loc = getHafiziLocationForAyah(sId, aNum);
    const targetPage = loc.uthmaniPage || loc.globalPage;

    setReaderSurahId(sId);
    setReaderPageNum(targetPage);
    // Force reset and re-highlight to ensure scroll and animation trigger
    setTargetHighlightAyah(null);
    setTimeout(() => {
      setTargetHighlightAyah({ surah: sId, ayah: aNum });
    }, 60);

    setReaderMode("mushaf");

    setLastRead({
      surahId: sId,
      ayah: aNum,
      para: loc.para,
      page: targetPage,
      percentage: Math.min(100, Math.round((targetPage / TOTAL_UTHMANI_PAGES) * 100))
    });

    setIsPageSearchOpen(false);
    setCurrentScreen("reader");
    toast.success(`সূরা ${ALL_SURAHS.find((s) => s.id === sId)?.nameBn || sId}, আয়াত ${toBn(aNum)} — পৃষ্ঠা ${toBn(targetPage)}`);
  };

  // Jump directly to global page (১ থেকে ৬১০)
  const handleJumpToDirectPage = (pageNumInput) => {
    const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
    const normalized = String(pageNumInput).replace(/[০-৯]/g, (d) => bnToEnMap[d] || d).trim();
    const rawPage = parseInt(normalized, 10);
    if (isNaN(rawPage) || rawPage < 1 || rawPage > 610) {
      toast.error("১ থেকে ৬১০-এর মধ্যে সঠিক পৃষ্ঠা নম্বর লিখুন");
      return;
    }
    const targetPage = Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((rawPage / 610) * TOTAL_UTHMANI_PAGES)));
    setReaderPageNum(targetPage);
    setReaderMode("mushaf");
    setIsPageSearchOpen(false);
    setCurrentScreen("reader");
    toast.success(`পৃষ্ঠা ${toBn(rawPage)}-এ যাওয়া হয়েছে`);
  };

  // Jump to specific Surah
  const handleSelectSurah = (surahId) => {
    const sId = Math.max(1, Math.min(114, Number(surahId) || 1));
    const sMeta = ALL_SURAHS.find((s) => s.id === sId) || ALL_SURAHS[0];
    const loc = getHafiziLocationForAyah(sId, 1);
    const targetPage = loc.uthmaniPage || Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((loc.globalPage / 610) * TOTAL_UTHMANI_PAGES)));

    setReaderSurahId(sId);
    setReaderPageNum(targetPage);
    setLastRead({
      surahId: sId,
      ayah: 1,
      para: loc.para,
      page: targetPage,
      percentage: Math.min(100, Math.round((targetPage / TOTAL_UTHMANI_PAGES) * 100))
    });

    setCurrentScreen("reader");
  };

  // Add Bookmark
  const handleAddBookmark = () => {
    const sMeta = ALL_SURAHS.find((s) => s.id === readerSurahId) || ALL_SURAHS[0];
    const loc = getHafiziLocationForAyah(readerSurahId, 1);
    const newBm = {
      id: `bm-${Date.now()}`,
      surahId: readerSurahId,
      ayah: 1,
      para: loc.para,
      page: readerPageNum,
      label: newBookmarkLabel.trim() || `সূরা ${sMeta.nameBn} (পৃষ্ঠা ${toBn(readerPageNum)})`,
      date: "আজ"
    };

    setBookmarks((prev) => [newBm, ...prev]);
    setIsAddBookmarkOpen(false);
    setNewBookmarkLabel("");
    toast.success("বুকমার্ক সফলভাবে সংরক্ষিত হয়েছে");
  };

  // Delete Bookmark
  const handleDeleteBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.success("বুকমার্ক মুছে ফেলা হয়েছে");
  };

  // Filtered Surahs for Surah List screen
  const filteredSurahsList = useMemo(() => {
    if (!surahSearchQuery.trim()) return ALL_SURAHS;
    const q = surahSearchQuery.toLowerCase().trim();
    return ALL_SURAHS.filter((s) => {
      const matchBn = s.nameBn.toLowerCase().includes(q);
      const matchEn = s.nameEn.toLowerCase().includes(q);
      const matchAr = s.nameAr.includes(q);
      const matchNum = String(s.id) === q || toBn(s.id) === q;
      return matchBn || matchEn || matchAr || matchNum;
    });
  }, [surahSearchQuery]);

  // Filtered Paras for Para List screen
  const filteredParasList = useMemo(() => {
    if (!paraSearchQuery.trim()) return HAFIZI_PARAS;
    const q = paraSearchQuery.toLowerCase().trim();
    return HAFIZI_PARAS.filter((p) => {
      const matchBn = p.nameBn.toLowerCase().includes(q);
      const matchAr = p.nameAr.includes(q);
      const matchNum = String(p.juz) === q || toBn(p.juz) === q;
      return matchBn || matchAr || matchNum;
    });
  }, [paraSearchQuery]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#041412] via-[#051c19] to-[#08221e] text-slate-100 flex justify-center selection:bg-teal-500/30 selection:text-teal-200 relative overflow-hidden">
      {/* ── AMBIENT FLOATING ORBS / BUBBLES ANIMATION (নিচ থেকে সুন্দর ছোট ছোট বল উঠবে) ── */}
      <AmbientFloatingOrbs count={16} />

      <div className="w-full max-w-md sm:max-w-lg min-h-screen flex flex-col justify-between relative z-10 shadow-2xl overflow-x-hidden border-x border-teal-950/60 pb-20">

        {/* ── SCREEN 1: HOME DASHBOARD ── */}
        {currentScreen === "home" && (
          <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-4 animate-fadeIn">
            {/* 1. TOP APP BAR */}
            <div className="flex items-center justify-between pt-1">
              {/* App Title & Subtitle */}
              <div className="flex items-center gap-2">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-[#0c2d27]/90 border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                    title="স্টুডিওতে ফিরে যান"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-2.5 h-8 bg-gradient-to-b from-[#00d2b8] to-[#14b8a6] rounded-full shadow-[0_0_12px_rgba(0,210,184,0.6)]" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                    <span>নূর কুরআন শরীফ</span>
                  </h1>
                  <p className="text-[11px] text-teal-300/80 font-medium tracking-tight">
                    সহজে ও স্পষ্ট পবিত্র কুরআন
                  </p>
                </div>
              </div>

              {/* Action Buttons: Ad-free, Theme, Settings */}
              <div className="flex items-center gap-1.5">
                {/* Ad-free Golden Badge */}
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/60 text-amber-300 font-black text-[11px] flex items-center gap-1 shadow-xs hover:border-amber-400 transition cursor-pointer active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>বিজ্ঞাপন মুক্ত</span>
                </button>

                {/* Day / Night Theme Toggle */}
                <button
                  type="button"
                  onClick={() => setPageFilter(pageFilter === "night" ? "day" : "night")}
                  className="w-8 h-8 rounded-full bg-[#0c2d27]/90 border border-teal-500/30 text-amber-400 flex items-center justify-center hover:bg-teal-900/50 transition cursor-pointer shadow-xs active:scale-95"
                  title="থিম পরিবর্তন"
                >
                  {pageFilter === "night" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-teal-300" />}
                </button>

                {/* Settings Icon */}
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-[#0c2d27]/90 border border-teal-500/30 text-slate-300 flex items-center justify-center hover:text-white hover:bg-teal-900/50 transition cursor-pointer shadow-xs active:scale-95"
                  title="সেটিংস"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. DATE, CALENDAR & SUN-TIME HERO BANNER */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0c2d27]/90 via-[#0a2621]/95 to-[#08201b]/95 border border-teal-500/25 p-4 sm:p-5 shadow-xl overflow-hidden space-y-3.5">
              {/* Subtle background Islamic geometric watermark */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-teal-500/10 pointer-events-none" />
              <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full border border-teal-500/15 pointer-events-none" />

              <div className="text-center space-y-2">
                {/* Live Current Date */}
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  সোমবার, ৯ নভেম্বর ২০২৬
                </h2>

                {/* Side-by-side Bengali & Hijri date badges */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-950/70 border border-teal-500/40 text-teal-300 text-xs font-bold">
                    ২৪ কার্তিক ১৪৩৩ বঙ্গাব্দ
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    ২৯ জমাদিউল আউয়াল ১৪৪৮ হিজরি
                  </span>
                </div>

                {/* Hero Tagline */}
                <p className="text-xs font-extrabold text-amber-400/90 pt-1 tracking-wide">
                  বিশ্বসেরা হাফেজদের পছন্দের কুরআন
                </p>
              </div>

              {/* Sunrise & Sunset Pills */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-teal-900/40">
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-black/30 border border-teal-500/20 text-xs text-slate-300">
                  <span className="text-amber-400 text-sm">🌅</span>
                  <span>সূর্যোদয়: ০৬:০৯ AM</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-black/30 border border-teal-500/20 text-xs text-slate-300">
                  <span className="text-amber-500 text-sm">🌇</span>
                  <span>সূর্যাস্ত: ০৫:১৫ PM</span>
                </div>
              </div>
            </div>

            {/* 3. REWARDED AD-FREE MODE CARD */}
            <div className="rounded-2xl bg-[#0c2d27]/80 border border-teal-500/20 p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-[#00d2b8] shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    বিজ্ঞাপন মুক্ত মোড সক্রিয়
                  </h3>
                  <p className="text-[11px] text-teal-300/80">
                    বাকি: {formatCountdown(adFreeRemainingSeconds)} • বাড়াতে চাপুন
                  </p>
                </div>
              </div>

              {/* + বাড়ান Action Button */}
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-[#00d2b8] hover:text-white font-black text-xs shadow-xs active:scale-95 transition cursor-pointer"
              >
                +বাড়ান
              </button>
            </div>

            {/* 4. CONTINUE READING SECTION ("পড়া চালিয়ে যান") */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#00d2b8] rounded-full shadow-[0_0_8px_rgba(0,210,184,0.8)]" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  পড়া চালিয়ে যান
                </h3>
              </div>

              {/* Interactive Continue Reading Card */}
              <div
                onClick={() => {
                  setReaderSurahId(lastRead.surahId);
                  setReaderPageNum(lastRead.page);
                  setCurrentScreen("reader");
                }}
                className="rounded-2xl bg-[#0c2d27]/85 hover:bg-[#0f3730] border border-teal-500/25 p-3.5 sm:p-4 shadow-xl transition-all cursor-pointer active:scale-[0.99] group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 suppressHydrationWarning className="text-xs sm:text-sm font-black text-white group-hover:text-[#00d2b8] transition-colors">
                        সর্বশেষ পঠিত — সূরা {ALL_SURAHS.find((s) => s.id === lastRead.surahId)?.nameBn || "আল-বাকারা"}
                      </h4>
                      <p suppressHydrationWarning className="text-[11px] text-teal-300/80 font-medium">
                        পারা {toBn(lastRead.para)} • পৃষ্ঠা {toBn(lastRead.page)}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Progress Bar with Bengali Numerals */}
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="flex-1 h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-teal-500/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00d2b8] to-[#14b8a6] shadow-[0_0_8px_rgba(0,210,184,0.6)]"
                      style={{ width: `${Math.max(3, lastRead.percentage)}%` }}
                    />
                  </div>
                  <span suppressHydrationWarning className="text-[11px] font-black text-teal-300">
                    {toBn(lastRead.percentage)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 5. ALL FEATURES 2x3 GRID ("সকল ফিচার") */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#00d2b8] rounded-full shadow-[0_0_8px_rgba(0,210,184,0.8)]" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  সকল ফিচার
                </h3>
              </div>

              {/* 2x3 Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. সূরা সমূহ */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("surahs")}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <List className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    সূরা সমূহ
                  </span>
                </button>

                {/* 2. পারা সমূহ */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("paras")}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    পারা সমূহ
                  </span>
                </button>

                {/* 3. পৃষ্ঠা সার্চ */}
                <button
                  type="button"
                  onClick={() => setIsPageSearchOpen(true)}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    পৃষ্ঠা সার্চ
                  </span>
                </button>

                {/* 4. সর্বশেষ পঠিত */}
                <button
                  type="button"
                  onClick={() => {
                    setReaderSurahId(lastRead.surahId);
                    setReaderPageNum(lastRead.page);
                    setCurrentScreen("reader");
                  }}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    সর্বশেষ পঠিত
                  </span>
                </button>

                {/* 5. বুকমার্ক */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("bookmarks")}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    বুকমার্ক
                  </span>
                </button>

                {/* 6. তাসবীহ */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("tasbih")}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-4 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all shadow-xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-teal-300">
                    তাসবীহ
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 2: SURAH LIST ("সূরা সমূহ") ── */}
        {currentScreen === "surahs" && (
          <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 animate-fadeIn">
            {/* Header with Back */}
            <div className="flex items-center justify-between pb-2 border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-black text-white">সূরা সমূহ</h2>
                  <p className="text-[11px] text-teal-300/80 font-medium">১১৪ টি সূরা</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                placeholder="সূরার নাম বা নম্বর লিখুন..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c2d27]/90 border border-teal-500/30 text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
              />
            </div>

            {/* Surah List Cards */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {filteredSurahsList.map((surah) => {
                const loc = getHafiziLocationForAyah(surah.id, 1);
                return (
                  <div
                    key={surah.id}
                    onClick={() => handleSelectSurah(surah.id)}
                    className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-3 flex items-center justify-between shadow-md transition-all cursor-pointer active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Surah Number Badge */}
                      <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/35 flex items-center justify-center font-black text-xs text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all">
                        {toBn(surah.id)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-teal-300 transition-colors">
                          সূরা {surah.nameBn}
                        </h4>
                        <p className="text-[11px] text-slate-300 italic">
                          {surah.meaningBn} • {toBn(surah.versesCount)} আয়াত
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-teal-950/80 text-[10px] text-teal-300 font-bold border border-teal-500/30">
                            পারা {toBn(loc.para)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-teal-950/80 text-[10px] text-amber-300 font-bold border border-amber-500/30">
                            পৃষ্ঠা {toBn(loc.uthmaniPage || 1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arabic Calligraphy Name */}
                    <div className="font-hafizi-quran text-lg sm:text-xl font-bold text-[#00d2b8] group-hover:scale-105 transition-transform" dir="rtl">
                      {surah.nameAr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SCREEN 3: PARA LIST ("পারা সমূহ") ── */}
        {currentScreen === "paras" && (
          <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 animate-fadeIn">
            {/* Header with Back */}
            <div className="flex items-center justify-between pb-2 border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-black text-white">পারা সমূহ</h2>
                  <p className="text-[11px] text-teal-300/80 font-medium">৩০ টি পারা</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paraSearchQuery}
                onChange={(e) => setParaSearchQuery(e.target.value)}
                placeholder="পারার নাম বা নম্বর লিখুন..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0c2d27]/90 border border-teal-500/30 text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
              />
            </div>

            {/* Para List Cards */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {filteredParasList.map((para) => (
                <div
                  key={para.juz}
                  onClick={() => handleJumpToParaAndPage(para.juz, 1)}
                  className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-3 flex items-center justify-between shadow-md transition-all cursor-pointer active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3">
                    {/* Para Number Badge */}
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/35 flex items-center justify-center font-black text-xs text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all">
                      {toBn(para.juz)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-teal-300 transition-colors">
                        {para.nameBn}
                      </h4>
                      <p className="text-[11px] text-teal-300/80 font-medium">
                        পৃষ্ঠা: {toBn(para.startPage)} – {toBn(para.endPage)} ({toBn(para.totalPages)} পৃষ্ঠা)
                      </p>
                    </div>
                  </div>

                  {/* Arabic Para Name */}
                  <div className="font-hafizi-quran text-lg sm:text-xl font-bold text-[#00d2b8] group-hover:scale-105 transition-transform" dir="rtl">
                    {para.nameAr}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCREEN 4: DIGITAL TASBIH MODULE ("ডিজিটাল তাসবীহ") ── */}
        {currentScreen === "tasbih" && (
          <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-4 animate-fadeIn">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-black text-white">ডিজিটাল তাসবীহ</h2>
              </div>

              {/* Sound & Reset Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTasbihSound(!tasbihSound)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    tasbihSound
                      ? "bg-teal-950/80 border-teal-500/40 text-[#00d2b8]"
                      : "bg-black/30 border-slate-700 text-slate-500"
                  }`}
                  title={tasbihSound ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
                >
                  {tasbihSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTasbihCount(0);
                    toast.info("তাসবীহ কাউন্ট রিসেট করা হয়েছে");
                  }}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                  title="কাউন্টার রিসেট করুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dhikr Selector Card */}
            <div className="rounded-2xl bg-[#0c2d27]/90 border border-teal-500/25 p-4 text-center space-y-2 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                <button
                  type="button"
                  onClick={() => setActiveDhikrIndex((prev) => (prev > 0 ? prev - 1 : DHIKRS.length - 1))}
                  className="p-1 rounded-lg hover:bg-teal-900/50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-[10px] font-black">
                  জিকির নং: {toBn(activeDhikrIndex + 1)} / {toBn(DHIKRS.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDhikrIndex((prev) => (prev < DHIKRS.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded-lg hover:bg-teal-900/50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2">
                <h3 className="font-hafizi-quran text-2xl sm:text-3xl font-black text-amber-400 tracking-wide">
                  {DHIKRS[activeDhikrIndex].ar}
                </h3>
                <p className="text-sm font-extrabold text-[#00d2b8] mt-1">
                  {DHIKRS[activeDhikrIndex].bn}
                </p>
                <p className="text-xs text-slate-300 opacity-80 italic">
                  ({DHIKRS[activeDhikrIndex].meaning})
                </p>
              </div>
            </div>

            {/* Target Selector Pills */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-300 mr-1">লক্ষ্য:</span>
              {[33, 99, 100, 500, 1000].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTasbihTarget(t);
                    setTasbihCount(0);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    tasbihTarget === t
                      ? "bg-[#00d2b8] text-slate-950 shadow-[0_0_10px_rgba(0,210,184,0.5)] scale-105"
                      : "bg-[#0c2d27]/80 text-teal-300 border border-teal-500/20 hover:border-teal-500/40"
                  }`}
                >
                  {toBn(t)}
                </button>
              ))}
            </div>

            {/* Interactive Circular Bead Counter */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div
                onClick={handleTasbihTap}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#0a2721] via-[#0e3b32] to-[#09221d] border-4 border-teal-500/40 shadow-[0_0_35px_rgba(0,210,184,0.3)] flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform select-none relative"
              >
                {/* 33 Animated Bead Dots Ring */}
                <div className="absolute inset-2 rounded-full border border-teal-500/20 pointer-events-none" />

                <span className="text-xs font-extrabold text-teal-400/80 mb-1">
                  লক্ষ্য: {toBn(tasbihTarget)}
                </span>
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,210,184,0.6)]">
                  {toBn(tasbihCount)}
                </span>
                <span className="text-xs font-bold text-teal-300 mt-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-400/30">
                  ট্যাপ করুন
                </span>
              </div>
            </div>

            {/* Bottom Statistics Cards (2 Columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#0c2d27]/80 border border-teal-500/20 p-3 text-center space-y-0.5">
                <p className="text-[11px] text-teal-300/80 font-bold">সম্পূর্ণ রাউন্ড</p>
                <h4 className="text-lg font-black text-white">{toBn(tasbihRounds)} বার</h4>
                <span className="text-[10px] text-amber-300 font-bold">
                  {toBn(tasbihTarget)} গুণে
                </span>
              </div>
              <div className="rounded-2xl bg-[#0c2d27]/80 border border-teal-500/20 p-3 text-center space-y-0.5">
                <p className="text-[11px] text-teal-300/80 font-bold">সর্বমোট জিকির</p>
                <h4 className="text-lg font-black text-[#00d2b8]">{toBn(tasbihTotal)} বার</h4>
                <span className="text-[10px] text-slate-400 font-bold">সব মিলিয়ে</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 5: BOOKMARKS SCREEN ("বুকমার্ক") ── */}
        {currentScreen === "bookmarks" && (
          <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 animate-fadeIn">
            {/* Header with Back */}
            <div className="flex items-center justify-between pb-2 border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-black text-white">বুকমার্ক</h2>
              </div>
            </div>

            {/* Bookmarks List */}
            {bookmarks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8]">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black text-white">কোনো বুকমার্ক নেই</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  কুরআন পড়ার সময় বুকমার্ক বাটন চাপ দিয়ে পৃষ্ঠা সংরক্ষণ করুন
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="rounded-2xl bg-[#0c2d27]/80 hover:bg-[#0f3730] border border-teal-500/20 p-3.5 flex items-center justify-between shadow-md transition-all cursor-pointer group"
                  >
                    <div
                      onClick={() => {
                        setReaderSurahId(bm.surahId);
                        setReaderPageNum(bm.page);
                        setCurrentScreen("reader");
                      }}
                      className="flex-1 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00d2b8] group-hover:bg-[#00d2b8] group-hover:text-slate-950 transition-all">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#00d2b8] transition-colors">
                          {bm.label}
                        </h4>
                        <p className="text-[11px] text-teal-300/80 font-medium">
                          পারা {toBn(bm.para)} • পৃষ্ঠা {toBn(bm.page)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBookmark(bm.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                      title="বুকমার্ক মুছুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 6: ADVANCED QURAN READER VIEW ("তাহফিজ কুরআন রিডার") ── */}
        {currentScreen === "reader" && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            {/* Top Reader Action Bar */}
            <div className="sticky top-0 z-40 bg-[#041412]/95 border-b border-teal-900/60 backdrop-blur-md px-3 py-2.5 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                  title="হোমে ফিরে যান"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-white truncate">
                    সূরা {getHafiziPageMeta(readerPageNum)?.firstSurahMeta?.nameBn || ALL_SURAHS.find((s) => s.id === readerSurahId)?.nameBn || "আল-বাকারা"}
                  </h3>
                  <p className="text-[10px] text-teal-300/80 font-bold">
                    পারা {toBn(getHafiziPageMeta(readerPageNum)?.para || getHafiziLocation(readerPageNum).para)} • পৃষ্ঠা {toBn(readerPageNum)}
                  </p>
                </div>
              </div>

              {/* 4 Action Icons: Search, Bookmark, Filter, Mode Toggle */}
              <div className="flex items-center gap-1.5">
                {/* Search Icon */}
                <button
                  type="button"
                  onClick={() => setIsPageSearchOpen(true)}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                  title="পৃষ্ঠায় যান"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                {/* Bookmark Icon */}
                <button
                  type="button"
                  onClick={() => setIsAddBookmarkOpen(true)}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-teal-300 hover:text-white transition cursor-pointer"
                  title="বুকমার্ক যোগ করুন"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                {/* Reading Filter (Day / Sepia / Night) */}
                <button
                  type="button"
                  onClick={() => {
                    const nextFilter = pageFilter === "night" ? "day" : pageFilter === "day" ? "sepia" : "night";
                    setPageFilter(nextFilter);
                    toast.success(`ফিল্টার: ${nextFilter === "night" ? "নাইট মোড" : nextFilter === "day" ? "ডে মোড" : "সেপিয়া মোড"}`);
                  }}
                  className="p-1.5 rounded-xl bg-[#0c2d27] border border-teal-500/30 text-amber-400 hover:text-white transition cursor-pointer"
                  title="পড়ার ফিল্টার পরিবর্তন করুন"
                >
                  {pageFilter === "night" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>

                {/* Reading Mode (Mushaf vs Ayah) */}
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = readerMode === "mushaf" ? "ayah" : "mushaf";
                    setReaderMode(nextMode);
                    toast.success(`মোড: ${nextMode === "mushaf" ? "১৫ লাইনের হাফেজী মুসহাফ" : "আয়াত ভিউ"}`);
                  }}
                  className="px-2 py-1 rounded-xl bg-teal-950 border border-teal-500/40 text-[#00d2b8] text-[10px] font-black transition cursor-pointer"
                  title="রিডিং মোড টগল"
                >
                  {readerMode === "mushaf" ? "হাফেজী" : "আয়াত"}
                </button>
              </div>
            </div>

            {/* The Quran Reader Content */}
            <div className="flex-1 p-1 sm:p-3 pb-24">
              {readerMode === "mushaf" ? (
                <HafiziMushafSheet
                  pageNum={readerPageNum}
                  onPageChange={(p) => {
                    setReaderPageNum(p);
                    setLastRead((prev) => ({
                      ...prev,
                      page: p,
                      percentage: Math.min(100, Math.round((p / TOTAL_UTHMANI_PAGES) * 100))
                    }));
                  }}
                  onJumpToParaPage={handleJumpToParaAndPage}
                  onPlayAyah={handlePlayAyah}
                  playingAyahNumber={playingAyahNumber}
                  playingSurahId={playingSurahId}
                  isPlayingAudio={isPlayingAudio}
                  activeWordIndex={activeWordIndex}
                  targetHighlightAyah={targetHighlightAyah}
                  readerTheme={pageFilter === "day" ? "day" : "night"}
                  getSurahData={getSurahData}
                  selectedQari={selectedQari}
                  onSelectQari={(qId) => setSelectedQari(qId)}
                  onOpenSearch={() => setIsPageSearchOpen(true)}
                />
              ) : (
                <QuranReader
                  initialSurah={readerSurahId}
                  onLaunchNurEngine={onLaunchNurEngine}
                />
              )}
            </div>

            {/* ── FLOATING QARI AUDIO CONTROLLER BAR ── */}
            {playingAyahNumber && (
              <div className="fixed bottom-[72px] sm:bottom-20 inset-x-2 z-40 p-2.5 rounded-2xl bg-[#08221c]/95 border-2 border-amber-500/60 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 animate-fadeIn text-white max-w-md mx-auto">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black truncate text-amber-300">
                      সূরা {ALL_SURAHS.find((s) => s.id === playingSurahId)?.nameBn || "আল-বাকারা"} — আয়াত {toBn(playingAyahNumber)}
                    </p>
                    {/* Qari Selector Dropdown */}
                    <select
                      value={selectedQari}
                      onChange={(e) => {
                        const qId = e.target.value;
                        setSelectedQari(qId);
                        setStoredQariPreference(qId);
                        handlePlayAyah(playingAyahNumber, playingSurahId);
                      }}
                      className="text-[10px] bg-black/50 text-teal-300 border border-teal-500/30 rounded px-1.5 py-0.5 mt-0.5 font-bold focus:outline-none cursor-pointer max-w-full truncate"
                    >
                      {QARI_REGISTRY.map((q) => (
                        <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                          {q.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayAyah(Math.max(1, playingAyahNumber - 1), playingSurahId)}
                    className="p-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-500/30 text-teal-300 transition cursor-pointer"
                    title="পূর্ববর্তী আয়াত"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayAyah(playingAyahNumber, playingSurahId)}
                    className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-95 transition cursor-pointer"
                    title={isPlayingAudio ? "থামান" : "বাজান"}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayAyah(playingAyahNumber + 1, playingSurahId)}
                    className="p-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-500/30 text-teal-300 transition cursor-pointer"
                    title="পরবর্তী আয়াত"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="অডিও বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 6. FIXED BOTTOM NAVIGATION BAR ── */}
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#041412]/95 border-t border-teal-900/70 backdrop-blur-md px-1.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-1 shadow-2xl max-w-md sm:max-w-lg mx-auto">
          {/* 1. হোম */}
          <button
            type="button"
            onClick={() => {
              setBottomNavTab("home");
              setCurrentScreen("home");
            }}
            className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer bg-transparent border-0 outline-none py-1 px-1 rounded-xl hover:bg-teal-950/40 ${
              currentScreen === "home" ? "text-[#00d2b8]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">হোম</span>
          </button>

          {/* 2. নূর কায়দা (সরাসরি নূরানী কায়দা ও গেমসে যাওয়ার বাটন) */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToFeature) {
                onNavigateToFeature("noor-qaida");
              } else if (typeof window !== "undefined") {
                window.location.href = "/quran-tutor/studio?feature=noor-qaida";
              }
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 text-slate-400 hover:text-[#00d2b8] transition cursor-pointer bg-transparent border-0 outline-none py-1 px-1 rounded-xl hover:bg-teal-950/40"
            title="নূর কায়দা ও মাশক"
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap truncate max-w-full text-teal-300">নূর কায়দা</span>
          </button>

          {/* 3. সার্চ (ELEVATED GLOWING CYAN FLOATING BUTTON IN CENTER) */}
          <div className="-mt-6 shrink-0 px-1">
            <button
              type="button"
              onClick={() => setIsPageSearchOpen(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#00d2b8] to-[#14b8a6] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,184,0.7)] border-2 border-white/40 active:scale-95 transition cursor-pointer"
              title="পৃষ্ঠা ও সূরা সার্চ"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 4. আমপারা (৩০তম পারা) */}
          <button
            type="button"
            onClick={() => {
              // Jump directly to Amma Para (Para 30, Page 1 of Para 30)
              handleJumpToParaAndPage(30, 1);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 text-slate-400 hover:text-[#00d2b8] transition cursor-pointer bg-transparent border-0 outline-none py-1 px-1 rounded-xl hover:bg-teal-950/40"
            title="আমপারা (৩০তম পারা)"
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap truncate max-w-full">আমপারা</span>
          </button>

          {/* 5. তাসবীহ */}
          <button
            type="button"
            onClick={() => {
              setBottomNavTab("tasbih");
              setCurrentScreen("tasbih");
            }}
            className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer bg-transparent border-0 outline-none py-1 px-1 rounded-xl hover:bg-teal-950/40 ${
              currentScreen === "tasbih" ? "text-[#00d2b8]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">তাসবীহ</span>
          </button>
        </div>

        {/* ── MODAL 1: SMART 3-TABBED PAGE SEARCH MODAL ("পৃষ্ঠা ও আয়াত সন্ধান") ── */}
        {isPageSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#09221e] border-2 border-teal-500/40 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-900/60">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#00d2b8]" />
                  <h3 className="font-black text-sm text-white">সন্ধান ও পৃষ্ঠা নির্বাচন</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPageSearchOpen(false)}
                  className="p-1 rounded-lg hover:bg-teal-900/50 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Tabs Header: পারা ও পৃষ্ঠা | সূরা ও আয়াত | সরাসরি পৃষ্ঠা */}
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-teal-500/20">
                <button
                  type="button"
                  onClick={() => setSearchModalTab("para")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    searchModalTab === "para"
                      ? "bg-[#00d2b8] text-slate-950 font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  পারা ও পৃষ্ঠা
                </button>
                <button
                  type="button"
                  onClick={() => setSearchModalTab("surah")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    searchModalTab === "surah"
                      ? "bg-[#00d2b8] text-slate-950 font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  সূরা ও আয়াত
                </button>
                <button
                  type="button"
                  onClick={() => setSearchModalTab("page")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    searchModalTab === "page"
                      ? "bg-[#00d2b8] text-slate-950 font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  পৃষ্ঠা নম্বর
                </button>
              </div>

              {/* ── TAB 1: PARA & PAGE (হাফেজী নিয়ম: ১নং এ ২১, ২৯নং এ ২৪, ৩০নং এ ২৫, বাকিগুলো ২০) ── */}
              {searchModalTab === "para" && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      পারা নির্বাচন করুন:
                    </label>
                    <select
                      value={searchParaNum}
                      onChange={(e) => setSearchParaNum(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8] cursor-pointer"
                    >
                      {HAFIZI_PARAS.map((p) => (
                        <option key={p.juz} value={p.juz} className="bg-slate-900 text-white">
                          {p.nameBn} • {p.nameAr} ({toBn(p.totalPages)} পৃষ্ঠা)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      এই পারার কততম পৃষ্ঠা? (১ থেকে {toBn(HAFIZI_PARAS[searchParaNum - 1]?.totalPages || 20)}):
                    </label>
                    <input
                      type="text"
                      value={searchParaPageNum}
                      onChange={(e) => setSearchParaPageNum(e.target.value)}
                      placeholder={`১ থেকে ${HAFIZI_PARAS[searchParaNum - 1]?.totalPages || 20}`}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
                    />
                  </div>

                  {/* Calculation Badge */}
                  <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-bold space-y-0.5">
                    <p>
                      {toBn(searchParaNum)}নং পারা • পৃষ্ঠা {toBn(searchParaPageNum || 1)}
                    </p>
                    <p className="text-[11px] text-amber-300">
                      = সম্পূর্ণ কুরআনের {toBn((HAFIZI_PARAS[searchParaNum - 1]?.startPage || 1) + (Number(searchParaPageNum || 1) - 1))} নম্বর পৃষ্ঠা
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPageSearchOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-slate-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToParaAndPage(searchParaNum, searchParaPageNum)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2b8] to-[#14b8a6] text-slate-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer"
                    >
                      পৃষ্ঠায় যান
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 2: SURAH & AYAH (সূরা ও আয়াত নির্বাচন) ── */}
              {searchModalTab === "surah" && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      সূরা নির্বাচন করুন:
                    </label>
                    <select
                      value={searchSurahId}
                      onChange={(e) => setSearchSurahId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8] cursor-pointer"
                    >
                      {ALL_SURAHS.map((s) => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                          {toBn(s.id)}. সূরা {s.nameBn} ({s.nameAr}) — {toBn(s.versesCount)} আয়াত
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      আয়াত নম্বর লিখুন (১ থেকে {toBn(ALL_SURAHS.find((s) => s.id === searchSurahId)?.versesCount || 7)}):
                    </label>
                    <input
                      type="text"
                      value={searchAyahNum}
                      onChange={(e) => setSearchAyahNum(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleJumpToSurahAndAyah(searchSurahId, searchAyahNum || 1);
                        }
                      }}
                      placeholder="আয়াত নম্বর (যেমন: ২৫৫)"
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPageSearchOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-slate-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToSurahAndAyah(searchSurahId, searchAyahNum || 1)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer"
                    >
                      সরাসরি আয়াতে যান
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 3: DIRECT GLOBAL PAGE (সরাসরি পৃষ্ঠা ১-৬১০) ── */}
              {searchModalTab === "page" && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      পৃষ্ঠা নম্বর লিখুন (১ থেকে ৬১০):
                    </label>
                    <input
                      type="text"
                      value={searchDirectPage}
                      onChange={(e) => setSearchDirectPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleJumpToDirectPage(searchDirectPage);
                        }
                      }}
                      placeholder="যেমন: ৪২ বা ১৮২"
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-bold">
                    হাফেজী কুরআন ৬১০ পৃষ্ঠার স্ট্যান্ডার্ড অনুযায়ী নির্ধারিত পৃষ্ঠায় সরাসরি নিয়ে যাবে।
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPageSearchOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-slate-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToDirectPage(searchDirectPage)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2b8] to-[#14b8a6] text-slate-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer"
                    >
                      পৃষ্ঠায় যান
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 2: ADD BOOKMARK MODAL ("বুকমার্ক যোগ করুন") ── */}
        {isAddBookmarkOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#09221e] border-2 border-teal-500/40 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-900/60">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#00d2b8]" />
                  <h3 className="font-black text-sm text-white">বুকমার্ক যোগ করুন</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBookmarkOpen(false)}
                  className="p-1 rounded-lg hover:bg-teal-900/50 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-bold">
                  সূরা {ALL_SURAHS.find((s) => s.id === readerSurahId)?.nameBn} • পৃষ্ঠা {toBn(readerPageNum)}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    বুকমার্কের নাম লিখুন:
                  </label>
                  <input
                    type="text"
                    value={newBookmarkLabel}
                    onChange={(e) => setNewBookmarkLabel(e.target.value)}
                    placeholder="ঐচ্ছিক নাম (যেমন: ফজর তিলাওয়াত)"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-teal-500/30 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00d2b8]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddBookmarkOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-slate-300 font-bold text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBookmark}
                    className="flex-1 py-2.5 rounded-xl bg-[#00d2b8] text-slate-950 font-black text-xs shadow-md active:scale-95"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 3: REWARDED AD BONUS MODAL ── */}
        {isRewardModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#09221e] border-2 border-amber-500/40 p-5 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-400 mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-black text-base text-white">বিজ্ঞাপন মুক্ত সময় বাড়ান</h3>
                <p className="text-xs text-amber-300 font-bold mt-1">
                  একটি ছোট ভিডিও দেখলে আরও +৩ ঘণ্টা বিজ্ঞাপন মুক্ত পাঠ উপভোগ করুন!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  বর্তমানে বাকি আছে: {formatCountdown(adFreeRemainingSeconds)}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isWatchingAd}
                  onClick={() => setIsRewardModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  পরে করব
                </button>
                <button
                  type="button"
                  disabled={isWatchingAd}
                  onClick={handleWatchRewardedAd}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  {isWatchingAd ? (
                    <span>বোনাস যোগ হচ্ছে...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>ভিডিও দেখুন (+৩ ঘণ্টা)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 4: SETTINGS MODAL ("সেটিংস মেনু") ── */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#09221e] border-2 border-teal-500/40 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-900/60">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#00d2b8]" />
                  <h3 className="font-black text-sm text-white">অ্যাপ সেটিংস</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-teal-900/40 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Theme Mode */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-teal-500/20">
                  <span className="font-bold text-slate-200">রিডিং থিম</span>
                  <button
                    type="button"
                    onClick={() => setPageFilter(pageFilter === "night" ? "day" : pageFilter === "day" ? "sepia" : "night")}
                    className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-500/40 text-[#00d2b8] font-bold"
                  >
                    {pageFilter === "night" ? "নাইট মোড" : pageFilter === "day" ? "ডে মোড" : "সেপিয়া মোড"}
                  </button>
                </div>

                {/* Tasbih Sound */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-teal-500/20">
                  <span className="font-bold text-slate-200">তাসবীহ সাউন্ড</span>
                  <button
                    type="button"
                    onClick={() => setTasbihSound(!tasbihSound)}
                    className={`px-2.5 py-1 rounded-lg border font-bold ${
                      tasbihSound
                        ? "bg-teal-950 border-teal-500/50 text-[#00d2b8]"
                        : "bg-black/50 border-slate-700 text-slate-500"
                    }`}
                  >
                    {tasbihSound ? "চালু" : "বন্ধ"}
                  </button>
                </div>

                {/* Info Card */}
                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-center space-y-1">
                  <p className="font-black text-white text-xs">তাহফিজ কুরআন শরীফ</p>
                  <p className="text-[11px] text-teal-300">১৫ লাইনের হাফেজী কুরআন ও ডিজিটাল তাসবীহ</p>
                  <p className="text-[10px] text-slate-400">সংস্করণ ২.০ • সার্বিক তত্ত্বাবধানে রাহমানিয়া ইনস্টিটিউট</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#00d2b8] hover:bg-[#14b8a6] text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
