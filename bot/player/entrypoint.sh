#!/bin/sh
set -eu

if [ "${ASTRON_DEPLOY_COMMANDS:-false}" = "true" ]; then
  echo "deploying player commands"
  node deploy-commands.js
fi

exec node --disable-warning=ExperimentalWarning index.js
