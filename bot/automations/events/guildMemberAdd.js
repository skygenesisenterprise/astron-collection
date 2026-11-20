export const name = "guildMemberAdd";

export async function execute(member, { services, logger }) {
  try {
    await services.handleMemberJoin(member);
  } catch (error) {
    logger.warn("member workflow dispatch failed", { guildId: member.guild?.id, err: error });
  }
}
