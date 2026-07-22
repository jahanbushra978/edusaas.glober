import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function ReadingLogForm({ log, studentId, student, allLogs = [], onSave, onCancel, showAI = false }) {
  const [data, setData] = useState(log || {
    student_id: studentId,
    date: new Date().toISOString().split("T")[0],
    pages_read: "",
    subjects: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedSubjects, setSavedSubjects] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...data, pages_read: Number(data.pages_read) });
      if (showAI && data.subjects) {
        setSavedSubjects(data.subjects);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save reading log");
      console.error("Reading log save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-500">Date *</Label>
            <Input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Pages Read *</Label>
            <Input type="number" min="1" value={data.pages_read} onChange={(e) => update("pages_read", e.target.value)} required className="mt-1" placeholder="e.g. 25" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-slate-500">Subjects / Topics</Label>
          <Input value={data.subjects || ""} onChange={(e) => update("subjects", e.target.value)} className="mt-1" placeholder="English Grammar, Math Ch5 (comma separated)" />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Notes</Label>
          <Textarea value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={2} placeholder="Additional notes..." />
        </div>
        <div className="flex justify-end gap-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : log ? "Update Log" : "Add Log"}
          </Button>
        </div>
      </form>
    </div>
  );
}