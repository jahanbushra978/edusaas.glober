import { format } from "date-fns";
import { APPLICATION_TYPES_LIST, APPLICATION_STATUS_CONFIG } from "@/lib/permissions-definitions";

export const COMMON_DORKHASTO_SUBJECTS = [
  { value: "leave", label: "ছুটির জন্য আবেদনপত্র" },
  { value: "sick_leave", label: "অসুস্থতাজনিত কারণে ছুটির আবেদনপত্র" },
  { value: "home_leave", label: "বাড়ি যাওয়ার বিশেষ ছুটির আবেদনপত্র" },
  { value: "emergency_leave", label: "জরুরি পারিবারিক প্রয়োজনে ছুটির আবেদন" },
  { value: "late_entry", label: "দেরিতে মাদরাসায় প্রবেশের অনুমতির আবেদন" },
  { value: "early_leave", label: "জরুরি প্রয়োজনে সাময়িক ছাড়ের আবেদন" },
  { value: "certificate", label: "চারিত্রিক / প্রশংসাপত্র পাওয়ার আবেদন" },
  { value: "transfer_certificate", label: "ছাড়পত্র (টিসি) পাওয়ার আবেদনপত্র" },
  { value: "fee_waiver", label: "বেতন / পরীক্ষার ফি মওকুফের আবেদনপত্র" },
  { value: "exam_permission", label: "পরীক্ষায় অংশগ্রহণের বিশেষ অনুমতির আবেদন" },
  { value: "hostel_permission", label: "হোস্টেল সিট / অবস্থানের অনুমতির আবেদন" },
  { value: "custom", label: "অন্যান্য বিশেষ বিষয়ের আবেদন (কাস্টম বিষয়)" },
];

const TYPE_LABEL_BN = Object.fromEntries(APPLICATION_TYPES_LIST.map(t => [t.value, t.label.bn]));

/**
 * Generate full HTML for an official Madrasah Application (দরখাস্ত / আবেদনপত্র)
 * Supports both:
 * 1. Fully dynamic auto-filled reason & subject from web interface
 * 2. Blank / Fill-in-the-blank lined format for physical print & pen handwriting
 */
