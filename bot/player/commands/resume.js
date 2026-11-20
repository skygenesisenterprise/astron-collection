import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playback.")
    .setDescriptionLocalizations({ fr: "Reprendre la lecture." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    services.player.resume(interaction.guild);
    await interaction.reply({ embeds: [successEmbed("Resumed", null)] });
  },
});
