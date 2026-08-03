import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download } from "lucide-react";

export default function BackupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Disaster Recovery & Backup Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          ভার্সনড ডাটাবেজ স্ন্যাপশট এক্সপোর্ট ও ডিজেস্টার রিকভারি।
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="text-teal-600" size={18} /> Tenant Database Snapshots
          </CardTitle>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-xs">
            Export Full Snapshot
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Rahmania Institute Full Backup</p>
                <p className="text-slate-400 mt-0.5">Schema Version: 1.0.0 · 2026-07-24</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download size={12} className="mr-1" /> Download JSON
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
