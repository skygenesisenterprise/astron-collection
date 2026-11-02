/**
 * Official Astron Collection presence constants.
 *
 * The voice channel below is a presence marker on the official guild: bots join
 * it silently and never play audio in it. It is defined once here so no bot
 * duplicates the identifier, and it stays overridable through the environment
 * for a staging guild.
 *
 * The official guild id is the central constant `OFFICIAL_GUILD_ID`, overridable
 * with `ASTRON_OFFICIAL_GUILD_ID` for a staging guild. It is validated before any
 * connection attempt, and a channel resolved in another guild is refused: a bot
 * never joins a third-party guild.
 */

/** Official Astron Collection guild. */
export const OFFICIAL_GUILD_ID = "1369779785273839749";

/** Official Astron Collection presence voice channel. */
export const OFFICIAL_PRESENCE_CHANNEL_ID = "1564590674194473000";

const SNOWFLAKE = /^\d{17,20}$/;

export function isSnowflake(value) {
  return typeof value === "string" && SNOWFLAKE.test(value);
}

/**
 * Resolve and validate the voice presence configuration.
 * Never throws: an invalid configuration disables the feature with a reason.
 *
 * @param {object} input
 * @param {boolean} [input.enabled]
 * @param {string} [input.officialGuildId] Override; defaults to the official guild.
 * @param {string} [input.presenceChannelId]
 * @returns {{enabled: boolean, guildId: string|null, channelId: string|null, guildIdSource: "configured"|"official"|"none", reason: string|null}}
 */
export function resolveVoicePresenceConfig({
  enabled = true,
  officialGuildId = "",
  presenceChannelId = OFFICIAL_PRESENCE_CHANNEL_ID,
} = {}) {
  if (enabled !== true) {
    return {
      enabled: false,
      guildId: null,
      channelId: null,
      guildIdSource: "none",
      reason: "disabled",
    };
  }

  const channelId = String(presenceChannelId ?? "").trim();
  const configuredGuildId = String(officialGuildId ?? "").trim();

  if (!isSnowflake(channelId)) {
    return {
      enabled: false,
      guildId: null,
      channelId: null,
      guildIdSource: "none",
      reason: "invalid-channel-id",
    };
  }

  const guildId = configuredGuildId || OFFICIAL_GUILD_ID;

  if (!isSnowflake(guildId)) {
    return {
      enabled: false,
      guildId: null,
      channelId,
      guildIdSource: "none",
      reason: "invalid-official-guild",
    };
  }

  return {
    enabled: true,
    guildId,
    channelId,
    guildIdSource: configuredGuildId ? "configured" : "official",
    reason: null,
  };
}
