const DEFAULT_UPDATE_DEBOUNCE_MS = 1_000;
const COUNT_EVENTS = ["guildCreate", "guildDelete", "guildMemberAdd", "guildMemberRemove"];

export function createGuildMemberPresence({
  client,
  logger,
  debounceMs = DEFAULT_UPDATE_DEBOUNCE_MS,
} = {}) {
  if (!client) throw new Error("createGuildMemberPresence requires a Discord client.");
  if (!logger || typeof logger.warn !== "function") {
    throw new Error("createGuildMemberPresence requires a logger.");
  }
  if (!Number.isFinite(debounceMs) || debounceMs < 0) {
    throw new Error("Presence debounce must be a non-negative number.");
  }

  let started = false;
  let stopped = false;
  let updateTimer = null;

  async function refresh() {
    try {
      const guilds = client.guilds?.cache;
      const guildCount = guilds?.size ?? 0;
      const memberCount = [...(guilds?.values?.() ?? [])].reduce(
        (total, guild) => total + (guild.memberCount ?? 0),
        0,
      );
      const setPresence = client.user?.setPresence;

      if (typeof setPresence !== "function") {
        throw new Error("Discord client user is not available for presence updates.");
      }

      await setPresence.call(client.user, {
        status: "online",
        activities: [{ name: `${guildCount} Guild - ${memberCount} Member`, type: 3 }],
      });
    } catch (error) {
      logger.warn("could not update guild/member presence", { err: error });
    }
  }

  function scheduleRefresh() {
    if (!started || stopped) return;

    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      updateTimer = null;
      void refresh();
    }, debounceMs);
  }

  async function start() {
    if (stopped) throw new Error("Cannot start a stopped guild/member presence manager.");
    if (started) return;

    started = true;
    for (const event of COUNT_EVENTS) client.on(event, scheduleRefresh);
    await refresh();
  }

  function stop() {
    if (stopped) return;

    stopped = true;
    clearTimeout(updateTimer);
    updateTimer = null;
    for (const event of COUNT_EVENTS) client.off(event, scheduleRefresh);
  }

  return { start, stop, refresh };
}
