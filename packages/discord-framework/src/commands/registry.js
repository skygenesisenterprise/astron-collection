/**
 * Per-bot command registry.
 *
 * One registry belongs to exactly one bot: registering a command that declares
 * another bot is refused. That is the invariant that stops a bot from ever
 * executing (or even holding) another bot's catalogue, no matter what a loader
 * is pointed at.
 */

import { ERROR_CODES, AstronError } from "../errors.js";
import { validateCommand } from "./contract.js";

export function createCommandRegistry({ bot } = {}) {
  if (!bot) throw new Error("createCommandRegistry requires the owning bot name.");

  /** @type {Map<string, object>} key: `${type}:${name}` */
  const byKey = new Map();
  /** @type {Map<string, object>} key: command id (Discord name) */
  const byId = new Map();

  const keyOf = (definition) => `${definition.type ?? 1}:${definition.name}`;

  function register(command) {
    const check = validateCommand(command);
    if (!check.ok) {
      throw new AstronError(`Invalid command '${command?.name ?? "?"}': ${check.errors.join("; ")}`, {
        code: ERROR_CODES.COMMAND_INVALID,
        expected: true,
        meta: { bot, command: command?.name, errors: check.errors },
      });
    }

    const owner = command.metadata?.bot;
    if (owner && owner !== bot) {
      throw new AstronError(
        `Bot '${bot}' cannot register command '${command.name}' owned by '${owner}'.`,
        {
          code: ERROR_CODES.COMMAND_FOREIGN_BOT,
          expected: true,
          meta: { bot, owner, command: command.name },
        },
      );
    }

    const key = keyOf(command.definition);
    if (byKey.has(key)) {
      throw new AstronError(
        `Duplicate command '${command.definition.name}' (type ${command.definition.type ?? 1}) in bot '${bot}'.`,
        {
          code: ERROR_CODES.COMMAND_DUPLICATE,
          expected: true,
          meta: { bot, command: command.definition.name },
        },
      );
    }

    byKey.set(key, command);
    byId.set(command.id, command);
    return command;
  }

  function registerAll(commands = []) {
    for (const command of commands) register(command);
    return list();
  }

  /** `type` is an explicit Discord command type (1 slash, 2 user, 3 message). */
  function get(name, type) {
    if (type === undefined) return byId.get(name) ?? null;
    return byKey.get(`${type}:${name}`) ?? null;
  }

  function list() {
    return [...byKey.values()];
  }

  function definitions() {
    return list()
      .map((command) => command.json())
      .sort((left, right) => (left.type ?? 1) - (right.type ?? 1) || left.name.localeCompare(right.name));
  }

  return {
    bot,
    register,
    registerAll,
    get,
    has: (name, type = 1) => get(name, type) !== null,
    list,
    definitions,
    clear: () => {
      byKey.clear();
      byId.clear();
    },
    get size() {
      return byKey.size;
    },
  };
}
