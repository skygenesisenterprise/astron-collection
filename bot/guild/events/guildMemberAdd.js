export const name = "guildMemberAdd";

export async function execute(member, { services, logger }) {
  try {
    if (member.partial) await member.fetch();
    await services.community.onMemberJoin(member);
  } catch (error) {
    logger.warn("welcome flow failed", { guildId: member.guild?.id, userId: member.id, err: error });
  }
}
