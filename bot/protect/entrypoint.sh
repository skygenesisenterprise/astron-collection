#!/bin/sh
set -e

export NODE_ENV="${NODE_ENV:-production}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export REDIS_ENABLED="${REDIS_ENABLED:-true}"
export REDIS_REQUIRED="${REDIS_REQUIRED:-false}"

timestamp_utc() {
    date -u '+%Y-%m-%dT%H:%M:%SZ'
}

should_log() {
    requested_level="$1"

    case "${LOG_LEVEL:-info}" in
        debug)
            return 0
            ;;
        info)
            [ "${requested_level}" != "debug" ]
            ;;
        warn)
            [ "${requested_level}" = "warn" ] || [ "${requested_level}" = "error" ]
            ;;
        error)
            [ "${requested_level}" = "error" ]
            ;;
        *)
            return 0
            ;;
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

configure_redis_from_url() {
    if [ -z "${REDIS_URL:-}" ]; then
        return 0
    fi

    redis_url="${REDIS_URL#redis://}"
    redis_url="${redis_url#rediss://}"
    redis_authority="${redis_url%%/*}"
    redis_db="${redis_url#*/}"
    redis_db="${redis_db%%\?*}"

    credentials=""
    redis_host_port="${redis_authority}"
    if [ "${redis_authority#*@}" != "${redis_authority}" ]; then
        credentials="${redis_authority%@*}"
        redis_host_port="${redis_authority#*@}"
    fi

    if [ -n "${credentials}" ]; then
        case "${credentials}" in
            *:*)
                export REDIS_PASSWORD="${credentials#*:}"
                ;;
            *)
                export REDIS_PASSWORD="${credentials}"
                ;;
        esac
    fi

    case "${redis_host_port}" in
        \[*\]:*)
            export REDIS_HOST="${redis_host_port%\]:*}"
            export REDIS_HOST="${REDIS_HOST#\[}"
            export REDIS_PORT="${redis_host_port##*\]:}"
            ;;
        *:*)
            export REDIS_HOST="${redis_host_port%%:*}"
            export REDIS_PORT="${redis_host_port#*:}"
            ;;
        *)
            export REDIS_HOST="${redis_host_port}"
            ;;
    esac

    if [ -n "${redis_db}" ] && [ "${redis_db}" != "${redis_url}" ]; then
        export REDIS_DB="${redis_db}"
    fi
}

configure_runtime() {
    configure_redis_from_url

    export REDIS_HOST="${REDIS_HOST:-redis}"
    export REDIS_PORT="${REDIS_PORT:-6379}"
    export REDIS_DB="${REDIS_DB:-0}"
    export REDIS_KEY_PREFIX="${REDIS_KEY_PREFIX:-astron:v1}"
    export REDIS_ENABLED="${REDIS_ENABLED:-true}"
    export REDIS_REQUIRED="${REDIS_REQUIRED:-false}"

    case "${LOG_LEVEL}" in
        debug|info|warn|error)
            ;;
        *)
            log_warn "Invalid LOG_LEVEL '${LOG_LEVEL}'; expected debug, info, warn, or error"
            ;;
    esac
}

log_redis_configuration() {
    if [ "${REDIS_ENABLED}" = "true" ]; then
        log_info "Redis enabled at ${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}"
        if [ -z "${REDIS_URL:-}" ]; then
            log_warn "REDIS_URL is not configured; the bot will use the Redis host/port settings"
        fi
    else
        log_info "Redis disabled"
    fi

    if [ "${REDIS_ENABLED}" = "true" ] && [ "${REDIS_REQUIRED}" != "true" ]; then
        log_warn "Redis is optional; the bot may continue without cache"
    fi
}

run_bot() {
    configure_runtime
    log_redis_configuration
    log_info "Discord bot starting"

    cd /app/bot

    if [ ! -f index.js ]; then
        log_error "Bot entrypoint not found at /app/bot/index.js"
        return 1
    fi

    if [ ! -d node_modules ]; then
        log_error "Bot dependencies not found at /app/bot/node_modules"
        return 1
    fi

    if [ "${NODE_ENV}" = "development" ]; then
        log_info "Running in development mode (node --watch)"
        exec node --watch index.js "$@"
    fi

    exec node index.js "$@"
}

role="${1:-bot}"

case "${role}" in
    bot)
        shift || true
        run_bot "$@"
        ;;
    worker)
        shift || true
        log_warn "No dedicated worker process is implemented; keeping the container alive."
        exec tail -f /dev/null
        ;;
    *)
        exec "$@"
        ;;
esac
