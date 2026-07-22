import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

import { appClient } from "@/api/appClient";
import { SHOW_READING_PROGRESS } from "@/config/features";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Link from "next/link";

import { createPageUrl } from "@/utils";

import { ArrowLeft, Plus, Pencil, Loader2, User, BookOpen, CheckCircle2, XCircle, DollarSign, TrendingUp, BarChart3, ClipboardList, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";

import StatsCard from "@/components/ui-custom/StatsCard";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AIPerformanceAnalysis = dynamic(() => import("@/components/admin/AIPerformanceAnalysis"), { ssr: false });
const ProgressChart = dynamic(() => import("@/components/ui-custom/ProgressChart"), { ssr: false });
const ReadingLogTable = dynamic(() => import("@/components/ui-custom/ReadingLogTable"), { ssr: false });
const StudentForm = dynamic(() => import("@/components/admin/StudentForm"), { ssr: false });
const ReadingLogForm = dynamic(() => import("@/components/admin/ReadingLogForm"), { ssr: false });

const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });



export default function AdminStudentDetail() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [showEditStudent, setShowEditStudent] = useState(false);

  const [showLogForm, setShowLogForm] = useState(false);

  const [editingLog, setEditingLog] = useState(null);

  const queryClient = useQueryClient();



  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get("id");

  useEffect(() => {
    appClient.auth.me().then((u) => {
      if (u.role === "admin" || u.role === "branch_admin") {
        setIsAdmin(true);
        return;
      }

      setIsAdmin(false);
      appClient.auth.redirectToLogin("admin");
    }).catch(() => {
      setIsAdmin(false);
      appClient.auth.redirectToLogin("admin");
    });
  }, []);


  const { data: student, isLoading: loadingStudent } = useQuery({

    queryKey: ["admin-student", studentId],
    queryFn: async () => {
      return appClient.entities.Student.get(studentId);
    },
    enabled: !!studentId && isAdmin === true,

  });



  const { data: logs = [], isLoading: loadingLogs } = useQuery({

    queryKey: ["admin-student-logs", studentId],

    queryFn: () => appClient.entities.ReadingLog.filter({ student_id: studentId }, "-date", 500),

    enabled: !!studentId && isAdmin === true,

  });



  const { data: attendance = [] } = useQuery({

    queryKey: ["admin-student-attendance", studentId],

    queryFn: () => appClient.entities.Attendance.filter({ student_id: studentId }),

    enabled: !!studentId && isAdmin === true,

  });



  const { data: fees = [] } = useQuery({

    queryKey: ["admin-student-fees", studentId],

    queryFn: () => appClient.entities.Fee.filter({ student_id: studentId }),

    enabled: !!studentId && isAdmin === true,

  });



  const { data: promotionRecords = [] } = useQuery({

    queryKey: ["admin-student-promotions", studentId],

    queryFn: async () => {
      const list = await appClient.entities.PromotionStudent.filter({ student_id: Number(studentId) }, "-promotion_id", 500);
      return Array.isArray(list) ? list : [];
    },

    enabled: !!studentId && isAdmin === true,

  });



  const { data: batchPromotions = [] } = useQuery({

    queryKey: ["admin-student-batch-promotions", studentId],

    queryFn: async () => {
      const ids = [...new Set(promotionRecords.map(r => r.promotion_id))];
      if (ids.length === 0) return [];
      const all = await appClient.entities.Promotion.list("-created_date", 500);
      return all.filter(p => ids.includes(p.id));
    },

    enabled: promotionRecords.length > 0,

  });



  const promotionHistory = useMemo(() => {
    return promotionRecords.map(pr => {
      const batch = batchPromotions.find(b => b.id === pr.promotion_id);
      return { ...pr, batchNumber: batch?.batch_number, promoDate: batch?.created_date, performedBy: batch?.performed_by };
    }).sort((a, b) => new Date(b.promoDate || 0) - new Date(a.promoDate || 0));
  }, [promotionRecords, batchPromotions]);



  const updateStudentMut = useMutation({

    mutationFn: (data) => {
      // Remove empty/null fields to prevent overwriting existing data
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === "" || cleanData[key] === null) {
          delete cleanData[key];
        }
      });
      return appClient.entities.Student.update(studentId, cleanData);
    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["admin-student", studentId] });

      setShowEditStudent(false);

      toast.success("Student updated successfully!");

    },

  });



  const createLogMut = useMutation({

    mutationFn: async (data) => {

      await appClient.entities.ReadingLog.create(data);

      if (student) {

        await appClient.entities.Student.update(student.id, {

          total_pages_read: (student.total_pages_read || 0) + data.pages_read,

        });

      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["admin-student", studentId] });

      queryClient.invalidateQueries({ queryKey: ["admin-student-logs", studentId] });

      setShowLogForm(false);

      setEditingLog(null);

    },

  });



  const updateLogMut = useMutation({

    mutationFn: async ({ logId, data, oldPages }) => {

      await appClient.entities.ReadingLog.update(logId, data);

      if (student) {

        const diff = data.pages_read - oldPages;

        await appClient.entities.Student.update(student.id, {

          total_pages_read: (student.total_pages_read || 0) + diff,

        });

      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["admin-student", studentId] });

      queryClient.invalidateQueries({ queryKey: ["admin-student-logs", studentId] });

      setShowLogForm(false);

      setEditingLog(null);

    },

  });



  const deleteLogMut = useMutation({

    mutationFn: async (log) => {

      await appClient.entities.ReadingLog.delete(log.id);

      if (student) {

        await appClient.entities.Student.update(student.id, {

          total_pages_read: Math.max(0, (student.total_pages_read || 0) - (log.pages_read || 0)),

        });

      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["admin-student", studentId] });

      queryClient.invalidateQueries({ queryKey: ["admin-student-logs", studentId] });

    },

  });



  if (isAdmin === null || loadingStudent) {

    return (

      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">

        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />

      </div>

    );

  }



  if (!isAdmin) {

    return (

      <div className="flex flex-col items-center justify-center min-h-screen">

        <p>Access Denied</p>

        <Link href={createPageUrl("Home")}><Button variant="outline" className="mt-4">Go Home</Button></Link>

      </div>

    );

  }



  if (!student) {

    return (

      <div className="flex flex-col items-center justify-center min-h-screen">

        <p>Student not found</p>

        <Link href={createPageUrl("AdminDashboard")}><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>

      </div>

    );

  }



  const now = new Date();

  const totalPages = student.total_pages_read || 0;

  const weekStart = startOfWeek(now, { weekStartsOn: 0 });

  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const monthStart = startOfMonth(now);

  const monthEnd = endOfMonth(now);



  const weekPages = logs.filter(l => { const d = new Date(l.date); return d >= weekStart && d <= weekEnd; }).reduce((s, l) => s + (l.pages_read || 0), 0);

  const monthPages = logs.filter(l => { const d = new Date(l.date); return d >= monthStart && d <= monthEnd; }).reduce((s, l) => s + (l.pages_read || 0), 0);



  const presentCount = attendance.filter(a => a.status === "present").length;

  const absentCount = attendance.filter(a => a.status === "absent").length;

  const lateCount = attendance.filter(a => a.status === "late").length;

  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;



  const totalFee = fees.reduce((s, f) => s + (f.total_fee || 0), 0);

  const totalPaid = fees.reduce((s, f) => s + (f.paid_amount || 0), 0);

  const totalDue = fees.reduce((s, f) => s + (f.due_amount || 0), 0);



  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {

    const m = subMonths(now, 5 - i);

    const key = format(m, "yyyy-MM");

    const label = format(m, "MMM yy");

    const pages = logs.filter(l => l.date && l.date.startsWith(key)).reduce((s, l) => s + (l.pages_read || 0), 0);

    const att = attendance.filter(a => a.date && a.date.startsWith(key));

    const pct = att.length > 0 ? Math.round((att.filter(a => a.status === "present").length / att.length) * 100) : 0;

    return { label, pages, উপস্থিতি: pct };

  });



  const handleSaveLog = async (data) => {

    if (editingLog) {

      await updateLogMut.mutateAsync({ logId: editingLog.id, data, oldPages: editingLog.pages_read });

    } else {

      await createLogMut.mutateAsync(data);

    }

  };



  const handleDeleteLog = async (log) => {

    if (window.confirm("Delete this reading log?")) {

      await deleteLogMut.mutateAsync(log);

    }

  };



  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}

        <div className="flex items-center justify-between flex-wrap gap-3">

          <div className="flex items-center gap-3">

            <Link 
              href={createPageUrl("AdminDashboard")}
              onClick={(e) => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  e.preventDefault();
                  window.history.back();
                }
              }}
            >
              <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>

            <div className="flex items-center gap-4">

              <div className="h-14 w-14 rounded-xl overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">

                {student.photo_url ? (

                  <img src={student.photo_url} loading="lazy" alt={student.full_name_en || "Student photo"} className="h-full w-full object-cover" />

                ) : (

                  <User className="h-6 w-6 text-indigo-400" />

                )}

              </div>

              <div>

                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{student.full_name_en}</h1>

                <div className="flex items-center gap-2 mt-0.5">

                  <Badge variant="secondary" className="font-mono text-xs">#{student.roll_number}</Badge>

                  <span className="text-sm text-slate-500">{student.batch}</span>

                </div>

              </div>

            </div>

          </div>

          <div className="flex gap-2">

            <Button variant="outline" onClick={() => setShowEditStudent(true)} className="gap-2 text-sm">

              <Pencil className="h-3.5 w-3.5" /> Edit Profile

            </Button>

            {SHOW_READING_PROGRESS && (
              <Button onClick={() => { setEditingLog(null); setShowLogForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-sm">

                <Plus className="h-3.5 w-3.5" /> Add Reading Log

              </Button>
            )}

          </div>

        </div>



        {/* Stats Row */}

        {SHOW_READING_PROGRESS ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <StatsCard icon={BookOpen} label="মোট পৃষ্ঠা" value={totalPages} color="text-indigo-600" bgColor="bg-indigo-50" />

            <StatsCard icon={TrendingUp} label="এ সপ্তাহে" value={weekPages} color="text-emerald-600" bgColor="bg-emerald-50" />

            <StatsCard icon={BarChart3} label="এ মাসে" value={monthPages} color="text-blue-600" bgColor="bg-blue-50" />

            <StatsCard icon={ClipboardList} label="উপস্থিতি" value={`${attendancePct}%`} color="text-amber-600" bgColor="bg-amber-50" />

          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <StatsCard icon={ClipboardList} label="উপস্থিতি" value={`${attendancePct}%`} color="text-amber-600" bgColor="bg-amber-50" />

            <StatsCard icon={DollarSign} label="মোট বেতন" value={`৳${totalFee}`} color="text-slate-600" bgColor="bg-slate-50" />

            <StatsCard icon={CheckCircle2} label="পরিশোধিত" value={`৳${totalPaid}`} color="text-emerald-600" bgColor="bg-emerald-50" />

            <StatsCard icon={XCircle} label="বাকি" value={`৳${totalDue}`} color="text-red-500" bgColor="bg-red-50" />

          </div>
        )}



        {/* AI Performance Analysis */}

        <AIPerformanceAnalysis

          student={student}

          logs={logs}

          attendance={attendance}

          fees={fees}

        />



        {/* Tabs */}

        <Tabs defaultValue={SHOW_READING_PROGRESS ? "reading" : "attendance"}>

          <TabsList className={`grid w-full ${SHOW_READING_PROGRESS ? "grid-cols-4" : "grid-cols-3"}`}>

            {SHOW_READING_PROGRESS && <TabsTrigger value="reading" className="text-xs sm:text-sm">📚 পড়ার হিসাব</TabsTrigger>}

            <TabsTrigger value="attendance" className="text-xs sm:text-sm">📅 উপস্থিতি</TabsTrigger>

            <TabsTrigger value="fees" className="text-xs sm:text-sm">💰 বেতন</TabsTrigger>

            <TabsTrigger value="promotion" className="text-xs sm:text-sm">🎓 উন্নতি</TabsTrigger>

          </TabsList>



          {/* Reading Tab */}

          {SHOW_READING_PROGRESS && (
            <TabsContent value="reading" className="space-y-4 mt-4">

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                <StatsCard icon={TrendingUp} label="এ সপ্তাহে" value={weekPages} color="text-emerald-600" bgColor="bg-emerald-50" />

                <StatsCard icon={BarChart3} label="এ মাসে" value={monthPages} color="text-blue-600" bgColor="bg-blue-50" />

                <StatsCard icon={BookOpen} label="মোট পৃষ্ঠা" value={totalPages} color="text-indigo-600" bgColor="bg-indigo-50" />

                <StatsCard icon={BookOpen} label="মোট এন্ট্রি" value={logs.length} color="text-purple-600" bgColor="bg-purple-50" />

              </div>



              {/* Monthly reading chart */}

              <Card className="border-primary/10">

                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">মাসিক পড়ার গ্রাফ (শেষ ৬ মাস)</CardTitle></CardHeader>

                <CardContent>

                  <div className="h-52">

                    <ResponsiveContainer width="100%" height="100%">

                      <AreaChart data={monthlyChartData}>

                        <defs>

                          <linearGradient id="admpg" x1="0" y1="0" x2="0" y2="1">

                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />

                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />

                          </linearGradient>

                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />

                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />

                        <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />

                        <Area type="monotone" dataKey="pages" name="পৃষ্ঠা" stroke="#6366f1" fill="url(#admpg)" strokeWidth={2.5} />

                      </AreaChart>

                    </ResponsiveContainer>

                  </div>

                </CardContent>

              </Card>



              <ProgressChart logs={logs} />



              {loadingLogs ? (

                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>

              ) : (

                <ReadingLogTable

                  logs={logs}

                  showActions

                  onEdit={(log) => { setEditingLog(log); setShowLogForm(true); }}

                  onDelete={handleDeleteLog}

                />

              )}

            </TabsContent>
          )}



          {/* Attendance Tab */}

          <TabsContent value="attendance" className="space-y-4 mt-4">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              <StatsCard icon={CheckCircle2} label="উপস্থিত" value={presentCount} color="text-emerald-600" bgColor="bg-emerald-50" />

              <StatsCard icon={XCircle} label="অনুপস্থিত" value={absentCount} color="text-red-500" bgColor="bg-red-50" />

              <StatsCard icon={ClipboardList} label="দেরিতে" value={lateCount} color="text-amber-600" bgColor="bg-amber-50" />

              <StatsCard icon={TrendingUp} label="উপস্থিতির হার" value={`${attendancePct}%`} color="text-blue-600" bgColor="bg-blue-50" />

            </div>

            <Card className="border-primary/10">

              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">মাসিক উপস্থিতির গ্রাফ (%)</CardTitle></CardHeader>

              <CardContent>

                <div className="h-52">

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart data={monthlyChartData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />

                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />

                      <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: "10px", border: "none", fontSize: 12 }} />

                      <Bar dataKey="উপস্থিতি" fill="#006241" radius={[6, 6, 0, 0]} />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </CardContent>

            </Card>

            {attendance.length > 0 && (

              <Card className="border-primary/10">

                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">উপস্থিতির ইতিহাস</CardTitle></CardHeader>

                <CardContent>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">

                    {[...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30).map(a => (

                      <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">

                        <span className="text-xs text-slate-600 dark:text-slate-400">{a.date ? format(new Date(a.date), "dd MMM yyyy") : ""}</span>

                        <Badge className={`text-xs ${a.status === "present" ? "bg-emerald-100 text-emerald-700" : a.status === "absent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>

                          {a.status === "present" ? "উপস্থিত" : a.status === "absent" ? "অনুপস্থিত" : "দেরি"}

                        </Badge>

                      </div>

                    ))}

                  </div>

                </CardContent>

              </Card>

            )}

          </TabsContent>



          {/* Fees Tab */}

          <TabsContent value="fees" className="space-y-4 mt-4">

            <div className="grid grid-cols-3 gap-4">

              <StatsCard icon={DollarSign} label="মোট বেতন" value={`৳${totalFee}`} color="text-slate-600" bgColor="bg-slate-50" />

              <StatsCard icon={CheckCircle2} label="পরিশোধিত" value={`৳${totalPaid}`} color="text-emerald-600" bgColor="bg-emerald-50" />

              <StatsCard icon={XCircle} label="বাকি" value={`৳${totalDue}`} color="text-red-500" bgColor="bg-red-50" />

            </div>

            {fees.length === 0 ? (

              <Card className="border-primary/10"><CardContent className="p-8 text-center text-muted-foreground">কোনো বেতনের রেকর্ড নেই</CardContent></Card>

            ) : (

              <Card className="border-primary/10">

                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">মাসভিত্তিক বেতন হিসাব</CardTitle></CardHeader>

                <CardContent className="space-y-2">

                  {[...fees].sort((a, b) => b.month?.localeCompare(a.month)).map(f => (

                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">

                      <div>

                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.month}</p>

                        <p className="text-xs text-muted-foreground">মোট: ৳{f.total_fee} | পরিশোধ: ৳{f.paid_amount || 0} | বাকি: ৳{f.due_amount || 0}</p>

                      </div>

                      <Badge className={`text-xs ${f.status === "paid" ? "bg-emerald-100 text-emerald-700" : f.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>

                        {f.status === "paid" ? "পরিশোধিত" : f.status === "partial" ? "আংশিক" : "বাকি"}

                      </Badge>

                    </div>

                  ))}

                </CardContent>

              </Card>

            )}

          </TabsContent>

          {/* Promotion Tab */}
          <TabsContent value="promotion" className="space-y-4 mt-4">
            {promotionHistory.length === 0 ? (
              <Card className="border-primary/10"><CardContent className="p-8 text-center text-muted-foreground">কোনো উন্নতির রেকর্ড নেই</CardContent></Card>
            ) : (
              <Card className="border-primary/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-amber-500" /> উন্নতির ইতিহাস</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {promotionHistory.map(pr => (
                    <div key={`${pr.promotion_id}-${pr.student_id}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {pr.old_class || "—"} <span className="text-amber-500 mx-1">→</span> {pr.new_class || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pr.batchNumber && <span className="mr-2 font-mono">{pr.batchNumber}</span>}
                          {pr.promoDate && format(new Date(pr.promoDate), "dd MMM yyyy")}
                          {pr.old_session && <span className="ml-2">সেশন: {pr.old_session} → {pr.new_session || pr.old_session}</span>}
                        </p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${pr.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {pr.status === "success" ? "উত্তীর্ণ" : "ব্যর্থ"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>



        {/* Edit Student Dialog */}

        <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>

          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">

            <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>

            <StudentForm
              key={student?.id || 'edit'}
              student={student}

              onSave={(data) => updateStudentMut.mutateAsync(data)}

              onCancel={() => setShowEditStudent(false)}

            />

          </DialogContent>

        </Dialog>



        {/* Log Form Dialog */}

        <Dialog open={showLogForm} onOpenChange={setShowLogForm}>

          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">

            <DialogHeader><DialogTitle>{editingLog ? "Edit Reading Log" : "Add Reading Log"}</DialogTitle></DialogHeader>

            <ReadingLogForm

              log={editingLog}

              studentId={studentId}

              onSave={handleSaveLog}

              onCancel={() => { setShowLogForm(false); setEditingLog(null); }}

            />

          </DialogContent>

        </Dialog>

      </div>

    </div>

  );

}
