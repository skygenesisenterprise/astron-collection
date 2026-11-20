import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { createDatabase, runMigrations } from "../../../packages/discord-framework/src/index.js";
import { createRunRepository } from "../repositories/runs.js";
import { createWorkflowRepository } from "../repositories/workflows.js";
import { createWorkflowEngine } from "../services/engine.js";
import { createWorkflowService, validateAction, validateTrigger } from "../services/workflows.js";

const directory = mkdtempSync(path.join(tmpdir(), "astron-automations-"));
const db = createDatabase({ file: path.join(directory, "workflows.sqlite3") });
const repo = createWorkflowRepository({ db });
const runs = createRunRepository({ db });
const settings = { get: (_guildId, key) => (key === "maxWorkflows" ? 50 : 10) };
const engine = createWorkflowEngine({
  repo,
  runs,
  executeAction: async () => {},
  logger: null,
  metrics: { inc() {} },
});
const workflows = createWorkflowService({ repo, runs, engine, settings, logger: null });

before(() => {
  runMigrations(db, path.join(path.dirname(new URL(import.meta.url).pathname), "..", "migrations"));
});

after(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

describe("workflow authoring", () => {
  it("validates triggers and actions", () => {
    assert.deepEqual(validateTrigger("schedule", { cron: "0 9 * * 1" }), { cron: "0 9 * * 1" });
    assert.throws(() => validateTrigger("schedule", { cron: "bad" }));
    assert.throws(() => validateTrigger("unknown", {}));
    assert.equal(validateAction("send_message", { message: "hello" }).message, "hello");
    assert.throws(() => validateAction("add_role", {}));
    assert.throws(() => validateAction("emit_event", { eventType: "nope" }));
  });

  it("creates, configures and dry-runs a workflow", async () => {
    const workflow = workflows.create({ guildId: "1", name: "Greeter", createdBy: "9" });
    assert.equal(workflow.name, "Greeter");

    const trigger = workflows.addTrigger("1", workflow.id, "member_join", {});
    assert.equal(trigger.type, "member_join");

    const action = workflows.addAction("1", workflow.id, "send_message", { message: "Welcome {user}" });
    assert.equal(action.position, 1);

    const loaded = workflows.get("1", workflow.id);
    assert.equal(loaded.triggers.length, 1);
    assert.equal(loaded.actions.length, 1);
    assert.equal(loaded.enabled, true);

    const test = await workflows.test("1", workflow.id, { guildId: "1", userId: "2" });
    assert.equal(test.ok, true);
    assert.equal(test.actions[0].wouldRun, true);

    assert.equal(workflows.setEnabled("1", workflow.id, false).enabled, 0);
    assert.equal(workflows.remove("1", workflow.id), true);
    assert.equal(workflows.list("1").length, 0);
  });
});
