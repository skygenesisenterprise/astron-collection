/** Protect — moderation and security bot constants. */

export const BOT = "protect";

/**
 * Message content is required to detect spam and phishing, and
 * AutoModerationExecution to record Discord's own automod actions.
 */
export const INTENTS = [
  "Guilds",
  "GuildMembers",
  "GuildMessages",
  "MessageContent",
  "GuildModeration",
  "AutoModerationExecution",
];

export const PARTIALS = ["Channel", "Message", "GuildMember", "User"];

export const SETTINGS_DEFAULTS = Object.freeze({
  logChannelId: null,
  quarantineRoleId: null,
  mutedRoleId: null,
  dmOnPunishment: true,
  antispam: { enabled: true, maxMessages: 6, windowSeconds: 8, timeoutSeconds: 600 },
  antiraid: { enabled: true, joinsPerMinute: 10, minAccountAgeDays: 7, action: "quarantine" },
  antiphish: { enabled: true, action: "delete" },
  mentionSpam: { enabled: true, maxMentions: 6 },
});

export const SETTINGS_VALIDATORS = Object.freeze({
  logChannelId: (value) => value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a channel id" },
  quarantineRoleId: (value) =>
    value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a role id" },
  mutedRoleId: (value) => value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a role id" },
  dmOnPunishment: (value) => typeof value === "boolean" || { ok: false, error: "expected a boolean" },
});

export const CASE_ACTIONS = Object.freeze([
  "warn",
  "kick",
  "ban",
  "unban",
  "timeout",
  "untimeout",
  "quarantine",
  "release",
  "note",
  "purge",
  "slowmode",
  "lock",
  "unlock",
]);
