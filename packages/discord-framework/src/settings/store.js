/**
 * Guild-scoped settings.
 *
 * Every value belongs to one guild and one bot: the table lives in the bot's own
 * database, never in a shared one, and a key must be declared in the bot's
 * defaults. That is what makes `guildId` a mandatory parameter of every method
 * instead of an optional filter.
 */

import { ERROR_CODES, AstronError } from "../errors.js";
import { nowIso } from "../storage/values.js";

const MAX_GUILD_ID_LENGTH = 32;

export function ensureSettingsSchema(db, table = "bot_settings") {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      guild_id   TEXT NOT NULL,
      key        TEXT NOT NULL,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT,
      PRIMARY KEY (guild_id, key)
    );
  `);
}

function assertGuildId(guildId) {
  if (typeof guildId !== "string" || guildId.length === 0 || guildId.length > MAX_GUILD_ID_LENGTH) {
    throw new AstronError("A guild id is required for every settings access.", {
      code: ERROR_CODES.GUILD_ONLY,
      expected: true,
    });
  }
}

function validateValue(validator, value, key) {
  if (typeof validator !== "function") return;
  let result;
  try {
    result = validator(value);
  } catch (error) {
    throw new AstronError(`Invalid value for '${key}': ${error.message}`, {
      code: ERROR_CODES.COMMAND_INVALID,
      expected: true,
      userMessage: `Invalid value for '${key}'.`,
    });
  }
  if (result === true || result === undefined) return;
  if (result && typeof result === "object" && result.ok === true) return;
  const detail = result && typeof result === "object" ? result.error ?? result.reason : String(result);
  throw new AstronError(`Invalid value for '${key}': ${detail}`, {
    code: ERROR_CODES.COMMAND_INVALID,
    expected: true,
    userMessage: `Invalid value for '${key}': ${detail}`,
  });
}

/**
 * @param {object} options
 * @param {object} options.db Framework database.
 * @param {string} options.bot Owning bot (documentation and errors).
 * @param {object} options.defaults Declared keys and their defaults.
 * @param {Record<string, Function>} [options.validators] Per-key validators.
 * @param {string} [options.table]
 * @param {() => Date} [options.clock]
 */
export function createSettingsStore({
  db,
  bot,
  defaults = {},
  validators = {},
  table = "bot_settings",
  clock = () => new Date(),
} = {}) {
  if (!db) throw new Error("createSettingsStore requires a database.");
  if (!bot) throw new Error("createSettingsStore requires the bot name.");
  if (!defaults || typeof defaults !== "object") throw new Error("Settings defaults must be an object.");

  ensureSettingsSchema(db, table);
  const keys = new Set(Object.keys(defaults));

  function defaultFor(key) {
    return structuredClone(defaults[key]);
  }

  function assertKey(key) {
    if (!keys.has(key)) {
      throw new AstronError(`Unknown setting '${key}' for bot '${bot}'.`, {
        code: ERROR_CODES.COMMAND_INVALID,
        expected: true,
      });
    }
  }

  function rowsFor(guildId) {
    assertGuildId(guildId);
    return db.all(`SELECT key, value, updated_at, updated_by FROM ${table} WHERE guild_id = ?`, guildId);
  }

  function getAll(guildId) {
    const values = structuredClone(defaults);
    for (const row of rowsFor(guildId)) {
      if (!keys.has(row.key)) continue;
      try {
        values[row.key] = JSON.parse(row.value);
      } catch {
        // A corrupted row falls back to the declared default.
      }
    }
    return values;
  }

  function get(guildId, key) {
    assertKey(key);
    assertGuildId(guildId);
    const row = db.get(`SELECT value FROM ${table} WHERE guild_id = ? AND key = ?`, guildId, key);
    if (!row) return defaultFor(key);
    try {
      return JSON.parse(row.value);
    } catch {
      return defaultFor(key);
    }
  }

  function set(guildId, key, value, { actorId = null } = {}) {
    assertKey(key);
    assertGuildId(guildId);
    validateValue(validators[key], value, key);

    db.run(
      `INSERT INTO ${table} (guild_id, key, value, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (guild_id, key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
      guildId,
      key,
      JSON.stringify(value ?? null),
      nowIso(clock),
      actorId,
    );

    return value;
  }

  function update(guildId, patch, { actorId = null } = {}) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new Error("Settings update requires an object.");
    }
    for (const [key, value] of Object.entries(patch)) {
      assertKey(key);
      validateValue(validators[key], value, key);
    }
    db.transaction(() => {
      for (const [key, value] of Object.entries(patch)) {
        set(guildId, key, value, { actorId });
      }
    });
    return getAll(guildId);
  }

  function reset(guildId, key) {
    assertGuildId(guildId);
    if (key === undefined) {
      db.run(`DELETE FROM ${table} WHERE guild_id = ?`, guildId);
    } else {
      assertKey(key);
      db.run(`DELETE FROM ${table} WHERE guild_id = ? AND key = ?`, guildId, key);
    }
    return getAll(guildId);
  }

  function list() {
    return db
      .all(`SELECT DISTINCT guild_id FROM ${table} ORDER BY guild_id`)
      .map((row) => row.guild_id);
  }

  /** Describe the declared keys for a `/config` style command. */
  function describe() {
    return Object.entries(defaults).map(([key, value]) => ({ key, default: structuredClone(value) }));
  }

  return {
    bot,
    keys: () => [...keys],
    defaults: () => structuredClone(defaults),
    getAll,
    get,
    set,
    update,
    reset,
    list,
    describe,
  };
}
