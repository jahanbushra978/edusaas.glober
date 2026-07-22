import React from "react";
import { Search } from "lucide-react";
import { useSearch } from "../../site/pages/SearchContext";

export default function GlobalSearchBar() {
  const { setIsOpen } = useSearch();

  // Detect client OS (Mac vs Win/Linux)
  const isMac = typeof window !== "undefined" && 
    (navigator.userAgent.toUpperCase().indexOf("MAC") >= 0 || 
     navigator.platform.toUpperCase().indexOf("MAC") >= 0);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative flex items-center justify-between w-full max-w-md pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full shadow-inner text-gray-400 text-left outline-none cursor-pointer select-none hover:bg-slate-100/50 hover:border-gray-300 dark:bg-emerald-950/20 dark:border-emerald-950/40 dark:hover:bg-emerald-950/30 transition-all duration-200 group"
      title="Search globally (Ctrl + K)"
    >
      <div className="flex items-center gap-2">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        <span className="text-gray-450 dark:text-emerald-500/70 font-medium">Search students, teachers, notices...</span>
      </div>
      <div className="hidden sm:flex items-center gap-0.5 text-[9px] font-bold text-gray-400 dark:text-emerald-500/60 bg-white dark:bg-[#0c1a14] border border-gray-250/20 dark:border-emerald-950/60 px-1.5 py-0.5 rounded shadow-sm">
        <span>{isMac ? "⌘" : "Ctrl"}</span>
        <span>K</span>
      </div>
    </button>
  );
}
