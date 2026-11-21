import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the playback volume (0-150).")
    .setDescriptionLocalizations({ fr: "Régler le volume (0-150)." })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option.setName("level").setDescription("Volume").setRequired(true).setMinValue(0).setMaxValue(150),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const level = interaction.options.getInteger("level", true);
    const applied = services.player.setVolume(interaction.guild, level);
    await interaction.reply({ embeds: [successEmbed("Volume", `Set to ${applied}%.`)] });
  },
});
