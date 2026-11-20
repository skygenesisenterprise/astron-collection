# Protect — moderation and security

Moderation, anti-spam, anti-raid, phishing protection, quarantine and moderation
case management.

- **Image:** `ghcr.io/skygenesisenterprise/protect`
- **Intents:** `Guilds`, `GuildMembers`, `GuildMessages`, `MessageContent`, `GuildModeration`, `AutoModerationExecution`.
- **Data:** own SQLite database (`cases`, `quarantine`, `detections`, `bot_settings`, `event_outbox`).

## Commands

| Command | Purpose | Permission |
| --- | --- | --- |
| `/warn add\|list\|clear` | Warnings stored as cases | Moderate Members |
| `/case list\|view\|note\|close` | Moderation case book | Moderate Members |
| `/ban`, `/unban` | Bans with hierarchy checks | Ban Members |
| `/kick` | Kick | Kick Members |
| `/timeout add\|remove` | Temporary exclusion | Moderate Members |
| `/purge` | Filtered bulk delete | Manage Messages |
| `/slowmode` | Channel slowmode | Manage Channels |
| `/lock lock\|unlock` | Channel lockdown | Manage Channels |
| `/quarantine add\|remove` | Isolate and restore roles | Manage Roles |
| `/security status\|audit\|configure` | Protection settings, permission audit | Manage Server |
| `/modstats` | Moderation activity | Moderate Members |

Every member-targeted action is fail-closed on role hierarchy, refuses the guild
owner/self/the bot, and writes a numbered case.

## Automatic protection

- **Anti-spam:** sliding window per member; deletes the triggering message and
  times out the author.
- **Anti-raid:** joins per minute and account age; quarantine, kick or alert.
- **Anti-phishing:** deletes known impersonation/nitro-gift hosts.
- **Mention spam:** deletes messages above the configured mention count.
- **Discord AutoModeration:** recorded as detections and `security.alert` events.

Thresholds are per-guild (`/security configure`).

## Event contracts (producer)

Protect emits `moderation.case.created`, `moderation.case.updated` and
`security.alert` (v1) to the outbox, in the same transaction as the case.
Delivery uses an HMAC-signed HTTP webhook (`ASTRON_EVENT_URL` +
`ASTRON_EVENT_SECRET`); Logger verifies the signature and deduplicates by event
id. Without a receiver, events stay pending in Protect's own outbox — nothing is
lost and no database is shared.

## Run

```bash
cd bot/protect && pnpm start
docker compose -f bot/protect/docker-compose.yml up --build
```

Health: `/healthz`, `/livez`, `/metrics`.
