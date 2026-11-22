# Player — independent image. Build context is the repository root:
#
#   docker build -f bot/player/Dockerfile \
#     -t ghcr.io/skygenesisenterprise/astron-player:local .
#
# ffmpeg + yt-dlp are the only extra runtime tools; both are installed in the
# image so the bot needs no sidecar to resolve and decode audio.
FROM node:24-alpine

ARG ASTRON_COLLECTION_VERSION=2.0.0
ENV NODE_ENV=production \
    APP_VERSION=${ASTRON_COLLECTION_VERSION} \
    ASTRON_DATA_DIR=/app/bot/player/data \
    ASTRON_HEALTH_PORT=3015 \
    ASTRON_YTDLP_PATH=/usr/local/bin/yt-dlp \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# The official yt-dlp release is a Python script, hence python3 alongside ffmpeg.
RUN apk add --no-cache ca-certificates tzdata ffmpeg python3 \
    && wget -qO /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app/bot/player

COPY packages/discord-framework/package.json /app/packages/discord-framework/package.json
COPY bot/player/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY packages/discord-framework /app/packages/discord-framework
COPY bot/player/ ./

RUN mkdir -p /app/packages /app/bot/player/data \
    && ln -sfn /app/bot/player/node_modules /app/packages/node_modules

COPY bot/player/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

VOLUME ["/app/bot/player/data"]
EXPOSE 3015
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3015)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
