import { format } from "date-fns";

/**
 * Generate full HTML for an official Madrasah Admission Application Form (ভর্তি আবেদন ফরম)
 */
export function generateMadrasahAdmissionFormHTML({
  admission,
  settings = {},
  branch = null,
}) {
  const data = admission || {};
  const instNameBn = settings?.institute_name_bn || settings?.site_title_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || settings?.site_title_en || "RAHMANIA INSTITUTE";
  const subTitle = settings?.institute_sub_bn || "দ্বীনি ও আধুনিক শিক্ষার এক অনন্য সমন্বিত প্রতিষ্ঠান";
  const logoUrl = settings?.logo_url || "/rahmania-logo-v2.png";
  
  const branchNameBn = branch?.name_bn || branch?.branch_name || branch?.name_en || "প্রধান শাখা (Main Branch)";
  const address = branch?.address || settings?.address || "হরিণাল, গাজীপুর সদর, গাজীপুর - ১৭০০, ঢাকা, বাংলাদেশ";
  const phone = branch?.phone || settings?.contact_phone || settings?.phone || "০১৯০৬-৮৯৮৯৩৯";
  const email = settings?.email || settings?.contact_email || "rahmaniainstitute.org@gmail.com";
  const website = settings?.website_url || "www.rahmaniainstitute.edu.bd";

  const appNumber = data.id ? `ADM-${String(data.id).padStart(5, '0')}` : `ADM-TEMP-${Date.now().toString().slice(-4)}`;
  const submitDate = data.created_date || data.created_at || new Date().toISOString();
  const formattedDate = format(new Date(submitDate), "dd/MM/yyyy");

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ভর্তি আবেদন ফরম - ${appNumber} - ${instNameBn}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  
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
      padding: 12px;
      font-family: "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.45;
    }

    .form-wrapper {
      position: relative;
      background: #ffffff;
      border: 3px double #004D3A;
      padding: 16px 22px;
      border-radius: 8px;
      min-height: 1020px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .bismillah {
      text-align: center;
      font-family: "Amiri", serif;
      font-size: 17px;
      font-weight: bold;
      color: #004D3A;
      margin-bottom: 4px;
    }

    .header-table {
      width: 100%;
      border-bottom: 2px solid #004D3A;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .inst-title h1 {
      margin: 0;
      font-size: 24px;
      color: #004D3A;
      font-weight: 700;
    }
    .inst-title h2 {
      margin: 2px 0 0;
      font-size: 12.5px;
      color: #b45309;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .inst-title p {
      margin: 2px 0 0;
      font-size: 10.5px;
      color: #475569;
    }

    .photo-box {
      width: 100px;
      height: 115px;
      border: 1.5px dashed #004D3A;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      background: #f8fafc;
      border-radius: 4px;
      overflow: hidden;
    }
    .photo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .form-title-pill {
      background: #004D3A;
      color: #ffffff;
      text-align: center;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 15px;
      margin: 8px 0 12px 0;
      letter-spacing: 0.5px;
    }

    .meta-strip {
      display: flex;
      justify-content: space-between;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      margin-bottom: 12px;
    }

    .section-head {
      background: #f0fdf4;
      border-left: 4px solid #004D3A;
      padding: 4px 10px;
      font-weight: 700;
      font-size: 12px;
      color: #064e3b;
      margin: 10px 0 6px 0;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .data-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .data-table .lbl {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
      width: 25%;
    }
    .data-table .val {
      font-weight: 700;
      color: #0f172a;
    }

    .declaration-box {
      background: #fcfdfd;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11.5px;
      line-height: 1.5;
      margin: 10px 0;
      text-align: justify;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      gap: 15px;
    }
    .sig-box {
      flex: 1;
      text-align: center;
      font-size: 11px;
    }
    .sig-line {
      border-top: 1px dashed #64748b;
      margin-bottom: 4px;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
    }

    .office-section {
      border: 1.5px solid #004D3A;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 15px;
      background: #fcfdfd;
      font-size: 11px;
    }
    .office-head {
      font-weight: 700;
      color: #004D3A;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .office-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .footer-bar {
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
      margin-top: 8px;
    }

    @media print {
      body { padding: 0; }
      .form-wrapper { border: 2px solid #004D3A; }
    }
  </style>
</head>
<body>

  <div class="form-wrapper">
    <div>
      <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

      <table class="header-table">
        <tr>
          <td style="width: 70px; vertical-align: middle;">
            <img src="${logoUrl}" alt="Logo" style="width: 65px; height: 65px; object-fit: contain;" onerror="this.style.display='none'" />
          </td>
          <td style="text-align: center; vertical-align: middle;" class="inst-title">
            <h1>${instNameBn}</h1>
            <h2>${instNameEn}</h2>
            <p>${subTitle}</p>
            <p style="font-size: 10px; font-weight: 600; color: #004D3A;">শাখা: ${branchNameBn} | ঠিকানা: ${address} | মোবাইল: ${phone}</p>
          </td>
          <td style="width: 105px; text-align: right; vertical-align: middle;">
            <div class="photo-box">
              ${data.photo_url ? `<img src="${data.photo_url}" alt="Student Photo" />` : `পাসপোর্ট সাইজ<br/>ছবি যুক্ত করুন`}
            </div>
          </td>
        </tr>
      </table>

      <div class="form-title-pill">
        ভর্তি আবেদন ফরম (STUDENT ADMISSION FORM)
      </div>

      <div class="meta-strip">
        <div><strong>আবেদন ফরম নং:</strong> ${appNumber}</div>
        <div><strong>তারিখ:</strong> ${formattedDate}</div>
        <div><strong>আবেদিত শাখা:</strong> ${branchNameBn}</div>
        <div><strong>স্ট্যাটাস:</strong> ${data.status === 'approved' ? 'অনুমোদিত' : 'পেন্ডিং / প্রক্রিয়াকরণ'}</div>
      </div>

      <div class="section-head">১. শিক্ষার্থীর ব্যক্তিগত ও পারিবারিক তথ্যাবলি (Student Details)</div>
      <table class="data-table">
        <tr>
          <td class="lbl">শিক্ষার্থীর নাম (বাংলা)</td>
          <td class="val" colspan="3">${data.full_name_bn || data.full_name_en || "—"}</td>
        </tr>
        <tr>
          <td class="lbl">Student Name (English)</td>
          <td class="val">${data.full_name_en || "—"}</td>
          <td class="lbl">الاسم باللغة العربية</td>
          <td class="val">${data.full_name_ar || "—"}</td>
        </tr>
        <tr>
          <td class="lbl">পিতার নাম</td>
          <td class="val">${data.father_name || "—"}</td>
          <td class="lbl">মাতার নাম</td>
          <td class="val">${data.mother_name || "—"}</td>
        </tr>
        <tr>
          <td class="lbl">জন্ম তারিখ</td>
          <td class="val">${data.date_of_birth ? format(new Date(data.date_of_birth), "dd/MM/yyyy") : "—"}</td>
          <td class="lbl">অভিভাবকের মোবাইল নং</td>
          <td class="val">${data.mobile_number || "—"}</td>
        </tr>
        <tr>
          <td class="lbl">বর্তমান ও স্থায়ী ঠিকানা</td>
          <td class="val" colspan="3">${data.address || "—"}</td>
        </tr>
      </table>

      <div class="section-head">২. ভর্তিচ্ছু বিভাগ ও শিক্ষাগত যোগ্যতা (Academic Information)</div>
      <table class="data-table">
        <tr>
          <td class="lbl">ভর্তিচ্ছু বিভাগ / শ্রেণি</td>
          <td class="val">${data.desired_session || "—"}</td>
          <td class="lbl">পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের নাম</td>
          <td class="val">${data.previous_education || "—"}</td>
        </tr>
      </table>

      <div class="declaration-box">
        <strong>অভিভাবকের অঙ্গীকারনামা:</strong> আমি এই মর্মে প্রত্যয়ন করছি যে, উপরোক্ত তথ্যাবলি সম্পূর্ণ সত্য ও সঠিক। আমার সন্তানকে মাদরাসার সকল নিয়ম-শৃঙ্খলা, আদব-কায়দা এবং পাঠ্যসূচি যথাযথভাবে মেনে চলার জন্য সচেষ্ট রাখব।
      </div>

      <div class="signatures">
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>শিক্ষার্থীর স্বাক্ষর</strong>
          <div style="font-size: 9.5px; color: #64748b;">তারিখ: ${formattedDate}</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>অভিভাবকের পূর্ণ স্বাক্ষর</strong>
          <div style="font-size: 9.5px; color: #64748b;">মোবাইল: ${data.mobile_number || "..........."}</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>ভর্তি কমিটি / যাচাইকারীর স্বাক্ষর</strong>
          <div style="font-size: 9.5px; color: #64748b;">মন্তব্য ও সুপারিশ</div>
        </div>
      </div>

      <div class="office-section">
        <div class="office-head">
          <span>🏛️ অফিস ব্যবহারের জন্য (For Madrasah Office Use Only)</span>
          <span>ভর্তি অনুমোদন অংশ</span>
        </div>
        <div class="office-grid">
          <div><strong>ভর্তি রোল / আইডি নং:</strong> ____________</div>
          <div><strong>বরাদ্দকৃত বিভাগ/শ্রেণি:</strong> ____________</div>
          <div><strong>ভর্তির তারিখ:</strong> ____________</div>
          <div><strong>নির্ধারিত ফি ও হাদিয়া:</strong> ____________</div>
          <div><strong>রসিদ বই নং:</strong> ____________</div>
          <div style="text-align: right; font-weight: bold; color: #004D3A;">মুহতামিম / অধ্যক্ষের স্বাক্ষর ও সিল: _________</div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>অফিসিয়াল ভর্তি আবেদন কপি • ${instNameBn}</span>
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
 * Execute Direct Browser Print for a Madrasah Admission Application
 */
export function printMadrasahAdmissionDirect({
  admission,
  settings,
  branch,
}) {
  const html = generateMadrasahAdmissionFormHTML({
    admission,
    settings,
    branch,
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
