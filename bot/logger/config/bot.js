/** Logger — audit bot constants. */

export const BOT = "logger";

/** Message content is needed to record deleted/edited message text. */
export const INTENTS = [
  "Guilds",
  "GuildMembers",
  "GuildMessages",
  "MessageContent",
  "GuildModeration",
];

export const PARTIALS = ["Channel", "Message", "GuildMember", "User"];

export const CATEGORIES = Object.freeze([
  "messages",
  "members",
  "channels",
  "roles",
  "moderation",
  "security",
  "automation",
  "community",
]);

export const SETTINGS_DEFAULTS = Object.freeze({
  logChannelId: null,
  retentionDays: 90,
  ignoreBots: true,
  ignoreChannels: [],
  ignoreUsers: [],
  categories: Object.freeze({
    messages: true,
    members: true,
    channels: true,
    roles: true,
    moderation: true,
    security: true,
    automation: true,
    community: true,
  }),
});

export const SETTINGS_VALIDATORS = Object.freeze({
  logChannelId: (value) => value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a channel id" },
  retentionDays: (value) =>
    Number.isInteger(value) && value >= 1 && value <= 3650
      ? true
      : { ok: false, error: "expected 1-3650 days" },
  ignoreBots: (value) => typeof value === "boolean" || { ok: false, error: "expected a boolean" },
  ignoreChannels: (value) => Array.isArray(value) || { ok: false, error: "expected a channel id list" },
  ignoreUsers: (value) => Array.isArray(value) || { ok: false, error: "expected a user id list" },
});

export const LOG_COLORS = Object.freeze({
  messages: 0x3498db,
  members: 0x2ecc71,
  channels: 0x9b59b6,
  roles: 0xf1c40f,
  moderation: 0xe74c3c,
  security: 0xc0392b,
  automation: 0x1abc9c,
  community: 0xe67e22,
});
