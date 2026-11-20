-- Player owns its playback history and playlists. Every row is guild-scoped.
CREATE TABLE IF NOT EXISTS track_history (
  id               TEXT PRIMARY KEY,
  guild_id         TEXT NOT NULL,
  url              TEXT NOT NULL,
  title            TEXT NOT NULL,
  duration_seconds INTEGER,
  requested_by     TEXT NOT NULL,
  played_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS track_history_recent ON track_history (guild_id, played_at);

CREATE TABLE IF NOT EXISTS playlists (
  id         TEXT PRIMARY KEY,
  guild_id   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id               TEXT PRIMARY KEY,
  playlist_id      TEXT NOT NULL,
  guild_id         TEXT NOT NULL,
  position         INTEGER NOT NULL,
  url              TEXT NOT NULL,
  title            TEXT NOT NULL,
  duration_seconds INTEGER,
  added_by         TEXT NOT NULL,
  added_at         TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS playlist_tracks_order ON playlist_tracks (playlist_id, position);

CREATE TABLE IF NOT EXISTS bot_settings (
  guild_id   TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (guild_id, key)
);

CREATE TABLE IF NOT EXISTS event_outbox (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  payload      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  delivered_at TEXT,
  failed_at    TEXT,
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT
);

CREATE INDEX IF NOT EXISTS event_outbox_pending ON event_outbox (delivered_at, failed_at, created_at);
