"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SURAHS } from "@/lib/quran/quran-meta";
import {
  TOTAL_UTHMANI_PAGES,
  getHafiziPageMeta,
  getHafiziLocation,
  getHafiziPageTarget,
  HAFIZI_PARAS
} from "@/lib/quran/hafizi-pages";
import {
  getHafiziHeaderMetadata,
  MUTASHABIHAT_REGISTRY,
  WAQF_IBTIDA_REGISTRY,
  getThematicSummaryForPage,
  toBnNum,
  toArNum
} from "@/lib/quran/hafizi-annotations";
import { splitArabicAyahWords } from "@/lib/quran/quran-audio-timing";

export default function HafiziMushafSheet({
  pageNum = 1,
  onPageChange,
  onJumpToParaPage,
  onPlayAyah,
  playingAyahNumber = null,
  playingSurahId = null,
  isPlayingAudio = false,
  activeWordIndex = 0,
  arabicFontSize = 26,
  onChangeFontSize,
  readerTheme = "day",
  getSurahData,
  targetHighlightAyah = null,
  selectedQari = "husary_muallim",
  onSelectQari,
}) {
  const isDay = readerTheme === "day";
  const [pageLoading, setPageLoading] = useState(true);
  const [pageAyahs, setPageAyahs] = useState([]);
  const [jumpInput, setJumpInput] = useState(String(pageNum));
  const [isParaDropdownOpen, setIsParaDropdownOpen] = useState(false);
  const [isQariMenuOpen, setIsQariMenuOpen] = useState(false);
  const pageContainerRef = useRef(null);

  // Get canonical metadata for this page
  const pageMeta = useMemo(() => {
    return getHafiziPageMeta(pageNum);
  }, [pageNum]);

  // Hafizi Header 4-Point Metadata
  const headerMeta = useMemo(() => {
    const currentPara = HAFIZI_PARAS.find((p) => p.juz === pageMeta.para) || HAFIZI_PARAS[0];
    return getHafiziHeaderMetadata(pageNum, currentPara, pageMeta.firstSurahMeta);
  }, [pageNum, pageMeta]);

  // Thematic Page Banner
  const thematicSummary = useMemo(() => {
    return getThematicSummaryForPage(pageNum, pageMeta.firstSurahMeta);
  }, [pageNum, pageMeta]);

  // Sync jump input when pageNum changes externally
  useEffect(() => {
    setJumpInput(String(pageNum));
  }, [pageNum]);

  // Load ayahs for all surahs spanning this page
  useEffect(() => {
    let isCancelled = false;
    setPageLoading(true);

    async function loadPage() {
      try {
        const uniqueSurahIds = Array.from(new Set(pageMeta.ranges.map((r) => r.surah)));
        const surahResults = await Promise.all(
          uniqueSurahIds.map((id) => getSurahData(id))
        );

        if (isCancelled) return;

        const surahMap = {};
        surahResults.forEach((sData, idx) => {
          if (sData) {
            surahMap[uniqueSurahIds[idx]] = sData;
          }
        });

        // Assemble precise ayahs for this page
        const assembled = [];
        for (const range of pageMeta.ranges) {
          const sData = surahMap[range.surah];
          if (!sData || !sData.ayahs) continue;

          // Check if this range starts a new Surah
          const isSurahStart = range.fromAyah === 1;

          for (let aNum = range.fromAyah; aNum <= range.toAyah; aNum++) {
            const ayahObj = sData.ayahs.find((a) => a.numberInSurah === aNum);
            if (ayahObj) {
              assembled.push({
                ...ayahObj,
                surahId: range.surah,
                surahNameAr: sData.name,
                surahNameBn: sData.bengaliName || range.meta?.nameBn,
                isSurahFirstAyah: aNum === 1,
                surahMeta: range.meta,
                words: splitArabicAyahWords(
                  ayahObj.words && ayahObj.words.length > 0 ? ayahObj.words : ayahObj.text
                ),
              });
            }
          }
        }

        setPageAyahs(assembled);
        setPageLoading(false);
      } catch (err) {
        console.error("Error loading Hafizi page ayahs:", err);
        if (!isCancelled) {
          setPageLoading(false);
          toast.error("পৃষ্ঠার আয়াত লোড করতে সমস্যা হয়েছে");
        }
      }
    }

    loadPage();

    return () => {
      isCancelled = true;
    };
  }, [pageMeta, getSurahData]);

  // Find Mutashabihat matches on this page
  const pageMutashabihat = useMemo(() => {
    if (!pageAyahs || pageAyahs.length === 0) return [];
    const matched = [];
    MUTASHABIHAT_REGISTRY.forEach((entry, idx) => {
      const foundInAyah = pageAyahs.find((a) => {
        const fullText = (a.text || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
        const cleanPhrase = entry.phraseClean.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
        return fullText.includes(cleanPhrase) || (a.text && a.text.includes(entry.phraseAr));
      });
      if (foundInAyah) {
        matched.push({
          ...entry,
          refNo: idx + 1,
          ayahNumber: foundInAyah.numberInSurah,
          surahId: foundInAyah.surahId,
        });
      }
    });
    return matched;
  }, [pageAyahs]);

  // Look up Waqf & Ibtida markers for ayahs on this page
  const waqfIbtidaMap = useMemo(() => {
    const map = {};
    pageAyahs.forEach((a) => {
      const key = `${a.surahId}-${a.numberInSurah}`;
      if (WAQF_IBTIDA_REGISTRY[key]) {
        map[key] = WAQF_IBTIDA_REGISTRY[key];
      }
    });
    return map;
  }, [pageAyahs]);

  // Handle page jump
  const handleJumpSubmit = (e) => {
    if (e) e.preventDefault();
    const p = parseInt(jumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= TOTAL_UTHMANI_PAGES) {
      onPageChange(p);
    } else {
      toast.error(`১ থেকে ${TOTAL_UTHMANI_PAGES}-এর মধ্যে পৃষ্ঠা নম্বর লিখুন`);
    }
  };

  // Convert Bengali digits to English for easy typing
  const handleJumpInputChange = (e) => {
    const val = e.target.value;
    const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
    const normalized = val.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
    setJumpInput(normalized);
  };

  // Jump to start of Para
  const handleParaSelect = (paraNum) => {
    const p = Math.max(1, Math.min(30, paraNum));
    const target = getHafiziPageTarget(p, 1);
    const targetUthmaniPage = target.uthmaniPage || target.globalPage;
    onPageChange(targetUthmaniPage);
    setIsParaDropdownOpen(false);
    const info = HAFIZI_PARAS[p - 1];
    toast.success(`${info.nameBn} (${info.nameAr}) নির্বাচন করা হয়েছে`);
  };

  // Helper: check if a word belongs to a mutashabihat phrase
  const isWordInPhrase = (word, phrase) => {
    if (!word || !phrase) return false;
    const cleanWord = word.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
    const cleanPhrase = phrase.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
    if (cleanWord.length < 2) return false;
    return cleanPhrase.includes(cleanWord);
  };

  // Convert number to Bengali numerals
  const toBn = (num) => {
    const enToBnMap = { '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯' };
    return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
  };

  const pad2Bn = (num) => {
    const s = String(num || 1).padStart(2, "0");
    return toBn(s);
  };

  // Popular 5 Qaris matching the user's authentic Hafizi Quran screenshot
  const POPULAR_QARIS = [
    { id: "minshawy_teacher", shortNameBn: "শায়খ মুহাম্মদ সিদ্দিক আল-মিনশাবী" },
    { id: "sudais", shortNameBn: "শায়খ আব্দুর রহমান আস-সুদাইস" },
    { id: "ghamadi", shortNameBn: "শায়খ সা'দ আল-গামিদী" },
    { id: "husary_muallim", shortNameBn: "শায়খ মাহমুদ খলিল আল-হুসারী" },
    { id: "alafasy", shortNameBn: "শায়খ মাশারি বিন রাশেদ আল-আফাসী" },
  ];

  // Distribute Mutashabihat references to Left and Right Margins (ডান ও বাম হাশিয়া)
  const allMarginRefs = useMemo(() => {
    const list = [];
    pageMutashabihat.forEach((m) => {
      m.references.forEach((ref) => {
        list.push(ref);
      });
    });
    if (list.length === 0) {
      const p = pageMeta.para;
      list.push({ para: p, page: pageMeta.paraPage });
      if (p > 1) list.push({ para: p - 1, page: 20 });
      if (p < 30) list.push({ para: p + 1, page: 1 });
    }
    return list;
  }, [pageMutashabihat, pageMeta]);

  const leftMarginRefs = useMemo(() => allMarginRefs.slice(0, Math.ceil(allMarginRefs.length / 2)), [allMarginRefs]);
  const rightMarginRefs = useMemo(() => allMarginRefs.slice(Math.ceil(allMarginRefs.length / 2)), [allMarginRefs]);

  return (
    <div className="w-full flex flex-col items-center select-text" ref={pageContainerRef}>
      {/* ── AUTHENTIC MUSHAF PAGE WITH LEFT & RIGHT MARGINS (হাশিয়া) ── */}
      <div className="w-full max-w-4xl flex items-start justify-center gap-1 sm:gap-2">
        {/* ── LEFT MARGIN (বাম হাশিয়া - স্ক্রিনশটের হুবহু পারা ও পৃষ্ঠা টেবিল) ── */}
        <div className="hidden md:flex flex-col gap-1.5 shrink-0 w-14 sm:w-16 pt-8 select-none">
          {leftMarginRefs.map((ref, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (onJumpToParaPage) {
                  onJumpToParaPage(ref.para, ref.page);
                } else if (onPageChange) {
                  const target = getHafiziPageTarget(ref.para, ref.page);
                  onPageChange(target.uthmaniPage || target.globalPage);
                }
              }}
              className={`rounded-lg border p-1 text-[10px] text-center shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer ${
                isDay
                  ? "bg-[#FAF7F2] border-stone-400 text-stone-900 hover:border-amber-600"
                  : "bg-[#061811] border-teal-600/40 text-emerald-200 hover:border-amber-400"
              }`}
              title={`পারা ${toBn(ref.para)}, পৃষ্ঠা ${toBn(ref.page)}-এ যান`}
            >
              <div className="font-bold border-b border-stone-300 dark:border-teal-700/50 pb-0.5 text-amber-600 dark:text-amber-400 text-[9px]">
                পারা | পৃষ্ঠা
              </div>
              <div className="font-black pt-0.5 tracking-wider text-[11px]">
                {pad2Bn(ref.para)} | {pad2Bn(ref.page)}
              </div>
            </div>
          ))}
        </div>

        {/* ── THE 15-LINE HAFIZI QURAN PAGE SHEET (SCREENSHOT AUTHENTIC FRAME) ── */}
        <div
          className={`flex-1 max-w-3xl rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-300 shadow-2xl overflow-hidden relative ${
            isDay
              ? "bg-[#FAF7F2] border-stone-800 shadow-amber-950/10 text-stone-900"
              : "bg-[#06140e] border-amber-500/80 shadow-emerald-950/40 text-slate-100"
          }`}
        >
        {/* Subtle Islamic Corner Floral Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* ── TOP RUNNING HEADER OF HAFIZI PAGE (১. হাফেজী কুরআন হেডার ও মেটাডাটা) ── */}
        <div
          className={`px-3 sm:px-6 py-2 sm:py-2.5 border-b-2 flex flex-col gap-1 text-xs font-bold ${
            isDay
              ? "bg-[#F3EEE2] border-amber-600/40 text-stone-800"
              : "bg-[#06140e] border-amber-500/40 text-emerald-200"
          }`}
        >
          {/* Main Top Line: Left Para/Manzil | Center Qari Pill | Right CORNER Page Number */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Top Left: পারার নাম এবং মুনজিল নম্বর (যেমন: تلك الرسل - منزل ١) */}
            <div className="flex flex-col items-start leading-tight">
              <span className="font-hafizi-quran text-base sm:text-lg text-amber-600 dark:text-amber-300 font-bold">
                {headerMeta.headerLeftAr}
              </span>
              <span className="text-[10px] opacity-75">
                {headerMeta.headerLeftBn}
              </span>
            </div>

            {/* Top Center: Blue Qari Pill (স্ক্রিনশটের হুবহু সেন্টারের ব্লু পিল বাটন) */}
            <div className="flex items-center justify-center relative">
              <button
                type="button"
                onClick={() => setIsQariMenuOpen((prev) => !prev)}
                className="px-3 sm:px-4 py-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] sm:text-xs shadow-md border border-sky-400/80 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                title="ক্বারী পরিবর্তন ও তিলাওয়াত শুরু করতে ক্লিক করুন"
              >
                <span>🎙️ {POPULAR_QARIS.find((q) => q.id === selectedQari)?.shortNameBn || "শায়খ মাহমুদ খলিল আল-হুসারী"}</span>
                <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${isQariMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Interactive Qari Selection Dropdown Menu */}
              {isQariMenuOpen && (
                <div
                  className={`absolute top-full mt-2 w-64 rounded-2xl shadow-2xl border-2 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                    isDay
                      ? "bg-[#FAF7F2] border-sky-600 text-stone-900"
                      : "bg-[#061812] border-sky-500/80 text-emerald-100"
                  }`}
                >
                  <div className="text-[10px] font-black px-2 py-1 text-sky-500 border-b border-sky-500/30">
                    🎙️ প্রিয় ক্বারী নির্বাচন করুন
                  </div>
                  {POPULAR_QARIS.map((q) => {
                    const isSelected = selectedQari === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          if (onSelectQari) onSelectQari(q.id);
                          if (onPlayAyah && pageAyahs[0]) {
                            onPlayAyah(pageAyahs[0].numberInSurah, pageAyahs[0].surahId, q.id);
                          }
                          setIsQariMenuOpen(false);
                          toast.success(`${q.shortNameBn} নির্বাচন করা হয়েছে`);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 text-white shadow-xs font-black"
                            : "hover:bg-sky-500/15 text-slate-200"
                        }`}
                      >
                        <span className="truncate">{q.shortNameBn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Right CORNER: পৃষ্ঠা নম্বর (কানি / কর্নারে স্ক্রিনশটের হুবহু অনুযায়ী) */}
            <div className="flex flex-col items-end shrink-0">
              <span
                className={`text-xs sm:text-sm font-black px-2.5 sm:px-3 py-0.5 rounded-lg border shadow-xs ${
                  isDay
                    ? "bg-amber-100 text-amber-950 border-amber-500 font-black"
                    : "bg-emerald-950/90 text-amber-300 border-amber-500/80 font-black"
                }`}
                title={`পৃষ্ঠা নম্বর ${toBn(pageNum)}`}
              >
                পৃষ্ঠা {toBn(pageNum)}
              </span>
              <span className="text-[9px] opacity-70 mt-0.5 hidden sm:inline">
                ১৫ লাইন
              </span>
            </div>
          </div>

          {/* Sub Header: সূরার নাম ও সূরা নম্বর, বর্তমান পারা ও পারার পৃষ্ঠা */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1 border-t border-amber-500/20 opacity-90">
            <span className="text-amber-500 font-medium">
              {headerMeta.headerLeftBn}
            </span>
            <span className="text-[9px] opacity-75 font-serif">
              ১৫ লাইন • আয়াতুল খতম
            </span>
            <span className="font-hafizi-quran text-amber-600 dark:text-amber-300 font-bold" dir="rtl">
              {headerMeta.headerRightAr}
            </span>
          </div>
        </div>

        {/* ── THEMATIC BANNER (৪. বিষয়ভিত্তিক কুরআনিক শিরোনাম) ── */}
        <div className={`px-4 py-2 border-b text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs ${
          isDay
            ? "bg-amber-50/80 border-amber-300 text-stone-800"
            : "bg-[#09221b]/90 border-emerald-800/60 text-emerald-300"
        }`}>
          <span className="text-amber-500 text-sm">📖</span>
          <span className="tracking-wide">
            {thematicSummary}
          </span>
        </div>

        {/* ── PAGE CONTENT AREA ── */}
        <div className="p-3 sm:p-8 min-h-[520px] flex flex-col justify-between">
          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 border-4 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
              <p className={`text-xs font-bold ${isDay ? "text-stone-600" : "text-emerald-300"}`}>
                হাফেজী পৃষ্ঠা {toBn(pageNum)} প্রস্তুত হচ্ছে...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group ayahs by Surah so we can insert the Surah Header plate whenever a new Surah starts */}
              {pageMeta.ranges.map((range) => {
                const rangeAyahs = pageAyahs.filter((a) => a.surahId === range.surah);
                const isNewSurahStart = range.fromAyah === 1;

                return (
                  <div key={range.surah} className="space-y-3">
                    {/* ── DECORATIVE SURAH TITLE HEADER PLATE (Takes 2 Lines) ── */}
                    {isNewSurahStart && (
                      <div className="my-2 select-none animate-fadeIn">
                        {/* Surah Header Plaque */}
                        <div
                          className={`rounded-2xl border-2 px-4 py-2 sm:py-2.5 text-center shadow-md relative overflow-hidden ${
                            isDay
                              ? "bg-gradient-to-r from-amber-100 via-stone-50 to-amber-100 border-amber-500/70"
                              : "bg-gradient-to-r from-emerald-950 via-[#0d2a1d] to-emerald-950 border-amber-500/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-0.5 px-2">
                            <span>{range.meta.typeBn || "মাক্কী"}</span>
                            <span>{toBn(range.meta.versesCount)} আয়াত</span>
                          </div>

                          <h3 className="font-hafizi-quran text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-wide drop-shadow-xs">
                            سُوْرَةُ {range.meta.nameAr}
                          </h3>
                          <p className={`text-xs font-extrabold ${isDay ? "text-stone-800" : "text-emerald-200"}`}>
                            সূরা {range.meta.nameBn}
                          </p>
                        </div>

                        {/* Bismillah Header (Except Surah At-Tawbah 9) */}
                        {range.surah !== 9 && (
                          <div className="text-center py-2">
                            <p className="font-hafizi-quran text-xl sm:text-2xl text-amber-600 dark:text-amber-400 font-bold tracking-wider select-none">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── RECITATION VERSES (Continuous Justified 15-Line Flow) ── */}
                    <div
                      className="font-hafizi-quran text-justify leading-[2.6] sm:leading-[2.9] select-text"
                      style={{ fontSize: `${arabicFontSize}px` }}
                      dir="rtl"
                    >
                      {rangeAyahs.map((ayah) => {
                        const isThisAyahActive =
                          playingAyahNumber === ayah.numberInSurah && playingSurahId === ayah.surahId;
                        const isTargetJump =
                          targetHighlightAyah &&
                          targetHighlightAyah.surah === ayah.surahId &&
                          targetHighlightAyah.ayah === ayah.numberInSurah;

                        // Check Waqf & Ibtida for this Ayah
                        const ayahWaqfList = waqfIbtidaMap[`${ayah.surahId}-${ayah.numberInSurah}`] || [];
                        const ayahMutashabihat = pageMutashabihat.filter(
                          (m) => m.ayahNumber === ayah.numberInSurah && m.surahId === ayah.surahId
                        );

                        return (
                          <span
                            key={`${ayah.surahId}-${ayah.numberInSurah}`}
                            id={`mushaf-ayah-${ayah.surahId}-${ayah.numberInSurah}`}
                            onClick={() => onPlayAyah && onPlayAyah(ayah.numberInSurah, ayah.surahId)}
                            className="inline cursor-pointer select-text transition-colors"
                            title={`সূরা ${ayah.surahNameBn}, আয়াত ${toBn(ayah.numberInSurah)} শুনতে ক্লিক করুন`}
                          >
                            {/* Mutashabihat Badge if present */}
                            {ayahMutashabihat.length > 0 && (
                              <sup className="inline-block px-1 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-black mx-1 select-none">
                                [{toBn(ayahMutashabihat[0].refNo)}]
                              </sup>
                            )}

                            {ayah.words.map((word, wIdx) => {
                              const isThisWordActive =
                                isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;

                              // Check if word belongs to a Mutashabihat phrase
                              const mutashabihMatch = ayahMutashabihat.find(
                                (m) => isWordInPhrase(word, m.phraseAr) || isWordInPhrase(word, m.phraseClean)
                              );

                              // Check if word is a Waqf stop point
                              const waqfStop = ayahWaqfList.find((w) =>
                                word.includes(w.stopAfterWord) || w.stopAfterWord.includes(word)
                              );
                              // Check if word is an Ibtida resume point
                              const waqfResume = ayahWaqfList.find((w) =>
                                word.includes(w.resumeAtWord) || w.resumeAtWord.includes(word)
                              );

                              return (
                                <span key={wIdx} className="inline-block">
                                  {/* Ibtida Restart Marker [✓] */}
                                  {waqfResume && (
                                    <span
                                      className="inline-flex items-center text-[10px] font-black px-1 mx-0.5 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-300 select-none shadow-xs"
                                      title={`পুনরায় তিলাওয়াত শুরুর স্থান (ইবতিদা): ${word}`}
                                    >
                                      ✓
                                    </span>
                                  )}

                                  <span
                                    className={`inline-block transition-all duration-150 px-0.5 mx-[1.5px] rounded-sm ${
                                      isThisWordActive
                                        ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/40 ring-2 ring-amber-200 scale-105"
                                        : isTargetJump
                                        ? "text-amber-400 dark:text-amber-300 font-black"
                                        : isThisAyahActive
                                        ? isDay
                                          ? "text-amber-900 font-bold"
                                          : "text-amber-300 font-bold"
                                        : mutashabihMatch
                                        ? "border-b-2 border-sky-400 text-sky-400 dark:text-sky-300 font-bold pb-0.5"
                                        : waqfResume
                                        ? "text-emerald-300 font-bold underline decoration-emerald-400/60"
                                        : isDay
                                        ? "text-stone-950"
                                        : "text-white"
                                    }`}
                                  >
                                    {word}
                                  </span>

                                  {/* Waqf Pause Marker [*] */}
                                  {waqfStop && (
                                    <span
                                      className="inline-flex items-center text-[10px] font-black px-1 mx-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-300 select-none shadow-xs"
                                      title={`দম ফেলার স্থান (ওয়াকফ): ${word}`}
                                    >
                                      *{waqfStop.stopSign ? ` ${waqfStop.stopSign}` : ""}
                                    </span>
                                  )}
                                </span>
                              );
                            })}

                            {/* Verse End Ayatul Khatm Symbol (ফুল আয়াত সমাপ্তি চিহ্ন) */}
                            <span
                              className={`inline-flex items-center justify-center font-hafizi-quran font-black text-xl sm:text-2xl mx-1 select-none transition-all ${
                                isThisAyahActive || isTargetJump
                                  ? "bg-amber-500/25 border border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] rounded-full px-1.5 py-0.5 scale-110"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              ۝{toBn(ayah.numberInSurah)}
                            </span>{" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* ── ২. ও ৩. মার্জিন হাশিয়া (MUTASHABIHAT & WAQF-IBTIDA MARGIN NOTES) ── */}
              {(pageMutashabihat.length > 0 || Object.keys(waqfIbtidaMap).length > 0) && (
                <div className={`mt-6 pt-3 border-t-2 rounded-2xl p-3 sm:p-4 text-xs space-y-2.5 ${
                  isDay
                    ? "bg-amber-100/60 border-amber-400/60 text-stone-900"
                    : "bg-[#061c16]/95 border-teal-500/30 text-emerald-100"
                }`}>
                  <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/30">
                    <h4 className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span>📜 মার্জিন হাশিয়া (মুতাশাবিহাত রেফারেন্স ও ওয়াকফ-ইবতিদা)</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                      হাফেজী ক্রস-রেফারেন্স
                    </span>
                  </div>

                  {/* Mutashabihat Notes */}
                  {pageMutashabihat.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-extrabold text-teal-400">
                        মুতাশাবিহাত সদৃশ আয়াত (কমপক্ষে ৩টি শব্দ একাধিক স্থানে পুনরাবৃত্তি):
                      </p>
                      {pageMutashabihat.map((m) => (
                        <div key={m.refNo} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[11px] bg-black/20 p-2 rounded-xl border border-teal-500/20">
                          <span className="font-black text-amber-400 shrink-0">
                            [{toBn(m.refNo)}] «{m.phraseAr}»
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-300 font-bold">অন্যান্য স্থান:</span>
                            {m.references.map((ref, rIdx) => (
                              <span key={rIdx} className="px-1.5 py-0.5 rounded-md bg-teal-950/80 border border-teal-500/30 text-[#00d2b8] font-bold text-[10px]">
                                পারা {toBn(ref.para)}, পৃষ্ঠা {toBn(ref.page)} ({ref.note})
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Waqf & Ibtida Notes */}
                  {Object.keys(waqfIbtidaMap).length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-teal-900/40">
                      <p className="text-[11px] font-extrabold text-amber-300">
                        ওয়াকফে ইবতিদাইয়া (দীর্ঘ আয়াতে থামার [*] ও পুনরায় তিলাওয়াত শুরুর [✓] স্থান):
                      </p>
                      {Object.entries(waqfIbtidaMap).map(([k, list]) => (
                        <div key={k} className="space-y-1">
                          {list.map((item, idx) => (
                            <div key={idx} className="text-[10px] sm:text-[11px] bg-black/25 px-2.5 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5 text-slate-200">
                              <span className="text-amber-400 font-black">[*] ওয়াকফ:</span>
                              <span>{item.stopAfterWord}</span>
                              <span className="text-emerald-400 font-black ml-2">[✓] ইবতিদা:</span>
                              <span>{item.resumeAtWord}</span>
                              <span className="text-slate-400 italic hidden sm:inline ml-1">({item.note})</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM RUNNING FOOTER OF HAFIZI PAGE ── */}
        <div
          className={`px-3 sm:px-8 py-2.5 sm:py-3 border-t-2 flex items-center justify-between text-xs font-bold ${
            isDay
              ? "bg-[#F3EEE2] border-amber-600/40 text-stone-800"
              : "bg-[#06140e] border-amber-500/40 text-emerald-200"
          }`}
        >
          {/* Bottom Left: Manzil / Ruku */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] opacity-75">
              পারা পৃষ্ঠা: {toBn(pageMeta.paraPage)} / {toBn(pageMeta.totalPagesInPara)}
            </span>
          </div>

          {/* Bottom Center: Page Number (Ayat-al-Khatm Guarantee) */}
          <div className="text-center">
            <span className="font-hafizi-quran text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
              — {toBn(pageNum)} —
            </span>
          </div>

          {/* Bottom Right: Quick Page Flipping */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={() => onPageChange(pageNum - 1)}
              className="p-1 rounded-lg hover:bg-amber-500/20 disabled:opacity-30 transition cursor-pointer"
              title="আগের পৃষ্ঠা"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] opacity-75">
              {toBn(pageNum)}/{toBn(TOTAL_UTHMANI_PAGES)}
            </span>
            <button
              type="button"
              disabled={pageNum >= TOTAL_UTHMANI_PAGES}
              onClick={() => onPageChange(pageNum + 1)}
              className="p-1 rounded-lg hover:bg-amber-500/20 disabled:opacity-30 transition cursor-pointer"
              title="পরের পৃষ্ঠা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT MARGIN (ডান হাশিয়া - স্ক্রিনশটের হুবহু পারা ও পৃষ্ঠা টেবিল) ── */}
      <div className="hidden sm:flex flex-col gap-1.5 shrink-0 w-14 sm:w-16 pt-8 select-none">
        {rightMarginRefs.map((ref, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (onJumpToParaPage) {
                onJumpToParaPage(ref.para, ref.page);
              } else if (onPageChange) {
                const target = getHafiziPageTarget(ref.para, ref.page);
                onPageChange(target.uthmaniPage || target.globalPage);
              }
            }}
            className={`rounded-lg border p-1 text-[10px] text-center shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer ${
              isDay
                ? "bg-[#FAF7F2] border-stone-400 text-stone-900 hover:border-amber-600"
                : "bg-[#061811] border-teal-600/40 text-emerald-200 hover:border-amber-400"
            }`}
            title={`পারা ${toBn(ref.para)}, পৃষ্ঠা ${toBn(ref.page)}-এ যান`}
          >
            <div className="font-bold border-b border-stone-300 dark:border-teal-700/50 pb-0.5 text-amber-600 dark:text-amber-400 text-[9px]">
              পারা | পৃষ্ঠা
            </div>
            <div className="font-black pt-0.5 tracking-wider text-[11px]">
              {pad2Bn(ref.para)} | {pad2Bn(ref.page)}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── BOTTOM ROW OF 5 BLUE QARI BUTTONS (স্ক্রিনশটের হুবহু নিচের ৫টি ক্বারী বাটন) ── */}
    <div className="w-full max-w-3xl mt-3 grid grid-cols-2 sm:grid-cols-5 gap-1.5 px-2 select-none">
      {POPULAR_QARIS.map((q) => {
        const isCurrent = (selectedQari === q.id);
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              if (onSelectQari) onSelectQari(q.id);
              if (onPlayAyah && pageAyahs[0]) {
                onPlayAyah(pageAyahs[0].numberInSurah, pageAyahs[0].surahId, q.id);
              }
            }}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border shadow-sm transition active:scale-95 cursor-pointer ${
              isCurrent
                ? "bg-sky-500 text-white border-sky-300 ring-2 ring-sky-300 font-extrabold shadow-md"
                : "bg-sky-700/90 hover:bg-sky-600 text-white border-sky-500"
            }`}
          >
            <span>{q.shortNameBn}</span>
          </button>
        );
      })}
    </div>
  </div>
);
}
