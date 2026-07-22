"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Users, DoorOpen, Loader2 } from "lucide-react";

const API = "/api/attendance/manage";

function apiGet(params) {
  const q = new URLSearchParams(params);
  return fetch(`${API}?${q}`).then((r) => r.json());
}

function BiometricAvatar({ photoUrl, name, size = 40 }) {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name || "Attendee"} loading="lazy"
        width={size} height={size}
        className="rounded-full object-cover flex-shrink-0 border-2 border-slate-200 dark:border-slate-700"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20"
      style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72} aria-hidden="true">
        <path d="M12 15 Q20 5 28 15 L27 17 Q20 11 13 17 Z" fill="#0F766E" opacity="0.55" />
        <circle cx="20" cy="18" r="8" fill="#0F766E" opacity="0.4" />
        <path d="M7 34 Q20 22 33 34 Z" fill="#0F766E" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function HRDashboardTab({ branchId, onStatsUpdate }) {
  const [hrStats, setHrStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!branchId) { setLoading(false); return; }
    const [statsRes, feedRes, hrRes] = await Promise.all([
      apiGet({ action: "stats", branch_id: branchId }),
      apiGet({ action: "live", branch_id: branchId, limit: 50 }),
      apiGet({ action: "hr_today_stats", branch_id: branchId }),
    ]);
    if (statsRes.ok && onStatsUpdate) onStatsUpdate(statsRes.data);
    if (hrRes.ok) setHrStats(hrRes.data);
    if (feedRes.ok) setFeed(feedRes.data);
  }, [branchId, onStatsUpdate]);

  useEffect(() => {
    if (!branchId) { setLoading(false); return; }
    let mounted = true;
    fetchData().then(() => { if (mounted) setLoading(false); });

    if (supabase) {
      const channel = supabase
        .channel("hr-attendance-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance_logs" }, async () => {
          if (!mounted) return;
          const [feedRes, hrRes] = await Promise.all([
            apiGet({ action: "live", branch_id: branchId, limit: 50 }),
            apiGet({ action: "hr_today_stats", branch_id: branchId }),
          ]);
          if (!mounted) return;
          if (feedRes.ok) setFeed(feedRes.data);
          if (hrRes.ok) setHrStats(hrRes.data);
        })
        .subscribe();
      channelRef.current = channel;
    }

    return () => {
      mounted = false;
      if (channelRef.current) { supabase?.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, [branchId, fetchData]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!branchId) {
    return <Card><CardContent className="p-6 text-center text-muted-foreground">Select a branch to view dashboard.</CardContent></Card>;
  }

  const s = hrStats || {};

  return (
    <div className="space-y-6">
      {/* Corporate HR-Style Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Teachers</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{s.total_teachers || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Present {s.teacher_present || 0}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent {s.teacher_absent || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Students</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{s.total_students || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Present {s.student_present || 0}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent {s.student_absent || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Late Today</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{(s.teacher_late || 0) + (s.student_late || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-2">
              <span>Teachers: {s.teacher_late || 0}</span>
              <span>Students: {s.student_late || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currently Inside</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{s.teacher_inside || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <DoorOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 border-t pt-2">Teachers currently in the institute</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Real-Time Attendance Feed
            <Badge variant="outline" className="text-[10px] ml-auto">{feed.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto space-y-1">
          {feed.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
          )}
          {feed.map((e, i) => {
            const info = e.user_info || {};
            const isIn = e.punch_type === "in";
            const subline = [info.identifier ? `#${info.identifier}` : null, info.group_label || null].filter(Boolean).join(" · ");
            return (
              <div key={e.id || i} className="flex items-center gap-3 text-sm py-2.5 border-b last:border-0 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
                <BiometricAvatar photoUrl={info.photo_url} name={info.full_name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{info.full_name || `User #${e.device_user_id}`}</span>
                    <Badge variant={isIn ? "default" : "secondary"} className={`text-[10px] shrink-0 ${isIn ? "bg-emerald-600" : ""}`}>
                      {isIn ? "Check In" : "Check Out"}
                    </Badge>
                  </div>
                  {subline && <div className="text-xs text-muted-foreground truncate">{subline}</div>}
                </div>
                <span className="text-muted-foreground text-xs shrink-0">
                  {new Date(e.punch_time || e.received_at).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
