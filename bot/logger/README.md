# Logger — audit and logging

Discord event logging, searchable audit records, export and retention.

- **Image:** `ghcr.io/skygenesisenterprise/logger`
- **Intents:** `Guilds`, `GuildMembers`, `GuildMessages`, `MessageContent`, `GuildModeration`.
- **Data:** own SQLite database (`log_entries`), never a shared one.

## Commands

| Command | Purpose |
| --- | --- |
| `/logs setup <channel>` | Mirror audit events to a channel |
| `/logs disable` | Stop mirroring (records remain queryable) |
| `/logs status` | Destination, categories, retention, volume |
| `/logs events <category> <enabled>` | Toggle messages/members/channels/roles/moderation/security/automation/community |
| `/logs ignore\|unignore [channel] [user]` | Per-guild exclusions |
| `/logs retention <days>` | 1–3650 days, swept every 6 hours |
| `/audit search [query] [category] [actor] [target] [page]` | Searchable records |
| `/audit view <id>` | Full record and payload |
| `/audit export [category] [query]` | JSON attachment (bounded) |

All commands require Manage Server: audit data is sensitive.

## Sources

1. **Discord gateway** (message, member, channel, role and ban events) projected
   by `services/discord-event-projector.js`.
2. **Versioned contracts** from Protect, Guild, Automations and Player, delivered
   to `POST /ingest/events` with an HMAC-SHA256 signature
   (`x-astron-signature`, `x-astron-timestamp`). The receiver verifies the
   signature, validates the v1 payload and deduplicates by envelope id, so an
   outbox retry is harmless.

Logger never opens another bot's database.

## Run

```bash
cd bot/logger && pnpm start
docker compose -f bot/logger/docker-compose.yml up --build
```

Readiness `/healthz`, `/livez`, Prometheus `/metrics`. The ingest route is only
registered when `ASTRON_EVENT_SECRET` is set.
