"use client";

import React, { useState } from "react";
import {
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import INITIAL_SUBMISSIONS from "../data/teacherReviewData.js";
import TeacherReviewDetailPanel from "./TeacherReviewDetailPanel.jsx";

export default function TeacherAIReviewHub({ _students = [], teacherName = "উস্তাদ" }) {
  const [submissions, setSubmissions] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("rahmania_recitation_review_submissions");
        const custom = raw ? JSON.parse(raw) : [];
        return [...custom, ...INITIAL_SUBMISSIONS];
      } catch {
        return INITIAL_SUBMISSIONS;
      }
    }
    return INITIAL_SUBMISSIONS;
  });

  const [selectedSubId, setSelectedSubId] = useState(() => submissions[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState("all");

  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const handleApproveSubmission = (id, isApproved, overrideData) => {
    setSubmissions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: isApproved ? "approved" : "rejected",
            teacherNotes: overrideData.teacherRemarks,
            teacherOverride: {
              overall: overrideData.calculatedOverall,
              makhraj: overrideData.overrideMakhraj,
              tajweed: overrideData.overrideTajweed,
              fluency: overrideData.overrideFluency,
              remarks: overrideData.teacherRemarks,
              approvedBy: teacherName,
              approvedAt: new Date().toLocaleTimeString("bn-BD"),
            },
          };
        }
        return s;
      });

      if (typeof window !== "undefined") {
        try {
          const custom = updated.filter(
            (s) => s.id.startsWith("sub-") && !["sub-101", "sub-102", "sub-103"].includes(s.id)
          );
          localStorage.setItem("rahmania_recitation_review_submissions", JSON.stringify(custom));
        } catch {}
      }

      return updated;
    });
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="w-full bg-[#03150D] text-slate-100 rounded-2xl border border-emerald-900/60 p-4 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/40 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>রহমানিয়া উস্তাদ এআই রিভিউ হাব (Teacher Verification Hub)</span>
          </h2>
          <p className="text-xs text-slate-400">
            শিক্ষার্থীদের এআই তিলাওয়াত অডিও যাচাই, মাখরাজ বিশ্লেষণ ও চূড়ান্ত গ্রেডিং অনুমোদন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 border-amber-500/40 text-amber-400 text-xs">
              {pendingCount}টি রিভিউ অপেক্ষমান
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-950 pb-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            statusFilter === "all" ? "bg-emerald-800 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          সকল ({submissions.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            statusFilter === "pending" ? "bg-amber-800 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          অপেক্ষমান ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            statusFilter === "approved" ? "bg-teal-800 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          অনুমোদিত ({submissions.filter((s) => s.status === "approved").length})
        </button>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List of Submissions */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-bold">
              এই ফিল্টারে কোনো সাবমিশন নেই।
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const isSelected = sub.id === selectedSub?.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-900/40 border-emerald-500 shadow-md scale-[1.01]"
                      : "bg-slate-900/60 border-emerald-950 hover:bg-slate-900/90 hover:border-emerald-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{sub.studentName}</span>
                        <span className="text-[10px] text-emerald-400 font-normal">({sub.rollNo})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{sub.examTitle}</p>
                    </div>

                    <Badge
                      className={`text-[10px] shrink-0 ${
                        sub.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : sub.status === "rejected"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {sub.status === "approved" ? "অনুমোদিত" : sub.status === "rejected" ? "প্রত্যাখ্যাত" : "অপেক্ষমান"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
                    <span>এআই স্কোর: {sub.aiScore.overall}%</span>
                    <span>{sub.submittedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail & Override Panel */}
        <div className="lg:col-span-7 bg-slate-900/40 rounded-xl border border-emerald-950 p-4">
          <TeacherReviewDetailPanel
            selectedSub={selectedSub}
            teacherName={teacherName}
            onApproveSubmission={handleApproveSubmission}
          />
        </div>
      </div>
    </div>
  );
}
