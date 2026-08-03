'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createOrganization } from "@/features/platform-console/lib/platformConsoleClient";
import LiveClock from "@/features/platform-console/components/LiveClock";
import { ShieldCheck, Key, CreditCard } from "lucide-react";

const initialState = {
  name: "",
  slug: "",
  subdomain: "",
  custom_domain: "",
  subscription_plan: "monthly",
  admin_password: "admin123",
};

export default function NewOrganizationPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "slug") {
        const clean = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        next.subdomain = clean ? `${clean}.platform.com` : "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const org = await createOrganization(form);
    
    // Save Initial Password & Billing Info locally for resilient instant access
    if (typeof window !== "undefined") {
      const cleanSlug = (form.slug || form.name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      localStorage.setItem(`org_auth_${cleanSlug}`, JSON.stringify({
        password: form.admin_password || "admin123",
        created_at: new Date().toISOString()
      }));
    }

    setSaving(false);
    router.push(`/platform-console`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">নতুন Organization তৈরি করুন</h1>
          <p className="text-sm text-slate-500 mt-1">
            এখানে প্রতিষ্ঠান তৈরি করলে তাদের নিজস্ব ERP, Website Builder ও এডমিন প্যানেল পাসওয়ার্ডসহ প্রস্তুত হয়ে যাবে।
          </p>
        </div>
        <LiveClock />
      </div>

      <Card className="border-teal-200 shadow-md">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-teal-600" /> Organization & Initial Password Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">প্রতিষ্ঠানের নাম (School Name)</Label>
                <Input id="name" required value={form.name} onChange={update("name")} placeholder="e.g. Noorania Madrasah" className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-semibold">Unique Slug (URL Parameter)</Label>
                <Input id="slug" required value={form.slug} onChange={update("slug")} placeholder="e.g. noorania" className="h-9 text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subdomain" className="text-xs font-semibold">Platform Subdomain</Label>
                <Input id="subdomain" required value={form.subdomain} onChange={update("subdomain")} placeholder="noorania.platform.com" className="h-9 text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom_domain" className="text-xs font-semibold">Custom Domain (ঐচ্ছিক)</Label>
                <Input id="custom_domain" value={form.custom_domain} onChange={update("custom_domain")} placeholder="nooraniamadrasah.edu.bd" className="h-9 text-xs" />
              </div>
            </div>

            {/* INITIAL ADMIN PASSWORD SETTING */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <Key size={16} className="text-teal-700" />
                <span>Initial School Admin Password (প্রাথমিক পাসওয়ার্ড)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="admin_password" className="text-[11px] text-slate-600">এডমিন পাসওয়ার্ড সেট করুন</Label>
                  <Input
                    id="admin_password"
                    type="text"
                    required
                    value={form.admin_password}
                    onChange={update("admin_password")}
                    placeholder="e.g. admin123"
                    className="h-9 text-xs bg-white font-mono"
                  />
                </div>
                <div className="text-[11px] text-slate-500 pt-5">
                  💡 পরবর্তীতে ওই প্রতিষ্ঠানের এডমিন তাদের ড্যাশবোর্ডের Security সেটিংস থেকে যেকোনো সময় নিজস্ব পাসওয়ার্ড পরিবর্তন করতে পারবে।
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION PLAN SELECTION */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <CreditCard size={15} className="text-teal-600" /> Subscription Plan Selection
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "monthly", label: "Monthly Standard", price: "৳২,৯০০ / মাস" },
                  { id: "yearly", label: "Yearly Pro", price: "৳২৯,০০০ / বছর" },
                  { id: "enterprise", label: "Enterprise Custom", price: "কাস্টম চুক্তি" },
                ].map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setForm((p) => ({ ...p, subscription_plan: plan.id }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.subscription_plan === plan.id
                        ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">{plan.label}</p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{plan.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => router.back()} className="text-xs">
                বাতিল
              </Button>
              <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-500 text-xs">
                <ShieldCheck size={16} className="mr-1.5" />
                {saving ? "তৈরি হচ্ছে..." : "Organization তৈরি করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
