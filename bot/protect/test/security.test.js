import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSecurityService, isPhishing } from "../services/security-service.js";

describe("phishing detection", () => {
  it("flags known impersonation and nitro-gift domains", () => {
    assert.equal(isPhishing("http://discord-gift.ru/nitro"), true);
    assert.equal(isPhishing("https://dlscord.com/claim"), true);
    assert.equal(isPhishing("https://steamcommunlty.com/gift"), true);
    assert.equal(isPhishing("free nitro for everyone"), false);
  });

  it("does not flag ordinary links or malformed input", () => {
    assert.equal(isPhishing("https://discord.com/channels/1/2"), false);
    assert.equal(isPhishing("https://github.com/skygenesisenterprise/astron-collection"), false);
    assert.equal(isPhishing("http://"), false);
    assert.equal(isPhishing(null), false);
  });
});

function harness({ antispam = { enabled: true, maxMessages: 2, windowSeconds: 8, timeoutSeconds: 600 } } = {}) {
  const settingsValues = {
    logChannelId: null,
    quarantineRoleId: null,
    dmOnPunishment: true,
    antispam,
    antiraid: { enabled: false, joinsPerMinute: 10, minAccountAgeDays: 7, action: "quarantine" },
    antiphish: { enabled: true, action: "delete" },
    mentionSpam: { enabled: false, maxMentions: 5 },
  };
  const alerts = [];
  const cases = [];
  const timeouts = [];
  let deleted = 0;

  const service = createSecurityService({
    settings: { getAll: () => settingsValues },
    detections: { record: (entry) => alerts.push(entry), countSince: () => alerts.length, recent: () => alerts },
    cases: { create: (record) => cases.push(record) },
    quarantine: { isQuarantined: () => false, release: async () => {} },
    outbox: { enqueue: () => {} },
    logger: { warn() {}, debug() {}, info() {} },
    metrics: { inc() {} },
    clock: () => 1_000_000,
  });

  const message = {
    id: "message-1",
    guild: { id: "110000000000000000" },
    guildId: "110000000000000000",
    channelId: "220000000000000000",
    author: { id: "330000000000000000", tag: "Spammer#0001", bot: false },
    member: {
      id: "330000000000000000",
      timeout: async (ms) => timeouts.push(ms),
    },
    client: { user: { id: "440000000000000000", tag: "Protect#0001" } },
    content: "spam spam spam",
    mentions: { users: new Map() },
    delete: async () => {
      deleted += 1;
    },
  };

  return { service, message, alerts, cases, timeouts, get deleted() { return deleted; } };
}

describe("automated protection", () => {
  it("ignores a bot and a direct message", async () => {
    const { service } = harness();
    assert.deepEqual(await service.onMessage({ author: { bot: true } }), { action: "ignored" });
    assert.deepEqual(await service.onMessage({ guild: null, author: { bot: false } }), { action: "ignored" });
  });

  it("times out a member who exceeds the message window", async () => {
    const harnessed = harness({ antispam: { enabled: true, maxMessages: 1, windowSeconds: 8, timeoutSeconds: 600 } });

    assert.equal((await harnessed.service.onMessage(harnessed.message)).action, "allowed");
    const result = await harnessed.service.onMessage(harnessed.message);

    assert.equal(result.kind, "spam");
    assert.deepEqual(harnessed.timeouts, [600_000]);
    assert.equal(harnessed.deleted, 1);
    assert.equal(harnessed.alerts[0].kind, "spam");
    assert.equal(harnessed.cases[0].action, "timeout");
  });

  it("deletes a phishing link and records an alert", async () => {
    const harnessed = harness();
    harnessed.message.content = "https://discord-gift.ru/nitro";

    const result = await harnessed.service.onMessage(harnessed.message);

    assert.equal(result.kind, "phishing");
    assert.equal(harnessed.deleted, 1);
    assert.equal(harnessed.alerts[0].severity, "high");
  });
});
