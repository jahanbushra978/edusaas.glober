"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

import { appClient } from "@/api/appClient";
import { isAdminUser } from "@/lib/permissions";
import { SHOW_READING_PROGRESS } from "@/config/features";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { createPageUrl } from "@/utils";

import { ArrowLeft, User, Phone, MapPin, Calendar, Hash, Users as UsersIcon, Loader2, DollarSign, Fingerprint, Monitor } from "lucide-react";

import { format } from "date-fns";

const ProgressChart = dynamic(() => import("@/components/ui-custom/ProgressChart"), { ssr: false });
const ReadingLogTable = dynamic(() => import("@/components/ui-custom/ReadingLogTable"), { ssr: false });
const PDFReportButton = dynamic(() => import("@/components/ui-custom/PDFReportButton"), { ssr: false });
const DownloadResultButton = dynamic(() => import("@/components/ui-custom/DownloadResultButton"), { ssr: false });
const StudentExamResults = dynamic(() => import("@/components/student/StudentExamResults"), { ssr: false });
const ApplicationPortal = dynamic(() => import("@/features/applications/components/ApplicationPortal"), { ssr: false });



export default function StudentProfile() {
  const [authState, setAuthState] = React.useState({ loading: true, allowed: false, role: null });
  const [studentId, setStudentId] = React.useState(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setStudentId(urlParams.get("id"));
    }
  }, []);



  React.useEffect(() => {
    if (!studentId) return;
    appClient.auth.me().then((user) => {
      const allowed = isAdminUser(user) || user.role === "branch_admin" || user.role === "teacher" || (user.role === "student" && String(user.profileId) === String(studentId));
      setAuthState({ loading: false, allowed, role: user.role });

      if (!allowed) {
        appClient.auth.redirectToLogin(user.role === "student" ? "student" : "admin");
      }
    }).catch(() => {
      setAuthState({ loading: false, allowed: false, role: null });
      appClient.auth.redirectToLogin("student");
    });
  }, [studentId]);

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["student-profile-target", studentId],
    queryFn: async () => {
      if (!studentId) return null;

      // 1. Try fetching from /api/teacher/students (works for teacher role & admin role)
      try {
        const res = await fetch("/api/teacher/students");
        const json = await res.json().catch(() => ({}));
        if (json.ok && Array.isArray(json.students)) {
          const foundInTeacherApi = json.students.find(s => 
            String(s.id) === String(studentId) ||
            String(s.roll_number) === String(studentId) ||
            String(s.roll) === String(studentId) ||
            String(s.student_id) === String(studentId)
          );
          if (foundInTeacherApi) return foundInTeacherApi;
        }
      } catch {}

      // 2. Direct ID lookup via appClient
      try {
        const byId = await appClient.entities.Student.get(studentId);
        if (byId) return byId;
      } catch {}

      // 3. Filter by numeric ID or roll_number if numeric
      if (!isNaN(Number(studentId))) {
        try {
          const num = Number(studentId);
          const byNum = await appClient.entities.Student.get(num);
          if (byNum) return byNum;
        } catch {}

        try {
          const byRoll = await appClient.entities.Student.filter({ roll_number: Number(studentId) });
          if (byRoll && byRoll.length > 0) return byRoll[0];
        } catch {}
      }

      // 4. Fallback: Search all students list for matching id, roll_number, or roll
      try {
        const allStudents = await appClient.entities.Student.listAll();
        const found = allStudents.find(s => 
          String(s.id) === String(studentId) || 
          String(s.roll_number) === String(studentId) ||
          String(s.roll) === String(studentId) ||
          String(s.student_id) === String(studentId)
        );
        if (found) return found;
      } catch {}

      return null;
    },
    enabled: !!studentId && authState.allowed,
  });

  const targetStudentId = student?.id || studentId;

  const { data: branches = [] } = useQuery({
    queryKey: ["admin-branches-student-profile"],
    queryFn: () => appClient.entities.Branch.list(),
    enabled: authState.allowed,
  });

  const studentBranch = React.useMemo(() => {
    if (!student || !branches.length) return "N/A";
    const bObj = branches.find(b => String(b.id) === String(student.branch_id));
    return bObj ? (bObj.name_bn || bObj.name_en || bObj.branch_name) : "N/A";
  }, [student, branches]);

  const studentClass = React.useMemo(() => {
    if (!student) return "N/A";
    return student.class_name || student.batch || "N/A";
  }, [student]);

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["reading-logs", targetStudentId],
    queryFn: () => appClient.entities.ReadingLog.filter({ student_id: targetStudentId }, "-date", 500),
    enabled: !!targetStudentId && authState.allowed,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", targetStudentId],
    queryFn: () => appClient.entities.DailyLesson.filter({ student_id: targetStudentId }, "-date", 200),
    enabled: !!targetStudentId && authState.allowed,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-student", targetStudentId],
    queryFn: () => appClient.entities.Attendance.filter({ student_id: targetStudentId }, "-date", 200),
    enabled: !!targetStudentId && authState.allowed,
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["fees", targetStudentId],
    queryFn: () => appClient.entities.Fee.filter({ student_id: targetStudentId }),
    enabled: !!targetStudentId && authState.allowed,
  });

  const { data: biometricProfile } = useQuery({
    queryKey: ["biometric-profile-student", targetStudentId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=biometric_profile&user_type=student&user_id=${targetStudentId}`);
      const d = await r.json();
      return d.ok ? d.data : null;
    },
    enabled: !!targetStudentId && authState.allowed,
  });

  const { data: biometricAttendance = [] } = useQuery({
    queryKey: ["biometric-attendance-student", targetStudentId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=report&user_type=student&user_id=${targetStudentId}&limit=20`);
      const d = await r.json();
      return d.ok ? d.data : [];
    },
    enabled: !!targetStudentId && authState.allowed && !!biometricProfile,
  });

  const presentCount = useMemo(() => attendance.filter(a => a.status === "present" || a.status === "Present").length, [attendance]);
  const absentCount = useMemo(() => attendance.filter(a => a.status === "absent" || a.status === "Absent").length, [attendance]);
  const lateCount = useMemo(() => attendance.filter(a => a.status === "late" || a.status === "Late").length, [attendance]);
  const totalAtt = attendance.length;
  const attendancePct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

  // Calculate fees statistics
  const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + (f.due_amount || 0), 0);

  // Get dynamic monthly tuition fee setup
  let monthlyFee = 0;
  if (student && student.custom_fields) {
    try {
      const parsed = JSON.parse(student.custom_fields);
      monthlyFee = parsed.fees_setup?.["Monthly Tuition Fee"] || 0;
    } catch (e) {
      console.error("Error parsing fees_setup:", e);
    }
  }

  const currentStatus = totalDue > 0 ? (totalPaid > 0 ? "Partial Paid" : "Due") : (fees.length > 0 ? "Paid" : "Due");



  if (authState.loading || loadingStudent) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <div className="text-center">

          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />

          <p className="text-sm text-muted-foreground">Loading...</p>

        </div>

      </div>

    );

  }

  if (!authState.allowed) {
    return null;
  }



  if (!student) {

    return (

      <div className="flex flex-col items-center justify-center min-h-screen p-4">

        <div className="premium-card rounded-2xl p-10 text-center max-w-sm">

          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Student Not Found</h2>

          <p className="text-sm text-muted-foreground mb-5">No student found with this Student ID.</p>

          <Link href={createPageUrl("Home")}>

            <Button variant="outline" className="gap-2">

              <ArrowLeft className="h-4 w-4" /> Back to Search

            </Button>

          </Link>

        </div>

      </div>

    );

  }



  const now = new Date();

  const thisMonth = logs.filter(l => {

    const d = new Date(l.date);

    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

  });

  const thisWeek = logs.filter(l => {

    const d = new Date(l.date);

    return (now - d) / (1000 * 60 * 60 * 24) <= 7;

  });



  const totalPages = student.total_pages_read || logs.reduce((s, l) => s + (l.pages_read || 0), 0);

  const monthPages = thisMonth.reduce((s, l) => s + (l.pages_read || 0), 0);

  const weekPages = thisWeek.reduce((s, l) => s + (l.pages_read || 0), 0);

  const recentLesson = lessons[0];



  const statusColors = {

    active: "bg-emerald-100 text-emerald-700 border-emerald-200",

    inactive: "bg-slate-100 text-slate-600",

    graduated: "bg-blue-100 text-blue-700",

  };



  let customFields = null;

  if (student.custom_fields) {

    try { customFields = JSON.parse(student.custom_fields); } catch {}

  }



  const InfoRow = ({ icon: Icon, label, value }) => {

    if (!value) return null;

    return (

      <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">

        <Icon className="h-4 w-4 text-primary/40 mt-0.5 flex-shrink-0" />

        <div>

          <p className="text-xs text-muted-foreground">{label}</p>

          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>

        </div>

      </div>

    );

  };



  return (

    <div className="min-h-screen">

      {/* Header */}

      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#004030 0%,#005235 60%,#006241 100%)" }}>

        <svg className="absolute bottom-0 right-0 w-56 h-56 opacity-5 pointer-events-none" viewBox="0 0 200 200">

          <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AF37" strokeWidth="1" />

          <circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF37" strokeWidth="1" />

          <polygon points="100,30 113,72 158,72 122,97 135,140 100,115 65,140 78,97 42,72 87,72" fill="none" stroke="#D4AF37" strokeWidth="1" />

        </svg>



        <div className="max-w-5xl mx-auto px-4 py-8">

          <Link 
            href={authState.role === "teacher" ? createPageUrl("TeacherDashboard") : (authState.role === "admin" || authState.role === "branch_admin") ? createPageUrl("AdminDashboard") : createPageUrl("Home")}
            onClick={(e) => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                e.preventDefault();
                window.history.back();
              }
            }}
          >
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-5 gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" /> {authState.role === "teacher" || authState.role === "admin" || authState.role === "branch_admin" ? "Back to Dashboard" : "Back to Home"}
            </Button>
          </Link>



          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/20" style={{ background: "rgba(255,255,255,0.15)" }}>

              {student.photo_url ? (

                <img src={student.photo_url} loading="lazy" alt={student.full_name_en} className="h-full w-full object-cover" />

              ) : (

                <div className="h-full w-full flex items-center justify-center">

                  <User className="h-10 w-10 text-white/50" />

                </div>

              )}

            </div>



            <div className="flex-1">

              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{student.full_name_en}</h1>

              {student.full_name_bn && (

                <p className="text-white/70 mt-1 font-bengali text-lg">{student.full_name_bn}</p>

              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(212,175,55,0.25)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>

                  # {student.roll_number}

                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  শাখা: {studentBranch}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  শ্রেণী: {studentClass}
                </span>

                <Badge className={statusColors[student.status] || statusColors.active}>

                  {student.status || "active"}

                </Badge>

              </div>

            </div>



            <div className="flex-shrink-0 flex gap-2 sm:gap-3 flex-wrap">

              <PDFReportButton student={student} logs={logs} lessons={lessons} attendance={attendance} />

              <DownloadResultButton student={student} attendance={attendance} />

            </div>

          </div>

        </div>

      </div>



      {/* Stats Bar */}

      <div className="max-w-5xl mx-auto px-4">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-3 sm:-mt-5 mb-6 sm:mb-8 relative z-10">

          {(SHOW_READING_PROGRESS ? [

            { label: "Total Pages", value: totalPages, color: "text-primary" },

            { label: "This Month", value: monthPages, color: "text-primary" },

            { label: "This Week", value: weekPages, color: "text-primary" },

            { label: "Attendance", value: attendancePct !== null ? `${attendancePct}%` : "—", color: attendancePct !== null && attendancePct < 75 ? "text-red-600" : "text-emerald-600" },

          ] : [

            { label: "Attendance", value: attendancePct !== null ? `${attendancePct}%` : "—", color: attendancePct !== null && attendancePct < 75 ? "text-red-600" : "text-emerald-600" },

            { label: "Monthly Fee", value: `৳${monthlyFee.toLocaleString()}`, color: "text-primary" },

            { label: "Total Paid", value: `৳${totalPaid.toLocaleString()}`, color: "text-emerald-600" },

            { label: "Total Due", value: `৳${totalDue.toLocaleString()}`, color: totalDue > 0 ? "text-red-600" : "text-slate-600" },

          ]).map((stat, i) => (

            <div key={i} className="premium-card rounded-xl p-4 text-center">

              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>

              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>

            </div>

          ))}

        </div>

      </div>



      <div className="max-w-5xl mx-auto px-4 pb-12">

        <StudentExamResults student={student} />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl h-auto sm:h-12 bg-white dark:bg-slate-800 p-1 border shadow-sm max-w-md">
            <TabsTrigger value="profile" className="rounded-xl h-10 font-bold text-[10px] sm:text-xs">📋 Profile</TabsTrigger>
            <TabsTrigger value="fees" className="rounded-xl h-10 font-bold text-[10px] sm:text-xs">💰 Fees</TabsTrigger>
            <TabsTrigger value="hajira" className="rounded-xl h-10 font-bold text-[10px] sm:text-xs">✅ Hajira</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl h-10 font-bold text-[10px] sm:text-xs">📝 দরখাস্ত</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">

            {SHOW_READING_PROGRESS ? (
              <>
                <Card className="premium-card border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide">Reading Progress Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart logs={logs} title="" />
                  </CardContent>
                </Card>
                <Card className="premium-card border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide">Reading History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingLogs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ReadingLogTable logs={logs} />
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="premium-card border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide">Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InfoRow icon={UsersIcon} label="Father's Name" value={student.father_name} />
                    <InfoRow icon={UsersIcon} label="Mother's Name" value={student.mother_name} />
                    <InfoRow icon={Phone} label="Mobile" value={student.mobile_number} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth ? format(new Date(student.date_of_birth), "PPP") : null} />
                    <InfoRow icon={Calendar} label="Admission Date" value={student.admission_date ? format(new Date(student.admission_date), "PPP") : null} />
                    <InfoRow icon={Hash} label="Admission Year" value={student.admission_year} />
                    <InfoRow icon={MapPin} label="Address" value={student.address} />
                    {customFields && Object.entries(customFields).map(([key, val]) => (
                      <InfoRow key={key} icon={Hash} label={key.replace(/_/g, " ")} value={String(val)} />
                    ))}
                  </CardContent>
                </Card>
                {recentLesson && (
                  <Card className="premium-card border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide">Current Lesson</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-xl" style={{ background: "rgba(0,98,65,0.07)", border: "1px solid rgba(0,98,65,0.15)" }}>
                        <p className="text-xs text-muted-foreground">{recentLesson.subject}</p>
                        <p className="font-semibold text-primary mt-1 text-sm">{recentLesson.lesson_content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(recentLesson.date), "dd MMM yyyy")}</p>
                        {recentLesson.quality_score && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Score:</span>
                            <span className="font-bold text-sm" style={{ color: "#D4AF37" }}>{recentLesson.quality_score}/10</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          </TabsContent>

          <TabsContent value="fees" className="space-y-6">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="premium-card border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Monthly Fee</p>
                  <p className="text-lg font-bold text-primary">৳{monthlyFee.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="premium-card border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="premium-card border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Total Due</p>
                  <p className="text-lg font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="premium-card border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <Badge className={`text-xs px-2.5 py-0.5 rounded-full font-bold mt-1 ${
                    currentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    currentStatus === "Partial Paid" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {currentStatus}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="premium-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="h-4.5 w-4.5 text-emerald-600" /> Fees Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No fees records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] sm:text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700/50">
                          <th className="py-2 px-1 sm:px-0 font-semibold text-slate-500">Month</th>
                          <th className="py-2 px-1 sm:px-0 font-semibold text-slate-500">Fee</th>
                          <th className="py-2 px-1 sm:px-0 font-semibold text-slate-500">Paid</th>
                          <th className="py-2 px-1 sm:px-0 font-semibold text-slate-500">Due</th>
                          <th className="py-2 px-1 sm:px-0 font-semibold text-slate-500 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                        {[...fees].sort((a, b) => b.month?.localeCompare(a.month)).map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2 px-1 sm:py-2.5 sm:px-0 font-medium text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs">{f.month}</td>
                            <td className="py-2 px-1 sm:py-2.5 sm:px-0 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">৳{f.total_fee || 0}</td>
                            <td className="py-2 px-1 sm:py-2.5 sm:px-0 text-emerald-600 font-medium text-[10px] sm:text-xs">৳{f.paid_amount || 0}</td>
                            <td className="py-2 px-1 sm:py-2.5 sm:px-0 text-red-600 font-medium text-[10px] sm:text-xs">৳{f.due_amount || 0}</td>
                            <td className="py-2 px-1 sm:py-2.5 sm:px-0 text-right">
                              <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full ${
                                f.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                f.status === "partial" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-red-50 text-red-700 border-red-100"
                              }`}>
                                {f.status === "paid" ? "Paid" : f.status === "partial" ? "Partial" : "Due"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="hajira" className="space-y-6">
            {/* Attendance Summary Report Card */}
            <Card className="premium-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-emerald-600" /> Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
                    <p className="text-xs text-emerald-600 font-medium">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                    <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                    <p className="text-xs text-red-600 font-medium">Absent</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                    <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
                    <p className="text-xs text-amber-600 font-medium">Late</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <p className="text-2xl font-bold text-blue-700">{attendancePct}%</p>
                    <p className="text-xs text-blue-600 font-medium">Attendance Rate</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Total Records: {attendance.length} | Present: {presentCount} | Absent: {absentCount} | Late: {lateCount}
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-amber-600" /> Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No attendance records found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] sm:text-xs">
                        <span className="text-slate-600 dark:text-slate-400 truncate mr-2">
                          {a.date ? format(new Date(a.date), "dd MMM yyyy") : "—"}
                        </span>
                        <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                          a.status === "present" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          a.status === "absent" ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {a.status === "present" ? "Present" : a.status === "absent" ? "Absent" : "Late"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                  <Fingerprint className="h-4.5 w-4.5 text-indigo-600" /> Biometric Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!biometricProfile ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No biometric data configured for this student.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-xs text-muted-foreground">Machine User ID</span>
                      <span className="text-sm font-mono font-semibold">{biometricProfile.machine_user_id}</span>
                    </div>
                    {biometricProfile.card_number && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-muted-foreground">Card Number</span>
                        <span className="text-sm font-mono font-semibold">{biometricProfile.card_number}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-xs text-muted-foreground">Fingerprint</span>
                      <Badge variant={biometricProfile.fingerprint_enabled ? "default" : "secondary"}>
                        {biometricProfile.fingerprint_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-xs text-muted-foreground">Face Recognition</span>
                      <Badge variant={biometricProfile.face_enabled ? "default" : "secondary"}>
                        {biometricProfile.face_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <Badge variant={biometricProfile.enable_biometric ? "default" : "secondary"}>
                        {biometricProfile.enable_biometric ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-xs text-muted-foreground">Last Sync</span>
                      <span className="text-sm">{biometricProfile.updated_at ? format(new Date(biometricProfile.updated_at), "dd MMM yyyy HH:mm") : "N/A"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                  <Monitor className="h-4.5 w-4.5 text-amber-600" /> Biometric Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {biometricAttendance.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No biometric attendance records found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {biometricAttendance.map((r) => (
                      <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] sm:text-xs gap-1 sm:gap-0">
                        <span className="text-slate-600 dark:text-slate-400 truncate">
                          {r.attendance_date ? format(new Date(r.attendance_date), "dd MMM yyyy") : "—"}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          {r.punch_in && <span className="text-[10px] sm:text-xs text-muted-foreground">In: {new Date(r.punch_in).toLocaleTimeString()}</span>}
                          {r.punch_out && <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">Out: {new Date(r.punch_out).toLocaleTimeString()}</span>}
                          <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                            r.status === "present" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            r.status === "absent" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications / দরখাস্ত Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card className="rounded-2xl border-0 shadow-sm p-4 sm:p-6 bg-white dark:bg-slate-900">
              <ApplicationPortal
                user={{ id: student.id, role: "student", name: student.full_name_en, full_name_en: student.full_name_en }}
                applicant={{ id: student.id, name: student.full_name_en, type: "student", branch_id: student.branch_id }}
              />
            </Card>
          </TabsContent>
        </Tabs>

      </div>

    </div>

  );

}
