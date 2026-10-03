import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Award, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { filterActiveMarksDetails } from "@/lib/academic";

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
  });
};

let cachedFontBase64 = null;
let fontPreloaded = false;

const preloadBengaliFont = async () => {
  if (fontPreloaded) return;
  try {
    // Ensure font is loaded in browser before canvas rendering
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.load('400 16px "Noto Sans Bengali"');
      await document.fonts.load('700 16px "Noto Sans Bengali"');
    }
    fontPreloaded = true;
  } catch (_) {
    fontPreloaded = true; // proceed even if preload fails
  }
};

const getNotoSansBengaliFont = async () => {
  if (cachedFontBase64) return cachedFontBase64;
  try {
    const url = "https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf";
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedFontBase64 = reader.result.split(",")[1];
        resolve(cachedFontBase64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
};

const renderBengaliText = (text, fontSize, color = "#1e293b", isBold = false) => {
  if (typeof window === "undefined" || !text) return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 4;
  const fontSpec = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Noto Sans Bengali", "Hind Siliguri", sans-serif`;
  ctx.font = fontSpec;
  const metrics = ctx.measureText(text);
  const textWidth = Math.max(metrics.width, 1);
  const textHeight = fontSize * scale * 1.35;
  canvas.width = textWidth;
  canvas.height = textHeight;
  ctx.font = fontSpec;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, 0, canvas.height / 2);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: textWidth * (0.352777 / scale),
    height: textHeight * (0.352777 / scale)
  };
};


const isComplexUnicode = (text) => /[^\u0000-\u007F]/.test(String(text || ""));

const renderMultilingualText = (text, fontSize, color = "#1e293b", isBold = false) => {
  if (typeof window === "undefined" || !text) return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 4;
  const fontSpec = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Hind Siliguri", "Noto Sans Bengali", "Noto Sans Arabic", "Amiri", "Segoe UI", Arial, sans-serif`;
  ctx.font = fontSpec;
  const metrics = ctx.measureText(text);
  const textWidth = Math.max(metrics.width, 1);
  const textHeight = fontSize * scale * 1.4;
  canvas.width = textWidth;
  canvas.height = textHeight;
  ctx.font = fontSpec;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, 0, canvas.height / 2);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: textWidth * (0.352777 / scale),
    height: textHeight * (0.352777 / scale)
  };
};

const drawBengaliText = (doc, text, x, y, fontSize, color = "#1e293b", isBold = false, align = "left") => {
  const str = String(text || "");
  if (!str || str === "N/A" || str === "—") {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 30, 30);
    doc.text(str, x, y, { align });
    return;
  }
  if (!isComplexUnicode(str)) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 30, 30);
    doc.text(str, x, y, { align });
    return;
  }
  const result = renderMultilingualText(str, fontSize, color, isBold);
  if (result) {
    let drawX = x;
    if (align === "center") {
      drawX = x - result.width / 2;
    } else if (align === "right") {
      drawX = x - result.width;
    }
    doc.addImage(result.dataUrl, "PNG", drawX, y - result.height * 0.70, result.width, result.height);
  }
};

