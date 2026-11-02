/**
 * The command contract.
 *
 * A command is a declaration (Discord definition + metadata), an execution
 * handler and an optional set of component handlers. The definition is kept
 * separate from the business code: a service never has to know about the
 * Discord client lifecycle.
 */

import { ERROR_CODES, UserInputError } from "../errors.js";

export const COMMAND_TYPES = Object.freeze({
  CHAT_INPUT: 1,
  USER: 2,
  MESSAGE: 3,
});

export const COMMAND_TYPE_NAMES = Object.freeze({
  1: "chatInput",
  2: "user",
  3: "message",
});

const COMMAND_NAME = /^[a-z0-9][a-z0-9_-]{0,31}$/;

class BootBuilder {
  constructor(name, description = "") {
    this._name = name;
    this._description = description;
  }

  toJSON() {
    return { name: this._name, description: this._description, type: COMMAND_TYPES.CHAT_INPUT };
  }
}

/** Read the JSON definition from any Discord builder-shaped object. */
export function toDefinition(data) {
  if (!data) {
    throw new UserInputError("Command has no definition (missing `data`).", {
      code: ERROR_CODES.COMMAND_INVALID,
    });
  }

  if (typeof data.toJSON === "function") {
    const json = data.toJSON();
    if (json && typeof json === "object") return json;
    throw new UserInputError("Command definition did not serialize to an object.", {
      code: ERROR_CODES.COMMAND_INVALID,
    });
  }

  if (typeof data === "object" && typeof data.name === "string") {
    return data;
  }

  throw new UserInputError("Command definition must expose `toJSON()` or be a plain definition.", {
    code: ERROR_CODES.COMMAND_INVALID,
  });
}

/** Discord refuses DM usage unless explicitly allowed. */
export function deriveAvailability(definition) {
  return Object.freeze({
    guildOnly: definition.dm_permission !== true,
    dmOnly: false,
    contexts: definition.contexts ?? undefined,
  });
}

/**
 * Permissions declared at registration time are *not* the authorization check:
 * the runtime re-evaluates them on every execution (see permissions.js).
 */
export function derivePermissions(definition) {
  const raw = definition.default_member_permissions;

  if (raw === undefined || raw === null || raw === "") return { user: [], bot: [] };

  // Discord serializes the declaration as a decimal bitmask, while permission
  // names ("BanMembers") come from the bot code. Both are accepted at runtime.
  const normalized = /^\d+$/.test(String(raw)) ? BigInt(raw) : String(raw);
  return { user: [normalized], bot: [] };
}

export function normalizePermissions(permissions = {}) {
  return Object.freeze({
    user: Array.isArray(permissions.user) ? permissions.user : permissions.user ? [permissions.user] : [],
    bot: Array.isArray(permissions.bot) ? permissions.bot : permissions.bot ? [permissions.bot] : [],
    policy: permissions.policy ?? null,
  });
}

export function normalizeCooldown(cooldown = {}) {
  const seconds = Number(cooldown?.seconds ?? cooldown ?? 0);
  return Object.freeze({
    seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : 0,
    scope: cooldown?.scope === "guild" ? "guild" : "user",
  });
}

function normalizeHandlers(handlers = {}) {
  const normalize = (group = {}) =>
    Object.fromEntries(
      Object.entries(group).filter(([, handler]) => typeof handler === "function"),
    );
  return Object.freeze({
    buttons: normalize(handlers.buttons),
    selects: normalize(handlers.selects),
    modals: normalize(handlers.modals),
  });
}

