/** Playback history and playlists. */

import { nowIso } from "@astron-collection/discord-framework";

export function createMusicRepository({ db, clock = () => new Date() }) {
  function historyAdd({ id, guildId, url, title, durationSeconds, requestedBy }) {
    db.run(
      `INSERT INTO track_history (id, guild_id, url, title, duration_seconds, requested_by, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      guildId,
      url,
      title,
      durationSeconds ?? null,
      requestedBy,
      nowIso(clock),
    );
  }

  function historyList(guildId, limit = 10) {
    return db.all(
      `SELECT * FROM track_history WHERE guild_id = ? ORDER BY played_at DESC LIMIT ?`,
      guildId,
      Math.max(1, Math.min(Number(limit) || 10, 50)),
    );
  }

  function playlistCreate({ id, guildId, name, createdBy }) {
    db.run(
      `INSERT INTO playlists (id, guild_id, name, created_by, created_at) VALUES (?, ?, ?, ?, ?)`,
      id,
      guildId,
      name,
      createdBy,
      nowIso(clock),
    );
    return playlistGet(guildId, id);
  }

  function playlistGet(guildId, id) {
    return db.get(`SELECT * FROM playlists WHERE guild_id = ? AND id = ?`, guildId, id) ?? null;
  }

  function playlistList(guildId) {
    return db.all(`SELECT * FROM playlists WHERE guild_id = ? ORDER BY created_at DESC`, guildId);
  }

  function playlistDelete(guildId, id) {
    db.run(`DELETE FROM playlist_tracks WHERE guild_id = ? AND playlist_id = ?`, guildId, id);
    return db.run(`DELETE FROM playlists WHERE guild_id = ? AND id = ?`, guildId, id).changes > 0;
  }

  function trackAdd({ id, playlistId, guildId, url, title, durationSeconds, addedBy }) {
    const next = Number(
      db.get(
        `SELECT COALESCE(MAX(position), 0) + 1 AS next FROM playlist_tracks WHERE playlist_id = ?`,
        playlistId,
      ).next,
    );
    db.run(
      `INSERT INTO playlist_tracks
        (id, playlist_id, guild_id, position, url, title, duration_seconds, added_by, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      playlistId,
      guildId,
      next,
      url,
      title,
      durationSeconds ?? null,
      addedBy,
      nowIso(clock),
    );
  }

  function tracks(playlistId, guildId) {
    return db.all(
      `SELECT * FROM playlist_tracks WHERE playlist_id = ? AND guild_id = ? ORDER BY position`,
      playlistId,
      guildId,
    );
  }

  function trackRemove(guildId, playlistId, position) {
    const row = db.get(
      `SELECT * FROM playlist_tracks WHERE playlist_id = ? AND guild_id = ? AND position = ?`,
      playlistId,
      guildId,
      position,
    );
    if (!row) return false;
    db.run(`DELETE FROM playlist_tracks WHERE id = ?`, row.id);
    return true;
  }

  return {
    historyAdd,
    historyList,
    playlistCreate,
    playlistGet,
    playlistList,
    playlistDelete,
    trackAdd,
    tracks,
    trackRemove,
  };
}
