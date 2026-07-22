import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

const SESSIONS = [
  { key: "নূরানী", labelEn: "Noorani", labelAr: "نوراني", emoji: "📗", color: "#00a060", bg: "rgba(0,160,96,0.08)" },
  { key: "নাজেরা", labelEn: "Nazera", labelAr: "ناظرة", emoji: "📙", color: "#cc8800", bg: "rgba(204,136,0,0.08)" },
  { key: "হিফয", labelEn: "Hifz", labelAr: "تحفيظ", emoji: "📘", color: "#0070cc", bg: "rgba(0,112,204,0.08)" },
  { key: "হিফয শুনানি", labelEn: "Hifz Shunani", labelAr: "تسميع تحفيظ", emoji: "🎧", color: "#9933cc", bg: "rgba(153,51,204,0.08)" },
  { key: "কিতাবখানা", labelEn: "Kitab Khana", labelAr: "كتاب خانة", emoji: "📚", color: "#e67e22", bg: "rgba(230,126,34,0.08)" },
  { key: "কিন্ডারগার্টেন", labelEn: "Kindergarten", labelAr: "روضة الأطفال", emoji: "🏫", color: "#cc8800", bg: "rgba(204,136,0,0.08)" },
];

const GRADE_COLORS = {
  "A+": "#00a060", "A": "#0080ff", "B": "#b8960a", "C": "#cc6600", "D": "#cc4400", "F": "#cc0000"
};

function SessionResults({ sessionKey, t, lang, exams: propExams, students: propStudents, examResults: propExamResults }) {
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const { data: fetchedExams = [], isLoading } = useQuery({
    queryKey: ["public-exams", sessionKey],
    queryFn: async () => {
      const all = await appClient.entities.Exam.list("-exam_date", 100);
      return all.filter(e => e.session === sessionKey);
    },
    enabled: propExams === undefined,
  });

  const exams = propExams || fetchedExams;

  const { data: fetchedStudents = [] } = useQuery({
    queryKey: ["students-public-season"],
    queryFn: () => appClient.entities.Student.list(),
    enabled: propStudents === undefined,
  });

  const students = propStudents || fetchedStudents;

  const [selectedExam, setSelectedExam] = useState(null);

  const { data: fetchedResults = [] } = useQuery({
    queryKey: ["public-results", selectedExam?.id],
    queryFn: () => appClient.entities.ExamResult.filter({ exam_id: selectedExam.id }, "-obtained_marks"),
    enabled: !!selectedExam && !propExamResults,
  });

  const results = propExamResults || fetchedResults;

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

  if (isLoading) return <div className="text-center py-8 text-muted-foreground text-sm">{t.results.loading}</div>;
  if (exams.length === 0) return <div className="text-center py-8 text-muted-foreground text-sm">{t.results.noExams}</div>;

  const activeExam = selectedExam || exams[0];

  return (
    <div className="space-y-4">
      {/* Exam selector */}
      <div className={`flex gap-2 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
        {exams.map(exam => (
          <button
            key={exam.id}
            onClick={() => setSelectedExam(exam)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeExam?.id === exam.id ? "rgba(0,98,65,0.12)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${activeExam?.id === exam.id ? "rgba(0,98,65,0.30)" : "transparent"}`,
              color: activeExam?.id === exam.id ? "#006241" : "#666",
            }}
          >
            {exam.title}
          </button>
        ))}
      </div>

      {/* Results list */}
      {activeExam && results.length > 0 ? (
        <div className={`space-y-2 ${isAr ? 'text-right' : ''}`}>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            {activeExam.title} — {t.results.topResults}
          </p>
          {results.slice(0, 10).map((r, i) => {
            const student = studentMap[r.student_id];
            if (!student) return null;
            const gradeColor = GRADE_COLORS[r.grade] || "#666";
            const pct = activeExam.total_marks > 0 ? Math.round((r.obtained_marks / activeExam.total_marks) * 100) : 0;
            return (
              <div key={r.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}
                style={{ background: i === 0 ? "rgba(212,175,55,0.08)" : i === 1 ? "rgba(200,200,200,0.08)" : i === 2 ? "rgba(205,127,50,0.08)" : "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? "text-yellow-600" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-500" : "text-slate-400"}`}
                  style={{ background: i < 3 ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                    {isBn ? (student.full_name_bn || student.full_name_en) : isAr ? (student.full_name_ar || student.full_name_en) : student.full_name_en}
                  </p>
                  <p className="text-xs text-muted-foreground">#{student.roll_number}</p>
                </div>
                <div className={`flex items-center gap-2 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-bold" style={{ color: gradeColor }}>{r.grade}</span>
                  <span className="text-xs text-muted-foreground">{r.obtained_marks}/{activeExam.total_marks}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(0,98,65,0.08)", color: "#006241" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeExam ? (
        <div className="text-center py-6 text-muted-foreground text-sm">{t.results.notPublished}</div>
      ) : null}
    </div>
  );
}

function ExamInputsGallery({ t, lang, examInputs: propExamInputs }) {
  const [selected, setSelected] = useState(null);
  const isAr = lang === "ar";

  const { data: fetchedInputs = [] } = useQuery({
    queryKey: ["exam-inputs-public"],
    queryFn: () => appClient.entities.ExamInput.list("-created_date", 50),
    select: d => d.filter(i => i.is_visible !== false),
    enabled: propExamInputs === undefined,
  });

  const inputs = propExamInputs || fetchedInputs;

  if (inputs.length === 0) return null;

  return (
    <div className="mt-5">
      <p className={`text-xs font-bold italic text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
        <ImageIcon className="h-3.5 w-3.5" /> {t.results.questions}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {inputs.map(inp => (
          <div key={inp.id} className={`rounded-xl overflow-hidden border border-primary/10 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${isAr ? 'text-right' : ''}`}
            onClick={() => setSelected(inp)}>
            <div className="h-28 bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <img src={inp.image_url} loading="lazy" alt={inp.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold italic text-slate-700 dark:text-slate-300 truncate">{inp.title}</p>
              {inp.session && <p className="text-[10px] italic text-muted-foreground">{inp.session}</p>}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setSelected(null)}>
          <div className="max-w-2xl w-full rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`px-4 py-3 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`} style={{ background: "rgba(0,50,30,0.95)" }}>
              <p className="font-bold italic text-white text-sm">{selected.title}</p>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-xl font-bold">×</button>
            </div>
            <img src={selected.image_url} loading="lazy" alt={selected.title} className="w-full max-h-[70vh] object-contain bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsSection({ exams: propExams, examResults: propExamResults, students: propStudents, examInputs: propExamInputs }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const [selectedSession, setSelectedSession] = useState(SESSIONS[0].key);

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold italic text-[#0c2e1f] mb-2">
          {t.results.title}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto italic">{t.results.subtitle}</p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {SESSIONS.map(s => (
          <button key={s.key} onClick={() => setSelectedSession(s.key)}
            className="px-4 py-2 rounded-xl text-xs font-bold italic transition-all"
            style={{
              background: selectedSession === s.key ? s.bg : "rgba(0,0,0,0.03)",
              border: `1px solid ${selectedSession === s.key ? s.color : "transparent"}`,
              color: selectedSession === s.key ? s.color : "#666",
            }}>
            {s.emoji} {isBn ? s.key : isAr ? s.labelAr : s.labelEn}
          </button>
        ))}
      </div>

      <SessionResults sessionKey={selectedSession} t={t} lang={lang}
        exams={propExams} students={propStudents} examResults={propExamResults} />

      <ExamInputsGallery t={t} lang={lang} examInputs={propExamInputs} />
    </section>
  );
}
