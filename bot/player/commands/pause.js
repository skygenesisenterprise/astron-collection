import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause playback.")
    .setDescriptionLocalizations({ fr: "Mettre la lecture en pause." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    services.player.pause(interaction.guild);
    await interaction.reply({ embeds: [successEmbed("Paused", "Use `/resume` to continue.")] });
  },
});
