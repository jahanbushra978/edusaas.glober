import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = { title: "Mosque", description: "Transparent mosque accounts and member contributions" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Applies saved theme/language before first paint to avoid a flash.
const boot = `try{var t=localStorage.getItem("theme"),l=localStorage.getItem("lang"),d=document.documentElement;if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(l==="en"||l==="bn")d.lang=l}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
