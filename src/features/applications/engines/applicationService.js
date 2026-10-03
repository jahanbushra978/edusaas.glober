/**
 * applicationService.js
 * Central service — orchestrates workflow, permissions, notifications, audit log.
 * All UI components call these functions only — no direct DB calls in UI.
 */

import { appClient } from "@/api/appClient";
import {
  loadWorkflowRules,
  generateApplicationNumber,
  getNextStep,
  getCurrentStep,
  getAllSteps,
  resolveNewStatus,
} from "./workflowEngine";
import {
  notifySubmitted,
  notifyAction,
} from "./notificationEngine";

// ─────────────────────────────────────────────────
// SUBMIT (create + submit in one call, or save as draft)
// ─────────────────────────────────────────────────
export async function submitApplication({ type, applicantType, applicantId, applicantName, branchId, fromDate, toDate, reason, priority = "normal", attachmentUrl = null, customTitle = null, saveAsDraft = false }) {
  const workflowRule = await loadWorkflowRules(type, applicantType);
  const steps = getAllSteps(workflowRule);
  const firstStep = steps[0] || null;

  const appNumber = await generateApplicationNumber(type, branchId);
  const status = saveAsDraft ? "draft" : (firstStep ? "submitted" : "approved");
  const currentReviewerRole = saveAsDraft ? null : (firstStep?.role || null);

  const application = await appClient.entities.Application.create({
    application_number:    appNumber,
    type,
    applicant_type:        applicantType,
    applicant_id:          applicantId,
    applicant_name:        applicantName,
    branch_id:             branchId,
    from_date:             fromDate || null,
    to_date:               toDate || null,
    reason,
    priority,
    attachment_url:        attachmentUrl,
    custom_title:          customTitle,
    status,
    current_reviewer_role: currentReviewerRole,
    workflow_snapshot:     workflowRule.steps,
    is_editable:           true,
    submitted_at:          saveAsDraft ? null : new Date().toISOString(),
  });

  // Audit log
  await logAction(application.id, {
    action_type: saveAsDraft ? "created" : "submitted",
    actor_id:    applicantId,
    actor_role:  applicantType,
    actor_name:  applicantName,
    from_status: null,
    to_status:   status,
    comment:     saveAsDraft ? "Saved as draft" : "Application submitted",
  });

  // Notify first reviewer(s) if submitted
  if (!saveAsDraft && firstStep) {
    const reviewers = await getReviewersForRole(firstStep.role, branchId, application);
    await notifySubmitted(application, reviewers);
  }

  return application;
}

// ─────────────────────────────────────────────────
// SUBMIT DRAFT (promote draft → submitted)
// ─────────────────────────────────────────────────
export async function submitDraft(applicationId, actorId, actorName, actorRole) {
  const app = await appClient.entities.Application.get(applicationId);
  if (!app || app.status !== "draft") throw new Error("Application is not in draft state");

  const workflowRule = await loadWorkflowRules(app.type, app.applicant_type);
  const steps = getAllSteps(workflowRule);
  const firstStep = steps[0] || null;

  await appClient.entities.Application.update(applicationId, {
    status:                "submitted",
    current_reviewer_role: firstStep?.role || null,
    submitted_at:          new Date().toISOString(),
    resubmit_count:        (app.resubmit_count || 0) + (app.resubmit_count > 0 ? 1 : 0),
  });

  await logAction(applicationId, {
    action_type: app.resubmit_count > 0 ? "resubmitted" : "submitted",
    actor_id: actorId, actor_role: actorRole, actor_name: actorName,
    from_status: "draft", to_status: "submitted",
    comment: "Draft submitted",
  });

  const updatedApp = await appClient.entities.Application.get(applicationId);
  if (firstStep) {
    const reviewers = await getReviewersForRole(firstStep.role, app.branch_id, updatedApp);
    await notifySubmitted(updatedApp, reviewers);
  }
  return updatedApp;
}

// ─────────────────────────────────────────────────
// TAKE ACTION (recommend / approve / reject / cancel)
// ─────────────────────────────────────────────────
export async function takeAction({ applicationId, action, actorId, actorName, actorRole, comment = "" }) {
  const app = await appClient.entities.Application.get(applicationId);
  if (!app) throw new Error("Application not found");

  const isSuperAdmin = ["super_admin", "admin"].includes(actorRole);
  const workflowRule = { steps: app.workflow_snapshot || [] };
  const currentStep = getCurrentStep(workflowRule, app.current_reviewer_role);
  const nextStep = getNextStep(workflowRule, app.current_reviewer_role);
  
  let newStatus;
  if (isSuperAdmin && action === "approve") {
    newStatus = "approved";
  } else {
    newStatus = resolveNewStatus(action, currentStep, nextStep);
  }

  const updates = {
    status:                newStatus,
    current_reviewer_role: ["approved", "rejected", "cancelled"].includes(newStatus) ? null : (nextStep?.role || null),
    is_editable:           ["rejected"].includes(newStatus), // editable only after rejection so they can resubmit
  };

  await appClient.entities.Application.update(applicationId, updates);

  // Map action → audit action_type
  const actionTypeMap = { recommend: "recommended", approve: "approved", reject: "rejected", cancel: "cancelled" };
  await logAction(applicationId, {
    action_type: actionTypeMap[action] || action,
    actor_id:    actorId,
    actor_role:  actorRole,
    actor_name:  actorName,
    from_status: app.status,
    to_status:   newStatus,
    comment,
  });

  const updatedApp = { ...app, ...updates };

  // Notifications
  const eventType = actionTypeMap[action] || action;
  let nextReviewerIds = [];
  if (newStatus === "under_review" && nextStep) {
    nextReviewerIds = await getReviewersForRole(nextStep.role, app.branch_id, updatedApp);
  } else if (newStatus === "recommended" && nextStep) {
    nextReviewerIds = await getReviewersForRole(nextStep.role, app.branch_id, updatedApp);
  }

  await notifyAction({
    application:    updatedApp,
    eventType,
    actorId,
    actorName,
    actorRole,
    applicantId:    app.applicant_id,
    nextReviewerIds,
  });

  return updatedApp;
}

