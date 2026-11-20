export const name = "guildCreate";

export async function execute(guild, { services, logger }) {
  services.guildEvents.record({
    guildId: guild.id,
    event: "join",
    guildName: guild.name,
    memberCount: guild.memberCount,
  });
  services.metrics.inc("guild_joins_total");
  services.metrics.gauge("guilds", guild.client.guilds.cache.size);

  logger.info("guild joined", { guildId: guild.id, name: guild.name, members: guild.memberCount });
}
