import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter, withTenantPayload } from "@/lib/tenant/tenantDb";

/**
 * Universal Dry-Run Import & Tenant-Scoped Export Engine
 */

export async function createImportPreviewTask({ fileFormat = "csv", recordsToImport = [] }) {
  const { organizationId } = await getTenantContext();

  const totalRecords = recordsToImport.length;
  const validRecords = recordsToImport.filter((r) => r.name || r.title || r.phone).length;
  const invalidRecords = totalRecords - validRecords;

  const dryRunSummary = {
    totalRecords,
    validRecords,
    invalidRecords,
    duplicatesDetected: 0,
    samplePreview: recordsToImport.slice(0, 5),
  };

  const payload = withTenantPayload(
    {
      task_type: "import",
      file_format: fileFormat,
      dry_run_summary: dryRunSummary,
      status: "draft_preview",
      record_count: totalRecords,
    },
    organizationId
  );

  const { data, error } = await supabase.from("import_export_tasks").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function confirmImportTask(taskId) {
  const { organizationId } = await getTenantContext();
  let query = supabase
    .from("import_export_tasks")
    .update({ status: "completed" })
    .eq("id", taskId);

  query = withTenantFilter(query, organizationId);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function exportTenantData(moduleName, fileFormat = "csv") {
  const { organizationId } = await getTenantContext();

  let query = supabase.from(moduleName).select("*");
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query;
  if (error) throw error;

  const payload = withTenantPayload(
    {
      task_type: "export",
      file_format: fileFormat,
      record_count: data?.length || 0,
      status: "completed",
    },
    organizationId
  );

  await supabase.from("import_export_tasks").insert(payload);
  return data || [];
}
