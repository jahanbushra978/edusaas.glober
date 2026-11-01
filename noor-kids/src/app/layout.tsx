import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Noor Kids — Learn Quran. Explore. Play. Grow.",
    template: "%s | Noor Kids",
  },
  description:
    "ছোট ছোট আনন্দের শেখায়, আলিফ থেকে এগিয়ে চলো নিজের গতিতে।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
