-- Logger owns its database. It stores its own projection of Discord events and
-- of the event contracts it consumes; it never reads another bot's database.
CREATE TABLE IF NOT EXISTS log_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id    TEXT NOT NULL,
  category    TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  actor_id    TEXT,
  target_id   TEXT,
  channel_id  TEXT,
  summary     TEXT NOT NULL,
  payload     TEXT,
  source_bot  TEXT NOT NULL,
  event_id    TEXT,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL
);

-- At-least-once delivery: a repeated contract event is stored exactly once.
CREATE UNIQUE INDEX IF NOT EXISTS log_entries_event ON log_entries (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS log_entries_guild ON log_entries (guild_id, received_at DESC);
CREATE INDEX IF NOT EXISTS log_entries_category ON log_entries (guild_id, category, received_at DESC);
CREATE INDEX IF NOT EXISTS log_entries_actor ON log_entries (guild_id, actor_id, received_at DESC);
CREATE INDEX IF NOT EXISTS log_entries_target ON log_entries (guild_id, target_id, received_at DESC);
CREATE INDEX IF NOT EXISTS log_entries_retention ON log_entries (guild_id, received_at);

CREATE TABLE IF NOT EXISTS bot_settings (
  guild_id   TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (guild_id, key)
);
