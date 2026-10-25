export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";
import OrganizationsTable from "@/features/platform-console/components/OrganizationsTable";

export default async function OrganizationsListPage() {
  const organizations = await listOrganizations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">সব প্রতিষ্ঠান — Rahmania থেকে ভবিষ্যতের হাজার নম্বর organization পর্যন্ত।</p>
        </div>
        <Button asChild>
          <Link href="/platform-console/organizations/new">+ New Organization</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <OrganizationsTable organizations={organizations} />
      </div>
    </div>
  );
}
