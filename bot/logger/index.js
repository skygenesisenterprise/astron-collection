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
} from "../../packages/discord-framework/src/index.js";
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

        const result = services.logging.ingestEnvelope(context.body);
        return context.json(result.status, {
          ok: result.ok,
          reason: result.reason,
          duplicate: result.duplicate ?? false,
          skipped: result.skipped,
        });
      },
    });
  } else {
    logger.warn("event ingest disabled: ASTRON_EVENT_SECRET is empty");
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
        services.logging.attachClient(client);
        services.start();
      },
    ],
  });

  logger.info("logger started", { version: env.version, guilds: runtime.health().guilds });
}

main().catch((error) => {
  logger.error("logger failed to start", { err: error });
  process.exitCode = 1;
});
