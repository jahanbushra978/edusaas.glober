'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Inbox, Calendar } from "lucide-react";

const INITIAL_FORMS = [
  { id: "f1", title: "অনলাইন ভর্তি আবেদন ফর্ম ২০২৬", slug: "admission-form", fieldsCount: 8, submissionsCount: 24 },
  { id: "f2", title: "অভিভাবক মতামত ও অভিযোগ ফর্ম", slug: "feedback-form", fieldsCount: 4, submissionsCount: 7 },
];

const MOCK_SUBMISSIONS = [
  { id: "s1", formTitle: "অনলাইন ভর্তি আবেদন ফর্ম ২০২৬", applicant: "আব্দুল্লাহ আল মামুন", phone: "01700000000", date: "২০২৬-০৭-২৪", status: "New" },
  { id: "s2", formTitle: "অনলাইন ভর্তি আবেদন ফর্ম ২০২৬", applicant: "সাইফুল ইসলাম", phone: "01800000000", date: "২০২৬-০৭-২৩", status: "Reviewed" },
];

export default function VisualFormBuilderPage() {
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [newTitle, setNewTitle] = useState("");
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateForm = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const newForm = {
      id: `form_${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, "-"),
      fieldsCount: 5,
      submissionsCount: 0,
    };
    setForms((prev) => [newForm, ...prev]);
    setNewTitle("");
    showNotification(`'${newForm.title}' তৈরি করা হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          📝 {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="text-teal-600" /> Visual Form Builder & Submissions Inbox
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          অনলাইন ভর্তি, স্কলারশিপ ও কনট্যাক্ট ফর্ম তৈরি করুন এবং সাবমিশন ইনবক্স দেখুন।
        </p>
      </div>

      <Tabs defaultValue="forms">
        <TabsList>
          <TabsTrigger value="forms">Active Forms ({forms.length})</TabsTrigger>
          <TabsTrigger value="inbox">Submissions Inbox ({submissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="pt-4 space-y-6">
          {/* Create New Form Card */}
          <Card className="border-teal-200">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">নতুন ডাইনামিক ফর্ম তৈরি করুন</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleCreateForm} className="flex gap-3">
                <Input
                  placeholder="যেমন: স্কলারশিপ আবেদন ফর্ম ২০২৬"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="text-xs bg-white flex-1"
                />
                <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-xs">
                  <Plus size={14} className="mr-1" /> Create Form
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Forms List Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="border-slate-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">{form.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">Shortcode: [form slug="{form.slug}"]</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{form.fieldsCount} Fields</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex items-center justify-between border-t border-slate-100 mt-3">
                  <span className="text-xs text-slate-500 font-medium">{form.submissionsCount} Submissions</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => showNotification("ফর্ম বিল্ডার এডিটর খোলা হয়েছে")}>
                      Edit Fields
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inbox" className="pt-4">
          <Card className="border-slate-200">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Inbox size={18} className="text-teal-600" /> Submissions Data History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{sub.applicant}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.formTitle} · {sub.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> {sub.date}</span>
                      <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">{sub.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
