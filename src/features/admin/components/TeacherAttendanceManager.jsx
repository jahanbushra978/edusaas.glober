import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { fetchTeacherAttendanceByDateRange } from "@/api/services/attendanceService";
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

export default function TeacherAttendanceManager({ teachers, branches, currentUser }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : ""
  );
  const [classFilter, setClassFilter] = useState("");
  const { search, setSearch, query } = useSearch({ data: [], debounceMs: 300 });
  const [reportMode, setReportMode] = useState("daily");
  const queryClient = useQueryClient();

  const selectedBranch = React.useMemo(
    () => branches.find(b => String(b.id) === String(selectedBranchId)),
    [branches, selectedBranchId]
  );

  const classOptions = React.useMemo(() => {
    if (!selectedBranch?.academic_structure) return [];
    const list = [];
    selectedBranch.academic_structure.forEach(c => {
      const name = c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";
      if (c.sections && c.sections.length > 0) {
        c.sections.forEach(sec => {
          const secName = sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || "";
          if (sec.id) {
            list.push({
              value: String(sec.id),
              label: `${name}${secName ? ` (${secName})` : ""}`.trim()
            });
          }
        });
      } else {
        const secName = c.section?.en || c.section?.bn || "";
        if (c.id) {
          list.push({
            value: String(c.id),
            label: `${name}${secName ? ` (${secName})` : ""}`.trim()
          });
        }
      }
    });
    return list;
  }, [selectedBranch]);

  // Filter teachers by branch, class, and search
  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) => {
      if (selectedBranchId) {
        if (String(t.branch_id) !== String(selectedBranchId)) return false;
      }
      if (classFilter && classFilter !== "all") {
        if (!t.assigned_batches) return false;
        const option = classOptions.find(opt => opt.value === classFilter);
        if (!option) return false;
        const cleanClassFilter = option.label.replace(/\s+/g, ' ').trim().toLowerCase();
        const batches = t.assigned_batches
          .split(",")
          .map(b => b.replace(/\s+/g, ' ').trim().toLowerCase());
        if (!batches.includes("all classes") && !batches.includes(cleanClassFilter)) return false;
      }
      if (query) {
        const matchesSearch =
          t.full_name_en?.toLowerCase().includes(query) ||
          t.teacher_id?.toLowerCase().includes(query) ||
          (t.full_name_bn && t.full_name_bn.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      return t.is_active !== false;
    });
  }, [teachers, selectedBranchId, classFilter, query]);

  const allowedTeacherIds = React.useMemo(
    () => new Set(filteredTeachers.map((t) => String(t.id))),
    [filteredTeachers]
  );

  const { data: rawAttendanceList = [], isLoading } = useQuery({
    queryKey: ["admin-teacher-attendance", selectedDate, selectedBranchId],
    queryFn: () => appClient.entities.TeacherAttendance.filter({ date: selectedDate }, "-created_date", 500),
    enabled: !!selectedBranchId && !!selectedDate,
  });

  // Biometric attendance records for the selected date
  const { data: biometricRecords = [] } = useQuery({
    queryKey: ["admin-biometric-teacher", selectedDate, selectedBranchId],
    queryFn: async () => {
      const r = await fetch(`/api/attendance/manage?action=report&user_type=teacher&start_date=${selectedDate}&end_date=${selectedDate}&limit=500`);
      const d = await r.json();
      return d.ok ? d.data : [];
    },
    enabled: !!selectedBranchId && !!selectedDate,
  });

  const biometricMap = React.useMemo(() => {
    const map = {};
    biometricRecords.forEach((rec) => {
      if (rec.user_type === "teacher") {
        map[String(rec.user_id)] = rec;
      }
    });
    return map;
  }, [biometricRecords]);

  const attendanceList = React.useMemo(
    () => rawAttendanceList.filter((att) => att.teacher_id && allowedTeacherIds.has(String(att.teacher_id))),
    [rawAttendanceList, allowedTeacherIds]
  );

  const attendanceMap = React.useMemo(() => {
    const map = {};
    attendanceList.forEach((att) => {
      if (att.teacher_id) {
        map[String(att.teacher_id)] = att;
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

    filteredTeachers.forEach((t) => {
      const record = attendanceMap[String(t.id)];
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

    return { present, absent, late, excused, unmarked, total: filteredTeachers.length };
  }, [filteredTeachers, attendanceMap]);

  const saveAttendanceMutation = useMutation({
    mutationFn: async ({ teacherId, status }) => {
      const existing = attendanceMap[String(teacherId)];
      if (existing) {
        return appClient.entities.TeacherAttendance.update(existing.id, {
          status,
        });
      } else {
        return appClient.entities.TeacherAttendance.create({
          teacher_id: teacherId,
          date: selectedDate,
          status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teacher-attendance", selectedDate, selectedBranchId] });
      toast.success("Teacher attendance updated.");
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

  const getTeacherClassName = (t) => {
    return t.class_name || "";
  };

  const downloadCSV = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedDate, reportMode);

      if (reportMode === "daily") {
        const headers = ["Teacher ID", "Custom ID", "Name", "Designation", "Branch", "Class", "Date", "Status", "Marked By"];
        const rows = filteredTeachers.map((t) => {
          const record = attendanceMap[String(t.id)];
          const status = record ? record.status : "unmarked";
          const markedBy = record ? (record.marked_by || "System") : "";
          const className = getTeacherClassName(t);
          return [
            t.id,
            t.teacher_id || "",
            `"${t.full_name_en || ""}"`,
            `"${t.designation || ""}"`,
            `"${selectedBranch?.name_en || selectedBranch?.branch_name || ""}"`,
            `"${className}"`,
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
        link.setAttribute("download", `Teacher_Attendance_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const rangeLimits = { weekly: 2000, monthly: 5000, yearly: 6000 };
        const rangeAttendance = await fetchTeacherAttendanceByDateRange(startDate, endDate, rangeLimits[reportMode] || 2000);

        const rangeAttendanceByTeacher = {};
        rangeAttendance.forEach(a => {
          if (!a.teacher_id) return;
          const tid = String(a.teacher_id);
          if (!rangeAttendanceByTeacher[tid]) rangeAttendanceByTeacher[tid] = [];
          rangeAttendanceByTeacher[tid].push(a);
        });

        const totalDays = Math.ceil(
          (new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / (1000 * 60 * 60 * 24)
        ) + 1;

        const headers = ["Teacher ID", "Custom ID", "Name", "Designation", "Branch", "Class", "Total Days", "Present", "Absent", "Late", "Excused", "Unmarked", "Attendance %"];
        const rows = filteredTeachers.map((t) => {
          const tid = String(t.id);
          const records = rangeAttendanceByTeacher[tid] || [];
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
          const className = getTeacherClassName(t);
          return [
            t.id,
            t.teacher_id || "",
            `"${t.full_name_en || ""}"`,
            `"${t.designation || ""}"`,
            `"${selectedBranch?.name_en || selectedBranch?.branch_name || ""}"`,
            `"${className}"`,
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
        link.setAttribute("download", `Teacher_Attendance_${modeLabel}_${startDate}_to_${endDate}.csv`);
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
            Teacher Attendance Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, mark, and export daily teacher attendance reports.
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

      {/* Filters Row: Branch + Class */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Branch</label>
          <Select
            value={selectedBranchId}
            onValueChange={(v) => { setSelectedBranchId(v); setClassFilter("all"); }}
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
            onValueChange={setClassFilter}
            disabled={!selectedBranchId}
          >
            <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classOptions.map((opt, i) => (
                <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search teachers..."
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
            <CardTitle className="text-sm font-bold text-[#052E2B]">Teachers Listing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedBranchId ? (
            <div className="text-center py-12 text-muted-foreground">Please select a Branch to load attendance.</div>
          ) : isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No teachers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Teacher ID</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-end py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeachers.map((t) => {
                    const record = attendanceMap[String(t.id)];
                    const bio = biometricMap[String(t.id)];
                    const status = record ? record.status : (bio ? bio.status : "unmarked");
                    const checkIn = bio?.punch_in ? new Date(bio.punch_in).toLocaleTimeString() : null;
                    const checkOut = bio?.punch_out ? new Date(bio.punch_out).toLocaleTimeString() : null;

                    return (
                      <tr key={t.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-500 text-xs font-mono">
                          #{t.teacher_id || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0">
                              {t.photo_url ? (
                                <img src={t.photo_url} loading="lazy" className="h-full w-full object-cover" alt="" />
                              ) : (
                                <span className="text-xs font-bold text-[#052E2B]">{t.full_name_en?.[0] || "?"}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[13px]">{t.full_name_en}</p>
                              {t.full_name_bn && (
                                <p className="text-[10px] text-gray-400 font-medium">{t.full_name_bn}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 font-medium text-xs">{t.designation || "N/A"}</td>
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
                              onClick={() => saveAttendanceMutation.mutate({ teacherId: t.id, status: "present" })}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "destructive" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "absent" ? "" : "hover:bg-red-50 text-red-500"}`}
                              onClick={() => saveAttendanceMutation.mutate({ teacherId: t.id, status: "absent" })}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "late" ? "outline" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "late" ? "bg-amber-50 text-amber-700 border-amber-200" : "hover:bg-amber-50 text-amber-600"}`}
                              onClick={() => saveAttendanceMutation.mutate({ teacherId: t.id, status: "late" })}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "excused" ? "outline" : "ghost"}
                              className={`h-7 px-3 text-[10px] font-bold rounded-lg ${status === "excused" ? "bg-blue-50 text-blue-700 border-blue-200" : "hover:bg-blue-50 text-blue-600"}`}
                              onClick={() => saveAttendanceMutation.mutate({ teacherId: t.id, status: "excused" })}
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
        </CardContent>
      </Card>
    </div>
  );
}
