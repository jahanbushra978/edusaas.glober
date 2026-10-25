"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2, MessageSquare, CalendarCheck, LifeBuoy, Lightbulb,
  Bug, TrendingUp, Globe, HardDrive, Handshake,
  Search, RefreshCw, CheckCircle, XCircle, Eye,
  Inbox, ChevronRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Tab definitions ────────────────────────────────────────────────
const TABS = [
  { key: "applications", label: "📝 Organization Applications", icon: Building2,     color: "teal" },
  { key: "messages",     label: "💬 Contact Messages",          icon: MessageSquare,  color: "blue" },
  { key: "demo",         label: "📅 Demo Requests",             icon: CalendarCheck,  color: "violet" },
  { key: "support",      label: "🎫 Support Tickets",           icon: LifeBuoy,       color: "amber" },
  { key: "features",     label: "💡 Feature Requests",          icon: Lightbulb,      color: "yellow" },
  { key: "bugs",         label: "🐞 Bug Reports",               icon: Bug,            color: "red" },
  { key: "upgrades",     label: "💳 Upgrade Requests",          icon: TrendingUp,     color: "emerald" },
  { key: "domains",      label: "🌐 Domain Requests",           icon: Globe,          color: "sky" },
  { key: "storage",      label: "📦 Storage Requests",          icon: HardDrive,      color: "orange" },
  { key: "partners",     label: "🤝 Partner Requests",          icon: Handshake,      color: "pink" },
];

