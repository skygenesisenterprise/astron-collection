import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  OFFICIAL_GUILD_ID,
  OFFICIAL_PRESENCE_CHANNEL_ID,
  assertDiscordEnv,
  credentialEnvKeys,
  parseBoolean,
  parseBotConfig,
  toEnvPrefix,
} from "../src/config/env.js";
import { ConfigurationError, normalizeError, userMessageFor, AstronError } from "../src/errors.js";
import { createLogger, redact, scrubString } from "../src/logger.js";
import { BOT, GUILD_ID, PRESENCE_CHANNEL_ID, collectLogs } from "./helpers.js";

describe("bot configuration", () => {
  it("reports missing required variables", () => {
    const config = parseBotConfig({}, { bot: BOT });

    assert.equal(config.isConfigured, false);
    assert.deepEqual(config.missingRequiredVars, ["DISCORD_TOKEN", "DISCORD_CLIENT_ID"]);
    assert.throws(() => assertDiscordEnv(config), ConfigurationError);
  });

  it("reads credentials scoped to the bot, before the shared ones", () => {
    const config = parseBotConfig(
      {
        ASTRON_MAIN_DISCORD_TOKEN: "main-token",
        ASTRON_MAIN_DISCORD_CLIENT_ID: "111111111111111111",
        DISCORD_TOKEN: "shared-token",
        DISCORD_CLIENT_ID: "999999999999999999",
      },
      { bot: "main" },
    );

    assert.equal(config.token, "main-token");
    assert.equal(config.clientId, "111111111111111111");
    assert.equal(config.tokenEnvVar, "ASTRON_MAIN_DISCORD_TOKEN");
    assert.equal(config.usesSharedCredentials, false);
    assert.equal(config.warnings.length, 0);
  });

  it("falls back to the shared credentials and says to scope them", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "shared-token", DISCORD_CLIENT_ID: "123456789012345678" },
      { bot: "protect" },
    );

    assert.equal(config.token, "shared-token");
    assert.equal(config.usesSharedCredentials, true);
    assert.deepEqual(
      config.warnings.map((warning) => warning.variable).sort(),
      ["ASTRON_PROTECT_DISCORD_CLIENT_ID", "ASTRON_PROTECT_DISCORD_TOKEN"].sort(),
    );
  });

  it("derives the credential variables from the bot name", () => {
    assert.equal(toEnvPrefix("main"), "MAIN");
    assert.equal(toEnvPrefix("guild-center"), "GUILD_CENTER");
    assert.deepEqual(credentialEnvKeys("guild-center").token, [
      "ASTRON_GUILD_CENTER_DISCORD_TOKEN",
      "DISCORD_TOKEN",
    ]);

    const config = parseBotConfig(
      {
        ASTRON_GUILD_CENTER_DISCORD_TOKEN: "guild-token",
        ASTRON_GUILD_CENTER_DISCORD_CLIENT_ID: "222222222222222222",
      },
      { bot: "guild-center" },
    );

    assert.equal(config.isConfigured, true);
    assert.equal(config.token, "guild-token");
  });

  it("parses a complete configuration", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "token", DISCORD_CLIENT_ID: "123456789012345678" },
      { bot: BOT },
    );

    assert.equal(config.isConfigured, true);
    assert.equal(config.bot, BOT);
    assert.equal(config.commandScope, "global");
    assert.equal(config.logLevel, "info");
    assert.equal(config.voicePresence.enabled, true);
    assert.equal(config.voicePresence.guildId, OFFICIAL_GUILD_ID);
    assert.equal(config.voicePresence.guildIdSource, "official");
  });

  it("accepts an explicit official guild", () => {
    const config = parseBotConfig(
      {
        DISCORD_TOKEN: "token",
        DISCORD_CLIENT_ID: "123456789012345678",
        ASTRON_OFFICIAL_GUILD_ID: GUILD_ID,
      },
      { bot: BOT },
    );

    assert.equal(config.voice.presenceChannelId, OFFICIAL_PRESENCE_CHANNEL_ID);
    assert.equal(config.voicePresence.enabled, true);
    assert.equal(config.voicePresence.guildId, GUILD_ID);
    assert.equal(config.voicePresence.channelId, PRESENCE_CHANNEL_ID);
  });

  it("can disable voice presence by environment", () => {
    const config = parseBotConfig(
      {
        DISCORD_TOKEN: "token",
        DISCORD_CLIENT_ID: "1",
        ASTRON_OFFICIAL_GUILD_ID: GUILD_ID,
        ASTRON_VOICE_PRESENCE_ENABLED: "false",
      },
      { bot: BOT },
    );

    assert.equal(config.voice.enabled, false);
    assert.equal(config.voicePresence.enabled, false);
    assert.equal(config.voicePresence.reason, "disabled");
  });

  it("falls back on an unknown command scope and warns", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "token", DISCORD_CLIENT_ID: "1", ASTRON_COMMAND_SCOPE: "everywhere" },
      { bot: BOT },
    );

    assert.equal(config.commandScope, "global");
    assert.ok(config.warnings.some((warning) => warning.variable === "ASTRON_COMMAND_SCOPE"));
  });

  it("warns when guild scope has no guild id", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "token", DISCORD_CLIENT_ID: "1", ASTRON_COMMAND_SCOPE: "guild" },
      { bot: BOT },
    );

    assert.equal(config.commandScope, "guild");
    assert.ok(config.warnings.some((warning) => warning.variable === "ASTRON_COMMAND_GUILD_ID"));
  });

  it("accepts the legacy DISCORD_COMMAND_SCOPE variable", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "token", DISCORD_CLIENT_ID: "1", DISCORD_COMMAND_SCOPE: "none" },
      { bot: BOT },
    );
    assert.equal(config.commandScope, "none");
  });

  it("parses booleans leniently", () => {
    assert.equal(parseBoolean("TRUE", false), true);
    assert.equal(parseBoolean("0", true), false);
    assert.equal(parseBoolean("maybe", true), true);
    assert.equal(parseBoolean(undefined, false), false);
  });

  it("falls back on an unknown log level", () => {
    const config = parseBotConfig(
      { DISCORD_TOKEN: "token", DISCORD_CLIENT_ID: "1", ASTRON_LOG_LEVEL: "verbose" },
      { bot: BOT },
    );

    assert.equal(config.logLevel, "info");
    assert.ok(config.warnings.some((warning) => warning.variable === "ASTRON_LOG_LEVEL"));
  });
});

