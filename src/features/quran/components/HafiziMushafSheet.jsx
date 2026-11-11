"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import {
  TOTAL_UTHMANI_PAGES,
  getHafiziPageMeta,
  HAFIZI_PARAS
} from "@/lib/quran/hafizi-pages";
import {
  getHafiziHeaderMetadata,
  MUTASHABIHAT_REGISTRY,
  WAQF_IBTIDA_REGISTRY,
  getThematicSummaryForPage
} from "@/lib/quran/hafizi-annotations";
import { splitArabicAyahWords } from "@/lib/quran/quran-audio-timing";

// Clean Arabic text for robust fuzzy matching without harakat/tashkeel/waqf
function cleanArabic(str) {
  return (str || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, "")
    .replace(/[\u06D6-\u06DC\u06DF-\u06E9\u06DE]/g, "")
    .replace(/[أإآء]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/[ةه]/g, "ه")
    .replace(/[ـ\s+]+/g, " ")
    .trim();
}

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
  const [showMobileMargins, setShowMobileMargins] = useState(false);
  const pageContainerRef = useRef(null);

  // Get canonical metadata for this page
  const pageMeta = useMemo(() => {
    return getHafiziPageMeta(pageNum);
  }, [pageNum]);

  // Current Para Info
  const currentPara = useMemo(() => {
    return HAFIZI_PARAS.find((p) => p.juz === pageMeta.para) || HAFIZI_PARAS[0];
  }, [pageMeta.para]);

  // Hafizi Header Metadata
  const headerMeta = useMemo(() => {
    return getHafiziHeaderMetadata(pageNum, currentPara, pageMeta.firstSurahMeta);
  }, [pageNum, currentPara, pageMeta]);

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

  // Find Mutashabihat matches on this page (sorted from top of page, serial [১], [২], [৩]...)
  const pageMutashabihat = useMemo(() => {
    if (!pageAyahs || pageAyahs.length === 0) return [];
    const matched = [];
    pageAyahs.forEach((a) => {
      const cleanAyahWords = (a.words && a.words.length > 0 ? a.words : splitArabicAyahWords(a.text)).map((w) => cleanArabic(w));
      const fullCleanText = cleanAyahWords.join(" ");

      MUTASHABIHAT_REGISTRY.forEach((entry, idx) => {
        const cleanPhrase = cleanArabic(entry.phraseClean || entry.phraseAr);
        const phraseWords = cleanPhrase.split(/\s+/).filter(Boolean);

        const hasMatch =
          fullCleanText.includes(cleanPhrase) ||
          (phraseWords.length >= 2 && phraseWords.every((pw) => cleanAyahWords.some((aw) => aw.includes(pw) || pw.includes(aw))));

        if (hasMatch) {
          if (!matched.some((m) => m.phraseClean === entry.phraseClean && m.ayahNumber === a.numberInSurah)) {
            matched.push({
              ...entry,
              refNo: idx + 1,
              ayahNumber: a.numberInSurah,
              surahId: a.surahId,
            });
          }
        }
      });
    });
    // Assign 1-based serial order from the top of the page
    return matched.map((item, sIdx) => ({
      ...item,
      pageSerial: sIdx + 1,
    }));
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
        list.push({
          ...ref,
          refNo: m.refNo,
          meaningBn: m.meaningBn,
          phraseAr: m.phraseAr,
        });
      });
    });
    // Ensure sufficient authentic references to populate the side margins like the printed page
    const p = pageMeta.para;
    const pg = pageMeta.paraPage;
    const defaults = [
      { para: p, page: pg },
      { para: Math.max(1, p - 1), page: 18 },
      { para: Math.max(1, p - 1), page: 20 },
      { para: p, page: Math.max(1, pg - 4) },
      { para: p, page: Math.min(20, pg + 4) },
      { para: Math.min(30, p + 1), page: 1 },
      { para: Math.min(30, p + 1), page: 8 },
      { para: Math.min(30, p + 2), page: 12 },
    ];
    defaults.forEach((d) => {
      if (!list.some((item) => item.para === d.para && item.page === d.page)) {
        list.push(d);
      }
    });
    return list;
  }, [pageMutashabihat, pageMeta]);

  const leftMarginRefs = useMemo(() => allMarginRefs.slice(0, Math.ceil(allMarginRefs.length / 2)), [allMarginRefs]);
  const rightMarginRefs = useMemo(() => allMarginRefs.slice(Math.ceil(allMarginRefs.length / 2)), [allMarginRefs]);

  return (
    <div className="w-full flex flex-col items-center select-text" ref={pageContainerRef}>
      {/* ── THE 15-LINE HAFIZI QURAN PAGE SHEET (SCREENSHOT AUTHENTIC FRAME) ── */}
      <div className="w-full max-w-3xl flex items-start justify-center">
        <div
          className={`w-full rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-300 shadow-2xl overflow-hidden relative ${
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

        {/* ── স্ক্রিনশটের হুবহু অথেনটিক হাফেজী কুরআন হেডার বার ── */}
        <div
          className={`w-full px-2 sm:px-4 py-1.5 sm:py-2 border-b-2 flex items-center justify-between gap-1 sm:gap-2 text-xs font-bold select-none overflow-hidden ${
            isDay
              ? "bg-[#F3EEE2] border-amber-600/40 text-stone-900"
              : "bg-[#06140e] border-amber-500/50 text-emerald-100"
          }`}
        >
          {/* বাম অংশ: সূরার নাম ও পারার পৃষ্ঠা */}
          <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0">
            {/* সূরার নাম ও সূরা নম্বর (যেমন: سورة الأنفال ৮ বা البقرة ২) */}
            <span
              className="font-hafizi-quran text-xs sm:text-sm md:text-base font-black text-amber-500 dark:text-amber-400 truncate max-w-[85px] sm:max-w-[130px] md:max-w-none"
              dir="rtl"
              title={`সূরা ${pageMeta.firstSurahMeta?.nameBn || "আল-বাকারা"}`}
            >
              {pageMeta.firstSurahMeta?.nameAr || "البقرة"} {toBn(pageMeta.firstSurahMeta?.id || 2)}
            </span>

            {/* পারা ও পৃষ্ঠা (যেমন: পারা-১০ পৃষ্ঠা-১) — স্পষ্ট ও উজ্জ্বল গোল্ডেন টেক্সট */}
            <span
              className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap shadow-2xs ${
                isDay
                  ? "bg-amber-200/80 text-amber-950 border border-amber-600/40"
                  : "bg-amber-950/60 text-amber-300 border border-amber-500/40"
              }`}
            >
              পারা-{toBn(pageMeta.para)} পৃষ্ঠা-{toBn(pageMeta.paraPage)}
            </span>
          </div>

          {/* সেন্টারে শায়েখের নাম: নীল বাটন (ক্লিক করলে ড্রপডাউন মেনু থেকে শায়েখ নির্বাচন করা যাবে) */}
          <div className="flex items-center justify-center relative shrink-0 mx-0.5">
            <button
              type="button"
              onClick={() => setIsQariMenuOpen((prev) => !prev)}
              className="px-2 sm:px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] sm:text-xs shadow-md border border-sky-400 flex items-center gap-1 cursor-pointer active:scale-95 transition"
              title="শায়েখের তিলাওয়াত নির্বাচন করতে ক্লিক করুন"
            >
              <span className="truncate max-w-[85px] sm:max-w-[130px] md:max-w-none">
                {POPULAR_QARIS.find((q) => q.id === selectedQari)?.shortNameBn || "শায়খ মাহমুদ খলিল আল হুসারী"}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-90 shrink-0 transition-transform ${isQariMenuOpen ? "rotate-180" : ""}`} />
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
                  🎙️ শায়েখ নির্বাচন করুন
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
                        toast.success(`${q.shortNameBn} নির্বাচন করা হয়েছে`);
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

          {/* ডান অংশ: মনজিল, পারার নাম এবং গ্লোবাল পৃষ্ঠা নম্বর */}
          <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0 justify-end">
            {/* মনজিল নম্বর */}
            <span
              className="font-hafizi-quran text-[11px] sm:text-xs md:text-sm font-black text-amber-500 dark:text-amber-400 shrink-0 whitespace-nowrap"
              dir="rtl"
            >
              منزل {toBn(headerMeta.manzil)}
            </span>

            {/* পারার নাম ও নম্বর (যেমন: وَاعْلَمُوا ১০ বা الم ۱) */}
            <span
              className="font-hafizi-quran text-xs sm:text-sm md:text-base font-black text-amber-500 dark:text-amber-400 truncate max-w-[85px] sm:max-w-[120px] md:max-w-none"
              dir="rtl"
            >
              {currentPara?.nameAr || "الم"} {toBn(pageMeta.para)}
            </span>

            {/* গ্লোবাল পৃষ্ঠা নম্বর (যেমন: ১৮২) — কখনও স্ক্রিনের বাইরে যাবে না */}
            <span
              className={`text-[11px] sm:text-xs md:text-sm font-black px-1.5 py-0.5 rounded-lg border shadow-xs shrink-0 whitespace-nowrap ${
                isDay
                  ? "bg-amber-100 text-amber-950 border-amber-500"
                  : "bg-emerald-950/90 text-amber-300 border-amber-500/80"
              }`}
              title={`গ্লোবাল পৃষ্ঠা নম্বর ${toBn(pageNum)}`}
            >
              {toBn(pageNum)}
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

                    {/* ── RECITATION VERSES (Continuous Justified 15-Line Ruled Mushaf Flow) ── */}
                    <div
                      className="font-hafizi-quran text-justify leading-[2.6] sm:leading-[2.9] select-text px-1 sm:px-2 rounded-lg"
                      style={{
                        fontSize: `${arabicFontSize}px`,
                        backgroundImage: isDay
                          ? "repeating-linear-gradient(transparent, transparent 50px, rgba(180, 83, 9, 0.12) 50px, rgba(180, 83, 9, 0.12) 51px)"
                          : "repeating-linear-gradient(transparent, transparent 52px, rgba(45, 212, 191, 0.12) 52px, rgba(45, 212, 191, 0.12) 53px)"
                      }}
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

                        // Find exact [startIdx, endIdx] word slices for Mutashabihat phrases in this Ayah
                        const cleanAyahWords = (ayah.words || []).map((w) => cleanArabic(w));
                        const ayahWordMatches = [];

                        ayahMutashabihat.forEach((m) => {
                          const cleanPhraseWords = cleanArabic(m.phraseClean || m.phraseAr)
                            .split(/\s+/)
                            .filter(Boolean);

                          if (cleanPhraseWords.length > 0 && cleanAyahWords.length >= cleanPhraseWords.length) {
                            for (let i = 0; i <= cleanAyahWords.length - cleanPhraseWords.length; i++) {
                              let isMatch = true;
                              for (let j = 0; j < cleanPhraseWords.length; j++) {
                                const aW = cleanAyahWords[i + j];
                                const pW = cleanPhraseWords[j];
                                if (aW !== pW && !aW.includes(pW) && !pW.includes(aW)) {
                                  isMatch = false;
                                  break;
                                }
                              }
                              if (isMatch) {
                                ayahWordMatches.push({
                                  startIdx: i,
                                  endIdx: i + cleanPhraseWords.length - 1,
                                  mutashabihat: m,
                                });
                                break;
                              }
                            }
                          }
                        });

                        const HAS_WAQF_MARK_REGEX = /[\u06D6-\u06DA\u06DC\u06E2\u06E9]|\b(قلى|صلى|ج|ط|م|لا|قف)\b/;

                        return (
                          <span
                            key={`${ayah.surahId}-${ayah.numberInSurah}`}
                            id={`mushaf-ayah-${ayah.surahId}-${ayah.numberInSurah}`}
                            onClick={() => onPlayAyah && onPlayAyah(ayah.numberInSurah, ayah.surahId)}
                            className="inline cursor-pointer select-text transition-colors"
                            title={`সূরা ${ayah.surahNameBn}, আয়াত ${toBn(ayah.numberInSurah)} শুনতে ক্লিক করুন`}
                          >
                            {ayah.words.map((word, wIdx) => {
                              const isThisWordActive =
                                isThisAyahActive && activeWordIndex === wIdx && activeWordIndex >= 0;

                              // Check if word is part of any Mutashabihat slice in this Ayah
                              const activeMatch = ayahWordMatches.find((m) => wIdx >= m.startIdx && wIdx <= m.endIdx);
                              const isMutashabihatStart = activeMatch && wIdx === activeMatch.startIdx;
                              const isMutashabihatEnd = activeMatch && wIdx === activeMatch.endIdx;
                              const isInMutashabihat = !!activeMatch;

                              // Check if word is a Waqf stop point (either explicit in registry or has Quranic Waqf sign)
                              const wordHasWaqfSign = HAS_WAQF_MARK_REGEX.test(word);
                              const explicitWaqfStop = ayahWaqfList.find((w) =>
                                cleanArabic(word).includes(cleanArabic(w.stopAfterWord)) ||
                                cleanArabic(w.stopAfterWord).includes(cleanArabic(word))
                              );
                              const isWaqfStopWord = !!explicitWaqfStop || wordHasWaqfSign;

                              // Check if word is an Ibtida resume point (either explicit in registry or immediately follows a Waqf stop)
                              const explicitWaqfResume = ayahWaqfList.find((w) =>
                                cleanArabic(word).includes(cleanArabic(w.resumeAtWord)) ||
                                cleanArabic(w.resumeAtWord).includes(cleanArabic(word))
                              );
                              const prevWordHasWaqf = wIdx > 0 && (
                                HAS_WAQF_MARK_REGEX.test(ayah.words[wIdx - 1]) ||
                                ayahWaqfList.some((w) =>
                                  cleanArabic(ayah.words[wIdx - 1]).includes(cleanArabic(w.stopAfterWord)) ||
                                  cleanArabic(w.stopAfterWord).includes(cleanArabic(ayah.words[wIdx - 1]))
                                )
                              );
                              const isIbtidaResumeWord = !!explicitWaqfResume || prevWordHasWaqf;

                              return (
                                <span key={wIdx} className="inline-block relative">
                                  {/* ১. মুতাশাবিহাত শুরুর চিহ্ন: [১] সিরিয়াল নম্বর ও প্রারম্ভিক কোণ ব্র্যাকেট ┌ */}
                                  {isMutashabihatStart && (
                                    <span className="inline-flex items-center align-middle mx-0.5 select-none" dir="rtl">
                                      <sup
                                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-300 text-[10px] font-black shadow-xs mx-0.5"
                                        title={`মুতাশাবিহাত #${toBn(activeMatch.mutashabihat.pageSerial)}: ${activeMatch.mutashabihat.meaningBn || ""}`}
                                      >
                                        [{toBn(activeMatch.mutashabihat.pageSerial)}]
                                      </sup>
                                      <span className="text-emerald-400 font-black text-sm leading-none px-0.5" title="সদৃশ আয়াতের প্রারম্ভিক ব্র্যাকেট">
                                        ┌
                                      </span>
                                    </span>
                                  )}

                                  {/* ২. শায়খের তিলাওয়াত পুনরায় শুরুর মার্কার [✓] (ইবতিদা) */}
                                  {isIbtidaResumeWord && (
                                    <span
                                      className="inline-flex items-center justify-center w-3.5 h-3.5 mx-0.5 rounded-full bg-emerald-500/25 border border-emerald-400 text-emerald-300 text-[10px] font-black align-middle select-none shadow-xs"
                                      title={`পুনরায় তিলাওয়াত শুরুর স্থান (ইবতিদা): ${word}`}
                                    >
                                      ✓
                                    </span>
                                  )}

                                  {/* ৩. মূল শব্দের টেক্সট (মুতাশাবিহাত হলে শতভাগ স্পষ্ট সবুজ রঙ!) */}
                                  <span
                                    className={`inline-block transition-all duration-100 px-0.5 mx-[1.5px] rounded-sm ${
                                      isThisWordActive
                                        ? "bg-amber-400/95 text-slate-950 font-black px-1.5 py-0.5 rounded-md shadow-md ring-2 ring-amber-300 scale-102"
                                        : isTargetJump
                                        ? "text-amber-400 dark:text-amber-300 font-black"
                                        : isThisAyahActive
                                        ? isDay
                                          ? "text-amber-900 font-bold"
                                          : "text-amber-300 font-bold"
                                        : isInMutashabihat
                                        ? "text-emerald-500 dark:text-emerald-400 font-bold underline decoration-emerald-500/80 decoration-2 underline-offset-4"
                                        : isDay
                                        ? "text-stone-950"
                                        : "text-white"
                                    }`}
                                  >
                                    {word}
                                  </span>

                                  {/* ৪. মুতাশাবিহাত সমাপ্তি চিহ্ন: সমাপনী কোণ ব্র্যাকেট ┘ */}
                                  {isMutashabihatEnd && (
                                    <span className="inline-block text-emerald-400 font-black text-sm leading-none px-0.5 select-none align-middle" title="সদৃশ আয়াতের সমাপনী ব্র্যাকেট">
                                      ┘
                                    </span>
                                  )}

                                  {/* ৫. শায়খের দম ফেলার স্থান: গোল্ডেন স্টার মার্কার [★] (ওয়াকফ) */}
                                  {isWaqfStopWord && (
                                    <span
                                      className="inline-flex items-center justify-center w-3.5 h-3.5 mx-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-[11px] font-black align-middle select-none shadow-xs"
                                      title={`দম ফেলার স্থান (ওয়াকফ): ${word}`}
                                    >
                                      ★
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

        {/* ── ৪. বিষয়ভিত্তিক সারসংক্ষেপ ও কুরআনিক হেদায়াত (THEMATIC SUMMARY CARD) ── */}
        <div
          className={`mx-3 sm:mx-8 mb-4 p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
            isDay
              ? "bg-amber-50/90 border-amber-300/80 text-stone-800"
              : "bg-[#071d16]/95 border-emerald-700/50 text-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🌿</span>
            <div>
              <p className="font-black text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs">
                পৃষ্ঠা সারসংক্ষেপ ও হেদায়াত — সূরা {pageMeta.firstSurahMeta.nameBn} (আয়াত {toBn(pageAyahs[0]?.numberInSurah || 1)} - {toBn(pageAyahs[pageAyahs.length - 1]?.numberInSurah || pageAyahs.length)}):
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                {thematicSummary}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {pageMutashabihat.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] font-black">
                মুতাশাবিহাত: {toBn(pageMutashabihat.length)}টি
              </span>
            )}
            {Object.keys(waqfIbtidaMap).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 text-[10px] font-black">
                ওয়াকফ: {toBn(Object.keys(waqfIbtidaMap).length)}টি
              </span>
            )}
          </div>
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
