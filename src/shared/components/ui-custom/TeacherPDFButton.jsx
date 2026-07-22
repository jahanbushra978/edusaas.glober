import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

let cachedFontBase64 = null;

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
  const fontSpec = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Noto Sans Bengali", sans-serif`;
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

const containsBengali = (text) => /[\u0980-\u09FF]/.test(text);

const drawBengaliText = (doc, text, x, y, fontSize, color = "#1e293b", isBold = false, align = "left") => {
  const str = String(text || "");
  if (!str || str === "N/A" || str === "—" || !containsBengali(str)) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 30, 30);
    doc.text(str, x, y, { align });
    return;
  }
  const result = renderBengaliText(str, fontSize, color, isBold);
  if (result) {
    let drawX = x;
    if (align === "center") {
      drawX = x - result.width / 2;
    } else if (align === "right") {
      drawX = x - result.width;
    }
    doc.addImage(result.dataUrl, "PNG", drawX, y - result.height * 0.72, result.width, result.height);
  } else {
    doc.setFont("NotoSansBengali", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 30, 30);
    doc.text(str, x, y, { align });
  }
};

const wrapBengaliText = (text, maxWidth, fontSize, isBold = false) => {
  if (typeof window === "undefined" || !text) return [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 4;
  ctx.font = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Noto Sans Bengali", sans-serif`;
  
  const words = text.split(" ");
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
  if (!str || str === "N/A" || str === "—" || !containsBengali(str)) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(80, 80, 80);
    doc.text(str, x, y, { maxWidth });
    return 1;
  }
  const lines = wrapBengaliText(str, maxWidth, fontSize, isBold);
  lines.forEach((line, idx) => {
    doc.setFont("helvetica", "normal"); // clear font
    drawBengaliText(doc, line, x, y + (idx * lineHeight), fontSize, color, isBold);
  });
  return lines.length;
};

