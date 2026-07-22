import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Users, BookOpen, ClipboardList, Loader2, User,
  Phone, CheckCircle, Circle, Save
} from "lucide-react";
import Logo from "@/components/home/Logo";
import { format } from "date-fns";

import { toast } from "sonner";

export default function TeacherPortalView({ teacher, instNameEn, onLogout }) {

  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lessonForm, setLessonForm] = useState({ subject: "", lesson_content: "", pages_covered: "", quality_score: "", memorization: "good", teacher_notes: "" });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["teacher-students", teacher.id],
    queryFn: () => appClient.entities.Student.filter({ assigned_teacher_id: teacher.id }),
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["teacher-attendance", teacher.id, selectedDate],
    queryFn: () => appClient.entities.Attendance.filter({ date: selectedDate }),
  });

  const attMap = {};
  attendance.forEach(a => { attMap[a.student_id] = a; });

  const markAttMut = useMutation({
    mutationFn: async ({ studentId, status }) => {
      const existing = attMap[studentId];
      if (existing) return appClient.entities.Attendance.update(existing.id, { status, marked_by: teacher.full_name_en });
      return appClient.entities.Attendance.create({ student_id: studentId, date: selectedDate, status, marked_by: teacher.full_name_en });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-attendance"] }),
  });

  const createLessonMut = useMutation({
    mutationFn: async (data) => {
      await appClient.entities.DailyLesson.create({ ...data, student_id: selectedStudent.id, date: selectedDate, recorded_by: teacher.full_name_en });
      if (data.pages_covered > 0) {
        await appClient.entities.Student.update(selectedStudent.id, {
          total_pages_read: (selectedStudent.total_pages_read || 0) + parseInt(data.pages_covered || 0)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      setLessonForm({ subject: "", lesson_content: "", pages_covered: "", quality_score: "", memorization: "good", teacher_notes: "" });
      toast.success("Lesson saved successfully!");
    },
  });

  const handleLessonSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !lessonForm.subject || !lessonForm.lesson_content) {
      toast.error("Student, subject and lesson content are required.");
      return;
    }
    createLessonMut.mutate(lessonForm);
  };

  const presentCount = students.filter(s => attMap[s.id]?.status === "present").length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#030c14 0%,#071520 30%,#030c14 100%)" }}>
      <svg className="fixed inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <defs><pattern id="tv" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#tv)"/>
      </svg>

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/10"
        style={{ background: "rgba(3,10,20,0.88)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5">
            <Logo className="w-full h-full rounded-xl object-contain" />
          </div>

          <div>
            <p className="text-xs font-bold italic text-white">{instNameEn}</p>
            <p className="text-xs italic" style={{ color: "rgba(212,175,55,0.70)" }}>Teacher Portal</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-white/50 hover:text-white gap-1.5 text-xs italic">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Teacher Profile */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#0a2040,#0d3060)" }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-yellow-400/30 bg-white/10 flex items-center justify-center flex-shrink-0">
              {teacher.photo_url ? <img src={teacher.photo_url} loading="lazy" className="w-full h-full object-cover" alt="" /> : <User className="h-6 w-6 text-white/60" />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold italic text-white">{teacher.full_name_en}</h2>
              <p className="text-white/60 text-xs italic">ID: {teacher.teacher_id}</p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full italic" style={{ background: "rgba(96,165,250,0.2)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}>
                  👨‍🏫 Teacher
                </span>
                {students.length > 0 && <Badge variant="outline" className="text-xs italic text-white/60 border-white/20">{students.length} Students</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{presentCount}</p>
              <p className="text-xs italic text-white/50">Present Today</p>
            </div>
          </div>
          {(teacher.phone || teacher.subjects) && (
            <div className="px-6 py-3 flex gap-6 text-xs italic text-muted-foreground flex-wrap">
              {teacher.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{teacher.phone}</span>}
              {teacher.subjects && <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" />{teacher.subjects}</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="attendance" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs gap-1 italic">
              <ClipboardList className="h-3.5 w-3.5" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="lesson" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs gap-1 italic">
              <BookOpen className="h-3.5 w-3.5" /> Lesson Entry
            </TabsTrigger>
            <TabsTrigger value="students" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs gap-1 italic">
              <Users className="h-3.5 w-3.5" /> My Students
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card style={{ background: "rgba(255,255,255,0.95)" }}>
              <CardHeader className="px-5 py-4 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-bold italic text-primary">📋 Mark Attendance</CardTitle>
                  <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40 h-8 text-xs" />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {studentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : students.length === 0 ? (
                  <p className="text-center italic text-muted-foreground text-sm py-6">No students assigned.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-end gap-2 mb-3">
                      <Button size="sm" variant="outline" className="text-xs gap-1 italic border-emerald-200 text-emerald-700"
                        onClick={() => students.forEach(s => markAttMut.mutate({ studentId: s.id, status: "present" }))}>
                        <CheckCircle className="h-3 w-3" /> All Present
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1 italic border-red-200 text-red-600"
                        onClick={() => students.forEach(s => markAttMut.mutate({ studentId: s.id, status: "absent" }))}>
                        <Circle className="h-3 w-3" /> All Absent
                      </Button>
                    </div>
                    {students.map(s => {
                      const att = attMap[s.id];
                      const status = att?.status || "unmarked";
                      const statusStyle = {
                        present: "bg-emerald-100 text-emerald-700 border-emerald-200",
                        absent: "bg-red-100 text-red-700 border-red-200",
                        late: "bg-orange-100 text-orange-700 border-orange-200",
                        excused: "bg-blue-100 text-blue-700 border-blue-200",
                        unmarked: "bg-slate-100 text-slate-500 border-slate-200",
                      };
                      return (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/80">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                            {s.full_name_en?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium italic truncate">{s.full_name_en}</p>
                            <p className="text-xs italic text-muted-foreground font-mono">#{s.roll_number}</p>
                          </div>
                          <div className="flex gap-1">
                            {["present", "absent", "late"].map(st => (
                              <button key={st} onClick={() => markAttMut.mutate({ studentId: s.id, status: st })}
                                className={`px-2 py-1 rounded-lg text-xs border italic transition-all ${status === st ? statusStyle[st] : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}>
                                {st === "present" ? "✅" : st === "absent" ? "❌" : "⏰"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lesson Entry Tab */}
          <TabsContent value="lesson">
            <Card style={{ background: "rgba(255,255,255,0.95)" }}>
              <CardHeader className="px-5 py-4 pb-3">
                <CardTitle className="text-sm font-bold italic text-primary">📝 Daily Lesson Entry</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <form onSubmit={handleLessonSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold italic text-primary mb-1.5 block">Student *</label>
                      <Select value={selectedStudent?.id || ""} onValueChange={id => setSelectedStudent(students.find(s => s.id === id))}>
                        <SelectTrigger className="h-10 text-xs italic"><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name_en}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold italic text-primary mb-1.5 block">Subject *</label>
                      <Input value={lessonForm.subject} onChange={e => setLessonForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Quran, Hadith" className="h-10 text-sm italic" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold italic text-primary mb-1.5 block">Lesson Content *</label>
                    <Input value={lessonForm.lesson_content} onChange={e => setLessonForm(p => ({ ...p, lesson_content: e.target.value }))} placeholder="What was taught..." className="h-10 text-sm italic" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold italic text-primary mb-1.5 block">Pages</label>
                      <Input type="number" min="0" value={lessonForm.pages_covered} onChange={e => setLessonForm(p => ({ ...p, pages_covered: e.target.value }))} placeholder="0" className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold italic text-primary mb-1.5 block">Score (1-10)</label>
                      <Input type="number" min="1" max="10" value={lessonForm.quality_score} onChange={e => setLessonForm(p => ({ ...p, quality_score: e.target.value }))} placeholder="1-10" className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold italic text-primary mb-1.5 block">Memorization</label>
                      <Select value={lessonForm.memorization} onValueChange={v => setLessonForm(p => ({ ...p, memorization: v }))}>
                        <SelectTrigger className="h-10 text-xs italic"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold italic text-primary mb-1.5 block">Teacher Notes</label>
                    <Textarea value={lessonForm.teacher_notes} onChange={e => setLessonForm(p => ({ ...p, teacher_notes: e.target.value }))} placeholder="Additional remarks..." rows={2} className="text-sm italic" />
                  </div>
                  <Button type="submit" disabled={createLessonMut.isPending} className="w-full h-10 font-bold italic text-white gap-2"
                    style={{ background: "linear-gradient(135deg,#0a2d6e,#1a52b0)" }}>
                    {createLessonMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Lesson
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card style={{ background: "rgba(255,255,255,0.95)" }}>
              <CardHeader className="px-5 py-4 pb-3">
                <CardTitle className="text-sm font-bold italic text-primary flex items-center gap-2">
                  <Users className="h-4 w-4" /> My Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {students.length === 0 ? (
                  <p className="text-center italic text-muted-foreground text-sm py-6">No students assigned.</p>
                ) : (
                  <div className="space-y-2.5">
                    {students.map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {s.photo_url ? <img src={s.photo_url} loading="lazy" className="w-full h-full object-cover" alt="" /> : <span className="text-sm font-bold text-primary">{s.full_name_en?.[0]}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold italic text-sm">{s.full_name_en}</p>
                          <p className="text-xs italic text-muted-foreground">#{s.roll_number} · {s.batch}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{s.total_pages_read || 0}</p>
                          <p className="text-xs italic text-muted-foreground">pages</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}