/**
 * workflowEngine.js
 * Dynamic Approval Workflow Engine — Application Management System
 * Loads workflow steps from application_workflow_rules table.
 * No hardcoded role logic — everything comes from DB.
 */

import { appClient } from "@/api/appClient";

// ─────────────────────────────────────────────────
// Load workflow rules for a given type + applicant
// ─────────────────────────────────────────────────
export async function loadWorkflowRules(applicationType, applicantType) {
  try {
    const all = await appClient.entities.ApplicationWorkflowRule.listAll();
    // Priority: exact type match + exact applicant match
    // Fallback: '*' for type, '*' for applicant
    const exactMatch = all.find(
      r => r.application_type === applicationType && r.applicant_type === applicantType
    );
    if (exactMatch) return exactMatch;

    const typeWild = all.find(
      r => r.application_type === "*" && r.applicant_type === applicantType
    );
    if (typeWild) return typeWild;

    const fullWild = all.find(
      r => r.application_type === "*" && r.applicant_type === "*"
    );
    return fullWild || getDefaultWorkflow(applicantType);
  } catch {
    return getDefaultWorkflow(applicantType);
  }
}

function getDefaultWorkflow(applicantType) {
  if (applicantType === "student") {
    return {
      steps: [
        { order: 1, role: "teacher",      action: "recommend", label: "Assigned Teacher", required: true },
        { order: 2, role: "branch_admin", action: "approve",   label: "Branch Admin",     required: true },
        { order: 3, role: "super_admin",  action: "approve",   label: "Super Admin",      required: false },
      ],
      allow_resubmit_after_reject: true,
    };
  }
  return {
    steps: [
      { order: 1, role: "branch_admin", action: "approve", label: "Branch Admin",  required: true },
      { order: 2, role: "super_admin",  action: "approve", label: "Super Admin",   required: false },
    ],
    allow_resubmit_after_reject: true,
  };
}

// ─────────────────────────────────────────────────
// Given current status + actor role → next step
// ─────────────────────────────────────────────────
export function getNextStep(workflowRule, currentReviewerRole) {
  const steps = Array.isArray(workflowRule?.steps) ? workflowRule.steps : [];
  const sorted = [...steps].sort((a, b) => a.order - b.order);

  if (!currentReviewerRole) return sorted[0] || null;

  const currentIdx = sorted.findIndex(s => s.role === currentReviewerRole);
  return sorted[currentIdx + 1] || null;
}

export function getCurrentStep(workflowRule, currentReviewerRole) {
  const steps = Array.isArray(workflowRule?.steps) ? workflowRule.steps : [];
  return steps.find(s => s.role === currentReviewerRole) || null;
}

export function getAllSteps(workflowRule) {
  return Array.isArray(workflowRule?.steps)
    ? [...workflowRule.steps].sort((a, b) => a.order - b.order)
    : [];
}

// ─────────────────────────────────────────────────
// Determine new status after an action
// ─────────────────────────────────────────────────
export function resolveNewStatus(action, currentStep, nextStep) {
  if (action === "reject")    return "rejected";
  if (action === "cancel")    return "cancelled";
  if (action === "recommend") return (nextStep && nextStep.required !== false) ? "recommended" : "approved";
  if (action === "approve") {
    if (!nextStep || nextStep.required === false) return "approved";
    return "under_review";
  }
  return "submitted";
}

// ─────────────────────────────────────────────────
// Generate unique Application Number
// ─────────────────────────────────────────────────
const TYPE_CODES = {
  leave:                "LVE",
  home_leave:           "HLV",
  late_entry:           "LTE",
  early_leave:          "ELV",
  certificate:          "CRT",
  character_certificate:"CCT",
  transfer_certificate: "TCT",
  fee_waiver:           "FWV",
  hostel_permission:    "HST",
  exam_permission:      "EXP",
};

export async function generateApplicationNumber(type, branchId) {
  const year       = new Date().getFullYear();
  const typeCode   = TYPE_CODES[type] || "APP";
  const branchCode = String(branchId || "0").padStart(2, "0");
  const ts         = Date.now().toString().slice(-6);
  const rnd        = Math.floor(Math.random() * 900) + 100;
  return `APP-${year}-B${branchCode}-${typeCode}-${ts}${rnd}`;
}
