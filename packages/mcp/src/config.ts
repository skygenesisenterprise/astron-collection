import type { ExecutionLimits } from "./contracts/context.js";
import {
  ADVANCED_PROFILES,
  type AdvancedProfile,
  CATALOG_MODES,
  type CatalogMode,
  ENVIRONMENTS,
  type Environment,
  type RiskLevel,
} from "./contracts/core.js";
import type { PolicyConfig } from "./contracts/policy.js";
import { registerSecret } from "./observability/secrets.js";
import { parseCustomHeaders } from "./utils/clientConfig.js";
import { DEFAULT_REDACTED_FIELDS } from "./utils/redactSensitive.js";

export interface HttpConfig {
  port: number;
  host: string;
  /** Bearer token required by every remote request when set. */
  token?: string;
  /** Explicit opt-in to an unauthenticated, loopback-only HTTP server. */
  allowUnauthenticated: boolean;
  sessionTtlMs: number;
  maxSessions: number;
  maxBodyBytes: number;
  /**
   * Public base URL of this MCP server (e.g. https://mcp.example.com).
   * Used for RFC 9728 protected-resource metadata and WWW-Authenticate.
   * When unset, relative metadata paths are advertised.
   */
  publicBaseUrl?: string;
  /**
   * OAuth authorization-server issuer trusted for the remote transport.
   * When unset, the server honestly reports bearer-only auth: no OAuth
   * discovery is faked. ChatGPT public listing requires a real issuer.
   */
  oauthIssuer?: string;
  /** Expected audience for OAuth access tokens (defaults to the resource URL). */
  oauthAudience?: string;
}

export interface LegacyToolSelection {
  preset?: string;
  enabledTags: string[];
  disabledTags: string[];
}

export interface AdvancedSelection {
  profile: AdvancedProfile;
  enabledTags: string[];
  disabledTags: string[];
  excludedOperations: string[];
}

export interface McpConfig {
  astronCollectionUrl: string;
  apiKey: string;
  customHeaders: Record<string, string>;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  redactEnv: boolean;
  redactFields: string[];
  environment: Environment;
  mode: CatalogMode;
  advanced: AdvancedSelection;
  legacySelection: LegacyToolSelection;
  policy: PolicyConfig;
  limits: ExecutionLimits;
  http: HttpConfig;
  operationStorePath?: string;
  auditLogPath?: string;
  logLevel: "error" | "warn" | "info" | "debug";
}

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RESULT_BYTES = 256 * 1024;

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  return fallback;
}

