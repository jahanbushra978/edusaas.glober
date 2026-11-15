"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  MapPin,
  LogIn,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRegisteredMosques,
  getMosqueOnboardingRequests,
  switchActiveMosque,
} from "../../services/mosqueStorage";

export function MosqueDiscoveryModal({
  onClose,
  onSelectMosque,
  onOpenRegisterMosque,
}) {
  const [activeTab, setActiveTab] = useState("directory"); // "directory" | "tracking"
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("সব জেলা");

  // Dynamic Live Mosques from mosqueStorage
  const [mosques, setMosques] = useState([]);

  // Application Tracking State
  const [trackingQuery, setTrackingQuery] = useState("");
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  useEffect(() => {
    const list = getRegisteredMosques();
    setMosques(list);
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingQuery.trim()) {
      toast.error("অনুগ্রহ করে ট্র্যাকিং আইডি বা মোবাইল নম্বর দিন");
      return;
    }

    const allRequests = getMosqueOnboardingRequests();
    const query = trackingQuery.trim().toLowerCase();
    const found = allRequests.find(
      (r) =>
        (r.id && r.id.toLowerCase() === query) ||
        (r.submitterPhone && r.submitterPhone.includes(query)) ||
        (r.phone && r.phone.includes(query)) ||
        (r.mosqueId && r.mosqueId.toLowerCase() === query)
    );

    setTrackedRequest(found || null);
    setTrackingSearched(true);

    if (found) {
      toast.success("আবেদনের তথ্য পাওয়া গেছে!");
    } else {
      toast.error("এই আইডিতে কোনো আবেদন পাওয়া যায়নি");
    }
  };

  const filtered = mosques.filter((m) => {
    const matchSearch =
      !search ||
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.imam || "").toLowerCase().includes(search.toLowerCase());

    const matchDist = selectedDistrict === "সব জেলা" || m.district === selectedDistrict;
    return matchSearch && matchDist;
  });

  const handleChooseMosque = (mosqueItem, mode) => {
    switchActiveMosque(mosqueItem.id);
    onClose();
    if (onSelectMosque) {
      onSelectMosque(mosqueItem, mode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
              🔍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদ অনুসন্ধান ও ডিরেক্টরি (Mosque Discovery)
              </h2>
              <p className="text-xs text-emerald-100">
                বাংলাদেশের যেকোনো লাইভ মসজিদে প্রবেশ করুন অথবা আপনার আবেদনের অগ্রগতি জানুন
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

        {/* Tab Switcher: Live Directory vs Track Application */}
        <div className="p-2.5 bg-stone-100 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "directory"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-white dark:bg-[#0f1d17] text-stone-700 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              🕌 লাইভ মসজিদসমূহ ({mosques.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tracking")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "tracking"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-white dark:bg-[#0f1d17] text-stone-700 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              📋 আবেদনের স্ট্যাটাস যাচাই
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRegisterMosque) onOpenRegisterMosque();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ নতুন মসজিদ যুক্ত করুন</span>
          </button>
        </div>

        {/* ── TAB 1: LIVE DIRECTORY ── */}
        {activeTab === "directory" && (
          <>
            {/* Search & District Filter */}
            <div className="p-3 bg-stone-50 dark:bg-[#091812] border-b border-stone-200 dark:border-emerald-900/40 flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="মসজিদের নাম, আইডি বা এলাকা লিখে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-700 dark:text-stone-200 font-bold"
              >
                <option value="সব জেলা">সব জেলা</option>
                <option value="ঢাকা">ঢাকা</option>
                <option value="গাজীপুর">গাজীপুর</option>
                <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
                <option value="সিলেট">সিলেট</option>
                <option value="কুমিল্লা">কুমিল্লা</option>
                <option value="চট্টগ্রাম">চট্টগ্রাম</option>
              </select>
            </div>

            {/* Mosques Results List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-stone-400 space-y-2">
                  <Building2 className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
                  <p className="font-bold text-stone-600 dark:text-stone-300">কোনো মসজিদ পাওয়া যায়নি</p>
                  <p className="text-[11px]">আপনার মসজিদটি তালিকায় না থাকলে উপরে "+ নতুন মসজিদ যুক্ত করুন" বাটনে ক্লিক করে নিবন্ধন করুন।</p>
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
                          {m.logoLetter || (m.name || "ম")[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                              {m.name || m.name_bn}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/70 text-stone-500 font-bold">
                              {m.id}
                            </span>
                            <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                              ✓ লাইভ
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{m.address} ({m.district})</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-stone-100 dark:border-emerald-950/60 text-stone-500">
                      <div>পেশ ইমাম: <b>{m.imam || "মাওলানা পেশ ইমাম"}</b></div>
                      <div>নিবন্ধিত সদস্য: <b>{m.membersCount || 1} জন</b></div>
                      <div>প্রতিষ্ঠা: <b>{m.established || "২০১৮"} ইং</b></div>
                    </div>

                    {/* Actions: View Public Site vs Login */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                      <button
                        onClick={() => handleChooseMosque(m, "public")}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950/50 hover:bg-emerald-100 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1 cursor-pointer border border-stone-200 dark:border-emerald-800 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>পাবলিক সাইট দেখুন</span>
                      </button>

                      <button
                        onClick={() => handleChooseMosque(m, "erp")}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>সদস্য লগইন / ড্যাশবোর্ড</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── TAB 2: APPLICATION TRACKING ── */}
        {activeTab === "tracking" && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/60 space-y-3">
              <div>
                <b className="text-stone-900 dark:text-stone-100 block text-xs">
                  আপনার আবেদনের অগ্রগতি যাচাই করুন:
                </b>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  অনবোর্ডিং ফরম সাবমিটের পর প্রাপ্ত ট্র্যাকিং নম্বর (যেমন MREQ-2026-0001) বা আপনার মোবাইল নম্বরটি লিখুন।
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: MREQ-2026-0001 অথবা ০১৭১১-XXXXXX"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                >
                  স্ট্যাটাস দেখুন ➔
                </button>
              </form>
            </div>

            {/* Tracking Result Display */}
            {trackingSearched && (
              <div className="pt-2">
                {trackedRequest ? (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                            {trackedRequest.name || trackedRequest.name_bn}
                          </h4>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold">
                            {trackedRequest.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {trackedRequest.address || `${trackedRequest.upazila}, ${trackedRequest.district}`}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {trackedRequest.approval_status === "approved" ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>অনুমোদিত ও লাইভ</span>
                          </span>
                        ) : trackedRequest.approval_status === "rejected" ? (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs flex items-center gap-1 border border-red-300">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>আবেদন বাতিল</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>রিভিউ চলমান (পেন্ডিং)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 dark:bg-[#07130e] p-2.5 rounded-xl border border-stone-100 dark:border-emerald-950/60">
                      <div>
                        <span className="text-stone-400 block">আবেদনকারী:</span>
                        <strong>{trackedRequest.submitterName} ({trackedRequest.submitterPhone})</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">আবেদনের তারিখ:</span>
                        <strong>{trackedRequest.submittedAt}</strong>
                      </div>
                    </div>

                    {trackedRequest.approval_status === "approved" ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
                        <span>মাশাআল্লাহ! আপনার মসজিদটি প্ল্যাটফর্মে লাইভ হয়ে গেছে। এখনই প্রবেশ করে পরিচালনা করুন:</span>
                        <button
                          type="button"
                          onClick={() => {
                            switchActiveMosque(trackedRequest.mosqueId);
                            onClose();
                            if (onSelectMosque) {
                              onSelectMosque({
                                id: trackedRequest.mosqueId,
                                name: trackedRequest.name,
                                slug: trackedRequest.slug,
                                district: trackedRequest.district,
                                address: trackedRequest.address,
                              }, "public");
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition"
                        >
                          <span>মসজিদে যান</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : trackedRequest.approval_status === "pending_approval" || !trackedRequest.approval_status ? (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200">
                        ⏳ আপনার আবেদনটি এডমিন টিম সক্রিয়ভাবে পর্যালোচনা করছে। অনুমোদন সম্পন্ন হওয়া মাত্রই আপনার প্রদত্ত মোবাইল নম্বরে এসএমএস যাবে এবং ওয়েবসাইট লাইভ হয়ে যাবে।
                      </p>
                    ) : (
                      <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                        {trackedRequest.rejectionReason || "তথ্য অসঙ্গতির কারণে আবেদনটি নামঞ্জুর করা হয়েছে। দয়া করে সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন।"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-400 space-y-1">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-500" />
                    <p className="font-bold text-stone-600 dark:text-stone-300">কোনো আবেদন খুঁজে পাওয়া যায়নি</p>
                    <p className="text-[11px]">অনুগ্রহ করে ট্র্যাকিং আইডি বা মোবাইল নম্বরটি পুনরায় যাচাই করুন।</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-stone-500">
            {activeTab === "directory" ? `মোট ${filtered.length}টি লাইভ মসজিদ প্রদর্শিত` : "Edusaas মাল্টি-টেন্যান্ট মসজিদ ক্লাউড"}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-300 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
