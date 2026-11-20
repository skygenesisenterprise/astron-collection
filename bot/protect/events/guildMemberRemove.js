export const name = "guildMemberRemove";

export async function execute(member, { services, logger }) {
  try {
    await services.security.onMemberRemove(member);
  } catch (error) {
    logger.debug("quarantine cleanup failed", { guildId: member.guild?.id, userId: member.id, err: error });
  }
}
