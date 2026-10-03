"use client";
import React from "react";
import { format } from "date-fns";
import { APPLICATION_STATUS_CONFIG } from "@/lib/permissions-definitions";
import {
  CheckCircle2, Clock, XCircle, ThumbsUp, FileText,
  Send, RotateCcw, Eye, Pencil, Ban
} from "lucide-react";

const ACTION_ICONS = {
  created:     { icon: FileText,    color: "#64748b" },
  submitted:   { icon: Send,        color: "#2563eb" },
  resubmitted: { icon: RotateCcw,   color: "#7c3aed" },
  viewed:      { icon: Eye,         color: "#94a3b8" },
  edited:      { icon: Pencil,      color: "#f59e0b" },
  recommended: { icon: ThumbsUp,    color: "#7c3aed" },
  forwarded:   { icon: Send,        color: "#0891b2" },
  approved:    { icon: CheckCircle2,color: "#16a34a" },
  rejected:    { icon: XCircle,     color: "#dc2626" },
  cancelled:   { icon: Ban,         color: "#9ca3af" },
};

const ACTION_LABELS = {
  created:     "Application Created",
  submitted:   "Application Submitted",
  resubmitted: "Application Resubmitted",
  viewed:      "Viewed",
  edited:      "Details Updated",
  recommended: "Recommended",
  forwarded:   "Forwarded",
  approved:    "Approved ✓",
  rejected:    "Rejected",
  cancelled:   "Cancelled",
};

export default function ApplicationTimeline({ timeline = [], workflowSteps = [] }) {
  if (!timeline.length && !workflowSteps.length) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm italic">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-0">
        {timeline.map((action, i) => {
          const cfg = ACTION_ICONS[action.action_type] || ACTION_ICONS.created;
          const Icon = cfg.icon;
          const isLast = i === timeline.length - 1;

          return (
            <div key={action.id || i} className="flex gap-4 relative pb-6">
              {/* Icon */}
              <div
                className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white flex-shrink-0"
                style={{ borderColor: cfg.color }}
              >
                <Icon size={16} style={{ color: cfg.color }} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-slate-800">
                    {ACTION_LABELS[action.action_type] || action.action_type}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {action.created_at
                      ? format(new Date(action.created_at), "dd MMM yyyy, hh:mm a")
                      : "—"}
                  </span>
                </div>

                {action.actor_name && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    by <span className="font-medium text-slate-700">{action.actor_name}</span>
                    {action.actor_role && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {action.actor_role.replace("_", " ")}
                      </span>
                    )}
                  </p>
                )}

                {action.comment && (
                  <div className="mt-1.5 text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-slate-600 italic">
                    "{action.comment}"
                  </div>
                )}

                {/* Status transition badge */}
                {action.from_status && action.to_status && action.from_status !== action.to_status && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <StatusBadge status={action.from_status} size="xs" />
                    <span className="text-slate-300 text-[10px]">→</span>
                    <StatusBadge status={action.to_status} size="xs" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Pending future steps */}
        {workflowSteps.length > 0 && (
          <div className="mt-2 border-t border-dashed border-slate-200 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3 pl-14">
              Pending Steps
            </p>
            {workflowSteps.map((step, i) => (
              <div key={i} className="flex gap-4 pb-4">
                <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex-shrink-0">
                  <Clock size={14} className="text-slate-300" />
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-sm text-slate-400 font-medium">
                    {step.label || step.role} —{" "}
                    <span className="text-[11px] italic">
                      {step.action === "approve" ? "Final Approval" : "Recommendation"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status, size = "sm" }) {
  const cfg = APPLICATION_STATUS_CONFIG[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  const px = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${px}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22` }}
    >
      {cfg.bn || cfg.label}
    </span>
  );
}
