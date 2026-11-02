# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord bot (logger)
#
# Build context is the repository root, so the image contains both the bot's own
# catalogue (bot/logger) and the shared technical framework
# (packages/discord-framework).
#
# Build:
#   docker build -f bot/logger/Dockerfile .
# ══════════════════════════════════════════════════════════════════════════════
FROM node:25-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    bash \
    wget

WORKDIR /app/bot/logger

COPY bot/logger/package.json ./
RUN npm install --no-audit --no-fund

COPY bot/logger/ ./
COPY packages/discord-framework /app/packages/discord-framework

RUN mkdir -p /app/packages \
    && ln -sfn /app/bot/logger/node_modules /app/packages/node_modules

COPY bot/logger/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
