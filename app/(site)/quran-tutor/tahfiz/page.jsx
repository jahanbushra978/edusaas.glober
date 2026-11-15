import React from "react";
import TahfizQuranApp from "@/features/quran/components/TahfizQuranApp";

export const metadata = {
  title: "আল-কুরআনুল কারীম — ১৫-লাইন হিফজী মুসহাফ | নূর",
  description: "আল-কুরআনুল কারীমের ১৫-লাইন হিফজী মুসহাফ, আয়াত অনুসন্ধান, বুকমার্ক ও তিলাওয়াত সুবিধা।",
};

export default function TahfizQuranPage() {
  return (
    <div className="min-h-screen bg-[#041412]">
      <TahfizQuranApp />
    </div>
  );
}
