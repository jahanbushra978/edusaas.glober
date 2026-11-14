"use client";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Clock,
  Calendar,
  Heart,
  BookOpen,
  Scroll,
  FileText,
  Mic,
  GraduationCap,
  Compass,
  CheckCircle2,
  Coins,
  Receipt,
  HelpCircle,
  Briefcase,
  Headphones,
  ShieldCheck,
  Award,
  Video,
  Moon,
  Sun,
  Flame,
  ChevronRight,
  Bell,
  Search,
  Settings,
  User,
  Plus,
  X,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// Modal Suite Imports
import MasterDuesModal from "./modals/MasterDuesModal";
import PrayerTimeEditModal from "./modals/PrayerTimeEditModal";
import {
  KitabModal,
  HadithModal,
  ArticleModal,
  BayanModal,
} from "./modals/KnowledgeModals";
import {
  DuaModal,
  TasbeehModal,
  AmalTrackerModal,
  JainamazModal,
  QiblaModal,
  HajjModal,
  RozaModal,
} from "./modals/AmalModals";
import {
  ZakatModal,
  MaktabModal,
  MealRosterModal,
  IslamicQuizModal,
  NikahModal,
  HalalJobModal,
  SupportModal,
} from "./modals/SebaModals";
import {
  NamesOfAllahModal,
  LiveStreamModal,
  AdminPanelModal,
  FundsModal,
} from "./modals/CommunityModals";
import {
  MonthDetailModal,
  MyAccountStatementModal,
  ExpenseApprovalModal,
} from "./modals/FinanceModals";

const BANGLADESH_DISTRICTS = [
  "গাজীপুর",
  "ঢাকা",
  "নারায়ণগঞ্জ",
  "নরসিংদী",
  "মানিকগঞ্জ",
  "মুন্সীগঞ্জ",
  "চট্টগ্রাম",
  "কক্সবাজার",
  "কুমিল্লা",
  "সিলেট",
  "রাজশাহী",
  "বগুড়া",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
];

const DEFAULT_SCHEDULE = [
  { id: "fajr", name: "ফজর", start: "০৪:৪৫ AM", jamaat: "০৫:১৫ AM", startMins: 285, endMins: 354 },
  { id: "dhuhr", name: "যোহর", start: "১১:৫৮ AM", jamaat: "০১:১৫ PM", startMins: 718, endMins: 965 },
  { id: "asr", name: "আসর", start: "০৪:০৫ PM", jamaat: "০৪:৪৫ PM", startMins: 965, endMins: 1058 },
  { id: "maghrib", name: "মাগরিব", start: "০৫:৩৮ PM", jamaat: "০৫:৪৫ PM", startMins: 1058, endMins: 1130 },
  { id: "isha", name: "এশা", start: "০৬:৫০ PM", jamaat: "০৮:০০ PM", startMins: 1130, endMins: 1440 },
];

