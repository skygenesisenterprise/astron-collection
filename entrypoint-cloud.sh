#!/bin/sh
set -e

export PATH="/usr/local/bin:/usr/bin:/bin:${PATH}"
export NODE_ENV="${NODE_ENV:-production}"
export USE_EMBEDDED_DB="${USE_EMBEDDED_DB:-false}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export PRISMA_SCHEMA_DEPLOY="${PRISMA_SCHEMA_DEPLOY:-true}"
export PRISMA_SCHEMA_DEPLOY_STRATEGY="${PRISMA_SCHEMA_DEPLOY_STRATEGY:-push}"
export ALLOW_MIGRATION_FAILURE="${ALLOW_MIGRATION_FAILURE:-false}"

# ── Logging ────────────────────────────────────────────────────────────────────

timestamp_utc() {
    date -u '+%Y-%m-%dT%H:%M:%SZ'
}

should_log() {
    requested_level="$1"

    case "${LOG_LEVEL:-info}" in
        debug)  return 0 ;;
        info)   [ "${requested_level}" != "debug" ] ;;
        warn)   [ "${requested_level}" = "warn" ] || [ "${requested_level}" = "error" ] ;;
        error)  [ "${requested_level}" = "error" ] ;;
        *)      return 0 ;;
    esac
}

log_debug() {
    if should_log debug; then
        echo "[DEBUG] $(timestamp_utc) - $1"
    fi
}

log_info() {
    if should_log info; then
        echo "[INFO] $(timestamp_utc) - $1"
    fi
}

log_warn() {
    if should_log warn; then
        echo "[WARN] $(timestamp_utc) - $1" >&2
    fi
}

log_error() {
    if should_log error; then
        echo "[ERROR] $(timestamp_utc) - $1" >&2
    fi
}

# ── Runtime defaults ──────────────────────────────────────────────────────────

configure_runtime() {
    export FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    export API_PORT="${API_PORT:-8080}"
    export SERVER_PORT="${SERVER_PORT:-${API_PORT}}"
    export GIN_MODE="${GIN_MODE:-release}"
}

# ── Display ───────────────────────────────────────────────────────────────────

display_header() {
    echo ""
    echo "Kami-Sama production container"
    echo ""
    log_info "Node env: ${NODE_ENV}"
    log_info "Frontend: http://localhost:${FRONTEND_PORT}"
    log_info "API:      http://localhost:${API_PORT}"
    echo ""
}

# ── Helpers ───────────────────────────────────────────────────────────────────

find_backend_binary() {
    for binary in \
        /app/server/aether-server \
        /app/server/aether-meet
    do
        if [ -x "${binary}" ]; then
            echo "${binary}"
            return 0
        fi
    done

    return 1
}

find_prisma_bin() {
    for bin in /app/prisma/node_modules/.bin/prisma ./node_modules/.bin/prisma; do
        if [ -x "${bin}" ]; then
            echo "${bin}"
            return 0
        fi
    done

    if command -v prisma >/dev/null 2>&1; then
        command -v prisma
        return 0
    fi

    if command -v npx >/dev/null 2>&1; then
        echo "npx prisma"
        return 0
    fi

    return 1
}

run_prisma_schema_deploy() {
    if [ "${PRISMA_SCHEMA_DEPLOY:-true}" != "true" ]; then
        log_info "Prisma schema deployment disabled"
        return 0
    fi

    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL is required to deploy the Prisma schema"
        return 1
    fi

    if [ ! -f /app/prisma/schema.prisma ]; then
        log_warn "Prisma schema not found at /app/prisma/schema.prisma; skipping"
        return 0
    fi

    cd /app/prisma
    prisma_bin="$(find_prisma_bin || true)"

    if [ -z "${prisma_bin}" ]; then
        log_error "Prisma CLI is not available"
        return 1
    fi

    case "${PRISMA_SCHEMA_DEPLOY_STRATEGY:-push}" in
        migrate)
            log_info "Deploying Prisma migrations"
            # shellcheck disable=SC2086
            DATABASE_URL="${DATABASE_URL}" ${prisma_bin} migrate deploy
            ;;
        push)
            log_info "Pushing Prisma schema"
            # shellcheck disable=SC2086
            DATABASE_URL="${DATABASE_URL}" ${prisma_bin} db push --accept-data-loss
            ;;
    esac

    log_info "Prisma schema deployed"
}

# ── Commands ──────────────────────────────────────────────────────────────────

run_server() {
    configure_runtime

    log_info "Kami-Sama frontend starting"
    log_info "Frontend listening on 0.0.0.0:${FRONTEND_PORT}"

    if [ ! -d /app/out ]; then
        log_error "Static frontend build not found at /app/out"
        return 1
    fi

    http_server_args="/app/out -a 0.0.0.0 -p ${FRONTEND_PORT} -c-1 -e html"
    if [ "${HTTP_ACCESS_LOGS}" != "true" ]; then
        http_server_args="${http_server_args} --silent"
    fi

    log_info "Starting static frontend"

    # shellcheck disable=SC2086
    exec http-server ${http_server_args}
}

run_worker() {
    configure_runtime

    log_info "Kami-Sama API starting"
    log_info "Backend runtime configured for 0.0.0.0:${SERVER_PORT}"

    backend_binary="$(find_backend_binary || true)"
    if [ -z "${backend_binary}" ]; then
        log_error "Go backend binary not found at /app/server/aether-server"
        return 1
    fi

    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL is required for the Go API"
        return 1
    fi

    if ! run_prisma_schema_deploy; then
        if [ "${ALLOW_MIGRATION_FAILURE}" = "true" ]; then
            log_warn "Prisma schema deployment failed; continuing because ALLOW_MIGRATION_FAILURE=true"
        else
            log_error "Prisma schema deployment failed"
            return 1
        fi
    fi

    log_info "Starting Go backend worker"
    exec "${backend_binary}" worker "$@"
}

# ── Entrypoint ────────────────────────────────────────────────────────────────

role="${1:-server}"

case "${role}" in
    server)
        shift || true
        run_server "$@"
        ;;
    worker)
        shift || true
        run_worker "$@"
        ;;
    *)
        configure_runtime
        display_header
        exec "$@"
        ;;
esac
