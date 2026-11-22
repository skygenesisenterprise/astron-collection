# Automations — independent image. Build context is the repository root:
#
#   docker build -f bot/automations/Dockerfile \
#     -t ghcr.io/skygenesisenterprise/astron-automations:local .
FROM node:24-alpine

ARG ASTRON_COLLECTION_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${ASTRON_COLLECTION_VERSION} \
    ASTRON_DATA_DIR=/app/bot/automations/data \
    ASTRON_HEALTH_PORT=3014 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app/bot/automations

COPY packages/discord-framework/package.json /app/packages/discord-framework/package.json
COPY bot/automations/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY packages/discord-framework /app/packages/discord-framework
COPY bot/automations/ ./

RUN mkdir -p /app/packages /app/bot/automations/data \
    && ln -sfn /app/bot/automations/node_modules /app/packages/node_modules

COPY bot/automations/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

VOLUME ["/app/bot/automations/data"]
EXPOSE 3014
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3014)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
