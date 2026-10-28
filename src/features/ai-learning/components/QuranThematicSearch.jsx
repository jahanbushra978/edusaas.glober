"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search,
  BookOpen,
  Volume2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Compass
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SURAHS } from "@/lib/quran/quran-meta";
import {
  HAFIZI_PARAS,
  getParaTotalPages,
  getHafiziPageTarget,
  getHafiziLocationForAyah,
  parseHafiziSearchQuery
} from "@/lib/quran/hafizi-pages";
import { getQariAudioUrl, getActiveShaykhId } from "@/lib/ai/qari-registry";
import { useBanglaAudioEngine } from "@/lib/quran/bangla-audio-engine";

const POPULAR_THEMATIC_TOPICS = [
  { id: "salah", label: "সালাত ও নামায", query: "সালাত", icon: "🕌" },
  { id: "sabr", label: "ধৈর্য ও সবর", query: "সবর", icon: "🛡️" },
  { id: "parents", label: "পিতামাতার সেবা", query: "পিতামাতা", icon: "👨‍👩‍👧" },
  { id: "musa", label: "মূসা (আঃ) এর ঘটনা", query: "মূসা", icon: "📜" },
  { id: "ramadan", label: "রমজান ও রোজা", query: "রমজান", icon: "🌙" },
  { id: "jannah", label: "জান্নাতের নিয়ামত", query: "জান্নাত", icon: "🌿" },
  { id: "tawbah", label: "তওবা ও ক্ষমা", query: "তওবা", icon: "🤲" },
  { id: "sajdah", label: "সাজদাহর আয়াতসমূহ", query: "সাজদাহ", icon: "🙇" },
  { id: "zakat", label: "যাকাত ও দান-সদকা", query: "যাকাত", icon: "💰" },
  { id: "rizq", label: "রিযিক ও বরকত", query: "রিযিক", icon: "🌾" },
  { id: "justice", label: "ইনসাফ ও ন্যায়বিচার", query: "ইনসাফ", icon: "⚖️" },
  { id: "jahannam", label: "জাহান্নাম থেকে সতর্কতা", query: "জাহান্নাম", icon: "🔥" },
];

const POPULAR_SURAH_IDS = [1, 2, 18, 36, 55, 56, 67, 78, 112, 113, 114];

