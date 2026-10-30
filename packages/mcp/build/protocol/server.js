import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { IdentityResolver } from "../adapters/identity.js";
import { NotployApi } from "../adapters/notployApi.js";
import { buildCatalog, CapabilityRegistry } from "../catalog/registry.js";
import { getConfig } from "../config.js";
import { ToolExecutor } from "../execution/executor.js";
import { ExecutionLimiter } from "../execution/limiter.js";
import { OperationStore } from "../execution/operations.js";
import { toMcpResponse } from "../execution/results.js";
import { AuditLog } from "../observability/audit.js";
import { createLogger, setLogLevel } from "../utils/logger.js";
import { MCP_SERVER_VERSION } from "../version.js";
import { toToolListEntry } from "./schemas.js";
const logger = createLogger("MCP-Server");
function registerCapability(server, capability, executor) {
    server.registerTool(capability.name, {
        title: capability.title,
        description: capability.description,
        inputSchema: capability.inputSchema,
        outputSchema: capability.outputSchema,
        annotations: capability.annotations,
    }, async (input) => {
        const result = await executor.execute(capability, input, {
            requestId: randomUUID(),
        });
        return toMcpResponse(result);
    });
}
/**
 * Builds the shared dependencies of one or more MCP server instances.
 *
 * HTTP transports create one `McpServer` per session but share these parts, so
 * the permission cache, limits, audit trail and operation store are common to
 * the whole process.
 */
export async function createServerParts(options = {}) {
    const config = options.config ?? getConfig();
    setLogLevel(config.logLevel);
    const api = options.api ?? new NotployApi(config);
    const operations = options.operations ??
        new OperationStore({
            ...(config.operationStorePath ? { path: config.operationStorePath } : {}),
            retentionMs: config.limits.operationRetentionMs,
        });
    await operations.init();
    await operations.markRunningAsInterrupted();
    const audit = options.audit ?? new AuditLog(config.auditLogPath);
    const identities = new IdentityResolver(api);
    const limiter = new ExecutionLimiter({
        maxRequestsPerMinute: config.limits.maxRequestsPerMinute,
        maxConcurrentRequests: config.limits.maxConcurrentRequests,
    });
    const executor = new ToolExecutor({
        config,
        api,
        identities,
        limiter,
        operations,
        audit,
    });
    const catalog = buildCatalog(config);
    const registry = new CapabilityRegistry(catalog.capabilities);
    return { config, catalog, registry, executor, operations, audit };
}
/** Creates an MCP protocol server bound to shared parts (one per transport). */
export function buildMcpServer(parts) {
    const server = new McpServer({ name: "notploy", version: MCP_SERVER_VERSION }, {
        instructions: "Notploy automation server. Start with the discovery capabilities, use read-only diagnostics before mutating anything, and poll get_operation_status after long-running actions.",
    });
    for (const capability of parts.registry.list()) {
        registerCapability(server, capability, parts.executor);
    }
    // Override the SDK's list handler so every input and output schema is served
    // as JSON Schema draft 2020-12 (required by Claude and several providers).
    const toolList = parts.registry.list().map(toToolListEntry);
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: toolList,
    }));
    logger.debug("MCP server instance ready", {
        version: MCP_SERVER_VERSION,
        tools: parts.registry.size,
    });
    return server;
}
/**
 * Creates one MCP server plus its catalog and execution pipeline.
 *
 * Tests can inject a config and an API port. The default path reads the
 * environment once, initializes the optional durable operation store and
 * detects operations interrupted by a previous restart.
 */
export async function createRuntime(options = {}) {
    const parts = await createServerParts(options);
    const server = buildMcpServer(parts);
    logger.info("MCP server ready", {
        version: MCP_SERVER_VERSION,
        mode: parts.catalog.summary.mode,
        tools: parts.registry.size,
        business: parts.catalog.summary.businessCount,
        advanced: parts.catalog.summary.advancedCount,
        environment: parts.config.environment,
    });
    return { ...parts, server };
}
export async function createServer(options = {}) {
    return buildMcpServer(await createServerParts(options));
}
export async function closeServerParts(parts) {
    await parts.operations.close();
    await parts.audit.close?.();
}
export async function closeRuntime(runtime) {
    await runtime.server.close().catch(() => undefined);
    await closeServerParts(runtime);
}
