"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Receipt,
  X,
  CheckCircle2,
  Printer,
  Coins,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export function MasterDuesModal({
  members,
  onUpdateMembers,
  funds,
  onUpdateFunds,
  mosqueName,
  mosqueAddress,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | PAID | PARTIAL | UNPAID
  const [selectedMember, setSelectedMember] = useState(null);
  const [payAmount, setPayAmount] = useState(1000);
  const [payFund, setPayFund] = useState("general");
  const [payMethod, setPayMethod] = useState("নগদ (Cash)");

  // Add Member
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("সাধারণ সদস্য");
  const [newPledge, setNewPledge] = useState(500);

  // Printed Receipt
  const [receipt, setReceipt] = useState(null);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalPledged = members.reduce((sum, m) => sum + (m.pledge || 0), 0);
    const totalCollected = members.reduce((sum, m) => sum + (m.paid || 0), 0);
    const totalDue = Math.max(0, totalPledged - totalCollected);
    const paidCount = members.filter((m) => m.status === "PAID").length;
    return { totalPledged, totalCollected, totalDue, paidCount, count: members.length };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search) ||
        m.id.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "PAID") return m.status === "PAID";
      if (filter === "PARTIAL") return m.status === "PARTIAL";
      if (filter === "UNPAID") return m.status === "UNPAID";
      return true;
    });
  }, [members, search, filter]);

  // Handle Record Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedMember || payAmount <= 0) return;

    const receiptNo = `VOUCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const updated = members.map((m) => {
      if (m.id === selectedMember.id) {
        const newPaid = (m.paid || 0) + Number(payAmount);
        const newStatus = newPaid >= m.pledge ? "PAID" : "PARTIAL";
        return { ...m, paid: newPaid, status: newStatus, lastDate: todayStr };
      }
      return m;
    });

    onUpdateMembers(updated);

    // Update funds
    if (onUpdateFunds && funds) {
      const updatedFunds = funds.map((f) =>
        f.id === payFund ? { ...f, balance: f.balance + Number(payAmount) } : f
      );
      onUpdateFunds(updatedFunds);
    }

    setReceipt({
      receiptNo,
      date: todayStr,
      memberName: selectedMember.name,
      memberId: selectedMember.id,
      phone: selectedMember.phone,
      amount: Number(payAmount),
      fundName: funds?.find((f) => f.id === payFund)?.name || "সাধারণ তহবিল",
      method: payMethod,
      mosqueName,
      mosqueAddress,
    });

    setSelectedMember(null);
    toast.success(`৳${Number(payAmount).toLocaleString("bn-BD")} চাঁদা সফলভাবে জমা নেওয়া হয়েছে!`);
  };

  // Handle Add Member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newM = {
      id: `M-${100 + members.length + 1}`,
      name: newName.trim(),
      phone: newPhone.trim() || "০১৭১১-০০০০০০",
      role: newRole,
      pledge: Number(newPledge) || 500,
      paid: 0,
      status: "UNPAID",
      lastDate: "-",
    };

    onUpdateMembers([newM, ...members]);
    setShowAddMember(false);
    setNewName("");
    setNewPhone("");
    toast.success("নতুন সদস্য সফলভাবে তালিকাভুক্ত হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-emerald-100 dark:border-emerald-850 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <span>মাসিক হিসাব মাস্টার শিট (Master Dues)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                  নভেম্বর ২০২৬
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                প্রতি সদস্যের ধার্য চাঁদা, আদায়কৃত টাকা, বকেয়া ও ডিজিটাল মানি রিসিট
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Summary Metric Pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">মোট সক্রিয় সদস্য</span>
              <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">{summary.count} জন</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">পরিশোধ করেছেন: {summary.paidCount} জন</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ধার্য মাসিক চাঁদা</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">৳{summary.totalPledged.toLocaleString("bn-BD")}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">মাসিক লক্ষ্যমাত্রা</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">মোট সংগৃহীত চাঁদা</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">৳{summary.totalCollected.toLocaleString("bn-BD")}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                আদায় হার: {Math.round((summary.totalCollected / (summary.totalPledged || 1)) * 100)}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">অবশিষ্ট বকেয়া</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">৳{summary.totalDue.toLocaleString("bn-BD")}</div>
              <div className="text-[10px] text-rose-500 mt-0.5">বকেয়া: {summary.count - summary.paidCount} জন</div>
            </div>
          </div>

          {/* Search, Filter & Add Member Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, পদবী বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${filter === "ALL" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-300"}`}
                >
                  সকল ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("PAID")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${filter === "PAID" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-300"}`}
                >
                  পরিশোধিত
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("UNPAID")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${filter === "UNPAID" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-300"}`}
                >
                  বকেয়া
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন সদস্য
              </button>
            </div>
          </div>

          {/* Mobile Native Cards View (< md) */}
          <div className="md:hidden space-y-2.5">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white">{m.name}</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1.5">
                      <span>{m.role}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{m.id}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      m.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200"
                        : m.status === "PARTIAL"
                        ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200"
                        : "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/60 dark:text-rose-200"
                    }`}
                  >
                    {m.status === "PAID" ? "পরিশোধিত" : m.status === "PARTIAL" ? "আংশিক" : "বকেয়া"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">মোবাইল</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{m.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ধার্য / আদায়</span>
                    <span className="font-black text-slate-800 dark:text-white">
                      ৳{m.pledge} / <span className="text-emerald-600">৳{m.paid}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(m);
                    setPayAmount(Math.max(500, m.pledge - m.paid));
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>চাঁদা জমা গ্রহণ করুন</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-black border-b border-emerald-100 dark:border-emerald-800">
                  <tr>
                    <th className="p-3">আইডি</th>
                    <th className="p-3">সদস্যের নাম ও পদবী</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3 text-right">মাসিক ধার্য</th>
                    <th className="p-3 text-right">আদায়কৃত</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">সর্বশেষ তারিখ</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{m.id}</td>
                      <td className="p-3">
                        <div className="font-black text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">{m.role}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{m.phone}</td>
                      <td className="p-3 text-right font-black">৳{m.pledge.toLocaleString("bn-BD")}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ৳{m.paid.toLocaleString("bn-BD")}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            m.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200"
                              : m.status === "PARTIAL"
                              ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200"
                              : "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/60 dark:text-rose-200"
                          }`}
                        >
                          {m.status === "PAID" ? "পরিশোধিত" : m.status === "PARTIAL" ? "আংশিক" : "বকেয়া"}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-500 text-[11px]">{m.lastDate}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember(m);
                            setPayAmount(Math.max(500, m.pledge - m.paid));
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                        >
                          চাঁদা গ্রহণ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Nested Modal: Record Payment Form */}
      {selectedMember && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-emerald-200 dark:border-emerald-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-black text-base text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                চাঁদা জমা ভাউচার
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[11px] text-slate-500">সদস্যের নাম:</div>
                <div className="text-sm font-black text-emerald-950 dark:text-emerald-100">{selectedMember.name}</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  আইডি: {selectedMember.id} · মাসিক ধার্য: ৳{selectedMember.pledge}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200">জমার পরিমাণ (৳):</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200">তহবিল খাত:</label>
                <select
                  value={payFund}
                  onChange={(e) => setPayFund(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {funds?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  )) || (
                    <>
                      <option value="general">সাধারণ পরিচালনা তহবিল</option>
                      <option value="construction">মসজিদ উন্নয়ন তহবিল</option>
                      <option value="salary">ইমাম-মুয়াজ্জিন হাদিয়া</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200">পেমেন্ট মাধ্যম:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="নগদ (Cash)">নগদ (Cash)</option>
                  <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                  <option value="নগদ রকেট / ব্যাংক ট্রান্সফার">রকেট / ব্যাংক ট্রান্সফার</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  জমা নিশ্চিত ও রসিদ তৈরি
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nested Modal: Add Member */}
      {showAddMember && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-emerald-200 dark:border-emerald-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-black text-base text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                নতুন মসজিদ সদস্য অন্তর্ভুক্তি
              </div>
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="p-1 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">সদস্যের পুরো নাম:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: হাজী মোঃ দেলোয়ার হোসেন"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="০১৭১১-০০০০০০"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">সদস্যের পদবী / ধরণ:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="সাধারণ সদস্য">সাধারণ সদস্য</option>
                  <option value="স্থায়ী সদস্য">স্থায়ী সদস্য</option>
                  <option value="উপদেষ্টা সদস্য">উপদেষ্টা সদস্য</option>
                  <option value="কার্যনির্বাহী সদস্য">কার্যনির্বাহী সদস্য</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">ধার্য মাসিক চাঁদা (৳):</label>
                <input
                  type="number"
                  value={newPledge}
                  onChange={(e) => setNewPledge(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  সদস্য যুক্ত করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nested Modal: Printable Receipt Voucher */}
      {receipt && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ডিজিটাল জমা ভাউচার
              </span>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-5 space-y-3 bg-emerald-50/20">
              <div className="text-center pb-2 border-b border-emerald-100">
                <h3 className="font-black text-lg text-emerald-950">{receipt.mosqueName}</h3>
                <p className="text-[11px] text-slate-500">{receipt.mosqueAddress}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  মানি রিসিট নং: {receipt.receiptNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">সদস্যের নাম:</span>
                  <div className="font-black text-slate-900">{receipt.memberName}</div>
                </div>
                <div>
                  <span className="text-slate-400">সদস্য আইডি:</span>
                  <div className="font-mono font-bold">{receipt.memberId}</div>
                </div>
                <div>
                  <span className="text-slate-400">তহবিল খাত:</span>
                  <div className="font-bold">{receipt.fundName}</div>
                </div>
                <div>
                  <span className="text-slate-400">জমার তারিখ ও মাধ্যম:</span>
                  <div className="font-bold">
                    {receipt.date} ({receipt.method})
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200 flex justify-between items-center">
                <span className="text-sm font-black text-slate-700">আদায়কৃত টাকা:</span>
                <span className="text-2xl font-black text-emerald-700">
                  ৳{receipt.amount.toLocaleString("bn-BD")}
                </span>
              </div>

              <div className="pt-4 flex justify-between text-[10px] text-slate-400">
                <div>আদায়কারী: অফিস সহকারী</div>
                <div>অনুমোদন: মুতাওয়াল্লী / কোষাধ্যক্ষ</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDuesModal;
