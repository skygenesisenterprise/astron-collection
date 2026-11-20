#!/bin/sh
set -eu

if [ "${ASTRON_DEPLOY_COMMANDS:-false}" = "true" ]; then
  echo "deploying automations commands"
  node deploy-commands.js
fi

exec node --disable-warning=ExperimentalWarning index.js
