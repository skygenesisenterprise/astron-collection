/**
 * Voice session coordination.
 *
 * The official presence is a *connection state*, not an audio player. A bot that
 * actually needs audio (Astron Player) takes a lease over the guild's connection:
 * the presence manager then adopts that connection instead of joining a second
 * one, and never destroys it while the lease is held.
 *
 * This is process-local on purpose: a VoiceConnection cannot be shared across
 * processes, and each bot runs in its own process.
 */

export function createVoiceSessionCoordinator({ clock = () => Date.now() } = {}) {
  /** @type {Map<string, {id: string, guildId: string, owner: string, acquiredAt: number}>} */
  const leases = new Map();
  let counter = 0;

  function acquire({ guildId, owner = "unknown" } = {}) {
    if (!guildId) throw new Error("A voice session lease requires a guild id.");
    const id = `voice-session-${(counter += 1)}`;
    const lease = { id, guildId, owner, acquiredAt: clock() };
    leases.set(id, lease);

    return {
      ...lease,
      release: () => leases.delete(id),
    };
  }

  return {
    acquire,
    release: (id) => leases.delete(id),
    hasLease: (guildId) => [...leases.values()].some((lease) => lease.guildId === guildId),
    forGuild: (guildId) => [...leases.values()].filter((lease) => lease.guildId === guildId),
    list: () => [...leases.values()],
    get size() {
      return leases.size;
    },
  };
}
