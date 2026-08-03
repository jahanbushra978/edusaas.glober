'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ShieldCheck, Puzzle, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/platform-console", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/platform-console/organizations", label: "Organizations", icon: Building2 },
  { href: "/platform-console/permissions", label: "Permission Engine", icon: ShieldCheck },
  { href: "/platform-console/modules", label: "Module Registry", icon: Puzzle },
  { href: "/platform-console/settings", label: "Platform Settings", icon: Settings },
];

export default function ConsoleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-full bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-xs uppercase tracking-wider text-slate-500">Platform Console</p>
        <p className="text-lg font-semibold">Mastermind</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-600/20 text-teal-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 w-full">
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
