"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";

const API = "/api/attendance/manage";

function parseCSV(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/["']/g, ""));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

function parseExcelLikeData(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t").map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split("\t").map((v) => v.trim().replace(/["']/g, ""));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

export default function BulkImportMapping() {
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setPreview(null);

    try {
      const text = await file.text();
      const isCSV = file.name.endsWith(".csv");
      const parsed = isCSV ? parseCSV(text) : parseExcelLikeData(text);

      if (parsed.length === 0) {
        toast.error("No data found in file");
        setLoading(false);
        return;
      }

      setRows(parsed);

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_preview", data: { rows: parsed } }),
      });
      const d = await res.json();
      if (d.ok) {
        setPreview(d);
      } else {
        toast.error(d.message || "Preview failed");
      }
    } catch (err) {
      toast.error("Failed to parse file: " + err.message);
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!preview || preview.matched_count === 0) {
      toast.error("No matched records to import");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_execute", data: { matched_rows: preview.matched } }),
      });
      const d = await res.json();
      if (d.ok) {
        toast.success(`Successfully imported ${d.created_count} records`);
        setPreview(null);
        setRows([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error(d.message || "Import failed");
      }
    } catch (err) {
      toast.error("Import error: " + err.message);
    }
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" /> Bulk Import Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV or Excel (.xlsx) file to bulk import Machine User ID mappings.
            The system will automatically match students by Student ID, Registration Number, or Roll Number,
            and teachers by Teacher ID or Employee Code.
          </p>

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              onChange={handleFileUpload}
              className="hidden"
              id="bulk-import-file"
            />
            <label
              htmlFor="bulk-import-file"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 text-sm text-indigo-600 font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              Choose CSV / Excel File
            </label>
            {rows.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {rows.length} rows parsed
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border">
            <p className="font-medium mb-1">Supported file columns:</p>
            <code className="text-[10px]">student_id, teacher_id, roll_number, registration_number, machine_user_id, card_number</code>
            <p className="mt-1">Student matching priority: Student ID → Registration Number → Roll Number</p>
            <p className="">Teacher matching priority: Teacher ID → Employee Code</p>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      )}

      {preview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Import Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-700">{preview.total}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{preview.matched_count}</div>
                  <div className="text-xs text-muted-foreground">Matched</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">{preview.duplicate_count}</div>
                  <div className="text-xs text-muted-foreground">Duplicate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{preview.unmatched_count}</div>
                  <div className="text-xs text-muted-foreground">Unmatched</div>
                </CardContent>
              </Card>
            </div>

            {preview.matched_count > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Matched Records ({preview.matched_count})
                </h4>
                <div className="max-h-40 overflow-y-auto border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Machine User ID</TableHead>
                        <TableHead className="text-xs">Card Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.matched.slice(0, 50).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">
                            {r.matched_user_type} #{r.matched_user_id}
                          </TableCell>
                          <TableCell className="text-xs font-mono">{r.machine_user_id}</TableCell>
                          <TableCell className="text-xs">{r.card_number || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {preview.duplicate_count > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Duplicate Records ({preview.duplicate_count})
                </h4>
                <div className="max-h-32 overflow-y-auto border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Machine User ID</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.duplicate.slice(0, 30).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{r.machine_user_id}</TableCell>
                          <TableCell className="text-xs text-amber-600">{r.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {preview.unmatched_count > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Unmatched Records ({preview.unmatched_count})
                </h4>
                <div className="max-h-32 overflow-y-auto border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Data</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.unmatched.slice(0, 30).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">
                            {r.student_id || r.teacher_id || r.roll_number || r.registration_number || "?"}
                          </TableCell>
                          <TableCell className="text-xs text-red-500">{r.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {preview.unmatched_count > 30 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing 30 of {preview.unmatched_count} unmatched records
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => { setPreview(null); setRows([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || preview.matched_count === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                {importing ? "Importing..." : `Import Matched Only (${preview.matched_count})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !preview && rows.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Upload a CSV or Excel file to preview bulk import</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
