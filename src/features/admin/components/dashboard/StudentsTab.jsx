"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { hasPermission } from "@/lib/permissions";
import { SHOW_READING_PROGRESS } from "@/config/features";
import { resolveAcademicDisplayName } from "@/lib/academic";
import { createPageUrl } from "@/utils";
import StudentCard from "@/components/ui-custom/StudentCard";
import {
  Upload,
  Plus,
  Loader2,
  BookOpen,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

const CSVImport = dynamic(() => import("@/components/admin/CSVImport"), { ssr: false });

export default function StudentsTab({
  currentUser,
  branches = [],
  classOptions = [],
  sessionOptions = [],
  groupOptions = [],
  branchFilter = "all",
  setBranchFilter,
  classFilter = "all",
  setClassFilter,
  sessionFilter = "all",
  setSessionFilter,
  groupFilter = "all",
  setGroupFilter,
  search = "",
  setSearch,
  filtered = [],
  visibleStudents = [],
  isLoading = false,
  hasMoreStudents = false,
  setVisibleStudentCount,
  showImport = false,
  setShowImport,
  queryClient,
  setEditingStudent,
  setShowStudentForm,
  setLogStudent,
  setShowLogForm,
  handleDeleteStudent,
}) {
  return (
    <TabsContent value="students" className="space-y-4">
      <div className="flex gap-2 flex-wrap justify-end">
        {hasPermission(currentUser, "students", "import") && (
          <Button
            variant="glass"
            onClick={() => setShowImport(!showImport)}
            className="gap-2 text-sm btn-hover-lift"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
        )}
        {hasPermission(currentUser, "students", "create") && (
          <Button
            variant="premium"
            onClick={() => {
              setEditingStudent(null);
              setShowStudentForm(true);
            }}
            className="gap-2 text-sm btn-hover-lift"
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        )}
      </div>

      {showImport && (
        <CSVImport
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-students"] });
            setShowImport(false);
          }}
        />
      )}

      <Card className="border-gray-100 rounded-[20px] shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-bold text-[#052E2B]">
              All Students ({filtered.length})
            </CardTitle>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              {/* Local Search Filter */}
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter list by name/roll..."
                className="w-full sm:w-44 h-9 rounded-xl border-gray-200 focus:border-[#052E2B] text-xs bg-gray-50 focus:bg-white shadow-sm"
              />

              {/* Branch Filter */}
              <Select
                value={branchFilter}
                onValueChange={(val) => {
                  setBranchFilter(val);
                  setClassFilter("all");
                }}
              >
                <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব শাখা (All Branches)</SelectItem>
                  {branches.map((b) => {
                    const nameBn = b.name_bn || b.name_en || b.branch_name;
                    return (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {nameBn}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Class Filter */}
              <Select
                value={classFilter}
                onValueChange={(val) => {
                  setClassFilter(val);
                  setSessionFilter("all");
                  setGroupFilter("all");
                }}
              >
                <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব শ্রেণী (All Classes)</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Session Filter */}
              {sessionOptions.length > 0 && (
                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl">
                    <SelectValue placeholder="All Sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব সেশন (All Sessions)</SelectItem>
                    {sessionOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Group Filter */}
              {groupOptions.length > 0 && (
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-9 rounded-xl">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব গ্রুপ (All Groups)</SelectItem>
                    {groupOptions.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No students found</div>
          ) : (
            <>
              {/* Mobile view cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden p-4">
                {visibleStudents.map((s) => (
                  <div key={s.id} className="space-y-2">
                    <StudentCard student={s} />
                    <div className="flex justify-end gap-1 rounded-xl border border-gray-100 bg-white/80 px-2 py-1.5 dark:bg-slate-800">
                      {SHOW_READING_PROGRESS && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setLogStudent(s);
                            setShowLogForm(true);
                          }}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                      )}
                      {hasPermission(currentUser, "students", "edit") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingStudent(s);
                            setShowStudentForm(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {hasPermission(currentUser, "students", "delete") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteStudent(s)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Branch (শাখা)
                      </th>
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Class (শ্রেণী)
                      </th>
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="text-start py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pages Read
                      </th>
                      <th className="text-end py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visibleStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-4.5 px-6 font-semibold text-slate-500 text-xs font-mono">
                          #{s.roll_number || "N/A"}
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#052E2B]/5 border border-[#052E2B]/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                              {s.photo_url ? (
                                <img
                                  src={s.photo_url}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <span className="text-xs font-bold text-[#052E2B]">
                                  {s.full_name_en?.[0] || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[14px] leading-tight">
                                {s.full_name_en}
                              </p>
                              {s.full_name_bn && (
                                <p className="text-xs text-gray-400 mt-1 leading-none font-medium">
                                  {s.full_name_bn}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 hidden sm:table-cell text-gray-600 font-semibold font-sans">
                          {(() => {
                            const bObj = branches.find((b) => String(b.id) === String(s.branch_id));
                            return bObj ? bObj.name_bn || bObj.name_en || bObj.branch_name : "N/A";
                          })()}
                        </td>
                        <td className="py-4.5 px-6 hidden sm:table-cell text-gray-600 font-semibold font-sans max-w-[200px] break-words whitespace-normal text-xs">
                          {(() => {
                            const bObj = branches.find((b) => String(b.id) === String(s.branch_id));
                            const academicStructure = bObj?.academic_structure || [];
                            return (
                              resolveAcademicDisplayName(
                                s.class_id,
                                s.session_id,
                                s.class_group_id,
                                academicStructure,
                                "bn"
                              ) ||
                              s.class_name ||
                              s.batch ||
                              "N/A"
                            );
                          })()}
                        </td>
                        <td className="py-4.5 px-6 hidden md:table-cell">
                          <span
                            className={`text-[11px] px-3 py-1.5 rounded-full font-bold border transition-all duration-300 ${
                              s.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : s.status === "graduated"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-slate-50 text-slate-500 border-gray-150"
                            }`}
                          >
                            {s.status === "active"
                              ? "Active"
                              : s.status === "graduated"
                              ? "Graduated"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-bold text-emerald-700 text-[14px]">
                          {s.total_pages_read || 0}
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`${createPageUrl("StudentProfile")}?id=${s.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8.5 w-8.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {SHOW_READING_PROGRESS && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8.5 w-8.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-all"
                                onClick={() => {
                                  setLogStudent(s);
                                  setShowLogForm(true);
                                }}
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission(currentUser, "students", "edit") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8.5 w-8.5 rounded-lg hover:bg-[#052E2B]/5 text-[#052E2B] hover:text-[#052E2B] transition-all"
                                onClick={() => {
                                  setEditingStudent(s);
                                  setShowStudentForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission(currentUser, "students", "delete") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8.5 w-8.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
                                onClick={() => handleDeleteStudent(s)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMoreStudents && (
                <div className="border-t border-gray-100 p-4 text-center">
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#052E2B] text-[#052E2B] font-bold"
                    onClick={() => setVisibleStudentCount((count) => count + 50)}
                  >
                    Load More ({visibleStudents.length} of {filtered.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
