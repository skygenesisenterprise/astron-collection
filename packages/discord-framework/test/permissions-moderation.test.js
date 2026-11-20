import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ERROR_CODES } from "../src/errors.js";
import {
  auditBotPermissions,
  checkModerationHierarchy,
  isGuildOwner,
  securityFindings,
} from "../src/permissions.js";
import { bitfield, GUILD_ID } from "./helpers.js";

const member = (id, position) => ({ id, roles: { highest: { position } } });

describe("moderation hierarchy", () => {
  const guild = { ownerId: "owner-1" };

  it("allows a moderator above the target", () => {
    const result = checkModerationHierarchy({
      guild,
      moderator: member("mod-1", 5),
      target: member("target-1", 2),
      bot: member("bot-1", 10),
    });
    assert.equal(result.ok, true);

    assert.equal(isGuildOwner({ userId: "owner-1", ownerId: "owner-1" }), true);
    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("owner-1", 0),
        target: member("target-1", 99),
        bot: member("bot-1", 100),
      }).ok,
      true,
    );
  });

  it("denies equal or higher targets", () => {
    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("mod-1", 5),
        target: member("target-1", 5),
        bot: member("bot-1", 10),
      }).code,
      ERROR_CODES.MODERATION_HIERARCHY,
    );
  });

  it("denies the guild owner, self and the bot itself", () => {
    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("mod-1", 50),
        target: member("owner-1", 0),
        bot: member("bot-1", 100),
      }).code,
      ERROR_CODES.MODERATION_OWNER,
    );

    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("mod-1", 50),
        target: member("mod-1", 50),
        bot: member("bot-1", 100),
      }).code,
      ERROR_CODES.MODERATION_SELF,
    );

    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("mod-1", 50),
        target: member("bot-1", 100),
        bot: member("bot-1", 100),
      }).code,
      ERROR_CODES.MODERATION_SELF,
    );
  });

  it("denies when the bot's own role is too low", () => {
    assert.equal(
      checkModerationHierarchy({
        guild,
        moderator: member("mod-1", 90),
        target: member("target-1", 50),
        bot: member("bot-1", 10),
      }).code,
      ERROR_CODES.MODERATION_BOT_HIERARCHY,
    );
  });

  it("fails closed when the target cannot be resolved", () => {
    assert.equal(
      checkModerationHierarchy({ guild, moderator: member("mod-1", 5), bot: member("bot-1", 10) }).ok,
      false,
    );
  });
});

describe("bot permission audit", () => {
  it("lists the permissions missing per feature", () => {
    const result = auditBotPermissions({
      me: { permissions: bitfield(["ViewChannel", "SendMessages", "EmbedLinks"]) },
      features: ["general", "moderation", "player"],
    });

    assert.equal(result.ok, false);
    assert.equal(result.missing.general, undefined);
    assert.ok(result.missing.moderation.includes("BanMembers"));
    assert.ok(result.missing.player.includes("Connect"));
  });

  it("passes when every required permission is held", () => {
    const result = auditBotPermissions({
      me: { permissions: bitfield(["ViewChannel", "SendMessages", "EmbedLinks"]) },
      features: ["general"],
    });
    assert.equal(result.ok, true);
  });
});

describe("security findings", () => {
  it("flags an administrator bot and weak guild settings", () => {
    const findings = securityFindings({
      guild: { id: GUILD_ID, mfaLevel: 0, verificationLevel: 0 },
      me: { permissions: bitfield(["Administrator"]) },
    });

    const codes = findings.map((finding) => finding.code);
    assert.ok(codes.includes("BOT_ADMINISTRATOR"));
    assert.ok(codes.includes("GUILD_MFA_DISABLED"));
    assert.ok(codes.includes("GUILD_VERIFICATION_NONE"));
  });
});
