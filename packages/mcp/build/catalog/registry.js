import { buildAdvancedCatalog } from "../advanced-api/catalog.js";
import { businessCapabilities } from "../capabilities/index.js";
import { generatedOperations } from "../generated/operations.js";
import { createLogger } from "../utils/logger.js";
const logger = createLogger("Catalog");
/**
 * Assembles the catalog for the configured mode.
 *
 * `business` is the default. `advanced` exposes the generated OpenAPI surface
 * behind an explicit profile. `all` exposes both. Filters only decide what is
 * listed; the executor never trusts this selection for authorization.
 */
export function buildCatalog(config, operations = generatedOperations) {
    const includeBusiness = config.mode !== "advanced";
    const includeAdvanced = config.mode !== "business";
    const business = includeBusiness ? [...businessCapabilities] : [];
    const advanced = includeAdvanced
        ? buildAdvancedCatalog(operations, config)
        : { capabilities: [], warnings: [], summary: null };
    const capabilities = [...business, ...advanced.capabilities];
    const warnings = [...advanced.warnings];
    const summary = {
        mode: config.mode,
        businessCount: business.length,
        advancedCount: advanced.capabilities.length,
        total: capabilities.length,
        advanced: advanced.summary,
    };
    logger.info("Loaded MCP catalog", { ...summary });
    for (const warning of warnings)
        logger.warn(warning);
    return { capabilities, warnings, summary };
}
/**
 * Name-indexed capability registry with duplicate detection.
 *
 * The registry answers "what can be offered to this client". It is not an
 * authorization source: `ToolExecutor` re-evaluates permissions and policy on
 * every call.
 */
export class CapabilityRegistry {
    capabilities;
    byName = new Map();
    constructor(capabilities) {
        this.capabilities = capabilities;
        for (const capability of capabilities) {
            if (this.byName.has(capability.name)) {
                throw new Error(`Duplicate MCP capability name: ${capability.name}`);
            }
            this.byName.set(capability.name, capability);
        }
    }
    get(name) {
        return this.byName.get(name);
    }
    list() {
        return this.capabilities;
    }
    get size() {
        return this.capabilities.length;
    }
}
