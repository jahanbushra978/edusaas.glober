"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import TeacherAssignedResultsDialog from "../TeacherAssignedResultsDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  GraduationCap,
  FileText,
  Users,
  BarChart3,
  Trophy,
  Search,
  Printer,
} from "lucide-react";
import {
  calcQawmiDarajah,
  findStudentInList,
  GRADE_COLORS,
} from "./examCalculations";
import {
  getPrintableMarksheetHTML,
  printResultSheet,
} from "./examMarksheetPrint";
import {
  isStudentInClassOption,
  isStudentAssignedToTeacher,
  getStudentAssignedTeacher,
  resolveAcademicDisplayName,
} from "@/lib/academic";

export default function AdminResultDashboard({ branches, exams, students, teachers = [], settings, currentUser }) {
  const isSuperAdmin = currentUser?.role !== "branch_admin";

  // ── Single-branch states (used by branch_admin and super admin when in single mode) ──
  const [selBranchId, setSelBranchId] = useState("all");
  const [selTeacherId, setSelTeacherId] = useState("all"); // Feature 1: optional teacher filter
  const [teacherAssignedModal, setTeacherAssignedModal] = useState(null); // { teacher, initialExamId, initialClassId }

  // ── Super Admin multi-branch states (Feature 2) ──
  const [multiMode, setMultiMode] = useState(false); // toggle between single & multi-branch view
  const [selBranchIds, setSelBranchIds] = useState([]); // array of selected branch IDs

  React.useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      setSelBranchId(String(currentUser.branch_id));
    }
  }, [currentUser]);
  const [selClassId, setSelClassId] = useState("all");
  const [selGroupId, setSelGroupId] = useState("all");
  const [selExamId, setSelExamId] = useState("all");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setSelGroupId("all");
    setSelTeacherId("all");
  }, [selClassId]);

  React.useEffect(() => {
    setSelTeacherId("all");
  }, [selBranchId]);

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["admin-dashboard-results"],
    queryFn: () => appClient.entities.ExamResult.listAll({ sort: "id" }),
  });

  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  const flatClassOptions = React.useMemo(() => getFlatClassOptions(classes), [classes]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === selClassId);
  const classIdForExams = selectedFlatClass?.classId || selClassId;

  const groupOptions = React.useMemo(() => {
    if (selClassId === "all" || !selectedFlatClass) return [];
    const classObj = classes.find(c => String(c.id) === String(selectedFlatClass.classId));
    if (classObj && Array.isArray(classObj.groups)) {
      return classObj.groups.map(g => ({
        value: String(g.id),
        label: g.group_name?.bn || g.group_name?.en || String(g.id)
      }));
    }
    return [];
  }, [selectedFlatClass, classes, selClassId]);

  // Filter list of exams based on branch and class
  const filteredExams = exams.filter(e => {
    const bMatch = selBranchId === "all" || String(e.branch_id) === String(selBranchId);
    const cMatch = selClassId === "all" || String(e.class_id) === String(classIdForExams);
    return bMatch && cMatch;
  });

  // ── Feature 1: Teacher options for selected branch + class ──
  const teacherOptions = React.useMemo(() => {
    if (selBranchId === "all") return teachers;
    const branchTeachers = teachers.filter(t => String(t.branch_id) === String(selBranchId));
    if (selClassId === "all") return branchTeachers;

    const branchStudents = students.filter(s => String(s.branch_id) === String(selBranchId));
    const classStudents = branchStudents.filter(s => 
      isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure) ||
      String(s.class_id) === String(selClassId) ||
      String(s.class_id) === String(classIdForExams)
    );

    const classLabel = (selectedFlatClass?.label || "").toLowerCase().trim();
    const classNamesToMatch = [
      classLabel,
      (selectedFlatClass?.className || "").toLowerCase().trim(),
      (selectedFlatClass?.sectionName || "").toLowerCase().trim(),
      String(selClassId).toLowerCase().trim(),
      String(classIdForExams).toLowerCase().trim()
    ].filter(Boolean);

    // Only teachers who teach or have assigned students in this specific class
    return branchTeachers.filter(t => {
      // 1. Direct assigned students in this class
      if (classStudents.some(s => isStudentAssignedToTeacher(s, t))) {
        return true;
      }
      // 2. Teacher assigned_batches (which stores class names/batches assigned to this teacher)
      if (t.assigned_batches) {
        const teacherBatches = String(t.assigned_batches)
          .split(",")
          .map(b => b.trim().toLowerCase())
          .filter(Boolean);

        if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) {
          return true;
        }

        const isBatchMatch = teacherBatches.some(tb =>
          classNamesToMatch.some(cn => cn === tb || cn.includes(tb) || tb.includes(cn))
        );
        if (isBatchMatch) return true;
      }
      // 3. Department or Classes array match
      const tDept = (t.department || "").toLowerCase().trim();
      if (tDept && classNamesToMatch.some(cn => cn === tDept || cn.includes(tDept) || tDept.includes(cn))) {
        return true;
      }

      return false;
    });
  }, [selBranchId, selClassId, students, teachers, selectedBranch, selectedFlatClass, classIdForExams]);

  const selectedTeacher = teachers.find(t => String(t.id) === String(selTeacherId));

  // ── Core result enrichment + filtering (single-branch mode) ──
  const enrichResult = React.useCallback((r) => {
    const allMarksDetails = Array.isArray(r.marks_details) ? r.marks_details : [];
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    const branchObj = branches.find(b => String(b.id) === String(r.branch_id));
    const activeSubjectIds = (() => {
      if (!examObj || !branchObj) return null;
      const structure = branchObj.academic_structure || [];
      const cls = structure.find(c => String(c.id) === String(examObj.class_id));
      if (!cls) return null;
      let activeSubs = [];
      if (examObj.session_id && Array.isArray(cls.sections)) {
        const sec = cls.sections.find(s => String(s.id) === String(examObj.session_id));
        if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) activeSubs = sec.subjects;
      }
      if (activeSubs.length === 0 && examObj.class_group_id && Array.isArray(cls.groups)) {
        const grp = cls.groups.find(g => String(g.id) === String(examObj.class_group_id));
        if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) activeSubs = grp.subjects;
      }
      if (activeSubs.length === 0 && Array.isArray(cls.subjects)) activeSubs = cls.subjects;
      return activeSubs.length > 0 ? new Set(activeSubs.map(s => String(s.id))) : null;
    })();
    const marksDetails = activeSubjectIds
      ? allMarksDetails.filter(m => activeSubjectIds.has(String(m.subject_id)))
      : allMarksDetails;
    const tFull = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
    const tObt  = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
    const isFailed = marksDetails.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
    const overallPct = tFull > 0 ? (tObt / tFull) * 100 : 0;
    const overallGpa = isFailed ? 0 : (
      overallPct >= 80 ? 5.0 : overallPct >= 70 ? 4.0 : overallPct >= 60 ? 3.5 :
      overallPct >= 50 ? 3.0 : overallPct >= 40 ? 2.0 : overallPct >= 33 ? 1.0 : 0
    );
    const overallGrade = isFailed ? "F" : (
      overallPct >= 80 ? "A+" : overallPct >= 70 ? "A" : overallPct >= 60 ? "A-" :
      overallPct >= 50 ? "B"  : overallPct >= 40 ? "C" : overallPct >= 33 ? "D" : "F"
    );
    return { ...r, total_full_marks: tFull, total_obtained_marks: tObt, gpa: overallGpa, grade: overallGrade, status: isFailed ? "fail" : "pass" };
  }, [exams, branches]);

  const meritSort = (a, b) => {
    const sA = a.status === "pass" ? 1 : 0;
    const sB = b.status === "pass" ? 1 : 0;
    if (sA !== sB) return sB - sA;
    if ((a.total_obtained_marks || 0) !== (b.total_obtained_marks || 0))
      return (b.total_obtained_marks || 0) - (a.total_obtained_marks || 0);
    return (b.gpa || 0) - (a.gpa || 0);
  };

  const findStudentForResult = React.useCallback((r) => {
    if (!r || r.student_id === undefined || r.student_id === null) return null;
    const targetId = String(r.student_id).trim();
    return students.find(s =>
      String(s.id).trim() === targetId ||
      (s.student_id && String(s.student_id).trim() === targetId) ||
      (s.roll_number && String(s.roll_number).trim() === targetId)
    ) || null;
  }, [students]);

  // ── Single-branch filtered results ──
  const filteredResults = results.map(enrichResult).filter(r => {
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    if (!examObj) return false;
    const student = findStudentForResult(r);
    const branchId = r.branch_id || student?.branch_id || examObj.branch_id;
    const branchObj = branches.find(b => String(b.id) === String(branchId));

    if (selExamId !== "all" && String(r.exam_id) !== String(selExamId)) return false;
    if (selBranchId !== "all" && String(branchId) !== String(selBranchId)) return false;

    if (selClassId !== "all") {
      const classMatch =
        (examObj && (String(examObj.class_id) === String(selClassId) || String(examObj.class_id) === String(classIdForExams))) ||
        (student && isStudentInClassOption(student, selClassId, branchObj?.academic_structure)) ||
        (student && String(student.class_id) === String(selClassId)) ||
        (student && student.class_name && String(student.class_name).toLowerCase().includes(String(selClassId).toLowerCase()));
      if (!classMatch) return false;
    }

    if (selGroupId !== "all" && student && String(student.class_group_id) !== String(selGroupId) && String(examObj.class_group_id) !== String(selGroupId)) return false;

    // Feature 1: Teacher filter (optional) — only students assigned to this teacher
    if (selTeacherId !== "all" && selectedTeacher) {
      if (!student) return false;
      if (!isStudentAssignedToTeacher(student, selectedTeacher)) return false;
    }

    const q = search.toLowerCase().trim();
    if (!q) return true;
    const studentNameEn = student?.full_name_en?.toLowerCase() || "";
    const studentNameBn = student?.full_name_bn?.toLowerCase() || "";
    const studentRoll = student?.roll_number?.toLowerCase() || "";
    const studentPkId = String(student?.id || "").toLowerCase();
    const studentCodeId = String(student?.student_id || "").toLowerCase();
    const resultStudentId = String(r.student_id || "").toLowerCase();

    return (
      studentNameEn.includes(q) ||
      studentNameBn.includes(q) ||
      studentRoll.includes(q) ||
      studentPkId.includes(q) ||
      studentCodeId.includes(q) ||
      resultStudentId.includes(q)
    );
  }).sort(meritSort).map((r, i) => ({ ...r, liveRank: i + 1 }));

  // ── Teacher info card data (Feature 1) ──
  const teacherTotalAssignedCount = React.useMemo(() => {
    if (selTeacherId === "all" || !selectedTeacher) return 0;
    return students.filter(s => {
      const isAssigned = isStudentAssignedToTeacher(s, selectedTeacher);
      const isActive = !s.status || s.status.toLowerCase() === "active";
      return isAssigned && isActive;
    }).length;
  }, [selTeacherId, selectedTeacher, students]);

  const teacherStudentCount = React.useMemo(() => {
    if (selTeacherId === "all" || !selectedTeacher) return 0;
    return filteredResults.length;
  }, [selTeacherId, selectedTeacher, filteredResults.length]);

  // ── Summary stats ──
  const totalEntered  = filteredResults.length;
  const passedCount   = filteredResults.filter(r => r.status === "pass").length;
  const failedCount   = filteredResults.filter(r => r.status === "fail").length;
  const passRate      = totalEntered > 0 ? (passedCount / totalEntered) * 100 : 0;
  const topPerformers = [...filteredResults].filter(r => r.status === "pass").sort((a, b) => (b.gpa || 0) - (a.gpa || 0)).slice(0, 5);

  const selectedExamForDisplay = selExamId !== "all" ? exams.find(e => String(e.id) === String(selExamId)) : null;
  const isQawmiDashboard = (selectedExamForDisplay?.result_system || "general") === "qawmi";

  // ────────────────────────────────────────────────────────────
  // Feature 2 — Super Admin Multi-Branch helpers
  // ────────────────────────────────────────────────────────────
  const toggleBranchInMulti = (branchId) => {
    setSelBranchIds(prev =>
      prev.includes(String(branchId))
        ? prev.filter(id => id !== String(branchId))
        : [...prev, String(branchId)]
    );
  };

  // Multi-branch: exam options when multiple branches selected
  const multiBranchExams = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return exams.filter(e => selBranchIds.includes(String(e.branch_id)));
  }, [multiMode, selBranchIds, exams]);

  const [multiSelClassIds, setMultiSelClassIds] = useState([]);
  const [multiSelExamIds, setMultiSelExamIds] = useState([]);
  const [multiSelTeacherIds, setMultiSelTeacherIds] = useState([]);
  const [multiLimitCount, setMultiLimitCount] = useState("10"); // "10" | "25" | "50" | "all"

  const toggleMultiClass = (classId) => {
    if (classId === "all") {
      setMultiSelClassIds([]);
      return;
    }
    setMultiSelClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleMultiExam = (examId) => {
    if (examId === "all") {
      setMultiSelExamIds([]);
      return;
    }
    setMultiSelExamIds(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const toggleMultiTeacher = (teacherId) => {
    if (teacherId === "all") {
      setMultiSelTeacherIds([]);
      return;
    }
    setMultiSelTeacherIds(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // Multi-branch: common class names across selected branches
  const multiClassOptions = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    const seen = new Map();
    selBranchIds.forEach(bId => {
      const branch = branches.find(b => String(b.id) === bId);
      (branch?.academic_structure || []).forEach(c => {
        const name = typeof c.class_name === "string" 
          ? c.class_name 
          : (c.class_name?.bn || c.class_name?.en || c.class_name?.ar || "");
        if (name && !seen.has(name)) seen.set(name, { id: c.id, label: name });
      });
    });
    return [...seen.values()];
  }, [multiMode, selBranchIds, branches]);

  // Multi-branch: teacher options across selected branches & classes
  const multiTeachers = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    const branchTeachers = teachers.filter(t => selBranchIds.includes(String(t.branch_id)));
    if (multiSelClassIds.length === 0) return branchTeachers;

    const classMatchedStudents = students.filter(s => {
      if (!selBranchIds.includes(String(s.branch_id))) return false;
      return multiSelClassIds.some(cid => {
        const cOpt = multiClassOptions.find(o => o.id === cid);
        const matchLabel = (cOpt?.label || "").toLowerCase().trim();
        const sClass = (s.class_name || "").toLowerCase().trim();
        const sBatch = (s.batch || "").toLowerCase().trim();
        return (sClass && sClass.includes(matchLabel)) || (sBatch && sBatch.includes(matchLabel)) || String(s.class_id) === String(cid);
      });
    });

    const selectedClassLabels = multiSelClassIds.map(cid => {
      const cOpt = multiClassOptions.find(o => o.id === cid);
      return (cOpt?.label || "").toLowerCase().trim();
    }).filter(Boolean);

    return branchTeachers.filter(t => {
      if (classMatchedStudents.some(s => isStudentAssignedToTeacher(s, t))) {
        return true;
      }
      if (t.assigned_batches) {
        const teacherBatches = String(t.assigned_batches)
          .split(",")
          .map(b => b.trim().toLowerCase())
          .filter(Boolean);
        if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) return true;
        if (teacherBatches.some(tb => selectedClassLabels.some(cl => cl === tb || cl.includes(tb) || tb.includes(cl)))) {
          return true;
        }
      }
      return false;
    });
  }, [multiMode, selBranchIds, teachers, multiSelClassIds, multiClassOptions, students]);

  // Multi-branch enriched + filtered results
  const multiBranchResults = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return results.map(enrichResult).filter(r => {
      const examObj = exams.find(e => String(e.id) === String(r.exam_id));
      if (!examObj) return false;
      const student = findStudentForResult(r);
      const branchId = r.branch_id || student?.branch_id || examObj.branch_id;
      if (!selBranchIds.includes(String(branchId))) return false;

      // Multi-Exam filter
      if (multiSelExamIds.length > 0 && !multiSelExamIds.includes(String(r.exam_id))) return false;

      // Multi-Teacher filter
      if (multiSelTeacherIds.length > 0) {
        if (!student) return false;
        const isMatchedTeacher = multiSelTeacherIds.some(tId => {
          const tObj = teachers.find(t => String(t.id) === String(tId));
          return tObj && isStudentAssignedToTeacher(student, tObj);
        });
        if (!isMatchedTeacher) return false;
      }

      // Multi-Class filter
      if (multiSelClassIds.length > 0) {
        const isMatchedClass = multiSelClassIds.some(cid => {
          const classNameMatch = multiClassOptions.find(o => o.id === cid);
          if (!classNameMatch) return false;
          const matchLabel = (classNameMatch.label || "").toLowerCase().trim();
          const branchObj = branches.find(b => String(b.id) === String(branchId));

          const studentClassName = (student?.class_name || "").toLowerCase().trim();
          const studentBatch = (student?.batch || "").toLowerCase().trim();
          const studentDept = (student?.department || student?.session || "").toLowerCase().trim();
          const examClassName = (resolveAcademicDisplayName(examObj.class_id, examObj.session_id, examObj.class_group_id, branchObj?.academic_structure, 'bn') || "").toLowerCase().trim();

          const directMatch = (studentClassName && (studentClassName === matchLabel || studentClassName.includes(matchLabel))) ||
                              (studentBatch && (studentBatch === matchLabel || studentBatch.includes(matchLabel))) ||
                              (studentDept && (studentDept === matchLabel || studentDept.includes(matchLabel))) ||
                              (examClassName && (examClassName === matchLabel || examClassName.includes(matchLabel))) ||
                              String(examObj.class_id) === String(cid);
          if (directMatch) return true;

          if (student) {
            const branchCls = (branchObj?.academic_structure || []).find(c => {
              const name = typeof c.class_name === "string"
                ? c.class_name
                : (c.class_name?.bn || c.class_name?.en || c.class_name?.ar || "");
              return name.toLowerCase().trim() === matchLabel;
            });
            if (branchCls && isStudentInClassOption(student, branchCls.id, branchObj?.academic_structure)) {
              return true;
            }
          }
          return false;
        });
        if (!isMatchedClass) return false;
      }

      return true;
    }).sort(meritSort).map((r, i) => ({ ...r, combinedRank: i + 1 }));
  }, [multiMode, selBranchIds, results, exams, students, branches, multiSelExamIds, multiSelClassIds, multiSelTeacherIds, multiClassOptions, enrichResult, findStudentForResult, teachers]);

  // Branch-wise fair ranking (Feature 2b - normalized by pass rate & avg marks per student)
  const branchRanking = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return selBranchIds.map(bId => {
      const branch = branches.find(b => String(b.id) === bId);
      const branchRes = multiBranchResults.filter(r => {
        const s = findStudentForResult(r);
        return (s && String(s.branch_id) === bId) || String(r.branch_id) === bId;
      });
      const total   = branchRes.length;
      const passed  = branchRes.filter(r => r.status === "pass").length;
      const totalGpa = branchRes.reduce((s, r) => s + (r.gpa || 0), 0);
      const avgMarks = total > 0 ? branchRes.reduce((s, r) => s + (r.total_obtained_marks || 0), 0) / total : 0;
      const passRate = total > 0 ? (passed / total) * 100 : 0;
      const avgGpa   = total > 0 ? totalGpa / total : 0;
      return { branchId: bId, branchName: branch?.name_bn || branch?.name_en || bId, total, passed, avgMarks, passRate, avgGpa };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((b, i) => ({ ...b, rank: i + 1 }));
  }, [multiMode, selBranchIds, multiBranchResults, branches, findStudentForResult]);

  // Teacher-wise fair ranking (Feature 2c - normalized by pass rate & avg marks per student)
  const teacherRanking = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];

    const teacherMap = new Map();

    multiBranchResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;
      
      const assignedTeacher = getStudentAssignedTeacher(s, teachers);
      if (!assignedTeacher) return;

      const tId = String(assignedTeacher.id);
      
      if (!teacherMap.has(tId)) {
        const tName = assignedTeacher.full_name_bn || assignedTeacher.full_name_en || `Teacher #${tId}`;
        teacherMap.set(tId, {
          teacherId: tId,
          teacherName: tName,
          total: 0,
          passed: 0,
          totalObtained: 0,
          totalGpa: 0,
        });
      }

      const stat = teacherMap.get(tId);
      stat.total += 1;
      if (r.status === "pass") stat.passed += 1;
      stat.totalObtained += Number(r.total_obtained_marks || 0);
      stat.totalGpa += Number(r.gpa || 0);
    });

    return Array.from(teacherMap.values()).map(t => {
      const avgMarks = t.total > 0 ? t.totalObtained / t.total : 0;
      const passRate = t.total > 0 ? (t.passed / t.total) * 100 : 0;
      const avgGpa   = t.total > 0 ? t.totalGpa / t.total : 0;
      return {
        ...t,
        avgMarks,
        passRate,
        avgGpa
      };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((t, i) => ({ ...t, rank: i + 1 }));
  }, [multiMode, selBranchIds, teachers, multiBranchResults, findStudentForResult]);

  // Group-wise fair ranking (normalized by pass rate & avg marks per student)
  const groupRanking = React.useMemo(() => {
    const targetResults = multiMode ? multiBranchResults : filteredResults;
    if (!targetResults.length) return [];

    const groupMap = new Map();

    targetResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;

      const br = branches.find(b => String(b.id) === String(s.branch_id));
      const groupName = s.class_group_id
        ? (resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, br?.academic_structure, 'bn') || `Group ${s.class_group_id}`)
        : (s.session || s.batch || "General Group");

      const gKey = `${s.branch_id || 'global'}:${groupName}`;

      if (!groupMap.has(gKey)) {
        groupMap.set(gKey, {
          gKey,
          groupName,
          branchName: br?.name_bn || br?.name_en || "Branch",
          total: 0,
          passed: 0,
          totalObtained: 0,
          totalGpa: 0,
        });
      }

      const gStat = groupMap.get(gKey);
      gStat.total += 1;
      if (r.status === "pass") gStat.passed += 1;
      gStat.totalObtained += Number(r.total_obtained_marks || 0);
      gStat.totalGpa += Number(r.gpa || 0);
    });

    return Array.from(groupMap.values()).map(g => {
      const avgMarks = g.total > 0 ? g.totalObtained / g.total : 0;
      const passRate = g.total > 0 ? (g.passed / g.total) * 100 : 0;
      const avgGpa   = g.total > 0 ? g.totalGpa / g.total : 0;
      return { ...g, avgMarks, passRate, avgGpa };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((g, i) => ({ ...g, rank: i + 1 }));
  }, [multiMode, multiBranchResults, filteredResults, branches, findStudentForResult]);

  // Single-branch teacher rank calculation (fair & normalized by student averages)
  const singleBranchTeacherRank = React.useMemo(() => {
    if (selBranchId === "all" || selTeacherId === "all" || !selectedTeacher) return null;
    const branchResults = results.map(enrichResult).filter(r => {
      const s = findStudentForResult(r);
      const bId = r.branch_id || s?.branch_id;
      if (String(bId) !== String(selBranchId)) return false;
      if (selClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(bId));
        const isMatch = isStudentInClassOption(s, selClassId, b?.academic_structure) ||
          String(s?.class_id) === String(selClassId) ||
          (s?.class_name && String(s.class_name).toLowerCase().includes(String(selClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      if (selExamId !== "all" && String(r.exam_id) !== String(selExamId)) return false;
      return true;
    });

    const teacherMap = new Map();
    branchResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;
      const t = getStudentAssignedTeacher(s, teachers);
      if (!t) return;
      const tId = String(t.id);
      if (!teacherMap.has(tId)) {
        teacherMap.set(tId, { teacherId: tId, total: 0, passed: 0, totalObtained: 0, totalFull: 0, totalGpa: 0 });
      }
      const st = teacherMap.get(tId);
      st.total += 1;
      if (r.status === "pass") st.passed += 1;
      st.totalObtained += Number(r.total_obtained_marks || 0);
      st.totalFull += Number(r.total_full_marks || 0);
      st.totalGpa += Number(r.gpa || 0);
    });

    const ranks = Array.from(teacherMap.values()).map(t => ({
      ...t,
      avgMarks: t.total > 0 ? t.totalObtained / t.total : 0,
      avgPercentage: t.totalFull > 0 ? (t.totalObtained / t.totalFull) * 100 : 0,
      passRate: t.total > 0 ? (t.passed / t.total) * 100 : 0,
      avgGpa: t.total > 0 ? t.totalGpa / t.total : 0,
      totalTeachersInScope: teacherMap.size,
    })).sort((a, b) => {
      if (Math.abs(b.passRate - a.passRate) > 0.01) return b.passRate - a.passRate;
      if (Math.abs(b.avgPercentage - a.avgPercentage) > 0.01) return b.avgPercentage - a.avgPercentage;
      if (Math.abs(b.avgMarks - a.avgMarks) > 0.01) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((t, i) => ({ ...t, rank: i + 1 }));

    return ranks.find(t => String(t.teacherId) === String(selTeacherId)) || null;
  }, [selBranchId, selClassId, selTeacherId, selectedTeacher, results, selExamId, teachers, branches, enrichResult, findStudentForResult]);

  // Print handlers
  const handleDownloadSheet = () => {
    if (selBranchId === "all" || selClassId === "all" || selExamId === "all") {
      return toast.error("Please select a specific Branch, Class, and Exam to print Class Result Sheet");
    }
    const branchObj = branches.find(b => String(b.id) === String(selBranchId));
    const examObj   = exams.find(e => String(e.id) === String(selExamId));
    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(examObj?.class_id, examObj?.session_id, examObj?.class_group_id, structure, 'bn') ||
        selectedFlatClass?.label || "Class";
    })();
    const activeSubjectsForPDF = (() => {
      const structure = branchObj?.academic_structure || [];
      const cls = structure.find(c => String(c.id) === String(examObj?.class_id));
      if (!cls) return [];
      if (examObj?.session_id && Array.isArray(cls.sections)) {
        const sec = cls.sections.find(s => String(s.id) === String(examObj.session_id));
        if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) return sec.subjects;
      }
      if (examObj?.class_group_id && Array.isArray(cls.groups)) {
        const grp = cls.groups.find(g => String(g.id) === String(examObj.class_group_id));
        if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) return grp.subjects;
      }
      return Array.isArray(cls.subjects) ? cls.subjects : [];
    })();
    printResultSheet(branchObj, classNameVal, examObj, filteredResults, students, settings, activeSubjectsForPDF, examObj?.result_system || "general");
  };

  const handlePrintIndividual = (r) => {
    const student   = findStudentInList(r, students);
    const examObj   = exams.find(e => String(e.id) === String(r.exam_id));
    const branchObj = branches.find(b => String(b.id) === String(r.branch_id || student?.branch_id));
    const flatOptions   = branchObj ? getFlatClassOptions(branchObj.academic_structure) : [];
    const resultFlatClass = flatOptions.find(o => o.id === r.class_id);
    const resultClassId   = resultFlatClass?.classId || r.class_id;
    const classObj        = branchObj?.academic_structure?.find(c => c.id === resultClassId);
    if (!student || !examObj) return toast.error("Incomplete data for print");
    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, structure, 'bn') ||
        student.class_name || resultFlatClass?.label ||
        classObj?.class_name?.bn || classObj?.class_name?.en || "Class";
    })();
    const html = getPrintableMarksheetHTML(student, branchObj, classNameVal, examObj, r, settings);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintAllTranscripts = () => {
    if (!filteredResults || filteredResults.length === 0) return toast.error("No results available to print");
    const pagesHtml = filteredResults.map((r) => {
      const student   = findStudentInList(r, students);
      if (!student) return "";
      const examObj   = exams.find(e => String(e.id) === String(r.exam_id));
      const branchObj = branches.find(b => String(b.id) === String(r.branch_id || student?.branch_id));
      const flatOptions     = branchObj ? getFlatClassOptions(branchObj.academic_structure) : [];
      const resultFlatClass = flatOptions.find(o => o.id === r.class_id);
      const resultClassId   = resultFlatClass?.classId || r.class_id;
      const classObj        = branchObj?.academic_structure?.find(c => c.id === resultClassId);
      const classNameVal = (() => {
        const structure = branchObj?.academic_structure || [];
        return resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, structure, 'bn') ||
          student.class_name || resultFlatClass?.label ||
          classObj?.class_name?.bn || classObj?.class_name?.en || "Class";
      })();
      const innerContent = getPrintableMarksheetInnerContent(student, branchObj, classNameVal, examObj, r, settings, null, examObj?.result_system || "general");
      return `<div class="transcript-page">${innerContent}</div>`;
    }).filter(Boolean).join("");
    if (!pagesHtml) return toast.error("Could not generate transcripts for selected items");
    const fullDoc = getFullTranscriptDocumentHTML(pagesHtml, `All Result Cards (${filteredResults.length})`);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(fullDoc);
    printWindow.document.close();
  };

  // ── Rank badge helper ──
  const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm ring-2 ring-amber-400">🥇 1st</span>;
    if (rank === 2) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 shadow-sm ring-2 ring-slate-400">🥈 2nd</span>;
    if (rank === 3) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-200 to-amber-200 text-orange-900 shadow-sm ring-2 ring-orange-300">🥉 3rd</span>;
    if (rank <= 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">🎖️ #{rank}</span>;
    return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-500">{rank}</span>;
  };

  return (
    <div className="space-y-6">

      {/* ── Feature 2: Super Admin Multi-Branch Toggle ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-[#052E2B]/5 to-[#D4AF37]/10 border border-[#052E2B]/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#052E2B] flex items-center justify-center shrink-0">
              <Building2 className="h-4.5 w-4.5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#052E2B]">Multi-Branch Comparison</p>
              <p className="text-[10px] text-slate-500">একাধিক Branch-এর Result একসাথে তুলনা করুন — শুধুমাত্র Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => { setMultiMode(v => !v); setSelBranchIds([]); setMultiSelClassIds([]); setMultiSelExamIds([]); setMultiSelTeacherIds([]); }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shrink-0 ${multiMode ? "bg-[#052E2B]" : "bg-slate-300"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${multiMode ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MULTI-BRANCH MODE (Feature 2 — Super Admin only)
      ══════════════════════════════════════════════════════════ */}
      {isSuperAdmin && multiMode && (
        <div className="space-y-6">
          {/* Branch Selector */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#D4AF37]" /> Branch নির্বাচন করুন
            </h3>
            <div className="flex flex-wrap gap-2">
              {branches.map(b => {
                const isSelected = selBranchIds.includes(String(b.id));
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleBranchInMulti(b.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-[#052E2B] text-white border-[#052E2B] shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                    }`}
                  >
                    {isSelected && <span className="text-[#D4AF37]">✓</span>}
                    {b.name_bn || b.name_en}
                  </button>
                );
              })}
            </div>
            {selBranchIds.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                {/* Multi-Class Selector Pills */}
                {multiClassOptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-[#052E2B]" /> Class নির্বাচন করুন (একাধিক নির্বাচনযোগ্য)
                      </span>
                      {multiSelClassIds.length > 0 && (
                        <button onClick={() => setMultiSelClassIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Class দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelClassIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelClassIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Class (All)
                      </button>
                      {multiClassOptions.map(o => {
                        const isSel = multiSelClassIds.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() => toggleMultiClass(o.id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-600"
                            }`}
                          >
                            {isSel && <span className="text-[#D4AF37]">✓</span>}
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-Exam Selector Pills */}
                {multiBranchExams.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#052E2B]" /> Exam নির্বাচন করুন (একাধিক পরীক্ষা তুলনা)
                      </span>
                      {multiSelExamIds.length > 0 && (
                        <button onClick={() => setMultiSelExamIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Exam দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelExamIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelExamIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Exam (All)
                      </button>
                      {multiBranchExams.map(e => {
                        const isSel = multiSelExamIds.includes(String(e.id));
                        const b = (branches || []).find(br => String(br.id) === String(e.branch_id));
                        const classLabel = resolveAcademicDisplayName(
                          e.class_id,
                          e.session_id,
                          e.class_group_id,
                          b?.academic_structure,
                          'bn'
                        );
                        return (
                          <button
                            key={e.id}
                            onClick={() => toggleMultiExam(String(e.id))}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-amber-600"
                            }`}
                          >
                            {isSel && <span className="text-white">✓</span>}
                            <span>{e.title}</span>
                            {classLabel && <span className="text-[10px] opacity-85 font-semibold">({classLabel})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-Teacher Selector Pills */}
                {multiTeachers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#052E2B]" /> Teacher নির্বাচন করুন (একাধিক শিক্ষক তুলনা)
                      </span>
                      {multiSelTeacherIds.length > 0 && (
                        <button onClick={() => setMultiSelTeacherIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Teacher দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelTeacherIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelTeacherIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Teacher (All)
                      </button>
                      {multiTeachers.map(t => {
                        const isSel = multiSelTeacherIds.includes(String(t.id));
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleMultiTeacher(String(t.id))}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-[#052E2B] text-white border-[#052E2B] shadow-sm ring-2 ring-[#D4AF37]/50"
                                : "bg-white text-slate-700 border-slate-200 hover:border-[#052E2B]"
                            }`}
                          >
                            {isSel && <span className="text-[#D4AF37]">✓</span>}
                            {t.full_name_bn || t.full_name_en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selBranchIds.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 italic text-sm">
              উপরে কমপক্ষে ২টি Branch নির্বাচন করুন তুলনা দেখতে।
            </div>
          )}

          {selBranchIds.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "মোট Result", value: multiBranchResults.length, color: "text-[#052E2B]" },
                  { label: "Pass", value: multiBranchResults.filter(r => r.status === "pass").length, color: "text-emerald-600" },
                  { label: "Fail", value: multiBranchResults.filter(r => r.status === "fail").length, color: "text-red-600" },
                  { label: "Branch নির্বাচিত", value: selBranchIds.length, color: "text-[#D4AF37]" },
                ].map(c => (
                  <Card key={c.label} className="border-0 shadow-sm bg-white rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{c.label}</span>
                    <span className={`text-2xl font-extrabold block mt-1 ${c.color}`}>{c.value}</span>
                  </Card>
                ))}
              </div>

              {/* Feature 2b: Branch-wise Ranking */}
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-5">
                  <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#D4AF37]" /> Branch-wise Overall Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {branchRanking.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 italic text-xs">কোনো Result পাওয়া যায়নি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {branchRanking.map(b => (
                            <tr key={b.branchId} className="hover:bg-slate-50/30">
                              <td className="py-3 px-4"><RankBadge rank={b.rank} /></td>
                              <td className="py-3 px-4 font-bold text-slate-800">{b.branchName}</td>
                              <td className="py-3 px-4 text-center text-slate-600">{b.total}</td>
                              <td className="py-3 px-4 text-center text-emerald-600 font-bold">{b.passed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${b.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : b.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                  {b.passRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{b.avgMarks.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feature 2c: Teacher-wise Ranking (class নির্বাচিত থাকলে) */}
              {multiSelClassIds.length > 0 && (
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-5">
                    <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#D4AF37]" /> Teacher-wise Ranking
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">
                        {multiSelClassIds.length === 1 
                          ? `${multiClassOptions.find(o => o.id === multiSelClassIds[0])?.label || "Class"} Class` 
                          : `${multiSelClassIds.length} Classes`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {teacherRanking.length === 0 ? (
                      <p className="py-8 text-center text-slate-400 italic text-xs">এই Class-এ কোনো Teacher assignment পাওয়া যায়নি।</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50/50 border-b">
                              <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                              <th className="py-3 px-4 text-left font-bold text-slate-500">Teacher</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teacherRanking.map(t => {
                              const fullTeacherObj = teachers.find(teach => String(teach.id) === String(t.teacherId));
                              return (
                                <tr 
                                  key={t.teacherId} 
                                  onClick={() => {
                                    if (fullTeacherObj) {
                                      setTeacherAssignedModal({
                                        teacher: fullTeacherObj,
                                        initialExamId: "all",
                                        initialClassId: multiSelClassIds.length === 1 ? multiSelClassIds[0] : "all"
                                      });
                                    }
                                  }}
                                  className="hover:bg-slate-100/70 cursor-pointer transition-colors group"
                                  title="ক্লিক করে এই শিক্ষকের অধীনে শিক্ষার্থীদের রেজাল্ট ও আলাদা ১ থেকে র‍্যাংকিং দেখুন"
                                >
                                  <td className="py-3 px-4"><RankBadge rank={t.rank} /></td>
                                  <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-teal-900">
                                    <div className="flex items-center justify-between gap-2">
                                      <span>{t.teacherName}</span>
                                      <span className="text-[10px] text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        রেজাল্ট ও র‍্যাংকিং দেখুন →
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center text-slate-600 font-semibold">{t.total}</td>
                                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">{t.passed}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : t.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                      {t.passRate.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{t.avgMarks.toFixed(1)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Group / Section Performance Ranking */}
              {groupRanking.length > 0 && (
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-5">
                    <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#D4AF37]" /> Group & Section Performance Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Group / Section</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {groupRanking.map(g => (
                            <tr key={g.gKey} className="hover:bg-slate-50/30">
                              <td className="py-3 px-4"><RankBadge rank={g.rank} /></td>
                              <td className="py-3 px-4 font-bold text-slate-800">{g.groupName}</td>
                              <td className="py-3 px-4 font-medium text-slate-600">{g.branchName}</td>
                              <td className="py-3 px-4 text-center text-slate-600">{g.total}</td>
                              <td className="py-3 px-4 text-center text-emerald-600 font-bold">{g.passed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${g.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : g.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                  {g.passRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{g.avgMarks.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feature 2d: Combined Student Ranking */}
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#D4AF37]" /> Combined Student Ranking ({multiBranchResults.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">দেখান:</span>
                    <Select value={multiLimitCount} onValueChange={setMultiLimitCount}>
                      <SelectTrigger className="h-8 w-28 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Top 10</SelectItem>
                        <SelectItem value="25">Top 25</SelectItem>
                        <SelectItem value="50">Top 50</SelectItem>
                        <SelectItem value="all">সবাই (All)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {multiBranchResults.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 italic text-xs">কোনো Result পাওয়া যায়নি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Student</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Class & Session</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Group</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Assigned Teacher</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">ID / Roll</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Marks</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">GPA</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Grade</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                            <th className="py-3 px-4 text-end font-bold text-slate-500">Print</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(multiLimitCount === "all" ? multiBranchResults : multiBranchResults.slice(0, Number(multiLimitCount))).map(r => {
                            const s  = findStudentForResult(r) || { full_name_en: `Student #${r.student_id}`, full_name_bn: "", roll_number: r.student_id };
                            const br = branches.find(b => String(b.id) === String(r.branch_id || s?.branch_id));
                            const tObj = s ? getStudentAssignedTeacher(s, teachers) : null;
                            const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                            if (!s) return null;

                            const classDisplayName = resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, br?.academic_structure, 'bn') || s.class_name || s.batch || "—";
                            const teacherDisplayName = tObj ? (tObj.full_name_bn || tObj.full_name_en) : "—";
                            const groupDisplayName = s.class_group_id ? `Group ${s.class_group_id}` : "General";

                            return (
                              <tr key={r.id} className="hover:bg-slate-50/30">
                                <td className="py-3 px-4"><RankBadge rank={r.combinedRank} /></td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-800">{s.full_name_en}</p>
                                  <p className="text-[10px] text-slate-400">{s.full_name_bn}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#052E2B]/8 text-[#052E2B]">
                                    {br?.name_bn || br?.name_en || "—"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-700">{classDisplayName}</td>
                                <td className="py-3 px-4 text-center font-medium text-slate-600">{groupDisplayName}</td>
                                <td className="py-3 px-4 font-semibold text-teal-800">{teacherDisplayName}</td>
                                <td className="py-3 px-4 text-center font-mono text-slate-500">{s.roll_number || s.id}</td>
                                <td className="py-3 px-4 text-center font-bold text-slate-700">
                                  {r.total_obtained_marks} <span className="text-[10px] text-slate-400">/ {r.total_full_marks}</span>
                                </td>
                                <td className="py-3 px-4 text-center font-bold" style={{ color: gc.text }}>
                                  {r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{ background: gc.bg, color: gc.text }}>
                                    {r.status === "fail" ? "F" : r.grade}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={r.status === "fail" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}>
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-end">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handlePrintIndividual(r)}>
                                    <Printer className="h-4 w-4 text-slate-600" />
                                  </Button>
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
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SINGLE-BRANCH MODE (original + Feature 1 teacher filter)
      ══════════════════════════════════════════════════════════ */}
      {!isSuperAdmin || !multiMode ? (
        <div className="space-y-6">

          {/* Search & Filtering Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Search & Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Branch</label>
                <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId("all"); setSelExamId("all"); setSelTeacherId("all"); }} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class / Section</label>
                <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId("all"); setSelTeacherId("all"); }} disabled={selBranchId === "all"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {flatClassOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {groupOptions.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Group</label>
                  <Select value={selGroupId} onValueChange={setSelGroupId}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {groupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Exam</label>
                <Select value={selExamId} onValueChange={setSelExamId} disabled={selClassId === "all"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {filteredExams.map(e => {
                      const b = (branches || []).find(br => String(br.id) === String(e.branch_id));
                      const classLabel = resolveAcademicDisplayName(
                        e.class_id,
                        e.session_id,
                        e.class_group_id,
                        b?.academic_structure,
                        'bn'
                      );
                      return (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.title}{classLabel ? ` (${classLabel})` : ""}{e.academic_year ? ` [${e.academic_year}]` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Teacher (Optional)</label>
                <Select value={selTeacherId} onValueChange={setSelTeacherId} disabled={selBranchId === "all"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="All Teachers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল শিক্ষক (All Teachers)</SelectItem>
                    {teacherOptions.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.full_name_bn || t.full_name_en || `Teacher #${t.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Roll/Name..."
                    className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Quick Badge if Teacher Selected */}
            {selTeacherId !== "all" && selectedTeacher && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTeacherAssignedModal({
                    teacher: selectedTeacher,
                    initialExamId: selExamId !== "all" ? selExamId : "all",
                    initialClassId: selClassId !== "all" ? selClassId : "all"
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#052E2B]/10 text-[#052E2B] border border-[#052E2B]/20 hover:bg-[#052E2B]/15 transition-all cursor-pointer group"
                >
                  <Users className="h-3.5 w-3.5 text-[#052E2B]" />
                  <span>শিক্ষক: {selectedTeacher.full_name_bn || selectedTeacher.full_name_en} ({teacherStudentCount} জন শিক্ষার্থী)</span>
                  <span className="text-[10px] text-amber-800 font-extrabold ml-1 group-hover:underline flex items-center gap-0.5">
                    📊 রেজাল্ট ও আলাদা র‍্যাংকিং দেখুন <ExternalLink className="h-3 w-3 inline opacity-75" />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Feature 1: Teacher Info Card (Clickable - opens teacher assigned students results & 1-N ranking) */}
          {selTeacherId !== "all" && selectedTeacher && (
            <div 
              onClick={() => setTeacherAssignedModal({
                teacher: selectedTeacher,
                initialExamId: selExamId !== "all" ? selExamId : "all",
                initialClassId: selClassId !== "all" ? selClassId : "all"
              })}
              className="bg-gradient-to-r from-[#052E2B] via-[#073932] to-[#0a4a3f] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-md hover:shadow-xl hover:scale-[1.005] active:scale-[0.998] transition-all cursor-pointer border border-[#D4AF37]/40 group relative overflow-hidden ring-1 ring-[#D4AF37]/20 hover:ring-[#D4AF37]/60"
              role="button"
              tabIndex={0}
              title="ক্লিক করে এই শিক্ষকের অধীনে সকল শিক্ষার্থীর রেজাল্ট ও আলাদা ১ থেকে র‍্যাংকিং দেখুন"
            >
              {/* Animated soft gradient shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-center gap-4 min-w-0 z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#D4AF37]/60 shadow-inner group-hover:border-[#D4AF37] transition-colors">
                  {selectedTeacher.photo_url ? (
                    <img src={selectedTeacher.photo_url} alt={selectedTeacher.full_name_en} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-[#D4AF37]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Selected Teacher</p>
                    {singleBranchTeacherRank && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm flex items-center gap-1">
                        🏆 {selClassId !== "all" ? "এই ক্লাসে" : "এই শাখায়"} {singleBranchTeacherRank.rank} নম্বর শিক্ষক
                        {singleBranchTeacherRank.totalTeachersInScope > 1 && ` (মোট ${singleBranchTeacherRank.totalTeachersInScope} জনের মধ্যে)`}
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-base sm:text-lg text-white truncate group-hover:text-amber-200 transition-colors">
                    {selectedTeacher.full_name_en || selectedTeacher.full_name_bn}
                  </p>
                  <p className="text-[11px] text-white/80 mt-0.5 flex items-center gap-3 flex-wrap font-medium">
                    <span>{selectedFlatClass ? `Class: ${selectedFlatClass.label}` : "All Classes"}</span>
                    <span>মোট Student: <strong className="text-[#D4AF37]">{teacherTotalAssignedCount > 0 ? teacherTotalAssignedCount : teacherStudentCount} জন</strong> {selClassId !== "all" && teacherTotalAssignedCount > teacherStudentCount && `(এই ক্লাসে: ${teacherStudentCount} জন)`}</span>
                    {singleBranchTeacherRank && (
                      <>
                        <span>পাস হার: <strong className="text-emerald-300">{singleBranchTeacherRank.passRate.toFixed(1)}%</strong></span>
                        <span>গড় নম্বর: <strong className="text-amber-200">{singleBranchTeacherRank.avgMarks.toFixed(1)}</strong></span>
                        <span>গড় GPA: <strong className="text-yellow-300">{singleBranchTeacherRank.avgGpa.toFixed(2)}</strong></span>
                      </>
                    )}
                    {selExamId !== "all" ? ` · Result দেখাচ্ছে: ${filteredResults.length} জন` : ""}
                  </p>
                </div>
              </div>

              {/* Action Button Pill on Right */}
              <div className="shrink-0 flex items-center gap-2 z-10">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-[#D4AF37] to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-[#052E2B] font-extrabold text-xs rounded-xl shadow-md gap-1.5 h-9 px-3.5 group-hover:shadow-amber-500/30 transition-all pointer-events-none"
                >
                  <Trophy className="h-4 w-4 text-[#052E2B]" />
                  <span>রেজাল্ট ও ১-র‍্যাংকিং দেখুন</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-85" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Results</span>
              <span className="text-2xl font-extrabold text-[#052E2B]">{totalEntered}</span>
              <span className="text-[10px] text-slate-500 mt-1">Entered Marksheets</span>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Passed Students</span>
              <span className="text-2xl font-extrabold text-emerald-600">{passedCount}</span>
              <span className="text-[10px] text-slate-500 mt-1">Pass Rate: {passRate.toFixed(1)}%</span>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Failed Students</span>
              <span className="text-2xl font-extrabold text-red-600">{failedCount}</span>
              <span className="text-[10px] text-slate-500 mt-1">Failed in one or more papers</span>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Position Active</span>
              <span className="text-2xl font-extrabold text-yellow-600 flex items-center gap-1">🏆 Yes</span>
              <span className="text-[10px] text-slate-500 mt-1">Automatic merit ranks configured</span>
            </Card>
          </div>

          {/* Table & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Merit List Table */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-5 flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">
                  Results Merit List ({filteredResults.length})
                  {selTeacherId !== "all" && selectedTeacher && (
                    <span className="ml-2 text-[10px] bg-[#052E2B]/10 text-[#052E2B] px-2 py-0.5 rounded-full font-normal">
                      {selectedTeacher.full_name_en}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {selBranchId !== "all" && selClassId !== "all" && selExamId !== "all" && (
                    <Button onClick={handleDownloadSheet} size="sm" className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-9">
                      <Printer className="h-4 w-4" /> Print Result Sheet
                    </Button>
                  )}
                  {filteredResults.length > 0 && (
                    <Button onClick={handlePrintAllTranscripts} size="sm" className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] gap-1.5 text-xs font-bold rounded-xl h-9 shadow-sm">
                      <FileText className="h-4 w-4" /> Print All Result Cards ({filteredResults.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {resultsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#052E2B]" /></div>
                ) : filteredResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic">No matching results found. Set filter variables above.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 border-b">
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Student Name</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">ID / Roll</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Marks</th>
                          {isQawmiDashboard ? (
                            <th className="py-3 px-4 text-center font-bold text-slate-500">দারাজাহ</th>
                          ) : (<>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">GPA</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Grade</th>
                          </>)}
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                          <th className="py-3 px-4 text-end font-bold text-slate-500">Print</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((r) => {
                          const s  = findStudentForResult(r) || { full_name_en: `Student #${r.student_id}`, full_name_bn: "", roll_number: r.student_id };
                          const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/30">
                              <td className="py-3.5 px-4 font-extrabold text-slate-600">{`#${r.liveRank}`}</td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-800">{s.full_name_en}</p>
                                <p className="text-[10px] text-slate-400">{s.full_name_bn}</p>
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-slate-500">{s.roll_number || s.id}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                {r.total_obtained_marks} <span className="text-[10px] text-slate-400">/ {r.total_full_marks}</span>
                              </td>
                              {isQawmiDashboard ? (
                                <td className="py-3.5 px-4 text-center font-bold" style={{ color: r.status === "fail" ? "#cc0000" : "#006241" }}>
                                  {r.status === "fail" ? "রাসিব" : calcQawmiDarajah(r.total_obtained_marks, r.total_full_marks)}
                                </td>
                              ) : (<>
                                <td className="py-3.5 px-4 text-center font-bold" style={{ color: gc.text }}>
                                  {r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{ background: gc.bg, color: gc.text }}>
                                    {r.status === "fail" ? "F" : r.grade}
                                  </span>
                                </td>
                              </>)}
                              <td className="py-3.5 px-4 text-center">
                                <Badge className={r.status === "fail" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}>
                                  {r.status}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-end">
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handlePrintIndividual(r)}>
                                  <Printer className="h-4.5 w-4.5 text-slate-600" />
                                </Button>
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

            {/* Top Performers */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-5 w-5 text-yellow-500" /> Top Performing Students
              </h3>
              <div className="space-y-4 flex-1">
                {topPerformers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No passed students recorded in query.</p>
                ) : (
                  topPerformers.map((r, i) => {
                    const s  = findStudentInList(r, students);
                    const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                    if (!s) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl border hover:bg-slate-50/50 transition-all">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                          i === 0 ? "bg-yellow-100 text-yellow-800" : i === 1 ? "bg-slate-100 text-slate-800" : "bg-orange-100 text-orange-800"
                        }`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate text-xs">{s.full_name_en}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Roll: {s.roll_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-xs" style={{ color: gc.text }}>GPA {r.gpa?.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400">Total: {r.total_obtained_marks}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Teacher's Assigned Students Results & 1-N Ranking Modal */}
      {teacherAssignedModal && (
        <TeacherAssignedResultsDialog
          isOpen={!!teacherAssignedModal}
          onClose={() => setTeacherAssignedModal(null)}
          teacher={teacherAssignedModal.teacher}
          initialExamId={teacherAssignedModal.initialExamId || "all"}
          initialClassId={teacherAssignedModal.initialClassId || "all"}
          students={students}
          exams={exams}
          branches={branches}
          results={results}
          teachers={teachers}
          settings={settings}
          enrichResult={enrichResult}
          findStudentForResult={findStudentForResult}
          handlePrintIndividual={handlePrintIndividual}
        />
      )}
    </div>
  );
}