/**
 * @param {object} spec
 * @param {object} spec.data Discord definition builder (SlashCommandBuilder, ContextMenuCommandBuilder, …).
 * @param {(interaction: any, context: object) => unknown} spec.execute
 * @param {string} [spec.id] Stable identifier, defaults to the Discord command name.
 * @param {string} [spec.category] Catalogue category (`moderation`, `utility`, …).
 * @param {object} [spec.availability] `{ guildOnly, dmOnly }` overrides.
 * @param {object} [spec.permissions] `{ user, bot, policy }`.
 * @param {object|number} [spec.cooldown] `{ seconds, scope }`.
 * @param {object} [spec.metadata] Deployment/documentation metadata.
 * @param {object} [spec.handlers] Component handlers `{ buttons, selects, modals }`.
 * @param {(interaction: any, context: object) => unknown} [spec.autocomplete]
 * @param {string} [spec.bot] Owning bot (injected by the loader).
 */
export function defineCommand(spec) {
  const definition = toDefinition(spec.data);
  const name = spec.id ?? definition.name;

  if (!name) {
    throw new UserInputError("Command has no name.", { code: ERROR_CODES.COMMAND_INVALID });
  }

  const availability = Object.freeze({
    ...deriveAvailability(definition),
    ...(spec.availability ?? {}),
  });

  const declared = derivePermissions(definition);
  const provided = spec.permissions ?? {};

  return Object.freeze({
    id: name,
    name,
    category: spec.category ?? "uncategorized",
    definition,
    json: () => structuredClone(definition),
    execute: spec.execute,
    autocomplete: spec.autocomplete,
    availability,
    permissions: Object.freeze({
      user: provided.user ?? declared.user,
      bot: provided.bot ?? declared.bot,
      policy: provided.policy ?? null,
    }),
    cooldown: normalizeCooldown(spec.cooldown),
    metadata: Object.freeze({
      bot: spec.bot,
      description: definition.description ?? "",
      type: COMMAND_TYPE_NAMES[definition.type ?? 1] ?? "unknown",
      deployment: Object.freeze({ ...(spec.metadata?.deployment ?? {}) }),
      documentation: spec.metadata?.documentation ?? null,
      ...(spec.metadata ?? {}),
    }),
    handlers: normalizeHandlers(spec.handlers),
    /** Marks a command adapted from a pre-framework module. */
    legacy: spec.legacy === true,
  });
}

/**
 * Validate a normalized command. Returns every problem at once so a bad
 * catalogue fails with one actionable message instead of one error per load.
 */
export function validateCommand(command) {
  const errors = [];

  if (!command || typeof command !== "object") {
    return { ok: false, errors: ["Command is not an object."] };
  }

  const definition = command.definition ?? command.json?.();

  if (!definition || typeof definition !== "object") {
    errors.push("Missing Discord definition.");
  } else {
    if (!COMMAND_NAME.test(definition.name ?? "")) {
      errors.push(`Invalid command name '${definition.name ?? ""}'.`);
    }
    const type = definition.type ?? COMMAND_TYPES.CHAT_INPUT;
    if (type === COMMAND_TYPES.CHAT_INPUT && !definition.description) {
      errors.push(`Slash command '${definition.name}' has no description.`);
    }
  }

  if (typeof command.execute !== "function") {
    errors.push(`Command '${command.name ?? definition?.name ?? "?"}' has no execute handler.`);
  }

  if (command.autocomplete !== undefined && typeof command.autocomplete !== "function") {
    errors.push(`Autocomplete handler of '${command.name}' is not a function.`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Adapt a pre-framework command module (`export const data`, `export function
 * execute`) to the contract. This is the temporary compatibility layer the
 * migration relies on: the catalogue keeps working unchanged while the runtime
 * gains routing, validation, permissions and error handling.
 */
export function adaptLegacyCommand(module, { bot, category = "legacy", file = "" } = {}) {
  const definition = toDefinition(module?.data);
  return defineCommand({
    data: module.data,
    execute: module.execute,
    autocomplete: module.autocomplete,
    id: definition.name,
    category,
    bot,
    legacy: true,
    metadata: { source: file, documentation: null },
  });
}

/** Minimal definition used by tests and internal no-op commands. */
export function createCommandDefinition(name, description) {
  return new BootBuilder(name, description);
}
