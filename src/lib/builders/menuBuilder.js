import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Tenant-Isolated Dynamic Menu Builder Engine
 */

export async function getTenantMenu(menuKey = "main_header") {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("menu_definitions").select("*").eq("menu_key", menuKey);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data?.items_json || [];
}

export async function saveTenantMenu(menuKey = "main_header", itemsJson = []) {
  const { organizationId } = await getTenantContext();
  const payload = withTenantPayload(
    { menu_key: menuKey, items_json: itemsJson },
    organizationId
  );

  const { data, error } = await supabase
    .from("menu_definitions")
    .upsert(payload, { onConflict: "organization_id, menu_key" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
