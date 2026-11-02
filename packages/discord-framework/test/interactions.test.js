import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createCommandRegistry } from "../src/commands/registry.js";
import { AstronError, ERROR_CODES } from "../src/errors.js";
import { createComponentRegistry } from "../src/interactions/components.js";
import {
  CUSTOM_ID_VERSION,
  encodeCustomId,
  isCustomIdFor,
  parseCustomId,
} from "../src/interactions/custom-id.js";
import { EPHEMERAL, createInteractionRouter } from "../src/interactions/router.js";
import { BOT, GUILD_ID, chatInput, collectLogs, componentInteraction, testCommand } from "./helpers.js";

function buildRouter({ commands = [], components, policy, logger, cooldowns } = {}) {
  const registry = createCommandRegistry({ bot: BOT });
  registry.registerAll(commands);
  const componentRegistry = components ?? createComponentRegistry({ bot: BOT });

  return createInteractionRouter({
    bot: BOT,
    commands: registry,
    components: componentRegistry,
    logger,
    policy,
    cooldowns,
  });
}

describe("custom ids", () => {
  it("builds and parses a versioned id", () => {
    const id = encodeCustomId({ namespace: "poll", action: "vote", value: "42" });
    assert.equal(id, `${"astron"}:${CUSTOM_ID_VERSION}:poll:vote:42`);
    assert.deepEqual(parseCustomId(id), {
      version: CUSTOM_ID_VERSION,
      namespace: "poll",
      action: "vote",
      value: "42",
    });
    assert.equal(isCustomIdFor(id, { namespace: "poll" }), true);
    assert.equal(isCustomIdFor(id, { namespace: "ticket" }), false);
  });

  it("refuses malformed, unknown and oversized ids", () => {
    for (const id of ["", "poll:vote", "other:v1:poll:vote", "astron:v1:Poll:vote", "astron:v1:poll", "astron:v1:poll:vote:a:b:c"]) {
      assert.equal(parseCustomId(id), null, `expected '${id}' to be refused`);
    }
  });

  it("refuses secrets and unsafe values", () => {
    assert.throws(() => encodeCustomId({ namespace: "poll", action: "vote", value: "abc=def" }));
    assert.throws(() => encodeCustomId({ namespace: "astron", action: "vote" }));
    assert.throws(() =>
      encodeCustomId({ namespace: "poll", action: "vote", value: "x".repeat(120) }),
    );
  });
});

