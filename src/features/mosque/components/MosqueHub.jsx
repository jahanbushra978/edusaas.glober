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
  const [activeTab, setActiveTab] = useState("ilm"); // "ilm" | "amal" | "seba" | "bibidh"
  const [activeModal, setActiveModal] = useState(null);

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

  // 4 Canonical Tab Item Definitions (8 actions per tab = 32 actions)
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
    { id: "voucher", icon: "🧾", label: "ডিজিটাল ভাউচার", action: () => setActiveModal("funds") },
    { id: "qa", icon: "📞", label: "দ্বীনি জিজ্ঞাসা", action: () => (onOpenTutor ? onOpenTutor() : setActiveModal("support")) },
    { id: "quiz", icon: "💡", label: "তালীমে কুইজ", action: () => setActiveModal("quiz") },
    { id: "nikah", icon: "💍", label: "বিবাহ", action: () => setActiveModal("nikah") },
    { id: "job", icon: "📰", label: "চাকরি", action: () => setActiveModal("job") },
    { id: "support", icon: "💬", label: "সাপোর্ট", action: () => setActiveModal("support") },
  ];

  const BIBIDH_ITEMS = [
    { id: "mosque", icon: "🕌", label: "আমার মসজিদ", action: () => setActiveModal("admin") },
    { id: "master", icon: "📊", label: "মাসিক হিসাব", action: () => setActiveModal("master-dues") },
    { id: "admin", icon: "⚙️", label: "অ্যাডমিন প্যানেল", action: () => setActiveModal("admin") },
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
                <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                  <span>মুসাল্লি / সাধারণ সদস্য</span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">সক্রিয়</span>
                </div>
              </div>
            </div>

            {/* Right Controls: District Selector & Notification */}
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
                {currentPrayer.name} জামাত
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                শুরু: {currentPrayer.start} – জামাত: <b className="text-emerald-700 dark:text-emerald-400 font-mono">{currentPrayer.jamaat}</b>
              </p>
            </div>
            <button
              onClick={() => setActiveModal("prayer-edit")}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
            >
              <span>✏️</span>
              <span>জামাত পরিবর্তন</span>
            </button>
          </div>

          {/* Live Pulsing Footer */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-emerald-950/80">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>চলমান ওয়াক্ত</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 font-bold text-[11px]">
              পরবর্তী ওয়াক্ত: {countdown} ({nextJamaatText})
            </div>
          </div>

          {/* 5-Waqt Grid */}
          <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <span>🕌</span>
                <span>৫ ওয়াক্তের সময়সূচি ও জামাত:</span>
              </span>
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {showFullSchedule ? "সংক্ষেপ ▴" : "বিস্তারিত ▾"}
              </button>
            </div>

            {showFullSchedule && (
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {schedule.map((p) => {
                  const isActive = p.id === currentPrayer.id;
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

        {/* ── 4. DONATION / INFAQ CAMPAIGN BANNER ── */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md mb-3 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <span>🤲</span>
              <span>সাদাকায়ে জারিয়া ও ইনফাক ফান্ড</span>
            </span>
            <h3 className="text-xs sm:text-sm font-black tracking-wide">
              মসজিদ সম্প্রসারণ ও দ্বিতীয় তলার ছাদ ঢালাই ফান্ড
            </h3>
            <p className="text-[11px] text-emerald-100">
              আপনার মাসিক চাঁদা ও দান সরাসরি জমা দিন
            </p>
          </div>
          <button
            onClick={() => setActiveModal("master-dues")}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md shrink-0 transition active:scale-95 cursor-pointer"
          >
            অনুদান দিন
          </button>
        </div>

        {/* ── 5. FAST ERP QUICK ACCESS BAR ── */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => setActiveModal("master-dues")}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs flex flex-col items-center justify-center text-center hover:border-emerald-500 transition cursor-pointer"
          >
            <span className="text-xl mb-1">📊</span>
            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">মাসিক হিসাব</span>
          </button>

          <button
            onClick={() => setActiveModal("funds")}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs flex flex-col items-center justify-center text-center hover:border-emerald-500 transition cursor-pointer"
          >
            <span className="text-xl mb-1">💰</span>
            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">মসজিদ তহবিল</span>
          </button>

          <button
            onClick={() => setActiveModal("maktab")}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs flex flex-col items-center justify-center text-center hover:border-emerald-500 transition cursor-pointer"
          >
            <span className="text-xl mb-1">🏫</span>
            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">নূরানী মক্তব</span>
          </button>

          <button
            onClick={() => setActiveModal("meal-roster")}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-2xs flex flex-col items-center justify-center text-center hover:border-emerald-500 transition cursor-pointer"
          >
            <span className="text-xl mb-1">🍲</span>
            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">খাবার রোস্টার</span>
          </button>
        </div>

        {/* ── 6. SECTION HEADER WITH GREEN LINE ── */}
        <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-emerald-600"></div>
            <h2 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">{sectionTitle}</h2>
          </div>
          <button
            onClick={() => setActiveModal(activeTab === "bibidh" ? "admin" : "kitab")}
            className="w-7 h-7 rounded-full bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 flex items-center justify-center text-xs text-stone-500 hover:text-emerald-600 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── 7. 4-COLUMN ACTION CARDS GRID (8 cards per tab) ── */}
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

        {/* ── 8. FLOATING BOTTOM NAVIGATION DOCK ── */}
        <nav className="fixed left-1/2 -translate-x-1/2 bottom-3 w-[calc(100%-24px)] max-w-md bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/80 rounded-full p-1.5 shadow-2xl flex items-center justify-between gap-1 z-40 backdrop-blur-md">
          {[
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

        {/* ── 9. MODALS RENDERING ── */}
        {activeModal === "master-dues" && (
          <MasterDuesModal
            onClose={() => setActiveModal(null)}
            onRecordPayment={(id) => {
              toast.success(`সদস্য #${id}-এর চাঁদা আদায় ফরম প্রদর্শিত`);
            }}
          />
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
