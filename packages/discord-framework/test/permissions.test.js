import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ERROR_CODES } from "../src/errors.js";
import { checkAvailability, checkCommandPermissions } from "../src/permissions.js";
import { bitfield, chatInput, testCommand } from "./helpers.js";

describe("discord user permissions", () => {
  it("allows a command without declared permissions", async () => {
    const result = await checkCommandPermissions({
      command: testCommand(),
      interaction: chatInput(),
    });
    assert.equal(result.ok, true);
  });

  it("denies when the user lacks a declared permission", async () => {
    const command = testCommand({ permissions: { user: ["BanMembers"] } });
    const result = await checkCommandPermissions({ command, interaction: chatInput() });

    assert.equal(result.ok, false);
    assert.equal(result.code, ERROR_CODES.MISSING_PERMISSION);
  });

  it("denies when the permission holder is missing", async () => {
    const command = testCommand({ permissions: { user: ["BanMembers"] } });
    const interaction = chatInput();
    delete interaction.memberPermissions;

    const result = await checkCommandPermissions({ command, interaction });
    assert.equal(result.ok, false);
  });

  it("accepts a numeric bitmask from the command definition", async () => {
    const command = testCommand({ permissions: { user: [8n] } });
    const allowed = chatInput();
    allowed.memberPermissions = bitfield([], 8n);

    assert.equal((await checkCommandPermissions({ command, interaction: allowed })).ok, true);

    const denied = chatInput();
    denied.memberPermissions = bitfield([], 4n);
    assert.equal((await checkCommandPermissions({ command, interaction: denied })).ok, false);
  });
});

describe("discord bot permissions", () => {
  it("denies when the bot lacks a declared permission", async () => {
    const command = testCommand({ permissions: { bot: ["ManageRoles"] } });
    const result = await checkCommandPermissions({ command, interaction: chatInput() });

    assert.equal(result.ok, false);
    assert.equal(result.code, ERROR_CODES.MISSING_BOT_PERMISSION);
  });

  it("allows when the bot holds the permission", async () => {
    const command = testCommand({ permissions: { bot: ["ManageRoles"] } });
    const interaction = chatInput({ botPermissions: ["ManageRoles"] });

    assert.equal((await checkCommandPermissions({ command, interaction })).ok, true);
  });

  it("denies when the bot permissions cannot be read", async () => {
    const command = testCommand({ permissions: { bot: ["ManageRoles"] } });
    const interaction = chatInput();
    delete interaction.guild.members.me;

    assert.equal((await checkCommandPermissions({ command, interaction })).ok, false);
  });
});

describe("astron business policy", () => {
  it("allows an explicit approval and denies a refusal", async () => {
    const command = testCommand();

    assert.equal(
      (await checkCommandPermissions({
        command,
        interaction: chatInput(),
        policy: () => true,
      })).ok,
      true,
    );

    assert.equal(
      (await checkCommandPermissions({
        command,
        interaction: chatInput(),
        policy: () => ({ ok: false, reason: "offre insuffisante" }),
      })).ok,
      false,
    );
  });

  it("denies when the policy cannot answer", async () => {
    const result = await checkCommandPermissions({
      command: testCommand(),
      interaction: chatInput(),
      policy: async () => {
        throw new Error("store unavailable");
      },
    });

    assert.equal(result.ok, false);
    assert.equal(result.code, ERROR_CODES.BUSINESS_POLICY_DENIED);
  });

  it("prefers the command policy over the bot policy", async () => {
    let called = 0;
    const command = testCommand({
      permissions: {
        policy: () => {
          called += 1;
          return false;
        },
      },
    });

    const result = await checkCommandPermissions({
      command,
      interaction: chatInput(),
      policy: () => true,
    });

    assert.equal(called, 1);
    assert.equal(result.ok, false);
  });
});

describe("availability", () => {
  it("refuses a guild-only command in a DM", () => {
    const result = checkAvailability({
      command: testCommand(),
      interaction: chatInput({ guildId: null }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, ERROR_CODES.GUILD_ONLY);
  });

  it("refuses a DM-only command in a guild", () => {
    const command = testCommand({ availability: { dmOnly: true, guildOnly: false } });
    const result = checkAvailability({ command, interaction: chatInput() });

    assert.equal(result.ok, false);
    assert.equal(result.code, ERROR_CODES.DIRECT_MESSAGE_ONLY);
  });

  it("allows a guild command in a guild", () => {
    assert.equal(checkAvailability({ command: testCommand(), interaction: chatInput() }).ok, true);
  });
});
