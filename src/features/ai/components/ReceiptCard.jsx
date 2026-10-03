"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Copy, CheckCircle2, QrCode, Building2, Check } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptCard({ receipt }) {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef(null);

  if (!receipt) return null;

  const handleCopy = () => {
    const text = `
------------------------------------------
🏛️ RAHMANIA INSTITUTE - FEE RECEIPT
------------------------------------------
Receipt No : ${receipt.receiptNo}
Operation ID : ${receipt.operationId}
Date : ${receipt.date}
Student : ${receipt.student?.name} (Roll: ${receipt.student?.roll}, Class: ${receipt.student?.class})
Branch : ${receipt.student?.branch || "Central"}
Month : ${receipt.paymentDetails?.month}
Amount Paid : ৳${receipt.paymentDetails?.amount} (${receipt.paymentDetails?.currency})
Method : ${receipt.paymentDetails?.paymentMethod}
Status : ${receipt.paymentDetails?.status}
Collected By : ${receipt.paymentDetails?.collectedBy}
------------------------------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Receipt details copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) {
      toast.error("Please allow popups to print the receipt.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Rahmania Receipt - ${receipt.receiptNo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            .receipt-box { border: 2px dashed #94a3b8; padding: 24px; border-radius: 8px; max-width: 480px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #0f766e; font-size: 20px; }
            .header p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 14px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
            .info-table td { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
            .info-table td.label { color: #64748b; width: 40%; }
            .info-table td.val { font-weight: 600; }
            .total-row { background: #f0fdf4; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
            .total-val { font-size: 20px; font-weight: bold; color: #16a34a; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h2>${receipt.institution || "Rahmania Institute"}</h2>
              <p>${receipt.title || "Official Fee Collection Receipt"}</p>
            </div>
            <div class="meta-grid">
              <div><strong>Receipt:</strong> ${receipt.receiptNo}</div>
              <div><strong>Date:</strong> ${receipt.date}</div>
            </div>
            <table class="info-table">
              <tr><td class="label">Student Name:</td><td class="val">${receipt.student?.name}</td></tr>
              <tr><td class="label">Roll & Class:</td><td class="val">Roll: ${receipt.student?.roll || "—"}, ${receipt.student?.class || "—"}</td></tr>
              <tr><td class="label">Branch:</td><td class="val">${receipt.student?.branch || "Central"}</td></tr>
              <tr><td class="label">Billing Month:</td><td class="val">${receipt.paymentDetails?.month}</td></tr>
              <tr><td class="label">Payment Method:</td><td class="val">${receipt.paymentDetails?.paymentMethod}</td></tr>
              <tr><td class="label">Transaction ID:</td><td class="val">${receipt.paymentDetails?.transactionId}</td></tr>
              <tr><td class="label">Collector:</td><td class="val">${receipt.paymentDetails?.collectedBy}</td></tr>
            </table>
            <div class="total-row">
              <span><strong>TOTAL PAID:</strong></span>
              <span class="total-val">৳${Number(receipt.paymentDetails?.amount || 0).toLocaleString("en-BD")}</span>
            </div>
            <div class="footer">
              <p>Operation Ref: ${receipt.operationId} | Verified Digital Transaction</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card
      ref={receiptRef}
      className="my-3 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/30 shadow-lg dark:border-emerald-500/30 dark:from-slate-900/95 dark:via-slate-900 dark:to-emerald-950/20"
    >
      <CardHeader className="border-b border-emerald-500/20 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {receipt.institution || "Rahmania Institute"}
              </CardTitle>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ডিজিটাল পেমেন্ট রসিদ (Official Receipt)</p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-[10px] font-semibold text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            PAID
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-3 text-xs">
        <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            No: <strong className="text-slate-700 dark:text-slate-200">{receipt.receiptNo}</strong>
          </span>
          <span>Date: {receipt.date}</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400">ছাত্রের নাম:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{receipt.student?.name}</p>
            </div>
            <div>
              <span className="text-slate-400">রোল ও ক্লাস:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                রোল: {receipt.student?.roll || "—"}, {receipt.student?.class || "—"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">শাখা:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{receipt.student?.branch || "Central"}</p>
            </div>
            <div>
              <span className="text-slate-400">মাস:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{receipt.paymentDetails?.month}</p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">পরিশোধিত টাকার অংক:</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ৳{Number(receipt.paymentDetails?.amount || 0).toLocaleString("en-BD")}
            </span>
          </div>
        </div>

        {/* Barcode & Reference Stamp */}
        <div className="flex items-center justify-between rounded border border-dashed border-slate-300 px-3 py-1.5 dark:border-slate-700">
          <div className="font-mono text-[10px] text-slate-400">
            OP-REF: <span className="text-slate-600 dark:text-slate-300">{receipt.operationId}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
            <QrCode className="h-3.5 w-3.5" />
            <span>Verified Transaction</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 border-t border-emerald-500/20 pb-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1 text-[11px]"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handlePrint}
          className="h-7 gap-1 bg-emerald-600 text-[11px] font-semibold text-white hover:bg-emerald-700"
        >
          <Printer className="h-3 w-3" />
          Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
}
