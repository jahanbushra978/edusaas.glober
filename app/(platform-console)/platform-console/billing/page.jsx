'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function BillingPage() {
  const [orgs, setOrgs] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultOrgs = [
        { id: "1", name: "Rahmania Institute", slug: "rahmania", plan: "Enterprise Plan", fee: 5000, status: "active", payment_status: "paid" },
        { id: "2", name: "MEHEDI HASAN", slug: "mehedi-hasan", plan: "Standard Plan", fee: 1050, status: "active", payment_status: "paid" },
        { id: "3", name: "Bushra Jahan", slug: "raa", plan: "Standard Plan", fee: 1000, status: "active", payment_status: "paid" },
        { id: "4", name: "JJJJJ", slug: "hh", plan: "Standard Plan", fee: 1000, status: "active", payment_status: "paid" },
      ];

      const saved = localStorage.getItem("created_orgs");
      let allOrgs = defaultOrgs;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge extra created orgs
            const existingSlugs = new Set(defaultOrgs.map(o => o.slug));
            const extra = parsed.filter(p => !existingSlugs.has(p.slug || p.subdomain));
            allOrgs = [...defaultOrgs, ...extra.map((o, idx) => ({
              id: o.id || `extra_${idx}`,
              name: o.name,
              slug: o.slug || o.subdomain,
              plan: o.subscription_plan || "Standard Plan",
              fee: parseInt(o.custom_fee || "1000", 10),
              status: o.status || "active",
              payment_status: o.payment_status || "paid"
            }))];
          }
        } catch (e) {}
      }

      setOrgs(allOrgs);

      // Calculate Total Revenue Dynamically
      const sumRevenue = allOrgs.reduce((acc, curr) => {
        const fee = curr.fee || (curr.plan?.includes("Enterprise") ? 5000 : 1000);
        return curr.payment_status !== "due" ? acc + fee : acc;
      }, 0);

      const activeSub = allOrgs.filter(o => o.status === "active").length;
      const pendingDue = allOrgs.filter(o => o.payment_status === "due").length;

      setTotalRevenue(sumRevenue);
      setActiveCount(activeSub);
      setDueCount(pendingDue);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Billing & Revenue Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          সকল অর্গানাইজেশনসমূহের রিয়েল-টাইম সাবস্ক্রিপশন ফি, মোট আয় ও ইনভয়েস পেমেন্ট হিস্ট্রি।
        </p>
      </div>

      {/* Dynamic Calculation Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 border-teal-200 bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-lg space-y-1">
          <p className="text-xs text-teal-300 font-semibold uppercase tracking-wider">Total Monthly Revenue (মোট আয়)</p>
          <p className="text-3xl font-extrabold text-white pt-1">
            ৳{totalRevenue.toLocaleString("bn-BD")} <span className="text-xs text-teal-300 font-normal">/ মাস</span>
          </p>
          <p className="text-[11px] text-slate-400">সকল সক্রিয় স্কুলের মোট মাসিক ফি হিসাব</p>
        </Card>

        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Subscriptions (সক্রিয় স্কুল)</p>
          <p className="text-3xl font-extrabold text-slate-900 pt-1">
            {activeCount.toLocaleString("bn-BD")} <span className="text-sm font-bold text-slate-500">টি</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">সক্রিয়ভাবে চলমান প্রতিষ্ঠানসমূহ</p>
        </Card>

        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Renewals (বকেয়া একাউন্ট)</p>
          <p className="text-3xl font-extrabold text-amber-600 pt-1">
            {dueCount.toLocaleString("bn-BD")} <span className="text-sm font-bold text-slate-500">টি</span>
          </p>
          <p className="text-[11px] text-slate-400">যে সকল স্কুলের মাসিক পেমেন্ট পেন্ডিং রয়েছে</p>
        </Card>
      </div>

      {/* Dynamic Recent Invoices Ledger */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Recent Invoices (ইনভয়েস হিস্ট্রি)</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">সকল প্রতিষ্ঠানের মাসিক সাবস্ক্রিপশন বিলের বিবরণী</CardDescription>
          </div>
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Dynamic Ledger</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            {orgs.map((org, idx) => {
              const feeAmount = org.fee || (org.plan?.includes("Enterprise") ? 5000 : 1000);
              const isPaid = org.payment_status === "paid" || !org.payment_status;

              return (
                <div key={org.id || idx} className="p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{org.name}</p>
                      <p className="text-slate-500 text-[11px]">
                        {org.plan || "Standard Plan"} · <span className="font-mono text-teal-600">INV-2026-00{idx + 1}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-slate-900 text-sm">৳{feeAmount.toLocaleString("bn-BD")}</span>
                    <Badge className={isPaid ? "bg-emerald-100 text-emerald-800 border-none text-[11px] font-bold" : "bg-red-100 text-red-800 border-none text-[11px] font-bold"}>
                      {isPaid ? "Paid" : "Due"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
