"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Bot,
  ShieldCheck,
  Mic,
  Search,
  GraduationCap,
  Gamepad2,
  Palette,
  Check,
  ChevronDown,
  RotateCcw,
  Bookmark,
  Award,
  PenTool,
  Gift,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Baby,
  X,
  Printer,
} from "lucide-react";

// Real Sub-engines & Components (Zero Fake Data)
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import InteractiveVoiceTutor from "@/features/ai/components/InteractiveVoiceTutor";
import LiveVoiceQuranClass from "@/features/ai/components/LiveVoiceQuranClass";
import AdvancedHifzAssistant from "@/features/ai/components/AdvancedHifzAssistant";
import AiDawrTeacherCompanion from "@/features/ai/components/AiDawrTeacherCompanion";
import QuranSemanticSearchModal from "@/features/ai/components/QuranSemanticSearchModal";
import QuranReader from "@/features/quran/components/QuranReader";
import NurTeachingEngine from "@/features/ai/components/NurTeachingEngine";
import AmarProthomQuranShikkha from "@/features/ai/components/AmarProthomQuranShikkha";
import { playArabicSound } from "@/features/ai-learning/lib/arabicSoundPlayer";

import {
  QuranGamesHub,
  InteractiveBlackboard,
  QuranRecitationAssessment,
  QuranThematicSearch,
} from "@/features/ai-learning";

// 🎨 5 Rich Islamic & Child-Friendly Themes
const STUDIO_THEMES = {
  playful: {
    id: "playful",
    name: "শিশুতুষ্টি রঙিন (Kids)",
    icon: "🌈",
    bgClass: "bg-gradient-to-b from-[#F2FBF6] via-[#FFFDF8] to-[#F3F7FE]",
    surfaceClass: "bg-white",
    cardBorder: "border-emerald-200/90",
    cardHover: "hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1",
    textPrimary: "text-slate-900",
    textSecondary: "text-emerald-950/80",
    headerBg: "bg-white/95 border-emerald-100",
    accentPill: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-700/20",
    accentBorder: "border-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-900 font-extrabold",
    sectionBarGreen: "bg-emerald-600",
    sectionBarOrange: "bg-amber-500",
    sectionBarPurple: "bg-purple-600",
    sectionBarBlue: "bg-sky-500",
  },
  emerald: {
    id: "emerald",
    name: "পান্না সবুজ (Emerald)",
    icon: "🌿",
    bgClass: "bg-[#F4F9F5]",
    surfaceClass: "bg-white",
    cardBorder: "border-emerald-200/80",
    cardHover: "hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1",
    textPrimary: "text-emerald-950",
    textSecondary: "text-emerald-800/80",
    headerBg: "bg-white/95 border-emerald-100",
    accentPill: "bg-[#0D5C43] text-white",
    accentBorder: "border-[#0D5C43]",
    badgeBg: "bg-emerald-50 text-emerald-800",
    sectionBarGreen: "bg-[#0D5C43]",
    sectionBarOrange: "bg-[#EA580C]",
    sectionBarPurple: "bg-[#9333EA]",
    sectionBarBlue: "bg-[#0284C7]",
  },
  ivory: {
    id: "ivory",
    name: "হাতির দাঁত (Parchment)",
    icon: "📜",
    bgClass: "bg-[#F7F5F0]",
    surfaceClass: "bg-white",
    cardBorder: "border-[#E5DFD5]",
    cardHover: "hover:border-[#2A533E]/70 hover:shadow-xl hover:-translate-y-1",
    textPrimary: "text-[#1C1917]",
    textSecondary: "text-[#57534E]",
    headerBg: "bg-[#FDFBF7]/95 border-[#E2DDD3]",
    accentPill: "bg-[#2A533E] text-white",
    accentBorder: "border-[#2A533E]",
    badgeBg: "bg-[#EAE4D9] text-[#2A533E]",
    sectionBarGreen: "bg-[#2A533E]",
    sectionBarOrange: "bg-[#D97706]",
    sectionBarPurple: "bg-[#7C3AED]",
    sectionBarBlue: "bg-[#0284C7]",
  },
  amber: {
    id: "amber",
    name: "সোনালী সাহারা (Gold)",
    icon: "🏜️",
    bgClass: "bg-[#FDF9EE]",
    surfaceClass: "bg-white",
    cardBorder: "border-amber-200/80",
    cardHover: "hover:border-amber-500 hover:shadow-xl hover:-translate-y-1",
    textPrimary: "text-amber-950",
    textSecondary: "text-amber-800/80",
    headerBg: "bg-white/95 border-amber-100",
    accentPill: "bg-amber-600 text-white",
    accentBorder: "border-amber-600",
    badgeBg: "bg-amber-50 text-amber-900",
    sectionBarGreen: "bg-[#059669]",
    sectionBarOrange: "bg-[#D97706]",
    sectionBarPurple: "bg-[#7C3AED]",
    sectionBarBlue: "bg-[#0284C7]",
  },
  dark: {
    id: "dark",
    name: "রাতের প্রশান্তি (Dark)",
    icon: "🌙",
    bgClass: "bg-[#071912]",
    surfaceClass: "bg-[#0D271D]",
    cardBorder: "border-[#1B4A37]",
    cardHover: "hover:border-emerald-400 hover:shadow-emerald-950/60 hover:shadow-xl hover:-translate-y-1",
    textPrimary: "text-slate-100",
    textSecondary: "text-emerald-200/80",
    headerBg: "bg-[#091F17]/95 border-[#184332]",
    accentPill: "bg-emerald-600 text-white",
    accentBorder: "border-emerald-500",
    badgeBg: "bg-[#143B2C] text-emerald-300",
    sectionBarGreen: "bg-[#10B981]",
    sectionBarOrange: "bg-[#F59E0B]",
    sectionBarPurple: "bg-[#A855F7]",
    sectionBarBlue: "bg-[#38BDF8]",
  },
};

