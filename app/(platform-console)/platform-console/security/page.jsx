import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Platform Security & Firewall Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          রেট লিমিটিং, আইপি ব্লকিং ও টার্নস্টাইল সিকিউরিটি গার্ড।
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="text-teal-600" size={18} /> Active Platform Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">CSRF & Rate Limiting Protection</p>
              <p className="text-slate-400">Enforced on all API routes</p>
            </div>
            <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Row-Level Security (RLS)</p>
              <p className="text-slate-400">Strict Organization Isolation</p>
            </div>
            <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
