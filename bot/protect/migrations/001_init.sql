-- Protect owns its database file. Cases are the moderation source of truth;
-- Logger receives events and stores its own projection.
CREATE TABLE IF NOT EXISTS cases (
  id               TEXT PRIMARY KEY,
  guild_id         TEXT NOT NULL,
  case_number      INTEGER NOT NULL,
  action           TEXT NOT NULL,
  target_id        TEXT NOT NULL,
  target_tag       TEXT,
  moderator_id     TEXT NOT NULL,
  moderator_tag    TEXT,
  reason           TEXT NOT NULL,
  duration_seconds INTEGER,
  status           TEXT NOT NULL DEFAULT 'open',
  note             TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  UNIQUE (guild_id, case_number)
);

CREATE INDEX IF NOT EXISTS cases_guild ON cases (guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cases_target ON cases (guild_id, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cases_moderator ON cases (guild_id, moderator_id, created_at DESC);

CREATE TABLE IF NOT EXISTS quarantine (
  guild_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  role_ids   TEXT NOT NULL,
  created_at TEXT NOT NULL,
  released_at TEXT,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS detections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id     TEXT NOT NULL,
  user_id      TEXT,
  channel_id   TEXT,
  kind         TEXT NOT NULL,
  severity     TEXT NOT NULL,
  detail       TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS detections_guild ON detections (guild_id, created_at DESC);

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
