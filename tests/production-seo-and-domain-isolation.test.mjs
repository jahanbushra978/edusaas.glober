import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sitemapCode = fs.readFileSync("app/sitemap.js", "utf-8");
const robotsCode = fs.readFileSync("app/robots.js", "utf-8");
const layoutCode = fs.readFileSync("app/layout.jsx", "utf-8");
const manifestCode = fs.readFileSync("app/manifest.js", "utf-8");
const tenantContextCode = fs.readFileSync("src/lib/tenant/tenantContext.js", "utf-8");
const studentLoginCode = fs.readFileSync("app/(site)/StudentLogin/page.jsx", "utf-8");
const teacherLoginCode = fs.readFileSync("app/(site)/TeacherLogin/page.jsx", "utf-8");
const generalLoginCode = fs.readFileSync("app/(site)/login/page.jsx", "utf-8");
const facilitiesPageCode = fs.readFileSync("app/(site)/facilities/page.jsx", "utf-8");
const facilitiesViewCode = fs.readFileSync("src/features/site/components/saas/EdusaasFacilitiesView.jsx", "utf-8");
const aboutViewCode = fs.readFileSync("src/features/site/components/saas/EdusaasAboutView.jsx", "utf-8");

test("1. Strict Domain Resolution: Unknown domains return strict 404", () => {
  assert.ok(
    tenantContextCode.includes("isUnknownDomain: true") &&
    tenantContextCode.includes("notFound: true"),
    "tenantContext returns notFound: true and isUnknownDomain: true for unknown domains"
  );
  assert.ok(
    tenantContextCode.includes("!isEdusaasHost && !isRahmaniaHost"),
    "Host resolution explicitly gates against unauthorized hostnames"
  );
  assert.ok(
    layoutCode.includes("if (tenant?.notFound || tenant?.isUnknownDomain)") &&
    layoutCode.includes("notFound()"),
    "app/layout.jsx triggers Next.js notFound() for unknown domains, preventing data leakage"
  );
});

test("2. Domain Separation: Edusaas vs Rahmania Institute", () => {
  assert.ok(
    tenantContextCode.includes('cleanHost === "rahmaniainstitute.org"') ||
    tenantContextCode.includes('cleanHost === "www.rahmaniainstitute.org"'),
    "Rahmania domain is strictly isolated to rahmaniainstitute.org"
  );
  assert.ok(
    tenantContextCode.includes('cleanHost === "edusaas.global"') ||
    tenantContextCode.includes('cleanHost === "www.edusaas.global"'),
    "Edusaas domain is strictly mapped to edusaas.global"
  );
  assert.ok(
    layoutCode.includes("isRahmania") &&
    layoutCode.includes("https://rahmaniainstitute.org") &&
    layoutCode.includes("https://edusaas.global"),
    "Root layout metadata sets correct metadataBase and branding based on resolved tenant"
  );
});

test("3. Sitemap Purity: Login and internal console routes removed from public sitemap", () => {
  // Parse sitemap content for edusaasStaticRoutes
  const edusaasRoutesMatch = sitemapCode.match(/const edusaasStaticRoutes = \[([\s\S]*?)\];/);
  assert.ok(edusaasRoutesMatch, "edusaasStaticRoutes array found in app/sitemap.js");
  const routesStr = edusaasRoutesMatch[1];
  
  assert.strictEqual(routesStr.includes("AdminLogin"), false, "AdminLogin excluded from public sitemap");
  assert.strictEqual(routesStr.includes("TeacherLogin"), false, "TeacherLogin excluded from public sitemap");
  assert.strictEqual(routesStr.includes("StudentLogin"), false, "StudentLogin excluded from public sitemap");
  assert.strictEqual(routesStr.includes("platform-console/organizations/new"), false, "Organization creation excluded from public sitemap");
  assert.strictEqual(routesStr.includes("platform-console/login"), false, "Console login excluded from public sitemap");

  // Public content pages must remain in sitemap
  assert.ok(routesStr.includes("quran-tutor"), "quran-tutor included in sitemap");
  assert.ok(routesStr.includes("about"), "about included in sitemap");
  assert.ok(routesStr.includes("facilities"), "facilities included in sitemap");
  assert.ok(routesStr.includes("faq"), "faq included in sitemap");
});

