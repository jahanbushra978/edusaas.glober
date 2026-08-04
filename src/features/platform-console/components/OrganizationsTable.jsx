'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Globe, Layers, ShieldCheck, Trash2, AlertTriangle, CheckCircle2,
  Ban, Bell, DollarSign, MoreVertical, Eye, Pencil, ExternalLink, X
} from "lucide-react";

// ─── ⋮ Kebab Dropdown Menu ───────────────────────────────────────────
function KebabMenu({ org, onSuspend, onDelete, onWarn }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const slug = org.slug || org.subdomain || "rahmania";
  const isSuspended = org.status === "suspended";

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      href: `/platform-console/organizations/${org.id}`,
      color: "text-slate-700",
    },
    {
      label: "ERP Admin Panel",
      icon: ShieldCheck,
      href: `/AdminDashboard?slug=${slug}`,
      color: "text-teal-700",
    },
    {
      label: "Page Builder",
      icon: Layers,
      href: `/admin/website/page-builder?slug=${slug}`,
      color: "text-indigo-700",
    },
    {
      label: "Live Site",
      icon: Globe,
      href: `/site/${slug}`,
      target: "_blank",
      color: "text-sky-700",
    },
    { divider: true },
    {
      label: "Send Alert Notice",
      icon: Bell,
      onClick: () => { onWarn(org); setOpen(false); },
      color: "text-amber-700",
    },
    {
      label: isSuspended ? "Reactivate Account" : "Suspend Account",
      icon: isSuspended ? CheckCircle2 : Ban,
      onClick: () => { onSuspend(org.id, org.status); setOpen(false); },
      color: isSuspended ? "text-emerald-700" : "text-orange-600",
    },
    { divider: true },
    {
      label: "Delete Organization",
      icon: Trash2,
      onClick: () => { onDelete(org); setOpen(false); },
      color: "text-red-600",
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
        title="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 overflow-hidden">
          {actions.map((action, idx) => {
            if (action.divider) return <div key={idx} className="my-1 border-t border-slate-100" />;
            const Icon = action.icon;
            const content = (
              <span
                className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors w-full text-left cursor-pointer ${
                  action.danger
                    ? "hover:bg-red-50 text-red-600"
                    : `${action.color} hover:bg-slate-50`
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {action.label}
              </span>
            );
            if (action.href) {
              return (
                <Link key={idx} href={action.href} target={action.target} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              );
            }
            return (
              <button key={idx} onClick={action.onClick} className="w-full">
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────
export default function OrganizationsTable({ organizations: initialOrgs }) {
  const [orgs, setOrgs] = useState(initialOrgs || []);
  const [deleteModalOrg, setDeleteModalOrg] = useState(null);
  const [typedSlugConfirm, setTypedSlugConfirm] = useState("");
  const [warningModalOrg, setWarningModalOrg] = useState(null);
  const [warningText, setWarningText] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (!orgs || !orgs.length) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
        এখনো কোনো organization তৈরি হয়নি।
      </div>
    );
  }

  // Toggle Account Suspension Status
  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );
    showToast(`প্রতিষ্ঠানের অ্যাকাউন্ট অবস্থা '${nextStatus.toUpperCase()}' করা হয়েছে!`);
  };

  // Toggle Billing Payment Status
  const handleTogglePayment = (id, currentPayment) => {
    const nextPayment = currentPayment === "paid" ? "due" : "paid";
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, payment_status: nextPayment } : o))
    );
    showToast(`বিলিং পরিশোধ অবস্থা '${nextPayment.toUpperCase()}' করা হয়েছে!`);
  };

  // Execute Safe Permanent Delete
  const handleConfirmDelete = () => {
    if (!deleteModalOrg) return;
    const cleanSlug = (deleteModalOrg.slug || deleteModalOrg.subdomain || "").toLowerCase();
    if (typedSlugConfirm.trim().toLowerCase() !== cleanSlug) return;

    setOrgs((prev) => prev.filter((o) => o.id !== deleteModalOrg.id));
    if (typeof window !== "undefined") {
      const savedOrgs = JSON.parse(localStorage.getItem("created_orgs") || "[]");
      const updatedSaved = savedOrgs.filter((o) => o.id !== deleteModalOrg.id && o.slug !== cleanSlug);
      localStorage.setItem("created_orgs", JSON.stringify(updatedSaved));
    }

    setDeleteModalOrg(null);
    setTypedSlugConfirm("");
    showToast(`'${deleteModalOrg.name}' প্রতিষ্ঠানটি স্থায়ীভাবে ডিলিট করা হয়েছে।`);
  };

  // Send Warning Alert Notice to School Admin
  const handleSendWarning = () => {
    if (!warningModalOrg || !warningText.trim()) return;
    const slug = (warningModalOrg.slug || warningModalOrg.subdomain || "").toLowerCase();

    if (typeof window !== "undefined") {
      localStorage.setItem(`org_warning_${slug}`, JSON.stringify({
        message: warningText.trim(),
        sent_at: new Date().toISOString(),
      }));
    }

    setWarningModalOrg(null);
    setWarningText("");
    showToast(`'${warningModalOrg.name}'-এর ড্যাশবোর্ডে ওয়ার্নিং মেসেজ পাঠানো হয়েছে!`);
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs shadow-2xl border border-teal-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Organization & Domain</TableHead>
              <TableHead className="font-bold">Plan & Billing</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Warning</TableHead>
              <TableHead className="font-bold text-right w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => {
              const slug = org.slug || org.subdomain || "rahmania";
              const isSuspended = org.status === "suspended";
              const isPaid = (org.payment_status || "paid") === "paid";

              let savedCustomFee = null;
              if (typeof window !== "undefined") {
                savedCustomFee = localStorage.getItem(`org_custom_fee_${slug}`);
              }

              const feeVal = savedCustomFee || org.custom_fee || (org.subscription_plan?.includes("Enterprise") ? "5000" : (slug === "mehedi-hasan" ? "1050" : "1000"));
              const planName = org.subscription_plan === "Free Tier Access" ? "Free Tier Access" : (org.subscription_plan?.includes("Enterprise") ? "Enterprise Plan" : "Standard Plan");
              const formattedPlanBadge = planName === "Free Tier Access"
                ? "🎁 Free Tier"
                : `${planName} (৳${parseInt(feeVal, 10).toLocaleString("bn-BD")}/মাস)`;

              return (
                <TableRow key={org.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Organization & Domain */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: org.theme_color || '#0f766e' }}
                      >
                        {org.logo_initial || org.name.charAt(0)}
                      </span>
                      <div>
                        <Link href={`/platform-console/organizations/${org.id}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-sm">
                          {org.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{org.custom_domain || `${slug}.platform.com`}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Billing Column */}
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="capitalize text-[11px] font-bold text-slate-800 bg-slate-100 border-slate-300">
                        {formattedPlanBadge}
                      </Badge>
                      <button
                        onClick={() => handleTogglePayment(org.id, org.payment_status || "paid")}
                        title="ক্লিক করে বিল পরিশোধিত বা বকেয়া করুন"
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 w-fit ${
                          isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        }`}
                      >
                        <DollarSign size={12} /> {isPaid ? "PAID" : "DUE ⚠️"}
                      </button>
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(org.id, org.status)}
                      title="ক্লিক করে একাউন্ট সাময়িকভাবে স্থগিত বা চালু করুন"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isSuspended
                          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {isSuspended ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                      {isSuspended ? "SUSPENDED" : "ACTIVE"}
                    </button>
                  </TableCell>

                  {/* Warning Button */}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-amber-700 hover:bg-amber-50 border border-amber-200"
                      onClick={() => setWarningModalOrg(org)}
                    >
                      <Bell size={12} className="mr-1 text-amber-600" /> Alert
                    </Button>
                  </TableCell>

                  {/* ⋮ Kebab Action Menu */}
                  <TableCell className="text-right">
                    <KebabMenu
                      org={org}
                      onSuspend={handleToggleStatus}
                      onDelete={(o) => { setDeleteModalOrg(o); setTypedSlugConfirm(""); }}
                      onWarn={setWarningModalOrg}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* DOUBLE CONFIRMATION SAFE DELETE DIALOG */}
      {deleteModalOrg && (
        <Dialog open={!!deleteModalOrg} onOpenChange={() => setDeleteModalOrg(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2 text-base font-bold">
                <AlertTriangle size={20} /> স্থায়ীভাবে ডিলিট নিশ্চিতকরণ
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 pt-2 space-y-2">
                <p>ভুলক্রমে ডিলিট হওয়া রোধ করতে নিচের বক্সে হুবহু এই স্কুলের স্লাগ <b>{(deleteModalOrg.slug || deleteModalOrg.subdomain || "").toLowerCase()}</b> টাইপ করুন।</p>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900">
                ⚠️ নিশ্চিত হোন: <b>{deleteModalOrg.name}</b> ডিলিট করলে তাদের সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।
              </div>

              <Input
                placeholder={`টাইপ করুন: ${(deleteModalOrg.slug || deleteModalOrg.subdomain || "").toLowerCase()}`}
                value={typedSlugConfirm}
                onChange={(e) => setTypedSlugConfirm(e.target.value)}
                className="h-9 text-xs font-mono border-red-300 focus:ring-red-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteModalOrg(null)} className="text-xs">
                  বাতিল
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  disabled={typedSlugConfirm.trim().toLowerCase() !== (deleteModalOrg.slug || deleteModalOrg.subdomain || "").toLowerCase()}
                  onClick={handleConfirmDelete}
                >
                  <Trash2 size={14} className="mr-1" /> স্থায়ীভাবে ডিলিট করুন
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* WARNING ALERT DISPATCHER DIALOG */}
      {warningModalOrg && (
        <Dialog open={!!warningModalOrg} onOpenChange={() => setWarningModalOrg(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-amber-700 flex items-center gap-2 text-base font-bold">
                <Bell size={18} /> ওয়ার্নিং নোটিশ পাঠান ({warningModalOrg.name})
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 pt-1">
                এই মেসেজটি শুধুমাত্র <b>{warningModalOrg.name}</b>-এর সুপার এডমিন প্যানেলের উপরে লাল ওয়ার্নিং ব্যানার হিসেবে প্রদর্শিত হবে।
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Textarea
                placeholder="যেমন: আপনার চলতি মাসের বিলের মেয়াদ আগামী ৩০ জুলাই শেষ হবে। অনুগ্রহ করে বকেয়া পরিশোধ করুন।"
                value={warningText}
                onChange={(e) => setWarningText(e.target.value)}
                className="text-xs min-h-[90px]"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setWarningModalOrg(null)} className="text-xs">
                  বাতিল
                </Button>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold" onClick={handleSendWarning}>
                  <Bell size={14} className="mr-1" /> নোটিশ পাঠান
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
