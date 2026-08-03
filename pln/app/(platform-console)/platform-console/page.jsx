import { Building2, Layers, Puzzle, Activity } from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";
import StatCard from "@/features/platform-console/components/StatCard";
import OrganizationsTable from "@/features/platform-console/components/OrganizationsTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PlatformConsoleDashboard() {
  const organizations = await listOrganizations();
  const totalBranches = organizations.reduce((sum, o) => sum + o.branches, 0);
  const activeCount = organizations.filter((o) => o.status === "active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          এখান থেকে আপনি প্রতিটা organization নিয়ন্ত্রণ করতে পারবেন — তারা কেউ জানবে না তাদের পেছনে একটাই platform আছে।
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Organizations" value={organizations.length} icon={Building2} />
        <StatCard label="Active" value={activeCount} hint="running normally" icon={Activity} />
        <StatCard label="Total Branches" value={totalBranches} icon={Layers} />
        <StatCard label="Modules in Registry" value={14} icon={Puzzle} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Organizations</h2>
          <Button asChild size="sm">
            <Link href="/platform-console/organizations/new">+ New Organization</Link>
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200">
          <OrganizationsTable organizations={organizations} />
        </div>
      </div>
    </div>
  );
}
