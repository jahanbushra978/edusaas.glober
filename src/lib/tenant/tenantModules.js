import { supabase } from "@/lib/supabase";
import { getTenantContext } from "./tenantContext";
import { withTenantFilter, withTenantPayload } from "./tenantDb";

/**
 * Tenant-Aware Module Query Dispatcher
 * Provides tenant-isolated read/write methods for existing ERP modules.
 */

export async function getTenantNotices() {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("notices").select("*");
  query = withTenantFilter(query, organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createTenantNotice(noticePayload) {
  const { organizationId } = await getTenantContext();
  const payload = withTenantPayload(noticePayload, organizationId);
  const { data, error } = await supabase.from("notices").insert(payload).select();
  if (error) throw error;
  return data;
}

export async function getTenantTeachers() {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("teachers").select("*");
  query = withTenantFilter(query, organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTenantStudents() {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("students").select("*");
  query = withTenantFilter(query, organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
