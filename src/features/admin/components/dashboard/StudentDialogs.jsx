"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SHOW_READING_PROGRESS } from "@/config/features";

const StudentForm = dynamic(() => import("@/components/admin/StudentForm"), { ssr: false });
const ReadingLogForm = dynamic(() => import("@/components/admin/ReadingLogForm"), { ssr: false });

export default function StudentDialogs({
  showStudentForm,
  setShowStudentForm,
  editingStudent,
  setEditingStudent,
  handleSaveStudent,
  currentUser,
  showLogForm,
  setShowLogForm,
  logStudent,
  setLogStudent,
  createLogMut,
}) {
  return (
    <>
      {/* Student Form Dialog */}
      {showStudentForm && (
        <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#052E2B]">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
            </DialogHeader>
            <StudentForm
              key={editingStudent?.id || "new"}
              student={editingStudent}
              onSave={handleSaveStudent}
              onCancel={() => {
                setShowStudentForm(false);
                setEditingStudent(null);
              }}
              currentUser={currentUser}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Reading Log Form Dialog */}
      {SHOW_READING_PROGRESS && showLogForm && (
        <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#052E2B]">
                Add Reading Log {logStudent ? `- ${logStudent.full_name_en}` : ""}
              </DialogTitle>
            </DialogHeader>
            <ReadingLogForm
              studentId={logStudent?.id}
              onSave={(data) => createLogMut.mutateAsync(data)}
              onCancel={() => {
                setShowLogForm(false);
                setLogStudent(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
