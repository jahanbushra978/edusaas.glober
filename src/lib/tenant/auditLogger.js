import { supabase } from "@/lib/supabase";

/**
 * Immutable Platform Audit Logger Service
 * Logs key platform console actions, organization lifecycle events, theme, and plugin mutations.
 */
export async function logPlatformAction({
  organizationId,
  actorId = null,
  action,
  resourceType,
  resourceId = null,
  details = {},
}) {
  if (!action || !resourceType) {
    console.error("Audit log failed: missing required action or resourceType");
    return null;
  }

  try {
    const payload = {
      organization_id: organizationId || null,
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId ? String(resourceId) : null,
      details,
    };

    const { data, error } = await supabase
      .from("platform_audit_logs")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Audit logging insert fallback/warning:", error.message);
      return payload;
    }

    return data;
  } catch (err) {
    console.error("Audit log execution error:", err);
    return null;
  }
}
