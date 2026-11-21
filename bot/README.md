# Astron Collection — Discord bots

Six independent bots share one technical foundation and nothing else. Each has
its own Discord application, token, command registry, configuration, SQLite
database, tests, Docker image and deployment.

| Bot | Directory | Image | Port | Owns |
| --- | --- | --- | --- | --- |
| Astron | `bot/astron` | `ghcr.io/skygenesisenterprise/astron` | 3010 | General: help, status, info, docs, support, invite, language, config |
| Protect | `bot/protect` | `ghcr.io/skygenesisenterprise/astron/protect` | 3011 | Moderation, cases, quarantine, security, raid protection |
| Logger | `bot/logger` | `ghcr.io/skygenesisenterprise/astron/logger` | 3012 | Audit log, message/member/role/channel events, log search, signed ingest |
| Guild | `bot/guild` | `ghcr.io/skygenesisenterprise/astron/guild` | 3013 | Welcome, autorole, XP/levels, reaction roles, polls, suggestions, birthdays, reminders |
| Automations | `bot/automations` | `ghcr.io/skygenesisenterprise/astron/automations` | 3014 | Workflows: message/member/schedule/event triggers and ordered actions |
| Player | `bot/player` | `ghcr.io/skygenesisenterprise/astron/player` | 3015 | Voice queues, playback controls, playlists, history |

No bot loads another bot's catalogue. `node scripts/check-bots.mjs` enforces it
in CI, together with the required files and the shared-framework import.

## Shared foundation

`packages/discord-framework`, imported as `@astron-collection/discord-framework`,
contains technical capabilities only: lifecycle,
command contract and loader, interaction router and components, permissions,
errors, structured logs, configuration, command deployment, voice presence,
SQLite storage and checksummed migrations, settings, localization, health and
metrics, UI builders, event contracts/outbox/signed webhooks, and the bootstrap
helper.

All six bots use the same presence format: `{guild count} Guild - {member count} Member`.
Counts sum each bot's cached guild member totals and refresh on guild/member events.

## Cross-bot contracts

Bots never read each other's databases. They emit versioned envelopes through a
transactional outbox and deliver them as HMAC-SHA256 signed HTTP requests:

| Event | Producer | Notable consumers |
| --- | --- | --- |
| `moderation.case.created`, `moderation.case.updated` | Protect | Logger |
| `security.alert` | Protect | Logger |
| `member.joined`, `member.left` | Guild | Logger, Automations |
| `level.up` | Guild | Logger |
| `suggestion.created` | Guild | Logger |
| `workflow.executed` | Automations | Logger |
| `track.started` | Player | Logger |

Logger exposes `POST /ingest/events` (path configurable) and verifies the
signature and timestamp before projecting the event. Consumers deduplicate by
event id, so retries are safe.

## Run locally

```sh
pnpm install
for bot in astron automations guild logger player protect; do
  cp bot/$bot/.env.example bot/$bot/.env
done
# Fill credentials (and a shared ASTRON_EVENT_SECRET) in each .env.

docker compose -f docker-compose.bots.yml up -d --build
docker compose -f docker-compose.bots.yml ps
```

Every container exposes `/healthz`, `/livez` and `/metrics`. Data lives in a
named volume per bot. Stop with `docker compose -f docker-compose.bots.yml down`
(volumes are preserved).

Without Docker, each bot runs from its directory:

```sh
cd bot/astron
node --disable-warning=ExperimentalWarning deploy-commands.js
node --disable-warning=ExperimentalWarning index.js
```

## Tests

```sh
node --disable-warning=ExperimentalWarning --test packages/discord-framework/test/*.test.js
for bot in astron automations guild logger player protect; do
  node --disable-warning=ExperimentalWarning --test bot/$bot/test*/*.test.js
done
node scripts/check-bots.mjs
```

`astron`, `protect` and `logger` keep their tests under `test/`; `guild`,
`automations` and `player` use `tests/`. The check script accepts both.

## Conventions

- Plain ESM JavaScript with JSDoc. No build step, so the same files run in tests,
  locally and in the container.
- `bot/<name>/config/bot.js` declares the bot name and defaults;
  `config/env.js` validates the environment through the framework.
- Commands use `defineCommand` and live only in the owning bot's `commands/`.
- Events export `name` + `execute`, or an `events` array for grouped listeners.
- Repositories always filter by `guild_id`; migrations are checksummed and
  applied at startup.
- Graceful shutdown closes timers, voice sessions and SQLite.
- Secrets are only read from the environment and redacted in logs.
