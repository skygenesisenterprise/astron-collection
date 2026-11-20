/** XP rows, one per guild and member. */

export function createMemberRepository({ db }) {
  function get(guildId, userId) {
    return (
      db.get(`SELECT * FROM members WHERE guild_id = ? AND user_id = ?`, guildId, userId) ?? {
        guild_id: guildId,
        user_id: userId,
        xp: 0,
        messages: 0,
        last_xp_at: 0,
      }
    );
  }

  function addXp(guildId, userId, amount, now) {
    db.run(
      `INSERT INTO members (guild_id, user_id, xp, messages, last_xp_at)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT (guild_id, user_id) DO UPDATE SET
         xp = xp + excluded.xp,
         messages = messages + 1,
         last_xp_at = excluded.last_xp_at`,
      guildId,
      userId,
      Math.max(0, Number(amount) || 0),
      now,
    );
    return get(guildId, userId);
  }

  function top(guildId, limit = 10) {
    return db.all(
      `SELECT * FROM members WHERE guild_id = ? AND xp > 0 ORDER BY xp DESC, messages DESC LIMIT ?`,
      guildId,
      Math.max(1, Math.min(Number(limit) || 10, 50)),
    );
  }

  function rank(guildId, userId) {
    const row = get(guildId, userId);
    if (!row || row.xp <= 0) return null;
    const ahead = db.get(
      `SELECT COUNT(*) AS count FROM members WHERE guild_id = ? AND xp > ?`,
      guildId,
      row.xp,
    );
    return Number(ahead.count) + 1;
  }

  function count(guildId) {
    return Number(db.get(`SELECT COUNT(*) AS count FROM members WHERE guild_id = ?`, guildId).count);
  }

  function reset(guildId, userId) {
    if (userId) db.run(`DELETE FROM members WHERE guild_id = ? AND user_id = ?`, guildId, userId);
    else db.run(`DELETE FROM members WHERE guild_id = ?`, guildId);
  }

  return { get, addXp, top, rank, count, reset };
}
