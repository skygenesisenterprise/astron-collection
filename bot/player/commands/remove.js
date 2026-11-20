import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { trackLabel } from "../lib/views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a track from the queue by position.")
    .setDescriptionLocalizations({ fr: "Retirer un morceau de la file par position." })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option.setName("position").setDescription("1-based queue position").setRequired(true).setMinValue(1),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const track = services.player.remove(interaction.guild, interaction.options.getInteger("position", true));
    await interaction.reply({ embeds: [successEmbed("Removed", trackLabel(track))] });
  },
});
