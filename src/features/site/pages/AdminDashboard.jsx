"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";

import { appClient } from "@/api/appClient";
import PeriodNotificationBanner from "../../admin/components/PeriodNotificationBanner";
import { SearchProvider } from "./SearchContext";
import SearchOverlay from "../../admin/components/SearchOverlay";

import DashboardSidebar, { sidebarCategories, isFeatureAllowedForUser } from "@/features/admin/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/features/admin/components/dashboard/DashboardHeader";
import StudentsTab from "@/features/admin/components/dashboard/StudentsTab";
import DashboardTabsContent from "@/features/admin/components/dashboard/DashboardTabsContent";
import StudentDialogs from "@/features/admin/components/dashboard/StudentDialogs";
import AccountSuspendedScreen from "@/features/admin/components/dashboard/AccountSuspendedScreen";
import { useActiveTenant } from "@/features/admin/hooks/useActiveTenant";
import { useDashboardMetrics } from "@/features/admin/hooks/useDashboardMetrics";
import { useAdminDashboardData } from "@/features/admin/hooks/useAdminDashboardData";
import { exportStudentsAndTeachersCSV } from "@/features/admin/lib/exportData";

export default function AdminDashboard({ initialTab = "analytics" }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_student_search") || "";
    return "";
  });

  const [branchFilter, setBranchFilter] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_student_branch") || "all";
    return "all";
  });
  const [classFilter, setClassFilter] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_student_class") || "all";
    return "all";
  });
  const [sessionFilter, setSessionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logStudent, setLogStudent] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [visibleStudentCount, setVisibleStudentCount] = useState(30);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_active_tab") || initialTab;
    return initialTab;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_student_search", search);
      sessionStorage.setItem("admin_student_branch", branchFilter);
      sessionStorage.setItem("admin_student_class", classFilter);
      sessionStorage.setItem("admin_active_tab", activeTab);
    }
  }, [search, branchFilter, classFilter, activeTab]);

  useEffect(() => {
    const handleTabChange = () => {
      const tab = sessionStorage.getItem("admin_active_tab");
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("admin_tab_changed", handleTabChange);
    return () => window.removeEventListener("admin_tab_changed", handleTabChange);
  }, []);

  const {
    activeSchoolSlug,
    activeSchoolName,
    warningNotice,
    setWarningNotice,
    isAccountSuspended,
  } = useActiveTenant();

  useEffect(() => {
    setVisibleStudentCount(30);
  }, [search, branchFilter, classFilter, sessionFilter, groupFilter]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    appClient.auth.me().then((user) => {
      if (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager") {
        setIsAdmin(true);
        setCurrentUser(user);
        return;
      }
      setIsAdmin(false);
      appClient.auth.redirectToLogin("admin");
    }).catch(() => {
      setIsAdmin(false);
      appClient.auth.redirectToLogin("admin");
    });
  }, []);

  const {
    queryClient,
    dashData,
    students,
    isLoading,
    allLogs,
    rawLogs,
    allFees,
    allAttendance,
    allExpenses,
    rawBoardingReports,
    allTeachers,
    rawTeachers,
    rawBranches,
    branches,
    messages,
    apps,
    teacherSalaries,
    teacherPayments,
    rawTeacherPayments,
    allTeacherAttendance,
    rawTeacherAttendance,
    events,
    createStudentMut,
    updateStudentMut,
    deleteStudentMut,
    createLogMut,
    combinedNotifications,
    unreadNotificationsCount,
  } = useAdminDashboardData({
    activeTab,
    isAdmin,
    currentUser,
    setShowStudentForm,
    setEditingStudent,
    setShowLogForm,
    setLogStudent,
  });

  const isFeatureAllowed = (value) => isFeatureAllowedForUser(currentUser, rawBranches, value);

  useEffect(() => {
    if (currentUser && !isFeatureAllowed(activeTab)) {
      if (isFeatureAllowed("students")) {
        setActiveTab("students");
      } else {
        const firstAllowed = sidebarCategories
          .flatMap(c => c.items)
          .find(item => isFeatureAllowed(item.value));
        setActiveTab(firstAllowed ? firstAllowed.value : "analytics");
      }
    }
  }, [currentUser, activeTab, isFeatureAllowed]);

  useEffect(() => {
    if (localStorage.getItem("admin_sidebar_collapsed") === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", next ? "true" : "false");
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && activeSchoolSlug && branches?.length > 0) {
      const clean = activeSchoolSlug.toLowerCase().replace(/%20|\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      localStorage.setItem(`branches_${activeSchoolSlug}`, JSON.stringify(branches));
      localStorage.setItem(`branches_${clean}`, JSON.stringify(branches));
    }
  }, [activeSchoolSlug, branches]);

  const {
    classOptions,
    sessionOptions,
    groupOptions,
    filtered,
    analyticsProps,
  } = useDashboardMetrics({
    agg: activeTab === "analytics" && dashData?.ok ? dashData : null,
    students,
    allAttendance,
    allFees,
    allExpenses,
    teacherSalaries,
    teacherPayments,
    allTeacherAttendance,
    rawTeacherAttendance,
    rawTeacherPayments,
    events,
    rawLogs,
    allLogs,
    boardingReports: rawBoardingReports,
    branches,
    branchFilter,
    classFilter,
    sessionFilter,
    groupFilter,
    search,
    allTeachers: rawTeachers,
    apps,
    messages,
  });

  const visibleStudents = filtered.slice(0, visibleStudentCount);
  const hasMoreStudents = visibleStudents.length < filtered.length;

  const handleSaveStudent = async (data) => {
    const newRoll = (data.roll_number || "").trim().toLowerCase();
    if (newRoll) {
      const isDuplicate = students.some(s => 
        s.roll_number && 
        s.roll_number.trim().toLowerCase() === newRoll && 
        (!editingStudent || String(s.id) !== String(editingStudent.id))
      );
      if (isDuplicate) {
        setTimeout(() => document.querySelector("input[name='roll_number']")?.focus(), 50);
        throw new Error(`ডুপ্লিকেট প্রোটেকশন: এই আইডি/রোল নাম্বারটি (${data.roll_number}) ইতিমধ্যে অন্য একজন ছাত্রের জন্য ব্যবহার করা হয়েছে!`);
      }
    }

    if (editingStudent) {
      const saveData = { ...data };
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === "" || saveData[key] === null) delete saveData[key];
      });
      if (!saveData.password || saveData.password.trim() === "") delete saveData.password;
      await updateStudentMut.mutateAsync({ id: editingStudent.id, data: saveData });
    } else {
      await createStudentMut.mutateAsync(data);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Delete ${student.full_name_en}? This cannot be undone.`)) {
      await deleteStudentMut.mutateAsync(student.id);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <h2 className="text-xl font-semibold text-primary mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-4">Please log in to the Admin Portal.</p>
        <Link href="/admin">
          <Button className="gap-2">Admin Login</Button>
        </Link>
      </div>
    );
  }

  if (isAccountSuspended) {
    return <AccountSuspendedScreen schoolName={activeSchoolName} />;
  }

  return (
    <SearchProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-[#FAF8F5] text-slate-800 font-sans antialiased">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSchoolSlug={activeSchoolSlug}
          activeSchoolName={activeSchoolName}
          currentUser={currentUser}
          rawBranches={rawBranches}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* ── Right Content Panel ── */}
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto bg-[#FAF8F5]">
          <DashboardHeader
            setSidebarOpen={setSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            activeSchoolSlug={activeSchoolSlug}
            currentUser={currentUser}
            unreadNotificationsCount={unreadNotificationsCount}
            combinedNotifications={combinedNotifications}
            setActiveTab={setActiveTab}
            exportCSV={() => exportStudentsAndTeachersCSV({ students, allTeachers })}
          />

          {/* Main Content Area */}
          <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6">
            {warningNotice && (
              <div className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg border border-amber-400 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <AlertCircle size={22} className="shrink-0 text-slate-950" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-md mr-2">SaaS Console Notice</span>
                    <span className="text-xs sm:text-sm">{warningNotice}</span>
                  </div>
                </div>
                <button onClick={() => setWarningNotice(null)} className="text-slate-950 hover:bg-amber-600/40 px-3 py-1 rounded-xl text-xs font-extrabold shrink-0 border border-slate-950/20" type="button">
                  Dismiss
                </button>
              </div>
            )}

            <PeriodNotificationBanner onNavigateToPeriod={() => setActiveTab("period")} />

            <Tabs value={activeTab} onValueChange={(val) => { sessionStorage.removeItem("admin_student_branch"); sessionStorage.removeItem("admin_student_class"); setActiveTab(val); }} className="space-y-4 w-full min-w-0 border-0 shadow-none">
              <StudentsTab
                currentUser={currentUser}
                branches={branches}
                classOptions={classOptions}
                sessionOptions={sessionOptions}
                groupOptions={groupOptions}
                branchFilter={branchFilter}
                setBranchFilter={setBranchFilter}
                classFilter={classFilter}
                setClassFilter={setClassFilter}
                sessionFilter={sessionFilter}
                setSessionFilter={setSessionFilter}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                search={search}
                setSearch={setSearch}
                filtered={filtered}
                visibleStudents={visibleStudents}
                isLoading={isLoading}
                hasMoreStudents={hasMoreStudents}
                setVisibleStudentCount={setVisibleStudentCount}
                showImport={showImport}
                setShowImport={setShowImport}
                queryClient={queryClient}
                setEditingStudent={setEditingStudent}
                setShowStudentForm={setShowStudentForm}
                setLogStudent={setLogStudent}
                setShowLogForm={setShowLogForm}
                handleDeleteStudent={handleDeleteStudent}
              />

              <DashboardTabsContent
                currentUser={currentUser}
                branches={branches}
                students={students}
                allTeachers={allTeachers}
                dashData={dashData}
                setActiveTab={setActiveTab}
                setShowStudentForm={setShowStudentForm}
                setEditingStudent={setEditingStudent}
                analyticsProps={analyticsProps}
              />
            </Tabs>
          </main>
        </div>

        <StudentDialogs
          showStudentForm={showStudentForm}
          setShowStudentForm={setShowStudentForm}
          editingStudent={editingStudent}
          setEditingStudent={setEditingStudent}
          handleSaveStudent={handleSaveStudent}
          currentUser={currentUser}
          showLogForm={showLogForm}
          setShowLogForm={setShowLogForm}
          logStudent={logStudent}
          setLogStudent={setLogStudent}
          createLogMut={createLogMut}
        />

        <SearchOverlay />
      </div>
    </SearchProvider>
  );
}