describe("structured logging", () => {
  it("stamps bot, severity and context on every record", () => {
    const { logger, records } = collectLogs();

    logger.info("ready", { guilds: 2 });

    assert.equal(records.length, 1);
    assert.equal(records[0].bot, BOT);
    assert.equal(records[0].level, "info");
    assert.equal(records[0].msg, "ready");
    assert.equal(records[0].guilds, 2);
    assert.equal(records[0].ts, "2026-01-01T00:00:00.000Z");
  });

  it("redacts secret keys at any depth", () => {
    const { logger, records } = collectLogs();

    logger.error("failure", {
      token: "abc",
      nested: { password: "p", authorization: "Bearer x", safe: "visible" },
    });

    assert.equal(records[0].token, "[redacted]");
    assert.equal(records[0].nested.password, "[redacted]");
    assert.equal(records[0].nested.authorization, "[redacted]");
    assert.equal(records[0].nested.safe, "visible");
  });

  it("masks token-shaped strings and error messages", () => {
    const token = "MTIzNDU2Nzg5MDEyMzQ1Njc4.GaBcDe.abcdefghijklmnopqrstuvwxyz12";
    assert.equal(scrubString(token).includes("GaBcDe"), false);

    const error = new Error(`login failed with ${token}`);
    const { logger, records } = collectLogs();
    logger.error("failed", { err: error });

    assert.equal(JSON.stringify(records[0]).includes("GaBcDe"), false);
  });

  it("serializes errors without leaking its cause chain raw", () => {
    const error = new Error("outer", { cause: new Error("inner") });
    const serialized = redact(error);

    assert.equal(serialized.name, "Error");
    assert.equal(serialized.message, "outer");
    assert.equal(serialized.cause.message, "inner");
  });

  it("respects the configured level", () => {
    const records = [];
    const logger = createLogger({ bot: BOT, level: "warn", sink: (record) => records.push(record) });

    logger.debug("noise");
    logger.info("noise");
    logger.warn("kept");

    assert.deepEqual(records.map((record) => record.msg), ["kept"]);
    assert.equal(logger.isEnabled("debug"), false);
    assert.equal(logger.isEnabled("error"), true);
  });

  it("adds child context", () => {
    const { logger, records } = collectLogs();
    logger.child({ service: "moderation" }).warn("denied");

    assert.equal(records[0].service, "moderation");
  });
});

describe("error normalization", () => {
  it("keeps expected refusals distinguishable", () => {
    const error = new AstronError("nope", { code: "X", expected: true, userMessage: "Refusé." });
    const normalized = normalizeError(error);

    assert.equal(normalized.expected, true);
    assert.equal(normalized.code, "X");
    assert.equal(userMessageFor(error), "Refusé.");
  });

  it("never exposes an unexpected error message to users", () => {
    const error = new Error("database exploded at 10.0.0.1:5432");
    assert.equal(userMessageFor(error), "Une erreur est survenue pendant l'exécution de la commande.");
  });
});