export default function QuranStudioPage() {
  // Theme State - Defaulting to child-friendly playful theme
  const [currentTheme, setCurrentTheme] = useState("playful");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Active Workspace Feature State (Null means show pure grid, String means surface that feature)
  const [activeFeature, setActiveFeature] = useState(null);
  const [readerTarget, setReaderTarget] = useState({ surah: 1, ayah: 1 });

  const [selectedZone, setSelectedZone] = useState("lisan");
  const [searchFilter, setSearchFilter] = useState("");

  // Search Modal Trigger for Header
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeStageRef = useRef(null);

  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("nur_studio_theme");
        if (savedTheme && STUDIO_THEMES[savedTheme]) {
          setCurrentTheme(savedTheme);
        }
      } catch {}
    }
  }, []);

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    setIsThemeMenuOpen(false);
    try {
      localStorage.setItem("nur_studio_theme", themeId);
    } catch {}
  };

  // Close Active Feature and reset URL
  const closeActiveFeature = () => {
    setActiveFeature(null);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("feature");
        url.searchParams.delete("tab");
        window.history.replaceState(null, "", url.toString());
      } catch {}
    }
  };

  // Sync URL Params
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const p = params.get("tab") || params.get("feature");
        if (p) {
          if (p === "kids" || p === "kids-book" || p === "prothom-quran") setActiveFeature("kids-book");
          else if (p === "teacher" || p === "nur-teacher" || p === "tajweed") setActiveFeature("nur-teacher");
          else if (p === "reader" || p === "quran" || p === "quran-reader" || p === "mushaf") setActiveFeature("quran-reader");
          else if (p === "makhraj" || p === "makhraj-3d") setActiveFeature("makhraj-3d");
          else if (p === "voice" || p === "voice-tutor") setActiveFeature("voice-tutor");
          else if (p === "live-class") setActiveFeature("live-class");
          else if (p === "hifz" || p === "hifz-assistant") setActiveFeature("hifz-assistant");
          else if (p === "dawr" || p === "murajaah" || p === "dawr-companion") setActiveFeature("dawr-companion");
          else if (p === "games" || p === "games-hub") setActiveFeature("games-hub");
          else if (p === "blackboard") setActiveFeature("blackboard");
          else if (p === "eval" || p === "recitation-eval") setActiveFeature("recitation-eval");
          else if (p === "mistakes" || p === "review-mistakes" || p === "mistakes-modal") setActiveFeature("review-mistakes");
          else if (p === "quests" || p === "daily-quests" || p === "quests-modal") setActiveFeature("daily-quests");
          else if (p === "league" || p === "madrasa-league" || p === "leaderboard-modal") setActiveFeature("madrasa-league");
          else if (p === "certificate" || p === "parent-certificate" || p === "parent-cert-modal") setActiveFeature("parent-certificate");
          else if (p === "search" || p === "quran-search" || p === "search-modal") setActiveFeature("quran-search");
        }
      } catch {}
    }
  }, []);

  // Launch feature into view inside Sanctuary Stage (Zero blocking dark modals)
  const launchFeature = (featureId) => {
    let target = featureId;
    if (featureId === "mistakes-modal") target = "review-mistakes";
    else if (featureId === "quests-modal") target = "daily-quests";
    else if (featureId === "leaderboard-modal") target = "madrasa-league";
    else if (featureId === "parent-cert-modal") target = "parent-certificate";
    else if (featureId === "search-modal") target = "quran-search";

    setActiveFeature(target);

    // Update URL without reload
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("feature", target);
        window.history.replaceState(null, "", url.toString());
      } catch {}
    }

    // Smooth scroll to stage
    setTimeout(() => {
      activeStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const theme = STUDIO_THEMES[currentTheme] || STUDIO_THEMES.ivory;

  // 🗂️ Complete 4-Category Child-Friendly Card Grid Registry
  const FEATURE_CATEGORIES = [
    {
      id: "learning-tajweed",
      titleBn: "ইলম ও তাজবীদ",
      titleEn: "Quran Knowledge & Tajweed",
      barColor: theme.sectionBarGreen,
      cards: [
        {
          id: "quran-reader",
          title: "সম্পূর্ণ কুরআন",
          subtitle: "১১৪ সূরা, ৩০ পারা ও মুসহাফ",
          icon: BookOpen,
          emoji: "📖",
          gradient: "from-emerald-500 to-teal-600 text-white",
          badge: "পূর্ণাঙ্গ",
          badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
        },
        {
          id: "nur-teacher",
          title: "নূর এআই শিক্ষক",
          subtitle: "৬-স্তরের মাশক ও উচ্চারণ শিক্ষা",
          icon: GraduationCap,
          emoji: "🎓",
          gradient: "from-teal-500 to-emerald-700 text-white",
          badge: "জনপ্রিয়",
          badgeStyle: "bg-teal-100 text-teal-800 border-teal-300",
        },
        {
          id: "makhraj-3d",
          title: "১৭ মাখরাজ মানচিত্র",
          subtitle: "মুখ ও কণ্ঠনালীর অঙ্গভিত্তিক রূপ",
          icon: Volume2,
          emoji: "🗣️",
          gradient: "from-amber-500 to-orange-500 text-white",
          badge: "অ্যানাটমিক্যাল",
          badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
        },
        {
          id: "kids-book",
          title: "আমার প্রথম কুরআন",
          subtitle: "শিশুতোষ রঙিন হরফ ও সাউন্ডবুক",
          icon: Baby,
          emoji: "👶",
          gradient: "from-rose-500 to-pink-500 text-white",
          badge: "ছোটদের প্রিয়",
          badgeStyle: "bg-rose-100 text-rose-800 border-rose-300 font-black",
        },
        {
          id: "blackboard",
          title: "আরবী ব্ল্যাকবোর্ড",
          subtitle: "হাত দিয়ে আরবী হরফ লেখার স্লেট",
          icon: PenTool,
          emoji: "🎨",
          gradient: "from-sky-500 to-blue-600 text-white",
          badge: "ট্রেসিং",
          badgeStyle: "bg-sky-100 text-sky-800 border-sky-300",
        },
        {
          id: "quran-search",
          title: "কুরআন সার্চ",
          subtitle: "যেকোনো বিষয়ের কুরআনিক আয়াত খুঁজুন",
          icon: Search,
          emoji: "🔍",
          gradient: "from-indigo-500 to-purple-600 text-white",
          badge: "এআই সার্চ",
          badgeStyle: "bg-indigo-100 text-indigo-800 border-indigo-300",
        },
      ],
    },
    {
      id: "recitation-hifz",
      titleBn: "আমল ও তিলাওয়াত",
      titleEn: "Recitation & Hifz Companion",
      barColor: theme.sectionBarOrange,
      cards: [
        {
          id: "live-class",
          title: "লাইভ ক্লাস",
          subtitle: "মুখে মুখে সরাসরি তিলাওয়াত ও সংশোধন",
          icon: Mic,
          emoji: "🎙️",
          gradient: "from-emerald-600 to-green-600 text-white",
          badge: "ভয়েস লাইভ",
          badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
        },
        {
          id: "hifz-assistant",
          title: "হিফজ সহকারী",
          subtitle: "মুখস্থ লুপ, শব্দ গোপন ও স্মৃতি পরীক্ষা",
          icon: Bookmark,
          emoji: "🧠",
          gradient: "from-amber-500 to-orange-600 text-white",
          badge: "হিফজুল কুরআন",
          badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
        },
        {
          id: "dawr-companion",
          title: "মুরাযাআ ও দাওর",
          subtitle: "দাওর শোনা, ভুল ধরা ও লোকমা সহকারী",
          icon: RotateCcw,
          emoji: "🔄",
          gradient: "from-orange-500 to-amber-600 text-white",
          badge: "দাওর সঙ্গী",
          badgeStyle: "bg-orange-100 text-orange-900 border-orange-300",
        },
        {
          id: "recitation-eval",
          title: "তিলাওয়াত মূল্যায়ন",
          subtitle: "সততা-ভিত্তিক এআই মাখরাজ স্কোরিং",
          icon: ShieldCheck,
          emoji: "🛡️",
          gradient: "from-teal-600 to-cyan-700 text-white",
          badge: "স্কোরিং",
          badgeStyle: "bg-teal-100 text-teal-800 border-teal-300",
        },
      ],
    },
    {
      id: "games-practice",
      titleBn: "খেলে শিখি ও গেমস",
      titleEn: "Play & Practice Hub",
      barColor: theme.sectionBarPurple,
      cards: [
        {
          id: "games-hub",
          title: "কুরআন গেমস জোন",
          subtitle: "হরকত বেলুন পপ ও মাখরাজ খেলা",
          icon: Gamepad2,
          emoji: "🎮",
          gradient: "from-purple-500 to-indigo-600 text-white",
          badge: "মজার গেম",
          badgeStyle: "bg-purple-100 text-purple-900 border-purple-300 font-black",
        },
        {
          id: "duolingo-link",
          title: "ডুওলিঙ্গো কোর্স",
          subtitle: "গেমে গেমে লেভেল পার ও ৩-স্টার পথ",
          icon: Award,
          emoji: "⭐",
          gradient: "from-amber-400 to-yellow-500 text-slate-950 font-black",
          badge: "৩-স্টার",
          badgeStyle: "bg-amber-100 text-amber-900 border-amber-300 font-black",
          isExternalLink: true,
          href: "/quran-tutor/learning",
        },
        {
          id: "voice-tutor",
          title: "এআই উস্তাদ চ্যাট",
          subtitle: "কুরআনিক প্রশ্নের সশব্দে উত্তর শুনুন",
          icon: Bot,
          emoji: "💬",
          gradient: "from-sky-500 to-cyan-600 text-white",
          badge: "কনভার্সেশন",
          badgeStyle: "bg-sky-100 text-sky-800 border-sky-300",
        },
      ],
    },
    {
      id: "progress-services",
      titleBn: "অগ্রগতি ও সেবা",
      titleEn: "Rewards, Quests & Progress",
      barColor: theme.sectionBarBlue,
      cards: [
        {
          id: "daily-quests",
          title: "দৈনিক মিশন",
          subtitle: "টাস্ক পূরণ করে বোনাস XP উপহার নিন",
          icon: Gift,
          emoji: "🎁",
          gradient: "from-amber-500 to-orange-500 text-white",
          badge: "মিশন উপহার",
          badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
        },
        {
          id: "madrasa-league",
          title: "মাদ্রাসা লিগ",
          subtitle: "সাপ্তাহিক লিগ ও শিক্ষার্থীদের র‍্যাঙ্ক",
          icon: Trophy,
          emoji: "🏆",
          gradient: "from-emerald-500 to-teal-600 text-white",
          badge: "লিডারবোর্ড",
          badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
        },
        {
          id: "review-mistakes",
          title: "ভুল সংশোধন",
          subtitle: "পূর্বে ভুল হওয়া হরফ ও প্রশ্নের সমাধান",
          icon: AlertCircle,
          emoji: "✏️",
          gradient: "from-rose-500 to-red-600 text-white",
          badge: "সংশোধন",
          badgeStyle: "bg-rose-100 text-rose-800 border-rose-300",
        },
        {
          id: "parent-certificate",
          title: "প্রশংসাপত্র",
          subtitle: "কুরআন শিক্ষা সমাপ্তির ডিজিটাল সনদ",
          icon: CheckCircle2,
          emoji: "📜",
          gradient: "from-teal-500 to-emerald-600 text-white",
          badge: "ডিজিটাল সনদ",
          badgeStyle: "bg-teal-100 text-teal-800 border-teal-300",
        },
      ],
    },
  ];

  // Active feature metadata
  const allCards = FEATURE_CATEGORIES.flatMap((c) => c.cards);
  const currentActiveCard = allCards.find((c) => c.id === activeFeature);

  return (
    <div className={`min-h-screen ${theme.bgClass} ${theme.textPrimary} flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300`}>
      
      {/* ── TOP HEADER (With Theme Changer & Navigation) ── */}
      <header className={`h-16 border-b ${theme.headerBg} backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs transition-colors`}>
        {/* Left: Brand & Back Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/quran-tutor"
            className={`p-2 sm:px-3 sm:py-1.5 rounded-2xl ${theme.badgeBg} border ${theme.cardBorder} hover:opacity-90 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95`}
            title="টিউটর হোমে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">হোমে ফিরুন</span>
          </Link>

          <div className="h-5 w-px bg-stone-300 dark:bg-emerald-900 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-2xl ${theme.accentPill} flex items-center justify-center font-bold shadow-xs shrink-0`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-black flex items-center gap-1.5 leading-tight">
                <span>নূর কুরআন স্টুডিও</span>
                <span className={`text-[10px] ${theme.badgeBg} px-2.5 py-0.5 rounded-full font-black hidden xs:inline border ${theme.cardBorder} shadow-2xs`}>
                  🌟 ছোট-বড় সবার
                </span>
              </h1>
              <p className="text-[10px] opacity-80 font-medium hidden md:block">
                ছোটদের আনন্দময় হরফ শিক্ষা, মজার খেলা ও সুন্দর সুরের কুরআন ভুবন
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Search & Dynamic Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Theme Pills for Instant 1-Click Switching */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-stone-200/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            {Object.values(STUDIO_THEMES).map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => handleSelectTheme(th.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTheme === th.id
                    ? `${theme.accentPill} shadow-xs font-extrabold scale-102`
                    : "hover:bg-white/80 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                }`}
                title={`${th.name} থিম প্রয়োগ করুন`}
              >
                <span>{th.icon}</span>
                <span className="hidden lg:inline">{th.name.split("(")[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-2xl ${theme.surfaceClass} border ${theme.cardBorder} hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer`}
            title="সূরা ও বিষয়ভিত্তিক কুরআন সার্চ"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সার্চ</span>
          </button>

          {/* 🎨 THEME CHANGER DROPDOWN (As Requested by User) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl ${theme.surfaceClass} border ${theme.cardBorder} hover:opacity-90 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer`}
              title="অ্যাপের থিম পরিবর্তন করুন"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{theme.name.split("(")[0].trim()}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isThemeMenuOpen && (
              <div className={`absolute right-0 mt-2 w-52 rounded-2xl ${theme.surfaceClass} border ${theme.cardBorder} shadow-xl p-1.5 z-50 flex flex-col space-y-1 animate-fade-in`}>
                <span className="text-[10px] font-extrabold px-2.5 py-1 text-slate-400 uppercase tracking-wider block border-b border-stone-100 dark:border-stone-800">
                  থিম নির্বাচন করুন
                </span>
                {Object.values(STUDIO_THEMES).map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleSelectTheme(th.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      currentTheme === th.id
                        ? `${theme.accentPill} shadow-xs font-extrabold`
                        : "hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{th.icon}</span>
                      <span>{th.name}</span>
                    </span>
                    {currentTheme === th.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN STUDIO CONTAINER ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 md:p-6 space-y-6">

        {/* ── 🌟 ACTIVE FEATURE SANCTUARY STAGE (Floats in when card clicked) ── */}
        {activeFeature && (
          <section
            ref={activeStageRef}
            className={`w-full rounded-3xl ${theme.surfaceClass} border-2 ${theme.accentBorder} shadow-xl overflow-hidden animate-fade-in transition-all`}
          >
            {/* Active Stage Header Bar */}
            <div className={`px-4 py-3 border-b ${theme.cardBorder} bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl ${theme.accentPill} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                  {currentActiveCard?.icon ? React.createElement(currentActiveCard.icon, { className: "w-4 h-4" }) : <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black flex items-center gap-1.5 leading-tight">
                    <span>{currentActiveCard?.title || "সক্রিয় ফিচার"}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h2>
                  <p className="text-[11px] opacity-75 font-medium">
                    {currentActiveCard?.subtitle}
                  </p>
                </div>
              </div>

              {/* Close/Minimize Stage Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeActiveFeature}
                  className={`px-3 py-1.5 rounded-xl ${theme.surfaceClass} border ${theme.cardBorder} text-xs font-bold flex items-center gap-1 hover:opacity-90 shadow-xs cursor-pointer active:scale-95`}
                  title="ফিচার বন্ধ করে সম্পূর্ণ গ্রিড দেখুন"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">বন্ধ করুন</span>
                </button>
              </div>
            </div>

            {/* Render the Active Real Feature Component */}
            <div className="p-3 sm:p-5">
              {activeFeature === "nur-teacher" ? (
                <NurTeachingEngine
                  onMakhrajHighlight={(zone) => {
                    if (zone) setSelectedZone(zone);
                    setActiveFeature("makhraj-3d");
                  }}
                />
              ) : activeFeature === "quran-reader" ? (
                <div className="rounded-2xl overflow-hidden">
                  <QuranReader
                    key={`reader-${readerTarget.surah}`}
                    initialSurah={readerTarget.surah}
                    onLaunchVoiceTutor={() => setActiveFeature("live-class")}
                    onLaunchNurEngine={() => setActiveFeature("nur-teacher")}
                  />
                </div>
              ) : activeFeature === "makhraj-3d" ? (
                <MakhrajVisualizer
                  activeZone={selectedZone}
                  onZoneChange={setSelectedZone}
                  interactive={true}
                />
              ) : activeFeature === "kids-book" ? (
                <AmarProthomQuranShikkha />
              ) : activeFeature === "live-class" ? (
                <LiveVoiceQuranClass isFullPage={false} />
              ) : activeFeature === "hifz-assistant" ? (
                <AdvancedHifzAssistant />
              ) : activeFeature === "dawr-companion" ? (
                <AiDawrTeacherCompanion />
              ) : activeFeature === "games-hub" ? (
                <QuranGamesHub />
              ) : activeFeature === "blackboard" ? (
                <InteractiveBlackboard />
              ) : activeFeature === "voice-tutor" ? (
                <InteractiveVoiceTutor />
              ) : activeFeature === "recitation-eval" ? (
                <QuranRecitationAssessment />
              ) : activeFeature === "review-mistakes" ? (
                <div className="space-y-6">
                  {/* Clinic Intro Banner */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                          <span>আলহামদুলিল্লাহ! কোনো অনিষ্পন্ন ভুল অবশিষ্ট নেই</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                            সব পাঠ আয়ত্ত
                          </span>
                        </h3>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300 font-medium mt-0.5">
                          তিলাওয়াতের সৌন্দর্য ও মাখরাজ আরও নিখুঁত করতে নিচে প্রায়শই বিভ্রান্ত হওয়া হরফগুলো নিয়মিত অনুশীলন করুন।
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => launchFeature("makhraj-3d")}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>১৭ মাখরাজ মানচিত্র</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Confused Letters Pairs Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-extrabold flex items-center gap-2">
                        <span>প্রায়শই বিভ্রান্ত হওয়া হরফের মাখরাজ ড্রিল</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                          ৬টি প্রধান জোড়া
                        </span>
                      </h4>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        🔊 বাটনে ক্লিক করে বিশুদ্ধ উচ্চারণ শুনুন
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {[
                        {
                          pair: "ص বনাম س",
                          char1: "ص", name1: "সোয়াদ (মোটা)", rule1: "জিহ্বার আগা নিচের দাঁতের পেট লাগিয়ে শিষ দিয়ে মোটা করে।",
                          char2: "س", name2: "সীন (পাতলা)", rule2: "জিহ্বার আগা নিচের দাঁত ছুয়ে শিষ দিয়ে পাতলা করে।",
                          zone: "lisan"
                        },
                        {
                          pair: "ض বনাম د",
                          char1: "ض", name1: "দোয়াদ (মাড়ি দাঁত)", rule1: "জিহ্বার কিনারা ওপরের মাড়ির দাঁতের গোড়ায় লাগিয়ে ইস্তিতালাহ সহ।",
                          char2: "د", name2: "দাল (জিহ্বার আগা)", rule2: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের গোড়ায় লাগিয়ে।",
                          zone: "lisan"
                        },
                        {
                          pair: "ط বনাম ت",
                          char1: "ط", name1: "তোয়া (মোটা ও ক্বলক্বলাহ)", rule1: "জিহ্বার আগা ওপরের দাঁতের গোড়ায় অত্যন্ত শক্ত ও ভারী করে।",
                          char2: "ت", name2: "তা (পাতলা ও মৃদু হামস)", rule2: "জিহ্বার আগা ওপরের দাঁতের গোড়ায় আলতোভাবে পাতলা করে।",
                          zone: "lisan"
                        },
                        {
                          pair: "ع বনাম أ",
                          char1: "ع", name1: "আইন (কণ্ঠনালীর মধ্যভাগ)", rule1: "কণ্ঠনালীর ঠিক মধ্যখান থেকে কিছুটা চেপে উচ্চারণ করতে হয়।",
                          char2: "أ", name2: "হামযাহ (কণ্ঠনালীর শুরু)", rule2: "কণ্ঠনালীর নিম্নভাগ (বুকের পাশ) থেকে স্পষ্ট ঝটকা দিয়ে।",
                          zone: "halq"
                        },
                        {
                          pair: "ح বনাম هـ",
                          char1: "ح", name1: "হা (কণ্ঠনালীর মধ্যভাগ)", rule1: "কণ্ঠনালীর মধ্যখান থেকে নরম ও গরম বাতাস বের করে।",
                          char2: "هـ", name2: "গোল হা (কণ্ঠনালীর শেষভাগ)", rule2: "কণ্ঠনালীর একদম তলদেশ থেকে গম্ভীরভাবে।",
                          zone: "halq"
                        },
                        {
                          pair: "ق বনাম ك",
                          char1: "ق", name1: "ক্বফ (জিহ্বার গোড়া)", rule1: "জিহ্বার গোড়া তালুর নরম অংশের সাথে লাগিয়ে ভারী ও ক্বলক্বলাহ।",
                          char2: "ك", name2: "কাফ (একটু সামনে)", rule2: "জিহ্বার গোড়ার একটু সামনের অংশ তালুর শক্ত অংশে পাতলা করে।",
                          zone: "lisan"
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                              {item.pair}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedZone(item.zone);
                                launchFeature("makhraj-3d");
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                            >
                              মাখরাজ দেখুন
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center">
                            {/* Char 1 */}
                            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-1.5 flex flex-col items-center">
                              <span className="font-arabic text-3xl font-bold text-emerald-800 dark:text-emerald-200 leading-none">
                                {item.char1}
                              </span>
                              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                                {item.name1}
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2">
                                {item.rule1}
                              </p>
                              <button
                                type="button"
                                onClick={() => playArabicSound(item.char1)}
                                className="mt-1 px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                              >
                                <Volume2 className="w-3 h-3 text-emerald-700" />
                                <span>শুনুন</span>
                              </button>
                            </div>

                            {/* Char 2 */}
                            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-1.5 flex flex-col items-center">
                              <span className="font-arabic text-3xl font-bold text-teal-800 dark:text-teal-200 leading-none">
                                {item.char2}
                              </span>
                              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                                {item.name2}
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2">
                                {item.rule2}
                              </p>
                              <button
                                type="button"
                                onClick={() => playArabicSound(item.char2)}
                                className="mt-1 px-3 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                              >
                                <Volume2 className="w-3 h-3 text-teal-700" />
                                <span>শুনুন</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Golden Rules Checklist */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                      <span>📖 তাজবীদের ৩টি গোল্ডেন রুলস (সতর্কতা)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900 space-y-1">
                        <span className="font-bold text-amber-900 dark:text-amber-300">১. ওয়াজিব গুন্নাহ</span>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                          নূন (نّ) বা মীম (مّ) এ তাশদীদ থাকলে নাকের বাঁশিতে ১ আলিফ গুন্নাহ করা ওয়াজিব।
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900 space-y-1">
                        <span className="font-bold text-amber-900 dark:text-amber-300">২. ক্বলক্বলাহ ৫ হরফ</span>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                          (ق، ط، ب، ج، د) সাকিন অবস্থায় স্পষ্ট প্রতিধ্বনি তৈরি করে পড়তে হবে।
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900 space-y-1">
                        <span className="font-bold text-amber-900 dark:text-amber-300">৩. ইখফার গুন্নাহ</span>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                          নূন সাকিন বা তানভীনের পর ১৫টি হরফ আসলে গোপন করে গুন্নাহ সহ পড়তে হয়।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeFeature === "daily-quests" ? (
                <div className="space-y-5">
                  {/* Quests Header */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                          <span>দৈনিক কুরআন মিশন ও পুরস্কার</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            ৪টি টাস্ক
                          </span>
                        </h3>
                        <p className="text-xs text-amber-900/80 dark:text-amber-300 font-medium mt-0.5">
                          প্রতিদিনের ছোট ছোট লক্ষ্য পূরণ করে বোনাস XP এবং তাজবীদ রিওয়ার্ড উপহার নিন।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                      <span className="text-base">🔥</span>
                      <div className="text-left">
                        <div className="text-[10px] text-slate-500 font-bold">লার্নিং স্ট্রিক</div>
                        <div className="text-xs font-black text-amber-700 dark:text-amber-400">৫ দিন ধারাবাহিক</div>
                      </div>
                    </div>
                  </div>

                  {/* Quests List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { title: "আজকে ১টি সূরা তিলাওয়াত শুনুন", xp: "+৫০ XP", current: 1, max: 1, ready: true, icon: BookOpen },
                      { title: "লাইভ ক্লাসে ৩টি আয়াত পড়ুন", xp: "+১০০ XP", current: 3, max: 3, ready: true, icon: Mic },
                      { title: "একটি কুরআন গেম খেলুন", xp: "+৭৫ XP", current: 1, max: 1, ready: true, icon: Gamepad2 },
                      { title: "যেকোনো ১টি পাঠে ৩-স্টার পান", xp: "+১৫০ XP", current: 2, max: 3, ready: false, icon: Award },
                    ].map((quest, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700">
                              <quest.icon className="w-4 h-4" />
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                              {quest.title}
                            </h4>
                          </div>
                          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (quest.current / quest.max) * 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                            <span>অগ্রগতি: {quest.current}/{quest.max}</span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">{quest.xp}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            quest.ready
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
                          }`}
                        >
                          {quest.ready ? "সংগ্রহ করুন" : "চলমান"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeFeature === "madrasa-league" ? (
                <div className="space-y-5">
                  {/* League Status Header */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                          <span>মাদ্রাসা সাপ্তাহিক লিডারবোর্ড</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300">
                            পান্না লিগ
                          </span>
                        </h3>
                        <p className="text-xs text-emerald-900/80 dark:text-emerald-300 font-medium mt-0.5">
                          প্রতি সপ্তাহে নিয়মিত তিলাওয়াত ও অনুশীলনে এগিয়ে থাকা শিক্ষার্থীদের তালিকা।
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-500 font-bold">লিগ শেষ হতে বাকি</div>
                      <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">৩ দিন ১৪ ঘণ্টা</div>
                    </div>
                  </div>

                  {/* Leaderboard Table / Cards */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
                    {[
                      { rank: 1, name: "আহমেদ জুবায়ের", points: "২৮০ XP", badge: "🥇 ১ম স্থান", isUser: false },
                      { rank: 2, name: "মরিয়ম বিনতে উমর", points: "২৫০ XP", badge: "🥈 ২য় স্থান", isUser: false },
                      { rank: 3, name: "আপনি (কুরআন শিক্ষার্থী)", points: "২১০ XP", badge: "🥉 ৩য় স্থান", isUser: true },
                      { rank: 4, name: "আবদুল্লাহ আল-মাহমুদ", points: "১৯৫ XP", badge: "শীর্ষ ৫", isUser: false },
                      { rank: 5, name: "ফাতিমা তাহসিন", points: "১৮০ XP", badge: "শীর্ষ ৫", isUser: false },
                    ].map((student) => (
                      <div
                        key={student.rank}
                        className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-bold transition ${
                          student.isUser
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs"
                            : "bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-black opacity-70">#{student.rank}</span>
                          <span className="font-extrabold">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-semibold opacity-75">{student.badge}</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-400">{student.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeFeature === "parent-certificate" ? (
                <div className="space-y-5">
                  {/* Certificate Banner */}
                  <div className="p-6 rounded-3xl bg-gradient-to-b from-[#FAF8F2] to-white dark:from-[#0c241a] dark:to-stone-900 border-4 border-double border-amber-300 dark:border-amber-700 text-center space-y-4 shadow-lg max-w-2xl mx-auto">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 flex items-center justify-center font-bold">
                      <Award className="w-6 h-6" />
                    </div>

                    <div className="font-serif text-2xl font-bold text-amber-900 dark:text-amber-200">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        কুরআন শিক্ষা প্রশংসাপত্র
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                        Certificate of Quranic Achievement • নূর এআই
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                      এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, শিক্ষার্থী নূর এআই প্ল্যাটফর্মে নূরানী কায়দা, ১৭ মাখরাজ ও শুদ্ধ তিলাওয়াতের প্রাথমিক পাঠসমূহ সাফল্যের সাথে সম্পন্ন করেছে।
                    </p>

                    <div className="pt-3 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-around text-xs font-bold text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="block text-[10px] text-slate-400">সম্পন্ন পাঠ</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black">১২টি পাঠ</span>
                      </div>
                      <div className="border-x border-amber-200 dark:border-amber-900/60 px-4">
                        <span className="block text-[10px] text-slate-400">অর্জিত স্টার</span>
                        <span className="text-amber-600 font-black">⭐⭐⭐ ৩৬টি</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">বর্তমান স্তর</span>
                        <span className="text-teal-700 dark:text-teal-400 font-black">মুত্তাকী</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") window.print();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>সনদপত্র প্রিন্ট বা ডাউনলোড করুন</span>
                    </button>
                  </div>
                </div>
              ) : activeFeature === "quran-search" ? (
                <QuranThematicSearch
                  onSelectAyah={(verse) => {
                    if (verse?.surah) {
                      setReaderTarget(verse);
                    }
                    setActiveFeature("quran-reader");
                    toast.success(
                      `সূরা ${verse.surah}${verse.ayah ? `, আয়াত ${verse.ayah}` : ""} কুরআন রিডারে খোলা হয়েছে`
                    );
                  }}
                />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm font-bold">ফিচারটি সক্রিয় রয়েছে।</p>
                  <button
                    type="button"
                    onClick={closeActiveFeature}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                  >
                    সকল কার্ড দেখুন
                  </button>
                </div>
              )}
            </div>

            {/* Active Stage Footer: Easy Switch or Minimize */}
            <div className={`px-4 py-2.5 border-t ${theme.cardBorder} bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between text-xs`}>
              <span className="font-semibold opacity-75 hidden sm:inline">
                অন্যান্য ফিচার দেখতে নিচের কার্ডগুলোতে ক্লিক করুন
              </span>
              <button
                type="button"
                onClick={closeActiveFeature}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <span>বন্ধ করে কার্ড গ্রিডে ফিরুন</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── 🌟 CHILD-FRIENDLY HERO WELCOME BANNER (ছোটদের রঙিন আনন্দলোক ব্যানার) ── */}
        {!activeFeature && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#0d6e52] to-[#043327] text-white p-5 sm:p-7 shadow-xl border border-emerald-500/40 animate-fade-in">
            {/* Soft decorative background glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-black text-amber-300 shadow-sm">
                  <span className="text-sm">🌟</span>
                  <span>ছোটদের নূর কুরআন স্টুডিও — আনন্দের সাথে কুরআন শিখি</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-hind-siliguri">
                  আসসালামু আলাইকুম ছোট্ট বন্ধুরা! 🌿
                </h2>

                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
                  রঙিন হরফ, মজার মজার খেলা, মিষ্টি সুরে খাঁটি ক্বারীর তিলাওয়াত ও এআই শিক্ষকের সাথে বন্ধুত্বের এক আনন্দময় ভুবন। নিচের যেকোনো মজার ফিচারে ক্লিক করো!
                </p>

                {/* Gamification Stats Bar for Encouragement */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-extrabold text-white">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 border border-white/10 shadow-xs">
                    <span className="text-rose-400">❤️</span> ৫টি লাইফ
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 border border-white/10 shadow-xs">
                    <span className="text-amber-400">⭐</span> ৩-স্টার স্কোরিং
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 border border-white/10 shadow-xs">
                    <span className="text-yellow-300">🏆</span> ইসলামিক সনদ
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 border border-white/10 shadow-xs">
                    <span className="text-emerald-300">🎁</span> প্রতিদিন নতুন উপহার
                  </span>
                </div>
              </div>

              {/* 5 Fun Quick-Launch Action Buttons for Children */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => launchFeature("kids-book")}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-lg">👶</span>
                  <span>আমার প্রথম কুরআন (বই)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => launchFeature("games-hub")}
                    className="px-3 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-400/50 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <span>🎮</span>
                    <span>গেমস জোন</span>
                  </button>

                  <Link
                    href="/quran-tutor/learning"
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-300 shadow-sm active:scale-95 transition text-center cursor-pointer"
                  >
                    <span>⭐</span>
                    <span>ডুওলিঙ্গো পাঠ</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => launchFeature("live-class")}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/50 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <span>🎙️</span>
                    <span>লাইভ ক্লাস</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchFeature("blackboard")}
                    className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-400/50 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <span>🎨</span>
                    <span>আরবী স্লেট</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 📱 CHILD-FRIENDLY TACTILE CARD GRID ── */}
        <section className="space-y-6">
          {/* Quick theme switcher bar for mobile/tablet */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold opacity-60 shrink-0">থিম:</span>
            {Object.values(STUDIO_THEMES).map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => handleSelectTheme(th.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                  currentTheme === th.id
                    ? `${theme.accentPill} shadow-xs font-black`
                    : `${theme.surfaceClass} border ${theme.cardBorder} text-stone-600 dark:text-stone-300`
                }`}
              >
                <span>{th.icon}</span>
                <span>{th.name.split("(")[0].trim()}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-black flex items-center gap-2">
                <span>সকল নূর এআই ফিচার ও পাঠ</span>
                <span className={`text-[10px] ${theme.badgeBg} px-2.5 py-0.5 rounded-full font-extrabold border ${theme.cardBorder}`}>
                  {allCards.length}টি ফিচার
                </span>
              </h2>
              <p className="text-xs opacity-75 font-medium mt-0.5">
                যেকোনো কার্ডে ক্লিক করলে ফিচারটি সাথে সাথে শুরু হবে
              </p>
            </div>

            {/* Quick search filter */}
            <div className="relative w-40 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="ফিচার খুঁজুন..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold ${theme.surfaceClass} border ${theme.cardBorder} focus:outline-none focus:ring-1 focus:ring-emerald-500`}
              />
            </div>
          </div>

          {/* Categorized Card Sections */}
          <div className="space-y-6">
            {FEATURE_CATEGORIES.map((cat) => {
              const filteredCards = cat.cards.filter((card) => {
                if (!searchFilter.trim()) return true;
                const q = searchFilter.toLowerCase();
                return (
                  card.title.toLowerCase().includes(q) ||
                  card.subtitle.toLowerCase().includes(q)
                );
              });

              if (filteredCards.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-3">
                  {/* Category Section Header (With Left Colored Vertical Bar) */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-5 rounded-full ${cat.barColor}`} />
                    <h3 className="text-xs sm:text-sm font-black tracking-tight">
                      {cat.titleBn}
                    </h3>
                    <span className="text-[10px] opacity-60 font-semibold">
                      ({filteredCards.length}টি পাঠ)
                    </span>
                  </div>

                  {/* 4-Column Responsive Tactile Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {filteredCards.map((card) => {
                      const Icon = card.icon;
                      const isActive = activeFeature === card.id;

                      const cardContent = (
                        <div
                          className={`group relative p-3.5 sm:p-4 rounded-3xl ${theme.surfaceClass} border ${
                            isActive
                              ? `border-2 ${theme.accentBorder} shadow-lg scale-[1.02]`
                              : `${theme.cardBorder} ${theme.cardHover} shadow-sm`
                          } transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 sm:h-40 select-none overflow-hidden`}
                        >
                          {/* Card Top: Gradient Icon & Emoji Badge */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${card.gradient || "from-emerald-500 to-teal-600 text-white"} flex items-center justify-center font-bold shadow-md group-hover:scale-110 group-hover:rotate-2 transition-all shrink-0`}>
                              <Icon className="w-5 h-5 drop-shadow-sm" />
                            </div>

                            <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 ${card.badgeStyle || theme.badgeBg}`}>
                              <span className="text-xs">{card.emoji}</span>
                              <span>{card.badge}</span>
                            </span>
                          </div>

                          {/* Card Bottom: Title & Subtitle */}
                          <div className="space-y-0.5 pt-2">
                            <h4 className="text-xs sm:text-sm font-black leading-tight line-clamp-1 flex items-center justify-between group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              <span>{card.title}</span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              )}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] opacity-80 font-medium line-clamp-1 leading-normal">
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                      );

                      if (card.isExternalLink && card.href) {
                        return (
                          <Link key={card.id} href={card.href} className="block">
                            {cardContent}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => launchFeature(card.id)}
                          className="text-left w-full block focus:outline-none"
                        >
                          {cardContent}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── MODALS INTEGRATED ── */}
      {/* 1. Semantic Quran Search Modal (Header search trigger) */}
      <QuranSemanticSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAyah={() => {
          setActiveFeature("quran-reader");
        }}
      />
    </div>
  );
}