// Seed inquiries for secondary tabs so the platform console is 100% complete
const SEED_INBOX_ITEMS = {
  demo: [
    {
      id: "demo_01",
      institution: "দারুল উলুম মাদানিয়া মাদ্রাসা",
      name: "মুফতি আব্দুর রহমান",
      phone: "01812345678",
      email: "madaniyah@gmail.com",
      studentsCount: "1200",
      preferredDate: "2026-10-08 11:00 AM",
      status: "pending",
      note: "বায়োমেট্রিক এটেনডেন্স ও স্বয়ংক্রিয় এসএমএস সিস্টেম সরাসরি জুম মিটিংয়ে দেখতে আগ্রহী।",
      created_at: "2026-10-03 16:30",
    },
    {
      id: "demo_02",
      institution: "উত্তরা ইংলিশ মিডিয়াম মডেল স্কুল",
      name: "ইঞ্জিনিয়ার কামরুল হাসান",
      phone: "01799887766",
      email: "uttaramodel@yahoo.com",
      studentsCount: "2500",
      preferredDate: "2026-10-06 03:00 PM",
      status: "scheduled",
      note: "অনলাইন ফি কালেকশন ও অভিভাবক অ্যাপের ডেমো প্রয়োজন।",
      created_at: "2026-10-02 11:20",
    },
  ],
  support: [
    {
      id: "sup_01",
      institution: "Rahmania Institute",
      name: "অ্যাডমিন সেকশন",
      phone: "01906898939",
      email: "rahmaniainstitute.org@gmail.com",
      priority: "high",
      category: "Biometric Hardware",
      subject: "জেডকেটেকো ফিঙ্গারপ্রিন্ট ডিভাইসে টাইমসিঙ্ক রি-কানেক্ট সমস্যা",
      status: "in_progress",
      created_at: "2026-10-03 14:00",
    },
    {
      id: "sup_02",
      institution: "মিরপুর আইডিয়াল কলেজ",
      name: "অ্যাকাউন্টস ডিপার্টমেন্ট",
      phone: "01611223344",
      email: "accounts@mirpurideal.com",
      priority: "medium",
      category: "Fee Gateway",
      subject: "বিকাশ পেমেন্ট রিফান্ড রিকনসিলিয়েশন ভিউ",
      status: "open",
      created_at: "2026-10-02 09:40",
    },
  ],
  features: [
    {
      id: "feat_01",
      institution: "আল-হেরা ক্যাডেট মাদ্রাসা",
      name: "মাওলানা আব্দুল করিম",
      subject: "হিফজুল কুরআন দৈনিক ছবক ট্র্যাকার ও পারাভিত্তিক রিপোর্ট",
      status: "planned",
      votes: 28,
      created_at: "2026-09-28",
    },
    {
      id: "feat_02",
      institution: "গাজীপুর মডেল স্কুল",
      name: "ফারহানা ইয়াসমিন",
      subject: "শিক্ষার্থীদের অভিভাবক মোবাইল অ্যাপে লাইভ বাস ট্র্যাকিং জিপিএস",
      status: "under_review",
      votes: 19,
      created_at: "2026-09-30",
    },
  ],
  bugs: [
    {
      id: "bug_01",
      institution: "Dhaka Central School",
      name: "আইটি অফিসার",
      subject: "সাফারি ব্রাউজারে মার্কশিট প্রিন্ট প্রিভিউ পেজ মার্জিন কাটছে",
      severity: "minor",
      status: "resolved",
      created_at: "2026-10-01",
    },
  ],
  upgrades: [
    {
      id: "upg_01",
      institution: "Uttara Model Academy",
      name: "প্রিন্সিপাল",
      phone: "01711223344",
      currentPlan: "Standard Academic Pro",
      targetPlan: "Campus Business Suite",
      requestedQuota: "৫,০০০ শিক্ষার্থী ও ১০টি ব্রাঞ্চ",
      status: "pending",
      created_at: "2026-10-03 10:15",
    },
  ],
  domains: [
    {
      id: "dom_req_01",
      institution: "Mirpur Ideal College",
      domain: "portal.mirpurideal.com",
      sslType: "Let's Encrypt Wildcard",
      status: "pending",
      created_at: "2026-10-03 12:00",
    },
  ],
  storage: [
    {
      id: "stor_01",
      institution: "Rahmania Institute",
      currentStorage: "15 GB",
      requestedAddition: "+50 GB Cloud Storage",
      reason: "বার্ষিক পরীক্ষার স্ক্যান করা ওএমআর শিট ও লাইব্রেরি ই-বুক সংরক্ষণের জন্য",
      status: "approved",
      created_at: "2026-10-02 18:00",
    },
  ],
  partners: [
    {
      id: "prt_01",
      institution: "ইডুটেক বাংলাদেশ নেটওয়ার্ক",
      name: "তানভীর আহমেদ",
      phone: "01844556677",
      email: "tanvir@edutechbd.com",
      subject: "ময়মনসিংহ বিভাগের ৫০টি মাদ্রাসায় সফটওয়্যার ডিস্ট্রিবিউশন পার্টনারশিপ",
      status: "pending",
      created_at: "2026-10-03 15:45",
    },
  ],
};

