"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, Clock, Timer, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const API = "/api/attendance/manage";

function apiGet(params) {
  const q = new URLSearchParams(params);
  return fetch(`${API}?${q}`).then((r) => r.json());
}

export default function HRReportsTab({ branchId }) {
  const [filters, setFilters] = useState({
    user_type: "teacher", start_date: "", end_date: "", status: "",
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!branchId || !filters.start_date || !filters.end_date) {
      toast.error("Select date range"); return;
    }
    setLoading(true);
    const r = await apiGet({
      action: "report", branch_id: branchId,
      user_type: filters.user_type, start_date: filters.start_date,
      end_date: filters.end_date, status: filters.status || undefined, limit: 200,
    });
    if (r.ok) setReports(r.data);
    else toast.error(r.message);
    setLoading(false);
  };

  const handleExport = () => {
    if (reports.length === 0) return;
    const a = document.createElement("a");
    a.href = `${API}?action=report&branch_id=${branchId}&user_type=${filters.user_type}&start_date=${filters.start_date}&end_date=${filters.end_date}${filters.status ? `&status=${filters.status}` : ""}&format=csv`;
    a.download = `attendance_${filters.start_date}_${filters.end_date}.csv`;
    a.click();
  };

  const stats = {
    present: reports.filter(r => r.status === "present").length,
    late: reports.filter(r => r.status === "late").length,
    absent: reports.filter(r => r.status === "absent").length,
    half_day: reports.filter(r => r.status === "half_day").length,
    totalLate: reports.reduce((s, r) => s + (r.late_minutes || 0), 0),
    totalOvertime: reports.reduce((s, r) => s + (r.overtime_minutes || 0), 0),
    totalHours: reports.reduce((s, r) => s + (r.working_hours || 0), 0),
  };

  const formatMinutes = (m) => {
    if (!m) return "0m";
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label>Type</Label>
              <Select value={filters.user_type} onValueChange={(v) => setFilters(p => ({ ...p, user_type: v }))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Employee</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={filters.start_date} onChange={(e) => setFilters(p => ({ ...p, start_date: e.target.value }))} className="w-36" />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={filters.end_date} onChange={(e) => setFilters(p => ({ ...p, end_date: e.target.value }))} className="w-36" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters(p => ({ ...p, status: v }))}>
                <SelectTrigger className="w-28"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />} Generate
            </Button>
            {reports.length > 0 && (
              <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-1" /> CSV</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
              <p className="text-xs text-emerald-600 font-medium">Present</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-red-600 font-medium">Absent</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
              <p className="text-xs text-amber-600 font-medium">Late</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.half_day}</p>
              <p className="text-xs text-purple-600 font-medium">Half Day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Analytics */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Late Time</p>
                <p className="text-lg font-bold">{formatMinutes(stats.totalLate)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Timer className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Overtime</p>
                <p className="text-lg font-bold">{formatMinutes(stats.totalOvertime)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Work Hours</p>
                <p className="text-lg font-bold">{stats.totalHours.toFixed(1)}h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      {reports.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{reports.length} record{reports.length !== 1 ? "s" : ""} found</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Late</th>
                  <th className="p-3">Early</th>
                  <th className="p-3">Overtime</th>
                  <th className="p-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{r.attendance_date}</td>
                    <td className="p-3">{r.punch_in ? new Date(r.punch_in).toLocaleTimeString() : "—"}</td>
                    <td className="p-3">{r.punch_out ? new Date(r.punch_out).toLocaleTimeString() : "—"}</td>
                    <td className="p-3">
                      <Badge variant={r.status === "present" ? "default" : r.status === "late" ? "outline" : r.status === "half_day" ? "secondary" : "destructive"}>
                        {r.status === "present" ? "Present" : r.status === "late" ? "Late" : r.status === "half_day" ? "Half Day" : "Absent"}
                      </Badge>
                    </td>
                    <td className="p-3">{r.late_minutes ? `${r.late_minutes}m` : "—"}</td>
                    <td className="p-3">{r.early_leave_minutes ? `${r.early_leave_minutes}m` : "—"}</td>
                    <td className="p-3">{r.overtime_minutes ? `${r.overtime_minutes}m` : "—"}</td>
                    <td className="p-3">{r.working_hours || "—"}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
