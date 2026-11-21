# Logger — independent image. Build context: repository root.
FROM node:24-alpine

ARG APP_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    ASTRON_DATA_DIR=/app/bot/logger/data

RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app/bot/logger

COPY packages/discord-framework /app/packages/discord-framework
COPY bot/logger/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY bot/logger/ ./

RUN mkdir -p /app/packages /app/bot/logger/data \
    && ln -sfn /app/bot/logger/node_modules /app/packages/node_modules

COPY bot/logger/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/app/bot/logger/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]
