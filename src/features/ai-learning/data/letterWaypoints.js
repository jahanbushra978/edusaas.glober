// Directional Stroke Waypoints for Arabic Letter Tracing
// Defines sequential collision waypoints (1 ➔ 2 ➔ 3) with normalized coordinates (0.0 to 1.0)
// Ensures true stroke order and direction verification according to classical calligraphy

export const LETTER_WAYPOINTS = {
  "ا": [
    { step: 1, x: 0.50, y: 0.20, label: "১" },
    { step: 2, x: 0.50, y: 0.50, label: "২" },
    { step: 3, x: 0.50, y: 0.80, label: "৩" }
  ],
  "ب": [
    { step: 1, x: 0.74, y: 0.44, label: "১" },
    { step: 2, x: 0.65, y: 0.65, label: "২" },
    { step: 3, x: 0.45, y: 0.67, label: "৩" },
    { step: 4, x: 0.28, y: 0.44, label: "৪" },
    { step: 5, x: 0.50, y: 0.82, label: "৫" }
  ],
  "ت": [
    { step: 1, x: 0.74, y: 0.44, label: "১" },
    { step: 2, x: 0.65, y: 0.65, label: "২" },
    { step: 3, x: 0.45, y: 0.67, label: "৩" },
    { step: 4, x: 0.28, y: 0.44, label: "৪" },
    { step: 5, x: 0.45, y: 0.30, label: "৫" },
    { step: 6, x: 0.55, y: 0.30, label: "৬" }
  ],
  "ث": [
    { step: 1, x: 0.74, y: 0.44, label: "১" },
    { step: 2, x: 0.65, y: 0.65, label: "২" },
    { step: 3, x: 0.45, y: 0.67, label: "৩" },
    { step: 4, x: 0.28, y: 0.44, label: "৪" },
    { step: 5, x: 0.44, y: 0.34, label: "৫" },
    { step: 6, x: 0.56, y: 0.34, label: "৬" },
    { step: 7, x: 0.50, y: 0.24, label: "৭" }
  ],
  "ج": [
    { step: 1, x: 0.68, y: 0.30, label: "১" },
    { step: 2, x: 0.38, y: 0.30, label: "২" },
    { step: 3, x: 0.62, y: 0.55, label: "৩" },
    { step: 4, x: 0.40, y: 0.76, label: "৪" },
    { step: 5, x: 0.45, y: 0.54, label: "৫" }
  ],
  "ح": [
    { step: 1, x: 0.68, y: 0.30, label: "১" },
    { step: 2, x: 0.38, y: 0.30, label: "২" },
    { step: 3, x: 0.62, y: 0.55, label: "৩" },
    { step: 4, x: 0.40, y: 0.76, label: "৪" }
  ],
  "خ": [
    { step: 1, x: 0.68, y: 0.30, label: "১" },
    { step: 2, x: 0.38, y: 0.30, label: "২" },
    { step: 3, x: 0.62, y: 0.55, label: "৩" },
    { step: 4, x: 0.40, y: 0.76, label: "৪" },
    { step: 5, x: 0.50, y: 0.18, label: "৫" }
  ],
  "د": [
    { step: 1, x: 0.60, y: 0.36, label: "১" },
    { step: 2, x: 0.48, y: 0.55, label: "২" },
    { step: 3, x: 0.32, y: 0.64, label: "৩" }
  ],
  "ذ": [
    { step: 1, x: 0.60, y: 0.36, label: "১" },
    { step: 2, x: 0.48, y: 0.55, label: "২" },
    { step: 3, x: 0.32, y: 0.64, label: "৩" },
    { step: 4, x: 0.50, y: 0.22, label: "৪" }
  ],
  "ر": [
    { step: 1, x: 0.58, y: 0.40, label: "১" },
    { step: 2, x: 0.50, y: 0.58, label: "২" },
    { step: 3, x: 0.36, y: 0.72, label: "৩" }
  ],
  "ز": [
    { step: 1, x: 0.58, y: 0.40, label: "১" },
    { step: 2, x: 0.50, y: 0.58, label: "২" },
    { step: 3, x: 0.36, y: 0.72, label: "৩" },
    { step: 4, x: 0.54, y: 0.25, label: "৪" }
  ],
  "س": [
    { step: 1, x: 0.72, y: 0.42, label: "১" },
    { step: 2, x: 0.62, y: 0.42, label: "২" },
    { step: 3, x: 0.52, y: 0.42, label: "৩" },
    { step: 4, x: 0.38, y: 0.66, label: "৪" },
    { step: 5, x: 0.28, y: 0.50, label: "৫" }
  ],
  "ش": [
    { step: 1, x: 0.72, y: 0.42, label: "১" },
    { step: 2, x: 0.62, y: 0.42, label: "২" },
    { step: 3, x: 0.52, y: 0.42, label: "৩" },
    { step: 4, x: 0.38, y: 0.66, label: "৪" },
    { step: 5, x: 0.28, y: 0.50, label: "৫" },
    { step: 6, x: 0.60, y: 0.24, label: "৬" }
  ],
  "ص": [
    { step: 1, x: 0.55, y: 0.45, label: "১" },
    { step: 2, x: 0.72, y: 0.40, label: "২" },
    { step: 3, x: 0.48, y: 0.48, label: "৩" },
    { step: 4, x: 0.36, y: 0.68, label: "৪" },
    { step: 5, x: 0.26, y: 0.50, label: "৫" }
  ],
  "ض": [
    { step: 1, x: 0.55, y: 0.45, label: "১" },
    { step: 2, x: 0.72, y: 0.40, label: "২" },
    { step: 3, x: 0.48, y: 0.48, label: "৩" },
    { step: 4, x: 0.36, y: 0.68, label: "৪" },
    { step: 5, x: 0.26, y: 0.50, label: "৫" },
    { step: 6, x: 0.68, y: 0.24, label: "৬" }
  ],
  "ط": [
    { step: 1, x: 0.52, y: 0.22, label: "১" },
    { step: 2, x: 0.52, y: 0.55, label: "২" },
    { step: 3, x: 0.70, y: 0.48, label: "৩" },
    { step: 4, x: 0.38, y: 0.58, label: "৪" }
  ],
  "ظ": [
    { step: 1, x: 0.52, y: 0.22, label: "১" },
    { step: 2, x: 0.52, y: 0.55, label: "২" },
    { step: 3, x: 0.70, y: 0.48, label: "৩" },
    { step: 4, x: 0.38, y: 0.58, label: "৪" },
    { step: 5, x: 0.66, y: 0.30, label: "৫" }
  ],
  "ع": [
    { step: 1, x: 0.62, y: 0.32, label: "১" },
    { step: 2, x: 0.48, y: 0.38, label: "২" },
    { step: 3, x: 0.64, y: 0.58, label: "৩" },
    { step: 4, x: 0.40, y: 0.76, label: "৪" }
  ],
  "غ": [
    { step: 1, x: 0.62, y: 0.32, label: "১" },
    { step: 2, x: 0.48, y: 0.38, label: "২" },
    { step: 3, x: 0.64, y: 0.58, label: "৩" },
    { step: 4, x: 0.40, y: 0.76, label: "৪" },
    { step: 5, x: 0.56, y: 0.18, label: "৫" }
  ],
  "ف": [
    { step: 1, x: 0.68, y: 0.40, label: "১" },
    { step: 2, x: 0.58, y: 0.38, label: "২" },
    { step: 3, x: 0.45, y: 0.58, label: "৩" },
    { step: 4, x: 0.28, y: 0.50, label: "৪" },
    { step: 5, x: 0.64, y: 0.22, label: "৫" }
  ],
  "ق": [
    { step: 1, x: 0.66, y: 0.40, label: "১" },
    { step: 2, x: 0.56, y: 0.40, label: "২" },
    { step: 3, x: 0.42, y: 0.66, label: "৩" },
    { step: 4, x: 0.28, y: 0.50, label: "৪" },
    { step: 5, x: 0.56, y: 0.22, label: "৫" },
    { step: 6, x: 0.66, y: 0.22, label: "৬" }
  ],
  "ك": [
    { step: 1, x: 0.68, y: 0.24, label: "১" },
    { step: 2, x: 0.68, y: 0.62, label: "২" },
    { step: 3, x: 0.32, y: 0.62, label: "৩" },
    { step: 4, x: 0.50, y: 0.44, label: "৪" }
  ],
  "ل": [
    { step: 1, x: 0.64, y: 0.22, label: "১" },
    { step: 2, x: 0.64, y: 0.58, label: "২" },
    { step: 3, x: 0.45, y: 0.72, label: "৩" },
    { step: 4, x: 0.32, y: 0.55, label: "৪" }
  ],
  "م": [
    { step: 1, x: 0.62, y: 0.40, label: "১" },
    { step: 2, x: 0.52, y: 0.40, label: "২" },
    { step: 3, x: 0.42, y: 0.42, label: "৩" },
    { step: 4, x: 0.42, y: 0.74, label: "৪" }
  ],
  "ن": [
    { step: 1, x: 0.70, y: 0.46, label: "১" },
    { step: 2, x: 0.50, y: 0.70, label: "২" },
    { step: 3, x: 0.30, y: 0.46, label: "৩" },
    { step: 4, x: 0.50, y: 0.32, label: "৪" }
  ],
  "و": [
    { step: 1, x: 0.58, y: 0.40, label: "১" },
    { step: 2, x: 0.46, y: 0.42, label: "২" },
    { step: 3, x: 0.48, y: 0.60, label: "৩" },
    { step: 4, x: 0.35, y: 0.74, label: "৪" }
  ],
  "هـ": [
    { step: 1, x: 0.60, y: 0.40, label: "১" },
    { step: 2, x: 0.46, y: 0.48, label: "২" },
    { step: 3, x: 0.54, y: 0.58, label: "৩" },
    { step: 4, x: 0.36, y: 0.58, label: "৪" }
  ],
  "ء": [
    { step: 1, x: 0.58, y: 0.38, label: "১" },
    { step: 2, x: 0.42, y: 0.44, label: "২" },
    { step: 3, x: 0.54, y: 0.56, label: "৩" },
    { step: 4, x: 0.38, y: 0.62, label: "৪" }
  ],
  "ي": [
    { step: 1, x: 0.65, y: 0.40, label: "১" },
    { step: 2, x: 0.54, y: 0.48, label: "২" },
    { step: 3, x: 0.40, y: 0.68, label: "৩" },
    { step: 4, x: 0.28, y: 0.52, label: "৪" },
    { step: 5, x: 0.42, y: 0.82, label: "৫" },
    { step: 6, x: 0.52, y: 0.82, label: "৬" }
  ]
};

export default LETTER_WAYPOINTS;

