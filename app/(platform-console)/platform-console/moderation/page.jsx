"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SocialModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending"); // 'pending' | 'resolved_violation' | 'dismissed' | 'all'
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (typeFilter !== "all") query.set("target_type", typeFilter);

      const res = await fetch(`/api/platform/social-moderation?${query.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setReports(data.reports || []);
      } else {
        toast.error(data.error || "রিপোর্ট লোড করতে ব্যর্থ।");
      }
    } catch {
      toast.error("সার্ভার সংযোগে ত্রুটি।");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId, action, notes = "") => {
    setActionLoadingId(reportId);
    try {
      const res = await fetch("/api/platform/social-moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          action,
          notes,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(data.message);
        fetchReports();
      } else {
        toast.error(data.error || "অ্যাকশন ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("অ্যাকশন প্রক্রিয়ায় ত্রুটি।");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
                Social Moderation Queue (সোশ্যাল কনটেন্ট মডারেশন)
              </h1>
              <p className="text-xs text-slate-400">
                উস্তাদ সোশ্যাল ফিড, ভিডিও, মন্তব্য ও প্রোফাইলের বিরুদ্ধে শিক্ষার্থীদের আপত্তি পর্যালোচনা করুন
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* ── STATS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] font-bold text-slate-400">মোট রিপোর্ট প্রাপ্ত</p>
          <p className="text-xl sm:text-2xl font-black text-white">{reports.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
          <p className="text-[11px] font-bold text-amber-300">পর্যালোচনা অপেক্ষমান</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-1">
          <p className="text-[11px] font-bold text-red-300">লঙ্ঘন নিশ্চিত (লুকানো)</p>
          <p className="text-xl sm:text-2xl font-black text-red-400">
            {reports.filter((r) => r.status === "resolved_violation").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
          <p className="text-[11px] font-bold text-emerald-300">খারিজকৃত রিপোর্ট</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">
            {reports.filter((r) => r.status === "dismissed").length}
          </p>
        </div>
      </div>

      {/* ── FILTER CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-400 font-bold px-1">স্ট্যাটাস:</span>
          {["pending", "resolved_violation", "dismissed", "all"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#D4AF37] text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {st === "pending"
                ? "অপেক্ষমান (Pending)"
                : st === "resolved_violation"
                ? "লঙ্ঘন নিশ্চিত"
                : st === "dismissed"
                ? "খারিজকৃত"
                : "সকল স্ট্যাটাস"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">ধরন:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-hidden"
          >
            <option value="all">সকল ধরন</option>
            <option value="post">পোস্ট (Post)</option>
            <option value="comment">মন্তব্য (Comment)</option>
            <option value="teacher_profile">উস্তাদ প্রোফাইল</option>
          </select>
        </div>
      </div>

      {/* ── REPORTS LIST ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold text-xs animate-pulse">
          রিপোর্ট লোড হচ্ছে...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-black text-white">কোনো রিপোর্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400">বর্তমানে কোনো অমীমাংসিত অভিযোগ নেই। প্ল্যাটফর্ম সম্পূর্ণ নিরাপদ ও পরিষ্কার।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const isPending = rep.status === "pending";
            const isLoadingAction = actionLoadingId === rep.id;

            return (
              <div
                key={rep.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg space-y-4 transition hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      className={
                        rep.target_type === "post"
                          ? "bg-blue-900/60 text-blue-300 border-blue-700"
                          : rep.target_type === "comment"
                          ? "bg-purple-900/60 text-purple-300 border-purple-700"
                          : "bg-amber-900/60 text-amber-300 border-amber-700"
                      }
                    >
                      {rep.target_type === "post"
                        ? "পোস্ট"
                        : rep.target_type === "comment"
                        ? "মন্তব্য"
                        : "প্রোফাইল"}
                    </Badge>
                    <span className="text-xs font-black text-white">{rep.reason}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(rep.created_at).toLocaleString("bn-BD")}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        rep.status === "pending"
                          ? "text-amber-400 border-amber-500/30"
                          : rep.status === "resolved_violation"
                          ? "text-red-400 border-red-500/30"
                          : "text-slate-400 border-slate-700"
                      }
                    >
                      {rep.status === "pending"
                        ? "অপেক্ষমান"
                        : rep.status === "resolved_violation"
                        ? "লঙ্ঘন নিশ্চিত (লুকানো)"
                        : "খারিজকৃত"}
                    </Badge>
                  </div>
                </div>

                {/* Details & Target Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/60 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">অভিযোগের বিবরণ:</p>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {rep.details || "কোনো অতিরিক্ত বিবরণ প্রদান করা হয়নি।"}
                    </p>
                    <p className="text-[10px] text-slate-500 pt-1">
                      রিপোর্টার: <strong>{rep.reporter_display}</strong> (গোপনীয়তা সংরক্ষিত)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/60 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">অভিযুক্ত বিষয়বস্তু:</p>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {rep.target_summary}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono pt-1">
                      টার্গেট আইডি: {rep.target_id}
                    </p>
                  </div>
                </div>

                {/* Moderation Actions / Resolution History */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {rep.moderation_notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      সিদ্ধান্ত: {rep.moderation_notes} ({new Date(rep.moderated_at).toLocaleDateString("bn-BD")})
                    </p>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleAction(rep.id, "dismiss", "কোনো ইসলামিক বা প্ল্যাটফর্ম নীতিমালা লঙ্ঘন পাওয়া যায়নি।")}
                          disabled={isLoadingAction}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>খারিজ করুন (Dismiss)</span>
                        </button>

                        <button
                          onClick={() => handleAction(rep.id, "hide_content", "নীতিমালা লঙ্ঘনের কারণে কনটেন্ট লুকানো হয়েছে।")}
                          disabled={isLoadingAction}
                          className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer disabled:opacity-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>লঙ্ঘন নিশ্চিত ও কনটেন্ট লুকান</span>
                        </button>
                      </>
                    ) : (
                      rep.status === "resolved_violation" && (
                        <button
                          onClick={() => handleAction(rep.id, "restore_content", "পুনরায় পর্যালোচনা করে কনটেন্ট সচল করা হয়েছে।")}
                          disabled={isLoadingAction}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কনটেন্ট পুনরুদ্ধার করুন</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
