import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

// Helper to convert grade/text to numeric percentage score for ranking
function parseQualityScore(score) {
  if (!score) return 0;
  const s = String(score).trim().toUpperCase();
  
  const num = parseFloat(s);
  if (!isNaN(num)) {
    if (num <= 10) return num * 10;
    return num;
  }

  if (s.includes("A+")) return 95;
  if (s.includes("A-")) return 75;
  if (s === "A") return 85;
  if (s === "B") return 65;
  if (s === "C") return 50;
  if (s === "D") return 40;
  if (s === "F") return 0;

  if (s.includes("EXCELLENT") || s.includes("মুমতাজ")) return 95;
  if (s.includes("VERY GOOD") || s.includes("জায়্যিদ জিদ্দান")) return 85;
  if (s.includes("GOOD") || s.includes("জায়্যিদ")) return 75;
  if (s.includes("FAIR") || s.includes("মাকবুল")) return 60;
  if (s.includes("POOR") || s.includes("রাসিদ")) return 40;

  return 70;
}

export default function GroupPerformanceRanking({ lessons, students, teachers, selectedDept }) {
  // Calculate rankings based on average quality score of students
  const rankings = useMemo(() => {
    const teacherScores = {};

    // Initialize teachers
    teachers.forEach((t) => {
      teacherScores[t.id] = {
        teacherName: t.full_name_en,
        totalScore: 0,
        count: 0,
        avg: 0,
      };
    });

    // Accumulate scores
    lessons.forEach((l) => {
      const student = students.find((s) => s.id === l.student_id);
      if (student && student.assigned_teacher_id) {
        // Filter by department if specified
        if (!selectedDept || selectedDept === "all" || student.session === selectedDept) {
          const scoreVal = parseQualityScore(l.quality_score);
          const tId = student.assigned_teacher_id;
          if (teacherScores[tId]) {
            teacherScores[tId].totalScore += scoreVal;
            teacherScores[tId].count++;
          }
        }
      }
    });

    // Compute averages and sort
    return Object.keys(teacherScores)
      .map((tId) => {
        const group = teacherScores[tId];
        group.avg = group.count > 0 ? Math.round(group.totalScore / group.count) : 0;
        return { teacherId: tId, ...group };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.avg - a.avg);
  }, [lessons, students, teachers, selectedDept]);

  return (
    <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 p-5 bg-gray-50/50">
        <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-amber-500" />
          Group Performance Ranking ({selectedDept && selectedDept !== "all" ? selectedDept : "All"} Dept)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rankings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">No active study logs in this timeframe.</div>
        ) : (
          <div className="divide-y divide-gray-150">
            {rankings.map((g, idx) => (
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
  );
}
