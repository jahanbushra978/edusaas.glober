import { format } from "date-fns";
import { DEFAULT_LOGO } from "@/utils";
import { appClient } from "@/api/appClient";
import {
  calcSubjectGradeAndGPA,
  calcOverallGrade,
  calcQawmiDarajah,
  findStudentInList,
} from "./examCalculations";

export function getPrintableMarksheetInnerContent(student, branch, className, exam, result, settings, activeSubjects, resultSystem = "general") {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";

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

  const displayMarksDetails = (result.marks_details || []).filter(sub => {
    if (activeSubjectIds) {
      return activeSubjectIds.has(String(sub.subject_id || sub.id));
    }
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
      
      <div class="title-badge">
        <span>Official Academic Result Card</span>
      </div>
      
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
      
      <div class="merit-box">
        🏆 Merit Position: <strong style="font-size: 15px; color: #004D3A;">${displayRank ? `#${displayRank}` : "N/A"}</strong> in Class
      </div>
      
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

export async function recalculateMeritRanks(examId, classId) {
  try {
    const allResults = await appClient.entities.ExamResult.filter({ exam_id: examId, class_id: classId });
    if (!allResults || allResults.length === 0) return;
    
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
      const statusA = a.status === "pass" ? 1 : 0;
      const statusB = b.status === "pass" ? 1 : 0;
      if (statusA !== statusB) return statusB - statusA;
      
      const gpaA = a.gpa || 0;
      const gpaB = b.gpa || 0;
      if (gpaA !== gpaB) return gpaB - gpaA;
      
      const marksA = a.total_obtained_marks || 0;
      const marksB = b.total_obtained_marks || 0;
      return marksB - marksA;
    });
    
    for (let i = 0; i < sorted.length; i++) {
      const res = sorted[i];
      await appClient.entities.ExamResult.update(res.id, { rank: i + 1 });
    }
  } catch (err) {
    console.error("Error recalculating merit ranks:", err);
  }
}

export function printResultSheet(branch, className, exam, results, studentsList, settings, activeSubjects, resultSystem = "general") {
  const logoUrl = settings?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
  const isQawmi = resultSystem === "qawmi";

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

export function printBlankMarksheet(branch, className, subjectsList, studentsList) {
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
