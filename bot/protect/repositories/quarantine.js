/** Quarantine records: the roles a member had before isolation. */

import { fromJson, nowIso, toJson } from "../../../packages/discord-framework/src/index.js";

export function createQuarantineRepository({ db, clock = () => new Date() }) {
  function record({ guildId, userId, roleIds }) {
    db.run(
      `INSERT INTO quarantine (guild_id, user_id, role_ids, created_at, released_at)
       VALUES (?, ?, ?, ?, NULL)
       ON CONFLICT (guild_id, user_id) DO UPDATE SET
         role_ids = excluded.role_ids,
         created_at = excluded.created_at,
         released_at = NULL`,
      guildId,
      userId,
      toJson(roleIds),
      nowIso(clock),
    );
  }

  function find(guildId, userId) {
    const row = db.get(`SELECT * FROM quarantine WHERE guild_id = ? AND user_id = ?`, guildId, userId);
    if (!row) return null;
    return { ...row, roleIds: fromJson(row.role_ids, []) };
  }

  function release(guildId, userId) {
    db.run(
      `UPDATE quarantine SET released_at = ? WHERE guild_id = ? AND user_id = ? AND released_at IS NULL`,
      nowIso(clock),
      guildId,
      userId,
    );
  }

  function listActive(guildId) {
    return db
      .all(`SELECT * FROM quarantine WHERE guild_id = ? AND released_at IS NULL`, guildId)
      .map((row) => ({ ...row, roleIds: fromJson(row.role_ids, []) }));
  }

  return { record, find, release, listActive };
}
