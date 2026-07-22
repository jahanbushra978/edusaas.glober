"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, User, Phone, MapPin, Briefcase, Award, 
  Hash, Users as UsersIcon, Loader2, ShieldAlert,
  DollarSign, CalendarDays, Eye, Fingerprint, Monitor
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const TeacherPDFButton = dynamic(() => import("@/components/ui-custom/TeacherPDFButton"), { ssr: false });

export default function TeacherProfile() {
  const [authState, setAuthState] = useState({ loading: true, allowed: false, role: null, userId: null });
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setTeacherId(urlParams.get("id"));
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    
    appClient.auth.me().then((user) => {
      const allowed = user.role === "admin" || 
                      user.role === "branch_admin" || 
                      (user.role === "teacher" && String(user.profileId) === String(teacherId));
      
      setAuthState({ 
        loading: false, 
        allowed, 
        role: user.role, 
        userId: user.id 
      });

      if (!allowed) {
        appClient.auth.redirectToLogin(user.role === "teacher" ? "teacher" : "admin");
      }
    }).catch(() => {
      setAuthState({ loading: false, allowed: false, role: null, userId: null });
      appClient.auth.redirectToLogin("teacher");
    });
  }, [teacherId]);

  const { data: teacher, isLoading: loadingTeacher } = useQuery({
    queryKey: ["teacher-profile-detail", teacherId],
    queryFn: () => appClient.entities.Teacher.get(teacherId),
    enabled: !!teacherId && authState.allowed,
  });

  const { data: rawStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["teacher-profile-students", teacher?.id, teacher?.teacher_id],
    queryFn: async () => {
      const res = await fetch("/api/teacher/students");
      const json = await res.json().catch(() => ({}));
      if (json.ok && Array.isArray(json.students) && json.students.length > 0) {
        return json.students;
      }
      return appClient.entities.Student.listAll().catch(() => []);
    },
    enabled: authState.allowed,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["teacher-profile-branches"],
    queryFn: () => appClient.entities.Branch.list(),
    enabled: authState.allowed,
  });

  const { data: teacherPayments = [] } = useQuery({
    queryKey: ["teacher-payments", teacher?.teacher_id],
    queryFn: () => appClient.entities.TeacherPayment.filter({ teacher_id: teacher.teacher_id }),
    enabled: !!teacher && authState.allowed,
  });

  const { data: biometricProfile } = useQuery({
    queryKey: ["biometric-profile-teacher", teacherId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=biometric_profile&user_type=teacher&user_id=${teacherId}`);
      const d = await r.json();
      return d.ok ? d.data : null;
    },
    enabled: !!teacherId && authState.allowed,
  });

  const { data: biometricAttendance = [] } = useQuery({
    queryKey: ["biometric-attendance-teacher", teacherId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=report&user_type=teacher&user_id=${teacherId}&limit=20`);
      const d = await r.json();
      return d.ok ? d.data : [];
    },
    enabled: !!teacherId && authState.allowed && !!biometricProfile,
  });

  const salarySummary = useMemo(() => {
    const totalSalary = teacherPayments.reduce((s, p) => s + (Number(p.salary_amount) || 0), 0);
    const totalPaid = teacherPayments.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0);
    const totalDue = teacherPayments.reduce((s, p) => s + (Number(p.due_amount) || 0), 0);
    const lastPay = teacherPayments
      .filter(p => p.payment_date)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0];
    return { totalSalary, totalPaid, totalDue, lastPay };
  }, [teacherPayments]);

  const monthName = (m) => {
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return names[Number(m) - 1] || m;
  };

  const teacherBranch = useMemo(() => {
    if (!teacher || !branches.length) return "N/A";
    const bObj = branches.find(b => String(b.id) === String(teacher.branch_id));
    return bObj ? (bObj.name_bn || bObj.name_en || bObj.branch_name) : teacher.branch || "N/A";
  }, [teacher, branches]);

  const assignedStudents = useMemo(() => {
    if (!teacher || !rawStudents.length) return [];
    
    // De-duplicate students list
    const uniqueStudents = Array.from(new Map(rawStudents.map((s) => [String(s.id), s])).values());
    
    const teacherBatches = teacher.assigned_batches
      ? teacher.assigned_batches.split(",").map(b => b.trim().toLowerCase())
      : [];

    return uniqueStudents.filter((s) => {
      const studentTeacherId = s.assigned_teacher_id !== null && s.assigned_teacher_id !== undefined ? String(s.assigned_teacher_id) : "";
      
      const matchesTeacherId = 
        (teacher.id && studentTeacherId === String(teacher.id)) || 
        (teacher.teacher_id && studentTeacherId.toLowerCase() === String(teacher.teacher_id).toLowerCase());

      const studentBatch = (s.batch || "").toLowerCase();
      const studentDept = (s.department || "").toLowerCase();

      const matchesBatch = 
        teacherBatches.includes("all classes") || 
        teacherBatches.some(tb => tb && (studentBatch.includes(tb) || studentDept.includes(tb)));

      const isActive = !s.status || s.status.toLowerCase() === "active";

      return (matchesTeacherId || matchesBatch) && isActive;
    });
  }, [teacher, rawStudents]);

  if (authState.loading || loadingTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" />
      </div>
    );
  }

  if (!authState.allowed || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-center px-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Denied</h2>
        <p className="text-slate-500 max-w-sm mb-4">You do not have permission to view this teacher profile.</p>
        <Link href="/">
          <Button>Go back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/40 relative">
      {/* Decorative header banner */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-[#052E2B] via-[#0b4d47] to-[#12715B] -z-10" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href={authState.role === "teacher" ? createPageUrl("TeacherDashboard") : createPageUrl("AdminDashboard")}
          onClick={(e) => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              e.preventDefault();
              window.history.back();
            }
          }}
        >
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-5 gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        {/* Profile Card Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/20" style={{ background: "rgba(255,255,255,0.15)" }}>
            {teacher.photo_url || teacher.image_url ? (
              <img src={teacher.photo_url || teacher.image_url} loading="lazy" alt={teacher.full_name_en} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
                {teacher.full_name_en?.[0] || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{teacher.full_name_en}</h1>
            {teacher.full_name_bn && (
              <p className="text-sm text-white/80 font-medium font-sans mt-0.5">{teacher.full_name_bn}</p>
            )}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <Badge className="bg-amber-400/30 text-amber-900 hover:bg-amber-400/40 border-none font-mono text-xs font-bold" style={{ backgroundColor: "#FBC02D20", color: "#3d2b00" }}>
                #{teacher.teacher_id}
              </Badge>
              <Badge className="bg-amber-400/30 text-amber-900 hover:bg-amber-400/40 border-none text-xs font-bold" style={{ backgroundColor: "#FBC02D20", color: "#3d2b00" }}>
                {teacher.designation || "Teacher"}
              </Badge>
              <Badge className={teacher.status === "active" ? "bg-amber-400/30 text-amber-900 hover:bg-amber-400/40 border-none text-xs font-bold" : "bg-red-500/30 text-red-200 hover:bg-red-500/30 border-none text-xs font-bold"} style={teacher.status === "active" ? { backgroundColor: "#FBC02D20", color: "#3d2b00" } : {}}>
                {teacher.status?.toUpperCase() || "ACTIVE"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2.5 self-stretch sm:self-center">
            <TeacherPDFButton teacher={teacher} assignedStudents={assignedStudents} />
          </div>
        </div>

        {/* Dynamic Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-2xl h-auto sm:h-12 bg-white dark:bg-slate-800 p-1 border shadow-sm max-w-lg">
            <TabsTrigger value="profile" className="rounded-xl h-10 font-bold text-[10px] sm:text-sm">Profile</TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl h-10 font-bold text-[10px] sm:text-sm">Students</TabsTrigger>
            <TabsTrigger value="salary" className="rounded-xl h-10 font-bold text-[10px] sm:text-sm">Salary</TabsTrigger>
            <TabsTrigger value="biometric" className="rounded-xl h-10 font-bold text-[10px] sm:text-sm">Biometric</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact details */}
            <div className="md:col-span-1 space-y-6">
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Phone className="h-4.5 w-4.5 text-primary" /> Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Hash className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee Code</p>
                      <p className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">{teacher.employee_code || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans">{teacher.phone || "—"}</p>
                    </div>
                  </div>
                  {teacher.alt_phone && (
                    <div className="flex gap-3">
                      <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alternative Mobile</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans">{teacher.alt_phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <User className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans break-all">{teacher.user_email || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <MapPin className="h-4.5 w-4.5 text-primary" /> Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present Address</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.present_address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Permanent Address</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.permanent_address || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Detail Columns */}
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Academic & Professional Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branch</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacherBranch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joining Date</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">
                      {teacher.joining_date ? format(new Date(teacher.joining_date), "dd MMMM yyyy") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Classes / Batches</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.assigned_batches || "None"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qualification</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.qualification || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience Years</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.experience_years ? `${teacher.experience_years} Years` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subjects Taught</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.subjects || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">National ID (NID)</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 font-sans">{teacher.nid_number || "—"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bio details */}
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Biography / Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teacher.bio && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bio (English)</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1.5 font-sans leading-relaxed">{teacher.bio}</p>
                    </div>
                  )}
                  {teacher.bio_bn && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">পরিচিতি (বাংলা)</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{teacher.bio_bn}</p>
                    </div>
                  )}
                  {!teacher.bio && !teacher.bio_bn && (
                    <p className="text-sm text-slate-400 italic">No biography remarks added.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <UsersIcon className="h-5 w-5 text-primary" /> Assigned Students list
                </CardTitle>
                <Badge className="bg-[#052E2B] text-white hover:bg-[#052E2B]/90 font-bold">{assignedStudents.length} Students</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {loadingStudents ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : assignedStudents.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm font-sans">
                    No students currently assigned to this teacher.
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-2 sm:px-4">Student Info</th>
                          <th className="py-3 px-2 sm:px-4">Roll</th>
                          <th className="py-3 px-2 sm:px-4 hidden sm:table-cell">Batch</th>
                          <th className="py-3 px-2 sm:px-4 hidden sm:table-cell">Section</th>
                          <th className="py-3 px-2 sm:px-4">Status</th>
                          <th className="py-3 px-2 sm:px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedStudents.map((student) => (
                          <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#052E2B]/10 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-800 dark:text-slate-100 text-xs">
                                  {student.photo_url ? (
                                    <img src={student.photo_url} loading="lazy" alt={student.full_name_en} className="h-full w-full object-cover" />
                                  ) : (
                                    student.full_name_en?.[0] || "?"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{student.full_name_bn || student.full_name_en}</p>
                                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">ID: {student.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
                              {student.roll_number || "—"}
                            </td>
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                              {student.batch || "—"}
                            </td>
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                              {student.section || "Boys"}
                            </td>
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4">
                              <Badge className={student.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[9px] sm:text-[10px]" : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200 text-[9px] sm:text-[10px]"}>
                                {student.status?.toUpperCase() || "ACTIVE"}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-right">
                              <Link href={`${createPageUrl("StudentProfile")}?id=${student.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-all"><Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                              </Link>
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

          {/* Biometric Tab */}
          <TabsContent value="biometric">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Fingerprint className="h-4.5 w-4.5 text-indigo-600" /> Biometric Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {!biometricProfile ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No biometric data configured.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-xs text-muted-foreground">Machine User ID</span>
                          <span className="text-sm font-mono font-semibold">{biometricProfile.machine_user_id}</span>
                        </div>
                        {biometricProfile.card_number && (
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-xs text-muted-foreground">Card Number</span>
                            <span className="text-sm font-mono">{biometricProfile.card_number}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-xs text-muted-foreground">Fingerprint</span>
                          <Badge variant={biometricProfile.fingerprint_enabled ? "default" : "secondary"}>{biometricProfile.fingerprint_enabled ? "Enabled" : "Disabled"}</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-xs text-muted-foreground">Face</span>
                          <Badge variant={biometricProfile.face_enabled ? "default" : "secondary"}>{biometricProfile.face_enabled ? "Enabled" : "Disabled"}</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge variant={biometricProfile.enable_biometric ? "default" : "secondary"}>{biometricProfile.enable_biometric ? "Active" : "Inactive"}</Badge>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-xs text-muted-foreground">Last Sync</span>
                          <span className="text-xs">{biometricProfile.updated_at ? format(new Date(biometricProfile.updated_at), "dd MMM yyyy HH:mm") : "N/A"}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Monthly Attendance Summary Card */}
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Monitor className="h-4.5 w-4.5 text-emerald-600" /> Attendance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {biometricAttendance.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No records yet.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                            <p className="text-lg font-bold text-emerald-700">{biometricAttendance.filter(r => r.status === "present").length}</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Present</p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-2.5 text-center border border-red-100">
                            <p className="text-lg font-bold text-red-600">{biometricAttendance.filter(r => r.status === "absent").length}</p>
                            <p className="text-[10px] text-red-600 font-medium">Absent</p>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
                            <p className="text-lg font-bold text-amber-600">{biometricAttendance.filter(r => r.status === "late").length}</p>
                            <p className="text-[10px] text-amber-600 font-medium">Late</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                            <p className="text-lg font-bold text-blue-700">
                              {biometricAttendance.length > 0
                                ? Math.round(biometricAttendance.filter(r => r.status === "present" || r.status === "late").length / biometricAttendance.length * 100)
                                : 0}%
                            </p>
                            <p className="text-[10px] text-blue-600 font-medium">Rate</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-1 pt-1 border-t">
                          <div className="flex justify-between">
                            <span>Total Work Hours</span>
                            <span className="font-semibold">{biometricAttendance.reduce((s, r) => s + (r.working_hours || 0), 0).toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Late</span>
                            <span className="font-semibold text-amber-600">{biometricAttendance.reduce((s, r) => s + (r.late_minutes || 0), 0)}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg. Daily Hours</span>
                            <span className="font-semibold">
                              {biometricAttendance.length > 0
                                ? (biometricAttendance.reduce((s, r) => s + (r.working_hours || 0), 0) / biometricAttendance.length).toFixed(1)
                                : 0}h
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Monitor className="h-5 w-5 text-amber-600" /> Biometric Attendance History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {biometricAttendance.length === 0 ? (
                      <div className="py-16 text-center text-muted-foreground text-sm">No biometric attendance records.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b bg-slate-50/50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              <th className="py-3 px-2 sm:px-4">Date</th>
                              <th className="py-3 px-2 sm:px-4">Check In</th>
                              <th className="py-3 px-2 sm:px-4 hidden sm:table-cell">Check Out</th>
                              <th className="py-3 px-2 sm:px-4">Status</th>
                              <th className="py-3 px-2 sm:px-4">Late</th>
                              <th className="py-3 px-2 sm:px-4 text-right">Hours</th>
                            </tr>
                          </thead>
                          <tbody>
                            {biometricAttendance.map((r) => (
                              <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50/40 transition-colors">
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-semibold">{r.attendance_date ? format(new Date(r.attendance_date), "dd MMM yyyy") : "—"}</td>
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">{r.punch_in ? new Date(r.punch_in).toLocaleTimeString() : "—"}</td>
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">{r.punch_out ? new Date(r.punch_out).toLocaleTimeString() : "—"}</td>
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4">
                                  <Badge className={`text-[9px] sm:text-[10px] ${r.status === "present" ? "bg-emerald-50 text-emerald-700" : r.status === "late" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm">{r.late_minutes ? `${r.late_minutes}m` : "—"}</td>
                                <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-right text-xs sm:text-sm">{r.working_hours || 0}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Salary Summary Card */}
              <div className="lg:col-span-1">
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <DollarSign className="h-4.5 w-4.5 text-primary" /> Salary Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-xs text-muted-foreground font-medium">Total Salary</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">৳{salarySummary.totalSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-xs text-muted-foreground font-medium">Total Paid</span>
                      <span className="text-sm font-bold text-emerald-600">৳{salarySummary.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-xs text-muted-foreground font-medium">Total Due</span>
                      <span className="text-sm font-bold text-red-600">৳{salarySummary.totalDue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-muted-foreground font-medium">Last Payment</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {salarySummary.lastPay ? format(new Date(salarySummary.lastPay.payment_date), "dd MMM yyyy") : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History Table */}
              <div className="lg:col-span-2">
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <CalendarDays className="h-5 w-5 text-primary" /> Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {teacherPayments.length === 0 ? (
                      <div className="py-16 text-center text-muted-foreground text-sm font-sans">
                        No salary records found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              <th className="py-3 px-2 sm:px-4">Period</th>
                              <th className="py-3 px-2 sm:px-4">Salary</th>
                              <th className="py-3 px-2 sm:px-4">Paid</th>
                              <th className="py-3 px-2 sm:px-4">Due</th>
                              <th className="py-3 px-2 sm:px-4 hidden sm:table-cell">Date</th>
                              <th className="py-3 px-2 sm:px-4 hidden sm:table-cell">Method</th>
                              <th className="py-3 px-2 sm:px-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...teacherPayments]
                              .sort((a, b) => (b.year || 0) - (a.year || 0) || (b.month || 0) - (a.month || 0))
                              .map((p) => {
                                const paid = Number(p.paid_amount) || 0;
                                const salary = Number(p.salary_amount) || 0;
                                const due = Number(p.due_amount) || 0;
                                const status = paid >= salary && salary > 0 ? "Paid" : paid > 0 ? "Partial" : "Due";
                                return (
                                  <tr key={p.id || `${p.teacher_id}-${p.month}-${p.year}`} className="border-b last:border-0 hover:bg-slate-50/40 transition-colors">
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                      {monthName(p.month)} {p.year || ""}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                      ৳{salary.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-emerald-600">
                                      ৳{paid.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-red-600">
                                      ৳{due.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                                      {p.payment_date ? format(new Date(p.payment_date), "dd MMM yyyy") : "—"}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                                      {p.payment_method || "—"}
                                    </td>
                                    <td className="py-3 px-2 sm:py-3.5 sm:px-4 text-right">
                                      <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold ${
                                        status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        status === "Partial" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                        "bg-red-50 text-red-700 border-red-100"
                                      }`}>
                                        {status}
                                      </Badge>
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
