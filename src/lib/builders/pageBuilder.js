import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Tenant-Isolated Dynamic Page Builder Engine with Full Metadata Snapshot Versioning
 */

export async function createPageDraft({ title, slug, seoConfig = {}, contentJson = {}, sections = [] }) {
  const { organizationId } = await getTenantContext();
  const pagePayload = withTenantPayload(
    { title, slug, seo_config: seoConfig, status: "draft", current_version: 1 },
    organizationId
  );

  const { data: page, error: pageErr } = await supabase
    .from("custom_pages")
    .insert(pagePayload)
    .select()
    .single();

  if (pageErr) throw pageErr;

  const versionPayload = withTenantPayload(
    {
      page_id: page.id,
      version_number: 1,
      title,
      slug,
      seo_config: seoConfig,
      content_json: contentJson,
      sections,
      status: "draft",
    },
    organizationId
  );

  const { data: version, error: versionErr } = await supabase
    .from("page_versions")
    .insert(versionPayload)
    .select()
    .single();

  if (versionErr) throw versionErr;
  return { page, version };
}

export async function publishPageVersion(pageId, { title, slug, seoConfig = {}, contentJson = {}, sections = [] }) {
  const { organizationId } = await getTenantContext();

  let pageQuery = supabase.from("custom_pages").select("current_version").eq("id", pageId);
  pageQuery = withTenantFilter(pageQuery, organizationId);
  const { data: pageData } = await pageQuery.single();

  const newVersionNumber = (pageData?.current_version || 0) + 1;

  // Insert full page snapshot version (title, slug, seo_config, content_json, sections)
  const versionPayload = withTenantPayload(
    {
      page_id: pageId,
      version_number: newVersionNumber,
      title,
      slug,
      seo_config: seoConfig,
      content_json: contentJson,
      sections,
      status: "published",
    },
    organizationId
  );

  const { data: version, error: verErr } = await supabase
    .from("page_versions")
    .insert(versionPayload)
    .select()
    .single();

  if (verErr) throw verErr;

  let updateQuery = supabase
    .from("custom_pages")
    .update({
      title,
      slug,
      seo_config: seoConfig,
      status: "published",
      current_version: newVersionNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);
  updateQuery = withTenantFilter(updateQuery, organizationId);

  await updateQuery;

  return version;
}

export async function rollbackPageToVersion(pageId, targetVersionNumber) {
  const { organizationId } = await getTenantContext();

  let verQuery = supabase
    .from("page_versions")
    .select("*")
    .eq("page_id", pageId)
    .eq("version_number", targetVersionNumber);
  verQuery = withTenantFilter(verQuery, organizationId);

  const { data: targetVer, error } = await verQuery.single();
  if (error || !targetVer) throw new Error("Target version snapshot not found");

  // Restore full metadata snapshot
  return await publishPageVersion(pageId, {
    title: targetVer.title,
    slug: targetVer.slug,
    seoConfig: targetVer.seo_config,
    contentJson: targetVer.content_json,
    sections: targetVer.sections,
  });
}
