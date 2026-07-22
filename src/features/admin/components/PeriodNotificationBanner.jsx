"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PeriodNotificationBanner({ onNavigateToPeriod }) {
  const [info, setInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch("/api/admin/period/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const isDismissed = localStorage.getItem(`period-dismissed-${data.currentPeriod}`) === "true";
          if (isDismissed) {
            setDismissed(true);
          }
          setInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (info?.currentPeriod) {
      localStorage.setItem(`period-dismissed-${info.currentPeriod}`, "true");
    }
  };

  if (!info || !info.needsNewPeriod || dismissed) return null;

  const handleAutoArchive = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success(`Auto-archived: ${info.currentPeriod} → ${info.systemPeriod}`);
      queryClient.invalidateQueries({ queryKey: ["admin-period-info"] });
      setDismissed(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-800">
          New Accounting Period Detected
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          System date is <strong>{info.systemPeriod}</strong> but current accounting period is{" "}
          <strong>{info.currentPeriod}</strong>. Archive the old period to start fresh.
        </p>
        <div className="flex gap-2 mt-2">
          {info.autoArchive ? (
            <Button
              size="sm"
              className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1"
              onClick={handleAutoArchive}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isProcessing ? "Archiving..." : `Auto-Archive: ${info.currentPeriod} → ${info.systemPeriod}`}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold"
              onClick={() => {
                handleDismiss();
                if (onNavigateToPeriod) onNavigateToPeriod();
              }}
            >
              Go to Period Manager
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-xl text-amber-600 hover:text-amber-800 text-xs"
            onClick={handleDismiss}
          >
            Remind Later
          </Button>
        </div>
      </div>
      <button
        className="shrink-0 rounded-full p-1 text-amber-500 hover:bg-amber-100 hover:text-amber-700 transition-colors"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
