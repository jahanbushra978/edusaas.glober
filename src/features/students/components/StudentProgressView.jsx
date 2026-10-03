import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, BookOpen, Calendar, Phone, MapPin, GraduationCap,
  LogOut, BarChart3, TrendingUp, ClipboardList, Loader2, Download, DollarSign, CheckCircle2, XCircle, Printer
} from "lucide-react";

import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subMonths
} from "date-fns";

const Logo = dynamic(() => import("@/components/home/Logo"), { ssr: false });
const AIReadingSuggestions = dynamic(() => import("@/components/student/AIReadingSuggestions"), { ssr: false });
import ApplicationPortal from "@/features/applications/components/ApplicationPortal";
import { filterActiveMarksDetails } from "@/lib/academic";

const ChartLoader = () => (
  <div className="h-56 flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

function ChartsWrapper({ monthlyChartData, chartType }) {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  useEffect(() => {
    import("recharts").then(() => setChartsLoaded(true));
  }, []);
  if (!chartsLoaded) return <ChartLoader />;
  const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } = require("recharts");
  if (chartType === "area") {
    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyChartData}>
            <defs><linearGradient id="cpg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006241" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#006241" stopOpacity={0} />
            </linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            <Area type="monotone" dataKey="pages" name="Pages" stroke="#006241" fill="url(#cpg)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: "10px", border: "none", fontSize: 12 }} />
          <Bar dataKey="Attendance" fill="#006241" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function calcSubjectGradeAndGPA(obtained, full) { const pct = (obtained / full) * 100; if (pct >= 80) return { grade: "A+", gpa: 5.00 }; if (pct >= 70) return { grade: "A", gpa: 4.00 }; if (pct >= 60) return { grade: "A-", gpa: 3.50 }; if (pct >= 50) return { grade: "B", gpa: 3.00 }; if (pct >= 40) return { grade: "C", gpa: 2.00 }; if (pct >= 33) return { grade: "D", gpa: 1.00 }; return { grade: "F", gpa: 0.00 }; }

function getPrintableMarksheetHTML(student, branchObj, className, exam, res, settingsObj) {
  return `<html><head><title>Marksheet — ${student.full_name_en}</title>
  <style>
    body { font-family: 'Arial', sans-serif; padding: 20px; color: #111; }
    h1, h2, h3 { color: #005a3e; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #005a3e; color: white; padding: 8px 10px; text-align: left; font-size: 13px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; border-bottom: 2px solid #005a3e; padding-bottom: 16px; }
    .section-title { font-size: 14px; font-weight: 700; color: #005a3e; margin: 18px 0 8px; border-left: 4px solid #D4AF37; padding-left: 8px; }
    @media print { body { margin: 0; } }
  </style></head>
  <body>
    <div class="header"><div>
      <h1 style="margin:0;font-size:20px;">${settingsObj?.institute_name_en || "Rahmania Institute"}</h1>
      <p style="margin:0;font-size:12px;color:#64748b;">Marksheet — ${exam.title}</p>
    </div></div>
    <h2>${student.full_name_en}</h2>
    <p style="font-size:13px;color:#64748b;margin-bottom:12px;">Roll: ${student.roll_number} | Class: ${className} | Status: ${res.status}</p>
    <div class="section-title">Subject Marks</div>
    <table><tr><th>Subject</th><th>Full</th><th>Pass</th><th>Obtained</th><th>Grade</th></tr>
    ${(res.marks_details || []).map(sub => `<tr><td>${sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</td><td>${sub.full_marks}</td><td>${sub.pass_marks}</td><td>${sub.obtained_marks}</td><td>${sub.obtained_marks < sub.pass_marks ? "F" : calcSubjectGradeAndGPA(sub.obtained_marks, sub.full_marks).grade}</td></tr>`).join("")}
    </table>
    <p style="margin-top:16px;"><strong>GPA:</strong> ${res.gpa?.toFixed(2)} | <strong>Grade:</strong> ${res.grade} | <strong>Position:</strong> #${res.rank || "N/A"}</p>
  </body></html>`;
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs italic text-muted-foreground">{label}</p>
        <p className="text-sm font-medium italic text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div className="text-center py-3 px-3 rounded-xl bg-slate-50">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs italic text-muted-foreground">{label}</p>
    </div>
  );
}

export default function StudentProgressView({ student, instNameEn, onLogout }) {



  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ["student-lessons", student.id],
    queryFn: () => appClient.entities.DailyLesson.filter({ student_id: student.id }),
  });
  const { data: attendance = [] } = useQuery({
    queryKey: ["student-attendance", student.id],
    queryFn: () => appClient.entities.Attendance.filter({ student_id: student.id }),
  });
  const { data: fees = [] } = useQuery({
    queryKey: ["student-fees", student.id],
    queryFn: () => appClient.entities.Fee.filter({ student_id: student.id }),
  });
  const { data: examResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["student-exam-results", student.id],
    queryFn: () => appClient.entities.ExamResult.filter({ student_id: student.id }),
  });
  const { data: exams = [] } = useQuery({
    queryKey: ["student-portal-exams"],
    queryFn: () => appClient.entities.Exam.list(),
  });
  const { data: branches = [] } = useQuery({
    queryKey: ["student-portal-branches"],
    queryFn: () => appClient.entities.Branch.list(),
  });
  const { data: appSettings = [] } = useQuery({
    queryKey: ["student-portal-settings"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const settingsObj = Object.fromEntries(appSettings.map(s => [s.key, s.value]));
  const branchObj = branches.find(b => String(b.id) === String(student.branch_id));
  const classObj = branchObj?.academic_structure?.find(c => 
    c.id === student.class_id || 
    (c.sections && c.sections.some(s => s.id === student.class_id))
  );
  const studentSection = classObj && Array.isArray(classObj.sections)
    ? classObj.sections.find(s => s.id === student.class_id)
    : null;
  const sectionSuffix = studentSection 
    ? ` (${studentSection.section_name?.en || studentSection.section_name?.bn || studentSection.section_name || ""})`
    : "";
  const className = (classObj?.class_name?.en || classObj?.class_name?.bn || "Class") + sectionSuffix;


  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const weeklyPages = lessons.filter(l => { const d = new Date(l.date); return d >= weekStart && d <= weekEnd; }).reduce((s, l) => s + (l.pages_covered || 0), 0);
  const monthlyPages = lessons.filter(l => { const d = new Date(l.date); return d >= monthStart && d <= monthEnd; }).reduce((s, l) => s + (l.pages_covered || 0), 0);
  const yearlyPages = lessons.filter(l => { const d = new Date(l.date); return d >= yearStart && d <= yearEnd; }).reduce((s, l) => s + (l.pages_covered || 0), 0);

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const weeklyAttendance = attendance.filter(a => { const d = new Date(a.date); return d >= weekStart && d <= weekEnd; });
  const monthlyAttendance = attendance.filter(a => { const d = new Date(a.date); return d >= monthStart && d <= monthEnd; });

  const totalFee = fees.reduce((s, f) => s + (f.total_fee || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paid_amount || 0), 0);
  const totalDue = fees.reduce((s, f) => s + (f.due_amount || 0), 0);
  const totalDiscount = fees.reduce((s, f) => s + (f.discount || 0), 0);
  const totalFine = fees.reduce((s, f) => s + (f.fine || 0), 0);

  // Get dynamic monthly tuition fee setup
  let monthlyFeeSetting = 0;
  if (student && student.custom_fields) {
    try {
      const parsed = JSON.parse(student.custom_fields);
      monthlyFeeSetting = parsed.fees_setup?.["Monthly Tuition Fee"] || 0;
    } catch {
    }
  }

  // Get last payment date
  const formatPaymentDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return format(new Date(year, month, day), 'dd MMM yyyy');
      }
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };
  const lastPaymentRecord = [...fees].sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0))[0];
  const lastPaymentDate = lastPaymentRecord ? formatPaymentDate(lastPaymentRecord.payment_date) : "N/A";

  // Get current status
  const currentStatus = totalDue > 0 ? (totalPaid > 0 ? "Partial Paid" : "Due") : (fees.length > 0 ? "Paid" : "Due");

  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(now, 5 - i);
    const key = format(m, "yyyy-MM");
    const label = format(m, "MMM yy");
    const pages = lessons.filter(l => l.date?.startsWith(key)).reduce((s, l) => s + (l.pages_covered || 0), 0);
    const att = attendance.filter(a => a.date?.startsWith(key));
    const pct = att.length > 0 ? Math.round((att.filter(a => a.status === "present").length / att.length) * 100) : 0;
    return { label, pages, Attendance: pct };
  });

  const lastLesson = [...lessons].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const statusColors = { active: "bg-emerald-100 text-emerald-700", inactive: "bg-slate-100 text-slate-600", graduated: "bg-blue-100 text-blue-700" };

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Progress Report — ${student.full_name_en}</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; color: #111; font-style: italic; }
        h1, h2, h3 { color: #005a3e; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th { background: #005a3e; color: white; padding: 8px 10px; text-align: left; font-size: 13px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; border-bottom: 2px solid #005a3e; padding-bottom: 16px; }
        .stat-box { display: inline-block; background: #f1f5f9; border-radius: 10px; padding: 10px 18px; margin: 4px; text-align: center; }
        .stat-value { font-size: 22px; font-weight: bold; color: #005a3e; }
        .stat-label { font-size: 11px; color: #64748b; }
        .section-title { font-size: 14px; font-weight: 700; color: #005a3e; margin: 18px 0 8px; border-left: 4px solid #D4AF37; padding-left: 8px; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <div class="header"><div>
          <h1 style="margin:0;font-size:20px;">${instNameEn || "Rahmania Institute"}</h1>
          <p style="margin:0;font-size:12px;color:#64748b;">Student Progress Report — ${format(now, "dd MMMM yyyy")}</p>
        </div></div>
        <h2>${student.full_name_en}</h2>
        <p style="font-size:13px;color:#64748b;margin-bottom:12px;">Roll: ${student.roll_number} | Batch: ${student.batch} | Status: ${student.status}</p>
        <div class="section-title">📊 Reading Summary</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
          ${[["Total Pages", student.total_pages_read || 0], ["This Week", weeklyPages], ["This Month", monthlyPages], ["This Year", yearlyPages]].map(([l, v]) => `<div class="stat-box"><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`).join("")}
        </div>
        <div class="section-title">📅 Attendance</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
          ${[["Present", presentCount], ["Absent", absentCount], ["Late", lateCount], ["Rate", `${attendancePct}%`]].map(([l, v]) => `<div class="stat-box"><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`).join("")}
        </div>
        <div class="section-title">💰 Fee Summary</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
          ${[["Total Fee", `৳${totalFee}`], ["Paid", `৳${totalPaid}`], ["Due", `৳${totalDue}`]].map(([l, v]) => `<div class="stat-box"><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`).join("")}
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#020f08 0%,#051a0e 30%,#020f08 100%)" }}>
      <svg className="fixed inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <defs><pattern id="sv" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#sv)"/>
      </svg>

      {/* Header bar */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/10"
        style={{ background: "rgba(2,10,6,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5">
            <Logo className="w-full h-full rounded-xl object-contain" />
          </div>

          <div>
            <p className="text-xs font-bold italic text-white">{instNameEn || "Rahmania Institute"}</p>
            <p className="text-xs italic" style={{ color: "rgba(212,175,55,0.70)" }}>Student Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} size="sm" className="gap-1.5 text-xs"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)", color: "#D4AF37" }}>
            <Download className="h-3.5 w-3.5" /> Download Report
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-white/50 hover:text-white gap-1.5 text-xs italic">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Student Header Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#003d2b,#005a3e)" }}>
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-yellow-400/30 flex-shrink-0 bg-white/10">
              {student.photo_url ? <img src={student.photo_url} loading="lazy" className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><User className="h-7 w-7 text-white/60" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold italic text-white">{student.full_name_en}</h2>
              {student.full_name_bn && <p className="text-white/60 text-sm">{student.full_name_bn}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono italic" style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.35)" }}>ID: {student.roll_number}</span>
                <Badge className={`text-xs ${statusColors[student.status] || statusColors.active}`}>{student.status}</Badge>
                {student.batch && <Badge variant="outline" className="text-xs text-white/70 border-white/20 italic">{student.batch}</Badge>}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Total Pages" value={student.total_pages_read || 0} icon={BookOpen} color="text-primary" />
            <StatBox label="This Week" value={weeklyPages} icon={TrendingUp} color="text-emerald-600" />
            <StatBox label="This Month" value={monthlyPages} icon={BarChart3} color="text-blue-600" />
            <StatBox label="Attendance" value={`${attendancePct}%`} icon={ClipboardList} color="text-amber-600" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="progress">
          <TabsList className="grid w-full grid-cols-6 bg-white/10">
            <TabsTrigger value="progress" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">📈 Progress</TabsTrigger>
            <TabsTrigger value="attendance" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">📅 Attendance</TabsTrigger>
            <TabsTrigger value="fees" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">💰 Fees</TabsTrigger>
            <TabsTrigger value="results" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">🏆 Results</TabsTrigger>
            <TabsTrigger value="profile" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">👤 Profile</TabsTrigger>
            <TabsTrigger value="applications" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 text-xs italic">📝 আবেদন</TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.95)" }}>
              <h3 className="font-bold italic text-primary text-sm">Reading Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="This Week" value={weeklyPages} icon={TrendingUp} color="text-emerald-600" />
                <StatBox label="This Month" value={monthlyPages} icon={BarChart3} color="text-blue-600" />
                <StatBox label="This Year" value={yearlyPages} icon={GraduationCap} color="text-purple-600" />
                <StatBox label="All Time" value={student.total_pages_read || 0} icon={BookOpen} color="text-primary" />
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.95)" }}>
              <h3 className="font-bold italic text-primary text-sm mb-3">Monthly Progress Chart (Last 6 Months)</h3>
              {lessons.length === 0 ? <p className="text-center text-slate-400 py-8 italic">No data available</p> : (
                <ChartsWrapper monthlyChartData={monthlyChartData} chartType="area" />
              )}
            </div>
            <AIReadingSuggestions student={student} logs={lessons} latestSubjects={lastLesson?.subject || ""} />
            {!lessonsLoading && lessons.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.95)" }}>
                <h3 className="font-bold italic text-primary text-sm mb-3">Recent Lesson History</h3>
                <div className="space-y-2">
                  {[...lessons].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(l => (
                    <div key={l.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="text-center min-w-[44px] bg-primary/8 rounded-lg p-1.5">
                        <p className="text-xs font-bold text-primary">{l.date ? format(new Date(l.date), "dd") : ""}</p>
                        <p className="text-xs italic text-muted-foreground">{l.date ? format(new Date(l.date), "MMM") : ""}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold italic text-slate-700">{l.subject}</p>
                        <p className="text-xs italic text-muted-foreground truncate">{l.lesson_content}</p>
                      </div>
                      {l.pages_covered > 0 && <span className="text-xs font-semibold text-primary">{l.pages_covered}p</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4 mt-4">
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.95)" }}>
              <h3 className="font-bold italic text-primary text-sm">Attendance Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="Present" value={presentCount} icon={CheckCircle2} color="text-emerald-600" />
                <StatBox label="Absent" value={absentCount} icon={XCircle} color="text-red-500" />
                <StatBox label="Late" value={lateCount} icon={ClipboardList} color="text-amber-600" />
                <StatBox label="Rate" value={`${attendancePct}%`} icon={TrendingUp} color="text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold italic text-slate-600 mb-1">This Week</p>
                  <p className="text-sm italic">Present: <strong>{weeklyAttendance.filter(a => a.status === "present").length}</strong> / {weeklyAttendance.length}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold italic text-slate-600 mb-1">This Month</p>
                  <p className="text-sm italic">Present: <strong>{monthlyAttendance.filter(a => a.status === "present").length}</strong> / {monthlyAttendance.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.95)" }}>
              <h3 className="font-bold italic text-primary text-sm mb-3">Monthly Attendance Chart (%)</h3>
              <ChartsWrapper monthlyChartData={monthlyChartData} chartType="bar" />
            </div>
            {attendance.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.95)" }}>
                <h3 className="font-bold italic text-primary text-sm mb-3">Attendance History</h3>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {[...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30).map(a => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                      <span className="text-xs italic text-slate-600">{a.date ? format(new Date(a.date), "dd MMM yyyy") : ""}</span>
                      <Badge className={`text-xs ${a.status === "present" ? "bg-emerald-100 text-emerald-700" : a.status === "absent" ? "bg-red-100 text-red-700" : a.status === "late" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4 mt-4">
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.95)" }}>
              <h3 className="font-bold italic text-primary text-sm flex items-center gap-2 border-b pb-2">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Financial Summary Profile
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xl font-bold text-slate-800">৳{monthlyFeeSetting.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly Tuition Fee</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xl font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Paid</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Due</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold mt-1 ${
                    currentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    currentStatus === "Partial Paid" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {currentStatus}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1.5">Current Status</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-muted-foreground font-medium">Total Discount:</span>
                  <span className="font-bold text-blue-600">৳{totalDiscount}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-muted-foreground font-medium">Total Fine:</span>
                  <span className="font-bold text-amber-600">৳{totalFine}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-muted-foreground font-medium">Last Payment Date:</span>
                  <span className="font-bold text-slate-700">{lastPaymentDate}</span>
                </div>
              </div>
            </div>
            {fees.length === 0 ? (
              <div className="rounded-2xl p-8 text-center italic text-slate-400" style={{ background: "rgba(255,255,255,0.95)" }}>No fee records found.</div>
            ) : (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.95)" }}>
                <h3 className="font-bold italic text-primary text-sm mb-3">Monthly Fee Records</h3>
                <div className="space-y-2">
                  {[...fees].sort((a, b) => b.month?.localeCompare(a.month)).map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold italic text-slate-700">{f.month}</p>
                        <p className="text-xs italic text-muted-foreground">Total: ৳{f.total_fee} | Paid: ৳{f.paid_amount || 0} | Due: ৳{f.due_amount || 0}</p>
                      </div>
                      <Badge className={`text-xs ${f.status === "paid" ? "bg-emerald-100 text-emerald-700" : f.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {f.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <Card className="border-primary/10" style={{ background: "rgba(255,255,255,0.95)" }}>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-bold italic text-primary flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <InfoRow icon={GraduationCap} label="Department / Batch" value={student.batch} />
                <InfoRow icon={Calendar} label="Admission Date" value={student.admission_date ? format(new Date(student.admission_date), "dd MMMM yyyy") : null} />
                <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth ? format(new Date(student.date_of_birth), "dd MMMM yyyy") : null} />
                <InfoRow icon={User} label="Father's Name" value={student.father_name} />
                <InfoRow icon={User} label="Mother's Name" value={student.mother_name} />
                <InfoRow icon={Phone} label="Mobile Number" value={student.mobile_number} />
                <InfoRow icon={MapPin} label="Address" value={student.address} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4 mt-4">
            {resultsLoading ? (
              <div className="rounded-2xl p-8 text-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
            ) : examResults.length === 0 ? (
              <div className="rounded-2xl p-8 text-center bg-white italic text-slate-400" style={{ background: "rgba(255,255,255,0.95)" }}>No exam results recorded for you yet.</div>
            ) : (
              <div className="space-y-4">
                {examResults.map(res => {
                  const exam = exams.find(e => String(e.id) === String(res.exam_id));
                  if (!exam) return null;
                  
                  const activeMarks = filterActiveMarksDetails(res.marks_details, student, branchObj?.academic_structure);
                  const isFailed = activeMarks.some(sub => Number(sub.obtained_marks) < Number(sub.pass_marks));
                  
                  const handlePrint = () => {
                    const html = getPrintableMarksheetHTML(student, branchObj, className, exam, { ...res, marks_details: activeMarks }, settingsObj);
                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(html);
                    printWindow.document.close();
                  };

                  return (
                    <Card key={res.id} className="border-0 shadow-sm rounded-[20px] overflow-hidden bg-white/95" style={{ background: "rgba(255,255,255,0.95)" }}>
                      <CardHeader className="bg-slate-50/50 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{exam.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Publish Date: {exam.result_publish_date || "N/A"}</p>
                        </div>
                        <Button onClick={handlePrint} size="sm" className="bg-[#004D3A] hover:bg-[#003d2b] text-white gap-1.5 text-xs font-semibold rounded-xl h-8">
                          <Printer className="h-3.5 w-3.5" /> Print Marksheet
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* Overall Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 rounded-xl p-3 text-center">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">GPA</p>
                            <p className="text-base font-extrabold text-slate-800" style={isFailed ? { color: "red" } : {}}>{isFailed ? "0.00" : res.gpa?.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">Letter Grade</p>
                            <p className="text-base font-extrabold text-slate-800" style={isFailed ? { color: "red" } : {}}>{isFailed ? "F" : res.grade}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">Merit Position</p>
                            <p className="text-base font-extrabold text-[#004D3A]">#{res.rank || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">Status</p>
                            <Badge className={`h-5 text-[10px] font-bold ${isFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {isFailed ? "Failed" : "Passed"}
                            </Badge>
                          </div>
                        </div>

                        {/* Subject Table */}
                        <div className="overflow-x-auto border rounded-xl">
                          <table className="w-full text-[11px] text-center">
                            <thead>
                              <tr className="bg-slate-50 border-b">
                                <th className="text-left py-2 px-3 text-slate-500 font-bold">Subject</th>
                                <th className="py-2 px-3 text-slate-500 font-bold">Full Marks</th>
                                <th className="py-2 px-3 text-slate-500 font-bold">Pass Marks</th>
                                <th className="py-2 px-3 text-slate-500 font-bold">Obtained Marks</th>
                                <th className="py-2 px-3 text-slate-500 font-bold">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {activeMarks.map(sub => {
                                const isSubFailed = sub.obtained_marks < sub.pass_marks;
                                const { grade } = calcSubjectGradeAndGPA(sub.obtained_marks, sub.full_marks);
                                return (
                                  <tr key={sub.subject_id} className="hover:bg-slate-50/50">
                                    <td className="py-2 px-3 text-left font-semibold text-slate-700">{sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</td>
                                    <td className="py-2 px-3 text-slate-500">{sub.full_marks}</td>
                                    <td className="py-2 px-3 text-red-400">{sub.pass_marks}</td>
                                    <td className="py-2 px-3 font-bold" style={isSubFailed ? { color: "red" } : { color: "#004D3A" }}>{sub.obtained_marks}</td>
                                    <td className="py-2 px-3">
                                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                        {isSubFailed ? "F" : grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-4">
            <Card style={{ background: "rgba(255,255,255,0.97)" }}>
              <CardHeader className="px-5 py-4 pb-3 border-b">
                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                  📝 আমার আবেদনসমূহ (My Applications)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <ApplicationPortal
                  user={{ id: student.id, role: "student", name: student.full_name_en, full_name_en: student.full_name_en }}
                  applicant={{ id: student.id, name: student.full_name_en, type: "student", branch_id: student.branch_id }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}