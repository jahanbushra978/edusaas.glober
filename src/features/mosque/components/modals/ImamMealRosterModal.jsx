"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Send,
  Phone,
  FileText,
  RotateCcw,
  Check,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export function ImamMealRosterModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  currentUserName = "মুহাম্মদ আব্দুল্লাহ",
  currentUserPhone = "০১৭১১-২২৩৩৪৪",
}) {
  const [activeTab, setActiveTab] = useState("roster"); // "roster" | "my-turn" | "transfer-requests" | "history"

  // Master Meal Schedule
  const [schedule, setSchedule] = useState([
    {
      id: "meal-1",
      date: "১৪ নভেম্বর ২০২৬",
      dayName: "শনিবার",
      mealType: "দুপুর ও রাত",
      family: "হাজী মুহাম্মদ আব্দুল্লাহর পরিবার",
      memberId: "M-101",
      phone: "০১৭১১-২২৩৩৪৪",
      status: "COMPLETED",
      notes: "আলহামদুলিল্লাহ, খাবার যথাসময়ে প্রদান করা হয়েছে।",
      isMyTurn: true,
    },
    {
      id: "meal-2",
      date: "১৫ নভেম্বর ২০২৬",
      dayName: "রবিবার (আজ)",
      mealType: "দুপুর ও রাত",
      family: "হাজী রফিকুল ইসলামের পরিবার",
      memberId: "M-102",
      phone: "০১৮১৯-১১২২৩৩",
      status: "CONFIRMED",
      notes: "নির্ধারিত সময়ে হুজরার দস্তরখানে খাবার পৌঁছানো হবে।",
      isMyTurn: false,
    },
    {
      id: "meal-3",
      date: "১৬ নভেম্বর ২০২৬",
      dayName: "সোমবার (আগামীকাল)",
      mealType: "দুপুর ও রাত",
      family: "জনাব শাহিনুর রহমানের পরিবার",
      memberId: "M-104",
      phone: "০১৭২১-৯৯৮৮৭৭",
      status: "CONFIRMED",
      notes: "সম্মতি প্রদান করেছেন।",
      isMyTurn: false,
    },
    {
      id: "meal-4",
      date: "১৭ নভেম্বর ২০২৬",
      dayName: "মঙ্গলবার",
      mealType: "দুপুর ও রাত",
      family: "ডা. আরিফুল ইসলামের পরিবার",
      memberId: "M-105",
      phone: "০১৫২১-৩৩৪৪৫৫",
      status: "PENDING_TRANSFER",
      notes: "জরুরি পারিবারিক সফরে থাকায় অন্য ভাইয়ের কাছে হস্তান্তরের আবেদন করেছেন।",
      isMyTurn: false,
    },
    {
      id: "meal-5",
      date: "১৮ নভেম্বর ২০২৬",
      dayName: "বুধবার",
      mealType: "দুপুর ও রাত",
      family: "মো. কামরুল হাসানের পরিবার",
      memberId: "M-106",
      phone: "০১৮১২-৫৬৭৮৯০",
      status: "CONFIRMED",
      notes: "সম্মতি জ্ঞাপন করেছেন।",
      isMyTurn: false,
    },
    {
      id: "meal-6",
      date: "১৯ নভেম্বর ২০২৬",
      dayName: "বৃহস্পতিবার",
      mealType: "দুপুর ও রাত",
      family: "ইঞ্জি. মোস্তাফিজুর রহমানের পরিবার",
      memberId: "M-107",
      phone: "০১৭৩৩-১১২২৪৪",
      status: "CONFIRMED",
      notes: "নির্ধারিত।",
      isMyTurn: false,
    },
    {
      id: "meal-7",
      date: "২০ নভেম্বর ২০২৬",
      dayName: "শুক্রবার (জুমাবার)",
      mealType: "দুপুর ও রাত (বিশেষ মেহমানদারি)",
      family: "আলহাজ্ব জয়নাল আবেদীনের পরিবার",
      memberId: "M-109",
      phone: "০১৭৮৮-৩৩৪৪৫৫",
      status: "CONFIRMED",
      notes: "জুমার দিন বিশেষ তবাররক ও মেহমানদারি।",
      isMyTurn: false,
    },
  ]);

  // Transfer Application State ("আজকের খাবার দিতে পারব না / অন্য ভাইয়ের কাছে হস্তান্তর")
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferDate, setTransferDate] = useState("১৫ নভেম্বর ২০২৬");
  const [transferReason, setTransferReason] = useState("");
  const [replacementMember, setReplacementMember] = useState("M-106 (মো. কামরুল হাসান)");
  const [alternativeDate, setAlternativeDate] = useState("২২ নভেম্বর ২০২৬");

  // Transfer Requests List
  const [transferRequests, setTransferRequests] = useState([
    {
      id: "TR-2026-004",
      fromMember: "ডা. আরিফুল ইসলাম (M-105)",
      toMember: "মো. কামরুল হাসান (M-106)",
      scheduledDate: "১৭ নভেম্বর ২০২৬",
      reason: "পেশাগত জরুরি ডিউটি ও হাসপাতালে রাত্রিযাপন",
      suggestedSwapDate: "২৪ নভেম্বর ২০২৬",
      status: "PENDING",
      createdAt: "১৪ নভেম্বর ২০২৬, রাত ৯:৩০",
    },
  ]);

  // Handle "আজকের খাবার দিতে পারব না / হস্তান্তর আবেদন"
  const handleSubmitTransfer = (e) => {
    e.preventDefault();
    if (!transferReason.trim()) {
      toast.error("খাবার আয়োজনে অপারগতার সুনির্দিষ্ট কারণ লিখুন");
      return;
    }

    const newReq = {
      id: `TR-2026-00${transferRequests.length + 5}`,
      fromMember: `${currentUserName} (M-101)`,
      toMember: replacementMember,
      scheduledDate: transferDate,
      reason: transferReason.trim(),
      suggestedSwapDate: alternativeDate,
      status: "PENDING",
      createdAt: "আজকের তারিখ ও সময়",
    };

    setTransferRequests([newReq, ...transferRequests]);
    setShowTransferForm(false);
    setTransferReason("");
    toast.success("খাবার দায়িত্ব হস্তান্তরের আবেদন সফলভাবে দাখিল করা হয়েছে! সংশ্লিষ্ট সদস্য ও কমিটিকে নোটিফিকেশন পাঠানো হয়েছে।");
  };

  // Handle Accept / Reject Transfer
  const handleAcceptTransfer = (id) => {
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    toast.success("দায়িত্ব হস্তান্তর গ্রহণ করা হয়েছে! রোস্টার তালিকায় স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।");
  };

  const handleRejectTransfer = (id) => {
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
    toast.error("হস্তান্তরের আবেদনটি প্রত্যাখ্যান করা হয়েছে।");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🍲
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                ইমাম সাহেবের দৈনিক খানা ব্যবস্থাপনা রোস্টার
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · পরিবারভিত্তিক রোটেশন ও স্বয়ংক্রিয় নোটিফিকেশন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Today's Imam Meal Reminder Alert Banner (Section 7.2) */}
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <div>
              <b className="text-amber-900 dark:text-amber-200">আজকের খাবারের দায়িত্ব:</b>
              <span className="text-stone-700 dark:text-stone-300 ml-1">
                হাজী রফিকুল ইসলামের পরিবার (০১৮১৯-১১২২৩৩)
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowTransferForm(true)}
            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer shadow-xs"
          >
            আজকের খাবার দিতে অপারগ?
          </button>
        </div>

        {/* 4 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "roster", label: "📅 সাপ্তাহিক রোস্টার" },
            { key: "my-turn", label: "👤 আমার দায়িত্ব" },
            { key: "transfer-requests", label: `🔄 হস্তান্তর আবেদন (${transferRequests.filter((r) => r.status === "PENDING").length})` },
            { key: "history", label: "📋 সম্পন্ন ইতিহাস" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40 hover:border-emerald-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {/* Transfer Application Modal Form (Section 7.3 & 7.4) */}
          {showTransferForm && (
            <form
              onSubmit={handleSubmitTransfer}
              className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2.5 animate-in fade-in"
            >
              <div className="flex justify-between items-center pb-1 border-b border-amber-200 dark:border-amber-800">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>"আজকের খাবার দিতে পারব না" — দায়িত্ব হস্তান্তর ফরম:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    অপারগতার কারণ (বাধ্যতামূলক):
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: জরুরি সফরে থাকায় / পারিবারিক অসুস্থতা..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-amber-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                      প্রস্তাবিত বিকল্প সদস্য (কার কাছে হস্তান্তর করবেন):
                    </label>
                    <select
                      value={replacementMember}
                      onChange={(e) => setReplacementMember(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-amber-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                    >
                      <option value="M-106 (মো. কামরুল হাসান)">M-106 (মো. কামরুল হাসান)</option>
                      <option value="M-107 (ইঞ্জি. মোস্তাফিজুর রহমান)">M-107 (ইঞ্জি. মোস্তাফিজুর রহমান)</option>
                      <option value="M-109 (আলহাজ্ব জয়নাল আবেদীন)">M-109 (আলহাজ্ব জয়নাল আবেদীন)</option>
                      <option value="M-110 (মো. হাফিজুর রহমান)">M-110 (মো. হাফিজুর রহমান)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                      বিকল্প তারিখ (আপনি কবে খাবার দিবেন):
                    </label>
                    <input
                      type="text"
                      value={alternativeDate}
                      onChange={(e) => setAlternativeDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-amber-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  আবেদন দাখিল করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: MASTER SCHEDULE ROSTER */}
          {activeTab === "roster" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-500 mb-1">
                <span>চলতি সপ্তাহের দৈনিক তালিকা (১৪ - ২০ নভেম্বর ২০২৬):</span>
                <span>মোট ৭ দিন</span>
              </div>

              {schedule.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition shadow-2xs space-y-1.5 ${
                    item.date.includes("আজ")
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30"
                      : "bg-white dark:bg-[#0f1d17] border-stone-200 dark:border-emerald-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 dark:text-stone-100">
                        {item.date} ({item.dayName})
                      </span>
                      {item.date.includes("আজ") && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px]">
                          আজকের দিন
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "CONFIRMED"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "COMPLETED"
                        ? "সম্পন্ন হয়েছে"
                        : item.status === "CONFIRMED"
                        ? "নির্ধারিত"
                        : "হস্তান্তর প্রক্রিয়াধীন"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.family}</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        খাবারের সময়: <b>{item.mealType}</b> · ফোন: {item.phone}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <a
                        href={`tel:${item.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-emerald-950/60 text-stone-700 dark:text-stone-300 font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-100"
                      >
                        <Phone className="w-3 h-3" />
                        <span>কল দিন</span>
                      </a>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      নোট: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MY RESPONSIBILITY */}
          {activeTab === "my-turn" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2">
                <span className="text-xs text-emerald-200">আপনার দায়িত্বের বিবরণ:</span>
                <h3 className="text-base font-black">হাজী মুহাম্মদ আব্দুল্লাহর পরিবার (সদস্য আইডি: M-101)</h3>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[11px]">
                  <div>
                    <span className="opacity-75">বিগত খাবার প্রদানের তারিখ:</span>
                    <div className="font-bold text-amber-300">১৪ নভেম্বর ২০২৬ (সম্পন্ন)</div>
                  </div>
                  <div>
                    <span className="opacity-75">পরবর্তী নির্ধারিত তারিখ:</span>
                    <div className="font-bold text-emerald-300">২১ নভেম্বর ২০২৬ (শনিবার)</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 space-y-2">
                <b className="text-stone-900 dark:text-stone-100">ইমাম সাহেবের মেহমানদারি সংক্রান্ত নির্দেশিকা:</b>
                <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                  <li>দুপুরের খাবার দুপুর ১:০০ ঘটিকার মধ্যে এবং রাতের খাবার রাত ৮:৩০ ঘটিকার মধ্যে হুজরায় পৌঁছানো কাম্য।</li>
                  <li>খাবার বহনের জন্য পরিষ্কার পাত্র ব্যবহার করুন অথবা টিফিন ক্যারিয়ার মসজিদে প্রেরণ করুন।</li>
                  <li>কোনো কারণে নিজে দিতে অপারগ হলে কমপক্ষে ২৪ ঘণ্টা পূর্বে হস্তান্তরের আবেদন করুন।</li>
                </ul>
              </div>

              <button
                onClick={() => setShowTransferForm(true)}
                className="w-full p-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পরবর্তী তারিখ অন্য ভাইয়ের সাথে অদলবদল (Swap) করুন</span>
              </button>
            </div>
          )}

          {/* TAB 3: TRANSFER REQUESTS WORKFLOW */}
          {activeTab === "transfer-requests" && (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-stone-500 mb-1">
                <span>সদস্যদের দায়িত্ব পরিবর্তনের আবেদন ও অনুমোদন:</span>
                <span>{transferRequests.length}টি আবেদন</span>
              </div>

              {transferRequests.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-stone-400">{r.id}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        r.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.status === "PENDING" ? "অনুমোদনের অপেক্ষায়" : r.status === "APPROVED" ? "গৃহীত ও অনুমোদিত" : "বাতিল"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-stone-900 dark:text-stone-100">
                      তারিখ: {r.scheduledDate}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      আবেদনকারী: <b>{r.fromMember}</b> ➔ প্রস্তাবিত বিকল্প: <b>{r.toMember}</b>
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 bg-stone-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-stone-200 dark:border-emerald-900/40">
                      কারণ: <i>"{r.reason}"</i> (বিকল্প তারিখ: {r.suggestedSwapDate})
                    </p>
                  </div>

                  {r.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <button
                        onClick={() => handleAcceptTransfer(r.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        অনুমোদন ও রোস্টার আপডেট
                      </button>
                      <button
                        onClick={() => handleRejectTransfer(r.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs cursor-pointer"
                      >
                        প্রত্যাখ্যান
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: MEAL HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-1">
                নভেম্বর ২০২৬ — খাবার সম্পন্ন হওয়ার ইতিহাস:
              </h4>
              {[
                { date: "১৪ নভেম্বর ২০২৬", family: "হাজী মুহাম্মদ আব্দুল্লাহর পরিবার", status: "যথাসময়ে সম্পন্ন", signedBy: "ইমাম মাওলানা মাহমুদ হাসান" },
                { date: "১৩ নভেম্বর ২০২৬", family: "ইঞ্জি. মোস্তাফিজুর রহমানের পরিবার", status: "যথাসময়ে সম্পন্ন", signedBy: "ইমাম মাওলানা মাহমুদ হাসান" },
                { date: "১২ নভেম্বর ২০২৬", family: "জনাব শাহিনুর রহমানের পরিবার", status: "যথাসময়ে সম্পন্ন", signedBy: "মুয়াজ্জিন হাফেজ কারী বিলাল" },
                { date: "১১ নভেম্বর ২০২৬", family: "মো. কামরুল হাসানের পরিবার", status: "যথাসময়ে সম্পন্ন", signedBy: "ইমাম মাওলানা মাহমুদ হাসান" },
              ].map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between"
                >
                  <div>
                    <b className="text-stone-900 dark:text-stone-100">{h.date}</b>
                    <p className="text-[11px] text-stone-500 mt-0.5">{h.family}</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      গ্রহণকারী: {h.signedBy}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            রোস্টারের পরিবর্তন স্বয়ংক্রিয়ভাবে নোটিফিকেশনে অবহিত করা হয়
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
