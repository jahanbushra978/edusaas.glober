import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const SearchContext = createContext(null);

const CACHE_TTL_MS = 30000; // 30 seconds cache TTL
const searchCache = new Map();

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState([]);

  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("global_recent_searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
    }
  }, []);

  // Save recent searches to localStorage
  const addRecentSearch = useCallback((item) => {
    setRecentSearches((prev) => {
      // Remove duplicates
      const filtered = prev.filter((r) => r.id !== item.id || r.entity_type !== item.entity_type);
      const next = [item, ...filtered].slice(0, 10); // Keep last 10 searches
      localStorage.setItem("global_recent_searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("global_recent_searches");
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery, searchCategory) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Check cache
    const cacheKey = `${searchCategory}:${trimmedQuery}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setResults(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmedQuery)}&category=${encodeURIComponent(searchCategory)}`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await response.json();

      if (data.ok) {
        setResults(data.results || []);
        // Save to cache
        searchCache.set(cacheKey, {
          data: data.results || [],
          timestamp: Date.now()
        });
      } else {
        console.error("Search failed:", data.message);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Search fetch error:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query, category);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, category, performSearch]);

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, Esc, /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle search palette with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close search palette with Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const value = {
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
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
