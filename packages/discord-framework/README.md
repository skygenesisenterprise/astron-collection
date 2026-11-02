# @astron-collection/discord-framework

Technical foundation shared by the Astron Collection Discord bots. It contains
**no business logic**: no command, no event, no guild setting, no domain rule of
`main`, `protect`, `logger`, `player` or `guild` lives here.

```
bot/<name>/          own catalogue: commands, events, services, repositories, config
packages/discord-framework/   shared technical mechanisms
```

## Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/lifecycle.js` | client creation, bootstrap, login retries, `clientReady`, SIGTERM/SIGINT, shutdown, health |
| `src/commands/contract.js` | command contract: definition, id, category, handler, availability, permissions, cooldown, metadata |
| `src/commands/registry.js` | per-bot registry, duplicate detection, **foreign-bot rejection** |
| `src/commands/loader.js` | command/event discovery inside one directory, per-file error containment |
| `src/interactions/router.js` | routing for slash/user/message commands, buttons, selects, modals, autocomplete |
| `src/interactions/custom-id.js` | versioned `astron:v1:<namespace>:<action>[:<value>]` ids, strict parsing |
| `src/interactions/components.js` | per-bot button/select/modal handler registry |
| `src/permissions.js` | layered authorization, fail-closed |
| `src/errors.js` | expected vs unexpected errors, safe user messages |
| `src/logger.js` | structured JSON logs, secret redaction |
| `src/config/env.js` | environment parsing, required variables, defaults, warnings |
| `src/deploy/commands.js` | idempotent, guarded command deployment |
| `src/voice/*` | official voice presence, connection adapter, session coordination |

The package has **no runtime dependency**: `discord.js` and `@discordjs/voice` are
peer dependencies loaded lazily, and every side effect (REST client, voice
library, filesystem) is injectable. That is why the suite runs with `node --test`
and no install step.

## Command contract

A command separates its Discord definition, its handler and its metadata. The
legacy shape (`export const data` + `export function execute`) is adapted by
`adaptLegacyCommand`, which is what the current bots use; new commands should use
`defineCommand`:

```js
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { defineCommand } from "@astron-collection/discord-framework";

export default defineCommand({
  data: new SlashCommandBuilder().setName("ban").setDescription("Bannir un membre."),
  category: "moderation",
  availability: { guildOnly: true, dmOnly: false },
  permissions: {
    user: [PermissionFlagsBits.BanMembers],
    bot: [PermissionFlagsBits.BanMembers],
    policy: async ({ interaction }) => interaction.inGuild(), // business rule, fail-closed
  },
  cooldown: { seconds: 0, scope: "user" },
  metadata: { deployment: { scope: "global" }, documentation: "docs/commands/ban.md" },
  execute: async (interaction, { logger }) => {
    await interaction.reply("…");
  },
});
```

`permissions.user` comes from the builder's `default_member_permissions` for
legacy commands (a decimal bitmask, normalized to `BigInt`). It is only a
Discord registration hint: the router **re-checks it on every execution**, then
the bot permissions, then the business policy.

## Interaction routing

`createInteractionRouter` handles:

- slash commands (`isChatInputCommand`)
- user and message context menus
- buttons (`isButton`), select menus (`isAnySelectMenu`), modals (`isModalSubmit`)
- autocomplete (`isAutocomplete`)

Component handlers are registered per bot by custom-id namespace:

```js
components.registerButton("poll", async (interaction, { id, logger }) => {
  // id.namespace === "poll", id.action, id.value (validated, never a secret)
});
```

Ids are built with `encodeCustomId({ namespace, action, value })`. Unknown,
malformed, oversized or previous-version ids produce a safe ephemeral reply and
a warning: they never reach a handler and never crash the process.

## Permissions

Four layers, never merged:

1. native Discord permissions of the user — checked at execution;
2. native Discord permissions of the bot — checked at execution;
3. Astron business rules — the bot's `policy` callback;
4. registration-time declaration — Discord visibility only.

A missing holder, a throwing policy, or an unreadable permission set is a
**denial**. `checkCommandPermissions` returns `{ ok, code, reason }` and the
router answers the user accordingly.

## Lifecycle, errors, logs

- `createBotRuntime({ bot, config, logger, registry, commandsDir, eventsDir, voice })`
  loads the bot catalogue, registers `interactionCreate`, loads the bot's events
  (each wrapped in its own error boundary), logs in with exponential-backoff
  retries on network errors, starts voice presence on `clientReady`, and stops
  once: listeners removed, voice connection destroyed, client destroyed.
- `interactionCreate` belongs to the framework: a bot event with that name is
  skipped.
- Every log line is JSON: `{ ts, level, bot, msg, ...context }`. Keys matching
  `token|secret|password|authorization|cookie|api key|session|credential` are
  `[redacted]`, token-shaped strings are masked, error causes are serialized.
- `runtime.health()` returns `{ bot, status, ready, uptimeMs, guilds, commands, voice }`.

## Command deployment