describe("interaction router", () => {
  it("executes a slash command", async () => {
    let executed = 0;
    const router = buildRouter({
      commands: [testCommand({ name: "ping", execute: async () => { executed += 1; } })],
    });

    const result = await router.handle(chatInput({ commandName: "ping" }));

    assert.equal(executed, 1);
    assert.equal(result.status, "executed");
  });

  it("answers an unknown command without throwing", async () => {
    const { logger, records } = collectLogs();
    const router = buildRouter({ logger });
    const interaction = chatInput({ commandName: "does-not-exist" });

    const result = await router.handle(interaction);

    assert.equal(result.status, "unknown");
    assert.equal(interaction.replies.length, 1);
    assert.equal(interaction.replies[0].content, "Commande inconnue.");
    assert.equal(interaction.replies[0].flags, EPHEMERAL);
    assert.ok(records.some((record) => record.msg === "unknown command"));
  });

  it("routes user and message context menus", async () => {
    const seen = [];
    const router = buildRouter({
      commands: [
        testCommand({ name: "whois", type: 2, execute: async (interaction) => seen.push(interaction.commandName) }),
        testCommand({ name: "report", type: 3, execute: async (interaction) => seen.push(interaction.commandName) }),
      ],
    });

    const userMenu = chatInput();
    userMenu.isChatInputCommand = () => false;
    userMenu.isUserContextMenuCommand = () => true;
    userMenu.commandName = "whois";
    assert.equal((await router.handle(userMenu)).status, "executed");

    const messageMenu = chatInput();
    messageMenu.isChatInputCommand = () => false;
    messageMenu.isMessageContextMenuCommand = () => true;
    messageMenu.commandName = "report";
    assert.equal((await router.handle(messageMenu)).status, "executed");

    assert.deepEqual(seen, ["whois", "report"]);
  });

  it("refuses a guild-only command in a DM", async () => {
    const router = buildRouter({ commands: [testCommand({ name: "ban" })] });
    const interaction = chatInput({ commandName: "ban", guildId: null });

    const result = await router.handle(interaction);

    assert.equal(result.status, "denied");
    assert.equal(result.reason, ERROR_CODES.GUILD_ONLY);
    assert.match(interaction.replies[0].content, /serveur/);
  });

  it("enforces declared Discord permissions at execution time", async () => {
    const router = buildRouter({
      commands: [testCommand({ name: "ban", defaultMemberPermissions: "4" })],
    });

    const denied = chatInput({ commandName: "ban" });
    assert.equal((await router.handle(denied)).reason, ERROR_CODES.MISSING_PERMISSION);

    const allowed = chatInput({ commandName: "ban", userPermissions: [] });
    allowed.memberPermissions = { has: () => true };
    assert.equal((await router.handle(allowed)).status, "executed");
  });

  it("fails closed when the business policy throws", async () => {
    const { logger, records } = collectLogs();
    const router = buildRouter({
      logger,
      commands: [testCommand({ name: "premium" })],
      policy: () => {
        throw new Error("policy backend down");
      },
    });

    const interaction = chatInput({ commandName: "premium" });
    const result = await router.handle(interaction);

    assert.equal(result.status, "denied");
    assert.equal(result.reason, ERROR_CODES.BUSINESS_POLICY_DENIED);
    assert.ok(records.some((record) => record.msg === "command refused: permissions"));
  });

  it("denies when a policy returns anything but an explicit approval", async () => {
    const router = buildRouter({
      commands: [testCommand({ name: "premium" })],
      policy: async () => undefined,
    });

    assert.equal((await router.handle(chatInput({ commandName: "premium" }))).status, "denied");
  });

  it("applies cooldowns per user", async () => {
    let now = 0;
    const { createCooldownStore } = await import("../src/cooldown.js");
    const cooldowns = createCooldownStore({ clock: () => now });
    const router = buildRouter({
      commands: [testCommand({ name: "spam", cooldown: { seconds: 10 } })],
      cooldowns,
    });

    assert.equal((await router.handle(chatInput({ commandName: "spam" }))).status, "executed");

    now = 1_000;
    const limited = chatInput({ commandName: "spam" });
    const result = await router.handle(limited);
    assert.equal(result.status, "cooldown");
    assert.match(limited.replies[0].content, /9s/);

    now = 11_000;
    assert.equal((await router.handle(chatInput({ commandName: "spam" }))).status, "executed");
  });

  it("dispatches autocomplete to the command handler", async () => {
    let calls = 0;
    const router = buildRouter({
      commands: [
        testCommand({
          name: "search",
          autocomplete: async () => {
            calls += 1;
          },
        }),
      ],
    });

    const interaction = chatInput({ commandName: "search" });
    interaction.respond = async (choices) => {
      interaction.choices = choices;
    };
    interaction.isChatInputCommand = () => false;
    interaction.isAutocomplete = () => true;

    assert.equal((await router.handle(interaction)).status, "dispatched");
    assert.equal(calls, 1);
  });

  it("answers an empty autocomplete when the command has no handler", async () => {
    const router = buildRouter({ commands: [testCommand({ name: "search" })] });
    const interaction = chatInput({ commandName: "search" });
    interaction.respond = async (choices) => {
      interaction.choices = choices;
    };
    interaction.isChatInputCommand = () => false;
    interaction.isAutocomplete = () => true;

    assert.equal((await router.handle(interaction)).status, "no-handler");
    assert.deepEqual(interaction.choices, []);
  });

  it("dispatches a button to its namespace handler", async () => {
    let received = null;
    const components = createComponentRegistry({ bot: BOT });
    components.registerButton("poll", async (interaction, context) => {
      received = { customId: interaction.customId, namespace: context.id.namespace };
    });

    const router = buildRouter({ components });
    const customId = encodeCustomId({ namespace: "poll", action: "vote", value: "7" });
    const interaction = componentInteraction("button", customId);

    const result = await router.handle(interaction);

    assert.equal(result.status, "dispatched");
    assert.deepEqual(received, { customId, namespace: "poll" });
  });

  it("dispatches selects and modals", async () => {
    const components = createComponentRegistry({ bot: BOT });
    let selects = 0;
    let modals = 0;
    components.registerSelect("ticket", async () => {
      selects += 1;
    });
    components.registerModal("ticket", async () => {
      modals += 1;
    });

    const router = buildRouter({ components });
    await router.handle(componentInteraction("select", encodeCustomId({ namespace: "ticket", action: "pick" })));
    await router.handle(componentInteraction("modal", encodeCustomId({ namespace: "ticket", action: "submit" })));

    assert.equal(selects, 1);
    assert.equal(modals, 1);
  });

  it("treats malformed and unknown component ids as expired, without crashing", async () => {
    const { logger, records } = collectLogs();
    const router = buildRouter({ logger });

    const malformed = componentInteraction("button", "poll:vote");
    const malformedResult = await router.handle(malformed);

    assert.equal(malformedResult.status, "error");
    assert.equal(malformedResult.reason, ERROR_CODES.INTERACTION_EXPIRED);
    assert.match(malformed.replies[0].content, /plus valide/);

    const unknown = componentInteraction("button", encodeCustomId({ namespace: "gone", action: "click" }));
    const unknownResult = await router.handle(unknown);

    assert.equal(unknownResult.reason, ERROR_CODES.INTERACTION_EXPIRED);
    assert.ok(records.some((record) => record.msg === "no handler for component"));
  });

  it("refuses a custom id from another version", async () => {
    const router = buildRouter();
    const interaction = componentInteraction("button", "astron:v0:poll:vote");

    const result = await router.handle(interaction);

    assert.equal(result.reason, ERROR_CODES.INTERACTION_EXPIRED);
    assert.match(interaction.replies[0].content, /ancienne version/);
  });

  it("contains a throwing handler and shows a generic message", async () => {
    const { logger, records } = collectLogs();
    const router = buildRouter({
      logger,
      commands: [
        testCommand({
          name: "boom",
          execute: async () => {
            throw new Error("unexpected database failure");
          },
        }),
      ],
    });

    const interaction = chatInput({ commandName: "boom" });
    const result = await router.handle(interaction);

    assert.equal(result.status, "error");
    assert.equal(interaction.replies[0].content, "Une erreur est survenue pendant l'exécution de la commande.");
    assert.ok(records.some((record) => record.level === "error" && record.msg === "interaction failed"));
  });

  it("shows the safe message of an expected refusal", async () => {
    const router = buildRouter({
      commands: [
        testCommand({
          name: "limited",
          execute: async () => {
            throw new AstronError("quota exceeded", {
              code: "QUOTA",
              expected: true,
              userMessage: "Votre quota est atteint.",
            });
          },
        }),
      ],
    });

    const interaction = chatInput({ commandName: "limited" });
    await router.handle(interaction);

    assert.equal(interaction.replies[0].content, "Votre quota est atteint.");
  });

  it("replies once to a deferred interaction", async () => {
    const router = buildRouter({
      commands: [
        testCommand({
          name: "slow",
          execute: async (interaction) => {
            interaction.deferred = true;
            throw new Error("late failure");
          },
        }),
      ],
    });

    const interaction = chatInput({ commandName: "slow" });
    await router.handle(interaction);

    assert.equal(interaction.replies.length, 1);
    assert.equal(interaction.replies[0].flags, EPHEMERAL);
  });

  it("ignores an unsupported interaction type", async () => {
    const router = buildRouter();
    const result = await router.handle({ type: 99 });
    assert.equal(result.status, "unsupported");
  });
});
