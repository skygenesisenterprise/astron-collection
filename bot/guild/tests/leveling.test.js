import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createLevelingService, levelFromXp, xpForLevel } from "../services/leveling.js";

function harness({ enabled = true } = {}) {
  const rows = new Map();
  const metrics = { inc() {} };
  let now = 1_000_000;
  const config = {
    enabled,
    xpPerMessage: 5,
    cooldownSeconds: 60,
    announceChannelId: null,
    rewards: [{ level: 1, roleId: "123456789012345678" }],
  };

  const repo = {
    get(guildId, userId) {
      return (
        rows.get(`${guildId}:${userId}`) ?? {
          guild_id: guildId,
          user_id: userId,
          xp: 0,
          messages: 0,
          last_xp_at: 0,
        }
      );
    },
    addXp(guildId, userId, amount, at) {
      const key = `${guildId}:${userId}`;
      const previous = this.get(guildId, userId);
      const next = { ...previous, xp: previous.xp + amount, messages: previous.messages + 1, last_xp_at: at };
      rows.set(key, next);
      return next;
    },
    top() {
      return [...rows.values()].sort((left, right) => right.xp - left.xp);
    },
    rank() {
      return 1;
    },
    reset(guildId, userId) {
      rows.delete(`${guildId}:${userId}`);
    },
  };

  const settings = {
    get: () => config,
    set: (_guildId, _key, patch) => Object.assign(config, patch),
  };

  const leveling = createLevelingService({ repo, settings, metrics, clock: () => now });
  return {
    leveling,
    advance(seconds) {
      now += seconds * 1000;
    },
  };
}

describe("leveling", () => {
  it("uses a documented increasing curve", () => {
    assert.equal(xpForLevel(0), 100);
    assert.equal(xpForLevel(1), 125);
    assert.deepEqual(levelFromXp(0), { level: 0, currentLevelXp: 0, nextLevelXp: 100, totalXp: 0 });
    assert.equal(levelFromXp(100).level, 1);
    assert.equal(levelFromXp(225).level, 2);
  });

  it("does nothing when levels are disabled", () => {
    const { leveling } = harness({ enabled: false });
    assert.equal(leveling.award({ guildId: "1", userId: "2" }), null);
  });

  it("enforces the cooldown and reports level ups with rewards", () => {
    const { leveling, advance } = harness();
    const first = leveling.award({ guildId: "1", userId: "2" });
    assert.equal(first.totalXp, 5);
    assert.equal(first.leveledUp, false);
    assert.equal(leveling.award({ guildId: "1", userId: "2" }), null);

    let levelUp = null;
    for (let index = 0; index < 20; index += 1) {
      advance(61);
      const award = leveling.award({ guildId: "1", userId: "2" });
      if (award?.leveledUp) levelUp = award;
    }

    assert.equal(levelUp.level, 1);
    assert.deepEqual(levelUp.rewardRoleIds, ["123456789012345678"]);
  });

  it("resets a member", () => {
    const { leveling } = harness();
    leveling.award({ guildId: "1", userId: "2" });
    leveling.resetMember("1", "2");
    assert.equal(leveling.profile("1", "2").xp, 0);
  });
});
