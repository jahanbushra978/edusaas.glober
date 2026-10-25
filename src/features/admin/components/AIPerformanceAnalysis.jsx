import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import {
  Bot, Loader2, RefreshCw, TrendingUp, Minus,
  AlertTriangle, Star, Target, ChevronDown, ChevronUp, ShieldAlert, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subMonths } from "date-fns";

function ScoreRing({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-slate-400 -mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const map = {
    high: { label: "উচ্চ ঝুঁকি", cls: "bg-red-100 text-red-700 border-red-200", icon: ShieldAlert },
    medium: { label: "মাঝারি ঝুঁকি", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
    low: { label: "স্বাভাবিক", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Minus },
    excellent: { label: "অসাধারণ", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Award },
  };
  const cfg = map[level] || map.low;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" /> {cfg.label}
    </span>
  );
}

export default function AIPerformanceAnalysis({ student, logs, attendance, fees }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [generated, setGenerated] = useState(false);

  const buildContext = () => {
    const now = new Date();
    // Last 3 months reading
    const last3months = Array.from({ length: 3 }, (_, i) => {
      const m = subMonths(now, i);
      const key = format(m, "yyyy-MM");
      const pages = logs.filter(l => l.date?.startsWith(key)).reduce((s, l) => s + (l.pages_read || 0), 0);
      return { month: key, pages };
    });

    const totalPages = student.total_pages_read || 0;
    const presentCount = attendance.filter(a => a.status === "present").length;
    const absentCount = attendance.filter(a => a.status === "absent").length;
    const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    const totalFee = fees.reduce((s, f) => s + (f.total_fee || 0), 0);
    const totalDue = fees.reduce((s, f) => s + (f.due_amount || 0), 0);
    const unpaidMonths = fees.filter(f => f.status === "due" || f.status === "partial").length;

    const recentSubjects = [...new Set(logs.slice(0, 15).map(l => l.subjects).filter(Boolean).join(",").split(",").map(s => s.trim()))].filter(Boolean);

    return {
      studentName: student.full_name_bn || student.full_name_en,
      batch: student.batch,
      session: student.session,
      status: student.status,
      totalPagesRead: totalPages,
      readingLast3Months: last3months,
      totalLogEntries: logs.length,
      recentSubjects: recentSubjects.slice(0, 10),
      attendanceTotal: attendance.length,
      presentCount,
      absentCount,
      attendancePct,
      totalFee,
      totalDue,
      unpaidFeeMonths: unpaidMonths,
    };
  };

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    const ctx = buildContext();

    const prompt = `
You are an expert Islamic academic counselor at Rahmania Institute (রহমানিয়া ইনস্টিটিউট), a Quran and Islamic studies institution in Bangladesh.

Analyze this student's holistic performance data and respond ONLY in Bengali (বাংলা):

Student Data:
- Name: ${ctx.studentName}
- Batch: ${ctx.batch || "N/A"} | Session: ${ctx.session || "N/A"} | Status: ${ctx.status}
- Total pages read (all time): ${ctx.totalPagesRead}
- Reading (last 3 months): ${ctx.readingLast3Months.map(m => `${m.month}: ${m.pages} pages`).join(", ")}
- Total log entries: ${ctx.totalLogEntries}
- Recent subjects: ${ctx.recentSubjects.join(", ") || "N/A"}
- Attendance: ${ctx.presentCount} present / ${ctx.attendanceTotal} total (${ctx.attendancePct}%)
- Absent days: ${ctx.absentCount}
- Total fee: ৳${ctx.totalFee} | Due: ৳${ctx.totalDue} | Unpaid months: ${ctx.unpaidFeeMonths}

Provide a comprehensive performance analysis with:

1. "overall_score": A holistic performance score out of 100 (number). Weight reading consistency 40%, attendance 35%, fee regularity 25%.

2. "score_breakdown": Object with:
   - "reading_score": number out of 40
   - "attendance_score": number out of 35
   - "fee_score": number out of 25

3. "risk_level": One of: "excellent", "low", "medium", "high" — based on overall performance

4. "performance_summary": 2-3 sentence summary of the student's overall performance in Bengali.

5. "strengths": Array of 2-3 specific strengths (short phrases in Bengali)

6. "risk_areas": Array of 2-3 identified risk or concern areas (short phrases in Bengali). If none, return ["কোনো উল্লেখযোগ্য ঝুঁকি নেই"]

7. "recommended_programs": Array of 2-3 tailored program/support recommendations, each with:
   - "title": Program name in Bengali
   - "description": 1-2 sentence description in Bengali
   - "type": One of: "support", "enrichment", "intervention"

8. "next_steps": Array of 3 concrete, actionable next steps for the teacher/admin in Bengali.

9. "motivational_note": A personalized encouraging message for the student (2 sentences) with an Islamic reference, in Bengali.

Be specific, data-driven, and compassionate. Consider the Islamic academic context.
`;

    try {
      const result = await appClient.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            score_breakdown: {
              type: "object",
              properties: {
                reading_score: { type: "number" },
                attendance_score: { type: "number" },
                fee_score: { type: "number" },
              }
            },
            risk_level: { type: "string" },
            performance_summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            risk_areas: { type: "array", items: { type: "string" } },
            recommended_programs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                }
              }
            },
            next_steps: { type: "array", items: { type: "string" } },
            motivational_note: { type: "string" },
          }
        }
      });
      setAnalysis(result);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const programTypeStyle = {
    support: "bg-amber-50 border-amber-200 text-amber-800",
    enrichment: "bg-blue-50 border-blue-200 text-blue-800",
    intervention: "bg-red-50 border-red-200 text-red-800",
  };
  const programTypeLabel = { support: "সহায়তা", enrichment: "উন্নয়ন", intervention: "হস্তক্ষেপ" };

  return (
    <div className="rounded-2xl overflow-hidden border border-primary/15 shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #003d2b 0%, #005a3e 100%)" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <Bot className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">AI পারফরম্যান্স বিশ্লেষণ</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bengali"
            style={{ background: "rgba(212,175,55,0.25)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.35)" }}>
            Powered by AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          {generated && !loading && (
            <button onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
              className="text-white/50 hover:text-white transition-colors p-1" title="পুনরায় বিশ্লেষণ করুন">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-white/60" /> : <ChevronDown className="h-4 w-4 text-white/60" />}
        </div>
      </div>

      {expanded && (
        <div className="bg-white dark:bg-slate-900 p-5">
          {/* Initial prompt */}
          {!generated && !loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#003d2b,#006241)" }}>
                <Bot className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white font-bengali">AI দিয়ে সম্পূর্ণ পারফরম্যান্স বিশ্লেষণ করুন</p>
                <p className="text-sm text-slate-500 font-bengali mt-1">পড়া, উপস্থিতি ও বেতনের তথ্য মিলিয়ে AI একটি সামগ্রিক মূল্যায়ন তৈরি করবে</p>
              </div>
              <Button onClick={runAnalysis} className="gap-2 bg-primary hover:bg-primary/90 text-white">
                <Bot className="h-4 w-4" /> বিশ্লেষণ শুরু করুন
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-slate-500 font-bengali">AI বিশ্লেষণ করছে... অনুগ্রহ করে অপেক্ষা করুন</p>
            </div>
          )}

          {/* Results */}
          {!loading && analysis && (
            <div className="space-y-5">
              {/* Score + Risk Overview */}
              <div className="flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <ScoreRing score={Math.round(analysis.overall_score || 0)} />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-800 dark:text-white font-bengali">সামগ্রিক স্কোর</span>
                    <RiskBadge level={analysis.risk_level || "low"} />
                  </div>
                  {/* Score breakdown bars */}
                  <div className="space-y-1.5">
                    {[
                      { label: "পড়াশোনা", score: analysis.score_breakdown?.reading_score, max: 40, color: "#6366f1" },
                      { label: "উপস্থিতি", score: analysis.score_breakdown?.attendance_score, max: 35, color: "#006241" },
                      { label: "বেতন", score: analysis.score_breakdown?.fee_score, max: 25, color: "#d97706" },
                    ].map(({ label, score, max, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16 font-bengali flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, ((score || 0) / max) * 100)}%`, background: color }} />
                        </div>
                        <span className="text-xs font-semibold w-12 text-right text-slate-600">{score || 0}/{max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {analysis.performance_summary && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-bengali leading-relaxed">{analysis.performance_summary}</p>
                </div>
              )}

              {/* Strengths + Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Star className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800 font-bengali">শক্তিমত্তা</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 font-bengali">
                        <span className="text-emerald-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl p-4 bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-bold text-red-800 font-bengali">ঝুঁকিপূর্ণ ক্ষেত্র</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.risk_areas?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800 font-bengali">
                        <span className="text-red-400 mt-0.5">!</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Programs */}
              {analysis.recommended_programs?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-slate-700 dark:text-white font-bengali">প্রস্তাবিত প্রোগ্রাম</span>
                  </div>
                  <div className="space-y-2.5">
                    {analysis.recommended_programs.map((p, i) => (
                      <div key={i} className={`rounded-xl p-3.5 border ${programTypeStyle[p.type] || programTypeStyle.support}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-bold font-bengali">{p.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 font-bengali flex-shrink-0">
                            {programTypeLabel[p.type] || p.type}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-bengali opacity-80">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {analysis.next_steps?.length > 0 && (
                <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-slate-700 dark:text-white font-bengali">শিক্ষক / প্রশাসকের জন্য পরবর্তী পদক্ষেপ</span>
                  </div>
                  <ol className="space-y-2">
                    {analysis.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 font-bengali">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Motivational Note */}
              {analysis.motivational_note && (
                <div className="rounded-xl p-4 border font-bengali text-center"
                  style={{ background: "linear-gradient(135deg,#fff9e6,#fffbf0)", borderColor: "#D4AF37" }}>
                  <p className="text-xs text-amber-800 leading-relaxed italic">💡 {analysis.motivational_note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}