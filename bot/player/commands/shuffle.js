import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue.")
    .setDescriptionLocalizations({ fr: "Mélanger la file de lecture." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const tracks = services.player.shuffle(interaction.guild);
    await interaction.reply({ embeds: [successEmbed("Queue shuffled", `${tracks.length} track(s).`)] });
  },
});
