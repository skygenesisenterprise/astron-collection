/** Execution history, with idempotency keys. */

import { fromJson, toJson } from "../../../packages/discord-framework/src/index.js";

export function createRunRepository({ db }) {
  function hasRun(workflowId, idempotencyKey) {
    if (!idempotencyKey) return false;
    return Boolean(
      db.get(
        `SELECT 1 AS present FROM workflow_runs WHERE workflow_id = ? AND idempotency_key = ?`,
        workflowId,
        idempotencyKey,
      ),
    );
  }

  function record(run) {
    db.run(
      `INSERT INTO workflow_runs
        (id, workflow_id, guild_id, trigger_type, status, detail, idempotency_key, started_at, finished_at, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      run.id,
      run.workflowId,
      run.guildId,
      run.triggerType,
      run.status,
      toJson(run.detail ?? []),
      run.idempotencyKey ?? null,
      run.startedAt,
      run.finishedAt,
      run.error ?? null,
    );
    return run;
  }

  function list(guildId, workflowId = null, limit = 10) {
    const rows = workflowId
      ? db.all(
          `SELECT * FROM workflow_runs WHERE guild_id = ? AND workflow_id = ? ORDER BY started_at DESC LIMIT ?`,
          guildId,
          workflowId,
          limit,
        )
      : db.all(
          `SELECT * FROM workflow_runs WHERE guild_id = ? ORDER BY started_at DESC LIMIT ?`,
          guildId,
          limit,
        );
    return rows.map((row) => ({ ...row, detail: fromJson(row.detail, []) }));
  }

  function stats(guildId) {
    const row = db.get(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
       FROM workflow_runs WHERE guild_id = ?`,
      guildId,
    );
    return {
      total: Number(row.total ?? 0),
      success: Number(row.success ?? 0),
      failed: Number(row.failed ?? 0),
    };
  }

  return { hasRun, record, list, stats };
}
