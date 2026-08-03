'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createOrganization } from "@/features/platform-console/lib/platformConsoleClient";

const initialState = {
  name: "",
  slug: "",
  subdomain: "",
  custom_domain: "",
  subscription_plan: "free",
};

export default function NewOrganizationPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const org = await createOrganization(form);
    setSaving(false);
    router.push(`/platform-console/organizations/${org.id}`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">নতুন Organization তৈরি করুন</h1>
        <p className="text-sm text-slate-500 mt-1">
          এখানে একটা organization তৈরি করলে সাথে সাথে তাদের জন্য আলাদা website, ERP, ও settings — সবকিছু স্বয়ংক্রিয়ভাবে প্রস্তুত হয়ে যাবে।
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">প্রতিষ্ঠানের নাম</Label>
                <Input id="name" required value={form.name} onChange={update("name")} placeholder="Noorania Madrasah" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" required value={form.slug} onChange={update("slug")} placeholder="noorania" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subdomain">Platform Subdomain</Label>
                <Input id="subdomain" required value={form.subdomain} onChange={update("subdomain")} placeholder="noorania.platform.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom_domain">Custom Domain (ঐচ্ছিক)</Label>
                <Input id="custom_domain" value={form.custom_domain} onChange={update("custom_domain")} placeholder="nooraniamadrasah.edu.bd" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>বাতিল</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "তৈরি হচ্ছে..." : "Organization তৈরি করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
