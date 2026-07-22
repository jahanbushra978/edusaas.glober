"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, AlertTriangle, CheckCircle2, Clock, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/LanguageContext";

export default function PeriodManager() {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState(null);
  const [autoArchive, setAutoArchive] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const syncPeriodMut = useMutation({
    mutationFn: async (periodVal) => {
      const res = await fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: periodVal, skip_archive: true }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-period-info"] });
      queryClient.invalidateQueries({ queryKey: ["admin-period-check"] });
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { data: periodInfo, isLoading } = useQuery({
    queryKey: ["admin-period-info"],
    queryFn: async () => {
      const res = await fetch("/api/admin/period");
      if (!res.ok) throw new Error("Failed to fetch period info");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const { data: checkInfo } = useQuery({
    queryKey: ["admin-period-check"],
    queryFn: async () => {
      const res = await fetch("/api/admin/period/check");
      if (!res.ok) throw new Error("Failed to fetch period check");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const startPeriodMut = useMutation({
    mutationFn: async (period) => {
      const res = await fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-period-info"] });
      queryClient.invalidateQueries({ queryKey: ["admin-period-check"] });
      toast.success(data.message);
      setConfirmOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const toggleAutoArchiveMut = useMutation({
    mutationFn: async (enabled) => {
      const allSettings = await appClient.entities.AppSettings.list("id", 500);
      const existing = Array.isArray(allSettings)
        ? allSettings.find((s) => s.key === "auto_archive_enabled")
        : null;
      if (existing) {
        await appClient.entities.AppSettings.update(existing.id, { value: String(enabled) });
      } else {
        await appClient.entities.AppSettings.create({ key: "auto_archive_enabled", value: String(enabled) });
      }
      return enabled;
    },
    onSuccess: (enabled) => {
      setAutoArchive(enabled);
      queryClient.invalidateQueries({ queryKey: ["admin-period-check"] });
      toast.success(enabled ? "Auto-archive enabled" : "Auto-archive disabled");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const currentPeriod = periodInfo?.currentPeriod || "—";
  const nextPeriod = periodInfo?.nextPeriod || null;
  const prevData = periodInfo?.previousPeriodData || [];
  const systemPeriod = checkInfo?.systemPeriod || "—";
  const needsNewPeriod = checkInfo?.needsNewPeriod || false;
  const isAutoArchive = autoArchive !== null ? autoArchive : checkInfo?.autoArchive;

  const timeString = currentTime
    ? currentTime.toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "—";

  const dateString = currentTime
    ? currentTime.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Accounting Period Management</h2>
        <p className="text-sm text-muted-foreground">Manage monthly accounting periods. Data is never deleted — only archived.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/10 bg-primary/5">
              <CardContent className="p-5 flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Period</p>
                  <p className="text-2xl font-extrabold text-primary">{currentPeriod}</p>
                </div>
              </CardContent>
            </Card>

            {nextPeriod && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-5 flex items-center gap-4">
                  <Clock className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-bold">Next Period</p>
                    <p className="text-2xl font-extrabold text-emerald-700">{nextPeriod.key}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-5 flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-xs text-amber-600 font-bold">Archived Tables</p>
                  <p className="text-2xl font-extrabold text-amber-700">{prevData.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <Clock className="h-8 w-8 text-indigo-600 animate-pulse" />
                <div>
                  <p className="text-xs text-indigo-600 font-bold">System Time</p>
                  <p className="text-2xl font-extrabold text-indigo-700 font-mono tracking-wider">{timeString}</p>
                  <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">{dateString}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Auto Monthly Lifecycle</span>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-archive" className="text-xs text-muted-foreground font-medium">
                      Auto-Archive at month end
                    </Label>
                    <Switch
                      id="auto-archive"
                      checked={isAutoArchive === true}
                      onCheckedChange={(val) => toggleAutoArchiveMut.mutate(val)}
                      disabled={toggleAutoArchiveMut.isPending}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">System Date Period</span>
                  <span className={`font-bold ${needsNewPeriod ? "text-amber-600" : "text-emerald-600"}`}>
                    {systemPeriod} {needsNewPeriod ? "(New!)" : "(Current)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Active Accounting Period</span>
                  <span className="font-bold text-primary">{currentPeriod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <span className={`font-bold ${needsNewPeriod ? "text-amber-600" : "text-emerald-600"}`}>
                    {needsNewPeriod ? "New month detected — archive pending" : "Up to date"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Next Period</span>
                  <span className="font-bold text-emerald-600">{nextPeriod?.key || "—"}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {needsNewPeriod && isAutoArchive && (
                  <Button
                    size="sm"
                    className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1"
                    onClick={() => { setTargetPeriod(nextPeriod?.key); setConfirmOpen(true); }}
                    disabled={startPeriodMut.isPending}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Auto-Archive Now: {currentPeriod} → {nextPeriod?.key}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl gap-1 text-xs font-bold"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["admin-period-info"] });
                    queryClient.invalidateQueries({ queryKey: ["admin-period-check"] });
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh Status
                </Button>

                {currentPeriod !== systemPeriod && (
                  <Button
                    size="sm"
                    className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1 transition-all"
                    onClick={() => syncPeriodMut.mutate(systemPeriod)}
                    disabled={syncPeriodMut.isPending}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncPeriodMut.isPending ? "animate-spin" : ""}`} />
                    {lang === "bn" ? "আজকের মাসে সেট করুন (আর্কাইভ ছাড়া)" : "Sync with Current Month (No Archive)"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {prevData.length > 0 && (
            <Card className="border-primary/10">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm text-primary mb-3">Current Period Data Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {prevData.map((item) => (
                    <div key={item.table} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                      <span className="text-slate-700 font-medium capitalize">{item.table.replace(/_/g, " ")}</span>
                      <span className="font-bold text-primary">{item.recordCount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {nextPeriod && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                size="lg"
                className="gap-2 bg-[#12715B] hover:bg-[#004D3A] text-white font-bold rounded-xl"
                onClick={() => { setTargetPeriod(nextPeriod.key); setConfirmOpen(true); }}
                disabled={startPeriodMut.isPending}
              >
                {startPeriodMut.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Start New Period — {nextPeriod.key}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" /> Start New Period?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 pt-2 space-y-2">
              <p>This will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Archive current period ({currentPeriod}) data</li>
                <li>Set active period to <strong>{targetPeriod}</strong></li>
                <li>All old data remains in the database (is_archived = true)</li>
                <li>You can still view reports from previous periods</li>
              </ul>
              <p className="text-xs text-slate-500 mt-2">No data will be deleted. New entries will use the new period.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#12715B] hover:bg-[#004D3A] text-white rounded-xl font-bold"
              onClick={() => startPeriodMut.mutate(targetPeriod)}
              disabled={startPeriodMut.isPending}
            >
              {startPeriodMut.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processing...</>
              ) : (
                "Yes, Start New Period"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
