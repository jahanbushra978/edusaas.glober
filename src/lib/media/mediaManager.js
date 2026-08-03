import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Multi-Tenant Central Media Manager Engine
 * Manages Cloudinary public_id, URL, and metadata references.
 * Never stores binary blobs in PostgreSQL. Supports soft-delete & recycle bin recovery.
 */

export async function listMediaItems({ includeRecycleBin = false } = {}) {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("media_items").select("*");
  query = withTenantFilter(query, organizationId);

  if (!includeRecycleBin) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function registerMediaItem({ name, url, cloudinaryPublicId, fileType = "image", fileSize = 0, tags = [] }) {
  const { organizationId } = await getTenantContext();
  const payload = withTenantPayload(
    {
      name,
      url,
      cloudinary_public_id: cloudinaryPublicId || null,
      file_type: fileType,
      file_size: fileSize,
      tags,
    },
    organizationId
  );

  const { data, error } = await supabase.from("media_items").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function softDeleteMediaItem(mediaId) {
  const { organizationId } = await getTenantContext();
  let query = supabase
    .from("media_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", mediaId);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function restoreMediaItem(mediaId) {
  const { organizationId } = await getTenantContext();
  let query = supabase
    .from("media_items")
    .update({ deleted_at: null })
    .eq("id", mediaId);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