export function generateMadrasahDorkhastoHTML({
  application = {},
  settings = {},
  branch = null,
  applicantDetails = null,
  timeline = [],
  isBlankMode = false,
}) {
  const app = application || {};
  const instNameBn = settings?.institute_name_bn || settings?.site_title_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || settings?.site_title_en || "RAHMANIA INSTITUTE";
  const subTitle = settings?.institute_sub_bn || "দ্বীনি ও আধুনিক শিক্ষার এক অনন্য সমন্বিত প্রতিষ্ঠান";
  const logoUrl = settings?.logo_url || "/rahmania-logo-v2.png";
  
  const branchNameBn = branch?.name_bn || branch?.branch_name || branch?.name_en || "মূল ক্যাম্পাস / প্রধান শাখা";
  const address = branch?.address || settings?.address || "হরিণাল, গাজীপুর সদর, গাজীপুর - ১৭০০, ঢাকা, বাংলাদেশ";
  const phone = branch?.phone || settings?.contact_phone || settings?.phone || "০১৯০৬-৮৯৮৯৩৯";
  const email = settings?.email || settings?.contact_email || "rahmaniainstitute.org@gmail.com";
  const website = settings?.website_url || "www.rahmaniainstitute.edu.bd";

  // Resolve Subject
  let subjectText = "";
  if (app.custom_subject) {
    subjectText = app.custom_subject;
  } else if (app.subject) {
    subjectText = app.subject;
  } else if (app.custom_title) {
    subjectText = `${app.custom_title} সংক্রান্ত আবেদনপত্র`;
  } else if (app.type) {
    const matchedPreset = COMMON_DORKHASTO_SUBJECTS.find(s => s.value === app.type);
    if (matchedPreset) {
      subjectText = matchedPreset.label;
    } else {
      subjectText = `${TYPE_LABEL_BN[app.type] || app.type} সংক্রান্ত আবেদনপত্র`;
    }
  } else {
    subjectText = isBlankMode ? "................................................................................................" : "বিশেষ আবেদনপত্র";
  }

  // Ensure "বিষয়: " prefix if not already present
  if (!subjectText.startsWith("বিষয়:") && !subjectText.startsWith("বিষয়:")) {
    subjectText = `বিষয়: ${subjectText}`;
  }

  const isBlank = isBlankMode || (!app.reason && !app.from_date && !app.to_date);

  const appNumber = app.application_number || `RI-APP-${String(app.id || Date.now().toString().slice(-4))}`;
  const submitDate = app.submitted_at || app.created_at || new Date().toISOString();
  const formattedSubmitDateBn = format(new Date(submitDate), "dd/MM/yyyy");
  
  const statusCfg = APPLICATION_STATUS_CONFIG[app.status] || { bn: app.status || "অপেক্ষমান", color: "#d97706", bg: "#fffbeb" };

  const isStudent = app.applicant_type !== "teacher" && app.applicant_type !== "staff";
  const applicantRoleBn = isStudent ? "শিক্ষার্থী / ছাত্র" : (app.applicant_type === "teacher" ? "সম্মানিত শিক্ষক" : "কর্মকর্তা / কর্মচারী");

  // Reason text formatting (clean line breaks)
  const reasonHtml = app.reason ? (app.reason)
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br/>") : "";

  // Roll, Class, Guardian Info
  const rollNo = applicantDetails?.roll_number || app.roll_number || "";
  const className = applicantDetails?.class_name || applicantDetails?.batch || app.class_name || "";
  const fatherName = applicantDetails?.father_name || app.father_name || "";
  const mobileNo = applicantDetails?.contact_number || applicantDetails?.phone || applicantDetails?.mobile_number || app.mobile_number || "";
  const guardianPhone = applicantDetails?.guardian_phone || applicantDetails?.emergency_contact || "";
  const applicantName = app.applicant_name || applicantDetails?.full_name_bn || applicantDetails?.full_name_en || "";
  const studentId = applicantDetails?.id || app.applicant_id || "";

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>দরখাস্ত - ${appNumber} - ${instNameBn}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,700;1,700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }
    body {
      margin: 0;
      padding: 10px;
      font-family: "Hind Siliguri", "Noto Sans Bengali", "Amiri", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }

    .dorkhasto-wrapper {
      position: relative;
      background: #ffffff;
      border: 3px double #004D3A;
      padding: 16px 22px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px #d4af37;
      min-height: 1020px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 56px;
      font-weight: 700;
      color: rgba(0, 77, 58, 0.035);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      user-select: none;
      letter-spacing: 4px;
    }

    .content-area {
      position: relative;
      z-index: 1;
    }

    /* Arabic Bismillah Header */
    .bismillah-header {
      text-align: center;
      font-family: "Amiri", serif;
      font-size: 18px;
      font-weight: bold;
      color: #004D3A;
      margin-bottom: 4px;
      letter-spacing: 1px;
    }

    /* Madrasah Top Header */
    .inst-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #004D3A;
      padding-bottom: 8px;
      margin-bottom: 10px;
      gap: 15px;
    }
    .inst-logo-box {
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .inst-logo-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .inst-titles {
      flex: 1;
      text-align: center;
    }
    .inst-titles h1 {
      margin: 0;
      font-size: 23px;
      font-weight: 700;
      color: #004D3A;
      letter-spacing: 0.5px;
    }
    .inst-titles h2 {
      margin: 1px 0 0;
      font-size: 12.5px;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .inst-titles p {
      margin: 2px 0 0;
      font-size: 10.5px;
      color: #475569;
    }
    .inst-titles .branch-tag {
      display: inline-block;
      margin-top: 2px;
      padding: 1px 8px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      color: #166534;
      font-weight: 600;
      font-size: 10px;
    }

    .app-badge-col {
      width: 80px;
      text-align: right;
      flex-shrink: 0;
    }
    .app-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 700;
      text-align: center;
      border: 1px solid #cbd5e1;
    }

    /* Tracking Bar */
    .tracking-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 5px 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 11.5px;
    }
    .tracking-item strong {
      color: #004D3A;
    }

    /* Formal Address & Subject Section */
    .formal-to {
      margin-bottom: 8px;
      line-height: 1.4;
      font-size: 13px;
    }
    .formal-to .to-title {
      font-weight: 700;
      color: #004D3A;
    }

    .subject-line {
      background: #f0fdf4;
      border-left: 4px solid #004D3A;
      padding: 6px 12px;
      font-weight: 700;
      font-size: 13.5px;
      color: #064e3b;
      margin: 8px 0 10px 0;
      border-radius: 0 6px 6px 0;
    }

    /* Salutation & Body */
    .salutation {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .letter-body {
      font-size: 13px;
      line-height: 1.65;
      text-align: justify;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .letter-body p {
      margin: 0 0 6px 0;
      text-indent: 28px;
    }

    /* Reason Dynamic Box */
    .reason-dynamic-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 8px 0 10px 0;
      font-size: 13px;
      line-height: 1.6;
    }
    .reason-dynamic-box .reason-head {
      font-weight: 700;
      color: #004D3A;
      font-size: 11.5px;
      margin-bottom: 4px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 2px;
    }

    /* Blank Hand-writing Lined Area */
    .blank-lines-container {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 8px 0 10px 0;
    }
    .blank-head {
      font-weight: 700;
      color: #004D3A;
      font-size: 11.5px;
      margin-bottom: 8px;
    }
    .blank-row {
      display: flex;
      align-items: flex-end;
      margin-bottom: 16px;
      gap: 6px;
    }
    .blank-num {
      font-weight: bold;
      color: #004D3A;
      font-size: 11.5px;
      min-width: 18px;
    }
    .dotted-line {
      flex: 1;
      border-bottom: 1px dashed #64748b;
      height: 16px;
    }

    /* Details Grid Table */
    .applicant-info-card {
      margin: 10px 0 12px 0;
      border: 1px solid #004D3A;
      border-radius: 6px;
      overflow: hidden;
    }
    .card-head {
      background: #004D3A;
      color: #ffffff;
      padding: 4px 10px;
      font-weight: 700;
      font-size: 11.5px;
      display: flex;
      justify-content: space-between;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: #cbd5e1;
      font-size: 11.5px;
    }
    .info-cell {
      background: #ffffff;
      padding: 5px 8px;
    }
    .info-cell .lbl {
      color: #64748b;
      font-size: 10px;
      display: block;
      margin-bottom: 1px;
    }
    .info-cell .val {
      font-weight: 700;
      color: #0f172a;
    }
    .info-cell .blank-val {
      border-bottom: 1px dashed #94a3b8;
      display: inline-block;
      width: 85%;
      height: 14px;
    }

    /* Formal Closing */
    .formal-closing {
      margin-top: 8px;
      font-size: 13px;
      line-height: 1.5;
      text-indent: 28px;
    }

    /* Signatures Section */
    .signatures-section {
      margin-top: 26px;
      padding-top: 6px;
      page-break-inside: avoid;
    }
    .sig-row-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 15px;
    }
    .sig-row-bottom {
      display: flex;
      justify-content: space-between;
      gap: 15px;
    }
    .sig-box {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: #334155;
    }
    .sig-line {
      border-top: 1px dashed #64748b;
      margin: 0 auto 4px auto;
      width: 80%;
      min-width: 110px;
    }
    .sig-box .title {
      font-weight: 700;
      color: #0f172a;
    }
    .sig-box .sub {
      font-size: 9.5px;
      color: #64748b;
    }

    /* Office Verification Box */
    .office-box {
      margin-top: 14px;
      border: 1.5px solid #004D3A;
      border-radius: 6px;
      background: #fcfdfd;
      padding: 6px 10px;
      font-size: 10.5px;
      page-break-inside: avoid;
    }
    .office-box-head {
      font-weight: 700;
      color: #004D3A;
      font-size: 11px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 2px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .office-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      align-items: center;
    }

    /* Official Footer */
    .dorkhasto-footer {
      margin-top: 8px;
      padding-top: 4px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
    }

    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .dorkhasto-wrapper {
        border: 2px solid #004D3A;
        box-shadow: none;
        padding: 10px 16px;
        min-height: 980px;
      }
    }
  </style>
