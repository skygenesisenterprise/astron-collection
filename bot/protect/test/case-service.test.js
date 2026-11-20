import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  createCollectingSink,
  createEventBus,
  createMemoryDatabase,
  createOutbox,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { createCaseRepository } from "../repositories/cases.js";
import { createCaseService } from "../services/case-service.js";

const botRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GUILD = "110000000000000000";
const TARGET = "220000000000000000";
const MODERATOR = "330000000000000000";

function harness() {
  const db = createMemoryDatabase();
  runMigrations(db, path.join(botRoot, "migrations"));

  const sink = createCollectingSink();
  const bus = createEventBus({ source: "protect", sinks: [sink] });
  const outbox = createOutbox({ db, bus });
  const cases = createCaseService({
    db,
    repo: createCaseRepository({ db }),
    outbox,
    logger: { info() {} },
  });

  return { db, sink, outbox, cases };
}

describe("case service", () => {
  it("numbers cases per guild and emits a contract event", async () => {
    const { db, cases, outbox, sink } = harness();

    const first = cases.create({
      guildId: GUILD,
      action: "warn",
      targetId: TARGET,
      targetTag: "Target#0001",
      moderatorId: MODERATOR,
      moderatorTag: "Mod#0001",
      reason: "Spam",
    });
    const second = cases.create({
      guildId: GUILD,
      action: "kick",
      targetId: TARGET,
      moderatorId: MODERATOR,
      reason: "Repeat",
    });

    assert.equal(first.case_number, 1);
    assert.equal(second.case_number, 2);
    assert.equal(outbox.stats().pending, 2);

    const delivered = await outbox.flush();
    assert.equal(delivered.delivered.length, 2);
    assert.equal(sink.events[0].type, "moderation.case.created");
    assert.equal(sink.events[1].data.caseNumber, 2);

    db.close();
  });

  it("lists active warnings and closes them through status updates", () => {
    const { db, cases, outbox } = harness();

    cases.create({
      guildId: GUILD,
      action: "warn",
      targetId: TARGET,
      moderatorId: MODERATOR,
      reason: "First",
    });

    assert.equal(cases.warnings(GUILD, TARGET).length, 1);

    const updated = cases.update({
      guildId: GUILD,
      caseNumber: 1,
      status: "closed",
      note: "Reviewed",
      updatedBy: MODERATOR,
    });

    assert.equal(updated.status, "closed");
    assert.equal(cases.warnings(GUILD, TARGET).length, 0);
    assert.equal(outbox.stats().pending, 2);

    db.close();
  });

  it("rejects a status update for an unknown case", () => {
    const { db, cases } = harness();
    assert.throws(
      () => cases.update({ guildId: GUILD, caseNumber: 99, status: "closed", updatedBy: MODERATOR }),
      /introuvable|does not exist/,
    );
    db.close();
  });
});
