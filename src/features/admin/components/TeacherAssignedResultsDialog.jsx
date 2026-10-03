import React, { useState, useEffect } from "react";
import { resolveAcademicDisplayName, isStudentInClassOption, isStudentAssignedToTeacher, getStudentAssignedTeacher } from "@/lib/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { 
  Trophy, Search, Award, Printer, FileText,
  Users, ChevronDown, ChevronUp, Check, X, BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DEFAULT_LOGO } from "@/utils";

const GRADE_COLORS = {
  "A+": { bg: "rgba(0,192,96,0.12)", text: "#00a060", border: "rgba(0,192,96,0.25)", label: "Excellent" },
  "A":  { bg: "rgba(77,166,255,0.12)", text: "#0080ff", border: "rgba(77,166,255,0.25)", label: "Very Good" },
  "A-": { bg: "rgba(186,104,200,0.12)", text: "#ab47bc", border: "rgba(186,104,200,0.25)", label: "Good" },
  "B":  { bg: "rgba(212,175,55,0.12)", text: "#b8960a", border: "rgba(212,175,55,0.25)", label: "Satisfactory" },
  "C":  { bg: "rgba(255,136,0,0.12)", text: "#cc6600", border: "rgba(255,136,0,0.25)", label: "Average" },
  "D":  { bg: "rgba(255,100,0,0.12)", text: "#cc4400", border: "rgba(255,100,0,0.25)", label: "Passing" },
  "F":  { bg: "rgba(255,50,50,0.12)", text: "#cc0000", border: "rgba(255,50,50,0.25)", label: "Failed" },
};

function calcQawmiDarajah(obtained, full) {
  if (!full || full <= 0) return "রাসিব";
  const pct = (obtained / full) * 100;
  if (pct >= 80) return "মুমতাজ";
  if (pct >= 70) return "জায়্যিদ-জিদ্দান";
  if (pct >= 60) return "জায়্যিদ";
  if (pct >= 50) return "মাকবুল";
  return "রাসিব";
}

