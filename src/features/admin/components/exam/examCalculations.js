export const EXAM_TYPE_OPTIONS = [
  "First Terminal Exam",
  "Half Yearly Exam",
  "Annual Exam",
  "Model Test",
  "Monthly Test",
];

export const RESULT_SYSTEM_OPTIONS = [
  { value: "general", label: "General Education" },
  { value: "qawmi", label: "Qawmi Madrasa (কওমি মাদরাসা)" },
];

export function getFlatClassOptions(academicStructure) {
  const options = [];
  (academicStructure || []).forEach((c) => {
    if (c.sections && c.sections.length > 0) {
      c.sections.forEach((sec) => {
        options.push({
          id: sec.id,
          classId: c.id,
          class_name: c.class_name,
          section_name: sec.section_name || sec.section,
          subjects: sec.subjects || [],
          label: `${c.class_name?.bn || c.class_name?.en}${sec.section_name?.bn ? ` (${sec.section_name.bn})` : sec.section_name?.en ? ` (${sec.section_name.en})` : ""}`.trim(),
        });
      });
    } else {
      options.push({
        id: c.id,
        classId: c.id,
        class_name: c.class_name,
        section_name: c.section,
        subjects: c.subjects || [],
        label: `${c.class_name?.bn || c.class_name?.en}${c.section?.bn ? ` (${c.section.bn})` : c.section?.en ? ` (${c.section.en})` : ""}`.trim(),
      });
    }
  });
  return options;
}

export const GRADE_COLORS = {
  "A+": { bg: "rgba(0,192,96,0.12)", text: "#00a060", border: "rgba(0,192,96,0.25)", label: "Excellent" },
  "A":  { bg: "rgba(77,166,255,0.12)", text: "#0080ff", border: "rgba(77,166,255,0.25)", label: "Very Good" },
  "A-": { bg: "rgba(186,104,200,0.12)", text: "#ab47bc", border: "rgba(186,104,200,0.25)", label: "Good" },
  "B":  { bg: "rgba(212,175,55,0.12)", text: "#b8960a", border: "rgba(212,175,55,0.25)", label: "Satisfactory" },
  "C":  { bg: "rgba(255,136,0,0.12)", text: "#cc6600", border: "rgba(255,136,0,0.25)", label: "Average" },
  "D":  { bg: "rgba(255,100,0,0.12)", text: "#cc4400", border: "rgba(255,100,0,0.25)", label: "Passing" },
  "F":  { bg: "rgba(255,50,50,0.12)", text: "#cc0000", border: "rgba(255,50,50,0.25)", label: "Failed" },
};

export function calcSubjectGradeAndGPA(obtained, full) {
  if (!full || full <= 0) return { grade: "F", gpa: 0 };
  const pct = (obtained / full) * 100;
  if (pct >= 80) return { grade: "A+", gpa: 5.0 };
  if (pct >= 70) return { grade: "A", gpa: 4.0 };
  if (pct >= 60) return { grade: "A-", gpa: 3.5 };
  if (pct >= 50) return { grade: "B", gpa: 3.0 };
  if (pct >= 40) return { grade: "C", gpa: 2.0 };
  if (pct >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0 };
}

export function calcOverallGrade(gpa, isFailed) {
  if (isFailed || gpa < 1.0) return "F";
  if (gpa >= 5.0) return "A+";
  if (gpa >= 4.0) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.0) return "C";
  return "D";
}

export function calcQawmiDarajah(obtained, full) {
  if (!full || full <= 0) return "রাসিব";
  const pct = (obtained / full) * 100;
  if (pct >= 80) return "মুমতাজ";
  if (pct >= 70) return "জায়্যিদ-জিদ্দান";
  if (pct >= 60) return "জায়্যিদ";
  if (pct >= 50) return "মাকবুল";
  return "রাসিব";
}

export function calcQawmiOverallDarajah(avgPct, isFailed) {
  if (isFailed) return "রাসিব";
  if (avgPct >= 80) return "মুমতাজ";
  if (avgPct >= 70) return "জায়্যিদ-জিদ্দান";
  if (avgPct >= 60) return "জায়্যিদ";
  if (avgPct >= 50) return "মাকবুল";
  return "রাসিব";
}

export function calcQawmiDivision(darajah) {
  switch (darajah) {
    case "মুমতাজ":
      return "১ম বিভাগ (Star Marks)";
    case "জায়্যিদ-জিদ্দান":
      return "১ম বিভাগ";
    case "জায়্যিদ":
      return "২য় বিভাগ";
    case "মাকবুল":
      return "৩য় বিভাগ";
    default:
      return "অকৃতকার্য";
  }
}

export function getSubjectDisplayName(sub) {
  if (!sub) return "";
  if (typeof sub === "string") return sub;
  if (typeof sub.subject_name === "string") return sub.subject_name;
  if (typeof sub.subject_name === "object" && sub.subject_name !== null) {
    return sub.subject_name.bn || sub.subject_name.en || sub.subject_name.ar || "";
  }
  return sub.name_bn || sub.name_en || sub.name_ar || sub.title || "";
}

export function findStudentInList(r, list) {
  if (!r || r.student_id === undefined || r.student_id === null) return null;
  const targetId = String(r.student_id).trim().toLowerCase();
  return (list || []).find((s) =>
    String(s.id).trim().toLowerCase() === targetId ||
    (s.student_id && String(s.student_id).trim().toLowerCase() === targetId) ||
    (s.roll_number && String(s.roll_number).trim().toLowerCase() === targetId)
  ) || {
    id: r.student_id,
    full_name_en: `Student #${r.student_id}`,
    full_name_bn: "",
    roll_number: r.student_id,
  };
}

export function RankBadge({ rank }) {
  if (rank === 1) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm ring-2 ring-amber-400">🥇 1st</span>;
  if (rank === 2) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 shadow-sm ring-2 ring-slate-400">🥈 2nd</span>;
  if (rank === 3) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-200 to-amber-200 text-orange-900 shadow-sm ring-2 ring-orange-300">🥉 3rd</span>;
  if (rank <= 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">🎖️ #{rank}</span>;
  return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-500">{rank}</span>;
}

