"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Users,
  Coins,
  FileText,
  Search,
  LogIn,
  Globe,
  Landmark,
  Image as ImageIcon,
  Send,
  Award,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  HeartHandshake,
  Boxes,
  ChevronRight,
  Zap,
  User,
  Utensils,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { recordDonationInDatabase } from "../services/mosqueStorage";
import MosqueLoginModal from "./modals/MosqueLoginModal";
import MonthlyPrayerCalendarModal from "./modals/MonthlyPrayerCalendarModal";

/**
 * PublicMosqueWebsite — Dedicated Mosque Landing Page & Web Portal
 * 
 * Features:
 * 1. Top Section: Live Islamic Hijri/Bengali/English Calendar, Live Real-time Clock,
 *    5 Waqt Prayer Timetable, Current Waqt Status, Live Jama'at Countdown,
 *    Nafl & Hanafi Makruh Prohibited times, and Full 30-Day Monthly Calendar modal.
 * 2. Mosque Information: History, 8 Modern Facilities, Scholars & Imams,
 *    Executive Committee, Friday Jumu'ah topics, and 3rd Floor Expansion Project.
 * 3. SaaS Platform Section: Edusaas Digital Mosque ERP capabilities (Cashless donations,
 *    realtime 10 funds, automated Imam meal roster, Noorani maktab tracker, free custom domain, cloud backup).
 * 4. Interactive Role-Based Login: Users log in by role or ID (President, Treasurer, Imam, Musalli, Muezzin)
 *    and seamlessly transition directly into their role-specific ERP dashboard!
 * 5. 10 Canonical Navigation Tabs: Home, About, Prayer, Committee, Scholars, Donate, Notices, Activities, Gallery, Contact.
 */

