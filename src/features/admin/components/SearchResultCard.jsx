import React from "react";
import { 
  GraduationCap, UserCog, Bell, Building2, 
  CalendarDays, BookOpen, ClipboardList, Trophy, 
  DollarSign, ArrowDownCircle, ArrowRight, CornerDownLeft
} from "lucide-react";

export function getOptimizedAvatarUrl(url) {
  if (!url) return null;
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/image/upload/", "/image/upload/w_80,h_80,c_fill,g_face,q_auto,f_auto/");
  }
  return url;
}

const ENTITY_CONFIGS = {
  student: {
    icon: GraduationCap,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    label: "Student",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    module: "Student Module"
  },
  teacher: {
    icon: UserCog,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
    label: "Teacher",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    module: "Teacher Module"
  },
  notice: {
    icon: Bell,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    label: "Notice",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    module: "News & Notices"
  },
  branch: {
    icon: Building2,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
    label: "Branch",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    module: "Operations"
  },
  event: {
    icon: CalendarDays,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400",
    label: "Event",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    module: "Events Module"
  },
  course: {
    icon: BookOpen,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400",
    label: "Course",
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    module: "Academic Structure"
  },
  admission: {
    icon: ClipboardList,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400",
    label: "Admission",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    module: "Admission Module"
  },
  exam: {
    icon: Trophy,
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
    label: "Exam",
    badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    module: "Examinations"
  },
  fee: {
    icon: DollarSign,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400",
    label: "Fee Collection",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    module: "Finance Module"
  },
  expense: {
    icon: ArrowDownCircle,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
    label: "Expense",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    module: "Finance Module"
  },
  module: {
    icon: BookOpen,
    color: "text-slate-500 bg-slate-50 dark:bg-slate-950/30 dark:text-slate-400",
    label: "Module Navigation",
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
    module: "ERP Navigation"
  }
};

export default function SearchResultCard({ result, isSelected, onClick, query }) {
  const config = ENTITY_CONFIGS[result.entity_type] || ENTITY_CONFIGS.module;
  const Icon = config.icon;
  const optimizedAvatar = getOptimizedAvatarUrl(result.avatar_url);

  // Helper to highlight matching text segments
  const renderTitle = () => {
    if (!query) return result.title;
    
    const titleText = result.title || "";
    const qLower = query.toLowerCase();
    const index = titleText.toLowerCase().indexOf(qLower);

    if (index === -1) return titleText;

    const before = titleText.substring(0, index);
    const match = titleText.substring(index, index + query.length);
    const after = titleText.substring(index + query.length);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-800/80 text-black dark:text-white rounded-[2px] px-0.5 font-semibold">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 select-none group border ${
        isSelected
          ? "bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-950/30 dark:border-emerald-500/30 shadow-sm"
          : "bg-white border-gray-100 hover:bg-slate-50 dark:bg-[#0c1a14] dark:border-emerald-950/40 dark:hover:bg-[#12241d]"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Avatar or Icon */}
        {optimizedAvatar ? (
          <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-emerald-900/50 flex-shrink-0 shadow-inner">
            <img src={optimizedAvatar} loading="lazy" className="h-full w-full object-cover" alt="" />
          </div>
        ) : (
          <div className={`h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0 ${config.color} shadow-sm transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Text Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeColor} uppercase tracking-wider`}>
              {config.label}
            </span>
            {result.branch_name && (
              <span className="text-[10px] text-gray-500 dark:text-emerald-500 bg-gray-50 dark:bg-emerald-950/20 border border-gray-100 dark:border-emerald-950/30 px-1.5 py-0.5 rounded-[4px] font-medium truncate">
                🏢 {result.branch_name}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-emerald-50 truncate leading-snug">
            {renderTitle()}
          </h4>
          <p className="text-xs text-slate-500 dark:text-emerald-400/80 truncate">
            {result.subtitle}
          </p>
        </div>
      </div>

      {/* Right indicator details */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="hidden md:inline-block text-[11px] font-bold text-gray-400 dark:text-emerald-500 bg-gray-100/50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-gray-200/30 dark:border-emerald-950/20">
          {config.module}
        </span>
        {isSelected ? (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
            <span className="text-[10px] bg-emerald-500/20 dark:bg-emerald-500/30 px-1 py-0.5 rounded border border-emerald-500/30">Enter</span>
            <CornerDownLeft className="h-3.5 w-3.5" />
          </div>
        ) : (
          <ArrowRight className="h-4 w-4 text-gray-300 dark:text-emerald-950/60 group-hover:text-emerald-500/60 transition-colors duration-300 group-hover:translate-x-1" />
        )}
      </div>
    </div>
  );
}
