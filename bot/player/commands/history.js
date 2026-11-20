import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { formatList, infoEmbed, timestamp } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Show recently played tracks.")
    .setDescriptionLocalizations({ fr: "Afficher les morceaux récemment joués." })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Number of tracks")
        .addChoices(
          { name: "10", value: 10 },
          { name: "25", value: 25 },
          { name: "50", value: 50 },
        ),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const rows = services.music.historyList(interaction.guildId, interaction.options.getInteger("limit") ?? 10);
    await interaction.reply({
      embeds: [
        infoEmbed(
          "Play history",
          formatList(
            rows.map((row) => `${timestamp(row.played_at, "R")} — **${row.title}** <@${row.requested_by}>`),
            { empty: "No track played yet." },
          ),
        ),
      ],
    });
  },
});
