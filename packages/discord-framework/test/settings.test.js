import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  botCredentialVariables,
  defineConfigSchema,
  loadConfig,
  runtimeVariables,
} from "../src/settings/schema.js";
import { createSettingsStore } from "../src/settings/store.js";
import { createMemoryDatabase } from "../src/storage/index.js";

const schema = defineConfigSchema({
  bot: "guild",
  variables: [
    {
      key: "token",
      env: ["ASTRON_GUILD_DISCORD_TOKEN", "DISCORD_TOKEN"],
      required: true,
      secret: true,
    },
    { key: "logLevel", env: ["ASTRON_LOG_LEVEL"], type: "enum", values: ["debug", "info"], default: "info" },
    { key: "healthPort", env: ["ASTRON_HEALTH_PORT"], type: "integer", default: 8080, min: 1024, max: 65535 },
    { key: "featureEnabled", env: ["ASTRON_FEATURE"], type: "boolean", default: false },
  ],
});

describe("configuration schema", () => {
  it("allows bots to extend shared event environment aliases without duplicate keys", () => {
    const configSchema = defineConfigSchema({
      bot: "automations",
      variables: runtimeVariables({
        eventUrlEnv: ["ASTRON_EVENT_URL", "ASTRON_LOGGER_EVENT_URL"],
        eventSecretEnv: ["ASTRON_OUTBOUND_SECRET", "ASTRON_EVENT_SECRET"],
      }),
    });
    const config = loadConfig({
      schema: configSchema,
      env: {
        ASTRON_LOGGER_EVENT_URL: "https://logger.example/ingest/events",
        ASTRON_OUTBOUND_SECRET: "outbound-secret",
      },
    });

    assert.equal(config.values.eventUrl, "https://logger.example/ingest/events");
    assert.equal(config.values.eventSecret, "outbound-secret");
    assert.equal(config.ok, true);
  });

  it("loads typed values from the bot-specific variables", () => {
    const config = loadConfig({
      schema,
      env: {
        ASTRON_GUILD_DISCORD_TOKEN: "bot-token",
        ASTRON_LOG_LEVEL: "debug",
        ASTRON_HEALTH_PORT: "9100",
        ASTRON_FEATURE: "yes",
      },
    });

    assert.equal(config.ok, true);
    assert.equal(config.values.token, "bot-token");
    assert.equal(config.values.logLevel, "debug");
    assert.equal(config.values.healthPort, 9100);
    assert.equal(config.values.featureEnabled, true);
    assert.equal(config.sources.token, "ASTRON_GUILD_DISCORD_TOKEN");
  });

  it("reports a missing required variable by its environment name", () => {
    const config = loadConfig({ schema, env: {} });

    assert.equal(config.ok, false);
    assert.deepEqual(config.missing, ["ASTRON_GUILD_DISCORD_TOKEN"]);
  });

  it("accepts DISCORD_APPLICATION_ID as the Discord application credential", () => {
    const configSchema = defineConfigSchema({
      bot: "automations",
      variables: botCredentialVariables("automations"),
    });
    const config = loadConfig({
      schema: configSchema,
      env: {
        DISCORD_TOKEN: "bot-token",
        DISCORD_APPLICATION_ID: "123456789012345678",
      },
    });

    assert.equal(config.ok, true);
    assert.equal(config.values.clientId, "123456789012345678");
  });

  it("falls back to a default and never echoes a secret", () => {
    const config = loadConfig({
      schema,
      env: { DISCORD_TOKEN: "shared-token", ASTRON_HEALTH_PORT: "not-a-port" },
    });

    assert.equal(config.values.healthPort, 8080);
    assert.equal(config.errors.length, 1);
    assert.equal(config.warnings[0].variable, "ASTRON_HEALTH_PORT");
    assert.equal(config.sources.token, "DISCORD_TOKEN");
    assert.equal(config.redacted().token, "[redacted]");
    assert.equal(JSON.stringify(config.redacted()).includes("shared-token"), false);
  });

  it("rejects an unknown enum value", () => {
    const config = loadConfig({ schema, env: { DISCORD_TOKEN: "t", ASTRON_LOG_LEVEL: "verbose" } });
    assert.equal(config.values.logLevel, "info");
    assert.ok(config.errors.some((error) => error.includes("expected one of")));
  });
});

describe("guild settings store", () => {
  const defaults = {
    welcome: { enabled: false, channelId: null },
    levelUp: true,
    theme: "brand",
  };

  function build() {
    const db = createMemoryDatabase();
    const store = createSettingsStore({
      db,
      bot: "guild",
      defaults,
      validators: {
        levelUp: (value) =>
          typeof value === "boolean" ? true : { ok: false, error: "must be a boolean" },
      },
    });
    return { db, store };
  }

  it("isolates settings per guild", () => {
    const { db, store } = build();

    store.set("guild-a", "welcome", { enabled: true, channelId: "123" });

    assert.deepEqual(store.get("guild-a", "welcome"), { enabled: true, channelId: "123" });
    assert.deepEqual(store.get("guild-b", "welcome"), defaults.welcome);
    assert.deepEqual(store.getAll("guild-b"), defaults);
    assert.deepEqual(store.list(), ["guild-a"]);

    db.close();
  });

  it("never mutates the declared defaults", () => {
    const { db, store } = build();
    const values = store.getAll("guild-a");
    values.welcome.enabled = true;

    assert.equal(store.get("guild-a", "welcome").enabled, false);
    assert.equal(defaults.welcome.enabled, false);

    db.close();
  });

  it("validates declared keys and values", () => {
    const { db, store } = build();

    assert.throws(() => store.set("guild-a", "unknown", true), /Unknown setting/);
    assert.throws(() => store.set("guild-a", "levelUp", "yes"), /must be a boolean/);
    assert.throws(() => store.get("", "levelUp"), /guild id is required/i);

    db.close();
  });

  it("updates several keys atomically and resets to defaults", () => {
    const { db, store } = build();

    store.update("guild-a", { levelUp: false, theme: "dark" });
    assert.deepEqual(store.getAll("guild-a"), { ...defaults, levelUp: false, theme: "dark" });

    store.reset("guild-a");
    assert.deepEqual(store.getAll("guild-a"), defaults);

    db.close();
  });
});