</head>
<body>

  <div class="dorkhasto-wrapper">
    <div class="watermark">${instNameBn}</div>

    <div class="content-area">
      <!-- 1. Bismillah Header -->
      <div class="bismillah-header">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

      <!-- 2. Madrasah Top Header -->
      <div class="inst-header">
        <div class="inst-logo-box">
          <img src="${logoUrl}" alt="${instNameEn}" onerror="this.style.display='none'" />
        </div>
        <div class="inst-titles">
          <h1>${instNameBn}</h1>
          <h2>${instNameEn}</h2>
          <p>${subTitle}</p>
          <div class="branch-tag">শাখা: ${branchNameBn} | ফোন: ${phone}</div>
        </div>
        <div class="app-badge-col">
          <div class="app-badge" style="background: ${statusCfg.bg || '#eff6ff'}; color: ${statusCfg.color || '#1e3a8a'};">
            ${isBlank ? "অফিস ফরম" : (statusCfg.bn || app.status)}
          </div>
          ${app.priority === "urgent" ? `<div style="color:#dc2626; font-weight:700; font-size:9.5px; margin-top:2px;">[জরুরি আবেদন]</div>` : ""}
        </div>
      </div>

      <!-- 3. Tracking & Meta Bar -->
      <div class="tracking-bar">
        <div class="tracking-item">
          <span>আবেদনপত্র নং:</span> <strong>${isBlank ? ".........................." : appNumber}</strong>
        </div>
        <div class="tracking-item">
          <span>তারিখ:</span> <strong>${formattedSubmitDateBn}</strong>
        </div>
        <div class="tracking-item">
          <span>আবেদনের ধরণ:</span> <strong>${TYPE_LABEL_BN[app.type] || app.custom_title || (isBlank ? "দরখাস্ত" : "বিশেষ আবেদন")}</strong>
        </div>
        <div class="tracking-item">
          <span>আবেদনকারী:</span> <strong>${applicantRoleBn}</strong>
        </div>
      </div>

      <!-- 4. Formal Recipient / To -->
      <div class="formal-to">
        <div class="to-title">বরাবর,</div>
        <div>মুহতামিম / অধ্যক্ষ সাহেব,</div>
        <div>${instNameBn}</div>
        <div>শাখা: ${branchNameBn}, ${address}</div>
      </div>

      <!-- 5. Subject Line (Dynamic or Selected) -->
      <div class="subject-line">
        ${subjectText}
      </div>

      <!-- 6. Salutation & Opening Text -->
      <div class="salutation">
        জনাব / মুহতারাম,
      </div>

      <div class="letter-body">
        <p>
          আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু। বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী 
          <strong>${applicantName || (isBlank ? "..................................................." : "শিক্ষার্থী/শিক্ষক")}</strong>, আপনার স্বনামধন্য দ্বীনি শিক্ষা প্রতিষ্ঠান 
          <strong>${instNameBn}</strong> (${branchNameBn})-এর একজন নিয়মিত ${applicantRoleBn} হিসেবে অধ্যয়নরত/কর্মরত আছি।
        </p>
        
        ${app.from_date || app.to_date ? `
        <p>
          বিশেষ কারণে আমার আগামী <strong>${app.from_date ? format(new Date(app.from_date), "dd/MM/yyyy") : "—"}</strong> হতে <strong>${app.to_date ? format(new Date(app.to_date), "dd/MM/yyyy") : "—"}</strong> তারিখ পর্যন্ত সর্বমোট <strong>${app.days_count || "—"}</strong> দিনের ছুটির একান্ত প্রয়োজন।
        </p>` : ``}
      </div>

      <!-- 7. Dynamic Need/Reason Box OR Ruled Blank Lines for Handwriting -->
      ${!isBlank && app.reason ? `
      <div class="reason-dynamic-box">
        <div class="reason-head">আবেদনের মূল কারণ ও বিস্তারিত বিবরণ:</div>
        <div>${reasonHtml}</div>
      </div>
      ` : `
      <div class="blank-lines-container">
        <div class="blank-head">আবেদনের মূল বিবরণ ও প্রয়োজন (হাতে লিখুন):</div>
        <div class="blank-row"><span class="blank-num">১.</span><div class="dotted-line"></div></div>
        <div class="blank-row"><span class="blank-num">২.</span><div class="dotted-line"></div></div>
        <div class="blank-row"><span class="blank-num">৩.</span><div class="dotted-line"></div></div>
        <div class="blank-row"><span class="blank-num">৪.</span><div class="dotted-line"></div></div>
      </div>
      `}

      <!-- 8. Structured Applicant Info Grid (Auto-filled or Blank Lines) -->
      <div class="applicant-info-card">
        <div class="card-head">
          <span>আবেদনকারীর তথ্য বিবরণী</span>
          <span>আইডি: ${studentId || "................"}</span>
        </div>
        <div class="info-grid">
          <div class="info-cell">
            <span class="lbl">আবেদনকারীর নাম</span>
            <span class="val">${applicantName || '<span class="blank-val"></span>'}</span>
          </div>
          <div class="info-cell">
            <span class="lbl">${isStudent ? "রোল নম্বর" : "পদবি / দায়িত্ব"}</span>
            <span class="val">${(isStudent ? rollNo : applicantDetails?.designation) || '<span class="blank-val"></span>'}</span>
          </div>
          <div class="info-cell">
            <span class="lbl">${isStudent ? "বিভাগ / শ্রেণি" : "বিভাগ"}</span>
            <span class="val">${(isStudent ? className : applicantDetails?.department) || '<span class="blank-val"></span>'}</span>
          </div>
          <div class="info-cell">
            <span class="lbl">শাখা ক্যাম্পাস</span>
            <span class="val">${branchNameBn}</span>
          </div>
          <div class="info-cell">
            <span class="lbl">${isStudent ? "পিতার নাম" : "যোগাযোগ মোবাইল"}</span>
            <span class="val">${(isStudent ? fatherName : mobileNo) || '<span class="blank-val"></span>'}</span>
          </div>
          <div class="info-cell">
            <span class="lbl">${isStudent ? "অভিভাবকের মোবাইল" : "ইমেইল"}</span>
            <span class="val">${(isStudent ? (guardianPhone || mobileNo) : (applicantDetails?.email || email)) || '<span class="blank-val"></span>'}</span>
          </div>
        </div>
      </div>

      <!-- 9. Formal Closing Prayer -->
      <div class="formal-closing">
        অতএব, মুহতারামের সমীপে বিনীত আবেদন, আমার সার্বিক পরিস্থিতি বিবেচনাপূর্বক দরখাস্তটি মঞ্জুর করে বাধিত করবেন।
      </div>

      <!-- 10. Official Signatures Section for Office Submission -->
      <div class="signatures-section">
        <div class="sig-row-top">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="title">আবেদনকারীর স্বাক্ষর ও তারিখ</div>
            <div class="sub">তারিখ: ${formattedSubmitDateBn}</div>
          </div>
          ${isStudent ? `
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="title">অভিভাবকের সম্মতি ও স্বাক্ষর</div>
            <div class="sub">মোবাইল: ${guardianPhone || "...................."}</div>
          </div>` : `
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="title">বিভাগীয় প্রধানের সুপারিশ</div>
            <div class="sub">স্বাক্ষর ও মন্তব্য</div>
          </div>`}
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="title">শ্রেণি শিক্ষক / ইনচার্জের সুপারিশ</div>
            <div class="sub">স্বাক্ষর ও তারিখ</div>
          </div>
        </div>

        <div class="sig-row-bottom">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="title">হোস্টেল সুপার / প্রশাসন শাখা</div>
            <div class="sub">মন্তব্য ও সুপারিশ</div>
          </div>
          <div class="sig-box" style="flex: 1.4;">
            <div class="sig-line" style="border-top: 1.5px solid #004D3A; width: 85%;"></div>
            <div class="title" style="color: #004D3A; font-size: 12px;">মুহতামিম / অধ্যক্ষের অনুমোদন ও সিল</div>
            <div class="sub">${instNameBn}</div>
          </div>
        </div>
      </div>

      <!-- 11. Office Verification & Diary Box -->
      <div class="office-box">
        <div class="office-box-head">
          <span>অফিস ব্যবহারের জন্য (For Madrasah Office Use Only)</span>
          <span>জমার রসিদ / ডায়েরি অংশ</span>
        </div>
        <div class="office-grid">
          <div><strong>ডায়েরি / স্মারক নং:</strong> ____________</div>
          <div><strong>জমা গ্রহণের তারিখ:</strong> ____________</div>
          <div><strong>গৃহীত সিদ্ধান্ত:</strong> [ ] মঞ্জুর  [ ] নামঞ্জুর</div>
          <div><strong>দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর:</strong> ________</div>
        </div>
      </div>
    </div>

    <!-- 12. Footer -->
    <div class="dorkhasto-footer">
      <span>অফিসিয়াল দরখাস্ত প্রিন্ট কপি • ${instNameBn} (${instNameEn})</span>
      <span>মুদ্রণ তারিখ: ${format(new Date(), "dd/MM/yyyy hh:mm a")}</span>
      <span>ওয়েবসাইট: ${website}</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
}

/**
 * Direct Browser Print execution
 */
export function printMadrasahApplicationDirect({
  application = {},
  settings = {},
  branch = null,
  applicantDetails = null,
  timeline = [],
  isBlankMode = false,
}) {
  const html = generateMadrasahDorkhastoHTML({
    application,
    settings,
    branch,
    applicantDetails,
    timeline,
    isBlankMode,
  });

  const printWindow = window.open("", "_blank", "width=850,height=950,top=50,left=150");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 3000);
      }, 300);
    };
  }
}
