import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createCommandRegistry,
  createLogger,
  runCommandDeployment,
} from "@astron-collection/discord-framework";
import { BOT } from "./config/bot.js";
import { env } from "./config/env.js";

const botRoot = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger({ bot: BOT, level: env.logLevel });

async function main() {
  const result = await runCommandDeployment({
    bot: BOT,
    config: env,
    commandsDir: path.join(botRoot, "commands"),
    registry: createCommandRegistry({ bot: BOT }),
    logger,
  });

  const summary = `${result.count} command(s) — ${result.status} (scope: ${result.scope})`;
  logger.info("command deployment finished", { status: result.status, count: result.count });
  console.log(summary);
}

main().catch((error) => {
  logger.error("command deployment failed", { err: error });
  process.exitCode = 1;
});
