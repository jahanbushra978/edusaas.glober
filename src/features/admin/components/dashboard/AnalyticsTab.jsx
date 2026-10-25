"use client";

import React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { SHOW_READING_PROGRESS } from "@/config/features";
import {
  Users,
  UserCog,
  Wallet,
  ArrowDownCircle,
  FileText,
  GraduationCap,
  Plus,
  DollarSign,
  CalendarCheck,
  Award,
  Clock,
  Mail,
  BarChart3,
  Zap,
} from "lucide-react";

const BoardingManager = dynamic(() => import("@/components/admin/BoardingManager"), { ssr: false });

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });

export default function AnalyticsTab({
  currentUser,
  agg,
  students = [],
  activeCount = 0,
  allTeachers = [],
  monthlyIncome = 0,
  monthlyExpense = 0,
  totalDueAmount = 0,
  overdueFeeCount = 0,
  netProfit = 0,
  thisMonthIncome = 0,
  thisMonthFeeStudents = 0,
  expectedMonthlySalary = 0,
  paidTeacherSalaryThisMonth = 0,
  remainingSalaryThisMonth = 0,
  isTeacherPaymentAvailable = false,
  branches = [],
  rawStudents = [],
  monthlyBoardingExpense = 0,
  monthlyBoardingSaved = 0,
  pendingBoardingCount = 0,
  todayPresentCount = 0,
  todayAttendance = [],
  isTeacherAttendanceAvailable = false,
  todayTeacherPresentCount = 0,
  todayTeacherAbsentCount = 0,
  apps = [],
  messages = [],
  isEventAvailable = false,
  events = [],
  isReadingScoreAvailable = false,
  topReaders = [],
  setActiveTab,
  setShowStudentForm,
  setEditingStudent,
}) {
  return (
    <TabsContent value="analytics" className="space-y-6">
      {currentUser?.role === "boarding_manager" ? (
        <BoardingManager currentUser={currentUser} />
      ) : (
        <>
          {/* Row 1: Primary Stat Cards (6 columns) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Total Students */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Students</span>
              </div>
              <div className="mt-4">
                <h4 className="text-2xl font-bold text-slate-800 leading-tight">{agg?.students?.total ?? students.length}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Active: {agg?.students?.active ?? activeCount}</p>
              </div>
            </div>

            {/* 2. Total Teachers */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserCog className="h-5 w-5" />
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Teachers</span>
              </div>
              <div className="mt-4">
                <h4 className="text-2xl font-bold text-slate-800 leading-tight">{agg?.teachers?.total ?? allTeachers.length}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Active: {agg?.teachers?.active ?? allTeachers.filter((t) => t.status === "active").length}</p>
              </div>
            </div>

            {/* 3. Monthly Income */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 45 C 30 35, 40 15, 95 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 5 H 95 V 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Income</span>
                <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{(agg?.income?.monthly ?? monthlyIncome).toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
              </div>
            </div>

            {/* 4. Monthly Expense */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <ArrowDownCircle className="h-5 w-5" />
                </div>
                <svg className="w-12 h-6 text-rose-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5 C 30 15, 40 35, 95 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 45 H 95 V 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Expense</span>
                <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{monthlyExpense.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
              </div>
            </div>

            {/* 5. Fee Due */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <svg className="w-12 h-6 text-rose-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 45 C 30 35, 40 25, 95 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 10 H 95 V 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Due</span>
                <h4 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">৳{totalDueAmount.toLocaleString()}</h4>
                <p className="text-[10px] text-rose-600 mt-1 font-semibold">{overdueFeeCount} Students</p>
              </div>
            </div>

            {/* 6. Net Profit */}
            <div className="bg-white border border-gray-150 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 45 C 30 35, 40 15, 95 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85 5 H 95 V 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Profit</span>
                <h4 className="text-xl font-extrabold text-[#052E2B] leading-tight mt-1">৳{netProfit.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">This Month</p>
              </div>
            </div>
          </div>

          {/* Row 2: Quick Actions */}
          <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
              <Zap className="h-4.5 w-4.5 text-blue-500 fill-blue-50" />
              <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setShowStudentForm(true);
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border border-emerald-100/50 hover:border-emerald-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <Plus className="h-5 w-5 text-emerald-700" />
                <span>Add Student</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("teachers");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 text-blue-800 border border-blue-100/50 hover:border-blue-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <UserCog className="h-5 w-5 text-blue-700" />
                <span>Add Teacher</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("fees");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/50 hover:bg-teal-50 text-teal-800 border border-teal-100/50 hover:border-teal-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <DollarSign className="h-5 w-5 text-teal-700" />
                <span>Collect Fee</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("student-attendance");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-50 text-amber-800 border border-amber-100/50 hover:border-amber-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <CalendarCheck className="h-5 w-5 text-amber-700" />
                <span>Take Attendance</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("exams");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-purple-800 border border-purple-100/50 hover:border-purple-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <Award className="h-5 w-5 text-purple-700" />
                <span>Add Result</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("reserve");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 text-rose-800 border border-rose-100/50 hover:border-rose-200 transition-all font-semibold text-xs gap-2 active:scale-95"
              >
                <FileText className="h-5 w-5 text-rose-700" />
                <span>Admission Form</span>
              </button>
            </div>
          </Card>

          {/* Row 3: Secondary Mini-Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Students Present</span>
                <span className="text-base font-extrabold text-slate-800">{todayPresentCount}</span>
                <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
              </div>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Students Absent</span>
                <span className="text-base font-extrabold text-rose-600">{todayAttendance.filter((a) => a.status === "absent").length}</span>
                <span className="text-[9px] text-rose-400 ml-1 font-semibold">↓ Today</span>
              </div>
            </div>

            {isTeacherAttendanceAvailable && (
              <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Teachers Present</span>
                  <span className="text-base font-extrabold text-slate-800">{todayTeacherPresentCount}</span>
                  <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
                </div>
              </div>
            )}

            {isTeacherAttendanceAvailable && (
              <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Teachers Absent</span>
                  <span className="text-base font-extrabold text-orange-600">{todayTeacherAbsentCount}</span>
                  <span className="text-[9px] text-slate-400 ml-1 font-semibold">Today</span>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Pending Admission</span>
                <span className="text-base font-extrabold text-slate-800">{apps.filter((a) => a.status === "pending").length}</span>
                <span className="text-[9px] text-slate-400 ml-1 font-semibold">This Month</span>
              </div>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Pending Fees</span>
                <span className="text-base font-extrabold text-slate-800">{overdueFeeCount}</span>
                <span className="text-[9px] text-amber-600 ml-1 font-bold">৳{totalDueAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-[16px] flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Unread Messages</span>
                <span className="text-base font-extrabold text-slate-800">{messages.filter((m) => !m.is_read).length}</span>
                <span className="text-[9px] text-slate-400 ml-1 font-semibold">New</span>
              </div>
            </div>
          </div>

          {/* Row 4: Financial Overview (Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                  <Award className="h-4.5 w-4.5 text-indigo-500 fill-indigo-50" />
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Financial Distribution</h3>
                </div>
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Net Profit", value: netProfit || 1, color: "#10b981" },
                          { name: "Teacher Salary", value: paidTeacherSalaryThisMonth || 0, color: "#3b82f6" },
                          { name: "Other Expense", value: monthlyExpense || 0, color: "#f97316" },
                        ].filter((item) => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {[
                          { name: "Net Profit", value: netProfit || 1, color: "#10b981" },
                          { name: "Teacher Salary", value: paidTeacherSalaryThisMonth || 0, color: "#3b82f6" },
                          { name: "Other Expense", value: monthlyExpense || 0, color: "#f97316" },
                        ].filter((item) => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Income</span>
                    <span className="text-sm font-extrabold text-slate-800">৳{monthlyIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Income</span>
                  </div>
                  <span className="font-bold text-slate-800">৳{monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block" />
                    <span>Expense</span>
                  </div>
                  <span className="font-bold text-slate-800">৳{monthlyExpense.toLocaleString()}</span>
                </div>
                {isTeacherPaymentAvailable && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span>Teacher Salary</span>
                    </div>
                    <span className="font-bold text-slate-800">৳{paidTeacherSalaryThisMonth.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800">Net Profit</span>
                  <span className="font-extrabold text-emerald-800">৳{netProfit.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="border-gray-100 rounded-[20px] shadow-sm lg:col-span-2 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Income vs Expense</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Income
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 block"></span> Expense
                  </div>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: "1", Income: Math.round(monthlyIncome * 0.15), Expense: Math.round(monthlyExpense * 0.2) },
                      { day: "8", Income: Math.round(monthlyIncome * 0.45), Expense: Math.round(monthlyExpense * 0.35) },
                      { day: "15", Income: Math.round(monthlyIncome * 0.65), Expense: Math.round(monthlyExpense * 0.6) },
                      { day: "22", Income: Math.round(monthlyIncome * 0.85), Expense: Math.round(monthlyExpense * 0.75) },
                      { day: "30", Income: monthlyIncome, Expense: monthlyExpense },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,.05)" }} />
                    <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Row 5: Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Student Fees */}
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Student Fees</h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Total Collected</span>
                    <span className="text-sm font-bold text-emerald-600">৳{thisMonthIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Total Due</span>
                    <span className="text-sm font-bold text-rose-600">৳{totalDueAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Students Paid</span>
                    <span className="text-sm font-semibold text-slate-700">{thisMonthFeeStudents}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-xs text-slate-500">Students Due</span>
                    <span className="text-sm font-semibold text-rose-600">{overdueFeeCount}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("fees")}
                className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
              >
                View All Students
              </Button>
            </Card>

            {/* 2. Teacher Salary */}
            {isTeacherPaymentAvailable && (
              <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                    <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Teacher Salary</h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-xs text-slate-500">Total Teachers</span>
                      <span className="text-sm font-semibold text-slate-700">{allTeachers.length}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-xs text-slate-500">Total Salary</span>
                      <span className="text-sm font-bold text-slate-800">৳{expectedMonthlySalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-xs text-slate-500">Paid Salary</span>
                      <span className="text-sm font-bold text-emerald-600">৳{paidTeacherSalaryThisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-xs text-slate-500">Due Salary</span>
                      <span className="text-sm font-bold text-rose-600">৳{remainingSalaryThisMonth.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("hadiya")}
                  className="w-full mt-5 rounded-xl border-blue-600 text-blue-600 hover:text-blue-700 font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Manage Salaries
                </Button>
              </Card>
            )}

            {/* 3. Branch Overview */}
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Branch Overview</h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">Active</span>
                </div>
                <div className="space-y-3">
                  {branches.slice(0, 3).map((branch) => {
                    const count = rawStudents.filter((s) => String(s.branch_id) === String(branch.id)).length;
                    return (
                      <div key={branch.id} className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-xs text-slate-700 font-medium truncate max-w-[200px] sm:max-w-[150px]">
                          {branch.name_bn || branch.name_en}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{count} Students</span>
                      </div>
                    );
                  })}
                  {branches.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs italic">No branches registered</div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("branches")}
                className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
              >
                View All Branches
              </Button>
            </Card>

            {/* 4. Boarding Overview */}
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Boarding Overview</h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">This Month</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Boarding Expense</span>
                    <span className="text-sm font-bold text-slate-800">৳{monthlyBoardingExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Boarding Savings</span>
                    <span className="text-sm font-bold text-emerald-600">৳{monthlyBoardingSaved.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-xs text-slate-500">Pending Approvals</span>
                    <span className={`text-xs font-bold ${pendingBoardingCount > 0 ? "text-red-600 animate-pulse" : "text-slate-500"}`}>
                      {pendingBoardingCount} Reports
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("boarding")}
                className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
              >
                View Boarding Panel
              </Button>
            </Card>
          </div>

          {/* Row 6: Attendance Today & Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Attendance Today</h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">Realtime</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Students Present</span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">{todayPresentCount}</span>
                  </div>
                  <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Students Absent</span>
                    <span className="text-2xl font-black text-rose-700 mt-1 block">{todayAttendance.filter((a) => a.status === "absent").length}</span>
                  </div>
                  {isTeacherAttendanceAvailable && (
                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Teachers Present</span>
                      <span className="text-2xl font-black text-blue-700 mt-1 block">{todayTeacherPresentCount}</span>
                    </div>
                  )}
                  {isTeacherAttendanceAvailable && (
                    <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                      <span className="text-[10px] font-bold text-orange-800 uppercase block">Teachers Absent</span>
                      <span className="text-2xl font-black text-orange-700 mt-1 block">{todayTeacherAbsentCount}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("student-attendance")}
                className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
              >
                View Attendance
              </Button>
            </Card>

            {isEventAvailable && (
              <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                    <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Upcoming Events</h3>
                    <span className="text-[10px] bg-rose-50 px-2 py-0.5 rounded-full text-rose-500 font-bold">Schedule</span>
                  </div>
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic">No upcoming events scheduled</div>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 3).map((e) => (
                        <div key={e.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-rose-50 rounded-xl flex flex-col items-center justify-center border border-rose-100 shrink-0">
                            <span className="text-[9px] font-bold text-rose-700 leading-none">
                              {e.date ? format(new Date(e.date), "MMM").toUpperCase() : "EVENT"}
                            </span>
                            <span className="text-sm font-bold text-rose-700 leading-none mt-0.5">
                              {e.date ? format(new Date(e.date), "dd") : "—"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{e.title}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{e.time || "10:00 AM"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("events")}
                  className="w-full mt-5 rounded-xl border-[#052E2B] text-[#052E2B] font-bold text-xs h-10 hover:bg-slate-50 transition-all active:scale-95"
                >
                  View All Events
                </Button>
              </Card>
            )}
          </div>

          {/* Row 7: Top Readers */}
          {SHOW_READING_PROGRESS && isReadingScoreAvailable && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Top Readers (This Month)</h3>
                  </div>
                  <span className="text-[10px] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full text-[#b45309] font-bold">Leaderboard</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {topReaders.map((s, i) => (
                    <div
                      key={s.id}
                      className={`border rounded-2xl p-4 flex flex-col items-center text-center shadow-sm relative transition-all duration-300 ${
                        i === 0 ? "border-[#D4AF37] bg-amber-50/10" : "border-slate-100 bg-white"
                      }`}
                    >
                      <div
                        className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                            : i === 1
                            ? "bg-slate-200 text-slate-700"
                            : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0 shadow-inner mt-2">
                        {s.photo_url ? (
                          <img src={s.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                        ) : (
                          <span className="text-lg font-bold text-[#052E2B]">{s.full_name_en?.[0] || "?"}</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800 text-xs mt-3 leading-tight truncate max-w-full">{s.full_name_en}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium truncate max-w-full">
                        {branches.find((b) => String(b.id) === String(s.branch_id))?.name_bn || "Branch"}
                      </p>
                      <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-1 px-3 rounded-full mt-3">
                        {s.total_pages_read || 0} Pages Read
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </TabsContent>
  );
}
