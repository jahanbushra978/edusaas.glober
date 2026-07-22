import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName, isStudentInClassOption } from "@/lib/academic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Loader2, Trophy, Pencil, Trash2, 
  Search, Award, AlertTriangle, ShieldCheck, Printer, CreditCard 
} from "lucide-react";
import dynamic from "next/dynamic";
const AdmitCardManager = dynamic(() => import("./AdmitCardManager"), { ssr: false });
import { format } from "date-fns";
import { toast } from "sonner";
import { DEFAULT_LOGO } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const EXAM_TYPE_OPTIONS = ["First Terminal Exam", "Half Yearly Exam", "Annual Exam", "Model Test", "Monthly Test"];
const ACADEMIC_YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028"];
const STATUS_OPTIONS = ["Active", "Inactive"];

// Build flat class options matching StudentForm format:
// - When sections exist: value = sec.id (section-level ID) — matches student.class_id
// - When no sections: value = c.id (class-level ID)
function getFlatClassOptions(academicStructure) {
  const options = [];
  (academicStructure || []).forEach(c => {
    if (c.sections && c.sections.length > 0) {
      c.sections.forEach(sec => {
        options.push({
          id: sec.id,
          classId: c.id,
          class_name: c.class_name,
          section_name: sec.section_name || sec.section,
          subjects: sec.subjects || [],
          label: `${c.class_name?.bn || c.class_name?.en}${sec.section_name?.bn ? ` (${sec.section_name.bn})` : sec.section_name?.en ? ` (${sec.section_name.en})` : ""}`.trim()
        });
      });
    } else {
      options.push({
        id: c.id,
        classId: c.id,
        class_name: c.class_name,
        section_name: c.section,
        subjects: c.subjects || [],
        label: `${c.class_name?.bn || c.class_name?.en}${c.section?.bn ? ` (${c.section.bn})` : c.section?.en ? ` (${c.section.en})` : ""}`.trim()
      });
    }
  });
  return options;
}

const GRADE_COLORS = {
  "A+": { bg: "rgba(0,192,96,0.12)", text: "#00a060", border: "rgba(0,192,96,0.25)", label: "Excellent" },
  "A":  { bg: "rgba(77,166,255,0.12)", text: "#0080ff", border: "rgba(77,166,255,0.25)", label: "Very Good" },
  "A-": { bg: "rgba(186,104,200,0.12)", text: "#ab47bc", border: "rgba(186,104,200,0.25)", label: "Good" },
  "B":  { bg: "rgba(212,175,55,0.12)", text: "#b8960a", border: "rgba(212,175,55,0.25)", label: "Satisfactory" },
  "C":  { bg: "rgba(255,136,0,0.12)", text: "#cc6600", border: "rgba(255,136,0,0.25)", label: "Average" },
  "D":  { bg: "rgba(255,100,0,0.12)", text: "#cc4400", border: "rgba(255,100,0,0.25)", label: "Passing" },
  "F":  { bg: "rgba(255,50,50,0.12)", text: "#cc0000", border: "rgba(255,50,50,0.25)", label: "Failed" },
};

// Real-time calculation helper functions
export function calcSubjectGradeAndGPA(obtained, full) {
  if (!full || full <= 0) return { grade: "F", gpa: 0 };
  const pct = (obtained / full) * 100;
  if (pct >= 80) return { grade: "A+", gpa: 5.0 };
  if (pct >= 70) return { grade: "A", gpa: 4.0 };
  if (pct >= 60) return { grade: "A-", gpa: 3.5 };
  if (pct >= 50) return { grade: "B", gpa: 3.0 };
  if (pct >= 40) return { grade: "C", gpa: 2.0 };
  if (pct >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0 };
}

export function calcOverallGrade(gpa, isFailed) {
  if (isFailed || gpa < 1.0) return "F";
  if (gpa >= 5.0) return "A+";
  if (gpa >= 4.0) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.0) return "C";
  return "D";
}

