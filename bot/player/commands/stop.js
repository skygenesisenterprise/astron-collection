import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue.")
    .setDescriptionLocalizations({ fr: "Arrêter la lecture et vider la file." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    services.player.stop(interaction.guild);
    await interaction.reply({ embeds: [successEmbed("Stopped", "The queue has been cleared.")] });
  },
});
