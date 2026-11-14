"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Send,
  Phone,
  FileText,
  RotateCcw,
  Check,
  ShieldCheck,
  Bell,
  Plus,
  Utensils,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMosqueDatabase,
  assignMealScheduleToDatabase,
} from "../../services/mosqueStorage";

export function ImamMealRosterModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  onDataUpdated,
}) {
  const [db, setDb] = useState(() => getMosqueDatabase());
  const [activeTab, setActiveTab] = useState("roster"); // "roster" | "assign" | "my-turn" | "transfer-requests"

  // Schedule list from DB
  const [schedule, setSchedule] = useState(() => db.mealRoster || []);

  // Form State for Assigning a New Meal Host (দাবি অনুযায়ী খানা নির্দিষ্ট করার পূর্ণাঙ্গ ফর্ম)
  const [assignForm, setAssignForm] = useState({
    date: "২০২৬-১১-১৬",
    displayDate: "১৬ নভেম্বর ২০২৬",
    dayName: "সোমবার",
    mealType: "দুপুর ও রাত",
    memberId: db.members?.[0]?.id || "M-101",
    family: db.members?.[0]?.name ? `${db.members[0].name}-এর পরিবার` : "মুহাম্মদ আব্দুল্লাহর পরিবার",
    phone: db.members?.[0]?.phone || "০১৭১১-২২৩৩৪৪",
    notes: "নির্ধারিত সময়ে হুজরার দস্তরখানে খাবার পৌঁছে দেওয়া হবে",
  });

  // Transfer Application State
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferTargetMeal, setTransferTargetMeal] = useState(null);
  const [transferReason, setTransferReason] = useState("");
  const [replacementMember, setReplacementMember] = useState("");

  // Transfer Requests List
  const [transferRequests, setTransferRequests] = useState([
    {
      id: "TR-2026-004",
      fromMember: "ডা. আরিফুল ইসলাম",
      toMember: "মো. কামরুল হাসান",
      scheduledDate: "১৭ নভেম্বর ২০২৬",
      reason: "পেশাগত জরুরি ডিউটি ও হাসপাতালে রাত্রিযাপন",
      status: "PENDING",
      createdAt: "১৪ নভেম্বর ২০২৬",
    },
  ]);

  // When selected member changes in assign form, auto-fill family & phone
  const handleMemberSelect = (memberId) => {
    const mem = db.members.find((m) => m.id === memberId);
    if (mem) {
      setAssignForm((prev) => ({
        ...prev,
        memberId: mem.id,
        family: `${mem.name}-এর পরিবার`,
        phone: mem.phone,
      }));
    }
  };

  // Submit New Meal Host Assignment
  const handleAssignMeal = (e) => {
    e.preventDefault();
    if (!assignForm.family.trim() || !assignForm.phone.trim()) {
      toast.error("অনুগ্রহ করে পরিবারের নাম ও ফোন নম্বর লিখুন");
      return;
    }

    const updatedDb = assignMealScheduleToDatabase(assignForm, "সভাপতি");
    setDb(updatedDb);
    setSchedule(updatedDb.mealRoster || []);
    if (onDataUpdated) onDataUpdated(updatedDb);

    toast.success(`${assignForm.displayDate}-এর ইমামের খানা '${assignForm.family}'-এর নামে সফলভাবে নির্দিষ্ট করা হয়েছে!`);
    setActiveTab("roster");
  };

  // Handle Transfer / Swap
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferReason.trim()) {
      toast.error("অনুগ্রহ করে অপারগতার কারণ লিখুন");
      return;
    }

    const newReq = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      fromMember: transferTargetMeal?.family || "সদস্য",
      toMember: replacementMember || "সাধারণ বদলি",
      scheduledDate: transferTargetMeal?.displayDate || "নির্ধারিত তারিখ",
      reason: transferReason,
      status: "PENDING",
      createdAt: "আজকের তারিখ",
    };

    setTransferRequests((prev) => [newReq, ...prev]);
    setShowTransferForm(false);
    setTransferReason("");
    setTransferTargetMeal(null);
    toast.success("খানা অদলবদল (Swap) আবেদন সফলভাবে জমা হয়েছে! ইমাম সাহেব ও বিকল্প ভাইকে জানানো হবে।");
    setActiveTab("transfer-requests");
  };

  // Approve Transfer
  const handleApproveTransfer = (reqId) => {
    setTransferRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "APPROVED" } : r))
    );
    toast.success("খানা অদলবদল আবেদন অনুমোদিত হয়েছে এবং রোস্টারে নতুন ভাইয়ের নাম আপডেট হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-lg">
              🍲
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                ইমাম ও মুয়াজ্জিন সাহেবের খানা রোস্টার ও দায়িত্ব বণ্টন
              </h2>
              <p className="text-[11px] text-emerald-100">
                {mosqueName} · প্রতিদিনের খাবার নির্ধারণ, শিডিউল ও পারস্পরিক বদল
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Tabs Selector */}
        <div className="p-2 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "roster", label: "📅 খানা রোস্টার তালিকা", icon: Calendar },
            { key: "assign", label: "➕ খানা নির্ধারণ করুন", icon: Plus },
            { key: "transfer-requests", label: "🔄 অদলবদল আবেদন", icon: RotateCcw },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer text-[11px] sm:text-xs ${
                  isActive
                    ? "bg-[#0D7A5F] text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40 hover:border-emerald-500"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* TAB 1: ROSTER LIST */}
          {activeTab === "roster" && (
            <div className="space-y-3">
              {/* Quick Status Bar */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#0D7A5F] text-white flex items-center justify-center font-bold text-xs">
                    আজ
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      আজকের মেহমানদারি: {schedule[1]?.family || "হাজী রফিকুল ইসলামের পরিবার"}
                    </h4>
                    <p className="text-[10px] text-stone-500">ফোন: {schedule[1]?.phone || "০১৮১৯-১১২২৩৩"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("assign")}
                  className="px-3 py-1.5 rounded-xl bg-[#0D7A5F] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন তারিখ নির্ধারণ</span>
                </button>
              </div>

              {/* Schedule Cards */}
              <div className="space-y-2">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2 shadow-2xs hover:border-[#0D7A5F] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                          {item.displayDate || item.date}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {item.dayName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.mealType}
                        </span>
                      </div>
                      <span
                        className={`self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "COMPLETED"
                            ? "bg-stone-200 text-stone-700"
                            : item.status === "PENDING_TRANSFER"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.status === "COMPLETED"
                          ? "সম্পন্ন হয়েছে"
                          : item.status === "PENDING_TRANSFER"
                          ? "বদল আবেদন পেন্ডিং"
                          : "নিশ্চিত (Confirmed)"}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-300">
                          {item.family}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{item.phone}</span>
                          {item.notes && <span className="text-stone-400">· {item.notes}</span>}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setAssignForm({
                              date: item.date,
                              displayDate: item.displayDate || item.date,
                              dayName: item.dayName,
                              mealType: item.mealType,
                              memberId: item.memberId || "",
                              family: item.family,
                              phone: item.phone,
                              notes: item.notes || "",
                            });
                            setActiveTab("assign");
                          }}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="এই তারিখের দায়িত্ব পরিবর্তন"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>পরিবর্তন</span>
                        </button>
                        <button
                          onClick={() => {
                            setTransferTargetMeal(item);
                            setShowTransferForm(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="আজকে অপারগ হলে অন্য ভাইয়ের সাথে বদল করুন"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>বদল আবেদন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGN MEAL SCHEDULE (নতুন খানা সিডিউল নির্ধারণ করার পূর্ণাঙ্গ ফর্ম) */}
          {activeTab === "assign" && (
            <form onSubmit={handleAssignMeal} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#0D7A5F] shrink-0" />
                <span className="text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                  যেকোনো নির্দিষ্ট তারিখে ইমাম সাহেবকে খাবার দেওয়ার জন্য মুসল্লি বা পরিবারের নাম নির্ধারণ করুন।
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    খাবার প্রদানের তারিখ *
                  </label>
                  <input
                    type="date"
                    value={assignForm.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAssignForm({
                        ...assignForm,
                        date: val,
                        displayDate: `${val.split("-")[2]} নভেম্বর ২০২৬`,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#0D7A5F]"
                    required
                  />
                </div>

                {/* Day Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    দিনের নাম *
                  </label>
                  <select
                    value={assignForm.dayName}
                    onChange={(e) => setAssignForm({ ...assignForm, dayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                  >
                    <option value="শনিবার">শনিবার</option>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                    <option value="শুক্রবার (জুমাবার)">শুক্রবার (জুমাবার)</option>
                  </select>
                </div>

                {/* Meal Type */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    কোন বেলার খানা? *
                  </label>
                  <select
                    value={assignForm.mealType}
                    onChange={(e) => setAssignForm({ ...assignForm, mealType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                  >
                    <option value="দুপুর ও রাত">দুপুর ও রাত (সারা দিন)</option>
                    <option value="শুধু দুপুরের খাবার">শুধু দুপুরের খাবার</option>
                    <option value="শুধু রাতের খাবার">শুধু রাতের খাবার</option>
                    <option value="সকালের নাস্তা">সকালের নাস্তা</option>
                  </select>
                </div>

                {/* Registered Member Quick Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    নিবন্ধিত সদস্য থেকে নির্বাচন (ঐচ্ছিক)
                  </label>
                  <select
                    value={assignForm.memberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:border-[#0D7A5F]"
                  >
                    <option value="">-- সদস্য তালিকা হতে নির্বাচন করুন --</option>
                    {(db.members || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone}) - {m.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Family / Host Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    পরিবারের নাম / দায়িত্বশীল ব্যক্তি *
                  </label>
                  <input
                    type="text"
                    value={assignForm.family}
                    onChange={(e) => setAssignForm({ ...assignForm, family: e.target.value })}
                    placeholder="উদা: হাজী মুহাম্মদ আব্দুল্লাহর পরিবার"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    যোগাযোগের মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    value={assignForm.phone}
                    onChange={(e) => setAssignForm({ ...assignForm, phone: e.target.value })}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono focus:border-[#0D7A5F]"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    বিশেষ নির্দেশনা বা বিবরণ
                  </label>
                  <input
                    type="text"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="হুজরায় পৌঁছে দেওয়া হবে বা বিশেষ কোনো ব্যবস্থা..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:border-[#0D7A5F]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("roster")}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0D7A5F] hover:bg-[#074f3d] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সিডিউলে অন্তর্ভুক্ত ও নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRANSFER REQUESTS (অদলবদল আবেদন) */}
          {activeTab === "transfer-requests" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  খানা অদলবদল (Swap) আবেদনসমূহ
                </span>
                <span className="text-[10px] text-stone-400">
                  {transferRequests.length}টি আবেদন
                </span>
              </div>

              {transferRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">
                        {req.fromMember} ➔ {req.toMember}
                      </h4>
                      <p className="text-[11px] text-stone-500">তারিখ: <b>{req.scheduledDate}</b></p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {req.status === "APPROVED" ? "অনুমোদিত" : "অপেক্ষমান (Pending)"}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#07130e] p-2 rounded-xl">
                    <b>কারণ:</b> {req.reason}
                  </p>

                  {req.status === "PENDING" && (
                    <div className="flex justify-end gap-2 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <button
                        onClick={() => handleApproveTransfer(req.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>বদল অনুমোদন করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-200 font-bold text-xs cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* SWAP APPLICATION MODAL */}
      {showTransferForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1612] text-stone-900 dark:text-stone-100 rounded-3xl p-5 shadow-2xl space-y-3.5 border border-emerald-400">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-emerald-900/60">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <RotateCcw className="w-4 h-4" />
                <span>ইমামের খানা দায়িত্ব অদলবদল আবেদন</span>
              </h3>
              <button
                onClick={() => setShowTransferForm(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs">
              নির্ধারিত তারিখ: <b>{transferTargetMeal?.displayDate}</b>
              <br />
              পরিবার: <b>{transferTargetMeal?.family}</b>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  অপারগতার কারণ (কেন দিতে পারছেন না?) *
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="যেমন: জরুরি পারিবারিক সফর, অসুস্থতা, বা কর্মব্যস্ততা..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:border-[#0D7A5F]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  বিকল্প কোনো ভাইয়ের কাছে হস্তান্তর করতে চাইলে নির্বাচন করুন
                </label>
                <select
                  value={replacementMember}
                  onChange={(e) => setReplacementMember(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                >
                  <option value="">উন্মুক্ত (যে কোনো ভাই গ্রহণ করতে পারবেন)</option>
                  {(db.members || []).map((m) => (
                    <option key={m.id} value={`${m.name} (${m.phone})`}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D7A5F] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
