/**
 * Environment contract for every Astron bot.
 *
 * Parsing is pure: the bot reads its own `.env` files (it owns `dotenv`) and
 * hands `process.env` to `parseBotConfig`. Invalid optional values fall back to
 * a documented default and produce a warning that never contains the raw value
 * of a secret.
 */

import { ConfigurationError } from "../errors.js";
import { isLogLevel, LOG_LEVELS } from "../logger.js";
import {
  OFFICIAL_GUILD_ID,
  OFFICIAL_PRESENCE_CHANNEL_ID,
  resolveVoicePresenceConfig,
} from "./official.js";

export const COMMAND_SCOPES = Object.freeze(["global", "guild", "none"]);
export const DEFAULT_COMMAND_SCOPE = "global";

export function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function readString(source, keys, fallback = "") {
  return resolveString(source, keys).value || fallback;
}

function resolveString(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") {
      return { value: value.trim(), source: key };
    }
  }
  return { value: "", source: null };
}

/**
 * Env prefix of a bot: `main` -> `MAIN`, `guild-center` -> `GUILD_CENTER`.
 * Used to scope credentials and secrets to a single bot.
 */
export function toEnvPrefix(bot) {
  return (
    String(bot ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "BOT"
  );
}

/** Per-bot credential variables, with the shared historical variables as fallback. */
export function credentialEnvKeys(bot) {
  const prefix = toEnvPrefix(bot);
  return {
    token: [`ASTRON_${prefix}_DISCORD_TOKEN`, "DISCORD_TOKEN"],
    clientId: [`ASTRON_${prefix}_DISCORD_CLIENT_ID`, "DISCORD_CLIENT_ID"],
  };
}

/**
 * @param {NodeJS.ProcessEnv|Record<string, string|undefined>} [source]
 * @param {object} [options]
 * @param {string} options.bot Bot name, used for logs and deployment state.
 * @param {string[]} [options.requiredVars] Overrides the required variable names.
 */
export function parseBotConfig(source = process.env, { bot = "unknown", requiredVars } = {}) {
  const warnings = [];
  const warn = (variable, message) => warnings.push({ variable, message });

  const keys = credentialEnvKeys(bot);
  const token = resolveString(source, keys.token);
  const clientId = resolveString(source, keys.clientId);
  const required = requiredVars ?? ["DISCORD_TOKEN", "DISCORD_CLIENT_ID"];
  const missingRequiredVars = required.filter((key) => {
    if (key === "DISCORD_TOKEN") return token.value === "";
    if (key === "DISCORD_CLIENT_ID") return clientId.value === "";
    return readString(source, [key]) === "";
  });

  // Shipping two bots with the same credentials is a configuration mistake that
  // is otherwise invisible until one application's commands overwrite the
  // other's. Say it once, naming the variable that scopes them to this bot.
  if (token.source === "DISCORD_TOKEN") {
    warn(
      keys.token[0],
      "using the shared DISCORD_TOKEN; set the bot-specific variable so each bot has its own token",
    );
  }
  if (clientId.source === "DISCORD_CLIENT_ID") {
    warn(
      keys.clientId[0],
      "using the shared DISCORD_CLIENT_ID; each bot needs its own Discord application",
    );
  }

  let commandScope = readString(
    source,
    ["ASTRON_COMMAND_SCOPE", "DISCORD_COMMAND_SCOPE"],
    DEFAULT_COMMAND_SCOPE,
  ).toLowerCase();

  if (!COMMAND_SCOPES.includes(commandScope)) {
    warn("ASTRON_COMMAND_SCOPE", `unknown scope; expected ${COMMAND_SCOPES.join(", ")}`);
    commandScope = DEFAULT_COMMAND_SCOPE;
  }

  const commandGuildId = readString(source, ["ASTRON_COMMAND_GUILD_ID", "DISCORD_COMMAND_GUILD_ID"]);

  if (commandScope === "guild" && commandGuildId === "") {
    warn("ASTRON_COMMAND_GUILD_ID", "guild scope selected without a guild id; deployment will be skipped");
  }

  const logLevel = readString(source, ["ASTRON_LOG_LEVEL", "LOG_LEVEL"], "info").toLowerCase();
  if (!isLogLevel(logLevel) || logLevel === "silent") {
    warn("ASTRON_LOG_LEVEL", `unknown level; expected ${LOG_LEVELS.join(", ")}`);
  }

  const voicePresenceEnabled = parseBoolean(source.ASTRON_VOICE_PRESENCE_ENABLED, true);

  const voice = {
    enabled: voicePresenceEnabled,
    officialGuildId: readString(source, ["ASTRON_OFFICIAL_GUILD_ID"]),
    presenceChannelId: readString(
      source,
      ["ASTRON_PRESENCE_VOICE_CHANNEL_ID"],
      OFFICIAL_PRESENCE_CHANNEL_ID,
    ),
  };

  const config = {
    bot,
    token: token.value,
    clientId: clientId.value,
    tokenEnvVar: token.source,
    clientIdEnvVar: clientId.source,
    usesSharedCredentials: token.source === "DISCORD_TOKEN" || clientId.source === "DISCORD_CLIENT_ID",
    environment: readString(source, ["NODE_ENV"], "development"),
    version: readString(source, ["APP_VERSION"], "1.1.0"),
    commitSha: readString(source, ["GIT_COMMIT_SHA", "COMMIT_SHA"], "unknown"),
    buildDate: readString(source, ["BUILD_DATE"], "unknown"),
    logLevel: isLogLevel(logLevel) && logLevel !== "silent" ? logLevel : "info",
    welcomeDmEnabled: parseBoolean(source.DISCORD_WELCOME_DM_ENABLED, true),
    announceDeployments: parseBoolean(source.DISCORD_ANNOUNCE_DEPLOYMENTS, true),
    levelChannelId: readString(source, ["DISCORD_LEVEL_CHANNEL_ID"]),
    agentsRoleId: readString(source, ["DISCORD_ROLE_AGENTS_ID"]),
    commandScope,
    commandGuildId,
    voice,
    voicePresence: resolveVoicePresenceConfig({
      enabled: voicePresenceEnabled,
      officialGuildId: voice.officialGuildId,
      presenceChannelId: voice.presenceChannelId,
    }),
    missingRequiredVars,
    isConfigured: missingRequiredVars.length === 0,
    warnings,
  };

  if (config.voicePresence.reason && voicePresenceEnabled) {
    warn("ASTRON_VOICE_PRESENCE_ENABLED", `voice presence disabled: ${config.voicePresence.reason}`);
  }


  return Object.freeze(config);
}

export function assertDiscordEnv(config) {
  if (!config?.isConfigured) {
    throw new ConfigurationError(
      `Missing required environment variables: ${(config?.missingRequiredVars ?? []).join(", ")}`,
      {
        code: "CONFIGURATION_INVALID",
        meta: { bot: config?.bot, missing: config?.missingRequiredVars },
      },
    );
  }
  return config;
}

export {
  OFFICIAL_GUILD_ID,
  OFFICIAL_PRESENCE_CHANNEL_ID,
  resolveVoicePresenceConfig,
};
