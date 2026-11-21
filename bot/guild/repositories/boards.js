/** Polls, votes, suggestions and suggestion votes. */

import { fromJson, nowIso, toJson } from "@astron-collection/discord-framework";

export function createBoardRepository({ db, clock = () => new Date() }) {
  function pollCreate({ id, guildId, channelId, messageId = null, question, options, createdBy }) {
    db.run(
      `INSERT INTO polls (id, guild_id, channel_id, message_id, question, options, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      guildId,
      channelId,
      messageId,
      question,
      toJson(options),
      createdBy,
      nowIso(clock),
    );
    return pollGet(guildId, id);
  }

  function pollGet(guildId, id) {
    const row = db.get(`SELECT * FROM polls WHERE guild_id = ? AND id = ?`, guildId, id);
    return row ? { ...row, options: fromJson(row.options, []) } : null;
  }

  function pollSetMessage(id, messageId) {
    db.run(`UPDATE polls SET message_id = ? WHERE id = ?`, messageId, id);
  }

  function pollVote({ pollId, userId, optionIndex }) {
    const existing = db.get(`SELECT * FROM poll_votes WHERE poll_id = ? AND user_id = ?`, pollId, userId);
    if (existing && Number(existing.option_index) === Number(optionIndex)) {
      db.run(`DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?`, pollId, userId);
      return { removed: true };
    }
    db.run(
      `INSERT INTO poll_votes (poll_id, user_id, option_index, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = excluded.option_index`,
      pollId,
      userId,
      optionIndex,
      nowIso(clock),
    );
    return { removed: false };
  }

  function pollResults(pollId) {
    const rows = db.all(
      `SELECT option_index, COUNT(*) AS count FROM poll_votes WHERE poll_id = ? GROUP BY option_index`,
      pollId,
    );
    const counts = Object.fromEntries(rows.map((row) => [String(row.option_index), Number(row.count)]));
    return { counts, total: rows.reduce((sum, row) => sum + Number(row.count), 0) };
  }

  function pollClose(guildId, id) {
    db.run(
      `UPDATE polls SET closed_at = ? WHERE guild_id = ? AND id = ? AND closed_at IS NULL`,
      nowIso(clock),
      guildId,
      id,
    );
    return pollGet(guildId, id);
  }

  function pollLatestOpen(guildId, channelId = null) {
    const row = channelId
      ? db.get(
          `SELECT * FROM polls WHERE guild_id = ? AND channel_id = ? AND closed_at IS NULL ORDER BY created_at DESC LIMIT 1`,
          guildId,
          channelId,
        )
      : db.get(
          `SELECT * FROM polls WHERE guild_id = ? AND closed_at IS NULL ORDER BY created_at DESC LIMIT 1`,
          guildId,
        );
    return row ? { ...row, options: fromJson(row.options, []) } : null;
  }

  function suggestionCreate({ id, guildId, channelId, messageId = null, authorId, content }) {
    db.run(
      `INSERT INTO suggestions (id, guild_id, channel_id, message_id, author_id, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      guildId,
      channelId,
      messageId,
      authorId,
      content,
      nowIso(clock),
    );
    return suggestionGet(guildId, id);
  }

  function suggestionGet(guildId, id) {
    return db.get(`SELECT * FROM suggestions WHERE guild_id = ? AND id = ?`, guildId, id);
  }

  function suggestionSetMessage(id, messageId) {
    db.run(`UPDATE suggestions SET message_id = ? WHERE id = ?`, messageId, id);
  }

  function suggestionVote({ suggestionId, userId, direction }) {
    if (!["up", "down"].includes(direction)) throw new Error("Invalid vote direction.");
    const existing = db.get(
      `SELECT * FROM suggestion_votes WHERE suggestion_id = ? AND user_id = ?`,
      suggestionId,
      userId,
    );
    if (existing && existing.direction === direction) {
      db.run(`DELETE FROM suggestion_votes WHERE suggestion_id = ? AND user_id = ?`, suggestionId, userId);
      return { removed: true };
    }
    db.run(
      `INSERT INTO suggestion_votes (suggestion_id, user_id, direction, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (suggestion_id, user_id) DO UPDATE SET direction = excluded.direction`,
      suggestionId,
      userId,
      direction,
      nowIso(clock),
    );
    return { removed: false };
  }

  function suggestionResults(suggestionId) {
    const rows = db.all(
      `SELECT direction, COUNT(*) AS count FROM suggestion_votes WHERE suggestion_id = ? GROUP BY direction`,
      suggestionId,
    );
    const counts = Object.fromEntries(rows.map((row) => [row.direction, Number(row.count)]));
    return { up: counts.up ?? 0, down: counts.down ?? 0 };
  }

  function suggestionSetStatus(guildId, id, status) {
    db.run(`UPDATE suggestions SET status = ? WHERE guild_id = ? AND id = ?`, status, guildId, id);
    return suggestionGet(guildId, id);
  }

  function suggestionList(guildId, status = null, limit = 10) {
    return status
      ? db.all(
          `SELECT * FROM suggestions WHERE guild_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?`,
          guildId,
          status,
          limit,
        )
      : db.all(
          `SELECT * FROM suggestions WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?`,
          guildId,
          limit,
        );
  }

  return {
    pollCreate,
    pollGet,
    pollSetMessage,
    pollVote,
    pollResults,
    pollClose,
    pollLatestOpen,
    suggestionCreate,
    suggestionGet,
    suggestionSetMessage,
    suggestionVote,
    suggestionResults,
    suggestionSetStatus,
    suggestionList,
  };
}
