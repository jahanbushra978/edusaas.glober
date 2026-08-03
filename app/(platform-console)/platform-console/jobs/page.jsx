import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Idempotent Background Job Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bulk SMS, PDF জেনারেশন ও ডাটা ব্যাকআপ প্রসেসিং কিউ ম্যানেজার।
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base">Background Queue Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">bulk_sms_dispatch_2026</p>
                <p className="text-slate-400 mt-0.5">Idempotency Key: job_sms_0001_178490000</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">
                  <CheckCircle2 size={12} className="mr-1 inline" /> Completed (100%)
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
