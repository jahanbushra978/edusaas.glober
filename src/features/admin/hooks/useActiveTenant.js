import { useState, useEffect } from "react";

export const resolveSchoolName = (slug) => {
  if (!slug || slug === "rahmania" || slug === "default") return "Rahmania Institute";
  if (slug === "rrr" || slug === "bushra-jahan") return "Bushra Jahan School";
  if (slug === "raa") return "Raa Institution";
  if (slug === "noorania") return "Noorania Madrasah";
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export function useActiveTenant() {
  const [activeSchoolSlug, setActiveSchoolSlug] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("tenant") || sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug");
      if (slug) {
        sessionStorage.setItem("active_tenant_slug", slug);
        localStorage.setItem("active_tenant_slug", slug);
        return slug;
      }
    }
    return "rahmania";
  });

  const [activeSchoolName, setActiveSchoolName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("tenant") || sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug");
      if (slug) return resolveSchoolName(slug);
    }
    return "Rahmania Institute";
  });

  const [warningNotice, setWarningNotice] = useState(null);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug") || params.get("tenant") || sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug") || "rahmania";
      sessionStorage.setItem("active_tenant_slug", slug);
      localStorage.setItem("active_tenant_slug", slug);

      setActiveSchoolSlug(slug);
      const name = resolveSchoolName(slug);
      setActiveSchoolName(name);
      document.title = `${name} - Management Suite`;

      const savedWarn = localStorage.getItem(`org_warning_${slug}`);
      if (savedWarn) {
        try {
          const parsed = JSON.parse(savedWarn);
          if (parsed?.message) setWarningNotice(parsed.message);
        } catch (e) {
          console.error("Error loading warning:", e);
        }
      }

      const savedOrgs = JSON.parse(localStorage.getItem("created_orgs") || "[]");
      const currentOrg = savedOrgs.find((o) => (o.slug || o.subdomain || "").toLowerCase() === slug.toLowerCase());
      if (currentOrg?.status === "suspended") setIsAccountSuspended(true);
    }
  }, []);

  return {
    activeSchoolSlug,
    activeSchoolName,
    warningNotice,
    setWarningNotice,
    isAccountSuspended,
  };
}
