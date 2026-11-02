# syntax=docker/dockerfile:1
#
# Astron Collection — single canonical Dockerfile for the platform.
#
# Built from the repository root: the whole monorepo is one pnpm workspace with
# a single `pnpm-lock.yaml`, so only the root context is ever used. Both runtime
# images of the Compose stack are produced here, because they share the same
# dependency install and the same sources: separating them into two files would
# duplicate the install and lose the shared layer cache.
#
#   docker build -t astron-collection-api .                       # backend (default target)
#   docker build --target client -t astron-collection-client .     # frontend
#   docker build --target dev -t astron-collection-dev .          # development image
#   docker buildx build --target api .
#
# Stages / targets
#   base        Node + pnpm toolchain
#   dev         dependencies only, runs `next dev` or the backend dev server
#   builder     installs + compiles the app, deploys a pruned /prod/astron
#   client      FROM base; Next.js frontend, started with `next start`
#   status      standalone status page (separate product, not part of the stack)
#   api         FROM base; backend (tRPC/OpenAPI, auth, WebSockets, workers) — LAST => default
#
# The production images never run as root and never carry build tooling: the
# backend image is started by `entrypoint.sh` (role `api`), the frontend image by
# `entrypoint.sh` (role `client`). Neither needs the host Docker socket.

# ---------------------------------------------------------------------------
# Toolchain
# ---------------------------------------------------------------------------
FROM node:24.4.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Compile native addons (node-pty, bcrypt, ssh2, cpu-features) against the
# headers already shipped in the Node image. Without this node-gyp downloads
# node-v24.4.0-headers.tar.gz from nodejs.org during pnpm install, which fails
# on networks that only allow the npm registry.
ENV npm_config_nodedir=/usr/local
# Matches the `packageManager` field of the root package.json and therefore the
# lockfile that `--frozen-lockfile` validates against.
ARG PNPM_VERSION=12.16.1
RUN npm install -g pnpm@${PNPM_VERSION}
# ca-certificates keeps outbound TLS verification working in the slim image.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Development image (dependencies + sources, never a production build). The
# `dev` Compose services bind-mount apps/astron and packages over this stage's
# sources, so the dev servers always run the code on the host and hot-reload it.
# `ASTRON_COLLECTION_ROLE` selects which one the entrypoint starts.
# ---------------------------------------------------------------------------
FROM base AS dev
COPY . /usr/src/app
WORKDIR /usr/src/app

# Build toolchain for the native modules installed by pnpm.
RUN apt-get update && apt-get install -y python3 make g++ git pkg-config libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# All launch logic (wait for DB, optional migrations, server) lives in entrypoint.sh.
COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Builder (production artifacts, shared by the client and api images)
# ---------------------------------------------------------------------------
FROM base AS builder
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python3 make g++ git pkg-config libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Next.js otherwise phones home (telemetry) during the build; disabling it removes
# a network round-trip from every build without changing the produced artifacts.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Server bundle (esbuild: dist/server.mjs, dist/migration.mjs, …) and Next build.
RUN pnpm --filter=./apps/astron run build

# Pruned production deployment: package.json + the node_modules subset the runtime
# needs, with the workspace packages resolved. Both runtimes copy from here.
RUN pnpm --filter=./apps/astron --prod deploy --legacy /prod/astron

# ---------------------------------------------------------------------------
# Client — the Next.js frontend, and only the frontend.
#
# `next start` serves the pages, the static assets and the `/api/*` rewrites that
# point at the API service (API_INTERNAL_URL). No DATABASE_URL, no REDIS_URL, no
# workers: this image cannot perform backend work even by mistake.
# ---------------------------------------------------------------------------
FROM base AS client
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /prod/astron/package.json ./package.json
COPY --from=builder /prod/astron/node_modules ./node_modules
COPY --from=builder /prod/astron/next.config.mjs ./next.config.mjs
COPY --from=builder /prod/astron/public ./public
COPY --from=builder /usr/src/app/apps/astron/.next ./.next

# Unprivileged runtime: the frontend needs no write access.
RUN groupadd --system --gid 1001 astron \
    && useradd --system --uid 1001 --gid astron --home-dir /app astron \
    && chown -R astron:astron /app

