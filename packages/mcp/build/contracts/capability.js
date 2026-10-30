/**
 * Helper that preserves input inference inside the declaring module while
 * exposing the erased `AnyCapability` shape to the registry.
 */
export function defineCapability(definition) {
    return definition;
}
