"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Building2,
  Download,
  Plus,
  Search,
  Clock,
  Printer,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";

export default function BillingPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Invoices list state
  const [invoices, setInvoices] = useState([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  // New Invoice Form
  const [newInvoice, setNewInvoice] = useState({
    orgSlug: "",
    month: "October 2026",
    amount: "2500",
    paymentMethod: "bKash Merchant",
    status: "paid",
    notes: "Monthly SaaS hosting, server infrastructure, and SLA support.",
  });

  // Load organizations and invoices
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs);

        // Generate or load invoices
        const savedInvoices = localStorage.getItem("platform_invoices");
        if (savedInvoices) {
          try {
            setInvoices(JSON.parse(savedInvoices));
          } catch (e) {
            console.error("Failed to parse saved invoices", e);
          }
        } else {
          // Initial baseline invoices from real orgs
          const initial = orgs.map((org, idx) => {
            const fee = org.subscription_plan === "enterprise" ? 5000 : org.subscription_plan === "premium" ? 2500 : 1000;
            return {
              id: `INV-2026-${String(idx + 1).padStart(4, "0")}`,
              orgId: org.id,
              orgName: org.name,
              orgSlug: org.slug,
              plan: org.subscription_plan ? `${org.subscription_plan.charAt(0).toUpperCase() + org.subscription_plan.slice(1)} Plan` : "Standard Plan",
              month: "October 2026",
              issueDate: "2026-10-01",
              dueDate: "2026-10-10",
              amount: fee,
              status: idx === 1 ? "due" : "paid",
              paymentMethod: idx === 1 ? "Pending" : "bKash Merchant",
              transactionId: idx === 1 ? "—" : `BKASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              notes: "Monthly SaaS platform license, biometric device cloud sync, and backup SLA.",
            };
          });
          setInvoices(initial);
          localStorage.setItem("platform_invoices", JSON.stringify(initial));
        }
      } catch (err) {
        console.error("Error loading billing data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveInvoices = (updated) => {
    setInvoices(updated);
    localStorage.setItem("platform_invoices", JSON.stringify(updated));
  };

  const handleToggleStatus = (invoiceId) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        const nextStatus = inv.status === "paid" ? "due" : "paid";
        return {
          ...inv,
          status: nextStatus,
          paymentMethod: nextStatus === "paid" ? "Manual Verification" : "Pending",
          transactionId: nextStatus === "paid" ? `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : "—",
        };
      }
      return inv;
    });
    saveInvoices(updated);
    toast.success("ইনভয়েস স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const org = organizations.find((o) => o.slug === newInvoice.orgSlug) || {
      id: "custom",
      name: newInvoice.orgSlug || "Custom School",
      subscription_plan: "standard",
    };

    const created = {
      id: `INV-2026-${String(invoices.length + 1).padStart(4, "0")}`,
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
      plan: org.subscription_plan ? `${org.subscription_plan.charAt(0).toUpperCase() + org.subscription_plan.slice(1)} Plan` : "Standard Plan",
      month: newInvoice.month,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
      amount: parseInt(newInvoice.amount, 10) || 1000,
      status: newInvoice.status,
      paymentMethod: newInvoice.status === "paid" ? newInvoice.paymentMethod : "Pending",
      transactionId: newInvoice.status === "paid" ? `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : "—",
      notes: newInvoice.notes,
    };

    const next = [created, ...invoices];
    saveInvoices(next);
    setShowCreateModal(false);
    toast.success(`ইনভয়েস ${created.id} সফলভাবে তৈরি হয়েছে!`);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = !search ||
        inv.orgName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.month.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return invoices.filter((i) => i.status === "paid").reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [invoices]);

  const totalDue = useMemo(() => {
    return invoices.filter((i) => i.status === "due").reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [invoices]);

  const collectionRate = useMemo(() => {
    const total = totalRevenue + totalDue;
    if (total === 0) return 100;
    return Math.round((totalRevenue / total) * 100);
  }, [totalRevenue, totalDue]);

  const handlePrint = (inv) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("পপআপ ব্লকার প্রিন্ট উইন্ডো ব্লক করেছে। অনুগ্রহ করে পপআপ অ্যালাউ করুন।");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>SaaS Invoice - ${inv.id}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .paid { background: #dcfce7; color: #166534; }
          .due { background: #fee2e2; color: #991b1b; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #0f766e; color: white; text-align: left; padding: 10px; font-size: 13px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; font-size: 13px; }
          .total-box { margin-top: 30px; text-align: right; }
          .total-amount { font-size: 24px; font-weight: 800; color: #0f766e; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #0f766e;">RAHMANIA EDUSAAS PLATFORM</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Global Multi-Tenant Educational Cloud Management Suite</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Email: billing@rahmania.edu • Hotline: +880 1800-000000</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
            <p style="margin: 4px 0 0 0; font-weight: bold; font-family: monospace;">${inv.id}</p>
            <div style="margin-top: 8px;">
              <span class="badge ${inv.status}">${inv.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #64748b;">Billed To:</h3>
            <p style="margin: 0; font-size: 16px; font-weight: bold;">${inv.orgName}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Tenant Subdomain: <code>${inv.orgSlug}.rahmania.edu</code></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">Assigned Tier: ${inv.plan}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #64748b;">Invoice Details:</h3>
            <p style="margin: 0; font-size: 12px;">Billing Cycle: <strong>${inv.month}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Issue Date: <strong>${inv.issueDate}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px;">Due Date: <strong>${inv.dueDate}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px;">Payment Method: <strong>${inv.paymentMethod}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px;">Transaction Reference: <code>${inv.transactionId}</code></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description / Service Item</th>
              <th>Billing Period</th>
              <th>Tier</th>
              <th style="text-align: right;">Total (BDT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>EduSaaS Multi-Tenant Cloud License</strong><br/>
                <span style="font-size: 11px; color: #64748b;">${inv.notes}</span>
              </td>
              <td>${inv.month}</td>
              <td>${inv.plan}</td>
              <td style="text-align: right; font-weight: bold;">৳${inv.amount.toLocaleString("bn-BD")}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Total Amount Payable / Paid:</p>
          <div class="total-amount">৳${inv.amount.toLocaleString("bn-BD")}</div>
        </div>

        <div class="footer">
          <p>This is an automated system generated digital receipt issued by the Rahmania EduSaaS Platform Engine.</p>
          <p>Thank you for partnering with Rahmania Institute Educational Management Suite.</p>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-teal-600" />
            Billing & Revenue Center (বিলিং ও রাজস্ব ব্যবস্থাপনা)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সকল অর্গানাইজেশনের সাবস্ক্রিপশন ফি, ডিজিটাল ইনভয়েস জেনারেশন, বকেয়া পর্যবেক্ষণ ও ক্যাশ ফ্লো অডিট।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white gap-2 font-bold shadow-sm rounded-xl h-10 px-4"
          >
            <Plus size={16} /> নতুন ইনভয়েস তৈরি করুন
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-5 border-teal-200 bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-lg space-y-1">
          <div className="flex items-center justify-between text-teal-300">
            <span className="text-xs font-bold uppercase tracking-wider">Total Collected (আদায়কৃত)</span>
            <DollarSign size={18} />
          </div>
          <p className="text-3xl font-extrabold text-white pt-1">
            ৳{totalRevenue.toLocaleString("bn-BD")}
          </p>
          <p className="text-[11px] text-teal-200/80">সকল সক্রিয় সাবস্ক্রিপশনের মোট পেমেন্ট</p>
        </Card>

        <Card className="p-5 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dues (বকেয়া)</span>
            <Clock size={18} />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 pt-1">
            ৳{totalDue.toLocaleString("bn-BD")}
          </p>
          <p className="text-[11px] text-slate-500">অনলাইন পেমেন্ট পেন্ডিং থাকা বিলসমূহ</p>
        </Card>

        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Collection Rate (আদায় হার)</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 pt-1">
            {collectionRate}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">স্বাস্থ্যকর রিকয়ারিং ক্যাশফ্লো</p>
        </Card>

        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invoices (মোট বিল)</span>
            <CreditCard size={18} className="text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 pt-1">
            {invoices.length.toLocaleString("bn-BD")} <span className="text-sm font-semibold text-slate-400">টি</span>
          </p>
          <p className="text-[11px] text-slate-400">মোট নিবন্ধিত ইনভয়েস রেকর্ড</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="স্কুলের নাম বা ইনভয়েস নং খুঁজুন..."
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-xs rounded-xl w-36">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ইনভয়েস (All)</SelectItem>
                <SelectItem value="paid">পরিশোধিত (Paid)</SelectItem>
                <SelectItem value="due">বকেয়া (Due)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs rounded-xl gap-1.5"
              onClick={() => {
                const csvData = "Invoice ID,Organization,Plan,Month,Amount,Status\n" +
                  invoices.map((i) => `${i.id},"${i.orgName}",${i.plan},${i.month},${i.amount},${i.status}`).join("\n");
                const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `edusaas_billing_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Billing CSV ডাউনলোড শুরু হয়েছে!");
              }}
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices Ledger Table */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Subscription Invoices Ledger</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              সকল শিক্ষা প্রতিষ্ঠানের ডিজিটাল সাবস্ক্রিপশন ইনভয়েস বিবরণী
            </CardDescription>
          </div>
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
            {filteredInvoices.length} টি ইনভয়েস প্রদর্শিত
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Organization / School</th>
                  <th className="py-3.5 px-4">Plan & Cycle</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                      কোনো ইনভয়েস পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.status === "paid";
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                          {inv.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{inv.orgName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">slug: {inv.orgSlug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{inv.plan}</p>
                          <p className="text-[10px] text-slate-400">{inv.month}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-extrabold text-slate-900 text-sm">
                            ৳{inv.amount.toLocaleString("bn-BD")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            className={`cursor-pointer transition-transform active:scale-95 text-[10px] font-bold ${
                              isPaid ? "bg-emerald-100 text-emerald-800 border-none hover:bg-emerald-200" : "bg-red-100 text-red-800 border-none hover:bg-red-200"
                            }`}
                            onClick={() => handleToggleStatus(inv.id)}
                            title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                          >
                            {isPaid ? "PAID (পরিশোধিত)" : "DUE (বকেয়া)"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-700">{inv.paymentMethod}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{inv.transactionId}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-teal-700 hover:bg-teal-50"
                              onClick={() => handlePrint(inv)}
                              title="ইনভয়েস প্রিন্ট বা ডাউনলোড করুন"
                            >
                              <Printer size={14} className="mr-1" /> Print
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 px-2.5 text-xs font-semibold ${
                                isPaid ? "text-amber-700 border-amber-200 hover:bg-amber-50" : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleStatus(inv.id)}
                            >
                              {isPaid ? "Mark Due" : "Mark Paid"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus size={20} className="text-teal-600" /> নতুন সাবস্ক্রিপশন ইনভয়েস তৈরি
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              শিক্ষা প্রতিষ্ঠানের জন্য মাসিক বিলিং ইনভয়েস জেনারেট করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">প্রতিষ্ঠান নির্বাচন করুন *</Label>
              <Select
                value={newInvoice.orgSlug}
                onValueChange={(val) => {
                  const selected = organizations.find((o) => o.slug === val);
                  const fee = selected?.subscription_plan === "enterprise" ? "5000" : selected?.subscription_plan === "premium" ? "2500" : "1000";
                  setNewInvoice((prev) => ({ ...prev, orgSlug: val, amount: fee }));
                }}
                required
              >
                <SelectTrigger className="h-10 rounded-xl text-xs mt-1">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id || org.slug} value={org.slug}>
                      {org.name} ({org.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">বিলিং মাস *</Label>
                <Input
                  value={newInvoice.month}
                  onChange={(e) => setNewInvoice({ ...newInvoice, month: e.target.value })}
                  placeholder="e.g. October 2026"
                  className="h-10 rounded-xl text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">বিল এমাউন্ট (৳) *</Label>
                <Input
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  placeholder="2500"
                  className="h-10 rounded-xl text-xs mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">পেমেন্ট মেথড</Label>
                <Select
                  value={newInvoice.paymentMethod}
                  onValueChange={(val) => setNewInvoice({ ...newInvoice, paymentMethod: val })}
                >
                  <SelectTrigger className="h-10 rounded-xl text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bKash Merchant">bKash Merchant</SelectItem>
                    <SelectItem value="Nagad Corporate">Nagad Corporate</SelectItem>
                    <SelectItem value="Bank Wire / BEFTN">Bank Wire / BEFTN</SelectItem>
                    <SelectItem value="Cash / Cheque">Cash / Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">পেমেন্ট স্ট্যাটাস</Label>
                <Select
                  value={newInvoice.status}
                  onValueChange={(val) => setNewInvoice({ ...newInvoice, status: val })}
                >
                  <SelectTrigger className="h-10 rounded-xl text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (পরিশোধিত)</SelectItem>
                    <SelectItem value="due">Due (বকেয়া)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">নোট / ইনভয়েস বিবরণী</Label>
              <Input
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                className="h-10 rounded-xl text-xs mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                বাতিল
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold">
                ইনভয়েস তৈরি ও সংরক্ষণ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
