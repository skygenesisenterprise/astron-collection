import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the loop mode.")
    .setDescriptionLocalizations({ fr: "Définir le mode de répétition." })
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
        ),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const mode = services.player.setLoop(interaction.guild, interaction.options.getString("mode", true));
    await interaction.reply({ embeds: [successEmbed("Loop", `Mode: **${mode}**.`)] });
  },
});