function parseInteger(
  name: string,
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `Environment variable ${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }
  return parsed;
}

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseChoice<T extends string>(
  name: string,
  value: string | undefined,
  choices: readonly T[],
  fallback: T,
): T {
  if (value === undefined || value.trim() === "") return fallback;
  const normalized = value.trim().toLowerCase() as T;
  if (!choices.includes(normalized)) {
    throw new Error(
      `Environment variable ${name} must be one of: ${choices.join(", ")} (received "${value}")`,
    );
  }
  return normalized;
}

/**
 * Validates the Astron Collection base URL.
 *
 * Credentials in the URL, a query string or a fragment are rejected: they
 * would leak into logs or change which endpoint is targeted without being
 * visible in the configuration. Only http(s) is accepted.
 */
export function validateAstronCollectionUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Environment variable ASTRON_COLLECTION_URL must be a valid absolute URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Environment variable ASTRON_COLLECTION_URL must use http:// or https://");
  }
  if (url.username || url.password) {
    throw new Error("Environment variable ASTRON_COLLECTION_URL must not contain credentials");
  }
  if (url.search || url.hash) {
    throw new Error("Environment variable ASTRON_COLLECTION_URL must not contain a query string or fragment");
  }

  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

function validateApiKey(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) {
    throw new Error("Environment variable ASTRON_COLLECTION_API_KEY is not defined");
  }
  if (value.length > 4096) {
    throw new Error("Environment variable ASTRON_COLLECTION_API_KEY is too long");
  }
  // Reject control characters explicitly: an API key must be a single printable token.
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control-character validation
  if (/[\s\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("Environment variable ASTRON_COLLECTION_API_KEY must not contain whitespace");
  }
  return value;
}

function loadPolicy(env: NodeJS.ProcessEnv): PolicyConfig {
  const maxAutomaticRisk = parseInteger(
    "ASTRON_COLLECTION_MCP_MAX_RISK",
    env.ASTRON_COLLECTION_MCP_MAX_RISK,
    1,
    0,
    3,
  ) as RiskLevel;

  const approvalToken = env.ASTRON_COLLECTION_MCP_APPROVAL_TOKEN?.trim() || undefined;
  if (approvalToken !== undefined && approvalToken.length < 16) {
    throw new Error(
      "Environment variable ASTRON_COLLECTION_MCP_APPROVAL_TOKEN must be at least 16 characters",
    );
  }

  return {
    maxAutomaticRisk,
    allowHighRiskWithApproval: parseBoolean(env.ASTRON_COLLECTION_MCP_ALLOW_HIGH_RISK, true),
    allowDestructive: parseBoolean(env.ASTRON_COLLECTION_MCP_ALLOW_DESTRUCTIVE, false),
    ...(approvalToken ? { approvalToken } : {}),
    blockedCapabilities: new Set(parseList(env.ASTRON_COLLECTION_MCP_BLOCKED_CAPABILITIES)),
  };
}

function loadLimits(env: NodeJS.ProcessEnv): ExecutionLimits {
  return {
    toolTimeoutMs: parseInteger(
      "ASTRON_COLLECTION_MCP_TIMEOUT_MS",
      env.ASTRON_COLLECTION_MCP_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      1_000,
      MAX_TIMEOUT_MS,
    ),
    maxResultBytes: parseInteger(
      "ASTRON_COLLECTION_MCP_MAX_RESULT_BYTES",
      env.ASTRON_COLLECTION_MCP_MAX_RESULT_BYTES,
      DEFAULT_MAX_RESULT_BYTES,
      1_024,
      8 * 1024 * 1024,
    ),
    maxRequestsPerMinute: parseInteger(
      "ASTRON_COLLECTION_MCP_RATE_LIMIT",
      env.ASTRON_COLLECTION_MCP_RATE_LIMIT,
      120,
      1,
      10_000,
    ),
    maxConcurrentRequests: parseInteger(
      "ASTRON_COLLECTION_MCP_MAX_CONCURRENCY",
      env.ASTRON_COLLECTION_MCP_MAX_CONCURRENCY,
      4,
      1,
      64,
    ),
    operationRetentionMs: parseInteger(
      "ASTRON_COLLECTION_MCP_OPERATION_RETENTION_MS",
      env.ASTRON_COLLECTION_MCP_OPERATION_RETENTION_MS,
      24 * 60 * 60 * 1000,
      60_000,
      30 * 24 * 60 * 60 * 1000,
    ),
    verificationTimeoutMs: parseInteger(
      "ASTRON_COLLECTION_MCP_VERIFICATION_TIMEOUT_MS",
      env.ASTRON_COLLECTION_MCP_VERIFICATION_TIMEOUT_MS,
      10 * 60 * 1000,
      5_000,
      60 * 60 * 1000,
    ),
    verificationIntervalMs: parseInteger(
      "ASTRON_COLLECTION_MCP_VERIFICATION_INTERVAL_MS",
      env.ASTRON_COLLECTION_MCP_VERIFICATION_INTERVAL_MS,
      5_000,
      500,
      60_000,
    ),
  };
}

function parseOptionalHttpUrl(name: string, value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid absolute URL`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Environment variable ${name} must use http:// or https://`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      `Environment variable ${name} must not contain credentials, query string or fragment`,
    );
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

