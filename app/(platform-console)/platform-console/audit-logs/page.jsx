"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { listAuditLogs } from "@/features/platform-console/lib/platformConsoleClient";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Immutable Platform Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            প্ল্যাটফর্ম ও টেন্যান্টের সিকিউরিটি অ্যাকশনসমূহের রিয়েল-টাইম সার্ভার অডিট ইতিহাস।
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <Shield size={18} className="text-teal-600" />
            <span>Recent Security Events ({logs.length})</span>
          </CardTitle>
          <span className="text-[11px] text-slate-400 font-mono">Server Timezone: UTC</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-teal-600" />
              অডিট লগ লোড হচ্ছে...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
              কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 font-mono text-[13px]">{log.action}</span>
                      <Badge variant="outline" className="text-[10px] font-mono border-slate-200 text-slate-600">
                        {log.target_type || "SYSTEM"}
                      </Badge>
                      {log.actor_role && (
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-medium">
                          {log.actor_role}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs">
                      Actor: <span className="font-medium text-slate-800">{log.actor_email || "System"}</span>
                      {log.target_id && <span className="text-slate-400 ml-2">ID: {log.target_id}</span>}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-xl">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString("bn-BD")}
                    </span>
                    {log.ip_address && (
                      <span className="text-[10px] font-mono text-slate-400">IP: {log.ip_address}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
