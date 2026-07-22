import React, { useState, useMemo } from "react";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName } from "@/lib/academic";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Loader2, Award, Trophy } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

// Helper to convert grade/text to numeric percentage score for ranking
function parseQualityScore(score) {
  if (!score) return 0;
  const s = String(score).trim().toUpperCase();
  
  // Numeric checks
  const num = parseFloat(s);
  if (!isNaN(num)) {
    if (num <= 10) return num * 10; // Convert 1-10 scale to percentage
    return num; // Already percentage
  }

  // Grade mappings
  if (s.includes("A+")) return 95;
  if (s.includes("A-")) return 75;
  if (s === "A") return 85;
  if (s === "B") return 65;
  if (s === "C") return 50;
  if (s === "D") return 40;
  if (s === "F") return 0;

  // Text mappings
  if (s.includes("EXCELLENT") || s.includes("মুমতাজ")) return 95;
  if (s.includes("VERY GOOD") || s.includes("জায়্যিদ জিদ্দান")) return 85;
  if (s.includes("GOOD") || s.includes("জায়্যিদ")) return 75;
  if (s.includes("FAIR") || s.includes("মাকবুল")) return 60;
  if (s.includes("POOR") || s.includes("রাসিদ")) return 40;

  return 70; // Default average score for any entry
}

