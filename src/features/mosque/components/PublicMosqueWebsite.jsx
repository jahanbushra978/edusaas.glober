"use client";

import React, { useState } from "react";
import {
  Building2,
  Clock,
  Calendar,
  Heart,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Users,
  Coins,
  Receipt,
  FileText,
  Search,
  ExternalLink,
  LogIn,
  CheckCircle2,
  Globe,
  Share2,
  ChevronRight,
  ShieldCheck,
  Printer,
  X,
  GraduationCap,
  Sparkles,
  Landmark,
  Image as ImageIcon,
  Video,
  Send,
  HelpCircle,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { recordDonationInDatabase, getMosqueDatabase } from "../services/mosqueStorage";

/**
 * 1. মসজিদের পাবলিক ওয়েবসাইট (10 Canonical Pages / Sections)
 * 
 * 1. হোম (Home): মসজিদের পরিচিতি, গুরুত্বপূর্ণ ঘোষণা, নামাজের সময় কাউন্টডাউন
 * 2. আমাদের মসজিদ (About): ইতিহাস, প্রতিষ্ঠাতা, লক্ষ্য ও উদ্দেশ্য
 * 3. নামাজের সময় (Prayer times): ফজর, যোহর, আসর, মাগরিব, এশা ও জামাতের সময়
 * 4. কমিটি (Committee): সভাপতি, সেক্রেটারি, কোষাধ্যক্ষ ও কমিটির পরিচিতি
 * 5. ইমাম ও খতিব (Scholars): ইমাম, খতিব, মুয়াজ্জিনের পরিচিতি ও শিক্ষাগত যোগ্যতা
 * 6. দান করুন (Donate): সাধারণ অনুদান, নির্মাণ, যাকাত, সদকা ও অন্যান্য ফান্ডে অনলাইন দান ও ডিজিটাল রসিদ
 * 7. নোটিশ (Notices): জরুরি ঘোষণা, জুমার নোটিশ, রমজানের সময়সূচি
 * 8. কার্যক্রম (Activities): ইসলামি আলোচনা, তাফসির, মাহফিল, প্রশিক্ষণ
 * 9. ছবি ও ভিডিও (Gallery): মসজিদের ছবি, অনুষ্ঠান ও ভিডিও গ্যালারি
 * 10. যোগাযোগ (Contact): ঠিকানা, ফোন, গুগল ম্যাপ ও যোগাযোগ ফর্ম
 */

export function PublicMosqueWebsite({
  mosque,
  schedule,
  currentPrayer,
  countdown,
  nextJamaatText,
  onOpenLogin,
  onOpenDiscovery,
  onOpenCustomDomain,
  onOpenMaktab,
}) {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "about" | "prayer" | "committee" | "scholars" | "donate" | "notices" | "activities" | "gallery" | "contact"
  
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

    // Real persistence into mosque database via mosqueStorage!
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
    toast.success("মাশাআল্লাহ! অনুদানটি সফলভাবে গৃহীত হয়েছে এবং সংশ্লিষ্ট ফান্ডে ব্যালেন্স যুক্ত হয়েছে।");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    toast.success("আপনার বার্তাটি মসজিদ কমিটির কাছে সফলভাবে পাঠানো হয়েছে। জাযাকাল্লাহু খাইরান!");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* ── TOP UTILITY TICKER ── */}
      <div className="bg-[#064E3B] text-emerald-100 text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>পবিত্র জুমার জামা'আত: ০১:৩০ PM · সকল মুসল্লিদের প্রতি আমন্ত্রণ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono hidden sm:inline">আজকের হিজরি: ২২ জমাদিউল আউয়াল ১৪৪৮</span>
          <button
            onClick={onOpenCustomDomain}
            className="hover:underline flex items-center gap-1 cursor-pointer text-emerald-200"
          >
            <Globe className="w-3 h-3" />
            <span>{mosque?.customDomain || "baitunnoormasjid.org"}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTAINER ── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 space-y-4">
        {/* ── MAIN HEADER & NAVIGATION ── */}
        <header className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Mosque Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#0D7A5F] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                {mosque?.logoLetter || "বা"}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black text-stone-900 dark:text-stone-100 truncate">
                  {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}
                </h1>
                <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0D7A5F] shrink-0" />
                  <span className="truncate">{mosque?.address || "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন"}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenDiscovery}
                className="p-2.5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition cursor-pointer"
                title="অন্যান্য মসজিদ খুঁজুন"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab("donate")}
                className="px-3.5 py-2 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>দান করুন</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 rounded-2xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>প্রশাসনিক ERP</span>
              </button>
            </div>
          </div>

          {/* 10 Canonical Navigation Tabs */}
          <nav className="flex gap-1 overflow-x-auto scrollbar-none pt-2 border-t border-stone-100 dark:border-emerald-950/80 text-xs">
            {[
              { key: "home", label: "হোম" },
              { key: "about", label: "আমাদের মসজিদ" },
              { key: "prayer", label: "নামাজের সময়" },
              { key: "committee", label: "কমিটি" },
              { key: "scholars", label: "ইমাম ও খতিব" },
              { key: "donate", label: "দান করুন" },
              { key: "notices", label: "নোটিশ" },
              { key: "activities", label: "কার্যক্রম" },
              { key: "gallery", label: "ছবি ও ভিডিও" },
              { key: "contact", label: "যোগাযোগ" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
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
            1. হোম পেজ (HOME PAGE)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "home" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Grand Islamic Hero Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0D7A5F] to-[#0f6850] text-white shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Landmark className="w-4 h-4 text-emerald-200" />
                  <span>আল্লাহর ঘর পরিচালনা ও সামাজিক কল্যাণ কেন্দ্র</span>
                </span>
                <span className="font-mono bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  প্রতিষ্ঠা: {mosque?.established || "১৯৯৮"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
                পবিত্র কুরআন ও সুন্নাহর আলোয় আলোকিত একটি আদর্শ মসজিদ ও দ্বীনি সমাজ বিনির্মাণের লক্ষ্যে পরিচালিত হচ্ছে। এখানে রয়েছে ৫ ওয়াক্ত জামা'আত, শিশু-কিশোরদের নূরানী মক্তব ও মানবিক সহায়তা কার্যক্রম।
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/20">
                <button
                  onClick={() => setActiveTab("donate")}
                  className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Coins className="w-4 h-4" />
                  <span>মসজিদে অনলাইন দান করুন</span>
                </button>
                <button
                  onClick={() => setActiveTab("prayer")}
                  className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>নামাজের সময়সূচি</span>
                </button>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <LogIn className="w-4 h-4" />
                  <span>সদস্য লগইন / ড্যাশবোর্ড</span>
                </button>
              </div>
            </div>

            {/* Live Prayer Waqt Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#0D7A5F] dark:text-emerald-400">
                    {currentPrayer?.name || "আসর"} ওয়াক্ত চলমান
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 mt-0.5">
                    {nextJamaatText}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold text-amber-600 font-mono">
                    {countdown}
                  </span>
                  <p className="text-[10px] text-stone-400">পরবর্তী জামা'আত বাকি</p>
                </div>
              </div>

              {/* 5 Waqt Timetable */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/80 text-center">
                {schedule?.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-2xl ${
                      currentPrayer?.id === p.id
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border border-[#0D7A5F]"
                        : "bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40"
                    }`}
                  >
                    <div className="text-xs font-black text-stone-900 dark:text-stone-100">{p.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">আযান: {p.start}</div>
                    <div className="text-xs font-mono font-bold text-[#0D7A5F] dark:text-emerald-400 mt-0.5">জামাত: {p.jamaat}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab("about")}
                className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs cursor-pointer hover:border-[#0D7A5F] transition"
              >
                <Building2 className="w-6 h-6 text-[#0D7A5F] mb-2" />
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">আমাদের মসজিদ</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">মসজিদের ইতিহাস, প্রতিষ্ঠাতা ও দ্বীনি লক্ষ্য-উদ্দেশ্য জানুন।</p>
              </div>

              <div
                onClick={() => setActiveTab("activities")}
                className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs cursor-pointer hover:border-[#0D7A5F] transition"
              >
                <BookOpen className="w-6 h-6 text-[#0D7A5F] mb-2" />
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">মক্তব ও শিক্ষা</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">নূরানী কায়দা, কুরআন ক্লাস ও নিয়মিত দ্বীনি তালিম।</p>
              </div>

              <div
                onClick={() => setActiveTab("notices")}
                className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs cursor-pointer hover:border-[#0D7A5F] transition"
              >
                <FileText className="w-6 h-6 text-[#0D7A5F] mb-2" />
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">জরুরি নোটিশ</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">জুমার খুতবার বিষয়বস্তু, মাহফিল ও রমজানের সময়সূচি।</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. আমাদের মসজিদ (ABOUT US)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "about" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <span className="w-2 h-5 rounded-full bg-[#0D7A5F]"></span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                আমাদের মসজিদ সম্পর্কে পরিচিতি ও ইতিহাস
              </h3>
            </div>

            <div className="prose dark:prose-invert text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed">
              <p>
                <b>{mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}</b> ১৯৯৮ সালে স্থানীয় দানশীল ও ধর্মপ্রাণ মুসল্লিদের সম্মিলিত প্রচেষ্টায় প্রতিষ্ঠিত হয়। গাজীপুর সিটি কর্পোরেশনের হাড়িনাল এলাকায় অবস্থিত এই মসজিদটি আজ অত্র অঞ্চলের অন্যতম বৃহৎ দ্বীনি মারকাজ হিসেবে পরিচিত।
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
            3. নামাজের সময়সূচি (PRAYER TIMES)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "prayer" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0D7A5F]" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  ৫ ওয়াক্ত সালাত ও জামা'আতের নির্ভুল সময়সূচি
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                গাজীপুর স্ট্যান্ডার্ড টাইম
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 dark:bg-[#07130e] text-stone-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">ওয়াক্তের নাম</th>
                    <th className="py-2.5 px-3">আরবি নাম</th>
                    <th className="py-2.5 px-3">ওয়াক্ত শুরু</th>
                    <th className="py-2.5 px-3">ওয়াক্ত শেষ</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">জামা'আতের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80">
                  {schedule?.map((p) => (
                    <tr key={p.id} className={currentPrayer?.id === p.id ? "bg-emerald-50/70 dark:bg-emerald-950/40 font-bold" : ""}>
                      <td className="py-3 px-3 flex items-center gap-2">
                        {p.name}
                        {currentPrayer?.id === p.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#0D7A5F] text-white">চলমান</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-500">{p.arabic || "—"}</td>
                      <td className="py-3 px-3 font-mono">{p.start}</td>
                      <td className="py-3 px-3 font-mono text-stone-500">{p.end || "—"}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0D7A5F] dark:text-emerald-400">{p.jamaat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}
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

                <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">গৃহীত মোট অনুদান:</span>
                  <span className="text-xl font-black text-[#0D7A5F] font-mono">৳{donationReceipt.amount.toLocaleString("bn-BD")}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>রসিদ প্রিন্ট / ডাউনলোড করুন</span>
                  </button>
                  <button
                    onClick={() => setDonationReceipt(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs cursor-pointer"
                  >
                    নতুন অনুদান
                  </button>
                </div>
              </div>
            ) : (
              /* DONATION FORM */
              <form onSubmit={handleOnlineDonate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    অনুদানের পরিমাণ (টাকা):
                  </label>
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonateAmount(amt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                          donateAmount === amt
                            ? "bg-[#0D7A5F] text-white border-[#0D7A5F]"
                            : "bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-emerald-900/40"
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
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#0D7A5F]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    কোন ফান্ডে দান করতে চান?
                  </label>
                  <select
                    value={selectedFundId}
                    onChange={(e) => {
                      setSelectedFundId(e.target.value);
                      const f = FUNDS_LIST.find((item) => item.id === e.target.value);
                      if (f) setSelectedFundName(f.name);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#0D7A5F]"
                  >
                    {FUNDS_LIST.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      আপনার নাম:
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={isAnonymous ? "গোপন দাতা হিসেবে জমা হবে" : "যেমন: মুহাম্মদ করিম"}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      মোবাইল নম্বর (রসিদের জন্য):
                    </label>
                    <input
                      type="tel"
                      disabled={isAnonymous}
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="০১৭১১-XXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded-sm text-[#0D7A5F] focus:ring-[#0D7A5F]"
                  />
                  <label htmlFor="anonCheck" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                    নাম গোপন রাখতে চাই (সাদাকাহে জারিয়াহ)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>দান সম্পন্ন করুন এবং ডিজিটাল রসিদ গ্রহণ করুন</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            7. নোটিশ ও ঘোষণা (NOTICES)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <FileText className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের অফিসিয়াল নোটিশ বোর্ড ও ঘোষণা
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { title: "আগামী জুমার বিশেষ খুতবা: পিতা-মাতার হক ও সুন্নাহর মর্যাদা", date: "২০ নভেম্বর ২০২৬", tag: "জুমা খুতবা", desc: "সকল ধর্মপ্রাণ মুসল্লি ভাইদেরকে দুপুর ১২:৩০ মিনিটের মধ্যে মসজিদে উপস্থিত হয়ে খুতবা শোনার অনুরোধ করা হলো।" },
                { title: "মক্তবের নতুন সেশনে শিক্ষার্থী ভর্তি চলছে", date: "১৫ নভেম্বর ২০২৬", tag: "মক্তব শিক্ষা", desc: "শিশু-কিশোর ও বয়স্কদের জন্য বিশুদ্ধ কুরআন পাঠের নতুন ব্যাচে সীমিত আসনে ভর্তি শুরু হয়েছে।" },
                { title: "মসজিদ সম্প্রসারণ ও দ্বিতীয় তলার ছাদ ঢালাইয়ের উন্মুক্ত হিসাব প্রকাশ", date: "০১ নভেম্বর ২০২৬", tag: "আর্থিক নোটিশ", desc: "নির্মাণ ফান্ডের সকল আয়-ব্যয়ের স্বচ্ছ ভাউচার নোটিশ বোর্ডে ও অনলাইন ড্যাশবোর্ডে উন্মুক্ত করা হয়েছে।" },
              ].map((n, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0D7A5F] dark:text-emerald-300 font-bold">
                      {n.tag}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{n.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{n.title}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            8. কার্যক্রম ও প্রোগ্রাম (ACTIVITIES)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "activities" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Calendar className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদের নিয়মিত ইসলামি কার্যক্রম ও সেবা
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "সাপ্তাহিক তাফসিরুল কুরআন", time: "প্রতি বৃহস্পতিবার মাগরিব বাদ", desc: "খতীব সাহেবের পরিচালনায় নির্বাচিত সূরার ধারাবাহিক তাফসির ও প্রশ্নোত্তর।" },
                { title: "শিশু-কিশোর নূরানী মক্তব", time: "প্রতিদিন সকাল ০৬:৩০ – ০৭:৩০ AM", desc: "সহীহ নূরানী কায়দা, মাসনূন দোয়া ও নামাজের প্র্যাকটিকাল প্রশিক্ষণ।" },
                { title: "বয়স্কদের সহীহ কুরআন শিক্ষা", time: "প্রতি শনিবার ও সোমবার এশা বাদ", desc: "কর্মজীবী ভাইদের জন্য বিনামূল্যে বিশুদ্ধ উচ্চারণ ও মাখরাজ শেখার সুযোগ।" },
                { title: "ফ্রি চিকিৎসা ও ওষুধ বিতরণ ক্যাম্প", time: "মাসের শেষ শুক্রবার", desc: "মুসলিম ও অমুসলিম সকলের জন্য বিনামূল্যে ডাক্তার পরামর্শ ও প্রাথমিক ওষুধ।" },
              ].map((act, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{act.title}</h4>
                  <p className="text-[11px] font-bold text-[#0D7A5F] dark:text-emerald-400">সময়: {act.time}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            9. ছবি ও ভিডিও গ্যালারি (GALLERY)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "gallery" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <ImageIcon className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদ ও কমপ্লেক্সের ছবি ও ভিডিও গ্যালারি
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: "মসজিদের মূল মিনার ও গম্বুজ", category: "স্থাপত্য" },
                { title: "জুমার নামাজের প্রধান জামাত হল", category: "জামাত" },
                { title: "আধুনিক ওজুখানা কমপ্লেক্স", category: "সুবিধা" },
                { title: "মক্তবের শিক্ষার্থীদের তিলাওয়াত ক্লাস", category: "শিক্ষা" },
                { title: "দ্বিতীয় তলা সম্প্রসারণের ছাদ ঢালাই", category: "নির্মাণ" },
                { title: "পবিত্র ঈদুল ফিতরের বিশাল জামাত", category: "অনুষ্ঠান" },
              ].map((img, idx) => (
                <div key={idx} className="group p-3 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-2">
                  <div className="w-full h-28 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-white/50 group-hover:text-white transition">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#0D7A5F] font-bold">{img.category}</span>
                    <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{img.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            10. যোগাযোগ ও গুগল ম্যাপ (CONTACT)
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === "contact" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <Phone className="w-5 h-5 text-[#0D7A5F]" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                মসজিদ কমিটির সাথে সরাসরি যোগাযোগ ও অবস্থান
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address details */}
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#0D7A5F] shrink-0 mt-0.5" />
                    <div>
                      <b className="block text-stone-900 dark:text-stone-100">ঠিকানা:</b>
                      <span className="text-stone-600 dark:text-stone-300">{mosque?.address || "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন, ঢাকা, বাংলাদেশ"}</span>
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

                {/* Simulated Google Map Tile */}
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
        <footer className="text-center py-6 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/80 dark:border-emerald-950/80">
          <p>© ২০২৬ {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"} · সর্বস্বত্ব সংরক্ষিত</p>
          <p className="text-[10px] text-stone-400 mt-1">
            পাওয়ার্ড বাই রহমনিয়া ইন্সটিটিউট মাল্টি-টেন্যান্ট মসজিদ ইআরপি প্ল্যাটফর্ম
          </p>
        </footer>
      </div>
    </div>
  );
}

export default PublicMosqueWebsite;
