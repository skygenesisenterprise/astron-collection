export const name = "guildDelete";

export async function execute(guild, { services, logger }) {
  services.guildEvents.record({
    guildId: guild.id,
    event: "leave",
    guildName: guild.name ?? null,
    memberCount: guild.memberCount ?? null,
  });
  services.metrics.inc("guild_leaves_total");
  services.metrics.gauge("guilds", guild.client.guilds.cache.size);

  logger.info("guild left", { guildId: guild.id, name: guild.name });
}
