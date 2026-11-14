"use client";

import React, { useState } from "react";
import {
  X,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Wrench,
  Search,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export function AssetInventoryModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [activeTab, setActiveTab] = useState("assets"); // "assets" | "maintenance" | "add"
  const [search, setSearch] = useState("");

  const [assets, setAssets] = useState([
    {
      id: "AST-01",
      name: "তোয়াবা ৪০০০ ওয়াট মসজিদ সাউন্ড অ্যাম্প্লিফায়ার",
      category: "সাউন্ড সিস্টেম",
      cost: 48000,
      purchasedAt: "১৫ জানুয়ারি ২০২৪",
      condition: "ভালো (সচল)",
      location: "মেহরাব সংলগ্ন কন্ট্রোল রুম",
      warranty: "২ বছর",
    },
    {
      id: "AST-02",
      name: "ওয়্যারলেস মাইক্রোফোন সেট (২টি হ্যান্ডহোল্ড + ১টি কলার)",
      category: "সাউন্ড সিস্টেম",
      cost: 14500,
      purchasedAt: "২০ ফেব্রুয়ারি ২০২৪",
      condition: "ভালো (সচল)",
      location: "খতীবের মিম্বার ও ইমাম কামরা",
      warranty: "১ বছর",
    },
    {
      id: "AST-03",
      name: "জিএফসি হেভি ডিউটি সিলিং ফ্যান (মোট ১৬টি)",
      category: "বৈদ্যুতিক সরঞ্জাম",
      cost: 64000,
      purchasedAt: "১০ মে ২০২৩",
      condition: "১৪টি সচল, ২টি মেরামত প্রয়োজন",
      location: "মূল নামাজ কক্ষ ও বারান্দা",
      warranty: "৫ বছর",
    },
    {
      id: "AST-04",
      name: "গ্রী ৪ টন ক্যাসেট টাইপ এসি (২টি)",
      category: "শীতাতপ নিয়ন্ত্রণ",
      cost: 260000,
      purchasedAt: "০১ মার্চ ২০২৪",
      condition: "ভালো (সচল)",
      location: "মূল জামাত হলরুম",
      warranty: "৫ বছর কম্প্রেসার",
    },
    {
      id: "AST-05",
      name: "তুর্কি লাল ভেলভেট মসজিদ কার্পেট (৫টি কাতার)",
      category: "আসবাবপত্র ও কার্পেট",
      cost: 175000,
      purchasedAt: "১২ আগস্ট ২০২৩",
      condition: "ভালো",
      location: "মূল নামাজ কক্ষ",
      warranty: "লাইফটাইম",
    },
    {
      id: "AST-06",
      name: "দাহুয়া আইপি সিসিটিভি ক্যামেরা সেট (৮টি ক্যামেরা + এনভিআর)",
      category: "নিরাপত্তা ও আইটি",
      cost: 52000,
      purchasedAt: "০৫ নভেম্বর ২০২৩",
      condition: "ভালো (সচল)",
      location: "গেট, অজুখানা ও অভ্যন্তরীণ চারপাশ",
      warranty: "২ বছর",
    },
  ]);

  // Maintenance Records
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: "MNT-2026-04",
      assetName: "আইপিএস ও মাইক ব্যাটারি এসিড চার্জ",
      cost: 12500,
      date: "১২ নভেম্বর ২০২৬",
      vendor: "মেসার্স শাহজালাল ব্যাটারি হাউজ",
      status: "সম্পন্ন",
      technician: "মো. রফিক মিস্ত্রি",
    },
    {
      id: "MNT-2026-03",
      assetName: "পূর্ব পাশের ২ টন এসি গ্যাস রিফিল ও ফিল্টার ওয়াশ",
      cost: 4500,
      date: "১০ অক্টোবর ২০২৬",
      vendor: "শীতল কুলিং সার্ভিস",
      status: "সম্পন্ন",
      technician: "আরিফ হোসেন",
    },
  ]);

  const totalAssetValue = assets.reduce((sum, a) => sum + a.cost, 0);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🏢
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদের সম্পদ, মালামাল ও মেইনটেন্যান্স
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · সাউন্ড, এসি, কার্পেট, সিসিটিভি ও স্থায়ী সম্পদের হিসাব
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

        {/* 2 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "assets", label: `📦 স্থায়ী সম্পদ তালিকা (${assets.length})` },
            { key: "maintenance", label: `🔧 মেরামত ও রক্ষণাবেক্ষণ ইতিহাস (${maintenanceRecords.length})` },
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {activeTab === "assets" && (
            <div className="space-y-3">
              {/* Asset Value Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-emerald-200">মোট স্থায়ী সম্পদের মূল্যায়ন:</span>
                  <div className="text-2xl font-black font-mono">
                    ৳{totalAssetValue.toLocaleString("bn-BD")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-200">নথিভুক্ত আইটেম:</span>
                  <div className="text-base font-bold text-amber-300 font-mono">{assets.length}টি প্রধান ক্যাটাগরি</div>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="সম্পদের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              {/* Assets List */}
              <div className="space-y-2">
                {filteredAssets.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-500">
                          {a.id}
                        </span>
                        <h4 className="font-bold text-stone-900 dark:text-stone-100">{a.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {a.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <div>অবস্থান: <b>{a.location}</b></div>
                      <div>ক্রয় তারিখ: <b>{a.purchasedAt}</b></div>
                      <div>বর্তমান স্থিতি: <b className="text-emerald-700 dark:text-emerald-400">{a.condition}</b></div>
                      <div>ওয়ারেন্টি: <b>{a.warranty}</b></div>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <span className="text-[10px] text-stone-400">ক্রয়মূল্য:</span>
                      <span className="font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                        ৳{a.cost.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-1">
                মেরামত ও রক্ষণাবেক্ষণ ইতিহাস খাতা:
              </h4>
              {maintenanceRecords.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1.5"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-stone-900 dark:text-stone-100">{m.assetName}</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">
                      ৳{m.cost.toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    তারিখ: {m.date} · মেকানিক: {m.technician} ({m.vendor})
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1 border-t border-stone-100 dark:border-emerald-950">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>কমিটি কর্তৃক যাচাইকৃত ও বিল পরিশোধিত</span>
                  </div>
                </div>
              ))}
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
