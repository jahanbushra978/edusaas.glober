"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function FeeConfirmationCard({
  confirmation,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 min countdown

  const details = confirmation?.confirmation_details || {};
  const expiresAt = confirmation?.expires_at;

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  return (
    <Card className="my-3 border-2 border-amber-500/40 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 shadow-xl dark:border-amber-500/30 dark:from-slate-900/95 dark:via-slate-900 dark:to-amber-950/20">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                আর্থিক অপারেশন অনুমোদন (Confirmation Required)
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Signed Token: <span className="font-mono">{confirmation?.operation_id}</span>
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 font-mono text-xs ${
              isExpired
                ? "border-rose-500 text-rose-600 dark:text-rose-400"
                : "border-amber-500 text-amber-700 dark:text-amber-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {isExpired ? "Expired" : `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2 text-sm">
        {/* Student & Ledger Summary */}
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-950/30">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">ছাত্রের নাম:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{details.student_name || "—"}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">রোল ও ক্লাস:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                রোল: {details.roll_number || "—"}, {details.class_name || "—"}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">শাখা (Branch):</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{details.branch_name || "Central"}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">প্রদেয় মাস:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{details.month || "—"}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-amber-200/80 pt-2 dark:border-amber-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              হিসাবকৃত আসল বকেয়া (Payable):
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ৳{Number(details.payable_amount || 0).toLocaleString("en-BD")}
            </div>
          </div>
        </div>

        {/* Payment Method Inputs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">পেমেন্ট মাধ্যম</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLoading || isExpired}>
              <SelectTrigger className="mt-1 h-9 text-xs">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash (নগদ)</SelectItem>
                <SelectItem value="bKash">bKash</SelectItem>
                <SelectItem value="Nagad">Nagad</SelectItem>
                <SelectItem value="Rocket">Rocket</SelectItem>
                <SelectItem value="Bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Transaction ID (ঐচ্ছিক)</Label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN-123456"
              className="mt-1 h-9 text-xs font-mono"
              disabled={isLoading || isExpired}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 border-t border-slate-200/60 pb-3 pt-3 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className="h-8 gap-1 text-xs"
        >
          <XCircle className="h-3.5 w-3.5" />
          বাতিল করুন (Cancel)
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onConfirm({ paymentMethod, transactionId, notes })}
          disabled={isLoading || isExpired}
          className="h-8 gap-1 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isLoading ? "প্রসেসিং হচ্ছে..." : "অনুমোদন ও রেকর্ড করুন (Confirm)"}
        </Button>
      </CardFooter>
    </Card>
  );
}
