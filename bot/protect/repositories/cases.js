/** SQL for moderation cases; numbering and events live in the case service. */

export function createCaseRepository({ db }) {
  function nextNumber(guildId) {
    const row = db.get(
      `SELECT COALESCE(MAX(case_number), 0) AS last FROM cases WHERE guild_id = ?`,
      guildId,
    );
    return Number(row?.last ?? 0) + 1;
  }

  function insert(record) {
    db.run(
      `INSERT INTO cases
        (id, guild_id, case_number, action, target_id, target_tag, moderator_id,
         moderator_tag, reason, duration_seconds, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
      record.id,
      record.guildId,
      record.caseNumber,
      record.action,
      record.targetId,
      record.targetTag,
      record.moderatorId,
      record.moderatorTag,
      record.reason,
      record.durationSeconds,
      record.createdAt,
      record.createdAt,
    );
    return findByNumber(record.guildId, record.caseNumber);
  }

  function findByNumber(guildId, caseNumber) {
    return db.get(`SELECT * FROM cases WHERE guild_id = ? AND case_number = ?`, guildId, caseNumber);
  }

  function list(guildId, { limit = 10, offset = 0, action = null, targetId = null, moderatorId = null } = {}) {
    const clauses = ["guild_id = ?"];
    const params = [guildId];
    if (action) {
      clauses.push("action = ?");
      params.push(action);
    }
    if (targetId) {
      clauses.push("target_id = ?");
      params.push(targetId);
    }
    if (moderatorId) {
      clauses.push("moderator_id = ?");
      params.push(moderatorId);
    }
    params.push(Math.max(1, Math.min(limit, 50)), Math.max(0, offset));
    return db.all(
      `SELECT * FROM cases WHERE ${clauses.join(" AND ")} ORDER BY case_number DESC LIMIT ? OFFSET ?`,
      ...params,
    );
  }

  function count(guildId, { action = null, targetId = null, moderatorId = null } = {}) {
    const clauses = ["guild_id = ?"];
    const params = [guildId];
    if (action) {
      clauses.push("action = ?");
      params.push(action);
    }
    if (targetId) {
      clauses.push("target_id = ?");
      params.push(targetId);
    }
    if (moderatorId) {
      clauses.push("moderator_id = ?");
      params.push(moderatorId);
    }
    return Number(db.get(`SELECT COUNT(*) AS count FROM cases WHERE ${clauses.join(" AND ")}`, ...params).count);
  }

  function update(guildId, caseNumber, { status, note, updatedAt }) {
    db.run(
      `UPDATE cases SET
         status = COALESCE(?, status),
         note = COALESCE(?, note),
         updated_at = ?
       WHERE guild_id = ? AND case_number = ?`,
      status ?? null,
      note ?? null,
      updatedAt,
      guildId,
      caseNumber,
    );
    return findByNumber(guildId, caseNumber);
  }

  function stats(guildId, { moderatorId = null, since = null } = {}) {
    const clauses = ["guild_id = ?"];
    const params = [guildId];
    if (moderatorId) {
      clauses.push("moderator_id = ?");
      params.push(moderatorId);
    }
    if (since) {
      clauses.push("created_at >= ?");
      params.push(since);
    }
    const rows = db.all(
      `SELECT action, COUNT(*) AS count FROM cases WHERE ${clauses.join(" AND ")} GROUP BY action`,
      ...params,
    );
    const byAction = Object.fromEntries(rows.map((row) => [row.action, Number(row.count)]));
    return {
      total: Object.values(byAction).reduce((sum, count) => sum + count, 0),
      byAction,
    };
  }

  function activeWarnings(guildId, targetId) {
    return db.all(
      `SELECT * FROM cases
       WHERE guild_id = ? AND target_id = ? AND action = 'warn' AND status = 'open'
       ORDER BY case_number DESC`,
      guildId,
      targetId,
    );
  }

  return { nextNumber, insert, findByNumber, list, count, update, stats, activeWarnings };
}