function loadHttp(env: NodeJS.ProcessEnv): HttpConfig {
  const token = env.ASTRON_COLLECTION_MCP_HTTP_TOKEN?.trim() || undefined;
  if (token !== undefined && token.length < 16) {
    throw new Error("Environment variable ASTRON_COLLECTION_MCP_HTTP_TOKEN must be at least 16 characters");
  }

  return {
    port: parseInteger("MCP_PORT", env.MCP_PORT ?? env.PORT, 3000, 1, 65_535),
    host: env.ASTRON_COLLECTION_MCP_HTTP_HOST?.trim() || "127.0.0.1",
    ...(token ? { token } : {}),
    allowUnauthenticated: parseBoolean(env.ASTRON_COLLECTION_MCP_HTTP_ALLOW_UNAUTHENTICATED, false),
    sessionTtlMs: parseInteger(
      "ASTRON_COLLECTION_MCP_HTTP_SESSION_TTL_MS",
      env.ASTRON_COLLECTION_MCP_HTTP_SESSION_TTL_MS,
      30 * 60 * 1000,
      60_000,
      24 * 60 * 60 * 1000,
    ),
    maxSessions: parseInteger(
      "ASTRON_COLLECTION_MCP_HTTP_MAX_SESSIONS",
      env.ASTRON_COLLECTION_MCP_HTTP_MAX_SESSIONS,
      50,
      1,
      1_000,
    ),
    maxBodyBytes: parseInteger(
      "ASTRON_COLLECTION_MCP_HTTP_MAX_BODY_BYTES",
      env.ASTRON_COLLECTION_MCP_HTTP_MAX_BODY_BYTES,
      1024 * 1024,
      1_024,
      16 * 1024 * 1024,
    ),
    ...(parseOptionalHttpUrl("ASTRON_COLLECTION_MCP_PUBLIC_BASE_URL", env.ASTRON_COLLECTION_MCP_PUBLIC_BASE_URL)
      ? {
          publicBaseUrl: parseOptionalHttpUrl(
            "ASTRON_COLLECTION_MCP_PUBLIC_BASE_URL",
            env.ASTRON_COLLECTION_MCP_PUBLIC_BASE_URL,
          ) as string,
        }
      : {}),
    ...(parseOptionalHttpUrl("ASTRON_COLLECTION_MCP_OAUTH_ISSUER", env.ASTRON_COLLECTION_MCP_OAUTH_ISSUER)
      ? {
          oauthIssuer: parseOptionalHttpUrl(
            "ASTRON_COLLECTION_MCP_OAUTH_ISSUER",
            env.ASTRON_COLLECTION_MCP_OAUTH_ISSUER,
          ) as string,
        }
      : {}),
    ...(env.ASTRON_COLLECTION_MCP_OAUTH_AUDIENCE?.trim() || undefined
      ? { oauthAudience: (env.ASTRON_COLLECTION_MCP_OAUTH_AUDIENCE as string).trim() }
      : {}),
  };
}

