import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props} />)
  );
}

function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-6 shadow-sm", className)}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded-full bg-slate-200" />
            <div className="h-3 w-1/2 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-slate-200" />
          <div className="h-8 w-20 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex gap-4 border-b border-gray-100 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-100/70" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-200" />
        <div className="h-6 w-16 rounded-full bg-slate-200" />
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="h-56 rounded-xl bg-slate-100" />
    </div>
  );
}

function SkeletonImage({ className }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-slate-200", className)} />
  );
}

function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-300" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-48 rounded-2xl bg-slate-100" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonImage, SkeletonStats, SkeletonDashboard }
