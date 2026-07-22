"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const API = "/api/attendance/manage";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  present: "bg-emerald-500 text-white",
  late: "bg-amber-500 text-white",
  absent: "bg-red-500 text-white",
  half_day: "bg-purple-500 text-white",
};

export default function HRAttendanceCalendar({ branchId }) {
  const [userType, setUserType] = useState("teacher");
  const [userId, setUserId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCalendar = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const r = await apiGet({ action: "hr_calendar", user_type: userType, user_id: userId, year, month });
    if (r.ok) setCalendar(r.data);
    else toast.error(r.message);
    setLoading(false);
  }, [userType, userId, year, month]);

  const apiGet = async (params) => {
    const q = new URLSearchParams(params);
    const r = await fetch(`${API}?${q}`);
    return r.json();
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const calendarMap = {};
  calendar.forEach(c => { calendarMap[c.attendance_date] = c; });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const present = calendar.filter(c => c.status === "present").length;
  const late = calendar.filter(c => c.status === "late").length;
  const absent = calendar.filter(c => c.status === "absent").length;
  const totalRecorded = present + late + absent;
  const pct = totalRecorded > 0 ? Math.round((present + late) / totalRecorded * 100) : 0;
  const totalLateMinutes = calendar.reduce((s, c) => s + (c.late_minutes || 0), 0);

  const formatMinutes = (m) => {
    if (!m) return "0m";
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Type</p>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Employee</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">User ID</p>
              <Input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user ID" className="w-36" />
            </div>
            <Button onClick={loadCalendar} disabled={loading || !userId}>
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null} Load Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {userId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{present}</p>
                <p className="text-xs text-emerald-600 font-medium">Present</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{late}</p>
                <p className="text-xs text-amber-600 font-medium">Late</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{absent}</p>
                <p className="text-xs text-red-600 font-medium">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{pct}%</p>
                <p className="text-xs text-muted-foreground font-medium">Attendance Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Late Minutes Badge */}
          {totalLateMinutes > 0 && (
            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="p-3 text-center text-sm">
                Total Late: <strong>{formatMinutes(totalLateMinutes)}</strong> | Total Work: <strong>{calendar.reduce((s, c) => s + (c.working_hours || 0), 0).toFixed(1)}h</strong>
              </CardContent>
            </Card>
          )}

          {/* Calendar Grid */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="font-semibold min-w-[140px] text-center">{new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const record = calendarMap[dateStr];
                  const color = record ? STATUS_COLORS[record.status] : "bg-slate-100 text-slate-400";
                  return (
                    <div key={day} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold ${color}`}>
                      <span>{day}</span>
                      {record && record.working_hours > 0 && (
                        <span className="text-[8px] opacity-80">{record.working_hours}h</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
