"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { appClient } from "@/api/appClient";
import { isStudentInClassOption } from "@/lib/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Printer,
  Search,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  calcSubjectGradeAndGPA,
  calcOverallGrade,
} from "./examCalculations";
import {
  recalculateMeritRanks,
  printBlankMarksheet,
} from "./examMarksheetPrint";

export default function ExamResultEntry({ branches, exams, students, settings, currentUser }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  // Selection states
  const [selBranchId, setSelBranchId] = useState("");

  React.useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      setSelBranchId(String(currentUser.branch_id));
    }
  }, [currentUser]);
  const [selClassId, setSelClassId] = useState("");
  const [selGroupId, setSelGroupId] = useState("all");
  const [selExamId, setSelExamId] = useState("");
  const [selStudentId, setSelStudentId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFilterText, setStudentFilterText] = useState("");
  
  React.useEffect(() => {
    setSelGroupId("all");
  }, [selClassId]);

  // Subject-wise entry states
  const [entryMode, setEntryMode] = useState("student");
  const [selSubjectId, setSelSubjectId] = useState("");
  const [subjectStudentsMarks, setSubjectStudentsMarks] = useState([]);
  const [subjectSearchText, setSubjectSearchText] = useState("");
  
  // Marks state
  const [marksDetails, setMarksDetails] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Dynamic lists
  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  const flatClassOptions = React.useMemo(() => getFlatClassOptions(classes), [classes]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === selClassId);
  const classIdForExams = selectedFlatClass?.classId || selClassId; // class-level ID for exam matching
  const subjects = selectedFlatClass?.subjects || [];
  
  const groupOptions = React.useMemo(() => {
    if (!selClassId) return [];
    if (selectedFlatClass) {
      const classObj = classes.find(c => String(c.id) === String(selectedFlatClass.classId));
      if (classObj && Array.isArray(classObj.groups)) {
        return classObj.groups.map(g => ({
          value: String(g.id),
          label: g.group_name?.bn || g.group_name?.en || String(g.id)
        }));
      }
    }
    return [];
  }, [selectedFlatClass, classes, selClassId]);

  // Filter exams for this branch, class, session, and group selected in Step 2
  const classExams = exams.filter(e => {
    if (String(e.branch_id) !== String(selBranchId)) return false;
    if (String(e.class_id) !== String(classIdForExams)) return false;

    // Filter by Session (Section) if exam is scoped to a specific session
    if (e.session_id && selClassId && String(e.session_id) !== String(selClassId)) {
      return false;
    }

    // Filter by Group if exam is scoped to a specific group
    if (e.class_group_id && selGroupId !== "all" && String(e.class_group_id) !== String(selGroupId)) {
      return false;
    }

    return true;
  });
  const selectedExam = classExams.find(e => String(e.id) === String(selExamId));
  
  const studentsAfterBranchFilter = React.useMemo(() => {
    if (!selBranchId || selBranchId === "all") return students;
    return students.filter(s => String(s.branch_id) === String(selBranchId));
  }, [students, selBranchId]);

  const studentsAfterStatusFilter = React.useMemo(() => {
    return studentsAfterBranchFilter.filter(s => {
      const st = String(s.status || "").toLowerCase().trim();
      return !st || st === "active" || st === "enrolled";
    });
  }, [studentsAfterBranchFilter]);

  const studentsAfterClassFilter = React.useMemo(() => {
    if (!selClassId || selClassId === "all") return studentsAfterStatusFilter;
    return studentsAfterStatusFilter.filter(s => isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure));
  }, [studentsAfterStatusFilter, selClassId, selectedBranch]);

  const classStudents = React.useMemo(() => {
    if (!selGroupId || selGroupId === "all") return studentsAfterClassFilter;
    return studentsAfterClassFilter.filter(s => {
      const sGroupId = s.class_group_id || s.group_id || s.group || "";
      return !sGroupId || String(sGroupId) === String(selGroupId);
    });
  }, [studentsAfterClassFilter, selGroupId]);
  const selectedStudent = classStudents.find(s => String(s.id) === String(selStudentId));
  const selectedSubject = subjects.find(s => String(s.id) === String(selSubjectId));

  // Query existing results for the selected exam only
  const { data: existingResults = [] } = useQuery({
    queryKey: ["exam-results", selExamId],
    queryFn: () => {
      if (!selExamId) return [];
      return appClient.entities.ExamResult.filter({ exam_id: Number(selExamId) });
    },
    enabled: !!selExamId,
  });

  const existingResult = existingResults.find(r => String(r.student_id) === String(selStudentId));

  // Split students into those with/without existing results for the selected exam
  const studentsWithResults = React.useMemo(() => {
    if (!selExamId || existingResults.length === 0) return [];
    const resultStudentIds = new Set(existingResults.map(r => String(r.student_id)));
    return classStudents.filter(s => resultStudentIds.has(String(s.id)));
  }, [classStudents, existingResults, selExamId]);

  const studentsWithoutResults = React.useMemo(() => {
    if (!selExamId || existingResults.length === 0) return classStudents;
    const resultStudentIds = new Set(existingResults.map(r => String(r.student_id)));
    return classStudents.filter(s => !resultStudentIds.has(String(s.id)));
  }, [classStudents, existingResults, selExamId]);

  // Decision variables for existing results detection
  const totalStudents = classStudents.length;
  const countWithResults = studentsWithResults.length;
  const countWithoutResults = studentsWithoutResults.length;
  const allStudentsHaveResults = totalStudents > 0 && countWithResults === totalStudents && countWithoutResults === 0;



  // Auto switch to edit mode ONLY if every matching student in this class/session/group already has results saved for this exam
  useEffect(() => {
    if (selExamId && totalStudents > 0) {
      if (allStudentsHaveResults) {
        setIsEditMode(true);
      } else if (countWithResults === 0) {
        setIsEditMode(false);
      }
    }
  }, [selExamId, totalStudents, allStudentsHaveResults, countWithResults]);

  useEffect(() => {
    setStudentFilterText("");
    setSubjectSearchText("");
  }, [selExamId, isEditMode, selClassId, entryMode]);

  const filteredStudentsWithResults = React.useMemo(() => {
    if (!studentFilterText.trim()) return studentsWithResults;
    const q = studentFilterText.toLowerCase().trim();
    return studentsWithResults.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [studentsWithResults, studentFilterText]);

  const filteredStudentsWithoutResults = React.useMemo(() => {
    if (!studentFilterText.trim()) return studentsWithoutResults;
    const q = studentFilterText.toLowerCase().trim();
    return studentsWithoutResults.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [studentsWithoutResults, studentFilterText]);

  const filteredClassStudents = React.useMemo(() => {
    if (!studentFilterText.trim()) return classStudents;
    const q = studentFilterText.toLowerCase().trim();
    return classStudents.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [classStudents, studentFilterText]);

  // Load subject fields or multiple students' marks when step/selections change
  useEffect(() => {
    if (step === 5 && selectedFlatClass) {
      if (entryMode === "student") {
        if (existingResult && Array.isArray(existingResult.marks_details)) {
          // Merge existing saved marks with CURRENT class subject list.
          // This ensures newly added subjects also appear (with blank marks)
          // and avoids silently dropping them from the edit form and PDF.
          const savedMap = new Map(
            existingResult.marks_details.map(m => [String(m.subject_id), m])
          );
          const merged = subjects.map(sub => {
            const saved = savedMap.get(String(sub.id));
            return saved
              ? { ...saved, subject_name: sub.subject_name, book_name: sub.book_name, full_marks: sub.full_marks || saved.full_marks || 100, pass_marks: sub.pass_marks || saved.pass_marks || 33 }
              : { subject_id: sub.id, subject_name: sub.subject_name, book_name: sub.book_name, full_marks: sub.full_marks || 100, pass_marks: sub.pass_marks || 33, obtained_marks: "" };
          });
          setMarksDetails(merged);
          setRemarks(existingResult.remarks || "");
        } else {
          const initial = subjects.map(sub => ({
            subject_id: sub.id,
            subject_name: sub.subject_name,
            book_name: sub.book_name,
            full_marks: sub.full_marks || 100,
            pass_marks: sub.pass_marks || 33,
            obtained_marks: ""
          }));
          setMarksDetails(initial);
          setRemarks("");
        }
      } else if (entryMode === "subject" && selectedSubject) {
        // Initialize subjectStudentsMarks for all classStudents
        const initial = classStudents.map(student => {
          // Find existing result for this student in this exam
          const res = existingResults.find(r => String(r.student_id) === String(student.id));
          const existingSubMark = res && Array.isArray(res.marks_details)
            ? res.marks_details.find(m => String(m.subject_id) === String(selSubjectId))
            : null;
          
          return {
            student_id: student.id,
            student_name: student.full_name_en,
            student_name_bn: student.full_name_bn,
            roll_number: student.roll_number,
            class_group_id: student.class_group_id,
            selected: true,
            obtained_marks: existingSubMark && existingSubMark.obtained_marks !== undefined && existingSubMark.obtained_marks !== "" ? String(existingSubMark.obtained_marks) : "",
            is_absent: existingSubMark && existingSubMark.is_absent === true ? true : false,
            existing_result: res || null
          };
        });
        const sorted = [...initial].sort((a, b) => {
          if (a.is_absent !== b.is_absent) return a.is_absent ? 1 : -1;
          return (a.roll_number || '').localeCompare(b.roll_number || '', undefined, { numeric: true });
        });
        setSubjectStudentsMarks(sorted);
      }
    }
  }, [step, selStudentId, selExamId, selClassId, entryMode, selSubjectId, existingResults]);

  const updateObtainedMark = (subId, val) => {
    setMarksDetails(prev => prev.map(m => {
      if (m.subject_id === subId) {
        const num = val === "" ? "" : Math.min(m.full_marks, Math.max(0, Number(val)));
        return { ...m, obtained_marks: num };
      }
      return m;
    }));
  };

  const updateSubjectObtainedMark = (studentId, val) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        const fullMarks = selectedSubject?.full_marks || 100;
        const num = val === "" ? "" : Math.min(fullMarks, Math.max(0, Number(val)));
        return { ...m, obtained_marks: num };
      }
      return m;
    }));
  };

  const toggleStudentSelection = (studentId) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        return { ...m, selected: !m.selected };
      }
      return m;
    }));
  };

  const toggleAllStudentsSelection = (checked) => {
    setSubjectStudentsMarks(prev => prev.map(m => ({ ...m, selected: checked })));
  };

  const toggleStudentAbsent = (studentId) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        const newAbsent = !m.is_absent;
        return { ...m, is_absent: newAbsent, obtained_marks: newAbsent ? "" : m.obtained_marks };
      }
      return m;
    }));
  };

  const filteredSubjectStudentsMarks = React.useMemo(() => {
    if (!subjectSearchText.trim()) return subjectStudentsMarks;
    const q = subjectSearchText.toLowerCase().trim();
    return subjectStudentsMarks.filter(s => 
      (s.student_name || "").toLowerCase().includes(q) ||
      (s.student_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.student_id).includes(q)
    );
  }, [subjectStudentsMarks, subjectSearchText]);

  // ─── Print Subject Marksheet ─────────────────────────────────
  const printSubjectMarksheet = () => {
    const logoUrl = settings?.logo_url || DEFAULT_LOGO;
    const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";

    const rowsHtml = subjectStudentsMarks.map((s, idx) => {
      const groupName = (() => {
        if (!s?.class_group_id || !selectedBranch?.academic_structure) return "";
        for (const c of selectedBranch.academic_structure) {
          if (c.groups) {
            const g = c.groups.find(grp => String(grp.id) === String(s.class_group_id));
            if (g) return g.group_name?.bn || g.group_name?.en || "";
          }
        }
        return "";
      })();

      const marksDisplay = s.is_absent
        ? '<span style="color: #dc2626; font-weight: 700;">Absent</span>'
        : s.obtained_marks !== ""
          ? `<span style="font-weight: 600;">${s.obtained_marks}</span>`
          : '<span style="color: #94a3b8;">—</span>';
      const absentBadge = s.is_absent
        ? '<span style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700;">Absent</span>'
        : '';
      return `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center; font-weight: 600; color: #475569;">${idx + 1}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center; font-family: monospace; font-weight: 600; color: #475569;">${s.roll_number || ''}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; font-weight: 600; color: #1e293b;">
            ${s.student_name}${s.student_name_bn ? ` <span style="color: #64748b; font-weight: 400; font-size: 11px;">(${s.student_name_bn})</span>` : ''}
            ${groupName ? `<br/><span style="font-size: 9px; color: #64748b; font-weight: 500;">Group: ${groupName}</span>` : ''}
          </td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${marksDisplay}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${absentBadge}</td>
        </tr>
      `;
    }).join("");

    const totalStudents = subjectStudentsMarks.length;
    const presentCount = subjectStudentsMarks.filter(s => !s.is_absent).length;
    const absentCount = subjectStudentsMarks.filter(s => s.is_absent).length;
    const printDate = format(new Date(), "dd/MM/yyyy hh:mm a");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Subject Marksheet - ${selectedSubject?.subject_name?.en || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; }
          .page { width: 210mm; min-height: 297mm; padding: 15mm 12mm; margin: 0 auto; }
          .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #052E2B; padding-bottom: 14px; margin-bottom: 18px; }
          .logo-wrap { width: 65px; height: 65px; border: 2px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
          .logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
          .header-text { flex: 1; }
          .inst-name-bn { font-size: 20px; font-weight: 700; color: #052E2B; }
          .inst-name-en { font-size: 13px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 0.5px; }
          .header-details { font-size: 11px; color: #64748b; margin-top: 4px; }
          .header-details strong { color: #1e293b; }
          .title-section { text-align: center; margin-bottom: 16px; }
          .title-section h2 { font-size: 16px; font-weight: 700; color: #052E2B; margin-bottom: 2px; }
          .title-section p { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
          th { background: #052E2B; color: white; padding: 8px 10px; border: 1px solid #052E2B; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 6px 10px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background: #f8fafc; }
          .summary-bar { display: flex; gap: 20px; font-size: 11px; color: #475569; margin-bottom: 16px; padding: 10px 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; }
          .summary-bar span { font-weight: 700; color: #1e293b; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 12mm 10mm; }
            th { background: #052E2B !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo-wrap">
              <img src="${logoUrl}" loading="lazy" alt="Logo" />
            </div>
            <div class="header-text">
              <div class="inst-name-bn">${instNameBn}</div>
              <div class="inst-name-en">${instNameEn}</div>
              <div class="header-details">
                Branch: <strong>${selectedBranch?.name_bn || selectedBranch?.name_en || ''}</strong> | 
                Class: <strong>${resolveAcademicDisplayName(
                  selClassId,
                  null,
                  (selectedExam?.class_group_id) || (selGroupId !== "all" ? selGroupId : null),
                  selectedBranch?.academic_structure,
                  'bn'
                ) || selectedFlatClass?.label || ''}</strong> | 
                Exam: <strong>${selectedExam?.title || ''}</strong>
              </div>
            </div>
          </div>

          <div class="title-section">
            <h2>Subject Marks Sheet</h2>
            <p>
              <strong>${selectedSubject?.subject_name?.bn || selectedSubject?.subject_name?.en || selectedSubject?.subject_name || ''}</strong> | 
              Full Marks: ${selectedSubject?.full_marks || 100} | 
              Pass Marks: ${selectedSubject?.pass_marks || 33} |
              Academic Year: ${selectedExam?.academic_year || 'N/A'}
            </p>
          </div>

          <div class="summary-bar">
            Total Students: <span>${totalStudents}</span> | 
            Present: <span>${presentCount}</span> | 
            Absent: <span>${absentCount}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 6%;">Sl</th>
                <th style="width: 10%;">Roll</th>
                <th style="width: 48%; text-align: left;">Student Name</th>
                <th style="width: 18%;">Marks</th>
                <th style="width: 18%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Print Date: ${printDate}</span>
            <span>Generated by Rahmania Institute Management System</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return toast.error("Please allow pop-ups to print");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // ─── Keyboard Navigation & Row Highlight for Subject-wise Entry ─
  const [focusedStudentId, setFocusedStudentId] = React.useState(null);
  const marksInputRefs = React.useRef({});

  const registerMarksInput = (studentId) => (el) => {
    const key = String(studentId);
    if (el) {
      marksInputRefs.current[key] = el;
    } else {
      delete marksInputRefs.current[key];
    }
  };

  const focusMarksInput = (studentId) => {
    const inp = marksInputRefs.current[String(studentId)];
    if (inp) {
      setFocusedStudentId(String(studentId));
      inp.focus();
      inp.select();
    }
  };

  const handleMarksFocus = (studentId) => {
    setFocusedStudentId(String(studentId));
  };

  const handleMarksKeyDown = (e, studentId, index) => {
    const students = filteredSubjectStudentsMarks;

    if (e.key === 'Enter' || (e.key === 'ArrowDown' && !e.shiftKey && !e.altKey && !e.metaKey)) {
      e.preventDefault();
      if (index < students.length - 1) {
        focusMarksInput(students[index + 1].student_id);
      } else {
        // Focus Save button if on last student
        const saveBtn = document.querySelector('#subject-save-btn');
        if (saveBtn) saveBtn.focus();
      }
    } else if (e.key === 'ArrowUp' && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      if (index > 0) {
        focusMarksInput(students[index - 1].student_id);
      }
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      toggleStudentAbsent(studentId);
      // Refocus marks input after toggle
      setTimeout(() => focusMarksInput(studentId), 0);
    }
  };

  const handleMarksBlur = () => {
    // Delay clearing to allow focus to move within the same row
    setTimeout(() => setFocusedStudentId(null), 150);
  };

  const handleAbsentKeyDown = (e, studentId) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleStudentAbsent(studentId);
    }
  };

  // Auto-focus first marks input when subject-wise entry loads
  React.useEffect(() => {
    if (step === 5 && entryMode === "subject" && selectedSubject && subjectStudentsMarks.length > 0) {
      const timer = setTimeout(() => {
        const firstPresent = subjectStudentsMarks.find(s => !s.is_absent);
        if (firstPresent) {
          focusMarksInput(firstPresent.student_id);
          setFocusedStudentId(String(firstPresent.student_id));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step, entryMode, selSubjectId, selClassId]);

  // Calculations in UI
  const totalFullMarks = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
  const totalObtainedMarks = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
  
  const isFailed = marksDetails.some(m => {
    if (m.obtained_marks === "") return true;
    return Number(m.obtained_marks) < Number(m.pass_marks);
  });
  
  const totalGpaPoints = marksDetails.reduce((sum, m) => {
    if (m.obtained_marks === "") return sum;
    const { gpa } = calcSubjectGradeAndGPA(Number(m.obtained_marks), Number(m.full_marks));
    return sum + gpa;
  }, 0);
  
  const averageGpa = marksDetails.length > 0 ? totalGpaPoints / marksDetails.length : 0;
  const overallGrade = calcOverallGrade(averageGpa, isFailed);

  const handleSaveMarks = async () => {
    // Validate all marks are entered
    const incomplete = marksDetails.some(m => m.obtained_marks === "");
    if (incomplete) {
      return toast.error("Please enter obtained marks for all subjects");
    }

    setSaving(true);
    try {
      const payload = {
        exam_id: Number(selExamId),
        student_id: Number(selStudentId),
        branch_id: Number(selBranchId),
        class_id: selClassId,
        marks_details: marksDetails,
        obtained_marks: totalObtainedMarks,
        remarks: remarks,
        is_published: "Y"
      };

      if (existingResult) {
        await appClient.entities.ExamResult.update(existingResult.id, payload);
      } else {
        await appClient.entities.ExamResult.create(payload);
      }

      // Automatically recalculate ranks for this class/exam
      await recalculateMeritRanks(Number(selExamId), selClassId);

      toast.success("Marks saved and merit ranks updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["exam-results", selExamId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-results"] });
      
      // Go back to student selection to enter next student
      setSelStudentId("");
      setIsEditMode(false);
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Failed to save exam marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubjectMarks = async () => {
    const selectedList = subjectStudentsMarks.filter(s => s.selected);
    if (selectedList.length === 0) {
      return toast.error("Please select at least one student");
    }
    // Only validate marks for present (non-absent) students
    const presentStudents = selectedList.filter(s => !s.is_absent);
    const incomplete = presentStudents.some(s => s.obtained_marks === "");
    if (incomplete) {
      return toast.error("Please enter obtained marks for all present students");
    }

    setSaving(true);
    try {
      for (const item of selectedList) {
        let updatedMarksDetails = [];
        let totalObt = 0;

        if (item.existing_result) {
          const existingDetails = Array.isArray(item.existing_result.marks_details) ? item.existing_result.marks_details : [];
          let found = false;
          updatedMarksDetails = existingDetails.map(m => {
            if (String(m.subject_id) === String(selSubjectId)) {
              found = true;
              if (item.is_absent) {
                return { ...m, obtained_marks: null, is_absent: true };
              }
              return { ...m, obtained_marks: item.obtained_marks !== "" ? Number(item.obtained_marks) : "" };
            }
            return m;
          });
          if (!found && selectedSubject) {
            updatedMarksDetails.push({
              subject_id: selectedSubject.id,
              subject_name: selectedSubject.subject_name,
              book_name: selectedSubject.book_name,
              full_marks: selectedSubject.full_marks || 100,
              pass_marks: selectedSubject.pass_marks || 33,
              obtained_marks: item.is_absent ? null : (item.obtained_marks !== "" ? Number(item.obtained_marks) : ""),
              ...(item.is_absent ? { is_absent: true } : {})
            });
          }
          totalObt = updatedMarksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);

          const payload = {
            ...item.existing_result,
            marks_details: updatedMarksDetails,
            obtained_marks: totalObt,
          };
          delete payload.total_full_marks;
          delete payload.total_obtained_marks;
          delete payload.gpa;
          delete payload.grade;
          delete payload.status;

          await appClient.entities.ExamResult.update(item.existing_result.id, payload);
        } else {
          updatedMarksDetails = subjects.map(sub => {
            const isTarget = String(sub.id) === String(selSubjectId);
            return {
              subject_id: sub.id,
              subject_name: sub.subject_name,
              book_name: sub.book_name,
              full_marks: sub.full_marks || 100,
              pass_marks: sub.pass_marks || 33,
              obtained_marks: isTarget && item.is_absent ? null : (isTarget && item.obtained_marks !== "" ? Number(item.obtained_marks) : ""),
              ...(isTarget && item.is_absent ? { is_absent: true } : {})
            };
          });
          totalObt = item.is_absent ? 0 : (item.obtained_marks !== "" ? Number(item.obtained_marks) : 0);

          const payload = {
            exam_id: Number(selExamId),
            student_id: Number(item.student_id),
            branch_id: Number(selBranchId),
            class_id: selClassId,
            marks_details: updatedMarksDetails,
            obtained_marks: totalObt,
            remarks: "",
            is_published: "Y"
          };
          await appClient.entities.ExamResult.create(payload);
        }
      }

      await recalculateMeritRanks(Number(selExamId), selClassId);

      toast.success("Marks saved and merit ranks updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["exam-results", selExamId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-results"] });

      setSelSubjectId("");
      setSubjectSearchText("");
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Failed to save exam marks");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selBranchId) return toast.error("Please select a Branch");
    if (step === 2 && !selClassId) return toast.error("Please select a Class");
    if (step === 3) {
      if (!selExamId) return toast.error("Please select an Exam");
      if (entryMode === "student" && !selStudentId) return toast.error("Please select a Student");
      if (entryMode === "subject" && !selSubjectId) return toast.error("Please select a Subject");
    }
    setStep(p => p + 1);
  };

  const prevStep = () => setStep(p => p - 1);

  return (
    <div className="space-y-6">
      {/* Wizard Header Progress Indicator */}
      <div className="flex justify-between items-center max-w-xl mx-auto py-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => { if (s < step) setStep(s); }}
              disabled={s > step}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step 
                  ? "bg-[#052E2B] text-yellow-400 border-2 border-yellow-400 shadow-md scale-110" 
                  : s < step 
                  ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700" 
                  : "bg-gray-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {s}
            </button>
            {s < 5 && <div className={`h-1 w-12 sm:w-16 ${s < step ? "bg-emerald-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="border border-slate-100 bg-white rounded-3xl p-6 shadow-sm max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-base font-bold text-[#052E2B]">Step 1: Select Branch</h3>
              <p className="text-xs text-slate-500">Choose the branch to enter marks for.</p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Branch Name *</label>
                  <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId(""); setSelExamId(""); setSelStudentId(""); setIsEditMode(false); }} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-base font-bold text-[#052E2B]">Step 2: Select Class</h3>
              <p className="text-xs text-slate-500">Showing classes configured for {selectedBranch?.name_bn || selectedBranch?.name_en}</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Class *</label>
                  <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId(""); setSelStudentId(""); setSelSubjectId(""); setIsEditMode(false); }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {flatClassOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {flatClassOptions.length === 0 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No classes found in this branch. Configure classes in Branch Manager.</p>
                  )}
                </div>

                {groupOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Group</label>
                    <Select value={selGroupId} onValueChange={setSelGroupId}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব গ্রুপ (All Groups)</SelectItem>
                        {groupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6" disabled={!selClassId}>Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 3: Select Exam & Student/Subject</h3>
                  <p className="text-xs text-slate-500">Choose exam and then select student or subject to enter marks.</p>
                </div>
                {classStudents.length > 0 && entryMode === "student" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const printClassLabel = resolveAcademicDisplayName(
                        selClassId,
                        null,
                        selGroupId !== "all" ? selGroupId : null,
                        selectedBranch?.academic_structure,
                        'bn'
                      ) || selectedFlatClass?.label || "Class";
                      printBlankMarksheet(selectedBranch, printClassLabel, subjects, classStudents);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl px-4 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Blank Marks Sheet
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Exam Name *</label>
                  <Select value={selExamId} onValueChange={v => { setSelExamId(v); setSelStudentId(""); setSelSubjectId(""); setIsEditMode(false); }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>
                      {classExams.map(e => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.title}{e.academic_year ? ` (${e.academic_year})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classExams.length === 0 && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No exams created for this Class yet. Please add an Exam first.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Entry Type</label>
                  <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg p-1 border">
                    <button
                      type="button"
                      onClick={() => { setEntryMode("student"); setSelSubjectId(""); setSelStudentId(""); }}
                      className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${entryMode === "student" ? "bg-white text-[#052E2B] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEntryMode("subject"); setSelStudentId(""); setSelSubjectId(""); }}
                      className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${entryMode === "subject" ? "bg-white text-[#052E2B] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Subject
                    </button>
                  </div>

                  {entryMode === "student" ? (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-600">Student *</label>
                      {selExamId ? (
                        <>
                          {/* Mode toggle: New Entry vs Edit Existing */}
                          {(studentsWithResults.length > 0 || studentsWithoutResults.length > 0) && classStudents.length > 0 && (
                            <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg p-1 border">
                              <button
                                type="button"
                                onClick={() => { setIsEditMode(false); setSelStudentId(""); }}
                                disabled={studentsWithoutResults.length === 0}
                                className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${!isEditMode ? "bg-white text-[#052E2B] shadow-sm" : studentsWithoutResults.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                New Entry {studentsWithoutResults.length > 0 && `(${studentsWithoutResults.length})`}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setIsEditMode(true); setSelStudentId(""); }}
                                disabled={studentsWithResults.length === 0}
                                className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${isEditMode ? "bg-white text-[#052E2B] shadow-sm" : studentsWithResults.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                Edit Existing {studentsWithResults.length > 0 && `(${studentsWithResults.length})`}
                              </button>
                            </div>
                          )}
                          {/* Search Student Input */}
                          {((isEditMode && studentsWithResults.length > 0) || (!isEditMode && studentsWithoutResults.length > 0)) && (
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search student by Name or Roll..."
                                value={studentFilterText}
                                onChange={e => setStudentFilterText(e.target.value)}
                                className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                              />
                            </div>
                          )}
                          {totalStudents === 0 ? (
                            <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              No active enrolled students found for the selected Branch, Session, Class & Group.
                            </p>
                          ) : isEditMode ? (
                            studentsWithResults.length > 0 ? (
                              <Select value={selStudentId} onValueChange={setSelStudentId}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select student to edit" /></SelectTrigger>
                                <SelectContent>
                                  {filteredStudentsWithResults.length === 0 ? (
                                    <SelectItem value="_none" disabled>No matching students</SelectItem>
                                  ) : (
                                    filteredStudentsWithResults.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No existing results found for this exam.</p>
                            )
                          ) : (
                            studentsWithoutResults.length > 0 ? (
                              <Select value={selStudentId} onValueChange={setSelStudentId}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Student" /></SelectTrigger>
                                <SelectContent>
                                  {filteredStudentsWithoutResults.length === 0 ? (
                                    <SelectItem value="_none" disabled>No matching students</SelectItem>
                                  ) : (
                                    filteredStudentsWithoutResults.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                                  )}
                                </SelectContent>
                              </Select>
                            ) : allStudentsHaveResults ? (
                              <p className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                <ShieldCheck className="h-4 w-4 shrink-0" />
                                All {totalStudents} students already have results for this exam. Switch to Edit Existing to update marks.
                              </p>
                            ) : (
                              <p className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> No eligible students available for new entry.
                              </p>
                            )
                          )}
                        </>
                      ) : (
                        <>
                          {classStudents.length > 0 && (
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search student by Name or Roll..."
                                value={studentFilterText}
                                onChange={e => setStudentFilterText(e.target.value)}
                                className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                              />
                            </div>
                          )}
                          <Select value={selStudentId} onValueChange={setSelStudentId}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Student" /></SelectTrigger>
                            <SelectContent>
                              {filteredClassStudents.length === 0 ? (
                                <SelectItem value="_none" disabled>No matching students</SelectItem>
                              ) : (
                                filteredClassStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                              )}
                            </SelectContent>
                          </Select>
                          {classStudents.length === 0 && (
                            <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No students registered in this class. Set students&apos; Class in Student Manager.</p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-600">Subject *</label>
                      <Select value={selSubjectId} onValueChange={setSelSubjectId}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects.length === 0 ? (
                            <SelectItem value="_none" disabled>No subjects configured</SelectItem>
                          ) : (
                            subjects.map(sub => (
                              <SelectItem key={sub.id} value={String(sub.id)}>
                                {sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {subjects.length === 0 && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No subjects created for this Class yet. Please configure subjects in Courses & Subjects.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                <Button 
                  onClick={nextStep} 
                  className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6" 
                  disabled={!selExamId || (entryMode === "student" ? !selStudentId : !selSubjectId)}
                >
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {entryMode === "student" && selectedStudent ? (
                <>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 4: Student Profile Preview</h3>
                  <div className="bg-[#FAF8F5] border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Student Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedStudent.full_name_en} ({selectedStudent.full_name_bn || ""})</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Student ID / Roll</p>
                      <p className="text-sm font-bold text-slate-800 font-mono">#{selectedStudent.roll_number || selectedStudent.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Branch</p>
                      <p className="text-sm font-bold text-slate-800">{selectedBranch?.name_en}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Class / Section / Group</p>
                      <p className="text-sm font-bold text-slate-800">
                        {resolveAcademicDisplayName(
                          selectedStudent.class_id,
                          selectedStudent.session_id,
                          selectedStudent.class_group_id,
                          selectedBranch?.academic_structure,
                          'bn'
                        ) || selectedFlatClass?.label || selectedStudent.class_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  {existingResult && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span><strong>Notice:</strong> Results already exist for this student in this exam. Continuing will update the existing marksheet.</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Enter Marks →</Button>
                  </div>
                </>
              ) : entryMode === "subject" && selectedSubject ? (
                <>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 4: Subject & Class Preview</h3>
                  <div className="bg-[#FAF8F5] border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Subject Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedSubject.subject_name?.bn || selectedSubject.subject_name?.en || selectedSubject.subject_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Class / Section</p>
                      <p className="text-sm font-bold text-slate-800">{selectedFlatClass?.label || "Class"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Branch</p>
                      <p className="text-sm font-bold text-slate-800">{selectedBranch?.name_en}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Exam</p>
                      <p className="text-sm font-bold text-slate-800">{selectedExam?.title}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Enter Marks →</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500">Incomplete selection. Please go back.</div>
              )}
            </motion.div>
          )}

          {step === 5 && selectedExam && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              {entryMode === "student" && selectedStudent ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-[#052E2B]">{selectedExam.title} Result Entry</h3>
                    <p className="text-xs text-slate-500">Student: <strong>{selectedStudent.full_name_en}</strong> | Roll: <strong>#{selectedStudent.roll_number}</strong></p>
                  </div>

                  {/* Subject Wise Inputs */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Subject</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Full Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Pass Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Obtained Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Grade / GP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marksDetails.map((sub) => {
                          const isSubFailed = sub.obtained_marks !== "" && Number(sub.obtained_marks) < Number(sub.pass_marks);
                          const { grade, gpa } = calcSubjectGradeAndGPA(Number(sub.obtained_marks), Number(sub.full_marks));
                          return (
                            <tr key={sub.subject_id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-slate-800">
                                {sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}
                              </td>
                              <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{sub.full_marks}</td>
                              <td className="py-3.5 px-4 text-center font-semibold text-red-500/80">{sub.pass_marks}</td>
                              <td className="py-3.5 px-4 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={sub.full_marks}
                                  value={sub.obtained_marks}
                                  onChange={e => updateObtainedMark(sub.subject_id, e.target.value)}
                                  className="w-24 mx-auto text-center h-9 font-bold border-slate-200 focus:border-[#052E2B] rounded-lg"
                                  placeholder="0"
                                  required
                                />
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {sub.obtained_marks !== "" ? (
                                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                    isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                  }`}>
                                    {isSubFailed ? "F" : grade} ({isSubFailed ? "0.00" : gpa.toFixed(2)})
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Remarks Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Teacher Remarks (Optional)</label>
                    <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Excellent performance, keep it up!" className="rounded-xl h-11" />
                  </div>

                  {/* Calculations Preview Summary Card */}
                  <div className="bg-[#052E2B]/5 border border-[#052E2B]/10 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Calculations Summary (Real-time Preview)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Obtained</p>
                        <p className="text-lg font-extrabold text-[#052E2B]">{totalObtainedMarks} <span className="text-xs font-medium text-slate-400">/ {totalFullMarks}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">GPA Point</p>
                        <p className="text-lg font-extrabold text-[#052E2B]" style={isFailed ? { color: "red" } : {}}>{isFailed ? "0.00" : averageGpa.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Overall Grade</p>
                        <p className="text-lg font-extrabold text-[#052E2B]" style={isFailed ? { color: "red" } : {}}>{isFailed ? "F" : overallGrade}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Pass / Fail Status</p>
                        <Badge className={`h-6 text-xs uppercase font-extrabold ${isFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isFailed ? "Failed" : "Passed"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={handleSaveMarks} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 px-8 font-bold" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {existingResult ? "Update Result" : "Save Result"}
                    </Button>
                  </div>
                </>
              ) : entryMode === "subject" && selectedSubject ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#052E2B]">{selectedExam.title} - Subject-wise Entry</h3>
                      <p className="text-xs text-slate-500">Subject: <strong>{selectedSubject.subject_name?.bn || selectedSubject.subject_name?.en || selectedSubject.subject_name}</strong> | Full Marks: {selectedSubject.full_marks || 100} | Pass Marks: {selectedSubject.pass_marks || 33}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={printSubjectMarksheet}
                        className="bg-[#052E2B] hover:bg-[#031c1a] text-white text-xs h-9 rounded-xl px-4 flex items-center gap-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </Button>
                    </div>
                  </div>

                  {/* Search Student by Roll / Name in Table */}
                  <div className="relative max-w-sm mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student by Name or Roll..."
                      value={subjectSearchText}
                      onChange={e => setSubjectSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Enter</kbd> <span className="text-slate-400">↓</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">↑</kbd><kbd className="font-mono font-bold text-slate-600">↓</kbd> <span className="text-slate-400">Navigate</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Tab</kbd> <span className="text-slate-400">Next field</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Ctrl+A</kbd> <span className="text-slate-400">Absent toggle</span></span>
                  </div>

                  {/* Student List Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="py-3 px-4 text-left w-16">
                            <input
                              type="checkbox"
                              checked={subjectStudentsMarks.length > 0 && subjectStudentsMarks.every(s => s.selected)}
                              onChange={e => toggleAllStudentsSelection(e.target.checked)}
                              className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B] h-4 w-4 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Roll No</th>
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Student Name</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Obtained Marks</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Grade / GP</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSubjectStudentsMarks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">No matching students found</td>
                          </tr>
                        ) : (
                          filteredSubjectStudentsMarks.map((student, index) => {
                            const isSubFailed = student.obtained_marks !== "" && Number(student.obtained_marks) < Number(selectedSubject.pass_marks || 33);
                            const { grade, gpa } = calcSubjectGradeAndGPA(Number(student.obtained_marks), Number(selectedSubject.full_marks || 100));
                            return (
                              <tr key={student.student_id} className={`transition-all duration-150 ${
                                String(student.student_id) === focusedStudentId
                                  ? "bg-emerald-50/60 shadow-[inset_0_0_0_1px_rgba(5,46,43,0.08)]"
                                  : "hover:bg-slate-50/80"
                              } ${!student.selected ? "opacity-45 bg-slate-50/30" : ""}`}>
                                <td className="py-3.5 px-4 text-left">
                                  <input
                                    type="checkbox"
                                    checked={student.selected}
                                    onChange={() => toggleStudentSelection(student.student_id)}
                                    className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B] focus-visible:ring-2 focus-visible:ring-[#052E2B] focus-visible:ring-offset-2 h-4 w-4 cursor-pointer outline-none"
                                  />
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{student.roll_number || student.student_id}</td>
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-800">{student.student_name}</p>
                                  {student.student_name_bn && <p className="text-[10px] text-slate-400">{student.student_name_bn}</p>}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {student.is_absent ? (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 inline-block">Absent</span>
                                  ) : (
                                    <Input
                                      ref={registerMarksInput(student.student_id)}
                                      type="number"
                                      min={0}
                                      max={selectedSubject.full_marks || 100}
                                      value={student.obtained_marks}
                                      onChange={e => updateSubjectObtainedMark(student.student_id, e.target.value)}
                                      onKeyDown={e => handleMarksKeyDown(e, student.student_id, index)}
                                      onFocus={() => handleMarksFocus(student.student_id)}
                                      onBlur={handleMarksBlur}
                                      disabled={!student.selected}
                                      className="w-24 mx-auto text-center h-9 font-bold border-2 border-slate-200 focus:border-[#052E2B] focus-visible:ring-[3px] focus-visible:ring-[#052E2B]/30 focus-visible:ring-offset-0 focus-visible:border-[#052E2B] rounded-lg outline-none transition-all duration-150"
                                      placeholder="0"
                                      required={student.selected}
                                    />
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {student.selected && student.obtained_marks !== "" && !student.is_absent ? (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                      isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                      {isSubFailed ? "F" : grade} ({isSubFailed ? "0.00" : gpa.toFixed(2)})
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={student.is_absent}
                                      onChange={() => toggleStudentAbsent(student.student_id)}
                                      onKeyDown={e => handleAbsentKeyDown(e, student.student_id)}
                                      disabled={!student.selected}
                                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 h-4 w-4 cursor-pointer outline-none"
                                      title="Mark as Absent (Ctrl+A when on marks field)"
                                    />
                                    {student.is_absent ? (
                                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">Absent</span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Present</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button id="subject-save-btn" onClick={handleSaveSubjectMarks} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 px-8 font-bold" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Save Result
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500">Incomplete selection. Please go back.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Teacher's Assigned Students Results & Ranking Dialog (with Multi-Exam Selection & Class Teacher Ranking)
// ────────────────────────────────────────────────────────