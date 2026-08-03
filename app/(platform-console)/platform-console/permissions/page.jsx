import PermissionTree from "@/features/platform-console/components/PermissionTree";
import { PERMISSION_TREE } from "@/features/platform-console/lib/platformConsoleClient";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Enterprise Permission Engine</h1>
        <p className="text-sm text-slate-500 mt-1">
          এখানে ঠিক করে দিন বিভিন্ন রোল (Super Admin, Branch Admin, Staff) কী কী permission পাবে।
        </p>
      </div>

      <PermissionTree tree={PERMISSION_TREE} />
    </div>
  );
}
