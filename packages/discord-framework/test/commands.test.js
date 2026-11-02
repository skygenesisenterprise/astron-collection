import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  adaptLegacyCommand,
  createCommandDefinition,
  defineCommand,
  validateCommand,
} from "../src/commands/contract.js";
import { loadCommands, loadEvents } from "../src/commands/loader.js";
import { createCommandRegistry } from "../src/commands/registry.js";
import { ERROR_CODES } from "../src/errors.js";
import { BOT, collectLogs, testCommand } from "./helpers.js";

const dirent = (name) => ({ name, isFile: () => true });

describe("command contract", () => {
  it("normalizes a builder definition into the contract", () => {
    const command = testCommand({ name: "ping" });

    assert.equal(command.id, "ping");
    assert.equal(command.name, "ping");
    assert.equal(command.metadata.type, "chatInput");
    assert.equal(command.definition.description, "Description of ping");
    assert.equal(command.availability.guildOnly, true);
    assert.deepEqual(command.permissions.user, []);
  });

  it("derives runtime permissions from default_member_permissions", () => {
    const command = testCommand({ defaultMemberPermissions: "8" });
    assert.deepEqual(command.permissions.user, [8n]);
  });

  it("allows DM commands explicitly", () => {
    const command = testCommand({ name: "info", dmPermission: true });
    assert.equal(command.availability.guildOnly, false);
  });

  it("reports every validation problem at once", () => {
    const result = validateCommand({ definition: { name: "Bad Name" }, execute: undefined });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("Invalid command name")));
    assert.ok(result.errors.some((error) => error.includes("execute")));
  });

  it("rejects a definition that is not a builder", () => {
    assert.throws(() => defineCommand({ data: 42, execute: () => {} }), /definition/i);
  });

  it("adapts a legacy module without touching its catalogue", () => {
    const legacy = {
      data: createCommandDefinition("ban", "Bannir un membre."),
      execute: async () => {},
    };
    const command = adaptLegacyCommand(legacy, { bot: BOT, file: "ban.js" });

    assert.equal(command.name, "ban");
    assert.equal(command.legacy, true);
    assert.equal(command.metadata.bot, BOT);
    assert.equal(command.metadata.source, "ban.js");
  });
});

describe("command registry", () => {
  it("rejects duplicate commands", () => {
    const registry = createCommandRegistry({ bot: BOT });
    registry.register(testCommand({ name: "ping" }));

    assert.throws(
      () => registry.register(testCommand({ name: "ping" })),
      (error) => error.code === ERROR_CODES.COMMAND_DUPLICATE,
    );
  });

  it("rejects a command owned by another bot", () => {
    const registry = createCommandRegistry({ bot: "alpha" });
    const foreign = defineCommand({
      data: createCommandDefinition("steal", "Should never load."),
      execute: async () => {},
      bot: "beta",
    });

    assert.throws(
      () => registry.register(foreign),
      (error) => error.code === ERROR_CODES.COMMAND_FOREIGN_BOT,
    );
    assert.equal(registry.size, 0);
  });

  it("keeps two bot catalogues isolated", () => {
    const alpha = createCommandRegistry({ bot: "alpha" });
    const beta = createCommandRegistry({ bot: "beta" });

    alpha.register(
      defineCommand({
        data: createCommandDefinition("alpha-only", "Alpha command."),
        execute: async () => {},
        bot: "alpha",
      }),
    );

    assert.equal(alpha.has("alpha-only"), true);
    assert.equal(beta.has("alpha-only"), false);
    assert.equal(beta.get("alpha-only"), null);
    assert.equal(beta.size, 0);
  });

  it("keeps context menu commands addressable per type", () => {
    const registry = createCommandRegistry({ bot: BOT });
    registry.register(testCommand({ name: "whois", type: 2 }));

    assert.equal(registry.get("whois", 2)?.name, "whois");
    assert.equal(registry.get("whois", 1), null);
  });

  it("returns definitions sorted by type then name", () => {
    const registry = createCommandRegistry({ bot: BOT });
    registry.register(testCommand({ name: "zeta" }));
    registry.register(testCommand({ name: "alpha" }));
    registry.register(testCommand({ name: "menu", type: 2 }));

    assert.deepEqual(
      registry.definitions().map((definition) => definition.name),
      ["alpha", "zeta", "menu"],
    );
  });
});

describe("command loader", () => {
  it("loads every valid module and skips broken ones without throwing", async () => {
    const registry = createCommandRegistry({ bot: BOT });
    const { logger, records } = collectLogs();

    const modules = {
      "/commands/good.js": {
        data: createCommandDefinition("good", "Loads fine."),
        execute: async () => {},
      },
      "/commands/broken.js": { execute: async () => {} },
      "/commands/boom.js": null,
    };

    const result = await loadCommands({
      dir: "/commands",
      registry,
      logger,
      readdirImpl: async () => [dirent("good.js"), dirent("broken.js"), dirent("boom.js"), dirent("README.md")],
      importModule: async (file) => {
        if (file.endsWith("boom.js")) throw new Error("cannot import");
        return modules[file];
      },
    });

    assert.deepEqual(result.loaded, ["good"]);
    assert.equal(registry.size, 1);
    assert.deepEqual(
      result.skipped.map((entry) => entry.file),
      ["boom.js", "broken.js"],
    );
    assert.ok(records.some((record) => record.level === "warn" && record.msg === "command skipped"));
  });

  it("never registers the same event twice", async () => {
    const client = { handlers: [], on(name, handler) { this.handlers.push({ name, handler }); } };

    const result = await loadEvents({
      dir: "/events",
      client,
      bot: BOT,
      readdirImpl: async () => [dirent("ready.js")],
      importModule: async () => ({
        name: "guildMemberAdd",
        execute: async () => {},
      }),
    });

    assert.deepEqual(result.registered, ["guildMemberAdd"]);
    assert.equal(client.handlers.length, 1);
    assert.equal(client.handlers[0].name, "guildMemberAdd");
  });

  it("leaves interactionCreate to the framework router", async () => {
    const client = { handlers: [], on() {}, off() {} };
    const result = await loadEvents({
      dir: "/events",
      client,
      bot: BOT,
      readdirImpl: async () => [dirent("interactionCreate.js")],
      importModule: async () => ({ name: "interactionCreate", execute: async () => {} }),
    });

    assert.deepEqual(result.registered, []);
    assert.equal(result.skipped[0].reason, "event owned by the framework");
  });

  it("contains a throwing event handler", async () => {
    const listeners = [];
    const client = {
      on(name, handler) {
        listeners.push({ name, handler });
      },
      off() {},
    };
    const { logger, records } = collectLogs();

    await loadEvents({
      dir: "/events",
      client,
      logger,
      bot: BOT,
      readdirImpl: async () => [dirent("member.js")],
      importModule: async () => ({
        name: "guildMemberAdd",
        execute: async () => {
          throw new Error("secondary handler failed");
        },
      }),
    });

    await listeners[0].handler({});
    assert.ok(records.some((record) => record.level === "error" && record.msg === "event handler failed"));
  });
});
