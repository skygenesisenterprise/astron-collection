import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";

import { createGuildMemberPresence } from "../src/index.js";

describe("guild/member presence", () => {
  it("sets a shared count status and refreshes it on guild/member events", async () => {
    const client = new EventEmitter();
    const presences = [];
    const warnings = [];
    client.user = {
      setPresence: async (presence) => presences.push(presence),
    };
    client.guilds = {
      cache: new Map([["guild-1", { memberCount: 3 }]]),
    };

    const manager = createGuildMemberPresence({
      client,
      logger: { warn: (...args) => warnings.push(args) },
      debounceMs: 1,
    });

    await manager.start();
    assert.equal(presences[0].activities[0].name, "1 Guild - 3 Member");

    client.guilds.cache.get("guild-1").memberCount = 4;
    client.emit("guildMemberAdd");
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(presences[1].activities[0].name, "1 Guild - 4 Member");
    assert.deepEqual(warnings, []);

    manager.stop();
    assert.equal(client.listenerCount("guildMemberAdd"), 0);
  });
});
