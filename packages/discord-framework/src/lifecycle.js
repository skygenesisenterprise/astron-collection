/**
 * Bot lifecycle: client creation, bootstrap, retries, shutdown, health.
 *
 * The framework owns the lifecycle so every bot behaves the same way under
 * startup failure, Discord disconnects and SIGTERM. What the bot owns is the
 * catalogue (commands/events), its business policy and its services.
 */

import { ConfigurationError } from "./errors.js";
import { createInteractionRouter } from "./interactions/router.js";
import { loadCommands, loadEvents } from "./commands/loader.js";

const RETRYABLE_NETWORK_CODES = new Set([
  "EAI_AGAIN",
  "ENOTFOUND",
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EPIPE",
]);

export function isRetryableNetworkError(error) {
  const code = error?.code ?? error?.cause?.code;
  return RETRYABLE_NETWORK_CODES.has(code);
}

/**
 * Resolve string intent/partial names against discord.js, so a bot declares its
 * intents as data instead of wiring the client itself.
 */
export async function createDiscordClient({
  intents = ["Guilds"],
  partials = [],
  loadDiscord = () => import("discord.js"),
} = {}) {
  const { Client, GatewayIntentBits, Partials } = await loadDiscord();

  const resolvedIntents = intents.map((intent) => {
    const value = GatewayIntentBits[intent];
    if (value === undefined) throw new ConfigurationError(`Unknown gateway intent '${intent}'.`);
    return value;
  });

  const resolvedPartials = partials.map((partial) => {
    const value = Partials[partial];
    if (value === undefined) throw new ConfigurationError(`Unknown partial '${partial}'.`);
    return value;
  });

  return new Client({ intents: resolvedIntents, partials: resolvedPartials });
}

function sleepDefault(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} options
 * @param {string} options.bot
 * @param {object} options.config Parsed bot configuration.
 * @param {object} options.logger Structured logger.
 * @param {any} [options.client] Pre-built client (tests, custom wiring).
 * @param {string} [options.commandsDir] Bot catalogue directory.
 * @param {string} [options.eventsDir] Bot events directory.
 * @param {object} [options.registry] Command registry (created when omitted).
 * @param {object} [options.components] Component registry.
 * @param {string[]} [options.intents]
 * @param {string[]} [options.partials]
 * @param {object} [options.voice] Voice presence manager (framework or bot-provided).
 * @param {(input: object) => unknown} [options.policy] Bot business policy.
 * @param {object} [options.services] Services handed to handlers.
 * @param {boolean} [options.signalHandlers] Install SIGTERM/SIGINT handlers.
 * @param {number} [options.loginRetries]
 * @param {number} [options.baseDelayMs]
 * @param {number} [options.maxDelayMs]
 * @param {() => number} [options.clock]
 * @param {object} [options.processRef]
 * @param {() => unknown} [options.loadDiscord]
 */
