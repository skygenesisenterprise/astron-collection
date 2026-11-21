import { SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
  formatNumber,
  timestamp,
} from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show information about this server.")
    .setDescriptionLocalizations({ fr: "Afficher les informations de ce serveur." })
    .setDMPermission(false),
  category: "information",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const info = services.info.guildInfo(interaction.guild);

    await interaction.reply({
      embeds: [
        infoEmbed(info.name, null, {
          thumbnail: interaction.guild.iconURL({ size: 256 }),
          fields: [
            { name: "ID", value: info.id, inline: true },
            { name: "Owner", value: info.owner, inline: true },
            { name: "Created", value: timestamp(info.createdAt, "D"), inline: true },
            { name: "Members", value: formatNumber(info.members), inline: true },
            { name: "Channels", value: `${info.channels} (${info.textual} text, ${info.voice} voice)`, inline: true },
            { name: "Roles", value: formatNumber(info.roles), inline: true },
            { name: "Emojis", value: formatNumber(info.emojis), inline: true },
            { name: "Boosts", value: `${info.boosts} (tier ${info.tier})`, inline: true },
            { name: "Verification", value: String(info.verification), inline: true },
            { name: "Locale", value: info.locale, inline: true },
          ],
          footer: `Requested by ${interaction.user.tag}`,
        }),
      ],
    });
  },
});
