"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Monitor, Plus, Trash2, RefreshCw, Wifi, WifiOff, Search, Clock,
  Users, Activity, Loader2, Cable, CheckCircle2, XCircle, Computer, Timer, BarChart3, Calendar
} from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import BridgeManagement from "./BridgeManagement";
import HRDashboardTab from "./HRDashboardTab";
import HRShiftManager from "./HRShiftManager";
import HRReportsTab from "./HRReportsTab";
import HRTimelineView from "./HRTimelineView";
import HRAttendanceCalendar from "./HRAttendanceCalendar";

const API = "/api/attendance/manage";

function apiGet(params) {
  const q = new URLSearchParams(params);
  return fetch(`${API}?${q}`).then((r) => r.json());
}

function apiPost(body) {
  return fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

// Photo loads straight from Cloudinary (already the source of truth for
// student/teacher photos) — no Supabase Storage call, no extra query.
// When there's no photo on file, we show a faceless silhouette wearing a
// topi instead of a broken image or a generic person icon.
function BiometricAvatar({ photoUrl, name, size = 40 }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || "Attendee"}
        loading="lazy"
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center bg-[#0F766E]/10 border border-[#0F766E]/20"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72} aria-hidden="true">
        <path d="M12 15 Q20 5 28 15 L27 17 Q20 11 13 17 Z" fill="#0F766E" opacity="0.55" />
        <circle cx="20" cy="18" r="8" fill="#0F766E" opacity="0.4" />
        <path d="M7 34 Q20 22 33 34 Z" fill="#0F766E" opacity="0.4" />
      </svg>
    </div>
  );
}

// ── Dashboard tab uses HRDashboardTab (premium HR-style) ──

