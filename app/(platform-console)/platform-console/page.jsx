import { Building2, Layers, Puzzle, Activity, Plus } from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";
import StatCard from "@/features/platform-console/components/StatCard";
import OrganizationsTable from "@/features/platform-console/components/OrganizationsTable";
import LiveClock from "@/features/platform-console/components/LiveClock";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PlatformConsoleDashboard() {
  const organizations = await listOrganizations();
  const totalBranches = organizations.reduce((sum, o) => sum + (o.branches || 0), 0);
  const activeCount = organizations.filter((o) => o.status !== "suspended").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SaaS Multi-Tenant Platform Master Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            এখান থেকে আপনি প্রতিটি প্রতিষ্ঠানের অ্যাডমিন অ্যাকাউন্ট, পাসওয়ার্ড, বিলিং বকেয়া, সাময়িক স্থগিতকরণ ও নোটিশ নিয়ন্ত্রণ করতে পারবেন।
          </p>
        </div>

        {/* Real-time Clock Widget for Super Admin */}
        <LiveClock />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Organizations" value={organizations.length} icon={Building2} />
        <StatCard label="Active Clients" value={activeCount} hint="running normally" icon={Activity} />
        <StatCard label="Total Branches" value={totalBranches} icon={Layers} />
        <StatCard label="Modules Available" value={16} icon={Puzzle} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Institution Management & Billing Control</h2>
            <p className="text-xs text-slate-500">সকল শিক্ষা প্রতিষ্ঠানের বিলিং তালিকা, স্থিতি, নিরাপত্তা ও একসেস নিয়ন্ত্রণ।</p>
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
