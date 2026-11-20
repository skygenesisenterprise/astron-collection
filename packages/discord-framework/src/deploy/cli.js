/** Command deployment CLI shared by the six bots. */

import path from "node:path";

import { loadCommands } from "../commands/loader.js";
import { assertDiscordEnv } from "../config/env.js";
import { createRestClient, deployCommands } from "./commands.js";

/**
 * @param {object} options
 * @param {string} options.bot
 * @param {object} options.config Parsed bot configuration.
 * @param {string} options.commandsDir This bot's catalogue directory.
 * @param {object} options.registry Empty registry owned by the bot.
 * @param {object} options.logger
 * @param {string[]} [options.argv]
 * @param {string} [options.statePath]
 * @param {object} [options.rest] Pre-built REST client (tests).
 * @param {Function} [options.loadDiscord]
 */
export async function runCommandDeployment({
  bot,
  config,
  commandsDir,
  registry,
  logger,
  argv = process.argv.slice(2),
  statePath = path.join(commandsDir, "..", "data", "command-deployment.json"),
  rest,
  loadDiscord = () => import("discord.js"),
} = {}) {
  assertDiscordEnv(config);

  const args = new Set(argv);
  const dryRun = args.has("--dry-run");

  const loaded = await loadCommands({ dir: commandsDir, registry, logger });
  if (loaded.skipped.length > 0) {
    logger?.warn?.("some commands were skipped", { skipped: loaded.skipped });
  }

  const needsRest = config.commandScope !== "none" && !dryRun;
  const client =
    rest ??
    (needsRest
      ? await createRestClient({ token: config.token, loadDiscord })
      : undefined);

  const result = await deployCommands({
    bot,
    config,
    commands: registry.list(),
    rest: client,
    logger,
    statePath,
    force: args.has("--force"),
    dryRun,
  });

  return { ...result, loaded: loaded.loaded, skipped: loaded.skipped };
}
