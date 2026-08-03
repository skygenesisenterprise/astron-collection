import { env } from "../config/env.js";
import { awardMessageXp } from "../utils/xp.js";

export const name = "messageCreate";

export async function execute(message) {
  if (!message.guild || message.author.bot || message.system) {
    return;
  }

  const result = awardMessageXp(message.guild.id, message.author.id);

  if (!result?.leveledUp) {
    return;
  }

  if (!env.levelChannelId) {
    return;
  }

  const levelChannel = await message.client.channels.fetch(env.levelChannelId).catch(() => null);

  if (!levelChannel?.isTextBased()) {
    return;
  }

  await levelChannel.send({
    content: `${message.author} passe niveau **${result.level}** avec **${result.totalXp} XP**.`,
    allowedMentions: { repliedUser: false },
  }).catch(() => null);
}
