import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import DynamicTenantSiteRenderer from "@/components/tenant-site/DynamicTenantSiteRenderer";
import PublicHomePage from "../../(site)/page";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "rahmania";

  if (slug === "rahmania" || slug === "default") {
    return {
      title: "রহমানিয়া ইনস্টিটিউট | Rahmania Institute — দ্বীনি ও আধুনিক শিক্ষা প্রতিষ্ঠান",
      description: "গাজীপুরের দ্বীনি ও আধুনিক শিক্ষা প্রতিষ্ঠান",
    };
  }

  const cleanSlug = String(slug)
    .toLowerCase()
    .trim()
    .replace(/%20|\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const admin = createSupabaseAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("name, status")
    .or(`slug.eq.${cleanSlug},slug.eq.${slug}`)
    .maybeSingle();

  if (!org || org.status !== "active") {
    return {
      title: "404 — Not Found",
      description: "Organization or page not found.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${org.name} — Official Website`,
    description: `Official website and portal for ${org.name}`,
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

  const admin = createSupabaseAdminClient();

  // Look up organization by slug using server admin client
  const { data: org } = await admin
    .from("organizations")
    .select("id, name, slug, status, theme_config, logo_url")
    .or(`slug.eq.${cleanSlug},slug.eq.${slug}`)
    .maybeSingle();

  if (!org || org.status !== "active") {
    notFound();
  }

  const activeOrg = org;

  // Fetch published sections
  const { data: sections } = await admin
    .from("page_sections")
    .select("*")
    .eq("organization_id", activeOrg.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // Fetch white label config
  const { data: whiteLabel } = await admin
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
