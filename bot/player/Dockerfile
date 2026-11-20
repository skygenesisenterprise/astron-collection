# syntax=docker/dockerfile:1
FROM node:22-slim AS base
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates \
  && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && apt-get purge -y curl \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/discord-framework/package.json packages/discord-framework/
COPY bot/player/package.json bot/player/
RUN corepack enable && pnpm install --frozen-lockfile --prod --filter @astron-collection/player...

COPY packages/discord-framework packages/discord-framework
COPY bot/player bot/player

WORKDIR /app/bot/player
RUN mkdir -p /app/bot/player/data && chown -R node:node /app
USER node

EXPOSE 3015
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3015)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
