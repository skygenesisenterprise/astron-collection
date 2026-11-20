export const name = "messageCreate";

export async function execute(message, { services, logger }) {
  if (!message.guild || message.author?.bot) return;

  try {
    if (!message.member && typeof message.guild.members?.fetch === "function") {
      message.member = await message.guild.members.fetch(message.author.id).catch(() => null);
    }
    await services.security.onMessage(message);
  } catch (error) {
    logger.error("message protection failed", { guildId: message.guildId, err: error });
  }
}
