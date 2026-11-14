"use client";

import React, { useState } from "react";
import {
  Receipt,
  X,
  CheckCircle2,
  Printer,
  Coins,
  Filter,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

// ── 1. MONTH DETAIL & DUES LEDGER MODAL ──
export function MonthDetailModal({
  period = "নভেম্বর ২০২৬",
  members: propMembers,
  onRecordPayment,
  onClose,
}) {
  const [filter, setFilter] = useState("ALL"); // ALL | PAID | PARTIAL | UNPAID
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const DEFAULT_MONTH_MEMBERS = [
    { id: "M-101", name: "মুহাম্মদ আব্দুল্লাহ", phone: "০১৭১১-২২৩৩৪৪", role: "মুতাওয়াল্লী", pledge: 2000, paid: 2000, remaining: 0, status: "PAID", date: "০১ নভে ২০২৬", method: "বিকাশ" },
    { id: "M-102", name: "হাজী রফিকুল ইসলাম", phone: "০১৮১৯-১১২২৩৩", role: "সহ-সভাপতি", pledge: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০২ নভে ২০২৬", method: "নগদ ক্যাশ" },
    { id: "M-103", name: "মাওলানা মাহমুদ হাসান", phone: "০১৯১১-৪৪৫৫৬৬", role: "খতীব ও ইমাম", pledge: 1000, paid: 1000, remaining: 0, status: "PAID", date: "০১ নভে ২০২৬", method: "নগদ ক্যাশ" },
    { id: "M-104", name: "জনাব শাহিনুর রহমান", phone: "০১৭২১-৯৯৮৮৭৭", role: "কোষাধ্যক্ষ", pledge: 1000, paid: 500, remaining: 500, status: "PARTIAL", date: "০৫ নভে ২০২৬", method: "নগদ" },
    { id: "M-105", name: "ডা. আরিফুল ইসলাম", phone: "০১৫২১-৩৩৪৪৫৫", role: "সাধারণ সদস্য", pledge: 2000, paid: 0, remaining: 2000, status: "UNPAID", date: "-", method: "-" },
    { id: "M-106", name: "মো. কামরুল হাসান", phone: "০১৮১২-৫৬৭৮৯০", role: "সাধারণ সদস্য", pledge: 1000, paid: 1000, remaining: 0, status: "PAID", date: "০৩ নভে ২০২৬", method: "ব্যাংক" },
    { id: "M-107", name: "ইঞ্জি. মোস্তাফিজুর রহমান", phone: "০১৭৩৩-১১২২৪৪", role: "উপদেষ্টা", pledge: 3000, paid: 3000, remaining: 0, status: "PAID", date: "০৪ নভে ২০২৬", method: "চেক" },
    { id: "M-108", name: "ফারুক আহমেদ", phone: "০১৯২২-৮৮৯৯০০", role: "সাধারণ সদস্য", pledge: 500, paid: 0, remaining: 500, status: "UNPAID", date: "-", method: "-" },
    { id: "M-109", name: "আলহাজ্ব জয়নাল আবেদীন", phone: "০১৭৮৮-৩৩৪৪৫৫", role: "সদস্য", pledge: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০৬ নভে ২০২৬", method: "নগদ ক্যাশ" },
    { id: "M-110", name: "মো. হাফিজুর রহমান", phone: "০১৮৩৩-৪৪৩৩২২", role: "সদস্য", pledge: 800, paid: 800, remaining: 0, status: "PAID", date: "০৭ নভে ২০২৬", method: "বিকাশ" },
  ];

  const list = propMembers || DEFAULT_MONTH_MEMBERS;

  const totalExpected = list.reduce((sum, m) => sum + (m.pledge || 0), 0);
  const totalCollected = list.reduce((sum, m) => sum + (m.paid || 0), 0);
  const totalRemaining = list.reduce((sum, m) => sum + (m.remaining || (m.pledge - m.paid)), 0);
  const paidCount = list.filter((m) => m.status === "PAID").length;

  const filtered = list.filter((m) => {
    const matchFilter =
      filter === "ALL" ? true :
      filter === "PAID" ? m.status === "PAID" :
      filter === "PARTIAL" ? m.status === "PARTIAL" : m.status === "UNPAID";
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মাসিক চাঁদা ও আদায় খাতা — {period}
              </h2>
              <p className="text-xs text-emerald-100">
                কোন সদস্য কত দিয়েছেন এবং কার কত বকেয়া রয়েছে তার পূর্ণাঙ্গ তালিকা
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

        {/* 3 Metric Pills Header */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 shrink-0 text-center">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 shadow-2xs">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">প্রত্যাশিত পাওনা</div>
            <div className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 font-mono">
              ৳{totalExpected.toLocaleString("bn-BD")}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">আদায় হয়েছে</div>
            <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
              ৳{totalCollected.toLocaleString("bn-BD")}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 shadow-2xs">
            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">বকেয়া রয়েছে</div>
            <div className="text-sm sm:text-base font-black text-rose-700 dark:text-rose-300 font-mono">
              ৳{totalRemaining.toLocaleString("bn-BD")}
            </div>
          </div>
        </div>

        {/* Search & Filter Chips */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="সদস্যের নাম বা আইডি দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: "ALL", label: `সব (${list.length})` },
              { id: "PAID", label: `পরিশোধিত (${paidCount})` },
              { id: "PARTIAL", label: "আংশিক" },
              { id: "UNPAID", label: "বকেয়া" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  filter === chip.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Member List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              কোনো সদস্য পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500 transition"
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
                    <span>মাসিক অঙ্গীকার: ৳{m.pledge}</span>
                    <span>·</span>
                    <span className="text-stone-400">{m.phone}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                      ৳{m.paid.toLocaleString("bn-BD")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === "PAID"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                          : m.status === "PARTIAL"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                          : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {m.status === "PAID" ? "পরিশোধিত" : m.status === "PARTIAL" ? "আংশিক" : "বকেয়া"}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 justify-end">
                    {m.status === "PAID" ? (
                      <button
                        onClick={() => setSelectedReceipt(m)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>রসিদ</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onRecordPayment) onRecordPayment(m.id);
                          toast.info(`${m.name}-এর চাঁদা আদায় ফরম প্রদর্শিত`);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
                      >
                        আদায় করুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-stone-600 dark:text-stone-300">
            মোট সদস্য: {list.length} জন · আদায়: {paidCount} জন
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Child Receipt Popup */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80">
          <div className="w-full max-w-sm bg-white text-stone-900 rounded-3xl p-5 shadow-2xl space-y-4 border border-emerald-300">
            <div className="text-center pb-3 border-b border-stone-200">
              <span className="text-xs font-bold text-emerald-800">বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স</span>
              <h3 className="text-base font-black text-stone-900">অফিসিয়াল চাঁদা আদায় রসিদ</h3>
              <p className="text-[10px] text-stone-500 font-mono">রসিদ নং: RCPT-2026-{selectedReceipt.id}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">দাতার নাম:</span>
                <span className="font-bold">{selectedReceipt.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">সদস্য আইডি:</span>
                <span className="font-mono font-bold">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">মাস / পিরিয়ড:</span>
                <span className="font-bold">{period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">পরিশোধের মাধ্যম:</span>
                <span className="font-bold">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">পরিশোধের তারিখ:</span>
                <span className="font-bold">{selectedReceipt.date}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-xs font-bold">পরিশোধিত পরিমাণ:</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  ৳{selectedReceipt.paid.toLocaleString("bn-BD")}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-stone-300 text-center">
              <p className="text-[10px] text-stone-500 italic">
                “আল্লাহ তাআলা আপনার দানকে কবুল করুন এবং সম্পদে বরকত দান করুন।” — আমীন
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success("প্রিন্ট কমান্ড পাঠানো হয়েছে");
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200 cursor-pointer"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 2. MY ACCOUNT STATEMENT MODAL ──
export function MyAccountStatementModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [selectedReceiptMonth, setSelectedReceiptMonth] = useState(null);

  const STATEMENTS = [
    { period: "নভেম্বর ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০২ নভে ২০২৬", rcpt: "RCPT-1102" },
    { period: "অক্টোবর ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০৩ অক্টো ২০২৬", rcpt: "RCPT-1003" },
    { period: "সেপ্টেম্বর ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০৪ সেপ্টে ২০২৬", rcpt: "RCPT-0904" },
    { period: "আগস্ট ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০২ আগ ২০২৬", rcpt: "RCPT-0802" },
    { period: "জুলাই ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০৫ জুলাই ২০২৬", rcpt: "RCPT-0705" },
    { period: "জুন ২০২৬", due: 1500, paid: 1500, remaining: 0, status: "PAID", date: "০১ জুন ২০২৬", rcpt: "RCPT-0601" },
  ];

  const totalPaid = STATEMENTS.reduce((sum, s) => sum + s.paid, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">আমার চাঁদার হিসাব বিবরণী</h2>
              <p className="text-xs text-emerald-100">মুহাম্মদ আব্দুল্লাহ (আইডি: member01 · সভাপতি)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-4 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 shrink-0">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-3 shadow-md">
            <div className="flex justify-between items-center text-xs">
              <span className="opacity-90">নির্ধারিত মাসিক চাঁদা:</span>
              <span className="font-bold text-amber-300 font-mono">৳১,৫০০ / মাস</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs opacity-90">সর্বমোট পরিশোধিত ইনফাক:</span>
              <span className="text-2xl font-black text-white font-mono">৳{totalPaid.toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/15 text-xs">
              <span className="text-emerald-200">বর্তমান বকেয়ার স্থিতি:</span>
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>পরিশোধিত (কোনো বকেয়া নেই)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Statement Months List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <h4 className="text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
            বিগত মাসসমূহের চাঁদা ও রসিদ তালিকা:
          </h4>
          {STATEMENTS.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 flex items-center justify-between text-xs shadow-2xs"
            >
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">{s.period}</div>
                <div className="text-[10px] text-stone-400 mt-0.5">পরিশোধ: {s.date} · {s.rcpt}</div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="font-black font-mono text-emerald-700 dark:text-emerald-300">৳{s.paid}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">পরিশোধিত</div>
                </div>
                <button
                  onClick={() => {
                    toast.success(`${s.period}-এর অফিসিয়াল ডিজিটাল রসিদ জেনারেট করা হয়েছে`);
                  }}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                  title="রসিদ ডাউনলোড"
                >
                  <Receipt className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. EXPENSE APPROVAL & VOUCHER MODAL ──
export function ExpenseApprovalModal({ onClose }) {
  const [expenses, setExpenses] = useState([
    {
      id: "VCH-2026-089",
      title: "মাইক ও আইপিএস ব্যাটারি মেরামত ও এসিড চার্জ",
      fund: "সাধারণ পরিচালন ফান্ড",
      amount: 12500,
      submittedBy: "খতীব মাওলানা মাহমুদ হাসান",
      date: "১২ নভেম্বর ২০২৬",
      status: "PENDING_APPROVAL",
      notes: "জুমার নামাজের পূর্বে সাউন্ড সিস্টেম ঠিক করার জরুরি বিল। অনুমোদনের পর কোষাধ্যক্ষ পরিশোধ করবেন।",
    },
    {
      id: "VCH-2026-088",
      title: "মসজিদের অজুখানা ও ওয়াশরুম ক্লিনার ও সামগ্রী ক্রয়",
      fund: "সাধারণ পরিচালন ফান্ড",
      amount: 3200,
      submittedBy: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      date: "০৮ নভেম্বর ২০২৬",
      status: "PAID",
      notes: "অনুমোদিত ও ক্যাশ পরিশোধিত।",
    },
    {
      id: "VCH-2026-087",
      title: "দ্বিতীয় তলার ছাদ ঢালাইয়ের রড ও সিমেন্ট বিল",
      fund: "নির্মাণ ও সংস্কার ফান্ড",
      amount: 45000,
      submittedBy: "ইঞ্জি. মোস্তাফিজুর রহমান",
      date: "০৩ নভেম্বর ২০২৬",
      status: "PAID",
      notes: "চেক নং #৯৮৭৬৩৪৫ মাধ্যমে পরিশোধিত।",
    },
  ]);

  const [activeTab, setActiveTab] = useState("pending");

  const handleApprove = (id) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "APPROVED" } : e))
    );
    toast.success("বিলটি অনুমোদিত হয়েছে! কোষাধ্যক্ষ এখন অর্থ প্রদান করতে পারবেন।");
  };

  const handleReject = (id) => {
    const reason = prompt("প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করুন:");
    if (!reason) return;
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "REJECTED", notes: `প্রত্যাখ্যাত: ${reason}` } : e))
    );
    toast.error("বিলটি প্রত্যাখ্যান করা হয়েছে।");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মসজিদ খরচ ও বিল অনুমোদন</h2>
              <p className="text-xs text-emerald-100">সদস্যদের ইনফাক তহবিলের স্বচ্ছ ব্যয় ব্যবস্থাপনা</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            অপেক্ষমাণ বিল ({expenses.filter((e) => e.status === "PENDING_APPROVAL").length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            সকল খরচের ইতিহাস ({expenses.length})
          </button>
        </div>

        {/* Expenses List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {expenses
            .filter((e) => (activeTab === "pending" ? e.status === "PENDING_APPROVAL" : true))
            .map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-stone-400">{e.id}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      e.status === "PENDING_APPROVAL"
                        ? "bg-amber-100 text-amber-800"
                        : e.status === "APPROVED"
                        ? "bg-teal-100 text-teal-800"
                        : e.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {e.status === "PENDING_APPROVAL"
                      ? "অনুমোদনের অপেক্ষায়"
                      : e.status === "APPROVED"
                      ? "অনুমোদিত"
                      : e.status === "PAID"
                      ? "পরিশোধিত"
                      : "প্রত্যাখ্যাত"}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">{e.title}</h4>
                  <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                    ৳{e.amount.toLocaleString("bn-BD")}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 space-y-0.5">
                  <div>তহবিল: <b className="text-stone-700 dark:text-stone-300">{e.fund}</b></div>
                  <div>জমাদাতা: {e.submittedBy} · তারিখ: {e.date}</div>
                  <div className="italic text-stone-400">{e.notes}</div>
                </div>

                {e.status === "PENDING_APPROVAL" && (
                  <div className="pt-2 border-t border-stone-100 dark:border-emerald-950 flex gap-2">
                    <button
                      onClick={() => handleApprove(e.id)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      অনুমোদন করুন
                    </button>
                    <button
                      onClick={() => handleReject(e.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer"
                    >
                      প্রত্যাখ্যান
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
