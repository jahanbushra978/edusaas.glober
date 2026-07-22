"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

const HomeDataContext = createContext(null);

/**
 * HomeDataProvider fetches home page data via React Query.
 *
 * The Server Component (page.jsx) prefetches this data and seeds the React
 * Query cache via HydrationBoundary.  When the client's useQuery runs, it
 * finds the data already in cache (staleTime: 2h) so it does NOT make an
 * extra network call and immediately returns the data without a loading state.
 *
 * HomeContent uses a `mounted` guard (useState + useEffect) to avoid React
 * hydration error #418 — it renders a neutral spinner before mount (same on
 * server and client), then full content after mount.
 */
export function HomeDataProvider({ children }) {
  const { data, isLoading } = useQuery({
    queryKey: ["home-page-data"],
    queryFn: async () => {
      const res = await fetch("/api/public/home", {
        // Use browser cache for fast repeat visits
        cache: "default",
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load home data");
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to load home data");
      return json;
    },
    // Cache for 2 hours — homepage data rarely changes
    staleTime: 2 * 60 * 60 * 1000,
    // Keep old data while refetching in background
    placeholderData: (prev) => prev,
    retry: 1,
    // Don't refetch when window gains focus
    refetchOnWindowFocus: false,
    // Don't refetch when internet reconnects
    refetchOnReconnect: false,
  });

  return (
    <HomeDataContext.Provider value={{ data, isLoading }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  const ctx = useContext(HomeDataContext);
  if (!ctx) throw new Error("useHomeData must be used within HomeDataProvider");
  return ctx;
}
