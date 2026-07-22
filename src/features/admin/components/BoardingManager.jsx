import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Building2, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  FileUp, 
  BookOpen, 
  User, 
  Download, 
  Printer,
  ChevronRight,
  Check,
  Eye,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const EXPENSE_CATEGORIES = [
  "Food Market",
  "Fish & Meat",
  "Vegetables",
  "Rice & Dal",
  "Gas",
  "Electricity",
  "Water",
  "Cleaning",
  "Medicine",
  "Staff Expense",
  "Maintenance",
  "Other"
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#30a46c", "#12715B", "#3b82f6", "#e11d48", "#9333ea"];

export default function BoardingManager({ currentUser }) {
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("dashboard"); // dashboard, entry, history, gallery, analytics, approvals
  const [viewMode, setViewMode] = useState("daily"); // 'daily', 'monthly', 'all'
  const [refreshingPeriod, setRefreshingPeriod] = useState(false);

  // Auto Period Check & Refresh at the end of each calendar month
  const { data: periodCheck, refetch: refetchPeriodCheck } = useQuery({
    queryKey: ["period-check-boarding"],
    queryFn: async () => {
      const res = await fetch("/api/admin/period/check");
      return res.json().catch(() => null);
    },
  });

  const handleRefreshPeriod = async () => {
    setRefreshingPeriod(true);
    try {
      const res = await fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip_archive: false }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        toast.success(`নতুন মাস (${data.nextPeriod}) শুরু হয়েছে! পুরনো মাসের হিসাব আর্কাইভ ও ড্যাশবোর্ড রিফ্রেশ করা হয়েছে।`);
        queryClient.invalidateQueries({ queryKey: ["boarding-reports"] });
        queryClient.invalidateQueries({ queryKey: ["boarding-expenses"] });
        refetchPeriodCheck();
      } else {
        toast.error(data?.message || "Failed to refresh period.");
      }
    } catch (err) {
      toast.error("Period refresh error: " + err.message);
    } finally {
      setRefreshingPeriod(false);
    }
  };

  useEffect(() => {
    if (periodCheck?.ok && periodCheck?.needsNewPeriod) {
      console.log("[BoardingManager] New month detected. Silent auto-refreshing period...");
      fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: periodCheck.systemPeriod }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok) {
            queryClient.invalidateQueries({ queryKey: ["boarding-reports"] });
            queryClient.invalidateQueries({ queryKey: ["boarding-expenses"] });
            refetchPeriodCheck();
          }
        })
        .catch(() => {});
    }
  }, [periodCheck]);
  
  // Daily Expense Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryCategory, setEntryCategory] = useState("Food Market");
  const [entryItems, setEntryItems] = useState([
    { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
    { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
    { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
    { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
  ]);
  const [menuImage, setMenuImage] = useState("");
  const [billAttachment, setBillAttachment] = useState("");
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingBill, setUploadingBill] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Filters for History
  const [historyFilter, setHistoryFilter] = useState("this_month"); // today, this_week, this_month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  // Queries
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches-boarding"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const { data: allReports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ["boarding-reports"],
    queryFn: () => appClient.entities.BoardingDailyReport.listAll({ sort: "-date" }),
  });

  const { data: allExpenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["boarding-expenses"],
    queryFn: () => appClient.entities.BoardingExpense.listAll({ sort: "-date" }),
  });

  // Automatically set selected branch for Branch Admin / Boarding Manager
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "branch_admin" || currentUser.role === "boarding_manager") {
        setSelectedBranchId(String(currentUser.branch_id));
      } else if (currentUser.role === "admin" && branches.length > 0 && !selectedBranchId) {
        // Select first boarding-enabled branch by default
        const enabledBranch = branches.find(b => b.boarding_enabled);
        if (enabledBranch) {
          setSelectedBranchId(String(enabledBranch.id));
        } else {
          setSelectedBranchId(String(branches[0].id));
        }
      }
    }
  }, [currentUser, branches]);

  // Derived filtered data
  const filteredReports = useMemo(() => {
    let list = allReports;
    if (currentUser.role !== "admin") {
      list = list.filter(r => String(r.branch_id) === String(currentUser.branch_id));
    } else if (selectedBranchId) {
      list = list.filter(r => String(r.branch_id) === String(selectedBranchId));
    }
    return list;
  }, [allReports, currentUser, selectedBranchId]);

  const filteredExpenses = useMemo(() => {
    let list = allExpenses;
    if (currentUser.role !== "admin") {
      list = list.filter(e => String(e.branch_id) === String(currentUser.branch_id));
    } else if (selectedBranchId) {
      list = list.filter(e => String(e.branch_id) === String(selectedBranchId));
    }
    return list;
  }, [allExpenses, currentUser, selectedBranchId]);

  // Calculations for dashboard
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const todayReports = filteredReports.filter(r => r.date === todayStr);
    const monthlyReports = filteredReports.filter(r => r.date >= firstDayOfMonth);

    const todayExpense = todayReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const monthlyExpense = monthlyReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const totalExpense = filteredReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    
    const todaySaved = todayReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
    const monthlySaved = monthlyReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
    const totalSaved = filteredReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);

    const netExpense = totalExpense;
    const todayNetExpense = todayExpense;
    const monthlyNetExpense = monthlyExpense;

    const totalBills = filteredReports.filter(r => r.bill_attachment_url).length;
    const totalMenus = filteredReports.filter(r => r.menu_image_url).length;
    const pendingReports = filteredReports.filter(r => r.status === "Pending").length;

    const lastEntry = filteredReports[0]?.date || "None";
    
    const currentBranch = branches.find(b => String(b.id) === String(selectedBranchId));
    const managerInfo = currentBranch ? {
      name: currentBranch.boarding_manager_name,
      username: currentBranch.boarding_manager_username,
      mobile: currentBranch.boarding_manager_mobile,
      enabled: currentBranch.boarding_enabled
    } : null;

    return {
      todayExpense,
      monthlyExpense,
      totalExpense,
      todaySaved,
      monthlySaved,
      totalSaved,
      netExpense,
      todayNetExpense,
      monthlyNetExpense,
      totalBills,
      totalMenus,
      totalEntries: filteredReports.length,
      lastEntryDate: lastEntry,
      managerInfo,
      pendingReports
    };
  }, [filteredReports, selectedBranchId, branches]);

  // Super Admin Overall Summary Metrics
  const superAdminStats = useMemo(() => {
    if (currentUser.role !== "admin") return null;
    const todayStr = new Date().toISOString().split("T")[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const boardingBranches = branches.filter(b => b.boarding_enabled);
    const todayReports = allReports.filter(r => r.date === todayStr);
    const monthlyReports = allReports.filter(r => r.date >= firstDayOfMonth);

    const todayExpense = todayReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const monthlyExpense = monthlyReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const totalExpense = allReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const totalSaved = allReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
    const netExpense = totalExpense;

    const pendingReports = allReports.filter(r => r.status === "Pending").length;

    // Top spending branches, most saving branches
    const branchStats = boardingBranches.map(b => {
      const bReports = allReports.filter(r => String(r.branch_id) === String(b.id));
      const exp = bReports.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
      const sav = bReports.reduce((sum, r) => sum + Number(r.total_saved_amount || 0), 0);
      const name = b.name_bn || b.branch_name;
      return { id: b.id, name, exp, sav };
    });

    const sortedBySpend = [...branchStats].sort((a, b) => b.exp - a.exp);
    const sortedBySave = [...branchStats].sort((a, b) => b.sav - a.sav);

    const topSpending = sortedBySpend[0] || null;
    const lowestSpending = sortedBySpend.filter(b => b.exp > 0).pop() || null;
    const mostSaving = sortedBySave[0] || null;

    // Branches without today's entry
    const branchesWithoutEntry = boardingBranches.filter(b => {
      return !todayReports.some(r => String(r.branch_id) === String(b.id));
    });

    return {
      totalBoardingBranches: boardingBranches.length,
      todayExpense,
      monthlyExpense,
      totalExpense,
      totalSaved,
      netExpense,
      topSpending,
      lowestSpending,
      mostSaving,
      branchesWithoutEntry,
      pendingReports
    };
  }, [allReports, branches, currentUser]);

  // File Upload Handlers
  const handleMenuUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMenu(true);
    try {
      const res = await appClient.integrations.Core.UploadFile({ file, folder: "boarding_menus" });
      setMenuImage(res.file_url);
      toast.success("Menu image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload menu image: " + err.message);
    } finally {
      setUploadingMenu(false);
    }
  };

  const handleBillUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBill(true);
    try {
      const res = await appClient.integrations.Core.UploadFile({ file, folder: "boarding_bills" });
      setBillAttachment(res.file_url);
      toast.success("Bill/Receipt attachment uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload bill: " + err.message);
    } finally {
      setUploadingBill(false);
    }
  };

  // Add Row to Entry Form
  const addEntryItem = () => {
    setEntryItems([...entryItems, { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" }]);
  };

  // Remove Row from Entry Form
  const removeEntryItem = (index) => {
    if (entryItems.length <= 1) return;
    setEntryItems(entryItems.filter((_, i) => i !== index));
  };

  // Update Item Fields
  const updateItemField = (index, field, value) => {
    const updated = entryItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setEntryItems(updated);
  };

  // Auto calculate calculations from items
  const calculations = useMemo(() => {
    let grandTotal = 0;
    let totalSaved = 0;
    
    entryItems.forEach(item => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.per_unit_price || 0);
      const actual = Number(item.actual_total || 0);
      const expected = qty * price;
      const saved = expected - actual;

      grandTotal += actual;
      totalSaved += saved;
    });

    const netExpense = grandTotal;

    return {
      grandTotal,
      totalSaved,
      netExpense
    };
  }, [entryItems]);

  // Submit Expense Report
  const handleSubmitDailyReport = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      toast.error("Please select a branch.");
      return;
    }

    const validItems = entryItems.filter(item => item.item_name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please enter at least one expense item.");
      return;
    }

    // Check duplicate date for this branch
    const isDuplicate = allReports.some(r => r.date === entryDate && String(r.branch_id) === String(selectedBranchId) && (!editingReport || r.id !== editingReport.id));
    if (isDuplicate) {
      toast.error(`A daily report has already been submitted for ${entryDate}. You can edit the existing one in history instead.`);
      return;
    }

    setSubmittingExpense(true);

    try {
      const reportPayload = {
        date: entryDate,
        branch_id: selectedBranchId,
        manager_name: currentUser.role === "boarding_manager" ? currentUser.full_name_en : (branches.find(b => String(b.id) === String(selectedBranchId))?.boarding_manager_name || "Manager"),
        manager_username: currentUser.role === "boarding_manager" ? currentUser.loginId : (branches.find(b => String(b.id) === String(selectedBranchId))?.boarding_manager_username || "manager"),
        grand_total: calculations.grandTotal,
        total_saved_amount: calculations.totalSaved,
        net_expense: calculations.grandTotal,
        menu_image_url: menuImage,
        bill_attachment_url: billAttachment,
        status: "Pending", // Default is pending
        created_by: currentUser.full_name_en || currentUser.role,
        updated_by: currentUser.full_name_en || currentUser.role,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      };

      let reportRecord;
      if (editingReport) {
        reportRecord = await appClient.entities.BoardingDailyReport.update(editingReport.id, {
          ...reportPayload,
          created_by: editingReport.created_by,
          created_date: editingReport.created_date,
        });

        // Delete previous items for this report
        const prevItems = allExpenses.filter(exp => exp.report_id === editingReport.id);
        for (const item of prevItems) {
          await appClient.entities.BoardingExpense.delete(item.id);
        }
      } else {
        reportRecord = await appClient.entities.BoardingDailyReport.create(reportPayload);
      }

      // Create expense items
      for (const item of validItems) {
        const qty = Number(item.quantity || 0);
        const price = Number(item.per_unit_price || 0);
        const actual = Number(item.actual_total || 0);
        const expected = qty * price;
        const saved = expected - actual;

        await appClient.entities.BoardingExpense.create({
          report_id: reportRecord.id,
          item_name: item.item_name,
          quantity: qty,
          unit: item.unit,
          per_unit_price: price,
          actual_total: actual,
          expected_total: expected,
          saved_amount: saved,
          category: entryCategory,
          branch_id: selectedBranchId,
          date: entryDate,
        });
      }

      toast.success(editingReport ? "Daily report updated successfully!" : "Daily report submitted successfully!");
      
      // Reset form
      setEntryItems([
        { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
        { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
        { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
        { item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" },
      ]);
      setMenuImage("");
      setBillAttachment("");
      setEditingReport(null);
      
      // Invalidate queries
      queryClient.invalidateQueries(["boarding-reports"]);
      queryClient.invalidateQueries(["boarding-expenses"]);
      
      setActiveSubTab("history");
    } catch (err) {
      toast.error("Failed to save report: " + err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Edit action
  const handleEditReport = (report) => {
    const reportItems = allExpenses.filter(e => e.report_id === report.id);
    setEntryDate(report.date);
    if (reportItems[0]?.category) {
      setEntryCategory(reportItems[0].category);
    }
    
    // map items
    const mapped = reportItems.map(item => ({
      item_name: item.item_name,
      quantity: String(item.quantity),
      unit: item.unit || "KG",
      per_unit_price: String(item.per_unit_price),
      actual_total: String(item.actual_total)
    }));

    // Pad to 4 items minimum
    while (mapped.length < 4) {
      mapped.push({ item_name: "", quantity: "", unit: "KG", per_unit_price: "", actual_total: "" });
    }

    setEntryItems(mapped);
    setMenuImage(report.menu_image_url || "");
    setBillAttachment(report.bill_attachment_url || "");
    setEditingReport(report);
    setActiveSubTab("entry");
  };

  // Delete Action
  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this daily report and all its items?")) return;
    try {
      await appClient.entities.BoardingDailyReport.delete(id);
      toast.success("Report deleted successfully.");
      queryClient.invalidateQueries(["boarding-reports"]);
      queryClient.invalidateQueries(["boarding-expenses"]);
    } catch (err) {
      toast.error("Failed to delete report: " + err.message);
    }
  };

  // Approve / Reject Report
  const handleApproval = async (reportId, nextStatus) => {
    try {
      const now = new Date().toISOString();
      await appClient.entities.BoardingDailyReport.update(reportId, {
        status: nextStatus,
        approved_by: currentUser.full_name_en || currentUser.role,
        approved_date: now,
        updated_by: currentUser.full_name_en || currentUser.role,
        updated_date: now
      });
      toast.success(`Report status updated to ${nextStatus}!`);
      queryClient.invalidateQueries(["boarding-reports"]);
    } catch (err) {
      toast.error("Approval flow failed: " + err.message);
    }
  };

  // History date filters
  const dateFilteredReports = useMemo(() => {
    let list = filteredReports;
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (historyFilter === "today") {
      list = list.filter(r => r.date === todayStr);
    } else if (historyFilter === "this_week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoStr = oneWeekAgo.toISOString().split("T")[0];
      list = list.filter(r => r.date >= oneWeekAgoStr);
    } else if (historyFilter === "this_month") {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      list = list.filter(r => r.date >= firstDay);
    } else if (historyFilter === "custom" && customStartDate && customEndDate) {
      list = list.filter(r => r.date >= customStartDate && r.date <= customEndDate);
    }
    return list;
  }, [filteredReports, historyFilter, customStartDate, customEndDate]);

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Manager Name", "Grand Total", "Saved Amount", "Status"];
    const rows = dateFilteredReports.map(r => [
      r.date,
      r.manager_name,
      r.grand_total,
      r.total_saved_amount,
      r.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `boarding_report_${selectedBranchId || "all"}_${historyFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charts data derivation
  const chartData = useMemo(() => {
    const monthlySummary = {};
    const categorySummary = {};
    const dailySummary = {};

    filteredReports.slice().reverse().forEach(r => {
      // Daily (last 15 days)
      const day = r.date;
      dailySummary[day] = {
        date: day,
        expense: Number(r.grand_total || 0),
        savings: Number(r.total_saved_amount || 0)
      };

      // Monthly
      const month = r.date.substring(0, 7); // YYYY-MM
      if (!monthlySummary[month]) {
        monthlySummary[month] = { month, expense: 0, savings: 0 };
      }
      monthlySummary[month].expense += Number(r.grand_total || 0);
      monthlySummary[month].savings += Number(r.total_saved_amount || 0);
    });

    filteredExpenses.forEach(e => {
      const cat = e.category || "Other";
      if (!categorySummary[cat]) {
        categorySummary[cat] = { name: cat, value: 0 };
      }
      categorySummary[cat].value += Number(e.actual_total || 0);
    });

    const daily = Object.values(dailySummary).slice(-15);
    const monthly = Object.values(monthlySummary);
    const categories = Object.values(categorySummary);

    return {
      daily,
      monthly,
      categories
    };
  }, [filteredReports, filteredExpenses]);

  // Notifications logic
  const notifications = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Check if entry not made today
    if (branches.length > 0) {
      branches.filter(b => b.boarding_enabled).forEach(b => {
        const hasTodayReport = allReports.some(r => r.date === todayStr && String(r.branch_id) === String(b.id));
        if (!hasTodayReport) {
          if (currentUser.role === "admin") {
            list.push({
              id: `no-entry-${b.id}`,
              type: "warning",
              message: `No boarding entry submitted today for branch: ${b.name_bn || b.branch_name}`
            });
          } else if (currentUser.role === "branch_admin" && String(currentUser.branch_id) === String(b.id)) {
            list.push({
              id: `no-entry-${b.id}`,
              type: "warning",
              message: "No boarding entry submitted today for your branch."
            });
          }
        }
      });
    }

    // Check pending approvals
    if (currentUser.role === "admin" || currentUser.role === "branch_admin") {
      const pendingCount = filteredReports.filter(r => r.status === "Pending").length;
      if (pendingCount > 0) {
        list.push({
          id: "pending-approvals",
          type: "info",
          message: `There are ${pendingCount} boarding reports pending approval.`
        });
      }
    }

    return list;
  }, [allReports, branches, currentUser, filteredReports]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#052E2B] to-[#043e33] p-6 rounded-[24px] border border-emerald-920 text-white shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight font-serif flex items-center gap-2">
            🏠 Boarding Management System
          </h2>
          <p className="text-emerald-300 text-xs italic mt-1">
            স্বয়ংক্রিয় মাসিক রিফ্রেশ সাইকেল এবং প্রতিদিন ও মাসের হিসাব ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <span className="text-xs bg-emerald-950/80 border border-emerald-700/80 px-3.5 py-1.5 rounded-xl font-bold text-amber-300 shadow-inner flex items-center gap-2">
            <span>📅 আজ: {new Date().toISOString().split("T")[0]}</span>
          </span>
          {currentUser.role === "admin" && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#D4AF37]" />
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="bg-emerald-950/60 border border-emerald-800 text-white rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-emerald-950">
                    {b.name_bn || b.branch_name} {b.boarding_enabled ? "(Boarding Active)" : "(Boarding Inactive)"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notifications widget */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${
                n.type === "warning" 
                  ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300"
                  : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300"
              }`}
            >
              <AlertTriangle className={`h-4.5 w-4.5 shrink-0 ${n.type === "warning" ? "text-amber-600" : "text-blue-600"}`} />
              <span className="flex-1">{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-1">
        <Button 
          variant={activeSubTab === "dashboard" ? "gold" : "outline"}
          onClick={() => setActiveSubTab("dashboard")}
          className="rounded-full text-xs font-bold h-9"
        >
          Overview Dashboard
        </Button>

        {currentUser.role === "boarding_manager" && (
          <Button 
            variant={activeSubTab === "entry" ? "gold" : "outline"}
            onClick={() => {
              setEditingReport(null);
              setActiveSubTab("entry");
            }}
            className="rounded-full text-xs font-bold h-9"
          >
            Today's Expense Entry
          </Button>
        )}

        <Button 
          variant={activeSubTab === "history" ? "gold" : "outline"}
          onClick={() => setActiveSubTab("history")}
          className="rounded-full text-xs font-bold h-9"
        >
          Expense History
        </Button>

        <Button 
          variant={activeSubTab === "gallery" ? "gold" : "outline"}
          onClick={() => setActiveSubTab("gallery")}
          className="rounded-full text-xs font-bold h-9"
        >
          Menu Gallery
        </Button>

        <Button 
          variant={activeSubTab === "analytics" ? "gold" : "outline"}
          onClick={() => setActiveSubTab("analytics")}
          className="rounded-full text-xs font-bold h-9"
        >
          Boarding Analytics
        </Button>

        {(currentUser.role === "admin" || currentUser.role === "branch_admin") && (
          <Button 
            variant={activeSubTab === "approvals" ? "gold" : "outline"}
            onClick={() => setActiveSubTab("approvals")}
            className="rounded-full text-xs font-bold h-9 flex items-center gap-1.5"
          >
            Approvals Queue
            {stats.pendingReports > 0 && (
              <span className="bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5 font-black">
                {stats.pendingReports}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Tab Contents: 1. OVERVIEW DASHBOARD */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Super Admin Dashboard Cards */}
          {currentUser.role === "admin" && superAdminStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-gray-100 rounded-[20px] bg-white p-5 shadow-sm">
                <span className="text-[10px] font-extrabold text-[#12715B] uppercase block">Total Boarding Branches</span>
                <span className="text-3xl font-black text-slate-800 mt-1 block">{superAdminStats.totalBoardingBranches}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">Branches with boarding enabled</span>
              </Card>
              <Card className="border-gray-100 rounded-[20px] bg-white p-5 shadow-sm">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase block">Today's Expense (All)</span>
                <span className="text-3xl font-black text-slate-800 mt-1 block">৳{superAdminStats.todayExpense.toLocaleString()}</span>
                <span className="text-[10px] text-blue-400 font-bold block mt-1">Sum of all boarding branches today</span>
              </Card>
              <Card className="border-gray-100 rounded-[20px] bg-white p-5 shadow-sm">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase block">Total Saved Amount (All)</span>
                <span className="text-3xl font-black text-emerald-600 mt-1 block">৳{superAdminStats.totalSaved.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">Accumulated wholesale savings</span>
              </Card>

            </div>
          )}

          {/* Mode Filter Bar (Daily View vs Monthly View vs All-Time Archive) */}
          <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                হিসাব ভিউ সিলেক্টর (Statement View Mode)
              </h3>
              <p className="text-[11px] text-slate-500 italic mt-0.5">
                ইচ্ছামতো প্রতিদিনের বা চলতি মাসের পুরো হিসাব ফিল্টার করে দেখুন
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setViewMode("daily"); setHistoryFilter("today"); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === "daily" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-white/60"}`}
              >
                📅 প্রতিদিনের হিসাব (Daily)
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("monthly"); setHistoryFilter("this_month"); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === "monthly" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-white/60"}`}
              >
                📊 চলতি মাসের হিসাব (Monthly)
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("all"); setHistoryFilter("custom"); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === "all" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-white/60"}`}
              >
                📁 সকল মাস (Archive)
              </button>
            </div>
          </div>

          {/* Branch-wise Summary Cards (Branch Admin / Boarding Manager / Admin selected branch) */}
          <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-[#052E2B] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
                {currentUser.role === "admin" ? "Selected Branch Boarding Status" : "Your Branch Boarding Status"}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                {viewMode === "daily" ? "আজকের ফিল্টার (Daily View)" : viewMode === "monthly" ? "চলতি মাসের ফিল্টার (Monthly View)" : "সব ডেটা ফিল্টার"}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-100 bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Today's Expense</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">৳{stats.todayExpense.toLocaleString()}</span>
              </Card>
              <Card className="border-slate-100 bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Monthly Expense</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">৳{stats.monthlyExpense.toLocaleString()}</span>
              </Card>
              <Card className="border-slate-100 bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase block">Total Saved Amount</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">৳{stats.totalSaved.toLocaleString()}</span>
              </Card>
              <Card className="border-slate-100 bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Last Entry Date</span>
                <span className="text-sm font-black text-slate-700 mt-2.5 block">{stats.lastEntryDate}</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bills Uploaded</span>
                  <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.totalBills} Files</span>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Menu Uploads</span>
                  <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.totalMenus} Images</span>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border">
                  <ImageIcon className="h-5 w-5 text-slate-500" />
                </div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Log Entries</span>
                  <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.totalEntries} Days</span>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border">
                  <BookOpen className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Manager Details */}
            {stats.managerInfo && (
              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold border">
                    {stats.managerInfo.name?.[0] || <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Manager: {stats.managerInfo.name || "N/A"}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Username: {stats.managerInfo.username} | Mobile: {stats.managerInfo.mobile || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">Status:</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${stats.managerInfo.enabled ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {stats.managerInfo.enabled ? "Active Manager" : "Inactive"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Super Admin comparison panel */}
          {currentUser.role === "admin" && superAdminStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-[24px] border border-slate-100">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Top Spending Branch</h4>
                  {superAdminStats.topSpending ? (
                    <div>
                      <span className="text-lg font-black text-slate-800">{superAdminStats.topSpending.name}</span>
                      <span className="text-sm font-bold text-red-600 block mt-1">৳{superAdminStats.topSpending.exp.toLocaleString()} Total</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">N/A</span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Most Saving Branch</h4>
                  {superAdminStats.mostSaving ? (
                    <div>
                      <span className="text-lg font-black text-emerald-800">{superAdminStats.mostSaving.name}</span>
                      <span className="text-sm font-bold text-emerald-600 block mt-1">৳{superAdminStats.mostSaving.sav.toLocaleString()} Saved</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">N/A</span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branches Without Today's Entry</h4>
                  <div className="max-h-[100px] overflow-y-auto mt-2 space-y-1">
                    {superAdminStats.branchesWithoutEntry.map(b => (
                      <div key={b.id} className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {b.name_bn || b.branch_name}
                      </div>
                    ))}
                    {superAdminStats.branchesWithoutEntry.length === 0 && (
                      <span className="text-xs text-emerald-600 font-bold">All branches submitted!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick links to active subtabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-slate-100 bg-white rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Add or View Daily Expenses</h4>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Log food markets, utilities, cleaning, and upload invoices</p>
              </div>
              <Button 
                variant="gold"
                onClick={() => setActiveSubTab(currentUser.role === "boarding_manager" ? "entry" : "history")}
                className="rounded-xl text-xs font-bold gap-1 shrink-0"
              >
                {currentUser.role === "boarding_manager" ? "Log Today's Expense" : "View History"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>
            <Card className="p-5 border-slate-100 bg-white rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">View Boarding Analytics</h4>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Visual trends for daily expenditure, monthly saving patterns, and category shares</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setActiveSubTab("analytics")}
                className="rounded-xl text-xs font-bold border-[#12715B] text-[#12715B] gap-1 shrink-0"
              >
                View Charts
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Contents: 2. EXPENSE ENTRY FORM */}
      {activeSubTab === "entry" && currentUser.role === "boarding_manager" && (
        <form onSubmit={handleSubmitDailyReport} className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 font-serif flex items-center gap-2">
                ✏️ {editingReport ? "Edit Daily Boarding Report" : "New Daily Boarding Report"}
              </h3>
              <p className="text-xs text-slate-500 italic mt-0.5">
                Fill the details below. Quantity and unit prices will calculate expected costs.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Report Date</label>
                <Input 
                  type="date" 
                  value={entryDate} 
                  onChange={e => setEntryDate(e.target.value)} 
                  className="h-10 text-xs font-bold border-slate-200 focus:border-[#12715B] rounded-xl"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Main Category</label>
                <select
                  value={entryCategory}
                  onChange={e => setEntryCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 h-10"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Header */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase px-2">
            <div className="col-span-4">Item Name (আইটেম নাম)</div>
            <div className="col-span-2">Quantity (পরিমাণ)</div>
            <div className="col-span-2">Unit (ইউনিট)</div>
            <div className="col-span-2">Per Unit Price (প্রতি ইউনিট দাম)</div>
            <div className="col-span-2 text-right">Actual Total (মোট বিল)</div>
          </div>

          {/* Grid Rows */}
          <div className="space-y-3">
            {entryItems.map((item, idx) => {
              const qty = Number(item.quantity || 0);
              const price = Number(item.per_unit_price || 0);
              const actual = Number(item.actual_total || 0);
              const expected = qty * price;
              const saved = expected - actual;

              return (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 items-center">
                  <div className="col-span-4 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block md:hidden">Item Name</label>
                    <Input 
                      value={item.item_name}
                      onChange={e => updateItemField(idx, "item_name", e.target.value)}
                      placeholder="e.g. Rice, Potato, Fish"
                      className="h-10 text-xs font-bold bg-white border-slate-200 focus:border-[#12715B] rounded-xl"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block md:hidden">Quantity</label>
                    <Input 
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={e => updateItemField(idx, "quantity", e.target.value)}
                      placeholder="e.g. 10"
                      className="h-10 text-xs font-bold bg-white border-slate-200 focus:border-[#12715B] rounded-xl"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block md:hidden">Unit</label>
                    <select
                      value={item.unit}
                      onChange={e => updateItemField(idx, "unit", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none h-10"
                    >
                      <option value="KG">KG</option>
                      <option value="Liter">Liter</option>
                      <option value="Piece">Piece</option>
                      <option value="Hali">Hali (হালি)</option>
                      <option value="Packet">Packet</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block md:hidden">Per Unit Price</label>
                    <Input 
                      type="number"
                      step="any"
                      value={item.per_unit_price}
                      onChange={e => updateItemField(idx, "per_unit_price", e.target.value)}
                      placeholder="e.g. 70"
                      className="h-10 text-xs font-bold bg-white border-slate-200 focus:border-[#12715B] rounded-xl"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase block md:hidden">Actual Total</label>
                      <Input 
                        type="number"
                        step="any"
                        value={item.actual_total}
                        onChange={e => updateItemField(idx, "actual_total", e.target.value)}
                        placeholder="e.g. 650"
                        className="h-10 text-xs font-bold bg-white border-slate-200 focus:border-[#12715B] rounded-xl text-right"
                      />
                    </div>
                    {entryItems.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeEntryItem(idx)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/50 mt-4 md:mt-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Calculations row underneath on mobile */}
                  <div className="col-span-12 flex flex-wrap gap-4 px-2 pt-1.5 border-t border-slate-100 text-[10px] font-extrabold text-slate-500 italic justify-end">
                    <span>Expected Total: ৳{expected.toLocaleString()}</span>
                    <span className={saved >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      Saved: ৳{saved.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addEntryItem}
            className="w-full h-11 rounded-2xl border-dashed border-[#12715B]/40 hover:border-[#12715B]/80 text-[#12715B] font-bold text-xs flex items-center justify-center gap-1 bg-slate-50 hover:bg-white"
          >
            <Plus className="h-4 w-4" /> Add Item (আরেকটি আইটেম যোগ করুন)
          </Button>

          {/* Media upload grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {/* Upload Menu */}
            <div className="p-4 bg-slate-50 rounded-[20px] border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-[#D4AF37]" />
                📷 Upload Menu Image (আজকের মেনু ছবি)
              </label>
              
              <div className="flex items-center gap-3">
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleMenuUpload} 
                  className="hidden"
                  id="menu-file"
                  disabled={uploadingMenu}
                />
                <label 
                  htmlFor="menu-file"
                  className="h-11 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#12715B] bg-white flex items-center justify-center gap-2 text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                >
                  {uploadingMenu ? <Loader2 className="h-4 w-4 animate-spin text-[#12715B]" /> : <Upload className="h-4 w-4" />}
                  {uploadingMenu ? "Uploading..." : "Choose Image (JPG, PNG, WEBP)"}
                </label>
                
                {menuImage && (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border">
                    <img src={menuImage} loading="lazy" className="h-full w-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => setMenuImage("")}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Bill */}
            <div className="p-4 bg-slate-50 rounded-[20px] border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#D4AF37]" />
                🧾 Upload Bill / Receipt (রশিদ বা চালান)
              </label>
              
              <div className="flex items-center gap-3">
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp, application/pdf" 
                  onChange={handleBillUpload} 
                  className="hidden"
                  id="bill-file"
                  disabled={uploadingBill}
                />
                <label 
                  htmlFor="bill-file"
                  className="h-11 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#12715B] bg-white flex items-center justify-center gap-2 text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                >
                  {uploadingBill ? <Loader2 className="h-4 w-4 animate-spin text-[#12715B]" /> : <FileUp className="h-4 w-4" />}
                  {uploadingBill ? "Uploading..." : "Choose File (Image or PDF)"}
                </label>

                {billAttachment && (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="h-4 w-4 bg-emerald-50 rounded-full p-0.5 border" />
                    Attachment Added!
                    <button 
                      type="button" 
                      onClick={() => setBillAttachment("")}
                      className="text-red-500 hover:text-red-700 ml-1 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="bg-slate-50 p-5 rounded-[20px] border flex flex-col md:flex-row md:items-center justify-between gap-4 font-bold text-slate-800">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Grand Total (মোট খরচ)</span>
                <span className="text-lg font-black text-slate-800">৳{calculations.grandTotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Saved Amount (সাশ্রয়)</span>
                <span className="text-lg font-black text-emerald-600">৳{calculations.totalSaved.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              {editingReport && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingReport(null);
                    setActiveSubTab("history");
                  }}
                  className="rounded-xl text-xs font-bold h-11"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={submittingExpense}
                className="h-11 rounded-xl bg-[#12715B] text-white hover:bg-[#0e5c4a] font-bold text-xs px-6 gap-2"
              >
                {submittingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {editingReport ? "Update Daily Report" : "Submit Daily Report"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab Contents: 3. EXPENSE HISTORY */}
      {activeSubTab === "history" && (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-6 shadow-md">
          {/* Header & Export controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 font-serif">
                📋 Boarding Expense History
              </h3>
              <p className="text-xs text-slate-500 italic mt-0.5">
                List of submitted boarding logs. Select a date range or export lists.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl border-slate-200"
              >
                <Printer className="h-4 w-4 text-slate-500" /> Print
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl border-slate-200"
              >
                <Download className="h-4 w-4 text-slate-500" /> Excel CSV
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={historyFilter}
              onChange={e => setHistoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 h-9"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {historyFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Input 
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="h-9 text-xs font-semibold rounded-xl border-slate-200"
                />
                <span className="text-xs text-slate-400 font-bold">to</span>
                <Input 
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="h-9 text-xs font-semibold rounded-xl border-slate-200"
                />
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="overflow-x-auto border rounded-[20px]">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase select-none">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  {currentUser.role === "admin" && <th className="py-3 px-4">Branch</th>}
                  <th className="py-3 px-4">Manager Name</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Saved Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {dateFilteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-black">{report.date}</td>
                    {currentUser.role === "admin" && (
                      <td className="py-3 px-4">
                        {branches.find(b => String(b.id) === String(report.branch_id))?.name_bn || "Branch"}
                      </td>
                    )}
                    <td className="py-3 px-4">{report.manager_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">৳{report.grand_total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">৳{report.total_saved_amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        report.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                        report.status === "Rejected" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="xs"
                        onClick={() => setSelectedReportDetails(report)}
                        className="rounded-lg h-7 font-bold gap-1 text-slate-600 bg-slate-50 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                      
                      {(currentUser.role === "admin" || currentUser.role === "branch_admin" || report.status === "Pending") && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleEditReport(report)}
                            className="rounded-lg h-7 font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleDeleteReport(report.id)}
                            className="rounded-lg h-7 font-bold text-red-600 bg-red-50/50 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {dateFilteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      No reports found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: 4. MENU GALLERY */}
      {activeSubTab === "gallery" && (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-6 shadow-md">
          <div>
            <h3 className="text-lg font-black text-slate-800 font-serif">
              📋 Boarding Menu Gallery
            </h3>
            <p className="text-xs text-slate-500 italic mt-0.5">
              Historical gallery of daily cooking menus. Private access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredReports.filter(r => r.menu_image_url).map(report => (
              <div key={report.id} className="border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between bg-slate-50">
                <div className="h-44 w-full bg-slate-200 overflow-hidden relative">
                  <img src={report.menu_image_url} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {report.date}
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    {branches.find(b => String(b.id) === String(report.branch_id))?.name_bn || "Branch"}
                  </p>
                  <p className="text-xs font-bold text-slate-700">Uploaded By: {report.manager_name}</p>
                </div>
              </div>
            ))}
            {filteredReports.filter(r => r.menu_image_url).length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 italic">
                No menu images uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: 5. BOARDING ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-6 shadow-md">
          <div>
            <h3 className="text-lg font-black text-slate-800 font-serif">
              📈 Boarding Analytics & Expenditure Trends
            </h3>
            <p className="text-xs text-slate-500 italic mt-0.5">
              Historical trend charts of food costs, savings, and expense comparisons
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Expense & Saving Line Chart */}
            <Card className="p-4 border-slate-100 bg-white rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#052E2B] uppercase tracking-wider">Daily Expense vs Savings Trend (Last 15 logs)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.daily}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fontSize: 9}} />
                    <YAxis tick={{fontSize: 9}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 10}} />
                    <Area type="monotone" dataKey="expense" name="Actual Expense" stroke="#8884d8" fillOpacity={1} fill="url(#colorExpense)" />
                    <Area type="monotone" dataKey="savings" name="Saved Amount" stroke="#00C49F" fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly Cumulative Bar Chart */}
            <Card className="p-4 border-slate-100 bg-white rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#052E2B] uppercase tracking-wider">Monthly Expense and Saving Distribution</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{fontSize: 9}} />
                    <YAxis tick={{fontSize: 9}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 10}} />
                    <Bar dataKey="expense" name="Actual Total Spent" fill="#12715B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="savings" name="Saved Total" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Category Pie Chart */}
            <Card className="p-4 border-slate-100 bg-white rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#052E2B] uppercase tracking-wider">Category Wise Boarding Expense Share</h4>
              <div className="h-64 w-full flex items-center justify-center">
                {chartData.categories.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No category data available</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Expense vs Savings Trend (Line combo) */}
            <Card className="p-4 border-slate-100 bg-white rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#052E2B] uppercase tracking-wider">Expense Saving Curve Relationship</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fontSize: 9}} />
                    <YAxis tick={{fontSize: 9}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 10}} />
                    <Line type="monotone" dataKey="expense" name="Actual Total Price" stroke="#FF8042" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="savings" name="Saved Amount" stroke="#0088FE" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Contents: 6. APPROVALS QUEUE */}
      {activeSubTab === "approvals" && (currentUser.role === "admin" || currentUser.role === "branch_admin") && (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-6 shadow-md">
          <div>
            <h3 className="text-lg font-black text-slate-800 font-serif">
              🛡️ Boarding Expense Approval Queue
            </h3>
            <p className="text-xs text-slate-500 italic mt-0.5">
              Review and approve daily boarding expense submissions from managers.
            </p>
          </div>

          <div className="overflow-x-auto border rounded-[20px]">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase select-none">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Manager Name</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Approve / Reject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredReports.filter(r => r.status === "Pending").map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-black">{report.date}</td>
                    <td className="py-3 px-4">
                      {branches.find(b => String(b.id) === String(report.branch_id))?.name_bn || "Branch"}
                    </td>
                    <td className="py-3 px-4">{report.manager_name}</td>
                    <td className="py-3 px-4 text-right font-bold">৳{report.grand_total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="xs"
                        onClick={() => setSelectedReportDetails(report)}
                        className="rounded-lg h-7 font-bold text-slate-600 bg-slate-50"
                      >
                        View Items
                      </Button>
                      <Button 
                        size="xs"
                        onClick={() => handleApproval(report.id, "Approved")}
                        className="rounded-lg h-7 font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="xs"
                        onClick={() => handleApproval(report.id, "Rejected")}
                        className="rounded-lg h-7 font-bold text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredReports.filter(r => r.status === "Pending").length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      There are no boarding reports pending approval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT DETAILS DIALOG */}
      <Dialog open={!!selectedReportDetails} onOpenChange={() => setSelectedReportDetails(null)}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#052E2B] flex items-center justify-between border-b pb-2">
              <span>Boarding Log details - {selectedReportDetails?.date}</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                selectedReportDetails?.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                selectedReportDetails?.status === "Rejected" ? "bg-red-50 text-red-700" :
                "bg-amber-50 text-amber-700"
              }`}>
                {selectedReportDetails?.status}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedReportDetails && (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border font-bold">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Grand Total</span>
                  <span className="text-sm font-black text-slate-800">৳{selectedReportDetails.grand_total.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Saved Amount</span>
                  <span className="text-sm font-black text-emerald-600">৳{selectedReportDetails.total_saved_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Itemized Breakdown</h4>
                <div className="border rounded-xl overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Per Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Expected Total</th>
                        <th className="py-2.5 px-3 text-right">Actual Total</th>
                        <th className="py-2.5 px-3 text-right">Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allExpenses.filter(e => e.report_id === selectedReportDetails.id).map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold">{item.item_name}</td>
                          <td className="py-2.5 px-3">{item.quantity} {item.unit || "KG"}</td>
                          <td className="py-2.5 px-3">৳{item.per_unit_price}</td>
                          <td className="py-2.5 px-3 text-right">৳{item.expected_total.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">৳{item.actual_total.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600">৳{item.saved_amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Media gallery Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedReportDetails.menu_image_url && (
                  <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Daily Menu Image</span>
                    <a href={selectedReportDetails.menu_image_url} target="_blank" rel="noreferrer" className="block h-44 w-full rounded-lg overflow-hidden border">
                      <img src={selectedReportDetails.menu_image_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                    </a>
                  </div>
                )}
                {selectedReportDetails.bill_attachment_url && (
                  <div className="p-3 bg-slate-50 rounded-xl border space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Bill Attachment</span>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Invoice or receipt documentation</p>
                    </div>
                    <Button 
                      onClick={() => window.open(selectedReportDetails.bill_attachment_url, "_blank")}
                      className="w-full bg-[#12715B] text-white hover:bg-[#0e5c4a] rounded-xl text-xs font-bold h-9 mt-4 gap-1.5"
                    >
                      <Eye className="h-4 w-4" /> Open Attachment / PDF
                    </Button>
                  </div>
                )}
              </div>

              {/* Audit Logs */}
              <div className="p-3 bg-slate-50/50 rounded-xl border space-y-1.5 text-[10px] text-slate-500 font-bold">
                <div className="flex justify-between">
                  <span>Created By: {selectedReportDetails.created_by || "System"}</span>
                  <span>Time: {selectedReportDetails.created_date ? new Date(selectedReportDetails.created_date).toLocaleString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated By: {selectedReportDetails.updated_by || "System"}</span>
                  <span>Time: {selectedReportDetails.updated_date ? new Date(selectedReportDetails.updated_date).toLocaleString() : "N/A"}</span>
                </div>
                {selectedReportDetails.approved_by && (
                  <div className="flex justify-between border-t pt-1.5 mt-1.5 text-emerald-700">
                    <span>Approved By: {selectedReportDetails.approved_by}</span>
                    <span>Time: {selectedReportDetails.approved_date ? new Date(selectedReportDetails.approved_date).toLocaleString() : "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
