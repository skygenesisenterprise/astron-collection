#!/bin/sh
set -eu

# One process per bot. Every image uses the same entrypoint contract: resolve
# the data directory, optionally deploy commands, then exec the bot.
BOT_NAME="astron"
BOT_DIR="${BOT_DIR:-/app/bot/astron}"
DATA_DIR="${ASTRON_DATA_DIR:-$BOT_DIR/data}"
HEALTH_PORT="${ASTRON_HEALTH_PORT:-3010}"

mkdir -p "$DATA_DIR"
export ASTRON_DATA_DIR="$DATA_DIR"

if [ ! -f "$BOT_DIR/index.js" ]; then
  echo "[$BOT_NAME] missing entrypoint at $BOT_DIR/index.js" >&2
  exit 1
fi

cd "$BOT_DIR"

if [ "${ASTRON_DEPLOY_COMMANDS:-false}" = "true" ]; then
  echo "[$BOT_NAME] deploying slash commands"
  node --disable-warning=ExperimentalWarning deploy-commands.js
fi

if [ "${NODE_ENV:-production}" = "development" ]; then
  echo "[$BOT_NAME] development mode (node --watch)"
  exec node --disable-warning=ExperimentalWarning --watch index.js "$@"
fi

echo "[$BOT_NAME] starting (health port $HEALTH_PORT, data: $DATA_DIR)"
exec node --disable-warning=ExperimentalWarning index.js "$@"
