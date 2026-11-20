import { xp, saveStore } from "./store.js";

const XP_COOLDOWN_MS = 60_000;
const XP_MIN_GAIN = 15;
const XP_MAX_GAIN = 25;
const LEVEL_BASE_XP = 100;
const LEVEL_STEP_XP = 25;

const xpCooldowns = new Map();

function getMemberKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

export function getXpForNextLevel(level) {
  return LEVEL_BASE_XP + level * LEVEL_STEP_XP;
}

export function getLevelFromXp(totalXp) {
  let level = 0;
  let xpRemaining = totalXp;

  while (xpRemaining >= getXpForNextLevel(level)) {
    xpRemaining -= getXpForNextLevel(level);
    level += 1;
  }

  return {
    level,
    currentLevelXp: xpRemaining,
    nextLevelXp: getXpForNextLevel(level),
  };
}

export function getMemberXp(guildId, userId) {
  const key = getMemberKey(guildId, userId);

  return (
    xp.get(key) ?? {
      guildId,
      userId,
      totalXp: 0,
      messageCount: 0,
      updatedAt: null,
    }
  );
}

export function setMemberXp(guildId, userId, totalXp, messageCount) {
  const normalizedXp = Math.max(0, Math.floor(totalXp));
  const previous = getMemberXp(guildId, userId);
  const entry = {
    guildId,
    userId,
    totalXp: normalizedXp,
    messageCount: Math.max(0, Math.floor(messageCount ?? previous.messageCount ?? 0)),
    updatedAt: new Date().toISOString(),
  };

  xp.set(getMemberKey(guildId, userId), entry);
  saveStore();

  return {
    ...entry,
    ...getLevelFromXp(entry.totalXp),
  };
}

export function addMemberXp(guildId, userId, amount, messageIncrement = 0) {
  const current = getMemberXp(guildId, userId);
  const before = getLevelFromXp(current.totalXp);
  const after = setMemberXp(
    guildId,
    userId,
    current.totalXp + amount,
    current.messageCount + messageIncrement,
  );

  return {
    ...after,
    leveledUp: after.level > before.level,
    previousLevel: before.level,
  };
}

export function removeMemberXp(guildId, userId, amount) {
  return addMemberXp(guildId, userId, -Math.abs(amount));
}

export function resetMemberXp(guildId, userId) {
  xp.delete(getMemberKey(guildId, userId));
  saveStore();
}

export function getGuildLeaderboard(guildId, limit = 10) {
  return [...xp.values()]
    .filter((entry) => entry.guildId === guildId)
    .sort((left, right) => {
      if (right.totalXp !== left.totalXp) {
        return right.totalXp - left.totalXp;
      }

      return right.messageCount - left.messageCount;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
      ...getLevelFromXp(entry.totalXp),
    }));
}

export function getGuildRank(guildId, userId) {
  const leaderboard = getGuildLeaderboard(guildId, Number.MAX_SAFE_INTEGER);
  return leaderboard.find((entry) => entry.userId === userId)?.rank ?? null;
}

export function awardMessageXp(guildId, userId) {
  const key = getMemberKey(guildId, userId);
  const now = Date.now();
  const lastAwardAt = xpCooldowns.get(key) ?? 0;

  if (now - lastAwardAt < XP_COOLDOWN_MS) {
    return null;
  }

  xpCooldowns.set(key, now);

  const awardedXp = XP_MIN_GAIN + Math.floor(Math.random() * (XP_MAX_GAIN - XP_MIN_GAIN + 1));
  return {
    awardedXp,
    ...addMemberXp(guildId, userId, awardedXp, 1),
  };
}
