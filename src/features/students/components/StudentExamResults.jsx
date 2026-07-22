import React from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

const GRADE_COLORS = {
  "A+": { bg: "rgba(0,192,96,0.12)", text: "#00a060", border: "rgba(0,192,96,0.25)" },
  "A":  { bg: "rgba(77,166,255,0.12)", text: "#0080ff", border: "rgba(77,166,255,0.25)" },
  "B":  { bg: "rgba(212,175,55,0.12)", text: "#b8960a", border: "rgba(212,175,55,0.25)" },
  "C":  { bg: "rgba(255,136,0,0.12)", text: "#cc6600", border: "rgba(255,136,0,0.25)" },
  "D":  { bg: "rgba(255,100,0,0.12)", text: "#cc4400", border: "rgba(255,100,0,0.25)" },
  "F":  { bg: "rgba(255,50,50,0.12)", text: "#cc0000", border: "rgba(255,50,50,0.25)" },
};

function downloadResultCard(student, exam, result) {
  const grade = result.grade || "—";
  const gc = GRADE_COLORS[grade] || GRADE_COLORS["F"];
  const pct = exam.total_marks > 0 ? Math.round((result.obtained_marks / exam.total_marks) * 100) : 0;
  const isPassed = exam.pass_marks ? result.obtained_marks >= exam.pass_marks : pct >= 50;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,sans-serif; background:#f0f4f0; display:flex; justify-content:center; align-items:center; min-height:100vh; padding:20px; }
  .card { width:480px; background:white; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.15); }
  .header { background:linear-gradient(135deg,#002818,#005235); padding:24px; text-align:center; }
  .badge { display:inline-block; padding:4px 16px; border-radius:20px; font-size:12px; font-weight:600; margin-top:8px; }
  .pass { background:rgba(0,200,100,0.2); color:#00c870; border:1px solid rgba(0,200,100,0.3); }
  .fail { background:rgba(255,50,50,0.2); color:#ff5050; border:1px solid rgba(255,50,50,0.3); }
  .body { padding:24px; }
  .student-row { display:flex; align-items:center; gap:14px; padding:16px; background:#f4faf6; border-radius:14px; margin-bottom:20px; border:1px solid #dceedd; }
  .avatar { width:56px; height:56px; border-radius:12px; background:linear-gradient(135deg,#004D3A,#006241); display:flex; align-items:center; justify-content:center; font-size:22px; color:white; font-weight:700; flex-shrink:0; overflow:hidden; }
  .avatar img { width:100%; height:100%; object-fit:cover; }
  .marks-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:16px; }
  .mark-box { background:#f8fafb; border-radius:12px; padding:14px; text-align:center; border:1px solid #e8ecf0; }
  .mark-val { font-size:24px; font-weight:700; }
  .mark-lbl { font-size:10px; color:#888; margin-top:3px; }
  .grade-box { border-radius:14px; padding:18px; text-align:center; margin-bottom:16px; }
  .grade-val { font-size:52px; font-weight:800; }
  .progress-bar { height:10px; background:#e8ecf0; border-radius:5px; overflow:hidden; margin-top:12px; }
  .progress-fill { height:100%; background:linear-gradient(90deg,#006241,#00b060); border-radius:5px; }
  .footer { background:#f4faf6; padding:14px 24px; border-top:1px solid #e0ecde; display:flex; justify-content:space-between; font-size:11px; color:#888; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <div style="font-size:14px;font-weight:700;color:white;letter-spacing:1px;">RAHMANIA INSTITUTE</div>
    <div style="color:rgba(255,255,255,0.55);font-size:10px;margin-top:2px;letter-spacing:2px;">EXAM RESULT CARD</div>
    <div style="width:40px;height:2px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);margin:8px auto;"></div>
    <div style="color:rgba(255,255,255,0.85);font-size:13px;">${exam.title}</div>
    ${exam.exam_date ? `<div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:3px;">${exam.exam_date}</div>` : ""}
    <div class="badge ${isPassed ? 'pass' : 'fail'}">${isPassed ? "✅ Passed" : "❌ Failed"}</div>
  </div>
  <div class="body">
    <div class="student-row">
      <div class="avatar">${student.photo_url ? `<img src="${student.photo_url}" loading="lazy" alt="${student.full_name_en || "Student"}"/>` : (student.full_name_en?.[0] || "?")}</div>
      <div>
        <div style="font-size:16px;font-weight:700;color:#002818;">${student.full_name_en}</div>
        <div style="font-size:12px;color:#667;margin-top:2px;">Roll: ${student.roll_number}</div>
        <div style="font-size:11px;color:#006241;margin-top:3px;font-weight:600;">📚 ${student.session || exam.session || ""}</div>
      </div>
    </div>
    <div class="marks-grid">
      <div class="mark-box"><div class="mark-val" style="color:#006241;">${result.obtained_marks}</div><div class="mark-lbl">Obtained</div></div>
      <div class="mark-box"><div class="mark-val" style="color:#333;">${exam.total_marks}</div><div class="mark-lbl">Total</div></div>
      <div class="mark-box"><div class="mark-val" style="color:#0066cc;">${pct}%</div><div class="mark-lbl">Percentage</div></div>
    </div>
    <div class="grade-box" style="background:${gc.bg};border:1px solid ${gc.border};">
      <div class="grade-val" style="color:${gc.text};">${grade}</div>
      ${result.rank ? `<div style="font-size:12px;color:${gc.text};margin-top:6px;font-weight:600;">Rank: ${result.rank}</div>` : ""}
    </div>
    <div style="font-size:12px;color:#666;display:flex;justify-content:space-between;margin-bottom:4px;"><span>Achievement</span><span>${pct}%</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>
    ${result.remarks ? `<div style="margin-top:14px;padding:10px 14px;background:#f0f7f0;border-radius:10px;font-size:12px;color:#446;border-left:3px solid #006241;">💬 ${result.remarks}</div>` : ""}
  </div>
  <div class="footer">
    <span>Date: ${format(new Date(), "dd/MM/yyyy")}</span>
    <span style="color:#006241;font-weight:600;">🔏 Rahmania Institute</span>
  </div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `result_${student.roll_number}_${exam.title.replace(/\s+/g, "_")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StudentExamResults({ student }) {
  const { data: allResults = [], isLoading: loadingResults } = useQuery({
    queryKey: ["student-exam-results", student.id],
    queryFn: () => appClient.entities.ExamResult.filter({ student_id: student.id }, "-created_date", 50),
  });

  const examIds = [...new Set(allResults.map(r => r.exam_id))];

  const { data: exams = [], isLoading: loadingExams } = useQuery({
    queryKey: ["student-exams", examIds.join(",")],
    queryFn: async () => {
      if (examIds.length === 0) return [];
      const all = await appClient.entities.Exam.list("-exam_date", 200);
      return all.filter(e => examIds.includes(e.id));
    },
    enabled: examIds.length > 0,
  });

  const isLoading = loadingResults || loadingExams;
  const examMap = Object.fromEntries(exams.map(e => [e.id, e]));

  if (isLoading) {
    return (
      <Card className="premium-card border-0">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (allResults.length === 0) {
    return (
      <Card className="premium-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">No exam results recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
          <Trophy className="h-4 w-4" /> Exam Results ({allResults.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allResults.map(result => {
          const exam = examMap[result.exam_id];
          if (!exam) return null;
          const gc = GRADE_COLORS[result.grade] || GRADE_COLORS["F"];
          const pct = exam.total_marks > 0 ? Math.round((result.obtained_marks / exam.total_marks) * 100) : 0;
          const isPassed = exam.pass_marks ? result.obtained_marks >= exam.pass_marks : pct >= 50;

          return (
            <div key={result.id} className="rounded-xl p-3 border" style={{ background: "rgba(0,98,65,0.03)", borderColor: "rgba(0,98,65,0.10)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">{exam.exam_date || ""} • {exam.session}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xl font-extrabold" style={{ color: gc.text }}>{result.grade}</span>
                  <Badge className={isPassed ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                    {isPassed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span>Marks: <strong className="text-primary">{result.obtained_marks}</strong> / {exam.total_marks}</span>
                <span>Score: <strong>{pct}%</strong></span>
                {result.rank && <span>Rank: <strong>#{result.rank}</strong></span>}
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg,#006241,${gc.text})` }} />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 mt-1"
                onClick={() => downloadResultCard(student, exam, result)}
              >
                <Download className="h-3 w-3" /> Download Result Card
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
