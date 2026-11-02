# Astron Collection — Discord bots

Five independent bots share one technical framework. They keep their own
catalogue, services, data and deployment cycle; they never import each other's
commands.

| Bot | Directory | Image | Purpose |
| --- | --- | --- | --- |
| Main | `bot/main` | `astron` | General community bot |
| Protect | `bot/protect` | `astron-protect` | Moderation and protection |
| Logger | `bot/logger` | `astron-logger` | Event and audit logging |
| Player | `bot/player` | `astron-player` | Voice/audio features |
| Guild | `bot/guild` | `guild-center` | Guild center |

`Automation` is listed by the release catalog and the Makefile but its directory
does not exist yet: nothing is fabricated here. It will be created directly on
the framework.

```
bot/<name>/
  index.js              bootstrap (framework runtime + this bot's catalogue)
  config/env.js         environment parsing (framework contract + bot name)
  deploy-commands.js    command deployment (framework deployer)
  commands/             this bot's catalogue only
  events/               this bot's events (interactionCreate is the framework's)
  services/             business services
  utils/                business helpers
  data/                 persisted state (volume)
  Dockerfile            built from the repository root
  docker-compose.yml    one Redis + one bot, per bot
  entrypoint.sh         diagnostics and start
```

The framework lives in `packages/discord-framework`; see its README for the
technical contract. Bots import it with the relative path
`../../packages/discord-framework/src/index.js` so a bot runs from the repository
without a build step, and the image preserves that layout.

## Create a new bot

1. `mkdir -p bot/<name>/{commands,events,config,data}`.
2. Copy `bot/main/package.json`, rename it `@astron-collection/<name>`, keep the
   same scripts.
3. Copy `bot/main/config/env.js`, `index.js` and `deploy-commands.js`, then:
   - `const BOT = "<name>"` and `parseBotConfig(process.env, { bot: "<name>" })`
     must match the directory — `node scripts/check-bots.mjs` enforces it;
   - pick the gateway intents/partials actually needed (document them below);
   - keep `commandsDir`/`eventsDir` pointing inside the new directory.
4. Copy `Dockerfile`, `docker-compose.yml` and `entrypoint.sh`, replacing the bot
   name in the paths, image and `BOT_DIR`.
5. Add the bot to `Makefile` (`BOTS`, `BOT_DIR_*`, `BOT_IMAGE_*`) and to the
   catalog in `.github/workflows/docker-publish.yml` with `context: "."` and
   `file: "./bot/<name>/Dockerfile"`.
6. Give it its **own** Discord application, then set
   `ASTRON_<NAME>_DISCORD_TOKEN` and `ASTRON_<NAME>_DISCORD_CLIENT_ID`
   (`bot/guild-center` → `ASTRON_GUILD_CENTER_…`). Do not reuse another bot's
   token: the shared `DISCORD_TOKEN` fallback is for single-bot setups only and
   is logged as a warning.
7. Run `pnpm check:bots && pnpm test:bots`.

A bot must never be added to another bot's `commands/`, `events/` or imports.

## Add a command

Create `bot/<name>/commands/<command>.js`:

```js
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("example")
  .setDescription("…")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  await interaction.reply("…");
}
```

This legacy shape is adapted by the framework: name, availability
(`dm_permission`) and declared permissions (`default_member_permissions`) are
read from the definition and enforced at execution. For explicit bot permissions,
business policy, cooldown or category, export `defineCommand({...})` instead
(see the framework README). Keep business logic in `services/` — a service must
not import the Discord client.

## Add an event

Create `bot/<name>/events/<event>.js`:

```js
export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) { … }
```

Handlers are isolated: a throw is logged (`event handler failed`) and the process
keeps running. `interactionCreate` is reserved by the framework and skipped.

## Add a module or an interaction

- Module: a folder under `services/` or `utils/`, imported by commands/events.
  Nothing global to declare.
- Button / select / modal: register the handler on the bot's component registry
  (`components.registerButton("poll", handler)`) — handlers are passed to
  `createBotRuntime` via the `components` option — and build the custom id with
  `encodeCustomId({ namespace: "poll", action: "vote", value: pollId })`.
- Autocomplete: export `autocomplete` from the command module or pass it to
  `defineCommand`. Unhandled autocomplete answers an empty list.

## Deploy the commands

`deploy-commands.js` runs on `prestart` and is safe to run at every start:

```bash
cd bot/main
pnpm run deploy:commands            # idempotent
pnpm run deploy:commands -- --dry-run
pnpm run deploy:commands -- --force # ignore the catalogue hash
```

- `ASTRON_COMMAND_SCOPE=global` replaces this application's global catalogue.
- `ASTRON_COMMAND_SCOPE=guild` with `ASTRON_COMMAND_GUILD_ID` scopes it to one
  guild (instant, useful for staging).
- `ASTRON_COMMAND_SCOPE=none` never touches Discord.
- The state file (`bot/<name>/data/command-deployment.json`) records the
  Application ID; a state belonging to another application is refused instead of
  overwriting its catalogue. Several distributions must either use distinct
  Application IDs (recommended) or a coordinated guild-scoped catalogue.

