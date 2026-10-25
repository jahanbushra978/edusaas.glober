"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Globe, CheckCircle2, ShieldCheck, AlertTriangle, RefreshCw,
  Plus, Search, Copy, Check, Trash2, Info, Lock, X
} from "lucide-react";
import { listOrganizations } from "@/features/platform-console/lib/platformConsoleClient";

const DEFAULT_DOMAINS = [
  {
    id: "dom_01",
    domain: "rahmaniainstitute.org",
    orgId: "org-rahmania-main",
    orgName: "Rahmania Institute",
    type: "Apex Domain (@)",
    target: "76.76.21.21",
    cnameTarget: "cname.edusaas.cloud",
    dnsStatus: "verified",
    sslStatus: "active",
    sslProvider: "Cloudflare Edge + Let's Encrypt",
    sslExpiry: "2026-12-28",
    autoRenew: true,
    isPrimary: true,
    createdAt: "2026-01-15",
  },
  {
    id: "dom_02",
    domain: "portal.rahmaniainstitute.org",
    orgId: "org-rahmania-main",
    orgName: "Rahmania Institute",
    type: "Subdomain",
    target: "cname.edusaas.cloud",
    cnameTarget: "cname.edusaas.cloud",
    dnsStatus: "verified",
    sslStatus: "active",
    sslProvider: "Let's Encrypt Wildcard",
    sslExpiry: "2026-11-20",
    autoRenew: true,
    isPrimary: false,
    createdAt: "2026-02-01",
  },
  {
    id: "dom_03",
    domain: "uttaraschool.edu.bd",
    orgId: "org-uttara-model",
    orgName: "Uttara Model Academy",
    type: "Apex Domain (@)",
    target: "76.76.21.21",
    cnameTarget: "cname.edusaas.cloud",
    dnsStatus: "pending",
    sslStatus: "generating",
    sslProvider: "Let's Encrypt",
    sslExpiry: "Pending Verification",
    autoRenew: true,
    isPrimary: true,
    createdAt: "2026-03-22",
  },
  {
    id: "dom_04",
    domain: "mirpurideal.com",
    orgId: "org-mirpur-ideal",
    orgName: "Mirpur Ideal College",
    type: "Apex Domain (@)",
    target: "76.76.21.21",
    cnameTarget: "cname.edusaas.cloud",
    dnsStatus: "verified",
    sslStatus: "active",
    sslProvider: "Let's Encrypt",
    sslExpiry: "2026-10-15",
    autoRenew: true,
    isPrimary: true,
    createdAt: "2026-03-01",
  },
];

