/**
 * In-memory cooldown store.
 *
 * Deliberately trivial and injectable: one bot process owns its cooldowns, and
 * the clock is a parameter so the behaviour is testable without waiting.
 */

export function createCooldownStore({ clock = () => Date.now() } = {}) {
  /** @type {Map<string, number>} key -> expiry timestamp */
  const expiries = new Map();

  function keyFor(command, interaction) {
    const scope =
      command?.cooldown?.scope === "guild"
        ? `guild:${interaction?.guildId ?? "dm"}`
        : `user:${interaction?.user?.id ?? "unknown"}`;
    return `${command?.id ?? command?.name ?? "command"}:${scope}`;
  }

  /**
   * @returns {{limited: boolean, retryAfterMs: number}}
   */
  function check(command, interaction) {
    const seconds = command?.cooldown?.seconds ?? 0;
    if (!seconds) return { limited: false, retryAfterMs: 0 };

    const now = clock();
    const key = keyFor(command, interaction);
    const expiry = expiries.get(key);

    if (expiry !== undefined && expiry > now) {
      return { limited: true, retryAfterMs: expiry - now };
    }

    expiries.set(key, now + seconds * 1000);
    return { limited: false, retryAfterMs: 0 };
  }

  return {
    check,
    clear: () => expiries.clear(),
    get size() {
      return expiries.size;
    },
  };
}
