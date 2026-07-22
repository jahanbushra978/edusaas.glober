import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download, Users, UserCog, DollarSign, BookOpen, CalendarCheck,
  Wallet, FileText, Loader2, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

function downloadCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))];
  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPORTS = [
  {
    key: "students",
    label: "ছাত্র তালিকা",
    desc: "সব ছাত্রের সম্পূর্ণ তথ্য",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    entity: "Student",
    limit: 5000,
    sort: "-created_date",
    headers: ["রোল নম্বর", "নাম (ইংরেজি)", "নাম (বাংলা)", "ব্যাচ", "সেশন", "স্ট্যাটাস", "মোট পৃষ্ঠা", "মোবাইল", "পিতার নাম", "মাতার নাম", "ঠিকানা", "ভর্তির তারিখ", "ভর্তির বছর", "হাদিয়া (৳)", "হাদিয়ার ধরন", "নোট"],
    mapRow: (s) => [s.roll_number, s.full_name_en, s.full_name_bn || "", s.batch, s.session || "", s.status, s.total_pages_read || 0, s.mobile_number || "", s.father_name || "", s.mother_name || "", s.address || "", s.admission_date || "", s.admission_year || "", s.hadiya_amount || "", s.hadiya_note || "", s.notes || ""],
  },
  {
    key: "teachers",
    label: "শিক্ষক তালিকা",
    desc: "সব শিক্ষকের তথ্য",
    icon: UserCog,
    color: "text-amber-700",
    bg: "bg-amber-100",
    entity: "Teacher",
    limit: 500,
    sort: "-created_date",
    headers: ["শিক্ষক আইডি", "নাম (ইংরেজি)", "নাম (বাংলা)", "ফোন", "ইমেইল", "বিষয়", "ব্যাচ", "স্ট্যাটাস", "হাদিয়া (৳)", "হাদিয়ার ধরন"],
    mapRow: (t) => [t.teacher_id, t.full_name_en, t.full_name_bn || "", t.phone || "", t.user_email || "", t.subjects || "", t.assigned_batches || "", t.status, t.hadiya_amount || "", t.hadiya_note || ""],
  },
  {
    key: "fees",
    label: "বেতন রেকর্ড",
    desc: "সব বেতন পরিশোধের তথ্য",
    icon: DollarSign,
    color: "text-blue-600",
    bg: "bg-blue-100",
    entity: "Fee",
    limit: 10000,
    sort: "-month",
    headers: ["ছাত্র আইডি", "মাস", "মোট বেতন (৳)", "পরিশোধিত (৳)", "বাকি (৳)", "স্ট্যাটাস", "পরিশোধের তারিখ", "নোট"],
    mapRow: (f) => [f.student_id, f.month, f.total_fee || 0, f.paid_amount || 0, f.due_amount || 0, f.status, f.payment_date || "", f.notes || ""],
  },
  {
    key: "hadiya",
    label: "হাদিয়া রেকর্ড",
    desc: "সব হাদিয়া প্রদানের তথ্য",
    icon: Wallet,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    entity: "Hadiya",
    limit: 5000,
    sort: "-month",
    headers: ["প্রাপকের ধরন", "প্রাপকের আইডি", "প্রাপকের নাম", "মাস", "পরিমাণ (৳)", "স্ট্যাটাস", "পরিশোধের তারিখ", "নোট"],
    mapRow: (h) => [h.recipient_type === "student" ? "ছাত্র" : "শিক্ষক", h.recipient_id, h.recipient_name || "", h.month, h.amount || 0, h.status === "paid" ? "প্রদত্ত" : "অপেক্ষমাণ", h.paid_date || "", h.notes || ""],
  },
  {
    key: "attendance",
    label: "হাজিরা রেকর্ড",
    desc: "সব উপস্থিতির তথ্য",
    icon: CalendarCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    entity: "Attendance",
    limit: 20000,
    sort: "-date",
    headers: ["ছাত্র আইডি", "তারিখ", "স্ট্যাটাস", "চিহ্নিতকারী", "নোট"],
    mapRow: (a) => [a.student_id, a.date, a.status, a.marked_by || "", a.notes || ""],
  },
  {
    key: "reading_logs",
    label: "পঠন লগ",
    desc: "সব পঠন রেকর্ড",
    icon: BookOpen,
    color: "text-teal-600",
    bg: "bg-teal-100",
    entity: "ReadingLog",
    limit: 20000,
    sort: "-date",
    headers: ["ছাত্র আইডি", "তারিখ", "পৃষ্ঠা সংখ্যা", "বিষয়", "নোট"],
    mapRow: (r) => [r.student_id, r.date, r.pages_read || 0, r.subjects || "", r.notes || ""],
  },
  {
    key: "expenses",
    label: "ব্যয়ের রেকর্ড",
    desc: "সব খরচের তথ্য",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-100",
    entity: "Expense",
    limit: 5000,
    sort: "-date",
    headers: ["মাস", "পরিমাণ (৳)", "ক্যাটাগরি", "বিবরণ", "তারিখ"],
    mapRow: (e) => [e.month, e.amount || 0, e.category || "", e.description || "", e.date || ""],
  },
];