export default function DomainsManagementPage() {
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dnsGuideDomain, setDnsGuideDomain] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  // Load organizations for dropdown & domains from local storage
  useEffect(() => {
    async function loadData() {
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.warn("Could not load orgs for domains", err);
      }
      try {
        const saved = localStorage.getItem("edusaas_platform_domains");
        if (saved) {
          setDomains(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Could not load local domains", e);
      }
    }
    loadData();
  }, []);

  const saveDomains = (updated) => {
    setDomains(updated);
    try {
      localStorage.setItem("edusaas_platform_domains", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save domains", e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // Add new domain
  const handleAddDomain = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const domainName = (formData.get("domain") || "").trim().toLowerCase().replace(/^https?:\/\//, "");
    const selectedOrgId = formData.get("orgId");
    const org = organizations.find((o) => o.id === selectedOrgId) || { name: "Connected School" };

    if (!domainName) return;

    const newDomain = {
      id: `dom_${Date.now()}`,
      domain: domainName,
      orgId: selectedOrgId || "org_custom",
      orgName: org.name || "Default School",
      type: domainName.split(".").length > 2 ? "Subdomain" : "Apex Domain (@)",
      target: "76.76.21.21",
      cnameTarget: "cname.edusaas.cloud",
      dnsStatus: "pending",
      sslStatus: "generating",
      sslProvider: "Let's Encrypt Wildcard",
      sslExpiry: "Pending Verification",
      autoRenew: true,
      isPrimary: formData.get("isPrimary") === "on",
      createdAt: new Date().toISOString().split("T")[0],
    };

    saveDomains([newDomain, ...domains]);
    setIsAddModalOpen(false);
    showToast(`ডোমেইন '${domainName}' যুক্ত করা হয়েছে। DNS রেকর্ড কনফিগার করুন।`);
    setDnsGuideDomain(newDomain);
  };

  // Live verification simulation
  const handleVerifyDns = (domainItem) => {
    setVerifyingId(domainItem.id);
    setTimeout(() => {
      const updated = domains.map((d) => {
        if (d.id === domainItem.id) {
          return {
            ...d,
            dnsStatus: "verified",
            sslStatus: "active",
            sslExpiry: "2027-01-10",
          };
        }
        return d;
      });
      saveDomains(updated);
      setVerifyingId(null);
      showToast(`✅ '${domainItem.domain}' এর DNS ও SSL সফলভাবে ভেরিফাইড হয়েছে!`);
    }, 1800);
  };

  const handleDeleteDomain = (id, name) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${name}' ডোমেইনটি অপসারণ করতে চান?`)) {
      const updated = domains.filter((d) => d.id !== id);
      saveDomains(updated);
      showToast(`'${name}' ডোমেইনটি অপসারণ করা হয়েছে।`);
    }
  };

  // Filtered
  const filteredDomains = domains.filter((d) => {
    const matchSearch =
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      d.orgName.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && d.dnsStatus === "verified") ||
      (statusFilter === "pending" && d.dnsStatus === "pending");
    return matchSearch && matchStatus;
  });

  const activeSslCount = domains.filter((d) => d.sslStatus === "active").length;
  const pendingCount = domains.filter((d) => d.dnsStatus === "pending").length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-teal-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Custom Domains & SSL Engine</h1>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs font-bold">Edge Routing</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            প্রতিটি স্কুল বা মাদ্রাসার জন্য নিজস্ব ডোমেইন ম্যাপিং, CNAME রাউটিং ও স্বয়ংক্রিয় SSL সার্টিফিকেট লাইফসাইকেল।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>নতুন কাস্টম ডোমেইন যুক্ত করুন</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট কানেক্টেড ডোমেইন</span>
            <Globe size={18} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{domains.length} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">মাল্টি-টেন্যান্ট এজ রাউটারে সক্রিয়</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সক্রিয় SSL সার্টিফিকেট</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeSslCount} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">TLS 1.3 এনক্রিপশন সক্রিয়</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">DNS ভেরিফিকেশন অপেক্ষমাণ</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">গ্রাহকের DNS প্রোপাগেশন অপেক্ষা করছে</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">অটো-রিনিউ সুরক্ষা</span>
            <Lock size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">100%</p>
          <p className="text-[11px] text-slate-400 mt-1">মেয়াদ শেষ হওয়ার ৩০ দিন আগে অটো-রিনিউ</p>
        </div>
      </div>

      {/* Main Domains Table Card */}
      <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900">Tenant Domain Mapping Registry</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              সব টেন্যান্ট ডোমেইনের লাইভ স্ট্যাটাস ও SSL হেলথ মনিটরিং
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ডোমেইন বা প্রতিষ্ঠান খুঁজুন..."
                className="pl-8 text-xs h-9 w-48 sm:w-60 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সকল ({domains.length})
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "verified" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সক্রিয় ({activeSslCount})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === "pending" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                পেন্ডিং ({pendingCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">ডোমেইন ও টাইপ</th>
                  <th className="p-4">সংযুক্ত প্রতিষ্ঠান</th>
                  <th className="p-4">DNS প্রোপাগেশন</th>
                  <th className="p-4">SSL সার্টিফিকেট</th>
                  <th className="p-4">মেয়াদ উত্তীর্ণ</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDomains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      কোনো ডোমেইন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredDomains.map((item) => {
                    const isVerifying = verifyingId === item.id;
                    const isVerified = item.dnsStatus === "verified";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm font-mono">{item.domain}</span>
                            {item.isPrimary && (
                              <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] font-bold">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.type}</p>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-slate-800">{item.orgName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.orgId}</p>
                        </td>

                        <td className="p-4">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} /> Verified & Routed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle size={12} /> Pending DNS Setup
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {item.sslStatus === "active" ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                <Lock size={10} /> Active TLS 1.3
                              </span>
                              <p className="text-[10px] text-slate-400">{item.sslProvider}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <RefreshCw size={10} className="animate-spin" /> Provisioning...
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <p className="text-slate-700 font-medium">{item.sslExpiry}</p>
                          {item.autoRenew && (
                            <p className="text-[10px] text-emerald-600 font-semibold">অটো-রিনিউ সক্রিয়</p>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setDnsGuideDomain(item)}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-8 text-teal-700 hover:bg-teal-50"
                              title="DNS রেকর্ড দেখুন"
                            >
                              <Info size={14} className="mr-1" />
                              DNS গাইড
                            </Button>

                            <Button
                              onClick={() => handleVerifyDns(item)}
                              disabled={isVerifying}
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                            >
                              <RefreshCw size={12} className={`mr-1 ${isVerifying ? "animate-spin text-teal-600" : ""}`} />
                              {isVerifying ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
                            </Button>

                            <Button
                              onClick={() => handleDeleteDomain(item.id, item.domain)}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-8 text-red-600 hover:bg-red-50 hover:text-red-700 px-2"
                              title="অপসারণ করুন"
                            >
                              <Trash2 size={13} />
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

      {/* Add New Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">নতুন কাস্টম ডোমেইন যুক্ত করুন</h3>
                <p className="text-xs text-slate-400">টেন্যান্ট শিক্ষা প্রতিষ্ঠানের নিজস্ব ডোমেইন বা সাবডোমেইন</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">প্রতিষ্ঠান নির্বাচন করুন (Organization)</Label>
                <select
                  name="orgId"
                  required
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.slug || org.id})
                    </option>
                  ))}
                  {organizations.length === 0 && (
                    <option value="org-default">Rahmania Institute (Default)</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">ডোমেইন নাম (Domain Name)</Label>
                <Input
                  name="domain"
                  required
                  placeholder="যেমন: schoolname.edu.bd বা portal.school.com"
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  http:// বা https:// ছাড়া শুধু ডোমেইন নাম লিখুন।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimary"
                  name="isPrimary"
                  defaultChecked
                  className="h-4 w-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                />
                <Label htmlFor="isPrimary" className="text-xs text-slate-700 cursor-pointer font-medium">
                  এই প্রতিষ্ঠানের প্রধান (Primary) ব্রাউজিং ডোমেইন হিসেবে নির্ধারণ করুন
                </Label>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 text-slate-600">
                <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal-600" /> স্বয়ংক্রিয় SSL ও DDoS প্রোটেকশন
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  ডোমেইনটি যুক্ত করার পর আমাদের DNS এন্ট্রি পয়েন্টের দিকে পয়েন্ট করলে বিনামূল্যে Let&apos;s Encrypt ও Cloudflare Edge SSL চালু হবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  ডোমেইন যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS Configuration Guide Drawer/Modal */}
      {dnsGuideDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">DNS কনফিগারেশন গাইডলাইন</h3>
                <p className="text-xs text-teal-700 font-mono font-bold">{dnsGuideDomain.domain}</p>
              </div>
              <button onClick={() => setDnsGuideDomain(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                আপনার ডোমেইন প্রোভাইডারের (যেমন: Cloudflare, BTCL, Namecheap, GoDaddy, বা cPanel) DNS ম্যানেজমেন্ট সেকশনে গিয়ে নিচের রেকর্ডগুলো যোগ করুন:
              </p>

              {/* Record 1: CNAME */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-black">CNAME</span>
                    <span>সাবডোমেইন বা পোর্টাল রাউটিং</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(dnsGuideDomain.cnameTarget, "cname")}
                    className="text-teal-700 hover:text-teal-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedKey === "cname" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === "cname" ? "কপি হয়েছে!" : "টার্গেট কপি করুন"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Type</span>
                    CNAME
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Name / Host</span>
                    {dnsGuideDomain.type === "Subdomain" ? dnsGuideDomain.domain.split(".")[0] : "@"}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-sans">Target Value</span>
                    {dnsGuideDomain.cnameTarget}
                  </div>
                </div>
              </div>

              {/* Record 2: A Record */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black">A Record</span>
                    <span>মূল এপেক্স ডোমেইন রাউটিং (@)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(dnsGuideDomain.target, "a_rec")}
                    className="text-blue-700 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedKey === "a_rec" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === "a_rec" ? "কপি হয়েছে!" : "আইপি কপি করুন"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Type</span>
                    A
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Name / Host</span>
                    @
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">IP Address</span>
                    {dnsGuideDomain.target}
                  </div>
                </div>
              </div>

              {/* Record 3: TXT Ownership Verification */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black">TXT Record</span>
                    <span>মালিকানা যাচাই (Ownership Verification)</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Name</span>
                    _edusaas-challenge
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-sans">Value</span>
                    edusaas-verify-49b819f20c
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info size={13} /> বিশ্বব্যাপী DNS ছড়াতে ২-২৪ মিনিট সময় লাগতে পারে।
              </span>
              <Button
                onClick={() => setDnsGuideDomain(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                ঠিক আছে, বুঝেছি
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