```js
await deployCommands({
  bot: "main",
  config: env,                    // clientId, commandScope, commandGuildId
  commands: registry.list(),
  rest: await createRestClient({ token: env.token }),
  logger,
  statePath: "data/command-deployment.json",
  force,     // ignore the idempotency hash
  dryRun,    // validate and plan, never call Discord
});
```

Guards:

- **idempotent** — the catalogue is hashed (sorted definition JSON); an unchanged
  catalogue is not sent again (`status: "unchanged"`).
- **application guard** — the state file records the Application ID. A state
  written for another Application ID is refused
  (`DEPLOY_APPLICATION_MISMATCH`) instead of silently replacing another
  distribution's catalogue.
- **explicit scope** — `global`, `guild` (requires `ASTRON_COMMAND_GUILD_ID`) or
  `none`.
- **validation** — an invalid catalogue fails before any REST call.

A global `PUT` replaces the whole global catalogue of that application. Each bot
must therefore use its own Discord Application ID; two distributions sharing one
Application ID must use `guild` scope (or coordinate their catalogue).

## Official voice presence

`createVoicePresenceManager` joins the configured presence channel after the
client is ready, silently (`selfDeaf`, `selfMute`), and only in the official
guild:

- the channel id is the central constant `OFFICIAL_PRESENCE_CHANNEL_ID`
  (`1564590674194473000`), overridable with `ASTRON_PRESENCE_VOICE_CHANNEL_ID`;
- the official guild is the central constant `OFFICIAL_GUILD_ID`
  (`1369779785273839749`), overridable with `ASTRON_OFFICIAL_GUILD_ID`; a channel
  resolved in another guild is refused;
- the channel must exist, be in that guild, be a voice/stage channel, and grant
  `ViewChannel` + `Connect`; otherwise presence is refused and logged;
- an existing usable connection is adopted instead of opening a second one;
- disconnects reconnect with exponential backoff plus jitter, capped by
  `maxAttempts`, with one timer and no duplicated listeners;
- `stop()` clears timers, removes listeners and destroys the connection —
  unless an audio session holds a lease;
- `state()` / `health()` expose `status`, `guildId`, `guildIdSource`, `channelId`,
  `attempts`, `connectedAt`, `lastError`, `sessions`.

A bot that plays audio (Astron Player) takes a lease:

```js
const lease = voice.sessions.acquire({ guildId, owner: "player" });
// presence will not join or destroy this guild's connection while the lease lives
const connection = presence.getConnection();
lease.release();
```

`VoiceConnection` objects are process-local: each bot has its own.

## Environment reference

Credentials are scoped to one bot. The variable name is derived from the bot
name (`main` → `MAIN`, `guild-center` → `GUILD_CENTER`), so every bot can run
side by side from a single environment file with its own Discord application.
The shared `DISCORD_TOKEN` / `DISCORD_CLIENT_ID` are still accepted as a
deprecated fallback, and a warning naming the missing per-bot variable is logged
when one is used.

| Variable | Default | Purpose |
| --- | --- | --- |
| `ASTRON_<BOT>_DISCORD_TOKEN` | — (required) | That bot's token (`ASTRON_MAIN_DISCORD_TOKEN`) |
| `ASTRON_<BOT>_DISCORD_CLIENT_ID` | — (required) | That bot's Application ID |
| `DISCORD_TOKEN`, `DISCORD_CLIENT_ID` | — | Deprecated shared fallback (warned when used) |
| `ASTRON_COMMAND_SCOPE` | `global` | `global` \| `guild` \| `none` |
| `ASTRON_COMMAND_GUILD_ID` | — | Required for `guild` scope |
| `DISCORD_COMMAND_SCOPE` | — | Deprecated alias of `ASTRON_COMMAND_SCOPE` |
| `ASTRON_LOG_LEVEL` / `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `ASTRON_VOICE_PRESENCE_ENABLED` | `true` | Enable the official presence |
| `ASTRON_OFFICIAL_GUILD_ID` | `1369779785273839749` | Official guild (central constant; override only for staging) |
| `ASTRON_PRESENCE_VOICE_CHANNEL_ID` | `1564590674194473000` | Official presence channel |
| `NODE_ENV`, `APP_VERSION`, `GIT_COMMIT_SHA`, `BUILD_DATE` | — | Release metadata |
| `DISCORD_WELCOME_DM_ENABLED` | `true` | Bot behaviour |
| `DISCORD_ANNOUNCE_DEPLOYMENTS` | `true` | Deployment announcement |
| `DISCORD_LEVEL_CHANNEL_ID`, `DISCORD_ROLE_AGENTS_ID` | — | Bot behaviour |

Invalid optional values fall back to their default and emit a warning naming the
variable — never its value.

## Tests

```bash
node --test packages/discord-framework/test/*.test.js
# or
pnpm test:bots
```

Coverage: command contract and discovery, catalogue isolation between bots,
routing of every interaction type, unknown/expired/malformed interactions,
user/bot/business permissions, error containment, deployment guards and
idempotency, bootstrap/retry/shutdown, presence enabled/disabled, wrong guild,
deleted channel, missing permissions, backoff, duplicate connections, session
coordination and cleanup.
