"use client";

import { useEffect, useRef, useState } from "react";

export function SectionSkeleton({ minHeight = 280, className = "" }) {
  return (
    <div
      className={`w-full animate-pulse bg-gradient-to-b from-slate-50 to-white ${className}`}
      style={{ minHeight }}
      aria-hidden="true"
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 px-4 py-10">
        <div className="h-5 w-36 rounded-full bg-slate-200/80" />
        <div className="h-8 w-full max-w-md rounded-xl bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-28 rounded-2xl bg-slate-200/60" />
          <div className="h-28 rounded-2xl bg-slate-200/50" />
          <div className="hidden h-28 rounded-2xl bg-slate-200/40 lg:block" />
        </div>
      </div>
    </div>
  );
}

export default function ProgressiveSection({
  children,
  className = "",
  minHeight = 280,
  // Large rootMargin means real content mounts well *before* it scrolls into
  // view, so the skeleton -> real-content swap never happens while the user
  // is actively looking at (or scrolling past) the section. This is the main
  // fix for the "scroll gets stuck / jumpy" feeling on the homepage.
  rootMargin = "1600px 0px",
}) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (shouldRender) return undefined;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : <SectionSkeleton minHeight={minHeight} />}
    </div>
  );
}