const wrapBengaliText = (text, maxWidth, fontSize, isBold = false) => {
  if (typeof window === "undefined" || !text) return [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 4;
  ctx.font = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Hind Siliguri", "Noto Sans Bengali", "Noto Sans Arabic", "Amiri", "Segoe UI", Arial, sans-serif`;
  
  const words = String(text).split(" ");
  const lines = [];
  let currentLine = "";
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width / scale;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

const drawBengaliTextWrapped = (doc, text, x, y, fontSize, maxWidth, lineHeight = 4.5, color = "#1e293b", isBold = false) => {
  const str = String(text || "");
  if (!str || str === "N/A" || str === "—") {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(80, 80, 80);
    doc.text(str, x, y, { maxWidth });
    return 1;
  }
  if (!isComplexUnicode(str)) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(80, 80, 80);
    doc.text(str, x, y, { maxWidth });
    return 1;
  }
  const lines = wrapBengaliText(str, maxWidth, fontSize, isBold);
  lines.forEach((line, idx) => {
    drawBengaliText(doc, line, x, y + (idx * lineHeight), fontSize, color, isBold);
  });
  return lines.length;
};

export default function DownloadResultButton({ student, attendance = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("noto-sans-bengali-style")) {
      const link = document.createElement("link");
      link.id = "noto-sans-bengali-style";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const { data: settings = {} } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list().then(res => {
      return Object.fromEntries(res.map(s => [s.key, s.value]));
    }),
  });

  const { data: examResults = [], isLoading: loadingResults } = useQuery({
    queryKey: ["pdf-student-exam-results", student.id],
    queryFn: () => appClient.entities.ExamResult.filter({ student_id: student.id }, "-created_date", 20),
    enabled: !!student.id,
  });

  const { data: examsList = [] } = useQuery({
    queryKey: ["pdf-exams-list"],
    queryFn: () => appClient.entities.Exam.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["pdf-branches-list-result"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const handleClick = () => {
    if (examResults.length === 0) {
      toast.error("এই মুহূর্তে কোনো রেজাল্ট খুঁজে পাচ্ছি না");
      return;
    }
    setIsOpen(true);
  };

  const generateResultPDF = async (result) => {
    try {
      const activeExam = examsList.find(e => e.id === result.exam_id);
      const examTitle = activeExam ? activeExam.title : "Exam Result";
      
      // Pre-load Bengali font in browser so Canvas renders correctly
      await preloadBengaliFont();

      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      
      try {
        const fontBase64 = await getNotoSansBengaliFont();
        if (fontBase64) {
          doc.addFileToVFS("NotoSansBengali.ttf", fontBase64);
          doc.addFont("NotoSansBengali.ttf", "NotoSansBengali", "normal");
          doc.setFont("NotoSansBengali");
        }
      } catch (err) {
        console.error("Failed to load Noto Sans Bengali font:", err);
      }
      const W = 210;
      const H = 297;
      
      // 1. Draw Double Border Frame
      doc.setDrawColor(5, 46, 43); // Dark slate green
      doc.setLineWidth(0.8);
      doc.rect(6, 6, W - 12, H - 12, "D");
      
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(0.3);
      doc.rect(7.5, 7.5, W - 15, H - 15, "D");

      // 2. Load Logo
      const logoUrl = settings?.logo_url || "/rahmania-logo-v2.png";
      const logoImg = await loadImage(logoUrl);

      // Render Logo
      if (logoImg) {
        doc.addImage(logoImg, "PNG", 14, 12, 20, 20);
      } else {
        // Circle Logo fallback
        doc.setFillColor(5, 46, 43);
        doc.circle(24, 22, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("RI", 24, 25.5, { align: "center" });
      }

      // Madrasah Title & Info
      const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
      doc.setTextColor(5, 46, 43);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(instNameEn.toUpperCase(), 102, 17, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      const address = settings?.address || "Horiinal, Gazipur, Dhaka, Bangladesh - 1700";
      const contactPhone = settings?.contact_phone || "01906898939";
      const contactEmail = settings?.email || settings?.contact_email || "rahmaniainstitute.org@gmail.com";
      
      doc.text(address, 102, 22, { align: "center" });
      doc.text(`Cell: ${contactPhone} | Email: ${contactEmail}`, 102, 26, { align: "center" });

      // Grade Legend
      const gX = 162;
      const gY = 12;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);
      doc.setFillColor(245, 247, 245);
      doc.rect(gX, gY, 32, 28, "FD");
      
      doc.line(gX, gY + 4, gX + 32, gY + 4);
      doc.line(gX + 13, gY, gX + 13, gY + 28);
      doc.line(gX + 23, gY, gX + 23, gY + 28);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(30, 30, 30);
      doc.text("Range", gX + 6.5, gY + 3, { align: "center" });
      doc.text("Grade", gX + 18, gY + 3, { align: "center" });
      doc.text("GPA", gX + 27.5, gY + 3, { align: "center" });

      const gradesList = [
        ["80-100", "A+", "5.00"],
        ["70-79", "A", "4.00"],
        ["60-69", "A-", "3.50"],
        ["50-59", "B", "3.00"],
        ["40-49", "C", "2.00"],
        ["33-39", "D", "1.00"],
        ["0-32", "F", "0.00"],
      ];

      doc.setFont("helvetica", "normal");
      gradesList.forEach((gRow, idx) => {
        const rowY = gY + 7.5 + (idx * 3);
        doc.text(gRow[0], gX + 6.5, rowY, { align: "center" });
        doc.text(gRow[1], gX + 18, rowY, { align: "center" });
        doc.text(gRow[2], gX + 27.5, rowY, { align: "center" });
      });

      // Marks Sheet Pill
      doc.setFillColor(18, 140, 126);
      doc.roundedRect(88, 32, 34, 6, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Marks Sheet", 105, 36.2, { align: "center" });

      // 3. Student Info
      const pX = 14;
      const pY = 44;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(pX, pY, 22, 26, "D");
      if (student.photo_url) {
        try {
          doc.addImage(student.photo_url, "JPEG", pX + 0.5, pY + 0.5, 21, 25);
        } catch {
          doc.setFontSize(6);
          doc.setTextColor(150, 150, 150);
          doc.text("Photo", pX + 11, pY + 14, { align: "center" });
        }
      } else {
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        doc.text("No Photo", pX + 11, pY + 14, { align: "center" });
      }

      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      let infoY = 47;
      const col1X = 40;
      const col2X = 120;

      // Resolve class/batch and branch in Bengali/English for the PDF
      const branchObj = branches.find(b => String(b.id) === String(student.branch_id));
      const branchNameBn = branchObj ? (branchObj.name_bn || branchObj.branch_name || branchObj.name_en) : "N/A";
      
      const clsObj = branchObj?.academic_structure?.find(c => String(c.id) === String(student.class_id));
      const classNameBn = clsObj ? (clsObj.class_name?.bn || clsObj.class_name?.en || clsObj.class_name) : (student.batch || "N/A");

      const infoLeft = [
        ["Student's Name", `: ${student.full_name_bn || student.full_name_en || "N/A"}`],
        ["Father's Name", `: ${student.father_name || "N/A"}`],
        ["Mother's Name", `: ${student.mother_name || "N/A"}`],
        ["Roll No.", `: ${student.roll_number || "N/A"}`],
        ["Student's ID", `: ${student.id || "N/A"}`],
      ];

      const infoRight = [
        ["Exam", `: ${examTitle}`],
        ["Class", `: ${student.class_name || classNameBn}`],
        ["Section", `: ${student.section || "Boys"}`],
        ["Medium", `: ${student.medium || "General"}`],
      ];

      infoLeft.forEach((item, idx) => {
        const itemY = infoY + (idx * 4.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col1X, itemY);
        drawBengaliText(doc, item[1], col1X + 24, itemY, 8, "#1e293b", false);
      });

      infoRight.forEach((item, idx) => {
        const itemY = infoY + (idx * 4.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col2X, itemY);
        drawBengaliText(doc, item[1], col2X + 16, itemY, 8, "#1e293b", false);
      });

      // Render full width row for Branch below columns dynamically
      const branchY = infoY + (5 * 4.5); // 69.5 mm
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text("Branch", col1X, branchY);
      
      const branchLines = wrapBengaliText(branchNameBn, 120, 8, false);
      branchLines.forEach((line, lineIdx) => {
        const lineY = branchY + (lineIdx * 4.0);
        drawBengaliText(doc, lineIdx === 0 ? `: ${line}` : line, col1X + 24, lineY, 8, "#1e293b", false);
      });

      const branchHeight = Math.max(1, branchLines.length) * 4.0;

      // 4. Subject Marks Table starting Y dynamically
      const tY = branchY + branchHeight + 2.5;
      const tH = 8;
      doc.setFillColor(245, 247, 245);
      doc.rect(14, tY, W - 28, tH, "F");
      doc.setDrawColor(5, 46, 43);
      doc.setLineWidth(0.4);
      doc.rect(14, tY, W - 28, tH, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(5, 46, 43);
      doc.text("Name of Subjects", 18, tY + 5.5);
      doc.text("Full Marks", 95, tY + 5.5, { align: "center" });
      doc.text("Highest Marks", 120, tY + 5.5, { align: "center" });
      doc.text("Total Marks", 145, tY + 5.5, { align: "center" });
      doc.text("Letter Grade", 168, tY + 5.5, { align: "center" });
      doc.text("Grade Point", 188, tY + 5.5, { align: "center" });

      let tableRows = [];
      let totalFullMarks = 0;
      let totalObtainedMarks = 0;
      let calculatedGPA = 0;

      const studentBranch = branches.find(b => String(b.id) === String(student.branch_id)) || branches.find(b => String(b.id) === String(result.branch_id)) || branches[0];
      const marks = filterActiveMarksDetails(result.marks_details, student, studentBranch?.academic_structure);

      marks.forEach((m) => {
        const subj = typeof m.subject_name === "object" && m.subject_name !== null
          ? (m.subject_name?.bn || m.subject_name?.en || Object.values(m.subject_name).find(v => v) || "Subject")
          : (m.subject_name || "Subject");
        const obtained = parseFloat(m.obtained_marks || 0);
        const full = parseFloat(m.full_marks || 100);
        const highest = parseFloat(m.highest_marks || obtained);
        
        let pct = full > 0 ? (obtained / full) * 100 : 0;
        let grade = "F";
        let gp = 0.0;
        if (pct >= 80) { grade = "A+"; gp = 5.0; }
        else if (pct >= 70) { grade = "A"; gp = 4.0; }
        else if (pct >= 60) { grade = "A-"; gp = 3.5; }
        else if (pct >= 50) { grade = "B"; gp = 3.0; }
        else if (pct >= 40) { grade = "C"; gp = 2.0; }
        else if (pct >= 33) { grade = "D"; gp = 1.0; }

        tableRows.push([subj, full, highest, obtained, grade, gp.toFixed(2)]);
        totalFullMarks += full;
        totalObtainedMarks += obtained;
      });

      // GPA calculation based strictly on active subjects
      const isFailed = marks.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
      const totalGpaPoints = marks.reduce((sum, m) => {
        if (m.obtained_marks === "") return sum;
        const pct = (Number(m.obtained_marks) / Number(m.full_marks || 100)) * 100;
        let gpa = 0;
        if (pct >= 80) gpa = 5.0;
        else if (pct >= 70) gpa = 4.0;
        else if (pct >= 60) gpa = 3.5;
        else if (pct >= 50) gpa = 3.0;
        else if (pct >= 40) gpa = 2.0;
        else if (pct >= 33) gpa = 1.0;
        return sum + gpa;
      }, 0);
      calculatedGPA = marks.length > 0 ? totalGpaPoints / marks.length : 0;
      if (isFailed) calculatedGPA = 0;

      // Draw rows
      let currentY = tY + tH;
      doc.setLineWidth(0.2);
      doc.setDrawColor(180, 180, 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);

      tableRows.forEach((row) => {
        doc.line(14, currentY + tH, W - 14, currentY + tH);
        drawBengaliText(doc, row[0], 18, currentY + 5.5, 8, "#323232", false);
        doc.setFont("helvetica", "normal");
        doc.text(String(row[1]), 95, currentY + 5.5, { align: "center" });
        doc.text(String(row[2]), 120, currentY + 5.5, { align: "center" });
        doc.text(String(row[3]), 145, currentY + 5.5, { align: "center" });
        doc.text(String(row[4]), 168, currentY + 5.5, { align: "center" });
        doc.text(String(row[5]), 188, currentY + 5.5, { align: "center" });
        currentY += tH;
      });

      // Total obtained row
      doc.setFillColor(215, 240, 220);
      doc.rect(14, currentY, W - 28, tH, "F");
      doc.setDrawColor(5, 46, 43);
      doc.setLineWidth(0.3);
      doc.rect(14, currentY, W - 28, tH, "D");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 46, 43);
      doc.text("Obtained Marks & GPA", 18, currentY + 5.5);
      doc.text(String(totalFullMarks), 95, currentY + 5.5, { align: "center" });
      doc.text(String(totalObtainedMarks), 145, currentY + 5.5, { align: "center" });
      
      let letterGPA = "F";
      if (!isFailed) {
        if (calculatedGPA >= 5.0) letterGPA = "A+";
        else if (calculatedGPA >= 4.0) letterGPA = "A";
        else if (calculatedGPA >= 3.5) letterGPA = "A-";
        else if (calculatedGPA >= 3.0) letterGPA = "B";
        else if (calculatedGPA >= 2.0) letterGPA = "C";
        else if (calculatedGPA >= 1.0) letterGPA = "D";
      }

      doc.text(letterGPA, 168, currentY + 5.5, { align: "center" });
      doc.text(calculatedGPA.toFixed(2), 188, currentY + 5.5, { align: "center" });

      currentY += tH + 8;

      // 5. Bottom Stats box & Comment box
      const statBoxY = currentY;
      const statBoxW = 54;
      const statBoxH = 34;
      
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.2);
      doc.rect(14, statBoxY, statBoxW, statBoxH, "D");
      
      const totalDays = attendance.length || 30;
      const presentDays = attendance.filter(a => a.status === "present").length || 28;
      const absentDays = totalDays - presentDays;

      const statFields = [
        ["Result Status", isFailed ? "Failed" : "Passed"],
        ["Class Position", result.rank ? String(result.rank) : "—"],
        ["GPA", calculatedGPA.toFixed(2)],
        ["Failed Subject(s)", isFailed ? "Yes" : "0"],
        ["Working Days", String(totalDays)],
        ["Present Days", String(presentDays)],
        ["Absent Days", String(absentDays)],
      ];

      statFields.forEach((f, idx) => {
        const itemY = statBoxY + ((idx + 1) * (statBoxH / 7));
        if (idx < 6) {
          doc.line(14, itemY, 14 + statBoxW, itemY);
        }
        doc.line(14 + 32, statBoxY, 14 + 32, statBoxY + statBoxH);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(f[0], 16, itemY - 1.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(f[1], 14 + 43, itemY - 1.5, { align: "center" });
      });

      // Comments box
      const commBoxX = 74;
      const commBoxW = W - 14 - commBoxX;
      doc.setDrawColor(120, 120, 120);
      doc.rect(commBoxX, statBoxY, commBoxW, statBoxH, "D");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Comments:", commBoxX + 3, statBoxY + 4);
      
      const remarksText = result.remarks || (isFailed ? "Needs improvement. Please focus on weak subjects." : "Good academic progress. Maintain focus to achieve higher standards next term.");
      drawBengaliTextWrapped(doc, remarksText, commBoxX + 3, statBoxY + 8, 7.5, commBoxW - 6, 4.5, "#505050", false);

      // 6. Signatures
      const sigY = H - 28;
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.25);
      doc.line(14, sigY, 56, sigY);
      doc.line(84, sigY, 126, sigY);
      doc.line(154, sigY, 196, sigY);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text("Guardian's Signature", 35, sigY + 4, { align: "center" });
      doc.text("Class Teacher's Signature", 105, sigY + 4, { align: "center" });
      doc.text("Principal's Signature", 175, sigY + 4, { align: "center" });

      // 7. Bottom Brand Strip
      doc.line(14, H - 12, W - 14, H - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(130, 130, 130);
      doc.text("Powered by Rahmania Institute Management Suite", 14, H - 9);
      doc.text(`Published Date: ${format(new Date(), "dd-MM-yyyy")}`, W - 14, H - 9, { align: "right" });

      // Save PDF file
      const fileName = `${student.full_name_en?.replace(/\s+/g, "_")}_${examTitle.replace(/\s+/g, "_")}_Marks_Sheet.pdf`;
      doc.save(fileName);
      setIsOpen(false);
    } catch (e) {
      toast.error("Failed to generate marksheet PDF: " + e.message);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loadingResults}
        variant="premium-outline"
        className="gap-2.5 btn-hover-lift h-10 rounded-xl"
      >
        {loadingResults ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Award className="h-4 w-4 text-emerald-600" />
        )}
        Download Result
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#052E2B] flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" /> Select Exam Result
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please choose which exam marksheet you would like to download for {student.full_name_en}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-1">
            {examResults.map((result) => {
              const activeExam = examsList.find((e) => e.id === result.exam_id);
              const title = activeExam ? activeExam.title : "Exam Result";
              return (
                <Button
                  key={result.id}
                  variant="outline"
                  onClick={() => generateResultPDF(result)}
                  className="w-full justify-start text-left text-xs font-semibold py-6 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 border-slate-100 hover:border-emerald-200 transition-all flex items-center gap-3"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-bold">{title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      GPA: {parseFloat(result.gpa || 0).toFixed(2)} • Position: {result.rank || "—"}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
