/** Player composition: database, queue, source resolver, voice and history. */

import path from "node:path";

import {
  createDatabase,
  createEventBus,
  createMetrics,
  createOutbox,
  createSettingsStore,
  createWebhookSink,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { BOT, SETTINGS_DEFAULTS, SETTINGS_VALIDATORS } from "../config/bot.js";
import { createMusicRepository } from "../repositories/music.js";
import { createAudioAdapter } from "./audio.js";
import { createPlayerService } from "./player.js";
import { createQueueManager } from "./queue.js";
import { createSourceResolver } from "./sources.js";

export async function createServices({ config, logger, registry }) {
  const dataDir = config.dataDir || path.resolve(config.botRoot, "data");
  const databasePath = config.databasePath || path.join(dataDir, `${BOT}.sqlite3`);

  const db = createDatabase({ file: databasePath, logger });
  runMigrations(db, path.resolve(config.botRoot, "migrations"), { logger });

  const metrics = createMetrics({ prefix: `astron_${BOT}` });
  const settings = createSettingsStore({
    db,
    bot: BOT,
    defaults: SETTINGS_DEFAULTS,
    validators: SETTINGS_VALIDATORS,
  });

  const sinks = [];
  if (config.eventUrl && config.eventSecret) {
    sinks.push(createWebhookSink({ url: config.eventUrl, secret: config.eventSecret, logger }));
  }
  const events = createEventBus({ source: BOT, sinks, logger, metrics });
  const outbox = createOutbox({ db, bus: events, logger });

  const music = createMusicRepository({ db });
  const queue = createQueueManager();
  const sources = createSourceResolver({ ytdlpPath: config.ytdlpPath });
  const audio = createAudioAdapter({ logger, ytdlpPath: config.ytdlpPath });

  const player = createPlayerService({
    queue,
    sources,
    music,
    settings,
    audio,
    outbox,
    logger,
    metrics,
  });

  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => {
      outbox.flush().catch((error) => logger.warn("outbox flush failed", { err: error }));
    }, 10_000);
    timer.unref?.();
    logger.info("player services started", { database: databasePath });
  }

  return {
    bot: BOT,
    config,
    logger,
    metrics,
    db,
    settings,
    events,
    outbox,
    music,
    queue,
    sources,
    audio,
    player,
    registry,
    start,
    close: () => {
      if (timer) clearInterval(timer);
      timer = null;
      audio.destroyAll();
      try {
        db.close();
      } catch (error) {
        logger.warn("database close failed", { err: error });
      }
    },
  };
}
