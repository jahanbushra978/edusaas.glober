import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { resolveAcademicDisplayName, isStudentInClassOption } from "@/lib/academic";

import { appClient } from "@/api/appClient";
import { hasPermission } from "../../../lib/permissions";
import { SHOW_READING_PROGRESS } from "@/config/features";
import { getAccountingPeriod, getDateKey, isRecordInAccountingPeriod } from "@/lib/periods";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import {

  Users, BookOpen, GraduationCap, Plus, Upload, Trash2,

  Pencil, Eye, Loader2, Download, BarChart3, Award, UserCog, DollarSign, Settings, Bell, AlertCircle,

  CalendarCheck, Wallet, ArrowDownCircle, Clock, Trophy, Images, Building2, ImagePlay, LayoutDashboard, Menu, FileText, Mail, Quote, PanelLeftClose, PanelLeftOpen, Sparkles, Home, Calendar, Shield, Monitor, Layers, Palette, Activity
} from "lucide-react";


import ThemeToggle from "@/components/ui-custom/ThemeToggle";

import StudentCard from "@/components/ui-custom/StudentCard";

import Link from "next/link";

import { createPageUrl } from "@/utils";

import { format, startOfMonth, endOfMonth } from "date-fns";

import PeriodNotificationBanner from "../../admin/components/PeriodNotificationBanner";
import { SearchProvider } from "./SearchContext";
import GlobalSearchBar from "../../admin/components/GlobalSearchBar";
import SearchOverlay from "../../admin/components/SearchOverlay";

function AdminPanelSkeleton() {
  return (
    <Card className="rounded-[20px] border-gray-100 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-44 rounded-full bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-56 rounded-2xl bg-slate-100" />
      </div>
    </Card>
  );
}

const lazyPanel = (loader) => dynamic(loader, {
  loading: () => <AdminPanelSkeleton />,
  ssr: false,
});

const lazyNamed = (loader) => dynamic(loader, { ssr: false });

const BrandingSettings = lazyPanel(() => import("@/components/admin/BrandingSettings"));
const NoticeManager = lazyPanel(() => import("@/components/admin/NoticeManager"));
const StudentForm = lazyPanel(() => import("@/components/admin/StudentForm"));
const StudentAttendanceManager = lazyPanel(() => import("@/components/admin/StudentAttendanceManager"));
const TeacherAttendanceManager = lazyPanel(() => import("@/components/admin/TeacherAttendanceManager"));
const DailyLessonTracker = lazyPanel(() => import("@/components/admin/DailyLessonTracker"));
const ReadingLogForm = lazyPanel(() => import("@/components/admin/ReadingLogForm"));
const CSVImport = lazyPanel(() => import("@/components/admin/CSVImport"));
const TeacherManager = lazyPanel(() => import("@/components/admin/TeacherManager"));
const StudentFees = lazyPanel(() => import("@/components/admin/StudentFees"));
const HadiyaForm = lazyPanel(() => import("@/components/admin/HadiyaForm"));
const BoardingManager = lazyPanel(() => import("@/components/admin/BoardingManager"));

const ExamManager = lazyPanel(() => import("@/components/admin/ExamManager"));
const GalleryManager = lazyPanel(() => import("@/components/admin/GalleryManager"));
const VideoManager = lazyPanel(() => import("@/components/admin/VideoManager"));
const BranchManager = lazyPanel(() => import("@/components/admin/BranchManager"));
const AcademicStructureManager = lazyPanel(() => import("@/components/admin/AcademicStructureManager"));
const HeroSlideManager = lazyPanel(() => import("@/components/admin/HeroSlideManager"));
const PageSectionManager = lazyPanel(() => import("@/components/admin/PageSectionManager"));
const NavbarManager = lazyPanel(() => import("@/components/admin/NavbarManager"));
const AdmissionApplicationManager = lazyPanel(() => import("@/components/admin/AdmissionApplicationManager"));
const DownloadFormManager = lazyPanel(() => import("@/components/admin/DownloadFormManager"));
const ContactMessageManager = lazyPanel(() => import("@/components/admin/ContactMessageManager"));
const CourseManager = lazyPanel(() => import("@/components/admin/CourseManager"));
const TestimonialManager = lazyPanel(() => import("@/components/admin/TestimonialManager"));
const SuccessStoryManager = lazyPanel(() => import("@/components/admin/SuccessStoryManager"));
const EventManager = lazyPanel(() => import("@/components/admin/EventManager"));
const BlogManager = lazyPanel(() => import("@/components/admin/BlogManager"));
const FaqManager = lazyPanel(() => import("@/components/admin/FaqManager"));
const ContactInfoManager = lazyPanel(() => import("@/components/admin/ContactInfoManager"));
const SponsorManager = lazyPanel(() => import("@/components/admin/SponsorManager"));
const PeriodManager = lazyPanel(() => import("@/components/admin/PeriodManager"));
const DataManager = lazyPanel(() => import("@/components/admin/DataManager"));
const PromotionManager = lazyPanel(() => import("@/components/admin/PromotionManager"));
const CertificateManager = lazyPanel(() => import("@/components/admin/CertificateManager"));
const AttendanceManager = lazyPanel(() => import("@/components/admin/AttendanceManager"));
const BulkImportMapping = lazyPanel(() => import("@/components/admin/BulkImportMapping"));
const SecurityManager = lazyPanel(() => import("@/components/admin/SecurityManager"));
const ApplicationManager = lazyPanel(() => import("@/features/admin/components/ApplicationManager"));

const BarChart = lazyNamed(() => import("recharts").then((mod) => mod.BarChart));
const Bar = lazyNamed(() => import("recharts").then((mod) => mod.Bar));
const XAxis = lazyNamed(() => import("recharts").then((mod) => mod.XAxis));
const YAxis = lazyNamed(() => import("recharts").then((mod) => mod.YAxis));
const CartesianGrid = lazyNamed(() => import("recharts").then((mod) => mod.CartesianGrid));
const Tooltip = lazyNamed(() => import("recharts").then((mod) => mod.Tooltip));
const ResponsiveContainer = lazyNamed(() => import("recharts").then((mod) => mod.ResponsiveContainer));
const PieChart = lazyNamed(() => import("recharts").then((mod) => mod.PieChart));
const Pie = lazyNamed(() => import("recharts").then((mod) => mod.Pie));
const Cell = lazyNamed(() => import("recharts").then((mod) => mod.Cell));
const AreaChart = lazyNamed(() => import("recharts").then((mod) => mod.AreaChart));
const Area = lazyNamed(() => import("recharts").then((mod) => mod.Area));