export default function MosqueHub({ onOpenQuranReader, onOpenTutor }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "ilm" | "amal" | "seba" | "bibidh"
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("নভেম্বর ২০২৬");

  // Mosque identity
  const [mosqueName, setMosqueName] = useState("বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স");
  const [district, setDistrict] = useState("গাজীপুর");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(mosqueName);

  // Prayer time tracking
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [currentPrayer, setCurrentPrayer] = useState(DEFAULT_SCHEDULE[2]); // Default Asr
  const [countdown, setCountdown] = useState("৪৫ মিনিট বাকি");
  const [nextJamaatText, setNextJamaatText] = useState("মাগরিব শুরু: ০৫:৩৮ PM");
  const [showFullSchedule, setShowFullSchedule] = useState(true);

  // Load persisted schedule & district
  useEffect(() => {
    try {
      const savedDist = localStorage.getItem("mosque_district");
      if (savedDist) setDistrict(savedDist);

      const savedName = localStorage.getItem("mosque_custom_name");
      if (savedName) {
        setMosqueName(savedName);
        setNameInput(savedName);
      }

      const savedSched = localStorage.getItem("mosque_prayer_schedule");
      if (savedSched) {
        const parsed = JSON.parse(savedSched);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setSchedule(parsed);
        }
      }
    } catch {}
  }, []);

  // Live timer calculation for prayer countdown
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      // Find active prayer
      const active = schedule.find((p) => currentMins >= p.startMins && currentMins < p.endMins) || schedule[4];
      setCurrentPrayer(active);

      // Find next prayer
      const next = schedule.find((p) => p.startMins > currentMins) || schedule[0];
      let diff = next.startMins - currentMins;
      if (diff < 0) diff += 1440;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      setCountdown(`${hours > 0 ? `${hours} ঘণ্টা ` : ""}${mins} মিনিট বাকি`);
      setNextJamaatText(`${next.name} শুরু: ${next.start}`);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const handleSaveMosqueName = () => {
    if (nameInput.trim()) {
      setMosqueName(nameInput.trim());
      try {
        localStorage.setItem("mosque_custom_name", nameInput.trim());
      } catch {}
      setIsEditingName(false);
      toast.success("মসজিদের নাম সফলভাবে হালনাগাদ হয়েছে");
    }
  };

  const handleDistrictChange = (d) => {
    setDistrict(d);
    try {
      localStorage.setItem("mosque_district", d);
    } catch {}
    toast.info(`অবস্থান: ${d} নির্বাচন করা হয়েছে`);
  };

  // 12-Month Trends Data (from mosque/AGENT.md specification)
  const MONTH_TRENDS = [
    { period: "জানু", full: "জানুয়ারি ২০২৬", amount: 58000, height: "65%" },
    { period: "ফেব", full: "ফেব্রুয়ারি ২০২৬", amount: 62000, height: "70%" },
    { period: "মার্চ", full: "মার্চ ২০২৬ (রমজান)", amount: 88000, height: "98%" },
    { period: "এপ্রিল", full: "এপ্রিল ২০২৬", amount: 68000, height: "77%" },
    { period: "মে", full: "মে ২০২৬", amount: 60000, height: "68%" },
    { period: "জুন", full: "জুন ২০২৬", amount: 64000, height: "72%" },
    { period: "জুলাই", full: "জুলাই ২০২৬", amount: 61000, height: "69%" },
    { period: "আগস্ট", full: "আগস্ট ২০২৬", amount: 63000, height: "71%" },
    { period: "সেপ্টে", full: "সেপ্টেম্বর ২০২৬", amount: 66000, height: "75%" },
    { period: "অক্টো", full: "অক্টোবর ২০২৬", amount: 70000, height: "79%" },
    { period: "নভে", full: "নভেম্বর ২০২৬", amount: 65000, height: "74%" },
    { period: "ডিসে", full: "ডিসেম্বর ২০২৬", amount: 59000, height: "66%" },
  ];

  // 4 Canonical Tab Item Definitions (8 actions per tab = 32 actions from IslamicSuperApp.tsx)
  const ILM_ITEMS = [
    { id: "quran", icon: "📖", label: "কুরআন", action: () => (onOpenQuranReader ? onOpenQuranReader() : setActiveModal("kitab")) },
    { id: "kitab", icon: "📚", label: "কিতাব", action: () => setActiveModal("kitab") },
    { id: "hadith", icon: "📜", label: "হাদীস", action: () => setActiveModal("hadith") },
    { id: "article", icon: "✍️", label: "প্রবন্ধ", action: () => setActiveModal("article") },
    { id: "bayan", icon: "🎙️", label: "বয়ান", action: () => setActiveModal("bayan") },
    { id: "maktab", icon: "🏫", label: "মক্তব", action: () => setActiveModal("maktab") },
    { id: "jainamaz", icon: "🕌", label: "জায়নামাজ", action: () => setActiveModal("jainamaz") },
    { id: "qibla", icon: "🧭", label: "কিবলা", action: () => setActiveModal("qibla") },
  ];

  const AMAL_ITEMS = [
    { id: "prayer", icon: "⏱️", label: "নামাজের সময়", action: () => setActiveModal("prayer-edit") },
    { id: "tilawat", icon: "🎧", label: "তিলাওয়াত", action: () => (onOpenQuranReader ? onOpenQuranReader() : setActiveModal("kitab")) },
    { id: "dua", icon: "🤲", label: "দু'আ", action: () => setActiveModal("dua") },
    { id: "tasbeeh", icon: "📿", label: "তাসবীহ", action: () => setActiveModal("tasbeeh") },
    { id: "tracker", icon: "📝", label: "আমল ট্রাকার", action: () => setActiveModal("tracker") },
    { id: "roster", icon: "🍲", label: "খাবার রোস্টার", action: () => setActiveModal("meal-roster") },
    { id: "hajj", icon: "🕋", label: "হজ্জ ও উমরা", action: () => setActiveModal("hajj") },
    { id: "roza", icon: "🌙", label: "রোযা ও সাহরি", action: () => setActiveModal("roza") },
  ];

  const SEBA_ITEMS = [
    { id: "zakat", icon: "💰", label: "যাকাত ফিতরা", action: () => setActiveModal("zakat") },
    { id: "donation", icon: "🎁", label: "ইনফাক ও চাঁদা", action: () => setActiveModal("master-dues") },
    { id: "voucher", icon: "🧾", label: "ডিজিটাল ভাউচার", action: () => setActiveModal("expense-approval") },
    { id: "qa", icon: "📞", label: "দ্বীনি জিজ্ঞাসা", action: () => (onOpenTutor ? onOpenTutor() : setActiveModal("support")) },
    { id: "quiz", icon: "💡", label: "তালীমে কুইজ", action: () => setActiveModal("quiz") },
    { id: "nikah", icon: "💍", label: "বিবাহ", action: () => setActiveModal("nikah") },
    { id: "job", icon: "📰", label: "চাকরি", action: () => setActiveModal("job") },
    { id: "support", icon: "💬", label: "সাপোর্ট", action: () => setActiveModal("support") },
  ];

  const BIBIDH_ITEMS = [
    { id: "mosque", icon: "🕌", label: "আমার মসজিদ", action: () => setActiveModal("admin") },
    { id: "master", icon: "📊", label: "মাসিক হিসাব", action: () => setActiveModal("master-dues") },
    { id: "admin", icon: "⚙️", label: "অ্যাডমিন ৩৬০", action: () => setActiveModal("admin") },
    { id: "funds", icon: "💰", label: "মসজিদ তহবিল", action: () => setActiveModal("funds") },
    { id: "names", icon: "🎖️", label: "আসমাউল হুসনা", action: () => setActiveModal("names") },
    { id: "live", icon: "🕋", label: "লাইভ হারামাইন", action: () => setActiveModal("live") },
    { id: "roza2", icon: "🌙", label: "রোযা ক্যালেন্ডার", action: () => setActiveModal("roza") },
    { id: "helpdesk", icon: "🔧", label: "হেল্পডেস্ক", action: () => setActiveModal("support") },
  ];

  const currentItems =
    activeTab === "ilm" ? ILM_ITEMS :
    activeTab === "amal" ? AMAL_ITEMS :
    activeTab === "seba" ? SEBA_ITEMS : BIBIDH_ITEMS;

  const sectionTitle =
    activeTab === "ilm" ? "ইলম (ইসলামিক জ্ঞান ও শিক্ষা)" :
    activeTab === "amal" ? "আমল (দৈনন্দিন ইবাদত ও সালাত)" :
    activeTab === "seba" ? "সেবা (যাকাত, ইনফাক ও সমাজকল্যাণ)" : "বিবিধ (মসজিদ ব্যবস্থাপনা ও তথ্য)";

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Mobile-first centered app shell */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28 pt-2">
        {/* ── 1. TOP HEADER ── */}
        <header className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs mb-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* User Avatar & Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                মু
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                    {mosqueName}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0 cursor-pointer"
                    title="মসজিদের নাম পরিবর্তন"
                  >
                    ✏️
                  </button>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">মুহাম্মদ আব্দুল্লাহ</span>
                  <span>·</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[9px]">
                    সভাপতি
                  </span>
                </div>
              </div>
            </div>

            {/* District & Notifications */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-white text-slate-900">
                    {d}
                  </option>
                ))}
              </select>

              <button
                onClick={() => toast.info("আপনার ৩টি অপঠিত নোটিফিকেশন রয়েছে: চলতি মাসের চাঁদা, খাবার স্পন্সর ও জুমার বয়ান")}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] flex items-center justify-center relative cursor-pointer hover:border-emerald-500 transition"
                title="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#0c1612]"></span>
              </button>
            </div>
          </div>

          {/* Edit Mosque Name Inline Modal */}
          {isEditingName && (
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 animate-in fade-in">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
                placeholder="মসজিদের নাম লিখুন..."
              />
              <button
                onClick={handleSaveMosqueName}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700"
              >
                সংরক্ষণ
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-700"
              >
                বাতিল
              </button>
            </div>
          )}
        </header>

        {/* ── 2. HIJRI & BANGLA SEASONAL BANNER ── */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs text-center mb-3">
          <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1.5">
            <span>৩০ রবিউল, ১ জুমাদাল উলা ১৪৪৮ হি. ইয়াওমুছ ছুলাছা</span>
            <span>🌙</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            সোমবার, ২৭ আশ্বিন ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল · সূর্যোদয় ০৫:৫৪ AM · সূর্যাস্ত ০৫:৩৮ PM
          </div>
        </div>

        {/* ── 3. PRAYER ARC & LIVE WAQT WIDGET ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs mb-3 space-y-3">
          {/* Arc Header row */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-dashed border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span>☀️</span>
              <span className="text-stone-600 dark:text-stone-400">{currentPrayer.name} ওয়াক্ত</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{currentPrayer.start}</span>
            </div>
            <div className="text-center">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{currentPrayer.name} ওয়াক্ত চলমান</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
              <span>তাহাজ্জুদ শেষ: ০৪:৩৪ ✔️</span>
            </div>
          </div>

          {/* Running Prayer Status Row */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                {currentPrayer.name} সালাত
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{nextJamaatText}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                {countdown}
              </span>
              <p className="text-[10px] text-stone-400">পরবর্তী জামা'আত</p>
            </div>
          </div>

          {/* Arc Prayer Waqt Grid */}
          <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">ওয়াক্ত ও জামা'আত সময়সূচি</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullSchedule(!showFullSchedule)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {showFullSchedule ? "সংক্ষেপ" : "বিস্তারিত"}
                </button>
                <button
                  onClick={() => setActiveModal("prayer-edit")}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  সময় পরিবর্তন
                </button>
              </div>
            </div>

            {showFullSchedule && (
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                {schedule.map((p) => {
                  const isActive = currentPrayer.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveModal("prayer-edit")}
                      className={`p-2 rounded-2xl text-center transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-600 shadow-2xs"
                          : "bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/40 hover:border-emerald-400"
                      }`}
                    >
                      <div className={`text-xs font-black ${isActive ? "text-emerald-800 dark:text-emerald-300" : "text-stone-800 dark:text-stone-200"}`}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {p.start.replace(" AM", "").replace(" PM", "")}
                      </div>
                      <div className={`text-[10px] font-mono font-bold mt-0.5 ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-stone-700 dark:text-stone-300"}`}>
                        {p.jamaat.replace(" AM", "").replace(" PM", "")}
                      </div>
                      {isActive && (
                        <span className="inline-block text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full mt-1">
                          চলমান
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── 4. COMPLETE MOSQUE SAAS FINANCE DASHBOARD (Active when tab === "dashboard") ── */}
        {activeTab === "dashboard" ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-emerald-600"></div>
                <h2 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                  {mosqueName} — ফিন্যান্স ড্যাশবোর্ড ও মাসিক চাঁদা
                </h2>
              </div>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                নভেম্বর ২০২৬
              </span>
            </div>

            {/* 1. HERO CARD: TOTAL AVAILABLE BALANCE & INFLOW/OUTFLOW */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#094838] via-[#0f6850] to-[#128a6a] text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>আসসালামু আলাইকুম · মোট তহবিল স্থিতি</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold font-mono">
                  BDT (৳)
                </span>
              </div>

              {/* Total Balance Number (Clickable drill-down to funds) */}
              <div
                onClick={() => setActiveModal("funds")}
                className="cursor-pointer group flex items-baseline gap-2 my-2"
                title="তহবিলের বিস্তারিত বিবরণী দেখতে ক্লিক করুন"
              >
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight group-hover:text-amber-200 transition">
                  ৳১,৯৮,৬০০
                </span>
                <span className="text-xs text-emerald-200 opacity-80 group-hover:opacity-100">
                  (তহবিল বিস্তারিত ➔)
                </span>
              </div>

              {/* Inflow vs Outflow Split Row */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20">
                <div
                  onClick={() => {
                    setSelectedMonth("নভেম্বর ২০২৬");
                    setActiveModal("month-detail");
                  }}
                  className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
                  title="এই মাসের আদায় খাতা দেখুন"
                >
                  <div className="text-[11px] text-emerald-100 font-semibold flex items-center justify-between">
                    <span>চলতি মাসে আদায়:</span>
                    <span>➔</span>
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono mt-0.5 text-white">
                    ৳৬৫,০০০
                  </div>
                </div>

                <div
                  onClick={() => setActiveModal("expense-approval")}
                  className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
                  title="খরচের বিল ও ভাউচার দেখুন"
                >
                  <div className="text-[11px] text-emerald-100 font-semibold flex items-center justify-between">
                    <span>অনুমোদিত ব্যয়:</span>
                    <span>➔</span>
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono mt-0.5 text-amber-200">
                    ৳১৬,৫০০
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MY ACCOUNT (আমার হিসাব — AGENT.md §1 & §5) */}
            <div
              onClick={() => setActiveModal("my-account")}
              className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    👤
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-900 dark:text-stone-100">আমার ব্যক্তিগত হিসাব</h3>
                    <p className="text-[10px] text-stone-400">আইডি: member01 · মাসিক অঙ্গীকার: ৳১,৫০০</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <span>রসিদ ও ইতিহাস</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">আপনি পরিশোধ করেছেন</span>
                  <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    ৳১,৫০০
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-stone-50 dark:bg-[#0f1d17]">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">আপনার বকেয়া রয়েছে</span>
                  <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    ৳০ (পরিশোধিত)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THIS MONTH COLLECTION PROGRESS OVERVIEW */}
            <div
              onClick={() => {
                setSelectedMonth("নভেম্বর ২০২৬");
                setActiveModal("month-detail");
              }}
              className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>📅</span>
                  <span>এই মাসের চাঁদা আদায় · নভেম্বর ২০২৬</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                  ৮৩% সম্পন্ন
                </span>
              </div>

              <div className="flex items-baseline justify-between my-1">
                <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono">
                  ৳৬৫,০০০{" "}
                  <span className="text-xs font-normal text-stone-400 font-sans">
                    / প্রত্যাশিত ৳৭৮,৫০০
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  ১৮ / ২৫ জন সদস্য দিয়েছেন
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-emerald-950/80 overflow-hidden my-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: "83%" }}
                ></div>
              </div>

              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between pt-1">
                <span>৭ জন সদস্যের চাঁদা বকেয়া রয়েছে</span>
                <span>কে দিয়েছে / কে বাকি (খাতা দেখুন ➔)</span>
              </div>
            </div>

            {/* 4. MOSQUE SEGREGATED FUNDS (AGENT.md §3 Invariant 6) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>মসজিদ তহবিলসমূহ (Segregated Funds)</span>
                </span>
                <button
                  onClick={() => setActiveModal("funds")}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  সব তহবিল ➔
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "সাধারণ পরিচালন ফান্ড", balance: 112000, color: "text-emerald-700 dark:text-emerald-300" },
                  { name: "নির্মাণ ও সংস্কার ফান্ড", balance: 64000, restricted: true, color: "text-amber-700 dark:text-amber-400" },
                  { name: "ইমাম-মুয়াজ্জিন হাদিয়া", balance: 15000, color: "text-teal-700 dark:text-teal-300" },
                  { name: "যাকাত ও সমাজকল্যাণ", balance: 7600, color: "text-purple-700 dark:text-purple-300" },
                ].map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveModal("funds")}
                    className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 truncate">
                      {f.name}
                    </div>
                    <div className={`text-sm sm:text-base font-black font-mono mt-1 ${f.color}`}>
                      ৳{f.balance.toLocaleString("bn-BD")}
                    </div>
                    {f.restricted && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 mt-1">
                        সংরক্ষিত
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. PENDING EXPENSE BILL APPROVAL ALERT */}
            <div
              onClick={() => setActiveModal("expense-approval")}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 dark:border-amber-600 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/50 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 font-bold text-sm">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                    ১টি খরচের বিল অনুমোদনের অপেক্ষায়
                  </h4>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    মাইক ও আইপিএস ব্যাটারি মেরামত (মাওলানা মাহমুদ হাসান)
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black font-mono text-amber-900 dark:text-amber-200 block">
                  ৳১২,৫০০
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold underline">
                  অনুমোদন করুন ➔
                </span>
              </div>
            </div>

            {/* 6. 12-MONTH COLLECTION TRENDS BAR CHART */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>📊</span>
                  <span>১২ মাসের চাঁদা আদায়ের ধারা (২০২৬)</span>
                </span>
                <span className="text-[10px] text-stone-400">বার স্পর্শ করে মাস দেখুন</span>
              </div>

              {/* Bar Columns Container */}
              <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-28 pt-2 px-1 border-b border-stone-100 dark:border-emerald-950">
                {MONTH_TRENDS.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedMonth(m.full);
                      setActiveModal("month-detail");
                      toast.info(`${m.full}-এর চাঁদা বিবরণী`);
                    }}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    title={`${m.full}: ৳${m.amount.toLocaleString("bn-BD")}`}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all group-hover:bg-amber-500 ${
                        idx === 10
                          ? "bg-gradient-to-t from-emerald-700 to-teal-500 shadow-xs"
                          : "bg-emerald-600/70 dark:bg-emerald-700/60"
                      }`}
                      style={{ height: m.height }}
                    ></div>
                    <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 mt-1 truncate">
                      {m.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. QUICK ACCESS BUTTONS TO 4 PILLARS */}
            <div className="pt-2">
              <span className="text-xs font-black text-stone-700 dark:text-stone-300 block mb-2 px-1">
                স্মার্ট ইসলামিক ও মসজিদ সেবা (ক্যাটাগরি):
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "ilm", icon: "📖", label: "ইলম", desc: "৮টি ফিচার" },
                  { key: "amal", icon: "📝", label: "আমল", desc: "৮টি ফিচার" },
                  { key: "seba", icon: "🛍️", label: "সেবা", desc: "৮টি ফিচার" },
                  { key: "bibidh", icon: "⊞", label: "বিবিধ", desc: "৮টি ফিচার" },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setActiveTab(pill.key)}
                    className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs hover:border-emerald-500 flex flex-col items-center justify-center text-center transition cursor-pointer"
                  >
                    <span className="text-xl mb-1">{pill.icon}</span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{pill.label}</span>
                    <span className="text-[9px] text-stone-400 mt-0.5">{pill.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── 5. CANONICAL PILLARS ACTION GRID (8 Cards per Pillar when tab !== "dashboard") ── */
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Back to Dashboard Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>⬅️ মূল ফিন্যান্স ড্যাশবোর্ডে ফিরুন</span>
              </button>
              <span className="text-xs font-black text-stone-700 dark:text-stone-300">
                {sectionTitle}
              </span>
            </div>

            {/* 4-Column Action Cards Grid (8 cards) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 mb-4">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 flex flex-col items-center justify-center text-center shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm active:scale-95 transition cursor-pointer min-h-[88px]"
                >
                  <span className="text-2xl mb-1.5 leading-none">{item.icon}</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. FLOATING BOTTOM NAVIGATION DOCK (5 Canonical Tabs) ── */}
        <nav className="fixed left-1/2 -translate-x-1/2 bottom-3 w-[calc(100%-24px)] max-w-md bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/80 rounded-full p-1.5 shadow-2xl flex items-center justify-between gap-1 z-40 backdrop-blur-md">
          {[
            { key: "dashboard", icon: "📊", label: "ড্যাশবোর্ড" },
            { key: "ilm", icon: "📖", label: "ইলম" },
            { key: "amal", icon: "📝", label: "আমল" },
            { key: "seba", icon: "🛍️", label: "সেবা" },
            { key: "bibidh", icon: "⊞", label: "বিবিধ" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-full flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white font-black shadow-xs"
                    : "text-stone-500 dark:text-stone-400 hover:text-emerald-700 font-semibold"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── 7. MODALS RENDERING ── */}
        {/* Core Finance & Dues Modals */}
        {activeModal === "master-dues" && (
          <MasterDuesModal
            onClose={() => setActiveModal(null)}
            onRecordPayment={(id) => {
              toast.success(`সদস্য #${id}-এর চাঁদা আদায় ফরম প্রদর্শিত`);
            }}
          />
        )}

        {activeModal === "month-detail" && (
          <MonthDetailModal
            period={selectedMonth}
            onClose={() => setActiveModal(null)}
            onRecordPayment={(id) => {
              setActiveModal("master-dues");
            }}
          />
        )}

        {activeModal === "my-account" && (
          <MyAccountStatementModal
            onClose={() => setActiveModal(null)}
            mosqueName={mosqueName}
          />
        )}

        {activeModal === "expense-approval" && (
          <ExpenseApprovalModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "prayer-edit" && (
          <PrayerTimeEditModal
            schedule={schedule}
            onClose={() => setActiveModal(null)}
            onSave={(updated) => {
              setSchedule(updated);
              try {
                localStorage.setItem("mosque_prayer_schedule", JSON.stringify(updated));
              } catch {}
            }}
            onReset={() => {
              setSchedule(DEFAULT_SCHEDULE);
              try {
                localStorage.removeItem("mosque_prayer_schedule");
              } catch {}
            }}
          />
        )}

        {/* Knowledge modals */}
        {activeModal === "kitab" && <KitabModal onClose={() => setActiveModal(null)} />}
        {activeModal === "hadith" && <HadithModal onClose={() => setActiveModal(null)} />}
        {activeModal === "article" && <ArticleModal onClose={() => setActiveModal(null)} />}
        {activeModal === "bayan" && <BayanModal onClose={() => setActiveModal(null)} />}

        {/* Amal modals */}
        {activeModal === "dua" && <DuaModal onClose={() => setActiveModal(null)} />}
        {activeModal === "tasbeeh" && <TasbeehModal onClose={() => setActiveModal(null)} />}
        {activeModal === "tracker" && <AmalTrackerModal onClose={() => setActiveModal(null)} />}
        {activeModal === "jainamaz" && <JainamazModal onClose={() => setActiveModal(null)} />}
        {activeModal === "qibla" && <QiblaModal onClose={() => setActiveModal(null)} />}
        {activeModal === "hajj" && <HajjModal onClose={() => setActiveModal(null)} />}
        {activeModal === "roza" && <RozaModal onClose={() => setActiveModal(null)} />}

        {/* Seba modals */}
        {activeModal === "zakat" && <ZakatModal onClose={() => setActiveModal(null)} />}
        {activeModal === "maktab" && <MaktabModal onClose={() => setActiveModal(null)} />}
        {activeModal === "meal-roster" && <MealRosterModal onClose={() => setActiveModal(null)} />}
        {activeModal === "quiz" && <IslamicQuizModal onClose={() => setActiveModal(null)} />}
        {activeModal === "nikah" && <NikahModal onClose={() => setActiveModal(null)} />}
        {activeModal === "job" && <HalalJobModal onClose={() => setActiveModal(null)} />}
        {activeModal === "support" && <SupportModal onClose={() => setActiveModal(null)} />}

        {/* Community modals */}
        {activeModal === "names" && <NamesOfAllahModal onClose={() => setActiveModal(null)} />}
        {activeModal === "live" && <LiveStreamModal onClose={() => setActiveModal(null)} />}
        {activeModal === "admin" && (
          <AdminPanelModal
            onClose={() => setActiveModal(null)}
            onOpenMasterDues={() => setActiveModal("master-dues")}
            onOpenFunds={() => setActiveModal("funds")}
          />
        )}
        {activeModal === "funds" && <FundsModal onClose={() => setActiveModal(null)} />}
      </div>
    </div>
  );
}