## Official voice presence

Every deployed bot joins the official presence channel silently, after the client
is ready, without any command:

- channel: `1564590674194473000` (central constant, override with
  `ASTRON_PRESENCE_VOICE_CHANNEL_ID`);
- guild: `1369779785273839749` (central constant), overridable with
  `ASTRON_OFFICIAL_GUILD_ID`;
- disable with `ASTRON_VOICE_PRESENCE_ENABLED=false`.

Before connecting, the manager verifies the channel exists, belongs to the
official guild, is a voice/stage channel, and grants `ViewChannel` + `Connect`.
A failure disables presence for that run (logged with a reason) but never blocks
the bot's other features. Third-party guilds are never joined.

Player: presence is a connection state, not an audio player. An audio session
must take a lease from `voice.sessions` (`createVoiceSessionCoordinator`) and
reuse `voice.getConnection()`; the presence manager then adopts that connection
and will not destroy it on shutdown.

## Run, stop, diagnose

Credentials are per bot: `ASTRON_<BOT>_DISCORD_TOKEN` and
`ASTRON_<BOT>_DISCORD_CLIENT_ID` (`main` → `ASTRON_MAIN_…`). The framework reads
the bot-specific variable first; `DISCORD_TOKEN` / `DISCORD_CLIENT_ID` remain a
deprecated fallback and produce a warning, so a multi-bot deployment cannot
silently run two bots on one application.

Local (repository layout, no build):

```bash
cd bot/main
cp .env.example .env         # then set ASTRON_MAIN_DISCORD_TOKEN + ASTRON_MAIN_DISCORD_CLIENT_ID
pnpm start                   # deploy-commands (prestart) then node index.js
pnpm run dev                 # node --watch
```

A `bot/<name>/.env` file wins over the repository `.env`, so each bot can keep
its own credentials locally; Compose and Cloud inject the same variables per
service.

From the repository root:

```bash
pnpm start:main              # same, through the workspace filter
pnpm dev:main
pnpm deploy:main
```

Docker (context is the repository root):

```bash
docker build -f bot/main/Dockerfile -t astron-main .
docker run --rm --env-file bot/main/.env astron-main
# or, per bot, with its own Redis and volume:
docker compose -f bot/main/docker-compose.yml up --build
```

`make docker-up main`, `make docker-dev main`, `make docker-logs main`,
`make docker-down main` drive the same Compose file. Each bot has its own image,
process, Redis and `bot-data` volume; nothing is shared but the framework code.

Diagnostics:

- logs are JSON on stdout/stderr: `{"level":"info","bot":"main","msg":"voice presence connected",…}`;
  filter with `jq 'select(.bot=="main")'`.
- `bot is not configured` lists the missing variables; the process stays alive
  instead of crash-looping.
- `voice presence refused` carries `code` (`VOICE_WRONG_GUILD`,
  `VOICE_CHANNEL_INVALID`, `VOICE_MISSING_PERMISSION`, …) and `reason`.
- `runtime.health()` (logged as `bot health`) exposes readiness, guild count,
  command count and voice state.
- `ASTRON_OFFICIAL_GUILD_ID` already defaults to the official guild constant;
  set it only for a staging guild.

Self / Cloud: the framework depends on neither. Each bot is configured and run
from its own environment; the same image works in both, only the variables and
secrets differ per instance.

## Discord permissions and intents

All five bots currently request the same set, because they ship the same
catalogue today:

| Intents | Why |
| --- | --- |
| `Guilds` | guild/channel cache, commands |
| `GuildMembers` | welcome/farewell, join roles, member moderation |
| `GuildMessages`, `MessageContent` | prefix commands, XP, automod |
| `GuildModeration` | bans, kicks, audit log |
| `GuildMessageReactions` | reaction roles/panels |
| `GuildVoiceStates` | **required for voice presence** |
| `GuildScheduledEvents` | event features |
| `AutoModerationConfiguration`, `AutoModerationExecution` | automod settings/actions |
| `DirectMessages` | welcome DMs, reminders |

Partials: `Channel`, `Message`, `Reaction`, `User`, `GuildMember`.

Required bot permissions per feature (grant on the official guild only as needed):
`View Channels` + `Connect` (voice presence), `Manage Roles` (config roles,
join roles), `Kick Members` / `Ban Members` / `Moderate Members` (moderation),
`Manage Channels` (tickets), `Send Messages` + `Embed Links` (welcome, logs,
levels), `Manage Messages` (purge, polls), `Read Message History` (logging).
Slash commands are registered with their own `default_member_permissions`;
runtime authorization is re-checked regardless.

## Migration status

Migrated onto the framework: bootstrap, lifecycle, command loading/validation,
interaction routing, permissions, error handling, logging, configuration,
command deployment, voice presence. Removed: per-bot `interactionCreate`
handlers and per-bot client/loader/login code (5 duplicated copies).

Still bot-owned by design: command catalogues, events, stores, services and
business rules — including the duplication between the five catalogues, which is
data to review, not framework code.
