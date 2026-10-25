"use client";

export const STORAGE_KEY_SETTINGS = "rahmania_ai_settings_v1";

/**
 * Reads AI settings and BYOK key from browser localStorage safely.
 */
export function getSavedAIConfig() {
  const defaults = {
    provider: "gemini",
    model: "gemini-2.5-flash",
    apiKey: "",
    baseUrl: "",
    rememberKey: true,
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || defaults.provider,
        model: parsed.model || defaults.model,
        apiKey: parsed.apiKey || "",
        baseUrl: parsed.baseUrl || "",
        rememberKey: parsed.rememberKey !== undefined ? Boolean(parsed.rememberKey) : true,
      };
    }
  } catch {
    // ignore parse errors
  }

  return defaults;
}

/**
 * Persists AI settings and BYOK key into localStorage and notifies all open tabs/components.
 */
export function saveAIConfigToStorage(config) {
  if (typeof window === "undefined") return;
  try {
    const toSave = {
      provider: config.provider || "gemini",
      model: config.model || "gemini-2.5-flash",
      baseUrl: config.baseUrl || "",
      rememberKey: config.rememberKey !== false,
      apiKey: config.rememberKey !== false ? (config.apiKey || "").trim() : "",
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent("rahmania-ai-settings-updated", { detail: toSave }));
  } catch {
    // ignore storage quota errors
  }
}
