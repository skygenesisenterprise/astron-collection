/**
 * Forward-only SQL migrations.
 *
 * A bot ships its schema in `migrations/*.sql`, applied once in filename order at
 * startup. An applied migration is immutable: its checksum is stored, and a
 * changed file fails loudly instead of leaving two deployments with different
 * schemas that both claim the same version.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { nowIso } from "./values.js";

export const MIGRATIONS_TABLE = "schema_migrations";

function ensureMigrationsTable(db, table) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      version   TEXT PRIMARY KEY,
      checksum  TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

/**
 * @param {object} db Database returned by createDatabase.
 * @param {string} dir Directory containing `*.sql` files.
 * @param {object} [options]
 * @param {object} [options.logger]
 * @param {string} [options.table]
 * @returns {{applied: string[], skipped: string[], dir: string}}
 */
export function runMigrations(db, dir, { logger, table = MIGRATIONS_TABLE } = {}) {
  ensureMigrationsTable(db, table);

  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const known = new Map(
    db.all(`SELECT version, checksum FROM ${table}`).map((row) => [row.version, row.checksum]),
  );

  const applied = [];
  const skipped = [];

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const sql = readFileSync(path.join(dir, file), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    if (known.has(version)) {
      if (known.get(version) !== checksum) {
        throw new Error(
          `Migration '${version}' changed after it was applied. Ship a new migration instead of editing history.`,
        );
      }
      skipped.push(version);
      continue;
    }

    db.transaction(() => {
      db.exec(sql);
      db.run(
        `INSERT INTO ${table} (version, checksum, applied_at) VALUES (?, ?, ?)`,
        version,
        checksum,
        nowIso(),
      );
    });

    applied.push(version);
    logger?.info?.("migration applied", { version, file });
  }

  if (applied.length === 0) logger?.debug?.("schema up to date", { migrations: skipped.length });
  return { applied, skipped, dir };
}

/** List the migrations a directory contains, for diagnostics and tests. */
export function listMigrations(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => name.replace(/\.sql$/, ""));
}
