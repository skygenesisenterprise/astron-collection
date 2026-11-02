# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord bot (main)
#
# Build context is the repository root, so the image contains both the bot's own
# catalogue (bot/main) and the shared technical framework
# (packages/discord-framework). The layout is preserved:
#
#   /app/bot/main                     the bot, its commands, events and data
#   /app/packages/discord-framework   the framework, imported as ../../packages/…
#   /app/packages/node_modules        symlink to the bot's node_modules, so the
#                                     framework resolves discord.js from it
#
# Build:
#   docker build -f bot/main/Dockerfile .
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

WORKDIR /app/bot/main

COPY bot/main/package.json ./
RUN npm install --no-audit --no-fund

COPY bot/main/ ./
COPY packages/discord-framework /app/packages/discord-framework

# Node resolves a bare specifier by walking up from the importing file, so the
# framework finds the bot's installed dependencies here.
RUN mkdir -p /app/packages \
    && ln -sfn /app/bot/main/node_modules /app/packages/node_modules

COPY bot/main/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
