"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  MapPin,
  LogIn,
  ExternalLink,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export function MosqueDiscoveryModal({
  onClose,
  onSelectMosque,
  onOpenRegisterMosque,
}) {
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("সব জেলা");

  // Sample Multi-Tenant Mosques in Bangladesh
  const [mosques, setMosques] = useState([
    {
      id: "MAS-2026-0001",
      slug: "baitun-noor",
      name: "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
      address: "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন",
      district: "গাজীপুর",
      established: "১৯৯৮",
      membersCount: 25,
      imam: "মাওলানা মাহমুদ হাসান",
      customDomain: "baitunnoormasjid.org",
      logoLetter: "বা",
    },
    {
      id: "MAS-2026-0002",
      slug: "harinal-central",
      name: "হারিনাল কেন্দ্রীয় জামে মসজিদ",
      address: "হারিনাল বাজার রোড, সদর",
      district: "গাজীপুর",
      established: "১৯৮৫",
      membersCount: 42,
      imam: "মাওলানা আব্দুল বারী",
      customDomain: null,
      logoLetter: "হা",
    },
    {
      id: "MAS-2026-0003",
      slug: "uttara-model",
      name: "উত্তরা মডেল জামে মসজিদ ও মাদরাসা",
      address: "সেক্টর ৭, উত্তরা মডেল টাউন",
      district: "ঢাকা",
      established: "২০১০",
      membersCount: 65,
      imam: "মুফতি এনামুল হক",
      customDomain: "uttaramodelmosque.com",
      logoLetter: "উ",
    },
    {
      id: "MAS-2026-0004",
      slug: "darussalam-jame",
      name: "দারুসসালাম জামে মসজিদ কমপ্লেক্স",
      address: "চাষাড়া, নারায়ণগঞ্জ",
      district: "নারায়ণগঞ্জ",
      established: "২০০২",
      membersCount: 38,
      imam: "মাওলানা আবু বকর সিদ্দিক",
      customDomain: null,
      logoLetter: "দা",
    },
    {
      id: "MAS-2026-0005",
      slug: "sylhet-shahi",
      name: "দরগাহে হযরত শাহজালাল (রহ.) জামে মসজিদ",
      address: "দরগাহ মহল্লা, কোতোয়ালী",
      district: "সিলেট",
      established: "১৩৫০",
      membersCount: 120,
      imam: "মাওলানা আসজাদ হোসেন",
      customDomain: "shahjalalmasjid.org",
      logoLetter: "শা",
    },
  ]);

  const filtered = mosques.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.address.toLowerCase().includes(search.toLowerCase());
    const matchDist = selectedDistrict === "সব জেলা" || m.district === selectedDistrict;
    return matchSearch && matchDist;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🔍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদ অনুসন্ধান ও প্রবেশ (Mosque Discovery)
              </h2>
              <p className="text-xs text-emerald-100">
                বাংলাদেশের যেকোনো মসজিদ খুঁজুন, পাবলিক সাইট দেখুন বা সদস্য আইডিতে লগইন করুন
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

        {/* Search & Filter Bar */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="মসজিদের নাম, Mosque ID (যেমন: MAS-2026-0001) বা এলাকা লিখুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-700 dark:text-stone-200 font-bold"
            >
              <option value="সব জেলা">সব জেলা</option>
              <option value="গাজীপুর">গাজীপুর</option>
              <option value="ঢাকা">ঢাকা</option>
              <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
              <option value="সিলেট">সিলেট</option>
            </select>

            <button
              onClick={() => {
                onClose();
                if (onOpenRegisterMosque) onOpenRegisterMosque();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ আপনার মসজিদ যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Mosques Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              কোনো মসজিদ পাওয়া যায়নি। নতুন মসজিদ নিবন্ধন করতে পারেন।
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2.5 hover:border-emerald-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {m.logoLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                          {m.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-500 font-bold">
                          {m.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{m.address} ({m.district})</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-stone-100 dark:border-emerald-950/60 text-stone-500">
                  <div>পেশ ইমাম: <b>{m.imam}</b></div>
                  <div>নিবন্ধিত সদস্য: <b>{m.membersCount} জন</b></div>
                  <div>প্রতিষ্ঠা: <b>{m.established} ইং</b></div>
                </div>

                {/* Actions: View Public Site vs Login */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                  <button
                    onClick={() => {
                      onClose();
                      if (onSelectMosque) onSelectMosque(m, "public");
                      toast.info(`"${m.name}"-এর পাবলিক ওয়েবসাইট খোলা হয়েছে`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950/50 hover:bg-emerald-100 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1 cursor-pointer border border-stone-200 dark:border-emerald-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>পাবলিক সাইট দেখুন</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onSelectMosque) onSelectMosque(m, "erp");
                      toast.success(`"${m.name}"-এর সদস্য ও অ্যাডমিন পোর্টালে প্রবেশ করা হয়েছে`);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>সদস্য লগইন / ড্যাশবোর্ড</span>
                  </button>
                </div>
              </div>
            ))
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
