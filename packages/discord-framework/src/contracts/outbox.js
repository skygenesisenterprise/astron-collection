/**
 * Transactional outbox.
 *
 * An event is written to the producer's own database in the same transaction as
 * the business change, then delivered asynchronously. A crash after commit but
 * before delivery leaves a pending row, not a lost event; a delivery retry sends
 * the same envelope id, which the consumer deduplicates.
 */

import { randomUUID } from "node:crypto";

import { createEvent } from "./events.js";
import { nowIso } from "../storage/values.js";

export function ensureOutboxSchema(db, table = "event_outbox") {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      id           TEXT PRIMARY KEY,
      type         TEXT NOT NULL,
      payload      TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      delivered_at TEXT,
      failed_at    TEXT,
      attempts     INTEGER NOT NULL DEFAULT 0,
      last_error   TEXT
    );
    CREATE INDEX IF NOT EXISTS ${table}_pending ON ${table} (delivered_at, failed_at, created_at);
  `);
}

/**
 * @param {object} options
 * @param {object} options.db Framework database.
 * @param {object} options.bus Event bus.
 * @param {object} [options.logger]
 * @param {number} [options.maxAttempts]
 * @param {string} [options.table]
 */
export function createOutbox({
  db,
  bus,
  logger,
  maxAttempts = 8,
  table = "event_outbox",
  clock = () => new Date(),
} = {}) {
  if (!db) throw new Error("createOutbox requires a database.");
  if (!bus) throw new Error("createOutbox requires an event bus.");
  ensureOutboxSchema(db, table);

  function enqueueEnvelope(envelope) {
    const result = db.run(
      `INSERT OR IGNORE INTO ${table} (id, type, payload, created_at) VALUES (?, ?, ?, ?)`,
      envelope.id,
      envelope.type,
      JSON.stringify(envelope),
      nowIso(clock),
    );
    return { inserted: result.changes > 0, envelope };
  }

  /** Build, validate and enqueue an event in one call. */
  function enqueue(type, options = {}) {
    const envelope = createEvent({ type, source: bus.source, ...options });
    return enqueueEnvelope(envelope);
  }

  function pending(limit = 50) {
    return db
      .all(
        `SELECT * FROM ${table} WHERE delivered_at IS NULL AND failed_at IS NULL ORDER BY created_at LIMIT ?`,
        Math.max(1, Number(limit) || 50),
      )
      .map((row) => ({ ...row, envelope: JSON.parse(row.payload) }));
  }

  async function flush({ limit = 50 } = {}) {
    const rows = pending(limit);
    const delivered = [];
    const failed = [];

    for (const row of rows) {
      try {
        const result = await bus.publishEnvelope(row.envelope);
        if (!result.ok) {
          throw new AggregateError(
            result.failed.map((entry) => entry.error),
            "One or more sinks rejected the event.",
          );
        }
        db.run(
          `UPDATE ${table} SET delivered_at = ?, attempts = attempts + 1, last_error = NULL WHERE id = ?`,
          nowIso(clock),
          row.id,
        );
        delivered.push(row.id);
      } catch (error) {
        const attempts = Number(row.attempts) + 1;
        const exhausted = attempts >= maxAttempts;
        db.run(
          `UPDATE ${table} SET attempts = ?, last_error = ?, failed_at = ? WHERE id = ?`,
          attempts,
          String(error?.message ?? error).slice(0, 1000),
          exhausted ? nowIso(clock) : null,
          row.id,
        );
        failed.push({ id: row.id, attempts, exhausted, error });
        logger?.warn?.("outbox delivery failed", {
          eventId: row.id,
          type: row.type,
          attempts,
          exhausted,
          err: error,
        });
      }
    }

    return { delivered, failed, pending: pending(1).length };
  }

  function stats() {
    const row = db.get(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) AS delivered,
         SUM(CASE WHEN delivered_at IS NULL AND failed_at IS NULL THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN failed_at IS NOT NULL THEN 1 ELSE 0 END) AS failed
       FROM ${table}`,
    );
    return {
      total: Number(row?.total ?? 0),
      delivered: Number(row?.delivered ?? 0),
      pending: Number(row?.pending ?? 0),
      failed: Number(row?.failed ?? 0),
    };
  }

  return { enqueue, enqueueEnvelope, pending, flush, stats, table, newId: randomUUID };
}
