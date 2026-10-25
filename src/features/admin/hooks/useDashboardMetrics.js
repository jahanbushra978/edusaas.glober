import { useMemo } from "react";
import { isStudentInClassOption } from "@/lib/academic";
import { getAccountingPeriod, getDateKey, isRecordInAccountingPeriod } from "@/lib/periods";

const getClassNameStr = (c) => {
  if (typeof c.class_name === "string") return c.class_name;
  return c.class_name?.en || c.class_name?.bn || c.class_name?.ar || "";
};

export function useDashboardMetrics({
  agg,
  students = [],
  allAttendance = [],
  allFees = [],
  allExpenses = [],
  teacherSalaries = [],
  teacherPayments = [],
  allTeacherAttendance = [],
  rawTeacherAttendance,
  rawTeacherPayments,
  events = [],
  rawLogs,
  allLogs = [],
  boardingReports = [],
  branches = [],
  branchFilter = "all",
  classFilter = "all",
  sessionFilter = "all",
  groupFilter = "all",
  search = "",
  allTeachers = [],
  apps = [],
  messages = [],
}) {
  const classOptions = useMemo(() => {
    const uniqueClasses = [];
    const seenIds = new Set();
    const activeBranches = branchFilter === "all"
      ? branches
      : branches.filter((b) => String(b.id) === String(branchFilter));

    activeBranches.forEach((b) => {
      if (Array.isArray(b.academic_structure)) {
        b.academic_structure.forEach((c) => {
          if (c.id && !seenIds.has(String(c.id))) {
            seenIds.add(String(c.id));
            const name = getClassNameStr(c);
            uniqueClasses.push({ value: String(c.id), label: name });
          }
        });
      }
    });
    return uniqueClasses.sort((a, b) => a.label.localeCompare(b.label));
  }, [branches, branchFilter]);

  const sessionOptions = useMemo(() => {
    if (classFilter === "all") return [];
    const activeBranches = branchFilter === "all" ? branches : branches.filter((b) => String(b.id) === String(branchFilter));
    for (const b of activeBranches) {
      if (Array.isArray(b.academic_structure)) {
        const cls = b.academic_structure.find((c) => String(c.id) === String(classFilter));
        if (cls && Array.isArray(cls.sections)) {
          return cls.sections.map((s) => {
            const name = s.section_name?.bn || s.section_name?.en || s.section?.bn || s.section?.en || "";
            return { value: String(s.id), label: name };
          });
        }
      }
    }
    return [];
  }, [branches, branchFilter, classFilter]);

  const groupOptions = useMemo(() => {
    if (classFilter === "all") return [];
    const activeBranches = branchFilter === "all" ? branches : branches.filter((b) => String(b.id) === String(branchFilter));
    for (const b of activeBranches) {
      if (Array.isArray(b.academic_structure)) {
        const cls = b.academic_structure.find((c) => String(c.id) === String(classFilter));
        if (cls && Array.isArray(cls.groups)) {
          return cls.groups.map((g) => {
            const name = g.group_name?.bn || g.group_name?.en || "";
            return { value: String(g.id), label: name };
          });
        }
      }
    }
    return [];
  }, [branches, branchFilter, classFilter]);

  const activeCount = agg?.students?.active ?? students.filter((s) => s.status === "active").length;

  const now = new Date();
  const currentPeriod = getAccountingPeriod(now);
  const thisMonthKey = currentPeriod.key;
  const todayKey = getDateKey(now);

  const todayAttendance = allAttendance.filter((a) => a.date === todayKey);
  const todayPresentCount = agg?.attendance?.today?.present ?? todayAttendance.filter((a) => a.status === "present").length;

  const thisMonthFees = allFees.filter((f) => isRecordInAccountingPeriod(f, thisMonthKey) && !f.is_archived);
  const thisMonthIncome = agg?.income?.monthly ?? thisMonthFees.reduce((s, f) => s + (f.paid_amount || 0), 0);
  const thisMonthFeeStudents = agg?.fees?.studentsPaid ?? new Set(thisMonthFees.filter((f) => f.status === "paid" || f.status === "partial").map((f) => f.student_id)).size;

  const thisMonthExpense = agg?.expense?.rawExpense ?? allExpenses
    .filter((e) => isRecordInAccountingPeriod(e, thisMonthKey) && !e.is_archived)
    .reduce((s, e) => s + (e.amount || 0), 0);

  const currentPeriodDueFees = thisMonthFees.filter((f) => ["due", "partial", "overdue"].includes(String(f.status || "").toLowerCase()));
  const studentsWithDues = new Set(currentPeriodDueFees.map((f) => f.student_id));
  const overdueFeeCount = agg?.fees?.overdueCount ?? studentsWithDues.size;
  const totalDueAmount = agg?.fees?.totalDue ?? currentPeriodDueFees.reduce((s, f) => s + (f.due_amount || 0), 0);

  const expectedMonthlySalary = agg?.teacherSalary?.expectedMonthly ?? teacherSalaries
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const paidTeacherSalaryThisMonth = agg?.teacherSalary?.paidThisMonth ?? teacherPayments
    .filter((p) => isRecordInAccountingPeriod(p, thisMonthKey) && !p.is_archived)
    .reduce((sum, p) => sum + (p.paid_amount || 0), 0);

  const remainingSalaryThisMonth = agg?.teacherSalary?.remaining ?? Math.max(0, expectedMonthlySalary - paidTeacherSalaryThisMonth);

  const todayTeacherAttendance = allTeacherAttendance.filter((a) => a.date === todayKey);
  const todayTeacherPresentCount = agg?.attendance?.teacherToday?.present ?? todayTeacherAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const todayTeacherAbsentCount = agg?.attendance?.teacherToday?.absent ?? todayTeacherAttendance.filter((a) => a.status === "absent").length;

  const monthlyIncome = agg?.income?.monthly ?? thisMonthIncome;
  const monthlyExpense = agg?.expense?.monthly ?? (thisMonthExpense + paidTeacherSalaryThisMonth);
  const netProfit = agg ? Math.max(0, agg.income.monthly - agg.expense.monthly) : Math.max(0, monthlyIncome - monthlyExpense);

  const monthlyBoardingReports = boardingReports.filter((r) => isRecordInAccountingPeriod(r, thisMonthKey) && !r.is_archived);
  const monthlyBoardingExpense = agg?.boarding?.monthlyExpense ?? monthlyBoardingReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
  const monthlyBoardingSaved = agg?.boarding?.monthlySaved ?? monthlyBoardingReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
  const pendingBoardingCount = agg?.boarding?.pendingCount ?? boardingReports.filter((r) => r.status === "Pending").length;

  const isTeacherAttendanceAvailable = agg ? true : (rawTeacherAttendance && Array.isArray(rawTeacherAttendance));
  const isTeacherPaymentAvailable = agg ? true : (rawTeacherPayments && Array.isArray(rawTeacherPayments));
  const isEventAvailable = agg ? agg.events.length > 0 : (events && Array.isArray(events));
  const isReadingScoreAvailable = agg ? agg.readingChart.length > 0 : (rawLogs && Array.isArray(rawLogs));

  const topReaders = agg?.topReaders ?? [...students].sort((a, b) => (b.total_pages_read || 0) - (a.total_pages_read || 0)).slice(0, 5);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchSearch = !q ||
        s.full_name_en?.toLowerCase().includes(q) ||
        s.full_name_bn?.includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        (s.class_name || "").toLowerCase().includes(q);

      const matchBranch = branchFilter === "all" || String(s.branch_id) === String(branchFilter);
      const bObj = branches.find((b) => String(b.id) === String(s.branch_id));
      const matchClass = classFilter === "all" || isStudentInClassOption(s, classFilter, bObj?.academic_structure);
      const matchSession = sessionFilter === "all" || isStudentInClassOption(s, sessionFilter, bObj?.academic_structure);
      const matchGroup = groupFilter === "all" || String(s.class_group_id) === String(groupFilter);

      return matchSearch && matchBranch && matchClass && matchSession && matchGroup;
    });
  }, [students, search, branchFilter, classFilter, sessionFilter, groupFilter, branches]);

  const analyticsProps = {
    agg,
    students,
    activeCount,
    allTeachers,
    monthlyIncome,
    monthlyExpense,
    totalDueAmount,
    overdueFeeCount,
    netProfit,
    thisMonthIncome,
    thisMonthFeeStudents,
    expectedMonthlySalary,
    paidTeacherSalaryThisMonth,
    remainingSalaryThisMonth,
    isTeacherPaymentAvailable,
    rawStudents: students,
    monthlyBoardingExpense,
    monthlyBoardingSaved,
    pendingBoardingCount,
    todayPresentCount,
    todayAttendance,
    isTeacherAttendanceAvailable,
    todayTeacherPresentCount,
    todayTeacherAbsentCount,
    apps,
    messages,
    isEventAvailable,
    events,
    isReadingScoreAvailable,
    topReaders,
  };

  return {
    classOptions,
    sessionOptions,
    groupOptions,
    activeCount,
    filtered,
    topReaders,
    analyticsProps,
  };
}
