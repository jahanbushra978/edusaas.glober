import React from "react";
import {
  Users, GraduationCap, Upload, UserCog, DollarSign, Settings, Bell, AlertCircle,
  CalendarCheck, Wallet, Clock, Trophy, Images, Building2, ImagePlay, LayoutDashboard,
  Menu, FileText, Mail, Quote, Home, Calendar, Shield,
  Monitor, Layers, Palette, Activity, Tag
} from "lucide-react";
import { hasPermission } from "../../../../lib/permissions";

export const sidebarCategories = [
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
      { label: "Sponsor Management", value: "sponsors", icon: Tag },
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

export function isFeatureAllowedForUser(currentUser, rawBranches, value) {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  if (value === "live-attendance") return true;
  if (value === "analytics") {
    if (currentUser.role === "boarding_manager") return false;
    return true;
  }

  const userBranch = (rawBranches || []).find(b => String(b.id) === String(currentUser.branch_id));
  const boardingEnabled = userBranch ? userBranch.boarding_enabled === true : false;

  if (value === "boarding") {
    if (!boardingEnabled) return false;
  }

  return hasPermission(currentUser, value, "view");
}

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  activeSchoolSlug,
  activeSchoolName,
  currentUser,
  rawBranches,
  sidebarOpen,
  setSidebarOpen,
  isSidebarCollapsed,
}) {
  const filteredSidebarCategories = React.useMemo(() => {
    return sidebarCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          isFeatureAllowedForUser(currentUser, rawBranches, item.value)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [currentUser, rawBranches]);

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
    <>
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
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/55 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 bg-[#022c22] h-full flex flex-col animate-slide-in-left text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
