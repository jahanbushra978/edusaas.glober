import React, { useState, useMemo, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName, isStudentInClassOption } from "@/lib/academic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, DollarSign, Loader2, Download, Printer, 
  Trash2, FileSpreadsheet 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

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

export default function FeeManager({ students, currentUser }) {
  const queryClient = useQueryClient();
  
  // Tab states: 'collection' | 'dues' | 'setup' | 'reports'
  const [activeTab, setActiveTab] = useState("collection");

  // Filters for Collection Entry
  const [collBranchId, setCollBranchId] = useState("");
  const [collClassId, setCollClassId] = useState("");
  const [collSessionId, setCollSessionId] = useState("");
  const [collGroupId, setCollGroupId] = useState("");
  const [collStudentId, setCollStudentId] = useState("");
  const [collMonth, setCollMonth] = useState(format(new Date(), "MM"));
  const [collYear, setCollYear] = useState(format(new Date(), "yyyy"));
  const { search: studentSearch, setSearch: setStudentSearch, query: studentQuery } = useSearch({ data: [], debounceMs: 300 });
  
  // Form input states for Fee Entry
  const [feeAmount, setFeeAmount] = useState("");
  const [discount, setDiscount] = useState("0");
  const [fine, setFine] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [collectionDate, setCollectionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [checkedFees, setCheckedFees] = useState({});

  // Due List States
  const [dueBranchId, setDueBranchId] = useState("");
  const [dueClassId, setDueClassId] = useState("");
  const [dueSessionId, setDueSessionId] = useState("");
  const [dueGroupId, setDueGroupId] = useState("");
  const [dueYear, setDueYear] = useState(format(new Date(), "yyyy"));
  const { search: dueSearch, setSearch: setDueSearch, query: dueQuery } = useSearch({ data: [], debounceMs: 300 });
  const [dueFilterStatus, setDueFilterStatus] = useState("all"); // 'all' | 'due' | 'paid'

  // Global Fee Setup States
  const [newFeeTypeName, setNewFeeTypeName] = useState("");
  const [isAddingFeeType, setIsAddingFeeType] = useState(false);

  // Reports States
  const [reportType, setReportType] = useState("ledger"); // 'ledger' | 'monthly' | 'branch' | 'class'
  const [repBranchId, setRepBranchId] = useState("");
  const [repClassId, setRepClassId] = useState("");
  const [repSessionId, setRepSessionId] = useState("");
  const [repGroupId, setRepGroupId] = useState("");
  const [repStudentId, setRepStudentId] = useState("");
  const [repMonth, setRepMonth] = useState(format(new Date(), "MM"));
  const [repYear, setRepYear] = useState(format(new Date(), "yyyy"));

  // Fetch branches, settings and fee records
  const { data: rawBranches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["fees-branches-list"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      setCollBranchId(String(currentUser.branch_id));
      setDueBranchId(String(currentUser.branch_id));
      setRepBranchId(String(currentUser.branch_id));
    }
  }, [currentUser]);

  const { data: appSettings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ["fees-settings-list"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const { data: fees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["fees-all-records"],
    queryFn: () => appClient.entities.Fee.listAll({ sort: "-created_date" }),
  });

  // Extract fee types from settings or fallback to defaults
  const feeTypesSetting = appSettings.find(s => s.key === "fee_types")?.value;
  const feeTypes = feeTypesSetting ? JSON.parse(feeTypesSetting) : ["Admission Fee", "Monthly Tuition Fee", "Exam Fee"];

  // Mutations
  const createFeeMutation = useMutation({
    mutationFn: (data) => appClient.entities.Fee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees-all-records"] });
      toast.success("Fee collection recorded successfully!");
      // Reset form
      setFeeAmount("");
      setDiscount("0");
      setFine("0");
      setNotes("");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to record fee");
    }
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.Fee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees-all-records"] });
      toast.success("Fee collection updated successfully!");
      // Reset form
      setFeeAmount("");
      setDiscount("0");
      setFine("0");
      setNotes("");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update fee record");
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.AppSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees-settings-list"] });
      toast.success("Settings updated successfully!");
    }
  });

  const createSettingMutation = useMutation({
    mutationFn: (data) => appClient.entities.AppSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees-settings-list"] });
      toast.success("Settings created successfully!");
    }
  });

  const deleteFeeMutation = useMutation({
    mutationFn: (id) => appClient.entities.Fee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees-all-records"] });
      toast.success("Fee record deleted.");
    }
  });

  // Deduplicate students list
  const uniqueStudents = useMemo(() => {
    return Array.from(new Map(students.map(s => [String(s.id), s])).values());
  }, [students]);

  // Helper selectors data
  const selectedCollBranch = branches.find(b => String(b.id) === String(collBranchId));
  const collClasses = selectedCollBranch?.academic_structure || [];
  const selectedCollClass = collClasses.find(c => String(c.id) === String(collClassId));
  const collHasSessions = selectedCollClass && Array.isArray(selectedCollClass.sections) && selectedCollClass.sections.length > 0;
  const collHasGroups = selectedCollClass && Array.isArray(selectedCollClass.groups) && selectedCollClass.groups.length > 0;

  const collSessionsOptions = useMemo(() => {
    if (!collHasSessions) return [];
    return selectedCollClass.sections.map(sec => ({
      value: String(sec.id),
      label: sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || ""
    }));
  }, [selectedCollClass, collHasSessions]);

  const collGroupsOptions = useMemo(() => {
    if (!collHasGroups) return [];
    return selectedCollClass.groups.map(g => ({
      value: String(g.id),
      label: g.group_name?.en || g.group_name?.bn || String(g.id)
    }));
  }, [selectedCollClass, collHasGroups]);

  const collClassesOptions = useMemo(() => {
    if (!selectedCollBranch?.academic_structure) return [];
    return selectedCollBranch.academic_structure.map(c => {
      const name = c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";
      return { id: String(c.id), label: name || "Unnamed Class" };
    });
  }, [selectedCollBranch]);

  const collStudents = useMemo(() => {
    const list = uniqueStudents.filter(s => {
      if (String(s.branch_id) !== String(collBranchId)) return false;
      if (s.status !== "active") return false;
      if (collClassId) {
        const optionId = collSessionId || collClassId;
        if (!isStudentInClassOption(s, optionId, selectedCollBranch?.academic_structure)) return false;
      }
      if (collGroupId) {
        if (String(s.class_group_id) !== String(collGroupId)) return false;
      }
      if (studentQuery) {
        const matchesNameEn = (s.full_name_en || "").toLowerCase().includes(studentQuery);
        const matchesNameBn = (s.full_name_bn || "").toLowerCase().includes(studentQuery);
        const matchesRoll = (s.roll_number || "").toLowerCase().includes(studentQuery);
        const matchesId = String(s.id || "").toLowerCase().includes(studentQuery);
        return matchesNameEn || matchesNameBn || matchesRoll || matchesId;
      }
      return true;
    });

    if (collStudentId) {
      const selected = uniqueStudents.find(s => String(s.id) === String(collStudentId));
      if (selected && !list.some(s => String(s.id) === String(collStudentId))) {
        list.push(selected);
      }
    }
    return list;
  }, [uniqueStudents, collBranchId, collClassId, collSessionId, collGroupId, studentQuery, collStudentId]);

  const selectedStudent = useMemo(() => {
    return uniqueStudents.find(s => String(s.id) === String(collStudentId));
  }, [uniqueStudents, collStudentId]);

  const selectedDueBranch = branches.find(b => String(b.id) === String(dueBranchId));
  const dueClasses = selectedDueBranch?.academic_structure || [];
  const selectedDueClass = dueClasses.find(c => String(c.id) === String(dueClassId));
  const dueHasSessions = selectedDueClass && Array.isArray(selectedDueClass.sections) && selectedDueClass.sections.length > 0;
  const dueHasGroups = selectedDueClass && Array.isArray(selectedDueClass.groups) && selectedDueClass.groups.length > 0;

  const dueSessionsOptions = useMemo(() => {
    if (!dueHasSessions) return [];
    return selectedDueClass.sections.map(sec => ({
      value: String(sec.id),
      label: sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || ""
    }));
  }, [selectedDueClass, dueHasSessions]);

  const dueGroupsOptions = useMemo(() => {
    if (!dueHasGroups) return [];
    return selectedDueClass.groups.map(g => ({
      value: String(g.id),
      label: g.group_name?.en || g.group_name?.bn || String(g.id)
    }));
  }, [selectedDueClass, dueHasGroups]);

  const dueClassesOptions = useMemo(() => {
    if (!selectedDueBranch?.academic_structure) return [];
    return selectedDueBranch.academic_structure.map(c => {
      const name = c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";
      return { id: String(c.id), label: name || "Unnamed Class" };
    });
  }, [selectedDueBranch]);

  const selectedRepBranch = branches.find(b => String(b.id) === String(repBranchId));
  const repClasses = selectedRepBranch?.academic_structure || [];
  const selectedRepClass = repClasses.find(c => String(c.id) === String(repClassId));
  const repHasSessions = selectedRepClass && Array.isArray(selectedRepClass.sections) && selectedRepClass.sections.length > 0;
  const repHasGroups = selectedRepClass && Array.isArray(selectedRepClass.groups) && selectedRepClass.groups.length > 0;

  const repSessionsOptions = useMemo(() => {
    if (!repHasSessions) return [];
    return selectedRepClass.sections.map(sec => ({
      value: String(sec.id),
      label: sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || ""
    }));
  }, [selectedRepClass, repHasSessions]);

  const repGroupsOptions = useMemo(() => {
    if (!repHasGroups) return [];
    return selectedRepClass.groups.map(g => ({
      value: String(g.id),
      label: g.group_name?.en || g.group_name?.bn || String(g.id)
    }));
  }, [selectedRepClass, repHasGroups]);

  const repClassesOptions = useMemo(() => {
    if (!selectedRepBranch?.academic_structure) return [];
    return selectedRepBranch.academic_structure.map(c => {
      const name = c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";
      return { id: String(c.id), label: name || "Unnamed Class" };
    });
  }, [selectedRepBranch]);

  const repStudents = useMemo(() => {
    return uniqueStudents.filter(s => {
      if (String(s.branch_id) !== String(repBranchId)) return false;
      if (repClassId) {
        const optionId = repSessionId || repClassId;
        if (!isStudentInClassOption(s, optionId, selectedRepBranch?.academic_structure)) return false;
      }
      if (repGroupId) {
        if (String(s.class_group_id) !== String(repGroupId)) return false;
      }
      return true;
    });
  }, [uniqueStudents, repBranchId, repClassId, repSessionId, repGroupId]);

  // Dynamic fee calculation for collection
  const studentFeeSetup = useMemo(() => {
    if (!selectedStudent) return {};
    try {
      const parsed = selectedStudent.custom_fields ? JSON.parse(selectedStudent.custom_fields) : {};
      return parsed.fees_setup || {};
    } catch {
      return {};
    }
  }, [selectedStudent]);

  // Look up existing record for selected student and month
  const existingRecord = useMemo(() => {
    if (!collStudentId) return null;
    const monthKey = `${collYear}-${collMonth}`;
    return fees.find(f => String(f.student_id) === String(collStudentId) && f.month === monthKey && !f.is_archived);
  }, [collStudentId, collMonth, collYear, fees]);

  // Update dynamic checkboxes on student/month change
  useEffect(() => {
    if (selectedStudent) {
      const initialChecked = {};
      feeTypes.forEach(type => {
        // Default only Monthly Tuition Fee
        initialChecked[type] = type === "Monthly Tuition Fee";
      });

      // Auto check Admission Fee if month matches student's admission date
      if (selectedStudent.admission_date) {
        try {
          const admDate = new Date(selectedStudent.admission_date);
          const admMonth = format(admDate, "MM");
          const admYear = format(admDate, "yyyy");
          if (admMonth === collMonth && admYear === collYear) {
            initialChecked["Admission Fee"] = true;
          }
        } catch {}
      }
      setCheckedFees(initialChecked);
    }
  }, [collStudentId, collMonth, collYear]);

  // Calculations for active setup
  const baseExpectedFee = Object.entries(checkedFees)
    .filter(([_, checked]) => checked)
    .reduce((sum, [type]) => sum + (Number(studentFeeSetup[type]) || 0), 0);

  const numFine = Number(fine) || 0;
  const numDiscount = Number(discount) || 0;
  const numPaid = Number(feeAmount) || 0;

  const totalExpectedWithFine = baseExpectedFee + numFine;
  const totalPaidWithDiscount = numPaid + numDiscount;
  const calculatedDue = Math.max(0, totalExpectedWithFine - totalPaidWithDiscount);
  
  const calculatedStatus = (() => {
    if (totalPaidWithDiscount >= totalExpectedWithFine && totalExpectedWithFine > 0) return "paid";
    if (numPaid > 0) return "partial";
    // Check if overdue
    const nowKey = format(new Date(), "yyyy-MM");
    const selectedKey = `${collYear}-${collMonth}`;
    return selectedKey < nowKey ? "overdue" : "due";
  })();

  // Autofill feeAmount with baseExpectedFee or existingRecord.due_amount on change
  useEffect(() => {
    if (selectedStudent) {
      if (existingRecord) {
        setFeeAmount(String(existingRecord.due_amount || ""));
        setDiscount("0");
        setFine("0");
      } else if (baseExpectedFee > 0) {
        setFeeAmount(String(baseExpectedFee));
        setDiscount("0");
        setFine("0");
      } else {
        setFeeAmount("");
        setDiscount("0");
        setFine("0");
      }
    } else {
      setFeeAmount("");
      setDiscount("0");
      setFine("0");
    }
  }, [baseExpectedFee, selectedStudent, existingRecord]);

  // Branch and Class selection changes
  const handleBranchChange = (v) => {
    setCollBranchId(v);
    setCollClassId("");
    setCollSessionId("");
    setCollGroupId("");
    setCollStudentId("");
    setStudentSearch("");
  };

  const handleClassChange = (v) => {
    setCollClassId(v);
    setCollSessionId("");
    setCollGroupId("");
    setCollStudentId("");
  };

  const handleStudentChange = (v) => {
    setCollStudentId(v);
  };

  // Handle Recording Payment
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!collStudentId) return toast.error("Please select a student");
    
    const monthKey = `${collYear}-${collMonth}`;

    if (existingRecord) {
      const nextPaid = Number(existingRecord.paid_amount || 0) + numPaid;
      const nextDiscount = Number(existingRecord.discount || 0) + numDiscount;
      const nextFine = Number(existingRecord.fine || 0) + numFine;
      const nextTotalFee = Number(existingRecord.total_fee || 0) + numFine;
      const nextDue = Math.max(0, nextTotalFee - (nextPaid + nextDiscount));
      const nextStatus = nextDue <= 0 ? "paid" : "partial";
      const nextNotes = existingRecord.notes ? `${existingRecord.notes}; ${notes}` : notes;

      const payload = {
        total_fee: nextTotalFee,
        paid_amount: nextPaid,
        due_amount: nextDue,
        status: nextStatus,
        payment_date: collectionDate,
        notes: nextNotes,
        discount: nextDiscount,
        fine: nextFine,
        payment_method: paymentMethod,
        fee_details: {
          ...(existingRecord.fee_details || {}),
          ...checkedFees,
        },
      };

      updateFeeMutation.mutate({ id: existingRecord.id, data: payload });
    } else {
      const payload = {
        student_id: collStudentId,
        month: monthKey,
        total_fee: totalExpectedWithFine,
        paid_amount: numPaid,
        due_amount: calculatedDue,
        status: calculatedStatus,
        payment_date: collectionDate,
        notes: notes,
        discount: numDiscount,
        fine: numFine,
        payment_method: paymentMethod,
        student_name: selectedStudent.full_name_en,
        roll_number: selectedStudent.roll_number,
        branch_name: selectedCollBranch ? (selectedCollBranch.name_bn || selectedCollBranch.name_en) : "",
        class_name: selectedStudent.class_name || collClassId || "",
        section_name: "",
        fee_details: checkedFees,
      };

      createFeeMutation.mutate(payload);
    }
  };

  // Add Dynamic Fee Type globally
  const handleAddFeeType = () => {
    if (!newFeeTypeName.trim()) return;
    if (feeTypes.includes(newFeeTypeName.trim())) {
      return toast.error("Fee Type already exists");
    }
    const updated = [...feeTypes, newFeeTypeName.trim()];
    const settingObj = appSettings.find(s => s.key === "fee_types");
    
    if (settingObj) {
      updateSettingMutation.mutate({ id: settingObj.id, data: { value: JSON.stringify(updated) } });
    } else {
      createSettingMutation.mutate({ key: "fee_types", value: JSON.stringify(updated) });
    }
    setNewFeeTypeName("");
    setIsAddingFeeType(false);
  };

  // Delete dynamic Fee Type
  const handleDeleteFeeType = (type) => {
    if (["Admission Fee", "Monthly Tuition Fee", "Exam Fee"].includes(type)) {
      return toast.error("Default Fee Types cannot be deleted.");
    }
    if (window.confirm(`Are you sure you want to delete "${type}"? This will remove it from future student setups.`)) {
      const updated = feeTypes.filter(t => t !== type);
      const settingObj = appSettings.find(s => s.key === "fee_types");
      if (settingObj) {
        updateSettingMutation.mutate({ id: settingObj.id, data: { value: JSON.stringify(updated) } });
      }
    }
  };

  // Calculate Due List Grid
  const getDueListGridData = () => {
    if (!dueBranchId || !dueClassId) return [];
    
    const selectedDueBranch = branches.find(b => String(b.id) === String(dueBranchId));
    // Filter students by branch, class, session, group
    const filteredStudents = uniqueStudents.filter(s => {
      if (String(s.branch_id) !== String(dueBranchId)) return false;
      if (dueClassId) {
        const optionId = dueSessionId || dueClassId;
        if (!isStudentInClassOption(s, optionId, selectedDueBranch?.academic_structure)) return false;
      }
      if (dueGroupId) {
        if (String(s.class_group_id) !== String(dueGroupId)) return false;
      }
      if (dueQuery && !(s.full_name_en?.toLowerCase().includes(dueQuery) || s.roll_number?.toLowerCase().includes(dueQuery))) return false;
      return true;
    });

    return filteredStudents.map(student => {
      // Get student's fee setup
      let tuitionFee = 0;
      try {
        const parsed = student.custom_fields ? JSON.parse(student.custom_fields) : {};
        tuitionFee = Number(parsed.fees_setup?.["Monthly Tuition Fee"]) || 0;
      } catch {}

      // Calculate dues for each month of the selected year
      const monthlyDues = {};
      let totalDueSum = 0;

      MONTHS_LIST.forEach(m => {
        const monthKey = `${dueYear}-${m.key}`;
        const record = fees.find(f => String(f.student_id) === String(student.id) && f.month === monthKey && !f.is_archived);
        
        if (record) {
          monthlyDues[m.key] = record.due_amount || 0;
        } else {
          // If the month is before student's admission date, due is 0
          let isBeforeAdmission = false;
          if (student.admission_date) {
            try {
              const admDateStr = student.admission_date.substring(0, 7); // e.g. "2026-04"
              if (monthKey < admDateStr) {
                isBeforeAdmission = true;
              }
            } catch {}
          }
          // If no record exists, they owe the default tuition fee
          monthlyDues[m.key] = isBeforeAdmission ? 0 : tuitionFee;
        }
        totalDueSum += monthlyDues[m.key];
      });

      return {
        student,
        monthlyDues,
        totalDueSum
      };
    }).filter(row => {
      if (dueFilterStatus === "due") return row.totalDueSum > 0;
      if (dueFilterStatus === "paid") return row.totalDueSum === 0;
      return true;
    });
  };

  const dueGridData = getDueListGridData();

  // Print helper function
  const handlePrint = (title, tableHtml, filterInfoHtml = "") => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
            body { font-family: 'Outfit', sans-serif; padding: 25px; color: #1e293b; background: white; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
            .logo-placeholder { width: 45px; height: 45px; border-radius: 50%; background: #0f766e; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
            .title-section { text-align: center; flex: 1; }
            .title-section h1 { margin: 0; font-size: 20px; color: #0f766e; font-weight: 700; letter-spacing: 0.5px; }
            .title-section h2 { margin: 2px 0 0; font-size: 11px; color: #b45309; text-transform: uppercase; font-weight: 600; }
            
            .report-title { text-align: center; margin: 15px 0; }
            .report-title span { background: #0f766e; color: white; padding: 5px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .filter-info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            .filter-info-table th, .filter-info-table td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
            .filter-info-table th { background: #f8fafc; font-weight: 600; color: #475569; }
            
            .data-table { width: 100%; border-collapse: collapse; font-size: 10px; text-align: left; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .data-table th { background: #0f766e; color: white; font-weight: 700; text-transform: uppercase; font-size: 9px; }
            .data-table tr:nth-child(even) { background: #f8fafc; }
            .total-row { font-weight: bold; background: #f1f5f9 !important; border-top: 2px solid #0f766e; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            .badge-print { font-weight: bold; padding: 1px 4px; border-radius: 4px; font-size: 9px; }
            .badge-paid { background: #d1fae5; color: #065f46; }
            .badge-due { background: #fee2e2; color: #991b1b; }
            .badge-partial { background: #fef3c7; color: #92400e; }
            .badge-overdue { background: #ffe4e6; color: #9f1239; }
            
            .footer-section { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
            .sig-line { width: 140px; border-top: 1px solid #0f766e; margin-bottom: 4px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">RI</div>
            <div class="title-section">
              <h1>रहमानिया इंस्टीट्यूट — RAHMANIA INSTITUTE</h1>
              <h2>Student Finance Management System</h2>
            </div>
            <div style="width:45px;"></div>
          </div>
          
          <div class="report-title">
            <span>${title}</span>
          </div>
          
          ${filterInfoHtml}
          
          <table class="data-table">
            ${tableHtml}
          </table>
          
          <div class="footer-section">
            <div>
              <p>Report Date: ${new Date().toLocaleDateString()}</p>
            </div>
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

  // Export CSV Helper
  const downloadCsv = (filename, headers, rows) => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...rows.map(r => r.map(escape).join(","))
    ];
    const csv = "\uFEFF" + lines.join("\n"); // BOM for excel encoding support
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print Due List Report
  const handlePrintDueList = () => {
    const filterInfo = `
      <table class="filter-info-table">
        <thead>
          <tr>
            <th>Branch</th>
            <th>Class</th>
            <th>Session</th>
            <th>Group</th>
            <th>Year Session</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${selectedDueBranch?.name_bn || selectedDueBranch?.name_en || "N/A"}</td>
            <td>${dueClassesOptions.find(c => String(c.id) === String(dueClassId))?.label || dueClassId || "N/A"}</td>
            <td>${dueHasSessions ? (dueSessionsOptions.find(s => s.value === dueSessionId)?.label || "N/A") : "N/A"}</td>
            <td>${dueHasGroups ? (dueGroupsOptions.find(g => g.value === dueGroupId)?.label || "N/A") : "N/A"}</td>
            <td>${dueYear}</td>
          </tr>
        </tbody>
      </table>
    `;

    const headersHtml = `
      <thead>
        <tr>
          <th>Student Name</th>
          <th>ID / Roll</th>
          <th>Mobile</th>
          ${MONTHS_LIST.map(m => `<th>${m.name}</th>`).join("")}
          <th>Total Due</th>
        </tr>
      </thead>
    `;

    const rowsHtml = dueGridData.map(row => `
      <tr>
        <td><strong>${row.student.full_name_en}</strong></td>
        <td>#${row.student.roll_number}</td>
        <td>${row.student.mobile_number || "—"}</td>
        ${MONTHS_LIST.map(m => {
          const due = row.monthlyDues[m.key];
          return `<td>৳${due}</td>`;
        }).join("")}
        <td class="text-right"><strong>৳${row.totalDueSum}</strong></td>
      </tr>
    `).join("");

    const totalDuesSumAll = dueGridData.reduce((s, r) => s + r.totalDueSum, 0);
    const totalsHtml = `
      <tr class="total-row">
        <td colspan="3">TOTAL STUDENTS DUES: ${dueGridData.length}</td>
        ${MONTHS_LIST.map(m => {
          const sumMonth = dueGridData.reduce((s, r) => s + r.monthlyDues[m.key], 0);
          return `<td>৳${sumMonth}</td>`;
        }).join("")}
        <td class="text-right">৳${totalDuesSumAll}</td>
      </tr>
    `;

    handlePrint("Due List Report", `${headersHtml}<tbody>${rowsHtml}${totalsHtml}</tbody>`, filterInfo);
  };

  // Export Due List to CSV
  const handleExportDueListCSV = () => {
    const headers = ["Student Name", "Student ID", "Phone", ...MONTHS_LIST.map(m => m.name), "Total Due"];
    const rows = dueGridData.map(row => [
      row.student.full_name_en,
      row.student.roll_number,
      row.student.mobile_number || "",
      ...MONTHS_LIST.map(m => row.monthlyDues[m.key]),
      row.totalDueSum
    ]);
    const classLabel = dueClassesOptions.find(c => String(c.id) === String(dueClassId))?.label || dueClassId;
    downloadCsv(`due_list_${dueYear}_${classLabel}.csv`, headers, rows);
  };

  // Reports compilation helpers
  const getMonthlyCollectionReport = () => {
    const filterMonthKey = `${repYear}-${repMonth}`;
    return fees.filter(f => f.month === filterMonthKey && !f.is_archived);
  };

  const getBranchCollectionReport = () => {
    return fees.filter(f => {
      const studentObj = uniqueStudents.find(s => String(s.id) === String(f.student_id));
      if (!studentObj) return false;
      return String(studentObj.branch_id) === String(repBranchId) && f.month?.startsWith(repYear) && !f.is_archived;
    });
  };

  const getClassCollectionReport = () => {
    const branchObj = branches.find(b => String(b.id) === String(repBranchId));
    return fees.filter(f => {
      const studentObj = uniqueStudents.find(s => String(s.id) === String(f.student_id));
      if (!studentObj) return false;
      if (String(studentObj.branch_id) !== String(repBranchId)) return false;
      if (repClassId) {
        const optionId = repSessionId || repClassId;
        if (!isStudentInClassOption(studentObj, optionId, branchObj?.academic_structure)) return false;
      }
      return f.month?.startsWith(repYear) && !f.is_archived;
    });
  };

  const getStudentLedger = () => {
    if (!repStudentId) return [];
    return fees.filter(f => String(f.student_id) === String(repStudentId)).sort((a,b) => a.month.localeCompare(b.month));
  };

  // Print Reports
  const handlePrintReport = () => {
    if (reportType === "monthly") {
      const data = getMonthlyCollectionReport();
      const monthName = MONTHS_LIST.find(m => m.key === repMonth)?.name;
      const title = `Monthly Collection Report — ${monthName} ${repYear}`;
      
      const tableHtml = `
        <thead>
          <tr>
            <th>Date</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Branch</th>
            <th>Class</th>
            <th>Method</th>
            <th class="text-right">Expected</th>
            <th class="text-right">Paid</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Fine</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(f => `
            <tr>
              <td>${f.payment_date || "—"}</td>
              <td>#${f.roll_number}</td>
              <td><strong>${f.student_name}</strong></td>
              <td>${f.branch_name}</td>
              <td>${f.class_name}</td>
              <td>${f.payment_method || "Cash"}</td>
              <td class="text-right">৳${f.total_fee || 0}</td>
              <td class="text-right">৳${f.paid_amount || 0}</td>
              <td class="text-right">৳${f.discount || 0}</td>
              <td class="text-right">৳${f.fine || 0}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="6">TOTAL COLLECTIONS: ${data.length} records</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.total_fee||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.paid_amount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.discount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.fine||0),0)}</td>
          </tr>
        </tbody>
      `;
      handlePrint(title, tableHtml);

    } else if (reportType === "branch") {
      const data = getBranchCollectionReport();
      const branchName = selectedRepBranch ? (selectedRepBranch.name_bn || selectedRepBranch.name_en) : "N/A";
      const title = `Branch Wise Collection Report — ${branchName} (${repYear})`;
      
      const tableHtml = `
        <thead>
          <tr>
            <th>Month</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Method</th>
            <th class="text-right">Expected</th>
            <th class="text-right">Paid</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Fine</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(f => `
            <tr>
              <td>${f.month}</td>
              <td>#${f.roll_number}</td>
              <td><strong>${f.student_name}</strong></td>
              <td>${f.class_name}</td>
              <td>${f.payment_method || "Cash"}</td>
              <td class="text-right">৳${f.total_fee || 0}</td>
              <td class="text-right">৳${f.paid_amount || 0}</td>
              <td class="text-right">৳${f.discount || 0}</td>
              <td class="text-right">৳${f.fine || 0}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="5">BRANCH TOTALS: ${data.length} collections</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.total_fee||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.paid_amount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.discount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.fine||0),0)}</td>
          </tr>
        </tbody>
      `;
      handlePrint(title, tableHtml);

    } else if (reportType === "class") {
      const data = getClassCollectionReport();
      const branchName = selectedRepBranch ? (selectedRepBranch.name_bn || selectedRepBranch.name_en) : "N/A";
      const classLabel = repClassesOptions.find(c => String(c.id) === String(repClassId))?.label || repClassId || "N/A";
      const title = `Class Wise Collection Report — Class ${classLabel} (${branchName})`;

      const tableHtml = `
        <thead>
          <tr>
            <th>Month</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Method</th>
            <th class="text-right">Expected</th>
            <th class="text-right">Paid</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Fine</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(f => `
            <tr>
              <td>${f.month}</td>
              <td>#${f.roll_number}</td>
              <td><strong>${f.student_name}</strong></td>
              <td>${f.payment_method || "Cash"}</td>
              <td class="text-right">৳${f.total_fee || 0}</td>
              <td class="text-right">৳${f.paid_amount || 0}</td>
              <td class="text-right">৳${f.discount || 0}</td>
              <td class="text-right">৳${f.fine || 0}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="4">CLASS TOTALS: ${data.length} collections</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.total_fee||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.paid_amount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.discount||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.fine||0),0)}</td>
          </tr>
        </tbody>
      `;
      handlePrint(title, tableHtml);

    } else if (reportType === "ledger") {
      const data = getStudentLedger();
      const repStudent = uniqueStudents.find(s => String(s.id) === String(repStudentId));
      const title = `Student Ledger Statement — ${repStudent?.full_name_en || "N/A"}`;
      
      const filterInfo = `
        <table class="filter-info-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Roll Number</th>
              <th>Branch</th>
              <th>Department / Batch</th>
              <th>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#${repStudent?.roll_number}</td>
              <td>${repStudent?.roll_number || "—"}</td>
              <td>${selectedRepBranch ? (selectedRepBranch.name_bn || selectedRepBranch.name_en) : "—"}</td>
              <td>${(() => {
                const bObj = branches.find(b => String(b.id) === String(repStudent?.branch_id));
                const academicStructure = bObj?.academic_structure || [];
                return resolveAcademicDisplayName(repStudent?.class_id, repStudent?.session_id, repStudent?.class_group_id, academicStructure, 'bn') || repStudent?.class_name || repStudent?.batch || "—";
              })()}</td>
              <td>${repStudent?.mobile_number || "—"}</td>
            </tr>
          </tbody>
        </table>
      `;

      let runningBalance = 0;
      const tableHtml = `
        <thead>
          <tr>
            <th>Month</th>
            <th>Date</th>
            <th>Details</th>
            <th>Method</th>
            <th class="text-right">Billed (+Fine)</th>
            <th class="text-right">Paid (-Discount)</th>
            <th class="text-right">Remaining Due</th>
            <th class="text-right">Running Due Balance</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(f => {
            const billed = (f.total_fee || 0);
            const paid = (f.paid_amount || 0);
            const remaining = (f.due_amount || 0);
            runningBalance += remaining;
            return `
              <tr>
                <td>${f.month}</td>
                <td>${f.payment_date || "—"}</td>
                <td>Fine: ৳${f.fine || 0} | Disc: ৳${f.discount || 0}</td>
                <td>${f.payment_method || "Cash"}</td>
                <td class="text-right">৳${billed}</td>
                <td class="text-right">৳${paid}</td>
                <td class="text-right font-semibold text-red-600">৳${remaining}</td>
                <td class="text-right font-bold">৳${runningBalance}</td>
              </tr>
            `;
          }).join("")}
          <tr class="total-row">
            <td colspan="4">LEDGER SUMMARY STATEMENT</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.total_fee||0),0)}</td>
            <td class="text-right">৳${data.reduce((s,f)=>s+(f.paid_amount||0),0)}</td>
            <td class="text-right text-red-600">৳${data.reduce((s,f)=>s+(f.due_amount||0),0)}</td>
            <td class="text-right">৳${runningBalance}</td>
          </tr>
        </tbody>
      `;
      handlePrint(title, tableHtml, filterInfo);
    }
  };

  // Export Reports CSV
  const handleExportReportCSV = () => {
    if (reportType === "monthly") {
      const data = getMonthlyCollectionReport();
      const headers = ["Date", "Student ID", "Student Name", "Branch", "Class", "Method", "Expected", "Paid", "Discount", "Fine"];
      const rows = data.map(f => [f.payment_date, f.roll_number, f.student_name, f.branch_name, f.class_name, f.payment_method, f.total_fee, f.paid_amount, f.discount, f.fine]);
      downloadCsv(`monthly_collection_${repYear}_${repMonth}.csv`, headers, rows);
    } else if (reportType === "branch") {
      const data = getBranchCollectionReport();
      const headers = ["Month", "Student ID", "Student Name", "Class", "Method", "Expected", "Paid", "Discount", "Fine"];
      const rows = data.map(f => [f.month, f.roll_number, f.student_name, f.class_name, f.payment_method, f.total_fee, f.paid_amount, f.discount, f.fine]);
      downloadCsv(`branch_collection_${repBranchId}_${repYear}.csv`, headers, rows);
    } else if (reportType === "class") {
      const data = getClassCollectionReport();
      const headers = ["Month", "Student ID", "Student Name", "Method", "Expected", "Paid", "Discount", "Fine"];
      const rows = data.map(f => [f.month, f.roll_number, f.student_name, f.payment_method, f.total_fee, f.paid_amount, f.discount, f.fine]);
      const classLabel = repClassesOptions.find(c => String(c.id) === String(repClassId))?.label || repClassId;
      downloadCsv(`class_collection_${classLabel}_${repYear}.csv`, headers, rows);
    } else if (reportType === "ledger") {
      const data = getStudentLedger();
      const headers = ["Month", "Date", "Method", "Expected", "Paid", "Discount", "Fine", "Remaining Due"];
      const rows = data.map(f => [f.month, f.payment_date, f.payment_method, f.total_fee, f.paid_amount, f.discount, f.fine, f.due_amount]);
      downloadCsv(`student_ledger_${repStudentId}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Finance Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "collection", label: "💰 Fee Collection (Receive)" },
          { id: "dues", label: "📋 Due List Grid" },
          { id: "setup", label: "⚙️ Global Fee Setup" },
          { id: "reports", label: "📊 Reports Center" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#052E2B] text-[#052E2B]"
                : "border-transparent text-gray-500 hover:text-[#052E2B] hover:border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. FEE COLLECTION TAB ── */}
      {activeTab === "collection" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Form inputs */}
          <Card className="lg:col-span-2 border-gray-100 rounded-[20px] shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50/50 p-6">
              <CardTitle className="text-base font-bold text-[#052E2B]">Fee Collection Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveCollection} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                    <Select value={collBranchId} onValueChange={handleBranchChange} disabled={currentUser?.role === "branch_admin"}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        {branches.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Class *</Label>
                    <Select value={collClassId} onValueChange={handleClassChange} disabled={!collBranchId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {collClassesOptions.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {collHasSessions && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Session *</Label>
                    <Select value={collSessionId} onValueChange={(v) => { setCollSessionId(v); setCollStudentId(""); }}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select session" /></SelectTrigger>
                      <SelectContent>
                        {collSessionsOptions.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {collHasGroups && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Group *</Label>
                    <Select value={collGroupId} onValueChange={(v) => { setCollGroupId(v); setCollStudentId(""); }}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select group" /></SelectTrigger>
                      <SelectContent>
                        {collGroupsOptions.map(g => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold text-slate-500">Student *</Label>
                    <div className="flex gap-2 mt-1">
                      <SearchInput
                        value={studentSearch}
                        onChange={setStudentSearch}
                        placeholder="Search Name/Roll/ID..."
                        className="h-10 text-xs"
                        containerClassName="flex-1"
                        disabled={!collBranchId}
                      />
                      <div className="w-1/2">
                        <Select value={collStudentId} onValueChange={handleStudentChange} disabled={!collBranchId}>
                          <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                          <SelectContent>
                            {collStudents.length === 0 ? (
                              <SelectItem value="none" disabled>No active students</SelectItem>
                            ) : (
                              collStudents.map(s => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} — #{s.roll_number}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Session Year *</Label>
                    <Input 
                      type="text" 
                      value={collYear} 
                      onChange={e => setCollYear(e.target.value)} 
                      placeholder="e.g. 2026" 
                      required 
                      className="mt-1" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Billing Month *</Label>
                    <Select value={collMonth} onValueChange={setCollMonth}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS_LIST.map(m => (
                          <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Collection Date *</Label>
                    <Input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)} required className="mt-1" />
                  </div>
                </div>

                {selectedStudent && (
                  <div className="p-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/20 space-y-3">
                    <p className="text-xs font-bold text-indigo-800">Dynamic Fee Selectors (Calculated from Student Setup)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {feeTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`check-${type}`} 
                            checked={!!checkedFees[type]} 
                            onCheckedChange={(checked) => {
                              setCheckedFees(prev => ({ ...prev, [type]: !!checked }));
                            }} 
                          />
                          <label htmlFor={`check-${type}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                            {type}: ৳{studentFeeSetup[type] || 0}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {existingRecord && (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/30 text-xs text-amber-800 space-y-1">
                    <p className="font-bold text-amber-900">⚠️ Existing Fee Record Detected for {MONTHS_LIST.find(m => m.key === collMonth)?.name} {collYear}</p>
                    <p>Total Expected Fee: ৳{existingRecord.total_fee || 0} | Previously Paid: ৳{existingRecord.paid_amount || 0} | Remaining Due: ৳{existingRecord.due_amount || 0}</p>
                    <p className="text-slate-500 mt-1 font-medium">Entering fee now will add to the previously paid amount for this month.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Amount Paid (৳) *</Label>
                    <Input type="number" placeholder="0" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Discount (৳)</Label>
                    <Input type="number" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Fine (৳)</Label>
                    <Input type="number" placeholder="0" value={fine} onChange={e => setFine(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Method *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-500">Collection Notes</Label>
                  <Input placeholder="Receipt no., memo, remarks..." value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" />
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button type="submit" className="bg-[#052E2B] hover:bg-[#042422] text-white gap-2 font-bold px-6 h-11 rounded-xl" disabled={createFeeMutation.isPending || updateFeeMutation.isPending}>
                    {createFeeMutation.isPending || updateFeeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                    Save Fee Entry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Side: Calculation & Summary Display */}
          <div className="space-y-4">
            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#052E2B] to-[#042422] text-white p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-400">Calculation Console</CardTitle>
                <p className="text-xs text-white/70 italic mt-1">Automatic real-time calculation breakdown</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {existingRecord ? (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500 font-semibold">Previous Paid Amount</span>
                      <span className="text-sm font-semibold text-emerald-600">৳{existingRecord.paid_amount || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500 font-semibold">Previous Remaining Due</span>
                      <span className="text-sm font-bold text-red-600">৳{existingRecord.due_amount || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">New Payment Amount</span>
                      <span className="text-sm font-bold text-[#052E2B]">৳{numPaid}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">New Discount</span>
                      <span className="text-sm font-semibold text-blue-600">- ৳{numDiscount}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">New Fine</span>
                      <span className="text-sm font-semibold text-amber-600">+ ৳{numFine}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">New Total Expected Fee</span>
                      <span className="text-sm font-bold text-[#052E2B]">৳{Number(existingRecord.total_fee || 0) + numFine}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500 font-bold">New Remaining Due</span>
                      <span className="text-sm font-bold text-rose-600">
                        ৳{Math.max(0, (Number(existingRecord.total_fee || 0) + numFine) - ((Number(existingRecord.paid_amount || 0) + numPaid) + (Number(existingRecord.discount || 0) + numDiscount)))}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Expected Base Fee</span>
                      <span className="text-sm font-semibold">৳{baseExpectedFee}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Fines Added</span>
                      <span className="text-sm font-semibold text-amber-600">+ ৳{numFine}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Total Billable</span>
                      <span className="text-sm font-bold text-[#052E2B]">৳{totalExpectedWithFine}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Paid Amount</span>
                      <span className="text-sm font-bold text-emerald-600">৳{numPaid}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Discount Offered</span>
                      <span className="text-sm font-semibold text-blue-600">- ৳{numDiscount}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-xs text-slate-500">Calculated Due</span>
                      <span className="text-sm font-bold text-red-600">৳{calculatedDue}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500 font-semibold">Target Status</span>
                  <Badge className={`text-xs uppercase font-bold px-2.5 py-1 ${
                    (existingRecord ? (
                      Math.max(0, (Number(existingRecord.total_fee || 0) + numFine) - ((Number(existingRecord.paid_amount || 0) + numPaid) + (Number(existingRecord.discount || 0) + numDiscount))) <= 0 ? "paid" : "partial"
                    ) : calculatedStatus) === "paid" ? "bg-emerald-100 text-emerald-700" :
                    (existingRecord ? (
                      Math.max(0, (Number(existingRecord.total_fee || 0) + numFine) - ((Number(existingRecord.paid_amount || 0) + numPaid) + (Number(existingRecord.discount || 0) + numDiscount))) <= 0 ? "paid" : "partial"
                    ) : calculatedStatus) === "partial" ? "bg-amber-100 text-amber-700" :
                    (existingRecord ? (
                      Math.max(0, (Number(existingRecord.total_fee || 0) + numFine) - ((Number(existingRecord.paid_amount || 0) + numPaid) + (Number(existingRecord.discount || 0) + numDiscount))) <= 0 ? "paid" : "partial"
                    ) : calculatedStatus) === "overdue" ? "bg-rose-100 text-rose-700" : "bg-red-100 text-red-700"
                  }`}>
                    {existingRecord ? (
                      Math.max(0, (Number(existingRecord.total_fee || 0) + numFine) - ((Number(existingRecord.paid_amount || 0) + numPaid) + (Number(existingRecord.discount || 0) + numDiscount))) <= 0 ? "paid" : "partial"
                    ) : calculatedStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-4">
              <p className="text-xs font-bold text-[#052E2B] mb-2 uppercase tracking-wide">Help Tips</p>
              <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed">
                <li>Expected fees populate automatically from the student's setup settings.</li>
                <li>Ensure the database columns migration is completed prior to entering new collections.</li>
                <li>Receipts and statements can be generated dynamically in the Reports Center tab.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* ── 2. DUE LIST GRID TAB ── */}
      {activeTab === "dues" && (
        <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50/50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-base font-bold text-[#052E2B]">Class Dues Sheet</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Live overview and reports matching the official template.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrintDueList} disabled={!dueClassId || dueGridData.length === 0} className="gap-1.5 rounded-xl border-[#052E2B] text-[#052E2B] hover:bg-gray-50 h-9 font-bold text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Dues Sheet
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportDueListCSV} disabled={!dueClassId || dueGridData.length === 0} className="gap-1.5 rounded-xl border-[#0f766e] text-[#0f766e] hover:bg-gray-50 h-9 font-bold text-xs">
                  <Download className="h-3.5 w-3.5" /> Download Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                <Select value={dueBranchId} onValueChange={(v) => { setDueBranchId(v); setDueClassId(""); setDueSessionId(""); setDueGroupId(""); }} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">Class *</Label>
                <Select value={dueClassId} onValueChange={(v) => { setDueClassId(v); setDueSessionId(""); setDueGroupId(""); }} disabled={!dueBranchId}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {dueClassesOptions.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dueHasSessions && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Session *</Label>
                  <Select value={dueSessionId} onValueChange={setDueSessionId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select session" /></SelectTrigger>
                    <SelectContent>
                      {dueSessionsOptions.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {dueHasGroups && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Group *</Label>
                  <Select value={dueGroupId} onValueChange={setDueGroupId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select group" /></SelectTrigger>
                    <SelectContent>
                      {dueGroupsOptions.map(g => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Year Session *</Label>
                <Input 
                  type="text" 
                  value={dueYear} 
                  onChange={e => setDueYear(e.target.value)} 
                  placeholder="e.g. 2026" 
                  required 
                  className="mt-1 h-9 rounded-xl text-xs" 
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">Dues Filter Status</Label>
                <Select value={dueFilterStatus} onValueChange={setDueFilterStatus}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="due">Only Due Students</SelectItem>
                    <SelectItem value="paid">Only Paid Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 max-w-sm">
              <SearchInput
                value={dueSearch}
                onChange={setDueSearch}
                placeholder="Search student name or roll..."
                className="h-9 text-xs"
              />
            </div>

            {/* Dues Table Grid */}
            {!dueBranchId || !dueClassId ? (
              <div className="text-center py-12 border rounded-xl border-dashed text-muted-foreground bg-slate-50/50">
                Please select a Branch and Class to load the Dues List sheet.
              </div>
            ) : dueGridData.length === 0 ? (
              <div className="text-center py-12 border rounded-xl text-muted-foreground">
                No student records found matching filters.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                {/* Official template header block */}
                <div className="bg-[#f8fafc] p-4 border-b flex justify-between items-center text-xs font-semibold text-slate-700">
                  <div className="flex gap-6">
                    <p>Shift: <span className="font-bold text-[#052E2B]">Morning</span></p>
                    <p>Medium: <span className="font-bold text-[#052E2B]">Bangla</span></p>
                    <p>Class: <span className="font-bold text-[#052E2B]">{dueClassesOptions.find(c => String(c.id) === String(dueClassId))?.label || dueClassId || "N/A"}</span></p>
                    <p>Session: <span className="font-bold text-[#052E2B]">{dueYear}</span></p>
                  </div>
                  <Badge className="bg-[#052E2B] text-white">Active Grid</Badge>
                </div>
                
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                        <th className="py-3 px-4 text-center">Photo</th>
                        <th className="py-3 px-4">Student Details</th>
                        <th className="py-3 px-4">Phone</th>
                        {MONTHS_LIST.map(m => (
                          <th key={m.key} className="py-3 px-2 text-center min-w-[60px]">{m.name}</th>
                        ))}
                        <th className="py-3 px-4 text-right min-w-[90px]">Total Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dueGridData.map(row => (
                        <tr key={row.student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4 text-center">
                            <div className="h-9 w-9 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center mx-auto">
                              {row.student.photo_url ? (
                                <img src={row.student.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500">{row.student.full_name_en?.[0]}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-slate-800">{row.student.full_name_en}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.student.roll_number} | Roll: {row.student.roll_number}</p>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-medium">{row.student.mobile_number || "—"}</td>
                          {MONTHS_LIST.map(m => {
                            const due = row.monthlyDues[m.key];
                            return (
                              <td key={m.key} className="py-2.5 px-2 text-center font-semibold">
                                {due > 0 ? (
                                  <span className="text-red-600">{due}</span>
                               ) : (
                                  <span className="text-emerald-600 font-medium">0</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-4 text-right font-extrabold text-[#052E2B] bg-[#052E2B]/3">
                            ৳{row.totalDueSum.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                  {dueGridData.map(row => (
                    <div key={row.student.id} className="p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {row.student.photo_url ? (
                              <img src={row.student.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">{row.student.full_name_en?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{row.student.full_name_en}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {row.student.roll_number} | Roll: {row.student.roll_number}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">Total Due</p>
                          <p className="font-bold text-xs text-[#052E2B] bg-[#052E2B]/5 px-2 py-0.5 rounded-lg mt-0.5 inline-block">
                            ৳{row.totalDueSum.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                        <span>Phone: <span className="font-semibold text-slate-700">{row.student.mobile_number || "—"}</span></span>
                      </div>

                      {/* Dues breakdown in a compact 4-column grid */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Monthly Breakdown</p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                          {MONTHS_LIST.map(m => {
                            const due = row.monthlyDues[m.key];
                            return (
                              <div key={m.key} className={`p-1.5 rounded-lg border text-center transition-all ${due > 0 ? 'bg-red-50/40 border-red-100/60' : 'bg-emerald-50/20 border-emerald-100/40'}`}>
                                <p className="text-[8px] text-slate-400 font-semibold uppercase">{m.name.slice(0, 3)}</p>
                                <p className={`text-[10px] font-bold mt-0.5 ${due > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{due}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── 3. GLOBAL SETUP TAB ── */}
      {activeTab === "setup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50/50 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#052E2B]">Dynamic Fee Types</CardTitle>
              <Button onClick={() => setIsAddingFeeType(true)} className="bg-[#052E2B] hover:bg-[#042422] text-white gap-1.5 h-8 text-xs rounded-lg font-bold">
                <Plus className="h-3.5 w-3.5" /> Add Type
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingSettings ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-2">
                  {feeTypes.map((type) => (
                    <div key={type} className="flex justify-between items-center p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#052E2B]" />
                        <span className="text-xs font-semibold text-slate-800">{type}</span>
                        {["Admission Fee", "Monthly Tuition Fee", "Exam Fee"].includes(type) && (
                          <Badge variant="outline" className="text-[9px] h-4 text-slate-400 uppercase">System Default</Badge>
                        )}
                      </div>
                      {!["Admission Fee", "Monthly Tuition Fee", "Exam Fee"].includes(type) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteFeeType(type)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-100 rounded-[20px] shadow-sm bg-white p-6">
            <h4 className="text-sm font-bold text-[#052E2B] mb-2 uppercase tracking-wide">Database Schema Integrity Checklist</h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This system supports dynamic customizable fee configurations. Any new fee types defined here will immediately render fields under the **Student Form Configuration** section and the **Dynamic Billing Selectors**.
            </p>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 text-xs text-amber-800 leading-relaxed">
              <strong>Caution:</strong> Deleting a Fee Type will prevent it from appearing in future student setup config options. However, past payments logged towards that fee type will remain untouched inside database collection entries history logs.
            </div>
          </Card>

          {/* Add Fee Type Dialog */}
          <Dialog open={isAddingFeeType} onOpenChange={setIsAddingFeeType}>
            <DialogContent className="w-[95vw] sm:max-w-sm max-h-[90vh] overflow-y-auto rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-[#052E2B]">Create Custom Fee Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Fee Type Name *</Label>
                  <Input 
                    placeholder="e.g. Sports Fee, Transport Fee" 
                    value={newFeeTypeName} 
                    onChange={e => setNewFeeTypeName(e.target.value)} 
                    className="mt-1.5 h-11 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddingFeeType(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleAddFeeType} disabled={updateSettingMutation.isPending || createSettingMutation.isPending} className="bg-[#052E2B] hover:bg-[#042422] text-white font-bold rounded-xl px-5">
                    Save Fee Type
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── 4. REPORTS TAB ── */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters card */}
          <Card className="lg:col-span-1 border-gray-100 rounded-[20px] shadow-sm bg-white self-start">
            <CardHeader className="border-b border-gray-50/50 p-6">
              <CardTitle className="text-base font-bold text-[#052E2B]">Report Builder</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ledger">Student Ledger</SelectItem>
                    <SelectItem value="monthly">Monthly Collection</SelectItem>
                    <SelectItem value="branch">Branch Collection</SelectItem>
                    <SelectItem value="class">Class Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(reportType === "monthly" || reportType === "branch" || reportType === "class") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Session Year *</Label>
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

              {reportType === "monthly" && (
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

              {(reportType === "branch" || reportType === "class" || reportType === "ledger") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Branch *</Label>
                  <Select value={repBranchId} onValueChange={v => { setRepBranchId(v); setRepClassId(""); setRepStudentId(""); }} disabled={currentUser?.role === "branch_admin"}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(reportType === "class" || reportType === "ledger") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Class *</Label>
                  <Select value={repClassId} onValueChange={v => { setRepClassId(v); setRepSessionId(""); setRepGroupId(""); setRepStudentId(""); }} disabled={!repBranchId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {repClassesOptions.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {repHasSessions && (reportType === "class" || reportType === "ledger") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Session *</Label>
                  <Select value={repSessionId} onValueChange={setRepSessionId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select session" /></SelectTrigger>
                    <SelectContent>
                      {repSessionsOptions.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {repHasGroups && (reportType === "class" || reportType === "ledger") && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Group *</Label>
                  <Select value={repGroupId} onValueChange={setRepGroupId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select group" /></SelectTrigger>
                    <SelectContent>
                      {repGroupsOptions.map(g => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === "ledger" && (
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Student *</Label>
                  <Select value={repStudentId} onValueChange={setRepStudentId} disabled={!repClassId}>
                    <SelectTrigger className="mt-1 h-9 rounded-xl"><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {repStudents.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} — #{s.roll_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-2 border-t flex flex-col gap-2">
                <Button onClick={handlePrintReport} className="bg-[#052E2B] hover:bg-[#042422] text-white font-bold w-full rounded-xl gap-2 h-10 text-xs">
                  <Printer className="h-4 w-4" /> Print Ready View
                </Button>
                <Button variant="outline" onClick={handleExportReportCSV} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold w-full rounded-xl gap-2 h-10 text-xs">
                  <FileSpreadsheet className="h-4 w-4" /> Download Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview panel */}
          <Card className="lg:col-span-3 border-gray-100 rounded-[20px] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Live Preview</CardTitle>
              <Badge className="bg-[#052E2B] text-white">Live Data</Badge>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto min-h-[300px]">
              {reportType === "monthly" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#052E2B]">Monthly Collection Register</h4>
                  <table className="w-full text-xs text-left border-collapse border">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Student Name</th>
                        <th className="p-2 border">ID / Roll</th>
                        <th className="p-2 border">Method</th>
                        <th className="p-2 border text-right">Paid Amount</th>
                        <th className="p-2 border text-right">Discount</th>
                        <th className="p-2 border text-right">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getMonthlyCollectionReport().map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{f.payment_date}</td>
                          <td className="p-2 border"><strong>{f.student_name}</strong></td>
                          <td className="p-2 border">#{f.roll_number}</td>
                          <td className="p-2 border">{f.payment_method}</td>
                          <td className="p-2 border text-right">৳{f.paid_amount}</td>
                          <td className="p-2 border text-right">৳{f.discount}</td>
                          <td className="p-2 border text-right">৳{f.fine}</td>
                        </tr>
                      ))}
                      {getMonthlyCollectionReport().length === 0 && (
                        <tr><td colSpan="7" className="p-6 text-center text-slate-400 italic">No collections recorded for this month.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === "branch" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#052E2B]">Branch Wise Year Collections Register</h4>
                  <table className="w-full text-xs text-left border-collapse border">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Student Name</th>
                        <th className="p-2 border">ID / Roll</th>
                        <th className="p-2 border text-right">Paid Amount</th>
                        <th className="p-2 border text-right">Discount</th>
                        <th className="p-2 border text-right">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getBranchCollectionReport().map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{f.month}</td>
                          <td className="p-2 border"><strong>{f.student_name}</strong></td>
                          <td className="p-2 border">#{f.roll_number}</td>
                          <td className="p-2 border text-right">৳{f.paid_amount}</td>
                          <td className="p-2 border text-right">৳{f.discount}</td>
                          <td className="p-2 border text-right">৳{f.fine}</td>
                        </tr>
                      ))}
                      {getBranchCollectionReport().length === 0 && (
                        <tr><td colSpan="6" className="p-6 text-center text-slate-400 italic">No collections recorded for this branch in {repYear}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === "class" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#052E2B]">Class Wise Year Collections Register</h4>
                  <table className="w-full text-xs text-left border-collapse border">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Student Name</th>
                        <th className="p-2 border">ID / Roll</th>
                        <th className="p-2 border text-right">Paid Amount</th>
                        <th className="p-2 border text-right">Discount</th>
                        <th className="p-2 border text-right">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getClassCollectionReport().map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{f.month}</td>
                          <td className="p-2 border"><strong>{f.student_name}</strong></td>
                          <td className="p-2 border">#{f.roll_number}</td>
                          <td className="p-2 border text-right">৳{f.paid_amount}</td>
                          <td className="p-2 border text-right">৳{f.discount}</td>
                          <td className="p-2 border text-right">৳{f.fine}</td>
                        </tr>
                      ))}
                      {getClassCollectionReport().length === 0 && (
                        <tr><td colSpan="6" className="p-6 text-center text-slate-400 italic">No collections recorded for this class in {repYear}.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === "ledger" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#052E2B]">Student Financial Ledger Account</h4>
                  <table className="w-full text-xs text-left border-collapse border">
                    <thead>
                      <tr className="bg-slate-100 border-b font-bold text-slate-600">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Method</th>
                        <th className="p-2 border text-right">Billed (+Fine)</th>
                        <th className="p-2 border text-right">Paid (-Discount)</th>
                        <th className="p-2 border text-right text-red-600">Remaining Due</th>
                        <th className="p-2 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getStudentLedger().map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-2 border">{f.month}</td>
                          <td className="p-2 border">{f.payment_date || "—"}</td>
                          <td className="p-2 border">{f.payment_method || "Cash"}</td>
                          <td className="p-2 border text-right">৳{f.total_fee || 0}</td>
                          <td className="p-2 border text-right">৳{f.paid_amount || 0}</td>
                          <td className="p-2 border text-right text-red-600 font-semibold">৳{f.due_amount || 0}</td>
                          <td className="p-2 border text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) {
                                  deleteFeeMutation.mutate(f.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {getStudentLedger().length === 0 && (
                        <tr><td colSpan="7" className="p-6 text-center text-slate-400 italic">Please select a student to load their ledger statement.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}