import React, { useState, useEffect, useMemo, useCallback } from "react";
import { appClient } from "@/api/appClient";
import { supabaseAdmin } from "@/lib/supabase-admin-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2, Pencil, Trash2, GraduationCap,
  Download, Search, Printer, FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";
import { isStudentInClassOption } from "@/lib/academic";

const currentMonth = format(new Date(), "yyyy-MM");

const formatPaymentDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return format(new Date(year, month, day), 'dd MMM yyyy');
    }
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch (e) {
    return dateStr;
  }
};

const numberToWords = (num) => {
  const rounded = Math.round(Number(num) || 0);
  if (rounded === 0) return 'Zero Taka Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  let valStr = rounded.toString();
  if (valStr.length > 9) return 'Overflow';
  const n = ('000000000' + valStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
  str += (Number(n[4]) != 0) ? a[Number(n[4])] + ' Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' Taka Only' : 'Taka Only';
  return str.trim();
};

const MONTHS_LIST = [
  { key: "01", name: "Jan" },
  { key: "02", name: "Feb" },
  { key: "03", name: "Mar" },
  { key: "04", name: "Apr" },
  { key: "05", name: "May" },
  { key: "06", name: "Jun" },
  { key: "07", name: "Jul" },
  { key: "08", name: "Aug" },
  { key: "09", name: "Sep" },
  { key: "10", name: "Oct" },
  { key: "11", name: "Nov" },
  { key: "12", name: "Dec" }
];

export default function StudentFees({ students = [], currentUser }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("collection");
  const [tab, setTab] = useState("student");

  // Sub-tabs state inside collection dues
  const [studentActiveTab, setStudentActiveTab] = useState("pay");

  // Query branches
  const { data: branches = [], refetch: refetchBranches } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const getClassNameStr = (c) => c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";

  const getClassOptions = useCallback((branch) => {
    if (!branch || !Array.isArray(branch.academic_structure)) return [];
    return branch.academic_structure.map(c => {
      const name = getClassNameStr(c);
      return { id: String(c.id), class_name: c.class_name, label: name || "Unnamed Class" };
    });
  }, []);

  // Query student payments (fees)
  const { data: studentPayments = [], refetch: refetchPayments } = useQuery({
    queryKey: ["student-payments"],
    queryFn: () => appClient.entities.Fee.listAll({ sort: "-month" }),
  });

  const currentYear = new Date().getFullYear().toString();
  const currentMonthNumber = format(new Date(), "MM");

  // Fee Collection States (Sub-tab 1)
  const [payBranchId, setPayBranchId] = useState(currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : "");
  const [payClassId, setPayClassId] = useState("");
  const [paySessionId, setPaySessionId] = useState("");
  const [payGroupId, setPayGroupId] = useState("");
  const [payStudentId, setPayStudentId] = useState("");
  const [feeStudentSearch, setFeeStudentSearch] = useState("");
  const [payMonth, setPayMonth] = useState(currentMonthNumber);
  const [payYear, setPayYear] = useState(currentYear);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payTxnId, setPayTxnId] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [lastRecordedPayment, setLastRecordedPayment] = useState(null);

  // Sub-tab 2: Dues List Filters
  const [dueBranchId, setDueBranchId] = useState(currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : "all_branches");
  const [dueClassId, setDueClassId] = useState("all_classes");
  const [dueSessionId, setDueSessionId] = useState("");
  const [dueGroupId, setDueGroupId] = useState("");
  const [dueMonth, setDueMonth] = useState(currentMonthNumber);
  const [dueYear, setDueYear] = useState(currentYear);
  const [dueSearch, setDueSearch] = useState("");
  const [dueFilterStatus, setDueFilterStatus] = useState("all");
  const [dueViewType, setDueViewType] = useState("monthly");

  // Quick Action Modal (Fee grid collector)
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);

  // Sub-tab 3: Config Setup States
  const [profileBranch, setProfileBranch] = useState("all_branches");
  const [profileClass, setProfileClass] = useState("all_classes");
  const [profileSessionId, setProfileSessionId] = useState("");
  const [profileGroupId, setProfileGroupId] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [editingStudentProfile, setEditingStudentProfile] = useState(null);
  const [predefinedFeeInput, setPredefinedFeeInput] = useState("");

  // Sub-tab 4: Reports Builder States
  const [repType, setRepType] = useState("ledger");
  const [repBranch, setRepBranch] = useState("all_branches");
  const [repClass, setRepClass] = useState("all_classes");
  const [repStudentId, setRepStudentId] = useState("");
  const [repMonth, setRepMonth] = useState(currentMonthNumber);
  const [repYear, setRepYear] = useState(currentYear);
  const [repDateFrom, setRepDateFrom] = useState("");
  const [repDateTo, setRepDateTo] = useState("");
  const [repSessionId, setRepSessionId] = useState("");
  const [repGroupId, setRepGroupId] = useState("");

  // Auto-set branch for branch_admin across all sub-tabs
  useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      const branchId = String(currentUser.branch_id);
      setPayBranchId(branchId);
      setDueBranchId(branchId);
      setProfileBranch(branchId);
      setRepBranch(branchId);
    }
  }, [currentUser]);

  // Get active branch options
  const activeBranches = useMemo(() => {
    return branches;
  }, [branches]);

  const getClassOptionsForBranch = useCallback((branchId) => {
    const branch = branches.find(b => String(b.id) === String(branchId));
    return getClassOptions(branch);
  }, [branches, getClassOptions]);

  const allClassOptions = useMemo(() => {
    const list = [];
    branches.forEach(branch => {
      list.push(...getClassOptions(branch));
    });
    return list;
  }, [branches, getClassOptions]);

  const payClassesOptions = useMemo(() => {
    return getClassOptionsForBranch(payBranchId);
  }, [payBranchId, getClassOptionsForBranch]);

  const dueClassesOptions = useMemo(() => {
    return getClassOptionsForBranch(dueBranchId);
  }, [dueBranchId, getClassOptionsForBranch]);

  const profileClassesOptions = useMemo(() => {
    return getClassOptionsForBranch(profileBranch);
  }, [profileBranch, getClassOptionsForBranch]);

  const repClassesOptions = useMemo(() => {
    return getClassOptionsForBranch(repBranch);
  }, [repBranch, getClassOptionsForBranch]);

  // Helper to get current class object for session/group options
  const getCurrentClass = useCallback((branchId, classId) => {
    if (!classId) return null;
    const branch = branches.find(b => String(b.id) === String(branchId));
    if (!branch || !Array.isArray(branch.academic_structure)) return null;
    return branch.academic_structure.find(c => String(c.id) === String(classId)) || null;
  }, [branches]);

  const paySessions = useMemo(() => {
    const cls = getCurrentClass(payBranchId, payClassId);
    return cls?.sections || [];
  }, [payBranchId, payClassId, getCurrentClass]);

  const payGroups = useMemo(() => {
    const cls = getCurrentClass(payBranchId, payClassId);
    return cls?.groups || [];
  }, [payBranchId, payClassId, getCurrentClass]);

  const dueSessions = useMemo(() => {
    const cls = getCurrentClass(dueBranchId, dueClassId);
    return cls?.sections || [];
  }, [dueBranchId, dueClassId, getCurrentClass]);

  const dueGroups = useMemo(() => {
    const cls = getCurrentClass(dueBranchId, dueClassId);
    return cls?.groups || [];
  }, [dueBranchId, dueClassId, getCurrentClass]);

  const profileSessions = useMemo(() => {
    const cls = getCurrentClass(profileBranch, profileClass);
    return cls?.sections || [];
  }, [profileBranch, profileClass, getCurrentClass]);

  const profileGroups = useMemo(() => {
    const cls = getCurrentClass(profileBranch, profileClass);
    return cls?.groups || [];
  }, [profileBranch, profileClass, getCurrentClass]);

  const repSessions = useMemo(() => {
    const cls = getCurrentClass(repBranch, repClass);
    return cls?.sections || [];
  }, [repBranch, repClass, getCurrentClass]);

  const repGroups = useMemo(() => {
    const cls = getCurrentClass(repBranch, repClass);
    return cls?.groups || [];
  }, [repBranch, repClass, getCurrentClass]);

  // Inline Payout Auto-Calculation (Collection Form)
  const selectedStudent = useMemo(() => {
    if (!payStudentId) return null;
    return students.find(s => String(s.id) === String(payStudentId));
  }, [students, payStudentId]);

  const studentPredefinedFee = useMemo(() => {
    if (!selectedStudent) return 0;
    try {
      const parsed = selectedStudent.custom_fields ? JSON.parse(selectedStudent.custom_fields) : {};
      return Number(parsed.fees_setup?.["Monthly Tuition Fee"]) || 0;
    } catch {
      return 0;
    }
  }, [selectedStudent]);

  // Find existing recorded payments for the selected student & month
  const selectedStudentPayment = useMemo(() => {
    if (!payStudentId) return null;
    const monthKey = `${payYear}-${payMonth}`;
    return studentPayments.find(p => String(p.student_id) === String(payStudentId) && p.month === monthKey && !p.is_archived);
  }, [studentPayments, payStudentId, payMonth, payYear]);

  const payPaidSoFar = selectedStudentPayment ? Number(selectedStudentPayment.paid_amount || 0) : 0;
  const payRemainingDue = selectedStudentPayment ? Number(selectedStudentPayment.due_amount || 0) : studentPredefinedFee;

  // Auto-populate when student is selected
  useEffect(() => {
    if (selectedStudent) {
      setPayAmount(String(Math.max(0, studentPredefinedFee - payPaidSoFar)));
    } else {
      setPayAmount("");
    }
    setLastRecordedPayment(null);
  }, [payStudentId, payMonth, payYear, studentPayments, studentPredefinedFee, payPaidSoFar]);

  const latestPayRecord = useMemo(() => {
    if (!payStudentId) return null;
    return [...studentPayments]
      .filter(p => String(p.student_id) === String(payStudentId) && p.payment_date && !p.is_archived)
      .sort((a, b) => b.payment_date.localeCompare(a.payment_date))[0];
  }, [studentPayments, payStudentId]);

  // Student Fee Mutations
  const createPaymentMutation = useMutation({
    mutationFn: async (d) => {
      const { data, error } = await supabaseAdmin
        .from('student_fees')
        .upsert(
          {
            student_id: d.student_id,
            month: d.month,
            total_fee: d.total_fee,
            paid_amount: d.paid_amount,
            due_amount: d.due_amount,
            amount: d.amount,
            payment_method: d.payment_method,
            transaction_id: d.transaction_id,
            payment_date: d.payment_date,
            status: d.status,
            notes: d.notes,
            student_name: d.student_name,
            roll_number: d.roll_number,
            branch_name: d.branch_name,
            class_name: d.class_name
          },
          {
            onConflict: 'student_id,month'
          }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fees-overview"] });
      toast.success("Fee collection recorded successfully!");
      refetchPayments();
      setLastRecordedPayment(data);
    },
    onError: (err) => toast.error(err?.message || "Failed to record fee payment")
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.Fee.update(id, d),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fees-overview"] });
      toast.success("Fee record updated successfully!");
      refetchPayments();
      setLastRecordedPayment(data);
    },
    onError: (err) => toast.error(err?.message || "Failed to update fee record")
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id) => appClient.entities.Fee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fees-overview"] });
      toast.success("Fee record deleted successfully!");
      refetchPayments();
    },
    onError: (err) => toast.error(err?.message || "Failed to delete fee record")
  });

  const updatePredefinedFeeMutation = useMutation({
    mutationFn: async ({ studentId, tuitionFee }) => {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('custom_fields')
        .eq('id', studentId)
        .single();

      let customFields = {};
      try {
        customFields = student?.custom_fields ? JSON.parse(student.custom_fields) : {};
      } catch {}

      customFields.fees_setup = {
        ...(customFields.fees_setup || {}),
        "Monthly Tuition Fee": Number(tuitionFee)
      };

      const { data, error } = await supabaseAdmin
        .from('students')
        .update({
          custom_fields: JSON.stringify(customFields)
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast.success("Tuition fee contract saved successfully!");
      setShowAddFeeModal(false);
      setEditingStudentProfile(null);
      setPredefinedFeeInput("");
    },
    onError: (err) => toast.error(err?.message || "Failed to save fee contract")
  });

  const handlePrintReceipt = (payment) => {
    if (!payment) return;
    
    const student = students.find(s => String(s.id) === String(payment.student_id));
    const branch = branches.find(b => String(b.id) === String(payment.branch_id || student?.branch_id));
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker blocked the receipt print window. Please allow popups.");
      return;
    }
    
    const instName = "রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE";
    const receiptNo = payment.receipt_no || `REC-${payment.id.toString().padStart(6, '0')}`;
    const paymentDateStr = formatPaymentDate(payment.payment_date || payment.created_date?.split('T')[0]);
    const studentName = payment.student_name || student?.full_name_en || "N/A";
    const rollNo = payment.roll_number || student?.roll_number || "—";
    const branchNameStr = payment.branch_name || branch?.name_en || "N/A";
    const classNameStr = payment.class_name || student?.class_name || "—";
    
    let sectionLabel = "";
    if (student && branch && Array.isArray(branch.academic_structure)) {
      const clsObj = branch.academic_structure.find(c => String(c.id) === String(student.class_id));
      if (clsObj) {
        if (clsObj.sections && clsObj.sections.length > 0) {
          const secObj = clsObj.sections.find(s => String(s.id) === String(student.class_id));
          if (secObj) {
            sectionLabel = secObj.section_name?.en || secObj.section_name?.bn || secObj.section?.en || secObj.section?.bn || "";
          }
        }
      }
    }
    const classSectionDisplay = classNameStr + (sectionLabel ? ` (${sectionLabel})` : "");
    const sessionStr = student?.session || "—";
    
    const feeType = payment.fee_type || "Monthly Tuition Fee";
    const paidAmount = Number(payment.amount || payment.paid_amount || 0);
    const totalPaidCumulative = Number(payment.paid_amount || 0);
    const totalFee = Number(payment.total_fee || 0);
    const dueAmount = Number(payment.due_amount || 0);
    const discount = Number(payment.discount || 0);

    const previousPaid = Math.max(0, totalPaidCumulative - paidAmount);
    const previousDue = Math.max(0, totalFee - previousPaid);
    
    const collectedBy = currentUser?.loginId || currentUser?.email || "System Admin";
    const amountInWords = numberToWords(paidAmount);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              margin: 0;
              padding: 30px;
              color: #1e293b;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              max-width: 700px;
              margin: 0 auto;
              position: relative;
              background: #fff;
            }
            @media print {
              body {
                padding: 0;
                background: transparent;
              }
              .receipt-card {
                border: none;
                box-shadow: none;
                padding: 0;
                max-width: 100%;
              }
              @page {
                size: auto;
                margin: 10mm;
              }
            }
            .receipt-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #052E2B;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .logo-wrap {
              width: 55px;
              height: 55px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo-wrap img {
              max-height: 100%;
              max-width: 100%;
              object-fit: contain;
            }
            .logo-placeholder {
              width: 55px;
              height: 55px;
              border-radius: 50%;
              background: #052E2B;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 22px;
            }
            .inst-details {
              text-align: center;
              flex: 1;
              margin: 0 15px;
            }
            .inst-details h1 {
              margin: 0;
              font-size: 20px;
              color: #052E2B;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .inst-details h2 {
              margin: 2px 0 0;
              font-size: 11px;
              color: #b45309;
              text-transform: uppercase;
              font-weight: 600;
            }
            .branch-info {
              margin: 4px 0 0;
              font-size: 9px;
              color: #64748b;
              line-height: 1.3;
            }
            .receipt-title {
              text-align: center;
              margin: 15px 0;
            }
            .receipt-title span {
              background: #052E2B;
              color: white;
              padding: 5px 16px;
              border-radius: 9999px;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .grid-container {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-section {
              border: 1px solid #f1f5f9;
              border-radius: 8px;
              padding: 10px 14px;
              background-color: #f8fafc;
            }
            .info-section h3 {
              margin: 0 0 6px 0;
              font-size: 10px;
              color: #052E2B;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              font-weight: 700;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 11px;
              line-height: 1.3;
            }
            .info-label {
              color: #64748b;
              font-weight: 500;
            }
            .info-value {
              color: #1e293b;
              font-weight: 600;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 11px;
            }
            .details-table th, .details-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
            }
            .details-table th {
              background: #052E2B;
              color: white;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9px;
            }
            .details-table td {
              color: #334155;
            }
            .text-right {
              text-align: right;
            }
            .words-row {
              font-size: 10px;
              color: #475569;
              margin-bottom: 15px;
              font-style: italic;
              border-bottom: 1px dashed #cbd5e1;
              padding-bottom: 8px;
            }
            .totals-wrap {
              float: right;
              width: 250px;
              margin-bottom: 15px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              padding: 4px 0;
              font-weight: 600;
            }
            .totals-label {
              color: #475569;
            }
            .totals-value {
              text-align: right;
              color: #1e293b;
            }
            .grand-total {
              font-size: 13px;
              color: #052E2B;
              border-top: 1.5px solid #052E2B;
              padding-top: 6px;
              font-weight: 700;
            }
            .notes-section {
              clear: both;
              margin-top: 15px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              font-size: 10px;
              color: #64748b;
            }
            .signatures-container {
              margin-top: 45px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
            }
            .signature-box {
              text-align: center;
              width: 160px;
            }
            .signature-line {
              border-top: 1px solid #94a3b8;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <!-- Header -->
            <div class="receipt-header">
              <div class="logo-wrap">
                <img src="${window.location.origin}/rahmania-logo-v2.png" loading="lazy" alt="Logo" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'logo-placeholder\\'>RI</div>'">
              </div>
              <div class="inst-details">
                <h1>রহমানিয়া ইনস্টিটিউট</h1>
                <h2>{typeof window !== 'undefined' && sessionStorage.getItem('active_tenant_slug') && sessionStorage.getItem('active_tenant_slug') !== 'rahmania' ? sessionStorage.getItem('active_tenant_slug').toUpperCase() : "Rahmania Institute"}</h2>
                <p class="branch-info">
                  <strong>${branchNameStr}</strong><br/>
                  Address: ${branch?.address_en || "N/A"} • Phone: ${branch?.phone || "N/A"}
                </p>
              </div>
              <div style="width: 55px;"></div>
            </div>

            <!-- Title -->
            <div class="receipt-title">
              <span>Payment Receipt / ফি আদায় রশিদ</span>
            </div>

            <!-- Metadata Grids -->
            <div class="grid-container">
              <!-- Student Info -->
              <div class="info-section">
                <h3>Student Information</h3>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${studentName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ID / Roll No:</span>
                  <span class="info-value">${rollNo}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Class:</span>
                  <span class="info-value">${classSectionDisplay}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Session:</span>
                  <span class="info-value">${sessionStr}</span>
                </div>
              </div>

              <!-- Receipt Metadata -->
              <div class="info-section">
                <h3>Receipt Information</h3>
                <div class="info-row">
                  <span class="info-label">Receipt No:</span>
                  <span class="info-value" style="font-family: monospace;">${receiptNo}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${paymentDateStr}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${payment.payment_method || "—"}</span>
                </div>
                ${payment.transaction_id ? `
                <div class="info-row">
                  <span class="info-label">Transaction ID:</span>
                  <span class="info-value" style="font-family: monospace;">${payment.transaction_id}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Details Table -->
            <table class="details-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Billed Amount</th>
                  <th class="text-right">Discount</th>
                  <th class="text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${feeType} - Month: ${payment.month}</td>
                  <td class="text-right">৳${totalFee.toLocaleString()}</td>
                  <td class="text-right">৳${discount.toLocaleString()}</td>
                  <td class="text-right">৳${paidAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <!-- Words & Totals -->
            <div class="words-row">
              <strong>Amount in Words:</strong> ${amountInWords}
            </div>

            <div class="totals-wrap">
              <div class="totals-row">
                <span class="totals-label">Total Monthly Fee:</span>
                <span class="totals-value">৳${totalFee.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Previous Due:</span>
                <span class="totals-value">৳${previousDue.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Current Paid:</span>
                <span class="totals-value">৳${paidAmount.toLocaleString()}</span>
              </div>
              <div class="totals-row grand-total">
                <span class="totals-label">Remaining Due:</span>
                <span class="totals-value">৳${dueAmount.toLocaleString()}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="notes-section">
              <strong>Notes / Remarks:</strong> ${payment.notes || "No additional remarks."}<br/>
              <span style="font-size: 8px; color: #94a3b8; display: block; margin-top: 6px;">Collected by: ${collectedBy} • Generated on: ${new Date().toLocaleString()}</span>
            </div>

            <!-- Signatures -->
            <div class="signatures-container">
              <div class="signature-box">
                <div class="signature-line"></div>
                <span>Student / Parent Signature</span>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <span>Authorized Officer Signature</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
    
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch (e) {}
    }, 500);
  };

  // Handle Save Payout Submission
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!payStudentId) return toast.error("Please select a student");
    if (!payAmount || Number(payAmount) < 0) return toast.error("Please enter a valid amount");

    const amountPaid = Number(payAmount);
    const newPaidAmount = payPaidSoFar + amountPaid;
    const newDueAmount = Math.max(0, studentPredefinedFee - newPaidAmount);

    let status = "Due";
    if (newPaidAmount >= studentPredefinedFee) {
      status = "Paid";
    } else if (newPaidAmount > 0) {
      status = "Partial";
    }

    const selectedMonthKey = `${payYear}-${payMonth}`;
    const currentMonthKey = `${new Date().getFullYear()}-${currentMonthNumber}`;
    if (selectedMonthKey < currentMonthKey && newPaidAmount < studentPredefinedFee) {
      status = "Overdue";
    }

    const branch = branches.find(b => String(b.id) === String(selectedStudent.branch_id));
    const cls = allClassOptions.find(c => String(c.id) === String(selectedStudent.class_id));

    const payload = {
      student_id: Number(payStudentId),
      month: selectedMonthKey,
      total_fee: studentPredefinedFee,
      paid_amount: newPaidAmount,
      due_amount: newDueAmount,
      amount: amountPaid,
      payment_method: payMethod,
      transaction_id: payTxnId,
      payment_date: payDate,
      status: status,
      notes: payNotes,
      student_name: selectedStudent.full_name_en,
      roll_number: selectedStudent.roll_number,
      branch_name: branch ? (branch.name_en || branch.branch_name) : "",
      class_name: selectedStudent.class_name || (cls ? cls.class_name?.en : "")
    };

    if (selectedStudentPayment) {
      updatePaymentMutation.mutate({ id: selectedStudentPayment.id, d: payload }, {
        onSuccess: (data) => {
          setPayTxnId("");
          setPayNotes("");
        }
      });
    } else {
      // Check for duplicate payment before saving!
      const existing = await supabaseAdmin
        .from('student_fees')
        .select('id')
        .eq('student_id', Number(payStudentId))
        .eq('month', selectedMonthKey)
        .maybeSingle();

      if (existing.data) {
        toast.error('Already Paid for this month');
        return;
      }

      createPaymentMutation.mutate(payload, {
        onSuccess: (data) => {
          setPayTxnId("");
          setPayNotes("");
        }
      });
    }
  };

  const handleSavePaymentQuick = async (paymentData) => {
    const row = selectedPaymentRow;
    if (!row) return;

    const amountPaid = Number(paymentData.amount);
    const newPaidAmount = (row.paidAmount || 0) + amountPaid;
    const newDueAmount = Math.max(0, row.monthlyFee - newPaidAmount);

    let status = "Due";
    if (newPaidAmount >= row.monthlyFee) {
      status = "Paid";
    } else if (newPaidAmount > 0) {
      status = "Partial";
    }

    const rowMonth = row.month || dueMonth;
    const rowYear = row.year || dueYear;

    const selectedMonthKey = `${rowYear}-${rowMonth}`;
    const currentMonthKey = `${new Date().getFullYear()}-${currentMonthNumber}`;
    if (selectedMonthKey < currentMonthKey && newPaidAmount < row.monthlyFee) {
      status = "Overdue";
    }

    const branch = branches.find(b => String(b.id) === String(row.student.branch_id));
    const cls = allClassOptions.find(c => String(c.id) === String(row.student.class_id));

    const payload = {
      student_id: Number(row.student.id),
      month: selectedMonthKey,
      total_fee: row.monthlyFee,
      paid_amount: newPaidAmount,
      due_amount: newDueAmount,
      amount: amountPaid,
      payment_method: paymentData.payment_method,
      payment_date: paymentData.payment_date,
      transaction_id: paymentData.transaction_id,
      status: status,
      notes: paymentData.notes,
      student_name: row.student.full_name_en,
      roll_number: row.student.roll_number,
      branch_name: branch ? (branch.name_en || branch.branch_name) : "",
      class_name: row.student.class_name || (cls ? cls.class_name?.en : "")
    };

    if (row.payment) {
      updatePaymentMutation.mutate({ id: row.payment.id, d: payload }, {
        onSuccess: (data) => {
          setShowCollectModal(false);
          setSelectedPaymentRow(null);
        }
      });
    } else {
      // Check for duplicate payment before saving!
      const existing = await supabaseAdmin
        .from('student_fees')
        .select('id')
        .eq('student_id', Number(row.student.id))
        .eq('month', selectedMonthKey)
        .maybeSingle();

      if (existing.data) {
        toast.error('Already Paid for this month');
        return;
      }

      createPaymentMutation.mutate(payload, {
        onSuccess: (data) => {
          setShowCollectModal(false);
          setSelectedPaymentRow(null);
        }
      });
    }
  };

  // Compile Due List Grid Data
  const dueGridData = useMemo(() => {
    // Filter active students by branch and class
    let list = students.filter(s => s.status === "active");

    if (dueBranchId !== "all_branches") {
      list = list.filter(s => String(s.branch_id) === String(dueBranchId));
    }
    if (dueClassId && dueClassId !== "all_classes") {
      const selectedDueBranch = branches.find(b => String(b.id) === String(dueBranchId));
      list = list.filter(s => {
        const branchObj = dueBranchId === "all_branches" ? branches.find(b => String(b.id) === String(s.branch_id)) : selectedDueBranch;
        const classFilter = dueSessionId || dueClassId;
        return isStudentInClassOption(s, classFilter, branchObj?.academic_structure);
      });
    }
    if (dueGroupId) {
      list = list.filter(s => String(s.class_group_id) === String(dueGroupId));
    }
    if (dueSearch) {
      const q = dueSearch.toLowerCase();
      list = list.filter(s =>
        s.full_name_en?.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    }

    return list.map(student => {
      let monthlyFee = 0;
      try {
        const parsed = student.custom_fields ? JSON.parse(student.custom_fields) : {};
        monthlyFee = Number(parsed.fees_setup?.["Monthly Tuition Fee"]) || 0;
      } catch {}

      const monthlyDues = {};
      let totalDueSum = 0;

      MONTHS_LIST.forEach(m => {
        const monthKey = `${dueYear}-${m.key}`;
        const record = studentPayments.find(p => String(p.student_id) === String(student.id) && p.month === monthKey && !p.is_archived);

        if (record) {
          monthlyDues[m.key] = record.due_amount || 0;
        } else {
          // If no record exists, they owe the default tuition fee
          monthlyDues[m.key] = monthlyFee;
        }
        totalDueSum += monthlyDues[m.key];
      });

      return {
        student,
        monthlyFee,
        monthlyDues,
        totalDueSum
      };
    }).filter(row => {
      if (dueFilterStatus === "due") return row.totalDueSum > 0;
      if (dueFilterStatus === "paid") return row.totalDueSum === 0;
      return true;
    });
  }, [students, studentPayments, dueBranchId, dueClassId, dueSessionId, dueGroupId, dueYear, dueSearch, dueFilterStatus]);

  const dueMonthlyData = useMemo(() => {
    const monthKey = `${dueYear}-${dueMonth}`;
    return dueGridData.map(row => {
      const record = studentPayments.find(p => String(p.student_id) === String(row.student.id) && p.month === monthKey && !p.is_archived);
      return {
        student: row.student,
        monthlyFee: row.monthlyFee,
        paidAmount: record ? (record.paid_amount || 0) : 0,
        dueAmount: record ? (record.due_amount || 0) : row.monthlyFee,
        paymentDate: record ? record.payment_date : null,
        paymentMethod: record ? record.payment_method : null,
        transactionId: record ? record.transaction_id : null,
        status: record ? record.status : (row.monthlyFee > 0 ? "Due" : "Paid"),
        payment: record
      };
    }).filter(row => {
      if (dueFilterStatus === "due") return row.dueAmount > 0;
      if (dueFilterStatus === "paid") return row.dueAmount === 0;
      if (dueFilterStatus === "partial") return row.status === "Partial";
      if (dueFilterStatus === "overdue") return row.status === "Overdue";
      return true;
    });
  }, [dueGridData, studentPayments, dueYear, dueMonth, dueFilterStatus]);

  // Config setup profiles grid
  const profilesGridData = useMemo(() => {
    let list = students.filter(s => s.status === "active");

    if (profileBranch !== "all_branches") {
      list = list.filter(s => String(s.branch_id) === String(profileBranch));
    }
    if (profileClass && profileClass !== "all_classes") {
      const selectedProfileBranch = branches.find(b => String(b.id) === String(profileBranch));
      list = list.filter(s => {
        const branchObj = profileBranch === "all_branches" ? branches.find(b => String(b.id) === String(s.branch_id)) : selectedProfileBranch;
        const classFilter = profileSessionId || profileClass;
        return isStudentInClassOption(s, classFilter, branchObj?.academic_structure);
      });
    }
    if (profileGroupId) {
      list = list.filter(s => String(s.class_group_id) === String(profileGroupId));
    }
    if (profileSearch) {
      const q = profileSearch.toLowerCase();
      list = list.filter(s =>
        s.full_name_en?.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    }

    return list.map(student => {
      let tuitionFee = 0;
      try {
        const parsed = student.custom_fields ? JSON.parse(student.custom_fields) : {};
        tuitionFee = Number(parsed.fees_setup?.["Monthly Tuition Fee"]) || 0;
      } catch {}
      return { student, tuitionFee };
    });
  }, [students, profileBranch, profileClass, profileSessionId, profileGroupId, profileSearch]);

  // Reports Center Data
  const getStudentLedger = () => {
    if (!repStudentId) return [];
    let payments = studentPayments.filter(p => String(p.student_id) === String(repStudentId) && !p.is_archived);
    if (repDateFrom) payments = payments.filter(p => p.payment_date >= repDateFrom);
    if (repDateTo) payments = payments.filter(p => p.payment_date <= repDateTo);
    return payments.sort((a, b) => a.month.localeCompare(b.month));
  };

  const getMonthlyCollectionsReport = () => {
    const monthKey = `${repYear}-${repMonth}`;
    let payments = studentPayments.filter(p => p.month === monthKey && !p.is_archived).map(p => {
      const student = students.find(s => String(s.id) === String(p.student_id));
      return { ...p, student };
    }).filter(p => p.student);

    if (repBranch !== "all_branches") {
      payments = payments.filter(p => String(p.student.branch_id) === String(repBranch));
    }
    if (repClass && repClass !== "all_classes") {
      const selectedRepBranch = branches.find(b => String(b.id) === String(repBranch));
      payments = payments.filter(p => {
        const branchObj = repBranch === "all_branches" ? branches.find(b => String(b.id) === String(p.student.branch_id)) : selectedRepBranch;
        const classFilter = repSessionId || repClass;
        return isStudentInClassOption(p.student, classFilter, branchObj?.academic_structure);
      });
    }
    if (repGroupId) {
      payments = payments.filter(p => String(p.student.class_group_id) === String(repGroupId));
    }
    if (repDateFrom) payments = payments.filter(p => p.payment_date >= repDateFrom);
    if (repDateTo) payments = payments.filter(p => p.payment_date <= repDateTo);

    return payments;
  };

  const getBranchCollectionsReport = () => {
    let payments = studentPayments.filter(p => !p.is_archived).map(p => {
      const student = students.find(s => String(s.id) === String(p.student_id));
      return { ...p, student };
    }).filter(p => p.student && p.month?.startsWith(repYear));

    if (repBranch !== "all_branches") {
      payments = payments.filter(p => String(p.student.branch_id) === String(repBranch));
    }
    if (repClass && repClass !== "all_classes") {
      const selectedRepBranch = branches.find(b => String(b.id) === String(repBranch));
      payments = payments.filter(p => {
        const branchObj = repBranch === "all_branches" ? branches.find(b => String(b.id) === String(p.student.branch_id)) : selectedRepBranch;
        const classFilter = repSessionId || repClass;
        return isStudentInClassOption(p.student, classFilter, branchObj?.academic_structure);
      });
    }
    if (repGroupId) {
      payments = payments.filter(p => String(p.student.class_group_id) === String(repGroupId));
    }
    if (repDateFrom) payments = payments.filter(p => p.payment_date >= repDateFrom);
    if (repDateTo) payments = payments.filter(p => p.payment_date <= repDateTo);

    return payments.sort((a, b) => a.month.localeCompare(b.month));
  };

  const handlePrintDuesSheet = () => {
    const printWindow = window.open("", "_blank");
    const branchName = dueBranchId === "all_branches" ? "All Branches" : branches.find(b => String(b.id) === String(dueBranchId))?.name_en || dueBranchId;
    let className = "All Classes";
    if (dueClassId && dueClassId !== "all_classes") {
      const clsOption = dueClassesOptions.find(c => String(c.id) === String(dueClassId));
      className = clsOption ? clsOption.label : dueClassId;
    }
    let title = "";
    let headersHtml = "";
    let rowsHtml = "";
    let totalsHtml = "";

    if (dueViewType === "monthly") {
      const monthName = MONTHS_LIST.find(m => m.key === dueMonth)?.name;
      title = `Student Fee Collection Status — ${monthName} ${dueYear}`;
      headersHtml = `
        <thead>
          <tr class="bg-[#052E2B] text-white font-bold">
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Branch</th>
            <th>Class</th>
            <th class="text-right">Monthly Fee</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
            <th>Payment Date</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
      `;

      let totalExpected = 0;
      let totalPaid = 0;
      let totalDue = 0;

      rowsHtml = dueMonthlyData.map(row => {
        totalExpected += row.monthlyFee;
        totalPaid += row.paidAmount;
        totalDue += row.dueAmount;

        const branch = branches.find(b => String(b.id) === String(row.student.branch_id));
        const cls = allClassOptions.find(c => c.id === row.student.class_id);

        return `
          <tr>
            <td>${row.student.roll_number || "—"}</td>
            <td><strong>${row.student.full_name_en}</strong></td>
            <td>${branch ? (branch.name_en || branch.branch_name) : "—"}</td>
            <td>${row.student.class_name || cls?.class_name?.en || "—"}</td>
            <td class="text-right">৳${row.monthlyFee.toLocaleString()}</td>
            <td class="text-right text-emerald-600">৳${row.paidAmount.toLocaleString()}</td>
            <td class="text-right text-red-600">৳${row.dueAmount.toLocaleString()}</td>
            <td>${formatPaymentDate(row.paymentDate)}</td>
            <td class="text-center"><span class="badge-print">${row.status}</span></td>
          </tr>
        `;
      }).join("");

      totalsHtml = `
        <tr class="total-row">
          <td colspan="4">GRAND TOTALS</td>
          <td class="text-right">৳${totalExpected.toLocaleString()}</td>
          <td class="text-right text-emerald-600">৳${totalPaid.toLocaleString()}</td>
          <td class="text-right text-red-600">৳${totalDue.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      `;
    } else {
      title = `Student Yearly Fee Collection Dues Sheet — ${dueYear}`;
      headersHtml = `
        <thead>
          <tr class="bg-[#052E2B] text-white font-bold">
            <th>Roll No</th>
            <th>Student Details</th>
            <th class="text-right">Fee Rate</th>
            ${MONTHS_LIST.map(m => `<th>${m.name}</th>`).join("")}
            <th class="text-right">Total Due</th>
          </tr>
        </thead>
      `;

      let grandTotalDue = 0;

      rowsHtml = dueGridData.map(row => {
        grandTotalDue += row.totalDueSum;
        const cls = allClassOptions.find(c => c.id === row.student.class_id);
        const cellsHtml = MONTHS_LIST.map(m => {
          const val = row.monthlyDues[m.key];
          return val > 0 
            ? `<td class="text-red-600 font-semibold">৳${val.toLocaleString()}</td>`
            : `<td class="text-emerald-600 font-medium">0</td>`;
        }).join("");

        return `
          <tr>
            <td>${row.student.roll_number || "—"}</td>
            <td>
              <strong>${row.student.full_name_en}</strong>
              <div style="font-size: 8px; color: #64748b;">Class: ${row.student.class_name || cls?.class_name?.en || "—"}</div>
            </td>
            <td class="text-right">৳${row.monthlyFee.toLocaleString()}</td>
            ${cellsHtml}
            <td class="text-right font-extrabold text-[#052E2B]">৳${row.totalDueSum.toLocaleString()}</td>
          </tr>
        `;
      }).join("");

      totalsHtml = `
        <tr class="total-row">
          <td colspan="3">GRAND TOTAL DUE</td>
          ${MONTHS_LIST.map(m => {
            const sumMonth = dueGridData.reduce((s, r) => s + r.monthlyDues[m.key], 0);
            return `<td class="font-bold text-red-600">৳${sumMonth.toLocaleString()}</td>`;
          }).join("")}
          <td class="text-right font-black text-[#052E2B]">৳${grandTotalDue.toLocaleString()}</td>
        </tr>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
            body { font-family: 'Outfit', sans-serif; padding: 25px; color: #1e293b; background: white; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #052E2B; padding-bottom: 12px; margin-bottom: 20px; }
            .logo-placeholder { width: 45px; height: 45px; border-radius: 50%; background: #052E2B; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
            .title-section { text-align: center; flex: 1; }
            .title-section h1 { margin: 0; font-size: 20px; color: #052E2B; font-weight: 700; letter-spacing: 0.5px; }
            .title-section h2 { margin: 2px 0 0; font-size: 11px; color: #b45309; text-transform: uppercase; font-weight: 600; }
            
            .report-title { text-align: center; margin: 15px 0; }
            .report-title span { background: #052E2B; color: white; padding: 5px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .filter-info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            .filter-info-table th, .filter-info-table td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
            .filter-info-table th { background: #f8fafc; font-weight: 600; color: #475569; }
            
            .data-table { width: 100%; border-collapse: collapse; font-size: 9px; text-align: left; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .data-table th { background: #052E2B; color: white; font-weight: 700; text-transform: uppercase; font-size: 8px; }
            .data-table tr:nth-child(even) { background: #f8fafc; }
            .total-row { font-weight: bold; background: #f1f5f9 !important; border-top: 2px solid #052E2B; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            .badge-print { font-weight: bold; padding: 1px 4px; border-radius: 4px; font-size: 9px; }
            .footer-section { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
            .sig-line { width: 140px; border-top: 1px solid #052E2B; margin-bottom: 4px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">RI</div>
            <div class="title-section">
              <h1>রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE</h1>
              <h2>Student Fees Management System</h2>
            </div>
            <div style="width:45px;"></div>
          </div>
          <div class="report-title"><span>${title}</span></div>
          <table class="filter-info-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Class</th>
                <th>Year</th>
                <th>Status Filter</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${branchName}</td>
                <td>${className}</td>
                <td>${dueYear}</td>
                <td>${dueFilterStatus.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
          <table class="data-table">
            ${headersHtml}
            <tbody>
              ${rowsHtml}
              ${totalsHtml}
            </tbody>
          </table>
          <div class="footer-section">
            <div><p>Report Date: ${new Date().toLocaleDateString()}</p></div>
            <div>
              <div class="sig-line"></div>
              <p style="text-align: center; margin: 0; font-weight: 600;">Authorized Signature</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleExportDuesCsv = () => {
    // Generate CSV
    const branchName = dueBranchId === "all_branches" ? "All" : dueBranchId;
    let className = "All";
    if (dueClassId && dueClassId !== "all_classes") {
      const clsOption = dueClassesOptions.find(c => String(c.id) === String(dueClassId));
      className = clsOption ? clsOption.label : dueClassId;
    }
    
    const downloadCsv = (filename, headers, rows) => {
      const content = [headers.join(","), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(","))].join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (dueViewType === "monthly") {
      const monthName = MONTHS_LIST.find(m => m.key === dueMonth)?.name;
      const headers = ["Roll No", "Student Name", "Branch", "Class", "Expected Fee", "Paid Amount", "Remaining Due", "Payment Date", "Status"];
      const rows = dueMonthlyData.map(row => {
        const branch = branches.find(b => String(b.id) === String(row.student.branch_id));
        const cls = allClassOptions.find(c => c.id === row.student.class_id);
        return [
          row.student.roll_number || "",
          row.student.full_name_en,
          branch ? (branch.name_en || branch.branch_name) : "",
          row.student.class_name || cls?.class_name?.en || "",
          row.monthlyFee,
          row.paidAmount,
          row.dueAmount,
          formatPaymentDate(row.paymentDate),
          row.status
        ];
      });
      downloadCsv(`student_fees_status_${monthName}_${dueYear}.csv`, headers, rows);
    } else {
      const headers = ["Roll No", "Student Name", "Class", "Fee Rate", ...MONTHS_LIST.map(m => m.name), "Total Due"];
      const rows = dueGridData.map(row => {
        const cls = allClassOptions.find(c => c.id === row.student.class_id);
        return [
          row.student.roll_number || "",
          row.student.full_name_en,
          row.student.class_name || cls?.class_name?.en || "",
          row.monthlyFee,
          ...MONTHS_LIST.map(m => row.monthlyDues[m.key]),
          row.totalDueSum
        ];
      });
      downloadCsv(`student_dues_sheet_${dueYear}.csv`, headers, rows);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    let title = "";
    let filterInfo = "";
    let tableHtml = "";

    const branchName = repBranch === "all_branches" ? "All Branches" : branches.find(b => String(b.id) === String(repBranch))?.name_en || repBranch;
    let className = "All Classes";
    if (repClass && repClass !== "all_classes") {
      const clsOption = repClassesOptions.find(c => String(c.id) === String(repClass));
      className = clsOption ? clsOption.label : repClass;
    }

    if (repType === "monthly") {
      const data = getMonthlyCollectionsReport();
      const monthName = MONTHS_LIST.find(m => m.key === repMonth)?.name;
      title = `Monthly Fee Collections Register — ${monthName} ${repYear}`;
      filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Class</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${branchName}</td>
              <td>${className}</td>
              <td>${monthName} ${repYear}</td>
            </tr>
          </tbody>
        </table>
      `;

      tableHtml = `
        <thead>
          <tr class="bg-[#052E2B] text-white font-bold">
            <th>Payment Date</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Branch</th>
            <th>Class</th>
            <th>Method</th>
            <th class="text-right">Billed Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${formatPaymentDate(p.payment_date)}</td>
              <td>${p.roll_number || "—"}</td>
              <td><strong>${p.student_name || p.student?.full_name_en}</strong></td>
              <td>${p.branch_name || "—"}</td>
              <td>${p.class_name || "—"}</td>
              <td>${p.payment_method || "—"}</td>
              <td class="text-right">৳${(p.total_fee || 0).toLocaleString()}</td>
              <td class="text-right text-emerald-600">৳${(p.paid_amount || 0).toLocaleString()}</td>
              <td class="text-right text-red-600">৳${(p.due_amount || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="6">GRAND TOTALS</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.total_fee) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-emerald-600">৳${data.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-red-600">৳${data.reduce((s, p) => s + (Number(p.due_amount) || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      `;
    } else if (repType === "branch") {
      const data = getBranchCollectionsReport();
      title = `Branch collections report — ${repYear}`;
      filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Class</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${branchName}</td>
              <td>${className}</td>
              <td>${repYear}</td>
            </tr>
          </tbody>
        </table>
      `;

      tableHtml = `
        <thead>
          <tr class="bg-[#052E2B] text-white font-bold">
            <th>Month</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Method</th>
            <th class="text-right">Billed Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${p.month}</td>
              <td>${p.roll_number || "—"}</td>
              <td><strong>${p.student_name || p.student?.full_name_en}</strong></td>
              <td>${p.class_name || "—"}</td>
              <td>${p.payment_method || "—"}</td>
              <td class="text-right">৳${(p.total_fee || 0).toLocaleString()}</td>
              <td class="text-right text-emerald-600">৳${(p.paid_amount || 0).toLocaleString()}</td>
              <td class="text-right text-red-600">৳${(p.due_amount || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="5">GRAND TOTALS</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.total_fee) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-emerald-600">৳${data.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-red-600">৳${data.reduce((s, p) => s + (Number(p.due_amount) || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      `;
    } else {
      const student = students.find(s => String(s.id) === String(repStudentId));
      const data = getStudentLedger();
      title = `Student Fee Ledger Statement`;
      filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Predefined tuition fee</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${student?.roll_number || "—"}</td>
              <td><strong>${student?.full_name_en || "—"}</strong></td>
              <td>৳${studentPredefinedFee.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      `;

      let runningDueBalance = 0;

      tableHtml = `
        <thead>
          <tr class="bg-[#052E2B] text-white font-bold">
            <th>Month</th>
            <th>Payment Date</th>
            <th>Method</th>
            <th>Txn ID</th>
            <th class="text-right">Billed Fee</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
            <th class="text-right">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => {
            const billed = Number(p.total_fee) || 0;
            const paid = Number(p.paid_amount) || 0;
            const remaining = Number(p.due_amount) || 0;
            runningDueBalance += remaining;
            return `
              <tr>
                <td>${p.month}</td>
                <td>${formatPaymentDate(p.payment_date)}</td>
                <td>${p.payment_method || "—"}</td>
                <td>${p.transaction_id || "—"}</td>
                <td class="text-right">৳${billed.toLocaleString()}</td>
                <td class="text-right font-semibold text-emerald-600">৳${paid.toLocaleString()}</td>
                <td class="text-right font-semibold text-red-600">৳${remaining.toLocaleString()}</td>
                <td class="text-right font-bold">৳${runningDueBalance.toLocaleString()}</td>
              </tr>
            `;
          }).join("")}
          <tr class="total-row">
            <td colspan="4">LEDGER SUMMARY STATEMENT</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.total_fee) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-emerald-600">৳${data.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right text-red-600">৳${data.reduce((s, p) => s + (Number(p.due_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right">৳${runningDueBalance.toLocaleString()}</td>
          </tr>
        </tbody>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
            body { font-family: 'Outfit', sans-serif; padding: 25px; color: #1e293b; background: white; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #052E2B; padding-bottom: 12px; margin-bottom: 20px; }
            .logo-placeholder { width: 45px; height: 45px; border-radius: 50%; background: #052E2B; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
            .title-section { text-align: center; flex: 1; }
            .title-section h1 { margin: 0; font-size: 20px; color: #052E2B; font-weight: 700; letter-spacing: 0.5px; }
            .title-section h2 { margin: 2px 0 0; font-size: 11px; color: #b45309; text-transform: uppercase; font-weight: 600; }
            
            .report-title { text-align: center; margin: 15px 0; }
            .report-title span { background: #052E2B; color: white; padding: 5px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .filter-info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            .filter-info-table th, .filter-info-table td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
            .filter-info-table th { background: #f8fafc; font-weight: 600; color: #475569; }
            
            .data-table { width: 100%; border-collapse: collapse; font-size: 9px; text-align: left; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .data-table th { background: #052E2B; color: white; font-weight: 700; text-transform: uppercase; font-size: 8px; }
            .data-table tr:nth-child(even) { background: #f8fafc; }
            .total-row { font-weight: bold; background: #f1f5f9 !important; border-top: 2px solid #052E2B; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            .footer-section { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
            .sig-line { width: 140px; border-top: 1px solid #052E2B; margin-bottom: 4px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">RI</div>
            <div class="title-section">
              <h1>রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE</h1>
              <h2>Student Fees Management System</h2>
            </div>
            <div style="width:45px;"></div>
          </div>
          <div class="report-title"><span>${title}</span></div>
          ${filterInfo}
          <table class="data-table">${tableHtml}</table>
          <div class="footer-section">
            <div><p>Report Date: ${new Date().toLocaleDateString()}</p></div>
            <div>
              <div class="sig-line"></div>
              <p style="text-align: center; margin: 0; font-weight: 600;">Authorized Signature</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleExportReportCSV = () => {
    const downloadCsv = (filename, headers, rows) => {
      const content = [headers.join(","), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(","))].join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (repType === "monthly") {
      const data = getMonthlyCollectionsReport();
      const headers = ["Date", "Roll No", "Student Name", "Branch", "Class", "Method", "Billed Amount", "Paid Amount", "Due Amount"];
      const rows = data.map(p => [formatPaymentDate(p.payment_date), p.roll_number, p.student_name || p.student?.full_name_en, p.branch_name, p.class_name, p.payment_method, p.total_fee, p.paid_amount, p.due_amount]);
      downloadCsv(`student_payroll_${repYear}_${repMonth}.csv`, headers, rows);
    } else if (repType === "branch") {
      const data = getBranchCollectionsReport();
      const headers = ["Month", "Roll No", "Student Name", "Class", "Method", "Billed Amount", "Paid Amount", "Due Amount"];
      const rows = data.map(p => [p.month, p.roll_number, p.student_name || p.student?.full_name_en, p.class_name, p.payment_method, p.total_fee, p.paid_amount, p.due_amount]);
      downloadCsv(`branch_payroll_${repBranch}_${repYear}.csv`, headers, rows);
    } else if (repType === "ledger") {
      const data = getStudentLedger();
      const headers = ["Month", "Payment Date", "Method", "Txn ID", "Billed Fee", "Paid Amount", "Remaining Due"];
      const rows = data.map(p => [p.month, formatPaymentDate(p.payment_date), p.payment_method, p.transaction_id, p.total_fee, p.paid_amount, p.due_amount]);
      downloadCsv(`student_ledger_${repStudentId}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chrome Header */}
      <div className="bg-[#052E2B] text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-400" /> Student Fees & Collection Center
          </h2>
          <p className="text-xs text-slate-300 mt-1">Configure student monthly tuition fee contracts, collect payments, and print ledgers.</p>
        </div>
        <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/5 self-start">
          <Tabs value={studentActiveTab} onValueChange={setStudentActiveTab} className="w-full">
            <TabsList className="bg-transparent gap-1 p-0 h-auto">
              <TabsTrigger value="pay" className="h-8 text-xs font-semibold rounded-lg text-slate-300 data-[state=active]:bg-white data-[state=active]:text-[#052E2B]">
                💸 Collect Fee
              </TabsTrigger>
              <TabsTrigger value="payroll_grid" className="h-8 text-xs font-semibold rounded-lg text-slate-300 data-[state=active]:bg-white data-[state=active]:text-[#052E2B]">
                📋 Dues Sheet
              </TabsTrigger>
              <TabsTrigger value="profiles" className="h-8 text-xs font-semibold rounded-lg text-slate-300 data-[state=active]:bg-white data-[state=active]:text-[#052E2B]">
                ⚙️ Fee Setup
              </TabsTrigger>
              <TabsTrigger value="reports" className="h-8 text-xs font-semibold rounded-lg text-slate-300 data-[state=active]:bg-white data-[state=active]:text-[#052E2B]">
                📊 Reports Center
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Sub-tab 1: Collect Fee Form */}
      {studentActiveTab === "pay" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side Form */}
          <Card className="lg:col-span-2 border-gray-100 rounded-[20px] shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50/50 p-6">
              <CardTitle className="text-base font-bold text-[#052E2B]">Fee Collection Input Form</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveCollection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                    <Select 
                       value={payBranchId} 
                       onValueChange={(v) => { setPayBranchId(v); setPayClassId(""); setPayStudentId(""); setFeeStudentSearch(""); }} 
                       required 
                       disabled={currentUser?.role === "branch_admin"}
                    >
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                      <SelectContent>
                        {activeBranches.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.name_en || b.branch_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Class & Section *</Label>
                    <Select 
                       value={payClassId} 
                       onValueChange={(v) => { setPayClassId(v); setPaySessionId(""); setPayGroupId(""); setPayStudentId(""); setFeeStudentSearch(""); }} 
                       required 
                       disabled={!payBranchId}
                    >
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {payClassesOptions.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {paySessions.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Session</Label>
                      <Select value={paySessionId} onValueChange={(v) => { setPaySessionId(v); setPayGroupId(""); }}>
                        <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                        <SelectContent>
                          {paySessions.map(sec => (
                            <SelectItem key={sec.id} value={String(sec.id)}>
                              {sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || `Session ${sec.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {payGroups.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Group</Label>
                      <Select value={payGroupId} onValueChange={setPayGroupId}>
                        <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                        <SelectContent>
                          {payGroups.map(g => (
                            <SelectItem key={g.id} value={String(g.id)}>
                              {g.group_name?.en || g.group_name?.bn || `Group ${g.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Search Student (Optional)</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="text" 
                        placeholder="Type name / roll..." 
                        value={feeStudentSearch} 
                        onChange={e => setFeeStudentSearch(e.target.value)} 
                        disabled={!payClassId}
                        className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Student *</Label>
                    <Select 
                       value={payStudentId} 
                       onValueChange={setPayStudentId} 
                       required 
                       disabled={!payClassId}
                    >
                      <SelectTrigger className="mt-1 h-10 rounded-xl">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
.filter(s => {
                              if (s.status !== "active") return false;
                              if (String(s.branch_id) !== String(payBranchId)) return false;
                              const classFilter = paySessionId || payClassId;
                              if (!isStudentInClassOption(s, classFilter, branches.find(b => String(b.id) === String(payBranchId))?.academic_structure)) return false;
                              if (payGroupId && String(s.class_group_id) !== String(payGroupId)) return false;
                              return true;
                            })
                          .filter(s => {
                            if (!feeStudentSearch) return true;
                            const searchLower = feeStudentSearch.toLowerCase();
                            return (
                              s.full_name_en?.toLowerCase().includes(searchLower) ||
                              s.full_name_bn?.toLowerCase().includes(searchLower) ||
                              String(s.roll_number || "").toLowerCase().includes(searchLower) ||
                              String(s.id || "").toLowerCase().includes(searchLower)
                            );
                          })
                          .map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number || "—"})</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Billing Month *</Label>
                    <Select value={payMonth} onValueChange={setPayMonth}>
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS_LIST.map(m => (
                          <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Billing Year *</Label>
                    <Input 
                      type="text" 
                      value={payYear} 
                      onChange={e => setPayYear(e.target.value)} 
                      placeholder="e.g. 2026" 
                      required 
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Payment Date *</Label>
                    <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} required className="mt-1 h-10 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Amount Paid (৳) *</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={payAmount} 
                      onChange={e => setPayAmount(e.target.value)} 
                      required 
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Payment Method *</Label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="bKash">bKash</SelectItem>
                        <SelectItem value="Nagad">Nagad</SelectItem>
                        <SelectItem value="Rocket">Rocket</SelectItem>
                        <SelectItem value="Bank">Bank Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Transaction ID (optional)</Label>
                    <Input 
                      type="text" 
                      placeholder="Txn ID..." 
                      value={payTxnId} 
                      onChange={e => setPayTxnId(e.target.value)} 
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-500">Notes / Remarks</Label>
                  <Input 
                    type="text" 
                    placeholder="Reference, installment, late fee details..." 
                    value={payNotes} 
                    onChange={e => setPayNotes(e.target.value)} 
                    className="mt-1 h-10 rounded-xl"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  {(lastRecordedPayment || selectedStudentPayment) && (
                    <Button 
                      type="button" 
                      onClick={() => handlePrintReceipt(lastRecordedPayment || selectedStudentPayment)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 px-6 shadow-sm gap-2 text-xs"
                    >
                      <Printer className="h-4 w-4" /> Print Receipt
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                    className="bg-[#052E2B] text-white hover:bg-[#042422] font-bold rounded-xl h-11 px-6 shadow-sm gap-2 text-xs"
                  >
                    {(createPaymentMutation.isPending || updatePaymentMutation.isPending) ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Recording...</>
                    ) : (
                      selectedStudentPayment ? "Update Record Logs" : "Record Collection Receipt"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Side Calculation Console */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#052E2B] to-[#042422] text-white p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-400">Calculation Console</CardTitle>
                <p className="text-xs text-white/70 italic mt-1 font-sans">Automatic real-time calculation breakdown</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedStudent ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-2">
                    <p className="font-bold text-slate-700 truncate">{selectedStudent.full_name_en}</p>
                    <p className="text-slate-500 font-mono mt-0.5">Roll: {selectedStudent.roll_number || "—"}</p>
                    <p className="text-slate-400 mt-0.5">Class: {selectedStudent.class_name || allClassOptions.find(c => c.id === selectedStudent.class_id)?.class_name?.en || ""}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 text-center rounded-xl border border-slate-100 text-xs text-slate-400 italic mb-2">
                    No student selected
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs text-slate-500">Monthly Tuition Fee</span>
                  <span className="text-sm font-semibold">৳{studentPredefinedFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs text-slate-500">Already Paid (Before This)</span>
                  <span className="text-sm font-semibold text-emerald-600">৳{payPaidSoFar.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs text-slate-500">This Payment Amount</span>
                  <span className="text-sm font-semibold text-blue-600">৳{Number(payAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs text-slate-500">Last Payment Date</span>
                  <span className="text-sm font-semibold">{latestPayRecord ? formatPaymentDate(latestPayRecord.payment_date) : "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-rose-50/50 p-1.5 rounded-lg">
                  <span className="text-xs font-semibold text-rose-700">Remaining Due After Pay</span>
                  <span className="text-sm font-bold text-rose-700">৳{Math.max(0, payRemainingDue - Number(payAmount || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">New Period Status</span>
                  <Badge className={`text-xs uppercase font-bold px-2.5 py-1 ${
                    (payPaidSoFar + Number(payAmount || 0)) >= studentPredefinedFee ? "bg-emerald-100 text-emerald-700" :
                    (payPaidSoFar + Number(payAmount || 0)) > 0 ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {(payPaidSoFar + Number(payAmount || 0)) >= studentPredefinedFee ? "Paid" :
                     (payPaidSoFar + Number(payAmount || 0)) > 0 ? "Partial" : "Due"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4">
              <p className="text-xs font-bold text-[#052E2B] mb-2 uppercase tracking-wide">Predefined Fee Rule</p>
              <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed font-sans">
                <li>Predefined student fees must first be configured in **Fee Setup**.</li>
                <li>Dues will be automatically calculated when you record a fee collection receipt.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Dues Grid list */}
      {studentActiveTab === "payroll_grid" && (
        <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50/50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-base font-bold text-[#052E2B]">
                  {dueViewType === "monthly" ? "Student Monthly Fee Status" : "Student Yearly Dues Sheet"}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  {dueViewType === "monthly" 
                    ? "View paid and outstanding student tuition fees for the selected month." 
                    : "Live yearly dues sheet overview showing student monthly outstanding balances."}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDueViewType("monthly")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      dueViewType === "monthly"
                        ? "bg-white text-[#052E2B] shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Monthly Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueViewType("yearly")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      dueViewType === "yearly"
                        ? "bg-white text-[#052E2B] shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Yearly Grid
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrintDuesSheet} 
                    disabled={dueViewType === "monthly" ? dueMonthlyData.length === 0 : dueGridData.length === 0} 
                    className="gap-1.5 rounded-xl border-[#052E2B] text-[#052E2B] hover:bg-gray-50 h-9 font-bold text-xs"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Dues Sheet
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportDuesCsv} 
                    disabled={dueViewType === "monthly" ? dueMonthlyData.length === 0 : dueGridData.length === 0} 
                    className="gap-1.5 rounded-xl border-[#0f766e] text-[#0f766e] hover:bg-gray-50 h-9 font-bold text-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Excel
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                <Select value={dueBranchId} onValueChange={setDueBranchId} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_branches">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name_en || b.branch_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs font-semibold text-slate-500">Class & Section *</Label>
                <Select value={dueClassId} onValueChange={(v) => { setDueClassId(v); setDueSessionId(""); setDueGroupId(""); }}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_classes">All Classes</SelectItem>
                    {(dueBranchId === "all_branches" ? allClassOptions : dueClassesOptions).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dueSessions.length > 0 && (
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-500">Session</Label>
                  <Select value={dueSessionId} onValueChange={(v) => { setDueSessionId(v); setDueGroupId(""); }}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                    <SelectContent>
                      {dueSessions.map(sec => (
                        <SelectItem key={sec.id} value={String(sec.id)}>
                          {sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || `Session ${sec.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {dueGroups.length > 0 && (
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-500">Group</Label>
                  <Select value={dueGroupId} onValueChange={setDueGroupId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                    <SelectContent>
                      {dueGroups.map(g => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.group_name?.en || g.group_name?.bn || `Group ${g.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {dueViewType === "monthly" && (
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-500">Month</Label>
                  <Select value={dueMonth} onValueChange={setDueMonth}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS_LIST.map(m => (
                        <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-500">Year</Label>
                <Input 
                  type="text" 
                  value={dueYear} 
                  onChange={e => setDueYear(e.target.value)} 
                  className="mt-1 h-9 rounded-xl text-xs" 
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-500">Status</Label>
                <Select value={dueFilterStatus} onValueChange={setDueFilterStatus}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="due">Due / Pending</SelectItem>
                    <SelectItem value="paid">Fully Paid</SelectItem>
                    {dueViewType === "monthly" && (
                      <>
                        <SelectItem value="partial">Partial Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                placeholder="Search Student Name or Roll..." 
                value={dueSearch} 
                onChange={e => setDueSearch(e.target.value)} 
                className="pl-9 h-9 rounded-xl text-xs"
              />
            </div>

            {dueViewType === "monthly" ? (
              dueMonthlyData.length === 0 ? (
                <div className="text-center py-12 border rounded-xl text-muted-foreground text-sm font-sans bg-slate-50/50">
                  No active students found matching criteria.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                          <th className="py-3 px-4">Roll No</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Class</th>
                          <th className="py-3 px-4 text-right">Predefined Fee</th>
                          <th className="py-3 px-4 text-right">Paid Amount</th>
                          <th className="py-3 px-4 text-right">Remaining Due</th>
                          <th className="py-3 px-4">Last Payment Date</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dueMonthlyData.map(row => {
                          const branch = branches.find(b => String(b.id) === String(row.student.branch_id));
                          const cls = allClassOptions.find(c => c.id === row.student.class_id);
                          return (
                            <tr key={row.student.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-4 font-mono text-slate-500">{row.student.roll_number || "—"}</td>
                              <td className="py-2.5 px-4">
                                <p className="font-bold text-slate-800">{row.student.full_name_en}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.student.id} | {branch ? (branch.name_en || branch.branch_name) : "—"}</p>
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">{row.student.class_name || cls?.class_name?.en || ""}</td>
                              <td className="py-2.5 px-4 text-right text-slate-600 font-semibold">৳{row.monthlyFee.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">৳{row.paidAmount.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-right text-red-600 font-bold">৳{row.dueAmount.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-slate-500 font-mono">{formatPaymentDate(row.paymentDate)}</td>
                              <td className="py-2.5 px-4 text-center">
                                <Badge className={`text-[10px] font-bold ${
                                  row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  row.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  row.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {row.status}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <Button 
                                  size="xs"
                                  onClick={() => {
                                    setSelectedPaymentRow(row);
                                    setShowCollectModal(true);
                                  }}
                                  disabled={row.dueAmount === 0}
                                  className="h-7 text-[10px] bg-[#052E2B] text-white hover:bg-[#052E2B]/90 font-bold rounded-lg px-2"
                                >
                                  Collect Fee
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              dueGridData.length === 0 ? (
                <div className="text-center py-12 border rounded-xl text-muted-foreground text-sm font-sans bg-slate-50/50">
                  No active students found matching criteria.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                          <th className="py-3 px-4">Roll No</th>
                          <th className="py-3 px-4">Student Details</th>
                          <th className="py-3 px-4 text-right">Fee Rate</th>
                          {MONTHS_LIST.map(m => (
                            <th key={m.key} className="py-3 px-2 text-center min-w-[55px]">{m.name}</th>
                          ))}
                          <th className="py-3 px-4 text-right min-w-[90px]">Total Due</th>
                          <th className="py-3 px-4 text-center">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dueGridData.map(row => (
                          <tr key={row.student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 font-mono text-slate-500">{row.student.roll_number || "—"}</td>
                            <td className="py-2.5 px-4">
                              <p className="font-bold text-slate-800">{row.student.full_name_en}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.student.id} | Class: {row.student.class_name || allClassOptions.find(c => c.id === row.student.class_id)?.class_name?.en || ""}</p>
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-600 font-semibold">৳{row.monthlyFee.toLocaleString()}</td>
                            {MONTHS_LIST.map(m => {
                              const due = row.monthlyDues[m.key];
                              return (
                                <td key={m.key} className="py-2.5 px-2 text-center font-semibold">
                                  {due > 0 ? (
                                    <span className="text-red-600">৳{due.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-emerald-600 font-medium">0</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-4 text-right font-extrabold text-[#052E2B] bg-[#052E2B]/3">
                              ৳{row.totalDueSum.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <Button 
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setPayBranchId(String(row.student.branch_id));
                                  setPayClassId(row.student.class_id);
                                  setPayStudentId(String(row.student.id));
                                  setPayMonth(format(new Date(), "MM"));
                                  setPayYear(dueYear);
                                  setStudentActiveTab("pay");
                                }}
                                className="h-7 text-[10px] font-bold bg-[#052E2B] text-white hover:bg-[#052E2B]/90 rounded-lg px-2"
                              >
                                Open Pay Form
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Sub-tab 3: Student fee profiles setup tab */}
      {studentActiveTab === "profiles" && (
        <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50/50 p-6">
            <div>
              <CardTitle className="text-base font-bold text-[#052E2B]">Student Monthly Fee Setup</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Configure baseline monthly tuition fees for each student profile.</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Filter Branch</Label>
                <Select value={profileBranch} onValueChange={setProfileBranch} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_branches">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name_en || b.branch_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">Filter Class & Section</Label>
                <Select value={profileClass} onValueChange={(v) => { setProfileClass(v); setProfileSessionId(""); setProfileGroupId(""); }}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_classes">All Classes</SelectItem>
                    {(profileBranch === "all_branches" ? allClassOptions : profileClassesOptions).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {profileSessions.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Session</Label>
                  <Select value={profileSessionId} onValueChange={(v) => { setProfileSessionId(v); setProfileGroupId(""); }}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                    <SelectContent>
                      {profileSessions.map(sec => (
                        <SelectItem key={sec.id} value={String(sec.id)}>
                          {sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || `Session ${sec.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {profileGroups.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Group</Label>
                  <Select value={profileGroupId} onValueChange={setProfileGroupId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                    <SelectContent>
                      {profileGroups.map(g => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.group_name?.en || g.group_name?.bn || `Group ${g.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Search Student</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Search Name or Roll..." 
                    value={profileSearch} 
                    onChange={e => setProfileSearch(e.target.value)} 
                    className="pl-9 h-9 rounded-xl text-xs" 
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4 text-right">Predefined Monthly Fee</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profilesGridData.map(row => {
                      const branch = branches.find(b => String(b.id) === String(row.student.branch_id));
                      const cls = allClassOptions.find(c => c.id === row.student.class_id);
                      return (
                        <tr key={row.student.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.student.roll_number || "—"}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.student.full_name_en}</td>
                          <td className="py-3 px-4 text-slate-500">{branch ? (branch.name_en || branch.branch_name) : "—"}</td>
                          <td className="py-3 px-4 text-slate-500">{row.student.class_name || cls?.class_name?.en || ""}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#052E2B]">
                            {row.tuitionFee > 0 ? (
                              <span>৳{row.tuitionFee.toLocaleString()}</span>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-red-500 bg-red-50 border-red-200">Not Setup</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#052E2B] hover:bg-slate-100"
                              onClick={() => {
                                setEditingStudentProfile(row.student);
                                setPredefinedFeeInput(String(row.tuitionFee));
                                setShowAddFeeModal(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {profilesGridData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                          No student configurations matched filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-tab 4: Reports Center */}
      {studentActiveTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side Filter Panel */}
          <Card className="lg:col-span-1 border-gray-100 rounded-[20px] shadow-sm bg-white self-start">
            <CardHeader className="border-b border-gray-50/50 p-6">
              <CardTitle className="text-base font-bold text-[#052E2B]">Report Builder</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Report Type</Label>
                <Select value={repType} onValueChange={setRepType}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ledger">Student Ledger</SelectItem>
                    <SelectItem value="monthly">Monthly Collections</SelectItem>
                    <SelectItem value="branch">Branch Collections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(repType === "monthly" || repType === "branch") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Billing Year *</Label>
                  <Input 
                    type="text" 
                    value={repYear} 
                    onChange={e => setRepYear(e.target.value)} 
                    placeholder="e.g. 2026" 
                    required 
                    className="mt-1 h-9 rounded-xl text-xs" 
                  />
                </div>
              )}

              {repType === "monthly" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Billing Month *</Label>
                  <Select value={repMonth} onValueChange={setRepMonth}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS_LIST.map(m => (
                        <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(repType === "branch" || repType === "monthly" || repType === "ledger") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                  <Select value={repBranch} onValueChange={setRepBranch} disabled={currentUser?.role === "branch_admin"}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_branches">All Branches</SelectItem>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name_en || b.branch_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {repType !== "ledger" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Class *</Label>
                  <Select value={repClass} onValueChange={(v) => { setRepClass(v); setRepSessionId(""); setRepGroupId(""); }}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_classes">All Classes</SelectItem>
                      {(repBranch === "all_branches" ? allClassOptions : repClassesOptions).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {repType !== "ledger" && repSessions.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Session</Label>
                  <Select value={repSessionId} onValueChange={(v) => { setRepSessionId(v); setRepGroupId(""); }}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                    <SelectContent>
                      {repSessions.map(sec => (
                        <SelectItem key={sec.id} value={String(sec.id)}>
                          {sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || `Session ${sec.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {repType !== "ledger" && repGroups.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Group</Label>
                  <Select value={repGroupId} onValueChange={setRepGroupId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                    <SelectContent>
                      {repGroups.map(g => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.group_name?.en || g.group_name?.bn || `Group ${g.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {repType === "ledger" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Student *</Label>
                  <Select value={repStudentId} onValueChange={setRepStudentId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Student" /></SelectTrigger>
                    <SelectContent>
                      {students
                        .filter(s => s.status === "active" && (repBranch === "all_branches" || String(s.branch_id) === String(repBranch)))
                        .map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number || "—"})</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Filter Payment Date Range</p>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] text-slate-400">From Date</Label>
                    <Input type="date" value={repDateFrom} onChange={e => setRepDateFrom(e.target.value)} className="h-8 text-xs rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-400">To Date</Label>
                    <Input type="date" value={repDateTo} onChange={e => setRepDateTo(e.target.value)} className="h-8 text-xs rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex flex-col gap-2">
                <Button 
                  onClick={handlePrintReport} 
                  disabled={repType === "ledger" && !repStudentId}
                  className="bg-[#052E2B] hover:bg-[#042422] text-white font-bold w-full rounded-xl gap-2 h-10 text-xs"
                >
                  <Printer className="h-4 w-4" /> Print Statement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportReportCSV} 
                  disabled={repType === "ledger" && !repStudentId}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold w-full rounded-xl gap-2 h-10 text-xs"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Side Live Preview */}
          <Card className="lg:col-span-3 border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Live Preview</CardTitle>
              <Badge className="bg-[#052E2B] text-white">Live Data</Badge>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto min-h-[300px]">
              {repType === "monthly" && (
                <div className="space-y-4 font-sans">
                  <h4 className="text-sm font-bold text-[#052E2B]">Monthly Fee Collections Register</h4>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2.5 border">Payment Date</th>
                        <th className="p-2.5 border">Student Name</th>
                        <th className="p-2.5 border">Roll No</th>
                        <th className="p-2.5 border text-right">Billed Amount</th>
                        <th className="p-2.5 border text-right">Paid Amount</th>
                        <th className="p-2.5 border text-right">Remaining Due</th>
                        <th className="p-2.5 border">Method</th>
                        <th className="p-2.5 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getMonthlyCollectionsReport().map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{formatPaymentDate(p.payment_date)}</td>
                          <td className="p-2 border"><strong>{p.student_name || p.student?.full_name_en}</strong></td>
                          <td className="p-2 border font-mono">{p.roll_number || "—"}</td>
                          <td className="p-2 border text-right font-semibold">৳{(p.total_fee || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border">{p.payment_method || "—"}</td>
                          <td className="p-2 border text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-[#052E2B] hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handlePrintReceipt(p)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {getMonthlyCollectionsReport().length === 0 && (
                        <tr>
                          <td colSpan="8" className="p-6 text-center text-slate-400 italic">No collections found for this month period matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {repType === "branch" && (
                <div className="space-y-4 font-sans">
                  <h4 className="text-sm font-bold text-[#052E2B]">Branch Wise Year Collections Register</h4>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Student Name</th>
                        <th className="p-2 border font-mono">Roll No</th>
                        <th className="p-2 border text-right">Billed Amount</th>
                        <th className="p-2 border text-right">Paid Amount</th>
                        <th className="p-2 border text-right">Remaining Due</th>
                        <th className="p-2 border">Method</th>
                        <th className="p-2 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getBranchCollectionsReport().map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{p.month}</td>
                          <td className="p-2 border"><strong>{p.student_name || p.student?.full_name_en}</strong></td>
                          <td className="p-2 border font-mono">{p.roll_number || "—"}</td>
                          <td className="p-2 border text-right font-semibold">৳{(p.total_fee || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border">{p.payment_method || "—"}</td>
                          <td className="p-2 border text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-[#052E2B] hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handlePrintReceipt(p)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {getBranchCollectionsReport().length === 0 && (
                        <tr>
                          <td colSpan="8" className="p-6 text-center text-slate-400 italic">No collections found for this branch in {repYear}.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {repType === "ledger" && (
                <div className="space-y-4 font-sans">
                  <h4 className="text-sm font-bold text-[#052E2B]">Student Fee Ledger Account</h4>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Payment Date</th>
                        <th className="p-2 border">Method</th>
                        <th className="p-2 border">Txn ID</th>
                        <th className="p-2 border text-right">Billed Fee</th>
                        <th className="p-2 border text-right">Paid Amount</th>
                        <th className="p-2 border text-right text-red-600">Remaining Due</th>
                        <th className="p-2 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getStudentLedger().map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border font-mono">{p.month}</td>
                          <td className="p-2 border">{formatPaymentDate(p.payment_date)}</td>
                          <td className="p-2 border">{p.payment_method || "—"}</td>
                          <td className="p-2 border truncate max-w-[80px]">{p.transaction_id || "—"}</td>
                          <td className="p-2 border text-right">৳{(p.total_fee || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                          <td className="p-2 border text-center flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-[#052E2B] hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handlePrintReceipt(p)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) {
                                  deletePaymentMutation.mutate(p.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {getStudentLedger().length === 0 && (
                        <tr>
                          <td colSpan="8" className="p-6 text-center text-slate-400 italic">Please select a student to load their payout ledger.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* dialog setup tuition fee modal */}
      <Dialog open={showAddFeeModal} onOpenChange={setShowAddFeeModal}>
        <DialogContent className="max-w-md rounded-2xl bg-white border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#052E2B]">
              Configure Predefined tuition fee
            </DialogTitle>
          </DialogHeader>
          {editingStudentProfile && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p><strong>Student Name:</strong> {editingStudentProfile.full_name_en}</p>
                <p><strong>Roll No:</strong> {editingStudentProfile.roll_number || "—"}</p>
                <p><strong>Class:</strong> {editingStudentProfile.class_name || allClassOptions.find(c => c.id === editingStudentProfile.class_id)?.class_name?.en || ""}</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500">Monthly Tuition Fee (৳) *</Label>
                <Input 
                  type="number" 
                  value={predefinedFeeInput} 
                  onChange={e => setPredefinedFeeInput(e.target.value)} 
                  placeholder="e.g. 3000" 
                  className="mt-1 h-10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddFeeModal(false)}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (!predefinedFeeInput || Number(predefinedFeeInput) < 0) {
                      return toast.error("Please enter a valid tuition fee");
                    }
                    updatePredefinedFeeMutation.mutate({
                      studentId: editingStudentProfile.id,
                      tuitionFee: Number(predefinedFeeInput)
                    });
                  }}
                  disabled={updatePredefinedFeeMutation.isPending}
                  className="bg-[#052E2B] text-white hover:bg-[#042422] font-bold rounded-xl h-10 px-4 text-xs"
                >
                  {updatePredefinedFeeMutation.isPending ? "Saving..." : "Save Contract Details"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* dialog Collect quick Fee modal */}
      <Dialog open={showCollectModal} onOpenChange={setShowCollectModal}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#052E2B]">
              Record Quick Fee Collection Receipt
            </DialogTitle>
          </DialogHeader>
          {selectedPaymentRow && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p><strong>Student Name:</strong> {selectedPaymentRow.student.full_name_en}</p>
                <p><strong>Billing Period:</strong> {dueYear}-{dueMonth}</p>
                <p><strong>Predefined Monthly Fee:</strong> ৳{selectedPaymentRow.monthlyFee.toLocaleString()}</p>
                <p><strong>Already Paid:</strong> ৳{selectedPaymentRow.paidAmount.toLocaleString()}</p>
                <p><strong>Current Remaining Due:</strong> ৳{selectedPaymentRow.dueAmount.toLocaleString()}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const amt = e.target.amount.value;
                const method = e.target.payment_method.value;
                const dateVal = e.target.payment_date.value;
                const txn = e.target.transaction_id.value;
                const notesVal = e.target.notes.value;

                if (!amt || Number(amt) <= 0) return toast.error("Please enter a valid amount");

                handleSavePaymentQuick({
                  amount: Number(amt),
                  payment_method: method,
                  payment_date: dateVal,
                  transaction_id: txn,
                  notes: notesVal
                });
              }} className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Amount Paid (৳) *</Label>
                  <Input 
                    name="amount"
                    type="number" 
                    defaultValue={selectedPaymentRow.dueAmount}
                    required 
                    className="mt-1 h-10 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Payment Date *</Label>
                    <Input name="payment_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 h-10 rounded-xl text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Payment Method *</Label>
                    <Select name="payment_method" defaultValue="Cash">
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="bKash">bKash</SelectItem>
                        <SelectItem value="Nagad">Nagad</SelectItem>
                        <SelectItem value="Rocket">Rocket</SelectItem>
                        <SelectItem value="Bank">Bank Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-500">Transaction ID (optional)</Label>
                  <Input 
                    name="transaction_id"
                    type="text" 
                    placeholder="Txn ID..." 
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-500">Notes / Remarks</Label>
                  <Input 
                    name="notes"
                    type="text" 
                    placeholder="Reference..." 
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => { setShowCollectModal(false); setSelectedPaymentRow(null); }}
                    className="rounded-xl h-10 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                    className="bg-[#052E2B] text-white hover:bg-[#042422] font-bold rounded-xl h-10 px-4 text-xs"
                  >
                    {createPaymentMutation.isPending ? "Saving..." : "Record Receipt"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
