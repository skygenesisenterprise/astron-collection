import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

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
