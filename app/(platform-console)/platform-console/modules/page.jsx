import { AVAILABLE_MODULES } from "@/features/platform-console/lib/platformConsoleClient";
import { Switch } from "@/components/ui/switch";

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Module Registry</h1>
        <p className="text-sm text-slate-500 mt-1">
          প্ল্যাটফর্মের সকল গ্লোবাল মডিউল এবং ফিচার ফ্ল্যাগ কন্ট্রোল প্যানেল।
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {AVAILABLE_MODULES.map((mod) => (
          <label
            key={mod.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{mod.name}</p>
              {mod.core ? (
                <p className="text-xs text-teal-600 font-medium">Core Platform Module</p>
              ) : (
                <p className="text-xs text-slate-400">Optional Extension</p>
              )}
            </div>
            <Switch defaultChecked={mod.core} disabled={mod.core} />
          </label>
        ))}
      </div>
    </div>
  );
}
