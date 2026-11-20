/** SQL for audit entries; filtering, retention and projection live in the service. */

import { fromJson, toJson } from "../../../packages/discord-framework/src/index.js";

export function createLogEntryRepository({ db }) {
  function insert(entry) {
    const result = db.run(
      `INSERT OR IGNORE INTO log_entries
        (guild_id, category, event_type, actor_id, target_id, channel_id, summary,
         payload, source_bot, event_id, occurred_at, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.guildId,
      entry.category,
      entry.eventType,
      entry.actorId,
      entry.targetId,
      entry.channelId,
      entry.summary,
      toJson(entry.payload),
      entry.sourceBot,
      entry.eventId,
      entry.occurredAt,
      entry.receivedAt,
    );
    return { inserted: result.changes > 0, id: result.lastInsertRowid };
  }

  function buildFilters(guildId, filters = {}) {
    const clauses = ["guild_id = ?"];
    const params = [guildId];

    if (filters.category) {
      clauses.push("category = ?");
      params.push(filters.category);
    }
    if (filters.eventType) {
      clauses.push("event_type = ?");
      params.push(filters.eventType);
    }
    if (filters.actorId) {
      clauses.push("actor_id = ?");
      params.push(filters.actorId);
    }
    if (filters.targetId) {
      clauses.push("target_id = ?");
      params.push(filters.targetId);
    }
    if (filters.channelId) {
      clauses.push("channel_id = ?");
      params.push(filters.channelId);
    }
    if (filters.after) {
      clauses.push("received_at >= ?");
      params.push(filters.after);
    }
    if (filters.before) {
      clauses.push("received_at <= ?");
      params.push(filters.before);
    }
    if (filters.query) {
      clauses.push("(summary LIKE ? ESCAPE '\\' OR payload LIKE ? ESCAPE '\\')");
      const escaped = String(filters.query).replace(/[\\%_]/g, (match) => `\\${match}`);
      params.push(`%${escaped}%`, `%${escaped}%`);
    }

    return { where: clauses.join(" AND "), params };
  }

  function search(guildId, filters = {}, { limit = 10, offset = 0 } = {}) {
    const { where, params } = buildFilters(guildId, filters);
    return db.all(
      `SELECT * FROM log_entries WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      ...params,
      Math.max(1, Math.min(limit, 50)),
      Math.max(0, offset),
    ).map((row) => ({ ...row, payload: fromJson(row.payload, null) }));
  }

  function count(guildId, filters = {}) {
    const { where, params } = buildFilters(guildId, filters);
    return Number(db.get(`SELECT COUNT(*) AS count FROM log_entries WHERE ${where}`, ...params).count);
  }

  function find(guildId, id) {
    const row = db.get(`SELECT * FROM log_entries WHERE guild_id = ? AND id = ?`, guildId, id);
    return row ? { ...row, payload: fromJson(row.payload, null) } : null;
  }

  function exportRows(guildId, filters = {}, limit = 5000) {
    const { where, params } = buildFilters(guildId, filters);
    return db
      .all(
        `SELECT category, event_type, actor_id, target_id, channel_id, summary,
                payload, source_bot, event_id, occurred_at, received_at
         FROM log_entries WHERE ${where} ORDER BY id ASC LIMIT ?`,
        ...params,
        Math.max(1, limit),
      )
      .map((row) => ({ ...row, payload: fromJson(row.payload, null) }));
  }

  function purgeBefore(guildId, cutoff) {
    return db.run(`DELETE FROM log_entries WHERE guild_id = ? AND received_at < ?`, guildId, cutoff).changes;
  }

  function stats(guildId) {
    const byCategory = db.all(
      `SELECT category, COUNT(*) AS count FROM log_entries WHERE guild_id = ? GROUP BY category`,
      guildId,
    );
    const range = db.get(
      `SELECT MIN(received_at) AS oldest, MAX(received_at) AS newest FROM log_entries WHERE guild_id = ?`,
      guildId,
    );
    return {
      byCategory: Object.fromEntries(byCategory.map((row) => [row.category, Number(row.count)])),
      total: byCategory.reduce((sum, row) => sum + Number(row.count), 0),
      oldest: range?.oldest ?? null,
      newest: range?.newest ?? null,
    };
  }

  return { insert, search, count, find, exportRows, purgeBefore, stats };
}
