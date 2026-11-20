# syntax=docker/dockerfile:1
FROM node:22-slim AS base
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/discord-framework/package.json packages/discord-framework/
COPY bot/automations/package.json bot/automations/
RUN corepack enable && pnpm install --frozen-lockfile --prod --filter @astron-collection/automations...

COPY packages/discord-framework packages/discord-framework
COPY bot/automations bot/automations

WORKDIR /app/bot/automations
RUN mkdir -p /app/bot/automations/data && chown -R node:node /app
USER node

EXPOSE 3014
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.ASTRON_HEALTH_PORT||3014)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
