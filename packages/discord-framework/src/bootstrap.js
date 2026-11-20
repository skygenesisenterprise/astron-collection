/**
 * Bot bootstrap.
 *
 * Composes the two things every bot process needs and nothing domain-specific:
 * the Discord runtime and the HTTP health/metrics server. The bot still creates
 * its own registry, services, catalogue and components; this module only orders
 * startup and shutdown so all six bots behave identically under SIGTERM.
 */

import { createBotRuntime, keepAlive } from "./lifecycle.js";
import { createHealthServer } from "./observability/health.js";

/**
 * @param {object} options
 * @param {string} options.bot
 * @param {object} options.config Parsed configuration (`isConfigured`, token…).
 * @param {object} options.logger
 * @param {object} options.registry Bot-owned command registry.
 * @param {object} [options.components]
 * @param {string} [options.commandsDir]
 * @param {string} [options.eventsDir]
 * @param {string[]} [options.intents]
 * @param {string[]} [options.partials]
 * @param {object} [options.voice]
 * @param {Record<string, object>} [options.services]
 * @param {object} [options.metrics]
 * @param {number} [options.healthPort]
 * @param {string} [options.healthHost]
 * @param {Array<{method?: string, path: string, handler: Function}>} [options.healthRoutes]
 * @param {Array<Function>} [options.onStart]
 * @param {Array<Function>} [options.onStop]
 * @param {boolean} [options.signalHandlers]
 * @param {boolean} [options.keepAliveWhenUnconfigured]
 */
export async function startBot({
  bot,
  config,
  logger,
  registry,
  components,
  commandsDir,
  eventsDir,
  intents,
  partials,
  voice,
  services = {},
  metrics,
  healthPort = 8080,
  healthHost,
  healthRoutes = [],
  onStart = [],
  onStop = [],
  client,
  loadDiscord,
  signalHandlers = true,
  keepAliveWhenUnconfigured = true,
} = {}) {
  if (!bot) throw new Error("startBot requires the bot name.");
  if (!registry) throw new Error("startBot requires the bot's command registry.");

  let runtime = null;

  const health = createHealthServer({
    bot,
    port: healthPort,
    host: healthHost,
    metrics,
    routes: healthRoutes,
    logger,
    health: () => {
      const snapshot = runtime?.health?.() ?? { status: "starting", ready: false };
      return { ...snapshot, metrics: undefined };
    },
  });

  const address = await health.start();

  const serviceStops = Object.values(services)
    .filter((service) => service && typeof service.close === "function")
    .map((service) => () => service.close());

  try {
    runtime = await createBotRuntime({
      bot,
      config,
      logger,
      client,
      loadDiscord,
      registry,
      components,
      commandsDir,
      eventsDir,
      intents,
      partials,
      voice,
      services,
      signalHandlers,
      onStart,
      onStop: [...serviceStops, () => health.stop(), ...onStop],
    });

    const result = await runtime.start();

    if (!result.ready && keepAliveWhenUnconfigured) {
      logger?.error?.("bot is waiting for a valid configuration", { status: result.status });
      keepAlive({ logger });
    }

    logger?.info?.("health endpoint ready", { url: address.url });

    return { runtime, health, address };
  } catch (error) {
    await health.stop().catch(() => {});
    throw error;
  }
}
