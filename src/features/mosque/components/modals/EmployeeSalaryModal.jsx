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
} from "lucide-react";
import { toast } from "sonner";

export function EmployeeSalaryModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [activeTab, setActiveTab] = useState("salaries"); // "salaries" | "employees" | "leaves"
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Employees List
  const [employees, setEmployees] = useState([
    {
      id: "EMP-01",
      name: "মাওলানা মাহমুদ হাসান",
      role: "পেশ ইমাম ও খতীব",
      phone: "০১৯১১-৪৪৫৫৬৬",
      salary: 18000,
      joinedAt: "০১ জানুয়ারি ২০২৩",
      status: "ACTIVE",
    },
    {
      id: "EMP-02",
      name: "হাফেজ ক্বারী বিলাল হোসেন",
      role: "মুয়াজ্জিন ও সহকারী শিক্ষক",
      phone: "০১৮২২-৩৩৪৪৫৫",
      salary: 12000,
      joinedAt: "১৫ মার্চ ২০২৩",
      status: "ACTIVE",
    },
    {
      id: "EMP-03",
      name: "মো. হাফিজুর রহমান",
      role: "মসজিদ খাদেম ও পরিচ্ছন্নতাকর্মী",
      phone: "০১৭৩৩-৬৬৭৭৮৮",
      salary: 8000,
      joinedAt: "০১ জুলাই ২০২৪",
      status: "ACTIVE",
    },
  ]);

  // Current Month Salary Payment Records (November 2026)
  const [salaryRecords, setSalaryRecords] = useState([
    {
      id: "SAL-2026-1101",
      empId: "EMP-01",
      name: "মাওলানা মাহমুদ হাসান",
      role: "পেশ ইমাম ও খতীব",
      month: "নভেম্বর ২০২৬",
      amount: 18000,
      paidAt: "০১ নভে ২০২৬",
      method: "ব্যাংক ট্রান্সফার (আল-আরাফাহ)",
      voucherNo: "VCH-SAL-01",
      status: "PAID",
    },
    {
      id: "SAL-2026-1102",
      empId: "EMP-02",
      name: "হাফেজ ক্বারী বিলাল হোসেন",
      role: "মুয়াজ্জিন ও সহকারী শিক্ষক",
      month: "নভেম্বর ২০২৬",
      amount: 12000,
      paidAt: "০২ নভে ২০২৬",
      method: "নগদ ক্যাশ",
      voucherNo: "VCH-SAL-02",
      status: "PAID",
    },
    {
      id: "SAL-2026-1103",
      empId: "EMP-03",
      name: "মো. হাফিজুর রহমান",
      role: "মসজিদ খাদেম",
      month: "নভেম্বর ২০২৬",
      amount: 8000,
      paidAt: "-",
      method: "-",
      voucherNo: "-",
      status: "UNPAID",
    },
  ]);

  // Pay Salary Handler
  const handlePaySalary = (recordId) => {
    setSalaryRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: "PAID",
              paidAt: "আজকের তারিখ",
              method: "নগদ ক্যাশ (কোষাধ্যক্ষ)",
              voucherNo: `VCH-SAL-0${salaryRecords.filter((x) => x.status === "PAID").length + 1}`,
            }
          : r
      )
    );
    toast.success("ইমাম-মুয়াজ্জিন ফান্ড থেকে সম্মানী সফলভাবে পরিশোধ করা হয়েছে এবং পে-স্লিপ প্রস্তুত!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              👳‍♂️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                ইমাম, খতীব, মুয়াজ্জিন ও কর্মচারী সম্মানী ব্যবস্থাপনা
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · মাসিক হাদিয়া পরিশোধ, পে-স্লিপ ও ছুটি ব্যবস্থাপনা
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

        {/* 3 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0 text-xs">
          {[
            { key: "salaries", label: "💵 চলতি মাসের সম্মানী খাতা" },
            { key: "employees", label: "👥 কর্মকর্তা ও কর্মচারী প্রোফাইল" },
            { key: "leaves", label: "📝 ছুটি ও বিকল্প দায়িত্ব" },
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {activeTab === "salaries" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-emerald-200">চলতি মাসের মোট সম্মানী বাজেট:</span>
                  <div className="text-2xl font-black font-mono">৳৩৮,০০০</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-200">পরিশোধিত: ৳৩০,০০০</span>
                  <div className="font-bold text-amber-300 font-mono">বকেয়া: ৳৮,০০০</div>
                </div>
              </div>

              {salaryRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-stone-900 dark:text-stone-100">{r.name}</h4>
                      <p className="text-[11px] text-stone-500">{r.role} · {r.month}</p>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        r.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.status === "PAID" ? "পরিশোধিত" : "পরিশোধ বাকি"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                    <div className="text-stone-500 text-[11px]">
                      {r.status === "PAID" ? (
                        <>তারিখ: <b>{r.paidAt}</b> · মাধ্যম: {r.method}</>
                      ) : (
                        <span className="text-rose-600 font-bold">কোষাধ্যক্ষের অনুমোদন সাপেক্ষে পরিশোধ আবশ্যক</span>
                      )}
                    </div>
                    <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                      ৳{r.amount.toLocaleString("bn-BD")}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-emerald-950/60">
                    {r.status === "PAID" ? (
                      <button
                        onClick={() => setSelectedPayslip(r)}
                        className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-emerald-300 dark:border-emerald-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>অফিসিয়াল পে-স্লিপ প্রিন্ট করুন</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePaySalary(r.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        সম্মানী পরিশোধ করুন
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-2.5">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                      {emp.name.split(" ")[0][0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">{emp.name}</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{emp.role}</p>
                      <p className="text-[10px] text-stone-400">যোগদান: {emp.joinedAt} · ফোন: {emp.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400">মাসিক হাদিয়া:</span>
                    <div className="font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                      ৳{emp.salary.toLocaleString("bn-BD")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 text-[11px] text-stone-600 dark:text-stone-300">
                ইমাম ও মুয়াজ্জিন সাহেবের ছুটি ও বিকল্প ইমামতের দায়িত্ব বণ্টন:
              </div>
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
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
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
