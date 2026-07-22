import React from "react";
import { Card } from "@/components/ui/card";

export default function StatsCard({ icon: Icon, label, value, color = "text-[#052E2B]", bgColor = "bg-[#052E2B]/5" }) {
  return (
    <Card className="p-6 border border-gray-100 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37]/15 to-transparent -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500" />
      <div className="flex items-center gap-4 relative">
        <div className={`p-4 rounded-[16px] ${bgColor} border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors duration-300`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#052E2B] mt-1">{value}</p>
        </div>
      </div>
    </Card>
  );
}