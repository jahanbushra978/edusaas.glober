import React, { useState, useEffect, useMemo } from "react";
import { appClient } from "@/api/appClient";
import { supabaseAdmin } from "@/lib/supabase-admin-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2, Plus, CheckCircle2, Pencil, Trash2, GraduationCap, UserCog,
  Download, BarChart3, Users, Clock, Search, Printer, DollarSign, FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";

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

const PAYMENT_METHODS = ["Cash", "Bank", "bKash", "Nagad", "Rocket", "Other"];

/* ── STUDENT Hadiya Form Modal (Untouched functionality) ── */
function HadiyaFormModal({ open, onClose, students, teachers, editingItem }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(editingItem || {
    recipient_type: "student", recipient_id: "", recipient_name: "",
    month: currentMonth, amount: "", status: "pending", notes: "",
  });
  const [modalSearchText, setModalSearchText] = useState("");

  useEffect(() => {
    if (editingItem) setForm(editingItem);
    else setForm({ recipient_type: "student", recipient_id: "", recipient_name: "", month: currentMonth, amount: "", status: "pending", notes: "" });
    setModalSearchText("");
  }, [editingItem, open]);

  useEffect(() => {
    setModalSearchText("");
  }, [form.recipient_type]);

  const saveMut = useMutation({
    mutationFn: (data) => editingItem
      ? appClient.entities.Hadiya.update(editingItem.id, data)
      : appClient.entities.Hadiya.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hadiya"] }); onClose(); }
  });

  const handleRecipientChange = (id) => {
    const list = form.recipient_type === "student" ? students : teachers;
    const rec = list.find(r => r.id === id);
    
    // Auto-fill student hadiya amount if student is selected
    let autoAmount = "";
    if (form.recipient_type === "student" && rec) {
      autoAmount = rec.hadiya_amount ? String(rec.hadiya_amount) : "";
    }

    setForm(f => ({ 
      ...f, 
      recipient_id: id, 
      recipient_name: rec ? (rec.full_name_bn || rec.full_name_en) : "",
      amount: autoAmount
    }));
  };

  const recipientList = form.recipient_type === "student" ? students : teachers;

  const filteredRecipientList = useMemo(() => {
    if (!modalSearchText) return recipientList;
    const searchLower = modalSearchText.toLowerCase();
    return recipientList.filter(r => 
      r.full_name_bn?.toLowerCase().includes(searchLower) ||
      r.full_name_en?.toLowerCase().includes(searchLower) ||
      String(r.roll_number || "").toLowerCase().includes(searchLower) ||
      String(r.teacher_id || "").toLowerCase().includes(searchLower) ||
      String(r.id || "").toLowerCase().includes(searchLower)
    );
  }, [recipientList, modalSearchText]);

  const selectedRec = recipientList.find(r => r.id === form.recipient_id);
  const baseAmount = form.recipient_type === "student" && selectedRec ? Number(selectedRec.hadiya_amount || 0) : 0;
  const enteredAmount = Number(form.amount || 0);
  const remainingDue = Math.max(0, baseAmount - enteredAmount);

  // Auto update status to "paid" if they enter the full amount, or "pending" if it's less
  useEffect(() => {
    if (baseAmount > 0 && enteredAmount > 0) {
      if (enteredAmount >= baseAmount) {
        setForm(f => ({ ...f, status: "paid" }));
      } else {
        setForm(f => ({ ...f, status: "pending" }));
      }
    }
  }, [enteredAmount, baseAmount]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">{editingItem ? "Edit Hadiya Record" : "Add New Hadiya"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate({ ...form, amount: Number(form.amount) }); }} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Recipient Type</Label>
            <Select value={form.recipient_type} onValueChange={v => setForm(f => ({ ...f, recipient_type: v, recipient_id: "", recipient_name: "" }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Search Recipient (Optional)</Label>
            <Input 
              type="text" 
              placeholder="Type name, roll, or ID..." 
              value={modalSearchText} 
              onChange={e => setModalSearchText(e.target.value)} 
              className="rounded-xl h-10 mb-2" 
            />
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Select Recipient</Label>
            <Select value={form.recipient_id} onValueChange={handleRecipientChange}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={filteredRecipientList.length === 0 ? "No matches found" : "Choose recipient"} /></SelectTrigger>
              <SelectContent>
                {filteredRecipientList.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.full_name_bn || r.full_name_en} {r.roll_number ? `(#${r.roll_number})` : r.teacher_id ? `(${r.teacher_id})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Month</Label>
              <Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="rounded-xl" required />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Amount (৳)</Label>
              <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="rounded-xl" required />
            </div>
          </div>

          {selectedRec && form.recipient_type === "student" && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 font-sans">
              <p className="font-bold text-[#052E2B] uppercase tracking-wide text-[10px]">Live Calculation Console</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 border-t border-slate-200 mt-1">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Standard Hadiya</span>
                  <span className="font-semibold text-slate-800">৳{baseAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Entered Payment</span>
                  <span className="font-semibold text-slate-800">৳{enteredAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Remaining Due</span>
                  <span className={`font-bold block ${remainingDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ৳{remainingDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes (Optional)</Label>
            <Input value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional info..." className="rounded-xl" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={saveMut.isPending} className="gap-2 bg-primary hover:bg-primary/95 text-white rounded-xl">
              {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── BULK PAYMENT CONFIRM MODAL (Untouched functionality for students) ── */
function BulkPayModal({ open, onClose, pendingList, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Mark All as Paid</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <p className="text-sm text-muted-foreground">{pendingList.length} hadiya records will be marked as "Paid":</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {pendingList.map(h => (
              <div key={h.id} className="flex justify-between text-sm px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span>{h.recipient_name}</span>
                <span className="font-semibold text-emerald-600">৳{(h.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark All as Paid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── MAIN HadiyaForm COMPONENT ── */
export default function HadiyaForm({ students = [], teachers = [], currentUser }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("student");
  const [viewTab, setViewTab] = useState("list");
  
  // Student state (untouched logic)
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [showBulkPay, setShowBulkPay] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Refactored Teacher Salary Sub-tab state
  const [teacherActiveTab, setTeacherActiveTab] = useState("payout");

  // Sub-tab 1: Payout Entry States
  const [payBranch, setPayBranch] = useState("");
  const [payTeacherId, setPayTeacherId] = useState("");
  const [payoutTeacherSearch, setPayoutTeacherSearch] = useState("");
  const [payMonth, setPayMonth] = useState(format(new Date(), "MM"));
  const [payYear, setPayYear] = useState(format(new Date(), "yyyy"));
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payTxnId, setPayTxnId] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Sub-tab 2: Due List Grid States
  const [dueBranchId, setDueBranchId] = useState("");
  const [dueYear, setDueYear] = useState(format(new Date(), "yyyy"));
  const [dueSearch, setDueSearch] = useState("");
  const [dueViewType, setDueViewType] = useState("monthly"); // "monthly" | "yearly"
  const [dueMonth, setDueMonth] = useState(format(new Date(), "MM"));
  const [dueStatusFilter, setDueStatusFilter] = useState("all"); // "all" | "paid" | "due"

  // Sub-tab 3: Salary Setup/Profiles States
  const [profileBranch, setProfileBranch] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [showAddSalaryModal, setShowAddSalaryModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  // Sub-tab 4: Reports States
  const [repType, setRepType] = useState("ledger"); // "ledger" | "monthly" | "branch"
  const [repBranch, setRepBranch] = useState("");
  const [repTeacherId, setRepTeacherId] = useState("");
  const [repMonth, setRepMonth] = useState(format(new Date(), "MM"));
  const [repYear, setRepYear] = useState(format(new Date(), "yyyy"));

  // Quick action modals
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTeacherRow, setDrawerTeacherRow] = useState(null);

  // Fetch branches
  const { data: rawBranches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["hadiya-branches-list"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  // Set default branch for branch admins
  useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      const bName = branches[0]?.name_en || branches[0]?.branch_name || "";
      setPayBranch(bName);
      setDueBranchId(bName);
      setProfileBranch(bName);
      setRepBranch(bName);
    }
  }, [currentUser, rawBranches]);

  // Fetch all Hadiya records
  const { data: hadiyaList = [], isLoading } = useQuery({
    queryKey: ["hadiya"],
    queryFn: () => appClient.entities.Hadiya.listAll({ sort: "-month" }),
  });

  // Fetch all Teacher Hadiya setups (from TeacherSalaryProfile)
  const { data: teacherHadiyas = [], refetch: refetchHadiyas } = useQuery({
    queryKey: ["teacher-hadiya"],
    queryFn: async () => {
      const list = await appClient.entities.TeacherSalaryProfile.listAll({ sort: "id" });
      return list
        .filter(item => item.status === "active")
        .map(item => ({
          ...item,
          salary_type: item.hadiya_type || "Basic Salary", // map hadiya_type to salary_type for compatibility
        }));
    },
  });

  // Fetch all Teacher Payments (from teacher_payments)
  const { data: teacherPayments = [], refetch: refetchPayments } = useQuery({
    queryKey: ["teacher-payments"],
    queryFn: () => appClient.entities.TeacherPayment.listAll({ sort: "id" }),
  });

  // Student mutations
  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Hadiya.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hadiya"] }),
  });

  const markPaidMut = useMutation({
    mutationFn: ({ id }) => appClient.entities.Hadiya.update(id, { status: "paid", paid_date: format(new Date(), "yyyy-MM-dd") }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hadiya"] }),
  });

  // Teacher Profile Mutations (re-routed to TeacherSalaryProfile)
  const createProfileMutation = useMutation({
    mutationFn: (d) => appClient.entities.TeacherSalaryProfile.create({
      ...d,
      hadiya_type: d.salary_type || "Basic Salary",
      status: "active"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-hadiya"] });
      toast.success("Salary profile created successfully!");
      refetchHadiyas();
    },
    onError: (err) => toast.error(err?.message || "Failed to create salary profile")
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.TeacherSalaryProfile.update(id, {
      ...d,
      hadiya_type: d.salary_type || "Basic Salary"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-hadiya"] });
      toast.success("Salary profile updated successfully!");
      refetchHadiyas();
    },
    onError: (err) => toast.error(err?.message || "Failed to update salary profile")
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id) => appClient.entities.TeacherSalaryProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-hadiya"] });
      toast.success("Salary profile deleted.");
      refetchHadiyas();
    },
    onError: (err) => toast.error(err?.message || "Failed to delete salary profile")
  });

  // Teacher Payment Mutations
  const createPaymentMutation = useMutation({
    mutationFn: async (d) => {
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('teacher_payments')
        .select('id')
        .eq('teacher_id', d.teacher_id)
        .eq('month', d.month)
        .eq('year', d.year)
        .maybeSingle();

      if (lookupError) throw lookupError;

      const payload = {
        teacher_id: d.teacher_id,
        month: d.month,
        year: d.year,
        salary_amount: d.salary_amount,
        paid_amount: d.paid_amount,
        due_amount: d.due_amount,
        payment_method: d.payment_method,
        transaction_id: d.transaction_id,
        payment_date: d.payment_date,
        status: d.status,
        notes: d.notes
      };

      const query = existing
        ? supabaseAdmin.from('teacher_payments').update(payload).eq('id', existing.id)
        : supabaseAdmin.from('teacher_payments').insert(payload);

      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-payments"] });
      toast.success("Salary payment recorded successfully!");
      refetchPayments();
    },
    onError: (err) => toast.error(err?.message || "Failed to record payment")
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.TeacherPayment.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-payments"] });
      toast.success("Salary payment updated successfully!");
      refetchPayments();
    },
    onError: (err) => toast.error(err?.message || "Failed to update payment")
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id) => appClient.entities.TeacherPayment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-payments"] });
      toast.success("Payment record deleted.");
      refetchPayments();
    },
    onError: (err) => toast.error(err?.message || "Failed to delete payment")
  });

  // Calculate student hadiya variables (untouched logic)
  const filteredStudentsHadiya = hadiyaList.filter(h => h.recipient_type === "student" && (!filterMonth || h.month === filterMonth));
  const pendingStudentsList = filteredStudentsHadiya.filter(h => h.status === "pending");
  const totalStudentAmount = filteredStudentsHadiya.reduce((s, h) => s + (Number(h.amount) || 0), 0);
  const paidStudentAmount = filteredStudentsHadiya.filter(h => h.status === "paid").reduce((s, h) => s + (Number(h.amount) || 0), 0);
  const pendingStudentAmount = filteredStudentsHadiya.filter(h => h.status === "pending").reduce((s, h) => s + (Number(h.amount) || 0), 0);

  const studentMonthlyReport = (() => {
    const months = {};
    hadiyaList.filter(h => h.recipient_type === "student").forEach(h => {
      if (!months[h.month]) months[h.month] = { month: h.month, total: 0, paid: 0, pending: 0, count: 0 };
      months[h.month].total += Number(h.amount) || 0;
      months[h.month].count++;
      if (h.status === "paid") months[h.month].paid += Number(h.amount) || 0;
      else months[h.month].pending += Number(h.amount) || 0;
    });
    return Object.values(months).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12);
  })();

  const handleBulkPay = async () => {
    setBulkLoading(true);
    for (const h of pendingStudentsList) {
      await appClient.entities.Hadiya.update(h.id, { status: "paid", paid_date: format(new Date(), "yyyy-MM-dd") });
    }
    queryClient.invalidateQueries({ queryKey: ["hadiya"] });
    setBulkLoading(false);
    setShowBulkPay(false);
  };

  const exportStudentHadiya = () => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["Recipient Type", "Name", "Month", "Amount (৳)", "Status", "Paid Date", "Notes"];
    const rows = filteredStudentsHadiya.map(h => [
      "Student", h.recipient_name || "", h.month, h.amount || 0,
      h.status === "paid" ? "Paid" : "Pending",
      h.paid_date || "", h.notes || ""
    ]);
    const csv = "\uFEFF" + [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hadiya_student_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentYear = format(new Date(), "yyyy");
  const currentMonthNumber = format(new Date(), "MM");

  // Save Salary Profile (Creates or Updates)
  const handleSaveTeacherSalary = async (formData, profileId) => {
    const payload = {
      teacher_id: formData.teacher_id,
      amount: Number(formData.amount),
      hadiya_type: formData.salary_type || "Basic Salary",
      payment_cycle: formData.payment_cycle || "Monthly",
      effective_date: formData.effective_date || null,
      notes: formData.notes || "",
      status: "active"
    };

    if (profileId) {
      updateProfileMutation.mutate({ id: profileId, d: payload });
    } else {
      createProfileMutation.mutate(payload, {
        onSuccess: async () => {
          // Auto create a blank payment log for current month
          const existing = teacherPayments.find(p => p.teacher_id === formData.teacher_id && p.month === currentMonthNumber && p.year === currentYear);
          if (!existing) {
            await createPaymentMutation.mutateAsync({
              teacher_id: formData.teacher_id,
              month: currentMonthNumber,
              year: currentYear,
              salary_amount: Number(formData.amount),
              paid_amount: 0,
              due_amount: Number(formData.amount),
              status: "Due"
            });
          }
        }
      });
    }
  };

  // Inline Payout Auto-Calculation
  const selectedPayTeacher = teachers.find(t => t.teacher_id === payTeacherId);
  const selectedPayProfile = teacherHadiyas.find(h => h.teacher_id === payTeacherId);
  const selectedPayPayment = teacherPayments.find(p => p.teacher_id === payTeacherId && p.month === payMonth && p.year === payYear);

  const latestPayRecord = useMemo(() => {
    if (!payTeacherId) return null;
    return [...teacherPayments]
      .filter(p => p.teacher_id === payTeacherId && p.payment_date)
      .sort((a, b) => b.payment_date.localeCompare(a.payment_date))[0];
  }, [teacherPayments, payTeacherId]);

  const payProfileSalary = selectedPayProfile ? Number(selectedPayProfile.amount) : 0;
  const payPaidSoFar = selectedPayPayment ? Number(selectedPayPayment.paid_amount) : 0;
  const payRemainingDue = selectedPayPayment ? Number(selectedPayPayment.due_amount) : payProfileSalary;
  
  const payStatusCalculated = (() => {
    if (selectedPayPayment) return selectedPayPayment.status;
    const nowKey = format(new Date(), "yyyy-MM");
    const selectedKey = `${payYear}-${payMonth}`;
    return selectedKey < nowKey ? "Overdue" : "Due";
  })();

  // Autofill payAmount with remaining due on teacher change
  useEffect(() => {
    if (payTeacherId) {
      setPayAmount(String(payRemainingDue));
    } else {
      setPayAmount("");
    }
  }, [payTeacherId, payMonth, payYear, teacherPayments, teacherHadiyas]);

  // Handle Save Payout Submission
  const handleSavePayout = async (e) => {
    e.preventDefault();
    if (!payTeacherId) return toast.error("Please select a teacher");
    if (!payAmount || Number(payAmount) <= 0) return toast.error("Please enter a valid payout amount");

    const amountPaid = Number(payAmount);
    const newPaidAmount = payPaidSoFar + amountPaid;
    const newDueAmount = Math.max(0, payProfileSalary - newPaidAmount);

    let status = "Due";
    if (newPaidAmount >= payProfileSalary) {
      status = "Paid";
    } else if (newPaidAmount > 0) {
      status = "Partial";
    }

    const selectedMonthKey = `${payYear}-${payMonth}`;
    const currentMonthKey = `${currentYear}-${currentMonthNumber}`;
    if (selectedMonthKey < currentMonthKey && newPaidAmount < payProfileSalary) {
      status = "Overdue";
    }

    const payload = {
      teacher_id: payTeacherId,
      month: payMonth,
      year: payYear,
      salary_amount: payProfileSalary,
      paid_amount: newPaidAmount,
      due_amount: newDueAmount,
      payment_method: payMethod,
      transaction_id: payTxnId,
      payment_date: payDate,
      status: status,
      notes: payNotes
    };

    if (selectedPayPayment) {
      updatePaymentMutation.mutate({ id: selectedPayPayment.id, d: payload }, {
        onSuccess: () => {
          setPayTxnId("");
          setPayNotes("");
        }
      });
    } else {
      // Check for duplicate payment before saving!
      const existing = await supabaseAdmin
        .from('teacher_payments')
        .select('id')
        .eq('teacher_id', payTeacherId)
        .eq('month', payMonth)
        .eq('year', payYear)
        .maybeSingle();

      if (existing.data) {
        toast.error('Already Paid for this month');
        return;
      }

      createPaymentMutation.mutate(payload, {
        onSuccess: () => {
          setPayTxnId("");
          setPayNotes("");
        }
      });
    }
  };

  // Quick Action: Save payment from modal (Due Grid or Ledger)
  const handleSavePayment = async (paymentData) => {
    const row = selectedPaymentRow;
    if (!row) return;

    const amountPaid = Number(paymentData.amount);
    const newPaidAmount = (row.paidAmount || 0) + amountPaid;
    const newDueAmount = Math.max(0, row.salaryAmount - newPaidAmount);

    let status = "Due";
    if (newPaidAmount >= row.salaryAmount) {
      status = "Paid";
    } else if (newPaidAmount > 0) {
      status = "Partial";
    }

    const rowMonth = row.month || selectedMonthNumber;
    const rowYear = row.year || selectedYear;

    const selectedMonthKey = `${rowYear}-${rowMonth}`;
    const currentMonthKey = `${currentYear}-${currentMonthNumber}`;
    if (selectedMonthKey < currentMonthKey && newPaidAmount < row.salaryAmount) {
      status = "Overdue";
    }

    const payload = {
      teacher_id: row.teacher.teacher_id,
      month: rowMonth,
      year: rowYear,
      salary_amount: row.salaryAmount,
      paid_amount: newPaidAmount,
      due_amount: newDueAmount,
      payment_method: paymentData.payment_method,
      payment_date: paymentData.payment_date,
      transaction_id: paymentData.transaction_id,
      status: status,
      notes: paymentData.notes
    };

    if (row.payment) {
      updatePaymentMutation.mutate({ id: row.payment.id, d: payload });
    } else {
      // Check for duplicate payment before saving!
      const existing = await supabaseAdmin
        .from('teacher_payments')
        .select('id')
        .eq('teacher_id', row.teacher.teacher_id)
        .eq('month', rowMonth)
        .eq('year', rowYear)
        .maybeSingle();

      if (existing.data) {
        toast.error('Already Paid for this month');
        return;
      }

      createPaymentMutation.mutate(payload);
    }
  };

  // Generate Dues Sheet for Teacher grid
  const dueGridData = useMemo(() => {
    if (!dueBranchId) return [];

    return teacherHadiyas.map(hadiya => {
      const teacher = teachers.find(t => t.teacher_id === hadiya.teacher_id);
      if (!teacher) return null;

      // Filter by branch
      if (dueBranchId !== "all_branches" && teacher.branch !== dueBranchId) return null;

      // Filter by search query
      if (dueSearch) {
        const q = dueSearch.toLowerCase();
        const matchName = teacher.full_name_en?.toLowerCase().includes(q);
        const matchId = teacher.teacher_id?.toLowerCase().includes(q);
        if (!matchName && !matchId) return null;
      }

      const salaryAmount = Number(hadiya.amount);
      const monthlyDues = {};
      let totalDueSum = 0;

      MONTHS_LIST.forEach(m => {
        const payment = teacherPayments.find(p => p.teacher_id === hadiya.teacher_id && p.month === m.key && p.year === dueYear);
        if (payment) {
          monthlyDues[m.key] = Number(payment.due_amount);
        } else {
          monthlyDues[m.key] = salaryAmount;
        }
        totalDueSum += monthlyDues[m.key];
      });

      return {
        teacher,
        hadiya,
        monthlyDues,
        totalDueSum,
        salaryAmount,
        year: dueYear
      };
    }).filter(Boolean);
  }, [teacherHadiyas, teacherPayments, teachers, dueBranchId, dueYear, dueSearch]);

  // Generate Monthly Payout Status List
  const dueMonthlyData = useMemo(() => {
    if (!dueBranchId) return [];

    return teacherHadiyas.map(hadiya => {
      const teacher = teachers.find(t => t.teacher_id === hadiya.teacher_id);
      if (!teacher) return null;

      // Filter by branch
      if (dueBranchId !== "all_branches" && teacher.branch !== dueBranchId) return null;

      // Filter by search query
      if (dueSearch) {
        const q = dueSearch.toLowerCase();
        const matchName = teacher.full_name_en?.toLowerCase().includes(q);
        const matchId = teacher.teacher_id?.toLowerCase().includes(q);
        if (!matchName && !matchId) return null;
      }

      const salaryAmount = Number(hadiya.amount);
      const payment = teacherPayments.find(p => p.teacher_id === hadiya.teacher_id && p.month === dueMonth && p.year === dueYear);

      const paidAmount = payment ? Number(payment.paid_amount) : 0;
      const dueAmount = payment ? Number(payment.due_amount) : salaryAmount;

      let status = "Due";
      if (payment) {
        status = payment.status;
      } else {
        const nowKey = format(new Date(), "yyyy-MM");
        const selectedKey = `${dueYear}-${dueMonth}`;
        status = selectedKey < nowKey ? "Overdue" : "Due";
      }

      // Filter by status (all / paid / due)
      if (dueStatusFilter === "paid" && status !== "Paid") return null;
      if (dueStatusFilter === "due" && status === "Paid") return null;

      return {
        teacher,
        hadiya,
        salaryAmount,
        paidAmount,
        dueAmount,
        status,
        payment,
        month: dueMonth,
        year: dueYear
      };
    }).filter(Boolean);
  }, [teacherHadiyas, teacherPayments, teachers, dueBranchId, dueMonth, dueYear, dueSearch, dueStatusFilter]);

  // Count Paid, Due, and All teachers for selected month
  const monthlyCounts = useMemo(() => {
    if (!dueBranchId) return { all: 0, paid: 0, due: 0 };
    let all = 0, paid = 0, due = 0;
    teacherHadiyas.forEach(hadiya => {
      const teacher = teachers.find(t => t.teacher_id === hadiya.teacher_id);
      if (!teacher) return;
      if (dueBranchId !== "all_branches" && teacher.branch !== dueBranchId) return;
      
      const salaryAmount = Number(hadiya.amount);
      const payment = teacherPayments.find(p => p.teacher_id === hadiya.teacher_id && p.month === dueMonth && p.year === dueYear);

      let status = "Due";
      if (payment) {
        status = payment.status;
      } else {
        const nowKey = format(new Date(), "yyyy-MM");
        const selectedKey = `${dueYear}-${dueMonth}`;
        status = selectedKey < nowKey ? "Overdue" : "Due";
      }

      all++;
      if (status === "Paid") {
        paid++;
      } else {
        due++;
      }
    });
    return { all, paid, due };
  }, [teacherHadiyas, teacherPayments, teachers, dueBranchId, dueMonth, dueYear]);

  // Profiles Grid Setup
  const profilesGridData = useMemo(() => {
    return teachers.filter(t => t.status === "active").map(teacher => {
      const profile = teacherHadiyas.find(h => h.teacher_id === teacher.teacher_id);
      return {
        teacher,
        profile
      };
    }).filter(row => {
      if (profileBranch && profileBranch !== "all_branches" && row.teacher.branch !== profileBranch) return false;
      if (profileSearch) {
        const q = profileSearch.toLowerCase();
        return row.teacher.full_name_en?.toLowerCase().includes(q) || row.teacher.teacher_id?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [teachers, teacherHadiyas, profileBranch, profileSearch]);

  // Compile Teacher Salary list (for legacy reports preview)
  const getMonthlyPayoutReport = () => {
    return teacherPayments.filter(p => p.month === repMonth && p.year === repYear).map(p => {
      const teacher = teachers.find(t => t.teacher_id === p.teacher_id);
      return { ...p, teacher };
    }).filter(p => p.teacher && (repBranch === "all_branches" || p.teacher.branch === repBranch));
  };

  const getBranchPayoutReport = () => {
    return teacherPayments.filter(p => p.year === repYear).map(p => {
      const teacher = teachers.find(t => t.teacher_id === p.teacher_id);
      return { ...p, teacher };
    }).filter(p => p.teacher && p.teacher.branch === repBranch);
  };

  const getTeacherLedger = () => {
    if (!repTeacherId) return [];
    return teacherPayments.filter(p => p.teacher_id === repTeacherId).map(p => {
      const teacher = teachers.find(t => t.teacher_id === p.teacher_id);
      return { ...p, teacher };
    }).sort((a, b) => `${a.year}-${a.month}`.localeCompare(`${b.year}-${b.month}`));
  };

  // PDF Reports Exporters
  const generateHistoryPDF = async (teacher, history, summary) => {
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    const styles = StyleSheet.create({
      page: { padding: 40, fontSize: 10, color: '#334155', fontFamily: 'Helvetica' },
      header: { borderBottom: '2px solid #052E2B', paddingBottom: 10, marginBottom: 20 },
      headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#052E2B', textAlign: 'center' },
      headerSubtitle: { fontSize: 10, color: '#b45309', textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
      docTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f766e', marginTop: 15, marginBottom: 15, textAlign: 'center' },
      infoGrid: { flexDirection: 'row', flexWrap: 'wrap', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12, marginBottom: 20, backgroundColor: '#f8fafc' },
      infoCol: { width: '50%', marginBottom: 6 },
      infoLabel: { fontWeight: 'bold', color: '#64748b' },
      infoValue: { color: '#0f172a' },
      summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
      summaryCard: { flex: 1, border: '1px solid #e2e8f0', borderRadius: 6, padding: 10, marginRight: 8, backgroundColor: '#f8fafc', alignItems: 'center' },
      summaryCardLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
      summaryCardValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
      table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
      tableHeader: { flexDirection: 'row', backgroundColor: '#052E2B', color: '#ffffff', fontWeight: 'bold', padding: 6 },
      tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 6 },
      tableRowEven: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 6, backgroundColor: '#f8fafc' },
      colMonth: { width: '15%' },
      colSalary: { width: '15%', textAlign: 'right' },
      colPaid: { width: '15%', textAlign: 'right' },
      colDue: { width: '15%', textAlign: 'right' },
      colMethod: { width: '15%' },
      colDate: { width: '15%' },
      colStatus: { width: '10%', textAlign: 'center' },
      footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8' }
    });

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE</Text>
            <Text style={styles.headerSubtitle}>Teacher Payout & Salary Management System</Text>
          </View>
          <Text style={styles.docTitle}>Teacher Salary History Statement</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Teacher Name: </Text><Text style={styles.infoValue}>{teacher.full_name_en}</Text></Text>
            </View>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Teacher ID: </Text><Text style={styles.infoValue}>{teacher.teacher_id}</Text></Text>
            </View>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Branch: </Text><Text style={styles.infoValue}>{teacher.branch || "—"}</Text></Text>
            </View>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Department: </Text><Text style={styles.infoValue}>{teacher.department || "—"}</Text></Text>
            </View>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Joining Date: </Text><Text style={styles.infoValue}>{teacher.joining_date || "—"}</Text></Text>
            </View>
            <View style={styles.infoCol}>
              <Text><Text style={styles.infoLabel}>Current Salary: </Text><Text style={styles.infoValue}>৳{summary.currentSalary.toLocaleString()}</Text></Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Paid</Text>
              <Text style={styles.summaryCardValue}>৳{summary.totalPaid.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Due</Text>
              <Text style={styles.summaryCardValue}>৳{summary.totalDue.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard} style={{ marginRight: 0 }}>
              <Text style={styles.summaryCardLabel}>Total Overdue</Text>
              <Text style={[styles.summaryCardValue, { color: '#ef4444' }]}>৳{summary.totalOverdue.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colMonth}>Month</Text>
              <Text style={styles.colSalary}>Salary</Text>
              <Text style={styles.colPaid}>Paid</Text>
              <Text style={styles.colDue}>Due</Text>
              <Text style={styles.colMethod}>Method</Text>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colStatus}>Status</Text>
            </View>
            {history.map((row, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={styles.colMonth}>{row.month}</Text>
                <Text style={styles.colSalary}>৳{row.salaryAmount.toLocaleString()}</Text>
                <Text style={styles.colPaid}>৳{row.paidAmount.toLocaleString()}</Text>
                <Text style={styles.colDue}>৳{row.dueAmount.toLocaleString()}</Text>
                <Text style={styles.colMethod}>{row.paymentMethod || "—"}</Text>
                <Text style={styles.colDate}>{row.paymentDate || "—"}</Text>
                <Text style={[styles.colStatus, { 
                  color: row.status === 'Paid' ? '#10b981' : 
                         row.status === 'Partial' ? '#f59e0b' : 
                         row.status === 'Overdue' ? '#ef4444' : '#3b82f6',
                  fontWeight: 'bold'
                }]}>{row.status}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <Text>Report Generated: {new Date().toLocaleString()}</Text>
            <Text>Page 1 of 1</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_History_${teacher.teacher_id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateBranchReportPDF = async (branchName, month, year, rows) => {
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    const styles = StyleSheet.create({
      page: { padding: 40, fontSize: 9, color: '#334155', fontFamily: 'Helvetica' },
      header: { borderBottom: '2px solid #052E2B', paddingBottom: 10, marginBottom: 20 },
      headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#052E2B', textAlign: 'center' },
      headerSubtitle: { fontSize: 9, color: '#b45309', textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
      docTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f766e', marginTop: 10, marginBottom: 15, textAlign: 'center' },
      infoGrid: { flexDirection: 'row', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10, marginBottom: 20, backgroundColor: '#f8fafc' },
      infoItem: { fontSize: 10 },
      infoLabel: { fontWeight: 'bold', color: '#64748b' },
      infoValue: { color: '#0f172a' },
      table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
      tableHeader: { flexDirection: 'row', backgroundColor: '#052E2B', color: '#ffffff', fontWeight: 'bold', padding: 5 },
      tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 5 },
      tableRowEven: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 5, backgroundColor: '#f8fafc' },
      colId: { width: '15%' },
      colName: { width: '25%' },
      colDept: { width: '20%' },
      colSalary: { width: '13%', textAlign: 'right' },
      colPaid: { width: '13%', textAlign: 'right' },
      colDue: { width: '14%', textAlign: 'right' },
      footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8' }
    });

    const totalSalary = rows.reduce((s, r) => s + r.salaryAmount, 0);
    const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0);
    const totalDue = rows.reduce((s, r) => s + r.dueAmount, 0);
    const teacherCount = rows.length;

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE</Text>
            <Text style={styles.headerSubtitle}>Teacher Payout & Salary Management System</Text>
          </View>
          <Text style={styles.docTitle}>Branch Salary Payroll Report — {month}/{year}</Text>
          <View style={styles.infoGrid}>
            <View>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Branch: </Text><Text style={styles.infoValue}>{branchName}</Text></Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Month: </Text><Text style={styles.infoValue}>{month} / {year}</Text></Text>
            </View>
            <View>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Teachers: </Text><Text style={styles.infoValue}>{teacherCount}</Text></Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Total Salary: </Text><Text style={styles.infoValue}>৳{totalSalary.toLocaleString()}</Text></Text>
            </View>
            <View>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Total Paid: </Text><Text style={styles.infoValue}>৳{totalPaid.toLocaleString()}</Text></Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Total Due: </Text><Text style={styles.infoValue}>৳{totalDue.toLocaleString()}</Text></Text>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colId}>ID</Text>
              <Text style={styles.colName}>Teacher Name</Text>
              <Text style={styles.colDept}>Department</Text>
              <Text style={styles.colSalary}>Salary</Text>
              <Text style={styles.colPaid}>Paid</Text>
              <Text style={styles.colDue}>Due</Text>
            </View>
            {rows.map((row, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={styles.colId}>{row.teacher.teacher_id}</Text>
                <Text style={styles.colName}>{row.teacher.full_name_en}</Text>
                <Text style={styles.colDept}>{row.teacher.department || "General"}</Text>
                <Text style={styles.colSalary}>৳{row.salaryAmount.toLocaleString()}</Text>
                <Text style={styles.colPaid}>৳{row.paidAmount.toLocaleString()}</Text>
                <Text style={styles.colDue}>৳{row.dueAmount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <Text>Report Generated: {new Date().toLocaleString()}</Text>
            <Text>Authorized Signature: ______________________</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Branch_Salary_Report_${branchName.replace(/\s+/g, '_')}_${month}_${year}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Helpers
  const downloadCsv = (filename, headers, rows) => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...rows.map(r => r.map(escape).join(","))
    ];
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintDuesSheet = () => {
    if (dueViewType === "monthly") {
      const monthName = MONTHS_LIST.find(m => m.key === dueMonth)?.name;
      const filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Period</th>
              <th>Status Filter</th>
              <th>Total Teachers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${dueBranchId === "all_branches" ? "All Branches" : dueBranchId}</td>
              <td>${monthName} ${dueYear}</td>
              <td style="text-transform: uppercase;">${dueStatusFilter}</td>
              <td>${dueMonthlyData.length}</td>
            </tr>
          </tbody>
        </table>
      `;

      const headersHtml = `
        <thead>
          <tr>
            <th>Teacher Name</th>
            <th>Teacher ID</th>
            <th>Mobile</th>
            <th class="text-right">Basic Salary</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
      `;

      const rowsHtml = dueMonthlyData.map(row => `
        <tr>
          <td><strong>${row.teacher.full_name_en}</strong></td>
          <td>${row.teacher.teacher_id}</td>
          <td>${row.teacher.phone || "—"}</td>
          <td class="text-right">৳${row.salaryAmount.toLocaleString()}</td>
          <td class="text-right text-emerald-600">৳${row.paidAmount.toLocaleString()}</td>
          <td class="text-right text-red-600"><strong>৳${row.dueAmount.toLocaleString()}</strong></td>
          <td class="text-center"><span style="padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 9px; text-transform: uppercase; background: ${
            row.status === 'Paid' ? '#d1fae5; color: #065f46;' :
            row.status === 'Partial' ? '#fef3c7; color: #92400e;' :
            row.status === 'Overdue' ? '#fee2e2; color: #991b1b;' : '#dbeafe; color: #1e40af;'
          }">${row.status}</span></td>
        </tr>
      `).join("");

      const grandSalary = dueMonthlyData.reduce((s, r) => s + r.salaryAmount, 0);
      const grandPaid = dueMonthlyData.reduce((s, r) => s + r.paidAmount, 0);
      const grandDue = dueMonthlyData.reduce((s, r) => s + r.dueAmount, 0);

      const totalsHtml = `
        <tr class="total-row">
          <td colspan="3">GRAND TOTALS: ${dueMonthlyData.length} TEACHERS</td>
          <td class="text-right">৳${grandSalary.toLocaleString()}</td>
          <td class="text-right text-emerald-600">৳${grandPaid.toLocaleString()}</td>
          <td class="text-right text-red-600">৳${grandDue.toLocaleString()}</td>
          <td></td>
        </tr>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Monthly Salary Status Statement</title>
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
              
              .data-table { width: 100%; border-collapse: collapse; font-size: 10px; text-align: left; }
              .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
              .data-table th { background: #052E2B; color: white; font-weight: 700; text-transform: uppercase; font-size: 9px; }
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
                <h2>Teacher Payout & Salary Management System</h2>
              </div>
              <div style="width:45px;"></div>
            </div>
            <div class="report-title"><span>Teacher Monthly Salary Status Statement</span></div>
            ${filterInfo}
            <table class="data-table">${headersHtml}<tbody>${rowsHtml}${totalsHtml}</tbody></table>
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
    } else {
      const filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Payroll Year</th>
              <th>Total Teachers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${dueBranchId === "all_branches" ? "All Branches" : dueBranchId}</td>
              <td>${dueYear}</td>
              <td>${dueGridData.length}</td>
            </tr>
          </tbody>
        </table>
      `;

      const headersHtml = `
        <thead>
          <tr>
            <th>Teacher Name</th>
            <th>Teacher ID</th>
            <th>Mobile</th>
            ${MONTHS_LIST.map(m => `<th>${m.name}</th>`).join("")}
            <th>Total Due</th>
          </tr>
        </thead>
      `;

      const rowsHtml = dueGridData.map(row => `
        <tr>
          <td><strong>${row.teacher.full_name_en}</strong></td>
          <td>${row.teacher.teacher_id}</td>
          <td>${row.teacher.phone || "—"}</td>
          ${MONTHS_LIST.map(m => {
            const due = row.monthlyDues[m.key];
            return `<td>৳${due.toLocaleString()}</td>`;
          }).join("")}
          <td class="text-right"><strong>৳${row.totalDueSum.toLocaleString()}</strong></td>
        </tr>
      `).join("");

      const grandDuesTotal = dueGridData.reduce((s, r) => s + r.totalDueSum, 0);
      const totalsHtml = `
        <tr class="total-row">
          <td colspan="3">GRAND TOTALS: ${dueGridData.length} TEACHERS</td>
          ${MONTHS_LIST.map(m => {
            const sumMonth = dueGridData.reduce((s, r) => s + r.monthlyDues[m.key], 0);
            return `<td>৳${sumMonth.toLocaleString()}</td>`;
          }).join("")}
          <td class="text-right">৳${grandDuesTotal.toLocaleString()}</td>
        </tr>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Payroll Dues Sheet</title>
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
              
              .data-table { width: 100%; border-collapse: collapse; font-size: 10px; text-align: left; }
              .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
              .data-table th { background: #052E2B; color: white; font-weight: 700; text-transform: uppercase; font-size: 9px; }
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
                <h2>Teacher Payout & Salary Management System</h2>
              </div>
              <div style="width:45px;"></div>
            </div>
            <div class="report-title"><span>Teacher Payroll Dues Sheet</span></div>
            ${filterInfo}
            <table class="data-table">${headersHtml}<tbody>${rowsHtml}${totalsHtml}</tbody></table>
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
    }
  };

  const handleExportDuesCsv = () => {
    if (dueViewType === "monthly") {
      const headers = ["Teacher Name", "Teacher ID", "Mobile", "Basic Salary", "Paid Amount", "Remaining Due", "Status"];
      const rows = dueMonthlyData.map(row => [
        row.teacher.full_name_en,
        row.teacher.teacher_id,
        row.teacher.phone || "",
        row.salaryAmount,
        row.paidAmount,
        row.dueAmount,
        row.status
      ]);
      const monthName = MONTHS_LIST.find(m => m.key === dueMonth)?.name;
      downloadCsv(`teacher_salary_status_${monthName}_${dueYear}.csv`, headers, rows);
    } else {
      const headers = ["Teacher Name", "Teacher ID", "Mobile", ...MONTHS_LIST.map(m => m.name), "Total Due"];
      const rows = dueGridData.map(row => [
        row.teacher.full_name_en,
        row.teacher.teacher_id,
        row.teacher.phone || "",
        ...MONTHS_LIST.map(m => row.monthlyDues[m.key]),
        row.totalDueSum
      ]);
      downloadCsv(`teacher_dues_sheet_${dueYear}.csv`, headers, rows);
    }
  };

  // Print Payout Report (Ledger/Monthly/Branch)
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    let title = "";
    let filterInfo = "";
    let tableHtml = "";

    if (repType === "monthly") {
      const data = getMonthlyPayoutReport();
      const monthName = MONTHS_LIST.find(m => m.key === repMonth)?.name;
      title = `Monthly Payout Register — ${monthName} ${repYear}`;
      tableHtml = `
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Teacher ID</th>
            <th>Teacher Name</th>
            <th>Branch</th>
            <th>Department</th>
            <th>Method</th>
            <th class="text-right">Salary Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Due Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${formatPaymentDate(p.payment_date)}</td>
              <td>${p.teacher_id}</td>
              <td><strong>${p.teacher.full_name_en}</strong></td>
              <td>${p.teacher.branch || "—"}</td>
              <td>${p.teacher.department || "—"}</td>
              <td>${p.payment_method || "—"}</td>
              <td class="text-right">৳${(p.salary_amount || 0).toLocaleString()}</td>
              <td class="text-right">৳${(p.paid_amount || 0).toLocaleString()}</td>
              <td class="text-right">৳${(p.due_amount || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="6">TOTAL PAYOUTS: ${data.length} records</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.salary_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.due_amount) || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      `;
    } else if (repType === "branch") {
      const data = getBranchPayoutReport();
      title = `Branch Wise Payout Register — ${repBranch} (${repYear})`;
      tableHtml = `
        <thead>
          <tr>
            <th>Month</th>
            <th>Teacher ID</th>
            <th>Teacher Name</th>
            <th>Department</th>
            <th>Method</th>
            <th class="text-right">Salary Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Due Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${repYear}-${p.month}</td>
              <td>${p.teacher_id}</td>
              <td><strong>${p.teacher.full_name_en}</strong></td>
              <td>${p.teacher.department || "—"}</td>
              <td>${p.payment_method || "—"}</td>
              <td class="text-right">৳${(p.salary_amount || 0).toLocaleString()}</td>
              <td class="text-right">৳${(p.paid_amount || 0).toLocaleString()}</td>
              <td class="text-right">৳${(p.due_amount || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="5">BRANCH TOTALS: ${data.length} payouts</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.salary_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0).toLocaleString()}</td>
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.due_amount) || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      `;
    } else if (repType === "ledger") {
      const data = getTeacherLedger();
      const repTeacher = teachers.find(t => t.teacher_id === repTeacherId);
      title = `Teacher Ledger Statement — ${repTeacher?.full_name_en || "N/A"}`;
      filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Teacher ID</th>
              <th>Branch</th>
              <th>Department</th>
              <th>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${repTeacher?.teacher_id}</td>
              <td>${repTeacher?.branch || "—"}</td>
              <td>${repTeacher?.department || "—"}</td>
              <td>${repTeacher?.phone || "—"}</td>
            </tr>
          </tbody>
        </table>
      `;

      let runningDueBalance = 0;
      tableHtml = `
        <thead>
          <tr>
            <th>Month</th>
            <th>Date</th>
            <th>Method</th>
            <th>Txn ID</th>
            <th class="text-right">Salary Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Due</th>
            <th class="text-right">Running Due Balance</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => {
            const billed = Number(p.salary_amount) || 0;
            const paid = Number(p.paid_amount) || 0;
            const remaining = Number(p.due_amount) || 0;
            runningDueBalance += remaining;
            return `
              <tr>
                <td>${p.year}-${p.month}</td>
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
            <td class="text-right">৳${data.reduce((s, p) => s + (Number(p.salary_amount) || 0), 0).toLocaleString()}</td>
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
            
            .data-table { width: 100%; border-collapse: collapse; font-size: 10px; text-align: left; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .data-table th { background: #052E2B; color: white; font-weight: 700; text-transform: uppercase; font-size: 9px; }
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
              <h2>Teacher Payout & Salary Management System</h2>
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
    if (repType === "monthly") {
      const data = getMonthlyPayoutReport();
      const headers = ["Date", "Teacher ID", "Teacher Name", "Branch", "Department", "Method", "Salary Amount", "Paid Amount", "Due Amount"];
      const rows = data.map(p => [formatPaymentDate(p.payment_date), p.teacher_id, p.teacher.full_name_en, p.teacher.branch, p.teacher.department, p.payment_method, p.salary_amount, p.paid_amount, p.due_amount]);
      downloadCsv(`teacher_payroll_${repYear}_${repMonth}.csv`, headers, rows);
    } else if (repType === "branch") {
      const data = getBranchPayoutReport();
      const headers = ["Month", "Teacher ID", "Teacher Name", "Department", "Method", "Salary Amount", "Paid Amount", "Due Amount"];
      const rows = data.map(p => [p.month, p.teacher_id, p.teacher.full_name_en, p.teacher.department, p.payment_method, p.salary_amount, p.paid_amount, p.due_amount]);
      downloadCsv(`branch_payroll_${repBranch}_${repYear}.csv`, headers, rows);
    } else if (repType === "ledger") {
      const data = getTeacherLedger();
      const headers = ["Month", "Payment Date", "Method", "Txn ID", "Salary Amount", "Paid Amount", "Remaining Due"];
      const rows = data.map(p => [`${p.year}-${p.month}`, formatPaymentDate(p.payment_date), p.payment_method, p.transaction_id, p.salary_amount, p.paid_amount, p.due_amount]);
      downloadCsv(`teacher_ledger_${repTeacherId}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Hadiya & Salary Management</h2>
          <p className="text-xs text-muted-foreground">Track and record monthly stipends for students and salary payouts for teachers</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {tab === "student" && (
            <>
              <Input type="month" value={filterMonth} onChange={e => { setFilterMonth(e.target.value); }} className="h-9 w-40 rounded-xl" />
              <Button variant="outline" onClick={exportStudentHadiya} className="gap-2 text-xs h-9 rounded-xl">
                <Download className="h-4 w-4" /> Export
              </Button>
              {pendingStudentsList.length > 0 && (
                <Button variant="outline" onClick={() => setShowBulkPay(true)}
                  className="gap-2 text-xs h-9 border-emerald-400 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="h-4 w-4" /> Pay All ({pendingStudentsList.length})
                </Button>
              )}
              <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 text-xs h-9 rounded-xl bg-primary text-white hover:bg-primary/95">
                <Plus className="h-4 w-4" /> Add Stipend
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs: List / Monthly Report */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="list" className="gap-2"><Users className="h-4 w-4" /> stipend & salary List</TabsTrigger>
          <TabsTrigger value="report" className="gap-2"><BarChart3 className="h-4 w-4" /> Monthly Report (Students)</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list" className="mt-3">
          <Tabs value={tab} onValueChange={v => { setTab(v); }}>
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-3">
              <TabsTrigger value="student" className="gap-2"><GraduationCap className="h-4 w-4" /> Student Stipends</TabsTrigger>
              <TabsTrigger value="teacher" className="gap-2"><UserCog className="h-4 w-4" /> Teacher Hadiya & Salary</TabsTrigger>
            </TabsList>

            {/* ── 1. STUDENT HADIYA VIEW (Untouched functionality) ── */}
            <TabsContent value="student" className="space-y-4">
              {/* Student Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Hadiya", value: `৳${totalStudentAmount.toLocaleString()}`, count: `${filteredStudentsHadiya.length} entries`, color: "text-slate-700", bg: "bg-slate-50 border-slate-200", icon: Users },
                  { label: "Paid", value: `৳${paidStudentAmount.toLocaleString()}`, count: `${filteredStudentsHadiya.filter(h => h.status === "paid").length} recipients`, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
                  { label: "Pending", value: `৳${pendingStudentAmount.toLocaleString()}`, count: `${pendingStudentsList.length} remaining`, color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Clock },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className={`rounded-2xl p-3 border ${c.bg}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${c.color}`} />
                        <p className="text-xs text-slate-500 font-sans">{c.label}</p>
                      </div>
                      <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.count}</p>
                    </div>
                  );
                })}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : filteredStudentsHadiya.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No student stipend records for {filterMonth}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudentsHadiya.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{h.recipient_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{h.month}</p>
                            {h.notes && <p className="text-xs text-slate-400 truncate max-w-32">· {h.notes}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-primary">৳{(Number(h.amount) || 0).toLocaleString()}</span>
                        <Badge className={`text-xs ${h.status === "paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {h.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                        </Badge>
                        {h.status === "pending" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Mark as Paid"
                            onClick={() => markPaidMut.mutate({ id: h.id })}>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => { setEditingItem(h); setShowForm(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => window.confirm("Delete this stipend record?") && deleteMut.mutate(h.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── 2. NEW REDESIGNED TEACHER SALARY MODULE ── */}
            <TabsContent value="teacher" className="space-y-6">
              {/* Dynamic Sub Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { id: "payout", label: "💸 Salary Payout (Pay)" },
                  { id: "payroll_grid", label: "📋 Payroll & Due Grid" },
                  { id: "profiles", label: "⚙️ Salary Profiles Setup" },
                  { id: "reports", label: "📊 Reports Center" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTeacherActiveTab(t.id)}
                    className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                      teacherActiveTab === t.id
                        ? "border-[#052E2B] text-[#052E2B]"
                        : "border-transparent text-gray-500 hover:text-[#052E2B] hover:border-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Sub-tab 1: Salary Payout Entry ── */}
              {teacherActiveTab === "payout" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Side: Form Inputs */}
                  <Card className="lg:col-span-2 border-gray-100 rounded-[20px] shadow-sm bg-white">
                    <CardHeader className="border-b border-gray-50/50 p-6">
                      <CardTitle className="text-base font-bold text-[#052E2B]">Teacher Salary Payout Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleSavePayout} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                            <Select value={payBranch} onValueChange={(v) => { setPayBranch(v); setPayTeacherId(""); setPayoutTeacherSearch(""); }} disabled={currentUser?.role === "branch_admin"}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                              <SelectContent>
                                {branches.map(b => (
                                  <SelectItem key={b.id} value={b.name_en || b.branch_name}>{b.name_en || b.branch_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500">Search Teacher (Optional)</Label>
                            <Input 
                              type="text" 
                              placeholder="Type name or ID..." 
                              value={payoutTeacherSearch} 
                              onChange={e => setPayoutTeacherSearch(e.target.value)} 
                              disabled={!payBranch}
                              className="mt-1 h-10 rounded-xl" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500">Teacher *</Label>
                            <Select value={payTeacherId} onValueChange={setPayTeacherId} disabled={!payBranch}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                              <SelectContent>
                                {teachers
                                  .filter(t => t.status === "active" && t.branch === payBranch)
                                  .filter(t => {
                                    if (!payoutTeacherSearch) return true;
                                    const searchLower = payoutTeacherSearch.toLowerCase();
                                    return (
                                      t.full_name_en?.toLowerCase().includes(searchLower) ||
                                      t.full_name_bn?.toLowerCase().includes(searchLower) ||
                                      String(t.teacher_id || "").toLowerCase().includes(searchLower)
                                    );
                                  })
                                  .map(t => (
                                    <SelectItem key={t.id} value={t.teacher_id}>{t.full_name_en} ({t.teacher_id})</SelectItem>
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
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                                {PAYMENT_METHODS.map(m => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-500">Transaction ID (Optional)</Label>
                            <Input 
                              placeholder="TXN..." 
                              value={payTxnId} 
                              onChange={e => setPayTxnId(e.target.value)} 
                              className="mt-1 h-10 rounded-xl" 
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-500">Payout Notes</Label>
                          <Input 
                            placeholder="Memo, remarks, notes..." 
                            value={payNotes} 
                            onChange={e => setPayNotes(e.target.value)} 
                            className="mt-1 h-10 rounded-xl" 
                          />
                        </div>

                        <div className="flex justify-end pt-2 border-t">
                          <Button 
                            type="submit" 
                            className="bg-[#052E2B] hover:bg-[#042422] text-white gap-2 font-bold px-6 h-11 rounded-xl" 
                            disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                          >
                            {(createPaymentMutation.isPending || updatePaymentMutation.isPending) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <DollarSign className="h-4 w-4" />
                            )}
                            Save Payout Entry
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Right Side: Real-time Calculation Console */}
                  <div className="space-y-4">
                    <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-[#052E2B] to-[#042422] text-white p-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-400">Calculation Console</CardTitle>
                        <p className="text-xs text-white/70 italic mt-1 font-sans">Automatic real-time calculation breakdown</p>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        {selectedPayTeacher ? (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-2">
                            <p className="font-bold text-slate-700 truncate">{selectedPayTeacher.full_name_en}</p>
                            <p className="text-slate-500 font-mono mt-0.5">ID: {selectedPayTeacher.teacher_id}</p>
                            <p className="text-slate-400 mt-0.5">{selectedPayTeacher.department || "General"} | {selectedPayTeacher.branch}</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 text-center rounded-xl border border-slate-100 text-xs text-slate-400 italic mb-2">
                            No teacher selected
                          </div>
                        )}

                        <div className="flex justify-between py-2 border-b">
                          <span className="text-xs text-slate-500">Monthly Basic Salary</span>
                          <span className="text-sm font-semibold">৳{payProfileSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-xs text-slate-500">Already Paid (Before This)</span>
                          <span className="text-sm font-semibold text-emerald-600">৳{payPaidSoFar.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-xs text-slate-500">This Payout Amount</span>
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
                            (payPaidSoFar + Number(payAmount || 0)) >= payProfileSalary ? "bg-emerald-100 text-emerald-700" :
                            (payPaidSoFar + Number(payAmount || 0)) > 0 ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {(payPaidSoFar + Number(payAmount || 0)) >= payProfileSalary ? "Paid" :
                             (payPaidSoFar + Number(payAmount || 0)) > 0 ? "Partial" : "Due"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4">
                      <p className="text-xs font-bold text-[#052E2B] mb-2 uppercase tracking-wide">Payout Tips</p>
                      <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed font-sans">
                        <li>Salary structures must first be configured in **Salary Profiles Setup**.</li>
                        <li>Payments logged will instantly update the teacher's running ledger and due sheet.</li>
                        <li>Receipt logs and ledger histories can be printed from the **Reports Center**.</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {/* ── Sub-tab 2: Due List Grid ── */}
              {teacherActiveTab === "payroll_grid" && (
                <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-50/50 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle className="text-base font-bold text-[#052E2B]">
                          {dueViewType === "monthly" ? "Teacher Monthly Salary Status" : "Teacher Yearly Payroll Dues Sheet"}
                        </CardTitle>
                        <p className="text-xs text-slate-400 mt-1">
                          {dueViewType === "monthly" 
                            ? "View who has been paid and who has outstanding dues for the selected month." 
                            : "Live yearly overview of monthly dues across the 12 months of the year."}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* View Toggle */}
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
                    {/* Filters bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                        <Select value={dueBranchId} onValueChange={setDueBranchId} disabled={currentUser?.role === "branch_admin"}>
                          <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_branches">All Branches</SelectItem>
                            {branches.map(b => (
                              <SelectItem key={b.id} value={b.name_en || b.branch_name}>{b.name_en || b.branch_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {dueViewType === "monthly" && (
                        <div className="sm:col-span-2">
                          <Label className="text-xs font-semibold text-slate-500">Month *</Label>
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

                      <div className={dueViewType === "monthly" ? "sm:col-span-2" : "sm:col-span-3"}>
                        <Label className="text-xs font-semibold text-slate-500">Payroll Year *</Label>
                        <Input 
                          type="text" 
                          value={dueYear} 
                          onChange={e => setDueYear(e.target.value)} 
                          placeholder="e.g. 2026" 
                          required 
                          className="mt-1 h-9 rounded-xl text-xs" 
                        />
                      </div>

                      <div className={dueViewType === "monthly" ? "sm:col-span-5" : "sm:col-span-6"}>
                        <Label className="text-xs font-semibold text-slate-500">Search Teacher</Label>
                        <div className="relative mt-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            placeholder="Name or Teacher ID..." 
                            value={dueSearch} 
                            onChange={e => setDueSearch(e.target.value)} 
                            className="pl-9 h-9 rounded-xl text-xs" 
                          />
                        </div>
                      </div>
                    </div>

                    {!dueBranchId ? (
                      <div className="text-center py-12 border rounded-xl border-dashed text-muted-foreground bg-slate-50/50">
                        Please select a Branch to load the Payroll data.
                      </div>
                    ) : (
                      <>
                        {/* Monthly Payout Status View */}
                        {dueViewType === "monthly" && (
                          <div className="space-y-4">
                            {/* Filter Buttons: All, Paid, Due */}
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                type="button"
                                variant={dueStatusFilter === "all" ? "default" : "outline"}
                                onClick={() => setDueStatusFilter("all")}
                                className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                                  dueStatusFilter === "all" ? "bg-[#052E2B] text-white hover:bg-[#052E2B]/90" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                All (সবাই) 
                                <Badge className={`ml-1 h-5 px-1.5 text-[10px] ${
                                  dueStatusFilter === "all" ? "bg-white/20 text-white border-transparent" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {monthlyCounts.all}
                                </Badge>
                              </Button>
                              <Button
                                type="button"
                                variant={dueStatusFilter === "paid" ? "default" : "outline"}
                                onClick={() => setDueStatusFilter("paid")}
                                className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                                  dueStatusFilter === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Paid (পরিশোধিত) 
                                <Badge className={`ml-1 h-5 px-1.5 text-[10px] ${
                                  dueStatusFilter === "paid" ? "bg-white/20 text-white border-transparent" : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {monthlyCounts.paid}
                                </Badge>
                              </Button>
                              <Button
                                type="button"
                                variant={dueStatusFilter === "due" ? "default" : "outline"}
                                onClick={() => setDueStatusFilter("due")}
                                className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                                  dueStatusFilter === "due" ? "bg-rose-600 text-white hover:bg-rose-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Due (বাকি আছে) 
                                <Badge className={`ml-1 h-5 px-1.5 text-[10px] ${
                                  dueStatusFilter === "due" ? "bg-white/20 text-white border-transparent" : "bg-rose-100 text-rose-800"
                                }`}>
                                  {monthlyCounts.due}
                                </Badge>
                              </Button>
                            </div>

                            {dueMonthlyData.length === 0 ? (
                              <div className="text-center py-12 border rounded-xl text-muted-foreground font-sans text-sm bg-slate-50/50">
                                No teacher records found matching criteria.
                              </div>
                            ) : (
                              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-[#f8fafc] p-4 border-b flex justify-between items-center text-xs font-semibold text-slate-700">
                                  <div className="flex gap-6 flex-wrap">
                                    <p>Branch: <span className="font-bold text-[#052E2B]">{dueBranchId === "all_branches" ? "All Branches" : dueBranchId}</span></p>
                                    <p>Period: <span className="font-bold text-[#052E2B]">{MONTHS_LIST.find(m => m.key === dueMonth)?.name} {dueYear}</span></p>
                                    <p>Filtered Size: <span className="font-bold text-[#052E2B]">{dueMonthlyData.length} Teachers</span></p>
                                  </div>
                                  <Badge className="bg-[#052E2B] text-white">Monthly View</Badge>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                        <th className="py-3 px-4 text-center">Photo</th>
                                        <th className="py-3 px-4">Teacher Details</th>
                                        <th className="py-3 px-4 text-right">Basic Salary</th>
                                        <th className="py-3 px-4 text-right">Paid Amount</th>
                                        <th className="py-3 px-4 text-right">Remaining Due</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Quick Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {dueMonthlyData.map(row => (
                                        <tr key={row.teacher.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="py-2.5 px-4 text-center">
                                            <div className="h-9 w-9 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center mx-auto">
                                              {row.teacher.photo_url ? (
                                                <img src={row.teacher.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                                              ) : (
                                                <span className="text-[10px] font-bold text-slate-500">{row.teacher.full_name_en?.[0]}</span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <p className="font-bold text-slate-800">{row.teacher.full_name_en}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.teacher.teacher_id} | {row.teacher.department || "General"}</p>
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-slate-600 font-semibold">৳{row.salaryAmount.toLocaleString()}</td>
                                          <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">৳{row.paidAmount.toLocaleString()}</td>
                                          <td className="py-2.5 px-4 text-right text-rose-600 font-bold">৳{row.dueAmount.toLocaleString()}</td>
                                          <td className="py-2.5 px-4 text-center">
                                            <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                              row.status === "Paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                              row.status === "Partial" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                              row.status === "Overdue" ? "bg-rose-100 text-rose-700 border-rose-200" :
                                              "bg-blue-100 text-blue-700 border-blue-200"
                                            }`}>
                                              {row.status}
                                            </Badge>
                                          </td>
                                          <td className="py-2.5 px-4 text-center">
                                            {row.status === "Paid" ? (
                                              <span className="text-[11px] text-emerald-600 font-bold">✓ Paid</span>
                                            ) : (
                                              <Button 
                                                type="button"
                                                size="sm"
                                                onClick={() => {
                                                  setPayBranch(row.teacher.branch);
                                                  setPayTeacherId(row.teacher.teacher_id);
                                                  setPayMonth(row.month);
                                                  setPayYear(row.year);
                                                  setTeacherActiveTab("payout");
                                                }}
                                                className="h-7 text-[10px] font-bold bg-[#052E2B] text-white hover:bg-[#052E2B]/90 rounded-lg px-2"
                                              >
                                                Pay Now
                                              </Button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Yearly Grid View */}
                        {dueViewType === "yearly" && (
                          <>
                            {dueGridData.length === 0 ? (
                              <div className="text-center py-12 border rounded-xl text-muted-foreground font-sans text-sm bg-slate-50/50">
                                No teacher records found matching criteria.
                              </div>
                            ) : (
                              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-[#f8fafc] p-4 border-b flex justify-between items-center text-xs font-semibold text-slate-700">
                                  <div className="flex gap-6 flex-wrap">
                                    <p>Branch: <span className="font-bold text-[#052E2B]">{dueBranchId === "all_branches" ? "All Branches" : dueBranchId}</span></p>
                                    <p>Year: <span className="font-bold text-[#052E2B]">{dueYear}</span></p>
                                    <p>Payroll Size: <span className="font-bold text-[#052E2B]">{dueGridData.length} Teachers</span></p>
                                  </div>
                                  <Badge className="bg-[#052E2B] text-white">Yearly Grid</Badge>
                                </div>
                                
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                        <th className="py-3 px-4 text-center">Photo</th>
                                        <th className="py-3 px-4">Teacher Details</th>
                                        <th className="py-3 px-4 text-right">Basic Salary</th>
                                        {MONTHS_LIST.map(m => (
                                          <th key={m.key} className="py-3 px-2 text-center min-w-[60px]">{m.name}</th>
                                        ))}
                                        <th className="py-3 px-4 text-right min-w-[90px]">Total Due</th>
                                        <th className="py-3 px-4 text-center">Quick Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {dueGridData.map(row => (
                                        <tr key={row.teacher.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="py-2.5 px-4 text-center">
                                            <div className="h-9 w-9 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center mx-auto">
                                              {row.teacher.photo_url ? (
                                                <img src={row.teacher.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                                              ) : (
                                                <span className="text-[10px] font-bold text-slate-500">{row.teacher.full_name_en?.[0]}</span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <p className="font-bold text-slate-800">{row.teacher.full_name_en}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.teacher.teacher_id} | {row.teacher.department || "General"}</p>
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-slate-600 font-semibold">৳{row.salaryAmount.toLocaleString()}</td>
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
                                                setPayBranch(row.teacher.branch);
                                                setPayTeacherId(row.teacher.teacher_id);
                                                setPayMonth(format(new Date(), "MM"));
                                                setPayYear(row.year);
                                                setTeacherActiveTab("payout");
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
                            )}
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Sub-tab 3: Salary Profiles Setup ── */}
              {teacherActiveTab === "profiles" && (
                <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-50/50 p-6 flex flex-row items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-[#052E2B]">Teacher Salary Configuration Profiles</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">Configure baseline monthly Hadiya and payment details.</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setEditingProfile(null);
                        setShowAddSalaryModal(true);
                      }} 
                      className="bg-[#052E2B] hover:bg-[#042422] text-white gap-1.5 h-9 text-xs rounded-xl font-bold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Salary Setup
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                      <div>
                        <Label className="text-xs font-semibold text-slate-500">Filter Branch</Label>
                        <Select value={profileBranch} onValueChange={setProfileBranch} disabled={currentUser?.role === "branch_admin"}>
                          <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_branches">All Branches</SelectItem>
                            {branches.map(b => (
                              <SelectItem key={b.id} value={b.name_en || b.branch_name}>{b.name_en || b.branch_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-500">Search Teacher</Label>
                        <div className="relative mt-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            placeholder="Search Name or ID..." 
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
                              <th className="py-3 px-4">Teacher ID</th>
                              <th className="py-3 px-4">Teacher Name</th>
                              <th className="py-3 px-4">Branch</th>
                              <th className="py-3 px-4">Department</th>
                              <th className="py-3 px-4 text-right">Salary / Hadiya</th>
                              <th className="py-3 px-4">Salary Type</th>
                              <th className="py-3 px-4">Cycle</th>
                              <th className="py-3 px-4">Effective Date</th>
                              <th className="py-3 px-4">Notes</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {profilesGridData.map(row => (
                              <tr key={row.teacher.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.teacher.teacher_id}</td>
                                <td className="py-3 px-4 font-bold text-slate-800">{row.teacher.full_name_en}</td>
                                <td className="py-3 px-4 text-slate-500">{row.teacher.branch || "—"}</td>
                                <td className="py-3 px-4 text-slate-500">{row.teacher.department || "—"}</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-800">
                                  {row.profile ? (
                                    <span>৳{Number(row.profile.amount).toLocaleString()}</span>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-red-500 bg-red-50 border-red-200">Not Setup</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-medium">{row.profile?.salary_type || "—"}</td>
                                <td className="py-3 px-4 text-slate-500">{row.profile?.payment_cycle || "—"}</td>
                                <td className="py-3 px-4 text-slate-500 font-mono">{row.profile?.effective_date || "—"}</td>
                                <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate">{row.profile?.notes || "—"}</td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-1">
                                    {row.profile ? (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-[#052E2B] hover:bg-slate-100"
                                          onClick={() => {
                                            setEditingProfile(row.profile);
                                            setShowAddSalaryModal(true);
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this teacher salary profile?")) {
                                              deleteProfileMutation.mutate(row.profile.id);
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button 
                                        size="xs"
                                        className="h-7 text-[10px] bg-slate-100 hover:bg-slate-200 text-[#052E2B] border font-bold"
                                        onClick={() => {
                                          setEditingProfile({ teacher_id: row.teacher.teacher_id });
                                          setShowAddSalaryModal(true);
                                        }}
                                      >
                                        + Configure
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {profilesGridData.length === 0 && (
                              <tr>
                                <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                                  No teacher configurations matched.
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

              {/* ── Sub-tab 4: Reports Center ── */}
              {teacherActiveTab === "reports" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Side: Report Builder */}
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
                            <SelectItem value="ledger">Teacher Ledger</SelectItem>
                            <SelectItem value="monthly">Monthly Payouts</SelectItem>
                            <SelectItem value="branch">Branch Payouts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(repType === "monthly" || repType === "branch") && (
                        <div>
                          <Label className="text-xs font-semibold text-slate-500">Payroll Year *</Label>
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
                          <Label className="text-xs font-semibold text-slate-500">Payout Month *</Label>
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
                                <SelectItem key={b.id} value={b.name_en || b.branch_name}>{b.name_en || b.branch_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {repType === "ledger" && (
                        <div>
                          <Label className="text-xs font-semibold text-slate-500">Teacher *</Label>
                          <Select value={repTeacherId} onValueChange={setRepTeacherId} disabled={!repBranch}>
                            <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                            <SelectContent>
                              {teachers
                                .filter(t => t.status === "active" && (repBranch === "all_branches" || t.branch === repBranch))
                                .map(t => (
                                  <SelectItem key={t.id} value={t.teacher_id}>{t.full_name_en} ({t.teacher_id})</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="pt-2 border-t flex flex-col gap-2">
                        <Button 
                          onClick={handlePrintReport} 
                          disabled={repType === "ledger" && !repTeacherId}
                          className="bg-[#052E2B] hover:bg-[#042422] text-white font-bold w-full rounded-xl gap-2 h-10 text-xs"
                        >
                          <Printer className="h-4 w-4" /> Print Statement
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleExportReportCSV} 
                          disabled={repType === "ledger" && !repTeacherId}
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold w-full rounded-xl gap-2 h-10 text-xs"
                        >
                          <FileSpreadsheet className="h-4 w-4" /> Export Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Side: Report Live Preview */}
                  <Card className="lg:col-span-3 border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b p-5 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Live Preview</CardTitle>
                      <Badge className="bg-[#052E2B] text-white">Live Data</Badge>
                    </CardHeader>
                    <CardContent className="p-6 overflow-x-auto min-h-[300px]">
                      {repType === "monthly" && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-[#052E2B]">Monthly Payout Register</h4>
                          <table className="w-full text-xs text-left border-collapse border border-slate-100">
                            <thead>
                              <tr className="bg-slate-100 border-b font-bold text-slate-600">
                                <th className="p-2.5 border">Payout Date</th>
                                <th className="p-2.5 border">Teacher Name</th>
                                <th className="p-2.5 border">Teacher ID</th>
                                <th className="p-2.5 border text-right">Salary Base</th>
                                <th className="p-2.5 border text-right">Paid Amount</th>
                                <th className="p-2.5 border text-right">Remaining Due</th>
                                <th className="p-2.5 border">Method</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {getMonthlyPayoutReport().map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                  <td className="p-2 border">{p.payment_date || "—"}</td>
                                  <td className="p-2 border"><strong>{p.teacher.full_name_en}</strong></td>
                                  <td className="p-2 border font-mono">{p.teacher_id}</td>
                                  <td className="p-2 border text-right font-semibold">৳{(p.salary_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border">{p.payment_method || "—"}</td>
                                </tr>
                              ))}
                              {getMonthlyPayoutReport().length === 0 && (
                                <tr>
                                  <td colSpan="7" className="p-6 text-center text-slate-400 italic">No payouts found for this month period.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {repType === "branch" && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-[#052E2B]">Branch Wise Year Payouts Register</h4>
                          <table className="w-full text-xs text-left border-collapse border border-slate-100">
                            <thead>
                              <tr className="bg-slate-100 border-b font-bold text-slate-600">
                                <th className="p-2 border">Month</th>
                                <th className="p-2 border">Teacher Name</th>
                                <th className="p-2 border font-mono">Teacher ID</th>
                                <th className="p-2 border text-right">Salary Base</th>
                                <th className="p-2 border text-right">Paid Amount</th>
                                <th className="p-2 border text-right">Remaining Due</th>
                                <th className="p-2 border">Method</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {getBranchPayoutReport().map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                  <td className="p-2 border">{repYear}-{p.month}</td>
                                  <td className="p-2 border"><strong>{p.teacher.full_name_en}</strong></td>
                                  <td className="p-2 border font-mono">{p.teacher_id}</td>
                                  <td className="p-2 border text-right font-semibold">৳{(p.salary_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border">{p.payment_method || "—"}</td>
                                </tr>
                              ))}
                              {getBranchPayoutReport().length === 0 && (
                                <tr>
                                  <td colSpan="8" className="p-6 text-center text-slate-400 italic">No payouts found for this branch in {repYear}.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {repType === "ledger" && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-[#052E2B]">Teacher Payout Ledger Account</h4>
                          <table className="w-full text-xs text-left border-collapse border border-slate-100">
                            <thead>
                              <tr className="bg-slate-100 border-b font-bold text-slate-600">
                                <th className="p-2 border">Month</th>
                                <th className="p-2 border">Payment Date</th>
                                <th className="p-2 border">Method</th>
                                <th className="p-2 border">Txn ID</th>
                                <th className="p-2 border text-right">Salary Amount</th>
                                <th className="p-2 border text-right">Paid Amount</th>
                                <th className="p-2 border text-right text-red-600">Remaining Due</th>
                                <th className="p-2 border text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {getTeacherLedger().map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                  <td className="p-2 border font-mono">{p.year}-{p.month}</td>
                                  <td className="p-2 border">{p.payment_date || "—"}</td>
                                  <td className="p-2 border">{p.payment_method || "—"}</td>
                                  <td className="p-2 border truncate max-w-[80px]">{p.transaction_id || "—"}</td>
                                  <td className="p-2 border text-right">৳{(p.salary_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-emerald-600 font-bold">৳{(p.paid_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-right text-red-600 font-bold">৳{(p.due_amount || 0).toLocaleString()}</td>
                                  <td className="p-2 border text-center">
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
                              {getTeacherLedger().length === 0 && (
                                <tr>
                                  <td colSpan="8" className="p-6 text-center text-slate-400 italic">Please select a teacher to load their payout ledger.</td>
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
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* MONTHLY REPORT VIEW (Students - Untouched functionality) */}
        <TabsContent value="report" className="mt-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-3">
              <TabsTrigger value="student" className="gap-2"><GraduationCap className="h-4 w-4" /> Students</TabsTrigger>
              <TabsTrigger value="teacher" className="gap-2"><UserCog className="h-4 w-4" /> Teachers</TabsTrigger>
            </TabsList>
            {tab === "student" ? (
              studentMonthlyReport.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No data available</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-primary/10">
                  <table className="w-full text-sm">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Month</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Total Hadiya</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-600">Paid</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-red-500">Pending</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Entries</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {studentMonthlyReport.map(row => {
                        const pct = row.total > 0 ? Math.round((row.paid / row.total) * 100) : 0;
                        return (
                          <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4 font-semibold">{row.month}</td>
                            <td className="py-3 px-4 text-right font-bold text-primary">৳{row.total.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-semibold">৳{row.paid.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-red-500 font-semibold">৳{row.pending.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{row.count}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-slate-200">
                                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className={`text-xs font-semibold ${pct === 100 ? "text-emerald-600" : pct > 50 ? "text-amber-600" : "text-red-500"}`}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-primary/5 font-bold">
                      <tr>
                        <td className="py-3 px-4 text-xs text-muted-foreground">Grand Total</td>
                        <td className="py-3 px-4 text-right text-primary">৳{studentMonthlyReport.reduce((s, r) => s + r.total, 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-emerald-600">৳{studentMonthlyReport.reduce((s, r) => s + r.paid, 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-red-500">৳{studentMonthlyReport.reduce((s, r) => s + r.pending, 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{studentMonthlyReport.reduce((s, r) => s + r.count, 0)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Teacher monthly report is dynamically computed and downloadable as CSV in the main list tab.
              </div>
            )}
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Student Stipend Add/Edit Modal (original) */}
      <HadiyaFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        students={students}
        teachers={teachers}
        editingItem={editingItem}
      />

      {/* Student Bulk Pay Modal (original) */}
      <BulkPayModal
        open={showBulkPay}
        onClose={() => setShowBulkPay(false)}
        pendingList={pendingStudentsList}
        onConfirm={handleBulkPay}
        loading={bulkLoading}
      />

      {/* Upgraded Add/Edit Salary Setup Profile Modal */}
      <AddTeacherSalaryModal
        open={showAddSalaryModal}
        onClose={() => { setShowAddSalaryModal(false); setEditingProfile(null); }}
        teachers={teachers}
        onSave={handleSaveTeacherSalary}
        editingProfile={editingProfile}
        selectedBranch={profileBranch}
      />

      {/* Quick Payout AddPaymentModal */}
      <AddPaymentModal
        open={showAddPaymentModal}
        onClose={() => { setShowAddPaymentModal(false); setSelectedPaymentRow(null); }}
        rowData={selectedPaymentRow}
        onSave={handleSavePayment}
      />
    </div>
  );
}

// ── UPGRADED ADD/EDIT TEACHER SALARY MODAL ──
function AddTeacherSalaryModal({ open, onClose, teachers, onSave, editingProfile, selectedBranch }) {
  const [formData, setFormData] = useState({
    teacher_id: "",
    amount: "",
    salary_type: "Basic Salary",
    payment_cycle: "Monthly",
    effective_date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });
  
  const [teacherSearch, setTeacherSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingProfile) {
        setFormData({
          teacher_id: editingProfile.teacher_id || "",
          amount: editingProfile.amount ? String(editingProfile.amount) : "",
          salary_type: editingProfile.salary_type || "Basic Salary",
          payment_cycle: editingProfile.payment_cycle || "Monthly",
          effective_date: editingProfile.effective_date || format(new Date(), "yyyy-MM-dd"),
          notes: editingProfile.notes || ""
        });
      } else {
        setFormData({
          teacher_id: "",
          amount: "",
          salary_type: "Basic Salary",
          payment_cycle: "Monthly",
          effective_date: format(new Date(), "yyyy-MM-dd"),
          notes: ""
        });
      }
      setTeacherSearch("");
      setDropdownOpen(false);
    }
  }, [open, editingProfile]);

  const activeTeachers = teachers.filter(t => t.status === "active");
  const filteredTeachers = activeTeachers.filter(t => {
    if (selectedBranch && selectedBranch !== "all_branches" && t.branch !== selectedBranch) return false;
    return t.full_name_en?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
           t.teacher_id?.toLowerCase().includes(teacherSearch.toLowerCase());
  });

  const selectedTeacher = activeTeachers.find(t => t.teacher_id === formData.teacher_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.teacher_id) {
      toast.error("Please select a teacher");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    onSave(formData, editingProfile?.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#052E2B]">
            {editingProfile && editingProfile.id ? "Edit Teacher Salary Profile" : "Add Teacher Salary Profile"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Searchable Teacher Dropdown */}
          <div className="relative">
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Select Teacher *</Label>
            <div 
              onClick={() => {
                if (!editingProfile || !editingProfile.id) {
                  setDropdownOpen(!dropdownOpen);
                }
              }}
              className={`flex h-10 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer mt-1 ${
                (editingProfile && editingProfile.id) ? "opacity-50 cursor-not-allowed bg-slate-50" : ""
              }`}
            >
              <span className="text-slate-800">
                {selectedTeacher 
                  ? `${selectedTeacher.full_name_en} (${selectedTeacher.teacher_id})` 
                  : "Choose Teacher..."
                }
              </span>
              {!editingProfile?.id && <Search className="h-4 w-4 opacity-50" />}
            </div>
            
            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
                <Input 
                  placeholder="Type to search..." 
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="mb-2 h-8 rounded-lg font-sans"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="space-y-1">
                  {filteredTeachers.map(t => (
                    <div 
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, teacher_id: t.teacher_id }));
                        setDropdownOpen(false);
                        setTeacherSearch("");
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-sm font-sans"
                    >
                      {t.full_name_en} ({t.teacher_id}) - {t.department || "General"}
                    </div>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <div className="p-2 text-center text-xs text-slate-500 font-sans">
                      No teachers found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Salary Amount (৳) *</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.amount} 
                onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} 
                placeholder="Amount" 
                required 
                className="rounded-xl h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Salary Type *</Label>
              <Select 
                value={formData.salary_type} 
                onValueChange={v => setFormData(f => ({ ...f, salary_type: v }))}
              >
                <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic Salary">Basic Salary</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Hadiya">Hadiya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Effective Date *</Label>
              <Input 
                type="date" 
                value={formData.effective_date} 
                onChange={e => setFormData(f => ({ ...f, effective_date: e.target.value }))} 
                required 
                className="rounded-xl h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Cycle *</Label>
              <Select 
                value={formData.payment_cycle} 
                onValueChange={v => setFormData(f => ({ ...f, payment_cycle: v }))}
              >
                <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Half Yearly">Half Yearly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes (Optional)</Label>
            <Input 
              value={formData.notes} 
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} 
              placeholder="Additional details..." 
              className="rounded-xl h-10"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-[#052E2B] hover:bg-[#052E2B]/90 text-white">
              {editingProfile?.id ? "Update Profile" : "Save Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── UPGRADED ADD PAYMENT MODAL ──
function AddPaymentModal({ open, onClose, rowData, onSave }) {
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "Cash",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    transaction_id: "",
    notes: ""
  });

  useEffect(() => {
    if (open && rowData) {
      setFormData({
        amount: String(rowData.dueAmount),
        payment_method: "Cash",
        payment_date: format(new Date(), "yyyy-MM-dd"),
        transaction_id: "",
        notes: ""
      });
    }
  }, [open, rowData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!rowData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#052E2B]">Record Salary Payment</DialogTitle>
        </DialogHeader>
        <div className="bg-slate-50 p-3 rounded-2xl border mb-2 text-xs space-y-1">
          <p className="font-semibold text-slate-700">{rowData.teacher.full_name_en} ({rowData.teacher.teacher_id})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <p><span className="text-slate-500">Monthly Salary:</span> ৳{rowData.salaryAmount.toLocaleString()}</p>
            <p><span className="text-slate-500">Currently Paid:</span> ৳{rowData.paidAmount.toLocaleString()}</p>
            <p><span className="text-slate-500">Remaining Due:</span> ৳{rowData.dueAmount.toLocaleString()}</p>
            <p><span className="text-slate-500">Billing Period:</span> {rowData.year}-{rowData.month || rowData.hadiya?.month?.split("-")[1]}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Amount (৳) *</Label>
              <Input 
                type="number" 
                min="0" 
                max={String(rowData.dueAmount)}
                value={formData.amount} 
                onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} 
                placeholder="Amount" 
                required 
                className="rounded-xl h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={v => setFormData(f => ({ ...f, payment_method: v }))}
              >
                <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="bKash">bKash</SelectItem>
                  <SelectItem value="Nagad">Nagad</SelectItem>
                  <SelectItem value="Rocket">Rocket</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Date *</Label>
              <Input 
                type="date" 
                value={formData.payment_date} 
                onChange={e => setFormData(f => ({ ...f, payment_date: e.target.value }))} 
                required 
                className="rounded-xl h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Transaction ID (Optional)</Label>
              <Input 
                value={formData.transaction_id} 
                onChange={e => setFormData(f => ({ ...f, transaction_id: e.target.value }))} 
                placeholder="TXN..." 
                className="rounded-xl h-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes (Optional)</Label>
            <Input 
              value={formData.notes} 
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} 
              placeholder="Payment remarks..." 
              className="rounded-xl h-10"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-[#052E2B] hover:bg-[#052E2B]/90 text-white">
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
