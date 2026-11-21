/**
 * Declarative configuration schema.
 *
 * A bot describes its variables once: name, environment aliases, type, default
 * and requirement. Parsing is pure and returns every warning at once; an invalid
 * optional value falls back to its default and never echoes the raw value of a
 * secret.
 */

import { parseBoolean } from "../config/env.js";
import { ERROR_CODES, ConfigurationError } from "../errors.js";
import { LOG_LEVELS } from "../logger.js";

const DEFAULT_HEALTH_PORT = 8080;

/** `guild-center` -> `GUILD_CENTER`. */
export function toEnvPrefix(bot) {
  return (
    String(bot ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "BOT"
  );
}

export function defineConfigSchema({ bot, variables = [] } = {}) {
  if (!bot) throw new Error("defineConfigSchema requires the bot name.");
  if (!Array.isArray(variables) || variables.length === 0) {
    throw new Error("defineConfigSchema requires at least one variable.");
  }

  const seen = new Set();
  const normalized = variables.map((variable) => {
    if (!variable?.key || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(variable.key)) {
      throw new Error(`Invalid configuration key '${variable?.key}'.`);
    }
    if (seen.has(variable.key)) throw new Error(`Duplicate configuration key '${variable.key}'.`);
    seen.add(variable.key);

    const env = [variable.env ?? variable.key].flat().filter(Boolean);
    if (env.length === 0) throw new Error(`Configuration '${variable.key}' has no env variable.`);

    const type = variable.type ?? "string";
    if (!["string", "integer", "boolean", "enum"].includes(type)) {
      throw new Error(`Configuration '${variable.key}' has unknown type '${type}'.`);
    }
    if (type === "enum" && (!Array.isArray(variable.values) || variable.values.length === 0)) {
      throw new Error(`Configuration '${variable.key}' is an enum without values.`);
    }

    return Object.freeze({ type: "string", required: false, secret: false, ...variable, env: Object.freeze(env) });
  });

  return Object.freeze({ bot, variables: Object.freeze(normalized) });
}

function coerce(value, variable, warn) {
  if (variable.type === "boolean") {
    const normalized = String(value).trim().toLowerCase();
    if (!["1", "true", "yes", "on", "0", "false", "no", "off"].includes(normalized)) {
      warn(`expected a boolean`);
      return { ok: false };
    }
    return { ok: true, value: parseBoolean(normalized, Boolean(variable.default)) };
  }

  if (variable.type === "integer") {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      warn("expected an integer");
      return { ok: false };
    }
    if (variable.min !== undefined && parsed < variable.min) {
      warn(`must be >= ${variable.min}`);
      return { ok: false };
    }
    if (variable.max !== undefined && parsed > variable.max) {
      warn(`must be <= ${variable.max}`);
      return { ok: false };
    }
    return { ok: true, value: parsed };
  }

  if (variable.type === "enum") {
    const normalized = String(value).trim().toLowerCase();
    if (!variable.values.includes(normalized)) {
      warn(`expected one of ${variable.values.join(", ")}`);
      return { ok: false };
    }
    return { ok: true, value: normalized };
  }

  return { ok: true, value: String(value).trim() };
}

/**
 * @param {object} options
 * @param {object} options.schema Schema from defineConfigSchema.
 * @param {Record<string, string|undefined>} [options.env]
 * @param {object} [options.logger]
 */
