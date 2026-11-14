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
  Phone,
  Plus,
  ShieldCheck,
  Building,
  Edit2,
  Wallet,
  Briefcase,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMosqueDatabase,
  paySalaryInDatabase,
  addEmployeeToDatabase,
  updateEmployeeSalaryInDatabase,
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

  // Salary expense records from DB
  const salaryExpenses = (db.expenses || []).filter(
    (e) => e.fundId === "f3" || e.category === "ইমাম-কর্মচারী সম্মানী" || e.voucherNo?.startsWith("VCH-SAL")
  );

  const imamFund = db.funds.find((f) => f.id === "f3") || { currentBalance: 25000 };

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
                ইমাম, খতীব ও কর্মচারী সম্মানী ব্যবস্থাপনা
              </h2>
              <p className="text-[11px] text-emerald-100">
                ইমাম ফান্ড স্থিতি: <b>৳{imamFund.currentBalance.toLocaleString("bn-BD")}</b> · ডাবল-এন্ট্রি পে-স্লিপ
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
            { key: "leaves", label: "📝 ছুটি ও বিকল্প দায়িত্ব", icon: Calendar },
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
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* TAB 1: DISBURSE SALARY / PAY SALARY (দাবি অনুযায়ী নতুন বেতন দেওয়ার পূর্ণাঙ্গ ফর্ম) */}
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

          {/* TAB 3: EMPLOYEES & SALARY PROFILE MANAGEMENT (নতুন ইমাম যুক্ত ও বেতন পরিবর্তন) */}
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

          {/* TAB 4: LEAVES */}
          {activeTab === "leaves" && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span>মাওলানা মাহমুদ হাসান (খতীব)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">অনুমোদিত ছুটি</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  ছুটির সময়: ২১ - ২২ নভেম্বর ২০২৬ · কারণ: উলামা সম্মেলনে অংশগ্রহণ
                </p>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1 border-t border-stone-100 dark:border-emerald-950">
                  বিকল্প দায়িত্বপ্রাপ্ত: হাফেজ কারী বিলাল হোসেন (মুয়াজ্জিন)
                </div>
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