// ─── Status badge helper ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 border-amber-300" },
    approved:    { label: "Approved",    cls: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    rejected:    { label: "Rejected",    cls: "bg-red-100 text-red-700 border-red-300" },
    read:        { label: "Read",        cls: "bg-slate-100 text-slate-600 border-slate-300" },
    unread:      { label: "Unread",      cls: "bg-blue-100 text-blue-700 border-blue-300" },
    replied:     { label: "Replied",     cls: "bg-teal-100 text-teal-700 border-teal-300" },
    scheduled:   { label: "Scheduled",   cls: "bg-violet-100 text-violet-700 border-violet-300" },
    open:        { label: "Open Ticket", cls: "bg-red-100 text-red-700 border-red-300" },
    in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700 border-blue-300" },
    resolved:    { label: "Resolved",    cls: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    planned:     { label: "Planned",     cls: "bg-purple-100 text-purple-700 border-purple-300" },
    under_review:{ label: "In Review",   cls: "bg-amber-100 text-amber-700 border-amber-300" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-slate-100 text-slate-600 border-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Organization Applications Tab ──────────────────────────────────
function ApplicationsTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [toast, setToast]     = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/onboarding-requests");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) setItems(json.data);
    } catch {/* silent */}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id, action) => {
    try {
      const res  = await fetch("/api/admin/onboarding-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (json.ok) { showToast("✅ " + json.message); fetchData(); }
    } catch {/* silent */}
  };

  const filtered = items.filter((it) => {
    const matchFilter = filter === "all" || it.status === filter;
    const matchSearch = !search || it.name?.toLowerCase().includes(search.toLowerCase()) || it.phone?.includes(search);
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw size={22} className="animate-spin text-teal-500" />
      <span className="ml-3 text-sm text-slate-500">লোড হচ্ছে...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs shadow-2xl border border-teal-500/30 flex items-center gap-2">
          <CheckCircle size={15} className="text-teal-400 shrink-0" /> {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="প্রতিষ্ঠান বা ফোন নম্বর খুঁজুন..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-400 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                filter === s
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "সকল" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-teal-600 transition-colors" title="রিফ্রেশ">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">কোনো আবেদন পাওয়া যায়নি।</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{item.name || "—"}</span>
                    <StatusBadge status={item.status || "pending"} />
                    {item.division && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {item.division}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    {item.phone    && <span>📞 {item.phone}</span>}
                    {item.district && <span>📍 {item.district}</span>}
                    {item.email    && <span>✉️ {item.email}</span>}
                    {item.submitted_at && (
                      <span>🕐 {new Date(item.submitted_at).toLocaleDateString("bn-BD")}</span>
                    )}
                  </div>
                </div>
                {(!item.status || item.status === "pending") && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(item.id, "approve")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle size={13} /> অনুমোদন করুন
                    </button>
                    <button
                      onClick={() => handleAction(item.id, "reject")}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <XCircle size={13} /> প্রত্যাখ্যান
                    </button>
                  </div>
                )}
              </div>
              {item.address && (
                <p className="mt-2 text-[11px] text-slate-400 border-t border-slate-100 pt-2">🏫 {item.address}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Contact Messages Tab ─────────────────────────────────────────────
function MessagesTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/admin/contact-messages");
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) setItems(json.data);
      } catch {/* silent */}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw size={22} className="animate-spin text-teal-500" />
      <span className="ml-3 text-sm text-slate-500">লোড হচ্ছে...</span>
    </div>
  );

  if (!items.length) return (
    <div className="text-center py-16 text-slate-400 text-sm">কোনো মেসেজ পাওয়া যায়নি।</div>
  );

  return (
    <div className="space-y-3">
      {items.map((msg, i) => (
        <div key={msg.id || i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{msg.name || "—"}</span>
                <StatusBadge status={msg.status || "unread"} />
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                {msg.phone       && <span>📞 {msg.phone}</span>}
                {msg.institution && <span>🏫 {msg.institution}</span>}
                {msg.created_at  && <span>🕐 {new Date(msg.created_at).toLocaleDateString("bn-BD")}</span>}
              </div>
              {msg.message && (
                <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 line-clamp-2">
                  {msg.message}
                </p>
              )}
            </div>
            <Eye size={16} className="text-slate-300 hover:text-teal-500 cursor-pointer shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dynamic Inquiries Tab for Demo, Support, Bugs, Upgrades etc. ───────
function GenericInquiriesTab({ categoryKey, title }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`edusaas_inbox_${categoryKey}`);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        const seed = SEED_INBOX_ITEMS[categoryKey] || [];
        setItems(seed);
      }
    } catch (e) {
      setItems(SEED_INBOX_ITEMS[categoryKey] || []);
    }
  }, [categoryKey]);

  const saveItems = (updated) => {
    setItems(updated);
    try {
      localStorage.setItem(`edusaas_inbox_${categoryKey}`, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = items.map((it) => (it.id === id ? { ...it, status: newStatus } : it));
    saveItems(updated);
    showToast(`স্ট্যাটাস সফলভাবে '${newStatus.toUpperCase()}' করা হয়েছে!`);
  };

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      it.institution?.toLowerCase().includes(q) ||
      it.name?.toLowerCase().includes(q) ||
      it.subject?.toLowerCase().includes(q) ||
      it.phone?.includes(q);
    const matchStatus = statusFilter === "all" || it.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs shadow-2xl border border-teal-500/30 flex items-center gap-2">
          <CheckCircle size={15} className="text-teal-400 shrink-0" /> {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="প্রতিষ্ঠান, নাম বা বিষয় খুঁজুন..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-slate-600 font-bold bg-white">
            {filtered.length} টি রেকর্ড পাওয়া গেছে
          </Badge>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          এই ফোল্ডারে বর্তমানে কোনো অনুরোধ বা বার্তা নেই।
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.institution || item.name || "Request Item"}
                    </span>
                    <StatusBadge status={item.status || "pending"} />
                    {item.priority && (
                      <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                        {item.priority.toUpperCase()} PRIORITY
                      </span>
                    )}
                    {item.votes && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        👍 {item.votes} Votes
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    {item.name  && <span>👤 {item.name}</span>}
                    {item.phone && <span>📞 {item.phone}</span>}
                    {item.email && <span>✉️ {item.email}</span>}
                    {item.preferredDate && <span>📅 শিডিউল: {item.preferredDate}</span>}
                    {item.studentsCount && <span>👥 শিক্ষার্থী: {item.studentsCount} জন</span>}
                    {item.created_at && <span>🕐 {item.created_at}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "resolved" && item.status !== "approved" && (
                    <Button
                      onClick={() => handleUpdateStatus(item.id, "approved")}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 rounded-xl"
                    >
                      <CheckCircle2 size={13} className="mr-1" />
                      সম্পন্ন / অনুমোদন
                    </Button>
                  )}
                  {item.status === "pending" && (
                    <Button
                      onClick={() => handleUpdateStatus(item.id, "in_progress")}
                      variant="outline"
                      size="sm"
                      className="text-slate-700 border-slate-200 hover:bg-slate-100 font-bold text-[11px] h-8 rounded-xl"
                    >
                      চলমান রাখুন
                    </Button>
                  )}
                </div>
              </div>

              {/* Subject or Note */}
              {(item.subject || item.note || item.requestedQuota) && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                  {item.subject && <p className="font-semibold text-slate-900">{item.subject}</p>}
                  {item.note && <p className="text-slate-600 text-[11px]">{item.note}</p>}
                  {item.requestedQuota && (
                    <p className="text-teal-800 font-bold text-[11px]">অনুরোধকৃত আপগ্রেড: {item.requestedQuota}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Central Inbox Page Wrapper with SearchParams ─────────────────────
function CentralInboxContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "applications");

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const current = TABS.find((t) => t.key === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "applications": return <ApplicationsTab />;
      case "messages":     return <MessagesTab />;
      default:
        return <GenericInquiriesTab categoryKey={activeTab} title={current?.label || activeTab} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Platform Console</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Central Inbox</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Inbox size={24} className="text-teal-600" />
            <span>Central Communications & Request Hub</span>
          </h1>
          <Badge className="bg-teal-100 text-teal-800 border-none font-bold text-xs">
            10 ফোল্ডার সক্রিয়
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          পাবলিক ওয়েবসাইট থেকে আসা আবেদন, মেসেজ, ডেমো রিকোয়েস্ট, টিকিট ও আপগ্রেড অনুমোদন কেন্দ্র।
        </p>
      </div>

      {/* Tab Folders */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max border-b border-slate-200 pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-bold rounded-t-2xl border border-b-0 transition-all shrink-0 ${
                  isActive
                    ? "bg-white border-slate-200 text-teal-700 shadow-sm -mb-px"
                    : "bg-slate-100/60 border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon size={13} className={isActive ? "text-teal-600" : "text-slate-400"} />
                {tab.label.split(" ").slice(1).join(" ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="bg-slate-50/50 rounded-3xl border border-slate-200 p-5 min-h-[420px]">
        {renderContent()}
      </div>
    </div>
  );
}

export default function CentralInboxPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24 text-slate-400 text-xs">
        <RefreshCw size={20} className="animate-spin text-teal-600 mr-2" />
        ইনবক্স লোড হচ্ছে...
      </div>
    }>
      <CentralInboxContent />
    </Suspense>
  );
}
