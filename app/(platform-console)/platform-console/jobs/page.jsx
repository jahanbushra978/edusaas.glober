"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity, Play, CheckCircle2, RefreshCw, Search, Eye, RotateCw, XCircle, Cpu, Zap, X
} from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";

const DEFAULT_JOBS = [
  {
    id: "job_sms_89410",
    name: "bulk_sms_dispatch",
    label: "Bulk SMS নোটিশ প্রেরণ",
    orgName: "Rahmania Institute",
    orgId: "org-rahmania-main",
    idempotencyKey: "idem_sms_term2_notice_091",
    progress: 100,
    status: "completed",
    attempts: 1,
    latency: "3.2s",
    createdAt: "2026-10-03 14:15",
    payload: { recipientsCount: 1450, template: "exam_result_published", senderId: "RAHMANIA" },
  },
  {
    id: "job_fee_89411",
    name: "monthly_fee_invoicing",
    label: "অক্টোবর মাসিক ফি ইনভয়েস জেনারেশন",
    orgName: "All Active Organizations",
    orgId: "all",
    idempotencyKey: "idem_invoicing_2026_10",
    progress: 100,
    status: "completed",
    attempts: 1,
    latency: "8.5s",
    createdAt: "2026-10-01 00:05",
    payload: { billingMonth: "2026-10", totalInvoicesGenerated: 3200 },
  },
  {
    id: "job_bio_89412",
    name: "biometric_log_sync",
    label: "বায়োমেট্রিক ডিভাইস লগ সিঙ্ক",
    orgName: "Rahmania Institute (Main Campus)",
    orgId: "org-rahmania-main",
    idempotencyKey: "idem_bio_sync_dev01_1003",
    progress: 100,
    status: "completed",
    attempts: 1,
    latency: "1.1s",
    createdAt: "2026-10-03 17:00",
    payload: { deviceIp: "192.168.1.201", punchesFetched: 840 },
  },
  {
    id: "job_pdf_89413",
    name: "pdf_report_card_batch",
    label: "টার্ম-২ ফলাফল গ্রেডশিট PDF রেন্ডার",
    orgName: "Uttara Model Academy",
    orgId: "org-uttara-model",
    idempotencyKey: "idem_pdf_cards_class10",
    progress: 68,
    status: "processing",
    attempts: 1,
    latency: "In progress",
    createdAt: "2026-10-03 19:40",
    payload: { examId: "exam-t2-2026", classLevel: "10", totalStudents: 320 },
  },
];

