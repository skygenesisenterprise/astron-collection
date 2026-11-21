import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EVENT_TYPES,
  createCollectingSink,
  createEvent,
  createEventBus,
  createOutbox,
  createWebhookSink,
  validateEvent,
  verifySignature,
} from "../src/contracts/index.js";
import { SIGNATURE_HEADER, TIMESTAMP_HEADER } from "../src/index.js";
import { createMemoryDatabase } from "../src/storage/index.js";

const GUILD_ID = "110000000000000000";
const USER_ID = "220000000000000000";
const OCCURRED_AT = "2026-01-01T00:00:00.000Z";

function alertOptions(overrides = {}) {
  return {
    guildId: GUILD_ID,
    occurredAt: OCCURRED_AT,
    data: {
      kind: "spam",
      severity: "medium",
      detail: "too many messages in the same channel",
      actionTaken: "messages deleted",
    },
    ...overrides,
  };
}

function caseOptions() {
  return {
    guildId: GUILD_ID,
    occurredAt: OCCURRED_AT,
    data: {
      caseId: "case-1",
      caseNumber: 1,
      action: "warn",
      targetId: USER_ID,
      moderatorId: "330000000000000000",
      reason: "spam",
      createdAt: OCCURRED_AT,
    },
  };
}

describe("event contracts", () => {
  it("builds a valid versioned envelope", () => {
    const envelope = createEvent({
      type: EVENT_TYPES.MODERATION_CASE_CREATED,
      source: "protect",
      ...caseOptions(),
    });

    assert.equal(envelope.version, 1);
    assert.equal(envelope.source, "protect");
    assert.equal(envelope.guildId, GUILD_ID);
    assert.equal(validateEvent(envelope).ok, true);
    assert.ok(Object.isFrozen(envelope));
  });

  it("refuses an unknown contract and an invalid payload", () => {
    assert.throws(
      () => createEvent({ type: "moderation.unknown", source: "protect", ...caseOptions() }),
      (error) => error.code === "EVENT_UNKNOWN_CONTRACT",
    );

    assert.throws(
      () =>
        createEvent({
          type: EVENT_TYPES.MODERATION_CASE_CREATED,
          source: "protect",
          guildId: GUILD_ID,
          occurredAt: OCCURRED_AT,
          data: { caseId: "case-1" },
        }),
      (error) => error.code === "EVENT_PAYLOAD_INVALID",
    );

    assert.throws(
      () =>
        createEvent({
          type: EVENT_TYPES.MODERATION_CASE_CREATED,
          source: "protect",
          ...caseOptions(),
          data: { ...caseOptions().data, secret: "not in the contract" },
        }),
      /not part of the contract/,
    );
  });

  it("rejects a tampered or outdated envelope", () => {
    const envelope = createEvent({
      type: EVENT_TYPES.SECURITY_ALERT,
      source: "protect",
      ...alertOptions(),
    });

    const tampered = { ...envelope, data: { ...envelope.data, severity: "apocalyptic" } };
    assert.equal(validateEvent(tampered).ok, false);

    const outdated = { ...envelope, version: 0 };
    assert.equal(validateEvent(outdated).ok, false);
  });
});

describe("event bus", () => {
  it("contains a failing sink and still delivers to the others", async () => {
    const collecting = createCollectingSink();
    const bus = createEventBus({
      source: "protect",
      sinks: [
        collecting,
        {
          name: "broken",
          deliver: async () => {
            throw new Error("receiver down");
          },
        },
      ],
    });

    const result = await bus.publish(EVENT_TYPES.SECURITY_ALERT, alertOptions());

    assert.equal(result.ok, false);
    assert.deepEqual(result.delivered, ["collecting"]);
    assert.equal(result.failed[0].sink, "broken");
    assert.equal(collecting.events.length, 1);
  });
});

describe("webhook transport", () => {
  it("exports webhook header names from the framework entrypoint", () => {
    assert.equal(SIGNATURE_HEADER, "x-astron-signature");
    assert.equal(TIMESTAMP_HEADER, "x-astron-timestamp");
  });

  it("signs the exact body and verifies it", async () => {
    const secret = "0123456789abcdef0123456789abcdef";
    const requests = [];
    const clock = () => 1_700_000_000_000;

    const sink = createWebhookSink({
      url: "https://logger.test/ingest/events",
      secret,
      clock,
      sleep: async () => {},
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return { ok: true, status: 202 };
      },
    });

    const envelope = createEvent({
      type: EVENT_TYPES.SECURITY_ALERT,
      source: "protect",
      ...alertOptions(),
    });
    await sink.deliver(envelope);

    const [{ url, options }] = requests;
    assert.equal(url, "https://logger.test/ingest/events");
    assert.equal(options.headers["x-astron-event"], EVENT_TYPES.SECURITY_ALERT);

    const verified = verifySignature({
      secret,
      timestamp: options.headers["x-astron-timestamp"],
      body: options.body,
      signature: options.headers["x-astron-signature"],
      clock,
    });
    assert.equal(verified.ok, true);

    assert.equal(
      verifySignature({
        secret,
        timestamp: options.headers["x-astron-timestamp"],
        body: `${options.body} `,
        signature: options.headers["x-astron-signature"],
        clock,
      }).reason,
      "signature-mismatch",
    );

    assert.equal(
      verifySignature({
        secret,
        timestamp: options.headers["x-astron-timestamp"],
        body: options.body,
        signature: options.headers["x-astron-signature"],
        clock: () => 1_700_000_000_000 + 10 * 60 * 1000,
      }).reason,
      "expired-timestamp",
    );
  });

  it("retries before reporting a delivery failure", async () => {
    let attempts = 0;
    const sink = createWebhookSink({
      url: "https://logger.test/ingest/events",
      secret: "0123456789abcdef0123456789abcdef",
      retries: 2,
      sleep: async () => {},
      fetchImpl: async () => {
        attempts += 1;
        return { ok: false, status: 503 };
      },
    });

    await assert.rejects(
      sink.deliver(
        createEvent({ type: EVENT_TYPES.SECURITY_ALERT, source: "protect", ...alertOptions() }),
      ),
      /503/,
    );
    assert.equal(attempts, 3);
  });
});

describe("outbox", () => {
  it("delivers a pending event and records it once", async () => {
    const db = createMemoryDatabase();
    const collecting = createCollectingSink();
    const bus = createEventBus({ source: "protect", sinks: [collecting] });
    const outbox = createOutbox({ db, bus });

    const { envelope } = outbox.enqueue(EVENT_TYPES.SECURITY_ALERT, alertOptions());
    assert.equal(outbox.stats().pending, 1);

    const result = await outbox.flush();

    assert.deepEqual(result.delivered, [envelope.id]);
    assert.equal(collecting.events.length, 1);
    assert.deepEqual(outbox.stats(), { total: 1, delivered: 1, pending: 0, failed: 0 });
    assert.deepEqual(outbox.pending(), []);

    db.close();
  });

  it("stops retrying after maxAttempts and keeps the failure observable", async () => {
    const db = createMemoryDatabase();
    const bus = createEventBus({
      source: "protect",
      sinks: [
        {
          name: "down",
          deliver: async () => {
            throw new Error("unreachable");
          },
        },
      ],
    });
    const outbox = createOutbox({ db, bus, maxAttempts: 1 });

    outbox.enqueue(EVENT_TYPES.SECURITY_ALERT, alertOptions());
    const result = await outbox.flush();

    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0].exhausted, true);
    assert.equal(outbox.stats().failed, 1);

    db.close();
  });
});
