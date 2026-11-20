/** Protect service composition: database, settings, cases, moderation, security. */

import path from "node:path";

import {
  createBotTranslator,
  createDatabase,
  createEventBus,
  createMetrics,
  createOutbox,
  createSettingsStore,
  createWebhookSink,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { BOT, SETTINGS_DEFAULTS, SETTINGS_VALIDATORS } from "../config/bot.js";
import { createCaseRepository } from "../repositories/cases.js";
import { createDetectionRepository } from "../repositories/detections.js";
import { createQuarantineRepository } from "../repositories/quarantine.js";
import { createCaseService } from "./case-service.js";
import { createModerationService } from "./moderation-service.js";
import { createQuarantineService } from "./quarantine-service.js";
import { createSecurityService } from "./security-service.js";

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
  } else if (config.eventUrl) {
    logger.warn("moderation events will stay in the outbox: ASTRON_EVENT_SECRET is empty");
  }

  const events = createEventBus({ source: BOT, sinks, logger, metrics });
  const outbox = createOutbox({ db, bus: events, logger });

  const cases = createCaseService({
    db,
    repo: createCaseRepository({ db }),
    outbox,
    logger,
  });

  const quarantine = createQuarantineService({
    repo: createQuarantineRepository({ db }),
    settings,
    logger,
  });

  const moderation = createModerationService({ cases, quarantine, settings, logger, metrics });

  const security = createSecurityService({
    settings,
    detections: createDetectionRepository({ db }),
    cases,
    quarantine,
    outbox,
    logger,
    metrics,
  });

  let timer = null;
  let flushing = false;

  function start() {
    if (timer) return;
    timer = setInterval(async () => {
      if (flushing) return;
      flushing = true;
      try {
        const result = await outbox.flush();
        if (result.delivered.length > 0) logger.info("moderation events delivered", { count: result.delivered.length });
      } catch (error) {
        logger.warn("outbox flush failed", { err: error });
      } finally {
        flushing = false;
      }
    }, 5_000);
    timer.unref?.();
    logger.info("protect services started", { database: databasePath });
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
    cases,
    moderation,
    security,
    quarantine,
    translator: createBotTranslator(),
    registry,
    start,
    close: () => {
      if (timer) clearInterval(timer);
      timer = null;
      try {
        db.close();
      } catch (error) {
        logger.warn("database close failed", { err: error });
      }
    },
  };
}
