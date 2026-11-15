"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Landmark,
  Phone,
  Search,
  Building2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMosqueOnboardingRequests,
  approveMosqueOnboardingRequest,
  rejectMosqueOnboardingRequest,
} from "../../services/mosqueStorage";

export function MosqueApprovalsModal({
  onClose,
  onMosqueApproved,
  onLaunchMosque,
}) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending"); // "pending" | "approved" | "all"
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = () => {
    const list = getMosqueOnboardingRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = (req) => {
    setProcessingId(req.id);
    setTimeout(() => {
      const res = approveMosqueOnboardingRequest(req.id, "সুপার এডমিন (Platform Owner)");
      setProcessingId(null);
      if (res.ok) {
        toast.success(`মাশাআল্লাহ! "${req.name}" সফলভাবে অনুমোদন ও লাইভ করা হয়েছে!`);
        loadRequests();
        if (onMosqueApproved) {
          onMosqueApproved(res.mosque);
        }
      } else {
        toast.error("অনুমোদনে সমস্যা হয়েছে।");
      }
    }, 400);
  };

  const handleReject = (req) => {
    const reason = window.prompt("বাতিল করার কারণ লিখুন (যেমন: অসম্পূর্ণ তথ্য বা ফেক আবেদন):", "সঠিক তথ্যের ঘাটতি");
    if (!reason) return;

    const res = rejectMosqueOnboardingRequest(req.id, "সুপার এডমিন (Platform Owner)", reason);
    if (res.ok) {
      toast.info(`"${req.name}"-এর আবেদন বাতিল করা হয়েছে।`);
      loadRequests();
    }
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      !searchTerm ||
      (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.district || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.submitterPhone || "").includes(searchTerm);

    if (filter === "pending") {
      return matchSearch && (r.approval_status === "pending_approval" || !r.approval_status);
    }
    if (filter === "approved") {
      return matchSearch && r.approval_status === "approved";
    }
    return matchSearch;
  });

  const pendingCount = requests.filter((r) => r.approval_status === "pending_approval" || !r.approval_status).length;
  const approvedCount = requests.filter((r) => r.approval_status === "approved").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  মসজিদ অনবোর্ডিং অনুমোদন কেন্দ্র (Mosque Approvals)
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black animate-pulse">
                    {pendingCount}টি পেন্ডিং
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100">
                নতুন মসজিদের আবেদনসমূহ রিভিউ করুন, ১-ক্লিকে অনুমোদন দিয়ে লাইভ করুন
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

        {/* Filter & Search Bar */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="মসজিদের নাম, ট্র্যাকিং আইডি (যেমন MREQ-2026-...) বা ফোন নম্বর লিখুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex gap-1.5 shrink-0">
            {[
              { key: "pending", label: "পেন্ডিং", count: pendingCount },
              { key: "approved", label: "লাইভ / এপ্রুভড", count: approvedCount },
              { key: "all", label: "সকল আবেদন", count: requests.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  filter === tab.key
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-white dark:bg-[#0f1d17] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-emerald-900/60 hover:bg-stone-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* List of Applications */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
              <p className="font-bold text-stone-600 dark:text-stone-300">কোনো আবেদন পাওয়া যায়নি</p>
              <p className="text-[11px]">পাবলিক ল্যান্ডিং পেজ থেকে ইউজাররা তথ্য ফরম জমা দিলে এখানে দেখা যাবে।</p>
            </div>
          ) : (
            filtered.map((req) => {
              const isApproved = req.approval_status === "approved";
              const isRejected = req.approval_status === "rejected";

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    isApproved
                      ? "bg-white dark:bg-[#0f1d17] border-emerald-300 dark:border-emerald-800/80 shadow-2xs"
                      : isRejected
                      ? "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-75"
                      : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70 shadow-xs"
                  }`}
                >
                  {/* Top Bar: Name, Status, Tracking ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-emerald-950/60">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                          {req.name || req.name_bn}
                        </h4>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
                          {req.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Landmark className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{req.address || `${req.upazila}, ${req.district}`}</span>
                        {req.establishedYear && (
                          <span className="text-stone-400">· স্থাপিত: {req.establishedYear}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : isRejected
                          ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 animate-pulse"
                      }`}>
                        {isApproved ? "✓ লাইভ (Approved)" : isRejected ? "✕ বাতিল (Rejected)" : "⏳ পেন্ডিং (Pending)"}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {req.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-[#07130e] p-3 rounded-xl border border-stone-100 dark:border-emerald-950/60 text-[11px]">
                    <div>
                      <span className="text-stone-400 block">আবেদনকারী / সভাপতি:</span>
                      <strong className="text-stone-800 dark:text-stone-200">
                        {req.submitterName} {req.submitterRole ? `(${req.submitterRole})` : ""}
                      </strong>
                      <div className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{req.submitterPhone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-stone-400 block">পেশ ইমাম / খতীব:</span>
                      <strong className="text-stone-800 dark:text-stone-200">
                        {req.imamName || "মাওলানা পেশ ইমাম"}
                      </strong>
                      {req.imamPhone && (
                        <div className="text-stone-500 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{req.imamPhone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-stone-400 block">ধারণক্ষমতা ও তলা:</span>
                      <strong className="text-stone-800 dark:text-stone-200">
                        {req.musalliCapacity || 500} জন মুসল্লি · {req.floorsCount || 2} তলা
                      </strong>
                    </div>
                  </div>

                  {/* Facilities Tags */}
                  {Array.isArray(req.facilities) && req.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                      <span className="text-[10px] text-stone-400 font-bold">সুযোগ-সুবিধা:</span>
                      {req.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 text-[10px] text-stone-700 dark:text-stone-300 font-medium border border-stone-200 dark:border-emerald-900/60"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                    <div className="text-[10px] text-stone-400">
                      {isApproved && req.approvedBy && (
                        <span>অনুমোদন করেছেন: <b>{req.approvedBy}</b> ({req.approvedAt})</span>
                      )}
                      {isRejected && req.rejectionReason && (
                        <span className="text-red-500">বাতিলের কারণ: {req.rejectionReason}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isApproved && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReject(req)}
                            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-red-600 hover:border-red-400 text-xs font-bold transition cursor-pointer"
                          >
                            বাতিল
                          </button>

                          <button
                            type="button"
                            disabled={processingId === req.id}
                            onClick={() => handleApprove(req)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{processingId === req.id ? "অনুমোদন হচ্ছে..." : "অনুমোদন করুন ও লাইভ করুন"}</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onLaunchMosque) {
                              onLaunchMosque(req);
                            }
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <span>এই মসজিদে প্রবেশ করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-between items-center shrink-0 text-xs">
          <div className="text-[11px] text-stone-500">
            * অনুমোদনের সাথে সাথে টেন্যান্টের জন্য স্বাধীন ১০টি ফান্ড, নামাজ সিডিউল ও মেম্বার পোর্টাল সক্রিয় হয়।
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
