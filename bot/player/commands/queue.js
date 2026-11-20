import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { queueEmbed } from "../lib/views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the playback queue.")
    .setDescriptionLocalizations({ fr: "Afficher la file de lecture." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    await interaction.reply({ embeds: [queueEmbed(services.player.playbackQueue(interaction.guildId))] });
  },
});
