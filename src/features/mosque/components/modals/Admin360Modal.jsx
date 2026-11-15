"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export function Admin360Modal({
  onClose,
  onOpenMasterDues,
  onOpenFunds,
  onOpenExpenseApproval,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [activeTab, setActiveTab] = useState("members"); // "members" | "finance" | "expenses" | "funds"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "pending" | "due"

  const [members, setMembers] = useState([
    { id: "M-101", name: "মুহাম্মদ আব্দুল্লাহ", loginId: "member01", role: "সভাপতি", status: "ACTIVE", pledge: 2000, due: 2000, paid: 2000 },
    { id: "M-102", name: "হাজী রফিকুল ইসলাম", loginId: "member02", role: "সহ-সভাপতি", status: "ACTIVE", pledge: 1500, due: 1500, paid: 1500 },
    { id: "M-103", name: "মাওলানা মাহমুদ হাসান", loginId: "member03", role: "ইমাম ও খতীব", status: "ACTIVE", pledge: 1000, due: 1000, paid: 1000 },
    { id: "M-104", name: "জনাব শাহিনুর রহমান", loginId: "member04", role: "কোষাধ্যক্ষ", status: "ACTIVE", pledge: 1000, due: 1000, paid: 500 },
    { id: "M-105", name: "ডা. আরিফুল ইসলাম", loginId: "member05", role: "সাধারণ সদস্য", status: "PENDING", pledge: 2000, due: 2000, paid: 0 },
    { id: "M-106", name: "মো. কামরুল হাসান", loginId: "member06", role: "সাধারণ সদস্য", status: "ACTIVE", pledge: 1000, due: 1000, paid: 1000 },
    { id: "M-107", name: "ইঞ্জি. মোস্তাফিজুর রহমান", loginId: "member07", role: "উপদেষ্টা", status: "ACTIVE", pledge: 3000, due: 3000, paid: 3000 },
    { id: "M-108", name: "ফারুক আহমেদ", loginId: "member08", role: "সাধারণ সদস্য", status: "PENDING", pledge: 500, due: 500, paid: 0 },
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [newPledge, setNewPledge] = useState(500);
  const [newRole, setNewRole] = useState("সাধারণ সদস্য");

  const handleVerify = (id, name) => {
    const pledgeStr = prompt(`"${name}"-এর মাসিক চাঁদা (Pledge) নির্ধারণ করুন (টাকা):`, "500");
    const p = Number(pledgeStr) || 500;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "ACTIVE", pledge: p, due: p } : m))
    );
    toast.success(`সদস্য "${name}" সক্রিয় ও যাচাই করা হয়েছে! মাসিক চাঁদা: ৳${p}`);
  };

  const handleChangePledge = (id, name, currentPledge) => {
    const p = prompt(`"${name}"-এর নতুন মাসিক চাঁদা (টাকা):`, String(currentPledge));
    if (!p || isNaN(Number(p))) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pledge: Number(p) } : m))
    );
    toast.success(`"${name}"-এর নতুন মাসিক চাঁদা ৳${p} আপডেট করা হয়েছে!`);
  };

  const handleResetPassword = (id, name) => {
    const pass = prompt(`"${name}"-এর নতুন পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৮ অক্ষর):`, "Mosque@12345");
    if (!pass || pass.trim().length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }
    toast.success(`"${name}"-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে!`);
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newLogin.trim()) {
      toast.error("নাম ও লগইন আইডি দিন");
      return;
    }
    const newM = {
      id: `M-${100 + members.length + 1}`,
      name: newName.trim(),
      loginId: newLogin.trim(),
      role: newRole,
      status: "ACTIVE",
      pledge: Number(newPledge) || 500,
      due: Number(newPledge) || 500,
      paid: 0,
    };
    setMembers([newM, ...members]);
    setShowAddMember(false);
    setNewName("");
    setNewLogin("");
    setNewPledge(500);
    toast.success(`নতুন সদস্য "${newM.name}" সফলভাবে যুক্ত হয়েছেন!`);
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.loginId.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ? true :
      statusFilter === "active" ? m.status === "ACTIVE" :
      statusFilter === "pending" ? m.status === "PENDING" :
      (m.due - m.paid) > 0;
    return matchSearch && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদ অ্যাডমিন ৩৬০ ড্যাশবোর্ড
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · সদস্য যাচাই, অঙ্গীকার, চাঁদা ও বিল নিয়ন্ত্রণ
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

        {/* 4 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0">
          {[
            { key: "members", label: "👥 সদস্য খাতা" },
            { key: "finance", label: "📊 ফিন্যান্স ও আদায়" },
            { key: "expenses", label: "🧾 ব্যয় অনুমোদন" },
            { key: "funds", label: "💰 মসজিদ তহবিল" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
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
          {activeTab === "members" && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="সদস্য খুঁজুন (নাম, আইডি, ইউজারনেম)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="flex gap-1.5 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="all">সকল সদস্য</option>
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                    <option value="due">বকেয়া রয়েছে</option>
                  </select>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs whitespace-nowrap hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    + নতুন সদস্য
                  </button>
                </div>
              </div>

              {/* Add Member Inline Card */}
              {showAddMember && (
                <form
                  onSubmit={handleAddMemberSubmit}
                  className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-2 animate-in fade-in"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      নতুন সদস্য নিবন্ধন ফরম (কমিটি অনুমোদন):
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="সদস্যের পুরো নাম"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                      required
                    />
                    <input
                      type="text"
                      placeholder="লগইন আইডি (যেমন: member25)"
                      value={newLogin}
                      onChange={(e) => setNewLogin(e.target.value)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                      required
                    />
                    <input
                      type="number"
                      placeholder="মাসিক চাঁদা অঙ্গীকার (Pledge ৳)"
                      value={newPledge}
                      onChange={(e) => setNewPledge(e.target.value)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-mono"
                      required
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                    >
                      <option value="সাধারণ সদস্য">সাধারণ সদস্য</option>
                      <option value="মুতাওয়াল্লী">মুতাওয়াল্লী</option>
                      <option value="কোষাধ্যক্ষ">কোষাধ্যক্ষ</option>
                      <option value="ইমাম">ইমাম</option>
                      <option value="উপদেষ্টা">উপদেষ্টা</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      সংরক্ষণ ও সক্রিয় করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Members List Table / Cards */}
              <div className="space-y-2">
                {filteredMembers.map((m) => {
                  const remaining = Math.max(0, m.due - m.paid);
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-600 dark:text-emerald-300 font-bold">
                            {m.id}
                          </span>
                          <h4 className="text-xs font-black text-stone-900 dark:text-stone-100">
                            {m.name}
                          </h4>
                          <span className="text-[10px] text-stone-400">({m.role})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === "ACTIVE"
                              ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {m.status === "ACTIVE" ? "সক্রিয়" : "অপেক্ষমাণ"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                        <div>
                          <span className="text-stone-400">মাসিক অঙ্গীকার:</span>
                          <div className="font-bold font-mono text-stone-800 dark:text-stone-200">
                            ৳{m.pledge}
                          </div>
                        </div>
                        <div>
                          <span className="text-stone-400">চলতি আদায়:</span>
                          <div className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            ৳{m.paid}
                          </div>
                        </div>
                        <div>
                          <span className="text-stone-400">বকেয়া:</span>
                          <div className={`font-bold font-mono ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            ৳{remaining}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-stone-100 dark:border-emerald-950/60 text-[10px]">
                        {m.status === "PENDING" && (
                          <button
                            onClick={() => handleVerify(m.id, m.name)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                          >
                            যাচাই ও সক্রিয় করুন
                          </button>
                        )}
                        <button
                          onClick={() => handleChangePledge(m.id, m.name, m.pledge)}
                          className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-emerald-950/50 hover:bg-emerald-100 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
                        >
                          Pledge পরিবর্তন
                        </button>
                        <button
                          onClick={() => handleResetPassword(m.id, m.name)}
                          className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-emerald-950/50 hover:bg-emerald-100 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
                        >
                          পাসওয়ার্ড রিসেট
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2">
                <span className="text-xs text-emerald-200">মাসিক চাঁদা সংগ্রহ সারসংক্ষেপ:</span>
                <div className="text-2xl font-black font-mono">৳৬৫,০০০ / ৳৭৮,৫০০</div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "83%" }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-200 pt-1">
                  <span>আদায় সম্পন্ন: ১৮ জন (৮৩%)</span>
                  <span>বকেয়া রয়েছে: ৭ জন</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenMasterDues) onOpenMasterDues();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                <span>📊 মাস্টার হিসাব শিট খুলুন (সকল সদস্যের ১২ মাসের হিসাব)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <b className="text-amber-900 dark:text-amber-200">অপেক্ষমাণ বিল ১টি:</b>
                <p className="text-stone-600 dark:text-stone-300">
                  মাইক ও আইপিএস ব্যাটারি মেরামত (৳১২,৫০০) — অনুমোদনের অপেক্ষায়
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenExpenseApproval) onOpenExpenseApproval();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                <span>🧾 ব্যয় ও ভাউচার অনুমোদন প্যানেল খুলুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === "funds" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60">
                  <span className="text-stone-500 text-[10px]">সাধারণ পরিচালন ফান্ড</span>
                  <div className="text-base font-black font-mono text-emerald-700">৳৮৫,০০০</div>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60">
                  <span className="text-stone-500 text-[10px]">নির্মাণ ও সংস্কার ফান্ড</span>
                  <div className="text-base font-black font-mono text-emerald-700">৳৭৫,০০০</div>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60">
                  <span className="text-stone-500 text-[10px]">ইমাম-মুয়াজ্জিন হাদিয়া</span>
                  <div className="text-base font-black font-mono text-emerald-700">৳২৫,০০০</div>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60">
                  <span className="text-stone-500 text-[10px]">যাকাত ও সাহায্য ফান্ড</span>
                  <div className="text-base font-black font-mono text-emerald-700">৳১৩,৬০০</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenFunds) onOpenFunds();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                <span>💰 তহবিলের পূর্ণ বিবরণী খুলুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
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
