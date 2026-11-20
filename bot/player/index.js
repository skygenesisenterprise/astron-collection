import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createCommandRegistry,
  createComponentRegistry,
  createLogger,
  startBot,
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
    onStart: [() => services.start()],
  });

  logger.info("player started", { version: env.version, guilds: runtime.health().guilds });
}

main().catch((error) => {
  logger.error("player failed to start", { err: error });
  process.exitCode = 1;
});
