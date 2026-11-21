import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GatewayIntentBits, Partials } from "discord.js";

import { createDiscordClient } from "@astron-collection/discord-framework";
import { PARTIALS } from "../config/bot.js";

describe("logger Discord client configuration", () => {
  it("uses partials supported by discord.js", async () => {
    class FakeClient {
      constructor(options) {
        this.options = options;
      }
    }

    const client = await createDiscordClient({
      partials: PARTIALS,
      loadDiscord: async () => ({ Client: FakeClient, GatewayIntentBits, Partials }),
    });

    assert.deepEqual(client.options.partials, PARTIALS.map((partial) => Partials[partial]));
  });
});
