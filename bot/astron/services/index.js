/**
 * Astron service composition.
 *
 * One database, one settings store, one event bus and one metrics registry for
 * the process. Services are constructed once and handed to commands; they never
 * import the Discord client.
 */

import path from "node:path";

import {
  createBotTranslator,
  createDatabase,
  createEventBus,
  createMetrics,
  createSettingsStore,
  createWebhookSink,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { BOT, SETTINGS_DEFAULTS, SETTINGS_VALIDATORS } from "../config/bot.js";
import { createGuildEventRepository } from "../repositories/guild-events.js";
import { createHelpService } from "./help-service.js";
import { createInfoService } from "./info-service.js";
import { createStatusService } from "./status-service.js";

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
    sinks.push(
      createWebhookSink({
        url: config.eventUrl,
        secret: config.eventSecret,
        logger,
      }),
    );
  } else if (config.eventUrl) {
    logger.warn("event delivery disabled: ASTRON_EVENT_SECRET is empty");
  }

  const events = createEventBus({ source: BOT, sinks, logger, metrics });
  const translator = createBotTranslator({ locale: SETTINGS_DEFAULTS.locale });

  const services = {
    bot: BOT,
    config,
    logger,
    metrics,
    db,
    settings,
    events,
    translator,
    guildEvents: createGuildEventRepository({ db }),
    info: createInfoService({ bot: BOT, config }),
    help: createHelpService({ registry }),
    status: null,
    close: () => {
      try {
        db.close();
      } catch (error) {
        logger.warn("database close failed", { err: error });
      }
    },
  };

  services.status = createStatusService({
    bot: BOT,
    config,
    db,
    registry,
    metrics,
  });

  return services;
}
