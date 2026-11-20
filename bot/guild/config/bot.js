/** Guild — community bot constants. */

export const BOT = "guild";

/** Message content is required for XP awards (anti-spam heuristics stay in Protect). */
export const INTENTS = ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"];
export const PARTIALS = ["Channel", "Message", "GuildMember", "User"];

export const DEFAULT_WELCOME = "Bienvenue {user} sur **{server}** ! Nous sommes {count} membres.";
export const DEFAULT_FAREWELL = "**{tag}** a quitté le serveur. Nous sommes {count} membres.";

export const SETTINGS_DEFAULTS = Object.freeze({
  welcome: { enabled: false, channelId: null, message: DEFAULT_WELCOME },
  farewell: { enabled: false, channelId: null, message: DEFAULT_FAREWELL },
  autorole: { enabled: false, roleIds: [] },
  levels: {
    enabled: false,
    xpPerMessage: 5,
    cooldownSeconds: 60,
    announceChannelId: null,
    rewards: [],
  },
  suggestions: { enabled: false, channelId: null },
  birthdayChannelId: null,
  locale: "fr",
});

export const SETTINGS_VALIDATORS = Object.freeze({
  locale: (value) => ["fr", "en"].includes(value) || { ok: false, error: "expected fr or en" },
  birthdayChannelId: (value) =>
    value === null || /^\d{17,20}$/.test(value) || { ok: false, error: "expected a channel id" },
});

export const LEVEL_XP_BASE = 100;
export const LEVEL_XP_STEP = 25;

export const BOARD_COLORS = Object.freeze({ poll: 0x5865f2, suggestion: 0xe67e22 });
