import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function TeacherStudentDetail({ student, teacherName, onBack }) {
  const [lessonDate, setLessonDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [lessonForm, setLessonForm] = useState({
    subject: "", lesson_content: "", pages_covered: "", quality_score: "", memorization: "good", teacher_notes: "",
  });
  const queryClient = useQueryClient();

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["att-student", student.id, attendanceDate],
    queryFn: () => appClient.entities.Attendance.filter({ student_id: student.id, date: attendanceDate }),
  });

  const { data: recentLessons = [] } = useQuery({
    queryKey: ["lessons-student", student.id],
    queryFn: () => appClient.entities.DailyLesson.filter({ student_id: student.id }, "-date", 20),
  });

  const todayAttendance = existingAttendance[0];
  const [attendanceStatus, setAttendanceStatus] = useState(todayAttendance?.status || "present");

  React.useEffect(() => {
    setAttendanceStatus(todayAttendance?.status || "present");
  }, [todayAttendance]);

  const attendanceMut = useMutation({
    mutationFn: async () => {
      if (todayAttendance) {
        return appClient.entities.Attendance.update(todayAttendance.id, { status: attendanceStatus });
      } else {
        return appClient.entities.Attendance.create({
          student_id: student.id, date: attendanceDate, status: attendanceStatus, marked_by: teacherName,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["att-student", student.id] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance saved!");
    },
  });

  const lessonMut = useMutation({
    mutationFn: async () => {
      await appClient.entities.DailyLesson.create({
        student_id: student.id,
        date: lessonDate,
        subject: lessonForm.subject,
        lesson_content: lessonForm.lesson_content,
        pages_covered: lessonForm.pages_covered ? parseInt(lessonForm.pages_covered) : 0,
        quality_score: lessonForm.quality_score ? parseInt(lessonForm.quality_score) : null,
        memorization: lessonForm.memorization,
        teacher_notes: lessonForm.teacher_notes,
        recorded_by: teacherName,
      });
      if (lessonForm.pages_covered) {
        const newTotal = (student.total_pages_read || 0) + parseInt(lessonForm.pages_covered);
        await appClient.entities.Student.update(student.id, { total_pages_read: newTotal });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons-student", student.id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Lesson recorded!");
      setLessonForm({ subject: "", lesson_content: "", pages_covered: "", quality_score: "", memorization: "good", teacher_notes: "" });
    },
  });

  const statusColors = { present: "bg-green-100 text-green-800", absent: "bg-red-100 text-red-800", late: "bg-orange-100 text-orange-800", excused: "bg-blue-100 text-blue-800" };
  const memColors = { excellent: "bg-emerald-100 text-emerald-700", good: "bg-blue-100 text-blue-700", average: "bg-yellow-100 text-yellow-700", needs_improvement: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-5">
      {/* Back + Student Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <Card className="border-primary/15 overflow-hidden">
        <div className="h-2 islamic-gradient" />
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {student.photo_url ? (
              <img src={student.photo_url} loading="lazy" className="h-16 w-16 rounded-full border-2 gold-border object-cover" alt="" />
            ) : (
              <div className="h-16 w-16 rounded-full islamic-gradient flex items-center justify-center text-white text-2xl font-bold">
                {student.full_name_en?.[0]}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary">{student.full_name_en}</h2>
              {student.full_name_bn && <p className="text-sm font-bengali text-muted-foreground">{student.full_name_bn}</p>}
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-xs">#{student.roll_number}</Badge>
                <Badge variant="outline" className="text-xs">{student.class_name || student.batch}</Badge>
                {student.session && <Badge variant="outline" className="text-xs font-bengali">{student.session}</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{student.total_pages_read || 0}</p>
              <p className="text-xs text-muted-foreground">Total Pages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Section */}
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-primary mb-1 block">Date</label>
              <Input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {["present", "absent", "late", "excused"].map(s => (
                  <button
                    key={s}
                    onClick={() => setAttendanceStatus(s)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold capitalize transition-all ${attendanceStatus === s ? statusColors[s] + " border-current" : "border-slate-200 text-slate-500 hover:border-primary/30"}`}
                  >
                    {s === "present" && "✅ "}{s === "absent" && "❌ "}{s === "late" && "⏰ "}{s === "excused" && "📋 "}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {todayAttendance && (
              <p className="text-xs text-muted-foreground">Already marked: <Badge className={statusColors[todayAttendance.status]}>{todayAttendance.status}</Badge></p>
            )}
            <Button className="w-full" onClick={() => attendanceMut.mutate()} disabled={attendanceMut.isPending}>
              {attendanceMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              💾 Save Attendance
            </Button>
          </CardContent>
        </Card>

        {/* Daily Lesson Section */}
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Record Today's Sabak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => { e.preventDefault(); if (!lessonForm.subject || !lessonForm.lesson_content) { toast.error("Fill required fields"); return; } lessonMut.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary mb-1 block">Subject *</label>
                  <Select value={lessonForm.subject} onValueChange={v => setLessonForm(p => ({ ...p, subject: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["Quran", "Hadith", "Fiqh", "Arabic", "Tafsir", "Aqeedah", "Other"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary mb-1 block">Date</label>
                  <Input type="date" value={lessonDate} onChange={e => setLessonDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Lesson Content *</label>
                <Textarea placeholder="e.g., Surah Baqarah - Ayah 1-10" value={lessonForm.lesson_content} onChange={e => setLessonForm(p => ({ ...p, lesson_content: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary mb-1 block">Pages Covered</label>
                  <Input type="number" placeholder="0" value={lessonForm.pages_covered} onChange={e => setLessonForm(p => ({ ...p, pages_covered: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary mb-1 block">Quality (1–10)</label>
                  <Input type="number" min="1" max="10" placeholder="8" value={lessonForm.quality_score} onChange={e => setLessonForm(p => ({ ...p, quality_score: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Memorization</label>
                <Select value={lessonForm.memorization} onValueChange={v => setLessonForm(p => ({ ...p, memorization: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">⭐ Excellent</SelectItem>
                    <SelectItem value="good">✅ Good</SelectItem>
                    <SelectItem value="average">➖ Average</SelectItem>
                    <SelectItem value="needs_improvement">⚠️ Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Teacher Notes</label>
                <Textarea placeholder="Remarks, feedback..." value={lessonForm.teacher_notes} onChange={e => setLessonForm(p => ({ ...p, teacher_notes: e.target.value }))} rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={lessonMut.isPending}>
                {lessonMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                📝 Save Lesson
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lessons */}
      {recentLessons.length > 0 && (
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Recent Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentLessons.map(lesson => (
                <div key={lesson.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">{lesson.subject}</span>
                      <span className="text-xs text-muted-foreground">{lesson.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lesson.lesson_content}</p>
                    {lesson.teacher_notes && <p className="text-xs italic text-muted-foreground mt-1">📝 {lesson.teacher_notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    {lesson.quality_score && <Badge variant="outline" className="text-xs">{lesson.quality_score}/10</Badge>}
                    {lesson.memorization && <Badge className={`text-xs ${memColors[lesson.memorization] || ""}`}>{lesson.memorization.replace("_", " ")}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}