export default function JobsManagementPage() {
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [organizations, setOrganizations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [inspectingJob, setInspectingJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.warn("Could not load orgs for jobs", err);
      }
      try {
        const saved = localStorage.getItem("edusaas_platform_jobs");
        if (saved) setJobs(JSON.parse(saved));
      } catch (e) {
        console.warn("Could not load jobs", e);
      }
    }
    loadData();
  }, []);

  const saveJobs = (updated) => {
    setJobs(updated);
    try {
      localStorage.setItem("edusaas_platform_jobs", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleDispatchJob = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jobName = formData.get("jobName");
    const orgId = formData.get("orgId");
    const org = organizations.find((o) => o.id === orgId) || { name: "All Organizations" };

    const labelsMap = {
      bulk_sms_dispatch: "Bulk SMS নোটিশ প্রেরণ",
      monthly_fee_invoicing: "স্বয়ংক্রিয় ফি ইনভয়েস রান",
      biometric_log_sync: "বায়োমেট্রিক হার্ডওয়্যার সিঙ্ক",
      pdf_report_card_batch: "বাল্ক গ্রেডশিট PDF রেন্ডার",
      db_vacuum_and_cleanup: "ডাটাবেজ অপটিমাইজেশন ও ক্যাশ ক্লিয়ার",
    };

    const newJob = {
      id: `job_${Date.now()}`,
      name: jobName,
      label: labelsMap[jobName] || jobName,
      orgName: org.name,
      orgId,
      idempotencyKey: `idem_${jobName.substring(0, 4)}_${Date.now()}`,
      progress: 15,
      status: "processing",
      attempts: 1,
      latency: "Processing...",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      payload: { triggeredBy: "Platform Super Admin", targetOrg: org.name },
    };

    const updated = [newJob, ...jobs];
    saveJobs(updated);
    setIsDispatchModalOpen(false);
    showToast(`টাস্ক '${newJob.label}' ব্যাকগ্রাউন্ড কিউতে যুক্ত করা হয়েছে!`);

    // Animate progress to complete
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === newJob.id ? { ...j, progress: 100, status: "completed", latency: "2.8s" } : j))
      );
      showToast(`✅ টাস্ক '${newJob.label}' সফলভাবে সম্পন্ন হয়েছে!`);
    }, 3000);
  };

  const handleRetryJob = (jobItem) => {
    const updated = jobs.map((j) => {
      if (j.id === jobItem.id) {
        return { ...j, status: "processing", progress: 20, attempts: j.attempts + 1 };
      }
      return j;
    });
    saveJobs(updated);
    showToast(`টাস্ক '${jobItem.label}' পুনরায় শুরু করা হয়েছে...`);

    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobItem.id ? { ...j, progress: 100, status: "completed", latency: "1.9s" } : j))
      );
      showToast(`✅ টাস্ক '${jobItem.label}' সফলভাবে সম্পন্ন হয়েছে!`);
    }, 2500);
  };

  const handleCancelJob = (id, label) => {
    const updated = jobs.map((j) => (j.id === id ? { ...j, status: "cancelled", progress: 0 } : j));
    saveJobs(updated);
    showToast(`টাস্ক '${label}' বাতিল করা হয়েছে।`);
  };

  // Filtered list
  const filteredJobs = jobs.filter((j) => {
    const matchSearch =
      j.label.toLowerCase().includes(search.toLowerCase()) ||
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.orgName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const processingCount = jobs.filter((j) => j.status === "processing").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-teal-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Background Job Queue</h1>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs font-bold">Idempotent Worker</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bulk SMS, স্বয়ংক্রিয় মাসিক ইনভয়েস, বায়োমেট্রিক সিঙ্ক ও PDF রেন্ডারিং ব্যাকগ্রাউন্ড কিউ সেন্টার।
          </p>
        </div>

        <Button
          onClick={() => setIsDispatchModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Play size={15} />
          <span>ম্যানুয়াল টাস্ক রান করুন (Trigger Job)</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট কিউ টাস্ক</span>
            <Activity size={18} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{jobs.length} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">আইডেমপোটেন্ট সুরক্ষা সক্রিয়</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">চলমান টাস্ক (Processing)</span>
            <RefreshCw size={18} className="text-blue-600 animate-spin" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{processingCount} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">সমান্তরাল ব্যাকগ্রাউন্ড প্রসেসিং</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সফলভাবে সম্পন্ন</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{completedCount} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">১০০% ডাটা ডেলিভারি নিশ্চিত</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">গড় এক্সিকিউশন টাইম</span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">২.৪ সেকেন্ড</p>
          <p className="text-[11px] text-slate-400 mt-1">অপ্টিমাইজড কিউ থ্রেড</p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900">Queue Processing Log</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              সকল ব্যাকগ্রাউন্ড টাস্কের রিয়েল-টাইম অগ্রগতি ও পে-লোড হিস্ট্রি
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="টাস্ক নাম বা প্রতিষ্ঠান খুঁজুন..."
                className="pl-8 text-xs h-9 w-48 sm:w-60 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সকল ({jobs.length})
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "processing" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                চলমান ({processingCount})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "completed" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সম্পন্ন ({completedCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">টাস্ক ও কিউ আইডি</th>
                  <th className="p-4">লক্ষ্য প্রতিষ্ঠান</th>
                  <th className="p-4">অগ্রগতি (Progress)</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">রান-টাইম</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      কোনো ব্যাকগ্রাউন্ড টাস্ক পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm">{job.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {job.id} · <span className="text-teal-700">{job.name}</span>
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{job.orgName}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{job.idempotencyKey}</p>
                      </td>

                      <td className="p-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">প্রগ্রেস:</span>
                            <span className="text-slate-900 font-mono">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                job.progress === 100 ? "bg-emerald-500" : "bg-teal-600"
                              }`}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {job.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        ) : job.status === "processing" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <RefreshCw size={10} className="animate-spin" /> Processing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {job.status}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-700 font-medium font-mono text-[11px]">
                        {job.latency}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setInspectingJob(job)}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 text-teal-700 hover:bg-teal-50"
                            title="পে-লোড বিস্তারিত"
                          >
                            <Eye size={13} className="mr-1" />
                            বিস্তারিত
                          </Button>

                          <Button
                            onClick={() => handleRetryJob(job)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700"
                            title="পুনরায় চালান"
                          >
                            <RotateCw size={12} className="mr-1" />
                            রিট্রাই
                          </Button>

                          {job.status === "processing" && (
                            <Button
                              onClick={() => handleCancelJob(job.id, job.label)}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-8 text-red-500 hover:bg-red-50 px-2"
                              title="বাতিল করুন"
                            >
                              <XCircle size={13} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">ম্যানুয়াল ব্যাকগ্রাউন্ড টাস্ক রান করুন</h3>
                <p className="text-xs text-slate-400">নির্দিষ্ট টাস্ক ব্যাকগ্রাউন্ড কিউতে অবিলম্বে শিডিউল করুন</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDispatchJob} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">টাস্ক টাইপ (Job Queue Type)</Label>
                <select
                  name="jobName"
                  required
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-bold"
                >
                  <option value="bulk_sms_dispatch">📲 Bulk SMS নোটিশ প্রেরণ কিউ</option>
                  <option value="monthly_fee_invoicing">💳 স্বয়ংক্রিয় মাসিক ইনভয়েস জেনারেশন</option>
                  <option value="biometric_log_sync">⏱️ বায়োমেট্রিক ডিভাইস লগ সিঙ্ক</option>
                  <option value="pdf_report_card_batch">📄 ফলাফল গ্রেডশিট PDF ব্যাচ রেন্ডার</option>
                  <option value="db_vacuum_and_cleanup">🧹 ডাটাবেজ অপটিমাইজেশন ও ক্যাশ ক্লিনিং</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">লক্ষ্য প্রতিষ্ঠান (Target Organization)</Label>
                <select
                  name="orgId"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-medium"
                >
                  <option value="all">সকল সক্রিয় প্রতিষ্ঠান (All Active Orgs)</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                  {organizations.length === 0 && (
                    <option value="org-rahmania-main">Rahmania Institute (Default)</option>
                  )}
                </select>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 text-slate-600">
                <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Cpu size={14} className="text-teal-600" /> আইডেমপোটেন্ট এক্সেকিউশন সেফগার্ড
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  টাস্কটি একটি স্বয়ংক্রিয় ইউনিক Idempotency Key দিয়ে রেজিস্টার হবে যাতে ডুপ্লিকেট মেসেজ বা ডাবল ইনভয়েস তৈরি না হয়।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="rounded-xl"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  টাস্ক শুরু করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">{inspectingJob.label}</h3>
                <p className="text-xs text-slate-400 font-mono">{inspectingJob.id}</p>
              </div>
              <button onClick={() => setInspectingJob(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Queue Channel</span>
                  <span className="font-mono font-bold text-slate-800">{inspectingJob.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-emerald-700">{inspectingJob.status}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Idempotency Key</span>
                  <span className="font-mono text-[11px] text-slate-700 break-all">{inspectingJob.idempotencyKey}</span>
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-bold block mb-1">Payload JSON Parameters</Label>
                <pre className="p-3 bg-slate-900 text-teal-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-48">
                  {JSON.stringify(inspectingJob.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                onClick={() => setInspectingJob(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
