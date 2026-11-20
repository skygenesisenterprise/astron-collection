/** Security detections, kept locally and mirrored as security.alert events. */

import { nowIso } from "../../../packages/discord-framework/src/index.js";

export function createDetectionRepository({ db, clock = () => new Date() }) {
  function record({ guildId, userId = null, channelId = null, kind, severity, detail, actionTaken }) {
    db.run(
      `INSERT INTO detections (guild_id, user_id, channel_id, kind, severity, detail, action_taken, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      guildId,
      userId,
      channelId,
      kind,
      severity,
      detail,
      actionTaken,
      nowIso(clock),
    );
  }

  function recent(guildId, limit = 10) {
    return db.all(
      `SELECT kind, severity, detail, action_taken, created_at
       FROM detections WHERE guild_id = ? ORDER BY id DESC LIMIT ?`,
      guildId,
      Math.max(1, Math.min(limit, 50)),
    );
  }

  function countSince(guildId, since) {
    return Number(
      db.get(
        `SELECT COUNT(*) AS count FROM detections WHERE guild_id = ? AND created_at >= ?`,
        guildId,
        since,
      ).count,
    );
  }

  return { record, recent, countSince };
}
