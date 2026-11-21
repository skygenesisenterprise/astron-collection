/** Player — voice playback constants. */

export const BOT = "player";

export const INTENTS = [
  "Guilds",
  "GuildMembers",
  "GuildVoiceStates",
  "GuildMessages",
  "MessageContent",
];
export const PARTIALS = ["Channel"];

export const SETTINGS_DEFAULTS = Object.freeze({
  defaultVolume: 80,
  maxQueue: 100,
  djRoleId: null,
  locale: "fr",
});

export const SETTINGS_VALIDATORS = Object.freeze({
  defaultVolume: (value) =>
    (Number.isInteger(value) && value >= 0 && value <= 150) || { ok: false, error: "expected 0-150" },
  maxQueue: (value) =>
    (Number.isInteger(value) && value >= 1 && value <= 500) || { ok: false, error: "expected 1-500" },
  locale: (value) => ["fr", "en"].includes(value) || { ok: false, error: "expected fr or en" },
});

export const LOOP_MODES = Object.freeze(["off", "track", "queue"]);
export const DEFAULT_VOLUME = 80;
