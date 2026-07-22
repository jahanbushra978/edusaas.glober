"use client";

import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, ScanFace, IdCard, Activity } from "lucide-react";

const API = "/api/attendance/manage";

export default function BiometricInfoSection({ userType, userId, onDataChange }) {
  const [expanded, setExpanded] = useState(true);
  const [form, setForm] = useState({
    enable_biometric: false,
    machine_user_id: "",
    card_number: "",
    fingerprint_enabled: false,
    face_enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!userId || !expanded) return;
    setLoading(true);
    const controller = new AbortController();
    fetch(`${API}?action=biometric_profile&user_type=${userType}&user_id=${userId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!mountedRef.current) return;
        if (d.ok && d.data) {
          setForm({
            enable_biometric: d.data.enable_biometric || false,
            machine_user_id: d.data.machine_user_id || "",
            card_number: d.data.card_number || "",
            fingerprint_enabled: d.data.fingerprint_enabled || false,
            face_enabled: d.data.face_enabled || false,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (mountedRef.current) setLoading(false); });
    return () => controller.abort();
  }, [userId, userType, expanded]);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (onDataChange) onDataChange(next);
  };

  return (
    <Card className="border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-400">
              Biometric Information
            </span>
          </div>
          <span className="text-xs text-indigo-500">{expanded ? "Collapse" : "Expand"}</span>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {loading && <p className="text-xs text-muted-foreground">Loading biometric data...</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <Label className="text-xs font-medium">Enable Biometric</Label>
              </div>
              <Switch
                checked={form.enable_biometric}
                onCheckedChange={(v) => update("enable_biometric", v)}
              />
            </div>

            {form.enable_biometric && (
              <div className="space-y-3 pl-6 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <IdCard className="h-3 w-3" /> Machine User ID *
                  </Label>
                  <Input
                    value={form.machine_user_id}
                    onChange={(e) => update("machine_user_id", e.target.value)}
                    placeholder="ZKTeco user/PIN number"
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <IdCard className="h-3 w-3" /> Card Number
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    value={form.card_number}
                    onChange={(e) => update("card_number", e.target.value)}
                    placeholder="RFID card number"
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-indigo-500" />
                    <Label className="text-xs font-medium">Fingerprint Enabled</Label>
                  </div>
                  <Switch
                    checked={form.fingerprint_enabled}
                    onCheckedChange={(v) => update("fingerprint_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanFace className="h-4 w-4 text-indigo-500" />
                    <Label className="text-xs font-medium">Face Enabled</Label>
                  </div>
                  <Switch
                    checked={form.face_enabled}
                    onCheckedChange={(v) => update("face_enabled", v)}
                  />
                </div>
              </div>
            )}

            {!form.enable_biometric && (
              <p className="text-xs text-muted-foreground italic">
                Biometric synchronization is disabled. Enable it to configure biometric settings.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
