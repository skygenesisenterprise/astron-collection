# Astron Collection

[![License: MIT](https://img.shields.io/github/license/skygenesisenterprise/astron-collection)](LICENSE)
[![Node.js 24](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![pnpm 10](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Discord.js 14](https://img.shields.io/badge/Discord.js-14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?logo=discord&logoColor=white)](https://discord.gg/GUkDugVh34)

> A modular suite of advanced, open-source Discord applications and tools designed for modern communities.

**Astron Collection** is an open-source, self-hostable platform for running a complete Discord community stack. It bundles focused Discord bots for community management, moderation, logging, voice and protection, alongside a web control plane, a public status page, an API, and developer tooling. Run the bots on their own, self-host the whole platform on infrastructure you control, or use [Astron Collection Cloud](https://app.astron-collection.com) for a managed experience.

**Perfect for:** Discord server owners and moderators, community managers, gaming and creator communities, self-hosting enthusiasts, and developers who want a modern, extensible Discord toolchain without giving up control of their data.

## Contents

- [Astron Collection](#astron-collection)
  - [Contents](#contents)
  - [Why Astron Collection matters](#why-astron-collection-matters)
  - [What you can do](#what-you-can-do)
    - [Community](#community)
    - [Moderate](#moderate)
    - [Engage](#engage)
    - [Protect](#protect)
    - [Operate](#operate)
    - [Automate](#automate)
  - [Quick start](#quick-start)
    - [Requirements](#requirements)
    - [Run a Discord bot locally](#run-a-discord-bot-locally)
    - [Run a bot with Docker Compose](#run-a-bot-with-docker-compose)
    - [Self-host the full platform](#self-host-the-full-platform)
    - [Makefile shortcuts](#makefile-shortcuts)
  - [How Astron Collection is built](#how-astron-collection-is-built)
    - [Workspace layout](#workspace-layout)
    - [Discord applications](#discord-applications)
    - [Core services](#core-services)
    - [Shared packages](#shared-packages)
    - [Web properties](#web-properties)
    - [Containers and deployment targets](#containers-and-deployment-targets)
  - [Development](#development)
    - [Root commands](#root-commands)
    - [Discord bot development](#discord-bot-development)
    - [Bot configuration](#bot-configuration)
    - [Platform development](#platform-development)
    - [Web properties](#web-properties-1)
    - [Repository conventions](#repository-conventions)
  - [FAQ](#faq)
    - [Is Astron Collection free?](#is-astron-collection-free)
    - [Do I have to host it myself?](#do-i-have-to-host-it-myself)
    - [What do I need to run it?](#what-do-i-need-to-run-it)
    - [Can I run several bots at once?](#can-i-run-several-bots-at-once)
    - [Where is the documentation?](#where-is-the-documentation)
    - [How do I get help or report a bug?](#how-do-i-get-help-or-report-a-bug)
  - [Related resources](#related-resources)
    - [Official](#official)
    - [Community](#community-1)
    - [Commercial](#commercial)
  - [Contributing](#contributing)
  - [Security](#security)
  - [License](#license)
  - [Note](#note)

## Why Astron Collection matters

🎯 **You own the stack** — Every bot, service and database runs on your infrastructure. Your member data, configuration and audit history stay under your control, and the source is yours to audit.

🧩 **Modular by design** — Pick the bot that matches each responsibility: `main` for a complete suite, `guild` for community management, `logger` for audit trails, `player` for voice, and `protect` for safety. Run one or all of them.

🛡️ **Moderation is built in** — Ban, kick, mute, warn and purge commands, AutoMod integration, configurable moderation channels and roles, and per-guild settings — no third-party bot required.

💬 **Community features that work** — Welcome and farewell messages, XP and ranks, polls, reminders, mini-games, server and user info, and a flexible `/config` command for channels and roles.

🔒 **Secure by default** — Bot tokens and secrets live in environment variables, commands are scoped explicitly, and the platform supports OAuth, SSO and per-guild configuration.

📊 **Observable and operable** — A web control plane, a public status page, background jobs, scheduled tasks, resource monitoring and a deployment announcement feed keep you informed.

🤝 **Open source and extensible** — The project is MIT licensed, self-hostable, and built on `discord.js`, Next.js, Hono and a shared TypeScript workspace, so it fits into existing tooling instead of replacing it.

## What you can do

### Community

- Greet new members with welcome messages and optional welcome DMs, and send farewells when members leave.
- Reward activity with XP, levels and ranks.
- Run polls, reminders, dice rolls and 8-ball prompts directly from slash commands.
- Configure per-guild channels and roles with `/config`, and inspect servers and users with `/serverinfo` and `/userinfo`.

### Moderate

- Ban, kick, mute, unmute, warn and purge with permission checks and audit logging.
- Use AutoMod configuration alongside native Discord moderation tools.
- Keep a persistent audit trail, warnings and member events in the bot data store.
- Route moderation actions to dedicated channels configured per guild.

### Engage

- Use the `player` distribution for voice-capable deployments built on `@discordjs/voice`.
- Announce deployments and new versions in a configured updates channel.
- Keep members informed with polls, reminders and structured embeds.

### Protect

- Run the `protect` distribution as a dedicated safety instance for AutoMod and moderation.
- Track joins, leaves and deleted channels, and keep audit records for investigation.
- Give each bot instance its own token, data store and Redis namespace.

### Operate

- Manage communities from the Astron Collection dashboard, with projects, environments, servers and deployments.
- Publish incidents and maintenance windows through the public status page.
- Monitor resource usage and service health with the Go monitoring service.
- Schedule recurring jobs and process background work through dedicated services.

### Automate

- Drive the platform from its API, the MCP server, or the OpenAPI specification.
- Generate OpenAPI documentation and TypeScript clients from a single source of truth.
- Extend the bots with new slash commands and event handlers that are loaded dynamically at startup.

## Quick start

### Requirements

- **Node.js 24.4+** and **pnpm 10.22+** for local development.
- A **Discord application** with a bot token and client ID from the [Discord Developer Portal](https://discord.com/developers/applications).
- **Docker Engine** with the Compose plugin if you prefer containers.
- **PostgreSQL** and **Redis** for the full control plane (both are provided by the Compose stack).

Install dependencies from the repository root:

```bash
git clone https://github.com/skygenesisenterprise/astron-collection.git
cd astron-collection
pnpm install --frozen-lockfile
```

### Run a Discord bot locally

Each bot reads `.env` from its own directory first, then falls back to the workspace root `.env`.

```bash
cp bot/main/.env.example bot/main/.env
```

Edit `bot/main/.env` and set at least:

```dotenv
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
DISCORD_WELCOME_DM_ENABLED=true
DISCORD_COMMAND_SCOPE=global
DISCORD_ANNOUNCE_DEPLOYMENTS=true
```

Start the bot with hot reload:

```bash
pnpm --filter=@astron-collection/main run dev
```

The `predev` hook registers the slash commands before the bot starts. To manage command registration explicitly:

```bash
pnpm --filter=@astron-collection/main run deploy:commands  # register slash commands
pnpm --filter=@astron-collection/main run start            # production start
```

Invite the bot to a server with the `bot` and `applications.commands` scopes, then try `/ping` and `/config`.

### Run a bot with Docker Compose

Every bot directory ships its own `Dockerfile`, `docker-compose.yml` and `.env.example`. For example, to run the full suite bot:

```bash
cd bot/main
cp .env.example .env
# edit .env and set DISCORD_TOKEN and DISCORD_CLIENT_ID
docker compose up -d --build
docker compose logs -f
```

The Compose stack starts the bot and a Redis instance used as an optional cache. Data is persisted in a named volume. Repeat the same steps in `bot/guild`, `bot/logger`, `bot/player` or `bot/protect` to run a dedicated distribution. Each bot uses its own image name and Redis key prefix, so instances do not collide.

Useful Compose commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

`docker compose down` preserves the named data volumes.

### Self-host the full platform

The root Compose stack is made of four service groups only: **postgres** (database), **redis** (cache and queues), **client** (Next.js frontend) and **api** (backend: tRPC/OpenAPI, auth, WebSockets, workers). It needs no Traefik, no Docker Swarm and no host Docker socket.

```bash
cp .env.example .env
```

Edit `.env` before starting the stack and set `POSTGRES_PASSWORD`, `REDIS_PASSWORD` and `BETTER_AUTH_SECRET`. Generate each one with:

```bash
openssl rand -hex 32
```

The stack refuses to start while one of them is missing, and the API refuses a weak or known `BETTER_AUTH_SECRET`. Then start it:

```bash
docker compose up -d --build
docker compose logs -f api
```

Open [http://localhost:3000](http://localhost:3000) and complete the initial setup. The API is published on [http://localhost:4000](http://localhost:4000); PostgreSQL and Redis are internal only. Keep `.env` private and do not expose the dashboard publicly until authentication and HTTPS are configured.

The stack runs in two profiles on the same four services:

```bash
make docker-up self           # production profile, self-hosted
make docker-up cloud          # production profile, Astron Collection Cloud
docker compose down           # stop — data volumes are preserved
make docker-dev self          # development profile: hot reload, same four services
make migrate                  # apply the migrations once
```

`docker compose down` keeps the database; never run `docker compose down -v` in normal operation. Database backup and restore:

```bash
make backup                   # writes backups/astron-<date>.sql
make restore FILE=backups/astron-<date>.sql
```

To update, pull the revision and rebuild: `git pull && make docker-up`. To develop against the sources on the host instead of containers, use `pnpm install --frozen-lockfile` followed by `pnpm dev` and `pnpm --filter=@astron-collection/api run dev`.

### Makefile shortcuts

The root `Makefile` is a thin wrapper around the existing tools and scripts:

```bash
make help            # list every target
make install         # install locally with Docker Compose
make docker-up       # build and start the stack
make docker-dev      # run the containerized dev server with hot reload
make docker-logs     # follow the stack logs
make docker-down     # stop the stack (volumes preserved)
make status          # show stack status
make update          # pull, rebuild and restart
make doctor          # check installation health
```

Product selection is done through make goals, for example `make docker-up -- --cloud` or `make docker-up status`.

## How Astron Collection is built

Astron Collection is a pnpm monorepo with a single root lockfile (`pnpm-lock.yaml`) and a workspace definition (`pnpm-workspace.yaml`) spanning `apps/*`, `packages/*`, `web`, `web/apps/*` and `bot/*`.

### Workspace layout

```text
astron-collection/
├── apps/                    # Core services and the web control plane
│   ├── astron/              # @astron-collection/app — dashboard, API server, runtime
│   ├── api/                 # @astron-collection/api — background work service (Inngest)
│   ├── schedules/           # @astron-collection/schedules — scheduled jobs (BullMQ)
│   ├── status/              # @astron-collection/status-app — public status page (Next.js)
│   └── monitoring/          # Go monitoring service (outside the pnpm workspace)
├── bot/                     # Discord applications
│   ├── main/                # @astron-collection/main — complete suite bot
│   ├── guild/               # @astron-collection/guild — community management bot
│   ├── logger/              # @astron-collection/logger — logging and audit bot
│   ├── player/              # @astron-collection/player — voice-capable bot
│   └── protect/             # @astron-collection/protect — moderation and safety bot
├── packages/                # Shared libraries
│   ├── server/              # @astron-collection/server
│   ├── status/              # @astron-collection/status
│   ├── trpc-openapi/        # @astron-collection/trpc-openapi
│   └── mcp/                 # @astron-collection/mcp — MCP server for the API
├── web/                     # Marketing website + docs (own workspace, Makefile, Dockerfiles)
│   ├── apps/website/        # @astron-collection/website
│   └── apps/docs/           # @astron-collection/docs
├── scripts/                 # Repository tooling (install, worktrees, docs checks)
├── docker/                  # Deployment-tooling install helper
├── Dockerfile               # Root image with selfhosted / cloud / console / dev targets
├── docker-compose.yml       # Self-hosted stack (PostgreSQL, Redis, Traefik, app, status)
└── Makefile                 # install / dev / docker / operations targets
```

### Discord applications

The `bot/` workspace contains five deployable Discord distributions. They share the same command and event architecture, so a feature added to one can be reused everywhere; each distribution gets its own token, data directory, image name and Redis key prefix.

| Path | Package | Focus |
| --- | --- | --- |
| `bot/main` | `@astron-collection/main` | Complete suite: community, moderation, engagement and operations |
| `bot/guild` | `@astron-collection/guild` | Community management and member experience |
| `bot/logger` | `@astron-collection/logger` | Logging, audit trails and activity tracking |
| `bot/player` | `@astron-collection/player` | Voice-capable distribution built on `@discordjs/voice` |
| `bot/protect` | `@astron-collection/protect` | Moderation, AutoMod and server safety |

Every bot is built with **discord.js 14** and follows the same structure:

```text
bot/<name>/
├── commands/        # Slash commands, loaded dynamically at startup
├── events/          # Gateway event handlers (members, messages, interactions, ready)
├── config/          # Environment loading and validation
├── services/        # Deployment announcements and shared services
├── utils/           # JSON store, XP, member messages, support tickets
├── data/            # Persistent JSON state (warnings, tickets, XP, settings, polls)
├── index.js         # Client bootstrap, command/event loading and reconnect logic
├── deploy-commands.js
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

The shared command set includes `/ping`, `/config`, `/welcome`, `/farewell`, `/levels`, `/rank`, `/poll`, `/remind`, `/8ball`, `/dice`, `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/purge`, `/automod`, `/serverinfo`, `/userinfo` and `/prefix`.

### Core services

| Path | Package | Role |
| --- | --- | --- |
| `apps/astron` | `@astron-collection/app` | Web dashboard, API server and application runtime |
| `apps/api` | `@astron-collection/api` | Background and asynchronous work service (Inngest), port 4000 |
| `apps/schedules` | `@astron-collection/schedules` | Scheduled jobs and recurring tasks (BullMQ), port 4001 |
| `apps/status` | `@astron-collection/status-app` | Public status page (Next.js), port 4100 |
| `apps/monitoring` | — (Go) | Resource monitoring and metrics collection service |

### Shared packages

| Path | Package | Role |
| --- | --- | --- |
| `packages/server` | `@astron-collection/server` | Core server logic, persistence and platform utilities |
| `packages/status` | `@astron-collection/status` | Status engine: domain model, state computation, persistence, public/admin APIs and notification outbox |
| `packages/trpc-openapi` | `@astron-collection/trpc-openapi` | tRPC ↔ OpenAPI integration utilities |
| `packages/mcp` | `@astron-collection/mcp` | Model Context Protocol server for AI integrations with the Astron Collection API |

### Web properties

| Path | Package | Role |
| --- | --- | --- |
| `web/apps/website` | `@astron-collection/website` | Official marketing website |
| `web/apps/docs` | `@astron-collection/docs` | Product documentation site |

The `web/` directory is its own pnpm workspace root with a dedicated `Makefile`, `Dockerfile.website` / `Dockerfile.docs` and `docker-compose.yml`, so the marketing site and the documentation site can be built and deployed independently of the platform.

### Containers and deployment targets

The root `Dockerfile` exposes several targets:

| Target | Purpose |
| --- | --- |
| `selfhosted` | Default self-hosted image, including Docker and deployment tooling |
| `cloud` | Astron Collection Cloud runtime without the self-hosted tooling |
| `console` | Console product flavour |
| `dev` | Development image with hot reload and deployment tooling |
| `status` | Standalone status page image |

The root Compose stack runs exactly four services: `postgres`, `redis`, `client` and `api`. The frontend and the backend are separate images: the client serves the UI and proxies `/api/*` to the API service, and only the API holds the database and Redis credentials and applies migrations. Neither container mounts the host Docker socket. The standalone status page keeps its own `status` image target and is deployed on its own.

The bot images are independent and can be deployed one at a time. Each `bot/<name>/docker-compose.yml` starts its bot and a Redis cache, and persists bot data in a named volume.

## Development

The monorepo uses **Node.js 24.4 or later in the 24.x line** and **pnpm 10.22 or later**. Install dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

### Root commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the Astron Collection web application |
| `pnpm build` | Build all workspace packages |
| `pnpm build:app` | Build the main application only |
| `pnpm test` | Run the application test suite |
| `pnpm typecheck` | Type-check workspace packages |
| `pnpm lint` | Run Biome checks across the workspace |
| `pnpm setup` | Set up the database and run migrations |
| `pnpm server:dev` / `pnpm server:build` | Run or build the `@astron-collection/server` package |
| `pnpm web:dev` / `pnpm web:build` | Run or build the official website |
| `pnpm docs:dev` / `pnpm docs:build` | Run or build the documentation site |
| `pnpm generate:openapi` | Regenerate the OpenAPI specification |
| `pnpm changeset` | Add a changeset for a user-facing change |

### Discord bot development

Each bot is an independent Node.js package. Use the filtered workspace commands from the repository root:

```bash
pnpm --filter=@astron-collection/main run dev       # hot reload
pnpm --filter=@astron-collection/main run start     # production start
pnpm --filter=@astron-collection/main run deploy:commands
```

Swap `main` for `guild`, `logger`, `player` or `protect` to work on another distribution. The `dev` and `start` scripts run `deploy-commands.js` first through their `predev` / `prestart` hooks.

To add a feature, create a command or event module that exports the expected shape:

```js
// commands/example.js
export const data = new SlashCommandBuilder()
  .setName("example")
  .setDescription("An example slash command.");

export async function execute(interaction) {
  await interaction.reply("Hello from Astron Collection!");
}
```

Command files are loaded dynamically from `commands/`, and event files from `events/`. An event may export `once = true` to run only on the first gateway event.

### Bot configuration

Bots read configuration from `bot/<name>/.env`, then from the workspace root `.env`. The core variables are:

| Variable | Required | Description |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Bot token from the Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Yes | Application ID used to register slash commands |
| `DISCORD_COMMAND_SCOPE` | No | `global` (default) or `none` |
| `DISCORD_WELCOME_DM_ENABLED` | No | Send welcome direct messages (default `true`) |
| `DISCORD_ANNOUNCE_DEPLOYMENTS` | No | Announce new deployments in configured channels (default `true`) |
| `NODE_ENV` | No | `development` or `production` |
| `LOG_LEVEL` | No | `debug`, `info`, `warn` or `error` |
| `REDIS_ENABLED` | No | Enable the optional Redis cache |
| `REDIS_REQUIRED` | No | Fail if Redis is unavailable (default `false`) |
| `REDIS_URL` | No | Full Redis connection URL, for example `redis://default:password@redis:6379/0` |

When Redis is disabled or unavailable, the bots continue with their local JSON store. Set `REDIS_REQUIRED=true` only if cache availability is mandatory for your deployment.

### Platform development

Run the dashboard against a local PostgreSQL database after filling in `.env` from `.env.example`:

```bash
pnpm dev
```

For the supporting services:

```bash
# Background work service (port 4000)
pnpm --filter=@astron-collection/api run dev

# Inngest dev server (dashboard on port 8288)
pnpm --filter=@astron-collection/api run dev:inngest

# Scheduled jobs (port 4001)
pnpm --filter=@astron-collection/schedules run dev

# Public status page (port 4100)
pnpm --filter=@astron-collection/status-app run dev
```

The standalone status page ships with seed tooling (`make status-seed`) and its own tests. The monitoring service is a Go application under `apps/monitoring` and is intentionally outside the pnpm workspace.

### Web properties

The marketing site (`web/apps/website`) and the documentation site (`web/apps/docs`) share a dedicated toolchain in `web/`:

```bash
make -C web dev web      # run the website
make -C web dev docs     # run the docs site
make -C web build        # build both
```

The docs site also has repository-level checks:

```bash
pnpm docs:check          # validate specifications, regions and links
pnpm docs:check:changed  # validate only changed documentation
pnpm docs:check:links    # validate links only
```

### Repository conventions

- Formatting and linting use [Biome](https://biomejs.dev) through `pnpm lint` and `pnpm format-and-lint:fix`.
- Pull request titles follow [Conventional Commits](https://www.conventionalcommits.org) (`fix: …`, `feat: …`, `docs: …`).
- Add a changeset with `pnpm changeset` when your change is user-facing.
- Run `pnpm test`, `pnpm typecheck` and `pnpm lint` before opening a pull request.
- Never commit bot tokens, OAuth secrets, database credentials or other secrets.

## FAQ

### Is Astron Collection free?

Yes. The project is open source and licensed under the MIT License, and the self-hosted edition is free to run. Some separately published packages or components may carry their own license terms; check the relevant package's license file before redistributing it. A commercial edition with additional features and premium support is maintained by [Sky Genesis Enterprise](https://skygenesisenterprise.com).

### Do I have to host it myself?

No. You can run the Discord bots on their own, self-host the full platform with Docker Compose or `make install`, or use the hosted [Astron Collection Cloud](https://app.astron-collection.com) if you would rather not manage the control plane.

### What do I need to run it?

For development: Node.js 24.4+, pnpm 10.22+ and a Discord application. For the full platform: PostgreSQL, Redis and a filled-in `.env`. For the containerized stack: Docker Engine with the Compose plugin. The bots only need a bot token and client ID, with Redis optional.

### Can I run several bots at once?

Yes. Each distribution has its own token, client ID, data directory, image and Redis key prefix. Create a separate Discord application for each bot, or point several distributions at the same application if you intentionally want shared command registration. Running dedicated instances is recommended so moderation, logging and community features scale and restart independently.

### Where is the documentation?

The product documentation lives at [docs.astron-collection.com](https://docs.astron-collection.com). The documentation site in `web/apps/docs` is generated from the same sources as this repository.

### How do I get help or report a bug?

Join the [Astron Collection Discord](https://discord.gg/GUkDugVh34) for questions, or open a [GitHub issue](https://github.com/skygenesisenterprise/astron-collection/issues) for bugs and feature requests. Never report a security vulnerability in a public issue — see [Security](#security).

## Related resources

### Official

- Website: [astron-collection.com](https://astron-collection.com)
- Documentation: [docs.astron-collection.com](https://docs.astron-collection.com)
- Hosted platform: [app.astron-collection.com](https://app.astron-collection.com)
- Status page: [status.astron-collection.com](https://status.astron-collection.com)
- Discord bots: See [`bot/`](bot)
- Web dashboard: See [`apps/astron`](apps/astron)
- MCP server: See [`packages/mcp`](packages/mcp)
- Status engine: See [`packages/status`](packages/status)

### Community

- Questions and discussions: [Astron Collection Discord](https://discord.gg/GUkDugVh34)
- Bugs and feature requests: [GitHub Issues](https://github.com/skygenesisenterprise/astron-collection/issues)
- Contribution guide: [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)
- Code of Conduct: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

### Commercial

- Commercial edition and premium support: [Sky Genesis Enterprise](https://skygenesisenterprise.com)
- Contact: [contact@skygenesisenterprise.com](mailto:contact@skygenesisenterprise.com)

## Contributing

Contributions and suggestions are welcome. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating, then follow the [contribution guide](.github/CONTRIBUTING.md) for setup and review expectations.

- Pick the right [pull request template](.github/PULL_REQUEST_TEMPLATE) for your change.
- Keep PR titles in Conventional Commits format (`fix: …`, `feat: …`, `docs: …`).
- Add a changeset with `pnpm changeset` when your change is user-facing.
- Run `pnpm test`, `pnpm typecheck` and `pnpm lint` before opening a pull request.
- Never paste tokens, credentials or secrets into an issue or pull request.

## Security

Do not report security vulnerabilities in public issues. Report them privately to [security@skygenesisenterprise.com](mailto:security@skygenesisenterprise.com) with a detailed description and reproduction steps. See [SECURITY.md](SECURITY.md) for the full policy.

## License

The root project is licensed under the [MIT License](LICENSE). Some separately published packages or included components may have their own license terms; check the relevant package's license file before redistributing it.

## Note

Astron Collection is an open-source project maintained by [Sky Genesis Enterprise](https://skygenesisenterprise.com). Links to external services are provided for convenience and do not imply endorsement. Check each service's own terms before relying on it in production.
