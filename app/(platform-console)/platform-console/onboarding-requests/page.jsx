"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Building2, CheckCircle2, ShieldAlert, Globe, MapPin, Search, Edit3, 
  ExternalLink, CheckCircle, Clock, Trash2, Eye, Sparkles, Save, X
} from "lucide-react";

export default function OnboardingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected request for customization
  const [editingItem, setEditingItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/onboarding-requests");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch("/api/admin/onboarding-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const json = await res.json();
      if (json.ok) {
        setToastMsg("✅ " + json.message);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomization = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/onboarding-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          action: "update",
          customData: editingItem,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setToastMsg("✨ কাস্টমাইজেশন সংরক্ষিত হয়েছে!");
        setEditingItem(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = (r.name_bn || r.name_en || r.slug || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending") return matchesSearch && (r.approval_status === "pending_approval" || !r.approval_status);
    if (filterStatus === "approved") return matchesSearch && r.approval_status === "approved";
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>EduSaaS ওয়েবসাইট এপ্রুভাল প্যানেল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            অনলাইন তথ্য ফরম রিকোয়েস্টসমূহ (Onboarding Requests)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ল্যান্ডিং পেজ থেকে ইউজারদের জমা দেওয়া তথ্য রিভিও করুন, এপ্রুভ করে লাইভ করুন অথবা কাস্টমাইজ করুন।
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-800 text-xs font-bold flex justify-between items-center">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-slate-500 hover:text-slate-800 font-black">✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="প্রতিষ্ঠানের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { key: "all", label: "সকল রিকোয়েস্ট" },
            { key: "pending", label: "পেন্ডিং (রিভিউ প্রয়োজন)" },
            { key: "approved", label: "লাইভ / এপ্রুভড" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filterStatus === tab.key
                  ? "bg-[#052E2B] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">লোড হচ্ছে...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">কোনো তথ্য পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">ল্যান্ডিং পেজ থেকে ইউজাররা তথ্য ফরম পূরণ করলে এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((item) => {
            const isApproved = item.approval_status === "approved";
            const meta = item.metadata || {};
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {isApproved ? "✓ লাইভ (Approved)" : "⏳ পেন্ডিং (Pending)"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.created_at || Date.now()).toLocaleDateString("bn-BD")}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1">{item.name_bn || item.name_en}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {item.address || "বাংলাদেশ"}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 mb-4 font-medium">
                    <p className="text-slate-700">👤 <strong>আবেদনকারী:</strong> {meta.submitterName || "নির্ধারিত নয়"}</p>
                    <p className="text-slate-700">📞 <strong>মোবাইল:</strong> {meta.submitterPhone || "01576600265"}</p>
                    {item.map_link && (
                      <p className="text-emerald-700 truncate">🗺️ <strong>ম্যাপ লিঙ্ক:</strong> <a href={item.map_link} target="_blank" rel="noopener noreferrer" className="underline">গুগল ম্যাপ দেখুন</a></p>
                    )}
                    {meta.seoTitle && (
                      <p className="text-slate-500 truncate">🔍 <strong>SEO Title:</strong> {meta.seoTitle}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  {!isApproved && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs hover:opacity-90 shadow-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>এপ্রুভ ও লাইভ করুন</span>
                    </button>
                  )}
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                    <span>কাস্টমাইজ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customization Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-serif">প্রতিষ্ঠানের তথ্য কাস্টমাইজ করুন</h3>
                <p className="text-xs text-slate-500">ম্যাপ লিঙ্ক, ইতিহাস, SEO ডেসক্রিপশন বা যেকোনো তথ্য সম্পাদনা করুন।</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={editingItem.name_bn || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name_bn: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={editingItem.address || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">গুগল ম্যাপস লিঙ্ক (Google Maps Link)</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={editingItem.map_link || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, map_link: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ছবি / লোগো URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingItem.photo_url || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, photo_url: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-mono text-slate-600"
                />
              </div>

              <div className="pt-2 border-t font-bold text-slate-800">🔍 SEO সংক্রান্ত কাস্টমাইজেশন:</div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={editingItem.metadata?.seoTitle || ""}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    metadata: { ...(editingItem.metadata || {}), seoTitle: e.target.value }
                  })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">SEO Description</label>
                <textarea
                  rows={2}
                  value={editingItem.metadata?.seoDescription || ""}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    metadata: { ...(editingItem.metadata || {}), seoDescription: e.target.value }
                  })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button onClick={handleSaveCustomization} disabled={isUpdating} className="flex-1 bg-emerald-700 hover:bg-emerald-800">
                  <Save className="h-4 w-4 mr-2" /> {isUpdating ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  বাতিল করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
