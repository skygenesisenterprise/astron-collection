-- Guild owns its database. XP, boards and reminders are per guild.
CREATE TABLE IF NOT EXISTS members (
  guild_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  xp         INTEGER NOT NULL DEFAULT 0,
  messages   INTEGER NOT NULL DEFAULT 0,
  last_xp_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS polls (
  id          TEXT PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  channel_id  TEXT NOT NULL,
  message_id  TEXT,
  question    TEXT NOT NULL,
  options     TEXT NOT NULL,
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  closed_at   TEXT
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id      TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  created_at   TEXT NOT NULL,
  PRIMARY KEY (poll_id, user_id)
);

CREATE TABLE IF NOT EXISTS suggestions (
  id         TEXT PRIMARY KEY,
  guild_id   TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  message_id TEXT,
  author_id  TEXT NOT NULL,
  content    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suggestion_votes (
  suggestion_id TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  direction     TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  PRIMARY KEY (suggestion_id, user_id)
);

CREATE TABLE IF NOT EXISTS birthdays (
  guild_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  month      INTEGER NOT NULL,
  day        INTEGER NOT NULL,
  year       INTEGER,
  created_at TEXT NOT NULL,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS birthday_announcements (
  guild_id TEXT NOT NULL,
  day      TEXT NOT NULL,
  PRIMARY KEY (guild_id, day)
);

CREATE TABLE IF NOT EXISTS reminders (
  id           TEXT PRIMARY KEY,
  guild_id     TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  channel_id   TEXT NOT NULL,
  message      TEXT NOT NULL,
  due_at       TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  delivered_at TEXT
);

CREATE INDEX IF NOT EXISTS reminders_due ON reminders (delivered_at, due_at);

CREATE TABLE IF NOT EXISTS reaction_panels (
  id         TEXT PRIMARY KEY,
  guild_id   TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  message_id TEXT,
  title      TEXT NOT NULL,
  options    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

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
