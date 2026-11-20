-- Astron owns its own database file. These tables are its private data.
CREATE TABLE IF NOT EXISTS guild_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id     TEXT NOT NULL,
  event        TEXT NOT NULL,
  guild_name   TEXT,
  member_count INTEGER,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS guild_events_guild ON guild_events (guild_id, created_at);
CREATE INDEX IF NOT EXISTS guild_events_event ON guild_events (event, created_at);

-- Guild-scoped settings; written through the framework settings store.
CREATE TABLE IF NOT EXISTS bot_settings (
  guild_id   TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (guild_id, key)
);