export default function AdminDashboard({ initialTab = "analytics" }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_student_search") || "";
    }
    return "";
  });




  const [branchFilter, setBranchFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_student_branch") || "all";
    }
    return "all";
  });
  const [classFilter, setClassFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_student_class") || "all";
    }
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
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_active_tab") || initialTab;
    }
    return initialTab;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_student_search", search);
    }
  }, [search]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_student_branch", branchFilter);
    }
  }, [branchFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_student_class", classFilter);
    }
  }, [classFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_active_tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleTabChange = () => {
      const tab = sessionStorage.getItem("admin_active_tab");
      if (tab) {
        setActiveTab(tab);
      }
    };
    window.addEventListener("admin_tab_changed", handleTabChange);
    return () => window.removeEventListener("admin_tab_changed", handleTabChange);
  }, []);

  const resolveSchoolName = (slug) => {
    if (!slug || slug === "rahmania" || slug === "default") return "Rahmania Institute";
    if (slug === "rrr" || slug === "bushra-jahan") return "Bushra Jahan School";
    if (slug === "raa") return "Raa Institution";
    if (slug === "noorania") return "Noorania Madrasah";
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const [activeSchoolSlug, setActiveSchoolSlug] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("tenant") || sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug");
      if (slug) {
        sessionStorage.setItem("active_tenant_slug", slug);
        localStorage.setItem("active_tenant_slug", slug);
        return slug;
      }
    }
    return "rahmania";
  });

  const [activeSchoolName, setActiveSchoolName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("tenant") || sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug");
      if (slug) {
        return resolveSchoolName(slug);
      }
    }
    return "Rahmania Institute";
  });

  const [warningNotice, setWarningNotice] = useState(null);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      let slug = params.get("slug") || params.get("tenant");
      if (!slug) {
        slug = sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug") || "rahmania";
      } else {
        sessionStorage.setItem("active_tenant_slug", slug);
        localStorage.setItem("active_tenant_slug", slug);
      }

      if (slug) {
        setActiveSchoolSlug(slug);
        const name = resolveSchoolName(slug);
        setActiveSchoolName(name);
        document.title = `${name} - Management Suite`;

        // Check SaaS Warning Alert Notice
        const savedWarn = localStorage.getItem(`org_warning_${slug}`);
        if (savedWarn) {
          try {
            const parsed = JSON.parse(savedWarn);
            if (parsed && parsed.message) {
              setWarningNotice(parsed.message);
            }
          } catch (e) {
            console.error("Error loading warning:", e);
          }
        }

        // Check Account Suspension
        const savedOrgs = JSON.parse(localStorage.getItem("created_orgs") || "[]");
        const currentOrg = savedOrgs.find((o) => (o.slug || o.subdomain || "").toLowerCase() === slug.toLowerCase());
        if (currentOrg && currentOrg.status === "suspended") {
          setIsAccountSuspended(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    setVisibleStudentCount(30);
  }, [search, branchFilter, classFilter, sessionFilter, groupFilter]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    staleTime: 30 * 60 * 1000, // 30 minutes browser cache
  });

  const agg = isAnalyticsOnly && dashData?.ok ? dashData : null;

  const sidebarCategories = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", value: "analytics", icon: LayoutDashboard },
      ],
    },
    {
      title: "ACADEMIC",
      items: [
        { label: "Students", value: "students", icon: Users },
        { label: "Admissions", value: "reserve", icon: CalendarCheck },
        { label: "Teachers", value: "teachers", icon: UserCog },
        { label: "Examinations", value: "exams", icon: Trophy },
        { label: "Academic Structure", value: "academic-structure", icon: GraduationCap },
        { label: "🎓 Promote to Next Class", value: "promotion", icon: GraduationCap },
        { label: "📜 Certificates", value: "certificates", icon: FileText },
        { label: "📝 Applications & Approvals", value: "applications", icon: FileText },
      ],
    },
    {
      title: "ATTENDANCE & LESSONS",
      items: [
        { label: "Student Attendance", value: "student-attendance", icon: CalendarCheck },
        { label: "Teacher Attendance", value: "teacher-attendance", icon: Clock },
        { label: "Live Hajira Monitor", value: "live-attendance", icon: Activity, href: "/live-attendance" },
        { label: "Biometric Attendance", value: "attendance", icon: Monitor },
        { label: "Biometric Import", value: "biometric-import", icon: Upload },
        // { label: "Daily Quran Tracker", value: "daily-lesson-tracker", icon: BookOpen },
      ],
    },
    {
      title: "FINANCE",
      items: [
        { label: "Fees & Finance", value: "fees", icon: DollarSign },
        { label: "Teacher Hadiya", value: "hadiya", icon: Wallet },
        { label: "Boarding", value: "boarding", icon: Home },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { label: "Branches", value: "branches", icon: Building2 },
        { label: "Contact Messages", value: "messages", icon: Mail },
        { label: "News & Notices", value: "notices", icon: Bell },
        { label: "Gallery Manager", value: "gallery", icon: Images },
        { label: "Video Gallery", value: "videos", icon: ImagePlay },
        { label: "Download Forms", value: "downloadform", icon: FileText },
      ],
    },
    {
      title: "PROMOTION",
      items: [
        { label: "Testimonials", value: "testimonials", icon: Quote },
        { label: "Success Stories", value: "success_stories", icon: Trophy },
        { label: "Events", value: "events", icon: CalendarCheck },
        { label: "Blogs", value: "blogs", icon: FileText },
        { label: "FAQs", value: "faqs", icon: AlertCircle },
      ],
    },
    {
      title: "WEBSITE BUILDER",
      items: [
        { label: "⚡ Visual Page Builder", value: "page-builder", icon: Layers, href: "/admin/website/page-builder" },
        { label: "🎨 Theme Marketplace", value: "themes", icon: Palette, href: "/platform-console/themes" },
        { label: "🧭 Menu Builder", value: "menus", icon: Menu, href: "/platform-console/menus" },
        { label: "📝 Form Builder & Inbox", value: "forms", icon: FileText, href: "/platform-console/forms" },
        { label: "🖼️ Media Library", value: "media", icon: Images, href: "/platform-console/media" },
      ],
    },
    {
      title: "MARKETING CENTER",
      items: [
        { label: "Sponsor Management", value: "sponsors", icon: Sparkles },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Hero Slider", value: "hero", icon: ImagePlay },
        { label: "Pages Content", value: "pages", icon: LayoutDashboard },
        { label: "Navbar Menu", value: "navbar", icon: Menu },
        { label: "Contact Info", value: "contact_info", icon: Settings },
        { label: "Security Center", value: "security", icon: Shield },
        { label: "System Settings", value: "settings", icon: Settings },
        { label: "Accounting Period", value: "period", icon: Calendar },
        { label: "Data Management", value: "data-mgmt", icon: Shield },
      ],
    },
  ];



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

  useEffect(() => {
    if (currentUser) {
      if (!isFeatureAllowed(activeTab)) {
        if (isFeatureAllowed("students")) {
          setActiveTab("students");
        } else {
          const firstAllowed = sidebarCategories
            .flatMap(c => c.items)
            .find(item => isFeatureAllowed(item.value));
          if (firstAllowed) {
            setActiveTab(firstAllowed.value);
          } else {
            setActiveTab("analytics");
          }
        }
      }
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowFloatingMenu(true);
      } else {
        setShowFloatingMenu(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") {
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

  const allLogs = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawLogs.filter((l) => {
        const s = rawStudents.find(s => String(s.id) === String(l.student_id));
        return s && String(s.branch_id) === String(currentUser.branch_id);
      })
    : rawLogs;

  const { data: rawFees = [] } = useQuery({
    queryKey: ["admin-fees-overview"],
    queryFn: () => appClient.entities.Fee.list("-month", 500, "id,student_id,month,paid_amount,due_amount,status,payment_date"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const allFees = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawFees.filter((f) => {
        const s = rawStudents.find(s => String(s.id) === String(f.student_id));
        return s && String(s.branch_id) === String(currentUser.branch_id);
      })
    : rawFees;

  const { data: rawAttendance = [] } = useQuery({
    queryKey: ["admin-attendance-overview"],
    queryFn: () => appClient.entities.Attendance.list("-date", 500, "id,student_id,date,status"),
    enabled: false,
    staleTime: 15 * 60 * 1000,
  });

  const allAttendance = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawAttendance.filter((a) => {
        const s = rawStudents.find(s => String(s.id) === String(a.student_id));
        return s && String(s.branch_id) === String(currentUser.branch_id);
      })
    : rawAttendance;

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

  const boardingReports = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawBoardingReports.filter((r) => String(r.branch_id) === String(currentUser.branch_id))
    : rawBoardingReports;

  const { data: rawTeachers = [] } = useQuery({
    queryKey: ["admin-teachers-overview"],
    queryFn: () => appClient.entities.Teacher.list("-created_date", 50, "*"),
    enabled: isAdmin === true && needsTeachers,
    staleTime: 15 * 60 * 1000,
  });

  const allTeachers = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawTeachers.filter((t) => String(t.branch_id) === String(currentUser.branch_id))
    : rawTeachers;

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches-list-overview"],
    queryFn: () => appClient.entities.Branch.list(),
    enabled: isAdmin === true && needsBranches,
    staleTime: 15 * 60 * 1000,
  });

  const branches = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  useEffect(() => {
    if (typeof window !== "undefined" && activeSchoolSlug && branches && Array.isArray(branches) && branches.length > 0) {
      const clean = activeSchoolSlug.toLowerCase().replace(/%20|\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      localStorage.setItem(`branches_${activeSchoolSlug}`, JSON.stringify(branches));
      localStorage.setItem(`branches_${clean}`, JSON.stringify(branches));
    }
  }, [activeSchoolSlug, branches]);

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

  const apps = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawApps.filter((a) => String(a.branch_id) === String(currentUser.branch_id))
    : rawApps;

  const { data: rawTeacherSalaries = [] } = useQuery({
    queryKey: ["admin-teacher-salaries-overview"],
    queryFn: () => appClient.entities.TeacherSalaryProfile.list("id", 500),
    enabled: false,
  });

  const teacherSalaries = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawTeacherSalaries.filter((t) => {
        const teacher = rawTeachers.find(te => String(te.id) === String(t.teacher_id));
        return t && String(t.branch_id) === String(currentUser.branch_id);
      })
    : rawTeacherSalaries;

  const { data: rawTeacherPayments = [] } = useQuery({
    queryKey: ["admin-teacher-payments-overview"],
    queryFn: () => appClient.entities.TeacherPayment.list("id", 500),
    enabled: false,
  });

  const teacherPayments = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawTeacherPayments.filter((p) => {
        const t = rawTeachers.find((teacher) => teacher.teacher_id === p.teacher_id);
        return t && String(t.branch_id) === String(currentUser.branch_id);
      })
    : rawTeacherPayments;

  const { data: rawTeacherAttendance = [] } = useQuery({
    queryKey: ["admin-teacher-attendance-overview-dashboard"],
    queryFn: () => appClient.entities.TeacherAttendance.list("-date", 500),
    enabled: false,
  });

  const allTeacherAttendance = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawTeacherAttendance.filter((a) => {
        const t = rawTeachers.find((teacher) => teacher.id === a.teacher_id);
        return t && String(t.branch_id) === String(currentUser.branch_id);
      })
    : rawTeacherAttendance;

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events-list-overview"],
    queryFn: () => appClient.entities.Event.list("-created_date", 20),
    enabled: isAdmin === true && (activeTab === "analytics" || activeTab === "events"),
    staleTime: 15 * 60 * 1000,
  });

  const combinedNotifications = React.useMemo(() => {
    const formattedMessages = messages.map(m => ({
      id: `msg-${m.id}`,
      originalId: m.id,
      type: "sms",
      title: "Contact Message",
      name: m.name || "Anonymous",
      detail: m.subject || m.message || "",
      date: m.created_date,
      isNew: !m.is_read,
      badgeColor: "#10b981", // Emerald green for SMS
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
      badgeColor: "#3b82f6", // Blue for admission
    }));

    // Merge and sort by date descending
    return [...formattedMessages, ...formattedApps].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
  }, [messages, apps]);

  const unreadNotificationsCount = React.useMemo(() => {
    const unreadMessages = messages.filter(m => !m.is_read).length;
    const pendingApps = apps.filter(a => a.status === "pending").length;
    return unreadMessages + pendingApps;
  }, [messages, apps]);



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
        const selectedBranch = branches.find(b => String(b.id) === String(branchId));
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

      // Update student total_pages_read

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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-red-500/40 text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white">অ্যাাকাউন্ট সাময়িকভাবে স্থগিত (Suspended)</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            বিলিং পরিশোধ বকেয়া বা প্ল্যাটফর্ম নীতিমালার কারণে <b>{activeSchoolName}</b>-এর ড্যাশবোর্ড একসেস সাময়িকভাবে স্থগিত রাখা হয়েছে।
          </p>
          <div className="pt-2">
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700">
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      </div>
    );
  }



  const getClassNameStr = (c) => {
    if (typeof c.class_name === "string") return c.class_name;
    return c.class_name?.en || c.class_name?.bn || c.class_name?.ar || "";
  };

  const classOptions = (() => {
    const uniqueClasses = [];
    const seenIds = new Set();
    
    const activeBranches = branchFilter === "all" 
      ? branches 
      : branches.filter(b => String(b.id) === String(branchFilter));

    activeBranches.forEach(b => {
      if (Array.isArray(b.academic_structure)) {
        b.academic_structure.forEach(c => {
          if (c.id && !seenIds.has(String(c.id))) {
            seenIds.add(String(c.id));
            const name = getClassNameStr(c);
            uniqueClasses.push({ value: String(c.id), label: name });
          }
        });
      }
    });
    return uniqueClasses.sort((a, b) => a.label.localeCompare(b.label));
  })();

  const sessionOptions = (() => {
    if (classFilter === "all") return [];
    
    const activeBranches = branchFilter === "all" ? branches : branches.filter(b => String(b.id) === String(branchFilter));
    for (const b of activeBranches) {
      if (Array.isArray(b.academic_structure)) {
        const cls = b.academic_structure.find(c => String(c.id) === String(classFilter));
        if (cls && Array.isArray(cls.sections)) {
          return cls.sections.map(s => {
            const name = s.section_name?.bn || s.section_name?.en || s.section?.bn || s.section?.en || "";
            return { value: String(s.id), label: name };
          });
        }
      }
    }
    return [];
  })();

  const groupOptions = (() => {
    if (classFilter === "all") return [];
    
    const activeBranches = branchFilter === "all" ? branches : branches.filter(b => String(b.id) === String(branchFilter));
    for (const b of activeBranches) {
      if (Array.isArray(b.academic_structure)) {
        const cls = b.academic_structure.find(c => String(c.id) === String(classFilter));
        if (cls && Array.isArray(cls.groups)) {
          return cls.groups.map(g => {
            const name = g.group_name?.bn || g.group_name?.en || "";
            return { value: String(g.id), label: name };
          });
        }
      }
    }
    return [];
  })();

  const activeCount = agg?.students?.active ?? students.filter((s) => s.status === "active").length;

  const totalPages = students.reduce((sum, s) => sum + (s.total_pages_read || 0), 0);



  // This month

  const now = new Date();

  const currentPeriod = getAccountingPeriod(now);
  const thisMonthKey = currentPeriod.key;

  const monthStart = startOfMonth(now);

  const monthEnd = endOfMonth(now);



  // Today's attendance

  const todayKey = getDateKey(now);

  const todayAttendance = allAttendance.filter(a => a.date === todayKey);

  const todayPresentCount = agg?.attendance?.today?.present ?? todayAttendance.filter(a => a.status === "present").length;



  // This month income (fees paid this month)

  const thisMonthFees = allFees.filter(f => isRecordInAccountingPeriod(f, thisMonthKey) && !f.is_archived);

  const thisMonthIncome = agg?.income?.monthly ?? thisMonthFees.reduce((s, f) => s + (f.paid_amount || 0), 0);

  const thisMonthFeeStudents = agg?.fees?.studentsPaid ?? new Set(thisMonthFees.filter(f => f.status === "paid" || f.status === "partial").map(f => f.student_id)).size;



  // This month expense

  const thisMonthExpense = agg?.expense?.rawExpense ?? allExpenses
    .filter(e => isRecordInAccountingPeriod(e, thisMonthKey) && !e.is_archived)
    .reduce((s, e) => s + (e.amount || 0), 0);



  // Students with overdue fees

  const currentPeriodDueFees = thisMonthFees.filter(f => ["due", "partial", "overdue"].includes(String(f.status || "").toLowerCase()));
  const studentsWithDues = new Set(currentPeriodDueFees.map(f => f.student_id));
  const overdueFeeCount = agg?.fees?.overdueCount ?? studentsWithDues.size;
  const totalDueAmount = agg?.fees?.totalDue ?? currentPeriodDueFees.reduce((s, f) => s + (f.due_amount || 0), 0);



  // Students with low attendance (< 75%) in last 30 days

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAtt = allAttendance.filter(a => a.date && new Date(a.date) >= thirtyDaysAgo);
  const attByStudent = {};
  recentAtt.forEach(a => {
    if (!attByStudent[a.student_id]) attByStudent[a.student_id] = { total: 0, present: 0 };
    attByStudent[a.student_id].total++;
    if (a.status === "present") attByStudent[a.student_id].present++;
  });
  const lowAttendanceCount = agg?.attendance?.lowAttendanceStudents ?? Object.values(attByStudent).filter(v => v.total >= 5 && (v.present / v.total) < 0.75).length;



  const currentMonthNumber = currentPeriod.month;
  const currentYear = currentPeriod.year;

  // Teacher Salary statistics
  const expectedMonthlySalary = agg?.teacherSalary?.expectedMonthly ?? teacherSalaries
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const paidTeacherSalaryThisMonth = agg?.teacherSalary?.paidThisMonth ?? teacherPayments
    .filter(p => isRecordInAccountingPeriod(p, thisMonthKey) && !p.is_archived)
    .reduce((sum, p) => sum + (p.paid_amount || 0), 0);

  const remainingSalaryThisMonth = agg?.teacherSalary?.remaining ?? Math.max(0, expectedMonthlySalary - paidTeacherSalaryThisMonth);

  // Today's Teacher Attendance
  const todayTeacherAttendance = allTeacherAttendance.filter(a => a.date === todayKey);
  const todayTeacherPresentCount = agg?.attendance?.teacherToday?.present ?? todayTeacherAttendance.filter(a => a.status === "present" || a.status === "late").length;
  const todayTeacherAbsentCount = agg?.attendance?.teacherToday?.absent ?? todayTeacherAttendance.filter(a => a.status === "absent").length;

  // Let's redefine monthly income and monthly expense based on mockup
  // Income: sum of fees paid this month
  const monthlyIncome = agg?.income?.monthly ?? thisMonthIncome;
  // Expense: general expenses + teacher salary paid this month
  const monthlyExpense = agg?.expense?.monthly ?? (thisMonthExpense + paidTeacherSalaryThisMonth);
  // Net Profit: Income - Expense
  const netProfit = agg ? Math.max(0, agg.income.monthly - agg.expense.monthly) : Math.max(0, monthlyIncome - monthlyExpense);
  // Boarding stats calculations for main dashboard overview
  const todayStr = getDateKey();

  const todayBoardingReports = boardingReports.filter(r => r.date === todayStr);
  const monthlyBoardingReports = boardingReports.filter(r => isRecordInAccountingPeriod(r, thisMonthKey) && !r.is_archived);

  const todayBoardingExpense = agg?.boarding?.todayExpense ?? todayBoardingReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
  const monthlyBoardingExpense = agg?.boarding?.monthlyExpense ?? monthlyBoardingReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
  const totalBoardingExpense = boardingReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
  const todayBoardingSaved = todayBoardingReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
  const monthlyBoardingSaved = agg?.boarding?.monthlySaved ?? monthlyBoardingReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
  const totalBoardingSaved = boardingReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
  const pendingBoardingCount = agg?.boarding?.pendingCount ?? boardingReports.filter(r => r.status === "Pending").length;

  const netBoardingExpense = totalBoardingExpense;
  const monthlyNetBoardingExpense = monthlyBoardingExpense;

  // Availability Flags based on database check
  const isTeacherAttendanceAvailable = agg ? true : (rawTeacherAttendance && Array.isArray(rawTeacherAttendance));
  const isTeacherPaymentAvailable = agg ? true : (rawTeacherPayments && Array.isArray(rawTeacherPayments));
  const isEventAvailable = agg ? agg.events.length > 0 : (events && Array.isArray(events));
  const isReadingScoreAvailable = agg ? agg.readingChart.length > 0 : (rawLogs && Array.isArray(rawLogs));
  
  // Since activity_logs does not exist, we explicitly set this to false to auto-hide the Recent Activities widget
  const isActivityLogsAvailable = false;

  // Top readers
  const topReaders = agg?.topReaders ?? [...students].sort((a, b) => (b.total_pages_read || 0) - (a.total_pages_read || 0)).slice(0, 5);



  // Monthly reading stats for chart

  const monthlyStats = {};

  allLogs.forEach((l) => {

    if (!l.date) return;

    const d = new Date(l.date);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    monthlyStats[key] = (monthlyStats[key] || 0) + (l.pages_read || 0);

  });

  const chartData = agg ? agg.readingChart.map(m => ({ month: new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" }), pages: m.pages })) : Object.entries(monthlyStats)

    .sort(([a], [b]) => a.localeCompare(b))

    .slice(-6)

    .map(([key, pages]) => ({

      month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short" }),

      pages,

    }));



  const filtered = students.filter((s) => {

    const q = search.toLowerCase().trim();

    const matchSearch = !q ||

      s.full_name_en?.toLowerCase().includes(q) ||

      s.full_name_bn?.includes(q) ||

      s.roll_number?.toLowerCase().includes(q) ||

      (s.class_name || "").toLowerCase().includes(q);

    const matchBranch = branchFilter === "all" || String(s.branch_id) === String(branchFilter);
    const bObj = branches.find(b => String(b.id) === String(s.branch_id));
    const matchClass = classFilter === "all" || isStudentInClassOption(s, classFilter, bObj?.academic_structure);
    const matchSession = sessionFilter === "all" || isStudentInClassOption(s, sessionFilter, bObj?.academic_structure);
    const matchGroup = groupFilter === "all" || String(s.class_group_id) === String(groupFilter);

    return matchSearch && matchBranch && matchClass && matchSession && matchGroup;

  });

  const visibleStudents = filtered.slice(0, visibleStudentCount);
  const hasMoreStudents = visibleStudents.length < filtered.length;



  const handleSaveStudent = async (data) => {
    // Unique ID check
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
      // Remove empty/null fields to prevent overwriting existing data
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === "" || saveData[key] === null) {
          delete saveData[key];
        }
      });
      if (!saveData.password || saveData.password.trim() === "") {
        delete saveData.password;
      }
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



  


  const exportCSV = async () => {

    // Fetch teachers for the download

    let teachers = allTeachers;



    // --- Students Sheet ---

    const studentHeaders = ["Roll No", "Name (EN)", "Name (BN)", "Batch", "Session", "Status", "Pages Read", "Mobile", "Father", "Mother", "Address", "Admission Date", "Admission Year", "Hadiya Amount", "Hadiya Note", "Notes"];

    const studentRows = students.map((s) => [

      s.roll_number, s.full_name_en, s.full_name_bn || "", s.class_name || s.batch, s.session || "",

      s.status, s.total_pages_read || 0, s.mobile_number || "",

      s.father_name || "", s.mother_name || "", s.address || "",

      s.admission_date || "", s.admission_year || "",

      s.hadiya_amount || "", s.hadiya_note || "", s.notes || "",

    ]);



    // --- Teachers Sheet (appended after blank row) ---

    const teacherHeaders = ["Teacher ID", "Name (EN)", "Name (BN)", "Phone", "Email", "Subjects", "Batches", "Status", "Hadiya Amount", "Hadiya Note"];

    const teacherRows = teachers.map((t) => [

      t.teacher_id, t.full_name_en, t.full_name_bn || "", t.phone || "",

      t.user_email || "", t.subjects || "", t.assigned_batches || "",

      t.status, t.hadiya_amount || "", t.hadiya_note || "",

    ]);



    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const lines = [

      "=== Student List ===",

      studentHeaders.map(escape).join(","),

      ...studentRows.map(r => r.map(escape).join(",")),

      "",

      "=== Teacher List ===",

      teacherHeaders.map(escape).join(","),

      ...teacherRows.map(r => r.map(escape).join(",")),

    ];



    const csv = "\uFEFF" + lines.join("\n"); // BOM for Bengali encoding

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `rahmania_data_${format(new Date(), "yyyy-MM-dd")}.csv`;

    a.click();

    URL.revokeObjectURL(url);

  };



  const isFeatureAllowed = (value) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    if (value === "live-attendance") return true;
    if (value === "analytics") {
      if (currentUser.role === "boarding_manager") return false;
      return true;
    }

    const userBranch = rawBranches.find(b => String(b.id) === String(currentUser.branch_id));
    const boardingEnabled = userBranch ? userBranch.boarding_enabled === true : false;

    if (value === "boarding") {
      if (!boardingEnabled) return false;
    }

    return hasPermission(currentUser, value, "view");
  };

  const filteredSidebarCategories = sidebarCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => isFeatureAllowed(item.value)),
    }))
    .filter((category) => category.items.length > 0);

  const handleSidebarItemClick = (item) => {
    setSidebarOpen(false);
    if (item.value === "live-attendance") {
      window.open("/live-attendance", "_blank");
      return;
    }
    if (["page-builder", "themes", "menus", "forms", "media"].includes(item.value)) {
      window.location.href = `/admin/website/page-builder?slug=${activeSchoolSlug}`;
      return;
    }
    setActiveTab(item.value);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-[#033324]/30 select-none">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white border border-[#D4AF37]/30 shadow-sm flex-shrink-0">
          {activeSchoolSlug === "rahmania" || activeSchoolName === "Rahmania Institute" ? (
            <img src="/rahmania-logo-v2.png" loading="lazy" className="h-full w-full object-contain p-1" alt="Rahmania Logo" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal-500 to-emerald-700 text-white font-bold text-lg flex items-center justify-center">
              {activeSchoolName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white leading-tight font-serif truncate max-w-[140px]">
            {activeSchoolName}
          </h2>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] mt-0.5">
            MANAGEMENT SUITE
          </p>
        </div>
      </div>

      {/* Navigation Links Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#033324] [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredSidebarCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-emerald-500/60 uppercase select-none mb-2">
              {category.title}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => handleSidebarItemClick(item)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 group text-start ${
                      isActive
                        ? "bg-[#052E2B] text-[#D4AF37] border-l-4 border-[#D4AF37] shadow-sm font-bold"
                        : "text-emerald-100/90 hover:bg-[#033324] hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-[#D4AF37]" : "text-emerald-300/80 group-hover:text-emerald-200"
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <SearchProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-[#FAF8F5] text-slate-800 font-sans antialiased">
        {/* ── Left Sidebar (Desktop) ── */}
        <aside
          className={`hidden lg:flex flex-col bg-[#022c22] border-r border-[#022c22]/10 h-[100dvh] sticky top-0 text-white select-none shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarCollapsed ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-72 opacity-100"
          }`}
        >
          <div className="w-72 flex flex-col h-full shrink-0">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* ── Mobile Sidebar (Drawer) ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/55 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)}>
            <aside className="w-72 bg-[#022c22] h-full flex flex-col animate-slide-in-left text-white" onClick={(e) => e.stopPropagation()}>
              {renderSidebarContent()}
            </aside>
          </div>
        )}

        {/* ── Right Content Panel ── */}
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto bg-[#FAF8F5]">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 shadow-sm select-none">
            {/* Left Side: Sidebar Toggle & Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? "Restore Sidebar" : "Expand Workspace"}
                className="hidden lg:flex p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600 hover:text-[#052E2B] transition-colors duration-200"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
              <div className="relative flex-1 max-w-full sm:max-w-md group">
                <GlobalSearchBar />
              </div>
            </div>

            {/* Right Side: Session Badge, Notification, Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Page Builder Button */}
              <Link href={`/admin/website/page-builder?slug=${activeSchoolSlug}`}>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm h-8 px-3">
                  <Layers size={14} className="mr-1.5" /> ⚡ Page Builder
                </Button>
              </Link>

              {/* Quick AI Assistant Trigger */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold shadow-sm h-8 px-2.5 gap-1.5 cursor-pointer"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("toggle-ai-chat"));
                  }
                }}
                title="এআই সহকারী খুলুন (Alt+A)"
              >
                <Sparkles size={14} className="text-amber-500 animate-pulse" />
                <span className="hidden sm:inline">এআই সহকারী</span>
              </Button>

              <ThemeToggle />

              {/* Role Badge */}
              {currentUser?.role && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  currentUser.role === "admin"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : currentUser.role === "boarding_manager"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {currentUser.role === "admin" ? "Super Admin"
                    : currentUser.role === "boarding_manager" ? "Boarding Manager (বোর্ডিং ম্যানেজার)"
                    : "Branch Admin"}
                </span>
              )}

              {/* Notification Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-slate-600 focus:outline-none">
                    <Bell className="h-4.5 w-4.5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-white border border-white">
                        {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[92vw] sm:w-80 p-0 rounded-2xl shadow-xl border border-gray-100 overflow-hidden bg-white z-50">
                  {/* Popover Header */}
                  <div className="bg-[#022c22] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-xs font-bold tracking-wide">Inbox & Applications ({unreadNotificationsCount})</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-medium animate-pulse">New</span>
                    )}
                  </div>

                  {/* Popover List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {combinedNotifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs italic">
                        No incoming messages or applications.
                      </div>
                    ) : (
                      combinedNotifications.slice(0, 8).map((notif) => {
                        const date = notif.date ? new Date(notif.date).toLocaleDateString() : "";
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              setActiveTab(notif.type === "sms" ? "messages" : "reserve");
                            }}
                            className={`p-3 hover:bg-gray-50/80 transition-colors cursor-pointer text-left flex gap-3 relative ${
                              notif.isNew ? "bg-amber-50/15" : ""
                            }`}
                          >
                            {/* Dot indicator */}
                            {notif.isNew && (
                              <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-amber-500" />
                            )}
                            
                            {/* Left icon container */}
                            <div 
                              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" 
                              style={{ backgroundColor: `${notif.badgeColor}15`, color: notif.badgeColor }}
                            >
                              {notif.type === "sms" ? (
                                <Mail className="h-4 w-4" />
                              ) : (
                                <GraduationCap className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: notif.badgeColor }}>
                                  {notif.type === "sms" ? "SMS" : "Abedon"}
                                </span>
                                <span className="text-[9px] text-gray-400 font-medium">
                                  {date}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                                {notif.name}
                              </p>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {notif.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50 border-t border-gray-100 text-center">
                    <button 
                      onClick={() => setActiveTab("messages")}
                      className="py-2.5 text-[11px] text-[#022c22] hover:text-[#052E2B] font-bold hover:bg-gray-100 transition-colors block"
                    >
                      View Messages
                    </button>
                    <button 
                      onClick={() => setActiveTab("reserve")}
                      className="py-2.5 text-[11px] text-[#022c22] hover:text-[#052E2B] font-bold hover:bg-gray-100 transition-colors block"
                    >
                      View Admissions
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Existing buttons - Export */}
              <div className="flex items-center gap-2 ml-1">
                <Button
                  variant="premium-outline"
                  onClick={exportCSV}
                  className="gap-2 rounded-xl h-9.5 text-xs font-bold transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </header>

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
                <button onClick={() => setWarningNotice(null)} className="text-slate-950 hover:bg-amber-600/40 px-3 py-1 rounded-xl text-xs font-extrabold shrink-0 border border-slate-950/20">
                  Dismiss
                </button>
              </div>
            )}

            <PeriodNotificationBanner onNavigateToPeriod={() => setActiveTab("period")} />

            {/* Radix Tabs wrapper — only controls visual display, not state */}
            <Tabs value={activeTab} onValueChange={(val) => { sessionStorage.removeItem("admin_student_branch"); sessionStorage.removeItem("admin_student_class"); setActiveTab(val); }} className="space-y-4 w-full min-w-0 border-0 shadow-none">
              
              {/* ── Students Tab ── */}
              <TabsContent value="students" className="space-y-4">
                <div className="flex gap-2 flex-wrap justify-end">
                  {hasPermission(currentUser, 'students', 'import') && (
                    <Button variant="glass" onClick={() => setShowImport(!showImport)} className="gap-2 text-sm btn-hover-lift">
                      <Upload className="h-4 w-4" /> Import CSV
                    </Button>
                  )}
                  {hasPermission(currentUser, 'students', 'create') && (
                    <Button variant="premium" onClick={() => { setEditingStudent(null); setShowStudentForm(true); }} className="gap-2 text-sm btn-hover-lift">
                      <Plus className="h-4 w-4" /> Add Student
                    </Button>
                  )}
                </div>

                {showImport && (
                  <CSVImport onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    setShowImport(false);
                  }} />
                )}

                <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white">
                  <CardHeader className="border-b border-gray-50/50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <CardTitle className="text-base font-bold text-[#052E2B]">All Students ({filtered.length})</CardTitle>
                      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                        {/* Local Search Filter */}
                        <Input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Filter list by name/roll..."
                          className="w-full sm:w-44 h-9 rounded-xl border-gray-200 focus:border-[#052E2B] text-xs bg-gray-50 focus:bg-white shadow-sm"
                        />

                        {/* Branch Filter */}
                        <Select value={branchFilter} onValueChange={(val) => { setBranchFilter(val); setClassFilter("all"); }}>
                          <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl"><SelectValue placeholder="All Branches" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব শাখা (All Branches)</SelectItem>
                            {branches.map((b) => {
                              const nameBn = b.name_bn || b.name_en || b.branch_name;
                              return <SelectItem key={b.id} value={String(b.id)}>{nameBn}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>

                        {/* Class Filter */}
                        <Select value={classFilter} onValueChange={(val) => { setClassFilter(val); setSessionFilter("all"); setGroupFilter("all"); }}>
                          <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl"><SelectValue placeholder="All Classes" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব শ্রেণী (All Classes)</SelectItem>
                            {classOptions.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Session Filter */}
                        {sessionOptions.length > 0 && (
                          <Select value={sessionFilter} onValueChange={setSessionFilter}>
                            <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl"><SelectValue placeholder="All Sessions" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">সব সেশন (All Sessions)</SelectItem>
                              {sessionOptions.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Group Filter */}
                        {groupOptions.length > 0 && (
                          <Select value={groupFilter} onValueChange={setGroupFilter}>
                            <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl"><SelectValue placeholder="All Groups" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">সব গ্রুপ (All Groups)</SelectItem>
                              {groupOptions.map((g) => (
                                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">No students found</div>
                    ) : (
                      <>
                        {/* Mobile view cards */}
                        <div className="grid grid-cols-1 gap-3 md:hidden p-4">
                          {visibleStudents.map((s) => (
                            <div key={s.id} className="space-y-2">
                              <StudentCard student={s} />
                              <div className="flex justify-end gap-1 rounded-xl border border-gray-100 bg-white/80 px-2 py-1.5 dark:bg-slate-800">
                                {SHOW_READING_PROGRESS && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setLogStudent(s); setShowLogForm(true); }}>
                                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                                  </Button>
                                )}
                                {hasPermission(currentUser, 'students', 'edit') && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingStudent(s); setShowStudentForm(true); }}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {hasPermission(currentUser, 'students', 'delete') && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteStudent(s)}>
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Table View styled premium matching Al-Noor mockup */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Branch (শাখা)</th>
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Class (শ্রেণী)</th>
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                                <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Pages Read</th>
                                <th className="text-end py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {visibleStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                                  {/* ID / Roll badge */}
                                  <td className="py-4.5 px-6 font-semibold text-slate-500 text-xs font-mono">
                                    #{s.roll_number || "N/A"}
                                  </td>
                                  
                                  {/* Photo + name details */}
                                  <td className="py-4.5 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {s.photo_url ? (
                                          <img src={s.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                                        ) : (
                                          <span className="text-xs font-bold text-[#052E2B]">{s.full_name_en?.[0] || "?"}</span>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800 text-[14px] leading-tight">{s.full_name_en}</p>
                                        {s.full_name_bn && (
                                          <p className="text-xs text-gray-400 mt-1 leading-none font-medium">{s.full_name_bn}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {/* Branch */}
                                  <td className="py-4.5 px-6 hidden sm:table-cell text-gray-600 font-semibold font-sans">
                                    {(() => {
                                      const bObj = branches.find(b => String(b.id) === String(s.branch_id));
                                      return bObj ? (bObj.name_bn || bObj.name_en || bObj.branch_name) : "N/A";
                                    })()}
                                  </td>
                                  
                                  {/* Class */}
                                  <td className="py-4.5 px-6 hidden sm:table-cell text-gray-600 font-semibold font-sans max-w-[200px] break-words whitespace-normal text-xs">
                                    {(() => {
                                      const bObj = branches.find(b => String(b.id) === String(s.branch_id));
                                      const academicStructure = bObj?.academic_structure || [];
                                      return resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, academicStructure, 'bn') || s.class_name || s.batch || "N/A";
                                    })()}
                                  </td>
                                  
                                  {/* Status Badge */}
                                  <td className="py-4.5 px-6 hidden md:table-cell">
                                    <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold border transition-all duration-300 ${
                                      s.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : s.status === "graduated"
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-slate-50 text-slate-500 border-gray-150"
                                    }`}>
                                      {s.status === "active" ? "Active" : s.status === "graduated" ? "Graduated" : "Inactive"}
                                    </span>
                                  </td>
                                  
                                  {/* Pages read count */}
                                  <td className="py-4.5 px-6 font-bold text-emerald-700 text-[14px]">{s.total_pages_read || 0}</td>
                                  
                                  {/* Action Buttons */}
                                  <td className="py-4.5 px-6">
                                    <div className="flex justify-end gap-1.5">
                                      <Link href={`${createPageUrl("StudentProfile")}?id=${s.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-all"><Eye className="h-4 w-4" /></Button>
                                      </Link>
                                      {SHOW_READING_PROGRESS && (
                                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-all" onClick={() => { setLogStudent(s); setShowLogForm(true); }}>
                                          <BookOpen className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {hasPermission(currentUser, 'students', 'edit') && (
                                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg hover:bg-[#052E2B]/5 text-[#052E2B] hover:text-[#052E2B] transition-all" onClick={() => { setEditingStudent(s); setShowStudentForm(true); }}>
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {hasPermission(currentUser, 'students', 'delete') && (
                                        <Button variant="ghost" size="icon" className="h-8.5 w-8.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-all" onClick={() => handleDeleteStudent(s)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {hasMoreStudents && (
                          <div className="border-t border-gray-100 p-4 text-center">
                            <Button
                              variant="outline"
                              className="rounded-xl border-[#052E2B] text-[#052E2B] font-bold"
                              onClick={() => setVisibleStudentCount((count) => count + 50)}
                            >
                              Load More ({visibleStudents.length} of {filtered.length})
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* ── Student Attendance Tab ── */}
              <TabsContent value="student-attendance">
                <StudentAttendanceManager students={students} branches={branches} currentUser={currentUser} />
              </TabsContent>

              {/* ── Teacher Attendance Tab ── */}
              <TabsContent value="teacher-attendance">
                <TeacherAttendanceManager teachers={allTeachers} branches={branches} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceManager currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="applications">
                <ApplicationManager
                  currentUser={currentUser}
                  branches={branches}
                  settings={dashData?.settings || {}}
                />
              </TabsContent>

              <TabsContent value="biometric-import">
                <BulkImportMapping />
              </TabsContent>

              {/* ── Daily Lesson Tracker Tab ── */}
              <TabsContent value="daily-lesson-tracker">
                <DailyLessonTracker students={students} teachers={allTeachers} branches={branches} currentUser={currentUser} />
              </TabsContent>

              {/* ── Teachers Tab ── */}
              <TabsContent value="teachers">
                <TeacherManager students={students} currentUser={currentUser} />
              </TabsContent>

              {/* ── Fees Tab ── */}
              <TabsContent value="fees">
                <StudentFees students={students} currentUser={currentUser} />
              </TabsContent>

              {/* ── Hadiya Tab ── */}
              <TabsContent value="hadiya">
                <HadiyaForm students={students} teachers={allTeachers} currentUser={currentUser} />
              </TabsContent>

              {/* ── Exams Tab ── */}
              <TabsContent value="exams">
                <ExamManager students={students} currentUser={currentUser} />
              </TabsContent>

              {/* ── Gallery Tab ── */}
              <TabsContent value="gallery">
                <GalleryManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Video Gallery Tab ── */}
              <TabsContent value="videos">
                <VideoManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Boarding Tab ── */}
              <TabsContent value="boarding">
                <BoardingManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Branches Tab ── */}
              <TabsContent value="branches">
                <BranchManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Academic Structure Tab ── */}
              <TabsContent value="academic-structure">
                <AcademicStructureManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Promotion Tab ── */}
              <TabsContent value="promotion">
                <PromotionManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Certificates Tab ── */}
              <TabsContent value="certificates">
                <CertificateManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Hero Slides Tab ── */}
              <TabsContent value="hero">
                <HeroSlideManager />
              </TabsContent>



              {/* ── Settings Tab ── */}
              <TabsContent value="settings" className="m-0 border-none p-0 outline-none">
                <BrandingSettings />
              </TabsContent>

              <TabsContent value="security" className="m-0 border-none p-0 outline-none">
                <SecurityManager />
              </TabsContent>

              {/* ── Notices Tab ── */}
              <TabsContent value="notices">
                <NoticeManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Download Form Tab ── */}
              <TabsContent value="downloadform">
                <DownloadFormManager currentUser={currentUser} />
              </TabsContent>



              {/* ── Accounting Period Tab ── */}
              <TabsContent value="period">
                <PeriodManager />
              </TabsContent>

              {/* ── Data Management Tab ── */}
              <TabsContent value="data-mgmt">
                <DataManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Pages Tab ── */}
              <TabsContent value="pages">
                <PageSectionManager />
              </TabsContent>

              {/* ── Navbar Tab ── */}
              <TabsContent value="navbar">
                <NavbarManager />
              </TabsContent>

              {/* ── Reserve Tab ── */}
              <TabsContent value="reserve">
                <AdmissionApplicationManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Messages Tab ── */}
              <TabsContent value="messages">
                <ContactMessageManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Courses Tab ── */}
              <TabsContent value="courses">
                <CourseManager currentUser={currentUser} />
              </TabsContent>

              {/* ── Testimonials Tab ── */}
              <TabsContent value="testimonials">
                <TestimonialManager />
              </TabsContent>

              {/* ── Success Stories Tab ── */}
              <TabsContent value="success_stories">
                <SuccessStoryManager />
              </TabsContent>

              {/* ── Events Tab ── */}
              <TabsContent value="events">
                <EventManager />
              </TabsContent>

              {/* ── Blogs Tab ── */}
              <TabsContent value="blogs">
                <BlogManager />
              </TabsContent>

              {/* ── FAQs Tab ── */}
              <TabsContent value="faqs">
                <FaqManager />
              </TabsContent>

              {/* ── Contact Info Tab ── */}
              <TabsContent value="contact_info">
                <ContactInfoManager />
              </TabsContent>

              {/* ── Sponsor Management Tab ── */}
              <TabsContent value="sponsors">
                <SponsorManager />
              </TabsContent>

              {/* ── Analytics Tab ── */}
              {/* ── Analytics Tab ── */}
              <TabsContent value="analytics" className="space-y-6">
                {currentUser?.role === "boarding_manager" ? (
                  <BoardingManager currentUser={currentUser} />
                ) : (
                  <>
                {/* Row 1: Primary Stat Cards (6 columns) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {/* 1. Total Students */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Students</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-2xl font-bold text-slate-800 leading-tight">{agg?.students?.total ?? students.length}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">Active: {agg?.students?.active ?? activeCount}</p>
                    </div>
                  </div>

                  {/* 2. Total Teachers */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <UserCog className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Teachers</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-2xl font-bold text-slate-800 leading-tight">{agg?.teachers?.total ?? allTeachers.length}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">Active: {agg?.teachers?.active ?? allTeachers.filter(t => t.status === "active").length}</p>
                    </div>
                  </div>

                  {/* 3. Monthly Income */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Wallet className="h-5 w-5" />
                      </div>
                      {/* Green trend upward */}
                      <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 45 C 30 35, 40 15, 95 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M85 5 H 95 V 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Income</span>
                      <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{(agg?.income?.monthly ?? monthlyIncome).toLocaleString()}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
                    </div>
                  </div>

                  {/* 4. Monthly Expense */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5" />
                      </div>
                      {/* Red trend downward */}
                      <svg className="w-12 h-6 text-rose-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 5 C 30 15, 40 35, 95 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M85 45 H 95 V 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Expense</span>
                      <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{monthlyExpense.toLocaleString()}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
                    </div>
                  </div>

                  {/* 5. Fee Due */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      {/* Red trend upward */}
                      <svg className="w-12 h-6 text-rose-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 45 C 30 35, 40 25, 95 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M85 10 H 95 V 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Due</span>
                      <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{totalDueAmount.toLocaleString()}</h4>
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{overdueFeeCount} Students</p>
                    </div>
                  </div>

                  {/* 6. Net Profit */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      {/* Green trend upward */}
                      <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 45 C 30 35, 40 15, 95 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M85 5 H 95 V 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Profit</span>
                      <h4 className="text-xl font-extrabold text-[#052E2B] leading-tight mt-1">৳{netProfit.toLocaleString()}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Quick Actions */}
                <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-500 fill-blue-50" />
                    <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <button 
                      onClick={() => { setEditingStudent(null); setShowStudentForm(true); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border border-emerald-100/50 hover:border-emerald-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <Plus className="h-5 w-5 text-emerald-700" />
                      <span>Add Student</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("teachers"); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 text-blue-800 border border-blue-100/50 hover:border-blue-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <UserCog className="h-5 w-5 text-blue-700" />
                      <span>Add Teacher</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("fees"); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/50 hover:bg-teal-50 text-teal-800 border border-teal-100/50 hover:border-teal-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <DollarSign className="h-5 w-5 text-teal-700" />
                      <span>Collect Fee</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("student-attendance"); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-50 text-amber-800 border border-amber-100/50 hover:border-amber-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <CalendarCheck className="h-5 w-5 text-amber-700" />
                      <span>Take Attendance</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("exams"); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-purple-800 border border-purple-100/50 hover:border-purple-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <Award className="h-5 w-5 text-purple-700" />
                      <span>Add Result</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("reserve"); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 text-rose-800 border border-rose-100/50 hover:border-rose-200 transition-all font-semibold text-xs gap-2 active:scale-95"
                    >
                      <FileText className="h-5 w-5 text-rose-700" />
                      <span>Admission Form</span>
                    </button>
                  </div>
                </Card>

                {/* Row 3: Secondary Mini-Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {/* 1. Students Present */}
                  <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Students Present</span>
                      <span className="text-base font-extrabold text-slate-800">{todayPresentCount}</span>
                      <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
                    </div>
                  </div>

                  {/* 2. Students Absent */}
                  <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Students Absent</span>
                      <span className="text-base font-extrabold text-rose-600">{todayAttendance.filter(a => a.status === "absent").length}</span>
                      <span className="text-[9px] text-rose-400 ml-1 font-semibold">↓ Today</span>
                    </div>
                  </div>

                  {/* 3. Teachers Present */}
                  {isTeacherAttendanceAvailable && (
                    <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <UserCog className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Teachers Present</span>
                        <span className="text-base font-extrabold text-slate-800">{todayTeacherPresentCount}</span>
                        <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
                      </div>
                    </div>
                  )}

                  {/* 4. Teachers Absent */}
                  {isTeacherAttendanceAvailable && (
                    <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <UserCog className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Teachers Absent</span>
                        <span className="text-base font-extrabold text-orange-600">{todayTeacherAbsentCount}</span>
                        <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
                      </div>
                    </div>
                  )}

                  {/* 5. Pending Admissions */}
                  <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Pending Admission</span>
                      <span className="text-base font-extrabold text-slate-800">{apps.filter(a => a.status === "pending").length}</span>
                      <span className="text-[9px] text-slate-400 ml-1 font-semibold">This Month</span>
                    </div>
                  </div>

                  {/* 6. Pending Fees */}
                  <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Pending Fees</span>
                      <span className="text-base font-extrabold text-slate-800">{overdueFeeCount}</span>
                      <span className="text-[9px] text-amber-600 ml-1 font-bold">৳{totalDueAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 7. Unread Messages */}
                  <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Unread Messages</span>
                      <span className="text-base font-extrabold text-slate-800">{messages.filter(m => !m.is_read).length}</span>
                      <span className="text-[9px] text-slate-400 ml-1 font-semibold">New</span>
                    </div>
                  </div>
                </div>

                {/* Row 4: Financial Overview (Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pie Chart: Income breakdown */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                        <Award className="h-4.5 w-4.5 text-indigo-500 fill-indigo-50" />
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Financial Distribution</h3>
                      </div>
                      <div className="h-44 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Net Profit", value: netProfit || 1, color: "#10b981" },
                                { name: "Teacher Salary", value: paidTeacherSalaryThisMonth || 0, color: "#3b82f6" },
                                { name: "Other Expense", value: thisMonthExpense || 0, color: "#f97316" }
                              ].filter(item => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {[
                                { name: "Net Profit", value: netProfit || 1, color: "#10b981" },
                                { name: "Teacher Salary", value: paidTeacherSalaryThisMonth || 0, color: "#3b82f6" },
                                { name: "Other Expense", value: thisMonthExpense || 0, color: "#f97316" }
                              ].filter(item => item.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400">Total Income</span>
                          <span className="text-sm font-extrabold text-slate-800">৳{monthlyIncome.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span>Income</span>
                        </div>
                        <span className="font-bold text-slate-800">৳{monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block" />
                          <span>Expense</span>
                        </div>
                        <span className="font-bold text-slate-800">৳{monthlyExpense.toLocaleString()}</span>
                      </div>
                      {isTeacherPaymentAvailable && (
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                            <span>Teacher Salary</span>
                          </div>
                          <span className="font-bold text-slate-800">৳{paidTeacherSalaryThisMonth.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800">Net Profit</span>
                        <span className="font-extrabold text-emerald-800">৳{netProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Line Chart: Income vs Expense trend */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm lg:col-span-2 bg-white p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Income vs Expense</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Income</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 block"></span> Expense</div>
                      </div>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { day: "1", Income: Math.round(monthlyIncome * 0.15), Expense: Math.round(monthlyExpense * 0.20) },
                          { day: "8", Income: Math.round(monthlyIncome * 0.45), Expense: Math.round(monthlyExpense * 0.35) },
                          { day: "15", Income: Math.round(monthlyIncome * 0.65), Expense: Math.round(monthlyExpense * 0.60) },
                          { day: "22", Income: Math.round(monthlyIncome * 0.85), Expense: Math.round(monthlyExpense * 0.75) },
                          { day: "30", Income: monthlyIncome, Expense: monthlyExpense }
                        ]}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,.05)" }} />
                          <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                          <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Row 5: Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 1. Student Fees */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Student Fees</h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-xs text-slate-500">Total Collected</span>
                          <span className="text-sm font-bold text-emerald-600">৳{thisMonthIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-xs text-slate-500">Total Due</span>
                          <span className="text-sm font-bold text-rose-600">৳{totalDueAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-xs text-slate-500">Students Paid</span>
                          <span className="text-sm font-semibold text-slate-700">{thisMonthFeeStudents}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-slate-500">Students Due</span>
                          <span className="text-sm font-semibold text-rose-600">{overdueFeeCount}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("fees")}
                      className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      View All Students
                    </Button>
                  </Card>

                  {/* 2. Teacher Salary */}
                  {isTeacherPaymentAvailable ? (
                    <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                          <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Teacher Salary</h3>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-xs text-slate-500">Total Teachers</span>
                            <span className="text-sm font-semibold text-slate-700">{allTeachers.length}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-xs text-slate-500">Total Salary</span>
                            <span className="text-sm font-bold text-slate-800">৳{expectedMonthlySalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-xs text-slate-500">Paid Salary</span>
                            <span className="text-sm font-bold text-emerald-600">৳{paidTeacherSalaryThisMonth.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-slate-500">Due Salary</span>
                            <span className="text-sm font-bold text-rose-600">৳{remainingSalaryThisMonth.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("hadiya")}
                        className="w-full mt-5 rounded-xl border-blue-600 text-blue-600 hover:text-blue-700 font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        Manage Salaries
                      </Button>
                    </Card>
                  ) : (
                    <div className="hidden" /> // Hidden automatically if source unavailable
                  )}

                  {/* 3. Branch Overview */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Branch Overview</h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">Active</span>
                      </div>
                      <div className="space-y-3">
                        {branches.slice(0, 3).map((branch) => {
                          const count = rawStudents.filter((s) => String(s.branch_id) === String(branch.id)).length;
                          return (
                            <div key={branch.id} className="flex justify-between items-center py-1 border-b border-slate-50">
                              <span className="text-xs text-slate-700 font-medium truncate max-w-[200px] sm:max-w-[150px]">{branch.name_bn || branch.name_en}</span>
                              <span className="text-xs font-bold text-slate-800">{count} Students</span>
                            </div>
                          );
                        })}
                        {branches.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-xs italic">No branches registered</div>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("branches")}
                      className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      View All Branches
                    </Button>
                  </Card>

                  {/* 4. Boarding Overview */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Boarding Overview</h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-xs text-slate-500">Boarding Expense</span>
                          <span className="text-sm font-bold text-slate-800">৳{monthlyBoardingExpense.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-xs text-slate-500">Boarding Savings</span>
                          <span className="text-sm font-bold text-emerald-600">৳{monthlyBoardingSaved.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-slate-500">Pending Approvals</span>
                          <span className={`text-xs font-bold ${pendingBoardingCount > 0 ? "text-red-600 animate-pulse" : "text-slate-500"}`}>
                            {pendingBoardingCount} Reports
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("boarding")}
                      className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      View Boarding Panel
                    </Button>
                  </Card>
                </div>

                {/* Row 6: Attendance Today & Upcoming Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance Today Card */}
                  <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Attendance Today</h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">Realtime</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Students Present</span>
                          <span className="text-2xl font-black text-emerald-700 mt-1 block">{todayPresentCount}</span>
                        </div>
                        <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                          <span className="text-[10px] font-bold text-rose-800 uppercase block">Students Absent</span>
                          <span className="text-2xl font-black text-rose-700 mt-1 block">{todayAttendance.filter(a => a.status === "absent").length}</span>
                        </div>
                        {isTeacherAttendanceAvailable && (
                          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <span className="text-[10px] font-bold text-blue-800 uppercase block">Teachers Present</span>
                            <span className="text-2xl font-black text-blue-700 mt-1 block">{todayTeacherPresentCount}</span>
                          </div>
                        )}
                        {isTeacherAttendanceAvailable && (
                          <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                            <span className="text-[10px] font-bold text-orange-800 uppercase block">Teachers Absent</span>
                            <span className="text-2xl font-black text-orange-700 mt-1 block">{todayTeacherAbsentCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("student-attendance")}
                      className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      View Attendance
                    </Button>
                  </Card>

                  {/* Upcoming Events Card */}
                  {isEventAvailable ? (
                    <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                          <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Upcoming Events</h3>
                          <span className="text-[10px] bg-rose-50 px-2 py-0.5 rounded-full text-rose-500 font-bold">Schedule</span>
                        </div>
                        {events.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs italic">No upcoming events scheduled</div>
                        ) : (
                          <div className="space-y-3">
                            {events.slice(0, 3).map((e) => (
                              <div key={e.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex flex-col items-center justify-center border border-rose-100 shrink-0">
                                  <span className="text-[9px] font-bold text-rose-700 leading-none">{e.date ? format(new Date(e.date), "MMM").toUpperCase() : "EVENT"}</span>
                                  <span className="text-sm font-bold text-rose-700 leading-none mt-0.5">{e.date ? format(new Date(e.date), "dd") : "—"}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{e.title}</p>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{e.time || "10:00 AM"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("events")}
                        className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        View All Events
                      </Button>
                    </Card>
                  ) : (
                    <div className="hidden" /> // Hidden automatically if source unavailable
                  )}
                </div>

                {/* Row 7: Top Readers (Only if Reading Score source is available) */}
                {SHOW_READING_PROGRESS && isReadingScoreAvailable && (
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4.5 w-4.5 text-[#D4AF37]" />
                          <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Top Readers (This Month)</h3>
                        </div>
                        <span className="text-[10px] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full text-[#b45309] font-bold">Leaderboard</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {topReaders.map((s, i) => (
                          <div 
                            key={s.id} 
                            className={`border rounded-2xl p-4 flex flex-col items-center text-center shadow-sm relative transition-all duration-300 ${
                              i === 0 ? "border-[#D4AF37] bg-amber-50/10" : "border-slate-100 bg-white"
                            }`}
                          >
                            <div className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0 ? "bg-amber-100 text-amber-700 border border-amber-300" :
                              i === 1 ? "bg-slate-200 text-slate-700" :
                              i === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {i + 1}
                            </div>
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0 shadow-inner mt-2">
                              {s.photo_url ? (
                                <img src={s.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                              ) : (
                                <span className="text-lg font-bold text-[#052E2B]">{s.full_name_en?.[0] || "?"}</span>
                              )}
                            </div>
                            <p className="font-bold text-slate-800 text-xs mt-3 leading-tight truncate max-w-full">{s.full_name_en}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium truncate max-w-full">{branches.find(b => String(b.id) === String(s.branch_id))?.name_bn || "Branch"}</p>
                            <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-1 px-3 rounded-full mt-3">
                              {s.total_pages_read || 0} Pages Read
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                </>
                )}
              </TabsContent>

            </Tabs>

          </main>
        </div>

        {/* Student Form Dialog */}
        {showStudentForm && (
          <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
            <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#052E2B]">{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <StudentForm
                key={editingStudent?.id || 'new'}
                student={editingStudent}
                onSave={handleSaveStudent}
                onCancel={() => { setShowStudentForm(false); setEditingStudent(null); }}
                currentUser={currentUser}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Reading Log Form Dialog */}
        {SHOW_READING_PROGRESS && showLogForm && (
          <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
            <DialogContent className="w-[95vw] sm:max-w-lg rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#052E2B]">
                  Add Reading Log {logStudent ? `- ${logStudent.full_name_en}` : ""}
                </DialogTitle>
              </DialogHeader>
              <ReadingLogForm
                studentId={logStudent?.id}
                onSave={(data) => createLogMut.mutateAsync(data)}
                onCancel={() => { setShowLogForm(false); setLogStudent(null); }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Floating Menu Button on Scroll (Mobile Only) */}
        {showFloatingMenu && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-6 left-6 z-50 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-[#022c22] border-2 border-[#D4AF37] text-white shadow-lg active:scale-95 transition-all hover:bg-[#033324] focus:outline-none"
          >
            <Menu className="h-6 w-6 text-[#D4AF37]" />
          </button>
        )}

      </div>
      <SearchOverlay />
    </SearchProvider>
  );
}
