#!/usr/bin/env bash
#
# Astron Collection container entrypoint — the single place that decides how a
# container starts. Every target of the root Dockerfile calls this script, and the
# role is selected by ASTRON_COLLECTION_ROLE (or by the first argument, which is how
# the one-shot `migrate` job asks for the migrations):
#
#   api       backend: wait for PostgreSQL, optionally migrate, exec dist/server.mjs
#   migrate   one-shot job: wait for PostgreSQL, apply the migrations, exit
#   client    frontend: exec `next start` (or `next dev` in development)
#   status    standalone status page (apps/status), independent from the stack
#
# Flow of the backend roles:
#   1. resolve mode (development | production)
#   2. locate the app directory (production runs in /app, dev runs in the
#      monorepo workspace)
#   3. wait for PostgreSQL to accept connections
#   4. apply database migrations (always for `migrate`, opt-in for `api`)
#   5. exec the server
#
# Escape hatches:
#   ASTRON_COLLECTION_ROLE=api|client|migrate|status  select the role explicitly
#   ASTRON_COLLECTION_MODE=development                force dev mode
#   ASTRON_COLLECTION_SKIP_DB_WAIT=1                  skip the wait-for-postgres step
#   ASTRON_COLLECTION_SKIP_MIGRATIONS=1               skip migrations
#   ASTRON_COLLECTION_RUN_MIGRATIONS=1                migrate before starting the API
#   ASTRON_COLLECTION_COMMAND="<cmd>"                 run an arbitrary command instead
#   <entrypoint> shell                                drop into a bash shell
set -euo pipefail

ROLE="${1:-${ASTRON_COLLECTION_ROLE:-api}}"
case "$ROLE" in
api | client | migrate | status) ;;
*)
	ROLE="api"
	;;
esac

MODE="${ASTRON_COLLECTION_MODE:-${NODE_ENV:-production}}"
case "$MODE" in
dev | development) MODE="development" ;;
prod | production) MODE="production" ;;
*)
	MODE="production"
	;;
esac

log() { printf '[astron-collection] %s\n' "$*"; }

# --- Escape hatches --------------------------------------------------------
if [ "${2:-}" = "shell" ] || [ "${1:-}" = "shell" ]; then
	exec bash
fi
if [ -n "${ASTRON_COLLECTION_COMMAND:-}" ]; then
	log "running custom command: ${ASTRON_COLLECTION_COMMAND}"
	exec bash -lc "${ASTRON_COLLECTION_COMMAND}"
fi

# --- Status page application -----------------------------------------------
# `ASTRON_COLLECTION_ROLE=status` runs the standalone status page (apps/status)
# instead of the platform: no PostgreSQL, no Redis, no migrations. The engine keeps
# its state in a SQLite file under STATUS_DATA_DIR.
if [ "$ROLE" = "status" ]; then
	STATUS_CONTAINER_PORT="${PORT:-4200}"
	if [ "$MODE" = "development" ]; then
		log "role: status (development, port ${STATUS_CONTAINER_PORT})"
		[ -d ./apps/status ] && cd apps/status
		exec pnpm exec next dev -p "${STATUS_CONTAINER_PORT}"
	fi
	log "role: status (production, port ${STATUS_CONTAINER_PORT}, dir: $(pwd))"
	exec ./node_modules/.bin/next start -p "${STATUS_CONTAINER_PORT}" -H "${HOSTNAME:-0.0.0.0}"
fi

# --- Frontend ---------------------------------------------------------------
# The client serves the Next.js UI and proxies `/api/*` to the API through its
# rewrites (API_INTERNAL_URL). It never waits for PostgreSQL, never migrates and
# never starts a worker: it holds no database or Redis credentials at all.
if [ "$ROLE" = "client" ]; then
	CLIENT_CONTAINER_PORT="${PORT:-3000}"
	CLIENT_BIND_HOST="${HOST:-${HOSTNAME:-0.0.0.0}}"
	if [ "$MODE" = "development" ]; then
		log "role: client (development, port ${CLIENT_CONTAINER_PORT})"
		[ -d ./apps/astron ] && cd apps/astron
		exec pnpm exec next dev -p "${CLIENT_CONTAINER_PORT}" -H "${CLIENT_BIND_HOST}"
	fi
	log "role: client (production, port ${CLIENT_CONTAINER_PORT}, dir: $(pwd))"
	exec ./node_modules/.bin/next start -p "${CLIENT_CONTAINER_PORT}" -H "${CLIENT_BIND_HOST}"
fi

# --- Locate the backend application ----------------------------------------
if [ -n "${ASTRON_COLLECTION_APP_DIR:-}" ]; then
	cd "${ASTRON_COLLECTION_APP_DIR}"
elif [ ! -f "./dist/server.mjs" ] && [ -f "./apps/astron/package.json" ]; then
	# Dev image: we are at the monorepo root, the app lives in apps/astron.
	cd apps/astron
fi

if [ "$MODE" = "development" ]; then
	log "role: ${ROLE} (development, app dir: $(pwd))"
	RUNNER=(pnpm exec tsx -r dotenv/config)
	SCRIPT_DIR="."
	SCRIPT_EXT="ts"
	SERVER_CMD=(pnpm dev)
else
	log "role: ${ROLE} (production, app dir: $(pwd))"
	RUNNER=(node -r dotenv/config)
	SCRIPT_DIR="dist"
	SCRIPT_EXT="mjs"
	SERVER_CMD=(node -r dotenv/config dist/server.mjs)
fi

# --- Wait for PostgreSQL ---------------------------------------------------
if [ "${ASTRON_COLLECTION_SKIP_DB_WAIT:-0}" != "1" ]; then
	if [ -f "${SCRIPT_DIR}/wait-for-postgres.${SCRIPT_EXT}" ]; then
		log "waiting for the database to accept connections..."
		"${RUNNER[@]}" "${SCRIPT_DIR}/wait-for-postgres.${SCRIPT_EXT}"
	else
		log "wait-for-postgres script not found, skipping"
	fi
else
	log "database wait disabled (ASTRON_COLLECTION_SKIP_DB_WAIT=1)"
fi

# --- Migrations ------------------------------------------------------------
# Only the `migrate` job and an explicitly opted-in API run them: two API
# replicas must never race on the same schema.
RUN_MIGRATIONS="0"
if [ "$ROLE" = "migrate" ] || [ "${ASTRON_COLLECTION_RUN_MIGRATIONS:-0}" = "1" ]; then
	RUN_MIGRATIONS="1"
fi

if [ "$RUN_MIGRATIONS" = "1" ] && [ "${ASTRON_COLLECTION_SKIP_MIGRATIONS:-0}" != "1" ]; then
	if [ -f "${SCRIPT_DIR}/migration.${SCRIPT_EXT}" ]; then
		log "applying database migrations..."
		"${RUNNER[@]}" "${SCRIPT_DIR}/migration.${SCRIPT_EXT}"
	else
		log "migration script not found, skipping"
	fi
fi

# The one-shot job is done: a zero exit is what lets the API start.
if [ "$ROLE" = "migrate" ]; then
	log "migrations applied, exiting"
	exit 0
fi

# --- Start -----------------------------------------------------------------
log "starting Astron Collection (${ROLE})..."
exec "${SERVER_CMD[@]}"
