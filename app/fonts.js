// Instant font configuration with zero dev-server remote blocking.
// Browser smoothly loads Google Fonts via preconnected links in layout.jsx,
// completely eliminating the "Request timed out after 3000ms / Retrying 1/3..." freezes.

export const inter = {
  className: "font-sans",
  variable: "font-sans",
  style: { fontFamily: "'Inter', sans-serif" },
};

export const hindSiliguri = {
  className: "font-hind-siliguri",
  variable: "font-hind-siliguri",
  style: { fontFamily: "'Hind Siliguri', sans-serif" },
};

export const notoSansBengali = {
  className: "font-bn",
  variable: "font-bn",
  style: { fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" },
};

export const notoSansArabic = {
  className: "font-ar",
  variable: "font-ar",
  style: { fontFamily: "'Noto Sans Arabic', 'Amiri', 'Scheherazade New', serif" },
};

export const amiri = {
  className: "font-amiri",
  variable: "font-amiri",
  style: { fontFamily: "'Amiri', 'Amiri Quran', serif" },
};

export const playfairDisplay = {
  className: "font-serif",
  variable: "font-serif",
  style: { fontFamily: "'Playfair Display', serif" },
};

export const balooDa2 = {
  className: "font-baloo",
  variable: "font-kids",
  style: { fontFamily: "'Baloo Da 2', 'Hind Siliguri', sans-serif" },
};
