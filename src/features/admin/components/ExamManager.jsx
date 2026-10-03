import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName, isStudentInClassOption, isStudentAssignedToTeacher, getStudentAssignedTeacher } from "@/lib/academic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Loader2, Trophy, Pencil, Trash2, 
  Search, Award, AlertTriangle, ShieldCheck, Printer, CreditCard, FileText,
  Users, BarChart3, Building2, ExternalLink, GraduationCap,
  ChevronDown, ChevronUp, Check, X, BookOpen
} from "lucide-react";
import dynamic from "next/dynamic";
const AdmitCardManager = dynamic(() => import("./AdmitCardManager"), { ssr: false });
import { format } from "date-fns";
import { toast } from "sonner";
import { DEFAULT_LOGO } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const EXAM_TYPE_OPTIONS = ["First Terminal Exam", "Half Yearly Exam", "Annual Exam", "Model Test", "Monthly Test"];

// Result system options — extensible for future result systems
const RESULT_SYSTEM_OPTIONS = [
  { value: "general", label: "General Education" },
  { value: "qawmi", label: "Qawmi Madrasa (কওমি মাদরাসা)" },
];

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

// Qawmi Madrasa grading — returns Darajah label based on percentage of obtained/full marks
export function calcQawmiDarajah(obtained, full) {
  if (!full || full <= 0) return "রাসিব";
  const pct = (obtained / full) * 100;
  if (pct >= 80) return "মুমতাজ";
  if (pct >= 70) return "জায়্যিদ-জিদ্দান";
  if (pct >= 60) return "জায়্যিদ";
  if (pct >= 50) return "মাকবুল";
  return "রাসিব";
}

// ────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────
// Print Ready HTML Marksheet Generators (Single Page & Bulk)
// ────────────────────────────────────────────────────────
export function getPrintableMarksheetInnerContent(student, branch, className, exam, result, settings, activeSubjects, resultSystem = "general") {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";

  // Resolve active subjects for this student's class/session/group if available
  const resolvedActiveSubjects = (() => {
    if (activeSubjects && Array.isArray(activeSubjects) && activeSubjects.length > 0) {
      return activeSubjects;
    }
    const structure = branch?.academic_structure || [];
    const targetClassId = student?.class_id || result?.class_id || exam?.class_id;
    const targetSessionId = student?.session_id || exam?.session_id;
    const targetGroupId = student?.class_group_id || exam?.class_group_id;

    const cls = structure.find(c => String(c.id) === String(targetClassId) || (c.sections && c.sections.some(s => String(s.id) === String(targetClassId))));
    if (!cls) return null;

    if (targetSessionId && Array.isArray(cls.sections)) {
      const sec = cls.sections.find(s => String(s.id) === String(targetSessionId) || String(s.id) === String(targetClassId));
      if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) return sec.subjects;
    }
    if (targetGroupId && Array.isArray(cls.groups)) {
      const grp = cls.groups.find(g => String(g.id) === String(targetGroupId));
      if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) return grp.subjects;
    }
    return Array.isArray(cls.subjects) ? cls.subjects : null;
  })();

  const activeSubjectIds = resolvedActiveSubjects && resolvedActiveSubjects.length > 0
    ? new Set(resolvedActiveSubjects.map(s => String(s.id || s.subject_id)))
    : null;

  // Filter out deleted subjects (subjects not in activeSubjectIds, or entries with empty marks and no pass_marks)
  const displayMarksDetails = (result.marks_details || []).filter(sub => {
    if (activeSubjectIds) {
      return activeSubjectIds.has(String(sub.subject_id || sub.id));
    }
    // Fallback: exclude empty/unentered rows that have no pass_marks or empty marks
    if ((sub.obtained_marks === "" || sub.obtained_marks === null || sub.obtained_marks === undefined) && (!sub.pass_marks || !sub.full_marks)) {
      return false;
    }
    return true;
  });

  const isQawmi = resultSystem === "qawmi";

  const subjectsHtml = displayMarksDetails.map(sub => {
    const isSubFailed = Number(sub.obtained_marks) < Number(sub.pass_marks);
    const { grade, gpa } = calcSubjectGradeAndGPA(Number(sub.obtained_marks), Number(sub.full_marks));
    const darajah = calcQawmiDarajah(Number(sub.obtained_marks), Number(sub.full_marks));
    if (isQawmi) {
      return `
        <tr>
          <td style="text-align: left; padding: 5px 8px; border: 1px solid #002818;">
            <span style="font-weight: 600; font-size: 12px;">${sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</span>
            ${sub.book_name?.en ? `<br/><span style="font-size: 9.5px; color: #555; font-style: italic;">Book: ${sub.book_name.en}</span>` : ""}
          </td>
          <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: 500;">${sub.full_marks}</td>
          <td style="padding: 5px 8px; border: 1px solid #002818; color: #cc4400; font-weight: 500;">${sub.pass_marks}</td>
          <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: bold; font-size: 13px; ${isSubFailed ? "color: red;" : "color: #006241;"}">${sub.obtained_marks}</td>
          <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: bold; ${isSubFailed ? "color: red;" : "color: #006241;"}">${isSubFailed ? "রাসিব" : darajah}</td>
        </tr>
      `;
    }
    return `
      <tr>
        <td style="text-align: left; padding: 5px 8px; border: 1px solid #002818;">
          <span style="font-weight: 600; font-size: 12px;">${sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</span>
          ${sub.book_name?.en ? `<br/><span style="font-size: 9.5px; color: #555; font-style: italic;">Book: ${sub.book_name.en}</span>` : ""}
        </td>
        <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: 500;">${sub.full_marks}</td>
        <td style="padding: 5px 8px; border: 1px solid #002818; color: #cc4400; font-weight: 500;">${sub.pass_marks}</td>
        <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: bold; font-size: 13px; ${isSubFailed ? "color: red;" : "color: #006241;"}">${sub.obtained_marks}</td>
        <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: bold; ${isSubFailed ? "color: red;" : "color: #006241;"}">${isSubFailed ? "F" : grade}</td>
        <td style="padding: 5px 8px; border: 1px solid #002818; font-weight: 600; ${isSubFailed ? "color: red;" : ""};">${isSubFailed ? "0.00" : gpa.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  // Recalculate summary metrics from displayMarksDetails so summary matches displayed subjects
  const calcTotalObtained = displayMarksDetails.reduce((sum, s) => sum + Number(s.obtained_marks || 0), 0);
  const calcTotalFull = displayMarksDetails.reduce((sum, s) => sum + Number(s.full_marks || 0), 0);
  const isFailed = displayMarksDetails.length > 0
    ? displayMarksDetails.some(s => s.obtained_marks === "" || s.obtained_marks === null || Number(s.obtained_marks) < Number(s.pass_marks))
    : result.status === "fail";

  const totalPoints = displayMarksDetails.reduce((sum, s) => {
    if (s.obtained_marks === "" || s.obtained_marks === null) return sum;
    return sum + calcSubjectGradeAndGPA(Number(s.obtained_marks), Number(s.full_marks)).gpa;
  }, 0);
  const calculatedGpa = displayMarksDetails.length > 0 ? totalPoints / displayMarksDetails.length : (result.gpa || 0);
  const calculatedGrade = calcOverallGrade(calculatedGpa, isFailed);

  const displayRank = result.liveRank || result.rank;

  return `
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
            <strong>${branch?.name_en || branch?.name_bn || "Main Branch"}</strong><br/>
            Address: ${branch?.address_en || branch?.address_bn || "N/A"} • Phone: ${branch?.phone || "N/A"}
          </p>
        </div>
        ${isQawmi ? `<table class="grade-chart">
          <thead>
            <tr><th>Range</th><th>দারাজাহ</th></tr>
          </thead>
          <tbody>
            <tr><td>80-100</td><td>মুমতাজ</td></tr>
            <tr><td>70-79</td><td>জায়্যিদ-জিদ্দান</td></tr>
            <tr><td>60-69</td><td>জায়্যিদ</td></tr>
            <tr><td>50-59</td><td>মাকবুল</td></tr>
            <tr><td>00-49</td><td>রাসিব</td></tr>
          </tbody>
        </table>` : `<table class="grade-chart">
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
        </table>`}
      </div>
      
      <!-- Title -->
      <div class="title-badge">
        <span>Official Academic Result Card</span>
      </div>
      
      <!-- Student Info -->
      <div class="student-info">
        <div class="info-col">
          <p><strong>Student Name:</strong> ${student.full_name_en || ""} ${student.full_name_bn ? `(${student.full_name_bn})` : ""}</p>
          <p><strong>Father's Name:</strong> ${student.father_name || "N/A"}</p>
          <p><strong>Mother's Name:</strong> ${student.mother_name || "N/A"}</p>
          <p><strong>Academic Year:</strong> ${exam?.academic_year || "N/A"}</p>
        </div>
        <div class="info-col" style="border-left: 1px solid rgba(0, 77, 58, 0.1); padding-left: 15px;">
          <p><strong>Student ID:</strong> ${student.roll_number || student.id}</p>
          <p><strong>Roll Number:</strong> ${student.roll_number || "N/A"}</p>
          <p><strong>Branch:</strong> ${branch?.name_bn || branch?.name_en || "N/A"}</p>
          <p><strong>Class:</strong> ${className}</p>
        </div>
      </div>
      
      <!-- Marks Table -->
      <table class="marks-table">
        <thead>
          <tr>
            <th style="text-align: left; width: ${isQawmi ? '50%' : '45%'};">Name of Subjects</th>
            <th style="width: 11%;">Full Marks</th>
            <th style="width: 11%;">Pass Marks</th>
            <th style="width: ${isQawmi ? '17%' : '12%'};">Obtained Marks</th>
            <th style="width: 11%;">${isQawmi ? 'দারাজাহ (Darajah)' : 'Grade'}</th>
            ${isQawmi ? '' : '<th style="width: 11%;">GP</th>'}
          </tr>
        </thead>
        <tbody>
          ${subjectsHtml}
        </tbody>
      </table>
      
      <!-- Summary Boxes -->
      <div class="summary-grid">
        <div class="summary-box">
          <div class="val">${calcTotalObtained} / ${calcTotalFull}</div>
          <div class="lbl">Total Marks</div>
        </div>
        ${isQawmi ? `
        <div class="summary-box">
          <div class="val" style="${isFailed ? 'color: red;' : ''}">${calcTotalFull > 0 ? ((calcTotalObtained / calcTotalFull) * 100).toFixed(1) : '0.0'}%</div>
          <div class="lbl">Avg. Marks (গড় নম্বর)</div>
        </div>
        <div class="summary-box">
          <div class="val" style="${isFailed ? 'color: red;' : 'color: #006241;'}">${isFailed ? 'রাসিব' : calcQawmiDarajah(calcTotalObtained, calcTotalFull)}</div>
          <div class="lbl">দারাজাহ (Darajah)</div>
        </div>` : `
        <div class="summary-box">
          <div class="val" style="${isFailed ? 'color: red;' : ''};">${isFailed ? '0.00' : calculatedGpa.toFixed(2)}</div>
          <div class="lbl">Grade Point Average (GPA)</div>
        </div>
        <div class="summary-box">
          <div class="val" style="${isFailed ? 'color: red;' : ''};">${isFailed ? 'F' : calculatedGrade}</div>
          <div class="lbl">Letter Grade</div>
        </div>`}
        <div class="summary-box">
          <div class="val" style="color: ${isFailed ? 'red' : '#006241'};">${isFailed ? 'FAILED' : 'PASSED'}</div>
          <div class="lbl">Result Status</div>
        </div>
      </div>
      
      <!-- Merit Rank -->
      <div class="merit-box">
        🏆 Merit Position: <strong style="font-size: 15px; color: #004D3A;">${displayRank ? `#${displayRank}` : "N/A"}</strong> in Class
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
        <span style="font-size: 8px; margin-top: 3px; display: inline-block;">Powered by Rahmania Institute</span>
      </div>
    </div>
  `;
}

export function getFullTranscriptDocumentHTML(bodyContent, title = "Academic Transcript") {
  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Outfit:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Outfit', Arial, sans-serif; background: #f8fafc; color: #002818; padding: 10px 0; }
        .bn { font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }

        .transcript-page {
          padding: 10px 0;
          background: transparent;
          page-break-after: always;
          break-after: page;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .transcript-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        .marksheet-container {
          border: 4px double #004D3A;
          padding: 16px 20px;
          max-width: 800px;
          margin: 0 auto;
          background: #FCFDFB;
          position: relative;
          page-break-inside: avoid;
          break-inside: avoid;
          border-radius: 4px;
        }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004D3A; padding-bottom: 8px; margin-bottom: 10px; }
        .logo-wrap { width: 70px; height: 70px; padding: 2px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
        .logo-wrap img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
        .inst-details { text-align: center; flex: 1; padding: 0 10px; }
        .inst-name-bn { font-size: 20px; font-weight: 700; color: #004D3A; letter-spacing: 0.5px; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }
        .inst-name-en { font-size: 13px; font-weight: 600; color: #D4AF37; text-transform: uppercase; margin-top: 1px; }
        .branch-info { font-size: 10px; color: #555; margin-top: 2px; font-weight: 500; }
        .grade-chart { width: 135px; border-collapse: collapse; font-size: 8.5px; text-align: center; border: 1px solid #004D3A; }
        .grade-chart th, .grade-chart td { border: 1px solid #004D3A; padding: 2px; }
        .grade-chart th { background: #004D3A; color: white; font-weight: bold; }
        
        .title-badge { text-align: center; margin: 8px 0 10px; }
        .title-badge span { background: #004D3A; color: white; padding: 4px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border: 1px dashed #D4AF37; }
        
        .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0, 77, 58, 0.03); border: 1px solid rgba(0, 77, 58, 0.1); border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; }
        .info-col p { margin-bottom: 3px; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; }
        .info-col strong { color: #004D3A; font-weight: 600; }
        
        .marks-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; margin-bottom: 10px; }
        .marks-table th { background: #004D3A; color: white; padding: 5px 8px; border: 1px solid #002818; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        .marks-table td { padding: 5px 8px; border: 1px solid #002818; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
        .summary-box { border: 1px solid rgba(0, 77, 58, 0.15); border-radius: 8px; padding: 6px; text-align: center; background: rgba(0, 77, 58, 0.02); }
        .summary-box .val { font-size: 15px; font-weight: 700; color: #004D3A; margin-bottom: 1px; }
        .summary-box .lbl { font-size: 8.5px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .merit-box { background: rgba(212, 175, 87, 0.07); border: 1px solid rgba(212, 175, 87, 0.25); border-radius: 8px; padding: 8px; margin-bottom: 12px; text-align: center; font-size: 12px; }

        .footer-sig { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 6px; border-top: 1px dashed rgba(0, 77, 58, 0.2); }
        .sig-block { text-align: center; width: 140px; font-size: 10px; }
        .sig-line { border-top: 1px solid #004D3A; margin-bottom: 4px; }
        
        .brand-footer { text-align: center; font-size: 8.5px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee; text-transform: uppercase; letter-spacing: 0.5px; }
        .publish-date { font-weight: 600; color: #004D3A; }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
          html, body { background: white !important; padding: 0 !important; margin: 0 !important; width: 100%; }
          .transcript-page {
            padding: 0 !important;
            margin: 0 !important;
            min-height: 100vh !important;
            height: 100vh !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .transcript-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .marksheet-container {
            border: 3px double #004D3A !important;
            box-shadow: none !important;
            background: #FCFDFB !important;
            padding: 12px 16px !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-height: 100% !important;
          }
          .summary-box { background: rgba(0, 77, 58, 0.02) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .student-info { background: rgba(0, 77, 58, 0.03) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .merit-box { background: rgba(212, 175, 87, 0.07) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${bodyContent}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}

export function getPrintableMarksheetHTML(student, branch, className, exam, result, settings) {
  const resultSystem = exam?.result_system || "general";
  const innerContent = getPrintableMarksheetInnerContent(student, branch, className, exam, result, settings, null, resultSystem);
  const singlePageWrapper = `
    <div class="transcript-page">
      ${innerContent}
    </div>
  `;
  return getFullTranscriptDocumentHTML(singlePageWrapper, `Academic Transcript - ${student?.full_name_en || ""}`);
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
// Shared helper to find a student from result r across DB PK ID, teacher ID, or Roll Number
export function findStudentInList(r, list) {
  if (!r || r.student_id === undefined || r.student_id === null) return null;
  const targetId = String(r.student_id).trim().toLowerCase();
  return (list || []).find(s =>
    String(s.id).trim().toLowerCase() === targetId ||
    (s.student_id && String(s.student_id).trim().toLowerCase() === targetId) ||
    (s.roll_number && String(s.roll_number).trim().toLowerCase() === targetId)
  ) || {
    id: r.student_id,
    full_name_en: `Student #${r.student_id}`,
    full_name_bn: "",
    roll_number: r.student_id
  };
}

