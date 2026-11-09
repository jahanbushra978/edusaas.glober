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
  HAFIZI_PARAS
} from "@/lib/quran/hafizi-pages";
import { splitArabicAyahWords } from "@/lib/quran/quran-audio-timing";

export default function HafiziMushafSheet({
  pageNum = 1,
  onPageChange,
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
}) {
  const isDay = readerTheme === "day";
  const [pageLoading, setPageLoading] = useState(true);
  const [pageAyahs, setPageAyahs] = useState([]);
  const [jumpInput, setJumpInput] = useState(String(pageNum));
  const [isParaDropdownOpen, setIsParaDropdownOpen] = useState(false);
  const pageContainerRef = useRef(null);

  // Get canonical metadata for this page
  const pageMeta = useMemo(() => {
    return getHafiziPageMeta(pageNum);
  }, [pageNum]);

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
    const info = HAFIZI_PARAS[p - 1];
    // Map Hafizi Para start page to 604 standard
    const targetUthmaniPage = Math.min(TOTAL_UTHMANI_PAGES, Math.max(1, Math.round((info.startPage / 610) * TOTAL_UTHMANI_PAGES)));
    onPageChange(targetUthmaniPage);
    setIsParaDropdownOpen(false);
    toast.success(`${info.nameBn} (${info.nameAr}) নির্বাচন করা হয়েছে`);
  };

  // Convert number to Bengali numerals
  const toBn = (num) => {
    const enToBnMap = { '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯' };
    return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
  };

  return (
    <div className="w-full flex flex-col items-center select-text" ref={pageContainerRef}>
      {/* ── TOP PAGE TOOLBAR (Quick Para, Page Slider, Zoom) ── */}
      <div className={`w-full max-w-4xl mb-4 px-2 sm:px-4 py-2.5 rounded-2xl ${
        isDay ? "bg-stone-100/90 border border-stone-200" : "bg-black/40 border border-emerald-900/60"
      } backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-xs text-xs font-bold`}>
        {/* Left: Para Quick Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsParaDropdownOpen(!isParaDropdownOpen)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              isDay
                ? "bg-white border-amber-300 text-emerald-950 hover:bg-amber-50"
                : "bg-emerald-950/80 border-emerald-700 text-emerald-200 hover:bg-emerald-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>{pageMeta.paraNameBn}</span>
            <span className="font-hafizi-quran text-sm text-amber-600 dark:text-amber-400">
              ({pageMeta.paraNameAr})
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Para Dropdown Menu */}
          {isParaDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-40 w-64 max-h-72 overflow-y-auto rounded-2xl bg-[#091f16] border border-emerald-700/80 shadow-2xl p-1.5 space-y-1 animate-fadeIn">
              <div className="px-3 py-1.5 text-[11px] font-bold text-emerald-400 border-b border-emerald-900/60 flex items-center justify-between">
                <span>পারা নির্বাচন করুন (১-৩০)</span>
                <span className="text-[10px] text-slate-400">৩০ পারা</span>
              </div>
              {HAFIZI_PARAS.map((p) => {
                const isCurrent = p.juz === pageMeta.para;
                return (
                  <button
                    key={p.juz}
                    type="button"
                    onClick={() => handleParaSelect(p.juz)}
                    className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-700 text-white font-extrabold"
                        : "hover:bg-emerald-900/70 text-slate-200"
                    }`}
                  >
                    <span>{p.nameBn}</span>
                    <span className="font-hafizi-quran text-amber-300 text-sm">
                      {p.nameAr}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center: Quick Page Jump Input */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
          <span className={`text-[11px] ${isDay ? "text-stone-600" : "text-slate-400"}`}>পৃষ্ঠা:</span>
          <input
            type="text"
            value={jumpInput}
            onChange={handleJumpInputChange}
            className={`w-14 px-2 py-1 text-center rounded-lg border font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
              isDay
                ? "bg-white border-amber-300 text-slate-900"
                : "bg-emerald-950/80 border-emerald-700 text-white"
            }`}
            placeholder="পৃষ্ঠা"
          />
          <span className={`text-[11px] ${isDay ? "text-stone-500" : "text-slate-400"}`}>
            / {toBn(TOTAL_UTHMANI_PAGES)}
          </span>
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs active:scale-95 cursor-pointer"
          >
            যান
          </button>
        </form>

        {/* Right: Zoom & Prev/Next Page Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className={`flex items-center rounded-xl p-0.5 border ${
            isDay ? "bg-white border-stone-300" : "bg-black/50 border-emerald-800/80"
          }`}>
            <button
              type="button"
              onClick={() => onChangeFontSize && onChangeFontSize(-2)}
              className={`p-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                isDay ? "hover:bg-stone-100 text-stone-700" : "hover:bg-emerald-900 text-slate-300"
              }`}
              title="লেখা ছোট করুন"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`px-1 text-[11px] font-black ${isDay ? "text-amber-800" : "text-amber-400"}`}>
              {arabicFontSize}px
            </span>
            <button
              type="button"
              onClick={() => onChangeFontSize && onChangeFontSize(2)}
              className={`p-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                isDay ? "hover:bg-stone-100 text-stone-700" : "hover:bg-emerald-900 text-slate-300"
              }`}
              title="লেখা বড় করুন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Page Flip Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={() => onPageChange(pageNum - 1)}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-30 ${
                isDay
                  ? "bg-white hover:bg-amber-50 border-stone-300 text-stone-800"
                  : "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-slate-200"
              }`}
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">আগের পাতা</span>
            </button>
            <button
              type="button"
              disabled={pageNum >= TOTAL_UTHMANI_PAGES}
              onClick={() => onPageChange(pageNum + 1)}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-30 ${
                isDay
                  ? "bg-white hover:bg-amber-50 border-stone-300 text-stone-800"
                  : "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-slate-200"
              }`}
              title="পরবর্তী পৃষ্ঠা"
            >
              <span className="hidden sm:inline text-xs">পরের পাতা</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── THE 15-LINE HAFIZI QURAN PAGE SHEET ── */}
      <div
        className={`w-full max-w-3xl rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-300 shadow-2xl overflow-hidden relative ${
          isDay
            ? "bg-[#FAF7F2] border-amber-600/60 shadow-amber-950/10 text-stone-900"
            : "bg-[#081a13] border-amber-500/70 shadow-emerald-950/40 text-slate-100"
        }`}
      >
        {/* Subtle Islamic Corner Floral Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* ── TOP RUNNING HEADER OF HAFIZI PAGE ── */}
        <div
          className={`px-3 sm:px-8 py-2.5 sm:py-3 border-b-2 flex items-center justify-between text-xs font-bold ${
            isDay
              ? "bg-[#F3EEE2] border-amber-600/40 text-stone-800"
              : "bg-[#06140e] border-amber-500/40 text-emerald-200"
          }`}
        >
          {/* Top Left: Para Info */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
              {pageMeta.paraNameBn}
            </span>
            <span className="font-hafizi-quran text-sm opacity-90 hidden xs:inline">
              ({pageMeta.paraNameAr})
            </span>
          </div>

          {/* Top Center: 15 Lines Badge */}
          <div className="text-center">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
              isDay
                ? "bg-amber-100 text-amber-950 border-amber-300 font-black"
                : "bg-emerald-950 text-amber-300 border-amber-500/40 font-bold"
            }`}>
              হাফেজী মুসহাফ • {pageMeta.expectedLines} লাইন
            </span>
          </div>

          {/* Top Right: Surah Name */}
          <div className="flex items-center gap-1.5">
            <span className="font-hafizi-quran text-base sm:text-lg text-amber-600 dark:text-amber-300 font-bold">
              {pageMeta.firstSurahMeta.nameAr}
            </span>
            <span className="hidden sm:inline text-xs opacity-80">
              ({pageMeta.firstSurahMeta.nameBn})
            </span>
          </div>
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

                        return (
                          <span
                            key={`${ayah.surahId}-${ayah.numberInSurah}`}
                            id={`mushaf-ayah-${ayah.surahId}-${ayah.numberInSurah}`}
                            onClick={() => onPlayAyah && onPlayAyah(ayah.numberInSurah, ayah.surahId)}
                            className={`inline cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-xl ${
                              isThisAyahActive
                                ? isPlayingAudio
                                  ? "bg-amber-400/25 ring-2 ring-amber-400/90 shadow-lg"
                                  : "bg-emerald-800/40 ring-1 ring-amber-400/60"
                                : isTargetJump
                                ? "bg-amber-500/30 ring-2 ring-amber-400 animate-pulse"
                                : isDay
                                ? "active:bg-amber-200/50 md:hover:bg-amber-100/70"
                                : "active:bg-emerald-800/30 md:hover:bg-emerald-900/30"
                            }`}
                            title={`সূরা ${ayah.surahNameBn}, আয়াত ${toBn(ayah.numberInSurah)} শুনতে ক্লিক করুন`}
                          >
                            {ayah.words.map((word, wIdx) => {
                              const isThisWordActive =
                                isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;
                              return (
                                <span
                                  key={wIdx}
                                  className={`inline-block transition-all duration-150 px-1 mx-0.5 rounded-md ${
                                    isThisWordActive
                                      ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-200 scale-105"
                                      : isThisAyahActive
                                      ? "text-amber-500 dark:text-amber-300 font-bold"
                                      : isDay
                                      ? "text-stone-900"
                                      : "text-slate-100"
                                  }`}
                                >
                                  {word}
                                </span>
                              );
                            })}

                            {/* Verse End Ayatul Khatm Symbol */}
                            <span className="inline-flex items-center justify-center font-hafizi-quran text-amber-600 dark:text-amber-400 font-black text-xl sm:text-2xl mx-1 select-none">
                              ۝{toBn(ayah.numberInSurah)}
                            </span>{" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
