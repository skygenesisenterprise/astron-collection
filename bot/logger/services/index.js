/** Logger service composition: database, settings, audit service, retention loop. */

import path from "node:path";

import {
  createBotTranslator,
  createDatabase,
  createMetrics,
  createSettingsStore,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { BOT, SETTINGS_DEFAULTS, SETTINGS_VALIDATORS } from "../config/bot.js";
import { createLogEntryRepository } from "../repositories/log-entries.js";
import { createLogService } from "./log-service.js";

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

  const logging = createLogService({
    db,
    repo: createLogEntryRepository({ db }),
    settings,
    logger,
    metrics,
    exportMaxRows: config.exportMaxRows,
  });

  let timer = null;

  function start() {
    if (timer) return;
    const sweep = () => {
      try {
        const deleted = logging.retentionSweep();
        metrics.gauge("retention_deleted_total", deleted);
      } catch (error) {
        logger.warn("retention sweep failed", { err: error });
      }
    };
    timer = setInterval(sweep, 6 * 60 * 60 * 1000);
    timer.unref?.();
    const initial = setTimeout(sweep, 15_000);
    initial.unref?.();
    logger.info("logger services started", { database: databasePath, commands: registry.size });
  }

  return {
    bot: BOT,
    config,
    logger,
    metrics,
    db,
    settings,
    logging,
    registry,
    translator: createBotTranslator(),
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
