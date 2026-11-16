'use client'

import dynamic from "next/dynamic";

const QuranStudioPage = dynamic(() => import("@/features/site/pages/QuranStudioPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F4F9F5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
    </div>
  ),
});

export default function StudioClient() {
  return <QuranStudioPage />;
}
