import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  createCommandRegistry,
  createComponentRegistry,
  createLogger,
  startBot,
  verifySignature,
} from "@astron-collection/discord-framework";
import { BOT, INTENTS, PARTIALS } from "./config/bot.js";
import { env } from "./config/env.js";
import { createServices } from "./services/index.js";

const botRoot = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger({ bot: BOT, level: env.logLevel });

async function main() {
  const registry = createCommandRegistry({ bot: BOT });
  const components = createComponentRegistry({ bot: BOT });
  const services = await createServices({ config: env, logger, registry });

  const healthRoutes = [];

  if (env.ingestSecret) {
    healthRoutes.push({
      method: "POST",
      path: env.ingestPath,
      handler: (request, context) => {
        const verification = verifySignature({
          secret: env.ingestSecret,
          timestamp: request.headers[TIMESTAMP_HEADER],
          body: context.rawBody,
          signature: request.headers[SIGNATURE_HEADER],
        });

        if (!verification.ok) {
          services.metrics.inc("ingest_rejected_total", { reason: verification.reason ?? "unauthorized" });
          return context.json(401, { error: "unauthorized", reason: verification.reason });
        }

        services
          .handleEvent(context.body)
          .then((count) => logger.debug("events dispatched", { count, type: context.body?.type }))
          .catch((error) => logger.warn("event dispatch failed", { err: error }));

        return context.json(202, { ok: true });
      },
    });
  } else {
    logger.warn("event ingestion disabled: ASTRON_EVENT_SECRET is empty");
  }

  const { runtime } = await startBot({
    bot: BOT,
    config: env,
    logger,
    registry,
    components,
    commandsDir: path.join(botRoot, "commands"),
    eventsDir: path.join(botRoot, "events"),
    intents: INTENTS,
    partials: PARTIALS,
    services,
    metrics: services.metrics,
    healthPort: env.healthPort,
    healthRoutes,
    onStart: [
      ({ client }) => {
        services.attachClient(client);
        services.start();
      },
    ],
  });

  logger.info("automations started", { version: env.version, guilds: runtime.health().guilds });
}

main().catch((error) => {
  logger.error("automations failed to start", { err: error });
  process.exitCode = 1;
});