test("4. Google SEO Alignment: Login routes allow crawl and emit noindex meta tags", () => {
  // robots.txt should not block crawlers from inspecting noindex directives on login pages
  const disallowBlock = robotsCode.match(/disallow: \[([\s\S]*?)\]/);
  assert.ok(disallowBlock, "robots.txt disallow block found");
  const disallowStr = disallowBlock[1];
  assert.strictEqual(disallowStr.includes("'/AdminLogin'"), false, "AdminLogin not disallowed in robots.txt (crawlers can see noindex)");
  assert.strictEqual(disallowStr.includes("'/TeacherLogin'"), false, "TeacherLogin not disallowed in robots.txt");
  assert.strictEqual(disallowStr.includes("'/StudentLogin'"), false, "StudentLogin not disallowed in robots.txt");
  assert.strictEqual(disallowStr.includes("'/login'"), false, "Login not disallowed in robots.txt");

  // Private administration routes MUST be disallowed
  assert.ok(disallowStr.includes("'/admin'"), "/admin is disallowed in robots.txt");
  assert.ok(disallowStr.includes("'/platform-console'"), "/platform-console is disallowed in robots.txt");
  assert.ok(disallowStr.includes("'/TeacherDashboard'"), "/TeacherDashboard is disallowed in robots.txt");
  assert.ok(disallowStr.includes("'/StudentProfile'"), "/StudentProfile is disallowed in robots.txt");

  // Login pages must export noindex metadata
  assert.ok(studentLoginCode.includes("index: false") && studentLoginCode.includes("follow: false"), "StudentLogin exports noindex");
  assert.ok(teacherLoginCode.includes("index: false") && teacherLoginCode.includes("follow: false"), "TeacherLogin exports noindex");
  assert.ok(generalLoginCode.includes("index: false") && generalLoginCode.includes("follow: false"), "login exports noindex");
});

test("5. Host-Aware Dynamic Webmanifest", () => {
  assert.ok(manifestCode.includes("isRahmania"), "app/manifest.js checks request host dynamically");
  assert.ok(
    manifestCode.includes("Rahmania Institute (রহমানিয়া ইনস্টিটিউট)") &&
    manifestCode.includes("/rahmania-logo-v2.png"),
    "Rahmania host receives genuine Rahmania branding and logo in manifest"
  );
  assert.ok(
    manifestCode.includes("Edusaas — Smart Education SaaS & ERP Platform") &&
    manifestCode.includes("/favicon.png") &&
    manifestCode.includes("/apple-touch-icon.png"),
    "Edusaas host receives Edusaas branding and icons in manifest"
  );
});

test("6. Physical Asset Verification: Favicon, PWA & Apple Touch Icons exist", () => {
  assert.ok(fs.existsSync("public/favicon.png"), "public/favicon.png exists");
  assert.ok(fs.existsSync("public/favicon.ico"), "public/favicon.ico exists");
  assert.ok(fs.existsSync("public/apple-touch-icon.png"), "public/apple-touch-icon.png exists");
  assert.ok(fs.existsSync("public/rahmania-logo-v2.png"), "public/rahmania-logo-v2.png exists");
  assert.ok(fs.existsSync("public/edusaas-hero-bg-v2.jpg"), "public/edusaas-hero-bg-v2.jpg exists");

  assert.ok(fs.statSync("public/favicon.png").size > 1000, "favicon.png is non-empty");
  assert.ok(fs.statSync("public/apple-touch-icon.png").size > 1000, "apple-touch-icon.png is non-empty");
  assert.ok(fs.statSync("public/rahmania-logo-v2.png").size > 1000, "rahmania-logo-v2.png is non-empty");
});

test("7. Truth in Advertising: Zero unsupported SLAs and guarantees", () => {
  assert.strictEqual(facilitiesPageCode.includes("৯৯.৯% আপটাইম SLA"), false, "Unsupported 99.9% SLA removed from facilities metadata");
  assert.strictEqual(facilitiesViewCode.includes("৯৯.৯% আপটাইম নিশ্চয়তা"), false, "Unsupported 99.9% guarantee removed from facilities view");
  assert.strictEqual(facilitiesViewCode.includes("Point-in-Time Recovery"), false, "Unsupported Point-in-Time Recovery tag removed");
  assert.strictEqual(aboutViewCode.includes("৯৯.৯% ক্লাউড আপটাইম"), false, "Unsupported 99.9% uptime removed from about view");
});
