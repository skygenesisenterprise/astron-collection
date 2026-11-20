/**
 * XP and levels.
 *
 * The curve is deterministic and documented, so a member's displayed progress is
 * reproducible. Cooldowns are stored in the database, not in a Map: a restart
 * does not let a member farm XP twice, and a future second instance shares the
 * same rule.
 */

import { LEVEL_XP_BASE, LEVEL_XP_STEP } from "../config/bot.js";

export function xpForLevel(level) {
  return LEVEL_XP_BASE + Math.max(0, Number(level) || 0) * LEVEL_XP_STEP;
}

export function levelFromXp(totalXp) {
  let level = 0;
  let remaining = Math.max(0, Number(totalXp) || 0);
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, currentLevelXp: remaining, nextLevelXp: xpForLevel(level), totalXp: totalXp || 0 };
}

export function createLevelingService({ repo, settings, metrics, clock = () => Date.now() }) {
  function configFor(guildId) {
    return settings.get(guildId, "levels");
  }

  function award({ guildId, userId }) {
    const config = configFor(guildId);
    if (!config.enabled) return null;

    const now = clock();
    const before = repo.get(guildId, userId);
    const cooldownMs = Math.max(0, Number(config.cooldownSeconds) || 0) * 1000;
    if (before.last_xp_at && now - Number(before.last_xp_at) < cooldownMs) return null;

    const previous = levelFromXp(before.xp);
    const row = repo.addXp(guildId, userId, config.xpPerMessage, now);
    const current = levelFromXp(row.xp);
    const leveledUp = current.level > previous.level;

    const rewardRoleIds = leveledUp
      ? (config.rewards ?? [])
          .filter((reward) => reward.level > previous.level && reward.level <= current.level)
          .map((reward) => reward.roleId)
      : [];

    metrics.inc("xp_awarded_total", { guildId: "aggregate" });
    if (leveledUp) metrics.inc("level_ups_total", { guildId: "aggregate" });

    return {
      gained: config.xpPerMessage,
      totalXp: row.xp,
      level: current.level,
      previousLevel: previous.level,
      currentLevelXp: current.currentLevelXp,
      nextLevelXp: current.nextLevelXp,
      leveledUp,
      rewardRoleIds,
    };
  }

  function profile(guildId, userId) {
    const row = repo.get(guildId, userId);
    return { ...levelFromXp(row.xp), xp: row.xp, messages: row.messages, rank: repo.rank(guildId, userId) };
  }

  function leaderboard(guildId, limit = 10) {
    return repo.top(guildId, limit).map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      xp: row.xp,
      messages: row.messages,
      ...levelFromXp(row.xp),
    }));
  }

  function setConfig(guildId, patch, actorId) {
    const current = configFor(guildId);
    return settings.set(guildId, "levels", { ...current, ...patch }, { actorId });
  }

  function resetMember(guildId, userId) {
    repo.reset(guildId, userId);
  }

  return { configFor, award, profile, leaderboard, setConfig, resetMember, xpForLevel, levelFromXp };
}
