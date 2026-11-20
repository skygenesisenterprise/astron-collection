import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatNumber, infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the XP leaderboard.")
    .setDescriptionLocalizations({ fr: "Afficher le classement XP." })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Number of members")
        .addChoices(
          { name: "Top 10", value: 10 },
          { name: "Top 25", value: 25 },
        ),
    ),
  category: "community",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const limit = interaction.options.getInteger("limit") ?? 10;
    const rows = services.leveling.leaderboard(interaction.guildId, limit);

    await interaction.reply({
      embeds: [
        infoEmbed(
          "XP leaderboard",
          rows.length
            ? rows
                .map(
                  (row) =>
                    `**#${row.rank}** <@${row.userId}> — level **${row.level}** — ${formatNumber(row.totalXp)} XP`,
                )
                .join("\n")
            : "No XP recorded yet.",
          { footer: `Top ${limit}` },
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
