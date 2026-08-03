'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appClient } from "@/api/appClient";
import {
  LayoutDashboard, Building2, Layers, CreditCard, Settings, LogOut, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, PlusCircle, ShieldAlert
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/platform-console", label: "Dashboard (ড্যাশবোর্ড)", icon: LayoutDashboard, exact: true },
  {
    href: "/platform-console/organizations",
    label: "Organizations (প্রতিষ্ঠানের তালিকা)",
    icon: Building2,
    children: [
      { href: "/platform-console/organizations", label: "সকল প্রতিষ্ঠান", icon: Building2 },
      { href: "/platform-console/organizations?action=new", label: "নতুন স্কুল যোগ করুন", icon: PlusCircle },
      { href: "/platform-console/organizations?filter=suspended", label: "স্থগিতকৃত একাউন্টসমূহ", icon: ShieldAlert },
    ]
  },
  {
    href: "/platform-console/billing",
    label: "Billing & Subscriptions (বিলিং ও প্যাকেজ)",
    icon: CreditCard,
    children: [
      { href: "/platform-console/billing", label: "সাবস্ক্রিপশন ও বিলিং হিসাব", icon: CreditCard },
      { href: "/platform-console/billing?tab=plans", label: "প্যাকেজ রেট কন্ট্রোল", icon: Layers },
    ]
  },
  { href: "/admin/website/page-builder?slug=rahmania", label: "Visual Website Builder (পেজ বিল্ডার)", icon: Layers },
  { href: "/platform-console/settings", label: "Platform Settings & Security (সেটিংস)", icon: Settings },
];

export default function ConsoleSidebar({ parentCollapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({ "/platform-console/organizations": true });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("console_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    }
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("console_sidebar_collapsed", String(next));
    }
    if (onToggleCollapse) onToggleCollapse(next);
  };

  const toggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isCollapsed = parentCollapsed !== undefined ? parentCollapsed : collapsed;

  return (
    <aside
      className={`shrink-0 h-full bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header with Panel Left Toggle Button */}
      <div className="px-3.5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="truncate">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">SaaS Master Console</p>
            <p className="text-sm font-bold text-white leading-tight truncate">Super Admin Suite</p>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          title={isCollapsed ? "সাইডবার বড় করুন (Expand Sidebar)" : "সাইডবার ছোট করুন (Collapse Sidebar)"}
          className="h-9 w-9 rounded-xl bg-slate-800/90 hover:bg-teal-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0 border border-slate-700 shadow-sm mx-auto"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation Links with Sub-Menu Dropdown Support */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const { href, label, icon: Icon, exact, children } = item;
          const active = exact ? pathname === href : pathname?.startsWith(href);
          const hasChildren = Array.isArray(children) && children.length > 0;
          const isSubOpen = openSubMenus[href];

          return (
            <div key={href} className="space-y-1">
              <div className="flex items-center">
                <Link
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "bg-teal-600/20 text-teal-300 border-l-4 border-teal-500 font-bold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >
                  <Icon size={18} className={active ? "text-teal-400 shrink-0" : "text-slate-400 shrink-0"} />
                  {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                </Link>

                {!isCollapsed && hasChildren && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSubMenu(href);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Nested Dropdown Sub-Menu Items */}
              {!isCollapsed && hasChildren && isSubOpen && (
                <div className="ml-5 pl-3 border-l border-slate-800 space-y-1">
                  {children.map((sub) => {
                    const subActive = pathname === sub.href;
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          subActive
                            ? "bg-teal-500/20 text-teal-300 font-bold"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                      >
                        <SubIcon size={14} className="text-teal-400 shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="px-2 py-4 border-t border-slate-800 bg-slate-950/20">
        <button
          onClick={async () => {
            await appClient.auth.logout().catch(() => {});
            router.push("/admin");
          }}
          title={isCollapsed ? "Sign out (লগআউট)" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Sign out (লগআউট)</span>}
        </button>
      </div>
    </aside>
  );
}
