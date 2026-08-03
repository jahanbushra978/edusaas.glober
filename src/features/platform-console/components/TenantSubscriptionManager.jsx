'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Layers, DollarSign, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ALL_SAAS_MODULES = [
  { key: "students", label: "Student Management", category: "Core" },
  { key: "teachers", label: "Teacher & Staff Management", category: "Core" },
  { key: "attendance", label: "Student & Teacher Attendance", category: "Academic" },
  { key: "biometric", label: "Biometric Hardware Sync", category: "Hardware" },
  { key: "exams", label: "Exam & Marksheet Engine", category: "Academic" },
  { key: "fees", label: "Fee Management & Invoicing", category: "Finance" },
  { key: "online_fee", label: "Online Gateway Fee Collection", category: "Finance" },
  { key: "hadiya", label: "Teacher Salary & Hadiya", category: "Finance" },
  { key: "boarding", label: "Boarding & Hostel Management", category: "Operations" },
  { key: "sms", label: "SMS & Mobile Gateway", category: "Communication" },
  { key: "email", label: "Email Notifications", category: "Communication" },
  { key: "lms", label: "Learning Management System (LMS)", category: "E-Learning" },
  { key: "certificates", label: "Dynamic Certificate Builder", category: "Academic" },
  { key: "transport", label: "Transport & Route Management", category: "Operations" },
  { key: "library", label: "Library Management", category: "Operations" },
  { key: "mobile_app", label: "Mobile App Access", category: "Mobile" },
];

export default function TenantSubscriptionManager({ tenant, onUpdate }) {
  const [status, setStatus] = useState(tenant?.status || "active");
  const [plan, setPlan] = useState(tenant?.subscription_plan || "enterprise");
  const [enabledModules, setEnabledModules] = useState(tenant?.modules_config?.enabled || ALL_SAAS_MODULES.map(m => m.key));
  const [saving, setSaving] = useState(false);

  const toggleModule = (moduleKey) => {
    setEnabledModules((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((m) => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleSave = async () => {
    if (!tenant || !tenant.id) return;
    setSaving(true);
    try {
      const payload = {
        status,
        subscription_plan: plan,
        modules_config: {
          enabled: enabledModules,
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("organizations")
        .update(payload)
        .eq("id", tenant.id);

      if (error) throw error;

      toast.success(`'${tenant.name}' সাবস্ক্রিপশন ও মডিউল আপডেট করা হয়েছে!`);
      if (onUpdate) onUpdate({ ...tenant, ...payload });
    } catch (err) {
      console.error("Failed to update subscription:", err);
      toast.error("সাবস্ক্রিপশন আপডেট করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-100 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-teal-600" size={20} /> Subscription & Billing Control ({tenant?.name})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                SaaS Owner হিসেবে প্রতিষ্ঠানটির সাবস্ক্রিপশন প্ল্যান, স্টেটাস ও মডিউল পারমিশন নিয়ন্ত্রণ করুন।
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-5 py-2"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <DollarSign size={14} className="text-teal-600" /> Subscription Plan
              </label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="text-xs bg-white h-9">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial Plan (14 Days)</SelectItem>
                  <SelectItem value="free">Free Starter Plan</SelectItem>
                  <SelectItem value="monthly">Monthly Standard</SelectItem>
                  <SelectItem value="yearly">Yearly Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise Unlimited</SelectItem>
                  <SelectItem value="custom">Custom Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Lock size={14} className="text-teal-600" /> Tenant Account Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-xs bg-white h-9">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Full Access)</SelectItem>
                  <SelectItem value="suspended">Suspended (Blocked)</SelectItem>
                  <SelectItem value="expired">Expired (Billing Overdue)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-teal-600" /> Module Access Control ({enabledModules.length}/{ALL_SAAS_MODULES.length} Enabled)
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => setEnabledModules(ALL_SAAS_MODULES.map(m => m.key))}
                >
                  Enable All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => setEnabledModules(["students", "teachers"])}
                >
                  Core Only
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_SAAS_MODULES.map((mod) => {
                const isEnabled = enabledModules.includes(mod.key);
                return (
                  <div
                    key={mod.key}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isEnabled
                        ? "border-teal-200 bg-teal-50/20"
                        : "border-slate-200 bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-semibold text-slate-800 block">{mod.label}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500 border-slate-300">
                        {mod.category}
                      </Badge>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleModule(mod.key)}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
