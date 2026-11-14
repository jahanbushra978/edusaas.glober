"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Menu,
  ShieldCheck,
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
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  Layers,
  Eye,
  EyeOff,
  FileCheck,
  Wallet,
  Boxes,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";

// Realtime Persistence Service
import {
  getMosqueDatabase,
  saveMosqueDatabase,
  recalculateDatabase,
  addMemberToDatabase,
  recordDonationInDatabase,
  submitExpenseToDatabase,
  approveExpenseInDatabase,
  payExpenseInDatabase,
  rejectExpenseInDatabase,
  getMemberPrivateStatement,
  exportDatabaseBackupJSON,
  restoreDatabaseBackupJSON,
} from "../services/mosqueStorage";

// Redesigned Module Launcher & Public Website
import { MosqueModuleCenter } from "./MosqueModuleCenter";
import { PublicMosqueWebsite } from "./PublicMosqueWebsite";

// Existing Modal Suite
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

const BANGLADESH_DISTRICTS = [
  "গাজীপুর", "ঢাকা", "নারায়ণগঞ্জ", "নরসিংদী", "মানিকগঞ্জ", "মুন্সীগঞ্জ",
  "চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "সিলেট", "রাজশাহী", "বগুড়া",
  "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ",
];

export default function MosqueHub({ onOpenQuranReader, onOpenTutor, onNavigateBack }) {
  // ── 1. REAL PERSISTENT DATABASE ENGINE ──
  const [db, setDb] = useState(() => getMosqueDatabase());

  // Current Active Role & Member Identity
  const [currentUserRole, setCurrentUserRole] = useState("PRESIDENT"); // "SUPER_ADMIN" | "PRESIDENT" | "TREASURER" | "IMAM" | "MEMBER"
  const [currentMemberId, setCurrentMemberId] = useState("M-101");

  // Operating View Mode: "erp" (Admin & Member ERP) vs "public" (Public website)
  const [viewMode, setViewMode] = useState("erp");

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, members, committee, staff, income, funds, vouchers, bill-approvals, ledger, reports, prayer, roster, maktab, events, welfare, assets, notices, audit, backup, member-portal, settings, months
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quick Action Forms state
  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ name: "", phone: "", address: "", role: "সাধারণ সদস্য", pledge: 1000, type: "GENERAL" });

  const [newDonationModalOpen, setNewDonationModalOpen] = useState(false);
  const [newDonationForm, setNewDonationForm] = useState({ donorName: "", phone: "", fundId: "f1", amount: 1000, category: "সাধারণ অনুদান", method: "নগদ (Cash)", notes: "" });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectVoucherId, setRejectVoucherId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("নভেম্বর ২০২৬");
  const [showContributors, setShowContributors] = useState(false); // Contributor privacy toggle

  // Multi-Tenant Active Mosque Context
  const currentMosque = db.mosque;

  // Refresh DB from storage if needed
  const refreshDatabase = () => {
    setDb(getMosqueDatabase());
  };

  // ── 2. DYNAMIC REAL-TIME CALCULATIONS (No fake demo numbers!) ──
  const totalFundsBalance = useMemo(() => {
    return (db.funds || []).reduce((acc, f) => acc + (f.currentBalance || 0), 0);
  }, [db.funds]);

  const totalVerifiedInflow = useMemo(() => {
    return (db.inflows || []).reduce((acc, inf) => acc + (inf.status === "VERIFIED" ? Number(inf.amount || 0) : 0), 0);
  }, [db.inflows]);

  const totalPaidOutflow = useMemo(() => {
    return (db.expenses || []).reduce((acc, exp) => acc + (exp.status === "PAID" ? Number(exp.amount || 0) : 0), 0);
  }, [db.expenses]);

  const totalPendingBills = useMemo(() => {
    return (db.expenses || []).reduce((acc, exp) => acc + (exp.status === "PENDING_APPROVAL" || exp.status === "APPROVED" ? Number(exp.amount || 0) : 0), 0);
  }, [db.expenses]);

  const totalPledgedExpected = useMemo(() => {
    return (db.members || []).reduce((acc, m) => acc + Number(m.pledge || 0), 0);
  }, [db.members]);

  const totalPledgedCollected = useMemo(() => {
    return (db.members || []).reduce((acc, m) => acc + Number(m.paid || 0), 0);
  }, [db.members]);

  const totalRemainingDues = useMemo(() => {
    return Math.max(0, totalPledgedExpected - totalPledgedCollected);
  }, [totalPledgedExpected, totalPledgedCollected]);

  // Current Member Personal Statement (Strict privacy)
  const currentMemberStatement = useMemo(() => {
    return getMemberPrivateStatement(currentMemberId);
  }, [currentMemberId, db]);

  // ── 3. REALTIME ACTION HANDLERS ──
  const handleAddNewMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.phone.trim()) {
      toast.error("সদস্যের নাম ও ফোন নম্বর দিন");
      return;
    }

    const updated = addMemberToDatabase(newMemberForm, `${currentUserRole} কর্তৃক`);
    setDb(updated);
    setNewMemberModalOpen(false);
    setNewMemberForm({ name: "", phone: "", address: "", role: "সাধারণ সদস্য", pledge: 1000, type: "GENERAL" });
    toast.success("মাশাআল্লাহ! নতুন সদস্য সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে।");
  };

  const handleRecordDonation = (e) => {
    e.preventDefault();
    if (!newDonationForm.amount || Number(newDonationForm.amount) <= 0) {
      toast.error("সঠিক অনুদানের পরিমাণ দিন");
      return;
    }

    const updated = recordDonationInDatabase(newDonationForm, `${currentUserRole} (কোষাধ্যক্ষ)`);
    setDb(updated);
    setNewDonationModalOpen(false);
    setNewDonationForm({ donorName: "", phone: "", fundId: "f1", amount: 1000, category: "সাধারণ অনুদান", method: "নগদ (Cash)", notes: "" });
    toast.success("মাশাআল্লাহ! অনুদান সফলভাবে গৃহীত হয়েছে এবং সংশ্লিষ্ট ফান্ড ব্যালেন্স বৃদ্ধি পেয়েছে।");
  };

  const handleApproveExpense = (voucherNo) => {
    if (currentUserRole !== "PRESIDENT" && currentUserRole !== "SUPER_ADMIN") {
      toast.error("শুধুমাত্র সভাপতি বা সুপার অ্যাডমিন ব্যয় অনুমোদন করতে পারবেন।");
      return;
    }
    const updated = approveExpenseInDatabase(voucherNo, "মুহাম্মদ আব্দুল্লাহ (সভাপতি)");
    setDb(updated);
    toast.success(`ভাউচার #${voucherNo} সফলভাবে অনুমোদিত হয়েছে। কোষাধ্যক্ষ পরিশোধ করবেন।`);
  };

  const handlePayExpense = (voucherNo) => {
    if (currentUserRole !== "TREASURER" && currentUserRole !== "SUPER_ADMIN") {
      toast.error("শুধুমাত্র কোষাধ্যক্ষ বিল পরিশোধ ও ফান্ড কর্তন করতে পারবেন।");
      return;
    }
    const updated = payExpenseInDatabase(voucherNo, "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)");
    setDb(updated);
    toast.success(`ভাউচার #${voucherNo} পরিশোধিত এবং সংশ্লিষ্ট ফান্ড হতে অর্থ কর্তন সম্পন্ন।`);
  };

  const handleOpenReject = (voucherNo) => {
    setRejectVoucherId(voucherNo);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("প্রত্যাখ্যানের কারণ উল্লেখ করা বাধ্যতামূলক।");
      return;
    }
    const updated = rejectExpenseInDatabase(rejectVoucherId, `${currentUserRole} কর্তৃক`, rejectionReason);
    setDb(updated);
    setRejectModalOpen(false);
    toast.warning(`ভাউচার #${rejectVoucherId} প্রত্যাখ্যাত হয়েছে।`);
  };

  const handleExportBackup = () => {
    exportDatabaseBackupJSON();
    toast.success("মসজিদ ERP ডাটাবেস ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target.result;
        const restored = restoreDatabaseBackupJSON(jsonStr);
        setDb(restored);
        toast.success("অভিনন্দন! ব্যাকআপ থেকে সম্পূর্ণ মসজিদ ডাটাবেস পুনরুদ্ধার সম্পন্ন হয়েছে।");
      } catch (err) {
        toast.error("ভুল বা ত্রুটিপূর্ণ ব্যাকআপ ফাইল। দয়া করে সঠিক ফাইল দিন।");
      }
    };
    reader.readAsText(file);
  };

  // ── 4. IF IN PUBLIC WEBSITE MODE, RENDER PUBLIC WEBSITE! ──
  if (viewMode === "public") {
    return (
      <PublicMosqueWebsite
        mosque={currentMosque}
        schedule={db.prayerSchedule}
        currentPrayer={db.prayerSchedule[3]}
        countdown="৪৫ মিনিট বাকি"
        nextJamaatText="মাগরিব শুরু: ০৫:৩৮ PM"
        onOpenLogin={() => setViewMode("erp")}
        onOpenDiscovery={() => setActiveModal("mosque-discovery")}
        onOpenCustomDomain={() => setActiveModal("custom-domain")}
        onOpenMaktab={() => setActiveModal("maktab")}
      />
    );
  }

  // ── 5. AUTHENTICATED MASJID MANAGEMENT ERP ──
  return (
    <div className="min-h-screen bg-[#FAF8F2] dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200 flex flex-col">
      {/* ── TOP ERP NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1612]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-emerald-900/50 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-[#0D7A5F] transition cursor-pointer"
              title="সাইডবার মেনু"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#0D7A5F] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {currentMosque?.logoLetter || "বা"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                  {currentMosque?.name}
                </h1>
                <p className="text-[10px] text-stone-400 truncate hidden sm:block">
                  Masjid Management ERP · {currentMosque?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Center/Right: Role Switcher Simulator & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D7A5F]" />
              <span className="text-[10px] text-stone-500 hidden sm:inline">রোল:</span>
              <select
                value={currentUserRole}
                onChange={(e) => setCurrentUserRole(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden cursor-pointer"
              >
                <option value="PRESIDENT">সভাপতি (President)</option>
                <option value="TREASURER">কোষাধ্যক্ষ (Treasurer)</option>
                <option value="IMAM">খতীব ও ইমাম (Imam)</option>
                <option value="MEMBER">সদস্য পোর্টাল (Member)</option>
                <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
              </select>
            </div>

            {/* Switch to Public Site */}
            <button
              onClick={() => setViewMode("public")}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-[#0D7A5F] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="পাবলিক ওয়েবসাইট প্রিভিউ"
            >
              <Globe className="w-3.5 h-3.5 text-[#0D7A5F]" />
              <span className="hidden sm:inline">পাবলিক সাইট</span>
            </button>

            {/* Back Button if available */}
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-emerald-900/60 hover:bg-stone-100 text-stone-600 dark:text-stone-300"
                title="পূর্বের মেনুতে ফিরুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE WITH SIDEBAR ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex relative">
        {/* ── 5.1 STRUCTURED ADMIN SIDEBAR MENU (As Requested in Section 5) ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0c1612] border-r border-stone-200 dark:border-emerald-900/60 p-4 transform transition-transform duration-200 ease-in-out overflow-y-auto flex flex-col justify-between ${
            isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 lg:static lg:z-10 lg:shadow-none"
          }`}
        >
          <div className="space-y-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#0D7A5F]" />
                <span className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  MASJID MANAGEMENT ERP
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-xl hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group 1: মূল পরিচালনা */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
                মূল পরিচালনা
              </span>
              {[
                { id: "dashboard", label: "ড্যাশবোর্ড", icon: Landmark },
                { id: "members", label: "সদস্য ও মুসল্লি", icon: Users, badge: `${db.members.length}` },
                { id: "committee", label: "কমিটি ও দায়িত্ব", icon: ShieldCheck, modal: "admin" },
                { id: "staff", label: "ইমাম ও কর্মচারী", icon: Briefcase, modal: "employee-salary" },
                { id: "member-portal", label: "সদস্যদের নিজস্ব পোর্টাল", icon: User, highlight: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (item.modal) {
                        setActiveModal(item.modal);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#0D7A5F] text-white shadow-xs"
                        : item.highlight
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#0D7A5F] dark:text-emerald-300 hover:bg-emerald-100"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#07130e]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-stone-200 dark:bg-stone-800 text-stone-600"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Group 2: আর্থিক ব্যবস্থাপনা */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
                আর্থিক ব্যবস্থাপনা
              </span>
              {[
                { id: "income", label: "আয় ও অনুদান", icon: Coins },
                { id: "funds", label: "১০টি ফান্ড ব্যবস্থাপনা", icon: Landmark, badge: "১০টি" },
                { id: "vouchers", label: "রসিদ ও ভাউচার", icon: Receipt },
                { id: "bill-approvals", label: "বিল ও ব্যয় অনুমোদন", icon: FileCheck, badge: `${db.expenses.filter(e => e.status === "PENDING_APPROVAL").length}টি বাকি` },
                { id: "ledger", label: "হিসাবের খাতা ও লেজার", icon: FileSpreadsheet, modal: "master-dues" },
                { id: "reports", label: "আর্থিক রিপোর্ট ও অডিট", icon: FileText, modal: "master-dues" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (item.modal) {
                        setActiveModal(item.modal);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#0D7A5F] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#07130e]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Group 3: দৈনন্দিন পরিচালনা */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
                দৈনন্দিন পরিচালনা
              </span>
              {[
                { id: "prayer", label: "নামাজ ও জামাতের সময়", icon: Clock, modal: "prayer-edit" },
                { id: "roster", label: "ইমামের খানা রোস্টার", icon: Utensils, modal: "imam-meal" },
                { id: "maktab", label: "মক্তব ও কুরআন শিক্ষা", icon: GraduationCap, modal: "maktab" },
                { id: "welfare", label: "যাকাত ও মানবসেবা", icon: HeartHandshake, modal: "community-welfare" },
                { id: "assets", label: "সম্পদ ও মালামাল", icon: Boxes, modal: "asset-inventory" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (item.modal) {
                        setActiveModal(item.modal);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#0D7A5F] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#07130e]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Group 4: যোগাযোগ ও নিয়ন্ত্রণ */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
                যোগাযোগ ও নিয়ন্ত্রণ
              </span>
              {[
                { id: "notices", label: "নোটিশ ও প্রচারণা", icon: FileText },
                { id: "audit", label: "অডিট ট্রেইল ও সিকিউরিটি", icon: ShieldCheck },
                { id: "backup", label: "ব্যাকআপ ও ডেটা পুনরুদ্ধার", icon: Database },
                { id: "settings", label: "সেটিংস ও কাস্টম ডোমেইন", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#0D7A5F] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#07130e]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Footer inside Sidebar */}
          <div className="pt-3 border-t border-stone-100 dark:border-emerald-950/80 text-[11px] text-stone-400 space-y-1">
            <p>লগইন: {currentMosque?.name}</p>
            <p className="font-mono text-[10px]">ID: {currentMosque?.id}</p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          ></div>
        )}

        {/* ── 5.2 MAIN CONTENT AREA ── */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4">
          {/* ══════════════════════════════════════════════════════════════
              VIEW 1: ড্যাশবোর্ড (DASHBOARD)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top Hero Balance Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0D7A5F] to-[#0f6850] text-white shadow-xl relative overflow-hidden space-y-3">
                <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Landmark className="w-4 h-4 text-emerald-200" />
                    <span>মোট মসজিদ তহবিল স্থিতি (১০টি আলাদা ফান্ড সমন্বিত)</span>
                  </span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
                    BDT (৳)
                  </span>
                </div>

                {/* Dynamically Computed Total Fund Balance */}
                <div
                  onClick={() => setActiveTab("funds")}
                  className="cursor-pointer group flex items-baseline gap-3 my-1"
                  title="তহবিলের বিস্তারিত দেখতে ক্লিক করুন"
                >
                  <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight group-hover:text-amber-200 transition">
                    ৳{totalFundsBalance.toLocaleString("bn-BD")}
                  </span>
                  <span className="text-xs text-emerald-200 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                    <span>(১০টি ফান্ডের হিসেব দেখুন ➔)</span>
                  </span>
                </div>

                {/* Key Metrics Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/20 text-xs">
                  <div>
                    <span className="text-emerald-200 text-[11px]">চলতি মাসে মোট জমা:</span>
                    <p className="font-mono font-bold text-sm text-emerald-100 mt-0.5">
                      +৳{totalVerifiedInflow.toLocaleString("bn-BD")}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-200 text-[11px]">অনুমোদিত মোট ব্যয়:</span>
                    <p className="font-mono font-bold text-sm text-rose-200 mt-0.5">
                      -৳{totalPaidOutflow.toLocaleString("bn-BD")}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-200 text-[11px]">বকেয়া চাঁদা / অঙ্গীকার:</span>
                    <p className="font-mono font-bold text-sm text-amber-200 mt-0.5">
                      ৳{totalRemainingDues.toLocaleString("bn-BD")}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-200 text-[11px]">অনুমোদনের অপেক্ষায় বিল:</span>
                    <p className="font-mono font-bold text-sm text-orange-200 mt-0.5">
                      ৳{totalPendingBills.toLocaleString("bn-BD")}
                    </p>
                  </div>
                </div>

                {/* Quick Action Header Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setNewDonationModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>অনুদানের টাকা জমা করুন</span>
                  </button>
                  <button
                    onClick={() => setActiveModal("purchase-procurement")}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>নতুন ব্যয় রিকুইজিশন</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("member-portal")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>আমার ব্যক্তিগত হিসাব</span>
                  </button>
                </div>
              </div>

              {/* Imam Meal Roster Reminder Banner */}
              <div
                onClick={() => setActiveModal("imam-meal")}
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#0D7A5F] transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#0D7A5F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      ইমাম সাহেবের আজকের খাবার দায়িত্ব
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      আজ: <b>হাজী রফিকুল ইসলামের পরিবার</b> · আগামীকালের দায়িত্ব ও বদলি দেখুন
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-xl bg-[#0D7A5F] text-white font-bold shrink-0">
                  রোস্টার ➔
                </span>
              </div>

              {/* ── REDESIGNED PREMIUM MODULE CENTER (7 Categories & Search) ── */}
              <MosqueModuleCenter
                onOpenModal={(modalId) => setActiveModal(modalId)}
                onOpenQuranReader={onOpenQuranReader}
                onOpenTutor={onOpenTutor}
                onSelectTab={(tabId) => setActiveTab(tabId)}
                onOpenPublicSite={() => setViewMode("public")}
                currentMosque={currentMosque}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 2: সদস্য ও মুসল্লি ব্যবস্থাপনা (MEMBERS)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "members" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#0D7A5F]" />
                    <span>মুসল্লি ও সদস্য তালিকা ({db.members.length} জন)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    সদস্যদের প্রোফাইল, মাসিক অঙ্গীকার এবং ব্যক্তিগত হিসাবরক্ষণ
                  </p>
                </div>
                <button
                  onClick={() => setNewMemberModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সদস্য যুক্ত করুন</span>
                </button>
              </div>

              {/* Contributor Privacy Toggle (kara kara tk diyese ta sokolke chaile dekhano jabe ba hide kora jabe) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0D7A5F]" />
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">চাঁদাদাতাদের নাম প্রকাশ / গোপনীয়তা নিয়ন্ত্রণ:</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {showContributors
                        ? "বর্তমান অবস্থা: উন্মুক্ত — সাধারণ সদস্যদের নাম ও অনুদান দৃশ্যমান।"
                        : "বর্তমান অবস্থা: গোপন (Anonymous) — সাধারণের কাছে নাম গোপন রাখা হয়েছে।"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showContributors;
                    setShowContributors(next);
                    toast.info(next ? "চাঁদাদাতাদের তালিকা উন্মুক্ত করা হয়েছে" : "চাঁদাদাতাদের নাম গোপন করা হয়েছে");
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer self-start sm:self-auto ${
                    showContributors
                      ? "bg-[#0D7A5F] text-white shadow-xs"
                      : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {showContributors ? "প্রকাশিত (Visible)" : "গোপন রাখুন (Hidden)"}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 dark:bg-[#07130e] text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">আইডি</th>
                      <th className="py-2.5 px-3">নাম ও মোবাইল</th>
                      <th className="py-2.5 px-3">পদবী / টাইপ</th>
                      <th className="py-2.5 px-3">মাসিক অঙ্গীকার</th>
                      <th className="py-2.5 px-3">পরিশোধ</th>
                      <th className="py-2.5 px-3">বকেয়া</th>
                      <th className="py-2.5 px-3 text-right rounded-r-xl">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80">
                    {db.members
                      .filter((m) => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch))
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-[#07130e]/50">
                          <td className="py-3 px-3 font-mono font-bold text-[#0D7A5F]">{m.id}</td>
                          <td className="py-3 px-3">
                            <b className="block text-stone-900 dark:text-stone-100">
                              {showContributors || currentUserRole !== "MEMBER" ? m.name : `${m.name.slice(0, 4)}*** (${m.id})`}
                            </b>
                            <span className="text-[11px] font-mono text-stone-400">
                              {showContributors || currentUserRole !== "MEMBER" ? m.phone : "০১৭১১-***"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D7A5F] dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">৳{m.pledge}</td>
                          <td className="py-3 px-3 font-mono text-emerald-600 font-bold">৳{m.paid}</td>
                          <td className="py-3 px-3 font-mono text-amber-600 font-bold">৳{m.remaining}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setCurrentMemberId(m.id);
                                setActiveTab("member-portal");
                              }}
                              className="text-[#0D7A5F] hover:underline font-bold"
                            >
                              হিসাব দেখুন ➔
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 3: ১০টি সংরক্ষিত তহবিল ব্যবস্থাপনা (FUNDS)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "funds" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#0D7A5F]" />
                    <span>১০টি সংরক্ষিত মসজিদ তহবিল (Segregated Funds)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    কুরআন ও শরিয়াহ নির্দেশিকা অনুযায়ী প্রতিটি ফান্ডের অর্থ строго আলাদাভাবে হিসাবভুক্ত
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400">সর্বমোট তহবিল:</span>
                  <p className="text-base font-black text-[#0D7A5F] font-mono">
                    ৳{totalFundsBalance.toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {db.funds.map((fund) => (
                  <div
                    key={fund.id}
                    className="p-4 rounded-2xl bg-stone-50/80 dark:bg-[#07130e]/80 border border-stone-200 dark:border-emerald-900/40 space-y-2 hover:border-[#0D7A5F] transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{fund.name}</h4>
                          {fund.restricted && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                              সংরক্ষিত
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{fund.purpose}</p>
                      </div>
                      <span className="text-base font-black text-[#0D7A5F] font-mono shrink-0">
                        ৳{fund.currentBalance.toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60 dark:border-emerald-950/60 text-[11px]">
                      <div>
                        <span className="text-stone-400">মোট জমা:</span>
                        <p className="font-mono font-bold text-emerald-600">+৳{fund.inflowTotal || 0}</p>
                      </div>
                      <div>
                        <span className="text-stone-400">অনুমোদিত খরচ:</span>
                        <p className="font-mono font-bold text-rose-500">-৳{fund.outflowTotal || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 4: আয় ও অনুদান রেজিস্টার (INCOME)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "income" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#D4AF37]" />
                    <span>আয় ও অনুদান রেজিস্টার ({db.inflows.length}টি এন্ট্রি)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    সাধারণ অনুদান, সদস্য চাঁদা, জুমা কালেকশন ও অনলাইন দানের সম্পূর্ণ হিসাব
                  </p>
                </div>
                <button
                  onClick={() => setNewDonationModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন অনুদান রেকর্ড করুন</span>
                </button>
              </div>

              {/* Inflows Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 dark:bg-[#07130e] text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">রসিদ নং</th>
                      <th className="py-2.5 px-3">দাতার নাম ও মোবাইল</th>
                      <th className="py-2.5 px-3">ফান্ড</th>
                      <th className="py-2.5 px-3">ক্যাটাগরি</th>
                      <th className="py-2.5 px-3">পরিমাণ</th>
                      <th className="py-2.5 px-3">তারিখ ও মাধ্যম</th>
                      <th className="py-2.5 px-3 text-right rounded-r-xl">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80">
                    {db.inflows.map((inf) => (
                      <tr key={inf.id} className="hover:bg-stone-50/50 dark:hover:bg-[#07130e]/50">
                        <td className="py-3 px-3 font-mono font-bold text-[#0D7A5F]">{inf.receiptNo}</td>
                        <td className="py-3 px-3">
                          <b className="block text-stone-900 dark:text-stone-100">{inf.donorName}</b>
                          <span className="text-[11px] font-mono text-stone-400">{inf.phone}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold">{inf.fundName}</td>
                        <td className="py-3 px-3 text-stone-500">{inf.category}</td>
                        <td className="py-3 px-3 font-mono font-black text-emerald-600">+৳{inf.amount}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                          {inf.date} · {inf.method}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            {inf.status === "VERIFIED" ? "যাচাইকৃত" : "অপেক্ষমাণ"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 5: বিল ও ভাউচার অনুমোদন (BILL APPROVALS & VOUCHERS)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === "bill-approvals" || activeTab === "vouchers") && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#0D7A5F]" />
                    <span>বিল ও ভাউচার অনুমোদন ব্যবস্থাপনা ({db.expenses.length}টি ভাউচার)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    সভাপতি অনুমোদন করবেন এবং কোষাধ্যক্ষ পরিশোধের পর ফান্ড হতে অর্থ কর্তন হবে
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal("purchase-procurement")}
                  className="px-4 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রকিউরমেন্ট রিকুইজিশন</span>
                </button>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                {db.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0D7A5F] text-xs">{exp.voucherNo}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            exp.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : exp.status === "APPROVED"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : exp.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {exp.status === "PAID" ? "পরিশোধিত" : exp.status === "APPROVED" ? "অনুমোদিত (পেমেন্ট বাকি)" : exp.status === "REJECTED" ? "বাতিল" : "অনুমোদনের অপেক্ষায়"}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{exp.title}</h4>
                        <p className="text-[11px] text-stone-500">ফান্ড: <b>{exp.fundName}</b> · আবেদনকারী: {exp.submittedBy}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-rose-500 font-mono">
                          ৳{exp.amount.toLocaleString("bn-BD")}
                        </span>
                        <p className="text-[10px] text-stone-400">{exp.spentAt}</p>
                      </div>
                    </div>

                    {/* Signatures status */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/60 dark:border-emerald-950/60 text-[10px]">
                      <div>
                        <span className="text-stone-400">আবেদনকারী:</span>
                        <p className="font-bold">{exp.signatures?.applicant || "—"}</p>
                      </div>
                      <div>
                        <span className="text-stone-400">মাল গ্রহণকারী:</span>
                        <p className="font-bold">{exp.signatures?.receiver || "—"}</p>
                      </div>
                      <div>
                        <span className="text-stone-400">সভাপতি অনুমোদন:</span>
                        <p className="font-bold text-[#0D7A5F]">{exp.signatures?.president || "অপেক্ষমাণ"}</p>
                      </div>
                      <div>
                        <span className="text-stone-400">কোষাধ্যক্ষ পেমেন্ট:</span>
                        <p className="font-bold text-[#0D7A5F]">{exp.signatures?.treasurer || "অপেক্ষমাণ"}</p>
                      </div>
                    </div>

                    {/* Action buttons based on Role */}
                    <div className="flex gap-2 pt-1 border-t border-stone-200/40 dark:border-emerald-950/40 justify-end">
                      {exp.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => handleApproveExpense(exp.voucherNo)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                          >
                            অনুমোদন করুন (সভাপতি)
                          </button>
                          <button
                            onClick={() => handleOpenReject(exp.voucherNo)}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs cursor-pointer"
                          >
                            প্রত্যাখ্যান
                          </button>
                        </>
                      )}

                      {exp.status === "APPROVED" && (
                        <button
                          onClick={() => handlePayExpense(exp.voucherNo)}
                          className="px-3 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          বিল পরিশোধ করুন (কোষাধ্যক্ষ)
                        </button>
                      )}

                      {exp.status === "PAID" && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>ফান্ড হতে কর্তন সম্পন্ন</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 6: সদস্যদের নিজস্ব পোর্টাল (MEMBER PORTAL — STRICT PRIVACY)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "member-portal" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#0D7A5F]" />
                    <span>সদস্যের নিজস্ব পোর্টাল ও ব্যক্তিগত হিসাব</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    কঠোর গোপনীয়তা: আপনি শুধুমাত্র আপনার নিজস্ব অঙ্গীকার ও রসিদ দেখতে পাচ্ছেন
                  </p>
                </div>

                {/* Member Switcher (for testing/committee view) */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-stone-400">সদস্য নির্বাচন:</span>
                  <select
                    value={currentMemberId}
                    onChange={(e) => setCurrentMemberId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 text-xs font-bold"
                  >
                    {db.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentMemberStatement && (
                <div className="space-y-4">
                  {/* Member Profile Summary */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-[#0D7A5F]/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">সদস্যের নাম:</span>
                      <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mt-0.5">{currentMemberStatement.member.name}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">মাসিক অঙ্গীকার:</span>
                      <p className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm mt-0.5">৳{currentMemberStatement.totalPledge}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">চলতি মাসে আদায়:</span>
                      <p className="font-mono font-bold text-emerald-600 text-sm mt-0.5">৳{currentMemberStatement.totalPaid}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">অবশিষ্ট বকেয়া:</span>
                      <p className="font-mono font-bold text-amber-600 text-sm mt-0.5">৳{currentMemberStatement.remaining}</p>
                    </div>
                  </div>

                  {/* Personal Receipts Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      আপনার নিজস্ব অনুদানের রসিদসমূহ:
                    </h4>
                    {currentMemberStatement.inflows.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 dark:bg-[#07130e] rounded-xl">
                        চলতি মাসে এখনও কোনো জমার রসিদ পাওয়া যায়নি।
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-stone-50 dark:bg-[#07130e] text-stone-500 text-[10px]">
                            <tr>
                              <th className="py-2 px-3">রসিদ নং</th>
                              <th className="py-2 px-3">ফান্ড</th>
                              <th className="py-2 px-3">পরিমাণ</th>
                              <th className="py-2 px-3">তারিখ ও মাধ্যম</th>
                              <th className="py-2 px-3 text-right">রসিদ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80">
                            {currentMemberStatement.inflows.map((inf) => (
                              <tr key={inf.id}>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#0D7A5F]">{inf.receiptNo}</td>
                                <td className="py-2.5 px-3">{inf.fundName}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">৳{inf.amount}</td>
                                <td className="py-2.5 px-3 text-stone-500">{inf.date} ({inf.method})</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => window.print()}
                                    className="text-xs text-[#0D7A5F] hover:underline font-bold"
                                  >
                                    প্রিন্ট রসিদ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Public Mosque Summary accessible to member */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">মসজিদের সামগ্রিক উন্মুক্ত তহবিল স্থিতি:</span>
                      <p className="text-[11px] text-stone-500">সকল মুসল্লিদের জ্ঞাতার্থে উন্মুক্ত আর্থিক স্বচ্ছতা</p>
                    </div>
                    <span className="text-base font-black text-[#0D7A5F] font-mono">
                      ৳{currentMemberStatement.publicMosqueSummary.totalFundsAvailable.toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 7: অডিট ট্রেইল ও নিরাপত্তা লগ (AUDIT & SECURITY)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "audit" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0D7A5F]" />
                    <span>অপরিবর্তনীয় অডিট ট্রেইল ও লেনদেন নিরাপত্তা লগ</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    কে কখন কোন এন্ট্রি দাখিল, অনুমোদন বা সংশোধন করেছেন তার সম্পূর্ণ ইতিহাস
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0D7A5F] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                  {db.auditLogs.length}টি লগ রেকর্ড
                </span>
              </div>

              <div className="space-y-2">
                {db.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-stone-400">{log.timestamp}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                          {log.role}
                        </span>
                      </div>
                      <p className="text-stone-900 dark:text-stone-100 font-bold mt-0.5">{log.details}</p>
                      <span className="text-[10px] text-stone-500">কর্তা: {log.actor} · আইডি: {log.targetId}</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 font-bold">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 8: ব্যাকআপ ও ডেটা পুনরুদ্ধার (BACKUP & RESTORE)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "backup" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <Database className="w-5 h-5 text-[#0D7A5F]" />
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  মসজিদ ERP ডাটাবেস ব্যাকআপ ও পুনরুদ্ধার (JSON Format)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Backup Card */}
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#0D7A5F] flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      সম্পূর্ণ ডাটাবেস ব্যাকআপ ডাউনলোড
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      ১০টি ফান্ড, সদস্য তালিকা, সকল ভাউচার এবং অডিট লগসহ সম্পূর্ণ ডাটাবেস এক্সপোর্ট করুন।
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)</span>
                  </button>
                </div>

                {/* Import / Restore Card */}
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      পূর্ববর্তী ব্যাকআপ ফাইল পুনরুদ্ধার (Restore)
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      পূর্বে সেভ করা `.json` ব্যাকআপ ফাইল সিলেক্ট করে ডাটা রিকভার করুন।
                    </p>
                  </div>
                  <label className="w-full py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>ব্যাকআপ ফাইল আপলোড করুন</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 9: সেটিংস ও কাস্টম ডোমেইন (SETTINGS)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#0D7A5F]" />
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    মসজিদ সেটিংস ও কনফিগারেশন
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal("custom-domain")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>কাস্টম ডোমেইন ম্যানেজ</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">মসজিদ পরিচিতি:</span>
                  <p>নাম: <b>{currentMosque.name}</b></p>
                  <p>ঠিকানা: {currentMosque.address}</p>
                  <p>স্লাগ: <code className="font-mono text-[#0D7A5F]">{currentMosque.slug}</code></p>
                  <p>কাস্টম ডোমেইন: <code className="font-mono text-[#0D7A5F]">{currentMosque.customDomain}</code></p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── 6. NEW MEMBER REGISTRATION DRAWER / MODAL ── */}
      {newMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0D7A5F]" />
                <span>নতুন সদস্য ও মুসল্লি নিবন্ধন</span>
              </h3>
              <button onClick={() => setNewMemberModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMember} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">সদস্যের নাম:</label>
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="যেমন: মুহাম্মদ রফিকুল ইসলাম"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">মোবাইল নম্বর:</label>
                <input
                  type="tel"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold">পদবী / টাইপ:</label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                  >
                    <option value="সাধারণ সদস্য">সাধারণ সদস্য</option>
                    <option value="কমিটি সদস্য">কমিটি সদস্য</option>
                    <option value="আজীবন দাতা">আজীবন দাতা</option>
                    <option value="উপদেষ্টা">উপদেষ্টা</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">মাসিক অঙ্গীকার (৳):</label>
                  <input
                    type="number"
                    value={newMemberForm.pledge}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, pledge: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">ঠিকানা:</label>
                <input
                  type="text"
                  value={newMemberForm.address}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, address: e.target.value })}
                  placeholder="হাড়িনাল, গাজীপুর"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold cursor-pointer shadow-xs mt-2"
              >
                ডাটাবেসে সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. NEW DONATION ENTRY MODAL ── */}
      {newDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-950/80">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#D4AF37]" />
                <span>অনুদানের অর্থ গ্রহণ ও ক্রেডিট এন্ট্রি</span>
              </h3>
              <button onClick={() => setNewDonationModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDonation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">দাতার নাম:</label>
                <input
                  type="text"
                  value={newDonationForm.donorName}
                  onChange={(e) => setNewDonationForm({ ...newDonationForm, donorName: e.target.value })}
                  placeholder="যেমন: হাজী জয়নাল আবেদীন"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">কোন ফান্ডে জমা হবে?</label>
                <select
                  value={newDonationForm.fundId}
                  onChange={(e) => setNewDonationForm({ ...newDonationForm, fundId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                >
                  {db.funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (বর্তমান স্থিতি: ৳{f.currentBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    value={newDonationForm.amount}
                    onChange={(e) => setNewDonationForm({ ...newDonationForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">পরিশোধের মাধ্যম:</label>
                  <select
                    value={newDonationForm.method}
                    onChange={(e) => setNewDonationForm({ ...newDonationForm, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50"
                  >
                    <option value="নগদ (Cash)">নগদ (Cash)</option>
                    <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                    <option value="ব্যাংক ডিপোজিট">ব্যাংক ডিপোজিট</option>
                    <option value="দান বাক্স">দান বাক্স</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-bold cursor-pointer shadow-xs mt-2"
              >
                টাকা গ্রহণ ও ফান্ড ব্যালেন্স আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. REJECT VOUCHER MODAL (Mandatory Reason) ── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1612] border border-rose-300 dark:border-rose-900 rounded-3xl shadow-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              ভাউচার #{rejectVoucherId} প্রত্যাখ্যান
            </h3>
            <p className="text-xs text-stone-500">
              প্রত্যাখ্যান করার জন্য সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="যেমন: অতিরিক্ত মূল্য, বাজার দরের সাথে অসামঞ্জস্য..."
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 text-xs"
              required
            ></textarea>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                প্রত্যাখ্যান নিশ্চিত করুন
              </button>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-bold"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. EXISTING MODAL SUITE PRESERVATION ── */}
      {activeModal === "imam-meal" && (
        <ImamMealRosterModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "purchase-procurement" && (
        <PurchaseProcurementModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
          onVoucherCreated={() => setDb(getMosqueDatabase())}
        />
      )}

      {activeModal === "employee-salary" && (
        <EmployeeSalaryModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "asset-inventory" && (
        <AssetInventoryModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "community-welfare" && (
        <CommunityWelfareModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "custom-domain" && (
        <CustomDomainModal
          onClose={() => setActiveModal(null)}
          mosqueName={currentMosque.name}
          currentSlug={currentMosque.slug}
        />
      )}

      {activeModal === "mosque-discovery" && (
        <MosqueDiscoveryModal
          onClose={() => setActiveModal(null)}
          onSelectMosque={(m, mode) => {
            const updatedDb = getMosqueDatabase();
            updatedDb.mosque = { ...updatedDb.mosque, ...m };
            saveMosqueDatabase(updatedDb);
            setDb(updatedDb);
            setViewMode(mode);
          }}
          onOpenRegisterMosque={() => setActiveModal("register-mosque")}
        />
      )}

      {activeModal === "register-mosque" && (
        <MosqueRegistrationModal
          onClose={() => setActiveModal(null)}
          onMosqueRegistered={(newM) => {
            const updatedDb = getMosqueDatabase();
            updatedDb.mosque = { ...updatedDb.mosque, ...newM };
            saveMosqueDatabase(updatedDb);
            setDb(updatedDb);
            setViewMode("erp");
          }}
        />
      )}

      {activeModal === "super-app" && (
        <SuperAppModal
          onClose={() => setActiveModal(null)}
          onOpenModal={(m) => setActiveModal(m)}
          onOpenQuranReader={onOpenQuranReader}
          onOpenTutor={onOpenTutor}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "admin-360" && (
        <Admin360Modal
          onClose={() => setActiveModal(null)}
          onOpenMasterDues={() => setActiveModal("master-dues")}
          onOpenFunds={() => setActiveModal("funds")}
          onOpenExpenseApproval={() => setActiveModal("purchase-procurement")}
          mosqueName={currentMosque.name}
        />
      )}

      {activeModal === "super-admin" && (
        <SuperAdminModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "master-dues" && (
        <MasterDuesModal
          onClose={() => setActiveModal(null)}
          onRecordPayment={() => setNewDonationModalOpen(true)}
        />
      )}

      {activeModal === "month-detail" && (
        <MonthDetailModal
          period={selectedMonth}
          onClose={() => setActiveModal(null)}
          onRecordPayment={() => setNewDonationModalOpen(true)}
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
          schedule={db.prayerSchedule}
          onClose={() => setActiveModal(null)}
          onSave={(updated) => {
            const updatedDb = getMosqueDatabase();
            updatedDb.prayerSchedule = updated;
            saveMosqueDatabase(updatedDb);
            setDb(updatedDb);
          }}
          onReset={() => {
            refreshDatabase();
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
  );
}
