"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, MessageSquare, CalendarCheck, LifeBuoy, Lightbulb,
  Bug, TrendingUp, Globe, HardDrive, Handshake,
  Search, RefreshCw, CheckCircle, Clock, XCircle, Eye, Sparkles,
  Inbox, ChevronRight
} from "lucide-react";

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

// ─── Status badge helper ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700 border-amber-300" },
    approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700 border-red-300" },
    read:     { label: "Read",     cls: "bg-slate-100 text-slate-600 border-slate-300" },
    unread:   { label: "Unread",   cls: "bg-blue-100 text-blue-700 border-blue-300" },
    replied:  { label: "Replied",  cls: "bg-teal-100 text-teal-700 border-teal-300" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-slate-100 text-slate-600 border-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Coming Soon placeholder ─────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-slate-400" />
      </div>
      <p className="text-base font-bold text-slate-700">{label}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        এই ফোল্ডারটি শীঘ্রই চালু হবে। Database schema ও API এখনো প্রস্তুত হচ্ছে।
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
        <Clock size={12} /> Coming Soon
      </span>
    </div>
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

// ─── Main Central Inbox Page ─────────────────────────────────────────
export default function CentralInboxPage() {
  const [activeTab, setActiveTab] = useState("applications");

  const current = TABS.find((t) => t.key === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "applications": return <ApplicationsTab />;
      case "messages":     return <MessagesTab />;
      default:             return <ComingSoon label={current?.label || activeTab} />;
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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Inbox size={24} className="text-teal-500" />
          Central Inbox (সেন্ট্রাল ইনবক্স)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          পাবলিক ওয়েবসাইট থেকে আসা সকল আবেদন, মেসেজ, টিকিট ও রিকোয়েস্ট এক জায়গায় পরিচালনা করুন।
        </p>
      </div>

      {/* Tab Folders — Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max border-b border-slate-200 pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-bold rounded-t-xl border border-b-0 transition-all shrink-0 ${
                  isActive
                    ? "bg-white border-slate-200 text-teal-700 shadow-sm -mb-px"
                    : "bg-slate-100/60 border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon size={12} className={isActive ? "text-teal-500" : "text-slate-400"} />
                {tab.label.split(" ").slice(1).join(" ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
}
