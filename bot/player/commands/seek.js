import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek within the current track.")
    .setDescriptionLocalizations({ fr: "Se déplacer dans le morceau en cours." })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option.setName("seconds").setDescription("Position in seconds").setRequired(true).setMinValue(0),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply();
    const seconds = await services.player.seek(interaction.guild, interaction.options.getInteger("seconds", true));
    await interaction.editReply({ embeds: [successEmbed("Seek", `Moved to ${seconds}s.`)] });
  },
});
