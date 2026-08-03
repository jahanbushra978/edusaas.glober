import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  getOrganization, AVAILABLE_MODULES, PERMISSION_TREE,
} from "@/features/platform-console/lib/platformConsoleClient";
import PermissionTree from "@/features/platform-console/components/PermissionTree";

export default async function OrganizationDetailPage({ params }) {
  const org = await getOrganization(params.id);
  if (!org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span
          className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          style={{ backgroundColor: org.theme_color }}
        >
          {org.logo_initial}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{org.name}</h1>
          <p className="text-sm text-slate-500">
            {org.custom_domain || `${org.subdomain}.platform.com`}
            {" · "}
            <Badge variant="secondary" className="capitalize ml-1">{org.status}</Badge>
          </p>
        </div>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="pt-4">
          <p className="text-sm text-slate-500 mb-4">
            যে module enable করবেন, সেটার menu/permission/page স্বয়ংক্রিয়ভাবে {org.name}-এর ERP-তে চালু হয়ে যাবে। Disable করলে সব লুকিয়ে যাবে — কোনো কোড পরিবর্তন ছাড়াই।
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {AVAILABLE_MODULES.map((mod) => (
              <label
                key={mod.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{mod.name}</p>
                  {mod.core && <p className="text-xs text-slate-400">Core module</p>}
                </div>
                <Switch defaultChecked={mod.core} disabled={mod.core} />
              </label>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="pt-4">
          <p className="text-sm text-slate-500 mb-4">
            এখানে ঠিক করে দিন {org.name}-এর Super Admin তার Branch Admin ও Staff-দের কী কী permission দিতে পারবে।
          </p>
          <PermissionTree tree={PERMISSION_TREE} />
        </TabsContent>

        <TabsContent value="branches" className="pt-4">
          <p className="text-sm text-slate-500">
            এই organization-এর {org.branches}টা branch আছে। Branch-ভিত্তিক তালিকা ও isolation setting Phase 3 (Organization Onboarding)-এ এখানে যুক্ত হবে।
          </p>
        </TabsContent>

        <TabsContent value="danger" className="pt-4 space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">Suspend Organization</p>
            <p className="text-xs text-red-600 mt-1">
              Suspend করলে {org.name}-এর ওয়েবসাইট ও ERP সাময়িকভাবে বন্ধ হয়ে যাবে, ডাটা মুছে যাবে না।
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
