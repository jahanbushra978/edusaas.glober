"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Clock, Loader2 } from "lucide-react";

const API = "/api/attendance/manage";

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function toggleDay(days, day) {
  const arr = days ? days.split(",") : [];
  const idx = arr.indexOf(day);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(day);
  return arr.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).join(",");
}

export default function HRShiftManager({ branchId }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    shift_name: "", shift_type: "teacher", start_time: "08:00", end_time: "17:00",
    grace_time: 15, lunch_start: "13:00", lunch_end: "14:00",
    working_days: "Sat,Sun,Mon,Tue,Wed,Thu", description: "",
  });

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "hr_shifts" });
      if (branchId) params.set("branch_id", branchId);
      const r = await fetch(`${API}?${params}`).then(res => res.json());
      if (r.ok) setShifts(r.data);
    } catch (err) {
      console.error("Failed to load shifts:", err);
    }
    setLoading(false);
  }, [branchId]);

  useEffect(() => { loadShifts(); }, [loadShifts]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      shift_name: "", shift_type: "teacher", start_time: "08:00", end_time: "17:00",
      grace_time: 15, lunch_start: "13:00", lunch_end: "14:00",
      working_days: "Sat,Sun,Mon,Tue,Wed,Thu", description: "",
    });
    setShowForm(true);
  };

  const openEdit = (shift) => {
    setEditing(shift);
    setForm({
      shift_name: shift.shift_name,
      shift_type: shift.shift_type,
      start_time: shift.start_time?.slice(0, 5) || "08:00",
      end_time: shift.end_time?.slice(0, 5) || "17:00",
      grace_time: shift.grace_time || 15,
      lunch_start: shift.lunch_start?.slice(0, 5) || "",
      lunch_end: shift.lunch_end?.slice(0, 5) || "",
      working_days: shift.working_days || "",
      description: shift.description || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.shift_name || !form.start_time || !form.end_time) {
      toast.error("Name, start and end time required");
      return;
    }
    const payload = {
      ...form,
      branch_id: branchId,
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
      lunch_start: form.lunch_start ? `${form.lunch_start}:00` : null,
      lunch_end: form.lunch_end ? `${form.lunch_end}:00` : null,
    };

    const action = editing ? "update_shift" : "create_shift";
    if (editing) payload.id = editing.id;

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload }),
      }).then(res => res.json());
      if (r.ok) {
        toast.success(editing ? "Shift updated" : "Shift created");
        setShowForm(false);
        loadShifts();
      } else {
        toast.error(r.message);
      }
    } catch {
      toast.error("Failed to save shift");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this shift?")) return;
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_shift", data: { id } }),
      }).then(res => res.json());
      if (r.ok) { toast.success("Deleted"); loadShifts(); }
      else toast.error(r.message);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const formatTime = (t) => t?.slice(0, 5) || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" /> Shift & Schedule Management
        </h3>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Shift
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Shift" : "Create New Shift"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Shift Name *</Label>
                <Input value={form.shift_name} onChange={(e) => setForm(p => ({ ...p, shift_name: e.target.value }))} placeholder="e.g. Morning Shift" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.shift_type} onValueChange={(v) => setForm(p => ({ ...p, shift_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher / Employee</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grace Period (min)</Label>
                <Input type="number" value={form.grace_time} onChange={(e) => setForm(p => ({ ...p, grace_time: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm(p => ({ ...p, end_time: e.target.value }))} />
              </div>
              <div>
                <Label>Lunch Start</Label>
                <Input type="time" value={form.lunch_start} onChange={(e) => setForm(p => ({ ...p, lunch_start: e.target.value }))} />
              </div>
              <div>
                <Label>Lunch End</Label>
                <Input type="time" value={form.lunch_end} onChange={(e) => setForm(p => ({ ...p, lunch_end: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {DAYS.map(d => {
                  const active = (form.working_days || "").includes(d);
                  return (
                    <button key={d} type="button"
                      onClick={() => setForm(p => ({ ...p, working_days: toggleDay(p.working_days, d) }))}
                      className={`px-3 py-1 text-xs rounded-full border font-semibold transition-all ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : shifts.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">No shifts defined yet. Add your first shift.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {shifts.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{s.shift_name}</span>
                      <Badge variant={s.shift_type === "teacher" ? "default" : "secondary"} className="text-[10px]">
                        {s.shift_type === "teacher" ? "Employee" : "Student"}
                      </Badge>
                      <Badge variant={s.is_active ? "default" : "outline"} className="text-[10px]">
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(s.start_time)} - {formatTime(s.end_time)}
                      </div>
                      <div>Grace: {s.grace_time || 0}min</div>
                      {s.lunch_start && <div>Lunch: {formatTime(s.lunch_start)} - {formatTime(s.lunch_end)}</div>}
                      <div>Days: {(s.working_days || "").split(",").join(", ")}</div>
                    </div>
                    {s.description && <p className="text-xs text-muted-foreground mt-1 italic">{s.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
