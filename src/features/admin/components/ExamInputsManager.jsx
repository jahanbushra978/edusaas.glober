import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Eye, EyeOff, Loader2, ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { STUDY_SESSION_OPTIONS } from "@/lib/departmentData";

const SESSION_OPTIONS = STUDY_SESSION_OPTIONS;

export default function ExamInputsManager({ exams = [] }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", session: "", exam_id: "", is_visible: true, sort_order: 0 });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: inputs = [], isLoading } = useQuery({
    queryKey: ["exam-inputs"],
    queryFn: () => appClient.entities.ExamInput.list("-created_date", 100),
  });

  const createMut = useMutation({
    mutationFn: (data) => appClient.entities.ExamInput.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-inputs"] });
      setShowForm(false);
      resetForm();
      toast.success("Input uploaded successfully!");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.ExamInput.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-inputs"] });
      toast.success("Deleted.");
    },
  });

  const toggleVisibilityMut = useMutation({
    mutationFn: ({ id, val }) => appClient.entities.ExamInput.update(id, { is_visible: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-inputs"] }),
  });

  const resetForm = () => {
    setForm({ title: "", session: "", exam_id: "", is_visible: true, sort_order: 0 });
    setFile(null);
    setPreview(null);
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files[0];
    if (!nextFile) return;
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file && !form.image_url) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    setUploading(true);
    let imageUrl = form.image_url;
    if (file) {
      const response = await appClient.integrations.Core.UploadFile({ file });
      imageUrl = response.file_url;
    }
    await createMut.mutateAsync({
      ...form,
      exam_id: form.exam_id === "none" ? "" : form.exam_id,
      image_url: imageUrl,
    });
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold italic text-primary">
            <ImageIcon className="h-4 w-4" /> Exam Inputs
          </h3>
          <p className="mt-0.5 text-xs italic text-muted-foreground">Upload question papers & images for department result sections</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 italic font-bold">
          <Plus className="h-4 w-4" /> Upload Input
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : inputs.length === 0 ? (
        <div className="py-12 text-center italic text-muted-foreground">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p>No inputs uploaded yet. Click &quot;Upload Input&quot; to add question papers or images.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inputs.map((input) => (
            <div key={input.id} className="overflow-hidden rounded-2xl border border-primary/10 bg-white transition-all hover:shadow-lg dark:bg-slate-800">
              {input.image_url ? (
                <div className="h-40 overflow-hidden bg-slate-100">
                  <img src={input.image_url} loading="lazy" alt={input.title} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="p-4">
                <p className="mb-1 truncate text-sm font-bold italic text-slate-800 dark:text-slate-200">{input.title}</p>
                {input.session ? <p className="mb-3 text-xs italic text-muted-foreground">{input.session}</p> : null}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibilityMut.mutate({ id: input.id, val: !input.is_visible })}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold italic transition-all ${input.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {input.is_visible ? <><Eye className="h-3 w-3" /> Visible</> : <><EyeOff className="h-3 w-3" /> Hidden</>}
                  </button>
                  <button
                    onClick={() => { if (window.confirm("Delete this input?")) deleteMut.mutate(input.id); }}
                    className="ml-auto flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold italic text-red-600 transition-all hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(next) => { setShowForm(next); if (!next) resetForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="italic">Upload Exam Input</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold italic text-primary">Title *</label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Question Paper — January 2026" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold italic text-primary">Session</label>
                <Select value={form.session} onValueChange={(value) => setForm((prev) => ({ ...prev, session: value }))}>
                  <SelectTrigger className="italic"><SelectValue placeholder="Select session" /></SelectTrigger>
                  <SelectContent>
                    {SESSION_OPTIONS.map((session) => (
                      <SelectItem key={session} value={session}>{session}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold italic text-primary">Linked Exam</label>
                <Select value={form.exam_id} onValueChange={(value) => setForm((prev) => ({ ...prev, exam_id: value }))}>
                  <SelectTrigger className="italic"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold italic text-primary">Upload Image / File *</label>
              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-primary/20 p-4 text-center transition-all hover:border-primary/40"
                onClick={() => document.getElementById("exam-input-file").click()}
              >
                {preview ? (
                  <img src={preview} loading="lazy" alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 h-8 w-8 text-primary/40" />
                    <p className="text-xs italic text-muted-foreground">Click to select an image or file</p>
                  </div>
                )}
                <input id="exam-input-file" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vis-check" checked={form.is_visible} onChange={(event) => setForm((prev) => ({ ...prev, is_visible: event.target.checked }))} className="rounded" />
              <label htmlFor="vis-check" className="text-xs italic text-slate-600">Visible on department pages</label>
            </div>
            <div className="flex justify-end gap-2 border-t pt-1">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="italic">Cancel</Button>
              <Button type="submit" disabled={uploading} className="gap-2 italic">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
