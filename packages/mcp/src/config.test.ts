import { describe, expect, it } from "vitest";
import { loadConfig, validateAstronCollectionUrl } from "./config.js";

const BASE_ENV = {
  ASTRON_COLLECTION_URL: "https://astron-collection.example.com",
  ASTRON_COLLECTION_API_KEY: "test-api-key-12345678",
} as NodeJS.ProcessEnv;

function env(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return { ...BASE_ENV, ...overrides } as NodeJS.ProcessEnv;
}

describe("validateAstronCollectionUrl", () => {
  it("accepts http(s) origins and removes trailing slashes", () => {
    expect(validateAstronCollectionUrl("https://astron-collection.example.com/")).toBe("https://astron-collection.example.com");
    expect(validateAstronCollectionUrl("http://localhost:3000/astron-collection/")).toBe(
      "http://localhost:3000/astron-collection",
    );
  });

  it("rejects non-http protocols", () => {
    expect(() => validateAstronCollectionUrl("ftp://astron-collection.example.com")).toThrow(/http/);
    expect(() => validateAstronCollectionUrl("file:///etc/passwd")).toThrow(/http/);
  });

  it("rejects embedded credentials", () => {
    expect(() => validateAstronCollectionUrl("https://user:pass@astron-collection.example.com")).toThrow(
      /credentials/,
    );
  });

  it("rejects query strings and fragments", () => {
    expect(() => validateAstronCollectionUrl("https://astron-collection.example.com?x=1")).toThrow(/query/);
    expect(() => validateAstronCollectionUrl("https://astron-collection.example.com#frag")).toThrow(/fragment/);
  });

  it("rejects relative and malformed URLs", () => {
    expect(() => validateAstronCollectionUrl("astron-collection.example.com")).toThrow(/absolute URL/);
  });
});

