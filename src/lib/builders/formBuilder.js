import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Tenant-Isolated Dynamic Form Builder & Submissions Engine
 */

export async function getTenantFormDefinition(formKey) {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("form_definitions").select("*").eq("form_key", formKey);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data?.fields_json || [];
}

export async function saveTenantFormDefinition(formKey, fieldsJson = []) {
  const { organizationId } = await getTenantContext();
  const payload = withTenantPayload(
    { form_key: formKey, fields_json: fieldsJson },
    organizationId
  );

  const { data, error } = await supabase
    .from("form_definitions")
    .upsert(payload, { onConflict: "organization_id, form_key" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitTenantForm(formKey, submissionData = {}) {
  const { organizationId } = await getTenantContext();
  const payload = withTenantPayload(
    { form_key: formKey, submission_data: submissionData },
    organizationId
  );

  const { data, error } = await supabase.from("form_submissions").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getTenantFormSubmissions(formKey) {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("form_submissions").select("*").eq("form_key", formKey);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
