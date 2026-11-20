import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const storePath = path.join(dataDir, "store.json");

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          warnings: {},
          incidents: {},
          tickets: {},
          auditLog: [],
          xp: {},
          memberEvents: {},
          welcomeSettings: {},
          goodbyeSettings: {},
          panelSettings: {},
          notificationChannels: {},
          polls: {},
        },
        null,
        2
      ),
      "utf8"
    );
  }
}

function loadStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Impossible de charger le store du bot, reinitialisation:", error);
    return {
      warnings: {},
      incidents: {},
      tickets: {},
      auditLog: [],
      xp: {},
      memberEvents: {},
      welcomeSettings: {},
      goodbyeSettings: {},
      panelSettings: {},
      notificationChannels: {},
      polls: {},
    };
  }
}

function persistStore() {
  ensureStoreFile();

  const payload = {
    warnings: Object.fromEntries(warnings),
    incidents: Object.fromEntries(incidents),
    tickets: Object.fromEntries(tickets),
    auditLog,
    xp: Object.fromEntries(xp),
    memberEvents: Object.fromEntries(memberEvents),
    welcomeSettings: Object.fromEntries(welcomeSettings),
    goodbyeSettings: Object.fromEntries(goodbyeSettings),
    farewellSettings: Object.fromEntries(farewellSettings),
    panelSettings: Object.fromEntries(panelSettings),
    notificationChannels: Object.fromEntries(notificationChannels),
    polls: Object.fromEntries(polls),
    reminders,
    guildSettings: Object.fromEntries(guildSettings),
    autoModSettings: Object.fromEntries(autoModSettings),
    guildXPSettings: Object.fromEntries(guildXPSettings),
  };

  const tmpPath = `${storePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(tmpPath, storePath);
}

const initialStore = loadStore();

function reviveDateEntries(entries) {
  return entries.map((entry) => ({
    ...entry,
    at: entry.at ? new Date(entry.at) : new Date(),
  }));
}

// Revive XP entries with proper dates
function reviveXPEntries(entries) {
  return Object.entries(entries).map(([key, value]) => [
    key,
    {
      ...value,
      lastMessageTimestamp: value.lastMessageTimestamp ? new Date(value.lastMessageTimestamp) : 0,
    },
  ]);
}

// Revive reminders with proper dates
function reviveReminders(entries) {
  return entries.map((entry) => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
    expiresAt: new Date(entry.expiresAt),
  }));
}

export const warnings = new Map(
  Object.entries(initialStore.warnings ?? {}).map(([key, value]) => [key, reviveDateEntries(value)])
);
export const incidents = new Map(Object.entries(initialStore.incidents ?? {}));
export const tickets = new Map(Object.entries(initialStore.tickets ?? {}));
export const auditLog = reviveDateEntries(initialStore.auditLog ?? []);
export const xp = new Map(reviveXPEntries(initialStore.xp ?? {}));
export const memberEvents = new Map(Object.entries(initialStore.memberEvents ?? {}));
export const welcomeSettings = new Map(Object.entries(initialStore.welcomeSettings ?? {}));
export const goodbyeSettings = new Map(Object.entries(initialStore.goodbyeSettings ?? {}));
export const farewellSettings = new Map(Object.entries(initialStore.farewellSettings ?? {}));
export const panelSettings = new Map(Object.entries(initialStore.panelSettings ?? {}));
export const notificationChannels = new Map(Object.entries(initialStore.notificationChannels ?? {}));
export const polls = new Map(Object.entries(initialStore.polls ?? {}));
export const reminders = reviveReminders(initialStore.reminders ?? []);
export const guildSettings = new Map(Object.entries(initialStore.guildSettings ?? {}));
export const autoModSettings = new Map(Object.entries(initialStore.autoModSettings ?? {}));
export const guildXPSettings = new Map(Object.entries(initialStore.guildXPSettings ?? {}));

export function areMemberEventsEnabled(guildId) {
  return memberEvents.get(guildId) !== false;
}

export function setMemberEventsEnabled(guildId, enabled) {
  memberEvents.set(guildId, enabled);
  persistStore();
}

export function getWelcomeSettings(guildId) {
  return welcomeSettings.get(guildId) ?? {};
}

export function updateWelcomeSettings(guildId, settings) {
  welcomeSettings.set(guildId, {
    ...getWelcomeSettings(guildId),
    ...settings,
  });
  persistStore();
}

export function resetWelcomeSettings(guildId) {
  welcomeSettings.delete(guildId);
  persistStore();
}

export function getGoodbyeSettings(guildId) {
  return goodbyeSettings.get(guildId) ?? {};
}

export function updateGoodbyeSettings(guildId, settings) {
  goodbyeSettings.set(guildId, {
    ...getGoodbyeSettings(guildId),
    ...settings,
  });
  persistStore();
}

export function resetGoodbyeSettings(guildId) {
  goodbyeSettings.delete(guildId);
  persistStore();
}

export function getPanelSettings(guildId) {
  return panelSettings.get(guildId) ?? {};
}

export function updatePanelSettings(guildId, settings) {
  panelSettings.set(guildId, {
    ...getPanelSettings(guildId),
    ...settings,
  });
  persistStore();
}

export function resetPanelSettings(guildId) {
  panelSettings.delete(guildId);
  persistStore();
}

export function saveStore() {
  persistStore();
}

export function addAudit(entry) {
  auditLog.unshift({ id: crypto.randomUUID(), at: new Date(), ...entry });
  if (auditLog.length > 500) auditLog.length = 500;
  persistStore();
}

// ========== Warnings Functions ==========

export function addWarning(warning) {
  const guildId = warning.guildId;
  const userId = warning.userId;

  if (!warnings.has(guildId)) {
    warnings.set(guildId, []);
  }

  const guildWarnings = warnings.get(guildId);
  guildWarnings.push(warning);
  warnings.set(guildId, guildWarnings);
  persistStore();
}

export function getWarnings(guildId, userId) {
  if (!warnings.has(guildId)) {
    return [];
  }

  const guildWarnings = warnings.get(guildId);
  return guildWarnings.filter((w) => w.userId === userId);
}

// ========== Reminders Functions ==========

export function addReminder(reminder) {
  reminders.push(reminder);
  persistStore();
}

export function getReminders(userId) {
  return reminders.filter((r) => r.userId === userId && r.expiresAt > Date.now());
}

export function removeReminder(reminderId) {
  const index = reminders.findIndex((r) => r.id === reminderId);
  if (index !== -1) {
    reminders.splice(index, 1);
    persistStore();
  }
}

// ========== Farewell Settings Functions ==========

export function getFarewellSettings(guildId) {
  return farewellSettings.get(guildId) ?? {};
}

export function updateFarewellSettings(guildId, settings) {
  farewellSettings.set(guildId, {
    ...getFarewellSettings(guildId),
    ...settings,
  });
  persistStore();
}

export function resetFarewellSettings(guildId) {
  farewellSettings.delete(guildId);
  persistStore();
}

// ========== Guild Settings Functions ==========

export function getGuildSettings(guildId) {
  return guildSettings.get(guildId) ?? {};
}

export function updateGuildSettings(guildId, settings) {
  guildSettings.set(guildId, {
    ...getGuildSettings(guildId),
    ...settings,
  });
  persistStore();
}

// ========== AutoMod Settings Functions ==========

export function getAutoModSettings(guildId) {
  return autoModSettings.get(guildId) ?? {};
}

export function updateAutoModSettings(guildId, settings) {
  autoModSettings.set(guildId, {
    ...getAutoModSettings(guildId),
    ...settings,
  });
  persistStore();
}

// ========== XP System Functions ==========

export function getUserXP(guildId, userId) {
  const guildXP = xp.get(guildId);
  if (!guildXP) return null;

  return guildXP[userId] || null;
}

export function addUserXP(guildId, userId, amount) {
  const guildSettings = getGuildXPSettings(guildId);
  if (!guildSettings || !guildSettings.enabled) return;

  if (!xp.has(guildId)) {
    xp.set(guildId, {});
  }

  const guildXP = xp.get(guildId);
  const userData = guildXP[userId] || { xp: 0, level: 1, lastMessageTimestamp: 0 };

  // Vérifier le cooldown
  const now = Date.now();
  if (now - userData.lastMessageTimestamp < guildSettings.cooldown * 1000) {
    return userData; // Pas assez de temps écoulé
  }

  userData.xp += amount;
  userData.lastMessageTimestamp = now;

  // Vérifier si le niveau a changé
  const newLevel = Math.floor(userData.xp / 100) + 1;
  if (newLevel > userData.level) {
    userData.level = newLevel;
    // Vérifier les récompenses
    checkLevelRewards(guildId, userId, newLevel);
  }

  guildXP[userId] = userData;
  xp.set(guildId, guildXP);
  persistStore();

  return userData;
}

export function getGuildXPSettings(guildId) {
  return guildXPSettings.get(guildId) ?? { enabled: false, xpPerMessage: 5, cooldown: 60, rewards: [] };
}

export function updateGuildXPSettings(guildId, settings) {
  guildXPSettings.set(guildId, {
    ...getGuildXPSettings(guildId),
    ...settings,
  });
  persistStore();
}

async function checkLevelRewards(guildId, userId, newLevel) {
  const settings = getGuildXPSettings(guildId);
  if (!settings || !settings.rewards) return;

  const guild = await import("discord.js").then((djs) => djs).catch(() => null);
  // Note: This function would need access to the guild object to assign roles
  // For now, we'll just log it
  console.log(`[LEVELS] User ${userId} reached level ${newLevel} in guild ${guildId}`);

  const rewardsToAssign = settings.rewards.filter((r) => r.level <= newLevel);
  for (const reward of rewardsToAssign) {
    console.log(`[LEVELS] Should assign role ${reward.roleId} to user ${userId}`);
    // In a real implementation, you would fetch the guild and assign the role here
  }
}

export function getLeaderboard(guildId, limit = 10) {
  const guildXP = xp.get(guildId);
  if (!guildXP) return [];

  const leaderboard = Object.entries(guildXP)
    .map(([userId, data]) => ({
      userId,
      xp: data.xp,
      level: data.level,
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);

  return leaderboard;
}

const NOTIFICATION_TYPES = ["server_info", "infra_info", "social_network", "status"];

export function getNotificationTypes() {
  return NOTIFICATION_TYPES;
}

export function getNotificationChannels(guildId) {
  return notificationChannels.get(guildId) ?? {};
}

export function setNotificationChannel(guildId, type, channelId) {
  const channels = getNotificationChannels(guildId);
  channels[type] = channelId;
  notificationChannels.set(guildId, channels);
  persistStore();
}

export function removeNotificationChannel(guildId, type) {
  const channels = getNotificationChannels(guildId);
  delete channels[type];
  notificationChannels.set(guildId, channels);
  persistStore();
}

export function resetNotificationChannels(guildId) {
  notificationChannels.delete(guildId);
  persistStore();
}

export function getPoll(key) {
  return polls.get(key) ?? null;
}

export function setPoll(key, data) {
  polls.set(key, data);
  persistStore();
}

export function removePoll(key) {
  polls.delete(key);
  persistStore();
}
