import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { appClient } from "@/api/appClient";

export function useAdminDashboardData({
  activeTab,
  isAdmin,
  currentUser,
  setShowStudentForm,
  setEditingStudent,
  setShowLogForm,
  setLogStudent,
}) {
  const queryClient = useQueryClient();
  const isAnalyticsOnly = activeTab === "analytics";

  const needsStudents = [
    "students",
    "student-attendance",
    "teachers",
    "fees",
    "hadiya",
  ].includes(activeTab);

  const needsTeachers = [
    "teachers",
    "teacher-attendance",
    "daily-lesson-tracker",
    "hadiya",
  ].includes(activeTab);

  const needsBranches = [
    "analytics",
    "students",
    "student-attendance",
    "teacher-attendance",
    "daily-lesson-tracker",
    "branches",
    "fees",
  ].includes(activeTab);

  const { data: dashData } = useQuery({
    queryKey: ["admin-dashboard-aggregation"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
    enabled: isAdmin === true && isAnalyticsOnly,
    staleTime: 30 * 60 * 1000,
  });

  const { data: rawStudents = [], isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => appClient.entities.Student.listAll({
      sort: "-created_date",
      select: "id,full_name_en,full_name_bn,roll_number,batch,class_name,status,total_pages_read,photo_url,mobile_number,father_name,mother_name,address,admission_date,admission_year,hadiya_amount,hadiya_note,notes,created_date,session,branch_id,class_id,session_id,class_group_id,assigned_teacher_id,custom_fields",
    }),
    enabled: isAdmin === true && needsStudents && !isAnalyticsOnly,
    staleTime: 15 * 60 * 1000,
  });

  const students = useMemo(() => {
    const unique = Array.from(new Map(rawStudents.map((s) => [String(s.id), s])).values());
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? unique.filter((s) => String(s.branch_id) === String(currentUser.branch_id))
      : unique;
  }, [rawStudents, currentUser]);

  const { data: rawLogs = [] } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => appClient.entities.ReadingLog.list("-date", 500, "id,student_id,date,pages_read,book_name,notes"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const allLogs = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawLogs.filter((l) => {
          const s = rawStudents.find((st) => String(st.id) === String(l.student_id));
          return s && String(s.branch_id) === String(currentUser.branch_id);
        })
      : rawLogs;
  }, [rawLogs, rawStudents, currentUser]);

  const { data: rawFees = [] } = useQuery({
    queryKey: ["admin-fees-overview"],
    queryFn: () => appClient.entities.Fee.list("-month", 500, "id,student_id,month,paid_amount,due_amount,status,payment_date"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const allFees = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawFees.filter((f) => {
          const s = rawStudents.find((st) => String(st.id) === String(f.student_id));
          return s && String(s.branch_id) === String(currentUser.branch_id);
        })
      : rawFees;
  }, [rawFees, rawStudents, currentUser]);

  const { data: rawAttendance = [] } = useQuery({
    queryKey: ["admin-attendance-overview"],
    queryFn: () => appClient.entities.Attendance.list("-date", 500, "id,student_id,date,status"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const allAttendance = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawAttendance.filter((a) => {
          const s = rawStudents.find((st) => String(st.id) === String(a.student_id));
          return s && String(s.branch_id) === String(currentUser.branch_id);
        })
      : rawAttendance;
  }, [rawAttendance, rawStudents, currentUser]);

  const { data: allExpenses = [] } = useQuery({
    queryKey: ["admin-expenses-overview"],
    queryFn: () => appClient.entities.Expense.list("-date", 500, "id,month,date,amount"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const { data: rawBoardingReports = [] } = useQuery({
    queryKey: ["admin-boarding-reports-overview"],
    queryFn: () => appClient.entities.BoardingDailyReport.list("-date", 500),
    enabled: false,
  });

  const boardingReports = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawBoardingReports.filter((r) => String(r.branch_id) === String(currentUser.branch_id))
      : rawBoardingReports;
  }, [rawBoardingReports, currentUser]);

  const { data: rawTeachers = [] } = useQuery({
    queryKey: ["admin-teachers-overview"],
    queryFn: () => appClient.entities.Teacher.list("-created_date", 50, "*"),
    enabled: isAdmin === true && needsTeachers,
    staleTime: 15 * 60 * 1000,
  });

  const allTeachers = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawTeachers.filter((t) => String(t.branch_id) === String(currentUser.branch_id))
      : rawTeachers;
  }, [rawTeachers, currentUser]);

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches-list-overview"],
    queryFn: () => appClient.entities.Branch.list(),
    enabled: isAdmin === true && needsBranches,
    staleTime: 15 * 60 * 1000,
  });

  const branches = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
      : rawBranches;
  }, [rawBranches, currentUser]);

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages-overview"],
    queryFn: () => appClient.entities.ContactMessage.list("-created_date", 50),
    enabled: isAdmin === true && activeTab === "messages",
    staleTime: 15 * 60 * 1000,
  });

  const { data: rawApps = [] } = useQuery({
    queryKey: ["admin-apps-overview"],
    queryFn: () => appClient.entities.AdmissionApplication.list("-created_date", 50),
    enabled: isAdmin === true && activeTab === "reserve",
    staleTime: 15 * 60 * 1000,
  });

  const apps = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawApps.filter((a) => String(a.branch_id) === String(currentUser.branch_id))
      : rawApps;
  }, [rawApps, currentUser]);

  const { data: rawTeacherSalaries = [] } = useQuery({
    queryKey: ["admin-teacher-salaries-overview"],
    queryFn: () => appClient.entities.TeacherSalaryProfile.list("id", 500),
    enabled: false,
  });

  const teacherSalaries = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawTeacherSalaries.filter((t) => {
          const teacher = rawTeachers.find((te) => String(te.id) === String(t.teacher_id));
          return teacher && String(t.branch_id) === String(currentUser.branch_id);
        })
      : rawTeacherSalaries;
  }, [rawTeacherSalaries, rawTeachers, currentUser]);

  const { data: rawTeacherPayments = [] } = useQuery({
    queryKey: ["admin-teacher-payments-overview"],
    queryFn: () => appClient.entities.TeacherPayment.list("id", 500),
    enabled: false,
  });

  const teacherPayments = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawTeacherPayments.filter((p) => {
          const t = rawTeachers.find((teacher) => teacher.teacher_id === p.teacher_id);
          return t && String(t.branch_id) === String(currentUser.branch_id);
        })
      : rawTeacherPayments;
  }, [rawTeacherPayments, rawTeachers, currentUser]);

  const { data: rawTeacherAttendance = [] } = useQuery({
    queryKey: ["admin-teacher-attendance-overview-dashboard"],
    queryFn: () => appClient.entities.TeacherAttendance.list("-date", 500),
    enabled: false,
  });

  const allTeacherAttendance = useMemo(() => {
    return currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
      ? rawTeacherAttendance.filter((a) => {
          const t = rawTeachers.find((teacher) => teacher.id === a.teacher_id);
          return t && String(t.branch_id) === String(currentUser.branch_id);
        })
      : rawTeacherAttendance;
  }, [rawTeacherAttendance, rawTeachers, currentUser]);

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events-list-overview"],
    queryFn: () => appClient.entities.Event.list("-created_date", 20),
    enabled: isAdmin === true && (activeTab === "analytics" || activeTab === "events"),
    staleTime: 15 * 60 * 1000,
  });

  const createStudentMut = useMutation({
    mutationFn: (data) => appClient.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setShowStudentForm(false);
      toast.success("Student added successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add student");
      console.error("Create student error:", error);
    }
  });

  const updateStudentMut = useMutation({
    mutationFn: async ({ id, data }) => {
      const updatedStudent = await appClient.entities.Student.update(id, data);
      try {
        const branchId = data.branch_id;
        const selectedBranch = branches.find((b) => String(b.id) === String(branchId));
        const branchName = selectedBranch ? (selectedBranch.name_bn || selectedBranch.name_en) : "";
        const className = data.class_name || "";

        const studentFees = await appClient.entities.Fee.filter({ student_id: id });
        for (const fee of studentFees) {
          await appClient.entities.Fee.update(fee.id, {
            student_name: data.full_name_en,
            roll_number: data.roll_number,
            branch_name: branchName,
            class_name: className
          });
        }
      } catch (err) {
        console.error("Failed to sync fees on student update:", err);
      }
      return updatedStudent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setShowStudentForm(false);
      setEditingStudent(null);
      toast.success("Student updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update student");
      console.error("Update student error:", error);
    }
  });

  const deleteStudentMut = useMutation({
    mutationFn: async (id) => {
      try {
        const studentFees = await appClient.entities.Fee.filter({ student_id: id });
        for (const fee of studentFees) {
          await appClient.entities.Fee.update(fee.id, {
            is_archived: true,
            student_id: null
          });
        }
      } catch (err) {
        console.error("Failed to archive fees on student delete:", err);
      }
      return appClient.entities.Student.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast.success("Student deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete student");
      console.error("Delete student error:", error);
    }
  });

  const createLogMut = useMutation({
    mutationFn: async (data) => {
      await appClient.entities.ReadingLog.create(data);
      const student = students.find((s) => s.id === data.student_id);
      if (student) {
        await appClient.entities.Student.update(student.id, {
          total_pages_read: (student.total_pages_read || 0) + data.pages_read,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      setShowLogForm(false);
      setLogStudent(null);
    },
  });

  const combinedNotifications = useMemo(() => {
    const formattedMessages = messages.map(m => ({
      id: `msg-${m.id}`,
      originalId: m.id,
      type: "sms",
      title: "Contact Message",
      name: m.name || "Anonymous",
      detail: m.subject || m.message || "",
      date: m.created_date,
      isNew: !m.is_read,
      badgeColor: "#10b981",
    }));

    const formattedApps = apps.map(a => ({
      id: `app-${a.id}`,
      originalId: a.id,
      type: "admission",
      title: "Admission App",
      name: a.full_name_bn || a.full_name_en || "Applicant",
      detail: `Desired Session: ${a.desired_session || "N/A"}`,
      date: a.created_date,
      isNew: a.status === "pending",
      badgeColor: "#3b82f6",
    }));

    return [...formattedMessages, ...formattedApps].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [messages, apps]);

  const unreadNotificationsCount = useMemo(() => {
    return messages.filter(m => !m.is_read).length + apps.filter(a => a.status === "pending").length;
  }, [messages, apps]);

  return {
    queryClient,
    dashData,
    rawStudents,
    students,
    isLoading,
    rawLogs,
    allLogs,
    rawFees,
    allFees,
    rawAttendance,
    allAttendance,
    allExpenses,
    rawBoardingReports,
    boardingReports,
    rawTeachers,
    allTeachers,
    rawBranches,
    branches,
    messages,
    rawApps,
    apps,
    rawTeacherSalaries,
    teacherSalaries,
    rawTeacherPayments,
    teacherPayments,
    rawTeacherAttendance,
    allTeacherAttendance,
    events,
    createStudentMut,
    updateStudentMut,
    deleteStudentMut,
    createLogMut,
    combinedNotifications,
    unreadNotificationsCount,
  };
}
