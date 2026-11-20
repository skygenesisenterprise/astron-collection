/** Automations — workflow engine constants. */

export const BOT = "automations";

export const INTENTS = ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"];
export const PARTIALS = ["Channel", "GuildMember", "User"];

export const SETTINGS_DEFAULTS = Object.freeze({
  locale: "fr",
  maxWorkflows: 50,
  maxActionsPerWorkflow: 10,
});

export const SETTINGS_VALIDATORS = Object.freeze({
  locale: (value) => ["fr", "en"].includes(value) || { ok: false, error: "expected fr or en" },
});

export const TRIGGER_TYPES = Object.freeze(["message", "member_join", "schedule", "event"]);
export const ACTION_TYPES = Object.freeze([
  "send_message",
  "dm",
  "add_role",
  "remove_role",
  "emit_event",
]);

/** Retries apply per action; a failing action does not silently abort the rest. */
export const ACTION_RETRIES = 2;
export const RUN_PAGE_SIZE = 10;
