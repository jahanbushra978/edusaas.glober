"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Coins,
  CheckCircle2,
  Calendar,
  Printer,
  FileText,
  Plus,
  ShieldCheck,
  Edit2,
  Wallet,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMosqueDatabase,
  paySalaryInDatabase,
  addEmployeeToDatabase,
  updateEmployeeSalaryInDatabase,
  applyLeaveInDatabase,
  approveLeaveInDatabase,
  rejectLeaveInDatabase,
} from "../../services/mosqueStorage";

export function EmployeeSalaryModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  onDataUpdated,
}) {
  const [db, setDb] = useState(() => getMosqueDatabase());
  const [activeTab, setActiveTab] = useState("disburse"); // "disburse" | "records" | "employees" | "leaves"
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Form State for Paying Salary
  const [salaryForm, setSalaryForm] = useState({
    empId: db.employees?.[0]?.id || "EMP-01",
    month: "নভেম্বর ২০২৬",
    amount: db.employees?.[0]?.salary || 18000,
    bonus: 0,
    method: "নগদ (Cash)",
    notes: "মাসিক হাদিয়া পরিশোধ",
  });

  // Form State for Adding New Employee
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    name: "",
    role: "পেশ ইমাম ও খতীব",
    phone: "",
    salary: 15000,
    joinedAt: "০১ নভেম্বর ২০২৬",
  });

  // State for Editing Employee Salary
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editSalaryValue, setEditSalaryValue] = useState(0);

  // State for Leave Application Form (ইমাম ও কর্মচারীদের বাস্তব ছুটির আবেদন সিস্টেম)
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    empId: db.employees?.[0]?.id || "EMP-01",
    applicantName: db.employees?.[0]?.name || "মাওলানা মাহমুদ হাসান",
    role: db.employees?.[0]?.role || "পেশ ইমাম ও খতীব",
    phone: db.employees?.[0]?.phone || "০১৯১১-৪৪৫৫৬৬",
    leaveType: "ধর্মীয় সম্মেলন ও মাহফিল",
    startDate: "২০২৬-১১-২১",
    endDate: "২০২৬-১১-২২",
    durationDays: 2,
    reason: "জাতীয় উলামা সম্মেলনে অংশগ্রহণ ও ওয়াজ মাহফিল",
    replacementName: "হাফেজ ক্বারী বিলাল হোসেন (মুয়াজ্জিন)",
  });

  // When selected employee changes in salary form, auto-fill designated salary
  const handleEmpChange = (empId) => {
    const emp = db.employees.find((e) => e.id === empId);
    setSalaryForm((prev) => ({
      ...prev,
      empId,
      amount: emp ? emp.salary : 10000,
    }));
  };

  // Disburse Salary Handler
  const handleDisburseSalary = (e) => {
    e.preventDefault();
    const emp = db.employees.find((e) => e.id === salaryForm.empId);
    if (!emp) {
      toast.error("অনুগ্রহ করে একজন কর্মচারী বা ইমাম নির্বাচন করুন");
      return;
    }

    const paymentData = {
      empId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      month: salaryForm.month,
      amount: Number(salaryForm.amount),
      bonus: Number(salaryForm.bonus || 0),
      method: salaryForm.method,
      notes: salaryForm.notes,
    };

    const updatedDb = paySalaryInDatabase(paymentData, "কোষাধ্যক্ষ");
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);

    // Auto-open payslip preview
    const total = Number(paymentData.amount) + Number(paymentData.bonus || 0);
    setSelectedPayslip({
      voucherNo: `VCH-SAL-${Date.now().toString().slice(-4)}`,
      name: emp.name,
      role: emp.role,
      month: salaryForm.month,
      amount: total,
      method: salaryForm.method,
      paidAt: "আজকের তারিখ",
    });

    toast.success(`${emp.name}-এর ${salaryForm.month} হাদিয়া ৳${total} পরিশোধ করা হয়েছে! ফান্ডের টাকা স্বয়ংক্রিয়ভাবে কমেছে।`);
    setActiveTab("records");
  };

  // Add Employee Handler
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmpForm.name.trim()) {
      toast.error("অনুগ্রহ করে নাম লিখুন");
      return;
    }

    const updatedDb = addEmployeeToDatabase(newEmpForm, "সভাপতি");
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);

    toast.success(`নতুন স্টাফ '${newEmpForm.name}' (${newEmpForm.role}) সফলভাবে যুক্ত হয়েছেন!`);
    setShowAddEmpModal(false);
    setNewEmpForm({ name: "", role: "পেশ ইমাম", phone: "", salary: 12000, joinedAt: "" });
    setActiveTab("employees");
  };

  // Save Salary Edit
  const handleSaveSalaryEdit = (empId) => {
    if (!editSalaryValue || editSalaryValue <= 0) {
      toast.error("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }
    const updatedDb = updateEmployeeSalaryInDatabase(empId, editSalaryValue, "সভাপতি");
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);
    setEditingEmpId(null);
    toast.success("মাসিক সম্মানী হাদিয়া সফলভাবে আপডেট করা হয়েছে!");
  };

  // When employee is picked in leave form, auto-fill their info & find replacement
  const handleEmployeeSelectForLeave = (empId) => {
    const emp = db.employees.find((e) => e.id === empId);
    if (emp) {
      const otherStaff = db.employees.find((e) => e.id !== empId);
      setLeaveForm((prev) => ({
        ...prev,
        empId,
        applicantName: emp.name,
        role: emp.role,
        phone: emp.phone,
        replacementName: otherStaff ? `${otherStaff.name} (${otherStaff.role})` : "বিকল্প দায়িত্বশীল",
      }));
    }
  };

  // Submit Leave Application (ইমাম বা যে কোনো স্টাফের ছুটির আবেদন দাখিল)
  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      toast.error("অনুগ্রহ করে ছুটির সুনির্দিষ্ট কারণ লিখুন");
      return;
    }

    const updatedDb = applyLeaveInDatabase(leaveForm, leaveForm.applicantName);
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);

    toast.success(`মাশাআল্লাহ! ${leaveForm.applicantName}-এর ছুটির আবেদন সফলভাবে দাখিল হয়েছে। কমিটির অনুমোদনের অপেক্ষায় রয়েছে।`);
    setShowApplyLeaveModal(false);
  };

  // Approve Leave Handler
  const handleApproveLeave = (leaveId) => {
    const updatedDb = approveLeaveInDatabase(leaveId, "মুহাম্মদ আব্দুল্লাহ (সভাপতি)");
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);
    toast.success("ছুটির আবেদন অনুমোদিত হয়েছে এবং বিকল্প দায়িত্বশীলকে দায়িত্ব অর্পণ করা হয়েছে!");
  };

  // Reject Leave Handler
  const handleRejectLeave = (leaveId) => {
    const reason = window.prompt("ছুটি নামঞ্জুর করার কারণ লিখুন:", "মসজিদে জরুরি বিশেষ কর্মসূচি রয়েছে");
    if (!reason) return;
    const updatedDb = rejectLeaveInDatabase(leaveId, reason, "মুহাম্মদ আব্দুল্লাহ (সভাপতি)");
    setDb(updatedDb);
    if (onDataUpdated) onDataUpdated(updatedDb);
    toast.info("ছুটির আবেদন নামঞ্জুর করা হয়েছে।");
  };

  // Salary expense records from DB
  const salaryExpenses = (db.expenses || []).filter(
    (e) => e.fundId === "f3" || e.category === "ইমাম-কর্মচারী সম্মানী" || e.voucherNo?.startsWith("VCH-SAL")
  );

  const imamFund = db.funds.find((f) => f.id === "f3") || { currentBalance: 25000 };

  const allLeaves = db.leaves || [];
  const approvedLeaves = allLeaves.filter((l) => l.status === "APPROVED");
  const pendingLeaves = allLeaves.filter((l) => l.status === "PENDING");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-lg">
              👳‍♂️
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                ইমাম, খতীব ও কর্মচারী সম্মানী ও ছুটি ব্যবস্থাপনা
              </h2>
              <p className="text-[11px] text-emerald-100">
                ইমাম ফান্ড স্থিতি: <b>৳{imamFund.currentBalance.toLocaleString("bn-BD")}</b> · ছুটির আবেদন ও বিকল্প দায়িত্ব
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
            { key: "disburse", label: "➕ নতুন বেতন প্রদান", icon: Wallet },
            { key: "records", label: "📋 পরিশোধের খতিয়ান", icon: FileText },
            { key: "employees", label: "👥 স্টাফ ও ইমাম তালিকা", icon: User },
            { key: "leaves", label: "📝 ছুটি ও বিকল্প দায়িত্ব", icon: Calendar, badge: pendingLeaves.length > 0 ? `${pendingLeaves.length}` : null },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer text-[11px] sm:text-xs relative ${
                  isActive
                    ? "bg-[#0D7A5F] text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40 hover:border-emerald-500"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[1]}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center ml-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* TAB 1: DISBURSE SALARY / PAY SALARY */}
          {activeTab === "disburse" && (
            <form onSubmit={handleDisburseSalary} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#0D7A5F]" />
                  <span>ইমাম-মুয়াজ্জিন ফান্ড ব্যালেন্স:</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ৳{imamFund.currentBalance.toLocaleString("bn-BD")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Employee */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    কার বেতন/সম্মানী পরিশোধ করবেন? *
                  </label>
                  <select
                    value={salaryForm.empId}
                    onChange={(e) => handleEmpChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                  >
                    {(db.employees || []).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role} (নির্ধারিত: ৳{emp.salary})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    কোন মাসের সম্মানী? *
                  </label>
                  <select
                    value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                  >
                    <option value="নভেম্বর ২০২৬">নভেম্বর ২০২৬</option>
                    <option value="ডিসেম্বর ২০২৬">ডিসেম্বর ২০২৬</option>
                    <option value="জানুয়ারি ২০২৭">জানুয়ারি ২০২৭</option>
                    <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬ (বকেয়া)</option>
                    <option value="ঈদ-উল-ফিতর হাদিয়া ২০২৭">ঈদ-উল-ফিতর বিশেষ হাদিয়া</option>
                  </select>
                </div>

                {/* Base Salary Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    মূল সম্মানী/হাদিয়া (৳) *
                  </label>
                  <input
                    type="number"
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#0D7A5F]"
                    min="500"
                    required
                  />
                </div>

                {/* Additional Hadiya / Bonus */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    অতিরিক্ত বোনাস / বিশেষ হাদিয়া (ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.bonus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })}
                    placeholder="০"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono focus:border-[#0D7A5F]"
                    min="0"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    পরিশোধের মাধ্যম *
                  </label>
                  <select
                    value={salaryForm.method}
                    onChange={(e) => setSalaryForm({ ...salaryForm, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                  >
                    <option value="নগদ (Cash)">নগদ ক্যাশ (কোষাধ্যক্ষ সরাসরি)</option>
                    <option value="ব্যাংক ট্রান্সফার (আল-আরাফাহ)">ব্যাংক ট্রান্সফার (আল-আরাফাহ ইসলামী ব্যাংক)</option>
                    <option value="ব্যাংক ট্রান্সফার (ইসলামী ব্যাংক)">ব্যাংক ট্রান্সফার (ইসলামী ব্যাংক বাংলাদেশ)</option>
                    <option value="বিকাশ (bKash)">বিকাশ পার্সোনাল</option>
                    <option value="নগদ (Nagad)">নগদ ওয়ালেট</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    মন্তব্য / রেফারেন্স
                  </label>
                  <input
                    type="text"
                    value={salaryForm.notes}
                    onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                    placeholder="হাদিয়া পরিশোধ বিবরণ..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:border-[#0D7A5F]"
                  />
                </div>
              </div>

              {/* Summary Calculation */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-950 to-stone-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-200">মোট পরিশোধযোগ্য অংক:</span>
                  <div className="text-xl font-bold font-mono text-amber-300">
                    ৳{(Number(salaryForm.amount) + Number(salaryForm.bonus || 0)).toLocaleString("bn-BD")}
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সম্মানী হাদিয়া পরিশোধ সম্পন্ন করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SALARY RECORDS LIST */}
          {activeTab === "records" && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  পরিশোধিত সম্মানী ভাউচার তালিকা ({salaryExpenses.length}টি)
                </span>
                <button
                  onClick={() => setActiveTab("disburse")}
                  className="px-3 py-1 rounded-xl bg-[#0D7A5F] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন বেতন দিন</span>
                </button>
              </div>

              {salaryExpenses.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  এখনো কোনো বেতন ভাউচার এন্ট্রি নেই।
                </div>
              ) : (
                salaryExpenses.map((r) => (
                  <div
                    key={r.id || r.voucherNo}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-stone-100">{r.title}</h4>
                        <p className="text-[11px] text-stone-500 font-mono">ভাউচার: {r.voucherNo} · তারিখ: {r.spentAt}</p>
                      </div>
                      <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        পরিশোধিত (PAID)
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                      <span className="text-[11px] text-stone-500">{r.notes}</span>
                      <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                        ৳{Number(r.amount).toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() =>
                          setSelectedPayslip({
                            voucherNo: r.voucherNo,
                            name: r.title.split("-")[0] || "ইমাম/স্টাফ",
                            role: "সম্মানী পরিশোধ",
                            month: r.month || "চলতি মাস",
                            amount: r.amount,
                            method: r.paymentMethod || "নগদ",
                            paidAt: r.spentAt,
                          })
                        }
                        className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-emerald-300 dark:border-emerald-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>পে-স্লিপ প্রিন্ট করুন</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EMPLOYEES & SALARY PROFILE MANAGEMENT */}
          {activeTab === "employees" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  কর্মকর্তা ও কর্মচারী তালিকা ({db.employees?.length || 0} জন)
                </span>
                <button
                  onClick={() => setShowAddEmpModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#095945] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন ইমাম / স্টাফ যুক্ত করুন</span>
                </button>
              </div>

              {/* Add Employee Form Drawer */}
              {showAddEmpModal && (
                <form
                  onSubmit={handleAddEmployee}
                  className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-[#071a13] border-2 border-emerald-300 dark:border-emerald-800 space-y-2.5 animate-in fade-in"
                >
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0D7A5F]" />
                    <span>নতুন কর্মকর্তা বা ইমামের তথ্য দিন</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="ইমাম বা কর্মচারীর পূর্ণ নাম *"
                      value={newEmpForm.name}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 text-stone-900 dark:text-stone-100"
                      required
                    />
                    <select
                      value={newEmpForm.role}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 text-stone-900 dark:text-stone-100 font-bold"
                    >
                      <option value="পেশ ইমাম ও খতীব">পেশ ইমাম ও খতীব</option>
                      <option value="মুয়াজ্জিন ও সহকারী শিক্ষক">মুয়াজ্জিন ও সহকারী শিক্ষক</option>
                      <option value="মসজিদ খাদেম ও পরিচ্ছন্নতাকর্মী">মসজিদ খাদেম ও পরিচ্ছন্নতাকর্মী</option>
                      <option value="সহকারী ইমাম">সহকারী ইমাম</option>
                      <option value="নূরানী মক্তব শিক্ষক">নূরানী মক্তব শিক্ষক</option>
                    </select>
                    <input
                      type="text"
                      placeholder="মোবাইল নম্বর"
                      value={newEmpForm.phone}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="number"
                      placeholder="মাসিক নির্ধারিত হাদিয়া ৳ *"
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: Number(e.target.value) })}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200 text-stone-900 dark:text-stone-100 font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddEmpModal(false)}
                      className="px-3 py-1 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded-xl bg-[#0D7A5F] text-white font-bold text-xs cursor-pointer"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Employees List */}
              {(db.employees || []).map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                      {emp.name.split(" ")[0][0] || "ই"}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">{emp.name}</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{emp.role}</p>
                      <p className="text-[10px] text-stone-400">ফোন: {emp.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-emerald-950/60">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 block">মাসিক হাদিয়া:</span>
                      {editingEmpId === emp.id ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="number"
                            value={editSalaryValue}
                            onChange={(e) => setEditSalaryValue(Number(e.target.value))}
                            className="w-20 px-2 py-0.5 rounded-lg border border-emerald-500 font-mono text-xs text-stone-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveSalaryEdit(emp.id)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                          >
                            সেভ
                          </button>
                          <button
                            onClick={() => setEditingEmpId(null)}
                            className="px-1.5 py-0.5 rounded-lg bg-stone-200 text-stone-700 text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                            ৳{emp.salary.toLocaleString("bn-BD")}
                          </span>
                          <button
                            onClick={() => {
                              setEditingEmpId(emp.id);
                              setEditSalaryValue(emp.salary);
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-emerald-600"
                            title="হাদিয়া পরিবর্তন করুন"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSalaryForm({
                          empId: emp.id,
                          month: "নভেম্বর ২০২৬",
                          amount: emp.salary,
                          bonus: 0,
                          method: "নগদ (Cash)",
                          notes: `${emp.name}-এর হাদিয়া`,
                        });
                        setActiveTab("disburse");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#074f3d] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      হাদিয়া দিন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: LEAVES & REPLACEMENT IMAM ENGINE (ইমাম ও কর্মচারীদের ছুটি ও বদলি দায়িত্বের পূর্ণাঙ্গ সিস্টেম) */}
          {activeTab === "leaves" && (
            <div className="space-y-3">
              {/* Summary Bar & Apply Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0D7A5F] shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                      মোট ছুটির আবেদন: {allLeaves.length}টি (অনুমোদিত: {approvedLeaves.length}টি, অপেক্ষমান: {pendingLeaves.length}টি)
                    </h4>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      ইমাম, খতীব বা মুয়াজ্জিন সাহেব ছুটির আবেদন দাখিল করবেন এবং সভাপতি অনুমোদন করবেন
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyLeaveModal(!showApplyLeaveModal)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#074f3d] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showApplyLeaveModal ? "ফর্ম বন্ধ করুন" : "ছুটির আবেদন করুন"}</span>
                </button>
              </div>

              {/* LEAVE APPLICATION FORM (ইমাম/মুয়াজ্জিনের ছুটির আবেদন দাখিল ফর্ম) */}
              {showApplyLeaveModal && (
                <form
                  onSubmit={handleApplyLeaveSubmit}
                  className="p-4 rounded-2xl bg-white dark:bg-[#071610] border-2 border-[#0D7A5F] shadow-md space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-emerald-900/60 pb-2">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0D7A5F]" />
                      <span>ইমাম / মুয়াজ্জিন / খাদেমের ছুটির আবেদনপত্র</span>
                    </h4>
                    <span className="text-[10px] text-stone-400">কমিটির অনুমোদনের জন্য দাখিল হবে</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Select Applicant Employee */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটির আবেদনকারী স্টাফ / ইমাম *
                      </label>
                      <select
                        value={leaveForm.empId}
                        onChange={(e) => handleEmployeeSelectForLeave(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                      >
                        {(db.employees || []).map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Leave Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটির ধরন *
                      </label>
                      <select
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                      >
                        <option value="ধর্মীয় সম্মেলন ও মাহফিল">ধর্মীয় সম্মেলন ও মাহফিল</option>
                        <option value="জরুরি পারিবারিক ছুটি">জরুরি পারিবারিক ছুটি</option>
                        <option value="অসুস্থতাজনিত ছুটি">অসুস্থতাজনিত ছুটি (Medical Leave)</option>
                        <option value="নৈমিত্তিক ছুটি">নৈমিত্তিক ছুটি (Casual Leave)</option>
                        <option value="হজ্ব বা উমরাহ ছুটি">পবিত্র হজ্ব বা উমরাহ পালন</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটি শুরুর তারিখ *
                      </label>
                      <input
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#0D7A5F]"
                        required
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটি সমাপ্তির তারিখ *
                      </label>
                      <input
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#0D7A5F]"
                        required
                      />
                    </div>

                    {/* Duration in Days */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        মোট ছুটি (দিন সংখ্যা) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={leaveForm.durationDays}
                        onChange={(e) => setLeaveForm({ ...leaveForm, durationDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#0D7A5F]"
                        required
                      />
                    </div>

                    {/* Replacement Imam / Staff */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        বিকল্প দায়িত্বপ্রাপ্ত (কে নামাজ পড়াবেন / দায়িত্ব পালন করবেন?) *
                      </label>
                      <input
                        type="text"
                        value={leaveForm.replacementName}
                        onChange={(e) => setLeaveForm({ ...leaveForm, replacementName: e.target.value })}
                        placeholder="যেমন: হাফেজ ক্বারী বিলাল হোসেন (মুয়াজ্জিন)"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-bold focus:border-[#0D7A5F]"
                        required
                      />
                    </div>

                    {/* Contact Phone during Leave */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটিকালীন সময়ে যোগাযোগের মোবাইল নম্বর *
                      </label>
                      <input
                        type="tel"
                        value={leaveForm.phone}
                        onChange={(e) => setLeaveForm({ ...leaveForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 font-mono focus:border-[#0D7A5F]"
                        required
                      />
                    </div>

                    {/* Specific Reason */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ছুটির সুনির্দিষ্ট কারণ উল্লেখ করুন *
                      </label>
                      <textarea
                        rows={2}
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        placeholder="যেমন: উলামা সম্মেলনে অংশগ্রহণ, গ্রামের বাড়িতে জরুরি পারিবারিক অনুষ্ঠান বা অসুস্থতাজনিত চিকিৎসা..."
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:border-[#0D7A5F]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-stone-100 dark:border-emerald-950">
                    <button
                      type="button"
                      onClick={() => setShowApplyLeaveModal(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ছুটির আবেদন দাখিল করুন</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Leave Applications List */}
              <div className="space-y-2.5">
                {allLeaves.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    কোনো ছুটির আবেদন দাখিল করা হয়নি।
                  </div>
                ) : (
                  allLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2 shadow-2xs hover:border-[#0D7A5F] transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                            {l.applicantName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#0D7A5F] font-bold">
                            {l.role}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                            {l.leaveType}
                          </span>
                        </div>
                        <span
                          className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            l.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : l.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {l.status === "APPROVED"
                            ? "অনুমোদিত ছুটি"
                            : l.status === "REJECTED"
                            ? "নামঞ্জুর"
                            : "অনুমোদনের অপেক্ষায় (Pending)"}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#07130e] p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#0D7A5F] shrink-0" />
                          <span>
                            ছুটির সময়: <b>{l.startDate} হতে {l.endDate}</b> ({l.durationDays} দিন)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold shrink-0">কারণ:</span>
                          <span>{l.reason}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60 dark:border-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>বিকল্প দায়িত্বপ্রাপ্ত: <b>{l.replacementName}</b></span>
                        </div>
                        {l.phone && (
                          <div className="text-[10px] text-stone-400">
                            ছুটিকালীন ফোন: {l.phone}
                          </div>
                        )}
                        {l.status === "APPROVED" && l.approvedBy && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            অনুমোদনকারী: {l.approvedBy}
                          </div>
                        )}
                        {l.status === "REJECTED" && l.rejectionReason && (
                          <div className="text-[10px] text-rose-600 font-medium">
                            নামঞ্জুরের কারণ: {l.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Approval Actions for Committee / President */}
                      {l.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                          <button
                            type="button"
                            onClick={() => handleRejectLeave(l.id)}
                            className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[11px] cursor-pointer"
                          >
                            নামঞ্জুর
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(l.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ছুটি অনুমোদন করুন</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
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

      {/* PRINTABLE PAYSLIP MODAL */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80">
          <div className="w-full max-w-sm bg-white text-stone-900 rounded-3xl p-5 shadow-2xl space-y-3 border border-emerald-400">
            <div className="text-center pb-2 border-b border-stone-300">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{mosqueName}</span>
              <h3 className="text-base font-black">মাসিক হাদিয়া ও বেতন পে-স্লিপ</h3>
              <p className="text-[10px] text-stone-500 font-mono">ভাউচার নং: {selectedPayslip.voucherNo}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">কর্মকর্তার নাম:</span>
                <span className="font-bold">{selectedPayslip.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">পদবী:</span>
                <span className="font-bold">{selectedPayslip.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">মাস:</span>
                <span className="font-bold">{selectedPayslip.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">পরিশোধের মাধ্যম:</span>
                <span className="font-bold">{selectedPayslip.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">পরিশোধের তারিখ:</span>
                <span className="font-bold">{selectedPayslip.paidAt}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-bold">মোট হাদিয়া:</span>
                <span className="text-lg font-black text-emerald-800 font-mono">
                  ৳{selectedPayslip.amount.toLocaleString("bn-BD")}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-stone-300 grid grid-cols-2 gap-2 text-center text-[10px]">
              <div>
                <div className="h-6 border-b border-stone-400"></div>
                <span className="text-stone-500">কোষাধ্যক্ষের স্বাক্ষর</span>
              </div>
              <div>
                <div className="h-6 border-b border-stone-400"></div>
                <span className="text-stone-500">গ্রহীতার স্বাক্ষর</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success("পে-স্লিপ প্রিন্ট কমান্ড পাঠানো হয়েছে");
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer"
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