export default function DataExportPanel() {
  const [loading, setLoading] = useState({});
  const [done, setDone] = useState({});

  const handleExport = async (exp) => {
    setLoading(l => ({ ...l, [exp.key]: true }));
    setDone(d => ({ ...d, [exp.key]: false }));
    const data = await appClient.entities[exp.entity].list(exp.sort, exp.limit);
    const rows = data.map(exp.mapRow);
    const today = format(new Date(), "yyyy-MM-dd");
    downloadCSV(`rahmania_${exp.key}_${today}.csv`, exp.headers, rows);
    setLoading(l => ({ ...l, [exp.key]: false }));
    setDone(d => ({ ...d, [exp.key]: true }));
    setTimeout(() => setDone(d => ({ ...d, [exp.key]: false })), 2500);
  };

  const handleExportAll = async () => {
    setLoading(l => ({ ...l, all: true }));
    for (const exp of EXPORTS) {
      const data = await appClient.entities[exp.entity].list(exp.sort, exp.limit);
      const rows = data.map(exp.mapRow);
      const today = format(new Date(), "yyyy-MM-dd");
      downloadCSV(`rahmania_${exp.key}_${today}.csv`, exp.headers, rows);
      await new Promise(r => setTimeout(r, 400));
    }
    setLoading(l => ({ ...l, all: false }));
    setDone(d => ({ ...d, all: true }));
    setTimeout(() => setDone(d => ({ ...d, all: false })), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-primary font-bengali">ডেটা ডাউনলোড সেন্টার</h2>
          <p className="text-xs text-muted-foreground font-bengali">প্রতিটি বিভাগের ডেটা আলাদাভাবে CSV ফরম্যাটে ডাউনলোড করুন</p>
        </div>
        <Button
          onClick={handleExportAll}
          disabled={loading.all}
          className="gap-2 bg-primary text-white font-bengali"
        >
          {loading.all ? <Loader2 className="h-4 w-4 animate-spin" /> : done.all ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          সব ডেটা একসাথে ডাউনলোড করুন
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map((exp) => {
          const Icon = exp.icon;
          const isLoading = loading[exp.key];
          const isDone = done[exp.key];
          return (
            <Card key={exp.key} className="border-primary/10 hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${exp.bg}`}>
                  <Icon className={`h-5 w-5 ${exp.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 font-bengali">{exp.label}</p>
                  <p className="text-xs text-muted-foreground font-bengali">{exp.desc}</p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className={`h-9 w-9 flex-shrink-0 transition-colors ${isDone ? "border-emerald-500 text-emerald-600" : "border-primary/20 hover:border-primary"}`}
                  onClick={() => handleExport(exp)}
                  disabled={isLoading}
                  title={`${exp.label} ডাউনলোড করুন`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDone ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-xs text-muted-foreground font-bengali space-y-1">
        <p className="font-semibold text-slate-600 dark:text-slate-400">📌 নির্দেশিকা:</p>
        <p>• প্রতিটি ফাইল UTF-8 BOM এনকোডিং সহ ডাউনলোড হবে — বাংলা অক্ষর সঠিকভাবে দেখাবে।</p>
        <p>• Excel এ খুলতে: File → Import → CSV → UTF-8 encoding নির্বাচন করুন।</p>
        <p>• "সব ডেটা একসাথে" বাটনে ক্লিক করলে ৭টি আলাদা CSV ফাইল ডাউনলোড হবে।</p>
      </div>
    </div>
  );
}