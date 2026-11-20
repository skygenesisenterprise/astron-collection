/**
 * Command and event discovery.
 *
 * The loader only ever walks the directory it is given: a bot's `commands/` or
 * `events/` folder. There is no "extra directories" option and no fallback to
 * another bot, so a catalogue cannot leak between bots by configuration.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { adaptLegacyCommand, defineCommand } from "./contract.js";

const IGNORED_FILE = /^[._]/;

/** A framework command exports `defineCommand({...})` as its default export. */
function isFrameworkCommand(module) {
  const candidate = module?.default;
  return Boolean(candidate && candidate.definition && typeof candidate.execute === "function");
}

/** Stamp the owning bot without duplicating `bot` in every command file. */
function own(command, bot) {
  if (command.metadata?.bot === bot) return command;
  const { bot: _owner, ...metadata } = command.metadata ?? {};
  return defineCommand({
    data: command.definition,
    execute: command.execute,
    autocomplete: command.autocomplete,
    id: command.id,
    category: command.category,
    availability: command.availability,
    permissions: command.permissions,
    cooldown: command.cooldown,
    metadata,
    handlers: command.handlers,
    bot,
  });
}

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
      const command = isFrameworkCommand(module)
        ? own(module.default, registry.bot)
        : adaptLegacyCommand(module, { bot: registry.bot, category, file });
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
 * A module exports one event (`name`, `once`, `execute`) or a group
 * (`export const events = [{name, once, execute}]`), which is how a bot with
 * many similar listeners keeps them together. `interactionCreate` is owned by
 * the framework router and is skipped on purpose.
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
  context = {},
} = {}) {
  const files = await discoverModuleFiles(dir, { readdirImpl });
  const registered = [];
  const skipped = [];
  const seen = new Set();

  function register(definition, file) {
    const name = definition?.name;
    const execute = definition?.execute;

    if (typeof name !== "string" || name === "") {
      skipped.push({ file, reason: "missing event name" });
      logger?.warn("event skipped", { file, reason: "missing event name" });
      return;
    }

    if (typeof execute !== "function") {
      skipped.push({ file, reason: "missing execute handler" });
      logger?.warn("event skipped", { file, event: name, reason: "missing execute handler" });
      return;
    }

    if (reservedEvents.includes(name)) {
      skipped.push({ file, reason: "event owned by the framework" });
      logger?.warn("event skipped", { file, event: name, reason: "event owned by the framework" });
      return;
    }

    const once = definition.once === true;
    const key = `${once ? "once" : "on"}:${name}`;
    if (seen.has(key)) {
      skipped.push({ file, reason: "duplicate event handler" });
      logger?.warn("event skipped", { file, event: name, reason: "duplicate event handler" });
      return;
    }
    seen.add(key);

    // Each handler is isolated: a throw is logged and the process survives.
    const listener = async (...args) => {
      try {
        await execute(...args, context);
      } catch (error) {
        logger?.error("event handler failed", { event: name, file, err: error });
      }
    };

    if (once) client.once(name, listener);
    else client.on(name, listener);

    removed.push(once ? () => {} : () => client.off(name, listener));
    registered.push(name);
  }

  for (const file of files) {
    try {
      const module = await importModule(path.join(dir, file));
      const definitions = Array.isArray(module.events)
        ? module.events
        : [{ name: module.name, once: module.once, execute: module.execute }];

      if (definitions.length === 0) {
        skipped.push({ file, reason: "no event declared" });
        logger?.warn("event skipped", { file, reason: "no event declared" });
        continue;
      }

      for (const definition of definitions) register(definition, file);
    } catch (error) {
      skipped.push({ file, reason: error.message });
      logger?.warn("event skipped", { file, reason: error.message, bot });
    }
  }

  return { registered, skipped };
}