export default function TeacherPDFButton({ teacher, assignedStudents = [] }) {
  const [generating, setGenerating] = useState(false);

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
    queryFn: () => appClient.entities.AppSettings.list().then((res) => {
      return Object.fromEntries(res.map((s) => [s.key, s.value]));
    }),
  });

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      
      try {
        const fontBase64 = await getNotoSansBengaliFont();
        doc.addFileToVFS("NotoSansBengali.ttf", fontBase64);
        doc.addFont("NotoSansBengali.ttf", "NotoSansBengali", "normal");
        doc.setFont("NotoSansBengali");
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
        // Logo fallback
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
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(instNameEn.toUpperCase(), 115, 18, { align: "center" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      const address = settings?.address || "Horiinal, Gazipur, Dhaka, Bangladesh - 1700";
      const contactPhone = settings?.contact_phone || "01906898939";
      const contactEmail = settings?.email || settings?.contact_email || "rahmaniainstitute.org@gmail.com";
      
      doc.text(address, 115, 23, { align: "center" });
      doc.text(`Cell: ${contactPhone} | Email: ${contactEmail}`, 115, 27, { align: "center" });

      // Title Pill
      doc.setFillColor(18, 140, 126); // Teal
      doc.roundedRect(80, 33, 50, 7, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TEACHER PROFILE REPORT", 105, 37.8, { align: "center" });

      // Divider
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(14, 45, W - 14, 45);

      // 3. Portrait & Basic Information
      const pX = 14;
      const pY = 50;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.25);
      doc.rect(pX, pY, 26, 32, "D");
      if (teacher.photo_url || teacher.image_url) {
        try {
          doc.addImage(teacher.photo_url || teacher.image_url, "JPEG", pX + 0.5, pY + 0.5, 25, 31);
        } catch (e) {
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text("Photo", pX + 13, pY + 16, { align: "center" });
        }
      } else {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("No Photo", pX + 13, pY + 16, { align: "center" });
      }

      // Details Columns
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      let infoY = 53;
      const col1X = 47;
      const col2X = 125;

      const infoLeft = [
        ["Teacher ID", `: ${teacher.teacher_id || "N/A"}`],
        ["Name (English)", `: ${teacher.full_name_en || teacher.name || "N/A"}`],
        ["Name (Bengali)", `: ${teacher.full_name_bn || "N/A"}`],
        ["Designation", `: ${teacher.designation || "N/A"}`],
        ["Department", `: ${teacher.department || "N/A"}`],
        ["Branch", `: ${teacher.branch || "N/A"}`],
      ];

      const infoRight = [
        ["Employee Code", `: ${teacher.employee_code || "N/A"}`],
        ["Mobile Number", `: ${teacher.phone || "N/A"}`],
        ["Email Address", `: ${teacher.user_email || "N/A"}`],
        ["NID Number", `: ${teacher.nid_number || "N/A"}`],
        ["Status", `: ${teacher.status?.toUpperCase() || "ACTIVE"}`],
        ["Joining Date", `: ${teacher.joining_date ? format(new Date(teacher.joining_date), "dd-MM-yyyy") : "N/A"}`],
      ];

      infoLeft.forEach((item, idx) => {
        const itemY = infoY + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col1X, itemY);
        drawBengaliText(doc, item[1], col1X + 24, itemY, 9, "#1e293b", false);
      });

      infoRight.forEach((item, idx) => {
        const itemY = infoY + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col2X, itemY);
        drawBengaliText(doc, item[1], col2X + 24, itemY, 9, "#1e293b", false);
      });

      // Divider
      doc.setFont("helvetica", "normal");
      doc.line(14, 86, W - 14, 86);

      // 4. Contact & Bio Section
      let currentY = 92;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 46, 43);
      doc.text("ADDRESS & BIO DETAILS", 14, currentY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Present Address", 14, currentY + 6);
      doc.text("Permanent Address", 110, currentY + 6);

      drawBengaliTextWrapped(doc, `: ${teacher.present_address || "N/A"}`, 14, currentY + 11, 8.5, 85, 4.5, "#1e293b", false);
      drawBengaliTextWrapped(doc, `: ${teacher.permanent_address || "N/A"}`, 110, currentY + 11, 8.5, 85, 4.5, "#1e293b", false);

      currentY += 24;
      doc.line(14, currentY, W - 14, currentY);

      // Professional qualifications
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 46, 43);
      doc.text("PROFESSIONAL QUALIFICATION & SKILLS", 14, currentY);

      const qualLeft = [
        ["Subjects Taught", `: ${teacher.subjects || "N/A"}`],
        ["Qualification", `: ${teacher.qualification || "N/A"}`],
      ];

      const qualRight = [
        ["Experience Years", `: ${teacher.experience_years ? `${teacher.experience_years} Years` : "N/A"}`],
        ["Special Skills", `: ${teacher.special_skills || "N/A"}`],
      ];

      qualLeft.forEach((item, idx) => {
        const itemY = currentY + 5 + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], 14, itemY);
        drawBengaliText(doc, item[1], 14 + 32, itemY, 9, "#1e293b", false);
      });

      qualRight.forEach((item, idx) => {
        const itemY = currentY + 5 + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], 110, itemY);
        drawBengaliText(doc, item[1], 110 + 32, itemY, 9, "#1e293b", false);
      });

      currentY += 18;
      doc.line(14, currentY, W - 14, currentY);

      // Assigned Students Summary List
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 46, 43);
      doc.text(`ASSIGNED STUDENTS SUMMARY (${assignedStudents.length} Students)`, 14, currentY);

      const tableY = currentY + 3;
      const tableH = 6;
      doc.setFillColor(245, 247, 245);
      doc.rect(14, tableY, W - 28, tableH, "F");
      doc.setDrawColor(5, 46, 43);
      doc.setLineWidth(0.3);
      doc.rect(14, tableY, W - 28, tableH, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(5, 46, 43);
      doc.text("Roll No", 18, tableY + 4.2);
      doc.text("Student Name", 40, tableY + 4.2);
      doc.text("Class / Batch", 110, tableY + 4.2);
      doc.text("Section", 155, tableY + 4.2);
      doc.text("Status", 180, tableY + 4.2);

      let rowY = tableY + tableH;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);

      // Draw first 10 students
      const visibleStudents = assignedStudents.slice(0, 12);
      if (visibleStudents.length === 0) {
        doc.rect(14, rowY, W - 28, tableH, "D");
        doc.text("No students assigned to this teacher.", 105, rowY + 4.2, { align: "center" });
        rowY += tableH;
      } else {
        visibleStudents.forEach((student) => {
          doc.rect(14, rowY, W - 28, tableH, "D");
          doc.setFont("helvetica", "normal");
          doc.text(student.roll_number || "—", 18, rowY + 4.2);
          
          drawBengaliText(doc, student.full_name_bn || student.full_name_en || "—", 40, rowY + 4.2, 7.5, "#323232", false);
          drawBengaliText(doc, student.batch || "—", 110, rowY + 4.2, 7.5, "#323232", false);
          drawBengaliText(doc, student.section || "Boys", 155, rowY + 4.2, 7.5, "#323232", false);
          
          doc.setFont("helvetica", "normal");
          doc.text(student.status?.toUpperCase() || "ACTIVE", 180, rowY + 4.2);
          rowY += tableH;
        });
      }

      // 6. Signatures (Bottom)
      const sigY = H - 35;
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.25);
      doc.line(14, sigY, 56, sigY);
      doc.line(84, sigY, 126, sigY);
      doc.line(154, sigY, 196, sigY);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Teacher's Signature", 35, sigY + 5, { align: "center" });
      doc.text("Branch Admin's Signature", 105, sigY + 5, { align: "center" });
      doc.text("Principal's Signature", 175, sigY + 5, { align: "center" });

      // 7. Footer brand
      doc.line(14, H - 15, W - 14, H - 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text("Powered by Rahmania Institute Management Suite", 14, H - 10);
      doc.text(`Generated Date: ${format(new Date(), "dd-MM-yyyy")}`, W - 14, H - 10, { align: "right" });

      // Save PDF
      const fileName = `${teacher.full_name_en?.replace(/\s+/g, "_")}_Profile_Report.pdf`;
      doc.save(fileName);
    } catch (e) {
      toast.error("Failed to generate profile report: " + e.message);
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={generating}
      variant="premium-outline"
      className="gap-2.5 btn-hover-lift h-10 rounded-xl"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {generating ? "Generating..." : "Download Report"}
    </Button>
  );
}
