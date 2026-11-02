import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createBotRuntime,
  createCommandRegistry,
  createComponentRegistry,
  createDiscordClient,
  createLogger,
  createVoiceAdapter,
  createVoicePresenceManager,
  keepAlive,
} from "../../packages/discord-framework/src/index.js";
import { env } from "./config/env.js";

const BOT = "main";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Requested by this bot's catalogue (moderation, welcome, levels, tickets,
// automod). Documented in bot/README.md.
const INTENTS = [
  "Guilds",
  "GuildMembers",
  "GuildMessages",
  "MessageContent",
  "GuildModeration",
  "GuildMessageReactions",
  "GuildVoiceStates",
  "GuildScheduledEvents",
  "AutoModerationConfiguration",
  "AutoModerationExecution",
  "DirectMessages",
];

const PARTIALS = ["Channel", "Message", "Reaction", "User", "GuildMember"];

const logger = createLogger({ bot: BOT, level: env.logLevel });

async function main() {
  const client = await createDiscordClient({
    intents: INTENTS,
    partials: PARTIALS,
    // Resolved from this bot's node_modules: the framework never bundles its own
    // copy of the Discord library.
    loadDiscord: () => import("discord.js"),
  });

  const voice = createVoicePresenceManager({
    bot: BOT,
    client,
    config: env,
    logger,
    voice: await createVoiceAdapter({ loadVoice: () => import("@discordjs/voice") }),
  });

  const runtime = await createBotRuntime({
    bot: BOT,
    config: env,
    logger,
    client,
    registry: createCommandRegistry({ bot: BOT }),
    components: createComponentRegistry({ bot: BOT }),
    commandsDir: path.join(__dirname, "commands"),
    eventsDir: path.join(__dirname, "events"),
    voice,
  });

  const health = await runtime.start();

  if (!health.ready) {
    // Same behaviour as before the migration: an unconfigured bot stays alive
    // and observable instead of crash-looping the container.
    logger.error("bot is waiting for a valid configuration", { status: health.status });
    keepAlive({ logger });
  }
}

main().catch((error) => {
  logger.error("bot failed to start", { err: error });
  process.exit(1);
});
