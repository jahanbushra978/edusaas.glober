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

const STORAGE_LAST_READ = "rahmania_quran_last_read_v1";
const STORAGE_BOOKMARKS = "rahmania_quran_bookmarks_v1";
const STORAGE_FONT_SIZE = "rahmania_quran_arabic_size_v1";

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

  // Audio Player State
  const [selectedQari, setSelectedQari] = useState(QARI_REGISTRY[1].id); // Default Alafasy
  const [playingAyahNumber, setPlayingAyahNumber] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState("none"); // 'none' | '1x' | '3x' | 'surah'
  const [repeatCounter, setRepeatCounter] = useState(0);
  const audioRef = useRef(null);

  // Bookmarks & Word Breakdown Modal
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [wordModalAyah, setWordModalAyah] = useState(null);

  // Hafizi Quran Selection State
  const [hafiziPara, setHafiziPara] = useState(1);
  const [hafiziPage, setHafiziPage] = useState(1);
  const [pendingScrollAyah, setPendingScrollAyah] = useState(null);

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
    } catch {}
  }, []);

  // Fetch Surah Data
  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setIsLoadingSurah(true);
      try {
        const data = await getSurahData(selectedSurahId);
        if (!isCancelled) {
          setSurahData(data);
          setIsLoadingSurah(false);
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

  // Audio player handler
  const playAyahAudio = (ayahNumber) => {
    if (playingAyahNumber === ayahNumber && isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
      return;
    }

    const audioUrl = getAyahAudioUrl(selectedQari, selectedSurahId, ayahNumber);
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current
      .play()
      .then(() => {
        setPlayingAyahNumber(ayahNumber);
        setIsPlayingAudio(true);
      })
      .catch((err) => {
        console.warn("Audio playback interrupted or failed:", err);
        setIsPlayingAudio(false);
        toast.info("অডিও প্লে হচ্ছে...");
      });

    audioRef.current.onended = () => {
      // Repeat Logic
      if (repeatMode === "1x") {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setRepeatMode("none");
      } else if (repeatMode === "3x") {
        if (repeatCounter < 2) {
          setRepeatCounter((c) => c + 1);
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          setRepeatCounter(0);
          setRepeatMode("none");
          advanceNextAyah(ayahNumber);
        }
      } else {
        advanceNextAyah(ayahNumber);
      }
    };
  };

  const advanceNextAyah = (currentAyah) => {
    if (!surahData?.ayahs) return;
    const maxAyahs = surahData.ayahs.length;
    if (currentAyah < maxAyahs) {
      playAyahAudio(currentAyah + 1);
    } else {
      setIsPlayingAudio(false);
      setPlayingAyahNumber(null);
      if (repeatMode === "surah") {
        playAyahAudio(1);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
  };

  const handleQariChange = (qariId) => {
    setSelectedQari(qariId);
    setStoredQariPreference(qariId);
    if (isPlayingAudio && playingAyahNumber) {
      // restart current ayah with new qari
      const audioUrl = getAyahAudioUrl(qariId, selectedSurahId, playingAyahNumber);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
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

  return (
    <div className="flex flex-col min-h-screen bg-[#071510] text-slate-100">
      {/* ── TOP CONTROL BAR ── */}
      <div className="sticky top-16 z-20 bg-[#091f16]/95 backdrop-blur-md border-b border-emerald-900/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Surah Selector Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSurahDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-emerald-200">
              {currentSurahMeta.id}. {currentSurahMeta.nameBn}
            </span>
            <span className="font-hafizi-quran text-sm text-emerald-300 mr-1">
              ({currentSurahMeta.nameAr})
            </span>
            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-800">
              সূরা নির্বাচন করুন
            </span>
          </button>

          {/* Quick Prev / Next Surah */}
          <div className="flex items-center gap-1">
            <button
              disabled={selectedSurahId <= 1}
              onClick={() => setSelectedSurahId((s) => Math.max(1, s - 1))}
              className="p-2 rounded-lg bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300 disabled:opacity-40 transition"
              title="পূর্ববর্তী সূরা"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={selectedSurahId >= 114}
              onClick={() => setSelectedSurahId((s) => Math.min(114, s + 1))}
              className="p-2 rounded-lg bg-black/30 hover:bg-emerald-900/50 border border-emerald-900 text-slate-300 disabled:opacity-40 transition"
              title="পরবর্তী সূরা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Reciter Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">ক্বারী:</span>
          <select
            value={selectedQari}
            onChange={(e) => handleQariChange(e.target.value)}
            className="bg-emerald-950/90 text-emerald-200 border border-emerald-800/70 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {QARI_REGISTRY.map((qari) => (
              <option key={qari.id} value={qari.id} className="bg-[#091f16] text-white">
                {qari.displayTitleBn} ({qari.styleBn})
              </option>
            ))}
          </select>
        </div>

        {/* Right: View & Font Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-emerald-900/60 text-xs">
            <button
              onClick={() => setViewMode("ayah")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                viewMode === "ayah" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>আয়াত</span>
            </button>
            <button
              onClick={() => setViewMode("mushaf")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                viewMode === "mushaf" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>মুসহাফ</span>
            </button>
          </div>

          {/* Font Zoom Controls */}
          <div className="flex items-center bg-black/40 px-2 py-1 rounded-xl border border-emerald-900/60 text-xs gap-1.5">
            <button
              onClick={() => changeFontSize(-2)}
              className="px-2 py-0.5 rounded hover:bg-emerald-900/60 text-slate-300 font-bold"
              title="ফন্ট ছোট করুন"
            >
              A-
            </button>
            <span className="text-[11px] text-emerald-400 font-bold">{arabicFontSize}px</span>
            <button
              onClick={() => changeFontSize(2)}
              className="px-2 py-0.5 rounded hover:bg-emerald-900/60 text-slate-300 font-bold"
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
                ? "bg-emerald-900/70 border-emerald-600 text-emerald-200"
                : "bg-black/30 border-emerald-900 text-slate-500"
            }`}
            title="বাংলা অনুবাদ দেখান বা লুকান"
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* SURAH TITLE CARD */}
        <div className="relative mb-8 rounded-3xl bg-gradient-to-br from-[#0c291d] via-[#082017] to-[#04140e] p-6 sm:p-8 border border-emerald-800/60 shadow-2xl text-center overflow-hidden">
          {/* Subtle gold ornamentation glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[11px] font-bold text-emerald-300">
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
              <span className="text-emerald-400 font-normal italic text-lg">{currentSurahMeta.meaningBn}</span>
            </div>

            <p className="text-xs text-slate-400 font-english-italic">
              Surah {currentSurahMeta.nameEn} • Verses: {currentSurahMeta.versesCount}
            </p>

            {/* Bismillah Header (Except Surah 9) */}
            {selectedSurahId !== 9 && (
              <div className="pt-4 pb-2 border-t border-emerald-900/40">
                <div className="text-2xl sm:text-3xl font-hafizi-quran text-amber-300 tracking-wider">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
                <div className="text-xs font-hind-siliguri text-emerald-300/80 mt-1">
                  পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে শুরু করছি
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoadingSurah && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-hind-siliguri text-emerald-300">
              হাফিজি কুরআন শরিফের আয়াতসমূহ সুন্দরভাবে লোড হচ্ছে...
            </p>
          </div>
        )}

        {/* ── AYAH VIEW MODE ── */}
        {!isLoadingSurah && viewMode === "ayah" && surahData?.ayahs && (
          <div className="space-y-6">
            {surahData.ayahs.map((ayah) => {
              const isPlayingThis = isPlayingAudio && playingAyahNumber === ayah.numberInSurah;
              const isBookmarked = bookmarks.some(
                (b) => b.key === `${selectedSurahId}:${ayah.numberInSurah}`
              );

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 relative ${
                    isPlayingThis
                      ? "bg-gradient-to-br from-[#0c2e21] to-[#071d15] border-emerald-400/80 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                      : "bg-[#091c15]/80 hover:bg-[#0b241b] border-emerald-900/60 shadow-lg"
                  }`}
                >
                  {/* Ayah Header Bar */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-900/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900/70 text-emerald-300 border border-emerald-700/60 flex items-center justify-center font-bold">
                        {ayah.numberInSurah}
                      </span>
                      <span className="text-slate-400 text-[11px] font-english-italic">
                        {selectedSurahId}:{ayah.numberInSurah}
                      </span>
                    </div>

                    {/* Ayah Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Play Ayah */}
                      <button
                        onClick={() => playAyahAudio(ayah.numberInSurah)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          isPlayingThis
                            ? "bg-amber-600 text-white shadow"
                            : "bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800"
                        }`}
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>থামান</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
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
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                        title="এই আয়াতটি এআই শিক্ষক নূরের সাথে ৬ ধাপে অনুশীলন করুন"
                      >
                        <Bot className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="hidden sm:inline">নূর শিক্ষক</span>
                      </button>

                      {/* Word Breakdown */}
                      {ayah.words && ayah.words.length > 0 && (
                        <button
                          onClick={() => setWordModalAyah(ayah)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 text-purple-300 text-xs font-bold transition"
                          title="শব্দার্থে শব্দার্থ তাজবীদ বিশ্লেষণ"
                        >
                          শব্দার্থ
                        </button>
                      )}

                      {/* Bookmark */}
                      <button
                        onClick={() => toggleBookmark(selectedSurahId, ayah.numberInSurah)}
                        className={`p-2 rounded-xl transition ${
                          isBookmarked
                            ? "bg-amber-600/30 text-amber-400 border border-amber-500/60"
                            : "bg-black/30 text-slate-400 hover:text-slate-200 border border-emerald-900"
                        }`}
                        title={isBookmarked ? "বুকমার্ক সরানো" : "বুকমার্ক যোগ করুন"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ARABIC TEXT (Authentic Hafizi Quran Script) */}
                  <div className="py-3 text-right">
                    <p
                      className="font-hafizi-quran text-slate-100 tracking-wide select-text leading-relaxed"
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {ayah.text}{" "}
                      <span className="inline-flex items-center justify-center font-hafizi-quran text-amber-400 text-2xl mx-1 select-none">
                        ۝{ayah.numberInSurah}
                      </span>
                    </p>
                  </div>

                  {/* BENGALI TRANSLATION (Hind Siliguri Font) */}
                  {showBengali && ayah.bengali && (
                    <div className="pt-3 border-t border-emerald-950/80">
                      <p className="font-hind-siliguri text-emerald-100/90 text-base sm:text-lg leading-relaxed font-normal">
                        {ayah.bengali}
                      </p>
                    </div>
                  )}

                  {/* ENGLISH TRANSLITERATION / TRANSLATION (Italic English) */}
                  {showEnglish && ayah.english && (
                    <div className="pt-2">
                      <p className="font-english-italic text-slate-400 text-xs sm:text-sm leading-relaxed">
                        {ayah.english}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MUSHAF PAGE VIEW MODE (Continuous Reading) ── */}
        {!isLoadingSurah && viewMode === "mushaf" && surahData?.ayahs && (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#091f16] border-2 border-emerald-700/60 shadow-2xl space-y-6">
            <div className="text-center pb-4 border-b border-emerald-900/60">
              <span className="text-xs font-bold text-emerald-300 font-hind-siliguri">
                মুসহাফ পঠন মোড — সূরা {surahData.bengaliName}
              </span>
            </div>

            <div
              className="font-hafizi-quran text-justify leading-[2.6] select-text text-slate-100"
              style={{ fontSize: `${arabicFontSize + 2}px` }}
            >
              {surahData.ayahs.map((ayah) => (
                <span
                  key={ayah.numberInSurah}
                  onClick={() => playAyahAudio(ayah.numberInSurah)}
                  className={`cursor-pointer transition-colors px-1 rounded hover:bg-emerald-800/40 ${
                    playingAyahNumber === ayah.numberInSurah
                      ? "bg-emerald-700/60 text-amber-300 font-bold"
                      : ""
                  }`}
                  title={`আয়াত ${ayah.numberInSurah} শুনতে ক্লিক করুন`}
                >
                  {ayah.text}{" "}
                  <span className="text-amber-400 font-bold text-2xl mx-1 select-none">
                    ۝{ayah.numberInSurah}
                  </span>{" "}
                </span>
              ))}
            </div>

            <div className="pt-6 border-t border-emerald-900/60 text-center">
              <p className="text-xs font-hind-siliguri text-slate-400">
                যেকোনো আয়াতে ক্লিক করলেই তা নির্বাচিত ক্বারীর কণ্ঠে বেজে উঠবে।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM AUDIO PLAYER BAR (When Playing) ── */}
      {isPlayingAudio && (
        <div className="sticky bottom-0 z-40 bg-[#092218]/95 backdrop-blur-lg border-t border-emerald-700/60 px-4 py-3 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-emerald-300">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-hind-siliguri flex items-center gap-2">
                <span>
                  সূরা {currentSurahMeta.nameBn} • আয়াত {playingAyahNumber}
                </span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-emerald-300">
                  {QARI_REGISTRY.find((q) => q.id === selectedQari)?.displayTitleBn}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-english-italic">
                Playing with EveryAyah CDN High Fidelity Audio
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (playingAyahNumber > 1) playAyahAudio(playingAyahNumber - 1);
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-emerald-900 text-slate-300 transition"
              title="পূর্ববর্তী আয়াত"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={stopAudio}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Pause className="w-4 h-4" />
              <span>থামান</span>
            </button>

            <button
              onClick={() => {
                if (playingAyahNumber < (surahData?.ayahs?.length || 1)) {
                  playAyahAudio(playingAyahNumber + 1);
                }
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-emerald-900 text-slate-300 transition"
              title="পরবর্তী আয়াত"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat Mode Cycle */}
            <button
              onClick={() => {
                const nextMode =
                  repeatMode === "none" ? "1x" : repeatMode === "1x" ? "3x" : repeatMode === "3x" ? "surah" : "none";
                setRepeatMode(nextMode);
                toast.info(`রিপিট মোড: ${nextMode === "none" ? "বন্ধ" : nextMode === "surah" ? "পুরো সূরা" : nextMode}`);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                repeatMode !== "none"
                  ? "bg-purple-900/80 border-purple-500 text-purple-200"
                  : "bg-black/30 border-emerald-900 text-slate-400"
              }`}
              title="রিপিট মোড পরিবর্তন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{repeatMode === "none" ? "রিপিট বন্ধ" : repeatMode}</span>
            </button>

            {/* Playback speed */}
            <select
              value={playbackSpeed}
              onChange={(e) => {
                const spd = parseFloat(e.target.value);
                setPlaybackSpeed(spd);
                if (audioRef.current) audioRef.current.playbackRate = spd;
              }}
              className="bg-black/40 text-emerald-200 border border-emerald-900 rounded-xl px-2 py-1.5 text-xs font-bold"
            >
              <option value="0.75">0.75x (ধীর)</option>
              <option value="1.0">1.0x (স্বাভাবিক)</option>
              <option value="1.25">1.25x (দ্রুত)</option>
            </select>
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
