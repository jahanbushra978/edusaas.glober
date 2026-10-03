"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { appClient } from "@/api/appClient";
import {
  submitApplication,
  takeAction,
  deleteApplication,
  getApplicationTimeline,
} from "@/features/applications/engines/applicationService";
import {
  updatePermissions,
} from "@/features/applications/engines/permissionEngine";
import ApplicationTimeline, { StatusBadge } from "@/features/applications/components/ApplicationTimeline";
import ApplicationForm from "@/features/applications/components/ApplicationForm";
import {
  APPLICATION_TYPES_LIST,
  APPLICATION_STATUS_CONFIG,
} from "@/lib/permissions-definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Clock, CheckCircle2, XCircle, ThumbsUp, Eye,
  Printer, Filter, Search, Loader2, Shield,
  AlertTriangle, RefreshCw, Plus, Save, User, Trash2
} from "lucide-react";
import { toast } from "sonner";
import QuickDorkhastoModal from "@/features/applications/components/QuickDorkhastoModal";
import PrintableApplicationModal from "@/features/applications/components/PrintableApplicationModal";
import { printMadrasahApplicationDirect } from "@/features/applications/utils/printMadrasahDorkhasto";

const TYPE_LABEL = Object.fromEntries(APPLICATION_TYPES_LIST.map(t => [t.value, t.label.bn]));

const DEFAULT_ROLE_PERMISSIONS = {
  super_admin:  { can_submit: true,  can_view_own: true, can_view_branch: true,  can_view_all: true,  can_edit: true,  can_recommend: true,  can_approve: true,  can_reject: true,  can_cancel: true,  can_generate_pdf: true },
  branch_admin: { can_submit: true,  can_view_own: true, can_view_branch: true,  can_view_all: false, can_edit: true,  can_recommend: true,  can_approve: false, can_reject: true,  can_cancel: true,  can_generate_pdf: true },
  teacher:      { can_submit: true,  can_view_own: true, can_view_branch: false, can_view_all: false, can_edit: true,  can_recommend: true,  can_approve: false, can_reject: false, can_cancel: true,  can_generate_pdf: true },
  student:      { can_submit: true,  can_view_own: true, can_view_branch: false, can_view_all: false, can_edit: true,  can_recommend: false, can_approve: false, can_reject: false, can_cancel: true,  can_generate_pdf: true },
};

