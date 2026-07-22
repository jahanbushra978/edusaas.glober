import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchInput = React.forwardRef(({
  value = "",
  onChange,
  placeholder = "Search...",
  className,
  showClear = true,
  onClear,
  containerClassName,
  ...props
}, ref) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange?.("");
    }
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200 bg-white",
          "text-sm text-slate-800 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]",
          "transition-all shadow-sm",
          className
        )}
        {...props}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export { SearchInput };
