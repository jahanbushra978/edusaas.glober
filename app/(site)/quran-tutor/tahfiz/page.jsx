import React from "react";
import TahfizQuranApp from "@/features/quran/components/TahfizQuranApp";

export const metadata = {
  title: "নূর কুরআন শরীফ — সহজে ও স্পষ্ট পবিত্র কুরআন | Edusaas",
  description: "মোবাইল-ফার্স্ট ১৫ লাইনের পূর্ণাঙ্গ হাফেজী কুরআন মুসহাফ, ডিজিটাল তাসবীহ ও তাজবীদ লার্নিং প্ল্যাটফর্ম।",
};

export default function TahfizQuranPage() {
  return (
    <div className="min-h-screen bg-[#041412]">
      <TahfizQuranApp />
    </div>
  );
}
