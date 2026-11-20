# Astron — independent image.
#
# Build context is the repository root because the image ships the bot and the
# shared framework it imports relatively:
#
#   /app/bot/astron                  this bot, its migrations and data volume
#   /app/packages/discord-framework  the shared foundation
#   /app/packages/node_modules       symlink, so the framework resolves discord.js
#
# Build: docker build -f bot/astron/Dockerfile -t astron .
FROM node:24-alpine

ARG APP_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    ASTRON_DATA_DIR=/app/bot/astron/data

RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app/bot/astron

COPY bot/astron/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY bot/astron/ ./
COPY packages/discord-framework /app/packages/discord-framework

RUN mkdir -p /app/packages /app/bot/astron/data \
    && ln -sfn /app/bot/astron/node_modules /app/packages/node_modules

COPY bot/astron/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/app/bot/astron/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]
