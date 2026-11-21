import { EVENT_TYPES } from "@astron-collection/discord-framework";

export const name = "messageCreate";

export async function execute(message, { services, logger }) {
  if (!message.inGuild() || message.author.bot) return;
  if (!message.member) return;

  try {
    const award = services.leveling.award({ guildId: message.guildId, userId: message.author.id });
    if (!award?.leveledUp) return;

    for (const roleId of award.rewardRoleIds) {
      if (!message.guild.roles.cache.has(roleId)) continue;
      await message.member.roles.add(roleId, `Level ${award.level}`).catch((error) => {
        logger.warn("level reward failed", { roleId, userId: message.author.id, err: error });
      });
    }

    const config = services.leveling.configFor(message.guildId);
    const channel = config.announceChannelId
      ? message.guild.channels.cache.get(config.announceChannelId)
      : message.channel;

    if (channel?.send) {
      await channel
        .send({
          content: `🎉 <@${message.author.id}> passe au niveau **${award.level}** !`,
          allowedMentions: { users: [message.author.id] },
        })
        .catch((error) => logger.debug("level announcement failed", { err: error }));
    }

    services.outbox.enqueue(EVENT_TYPES.LEVEL_UP, {
      guildId: message.guildId,
      data: { userId: message.author.id, level: award.level, totalXp: award.totalXp },
    });
  } catch (error) {
    logger.warn("xp award failed", { guildId: message.guildId, userId: message.author.id, err: error });
  }
}
