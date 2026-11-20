-- Workflows are exclusively owned by one guild; every query filters guild_id.
CREATE TABLE IF NOT EXISTS workflows (
  id          TEXT PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  enabled     INTEGER NOT NULL DEFAULT 1,
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id          TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  guild_id    TEXT NOT NULL,
  type        TEXT NOT NULL,
  config      TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS workflow_triggers_type ON workflow_triggers (guild_id, type);

CREATE TABLE IF NOT EXISTS workflow_actions (
  id          TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  guild_id    TEXT NOT NULL,
  position    INTEGER NOT NULL,
  type        TEXT NOT NULL,
  config      TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS workflow_actions_workflow ON workflow_actions (workflow_id, position);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id              TEXT PRIMARY KEY,
  workflow_id     TEXT NOT NULL,
  guild_id        TEXT NOT NULL,
  trigger_type    TEXT NOT NULL,
  status          TEXT NOT NULL,
  detail          TEXT NOT NULL DEFAULT '[]',
  idempotency_key TEXT,
  started_at      TEXT NOT NULL,
  finished_at     TEXT NOT NULL,
  error           TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS workflow_runs_idempotent
  ON workflow_runs (workflow_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS workflow_runs_recent ON workflow_runs (guild_id, started_at);

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
