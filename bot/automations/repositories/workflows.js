/** Workflow definitions, triggers and ordered actions. */

import { fromJson, nowIso, toJson } from "@astron-collection/discord-framework";

export function createWorkflowRepository({ db, clock = () => new Date() }) {
  function create({ id, guildId, name, description = "", createdBy }) {
    const at = nowIso(clock);
    db.run(
      `INSERT INTO workflows (id, guild_id, name, description, enabled, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
      id,
      guildId,
      name,
      description,
      createdBy,
      at,
      at,
    );
    return get(guildId, id);
  }

  function get(guildId, id) {
    return db.get(`SELECT * FROM workflows WHERE guild_id = ? AND id = ?`, guildId, id) ?? null;
  }

  function list(guildId, limit = 50) {
    return db.all(
      `SELECT * FROM workflows WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?`,
      guildId,
      limit,
    );
  }

  function update(guildId, id, patch) {
    const current = get(guildId, id);
    if (!current) return null;
    db.run(
      `UPDATE workflows SET name = ?, description = ?, enabled = ?, updated_at = ? WHERE guild_id = ? AND id = ?`,
      patch.name ?? current.name,
      patch.description ?? current.description,
      patch.enabled === undefined ? current.enabled : Number(Boolean(patch.enabled)),
      nowIso(clock),
      guildId,
      id,
    );
    return get(guildId, id);
  }

  function remove(guildId, id) {
    db.run(`DELETE FROM workflow_actions WHERE guild_id = ? AND workflow_id = ?`, guildId, id);
    db.run(`DELETE FROM workflow_triggers WHERE guild_id = ? AND workflow_id = ?`, guildId, id);
    return db.run(`DELETE FROM workflows WHERE guild_id = ? AND id = ?`, guildId, id).changes > 0;
  }

  function addTrigger({ id, workflowId, guildId, type, config = {} }) {
    db.run(
      `INSERT INTO workflow_triggers (id, workflow_id, guild_id, type, config, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      workflowId,
      guildId,
      type,
      toJson(config),
      nowIso(clock),
    );
    return db.get(`SELECT * FROM workflow_triggers WHERE id = ?`, id);
  }

  function listTriggers(workflowId) {
    return db
      .all(`SELECT * FROM workflow_triggers WHERE workflow_id = ? ORDER BY created_at`, workflowId)
      .map((row) => ({ ...row, config: fromJson(row.config, {}) }));
  }

  function triggersByType(guildId, type) {
    return db
      .all(`SELECT * FROM workflow_triggers WHERE guild_id = ? AND type = ?`, guildId, type)
      .map((row) => ({ ...row, config: fromJson(row.config, {}) }));
  }

  function removeTrigger(guildId, workflowId, triggerId) {
    return (
      db.run(
        `DELETE FROM workflow_triggers WHERE guild_id = ? AND workflow_id = ? AND id = ?`,
        guildId,
        workflowId,
        triggerId,
      ).changes > 0
    );
  }

  function addAction({ id, workflowId, guildId, type, config = {}, position }) {
    const next =
      position ??
      Number(
        db.get(
          `SELECT COALESCE(MAX(position), 0) + 1 AS next FROM workflow_actions WHERE workflow_id = ?`,
          workflowId,
        ).next,
      );
    db.run(
      `INSERT INTO workflow_actions (id, workflow_id, guild_id, position, type, config, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      workflowId,
      guildId,
      next,
      type,
      toJson(config),
      nowIso(clock),
    );
    return db.get(`SELECT * FROM workflow_actions WHERE id = ?`, id);
  }

  function listActions(workflowId) {
    return db
      .all(`SELECT * FROM workflow_actions WHERE workflow_id = ? ORDER BY position`, workflowId)
      .map((row) => ({ ...row, config: fromJson(row.config, {}) }));
  }

  function removeAction(guildId, workflowId, actionId) {
    return (
      db.run(
        `DELETE FROM workflow_actions WHERE guild_id = ? AND workflow_id = ? AND id = ?`,
        guildId,
        workflowId,
        actionId,
      ).changes > 0
    );
  }

  function enabledWithTriggerType(guildId, type) {
    return db
      .all(
        `SELECT DISTINCT w.* FROM workflows w
         JOIN workflow_triggers t ON t.workflow_id = w.id
         WHERE w.guild_id = ? AND w.enabled = 1 AND t.type = ?`,
        guildId,
        type,
      )
      .map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
  }

  function enabledScheduled() {
    return db
      .all(
        `SELECT DISTINCT w.* FROM workflows w
         JOIN workflow_triggers t ON t.workflow_id = w.id
         WHERE w.enabled = 1 AND t.type = 'schedule'`,
      )
      .map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
  }

  function countForGuild(guildId) {
    return Number(db.get(`SELECT COUNT(*) AS count FROM workflows WHERE guild_id = ?`, guildId).count);
  }

  return {
    create,
    get,
    list,
    update,
    remove,
    addTrigger,
    listTriggers,
    triggersByType,
    removeTrigger,
    addAction,
    listActions,
    removeAction,
    enabledWithTriggerType,
    enabledScheduled,
    countForGuild,
  };
}