export default function DailyLessonTracker({ students, teachers, branches }) {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [timeRange, setTimeRange] = useState("today"); // "today", "7days", "1month", "3months"
  
  // Date calculation
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const startDate = useMemo(() => {
    if (timeRange === "today") return todayDate;
    if (timeRange === "7days") return format(subDays(new Date(), 7), "yyyy-MM-dd");
    if (timeRange === "1month") return format(subDays(new Date(), 30), "yyyy-MM-dd");
    if (timeRange === "3months") return format(subDays(new Date(), 90), "yyyy-MM-dd");
    return todayDate;
  }, [timeRange, todayDate]);

  // 1. Load all daily lessons in the selected time range
  const { data: lessonList = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ["admin-daily-lessons-tracker", startDate, todayDate],
    queryFn: async () => {
      // Fetch the full dataset for the period (listAll paginates in
      // MAX_SAFE_RECORDS-sized requests, so no single query is unbounded).
      return appClient.entities.DailyLesson.listAll({ sort: "-date" });
    },
  });

  // 2. Filter lessons to time range manually to avoid server-side filter limits
  const filteredLessons = useMemo(() => {
    return lessonList.filter((l) => l.date >= startDate && l.date <= todayDate);
  }, [lessonList, startDate, todayDate]);

  // 3. Extract unique departments and classes dynamically from branches
  const departmentsList = useMemo(() => {
    const depts = new Set();
    branches.forEach((b) => {
      if (b.academic_structure) {
        b.academic_structure.forEach((item) => {
          if (item.department) depts.add(item.department);
        });
      }
    });
    // Fallback if empty
    if (depts.size === 0) {
      return ["নূরানী", "নাজেরা", "হিফজ", "কিতাবখানা"];
    }
    return Array.from(depts);
  }, [branches]);

  const classesList = useMemo(() => {
    const classes = new Set();
    branches.forEach((b) => {
      if (b.academic_structure) {
        b.academic_structure.forEach((item) => {
          if (selectedDept === "all" || item.department === selectedDept) {
            const name = item.class_name?.en || item.class_name?.bn || "";
            if (name) classes.add(name);
          }
        });
      }
    });
    return Array.from(classes);
  }, [branches, selectedDept]);

  // 4. Filter teachers that are assigned to selected branch/class/dept
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesBranch = selectedBranch === "all" || String(t.branch_id) === String(selectedBranch);
      return matchesBranch && t.is_active !== false;
    });
  }, [teachers, selectedBranch]);

  // 5. Filter students belonging to selected criteria
  const targetStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesBranch = selectedBranch === "all" || String(s.branch_id) === String(selectedBranch);
      const matchesDept = selectedDept === "all" || s.session === selectedDept;
      const matchesClass = selectedClass === "all" || s.class_name === selectedClass;
      const matchesTeacher = selectedTeacher === "all" || String(s.assigned_teacher_id) === String(selectedTeacher);
      
      return matchesBranch && matchesDept && matchesClass && matchesTeacher && s.status === "active";
    });
  }, [students, selectedBranch, selectedDept, selectedClass, selectedTeacher]);

  // 6. Map of student_id -> lessons in current timeframe
  const studentLessonsMap = useMemo(() => {
    const map = {};
    filteredLessons.forEach((l) => {
      if (!map[String(l.student_id)]) {
        map[String(l.student_id)] = [];
      }
      map[String(l.student_id)].push(l);
    });
    return map;
  }, [filteredLessons]);

  // 7. Calculate Group Rankings based on performance
  // Group by Teacher within the same department/class, calculate average score
  const groupRankings = useMemo(() => {
    const teacherScores = {};
    
    // Initialize active teachers
    teachers.forEach((t) => {
      teacherScores[t.id] = {
        teacherName: t.full_name_en,
        totalScore: 0,
        count: 0,
        avg: 0,
      };
    });

    // Populate scores from lessons
    filteredLessons.forEach((l) => {
      const student = students.find((s) => s.id === l.student_id);
      if (student && student.assigned_teacher_id && student.session === selectedDept) {
        const scoreVal = parseQualityScore(l.quality_score);
        const tId = student.assigned_teacher_id;
        if (teacherScores[tId]) {
          teacherScores[tId].totalScore += scoreVal;
          teacherScores[tId].count++;
        }
      }
    });

    // Calculate averages and sort
    return Object.keys(teacherScores)
      .map((tId) => {
        const group = teacherScores[tId];
        group.avg = group.count > 0 ? Math.round(group.totalScore / group.count) : 0;
        return { teacherId: tId, ...group };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.avg - a.avg);
  }, [filteredLessons, teachers, students, selectedDept]);

  // Find rank of currently selected teacher
  const currentTeacherRank = useMemo(() => {
    if (selectedTeacher === "all") return null;
    const idx = groupRankings.findIndex((g) => String(g.teacherId) === String(selectedTeacher));
    return idx !== -1 ? idx + 1 : null;
  }, [groupRankings, selectedTeacher]);

  // 8. Download Report
  const downloadReport = () => {
    try {
      const headers = ["Roll", "Name", "Class", "Date", "Lesson Type / Topic", "Pages Covered", "Quality Rating", "Teacher Notes"];
      const rows = [];

      targetStudents.forEach((s) => {
        const lessons = studentLessonsMap[String(s.id)] || [];
        if (lessons.length === 0) {
          rows.push([s.roll_number || "", `"${s.full_name_en}"`, `"${s.class_name || s.batch}"`, "N/A", "No entry today", "0", "N/A", ""]);
        } else {
          lessons.forEach((l) => {
            rows.push([
              s.roll_number || "",
              `"${s.full_name_en}"`,
              `"${s.class_name || s.batch}"`,
              l.date,
              `"${l.lesson_content || l.memorization || ""}"`,
              l.pages_covered || 0,
              l.quality_score || "N/A",
              `"${l.teacher_notes || ""}"`,
            ]);
          });
        }
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Daily_Lessons_Report_${timeRange}_${startDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error("Failed to export report: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Daily Lesson & Syllabus Tracker
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track reading progression, memorization records, and teacher group performance ranks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 h-10 rounded-xl"><SelectValue placeholder="Timeframe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="1month">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={downloadReport} variant="glass" className="gap-2 text-sm btn-hover-lift h-10 rounded-xl">
            <Download className="h-4 w-4" /> Download Group Data
          </Button>
        </div>
      </div>

      {/* Filter Selection Panel */}
      <Card className="border-gray-150 rounded-2xl shadow-sm bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Branch Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Branch</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full h-10 rounded-xl"><SelectValue placeholder="All Branches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Department (বিভাগ)</label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-full h-10 rounded-xl"><SelectValue placeholder="All Depts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsList.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full h-10 rounded-xl"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classesList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Teacher</label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full h-10 rounded-xl"><SelectValue placeholder="All Teachers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {filteredTeachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.full_name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Summary & Ranking Badge */}
      {selectedTeacher !== "all" && currentTeacherRank && (
        <Card className="border-[#D4AF37]/35 rounded-2xl bg-gradient-to-r from-amber-50/50 to-white shadow-sm p-4 border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Group Study Performance Rank</p>
              <p className="text-sm font-bold text-slate-800">
                Ranked <span className="text-amber-600 font-serif font-bold text-base">#{currentTeacherRank}</span> in {selectedDept !== "all" ? selectedDept : "All"} Department
              </p>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-xs px-3 py-1">
            Group Avg: {groupRankings[currentTeacherRank - 1]?.avg}%
          </Badge>
        </Card>
      )}

      {/* Main Table view */}
      <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-5">
          <CardTitle className="text-sm font-bold text-[#052E2B]">
            Lesson Tracking Sheet ({targetStudents.length} Students)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLessons ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : targetStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No students matched the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Lesson Type / Page Covered</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Hifz Stats</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {targetStudents.map((s) => {
                    const lessons = studentLessonsMap[String(s.id)] || [];
                    const latest = lessons[0]; // Latest log in the selected period

                    const hifzDetails = latest?.hifz_details || {};
                    const statsCalc = hifzDetails.calculation_results || {};

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-500 text-xs font-mono">
                          #{s.roll_number || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800 text-[13px]">{s.full_name_en}</p>
                          {s.full_name_bn && (
                            <p className="text-[10px] text-gray-400 font-medium">{s.full_name_bn}</p>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-[200px] break-words whitespace-normal">
                          {(() => {
                            const bObj = branches.find(b => String(b.id) === String(s.branch_id));
                            const academicStructure = bObj?.academic_structure || [];
                            return resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, academicStructure, 'bn') || s.class_name || s.batch || "";
                          })()}
                        </td>
                        <td className="py-4 px-6">
                          {lessons.length === 0 ? (
                            <span className="text-xs text-red-500 italic">No entry today</span>
                          ) : (
                            <div className="space-y-1.5">
                              {lessons.slice(0, 2).map((l, i) => (
                                <div key={l.id} className="text-xs">
                                  <Badge variant="secondary" className="mr-1 bg-emerald-50 text-emerald-800 font-bold border-none text-[9px] py-0 px-1">
                                    {l.date}
                                  </Badge>
                                  <span className="font-medium text-slate-700">{l.lesson_content || l.memorization}</span>
                                  {l.pages_covered > 0 && (
                                    <span className="text-gray-400 ml-1">({l.pages_covered} pgs)</span>
                                  )}
                                </div>
                              ))}
                              {lessons.length > 2 && (
                                <p className="text-[10px] text-emerald-600 font-semibold">+{lessons.length - 2} more logs</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {latest ? (
                            <Badge variant="outline" className={`font-bold rounded-lg px-2.5 py-0.5 text-[10px] border ${
                              latest.quality_score?.includes("Excellent") || latest.quality_score?.includes("A")
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : latest.quality_score?.includes("Good") || latest.quality_score?.includes("B")
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                              {latest.quality_score || "N/A"}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {hifzDetails && statsCalc.total_para_completed !== undefined ? (
                            <div className="text-[10px] text-gray-500 space-y-0.5">
                              <p>Sabaq Pages: <span className="font-bold text-slate-800">{statsCalc.total_sabaq_pages || 0}</span></p>
                              <p>Revision Pages: <span className="font-bold text-slate-800">{statsCalc.total_sat_sabaq_pages || 0}</span></p>
                              <p>Mistakes (Lokma): <span className="font-bold text-red-600">{statsCalc.total_mistakes || 0}</span></p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A (Non-Hifz)</span>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate text-xs text-gray-500 font-medium">
                          {latest?.teacher_notes || hifzDetails.custom_note || "-"}
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
      
      {/* Teacher/Group Rankings Leaderboard (Overview for the department) */}
      <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white mt-8">
        <CardHeader className="border-b border-gray-50 p-5 bg-gray-50/50">
          <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-amber-500" />
            Teacher Group Performance Leaderboard ({selectedDept !== "all" ? selectedDept : "All"} Dept)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {groupRankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">No active study logs in this timeframe.</div>
          ) : (
            <div className="divide-y divide-gray-150">
              {groupRankings.map((g, idx) => (
                <div key={g.teacherId} className="flex items-center justify-between p-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs font-serif ${
                      idx === 0 ? "bg-amber-100 text-amber-800" : idx === 1 ? "bg-slate-100 text-slate-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px]">{g.teacherName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{g.count} daily lessons recorded</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 font-bold border-none text-[11px] px-2 py-0.5">
                    Score: {g.avg}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
