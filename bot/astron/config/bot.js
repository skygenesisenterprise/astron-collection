/** Astron — generalist bot constants. */

export const BOT = "astron";

/**
 * Least privilege: Astron reads no message content, runs no moderation and
 * holds no voice state. Guild members are needed for information commands.
 */
export const INTENTS = ["Guilds", "GuildMembers"];
export const PARTIALS = ["GuildMember", "User"];

export const CATEGORY_LABELS = Object.freeze({
  utility: "Utilitaires",
  information: "Informations",
  configuration: "Configuration",
  support: "Aide & support",
  context: "Menus contextuels",
});

export const SETTINGS_DEFAULTS = Object.freeze({
  locale: "fr",
  timezone: "UTC",
  staffRoleId: null,
  announcementsChannelId: null,
  ephemeralReplies: false,
});

export const SETTINGS_VALIDATORS = Object.freeze({
  locale: (value) => ["fr", "en"].includes(value) || { ok: false, error: "expected fr or en" },
  timezone: (value) =>
    typeof value === "string" && value.length <= 64 ? true : { ok: false, error: "expected a timezone name" },
  staffRoleId: (value) => value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a role id" },
  announcementsChannelId: (value) =>
    value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a channel id" },
  ephemeralReplies: (value) => typeof value === "boolean" || { ok: false, error: "expected a boolean" },
});

export const LINKS = Object.freeze({
  repository: "https://github.com/skygenesisenterprise/astron-collection",
  issues: "https://github.com/skygenesisenterprise/astron-collection/issues",
  docs: "https://github.com/skygenesisenterprise/astron-collection/tree/master/bot",
});
