export const name = "messageCreate";

export async function execute(message, { services, logger }) {
  try {
    await services.handleMessage(message);
  } catch (error) {
    logger.warn("message workflow dispatch failed", { guildId: message.guildId, err: error });
  }
}
