"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Monitor, Wifi, WifiOff, Computer, Cpu, Server, Clock, Activity } from "lucide-react";
import { DeviceListSkeleton } from "./LoadingSkeleton";

const API = "/api/attendance/manage";

function apiGet(params) {
  const q = new URLSearchParams(params);
  return fetch(`${API}?${q}`).then((r) => r.json());
}

function formatTime(dateStr) {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function getOnlineStatus(bridge) {
  if (!bridge.last_heartbeat_at) return "offline";
  const diff = Date.now() - new Date(bridge.last_heartbeat_at).getTime();
  if (diff < 180000) return "online";
  if (diff < 300000) return "warning";
  return "offline";
}

export default function BridgeManagement() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBridges = useCallback(async () => {
    setLoading(true);
    const r = await apiGet({ action: "bridges" });
    if (r.ok) setBridges(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadBridges(); }, [loadBridges]);

  const statusCounts = {
    online: bridges.filter(b => getOnlineStatus(b) === "online").length,
    warning: bridges.filter(b => getOnlineStatus(b) === "warning").length,
    offline: bridges.filter(b => getOnlineStatus(b) === "offline").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Monitor className="w-5 h-5" /> Bridge Management
        </h2>
        <Button variant="outline" size="sm" onClick={loadBridges}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <Wifi className="w-5 h-5 mx-auto text-green-500" />
            <div className="text-xl font-bold text-green-600">{statusCounts.online}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 mx-auto text-yellow-500" />
            <div className="text-xl font-bold text-yellow-600">{statusCounts.warning}</div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <WifiOff className="w-5 h-5 mx-auto text-red-500" />
            <div className="text-xl font-bold text-red-600">{statusCounts.offline}</div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <DeviceListSkeleton />
      ) : bridges.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No bridges registered yet. Install and configure a biometric bridge to see it here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bridges.map((bridge) => {
            const online = getOnlineStatus(bridge);
            return (
              <Card key={bridge.bridge_id} className={online === "offline" ? "opacity-70" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {online === "online" ? (
                          <Wifi className="w-5 h-5 text-green-500" />
                        ) : online === "warning" ? (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{bridge.computer_name}</span>
                          <Badge variant={online === "online" ? "default" : online === "warning" ? "outline" : "secondary"}>
                            {online === "online" ? "Online" : online === "warning" ? "Warning" : "Offline"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Computer className="w-3.5 h-3.5" />
                            <span>ID: <span className="font-mono text-xs">{bridge.bridge_id}</span></span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Server className="w-3.5 h-3.5" />
                            <span>Device: {bridge.device_name} ({bridge.device_serial})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Model: {bridge.device_model}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Version: {bridge.software_version}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          <span>Branch: {bridge.branch_name}</span>
                          <span>IP: {bridge.ip_address || "N/A"}</span>
                          <span>Heartbeat: {formatTime(bridge.last_heartbeat_at)}</span>
                          <span>Last Sync: {formatTime(bridge.last_sync_at)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last Attendance: {formatTime(bridge.last_attendance_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