ARG ASTRON_COLLECTION_VERSION=dev
# Environment selected by the Makefile (`make docker-up self | make docker-up cloud`).
# `self` and `cloud` deliberately share one image: they differ by runtime behaviour
# (IS_CLOUD), not by the tooling baked in, so there is no flavor-specific build to keep
# in sync. The flavor is baked in as a default and can be overridden at runtime.
ARG ASTRON_COLLECTION_FLAVOR=selfhosted
ENV ASTRON_COLLECTION_FLAVOR=${ASTRON_COLLECTION_FLAVOR}
LABEL org.opencontainers.image.title="astron-collection-client" \
      org.opencontainers.image.description="Astron Collection — Next.js dashboard (frontend)" \
      org.opencontainers.image.source="https://github.com/skygenesisenterprise/astron-collection" \
      org.opencontainers.image.version="${ASTRON_COLLECTION_VERSION}" \
      org.opencontainers.image.licenses="Apache-2.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then((r) => process.exit(r.status < 500 ? 0 : 1)).catch(() => process.exit(1))"

COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENV ASTRON_COLLECTION_ROLE=client

USER astron
# tini reaps child processes that the entrypoint/server leave defunct.
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Astron Collection Status — the standalone status page (apps/status + the
# packages/status engine). Deliberately independent from the stack: no PostgreSQL,
# no Redis, no workers. The engine owns a dedicated SQLite file under
# STATUS_DATA_DIR, so the whole product is one container and one volume.
#
#   docker build --target status -t astron-collection-status .
#
# Kept before `api` so `api` stays the default target (the last stage).
# ---------------------------------------------------------------------------
FROM base AS status-builder
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Status engine bundle (seed CLI included) and the Next status app.
RUN pnpm --filter=@astron-collection/status run build
RUN pnpm --filter=@astron-collection/status-app run build
# Pruned production deployment of the status app.
RUN pnpm --filter=./apps/status --prod deploy --legacy /prod/status

FROM base AS status
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4200
RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=status-builder /prod/status/package.json ./package.json
COPY --from=status-builder /prod/status/node_modules ./node_modules
COPY --from=status-builder /usr/src/app/apps/status/.next ./.next
COPY --from=status-builder /usr/src/app/apps/status/public ./public
COPY --from=status-builder /usr/src/app/apps/status/next.config.mjs ./next.config.mjs
# Seed CLI (bundled): resolves its dependencies from the node_modules above.
COPY --from=status-builder /usr/src/app/packages/status/dist ./engine-dist

ARG ASTRON_COLLECTION_VERSION=dev
LABEL org.opencontainers.image.title="astron-collection-status" \
      org.opencontainers.image.description="Astron Collection Status — status page, incidents and uptime history" \
      org.opencontainers.image.source="https://github.com/skygenesisenterprise/astron-collection" \
      org.opencontainers.image.version="${ASTRON_COLLECTION_VERSION}" \
      org.opencontainers.image.licenses="Apache-2.0"

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4200/api/v1/pages').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENV ASTRON_COLLECTION_ROLE=status
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]

# ---------------------------------------------------------------------------
# API — the backend: tRPC and OpenAPI routes, better-auth, WebSockets, BullMQ
# workers and cron jobs. This is the default target (last stage in the file).
#
# It is the only image that receives PostgreSQL and Redis credentials, and the
# only one that applies migrations (through the `migrate` job). It never talks to
# the host Docker socket.
# ---------------------------------------------------------------------------
FROM base AS api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

# Server bundle (dist/server.mjs + the migration/utility scripts it ships with).
COPY --from=builder /prod/astron/package.json ./package.json
COPY --from=builder /prod/astron/node_modules ./node_modules
COPY --from=builder /prod/astron/drizzle ./drizzle
COPY --from=builder /usr/src/app/apps/astron/dist ./dist

# Unprivileged runtime: the backend writes nothing outside its temp directory.
RUN groupadd --system --gid 1001 astron \
    && useradd --system --uid 1001 --gid astron --home-dir /app astron \
    && chown -R astron:astron /app

ARG ASTRON_COLLECTION_VERSION=dev
# Same flavor switch as the client stage (see above).
ARG ASTRON_COLLECTION_FLAVOR=selfhosted
ENV ASTRON_COLLECTION_FLAVOR=${ASTRON_COLLECTION_FLAVOR}
LABEL org.opencontainers.image.title="astron-collection-api" \
      org.opencontainers.image.description="Astron Collection — backend (tRPC, WebSockets, workers)" \
      org.opencontainers.image.source="https://github.com/skygenesisenterprise/astron-collection" \
      org.opencontainers.image.version="${ASTRON_COLLECTION_VERSION}" \
      org.opencontainers.image.licenses="Apache-2.0"

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# All launch logic (wait for DB, migrations, server) lives in entrypoint.sh.
COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENV ASTRON_COLLECTION_ROLE=api

USER astron
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]
