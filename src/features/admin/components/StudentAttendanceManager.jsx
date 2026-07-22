import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { fetchStudentAttendanceByDateRange } from "@/api/services/attendanceService";
import { resolveAcademicDisplayName, isStudentInClassOption } from "@/lib/academic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function StudentAttendanceManager({ students, branches, currentUser }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : ""
  );
  const [classFilter, setClassFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const { search, setSearch, query } = useSearch({ data: [], debounceMs: 300 });

  React.useEffect(() => {
    setSessionFilter("");
    setGroupFilter("all");
  }, [classFilter]);

  const [reportMode, setReportMode] = useState("daily");
  const queryClient = useQueryClient();

  const selectedBranch = React.useMemo(
    () => branches.find(b => String(b.id) === String(selectedBranchId)),
    [branches, selectedBranchId]
  );

  const selectedFlatClass = React.useMemo(() => {
    if (!classFilter || !selectedBranch?.academic_structure) return null;
    return selectedBranch.academic_structure.find(c => String(c.id) === String(classFilter)) || null;
  }, [classFilter, selectedBranch]);

  const hasSessions = selectedFlatClass && Array.isArray(selectedFlatClass.sections) && selectedFlatClass.sections.length > 0;
  const hasGroups = selectedFlatClass && Array.isArray(selectedFlatClass.groups) && selectedFlatClass.groups.length > 0;

  const sessionOptions = React.useMemo(() => {
    if (!hasSessions) return [];
    return selectedFlatClass.sections.map(sec => ({
      value: String(sec.id),
      label: sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || ""
    }));
  }, [selectedFlatClass, hasSessions]);

  const groupOptions = React.useMemo(() => {
    if (!hasGroups) return [];
    return selectedFlatClass.groups.map(g => ({
      value: String(g.id),
      label: g.group_name?.bn || g.group_name?.en || String(g.id)
    }));
  }, [selectedFlatClass, hasGroups]);

  const classOptions = React.useMemo(() => {
    if (!selectedBranch?.academic_structure) return [];
    return selectedBranch.academic_structure.map(c => {
      const name = c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";
      return { value: String(c.id), label: name || "Unnamed Class" };
    });
  }, [selectedBranch]);

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      if (selectedBranchId) {
        if (String(s.branch_id) !== String(selectedBranchId)) return false;
      }
      if (classFilter) {
        const optionId = sessionFilter || classFilter;
        if (!isStudentInClassOption(s, optionId, selectedBranch?.academic_structure)) return false;
      }
      if (groupFilter && groupFilter !== "all") {
        if (String(s.class_group_id) !== String(groupFilter)) return false;
      }
      if (query) {
        const matchesSearch =
          s.full_name_en?.toLowerCase().includes(query) ||
          s.roll_number?.toLowerCase().includes(query) ||
          (s.full_name_bn && s.full_name_bn.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      return s.status === "active";
    });
  }, [students, selectedBranchId, classFilter, sessionFilter, groupFilter, query]);

  const [visibleCount, setVisibleCount] = useState(20);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [selectedBranchId, classFilter, sessionFilter, groupFilter, query]);

  const displayedStudents = React.useMemo(() => {
    return filteredStudents.slice(0, visibleCount);
  }, [filteredStudents, visibleCount]);

  const allowedStudentIds = React.useMemo(
    () => new Set(filteredStudents.map((s) => String(s.id))),
    [filteredStudents]
  );

  const { data: rawAttendanceList = [], isLoading } = useQuery({
    queryKey: ["admin-student-attendance", selectedDate, selectedBranchId],
    queryFn: () => appClient.entities.Attendance.filter({ date: selectedDate }, "-created_date", 2000),
    enabled: !!selectedBranchId && !!selectedDate,
  });

  // Biometric attendance records for the selected date
  const { data: biometricRecords = [] } = useQuery({
    queryKey: ["admin-biometric-student", selectedDate, selectedBranchId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=report&user_type=student&start_date=${selectedDate}&end_date=${selectedDate}&limit=1000`);
      const d = await r.json();
      return d.ok ? d.data : [];
    },
    enabled: !!selectedBranchId && !!selectedDate,
  });

  const biometricMap = React.useMemo(() => {
    const map = {};
    biometricRecords.forEach((rec) => {
      if (rec.user_type === "student") {
        map[String(rec.user_id)] = rec;
      }
    });
    return map;
  }, [biometricRecords]);

  const attendanceList = React.useMemo(
    () => rawAttendanceList.filter((att) => att.student_id && allowedStudentIds.has(String(att.student_id))),
    [rawAttendanceList, allowedStudentIds]
  );

  const attendanceMap = React.useMemo(() => {
    const map = {};
    attendanceList.forEach((att) => {
      if (att.student_id) {
        map[String(att.student_id)] = att;
      }
    });
    return map;
  }, [attendanceList]);

  const stats = React.useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    filteredStudents.forEach((s) => {
      const record = attendanceMap[String(s.id)];
      if (!record) {
        unmarked++;
      } else {
        switch (record.status) {
          case "present":
            present++;
            break;
          case "absent":
            absent++;
            break;
          case "late":
            late++;
            break;
          case "excused":
            excused++;
            break;
          default:
            unmarked++;
        }
      }
    });

    return { present, absent, late, excused, unmarked, total: filteredStudents.length };
  }, [filteredStudents, attendanceMap]);

  const saveAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }) => {
      const existing = attendanceMap[String(studentId)];
      if (existing) {
        return appClient.entities.Attendance.update(existing.id, {
          status,
        });
      } else {
        return appClient.entities.Attendance.create({
          student_id: studentId,
          date: selectedDate,
          status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-student-attendance", selectedDate, selectedBranchId] });
      toast.success("Attendance updated successfully.");
    },
    onError: (err) => {
      toast.error("Failed to update attendance: " + err.message);
    },
  });

  const getDateRange = (dateStr, mode) => {
    const d = new Date(dateStr + "T00:00:00");
    switch (mode) {
      case "daily":
        return { startDate: dateStr, endDate: dateStr };
      case "weekly": {
        const start = new Date(d);
        start.setDate(start.getDate() - 6);
        return { startDate: format(start, "yyyy-MM-dd"), endDate: dateStr };
      }
      case "monthly": {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return { startDate: format(start, "yyyy-MM-dd"), endDate: format(end, "yyyy-MM-dd") };
      }
      case "yearly": {
        const start = new Date(d.getFullYear(), 0, 1);
        const end = new Date(d.getFullYear(), 11, 31);
        return { startDate: format(start, "yyyy-MM-dd"), endDate: format(end, "yyyy-MM-dd") };
      }
      default:
        return { startDate: dateStr, endDate: dateStr };
    }
  };

  const getStudentClassName = (s) => {
    const bObj = branches.find(b => String(b.id) === String(s.branch_id));
    const academicStructure = bObj?.academic_structure || [];
    return resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, academicStructure, 'bn') || s.class_name || s.class_id || "";
  };

  const downloadCSV = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedDate, reportMode);

      if (reportMode === "daily") {
        const headers = ["Student ID", "Roll Number", "Name", "Branch", "Class", "Date", "Status", "Marked By"];
        const rows = filteredStudents.map((s) => {
          const record = attendanceMap[String(s.id)];
          const status = record ? record.status : "unmarked";
          const markedBy = record ? (record.marked_by || "System") : "";
          return [
            s.id,
            s.roll_number || "",
            `"${s.full_name_en || ""}"`,
            `"${selectedBranch?.name_en || selectedBranch?.branch_name || ""}"`,
            `"${getStudentClassName(s)}"`,
            selectedDate,
            status,
            markedBy,
          ];
        });
        const csvContent = "data:text/csv;charset=utf-8,"
          + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Student_Attendance_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const rangeLimits = { weekly: 2000, monthly: 5000, yearly: 6000 };
        const rangeAttendance = await fetchStudentAttendanceByDateRange(startDate, endDate, rangeLimits[reportMode] || 2000);

        const rangeAttendanceByStudent = {};
        rangeAttendance.forEach(a => {
          if (!a.student_id) return;
          const sid = String(a.student_id);
          if (!rangeAttendanceByStudent[sid]) rangeAttendanceByStudent[sid] = [];
          rangeAttendanceByStudent[sid].push(a);
        });

        const totalDays = Math.ceil(
          (new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / (1000 * 60 * 60 * 24)
        ) + 1;

        const headers = ["Student ID", "Roll Number", "Name", "Branch", "Class", "Total Days", "Present", "Absent", "Late", "Excused", "Unmarked", "Attendance %"];
        const rows = filteredStudents.map((s) => {
          const sid = String(s.id);
          const records = rangeAttendanceByStudent[sid] || [];
          let present = 0, absent = 0, late = 0, excused = 0;
          records.forEach(r => {
            switch (r.status) {
              case "present": present++; break;
              case "absent": absent++; break;
              case "late": late++; break;
              case "excused": excused++; break;
            }
          });
          const marked = present + absent + late + excused;
          const unmarked = totalDays - marked;
          const pct = totalDays > 0 ? (((present + late) / totalDays) * 100).toFixed(1) : "0.0";
          return [
            s.id,
            s.roll_number || "",
            `"${s.full_name_en || ""}"`,
            `"${selectedBranch?.name_en || selectedBranch?.branch_name || ""}"`,
            `"${getStudentClassName(s)}"`,
            totalDays,
            present,
            absent,
            late,
            excused,
            unmarked,
            pct,
          ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
          + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const modeLabel = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" }[reportMode] || "Range";
        link.setAttribute("download", `Student_Attendance_${modeLabel}_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      toast.error("Failed to export CSV: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B] flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-emerald-600" />
            Student Attendance Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, mark, and export daily student attendance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 rounded-xl h-10 border-gray-200"
          />
          <Select value={reportMode} onValueChange={setReportMode}>
            <SelectTrigger className="w-28 h-10 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadCSV} variant="glass" className="gap-2 text-sm btn-hover-lift h-10 rounded-xl">
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      {/* Filters Row: Branch + Class + Session + Group + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Branch</label>
          <Select
            value={selectedBranchId}
            onValueChange={(v) => { setSelectedBranchId(v); setClassFilter(""); setSessionFilter(""); setGroupFilter("all"); }}
            disabled={currentUser?.role === "branch_admin"}
          >
            <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name_en || b.branch_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Class</label>
          <Select
            value={classFilter}
            onValueChange={(v) => { setClassFilter(v); setSessionFilter(""); setGroupFilter("all"); }}
            disabled={!selectedBranchId}
          >
            <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((opt, i) => (
                <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasSessions && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Session</label>
            <Select
              value={sessionFilter}
              onValueChange={setSessionFilter}
            >
              <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map((opt, i) => (
                  <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasGroups && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Group</label>
            <Select
              value={groupFilter}
              onValueChange={setGroupFilter}
            >
              <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {groupOptions.map((opt, i) => (
                  <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search students..."
          className="h-9 text-xs"
          containerClassName="w-full sm:w-48"
        />
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-gray-100 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-1 border-l-4 border-l-emerald-600">
          <p className="text-xs text-gray-500 font-medium">Present</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
        </Card>
        <Card className="border-gray-100 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-1 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500 font-medium">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </Card>
        <Card className="border-gray-100 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-1 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500 font-medium">Late</p>
          <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
        </Card>
        <Card className="border-gray-100 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-1 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 font-medium">Excused</p>
          <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
        </Card>
        <Card className="border-gray-100 rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-1 border-l-4 border-l-slate-400">
          <p className="text-xs text-gray-500 font-medium">Unmarked</p>
          <p className="text-2xl font-bold text-slate-500">{stats.unmarked} / {stats.total}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold text-[#052E2B]">Students Listing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedBranchId ? (
            <div className="text-center py-12 text-muted-foreground">Please select a Branch to load attendance.</div>
          ) : isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No students found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-end py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedStudents.map((s) => {
                    const record = attendanceMap[String(s.id)];
                    const bio = biometricMap[String(s.id)];
                    const status = record ? record.status : (bio ? bio.status : "unmarked");
                    const classNameStr = getStudentClassName(s);
                    const checkIn = bio?.punch_in ? new Date(bio.punch_in).toLocaleTimeString() : null;
                    const checkOut = bio?.punch_out ? new Date(bio.punch_out).toLocaleTimeString() : null;

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-500 text-xs font-mono">
                          #{s.roll_number || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0">
                              {s.photo_url ? (
                                <img src={s.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                              ) : (
                                <span className="text-xs font-bold text-[#052E2B]">{s.full_name_en?.[0] || "?"}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[13px]">{s.full_name_en}</p>
                              {s.full_name_bn && (
                                <p className="text-[10px] text-gray-400 font-medium">{s.full_name_bn}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 font-medium text-xs max-w-[200px] break-words whitespace-normal">
                          {classNameStr || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          {checkIn ? (
                            <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {checkIn}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {checkOut ? (
                            <span className="text-xs font-mono text-slate-600">{checkOut}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className={`capitalize rounded-lg px-2.5 py-0.5 border text-[10px] font-bold ${
                            status === "present"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : status === "absent"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : status === "late"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : status === "excused"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-slate-50 text-slate-500 border-gray-150"
                          }`}>
                            {status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant={status === "present" ? "premium" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "present" ? "" : "hover:bg-emerald-50 text-emerald-600"}`}
                              onClick={() => saveAttendanceMutation.mutate({ studentId: s.id, status: "present" })}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "destructive" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "absent" ? "" : "hover:bg-red-50 text-red-500"}`}
                              onClick={() => saveAttendanceMutation.mutate({ studentId: s.id, status: "absent" })}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "late" ? "outline" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "late" ? "bg-amber-50 text-amber-700 border-amber-200" : "hover:bg-amber-50 text-amber-600"}`}
                              onClick={() => saveAttendanceMutation.mutate({ studentId: s.id, status: "late" })}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "excused" ? "outline" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "excused" ? "bg-blue-50 text-blue-700 border-blue-200" : "hover:bg-blue-50 text-blue-600"}`}
                              onClick={() => saveAttendanceMutation.mutate({ studentId: s.id, status: "excused" })}
                            >
                              Excused
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredStudents.length > visibleCount && (
            <div className="border-t border-gray-150 p-4 text-center bg-gray-50/30">
              <Button
                variant="outline"
                className="rounded-xl border-[#052E2B] text-[#052E2B] font-bold h-9 px-6 text-xs hover:bg-[#052E2B] hover:text-white transition-all"
                onClick={() => setVisibleCount((prev) => prev + 20)}
              >
                Load More Students (Showing {visibleCount} of {filteredStudents.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
