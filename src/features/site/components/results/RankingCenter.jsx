'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, Building2, BookOpen, Calendar, Users, 
  ShieldAlert, BarChart3, Info, UserCheck, Printer
} from 'lucide-react';
import { isStudentAssignedToTeacher, getStudentAssignedTeacher } from '@/lib/academic';

export default function RankingCenter({ currentUser }) {
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  // State
  const [rankingType, setRankingType] = useState('branch'); // branch | class | session | teacher | group
  const [selBranchId, setSelBranchId] = useState('all');
  const [selClassId, setSelClassId] = useState('all');
  const [selSession, setSelSession] = useState('all');
  const [selExamId, setSelExamId] = useState('all');
  const [selTeacherId, setSelTeacherId] = useState('all');

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(10);

  // Detail Modal state
  const [selectedEntityDetail, setSelectedEntityDetail] = useState(null);

  // Teacher's assigned-students ranking modal state
  const [teacherStudentsModal, setTeacherStudentsModal] = useState(null); // { teacher, rows, examLabel, isAllExams, rankRow, context }

  // Queries
  const { data: branches = [] } = useQuery({
    queryKey: ['ranking-branches'],
    queryFn: () => appClient.entities.Branch.listAll(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['ranking-exams'],
    queryFn: () => appClient.entities.Exam.listAll({ sort: '-academic_year' }),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['ranking-teachers'],
    queryFn: () => appClient.entities.Teacher.listAll(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['ranking-students'],
    queryFn: () => appClient.entities.Student.listAll({ sort: '-created_date' }),
  });

  const { data: examResults = [] } = useQuery({
    queryKey: ['ranking-results'],
    queryFn: () => appClient.entities.ExamResult.listAll(),
  });

  // Server-side ranking via RPC (branch/class/session only).
  // Falls back to client-side computation if the RPC is not deployed yet.
  const isRpcType = rankingType === 'branch' || rankingType === 'class' || rankingType === 'session';
  const { data: rpcRanking } = useQuery({
    queryKey: ['ranking-rpc', rankingType, selBranchId, selClassId, selSession, selExamId],
    queryFn: async () => {
      const user = await appClient.auth.me().catch(() => null);
      const orgId = user?.organization_id || null;
      const { data, error } = await supabase.rpc('get_entity_performance_ranking', {
        p_organization_id: orgId,
        p_ranking_type: rankingType,
        p_branch_id: selBranchId !== 'all' ? Number(selBranchId) : null,
        p_class_id: selClassId !== 'all' ? Number(selClassId) : null,
        p_session: selSession !== 'all' ? selSession : null,
        p_exam_id: selExamId !== 'all' ? Number(selExamId) : null,
        p_teacher_id: null,
        p_limit: 200,
        p_offset: 0,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: isRpcType && selTeacherId === 'all',
    retry: false,
  });

  // Extract unique sessions
  const availableSessions = useMemo(() => {
    const set = new Set();
    students.forEach(s => { if (s.session) set.add(String(s.session)); });
    exams.forEach(e => { if (e.session) set.add(String(e.session)); if (e.academic_year) set.add(String(e.academic_year)); });
    return Array.from(set).sort().reverse();
  }, [students, exams]);

  // Compute Ranking Dataset unconditionally (React Rules of Hooks)
  const fullRankingData = useMemo(() => {
    // Prefer the server-side RPC result when available (clean aggregates,
    // no client-side data transfer). Falls back to the client computation.
    if (isRpcType && selTeacherId === 'all' && Array.isArray(rpcRanking)) {
      if (rpcRanking.length > 0) {
        return rpcRanking.map((r, idx) => ({
          id: String(r.entity_id),
          entityName: r.entity_name,
          secondaryName: r.teacher_name || '',
          studentCount: Number(r.student_count),
          totalObtained: Number(r.total_obtained),
          totalFull: Number(r.total_full),
          passPct: Number(r.pass_pct),
          performancePct: Number(r.performance_pct),
          rank: idx + 1,
        }));
      }
      return [];
    }

    if (examResults.length === 0 || students.length === 0) return [];

    const statsMap = {}; // key -> aggregate object

    examResults.forEach(res => {
      const student = students.find(s => String(s.id) === String(res.student_id));
      if (!student || student.status === 'inactive') return;

      const exam = exams.find(e => String(e.id) === String(res.exam_id));

      // Global filters
      if (selExamId !== 'all' && String(res.exam_id) !== String(selExamId)) return;
      if (selSession !== 'all' && student.session !== selSession && exam?.session !== selSession && exam?.academic_year !== selSession) return;
      if (selBranchId !== 'all' && String(student.branch_id) !== String(selBranchId)) return;
      if (selClassId !== 'all' && String(student.class_id) !== String(selClassId)) return;
      if (selTeacherId !== 'all') {
        const targetTeacher = teachers.find(t => String(t.id) === String(selTeacherId));
        if (targetTeacher && !isStudentAssignedToTeacher(student, targetTeacher)) return;
      }

      let groupKey = '';
      let entityName = '';
      let secondaryName = '';
      let teacherId = null;

      if (rankingType === 'branch') {
        const branchObj = branches.find(b => String(b.id) === String(student.branch_id));
        groupKey = `branch_${student.branch_id || 'main'}`;
        entityName = branchObj ? branchObj.name : `Branch ${student.branch_id || 'Main'}`;
      } else if (rankingType === 'class') {
        groupKey = `class_${student.class_id || 'general'}`;
        entityName = `Class ${student.class_id || 'General'}`;
        if (student.branch_id) {
          const b = branches.find(br => String(br.id) === String(student.branch_id));
          secondaryName = b ? b.name : '';
        }
      } else if (rankingType === 'session') {
        groupKey = `session_${student.session || 'Default'}`;
        entityName = `Session ${student.session || 'Default'}`;
      } else if (rankingType === 'teacher') {
        const teacherObj = getStudentAssignedTeacher(student, teachers);
        teacherId = teacherObj?.id || null;
        groupKey = `teacher_${teacherObj?.id || 'none'}`;
        entityName = teacherObj ? (teacherObj.full_name_bn || teacherObj.full_name_en) : 'Unassigned';
        secondaryName = teacherObj ? (teacherObj.designation || teacherObj.department || '') : '';
      } else if (rankingType === 'group') {
        const grpId = student.class_group_id || 'general';
        const teacherObj = getStudentAssignedTeacher(student, teachers);
        groupKey = `group_${grpId}_teacher_${teacherObj?.id || 'none'}`;
        entityName = `Group ${grpId}`;
        secondaryName = teacherObj ? (teacherObj.full_name_bn || teacherObj.full_name_en) : 'No Teacher';
      }

      if (!statsMap[groupKey]) {
        statsMap[groupKey] = {
          id: groupKey,
          entityName,
          secondaryName,
          teacherId,
          studentIds: new Set(),
          totalObtained: 0,
          totalFull: 0,
          passCount: 0
        };
      }

      const item = statsMap[groupKey];
      item.studentIds.add(student.id);

      const obtained = Number(res.obtained_marks || 0);
      const fullMarks = Number(exam?.total_marks || 100);
      const passMarks = Number(exam?.pass_marks || (fullMarks * 0.33));

      item.totalObtained += obtained;
      item.totalFull += fullMarks;

      if ((res.grade && res.grade !== 'F') || obtained >= passMarks) {
        item.passCount += 1;
      }
    });

    const resultList = Object.values(statsMap).map(item => {
      const studentCount = item.studentIds.size;
      const performancePct = item.totalFull > 0 ? Number(((item.totalObtained / item.totalFull) * 100).toFixed(2)) : 0;
      const passPct = studentCount > 0 ? Number(((item.passCount / studentCount) * 100).toFixed(2)) : 0;

      return {
        ...item,
        studentCount,
        performancePct,
        passPct
      };
    });

    resultList.sort((a, b) => b.performancePct - a.performancePct || b.studentCount - a.studentCount);

    return resultList.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [examResults, students, exams, branches, teachers, rankingType, selBranchId, selClassId, selSession, selExamId, selTeacherId, rpcRanking, isRpcType]);

  // If not super admin, show access denied
  if (!isSuperAdmin) {
    return (
      <Card className="border-red-100 rounded-2xl bg-red-50/50 p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-900">Restricted Access / শুধুমাত্র সুপার এডমিন</h3>
        <p className="text-xs text-red-600 mt-1">
          র‍্যাঙ্কিং সেন্টারের পারফরম্যান্স ও এনালাইটিক্স ডাটা শুধুমাত্র সুপার এডমিনের জন্য সংরক্ষিত।
        </p>
      </Card>
    );
  }

  // Paginated dataset
  const displayedRanking = fullRankingData.slice(0, visibleCount);
  const hasMore = fullRankingData.length > visibleCount;

  // Print / Export ranking as a professional A4 document
  const handlePrintRanking = () => {
    if (fullRankingData.length === 0) return;

    const rowsHTML = fullRankingData.map((row) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">#${row.rank}</td>
        <td style="font-weight: 600;">${row.entityName}${row.secondaryName ? ` <span style="color:#64748b;font-size:10px;">— ${row.secondaryName}</span>` : ''}</td>
        <td style="text-align: center;">${row.studentCount}</td>
        <td style="text-align: center;">${row.passPct}%</td>
        <td style="text-align: center; font-weight: bold; color: #047857;">${row.performancePct}%</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Performance Ranking - ${rankingType.toUpperCase()}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; }
            .header { text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 10px; margin-bottom: 12px; }
            .inst-name { font-size: 20px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-title { display: inline-block; margin-top: 6px; padding: 3px 16px; background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; border-radius: 12px; font-size: 12px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #d97706; color: #ffffff; border: 1px solid #b45309; padding: 7px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            td { border: 1px solid #cbd5e1; padding: 6px 10px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #64748b; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="inst-name">Performance Ranking Leaderboard</div>
            <div class="doc-title">${rankingType.toUpperCase()} — Top ${fullRankingData.length} Entries</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55px; text-align: center;">Rank</th>
                <th>Entity Name</th>
                <th style="width: 110px; text-align: center;">Students</th>
                <th style="width: 100px; text-align: center;">Pass Rate</th>
                <th style="width: 110px; text-align: center;">Performance</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <div class="footer">
            <div>Print Date: ${new Date().toLocaleDateString('bn-BD')}</div>
            <div>Rahmania Institute</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  // Build the assigned-students ranking dataset for one teacher
  const openTeacherStudents = (teacherId, rankRow) => {
    const teacher = teachers.find(t => String(t.id) === String(teacherId));
    if (!teacher) return;

    const isAllExams = selExamId === 'all';
    const examLabel = !isAllExams
      ? (exams.find(e => String(e.id) === String(selExamId))?.title || 'Selected Exam')
      : 'All Exams';

    const assignedStudents = students.filter(s => {
      if (s.status === 'inactive') return false;
      if (!isStudentAssignedToTeacher(s, teacher)) return false;
      if (selBranchId !== 'all' && String(s.branch_id) !== String(selBranchId)) return false;
      if (selClassId !== 'all' && String(s.class_id) !== String(selClassId)) return false;
      if (selSession !== 'all' && s.session !== selSession) return false;
      return true;
    });

    // ── Context: primary class, group serial, teacher serial ──
    const classCounts = {};
    assignedStudents.forEach(s => {
      const key = s.class_name || `Class ${s.class_id}`;
      if (key) classCounts[key] = (classCounts[key] || 0) + 1;
    });
    const primaryClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const groupCounts = {};
    assignedStudents.forEach(s => {
      if (s.class_group_id) groupCounts[String(s.class_group_id)] = (groupCounts[String(s.class_group_id)] || 0) + 1;
    });
    const primaryGroupId = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Group number within the class (from the branch academic structure)
    let groupName = null;
    let groupSerial = null;
    let groupTotal = null;
    const branchId = teacher.branch_id || assignedStudents[0]?.branch_id;
    const branch = branches.find(b => String(b.id) === String(branchId));
    if (branch?.academic_structure && primaryGroupId) {
      let found = false;
      for (const c of branch.academic_structure) {
        const cNames = [
          typeof c.class_name === 'string' ? c.class_name : '',
          c.class_name?.bn || '',
          c.class_name?.en || '',
          c.class_name?.ar || '',
        ].map(n => String(n).trim().toLowerCase()).filter(Boolean);
        if (primaryClass && cNames.length > 0) {
          const pc = String(primaryClass).trim().toLowerCase();
          const classMatch = cNames.some(cn => pc === cn || pc.includes(cn) || cn.includes(pc));
          if (!classMatch) continue;
        }
        const secs = Array.isArray(c.sections) && c.sections.length > 0 ? c.sections : [{ id: c.id, groups: c.groups || [] }];
        for (const sec of secs) {
          const groups = sec.groups || [];
          const idx = groups.findIndex(g => String(g.id) === String(primaryGroupId));
          if (idx !== -1) {
            groupName = groups[idx].group_name?.bn || groups[idx].group_name?.en || `Group ${idx + 1}`;
            groupSerial = idx + 1;
            groupTotal = groups.length;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    // Teacher serial among teachers who teach the same class (ordered by assigned count)
    const sameClassTeachers = teachers.filter(t =>
      t && String(t.id) !== String(teacher.id) &&
      students.some(s => {
        if (s.status === 'inactive') return false;
        const sClass = s.class_name || `Class ${s.class_id}`;
        if (primaryClass && sClass !== primaryClass) return false;
        return isStudentAssignedToTeacher(s, t);
      })
    );
    const orderedTeachers = [teacher, ...sameClassTeachers]
      .map(t => ({
        t,
        count: students.filter(s => s.status !== 'inactive' && isStudentAssignedToTeacher(s, t)).length,
      }))
      .sort((a, b) => b.count - a.count || Number(a.t.id || 0) - Number(b.t.id || 0));
    const teacherSerial = orderedTeachers.findIndex(o => String(o.t.id) === String(teacher.id)) + 1;
    const teacherTotal = orderedTeachers.length;

    const rows = assignedStudents.map(student => {
      const resList = examResults.filter(r =>
        String(r.student_id) === String(student.id) &&
        (isAllExams || String(r.exam_id) === String(selExamId))
      );

      let obtained = 0;
      let totalFull = 0;
      let hasResult = false;
      let passed = false;

      if (isAllExams) {
        resList.forEach(r => {
          const exam = exams.find(e => String(e.id) === String(r.exam_id));
          const fullMarks = Number(exam?.total_marks || 100);
          const passMarks = Number(exam?.pass_marks || (fullMarks * 0.33));
          obtained += Number(r.obtained_marks || 0);
          totalFull += fullMarks;
          if ((r.grade && r.grade !== 'F') || Number(r.obtained_marks || 0) >= passMarks) passed = true;
        });
        hasResult = resList.length > 0;
      } else {
        const res = resList[0];
        if (res) {
          const exam = exams.find(e => String(e.id) === String(res.exam_id));
          const fullMarks = Number(exam?.total_marks || 100);
          const passMarks = Number(exam?.pass_marks || (fullMarks * 0.33));
          obtained = Number(res.obtained_marks || 0);
          totalFull = fullMarks;
          passed = (res.grade && res.grade !== 'F') || obtained >= passMarks;
          hasResult = true;
        }
      }

      return {
        studentId: student.id,
        name: student.full_name_bn || student.full_name_en || 'N/A',
        roll: student.roll_number || String(student.id),
        branchName: branches.find(b => String(b.id) === String(student.branch_id))?.name || '',
        className: student.class_name || student.batch || '',
        obtained,
        totalFull,
        hasResult,
        passed,
      };
    }).sort((a, b) => b.obtained - a.obtained)
      .map((row, idx) => ({ ...row, position: idx + 1 }));

    setTeacherStudentsModal({
      teacher,
      rows,
      examLabel,
      isAllExams,
      rankRow: rankRow || null,
      context: { primaryClass, groupName, groupSerial, groupTotal, teacherSerial, teacherTotal },
    });
  };

  // Print one teacher's assigned-students ranking
  const handlePrintTeacherStudents = () => {
    if (!teacherStudentsModal) return;
    const { teacher, rows, examLabel, rankRow, context } = teacherStudentsModal;

    const rowsHTML = rows.map(row => `
      <tr>
        <td style="text-align: center; font-weight: bold;">#${row.position}</td>
        <td style="font-weight: 600;">${row.name}</td>
        <td style="text-align: center;">${row.roll}</td>
        <td style="text-align: center;">${row.branchName || '-'}</td>
        <td style="text-align: center;">${row.className || '-'}</td>
        <td style="text-align: center; font-weight: bold;">${row.hasResult ? `${row.obtained} / ${row.totalFull}` : '—'}</td>
        <td style="text-align: center; ${row.hasResult && !row.passed ? 'color: #dc2626; font-weight: bold;' : ''}">${row.hasResult ? (row.passed ? 'Pass' : 'Fail') : 'No Result'}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assigned Students Ranking - ${teacher.full_name_en || teacher.full_name_bn}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; }
            .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px; }
            .inst-name { font-size: 20px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-title { display: inline-block; margin-top: 6px; padding: 3px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .meta { margin: 8px 0 12px; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #0f766e; color: #ffffff; border: 1px solid #0d9488; padding: 7px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            td { border: 1px solid #cbd5e1; padding: 6px 10px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #64748b; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="inst-name">Assigned Students Ranking</div>
            <div class="doc-title">${teacher.full_name_bn || teacher.full_name_en} ${teacher.designation ? `(${teacher.designation})` : ''}</div>
            <div class="meta">Exam: <strong>${examLabel}</strong> | Total Students: ${rows.length} | Date: ${new Date().toLocaleDateString('bn-BD')}</div>
            <div class="meta">
              ${rankRow ? `Teacher Rank: <strong>#${rankRow.rank}</strong>` : ''}
              ${context?.teacherSerial ? `| Teacher No (this class): <strong>${context.teacherSerial}/${context.teacherTotal}</strong>` : ''}
              ${context?.groupSerial ? `| Group No (this class): <strong>${context.groupSerial}/${context.groupTotal} ${context.groupName ? `(${context.groupName})` : ''}</strong>` : ''}
              ${rankRow ? `| Performance: <strong>${rankRow.performancePct}%</strong> | Pass Rate: <strong>${rankRow.passPct}%</strong>` : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55px; text-align: center;">Position</th>
                <th>Student Name</th>
                <th style="width: 80px; text-align: center;">Roll</th>
                <th style="width: 110px; text-align: center;">Branch</th>
                <th style="width: 100px; text-align: center;">Class</th>
                <th style="width: 100px; text-align: center;">Total Marks</th>
                <th style="width: 90px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <div class="footer">
            <div>Print Date: ${new Date().toLocaleDateString('bn-BD')}</div>
            <div>Rahmania Institute</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="border-amber-100 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-white shadow-sm rounded-2xl">
        <CardHeader className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Performance Ranking Center
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিউট্রিলাইজড পার্সেন্টেজ স্কোরভিত্তিক ব্রাঞ্চ, ক্লাস, সেশন ও গ্রুপ পারফরম্যান্স র‍্যাঙ্কিং
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs px-3 py-1">
              Super Admin Analytics
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Ranking Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { type: 'branch', label: 'Branch Ranking', icon: Building2 },
          { type: 'class', label: 'Class Ranking', icon: BookOpen },
          { type: 'session', label: 'Session Ranking', icon: Calendar },
          { type: 'teacher', label: 'Teacher Ranking', icon: UserCheck },
          { type: 'group', label: 'Group Ranking', icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = rankingType === item.type;
          return (
            <Button
              key={item.type}
              variant={isActive ? 'default' : 'outline'}
              className={`h-12 rounded-xl text-xs font-bold gap-2 transition-all ${
                isActive 
                  ? 'bg-[#052E2B] text-white shadow-md' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
              onClick={() => {
                setRankingType(item.type);
                setVisibleCount(10);
              }}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* Dynamic Filters */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Exam Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Exam Filter</label>
            <Select value={selExamId} onValueChange={v => { setSelExamId(v); setVisibleCount(10); }}>
              <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Session Filter</label>
            <Select value={selSession} onValueChange={v => { setSelSession(v); setVisibleCount(10); }}>
              <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {availableSessions.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter (For Branch Ranking) */}
          {rankingType === 'branch' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Class Filter</label>
              <Select value={selClassId} onValueChange={v => { setSelClassId(v); setVisibleCount(10); }}>
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.from(new Set(students.map(s => s.class_id).filter(Boolean))).map(cId => (
                    <SelectItem key={cId} value={String(cId)}>Class ID {cId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Branch Filter (For Class, Session, Group) */}
          {rankingType !== 'branch' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Branch Filter</label>
              <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setVisibleCount(10); }}>
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Teacher Filter (Teacher / Group Ranking Mode) */}
          {(rankingType === 'group' || rankingType === 'teacher') && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Teacher Filter</label>
              <Select value={selTeacherId} onValueChange={v => { setSelTeacherId(v); setVisibleCount(10); }}>
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.full_name_bn || t.full_name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Ranking Results Table */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Top Performance Leaderboard ({rankingType.toUpperCase()})
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Showing 1–{displayedRanking.length} of {fullRankingData.length} entries
              </span>
              <Button
                onClick={handlePrintRanking}
                disabled={fullRankingData.length === 0}
                className="h-8 text-xs font-bold gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4"
              >
                <Printer className="h-3.5 w-3.5" /> Print / Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {displayedRanking.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No performance records available for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 text-center w-16">Rank</th>
                    <th className="p-3">Entity Name</th>
                    {rankingType === 'group' && <th className="p-3">Assigned Teacher</th>}
                    <th className="p-3 text-center">Student Count</th>
                    <th className="p-3 text-center">Pass Rate %</th>
                    <th className="p-3 text-center">Performance Score %</th>
                    <th className="p-3 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedRanking.map((row) => (
                    <tr key={row.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full font-bold text-xs ${
                          row.rank === 1 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : row.rank === 2 
                            ? 'bg-slate-300 text-slate-800' 
                            : row.rank === 3 
                            ? 'bg-amber-700 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{row.rank}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-slate-900">
                        {rankingType === 'teacher' && row.teacherId ? (
                          <button
                            type="button"
                            onClick={() => openTeacherStudents(row.teacherId, row)}
                            className="text-left group hover:text-teal-700 transition-colors cursor-pointer"
                            title="View assigned students"
                          >
                            <span className="flex items-center gap-1.5">
                              {row.entityName}
                              <Users className="h-3.5 w-3.5 text-teal-600 opacity-60 group-hover:opacity-100" />
                            </span>
                          </button>
                        ) : (
                          row.entityName
                        )}
                        {row.secondaryName && (
                          <span className="block text-[11px] font-normal text-slate-500">{row.secondaryName}</span>
                        )}
                      </td>

                      {rankingType === 'group' && (
                        <td className="p-3 font-semibold text-teal-800">{row.secondaryName || 'N/A'}</td>
                      )}

                      <td className="p-3 text-center font-semibold text-slate-700">{row.studentCount}</td>

                      <td className="p-3 text-center font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          {row.passPct}%
                        </span>
                      </td>

                      <td className="p-3 text-center font-extrabold text-sm text-emerald-700">
                        {row.performancePct}%
                      </td>

                      <td className="p-3 text-center">
                        {rankingType === 'teacher' && row.teacherId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-teal-700 font-bold hover:bg-teal-50 mr-1"
                            onClick={() => openTeacherStudents(row.teacherId, row)}
                          >
                            <Users className="h-3.5 w-3.5 mr-1" /> Students
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-amber-800 font-bold hover:bg-amber-100"
                          onClick={() => setSelectedEntityDetail(row)}
                        >
                          <Info className="h-3.5 w-3.5 mr-1" /> Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer: Load More */}
      {displayedRanking.length > 0 && (
        <div className="text-center pt-2">
          {hasMore ? (
            <Button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="bg-[#052E2B] hover:bg-[#042422] text-white text-xs font-bold rounded-xl px-6 h-10 shadow-sm"
            >
              Load More (Showing 1–{displayedRanking.length})
            </Button>
          ) : (
            <p className="text-xs font-semibold text-slate-400">
              No more results available.
            </p>
          )}
        </div>
      )}

      {/* Detail Breakdown Modal */}
      {selectedEntityDetail && (
        <Dialog open={!!selectedEntityDetail} onOpenChange={() => setSelectedEntityDetail(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                {selectedEntityDetail.entityName} — Performance Detail
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-500 font-medium">Rank Position</p>
                  <p className="text-lg font-bold text-amber-600">#{selectedEntityDetail.rank}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Performance Score</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedEntityDetail.performancePct}%</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Total Students</p>
                  <p className="text-sm font-bold text-slate-800">{selectedEntityDetail.studentCount}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Pass Rate</p>
                  <p className="text-sm font-bold text-slate-800">{selectedEntityDetail.passPct}%</p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl text-xs" 
                  onClick={() => setSelectedEntityDetail(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Teacher's Assigned Students Ranking Modal */}
      {teacherStudentsModal && (
        <Dialog open={!!teacherStudentsModal} onOpenChange={() => setTeacherStudentsModal(null)}>
          <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-teal-600" />
                {teacherStudentsModal.teacher.full_name_bn || teacherStudentsModal.teacher.full_name_en}
                {teacherStudentsModal.teacher.designation ? ` (${teacherStudentsModal.teacher.designation})` : ''}
                <span className="text-xs font-semibold text-slate-400 ml-1">— Assigned Students Ranking</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Rank Summary Card — how this teacher/group stands vs others */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-gradient-to-r from-teal-50 via-emerald-50 to-white p-4 rounded-2xl border border-teal-100 text-xs">
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Teacher Rank (সব টিচারের মধ্যে)</p>
                  <p className="text-lg font-bold text-amber-600 mt-0.5">
                    {teacherStudentsModal.rankRow ? `#${teacherStudentsModal.rankRow.rank} / ${fullRankingData.length}` : '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Teacher No (এই ক্লাসে)</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {teacherStudentsModal.context.teacherSerial} / {teacherStudentsModal.context.teacherTotal}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Group No (এই ক্লাসে)</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {teacherStudentsModal.context.groupSerial
                      ? `${teacherStudentsModal.context.groupSerial} / ${teacherStudentsModal.context.groupTotal} ${teacherStudentsModal.context.groupName ? `(${teacherStudentsModal.context.groupName})` : ''}`
                      : '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Performance Score</p>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">
                    {teacherStudentsModal.rankRow ? `${teacherStudentsModal.rankRow.performancePct}%` : '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Pass Rate</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {teacherStudentsModal.rankRow ? `${teacherStudentsModal.rankRow.passPct}%` : '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Primary Class</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{teacherStudentsModal.context.primaryClass || '—'}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Assigned Students</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{teacherStudentsModal.rows.length}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-teal-100/60">
                  <p className="text-slate-500 font-medium">Top Student</p>
                  <p className="text-sm font-bold text-teal-700 mt-0.5 truncate">
                    {teacherStudentsModal.rows[0] ? `${teacherStudentsModal.rows[0].name} (#1)` : '—'}
                  </p>
                </div>
              </div>

              {/* Header Meta + Print */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3 py-1 text-xs font-sans">
                    Exam: <strong>{teacherStudentsModal.examLabel}</strong>
                  </Badge>
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 px-3 py-1 text-xs font-sans">
                    Students: <strong>{teacherStudentsModal.rows.length}</strong>
                  </Badge>
                </div>
                <Button
                  onClick={handlePrintTeacherStudents}
                  disabled={teacherStudentsModal.rows.length === 0}
                  className="bg-[#052E2B] hover:bg-[#042422] text-white rounded-xl text-xs font-bold gap-2 h-9 px-4"
                >
                  <Printer className="h-4 w-4" /> Print / Export Ranking
                </Button>
              </div>

              {teacherStudentsModal.rows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No assigned students found for the current filters.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-teal-50 text-teal-900 border-b border-teal-100 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3 text-center w-16">Position</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 text-center">Roll</th>
                        <th className="p-3 text-center">Branch</th>
                        <th className="p-3 text-center">Class</th>
                        <th className="p-3 text-center">Total Marks</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {teacherStudentsModal.rows.map((row) => (
                        <tr key={row.studentId} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-[11px] ${
                              row.position === 1 ? 'bg-amber-500 text-white' :
                              row.position === 2 ? 'bg-slate-300 text-slate-800' :
                              row.position === 3 ? 'bg-amber-700 text-white' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {row.position}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{row.name}</td>
                          <td className="p-3 text-center text-slate-600">{row.roll}</td>
                          <td className="p-3 text-center text-slate-600">{row.branchName || '-'}</td>
                          <td className="p-3 text-center text-slate-600">{row.className || '-'}</td>
                          <td className="p-3 text-center font-bold text-emerald-700">
                            {row.hasResult ? `${row.obtained} / ${row.totalFull}` : '—'}
                          </td>
                          <td className="p-3 text-center">
                            {row.hasResult ? (
                              <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                row.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                              }`}>
                                {row.passed ? 'Pass' : 'Fail'}
                              </span>
                            ) : (
                              <span className="text-slate-400">No Result</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-center pt-1">
                <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setTeacherStudentsModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
