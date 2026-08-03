import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle2, ShieldCheck } from "lucide-react";

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Multi-Domain & SSL Lifecycle Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          কাস্টম ডোমেইন, সাবডোমেইন ও SSL সার্টিফিকেট ভেরিফিকেশন প্যানেল।
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base">Registered Tenant Domains</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Globe size={14} className="text-teal-600" /> rahmaniainstitute.org
                </p>
                <p className="text-slate-400 mt-0.5">Rahmania Institute · Primary Domain</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">
                  <CheckCircle2 size={12} className="mr-1 inline" /> Verified & Active
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  <ShieldCheck size={12} className="mr-1 inline text-teal-600" /> SSL Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
