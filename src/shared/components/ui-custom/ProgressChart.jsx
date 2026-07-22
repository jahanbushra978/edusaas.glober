import React, { lazy, Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RechartsAreaChart = lazy(() => import("recharts").then(m => ({ default: m.AreaChart })));
const RechartsArea = lazy(() => import("recharts").then(m => ({ default: m.Area })));
const RechartsBarChart = lazy(() => import("recharts").then(m => ({ default: m.BarChart })));
const RechartsBar = lazy(() => import("recharts").then(m => ({ default: m.Bar })));
const RechartsLineChart = lazy(() => import("recharts").then(m => ({ default: m.LineChart })));
const RechartsLine = lazy(() => import("recharts").then(m => ({ default: m.Line })));
const RechartsXAxis = lazy(() => import("recharts").then(m => ({ default: m.XAxis })));
const RechartsYAxis = lazy(() => import("recharts").then(m => ({ default: m.YAxis })));
const RechartsCartesianGrid = lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })));
const RechartsTooltip = lazy(() => import("recharts").then(m => ({ default: m.Tooltip })));
const RechartsResponsiveContainer = lazy(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })));

const ChartFallback = () => (
  <div className="h-64 flex items-center justify-center text-slate-400">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

function ChartContent({ aggregateData }) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <RechartsResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={aggregateData}>
          <defs>
            <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <RechartsCartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <RechartsXAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <RechartsYAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <RechartsTooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: "13px",
            }}
          />
          <RechartsArea type="monotone" dataKey="pages" stroke="#6366f1" fill="url(#colorPages)" strokeWidth={2} />
        </RechartsAreaChart>
      </RechartsResponsiveContainer>
    </Suspense>
  );
}

export default function ProgressChart({ logs, title = "Reading Progress" }) {
  const [view, setView] = React.useState("monthly");

  const aggregateData = React.useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (view === "daily") {
      return sorted.slice(-30).map((log) => ({
        label: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pages: log.pages_read || 0,
      }));
    }

    if (view === "weekly") {
      const weeks = {};
      sorted.forEach((log) => {
        const d = new Date(log.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split("T")[0];
        weeks[key] = (weeks[key] || 0) + (log.pages_read || 0);
      });
      return Object.entries(weeks).slice(-12).map(([key, pages]) => ({
        label: new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pages,
      }));
    }

    // monthly
    const months = {};
    sorted.forEach((log) => {
      const d = new Date(log.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + (log.pages_read || 0);
    });
    return Object.entries(months).slice(-12).map(([key, pages]) => ({
      label: new Date(key + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      pages,
    }));
  }, [logs, view]);

  if (!logs || logs.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-8 text-center text-slate-400">
          No reading data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{title}</CardTitle>
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3 h-6">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3 h-6">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-6">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64">
          <ChartContent aggregateData={aggregateData} />
        </div>
      </CardContent>
    </Card>
  );
}