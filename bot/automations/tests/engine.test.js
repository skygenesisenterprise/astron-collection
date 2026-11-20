import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createWorkflowEngine, matchesConditions, renderWorkflowText } from "../services/engine.js";

function harness({ executed = async () => {}, hasRun = () => false } = {}) {
  const records = [];
  const actions = [
    { id: "a1", type: "send_message", config: { message: "hi" } },
    { id: "a2", type: "dm", config: { message: "hello" } },
  ];
  const repo = { listActions: () => actions };
  const runs = {
    hasRun,
    record: (run) => {
      records.push(run);
      return run;
    },
  };
  const engine = createWorkflowEngine({
    repo,
    runs,
    executeAction: executed,
    clock: () => new Date("2026-11-20T10:00:00.000Z"),
    retries: 1,
    logger: null,
    metrics: { inc() {} },
  });
  return { engine, records, workflow: { id: "w1", guild_id: "g1", enabled: true } };
}

describe("workflow engine", () => {
  it("runs actions in order and records success", async () => {
    const seen = [];
    const { engine, records, workflow } = harness({ executed: async (action) => seen.push(action.id) });
    const result = await engine.run(workflow, { type: "message", config: {} }, { guildId: "g1" });

    assert.deepEqual(seen, ["a1", "a2"]);
    assert.equal(result.status, "success");
    assert.equal(records[0].status, "success");
    assert.equal(records[0].detail.length, 2);
  });

  it("retries a failing action before reporting failure", async () => {
    let attempts = 0;
    const { engine, records, workflow } = harness({
      executed: async (action) => {
        if (action.id === "a1") {
          attempts += 1;
          if (attempts === 1) throw new Error("temporary");
        }
      },
    });

    const recovered = await engine.run(workflow, { type: "message", config: {} }, {});
    assert.equal(recovered.status, "success");
    assert.equal(attempts, 2);

    const failing = harness({
      executed: async () => {
        throw new Error("permanent");
      },
    });
    const result = await failing.engine.run(workflow, { type: "message", config: {} }, {});
    assert.equal(result.status, "failed");
    assert.equal(failing.records[0].error, "permanent");
  });

  it("deduplicates an idempotency key", async () => {
    const { engine, workflow } = harness({ hasRun: () => true });
    assert.equal((await engine.run(workflow, { type: "message" }, {}, { idempotencyKey: "k" })).status, "duplicate");
  });

  it("skips when conditions do not match", async () => {
    const { engine, records, workflow } = harness();
    const result = await engine.run(
      workflow,
      { type: "message", config: { conditions: { contains: "hello" } } },
      { content: "goodbye" },
    );
    assert.equal(result.status, "skipped");
    assert.equal(records[0].status, "skipped");
  });

  it("dry runs without side effects", async () => {
    const { engine, workflow } = harness({
      executed: async () => {
        throw new Error("must not run");
      },
    });
    const result = await engine.dryRun(workflow, { type: "message", config: {} }, {});
    assert.equal(result.ok, true);
    assert.equal(result.actions.length, 2);
  });

  it("evaluates conditions and renders placeholders", () => {
    assert.equal(matchesConditions({ userId: "1" }, { userId: "1" }).ok, true);
    assert.equal(matchesConditions({ roleId: "9" }, { member: { roles: { cache: { has: () => false } } } }).ok, false);
    assert.equal(
      renderWorkflowText("{user} on {server} in {channel}: {content}", {
        userId: "1",
        guildName: "Astron",
        channelId: "2",
        content: "hello",
      }),
      "<@1> on Astron in <#2>: hello",
    );
  });
});