export function PublicMosqueWebsite({
  mosque,
  schedule,
  currentPrayer: initialCurrentPrayer,
  countdown: initialCountdown,
  nextJamaatText: initialNextJamaat,
  onOpenLogin,
  onLoginRole,
  onOpenDiscovery,
  onOpenCustomDomain,
  onOpenMaktab,
  onNavigateBack,
  members = [],
}) {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "about" | "prayer" | "committee" | "scholars" | "donate" | "notices" | "activities" | "gallery" | "contact"
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMonthlyCalendarOpen, setIsMonthlyCalendarOpen] = useState(false);
  const [showProhibitedTimes, setShowProhibitedTimes] = useState(false);

  // Donation Form state
  const [donateAmount, setDonateAmount] = useState(1000);
  const [selectedFundId, setSelectedFundId] = useState("f1");
  const [selectedFundName, setSelectedFundName] = useState("সাধারণ পরিচালন ফান্ড");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("বিকাশ (bKash)");
  const [donationReceipt, setDonationReceipt] = useState(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const currentMosqueName = mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স";
  const currentAddress = mosque?.address || "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন, ঢাকা, বাংলাদেশ";

  // Formatted Current Dates
  const formattedTime = currentTime.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedGregorianDate = currentTime.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDayName = currentTime.toLocaleDateString("bn-BD", {
    weekday: "long",
  });

  // Authentic Default 5 Waqt Prayer Timetable if schedule is empty
  const PRAYER_TIMETABLE = schedule && schedule.length >= 5 ? schedule : [
    { id: "fajr", name: "ফজর", arabic: "الفجر", start: "০৫:০২ AM", jamaat: "০৫:২৫ AM", end: "০৬:১৮ AM", isActive: false },
    { id: "dhuhr", name: "যোহর", arabic: "الظهر", start: "১১:৪৬ AM", jamaat: "০১:১৫ PM", end: "০৩:৪৩ PM", isActive: false },
    { id: "asr", name: "আসর", arabic: "العصر", start: "০৩:৪৪ PM", jamaat: "০৪:১৫ PM", end: "০৫:০৮ PM", isActive: true },
    { id: "maghrib", name: "মাগরিব", arabic: "المغرب", start: "০৫:০৯ PM", jamaat: "০৫:১৫ PM", end: "০৬:২৩ PM", isActive: false },
    { id: "isha", name: "এশা", arabic: "العشاء", start: "০৬:২৪ PM", jamaat: "০৭:৩০ PM", end: "০৪:৫৯ AM", isActive: false },
    { id: "jumuah", name: "পবিত্র জুমু'আ", arabic: "الجمعة", start: "১১:৪৬ AM", jamaat: "০১:৩০ PM", end: "০৩:৪৩ PM", isJummah: true },
  ];

  const currentPrayerItem = initialCurrentPrayer || PRAYER_TIMETABLE.find(p => p.isActive) || PRAYER_TIMETABLE[2];
  const nextJamaatDisplay = initialNextJamaat || "মাগরিব জামা'আত: ০৫:১৫ PM";
  const countdownDisplay = initialCountdown || "৪৫ মিনিট বাকি";

  const handleTriggerLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    }
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (loginData) => {
    if (onLoginRole) {
      onLoginRole(loginData);
    }
    setIsLoginModalOpen(false);
  };

  const FUNDS_LIST = [
    { id: "f1", name: "সাধারণ পরিচালন ফান্ড" },
    { id: "f2", name: "নির্মাণ ও সংস্কার ফান্ড" },
    { id: "f3", name: "ইমাম-মুয়াজ্জিন সম্মানী ফান্ড" },
    { id: "f4", name: "যাকাত ফান্ড" },
    { id: "f5", name: "ফিতরা ফান্ড" },
    { id: "f6", name: "সদকা ও লিল্লাহ ফান্ড" },
    { id: "f7", name: "ওয়াকফ ফান্ড" },
    { id: "f8", name: "রমজান ও ইফতার ফান্ড" },
    { id: "f9", name: "মক্তব ও শিক্ষা ফান্ড" },
    { id: "f10", name: "জরুরি দুর্যোগ ও সমাজকল্যাণ" },
  ];

  const handleOnlineDonate = (e) => {
    e.preventDefault();
    if (!donateAmount || Number(donateAmount) <= 0) {
      toast.error("সঠিক অনুদানের পরিমাণ দিন");
      return;
    }

    const finalDonor = isAnonymous ? "গোপন দাতা (Anonymous)" : (donorName.trim() || "শ্রদ্ধেয় মুসল্লি");
    const finalPhone = isAnonymous ? "গোপন" : (donorPhone.trim() || "০১৭XX-XXXXXX");

    const updatedDb = recordDonationInDatabase(
      {
        donorId: null,
        donorName: finalDonor,
        phone: finalPhone,
        fundId: selectedFundId,
        amount: Number(donateAmount),
        category: "পাবলিক ওয়েবসাইট অনলাইন দান",
        method: paymentMethod,
        status: "VERIFIED",
        notes: `অনলাইন রসিদ - ফান্ড: ${selectedFundName}`,
      },
      "পাবলিক অনলাইন ডোনেশন গেটওয়ে"
    );

    const latestInflow = updatedDb.inflows[0];

    const rcpt = {
      receiptNo: latestInflow ? latestInflow.receiptNo : `RCPT-ONL-${Date.now().toString().slice(-5)}`,
      donor: finalDonor,
      phone: finalPhone,
      amount: Number(donateAmount),
      fund: selectedFundName,
      date: new Date().toLocaleDateString("bn-BD"),
      method: paymentMethod,
      timestamp: new Date().toLocaleTimeString("bn-BD"),
    };

    setDonationReceipt(rcpt);
    toast.success("মাশাআল্লাহ! অনুদানটি সফলভাবে গৃহীত হয়েছে এবং সংশ্লিষ্ট ফান্ডে যুক্ত হয়েছে।");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    toast.success("আপনার বার্তাটি মসজিদ কমিটির কাছে সফলভাবে পাঠানো হয়েছে। জাযাকাল্লাহু খাইরান!");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* ── TOP UTILITY TICKER & HIJRI/GREGORIAN DATE BAR ── */}
      <div className="bg-[#064E3B] text-emerald-100 text-[11px] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-semibold truncate">
            পবিত্র জুমার জামা'আত: ০১:৩০ PM · সকল মুসল্লিদের সাদর আমন্ত্রণ
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
            🌙 ২২ জমাদিউল আউয়াল ১৪৪৮ হিজরি
          </span>
          <span className="hidden md:inline font-mono text-emerald-200">
            {formattedDayName}, {formattedGregorianDate}
          </span>
          <button
            type="button"
            onClick={onOpenCustomDomain}
            className="hover:underline flex items-center gap-1 cursor-pointer text-emerald-200"
          >
            <Globe className="w-3 h-3" />
            <span>{mosque?.customDomain || "baitunnoormasjid.org"}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
        {/* ── TOP MAIN HEADER & NAVIGATION ── */}
        <header className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Mosque Identity & Logo */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#0D7A5F] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {mosque?.logoLetter || "বা"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100 truncate">
                    {currentMosqueName}
                  </h1>
                  <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    স্থাপিত: {mosque?.established || "১৯৯৮"}
                  </span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0D7A5F] shrink-0" />
                  <span className="truncate">{currentAddress}</span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons (Donate & Role-Based Login) */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="px-3 py-2 rounded-2xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-emerald-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  title="কুরআন স্টুডিওতে ফিরুন"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">স্টুডিও</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenDiscovery}
                className="p-2.5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition cursor-pointer"
                title="অন্যান্য মসজিদ খুঁজুন"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("donate")}
                className="px-4 py-2 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>অনলাইন দান</span>
              </button>

              {/* ROLE-BASED LOGIN BUTTON */}
              <button
                type="button"
                onClick={handleTriggerLogin}
                className="px-4 py-2 rounded-2xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
                title="সদস্য, ইমাম ও পরিচালনা কমিটির জন্য লগইন"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন / পোর্টাল</span>
              </button>
            </div>
          </div>

          {/* 10 Canonical Navigation Tabs */}
          <nav className="flex gap-1 overflow-x-auto scrollbar-none pt-2 border-t border-stone-100 dark:border-emerald-950/80 text-xs">
            {[
              { key: "home", label: "হোম ও ল্যান্ডিং" },
              { key: "prayer", label: "নামাজের সময়সূচি" },
              { key: "about", label: "আমাদের মসজিদ" },
              { key: "committee", label: "কমিটি" },
              { key: "scholars", label: "ইমাম ও খতিব" },
              { key: "donate", label: "দান করুন" },
              { key: "notices", label: "নোটিশ" },
              { key: "activities", label: "কার্যক্রম ও মক্তব" },
              { key: "gallery", label: "ছবি ও ভিডিও" },
              { key: "contact", label: "যোগাযোগ" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  activeTab === tab.key
                    ? "bg-[#0D7A5F] text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:text-[#0D7A5F] hover:bg-stone-50 dark:hover:bg-[#07130e]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════════════════
            1. হোম ও ল্যান্ডিং পেজ (HOME LANDING PAGE)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* ── [PILLAR A]: TOP PRAYER TIMES SCHEDULE & CALENDAR WIDGET ── */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border-2 border-[#0D7A5F]/30 dark:border-emerald-800/50 shadow-md space-y-4">
              {/* Live Calendar & Realtime Clock Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D7A5F] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-[#0D7A5F]/30">
                    <Clock className="w-5 h-5 text-[#0D7A5F] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#0D7A5F] dark:text-emerald-400 uppercase tracking-wider">
                        দৈনিক সালাত ও ইসলামিক ক্যালেন্ডার
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-stone-100 dark:bg-[#07130e] text-stone-600 dark:text-stone-300 border border-stone-200">
                        লাইভ ঘড়ি: {formattedTime}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 mt-0.5">
                      {formattedDayName}, {formattedGregorianDate} · ২২ জমাদিউল আউয়াল ১৪৪৮ হিজরি
                    </h2>
                  </div>
                </div>

                {/* Next Jama'at & Monthly Sheet Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => setIsMonthlyCalendarOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-[#0D7A5F] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>মাসিক ক্যালেন্ডার শিট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProhibitedTimes(!showProhibitedTimes)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-[#07130e] hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-900/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>নিষিদ্ধ সময়</span>
                  </button>
                </div>
              </div>

              {/* Live Running Waqt & Countdown Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-[#064E3B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0"></div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 block">
                      বর্তমান ওয়াক্ত: {currentPrayerItem.name} ({currentPrayerItem.arabic}) চলমান
                    </span>
                    <span className="text-sm sm:text-base font-black">
                      {nextJamaatDisplay}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                    {countdownDisplay}
                  </span>
                  <span className="text-[10px] text-emerald-200 block">পরবর্তী জামা'আত শুরু হতে বাকি</span>
                </div>
              </div>

              {/* 5 Waqt + Jumu'ah Timetable Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-center">
                {PRAYER_TIMETABLE.map((p) => {
                  const isCurrent = currentPrayerItem?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl transition-all ${
                        isCurrent
                          ? "bg-emerald-50 dark:bg-emerald-950/70 border-2 border-[#0D7A5F] shadow-sm transform scale-[1.02]"
                          : "bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                        <span>{p.arabic}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0D7A5F] text-white font-bold animate-pulse">
                            চলমান
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">আযান: {p.start}</div>
                      <div className="text-xs sm:text-sm font-mono font-black text-[#0D7A5F] dark:text-emerald-400 mt-1">
                        জামাত: {p.jamaat}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">শেষ: {p.end || "—"}</div>
                    </div>
                  );
                })}
              </div>

              {/* Prohibited Times Expandable Panel */}
              {showProhibitedTimes && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>সালাত আদায়ের ৩টি নিষিদ্ধ ও মাকরূহে তাহরীমী সময় (হানাফী ফিকহ):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0c1612] border border-amber-200">
                      <b className="text-amber-900 dark:text-amber-300 block">১. সূর্যোদয়ের সময়:</b>
                      <span className="text-stone-600 dark:text-stone-300">সূর্য ওঠার পর থেকে প্রায় ১৫-২০ মিনিট (০৬:১৯ - ০৬:৩৪ AM)।</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0c1612] border border-amber-200">
                      <b className="text-amber-900 dark:text-amber-300 block">২. ঠিক দ্বিপ্রহর (নিসফুন নাহার):</b>
                      <span className="text-stone-600 dark:text-stone-300">সূর্য ঠিক মাথার উপর থেকে পশ্চিমে ঢলে পড়ার পূর্ব মুহূর্ত (১১:৩৮ - ১১:৪৫ AM)।</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0c1612] border border-amber-200">
                      <b className="text-amber-900 dark:text-amber-300 block">৩. সূর্যাস্তের সময়:</b>
                      <span className="text-stone-600 dark:text-stone-300">সূর্য হলুদ বর্ণ হওয়ার পর থেকে ডোবা পর্যন্ত (০৫:০১ - ০৫:০৮ PM)।</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── [PILLAR B]: GRAND ISLAMIC MOSQUE HERO & OVERVIEW ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0D7A5F] to-[#0f6850] text-white shadow-xl relative overflow-hidden space-y-5">
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Landmark className="w-4 h-4 text-amber-300" />
                  <span>আল্লাহর ঘর পরিচালনা, দ্বীনি দাওয়াত ও মানবিক কল্যাণ মারকাজ</span>
                </span>
                <span className="font-mono bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
                  স্থাপিত: {mosque?.established || "১৯৯৮ খ্রিষ্টাব্দ"}
                </span>
              </div>

              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
                  {currentMosqueName}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  পবিত্র কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শে পরিচালিত একটি ঐতিহ্যবাহী কেন্দ্রীয় জামে মসজিদ ও ইসলামিক কমপ্লেক্স। এখানে রয়েছে সুপরিসর ৫ ওয়াক্ত সালাতের জামা'আত, শিশু-কিশোরদের নূরানী কুরআন মক্তব, সাপ্তাহিক জুমার গবেষণালব্ধ তাফসীর এবং শতভাগ স্বচ্ছ ডিজিটাল হিসাব ব্যবস্থাপনা।
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("donate")}
                  className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>মসজিদে অনলাইন দান করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMonthlyCalendarOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>পূর্ণাঙ্গ নামাজের ক্যালেন্ডার</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerLogin}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer ml-auto transition border border-white/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>আইডি দিয়ে ড্যাশবোর্ডে লগইন</span>
                </button>
              </div>
            </div>

            {/* ── [PILLAR C]: MOSQUE HIGHLIGHTS & 8 MODERN FACILITIES ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0D7A5F]" />
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    মসজিদ কমপ্লেক্সের আধুনিক সুযোগ-সুবিধা ও সার্ভিসেস
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className="text-xs font-bold text-[#0D7A5F] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>বিস্তারিত ইতিহাস</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    title: "সেন্ট্রাল এসি ও প্রধান হল",
                    desc: "একসাথে ৪,৫০০ মুসল্লির শীতাতপ নিয়ন্ত্রিত পরিবেশে নির্বিঘ্ন সালাত আদায়।",
                    icon: Landmark,
                  },
                  {
                    title: "আধুনিক অজুখানা ও ওয়াটার ফিল্টার",
                    desc: "একসাথে ১০০ জনের অজু এবং স্বাস্থ্যসম্মত বিশুদ্ধ ফিল্টারিং খাবার পানি।",
                    icon: CheckCircle2,
                  },
                  {
                    title: "মা-বোনদের পৃথক সালাতখানা",
                    desc: "সম্পূর্ণ পর্দাযুক্ত স্বতন্ত্র প্রবেশদ্বার ও আধুনিক অজুখানা সম্বলিত সালাত স্পেস।",
                    icon: Users,
                  },
                  {
                    title: "সার্বক্ষণিক জেনারেটর ব্যাকআপ",
                    desc: "বিদ্যুৎ বিভ্রাটেও নিরবচ্ছিন্ন সালাত, ফ্যান, এসি ও সাউন্ড সিস্টেম চালু থাকে।",
                    icon: Zap,
                  },
                  {
                    title: "২৪ ঘণ্টা সিসিটিভি ও নিরাপত্তা",
                    desc: "মসজিদের নিরাপত্তা নিশ্চিতকরণে আধুনিক নাইট-ভিশন ক্যামেরা ও পাহারাদার।",
                    icon: ShieldCheck,
                  },
                  {
                    title: "ইসলামিক রিসার্চ লাইব্রেরি",
                    desc: "তাফসীর, সহীহ হাদিস, ফিকহ ও সিরাত গ্রন্থের সমৃদ্ধ গবেষণামূলক পাঠাগার।",
                    icon: BookOpen,
                  },
                  {
                    title: "ফ্রি কাফন-দাফন ও অ্যাম্বুলেন্স",
                    desc: "মহল্লাবাসীর জন্য সার্বক্ষণিক লাশ গোসলখানা ও ফ্রিজিং অ্যাম্বুলেন্স সেবা।",
                    icon: HeartHandshake,
                  },
                  {
                    title: "সুপরিসর জানাযার মাঠ ও পার্কিং",
                    desc: "মসজিদ প্রাঙ্গণে গাড়ি ও মোটরসাইকেল পার্কিং এবং উন্মুক্ত জানাযার মাঠ।",
                    icon: Boxes,
                  },
                ].map((facility, idx) => {
                  const Icon = facility.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/40 shadow-xs space-y-2 hover:border-[#0D7A5F] transition group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D7A5F] dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-[#0D7A5F] group-hover:text-white transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                        {facility.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                        {facility.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── [PILLAR D]: OUR PLATFORM SECTION (Edusaas Digital Mosque ERP Cloud) ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Edusaas এন্টারপ্রাইজ ক্লাউড
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      edusaas.global
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    আমাদের সাইট ও ডিজিটাল মসজিদ প্ল্যাটফর্মের সুবিধাসমূহ
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                    কাগজের রসিদ ও অনির্দিষ্ট খাতার দিন শেষ — Edusaas ডিজিটাল মসজিদ প্ল্যাটফর্মের মাধ্যমে আল্লাহর ঘরের প্রতিটি টাকার হিসাব এখন সম্পূর্ণ স্বচ্ছ, জবাবদিহিতামূলক এবং ডিজিটাল ক্লাউডে সংরক্ষিত।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerLogin}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shrink-0 self-start md:self-center transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>আইডি দিয়ে লগইন করুন</span>
                </button>
              </div>

              {/* 6 Core Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    title: "১০০% ডিজিটাল কালেকশন ও ইনস্ট্যান্ট রসিদ",
                    desc: "বিকাশ, নগদ বা কিউআর কোডে অনুদান দিলে স্বয়ংক্রিয় ডিজিটাল ভাউচার এবং মোবাইল এসএমএস কনফার্মেশন পৌঁছে যায়।",
                    icon: Coins,
                    color: "text-amber-400",
                  },
                  {
                    title: "রিয়েল-টাইম ১০টি ডেডিকেটেড ফান্ড ও লেজার",
                    desc: "সাধারণ ফান্ড, নির্মাণ, যাকাত, ফিতরা, ইমাম সম্মানী সহ ১০টি আলাদা ফান্ডের প্রতিটি পয়সার হিসাব ডাবল-এন্ট্রি লেজারে সংরক্ষিত।",
                    icon: Landmark,
                    color: "text-emerald-400",
                  },
                  {
                    title: "ডিজিটাল ইমাম মেস (খানা) রোস্টার",
                    desc: "মহল্লাবাসীর কোন পরিবার কোন তারিখে খানা পাঠাবেন, তার স্বয়ংক্রিয় ডিজিটাল রোস্টার এবং আগের দিন স্বয়ংক্রিয় এসএমএস রিমাইন্ডার।",
                    icon: Utensils,
                    color: "text-teal-400",
                  },
                  {
                    title: "নূরানী মক্তব ও শিশু কুরআন ট্র্যাকিং",
                    desc: "সকালের শিশু-কিশোর নূরানী মক্তবের শিক্ষার্থীদের দৈনিক হাজিরা, তাজবীদ ছবক এবং অভিভাবকদের কাছে মাসিক প্রগ্রেস রিপোর্ট।",
                    icon: GraduationCap,
                    color: "text-cyan-400",
                  },
                  {
                    title: "প্রতিটি মসজিদের নিজস্ব ব্র্যান্ডেড ফ্রি ওয়েবসাইট",
                    desc: "কোনো জটিল কোডিং ছাড়াই মাত্র ১ ক্লিকে মসজিদের জন্য নিজস্ব পাবলিক ওয়েবসাইট (যেমন baitunnoormasjid.org) ও নোটিশ বোর্ড।",
                    icon: Globe,
                    color: "text-blue-400",
                  },
                  {
                    title: "নিরাপদ ক্লাউড ডেটাবেজ ও এনক্রিপ্টেড ব্যাকআপ",
                    desc: "মসজিদের কোনো আর্থিক ডেটা নষ্ট হবে না। এক ক্লিকে এক্সেল ও পিডিএফে পূর্ণাঙ্গ অডিট ও বার্ষিক আয়-ব্যয় রিপোর্ট এক্সপোর্ট।",
                    icon: ShieldCheck,
                    color: "text-purple-400",
                  },
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 space-y-2 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${feat.color}`} />
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {feat.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Login Call-to-Action Bar */}
              <div className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-emerald-300 shrink-0" />
                  <div>
                    <b className="text-white block">আপনি কি কমিটির কর্মকর্তা, ইমাম বা নিয়মিত দাতা সদস্য?</b>
                    <span className="text-emerald-200 text-[11px]">আপনার সদস্য আইডি (যেমন: PRES-01, CASHIER-01, IMAM-01, M-101) দিয়ে এখনই প্রবেশ করুন।</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerLogin}
                  className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black hover:bg-emerald-100 transition cursor-pointer shrink-0"
                >
                  পোর্টালে প্রবেশ করুন ➔
                </button>
              </div>
            </div>

            {/* ── [PILLAR E]: ONGOING PROJECTS & QUICK DONATION ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Ongoing Project */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
                    চলমান উন্নয়ন ও নির্মাণ প্রকল্প
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ৮২% ফান্ড সংগৃহীত
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                  মসজিদ কমপ্লেক্সের ৩য় তলা সম্প্রসারণ ও আধুনিক ওজুখখানা প্রকল্প
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  ক্রমবর্ধমান মুসল্লিদের স্থান সংকুলান ও বরকতময় সালাতের সুব্যবস্থায় ৩য় তলা ছাদ ঢালাই ও টাইলস স্থাপন কাজ দ্রুত এগিয়ে চলছে। আপনার সদকায়ে জারিয়ার অনুদান সাদরে কাম্য।
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                    <span>সংগৃহীত: ৳৪১,০০,০০০</span>
                    <span>মোট বাজেট: ৳৫০,০০,০০০</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                    সদকায়ে জারিয়ার অংশীদার হতে অনুদান দিন:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("donate")}
                    className="px-4 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>প্রকল্পে দান করুন</span>
                  </button>
                </div>
              </div>

              {/* Jumu'ah Weekly Notice */}
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-[#0D7A5F]/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D7A5F] text-white font-bold">
                    আগামী জুমার বিশেষ নোটিশ
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    বিষয়: "ইসলামে প্রতিবেশীর হক ও সামাজিক দায়িত্ববোধ"
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    জুমার বয়ান শুরু: দুপুর ০১:০০ PM। বয়ান ও খুতবা পেশ করবেন সম্মানিত প্রধান খতীব মাওলানা মুফতি আব্দুল্লাহ আল-মামুন।
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>খুতবা ও জামাত: ০১:৩০ PM</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notices")}
                    className="font-bold text-[#0D7A5F] dark:text-emerald-300 hover:underline"
                  >
                    সকল নোটিশ ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. নামাজের সময়সূচি (PRAYER TIMES TAB)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "prayer" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#0D7A5F]" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    ৫ ওয়াক্ত সালাত ও জামা'আতের নির্ভুল সময়সূচি
                  </h3>
                  <p className="text-xs text-stone-500">গাজীপুর ও সংলগ্ন অঞ্চলের ইসলামিক ফাউন্ডেশন মানদণ্ড</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMonthlyCalendarOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D7A5F] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>মাসিক শিট প্রিন্ট করুন</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-emerald-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 dark:bg-[#07130e] text-stone-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">ওয়াক্তের নাম</th>
                    <th className="py-3 px-4">আরবি নাম</th>
                    <th className="py-3 px-4">আযান / শুরু</th>
                    <th className="py-3 px-4">ওয়াক্ত শেষ</th>
                    <th className="py-3 px-4 text-right">জামা'আতের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80">
                  {PRAYER_TIMETABLE.map((p) => {
                    const isCurrent = currentPrayerItem?.id === p.id;
                    return (
                      <tr key={p.id} className={isCurrent ? "bg-emerald-50/80 dark:bg-emerald-950/40 font-bold" : ""}>
                        <td className="py-3.5 px-4 flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100">{p.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-2 py-0.2 rounded-md bg-[#0D7A5F] text-white font-bold">চলমান ওয়াক্ত</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-500">{p.arabic || "—"}</td>
                        <td className="py-3.5 px-4 font-mono">{p.start}</td>
                        <td className="py-3.5 px-4 font-mono text-stone-500">{p.end || "—"}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#0D7A5F] dark:text-emerald-400">
                          {p.jamaat}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Special Nafl Times */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                বিশেষ নফল সালাতের বরকতময় ওয়াক্ত:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40">
                  <b className="text-[#0D7A5F] dark:text-emerald-400 block">তাহাজ্জুদ সালাত ও সাহরী শেষ:</b>
                  <span className="text-stone-600 dark:text-stone-300 text-[11px]">রাত ০৩:৩০ AM থেকে ০৪:৪৫ AM (সুবহে সাদিক পর্যন্ত)।</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40">
                  <b className="text-[#0D7A5F] dark:text-emerald-400 block">ইশরাক সালাত:</b>
                  <span className="text-stone-600 dark:text-stone-300 text-[11px]">সূর্যোদয়ের ১৫ মিনিট পর (০৬:৩৫ AM) থেকে শুরু।</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40">
                  <b className="text-[#0D7A5F] dark:text-emerald-400 block">চাশত / সালাতুদ দুহা:</b>
                  <span className="text-stone-600 dark:text-stone-300 text-[11px]">সকাল ০৯:১৫ AM থেকে দ্বিপ্রহরের পূর্ব পর্যন্ত।</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. আমাদের মসজিদ (ABOUT US)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "about" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <span className="w-2 h-5 rounded-full bg-[#0D7A5F]"></span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                আমাদের মসজিদ সম্পর্কে পরিচিতি ও গৌরবোজ্জ্বল ইতিহাস
              </h3>
            </div>

            <div className="prose dark:prose-invert text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed">
              <p>
                <b>{currentMosqueName}</b> ১৯৯৮ সালে স্থানীয় দানশীল ও ধর্মপ্রাণ মুসল্লিদের সম্মিলিত প্রচেষ্টায় প্রতিষ্ঠিত হয়। গাজীপুর সিটি কর্পোরেশনের হাড়িনাল এলাকায় অবস্থিত এই মসজিদটি আজ অত্র অঞ্চলের অন্যতম বৃহৎ দ্বীনি মারকাজ হিসেবে সুপরিচিত।
              </p>
              <p>
                <b>আমাদের মূল লক্ষ্য ও উদ্দেশ্য:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>বিশুদ্ধ সুন্নাহ ভিত্তিক ৫ ওয়াক্ত সালাত ও জুমার জামা'আত নিয়মিত কায়েম রাখা।</li>
                <li>নতুন প্রজন্মের শিশুদের জন্য সহীহ নূরানী কায়দা ও নাযেরা কুরআন শিক্ষার ব্যবস্থা।</li>
                <li>এলাকার অসহায়, এতিম ও দরিদ্র পরিবারের মাঝে যাকাত ও ফিতরা সুষ্ঠুভাবে বিতরণ।</li>
                <li>মুসল্লিদের জন্য সাপ্তাহিক জুমার পূর্ববর্তী তাফসির ও দ্বীনি দিকনির্দেশনা প্রদান।</li>
                <li>১০০% স্বচ্ছ হিসাবরক্ষণ ও জবাবদিহিতামূলক মসজিদ পরিচালনা।</li>
              </ul>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. মসজিদ পরিচালনা কমিটি (COMMITTEE)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "committee" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Users className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদ পরিচালনা কার্যনির্বাহী কমিটি (২০২৫-২০২৭)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "মুহাম্মদ আব্দুল্লাহ", role: "সভাপতি", phone: "০১৭১১-২২৩৩৪৪", bio: "বিশিষ্ট ব্যবসায়ী ও সমাজসেবক" },
                { name: "হাজী রফিকুল ইসলাম", role: "সহ-সভাপতি", phone: "০১৮১৯-১১২২৩৩", bio: "দানশীল প্রতিষ্ঠাতা সদস্য" },
                { name: "জনাব শাহিনুর রহমান", role: "কোষাধ্যক্ষ", phone: "০১৭২১-৯৯৮৮৭৭", bio: "আর্থিক ও অডিট তত্ত্বাবধায়ক" },
                { name: "ইঞ্জি. মোস্তাফিজুর রহমান", role: "প্রধান উপদেষ্টা", phone: "০১৭৩৩-১১২২৪৪", bio: "মসজিদ নির্মাণ ও সংস্কার প্রধান" },
                { name: "আলহাজ্ব জয়নাল আবেদীন", role: "আজীবন সদস্য", phone: "০১৭৮৮-৩৩৪৪৫৫", bio: "ওয়াকফ সম্পদ তত্ত্বাবধায়ক" },
                { name: "ডা. আরিফুল ইসলাম", role: "যুগ্ম সম্পাদক", phone: "০১৫২১-৩৩৪৪৫৫", bio: "স্বাস্থ্য ও চিকিৎসা সেবা বিষয়ক" },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{c.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D7A5F] dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {c.role}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{c.bio}</p>
                  <p className="text-[11px] font-mono text-stone-400">যোগাযোগ: {c.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5. ইমাম ও খতিব পরিচিতি (SCHOLARS)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "scholars" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Award className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের খতীব, ইমাম ও মুয়াজ্জিন সাহেববৃন্দ
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { name: "মাওলানা মাহমুদ হাসান", role: "খতীব ও সিনিয়র ইমাম", degrees: "দাওরায়ে হাদীস (মাস্টার্স সমমান), তাকমীল ফিল ফিকহ", bio: "বিগত ৮ বছর ধরে সততা ও সুনামের সাথে জুমার খুতবা ও ৫ ওয়াক্ত সালাত পরিচালনা করছেন।" },
                { name: "হাফেজ ক্বারী নাজমুল হুদা", role: "সানি ইমাম ও মক্তব প্রধান", degrees: "হিফজুল কুরআন ও ক্বিরাআত স্পেশালিস্ট", bio: "নূরানী মক্তবের শিক্ষার্থীদের সরাসরি তাজবীদ ও মাখরাজ প্রশিক্ষণ দিয়ে থাকেন।" },
                { name: "মুহাম্মদ বিলাল হোসেন", role: "প্রধান মুয়াজ্জিন", degrees: "মুয়াজ্জিন ও ক্বারী", bio: "সুমিষ্ট কন্ঠে ৫ ওয়াক্ত আযান ও অজুখানা পরিষ্কার-পরিচ্ছন্নতা তত্ত্বাবধান করেন।" },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{s.name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0D7A5F] text-white font-bold">
                      {s.role}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#0D7A5F] dark:text-emerald-300">শিক্ষাগত যোগ্যতা: {s.degrees}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{s.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            6. দান করুন (ONLINE DONATION & REAL DIGITAL RECEIPT)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "donate" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Coins className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের তহবিলে অনলাইন দান করুন ও তাৎক্ষণিক ডিজিটাল রসিদ গ্রহণ করুন
              </h3>
            </div>

            {donationReceipt ? (
              /* DIGITAL MONEY RECEIPT */
              <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[#0D7A5F] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-300 dark:border-emerald-800">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D7A5F] text-white font-bold">অফিসিয়াল ডিজিটাল রসিদ</span>
                    <h4 className="text-base font-black text-emerald-950 dark:text-emerald-100 mt-1">
                      {currentMosqueName}
                    </h4>
                  </div>
                  <div className="text-right font-mono text-xs text-emerald-800 dark:text-emerald-300">
                    <div>রসিদ নং: {donationReceipt.receiptNo}</div>
                    <div className="text-[10px] text-stone-500">{donationReceipt.date} · {donationReceipt.timestamp}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">অনুদাতাগণ:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{donationReceipt.donor}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">মোবাইল:</span>
                    <p className="font-mono font-bold text-stone-900 dark:text-stone-100">{donationReceipt.phone}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">নির্দিষ্ট তহবিল:</span>
                    <p className="font-bold text-[#0D7A5F] dark:text-emerald-300">{donationReceipt.fund}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">পেমেন্ট মেথড:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{donationReceipt.method}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="text-base font-black text-[#0D7A5F] dark:text-emerald-300">
                    মোট প্রাপ্তি: ৳{donationReceipt.amount} (নগদ গৃহীত)
                  </div>
                  <button
                    type="button"
                    onClick={() => setDonationReceipt(null)}
                    className="px-4 py-2 rounded-xl bg-[#0D7A5F] text-white text-xs font-bold cursor-pointer"
                  >
                    আরেকটি অনুদান দিন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnlineDonate} className="space-y-4 max-w-xl mx-auto py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">অনুদানের পরিমাণ (টাকা):</label>
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonateAmount(amt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                          donateAmount === amt
                            ? "bg-[#0D7A5F] text-white border-[#0D7A5F]"
                            : "bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-emerald-900/50"
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="অন্যান্য পরিমাণ লিখুন"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">কোন ফান্ডে দিতে চান:</label>
                  <select
                    value={selectedFundId}
                    onChange={(e) => {
                      setSelectedFundId(e.target.value);
                      const f = FUNDS_LIST.find((fund) => fund.id === e.target.value);
                      if (f) setSelectedFundName(f.name);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-xs font-bold cursor-pointer"
                  >
                    {FUNDS_LIST.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">পেমেন্ট মেথড:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-xs font-bold cursor-pointer"
                  >
                    <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                    <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                    <option value="রকেট (Rocket)">রকেট (Rocket)</option>
                    <option value="ব্যাংক ট্রান্সফার (Bank)">ব্যাংক ট্রান্সফার (Bank)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">আপনার নাম:</label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={isAnonymous ? "গোপন দাতা" : "আপনার নাম লিখুন"}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">মোবাইল নম্বর:</label>
                    <input
                      type="tel"
                      disabled={isAnonymous}
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder={isAnonymous ? "গোপন" : "০১৭XX-XXXXXX"}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-xs font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded-sm text-[#0D7A5F] focus:ring-0"
                  />
                  <span>নাম প্রকাশে অনিচ্ছুক (গোপন সাদাকাহ)</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>দান সম্পন্ন করুন ও রসিদ নিন</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            7. জরুরি নোটিশ (NOTICES)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <FileText className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের অফিশিয়াল নোটিশ বোর্ড ও জরুরি ঘোষণা
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { title: "পবিত্র জুমার সালাতের সময়সূচি ও নির্ধারিত খুতবা", date: "১৫ নভেম্বর ২০২৬", content: "আগামী জুমার বয়ান দুপুর ০১:০০ PM এবং জামা'আত ০১:৩০ PM এ অনুষ্ঠিত হবে। মুসল্লিদের সময়মত উপস্থিতির অনুরোধ করা হলো।" },
                { title: "মসজিদের ৩য় তলার ছাদ ঢালাইয়ের অনুদান আহ্বান", date: "১০ নভেম্বর ২০২৬", content: "আলহামদুলিল্লাহ, ৩য় তলার সেন্টারিং সম্পন্ন হয়েছে। দ্রুত ছাদ ঢালাইয়ের জন্য দানশীল ভাইদের উদার অনুদান কামনা করছি।" },
                { title: "শিশু-কিশোর নূরানী কুরআন মক্তবে নতুন ভর্তি চলছে", date: "০১ নভেম্বর ২০২৬", content: "প্রতিদিন সকাল ৬:৩০ থেকে ৮:০০ টা পর্যন্ত অভিজ্ঞ হাফেজ সাহেবদের তত্ত্বাবধানে বিশুদ্ধ কুরআন শিক্ষা দেওয়া হয়।" },
              ].map((n, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{n.title}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">{n.date}</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            8. কার্যক্রম ও মক্তব (ACTIVITIES)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "activities" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <BookOpen className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                নিয়মিত দ্বীনি, সামাজিক ও শিক্ষামূলক কার্যক্রম
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { title: "নূরানী কুরআন মক্তব (শিশু বিভাগ)", time: "প্রতিদিন সকাল ৬:৩০ - ৮:০০ AM", desc: "স্কুলগামী শিশুদের তাজবীদ সহকারে কুরআন শিক্ষা ও মাসয়ালা-মাসায়েল প্রশিক্ষণ।" },
                { title: "বয়স্ক কুরআন শিক্ষা ক্লাস", time: "প্রতি শনি ও মঙ্গলবার এশার পর", desc: "কর্মজীবী ভাইদের বিশুদ্ধ কুরআন তিলাওয়াত ও সালাত বিশুদ্ধকরণ ক্লাস।" },
                { title: "সাপ্তাহিক তাফসীরুল কুরআন মাহফিল", time: "প্রতি বৃহস্পতিবার এশার পর", desc: "প্রধান খতিব সাহেব কর্তৃক কুরআনের ধারাবাহিক আয়াতের বিশ্লেষণ ও জীবনঘনিষ্ঠ আলোচনা।" },
                { title: "দরিদ্র ও চিকিৎসা সহায়তা কার্যক্রম", time: "মাসের শেষ শুক্রবার", desc: "যাকাত ও সমাজকল্যাণ ফান্ড থেকে অস্বচ্ছল পরিবারদের মাঝে আর্থিক অনুদান বিতরণ।" },
              ].map((act, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{act.title}</h4>
                  <span className="text-[11px] font-mono text-[#0D7A5F] dark:text-emerald-400 block">{act.time}</span>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            9. ছবি ও ভিডিও (GALLERY)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "gallery" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <ImageIcon className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের স্থাপত্য, সালাত ও দ্বীনি মাহফিলের গ্যালারি
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: "প্রধান সালাত হল", label: "মার্বেল মেঝে ও সেন্ট্রাল এসি" },
                { title: "দৃষ্টিনন্দন মিনার", label: "ঐতিহাসিক ইসলামিক নকশা" },
                { title: "আধুনিক অজুখানা", label: "স্বচ্ছ বিশুদ্ধ পানির ব্যবস্থা" },
                { title: "জুমার উপচেপড়া ভিড়", label: "মুসল্লিদের আবেগঘন সালাত" },
                { title: "নূরানী মক্তবের শিশু", label: "কুরআন শিক্ষা ক্লাস" },
                { title: "রমজানের গণ-ইফতার", label: "প্রতিদিন ৫০০ মুসল্লির ইফতার" },
              ].map((g, idx) => (
                <div key={idx} className="rounded-2xl bg-emerald-950/20 border border-emerald-900/30 p-4 text-center space-y-1 flex flex-col items-center justify-center h-32">
                  <Landmark className="w-8 h-8 text-[#0D7A5F] mb-1" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{g.title}</span>
                  <span className="text-[10px] text-stone-500">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            10. যোগাযোগ (CONTACT)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "contact" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Phone className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদ কমপ্লেক্সের সাথে যোগাযোগ ও অনুসন্ধান
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#0D7A5F] shrink-0 mt-0.5" />
                    <div>
                      <b className="block text-stone-900 dark:text-stone-100">ঠিকানা:</b>
                      <span className="text-stone-600 dark:text-stone-300">{currentAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0D7A5F] shrink-0" />
                    <div>
                      <b className="inline text-stone-900 dark:text-stone-100">ফোন / হেল্পলাইন: </b>
                      <span className="font-mono text-stone-600 dark:text-stone-300">{mosque?.phone || "০১৭১১-২২৩৩৪৪"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0D7A5F] shrink-0" />
                    <div>
                      <b className="inline text-stone-900 dark:text-stone-100">ইমেইল: </b>
                      <span className="font-mono text-stone-600 dark:text-stone-300">{mosque?.email || "info@baitunnoor.org"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-[#0D7A5F]/30 flex flex-col items-center justify-center text-center h-36">
                  <MapPin className="w-8 h-8 text-[#0D7A5F] mb-1 animate-bounce" />
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100">গুগল ম্যাপে মসজিদ অবস্থান</span>
                  <span className="text-[10px] text-stone-500">২৩.৯৯৮৮° উত্তর, ৯০.৪২০৫° পূর্ব</span>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[11px] font-bold text-[#0D7A5F] hover:underline"
                  >
                    গুগল ম্যাপে ওপেন করুন ➔
                  </a>
                </div>
              </div>

              {/* Contact Message Form */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  কমিটিকে বার্তা পাঠান বা পরামর্শ দিন:
                </h4>

                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    ✅ ধন্যবাদ! আপনার বার্তাটি রেকর্ড করা হয়েছে।
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="আপনার নাম"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="মোবাইল নম্বর"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50"
                      required
                    />
                    <textarea
                      placeholder="আপনার বার্তা বা পরামর্শ লিখুন..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50"
                      required
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>বার্তা পাঠান</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="text-center py-6 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/80 dark:border-emerald-950/80 space-y-1">
          <p>© ২০২৬ {currentMosqueName} · সর্বস্বত্ব সংরক্ষিত</p>
          <p className="text-[10px] text-stone-400">
            পাওয়ার্ড বাই <span className="font-bold text-[#0D7A5F] dark:text-emerald-400">Edusaas ডিজিটাল মসজিদ প্ল্যাটফর্ম</span> (edusaas.global)
          </p>
        </footer>
      </div>

      {/* ── MODALS: ROLE-BASED LOGIN & MONTHLY CALENDAR ── */}
      <MosqueLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        mosqueName={currentMosqueName}
        members={members}
      />

      <MonthlyPrayerCalendarModal
        isOpen={isMonthlyCalendarOpen}
        onClose={() => setIsMonthlyCalendarOpen(false)}
        mosqueName={currentMosqueName}
        location={currentAddress}
      />
    </div>
  );
}

export default PublicMosqueWebsite;
