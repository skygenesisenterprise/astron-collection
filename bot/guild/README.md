# Guild

Guild is the community engagement bot of the Astron Collection. It owns welcome
and farewell messages, autoroles, XP and levels, reaction-role panels, polls,
suggestions, birthdays and reminders. It never moderates, never logs audit
events and never plays music: those belong to Protect, Logger and Player.

## Commands

| Command | Subcommands | Permission |
| --- | --- | --- |
| `/welcome` | `setup`, `preview`, `disable` | Manage Guild |
| `/farewell` | `setup`, `preview`, `disable` | Manage Guild |
| `/autorole` | `add`, `remove`, `list`, `disable` | Manage Roles |
| `/reactionrole` | `create`, `add`, `remove`, `list`, `delete` | Manage Roles |
| `/levels` | `enable`, `disable`, `config`, `reward-add`, `reward-remove`, `reward-list`, `reset` | Manage Guild |
| `/rank` | — | Everyone |
| `/leaderboard` | — | Everyone |
| `/poll` | `create`, `close` | Manage Guild |
| `/suggest` | — | Everyone (60 s cooldown) |
| `/suggestions` | `config`, `list`, `status` | Manage Guild |
| `/birthday` | `set`, `remove`, `list`, `upcoming` | Everyone |
| `/reminder` | `add`, `list`, `remove` | Everyone |

## XP model

`xpForLevel(level) = 100 + 25 × level`. Each qualifying message grants
`xpPerMessage` (default 5) once per `cooldownSeconds` (default 60). Both values
are stored per guild and the cooldown timestamp lives in SQLite, so a restart
cannot be used to farm XP. A level reward is a role granted at an exact level.

## Events

Guild emits versioned envelopes through its transactional outbox:

- `member.joined` — `{ userId, memberCount, accountCreatedAt }`
- `member.left` — `{ userId, memberCount, joinedAt }`
- `level.up` — `{ userId, level, totalXp }`
- `suggestion.created` — `{ suggestionId, authorId, content }`

Delivery is an HMAC-signed HTTP POST to `ASTRON_EVENT_URL`; without a URL the
events stay in the outbox and no data leaves the bot.

## Data

One SQLite database (`ASTRON_DATABASE_PATH`) owned exclusively by Guild:
`members`, `polls`, `poll_votes`, `suggestions`, `suggestion_votes`,
`birthdays`, `birthday_announcements`, `reminders`, `reaction_panels`,
`bot_settings` and `event_outbox`. Every row carries `guild_id`; repositories
always filter on it.

## Run

```sh
pnpm install
cp bot/guild/.env.example bot/guild/.env   # fill the Discord credentials
pnpm --filter @astron-collection/guild deploy:commands
pnpm --filter @astron-collection/guild start
```

Docker:

```sh
docker build -f bot/guild/Dockerfile -t ghcr.io/skygenesisenterprise/astron/guild .
docker compose -f bot/guild/docker-compose.yml up -d
```

Health: `GET /healthz`, `GET /livez`, `GET /metrics` on `ASTRON_HEALTH_PORT`
(default 3013). Graceful shutdown flushes timers and closes the database.

## Tests

```sh
node --disable-warning=ExperimentalWarning --test bot/guild/tests/
```
