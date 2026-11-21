import { SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
  formatNumber,
} from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Show how many members this server has.")
    .setDescriptionLocalizations({ fr: "Afficher le nombre de membres du serveur." })
    .setDMPermission(false),
  category: "information",
  availability: { guildOnly: true },
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const cached = interaction.guild.members.cache;
    const bots = cached.filter((member) => member.user.bot).size;
    const total = interaction.guild.memberCount;
    const humans = Math.max(0, total - bots);

    await interaction.reply({
      embeds: [
        infoEmbed("Members", interaction.guild.name, {
          fields: [
            { name: "Total", value: formatNumber(total), inline: true },
            { name: "Humans", value: formatNumber(humans), inline: true },
            { name: "Bots", value: formatNumber(bots), inline: true },
          ],
          footer: "Online counts require the presence intent and are intentionally omitted.",
        }),
      ],
    });
  },
});
