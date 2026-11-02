/**
 * Voice adapter.
 *
 * `@discordjs/voice` is loaded lazily and behind this interface, so the presence
 * manager is testable without a real gateway connection and no bot has to reach
 * into the voice library directly.
 *
 * The adapter never owns policy: it joins, reports and destroys.
 */

/**
 * @param {object} [options]
 * @param {() => Promise<object>} [options.loadVoice] Injectable module loader.
 */
export async function createVoiceAdapter({ loadVoice = () => import("@discordjs/voice") } = {}) {
  const voice = await loadVoice();

  const { VoiceConnectionStatus } = voice;

  return {
    STATUS: VoiceConnectionStatus,

    /**
     * Join a voice channel. The channel object comes from discord.js and
     * carries the guild's adapter creator, which keeps this package free of a
     * direct discord.js dependency.
     */
    join(channel, { selfDeaf = true, selfMute = true, group = "astron-presence" } = {}) {
      return voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf,
        selfMute,
        group,
      });
    },

    getConnection(guildId) {
      return voice.getVoiceConnection?.(guildId) ?? null;
    },

    destroy(connection) {
      connection?.destroy?.();
    },

    isReady(connection) {
      return connection?.state?.status === VoiceConnectionStatus.Ready;
    },

    statusOf(connection) {
      return connection?.state?.status ?? "unknown";
    },
  };
}
