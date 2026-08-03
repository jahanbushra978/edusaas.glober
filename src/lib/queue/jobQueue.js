import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Idempotent Background Job Queue Engine
 * Prevents duplicate processing via idempotency_key uniqueness.
 */

export async function dispatchBackgroundJob({ jobType, payload = {}, idempotencyKey = null, maxAttempts = 3 }) {
  const { organizationId } = await getTenantContext();
  const key = idempotencyKey || `job_${jobType}_${organizationId}_${Date.now()}`;

  // Check existing job for idempotency
  const { data: existing } = await supabase
    .from("background_jobs")
    .select("*")
    .eq("idempotency_key", key)
    .maybeSingle();

  if (existing) {
    return { dispatched: false, idempotent: true, job: existing };
  }

  const jobPayload = withTenantPayload(
    {
      idempotency_key: key,
      job_type: jobType,
      payload,
      status: "pending",
      progress_percent: 0,
      attempts: 0,
      max_attempts: maxAttempts,
    },
    organizationId
  );

  const { data, error } = await supabase.from("background_jobs").insert(jobPayload).select().single();
  if (error) throw error;
  return { dispatched: true, job: data };
}

export async function updateJobProgress(jobId, progressPercent, status = "processing", errorMessage = null) {
  const { organizationId } = await getTenantContext();
  let query = supabase
    .from("background_jobs")
    .update({
      progress_percent: progressPercent,
      status,
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  query = withTenantFilter(query, organizationId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function cancelBackgroundJob(jobId) {
  return await updateJobProgress(jobId, 0, "cancelled", "Cancelled by user request");
}
