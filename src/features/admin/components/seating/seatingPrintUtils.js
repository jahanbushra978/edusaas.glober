/**
 * Print & Export Utilities for Exam Seating System
 * 
 * Supports:
 * 1. Printable Hall Chart (Notice Board / Exam Hall front)
 * 2. Hall Door Poster (Door banner with serial range and bench pairs)
 * 3. Master Student-wise Seat List
 * 4. Hall-wise Seating Report
 * 5. Individual Desk Slips / Seat Stickers with cutting lines
 */

import { DEFAULT_LOGO } from "@/utils";
import { formatExamSerial } from "./allocationEngine";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function openPrintWindow(htmlContent, title = "Print Document", autoPrint = true) {
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("Popup blocked! Please allow popups for this site to print.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.title = title;
  printWindow.document.close();

  if (!autoPrint) return;

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    triggerPrint();
  } else {
    printWindow.onload = triggerPrint;
  }
}

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: 'Noto Sans Bengali', 'Inter', sans-serif; background: #fff; color: #1e293b; padding: 16px; }
  @page { margin: 10mm; }
  .header { display: flex; align-items: center; justify-content: center; gap: 14px; border-bottom: 2px solid #052E2B; padding-bottom: 10px; margin-bottom: 14px; text-align: center; }
  .logo { width: 60px; height: 60px; object-fit: contain; }
  .inst-title { font-size: 20px; font-weight: 800; color: #052E2B; line-height: 1.2; }
  .inst-sub { font-size: 11px; font-weight: 600; color: #475569; }
  .exam-bar { background: #052E2B; color: #fff; padding: 6px 12px; font-size: 13px; font-weight: 700; text-align: center; border-radius: 4px; margin-bottom: 12px; letter-spacing: 0.5px; }
  .info-pill { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin: 2px 4px; }
  table.styled-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
  table.styled-table th { background: #052E2B; color: #fff; padding: 6px 8px; text-align: center; font-weight: 700; border: 1px solid #052E2B; }
  table.styled-table td { padding: 5px 8px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; }
  table.styled-table tr:nth-child(even) { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .badge-set { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
  .badge-serial { background: #fef3c7; color: #92400e; font-weight: 800; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
    .page-break { page-break-after: always; break-after: page; }
  }
`;

/**
 * 1. Printable Hall Chart (Front of Hall / Notice Board)
 */
export function printHallChart({ exam, branch, settings, allocations, halls, selectedHallId, orientation = "portrait", pageSize = "A4" }) {
  const logoUrl = settings?.logo_url || branch?.logo || branch?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || branch?.name_en || "RAHMANIA INSTITUTE";
  const branchName = branch?.name_en || branch?.name_bn || "";

  const hallsToPrint = selectedHallId && selectedHallId !== "all"
    ? halls.filter(h => h.id === selectedHallId)
    : halls;

  const pagesHtml = hallsToPrint.map((hall, idx) => {
    const hallAllocations = allocations.filter(a => a.hall_id === hall.id);
    const sorted = [...hallAllocations].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      if (a.bench !== b.bench) return a.bench - b.bench;
      return a.seat - b.seat;
    });

    const rowsHtml = sorted.map((item, i) => `
      <tr>
        <td style="font-weight:700;">${i + 1}</td>
        <td><span class="badge badge-serial">${item.exam_serial || "—"}</span></td>
        <td style="text-align:left;font-weight:600;">${item.student_name || "—"}</td>
        <td style="font-weight:700;">${item.roll || "—"}</td>
        <td>${item.class_name || "—"}</td>
        <td><span class="badge badge-set">${item.set || "—"}</span></td>
        <td style="font-weight:700;color:#052E2B;">Row ${item.row}, B-${item.bench}</td>
        <td style="font-weight:800;color:#052E2B;">Seat ${item.seat}</td>
      </tr>
    `).join("");

    return `
      <div class="${idx < hallsToPrint.length - 1 ? 'page-break' : ''}" style="margin-bottom: 24px;">
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'" />
          <div>
            <div class="inst-title">${instNameBn}</div>
            <div class="inst-sub">${instNameEn} ${branchName ? `| ${branchName}` : ''}</div>
          </div>
        </div>

        <div class="exam-bar">
          EXAMINATION SEAT PLAN / পরীক্ষার আসন বিন্যাস — ${exam?.title || "EXAM"}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;">
          <div>
            <span class="info-pill" style="background:#052E2B;color:#fff;border-color:#052E2B;">Hall / Room: <strong>${hall.name} (Room ${hall.room_number})</strong></span>
            <span class="info-pill">Total Students: <strong>${sorted.length}</strong></span>
          </div>
          <div>
            <span class="info-pill">Exam Date: <strong>${exam?.start_date || "—"}</strong></span>
            <span class="info-pill">Time: <strong>${exam?.exam_time || "9:00 AM - 12:00 PM"}</strong></span>
          </div>
        </div>

        <table class="styled-table">
          <thead>
            <tr>
              <th style="width:36px;">SL</th>
              <th style="width:70px;">Exam Serial</th>
              <th style="text-align:left;">Student Name</th>
              <th style="width:60px;">Roll</th>
              <th style="width:90px;">Class</th>
              <th style="width:55px;">Set</th>
              <th style="width:100px;">Bench</th>
              <th style="width:70px;">Seat</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="8" style="padding:20px;color:#94a3b8;">No students allocated to this hall</td></tr>`}
          </tbody>
        </table>

        <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:11px;padding-top:10px;">
          <div style="text-align:center;">
            <div style="width:120px;border-top:1.5px solid #333;margin-bottom:4px;"></div>
            Hall Invigilator / কক্ষ পরিদর্শক
          </div>
          <div style="text-align:center;">
            <div style="width:120px;border-top:1.5px solid #333;margin-bottom:4px;"></div>
            Center Controller / কেন্দ্র নিয়ন্ত্রক
          </div>
        </div>
      </div>
    `;
  }).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hall Seating Chart - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: ${pageSize} ${orientation}; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;
  openPrintWindow(doc, "Hall Chart");
}

export function printVisualHallMap({ exam, branch, settings, allocations = [], halls = [], selectedHallId, rules = {} }) {
  const hall = halls.find(item => String(item.id) === String(selectedHallId));
  if (!hall) {
    alert("প্রিন্ট করার জন্য কোনো হল নির্বাচন করা হয়নি।");
    return;
  }

  const logoUrl = settings?.logo_url || branch?.logo || branch?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || branch?.name_en || "RAHMANIA INSTITUTE";
  const rowsCount = Math.max(1, Number(hall.rows) || 1);
  const benchesPerRow = Math.max(1, Number(hall.tables_per_row) || 1);
  const seatsPerBench = Math.max(1, Number(hall.seats_per_table) || 2);
  let serialCounter = 0;

  for (const previousHall of halls) {
    if (String(previousHall.id) === String(hall.id)) break;
    const prevRows = Math.max(1, Number(previousHall.rows) || 1);
    const prevBenches = Math.max(1, Number(previousHall.tables_per_row) || 1);
    const prevSeats = Math.max(1, Number(previousHall.seats_per_table) || 2);
    for (let row = 1; row <= prevRows; row++) {
      for (let bench = 1; bench <= prevBenches; bench++) {
        const benchKey = `r${row}_b${bench}`;
        if (previousHall.deleted_benches?.includes(benchKey)) continue;
        for (let seat = 1; seat <= prevSeats; seat++) {
          if (!previousHall.deleted_seats?.includes(`${benchKey}_s${seat}`)) serialCounter++;
        }
      }
    }
  }

  const rowsHtml = Array.from({ length: rowsCount }, (_, rowIndex) => {
    const row = rowIndex + 1;
    const benchesHtml = Array.from({ length: benchesPerRow }, (_, benchIndex) => {
      const bench = benchIndex + 1;
      const benchKey = `r${row}_b${bench}`;
      const benchDeleted = hall.deleted_benches?.includes(benchKey);
      const seatsHtml = Array.from({ length: seatsPerBench }, (_, seatIndex) => {
        const seat = seatIndex + 1;
        const deleted = benchDeleted || hall.deleted_seats?.includes(`${benchKey}_s${seat}`);
        if (!deleted) serialCounter++;
        const serial = deleted ? "" : formatExamSerial(serialCounter - 1, rules);
        const allocation = deleted ? null : allocations.find(item =>
          String(item.hall_id) === String(hall.id) &&
          Number(item.row) === row &&
          Number(item.bench) === bench &&
          Number(item.seat) === seat
        );
        return `
          <div class="seat${deleted ? " seat-deleted" : ""}${allocation ? "" : " seat-empty"}">
            ${deleted ? "" : `
              <div class="seat-top">
                <span>Seat ${seat}</span>
                <strong>#${escapeHtml(serial)}</strong>
                ${allocation?.set ? `<span class="set">${escapeHtml(allocation.set)}</span>` : ""}
              </div>
              <div class="student-name">${escapeHtml(allocation?.student_name || "খালি সিট")}</div>
              <div class="student-meta">রোল: ${escapeHtml(allocation?.roll || "—")}<span>${escapeHtml(allocation?.class_name || "")}</span></div>
            `}
          </div>`;
      }).join("");

      return `
        <section class="bench${benchDeleted ? " bench-deleted" : ""}">
          <div class="bench-heading">
            <strong>Bench ${bench}</strong>
            <span>R${row}-B${bench}</span>
          </div>
          <div class="seats">${seatsHtml}</div>
        </section>`;
    }).join("");

    return `<section class="row">
      <div class="row-label">Row ${row}</div>
      <div class="benches">${benchesHtml}</div>
    </section>`;
  }).join("");

  const doc = `<!DOCTYPE html>
  <html lang="bn">
    <head>
      <meta charset="utf-8">
      <title>Hall Map - ${escapeHtml(exam?.title || "Exam")}</title>
      <style>
        ${COMMON_CSS}
        @page { size: A4 landscape; margin: 7mm; }
        body { padding: 0; font-size: 9px; background: #eef2f7; }
        .preview-toolbar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; padding: 10px; margin-bottom: 12px; background: #fff; border-bottom: 1px solid #cbd5e1; box-shadow: 0 2px 8px #0f172a18; }
        .scale-control { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
        .scale-control input { width: min(220px, 35vw); accent-color: #047857; }
        .scale-value { min-width: 42px; text-align: center; color: #052E2B; }
        .print-button { border: 0; border-radius: 5px; padding: 8px 16px; background: #052E2B; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
        .fit-note { color: #475569; font-size: 11px; }
        .preview-page { width: min(283mm, calc(100vw - 24px)); height: auto; aspect-ratio: 283 / 196; margin: 0 auto 20px; overflow: hidden; position: relative; background: white; box-shadow: 0 2px 12px #0f172a22; }
        .map-stage { position: absolute; top: 0; left: 0; transform-origin: top left; width: 283mm; }
        .map-content { width: 283mm; }
        .header { margin-bottom: 6px; padding-bottom: 5px; }
        .logo { width: 38px; height: 38px; }
        .inst-title { font-size: 15px; }
        .inst-sub { font-size: 8px; }
        .exam-bar { padding: 4px 8px; font-size: 10px; margin-bottom: 7px; }
        .front { text-align: center; padding: 5px; margin: 0 auto 8px; max-width: 180mm; color: #fff; background: #052E2B; border-bottom: 2px solid #D4AF37; border-radius: 5px; }
        .front-title { color: #D4AF37; font-size: 7px; letter-spacing: 1px; }
        .front-info { color: #d1fae5; font-size: 8px; margin-top: 2px; }
        .row { display: flex; align-items: stretch; gap: 5px; margin: 0 0 6px; break-inside: avoid; page-break-inside: avoid; }
        .row-label { width: 14mm; flex: 0 0 14mm; display: flex; align-items: center; justify-content: center; background: #052E2B; color: #fff; font-weight: 700; border-radius: 4px; }
        .benches { flex: 1; display: grid; grid-template-columns: repeat(${benchesPerRow}, minmax(0, 1fr)); gap: 5px; }
        .bench { min-width: 0; border: 1px solid #cbd5e1; border-radius: 5px; padding: 4px; break-inside: avoid; page-break-inside: avoid; }
        .bench-deleted { border-style: dashed; border-color: #d1d5db; background: #fff; }
        .bench-heading { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; color: #475569; font-size: 7px; }
        .seats { display: flex; gap: 4px; }
        .seat { flex: 1; min-width: 0; height: 25mm; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
        .seat:not(.seat-empty):not(.seat-deleted) { border-color: #052E2B; }
        .seat-empty { background: #f8fafc; }
        .seat-deleted { border-style: dashed; border-color: #d1d5db; background: #fff; }
        .seat-top { display: flex; justify-content: space-between; align-items: center; gap: 2px; color: #64748b; font-size: 6px; }
        .seat-top strong { color: #052E2B; background: #fef3c7; padding: 1px 3px; font-size: 8px; }
        .set { color: #0369a1; font-weight: 700; font-size: 6px; }
        .student-name { font-size: 8px; font-weight: 700; overflow-wrap: anywhere; }
        .student-meta { display: flex; justify-content: space-between; gap: 3px; border-top: 1px solid #f1f5f9; padding-top: 2px; color: #475569; font-size: 6px; }
        .student-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media print {
          @page { size: A4 landscape; margin: 7mm; }
          body { padding: 0; background: white; }
          .preview-toolbar { display: none !important; }
          .preview-page { width: 283mm; height: 196mm; margin: 0; box-shadow: none; break-after: avoid; page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="preview-toolbar">
        <div class="scale-control">
          <button type="button" id="scale-down" aria-label="ম্যাপ ছোট করুন">−</button>
          <input id="map-scale" type="range" min="50" max="100" step="5" value="100" aria-label="ম্যাপের প্রিন্ট সাইজ">
          <button type="button" id="scale-up" aria-label="ম্যাপ বড় করুন">+</button>
          <span class="scale-value" id="scale-value">100%</span>
        </div>
        <span class="fit-note">এক পাতার A4 Landscape-এ ফিট হবে। বড়/ছোট করতে স্লাইডার সরান।</span>
        <button type="button" class="print-button" id="print-map">PDF সেভ / প্রিন্ট</button>
      </div>
      <div class="preview-page" id="preview-page">
        <div class="map-stage" id="map-stage">
          <div class="map-content" id="map-content">
            <div class="header">
              <img src="${escapeHtml(logoUrl)}" alt="" class="logo" onerror="this.style.display='none'">
              <div>
                <div class="inst-title">${escapeHtml(instNameBn)}</div>
                <div class="inst-sub">${escapeHtml(instNameEn)}${branch?.name_en ? ` | ${escapeHtml(branch.name_en)}` : ""}</div>
              </div>
            </div>
            <div class="exam-bar">EXAMINATION HALL MAP / পরীক্ষার হল ম্যাপ — ${escapeHtml(exam?.title || "EXAM")}</div>
            <div class="front">
              <div class="front-title">FRONT OF EXAMINATION HALL</div>
              <strong>BLACKBOARD / TEACHER'S PODIUM</strong>
              <div class="front-info">${escapeHtml(hall.name)} — Room: ${escapeHtml(hall.room_number || "—")} (Capacity: ${rowsCount * benchesPerRow * seatsPerBench})</div>
            </div>
            ${rowsHtml}
          </div>
        </div>
      </div>
      <script>
        (() => {
          const page = document.getElementById("preview-page");
          const stage = document.getElementById("map-stage");
          const content = document.getElementById("map-content");
          const slider = document.getElementById("map-scale");
          const value = document.getElementById("scale-value");
          const applyScale = () => {
            const pageWidth = page.clientWidth;
            const pageHeight = page.clientHeight;
            const fitScale = Math.min(pageWidth / content.scrollWidth, pageHeight / content.scrollHeight);
            const percent = Number(slider.value);
            const scale = fitScale * percent / 100;
            stage.style.transform = "scale(" + scale + ")";
            stage.style.left = Math.max(0, (pageWidth - content.scrollWidth * scale) / 2) + "px";
            stage.style.top = Math.max(0, (pageHeight - content.scrollHeight * scale) / 2) + "px";
            value.textContent = percent + "%";
          };
          slider.addEventListener("input", applyScale);
          document.getElementById("scale-down").addEventListener("click", () => {
            slider.value = String(Math.max(Number(slider.min), Number(slider.value) - 5));
            applyScale();
          });
          document.getElementById("scale-up").addEventListener("click", () => {
            slider.value = String(Math.min(Number(slider.max), Number(slider.value) + 5));
            applyScale();
          });
          document.getElementById("print-map").addEventListener("click", () => {
            applyScale();
            window.print();
          });
          window.addEventListener("beforeprint", applyScale);
          window.addEventListener("resize", applyScale);
          if (document.fonts?.ready) document.fonts.ready.then(applyScale);
          window.addEventListener("load", applyScale);
          applyScale();
        })();
      </script>
    </body>
  </html>`;
  openPrintWindow(doc, "Hall Map", false);
}

/**
 * 2. Hall Door Poster (Large display poster with serial range and bench pairs)
 */
export function printHallDoorPoster({ exam, branch, settings, allocations, halls, selectedHallId }) {
  const logoUrl = settings?.logo_url || branch?.logo || branch?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
  const branchName = branch?.name_en || branch?.name_bn || "";

  const hallsToPrint = selectedHallId && selectedHallId !== "all"
    ? halls.filter(h => h.id === selectedHallId)
    : halls;

  const pagesHtml = hallsToPrint.map((hall, idx) => {
    const hallAllocations = allocations.filter(a => a.hall_id === hall.id);
    const sorted = [...hallAllocations].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      if (a.bench !== b.bench) return a.bench - b.bench;
      return a.seat - b.seat;
    });

    const serials = sorted.map(s => s.exam_serial).filter(Boolean);
    const minSerial = serials[0] || "—";
    const maxSerial = serials[serials.length - 1] || "—";

    // Group allocations by bench
    const benches = {};
    sorted.forEach(item => {
      const bKey = `R${item.row}-B${item.bench}`;
      if (!benches[bKey]) benches[bKey] = [];
      benches[bKey].push(item);
    });

    const benchCardsHtml = Object.entries(benches).map(([bKey, items]) => {
      const seatsContent = items.map(it => `
        <div style="flex:1;background:#fff;border:1.5px solid #cbd5e1;border-radius:6px;padding:6px;text-align:center;">
          <div style="font-size:15px;font-weight:900;color:#052E2B;">${it.exam_serial}</div>
          <div style="font-size:11px;font-weight:700;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${it.student_name}</div>
          <div style="font-size:9.5px;color:#64748b;">Roll: ${it.roll} | ${it.class_name}</div>
          <div style="font-size:9px;font-weight:800;color:#0284c7;margin-top:2px;">[${it.set || "A"}] Seat ${it.seat}</div>
        </div>
      `).join("");

      return `
        <div style="border:2px solid #052E2B;border-radius:8px;padding:8px;background:#f8fafc;break-inside:avoid;page-break-inside:avoid;">
          <div style="font-size:12px;font-weight:800;color:#052E2B;margin-bottom:6px;display:flex;justify-content:space-between;">
            <span>BENCH ${bKey}</span>
            <span style="font-size:10px;color:#64748b;">${items.length} Student(s)</span>
          </div>
          <div style="display:flex;gap:6px;">
            ${seatsContent}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="${idx < hallsToPrint.length - 1 ? 'page-break' : ''}" style="margin-bottom: 24px;border:3px solid #052E2B;padding:16px;border-radius:12px;">
        <div class="header" style="border-bottom:3px solid #052E2B;">
          <img src="${logoUrl}" alt="Logo" class="logo" style="width:70px;height:70px;" onerror="this.style.display='none'" />
          <div>
            <div style="font-size:24px;font-weight:900;color:#052E2B;">${instNameBn}</div>
            <div style="font-size:13px;font-weight:600;color:#475569;">${branchName}</div>
            <div style="font-size:15px;font-weight:800;color:#D4AF37;margin-top:2px;">${exam?.title || "EXAMINATION"}</div>
          </div>
        </div>

        <!-- BIG POSTER HEADER -->
        <div style="background:linear-gradient(135deg, #052E2B, #021a18);color:#fff;padding:16px;text-align:center;border-radius:10px;margin-bottom:16px;">
          <div style="font-size:32px;font-weight:900;letter-spacing:1px;line-height:1.1;">EXAMINATION HALL</div>
          <div style="font-size:26px;font-weight:800;color:#fcd34d;margin-top:4px;">${hall.name} (ROOM ${hall.room_number})</div>
          <div style="font-size:18px;font-weight:700;margin-top:8px;background:rgba(255,255,255,0.15);display:inline-block;padding:4px 20px;border-radius:30px;">
            SERIAL: ${minSerial} — ${maxSerial} (${sorted.length} STUDENTS)
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;">
          ${benchCardsHtml}
        </div>
      </div>
    `;
  }).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hall Door Poster - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 portrait; margin: 8mm; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;
  openPrintWindow(doc, "Door Poster");
}

/**
 * 3. Master Student-wise Seat List
 */
export function printStudentSeatList({ exam, branch, settings, allocations, orientation = "portrait" }) {
  const logoUrl = settings?.logo_url || branch?.logo || branch?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameEn = settings?.institute_name_en || branch?.name_en || "RAHMANIA INSTITUTE";

  const sorted = [...allocations].sort((a, b) => {
    return String(a.exam_serial).localeCompare(String(b.exam_serial), undefined, { numeric: true });
  });

  const rowsHtml = sorted.map((item, idx) => `
    <tr>
      <td style="font-weight:700;">${idx + 1}</td>
      <td><span class="badge badge-serial">${item.exam_serial || "—"}</span></td>
      <td style="text-align:left;font-weight:600;">${item.student_name || "—"}</td>
      <td style="font-weight:700;">${item.roll || "—"}</td>
      <td>${item.class_name || "—"}</td>
      <td><span class="badge badge-set">${item.set || "—"}</span></td>
      <td style="font-weight:700;color:#052E2B;">${item.hall_name} (Rm ${item.room_number})</td>
      <td style="font-weight:700;">R${item.row}, B-${item.bench}</td>
      <td style="font-weight:800;color:#052E2B;">Seat ${item.seat}</td>
    </tr>
  `).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Master Student Seat List - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 ${orientation}; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'" />
          <div>
            <div class="inst-title">${instNameBn}</div>
            <div class="inst-sub">${instNameEn}</div>
          </div>
        </div>

        <div class="exam-bar">
          MASTER STUDENT SEAT ALLOCATION LIST — ${exam?.title || "EXAM"}
        </div>

        <div style="margin-bottom:10px;font-size:12px;">
          <span class="info-pill">Total Allocated: <strong>${sorted.length} Students</strong></span>
          <span class="info-pill">Exam Date: <strong>${exam?.start_date || "—"}</strong></span>
        </div>

        <table class="styled-table">
          <thead>
            <tr>
              <th style="width:36px;">SL</th>
              <th style="width:70px;">Exam Serial</th>
              <th style="text-align:left;">Student Name</th>
              <th style="width:60px;">Roll</th>
              <th style="width:90px;">Class</th>
              <th style="width:50px;">Set</th>
              <th>Hall / Room</th>
              <th style="width:80px;">Bench</th>
              <th style="width:60px;">Seat</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="9" style="padding:20px;color:#94a3b8;">No allocations available</td></tr>`}
          </tbody>
        </table>
      </body>
    </html>
  `;
  openPrintWindow(doc, "Master Seat List");
}

/**
 * 4. Hall-wise Summary Report
 */
export function printHallWiseReport({ exam, branch, settings, allocations, halls }) {
  const logoUrl = settings?.logo_url || branch?.logo || branch?.logo_url || DEFAULT_LOGO;
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";

  const hallsSummaryHtml = halls.map(hall => {
    const hallAllocs = allocations.filter(a => a.hall_id === hall.id);
    const capacity = Number(hall.rows || 1) * Number(hall.tables_per_row || 1) * Number(hall.seats_per_table || 2);
    const emptyCount = Math.max(0, capacity - hallAllocs.length);

    // Class breakdown in this hall
    const classCounts = {};
    hallAllocs.forEach(a => {
      const c = a.class_name || "Unknown";
      classCounts[c] = (classCounts[c] || 0) + 1;
    });

    const classPills = Object.entries(classCounts).map(([c, count]) => `
      <span class="info-pill">${c}: <strong>${count}</strong></span>
    `).join("");

    return `
      <div style="border:1.5px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:16px;background:#f8fafc;break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #052E2B;padding-bottom:6px;margin-bottom:8px;">
          <div>
            <span style="font-size:16px;font-weight:900;color:#052E2B;">${hall.name}</span>
            <span style="font-size:13px;font-weight:600;color:#64748b;margin-left:6px;">(Room ${hall.room_number})</span>
          </div>
          <div>
            <span class="info-pill" style="background:#052E2B;color:#fff;">Assigned: ${hallAllocs.length} / ${capacity}</span>
            <span class="info-pill">Empty Seats: ${emptyCount}</span>
          </div>
        </div>
        <div style="margin-bottom:6px;">
          <span style="font-size:11px;font-weight:700;color:#475569;">Class Distribution:</span> ${classPills || '<span style="font-size:11px;color:#94a3b8;">None</span>'}
        </div>
      </div>
    `;
  }).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hall-Wise Seating Summary - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 portrait; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'" />
          <div>
            <div class="inst-title">${instNameBn}</div>
            <div class="inst-sub">HALL-WISE SEATING AUDIT & SUMMARY REPORT</div>
          </div>
        </div>
        <div class="exam-bar">${exam?.title || "EXAMINATION"}</div>
        <div style="margin-top:16px;">
          ${hallsSummaryHtml}
        </div>
      </body>
    </html>
  `;
  openPrintWindow(doc, "Hall Summary");
}

/**
 * 5. Individual Student Desk Slips (Cutout Stickers for Benches)
 */
export function printIndividualDeskSlips({ exam, branch, settings, allocations }) {
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";

  const sorted = [...allocations].sort((a, b) => {
    if (a.hall_id !== b.hall_id) return String(a.hall_id).localeCompare(String(b.hall_id));
    if (a.row !== b.row) return a.row - b.row;
    if (a.bench !== b.bench) return a.bench - b.bench;
    return a.seat - b.seat;
  });

  const slipsHtml = sorted.map(item => `
    <div style="
      border: 1.5px dashed #052E2B;
      border-radius: 6px;
      padding: 8px 10px;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      height: 120px;
      box-sizing: border-box;
      position: relative;
    ">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e2e8f0;padding-bottom:3px;">
        <div style="font-size:10px;font-weight:800;color:#052E2B;">${instNameBn}</div>
        <div style="font-size:9px;font-weight:800;background:#052E2B;color:#fff;padding:1px 5px;border-radius:3px;">${item.set || "A"}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin:4px 0;">
        <div>
          <div style="font-size:8px;color:#64748b;text-transform:uppercase;">Student Name</div>
          <div style="font-size:12px;font-weight:800;color:#1e293b;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.student_name}</div>
          <div style="font-size:9.5px;color:#475569;font-weight:600;">Roll: <strong>${item.roll}</strong> | ${item.class_name}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:8px;color:#64748b;text-transform:uppercase;">Serial</div>
          <div style="font-size:16px;font-weight:900;color:#052E2B;">${item.exam_serial}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;background:#f1f5f9;padding:3px 6px;border-radius:4px;font-size:9.5px;font-weight:700;color:#052E2B;">
        <span>${item.hall_name} (Rm ${item.room_number})</span>
        <span>Row ${item.row} | Bench ${item.bench} | Seat ${item.seat}</span>
      </div>
    </div>
  `).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Desk Slips - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 portrait; margin: 8mm; }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
        </style>
      </head>
      <body>
        <div class="grid-container">
          ${slipsHtml}
        </div>
      </body>
    </html>
  `;
  openPrintWindow(doc, "Desk Slips");
}

/**
 * 6. Bench-Wise Slips for Physical Pasting on Wooden Benches (বেঞ্চে লাগানোর কাগজের স্লিপ)
 * Prints cut-out cards for every bench, with Row, Bench, Hall, Room, and each seat's
 * Serial Number (#001, #002), Student Roll, Name, Class, and Set (Set A, Set B).
 * Staff can cut along the dashed lines with scissors and paste on the physical wooden benches.
 */
export function printBenchWiseSlips({
  exam,
  branch,
  settings,
  allocations = [],
  halls = [],
  selectedHallId,
}) {
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";

  const hallsToPrint = selectedHallId && selectedHallId !== "all"
    ? halls.filter(h => h.id === selectedHallId)
    : halls;

  // Build slips for every bench in each hall
  const benchSlips = [];

  // Track global active seat counter across all printed halls (skipping deleted benches and seats)
  let globalActiveSeatCounter = 0;
  if (selectedHallId && selectedHallId !== "all") {
    for (const h of halls) {
      if (h.id === selectedHallId) break;
      const rCount = Math.max(1, Number(h.rows) || 1);
      const tCount = Math.max(1, Number(h.tables_per_row) || 1);
      const sCount = Math.max(1, Number(h.seats_per_table) || 2);
      for (let r = 1; r <= rCount; r++) {
        for (let b = 1; b <= tCount; b++) {
          const bKey = `r${r}_b${b}`;
          if (Array.isArray(h.deleted_benches) && h.deleted_benches.includes(bKey)) continue;
          for (let s = 1; s <= sCount; s++) {
            const sKey = `r${r}_b${b}_s${s}`;
            if (Array.isArray(h.deleted_seats) && h.deleted_seats.includes(sKey)) continue;
            globalActiveSeatCounter++;
          }
        }
      }
    }
  }

  hallsToPrint.forEach(hall => {
    const rowsCount = Math.max(1, Number(hall.rows) || 1);
    const tablesPerRow = Math.max(1, Number(hall.tables_per_row) || 1);
    const seatsPerTable = Math.max(1, Number(hall.seats_per_table) || 2);

    // Track active bench counter across the hall
    let activeBenchCounter = 0;

    for (let r = 1; r <= rowsCount; r++) {
      for (let b = 1; b <= tablesPerRow; b++) {
        const benchKey = `r${r}_b${b}`;
        const isBenchDeleted = Array.isArray(hall.deleted_benches) && hall.deleted_benches.includes(benchKey);
        
        let currentActiveBenchNum = null;
        if (!isBenchDeleted) {
          activeBenchCounter++;
          currentActiveBenchNum = activeBenchCounter;
        }

        const seats = [];

        for (let s = 1; s <= seatsPerTable; s++) {
          const seatKey = `r${r}_b${b}_s${s}`;
          const isSeatDeleted = isBenchDeleted || (Array.isArray(hall.deleted_seats) && hall.deleted_seats.includes(seatKey));

          if (isSeatDeleted) {
            // Cancelled seat/bench: Box stays for cutting lines, but completely white & blank inside!
            seats.push({
              seatNumber: s,
              exam_serial: "",
              student_name: "",
              roll: "",
              class_name: "",
              set: "",
              isEmpty: true,
              isDeleted: true,
            });
          } else {
            globalActiveSeatCounter++;
            const activeSerialFormatted = `#${String(globalActiveSeatCounter).padStart(3, "0")}`;

            const alloc = allocations.find(
              a => a.hall_id === hall.id && a.row === r && a.bench === b && a.seat === s
            );

            if (alloc) {
              seats.push({
                seatNumber: s,
                exam_serial: alloc.exam_serial || activeSerialFormatted,
                student_name: alloc.student_name || "—",
                roll: alloc.roll || "—",
                class_name: alloc.class_name || "—",
                set: alloc.set || ((r + b + s) % 2 === 0 ? "Set B" : "Set A"),
                isEmpty: false,
                isDeleted: false,
              });
            } else {
              // Unallocated active seat
              const fallbackSet = (r + b + s) % 2 === 0 ? "Set B" : "Set A";
              seats.push({
                seatNumber: s,
                exam_serial: activeSerialFormatted,
                student_name: "ফাঁকা (খালি)",
                roll: "—",
                class_name: "—",
                set: fallbackSet,
                isEmpty: true,
                isDeleted: false,
              });
            }
          }
        }

        benchSlips.push({
          hall,
          row: r,
          bench: b,
          activeBenchNum: currentActiveBenchNum,
          seats,
          isBenchDeleted,
        });
      }
    }
  });

  const slipsHtml = benchSlips.map(benchItem => {
    if (benchItem.isBenchDeleted) {
      // Entire cancelled bench: Box outline remains for cutting lines, but inside is completely blank & white
      const blankSeatsHtml = benchItem.seats.map(() => `
        <div style="
          flex: 1;
          border: 1.5px dashed #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          min-height: 74px;
        "></div>
      `).join("");

      return `
        <div style="
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 8px 10px;
          background: #ffffff;
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 10px;
          box-sizing: border-box;
        ">
          <div style="display: flex; gap: 8px;">
            ${blankSeatsHtml}
          </div>
        </div>
      `;
    }

    const seatsHtml = benchItem.seats.map(seat => {
      if (seat.isDeleted) {
        // Cancelled seat: Box outline remains for physical spacing, but inside is completely blank & white!
        return `
          <div style="
            flex: 1;
            border: 1.5px dashed #cbd5e1;
            border-radius: 6px;
            background: #ffffff;
            min-height: 74px;
          "></div>
        `;
      }

      return `
        <div style="
          flex: 1;
          border: 1.5px solid ${seat.isEmpty ? '#cbd5e1' : '#052E2B'};
          border-radius: 6px;
          padding: 6px 10px;
          background: ${seat.isEmpty ? '#f8fafc' : '#ffffff'};
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #475569; background: #e2e8f0; padding: 1px 6px; border-radius: 3px;">
              Seat ${seat.seatNumber}
            </span>
            <!-- Middle: Big Seat Serial Number -->
            <span style="font-size: 14px; font-weight: 900; color: #052E2B; background: #fef3c7; border: 1px solid #fde68a; padding: 1px 8px; border-radius: 4px; letter-spacing: 0.5px;">
              ${seat.exam_serial}
            </span>
            <!-- Top-right: Question Set -->
            <span style="font-size: 9.5px; font-weight: 800; color: #0369a1; background: #e0f2fe; border: 1px solid #bae6fd; padding: 1px 6px; border-radius: 3px;">
              ${seat.set}
            </span>
          </div>

          <div style="margin: 2px 0;">
            <div style="font-size: 13px; font-weight: 800; color: ${seat.isEmpty ? '#94a3b8' : '#0f172a'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${seat.student_name}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: ${seat.isEmpty ? '#94a3b8' : '#334155'}; margin-top: 3px; border-top: 1px dashed #f1f5f9; padding-top: 2px;">
              <span>রোল: <strong>${seat.roll}</strong></span>
              <span style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${seat.class_name}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div style="
        border: 2px dashed #052E2B;
        border-radius: 8px;
        padding: 8px 10px;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 10px;
        box-sizing: border-box;
      ">
        <!-- Bench Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #052E2B;
          color: #ffffff;
          padding: 5px 10px;
          border-radius: 5px;
          margin-bottom: 6px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">${instNameBn}</span>
            <span style="font-size: 9.5px; color: #a7f3d0; font-weight: 600;">• ${exam?.title || "পরীক্ষা"}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; font-weight: 600; color: #e2e8f0;">
              ${benchItem.hall.name} ${benchItem.hall.room_number ? `(Rm ${benchItem.hall.room_number})` : ''}
            </span>
            <span style="
              font-size: 11px;
              font-weight: 900;
              background: #D4AF37;
              color: #052E2B;
              padding: 1px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              Row ${benchItem.row} — Bench ${benchItem.bench} (R${benchItem.row}-B${benchItem.bench})
            </span>
          </div>
        </div>

        <!-- Seats Row (Matching Physical Wooden Bench) -->
        <div style="display: flex; gap: 8px;">
          ${seatsHtml}
        </div>

        <!-- Cutting Guide Hint -->
        <div style="text-align: center; font-size: 8.5px; color: #94a3b8; margin-top: 5px; letter-spacing: 2px;">
          ✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂
        </div>
      </div>
    `;
  }).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>বেঞ্চের স্লিপ (Bench Pasting Slips) - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 portrait; margin: 6mm 8mm; }
          body { padding: 4px 6px; }
        </style>
      </head>
      <body>
        <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1.5px solid #052E2B; padding: 8px 14px; border-radius: 6px; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 800; color: #052E2B;">
            📋 পরীক্ষার বেঞ্চে লাগানোর সিরিয়াল স্লিপ (Bench Cutout Slips) — মোট বেঞ্চ: ${benchSlips.length} টি
          </span>
          <button onclick="window.print()" style="background: #052E2B; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 800; font-size: 12px; cursor: pointer;">
            🖨️ প্রিন্ট করুন
          </button>
        </div>
        <div>
          ${slipsHtml}
        </div>
      </body>
    </html>
  `;
  openPrintWindow(doc, "Bench Slips");
}

/**
 * 7. Bench Number Stickers / Labels for Physical Wooden Benches (বেঞ্চ নম্বর স্টিকার)
 * Prints compact, bold stickers specifically for pasting Bench Numbers (Bench 1, Bench 2, Bench 3...)
 * on each physical bench with Hall, Room, Row, and Seat Serial Range.
 */
export function printBenchSerialStickers({
  exam,
  branch,
  settings,
  allocations = [],
  halls = [],
  selectedHallId,
}) {
  const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";

  const hallsToPrint = selectedHallId && selectedHallId !== "all"
    ? halls.filter(h => h.id === selectedHallId)
    : halls;

  const stickers = [];

  hallsToPrint.forEach(hall => {
    const rowsCount = Math.max(1, Number(hall.rows) || 1);
    const tablesPerRow = Math.max(1, Number(hall.tables_per_row) || 1);
    const seatsPerTable = Math.max(1, Number(hall.seats_per_table) || 2);

    let hallOffset = 0;
    for (const h of halls) {
      if (h.id === hall.id) break;
      const r = Math.max(1, Number(h.rows) || 1);
      const t = Math.max(1, Number(h.tables_per_row) || 1);
      const s = Math.max(1, Number(h.seats_per_table) || 2);
      hallOffset += (r * t * s);
    }

    let activeBenchCounter = 0;
    for (let r = 1; r <= rowsCount; r++) {
      for (let b = 1; b <= tablesPerRow; b++) {
        const benchKey = `r${r}_b${b}`;
        const isBenchDeleted = Array.isArray(hall.deleted_benches) && hall.deleted_benches.includes(benchKey);
        
        let currentActiveBenchNum = null;
        if (!isBenchDeleted) {
          activeBenchCounter++;
          currentActiveBenchNum = activeBenchCounter;
        }

        // Collect seated students on this bench
        const benchAllocs = allocations.filter(
          a => a.hall_id === hall.id && a.row === r && a.bench === b
        ).sort((a, b) => a.seat - b.seat);

        // Calculate serial range
        const startIdx = hallOffset + ((r - 1) * tablesPerRow * seatsPerTable) + ((b - 1) * seatsPerTable) + 1;
        const endIdx = startIdx + seatsPerTable - 1;
        const serialRange = benchAllocs.length > 0
          ? benchAllocs.map(a => a.exam_serial).join(" • ")
          : `#${String(startIdx).padStart(3, "0")} - #${String(endIdx).padStart(3, "0")}`;

        const rollsSummary = isBenchDeleted
          ? ""
          : benchAllocs.length > 0
          ? benchAllocs.map(a => `রোল: ${a.roll}`).join(" | ")
          : "খালি বেঞ্চ";

        stickers.push({
          hall,
          row: r,
          bench: b,
          activeBenchNum: currentActiveBenchNum,
          serialRange,
          rollsSummary,
          occupiedCount: benchAllocs.length,
          seatsCount: seatsPerTable,
          isBenchDeleted,
        });
      }
    }
  });

  const stickersHtml = stickers.map(item => {
    if (item.isBenchDeleted) {
      return `
        <div style="
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 8px 12px;
          background: #ffffff;
          page-break-inside: avoid;
          break-inside: avoid;
          height: 125px;
          box-sizing: border-box;
        "></div>
      `;
    }

    return `
    <div style="
      border: 2px dashed #052E2B;
      border-radius: 8px;
      padding: 8px 12px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 125px;
      box-sizing: border-box;
      position: relative;
    ">
      <!-- Top header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #052E2B; padding-bottom: 3px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #052E2B;">${instNameBn}</span>
          ${exam?.title ? `<span style="font-size: 9px; color: #047857; font-weight: 700;">• ${exam.title}</span>` : ''}
        </div>
        <span style="font-size: 9.5px; font-weight: 700; color: #475569;">${item.hall.name} ${item.hall.room_number ? `(Rm ${item.hall.room_number})` : ''}</span>
      </div>

      <!-- Large Bench Number Badge (Bench 1, Bench 2...) -->
      <div style="text-align: center; margin: 3px 0;">
        <div style="
          display: inline-block;
          background: #052E2B;
          color: #D4AF37;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.5px;
          padding: 2px 18px;
          border-radius: 6px;
          border: 1px solid #D4AF37;
        ">
          BENCH ${item.activeBenchNum || item.bench} <span style="font-size: 13px; font-weight: 700; color: #ffffff;">(বেঞ্চ ${item.activeBenchNum || item.bench})</span>
        </div>
        <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          Row ${item.row} (রো ${item.row})
        </div>
      </div>

      <!-- Seat range and metadata -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 5px; padding: 3px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
        <span style="font-weight: 900; color: #052E2B; background: #fef3c7; padding: 1px 6px; border-radius: 3px;">
          সিট: ${item.serialRange}
        </span>
        <span style="font-weight: 700; color: #334155;">
          ${item.rollsSummary}
        </span>
      </div>

      <!-- Cut line -->
      <div style="text-align: center; font-size: 8px; color: #94a3b8; letter-spacing: 2px;">
        ✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂
      </div>
    </div>
    `;
  }).join("");

  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>বেঞ্চ নম্বর স্টিকার (Bench Labels) - ${exam?.title || "Exam"}</title>
        <style>
          ${COMMON_CSS}
          @page { size: A4 portrait; margin: 6mm 8mm; }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1.5px solid #052E2B; padding: 8px 14px; border-radius: 6px; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 800; color: #052E2B;">
            🏷️ কাঠের বেঞ্চে লাগানোর বেঞ্চ নম্বর স্টিকার (Bench Labels) — মোট: ${stickers.length} টি
          </span>
          <button onclick="window.print()" style="background: #052E2B; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 800; font-size: 12px; cursor: pointer;">
            🖨️ প্রিন্ট করুন
          </button>
        </div>
        <div class="grid-container">
          ${stickersHtml}
        </div>
      </body>
    </html>
  `;
  openPrintWindow(doc, "Bench Labels");
}
