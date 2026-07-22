import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";

export default function ReadingLogTable({ logs, showActions = false, onEdit, onDelete }) {
  if (!logs || logs.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 p-8 text-center text-slate-400">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p>No reading logs yet.</p>
      </Card>
    );
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-700/50">
              <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Pages</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Subjects</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Notes</TableHead>
              {showActions && <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {log.date ? format(new Date(log.date), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{log.pages_read}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {log.subjects?.split(",").filter(Boolean).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{log.notes || "—"}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit?.(log)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => onDelete?.(log)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}