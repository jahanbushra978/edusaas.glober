import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appClient } from "@/api/appClient";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, "").replace(/"/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let inQuotes = false;
    let current = "";
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = values[idx]; });
      rows.push(obj);
    }
  }
  return rows;
}

export default function CSVImport({ onComplete }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      const studentFields = ["roll_number", "full_name_en", "full_name_bn", "batch", "father_name", "mother_name", "mobile_number", "address", "admission_date", "admission_year", "date_of_birth"];
      const validStudents = rows.filter(r => r.full_name_en && r.roll_number);

      if (validStudents.length > 0) {
        for (const s of validStudents) {
          const data = {};
          studentFields.forEach(f => { if (s[f]) data[f] = s[f]; });
          await appClient.entities.Student.create({
            ...data,
            status: "active",
            total_pages_read: 0,
          });
        }
        setResult({ success: true, count: validStudents.length });
        onComplete?.();
        toast.success(`Imported ${validStudents.length} students`);
      } else {
        setResult({ success: false, message: "No valid student records found. Ensure CSV has roll_number and full_name_en columns." });
      }
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "Failed to parse file. Ensure it's a valid CSV." });
    }

    setUploading(false);
  };

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Import Students from CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-500 mb-4">
          Upload a CSV or Excel file with columns: roll_number, full_name_en, full_name_bn, batch, father_name, mother_name, mobile_number, address, admission_date, admission_year, date_of_birth
        </p>
        <label className="cursor-pointer">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" disabled={uploading} />
          <Button variant="outline" className="gap-2" disabled={uploading} asChild>
            <span>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Processing..." : "Choose File"}
            </span>
          </Button>
        </label>
        {result && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${result.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {result.success ? `Successfully imported ${result.count} students!` : result.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}