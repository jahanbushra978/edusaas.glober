import React, { useState, useMemo } from "react";
import { PERMISSION_MODULES, getDefaultPermissions } from "../../../lib/permissions-definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

export default function PermissionManager({ value, onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState(new Set(Object.keys(PERMISSION_MODULES)));
  const [activeCategory, setActiveCategory] = useState("all");

  const permissions = value || getDefaultPermissions();

  const categories = useMemo(() => {
    const cats = [
      { key: "all", label: { en: "All Modules", bn: "সব মডিউল" } },
      { key: "academic", label: { en: "Academic", bn: "একাডেমিক" } },
      { key: "attendance", label: { en: "Attendance", bn: "উপস্থিতি" } },
      { key: "finance", label: { en: "Finance", bn: "আর্থিক" } },
      { key: "operations", label: { en: "Operations", bn: "অপারেশন" } },
      { key: "content", label: { en: "Content", bn: "কন্টেন্ট" } },
      { key: "system", label: { en: "System", bn: "সিস্টেম" } },
    ];
    return cats;
  }, []);

  const moduleCategories = {
    academic: ["students", "teachers", "admissions", "academic-structure", "exams", "results", "routine", "promotion", "certificates", "daily-lesson-tracker"],
    attendance: ["student-attendance", "teacher-attendance", "biometric-attendance"],
    finance: ["fees", "hadiya", "expenses"],
    operations: ["boarding", "notices", "gallery", "videos", "events", "messages", "library"],
    content: ["website-content", "testimonials", "success-stories", "sponsors", "blogs", "faqs"],
    system: ["analytics", "settings", "branch-management", "contact-info", "data-mgmt", "period", "reports"],
  };

  const filteredModules = useMemo(() => {
    let mods = Object.entries(PERMISSION_MODULES);
    if (activeCategory !== "all") {
      const keys = moduleCategories[activeCategory] || [];
      mods = mods.filter(([k]) => keys.includes(k));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mods = mods.filter(([, m]) =>
        m.label.en.toLowerCase().includes(q) || m.label.bn.includes(q)
      );
    }
    return mods;
  }, [activeCategory, searchQuery]);

  const moduleCount = Object.keys(PERMISSION_MODULES).length;
  const grantedCount = useMemo(() => {
    let c = 0;
    for (const actions of Object.values(permissions)) {
      for (const v of Object.values(actions)) {
        if (v) c++;
      }
    }
    return c;
  }, [permissions]);
  const totalActions = useMemo(() => {
    let c = 0;
    for (const mod of Object.values(PERMISSION_MODULES)) {
      c += mod.actions.length;
    }
    return c;
  }, []);

  const toggleModule = (modKey) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modKey)) next.delete(modKey);
      else next.add(modKey);
      return next;
    });
  };

  const setPermission = (modKey, actKey, val) => {
    const updated = { ...permissions };
    if (!updated[modKey]) updated[modKey] = {};
    updated[modKey] = { ...updated[modKey], [actKey]: val };
    onChange(updated);
  };

  const setModuleAll = (modKey, val) => {
    const updated = { ...permissions };
    const mod = PERMISSION_MODULES[modKey];
    if (!mod) return;
    updated[modKey] = { ...updated[modKey] };
    for (const act of mod.actions) {
      updated[modKey][act.key] = val;
    }
    onChange(updated);
  };

  const isModuleFullyGranted = (modKey) => {
    const mod = PERMISSION_MODULES[modKey];
    if (!mod || !permissions[modKey]) return false;
    return mod.actions.every((act) => permissions[modKey][act.key]);
  };

  const isModulePartiallyGranted = (modKey) => {
    const mod = PERMISSION_MODULES[modKey];
    if (!mod || !permissions[modKey]) return false;
    return mod.actions.some((act) => permissions[modKey][act.key]) && !isModuleFullyGranted(modKey);
  };

  const grantAll = () => {
    const updated = {};
    for (const [modKey, mod] of Object.entries(PERMISSION_MODULES)) {
      updated[modKey] = {};
      for (const act of mod.actions) {
        updated[modKey][act.key] = true;
      }
    }
    onChange(updated);
  };

  const revokeAll = () => {
    onChange(getDefaultPermissions());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{moduleCount} Modules</span>
          <span className="text-emerald-600 font-medium">{grantedCount}/{totalActions} Actions</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={grantAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium"
          >
            Grant All
          </button>
          <button
            onClick={revokeAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors font-medium"
          >
            Revoke All
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
              activeCategory === cat.key
                ? "bg-emerald-900 text-white border-emerald-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
            }`}
          >
            {cat.label.en}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto overscroll-contain">
        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No modules found</div>
        )}
        {filteredModules.map(([modKey, mod]) => {
          const expanded = expandedModules.has(modKey);
          const fullyGranted = isModuleFullyGranted(modKey);
          const partiallyGranted = isModulePartiallyGranted(modKey);

          return (
            <Card
              key={modKey}
              className={`border transition-all ${
                fullyGranted
                  ? "border-emerald-200 bg-emerald-50/30"
                  : partiallyGranted
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-slate-200"
              }`}
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleModule(modKey)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-bold text-slate-800">{mod.label.en}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{mod.label.bn}</span>
                    {fullyGranted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Full</span>
                    )}
                    {partiallyGranted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Partial</span>
                    )}
                  </div>

                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={fullyGranted}
                      onChange={(e) => setModuleAll(modKey, e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-[10px] font-medium text-slate-500">All</span>
                  </label>
                </button>

                {expanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                      {mod.actions.map((act) => {
                        const granted = permissions[modKey]?.[act.key] || false;
                        return (
                          <label
                            key={act.key}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer border transition-all select-none ${
                              granted
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={granted}
                              onChange={(e) => setPermission(modKey, act.key, e.target.checked)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <span className="font-medium leading-tight">{act.label.en}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
