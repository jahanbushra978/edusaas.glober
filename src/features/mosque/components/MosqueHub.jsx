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
  Filter,
  Printer,
  Lock,
  Globe,
  LogIn,
  ShoppingBag,
  Wrench,
  Landmark,
  Utensils,
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
import { SuperAppModal } from "./modals/SuperAppModal";
import { Admin360Modal } from "./modals/Admin360Modal";
import { SuperAdminModal } from "./modals/SuperAdminModal";
import { ImamMealRosterModal } from "./modals/ImamMealRosterModal";
import { PurchaseProcurementModal } from "./modals/PurchaseProcurementModal";
import { EmployeeSalaryModal } from "./modals/EmployeeSalaryModal";
import { AssetInventoryModal } from "./modals/AssetInventoryModal";
import { CommunityWelfareModal } from "./modals/CommunityWelfareModal";
import { CustomDomainModal } from "./modals/CustomDomainModal";
import { MosqueDiscoveryModal } from "./modals/MosqueDiscoveryModal";
import { MosqueRegistrationModal } from "./modals/MosqueRegistrationModal";
import { PublicMosqueWebsite } from "./PublicMosqueWebsite";
import { MosqueModuleCenter } from "./MosqueModuleCenter";

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

export default function MosqueHub({ onOpenQuranReader, onOpenTutor, onNavigateBack }) {
  // Operating View Mode: "erp" (Admin & Member portal) vs "public" (Public website without login)
  const [viewMode, setViewMode] = useState("erp");

  // Multi-Tenant Active Mosque Context
  const [currentMosque, setCurrentMosque] = useState({
    id: "MAS-2026-0001",
    name: "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
    slug: "baitun-noor",
    district: "গাজীপুর",
    address: "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন",
    established: "১৯৯৮",
    membersCount: 25,
    logoLetter: "বা",
    customDomain: "baitunnoormasjid.org",
  });

  // 5 Canonical Tabs from mosque/AGENT.md
  // "dashboard" | "months" | "expenses" | "members" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("নভেম্বর ২০২৬");

  // Settings state (from mosque/AGENT.md Section 6)
  const [showContributors, setShowContributors] = useState(false); // privacy toggle
  const [requireVerification, setRequireVerification] = useState(true);

  // Prayer time tracking
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [currentPrayer, setCurrentPrayer] = useState(DEFAULT_SCHEDULE[2]); // Default Asr
  const [countdown, setCountdown] = useState("৪৫ মিনিট বাকি");
  const [nextJamaatText, setNextJamaatText] = useState("মাগরিব শুরু: ০৫:৩৮ PM");
  const [showFullSchedule, setShowFullSchedule] = useState(true);

  // Year switcher for Months
  const [selectedYear, setSelectedYear] = useState(2026);

  // Members Management state
  const [membersTab, setMembersTab] = useState("all"); // "all" | "me"
  const [memberSearch, setMemberSearch] = useState("");
  const [membersList, setMembersList] = useState([
    { id: "M-101", name: "মুহাম্মদ আব্দুল্লাহ", phone: "০১৭১১-২২৩৩৪৪", role: "সভাপতি", status: "ACTIVE", pledge: 2000, paid: 2000, remaining: 0, loginId: "member01" },
    { id: "M-102", name: "হাজী রফিকুল ইসলাম", phone: "০১৮১৯-১১২২৩৩", role: "সহ-সভাপতি", status: "ACTIVE", pledge: 1500, paid: 1500, remaining: 0, loginId: "member02" },
    { id: "M-103", name: "মাওলানা মাহমুদ হাসান", phone: "০১৯১১-৪৪৫৫৬৬", role: "খতীব ও ইমাম", status: "ACTIVE", pledge: 1000, paid: 1000, remaining: 0, loginId: "member03" },
    { id: "M-104", name: "জনাব শাহিনুর রহমান", phone: "০১৭২১-৯৯৮৮৭৭", role: "কোষাধ্যক্ষ", status: "ACTIVE", pledge: 1000, paid: 500, remaining: 500, loginId: "member04" },
    { id: "M-105", name: "ডা. আরিফুল ইসলাম", phone: "০১৫২১-৩৩৪৪৫৫", role: "সাধারণ সদস্য", status: "PENDING", pledge: 2000, paid: 0, remaining: 2000, loginId: "member05" },
    { id: "M-106", name: "মো. কামরুল হাসান", phone: "০১৮১২-৫৬৭৮৯০", role: "সাধারণ সদস্য", status: "ACTIVE", pledge: 1000, paid: 1000, remaining: 0, loginId: "member06" },
    { id: "M-107", name: "ইঞ্জি. মোস্তাফিজুর রহমান", phone: "০১৭৩৩-১১২২৪৪", role: "উপদেষ্টা", status: "ACTIVE", pledge: 3000, paid: 3000, remaining: 0, loginId: "member07" },
    { id: "M-108", name: "ফারুক আহমেদ", phone: "০১৯২২-৮৮৯৯০০", role: "সাধারণ সদস্য", status: "PENDING", pledge: 500, paid: 0, remaining: 500, loginId: "member08" },
    { id: "M-109", name: "আলহাজ্ব জয়নাল আবেদীন", phone: "০১৭৮৮-৩৩৪৪৫৫", role: "সদস্য", status: "ACTIVE", pledge: 1500, paid: 1500, remaining: 0, loginId: "member09" },
    { id: "M-110", name: "মো. হাফিজুর রহমান", phone: "০১৮৩৩-৪৪৩৩২২", role: "সদস্য", status: "ACTIVE", pledge: 800, paid: 800, remaining: 0, loginId: "member10" },
  ]);

  // Expenses state
  const [expenseFilter, setExpenseFilter] = useState("ALL"); // ALL | PENDING | APPROVED | PAID | REJECTED
  const [expensesList, setExpensesList] = useState([
    {
      id: "VCH-2026-089",
      category: "সাউন্ড সিস্টেম",
      title: "মাইক ও আইপিএস ব্যাটারি মেরামত ও এসিড চার্জ",
      fund: "সাধারণ পরিচালন ফান্ড",
      amount: 12500,
      submittedBy: "খতীব মাওলানা মাহমুদ হাসান",
      spentAt: "১২ নভেম্বর ২০২৬",
      status: "PENDING_APPROVAL",
      overdue: true,
      voucherNo: "#VCH-089",
      notes: "জুমার নামাজের পূর্বে সাউন্ড সিস্টেম ঠিক করার জরুরি বিল।",
    },
    {
      id: "VCH-2026-088",
      category: "পরিষ্কার-পরিচ্ছন্নতা",
      title: "মসজিদের অজুখানা ও ওয়াশরুম ক্লিনার ও সামগ্রী ক্রয়",
      fund: "সাধারণ পরিচালন ফান্ড",
      amount: 3200,
      submittedBy: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      spentAt: "০৮ নভেম্বর ২০২৬",
      status: "PAID",
      overdue: false,
      voucherNo: "#VCH-088",
      notes: "অনুমোদিত ও ক্যাশ পরিশোধিত।",
    },
    {
      id: "VCH-2026-087",
      category: "উন্নয়ন কাজ",
      title: "দ্বিতীয় তলার ছাদ ঢালাইয়ের রড ও সিমেন্ট বিল",
      fund: "নির্মাণ ও সংস্কার ফান্ড",
      amount: 45000,
      submittedBy: "ইঞ্জি. মোস্তাফিজুর রহমান",
      spentAt: "০৩ নভেম্বর ২০২৬",
      status: "PAID",
      overdue: false,
      voucherNo: "#VCH-087",
      notes: "চেক নং #৯৮৭৬৩৪৫ মাধ্যমে পরিশোধিত।",
    },
    {
      id: "VCH-2026-086",
      category: "বিদ্যুৎ বিল",
      title: "অক্টোবর মাসের মসজিদ ও মক্তবের বিদ্যুৎ বিল পরিশোধ",
      fund: "সাধারণ পরিচালন ফান্ড",
      amount: 8750,
      submittedBy: "মুহাম্মদ আব্দুল্লাহ (সভাপতি)",
      spentAt: "০১ নভেম্বর ২০২৬",
      status: "APPROVED",
      overdue: false,
      voucherNo: "#VCH-086",
      notes: "অনুমোদিত, কোষাধ্যক্ষ পরিশোধের অপেক্ষায়।",
    },
  ]);

  // Dynamic roles state (from mosque/AGENT.md Section 4)
  const [rolesList, setRolesList] = useState([
    { id: "role-1", name: "সভাপতি (President)", isSystem: true, permissions: ["roles.manage", "members.manage", "finance.view_all", "expenses.approve"] },
    { id: "role-2", name: "কোষাধ্যক্ষ (Treasurer)", isSystem: true, permissions: ["payments.record", "finance.view_all", "expenses.pay", "members.view"] },
    { id: "role-3", name: "ইমাম ও খতীব (Imam)", isSystem: true, permissions: ["expenses.submit", "members.view"] },
    { id: "role-4", name: "সাধারণ সদস্য (General Member)", isSystem: true, permissions: ["members.view"] },
  ]);

  // Load persisted schedule & settings
  useEffect(() => {
    try {
      const savedDist = localStorage.getItem("mosque_district");
      if (savedDist) {
        setCurrentMosque((prev) => ({ ...prev, district: savedDist }));
      }

      const savedName = localStorage.getItem("mosque_custom_name");
      if (savedName) {
        setCurrentMosque((prev) => ({ ...prev, name: savedName }));
      }

      const savedSched = localStorage.getItem("mosque_prayer_schedule");
      if (savedSched) {
        const parsed = JSON.parse(savedSched);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setSchedule(parsed);
        }
      }

      const savedShow = localStorage.getItem("mosque_show_contributors");
      if (savedShow !== null) setShowContributors(savedShow === "true");
    } catch {}
  }, []);

  // Live timer calculation for prayer countdown
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      const active = schedule.find((p) => currentMins >= p.startMins && currentMins < p.endMins) || schedule[4];
      setCurrentPrayer(active);

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

  const handleToggleContributors = (val) => {
    setShowContributors(val);
    try {
      localStorage.setItem("mosque_show_contributors", String(val));
    } catch {}
    toast.success(
      val
        ? "দাতার তালিকা উন্মুক্ত: সকল সদস্য অন্যদের চাঁদার তথ্য দেখতে পারবেন"
        : "দাতার তালিকা গোপন: সাধারণ সদস্যরা শুধু মোট অঙ্ক ও নিজের হিসাব দেখতে পাবেন"
    );
  };

  // 12 Months Overview Data
  const ALL_MONTHS_OVERVIEW = [
    { period: "জানুয়ারি ২০২৬", short: "জানু", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "ফেব্রুয়ারি ২০২৬", short: "ফেব", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "মার্চ ২০২৬ (রমজান)", short: "মার্চ", expected: 95000, collected: 95000, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "এপ্রিল ২০২৬", short: "এপ্রিল", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "মে ২০২৬", short: "মে", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "জুন ২০২৬", short: "জুন", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "জুলাই ২০২৬", short: "জুলাই", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "আগস্ট ২০২৬", short: "আগস্ট", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "সেপ্টেম্বর ২০২৬", short: "সেপ্টে", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "অক্টোবর ২০২৬", short: "অক্টো", expected: 78500, collected: 78500, remaining: 0, paidCount: 25, totalMembers: 25 },
    { period: "নভেম্বর ২০২৬ (চলতি)", short: "নভে", expected: 78500, collected: 65000, remaining: 13500, paidCount: 18, totalMembers: 25, current: true },
    { period: "ডিসেম্বর ২০২৬", short: "ডিসে", expected: 78500, collected: 0, remaining: 78500, paidCount: 0, totalMembers: 25 },
  ];



  // 10 Segregated Funds (Section 6.6)
  const TEN_FUNDS = [
    { id: "f1", name: "সাধারণ পরিচালন ফান্ড", balance: "৳৮৫,০০০", restricted: false, purpose: "বিদ্যুৎ বিল, গ্যাস, ওয়াশরুম ক্লিনার ও নিয়মিত রক্ষণাবেক্ষণ" },
    { id: "f2", name: "নির্মাণ ও সংস্কার ফান্ড", balance: "৳৭৫,০০০", restricted: true, purpose: "দ্বিতীয় তলার ছাদ ঢালাই ও মসজিদ সম্প্রসারণ কাজ" },
    { id: "f3", name: "ইমাম-মুয়াজ্জিন সম্মানী ফান্ড", balance: "৳২৫,০০০", restricted: false, purpose: "খতীব, ইমাম ও মুয়াজ্জিন সাহেবের মাসিক হাদিয়া" },
    { id: "f4", name: "যাকাত ফান্ড", balance: "৳১৩,৬০০", restricted: true, purpose: "কুরআনে নির্ধারিত ৮টি খাতে বাধ্যতামূলক যাকাত বিতরণ" },
    { id: "f5", name: "ফিতরা ফান্ড", balance: "৳৮,৫০০", restricted: true, purpose: "ঈদুল ফিতরের পূর্বে প্রকৃত হকদারদের মাঝে খাদ্য/অর্থ বিতরণ" },
    { id: "f6", name: "সদকা ও লিল্লাহ ফান্ড", balance: "৳১২,২০০", restricted: false, purpose: "অসহায় মুসল্লিদের তাৎক্ষণিক খাবার ও বস্ত্র সহায়তা" },
    { id: "f7", name: "ওয়াকফ ফান্ড", balance: "৳৫০,০০০", restricted: true, purpose: "ওয়াকফকৃত জমি ও সম্পদ হতে অর্জিত রাজস্বের মূল ফান্ড" },
    { id: "f8", name: "রমজান ও ইফতার ফান্ড", balance: "৳১৮,০০০", restricted: false, purpose: "প্রতিদিন মুসল্লি ও পথচারীদের জন্য উন্মুক্ত ইফতার আয়োজন" },
    { id: "f9", name: "মক্তব ও শিক্ষা ফান্ড", balance: "৳১৪,৪০০", restricted: false, purpose: "নূরানী কায়দা, কুরআন ক্লাসের শিক্ষক ভাতা ও কিতাব প্রদান" },
    { id: "f10", name: "জরুরি দুর্যোগ ও সমাজকল্যাণ", balance: "৳১০,০০০", restricted: true, purpose: "বন্যা, অগ্নিকাণ্ড ও আকস্মিক দুর্ঘটনায় চিকিৎসা ও কাফন-দাফন" },
  ];

  // If in Public Website Mode (Without Login), render the Public Website!
  if (viewMode === "public") {
    return (
      <PublicMosqueWebsite
        mosque={currentMosque}
        schedule={schedule}
        currentPrayer={currentPrayer}
        countdown={countdown}
        nextJamaatText={nextJamaatText}
        onOpenLogin={() => setViewMode("erp")}
        onOpenDiscovery={() => setActiveModal("mosque-discovery")}
        onOpenCustomDomain={() => setActiveModal("custom-domain")}
        onOpenDonate={() => setActiveTab("months")}
        onOpenMaktab={() => setActiveModal("maktab")}
      />
    );
  }

  // Otherwise, render the FULL AUTHENTICATED MOSQUE ERP
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Mobile-first centered app shell (max-w-xl) */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28 pt-2">
        {/* ── 1. TOP HEADER (Screenshots & mosque/src/components/TopHeader.tsx) ── */}
        <header className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs mb-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* User Avatar & Mosque Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => setActiveModal("my-account")}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition"
                title="আমার অ্যাকাউন্ট ও স্টেটমেন্ট দেখতে ক্লিক করুন"
              >
                {currentMosque.logoLetter}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                    {currentMosque.name}
                  </h1>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-emerald-950/70 text-stone-500 font-bold shrink-0">
                    {currentMosque.id}
                  </span>
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

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Switch to Public Website View Toggle */}
              <button
                onClick={() => {
                  setViewMode("public");
                  toast.info("পাবলিক ওয়েবসাইট ভিউতে পরিবর্তিত হয়েছে (লগইন ছাড়া কেমন দেখাবে)");
                }}
                className="px-2.5 py-1.5 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-200 font-bold text-[11px] flex items-center gap-1 hover:border-emerald-500 transition cursor-pointer"
                title="পাবলিক ওয়েবসাইট প্রিভিউ দেখুন"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">পাবলিক সাইট</span>
              </button>

              {/* Mosque Discovery / Switcher */}
              <button
                onClick={() => setActiveModal("mosque-discovery")}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] flex items-center justify-center text-stone-600 dark:text-stone-300 hover:border-emerald-500 transition cursor-pointer"
                title="মসজিদ পরিবর্তন বা নতুন মসজিদ খুঁজুন"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => toast.info("আপনার ৩টি অপঠিত নোটিফিকেশন: আগামীকাল ইমাম সাহেবের খাবার রোস্টার, মাইক বিল অনুমোদন ও জুমার খুতবা")}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] flex items-center justify-center relative cursor-pointer hover:border-emerald-500 transition"
                title="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#0c1612]"></span>
              </button>
            </div>
          </div>
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

        {/* ── 3. PRAYER ARC & WAQT WIDGET ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs mb-3 space-y-3">
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

        {/* ══════════════════════════════════════════════════════════════════
            CANONICAL TAB 1: 🏠 হোম / ড্যাশবোর্ড (DASHBOARD)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* ══════════════════════════════════════════════════════════════
                PREMIUM MOSQUE ERP MODULE CENTER (7 Categories & Search)
               ══════════════════════════════════════════════════════════════ */}
            <MosqueModuleCenter
              onOpenModal={(modalId) => setActiveModal(modalId)}
              onOpenQuranReader={onOpenQuranReader}
              onOpenTutor={onOpenTutor}
              onSelectTab={(tabId) => setActiveTab(tabId)}
              onOpenPublicSite={() => setViewMode("public")}
              currentMosque={currentMosque}
            />

            {/* Dashboard Section Title */}
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-emerald-600"></div>
                <h2 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                  {currentMosque.name} — ফিন্যান্স ড্যাশবোর্ড ও স্থিতি
                </h2>
              </div>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 font-mono">
                {selectedMonth}
              </span>
            </div>

            {/* 1. HERO CARD: TOTAL AVAILABLE BALANCE & DRILL-DOWN */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#094838] via-[#0f6850] to-[#128a6a] text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-200" />
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
                  (১০টি তহবিল বিস্তারিত ➔)
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
                  <div className="text-[11px] text-emerald-100">চলতি মাসের মোট আয়</div>
                  <div className="text-base sm:text-lg font-black font-mono mt-0.5 flex items-center gap-1">
                    <span>৳৬৫,০০০</span>
                    <span className="text-[10px] opacity-75">➔</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModal("purchase-procurement")}
                  className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
                  title="খরচের বিবরণী দেখুন"
                >
                  <div className="text-[11px] text-emerald-100">চলতি মাসের মোট ব্যয়</div>
                  <div className="text-base sm:text-lg font-black font-mono mt-0.5 flex items-center gap-1 text-amber-200">
                    <span>৳১৬,৫০০</span>
                    <span className="text-[10px] opacity-75">➔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MY ACCOUNT CARD (Clickable drill-down to /members/me statement) */}
            <div
              onClick={() => setActiveModal("my-account")}
              className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs cursor-pointer hover:border-emerald-500 transition group space-y-2"
              title="আমার চাঁদার বিস্তারিত খাতা ও রসিদ দেখতে ক্লিক করুন"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>আমার হিসাব (মুহাম্মদ আব্দুল্লাহ · সভাপতি)</span>
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                  <span>বিবরণী ও রসিদ</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">আপনি দিয়েছেন</span>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                    ৳১,৫০০
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">আপনার বাকি</span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                    <span>৳০</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THIS MONTH COLLECTION CARD */}
            <div
              onClick={() => {
                setSelectedMonth("নভেম্বর ২০২৬");
                setActiveModal("month-detail");
              }}
              className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs cursor-pointer hover:border-emerald-500 transition group space-y-2.5"
              title="নভেম্বর মাসের কে কত দিল তা দেখতে ক্লিক করুন"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>চলতি মাসের আদায় · নভেম্বর ২০২৬</span>
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                  <span>সদস্য খাতা ➔</span>
                </span>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-stone-500 dark:text-stone-400">আদায়কৃত বনাম লক্ষ্যমাত্রা</span>
                  <div className="text-xs font-bold font-mono">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">৳৬৫,০০০</span>
                    <span className="text-stone-400 font-normal"> / ৳৭৮,৫০০</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-stone-100 dark:bg-[#0f1d17] overflow-hidden border border-stone-200 dark:border-emerald-950">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: "83%" }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                <span>১৮ / ২৫ জন সদস্য পরিশোধ করেছেন (৮৩%)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">বাকি: ৳১৩,৫০০</span>
              </div>
            </div>

            {/* 4. IMAM MEAL ROSTER REMINDER BANNER */}
            <div
              onClick={() => setActiveModal("imam-meal")}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                    ইমাম সাহেবের আজকের খাবার দায়িত্ব
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    আজ: <b>হাজী রফিকুল ইসলামের পরিবার</b> · আগামীকালের দায়িত্ব দেখুন
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold shrink-0">
                রোস্টার ➔
              </span>
            </div>

            {/* 5. MOSQUE FUNDS SECTION (10 Segregated Funds) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  মসজিদ তহবিলসমূহ (১০টি আলাদা ফান্ড)
                </h3>
                <button
                  onClick={() => setActiveModal("funds")}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  সব তহবিল ➔
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TEN_FUNDS.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveModal("funds")}
                    className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold truncate">
                        {f.name}
                      </span>
                      {f.restricted && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                          সংরক্ষিত
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                      {f.balance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. PENDING PURCHASE & BILL APPROVAL ALERT */}
            <div
              onClick={() => setActiveModal("purchase-procurement")}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between shadow-2xs cursor-pointer hover:border-amber-500 transition"
              title="অপেক্ষমাণ ক্রয় আবেদনটি অনুমোদন করতে ক্লিক করুন"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  !
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                    ক্রয় আবেদন ও বিল অনুমোদনের অপেক্ষায়
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    ২টি সিলিং ফ্যান ক্রয় (৳৮,০০০) · মাইক মেরামত (৳১২,৫০০)
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  অনুমোদন ➔
                </span>
              </div>
            </div>

            {/* 7. 12-MONTH TRENDS BAR CHART */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>১২ মাসের চাঁদা আদায়ের ধারা</span>
                </h3>
                <span className="text-[10px] text-stone-400">বার এ ক্লিক করুন</span>
              </div>

              <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
                {ALL_MONTHS_OVERVIEW.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedMonth(m.period);
                      setActiveModal("month-detail");
                    }}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    title={`${m.period}: আদায় ৳${m.collected.toLocaleString("bn-BD")}`}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${
                        m.current
                          ? "bg-gradient-to-t from-emerald-600 to-teal-400 ring-2 ring-emerald-400"
                          : m.collected > 0
                          ? "bg-gradient-to-t from-emerald-700 to-emerald-500"
                          : "bg-stone-200 dark:bg-stone-800"
                      }`}
                      style={{ height: `${Math.max(6, (m.collected / 95000) * 100)}%` }}
                    ></div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 mt-1">
                      {m.short}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CANONICAL TAB 2: 📅 মাসিক চাঁদা ও আদায় খাতা (MONTHS)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "months" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                  মাসিক চাঁদা ও আদায় খাতা
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  প্রতি মাসের আদায় বনাম বকেয়া পূর্ণ হিসাব বিবরণী
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/60 rounded-2xl p-1">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-emerald-950/60 flex items-center justify-center text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                >
                  ‹
                </button>
                <span className="px-2 text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-emerald-950/60 flex items-center justify-center text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {ALL_MONTHS_OVERVIEW.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedMonth(m.period);
                    setActiveModal("month-detail");
                  }}
                  className={`p-3.5 rounded-2xl border transition shadow-2xs hover:shadow-sm cursor-pointer ${
                    m.current
                      ? "bg-white dark:bg-[#0c1612] border-emerald-500 dark:border-emerald-600 ring-1 ring-emerald-500/30"
                      : "bg-white dark:bg-[#0c1612] border-stone-200 dark:border-emerald-900/50 hover:border-emerald-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <b className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                        {m.period}
                      </b>
                      {m.current && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                          চলতি মাস
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      {m.paidCount} / {m.totalMembers} জন পরিশোধিত
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-stone-100 dark:bg-[#07130e] overflow-hidden mb-2 border border-stone-200 dark:border-emerald-950">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, (m.collected / m.expected) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                    <div>
                      <span className="text-[10px] text-stone-400">আদায়কৃত: </span>
                      <b className="font-mono text-emerald-700 dark:text-emerald-400">
                        ৳{m.collected.toLocaleString("bn-BD")}
                      </b>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">বকেয়া: </span>
                      <b className={`font-mono ${m.remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        ৳{m.remaining.toLocaleString("bn-BD")}
                      </b>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <span>সদস্য খাতা ➔</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CANONICAL TAB 3: 💸 ব্যয় ও অনুমোদন (EXPENSES)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "expenses" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                  মসজিদ ব্যয় ও বিল অনুমোদন
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  ভাউচার নম্বর, অনুমোদনের স্ট্যাটাস ও অডিট ট্র্যাকিং
                </p>
              </div>

              <button
                onClick={() => setActiveModal("purchase-procurement")}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ কেনাকাটা আবেদন</span>
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: "ALL", label: `সকল খরচ (${expensesList.length})` },
                { id: "PENDING", label: `অনুমোদনের অপেক্ষায় (${expensesList.filter((e) => e.status === "PENDING_APPROVAL").length})` },
                { id: "APPROVED", label: "অনুমোদিত" },
                { id: "PAID", label: "পরিশোধিত" },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setExpenseFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    expenseFilter === chip.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-[#0c1612] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/50"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {expensesList
                .filter((e) => {
                  if (expenseFilter === "ALL") return true;
                  if (expenseFilter === "PENDING") return e.status === "PENDING_APPROVAL";
                  if (expenseFilter === "APPROVED") return e.status === "APPROVED";
                  if (expenseFilter === "PAID") return e.status === "PAID";
                  return true;
                })
                .map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-500">{e.voucherNo}</span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 font-semibold text-[10px]">
                          {e.category}
                        </span>
                        {e.overdue && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[9px] animate-pulse">
                            Overdue (&gt;৪৮ঘণ্টা)
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                          e.status === "PENDING_APPROVAL"
                            ? "bg-amber-100 text-amber-800"
                            : e.status === "APPROVED"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {e.status === "PENDING_APPROVAL"
                          ? "অনুমোদনের অপেক্ষায়"
                          : e.status === "APPROVED"
                          ? "অনুমোদিত (পরিশোধ বাকি)"
                          : "পরিশোধিত"}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                        {e.title}
                      </h4>
                      <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                        ৳{e.amount.toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-0.5">
                      <div>ফান্ড: <b className="text-stone-700 dark:text-stone-300">{e.fund}</b></div>
                      <div>জমাদাতা: {e.submittedBy} · তারিখ: {e.spentAt}</div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                      <button
                        onClick={() => setActiveModal("purchase-procurement")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        প্রকিউরমেন্ট ও অনুমোদন বিবরণী ➔
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CANONICAL TAB 4: 👥 সদস্য খাতা ও আমার হিসাব (MEMBERS)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "members" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                    মসজিদ সদস্য খাতা ও চাঁদার হিসাব
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    প্রতি সদস্যের নিজস্ব অঙ্গীকার (Pledge) ও ব্যক্তিগত স্টেটমেন্ট
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal("admin-360")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>সদস্য যোগ</span>
                </button>
              </div>

              <div className="flex gap-2 p-1 bg-stone-50 dark:bg-[#07130e] rounded-2xl border border-stone-200 dark:border-emerald-950">
                <button
                  onClick={() => setMembersTab("all")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    membersTab === "all"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                  }`}
                >
                  সকল সদস্যের খাতা ({membersList.length})
                </button>
                <button
                  onClick={() => setMembersTab("me")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    membersTab === "me"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                  }`}
                >
                  আমার হিসাব (/members/me)
                </button>
              </div>
            </div>

            {membersTab === "all" ? (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="নাম, মোবাইল বা সদস্য আইডি দিয়ে খুঁজুন..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-2xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0c1612] text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                {!showContributors && (
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>🔒 দাতার গোপনীয়তা সক্রিয়: সাধারণ সদস্যরা কেবল নিজের হিসাব দেখে।</span>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="font-bold underline text-emerald-700 dark:text-emerald-400"
                    >
                      সেটিংস
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {membersList
                    .filter((m) =>
                      !memberSearch ||
                      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.id.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.phone.includes(memberSearch)
                    )
                    .map((m) => {
                      const remaining = Math.max(0, m.pledge - m.paid);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMonth("নভেম্বর ২০২৬");
                            setActiveModal("month-detail");
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 shadow-2xs hover:border-emerald-500 transition cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-600 dark:text-emerald-300 font-bold">
                                {m.id}
                              </span>
                              <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 truncate">
                                {m.name}
                              </h4>
                              <span className="text-[10px] text-stone-400">({m.role})</span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                              <span>মাসিক অঙ্গীকার: <b>৳{m.pledge}</b></span>
                              <span>·</span>
                              <span className="text-stone-400">{m.phone}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                                ৳{m.paid}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  remaining === 0
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {remaining === 0 ? "পরিশোধিত" : `বাকি ৳${remaining}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
                              রসিদ ও খাতা ➔
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-90">আমার নির্ধারিত মাসিক চাঁদা:</span>
                    <span className="font-bold text-amber-300 font-mono text-sm">৳১,৫০০ / মাস</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs opacity-90">সর্বমোট পরিশোধিত ইনফাক:</span>
                    <span className="text-2xl font-black text-white font-mono">৳১৮,০০০</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/15 text-xs">
                    <span className="text-emerald-200">বর্তমান বকেয়ার স্থিতি:</span>
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>পরিশোধিত (কোনো বকেয়া নেই)</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-stone-800 dark:text-stone-200">
                    বিগত মাসসমূহের চাঁদা ও ডিজিটাল রসিদ:
                  </h4>
                  {[
                    { period: "নভেম্বর ২০২৬", amount: 1500, date: "০২ নভে ২০২৬", rcpt: "RCPT-1102" },
                    { period: "অক্টোবর ২০২৬", amount: 1500, date: "০৩ অক্টো ২০২৬", rcpt: "RCPT-1003" },
                    { period: "সেপ্টেম্বর ২০২৬", amount: 1500, date: "০৪ সেপ্টে ২০২৬", rcpt: "RCPT-0904" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <b className="text-stone-900 dark:text-stone-100">{r.period}</b>
                        <p className="text-[10px] text-stone-400 mt-0.5">তারিখ: {r.date} · {r.rcpt}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                          ৳{r.amount}
                        </span>
                        <button
                          onClick={() => setActiveModal("my-account")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          রসিদ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CANONICAL TAB 5: ⚙️ সেটিংস ও রোল-পারমিশন (SETTINGS)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs">
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                মসজিদ সেটিংস, কাস্টম ডোমেইন ও নীতিমালা
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                দাতার গোপনীয়তা, ডায়নামিক রোল-পারমিশন ও ১০টি স্বতন্ত্র ফান্ড
              </p>
            </div>

            {/* Custom Domain Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>কাস্টম ডোমেইন সংযোগ (Custom Domain)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {currentMosque.customDomain ? "সংযুক্ত" : "ফ্রি সাবডোমেইন"}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                আপনার মসজিদের নিজস্ব ডোমেইন (যেমন: {currentMosque.customDomain || "mymosque.org"}) ব্র্যান্ডিং হিসেবে যুক্ত করুন।
              </p>
              <button
                onClick={() => setActiveModal("custom-domain")}
                className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 cursor-pointer"
              >
                ডোমেইন সেটিংস ও CNAME কনফিগারেশন ➔
              </button>
            </div>

            {/* General Mosque Settings */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>সাধারণ সেটিংস ও গোপনীয়তা নীতিমালা</span>
              </h3>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <b className="text-xs text-stone-900 dark:text-stone-100">দাতার তালিকার গোপনীয়তা (showContributors)</b>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    বন্ধ থাকলে সাধারণ সদস্যরা কেবল মোট অঙ্ক ও নিজের চাঁদা দেখবে; অন্যের নাম ও তালিকা দেখতে পাবে না।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showContributors}
                  onChange={(e) => handleToggleContributors(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <b className="text-xs text-stone-900 dark:text-stone-100">সদস্য যাচাইকরণ বাধ্যতামূলক (requireVerification)</b>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    চালু থাকলে নতুন সদস্য নিবন্ধনের পর কমিটি যাচাই ও অঙ্গীকার (Pledge) নির্ধারণ না করা পর্যন্ত ডেটা দেখতে পাবে না।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireVerification}
                  onChange={(e) => setRequireVerification(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Dynamic Roles & Permissions */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>ডায়নামিক রোল ও পারমিশন (roles.manage)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                  LAST_ADMIN সুরক্ষিত
                </span>
              </div>

              <div className="space-y-2">
                {rolesList.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <b className="text-stone-900 dark:text-stone-100">{r.name}</b>
                      {r.isSystem && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
                          সিস্টেম রোল
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 10 Segregated Funds Management */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>১০টি আলাদা মসজিদ তহবিল ও ব্যালেন্স</span>
                </h3>
                <button
                  onClick={() => setActiveModal("funds")}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  সব তহবিল ➔
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {TEN_FUNDS.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/50 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <b className="text-stone-900 dark:text-stone-100">{f.name}</b>
                        {f.restricted && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            সংরক্ষিত
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{f.purpose}</p>
                    </div>
                    <span className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                      {f.balance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. FLOATING BOTTOM NAVIGATION DOCK (5 Canonical Tabs) ── */}
        <nav className="fixed left-1/2 -translate-x-1/2 bottom-3 w-[calc(100%-24px)] max-w-md bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/80 rounded-full p-1.5 shadow-2xl flex items-center justify-between gap-1 z-40 backdrop-blur-md">
          {[
            { key: "dashboard", icon: "🏠", label: "হোম" },
            { key: "months", icon: "📅", label: "মাসিক" },
            { key: "expenses", icon: "💸", label: "ব্যয়" },
            { key: "members", icon: "👥", label: "সদস্য" },
            { key: "settings", icon: "⚙️", label: "সেটিংস" },
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

        {/* ── 7. ALL INTERACTIVE MODALS RENDERING ── */}
        {/* Imam Meal Roster Modal (Section 7) */}
        {activeModal === "imam-meal" && (
          <ImamMealRosterModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Purchase Procurement Modal (Section 8 with 4 Signatures) */}
        {activeModal === "purchase-procurement" && (
          <PurchaseProcurementModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Employee & Salary Modal (Section 9) */}
        {activeModal === "employee-salary" && (
          <EmployeeSalaryModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Asset & Inventory Modal (Section 11) */}
        {activeModal === "asset-inventory" && (
          <AssetInventoryModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Community Welfare & Zakat Modal (Section 12) */}
        {activeModal === "community-welfare" && (
          <CommunityWelfareModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Custom Domain Modal (Section 4 Method B) */}
        {activeModal === "custom-domain" && (
          <CustomDomainModal
            onClose={() => setActiveModal(null)}
            mosqueName={currentMosque.name}
            currentSlug={currentMosque.slug}
          />
        )}

        {/* Mosque Discovery Modal (Section 4 Method C) */}
        {activeModal === "mosque-discovery" && (
          <MosqueDiscoveryModal
            onClose={() => setActiveModal(null)}
            onSelectMosque={(m, mode) => {
              setCurrentMosque(m);
              setViewMode(mode);
            }}
            onOpenRegisterMosque={() => setActiveModal("register-mosque")}
          />
        )}

        {/* Mosque Registration Modal (Section 3) */}
        {activeModal === "register-mosque" && (
          <MosqueRegistrationModal
            onClose={() => setActiveModal(null)}
            onMosqueRegistered={(newM) => {
              setCurrentMosque(newM);
              setViewMode("erp");
            }}
          />
        )}

        {/* Islamic Super App Modal (32 Services) */}
        {activeModal === "super-app" && (
          <SuperAppModal
            onClose={() => setActiveModal(null)}
            onOpenModal={(m) => setActiveModal(m)}
            onOpenQuranReader={onOpenQuranReader}
            onOpenTutor={onOpenTutor}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Admin 360 Full Modal */}
        {activeModal === "admin-360" && (
          <Admin360Modal
            onClose={() => setActiveModal(null)}
            onOpenMasterDues={() => setActiveModal("master-dues")}
            onOpenFunds={() => setActiveModal("funds")}
            onOpenExpenseApproval={() => setActiveModal("purchase-procurement")}
            mosqueName={currentMosque.name}
          />
        )}

        {/* Super Admin Modal */}
        {activeModal === "super-admin" && (
          <SuperAdminModal onClose={() => setActiveModal(null)} />
        )}

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
            mosqueName={currentMosque.name}
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
