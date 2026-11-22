# Protect — independent image. Build context is the repository root:
#
#   docker build -f bot/protect/Dockerfile \
#     -t ghcr.io/skygenesisenterprise/astron-protect:local .
FROM node:24-alpine

ARG ASTRON_COLLECTION_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${ASTRON_COLLECTION_VERSION} \
    ASTRON_DATA_DIR=/app/bot/protect/data \
    ASTRON_HEALTH_PORT=3011 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app/bot/protect

COPY packages/discord-framework/package.json /app/packages/discord-framework/package.json
COPY bot/protect/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY packages/discord-framework /app/packages/discord-framework
COPY bot/protect/ ./

RUN mkdir -p /app/packages /app/bot/protect/data \
    && ln -sfn /app/bot/protect/node_modules /app/packages/node_modules

COPY bot/protect/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

VOLUME ["/app/bot/protect/data"]
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3011)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
