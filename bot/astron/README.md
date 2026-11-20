# Astron — generalist bot

The general-purpose entry point of the Astron Collection: server and user
information, utilities, help, documentation and general server configuration.

- **Image:** `ghcr.io/skygenesisenterprise/astron`
- **Intents:** `Guilds`, `GuildMembers` — no message content, no moderation, no voice.
- **Database:** its own SQLite file (`data/astron.sqlite3`), never shared.
- **Shared foundation:** `packages/discord-framework` only.

## Commands

| Command | Category | Purpose |
| --- | --- | --- |
| `/about` | support | Bot, version, uptime and links |
| `/help [command]` | support | Catalogue with autocomplete, ecosystem overview |
| `/status` | utility | Health, gateway latency, database, memory (refresh button) |
| `/ping` | utility | Gateway and round-trip latency |
| `/serverinfo` | information | Guild metadata |
| `/userinfo [user]` | information | User/member metadata |
| `/avatar [user]` | information | Avatar |
| `/membercount` | information | Members, humans, bots |
| `/roleinfo <role>` | information | Role metadata and permissions |
| `/channelinfo [channel]` | information | Channel metadata |
| `/docs`, `/support`, `/invite` | support | Documentation, issues, invite link |
| `/language <locale>` | configuration | Per-guild locale (Manage Server) |
| `/config view\|set\|reset` | configuration | Timezone, staff role, announcement channel, locale (Manage Server) |
| User context menu | context | "User information" |

Ownership rule: Astron never implements moderation, logging, community,
automation or audio commands. Those belong to Protect, Logger, Guild,
Automations and Player.

## Configuration

Copy `.env.example` to `.env`, then set:

```bash
ASTRON_ASTRON_DISCORD_TOKEN=...      # this bot's own application
ASTRON_ASTRON_DISCORD_CLIENT_ID=...
```

Command deployment is idempotent and guarded by application id:

```bash
pnpm --filter=@astron-collection/astron run deploy:commands
# --dry-run / --force
```

`ASTRON_COMMAND_SCOPE=global|guild|none`, `ASTRON_COMMAND_GUILD_ID` for guild
scope, `ASTRON_HEALTH_PORT` (default 8080), `ASTRON_DATA_DIR`,
`ASTRON_DATABASE_PATH`, `ASTRON_LOG_LEVEL`.

## Run

```bash
cd bot/astron && pnpm start        # or pnpm dev (--watch)
docker compose -f bot/astron/docker-compose.yml up --build
```

Health: `GET /healthz` (readiness), `GET /livez`, `GET /metrics` (Prometheus).

## Data

- `bot_settings` — guild-scoped configuration (declared keys only, validated).
- `guild_events` — join/leave history used by diagnostics.
- `schema_migrations` — applied migration checksums.

Deleting the volume removes this bot's data only.