// ── Sub-tab: Devices ──
function DevicesTab({ devices, loading, onRegister, onDelete, canManage, branches: externalBranches }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    device_serial: "",
    device_name: "",
    device_model: "K40",
    branch_id: "",
    ip_address: "",
    port: 4370,
    status: "offline",
    description: "",
  });
  const [branches, setBranches] = useState(externalBranches || []);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (externalBranches && externalBranches.length > 0) {
      setBranches(externalBranches);
      return;
    }
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/attendance/manage?action=branches");
        const d = await res.json();
        if (d.ok) setBranches(d.data);
      } catch {}
    };
    fetchBranches();
  }, [externalBranches]);

  const handleSubmit = async () => {
    if (!form.device_serial || !form.branch_id) {
      toast.error("Serial and branch required");
      return;
    }
    await onRegister(form);
    setShowForm(false);
    setTestResult(null);
    setForm({ device_serial: "", device_name: "", device_model: "K40", branch_id: "", ip_address: "", port: 4370, status: "offline", description: "" });
  };

  const handleTestConnection = async () => {
    if (!form.ip_address) {
      toast.error("IP Address required for connection test");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/attendance/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_device_connection", data: { ip_address: form.ip_address, port: form.port || 4370 } }),
      });
      const d = await res.json();
      if (d.ok) {
        setTestResult(d);
      } else {
        setTestResult({ online: false, message: d.message || "Test failed" });
      }
    } catch {
      setTestResult({ online: false, message: "Connection test failed" });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Registered Devices ({devices.length})</h3>
        {canManage && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Register Device
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Device Serial *</Label>
                <Input
                  value={form.device_serial}
                  onChange={(e) => setForm((p) => ({ ...p, device_serial: e.target.value }))}
                  placeholder="ZKTeco serial number"
                />
              </div>
              <div>
                <Label>Device Name</Label>
                <Input
                  value={form.device_name}
                  onChange={(e) => setForm((p) => ({ ...p, device_name: e.target.value }))}
                  placeholder="e.g. Main Gate K40"
                />
              </div>
              <div>
                <Label>Device Model</Label>
                <Input
                  value={form.device_model}
                  onChange={(e) => setForm((p) => ({ ...p, device_model: e.target.value }))}
                  placeholder="e.g. K40"
                />
              </div>
              <div>
                <Label>Branch *</Label>
                <Select
                  value={String(form.branch_id)}
                  onValueChange={(v) => setForm((p) => ({ ...p, branch_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder={branches.length === 0 ? "No Branch Available" : "Select branch"} /></SelectTrigger>
                  <SelectContent>
                    {branches.length === 0 ? (
                      <SelectItem value="none" disabled>No Branch Available</SelectItem>
                    ) : (
                      branches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name_bn || b.name_en || b.branch_name || `Branch ${b.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>IP Address</Label>
                <Input
                  value={form.ip_address}
                  onChange={(e) => setForm((p) => ({ ...p, ip_address: e.target.value }))}
                  placeholder="Device LAN IP"
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm((p) => ({ ...p, port: Number(e.target.value) }))}
                  placeholder="4370"
                />
                <p className="text-xs text-muted-foreground mt-1">Default: 4370</p>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional device description or location notes"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || !form.ip_address}
              >
                <Cable className="w-4 h-4 mr-1" />
                {testing ? "Testing..." : "Test Connection"}
              </Button>
              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.online ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" /> Offline
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{testResult.message}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setTestResult(null); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} id="save-device-btn">
                Save Device
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {devices.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {d.status === "online" ? (
                  <Wifi className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-medium">
                    {d.device_name}{" "}
                    <span className="text-xs text-muted-foreground">({d.device_serial})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.model} &middot; IP: {d.ip_address || "N/A"} &middot; Port: {d.port || 4370} &middot; Last punch:{" "}
                    {d.last_attendance_at
                      ? new Date(d.last_attendance_at).toLocaleString()
                      : "Never"}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={d.is_active ? "default" : "secondary"}>
                      {d.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant={d.status === "online" ? "default" : "outline"}
                    >
                      {d.status}
                    </Badge>
                  </div>
                  {d.description && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{d.description}</p>
                  )}
                </div>
              </div>
              {canManage && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(d.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {devices.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No devices registered yet.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sub-tab: Mappings ──
function MappingsTab({ mappings, devices, canManage, branchId, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    device_serial: "",
    device_user_id: "",
    user_type: "student",
    user_id: "",
    full_name: "",
  });
  const [unmapped, setUnmapped] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUnmapped = async () => {
    if (!branchId || !form.device_serial) return;
    setLoading(true);
    try {
      const r = await apiGet({
        action: "unmapped_students",
        branch_id: branchId,
        device_serial: form.device_serial,
      });
      if (r.ok) setUnmapped(r.data);
    } catch (err) {
      console.error("Failed to load unmapped students:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.device_serial || !form.device_user_id || !form.user_id) {
      toast.error("Device, User ID, and User are required");
      return;
    }
    const r = await apiPost({
      action: "create_mapping",
      data: {
        ...form,
        user_id: Number(form.user_id),
        branch_id: branchId,
      },
    });
    if (r.ok) {
      toast.success("Mapping created");
      setShowForm(false);
      setForm({ device_serial: "", device_user_id: "", user_type: "student", user_id: "", full_name: "" });
      onRefresh();
    } else {
      toast.error(r.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this mapping?")) return;
    const r = await apiPost({ action: "delete_mapping", data: { id } });
    if (r.ok) { toast.success("Deleted"); onRefresh(); }
    else toast.error(r.message);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Device-User Mappings ({mappings.length})
        </h3>
        {canManage && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Mapping
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Device *</Label>
                <Select
                  value={form.device_serial}
                  onValueChange={(v) => setForm((p) => ({ ...p, device_serial: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter((d) => d.is_active)
                      .map((d) => (
                        <SelectItem key={d.id} value={d.device_serial}>
                          {d.device_name} ({d.device_serial})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Device User ID *</Label>
                <Input
                  value={form.device_user_id}
                  onChange={(e) => setForm((p) => ({ ...p, device_user_id: e.target.value }))}
                  placeholder="ZKTeco user/PIN number"
                />
              </div>
              <div>
                <Label>User Type</Label>
                <Select
                  value={form.user_type}
                  onValueChange={(v) => setForm((p) => ({ ...p, user_type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>User *</Label>
                {form.user_type === "student" ? (
                  <Select
                    value={String(form.user_id)}
                    onValueChange={(v) => {
                      const s = unmapped.find((s) => s.id === Number(v));
                      setForm((p) => ({
                        ...p,
                        user_id: v,
                        full_name: s ? s.full_name_bn || s.full_name_en : "",
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {unmapped.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.full_name_bn || s.full_name_en} ({s.roll_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    value={form.user_id}
                    onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}
                    placeholder="Teacher ID"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadUnmapped} disabled={loading}>
                <Search className="w-4 h-4 mr-1" /> Load Students
              </Button>
              {unmapped.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unmapped.length} unmapped students available
                </span>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                Create Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {mappings.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {m.full_name || `User #${m.user_id}`}
                  <Badge variant="outline" className="ml-2">
                    {m.user_type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Device: {m.device_serial} &middot; PIN: {m.device_user_id}
                  {!m.is_active && (
                    <Badge variant="secondary" className="ml-2">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              {canManage && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {mappings.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No mappings yet. Add a mapping to link a ZKTeco PIN to a system user.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Reports tab uses HRReportsTab (enhanced with overtime/late analytics) ──

// ── Sub-tab: Sync Logs ──
function SyncLogsTab({ devices }) {
  const [selected, setSelected] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async (ds) => {
    if (!ds) return;
    setLoading(true);
    const r = await apiGet({ action: "device_sync_logs", device_serial: ds, limit: 100 });
    if (r.ok) setLogs(r.data);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Device</Label>
        <Select
          value={selected}
          onValueChange={(v) => {
            setSelected(v);
            loadLogs(v);
          }}
        >
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select a device to view logs" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((d) => (
              <SelectItem key={d.id} value={d.device_serial}>
                {d.device_name} ({d.device_serial})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="max-h-96 overflow-y-auto p-0">
          {!selected && (
            <p className="p-4 text-sm text-muted-foreground text-center">
              Select a device to view sync logs.
            </p>
          )}
          {loading && (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          {!loading &&
            logs.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between p-3 border-b last:border-0 text-sm"
              >
                <div>
                  <Badge
                    variant={l.status === "success" ? "default" : "destructive"}
                    className="mb-1"
                  >
                    {l.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {l.event_type} &middot; {l.processed_count || 0} processed
                    {l.failed_count ? `, ${l.failed_count} failed` : ""}
                    {l.message && ` — ${l.message}`}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {new Date(l.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          {!loading && selected && logs.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No sync logs for this device.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ──
export default function AttendanceManager({ currentUser }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [devices, setDevices] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState(null);
  const statsRef = useRef(null);

  const isAdmin = currentUser?.role === "admin";
  const canManage =
    isAdmin ||
    hasPermission(currentUser, "student-attendance", "manage") ||
    hasPermission(currentUser, "teacher-attendance", "manage");
  const canView =
    canManage ||
    hasPermission(currentUser, "student-attendance", "view") ||
    hasPermission(currentUser, "teacher-attendance", "view");

  useEffect(() => {
    if (currentUser) {
      setBranchId(currentUser.branch_id || null);
    }
  }, [currentUser]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [devRes, mapRes, branchRes] = await Promise.all([
        apiGet({ action: "devices" }),
        apiGet({ action: "device_mappings" }),
        apiGet({ action: "branches" }),
      ]);
      if (devRes.ok) setDevices(devRes.data);
      if (mapRes.ok) setMappings(mapRes.data);
      if (branchRes.ok) {
        setBranches(branchRes.data);
        // Auto-select first branch for admin if no branch selected yet
        if (isAdmin && !branchId && branchRes.data?.length > 0) {
          setBranchId(Number(branchRes.data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load attendance data:", err);
    }
    setLoading(false);
  }, [isAdmin, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegister = async (form) => {
    const r = await apiPost({ action: "register_device", data: form });
    if (r.ok) {
      toast.success("Device registered");
      loadData();
    } else {
      toast.error(r.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!confirm("Delete this device and all its mappings?")) return;
    const r = await apiPost({ action: "delete_device", data: { id } });
    if (r.ok) { toast.success("Device deleted"); loadData(); }
    else toast.error(r.message);
  };

  const handleStatsUpdate = useCallback((stats) => {
    statsRef.current = stats;
  }, []);

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          You do not have permission to view attendance.
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TabsList>
          <TabsTrigger value="dashboard">
            <Activity className="w-4 h-4 mr-1" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="shifts">
            <Clock className="w-4 h-4 mr-1" /> Shifts
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-1" /> Reports
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Timer className="w-4 h-4 mr-1" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-1" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Monitor className="w-4 h-4 mr-1" /> Devices
          </TabsTrigger>
          <TabsTrigger value="mappings">
            <Users className="w-4 h-4 mr-1" /> Mappings
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-1" /> Logs
          </TabsTrigger>
          <TabsTrigger value="bridges">
            <Computer className="w-4 h-4 mr-1" /> Bridges
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Branch selector — visible only for super admin */}
          {isAdmin && branches.length > 0 && (
            <Select
              value={branchId ? String(branchId) : ""}
              onValueChange={(v) => setBranchId(Number(v))}
            >
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue placeholder="শাখা নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name_bn || b.name_en || b.branch_name || `Branch ${b.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <TabsContent value="dashboard">
        {activeTab === "dashboard" && (
          <HRDashboardTab branchId={branchId} onStatsUpdate={handleStatsUpdate} />
        )}
      </TabsContent>

      <TabsContent value="devices">
        <DevicesTab
          devices={devices}
          loading={loading}
          onRegister={handleRegister}
          onDelete={handleDeleteDevice}
          canManage={canManage}
          branches={branches}
        />
      </TabsContent>

      <TabsContent value="mappings">
        <MappingsTab
          mappings={mappings}
          devices={devices}
          canManage={canManage}
          branchId={branchId}
          onRefresh={loadData}
        />
      </TabsContent>

      <TabsContent value="reports">
        <HRReportsTab branchId={branchId} />
      </TabsContent>

      <TabsContent value="shifts">
        <HRShiftManager branchId={branchId} />
      </TabsContent>

      <TabsContent value="timeline">
        <HRTimelineView branchId={branchId} />
      </TabsContent>

      <TabsContent value="calendar">
        <HRAttendanceCalendar branchId={branchId} />
      </TabsContent>

      <TabsContent value="logs">
        <SyncLogsTab devices={devices} />
      </TabsContent>
      <TabsContent value="bridges">
        <BridgeManagement />
      </TabsContent>
    </Tabs>
  );
}