export function loadConfig({ schema, env = process.env, logger } = {}) {
  if (!schema) throw new Error("loadConfig requires a schema.");

  const values = {};
  const warnings = [];
  const errors = [];
  const missing = [];
  const sources = {};

  for (const variable of schema.variables) {
    let raw;
    let source = null;
    for (const key of variable.env) {
      const candidate = env[key];
      if (typeof candidate === "string" && candidate.trim() !== "") {
        raw = candidate;
        source = key;
        break;
      }
    }

    if (raw === undefined) {
      if (variable.required) missing.push(variable.env[0]);
      if (variable.default !== undefined) values[variable.key] = structuredClone(variable.default);
      continue;
    }

    sources[variable.key] = source;
    const result = coerce(raw, variable, (detail) => {
      const message = `${variable.env[0]}: ${detail}`;
      errors.push(message);
      warnings.push({ variable: variable.env[0], message: detail });
      logger?.warn?.("invalid configuration value", {
        variable: variable.env[0],
        detail,
      });
    });

    if (result.ok) values[variable.key] = result.value;
    else if (variable.default !== undefined) values[variable.key] = structuredClone(variable.default);
  }

  const secretKeys = new Set(schema.variables.filter((variable) => variable.secret).map((v) => v.key));

  const result = {
    bot: schema.bot,
    ok: missing.length === 0 && errors.length === 0,
    values: Object.freeze(values),
    warnings: Object.freeze(warnings),
    errors: Object.freeze(errors),
    missing: Object.freeze(missing),
    sources: Object.freeze(sources),
    secretKeys,
    get: (key) => values[key],
    redacted: () =>
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          secretKeys.has(key) ? "[redacted]" : value,
        ]),
      ),
  };

  return result;
}

/** Throw when a bot cannot start, with the missing variables named. */
export function assertConfigured(config) {
  if (!config?.ok) {
    throw new ConfigurationError(
      `Missing or invalid configuration: ${[...(config?.missing ?? []), ...(config?.errors ?? [])].join(", ")}`,
      {
        code: ERROR_CODES.CONFIGURATION_INVALID,
        meta: { bot: config?.bot, missing: config?.missing },
      },
    );
  }
  return config;
}

/** Credentials are scoped to one bot; the shared historical names are a fallback. */
export function botCredentialVariables(bot) {
  const prefix = toEnvPrefix(bot);
  return [
    {
      key: "token",
      env: [`ASTRON_${prefix}_DISCORD_TOKEN`, "DISCORD_TOKEN"],
      required: true,
      secret: true,
      description: "This bot's Discord application token.",
    },
    {
      key: "clientId",
      env: [
        `ASTRON_${prefix}_DISCORD_CLIENT_ID`,
        `ASTRON_${prefix}_DISCORD_APPLICATION_ID`,
        "DISCORD_CLIENT_ID",
        "DISCORD_APPLICATION_ID",
      ],
      required: true,
      description: "This bot's Discord application id.",
    },
  ];
}

/** Variables every bot needs, independent of its domain. */
export function runtimeVariables({
  eventUrlEnv = ["ASTRON_EVENT_URL"],
  eventSecretEnv = ["ASTRON_EVENT_SECRET"],
} = {}) {
  return [
    {
      key: "logLevel",
      env: ["ASTRON_LOG_LEVEL", "LOG_LEVEL"],
      type: "enum",
      values: LOG_LEVELS,
      default: "info",
    },
    {
      key: "healthPort",
      env: ["ASTRON_HEALTH_PORT"],
      type: "integer",
      default: DEFAULT_HEALTH_PORT,
      min: 1,
      max: 65535,
    },
    { key: "environment", env: ["NODE_ENV"], default: "development" },
    { key: "version", env: ["APP_VERSION"], default: "2.0.0" },
    { key: "commandScope", env: ["ASTRON_COMMAND_SCOPE"], type: "enum", values: ["global", "guild", "none"], default: "global" },
    { key: "commandGuildId", env: ["ASTRON_COMMAND_GUILD_ID"], default: "" },
    { key: "dataDir", env: ["ASTRON_DATA_DIR"], default: "" },
    { key: "eventUrl", env: eventUrlEnv, default: "" },
    {
      key: "eventSecret",
      env: eventSecretEnv,
      default: "",
      secret: true,
      description: "HMAC secret shared with the event consumer.",
    },
    { key: "eventSource", env: ["ASTRON_EVENT_SOURCE"], default: "" },
  ];
}

export { DEFAULT_HEALTH_PORT };
