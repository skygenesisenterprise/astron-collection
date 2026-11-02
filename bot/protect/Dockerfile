# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord bot (protect)
#
# Build context is the repository root, so the image contains both the bot's own
# catalogue (bot/protect) and the shared technical framework
# (packages/discord-framework). The layout is preserved:
#
#   /app/bot/protect                  the bot, its commands, events and data
#   /app/packages/discord-framework   the framework, imported as ../../packages/…
#   /app/packages/node_modules        symlink to the bot's node_modules, so the
#                                     framework resolves discord.js from it
#
# Build:
#   docker build -f bot/protect/Dockerfile .
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

WORKDIR /app/bot/protect

COPY bot/protect/package.json ./
RUN npm install --no-audit --no-fund

COPY bot/protect/ ./
COPY packages/discord-framework /app/packages/discord-framework

RUN mkdir -p /app/packages \
    && ln -sfn /app/bot/protect/node_modules /app/packages/node_modules

COPY bot/protect/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
