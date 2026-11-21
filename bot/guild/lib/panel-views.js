import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { encodeCustomId } from "@astron-collection/discord-framework";
import { COLORS } from "@astron-collection/discord-framework/ui";

export function panelEmbed(panel) {
  return {
    color: COLORS.brand,
    title: panel.title,
    description: "Choose a role from the menu below. Selecting it again removes it.",
    fields: panel.options.length
      ? panel.options.map((option) => ({
          name: option.emoji ? `${option.emoji} ${option.label}` : option.label,
          value: `<@&${option.roleId}>`,
          inline: true,
        }))
      : [{ name: "Options", value: "No option configured yet." }],
    footer: { text: `Panel ${panel.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  };
}

export function panelComponents(panel) {
  if (panel.options.length === 0) return [];

  return [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(encodeCustomId({ namespace: "reactionrole", action: "toggle", value: panel.id }))
        .setPlaceholder("Choose your roles")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          panel.options.slice(0, 25).map((option) => ({
            label: option.label.slice(0, 100),
            value: option.roleId,
            emoji: option.emoji || undefined,
          })),
        ),
    ),
  ];
}

export async function updatePanelMessage(client, panel) {
  if (!panel.message_id) return;
  const channel = client.channels?.cache?.get(panel.channel_id);
  if (!channel?.messages?.fetch) return;
  const message = await channel.messages.fetch(panel.message_id).catch(() => null);
  if (!message) return;
  await message.edit({ embeds: [panelEmbed(panel)], components: panelComponents(panel) });
}
