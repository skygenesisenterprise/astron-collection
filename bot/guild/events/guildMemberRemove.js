export const name = "guildMemberRemove";

export async function execute(member, { services, logger }) {
  try {
    await services.community.onMemberLeave(member);
  } catch (error) {
    logger.warn("farewell flow failed", { guildId: member.guild?.id, userId: member.id, err: error });
  }
}
