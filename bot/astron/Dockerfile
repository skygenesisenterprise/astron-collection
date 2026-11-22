# Astron — independent image. Build context is the repository root:
#
#   docker build -f bot/astron/Dockerfile \
#     -t ghcr.io/skygenesisenterprise/astron:local .
#
# The shared @astron-collection/discord-framework comes from the same context.
# Nothing else is required: one image, one process, one data volume.
FROM node:24-alpine

ARG ASTRON_COLLECTION_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${ASTRON_COLLECTION_VERSION} \
    ASTRON_DATA_DIR=/app/bot/astron/data \
    ASTRON_HEALTH_PORT=3010 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app/bot/astron

COPY packages/discord-framework/package.json /app/packages/discord-framework/package.json
COPY bot/astron/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY packages/discord-framework /app/packages/discord-framework
COPY bot/astron/ ./

# The framework resolves its peers from its real path (/app/packages/...), so
# point that path at the bot's node_modules instead of installing a second copy.
RUN mkdir -p /app/packages /app/bot/astron/data \
    && ln -sfn /app/bot/astron/node_modules /app/packages/node_modules

COPY bot/astron/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

VOLUME ["/app/bot/astron/data"]
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3010)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
