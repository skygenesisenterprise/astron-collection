/** Guild service composition: database, settings, XP, community, boards, outbox. */

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
import { createBoardRepository } from "../repositories/boards.js";
import { createCommunityRepository } from "../repositories/community.js";
import { createMemberRepository } from "../repositories/members.js";
import { createCommunityService } from "./community.js";
import { createLevelingService } from "./leveling.js";
import { createPollService } from "./polls.js";
import { createSuggestionService } from "./suggestions.js";

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

  const leveling = createLevelingService({
    repo: createMemberRepository({ db }),
    settings,
    metrics,
  });

  const community = createCommunityService({
    repo: createCommunityRepository({ db }),
    settings,
    outbox,
    logger,
    metrics,
  });

  const boardRepo = createBoardRepository({ db });
  const polls = createPollService({ repo: boardRepo, metrics });
  const suggestions = createSuggestionService({ repo: boardRepo, outbox, metrics });
  const boards = boardRepo;

  let reminderTimer = null;
  let birthdayTimer = null;
  let outboxTimer = null;
  let running = false;

  function start() {
    if (reminderTimer) return;

    reminderTimer = setInterval(async () => {
      if (running) return;
      running = true;
      try {
        await community.deliverDueReminders();
      } catch (error) {
        logger.warn("reminder delivery failed", { err: error });
      } finally {
        running = false;
      }
    }, 30_000);
    reminderTimer.unref?.();

    birthdayTimer = setInterval(() => {
      community.announceBirthdays().catch((error) => logger.warn("birthday announcement failed", { err: error }));
    }, 60 * 60 * 1000);
    birthdayTimer.unref?.();

    outboxTimer = setInterval(() => {
      outbox.flush().catch((error) => logger.warn("outbox flush failed", { err: error }));
    }, 10_000);
    outboxTimer.unref?.();

    const initial = setTimeout(() => {
      community.deliverDueReminders().catch(() => {});
      outbox.flush().catch(() => {});
    }, 10_000);
    initial.unref?.();

    logger.info("guild services started", { database: databasePath });
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
    leveling,
    community,
    polls,
    suggestions,
    boards,
    registry,
    translator: createBotTranslator(),
    start,
    close: () => {
      for (const timer of [reminderTimer, birthdayTimer, outboxTimer]) {
        if (timer) clearInterval(timer);
      }
      reminderTimer = null;
      birthdayTimer = null;
      outboxTimer = null;
      try {
        db.close();
      } catch (error) {
        logger.warn("database close failed", { err: error });
      }
    },
  };
}
