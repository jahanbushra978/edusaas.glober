"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

const HomeDataContext = createContext(null);

/**
 * HomeDataProvider
 *
 * Accepts an optional `initialData` prop that can be seeded from the
 * Server Component (page.jsx) via SSR prefetch.  When provided, React
 * Query treats it as the initial cache value so the first render on
 * both the server (HTML sent to bots / users) and the client uses real
 * content — no loading spinner, no empty shell.
 *
 * The background refetch behaviour is unchanged:
 *   - staleTime: 2 hours  →  won't refetch unless data is 2h old
 *   - refetchOnWindowFocus / refetchOnReconnect: false
 */
export function HomeDataProvider({ children, initialData }) {
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
    // When SSR seed data is provided, use it as the initial value.
    // React Query will treat the data as fresh for `staleTime` ms.
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
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
