import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { trackLabel } from "../lib/views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next track.")
    .setDescriptionLocalizations({ fr: "Passer au morceau suivant." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply();
    await services.player.skip(interaction.guild);
    const state = services.player.nowPlaying(interaction.guildId);
    await interaction.editReply({
      embeds: [
        successEmbed(
          state.current ? "Skipped" : "Queue finished",
          state.current ? trackLabel(state.current) : "Nothing left to play.",
        ),
      ],
    });
  },
});
