import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Stop playback and leave the voice channel.")
    .setDescriptionLocalizations({ fr: "Arrêter la lecture et quitter le salon vocal." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    await services.player.disconnect(interaction.guild);
    await interaction.reply({ embeds: [successEmbed("Disconnected", "The queue was cleared.")] });
  },
});
