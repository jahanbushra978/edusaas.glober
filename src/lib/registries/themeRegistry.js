/**
 * Theme Registry - Foundational Architecture
 * Manages theme manifests, metadata, and dynamic theme loading definitions per tenant.
 */

const DEFAULT_THEME_MANIFEST = {
  id: "default-madrasa",
  name: "Default Academic Theme",
  version: "1.0.0",
  author: "SaaS Platform",
  defaultConfig: {
    primaryColor: "#0f766e",
    secondaryColor: "#0d9488",
    fontFamily: "Inter, sans-serif",
    layout: "modern",
  },
};

const _themes = new Map([
  ["default-madrasa", DEFAULT_THEME_MANIFEST],
]);

export function registerTheme(manifest) {
  if (!manifest || !manifest.id) {
    throw new Error("Invalid theme manifest: missing 'id'");
  }
  _themes.set(manifest.id, {
    ...manifest,
    registeredAt: new Date().toISOString(),
  });
}

export function getTheme(themeId) {
  return _themes.get(themeId) || DEFAULT_THEME_MANIFEST;
}

export function listThemes() {
  return Array.from(_themes.values());
}
