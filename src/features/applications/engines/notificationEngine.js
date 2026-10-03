/**
 * notificationEngine.js
 * In-App Notification Engine — Application Management System
 * Future-ready: add email/SMS here later without touching other files.
 */

import { appClient } from "@/api/appClient";

// ─────────────────────────────────────────────────
// Notification templates
// ─────────────────────────────────────────────────
const TEMPLATES = {
  submitted: (app) => ({
    title: `New Application: ${app.application_number}`,
    message: `${app.applicant_name || "An applicant"} has submitted a ${formatType(app.type)} application. Please review.`,
  }),
  recommended: (app, actorName) => ({
    title: `Application Recommended: ${app.application_number}`,
    message: `${actorName || "Reviewer"} has recommended the application by ${app.applicant_name || "applicant"}.`,
  }),
  approved: (app, actorName) => ({
    title: `Application Approved ✓: ${app.application_number}`,
    message: `Your ${formatType(app.type)} application has been approved by ${actorName || "authority"}.`,
  }),
  rejected: (app, actorName) => ({
    title: `Application Rejected: ${app.application_number}`,
    message: `Your ${formatType(app.type)} application has been rejected by ${actorName || "authority"}. You may re-apply.`,
  }),
  cancelled: (app) => ({
    title: `Application Cancelled: ${app.application_number}`,
    message: `Application ${app.application_number} has been cancelled.`,
  }),
  resubmitted: (app) => ({
    title: `Application Resubmitted: ${app.application_number}`,
    message: `${app.applicant_name || "Applicant"} has resubmitted their ${formatType(app.type)} application.`,
  }),
  forwarded: (app, actorName) => ({
    title: `Application Forwarded: ${app.application_number}`,
    message: `${actorName || "Reviewer"} has forwarded the application from ${app.applicant_name || "applicant"} for your review.`,
  }),
};

function formatType(type) {
  return (type || "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// ─────────────────────────────────────────────────
// Create a single notification record
// ─────────────────────────────────────────────────
async function createNotification({ applicationId, applicationNumber, recipientId, recipientRole, eventType, application, actorName }) {
  if (!recipientId) return;
  const tmpl = TEMPLATES[eventType];
  if (!tmpl) return;
  const { title, message } = tmpl(application, actorName);

  try {
    await appClient.entities.ApplicationNotification.create({
      organization_id:    application?.organization_id,
      application_id:     applicationId,
      application_number: applicationNumber,
      recipient_id:       recipientId,
      recipient_role:     recipientRole,
      event_type:         eventType,
      title,
      message,
      is_read:            false,
    });
  } catch (err) {
    console.warn("[NotificationEngine] Failed to create notification:", err);
  }
}

// ─────────────────────────────────────────────────
// Public API — called after each action
// ─────────────────────────────────────────────────

/**
 * Notify reviewers when a new application is submitted
 * @param {object} application  - the saved application row
 * @param {Array}  reviewerIds  - [{id, role}] list of next reviewers to notify
 */
export async function notifySubmitted(application, reviewerIds = []) {
  for (const rev of reviewerIds) {
    await createNotification({
      applicationId:     application.id,
      applicationNumber: application.application_number,
      recipientId:       rev.id,
      recipientRole:     rev.role,
      eventType:         "submitted",
      application,
    });
  }
}

/**
 * Notify applicant + next reviewers when action is taken
 */
export async function notifyAction({ application, eventType, actorId, actorName, actorRole, applicantId, nextReviewerIds = [] }) {
  // Notify applicant for terminal events
  if (["approved", "rejected", "cancelled"].includes(eventType)) {
    await createNotification({
      applicationId:     application.id,
      applicationNumber: application.application_number,
      recipientId:       applicantId,
      recipientRole:     application.applicant_type,
      eventType,
      application,
      actorName,
    });
  }

  // Notify next reviewers
  for (const rev of nextReviewerIds) {
    await createNotification({
      applicationId:     application.id,
      applicationNumber: application.application_number,
      recipientId:       rev.id,
      recipientRole:     rev.role,
      eventType:         ["recommended", "forwarded"].includes(eventType) ? eventType : "forwarded",
      application,
      actorName,
    });
  }
}

/**
 * Mark notifications as read for a recipient
 */
export async function markNotificationsRead(applicationId, recipientId) {
  try {
    const all = await appClient.entities.ApplicationNotification.filter({
      application_id: applicationId,
      recipient_id:   recipientId,
      is_read:        false,
    });
    for (const notif of all) {
      await appClient.entities.ApplicationNotification.update(notif.id, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("[NotificationEngine] markRead failed:", err);
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(recipientId) {
  try {
    const all = await appClient.entities.ApplicationNotification.filter({
      recipient_id: recipientId,
      is_read:      false,
    });
    return all.length;
  } catch {
    return 0;
  }
}
