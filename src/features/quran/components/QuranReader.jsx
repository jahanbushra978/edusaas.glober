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
  ArrowRight,
  ArrowUp,
  GraduationCap
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
  parseHafiziSearchQuery,
  getHafiziLocationForAyah,
  TOTAL_UTHMANI_PAGES
} from "@/lib/quran/hafizi-pages";
import HafiziMushafSheet from "./HafiziMushafSheet";
import { useBanglaAudioEngine } from "@/lib/quran/bangla-audio-engine";
import {
  loadChapterSegments,
  getActiveArabicWordDetails,
  splitArabicAyahWords,
  getWordStartTimeSec,
  getUniversalAyahRepeats,
  AUTHENTIC_WAQF_GLYPH_REGEX
} from "@/lib/quran/quran-audio-timing";
import { normalizeQuranWord } from "@/lib/quran/hafizi-annotations";
import { universalAudioEngine, audioCache, audioPreloader } from "@/lib/quran/audio";

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
  const [selectedQari, setSelectedQari] = useState("minshawy_teacher");
  const [activeSpeaker, setActiveSpeaker] = useState("ustad"); // 'ustad' | 'student' (ফর মুআল্লিম ও ছাত্রদল পুনরাবৃত্তি)
  const [qariSegmentsVersion, setQariSegmentsVersion] = useState(0); // Triggers re-render when Qari segments load
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
  const playbackSessionIdRef = useRef(0);

  // Bookmarks & Word Breakdown Modal
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [wordModalAyah, setWordModalAyah] = useState(null);

  // Hafizi Quran Selection State
  const [hafiziPara, setHafiziPara] = useState(1);
  const [hafiziPage, setHafiziPage] = useState(1);
  const [pendingScrollAyah, setPendingScrollAyah] = useState(null);
  const [targetHighlightAyah, setTargetHighlightAyah] = useState(null);

  // Smart Surah & Ayah Jumper Searcher State
  const [jumperSurahId, setJumperSurahId] = useState(initialSurah);
  const [jumperAyahNum, setJumperAyahNum] = useState("");
  const [isMobileJumperOpen, setIsMobileJumperOpen] = useState(false);

  // Hafizi Para & Page Searcher State
  const [jumperTab, setJumperTab] = useState("surah"); // 'surah' | 'para'
  const [jumperParaNum, setJumperParaNum] = useState(1);
  const [jumperPageNum, setJumperPageNum] = useState("1");

  // Floating Bottom Toolbar Toggle (Show / Hide with [X] button)
  const [isFloatingBarHidden, setIsFloatingBarHidden] = useState(false);

  // Smart Scroll Direction Auto-Reveal & Back to Top
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const lastScrollY = useRef(0);

  // Synchronize jumper surah with active surah
  useEffect(() => {
    setJumperSurahId(selectedSurahId);
  }, [selectedSurahId]);

  // Smart Scroll-Up detection to reveal top controls & show Back-to-Top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY.current + 8) {
        setIsNavVisible(false); // scrolling down
      } else if (currentScrollY < lastScrollY.current - 6 || currentScrollY <= 40) {
        setIsNavVisible(true); // scrolling up
      }
      setShowBackToTop(currentScrollY > 320);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Direct Jump to Surah and Ayah (Smart Searcher)
  const handleDirectAyahJump = (targetSurahId, targetAyahNumber) => {
    const sId = Math.max(1, Math.min(114, Number(targetSurahId) || selectedSurahId));
    const sMeta = ALL_SURAHS.find((s) => s.id === sId) || ALL_SURAHS[0];
    const aNum = Math.max(1, Math.min(sMeta.versesCount, Number(targetAyahNumber) || 1));

    setTargetHighlightAyah({ surah: sId, ayah: aNum });
    setIsMobileJumperOpen(false);

    if (viewMode === "mushaf") {
      const loc = getHafiziLocationForAyah(sId, aNum);
      const targetPage = loc.uthmaniPage || Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((loc.globalPage / 610) * TOTAL_UTHMANI_PAGES)));
      setHafiziPage(targetPage);
      setSelectedSurahId(sId);
      toast.success(`সূরা ${sMeta.nameBn}, আয়াত ${aNum} — হাফেজী পৃষ্ঠা ${targetPage}, ${loc.nameBn}`);
    } else {
      if (sId !== selectedSurahId) {
        setSelectedSurahId(sId);
      }
      setPendingScrollAyah(aNum);
      toast.success(`সূরা ${sMeta.nameBn}, আয়াত ${aNum}-এ যাওয়া হচ্ছে`);
    }
  };

  // Direct Jump to Hafizi Para & Page (হাফেজী পারা ও পৃষ্ঠা নির্বাচন)
  const handleDirectParaPageJump = (paraNum, pageInput) => {
    const p = Math.max(1, Math.min(30, Number(paraNum) || 1));
    const paraInfo = HAFIZI_PARAS[p - 1];

    let targetPage;
    const customPage = parseInt(String(pageInput).trim(), 10);
    const target = getHafiziPageTarget(p, !isNaN(customPage) ? customPage : 1);
    targetPage = target.uthmaniPage || target.globalPage;

    setHafiziPage(targetPage);
    setViewMode("mushaf");
    setIsMobileJumperOpen(false);
    toast.success(`হাফেজী ${paraInfo.nameBn} (${paraInfo.nameAr}) — পৃষ্ঠা ${targetPage}-এ যাওয়া হয়েছে`);
  };

  const handleSwitchToMushaf = () => {
    const currentAyah = playingAyahNumber || pendingScrollAyah || 1;
    const loc = getHafiziLocationForAyah(selectedSurahId, currentAyah);
    const targetPage = loc.uthmaniPage || Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((loc.globalPage / 610) * TOTAL_UTHMANI_PAGES)));
    setHafiziPage(targetPage);
    setViewMode("mushaf");
    toast.success(`হাফেজী মুসহাফ মোড — পৃষ্ঠা ${targetPage}`);
  };

  const handleSwitchToAyah = () => {
    setViewMode("ayah");
  };

  // Universal Authentic Human Male Bengali Audio Engine
  const {
    currentId: playingBanglaId,
    isLoading: isBanglaLoading,
    activeWordIndex: activeBanglaWordIndex,
    toggle: toggleBanglaAudio,
    stop: stopBanglaAudio,
    activeEngine: activeBanglaEngine,
    setActiveEngine: setActiveBanglaEngine,
    activeElVoice,
    setActiveElVoice,
    elVoices,
  } = useBanglaAudioEngine();

  const handleToggleBangla = (text, id) => {
    if (!text) {
      toast.error("এই আয়াতের বাংলা অনুবাদ পাওয়া যায়নি");
      return;
    }
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
    let isMounted = true;
    if (selectedSurahId) {
      loadChapterSegments(selectedSurahId, selectedQari).then((map) => {
        if (isMounted && map) {
          setQariSegmentsVersion((prev) => prev + 1);
        }
      });
    }
    return () => {
      isMounted = false;
    };
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

  // Auto-scroll active reciting Ayah smoothly into view (only if out of viewport, preventing screen jumps)
  useEffect(() => {
    if (playingAyahNumber && !isLoadingSurah) {
      const scrollTimer = setTimeout(() => {
        const el =
          document.getElementById(`mushaf-ayah-${playingAyahNumber}`) ||
          document.getElementById(`ayah-${playingAyahNumber}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const isInViewport =
            rect.top >= 80 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 80;
          if (!isInViewport) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
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
            universalAudioEngine.stopAll();
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
      const nextAyah = currentAyah + 1;
      // Auto page flip to next Hafizi Mushaf page if next Ayah is on the next page
      const loc = getHafiziLocationForAyah(selectedSurahIdRef.current, nextAyah);
      if (loc && loc.uthmaniPage && loc.uthmaniPage !== hafiziPage) {
        setHafiziPage(loc.uthmaniPage);
      }
      startNewAyahAudio(nextAyah, 0);
    } else {
      // Last Ayah of Surah reached
      if (repeatModeRef.current === "surah") {
        startNewAyahAudio(1, 0);
      } else if (selectedSurahIdRef.current < 114) {
        // Seamless auto-advance to next Surah: Recitation never stops until paused!
        const nextSurahId = selectedSurahIdRef.current + 1;
        handleSelectSurah(nextSurahId);
        setTimeout(() => {
          startNewAyahAudio(1, 0);
        }, 450);
        const nextMeta = ALL_SURAHS.find((s) => s.id === nextSurahId);
        toast.success(`শুরু হচ্ছে: সূরা ${nextMeta?.nameBn || nextSurahId}`);
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
        toast.success(`মাশাআল্লাহ! পবিত্র কুরআন তিলাওয়াত সমাপ্ত হয়েছে।`);
      }
    }
  };

  const startNewAyahAudio = (ayahNumber, startWordIdx = 0, words = null) => {
    const currentSurah = surahDataRef.current;
    if (!currentSurah?.ayahs?.length) return;

    // 1. Monotonic session ID to eliminate ANY concurrent/overlapping playback
    const thisSessionId = ++playbackSessionIdRef.current;

    // 2. Stop ALL ongoing audios globally
    universalAudioEngine.stopAll();
    stopBanglaAudio();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }

    // 3. Automatically flip Hafizi Mushaf page if reciting an Ayah on another page
    const loc = getHafiziLocationForAyah(selectedSurahIdRef.current, ayahNumber);
    if (loc && loc.uthmaniPage && loc.uthmaniPage !== hafiziPage) {
      setHafiziPage(loc.uthmaniPage);
    }

    // 4. Ensure QuranCDN timing segments are loaded for active surah and qari
    loadChapterSegments(selectedSurahIdRef.current, selectedQariRef.current);

    // Reset loop counter on newly selected or advanced Ayah
    repeatCounterRef.current = 0;
    setRepeatCounter(0);

    const aNum = Number(ayahNumber) || 1;
    setPlayingAyahNumber(aNum);
    playingAyahRef.current = aNum;
    setActiveWordIndex(startWordIdx >= 0 ? startWordIdx : 0);

    const currentAyahObj = currentSurah.ayahs.find((a) => Number(a.numberInSurah) === aNum);
    const cleanWords = splitArabicAyahWords(
      words && words.length > 0
        ? words
        : (currentAyahObj?.words && currentAyahObj.words.length > 0 ? currentAyahObj.words : currentAyahObj?.text || "")
    );

    const audioUrl = getAyahAudioUrl(selectedQariRef.current, selectedSurahIdRef.current, aNum);
    const audio = audioCache.getOrCreate(audioUrl);
    audioRef.current = audio;
    universalAudioEngine.claimExternalAudio(audio, `ayah_${selectedSurahIdRef.current}_${aNum}_${selectedQariRef.current}`);

    // Clean up any stale listeners on the cached audio element to guarantee single clean execution
    audio.onloadedmetadata = null;
    audio.oncanplay = null;
    audio.ontimeupdate = null;
    audio.onended = null;
    audio.onerror = null;
    audio.onwaiting = null;
    audio.onplaying = null;

    audio.defaultPlaybackRate = playbackSpeedRef.current;
    audio.playbackRate = playbackSpeedRef.current;

    // Calculate word seek offset
    const seekSec = startWordIdx > 0
      ? getWordStartTimeSec({
          surahNumber: selectedSurahIdRef.current,
          ayahNumber: aNum,
          wordIndex: startWordIdx,
          qariId: selectedQariRef.current,
          duration: audio.duration || 0,
          words: cleanWords,
        })
      : 0;

    const executePlay = () => {
      // Abort if another click arrived in the meantime
      if (playbackSessionIdRef.current !== thisSessionId) {
        try { audio.pause(); } catch {}
        return;
      }

      try {
        if (seekSec > 0) {
          audio.currentTime = seekSec;
          setActiveWordIndex(startWordIdx);
        } else {
          audio.currentTime = 0;
          setActiveWordIndex(0);
        }
      } catch {}

      audio.playbackRate = playbackSpeedRef.current;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playbackSessionIdRef.current !== thisSessionId) {
              try { audio.pause(); } catch {}
              return;
            }
            setIsPlayingAudio(true);
            if (audioRef.current) audioRef.current.playbackRate = playbackSpeedRef.current;

            // Predictive Background Preloading of next 2 Ayahs to eliminate audio gaps / stuttering
            if (aNum < currentSurah.ayahs.length) {
              const nextAyahNum = aNum + 1;
              const nextUrl = getAyahAudioUrl(selectedQariRef.current, selectedSurahIdRef.current, nextAyahNum);
              audioPreloader.preload(nextUrl);
              if (nextAyahNum < currentSurah.ayahs.length) {
                const nextNextUrl = getAyahAudioUrl(selectedQariRef.current, selectedSurahIdRef.current, nextAyahNum + 1);
                audioPreloader.preload(nextNextUrl);
              }
            }

            // Scroll playing Ayah into view right in the center of the screen
            const el =
              document.getElementById(`ayah-${aNum}`) ||
              document.getElementById(`mushaf-ayah-${selectedSurahIdRef.current}-${aNum}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              const windowHeight = window.innerHeight || document.documentElement.clientHeight;
              const isComfortablyCentered =
                rect.top >= windowHeight * 0.25 && rect.bottom <= windowHeight * 0.75;
              if (!isComfortablyCentered) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              console.warn("Audio playback interrupted or failed:", err);
              if (playbackSessionIdRef.current === thisSessionId) {
                setIsPlayingAudio(false);
              }
            }
          });
      }
    };

    audio.onwaiting = () => {
      // Smoothly handle buffer stalls without resetting playback session
    };

    audio.onplaying = () => {
      if (playbackSessionIdRef.current === thisSessionId) {
        setIsPlayingAudio(true);
      }
    };

    // One-time execution guard: guarantees executePlay is invoked exactly once
    let playTriggered = false;
    const triggerPlaybackOnce = () => {
      if (playTriggered) return;
      playTriggered = true;
      audio.onloadedmetadata = null;
      audio.oncanplay = null;
      executePlay();
    };

    audio.onerror = (e) => {
      console.warn("Ayah audio load error:", e);
      if (playbackSessionIdRef.current === thisSessionId) {
        setIsPlayingAudio(false);
        toast.error("ক্বারীর তিলাওয়াত অডিও লোড হতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
      }
    };

    if (audio.readyState >= 2) {
      triggerPlaybackOnce();
    } else {
      audio.oncanplay = triggerPlaybackOnce;
      audio.onloadedmetadata = triggerPlaybackOnce;
    }

    // Precise word-by-word tracking during playback (QuranCDN Millisecond Segments + Teacher Mode Dual Sync)
    audio.ontimeupdate = () => {
      if (playbackSessionIdRef.current !== thisSessionId) return;
      if (!audioRef.current || audioRef.current !== audio) return;
      const { currentTime, duration } = audio;
      if (!duration || isNaN(duration)) return;

      const details = getActiveArabicWordDetails({
        currentTime,
        duration,
        surahNumber: selectedSurahIdRef.current,
        ayahNumber: aNum,
        qariId: selectedQariRef.current,
        words: cleanWords,
      });

      setActiveWordIndex(details.wordIndex);
      if (details.isTeacherMode) {
        setActiveSpeaker(details.speaker || "ustad");
      } else {
        setActiveSpeaker("ustad");
      }
    };

    // Dynamic onended using synchronized refs (100% immune to stale closures)
    audio.onended = () => {
      if (playbackSessionIdRef.current !== thisSessionId) return;
      const mode = repeatModeRef.current;
      if (mode === "1x") {
        if (repeatCounterRef.current < 1) {
          repeatCounterRef.current += 1;
          setRepeatCounter(1);
          if (audioRef.current) {
            try { audioRef.current.currentTime = 0; } catch {}
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
            try { audioRef.current.currentTime = 0; } catch {}
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
  const playAyahAudio = (ayahNumber, startWordIdx = 0, words = null) => {
    const aNum = Number(ayahNumber) || 1;
    // If clicking on a specific word in currently active Ayah: seek immediately!
    if (playingAyahRef.current === aNum && audioRef.current) {
      if (startWordIdx > 0) {
        const thisSessionId = ++playbackSessionIdRef.current;
        const dur = audioRef.current.duration || 0;
        const currentAyahObj = surahDataRef.current?.ayahs?.find((a) => Number(a.numberInSurah) === aNum);
        const cleanWords = words && words.length > 0
          ? words
          : (currentAyahObj?.words && currentAyahObj.words.length > 0 ? currentAyahObj.words : splitArabicAyahWords(currentAyahObj?.text || ""));

        const seekTime = getWordStartTimeSec({
          surahNumber: selectedSurahIdRef.current,
          ayahNumber: aNum,
          wordIndex: startWordIdx,
          qariId: selectedQariRef.current,
          duration: dur,
          words: cleanWords,
        });

        try { audioRef.current.currentTime = seekTime; } catch {}
        audioRef.current.playbackRate = playbackSpeedRef.current;
        audioRef.current.play().then(() => {
          if (playbackSessionIdRef.current === thisSessionId) {
            setIsPlayingAudio(true);
            setActiveWordIndex(startWordIdx);
          }
        }).catch(() => {});
        return;
      }

      // If clicking word 0 on same playing Ayah: toggle pause or resume
      if (isPlayingAudio) {
        try { audioRef.current.pause(); } catch {}
        setIsPlayingAudio(false);
        return;
      } else if (audioRef.current.src) {
        audioRef.current.playbackRate = playbackSpeedRef.current;
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
        }).catch(() => {
          startNewAyahAudio(aNum, 0, words);
        });
        return;
      }
    }

    startNewAyahAudio(aNum, startWordIdx, words);
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
      universalAudioEngine.stopAll();
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
    const activeAyah = playingAyahRef.current;
    const shouldResume = Boolean(
      activeAyah &&
      (isPlayingAudio || (audioRef.current && !audioRef.current.paused))
    );

    playbackSessionIdRef.current += 1;
    universalAudioEngine.stopAll();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onloadedmetadata = null;
      audioRef.current.oncanplay = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current = null;
    }

    setSelectedQari(qariId);
    selectedQariRef.current = qariId;
    setStoredQariPreference(qariId);
    loadChapterSegments(selectedSurahIdRef.current, qariId).then((map) => {
      if (map) setQariSegmentsVersion((prev) => prev + 1);
    });
    setIsPlayingAudio(false);
    if (shouldResume) {
      startNewAyahAudio(activeAyah);
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
      {/* ── TOP CONTROL & SMART JUMPER BAR (Auto-reveals on scroll-up) ── */}
      <div className={`sticky top-0 z-30 transition-transform duration-300 ${isNavVisible ? "translate-y-0" : "-translate-y-full"} ${isDay ? "bg-[#FAF7F2]/95 border-b border-amber-200/90 shadow-sm" : "bg-[#091f16]/95 border-b border-emerald-900/70 shadow-md"} backdrop-blur-md px-2.5 sm:px-6 py-2.5 flex flex-col gap-2.5`}>
        {/* ROW 1: Surah Selector, Reciter, Theme, Mode & Zoom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Surah Selector Button & Quick Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSurahDrawerOpen(true)}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl ${isDay ? "bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs" : "bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-white shadow-sm"} font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition active:scale-95 cursor-pointer`}
            >
              <BookOpen className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isDay ? "text-emerald-700" : "text-emerald-400"}`} />
              <span className={`font-extrabold ${isDay ? "text-emerald-950" : "text-emerald-200"}`}>
                {currentSurahMeta.id}. {currentSurahMeta.nameBn}
              </span>
              <span className={`font-hafizi-quran text-sm ${isDay ? "text-emerald-800" : "text-emerald-300"} mr-1 hidden xs:inline`}>
                ({currentSurahMeta.nameAr})
              </span>
              <span className={`text-[10px] ${isDay ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-emerald-950 text-emerald-400 border-emerald-800"} px-2 py-0.5 rounded-full border font-bold hidden md:inline`}>
                সূরা তালিকা
              </span>
            </button>

            {/* Quick Prev / Next Surah */}
            <div className="flex items-center gap-1">
              <button
                disabled={selectedSurahId <= 1}
                onClick={() => setSelectedSurahId((s) => Math.max(1, s - 1))}
                className={`p-1.5 sm:p-2 rounded-xl ${isDay ? "bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs" : "bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300"} disabled:opacity-40 transition cursor-pointer`}
                title="পূর্ববর্তী সূরা"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={selectedSurahId >= 114}
                onClick={() => setSelectedSurahId((s) => Math.min(114, s + 1))}
                className={`p-1.5 sm:p-2 rounded-xl ${isDay ? "bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs" : "bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300"} disabled:opacity-40 transition cursor-pointer`}
                title="পরবর্তী সূরা"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: Reciter & Bengali Voice Selection */}
          <div className="flex items-center gap-2 hidden md:flex">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isDay ? "text-stone-600" : "text-slate-400"}`}>ক্বারী:</span>
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

            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isDay ? "text-stone-600" : "text-slate-400"}`}>বাংলা কণ্ঠ:</span>
              <select
                value={activeBanglaEngine || "engine-2"}
                onChange={(e) => {
                  const newEng = e.target.value;
                  setActiveBanglaEngine(newEng);
                  toast.success(
                    newEng === "engine-2"
                      ? "ইঞ্জিন ২: আল-কুরআন স্টুডিও কণ্ঠ (সুললিত ও হৃদয়স্পর্শী) সক্রিয়"
                      : "ইঞ্জিন ১: ইসলামিক উস্তাদ স্টুডিও কণ্ঠ (অভিজ্ঞ ও শান্ত) সক্রিয়"
                  );
                }}
                className={`${
                  isDay
                    ? "bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs"
                    : "bg-[#071d15] text-amber-300 border border-amber-600/60"
                } rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer`}
                title="বাংলা অনুবাদ ও ব্যাখ্যার ভয়েস ইঞ্জিন নির্বাচন করুন"
              >
                <option value="engine-2">🎙️ ইঞ্জিন ২: আল-কুরআন স্টুডিও কণ্ঠ [ডিফল্ট]</option>
                <option value="engine-1">🎙️ ইঞ্জিন ১: ইসলামিক উস্তাদ স্টুডিও কণ্ঠ</option>
              </select>
              {elVoices && (
                <select
                  value={activeElVoice || (activeBanglaEngine === "engine-1" ? "bill" : "brian")}
                  onChange={(e) => {
                    setActiveElVoice(e.target.value);
                    toast.success(`${elVoices[e.target.value]?.shortName || "নতুন"} স্টুডিও কণ্ঠ সক্রিয়`);
                  }}
                  className={`${
                    isDay
                      ? "bg-white text-emerald-950 border border-emerald-300 shadow-2xs"
                      : "bg-emerald-950/90 text-emerald-200 border border-emerald-700/70"
                  } rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer`}
                  title="বাংলা অনুবাদের স্টুডিও কণ্ঠ পরিবর্তন করুন"
                >
                  {Object.values(elVoices).map((v) => (
                    <option key={v.id} value={v.id} className="bg-white text-slate-900">
                      {v.shortName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Right: View Mode, Theme & Font Zoom Controls */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Day / Night Theme Toggle */}
            <button
              type="button"
              onClick={toggleReaderTheme}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 ${
                isDay
                  ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 font-black"
                  : "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-300"
              }`}
              title="দিনের আলো ও রাতের মোড পরিবর্তন করুন"
            >
              <span>{isDay ? "☀️ দিন" : "🌙 রাত"}</span>
            </button>

            {/* View Mode Toggle: Ayah vs Mushaf */}
            <div className={`flex items-center ${isDay ? "bg-stone-200/60 border border-stone-300/80" : "bg-black/40 border border-emerald-900/60"} p-0.5 sm:p-1 rounded-xl text-[11px] sm:text-xs`}>
              <button
                onClick={handleSwitchToAyah}
                className={`px-1.5 sm:px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === "ayah"
                    ? isDay ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-600 text-white"
                    : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
                }`}
                title="আয়াতভিত্তিক পাঠ ও অনুবাদ"
              >
                <List className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>আয়াত</span>
              </button>
              <button
                onClick={handleSwitchToMushaf}
                className={`px-1.5 sm:px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === "mushaf"
                    ? isDay ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-600 text-white"
                    : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
                }`}
                title="১৫ লাইনের খাঁটি হাফেজী কুরআন মুসহাফ"
              >
                <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>মুসহাফ</span>
              </button>
            </div>

            {/* Font Zoom Controls */}
            <div className={`flex items-center ${isDay ? "bg-stone-200/60 border border-stone-300/80" : "bg-black/40 border border-emerald-900/60"} px-1 sm:px-2 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs gap-0.5 sm:gap-1.5`}>
              <button
                onClick={() => changeFontSize(-2)}
                className={`px-1 sm:px-1.5 py-0.5 rounded ${isDay ? "hover:bg-white text-stone-700" : "hover:bg-emerald-900/60 text-slate-300"} font-black cursor-pointer`}
                title="ফন্ট ছোট করুন"
              >
                A-
              </button>
              <span className={`text-[11px] ${isDay ? "text-emerald-700" : "text-emerald-400"} font-black`}>
                {arabicFontSize}<span className="hidden sm:inline">px</span>
              </span>
              <button
                onClick={() => changeFontSize(2)}
                className={`px-1 sm:px-1.5 py-0.5 rounded ${isDay ? "hover:bg-white text-stone-700" : "hover:bg-emerald-900/60 text-slate-300"} font-black cursor-pointer`}
                title="ফন্ট বড় করুন"
              >
                A+
              </button>
            </div>

            {/* Toggle Translation Visibility (In Ayah Mode) */}
            {viewMode === "ayah" && (
              <button
                onClick={() => setShowBengali((v) => !v)}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition cursor-pointer shrink-0 ${
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
            )}
          </div>
        </div>

        {/* MOBILE-ONLY QUICK QARI & BANGLA VOICE SELECTOR ROW */}
        <div className="flex md:hidden items-center gap-1.5 w-full">
          <select
            value={selectedQari}
            onChange={(e) => handleQariChange(e.target.value)}
            className={`${isDay ? "bg-white text-emerald-950 border border-emerald-300 shadow-2xs" : "bg-emerald-950/90 text-emerald-200 border border-emerald-800/70"} rounded-xl px-2 py-1 text-[11px] font-bold flex-1 min-w-0 truncate focus:outline-none`}
            title="ক্বারী নির্বাচন"
          >
            {QARI_REGISTRY.map((qari) => (
              <option key={qari.id} value={qari.id} className="bg-white text-slate-900">
                {qari.displayTitleBn}
              </option>
            ))}
          </select>

          <select
            value={activeBanglaEngine || "engine-2"}
            onChange={(e) => {
              const newEng = e.target.value;
              setActiveBanglaEngine(newEng);
              toast.success(
                newEng === "engine-2"
                  ? "ইঞ্জিন ২: আল-কুরআন স্টুডিও কণ্ঠ সক্রিয়"
                  : "ইঞ্জিন ১: ইসলামিক উস্তাদ স্টুডিও কণ্ঠ সক্রিয়"
              );
            }}
            className={`${
              isDay
                ? "bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs"
                : "bg-[#071d15] text-amber-300 border border-amber-600/60"
            } rounded-xl px-2 py-1 text-[11px] font-black w-[112px] shrink-0 truncate focus:outline-none cursor-pointer`}
            title="বাংলা ভয়েস ইঞ্জিন"
          >
            <option value="engine-2">ইঞ্জিন ২ (স্টুডিও)</option>
            <option value="engine-1">ইঞ্জিন ১ (উস্তাদ)</option>
          </select>

          {elVoices && (
            <select
              value={activeElVoice || (activeBanglaEngine === "engine-1" ? "bill" : "brian")}
              onChange={(e) => {
                setActiveElVoice(e.target.value);
                toast.success(`${elVoices[e.target.value]?.shortName || "নতুন"} স্টুডিও কণ্ঠ`);
              }}
              className={`${
                isDay
                  ? "bg-white text-emerald-950 border border-emerald-300 shadow-2xs"
                  : "bg-emerald-950/90 text-emerald-200 border border-emerald-700/70"
              } rounded-xl px-1.5 py-1 text-[11px] font-bold w-[76px] shrink-0 truncate focus:outline-none cursor-pointer`}
              title="স্টুডিও কণ্ঠস্বর"
            >
              {Object.values(elVoices).map((v) => (
                <option key={v.id} value={v.id} className="bg-white text-slate-900">
                  {v.shortName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ROW 2: NEW SMART SURAH & AYAH / HAFIZI PARA & PAGE JUMPER SEARCHER (Only in Ayah Mode to keep Hafizi Mushaf clean) */}
        {viewMode === "ayah" && (
          <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDay ? "border-amber-200/70" : "border-emerald-900/50"
          }`}>
          {/* Left: Mode Tabs & Jumper Form */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Mode Toggle: Surah vs Para */}
            <div className={`flex items-center rounded-xl p-0.5 border ${
              isDay ? "bg-stone-200/70 border-stone-300" : "bg-black/40 border-emerald-900/60"
            }`}>
              <button
                type="button"
                onClick={() => setJumperTab("surah")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                  jumperTab === "surah"
                    ? "bg-amber-600 text-white shadow-2xs font-black"
                    : isDay ? "text-stone-700 hover:text-stone-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List className="w-3 h-3" />
                <span>সূরা ও আয়াত</span>
              </button>
              <button
                type="button"
                onClick={() => setJumperTab("para")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                  jumperTab === "para"
                    ? "bg-amber-600 text-white shadow-2xs font-black"
                    : isDay ? "text-stone-700 hover:text-stone-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>পারা ও পৃষ্ঠা (হাফেজী)</span>
              </button>
            </div>

            {/* TAB 1: Surah & Ayah Jumper Form */}
            {jumperTab === "surah" && (
              <div className="flex flex-wrap items-center gap-1.5 animate-fadeIn">
                <select
                  value={jumperSurahId}
                  onChange={(e) => {
                    const newSurahId = Number(e.target.value);
                    setJumperSurahId(newSurahId);
                    setJumperAyahNum("");
                  }}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[175px] sm:max-w-[220px] truncate ${
                    isDay
                      ? "bg-white border-amber-300 text-slate-900 shadow-2xs"
                      : "bg-emerald-950/90 border-emerald-700 text-white"
                  }`}
                >
                  {ALL_SURAHS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white text-slate-900">
                      {s.id}. {s.nameBn} ({s.nameAr}) — {s.versesCount}টি আয়াত
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={jumperAyahNum}
                  onChange={(e) => {
                    const val = e.target.value;
                    const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
                    setJumperAyahNum(val.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleDirectAyahJump(jumperSurahId, jumperAyahNum);
                    }
                  }}
                  placeholder={`আয়াত (১-${ALL_SURAHS.find((s) => s.id === jumperSurahId)?.versesCount || 286})`}
                  className={`w-28 sm:w-32 !px-2 py-1.5 rounded-xl border text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDay
                      ? "bg-white border-amber-300 text-slate-900 shadow-2xs"
                      : "bg-emerald-950/90 border-emerald-700 text-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleDirectAyahJump(jumperSurahId, jumperAyahNum)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                  title="সরাসরি এই আয়াতে যান"
                >
                  <span>যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 2: Hafizi Para & Page Jumper Form */}
            {jumperTab === "para" && (
              <div className="flex flex-wrap items-center gap-1.5 animate-fadeIn">
                <select
                  value={jumperParaNum}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setJumperParaNum(p);
                    const info = HAFIZI_PARAS[p - 1];
                    const defP = Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((info.startPage / 610) * TOTAL_UTHMANI_PAGES)));
                    setJumperPageNum(String(defP));
                  }}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[210px] sm:max-w-[250px] truncate ${
                    isDay
                      ? "bg-white border-amber-300 text-slate-900 shadow-2xs"
                      : "bg-emerald-950/90 border-emerald-700 text-white"
                  }`}
                >
                  {HAFIZI_PARAS.map((p) => (
                    <option key={p.juz} value={p.juz} className="bg-white text-slate-900">
                      {p.nameBn} ({p.nameAr}) — পৃ: {p.startPage}-{p.endPage}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={jumperPageNum}
                  onChange={(e) => {
                    const val = e.target.value;
                    const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
                    setJumperPageNum(val.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleDirectParaPageJump(jumperParaNum, jumperPageNum);
                    }
                  }}
                  placeholder="পৃষ্ঠা (১-৬০৪)"
                  className={`w-24 sm:w-28 px-2.5 py-1.5 rounded-xl border text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDay
                      ? "bg-white border-amber-300 text-slate-900 shadow-2xs"
                      : "bg-emerald-950/90 border-emerald-700 text-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleDirectParaPageJump(jumperParaNum, jumperPageNum)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                  title="সরাসরি এই হাফেজী পৃষ্ঠায় যান"
                >
                  <span>পৃষ্ঠায় যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Hafizi / Ayah Mode Badge Indicator */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              viewMode === "mushaf"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
            }`}>
              {viewMode === "mushaf" ? "📖 ১৫ লাইনের হাফেজী কুরআন মোড" : "📜 আয়াতভিত্তিক মাশক ও পাঠ মোড"}
            </span>
          </div>
        </div>
        )}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className={`max-w-5xl mx-auto w-full ${viewMode === "mushaf" ? "px-1 sm:px-4 py-2 sm:py-6" : "px-2 sm:px-6 py-4 sm:py-8"} flex-1`}>
        {/* SURAH TITLE CARD (Shown in Ayah View Mode) */}
        {viewMode === "ayah" && (
          <div className={`relative mb-8 rounded-3xl ${isDay ? "bg-gradient-to-br from-[#0c533c] via-[#083e2d] to-[#05291e] text-white" : "bg-gradient-to-br from-[#0c291d] via-[#082017] to-[#04140e] text-white"} p-5 sm:p-8 border border-emerald-700/50 shadow-2xl text-center overflow-hidden`}>
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
        )}

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

              // Universal Waqf & Ibtida repeats for this Ayah across all 114 Surahs
              const activeRepeats = getUniversalAyahRepeats(selectedSurahId, ayah.numberInSurah, words, selectedQari);

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
                      {activeRepeats && activeRepeats.length > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 shadow-2xs ${
                            isDay
                              ? "bg-amber-100/90 text-amber-950 border-amber-300"
                              : "bg-amber-950/80 text-amber-200 border-amber-500/50"
                          }`}
                          title="এই আয়াতে ক্বারীর নিজস্ব দম ফেলার বিরতি (★) ও পুনরায় শুরুর সূচনা (✓) চিহ্নিত রয়েছে"
                        >
                          <span className="text-amber-500 font-bold">★</span>
                          <span>ওয়াকফ</span>
                          <span className="text-emerald-500 font-bold ml-1">✓</span>
                          <span>ইবতেদা</span>
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

                      {/* Launch Nur AI Ustad Chat on this Ayah */}
                      <button
                        onClick={() => {
                          if (onLaunchNurEngine) {
                            onLaunchNurEngine(selectedSurahId, ayah.numberInSurah, ayah);
                          } else {
                            try {
                              localStorage.setItem(
                                "rahmania_ustad_target_ayah",
                                JSON.stringify({
                                  surah: selectedSurahId,
                                  ayah: ayah.numberInSurah,
                                  text: ayah.text || "",
                                  bengali: ayah.bengali || "",
                                })
                              );
                            } catch {}
                            if (typeof window !== "undefined") {
                              window.location.href = `/quran-tutor/studio?feature=voice-tutor&surah=${selectedSurahId}&ayah=${ayah.numberInSurah}`;
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                        title="এই আয়াতের উচ্চারণ, তাফসীর ও অর্থ নিয়ে এআই উস্তাদ চ্যাটে কথা বলুন"
                      >
                        <Bot className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="hidden sm:inline">এআই উস্তাদ</span>
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

                  {/* ARABIC TEXT with Word-by-Word Active Highlighting & Waqf/Ibtida Dynamic Markers */}
                  <div className="py-3 text-right">
                    {/* Teacher Mode Dual Recitation Role Indicator (শায়খ আল-মিনশাবী ও ছাত্রদল) */}
                    {isThisAyahActive && isPlayingAudio && selectedQari === "minshawy_teacher" && (
                      <div className="flex items-center justify-end pb-2.5">
                        {activeSpeaker === "student" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400 text-sky-400 text-xs font-black animate-pulse shadow-xs">
                            <GraduationCap className="w-4 h-4 text-sky-400" />
                            <span>🎓 ছাত্রদলের পুনরাবৃত্তি (শিক্ষার্থীরা সমস্বরে পড়ছে...)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 text-xs font-black animate-pulse shadow-xs">
                            <Volume2 className="w-4 h-4 text-amber-400" />
                            <span>🎙️ উস্তাদের তিলাওয়াত (শায়খ আল-মিনশাবী)</span>
                          </span>
                        )}
                      </div>
                    )}

                    <p
                      className={`font-hafizi-quran ${isDay ? "text-slate-900" : "text-slate-100"} tracking-wide select-text leading-[2.6]`}
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {words.map((word, wIdx) => {
                        const isThisWordActive = isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;
                        const normWord = normalizeQuranWord(word);
                        const wordHasQuranicWaqfSign = AUTHENTIC_WAQF_GLYPH_REGEX.test(word);

                        const explicitWaqfStop = activeRepeats.find((r) =>
                          r.stopWordIdx !== undefined
                            ? r.stopWordIdx === wIdx
                            : Boolean(r.stopAfterWord && normalizeQuranWord(r.stopAfterWord) === normWord)
                        );
                        const isWaqfStop = !wordHasQuranicWaqfSign && Boolean(explicitWaqfStop);

                        const explicitWaqfResume = activeRepeats.find((r) =>
                          r.resumeWordIdx !== undefined
                            ? r.resumeWordIdx === wIdx
                            : Boolean(r.resumeAtWord && normalizeQuranWord(r.resumeAtWord) === normWord)
                        );
                        const isIbtidaResume = wIdx > 0 && !wordHasQuranicWaqfSign && !isWaqfStop && Boolean(explicitWaqfResume);

                        return (
                          <span key={wIdx} className="inline-block relative">
                            {/* ১. ক্বারীর তিলাওয়াত পুনরায় শুরুর মার্কার [✓] (ওয়াকফে ইবতেদা) */}
                            {isIbtidaResume && (
                              <span
                                className={`inline-flex items-center justify-center font-black mx-1 px-1.5 py-0.5 rounded-full select-none shadow-md transition-transform hover:scale-115 cursor-help ${
                                  isDay
                                    ? "bg-emerald-600 text-white border border-emerald-700 text-xs sm:text-sm ring-1 ring-emerald-400"
                                    : "bg-emerald-500 text-slate-950 border border-emerald-300 text-xs sm:text-sm ring-2 ring-emerald-400/50 shadow-emerald-500/50"
                                }`}
                                title={`পুনরায় পড়ার সূচনা (ইবতেদা): ${word} (ক্বারী দম নেওয়ার পর এখান থেকে মিলিয়ে তিলাওয়াত শুরু করেছেন)`}
                              >
                                ✓
                              </span>
                            )}

                            {/* ২. মূল শব্দের টেক্সট ও ক্লিক-টু-প্লে অডিও হাইলাইট */}
                            <span
                              onClick={() => playAyahAudio(ayah.numberInSurah, wIdx, words)}
                              className={`inline-block transition-colors duration-150 px-2 py-0.5 mx-0.5 rounded-xl cursor-pointer ${
                                isThisWordActive
                                  ? isThisAyahActive && selectedQari === "minshawy_teacher" && activeSpeaker === "student"
                                    ? "bg-sky-400 text-slate-950 font-black shadow-md ring-2 ring-sky-300"
                                    : "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300"
                                  : isThisAyahActive
                                  ? isDay ? "text-emerald-800 font-bold" : "text-amber-200 font-semibold"
                                  : isDay ? "text-slate-900" : "text-slate-100"
                              }`}
                              title={`শব্দ #${wIdx + 1}: ${word} (ক্লিক করে শুনুন)`}
                            >
                              {word}
                            </span>

                            {/* ৩. ক্বারীর দম ফেলার স্থান: গোল্ডেন স্টার মার্কার [★] (ওয়াকফ) */}
                            {isWaqfStop && (
                              <span
                                className={`inline-flex items-center justify-center font-black mx-1 px-1.5 py-0.5 rounded-full select-none shadow-md transition-transform hover:scale-115 cursor-help ${
                                  isDay
                                    ? "bg-amber-400 text-slate-950 border border-amber-600 text-xs sm:text-sm ring-1 ring-amber-300"
                                    : "bg-amber-400 text-slate-950 border border-amber-300 text-xs sm:text-sm ring-2 ring-amber-400/50 shadow-amber-500/50"
                                }`}
                                title={`ক্বারীর বিরতি (ওয়াকফ): ${word} (কুরআনে কোনো লিখিত ওয়াকফ চিহ্ন নেই, ক্বারী দম নেওয়ার জন্য এখানে থেমেছেন)`}
                              >
                                ★
                              </span>
                            )}
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

        {/* ── AUTHENTIC 15-LINE HAFIZI QURAN MUSHAF PAGE VIEW ── */}
        {viewMode === "mushaf" && (
          <div className="w-full flex justify-center py-2 animate-fadeIn">
            <HafiziMushafSheet
              pageNum={hafiziPage}
              onPageChange={(newPage) => {
                setHafiziPage(newPage);
                universalAudioEngine.stopAll();
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                setIsPlayingAudio(false);
              }}
              onJumpToParaPage={(para, pageInPara) => {
                const target = getHafiziPageTarget(para, pageInPara);
                const newPg = target.uthmaniPage || target.globalPage;
                setHafiziPage(newPg);
                universalAudioEngine.stopAll();
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                setIsPlayingAudio(false);
              }}
              onPlayAyah={(ayahNum, sId, overrideQariId, words = null) => {
                if (overrideQariId) {
                  setSelectedQari(overrideQariId);
                  selectedQariRef.current = overrideQariId;
                }
                const targetSurah = sId || selectedSurahIdRef.current;
                if (targetSurah !== selectedSurahIdRef.current) {
                  setSelectedSurahId(targetSurah);
                  selectedSurahIdRef.current = targetSurah;
                  getSurahData(targetSurah).then((data) => {
                    if (data) {
                      setSurahData(data);
                      surahDataRef.current = data;
                      startNewAyahAudio(ayahNum, 0, words);
                    }
                  });
                } else {
                  playAyahAudio(ayahNum, 0, words);
                }
              }}
              playingAyahNumber={playingAyahNumber}
              playingSurahId={selectedSurahId}
              isPlayingAudio={isPlayingAudio}
              activeWordIndex={activeWordIndex}
              activeSpeaker={activeSpeaker}
              arabicFontSize={arabicFontSize}
              onChangeFontSize={(delta) => changeFontSize(delta)}
              readerTheme={readerTheme}
              getSurahData={getSurahData}
              targetHighlightAyah={targetHighlightAyah}
              selectedQari={selectedQari}
              onSelectQari={(qId) => setSelectedQari(qId)}
            />
          </div>
        )}
      </div>

      {/* ── FLOATING MOBILE ACTION HUB & BACK TO TOP (Smart Quick Controls for Phone View) ── */}
      <div className={`fixed ${
        playingAyahNumber !== null ? "bottom-28 sm:bottom-24" : "bottom-4 sm:bottom-6"
      } left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-40 flex flex-col items-center sm:items-end gap-2 pointer-events-auto transition-all duration-300 max-w-[96vw]`}>
        {/* Back to Top Smooth Floating Button */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xl border transition active:scale-90 cursor-pointer self-end mb-0.5 ${
              isDay
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-400 shadow-amber-950/20"
                : "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/40"
            }`}
            title="উপরে যান (Back to Top)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Floating Quick Pill (Visible on Phone Screens) */}
        {isFloatingBarHidden ? (
          /* Minimized Bubble Toggle Button (কন্ট্রোল বার ফেরত আনার বাটন) */
          <button
            type="button"
            onClick={() => setIsFloatingBarHidden(false)}
            className={`flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-full shadow-2xl border text-xs font-black transition-all active:scale-95 cursor-pointer animate-fadeIn ${
              isDay
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-300 shadow-amber-950/20"
                : "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/40"
            }`}
            title="কন্ট্রোল বার পুনরায় খুলুন"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>কন্ট্রোল মেনু</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full font-bold">
              {viewMode === "mushaf" ? `পৃ: ${hafiziPage}` : `${selectedSurahId}`}
            </span>
          </button>
        ) : (
          /* Full Floating Mobile Controls with Prominent [X] Hide Button */
          <div className={`flex md:hidden items-center justify-between gap-1 p-1 sm:p-1.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-fadeIn max-w-[96vw] shrink-0 ${
            isDay
              ? "bg-white/95 border-amber-300 text-slate-900"
              : "bg-[#091f16]/95 border-emerald-700 text-white"
          }`}>
            {/* Quick Jump Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileJumperOpen(true)}
              className="px-2 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition cursor-pointer shadow-xs shrink-0"
              title="সূরা, আয়াত, পারা ও পৃষ্ঠা নির্বাচন"
            >
              <Search className="w-3 h-3" />
              <span>জাম্প</span>
            </button>

            {/* Quick Prev / Next Page (in Hafizi mode) */}
            {viewMode === "mushaf" && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={hafiziPage <= 1}
                  onClick={() => setHafiziPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-900 disabled:opacity-30 transition cursor-pointer shrink-0"
                  title="আগের পাতা"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-black px-0.5 text-amber-600 dark:text-amber-400 shrink-0">
                  পৃ: {hafiziPage}
                </span>
                <button
                  type="button"
                  disabled={hafiziPage >= TOTAL_UTHMANI_PAGES}
                  onClick={() => setHafiziPage((p) => Math.min(TOTAL_UTHMANI_PAGES, p + 1))}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-900 disabled:opacity-30 transition cursor-pointer shrink-0"
                  title="পরের পাতা"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Font Size Adjust */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => changeFontSize(-2)}
                className="px-1.5 py-0.5 rounded text-[11px] font-black hover:bg-stone-200 dark:hover:bg-emerald-900 transition cursor-pointer border border-stone-300 dark:border-emerald-800 shrink-0"
                title="ছোট করুন"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(2)}
                className="px-1.5 py-0.5 rounded text-[11px] font-black hover:bg-stone-200 dark:hover:bg-emerald-900 transition cursor-pointer border border-stone-300 dark:border-emerald-800 shrink-0"
                title="বড় করুন"
              >
                A+
              </button>
            </div>

            {/* Close / Hide / Minimize Button (✕ চিহ্ন - স্পষ্টভাবে দৃশ্যমান ও ক্লিকেবল) */}
            <button
              type="button"
              onClick={() => setIsFloatingBarHidden(true)}
              className="w-7 h-7 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer shadow-md ml-0.5"
              title="কন্ট্রোল বার লুকান (হাইড করুন)"
              aria-label="কন্ট্রোল বার লুকান"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* ── MOBILE JUMPER BOTTOM SHEET MODAL (সূরা, আয়াত, পারা ও পৃষ্ঠা নির্বাচন) ── */}
      {isMobileJumperOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border-t sm:border space-y-4 ${
            isDay ? "bg-white border-amber-300 text-slate-900" : "bg-[#091f16] border-emerald-700 text-white"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm">কুরআন নেভিগেশন ও অনুসন্ধান</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileJumperOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-emerald-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Mode Tabs: সূরা ও আয়াত vs পারা ও পৃষ্ঠা */}
            <div className={`flex items-center rounded-2xl p-1 border gap-1 ${
              isDay ? "bg-stone-100 border-stone-200" : "bg-black/40 border-emerald-900/60"
            }`}>
              <button
                type="button"
                onClick={() => setJumperTab("surah")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  jumperTab === "surah"
                    ? "bg-amber-600 text-white shadow-xs font-black"
                    : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>সূরা ও আয়াত</span>
              </button>
              <button
                type="button"
                onClick={() => setJumperTab("para")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  jumperTab === "para"
                    ? "bg-amber-600 text-white shadow-xs font-black"
                    : isDay ? "text-stone-600 hover:text-stone-900" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>পারা ও পৃষ্ঠা (হাফেজী)</span>
              </button>
            </div>

            {/* Mobile Quick Audio Settings: Bangla Voice Engine & Studio Voice */}
            <div className={`p-2.5 rounded-2xl border space-y-2 ${
              isDay ? "bg-amber-50/70 border-amber-200" : "bg-emerald-950/50 border-emerald-800/70"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-300">
                  🎙️ বাংলা অনুবাদ ভয়েস ইঞ্জিন
                </span>
                <select
                  value={activeBanglaEngine || "engine-2"}
                  onChange={(e) => {
                    setActiveBanglaEngine(e.target.value);
                    toast.success(
                      e.target.value === "engine-2"
                        ? "ইঞ্জিন ২: আল-কুরআন স্টুডিও কণ্ঠ সক্রিয়"
                        : "ইঞ্জিন ১: ইসলামিক উস্তাদ স্টুডিও কণ্ঠ সক্রিয়"
                    );
                  }}
                  className={`rounded-xl px-2 py-1 text-[11px] font-bold border focus:outline-none ${
                    isDay ? "bg-white border-amber-300 text-slate-900" : "bg-[#071d15] border-emerald-700 text-amber-200"
                  }`}
                >
                  <option value="engine-2" className="bg-white text-slate-900">ইঞ্জিন ২: আল-কুরআন স্টুডিও কণ্ঠ [ডিফল্ট]</option>
                  <option value="engine-1" className="bg-white text-slate-900">ইঞ্জিন ১: ইসলামিক উস্তাদ স্টুডিও কণ্ঠ</option>
                </select>
              </div>
              {elVoices && (
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(elVoices).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setActiveElVoice(v.id);
                        toast.success(`${v.shortName} কণ্ঠ নির্বাচন করা হয়েছে`);
                      }}
                      className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                        (activeElVoice || (activeBanglaEngine === "engine-1" ? "bill" : "brian")) === v.id
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                          : isDay
                          ? "bg-white text-stone-700 border-stone-200"
                          : "bg-black/30 text-slate-300 border-emerald-900/60"
                      }`}
                    >
                      {v.shortName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: SURAH & AYAH SELECTION */}
            {jumperTab === "surah" && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold block mb-1">সূরা নির্বাচন করুন:</label>
                  <select
                    value={jumperSurahId}
                    onChange={(e) => {
                      setJumperSurahId(Number(e.target.value));
                      setJumperAyahNum("");
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDay ? "bg-stone-50 border-amber-300 text-slate-900" : "bg-emerald-950 border-emerald-700 text-white"
                    }`}
                  >
                    {ALL_SURAHS.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white text-slate-900">
                        {s.id}. {s.nameBn} ({s.nameAr}) — {s.versesCount}টি আয়াত
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">আয়াত নম্বর লিখুন:</label>
                  <input
                    type="text"
                    value={jumperAyahNum}
                    onChange={(e) => {
                      const val = e.target.value;
                      const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
                      setJumperAyahNum(val.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleDirectAyahJump(jumperSurahId, jumperAyahNum);
                      }
                    }}
                    placeholder={`১ থেকে ${ALL_SURAHS.find((s) => s.id === jumperSurahId)?.versesCount || 286}-এর মধ্যে`}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDay ? "bg-stone-50 border-amber-300 text-slate-900" : "bg-emerald-950 border-emerald-700 text-white"
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDirectAyahJump(jumperSurahId, jumperAyahNum)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                >
                  <span>সরাসরি এই আয়াতে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 2: HAFIZI PARA & PAGE SELECTION (হাফেজী পারা ও পৃষ্ঠা নির্বাচন) */}
            {jumperTab === "para" && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold block mb-1">হাফেজী পারা নির্বাচন করুন:</label>
                  <select
                    value={jumperParaNum}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setJumperParaNum(p);
                      const info = HAFIZI_PARAS[p - 1];
                      const defP = Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((info.startPage / 610) * TOTAL_UTHMANI_PAGES)));
                      setJumperPageNum(String(defP));
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDay ? "bg-stone-50 border-amber-300 text-slate-900" : "bg-emerald-950 border-emerald-700 text-white"
                    }`}
                  >
                    {HAFIZI_PARAS.map((p) => (
                      <option key={p.juz} value={p.juz} className="bg-white text-slate-900">
                        {p.nameBn} ({p.nameAr}) — মোট {p.totalPages} পৃষ্ঠা (পৃ: {p.startPage}-{p.endPage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold">পৃষ্ঠা নম্বর লিখুন:</label>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      {HAFIZI_PARAS[jumperParaNum - 1]?.nameBn} এর পৃষ্ঠা: {HAFIZI_PARAS[jumperParaNum - 1]?.startPage} - {HAFIZI_PARAS[jumperParaNum - 1]?.endPage}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={jumperPageNum}
                    onChange={(e) => {
                      const val = e.target.value;
                      const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
                      setJumperPageNum(val.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleDirectParaPageJump(jumperParaNum, jumperPageNum);
                      }
                    }}
                    placeholder={`পৃষ্ঠা ১ থেকে ${TOTAL_UTHMANI_PAGES}-এর মধ্যে লিখুন`}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDay ? "bg-stone-50 border-amber-300 text-slate-900" : "bg-emerald-950 border-emerald-700 text-white"
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDirectParaPageJump(jumperParaNum, jumperPageNum)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>সরাসরি এই হাফেজী পৃষ্ঠায় যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FIXED BOTTOM AUDIO PLAYER BAR (Always Visible & Pinned to Viewport Bottom like Qurani Amal) ── */}
      {playingAyahNumber !== null && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#071d15]/95 backdrop-blur-md border-t border-emerald-300 dark:border-emerald-800 shadow-2xl px-3 py-2.5 sm:p-4 animate-slideUp">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            {/* Top Row on Mobile / Left on Desktop: Info + Mobile Close Button */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs shrink-0">
                  আরবী
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    সূরা {currentSurahMeta.nameBn} ({currentSurahMeta.nameAr})
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-bold truncate">
                    আয়াত {playingAyahNumber}/{surahData?.ayahs?.length || currentSurahMeta.versesCount} • {QARI_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn || "মিশারী আল-আফাসী"}
                    {!isPlayingAudio && " • (বিরতি)"}
                  </p>
                </div>
              </div>

              {/* Mobile Close / Stop Button */}
              <button
                type="button"
                onClick={closePlayerBar}
                className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
                title="তিলাওয়াত সম্পূর্ণ বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Row on Mobile / Center on Desktop: Controls */}
            <div className="flex items-center justify-between sm:justify-end flex-wrap gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (playingAyahNumber > 1) playAyahAudio(playingAyahNumber - 1);
                  }}
                  disabled={playingAyahNumber <= 1}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-emerald-900/60 disabled:opacity-40 transition cursor-pointer"
                  title="পূর্ববর্তী আয়াত"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={togglePlayPauseAudio}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer ${
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
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-emerald-900/60 disabled:opacity-40 transition cursor-pointer"
                  title="পরবর্তী আয়াত"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
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
                  className={`flex px-2 py-1.5 rounded-xl border text-[11px] font-bold transition items-center gap-1 cursor-pointer ${
                    repeatMode !== "none"
                      ? "bg-purple-900/80 border-purple-500 text-purple-200"
                      : "bg-stone-100 dark:bg-black/30 border-stone-200 dark:border-emerald-900 text-slate-600 dark:text-slate-400"
                  }`}
                  title="রিপিট মোড"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{repeatMode === "none" ? "রিপিট" : repeatMode === "surah" ? "সূরা" : repeatMode}</span>
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
                  className="flex px-2 py-1.5 rounded-xl bg-stone-100 dark:bg-black/60 hover:bg-stone-200 dark:hover:bg-emerald-950 border border-stone-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-[11px] font-bold transition items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  title="গতি পরিবর্তন"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {/* Dedicated Bengali Translation Audio Button in Player Bar (Always visible on Mobile & Desktop) */}
                {(() => {
                  const curAyah = surahData?.ayahs?.find((a) => a.numberInSurah === playingAyahNumber);
                  const bText = curAyah?.bengali;
                  const bKey = `bottom-bar-${selectedSurahId}-${playingAyahNumber}`;
                  const isPlayingB = playingBanglaId === bKey;
                  if (!bText) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAudio && audioRef.current) {
                          audioRef.current.pause();
                          setIsPlayingAudio(false);
                        }
                        toggleBanglaAudio(bText, bKey);
                      }}
                      className={`flex px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap ${
                        isPlayingB
                          ? "bg-amber-500 text-slate-950 border-amber-300 font-extrabold animate-pulse"
                          : "bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200"
                      }`}
                      title={`এই আয়াতের বাংলা অনুবাদ শুনুন (${activeBanglaEngine === "engine-1" ? "ইসলামিক উস্তাদ স্টুডিও কণ্ঠ" : "আল-কুরআন স্টুডিও কণ্ঠ"})`}
                    >
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isPlayingB ? "থামুন" : "বাংলা অর্থ"}</span>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Right on Desktop: Close / Stop */}
            <button
              type="button"
              onClick={closePlayerBar}
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
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