// ────────────────────────────────────────────────────────
// Print Formats Download Helpers
// ────────────────────────────────────────────────────────
function printResultSheet(branch, className, exam, results, studentsList, settings, activeSubjects, resultSystem = "general") {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  const isQawmi = resultSystem === "qawmi";

  // Active subject IDs set
  const activeSubjectIds = activeSubjects && activeSubjects.length > 0
    ? new Set(activeSubjects.map(s => String(s.id)))
    : null;
  
  const resultRows = results.map((r, idx) => {
    const s = findStudentInList(r, studentsList);
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

    // Calculate percentage-based grade from total marks
    const totalPct = (r.total_full_marks || 0) > 0 ? (r.total_obtained_marks / r.total_full_marks) * 100 : 0;
    const pctGrade = (() => {
      if (r.status === "fail") return "F";
      if (totalPct >= 80) return "A+";
      if (totalPct >= 70) return "A";
      if (totalPct >= 60) return "A-";
      if (totalPct >= 50) return "B";
      if (totalPct >= 40) return "C";
      if (totalPct >= 33) return "D";
      return "F";
    })();

    const filteredMarks = activeSubjectIds
      ? (r.marks_details || []).filter(sub => activeSubjectIds.has(String(sub.subject_id)))
      : (r.marks_details || []);

    const subjectMarksCols = filteredMarks.map(sub => {
      const isFailed = sub.obtained_marks < sub.pass_marks;
      return `<td style="border: 1px solid #002818; padding: 6px; ${isFailed ? "color: red; font-weight: bold;" : ""}">${sub.obtained_marks}</td>`;
    }).join("");
    
    const qawmiDarajah = isQawmi ? (r.status === "fail" ? "রাসিব" : calcQawmiDarajah(r.total_obtained_marks || 0, r.total_full_marks || 1)) : "";
    return `
      <tr>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold;">${r.liveRank || r.rank || idx + 1}</td>
        <td style="border: 1px solid #002818; padding: 6px; text-align: left;">
          ${s.full_name_en}
          ${groupName ? `<br/><span style="font-size: 10px; color: #555; font-weight: 500;">Group: ${groupName}</span>` : ""}
        </td>
        <td style="border: 1px solid #002818; padding: 6px; font-mono">${s.roll_number || s.id}</td>
        ${subjectMarksCols}
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold;">${r.total_obtained_marks}</td>
        ${isQawmi
          ? `<td style="border: 1px solid #002818; padding: 6px; font-weight: bold; ${r.status === "fail" ? "color: red;" : "color: #006241;"}"> ${qawmiDarajah}</td>`
          : `<td style="border: 1px solid #002818; padding: 6px; font-weight: bold; ${r.status === "fail" ? "color: red;" : ""}"> ${r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}</td>
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold; ${r.status === "fail" ? "color: red;" : ""}"> ${pctGrade}</td>`}
        <td style="border: 1px solid #002818; padding: 6px; font-weight: bold; color: ${r.status === "fail" ? "red" : "#006241"};"> ${r.status?.toUpperCase()}</td>
      </tr>
    `;
  }).join("");


  // Subject headers: activeSubjects থাকলে সেগুলো ব্যবহার করো, না থাকলে marks_details থেকে নাও (fallback)
  let subjectHeaders;
  if (activeSubjects && activeSubjects.length > 0) {
    subjectHeaders = activeSubjects.map(sub => {
      const sName = typeof sub.subject_name === "string" ? sub.subject_name : (sub.subject_name?.bn || sub.subject_name?.en || "");
      return `<th style="border: 1px solid #002818; background: #004D3A; color: white; padding: 6px; font-size: 11px;">${sName}</th>`;
    }).join("");
  } else {
    const allSubjectIds = new Set();
    const allSubjectsMap = new Map();
    for (const r of results) {
      for (const sub of (r.marks_details || [])) {
        if (!allSubjectIds.has(sub.subject_id)) {
          allSubjectIds.add(sub.subject_id);
          allSubjectsMap.set(sub.subject_id, sub);
        }
      }
    }
    subjectHeaders = Array.from(allSubjectsMap.values()).map(sub => {
      const sName = typeof sub.subject_name === "string" ? sub.subject_name : (sub.subject_name?.bn || sub.subject_name?.en || "");
      return `<th style="border: 1px solid #002818; background: #004D3A; color: white; padding: 6px; font-size: 11px;">${sName}</th>`;
    }).join("");
  }

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
              <th style="border: 1px solid #002818; width: 12%; text-align: center; line-height: 1.4;">Obtained Marks<br/><span style="font-size: 10px; font-weight: normal; opacity: 0.85;">(Out of ${results[0]?.total_full_marks || 600})</span></th>
              ${isQawmi
                ? `<th style="border: 1px solid #002818; width: 16%;">দারাজাহ (Darajah)</th>`
                : `<th style="border: 1px solid #002818; width: 8%;">GPA</th>
              <th style="border: 1px solid #002818; width: 8%;">Grade</th>`}
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
function getSubjectDisplayName(sub) {
  if (!sub) return "";
  if (typeof sub === "string") return sub;
  if (typeof sub.subject_name === "string") return sub.subject_name;
  if (typeof sub.subject_name === "object" && sub.subject_name !== null) {
    return sub.subject_name.bn || sub.subject_name.en || sub.subject_name.ar || "";
  }
  return sub.name_bn || sub.name_en || sub.name_ar || sub.title || "";
}

function ExamForm({ exam, branches, onSave, onCancel, currentUser }) {
  const defaultSeatingConfig = {
    examTitle: "", cardTitle: "ADMIT CARD / প্রবেশপত্র", centerName: "",
    startingSeat: "1", seatPrefix: "", seatDigits: "3",
    startingRoom: "1", studentsPerRoom: "20",
  };
  const [seatingCfg, setSeatingCfg] = useState(() => {
    const stored = exam?.seating_config;
    if (stored) {
      if (typeof stored === "string") { try { return { ...defaultSeatingConfig, ...JSON.parse(stored) }; } catch { return defaultSeatingConfig; } }
      if (typeof stored === "object") return { ...defaultSeatingConfig, ...stored };
    }
    return defaultSeatingConfig;
  });
  const updateSeat = (k, v) => setSeatingCfg(p => ({ ...p, [k]: v }));

  const [form, setForm] = useState({
    title: exam?.title || "",
    exam_type: exam?.exam_type || EXAM_TYPE_OPTIONS[0],
    academic_year: exam?.academic_year || new Date().getFullYear().toString(),
    start_date: exam?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: exam?.end_date || format(new Date(), "yyyy-MM-dd"),
    result_publish_date: exam?.result_publish_date || format(new Date(), "yyyy-MM-dd"),
    is_active: exam?.is_active ?? true,
    result_system: exam?.result_system || "general",
    branch_id: exam?.branch_id ? String(exam.branch_id) : (currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : ""),
    class_id: exam?.class_id || "",
    session_id: exam?.session_id || "",
    class_group_id: exam?.class_group_id || "",
  });

  const [subjectSchedules, setSubjectSchedules] = useState(() => {
    if (Array.isArray(exam?.subject_schedules)) return exam.subject_schedules;
    if (typeof exam?.subject_schedules === "string") {
      try { return JSON.parse(exam.subject_schedules); } catch { return []; }
    }
    return [];
  });
  
  const [saving, setSaving] = useState(false);
  
  const selectedBranch = branches.find(b => String(b.id) === String(form.branch_id));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  
  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Compute available subjects for selected Class / Session / Group
  const currentClass = classes.find(c => String(c.id) === String(form.class_id));
  let availableSubjects = [];
  if (currentClass) {
    if (form.session_id && Array.isArray(currentClass.sections) && currentClass.sections.length > 0) {
      const sec = currentClass.sections.find(s => String(s.id) === String(form.session_id));
      if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) {
        availableSubjects = sec.subjects;
      }
    }
    if (availableSubjects.length === 0 && form.class_group_id && Array.isArray(currentClass.groups) && currentClass.groups.length > 0) {
      const grp = currentClass.groups.find(g => String(g.id) === String(form.class_group_id));
      if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) {
        availableSubjects = grp.subjects;
      }
    }
    if (availableSubjects.length === 0 && Array.isArray(currentClass.subjects) && currentClass.subjects.length > 0) {
      availableSubjects = currentClass.subjects;
    }
  }

  return (
    <form onSubmit={async e => {
      e.preventDefault();
      if (!form.branch_id) {
        return toast.error("Please select a Branch");
      }
      if (!form.class_id) {
        return toast.error("Please select a Class");
      }
      
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

      // Build finalized subject_schedules array ensuring every available subject has an entry
      const finalSchedules = availableSubjects.map((sub, idx) => {
        const subName = getSubjectDisplayName(sub);
        const subId = sub.id || idx;
        const existing = subjectSchedules.find(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
        return {
          subject_id: subId,
          subject_name: subName,
          date: existing?.date || form.start_date || "",
          time: existing?.time || "9:00 AM - 12:00 PM",
        };
      });
      
      setSaving(true);
      try {
        const payload = {
          ...form,
          branch_id: Number(form.branch_id),
          is_active: form.is_active === true || String(form.is_active) === "true",
          session: classes.find(c => c.id === form.class_id)?.class_name?.en || classes.find(c => c.id === form.class_id)?.class_name?.bn || "",
          total_marks: 100,
          subject_schedules: finalSchedules
        };
        await onSave({ ...payload, seating_config: seatingCfg });
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
          <Select value={form.branch_id} onValueChange={v => { updateForm("branch_id", v); updateForm("class_id", ""); updateForm("session_id", ""); updateForm("class_group_id", ""); }} disabled={currentUser?.role === "branch_admin"}>
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
          <label className="text-xs font-bold text-[#052E2B] block mb-1 font-semibold">Status</label>
          <Select value={form.is_active ? "Active" : "Inactive"} onValueChange={v => updateForm("is_active", v === "Active")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Result System <span className="text-emerald-700 font-extrabold">*</span>
          </label>
          <Select value={form.result_system} onValueChange={v => updateForm("result_system", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RESULT_SYSTEM_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            {form.result_system === "qawmi"
              ? "কওমি মোড: রেজাল্টে GPA/Grade-এর বদলে দারাজাহ (মুমতাজ, জায়্যিদ-জিদ্দান, জায়্যিদ, মাকবুল, রাসিব) প্রদর্শিত হবে।"
              : "General: সাধারণ শিক্ষা পদ্ধতি — GPA ও Grade (A+, A, A-, B, C, D, F) দেখাবে।"}
          </p>
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

      {/* ── Subject-Wise Exam Routine Setup ── */}
      {availableSubjects.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-[#052E2B] uppercase tracking-wider block">
              📅 বিষয়ভিত্তিক পরীক্ষার সময়সূচী (Subject Exam Routine)
            </label>
            <span className="text-[11px] text-slate-500 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              মোট বিষয়: {availableSubjects.length} টি
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-white">
                  <th className="p-2 w-8 text-center">#</th>
                  <th className="p-2 min-w-[130px]">বিষয় (Subject)</th>
                  <th className="p-2 min-w-[135px]">তারিখ (Date)</th>
                  <th className="p-2 min-w-[145px]">সময় (Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {availableSubjects.map((sub, idx) => {
                  const subName = getSubjectDisplayName(sub);
                  const subId = sub.id || idx;
                  const schedule = subjectSchedules.find(s => String(s.subject_id) === String(subId) || s.subject_name === subName) || {};
                  const curDate = schedule.date || form.start_date || "";
                  const curTime = schedule.time || "9:00 AM - 12:00 PM";

                  return (
                    <tr key={subId} className="hover:bg-white/80 transition-colors">
                      <td className="p-2 text-center font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-800 break-words max-w-[160px]">{subName}</td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={curDate}
                          onChange={e => {
                            const newDate = e.target.value;
                            setSubjectSchedules(prev => {
                              const exists = prev.some(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
                              if (exists) {
                                return prev.map(s => (String(s.subject_id) === String(subId) || s.subject_name === subName) ? { ...s, date: newDate } : s);
                              }
                              return [...prev, { subject_id: subId, subject_name: subName, date: newDate, time: curTime }];
                            });
                          }}
                          className="h-8 text-xs rounded-lg bg-white border-slate-300"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={curTime}
                          placeholder="9:00 AM - 12:00 PM"
                          onChange={e => {
                            const newTime = e.target.value;
                            setSubjectSchedules(prev => {
                              const exists = prev.some(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
                              if (exists) {
                                return prev.map(s => (String(s.subject_id) === String(subId) || s.subject_name === subName) ? { ...s, time: newTime } : s);
                              }
                              return [...prev, { subject_id: subId, subject_name: subName, date: curDate, time: newTime }];
                            });
                          }}
                          className="h-8 text-xs rounded-lg bg-white border-slate-300 font-sans"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Seating & Admit Card Configuration ── */}
      <div className="border-t pt-4 mt-2 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold text-[#052E2B] uppercase tracking-wider">🎓 Admit Card &amp; Seating Configuration</span>
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">Used in Admit Card &amp; Serial Sheet</span>
        </div>
        <div className="bg-[#052E2B]/5 rounded-2xl border border-[#052E2B]/15 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">পরীক্ষার নাম / Exam Title (Admit Card)</label>
              <Input value={seatingCfg.examTitle} onChange={e => updateSeat("examTitle", e.target.value)} placeholder="e.g. বার্ষিক পরীক্ষা ২০২৬" className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">কার্ডের শিরোনাম / Card Title</label>
              <Input value={seatingCfg.cardTitle} onChange={e => updateSeat("cardTitle", e.target.value)} placeholder="e.g. প্রবেশপত্র" className="h-9 text-xs rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">পরীক্ষা কেন্দ্র / Exam Center Name</label>
              <Input value={seatingCfg.centerName} onChange={e => updateSeat("centerName", e.target.value)} placeholder="e.g. রহমানিয়া মাদরাসা পরীক্ষা কেন্দ্র" className="h-9 text-xs rounded-xl" />
            </div>
          </div>
          <div className="border-t border-[#052E2B]/10 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Seat / Room Auto-Assignment</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Starting Seat #</label>
                <Input type="number" value={seatingCfg.startingSeat} onChange={e => updateSeat("startingSeat", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Seat Prefix</label>
                <Input value={seatingCfg.seatPrefix} onChange={e => updateSeat("seatPrefix", e.target.value)} placeholder="e.g. S-" className="h-9 text-xs rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Digit Padding</label>
                <Input type="number" value={seatingCfg.seatDigits} onChange={e => updateSeat("seatDigits", e.target.value)} className="h-9 text-xs rounded-xl" min="1" max="6" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Starting Room #</label>
                <Input type="number" value={seatingCfg.startingRoom} onChange={e => updateSeat("startingRoom", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">Students Per Room</label>
                <Input type="number" value={seatingCfg.studentsPerRoom} onChange={e => updateSeat("studentsPerRoom", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
            </div>
          </div>
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

  // Filter exams for this branch, class, session, and group selected in Step 2
  const classExams = exams.filter(e => {
    if (String(e.branch_id) !== String(selBranchId)) return false;
    if (String(e.class_id) !== String(classIdForExams)) return false;

    // Filter by Session (Section) if exam is scoped to a specific session
    if (e.session_id && selClassId && String(e.session_id) !== String(selClassId)) {
      return false;
    }

    // Filter by Group if exam is scoped to a specific group
    if (e.class_group_id && selGroupId !== "all" && String(e.class_group_id) !== String(selGroupId)) {
      return false;
    }

    return true;
  });
  const selectedExam = classExams.find(e => String(e.id) === String(selExamId));
  
  const studentsAfterBranchFilter = React.useMemo(() => {
    if (!selBranchId || selBranchId === "all") return students;
    return students.filter(s => String(s.branch_id) === String(selBranchId));
  }, [students, selBranchId]);

  const studentsAfterStatusFilter = React.useMemo(() => {
    return studentsAfterBranchFilter.filter(s => {
      const st = String(s.status || "").toLowerCase().trim();
      return !st || st === "active" || st === "enrolled";
    });
  }, [studentsAfterBranchFilter]);

  const studentsAfterClassFilter = React.useMemo(() => {
    if (!selClassId || selClassId === "all") return studentsAfterStatusFilter;
    return studentsAfterStatusFilter.filter(s => isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure));
  }, [studentsAfterStatusFilter, selClassId, selectedBranch]);

  const classStudents = React.useMemo(() => {
    if (!selGroupId || selGroupId === "all") return studentsAfterClassFilter;
    return studentsAfterClassFilter.filter(s => {
      const sGroupId = s.class_group_id || s.group_id || s.group || "";
      return !sGroupId || String(sGroupId) === String(selGroupId);
    });
  }, [studentsAfterClassFilter, selGroupId]);
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

  // Decision variables for existing results detection
  const totalStudents = classStudents.length;
  const countWithResults = studentsWithResults.length;
  const countWithoutResults = studentsWithoutResults.length;
  const allStudentsHaveResults = totalStudents > 0 && countWithResults === totalStudents && countWithoutResults === 0;



  // Auto switch to edit mode ONLY if every matching student in this class/session/group already has results saved for this exam
  useEffect(() => {
    if (selExamId && totalStudents > 0) {
      if (allStudentsHaveResults) {
        setIsEditMode(true);
      } else if (countWithResults === 0) {
        setIsEditMode(false);
      }
    }
  }, [selExamId, totalStudents, allStudentsHaveResults, countWithResults]);

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
          // Merge existing saved marks with CURRENT class subject list.
          // This ensures newly added subjects also appear (with blank marks)
          // and avoids silently dropping them from the edit form and PDF.
          const savedMap = new Map(
            existingResult.marks_details.map(m => [String(m.subject_id), m])
          );
          const merged = subjects.map(sub => {
            const saved = savedMap.get(String(sub.id));
            return saved
              ? { ...saved, subject_name: sub.subject_name, book_name: sub.book_name, full_marks: sub.full_marks || saved.full_marks || 100, pass_marks: sub.pass_marks || saved.pass_marks || 33 }
              : { subject_id: sub.id, subject_name: sub.subject_name, book_name: sub.book_name, full_marks: sub.full_marks || 100, pass_marks: sub.pass_marks || 33, obtained_marks: "" };
          });
          setMarksDetails(merged);
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
                Class: <strong>${resolveAcademicDisplayName(
                  selClassId,
                  null,
                  (selectedExam?.class_group_id) || (selGroupId !== "all" ? selGroupId : null),
                  selectedBranch?.academic_structure,
                  'bn'
                ) || selectedFlatClass?.label || ''}</strong> | 
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
                    onClick={() => {
                      const printClassLabel = resolveAcademicDisplayName(
                        selClassId,
                        null,
                        selGroupId !== "all" ? selGroupId : null,
                        selectedBranch?.academic_structure,
                        'bn'
                      ) || selectedFlatClass?.label || "Class";
                      printBlankMarksheet(selectedBranch, printClassLabel, subjects, classStudents);
                    }}
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
                      {classExams.map(e => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.title}{e.academic_year ? ` (${e.academic_year})` : ""}
                        </SelectItem>
                      ))}
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
                          {totalStudents === 0 ? (
                            <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              No active enrolled students found for the selected Branch, Session, Class & Group.
                            </p>
                          ) : isEditMode ? (
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
                            ) : allStudentsHaveResults ? (
                              <p className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                <ShieldCheck className="h-4 w-4 shrink-0" />
                                All {totalStudents} students already have results for this exam. Switch to Edit Existing to update marks.
                              </p>
                            ) : (
                              <p className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> No eligible students available for new entry.
                              </p>
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
                      <p className="text-xs text-slate-400">Class / Section / Group</p>
                      <p className="text-sm font-bold text-slate-800">
                        {resolveAcademicDisplayName(
                          selectedStudent.class_id,
                          selectedStudent.session_id,
                          selectedStudent.class_group_id,
                          selectedBranch?.academic_structure,
                          'bn'
                        ) || selectedFlatClass?.label || selectedStudent.class_name || "N/A"}
                      </p>
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
// Teacher's Assigned Students Results & Ranking Dialog (with Multi-Exam Selection & Class Teacher Ranking)
// ────────────────────────────────────────────────────────
function TeacherAssignedResultsDialog({
  isOpen,
  onClose,
  teacher: initialTeacher,
  initialExamId = "all",
  initialClassId = "all",
  students = [],
  exams = [],
  branches = [],
  results = [],
  teachers = [],
  settings = {},
  enrichResult,
  findStudentForResult,
  handlePrintIndividual,
}) {
  // Active teacher inside modal (allows switching to other teachers in the same class directly)
  const [activeTeacher, setActiveTeacher] = useState(initialTeacher);

  // modalExamIds: Array of string IDs. Empty array [] means "All Exams (সকল পরীক্ষা)"
  const [modalExamIds, setModalExamIds] = useState(
    initialExamId && initialExamId !== "all" ? [String(initialExamId)] : []
  );
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [modalClassId, setModalClassId] = useState(initialClassId || "all");
  const [modalSearch, setModalSearch] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("all"); // "all" | "pass" | "fail" | "no_result"
  const [modalSortBy, setModalSortBy] = useState("rank"); // "rank" | "roll" | "name"
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Sync initial selections whenever modal is opened
  useEffect(() => {
    setActiveTeacher(initialTeacher);
    setModalExamIds(initialExamId && initialExamId !== "all" ? [String(initialExamId)] : []);
    setModalClassId(initialClassId || "all");
    setModalSearch("");
    setModalStatusFilter("all");
    setModalSortBy("rank");
    setExpandedStudentId(null);
    setIsExamDropdownOpen(false);
  }, [initialTeacher, initialExamId, initialClassId, isOpen]);

  const teacherBranch = branches.find(b => String(b.id) === String(activeTeacher?.branch_id));

  // 1. All active assigned students for this teacher
  const allTeacherStudents = React.useMemo(() => {
    if (!activeTeacher?.id) return [];
    return students.filter(s => {
      if (s.status === "inactive") return false;
      return isStudentAssignedToTeacher(s, activeTeacher);
    });
  }, [students, activeTeacher]);

  // 2. Teacher's unique classes from assigned students
  const teacherClasses = React.useMemo(() => {
    const seen = new Map();
    allTeacherStudents.forEach(s => {
      const b = branches.find(br => String(br.id) === String(s.branch_id));
      const clsName = resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, b?.academic_structure, 'bn') ||
        s.class_name || s.batch || `Class ${s.class_id}`;
      const cKey = String(s.class_id || s.class_name || "general");
      if (!seen.has(cKey)) {
        seen.set(cKey, { id: cKey, label: clsName, branchId: s.branch_id });
      }
    });
    return Array.from(seen.values());
  }, [allTeacherStudents, branches]);

  // 3. Available exams for this branch/teacher
  const availableExams = React.useMemo(() => {
    return exams.filter(e => {
      if (activeTeacher.branch_id && String(e.branch_id) !== String(activeTeacher.branch_id)) return false;
      return true;
    });
  }, [exams, activeTeacher]);

  // Active target exams based on selection
  const activeTargetExams = React.useMemo(() => {
    if (modalExamIds.length === 0) {
      return availableExams;
    }
    return availableExams.filter(e => modalExamIds.includes(String(e.id)));
  }, [availableExams, modalExamIds]);

  const isMultipleExams = activeTargetExams.length > 1;

  // Toggle single exam in multi-select
  const toggleExamSelection = (examId) => {
    const idStr = String(examId);
    setModalExamIds(prev => {
      if (prev.includes(idStr)) {
        return prev.filter(id => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  const selectAllExams = () => {
    setModalExamIds([]);
  };

  // Exam Selector Button Label
  const examSelectorLabel = React.useMemo(() => {
    if (modalExamIds.length === 0) {
      return "সকল পরীক্ষা (All Exams)";
    }
    if (modalExamIds.length === 1) {
      const e = availableExams.find(ex => String(ex.id) === String(modalExamIds[0]));
      return e ? e.title : "১টি পরীক্ষা নির্বাচিত";
    }
    if (modalExamIds.length === 2) {
      const e1 = availableExams.find(ex => String(ex.id) === String(modalExamIds[0]));
      const e2 = availableExams.find(ex => String(ex.id) === String(modalExamIds[1]));
      return `${e1?.title || "পরীক্ষা ১"} + ${e2?.title || "পরীক্ষা ২"}`;
    }
    return `${modalExamIds.length}টি পরীক্ষা নির্বাচিত (যৌথ)`;
  }, [modalExamIds, availableExams]);

  // 4. Compute student rows with combined/multi-exam results and dedicated 1-N cohort ranking
  const studentRows = React.useMemo(() => {
    // A. Filter students by class and search
    const list = allTeacherStudents.filter(s => {
      if (modalClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(s.branch_id));
        const isMatch = isStudentInClassOption(s, modalClassId, b?.academic_structure) ||
          String(s.class_id) === String(modalClassId) ||
          (s.class_name && String(s.class_name).toLowerCase().includes(String(modalClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const nEn = (s.full_name_en || "").toLowerCase();
        const nBn = (s.full_name_bn || "").toLowerCase();
        const roll = String(s.roll_number || "").toLowerCase();
        const idStr = String(s.id || "").toLowerCase();
        const stCode = String(s.student_id || "").toLowerCase();
        if (!nEn.includes(q) && !nBn.includes(q) && !roll.includes(q) && !idStr.includes(q) && !stCode.includes(q)) {
          return false;
        }
      }
      return true;
    });

    // B. Map results across active target exams
    const enrichedRows = list.map(student => {
      const b = branches.find(br => String(br.id) === String(student.branch_id));
      const classLabel = resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, b?.academic_structure, 'bn') ||
        student.class_name || student.batch || "—";
      const groupLabel = student.class_group_id ? `Group ${student.class_group_id}` : "General";

      const studentExamResults = [];
      let combinedTotalObtained = 0;
      let combinedTotalFull = 0;
      let hasAnyFail = false;
      let hasAnyResult = false;
      let validExamCount = 0;

      activeTargetExams.forEach(examObj => {
        const res = results.find(r => String(r.exam_id) === String(examObj.id) && String(r.student_id) === String(student.id));
        if (res) {
          hasAnyResult = true;
          const enriched = enrichResult(res);
          const isQawmiExam = (examObj.result_system || "general") === "qawmi";
          const eFull = Number(enriched.total_full_marks || 0);
          const eObt = Number(enriched.total_obtained_marks || 0);
          const isFailedExam = enriched.status === "fail";
          if (isFailedExam) hasAnyFail = true;

          combinedTotalObtained += eObt;
          combinedTotalFull += eFull;
          validExamCount += 1;

          studentExamResults.push({
            examId: examObj.id,
            examTitle: examObj.title,
            academicYear: examObj.academic_year,
            result: enriched,
            totalObtained: eObt,
            totalFull: eFull,
            percentage: eFull > 0 ? (eObt / eFull) * 100 : 0,
            gpa: isFailedExam ? 0 : Number(enriched.gpa || 0),
            grade: isFailedExam ? "F" : (enriched.grade || "F"),
            darajah: isFailedExam ? "রাসিব" : calcQawmiDarajah(eObt, eFull),
            status: enriched.status,
            marksDetails: enriched.marks_details || [],
            isQawmi: isQawmiExam,
          });
        }
      });

      const rollNum = parseInt(student.roll_number, 10);
      const numericRoll = isNaN(rollNum) ? 999999 : rollNum;
      const isOverallQawmi = activeTargetExams.some(e => (e.result_system || "general") === "qawmi");

      const combinedPercentage = combinedTotalFull > 0 ? (combinedTotalObtained / combinedTotalFull) * 100 : 0;

      const combinedGpa = hasAnyFail || !hasAnyResult ? 0 : (
        combinedPercentage >= 80 ? 5.0 :
        combinedPercentage >= 70 ? 4.0 :
        combinedPercentage >= 60 ? 3.5 :
        combinedPercentage >= 50 ? 3.0 :
        combinedPercentage >= 40 ? 2.0 :
        combinedPercentage >= 33 ? 1.0 : 0
      );

      const combinedGrade = hasAnyFail || !hasAnyResult ? "F" : (
        combinedPercentage >= 80 ? "A+" :
        combinedPercentage >= 70 ? "A" :
        combinedPercentage >= 60 ? "A-" :
        combinedPercentage >= 50 ? "B" :
        combinedPercentage >= 40 ? "C" :
        combinedPercentage >= 33 ? "D" : "F"
      );

      const combinedDarajah = hasAnyFail ? "রাসিব" : (
        hasAnyResult ? calcQawmiDarajah(combinedTotalObtained, combinedTotalFull) : "—"
      );

      const overallStatus = !hasAnyResult ? "no_result" : (hasAnyFail ? "fail" : "pass");

      return {
        student,
        studentId: student.id,
        studentNameEn: student.full_name_en || `Student #${student.id}`,
        studentNameBn: student.full_name_bn || "",
        photoUrl: student.photo_url || null,
        rollNumber: student.roll_number || String(student.id),
        numericRoll,
        branchName: b?.name_bn || b?.name_en || "Main Branch",
        classLabel,
        groupLabel,
        hasResult: hasAnyResult,
        isQawmi: isOverallQawmi,
        totalObtained: combinedTotalObtained,
        totalFull: combinedTotalFull,
        percentage: combinedPercentage,
        gpa: combinedGpa,
        grade: combinedGrade,
        darajah: combinedDarajah,
        status: overallStatus,
        examResults: studentExamResults,
        participatedExamsCount: validExamCount,
        targetExamsCount: activeTargetExams.length,
        singleExamResult: studentExamResults[0]?.result || null,
      };
    });

    // C. Filter by status
    let filteredList = enrichedRows;
    if (modalStatusFilter === "pass") {
      filteredList = enrichedRows.filter(r => r.status === "pass");
    } else if (modalStatusFilter === "fail") {
      filteredList = enrichedRows.filter(r => r.status === "fail");
    } else if (modalStatusFilter === "no_result") {
      filteredList = enrichedRows.filter(r => !r.hasResult);
    }

    // D. Sort to compute dedicated cohort ranking (Rank 1 to N)
    const sortedForRank = [...filteredList].sort((a, b) => {
      if (a.hasResult !== b.hasResult) return a.hasResult ? -1 : 1;
      const sA = a.status === "pass" ? 1 : 0;
      const sB = b.status === "pass" ? 1 : 0;
      if (sA !== sB) return sB - sA;
      if (b.totalObtained !== a.totalObtained) return b.totalObtained - a.totalObtained;
      if (b.gpa !== a.gpa) return b.gpa - a.gpa;
      return a.numericRoll - b.numericRoll;
    });

    let currentRank = 1;
    const rankedList = sortedForRank.map(item => {
      let cohortRank = null;
      if (item.hasResult) {
        cohortRank = currentRank;
        currentRank += 1;
      }
      return {
        ...item,
        cohortRank,
      };
    });

    // E. Secondary sort
    if (modalSortBy === "roll") {
      rankedList.sort((a, b) => a.numericRoll - b.numericRoll);
    } else if (modalSortBy === "name") {
      rankedList.sort((a, b) => a.studentNameEn.localeCompare(b.studentNameEn));
    }

    return rankedList;
  }, [allTeacherStudents, modalClassId, modalSearch, activeTargetExams, results, exams, branches, enrichResult, modalStatusFilter, modalSortBy]);

  // 5. Cohort Summary Stats
  const cohortStats = React.useMemo(() => {
    const totalAssigned = allTeacherStudents.length;
    const inCurrentClass = studentRows.length;
    const appeared = studentRows.filter(r => r.hasResult).length;
    const passed = studentRows.filter(r => r.status === "pass").length;
    const failed = studentRows.filter(r => r.status === "fail").length;
    const passRate = appeared > 0 ? (passed / appeared) * 100 : 0;
    const totalMarksSum = studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalObtained, 0);
    const avgMarks = appeared > 0 ? totalMarksSum / appeared : 0;
    const totalGpaSum = studentRows.filter(r => r.hasResult && r.status === "pass").reduce((sum, r) => sum + r.gpa, 0);
    const avgGpa = passed > 0 ? totalGpaSum / passed : 0;
    const topStudent = studentRows.find(r => r.hasResult && r.cohortRank === 1) || studentRows.find(r => r.hasResult);

    return {
      totalAssigned,
      inCurrentClass,
      appeared,
      passed,
      failed,
      passRate,
      avgMarks,
      avgGpa,
      topStudent,
    };
  }, [allTeacherStudents, studentRows]);

  // 6. Class-Level Teachers Ranking & Comparison (FAIR & NORMALIZED by Pass Rate % and Avg Marks per student, NOT raw sum)
  const classTeachersRanking = React.useMemo(() => {
    const targetBranchId = activeTeacher.branch_id;
    const relevantStudents = students.filter(s => {
      if (s.status === "inactive") return false;
      if (targetBranchId && String(s.branch_id) !== String(targetBranchId)) return false;
      if (modalClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(s.branch_id));
        const isMatch = isStudentInClassOption(s, modalClassId, b?.academic_structure) ||
          String(s.class_id) === String(modalClassId) ||
          (s.class_name && String(s.class_name).toLowerCase().includes(String(modalClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      return true;
    });

    const teacherStatsMap = new Map();

    relevantStudents.forEach(st => {
      const assignedT = getStudentAssignedTeacher(st, teachers);
      if (!assignedT) return;
      const tId = String(assignedT.id);
      if (!teacherStatsMap.has(tId)) {
        teacherStatsMap.set(tId, {
          teacherId: tId,
          teacherObj: assignedT,
          assignedCount: 0,
          appearedCount: 0,
          passedCount: 0,
          failedCount: 0,
          totalObtainedMarks: 0,
          totalFullMarks: 0,
          totalGpaSum: 0,
        });
      }
      const tStat = teacherStatsMap.get(tId);
      tStat.assignedCount += 1;

      let stHasResult = false;
      let stHasFail = false;
      let stObtSum = 0;
      let stFullSum = 0;

      activeTargetExams.forEach(examObj => {
        const r = results.find(res => String(res.exam_id) === String(examObj.id) && String(res.student_id) === String(st.id));
        if (r) {
          stHasResult = true;
          const enriched = enrichResult(r);
          const eFull = Number(enriched.total_full_marks || 0);
          const eObt = Number(enriched.total_obtained_marks || 0);
          if (enriched.status === "fail") stHasFail = true;
          stObtSum += eObt;
          stFullSum += eFull;
        }
      });

      if (stHasResult) {
        tStat.appearedCount += 1;
        tStat.totalObtainedMarks += stObtSum;
        tStat.totalFullMarks += stFullSum;
        if (stHasFail) {
          tStat.failedCount += 1;
        } else {
          tStat.passedCount += 1;
          const pct = stFullSum > 0 ? (stObtSum / stFullSum) * 100 : 0;
          const stGpa = pct >= 80 ? 5.0 : pct >= 70 ? 4.0 : pct >= 60 ? 3.5 : pct >= 50 ? 3.0 : pct >= 40 ? 2.0 : pct >= 33 ? 1.0 : 0;
          tStat.totalGpaSum += stGpa;
        }
      }
    });

    // Make sure currently active teacher is at least present in the map if they have assigned students
    const activeTeacherIdStr = String(activeTeacher.id);
    if (!teacherStatsMap.has(activeTeacherIdStr)) {
      teacherStatsMap.set(activeTeacherIdStr, {
        teacherId: activeTeacherIdStr,
        teacherObj: activeTeacher,
        assignedCount: allTeacherStudents.length,
        appearedCount: cohortStats.appeared,
        passedCount: cohortStats.passed,
        failedCount: cohortStats.failed,
        totalObtainedMarks: studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalObtained, 0),
        totalFullMarks: studentRows.filter(r => r.hasResult).reduce((sum, r) => sum + r.totalFull, 0),
        totalGpaSum: studentRows.filter(r => r.hasResult && r.status === "pass").reduce((sum, r) => sum + r.gpa, 0),
      });
    }

    const teacherList = Array.from(teacherStatsMap.values()).map(t => {
      const passRate = t.appearedCount > 0 ? (t.passedCount / t.appearedCount) * 100 : 0;
      const avgMarks = t.appearedCount > 0 ? t.totalObtainedMarks / t.appearedCount : 0;
      const avgPercentage = t.totalFullMarks > 0 ? (t.totalObtainedMarks / t.totalFullMarks) * 100 : 0;
      const avgGpa = t.passedCount > 0 ? t.totalGpaSum / t.passedCount : (t.appearedCount > 0 ? t.totalGpaSum / t.appearedCount : 0);

      let ratingLabel = "সন্তোষজনক";
      let ratingColor = "bg-slate-100 text-slate-700 border-slate-300";
      if (passRate >= 90 && avgPercentage >= 75) {
        ratingLabel = "🌟 অসাধারণ (Outstanding)";
        ratingColor = "bg-amber-100 text-amber-900 border-amber-300";
      } else if (passRate >= 80 && avgPercentage >= 65) {
        ratingLabel = "🟢 চমৎকার (Excellent)";
        ratingColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      } else if (passRate >= 60) {
        ratingLabel = "🟡 ভালো (Good)";
        ratingColor = "bg-teal-100 text-teal-800 border-teal-300";
      } else if (t.appearedCount > 0) {
        ratingLabel = "⚠️ উন্নয়ন প্রয়োজন";
        ratingColor = "bg-rose-100 text-rose-800 border-rose-300";
      } else {
        ratingLabel = "ফলাফল অনির্ধারিত";
        ratingColor = "bg-slate-100 text-slate-500 border-slate-200";
      }

      return {
        ...t,
        passRate,
        avgMarks,
        avgPercentage,
        avgGpa,
        ratingLabel,
        ratingColor,
      };
    }).sort((a, b) => {
      // 1. Pass Rate (higher is better)
      if (Math.abs(b.passRate - a.passRate) > 0.01) return b.passRate - a.passRate;
      // 2. Average Percentage / Marks per student (Fair for 10 vs 20 students)
      if (Math.abs(b.avgPercentage - a.avgPercentage) > 0.01) return b.avgPercentage - a.avgPercentage;
      if (Math.abs(b.avgMarks - a.avgMarks) > 0.01) return b.avgMarks - a.avgMarks;
      // 3. Average GPA
      if (Math.abs(b.avgGpa - a.avgGpa) > 0.01) return b.avgGpa - a.avgGpa;
      return b.assignedCount - a.assignedCount;
    }).map((t, idx) => ({ ...t, rank: idx + 1, totalTeachersCount: teacherStatsMap.size }));

    return teacherList;
  }, [students, activeTeacher, modalClassId, branches, teachers, activeTargetExams, results, enrichResult, allTeacherStudents, cohortStats, studentRows]);

  // Current selected teacher's position in this class
  const currentTeacherClassRank = React.useMemo(() => {
    return classTeachersRanking.find(t => String(t.teacherId) === String(activeTeacher.id)) || null;
  }, [classTeachersRanking, activeTeacher]);

  // Rank badge styling helper
  const renderCohortRankBadge = (rank) => {
    if (!rank) return <span className="text-slate-400 text-xs font-medium">—</span>;
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400">
          🥇 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-sm ring-2 ring-slate-400">
          🥈 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 text-amber-950 shadow-sm ring-2 ring-orange-300">
          🥉 3rd
        </span>
      );
    }
    if (rank <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          🎖️ #{rank}
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        {rank}
      </span>
    );
  };

  // Printable Teacher Result Sheet Handler (Handles 1, 2, 3 or All Exams)
  const handlePrintTeacherResultSheet = () => {
    if (studentRows.length === 0) {
      return toast.error("প্রিন্ট করার মতো কোনো শিক্ষার্থীর ফলাফল নেই।");
    }

    const branchName = teacherBranch?.name_bn || teacherBranch?.name_en || "রহমানিয়া ইনস্টিটিউট";
    const logoUrl = settings?.logo_url || DEFAULT_LOGO;
    const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
    const isQawmi = activeTargetExams.some(e => e.result_system === "qawmi");

    const examTitleStr = activeTargetExams.length === 0 
      ? "সকল পরীক্ষা"
      : activeTargetExams.length === 1
        ? activeTargetExams[0].title
        : `${activeTargetExams.map(e => e.title).join(" + ")} (যৌথ ফলাফল শিট)`;

    // If multiple exams (2, 3 or more), build exam columns
    const isMultiExamPrint = activeTargetExams.length > 1;

    let examHeadersHTML = "";
    if (isMultiExamPrint) {
      examHeadersHTML = activeTargetExams.map(e => `
        <th style="width: ${Math.max(10, Math.floor(40 / activeTargetExams.length))}%;">${e.title}</th>
      `).join("");
    }

    const rowsHTML = studentRows.map((r) => {
      const qawmiDarajah = isQawmi ? r.darajah : "";
      const rankDisplay = r.cohortRank ? `#${r.cohortRank}` : "—";
      const isFail = r.status === "fail";

      let examMarksCols = "";
      if (isMultiExamPrint) {
        examMarksCols = activeTargetExams.map(e => {
          const exRes = r.examResults.find(er => String(er.examId) === String(e.id));
          if (!exRes) return `<td style="border: 1px solid #002818; padding: 6px; color: #888;">—</td>`;
          const isExFail = exRes.status === "fail";
          return `
            <td style="border: 1px solid #002818; padding: 6px; ${isExFail ? "color: red; font-weight: bold;" : ""}">
              <strong>${exRes.totalObtained}</strong> / ${exRes.totalFull}
              <br/><span style="font-size: 9px; color: #666;">${exRes.grade} (${exRes.gpa.toFixed(2)})</span>
            </td>
          `;
        }).join("");
      }

      return `
        <tr>
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px;">${rankDisplay}</td>
          <td style="text-align: left; border: 1px solid #002818; padding: 6px;">
            <strong>${r.studentNameEn}</strong>
            ${r.studentNameBn ? `<br/><span style="font-size: 10px; color: #555;">${r.studentNameBn}</span>` : ""}
          </td>
          <td style="text-align: center; font-family: monospace; border: 1px solid #002818; padding: 6px;">${r.rollNumber}</td>
          <td style="text-align: center; border: 1px solid #002818; padding: 6px;">${r.classLabel}</td>
          ${examMarksCols}
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">
            ${r.hasResult ? `${r.totalObtained} / ${r.totalFull}` : "—"}
            ${r.hasResult ? `<br/><span style="font-size: 9.5px; color: #555;">(${r.percentage.toFixed(1)}%)</span>` : ""}
          </td>
          ${isQawmi
            ? `<td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#006241"};">${qawmiDarajah}</td>`
            : `<td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">${r.hasResult ? (isFail ? "0.00" : r.gpa.toFixed(2)) : "—"}</td>
               <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : "#004D3A"};">${r.grade}</td>`
          }
          <td style="text-align: center; font-weight: bold; border: 1px solid #002818; padding: 6px; color: ${isFail ? "#dc2626" : r.hasResult ? "#006241" : "#888"};">
            ${r.status === "pass" ? "পাস (PASS)" : r.status === "fail" ? "ফেল (FAIL)" : "ফলাফল নেই"}
          </td>
        </tr>
      `;
    }).join("");

    const teacherRankInfo = currentTeacherClassRank 
      ? `<div style="margin-top: 3px; font-size: 11px; color: #D4AF37;">
          এই ক্লাসে শিক্ষকের স্থান: <strong>#${currentTeacherClassRank.rank} (মোট ${classTeachersRanking.length} জন শিক্ষকের মধ্যে)</strong> | পাস হার: ${currentTeacherClassRank.passRate.toFixed(1)}% | গড় নম্বর: ${currentTeacherClassRank.avgMarks.toFixed(1)}
        </div>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>শিক্ষক ভিত্তিক রেজাল্ট শিট - ${activeTeacher.full_name_en || activeTeacher.full_name_bn}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', 'Segoe UI', system-ui, sans-serif; padding: 15px; color: #002818; background: #fff; }
          .sheet-container { border: 2px solid #004D3A; padding: 16px; border-radius: 8px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004D3A; padding-bottom: 12px; margin-bottom: 14px; }
          .logo-wrap { width: 70px; height: 70px; padding: 2px; border: 1px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
          .logo-wrap img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
          .inst-details { text-align: center; flex: 1; padding: 0 15px; }
          .meta-box { display: flex; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; font-size: 11.5px; margin-bottom: 12px; }
          .table-data { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
          .table-data th { background: #004D3A; color: white; padding: 7px 5px; border: 1px solid #002818; font-size: 10.5px; text-transform: uppercase; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 10px; }
          .sig-line { width: 160px; border-top: 1px dashed #444; text-align: center; font-size: 11px; padding-top: 5px; }
          @media print {
            body { padding: 0; }
            .sheet-container { border: none; }
            .table-data th { background-color: #004D3A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .meta-box { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <div class="header">
            <div class="logo-wrap"><img src="${logoUrl}" alt="Logo"></div>
            <div class="inst-details">
              <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #004D3A;">${instNameBn}</h1>
              <h2 style="margin: 3px 0 0; font-size: 13px; color: #D4AF37;">${instNameEn} - Teacher Assigned Result & Merit Sheet</h2>
              <div style="margin-top: 4px; display: inline-block; padding: 2px 10px; background: #004D3A; color: #fff; font-size: 11px; border-radius: 10px; font-weight: bold;">
                শিক্ষক: ${activeTeacher.full_name_bn || activeTeacher.full_name_en} ${activeTeacher.designation ? `(${activeTeacher.designation})` : ""}
              </div>
              ${teacherRankInfo}
            </div>
            <div style="width: 70px;"></div>
          </div>

          <div class="meta-box">
            <div>
              <div><strong>শাখা (Branch):</strong> ${branchName}</div>
              <div><strong>পরীক্ষা (Exams):</strong> ${examTitleStr}</div>
            </div>
            <div style="text-align: right;">
              <div><strong>মোট শিক্ষার্থী:</strong> ${studentRows.length} জন | <strong>পাস হার:</strong> ${cohortStats.passRate.toFixed(1)}%</div>
              <div><strong>মুদ্রণ তারিখ:</strong> ${format(new Date(), "dd/MM/yyyy")}</div>
            </div>
          </div>

          <table class="table-data">
            <thead>
              <tr>
                <th style="width: 6%;">র‍্যাংক</th>
                <th style="width: 22%; text-align: left;">শিক্ষার্থীর নাম</th>
                <th style="width: 9%;">রোল নং</th>
                <th style="width: 14%;">ক্লাস / বিভাগ</th>
                ${examHeadersHTML}
                <th style="width: 12%;">মোট প্রাপ্ত নম্বর</th>
                ${isQawmi
                  ? `<th style="width: 10%;">দারাজাহ</th>`
                  : `<th style="width: 6%;">GPA</th><th style="width: 6%;">গ্রেড</th>`
                }
                <th style="width: 9%;">ফলাফল</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-line">সংশ্লিষ্ট শিক্ষক স্বাক্ষর</div>
            <div class="sig-line">শাখা প্রধান / মুহতামিম</div>
            <div class="sig-line">পরীক্ষা নিয়ন্ত্রক</div>
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
  };

  // Bulk Print All Transcripts for this Teacher's Assigned Students
  const handlePrintTeacherAllCards = () => {
    const validRows = studentRows.filter(r => r.singleExamResult);
    if (validRows.length === 0) return toast.error("প্রিন্ট করার মতো কোনো রেজাল্ট কার্ড নেই।");

    const pagesHtml = validRows.map((r) => {
      const student = r.student;
      const examObj = exams.find(e => String(e.id) === String(r.singleExamResult.exam_id));
      const branchObj = branches.find(b => String(b.id) === String(r.singleExamResult.branch_id || student?.branch_id));
      const classNameVal = r.classLabel;
      const innerContent = getPrintableMarksheetInnerContent(student, branchObj, classNameVal, examObj, r.singleExamResult, settings, null, examObj?.result_system || "general");
      return `<div class="transcript-page">${innerContent}</div>`;
    }).filter(Boolean).join("");

    if (!pagesHtml) return toast.error("Could not generate transcripts");
    const fullDoc = getFullTranscriptDocumentHTML(pagesHtml, `${activeTeacher.full_name_en} - All Assigned Result Cards (${validRows.length})`);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(fullDoc);
    printWindow.document.close();
  };

  if (!isOpen || !initialTeacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border border-emerald-950/20 shadow-2xl bg-slate-50/95 backdrop-blur-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Assigned Students Result & Ranking</DialogTitle>
        </DialogHeader>

        {/* Modal Top Profile Banner */}
        <div className="bg-gradient-to-r from-[#052E2B] via-[#073831] to-[#0a4a3f] p-5 sm:p-6 text-white relative border-b border-emerald-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#D4AF37] shadow-lg">
                {activeTeacher.photo_url ? (
                  <img src={activeTeacher.photo_url} alt={activeTeacher.full_name_en} className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-8 w-8 text-[#D4AF37]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                    Teacher Result & Ranking View
                  </span>
                  
                  {/* Fair Normalized Teacher Rank Badge */}
                  {currentTeacherClassRank && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm flex items-center gap-1">
                      🏆 {modalClassId !== "all" ? "এই ক্লাসে" : "সার্বিক"} {currentTeacherClassRank.rank} নম্বর শিক্ষক 
                      {classTeachersRanking.length > 1 && ` (মোট ${classTeachersRanking.length} জনের মধ্যে)`}
                    </span>
                  )}

                  {modalExamIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#D4AF37] text-[#052E2B] shadow-2xs">
                      {modalExamIds.length}টি পরীক্ষা যৌথ নির্বাচন
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 truncate">
                  {activeTeacher.full_name_bn || activeTeacher.full_name_en}
                  {activeTeacher.full_name_bn && activeTeacher.full_name_en && (
                    <span className="text-sm font-normal text-white/80 ml-2">({activeTeacher.full_name_en})</span>
                  )}
                </h2>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-1 flex-wrap font-medium">
                  <span>{activeTeacher.designation || "শিক্ষক"}</span>
                  <span>•</span>
                  <span>{teacherBranch?.name_bn || teacherBranch?.name_en || "রহমানিয়া ইনস্টিটিউট"}</span>
                  <span>•</span>
                  <span>মোট শিক্ষার্থী: <strong className="text-[#D4AF37]">{allTeacherStudents.length} জন</strong></span>
                  {currentTeacherClassRank && (
                    <>
                      <span>•</span>
                      <span>পাস হার: <strong className="text-emerald-300">{currentTeacherClassRank.passRate.toFixed(1)}%</strong></span>
                      <span>•</span>
                      <span>গড় নম্বর: <strong className="text-amber-200">{currentTeacherClassRank.avgMarks.toFixed(1)}</strong></span>
                      <span>•</span>
                      <span>গড় GPA: <strong className="text-yellow-300">{currentTeacherClassRank.avgGpa.toFixed(2)}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                size="sm"
                onClick={handlePrintTeacherResultSheet}
                className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] font-bold text-xs rounded-xl h-9 px-3.5 shadow-sm gap-1.5"
              >
                <Printer className="h-4 w-4" /> রেজাল্ট শিট প্রিন্ট
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs rounded-xl h-9 px-3"
              >
                <X className="h-4 w-4" /> বন্ধ করুন
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* Statistical Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-[#052E2B]">
              <span className="text-[10px] uppercase font-bold text-slate-400">মোট শিক্ষার্থী</span>
              <span className="text-xl font-extrabold text-[#052E2B]">{cohortStats.inCurrentClass} জন</span>
              <span className="text-[10px] text-slate-500">অ্যাসাইন করা তালিকা</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-teal-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">পরীক্ষায় অংশ</span>
              <span className="text-xl font-extrabold text-teal-700">{cohortStats.appeared} জন</span>
              <span className="text-[10px] text-slate-500">
                {modalExamIds.length > 1 ? `${modalExamIds.length}টি পরীক্ষায় যুক্ত` : "নম্বর যুক্ত ফলাফল"}
              </span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-emerald-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">পাস শিক্ষার্থী</span>
              <span className="text-xl font-extrabold text-emerald-600">{cohortStats.passed} জন</span>
              <span className="text-[10px] text-emerald-700 font-bold">পাস হার: {cohortStats.passRate.toFixed(1)}%</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-red-500">
              <span className="text-[10px] uppercase font-bold text-slate-400">অকৃতকার্য</span>
              <span className="text-xl font-extrabold text-red-600">{cohortStats.failed} জন</span>
              <span className="text-[10px] text-slate-500">এক বা একাধিক পরীক্ষায়</span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-amber-500">
              <span className="text-[10px] uppercase font-bold text-slate-400">সেরা শিক্ষার্থী</span>
              <span className="text-xs font-bold text-amber-900 truncate">
                {cohortStats.topStudent ? cohortStats.topStudent.studentNameEn : "—"}
              </span>
              <span className="text-[10px] text-amber-700 font-bold">
                {cohortStats.topStudent?.hasResult ? `${cohortStats.topStudent.totalObtained} নম্বর (#1)` : "ফলাফল নেই"}
              </span>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl p-3.5 flex flex-col gap-1 border-t-4 border-t-indigo-600">
              <span className="text-[10px] uppercase font-bold text-slate-400">শিক্ষকের অবস্থান (Rank)</span>
              <span className="text-base font-extrabold text-indigo-900 flex items-center gap-1">
                🏆 #{currentTeacherClassRank ? currentTeacherClassRank.rank : 1} শিক্ষক
              </span>
              <span className="text-[10px] text-indigo-700 font-bold">
                {classTeachersRanking.length > 1 ? `মোট ${classTeachersRanking.length} জন শিক্ষকের মধ্যে` : "একক শিক্ষক"}
              </span>
            </Card>
          </div>

          {/* In-Modal Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* 1. Multi-Exam Selector (একাধিক পরীক্ষা নির্বাচন: ১টি, ২টি, ৩টি বা সকল পরীক্ষা) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">
                    পরীক্ষা ({modalExamIds.length === 0 ? "সকল" : `${modalExamIds.length}টি`})
                  </label>
                  {modalExamIds.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllExams}
                      className="text-[9px] text-[#052E2B] hover:underline font-bold"
                    >
                      সব দেখুন
                    </button>
                  )}
                </div>

                <Popover open={isExamDropdownOpen} onOpenChange={setIsExamDropdownOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full h-9 px-3 text-xs rounded-xl border flex items-center justify-between transition-all text-left font-semibold ${
                        modalExamIds.length > 0
                          ? "bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className="truncate flex-1 mr-1.5">{examSelectorLabel}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {modalExamIds.length > 0 && (
                          <span className="bg-[#052E2B] text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                            {modalExamIds.length}
                          </span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 sm:w-80 p-2 rounded-2xl shadow-xl border-slate-200 bg-white z-50">
                    <div className="p-2 border-b border-slate-100 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        একাধিক পরীক্ষা নির্বাচন
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={selectAllExams}
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                            modalExamIds.length === 0 ? "bg-[#052E2B] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          সকল পরীক্ষা
                        </button>
                        {modalExamIds.length > 0 && (
                          <button
                            type="button"
                            onClick={selectAllExams}
                            className="text-[10px] px-1.5 py-0.5 rounded-lg text-red-600 font-bold hover:bg-red-50"
                          >
                            রিসেট
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                      {availableExams.length === 0 ? (
                        <p className="p-3 text-center text-xs text-slate-400 italic">কোনো পরীক্ষা পাওয়া যায়নি</p>
                      ) : (
                        availableExams.map(exam => {
                          const idStr = String(exam.id);
                          const isIndividuallySelected = modalExamIds.includes(idStr);

                          return (
                            <button
                              key={exam.id}
                              type="button"
                              onClick={() => toggleExamSelection(exam.id)}
                              className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs ${
                                isIndividuallySelected
                                  ? "bg-amber-50 text-amber-950 font-bold border border-amber-200 shadow-2xs"
                                  : "hover:bg-slate-50 text-slate-700 font-medium"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                isIndividuallySelected
                                  ? "bg-[#052E2B] border-[#052E2B] text-[#D4AF37]"
                                  : modalExamIds.length === 0
                                    ? "bg-teal-700/10 border-teal-700/30 text-teal-900"
                                    : "border-slate-300 bg-white"
                              }`}>
                                {(isIndividuallySelected || modalExamIds.length === 0) && (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-bold">{exam.title}</p>
                                <p className="text-[10px] text-emerald-800 font-semibold truncate">
                                  {(() => {
                                    const b = (branches || []).find(br => String(br.id) === String(exam.branch_id));
                                    const classLabel = resolveAcademicDisplayName(
                                      exam.class_id,
                                      exam.session_id,
                                      exam.class_group_id,
                                      b?.academic_structure,
                                      'bn'
                                    );
                                    const labelPart = classLabel ? `${classLabel} • ` : "";
                                    return `${labelPart}${exam.academic_year || "২০২৬"}${exam.result_system === "qawmi" ? " • কওমি" : ""}`;
                                  })()}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{modalExamIds.length === 0 ? `সকল (${availableExams.length}টি) পরীক্ষা সক্রিয়` : `${modalExamIds.length}টি পরীক্ষা সক্রিয়`}</span>
                      <Button
                        size="sm"
                        onClick={() => setIsExamDropdownOpen(false)}
                        className="h-6 text-[10px] font-bold bg-[#052E2B] text-white rounded-lg px-2.5"
                      >
                        সম্পন্ন
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 2. Class Selector */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ক্লাস / বিভাগ</label>
                <Select value={modalClassId} onValueChange={setModalClassId}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল ক্লাস ({allTeacherStudents.length} জন)</SelectItem>
                    {teacherClasses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Status Filter */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ফলাফল ফিল্টার</label>
                <Select value={modalStatusFilter} onValueChange={setModalStatusFilter}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ফলাফল (All)</SelectItem>
                    <SelectItem value="pass">উত্তীর্ণ (Passed)</SelectItem>
                    <SelectItem value="fail">অকৃতকার্য (Failed)</SelectItem>
                    <SelectItem value="no_result">ফলাফল এন্ট্রি বাকি</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Sort By */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">সাজান (Sort By)</label>
                <Select value={modalSortBy} onValueChange={setModalSortBy}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank">মেধা র‍্যাংকিং (১ থেকে N)</SelectItem>
                    <SelectItem value="roll">রোল নম্বর অনুযায়ী</SelectItem>
                    <SelectItem value="name">নাম অনুযায়ী</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Search Student */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">শিক্ষার্থী খুঁজুন</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    placeholder="রোল বা নাম..."
                    className="pl-8 h-9 text-xs bg-slate-50 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Selected Exam Interactive Badges/Pills */}
            {modalExamIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-500" /> নির্বাচিত পরীক্ষা:
                </span>
                {modalExamIds.map(eId => {
                  const exObj = availableExams.find(e => String(e.id) === String(eId));
                  if (!exObj) return null;
                  return (
                    <span
                      key={eId}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200 shadow-2xs"
                    >
                      {exObj.title}
                      <button
                        type="button"
                        onClick={() => toggleExamSelection(eId)}
                        className="hover:text-red-700 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                        title="পরীক্ষা বাদ দিন"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={selectAllExams}
                  className="text-[10px] font-bold text-red-600 hover:underline ml-1"
                >
                  রিসেট (সকল পরীক্ষা দেখুন)
                </button>
              </div>
            )}
          </div>

          {/* Class Teachers Performance & Ranking Comparison Section (Feature requested by user) */}
          {classTeachersRanking.length > 0 && (
            <Card className="border-0 shadow-xs bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 rounded-2xl overflow-hidden border border-amber-200/70">
              <CardHeader className="border-b border-amber-100/80 p-4 flex flex-row items-center justify-between flex-wrap gap-2 bg-gradient-to-r from-amber-50/60 to-emerald-50/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-xs font-bold text-[#052E2B] uppercase tracking-wider">
                    {modalClassId !== "all" ? "এই ক্লাসের" : "শাখার"} শিক্ষকদের মেধা র‍্যাংকিং ও পারফরম্যান্স তুলনা ({classTeachersRanking.length} জন)
                  </CardTitle>
                  <span className="text-[10px] text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full font-extrabold border border-amber-300">
                    গড় নম্বর ও পাস হারের ভিত্তিতে নিরপেক্ষ র‍্যাংকিং
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  *শিক্ষার্থীর সংখ্যার তারতম্য নিরপেক্ষ করতে গড় প্রাপ্ত নম্বর, পাস হার % ও গড় GPA-র ভিত্তিতে এই মেধা তালিকা তৈরি করা হয়েছে।
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-100 text-slate-600 font-bold">
                        <th className="py-2.5 px-3 text-center w-14">স্থান (Rank)</th>
                        <th className="py-2.5 px-3 text-left">শিক্ষকের নাম</th>
                        <th className="py-2.5 px-3 text-center">মোট শিক্ষার্থী</th>
                        <th className="py-2.5 px-3 text-center">পরীক্ষায় অংশ</th>
                        <th className="py-2.5 px-3 text-center">পাস শিক্ষার্থী</th>
                        <th className="py-2.5 px-3 text-center">পাস হার (%)</th>
                        <th className="py-2.5 px-3 text-center">গড় নম্বর (প্রতি শিক্ষার্থী)</th>
                        <th className="py-2.5 px-3 text-center">গড় GPA</th>
                        <th className="py-2.5 px-3 text-center">পারফরম্যান্স রেটিং</th>
                        <th className="py-2.5 px-3 text-end">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classTeachersRanking.map((t) => {
                        const isCurrent = String(t.teacherId) === String(activeTeacher.id);
                        return (
                          <tr
                            key={t.teacherId}
                            className={`transition-colors ${
                              isCurrent
                                ? "bg-amber-100/60 font-semibold text-amber-950"
                                : "hover:bg-slate-50/80 text-slate-700"
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-extrabold">
                              {t.rank === 1 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-2xs">
                                  🥇 #1
                                </span>
                              ) : t.rank === 2 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 shadow-2xs">
                                  🥈 #2
                                </span>
                              ) : t.rank === 3 ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-200 to-orange-300 text-amber-950 shadow-2xs">
                                  🥉 #3
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                                  #{t.rank}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                                  {t.teacherObj?.photo_url ? (
                                    <img src={t.teacherObj.photo_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Users className="h-3.5 w-3.5 text-slate-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs truncate">
                                    {t.teacherObj?.full_name_bn || t.teacherObj?.full_name_en || `Teacher #${t.teacherId}`}
                                    {isCurrent && (
                                      <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-[#052E2B] text-[#D4AF37] font-extrabold uppercase">
                                        নির্বাচিত
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{t.teacherObj?.designation || "শিক্ষক"}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{t.assignedCount} জন</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{t.appearedCount} জন</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{t.passedCount} জন</td>

                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                t.passRate >= 85 ? "bg-emerald-100 text-emerald-800" : t.passRate >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                              }`}>
                                {t.passRate.toFixed(1)}%
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span className="font-extrabold text-[#052E2B] text-xs">
                                {t.avgMarks.toFixed(1)}
                              </span>
                              <span className="text-[9.5px] text-slate-500 ml-1 font-normal">
                                ({t.avgPercentage.toFixed(1)}%)
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center font-bold text-indigo-900">
                              {t.avgGpa.toFixed(2)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${t.ratingColor}`}>
                                {t.ratingLabel}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-end">
                              {!isCurrent ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActiveTeacher(t.teacherObj)}
                                  className="h-7 text-[10px] font-bold bg-white hover:bg-slate-100 text-[#052E2B] border-slate-200 rounded-lg px-2.5"
                                >
                                  রেজাল্ট দেখুন →
                                </Button>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-extrabold px-2">✓ সক্রিয়</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Students Results & Merit List Table */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">
                  শিক্ষকের শিক্ষার্থীদের মেধাতালিকা ও ফলাফল ({studentRows.length} জন)
                </CardTitle>
                <Badge className="bg-[#052E2B]/10 text-[#052E2B] hover:bg-[#052E2B]/20 font-bold text-[10px] rounded-lg">
                  ১ থেকে আলাদা র‍্যাংকিং
                </Badge>
                {isMultipleExams && (
                  <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-lg">
                    {activeTargetExams.length}টি পরীক্ষা যৌথ ফলাফল
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handlePrintTeacherResultSheet}
                  size="sm"
                  className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-8 px-3"
                >
                  <Printer className="h-3.5 w-3.5" /> রেজাল্ট শিট প্রিন্ট
                </Button>
                {studentRows.filter(r => r.hasResult).length > 0 && (
                  <Button
                    onClick={handlePrintTeacherAllCards}
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] gap-1.5 text-xs font-bold rounded-xl h-8 px-3 shadow-xs"
                  >
                    <FileText className="h-3.5 w-3.5" /> সকল কার্ড প্রিন্ট ({studentRows.filter(r => r.hasResult).length})
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {studentRows.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs">
                  কোনো শিক্ষার্থী বা ফলাফল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় দেখুন।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="py-3 px-4 text-center font-bold text-slate-600 w-16">র‍্যাংক</th>
                        <th className="py-3 px-4 text-left font-bold text-slate-600">শিক্ষার্থীর নাম</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">রোল / আইডি</th>
                        <th className="py-3 px-4 text-left font-bold text-slate-600">ক্লাস ও গ্রুপ</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "যৌথ প্রাপ্ত নম্বর" : "প্রাপ্ত নম্বর"}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "যৌথ GPA / গ্রেড" : "GPA / গ্রেড"}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-center font-bold text-slate-600">
                          {isMultipleExams ? "পরীক্ষা ও বিষয়" : "বিষয়ভিত্তিক"}
                        </th>
                        <th className="py-3 px-4 text-end font-bold text-slate-600">প্রিন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {studentRows.map((r) => {
                        const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                        const isExpanded = expandedStudentId === r.studentId;
                        return (
                          <React.Fragment key={r.studentId}>
                            <tr className={`hover:bg-slate-50/60 transition-colors ${r.cohortRank === 1 ? "bg-amber-50/20" : ""}`}>
                              {/* Dedicated 1 to N Cohort Rank */}
                              <td className="py-3 px-4 text-center">
                                {renderCohortRankBadge(r.cohortRank)}
                              </td>

                              {/* Student Name */}
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-800">{r.studentNameEn}</p>
                                <p className="text-[10px] text-slate-500">{r.studentNameBn}</p>
                              </td>

                              {/* Roll & ID */}
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-700 text-[11px]">
                                  {r.rollNumber}
                                </span>
                              </td>

                              {/* Class & Group */}
                              <td className="py-3 px-4">
                                <p className="text-slate-700 font-semibold">{r.classLabel}</p>
                                <p className="text-[10px] text-slate-400">{r.groupLabel}</p>
                              </td>

                              {/* Marks (Combined if multiple exams) */}
                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  <div>
                                    <span className="font-extrabold text-slate-800 text-sm">{r.totalObtained}</span>
                                    <span className="text-[10px] text-slate-400"> / {r.totalFull}</span>
                                    {isMultipleExams && (
                                      <p className="text-[9px] text-amber-800 font-bold">
                                        ({r.participatedExamsCount}টি পরীক্ষা যৌথ)
                                      </p>
                                    )}
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${r.status === "pass" ? "bg-emerald-500" : "bg-red-400"}`}
                                        style={{ width: `${Math.min(100, r.percentage)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">এন্ট্রি বাকি</span>
                                )}
                              </td>

                              {/* GPA / Grade / Darajah */}
                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  r.isQawmi ? (
                                    <span className="font-bold text-xs" style={{ color: r.status === "fail" ? "#cc0000" : "#006241" }}>
                                      {r.darajah}
                                    </span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="font-bold text-xs" style={{ color: gc.text }}>
                                        {r.status === "fail" ? "0.00" : r.gpa.toFixed(2)}
                                      </span>
                                      <span
                                        className="px-2 py-0.2 rounded-full font-bold text-[10px]"
                                        style={{ background: gc.bg, color: gc.text }}
                                      >
                                        {r.grade}
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3 px-4 text-center">
                                {r.hasResult ? (
                                  <Badge className={`text-[10px] font-bold ${
                                    r.status === "pass"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}>
                                    {r.status === "pass" ? "পাস (Pass)" : "ফেল (Fail)"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-slate-50 text-slate-400 text-[10px]">
                                    No Result
                                  </Badge>
                                )}
                              </td>

                              {/* Breakdown Accordion Toggle */}
                              <td className="py-3 px-4 text-center">
                                {r.hasResult && r.examResults.length > 0 ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setExpandedStudentId(isExpanded ? null : r.studentId)}
                                    className="h-7 text-[10px] font-bold rounded-lg gap-1 text-teal-800 hover:bg-teal-50 px-2"
                                  >
                                    {isExpanded ? "লুকান" : isMultipleExams ? "পরীক্ষাভিত্তিক" : "নম্বর দেখুন"}
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </Button>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">—</span>
                                )}
                              </td>

                              {/* Print Individual */}
                              <td className="py-3 px-4 text-end">
                                {r.singleExamResult ? (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handlePrintIndividual(r.singleExamResult)}
                                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#052E2B]"
                                    title="Print Transcript"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <span className="text-slate-300 text-xs px-2">—</span>
                                )}
                              </td>
                            </tr>

                            {/* Collapsible Details Row (Multi-Exam Cards & Subject Marks) */}
                            {isExpanded && r.hasResult && (
                              <tr className="bg-emerald-50/30">
                                <td colSpan={9} className="p-4">
                                  <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                      <p className="text-xs font-bold text-[#052E2B] flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                                        {r.studentNameEn} ({r.studentNameBn}) - এর পরীক্ষার বিস্তারিত ফলাফল
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-600">
                                          যৌথ মোট নম্বর: <strong className="text-teal-700">{r.totalObtained} / {r.totalFull}</strong> ({r.percentage.toFixed(1)}%)
                                        </span>
                                      </div>
                                    </div>

                                    {/* Exam Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {r.examResults.map((exRes, eIdx) => {
                                        const exGc = GRADE_COLORS[exRes.grade] || GRADE_COLORS["F"];
                                        return (
                                          <div key={eIdx} className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                                              <div>
                                                <p className="font-bold text-xs text-slate-800">{exRes.examTitle}</p>
                                                <p className="text-[9.5px] text-slate-400">{exRes.academicYear || "২০২৬"}</p>
                                              </div>
                                              <Badge className={`text-[9px] font-bold ${
                                                exRes.status === "pass" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                              }`}>
                                                {exRes.status === "pass" ? "পাস" : "ফেল"}
                                              </Badge>
                                            </div>

                                            <div className="flex items-center justify-between text-xs py-1">
                                              <span className="text-slate-500">প্রাপ্ত নম্বর:</span>
                                              <span className="font-extrabold text-slate-800">
                                                {exRes.totalObtained} <span className="text-[10px] text-slate-400">/ {exRes.totalFull}</span>
                                              </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs py-1">
                                              <span className="text-slate-500">GPA / গ্রেড:</span>
                                              <span className="font-extrabold" style={{ color: exGc.text }}>
                                                {exRes.isQawmi ? exRes.darajah : `${exRes.gpa.toFixed(2)} (${exRes.grade})`}
                                              </span>
                                            </div>

                                            {/* Subject marks for this exam */}
                                            {exRes.marksDetails && exRes.marksDetails.length > 0 && (
                                              <div className="pt-2 border-t border-slate-200/60 space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">বিষয়ভিত্তিক নম্বর:</p>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                  {exRes.marksDetails.map((sub, sIdx) => {
                                                    const isSubFail = Number(sub.obtained_marks) < Number(sub.pass_marks);
                                                    const subName = sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name || `Sub #${sIdx + 1}`;
                                                    return (
                                                      <div key={sIdx} className={`p-1.5 rounded-lg border text-center text-[10px] ${
                                                        isSubFail ? "bg-red-50 border-red-200 text-red-900 font-bold" : "bg-white border-slate-200 text-slate-700"
                                                      }`}>
                                                        <p className="truncate font-semibold">{subName}</p>
                                                        <p className="font-bold mt-0.5" style={{ color: isSubFail ? "#dc2626" : "#052E2B" }}>
                                                          {sub.obtained_marks || 0} <span className="text-[8.5px] text-slate-400">/ {sub.full_marks || 100}</span>
                                                        </p>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100/90 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-b-3xl">
          <div className="text-xs text-slate-500">
            শিক্ষক: <strong>{activeTeacher.full_name_bn || activeTeacher.full_name_en}</strong> | 
            {currentTeacherClassRank ? ` এই ক্লাসে স্থান: #${currentTeacherClassRank.rank} (মোট ${classTeachersRanking.length} জনের মধ্যে) | ` : ""}
            {modalExamIds.length === 0 ? " সকল পরীক্ষার ফলাফল" : ` নির্বাচিত পরীক্ষা: ${modalExamIds.length}টি`} | 
            মোট শিক্ষার্থী: <strong>{allTeacherStudents.length} জন</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrintTeacherResultSheet}
              className="bg-[#052E2B] hover:bg-[#031c1a] text-white text-xs font-bold rounded-xl h-9 px-4 gap-1.5"
            >
              <Printer className="h-4 w-4" /> রেজাল্ট শিট প্রিন্ট
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl h-9 px-4"
            >
              বন্ধ করুন (Close)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────
// Admin Result Dashboard
// ────────────────────────────────────────────────────────
function AdminResultDashboard({ branches, exams, students, teachers = [], settings, currentUser }) {
  const isSuperAdmin = currentUser?.role !== "branch_admin";

  // ── Single-branch states (used by branch_admin and super admin when in single mode) ──
  const [selBranchId, setSelBranchId] = useState("all");
  const [selTeacherId, setSelTeacherId] = useState("all"); // Feature 1: optional teacher filter
  const [teacherAssignedModal, setTeacherAssignedModal] = useState(null); // { teacher, initialExamId, initialClassId }

  // ── Super Admin multi-branch states (Feature 2) ──
  const [multiMode, setMultiMode] = useState(false); // toggle between single & multi-branch view
  const [selBranchIds, setSelBranchIds] = useState([]); // array of selected branch IDs

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
    setSelTeacherId("all");
  }, [selClassId]);

  React.useEffect(() => {
    setSelTeacherId("all");
  }, [selBranchId]);

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["admin-dashboard-results"],
    queryFn: () => appClient.entities.ExamResult.listAll({ sort: "id" }),
  });

  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  const flatClassOptions = React.useMemo(() => getFlatClassOptions(classes), [classes]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === selClassId);
  const classIdForExams = selectedFlatClass?.classId || selClassId;

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

  // Filter list of exams based on branch and class
  const filteredExams = exams.filter(e => {
    const bMatch = selBranchId === "all" || String(e.branch_id) === String(selBranchId);
    const cMatch = selClassId === "all" || String(e.class_id) === String(classIdForExams);
    return bMatch && cMatch;
  });

  // ── Feature 1: Teacher options for selected branch + class ──
  const teacherOptions = React.useMemo(() => {
    if (selBranchId === "all") return teachers;
    const branchTeachers = teachers.filter(t => String(t.branch_id) === String(selBranchId));
    if (selClassId === "all") return branchTeachers;

    const branchStudents = students.filter(s => String(s.branch_id) === String(selBranchId));
    const classStudents = branchStudents.filter(s => 
      isStudentInClassOption(s, selClassId, selectedBranch?.academic_structure) ||
      String(s.class_id) === String(selClassId) ||
      String(s.class_id) === String(classIdForExams)
    );

    const classLabel = (selectedFlatClass?.label || "").toLowerCase().trim();
    const classNamesToMatch = [
      classLabel,
      (selectedFlatClass?.className || "").toLowerCase().trim(),
      (selectedFlatClass?.sectionName || "").toLowerCase().trim(),
      String(selClassId).toLowerCase().trim(),
      String(classIdForExams).toLowerCase().trim()
    ].filter(Boolean);

    // Only teachers who teach or have assigned students in this specific class
    return branchTeachers.filter(t => {
      // 1. Direct assigned students in this class
      if (classStudents.some(s => isStudentAssignedToTeacher(s, t))) {
        return true;
      }
      // 2. Teacher assigned_batches (which stores class names/batches assigned to this teacher)
      if (t.assigned_batches) {
        const teacherBatches = String(t.assigned_batches)
          .split(",")
          .map(b => b.trim().toLowerCase())
          .filter(Boolean);

        if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) {
          return true;
        }

        const isBatchMatch = teacherBatches.some(tb =>
          classNamesToMatch.some(cn => cn === tb || cn.includes(tb) || tb.includes(cn))
        );
        if (isBatchMatch) return true;
      }
      // 3. Department or Classes array match
      const tDept = (t.department || "").toLowerCase().trim();
      if (tDept && classNamesToMatch.some(cn => cn === tDept || cn.includes(tDept) || tDept.includes(cn))) {
        return true;
      }

      return false;
    });
  }, [selBranchId, selClassId, students, teachers, selectedBranch, selectedFlatClass, classIdForExams]);

  const selectedTeacher = teachers.find(t => String(t.id) === String(selTeacherId));

  // ── Core result enrichment + filtering (single-branch mode) ──
  const enrichResult = React.useCallback((r) => {
    const allMarksDetails = Array.isArray(r.marks_details) ? r.marks_details : [];
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    const branchObj = branches.find(b => String(b.id) === String(r.branch_id));
    const activeSubjectIds = (() => {
      if (!examObj || !branchObj) return null;
      const structure = branchObj.academic_structure || [];
      const cls = structure.find(c => String(c.id) === String(examObj.class_id));
      if (!cls) return null;
      let activeSubs = [];
      if (examObj.session_id && Array.isArray(cls.sections)) {
        const sec = cls.sections.find(s => String(s.id) === String(examObj.session_id));
        if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) activeSubs = sec.subjects;
      }
      if (activeSubs.length === 0 && examObj.class_group_id && Array.isArray(cls.groups)) {
        const grp = cls.groups.find(g => String(g.id) === String(examObj.class_group_id));
        if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) activeSubs = grp.subjects;
      }
      if (activeSubs.length === 0 && Array.isArray(cls.subjects)) activeSubs = cls.subjects;
      return activeSubs.length > 0 ? new Set(activeSubs.map(s => String(s.id))) : null;
    })();
    const marksDetails = activeSubjectIds
      ? allMarksDetails.filter(m => activeSubjectIds.has(String(m.subject_id)))
      : allMarksDetails;
    const tFull = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
    const tObt  = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
    const isFailed = marksDetails.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
    const overallPct = tFull > 0 ? (tObt / tFull) * 100 : 0;
    const overallGpa = isFailed ? 0 : (
      overallPct >= 80 ? 5.0 : overallPct >= 70 ? 4.0 : overallPct >= 60 ? 3.5 :
      overallPct >= 50 ? 3.0 : overallPct >= 40 ? 2.0 : overallPct >= 33 ? 1.0 : 0
    );
    const overallGrade = isFailed ? "F" : (
      overallPct >= 80 ? "A+" : overallPct >= 70 ? "A" : overallPct >= 60 ? "A-" :
      overallPct >= 50 ? "B"  : overallPct >= 40 ? "C" : overallPct >= 33 ? "D" : "F"
    );
    return { ...r, total_full_marks: tFull, total_obtained_marks: tObt, gpa: overallGpa, grade: overallGrade, status: isFailed ? "fail" : "pass" };
  }, [exams, branches]);

  const meritSort = (a, b) => {
    const sA = a.status === "pass" ? 1 : 0;
    const sB = b.status === "pass" ? 1 : 0;
    if (sA !== sB) return sB - sA;
    if ((a.total_obtained_marks || 0) !== (b.total_obtained_marks || 0))
      return (b.total_obtained_marks || 0) - (a.total_obtained_marks || 0);
    return (b.gpa || 0) - (a.gpa || 0);
  };

  const findStudentForResult = React.useCallback((r) => {
    if (!r || r.student_id === undefined || r.student_id === null) return null;
    const targetId = String(r.student_id).trim();
    return students.find(s =>
      String(s.id).trim() === targetId ||
      (s.student_id && String(s.student_id).trim() === targetId) ||
      (s.roll_number && String(s.roll_number).trim() === targetId)
    ) || null;
  }, [students]);

  // ── Single-branch filtered results ──
  const filteredResults = results.map(enrichResult).filter(r => {
    const examObj = exams.find(e => String(e.id) === String(r.exam_id));
    if (!examObj) return false;
    const student = findStudentForResult(r);
    const branchId = r.branch_id || student?.branch_id || examObj.branch_id;
    const branchObj = branches.find(b => String(b.id) === String(branchId));

    if (selExamId !== "all" && String(r.exam_id) !== String(selExamId)) return false;
    if (selBranchId !== "all" && String(branchId) !== String(selBranchId)) return false;

    if (selClassId !== "all") {
      const classMatch =
        (examObj && (String(examObj.class_id) === String(selClassId) || String(examObj.class_id) === String(classIdForExams))) ||
        (student && isStudentInClassOption(student, selClassId, branchObj?.academic_structure)) ||
        (student && String(student.class_id) === String(selClassId)) ||
        (student && student.class_name && String(student.class_name).toLowerCase().includes(String(selClassId).toLowerCase()));
      if (!classMatch) return false;
    }

    if (selGroupId !== "all" && student && String(student.class_group_id) !== String(selGroupId) && String(examObj.class_group_id) !== String(selGroupId)) return false;

    // Feature 1: Teacher filter (optional) — only students assigned to this teacher
    if (selTeacherId !== "all" && selectedTeacher) {
      if (!student) return false;
      if (!isStudentAssignedToTeacher(student, selectedTeacher)) return false;
    }

    const q = search.toLowerCase().trim();
    if (!q) return true;
    const studentNameEn = student?.full_name_en?.toLowerCase() || "";
    const studentNameBn = student?.full_name_bn?.toLowerCase() || "";
    const studentRoll = student?.roll_number?.toLowerCase() || "";
    const studentPkId = String(student?.id || "").toLowerCase();
    const studentCodeId = String(student?.student_id || "").toLowerCase();
    const resultStudentId = String(r.student_id || "").toLowerCase();

    return (
      studentNameEn.includes(q) ||
      studentNameBn.includes(q) ||
      studentRoll.includes(q) ||
      studentPkId.includes(q) ||
      studentCodeId.includes(q) ||
      resultStudentId.includes(q)
    );
  }).sort(meritSort).map((r, i) => ({ ...r, liveRank: i + 1 }));

  // ── Teacher info card data (Feature 1) ──
  const teacherTotalAssignedCount = React.useMemo(() => {
    if (selTeacherId === "all" || !selectedTeacher) return 0;
    return students.filter(s => {
      const isAssigned = isStudentAssignedToTeacher(s, selectedTeacher);
      const isActive = !s.status || s.status.toLowerCase() === "active";
      return isAssigned && isActive;
    }).length;
  }, [selTeacherId, selectedTeacher, students]);

  const teacherStudentCount = React.useMemo(() => {
    if (selTeacherId === "all" || !selectedTeacher) return 0;
    return filteredResults.length;
  }, [selTeacherId, selectedTeacher, filteredResults.length]);

  // ── Summary stats ──
  const totalEntered  = filteredResults.length;
  const passedCount   = filteredResults.filter(r => r.status === "pass").length;
  const failedCount   = filteredResults.filter(r => r.status === "fail").length;
  const passRate      = totalEntered > 0 ? (passedCount / totalEntered) * 100 : 0;
  const topPerformers = [...filteredResults].filter(r => r.status === "pass").sort((a, b) => (b.gpa || 0) - (a.gpa || 0)).slice(0, 5);

  const selectedExamForDisplay = selExamId !== "all" ? exams.find(e => String(e.id) === String(selExamId)) : null;
  const isQawmiDashboard = (selectedExamForDisplay?.result_system || "general") === "qawmi";

  // ────────────────────────────────────────────────────────────
  // Feature 2 — Super Admin Multi-Branch helpers
  // ────────────────────────────────────────────────────────────
  const toggleBranchInMulti = (branchId) => {
    setSelBranchIds(prev =>
      prev.includes(String(branchId))
        ? prev.filter(id => id !== String(branchId))
        : [...prev, String(branchId)]
    );
  };

  // Multi-branch: exam options when multiple branches selected
  const multiBranchExams = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return exams.filter(e => selBranchIds.includes(String(e.branch_id)));
  }, [multiMode, selBranchIds, exams]);

  const [multiSelClassIds, setMultiSelClassIds] = useState([]);
  const [multiSelExamIds, setMultiSelExamIds] = useState([]);
  const [multiSelTeacherIds, setMultiSelTeacherIds] = useState([]);
  const [multiLimitCount, setMultiLimitCount] = useState("10"); // "10" | "25" | "50" | "all"

  const toggleMultiClass = (classId) => {
    if (classId === "all") {
      setMultiSelClassIds([]);
      return;
    }
    setMultiSelClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleMultiExam = (examId) => {
    if (examId === "all") {
      setMultiSelExamIds([]);
      return;
    }
    setMultiSelExamIds(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const toggleMultiTeacher = (teacherId) => {
    if (teacherId === "all") {
      setMultiSelTeacherIds([]);
      return;
    }
    setMultiSelTeacherIds(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // Multi-branch: common class names across selected branches
  const multiClassOptions = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    const seen = new Map();
    selBranchIds.forEach(bId => {
      const branch = branches.find(b => String(b.id) === bId);
      (branch?.academic_structure || []).forEach(c => {
        const name = typeof c.class_name === "string" 
          ? c.class_name 
          : (c.class_name?.bn || c.class_name?.en || c.class_name?.ar || "");
        if (name && !seen.has(name)) seen.set(name, { id: c.id, label: name });
      });
    });
    return [...seen.values()];
  }, [multiMode, selBranchIds, branches]);

  // Multi-branch: teacher options across selected branches & classes
  const multiTeachers = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    const branchTeachers = teachers.filter(t => selBranchIds.includes(String(t.branch_id)));
    if (multiSelClassIds.length === 0) return branchTeachers;

    const classMatchedStudents = students.filter(s => {
      if (!selBranchIds.includes(String(s.branch_id))) return false;
      return multiSelClassIds.some(cid => {
        const cOpt = multiClassOptions.find(o => o.id === cid);
        const matchLabel = (cOpt?.label || "").toLowerCase().trim();
        const sClass = (s.class_name || "").toLowerCase().trim();
        const sBatch = (s.batch || "").toLowerCase().trim();
        return (sClass && sClass.includes(matchLabel)) || (sBatch && sBatch.includes(matchLabel)) || String(s.class_id) === String(cid);
      });
    });

    const selectedClassLabels = multiSelClassIds.map(cid => {
      const cOpt = multiClassOptions.find(o => o.id === cid);
      return (cOpt?.label || "").toLowerCase().trim();
    }).filter(Boolean);

    return branchTeachers.filter(t => {
      if (classMatchedStudents.some(s => isStudentAssignedToTeacher(s, t))) {
        return true;
      }
      if (t.assigned_batches) {
        const teacherBatches = String(t.assigned_batches)
          .split(",")
          .map(b => b.trim().toLowerCase())
          .filter(Boolean);
        if (teacherBatches.includes("all classes") || teacherBatches.includes("all")) return true;
        if (teacherBatches.some(tb => selectedClassLabels.some(cl => cl === tb || cl.includes(tb) || tb.includes(cl)))) {
          return true;
        }
      }
      return false;
    });
  }, [multiMode, selBranchIds, teachers, multiSelClassIds, multiClassOptions, students]);

  // Multi-branch enriched + filtered results
  const multiBranchResults = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return results.map(enrichResult).filter(r => {
      const examObj = exams.find(e => String(e.id) === String(r.exam_id));
      if (!examObj) return false;
      const student = findStudentForResult(r);
      const branchId = r.branch_id || student?.branch_id || examObj.branch_id;
      if (!selBranchIds.includes(String(branchId))) return false;

      // Multi-Exam filter
      if (multiSelExamIds.length > 0 && !multiSelExamIds.includes(String(r.exam_id))) return false;

      // Multi-Teacher filter
      if (multiSelTeacherIds.length > 0) {
        if (!student) return false;
        const isMatchedTeacher = multiSelTeacherIds.some(tId => {
          const tObj = teachers.find(t => String(t.id) === String(tId));
          return tObj && isStudentAssignedToTeacher(student, tObj);
        });
        if (!isMatchedTeacher) return false;
      }

      // Multi-Class filter
      if (multiSelClassIds.length > 0) {
        const isMatchedClass = multiSelClassIds.some(cid => {
          const classNameMatch = multiClassOptions.find(o => o.id === cid);
          if (!classNameMatch) return false;
          const matchLabel = (classNameMatch.label || "").toLowerCase().trim();
          const branchObj = branches.find(b => String(b.id) === String(branchId));

          const studentClassName = (student?.class_name || "").toLowerCase().trim();
          const studentBatch = (student?.batch || "").toLowerCase().trim();
          const studentDept = (student?.department || student?.session || "").toLowerCase().trim();
          const examClassName = (resolveAcademicDisplayName(examObj.class_id, examObj.session_id, examObj.class_group_id, branchObj?.academic_structure, 'bn') || "").toLowerCase().trim();

          const directMatch = (studentClassName && (studentClassName === matchLabel || studentClassName.includes(matchLabel))) ||
                              (studentBatch && (studentBatch === matchLabel || studentBatch.includes(matchLabel))) ||
                              (studentDept && (studentDept === matchLabel || studentDept.includes(matchLabel))) ||
                              (examClassName && (examClassName === matchLabel || examClassName.includes(matchLabel))) ||
                              String(examObj.class_id) === String(cid);
          if (directMatch) return true;

          if (student) {
            const branchCls = (branchObj?.academic_structure || []).find(c => {
              const name = typeof c.class_name === "string"
                ? c.class_name
                : (c.class_name?.bn || c.class_name?.en || c.class_name?.ar || "");
              return name.toLowerCase().trim() === matchLabel;
            });
            if (branchCls && isStudentInClassOption(student, branchCls.id, branchObj?.academic_structure)) {
              return true;
            }
          }
          return false;
        });
        if (!isMatchedClass) return false;
      }

      return true;
    }).sort(meritSort).map((r, i) => ({ ...r, combinedRank: i + 1 }));
  }, [multiMode, selBranchIds, results, exams, students, branches, multiSelExamIds, multiSelClassIds, multiSelTeacherIds, multiClassOptions, enrichResult, findStudentForResult, teachers]);

  // Branch-wise fair ranking (Feature 2b - normalized by pass rate & avg marks per student)
  const branchRanking = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];
    return selBranchIds.map(bId => {
      const branch = branches.find(b => String(b.id) === bId);
      const branchRes = multiBranchResults.filter(r => {
        const s = findStudentForResult(r);
        return (s && String(s.branch_id) === bId) || String(r.branch_id) === bId;
      });
      const total   = branchRes.length;
      const passed  = branchRes.filter(r => r.status === "pass").length;
      const totalGpa = branchRes.reduce((s, r) => s + (r.gpa || 0), 0);
      const avgMarks = total > 0 ? branchRes.reduce((s, r) => s + (r.total_obtained_marks || 0), 0) / total : 0;
      const passRate = total > 0 ? (passed / total) * 100 : 0;
      const avgGpa   = total > 0 ? totalGpa / total : 0;
      return { branchId: bId, branchName: branch?.name_bn || branch?.name_en || bId, total, passed, avgMarks, passRate, avgGpa };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((b, i) => ({ ...b, rank: i + 1 }));
  }, [multiMode, selBranchIds, multiBranchResults, branches, findStudentForResult]);

  // Teacher-wise fair ranking (Feature 2c - normalized by pass rate & avg marks per student)
  const teacherRanking = React.useMemo(() => {
    if (!multiMode || selBranchIds.length === 0) return [];

    const teacherMap = new Map();

    multiBranchResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;
      
      const assignedTeacher = getStudentAssignedTeacher(s, teachers);
      if (!assignedTeacher) return;

      const tId = String(assignedTeacher.id);
      
      if (!teacherMap.has(tId)) {
        const tName = assignedTeacher.full_name_bn || assignedTeacher.full_name_en || `Teacher #${tId}`;
        teacherMap.set(tId, {
          teacherId: tId,
          teacherName: tName,
          total: 0,
          passed: 0,
          totalObtained: 0,
          totalGpa: 0,
        });
      }

      const stat = teacherMap.get(tId);
      stat.total += 1;
      if (r.status === "pass") stat.passed += 1;
      stat.totalObtained += Number(r.total_obtained_marks || 0);
      stat.totalGpa += Number(r.gpa || 0);
    });

    return Array.from(teacherMap.values()).map(t => {
      const avgMarks = t.total > 0 ? t.totalObtained / t.total : 0;
      const passRate = t.total > 0 ? (t.passed / t.total) * 100 : 0;
      const avgGpa   = t.total > 0 ? t.totalGpa / t.total : 0;
      return {
        ...t,
        avgMarks,
        passRate,
        avgGpa
      };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((t, i) => ({ ...t, rank: i + 1 }));
  }, [multiMode, selBranchIds, teachers, multiBranchResults, findStudentForResult]);

  // Group-wise fair ranking (normalized by pass rate & avg marks per student)
  const groupRanking = React.useMemo(() => {
    const targetResults = multiMode ? multiBranchResults : filteredResults;
    if (!targetResults.length) return [];

    const groupMap = new Map();

    targetResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;

      const br = branches.find(b => String(b.id) === String(s.branch_id));
      const groupName = s.class_group_id
        ? (resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, br?.academic_structure, 'bn') || `Group ${s.class_group_id}`)
        : (s.session || s.batch || "General Group");

      const gKey = `${s.branch_id || 'global'}:${groupName}`;

      if (!groupMap.has(gKey)) {
        groupMap.set(gKey, {
          gKey,
          groupName,
          branchName: br?.name_bn || br?.name_en || "Branch",
          total: 0,
          passed: 0,
          totalObtained: 0,
          totalGpa: 0,
        });
      }

      const gStat = groupMap.get(gKey);
      gStat.total += 1;
      if (r.status === "pass") gStat.passed += 1;
      gStat.totalObtained += Number(r.total_obtained_marks || 0);
      gStat.totalGpa += Number(r.gpa || 0);
    });

    return Array.from(groupMap.values()).map(g => {
      const avgMarks = g.total > 0 ? g.totalObtained / g.total : 0;
      const passRate = g.total > 0 ? (g.passed / g.total) * 100 : 0;
      const avgGpa   = g.total > 0 ? g.totalGpa / g.total : 0;
      return { ...g, avgMarks, passRate, avgGpa };
    }).sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (b.avgMarks !== a.avgMarks) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((g, i) => ({ ...g, rank: i + 1 }));
  }, [multiMode, multiBranchResults, filteredResults, branches, findStudentForResult]);

  // Single-branch teacher rank calculation (fair & normalized by student averages)
  const singleBranchTeacherRank = React.useMemo(() => {
    if (selBranchId === "all" || selTeacherId === "all" || !selectedTeacher) return null;
    const branchResults = results.map(enrichResult).filter(r => {
      const s = findStudentForResult(r);
      const bId = r.branch_id || s?.branch_id;
      if (String(bId) !== String(selBranchId)) return false;
      if (selClassId !== "all") {
        const b = branches.find(br => String(br.id) === String(bId));
        const isMatch = isStudentInClassOption(s, selClassId, b?.academic_structure) ||
          String(s?.class_id) === String(selClassId) ||
          (s?.class_name && String(s.class_name).toLowerCase().includes(String(selClassId).toLowerCase()));
        if (!isMatch) return false;
      }
      if (selExamId !== "all" && String(r.exam_id) !== String(selExamId)) return false;
      return true;
    });

    const teacherMap = new Map();
    branchResults.forEach(r => {
      const s = findStudentForResult(r);
      if (!s) return;
      const t = getStudentAssignedTeacher(s, teachers);
      if (!t) return;
      const tId = String(t.id);
      if (!teacherMap.has(tId)) {
        teacherMap.set(tId, { teacherId: tId, total: 0, passed: 0, totalObtained: 0, totalFull: 0, totalGpa: 0 });
      }
      const st = teacherMap.get(tId);
      st.total += 1;
      if (r.status === "pass") st.passed += 1;
      st.totalObtained += Number(r.total_obtained_marks || 0);
      st.totalFull += Number(r.total_full_marks || 0);
      st.totalGpa += Number(r.gpa || 0);
    });

    const ranks = Array.from(teacherMap.values()).map(t => ({
      ...t,
      avgMarks: t.total > 0 ? t.totalObtained / t.total : 0,
      avgPercentage: t.totalFull > 0 ? (t.totalObtained / t.totalFull) * 100 : 0,
      passRate: t.total > 0 ? (t.passed / t.total) * 100 : 0,
      avgGpa: t.total > 0 ? t.totalGpa / t.total : 0,
      totalTeachersInScope: teacherMap.size,
    })).sort((a, b) => {
      if (Math.abs(b.passRate - a.passRate) > 0.01) return b.passRate - a.passRate;
      if (Math.abs(b.avgPercentage - a.avgPercentage) > 0.01) return b.avgPercentage - a.avgPercentage;
      if (Math.abs(b.avgMarks - a.avgMarks) > 0.01) return b.avgMarks - a.avgMarks;
      return b.avgGpa - a.avgGpa;
    }).map((t, i) => ({ ...t, rank: i + 1 }));

    return ranks.find(t => String(t.teacherId) === String(selTeacherId)) || null;
  }, [selBranchId, selClassId, selTeacherId, selectedTeacher, results, selExamId, teachers, branches, enrichResult, findStudentForResult]);

  // Print handlers
  const handleDownloadSheet = () => {
    if (selBranchId === "all" || selClassId === "all" || selExamId === "all") {
      return toast.error("Please select a specific Branch, Class, and Exam to print Class Result Sheet");
    }
    const branchObj = branches.find(b => String(b.id) === String(selBranchId));
    const examObj   = exams.find(e => String(e.id) === String(selExamId));
    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(examObj?.class_id, examObj?.session_id, examObj?.class_group_id, structure, 'bn') ||
        selectedFlatClass?.label || "Class";
    })();
    const activeSubjectsForPDF = (() => {
      const structure = branchObj?.academic_structure || [];
      const cls = structure.find(c => String(c.id) === String(examObj?.class_id));
      if (!cls) return [];
      if (examObj?.session_id && Array.isArray(cls.sections)) {
        const sec = cls.sections.find(s => String(s.id) === String(examObj.session_id));
        if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) return sec.subjects;
      }
      if (examObj?.class_group_id && Array.isArray(cls.groups)) {
        const grp = cls.groups.find(g => String(g.id) === String(examObj.class_group_id));
        if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) return grp.subjects;
      }
      return Array.isArray(cls.subjects) ? cls.subjects : [];
    })();
    printResultSheet(branchObj, classNameVal, examObj, filteredResults, students, settings, activeSubjectsForPDF, examObj?.result_system || "general");
  };

  const handlePrintIndividual = (r) => {
    const student   = findStudentInList(r, students);
    const examObj   = exams.find(e => String(e.id) === String(r.exam_id));
    const branchObj = branches.find(b => String(b.id) === String(r.branch_id || student?.branch_id));
    const flatOptions   = branchObj ? getFlatClassOptions(branchObj.academic_structure) : [];
    const resultFlatClass = flatOptions.find(o => o.id === r.class_id);
    const resultClassId   = resultFlatClass?.classId || r.class_id;
    const classObj        = branchObj?.academic_structure?.find(c => c.id === resultClassId);
    if (!student || !examObj) return toast.error("Incomplete data for print");
    const classNameVal = (() => {
      const structure = branchObj?.academic_structure || [];
      return resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, structure, 'bn') ||
        student.class_name || resultFlatClass?.label ||
        classObj?.class_name?.bn || classObj?.class_name?.en || "Class";
    })();
    const html = getPrintableMarksheetHTML(student, branchObj, classNameVal, examObj, r, settings);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintAllTranscripts = () => {
    if (!filteredResults || filteredResults.length === 0) return toast.error("No results available to print");
    const pagesHtml = filteredResults.map((r) => {
      const student   = findStudentInList(r, students);
      if (!student) return "";
      const examObj   = exams.find(e => String(e.id) === String(r.exam_id));
      const branchObj = branches.find(b => String(b.id) === String(r.branch_id || student?.branch_id));
      const flatOptions     = branchObj ? getFlatClassOptions(branchObj.academic_structure) : [];
      const resultFlatClass = flatOptions.find(o => o.id === r.class_id);
      const resultClassId   = resultFlatClass?.classId || r.class_id;
      const classObj        = branchObj?.academic_structure?.find(c => c.id === resultClassId);
      const classNameVal = (() => {
        const structure = branchObj?.academic_structure || [];
        return resolveAcademicDisplayName(student.class_id, student.session_id, student.class_group_id, structure, 'bn') ||
          student.class_name || resultFlatClass?.label ||
          classObj?.class_name?.bn || classObj?.class_name?.en || "Class";
      })();
      const innerContent = getPrintableMarksheetInnerContent(student, branchObj, classNameVal, examObj, r, settings, null, examObj?.result_system || "general");
      return `<div class="transcript-page">${innerContent}</div>`;
    }).filter(Boolean).join("");
    if (!pagesHtml) return toast.error("Could not generate transcripts for selected items");
    const fullDoc = getFullTranscriptDocumentHTML(pagesHtml, `All Result Cards (${filteredResults.length})`);
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(fullDoc);
    printWindow.document.close();
  };

  // ── Rank badge helper ──
  const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm ring-2 ring-amber-400">🥇 1st</span>;
    if (rank === 2) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 shadow-sm ring-2 ring-slate-400">🥈 2nd</span>;
    if (rank === 3) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-200 to-amber-200 text-orange-900 shadow-sm ring-2 ring-orange-300">🥉 3rd</span>;
    if (rank <= 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">🎖️ #{rank}</span>;
    return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-100 text-slate-500">{rank}</span>;
  };

  return (
    <div className="space-y-6">

      {/* ── Feature 2: Super Admin Multi-Branch Toggle ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-[#052E2B]/5 to-[#D4AF37]/10 border border-[#052E2B]/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#052E2B] flex items-center justify-center shrink-0">
              <Building2 className="h-4.5 w-4.5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#052E2B]">Multi-Branch Comparison</p>
              <p className="text-[10px] text-slate-500">একাধিক Branch-এর Result একসাথে তুলনা করুন — শুধুমাত্র Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => { setMultiMode(v => !v); setSelBranchIds([]); setMultiSelClassIds([]); setMultiSelExamIds([]); setMultiSelTeacherIds([]); }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shrink-0 ${multiMode ? "bg-[#052E2B]" : "bg-slate-300"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${multiMode ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MULTI-BRANCH MODE (Feature 2 — Super Admin only)
      ══════════════════════════════════════════════════════════ */}
      {isSuperAdmin && multiMode && (
        <div className="space-y-6">
          {/* Branch Selector */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#D4AF37]" /> Branch নির্বাচন করুন
            </h3>
            <div className="flex flex-wrap gap-2">
              {branches.map(b => {
                const isSelected = selBranchIds.includes(String(b.id));
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleBranchInMulti(b.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-[#052E2B] text-white border-[#052E2B] shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                    }`}
                  >
                    {isSelected && <span className="text-[#D4AF37]">✓</span>}
                    {b.name_bn || b.name_en}
                  </button>
                );
              })}
            </div>
            {selBranchIds.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                {/* Multi-Class Selector Pills */}
                {multiClassOptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-[#052E2B]" /> Class নির্বাচন করুন (একাধিক নির্বাচনযোগ্য)
                      </span>
                      {multiSelClassIds.length > 0 && (
                        <button onClick={() => setMultiSelClassIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Class দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelClassIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelClassIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Class (All)
                      </button>
                      {multiClassOptions.map(o => {
                        const isSel = multiSelClassIds.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() => toggleMultiClass(o.id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-600"
                            }`}
                          >
                            {isSel && <span className="text-[#D4AF37]">✓</span>}
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-Exam Selector Pills */}
                {multiBranchExams.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#052E2B]" /> Exam নির্বাচন করুন (একাধিক পরীক্ষা তুলনা)
                      </span>
                      {multiSelExamIds.length > 0 && (
                        <button onClick={() => setMultiSelExamIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Exam দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelExamIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelExamIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Exam (All)
                      </button>
                      {multiBranchExams.map(e => {
                        const isSel = multiSelExamIds.includes(String(e.id));
                        const b = (branches || []).find(br => String(br.id) === String(e.branch_id));
                        const classLabel = resolveAcademicDisplayName(
                          e.class_id,
                          e.session_id,
                          e.class_group_id,
                          b?.academic_structure,
                          'bn'
                        );
                        return (
                          <button
                            key={e.id}
                            onClick={() => toggleMultiExam(String(e.id))}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-amber-600"
                            }`}
                          >
                            {isSel && <span className="text-white">✓</span>}
                            <span>{e.title}</span>
                            {classLabel && <span className="text-[10px] opacity-85 font-semibold">({classLabel})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-Teacher Selector Pills */}
                {multiTeachers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#052E2B]" /> Teacher নির্বাচন করুন (একাধিক শিক্ষক তুলনা)
                      </span>
                      {multiSelTeacherIds.length > 0 && (
                        <button onClick={() => setMultiSelTeacherIds([])} className="text-[10px] text-red-600 hover:underline font-bold">
                          সব Teacher দেখুন
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setMultiSelTeacherIds([])}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          multiSelTeacherIds.length === 0
                            ? "bg-[#052E2B] text-white border-[#052E2B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#052E2B]/40"
                        }`}
                      >
                        সব Teacher (All)
                      </button>
                      {multiTeachers.map(t => {
                        const isSel = multiSelTeacherIds.includes(String(t.id));
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleMultiTeacher(String(t.id))}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? "bg-[#052E2B] text-white border-[#052E2B] shadow-sm ring-2 ring-[#D4AF37]/50"
                                : "bg-white text-slate-700 border-slate-200 hover:border-[#052E2B]"
                            }`}
                          >
                            {isSel && <span className="text-[#D4AF37]">✓</span>}
                            {t.full_name_bn || t.full_name_en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selBranchIds.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 italic text-sm">
              উপরে কমপক্ষে ২টি Branch নির্বাচন করুন তুলনা দেখতে।
            </div>
          )}

          {selBranchIds.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "মোট Result", value: multiBranchResults.length, color: "text-[#052E2B]" },
                  { label: "Pass", value: multiBranchResults.filter(r => r.status === "pass").length, color: "text-emerald-600" },
                  { label: "Fail", value: multiBranchResults.filter(r => r.status === "fail").length, color: "text-red-600" },
                  { label: "Branch নির্বাচিত", value: selBranchIds.length, color: "text-[#D4AF37]" },
                ].map(c => (
                  <Card key={c.label} className="border-0 shadow-sm bg-white rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{c.label}</span>
                    <span className={`text-2xl font-extrabold block mt-1 ${c.color}`}>{c.value}</span>
                  </Card>
                ))}
              </div>

              {/* Feature 2b: Branch-wise Ranking */}
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-5">
                  <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#D4AF37]" /> Branch-wise Overall Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {branchRanking.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 italic text-xs">কোনো Result পাওয়া যায়নি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {branchRanking.map(b => (
                            <tr key={b.branchId} className="hover:bg-slate-50/30">
                              <td className="py-3 px-4"><RankBadge rank={b.rank} /></td>
                              <td className="py-3 px-4 font-bold text-slate-800">{b.branchName}</td>
                              <td className="py-3 px-4 text-center text-slate-600">{b.total}</td>
                              <td className="py-3 px-4 text-center text-emerald-600 font-bold">{b.passed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${b.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : b.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                  {b.passRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{b.avgMarks.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feature 2c: Teacher-wise Ranking (class নির্বাচিত থাকলে) */}
              {multiSelClassIds.length > 0 && (
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-5">
                    <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#D4AF37]" /> Teacher-wise Ranking
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">
                        {multiSelClassIds.length === 1 
                          ? `${multiClassOptions.find(o => o.id === multiSelClassIds[0])?.label || "Class"} Class` 
                          : `${multiSelClassIds.length} Classes`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {teacherRanking.length === 0 ? (
                      <p className="py-8 text-center text-slate-400 italic text-xs">এই Class-এ কোনো Teacher assignment পাওয়া যায়নি।</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50/50 border-b">
                              <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                              <th className="py-3 px-4 text-left font-bold text-slate-500">Teacher</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                              <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teacherRanking.map(t => {
                              const fullTeacherObj = teachers.find(teach => String(teach.id) === String(t.teacherId));
                              return (
                                <tr 
                                  key={t.teacherId} 
                                  onClick={() => {
                                    if (fullTeacherObj) {
                                      setTeacherAssignedModal({
                                        teacher: fullTeacherObj,
                                        initialExamId: "all",
                                        initialClassId: multiSelClassIds.length === 1 ? multiSelClassIds[0] : "all"
                                      });
                                    }
                                  }}
                                  className="hover:bg-slate-100/70 cursor-pointer transition-colors group"
                                  title="ক্লিক করে এই শিক্ষকের অধীনে শিক্ষার্থীদের রেজাল্ট ও আলাদা ১ থেকে র‍্যাংকিং দেখুন"
                                >
                                  <td className="py-3 px-4"><RankBadge rank={t.rank} /></td>
                                  <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-teal-900">
                                    <div className="flex items-center justify-between gap-2">
                                      <span>{t.teacherName}</span>
                                      <span className="text-[10px] text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        রেজাল্ট ও র‍্যাংকিং দেখুন →
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center text-slate-600 font-semibold">{t.total}</td>
                                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">{t.passed}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : t.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                      {t.passRate.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{t.avgMarks.toFixed(1)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Group / Section Performance Ranking */}
              {groupRanking.length > 0 && (
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-5">
                    <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#D4AF37]" /> Group & Section Performance Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Group / Section</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">মোট Student</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Pass Rate</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Avg Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {groupRanking.map(g => (
                            <tr key={g.gKey} className="hover:bg-slate-50/30">
                              <td className="py-3 px-4"><RankBadge rank={g.rank} /></td>
                              <td className="py-3 px-4 font-bold text-slate-800">{g.groupName}</td>
                              <td className="py-3 px-4 font-medium text-slate-600">{g.branchName}</td>
                              <td className="py-3 px-4 text-center text-slate-600">{g.total}</td>
                              <td className="py-3 px-4 text-center text-emerald-600 font-bold">{g.passed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${g.passRate >= 75 ? "bg-emerald-50 text-emerald-700" : g.passRate >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                  {g.passRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-[#052E2B]">{g.avgMarks.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feature 2d: Combined Student Ranking */}
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#D4AF37]" /> Combined Student Ranking ({multiBranchResults.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">দেখান:</span>
                    <Select value={multiLimitCount} onValueChange={setMultiLimitCount}>
                      <SelectTrigger className="h-8 w-28 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Top 10</SelectItem>
                        <SelectItem value="25">Top 25</SelectItem>
                        <SelectItem value="50">Top 50</SelectItem>
                        <SelectItem value="all">সবাই (All)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {multiBranchResults.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 italic text-xs">কোনো Result পাওয়া যায়নি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b">
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Rank</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Student</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Class & Session</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Group</th>
                            <th className="py-3 px-4 text-left font-bold text-slate-500">Assigned Teacher</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">ID / Roll</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Marks</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">GPA</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Grade</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                            <th className="py-3 px-4 text-end font-bold text-slate-500">Print</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(multiLimitCount === "all" ? multiBranchResults : multiBranchResults.slice(0, Number(multiLimitCount))).map(r => {
                            const s  = findStudentForResult(r) || { full_name_en: `Student #${r.student_id}`, full_name_bn: "", roll_number: r.student_id };
                            const br = branches.find(b => String(b.id) === String(r.branch_id || s?.branch_id));
                            const tObj = s ? getStudentAssignedTeacher(s, teachers) : null;
                            const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                            if (!s) return null;

                            const classDisplayName = resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, br?.academic_structure, 'bn') || s.class_name || s.batch || "—";
                            const teacherDisplayName = tObj ? (tObj.full_name_bn || tObj.full_name_en) : "—";
                            const groupDisplayName = s.class_group_id ? `Group ${s.class_group_id}` : "General";

                            return (
                              <tr key={r.id} className="hover:bg-slate-50/30">
                                <td className="py-3 px-4"><RankBadge rank={r.combinedRank} /></td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-800">{s.full_name_en}</p>
                                  <p className="text-[10px] text-slate-400">{s.full_name_bn}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#052E2B]/8 text-[#052E2B]">
                                    {br?.name_bn || br?.name_en || "—"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-700">{classDisplayName}</td>
                                <td className="py-3 px-4 text-center font-medium text-slate-600">{groupDisplayName}</td>
                                <td className="py-3 px-4 font-semibold text-teal-800">{teacherDisplayName}</td>
                                <td className="py-3 px-4 text-center font-mono text-slate-500">{s.roll_number || s.id}</td>
                                <td className="py-3 px-4 text-center font-bold text-slate-700">
                                  {r.total_obtained_marks} <span className="text-[10px] text-slate-400">/ {r.total_full_marks}</span>
                                </td>
                                <td className="py-3 px-4 text-center font-bold" style={{ color: gc.text }}>
                                  {r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{ background: gc.bg, color: gc.text }}>
                                    {r.status === "fail" ? "F" : r.grade}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={r.status === "fail" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}>
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-end">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handlePrintIndividual(r)}>
                                    <Printer className="h-4 w-4 text-slate-600" />
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
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SINGLE-BRANCH MODE (original + Feature 1 teacher filter)
      ══════════════════════════════════════════════════════════ */}
      {!isSuperAdmin || !multiMode ? (
        <div className="space-y-6">

          {/* Search & Filtering Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">Search & Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Branch</label>
                <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId("all"); setSelExamId("all"); setSelTeacherId("all"); }} disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class / Section</label>
                <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId("all"); setSelTeacherId("all"); }} disabled={selBranchId === "all"}>
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
                    {filteredExams.map(e => {
                      const b = (branches || []).find(br => String(br.id) === String(e.branch_id));
                      const classLabel = resolveAcademicDisplayName(
                        e.class_id,
                        e.session_id,
                        e.class_group_id,
                        b?.academic_structure,
                        'bn'
                      );
                      return (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.title}{classLabel ? ` (${classLabel})` : ""}{e.academic_year ? ` [${e.academic_year}]` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Teacher (Optional)</label>
                <Select value={selTeacherId} onValueChange={setSelTeacherId} disabled={selBranchId === "all"}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="All Teachers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল শিক্ষক (All Teachers)</SelectItem>
                    {teacherOptions.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.full_name_bn || t.full_name_en || `Teacher #${t.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Roll/Name..."
                    className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Quick Badge if Teacher Selected */}
            {selTeacherId !== "all" && selectedTeacher && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTeacherAssignedModal({
                    teacher: selectedTeacher,
                    initialExamId: selExamId !== "all" ? selExamId : "all",
                    initialClassId: selClassId !== "all" ? selClassId : "all"
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#052E2B]/10 text-[#052E2B] border border-[#052E2B]/20 hover:bg-[#052E2B]/15 transition-all cursor-pointer group"
                >
                  <Users className="h-3.5 w-3.5 text-[#052E2B]" />
                  <span>শিক্ষক: {selectedTeacher.full_name_bn || selectedTeacher.full_name_en} ({teacherStudentCount} জন শিক্ষার্থী)</span>
                  <span className="text-[10px] text-amber-800 font-extrabold ml-1 group-hover:underline flex items-center gap-0.5">
                    📊 রেজাল্ট ও আলাদা র‍্যাংকিং দেখুন <ExternalLink className="h-3 w-3 inline opacity-75" />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Feature 1: Teacher Info Card (Clickable - opens teacher assigned students results & 1-N ranking) */}
          {selTeacherId !== "all" && selectedTeacher && (
            <div 
              onClick={() => setTeacherAssignedModal({
                teacher: selectedTeacher,
                initialExamId: selExamId !== "all" ? selExamId : "all",
                initialClassId: selClassId !== "all" ? selClassId : "all"
              })}
              className="bg-gradient-to-r from-[#052E2B] via-[#073932] to-[#0a4a3f] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-md hover:shadow-xl hover:scale-[1.005] active:scale-[0.998] transition-all cursor-pointer border border-[#D4AF37]/40 group relative overflow-hidden ring-1 ring-[#D4AF37]/20 hover:ring-[#D4AF37]/60"
              role="button"
              tabIndex={0}
              title="ক্লিক করে এই শিক্ষকের অধীনে সকল শিক্ষার্থীর রেজাল্ট ও আলাদা ১ থেকে র‍্যাংকিং দেখুন"
            >
              {/* Animated soft gradient shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-center gap-4 min-w-0 z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#D4AF37]/60 shadow-inner group-hover:border-[#D4AF37] transition-colors">
                  {selectedTeacher.photo_url ? (
                    <img src={selectedTeacher.photo_url} alt={selectedTeacher.full_name_en} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-[#D4AF37]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Selected Teacher</p>
                    {singleBranchTeacherRank && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-sm flex items-center gap-1">
                        🏆 {selClassId !== "all" ? "এই ক্লাসে" : "এই শাখায়"} {singleBranchTeacherRank.rank} নম্বর শিক্ষক
                        {singleBranchTeacherRank.totalTeachersInScope > 1 && ` (মোট ${singleBranchTeacherRank.totalTeachersInScope} জনের মধ্যে)`}
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-base sm:text-lg text-white truncate group-hover:text-amber-200 transition-colors">
                    {selectedTeacher.full_name_en || selectedTeacher.full_name_bn}
                  </p>
                  <p className="text-[11px] text-white/80 mt-0.5 flex items-center gap-3 flex-wrap font-medium">
                    <span>{selectedFlatClass ? `Class: ${selectedFlatClass.label}` : "All Classes"}</span>
                    <span>মোট Student: <strong className="text-[#D4AF37]">{teacherTotalAssignedCount > 0 ? teacherTotalAssignedCount : teacherStudentCount} জন</strong> {selClassId !== "all" && teacherTotalAssignedCount > teacherStudentCount && `(এই ক্লাসে: ${teacherStudentCount} জন)`}</span>
                    {singleBranchTeacherRank && (
                      <>
                        <span>পাস হার: <strong className="text-emerald-300">{singleBranchTeacherRank.passRate.toFixed(1)}%</strong></span>
                        <span>গড় নম্বর: <strong className="text-amber-200">{singleBranchTeacherRank.avgMarks.toFixed(1)}</strong></span>
                        <span>গড় GPA: <strong className="text-yellow-300">{singleBranchTeacherRank.avgGpa.toFixed(2)}</strong></span>
                      </>
                    )}
                    {selExamId !== "all" ? ` · Result দেখাচ্ছে: ${filteredResults.length} জন` : ""}
                  </p>
                </div>
              </div>

              {/* Action Button Pill on Right */}
              <div className="shrink-0 flex items-center gap-2 z-10">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-[#D4AF37] to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-[#052E2B] font-extrabold text-xs rounded-xl shadow-md gap-1.5 h-9 px-3.5 group-hover:shadow-amber-500/30 transition-all pointer-events-none"
                >
                  <Trophy className="h-4 w-4 text-[#052E2B]" />
                  <span>রেজাল্ট ও ১-র‍্যাংকিং দেখুন</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-85" />
                </Button>
              </div>
            </div>
          )}

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

          {/* Table & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Merit List Table */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-5 flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-bold text-[#052E2B] uppercase tracking-wider">
                  Results Merit List ({filteredResults.length})
                  {selTeacherId !== "all" && selectedTeacher && (
                    <span className="ml-2 text-[10px] bg-[#052E2B]/10 text-[#052E2B] px-2 py-0.5 rounded-full font-normal">
                      {selectedTeacher.full_name_en}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {selBranchId !== "all" && selClassId !== "all" && selExamId !== "all" && (
                    <Button onClick={handleDownloadSheet} size="sm" className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-9">
                      <Printer className="h-4 w-4" /> Print Result Sheet
                    </Button>
                  )}
                  {filteredResults.length > 0 && (
                    <Button onClick={handlePrintAllTranscripts} size="sm" className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#052E2B] gap-1.5 text-xs font-bold rounded-xl h-9 shadow-sm">
                      <FileText className="h-4 w-4" /> Print All Result Cards ({filteredResults.length})
                    </Button>
                  )}
                </div>
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
                          {isQawmiDashboard ? (
                            <th className="py-3 px-4 text-center font-bold text-slate-500">দারাজাহ</th>
                          ) : (<>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">GPA</th>
                            <th className="py-3 px-4 text-center font-bold text-slate-500">Grade</th>
                          </>)}
                          <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                          <th className="py-3 px-4 text-end font-bold text-slate-500">Print</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((r) => {
                          const s  = findStudentForResult(r) || { full_name_en: `Student #${r.student_id}`, full_name_bn: "", roll_number: r.student_id };
                          const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/30">
                              <td className="py-3.5 px-4 font-extrabold text-slate-600">{`#${r.liveRank}`}</td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-800">{s.full_name_en}</p>
                                <p className="text-[10px] text-slate-400">{s.full_name_bn}</p>
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-slate-500">{s.roll_number || s.id}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                {r.total_obtained_marks} <span className="text-[10px] text-slate-400">/ {r.total_full_marks}</span>
                              </td>
                              {isQawmiDashboard ? (
                                <td className="py-3.5 px-4 text-center font-bold" style={{ color: r.status === "fail" ? "#cc0000" : "#006241" }}>
                                  {r.status === "fail" ? "রাসিব" : calcQawmiDarajah(r.total_obtained_marks, r.total_full_marks)}
                                </td>
                              ) : (<>
                                <td className="py-3.5 px-4 text-center font-bold" style={{ color: gc.text }}>
                                  {r.status === "fail" ? "0.00" : r.gpa?.toFixed(2)}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px]" style={{ background: gc.bg, color: gc.text }}>
                                    {r.status === "fail" ? "F" : r.grade}
                                  </span>
                                </td>
                              </>)}
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

            {/* Top Performers */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-5 w-5 text-yellow-500" /> Top Performing Students
              </h3>
              <div className="space-y-4 flex-1">
                {topPerformers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No passed students recorded in query.</p>
                ) : (
                  topPerformers.map((r, i) => {
                    const s  = findStudentInList(r, students);
                    const gc = GRADE_COLORS[r.grade] || GRADE_COLORS["F"];
                    if (!s) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl border hover:bg-slate-50/50 transition-all">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                          i === 0 ? "bg-yellow-100 text-yellow-800" : i === 1 ? "bg-slate-100 text-slate-800" : "bg-orange-100 text-orange-800"
                        }`}>{i + 1}</div>
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
      ) : null}

      {/* Teacher's Assigned Students Results & 1-N Ranking Modal */}
      {teacherAssignedModal && (
        <TeacherAssignedResultsDialog
          isOpen={!!teacherAssignedModal}
          onClose={() => setTeacherAssignedModal(null)}
          teacher={teacherAssignedModal.teacher}
          initialExamId={teacherAssignedModal.initialExamId || "all"}
          initialClassId={teacherAssignedModal.initialClassId || "all"}
          students={students}
          exams={exams}
          branches={branches}
          results={results}
          teachers={teachers}
          settings={settings}
          enrichResult={enrichResult}
          findStudentForResult={findStudentForResult}
          handlePrintIndividual={handlePrintIndividual}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main ExamManager Component
// ────────────────────────────────────────────────────────
export default function ExamManager({ students, currentUser }) {
  // Teachers query for Teacher-wise filter in Result Dashboard
  const { data: teachers = [] } = useQuery({
    queryKey: ["admin-teachers-for-results"],
    queryFn: () => appClient.entities.Teacher.listAll(),
  });
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
        try {
          await updateExamMut.mutateAsync({ id: editExam.id, d });
        } catch (err) {
          if (err?.message?.includes("subject_schedules") || err?.code === "PGRST204" || err?.message?.includes("schema cache")) {
            const { subject_schedules, ...fallbackData } = d;
            await updateExamMut.mutateAsync({ id: editExam.id, d: fallbackData });
          } else {
            throw err;
          }
        }
        toast.success("Exam updated successfully!");
      } else {
        const branchObj = branches.find(b => String(b.id) === String(d.branch_id));
        const branchClasses = branchObj && Array.isArray(branchObj.academic_structure) ? branchObj.academic_structure : [];
        const classObj = branchClasses.find(c => c.id === d.class_id);
        const payload = {
          ...d,
          session: classObj?.class_name?.en || classObj?.class_name?.bn || "",
        };
        try {
          await createExamMut.mutateAsync(payload);
        } catch (err) {
          if (err?.message?.includes("subject_schedules") || err?.code === "PGRST204" || err?.message?.includes("schema cache")) {
            const { subject_schedules, ...fallbackPayload } = payload;
            await createExamMut.mutateAsync(fallbackPayload);
          } else {
            throw err;
          }
        }
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1 bg-slate-100 rounded-xl max-w-lg mb-6">
          <TabsTrigger value="exams" className="rounded-lg text-xs font-bold py-2.5">Exams List</TabsTrigger>
          <TabsTrigger value="entry" className="rounded-lg text-xs font-bold py-2.5">Result Entry</TabsTrigger>
          <TabsTrigger value="dashboard" className="rounded-lg text-xs font-bold py-2.5">Results Dashboard</TabsTrigger>
          <TabsTrigger value="admit-card" className="rounded-lg text-xs font-bold py-2.5 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Admit Card</TabsTrigger>
        </TabsList>

        {/* ── Exam List View ── */}
        <TabsContent value="exams">
          {(() => {
            // Scope exam list: branch_admin sees only their branch's exams.
            // Super admin sees all exams.
            const visibleExams = currentUser?.role === "branch_admin" && currentUser?.branch_id
              ? exams.filter(e => String(e.branch_id) === String(currentUser.branch_id))
              : exams;
            return examsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
            ) : visibleExams.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No exams created yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click the &quot;Add Exam&quot; button at the top to configure your first examination.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleExams.map(exam => {
                  const branch = branches.find(b => String(b.id) === String(exam.branch_id));
                  const fullClassLabel = resolveAcademicDisplayName(
                    exam.class_id,
                    exam.session_id,
                    exam.class_group_id,
                    branch?.academic_structure,
                    'bn'
                  ) || "All";
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
                            Branch: {branch?.name_en || branch?.name_bn || "All"} | Class: {fullClassLabel}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 border-t pt-3">
                          <div>
                            <span className="block text-slate-400 font-bold uppercase text-[8px]">Start Date</span>
                            <span className="font-semibold">{exam.start_date || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-bold uppercase text-[8px]">Publish Date</span>
                            <span className="font-semibold text-emerald-600">{exam.result_publish_date || "N/A"}</span>
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
            );
          })()}
        </TabsContent>

        {/* ── Wizard Result Entry View ── */}
        <TabsContent value="entry">
          <ExamResultEntry branches={branches} exams={exams} students={students} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        {/* ── Results Dashboard ── */}
        <TabsContent value="dashboard">
          <AdminResultDashboard branches={branches} exams={exams} students={students} teachers={teachers} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        {/* ── Admit Card ── */}
        <TabsContent value="admit-card">
          <AdmitCardManager branches={branches} exams={exams} currentUser={currentUser} settings={settingsObj} />
        </TabsContent>
      </Tabs>

      {/* Exam Dialog Form */}
      <Dialog open={showExamForm} onOpenChange={v => { setShowExamForm(v); if (!v) setEditExam(null); }}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-4 sm:p-6">
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
