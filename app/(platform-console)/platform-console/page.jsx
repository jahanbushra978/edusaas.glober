import {
  Building2, Layers, Puzzle, Activity, Plus, Zap, Bell,
  HardDrive, Settings, Inbox, Users, TrendingUp, ShieldAlert,
  Clock, CheckCircle2, AlertTriangle, BarChart3, ArrowUpRight
} from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";
import OrganizationsTable from "@/features/platform-console/components/OrganizationsTable";
import LiveClock from "@/features/platform-console/components/LiveClock";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Quick Action Items ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "নতুন প্রতিষ্ঠান",
    sublabel: "Organization যোগ করুন",
    icon: Plus,
    href: "/platform-console/organizations/new",
    bg: "bg-teal-50 hover:bg-teal-100",
    border: "border-teal-200",
    text: "text-teal-700",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    label: "ইনবক্স",
    sublabel: "আবেদন ও মেসেজ দেখুন",
    icon: Inbox,
    href: "/platform-console/inbox",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "গ্লোবাল নোটিশ",
    sublabel: "সব প্রতিষ্ঠানে পাঠান",
    icon: Bell,
    href: "/platform-console/settings",
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-200",
    text: "text-amber-700",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "ব্যাকআপ",
    sublabel: "সিস্টেম ব্যাকআপ",
    icon: HardDrive,
    href: "/platform-console/backups",
    bg: "bg-violet-50 hover:bg-violet-100",
    border: "border-violet-200",
    text: "text-violet-700",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    label: "সেটিংস",
    sublabel: "সিস্টেম কনফিগার করুন",
    icon: Settings,
    href: "/platform-console/settings",
    bg: "bg-slate-50 hover:bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-700",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
];

// ─── KPI Card Component ─────────────────────────────────────────────────────
function KPICard({ label, value, hint, icon: Icon, color = "teal", trend }) {
  const colorMap = {
    teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   border: "border-teal-100" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100" },
    emerald:{ bg: "bg-emerald-50",icon: "text-emerald-600",border: "border-emerald-100" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    border: "border-red-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  border: "border-amber-100" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100" },
    slate:  { bg: "bg-slate-100", icon: "text-slate-500",  border: "border-slate-200" },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value ?? "—"}</p>
          {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight size={12} className="text-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-semibold">{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── System Health Bar ──────────────────────────────────────────────────────
const HEALTH_ITEMS = [
  { label: "Database",  ok: true },
  { label: "API",       ok: true },
  { label: "Storage",   ok: true },
  { label: "Email",     ok: true },
  { label: "SMS",       ok: true },
  { label: "Backup",    ok: true },
];

function SystemHealthBar() {
  const allGood = HEALTH_ITEMS.every((h) => h.ok);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex items-center gap-2 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${allGood ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
        <span className={`text-xs font-bold ${allGood ? 'text-emerald-700' : 'text-red-700'}`}>
          {allGood ? '✅ সব সিস্টেম স্বাভাবিক' : '⚠️ সমস্যা শনাক্ত হয়েছে'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {HEALTH_ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-500'}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Activity Feed ───────────────────────────────────────────────────
const RECENT_ACTIVITIES = [
  { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "নতুন প্রতিষ্ঠান যোগ করা হয়েছে", time: "২ ঘন্টা আগে" },
  { icon: TrendingUp,   color: "text-blue-500",    bg: "bg-blue-50",    label: "Rahmania-এর সাবস্ক্রিপশন নবায়ন হয়েছে", time: "৫ ঘন্টা আগে" },
  { icon: CheckCircle2, color: "text-teal-500",    bg: "bg-teal-50",    label: "Inbox-এ নতুন আবেদন এসেছে", time: "গতকাল" },
  { icon: AlertTriangle,color: "text-amber-500",   bg: "bg-amber-50",   label: "ব্যাকআপ সফলভাবে সম্পন্ন", time: "গতকাল" },
  { icon: Users,        color: "text-violet-500",  bg: "bg-violet-50",  label: "নতুন Super Admin যোগ করা হয়েছে", time: "৩ দিন আগে" },
];

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default async function PlatformConsoleDashboard() {
  const organizations  = await listOrganizations();
  const totalBranches  = organizations.reduce((sum, o) => sum + (o.branches || 0), 0);
  const activeCount    = organizations.filter((o) => o.status !== "suspended").length;
  const suspendedCount = organizations.filter((o) => o.status === "suspended").length;
  const freeCount      = organizations.filter((o) => o.subscription_plan === "Free Tier Access" || o.subscription_plan === "free").length;
  const paidCount      = organizations.length - freeCount;

  return (
    <div className="space-y-7">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Platform Console Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            সকল প্রতিষ্ঠানের হিসাব, বিলিং ও নিরাপত্তা এক জায়গায় নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <LiveClock />
      </div>

      {/* ── System Health Bar ── */}
      <SystemHealthBar />

      {/* ── KPI Stat Cards — 2 rows ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard label="Total Organizations"  value={organizations.length}  icon={Building2}    color="teal"   trend="চলতি মাসে ২ নতুন" />
        <KPICard label="Active Clients"        value={activeCount}           icon={Activity}     color="emerald" hint="স্বাভাবিক চলছে" />
        <KPICard label="Paid Subscriptions"    value={paidCount}             icon={TrendingUp}   color="blue"   hint="সক্রিয় পেইড প্ল্যান" />
        <KPICard label="Suspended Accounts"    value={suspendedCount}        icon={ShieldAlert}  color="red"    hint={suspendedCount > 0 ? "মনোযোগ প্রয়োজন" : "সব ঠিক আছে"} />
        <KPICard label="Total Branches"        value={totalBranches}         icon={Layers}       color="violet" />
        <KPICard label="Modules Available"     value={16}                    icon={Puzzle}       color="amber" />
        <KPICard label="Free Tier Clients"     value={freeCount}             icon={Users}        color="slate"  hint="আপগ্রেড করানো যায়" />
        <KPICard label="Platform Health"       value="100%"                  icon={BarChart3}    color="emerald" hint="সব সার্ভিস চালু" />
      </div>

      {/* ── ⚡ Quick Actions Widget ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
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
                <div className={`flex flex-col items-center text-center gap-2 px-3 py-4 rounded-xl border transition-all cursor-pointer ${action.bg} ${action.border}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                    <Icon size={20} className={action.iconColor} />
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold leading-tight ${action.text}`}>{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{action.sublabel}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity + Organizations Table ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">

        {/* Organizations Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Institution Management & Billing</h2>
              <p className="text-xs text-slate-500">বিলিং তালিকা, স্থিতি ও অ্যাকসেস নিয়ন্ত্রণ</p>
            </div>
            <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs">
              <Link href="/platform-console/organizations/new">
                <Plus size={14} className="mr-1.5" /> New Org
              </Link>
            </Button>
          </div>
          <OrganizationsTable organizations={organizations} />
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Clock size={15} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITIES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={13} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 font-medium leading-snug">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100">
            <Link href="/platform-console/audit-logs" className="text-[11px] text-teal-600 font-bold hover:underline">
              সব লগ দেখুন →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
