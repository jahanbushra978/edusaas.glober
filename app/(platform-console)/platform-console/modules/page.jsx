"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listOrganizations,
  fetchModulesCatalog,
  toggleOrgModule,
  AVAILABLE_MODULES,
} from "@/features/platform-console/lib/platformConsoleClient";
import { Layers, RefreshCw, CheckCircle2, Building2 } from "lucide-react";

export default function ModulesPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [enabledModules, setEnabledModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs);
        if (orgs.length > 0) {
          const firstId = orgs[0].id;
          setSelectedOrgId(firstId);
          const res = await fetchModulesCatalog(firstId);
          if (res?.enabledModules) {
            setEnabledModules(res.enabledModules);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleOrgChange = async (orgId) => {
    setSelectedOrgId(orgId);
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetchModulesCatalog(orgId);
      if (res?.enabledModules) {
        setEnabledModules(res.enabledModules);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (moduleKey, currentEnabled) => {
    setSavingKey(moduleKey);
    setFeedback("");
    try {
      const newStatus = !currentEnabled;
      const res = await toggleOrgModule(selectedOrgId, moduleKey, newStatus);
      if (res?.ok) {
        setEnabledModules(res.enabledModules || []);
        setFeedback(`মডিউল '${moduleKey}' সফলভাবে ${newStatus ? "চালু" : "বন্ধ"} করা হয়েছে।`);
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Failed to toggle module:", err);
    } finally {
      setSavingKey(null);
    }
  };

  const activeOrg = organizations.find((o) => o.id === selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="text-teal-600" size={24} />
            <span>Tenant Module Control</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            প্রতিষ্ঠানভিত্তিক মডিউল অন/অফ করুন। এখানে বন্ধ করলে সংশ্লিষ্ট প্রতিষ্ঠানের প্যানেল ও API-তে তা ব্লক থাকবে।
          </p>
        </div>

        {/* Organization Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
          <Building2 size={16} className="text-slate-400" />
          <select
            value={selectedOrgId}
            onChange={(e) => handleOrgChange(e.target.value)}
            disabled={loading}
            className="text-xs font-semibold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-slate-800">
            {activeOrg?.name || "Selected Organization"} — Active Modules ({enabledModules.length})
          </CardTitle>
          <span className="text-xs text-slate-400 font-mono">Plan: {activeOrg?.subscription_plan || "Enterprise"}</span>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-teal-600" />
              মডিউল স্ট্যাটাস লোড হচ্ছে...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const isEnabled = enabledModules.includes(mod.key);
                const isSaving = savingKey === mod.key;

                return (
                  <div
                    key={mod.key}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                      isEnabled
                        ? "border-teal-200 bg-teal-50/30"
                        : "border-slate-200 bg-white opacity-70"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{mod.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{mod.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSaving && <RefreshCw size={14} className="animate-spin text-teal-600" />}
                      <Switch
                        checked={isEnabled}
                        disabled={isSaving}
                        onCheckedChange={() => handleToggle(mod.key, isEnabled)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
