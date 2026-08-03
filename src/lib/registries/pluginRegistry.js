/**
 * Plugin Registry - Foundational Architecture
 * Manages plugin definition schema (plugin_id, version, status, dependencies).
 */

const CORE_PLUGINS = [
  {
    plugin_id: "biometric-bridge",
    name: "Biometric Hardware Sync Engine",
    version: "1.0.0",
    status: "active",
    dependencies: [],
    core: true,
  },
  {
    plugin_id: "sms-gateway",
    name: "Automated SMS Gateway",
    version: "1.0.0",
    status: "active",
    dependencies: [],
    core: false,
  },
  {
    plugin_id: "online-admissions",
    name: "Student Admission Portal",
    version: "1.0.0",
    status: "active",
    dependencies: [],
    core: true,
  },
];

const _plugins = new Map(CORE_PLUGINS.map((p) => [p.plugin_id, p]));

export function registerPlugin(pluginDef) {
  if (!pluginDef || !pluginDef.plugin_id) {
    throw new Error("Invalid plugin definition: missing 'plugin_id'");
  }
  _plugins.set(pluginDef.plugin_id, {
    status: "inactive",
    dependencies: [],
    version: "1.0.0",
    ...pluginDef,
    registeredAt: new Date().toISOString(),
  });
}

export function getPlugin(pluginId) {
  return _plugins.get(pluginId) || null;
}

export function listPlugins() {
  return Array.from(_plugins.values());
}
