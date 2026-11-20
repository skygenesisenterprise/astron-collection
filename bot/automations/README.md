# Automations

Automations runs per-guild workflows. A workflow is an ordered list of actions
triggered by a message, a member join, a cron schedule or a versioned contract
event delivered by another bot.

## Commands

| Command | Subcommands |
| --- | --- |
| `/workflow` | `create`, `list`, `show`, `enable`, `disable`, `delete` |
| `/trigger` | `add`, `remove`, `list` |
| `/action` | `add`, `remove`, `list` |
| `/schedule` | `list`, `clear` |
| `/test` | dry-run, no side effects |
| `/history` | recent runs and counters |

## Trigger types

- `message` — optional `contains`, `channelId`, role condition.
- `member_join` — every new member.
- `schedule` — five-field cron, evaluated in UTC. Add it with
  `/trigger add type:schedule cron:"0 9 * * 1"`.
- `event` — a contract event such as `moderation.case.created`, received on the
  signed ingest endpoint (`ASTRON_EVENT_SECRET`, `ASTRON_INGEST_PATH`).

## Actions

`send_message`, `dm`, `add_role`, `remove_role` and `emit_event`. Messages
support `{user}`, `{user.name}`, `{server}`, `{channel}` and `{content}`.
Actions run in order, each retried twice on failure; a failure is recorded but
does not stop the remaining actions.

## Reliability

- Every run is recorded with its steps, status and error in `workflow_runs`.
- Idempotency keys prevent duplicate executions from gateway reconnects,
  overlapping schedulers or repeated signed events. A unique partial index
  enforces it in SQLite, not only in memory.
- The scheduler ticks every 15 s and only executes a given minute once.
- The transactional outbox holds `workflow.executed` events until Logger accepts
  them, with HMAC-SHA256 signatures.

## Data

One SQLite database owned by Automations: `workflows`, `workflow_triggers`,
`workflow_actions`, `workflow_runs`, `bot_settings`, `event_outbox`. Every row
is scoped by `guild_id`.

## Run

```sh
pnpm install
cp bot/automations/.env.example bot/automations/.env
pnpm --filter @astron-collection/automations deploy:commands
pnpm --filter @astron-collection/automations start
```

Docker: `docker compose -f bot/automations/docker-compose.yml up -d`.
Health and metrics: `/healthz`, `/livez`, `/metrics` (port 3014).

## Tests

```sh
node --disable-warning=ExperimentalWarning --test bot/automations/tests/
```
