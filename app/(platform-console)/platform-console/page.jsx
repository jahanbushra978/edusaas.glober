import { Building2, Layers, Puzzle, Activity, Plus, Zap, Bell, HardDrive, Settings, Inbox, Users } from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";
import StatCard from "@/features/platform-console/components/StatCard";
import OrganizationsTable from "@/features/platform-console/components/OrganizationsTable";
import LiveClock from "@/features/platform-console/components/LiveClock";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Quick Action Items ───────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "নতুন প্রতিষ্ঠান",
    sublabel: "Organization যোগ করুন",
    icon: Plus,
    href: "/platform-console/organizations/new",
    color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    label: "সেন্ট্রাল ইনবক্স",
    sublabel: "আবেদন ও মেসেজ দেখুন",
    icon: Inbox,
    href: "/platform-console/inbox",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "গ্লোবাল নোটিশ",
    sublabel: "সব প্রতিষ্ঠানে পাঠান",
    icon: Bell,
    href: "/platform-console/settings",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "ব্যাকআপ নিন",
    sublabel: "সিস্টেম ব্যাকআপ",
    icon: HardDrive,
    href: "/platform-console/backups",
    color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    label: "প্ল্যাটফর্ম সেটিংস",
    sublabel: "সিস্টেম কনফিগার করুন",
    icon: Settings,
    href: "/platform-console/settings",
    color: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
    iconColor: "text-slate-600",
  },
];

export default async function PlatformConsoleDashboard() {
  const organizations = await listOrganizations();
  const totalBranches = organizations.reduce((sum, o) => sum + (o.branches || 0), 0);
  const activeCount   = organizations.filter((o) => o.status !== "suspended").length;
  const suspendedCount = organizations.filter((o) => o.status === "suspended").length;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SaaS Multi-Tenant Platform Master Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            এখান থেকে আপনি প্রতিটি প্রতিষ্ঠানের অ্যাডমিন অ্যাকাউন্ট, পাসওয়ার্ড, বিলিং বকেয়া, সাময়িক স্থগিতকরণ ও নোটিশ নিয়ন্ত্রণ করতে পারবেন।
          </p>
        </div>
        <LiveClock />
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Organizations"  value={organizations.length} icon={Building2} />
        <StatCard label="Active Clients"        value={activeCount}          hint="running normally" icon={Activity} />
        <StatCard label="Total Branches"        value={totalBranches}        icon={Layers} />
        <StatCard label="Suspended Accounts"    value={suspendedCount}       hint="needs attention" icon={Users} />
      </div>

      {/* ── ⚡ Quick Actions Widget ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">⚡ Quick Actions</h2>
            <p className="text-[11px] text-slate-400">সাইডবারে না গিয়ে এক ক্লিকে গুরুত্বপূর্ণ কাজ করুন</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <div className={`flex flex-col items-center text-center gap-2 px-3 py-4 rounded-xl border transition-all cursor-pointer ${action.color}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon size={18} className={action.iconColor} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">{action.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5 leading-tight hidden sm:block">{action.sublabel}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Organizations Table ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Institution Management & Billing Control</h2>
            <p className="text-xs text-slate-500">সকল শিক্ষা প্রতিষ্ঠানের বিলিং তালিকা, স্থিতি, নিরাপত্তা ও একসেস নিয়ন্ত্রণ।</p>
          </div>
          <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold">
            <Link href="/platform-console/organizations/new">
              <Plus size={16} className="mr-1.5" /> + New Organization
            </Link>
          </Button>
        </div>
        <OrganizationsTable organizations={organizations} />
      </div>
    </div>
  );
}
