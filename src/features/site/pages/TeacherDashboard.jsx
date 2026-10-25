import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, BookOpen, TrendingUp, Award, AlertCircle, Loader2, ChevronRight, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { SHOW_READING_PROGRESS } from "@/config/features";
import Link from "next/link";

const AttendanceMarker = dynamic(() => import("@/components/teacher/AttendanceMarker"), { ssr: false });
const DailyLessonEntry = dynamic(() => import("@/components/teacher/DailyLessonEntry"), { ssr: false });
const TeacherStudentDetail = dynamic(() => import("@/components/teacher/TeacherStudentDetail"), { ssr: false });
const TeacherAIReviewHub = dynamic(() => import("@/features/teachers/components/TeacherAIReviewHub"), { ssr: false });

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await appClient.auth.me();
        if (currentUser.role !== "teacher") {
          appClient.auth.redirectToLogin("teacher");
          return;
        }
        setUser(currentUser);

        let teacherProfile = null;
        if (currentUser.profileId) {
          teacherProfile = await appClient.entities.Teacher.get(currentUser.profileId).catch(() => null);
        }
        if (!teacherProfile && (currentUser.loginId || currentUser.username)) {
          const targetId = currentUser.loginId || currentUser.username;
          const list = await appClient.entities.Teacher.filter({ teacher_id: targetId }).catch(() => []);
          if (list && list.length > 0) teacherProfile = list[0];
        }
        if (!teacherProfile) {
          // Fallback dummy profile so queries can complete
          teacherProfile = { id: currentUser.profileId || 1, teacher_id: currentUser.loginId || "" };
        }
        setTeacher(teacherProfile);
      } catch {
        appClient.auth.redirectToLogin("teacher");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: allStudents = [] } = useQuery({
    queryKey: ["teacher-students", user?.loginId || teacher?.id],
    queryFn: async () => {
      const res = await fetch("/api/teacher/students");
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to fetch students");
      return (json.students || []).map((s) => ({ id: s.id, ...s }));
    },
    enabled: !!user,
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => appClient.entities.Attendance.list("-date", 1000),
    enabled: !!teacher,
  });

  const { data: dailyLessons = [] } = useQuery({
    queryKey: ["daily-lessons"],
    queryFn: () => appClient.entities.DailyLesson.list("-date", 1000),
    enabled: !!teacher,
  });

  const assignedBatches = useMemo(() => {
    return teacher?.assigned_batches?.split(",").map((b) => b.trim()) || [];
  }, [teacher?.assigned_batches]);

  const myStudents = useMemo(() => {
    if (!teacher) return [];
    const unique = Array.from(new Map(allStudents.map((s) => [String(s.id), s])).values());
    const teacherBatches = assignedBatches.map(b => b.toLowerCase()).filter(Boolean);
    return unique.filter((s) => {
      const studentTeacherId = s.assigned_teacher_id !== null && s.assigned_teacher_id !== undefined ? String(s.assigned_teacher_id) : "";
      const matchesTeacherId = studentTeacherId !== "" && (
        studentTeacherId === String(teacher.id) || 
        (teacher.teacher_id && studentTeacherId === String(teacher.teacher_id))
      );

      const studentBatch = s.batch ? s.batch.toLowerCase() : "";
      const studentDept = s.department ? s.department.toLowerCase() : "";

      const matchesBatch = teacherBatches.length > 0 && (
        teacherBatches.includes("all classes") || 
        teacherBatches.some(tb => tb && (studentBatch.includes(tb) || studentDept.includes(tb)))
      );

      const isActive = !s.status || s.status.toLowerCase() === "active";

      return (matchesTeacherId || matchesBatch) && isActive;
    });
  }, [teacher, allStudents, assignedBatches]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Teacher Profile Found</h2>
            <p className="text-muted-foreground mb-4">
              Your account is not linked to a teacher profile. Please contact the administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayAttendance = attendanceRecords.filter(a => a.date === today);
  const todayPresentCount = todayAttendance.filter(a => a.status === "present").length;
  const attendancePercentage = myStudents.length > 0 ? Math.round((todayPresentCount / myStudents.length) * 100) : 0;

  const thisWeekLessons = dailyLessons.filter(l => {
    const lessonDate = new Date(l.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lessonDate >= weekAgo;
  });

  const avgQuality = thisWeekLessons.length > 0
    ? (thisWeekLessons.reduce((sum, l) => sum + (l.quality_score || 0), 0) / thisWeekLessons.length).toFixed(1)
    : 0;

  const topPerformers = myStudents
    .map(s => ({
      ...s,
      recentAvg: dailyLessons
        .filter(l => l.student_id === s.id)
        .slice(0, 10)
        .reduce((sum, l, _, arr) => sum + (l.quality_score || 0) / arr.length, 0)
    }))
    .sort((a, b) => b.recentAvg - a.recentAvg)
    .slice(0, 5);

  if (selectedStudent) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <TeacherStudentDetail
            student={selectedStudent}
            teacherName={teacher.full_name_en}
            onBack={() => setSelectedStudent(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4 border-b pb-4">
          <div className="flex items-center gap-4">
            {teacher.photo_url && (
              <img src={teacher.photo_url} loading="lazy" alt={teacher.full_name_en} className="h-16 w-16 rounded-full border-2 gold-border object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold italic text-primary">
                {teacher.full_name_en}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Teacher ID: {teacher.teacher_id} • {teacher.subjects || "All Subjects"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Assigned Batches: <span className="font-semibold text-slate-700 dark:text-slate-200">{teacher.assigned_batches || "None"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs h-9 px-4 shadow-sm"
            >
              <BookOpen className="h-4 w-4" /> নূর AI শিক্ষক
            </Button>
            <Link href={`${createPageUrl("TeacherProfile")}?id=${teacher.id}`}>
              <Button className="gap-2 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs h-9 px-4">
                <UserCog className="h-4 w-4" /> My Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className={`grid grid-cols-1 ${SHOW_READING_PROGRESS ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4 mb-6`}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Students</p>
                  <p className="text-3xl font-bold text-primary">{myStudents.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Attendance</p>
                  <p className="text-3xl font-bold text-secondary">{attendancePercentage}%</p>
                </div>
                <Calendar className="h-8 w-8 text-secondary/30" />
              </div>
            </CardContent>
          </Card>

          {SHOW_READING_PROGRESS && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Lessons</p>
                      <p className="text-3xl font-bold text-primary">{thisWeekLessons.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary/30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Quality</p>
                      <p className="text-3xl font-bold gold-accent">{avgQuality}/10</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-secondary/30" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="flex flex-wrap sm:grid w-full h-auto p-1 gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200">
            <TabsTrigger value="attendance" className="flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl">📋 Attendance</TabsTrigger>
            {SHOW_READING_PROGRESS && <TabsTrigger value="lessons" className="flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl">📖 Daily Lessons</TabsTrigger>}
            <TabsTrigger value="ai-reviews" className="flex-1 min-w-[140px] py-2.5 text-xs sm:text-sm font-bold rounded-xl text-emerald-800 dark:text-emerald-300">🎙️ AI পরীক্ষা ও রিভিউ</TabsTrigger>
            <TabsTrigger value="students" className="flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl">👥 My Students</TabsTrigger>
            {SHOW_READING_PROGRESS && <TabsTrigger value="analytics" className="flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl">📊 Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="ai-reviews">
            <TeacherAIReviewHub students={myStudents} teacherName={teacher.full_name_en} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceMarker students={myStudents} teacherName={teacher.full_name_en} />
          </TabsContent>

          {SHOW_READING_PROGRESS && (
            <TabsContent value="lessons">
              <DailyLessonEntry students={myStudents} teacherName={teacher.full_name_en} />
            </TabsContent>
          )}

          <TabsContent value="students">
            <div className="space-y-3">
              {myStudents.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No students assigned yet.</CardContent></Card>
              ) : myStudents.map(student => {
                const studentLessons = dailyLessons.filter(l => l.student_id === student.id);
                const lastLesson = studentLessons[0];
                const todayAtt = attendanceRecords.find(a => a.student_id === student.id && a.date === format(new Date(), "yyyy-MM-dd"));
                return (
                  <Card 
                    key={student.id} 
                    className="border-primary/10 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" 
                    onClick={() => {
                      if (SHOW_READING_PROGRESS) {
                        setSelectedStudent(student);
                      } else {
                        window.location.href = `${createPageUrl("StudentProfile")}?id=${student.id}`;
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {student.photo_url ? (
                          <img src={student.photo_url} loading="lazy" className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover" alt="" />
                        ) : (
                          <div className="h-12 w-12 rounded-full islamic-gradient flex items-center justify-center text-white font-bold">
                            {student.full_name_en?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary">{student.full_name_en}</p>
                          {student.full_name_bn && <p className="text-xs font-bengali text-muted-foreground">{student.full_name_bn}</p>}
                          <p className="text-xs text-muted-foreground">#{student.roll_number} • {student.batch}</p>
                          {SHOW_READING_PROGRESS && lastLesson && <p className="text-xs text-muted-foreground mt-1">📖 Last: {lastLesson.subject} ({lastLesson.date})</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {SHOW_READING_PROGRESS && <span className="text-lg font-bold text-primary">{student.total_pages_read || 0} pg</span>}
                          {todayAtt && (
                            <Badge className={`text-xs ${todayAtt.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{todayAtt.status}</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {SHOW_READING_PROGRESS && (
            <TabsContent value="analytics">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 gold-accent" />
                      Top 5 Performers (Last 10 Lessons)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.map((student, idx) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full islamic-gradient flex items-center justify-center text-white font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{student.full_name_en}</p>
                              <p className="text-xs text-muted-foreground">Roll: {student.roll_number}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold gold-accent">{student.recentAvg.toFixed(1)}/10</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