// ─────────────────────────────────────────────────
// EDIT application (before final approval)
// ─────────────────────────────────────────────────
export async function editApplication(applicationId, updates, actorId, actorName, actorRole) {
  const app = await appClient.entities.Application.get(applicationId);
  if (!app) throw new Error("Not found");
  if (!app.is_editable) throw new Error("Application is no longer editable");
  if (["approved", "cancelled"].includes(app.status)) throw new Error("Cannot edit approved or cancelled application");

  const allowed = ["type", "from_date", "to_date", "reason", "priority", "attachment_url", "custom_title"];
  const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  await appClient.entities.Application.update(applicationId, safeUpdates);

  await logAction(applicationId, {
    action_type: "edited",
    actor_id: actorId, actor_role: actorRole, actor_name: actorName,
    from_status: app.status, to_status: app.status,
    comment: "Application details updated",
    metadata: { changed_fields: Object.keys(safeUpdates) },
  });
}

// ─────────────────────────────────────────────────
// RE-SUBMIT after rejection
// ─────────────────────────────────────────────────
export async function resubmitApplication(applicationId, newData, actorId, actorName, actorRole) {
  const app = await appClient.entities.Application.get(applicationId);
  if (!app) throw new Error("Not found");
  if (app.status !== "rejected") throw new Error("Only rejected applications can be resubmitted");

  const allowed = ["type", "from_date", "to_date", "reason", "priority", "attachment_url", "custom_title"];
  const safeUpdates = Object.fromEntries(Object.entries(newData).filter(([k]) => allowed.includes(k)));

  const workflowRule = await loadWorkflowRules(app.type, app.applicant_type);
  const firstStep = getAllSteps(workflowRule)[0] || null;

  await appClient.entities.Application.update(applicationId, {
    ...safeUpdates,
    status:                "submitted",
    current_reviewer_role: firstStep?.role || null,
    is_editable:           true,
    resubmit_count:        (app.resubmit_count || 0) + 1,
    submitted_at:          new Date().toISOString(),
    workflow_snapshot:     workflowRule.steps,
  });

  await logAction(applicationId, {
    action_type: "resubmitted",
    actor_id: actorId, actor_role: actorRole, actor_name: actorName,
    from_status: "rejected", to_status: "submitted",
    comment: "Application resubmitted after rejection",
  });

  const updatedApp = await appClient.entities.Application.get(applicationId);
  if (firstStep) {
    const reviewers = await getReviewersForRole(firstStep.role, app.branch_id, updatedApp);
    await notifySubmitted(updatedApp, reviewers);
  }
  return updatedApp;
}

// ─────────────────────────────────────────────────
// DELETE application (Super Admin cleanup)
// ─────────────────────────────────────────────────
export async function deleteApplication(applicationId) {
  return appClient.entities.Application.delete(applicationId);
}

// ─────────────────────────────────────────────────
// FETCH timeline for an application
// ─────────────────────────────────────────────────
export async function getApplicationTimeline(applicationId) {
  try {
    const actions = await appClient.entities.ApplicationAction.filter({ application_id: applicationId });
    return [...actions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
async function logAction(applicationId, data) {
  try {
    await appClient.entities.ApplicationAction.create({ application_id: applicationId, ...data });
  } catch (err) {
    console.warn("[ApplicationService] logAction failed:", err);
  }
}

// Resolve reviewer IDs for a given role within a branch
async function getReviewersForRole(role, branchId, application) {
  try {
    if (role === "super_admin" || role === "admin") {
      return [{ id: 1, role: "super_admin" }];
    }
    if (role === "branch_admin") {
      return [{ id: branchId || 1, role: "branch_admin" }];
    }
    if (role === "teacher") {
      if (application?.applicant_type === "student") {
        const students = await appClient.entities.Student.filter({ id: application.applicant_id });
        const student = students?.[0];
        if (student?.assigned_teacher_id) {
          return [{ id: student.assigned_teacher_id, role: "teacher" }];
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}