describe("loadConfig", () => {
  it("defaults to the business catalog in the self environment", () => {
    const config = loadConfig(env());
    expect(config.mode).toBe("business");
    expect(config.environment).toBe("self");
    expect(config.policy.maxAutomaticRisk).toBe(1);
    expect(config.policy.allowHighRiskWithApproval).toBe(true);
    expect(config.policy.allowDestructive).toBe(false);
    expect(config.redactEnv).toBe(true);
    expect(config.http.host).toBe("127.0.0.1");
    expect(config.http.allowUnauthenticated).toBe(false);
  });

  it("requires an API key", () => {
    expect(() => loadConfig({ ASTRON_COLLECTION_URL: "https://astron-collection.example.com" })).toThrow(
      /ASTRON_COLLECTION_API_KEY/,
    );
  });

  it("rejects API keys with whitespace", () => {
    expect(() => loadConfig(env({ ASTRON_COLLECTION_API_KEY: "key with space" }))).toThrow(/whitespace/);
  });

  it("makes advanced mode opt-in and read-only by default", () => {
    const config = loadConfig(env({ ASTRON_COLLECTION_MCP_MODE: "advanced" }));
    expect(config.mode).toBe("advanced");
    expect(config.advanced.profile).toBe("read-only");
  });

  it("honors an explicit advanced profile", () => {
    const config = loadConfig(
      env({ ASTRON_COLLECTION_MCP_MODE: "advanced", ASTRON_COLLECTION_MCP_ADVANCED_PROFILE: "full" }),
    );
    expect(config.advanced.profile).toBe("full");
  });

  it("maps legacy tool selection to advanced/full for compatibility", () => {
    const config = loadConfig(env({ ASTRON_COLLECTION_TOOL_PRESET: "minimal" }));
    expect(config.mode).toBe("advanced");
    expect(config.advanced.profile).toBe("full");
    expect(config.legacySelection.preset).toBe("minimal");
  });

  it("lets an explicit mode override a legacy selection", () => {
    const config = loadConfig(env({ ASTRON_COLLECTION_MCP_MODE: "business", ASTRON_COLLECTION_TOOL_PRESET: "deploy" }));
    expect(config.mode).toBe("business");
  });

  it("parses advanced tag filters, blocked capabilities and limits", () => {
    const config = loadConfig(
      env({
        ASTRON_COLLECTION_MCP_MODE: "advanced",
        ASTRON_COLLECTION_MCP_ADVANCED_TAGS: "project, Application",
        ASTRON_COLLECTION_MCP_ADVANCED_DISABLED_TAGS: "domain",
        ASTRON_COLLECTION_MCP_BLOCKED_CAPABILITIES: "delete_application,restart_application",
        ASTRON_COLLECTION_MCP_RATE_LIMIT: "5",
        ASTRON_COLLECTION_MCP_MAX_CONCURRENCY: "2",
      }),
    );
    expect(config.advanced.enabledTags).toEqual(["project", "Application"]);
    expect(config.advanced.disabledTags).toEqual(["domain"]);
    expect(config.policy.blockedCapabilities).toEqual(
      new Set(["delete_application", "restart_application"]),
    );
    expect(config.limits.maxRequestsPerMinute).toBe(5);
    expect(config.limits.maxConcurrentRequests).toBe(2);
  });

  it("rejects an invalid environment, mode or profile", () => {
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_ENVIRONMENT: "onprem" }))).toThrow(
      /ASTRON_COLLECTION_MCP_ENVIRONMENT/,
    );
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_MODE: "everything" }))).toThrow(/ASTRON_COLLECTION_MCP_MODE/);
    expect(() =>
      loadConfig(env({ ASTRON_COLLECTION_MCP_MODE: "advanced", ASTRON_COLLECTION_MCP_ADVANCED_PROFILE: "safe" })),
    ).toThrow(/ASTRON_COLLECTION_MCP_ADVANCED_PROFILE/);
  });

  it("rejects out-of-range limits", () => {
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_TIMEOUT_MS: "10" }))).toThrow(
      /ASTRON_COLLECTION_MCP_TIMEOUT_MS/,
    );
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_MAX_RESULT_BYTES: "1" }))).toThrow(
      /ASTRON_COLLECTION_MCP_MAX_RESULT_BYTES/,
    );
  });

  it("rejects short approval and HTTP tokens", () => {
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_APPROVAL_TOKEN: "short" }))).toThrow(/at least 16/);
    expect(() => loadConfig(env({ ASTRON_COLLECTION_MCP_HTTP_TOKEN: "short" }))).toThrow(/at least 16/);
  });

  it("validates custom headers through the shared parser", () => {
    expect(() =>
      loadConfig(
        env({ ASTRON_COLLECTION_CUSTOM_HEADERS: JSON.stringify({ Authorization: "Bearer override" }) }),
      ),
    ).toThrow(/reserved/);
  });

  it("parses console environment without granting anything by itself", () => {
    const config = loadConfig(env({ ASTRON_COLLECTION_MCP_ENVIRONMENT: "console" }));
    expect(config.environment).toBe("console");
    expect(config.policy.maxAutomaticRisk).toBe(1);
  });

  it("parses optional OAuth discovery URLs and rejects invalid ones", () => {
    const config = loadConfig(
      env({
        ASTRON_COLLECTION_MCP_PUBLIC_BASE_URL: "https://mcp.example.com/",
        ASTRON_COLLECTION_MCP_OAUTH_ISSUER: "https://auth.example.com",
        ASTRON_COLLECTION_MCP_OAUTH_AUDIENCE: "astron-collection-mcp",
      }),
    );
    expect(config.http.publicBaseUrl).toBe("https://mcp.example.com");
    expect(config.http.oauthIssuer).toBe("https://auth.example.com");
    expect(config.http.oauthAudience).toBe("astron-collection-mcp");
    expect(() =>
      loadConfig(env({ ASTRON_COLLECTION_MCP_OAUTH_ISSUER: "https://user:pass@auth.example.com" })),
    ).toThrow(/ASTRON_COLLECTION_MCP_OAUTH_ISSUER/);
  });
});
