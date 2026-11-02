# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord bot (player)
#
# Build context is the repository root, so the image contains both the bot's own
# catalogue (bot/player) and the shared technical framework
# (packages/discord-framework).
#
# The image ships no audio player of its own: voice presence is a connection
# state, and an audio session would take a lease from the framework's session
# coordinator (packages/discord-framework/src/voice/session.js).
#
# Build:
#   docker build -f bot/player/Dockerfile .
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

WORKDIR /app/bot/player

COPY bot/player/package.json ./
RUN npm install --no-audit --no-fund

COPY bot/player/ ./
COPY packages/discord-framework /app/packages/discord-framework

RUN mkdir -p /app/packages \
    && ln -sfn /app/bot/player/node_modules /app/packages/node_modules

COPY bot/player/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
