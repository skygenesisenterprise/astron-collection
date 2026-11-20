/**
 * SQLite connection shared by every bot.
 *
 * One database file belongs to exactly one bot: data ownership is a property of
 * the deployment, not of a table. The wrapper only adds what a long-running
 * process needs — WAL, foreign keys, a busy timeout, cached statements and
 * nestable transactions — and stays a thin layer over `node:sqlite`.
 */

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_BUSY_TIMEOUT_MS = 5_000;

function normalizeRowId(value) {
  return typeof value === "bigint" ? Number(value) : value;
}

/**
 * @param {object} options
 * @param {string} options.file Absolute path, `:memory:` or a `file:` URI.
 * @param {number} [options.busyTimeoutMs]
 * @param {object} [options.logger]
 */
export function createDatabase({ file, busyTimeoutMs = DEFAULT_BUSY_TIMEOUT_MS, logger } = {}) {
  if (typeof file !== "string" || file.trim() === "") {
    throw new Error("createDatabase requires a database file path.");
  }

  if (file !== ":memory:" && !file.startsWith("file:")) {
    mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }

  const raw = new DatabaseSync(file);

  // WAL keeps readers (commands) from blocking the writer (event handlers); a
  // busy timeout makes a concurrent write wait instead of failing immediately.
  raw.exec("PRAGMA journal_mode = WAL;");
  raw.exec("PRAGMA foreign_keys = ON;");
  raw.exec("PRAGMA synchronous = NORMAL;");
  raw.exec(`PRAGMA busy_timeout = ${Number(busyTimeoutMs)};`);

  /** @type {Map<string, import("node:sqlite").StatementSync>} */
  const statements = new Map();
  let depth = 0;
  let closed = false;

  function prepare(sql) {
    if (closed) throw new Error("Database is closed.");
    let statement = statements.get(sql);
    if (!statement) {
      statement = raw.prepare(sql);
      statements.set(sql, statement);
    }
    return statement;
  }

  function assertOpen() {
    if (closed) throw new Error("Database is closed.");
  }

  return {
    file,
    get raw() {
      assertOpen();
      return raw;
    },
    get closed() {
      return closed;
    },
    get(sql, ...params) {
      assertOpen();
      return prepare(sql).get(...params);
    },
    all(sql, ...params) {
      assertOpen();
      return prepare(sql).all(...params);
    },
    run(sql, ...params) {
      assertOpen();
      const result = prepare(sql).run(...params);
      return {
        changes: normalizeRowId(result.changes),
        lastInsertRowid: normalizeRowId(result.lastInsertRowid),
      };
    },
    exec(sql) {
      assertOpen();
      raw.exec(sql);
    },
    /**
     * Run `fn` atomically. Nested calls use savepoints, so a service can compose
     * repository calls without flattening them into one giant transaction.
     */
    transaction(fn) {
      assertOpen();
      const savepoint = depth > 0 ? `astron_sp_${depth}` : null;
      if (savepoint) raw.exec(`SAVEPOINT ${savepoint};`);
      else raw.exec("BEGIN IMMEDIATE;");
      depth += 1;

      try {
        const result = fn();
        depth -= 1;
        if (savepoint) raw.exec(`RELEASE ${savepoint};`);
        else raw.exec("COMMIT;");
        return result;
      } catch (error) {
        depth = Math.max(0, depth - 1);
        try {
          if (savepoint) raw.exec(`ROLLBACK TO ${savepoint}; RELEASE ${savepoint};`);
          else raw.exec("ROLLBACK;");
        } catch (rollbackError) {
          logger?.error?.("database rollback failed", { err: rollbackError });
        }
        throw error;
      }
    },
    close() {
      if (closed) return;
      closed = true;
      statements.clear();
      raw.close();
    },
  };
}

export function createMemoryDatabase(options = {}) {
  return createDatabase({ ...options, file: ":memory:" });
}
