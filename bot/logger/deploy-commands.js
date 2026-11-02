import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertDiscordEnv,
  createCommandRegistry,
  createLogger,
  createRestClient,
  deployCommands,
  loadCommands,
} from "../../packages/discord-framework/src/index.js";
import { env } from "./config/env.js";

const BOT = "logger";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = createLogger({ bot: BOT, level: env.logLevel });

async function main() {
  assertDiscordEnv(env);

  const args = new Set(process.argv.slice(2));
  const registry = createCommandRegistry({ bot: BOT });

  await loadCommands({
    dir: path.join(__dirname, "commands"),
    registry,
    logger,
  });

  const result = await deployCommands({
    bot: BOT,
    config: env,
    commands: registry.list(),
    rest: await createRestClient({
      token: env.token,
      loadDiscord: () => import("discord.js"),
    }),
    logger,
    statePath: path.join(__dirname, "data", "command-deployment.json"),
    force: args.has("--force"),
    dryRun: args.has("--dry-run"),
  });

  console.log(`${result.count} commande(s) — ${result.status} (scope: ${result.scope})`);
}

main().catch((error) => {
  logger.error("command deployment failed", { err: error });
  process.exit(1);
});
