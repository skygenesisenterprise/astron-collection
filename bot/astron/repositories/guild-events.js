/** Guild join/leave history, private to Astron's database. */

import { nowIso } from "@astron-collection/discord-framework";

export function createGuildEventRepository({ db, clock = () => new Date() }) {
  function record({ guildId, event, guildName = null, memberCount = null }) {
    db.run(
      `INSERT INTO guild_events (guild_id, event, guild_name, member_count, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      guildId,
      event,
      guildName,
      memberCount,
      nowIso(clock),
    );
  }

  function recent(guildId, limit = 10) {
    return db.all(
      `SELECT event, guild_name, member_count, created_at
       FROM guild_events WHERE guild_id = ?
       ORDER BY created_at DESC LIMIT ?`,
      guildId,
      Math.max(1, Math.min(Number(limit) || 10, 50)),
    );
  }

  function totals() {
    const rows = db.all(`SELECT event, COUNT(*) AS count FROM guild_events GROUP BY event`);
    return Object.fromEntries(rows.map((row) => [row.event, Number(row.count)]));
  }

  function purgeOlderThan(days) {
    const cutoff = new Date(clock().getTime() - Number(days) * 86_400_000).toISOString();
    return db.run(`DELETE FROM guild_events WHERE created_at < ?`, cutoff).changes;
  }

  return { record, recent, totals, purgeOlderThan };
}
