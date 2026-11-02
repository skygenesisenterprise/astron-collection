import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeManifestHash,
  deployCommands,
} from "../src/deploy/commands.js";
import { ERROR_CODES } from "../src/errors.js";
import { BOT, collectLogs, testCommand } from "./helpers.js";

function buildDeployer({ scope = "global", guildId, state = {}, commands, force, dryRun } = {}) {
  const puts = [];
  const rest = {
    puts,
    async put(route, { body }) {
      puts.push({ route, body });
    },
  };

  const store = { current: state };
  const { logger, records } = collectLogs();

  const config = { clientId: "app-1", commandScope: scope, commandGuildId: guildId };

  return {
    rest,
    puts,
    logger,
    records,
    config,
    run: (overrides = {}) =>
      deployCommands({
        bot: BOT,
        config,
        commands: commands ?? [testCommand({ name: "ping" })],
        rest,
        logger,
        statePath: "/tmp/state.json",
        readState: async () => store.current,
        writeState: async (_path, next) => {
          store.current = next;
        },
        now: () => new Date("2026-01-01T00:00:00.000Z"),
        force,
        dryRun,
        ...overrides,
      }),
    state: () => store.current,
  };
}

describe("command deployment", () => {
  it("deploys a global catalogue once", async () => {
    const deployer = buildDeployer();

    const result = await deployer.run();

    assert.equal(result.status, "deployed");
    assert.equal(result.count, 1);
    assert.equal(deployer.puts.length, 1);
    assert.equal(deployer.puts[0].route, "/applications/app-1/commands");
    assert.equal(deployer.state().applicationId, "app-1");
    assert.equal(deployer.state().hash, result.hash);
  });

  it("is idempotent when the catalogue did not change", async () => {
    const deployer = buildDeployer();

    await deployer.run();
    const second = await deployer.run();

    assert.equal(second.status, "unchanged");
    assert.equal(deployer.puts.length, 1);
  });

  it("redeploys the same catalogue when forced", async () => {
    const deployer = buildDeployer();
    await deployer.run();

    const forced = await deployer.run({ force: true });

    assert.equal(forced.status, "deployed");
    assert.equal(deployer.puts.length, 2);
  });

  it("redeploys when the catalogue changes", async () => {
    const deployer = buildDeployer();
    await deployer.run();

    const changed = await deployer.run({
      commands: [testCommand({ name: "ping" }), testCommand({ name: "pong" })],
    });

    assert.equal(changed.status, "deployed");
    assert.equal(changed.count, 2);
    assert.equal(deployer.puts.length, 2);
  });

  it("refuses to overwrite a catalogue owned by another application", async () => {
    const deployer = buildDeployer({ state: { applicationId: "app-2", hash: "other" } });

    await assert.rejects(
      deployer.run(),
      (error) => error.code === ERROR_CODES.DEPLOY_APPLICATION_MISMATCH,
    );
    assert.equal(deployer.puts.length, 0);
  });

  it("skips deployment when the scope is none", async () => {
    const deployer = buildDeployer({ scope: "none" });

    const result = await deployer.run();

    assert.equal(result.status, "skipped");
    assert.equal(deployer.puts.length, 0);
  });

  it("deploys to a guild and records the guild id", async () => {
    const deployer = buildDeployer({ scope: "guild", guildId: "123456789012345678" });

    const result = await deployer.run();

    assert.equal(result.status, "deployed");
    assert.equal(deployer.puts[0].route, "/applications/app-1/guilds/123456789012345678/commands");
    assert.equal(deployer.state().guildId, "123456789012345678");
  });

  it("refuses guild scope without a guild id", async () => {
    const deployer = buildDeployer({ scope: "guild" });

    await assert.rejects(
      deployer.run(),
      (error) => error.code === ERROR_CODES.DEPLOY_SCOPE_INVALID,
    );
    assert.equal(deployer.puts.length, 0);
  });

  it("refuses an unknown scope", async () => {
    const deployer = buildDeployer({ scope: "everywhere" });

    await assert.rejects(
      deployer.run(),
      (error) => error.code === ERROR_CODES.DEPLOY_SCOPE_INVALID,
    );
  });

  it("plans without writing in dry-run mode", async () => {
    const deployer = buildDeployer({ dryRun: true });

    const result = await deployer.run();

    assert.equal(result.status, "planned");
    assert.equal(deployer.puts.length, 0);
    assert.deepEqual(deployer.state(), {});
  });

  it("refuses an invalid catalogue before calling Discord", async () => {
    const deployer = buildDeployer({
      commands: [{ json: () => ({ name: "Bad Name", type: 1 }), execute: undefined }],
    });

    await assert.rejects(
      deployer.run(),
      (error) => error.code === ERROR_CODES.COMMAND_INVALID,
    );
    assert.equal(deployer.puts.length, 0);
  });

  it("produces a stable hash regardless of catalogue order", () => {
    const left = [testCommand({ name: "a" }), testCommand({ name: "b" })];
    const right = [testCommand({ name: "b" }), testCommand({ name: "a" })];

    const normalize = (commands) =>
      commands
        .map((command) => command.json())
        .sort((one, two) => one.name.localeCompare(two.name));

    assert.equal(computeManifestHash(normalize(left)), computeManifestHash(normalize(right)));
  });
});
