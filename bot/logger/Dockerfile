# ══════════════════════════════════════════════════════════════════════════════
# Astron Collection — Discord Bot (unified image)
# Builds only the bot from bot/logger. Run alongside redis via docker-compose.yml.
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

WORKDIR /app/bot

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
