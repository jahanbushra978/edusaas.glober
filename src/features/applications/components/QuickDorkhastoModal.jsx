"use client";
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Printer, FileText,
  PencilLine, X, ShieldCheck
} from "lucide-react";
import {
  COMMON_DORKHASTO_SUBJECTS,
  generateMadrasahDorkhastoHTML,
  printMadrasahApplicationDirect
} from "../utils/printMadrasahDorkhasto";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";

export default function QuickDorkhastoModal({
  open,
  onOpenChange,
  defaultApplicant = null,
  initialSubject = "leave",
}) {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState(initialSubject);
  const [customSubject, setCustomSubject] = useState("");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applicantName, setApplicantName] = useState(defaultApplicant?.name || defaultApplicant?.full_name_bn || defaultApplicant?.full_name_en || "");
  const [rollNo, setRollNo] = useState(defaultApplicant?.roll_number || "");
  const [className, setClassName] = useState(defaultApplicant?.class_name || defaultApplicant?.batch || "");
  const [mobileNo, setMobileNo] = useState(defaultApplicant?.contact_number || defaultApplicant?.phone || "");
  const [guardianPhone, setGuardianPhone] = useState(defaultApplicant?.guardian_phone || defaultApplicant?.emergency_contact || "");
  const [branchId, setBranchId] = useState(defaultApplicant?.branch_id ? String(defaultApplicant.branch_id) : "1");
  const [mode, setMode] = useState("filled"); // "filled" | "blank"

  // Settings and branches
  const { data: settings = {} } = useQuery({
    queryKey: ["quick-dorkhasto-settings"],
    queryFn: async () => {
      const list = await appClient.entities.AppSettings.listAll().catch(() => []);
      return list[0] || {};
    },
    staleTime: 300000,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["quick-dorkhasto-branches"],
    queryFn: () => appClient.entities.Branch.listAll().catch(() => []),
    staleTime: 300000,
  });

  const selectedBranch = useMemo(() => {
    return branches.find(b => String(b.id) === String(branchId)) || branches[0] || null;
  }, [branches, branchId]);

  // Construct application object for preview & print
  const resolvedSubject = useMemo(() => {
    if (selectedSubjectKey === "custom" && customSubject.trim()) {
      return customSubject.trim();
    }
    const matched = COMMON_DORKHASTO_SUBJECTS.find(s => s.value === selectedSubjectKey);
    return matched ? matched.label : "বিশেষ দরখাস্ত";
  }, [selectedSubjectKey, customSubject]);

  const applicationData = useMemo(() => {
    return {
      application_number: `RI-APP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      type: selectedSubjectKey,
      subject: resolvedSubject,
      custom_subject: resolvedSubject,
      reason: mode === "blank" ? "" : reason,
      from_date: mode === "blank" ? "" : fromDate,
      to_date: mode === "blank" ? "" : toDate,
      days_count: fromDate && toDate ? Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1) : 0,
      applicant_name: applicantName || (defaultApplicant?.name || defaultApplicant?.full_name_bn || ""),
      applicant_type: defaultApplicant?.type || "student",
      roll_number: rollNo,
      class_name: className,
      mobile_number: mobileNo,
      guardian_phone: guardianPhone,
      status: "draft",
    };
  }, [selectedSubjectKey, resolvedSubject, reason, fromDate, toDate, applicantName, defaultApplicant, rollNo, className, mobileNo, guardianPhone, mode]);

  const liveHTML = useMemo(() => {
    return generateMadrasahDorkhastoHTML({
      application: applicationData,
      settings,
      branch: selectedBranch,
      applicantDetails: {
        id: defaultApplicant?.id || "",
        full_name_bn: applicantName,
        roll_number: rollNo,
        class_name: className,
        contact_number: mobileNo,
        guardian_phone: guardianPhone,
      },
      isBlankMode: mode === "blank",
    });
  }, [applicationData, settings, selectedBranch, defaultApplicant, applicantName, rollNo, className, mobileNo, guardianPhone, mode]);

  const handlePrint = (isBlank = false) => {
    printMadrasahApplicationDirect({
      application: applicationData,
      settings,
      branch: selectedBranch,
      applicantDetails: {
        id: defaultApplicant?.id || "",
        full_name_bn: applicantName,
        roll_number: rollNo,
        class_name: className,
        contact_number: mobileNo,
        guardian_phone: guardianPhone,
      },
      isBlankMode: isBlank || mode === "blank",
    });
  };

  const handleApplyPresetReason = (text) => {
    setReason(text);
    setMode("filled");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                মাদরাসা দ্রুত দরখাস্ত জেনারেটর (Quick Dorkhasto Generator)
              </DialogTitle>
              <p className="text-xs text-slate-400">
                শুধু বিষয় ও প্রয়োজন লিখুন — সম্পূর্ণ প্রমিত মাদরাসা দরখাস্ত স্বয়ংক্রিয়ভাবে তৈরি হবে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePrint(false)}
              className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs font-bold gap-2 px-4 h-9 rounded-xl shadow-lg shadow-emerald-950/30"
            >
              <Printer className="h-4 w-4" />
              দরখাস্ত প্রিন্ট করুন
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
          
          {/* Left Form Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 border-r border-slate-800 bg-slate-900/50">
            
            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setMode("filled")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === "filled"
                    ? "bg-[#004D3A] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ✍️ অনলাইনে পূরণকৃত
              </button>
              <button
                type="button"
                onClick={() => setMode("blank")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === "blank"
                    ? "bg-[#004D3A] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📄 হাতে লেখার ফাঁকা ফরম
              </button>
            </div>

            {/* 1. Subject Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-emerald-400 block">
                ১. দরখাস্তের বিষয় (Select Subject) *
              </Label>
              <Select value={selectedSubjectKey} onValueChange={setSelectedSubjectKey}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  {COMMON_DORKHASTO_SUBJECTS.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-xs sm:text-sm focus:bg-emerald-900">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Subject Input if Selected */}
            {selectedSubjectKey === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-amber-400 block">
                  কাস্টম বিষয়ের নাম লিখুন *
                </Label>
                <Input
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="যেমন: বৃত্তি আবেদন, পরীক্ষার ফল পুনঃমূল্যায়ন..."
                  className="bg-slate-800 border-slate-700 text-slate-100 h-10 text-xs"
                />
              </div>
            )}

            {/* 2. Reason / Need (Dynamic input) */}
            {mode === "filled" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-emerald-400">
                    ২. আপনার মূল প্রয়োজন / কারণ (Your Need) *
                  </Label>
                  <span className="text-[10px] text-slate-400">দরখাস্তের মাঝে বসবে</span>
                </div>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="আপনার প্রয়োজন বা কারণটি সুন্দরভাবে লিখুন... (যেমন: আমার আম্মু গুরুতর অসুস্থ থাকায় আমাকে জরুরি বাড়ি যেতে হবে...)"
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-slate-100 text-xs sm:text-sm resize-none focus:border-emerald-500"
                />

                {/* Quick Quick-Fill Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    দ্রুত কারণ সাজেস্ট:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "আমার শারীরিক অসুস্থতা (জ্বর ও সর্দি) থাকায়...",
                      "আমার বড় ভাইয়ের বিবাহ উপলক্ষে গ্রামের বাড়ি যাওয়ার জন্য...",
                      "জরুরি পারিবারিক কাজে বাড়িতে উপস্থিত থাকার জন্য...",
                      "ভর্তি ও অন্যান্য দাপ্তরিক কাজে চারিত্রিক সনদপত্র প্রয়োজন...",
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPresetReason(sug)}
                        className="text-[10px] bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 px-2 py-1 rounded-md transition-all text-left"
                      >
                        + {sug.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <PencilLine className="h-4 w-4" />
                  হাতে লেখার ফরম মোড সক্রিয়
                </p>
                <p className="text-[11px] text-amber-200/80 mt-1">
                  প্রিন্ট করার পর দরখাস্তের মূল কারণ ও বিষয়ের জায়গায় পরিষ্কার ডটেড লাইন থাকবে, যেখানে আপনি কলম দিয়ে হাতে লিখতে পারবেন।
                </p>
              </div>
            )}

            {/* 3. Date fields (if leave) */}
            {mode === "filled" && (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-400">তারিখ থেকে (From)</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-400">তারিখ পর্যন্ত (To)</Label>
                  <Input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={e => setToDate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100 h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 4. Applicant Details */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <Label className="text-xs font-bold text-slate-300 block">
                ৩. আবেদনকারীর তথ্য (স্বয়ংক্রিয় বা পরিবর্তনযোগ্য)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">নাম:</span>
                  <Input
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="আবেদনকারীর নাম"
                    className="bg-slate-800 border-slate-700 text-slate-100 h-8 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">রোল / আইডি:</span>
                  <Input
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    placeholder="রোল নং"
                    className="bg-slate-800 border-slate-700 text-slate-100 h-8 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">শ্রেণি / বিভাগ:</span>
                  <Input
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="শ্রেণি / বিভাগ"
                    className="bg-slate-800 border-slate-700 text-slate-100 h-8 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">মোবাইল নং:</span>
                  <Input
                    value={mobileNo}
                    onChange={e => setMobileNo(e.target.value)}
                    placeholder="মোবাইল নম্বর"
                    className="bg-slate-800 border-slate-700 text-slate-100 h-8 text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                onClick={() => handlePrint(false)}
                className="flex-1 bg-[#004D3A] hover:bg-[#003829] text-white font-bold h-10 text-xs rounded-xl gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Printer className="h-4 w-4" />
                {mode === "blank" ? "🖨️ ফাঁকা ফরম প্রিন্ট" : "🖨️ পূরণকৃত দরখাস্ত প্রিন্ট"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrint(true)}
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-xl"
              >
                ফাঁকা প্রিন্ট
              </Button>
            </div>

          </div>

          {/* Right Live Preview Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
            <div className="w-full max-w-[800px] bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800">
              <div className="bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  লাইভ দরখাস্ত প্রিভিউ (Live A4 Preview)
                </span>
                <span className="text-[10px] text-slate-400">
                  {mode === "filled" ? "স্বয়ংক্রিয় পূরণকৃত" : "হাতে লেখার ফরম"}
                </span>
              </div>
              <iframe
                srcDoc={liveHTML}
                title="Live Dorkhasto"
                className="w-full h-[780px] border-0 bg-white"
              />
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
