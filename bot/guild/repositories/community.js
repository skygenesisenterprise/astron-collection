/** Birthdays, reminders and reaction-role panels. */

import { fromJson, nowIso, toJson } from "../../../packages/discord-framework/src/index.js";

export function createCommunityRepository({ db, clock = () => new Date() }) {
  function birthdaySet({ guildId, userId, month, day, year = null }) {
    db.run(
      `INSERT INTO birthdays (guild_id, user_id, month, day, year, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (guild_id, user_id) DO UPDATE SET
         month = excluded.month, day = excluded.day, year = excluded.year`,
      guildId,
      userId,
      month,
      day,
      year,
      nowIso(clock),
    );
  }

  function birthdayRemove(guildId, userId) {
    return db.run(`DELETE FROM birthdays WHERE guild_id = ? AND user_id = ?`, guildId, userId).changes;
  }

  function birthdayList(guildId) {
    return db.all(`SELECT * FROM birthdays WHERE guild_id = ? ORDER BY month, day`, guildId);
  }

  function birthdaysOn(guildId, month, day) {
    return db.all(
      `SELECT * FROM birthdays WHERE guild_id = ? AND month = ? AND day = ?`,
      guildId,
      month,
      day,
    );
  }

  function claimBirthdayAnnouncement(guildId, dayKey) {
    const result = db.run(
      `INSERT OR IGNORE INTO birthday_announcements (guild_id, day) VALUES (?, ?)`,
      guildId,
      dayKey,
    );
    return result.changes > 0;
  }

  function reminderAdd({ id, guildId, userId, channelId, message, dueAt }) {
    db.run(
      `INSERT INTO reminders (id, guild_id, user_id, channel_id, message, due_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      guildId,
      userId,
      channelId,
      message,
      dueAt,
      nowIso(clock),
    );
  }

  function reminderList(guildId, userId = null) {
    if (userId) {
      return db.all(
        `SELECT * FROM reminders WHERE guild_id = ? AND user_id = ? AND delivered_at IS NULL ORDER BY due_at`,
        guildId,
        userId,
      );
    }
    return db.all(
      `SELECT * FROM reminders WHERE guild_id = ? AND delivered_at IS NULL ORDER BY due_at`,
      guildId,
    );
  }

  function reminderRemove(id, guildId, userId) {
    return db.run(
      `DELETE FROM reminders WHERE id = ? AND guild_id = ? AND user_id = ? AND delivered_at IS NULL`,
      id,
      guildId,
      userId,
    ).changes;
  }

  function remindersDue(nowIsoValue, limit = 20) {
    return db.all(
      `SELECT * FROM reminders WHERE delivered_at IS NULL AND due_at <= ? ORDER BY due_at LIMIT ?`,
      nowIsoValue,
      limit,
    );
  }

  function reminderDelivered(id) {
    db.run(`UPDATE reminders SET delivered_at = ? WHERE id = ?`, nowIso(clock), id);
  }

  function panelCreate({ id, guildId, channelId, messageId, title, options }) {
    db.run(
      `INSERT INTO reaction_panels (id, guild_id, channel_id, message_id, title, options, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      guildId,
      channelId,
      messageId,
      title,
      toJson(options),
      nowIso(clock),
    );
  }

  function panelGet(guildId, id) {
    const row = db.get(`SELECT * FROM reaction_panels WHERE guild_id = ? AND id = ?`, guildId, id);
    return row ? { ...row, options: fromJson(row.options, []) } : null;
  }

  function panelList(guildId) {
    return db
      .all(`SELECT * FROM reaction_panels WHERE guild_id = ? ORDER BY created_at DESC`, guildId)
      .map((row) => ({ ...row, options: fromJson(row.options, []) }));
  }

  function panelUpdate(id, guildId, options) {
    db.run(
      `UPDATE reaction_panels SET options = ? WHERE id = ? AND guild_id = ?`,
      toJson(options),
      id,
      guildId,
    );
  }

  function panelDelete(id, guildId) {
    return db.run(`DELETE FROM reaction_panels WHERE id = ? AND guild_id = ?`, id, guildId).changes;
  }

  function panelSetMessage(id, guildId, messageId) {
    db.run(`UPDATE reaction_panels SET message_id = ? WHERE id = ? AND guild_id = ?`, messageId, id, guildId);
  }

  return {
    birthdaySet,
    birthdayRemove,
    birthdayList,
    birthdaysOn,
    claimBirthdayAnnouncement,
    reminderAdd,
    reminderList,
    reminderRemove,
    remindersDue,
    reminderDelivered,
    panelCreate,
    panelGet,
    panelList,
    panelUpdate,
    panelDelete,
    panelSetMessage,
  };
}
