import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createCommandDefinition,
  createCommandRegistry,
  defineCommand,
} from "@astron-collection/discord-framework";
import { createHelpService } from "../services/help-service.js";
import { createInfoService } from "../services/info-service.js";

const config = {
  version: "2.0.0",
  environment: "test",
  docsUrl: "https://example.test/docs",
  supportUrl: "https://example.test/issues",
};

describe("astron info service", () => {
  const info = createInfoService({ bot: "astron", config });

  it("shapes guild information without Discord objects", () => {
    const guild = {
      id: "110000000000000000",
      name: "Test Guild",
      ownerId: "220000000000000000",
      memberCount: 42,
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
      channels: { cache: new Map([[1, { type: 0 }], [2, { type: 2 }]]) },
      roles: { cache: new Map([[1, {}], [2, {}]]) },
      emojis: { cache: new Map() },
      premiumSubscriptionCount: 3,
      premiumTier: 1,
      verificationLevel: 2,
    };

    const shaped = info.guildInfo(guild);

    assert.equal(shaped.name, "Test Guild");
    assert.equal(shaped.members, 42);
    assert.equal(shaped.textual, 1);
    assert.equal(shaped.voice, 1);
    assert.equal(shaped.boostCount ?? shaped.boosts, 3);
  });

  it("shapes a user and keeps the avatar null-safe", () => {
    const user = {
      id: "220000000000000000",
      tag: "Ada#0001",
      bot: false,
      createdAt: new Date("2021-01-01T00:00:00.000Z"),
      displayAvatarURL: () => "https://cdn.test/avatar.png",
    };

    const shaped = info.userInfo(user, null);
    assert.equal(shaped.tag, "Ada#0001");
    assert.equal(shaped.roles.length, 0);
    assert.equal(shaped.avatar, "https://cdn.test/avatar.png");
  });
});

describe("astron help catalogue", () => {
  const registry = createCommandRegistry({ bot: "astron" });

  registry.register(
    defineCommand({
      data: {
        toJSON: () => ({
          name: "ping",
          description: "Check latency.",
          description_localizations: { fr: "Vérifier la latence." },
          type: 1,
        }),
      },
      execute: async () => {},
      category: "utility",
      bot: "astron",
    }),
  );

  it("groups commands by category and localizes descriptions", () => {
    const help = createHelpService({ registry, locale: "fr" });
    const categories = help.categories();

    assert.equal(categories.length, 1);
    assert.equal(categories[0].commands[0].description, "Vérifier la latence.");
    assert.equal(help.count(), 1);
  });

  it("returns a detail view and null for an unknown command", () => {
    const help = createHelpService({ registry });

    assert.equal(help.find("ping").cooldown.seconds, 0);
    assert.equal(help.find("nope"), null);
    assert.ok(help.ecosystem().some((bot) => bot.name === "Protect"));
  });
});

void createCommandDefinition;
