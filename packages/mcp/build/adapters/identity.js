import { ApiError } from "./notployApi.js";
const DEFAULT_TTL_MS = 30_000;
function asRecord(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    return value;
}
function parsePermissions(value) {
    const record = asRecord(value);
    if (!record)
        return undefined;
    const permissions = {};
    for (const [resource, actions] of Object.entries(record)) {
        const actionsRecord = asRecord(actions);
        if (!actionsRecord)
            return undefined;
        permissions[resource] = {};
        for (const [action, allowed] of Object.entries(actionsRecord)) {
            permissions[resource][action] = allowed === true;
        }
    }
    return permissions;
}
/**
 * Resolves the identity behind the configured API key and its effective
 * permissions.
 *
 * The result is cached briefly to avoid two extra API calls per tool call.
 * Failures are never cached and are surfaced to the caller, which fails closed.
 */
export class IdentityResolver {
    api;
    ttlMs;
    cached;
    inflight;
    constructor(api, ttlMs = DEFAULT_TTL_MS) {
        this.api = api;
        this.ttlMs = ttlMs;
    }
    async resolve(signal) {
        if (this.cached && Date.now() - this.cached.resolvedAt < this.ttlMs) {
            return this.cached;
        }
        this.inflight ??= this.fetch(signal).finally(() => {
            this.inflight = undefined;
        });
        return this.inflight;
    }
    invalidate() {
        this.cached = undefined;
    }
    async fetch(signal) {
        const common = {
            method: "GET",
            idempotent: true,
            ...(signal ? { signal } : {}),
        };
        const session = await this.api.request({
            ...common,
            path: "/user.session",
        });
        const userId = session?.user?.id;
        const organizationId = session?.session?.activeOrganizationId;
        if (typeof userId !== "string" || userId === "" || typeof organizationId !== "string") {
            throw new ApiError({
                message: "The configured Notploy API key is not valid or has no active organization. Check NOTPLOY_API_KEY.",
                code: "unauthenticated",
            });
        }
        const permissions = parsePermissions(await this.api.request({ ...common, path: "/user.getPermissions" }));
        if (!permissions) {
            throw new ApiError({
                message: "The Notploy API returned an unexpected permission set; refusing to execute",
                code: "internal_error",
            });
        }
        const resolved = {
            identity: { id: userId, organizationId },
            permissions,
            resolvedAt: Date.now(),
        };
        this.cached = resolved;
        return resolved;
    }
}
