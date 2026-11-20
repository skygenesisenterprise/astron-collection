export const name = "guildMemberAdd";

export async function execute(member, { services, logger }) {
  try {
    await services.security.onMemberJoin(member);
  } catch (error) {
    logger.error("anti-raid check failed", { guildId: member.guild?.id, userId: member.id, err: error });
  }
}
