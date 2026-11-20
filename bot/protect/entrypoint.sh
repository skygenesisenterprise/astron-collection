#!/bin/sh
set -eu

BOT_DIR="${BOT_DIR:-/app/bot/protect}"
DATA_DIR="${ASTRON_DATA_DIR:-$BOT_DIR/data}"

mkdir -p "$DATA_DIR"
export ASTRON_DATA_DIR="$DATA_DIR"

if [ ! -f "$BOT_DIR/index.js" ]; then
  echo "[protect] missing entrypoint at $BOT_DIR/index.js" >&2
  exit 1
fi

if [ "${NODE_ENV:-production}" = "development" ]; then
  echo "[protect] development mode (node --watch)"
  cd "$BOT_DIR"
  exec node --disable-warning=ExperimentalWarning --watch index.js "$@"
fi

cd "$BOT_DIR"
exec node --disable-warning=ExperimentalWarning index.js "$@"
