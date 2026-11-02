import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createCommandRegistry } from "../src/commands/registry.js";
import { ConfigurationError } from "../src/errors.js";
import {
  createBotRuntime,
  createDiscordClient,
  isRetryableNetworkError,
  keepAlive,
} from "../src/lifecycle.js";
import { BOT, collectLogs, fakeClient, tick } from "./helpers.js";

const configured = {
  bot: BOT,
  isConfigured: true,
  token: "bot-token",
  clientId: "app-1",
  warnings: [],
  missingRequiredVars: [],
};

async function buildRuntime({ config = configured, client = fakeClient(), voice, ...rest } = {}) {
  const { logger, records } = collectLogs();
  const runtime = await createBotRuntime({
    bot: BOT,
    config,
    logger,
    client,
    registry: createCommandRegistry({ bot: BOT }),
    signalHandlers: false,
    ...rest,
    voice,
  });
  return { runtime, logger, records, client };
}

describe("client creation", () => {
  it("resolves intent and partial names", async () => {
    class FakeClient {
      constructor(options) {
        this.options = options;
      }
    }

    const client = await createDiscordClient({
      intents: ["Guilds", "GuildVoiceStates"],
      partials: ["Channel"],
      loadDiscord: async () => ({
        Client: FakeClient,
        GatewayIntentBits: { Guilds: 1, GuildVoiceStates: 4 },
        Partials: { Channel: 2 },
      }),
    });

    assert.deepEqual(client.options.intents, [1, 4]);
    assert.deepEqual(client.options.partials, [2]);
  });

  it("rejects an unknown intent instead of silently ignoring it", async () => {
    await assert.rejects(
      createDiscordClient({
        intents: ["NotAnIntent"],
        loadDiscord: async () => ({ Client: class {}, GatewayIntentBits: {}, Partials: {} }),
      }),
      ConfigurationError,
    );
  });

  it("only retries network errors", () => {
    assert.equal(isRetryableNetworkError({ code: "EAI_AGAIN" }), true);
    assert.equal(isRetryableNetworkError({ code: "TOKEN_INVALID" }), false);
    assert.equal(isRetryableNetworkError(new Error("boom")), false);
  });
});

describe("bot runtime", () => {
  it("does not log in when the configuration is incomplete", async () => {
    const client = fakeClient();
    let loggedIn = false;
    client.login = async () => {
      loggedIn = true;
    };

    const { runtime, records } = await buildRuntime({
      client,
      config: { ...configured, isConfigured: false, missingRequiredVars: ["DISCORD_TOKEN"] },
    });

    const health = await runtime.start();

    assert.equal(loggedIn, false);
    assert.equal(health.status, "unconfigured");
    assert.ok(records.some((record) => record.msg === "bot is not configured"));
  });

  it("boots to ready and reports health", async () => {
    const { runtime } = await buildRuntime();

    const health = await runtime.start();

    assert.equal(health.status, "ready");
    assert.equal(health.ready, true);
    assert.equal(health.bot, BOT);
    assert.equal(health.commands, 0);
  });

  it("retries a network failure with exponential delay", async () => {
    let calls = 0;
    const client = fakeClient();
    client.login = async () => {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error("dns failure"), { code: "EAI_AGAIN" });
      client.emit("clientReady", client);
    };
    const delays = [];

    const { runtime } = await buildRuntime({
      client,
      baseDelayMs: 100,
      sleep: async (ms) => delays.push(ms),
    });

    await runtime.start();

    assert.equal(calls, 2);
    assert.deepEqual(delays, [100]);
  });

  it("fails fast on a non-retryable login error", async () => {
    const client = fakeClient();
    client.login = async () => {
      throw Object.assign(new Error("invalid token"), { code: "TOKEN_INVALID" });
    };

    const { runtime } = await buildRuntime({ client });

    await assert.rejects(runtime.start(), /invalid token/);
    assert.equal(runtime.status, "failed");
  });

  it("starts the voice presence once the client is ready", async () => {
    let started = 0;
    const voice = {
      start: async () => {
        started += 1;
      },
      stop: async () => {},
      health: () => ({ status: "connected" }),
    };

    const { runtime } = await buildRuntime({ voice });
    await runtime.start();
    await tick();

    assert.equal(started, 1);
    assert.equal(runtime.health().voice.status, "connected");
  });

  it("survives a failing voice presence", async () => {
    const voice = {
      start: async () => {
        throw new Error("voice down");
      },
      stop: async () => {},
      health: () => ({ status: "failed" }),
    };

    const { runtime } = await buildRuntime({ voice });
    await runtime.start();
    await tick();

    assert.equal(runtime.status, "ready");
  });

  it("stops once, removes its listeners and destroys the client", async () => {
    const { runtime, client } = await buildRuntime();
    let destroyed = 0;
    client.destroy = async () => {
      destroyed += 1;
    };

    await runtime.start();
    assert.equal(client.listenerCount("interactionCreate"), 1);

    const [first, second] = await Promise.all([runtime.stop(), runtime.stop()]);

    assert.equal(destroyed, 1);
    assert.equal(client.listenerCount("interactionCreate"), 0);
    assert.equal(first.status, "stopped");
    assert.equal(second.status, "stopped");
  });

  it("routes interactions to its own catalogue only", async () => {
    const registry = createCommandRegistry({ bot: BOT });
    const { logger } = collectLogs();
    const client = fakeClient();

    const runtime = await createBotRuntime({
      bot: BOT,
      config: configured,
      logger,
      client,
      registry,
      signalHandlers: false,
    });

    await runtime.start();
    const interaction = {
      isChatInputCommand: () => true,
      commandName: "other-bot-command",
      reply: async () => {},
      replied: false,
    };

    const result = await runtime.router.handle(interaction);

    assert.equal(result.status, "unknown");
  });

  it("keeps an unconfigured process observable", async () => {
    const { logger } = collectLogs();
    const idle = keepAlive({ logger, intervalMs: 2 });

    await tick(10);
    idle.stop();

    assert.ok(idle.ticks >= 1);
  });
});