// Helper to highlight Arabic text with diacritic-tolerant matching
function HighlightedArabic({ text, query }) {
  if (!text) return null;

  const arabicTerms = [];
  const rawQ = (query || "").trim();
  if (rawQ && /[\u0600-\u06FF]/.test(rawQ)) {
    arabicTerms.push(rawQ);
  }

  // Common thematic keywords mapping to Arabic roots
  const lowerQ = rawQ.toLowerCase();
  if (lowerQ.includes("সালাত") || lowerQ.includes("নামাজ") || lowerQ.includes("নামায") || lowerQ === "salah") {
    arabicTerms.push("الصلاة", "صلاتهم", "يصلون");
  } else if (lowerQ.includes("সবর") || lowerQ.includes("ধৈর্য") || lowerQ === "sabr") {
    arabicTerms.push("الصبر", "صابرين", "اصبروا");
  } else if (lowerQ.includes("পিতামাতা") || lowerQ.includes("মা-বাবা") || lowerQ === "parents") {
    arabicTerms.push("الوالدين", "والديك");
  } else if (lowerQ.includes("মূসা") || lowerQ === "musa") {
    arabicTerms.push("موسى");
  } else if (lowerQ.includes("রমজান") || lowerQ.includes("রোজা") || lowerQ === "ramadan") {
    arabicTerms.push("رمضان", "الصيام", "صوم");
  } else if (lowerQ.includes("জান্নাত") || lowerQ === "jannah") {
    arabicTerms.push("الجنة", "جنات");
  } else if (lowerQ.includes("তওবা") || lowerQ.includes("ক্ষমা") || lowerQ === "tawbah") {
    arabicTerms.push("توبوا", "التواب", "استغفروا");
  } else if (lowerQ.includes("সাজদাহ") || lowerQ === "sajdah") {
    arabicTerms.push("اسجدوا", "سجدا", "يسجدون");
  } else if (lowerQ.includes("যাকাত") || lowerQ === "zakat") {
    arabicTerms.push("الزكاة");
  } else if (lowerQ.includes("রিযিক") || lowerQ === "rizq") {
    arabicTerms.push("رزق", "يرزق");
  } else if (lowerQ.includes("ইনসাফ") || lowerQ === "justice") {
    arabicTerms.push("القسط", "العدل");
  } else if (lowerQ.includes("জাহান্নাম") || lowerQ === "jahannam") {
    arabicTerms.push("جهنم", "النار");
  }

  if (arabicTerms.length === 0) {
    return <span>{text}</span>;
  }

  const diacritics = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*";
  const patterns = arabicTerms
    .map((term) => {
      const base = term.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
      if (!base || base.length < 2) return null;
      const charPatterns = [...base].map((ch) => {
        if (/[اأإآٱ]/.test(ch)) return "(?:[اأإآٱوۏ]|)";
        if (/[ةهت]/.test(ch)) return "[ةهت]";
        if (/[يىئ]/.test(ch)) return "[يىئ]";
        if (/[وۏ]/.test(ch)) return "[وۏاأإآٱ]";
        return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      });
      return `(?:[وفبل]${diacritics})?${charPatterns.join(diacritics)}${diacritics}`;
    })
    .filter(Boolean);

  if (patterns.length === 0) return <span>{text}</span>;

  const combinedPattern = patterns.join("|");
  const splitRegex = new RegExp(`(${combinedPattern})`, "ui");
  const matchChecker = new RegExp(`^(?:${combinedPattern})$`, "ui");

  const parts = text.split(splitRegex);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (matchChecker.test(part)) {
          return (
            <mark
              key={i}
              className="bg-amber-400/25 text-amber-300 font-black px-1.5 py-0.5 rounded-lg border border-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.3)] mx-0.5 inline-block"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// Helper to highlight Bengali / English text in translation
function HighlightedTranslation({ text, query, matchedWord }) {
  if (!text) return null;

  const termsToHighlight = [];
  const rawQ = (query || "").trim();

  // If query is Bengali or English
  if (rawQ && !/[\u0600-\u06FF]/.test(rawQ)) {
    termsToHighlight.push(rawQ);
  }
  if (matchedWord && !/[\u0600-\u06FF]/.test(matchedWord) && !termsToHighlight.includes(matchedWord)) {
    termsToHighlight.push(matchedWord);
  }

  // Also map Arabic search words to Bengali meanings
  const baseArabic = rawQ.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
  if (baseArabic.includes("ينفق") || baseArabic.includes("انفق")) {
    termsToHighlight.push("ব্যয় করে", "ব্যয় কর", "দান করে", "খরচ করে");
  } else if (baseArabic.includes("صلو") || baseArabic.includes("صلا")) {
    termsToHighlight.push("সালাত", "নামাজ", "নামায");
  } else if (baseArabic.includes("صبر")) {
    termsToHighlight.push("ধৈর্য", "সবর");
  } else if (baseArabic.includes("والد")) {
    termsToHighlight.push("পিতা-মাতা", "পিতামাতা", "মা-বাবা");
  } else if (baseArabic.includes("موسى")) {
    termsToHighlight.push("মূসা");
  } else if (baseArabic.includes("جن")) {
    termsToHighlight.push("জান্নাত", "বাগান");
  } else if (baseArabic.includes("توب") || baseArabic.includes("غفر")) {
    termsToHighlight.push("তওবা", "ক্ষমা");
  } else if (baseArabic.includes("سجد")) {
    termsToHighlight.push("সাজদাহ", "সিজদা", "সেজদা");
  } else if (baseArabic.includes("زكو") || baseArabic.includes("زكا")) {
    termsToHighlight.push("যাকাত");
  } else if (baseArabic.includes("رزق")) {
    termsToHighlight.push("রিযিক", "রুযী", "জীবিকা");
  }

  // If query is one of our common topics in Bangla/English
  const lowerQ = rawQ.toLowerCase();
  if (lowerQ.includes("সালাত") || lowerQ.includes("নামাজ") || lowerQ.includes("নামায") || lowerQ === "salah") {
    termsToHighlight.push("সালাত", "নামাজ", "নামায");
  } else if (lowerQ.includes("সবর") || lowerQ.includes("ধৈর্য") || lowerQ === "sabr") {
    termsToHighlight.push("ধৈর্য", "সবর");
  } else if (lowerQ.includes("পিতামাতা") || lowerQ.includes("মা-বাবা") || lowerQ === "parents") {
    termsToHighlight.push("পিতা-মাতা", "পিতামাতা", "মা-বাবা");
  } else if (lowerQ.includes("মূসা") || lowerQ === "musa") {
    termsToHighlight.push("মূসা");
  }

  const validTerms = termsToHighlight
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (validTerms.length === 0) return <span>{text}</span>;

  // Escape special regex characters
  const escaped = [...new Set(validTerms)].map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const combinedPattern = escaped.join("|");
  const splitRegex = new RegExp(`(${combinedPattern})`, "ui");
  const matchChecker = new RegExp(`^(?:${combinedPattern})$`, "ui");

  const parts = text.split(splitRegex);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (matchChecker.test(part)) {
          return (
            <mark
              key={i}
              className="bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/40 shadow-xs inline-block"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function QuranThematicSearch({ onSelectAyah }) {
  // Navigation Tabs: 'thematic' | 'catalog'
  const [activeTab, setActiveTab] = useState("thematic");

  // ── THEMATIC SEARCH STATE ──
  const [query, setQuery] = useState("সালাত");
  const [activeSearchTerm, setActiveSearchTerm] = useState("সালাত");
  const [activeTopicId, setActiveTopicId] = useState("salah");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(26);

  // ── QARI AUDIO STATE (100% Authentic Recitation, Zero Robotic Synth) ──
  const [playingKey, setPlayingKey] = useState(null);
  const audioRef = useRef(null);

  // ── UNIVERSAL BANGLA TRANSLATION AUDIO ENGINE ──
  const {
    currentId: playingBanglaId,
    isLoading: isBanglaLoading,
    activeWordIndex: activeBanglaWordIndex,
    toggle: toggleBanglaAudio,
    stop: stopBanglaAudio
  } = useBanglaAudioEngine();

  // ── 114 SURAH & HAFIZI CATALOG STATE ──
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogFilter, setCatalogFilter] = useState("all"); // 'all' | 'hafizi' | 'popular' | 'meccan' | 'medinan'
  const [selectedHafiziPara, setSelectedHafiziPara] = useState(1);
  const [selectedHafiziPage, setSelectedHafiziPage] = useState(1);

  const queryRef = useRef(query);
  queryRef.current = query;

  // Stop currently playing Qari audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingKey(null);
  }, []);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopBanglaAudio();
    };
  }, [stopAudio, stopBanglaAudio]);

  // Execute Thematic AI Search
  const executeSearch = useCallback(async (searchQuery, topicId = null) => {
    const q = searchQuery !== undefined ? searchQuery : queryRef.current;
    if (!q || !q.trim()) {
      toast.info("অনুসন্ধানের জন্য বিষয় বা শব্দ লিখুন।");
      return;
    }

    setActiveSearchTerm(q.trim());

    if (topicId) {
      setActiveTopicId(topicId);
    } else {
      const matched = POPULAR_THEMATIC_TOPICS.find(
        (t) => t.query.toLowerCase() === q.trim().toLowerCase() || t.label.includes(q.trim())
      );
      setActiveTopicId(matched ? matched.id : null);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/nur/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() })
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.results)) {
        setResults(data.results);
        setTotalMatches(data.totalMatches || data.results.length);
        if (data.results.length === 0 && data.message) {
          toast.info(data.message);
        }
      } else {
        toast.error(data.message || "অনুসন্ধান ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Quran thematic search error:", err);
      toast.error("সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: check URL query parameter or default to "সালাত"
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlQ = params.get("q");
        if (urlQ && urlQ.trim()) {
          const decoded = decodeURIComponent(urlQ.trim());
          setQuery(decoded);
          setActiveSearchTerm(decoded);
          executeSearch(decoded);
          return;
        }
      } catch {}
    }
    executeSearch("সালাত", "salah");
  }, [executeSearch]);

  const handleTopicClick = (topic) => {
    setQuery(topic.label);
    setActiveSearchTerm(topic.query);
    executeSearch(topic.query, topic.id);
  };

  // Play Authentic Qari Recitation using EveryAyah CDN (Zero Robotic Synth)
  const playVerseAudio = (verse, uniqueKey) => {
    stopBanglaAudio();
    if (playingKey === uniqueKey) {
      stopAudio();
      return;
    }
    stopAudio();

    const qariId = getActiveShaykhId() || "alafasy";
    const audioUrl = getQariAudioUrl(qariId, verse.surah, verse.ayah);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingKey(uniqueKey);

    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingKey(null);
      }
    };

    audio.onerror = () => {
      // Automatic fallback to Alafasy if the selected reciter is unavailable
      if (qariId !== "alafasy") {
        const fallbackUrl = getQariAudioUrl("alafasy", verse.surah, verse.ayah);
        const fallbackAudio = new Audio(fallbackUrl);
        audioRef.current = fallbackAudio;
        fallbackAudio.onended = () => {
          if (audioRef.current === fallbackAudio) {
            audioRef.current = null;
            setPlayingKey(null);
          }
        };
        fallbackAudio.onerror = () => {
          toast.error("ক্বারীর তিলাওয়াত লোড করা যায়নি।");
          setPlayingKey(null);
        };
        fallbackAudio.play().catch(() => setPlayingKey(null));
        return;
      }
      toast.error("ক্বারীর তিলাওয়াত লোড করা যায়নি।");
      setPlayingKey(null);
    };

    audio.play().catch((err) => {
      console.warn("Audio play prevented:", err);
      setPlayingKey(null);
    });
  };

  // Toggle Authentic Neural Bengali Translation Audio
  const handleToggleBangla = (text, id) => {
    stopAudio();
    toggleBanglaAudio(text, id);
  };

  // ── NATURAL LANGUAGE HAFIZI QUERY DETECTION ──
  const parsedThematicHafizi = useMemo(() => {
    return parseHafiziSearchQuery(query);
  }, [query]);

  const parsedCatalogHafizi = useMemo(() => {
    return parseHafiziSearchQuery(catalogSearch);
  }, [catalogSearch]);

  // Total pages for selected Hafizi Para
  const currentParaTotalPages = useMemo(() => {
    return getParaTotalPages(selectedHafiziPara);
  }, [selectedHafiziPara]);

  // Filter 114 Surahs
  const filteredSurahs = useMemo(() => {
    let list = ALL_SURAHS;

    // Filter Type
    if (catalogFilter === "popular") {
      list = list.filter((s) => POPULAR_SURAH_IDS.includes(s.id));
    } else if (catalogFilter === "meccan") {
      list = list.filter((s) => s.type === "Meccan" || s.typeBn === "মাক্কী");
    } else if (catalogFilter === "medinan") {
      list = list.filter((s) => s.type === "Medinan" || s.typeBn === "মাদানী");
    }

    // Search Query (Surah name, number, meaning, arabic)
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return list;

    // If query is numeric (e.g. "36")
    const num = parseInt(q, 10);
    if (!isNaN(num) && num >= 1 && num <= 114) {
      return list.filter((s) => s.id === num);
    }

    return list.filter((s) => {
      return (
        s.nameBn.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.includes(q) ||
        (s.meaningBn && s.meaningBn.toLowerCase().includes(q)) ||
        String(s.id) === q
      );
    });
  }, [catalogSearch, catalogFilter]);

  // Jump to Hafizi Para & Page
  const handleJumpToHafizi = (para, page) => {
    const target = getHafiziPageTarget(para, page);
    toast.success(`হাফেজী পারা ${para}, পৃষ্ঠা ${page}-এ নিয়ে যাওয়া হচ্ছে...`);
    if (onSelectAyah) {
      onSelectAyah({
        surah: target.surah,
        ayah: target.ayah,
        page: target.globalPage,
        para,
        paraPage: page
      });
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* ── TOP PRIMARY TABS: SEARCH vs 114 SURAH / HAFIZI CATALOG ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#061710] border border-emerald-900/60 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-emerald-900/40">
          <button
            type="button"
            onClick={() => setActiveTab("thematic")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "thematic"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/80 ring-1 ring-emerald-400/50"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>বিষয় ও শব্দ এআই সার্চ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/80 ring-1 ring-emerald-400/50"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>পবিত্র কুরআন — ১১৪ সূরা ও পারা-পৃষ্ঠা</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-emerald-400/90 px-3 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/40 hidden sm:inline-block">
          {activeTab === "thematic"
            ? "সব বিষয়ের আয়াত ও বিশুদ্ধ ক্বারী তিলাওয়াত"
            : "১১৪ সূরা ও ১৫ লাইনের হাফেজী কুরআন"}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: THEMATIC AI SEARCH & VERSE RESULTS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "thematic" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Search Card with Input & Thematic Chips */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#091a14] via-[#0b241b] to-[#071610] border border-emerald-900/60 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xs">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>কুরআন বিষয়ভিত্তিক এআই সার্চ</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                      থিমেটিক সার্চ
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    আরবি হরফ, বাংলা অর্থ বা ইংরেজি যেকোনো শব্দে সম্পূর্ণ কুরআনের সকল আয়াত খুঁজুন।
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                {totalMatches > results.length
                  ? `মোট ${totalMatches} টির মধ্যে শীর্ষ ${results.length} টি প্রদর্শিত`
                  : `মোট ${results.length} টি আয়াত প্রদর্শিত`}
              </span>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(query);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/80" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="আরবি, বাংলা বা ইংরেজিতে লিখুন: যেমন- يُنفِقُونَ, সালাত, spend, জান্নাত, সবর..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-emerald-900/80 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/70 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>খুঁজুন</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Natural Language Hafizi Jump Notification (If user types para/page) */}
            {parsedThematicHafizi && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>
                    হাফেজী কুরআন পৃষ্ঠা সনাক্ত হয়েছে: <strong>পারা {parsedThematicHafizi.para}</strong> • <strong>পৃষ্ঠা {parsedThematicHafizi.paraPage}</strong> (মুসহাফ পৃ: {parsedThematicHafizi.globalPage})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToHafizi(parsedThematicHafizi.para, parsedThematicHafizi.paraPage)}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>সরাসরি যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ── THEMATIC TOPIC CHIPS ── */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span>জনপ্রিয় বিষয়সমূহ (ক্লিক করলেই সরাসরি আয়াত আসবে):</span>
              </span>

              <div className="flex flex-wrap gap-2 pt-1 select-none">
                {POPULAR_THEMATIC_TOPICS.map((topic) => {
                  const isActive = activeTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicClick(topic)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 shadow-xs ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-md shadow-emerald-900/50 ring-2 ring-emerald-400/40"
                          : "bg-[#05140d]/90 hover:bg-[#072418] border-emerald-900/70 text-slate-200 hover:border-emerald-500 hover:text-white"
                      }`}
                    >
                      <span>{topic.icon}</span>
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── LIVE AYAH SEARCH RESULTS ── */}
          <div className="space-y-3.5">
            {loading && (
              <div className="text-center py-12 rounded-3xl bg-[#091a14]/60 border border-emerald-900/40 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <p className="text-xs text-emerald-300 font-bold">কুরআনুল কারীম থেকে প্রাসঙ্গিক আয়াতসমূহ অনুসন্ধান করা হচ্ছে...</p>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-center py-12 rounded-3xl bg-[#091a14]/60 border border-emerald-900/40 p-6 space-y-2">
                <BookOpen className="w-10 h-10 text-emerald-600/60 mx-auto" />
                <h4 className="text-sm font-bold text-white">কোনো আয়াত খুঁজে পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  উপরে দেওয়া বিষয়ের বাটনগুলোতে ক্লিক করে অথবা অন্য শব্দ লিখে অনুসন্ধান করুন।
                </p>
              </div>
            )}

            {!loading &&
              results.map((verse, idx) => {
                const verseKey = `${verse.surah}-${verse.ayah}-${idx}`;
                const isPlaying = playingKey === verseKey;
                const loc = getHafiziLocationForAyah(verse.surah, verse.ayah);

                return (
                  <div
                    key={verseKey}
                    className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#091a14] via-[#071912] to-[#04120c] border border-emerald-900/70 hover:border-emerald-600/80 transition-all shadow-xl space-y-3.5 group"
                  >
                    {/* Header: Surah Name, Ayah number & Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/50 pb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                            {verse.surahNameBn ? `সূরা ${verse.surahNameBn}` : `সূরা নং ${verse.surah}`}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            (সূরা {verse.surah}, আয়াত {verse.ayah})
                          </span>
                          {/* হাফেজী পারা ও পৃষ্ঠা নম্বর */}
                          {loc && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-700/60 text-[11px] font-bold text-emerald-300 shadow-xs"
                              title={`হাফেজী পারা ${loc.para}, পৃষ্ঠা ${loc.paraPage} (কুরআনের মোট পৃষ্ঠা: ${loc.globalPage})`}
                            >
                              <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>পারা {loc.para}, পৃষ্ঠা {loc.paraPage}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Authentic Qari Audio Recitation Button */}
                        <button
                          type="button"
                          onClick={() => playVerseAudio(verse, verseKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                            isPlaying
                              ? "bg-amber-500 border-amber-300 text-slate-950 shadow-md animate-pulse font-extrabold"
                              : "bg-[#05140d] border-emerald-900 hover:border-emerald-600 text-emerald-300 hover:bg-emerald-950"
                          }`}
                          title="খাঁটি ক্বারীর বিশুদ্ধ সুরে তিলাওয়াত শুনুন"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-bounce" : ""}`} />
                          <span>{isPlaying ? "বাজছে (থামুন)" : "শুনুন"}</span>
                        </button>

                        {/* View in Quran Reader Button */}
                        {onSelectAyah && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectAyah({
                                surah: verse.surah,
                                ayah: verse.ayah,
                                page: loc?.globalPage,
                                para: loc?.para,
                                paraPage: loc?.paraPage,
                              })
                            }
                            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            title="কুরআন রিডারে সম্পূর্ণ পৃষ্ঠা ও তাজবীদসহ পড়ুন"
                          >
                            <span>কুরআনে পড়ুন</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arabic Verse Text with Search Term Highlight */}
                    <div className="text-right py-1">
                      <p
                        dir="rtl"
                        className="font-amiri text-2xl sm:text-3xl font-extrabold text-amber-100/95 leading-[2.1] tracking-wide drop-shadow-xs"
                      >
                        <HighlightedArabic text={verse.arabic} query={activeSearchTerm} />
                      </p>
                    </div>

                    {/* Bangla Translation with Search Term Highlight & Audio Button */}
                    <div className="pt-2.5 border-t border-emerald-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-[11px] font-bold text-emerald-400 shrink-0 mt-0.5">অনুবাদ:</span>
                        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans flex flex-wrap items-center">
                          {playingBanglaId === `bn-${verseKey}` && !isBanglaLoading ? (
                            (verse.bangla || "").trim().split(/\s+/).filter(Boolean).map((word, bIdx) => {
                              const isThisWordActive = activeBanglaWordIndex === bIdx;
                              return (
                                <span
                                  key={bIdx}
                                  className={`inline-block transition-all duration-150 px-1 py-0.5 mx-0.5 rounded-lg ${
                                    isThisWordActive
                                      ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-200 scale-105"
                                      : "text-emerald-200 font-medium"
                                  }`}
                                >
                                  {word}
                                </span>
                              );
                            })
                          ) : (
                            <HighlightedTranslation
                              text={verse.bangla}
                              query={activeSearchTerm}
                              matchedWord={verse.matchedWord}
                            />
                          )}
                        </div>
                      </div>

                      {/* বাংলা অনুবাদ শোনার বাটন (মাইক / স্পিকার) */}
                      {verse.bangla && (() => {
                        const isThisBanglaPlaying = playingBanglaId === `bn-${verseKey}` && !isBanglaLoading;
                        const isThisBanglaLoading = playingBanglaId === `bn-${verseKey}` && isBanglaLoading;

                        return (
                          <button
                            type="button"
                            onClick={() => handleToggleBangla(verse.bangla, `bn-${verseKey}`)}
                            className={`shrink-0 self-end sm:self-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                              isThisBanglaPlaying
                                ? "bg-amber-500 border-amber-300 text-slate-950 shadow-md animate-pulse font-extrabold"
                                : isThisBanglaLoading
                                ? "bg-emerald-950/80 border-emerald-700 text-amber-300 animate-pulse"
                                : "bg-[#05140d] border-emerald-900/80 hover:border-emerald-600 text-emerald-300 hover:bg-emerald-950/80"
                            }`}
                            title="বাংলা অর্থ ও অনুবাদ অডিও শুনুন"
                          >
                            {isThisBanglaLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                            ) : (
                              <Volume2 className={`w-3.5 h-3.5 ${isThisBanglaPlaying ? "animate-bounce" : ""}`} />
                            )}
                            <span className="text-[11px]">
                              {isThisBanglaPlaying
                                ? "অনুবাদ বাজছে (থামুন)"
                                : isThisBanglaLoading
                                ? "লোড হচ্ছে..."
                                : "অনুবাদ শুনুন"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>

                    {/* Context Note (If Available) */}
                    {verse.contextExplanation && (
                      <div className="text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-900/60 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          <strong>প্রেক্ষিত:</strong> {verse.contextExplanation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: 114 SURAH CATALOG & HAFIZI PARA-PAGE NAVIGATOR ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "catalog" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#061710] via-[#081e15] to-[#04100c] border border-emerald-900/70 shadow-2xl space-y-5 animate-fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>পবিত্র কুরআন শরীফ — ১১৪ সূরা ক্যাটালগ</span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  সরাসরি যেকোনো সূরা, ৩০ পারা বা ১৫ লাইনের হাফেজী পৃষ্ঠায় প্রবেশ করুন।
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
              মোট ১১৪টি সূরা • ৩০ পারা • ৬১০ পৃষ্ঠা
            </span>
          </div>

          {/* Search Box: Surah Name or Para-Page */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/80" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="সূরার নাম বা পারা-পৃষ্ঠা (যেমন: পারা ৫ পৃষ্ঠা ১২, 36, ফাতিহা)..."
              className="w-full pl-10 pr-4 py-3 bg-black/60 border border-emerald-900/80 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 select-none">
            <button
              type="button"
              onClick={() => setCatalogFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                catalogFilter === "all"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60"
                  : "bg-[#061710] border-emerald-900/60 text-slate-300 hover:text-white"
              }`}
            >
              সব সূরা (১১৪)
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilter("hafizi")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                catalogFilter === "hafizi"
                  ? "bg-amber-600 border-amber-400 text-slate-950 font-extrabold shadow-md"
                  : "bg-[#061710] border-amber-900/40 text-amber-300 hover:text-amber-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>হাফেজী পারা ও পৃষ্ঠা</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilter("popular")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                catalogFilter === "popular"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60"
                  : "bg-[#061710] border-emerald-900/60 text-slate-300 hover:text-white"
              }`}
            >
              জনপ্রিয় সূরা
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilter("meccan")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                catalogFilter === "meccan"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60"
                  : "bg-[#061710] border-emerald-900/60 text-slate-300 hover:text-white"
              }`}
            >
              মাক্কী
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilter("medinan")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                catalogFilter === "medinan"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60"
                  : "bg-[#061710] border-emerald-900/60 text-slate-300 hover:text-white"
              }`}
            >
              মাদানী
            </button>
          </div>

          {/* Quick Automatic Natural Language Hafizi Jump Notification */}
          {parsedCatalogHafizi && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-2 border-amber-400/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
              <div className="flex items-center gap-2.5 text-amber-200">
                <Compass className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-extrabold text-white text-sm">
                    হাফেজী কুরআন অবস্থান সনাক্ত হয়েছে: পারা {parsedCatalogHafizi.para} • পৃষ্ঠা {parsedCatalogHafizi.paraPage}
                  </p>
                  <p className="text-amber-300/80 text-[11px]">
                    গ্লোবাল মুসহাফ পৃষ্ঠা: {parsedCatalogHafizi.globalPage} • সংশ্লিষ্ট সূরা নং: {parsedCatalogHafizi.surah}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleJumpToHafizi(parsedCatalogHafizi.para, parsedCatalogHafizi.paraPage)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <span>সরাসরি যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── 📖 HAFIZI QURAN 15-LINE SELECTOR SECTION ── */}
          {(catalogFilter === "hafizi" || !catalogSearch) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#03110b] border border-amber-500/40 shadow-inner space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>হাফেজী কুরআন (১৫ লাইন):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Para Selector */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">পারা:</label>
                  <select
                    value={selectedHafiziPara}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setSelectedHafiziPara(p);
                      setSelectedHafiziPage(1);
                    }}
                    className="w-full px-3 py-2 bg-black/70 border border-emerald-900/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {HAFIZI_PARAS.map((p) => (
                      <option key={p.juz} value={p.juz}>
                        {p.juz} ({p.nameBn} • {p.totalPages} পৃ:)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Page Selector */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">পৃষ্ঠা:</label>
                  <select
                    value={selectedHafiziPage}
                    onChange={(e) => setSelectedHafiziPage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/70 border border-emerald-900/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {Array.from({ length: currentParaTotalPages }, (_, i) => i + 1).map((pg) => {
                      const paraInfo = HAFIZI_PARAS.find((p) => p.juz === selectedHafiziPara);
                      const globalPg = (paraInfo?.startPage || 1) + pg - 1;
                      return (
                        <option key={pg} value={pg}>
                          পৃ: {pg} ({globalPg})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Jump Button */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleJumpToHafizi(selectedHafiziPara, selectedHafiziPage)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                  >
                    <span>যান</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 114 SURAHS LIST CARDS ── */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
              <span>সূরা তালিকা ({filteredSurahs.length} টি)</span>
              <span>ক্লিক করে সরাসরি পড়ুন</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.id}
                  onClick={() => {
                    if (onSelectAyah) {
                      onSelectAyah({ surah: surah.id, ayah: 1, page: surah.page });
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#081e14]/80 hover:bg-[#0c2a1c] border border-emerald-900/70 hover:border-emerald-500 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm active:scale-98"
                >
                  {/* Left: Number + Bangla Name & Subtitle */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#05140d] border border-emerald-700/50 text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {surah.id}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                        {surah.nameBn}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {surah.nameEn} • {surah.meaningBn} • {surah.versesCount} আয়াত
                      </p>
                    </div>
                  </div>

                  {/* Right: Arabic calligraphy & Badge */}
                  <div className="text-right shrink-0">
                    <p className="font-amiri text-lg font-bold text-emerald-300 leading-tight">
                      {surah.nameAr}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold">
                      {surah.typeBn}
                    </span>
                  </div>
                </div>
              ))}

              {filteredSurahs.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  কোনো সূরা পাওয়া যায়নি। সঠিক নাম বা নম্বর লিখে খুঁজুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