function loadMode(env: NodeJS.ProcessEnv): {
  mode: CatalogMode;
  legacySelection: LegacyToolSelection;
  advanced: AdvancedSelection;
} {
  const legacySelection: LegacyToolSelection = {
    ...(env.ASTRON_COLLECTION_TOOL_PRESET ? { preset: env.ASTRON_COLLECTION_TOOL_PRESET.trim() } : {}),
    enabledTags: parseList(env.ASTRON_COLLECTION_ENABLED_TAGS),
    disabledTags: parseList(env.ASTRON_COLLECTION_DISABLED_TAGS),
  };

  const hasLegacySelection =
    legacySelection.preset !== undefined ||
    legacySelection.enabledTags.length > 0 ||
    legacySelection.disabledTags.length > 0;

  const explicitMode = env.ASTRON_COLLECTION_MCP_MODE?.trim();
  const mode = explicitMode
    ? parseChoice("ASTRON_COLLECTION_MCP_MODE", explicitMode, CATALOG_MODES, "business")
    : hasLegacySelection
      ? "advanced"
      : "business";

  // Legacy presets exposed every generated operation, so they keep the `full`
  // profile. An explicit advanced mode defaults to read-only.
  const profile = parseChoice(
    "ASTRON_COLLECTION_MCP_ADVANCED_PROFILE",
    env.ASTRON_COLLECTION_MCP_ADVANCED_PROFILE,
    ADVANCED_PROFILES,
    hasLegacySelection ? "full" : "read-only",
  );

  return {
    mode,
    legacySelection,
    advanced: {
      profile,
      enabledTags: parseList(env.ASTRON_COLLECTION_MCP_ADVANCED_TAGS),
      disabledTags: parseList(env.ASTRON_COLLECTION_MCP_ADVANCED_DISABLED_TAGS),
      excludedOperations: parseList(env.ASTRON_COLLECTION_MCP_ADVANCED_EXCLUDE),
    },
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): McpConfig {
  const rawUrl = env.ASTRON_COLLECTION_URL;
  if (!rawUrl) {
    throw new Error("Environment variable ASTRON_COLLECTION_URL is not defined");
  }

  const parsedFields = parseList(env.ASTRON_COLLECTION_REDACT_FIELDS);
  const { mode, legacySelection, advanced } = loadMode(env);

  const operationStorePath = env.ASTRON_COLLECTION_MCP_OPERATION_STORE?.trim();
  const auditLogPath = env.ASTRON_COLLECTION_MCP_AUDIT_LOG?.trim();

  const config: McpConfig = {
    astronCollectionUrl: validateAstronCollectionUrl(rawUrl),
    apiKey: validateApiKey(env.ASTRON_COLLECTION_API_KEY),
    customHeaders: parseCustomHeaders(env.ASTRON_COLLECTION_CUSTOM_HEADERS),
    timeoutMs: parseInteger(
      "ASTRON_COLLECTION_TIMEOUT",
      env.ASTRON_COLLECTION_TIMEOUT,
      DEFAULT_TIMEOUT_MS,
      1_000,
      MAX_TIMEOUT_MS,
    ),
    retryAttempts: parseInteger("ASTRON_COLLECTION_RETRY_ATTEMPTS", env.ASTRON_COLLECTION_RETRY_ATTEMPTS, 2, 0, 5),
    retryDelayMs: parseInteger("ASTRON_COLLECTION_RETRY_DELAY", env.ASTRON_COLLECTION_RETRY_DELAY, 1_000, 100, 30_000),
    redactEnv: parseBoolean(env.ASTRON_COLLECTION_REDACT_ENV, true),
    redactFields: parsedFields.length > 0 ? parsedFields : DEFAULT_REDACTED_FIELDS,
    environment: parseChoice(
      "ASTRON_COLLECTION_MCP_ENVIRONMENT",
      env.ASTRON_COLLECTION_MCP_ENVIRONMENT,
      ENVIRONMENTS,
      "self",
    ),
    mode,
    advanced,
    legacySelection,
    policy: loadPolicy(env),
    limits: loadLimits(env),
    http: loadHttp(env),
    ...(operationStorePath ? { operationStorePath } : {}),
    ...(auditLogPath ? { auditLogPath } : {}),
    logLevel: parseChoice(
      "ASTRON_COLLECTION_MCP_LOG_LEVEL",
      env.ASTRON_COLLECTION_MCP_LOG_LEVEL,
      ["error", "warn", "info", "debug"] as const,
      "info",
    ),
  };

  // Register every credential known to this process so logs, errors, audit
  // records and tool outputs can redact literal occurrences defensively.
  registerSecret(config.apiKey);
  registerSecret(config.policy.approvalToken);
  registerSecret(config.http.token);
  for (const value of Object.values(config.customHeaders)) registerSecret(value);

  return config;
}

let cachedConfig: McpConfig | undefined;

export function getConfig(): McpConfig {
  cachedConfig ??= loadConfig();
  return cachedConfig;
}

/** Test helper: clears the memoized configuration. */
export function resetConfig(): void {
  cachedConfig = undefined;
}
