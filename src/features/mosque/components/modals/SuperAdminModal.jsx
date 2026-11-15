"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export function SuperAdminModal({ onClose }) {
  const [search, setSearch] = useState("");
  const [mosques, setMosques] = useState([
    {
      id: "mosque-1",
      name: "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
      slug: "baitun-noor",
      district: "গাজীপুর",
      currency: "BDT (৳)",
      startMonth: "২০২৬-০১",
      status: "ACTIVE",
      membersCount: 25,
      monthlyCollection: 65000,
    },
    {
      id: "mosque-2",
      name: "হারিনাল কেন্দ্রীয় জামে মসজিদ",
      slug: "harinal-central",
      district: "গাজীপুর",
      currency: "BDT (৳)",
      startMonth: "২০২৬-০২",
      status: "ACTIVE",
      membersCount: 42,
      monthlyCollection: 88000,
    },
    {
      id: "mosque-3",
      name: "উত্তরা মডেল জামে মসজিদ ও মাদরাসা",
      slug: "uttara-model",
      district: "ঢাকা",
      currency: "BDT (৳)",
      startMonth: "২০২৬-০৩",
      status: "ACTIVE",
      membersCount: 65,
      monthlyCollection: 145000,
    },
    {
      id: "mosque-4",
      name: "দারুসসালাম জামে মসজিদ কমপ্লেক্স",
      slug: "darussalam-jame",
      district: "নারায়ণগঞ্জ",
      currency: "BDT (৳)",
      startMonth: "২০২৬-০৪",
      status: "SUSPENDED",
      membersCount: 18,
      monthlyCollection: 0,
    },
  ]);

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newMosqueName, setNewMosqueName] = useState("");
  const [newMosqueSlug, setNewMosqueSlug] = useState("");
  const [newDistrict, setNewDistrict] = useState("ঢাকা");

  const totalMosques = mosques.length;
  const activeMosques = mosques.filter((m) => m.status === "ACTIVE").length;
  const suspendedMosques = mosques.filter((m) => m.status === "SUSPENDED").length;
  const totalUsers = mosques.reduce((sum, m) => sum + m.membersCount, 0);

  const handleToggleStatus = (id, currentStatus, name) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "SUSPENDED"
        ? `আপনি কি নিশ্চিত "${name}" টেন্যান্ট সাময়িকভাবে স্থগিত করতে চান?`
        : `"${name}" টেন্যান্ট সক্রিয় করতে চান?`;
    if (!confirm(confirmMsg)) return;

    setMosques((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
    );
    toast.success(`"${name}"-এর স্ট্যাটাস ${nextStatus === "ACTIVE" ? "সক্রিয়" : "স্থগিত"} করা হয়েছে!`);
  };

  const handleAddTenantSubmit = (e) => {
    e.preventDefault();
    if (!newMosqueName.trim() || !newMosqueSlug.trim()) {
      toast.error("মসজিদের নাম ও স্ল্যাগ দিন");
      return;
    }
    const newT = {
      id: `mosque-${Date.now()}`,
      name: newMosqueName.trim(),
      slug: newMosqueSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      district: newDistrict,
      currency: "BDT (৳)",
      startMonth: "২০২৬-১১",
      status: "ACTIVE",
      membersCount: 1,
      monthlyCollection: 0,
    };
    setMosques([newT, ...mosques]);
    setShowAddTenant(false);
    setNewMosqueName("");
    setNewMosqueSlug("");
    toast.success(`নতুন মসজিদ টেন্যান্ট "${newT.name}" সফলভাবে তৈরি হয়েছে!`);
  };

  const filtered = mosques.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      m.district.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🌐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদ SaaS মাল্টি-টেন্যান্ট সুপার অ্যাডমিন
              </h2>
              <p className="text-xs text-emerald-100">
                সকল মসজিদ টেন্যান্ট নিয়ন্ত্রণ, মনিটরিং ও গ্লোবাল সাবস্ক্রিপশন
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

        {/* Global SaaS Metrics */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 shrink-0 text-center">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 shadow-2xs">
            <div className="text-[10px] text-stone-500 font-semibold">মোট মসজিদ</div>
            <div className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 font-mono">
              {totalMosques}টি
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">সক্রিয় টেন্যান্ট</div>
            <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {activeMosques}টি
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 shadow-2xs">
            <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">স্থগিত</div>
            <div className="text-sm sm:text-base font-black text-rose-700 dark:text-rose-300 font-mono">
              {suspendedMosques}টি
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 shadow-2xs">
            <div className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">মোট ব্যবহারকারী</div>
            <div className="text-sm sm:text-base font-black text-teal-700 dark:text-teal-300 font-mono">
              {totalUsers} জন
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="মসজিদের নাম, স্ল্যাগ বা জেলা দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddTenant(!showAddTenant)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মসজিদ টেন্যান্ট</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {/* Add Tenant Form Inline */}
          {showAddTenant && (
            <form
              onSubmit={handleAddTenantSubmit}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-2.5 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                নতুন মসজিদ টেন্যান্ট অনবোর্ডিং (স্বতন্ত্র ডেটাবেস স্পেস):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="মসজিদের পুরো নাম"
                  value={newMosqueName}
                  onChange={(e) => setNewMosqueName(e.target.value)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  required
                />
                <input
                  type="text"
                  placeholder="ইউনিক স্ল্যাগ (যেমন: gulshan-central)"
                  value={newMosqueSlug}
                  onChange={(e) => setNewMosqueSlug(e.target.value)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="জেলা / শহর (যেমন: ঢাকা)"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  টেন্যান্ট তৈরি করুন
                </button>
              </div>
            </form>
          )}

          {/* Tenants List */}
          <div className="space-y-2.5">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                        {m.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-500 dark:text-emerald-300 font-bold">
                        /{m.slug}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      অবস্থান: <b>{m.district}</b> · শুরুর মাস: <b>{m.startMonth}</b> · মুদ্রা: <b>{m.currency}</b>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      m.status === "ACTIVE"
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {m.status === "ACTIVE" ? "সক্রিয় টেন্যান্ট" : "সাময়িক স্থগিত"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-stone-100 dark:border-emerald-950/60">
                  <div>
                    <span className="text-[10px] text-stone-400">নিবন্ধিত মুসাল্লি:</span>
                    <div className="font-bold font-mono text-stone-800 dark:text-stone-200">
                      {m.membersCount} জন সদস্য
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">চলতি মাসের চাঁদা আদায়:</span>
                    <div className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      ৳{m.monthlyCollection.toLocaleString("bn-BD")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-stone-100 dark:border-emerald-950/60">
                  <button
                    onClick={() => handleToggleStatus(m.id, m.status, m.name)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${
                      m.status === "ACTIVE"
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {m.status === "ACTIVE" ? "স্থগিত করুন" : "সক্রিয় করুন"}
                  </button>
                  <button
                    onClick={() => toast.success(`"${m.name}"-এর টেন্যান্ট কনসোল লোড করা হয়েছে`)}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shadow-xs"
                  >
                    প্রবেশ করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
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
