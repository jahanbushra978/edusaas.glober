'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, UserCheck, Printer, FileText, Building2, 
  BookOpen, Award, Layers, ShieldAlert
} from 'lucide-react';
import { isStudentAssignedToTeacher, getStudentAssignedTeacher } from '@/lib/academic';

export default function AssignedStudentsResultView({ currentUser, appSettings = [] }) {
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const isStaff = currentUser && ['super_admin', 'superadmin', 'admin', 'branch_admin', 'teacher'].includes(currentUser.role);
  const userBranchId = currentUser?.branch_id ? String(currentUser.branch_id) : '';

  // Form Filter States
  const [selBranchId, setSelBranchId] = useState(userBranchId || '');
  const [selBranchId2, setSelBranchId2] = useState(''); // For Super Admin 2-Branch Combined
  const [isCombinedBranch, setIsCombinedBranch] = useState(false);
  const [selClassId, setSelClassId] = useState('');
  const [selExamId, setSelExamId] = useState('');
  const [selTeacherId, setSelTeacherId] = useState('all');

  // Print loading state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Queries
  const { data: branches = [] } = useQuery({
    queryKey: ['public-branches-assigned-results'],
    queryFn: () => appClient.entities.Branch.listAll(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['public-exams-assigned-results'],
    queryFn: () => appClient.entities.Exam.listAll({ sort: '-academic_year' }),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-assigned-results'],
    queryFn: () => appClient.entities.Teacher.listAll(),
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ['students-assigned-results'],
    queryFn: () => appClient.entities.Student.listAll({ sort: '-created_date' }),
  });

  const { data: allExamResults = [] } = useQuery({
    queryKey: ['exam-results-assigned'],
    queryFn: () => appClient.entities.ExamResult.listAll(),
  });

  const settingsObj = useMemo(() => {
    return Object.fromEntries(appSettings.map(s => [s.key, s.value]));
  }, [appSettings]);

  const institutionName = settingsObj.institution_name_bn || settingsObj.institution_name_en || "Rahmania Institute";

  // Selected Primary Branch & Academic Structure
  const primaryBranch = branches.find(b => String(b.id) === String(selBranchId));
  const primaryClasses = primaryBranch && Array.isArray(primaryBranch.academic_structure) ? primaryBranch.academic_structure : [];

  // Construct class options (Section level)
  const classOptions = useMemo(() => {
    const options = [];
    primaryClasses.forEach(c => {
      const className = c.class_name?.bn || c.class_name?.en || c.class_name || "";
      if (Array.isArray(c.sections) && c.sections.length > 0) {
        c.sections.forEach(sec => {
          const secName = sec.section_name?.bn || sec.section_name?.en || sec.section_name || sec.section?.bn || sec.section?.en || "";
          options.push({
            id: sec.id,
            parentClassId: c.id,
            class_name_str: className,
            section_name_str: secName,
            label: `${className}${secName ? ` (${secName})` : ""}`.trim(),
            groups: c.groups || []
          });
        });
      } else {
        options.push({
          id: c.id,
          parentClassId: c.id,
          class_name_str: className,
          section_name_str: "",
          label: className,
          groups: c.groups || []
        });
      }
    });
    return options;
  }, [primaryClasses]);

  const selectedOption = classOptions.find(o => String(o.id) === String(selClassId));
  const parentClassId = selectedOption ? selectedOption.parentClassId : selClassId;

  // Filter exams matching selected branch and class
  const filteredExams = useMemo(() => {
    if (!selBranchId || !selClassId) return [];
    return exams.filter(e => 
      String(e.branch_id) === String(selBranchId) && 
      (String(e.class_id) === String(parentClassId) || String(e.class_id) === String(selClassId))
    );
  }, [exams, selBranchId, selClassId, parentClassId]);

  // Teachers assigned to this Class / Branch
  const availableTeachers = useMemo(() => {
    if (!selBranchId) return [];
    return teachers.filter(t => {
      if (t.branch_id && String(t.branch_id) !== String(selBranchId)) return false;
      return true;
    }).sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }, [teachers, selBranchId]);

  // Serial calculations
  // 1. Group Serial & Total Groups
  const groupSerialInfo = useMemo(() => {
    if (!selectedOption) return { groupName: 'N/A', serial: 1, total: 1 };

    // Find group for teacher or selected class
    const totalGroups = Array.isArray(selectedOption.groups) && selectedOption.groups.length > 0
      ? selectedOption.groups.length
      : 1;

    let groupName = "All Groups";
    let serial = 1;

    if (selTeacherId !== 'all') {
      const targetTeacher = teachers.find(t => String(t.id) === String(selTeacherId));
      const inClass = (s) => {
        if (selectedOption.id !== selectedOption.parentClassId) {
          return String(s.class_id) === String(selectedOption.id) ||
            (String(s.class_id) === String(selectedOption.parentClassId) && String(s.session_id) === String(selectedOption.id));
        }
        return String(s.class_id) === String(selectedOption.id);
      };

      // Count group membership across ALL of this teacher's students in the class
      // (not just the first student) and pick the most frequent group.
      const groupCounts = {};
      allStudents.forEach(s => {
        if (!inClass(s)) return;
        if (!targetTeacher || isStudentAssignedToTeacher(s, targetTeacher)) {
          if (s.class_group_id) {
            groupCounts[String(s.class_group_id)] = (groupCounts[String(s.class_group_id)] || 0) + 1;
          }
        }
      });

      const entries = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        const targetGrpId = entries[0][0];
        const grpIdx = selectedOption.groups.findIndex(g => String(g.id) === String(targetGrpId));
        if (grpIdx !== -1) {
          serial = grpIdx + 1;
          groupName = selectedOption.groups[grpIdx].group_name?.bn || selectedOption.groups[grpIdx].group_name?.en || `Group ${serial}`;
        }
      }
    }

    return { groupName, serial, total: totalGroups };
  }, [selectedOption, selTeacherId, teachers, allStudents]);

  // 2. Teacher Serial & Total Teachers
  const teacherSerialInfo = useMemo(() => {
    const totalTeachers = availableTeachers.length > 0 ? availableTeachers.length : 1;
    if (selTeacherId === 'all') {
      return { teacherName: 'All Teachers', serial: 1, total: totalTeachers };
    }
    const idx = availableTeachers.findIndex(t => String(t.id) === String(selTeacherId));
    const teacherObj = availableTeachers[idx];
    const teacherName = teacherObj ? (teacherObj.full_name_bn || teacherObj.full_name_en) : 'N/A';
    return {
      teacherName,
      serial: idx !== -1 ? idx + 1 : 1,
      total: totalTeachers
    };
  }, [availableTeachers, selTeacherId]);

  // Compute final dataset with Combined Merit ranking & Numeric Student Sequence
  const finalDataset = useMemo(() => {
    if (!selBranchId || !selClassId || !selExamId) return [];

    // Filter students for primary branch (or both branches if combined)
    const targetBranchIds = isCombinedBranch && selBranchId2 ? [String(selBranchId), String(selBranchId2)] : [String(selBranchId)];

    let filteredStudents = allStudents.filter(s => {
      if (!targetBranchIds.includes(String(s.branch_id))) return false;
      if (s.status === 'inactive') return false;

      // Class match
      if (selectedOption) {
        if (selectedOption.id !== selectedOption.parentClassId) {
          const match = String(s.class_id) === String(selectedOption.id) || 
            (String(s.class_id) === String(selectedOption.parentClassId) && String(s.session_id) === String(selectedOption.id));
          if (!match) return false;
        } else {
          if (String(s.class_id) !== String(selectedOption.id)) return false;
        }
      }

      // Teacher filter (Optional)
      if (selTeacherId !== 'all') {
        const targetTeacher = teachers.find(t => String(t.id) === String(selTeacherId));
        if (targetTeacher && !isStudentAssignedToTeacher(s, targetTeacher)) return false;
      }

      return true;
    });

    // Map exam results for filtered students
    let rows = filteredStudents.map(student => {
      const res = allExamResults.find(r => String(r.exam_id) === String(selExamId) && String(r.student_id) === String(student.id));
      const teacherObj = getStudentAssignedTeacher(student, teachers);
      const branchObj = branches.find(b => String(b.id) === String(student.branch_id));

      let obtained = res ? Number(res.obtained_marks || 0) : 0;
      let grade = res ? (res.grade || 'F') : 'N/A';
      let remarks = res ? (res.remarks || '-') : '-';

      // Parse numeric roll for proper integer sequence (2, 3... 9, 10, 11)
      const rollNum = parseInt(student.roll_number, 10);
      const numericRoll = isNaN(rollNum) ? 999999 : rollNum;

      return {
        student,
        studentId: student.id,
        rollNumber: student.roll_number || `${student.id}`,
        numericRoll,
        studentName: student.full_name_bn || student.full_name_en || 'N/A',
        branchName: branchObj ? (branchObj.name || `Branch ${branchObj.id}`) : 'N/A',
        teacherName: teacherObj ? (teacherObj.full_name_bn || teacherObj.full_name_en) : 'N/A',
        groupName: student.class_group_id ? `Group ${student.class_group_id}` : 'General',
        obtainedMarks: obtained,
        grade,
        remarks,
        hasResult: !!res
      };
    });

    // Ranking Logic (Combined Merit Ranking: Higher Obtained Marks -> Rank 1)
    if (isCombinedBranch) {
      // Sort by Obtained Marks descending
      rows.sort((a, b) => b.obtainedMarks - a.obtainedMarks);
      rows = rows.map((item, idx) => ({
        ...item,
        meritRank: idx + 1,
        sl: idx + 1
      }));
    } else {
      // Sort numerically by Roll Number (1, 2, 3... 9, 10, 11)
      rows.sort((a, b) => a.numericRoll - b.numericRoll);
      rows = rows.map((item, idx) => ({
        ...item,
        meritRank: idx + 1,
        sl: idx + 1
      }));
    }

    return rows;
  }, [selBranchId, selBranchId2, isCombinedBranch, selClassId, selExamId, selTeacherId, allStudents, allExamResults, exams, teachers, branches, selectedOption]);

  const selectedExamObj = exams.find(e => String(e.id) === String(selExamId));

  // Handle PDF Export
  const handlePrintPdf = () => {
    if (finalDataset.length === 0) {
      return toast.error("No student results available to export!");
    }

    setIsGeneratingPdf(true);

    try {
      const selectedBranchObj = branches.find(b => String(b.id) === String(selBranchId));
      const branchName = selectedBranchObj ? selectedBranchObj.name : "Main Branch";
      const classNameStr = selectedOption ? selectedOption.label : "Class View";
      const examTitle = selectedExamObj ? selectedExamObj.title : "Examination";

      // Split dataset into pages of maximum 30 students per page
      const STUDENTS_PER_PAGE = 30;
      const pagesCount = Math.ceil(finalDataset.length / STUDENTS_PER_PAGE);

      let pagesHTML = "";

      for (let p = 0; p < pagesCount; p++) {
        const pageStudents = finalDataset.slice(p * STUDENTS_PER_PAGE, (p + 1) * STUDENTS_PER_PAGE);

        const rowsHTML = pageStudents.map((item) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${item.sl}</td>
            <td style="font-weight: 600; color: #1e293b;">${item.studentName}</td>
            <td style="text-align: center; font-weight: 600;">${item.rollNumber}</td>
            ${isCombinedBranch ? `<td style="text-align: center; font-size: 11px;">${item.branchName}</td>` : ''}
            <td style="text-align: center;">${item.groupName}</td>
            <td style="text-align: center;">${item.teacherName}</td>
            <td style="text-align: center; font-weight: bold; color: #0f766e;">${item.obtainedMarks}</td>
            <td style="text-align: center; font-weight: bold;">${item.grade}</td>
            <td style="text-align: center; font-weight: bold;">#${item.meritRank}</td>
          </tr>
        `).join('');

        pagesHTML += `
          <div class="print-page">
            <!-- Header Section -->
            <div class="header">
              <div class="inst-name">${institutionName}</div>
              <div class="branch-name">${branchName}${isCombinedBranch && selBranchId2 ? ` + ${branches.find(b => String(b.id) === String(selBranchId2))?.name || ''}` : ''}</div>
              <div class="doc-title">Official Assigned Students Result Sheet</div>
            </div>

            <!-- Meta Box -->
            <div class="meta-box">
              <div class="meta-col">
                <div><strong>Class:</strong> ${classNameStr}</div>
                <div><strong>Exam:</strong> ${examTitle}</div>
              </div>
              <div class="meta-col" style="text-align: right;">
                <div><strong>Teacher:</strong> ${teacherSerialInfo.teacherName} (No: ${teacherSerialInfo.serial}/${teacherSerialInfo.total})</div>
                <div><strong>Assigned Group:</strong> ${groupSerialInfo.groupName} (No: ${groupSerialInfo.serial}/${groupSerialInfo.total})</div>
              </div>
            </div>

            <!-- Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">SL</th>
                  <th>Student Name</th>
                  <th style="width: 70px; text-align: center;">Roll</th>
                  ${isCombinedBranch ? `<th style="width: 100px; text-align: center;">Branch</th>` : ''}
                  <th style="width: 90px; text-align: center;">Group</th>
                  <th style="width: 120px; text-align: center;">Teacher</th>
                  <th style="width: 70px; text-align: center;">Total</th>
                  <th style="width: 60px; text-align: center;">Grade</th>
                  <th style="width: 65px; text-align: center;">Position</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>

            <!-- Page Footer -->
            <div class="footer">
              <div>Print Date: ${new Date().toLocaleDateString('bn-BD')}</div>
              <div>Page ${p + 1} of ${pagesCount}</div>
            </div>
          </div>
        `;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Assigned Students Result - ${classNameStr}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 12mm;
              }
              body {
                font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #0f172a;
                background: #fff;
              }
              .print-page {
                page-break-after: always;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-height: 270mm;
                padding-bottom: 5mm;
              }
              .print-page:last-child {
                page-break-after: auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #0f766e;
                padding-bottom: 6px;
                margin-bottom: 10px;
              }
              .inst-name {
                font-size: 22px;
                font-weight: 800;
                color: #0f766e;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .branch-name {
                font-size: 13px;
                color: #475569;
                font-weight: 600;
              }
              .doc-title {
                display: inline-block;
                margin-top: 4px;
                padding: 2px 14px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                color: #166534;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
              }
              .meta-box {
                display: flex;
                justify-content: space-between;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                margin-bottom: 10px;
              }
              .meta-col div {
                margin-bottom: 3px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11.5px;
                margin-bottom: 10px;
              }
              th {
                background: #0f766e;
                color: #ffffff;
                border: 1px solid #0d9488;
                padding: 6px 8px;
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
              }
              td {
                border: 1px solid #cbd5e1;
                padding: 5.5px 8px;
              }
              tr:nth-child(even) {
                background-color: #f8fafc;
              }
              .footer {
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #e2e8f0;
                padding-top: 6px;
                font-size: 10px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            ${pagesHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setIsGeneratingPdf(false);
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF!");
      setIsGeneratingPdf(false);
    }
  };

  if (!isStaff) {
    return (
      <Card className="border-red-100 rounded-2xl bg-red-50/50 p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-900">Restricted Access / শুধুমাত্র স্টাফ</h3>
        <p className="text-xs text-red-600 mt-1">
          অ্যাসাইন্ড স্টুডেন্টস রেজাল্ট শিট শুধুমাত্র অ্যাডমিন ও শিক্ষকদের জন্য সংরক্ষিত।
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Header */}
      <Card className="border-emerald-100 shadow-sm rounded-2xl bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
        <CardHeader className="p-5 border-b border-emerald-100/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-[#052E2B] flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                Assigned Students Result Sheet
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                নির্দিষ্ট শিক্ষকের অ্যাসাইন্ড গ্রুপ বা সকল অ্যাসাইন্ড গ্রুপের শিক্ষাবৃত্তি/রেজাল্ট শিট ও প্রফেশনাল PDF
              </p>
            </div>

            {/* Super Admin Two-Branch Toggle */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-emerald-100/60 p-1.5 rounded-xl border border-emerald-200">
                <Button
                  variant={!isCombinedBranch ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs rounded-lg h-7 font-bold ${!isCombinedBranch ? 'bg-[#052E2B] text-white' : 'text-emerald-900 hover:bg-emerald-200'}`}
                  onClick={() => setIsCombinedBranch(false)}
                >
                  Single Branch
                </Button>
                <Button
                  variant={isCombinedBranch ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs rounded-lg h-7 font-bold ${isCombinedBranch ? 'bg-emerald-600 text-white' : 'text-emerald-900 hover:bg-emerald-200'}`}
                  onClick={() => setIsCombinedBranch(true)}
                >
                  Combined 2 Branches
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Step 1: Branch Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" /> 1. Branch *
              </label>
              <Select value={selBranchId} onValueChange={(v) => { setSelBranchId(v); setSelClassId(''); setSelExamId(''); }}>
                <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                      {b.name || `Branch ${b.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Combined Second Branch (Super Admin Only) */}
            {isCombinedBranch && isSuperAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-teal-600" /> + 2nd Branch
                </label>
                <Select value={selBranchId2} onValueChange={setSelBranchId2}>
                  <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs">
                    <SelectValue placeholder="Select 2nd Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.filter(b => String(b.id) !== String(selBranchId)).map((b) => (
                      <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                        {b.name || `Branch ${b.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 2: Class Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> 2. Class / Section *
              </label>
              <Select value={selClassId} onValueChange={(v) => { setSelClassId(v); setSelExamId(''); }} disabled={!selBranchId}>
                <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Exam Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-emerald-600" /> 3. Exam *
              </label>
              <Select value={selExamId} onValueChange={setSelExamId} disabled={!selClassId}>
                <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {filteredExams.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)} className="text-xs">
                      {e.title} {e.academic_year ? `(${e.academic_year})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 4: Teacher Select (OPTIONAL) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-teal-600" /> 4. Teacher (Optional)
              </label>
              <Select value={selTeacherId} onValueChange={setSelTeacherId} disabled={!selClassId}>
                <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs font-semibold text-emerald-800">
                    [ All Teachers / Applicable Groups ]
                  </SelectItem>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                      {t.full_name_bn || t.full_name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics & PDF Button */}
      {selClassId && selExamId && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3 py-1 font-sans text-xs">
              <strong>Teacher:</strong> {teacherSerialInfo.teacherName} (Teacher No: {teacherSerialInfo.serial} / {teacherSerialInfo.total})
            </Badge>

            <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-200 px-3 py-1 font-sans text-xs">
              <strong>Assigned Group:</strong> {groupSerialInfo.groupName} (Group No: {groupSerialInfo.serial} / {groupSerialInfo.total})
            </Badge>

            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 px-3 py-1 font-sans text-xs">
              <strong>Total Students:</strong> {finalDataset.length}
            </Badge>
          </div>

          <Button
            onClick={handlePrintPdf}
            disabled={isGeneratingPdf || finalDataset.length === 0}
            className="bg-[#052E2B] hover:bg-[#042422] text-white rounded-xl shadow-sm text-xs font-bold gap-2"
          >
            <Printer className="h-4 w-4" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Print Professional PDF'}
          </Button>
        </div>
      )}

      {/* Result Table */}
      {selClassId && selExamId && (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Displayed Dataset {isCombinedBranch ? '(Combined Merit Ranking)' : '(Numeric Roll Order)'}
              </CardTitle>

              {isCombinedBranch && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ⚡ Merit Order: Higher Total Marks → Small Rank #
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {finalDataset.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No student results found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 text-center w-12">SL</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Roll</th>
                      {isCombinedBranch && <th className="p-3 text-center">Branch</th>}
                      <th className="p-3 text-center">Group</th>
                      <th className="p-3 text-center">Assigned Teacher</th>
                      <th className="p-3 text-center">Obtained Marks</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {finalDataset.map((row) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-500">{row.sl}</td>
                        <td className="p-3 font-bold text-slate-800">{row.studentName}</td>
                        <td className="p-3 text-center font-semibold text-slate-700">{row.rollNumber}</td>
                        {isCombinedBranch && (
                          <td className="p-3 text-center text-slate-600 font-semibold">{row.branchName}</td>
                        )}
                        <td className="p-3 text-center text-slate-600">{row.groupName}</td>
                        <td className="p-3 text-center text-teal-800 font-semibold">{row.teacherName}</td>
                        <td className="p-3 text-center font-bold text-emerald-700 text-sm">{row.obtainedMarks}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            row.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.grade}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">#{row.meritRank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
