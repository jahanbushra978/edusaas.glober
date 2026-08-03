import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Immutable Platform Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          প্ল্যাটফর্ম ও টেন্যান্টের সিকিউরিটি অ্যাকশনসমূহের অপরিবর্তনীয় ইতিহাস।
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base">Recent Audit Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">ORGANIZATION_CREATED</p>
                <p className="text-slate-400 mt-0.5">Created Rahmania Institute (Org #1)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 flex items-center gap-1"><Clock size={12} /> Just now</span>
                <Badge variant="outline" className="text-[10px]">SUCCESS</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
