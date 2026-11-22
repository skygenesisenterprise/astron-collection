#!/usr/bin/env bash
#
# Astron Manager container entrypoint — the single place that decides how a
# container starts. Every runtime target of the root Dockerfile (`dev`, `status`,
# `platform`) calls this script:
#
#   platform  the one `astron-manager` image, shared by the `self` and `cloud`
#             contexts (they differ by build args, not by image); the role below
#             is chosen at runtime, never at build time
#   dev       the same monorepo with sources + dev dependencies, synchronised by
#             Compose's `develop.watch`
#   status    the standalone status page (astron-collection-status)
#
# The role is selected by ASTRON_COLLECTION_ROLE, or by the first argument — which
# is how the one-shot `migrate` job and the Docker HEALTHCHECK ask for it:
#
#   api          backend: wait for PostgreSQL, optionally migrate, exec dist/server.mjs
#   migrate      one-shot job: wait for PostgreSQL, apply the migrations, exit
#   client       frontend: exec `next start` (or `next dev` in development)
#   status       standalone status page (apps/status), independent from the stack
#   healthcheck  probe the container role on its own port and exit
#
# Flow of the backend roles:
#   1. resolve mode (development | production) from ASTRON_COLLECTION_MODE / NODE_ENV
#   2. locate the app directory (production runs in /app, dev in /usr/src/app)
#   3. wait for PostgreSQL to accept connections
#   4. apply database migrations (always for `migrate`, once for the single API)
#   5. exec the server
#
# Modes and roles come from docker-compose.yml: every service states its role,
# PORT and HOST explicitly, and `make docker-up|docker-dev [self|cloud]` keeps the
# build target, mode and runtime environment in sync. Client and API therefore run
# the exact same image digest — nothing here is baked per service.
#
# Escape hatches:
#   ASTRON_COLLECTION_ROLE=api|client|migrate|status  select the role explicitly
#   ASTRON_COLLECTION_ROLE=healthcheck                the Docker health probe
#   ASTRON_COLLECTION_MODE=development                force dev mode
#   ASTRON_COLLECTION_SKIP_DB_WAIT=1                  skip the wait-for-postgres step
#   ASTRON_COLLECTION_SKIP_MIGRATIONS=1               skip migrations
#   ASTRON_COLLECTION_RUN_MIGRATIONS=1                migrate before starting the API
#   ASTRON_COLLECTION_COMMAND="<cmd>"                 run an arbitrary command instead
#   <entrypoint> shell                                drop into a bash shell
set -euo pipefail

ROLE="${1:-${ASTRON_COLLECTION_ROLE:-api}}"
case "$ROLE" in
api | client | migrate | status | healthcheck) ;;
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

# Platform roles run in `astron-manager`; the status role has its own image and
# label. Keep the log prefix aligned with the image that is actually running.
if [ "$ROLE" = "status" ]; then
	LOG_PREFIX="astron-collection-status"
else
	LOG_PREFIX="astron-manager"
fi
log() { printf '[%s] %s\n' "$LOG_PREFIX" "$*"; }

# --- Healthcheck ------------------------------------------------------------
# One `astron-manager` image serves the client and API roles, and the status image
# reuses the same probe. The Docker HEALTHCHECK cannot hard-code a path: it asks
# the entrypoint, which probes the *container* role (ASTRON_COLLECTION_ROLE) on
# its own port. Exits 0 when the app answers.
if [ "$ROLE" = "healthcheck" ]; then
	probe_role="${ASTRON_COLLECTION_ROLE:-api}"
	case "$probe_role" in
	client)
		probe="http://127.0.0.1:${PORT:-3000}/"
		exec node -e "fetch(process.argv[1]).then((r) => process.exit(r.status < 500 ? 0 : 1)).catch(() => process.exit(1))" "$probe"
		;;
	status)
		probe="http://127.0.0.1:${PORT:-4200}/api/v1/pages"
		;;
	*)
		probe="http://127.0.0.1:${PORT:-4000}/api/health"
		;;
	esac
	exec node -e "fetch(process.argv[1]).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" "$probe"
fi

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
	# The status stage sets PORT (4200) but no HOST, so default to all interfaces
	# like Compose does for the other web service instead of binding to HOSTNAME.
	STATUS_BIND_HOST="${HOST:-0.0.0.0}"
	if [ "$MODE" = "development" ]; then
		log "role: status (development, port ${STATUS_CONTAINER_PORT})"
		[ -d ./apps/status ] && cd apps/status
		exec pnpm exec next dev -p "${STATUS_CONTAINER_PORT}" -H "${STATUS_BIND_HOST}"
	fi
	log "role: status (production, port ${STATUS_CONTAINER_PORT}, dir: $(pwd))"
	exec ./node_modules/.bin/next start -p "${STATUS_CONTAINER_PORT}" -H "${STATUS_BIND_HOST}"
fi

# --- Frontend ---------------------------------------------------------------
# The client serves the Next.js UI and proxies `/api/*` to the API through its
# rewrites (API_INTERNAL_URL). It never waits for PostgreSQL, never migrates and
# never starts a worker: it holds no database or Redis credentials at all.
if [ "$ROLE" = "client" ]; then
	CLIENT_CONTAINER_PORT="${PORT:-3000}"
	# Compose sets HOST=0.0.0.0 on the client service; keep the same fallback if
	# the image is run standalone (the platform stage only sets PORT).
	CLIENT_BIND_HOST="${HOST:-0.0.0.0}"
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
# Only the one-shot `migrate` job and an opted-in API run them. Compose enables
# ASTRON_COLLECTION_RUN_MIGRATIONS=1 on its single API service; additional replicas
# must set it to 0 so they never race on the same schema.
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
log "starting Astron Manager (${ROLE})..."
exec "${SERVER_CMD[@]}"
