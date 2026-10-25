import { format } from "date-fns";

export const exportStudentsAndTeachersCSV = ({ students = [], allTeachers = [] }) => {
  const studentHeaders = [
    "Roll No",
    "Name (EN)",
    "Name (BN)",
    "Batch",
    "Session",
    "Status",
    "Pages Read",
    "Mobile",
    "Father",
    "Mother",
    "Address",
    "Admission Date",
    "Admission Year",
    "Hadiya Amount",
    "Hadiya Note",
    "Notes",
  ];

  const studentRows = students.map((s) => [
    s.roll_number,
    s.full_name_en,
    s.full_name_bn || "",
    s.class_name || s.batch,
    s.session || "",
    s.status,
    s.total_pages_read || 0,
    s.mobile_number || "",
    s.father_name || "",
    s.mother_name || "",
    s.address || "",
    s.admission_date || "",
    s.admission_year || "",
    s.hadiya_amount || "",
    s.hadiya_note || "",
    s.notes || "",
  ]);

  const teacherHeaders = [
    "Teacher ID",
    "Name (EN)",
    "Name (BN)",
    "Phone",
    "Email",
    "Subjects",
    "Batches",
    "Status",
    "Hadiya Amount",
    "Hadiya Note",
  ];

  const teacherRows = allTeachers.map((t) => [
    t.teacher_id,
    t.full_name_en,
    t.full_name_bn || "",
    t.phone || "",
    t.user_email || "",
    t.subjects || "",
    t.assigned_batches || "",
    t.status,
    t.hadiya_amount || "",
    t.hadiya_note || "",
  ]);

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    "=== Student List ===",
    studentHeaders.map(escape).join(","),
    ...studentRows.map((r) => r.map(escape).join(",")),
    "",
    "=== Teacher List ===",
    teacherHeaders.map(escape).join(","),
    ...teacherRows.map((r) => r.map(escape).join(",")),
  ];

  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rahmania_data_${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
