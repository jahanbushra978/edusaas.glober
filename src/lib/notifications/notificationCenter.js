import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Provider-Agnostic Notification Center Engine
 * Decouples SMS/Email/WhatsApp providers from core application logic.
 */

export async function sendNotification({ channel = "in_app", recipient, subject = null, body, providerType = "default" }) {
  const { organizationId } = await getTenantContext();

  const payload = withTenantPayload(
    {
      provider_type: providerType,
      channel,
      recipient,
      subject,
      body,
      status: "sent",
    },
    organizationId
  );

  const { data, error } = await supabase.from("notification_logs").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getTenantNotificationLogs() {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("notification_logs").select("*");
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
