"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { appClient } from "@/api/appClient";
import {
  submitApplication,
  submitDraft,
  takeAction,
  editApplication,
  resubmitApplication,
  getApplicationTimeline,
} from "../engines/applicationService";
import { getPermissionsFor, canActOnApplication } from "../engines/permissionEngine";
import ApplicationForm from "./ApplicationForm";
import ApplicationTimeline, { StatusBadge } from "./ApplicationTimeline";
import { APPLICATION_TYPES_LIST, APPLICATION_STATUS_CONFIG, APPLICATION_PRIORITY_CONFIG } from "@/lib/permissions-definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, Bell,
  ThumbsUp, Search, Loader2,
  AlertTriangle, Pencil, RotateCcw, Ban, Send,
  Printer, Eye
} from "lucide-react";
import { toast } from "sonner";
import PrintableApplicationModal from "./PrintableApplicationModal";
import QuickDorkhastoModal from "./QuickDorkhastoModal";
import { printMadrasahApplicationDirect } from "../utils/printMadrasahDorkhasto";

const TYPE_LABEL = Object.fromEntries(APPLICATION_TYPES_LIST.map(t => [t.value, t.label.bn]));

export default function ApplicationPortal({ user, applicant }) {
  // applicant = { id, name, type: 'teacher'|'student', branch_id, teacher_id }
  const qc = useQueryClient();
  const [view, setView] = useState("list"); // list | new | detail
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'recommend'|'approve'|'reject', app }
  const [actionComment, setActionComment] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [printModalApp, setPrintModalApp] = useState(null);
  const [showQuickDorkhasto, setShowQuickDorkhasto] = useState(false);

  const isTeacher = user?.role === "teacher" || applicant?.type === "teacher";
  const [scope, setScope] = useState(isTeacher ? "students" : "my"); // "students" | "my"

  const teacherIdStr = String(applicant?.id || user?.id || "");
  const teacherCodeStr = String(applicant?.teacher_id || user?.teacher_id || "");

  // ── Load all students to identify assigned students ──
  const { data: allStudents = [] } = useQuery({
    queryKey: ["all-students-for-apps"],
    queryFn: () => appClient.entities.Student.listAll().catch(() => []),
    enabled: isTeacher,
    staleTime: 60000,
  });

  const assignedStudentMap = useMemo(() => {
    if (!isTeacher) return new Map();
    const map = new Map();
    allStudents.forEach(s => {
      const stId = s.assigned_teacher_id !== null && s.assigned_teacher_id !== undefined ? String(s.assigned_teacher_id) : "";
      if (stId && (stId === teacherIdStr || (teacherCodeStr && stId === teacherCodeStr))) {
        map.set(String(s.id), s);
      }
    });
    return map;
  }, [allStudents, isTeacher, teacherIdStr, teacherCodeStr]);

  // ── Load my applications ──────────────────────────
  const { data: myApps = [], isLoading: loadingMyApps } = useQuery({
    queryKey: ["my-applications", applicant.id, applicant.type],
    queryFn: async () => {
      const all = await appClient.entities.Application.filter({
        applicant_id:   applicant.id,
        applicant_type: applicant.type,
      });
      return [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    refetchInterval: 30000,
  });

  // ── Load student applications (for teacher review) ──
  const { data: allStudentApps = [], isLoading: loadingStudentApps } = useQuery({
    queryKey: ["all-student-applications-for-teacher", applicant?.branch_id],
    queryFn: async () => {
      const all = await appClient.entities.Application.filter({
        applicant_type: "student",
      });
      return [...all].sort((a, b) => new Date(b.created_at || b.submitted_at) - new Date(a.created_at || a.submitted_at));
    },
    enabled: isTeacher,
    refetchInterval: 15000,
  });

  // Filter student apps to those assigned to this teacher (or in same branch if no teacher explicitly assigned)
  const studentApps = useMemo(() => {
    if (!isTeacher) return [];
    return allStudentApps.filter(app => {
      if (assignedStudentMap.size > 0) {
        return assignedStudentMap.has(String(app.applicant_id));
      }
      if (applicant?.branch_id && app.branch_id) {
        return String(app.branch_id) === String(applicant.branch_id);
      }
      return true;
    });
  }, [allStudentApps, assignedStudentMap, isTeacher, applicant?.branch_id]);

  const activeAppsList = isTeacher && scope === "students" ? studentApps : myApps;
  const isLoading = isTeacher && scope === "students" ? loadingStudentApps : loadingMyApps;

  // ── Load permissions ──────────────────────────────
  const { data: perms } = useQuery({
    queryKey: ["app-permissions", user.role],
    queryFn:  () => getPermissionsFor(user.role),
  });

  // ── Load timeline for selected app ───────────────
  const { data: timeline = [] } = useQuery({
    queryKey: ["app-timeline", selectedApp?.id],
    queryFn:  () => selectedApp ? getApplicationTimeline(selectedApp.id) : [],
    enabled:  !!selectedApp,
  });

  // ── Load Madrasah Settings & Branches for Printing ──
  const { data: appSettings = {} } = useQuery({
    queryKey: ["app-settings-portal"],
    queryFn: async () => {
      const list = await appClient.entities.AppSettings.listAll().catch(() => []);
      return list[0] || {};
    },
    staleTime: 300000,
  });

  const { data: allBranches = [] } = useQuery({
    queryKey: ["branches-list-portal"],
    queryFn: () => appClient.entities.Branch.listAll().catch(() => []),
    staleTime: 300000,
  });

  const getApplicantInfo = (app) => {
    if (!app) return applicant;
    if (app.applicant_type === "student") {
      const found = allStudents.find(s => String(s.id) === String(app.applicant_id));
      if (found) return found;
    }
    return applicant;
  };

  const currentBranch = useMemo(() => {
    const bId = selectedApp?.branch_id || applicant?.branch_id;
    return allBranches.find(b => String(b.id) === String(bId)) || null;
  }, [allBranches, selectedApp, applicant]);

  // ── Notifications count ───────────────────────────
  const { data: notifications = [] } = useQuery({
    queryKey: ["my-app-notifications", applicant.id],
    queryFn: async () => {
      const all = await appClient.entities.ApplicationNotification.filter({
        recipient_id: applicant.id,
        is_read:      false,
      });
      return all;
    },
    refetchInterval: 60000,
  });

  // ── Submit mutation ───────────────────────────────
  const submitMut = useMutation({
    mutationFn: async ({ formData, saveAsDraft }) => {
      return submitApplication({
        type:          formData.type,
        applicantType: applicant.type,
        applicantId:   applicant.id,
        applicantName: applicant.name,
        branchId:      applicant.branch_id,
        fromDate:      formData.from_date || null,
        toDate:        formData.to_date || null,
        reason:        formData.reason,
        priority:      formData.priority,
        attachmentUrl: formData.attachment_url || null,
        saveAsDraft,
      });
    },
    onSuccess: (_, { saveAsDraft }) => {
      toast.success(saveAsDraft ? "খসড়া সংরক্ষিত হয়েছে" : "আবেদন সফলভাবে দাখিল হয়েছে ✓");
      qc.invalidateQueries(["my-applications"]);
      setView("list");
    },
    onError: (err) => toast.error(err.message || "আবেদন ব্যর্থ হয়েছে"),
  });

  // ── Edit mutation ─────────────────────────────────
  const editMut = useMutation({
    mutationFn: async ({ appId, formData }) => {
      if (selectedApp?.status === "rejected") {
        return resubmitApplication(appId, formData, applicant.id, applicant.name, applicant.type);
      }
      return editApplication(appId, formData, applicant.id, applicant.name, applicant.type);
    },
    onSuccess: () => {
      toast.success("আবেদন আপডেট হয়েছে");
      qc.invalidateQueries(["my-applications"]);
      qc.invalidateQueries(["app-timeline", selectedApp?.id]);
      setEditMode(false);
    },
    onError: (err) => toast.error(err.message || "আপডেট ব্যর্থ"),
  });

  // ── Submit draft mutation ─────────────────────────
  const submitDraftMut = useMutation({
    mutationFn: (appId) => submitDraft(appId, applicant.id, applicant.name, applicant.type),
    onSuccess: () => {
      toast.success("আবেদন দাখিল হয়েছে");
      qc.invalidateQueries(["my-applications"]);
      qc.invalidateQueries(["app-timeline", selectedApp?.id]);
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Action mutation (for reviewers) ───────────────
  const actionMut = useMutation({
    mutationFn: async ({ action, appId, comment }) => {
      return takeAction({
        applicationId: appId,
        action,
        actorId:   user.id,
        actorName: user.name || user.full_name_en || user.email || "User",
        actorRole: user.role,
        comment,
      });
    },
    onSuccess: (updatedApp, { action }) => {
      const msgs = { recommend: "সুপারিশ করা হয়েছে ✓", approve: "অনুমোদন হয়েছে ✓", reject: "প্রত্যাখ্যান করা হয়েছে", cancel: "বাতিল করা হয়েছে" };
      toast.success(msgs[action] || "সম্পন্ন");
      qc.invalidateQueries(["my-applications"]);
      qc.invalidateQueries(["all-student-applications-for-teacher"]);
      qc.invalidateQueries(["app-timeline"]);
      if (updatedApp) {
        setSelectedApp(prev => ({ ...prev, ...updatedApp }));
      }
      setActionModal(null);
      setActionComment("");
    },
    onError: (err) => toast.error(err.message || "অ্যাকশন সম্পন্ন করা যায়নি"),
  });

  // ── Filtered apps ─────────────────────────────────
  const filtered = useMemo(() => {
    return activeAppsList.filter(a => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (searchQ && !a.application_number?.toLowerCase().includes(searchQ.toLowerCase())
          && !a.applicant_name?.toLowerCase().includes(searchQ.toLowerCase())
          && !TYPE_LABEL[a.type]?.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    });
  }, [activeAppsList, filterStatus, searchQ]);

  // ── Stats ─────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    activeAppsList.length,
    pending:  activeAppsList.filter(a => ["submitted", "under_review", "recommended"].includes(a.status)).length,
    approved: activeAppsList.filter(a => a.status === "approved").length,
    rejected: activeAppsList.filter(a => a.status === "rejected").length,
  }), [activeAppsList]);

  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════ */}
      {/* RENDER: New Application */}
      {/* ════════════════════════════════════════════════ */}
      {view === "new" && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-slate-500">
              ← ফিরে যান
            </Button>
            <h3 className="font-bold text-slate-800">নতুন আবেদন</h3>
          </div>
          <Card>
            <CardContent className="pt-5">
              <ApplicationForm
                applicant={applicant}
                onSubmit={(formData, saveAsDraft) => submitMut.mutateAsync({ formData, saveAsDraft })}
                onCancel={() => setView("list")}
                loading={submitMut.isPending}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* RENDER: Detail View */}
      {/* ════════════════════════════════════════════════ */}
      {view === "detail" && selectedApp && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Button variant="ghost" size="sm" onClick={() => { setView("list"); setEditMode(false); }} className="text-slate-500 hover:text-slate-900">
              ← ফিরে যান
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPrintModalApp(selectedApp)}
                className="text-xs font-bold gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50"
              >
                <Eye size={14} className="text-emerald-600" /> দরখাস্ত প্রিভিউ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => printMadrasahApplicationDirect({
                  application: selectedApp,
                  settings: appSettings,
                  branch: currentBranch,
                  applicantDetails: getApplicantInfo(selectedApp),
                  timeline,
                })}
                className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                <Printer size={14} /> 🖨️ দরখাস্ত প্রিন্ট (Print)
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[11px] font-mono text-slate-400">{selectedApp.application_number}</p>
                  <h3 className="font-bold text-lg text-slate-800 mt-0.5">{TYPE_LABEL[selectedApp.type] || selectedApp.type}</h3>
                  {selectedApp.priority === "urgent" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold">
                      🚨 জরুরি (Urgent)
                    </span>
                  )}
                </div>
                <StatusBadge status={selectedApp.status} />
              </div>
            </CardHeader>

            {editMode ? (
              <CardContent className="pt-4">
                <ApplicationForm
                  applicant={applicant}
                  existingApp={selectedApp}
                  onSubmit={(formData) => editMut.mutateAsync({ appId: selectedApp.id, formData })}
                  onCancel={() => setEditMode(false)}
                  loading={editMut.isPending}
                />
              </CardContent>
            ) : (
              <CardContent className="pt-4 space-y-4">
                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "আবেদনকারী", value: `${selectedApp.applicant_name}${selectedApp.applicant_type === 'student' ? ' (ছাত্র)' : ' (শিক্ষক)'}` },
                    { label: "তারিখ থেকে", value: selectedApp.from_date ? format(new Date(selectedApp.from_date), "dd MMM yyyy") : "—" },
                    { label: "তারিখ পর্যন্ত", value: selectedApp.to_date ? format(new Date(selectedApp.to_date), "dd MMM yyyy") : "—" },
                    { label: "মোট দিন", value: selectedApp.days_count ? `${selectedApp.days_count} দিন` : "—" },
                    { label: "দাখিলের তারিখ", value: selectedApp.submitted_at ? format(new Date(selectedApp.submitted_at), "dd MMM yyyy") : "—" },
                    { label: "বর্তমান পর্যালোচক", value: selectedApp.current_reviewer_role === "teacher" ? "শ্রেণী শিক্ষক" : selectedApp.current_reviewer_role === "branch_admin" ? "ব্রাঞ্চ অ্যাডমিন" : selectedApp.current_reviewer_role || "—" },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Reason */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">কারণ</p>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
                    {selectedApp.reason || "—"}
                  </div>
                </div>

                {/* Attachment */}
                {selectedApp.attachment_url && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">সংযুক্তি</p>
                    <a href={selectedApp.attachment_url} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 text-sm hover:underline flex items-center gap-1.5">
                      📎 সংযুক্তি দেখুন
                    </a>
                  </div>
                )}

                {/* Draft submit */}
                {selectedApp.status === "draft" && (String(selectedApp.applicant_id) === String(applicant.id) && selectedApp.applicant_type === applicant.type) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">এটি একটি খসড়া আবেদন</p>
                      <p className="text-xs text-amber-600">দাখিল করতে নিচের বাটনে ক্লিক করুন</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => submitDraftMut.mutate(selectedApp.id)}
                      disabled={submitDraftMut.isPending}
                    >
                      {submitDraftMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      <span className="ml-1">দাখিল করুন</span>
                    </Button>
                  </div>
                )}

                {/* Review actions */}
                {["submitted", "under_review", "recommended"].includes(selectedApp.status) && (
                  (canActOnApplication(user, selectedApp, "approve") || 
                   canActOnApplication(user, selectedApp, "recommend") ||
                   (isTeacher && selectedApp.applicant_type === "student" && ["submitted", "under_review"].includes(selectedApp.status)))
                ) && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-violet-700 mb-2">আপনার পর্যালোচনা দরকার</p>
                    <div className="flex gap-2 flex-wrap">
                      {(canActOnApplication(user, selectedApp, "recommend") || (isTeacher && selectedApp.status === "submitted")) && (
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white"
                          onClick={() => setActionModal({ type: "recommend", app: selectedApp })}>
                          <ThumbsUp size={13} className="mr-1" /> সুপারিশ করুন (Recommend)
                        </Button>
                      )}
                      {canActOnApplication(user, selectedApp, "approve") && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setActionModal({ type: "approve", app: selectedApp })}>
                          <CheckCircle2 size={13} className="mr-1" /> অনুমোদন করুন
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setActionModal({ type: "reject", app: selectedApp })}>
                        <XCircle size={13} className="mr-1" /> প্রত্যাখ্যান করুন
                      </Button>
                    </div>
                  </div>
                )}

                {/* Re-apply after rejection */}
                {selectedApp.status === "rejected" && (String(selectedApp.applicant_id) === String(applicant.id) && selectedApp.applicant_type === applicant.type) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-sm font-semibold text-orange-700">আবেদন প্রত্যাখ্যাত হয়েছে</p>
                    <p className="text-xs text-orange-600 mb-2">আপনি তথ্য পরিবর্তন করে পুনরায় আবেদন করতে পারবেন</p>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setEditMode(true)}>
                      <RotateCcw size={13} className="mr-1" /> পুনরায় আবেদন করুন
                    </Button>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(String(selectedApp.applicant_id) === String(applicant.id) && selectedApp.applicant_type === applicant.type && selectedApp.is_editable && !["approved", "cancelled"].includes(selectedApp.status)) && (
                      <Button size="sm" variant="outline" onClick={() => setEditMode(true)} className="text-slate-600">
                        <Pencil size={13} className="mr-1" /> সংশোধন করুন
                      </Button>
                    )}
                    {(String(selectedApp.applicant_id) === String(applicant.id) && selectedApp.applicant_type === applicant.type && !["approved", "cancelled"].includes(selectedApp.status)) && (
                      <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50"
                        onClick={() => setActionModal({ type: "cancel", app: selectedApp })}>
                        <Ban size={13} className="mr-1" /> বাতিল করুন
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => printMadrasahApplicationDirect({
                        application: selectedApp,
                        settings: appSettings,
                        branch: currentBranch,
                        applicantDetails: getApplicantInfo(selectedApp),
                        timeline,
                      })}
                      className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs font-bold gap-1.5"
                    >
                      <Printer size={13} /> 🖨️ অফিস কপি প্রিন্ট
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Timeline */}
          <ApplicationTimeline
            timeline={timeline}
            pendingSteps={(selectedApp.workflow_snapshot || []).filter(s => {
              const doneRoles = timeline.map(t => t.actor_role);
              return !doneRoles.includes(s.role);
            })}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* RENDER: List View (default) */}
      {/* ════════════════════════════════════════════════ */}
      {view === "list" && (
        <div className="space-y-4">
          {/* Teacher Scope Tabs */}
          {isTeacher && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setScope("students")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  scope === "students"
                    ? "bg-[#004D3A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300"
                }`}
              >
                <span>🎓 ছাত্রদের আবেদন</span>
                {studentApps.filter(a => a.status === "submitted").length > 0 && (
                  <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                    {studentApps.filter(a => a.status === "submitted").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setScope("my")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  scope === "my"
                    ? "bg-[#004D3A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300"
                }`}
              >
                <span>👤 আমার আবেদন</span>
                {myApps.length > 0 && (
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full">
                    {myApps.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "মোট আবেদন", value: stats.total,    icon: FileText,     color: "text-blue-600 bg-blue-50" },
              { label: "অপেক্ষমান", value: stats.pending,  icon: Clock,        color: "text-amber-600 bg-amber-50" },
              { label: "অনুমোদিত",  value: stats.approved, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
              { label: "প্রত্যাখ্যাত", value: stats.rejected, icon: XCircle,   color: "text-red-600 bg-red-50" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-xl p-3 flex items-center gap-3 ${s.color}`}>
                  <Icon size={20} className="flex-shrink-0" />
                  <div>
                    <p className="text-xl font-extrabold leading-none">{s.value}</p>
                    <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notifications banner */}
          {notifications.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
              <Bell size={16} className="text-blue-500 animate-bounce" />
              <p className="text-sm text-blue-700 font-medium">
                আপনার <strong>{notifications.length}</strong>টি নতুন বিজ্ঞপ্তি আছে
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="আবেদন নম্বর, নাম বা ধরন খুঁজুন..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-9 rounded-md border border-slate-200 text-sm px-2 text-slate-600 bg-white"
            >
              <option value="all">সকল অবস্থা</option>
              {Object.entries(APPLICATION_STATUS_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.bn || c.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold flex items-center gap-1.5"
              onClick={() => setShowQuickDorkhasto(true)}
            >
              <Printer size={14} className="text-emerald-600" />
              <span>দ্রুত দরখাস্ত তৈরি ও প্রিন্ট</span>
            </Button>
            {perms?.can_submit !== false && (
              <Button
                size="sm"
                className="bg-[#004D3A] hover:bg-[#003829] text-white flex items-center gap-1.5"
                onClick={() => setView("new")}
              >
                <Plus size={14} /> নতুন আবেদন
              </Button>
            )}
          </div>

          {/* Applications list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {isTeacher && scope === "students" ? "ছাত্রদের কোনো আবেদন পাওয়া যায়নি" : "কোনো আবেদন পাওয়া যায়নি"}
              </p>
              <p className="text-xs mt-1">
                {isTeacher && scope === "students" ? "ছাত্ররা আবেদন করলে এখানে জমা হবে" : "উপরের বাটনে ক্লিক করে নতুন আবেদন করুন"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => {
                const statusCfg = APPLICATION_STATUS_CONFIG[app.status] || {};
                const priCfg    = APPLICATION_PRIORITY_CONFIG[app.priority] || {};
                const appBranch = allBranches.find(b => String(b.id) === String(app.branch_id));
                const appApplicant = getApplicantInfo(app);
                
                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#004D3A]/40 dark:hover:border-emerald-600/40 hover:shadow-md rounded-2xl p-4 transition-all"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => { setSelectedApp(app); setView("detail"); setEditMode(false); }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {app.applicant_type === "student" && (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                ছাত্র: {app.applicant_name}
                              </span>
                            )}
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                              {TYPE_LABEL[app.type] || app.type}
                            </span>
                            {app.priority === "urgent" && (
                              <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">🚨 জরুরি</span>
                            )}
                            {isTeacher && app.applicant_type === "student" && app.status === "submitted" && (
                              <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <ThumbsUp size={10} /> সুপারিশ প্রয়োজন
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{app.application_number}</p>
                          {app.from_date && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                              📅 {format(new Date(app.from_date), "dd MMM yyyy")}
                              {app.to_date && ` → ${format(new Date(app.to_date), "dd MMM yyyy")}`}
                              {app.days_count ? ` (${app.days_count} দিন)` : ""}
                            </p>
                          )}
                          {app.reason && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 italic">
                              "{app.reason}"
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={app.status} />
                          <span className="text-[10px] text-slate-400">
                            {format(new Date(app.created_at), "dd MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Print & Preview Action Bar */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => { setSelectedApp(app); setView("detail"); setEditMode(false); }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        বিস্তারিত দেখুন →
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrintModalApp(app);
                          }}
                          className="h-7 px-2.5 text-xs text-slate-600 hover:text-[#004D3A] hover:bg-emerald-50 rounded-lg gap-1"
                        >
                          <Eye size={12} className="text-emerald-700" />
                          <span>প্রিভিউ</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            printMadrasahApplicationDirect({
                              application: app,
                              settings: appSettings,
                              branch: appBranch,
                              applicantDetails: appApplicant,
                              timeline: [],
                            });
                          }}
                          className="h-7 px-3 text-xs bg-[#004D3A] hover:bg-[#003829] text-white font-bold rounded-lg shadow-sm gap-1.5"
                        >
                          <Printer size={12} />
                          <span>🖨️ প্রিন্ট</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* Global Action Modal (Available in all views) */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={!!actionModal} onOpenChange={() => { setActionModal(null); setActionComment(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {actionModal?.type === "recommend" && "সুপারিশ করুন"}
              {actionModal?.type === "approve"   && "অনুমোদন করুন"}
              {actionModal?.type === "reject"    && "প্রত্যাখ্যান করুন"}
              {actionModal?.type === "cancel"    && "বাতিল করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-500">
              আবেদন: <strong>{actionModal?.app?.application_number}</strong>
            </p>
            <Textarea
              placeholder={actionModal?.type === "reject"
                ? "প্রত্যাখ্যানের কারণ লিখুন (আবশ্যক)..."
                : "মন্তব্য লিখুন (ঐচ্ছিক)..."}
              value={actionComment}
              onChange={e => setActionComment(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
            {actionModal?.type === "reject" && !actionComment.trim() && (
              <p className="text-[10px] text-red-500 flex items-center gap-1">
                <AlertTriangle size={11} /> প্রত্যাখ্যানের কারণ অবশ্যই লিখতে হবে
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setActionModal(null); setActionComment(""); }}>
                বাতিল
              </Button>
              <Button
                className={`flex-1 text-white ${
                  actionModal?.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionModal?.type === "recommend" ? "bg-violet-600 hover:bg-violet-700" :
                  "bg-red-600 hover:bg-red-700"
                }`}
                disabled={(actionModal?.type === "reject" && !actionComment.trim()) || actionMut.isPending}
                onClick={() => {
                  if (!actionModal) return;
                  actionMut.mutate({
                    action:  actionModal.type,
                    appId:   actionModal.app.id,
                    comment: actionComment,
                  });
                }}
              >
                {actionMut.isPending ? <Loader2 size={14} className="animate-spin" /> : "নিশ্চিত করুন"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Dorkhasto Preview Modal */}
      <PrintableApplicationModal
        open={!!printModalApp}
        onOpenChange={(open) => { if (!open) setPrintModalApp(null); }}
        application={printModalApp}
        settings={appSettings}
        branch={allBranches.find(b => String(b.id) === String(printModalApp?.branch_id)) || currentBranch}
        applicantDetails={getApplicantInfo(printModalApp)}
        timeline={printModalApp?.id === selectedApp?.id ? timeline : []}
      />

      {/* Quick Dorkhasto Generator Modal */}
      <QuickDorkhastoModal
        open={showQuickDorkhasto}
        onOpenChange={setShowQuickDorkhasto}
        defaultApplicant={applicant}
      />
    </div>
  );
}
