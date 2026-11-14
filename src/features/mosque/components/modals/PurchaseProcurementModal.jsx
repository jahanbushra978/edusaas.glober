"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Printer,
  ShoppingBag,
  Coins,
  ShieldCheck,
  Building,
  User,
  Phone,
  Paperclip,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export function PurchaseProcurementModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  currentUserName = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)",
}) {
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "new-application" | "vouchers"
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

  // Master Procurement Requests
  const [requests, setRequests] = useState([
    {
      id: "REQ-2026-012",
      voucherNo: "VCH-2026-089",
      item: "উচ্চ ক্ষমতার সিলিং ফ্যান (জিএফসি / বিআরবি)",
      quantity: "২টি",
      estimatedAmount: 8000,
      finalAmount: 8200,
      category: "বৈদ্যুতিক ও মেরামত",
      priority: "জরুরি",
      reason: "দক্ষিণ পাশের কাতারে ফ্যান অকেজো থাকায় মুসল্লিদের কষ্ট হচ্ছে।",
      fund: "সাধারণ পরিচালন ফান্ড",
      vendor: "মেসার্স বিসমিল্লাহ ইলেকট্রিক",
      vendorPhone: "০১৭২২-৩৩৪৪৫৫",
      invoiceNo: "INV-88902",
      requester: "মাওলানা মাহমুদ হাসান (ইমাম)",
      requesterPhone: "০১৯১১-৪৪৫৫৬৬",
      approver: "হাজী মুহাম্মদ আব্দুল্লাহ (সভাপতি)",
      treasurer: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      receiver: "মো. হাফিজুর রহমান (খাদেম)",
      date: "১৪ নভেম্বর ২০২৬",
      status: "APPROVED_READY_TO_BUY", // "SUBMITTED" | "APPROVED_READY_TO_BUY" | "PROOF_SUBMITTED" | "VOUCHER_POSTED" | "REJECTED"
      stage: 3,
    },
    {
      id: "REQ-2026-011",
      voucherNo: "VCH-2026-088",
      item: "মসজিদ অজুখানা পরিষ্কারের ফ্লোর ক্লিনার ও ব্রাশ",
      quantity: "১ সেট",
      estimatedAmount: 3200,
      finalAmount: 3200,
      category: "পরিচ্ছন্নতা সামগ্রী",
      priority: "সাধারণ",
      reason: "মাসিক অজুখানা ও ওয়াশরুম ডিপ ক্লিনিং সামগ্রী।",
      fund: "সাধারণ পরিচালন ফান্ড",
      vendor: "সততা ডিপার্টমেন্টাল স্টোর",
      vendorPhone: "০১৮১৯-৮৮৭৭৬৬",
      invoiceNo: "CASH-4512",
      requester: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      requesterPhone: "০১৭২১-৯৯৮৮৭৭",
      approver: "হাজী মুহাম্মদ আব্দুল্লাহ (সভাপতি)",
      treasurer: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      receiver: "মো. হাফিজুর রহমান (খাদেম)",
      date: "০৮ নভেম্বর ২০২৬",
      status: "VOUCHER_POSTED",
      stage: 6,
    },
    {
      id: "REQ-2026-010",
      voucherNo: "VCH-2026-087",
      item: "দ্বিতীয় তলার ছাদ ঢালাইয়ের জন্য ৬০ গ্রেড রড ও সিমেন্ট",
      quantity: "১ টন রড + ৫০ ব্যাগ সিমেন্ট",
      estimatedAmount: 45000,
      finalAmount: 45000,
      category: "উন্নয়ন ও নির্মাণ",
      priority: "সর্বোচ্চ অগ্রাধিকার",
      reason: "মসজিদ সম্প্রসারণ কাজের নির্ধারিত ছাদ ঢালাই।",
      fund: "নির্মাণ ও সংস্কার ফান্ড",
      vendor: "মেসার্স রহমান স্টিল অ্যান্ড ট্রেডার্স",
      vendorPhone: "০১৬১১-৯৯০০১১",
      invoiceNo: "CH-9876345",
      requester: "ইঞ্জি. মোস্তাফিজুর রহমান (উপদেষ্টা)",
      requesterPhone: "০১৭৩৩-১১২২৪৪",
      approver: "কমিটি রেজুলেশন নং #০৭",
      treasurer: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
      receiver: "নির্মাণ উপ-কমিটি",
      date: "০৩ নভেম্বর ২০২৬",
      status: "VOUCHER_POSTED",
      stage: 6,
    },
  ]);

  // New Application Form State (Step 1)
  const [newItemName, setNewItemName] = useState("");
  const [newQuantity, setNewQuantity] = useState("১টি");
  const [newEstimatedPrice, setNewEstimatedPrice] = useState("");
  const [newCategory, setNewCategory] = useState("মেরামত ও সাউন্ড");
  const [newPriority, setNewPriority] = useState("সাধারণ");
  const [newReason, setNewReason] = useState("");
  const [newFund, setNewFund] = useState("সাধারণ পরিচালন ফান্ড");

  // Step 4 Proof Submission Modal
  const [proofModalTarget, setProofModalTarget] = useState(null);
  const [proofVendor, setProofVendor] = useState("");
  const [proofVendorPhone, setProofVendorPhone] = useState("");
  const [proofInvoiceNo, setProofInvoiceNo] = useState("");
  const [proofFinalAmount, setProofFinalAmount] = useState("");

  // Handle Step 1 Submission
  const handleCreateApplication = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newEstimatedPrice) {
      toast.error("মালামালের নাম ও আনুমানিক মূল্য দিন");
      return;
    }
    const newReq = {
      id: `REQ-2026-0${12 + requests.length + 1}`,
      voucherNo: `VCH-2026-0${90 + requests.length + 1}`,
      item: newItemName.trim(),
      quantity: newQuantity.trim() || "১টি",
      estimatedAmount: Number(newEstimatedPrice) || 0,
      finalAmount: Number(newEstimatedPrice) || 0,
      category: newCategory,
      priority: newPriority,
      reason: newReason.trim() || "মসজিদের প্রয়োজনে ক্রয় আবেদন।",
      fund: newFund,
      vendor: "যাচাই প্রক্রিয়াধীন",
      vendorPhone: "-",
      invoiceNo: "-",
      requester: currentUserName,
      requesterPhone: "০১৭১১-২২৩৩৪৪",
      approver: "অনুমোদনের অপেক্ষায়",
      treasurer: "কোষাধ্যক্ষ",
      receiver: "স্টোর কিপার",
      date: "আজকের তারিখ",
      status: "SUBMITTED",
      stage: 1,
    };

    setRequests([newReq, ...requests]);
    setActiveTab("requests");
    setNewItemName("");
    setNewEstimatedPrice("");
    setNewReason("");
    toast.success("ক্রয়ের আবেদন সফলভাবে দাখিল করা হয়েছে! অনুমোদনের জন্য কমিটিকে পাঠানো হয়েছে।");
  };

  // Step 2 Approval Handler
  const handleApproveRequest = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "APPROVED_READY_TO_BUY",
              stage: 3,
              approver: currentUserName,
            }
          : r
      )
    );
    toast.success("ক্রয় আবেদনটি অনুমোদিত হয়েছে! এখন মালামাল ক্রয় করার অনুমতি দেওয়া হলো।");
  };

  // Step 4 & 5 Proof submission & Voucher generation
  const handleOpenProofModal = (req) => {
    setProofModalTarget(req);
    setProofVendor(req.vendor !== "যাচাই প্রক্রিয়াধীন" ? req.vendor : "");
    setProofVendorPhone(req.vendorPhone !== "-" ? req.vendorPhone : "");
    setProofInvoiceNo(req.invoiceNo !== "-" ? req.invoiceNo : "");
    setProofFinalAmount(String(req.finalAmount || req.estimatedAmount));
  };

  const handleSaveProofAndGenerateVoucher = (e) => {
    e.preventDefault();
    if (!proofVendor.trim() || !proofFinalAmount) {
      toast.error("দোকান/ভেন্ডরের নাম ও চূড়ান্ত বিলের অঙ্ক দিন");
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === proofModalTarget.id
          ? {
              ...r,
              vendor: proofVendor.trim(),
              vendorPhone: proofVendorPhone.trim() || "প্রযোজ্য নয়",
              invoiceNo: proofInvoiceNo.trim() || `BILL-${Date.now().toString().slice(-4)}`,
              finalAmount: Number(proofFinalAmount),
              status: "VOUCHER_POSTED",
              stage: 6,
            }
          : r
      )
    );

    const updated = {
      ...proofModalTarget,
      vendor: proofVendor.trim(),
      vendorPhone: proofVendorPhone.trim() || "প্রযোজ্য নয়",
      invoiceNo: proofInvoiceNo.trim() || `BILL-${Date.now().toString().slice(-4)}`,
      finalAmount: Number(proofFinalAmount),
      status: "VOUCHER_POSTED",
      stage: 6,
    };

    setProofModalTarget(null);
    setSelectedVoucherForPrint(updated);
    toast.success("ভাউচার চূড়ান্তভাবে সংরক্ষিত ও সংশ্লিষ্ট ফান্ড থেকে টাকা কর্তন করা হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🧾
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদের কেনাকাটা ও ভাউচার অনুমোদন সিস্টেম
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · আবেদন ➔ অনুমোদন ➔ ক্রয় ➔ রসিদ প্রমাণ ➔ স্বাক্ষরিত ভাউচার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Workflow Banner (Section 8) */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center justify-between min-w-[500px] text-[10px] font-bold text-stone-500">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">১</span>
              <span>ক্রয় আবেদন</span>
            </div>
            <span>➔</span>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">২</span>
              <span>কমিটি অনুমোদন</span>
            </div>
            <span>➔</span>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">৩</span>
              <span>মালামাল ক্রয়</span>
            </div>
            <span>➔</span>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">৪</span>
              <span>রসিদ আপলোড</span>
            </div>
            <span>➔</span>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">৫</span>
              <span>অফিসিয়াল ভাউচার</span>
            </div>
            <span>➔</span>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">৬</span>
              <span>ফান্ড কর্তন</span>
            </div>
          </div>
        </div>

        {/* 3 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "requests", label: `📋 ক্রয়ের আবেদন ও অনুমোদন (${requests.length})` },
            { key: "new-application", label: "+ নতুন ক্রয় আবেদন (Step 1)" },
            { key: "vouchers", label: `🖨️ স্বাক্ষরিত অফিসিয়াল ভাউচার (${requests.filter((r) => r.status === "VOUCHER_POSTED").length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40 hover:border-emerald-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {/* TAB 1: REQUESTS & APPROVAL PIPELINE */}
          {activeTab === "requests" && (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-500">{r.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 font-semibold text-[10px]">
                        {r.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-[9px]">
                        {r.priority}
                      </span>
                    </div>

                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        r.status === "SUBMITTED"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "APPROVED_READY_TO_BUY"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {r.status === "SUBMITTED"
                        ? "অনুমোদনের অপেক্ষায় (ধাপ ২)"
                        : r.status === "APPROVED_READY_TO_BUY"
                        ? "অনুমোদিত — ক্রয়ের অপেক্ষায় (ধাপ ৩)"
                        : "ভাউচার সম্পূর্ণ ও কর্তনকৃত (ধাপ ৬)"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <div>
                      <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                        {r.item} (পরিমাণ: {r.quantity})
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        কারণ: <i>"{r.reason}"</i>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                        ৳{(r.finalAmount || r.estimatedAmount).toLocaleString("bn-BD")}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {r.status === "VOUCHER_POSTED" ? "চূড়ান্ত বিল" : "আনুমানিক প্রাক্কলন"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-stone-100 dark:border-emerald-950/60 text-stone-500">
                    <div>আবেদনকারী: <b>{r.requester}</b></div>
                    <div>তহবিল: <b className="text-stone-700 dark:text-stone-300">{r.fund}</b></div>
                    <div>ভেন্ডর/দোকান: <b>{r.vendor}</b></div>
                    <div>মেমো নং: <b className="font-mono">{r.invoiceNo}</b></div>
                  </div>

                  {/* Actions based on step */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                    {r.status === "SUBMITTED" && (
                      <button
                        onClick={() => handleApproveRequest(r.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        কমিটি অনুমোদন প্রদান করুন (Step 2)
                      </button>
                    )}

                    {r.status === "APPROVED_READY_TO_BUY" && (
                      <button
                        onClick={() => handleOpenProofModal(r)}
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>ক্রয় সম্পন্ন — বিলের প্রমাণ ও ভাউচার জমা দিন (Step 4 & 5)</span>
                      </button>
                    )}

                    {r.status === "VOUCHER_POSTED" && (
                      <button
                        onClick={() => setSelectedVoucherForPrint(r)}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-emerald-300 dark:border-emerald-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>৪টি স্বাক্ষরযুক্ত অফিসিয়াল ভাউচার প্রিন্ট করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: STEP 1 PURCHASE APPLICATION FORM */}
          {activeTab === "new-application" && (
            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-3">
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  ধাপ ১: নতুন মালামাল ক্রয়ের প্রাক্কলন আবেদন দাখিল
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  মসজিদের তহবিলের যেকোনো কেনাকাটার পূর্বে আবেদন ও কমিটি অনুমোদন বাধ্যতামূলক।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      মালামালের বিবরণ / নাম:
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ২টি নতুন সিলিং ফ্যান / মাইকের কর্ড"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      প্রয়োজনীয় পরিমাণ:
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ২টি / ৫ মিটার / ১ টন"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      আনুমানিক সম্ভাব্য মূল্য (৳):
                    </label>
                    <input
                      type="number"
                      placeholder="যেমন: 8000"
                      value={newEstimatedPrice}
                      onChange={(e) => setNewEstimatedPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ব্যয়ের খাত / ফান্ড নির্বাচন:
                    </label>
                    <select
                      value={newFund}
                      onChange={(e) => setNewFund(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                    >
                      <option value="সাধারণ পরিচালন ফান্ড">সাধারণ পরিচালন ফান্ড</option>
                      <option value="নির্মাণ ও সংস্কার ফান্ড">নির্মাণ ও সংস্কার ফান্ড</option>
                      <option value="মক্তব ও শিক্ষা ফান্ড">মক্তব ও শিক্ষা ফান্ড</option>
                      <option value="জরুরি দুর্যোগ ও সমাজকল্যাণ">জরুরি দুর্যোগ ও সমাজকল্যাণ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ক্রয়ের সুনির্দিষ্ট কারণ ও আবশ্যকতা:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="কেন কেনা প্রয়োজন বিস্তারিত লিখুন..."
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    আবেদন দাখিল করুন ➔
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SIGNED VOUCHERS LIST */}
          {activeTab === "vouchers" && (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-stone-500 mb-1">
                <span>সম্পূর্ণ অনুমোদিত ও ক্যাশ বুকে নথিভুক্ত ভাউচারসমূহ:</span>
                <span>অফিসিয়াল কপি</span>
              </div>

              {requests
                .filter((r) => r.status === "VOUCHER_POSTED")
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="font-mono text-emerald-700 dark:text-emerald-400">{r.voucherNo}</b>
                        <span className="text-stone-400">·</span>
                        <h5 className="font-bold text-stone-900 dark:text-stone-100">{r.item}</h5>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        ভেন্ডর: {r.vendor} (মেমো নং: {r.invoiceNo}) · তারিখ: {r.date}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-2 shrink-0">
                      <div>
                        <div className="font-black font-mono text-stone-900 dark:text-stone-100">
                          ৳{r.finalAmount.toLocaleString("bn-BD")}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">পরিশোধিত ও কর্তনকৃত</span>
                      </div>
                      <button
                        onClick={() => setSelectedVoucherForPrint(r)}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                        title="ভাউচার ভিউ"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* STEP 4 & 5: PROOF SUBMISSION MODAL */}
      {proofModalTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80">
          <form
            onSubmit={handleSaveProofAndGenerateVoucher}
            className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-400 rounded-3xl p-5 shadow-2xl space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-emerald-800">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                ধাপ ৪ ও ৫: ক্রয়ের রসিদ প্রমাণ ও ভাউচার চূড়ান্তকরণ
              </h3>
              <button
                type="button"
                onClick={() => setProofModalTarget(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-500">
              মালামাল: <b>{proofModalTarget.item}</b> (অনুমোদিত প্রাক্কলন: ৳{proofModalTarget.estimatedAmount})
            </p>

            <div className="space-y-2">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  দোকান / সরবরাহকারী প্রতিষ্ঠানের নাম:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মেসার্স বিসমিল্লাহ ইলেকট্রিক"
                  value={proofVendor}
                  onChange={(e) => setProofVendor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    দোকানের ফোন নম্বর:
                  </label>
                  <input
                    type="text"
                    placeholder="০১৭১১-XXXXXX"
                    value={proofVendorPhone}
                    onChange={(e) => setProofVendorPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    দোকানের ক্যাশ মেমো / বিল নং:
                  </label>
                  <input
                    type="text"
                    placeholder="INV-88902"
                    value={proofInvoiceNo}
                    onChange={(e) => setProofInvoiceNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  প্রকৃত চূড়ান্ত বিলের পরিমাণ (৳):
                </label>
                <input
                  type="number"
                  value={proofFinalAmount}
                  onChange={(e) => setProofFinalAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] font-mono font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-emerald-800">
              <button
                type="button"
                onClick={() => setProofModalTarget(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                ভাউচার চূড়ান্ত ও কর্তন করুন ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 5: OFFICIAL PRINTABLE PURCHASE VOUCHER (Section 8.5 with 4 Signature Areas) */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white text-stone-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-emerald-400 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-stone-800">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                {mosqueName}
              </span>
              <h2 className="text-lg font-black text-stone-900">
                অফিসিয়াল ক্রয় ব্যয় ও অর্থ পরিশোধ ভাউচার
              </h2>
              <p className="text-[11px] text-stone-500 font-mono">
                ভাউচার নং: <b>{selectedVoucherForPrint.voucherNo}</b> · আবেদন আইডি: <b>{selectedVoucherForPrint.id}</b>
              </p>
            </div>

            {/* Voucher Details Table */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-500">ক্রয়কৃত মালামাল:</span>
                  <div className="font-bold text-stone-900">{selectedVoucherForPrint.item}</div>
                </div>
                <div>
                  <span className="text-stone-500">পরিমাণ:</span>
                  <div className="font-bold text-stone-900">{selectedVoucherForPrint.quantity}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-500">দোকান / সরবরাহকারী:</span>
                  <div className="font-bold text-stone-900">{selectedVoucherForPrint.vendor}</div>
                  <div className="text-[10px] text-stone-500">ফোন: {selectedVoucherForPrint.vendorPhone}</div>
                </div>
                <div>
                  <span className="text-stone-500">ক্যাশ মেমো / ইনভয়েস নং:</span>
                  <div className="font-mono font-bold text-stone-900">{selectedVoucherForPrint.invoiceNo}</div>
                  <div className="text-[10px] text-stone-500">তারিখ: {selectedVoucherForPrint.date}</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-baseline">
                <div>
                  <span className="text-emerald-800 font-bold">ব্যয়ের ফান্ড:</span>
                  <div className="text-stone-800 font-semibold">{selectedVoucherForPrint.fund}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">পরিশোধিত চূড়ান্ত অঙ্ক:</span>
                  <div className="text-xl font-black font-mono text-emerald-800">
                    ৳{selectedVoucherForPrint.finalAmount.toLocaleString("bn-BD")}
                  </div>
                </div>
              </div>
            </div>

            {/* MANDATORY 4 SIGNATURE AREAS (Section 8.5) */}
            <div className="pt-4 border-t border-dashed border-stone-300">
              <div className="text-[10px] font-bold text-stone-500 text-center mb-6">
                স্বাক্ষর ও সত্যায়ন পরিষদ (৪টি বাধ্যতামূলক অডিট স্বাক্ষর)
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="space-y-1">
                  <div className="h-10 border-b border-stone-400 flex items-end justify-center font-cursive text-emerald-800 font-bold pb-1 text-[11px]">
                    {selectedVoucherForPrint.requester.split(" ")[0]}
                  </div>
                  <b className="block text-stone-800">১. আবেদনকারী</b>
                  <span className="text-stone-400 text-[9px] block truncate">{selectedVoucherForPrint.requester}</span>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-stone-400 flex items-end justify-center font-cursive text-emerald-800 font-bold pb-1 text-[11px]">
                    {selectedVoucherForPrint.receiver.split(" ")[0]}
                  </div>
                  <b className="block text-stone-800">২. মালামাল গ্রহণকারী</b>
                  <span className="text-stone-400 text-[9px] block truncate">{selectedVoucherForPrint.receiver}</span>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-stone-400 flex items-end justify-center font-cursive text-emerald-800 font-bold pb-1 text-[11px]">
                    {selectedVoucherForPrint.treasurer.split(" ")[0]}
                  </div>
                  <b className="block text-stone-800">৩. কোষাধ্যক্ষ</b>
                  <span className="text-stone-400 text-[9px] block truncate">{selectedVoucherForPrint.treasurer}</span>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-stone-400 flex items-end justify-center font-cursive text-emerald-800 font-bold pb-1 text-[11px]">
                    {selectedVoucherForPrint.approver.split(" ")[0]}
                  </div>
                  <b className="block text-stone-800">৪. সভাপতি / অনুমোদন</b>
                  <span className="text-stone-400 text-[9px] block truncate">{selectedVoucherForPrint.approver}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => {
                  window.print();
                  toast.success("ভাউচার প্রিন্টার কমান্ড পাঠানো হয়েছে");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>ভাউচার প্রিন্ট / PDF সংরক্ষণ</span>
              </button>
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
