import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
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
    drawBengaliText(doc, line, x, y + (idx * lineHeight), fontSize, color, isBold);
  });
  return lines.length;
};

export default function PDFReportButton({ student, attendance = [] }) {
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
    queryFn: () => appClient.entities.AppSettings.list().then(res => {
      return Object.fromEntries(res.map(s => [s.key, s.value]));
    }),
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["pdf-student-fees", student.id],
    queryFn: () => appClient.entities.Fee.filter({ student_id: student.id }),
    enabled: !!student.id,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["pdf-branches-list"],
    queryFn: () => appClient.entities.Branch.list(),
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
        // Logo fallback (circular with initials)
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
      doc.text("STUDENT PROFILE REPORT", 105, 37.8, { align: "center" });

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
      if (student.photo_url) {
        try {
          doc.addImage(student.photo_url, "JPEG", pX + 0.5, pY + 0.5, 25, 31);
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

      // Resolve class/batch and branch in Bengali/English for the PDF
      const branchObj = branches.find(b => String(b.id) === String(student.branch_id));
      const branchNameBn = branchObj ? (branchObj.name_bn || branchObj.branch_name || branchObj.name_en) : "N/A";
      
      const clsObj = branchObj?.academic_structure?.find(c => String(c.id) === String(student.class_id));
      const classNameBn = clsObj ? (clsObj.class_name?.bn || clsObj.class_name?.en || clsObj.class_name) : (student.batch || "N/A");

      const infoLeft = [
        ["Student ID", `: ${student.id || "N/A"}`],
        ["Student Name", `: ${student.full_name_bn || student.full_name_en || "N/A"}`],
        ["Class / Batch", `: ${student.class_name || classNameBn}`],
        ["Roll Number", `: ${student.roll_number || "N/A"}`],
        ["Section", `: ${student.section || "Boys"}`],
      ];

      const infoRight = [
        ["Father's Name", `: ${student.father_name || "N/A"}`],
        ["Mother's Name", `: ${student.mother_name || "N/A"}`],
        ["Contact Number", `: ${student.contact_number || "N/A"}`],
        ["Status", `: ${student.status?.toUpperCase() || "ACTIVE"}`],
        ["Admission Date", `: ${student.admission_date ? format(new Date(student.admission_date), "dd MMM yyyy") : "N/A"}`],
      ];

      infoLeft.forEach((item, idx) => {
        const itemY = infoY + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col1X, itemY);
        drawBengaliText(doc, item[1], col1X + 24, itemY, 8.5, "#1e293b", false);
      });

      infoRight.forEach((item, idx) => {
        const itemY = infoY + (idx * 5.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 30, 30);
        doc.text(item[0], col2X, itemY);
        drawBengaliText(doc, item[1], col2X + 24, itemY, 8.5, "#1e293b", false);
      });

      // Render full width rows for Branch and Address below columns dynamically
      const branchY = infoY + (5 * 5.2); // 79 mm
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      doc.text("Branch", col1X, branchY);
      
      const branchLines = wrapBengaliText(branchNameBn, 120, 8.5, false);
      branchLines.forEach((line, lineIdx) => {
        const lineY = branchY + (lineIdx * 4.5);
        drawBengaliText(doc, lineIdx === 0 ? `: ${line}` : line, col1X + 24, lineY, 8.5, "#1e293b", false);
      });

      const branchHeight = Math.max(1, branchLines.length) * 4.5;
      const addressY = branchY + branchHeight + 1; // Start address Y dynamically

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      doc.text("Address", col1X, addressY);

      const addressVal = student.address_bn || student.address || "N/A";
      const addressLines = wrapBengaliText(addressVal, 120, 8.5, false);
      addressLines.forEach((line, lineIdx) => {
        const lineY = addressY + (lineIdx * 4.5);
        drawBengaliText(doc, lineIdx === 0 ? `: ${line}` : line, col1X + 24, lineY, 8.5, "#1e293b", false);
      });

      const addressHeight = Math.max(1, addressLines.length) * 4.5;
      const dividerY = addressY + addressHeight + 2;

      // Divider line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(14, dividerY, W - 14, dividerY);

      // 4. Academic & Attendance Section
      const secY = dividerY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 46, 43);
      doc.text("ACADEMIC & ATTENDANCE SUMMARY", 14, secY);

      // Attendance Stats
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === "present").length;
      const absentDays = totalDays - presentDays;
      const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 248);
      doc.rect(14, secY + 3, W - 28, 18, "FD");

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text("Attendance Rate", 25, secY + 9);
      doc.text("Total Working Days", 75, secY + 9);
      doc.text("Present Days", 125, secY + 9);
      doc.text("Absent Days", 170, secY + 9);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(attendancePct < 75 ? 180 : 5, attendancePct < 75 ? 40 : 98, attendancePct < 75 ? 40 : 65);
      doc.text(`${attendancePct}%`, 25, secY + 16);
      doc.setTextColor(30, 30, 30);
      doc.text(String(totalDays), 75, secY + 16);
      doc.text(String(presentDays), 125, secY + 16);
      doc.text(String(absentDays), 170, secY + 16);

      // Divider
      doc.line(14, secY + 28, W - 14, secY + 28);

      // 5. Fees & Financial Status Section
      const finY = secY + 34;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 46, 43);
      doc.text("FINANCIAL FEES STATUS", 14, finY);

      // Fees stats
      const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
      const totalDue = fees.reduce((sum, f) => sum + (f.due_amount || 0), 0);
      const totalFee = fees.reduce((sum, f) => sum + (f.total_fee || 0), 0);

      let monthlyFee = 0;
      if (student.custom_fields) {
        try {
          const parsed = JSON.parse(student.custom_fields);
          monthlyFee = parsed.fees_setup?.["Monthly Tuition Fee"] || 0;
        } catch (e) {}
      }

      // Explicitly set light background fill to fix dark green readability issue
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 248);
      doc.rect(14, finY + 3, W - 28, 18, "FD");

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text("Monthly Tuition Fee", 25, finY + 9);
      doc.text("Total Invoiced", 75, finY + 9);
      doc.text("Total Paid Amount", 125, finY + 9);
      doc.text("Outstanding Due", 170, finY + 9);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`TK ${monthlyFee.toLocaleString()}`, 25, finY + 16);
      doc.text(`TK ${totalFee.toLocaleString()}`, 75, finY + 16);
      doc.setTextColor(18, 140, 126);
      doc.text(`TK ${totalPaid.toLocaleString()}`, 125, finY + 16);
      doc.setTextColor(totalDue > 0 ? 180 : 30, totalDue > 0 ? 40 : 30, totalDue > 0 ? 40 : 30);
      doc.text(`TK ${totalDue.toLocaleString()}`, 170, finY + 16);

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
      doc.text("Guardian's Signature", 35, sigY + 5, { align: "center" });
      doc.text("Class Teacher's Signature", 105, sigY + 5, { align: "center" });
      doc.text("Principal's Signature", 175, sigY + 5, { align: "center" });

      // 7. Footer brand
      doc.line(14, H - 15, W - 14, H - 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text("Powered by Rahmania Institute Management Suite", 14, H - 10);
      doc.text(`Generated Date: ${format(new Date(), "dd-MM-yyyy")}`, W - 14, H - 10, { align: "right" });

      // Save PDF
      const fileName = `${student.full_name_en?.replace(/\s+/g, "_")}_Profile_Report.pdf`;
      doc.save(fileName);
    } catch (e) {
      toast.error("Failed to generate profile report: " + e.message);
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