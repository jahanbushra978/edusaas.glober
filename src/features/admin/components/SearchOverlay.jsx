import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "../../site/pages/SearchContext";
import SearchResultCard from "./SearchResultCard";
import { 
  Search, Loader2, Sparkles, History, 
  Trash2, X, Command, Keyboard, ArrowDownUp,
  CornerDownLeft
} from "lucide-react";

const ERP_MODULES = [
  {
    id: "mod-students",
    entity_type: "module",
    title: "Students Directory",
    subtitle: "Manage student profiles, rolls, batches and databases",
    route: "/admin?tab=students",
    keywords: "students list profiles database registration directory"
  },
  {
    id: "mod-teachers",
    entity_type: "module",
    title: "Teachers Management",
    subtitle: "Manage teachers, subjects, contacts and hadiya profiles",
    route: "/admin?tab=teachers",
    keywords: "teachers staff list hadiya salary profiles directory"
  },
  {
    id: "mod-fees",
    entity_type: "module",
    title: "Fees & Finance",
    subtitle: "Collect student fees, manage invoices and due records",
    route: "/admin?tab=fees",
    keywords: "fees collection finance invoice invoice pay expenses due"
  },
  {
    id: "mod-notices",
    entity_type: "module",
    title: "News & Notices",
    subtitle: "Create, edit and publish notice board announcements",
    route: "/admin?tab=notices",
    keywords: "news notices announcements notices manager push notice"
  },
  {
    id: "mod-attendance",
    entity_type: "module",
    title: "Student Attendance",
    subtitle: "Record and inspect daily class attendance",
    route: "/admin?tab=student-attendance",
    keywords: "student attendance check present absent daily logs"
  },
  {
    id: "mod-settings",
    entity_type: "module",
    title: "System Settings",
    subtitle: "Configure general school metadata and system params",
    route: "/admin?tab=settings",
    keywords: "settings branding config options setup metadata profile"
  }
];

export default function SearchOverlay() {
  const router = useRouter();
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    isLoading,
    category,
    setCategory,
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  } = useSearch();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const overlayRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle outside clicks to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, setIsOpen]);

  // Determine active item list
  const getActiveItems = () => {
    if (query.trim() === "") {
      // Filter modules if category matches
      if (category === "module" || category === "all") {
        return ERP_MODULES;
      }
      return [];
    }
    return results;
  };

  const activeItems = getActiveItems();

  // Reset selected index when active items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, category, results]);

  // Keyboard navigation logic
  const handleKeyDown = (e) => {
    if (!activeItems || activeItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % activeItems.length);
      scrollIntoView((selectedIndex + 1) % activeItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
      scrollIntoView((selectedIndex - 1 + activeItems.length) % activeItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectResult(activeItems[selectedIndex]);
    }
  };

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    const item = items[index];
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  };

  const handleSelectResult = (item) => {
    addRecentSearch(item);
    setIsOpen(false);

    // Trigger tab routing check or navigation
    if (item.route.startsWith("/admin?tab=")) {
      const tab = item.route.split("tab=")[1];
      sessionStorage.setItem("admin_active_tab", tab);
      window.dispatchEvent(new Event("admin_tab_changed"));
      router.push("/admin");
    } else {
      router.push(item.route);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-12 md:pt-24 transition-opacity duration-300">
      {/* Modal Dialog */}
      <div
        ref={overlayRef}
        className="w-full max-w-2xl bg-white dark:bg-[#08120d] border border-gray-150 dark:border-emerald-950/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-in-down"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search Palette"
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-emerald-950/40 px-4.5 py-4">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, teachers, notices, modules..."
            className="flex-1 text-sm bg-transparent outline-none border-none text-slate-800 dark:text-slate-100 placeholder-gray-400 font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-emerald-400 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-emerald-950/40 px-2 py-1 rounded border border-gray-250/20">
            <span className="text-xs">Esc</span>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-50 dark:border-emerald-950/20 px-4 py-2.5 bg-slate-50/50 dark:bg-emerald-950/10 overflow-x-auto select-none [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all", label: "All Results" },
            { id: "student", label: "Students" },
            { id: "teacher", label: "Teachers" },
            { id: "notice", label: "Notices" },
            { id: "module", label: "Dashboard Tabs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 shrink-0 select-none ${
                category === tab.id
                  ? "bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50 shadow-sm"
                  : "text-gray-500 hover:text-slate-800 hover:bg-gray-100 dark:text-emerald-400/70 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#fdfdfd] dark:bg-[#070d0a] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-950/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Searching database index...</span>
            </div>
          ) : query.trim() === "" ? (
            // Empty Query - show recent searches & categories
            <div className="p-4 space-y-5">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-emerald-600 uppercase tracking-wider">
                      <History className="h-3 w-3" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400/80 hover:text-red-700 dark:hover:text-red-300 font-bold transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Clear All
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {recentSearches.map((item, idx) => (
                      <SearchResultCard
                        key={`recent-${item.id}-${idx}`}
                        result={item}
                        isSelected={false}
                        onClick={() => handleSelectResult(item)}
                        query=""
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Quick ERP Modules */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-gray-400 dark:text-emerald-600 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Quick Navigation Modules
                </span>
                <div ref={listRef} className="grid gap-2">
                  {ERP_MODULES.filter(m => category === "all" || category === "module").map((item, idx) => (
                    <SearchResultCard
                      key={`module-${item.id}`}
                      result={item}
                      isSelected={selectedIndex === idx}
                      onClick={() => handleSelectResult(item)}
                      query=""
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : activeItems.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Command className="h-10 w-10 text-gray-300 dark:text-emerald-950/80 mb-3.5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-emerald-50 mb-1">No search results found</h3>
              <p className="text-xs text-gray-400 dark:text-emerald-600 max-w-sm px-6">
                We couldn't find anything matching "{query}" in the active database search index. Check spelling or filter category.
              </p>
            </div>
          ) : (
            // Results list
            <div ref={listRef} className="p-3.5 space-y-2 select-none">
              {activeItems.map((item, idx) => (
                <SearchResultCard
                  key={`result-${item.id}-${idx}`}
                  result={item}
                  isSelected={selectedIndex === idx}
                  onClick={() => handleSelectResult(item)}
                  query={query}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="bg-slate-50/70 dark:bg-emerald-950/10 border-t border-gray-100 dark:border-emerald-950/20 px-4 py-3 flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-emerald-600 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Keyboard className="h-3.5 w-3.5" /> Shortcuts:
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <ArrowDownUp className="h-3 w-3" /> Move
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <CornerDownLeft className="h-3 w-3" /> Select
            </span>
          </div>
          <span className="tracking-wide">ENTERPRISE GLOBAL SEARCH</span>
        </div>
      </div>
    </div>
  );
}
