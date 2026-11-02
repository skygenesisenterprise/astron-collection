# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord bot (guild)
#
# Build context is the repository root, so the image contains both the bot's own
# catalogue (bot/guild) and the shared technical framework
# (packages/discord-framework).
#
# Build:
#   docker build -f bot/guild/Dockerfile .
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

WORKDIR /app/bot/guild

COPY bot/guild/package.json ./
RUN npm install --no-audit --no-fund

COPY bot/guild/ ./
COPY packages/discord-framework /app/packages/discord-framework

RUN mkdir -p /app/packages \
    && ln -sfn /app/bot/guild/node_modules /app/packages/node_modules

COPY bot/guild/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
