import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import DynamicTenantSiteRenderer from "@/components/tenant-site/DynamicTenantSiteRenderer";
import PublicHomePage from "../../(site)/page";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "rahmania";
  const formattedName = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formattedName} — Official Website`,
    description: `Official website and portal for ${formattedName}`,
  };
}

export default async function DynamicTenantSitePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "rahmania";

  // Rahmania Institute Flagship Site (Org #1)
  if (slug === "rahmania" || slug === "default") {
    return <PublicHomePage />;
  }

  const cleanSlug = String(slug)
    .toLowerCase()
    .trim()
    .replace(/%20|\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const formattedName = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Look up organization by slug
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, status, theme_config, logo_url")
    .or(`slug.eq.${cleanSlug},slug.eq.${slug}`)
    .maybeSingle();

  if (org?.status === "suspended") notFound();

  const activeOrg = org || {
    id: `org_${cleanSlug}`,
    name: formattedName || "Educational Institution",
    slug: cleanSlug,
    theme_config: { primary_color: "#0f766e" },
  };

  // Fetch published sections
  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("organization_id", activeOrg.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // Fetch white label config
  const { data: whiteLabel } = await supabase
    .from("white_label_configs")
    .select("*")
    .eq("organization_id", activeOrg.id)
    .maybeSingle();

  return (
    <DynamicTenantSiteRenderer
      slug={cleanSlug}
      orgName={activeOrg.name}
      orgId={activeOrg.id}
      themeColor={activeOrg.theme_config?.primary_color || "#0f766e"}
      logoUrl={activeOrg.logo_url || null}
      whiteLabel={whiteLabel}
      initialSections={sections || []}
      isPublished={true}
    />
  );
}
