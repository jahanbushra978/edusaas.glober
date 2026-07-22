"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Trash2, Download, AlertTriangle, Filter } from "lucide-react";
import { toast } from "sonner";

const ENTITY_LIST = [
  { key: "fees", label: "Student Fees", icon: "💰", color: "border-l-blue-500" },
  { key: "hadiya", label: "Hadiya", icon: "🤲", color: "border-l-emerald-500" },
  { key: "teacher_hadiya", label: "Teacher Hadiya", icon: "🧑‍🏫", color: "border-l-teal-500" },
  { key: "expenses", label: "Expenses", icon: "📊", color: "border-l-red-500" },
  { key: "boarding_expenses", label: "Boarding Expenses", icon: "🏠", color: "border-l-orange-500" },
  { key: "attendance", label: "Student Attendance", icon: "✅", color: "border-l-yellow-500" },
  { key: "teacher_attendance", label: "Teacher Attendance", icon: "📋", color: "border-l-purple-500" },
  { key: "exam_results", label: "Exam Results", icon: "🏆", color: "border-l-pink-500" },
  { key: "notices", label: "Notices", icon: "📢", color: "border-l-indigo-500" },
  { key: "gallery", label: "Gallery", icon: "🖼️", color: "border-l-cyan-500" },
  { key: "gallery_items", label: "Gallery Items", icon: "🖼️", color: "border-l-sky-500" },
  { key: "videos", label: "Video Gallery", icon: "🎬", color: "border-l-rose-500" },
  { key: "contact_messages", label: "Contact Messages", icon: "✉️", color: "border-l-gray-500" },
];

export default function DataManager({ currentUser }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { data: branches = [] } = useQuery({
    queryKey: ["admin-branches-data-mgr"],
    queryFn: () => fetch("/api/admin/period").then(r => r.json()).then(() => []),
    enabled: false,
  });

  const { data: allBranches = [] } = useQuery({
    queryKey: ["admin-branches-list"],
    queryFn: async () => {
      const { appClient } = await import("@/api/appClient");
      return appClient.entities.Branch.list("sort_order", 100);
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredBranches = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? allBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : allBranches;

  const handleDelete = async () => {
    if (!selectedEntity || confirmText !== "YES, DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: selectedEntity.key,
          branch_id: branchFilter,
          month: monthFilter || undefined,
          year: yearFilter || undefined,
          confirm_phrase: confirmText,
          action: "delete",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success(data.message);
      setConfirmOpen(false);
      setConfirmText("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (entity) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: entity.key,
          branch_id: branchFilter,
          month: monthFilter || undefined,
          year: yearFilter || undefined,
          confirm_phrase: "YES, DELETE",
          action: "list",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);

      const records = data.records || [];
      if (records.length === 0) {
        toast.info("No records to export.");
        return;
      }

      const csvHeader = Object.keys(records[0]).join(",");
      const csvRows = records.map((r) =>
        Object.values(r)
          .map((v) => (v !== null && v !== undefined ? `"${String(v).replace(/"/g, '""')}"` : ""))
          .join(",")
      );
      const csv = [csvHeader, ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entity.key}_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${records.length} records.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Data Management & Maintenance</h2>
          <p className="text-sm text-muted-foreground">Safely clear or export data. Always export before deleting.</p>
        </div>
      </div>

      <Card className="border-primary/10 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-slate-600">Filters:</span>

            {currentUser?.role === "admin" && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="all">All Branches</option>
                {filteredBranches.map((b) => (
                  <option key={b.id} value={b.id}>{b.branch_name || b.name_en}</option>
                ))}
              </select>
            )}

            <Input
              type="month"
              value={yearFilter && monthFilter ? `${yearFilter}-${monthFilter}` : ""}
              onChange={(e) => {
                const [y, m] = (e.target.value || "").split("-");
                setYearFilter(y || "");
                setMonthFilter(m || "");
              }}
              className="w-40 h-9 text-sm"
              placeholder="Filter by month"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ENTITY_LIST.map((entity) => (
          <Card
            key={entity.key}
            className={`border-primary/10 hover:shadow-md transition-all duration-200 border-l-4 ${entity.color} cursor-pointer`}
            onClick={() => setSelectedEntity(entity)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{entity.label}</p>
                    <p className="text-xs text-slate-500">{entity.key}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                    onClick={(e) => { e.stopPropagation(); handleExport(entity); }}
                    title="Export as CSV"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); setSelectedEntity(entity); setConfirmOpen(true); }}
                    title="Delete records"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete {selectedEntity?.label} Records?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 pt-2 space-y-3">
              <p className="font-bold text-red-600">This action cannot be undone!</p>
              <div className="bg-red-50 rounded-xl p-3 text-xs space-y-1">
                <p><strong>Entity:</strong> {selectedEntity?.label}</p>
                <p><strong>Branch:</strong> {branchFilter === "all" ? "All Branches" : filteredBranches.find(b => String(b.id) === branchFilter)?.branch_name || branchFilter}</p>
                {monthFilter && yearFilter && <p><strong>Period:</strong> {yearFilter}-{monthFilter}</p>}
              </div>
              <p>Type <strong className="text-red-600">YES, DELETE</strong> to confirm:</p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type YES, DELETE here"
                className="border-red-200 focus-visible:ring-red-500"
              />
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => { setConfirmOpen(false); setConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              disabled={confirmText !== "YES, DELETE" || deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...</>
              ) : (
                "Delete Records"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
