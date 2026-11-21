import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  EVENT_TYPES,
  createEvent,
  createMemoryDatabase,
  runMigrations,
} from "@astron-collection/discord-framework";
import { createLogEntryRepository } from "../repositories/log-entries.js";
import { createLogService } from "../services/log-service.js";

const botRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GUILD = "110000000000000000";
const USER = "220000000000000000";

function harness({ values = {} } = {}) {
  const db = createMemoryDatabase();
  runMigrations(db, path.join(botRoot, "migrations"));

  const state = {
    logChannelId: null,
    retentionDays: 30,
    ignoreBots: true,
    ignoreChannels: [],
    ignoreUsers: [],
    categories: {
      messages: true,
      members: true,
      channels: true,
      roles: true,
      moderation: true,
      security: true,
      automation: true,
      community: true,
    },
    ...values,
  };

  const settings = {
    getAll: () => structuredClone(state),
    get: (_guildId, key) => structuredClone(state[key]),
    list: () => [GUILD],
  };

  const logging = createLogService({
    db,
    repo: createLogEntryRepository({ db }),
    settings,
    logger: { info() {}, warn() {}, debug() {} },
    metrics: { inc() {}, gauge() {} },
    exportMaxRows: 100,
  });

  return { db, state, logging };
}

function fakeMessage(content = "hello") {
  return {
    id: "message-1",
    guild: { id: GUILD },
    guildId: GUILD,
    channelId: "330000000000000000",
    channel: { name: "general" },
    author: { id: USER, tag: "Ada#0001" },
    content,
    attachments: { size: 0 },
    createdAt: new Date(),
    createdTimestamp: Date.now(),
  };
}

describe("logger audit service", () => {
  it("records a projected Discord event and finds it", () => {
    const { db, logging } = harness();

    const inserted = logging.recordDiscord("messageDelete", [fakeMessage("secret text")]);
    assert.ok(inserted?.inserted);

    const result = logging.search(GUILD, { query: "Ada" });
    assert.equal(result.total, 1);
    assert.equal(result.rows[0].event_type, "message.delete");
    assert.equal(result.rows[0].source_bot, "logger");

    db.close();
  });

  it("honours category switches and ignore lists", () => {
    const { db, logging, state } = harness({
      values: { categories: { messages: false }, ignoreUsers: [USER] },
    });

    assert.equal(logging.recordDiscord("messageDelete", [fakeMessage()]), null);
    assert.equal(logging.stats(GUILD).total, 0);

    state.categories.messages = true;
    assert.equal(logging.recordDiscord("messageDelete", [fakeMessage()]), null);

    db.close();
  });

  it("ingests a contract event once and rejects an invalid envelope", () => {
    const { db, logging } = harness();

    const envelope = createEvent({
      type: EVENT_TYPES.MEMBER_JOINED,
      source: "guild",
      guildId: GUILD,
      data: {
        userId: USER,
        memberCount: 12,
        accountCreatedAt: "2025-01-01T00:00:00.000Z",
      },
    });

    const first = logging.ingestEnvelope(envelope);
    const second = logging.ingestEnvelope(envelope);

    assert.equal(first.status, 202);
    assert.equal(second.duplicate, true);
    assert.equal(logging.search(GUILD, {}).total, 1);

    const invalid = logging.ingestEnvelope({ ...envelope, guildId: "not-a-snowflake" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.ok, false);

    db.close();
  });

  it("exports JSON and applies retention", () => {
    const { db, logging } = harness();

    logging.recordDiscord("messageDelete", [fakeMessage()]);
    const exported = logging.exportJson(GUILD, {});
    const parsed = JSON.parse(exported.json);

    assert.equal(parsed.count, 1);
    assert.equal(exported.truncated, false);

    db.run(`UPDATE log_entries SET received_at = ? WHERE guild_id = ?`, "2000-01-01T00:00:00.000Z", GUILD);
    assert.equal(logging.applyRetention(GUILD), 1);
    assert.equal(logging.stats(GUILD).total, 0);

    db.close();
  });
});