// ────────────────────────────────────────────────────────
// Print Ready HTML Marksheet Generator
// ────────────────────────────────────────────────────────
export function getPrintableMarksheetHTML(student, branch, className, exam, result, settings) {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
  
  const groupName = (() => {
    if (!student?.class_group_id || !branch?.academic_structure) return "";
    for (const c of branch.academic_structure) {
      if (c.groups) {
        const g = c.groups.find(grp => String(grp.id) === String(student.class_group_id));
        if (g) return g.group_name?.bn || g.group_name?.en || "";
      }
    }
    return "";
  })();

  const subjectsHtml = (result.marks_details || []).map(sub => {
    const isSubFailed = sub.obtained_marks < sub.pass_marks;
    const { grade, gpa } = calcSubjectGradeAndGPA(sub.obtained_marks, sub.full_marks);
    return `
      <tr>
        <td style="text-align: left; padding: 10px 12px; border: 1px solid #002818;">
          <span style="font-weight: 600; font-size: 13px;">${sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</span>
          ${sub.book_name?.en ? `<br/><span style="font-size: 10px; color: #555; font-style: italic;">Book: ${sub.book_name.en}</span>` : ""}
        </td>
        <td style="padding: 10px 12px; border: 1px solid #002818; font-weight: 500;">${sub.full_marks}</td>
        <td style="padding: 10px 12px; border: 1px solid #002818; color: #cc4400; font-weight: 500;">${sub.pass_marks}</td>
        <td style="padding: 10px 12px; border: 1px solid #002818; font-weight: bold; font-size: 14px; ${isSubFailed ? "color: red;" : "color: #006241;"}">${sub.obtained_marks}</td>
        <td style="padding: 10px 12px; border: 1px solid #002818; font-weight: bold; ${isSubFailed ? "color: red;" : "color: #006241;"}">${isSubFailed ? "F" : grade}</td>
        <td style="padding: 10px 12px; border: 1px solid #002818; font-weight: 600; ${isSubFailed ? "color: red;" : ""};">${isSubFailed ? "0.00" : gpa.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const isFailed = result.status === "fail";

  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>Academic Transcript - ${student.full_name_en}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Outfit:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Outfit', Arial, sans-serif; background: white; padding: 15px; color: #002818; }
        .bn { font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }
        .marksheet-container {
          border: 4px double #004D3A;
          padding: 25px;
          max-width: 820px;
          margin: 0 auto;
          background: #FCFDFB;
          position: relative;
        }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004D3A; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-wrap { width: 85px; height: 85px; padding: 2px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
        .logo-wrap img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
        .inst-details { text-align: center; flex: 1; padding: 0 15px; }
        .inst-name-bn { font-size: 24px; font-weight: 700; color: #004D3A; letter-spacing: 0.5px; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }
        .inst-name-en { font-size: 15px; font-weight: 600; color: #D4AF37; text-transform: uppercase; margin-top: 2px; }
        .branch-info { font-size: 11px; color: #555; margin-top: 3px; font-weight: 500; }
        .grade-chart { width: 150px; border-collapse: collapse; font-size: 9px; text-align: center; border: 1px solid #004D3A; }
        .grade-chart th, .grade-chart td { border: 1px solid #004D3A; padding: 3px; }
        .grade-chart th { background: #004D3A; color: white; font-weight: bold; }
        
        .title-badge { text-align: center; margin: 15px 0 20px; }
        .title-badge span { background: #004D3A; color: white; padding: 6px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: 1px dashed #D4AF37; }
        
        .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: rgba(0, 77, 58, 0.03); border: 1px solid rgba(0, 77, 58, 0.1); border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 12px; }
        .info-col p { margin-bottom: 6px; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }
        .info-col strong { color: #004D3A; font-weight: 600; }
        
        .marks-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; margin-bottom: 20px; }
        .marks-table th { background: #004D3A; color: white; padding: 8px 10px; border: 1px solid #002818; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 30px; }
        .summary-box { border: 1px solid rgba(0, 77, 58, 0.15); border-radius: 8px; padding: 10px; text-align: center; background: rgba(0, 77, 58, 0.02); }
        .summary-box .val { font-size: 18px; font-weight: 700; color: #004D3A; margin-bottom: 3px; }
        .summary-box .lbl { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .footer-sig { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 10px; border-top: 1px dashed rgba(0, 77, 58, 0.2); }
        .sig-block { text-align: center; width: 150px; font-size: 11px; }
        .sig-line { border-top: 1px solid #004D3A; margin-bottom: 6px; }
        
        .brand-footer { text-align: center; font-size: 9px; color: #888; margin-top: 25px; padding-top: 10px; border-top: 1px solid #eee; text-transform: uppercase; letter-spacing: 0.5px; }
        .publish-date { font-weight: 600; color: #004D3A; }
        
        @media print {
          body { padding: 0; background: white; }
          .marksheet-container { border: 4px double #004D3A; box-shadow: none; background: transparent; }
          .summary-box { background: transparent !important; }
          .student-info { background: transparent !important; }
        }
      </style>
    </head>

    <body>
      <div class="marksheet-container">
        <!-- Header -->
        <div class="header">
          <div class="logo-wrap">
            <img src="${logoUrl}" loading="lazy" alt="Logo">
          </div>
          <div class="inst-details">
            <h1 class="inst-name-bn">${instNameBn}</h1>
            <h2 class="inst-name-en">${instNameEn}</h2>
            <p class="branch-info">
              <strong>${branch?.name_en || "Main Branch"}</strong><br/>
              Address: ${branch?.address_en || "N/A"} • Phone: ${branch?.phone || "N/A"}
            </p>
          </div>
          <table class="grade-chart">
            <thead>
              <tr><th>Range</th><th>Grade</th><th>GPA</th></tr>
            </thead>
            <tbody>
              <tr><td>80 - 100</td><td>A+</td><td>5.00</td></tr>
              <tr><td>70 - 79</td><td>A</td><td>4.00</td></tr>
              <tr><td>60 - 69</td><td>A-</td><td>3.50</td></tr>
              <tr><td>50 - 59</td><td>B</td><td>3.00</td></tr>
              <tr><td>40 - 49</td><td>C</td><td>2.00</td></tr>
              <tr><td>33 - 39</td><td>D</td><td>1.00</td></tr>
              <tr><td>00 - 32</td><td>F</td><td>0.00</td></tr>
            </tbody>
          </table>
        </div>
        
        <!-- Title -->
        <div class="title-badge">
          <span>Official Academic Result Card</span>
        </div>
        
        <!-- Student Info -->
        <div class="student-info">
          <div class="info-col">
            <p><strong>Student Name:</strong> ${student.full_name_en} (${student.full_name_bn || ""})</p>
            <p><strong>Father's Name:</strong> ${student.father_name || "N/A"}</p>
            <p><strong>Mother's Name:</strong> ${student.mother_name || "N/A"}</p>
            <p><strong>Academic Year:</strong> ${exam?.academic_year || "N/A"}</p>
          </div>
          <div class="info-col" style="border-left: 1px solid rgba(0, 77, 58, 0.1); padding-left: 15px;">
            <p><strong>Student ID:</strong> ${student.roll_number || student.id}</p>
            <p><strong>Roll Number:</strong> ${student.roll_number || "N/A"}</p>
            <p><strong>Branch:</strong> ${branch?.name_bn || branch?.name_en || "N/A"}</p>
            <p><strong>Class:</strong> ${className}</p>
            ${groupName ? `<p><strong>Group:</strong> ${groupName}</p>` : ""}
          </div>
        </div>
        
        <!-- Marks Table -->
        <table class="marks-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 45%;">Name of Subjects</th>
              <th style="width: 11%;">Full Marks</th>
              <th style="width: 11%;">Pass Marks</th>
              <th style="width: 12%;">Obtained Marks</th>
              <th style="width: 10%;">Grade</th>
              <th style="width: 11%;">GP</th>
            </tr>
          </thead>
          <tbody>
            ${subjectsHtml}
          </tbody>
        </table>
        
        <!-- Summary Boxes -->
        <div class="summary-grid">
          <div class="summary-box">
            <div class="val">${result.total_obtained_marks} / ${result.total_full_marks}</div>
            <div class="lbl">Total Marks</div>
          </div>
          <div class="summary-box">
            <div class="val" style="${isFailed ? "color: red;" : ""};">${isFailed ? "0.00" : result.gpa?.toFixed(2)}</div>
            <div class="lbl">Grade Point Average (GPA)</div>
          </div>
          <div class="summary-box">
            <div class="val" style="${isFailed ? "color: red;" : ""};">${isFailed ? "F" : (result.grade || "N/A")}</div>
            <div class="lbl">Letter Grade</div>
          </div>
          <div class="summary-box">
            <div class="val" style="color: ${isFailed ? "red" : "#006241"};">${isFailed ? "FAILED" : "PASSED"}</div>
            <div class="lbl">Result Status</div>
          </div>
        </div>
        
        <!-- Merit Rank -->
        <div style="background: rgba(212, 175, 87, 0.07); border: 1px solid rgba(212, 175, 87, 0.25); border-radius: 8px; padding: 12px; margin-bottom: 25px; text-align: center; font-size: 13px;">
          🏆 Merit Position: <strong style="font-size: 16px; color: #004D3A;">${result.rank ? `#${result.rank}` : "N/A"}</strong> in Class
        </div>
        
        <!-- Footer Signatures -->
        <div class="footer-sig">
          <div class="sig-block">
            <div class="sig-line"></div>
            <span>Guardian's Signature</span>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <span>Class Teacher's Signature</span>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <span>Principal's Signature</span>
          </div>
        </div>
        
        <!-- Brand Footer -->
        <div class="brand-footer">
          Result Published Date: <span class="publish-date">${exam?.result_publish_date || "N/A"}</span><br/>
          <span style="font-size: 8px; margin-top: 4px; display: inline-block;">Powered by Rahmania Institute</span>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          // Auto trigger print dialogue for printable mode
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}

// Recalculates the rank for all students in a class for a specific exam.
// Ranks are based on: Status (Pass comes first), GPA (desc), Total Obtained (desc), and Roll (asc)
export async function recalculateMeritRanks(examId, classId) {
  try {
    const allResults = await appClient.entities.ExamResult.filter({ exam_id: examId, class_id: classId });
    if (!allResults || allResults.length === 0) return;
    
    // Sort results based on: Pass/Fail first, then GPA desc, then total obtained desc
    const sorted = [...allResults].map(r => {
      const marksDetails = Array.isArray(r.marks_details) ? r.marks_details : [];
      const total_obtained_marks = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
      const isFailed = marksDetails.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
      const totalGpaPoints = marksDetails.reduce((sum, m) => {
        if (m.obtained_marks === "") return sum;
        return sum + calcSubjectGradeAndGPA(Number(m.obtained_marks), Number(m.full_marks)).gpa;
      }, 0);
      const gpa = marksDetails.length > 0 ? totalGpaPoints / marksDetails.length : 0;
      return { ...r, status: isFailed ? "fail" : "pass", gpa, total_obtained_marks };
    }).sort((a, b) => {
      // 1. Status Pass first
      const statusA = a.status === "pass" ? 1 : 0;
      const statusB = b.status === "pass" ? 1 : 0;
      if (statusA !== statusB) return statusB - statusA;
      
      // 2. GPA descending
      const gpaA = a.gpa || 0;
      const gpaB = b.gpa || 0;
      if (gpaA !== gpaB) return gpaB - gpaA;
      
      // 3. Obtained Marks descending
      const marksA = a.total_obtained_marks || 0;
      const marksB = b.total_obtained_marks || 0;
      return marksB - marksA;
    });
    
    // Update ranks in Supabase
    for (let i = 0; i < sorted.length; i++) {
      const res = sorted[i];
      await appClient.entities.ExamResult.update(res.id, { rank: i + 1 });
    }
  } catch (err) {
    console.error("Error recalculating merit ranks:", err);
  }
}

// ────────────────────────────────────────────────────────
// Print Formats Download Helpers
// ────────────────────────────────────────────────────────
function printResultSheet(branch, className, exam, results, studentsList, settings) {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  
  const resultRows = results.map((r, idx) => {
    const s = studentsList.find(st => String(st.id) === String(r.student_id));
    if (!s) return "";
    
    const groupName = (() => {
      if (!s?.class_group_id || !branch?.academic_structure) return "";
      for (const c of branch.academic_structure) {
        if (c.groups) {
          const g = c.groups.find(grp => String(grp.id) === String(s.class_group_id));
          if (g) return g.group_name?.bn || g.group_name?.en || "";
        }
      }
      return "";
    })();

    const subjectMarksCols = (r.marks_details || []).map(sub => {
      const isFailed = sub.obtained_marks < sub.pass_marks;
      return `<td style="border: 1px solid #002818; padding: 6px; ${isFailed ? "color: red; font-weight: bold;" : ""}">${sub.obtained_marks}</td>`;
    }).join("");
    
    return `
      <tr>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold;">${r.rank || idx + 1}</td>
        <td style="border: 1px solid #002818; padding: 6px; text-align: left;">
          ${s.full_name_en}
          ${groupName ? `<br/><span style="font-size: 10px; color: #555; font-weight: 500;">Group: ${groupName}</span>` : ""}
        </td>
        <td style="border: 1px solid #002818; padding: 6px; font-mono">${s.roll_number || s.id}</td>
        ${subjectMarksCols}
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold;">${r.total_obtained_marks} / ${r.total_full_marks}</td>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold; ${r.status === "fail" ? "color: red;" : ""}">${r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}</td>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold; ${r.status === "fail" ? "color: red;" : ""}">${r.status === "fail" ? "F" : r.grade}</td>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold; color: ${r.status === "fail" ? "red" : "#006241"};">${r.status?.toUpperCase()}</td>
      </tr>
    `;
  }).join("");

  const firstResult = results[0];
  const subjectHeaders = firstResult ? (firstResult.marks_details || []).map(sub => {
    const sName = typeof sub.subject_name === "string" ? sub.subject_name : (sub.subject_name?.bn || sub.subject_name?.en || "");
    return `<th style="border: 1px solid #002818; background: #004D3A; color: white; padding: 6px; font-size: 11px;">${sName}</th>`;
  }).join("") : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Class Result Sheet</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #002818; }
        .sheet-container { border: 2px solid #004D3A; padding: 20px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004D3A; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-wrap { width: 75px; height: 75px; padding: 2px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
        .logo-wrap img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
        .inst-details { text-align: center; flex: 1; padding: 0 15px; }
        .table-data { width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; }
        .table-data th { background: #004D3A; color: white; padding: 8px 6px; border: 1px solid #002818; }
        @media print {
          body { padding: 0; }
          .sheet-container { border: none; }
          .table-data th { background-color: #004D3A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="sheet-container">
        <div class="header">
          <div class="logo-wrap">
            <img src="${logoUrl}" loading="lazy" alt="Logo">
          </div>
          <div class="inst-details">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #004D3A;">${instNameBn}</h1>
            <h2 style="margin: 5px 0 0; font-size: 14px; color: #D4AF37;">${instNameEn} - Class Wise Result</h2>
            <p style="margin: 5px 0 0; font-size: 11px;">
              Branch: <strong>${branch?.name_en || branch?.branch_name || "Main Branch"}</strong> | Class: <strong>${className}</strong> | Exam: <strong>${exam?.title}</strong> | Year: <strong>${exam?.academic_year}</strong>
            </p>
          </div>
          <div style="width: 75px;"></div>
        </div>
        <table class="table-data">
          <thead>
            <tr>
              <th style="border: 1px solid #002818; width: 5%;">Rank</th>
              <th style="border: 1px solid #002818; width: 25%; text-align: left;">Student Name</th>
              <th style="border: 1px solid #002818; width: 10%;">ID / Roll</th>
              ${subjectHeaders}
              <th style="border: 1px solid #002818; width: 12%;">Obtained Marks</th>
              <th style="border: 1px solid #002818; width: 8%;">GPA</th>
              <th style="border: 1px solid #002818; width: 8%;">Grade</th>
              <th style="border: 1px solid #002818; width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resultRows}
          </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; color: #888;">
          <span>Report Generated: ${format(new Date(), "dd/MM/yyyy")}</span>
          <span>Powered by Rahmania Institute</span>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.open("text/html", "replace");
  printWindow.document.write(html);
  printWindow.document.close();
}

function printBlankMarksheet(branch, className, subjectsList, studentsList) {
  const instNameBn = "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = "RAHMANIA INSTITUTE";

  const subjectHeaders = subjectsList.map(sub => {
    const sName = typeof sub.subject_name === "string" ? sub.subject_name : (sub.subject_name?.bn || sub.subject_name?.en || "");
    return `<th style="border: 1px solid #002818; background: #004D3A; color: white; padding: 8px 6px; font-size: 11px;">${sName} (পূর্ণমান: ${sub.full_marks || 100})</th>`;
  }).join("");

  const resultRows = studentsList.map((s, idx) => {
    const subjectCols = subjectsList.map(() => {
      return `<td style="border: 1px solid #002818; padding: 12px 6px; height: 30px;"></td>`;
    }).join("");

    return `
      <tr>
        <td style="border: 1px solid #002818; padding: 8px 6px; font-weight: bold;">${idx + 1}</td>
        <td style="border: 1px solid #002818; padding: 8px 6px; font-mono">${s.roll_number || ""}</td>
        <td style="border: 1px solid #002818; padding: 8px 6px; text-align: left; font-weight: bold;">${s.full_name_en}</td>
        <td style="border: 1px solid #002818; padding: 8px 6px; font-mono">${s.id}</td>
        ${subjectCols}
        <td style="border: 1px solid #002818; padding: 8px 6px;"></td>
      </tr>
    `;
  }).join("");

  const logoHtml = branch?.logo_url 
    ? `<img src="${branch.logo_url}" loading="lazy" style="max-height: 60px; margin-bottom: 5px;" alt="Logo" />`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>পরীক্ষার ফাঁকা নম্বরপত্র শিট</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #002818; }
        .sheet-container { border: 2px solid #004D3A; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #004D3A; padding-bottom: 10px; margin-bottom: 20px; position: relative; }
        .table-data { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
        .table-data th { background: #004D3A; color: white; padding: 8px 6px; border: 1px solid #002818; }
        @media print {
          body { padding: 0; }
          .sheet-container { border: none; }
          .table-data th { background-color: #004D3A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="sheet-container">
        <div class="header">
          ${logoHtml}
          <h1 style="margin: 0; font-size: 20px;">${instNameBn}</h1>
          <h2 style="margin: 5px 0 0; font-size: 14px; color: #004D3A;">পরীক্ষার ফাঁকা নম্বরপত্র শিট (Blank Marks Entry Sheet)</h2>
          <p style="margin: 5px 0 0; font-size: 12px;">
            শাখা: <strong>${branch?.name_bn || branch?.name_en || ""}</strong> | শ্রেণি: <strong>${className}</strong> | মোট শিক্ষার্থী: <strong>${studentsList.length} জন</strong>
          </p>
        </div>
        <table class="table-data">
          <thead>
            <tr>
              <th style="border: 1px solid #002818; width: 4%;">SL</th>
              <th style="border: 1px solid #002818; width: 6%;">রোল</th>
              <th style="border: 1px solid #002818; width: 22%; text-align: left;">শিক্ষার্থীর নাম</th>
              <th style="border: 1px solid #002818; width: 8%;">আইডি</th>
              ${subjectHeaders}
              <th style="border: 1px solid #002818; width: 12%;">মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            ${resultRows}
          </tbody>
        </table>
        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #888;">
          <span>শিট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}</span>
          <span>রহমানিয়া ইনস্টিটিউট ম্যানেজমেন্ট স্যুট</span>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.open("text/html", "replace");
  printWindow.document.write(html);
  printWindow.document.close();
}

// ────────────────────────────────────────────────────────
// Exam Form Component (Creates/Updates an Exam)
// ────────────────────────────────────────────────────────
function ExamForm({ exam, branches, onSave, onCancel, currentUser }) {
  const [form, setForm] = useState({
    title: exam?.title || "",
    exam_type: exam?.exam_type || EXAM_TYPE_OPTIONS[0],
    academic_year: exam?.academic_year || new Date().getFullYear().toString(),
    start_date: exam?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: exam?.end_date || format(new Date(), "yyyy-MM-dd"),
    result_publish_date: exam?.result_publish_date || format(new Date(), "yyyy-MM-dd"),
    is_active: exam?.is_active ?? true,
    branch_id: exam?.branch_id ? String(exam.branch_id) : (currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : ""),
    class_id: exam?.class_id || "",
    session_id: exam?.session_id || "",
    class_group_id: exam?.class_group_id || "",
  });
  
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [saving, setSaving] = useState(false);
  
  const selectedBranch = branches.find(b => String(b.id) === String(form.branch_id));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  
  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleClassToggle = (id) => {
    setSelectedClassIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAllClassesToggle = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map(c => c.id));
    }
  };

  return (
    <form onSubmit={async e => {
      e.preventDefault();
      if (!form.branch_id) {
        return toast.error("Please select a Branch");
      }
      if (!form.class_id) {
        return toast.error("Please select a Class");
      }
      
      const currentClass = classes.find(c => String(c.id) === String(form.class_id));
      if (currentClass) {
        const hasSessions = Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
        const hasGroups = Array.isArray(currentClass.groups) && currentClass.groups.length > 0;

        if (hasSessions && !form.session_id) {
          return toast.error("Please select a Class Session (Section)");
        }
        if (hasGroups && !form.class_group_id) {
          return toast.error("Please select a Group");
        }
      }
      
      setSaving(true);
      try {
        const payload = {
          ...form,
          branch_id: Number(form.branch_id),
          is_active: form.is_active === true || String(form.is_active) === "true",
          session: classes.find(c => c.id === form.class_id)?.class_name?.en || classes.find(c => c.id === form.class_id)?.class_name?.bn || "", // sync legacy session
          total_marks: 100 // fallback
        };
        await onSave(payload);
      } catch (err) {
        toast.error(err.message || "Failed to save exam");
      } finally {
        setSaving(false);
      }
    }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Name (English/Bengali) *</label>
          <Input value={form.title} onChange={e => updateForm("title", e.target.value)} required placeholder="e.g. Annual Examination - 2026" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Type *</label>
          <Select value={form.exam_type} onValueChange={v => updateForm("exam_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXAM_TYPE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Branch *</label>
          <Select value={form.branch_id} onValueChange={v => { updateForm("branch_id", v); updateForm("class_id", ""); setSelectedClassIds([]); }} disabled={currentUser?.role === "branch_admin"}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Class *</label>
          <Select value={form.class_id} onValueChange={v => { updateForm("class_id", v); updateForm("session_id", ""); updateForm("class_group_id", ""); }} disabled={!form.branch_id}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => {
                const label = c.class_name?.bn || c.class_name?.en || c.class_name || "";
                return <SelectItem key={c.id} value={String(c.id)}>{label}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        {(() => {
          const currentClass = classes.find(c => String(c.id) === String(form.class_id));
          const hasSessions = currentClass && Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
          if (!hasSessions) return null;
          return (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class Session (Section) *</label>
              <Select value={form.session_id} onValueChange={v => updateForm("session_id", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                <SelectContent>
                  {currentClass.sections.map(sec => {
                    const label = sec.section_name?.bn || sec.section_name?.en || sec.section?.bn || sec.section?.en || "";
                    return <SelectItem key={sec.id} value={String(sec.id)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          );
        })()}
        {(() => {
          const currentClass = classes.find(c => String(c.id) === String(form.class_id));
          const hasGroups = currentClass && Array.isArray(currentClass.groups) && currentClass.groups.length > 0;
          if (!hasGroups) return null;
          return (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class Session Group *</label>
              <Select value={form.class_group_id} onValueChange={v => updateForm("class_group_id", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                <SelectContent>
                  {currentClass.groups.map(grp => {
                    const label = grp.group_name?.bn || grp.group_name?.en || "";
                    return <SelectItem key={grp.id} value={String(grp.id)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          );
        })()}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Academic Year *</label>
          <Input 
            type="text" 
            value={form.academic_year || ""} 
            onChange={e => updateForm("academic_year", e.target.value)} 
            placeholder="e.g. 2026"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
          <Select value={form.is_active ? "Active" : "Inactive"} onValueChange={v => updateForm("is_active", v === "Active")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Start Date</label>
          <Input type="date" value={form.start_date} onChange={e => updateForm("start_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam End Date</label>
          <Input type="date" value={form.end_date} onChange={e => updateForm("end_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Result Publish Date</label>
          <Input type="date" value={form.result_publish_date} onChange={e => updateForm("result_publish_date", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#052E2B] hover:bg-[#031c1a] text-white" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {exam ? "Update Exam" : "Create Exam"}
        </Button>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────
// ExamResultEntry (Wizard Steps 1-5 & Recalculation)
// ────────────────────────────────────────────────────────
function ExamResultEntry({ branches, exams, students, settings, currentUser }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  // Selection states
  const [selBranchId, setSelBranchId] = useState("");

  React.useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      setSelBranchId(String(currentUser.branch_id));
    }
  }, [currentUser]);
  const [selClassId, setSelClassId] = useState("");
  const [selGroupId, setSelGroupId] = useState("all");
  const [selExamId, setSelExamId] = useState("");
  const [selStudentId, setSelStudentId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFilterText, setStudentFilterText] = useState("");
  
  React.useEffect(() => {
    setSelGroupId("all");
  }, [selClassId]);

  // Subject-wise entry states
  const [entryMode, setEntryMode] = useState("student");
  const [selSubjectId, setSelSubjectId] = useState("");
  const [subjectStudentsMarks, setSubjectStudentsMarks] = useState([]);
  const [subjectSearchText, setSubjectSearchText] = useState("");
  
  // Marks state
  const [marksDetails, setMarksDetails] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Dynamic lists
  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  const flatClassOptions = React.useMemo(() => getFlatClassOptions(classes), [classes]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === selClassId);
  const classIdForExams = selectedFlatClass?.classId || selClassId; // class-level ID for exam matching
  const subjects = selectedFlatClass?.subjects || [];
  
  const groupOptions = React.useMemo(() => {
    if (!selClassId) return [];
    if (selectedFlatClass) {
      const classObj = classes.find(c => String(c.id) === String(selectedFlatClass.classId));
      if (classObj && Array.isArray(classObj.groups)) {
        return classObj.groups.map(g => ({
          value: String(g.id),
          label: g.group_name?.bn || g.group_name?.en || String(g.id)
        }));
      }
    }
    return [];
  }, [selectedFlatClass, classes, selClassId]);

  // Filter exams for this branch and class (exams store class-level ID)
  const classExams = exams.filter(e => String(e.branch_id) === String(selBranchId) && String(e.class_id) === String(classIdForExams));
  const selectedExam = classExams.find(e => String(e.id) === String(selExamId));
  
  // Filter students in this class/branch using central logic and group selector
  const classStudents = students.filter(s => {
    if (String(s.branch_id) !== String(selBranchId)) return false;
    if (selectedExam) {
      const examOptionId = selectedExam.session_id || selectedExam.class_id;
      if (!isStudentInClassOption(s, examOptionId, selectedBranch?.academic_structure)) return false;
      if (selectedExam.class_group_id && String(s.class_group_id) !== String(selectedExam.class_group_id)) return false;
      return true;
    } else {
      if (!isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure)) return false;
      if (selGroupId !== "all" && String(s.class_group_id) !== String(selGroupId)) return false;
      return true;
    }
  });
  const selectedStudent = classStudents.find(s => String(s.id) === String(selStudentId));
  const selectedSubject = subjects.find(s => String(s.id) === String(selSubjectId));

  // Query existing results for the selected exam only
  const { data: existingResults = [] } = useQuery({
    queryKey: ["exam-results", selExamId],
    queryFn: () => {
      if (!selExamId) return [];
      return appClient.entities.ExamResult.filter({ exam_id: Number(selExamId) });
    },
    enabled: !!selExamId,
  });

  const existingResult = existingResults.find(r => String(r.student_id) === String(selStudentId));

  // Split students into those with/without existing results for the selected exam
  const studentsWithResults = React.useMemo(() => {
    if (!selExamId || existingResults.length === 0) return [];
    const resultStudentIds = new Set(existingResults.map(r => String(r.student_id)));
    return classStudents.filter(s => resultStudentIds.has(String(s.id)));
  }, [classStudents, existingResults, selExamId]);

  const studentsWithoutResults = React.useMemo(() => {
    if (!selExamId || existingResults.length === 0) return classStudents;
    const resultStudentIds = new Set(existingResults.map(r => String(r.student_id)));
    return classStudents.filter(s => !resultStudentIds.has(String(s.id)));
  }, [classStudents, existingResults, selExamId]);

  useEffect(() => {
    setStudentFilterText("");
    setSubjectSearchText("");
  }, [selExamId, isEditMode, selClassId, entryMode]);

  const filteredStudentsWithResults = React.useMemo(() => {
    if (!studentFilterText.trim()) return studentsWithResults;
    const q = studentFilterText.toLowerCase().trim();
    return studentsWithResults.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [studentsWithResults, studentFilterText]);

  const filteredStudentsWithoutResults = React.useMemo(() => {
    if (!studentFilterText.trim()) return studentsWithoutResults;
    const q = studentFilterText.toLowerCase().trim();
    return studentsWithoutResults.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [studentsWithoutResults, studentFilterText]);

  const filteredClassStudents = React.useMemo(() => {
    if (!studentFilterText.trim()) return classStudents;
    const q = studentFilterText.toLowerCase().trim();
    return classStudents.filter(s => 
      (s.full_name_en || "").toLowerCase().includes(q) ||
      (s.full_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.id || "").includes(q)
    );
  }, [classStudents, studentFilterText]);

  // Load subject fields or multiple students' marks when step/selections change
  useEffect(() => {
    if (step === 5 && selectedFlatClass) {
      if (entryMode === "student") {
        if (existingResult && Array.isArray(existingResult.marks_details)) {
          setMarksDetails(existingResult.marks_details);
          setRemarks(existingResult.remarks || "");
        } else {
          const initial = subjects.map(sub => ({
            subject_id: sub.id,
            subject_name: sub.subject_name,
            book_name: sub.book_name,
            full_marks: sub.full_marks || 100,
            pass_marks: sub.pass_marks || 33,
            obtained_marks: ""
          }));
          setMarksDetails(initial);
          setRemarks("");
        }
      } else if (entryMode === "subject" && selectedSubject) {
        // Initialize subjectStudentsMarks for all classStudents
        const initial = classStudents.map(student => {
          // Find existing result for this student in this exam
          const res = existingResults.find(r => String(r.student_id) === String(student.id));
          const existingSubMark = res && Array.isArray(res.marks_details)
            ? res.marks_details.find(m => String(m.subject_id) === String(selSubjectId))
            : null;
          
          return {
            student_id: student.id,
            student_name: student.full_name_en,
            student_name_bn: student.full_name_bn,
            roll_number: student.roll_number,
            class_group_id: student.class_group_id,
            selected: true,
            obtained_marks: existingSubMark && existingSubMark.obtained_marks !== undefined && existingSubMark.obtained_marks !== "" ? String(existingSubMark.obtained_marks) : "",
            is_absent: existingSubMark && existingSubMark.is_absent === true ? true : false,
            existing_result: res || null
          };
        });
        const sorted = [...initial].sort((a, b) => {
          if (a.is_absent !== b.is_absent) return a.is_absent ? 1 : -1;
          return (a.roll_number || '').localeCompare(b.roll_number || '', undefined, { numeric: true });
        });
        setSubjectStudentsMarks(sorted);
      }
    }
  }, [step, selStudentId, selExamId, selClassId, entryMode, selSubjectId, existingResults]);

  const updateObtainedMark = (subId, val) => {
    setMarksDetails(prev => prev.map(m => {
      if (m.subject_id === subId) {
        const num = val === "" ? "" : Math.min(m.full_marks, Math.max(0, Number(val)));
        return { ...m, obtained_marks: num };
      }
      return m;
    }));
  };

  const updateSubjectObtainedMark = (studentId, val) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        const fullMarks = selectedSubject?.full_marks || 100;
        const num = val === "" ? "" : Math.min(fullMarks, Math.max(0, Number(val)));
        return { ...m, obtained_marks: num };
      }
      return m;
    }));
  };

  const toggleStudentSelection = (studentId) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        return { ...m, selected: !m.selected };
      }
      return m;
    }));
  };

  const toggleAllStudentsSelection = (checked) => {
    setSubjectStudentsMarks(prev => prev.map(m => ({ ...m, selected: checked })));
  };

  const toggleStudentAbsent = (studentId) => {
    setSubjectStudentsMarks(prev => prev.map(m => {
      if (String(m.student_id) === String(studentId)) {
        const newAbsent = !m.is_absent;
        return { ...m, is_absent: newAbsent, obtained_marks: newAbsent ? "" : m.obtained_marks };
      }
      return m;
    }));
  };

  const filteredSubjectStudentsMarks = React.useMemo(() => {
    if (!subjectSearchText.trim()) return subjectStudentsMarks;
    const q = subjectSearchText.toLowerCase().trim();
    return subjectStudentsMarks.filter(s => 
      (s.student_name || "").toLowerCase().includes(q) ||
      (s.student_name_bn || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      String(s.student_id).includes(q)
    );
  }, [subjectStudentsMarks, subjectSearchText]);

  // ─── Print Subject Marksheet ─────────────────────────────────
  const printSubjectMarksheet = () => {
    const logoUrl = settings?.logo_url || DEFAULT_LOGO;
    const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";

    const rowsHtml = subjectStudentsMarks.map((s, idx) => {
      const groupName = (() => {
        if (!s?.class_group_id || !selectedBranch?.academic_structure) return "";
        for (const c of selectedBranch.academic_structure) {
          if (c.groups) {
            const g = c.groups.find(grp => String(grp.id) === String(s.class_group_id));
            if (g) return g.group_name?.bn || g.group_name?.en || "";
          }
        }
        return "";
      })();

      const marksDisplay = s.is_absent
        ? '<span style="color: #dc2626; font-weight: 700;">Absent</span>'
        : s.obtained_marks !== ""
          ? `<span style="font-weight: 600;">${s.obtained_marks}</span>`
          : '<span style="color: #94a3b8;">—</span>';
      const absentBadge = s.is_absent
        ? '<span style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700;">Absent</span>'
        : '';
      return `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center; font-weight: 600; color: #475569;">${idx + 1}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center; font-family: monospace; font-weight: 600; color: #475569;">${s.roll_number || ''}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; font-weight: 600; color: #1e293b;">
            ${s.student_name}${s.student_name_bn ? ` <span style="color: #64748b; font-weight: 400; font-size: 11px;">(${s.student_name_bn})</span>` : ''}
            ${groupName ? `<br/><span style="font-size: 9px; color: #64748b; font-weight: 500;">Group: ${groupName}</span>` : ''}
          </td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${marksDisplay}</td>
          <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${absentBadge}</td>
        </tr>
      `;
    }).join("");

    const totalStudents = subjectStudentsMarks.length;
    const presentCount = subjectStudentsMarks.filter(s => !s.is_absent).length;
    const absentCount = subjectStudentsMarks.filter(s => s.is_absent).length;
    const printDate = format(new Date(), "dd/MM/yyyy hh:mm a");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Subject Marksheet - ${selectedSubject?.subject_name?.en || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; }
          .page { width: 210mm; min-height: 297mm; padding: 15mm 12mm; margin: 0 auto; }
          .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #052E2B; padding-bottom: 14px; margin-bottom: 18px; }
          .logo-wrap { width: 65px; height: 65px; border: 2px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
          .logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
          .header-text { flex: 1; }
          .inst-name-bn { font-size: 20px; font-weight: 700; color: #052E2B; }
          .inst-name-en { font-size: 13px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 0.5px; }
          .header-details { font-size: 11px; color: #64748b; margin-top: 4px; }
          .header-details strong { color: #1e293b; }
          .title-section { text-align: center; margin-bottom: 16px; }
          .title-section h2 { font-size: 16px; font-weight: 700; color: #052E2B; margin-bottom: 2px; }
          .title-section p { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
          th { background: #052E2B; color: white; padding: 8px 10px; border: 1px solid #052E2B; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 6px 10px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background: #f8fafc; }
          .summary-bar { display: flex; gap: 20px; font-size: 11px; color: #475569; margin-bottom: 16px; padding: 10px 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; }
          .summary-bar span { font-weight: 700; color: #1e293b; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 12mm 10mm; }
            th { background: #052E2B !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo-wrap">
              <img src="${logoUrl}" loading="lazy" alt="Logo" />
            </div>
            <div class="header-text">
              <div class="inst-name-bn">${instNameBn}</div>
              <div class="inst-name-en">${instNameEn}</div>
              <div class="header-details">
                Branch: <strong>${selectedBranch?.name_bn || selectedBranch?.name_en || ''}</strong> | 
                Class: <strong>${selectedFlatClass?.label || ''}</strong> | 
                Exam: <strong>${selectedExam?.title || ''}</strong>
              </div>
            </div>
          </div>

          <div class="title-section">
            <h2>Subject Marks Sheet</h2>
            <p>
              <strong>${selectedSubject?.subject_name?.bn || selectedSubject?.subject_name?.en || selectedSubject?.subject_name || ''}</strong> | 
              Full Marks: ${selectedSubject?.full_marks || 100} | 
              Pass Marks: ${selectedSubject?.pass_marks || 33} |
              Academic Year: ${selectedExam?.academic_year || 'N/A'}
            </p>
          </div>

          <div class="summary-bar">
            Total Students: <span>${totalStudents}</span> | 
            Present: <span>${presentCount}</span> | 
            Absent: <span>${absentCount}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 6%;">Sl</th>
                <th style="width: 10%;">Roll</th>
                <th style="width: 48%; text-align: left;">Student Name</th>
                <th style="width: 18%;">Marks</th>
                <th style="width: 18%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Print Date: ${printDate}</span>
            <span>Generated by Rahmania Institute Management System</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return toast.error("Please allow pop-ups to print");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // ─── Keyboard Navigation & Row Highlight for Subject-wise Entry ─
  const [focusedStudentId, setFocusedStudentId] = React.useState(null);
  const marksInputRefs = React.useRef({});

  const registerMarksInput = (studentId) => (el) => {
    const key = String(studentId);
    if (el) {
      marksInputRefs.current[key] = el;
    } else {
      delete marksInputRefs.current[key];
    }
  };

  const focusMarksInput = (studentId) => {
    const inp = marksInputRefs.current[String(studentId)];
    if (inp) {
      setFocusedStudentId(String(studentId));
      inp.focus();
      inp.select();
    }
  };

  const handleMarksFocus = (studentId) => {
    setFocusedStudentId(String(studentId));
  };

  const handleMarksKeyDown = (e, studentId, index) => {
    const students = filteredSubjectStudentsMarks;

    if (e.key === 'Enter' || (e.key === 'ArrowDown' && !e.shiftKey && !e.altKey && !e.metaKey)) {
      e.preventDefault();
      if (index < students.length - 1) {
        focusMarksInput(students[index + 1].student_id);
      } else {
        // Focus Save button if on last student
        const saveBtn = document.querySelector('#subject-save-btn');
        if (saveBtn) saveBtn.focus();
      }
    } else if (e.key === 'ArrowUp' && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      if (index > 0) {
        focusMarksInput(students[index - 1].student_id);
      }
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      toggleStudentAbsent(studentId);
      // Refocus marks input after toggle
      setTimeout(() => focusMarksInput(studentId), 0);
    }
  };

  const handleMarksBlur = () => {
    // Delay clearing to allow focus to move within the same row
    setTimeout(() => setFocusedStudentId(null), 150);
  };

  const handleAbsentKeyDown = (e, studentId) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleStudentAbsent(studentId);
    }
  };

  // Auto-focus first marks input when subject-wise entry loads
  React.useEffect(() => {
    if (step === 5 && entryMode === "subject" && selectedSubject && subjectStudentsMarks.length > 0) {
      const timer = setTimeout(() => {
        const firstPresent = subjectStudentsMarks.find(s => !s.is_absent);
        if (firstPresent) {
          focusMarksInput(firstPresent.student_id);
          setFocusedStudentId(String(firstPresent.student_id));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step, entryMode, selSubjectId, selClassId]);

  // Calculations in UI
  const totalFullMarks = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
  const totalObtainedMarks = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
  const pct = totalFullMarks > 0 ? (totalObtainedMarks / totalFullMarks) * 100 : 0;
  
  const isFailed = marksDetails.some(m => {
    if (m.obtained_marks === "") return true;
    return Number(m.obtained_marks) < Number(m.pass_marks);
  });
  
  const totalGpaPoints = marksDetails.reduce((sum, m) => {
    if (m.obtained_marks === "") return sum;
    const { gpa } = calcSubjectGradeAndGPA(Number(m.obtained_marks), Number(m.full_marks));
    return sum + gpa;
  }, 0);
  
  const averageGpa = marksDetails.length > 0 ? totalGpaPoints / marksDetails.length : 0;
  const overallGrade = calcOverallGrade(averageGpa, isFailed);
  const passStatus = isFailed ? "fail" : "pass";

  const handleSaveMarks = async () => {
    // Validate all marks are entered
    const incomplete = marksDetails.some(m => m.obtained_marks === "");
    if (incomplete) {
      return toast.error("Please enter obtained marks for all subjects");
    }

    setSaving(true);
    try {
      const payload = {
        exam_id: Number(selExamId),
        student_id: Number(selStudentId),
        branch_id: Number(selBranchId),
        class_id: selClassId,
        marks_details: marksDetails,
        obtained_marks: totalObtainedMarks,
        remarks: remarks,
        is_published: "Y"
      };

      if (existingResult) {
        await appClient.entities.ExamResult.update(existingResult.id, payload);
      } else {
        await appClient.entities.ExamResult.create(payload);
      }

      // Automatically recalculate ranks for this class/exam
      await recalculateMeritRanks(Number(selExamId), selClassId);

      toast.success("Marks saved and merit ranks updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["exam-results", selExamId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-results"] });
      
      // Go back to student selection to enter next student
      setSelStudentId("");
      setIsEditMode(false);
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Failed to save exam marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubjectMarks = async () => {
    const selectedList = subjectStudentsMarks.filter(s => s.selected);
    if (selectedList.length === 0) {
      return toast.error("Please select at least one student");
    }
    // Only validate marks for present (non-absent) students
    const presentStudents = selectedList.filter(s => !s.is_absent);
    const incomplete = presentStudents.some(s => s.obtained_marks === "");
    if (incomplete) {
      return toast.error("Please enter obtained marks for all present students");
    }

    setSaving(true);
    try {
      for (const item of selectedList) {
        let updatedMarksDetails = [];
        let totalObt = 0;

        if (item.existing_result) {
          const existingDetails = Array.isArray(item.existing_result.marks_details) ? item.existing_result.marks_details : [];
          let found = false;
          updatedMarksDetails = existingDetails.map(m => {
            if (String(m.subject_id) === String(selSubjectId)) {
              found = true;
              if (item.is_absent) {
                return { ...m, obtained_marks: null, is_absent: true };
              }
              return { ...m, obtained_marks: item.obtained_marks !== "" ? Number(item.obtained_marks) : "" };
            }
            return m;
          });
          if (!found && selectedSubject) {
            updatedMarksDetails.push({
              subject_id: selectedSubject.id,
              subject_name: selectedSubject.subject_name,
              book_name: selectedSubject.book_name,
              full_marks: selectedSubject.full_marks || 100,
              pass_marks: selectedSubject.pass_marks || 33,
              obtained_marks: item.is_absent ? null : (item.obtained_marks !== "" ? Number(item.obtained_marks) : ""),
              ...(item.is_absent ? { is_absent: true } : {})
            });
          }
          totalObt = updatedMarksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);

          const payload = {
            ...item.existing_result,
            marks_details: updatedMarksDetails,
            obtained_marks: totalObt,
          };
          delete payload.total_full_marks;
          delete payload.total_obtained_marks;
          delete payload.gpa;
          delete payload.grade;
          delete payload.status;

          await appClient.entities.ExamResult.update(item.existing_result.id, payload);
        } else {
          updatedMarksDetails = subjects.map(sub => {
            const isTarget = String(sub.id) === String(selSubjectId);
            return {
              subject_id: sub.id,
              subject_name: sub.subject_name,
              book_name: sub.book_name,
              full_marks: sub.full_marks || 100,
              pass_marks: sub.pass_marks || 33,
              obtained_marks: isTarget && item.is_absent ? null : (isTarget && item.obtained_marks !== "" ? Number(item.obtained_marks) : ""),
              ...(isTarget && item.is_absent ? { is_absent: true } : {})
            };
          });
          totalObt = item.is_absent ? 0 : (item.obtained_marks !== "" ? Number(item.obtained_marks) : 0);

          const payload = {
            exam_id: Number(selExamId),
            student_id: Number(item.student_id),
            branch_id: Number(selBranchId),
            class_id: selClassId,
            marks_details: updatedMarksDetails,
            obtained_marks: totalObt,
            remarks: "",
            is_published: "Y"
          };
          await appClient.entities.ExamResult.create(payload);
        }
      }

      await recalculateMeritRanks(Number(selExamId), selClassId);

      toast.success("Marks saved and merit ranks updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["exam-results", selExamId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-results"] });

      setSelSubjectId("");
      setSubjectSearchText("");
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Failed to save exam marks");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selBranchId) return toast.error("Please select a Branch");
    if (step === 2 && !selClassId) return toast.error("Please select a Class");
    if (step === 3) {
      if (!selExamId) return toast.error("Please select an Exam");
      if (entryMode === "student" && !selStudentId) return toast.error("Please select a Student");
      if (entryMode === "subject" && !selSubjectId) return toast.error("Please select a Subject");
    }
    setStep(p => p + 1);
  };

  const prevStep = () => setStep(p => p - 1);

  return (
    <div className="space-y-6">
      {/* Wizard Header Progress Indicator */}
      <div className="flex justify-between items-center max-w-xl mx-auto py-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => { if (s < step) setStep(s); }}
              disabled={s > step}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step 
                  ? "bg-[#052E2B] text-yellow-400 border-2 border-yellow-400 shadow-md scale-110" 
                  : s < step 
                  ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700" 
                  : "bg-gray-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {s}
            </button>
            {s < 5 && <div className={`h-1 w-12 sm:w-16 ${s < step ? "bg-emerald-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="border border-slate-100 bg-white rounded-3xl p-6 shadow-sm max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-base font-bold text-[#052E2B]">Step 1: Select Branch</h3>
              <p className="text-xs text-slate-500">Choose the branch to enter marks for.</p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Branch Name *</label>
                  <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId(""); setSelExamId(""); setSelStudentId(""); setIsEditMode(false); }} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-base font-bold text-[#052E2B]">Step 2: Select Class</h3>
              <p className="text-xs text-slate-500">Showing classes configured for {selectedBranch?.name_bn || selectedBranch?.name_en}</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Class *</label>
                  <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId(""); setSelStudentId(""); setSelSubjectId(""); setIsEditMode(false); }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {flatClassOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {flatClassOptions.length === 0 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No classes found in this branch. Configure classes in Branch Manager.</p>
                  )}
                </div>

                {groupOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Group</label>
                    <Select value={selGroupId} onValueChange={setSelGroupId}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব গ্রুপ (All Groups)</SelectItem>
                        {groupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6" disabled={!selClassId}>Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 3: Select Exam & Student/Subject</h3>
                  <p className="text-xs text-slate-500">Choose exam and then select student or subject to enter marks.</p>
                </div>
                {classStudents.length > 0 && entryMode === "student" && (
                  <Button
                    type="button"
                    onClick={() => printBlankMarksheet(selectedBranch, selectedFlatClass?.label || "Class", subjects, classStudents)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl px-4 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Blank Marks Sheet
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Exam Name *</label>
                  <Select value={selExamId} onValueChange={v => { setSelExamId(v); setSelStudentId(""); setSelSubjectId(""); setIsEditMode(false); }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>
                      {classExams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {classExams.length === 0 && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No exams created for this Class yet. Please add an Exam first.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Entry Type</label>
                  <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg p-1 border">
                    <button
                      type="button"
                      onClick={() => { setEntryMode("student"); setSelSubjectId(""); setSelStudentId(""); }}
                      className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${entryMode === "student" ? "bg-white text-[#052E2B] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEntryMode("subject"); setSelStudentId(""); setSelSubjectId(""); }}
                      className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${entryMode === "subject" ? "bg-white text-[#052E2B] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Subject
                    </button>
                  </div>

                  {entryMode === "student" ? (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-600">Student *</label>
                      {selExamId ? (
                        <>
                          {/* Mode toggle: New Entry vs Edit Existing */}
                          {(studentsWithResults.length > 0 || studentsWithoutResults.length > 0) && classStudents.length > 0 && (
                            <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg p-1 border">
                              <button
                                type="button"
                                onClick={() => { setIsEditMode(false); setSelStudentId(""); }}
                                disabled={studentsWithoutResults.length === 0}
                                className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${!isEditMode ? "bg-white text-[#052E2B] shadow-sm" : studentsWithoutResults.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                New Entry {studentsWithoutResults.length > 0 && `(${studentsWithoutResults.length})`}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setIsEditMode(true); setSelStudentId(""); }}
                                disabled={studentsWithResults.length === 0}
                                className={`flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-md transition-all ${isEditMode ? "bg-white text-[#052E2B] shadow-sm" : studentsWithResults.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                              >
                                Edit Existing {studentsWithResults.length > 0 && `(${studentsWithResults.length})`}
                              </button>
                            </div>
                          )}
                          {/* Search Student Input */}
                          {((isEditMode && studentsWithResults.length > 0) || (!isEditMode && studentsWithoutResults.length > 0)) && (
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search student by Name or Roll..."
                                value={studentFilterText}
                                onChange={e => setStudentFilterText(e.target.value)}
                                className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                              />
                            </div>
                          )}
                          {isEditMode ? (
                            studentsWithResults.length > 0 ? (
                              <Select value={selStudentId} onValueChange={setSelStudentId}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select student to edit" /></SelectTrigger>
                                <SelectContent>
                                  {filteredStudentsWithResults.length === 0 ? (
                                    <SelectItem value="_none" disabled>No matching students</SelectItem>
                                  ) : (
                                    filteredStudentsWithResults.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No existing results found for this exam.</p>
                            )
                          ) : (
                            studentsWithoutResults.length > 0 ? (
                              <Select value={selStudentId} onValueChange={setSelStudentId}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Student" /></SelectTrigger>
                                <SelectContent>
                                  {filteredStudentsWithoutResults.length === 0 ? (
                                    <SelectItem value="_none" disabled>No matching students</SelectItem>
                                  ) : (
                                    filteredStudentsWithoutResults.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-xs text-emerald-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> All students already have results for this exam. Switch to Edit Existing to update marks.</p>
                            )
                          )}
                        </>
                      ) : (
                        <>
                          {classStudents.length > 0 && (
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search student by Name or Roll..."
                                value={studentFilterText}
                                onChange={e => setStudentFilterText(e.target.value)}
                                className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                              />
                            </div>
                          )}
                          <Select value={selStudentId} onValueChange={setSelStudentId}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Student" /></SelectTrigger>
                            <SelectContent>
                              {filteredClassStudents.length === 0 ? (
                                <SelectItem value="_none" disabled>No matching students</SelectItem>
                              ) : (
                                filteredClassStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name_en} (Roll: {s.roll_number})</SelectItem>)
                              )}
                            </SelectContent>
                          </Select>
                          {classStudents.length === 0 && (
                            <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No students registered in this class. Set students&apos; Class in Student Manager.</p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-600">Subject *</label>
                      <Select value={selSubjectId} onValueChange={setSelSubjectId}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects.length === 0 ? (
                            <SelectItem value="_none" disabled>No subjects configured</SelectItem>
                          ) : (
                            subjects.map(sub => (
                              <SelectItem key={sub.id} value={String(sub.id)}>
                                {sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {subjects.length === 0 && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No subjects created for this Class yet. Please configure subjects in Courses & Subjects.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                <Button 
                  onClick={nextStep} 
                  className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6" 
                  disabled={!selExamId || (entryMode === "student" ? !selStudentId : !selSubjectId)}
                >
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {entryMode === "student" && selectedStudent ? (
                <>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 4: Student Profile Preview</h3>
                  <div className="bg-[#FAF8F5] border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Student Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedStudent.full_name_en} ({selectedStudent.full_name_bn || ""})</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Student ID / Roll</p>
                      <p className="text-sm font-bold text-slate-800 font-mono">#{selectedStudent.roll_number || selectedStudent.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Branch</p>
                      <p className="text-sm font-bold text-slate-800">{selectedBranch?.name_en}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Class / Section</p>
                      <p className="text-sm font-bold text-slate-800">{selectedFlatClass?.class_name?.en || selectedStudent.class_name} ({selectedFlatClass?.section_name?.bn || "A"})</p>
                    </div>
                  </div>
                  {existingResult && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span><strong>Notice:</strong> Results already exist for this student in this exam. Continuing will update the existing marksheet.</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Enter Marks →</Button>
                  </div>
                </>
              ) : entryMode === "subject" && selectedSubject ? (
                <>
                  <h3 className="text-base font-bold text-[#052E2B]">Step 4: Subject & Class Preview</h3>
                  <div className="bg-[#FAF8F5] border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Subject Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedSubject.subject_name?.bn || selectedSubject.subject_name?.en || selectedSubject.subject_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Class / Section</p>
                      <p className="text-sm font-bold text-slate-800">{selectedFlatClass?.label || "Class"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Branch</p>
                      <p className="text-sm font-bold text-slate-800">{selectedBranch?.name_en}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Exam</p>
                      <p className="text-sm font-bold text-slate-800">{selectedExam?.title}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={nextStep} className="bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-11 px-6">Enter Marks →</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500">Incomplete selection. Please go back.</div>
              )}
            </motion.div>
          )}

          {step === 5 && selectedExam && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              {entryMode === "student" && selectedStudent ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-[#052E2B]">{selectedExam.title} Result Entry</h3>
                    <p className="text-xs text-slate-500">Student: <strong>{selectedStudent.full_name_en}</strong> | Roll: <strong>#{selectedStudent.roll_number}</strong></p>
                  </div>

                  {/* Subject Wise Inputs */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Subject</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Full Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Pass Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Obtained Marks</th>
                          <th className="text-center py-3 px-4 text-slate-500 uppercase tracking-wider font-bold">Grade / GP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marksDetails.map((sub) => {
                          const isSubFailed = sub.obtained_marks !== "" && Number(sub.obtained_marks) < Number(sub.pass_marks);
                          const { grade, gpa } = calcSubjectGradeAndGPA(Number(sub.obtained_marks), Number(sub.full_marks));
                          return (
                            <tr key={sub.subject_id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-slate-800">
                                {sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}
                              </td>
                              <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{sub.full_marks}</td>
                              <td className="py-3.5 px-4 text-center font-semibold text-red-500/80">{sub.pass_marks}</td>
                              <td className="py-3.5 px-4 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={sub.full_marks}
                                  value={sub.obtained_marks}
                                  onChange={e => updateObtainedMark(sub.subject_id, e.target.value)}
                                  className="w-24 mx-auto text-center h-9 font-bold border-slate-200 focus:border-[#052E2B] rounded-lg"
                                  placeholder="0"
                                  required
                                />
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {sub.obtained_marks !== "" ? (
                                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                    isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                  }`}>
                                    {isSubFailed ? "F" : grade} ({isSubFailed ? "0.00" : gpa.toFixed(2)})
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Remarks Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Teacher Remarks (Optional)</label>
                    <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Excellent performance, keep it up!" className="rounded-xl h-11" />
                  </div>

                  {/* Calculations Preview Summary Card */}
                  <div className="bg-[#052E2B]/5 border border-[#052E2B]/10 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Calculations Summary (Real-time Preview)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Obtained</p>
                        <p className="text-lg font-extrabold text-[#052E2B]">{totalObtainedMarks} <span className="text-xs font-medium text-slate-400">/ {totalFullMarks}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">GPA Point</p>
                        <p className="text-lg font-extrabold text-[#052E2B]" style={isFailed ? { color: "red" } : {}}>{isFailed ? "0.00" : averageGpa.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Overall Grade</p>
                        <p className="text-lg font-extrabold text-[#052E2B]" style={isFailed ? { color: "red" } : {}}>{isFailed ? "F" : overallGrade}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Pass / Fail Status</p>
                        <Badge className={`h-6 text-xs uppercase font-extrabold ${isFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isFailed ? "Failed" : "Passed"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button onClick={handleSaveMarks} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 px-8 font-bold" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {existingResult ? "Update Result" : "Save Result"}
                    </Button>
                  </div>
                </>
              ) : entryMode === "subject" && selectedSubject ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#052E2B]">{selectedExam.title} - Subject-wise Entry</h3>
                      <p className="text-xs text-slate-500">Subject: <strong>{selectedSubject.subject_name?.bn || selectedSubject.subject_name?.en || selectedSubject.subject_name}</strong> | Full Marks: {selectedSubject.full_marks || 100} | Pass Marks: {selectedSubject.pass_marks || 33}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={printSubjectMarksheet}
                        className="bg-[#052E2B] hover:bg-[#031c1a] text-white text-xs h-9 rounded-xl px-4 flex items-center gap-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </Button>
                    </div>
                  </div>

                  {/* Search Student by Roll / Name in Table */}
                  <div className="relative max-w-sm mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student by Name or Roll..."
                      value={subjectSearchText}
                      onChange={e => setSubjectSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Enter</kbd> <span className="text-slate-400">↓</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">↑</kbd><kbd className="font-mono font-bold text-slate-600">↓</kbd> <span className="text-slate-400">Navigate</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Tab</kbd> <span className="text-slate-400">Next field</span></span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded"><kbd className="font-mono font-bold text-slate-600">Ctrl+A</kbd> <span className="text-slate-400">Absent toggle</span></span>
                  </div>

                  {/* Student List Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="py-3 px-4 text-left w-16">
                            <input
                              type="checkbox"
                              checked={subjectStudentsMarks.length > 0 && subjectStudentsMarks.every(s => s.selected)}
                              onChange={e => toggleAllStudentsSelection(e.target.checked)}
                              className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B] h-4 w-4 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Roll No</th>
                          <th className="py-3 px-4 text-left font-bold text-slate-500">Student Name</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Obtained Marks</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Grade / GP</th>
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSubjectStudentsMarks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">No matching students found</td>
                          </tr>
                        ) : (
                          filteredSubjectStudentsMarks.map((student, index) => {
                            const isSubFailed = student.obtained_marks !== "" && Number(student.obtained_marks) < Number(selectedSubject.pass_marks || 33);
                            const { grade, gpa } = calcSubjectGradeAndGPA(Number(student.obtained_marks), Number(selectedSubject.full_marks || 100));
                            return (
                              <tr key={student.student_id} className={`transition-all duration-150 ${
                                String(student.student_id) === focusedStudentId
                                  ? "bg-emerald-50/60 shadow-[inset_0_0_0_1px_rgba(5,46,43,0.08)]"
                                  : "hover:bg-slate-50/80"
                              } ${!student.selected ? "opacity-45 bg-slate-50/30" : ""}`}>
                                <td className="py-3.5 px-4 text-left">
                                  <input
                                    type="checkbox"
                                    checked={student.selected}
                                    onChange={() => toggleStudentSelection(student.student_id)}
                                    className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B] focus-visible:ring-2 focus-visible:ring-[#052E2B] focus-visible:ring-offset-2 h-4 w-4 cursor-pointer outline-none"
                                  />
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{student.roll_number || student.student_id}</td>
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-800">{student.student_name}</p>
                                  {student.student_name_bn && <p className="text-[10px] text-slate-400">{student.student_name_bn}</p>}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {student.is_absent ? (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 inline-block">Absent</span>
                                  ) : (
                                    <Input
                                      ref={registerMarksInput(student.student_id)}
                                      type="number"
                                      min={0}
                                      max={selectedSubject.full_marks || 100}
                                      value={student.obtained_marks}
                                      onChange={e => updateSubjectObtainedMark(student.student_id, e.target.value)}
                                      onKeyDown={e => handleMarksKeyDown(e, student.student_id, index)}
                                      onFocus={() => handleMarksFocus(student.student_id)}
                                      onBlur={handleMarksBlur}
                                      disabled={!student.selected}
                                      className="w-24 mx-auto text-center h-9 font-bold border-2 border-slate-200 focus:border-[#052E2B] focus-visible:ring-[3px] focus-visible:ring-[#052E2B]/30 focus-visible:ring-offset-0 focus-visible:border-[#052E2B] rounded-lg outline-none transition-all duration-150"
                                      placeholder="0"
                                      required={student.selected}
                                    />
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {student.selected && student.obtained_marks !== "" && !student.is_absent ? (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                      isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                      {isSubFailed ? "F" : grade} ({isSubFailed ? "0.00" : gpa.toFixed(2)})
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={student.is_absent}
                                      onChange={() => toggleStudentAbsent(student.student_id)}
                                      onKeyDown={e => handleAbsentKeyDown(e, student.student_id)}
                                      disabled={!student.selected}
                                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 h-4 w-4 cursor-pointer outline-none"
                                      title="Mark as Absent (Ctrl+A when on marks field)"
                                    />
                                    {student.is_absent ? (
                                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">Absent</span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Present</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={prevStep} className="rounded-xl h-11 px-6">← Back</Button>
                    <Button id="subject-save-btn" onClick={handleSaveSubjectMarks} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 px-8 font-bold" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Save Result
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500">Incomplete selection. Please go back.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Admin Result Dashboard
// ────────────────────────────────────────────────────────
function AdminResultDashboard({ branches, exams, students, settings, currentUser }) {
  const [selBranchId, setSelBranchId] = useState("all");

  React.useEffect(() => {
    if (currentUser?.role === "branch_admin" && currentUser.branch_id) {
      setSelBranchId(String(currentUser.branch_id));
    }
  }, [currentUser]);
  const [selClassId, setSelClassId] = useState("all");
  const [selGroupId, setSelGroupId] = useState("all");
  const [selExamId, setSelExamId] = useState("all");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setSelGroupId("all");
  }, [selClassId]);

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["admin-dashboard-results"],
    queryFn: () => appClient.entities.ExamResult.listAll({ sort: "id" }),
  });

  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  const flatClassOptions = React.useMemo(() => getFlatClassOptions(classes), [classes]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === selClassId);
  const classIdForExams = selectedFlatClass?.classId || selClassId; // class-level ID for exam matching
  
  const groupOptions = React.useMemo(() => {
    if (selClassId === "all" || !selectedFlatClass) return [];
    const classObj = classes.find(c => String(c.id) === String(selectedFlatClass.classId));
    if (classObj && Array.isArray(classObj.groups)) {
      return classObj.groups.map(g => ({
        value: String(g.id),
        label: g.group_name?.bn || g.group_name?.en || String(g.id)
      }));
    }
    return [];
  }, [selectedFlatClass, classes, selClassId]);

  // Filter list of exams based on branch and class (exams store class-level ID)
  const filteredExams = exams.filter(e => {
    const bMatch = selBranchId === "all" || String(e.branch_id) === String(selBranchId);
    const cMatch = selClassId === "all" || String(e.class_id) === String(classIdForExams);
    return bMatch && cMatch;
  });

  // Filter students based on selectors (supporting central class filtering and group filtering)
  const filteredStudents = students.filter(s => {
    const bMatch = selBranchId === "all" || String(s.branch_id) === String(selBranchId);
    const cMatch = selClassId === "all" || isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure);
    const gMatch = selGroupId === "all" || String(s.class_group_id) === String(selGroupId);
    return bMatch && cMatch && gMatch;
  });

  // Filter and Enrich results
  const filteredResults = results.map(r => {
    const marksDetails = Array.isArray(r.marks_details) ? r.marks_details : [];
    const tFull = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
    const tObt = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
    
    const isFailed = marksDetails.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
    const totalGpaPoints = marksDetails.reduce((sum, m) => {
      if (m.obtained_marks === "") return sum;
      return sum + calcSubjectGradeAndGPA(Number(m.obtained_marks), Number(m.full_marks)).gpa;
    }, 0);
    const averageGpa = marksDetails.length > 0 ? totalGpaPoints / marksDetails.length : 0;
    const overallGrade = calcOverallGrade(averageGpa, isFailed);
    
    return {
      ...r,
      total_full_marks: tFull,
      total_obtained_marks: tObt,
      gpa: averageGpa,
      grade: overallGrade,
      status: isFailed ? "fail" : "pass"
    };
  }).filter(r => {
    const examMatch = selExamId === "all" || String(r.exam_id) === String(selExamId);
    
    // Find exam details to enforce exact branch/class/section/group matching from the exam object itself
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    if (!examObj) return false;
    
    const branchMatch = selBranchId === "all" || String(r.branch_id) === String(selBranchId) || String(examObj.branch_id) === String(selBranchId);
    
    // Match student details for class, section and group
    const student = students.find(s => String(s.id) === String(r.student_id));
    if (!student) return false;
    
    const branchObj = branches.find(b => String(b.id) === String(student.branch_id));
    
    // Strict match against Exam's own branch, class, section and group!
    const studentExamBranchMatch = String(student.branch_id) === String(examObj.branch_id);
    const examClassOptionId = examObj.session_id || examObj.class_id;
    const studentExamClassMatch = isStudentInClassOption(student, examClassOptionId, branchObj?.academic_structure);
    const studentExamGroupMatch = !examObj.class_group_id || String(student.class_group_id) === String(examObj.class_group_id);
    
    if (!studentExamBranchMatch || !studentExamClassMatch || !studentExamGroupMatch) return false;
    
    // Also apply manual filters if selected
    if (selExamId !== "all" && String(r.exam_id) !== String(selExamId)) return false;
    if (selBranchId !== "all" && String(student.branch_id) !== String(selBranchId)) return false;
    if (selClassId !== "all" && !isStudentInClassOption(student, selClassId, branchObj?.academic_structure)) return false;
    if (selGroupId !== "all" && String(student.class_group_id) !== String(selGroupId)) return false;
    
    if (!examMatch || !branchMatch) return false;
    
    const q = search.toLowerCase().trim();
    if (!q) return true;
    
    return (
      student.full_name_en?.toLowerCase().includes(q) ||
      student.roll_number?.toLowerCase().includes(q) ||
      String(student.id).includes(q)
    );
  }).sort((a, b) => (a.rank || 99) - (b.rank || 99)); // sort by class rank

  // Summary statistics
  const totalEntered = filteredResults.length;
  const passedCount = filteredResults.filter(r => r.status === "pass").length;
  const failedCount = filteredResults.filter(r => r.status === "fail").length;
  const passRate = totalEntered > 0 ? (passedCount / totalEntered) * 100 : 0;
  
  const topPerformers = [...filteredResults]
    .filter(r => r.status === "pass")
    .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
    .slice(0, 5);

  const handleDownloadSheet = () => {
    if (selBranchId === "all" || selClassId === "all" || selExamId === "all") {
      return toast.error("Please select a specific Branch, Class, and Exam to print Class Result Sheet");
    }
    
    const branchObj = branches.find(b => String(b.id) === String(selBranchId));
    const classObj = branchObj?.academic_structure?.find(c => c.id === classIdForExams);
    const examObj = exams.find(e => String(e.id) === String(selExamId));
    
    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(examObj?.class_id, examObj?.session_id, examObj?.class_group_id, structure, 'bn') || 
        selectedFlatClass?.label || 
        "Class";
    })();

    printResultSheet(branchObj, classNameVal, examObj, filteredResults, students, settings);
  };

  const handlePrintIndividual = (r) => {
    const student = students.find(s => String(s.id) === String(r.student_id));
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    const branchObj = branches.find(b => String(b.id) === String(r.branch_id));
    const flatOptions = branchObj ? getFlatClassOptions(branchObj.academic_structure) : [];
    const resultFlatClass = flatOptions.find(o => o.id === r.class_id);
    const resultClassId = resultFlatClass?.classId || r.class_id;
    const classObj = branchObj?.academic_structure?.find(c => c.id === resultClassId);
    
    if (!student || !examObj) return toast.error("Incomplete data for print");

    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, structure, 'bn') || 
        student.class_name || 
        resultFlatClass?.label || 
        classObj?.class_name?.bn || 
        classObj?.class_name?.en || 
        "Class";
    })();

    const html = getPrintableMarksheetHTML(
      student, 
      branchObj, 
      classNameVal, 
      examObj, 
      r, 
      settings
    );

    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Search & Filtering Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Search & Filters</h3>
        <div className={`grid grid-cols-1 ${groupOptions.length > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-3`}>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Branch</label>
            <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId("all"); setSelExamId("all"); }} disabled={currentUser?.role === "branch_admin"}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class / Section</label>
            <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId("all"); }} disabled={selBranchId === "all"}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {flatClassOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {groupOptions.length > 0 && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Group</label>
              <Select value={selGroupId} onValueChange={setSelGroupId}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Exam</label>
            <Select value={selExamId} onValueChange={setSelExamId} disabled={selClassId === "all"}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {filteredExams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Roll/Name..."
                className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Results</span>
          <span className="text-2xl font-extrabold text-[#052E2B]">{totalEntered}</span>
          <span className="text-[10px] text-slate-500 mt-1">Entered Marksheets</span>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Passed Students</span>
          <span className="text-2xl font-extrabold text-emerald-600">{passedCount}</span>
          <span className="text-[10px] text-slate-500 mt-1">Pass Rate: {passRate.toFixed(1)}%</span>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Failed Students</span>
          <span className="text-2xl font-extrabold text-red-600">{failedCount}</span>
          <span className="text-[10px] text-slate-500 mt-1">Failed in one or more papers</span>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Class Position Active</span>
          <span className="text-2xl font-extrabold text-yellow-600 flex items-center gap-1">🏆 Yes</span>
          <span className="text-[10px] text-slate-500 mt-1">Automatic merit ranks configured</span>
        </Card>
      </div>

      {/* Table & Performer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merit List Table */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Results Merit List ({filteredResults.length})</CardTitle>
            {selBranchId !== "all" && selClassId !== "all" && selExamId !== "all" && (
              <Button onClick={handleDownloadSheet} size="sm" className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-9">
                <Printer className="h-4 w-4" /> Print Result Sheet
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {resultsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#052E2B]" /></div>
            ) : filteredResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic">No matching results found. Set filter variables above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b">
                      <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                      <th className="py-3 px-4 text-left font-bold text-slate-500">Student Name</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-500">ID / Roll</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-500">Marks</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-500">GPA</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-500">Grade</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                      <th className="py-3 px-4 text-end font-bold text-slate-500">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((r, i) => {
                      const s = students.find(st => String(st.id) === String(r.student_id));
                      if (!s) return null;
                      const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/30">
                          <td className="py-3.5 px-4 font-extrabold text-slate-600">
                            {r.rank ? `#${r.rank}` : `#${i + 1}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{s.full_name_en}</p>
                            <p className="text-[10px] text-slate-400">{s.full_name_bn}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {s.roll_number || s.id}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {r.total_obtained_marks} <span className="text-[10px] text-slate-400">/ {r.total_full_marks}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold" style={{ color: gc.text }}>
                            {r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{ background: gc.bg, color: gc.text }}>
                              {r.status === "fail" ? "F" : r.grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge className={r.status === "fail" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}>
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handlePrintIndividual(r)}>
                              <Printer className="h-4.5 w-4.5 text-slate-600" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers list */}
        <Card className="border-0 shadow-sm bg-white rounded-3xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-1.5"><Award className="h-5 w-5 text-yellow-500" /> Top Performing Students</h3>
          <div className="space-y-4 flex-1">
            {topPerformers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">No passed students recorded in query.</p>
            ) : (
              topPerformers.map((r, i) => {
                const s = students.find(st => String(st.id) === String(r.student_id));
                const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                if (!s) return null;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl border hover:bg-slate-50/50 transition-all">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                      i === 0 ? "bg-yellow-100 text-yellow-800" : i === 1 ? "bg-slate-100 text-slate-800" : "bg-orange-100 text-orange-800"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-xs">{s.full_name_en}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Roll: {s.roll_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-xs" style={{ color: gc.text }}>GPA {r.gpa?.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">Total: {r.total_obtained_marks}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main ExamManager Component
// ────────────────────────────────────────────────────────
export default function ExamManager({ students, currentUser }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("exams");
  const [showExamForm, setShowExamForm] = useState(false);
  const [editExam, setEditExam] = useState(null);
  
  // Queries
  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: () => appClient.entities.Exam.list("-academic_year", 200),
  });

  const { data: appSettings } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const settingsList = Array.isArray(appSettings) ? appSettings : (appSettings?.rows || []);
  const settingsObj = Object.fromEntries(settingsList.map(s => [s.key, s.value]));

  // Mutations
  const createExamMut = useMutation({
    mutationFn: d => appClient.entities.Exam.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    }
  });

  const updateExamMut = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.Exam.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    }
  });

  const deleteExamMut = useMutation({
    mutationFn: id => appClient.entities.Exam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast.success("Exam deleted successfully!");
    }
  });

  const handleSaveExam = async (d) => {
    try {
      if (editExam) {
        await updateExamMut.mutateAsync({ id: editExam.id, d });
        toast.success("Exam updated successfully!");
      } else {
        const branchObj = branches.find(b => String(b.id) === String(d.branch_id));
        const branchClasses = branchObj && Array.isArray(branchObj.academic_structure) ? branchObj.academic_structure : [];
        const classObj = branchClasses.find(c => c.id === d.class_id);
        const payload = {
          ...d,
          session: classObj?.class_name?.en || classObj?.class_name?.bn || "",
        };
        await createExamMut.mutateAsync(payload);
        toast.success("Exam created successfully!");
      }
      setShowExamForm(false);
      setEditExam(null);
    } catch (err) {
      toast.error(err.message || "Failed to save exam");
    }
  };

  const handleDeleteExam = async (exam) => {
    if (window.confirm(`Are you sure you want to delete ${exam.title}? All linked results will be lost.`)) {
      await deleteExamMut.mutateAsync(exam.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B] flex items-center gap-2"><Trophy className="h-6 w-6 text-[#D4AF37]" /> Exam & Results Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Create examinations, input subject-wise marks, print transcripts, and generate merit lists.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "exams" && (
            <Button onClick={() => { setEditExam(null); setShowExamForm(true); }} className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-10">
              <Plus className="h-4 w-4" /> Add Exam
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list trigger */}
      <Tabs defaultValue="exams" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 bg-slate-100 rounded-xl max-w-lg mb-6">
          <TabsTrigger value="exams" className="rounded-lg text-xs font-bold py-2.5">Exams List</TabsTrigger>
          <TabsTrigger value="entry" className="rounded-lg text-xs font-bold py-2.5">Result Entry</TabsTrigger>
          <TabsTrigger value="dashboard" className="rounded-lg text-xs font-bold py-2.5">Results Dashboard</TabsTrigger>
          <TabsTrigger value="admit-card" className="rounded-lg text-xs font-bold py-2.5 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Admit Card</TabsTrigger>
        </TabsList>

        {/* ── Exam List View ── */}
        <TabsContent value="exams">
          {examsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No exams created yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click the &quot;Add Exam&quot; button at the top to configure your first examination.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(exam => {
                const branch = branches.find(b => String(b.id) === String(exam.branch_id));
                const classObj = branch?.academic_structure?.find(c => String(c.id) === String(exam.class_id));
                return (
                  <Card key={exam.id} className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#052E2B] to-[#D4AF37]" />
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] uppercase font-extrabold">{exam.exam_type}</Badge>
                        <span className="text-[10px] font-bold text-yellow-600 font-mono">Yr: {exam.academic_year}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{exam.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Branch: {branch?.name_en || branch?.name_bn || "All"} | Class: {classObj?.class_name?.bn || classObj?.class_name?.en || "All"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 border-t pt-3">
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[8px]">Start Date</span>
                          <span className="font-semibold">{exam.start_date || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[8px]">Publish Date</span>
                          <span className="font-semibold text-emerald-600 font-bold">{exam.result_publish_date || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1 border-t pt-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => { setEditExam(exam); setShowExamForm(true); }}>
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-red-500" onClick={() => handleDeleteExam(exam)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Wizard Result Entry View ── */}
        <TabsContent value="entry">
          <ExamResultEntry branches={branches} exams={exams} students={students} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        {/* ── Results Dashboard ── */}
        <TabsContent value="dashboard">
          <AdminResultDashboard branches={branches} exams={exams} students={students} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        {/* ── Admit Card ── */}
        <TabsContent value="admit-card">
          <AdmitCardManager branches={branches} exams={exams} currentUser={currentUser} settings={settingsObj} />
        </TabsContent>
      </Tabs>

      {/* Exam Dialog Form */}
      <Dialog open={showExamForm} onOpenChange={v => { setShowExamForm(v); if (!v) setEditExam(null); }}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#052E2B]">{editExam ? "Edit Examination Details" : "Configure New Examination"}</DialogTitle>
          </DialogHeader>
          <ExamForm
            exam={editExam}
            branches={branches}
            onSave={handleSaveExam}
            onCancel={() => { setShowExamForm(false); setEditExam(null); }}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
