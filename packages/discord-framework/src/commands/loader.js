/**
 * Command and event discovery.
 *
 * The loader only ever walks the directory it is given: a bot's `commands/`
 * folder. There is no "extra directories" option and no fallback to another
 * bot, so a catalogue cannot leak between bots by configuration.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { adaptLegacyCommand } from "./contract.js";

const IGNORED_FILE = /^[._]/;

export async function discoverModuleFiles(dir, { extension = ".js", readdirImpl = readdir } = {}) {
  const entries = await readdirImpl(dir, { withFileTypes: true }).catch(() => null);
  if (!entries) return [];

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(extension) && !IGNORED_FILE.test(name))
    .sort();
}

/**
 * Load a bot's command catalogue into its registry.
 *
 * A broken module is reported and skipped: one bad command must not prevent the
 * rest of the catalogue from loading, and it must never crash the process.
 *
 * @returns {Promise<{loaded: string[], skipped: Array<{file: string, reason: string}>}>}
 */
export async function loadCommands({
  dir,
  registry,
  logger,
  category = "legacy",
  importModule = (file) => import(pathToFileURL(file).href),
  readdirImpl = readdir,
} = {}) {
  const files = await discoverModuleFiles(dir, { readdirImpl });
  const loaded = [];
  const skipped = [];

  for (const file of files) {
    try {
      const module = await importModule(path.join(dir, file));
      const command = adaptLegacyCommand(module, { bot: registry.bot, category, file });
      registry.register(command);
      loaded.push(command.name);
      logger?.debug("command loaded", { command: command.name, file });
    } catch (error) {
      skipped.push({ file, reason: error.message });
      logger?.warn("command skipped", {
        file,
        reason: error.message,
        code: error.code,
      });
    }
  }

  return { loaded, skipped };
}

/**
 * Load a bot's event modules.
 *
 * `interactionCreate` is owned by the framework router and is skipped on
 * purpose; a bot must not register a second handler for it.
 *
 * @returns {Promise<{registered: string[], skipped: Array<{file: string, reason: string}>}>}
 */
export async function loadEvents({
  dir,
  client,
  logger,
  bot,
  reservedEvents = ["interactionCreate", "error"],
  importModule = (file) => import(pathToFileURL(file).href),
  readdirImpl = readdir,
  removed = [],
} = {}) {
  const files = await discoverModuleFiles(dir, { readdirImpl });
  const registered = [];
  const skipped = [];
  const seen = new Set();

  for (const file of files) {
    try {
      const module = await importModule(path.join(dir, file));
      const name = module.name;
      const execute = module.execute;

      if (typeof name !== "string" || name === "") {
        skipped.push({ file, reason: "missing event name" });
        logger?.warn("event skipped", { file, reason: "missing event name" });
        continue;
      }

      if (typeof execute !== "function") {
        skipped.push({ file, reason: "missing execute handler" });
        logger?.warn("event skipped", { file, event: name, reason: "missing execute handler" });
        continue;
      }

      if (reservedEvents.includes(name)) {
        skipped.push({ file, reason: "event owned by the framework" });
        logger?.warn("event skipped", { file, event: name, reason: "event owned by the framework" });
        continue;
      }

      const key = `${module.once === true ? "once" : "on"}:${name}`;
      if (seen.has(key)) {
        skipped.push({ file, reason: "duplicate event handler" });
        logger?.warn("event skipped", { file, event: name, reason: "duplicate event handler" });
        continue;
      }
      seen.add(key);

      // Each handler is isolated: a throw is logged and the process survives.
      const listener = async (...args) => {
        try {
          await execute(...args);
        } catch (error) {
          logger?.error("event handler failed", { event: name, file, err: error });
        }
      };

      if (module.once === true) client.once(name, listener);
      else client.on(name, listener);

      const off = module.once === true ? () => {} : () => client.off(name, listener);
      removed.push(off);
      registered.push(name);
    } catch (error) {
      skipped.push({ file, reason: error.message });
      logger?.warn("event skipped", { file, reason: error.message, bot });
    }
  }

  return { registered, skipped };
}