export default function TeacherAssignedResultsDialog({
  isOpen,
  onClose,
  teacher: initialTeacher,
  initialExamId = "all",
  initialClassId = "all",
  students = [],
  exams = [],
  branches = [],
  results = [],
  teachers = [],
  settings = {},
  enrichResult,
  findStudentForResult,
  handlePrintIndividual,
  getPrintableMarksheetInnerContent,
  getFullTranscriptDocumentHTML,
}) {
  const [activeTeacher, setActiveTeacher] = useState(initialTeacher);
  const [modalExamIds, setModalExamIds] = useState(
    initialExamId && initialExamId !== "all" ? [String(initialExamId)] : []
  );
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [modalClassId, setModalClassId] = useState(initialClassId || "all");
  const [modalSearch, setModalSearch] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("all");
  const [modalSortBy, setModalSortBy] = useState("rank");
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    setActiveTeacher(initialTeacher);
    setModalExamIds(initialExamId && initialExamId !== "all" ? [String(initialExamId)] : []);
    setModalClassId(initialClassId || "all");
    setModalSearch("");
    setModalStatusFilter("all");
    setModalSortBy("rank");
    setExpandedStudentId(null);
    setIsExamDropdownOpen(false);
  }, [initialTeacher, initialExamId, initialClassId, isOpen]);

  const teacherBranch = branches.find(b => String(b.id) === String(activeTeacher?.branch_id));

  const allTeacherStudents = React.useMemo(() => {
    if (!activeTeacher?.id) return [];
    return students.filter(s => {
      if (s.status === "inactive") return false;
      return isStudentAssignedToTeacher(s, activeTeacher);
    });
  }, [students, activeTeacher]);

  const teacherClasses = React.useMemo(() => {
    const seen = new Map();
    allTeacherStudents.forEach(s => {
      const b = branches.find(br => String(br.id) === String(s.branch_id));
      const clsName = resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, b?.academic_structure, 'bn') ||
        s.class_name || s.batch || `Class ${s.class_id}`;
      const cKey = String(s.class_id || s.class_name || "general");
      if (!seen.has(cKey)) {
        seen.set(cKey, { id: cKey, label: clsName, branchId: s.branch_id });
      }
    });
    return Array.from(seen.values());
  }, [allTeacherStudents, branches]);

  const availableExams = React.useMemo(() => {
    return exams.filter(e => {
      if (activeTeacher.branch_id && String(e.branch_id) !== String(activeTeacher.branch_id)) return false;
      return true;
    });
  }, [exams, activeTeacher]);

  const activeTargetExams = React.useMemo(() => {
    if (modalExamIds.length === 0) {
      return availableExams;
    }
    return availableExams.filter(e => modalExamIds.includes(String(e.id)));
  }, [availableExams, modalExamIds]);

  const isMultipleExams = activeTargetExams.length > 1;

  const toggleExamSelection = (examId) => {
    const idStr = String(examId);
    setModalExamIds(prev => {
      if (prev.includes(idStr)) {
        return prev.filter(id => id !== idStr);
      }
      return [...prev, idStr];
    });
  };

  const selectAllExams = () => {
    setModalExamIds([]);
  };

  const examSelectorLabel = React.useMemo(() => {
    if (modalExamIds.length === 0) {
      return "সকল পরীক্ষা (All Exams)";
    }
    if (modalExamIds.length === 1) {
      const e = availableExams.find(ex => String(ex.id) === String(modalExamIds[0]));
      return e ? e.title : "১টি পরীক্ষা নির্বাচিত";
    }
    if (modalExamIds.length === 2) {
      const e1 = availableExams.find(ex => String(ex.id) === String(modalExamIds[0]));
      const e2 = availableExams.find(ex => String(ex.id) === String(modalExamIds[1]));
      return `${e1?.title || "পরীক্ষা ১"} + ${e2?.title || "পরীক্ষা ২"}`;
    }
    return `${modalExamIds.length}টি পরীক্ষা নির্বাচিত (যৌথ)`;
  }, [modalExamIds, availableExams]);

  const studentRows = React.useMemo(() => {
    const list = allTeacherStudents.filter(s => {
      if (modalClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(s.branch_id));
        const isMatch = isStudentInClassOption(s, modalClassId, b?.academic_structure) ||
          String(s.class_id) === String(modalClassId) ||
          (s.class_name && String(s.class_name).toLowerCase().includes(String(modalClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const nEn = (s.full_name_en || "").toLowerCase();
        const nBn = (s.full_name_bn || "").toLowerCase();
        const roll = String(s.roll_number || "").toLowerCase();
        const idStr = String(s.id || "").toLowerCase();
        const stCode = String(s.student_id || "").toLowerCase();
        if (!nEn.includes(q) && !nBn.includes(q) && !roll.includes(q) && !idStr.includes(q) && !stCode.includes(q)) {
          return false;
        }
      }
      return true;
    });

    const enrichedRows = list.map(student => {
      const b = branches.find(br => String(br.id) === String(student.branch_id));
      const classLabel = resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, b?.academic_structure, 'bn') ||
        student.class_name || student.batch || "—";
      const groupLabel = student.class_group_id ? `Group ${student.class_group_id}` : "General";

      const studentExamResults = [];
      let combinedTotalObtained = 0;
      let combinedTotalFull = 0;
      let hasAnyFail = false;
      let hasAnyResult = false;
      let validExamCount = 0;

      activeTargetExams.forEach(examObj => {
        const res = results.find(r => String(r.exam_id) === String(examObj.id) && String(r.student_id) === String(student.id));
        if (res) {
          hasAnyResult = true;
          const enriched = enrichResult(res);
          const isQawmiExam = (examObj.result_system || "general") === "qawmi";
          const eFull = Number(enriched.total_full_marks || 0);
          const eObt = Number(enriched.total_obtained_marks || 0);
          const isFailedExam = enriched.status === "fail";
          if (isFailedExam) hasAnyFail = true;

          combinedTotalObtained += eObt;
          combinedTotalFull += eFull;
          validExamCount += 1;

          studentExamResults.push({
            examId: examObj.id,
            examTitle: examObj.title,
            academicYear: examObj.academic_year,
            result: enriched,
            totalObtained: eObt,
            totalFull: eFull,
            percentage: eFull > 0 ? (eObt / eFull) * 100 : 0,
            gpa: isFailedExam ? 0 : Number(enriched.gpa || 0),
            grade: isFailedExam ? "F" : (enriched.grade || "F"),
            darajah: isFailedExam ? "রাসিব" : calcQawmiDarajah(eObt, eFull),
            status: enriched.status,
            marksDetails: enriched.marks_details || [],
            isQawmi: isQawmiExam,
          });
        }
      });

      const rollNum = parseInt(student.roll_number, 10);
      const numericRoll = isNaN(rollNum) ? 999999 : rollNum;
      const isOverallQawmi = activeTargetExams.some(e => (e.result_system || "general") === "qawmi");
      const combinedPercentage = combinedTotalFull > 0 ? (combinedTotalObtained / combinedTotalFull) * 100 : 0;
      const combinedGpa = hasAnyFail || !hasAnyResult ? 0 : (
        combinedPercentage >= 80 ? 5.0 :
        combinedPercentage >= 70 ? 4.0 :
        combinedPercentage >= 60 ? 3.5 :
        combinedPercentage >= 50 ? 3.0 :
        combinedPercentage >= 40 ? 2.0 :
        combinedPercentage >= 33 ? 1.0 : 0
      );
      const combinedGrade = hasAnyFail || !hasAnyResult ? "F" : (
        combinedPercentage >= 80 ? "A+" :
        combinedPercentage >= 70 ? "A" :
        combinedPercentage >= 60 ? "A-" :
        combinedPercentage >= 50 ? "B" :
        combinedPercentage >= 40 ? "C" :
        combinedPercentage >= 33 ? "D" : "F"
      );
      const combinedDarajah = hasAnyFail ? "রাসিব" : (
        hasAnyResult ? calcQawmiDarajah(combinedTotalObtained, combinedTotalFull) : "—"
      );
      const overallStatus = !hasAnyResult ? "no_result" : (hasAnyFail ? "fail" : "pass");

      return {
        student,
        studentId: student.id,
        studentNameEn: student.full_name_en || `Student #${student.id}`,
        studentNameBn: student.full_name_bn || "",
        photoUrl: student.photo_url || null,
        rollNumber: student.roll_number || String(student.id),
        numericRoll,
        branchName: b?.name_bn || b?.name_en || "Main Branch",
        classLabel,
        groupLabel,
        hasResult: hasAnyResult,
        isQawmi: isOverallQawmi,
        totalObtained: combinedTotalObtained,
        totalFull: combinedTotalFull,
        percentage: combinedPercentage,
        gpa: combinedGpa,
        grade: combinedGrade,
        darajah: combinedDarajah,
        status: overallStatus,
        examResults: studentExamResults,
        participatedExamsCount: validExamCount,
        targetExamsCount: activeTargetExams.length,
        singleExamResult: studentExamResults[0]?.result || null,
      };
    });

    let filteredList = enrichedRows;
    if (modalStatusFilter === "pass") {
      filteredList = enrichedRows.filter(r => r.status === "pass");
    } else if (modalStatusFilter === "fail") {
      filteredList = enrichedRows.filter(r => r.status === "fail");
    } else if (modalStatusFilter === "no_result") {
      filteredList = enrichedRows.filter(r => !r.hasResult);
    }

    const sortedForRank = [...filteredList].sort((a, b) => {
      if (a.hasResult !== b.hasResult) return a.hasResult ? -1 : 1;
      const sA = a.status === "pass" ? 1 : 0;
      const sB = b.status === "pass" ? 1 : 0;
      if (sA !== sB) return sB - sA;
      if (b.totalObtained !== a.totalObtained) return b.totalObtained - a.totalObtained;
      if (b.gpa !== a.gpa) return b.gpa - a.gpa;
      return a.numericRoll - b.numericRoll;
    });

    let currentRank = 1;
    const rankedList = sortedForRank.map(item => {
      let cohortRank = null;
      if (item.hasResult) {
        cohortRank = currentRank;
        currentRank += 1;
      }
      return { ...item, cohortRank };
    });

    if (modalSortBy === "roll") {
      rankedList.sort((a, b) => a.numericRoll - b.numericRoll);
    } else if (modalSortBy === "name") {
      rankedList.sort((a, b) => a.studentNameEn.localeCompare(b.studentNameEn));
    }

    return rankedList;
  }, [allTeacherStudents, modalClassId, modalSearch, activeTargetExams, results, exams, branches, enrichResult, modalStatusFilter, modalSortBy]);

  const cohortStats = React.useMemo(() => {
    const totalAssigned = allTeacherStudents.length;
    const inCurrentClass = studentRows.length;
    const appeared = studentRows.filter(r => r.hasResult).length;
    const passed = studentRows.filter(r => r.status === "pass").length;
    const failed = studentRows.filter(r => r.status === "fail").length;
    const passRate = appeared > 0 ? (passed / appeared) * 100 : 0;
    const totalMarksSum = studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalObtained, 0);
    const avgMarks = appeared > 0 ? totalMarksSum / appeared : 0;
    const totalGpaSum = studentRows.filter(r => r.hasResult && r.status === "pass").reduce((sum, r) => sum + r.gpa, 0);
    const avgGpa = passed > 0 ? totalGpaSum / passed : 0;
    const topStudent = studentRows.find(r => r.hasResult && r.cohortRank === 1) || studentRows.find(r => r.hasResult);

    return { totalAssigned, inCurrentClass, appeared, passed, failed, passRate, avgMarks, avgGpa, topStudent };
  }, [allTeacherStudents, studentRows]);

  const classTeachersRanking = React.useMemo(() => {
    const targetBranchId = activeTeacher.branch_id;
    const relevantStudents = students.filter(s => {
      if (s.status === "inactive") return false;
      if (targetBranchId && String(s.branch_id) !== String(targetBranchId)) return false;
      if (modalClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(s.branch_id));
        const isMatch = isStudentInClassOption(s, modalClassId, b?.academic_structure) ||
          String(s.class_id) === String(modalClassId) ||
          (s.class_name && String(s.class_name).toLowerCase().includes(String(modalClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      return true;
    });

    const teacherStatsMap = new Map();

    relevantStudents.forEach(st => {
      const assignedT = getStudentAssignedTeacher(st, teachers);
      if (!assignedT) return;
      const tId = String(assignedT.id);
      if (!teacherStatsMap.has(tId)) {
        teacherStatsMap.set(tId, {
          teacherId: tId,
          teacherObj: assignedT,
          assignedCount: 0,
          appearedCount: 0,
          passedCount: 0,
          failedCount: 0,
          totalObtainedMarks: 0,
          totalFullMarks: 0,
          totalGpaSum: 0,
        });
      }
      const tStat = teacherStatsMap.get(tId);
      tStat.assignedCount += 1;

      let stHasResult = false;
      let stHasFail = false;
      let stObtSum = 0;
      let stFullSum = 0;

      activeTargetExams.forEach(examObj => {
        const r = results.find(res => String(res.exam_id) === String(examObj.id) && String(res.student_id) === String(st.id));
        if (r) {
          stHasResult = true;
          const enriched = enrichResult(r);
          const eFull = Number(enriched.total_full_marks || 0);
          const eObt = Number(enriched.total_obtained_marks || 0);
          if (enriched.status === "fail") stHasFail = true;
          stObtSum += eObt;
          stFullSum += eFull;
        }
      });

      if (stHasResult) {
        tStat.appearedCount += 1;
        tStat.totalObtainedMarks += stObtSum;
        tStat.totalFullMarks += stFullSum;
        if (stHasFail) {
          tStat.failedCount += 1;
        } else {
          tStat.passedCount += 1;
          const pct = stFullSum > 0 ? (stObtSum / stFullSum) * 100 : 0;
          const stGpa = pct >= 80 ? 5.0 : pct >= 70 ? 4.0 : pct >= 60 ? 3.5 : pct >= 50 ? 3.0 : pct >= 40 ? 2.0 : pct >= 33 ? 1.0 : 0;
          tStat.totalGpaSum += stGpa;
        }
      }
    });

    const activeTeacherIdStr = String(activeTeacher.id);
    if (!teacherStatsMap.has(activeTeacherIdStr)) {
      teacherStatsMap.set(activeTeacherIdStr, {
        teacherId: activeTeacherIdStr,
        teacherObj: activeTeacher,
        assignedCount: allTeacherStudents.length,
        appearedCount: cohortStats.appeared,
        passedCount: cohortStats.passed,
        failedCount: cohortStats.failed,
        totalObtainedMarks: studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalObtained, 0),
        totalFullMarks: studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalFull, 0),
        totalGpaSum: studentRows.filter(r => r.hasResult && r.status === "pass").reduce((sum, r) => sum + r.gpa, 0),
      });
    }

    const teacherList = Array.from(teacherStatsMap.values()).map(t => {
      const passRate = t.appearedCount > 0 ? (t.passedCount / t.appearedCount) * 100 : 0;
      const avgMarks = t.appearedCount > 0 ? t.totalObtainedMarks / t.appearedCount : 0;
      const avgPercentage = t.totalFullMarks > 0 ? (t.totalObtainedMarks / t.totalFullMarks) * 100 : 0;
      const avgGpa = t.passedCount > 0 ? t.totalGpaSum / t.passedCount : (t.appearedCount > 0 ? t.totalGpaSum / t.appearedCount : 0);

      let ratingLabel = "সন্তোষজনক";
      let ratingColor = "bg-slate-100 text-slate-700 border-slate-300";
      if (passRate >= 90 && avgPercentage >= 75) {
        ratingLabel = "🌟 অসাধারণ (Outstanding)";
        ratingColor = "bg-amber-100 text-amber-900 border-amber-300";
      } else if (passRate >= 80 && avgPercentage >= 65) {
        ratingLabel = "🟢 চমৎকার (Excellent)";
        ratingColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      } else if (passRate >= 60) {
        ratingLabel = "🟡 ভালো (Good)";
        ratingColor = "bg-teal-100 text-teal-800 border-teal-300";
      } else if (t.appearedCount > 0) {
        ratingLabel = "⚠️ উন্নয়ন প্রয়োজন";
        ratingColor = "bg-rose-100 text-rose-800 border-rose-300";
      } else {
        ratingLabel = "ফলাফল অনির্ধারিত";
        ratingColor = "bg-slate-100 text-slate-500 border-slate-200";
      }

      return { ...t, passRate, avgMarks, avgPercentage, avgGpa, ratingLabel, ratingColor };
    }).sort((a, b) => {
      if (Math.abs(b.passRate - a.passRate) > 0.01) return b.passRate - a.passRate;
      if (Math.abs(b.avgPercentage - a.avgPercentage) > 0.01) return b.avgPercentage - a.avgPercentage;
      if (Math.abs(b.avgMarks - a.avgMarks) > 0.01) return b.avgMarks - a.avgMarks;
      if (Math.abs(b.avgGpa - a.avgGpa) > 0.01) return b.avgGpa - a.avgGpa;
      return b.assignedCount - a.assignedCount;
    }).map((t, idx) => ({ ...t, rank: idx + 1, totalTeachersCount: teacherStatsMap.size }));

    return teacherList;
  }, [students, activeTeacher, modalClassId, branches, teachers, activeTargetExams, results, enrichResult, allTeacherStudents, cohortStats, studentRows]);

  const currentTeacherClassRank = React.useMemo(() => {
    return classTeachersRanking.find(t => String(t.teacherId) === String(activeTeacher.id)) || null;
  }, [classTeachersRanking, activeTeacher]);

  const renderCohortRankBadge = (rank) => {
    if (!rank) return <span className="text-slate-400 text-xs font-medium">—</span>;
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400">
          🥇 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-sm ring-2 ring-slate-400">
          🥈 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 text-amber-950 shadow-sm ring-2 ring-orange-300">
          🥉 3rd
        </span>
      );
    }
    if (rank <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          🎖️ #{rank}
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        {rank}
      </span>
    );
  };

  const handlePrintTeacherResultSheet = () => {
    if (studentRows.length === 0) {
      return toast.error("প্রিন্ট করার মতো কোনো শিক্ষার্থীর ফলাফল নেই।");
    }

    const branchName = teacherBranch?.name_bn || teacherBranch?.name_en || "রহমানিয়া ইনস্টিটিউট";
    const logoUrl = settings?.logo_url || DEFAULT_LOGO;
    const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
    const isQawmi = activeTargetExams.some(e => e.result_system === "qawmi");

    const examTitleStr = activeTargetExams.length === 0
      ? "সকল পরীক্ষা"
      : activeTargetExams.length === 1
        ? activeTargetExams[0].title
        : `${activeTargetExams.map(e => e.title).join(" + ")} (যৌথ ফলাফল শিট)`;

    const isMultiExamPrint = activeTargetExams.length > 1;

    let examHeadersHTML = "";
    if (isMultiExamPrint) {
      examHeadersHTML = activeTargetExams.map(e => `
        <th style="width: ${Math.max(10, Math.floor(40 / activeTargetExams.length))}%">${e.title}</th>
      `).join("");
    }

    const rowsHTML = studentRows.map((r) => {
      const qawmiDarajah = isQawmi ? r.darajah : "";
      const rankDisplay = r.cohortRank ? `#${r.cohortRank}` : "—";
      const isFail = r.status === "fail";

      let examMarksCols = "";
      if (isMultiExamPrint) {
        examMarksCols = activeTargetExams.map(e => {
          const exRes = r.examResults.find(er => String(er.examId) === String(e.id));
          if (!exRes) return `<td style="border: 1px solid #002818; padding: 6px; color: #888;">—</td>`;
          const isExFail = exRes.status === "fail";
          return `
            <td style="border: 1px solid #002818; padding: 6px; ${isExFail ? "color: red; font-weight: bold;" : ""}">
              <strong>${exRes.totalObtained}</strong> / ${exRes.totalFull}
              <br/><span style="font-size: 9px; color: #666;">${exRes.grade} (${exRes.gpa.toFixed(2)})</span>
            </td>
          `;
        }).join("");
      }

      return `
        <tr>
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px;">${rankDisplay}</td>
          <td style="text-align: left; border: 1px solid #002818; padding: 6px;">
            <strong>${r.studentNameEn}</strong>
            ${r.studentNameBn ? `<br/><span style="font-size: 10px; color: #555;">${r.studentNameBn}</span>` : ""}
          </td>
          <td style="text-align: center; font-family: monospace; border: 1px solid #002818; padding: 6px;">${r.rollNumber}</td>
          <td style="text-align: center; border: 1px solid #002818; padding: 6px;">${r.classLabel}</td>
          ${examMarksCols}
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">
            ${r.hasResult ? `${r.totalObtained} / ${r.totalFull}` : "—"}
            ${r.hasResult ? `<br/><span style="font-size: 9.5px; color: #555;">(${r.percentage.toFixed(1)}%)</span>` : ""}
          </td>
          ${isQawmi
            ? `<td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#006241"};">${qawmiDarajah}</td>`
            : `<td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">${r.hasResult ? (isFail ? "0.00" : r.gpa.toFixed(2)) : "—"}</td>
               <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">${r.grade}</td>`
          }
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : r.hasResult ? "#006241" : "#888"};">
            ${r.status === "pass" ? "পাস (PASS)" : r.status === "fail" ? "ফেল (FAIL)" : "ফলাফল নেই"}
          </td>
        </tr>
      `;
    }).join("");

    const teacherRankInfo = currentTeacherClassRank
      ? `<div style="margin-top: 3px; font-size: 11px; color: #D4AF37;">
          এই ক্লাসে শিক্ষকের স্থান: <strong>#${currentTeacherClassRank.rank} (মোট ${classTeachersRanking.length} জন শিক্ষকের মধ্যে)</strong> | পাস হার: ${currentTeacherClassRank.passRate.toFixed(1)}% | গড় নম্বর: ${currentTeacherClassRank.avgMarks.toFixed(1)}
        </div>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>শিক্ষক ভিত্তিক রেজাল্ট শিট - ${activeTeacher.full_name_en || activeTeacher.full_name_bn}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', 'Segoe UI', system-ui, sans-serif; padding: 15px; color: #002818; background: #fff; }
          .sheet-container { border: 2px solid #004D3A; padding: 16px; border-radius: 8px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004D3A; padding-bottom: 12px; margin-bottom: 14px; }
          .logo-wrap { width: 70px; height: 70px; padding: 2px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
          .logo-wrap img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
          .inst-details { text-align: center; flex: 1; padding: 0 15px; }
          .meta-box { display: flex; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; font-size: 11.5px; margin-bottom: 12px; }
          .table-data { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
          .table-data th { background: #004D3A; color: white; padding: 7px 5px; border: 1px solid #002818; font-size: 10.5px; text-transform: uppercase; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 10px; }
          .sig-line { width: 160px; border-top: 1px dashed #444; text-align: center; font-size: 11px; padding-top: 5px; }
          @media print {
            body { padding: 0; }
            .sheet-container { border: none; }
            .table-data th { background-color: #004D3A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .meta-box { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <div class="header">
            <div class="logo-wrap"><img src="${logoUrl}" alt="Logo"></div>
            <div class="inst-details">
              <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #004D3A;">${instNameBn}</h1>
              <h2 style="margin: 3px 0 0; font-size: 13px; color: #D4AF37;">${instNameEn} - Teacher Assigned Result & Merit Sheet</h2>
              <div style="margin-top: 4px; display: inline-block; padding: 2px 10px; background: #004D3A; color: #fff; font-size: 11px; border-radius: 10px; font-weight: bold;">
                শিক্ষক: ${activeTeacher.full_name_bn || activeTeacher.full_name_en} ${activeTeacher.designation ? `(${activeTeacher.designation})` : ""}
              </div>
              ${teacherRankInfo}
            </div>
            <div style="width: 70px;"></div>
          </div>

          <div class="meta-box">
            <div>
              <div><strong>শাখা (Branch):</strong> ${branchName}</div>
              <div><strong>পরীক্ষা (Exams):</strong> ${examTitleStr}</div>
            </div>
            <div style="text-align: right;">
              <div><strong>মোট শিক্ষার্থী:</strong> ${studentRows.length} জন | <strong>পাস হার:</strong> ${cohortStats.passRate.toFixed(1)}%</div>
              <div><strong>মুদ্রণ তারিখ:</strong> ${format(new Date(), "dd/MM/yyyy")}</div>
            </div>
          </div>

          <table class="table-data">
            <thead>
              <tr>
                <th style="width: 6%;">র‍্যাংক</th>
                <th style="width: 22%; text-align: left;">শিক্ষার্থীর নাম</th>
                <th style="width: 9%;">রোল নং</th>
                <th style="width: 14%;">ক্লাস / বিভাগ</th>
                ${examHeadersHTML}
                <th style="width: 12%;">মোট প্রাপ্ত নম্বর</th>
                ${isQawmi
                  ? `<th style="width: 10%;">দারাজাহ</th>`
                  : `<th style="width: 6%;">GPA</th><th style="width: 6%;">গ্রেড</th>`
                }
                <th style="width: 9%;">ফলাফল</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-line">সংশ্লিষ্ট শিক্ষক স্বাক্ষর</div>
            <div class="sig-line">শাখা প্রধান / মুহতামিম</div>
            <div class="sig-line">পরীক্ষা নিয়ন্ত্রক</div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintTeacherAllCards = () => {
    const validRows = studentRows.filter(r => r.singleExamResult);
    if (validRows.length === 0) return toast.error("প্রিন্ট করার মতো কোনো রেজাল্ট কার্ড নেই।");

    const pagesHtml = validRows.map((r) => {
      const student = r.student;
      const examObj = exams.find(e => String(e.id) === String(r.singleExamResult.exam_id));
      const branchObj = branches.find(b => String(b.id) === String(r.singleExamResult.branch_id || student?.branch_id));
      const classNameVal = r.classLabel;
      const innerContent = getPrintableMarksheetInnerContent(student, branchObj, classNameVal, examObj, r.singleExamResult, settings, null, examObj?.result_system || "general");
      return `<div class="transcript-page">${innerContent}</div>`;
    }).filter(Boolean).join("");

    if (!pagesHtml) return toast.error("Could not generate transcripts");
    const fullDoc = getFullTranscriptDocumentHTML(pagesHtml, `${activeTeacher.full_name_en} - All Assigned Result Cards (${validRows.length})`);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(fullDoc);
    printWindow.document.close();
  };

  if (!isOpen || !initialTeacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border border-emerald-950/20 shadow-2xl bg-slate-50/95 backdrop-blur-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Assigned Students Result & Ranking</DialogTitle>
        </DialogHeader>

        <div className="bg-gradient-to-r from-[#052E2B] via-[#073831] to-[#0a4a3f] p-5 sm:p-6 text-white relative border-b border-emerald-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#D4AF37] shadow-lg">
                {activeTeacher.photo_url ? (
                  <img src={activeTeacher.photo_url} alt={activeTeacher.full_name_en} className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-8 w-8 text-[#D4AF37]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                    Teacher Result & Ranking View
                  </span>

                  {currentTeacherClassRank && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm flex items-center gap-1">
                      🏆 {modalClassId !== "all" ? "এই ক্লাসে" : "সার্বিক"} {currentTeacherClassRank.rank} নম্বর শিক্ষক 
                      {classTeachersRanking.length > 1 && ` (মোট ${classTeachersRanking.length} জনের মধ্যে)`}
                    </span>
                  )}

                  {modalExamIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#D4AF37] text-[#052E2B] shadow-2xs">
                      {modalExamIds.length}টি পরীক্ষা যৌথ নির্বাচন
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 truncate">
                  {activeTeacher.full_name_bn || activeTeacher.full_name_en}
                  {activeTeacher.full_name_bn && activeTeacher.full_name_en && (
                    <span className="text-sm font-normal text-white/80 ml-2">({activeTeacher.full_name_en})</span>
                  )}
                </h2>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-1 flex-wrap font-medium">
                  <span>{activeTeacher.designation || "শিক্ষক"}</span>
                  <span>•</span>
                  <span>{teacherBranch?.name_bn || teacherBranch?.name_en || "রহমানিয়া ইনস্টিটিউট"}</span>
                  <span>•</span>
                  <span>মোট শিক্ষার্থী: <strong className="text-[#D4AF37]">{allTeacherStudents.length} জন</strong></span>
                  {currentTeacherClassRank && (
                    <>
                      <span>•</span>
                      <span>পাস হার: <strong className="text-emerald-300">{currentTeacherClassRank.passRate.toFixed(1)}%</strong></span>
                      <span>•</span>
                      <span>গড় নম্বর: <strong className="text-amber-200">{currentTeacherClassRank.avgMarks.toFixed(1)}</strong></span>
                      <span>•</span>
                      <span>গড় GPA: <strong className="text-yellow-300">{currentTeacherClassRank.avgGpa.toFixed(2)}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                size="sm"
                onClick={handlePrintTeacherResultSheet}
                className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] font-bold text-xs rounded-xl h-9 px-3.5 shadow-sm gap-1.5"
              >
                <Printer className="h-4 w-4" /> রেজাল্ট শিট প্রিন্ট
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs rounded-xl h-9 px-3"
              >
                <X className="h-4 w-4" /> বন্ধ করুন
              </Button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-[#052E2B]">
              <span className="text-[10px] uppercase font-bold text-slate-400">মোট শিক্ষার্থী</span>
              <span className="text-xl font-extrabold text-[#052E2B]">{cohortStats.inCurrentClass} জন</span>
              <span className="text-[10px] text-slate-500">অ্যাসাইন করা তালিকা</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-teal-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">পরীক্ষায় অংশ</span>
              <span className="text-xl font-extrabold text-teal-700">{cohortStats.appeared} জন</span>
              <span className="text-[10px] text-slate-500">
                {modalExamIds.length > 1 ? `${modalExamIds.length}টি পরীক্ষায় যুক্ত` : "নম্বর যুক্ত ফলাফল"}
              </span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-emerald-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">পাস শিক্ষার্থী</span>
              <span className="text-xl font-extrabold text-emerald-600">{cohortStats.passed} জন</span>
              <span className="text-[10px] text-emerald-700 font-bold">পাস হার: {cohortStats.passRate.toFixed(1)}%</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-red-500">
              <span className="text-[10px] uppercase font-bold text-slate-400">অকৃতকার্য</span>
              <span className="text-xl font-extrabold text-red-600">{cohortStats.failed} জন</span>
              <span className="text-[10px] text-slate-500">এক বা একাধিক পরীক্ষায়</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-amber-500">
              <span className="text-[10px] uppercase font-bold text-slate-400">সেরা শিক্ষার্থী</span>
              <span className="text-xs font-bold text-amber-900 truncate">
                {cohortStats.topStudent ? cohortStats.topStudent.studentNameEn : "—"}
              </span>
              <span className="text-[10px] text-amber-700 font-bold">
                {cohortStats.topStudent?.hasResult ? `${cohortStats.topStudent.totalObtained} নম্বর (#1)` : "ফলাফল নেই"}
              </span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-indigo-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">শিক্ষকের অবস্থান (Rank)</span>
              <span className="text-base font-extrabold text-indigo-900 flex items-center gap-1">
                🏆 #{currentTeacherClassRank ? currentTeacherClassRank.rank : 1} শিক্ষক
              </span>
              <span className="text-[10px] text-indigo-700 font-bold">
                {classTeachersRanking.length > 1 ? `মোট ${classTeachersRanking.length} জন শিক্ষকের মধ্যে` : "একক শিক্ষক"}
              </span>
            </Card>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">
                    পরীক্ষা ({modalExamIds.length === 0 ? "সকল" : `${modalExamIds.length}টি`})
                  </label>
                  {modalExamIds.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllExams}
                      className="text-[9px] text-[#052E2B] hover:underline font-bold"
                    >
                      সব দেখুন
                    </button>
                  )}
                </div>

                <Popover open={isExamDropdownOpen} onOpenChange={setIsExamDropdownOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full h-9 px-3 text-xs rounded-xl border flex items-center justify-between transition-all text-left font-semibold ${
                        modalExamIds.length > 0
                          ? "bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className="truncate flex-1 mr-1.5">{examSelectorLabel}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {modalExamIds.length > 0 && (
                          <span className="bg-[#052E2B] text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                            {modalExamIds.length}
                          </span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 sm:w-80 p-2 rounded-2xl shadow-xl border-slate-200 bg-white z-50">
                    <div className="p-2 border-b border-slate-100 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        একাধিক পরীক্ষা নির্বাচন
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={selectAllExams}
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                            modalExamIds.length === 0 ? "bg-[#052E2B] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          সকল পরীক্ষা
                        </button>
                        {modalExamIds.length > 0 && (
                          <button
                            type="button"
                            onClick={selectAllExams}
                            className="text-[10px] px-1.5 py-0.5 rounded-lg text-red-600 font-bold hover:bg-red-50"
                          >
                            রিসেট
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                      {availableExams.length === 0 ? (
                        <p className="p-3 text-center text-xs text-slate-400 italic">কোনো পরীক্ষা পাওয়া যায়নি</p>
                      ) : (
                        availableExams.map(exam => {
                          const idStr = String(exam.id);
                          const isIndividuallySelected = modalExamIds.includes(idStr);

                          return (
                            <button
                              key={exam.id}
                              type="button"
                              onClick={() => toggleExamSelection(exam.id)}
                              className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs ${
                                isIndividuallySelected
                                  ? "bg-amber-50 text-amber-950 font-bold border border-amber-200 shadow-2xs"
                                  : "hover:bg-slate-50 text-slate-700 font-medium"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                isIndividuallySelected
                                  ? "bg-[#052E2B] border-[#052E2B] text-[#D4AF37]"
                                  : modalExamIds.length === 0
                                    ? "bg-teal-700/10 border-teal-700/30 text-teal-900"
                                    : "border-slate-300 bg-white"
                              }`}>
                                {(isIndividuallySelected || modalExamIds.length === 0) && (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-bold">{exam.title}</p>
                                <p className="text-[10px] text-emerald-800 font-semibold truncate">
                                  {(() => {
                                    const b = (branches || []).find(br => String(br.id) === String(exam.branch_id));
                                    const classLabel = resolveAcademicDisplayName(
                                      exam.class_id,
                                      exam.session_id,
                                      exam.class_group_id,
                                      b?.academic_structure,
                                      'bn'
                                    );
                                    const labelPart = classLabel ? `${classLabel} • ` : "";
                                    return `${labelPart}${exam.academic_year || "২০২৬"}${exam.result_system === "qawmi" ? " • কওমি" : ""}`;
                                  })()}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{modalExamIds.length === 0 ? `সকল (${availableExams.length}টি) পরীক্ষা সক্রিয়` : `${modalExamIds.length}টি পরীক্ষা সক্রিয়`}</span>
                      <Button
                        size="sm"
                        onClick={() => setIsExamDropdownOpen(false)}
                        className="h-6 text-[10px] font-bold bg-[#052E2B] text-white rounded-lg px-2.5"
                      >
                        সম্পন্ন
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ক্লাস / বিভাগ</label>
                <Select value={modalClassId} onValueChange={setModalClassId}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল ক্লাস ({allTeacherStudents.length} জন)</SelectItem>
                    {teacherClasses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ফলাফল ফিল্টার</label>
                <Select value={modalStatusFilter} onValueChange={setModalStatusFilter}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ফলাফল (All)</SelectItem>
                    <SelectItem value="pass">উত্তীর্ণ (Passed)</SelectItem>
                    <SelectItem value="fail">অকৃতকার্য (Failed)</SelectItem>
                    <SelectItem value="no_result">ফলাফল এন্ট্রি বাকি</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">সাজান (Sort By)</label>
                <Select value={modalSortBy} onValueChange={setModalSortBy}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank">মেধা র‍্যাংকিং (১ থেকে N)</SelectItem>
                    <SelectItem value="roll">রোল নম্বর অনুযায়ী</SelectItem>
                    <SelectItem value="name">নাম অনুযায়ী</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">শিক্ষার্থী খুঁজুন</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    placeholder="রোল বা নাম..."
                    className="pl-8 h-9 text-xs bg-slate-50 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {modalExamIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-500" /> নির্বাচিত পরীক্ষা:
                </span>
                {modalExamIds.map(eId => {
                  const exObj = availableExams.find(e => String(e.id) === String(eId));
                  if (!exObj) return null;
                  return (
                    <span
                      key={eId}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200 shadow-2xs"
                    >
                      {exObj.title}
                      <button
                        type="button"
                        onClick={() => toggleExamSelection(eId)}
                        className="hover:text-red-700 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                        title="পরীক্ষা বাদ দিন"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={selectAllExams}
                  className="text-[10px] font-bold text-red-600 hover:underline ml-1"
                >
                  রিসেট (সকল পরীক্ষা দেখুন)
                </button>
              </div>
            )}
          </div>

          {classTeachersRanking.length > 0 && (
            <Card className="shadow-xs bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 rounded-2xl overflow-hidden border border-amber-200/70">
              <CardHeader className="border-b border-amber-100/80 p-4 flex flex-row items-center justify-between flex-wrap gap-2 bg-gradient-to-r from-amber-50/60 to-emerald-50/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-xs font-bold text-[#052E2B] uppercase tracking-wider">
                    {modalClassId !== "all" ? "এই ক্লাসের" : "শাখার"} শিক্ষকদের মেধা র‍্যাংকিং ও পারফরম্যান্স তুলনা ({classTeachersRanking.length} জন)
                  </CardTitle>
                  <span className="text-[10px] text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full font-extrabold border border-amber-300">
                    গড় নম্বর ও পাস হারের ভিত্তিতে নিরপেক্ষ র‍্যাংকিং
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  *শিক্ষার্থীর সংখ্যার তারতম্য নিরপেক্ষ করতে গড় প্রাপ্ত নম্বর, পাস হার % ও গড় GPA-র ভিত্তিতে এই মেধা তালিকা তৈরি করা হয়েছে।
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-100 text-slate-600 font-bold">
                        <th className="py-2.5 px-3 text-center w-14">স্থান (Rank)</th>
                        <th className="py-2.5 px-3 text-left">শিক্ষকের নাম</th>
                        <th className="py-2.5 px-3 text-center">মোট শিক্ষার্থী</th>
                        <th className="py-2.5 px-3 text-center">পরীক্ষায় অংশ</th>
                        <th className="py-2.5 px-3 text-center">পাস শিক্ষার্থী</th>
                        <th className="py-2.5 px-3 text-center">পাস হার (%)</th>
                        <th className="py-2.5 px-3 text-center">গড় নম্বর (প্রতি শিক্ষার্থী)</th>
                        <th className="py-2.5 px-3 text-center">গড় GPA</th>
                        <th className="py-2.5 px-3 text-center">পারফরম্যান্স রেটিং</th>
                        <th className="py-2.5 px-3 text-end">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classTeachersRanking.map((t) => {
                        const isCurrent = String(t.teacherId) === String(activeTeacher.id);
                        return (
                          <tr
                            key={t.teacherId}
                            className={`transition-colors ${
                              isCurrent
                                ? "bg-amber-100/60 font-semibold text-amber-950"
                                : "hover:bg-slate-50/80 text-slate-700"
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-extrabold">
                              {t.rank === 1 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-2xs">
                                  🥇 #1
                                </span>
                              ) : t.rank === 2 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 shadow-2xs">
                                  🥈 #2
                                </span>
                              ) : t.rank === 3 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-200 to-orange-300 text-amber-950 shadow-2xs">
                                  🥉 #3
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                                  #{t.rank}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                                  {t.teacherObj?.photo_url ? (
                                    <img src={t.teacherObj.photo_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Users className="h-3.5 w-3.5 text-slate-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs truncate">
                                    {t.teacherObj?.full_name_bn || t.teacherObj?.full_name_en || `Teacher #${t.teacherId}`}
                                    {isCurrent && (
                                      <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-[#052E2B] text-[#D4AF37] font-extrabold uppercase">
                                        নির্বাচিত
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{t.teacherObj?.designation || "শিক্ষক"}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{t.assignedCount} জন</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{t.appearedCount} জন</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{t.passedCount} জন</td>

                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                t.passRate >= 85 ? "bg-emerald-100 text-emerald-800" : t.passRate >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                              }`}>
                                {t.passRate.toFixed(1)}%
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span className="font-extrabold text-[#052E2B] text-xs">
                                {t.avgMarks.toFixed(1)}
                              </span>
                              <span className="text-[9.5px] text-slate-500 ml-1 font-normal">
                                ({t.avgPercentage.toFixed(1)}%)
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center font-bold text-indigo-900">
                              {t.avgGpa.toFixed(2)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${t.ratingColor}`}>
                                {t.ratingLabel}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-end">
                              {!isCurrent ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActiveTeacher(t.teacherObj)}
                                  className="h-7 text-[10px] font-bold bg-white hover:bg-slate-100 text-[#052E2B] border-slate-200 rounded-lg px-2.5"
                                >
                                  রেজাল্ট দেখুন →
                                </Button>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-extrabold px-2">✓ সক্রিয়</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">
                  শিক্ষকের শিক্ষার্থীদের মেধাতালিকা ও ফলাফল ({studentRows.length} জন)
                </CardTitle>
                <Badge className="bg-[#052E2B]/10 text-[#052E2B] hover:bg-[#052E2B]/20 font-bold text-[10px] rounded-lg">
                  ১ থেকে আলাদা র‍্যাংকিং
                </Badge>
                {isMultipleExams && (
                  <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-lg">
                    {activeTargetExams.length}টি পরীক্ষা যৌথ ফলাফল
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handlePrintTeacherResultSheet}
                  size="sm"
                  className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-8 px-3"
                >
                  <Printer className="h-3.5 w-3.5" /> রেজাল্ট শিট প্রিন্ট
                </Button>
                {studentRows.filter(r => r.hasResult).length > 0 && (
                  <Button
                    onClick={handlePrintTeacherAllCards}
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] gap-1.5 text-xs font-bold rounded-xl h-8 px-3 shadow-xs"
                  >
                    <FileText className="h-3.5 w-3.5" /> সকল কার্ড প্রিন্ট ({studentRows.filter(r => r.hasResult).length})
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {studentRows.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs">
                  কোনো শিক্ষার্থী বা ফলাফল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় দেখুন।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="py-3 px-4 text-center font-bold text-slate-600 w-16">র‍্যাংক</th>
                        <th className="py-3 px-4 text-left font-bold text-slate-600">শিক্ষার্থীর নাম</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">রোল / আইডি</th>
                        <th className="py-3 px-4 text-left font-bold text-slate-600">ক্লাস ও গ্রুপ</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "যৌথ প্রাপ্ত নম্বর" : "প্রাপ্ত নম্বর"}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "যৌথ GPA / গ্রেড" : "GPA / গ্রেড"}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "পরীক্ষা ও বিষয়" : "বিষয়ভিত্তিক"}
                        </th>
                        <th className="py-3 px-4 text-end font-bold text-slate-600">প্রিন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {studentRows.map((r) => {
                        const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                        const isExpanded = expandedStudentId === r.studentId;
                        return (
                          <React.Fragment key={r.studentId}>
                            <tr className={`hover:bg-slate-50/60 transition-colors ${r.cohortRank === 1 ? "bg-amber-50/20" : ""}`}>
                              <td className="py-3 px-4 text-center">
                                {renderCohortRankBadge(r.cohortRank)}
                              </td>

                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-800">{r.studentNameEn}</p>
                                <p className="text-[10px] text-slate-500">{r.studentNameBn}</p>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-700 text-[11px]">
                                  {r.rollNumber}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <p className="text-slate-700 font-semibold">{r.classLabel}</p>
                                <p className="text-[10px] text-slate-400">{r.groupLabel}</p>
                              </td>

                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  <div>
                                    <span className="font-extrabold text-slate-800 text-sm">{r.totalObtained}</span>
                                    <span className="text-[10px] text-slate-400"> / {r.totalFull}</span>
                                    {isMultipleExams && (
                                      <p className="text-[9px] text-amber-800 font-bold">
                                        ({r.participatedExamsCount}টি পরীক্ষা যৌথ)
                                      </p>
                                    )}
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${r.status === "pass" ? "bg-emerald-500" : "bg-red-400"}`}
                                        style={{ width: `${Math.min(100, r.percentage)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">এন্ট্রি বাকি</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  r.isQawmi ? (
                                    <span className="font-bold text-xs" style={{ color: r.status === "fail" ? "#cc0000" : "#006241" }}>
                                      {r.darajah}
                                    </span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="font-bold text-xs" style={{ color: gc.text }}>
                                        {r.status === "fail" ? "0.00" : r.gpa.toFixed(2)}
                                      </span>
                                      <span
                                        className="px-2 py-0.2 rounded-full font-bold text-[10px]"
                                        style={{ background: gc.bg, color: gc.text }}
                                      >
                                        {r.grade}
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  <Badge className={`text-[10px] font-bold ${
                                    r.status === "pass"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}>
                                    {r.status === "pass" ? "পাস (Pass)" : "ফেল (Fail)"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-slate-50 text-slate-400 text-[10px]">
                                    No Result
                                  </Badge>
                                )}
                              </td>

                              <td className="py-3 px-4 text-center">
                                {r.hasResult && r.examResults.length > 0 ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setExpandedStudentId(isExpanded ? null : r.studentId)}
                                    className="h-7 text-[10px] font-bold rounded-lg gap-1 text-teal-800 hover:bg-teal-50 px-2"
                                  >
                                    {isExpanded ? "লুকান" : isMultipleExams ? "পরীক্ষাভিত্তিক" : "নম্বর দেখুন"}
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </Button>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">—</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-end">
                                {r.singleExamResult ? (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handlePrintIndividual(r.singleExamResult)}
                                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#052E2B]"
                                    title="Print Transcript"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <span className="text-slate-300 text-xs px-2">—</span>
                                )}
                              </td>
                            </tr>

                            {isExpanded && r.hasResult && (
                              <tr className="bg-emerald-50/30">
                                <td colSpan={9} className="p-4">
                                  <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                      <p className="text-xs font-bold text-[#052E2B] flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                                        {r.studentNameEn} ({r.studentNameBn}) - এর পরীক্ষার বিস্তারিত ফলাফল
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-600">
                                          যৌথ মোট নম্বর: <strong className="text-teal-700">{r.totalObtained} / {r.totalFull}</strong> ({r.percentage.toFixed(1)}%)
                                        </span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {r.examResults.map((exRes, eIdx) => {
                                        const exGc = GRADE_COLORS[exRes.grade] || GRADE_COLORS["F"];
                                        return (
                                          <div key={eIdx} className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                                              <div>
                                                <p className="font-bold text-xs text-slate-800">{exRes.examTitle}</p>
                                                <p className="text-[9.5px] text-slate-400">{exRes.academicYear || "২০২৬"}</p>
                                              </div>
                                              <Badge className={`text-[9px] font-bold ${
                                                exRes.status === "pass" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                              }`}>
                                                {exRes.status === "pass" ? "পাস" : "ফেল"}
                                              </Badge>
                                            </div>

                                            <div className="flex items-center justify-between text-xs py-1">
                                              <span className="text-slate-500">প্রাপ্ত নম্বর:</span>
                                              <span className="font-extrabold text-slate-800">
                                                {exRes.totalObtained} <span className="text-[10px] text-slate-400">/ {exRes.totalFull}</span>
                                              </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs py-1">
                                              <span className="text-slate-500">GPA / গ্রেড:</span>
                                              <span className="font-extrabold" style={{ color: exGc.text }}>
                                                {exRes.isQawmi ? exRes.darajah : `${exRes.gpa.toFixed(2)} (${exRes.grade})`}
                                              </span>
                                            </div>

                                            {exRes.marksDetails && exRes.marksDetails.length > 0 && (
                                              <div className="pt-2 border-t border-slate-200/60 space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">বিষয়ভিত্তিক নম্বর:</p>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                  {exRes.marksDetails.map((sub, sIdx) => {
                                                    const isSubFail = Number(sub.obtained_marks) < Number(sub.pass_marks);
                                                    const subName = sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name || `Sub #${sIdx + 1}`;
                                                    return (
                                                      <div key={sIdx} className={`p-1.5 rounded-lg border text-center text-[10px] ${
                                                        isSubFail ? "bg-red-50 border-red-200 text-red-900 font-bold" : "bg-white border-slate-200 text-slate-700"
                                                      }`}>
                                                        <p className="truncate font-semibold">{subName}</p>
                                                        <p className="font-bold mt-0.5" style={{ color: isSubFail ? "#dc2626" : "#052E2B" }}>
                                                          {sub.obtained_marks || 0} <span className="text-[8.5px] text-slate-400">/ {sub.full_marks || 100}</span>
                                                        </p>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-slate-100/90 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-b-3xl">
          <div className="text-xs text-slate-500">
            শিক্ষক: <strong>{activeTeacher.full_name_bn || activeTeacher.full_name_en}</strong> | 
            {currentTeacherClassRank ? ` এই ক্লাসে স্থান: #${currentTeacherClassRank.rank} (মোট ${classTeachersRanking.length} জনের মধ্যে) | ` : ""}
            {modalExamIds.length === 0 ? " সকল পরীক্ষার ফলাফল" : ` নির্বাচিত পরীক্ষা: ${modalExamIds.length}টি`} | 
            মোট শিক্ষার্থী: <strong>{allTeacherStudents.length} জন</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrintTeacherResultSheet}
              className="bg-[#052E2B] hover:bg-[#031c1a] text-white text-xs font-bold rounded-xl h-9 px-4 gap-1.5"
            >
              <Printer className="h-4 w-4" /> রেজাল্ট শিট প্রিন্ট
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl h-9 px-4"
            >
              বন্ধ করুন (Close)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
