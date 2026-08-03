import {
  buildMemberMessagePayload,
  renderMemberMessage,
  resolveGoodbyeSettings,
} from "../utils/member-messages.js";

export const name = "guildMemberRemove";

export async function execute(member) {
  const settings = resolveGoodbyeSettings(member.guild.id);

  if (!settings.enabled || (settings.ignoreBots && member.user.bot)) {
    return;
  }

  if (!settings.channelId) {
    console.warn("[GOODBYE] Aucun salon de depart n'est configure.");
    return;
  }

  const channel =
    member.guild.channels.cache.get(settings.channelId) ??
    (await member.guild.channels.fetch(settings.channelId).catch(() => null));

  if (!channel || !channel.isTextBased() || channel.isDMBased()) {
    console.warn(
      `[GOODBYE] Le salon de depart ${settings.channelId} n'est pas un salon textuel accessible.`
    );
    return;
  }

  const content = renderMemberMessage(settings.message, member);

  await channel
    .send(buildMemberMessagePayload(content, settings, `Depart de ${member.guild.name}`))
    .catch((error) => {
      console.error(`[GOODBYE] Echec de l'envoi du message pour ${member.user.tag}:`, error);
    });
}
