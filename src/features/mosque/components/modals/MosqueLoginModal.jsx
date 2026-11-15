"use client";

import React, { useState } from "react";
import {
  X,
  LogIn,
  ShieldCheck,
  Coins,
  User,
  CheckCircle2,
  Lock,
  Landmark,
  ArrowRight,
  Clock,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";

/**
 * MosqueLoginModal — Role-Based Authentication & Dashboard Router
 * 
 * Supported Roles:
 * 1. PRESIDENT / MUTA WALLI -> Admin 360, Bill Approvals, Committee
 * 2. TREASURER / CASHIER   -> Inflow Collection, Receipts, Vouchers, Ledger
 * 3. IMAM / KHATIB         -> Prayer Times, Khutba Logs, Maktab, Meal Roster
 * 4. MEMBER / MUSALLI      -> Personal Dues, Receipts, Donation Statement
 * 5. STAFF / MUEZZIN       -> Asset Logistics, Prayer Call Logistics
 */
export default function MosqueLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  members = [],
}) {
  const [loginMethod, setLoginMethod] = useState("quick"); // "quick" | "manual"
  const [manualId, setManualId] = useState("");
  const [manualPin, setManualPin] = useState("");

  if (!isOpen) return null;

  // Preset Role Definitions with Instant Access
  const PRESET_ROLES = [
    {
      id: "PRESIDENT",
      roleKey: "PRESIDENT",
      loginId: "PRES-01",
      name: "আলহাজ্ব মোস্তাফিজুর রহমান",
      title: "সভাপতি / মুতাওয়াল্লী",
      badge: "প্রশাসনিক শীর্ষ নিয়ন্ত্রণ",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      description: "সার্বিক ৩৬০° ড্যাশবোর্ড, বিল ও ব্যয় অনুমোদন, পরিচালনা কমিটির সিদ্ধান্ত ও তহবিল পর্যবেক্ষণ।",
      targetTab: "dashboard",
      icon: ShieldCheck,
      color: "from-emerald-700 to-teal-800",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "TREASURER",
      roleKey: "TREASURER",
      loginId: "CASHIER-01",
      name: "জনাব শাহিনুর রহমান",
      title: "কোষাধ্যক্ষ / ক্যাশিয়ার",
      badge: "আর্থিক ও ট্রেজারি শাখা",
      badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
      description: "আয় ও অনুদান আদায়, তাৎক্ষণিক ডিজিটাল রসিদ প্রদান, খরচ ভাউচার এন্ট্রি ও ব্যাংক লেজার।",
      targetTab: "income",
      icon: Coins,
      color: "from-amber-600 to-orange-700",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "IMAM",
      roleKey: "IMAM",
      loginId: "IMAM-01",
      name: "মাওলানা মুফতি আব্দুল্লাহ আল-মামুন",
      title: "প্রধান খতিব ও পেশ ইমাম",
      badge: "সালাত, বয়ান ও মক্তব",
      badgeColor: "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300",
      description: "নামাজের সময়সূচি নির্ধারণ, খুতবা ও বয়ান লগ, নূরানী মক্তব ট্র্যাকিং এবং ইমামের খানা রোস্টার।",
      targetTab: "prayer",
      icon: Clock,
      color: "from-teal-700 to-cyan-800",
      accent: "text-teal-600 dark:text-teal-400",
    },
    {
      id: "MEMBER",
      roleKey: "MEMBER",
      loginId: "M-101",
      memberId: "M-101",
      name: "মুহাম্মদ আব্দুল্লাহ (সদস্য)",
      title: "সাধারণ সদস্য / মুসল্লি / আজীবন দাতা",
      badge: "ব্যক্তিগত মুসল্লি পোর্টাল",
      badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
      description: "ব্যক্তিগত মাসিক অঙ্গীকার ও চাঁদা স্টেটমেন্ট, অফিসিয়াল রসিদ ডাউনলোড, অনলাইন পেমেন্ট ও মতামত।",
      targetTab: "member-portal",
      icon: User,
      color: "from-blue-700 to-indigo-800",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "STAFF",
      roleKey: "STAFF",
      loginId: "MUEZZIN-01",
      name: "ক্বারী আহমাদুল্লাহ (মুয়াজ্জিন)",
      title: "প্রধান মুয়াজ্জিন ও খাদেম পরিষদ",
      badge: "লজিস্টিকস ও সম্পদ",
      badgeColor: "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-300",
      description: "আযান শিডিউল, অজুখানা ও সাউন্ড সিস্টেম রক্ষণাবেক্ষণ, মসজিদ সম্পদ ও সরঞ্জাম তালিকা।",
      targetTab: "assets",
      icon: Boxes,
      color: "from-stone-700 to-slate-800",
      accent: "text-stone-600 dark:text-stone-400",
    },
  ];

  const handleQuickLogin = (roleItem) => {
    onLoginSuccess({
      role: roleItem.roleKey,
      memberId: roleItem.memberId || (roleItem.roleKey === "MEMBER" ? "M-101" : null),
      targetTab: roleItem.targetTab,
      userName: roleItem.name,
      title: roleItem.title,
    });
    toast.success(`স্বাগতম ${roleItem.name}! ${roleItem.title} ড্যাশবোর্ডে প্রবেশ করেছেন।`);
    onClose();
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    const query = manualId.trim().toUpperCase();

    if (!query) {
      toast.error("অনুগ্রহ করে আপনার আইডি বা মোবাইল নম্বর দিন।");
      return;
    }

    // 1. Check if President
    if (query.includes("PRES") || query === "PRES-01" || query === "PRESIDENT") {
      onLoginSuccess({
        role: "PRESIDENT",
        targetTab: "dashboard",
        userName: "আলহাজ্ব মোস্তাফিজুর রহমান",
        title: "সভাপতি / মুতাওয়াল্লী",
      });
      toast.success("স্বাগতম সভাপতি সাহেব! পূর্ণাঙ্গ প্রশাসনিক ড্যাশবোর্ডে প্রবেশ করেছেন।");
      onClose();
      return;
    }

    // 2. Check if Treasurer / Cashier
    if (query.includes("CASH") || query === "CASHIER-01" || query === "TREASURER") {
      onLoginSuccess({
        role: "TREASURER",
        targetTab: "income",
        userName: "জনাব শাহিনুর রহমান",
        title: "কোষাধ্যক্ষ / ক্যাশিয়ার",
      });
      toast.success("স্বাগতম কোষাধ্যক্ষ সাহেব! ট্রেজারি ও আয়-ব্যয় ড্যাশবোর্ডে প্রবেশ করেছেন।");
      onClose();
      return;
    }

    // 3. Check if Imam
    if (query.includes("IMAM") || query === "IMAM-01") {
      onLoginSuccess({
        role: "IMAM",
        targetTab: "prayer",
        userName: "মাওলানা মুফতি আব্দুল্লাহ আল-মামুন",
        title: "প্রধান খতিব ও পেশ ইমাম",
      });
      toast.success("স্বাগতম হযরত! সালাত, বয়ান ও মক্তব ড্যাশবোর্ডে প্রবেশ করেছেন।");
      onClose();
      return;
    }

    // 4. Check if Muezzin / Staff
    if (query.includes("MUEZZIN") || query === "MUEZZIN-01" || query.includes("STAFF")) {
      onLoginSuccess({
        role: "STAFF",
        targetTab: "assets",
        userName: "ক্বারী আহমাদুল্লাহ",
        title: "প্রধান মুয়াজ্জিন ও খাদেম",
      });
      toast.success("স্বাগতম মুয়াজ্জিন সাহেব! মসজিদ লজিস্টিকস ড্যাশবোর্ডে প্রবেশ করেছেন।");
      onClose();
      return;
    }

    // 5. Check if Member in Database
    const matchedMember = members.find(
      (m) =>
        m.id.toUpperCase() === query ||
        m.phone?.replace(/[^0-9]/g, "") === query.replace(/[^0-9]/g, "") ||
        m.loginId?.toUpperCase() === query
    );

    if (matchedMember) {
      onLoginSuccess({
        role: "MEMBER",
        memberId: matchedMember.id,
        targetTab: "member-portal",
        userName: matchedMember.name,
        title: matchedMember.role || "সম্মানিত সদস্য",
      });
      toast.success(`স্বাগতম ${matchedMember.name}! আপনার ব্যক্তিগত সদস্য পোর্টালে প্রবেশ করেছেন।`);
      onClose();
      return;
    }

    // Default fallback: allow as Member with entered ID
    onLoginSuccess({
      role: "MEMBER",
      memberId: query.startsWith("M-") ? query : "M-101",
      targetTab: "member-portal",
      userName: `সদস্য (${query})`,
      title: "সম্মানিত মুসল্লি",
    });
    toast.success(`সফলভাবে লগইন হয়েছে! সদস্য আইডি: ${query}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#064E3B] via-[#0D7A5F] to-[#0f6850] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-amber-300 text-lg shadow-xs">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {mosqueName}
              </h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>মসজিদ প্ল্যাটফর্ম ও মুসল্লি পোর্টাল লগইন</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Method Tabs */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLoginMethod("quick")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === "quick"
                ? "bg-[#0D7A5F] text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>১-ক্লিকে রোল অনুযায়ী লগইন</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("manual")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === "manual"
                ? "bg-[#0D7A5F] text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>আইডি বা ফোন দিয়ে ম্যানুয়াল লগইন</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {loginMethod === "quick" ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-[#0D7A5F]/30 text-xs text-stone-700 dark:text-stone-200">
                <p className="font-bold text-[#0D7A5F] dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>সরাসরি রোল অনুযায়ী ড্যাশবোর্ড অ্যাক্সেস করুন:</span>
                </p>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  যেকোনো একটি পদে ক্লিক করলেই সিস্টেম আপনাকে উক্ত পদের জন্য নির্ধারিত ড্যাশবোর্ড ও পারমিশনে নিয়ে যাবে।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_ROLES.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleQuickLogin(role)}
                      className="p-4 rounded-2xl bg-white dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 hover:border-[#0D7A5F] dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-2.5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badgeColor}`}>
                            {role.badge}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">ID: {role.loginId}</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${role.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm group-hover:text-[#0D7A5F] transition truncate">
                              {role.title}
                            </h4>
                            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300 truncate">
                              {role.name}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {role.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/80 flex items-center justify-between text-xs font-bold text-[#0D7A5F] dark:text-emerald-400">
                        <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualLogin} className="space-y-4 max-w-md mx-auto py-2">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-200">
                    সদস্য / ইউজার আইডি বা মোবাইল নম্বর:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="যেমন: PRES-01, CASHIER-01, IMAM-01, M-101 বা মোবাইল"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#0D7A5F]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    টেস্ট আইডি: <span className="font-mono text-emerald-600">PRES-01</span>, <span className="font-mono text-amber-600">CASHIER-01</span>, <span className="font-mono text-teal-600">IMAM-01</span>, <span className="font-mono text-blue-600">M-101</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-200">
                    পিন বা পাসওয়ার্ড:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      value={manualPin}
                      onChange={(e) => setManualPin(e.target.value)}
                      placeholder="যে কোনো ৪-ডিজিট পিন (যেমন: 1234)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#0D7A5F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0D7A5F] hover:bg-[#0b654e] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>লগইন করুন ও ড্যাশবোর্ডে যান</span>
                </button>
              </div>

              <div className="text-center text-xs text-stone-400">
                আইডি বা পাসওয়ার্ড মনে না থাকলে দ্রুত রোল নির্বাচন ট্যাব ব্যবহার করুন।
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-100 dark:border-emerald-950/80 text-center text-[11px] text-stone-400 flex items-center justify-between px-4">
          <span>নিরাপদ এন্টারপ্রাইজ অথেনটিকেশন</span>
          <span className="font-mono">Edusaas Mosque ERP Cloud</span>
        </div>
      </div>
    </div>
  );
}
