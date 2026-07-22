import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ShieldAlert, Monitor, Activity, Lock, Unlock, Server, Loader2, Save, Download, Search, RefreshCw, ChevronLeft, ChevronRight, Ban, Zap, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SecurityManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Advanced Polling & Refresh Interval (Default 60s)
  const [pollingInterval, setPollingInterval] = useState(60000); 

  // Settings State
  const [localSettings, setLocalSettings] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [loginPage, setLoginPage] = useState(1);
  const [blockPage, setBlockPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const PAGE_SIZE = 20;

  // SOC Authentication State
  const [socVerified, setSocVerified] = useState(false);
  const [socPassword, setSocPassword] = useState("");
  const [isVerifyingSoc, setIsVerifyingSoc] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setLoginPage(1); setBlockPage(1); setSessionPage(1); setEventsPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Data Fetching: Security SOC Analytics (Custom API, updates every 5 mins or on manual refresh)
  const { data: analyticsData, isLoading: loadingAnalytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["soc-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/security/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  // Helper to fetch from SOC Data API
  const fetchSocData = async (type, page, query) => {
    const res = await fetch(`/api/admin/security/data?type=${type}&page=${page}&pageSize=${PAGE_SIZE}&query=${encodeURIComponent(query)}`);
    if (res.status === 403 || res.status === 401) {
      setSocVerified(false);
      throw new Error("SOC_UNAUTHORIZED");
    }
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  };

  const { data: loginsRes, isLoading: loadingLogins, isFetching: fetchingLogins } = useQuery({
    queryKey: ["security-logins", loginPage, debouncedSearch, socVerified],
    queryFn: () => fetchSocData('logins', loginPage, debouncedSearch),
    refetchInterval: socVerified ? (pollingInterval || false) : false,
    enabled: socVerified,
  });

  const { data: blocksRes, isLoading: loadingBlocks } = useQuery({
    queryKey: ["security-blocks", blockPage, debouncedSearch, socVerified],
    queryFn: () => fetchSocData('blocks', blockPage, debouncedSearch),
    refetchInterval: socVerified ? (pollingInterval || false) : false,
    enabled: socVerified,
  });

  const { data: sessionsRes, isLoading: loadingSessions } = useQuery({
    queryKey: ["security-sessions", sessionPage, debouncedSearch, socVerified],
    queryFn: () => fetchSocData('sessions', sessionPage, debouncedSearch),
    refetchInterval: socVerified ? (pollingInterval || false) : false,
    enabled: socVerified,
  });

  const { data: eventsRes, isLoading: loadingEvents } = useQuery({
    queryKey: ["security-events", eventsPage, debouncedSearch, socVerified],
    queryFn: () => fetchSocData('events', eventsPage, debouncedSearch),
    refetchInterval: socVerified ? (pollingInterval || false) : false,
    enabled: socVerified,
  });

  // Settings
  const { data: rawSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["security-settings", socVerified],
    queryFn: () => appClient.entities.SecuritySetting.list("id", 50),
    enabled: socVerified,
  });

  useEffect(() => {
    const defaults = {
      lockout_thresholds: { level_1_attempts: 5, level_1_lock_minutes: 5, level_2_lock_minutes: 15, level_3_lock_minutes: 60 },
      session: { max_concurrent_sessions: 3, idle_timeout_minutes: 30 },
      api_limits: { global_rate_limit: 100, burst_limit: 150 }
    };
    if (rawSettings && rawSettings.length > 0) {
      const parsed = { ...defaults };
      rawSettings.forEach(s => { parsed[s.key] = s.value; });
      setLocalSettings(parsed);
    } else {
      setLocalSettings(defaults);
    }
  }, [rawSettings]);

  const handleSocAction = async (action, payload) => {
    const res = await fetch("/api/admin/security/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });
    if (res.status === 403 || res.status === 401) {
      setSocVerified(false);
      throw new Error("SOC session expired");
    }
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  };

  const unblockMut = useMutation({
    mutationFn: (device_id) => handleSocAction('unban_device', { device_id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["security-blocks"] }); refetchAnalytics(); toast.success("Device unblocked successfully."); },
    onError: (err) => toast.error(err.message || "Failed to unblock device.")
  });

  const forceLogoutMut = useMutation({
    mutationFn: (session_id) => handleSocAction('revoke_session', { session_id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["security-sessions"] }); refetchAnalytics(); toast.success("Session revoked successfully."); },
    onError: (err) => toast.error(err.message || "Failed to revoke session.")
  });

  const banMut = useMutation({
    mutationFn: (device_id) => handleSocAction('ban_device', { device_id, reason: "Manually banned by Admin", is_permanent: true }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["security-blocks"] }); refetchAnalytics(); toast.success("Device permanently banned."); },
    onError: (err) => toast.error(err.message || "Failed to ban device.")
  });

  const deleteEventMut = useMutation({
    mutationFn: (event_id) => handleSocAction('delete_event', { event_id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["security-events"] }); toast.success("Event deleted."); },
    onError: (err) => toast.error(err.message || "Failed to delete event.")
  });

  const clearEventsMut = useMutation({
    mutationFn: () => handleSocAction('clear_events', {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["security-events"] }); toast.success("All events cleared."); },
    onError: (err) => toast.error(err.message || "Failed to clear events.")
  });

  // Handlers
  const handleUnblock = (id) => { if (confirm("Are you sure you want to unblock this device?")) unblockMut.mutate(id); };
  const handleBan = (id) => { if (confirm("Permanently ban this device? It will never be able to access the system again.")) banMut.mutate(id); };
  const handleForceLogout = (id) => { if (confirm("Force logout this session? The user will be disconnected immediately.")) forceLogoutMut.mutate(id); };
  const handleDeleteEvent = (id) => { if (confirm("Delete this security event?")) deleteEventMut.mutate(id); };
  const handleClearEvents = () => { if (confirm("Are you sure you want to clear all security events? This cannot be undone.")) clearEventsMut.mutate(); };


  const handleSettingChange = (group, key, value, type = "number") => {
    setLocalSettings(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: type === "number" ? Number(value) : value }
    }));
  };

  const executeSaveSettings = async () => {
    if (!masterPassword) return toast.error("Please enter your Master Password.");
    setIsSaving(true);
    try {
      const payload = {
        password: masterPassword,
        settings: Object.keys(localSettings).map(k => ({ key: k, value: localSettings[k] }))
      };
      const res = await fetch("/api/admin/security/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("Security settings successfully updated!");
      setShowPasswordModal(false);
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
    } catch (err) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = (dataList, filename) => {
    if (!dataList || dataList.length === 0) return toast.error("No data to export");
    const header = Object.keys(dataList[0]).join(",");
    const rows = dataList.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const renderPagination = (page, totalPages, setPageFn) => (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
      <div className="text-sm text-slate-500">Page {page} of {totalPages || 1}</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPageFn(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => setPageFn(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );

  const THREAT_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  const verifySocAccess = async (e) => {
    e.preventDefault();
    if (!socPassword) return toast.error("Password required");
    setIsVerifyingSoc(true);
    try {
      const res = await fetch("/api/admin/security/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: socPassword })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setSocVerified(true);
      toast.success("Security Center Unlocked (10 min session)");
    } catch (err) {
      toast.error(err.message || "Verification failed");
    } finally {
      setIsVerifyingSoc(false);
    }
  };

  if (!socVerified) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg border-red-100">
          <CardHeader className="text-center space-y-2 border-b border-slate-100 pb-6">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-slate-900">Security Center Authentication</CardTitle>
            <CardDescription>Enter your Admin password to access the SOC. Session lasts for 10 minutes.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={verifySocAccess} className="space-y-4">
              <div>
                <Input type="password" placeholder="Master Admin Password" value={socPassword} onChange={(e) => setSocPassword(e.target.value)} className="h-12" required />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white" disabled={isVerifyingSoc}>
                {isVerifyingSoc ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isVerifyingSoc ? "Verifying..." : "Unlock SOC"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-600" />
            Security Operations Center (SOC)
          </h2>
          <p className="text-gray-500 text-sm">Enterprise Data Protection & Threat Intelligence</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search IP, User, Device..." 
              className="pl-9 h-9 text-sm rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={pollingInterval.toString()} onValueChange={(v) => setPollingInterval(Number(v))}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <RefreshCw className={`h-3 w-3 mr-2 ${fetchingLogins ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15000">15s (Aggressive)</SelectItem>
              <SelectItem value="30000">30s (Fast)</SelectItem>
              <SelectItem value="60000">60s (Default)</SelectItem>
              <SelectItem value="120000">120s (Slow)</SelectItem>
              <SelectItem value="0">Manual (Paused)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max bg-slate-100/50 p-1">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Activity className="w-4 h-4 mr-2"/>Dashboard</TabsTrigger>
            <TabsTrigger value="logins" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Unlock className="w-4 h-4 mr-2"/>Logins</TabsTrigger>
            <TabsTrigger value="blocks" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Ban className="w-4 h-4 mr-2 text-red-500"/>Blocked</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Monitor className="w-4 h-4 mr-2"/>Sessions</TabsTrigger>
            <TabsTrigger value="events" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Zap className="w-4 h-4 mr-2 text-amber-500"/>Events</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"><Server className="w-4 h-4 mr-2"/>Policies</TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm"><CardContent className="p-4 text-center">
              <p className="text-xs text-emerald-600 font-medium">Logins Today</p>
              <h3 className="text-2xl font-bold text-emerald-700">{analyticsData?.today_success || 0}</h3>
            </CardContent></Card>
            <Card className="bg-amber-50/50 border-amber-100 shadow-sm"><CardContent className="p-4 text-center">
              <p className="text-xs text-amber-600 font-medium">Failed Attempts</p>
              <h3 className="text-2xl font-bold text-amber-700">{analyticsData?.today_failed || 0}</h3>
            </CardContent></Card>
            <Card className="bg-red-50/50 border-red-100 shadow-sm"><CardContent className="p-4 text-center">
              <p className="text-xs text-red-600 font-medium">Active Blocks</p>
              <h3 className="text-2xl font-bold text-red-700">{analyticsData?.active_blocks || 0}</h3>
            </CardContent></Card>
            <Card className="bg-slate-50/50 border-slate-200 shadow-sm"><CardContent className="p-4 text-center">
              <p className="text-xs text-slate-600 font-medium">Perm Bans</p>
              <h3 className="text-2xl font-bold text-slate-700">{analyticsData?.permanent_bans || 0}</h3>
            </CardContent></Card>
            <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm"><CardContent className="p-4 text-center">
              <p className="text-xs text-indigo-600 font-medium">Live Sessions</p>
              <h3 className="text-2xl font-bold text-indigo-700">{analyticsData?.active_sessions || 0}</h3>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Threat Intel Card */}
            <Card className="lg:col-span-1 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${analyticsData?.threat_level === 'CRITICAL' ? 'bg-red-600' : analyticsData?.threat_level === 'HIGH' ? 'bg-orange-500' : analyticsData?.threat_level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Threat Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-sm" style={{ borderColor: analyticsData?.threat_level === 'CRITICAL' ? '#dc2626' : analyticsData?.threat_level === 'HIGH' ? '#f97316' : analyticsData?.threat_level === 'MEDIUM' ? '#fbbf24' : '#10b981' }}>
                    <div>
                      <span className="text-3xl font-black text-slate-800">{analyticsData?.risk_score || 0}</span>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Risk Score</span>
                    </div>
                  </div>
                  <h4 className={`mt-3 text-sm font-bold uppercase tracking-widest ${analyticsData?.threat_level === 'CRITICAL' ? 'text-red-600' : analyticsData?.threat_level === 'HIGH' ? 'text-orange-500' : analyticsData?.threat_level === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {analyticsData?.threat_level || 'LOW'} THREAT
                  </h4>
                </div>
                
                {analyticsData?.threat_breakdown && analyticsData.threat_breakdown.length > 0 && (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyticsData.threat_breakdown} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                          {analyticsData.threat_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={THREAT_COLORS[index % THREAT_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Trend Chart */}
            <Card className="lg:col-span-2 border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> 7-Day Login Analytics</span>
                  <span className="text-xs font-normal text-slate-400">Updates every 5m</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                {analyticsData?.daily_trend && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="success" name="Successful" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" />
                      <Area type="monotone" dataKey="failed" name="Failed" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Logins Tab */}
        <TabsContent value="logins" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Login Activity Log</CardTitle>
                <CardDescription>Live feed of authentication attempts.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportCSV(loginsRes?.rows, 'login-activity')}><Download className="w-4 h-4 mr-2"/> Export</Button>
            </CardHeader>
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b">Time</th>
                    <th className="px-4 py-3 border-b">Identifier</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Network</th>
                    <th className="px-4 py-3 border-b">Environment</th>
                    <th className="px-4 py-3 border-b">Reason</th>
                    <th className="px-4 py-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingLogins ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300"/></td></tr> : null}
                  {!loadingLogins && loginsRes?.rows?.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{format(new Date(a.created_at), "MMM d, HH:mm:ss")}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{a.login_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          a.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                          a.status === 'FAILED' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{a.ip_address}</div>
                        <div className="text-[10px] text-slate-400">{a.country}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 text-xs truncate max-w-[150px]">{a.os} • {a.browser}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]" title={a.device_id}>{a.device_id}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.failure_reason || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {a.device_id && (
                           <Button variant="ghost" size="sm" onClick={() => handleBan(a.device_id)} className="h-7 px-2 text-slate-800 hover:bg-slate-200">
                             <Ban className="h-3 w-3 mr-1" /> Ban
                           </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loadingLogins && loginsRes?.rows?.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No login attempts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(loginPage, loginsRes?.totalPages, setLoginPage)}
          </Card>
        </TabsContent>

        {/* Blocked Devices Tab */}
        <TabsContent value="blocks" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-red-600">Blocked Devices</CardTitle>
                <CardDescription>Devices blocked by Progressive Lockout or Admin Ban.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportCSV(blocksRes?.rows, 'blocked-devices')}><Download className="w-4 h-4 mr-2"/> Export</Button>
            </CardHeader>
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b">Device Fingerprint</th>
                    <th className="px-4 py-3 border-b">Last IP</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Reason</th>
                    <th className="px-4 py-3 border-b">Locked Until</th>
                    <th className="px-4 py-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingBlocks ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300"/></td></tr> : null}
                  {!loadingBlocks && blocksRes?.rows?.map(d => {
                    const isExpired = !d.is_permanent && new Date(d.blocked_until) < new Date();
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs">{d.device_id}</td>
                        <td className="px-4 py-3 font-mono text-xs">{d.ip_address}</td>
                        <td className="px-4 py-3">
                          {d.is_permanent ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-white uppercase">Perma-Ban</span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">Expired</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase">Lvl {d.lock_level} Lock</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{d.reason}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap">
                          {d.is_permanent ? 'Forever' : format(new Date(d.blocked_until), "MMM d, HH:mm:ss")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => handleUnblock(d.device_id)} className="h-7 px-2 text-emerald-600 hover:bg-emerald-50 mr-2"><Unlock className="h-3 w-3 mr-1" /> Unblock</Button>
                          {!d.is_permanent && <Button variant="ghost" size="sm" onClick={() => handleBan(d.device_id)} className="h-7 px-2 text-slate-800 hover:bg-slate-200"><Ban className="h-3 w-3 mr-1" /> Ban</Button>}
                        </td>
                      </tr>
                    );
                  })}
                  {!loadingBlocks && blocksRes?.rows?.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No blocked devices found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(blockPage, blocksRes?.totalPages, setBlockPage)}
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-indigo-600">Active Sessions</CardTitle>
                <CardDescription>Currently logged in users and tokens.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportCSV(sessionsRes?.rows, 'active-sessions')}><Download className="w-4 h-4 mr-2"/> Export</Button>
            </CardHeader>
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b">User ID</th>
                    <th className="px-4 py-3 border-b">IP Address</th>
                    <th className="px-4 py-3 border-b">Environment</th>
                    <th className="px-4 py-3 border-b">Login Time</th>
                    <th className="px-4 py-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingSessions ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300"/></td></tr> : null}
                  {!loadingSessions && sessionsRes?.rows?.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">{s.login_id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.ip_address} <span className="text-slate-400">({s.country})</span></td>
                      <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[200px]" title={s.user_agent}>{s.user_agent}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{format(new Date(s.login_time), "MMM d, HH:mm")}</td>
                      <td className="px-4 py-3 text-right">
                        {s.is_revoked ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">Revoked</span>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleForceLogout(s.id)} className="h-7 px-2 text-red-600 hover:bg-red-50">Force Logout</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loadingSessions && sessionsRes?.rows?.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No active sessions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(sessionPage, sessionsRes?.totalPages, setSessionPage)}
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Security Events Log</CardTitle>
                <CardDescription>Immutable audit trail of security-related actions.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearEvents} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Clear All</Button>
                <Button variant="outline" size="sm" onClick={() => exportCSV(eventsRes?.rows, 'security-events')}><Download className="w-4 h-4 mr-2"/> Export</Button>
              </div>
            </CardHeader>
            <div className="p-0 min-h-[400px]">
              {loadingEvents ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300"/></div> : null}
              {!loadingEvents && (
                <div className="divide-y divide-slate-100">
                  {eventsRes?.rows?.map(ev => (
                    <div key={ev.id} className="p-4 hover:bg-slate-50/50 flex gap-4 items-start group">
                      <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${ev.severity === 'CRITICAL' ? 'bg-red-600' : ev.severity === 'HIGH' ? 'bg-orange-500' : ev.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">{ev.event_type}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400 font-mono">{format(new Date(ev.created_at), "MMM d, HH:mm:ss")}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(ev.id)} className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{ev.description}</p>
                        <div className="mt-2 flex gap-3 text-xs text-slate-400 font-mono">
                          {ev.user_id && <span>User: {ev.user_id}</span>}
                          {ev.ip_address && <span>IP: {ev.ip_address}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loadingEvents && eventsRes?.rows?.length === 0 && <div className="p-8 text-center text-slate-500">No events found.</div>}
                </div>
              )}
            </div>
            {renderPagination(eventsPage, eventsRes?.totalPages, setEventsPage)}
          </Card>
        </TabsContent>

        {/* Policies Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="text-base text-slate-800">Security Policies & Thresholds</CardTitle>
                <CardDescription>Configure global parameters for risk analysis, lockouts, and API protection.</CardDescription>
              </div>
              <Button onClick={() => { setShowPasswordModal(true); setMasterPassword(""); }} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                <Save className="h-4 w-4" /> Apply Policies
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingSettings ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Anti-Brute Force Policies */}
                  {localSettings.lockout_thresholds && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-red-500"/> Anti-Brute Force (Progressive Lock)</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Max Attempts (Before Lock)</label>
                          <Input type="number" className="mt-1 h-10 border-slate-200 bg-slate-50" min="1" value={localSettings.lockout_thresholds.level_1_attempts} onChange={(e) => handleSettingChange('lockout_thresholds', 'level_1_attempts', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Level 1 (Mins)</label>
                            <Input type="number" className="mt-1 h-10 border-slate-200" min="1" value={localSettings.lockout_thresholds.level_1_lock_minutes} onChange={(e) => handleSettingChange('lockout_thresholds', 'level_1_lock_minutes', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Level 2 (Mins)</label>
                            <Input type="number" className="mt-1 h-10 border-slate-200" min="1" value={localSettings.lockout_thresholds.level_2_lock_minutes} onChange={(e) => handleSettingChange('lockout_thresholds', 'level_2_lock_minutes', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Level 3 (Mins)</label>
                            <Input type="number" className="mt-1 h-10 border-slate-200" min="1" value={localSettings.lockout_thresholds.level_3_lock_minutes} onChange={(e) => handleSettingChange('lockout_thresholds', 'level_3_lock_minutes', e.target.value)} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">After Level 3, repeated offenses will trigger a permanent device ban.</p>
                      </div>
                    </div>
                  )}

                  {/* Session & Network Policies */}
                  <div className="space-y-6">
                    {localSettings.session && (
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-indigo-500"/> Session Management</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Idle Timeout (Mins)</label>
                            <Input type="number" className="mt-1 h-10 border-slate-200" min="5" value={localSettings.session.idle_timeout_minutes} onChange={(e) => handleSettingChange('session', 'idle_timeout_minutes', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Max Devices / User</label>
                            <Input type="number" className="mt-1 h-10 border-slate-200" min="1" value={localSettings.session.max_concurrent_sessions} onChange={(e) => handleSettingChange('session', 'max_concurrent_sessions', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {localSettings.rate_limits && (
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Network Rate Limits</h4>
                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Max Requests / Minute / IP</label>
                          <Input type="number" className="mt-1 h-10 border-slate-200" min="10" value={localSettings.rate_limits.max_requests_per_ip_per_minute} onChange={(e) => handleSettingChange('rate_limits', 'max_requests_per_ip_per_minute', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Confirmation Modal for Settings */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="w-[95vw] sm:max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Authorization Required
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Modifying SOC security policies requires your Master Password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input type="password" placeholder="Master Password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} autoFocus className="h-12 border-slate-200" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="rounded-xl h-11 border-slate-200">Cancel</Button>
            <Button onClick={executeSaveSettings} disabled={isSaving} className="rounded-xl h-11 bg-slate-900 text-white hover:bg-slate-800">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />} Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