export async function createBotRuntime({
  bot,
  config,
  logger,
  client,
  commandsDir,
  eventsDir,
  registry,
  components,
  intents,
  partials,
  voice,
  policy,
  services = {},
  signalHandlers = true,
  loginRetries = 10,
  baseDelayMs = 5_000,
  maxDelayMs = 300_000,
  sleep = sleepDefault,
  clock = () => Date.now(),
  processRef = process,
  loadDiscord,
  respond,
} = {}) {
  if (!bot) throw new Error("createBotRuntime requires the bot name.");
  if (!logger) throw new Error("createBotRuntime requires a logger.");
  if (!registry) throw new Error("createBotRuntime requires a command registry.");

  const discordClient =
    client ?? (await createDiscordClient({ intents, partials, loadDiscord }));

  const router = createInteractionRouter({
    bot,
    commands: registry,
    components,
    logger,
    policy,
    services,
    respond,
  });

  const cleanups = [];
  let status = "created";
  let readyAt = null;
  let startedAt = null;
  let stopping = null;

  const onInteraction = (interaction) => {
    void router.handle(interaction);
  };

  const onError = (error) => logger.error("discord client error", { err: error });
  const onWarn = (message) => logger.warn("discord client warning", { detail: message });
  const onShardError = (error, shardId) =>
    logger.error("discord shard error", { err: error, shard: shardId });

  async function onReady() {
    readyAt = clock();
    logger.info("bot ready", {
      user: discordClient.user?.tag ?? "unknown",
      guilds: discordClient.guilds?.cache?.size ?? 0,
    });

    if (voice) {
      // Presence is best-effort: a voice failure never blocks business features.
      try {
        await voice.start();
      } catch (error) {
        logger.warn("voice presence unavailable", { err: error });
      }
    }

    logger.info("bot health", health());
  }

  function health() {
    return {
      bot,
      status,
      ready: status === "ready",
      uptimeMs: startedAt ? clock() - startedAt : 0,
      readyAt,
      guilds: discordClient.guilds?.cache?.size ?? 0,
      commands: registry.size,
      voice: voice?.health?.() ?? { status: "disabled" },
    };
  }

  function installProcessHandlers() {
    const shutdown = (signal) => {
      logger.info("shutdown signal received", { signal });
      void stop().finally(() => processRef.exit(0));
    };

    const onSigterm = () => shutdown("SIGTERM");
    const onSigint = () => shutdown("SIGINT");
    const onUnhandledRejection = (reason) => {
      // A rejected handler must not take the whole bot down.
      logger.error("unhandled rejection", { err: reason });
    };
    const onUncaughtException = (error) => {
      logger.error("uncaught exception, shutting down", { err: error });
      void stop().finally(() => processRef.exit(1));
    };

    processRef.on("SIGTERM", onSigterm);
    processRef.on("SIGINT", onSigint);
    processRef.on("unhandledRejection", onUnhandledRejection);
    processRef.on("uncaughtException", onUncaughtException);

    cleanups.push(() => {
      processRef.off("SIGTERM", onSigterm);
      processRef.off("SIGINT", onSigint);
      processRef.off("unhandledRejection", onUnhandledRejection);
      processRef.off("uncaughtException", onUncaughtException);
    });
  }

  async function start() {
    if (status === "ready" || status === "starting") return health();

    startedAt = clock();
    status = "starting";

    for (const warning of config?.warnings ?? []) {
      logger.warn("configuration warning", { variable: warning.variable, detail: warning.message });
    }

    if (!config?.isConfigured) {
      status = "unconfigured";
      logger.error("bot is not configured", {
        missing: config?.missingRequiredVars ?? [],
      });
      return health();
    }

    if (commandsDir) {
      const result = await loadCommands({ dir: commandsDir, registry, logger });
      if (result.skipped.length) {
        logger.warn("commands skipped", { skipped: result.skipped, loaded: result.loaded.length });
      }
    }

    if (eventsDir) {
      await loadEvents({ dir: eventsDir, client: discordClient, logger, bot, removed: cleanups });
    }

    discordClient.on("interactionCreate", onInteraction);
    discordClient.once("clientReady", onReady);
    discordClient.on("error", onError);
    discordClient.on("shardError", onShardError);
    discordClient.on("warn", onWarn);

    cleanups.push(() => {
      discordClient.off("interactionCreate", onInteraction);
      discordClient.off("clientReady", onReady);
      discordClient.off("error", onError);
      discordClient.off("shardError", onShardError);
      discordClient.off("warn", onWarn);
    });

    if (signalHandlers) installProcessHandlers();

    for (let attempt = 1; attempt <= loginRetries; attempt += 1) {
      try {
        await discordClient.login(config.token);
        status = "ready";
        return health();
      } catch (error) {
        if (!isRetryableNetworkError(error) || attempt === loginRetries) {
          status = "failed";
          logger.error("bot login failed", { attempt, retries: loginRetries, err: error });
          throw error;
        }

        const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
        logger.warn("network error during login, retrying", {
          attempt,
          retries: loginRetries,
          delayMs: delay,
          code: error.code,
        });
        await sleep(delay);
      }
    }

    status = "failed";
    return health();
  }

  function stop() {
    if (stopping) return stopping;

    stopping = (async () => {
      status = "stopping";
      logger.info("bot stopping");

      for (const cleanup of cleanups.splice(0)) {
        try {
          cleanup();
        } catch (error) {
          logger.debug("cleanup failed", { err: error });
        }
      }

      if (voice) {
        try {
          await voice.stop();
        } catch (error) {
          logger.warn("voice shutdown failed", { err: error });
        }
      }

      try {
        await discordClient.destroy();
      } catch (error) {
        logger.debug("client destroy failed", { err: error });
      }

      status = "stopped";
      logger.info("bot stopped");
      return health();
    })();

    return stopping;
  }

  return {
    bot,
    client: discordClient,
    registry,
    router,
    voice,
    start,
    stop,
    health,
    get status() {
      return status;
    },
  };
}

/** Keep an unconfigured process alive and observable instead of crash-looping. */
export function keepAlive({ logger, intervalMs = 60_000, clock = () => Date.now() } = {}) {
  let ticks = 0;
  // Deliberately referenced: this timer is what keeps an unconfigured bot
  // process alive and observable instead of exiting and restart-looping.
  const timer = setInterval(() => {
    ticks += 1;
    logger?.debug("idle (bot unconfigured)", { ticks, at: clock() });
  }, intervalMs);
  return { stop: () => clearInterval(timer), get ticks() { return ticks; } };
}
