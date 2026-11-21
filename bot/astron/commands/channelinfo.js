import { SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
  timestamp,
} from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Show information about a channel.")
    .setDescriptionLocalizations({ fr: "Afficher les informations d'un salon." })
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to inspect; defaults to the current one")
        .setDescriptionLocalizations({ fr: "Salon à inspecter ; par défaut, le salon courant" })
        .setRequired(false),
    ),
  category: "information",
  availability: { guildOnly: true },
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    await interaction.reply({
      embeds: [
        infoEmbed(channel.name ?? "Channel", null, {
          fields: [
            { name: "ID", value: channel.id, inline: true },
            { name: "Type", value: String(channel.type), inline: true },
            { name: "Category", value: channel.parent?.name ?? "—", inline: true },
            { name: "Created", value: timestamp(channel.createdAt, "D"), inline: true },
            { name: "NSFW", value: channel.nsfw ? "Yes" : "No", inline: true },
            { name: "Topic", value: channel.topic || "—", inline: false },
          ],
        }),
      ],
    });
  },
});
