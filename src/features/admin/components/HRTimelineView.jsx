"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Clock, Sunrise, LogIn, LogOut } from "lucide-react";

const API = "/api/attendance/manage";

function apiGet(params) {
  const q = new URLSearchParams(params);
  return fetch(`${API}?${q}`).then((r) => r.json());
}

function TimelineStep({ icon: Icon, time, label, sublabel, color }) {
  return (
    <div className="flex items-start gap-3 relative pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="w-0.5 h-full bg-slate-200 absolute top-10 left-5 last:hidden" />
      </div>
      <div className="flex-1 pt-1.5">
        <p className="font-semibold text-sm text-slate-800">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
        {time && <p className="text-xs font-mono text-slate-500 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}

export default function HRTimelineView({ branchId }) {
  const [userType, setUserType] = useState("teacher");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!userId || !date) return;
    setLoading(true);
    const r = await apiGet({ action: "hr_timeline", user_type: userType, user_id: userId, date });
    if (r.ok) setData(r.data);
    else setData(null);
    setLoading(false);
  };

  const formatMinutes = (m) => {
    if (!m) return "—";
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
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Date</p>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-36" />
            </div>
            <Button onClick={handleSearch} disabled={loading || !userId}>
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Clock className="w-4 h-4 mr-1" />} View Timeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" /> Daily Timeline — {date}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pl-4">
                <div className="relative">
                  {!data.punch_in && !data.punch_out ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No attendance record for this date.</p>
                  ) : (
                    <>
                      {data.punch_in && (
                        <TimelineStep icon={LogIn} time={new Date(data.punch_in).toLocaleTimeString()} label="Check In" sublabel={data.status === "late" ? "Late arrival" : "On time"} color={data.status === "late" ? "bg-amber-500" : "bg-emerald-500"} />
                      )}
                      <TimelineStep icon={Sunrise} label="Working Hours" sublabel={`Total: ${data.working_hours || 0}h`} color="bg-blue-500" />
                      {data.punch_out && (
                        <TimelineStep icon={LogOut} time={new Date(data.punch_out).toLocaleTimeString()} label="Check Out" sublabel={data.overtime_minutes > 0 ? "Overtime worked" : "On schedule"} color={data.overtime_minutes > 0 ? "bg-purple-500" : "bg-slate-500"} />
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Summary */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Time Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={data.status === "present" ? "default" : data.status === "late" ? "outline" : "destructive"}>
                    {data.status}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Late</span>
                  <span className="font-semibold text-amber-600">{formatMinutes(data.late_minutes)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Early Leave</span>
                  <span className="font-semibold text-orange-600">{formatMinutes(data.early_leave_minutes)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Overtime</span>
                  <span className="font-semibold text-blue-600">{formatMinutes(data.overtime_minutes)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-muted-foreground">Total Work</span>
                  <span className="font-semibold text-emerald-600">{data.working_hours || 0}h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
