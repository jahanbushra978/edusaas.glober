"use client";

import React, { useState } from "react";
import {
  X,
} from "lucide-react";
import { toast } from "sonner";

export function CommunityWelfareModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [activeTab, setActiveTab] = useState("applications"); // "applications" | "new-apply" | "disbursements"

  // Welfare Applications
  const [applications, setApplications] = useState([
    {
      id: "WLF-2026-08",
      applicantName: "আব্দুল কাদের (দরিদ্র মুসল্লি)",
      category: "চিকিৎসা সহায়তা",
      requestedAmount: 15000,
      approvedAmount: 12000,
      fundSource: "যাকাত ও সাহায্য ফান্ড",
      reason: "হৃদরোগের জরুরি অপারেশন ও ওষুধ ক্রয়। প্রেসক্রিপশন ও হাসপাতাল বিল সংযুক্ত।",
      status: "APPROVED",
      appliedAt: "১০ নভেম্বর ২০২৬",
      disbursedAt: "১২ নভেম্বর ২০২৬",
      verifiedBy: "মাওলানা মাহমুদ হাসান ও কোষাধ্যক্ষ",
    },
    {
      id: "WLF-2026-09",
      applicantName: "আমেনা বেগম (বিধবা)",
      category: "এতিম ও অসহায় পরিবার সহায়তা",
      requestedAmount: 5000,
      approvedAmount: 5000,
      fundSource: "সদকা ও লিল্লাহ ফান্ড",
      reason: "এতিম দুই সন্তানের পড়াশোনা ও মাসিক খাদ্য সহায়তা।",
      status: "APPROVED",
      appliedAt: "০৮ নভেম্বর ২০২৬",
      disbursedAt: "০৯ নভেম্বর ২০২৬",
      verifiedBy: "সভাপতি ও সহ-সভাপতি",
    },
    {
      id: "WLF-2026-10",
      applicantName: "মো. রফিকুল ইসলাম (রিকশাচালক)",
      category: "দুর্ঘটনা ও জীবিকা পুনর্বাসন",
      requestedAmount: 8000,
      approvedAmount: 0,
      fundSource: "যাকাত ও সাহায্য ফান্ড",
      reason: "দুর্ঘটনায় রিকশা ক্ষতিগ্রস্ত হওয়ায় মেরামত ও পরিবারের ব্যয়।",
      status: "UNDER_REVIEW",
      appliedAt: "১৩ নভেম্বর ২০২৬",
      disbursedAt: "-",
      verifiedBy: "যাচাই প্রক্রিয়াধীন",
    },
  ]);

  // Form state
  const [newApplicant, setNewApplicant] = useState("");
  const [newCategory, setNewCategory] = useState("চিকিৎসা সহায়তা");
  const [newAmount, setNewAmount] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleApply = (e) => {
    e.preventDefault();
    if (!newApplicant.trim() || !newAmount) {
      toast.error("আবেদনকারীর নাম ও সহায়তার পরিমাণ দিন");
      return;
    }
    const newApp = {
      id: `WLF-2026-0${applications.length + 11}`,
      applicantName: newApplicant.trim(),
      category: newCategory,
      requestedAmount: Number(newAmount),
      approvedAmount: 0,
      fundSource: "যাকাত ও সাহায্য ফান্ড",
      reason: newReason.trim(),
      status: "UNDER_REVIEW",
      appliedAt: "আজকের তারিখ",
      disbursedAt: "-",
      verifiedBy: "যাচাই প্রক্রিয়াধীন",
    };
    setApplications([newApp, ...applications]);
    setActiveTab("applications");
    setNewApplicant("");
    setNewAmount("");
    setNewReason("");
    toast.success("সহায়তার আবেদন দাখিল হয়েছে। সমাজকল্যাণ উপ-কমিটি যাচাই করে সিদ্ধান্ত জানাবে।");
  };

  const handleApprove = (id, reqAmount) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "APPROVED",
              approvedAmount: reqAmount,
              disbursedAt: "আজকের তারিখ",
              verifiedBy: "কমিটি কর্তৃক অনুমোদিত",
            }
          : a
      )
    );
    toast.success("সহায়তা অনুমোদিত ও যাকাত/সদকা ফান্ড থেকে বিতরণ নথিভুক্ত করা হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🤝
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                যাকাত, সদকা ও সমাজকল্যাণ সহায়তা ব্যবস্থাপনা
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · অভাবগ্রস্ত পরিবার, চিকিৎসা ও এতিম সহায়তা
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

        {/* 3 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "applications", label: `📋 সহায়তার আবেদন (${applications.length})` },
            { key: "new-apply", label: "+ নতুন সহায়তার আবেদন ফরম" },
            { key: "disbursements", label: "💰 যাকাত ও সদকা বিতরণ ইতিহাস" },
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
          {activeTab === "applications" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">যাকাত ও সাহায্য ফান্ড স্থিতি:</span>
                  <div className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-200">৳১৩,৬০০</div>
                </div>
                <div className="text-right text-[11px] text-stone-600 dark:text-stone-400">
                  <span>🔒 গ্রহীতার গোপনীয়তা সুরক্ষিত</span>
                </div>
              </div>

              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-500">
                        {app.id}
                      </span>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">{app.applicantName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 font-semibold">
                        {app.category}
                      </span>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        app.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {app.status === "APPROVED" ? "অনুমোদিত ও বিতরিত" : "যাচাই প্রক্রিয়াধীন"}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 italic">
                    কারণ: "{app.reason}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                    <div>আবেদনকৃত: <b className="font-mono">৳{app.requestedAmount}</b></div>
                    <div>মঞ্জুরিকৃত: <b className="font-mono text-emerald-700 dark:text-emerald-400">৳{app.approvedAmount}</b></div>
                    <div>তহবিল: <b>{app.fundSource}</b></div>
                    <div>যাচাইকারী: <b>{app.verifiedBy}</b></div>
                  </div>

                  {app.status === "UNDER_REVIEW" && (
                    <div className="flex justify-end pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <button
                        onClick={() => handleApprove(app.id, app.requestedAmount)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        অনুমোদন ও অর্থ বিতরণ করুন
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "new-apply" && (
            <form onSubmit={handleApply} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-3">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                নতুন কল্যাণ সহায়তা আবেদন ফরম:
              </h4>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  সহায়তাপ্রার্থী ব্যক্তির নাম ও সংক্ষিপ্ত পরিচয়:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মো. আব্দুল করিম (দরিদ্র কৃষক / বিধবা)"
                  value={newApplicant}
                  onChange={(e) => setNewApplicant(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    সহায়তার খাত:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                  >
                    <option value="চিকিৎসা সহায়তা">চিকিৎসা সহায়তা</option>
                    <option value="এতিম ও অসহায় সহায়তা">এতিম ও অসহায় পরিবার</option>
                    <option value="শিক্ষা সহায়তা">দরিদ্র শিক্ষার্থীর পড়াশোনা</option>
                    <option value="কাফন-দাফন সহায়তা">কাফন-দাফন ও জানাজা</option>
                    <option value="দুর্যোগকালীন ত্রাণ">দুর্যোগকালীন ত্রাণ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    প্রয়োজনীয় অর্থ (৳):
                  </label>
                  <input
                    type="number"
                    placeholder="যেমন: 5000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  আবেদনের যৌক্তিকতা ও পরিবারের অবস্থা:
                </label>
                <textarea
                  rows={2}
                  placeholder="বিস্তারিত বিবরণ..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  আবেদন দাখিল করুন
                </button>
              </div>
            </form>
          )}

          {activeTab === "disbursements" && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-1">
                যাকাত ও সদকা ফান্ডের অর্থ বিতরণ রেজিস্ট্রি:
              </h4>
              {applications
                .filter((a) => a.status === "APPROVED")
                .map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex justify-between items-center"
                  >
                    <div>
                      <b className="text-stone-900 dark:text-stone-100">{a.applicantName}</b>
                      <p className="text-[11px] text-stone-500">{a.category} · বিতরণ: {a.disbursedAt}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                        ৳{a.approvedAmount.toLocaleString("bn-BD")}
                      </span>
                      <span className="block text-[10px] text-stone-400">{a.fundSource}</span>
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
