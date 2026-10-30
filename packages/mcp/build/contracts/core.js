/**
 * Shared primitives for the MCP capability model.
 *
 * These types are deliberately small and dependency-free so that the catalog,
 * the policy engine and the execution layer can all agree on them without
 * importing each other.
 */
export const ENVIRONMENTS = ["self", "cloud", "console"];
export const RISK_LEVELS = [0, 1, 2, 3];
export const RISK_LABELS = {
    0: "read-only",
    1: "reversible-write",
    2: "high-impact",
    3: "forbidden",
};
export const CATALOG_MODES = ["business", "advanced", "all"];
export const ADVANCED_PROFILES = ["read-only", "deploy", "full"];
export function describePermission(requirement) {
    return `${requirement.resource}:${requirement.actions.join("|")}`;
}
export function hasPermission(permissions, requirement) {
    const resource = permissions[requirement.resource];
    if (!resource)
        return false;
    return requirement.actions.every((action) => resource[action] === true);
}
