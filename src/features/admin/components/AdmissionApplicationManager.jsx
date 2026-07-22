import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, CheckCircle2, XCircle, Clock, Phone } from "lucide-react";
import { toast } from "sonner";

const SESSIONS = ["সকল", "নূরানী", "নাজেরা", "হিফয", "হিফয শুনানি", "কিন্ডারগার্টেন", "কিতাবখানা", "English Version"];
const STATUS_FILTER = ["সকল", "pending", "approved", "rejected"];

const statusStyle = {
  pending: { label: "Pending", bg: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: "Approved", bg: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", bg: "bg-red-100 text-red-800", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function AdmissionApplicationManager({ currentUser }) {
  const [filterSession, setFilterSession] = useState("সকল");
  const [filterStatus, setFilterStatus] = useState("সকল");
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const queryClient = useQueryClient();

  const { data: rawApps = [], isLoading } = useQuery({
    queryKey: ["admission-applications"],
    queryFn: () => appClient.entities.AdmissionApplication.list("-created_date", 200),
  });

  const apps = currentUser?.role === "branch_admin"
    ? rawApps.filter((a) => String(a.branch_id) === String(currentUser.branch_id))
    : rawApps;

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.AdmissionApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-applications"] });
      toast.success("Updated!");
      setSelected(null);
    },
  });

  const filtered = apps.filter(a => {
    const sMatch = filterSession === "সকল" || a.desired_session === filterSession;
    const stMatch = filterStatus === "সকল" || a.status === filterStatus;
    return sMatch && stMatch;
  });

  const counts = { total: apps.length, pending: apps.filter(a => a.status === "pending").length, approved: apps.filter(a => a.status === "approved").length };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-primary">ভর্তি আবেদন ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground">Online admission applications</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <p className="text-lg font-bold text-yellow-700">{counts.pending}</p>
            <p className="text-[10px] text-yellow-600">Pending</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(0,100,60,0.08)", border: "1px solid rgba(0,100,60,0.2)" }}>
            <p className="text-lg font-bold text-green-700">{counts.approved}</p>
            <p className="text-[10px] text-green-600">Approved</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterSession} onValueChange={setFilterSession}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTER.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">কোনো আবেদন নেই।</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const st = statusStyle[app.status] || statusStyle.pending;
            return (
              <Card key={app.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    {app.photo_url && (
                      <img src={app.photo_url} loading="lazy" alt={app.full_name_bn} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-primary">{app.full_name_bn}</p>
                        {app.full_name_en && <span className="text-xs text-muted-foreground">({app.full_name_en})</span>}
                        <Badge className={`text-xs flex items-center gap-1 ${st.bg}`}>{st.icon}{st.label}</Badge>
                        {app.desired_session && <Badge variant="outline" className="text-xs">{app.desired_session}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>পিতা: {app.father_name}</span>
                        {app.mobile_number && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.mobile_number}</span>}
                        <span>{new Date(app.created_date).toLocaleDateString("bn-BD")}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setSelected(app); setAdminNote(app.admin_notes || ""); }}>
                      <Eye className="h-3.5 w-3.5" /> বিস্তারিত
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>আবেদনের বিস্তারিত</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.photo_url && (
                <div className="flex justify-center">
                  <img src={selected.photo_url} loading="lazy" alt={selected.full_name_bn} className="w-24 h-24 rounded-full object-cover border-2" style={{ borderColor: "rgba(0,100,60,0.3)" }} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["নাম (বাংলা)", selected.full_name_bn],
                  ["নাম (ইংরেজি)", selected.full_name_en],
                  ["পিতার নাম", selected.father_name],
                  ["মাতার নাম", selected.mother_name],
                  ["মোবাইল", selected.mobile_number],
                  ["বিভাগ", selected.desired_session],
                  ["জন্ম তারিখ", selected.date_of_birth],
                  ["পূর্ব শিক্ষা", selected.previous_education],
                ].map(([label, val]) => val ? (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-semibold">{val}</p>
                  </div>
                ) : null)}
              </div>
              {selected.address && (
                <div>
                  <p className="text-xs text-muted-foreground">ঠিকানা</p>
                  <p className="text-sm">{selected.address}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-primary mb-1 block">Admin Notes</label>
                <Textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} placeholder="Optional notes..." />
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={() => updateMut.mutate({ id: selected.id, data: { status: "approved", admin_notes: adminNote } })}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" className="flex-1 gap-1.5"
                  onClick={() => updateMut.mutate({ id: selected.id, data: { status: "rejected", admin_notes: adminNote } })}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button variant="outline" onClick={() => updateMut.mutate({ id: selected.id, data: { status: "pending", admin_notes: adminNote } })}>
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
