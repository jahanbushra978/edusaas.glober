export function containsBengali(text) {
  return /[\u0980-\u09FF]/.test(text);
}

export function renderBengaliText(text, fontSize, color = "#1e293b", isBold = false) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 4;
  const fontSpec = `${isBold ? "bold" : "normal"} ${fontSize * scale}px "Noto Sans Bengali", "Siyam Rupali", "Nikosh", sans-serif`;
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
}

export function drawBengaliText(doc, text, x, y, fontSize, color = "#1e293b", align = "left") {
  const str = String(text || "");
  if (!str || !containsBengali(str)) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...hexToRgb(color));
    doc.text(str, x, y, { align });
    return;
  }
  const result = renderBengaliText(str, fontSize, color);
  if (result) {
    let drawX = x;
    if (align === "center") drawX = x - result.width / 2;
    else if (align === "right") drawX = x - result.width;
    doc.addImage(result.dataUrl, "PNG", drawX, y - result.height * 0.72, result.width, result.height);
  }
}

export function drawBengaliTextWrapped(doc, text, maxWidth, fontSize, color = "#1e293b", align = "center") {
  doc.setFontSize(fontSize);
  const words = text.split(/(?<=\u200B)|\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (containsBengali(line + w)) {
      const testStr = line ? `${line} ${w}` : w;
      const rend = renderBengaliText(testStr, fontSize, color);
      const ww = rend ? rend.width : 0;
      if (line && ww > maxWidth) {
        lines.push(line);
        line = w;
      } else {
        line = testStr;
      }
    } else {
      const test = line ? `${line} ${w}` : w;
      if (doc.getTextWidth(test) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