export default function ApplicationManager({ currentUser = {}, branches = [], settings = {} }) {
  const qc = useQueryClient();

  // Branch Admin Strict Isolation check
  const isBranchAdmin = currentUser?.role === "branch_admin" || (currentUser?.branch_id && currentUser?.role !== "super_admin" && currentUser?.role !== "admin");
  const userBranchId = isBranchAdmin && currentUser?.branch_id ? String(currentUser.branch_id) : null;

  const { data: fetchedSettings = {} } = useQuery({
    queryKey: ["app-settings-printable"],
    queryFn: async () => {
      const list = await appClient.entities.AppSettings.listAll().catch(() => []);
      return list[0] || {};
    },
  });
  const activeSettings = settings && Object.keys(settings).length > 0 ? settings : fetchedSettings;

  const [activeTab, setActiveTab] = useState("applications");
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'recommend'|'approve'|'reject'|'cancel', app }
  const [actionComment, setActionComment] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Applicant Selection & Search for Admin Create Application
  const [adminApplicantType, setAdminApplicantType] = useState("teacher"); // teacher | student | admin
  const [targetBranchId, setTargetBranchId] = useState(userBranchId || (branches[0]?.id ? String(branches[0].id) : "1"));
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [personSearch, setPersonSearch] = useState("");

  // Filters
  const [selBranchId, setSelBranchId] = useState(userBranchId || "all");
  const [selApplicantType, setSelApplicantType] = useState("all");
  const [selType, setSelType] = useState("all");
  const [selStatus, setSelStatus] = useState("all");
  const [selPriority, setSelPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Permission Matrix State
  const [rolePermissionsState, setRolePermissionsState] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // ── Load All Applications ─────────────────────────
  const { data: rawApplications = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const all = await appClient.entities.Application.listAll({ sort: "-id" });
      return all;
    },
    refetchInterval: 30000,
  });

  // ── Load Teachers & Students for Applicant Selector ──
  const { data: allTeachers = [] } = useQuery({
    queryKey: ["admin-teachers-selector"],
    queryFn: () => appClient.entities.Teacher.listAll().catch(() => []),
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ["admin-students-selector"],
    queryFn: () => appClient.entities.Student.listAll().catch(() => []),
  });

  // Strict Branch Isolation Filtering for Teachers
  const searchableTeachers = useMemo(() => {
    let list = userBranchId
      ? allTeachers.filter(t => String(t.branch_id) === String(userBranchId))
      : allTeachers;

    if (personSearch.trim()) {
      const q = personSearch.toLowerCase();
      list = list.filter(t =>
        t.full_name_en?.toLowerCase().includes(q) ||
        t.full_name_bn?.toLowerCase().includes(q) ||
        String(t.teacher_id || t.id).toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTeachers, userBranchId, personSearch]);

  // Strict Branch Isolation Filtering for Students
  const searchableStudents = useMemo(() => {
    let list = userBranchId
      ? allStudents.filter(s => String(s.branch_id) === String(userBranchId))
      : allStudents;

    if (personSearch.trim()) {
      const q = personSearch.toLowerCase();
      list = list.filter(s =>
        s.full_name_en?.toLowerCase().includes(q) ||
        s.full_name_bn?.toLowerCase().includes(q) ||
        String(s.roll_number || s.id).toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStudents, userBranchId, personSearch]);

  // ── Load Application Permissions from DB ──────────
  const { data: dbPermissions = [] } = useQuery({
    queryKey: ["admin-application-permissions"],
    queryFn: async () => {
      const list = await appClient.entities.ApplicationPermission.listAll().catch(() => []);
      if (list.length > 0) {
        const mapped = { ...DEFAULT_ROLE_PERMISSIONS };
        list.forEach(p => {
          if (p.role && mapped[p.role]) {
            mapped[p.role] = { ...mapped[p.role], ...p };
          }
        });
        setRolePermissionsState(mapped);
      }
      return list;
    },
  });

  // ── Load Selected App Timeline ─────────────────────
  const { data: timeline = [] } = useQuery({
    queryKey: ["admin-app-timeline", selectedApp?.id],
    queryFn: () => selectedApp ? getApplicationTimeline(selectedApp.id) : [],
    enabled: !!selectedApp,
  });

  // ── Filtered Applications with Strict Branch Isolation ──────────────
  const filteredApps = useMemo(() => {
    return rawApplications.filter(app => {
      // STRICT BRANCH ISOLATION FOR BRANCH ADMIN (No cross-branch leaks!)
      if (userBranchId && String(app.branch_id) !== String(userBranchId)) return false;

      if (selBranchId !== "all" && String(app.branch_id) !== String(selBranchId)) return false;
      if (selApplicantType !== "all" && app.applicant_type !== selApplicantType) return false;
      if (selType !== "all" && app.type !== selType) return false;
      if (selStatus !== "all" && app.status !== selStatus) return false;
      if (selPriority !== "all" && app.priority !== selPriority) return false;

      if (fromDateFilter && app.created_at && new Date(app.created_at) < new Date(fromDateFilter)) return false;
      if (toDateFilter && app.created_at && new Date(app.created_at) > new Date(toDateFilter + "T23:59:59")) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const numMatch = app.application_number?.toLowerCase().includes(q);
        const nameMatch = app.applicant_name?.toLowerCase().includes(q);
        const typeMatch = TYPE_LABEL[app.type]?.toLowerCase().includes(q) || app.type?.toLowerCase().includes(q);
        if (!numMatch && !nameMatch && !typeMatch) return false;
      }
      return true;
    });
  }, [rawApplications, userBranchId, selBranchId, selApplicantType, selType, selStatus, selPriority, searchQuery, fromDateFilter, toDateFilter]);

  // ── Dashboard Stats (Branch Isolated) ────────────────
  const stats = useMemo(() => {
    const apps = userBranchId
      ? rawApplications.filter(a => String(a.branch_id) === String(userBranchId))
      : rawApplications;

    return {
      total: apps.length,
      pending: apps.filter(a => ["submitted", "under_review"].includes(a.status)).length,
      recommended: apps.filter(a => a.status === "recommended").length,
      approved: apps.filter(a => a.status === "approved").length,
      rejected: apps.filter(a => a.status === "rejected").length,
    };
  }, [rawApplications, userBranchId]);

  // ── Create Application Mutation ────────────────────
  const adminCreateMut = useMutation({
    mutationFn: async ({ formData, saveAsDraft }) => {
      let applicantId = currentUser?.id || 1;
      let applicantName = currentUser?.name || currentUser?.full_name_en || "Administrator";
      let applicantType = "teacher";
      let branchId = Number(userBranchId || targetBranchId || currentUser?.branch_id || 1);

      if (adminApplicantType === "teacher") {
        const t = searchableTeachers.find(t => String(t.id) === String(selectedPersonId));
        if (t) {
          applicantId = t.id;
          applicantName = t.full_name_en;
          applicantType = "teacher";
          if (t.branch_id) branchId = Number(t.branch_id);
        }
      } else if (adminApplicantType === "student") {
        const s = searchableStudents.find(s => String(s.id) === String(selectedPersonId));
        if (s) {
          applicantId = s.id;
          applicantName = s.full_name_en;
          applicantType = "student";
          if (s.branch_id) branchId = Number(s.branch_id);
        }
      }

      return submitApplication({
        type: formData.type,
        applicantType,
        applicantId,
        applicantName,
        branchId,
        fromDate: formData.from_date || null,
        toDate: formData.to_date || null,
        reason: formData.reason,
        priority: formData.priority,
        attachmentUrl: formData.attachment_url || null,
        saveAsDraft,
      });
    },
    onSuccess: () => {
      toast.success("নতুন আবেদন দাখিল সফল হয়েছে ✓");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      setShowCreateModal(false);
      setSelectedPersonId("");
      setPersonSearch("");
    },
    onError: (err) => toast.error(err.message || "আবেদন ব্যর্থ হয়েছে"),
  });

  // ── Take Action Mutation ───────────────────────────
  const actionMut = useMutation({
    mutationFn: async ({ action, appId, comment }) => {
      return takeAction({
        applicationId: appId,
        action,
        actorId: currentUser.id || 1,
        actorName: currentUser.name || currentUser.full_name_en || currentUser.email || "Admin",
        actorRole: currentUser.role || "super_admin",
        comment,
      });
    },
    onSuccess: (_, { action }) => {
      const msgs = {
        recommend: "আবেদন সুপারিশ করা হয়েছে",
        approve: "আবেদন চূড়ান্ত অনুমোদন করা হয়েছে ✓",
        reject: "আবেদন প্রত্যাখ্যান করা হয়েছে",
        cancel: "আবেদন বাতিল করা হয়েছে",
      };
      toast.success(msgs[action] || "কার্যক্রম সম্পন্ন");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-app-timeline"] });
      setActionModal(null);
      setActionComment("");
      if (selectedApp) {
        setSelectedApp(prev => prev ? { ...prev, status: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "recommend" ? "recommended" : "cancelled" } : null);
      }
    },
    onError: (err) => toast.error(err.message || "কার্যক্রম ব্যর্থ হয়েছে"),
  });

  // ── Delete Application Mutation ─────────────────────
  const deleteMut = useMutation({
    mutationFn: (appId) => deleteApplication(appId),
    onSuccess: () => {
      toast.success("আবেদনটি সফলভাবে মুছে ফেলা হয়েছে ✓");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      setSelectedApp(null);
    },
    onError: (err) => toast.error(err.message || "মুছে ফেলা ব্যর্থ হয়েছে"),
  });

  // ── Save Permission Matrix to Database ──────────────
  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    try {
      for (const [role, perms] of Object.entries(rolePermissionsState)) {
        await updatePermissions(role, "*", perms);
      }
      toast.success("সকল রোলের পারমিশন রুলস সেভ হয়েছে ✓");
      qc.invalidateQueries({ queryKey: ["admin-application-permissions"] });
    } catch (err) {
      toast.error(err.message || "পারমিশন সেভ ব্যর্থ");
    } finally {
      setSavingPermissions(false);
    }
  };

  const toggleRolePerm = (role, permKey) => {
    setRolePermissionsState(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permKey]: !prev[role]?.[permKey],
      },
    }));
  };

  const [showQuickDorkhasto, setShowQuickDorkhasto] = useState(false);
  const [printModalApp, setPrintModalApp] = useState(null);

  // ── Print Printable PDF View ────────────────────────
  const handlePrintPDF = (app, isBlank = false) => {
    if (!app) return;
    const branchObj = branches.find(b => String(b.id) === String(app.branch_id));
    const applicantInfo = app.applicant_type === "student"
      ? allStudents.find(s => String(s.id) === String(app.applicant_id))
      : allTeachers.find(t => String(t.id) === String(app.applicant_id));

    printMadrasahApplicationDirect({
      application: app,
      settings: activeSettings,
      branch: branchObj,
      applicantDetails: applicantInfo,
      timeline: [],
      isBlankMode: isBlank,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#004D3A] flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#004D3A]" />
            Application & Approval Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            শিক্ষার্থী ও শিক্ষকদের ছুটির আবেদন, সার্টিফিকেট ও অন্যান্য আবেদনপত্র রিভিউ এবং ডিজিটাল অনুমোদন প্যানেল
            {userBranchId && <span className="ml-2 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">🔒 Branch Isolated Mode (Branch #{userBranchId})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowQuickDorkhasto(true)}
            variant="outline"
            className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs gap-1.5 font-bold px-3.5 py-2 rounded-xl"
          >
            <Printer className="h-4 w-4 text-emerald-600" /> দ্রুত দরখাস্ত প্রিন্ট
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs gap-1.5 font-bold px-4 py-2 rounded-xl"
          >
            <Plus className="h-4 w-4" /> নতুন আবেদন করুন (+ Apply Request)
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "মোট আবেদন", value: stats.total, icon: FileText, bg: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "অপেক্ষমাণ (Pending)", value: stats.pending, icon: Clock, bg: "bg-amber-50 border-amber-200 text-amber-800" },
          { label: "সুপারিশকৃত (Recommended)", value: stats.recommended, icon: ThumbsUp, bg: "bg-purple-50 border-purple-200 text-purple-800" },
          { label: "অনুমোদিত (Approved)", value: stats.approved, icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200 text-emerald-800" },
          { label: "প্রত্যাখ্যাত (Rejected)", value: stats.rejected, icon: XCircle, bg: "bg-red-50 border-red-200 text-red-800" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border ${item.bg} flex items-center gap-3 shadow-xs`}>
              <Icon className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-2xl font-extrabold leading-none">{item.value}</p>
                <p className="text-xs font-semibold mt-1 opacity-90">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="applications" className="gap-1.5 text-xs font-bold">
            <FileText className="h-4 w-4" /> আবেদন তালিকা ({filteredApps.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5 text-xs font-bold">
            <Shield className="h-4 w-4" /> Permission Engine & Rules
          </TabsTrigger>
        </TabsList>

        {/* APPLICATIONS LIST TAB */}
        <TabsContent value="applications" className="space-y-4">
          {/* Advanced Filter Bar */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-700 border-b pb-2">
                <Filter className="h-4 w-4 text-[#004D3A]" /> Advanced Application Filters
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Search */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Search Keyword</label>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="App #, Applicant Name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Branch Dropdown — Strictly Locked for Branch Admin */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Branch</label>
                  <Select
                    value={userBranchId || selBranchId}
                    onValueChange={setSelBranchId}
                    disabled={!!userBranchId}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Branches" /></SelectTrigger>
                    <SelectContent>
                      {!userBranchId && <SelectItem value="all">All Branches</SelectItem>}
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Applicant Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Applicant Role</label>
                  <Select value={selApplicantType} onValueChange={setSelApplicantType}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Roles" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles (Student + Teacher)</SelectItem>
                      <SelectItem value="student">Student (শিক্ষার্থী)</SelectItem>
                      <SelectItem value="teacher">Teacher (শিক্ষক)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Application Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Application Type</label>
                  <Select value={selType} onValueChange={setSelType}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Application Types</SelectItem>
                      {APPLICATION_TYPES_LIST.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label.bn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Status</label>
                  <Select value={selStatus} onValueChange={setSelStatus}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(APPLICATION_STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.bn || cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Priority</label>
                  <Select value={selPriority} onValueChange={setSelPriority}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Priorities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="normal">Normal (সাধারণ)</SelectItem>
                      <SelectItem value="urgent">🚨 Urgent (জরুরি)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">From Date</label>
                  <Input type="date" value={fromDateFilter} onChange={e => setFromDateFilter(e.target.value)} className="h-9 text-xs" />
                </div>

                {/* To Date */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">To Date</label>
                  <Input type="date" value={toDateFilter} onChange={e => setToDateFilter(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-bold text-slate-700">
                Application Queue ({filteredApps.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#004D3A]" />
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">
                  No applications matched the filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                        <th className="py-3 px-4 text-left">App #</th>
                        <th className="py-3 px-4 text-left">Applicant</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-center">Dates / Days</th>
                        <th className="py-3 px-4 text-center">Priority</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Submitted</th>
                        <th className="py-3 px-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.map(app => {
                        const typeName = TYPE_LABEL[app.type] || app.type;
                        return (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#004D3A]">
                              {app.application_number}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{app.applicant_name}</p>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {app.applicant_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {typeName}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">
                              {app.from_date ? (
                                <div>
                                  <p>{app.from_date} {app.to_date ? `→ ${app.to_date}` : ''}</p>
                                  <span className="text-[10px] text-slate-400">({app.days_count || 1} days)</span>
                                </div>
                              ) : "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {app.priority === "urgent" ? (
                                <Badge className="bg-red-100 text-red-700 border-red-200">🚨 Urgent</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500">Normal</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                              {app.created_at ? format(new Date(app.created_at), "dd/MM/yy hh:mm a") : "—"}
                            </td>
                            <td className="py-3 px-4 text-end">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm" variant="ghost" className="h-7 w-7 p-0"
                                  title="View Details"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  <Eye className="h-4 w-4 text-slate-600" />
                                </Button>

                                <Button
                                  size="sm" variant="ghost" className="h-7 w-7 p-0"
                                  title="Print PDF"
                                  onClick={() => handlePrintPDF(app)}
                                >
                                  <Printer className="h-4 w-4 text-blue-600" />
                                </Button>

                                <Button
                                  size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  title="Delete Application"
                                  onClick={() => {
                                    if (window.confirm(`আপনি কি নিশ্চিত যে আবেদন #${app.application_number} মুছে ফেলতে চান?`)) {
                                      deleteMut.mutate(app.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                                {["submitted", "under_review", "recommended"].includes(app.status) && (
                                  <>
                                    <Button
                                      size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                                      title="Approve"
                                      onClick={() => setActionModal({ type: "approve", app })}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                      title="Reject"
                                      onClick={() => setActionModal({ type: "reject", app })}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISSION & WORKFLOW CONFIG TAB (INTERACTIVE MATRIX) */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#004D3A]" /> Dynamic Permission Engine Matrix
              </CardTitle>
              <Button
                onClick={handleSavePermissions}
                disabled={savingPermissions}
                className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs gap-1.5 font-bold"
              >
                {savingPermissions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                পারমিশন রুলস সেভ করুন
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 leading-relaxed">
                <strong>Dynamic Role Permission Control Panel:</strong> সুপার এডমিন এখান থেকে রোল অনুযায়ী বিভিন্ন পারমিশন (আবেদন তৈরি, দেখা, সুপারিশ, চূড়ান্ত অনুমোদন, প্রত্যাখ্যান, বাতিল, এবং প্রিন্ট) টিক চিহ্ন দিয়ে পরিবর্তন করতে পারবেন।
              </div>

              {/* Interactive Permission Matrix Table */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b text-slate-700 font-bold">
                      <th className="py-3 px-4">Role / ব্যবহারকারীর পদবী</th>
                      <th className="py-3 px-4 text-center">Submit (জমা)</th>
                      <th className="py-3 px-4 text-center">View Branch (শাখা দেখা)</th>
                      <th className="py-3 px-4 text-center">View All (সকল দেখা)</th>
                      <th className="py-3 px-4 text-center">Recommend (সুপারিশ)</th>
                      <th className="py-3 px-4 text-center">Approve (অনুমোদন)</th>
                      <th className="py-3 px-4 text-center">Reject (প্রত্যাখ্যান)</th>
                      <th className="py-3 px-4 text-center">Cancel (বাতিল)</th>
                      <th className="py-3 px-4 text-center">Print PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: "super_admin", label: "Super Admin (প্রধান এডমিন)", bg: "bg-purple-50/50" },
                      { key: "branch_admin", label: "Branch Admin (শাখা প্রধান)", bg: "bg-blue-50/50" },
                      { key: "teacher", label: "Teacher (শিক্ষক)", bg: "bg-emerald-50/50" },
                      { key: "student", label: "Student (শিক্ষার্থী)", bg: "bg-amber-50/50" },
                    ].map(r => {
                      const perms = rolePermissionsState[r.key] || {};
                      return (
                        <tr key={r.key} className={r.bg}>
                          <td className="py-3 px-4 font-bold text-slate-800">{r.label}</td>
                          {[
                            "can_submit", "can_view_branch", "can_view_all",
                            "can_recommend", "can_approve", "can_reject",
                            "can_cancel", "can_generate_pdf"
                          ].map(permKey => (
                            <td key={permKey} className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={!!perms[permKey]}
                                onChange={() => toggleRolePerm(r.key, permKey)}
                                className="h-4 w-4 accent-[#004D3A] cursor-pointer rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Workflow Pipeline Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-blue-600" /> Student Workflow Pipeline
                  </h4>
                  <ol className="text-xs space-y-2 list-decimal list-inside text-slate-700 font-medium">
                    <li>Student Submits Application</li>
                    <li>Assigned Teacher Review & Recommend (OR Reject immediately)</li>
                    <li>Branch Admin Final Approval / Review</li>
                    <li>Super Admin Final Override Approval</li>
                  </ol>
                </div>

                <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-purple-600" /> Teacher Workflow Pipeline
                  </h4>
                  <ol className="text-xs space-y-2 list-decimal list-inside text-slate-700 font-medium">
                    <li>Teacher Submits Application</li>
                    <li>Branch Admin Review & Approval</li>
                    <li>Super Admin Override / Final Approval</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADMIN CREATE APPLICATION MODAL WITH SEARCHABLE SELECTOR & STRICT BRANCH ISOLATION */}
      <Dialog open={showCreateModal} onOpenChange={() => { setShowCreateModal(false); setPersonSearch(""); }}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#004D3A]">
              নতুন আবেদন করুন (+ Apply Leave / Request)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Choose Applicant Category */}
            <div className="bg-slate-50 p-3.5 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">আবেদনকারী নির্বাচন করুন:</label>
                {userBranchId && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    🔒 Branch #{userBranchId} Only
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "teacher", label: "শিক্ষক (Teacher)" },
                  { value: "student", label: "শিক্ষার্থী (Student)" },
                  { value: "admin", label: "নিজের নামে (Admin)" },
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setAdminApplicantType(cat.value); setSelectedPersonId(""); setPersonSearch(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      adminApplicantType === cat.value
                        ? "bg-[#004D3A] text-white border-[#004D3A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* SEARCHABLE PERSON SELECTOR FOR TEACHERS */}
              {adminApplicantType === "teacher" && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    শিক্ষক বেছে নিন ({searchableTeachers.length} জন পাওয়া গেছে) *
                  </label>

                  {/* Search Bar Input */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="🔍 নাম বা আইডি দিয়ে খুঁজুন (Search teacher name or ID)..."
                      value={personSearch}
                      onChange={e => setPersonSearch(e.target.value)}
                      className="pl-8 h-9 text-xs bg-white"
                    />
                  </div>

                  {/* Searchable Options List */}
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-white divide-y divide-slate-100">
                    {searchableTeachers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        কোনো শিক্ষক পাওয়া যায়নি
                      </div>
                    ) : (
                      searchableTeachers.map(t => {
                        const isSelected = String(t.id) === String(selectedPersonId);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedPersonId(String(t.id))}
                            className={`w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors ${
                              isSelected ? "bg-emerald-50 text-[#004D3A] font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{t.full_name_en} {t.full_name_bn ? `(${t.full_name_bn})` : ""}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {t.teacher_id || t.id}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SEARCHABLE PERSON SELECTOR FOR STUDENTS */}
              {adminApplicantType === "student" && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    শিক্ষার্থী বেছে নিন ({searchableStudents.length} জন পাওয়া গেছে) *
                  </label>

                  {/* Search Bar Input */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="🔍 নাম বা রোল নম্বর দিয়ে খুঁজুন (Search student name or Roll)..."
                      value={personSearch}
                      onChange={e => setPersonSearch(e.target.value)}
                      className="pl-8 h-9 text-xs bg-white"
                    />
                  </div>

                  {/* Searchable Options List */}
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-white divide-y divide-slate-100">
                    {searchableStudents.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        কোনো শিক্ষার্থী পাওয়া যায়নি
                      </div>
                    ) : (
                      searchableStudents.map(s => {
                        const isSelected = String(s.id) === String(selectedPersonId);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedPersonId(String(s.id))}
                            className={`w-full text-left p-2.5 text-xs flex items-center justify-between transition-colors ${
                              isSelected ? "bg-emerald-50 text-[#004D3A] font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{s.full_name_en} {s.full_name_bn ? `(${s.full_name_bn})` : ""}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Roll: {s.roll_number || s.id}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Application Form */}
            <ApplicationForm
              applicant={{
                id: adminApplicantType === "admin" ? (currentUser?.id || 1) : (selectedPersonId || 1),
                name: adminApplicantType === "teacher"
                  ? (searchableTeachers.find(t => String(t.id) === String(selectedPersonId))?.full_name_en || currentUser?.full_name_en || "Teacher")
                  : adminApplicantType === "student"
                  ? (searchableStudents.find(s => String(s.id) === String(selectedPersonId))?.full_name_en || "Student")
                  : (currentUser?.full_name_en || currentUser?.name || "Admin"),
                type: adminApplicantType === "student" ? "student" : "teacher",
                branch_id: Number(userBranchId || targetBranchId || 1),
              }}
              onSubmit={(formData, saveAsDraft) => adminCreateMut.mutateAsync({ formData, saveAsDraft })}
              onCancel={() => setShowCreateModal(false)}
              loading={adminCreateMut.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              {selectedApp ? (TYPE_LABEL[selectedApp.type] || selectedApp.type) : "Application Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 pt-2">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <p className="font-mono text-xs text-slate-400">{selectedApp.application_number}</p>
                </div>
                <StatusBadge status={selectedApp.status} />
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Applicant</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApp.applicant_name}</p>
                  <span className="text-[10px] text-slate-500">Role: {selectedApp.applicant_type}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Date Range</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApp.from_date || 'N/A'} → {selectedApp.to_date || 'N/A'}</p>
                  <span className="text-[10px] text-slate-500">{selectedApp.days_count || 1} Total Days</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Priority</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedApp.priority?.toUpperCase()}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Reason / Statement:</p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-wrap border">
                  {selectedApp.reason || 'No description provided.'}
                </div>
              </div>

              {/* Attachment */}
              {selectedApp.attachment_url && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">Attached Document:</p>
                  <a
                    href={selectedApp.attachment_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    📎 View Attached File
                  </a>
                </div>
              )}

              {/* Audit Timeline */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Audit Log & Approval Timeline:</p>
                <ApplicationTimeline timeline={timeline} workflowSteps={selectedApp.workflow_snapshot || []} />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t pt-3">
                <Button size="sm" variant="outline" onClick={() => handlePrintPDF(selectedApp)} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5 text-blue-600" /> Print PDF
                </Button>

                <div className="flex gap-2">
                  <Button
                    size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1"
                    onClick={() => {
                      if (window.confirm(`আপনি কি নিশ্চিত যে আবেদন #${selectedApp.application_number} মুছে ফেলতে চান?`)) {
                        deleteMut.mutate(selectedApp.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>

                  {["submitted", "under_review", "recommended"].includes(selectedApp.status) && (
                    <>
                      <Button
                        size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        onClick={() => setActionModal({ type: "approve", app: selectedApp })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm" variant="destructive" className="gap-1"
                        onClick={() => setActionModal({ type: "reject", app: selectedApp })}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ACTION CONFIRMATION MODAL */}
      <Dialog open={!!actionModal} onOpenChange={() => { setActionModal(null); setActionComment(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {actionModal?.type === "recommend" && "সুপারিশ নিশ্চিতকরণ"}
              {actionModal?.type === "approve"   && "চূড়ান্ত অনুমোদন নিশ্চিতকরণ"}
              {actionModal?.type === "reject"    && "আবেদন প্রত্যাখ্যান নিশ্চিতকরণ"}
              {actionModal?.type === "cancel"    && "আবেদন বাতিল নিশ্চিতকরণ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-600">
              আবেদন নম্বর: <strong className="font-mono text-[#004D3A]">{actionModal?.app?.application_number}</strong>
            </p>
            <Textarea
              placeholder={actionModal?.type === "reject"
                ? "প্রত্যাখ্যানের সুনির্দিষ্ট কারণ লিখুন (আবশ্যক)..."
                : "পর্যালোচনা মন্তব্য লিখুন (ঐচ্ছিক)..."}
              value={actionComment}
              onChange={e => setActionComment(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
            {actionModal?.type === "reject" && !actionComment.trim() && (
              <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> প্রত্যাখ্যানের কারণ জানা আবশ্যক
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setActionModal(null); setActionComment(""); }}>
                বাতিল
              </Button>
              <Button
                size="sm"
                className={`flex-1 text-xs text-white ${
                  actionModal?.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionModal?.type === "recommend" ? "bg-purple-600 hover:bg-purple-700" :
                  "bg-red-600 hover:bg-red-700"
                }`}
                disabled={(actionModal?.type === "reject" && !actionComment.trim()) || actionMut.isPending}
                onClick={() => {
                  if (!actionModal) return;
                  actionMut.mutate({
                    action: actionModal.type,
                    appId: actionModal.app.id,
                    comment: actionComment,
                  });
                }}
              >
                {actionMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "নিশ্চিত করুন"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Dorkhasto Generator Modal */}
      <QuickDorkhastoModal
        open={showQuickDorkhasto}
        onOpenChange={setShowQuickDorkhasto}
        defaultApplicant={{ name: currentUser?.name || "Admin", type: "staff" }}
      />

      {/* Printable Preview Modal */}
      <PrintableApplicationModal
        open={!!printModalApp}
        onOpenChange={(open) => { if (!open) setPrintModalApp(null); }}
        application={printModalApp}
        settings={activeSettings}
        branch={branches.find(b => String(b.id) === String(printModalApp?.branch_id))}
        applicantDetails={null}
        timeline={[]}
      />
    </div>
  );
}
